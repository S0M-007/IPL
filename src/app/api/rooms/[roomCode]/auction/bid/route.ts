import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth-helpers';
import { adminDb } from '@/lib/firebase/admin';
import { roomPath, roomParticipantsPath, auctionPath } from '@/lib/firebase/db-paths';
import { getNextBid, canTeamBid } from '@/lib/auction-logic';
import { getPlayerById, getRetentions } from '@/lib/data';
import type { AuctionState, Participant } from '@/lib/types';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomCode: string }> }
) {
  try {
    const authUser = await verifyAuthToken(request);
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { roomCode } = await params;

    const [roomSnap, auctionSnap, participantsSnap] = await Promise.all([
      adminDb.ref(roomPath(roomCode)).get(),
      adminDb.ref(auctionPath(roomCode)).get(),
      adminDb.ref(roomParticipantsPath(roomCode)).get(),
    ]);

    if (!roomSnap.exists() || !auctionSnap.exists()) {
      return NextResponse.json({ error: 'Room or auction not found' }, { status: 404 });
    }

    const room = roomSnap.val();
    const auction = auctionSnap.val() as AuctionState;
    const participantsMap = (participantsSnap.val() || {}) as Record<string, Participant>;

    if (auction.status !== 'active') {
      return NextResponse.json({ error: 'Auction not active' }, { status: 400 });
    }

    const participant = participantsMap[authUser.uid];
    if (!participant?.teamId) {
      return NextResponse.json({ error: 'No team assigned' }, { status: 400 });
    }

    const teamId = participant.teamId;
    const currentPlayerId = auction.currentPlayerId;
    if (!currentPlayerId) {
      return NextResponse.json({ error: 'No player on block' }, { status: 400 });
    }

    if (auction.currentBidderTeam === teamId) {
      return NextResponse.json({ error: 'Already highest bidder' }, { status: 400 });
    }

    const player = getPlayerById(currentPlayerId);
    if (!player) return NextResponse.json({ error: 'Player not found' }, { status: 400 });

    const purse = auction.purses[teamId];
    if (!purse) return NextResponse.json({ error: 'Team not in auction' }, { status: 400 });

    const nextBid = auction.currentBidderId ? getNextBid(auction.currentBid) : auction.currentBid;

    const retentions = getRetentions();
    const retainedOverseas = retentions[teamId]
      ? retentions[teamId].retained.filter((r) => {
          const pl = getPlayerById(r.playerId);
          return pl?.isOverseas;
        }).length
      : 0;

    const eligibility = canTeamBid(purse, nextBid, player, retainedOverseas);
    if (!eligibility.canBid) {
      return NextResponse.json({ error: eligibility.reason }, { status: 400 });
    }

    const updates: Record<string, unknown> = {
      currentBid: nextBid,
      currentBidderId: authUser.uid,
      currentBidderTeam: teamId,
      timerExpiresAt: Date.now() + room.timerDuration * 1000,
    };

    await adminDb.ref(auctionPath(roomCode)).update(updates);

    return NextResponse.json({ success: true, bid: nextBid });
  } catch (err) {
    console.error('[POST /api/rooms/[roomCode]/auction/bid] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
