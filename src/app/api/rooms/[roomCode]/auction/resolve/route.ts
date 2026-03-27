import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth-helpers';
import { adminDb } from '@/lib/firebase/admin';
import { roomPath, auctionPath } from '@/lib/firebase/db-paths';
import { getPlayerById } from '@/lib/data';
import type { AuctionState, SoldPlayer } from '@/lib/types';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomCode: string }> }
) {
  try {
    const authUser = await verifyAuthToken(request);
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { roomCode } = await params;
    const roomSnap = await adminDb.ref(roomPath(roomCode)).get();
    if (!roomSnap.exists()) return NextResponse.json({ error: 'Room not found' }, { status: 404 });

    const room = roomSnap.val();
    if (room.hostId !== authUser.uid) return NextResponse.json({ error: 'Only host' }, { status: 403 });

    const auctionSnap = await adminDb.ref(auctionPath(roomCode)).get();
    if (!auctionSnap.exists()) return NextResponse.json({ error: 'Auction not found' }, { status: 404 });

    const auction = auctionSnap.val() as AuctionState;
    const playerId = auction.currentPlayerId;
    if (!playerId) return NextResponse.json({ error: 'No player to resolve' }, { status: 400 });

    const player = getPlayerById(playerId);
    const updates: Record<string, unknown> = {};

    if (auction.currentBidderId && auction.currentBidderTeam) {
      const teamId = auction.currentBidderTeam;
      const price = auction.currentBid;

      updates[`players/${playerId}/status`] = 'sold';
      updates[`players/${playerId}/soldTo`] = teamId;
      updates[`players/${playerId}/soldPrice`] = price;

      const purse = auction.purses[teamId];
      updates[`purses/${teamId}/remaining`] = purse.remaining - price;
      updates[`purses/${teamId}/spent`] = purse.spent + price;
      updates[`purses/${teamId}/playersBought`] = purse.playersBought + 1;
      if (player?.isOverseas) {
        updates[`purses/${teamId}/overseasCount`] = purse.overseasCount + 1;
      }

      const soldEntry: SoldPlayer = { playerId, teamId, price, set: auction.currentSet };
      const soldPlayers = [...(auction.soldPlayers || []), soldEntry];
      updates['soldPlayers'] = soldPlayers;
    } else {
      updates[`players/${playerId}/status`] = 'unsold';
      const unsoldPlayers = [...(auction.unsoldPlayers || []), playerId];
      updates['unsoldPlayers'] = unsoldPlayers;
    }

    updates['currentPlayerId'] = null;
    updates['currentBid'] = 0;
    updates['currentBidderId'] = null;
    updates['currentBidderTeam'] = null;
    updates['timerExpiresAt'] = null;

    await adminDb.ref(auctionPath(roomCode)).update(updates);

    return NextResponse.json({ success: true, sold: !!auction.currentBidderId });
  } catch (err) {
    console.error('[POST /api/rooms/[roomCode]/auction/resolve] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
