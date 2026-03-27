import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth-helpers';
import { adminDb } from '@/lib/firebase/admin';
import { roomPath, roomParticipantsPath, auctionPath } from '@/lib/firebase/db-paths';
import { buildFlatPlayerOrder, initTeamPurse } from '@/lib/auction-logic';
import { getAuctionPlayers, getRetentions, getPlayerById } from '@/lib/data';
import { SET_NAMES } from '@/lib/constants';
import type { AuctionState, AuctionPlayer, Participant } from '@/lib/types';

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
    if (room.hostId !== authUser.uid) return NextResponse.json({ error: 'Only host can start' }, { status: 403 });
    if (room.status !== 'lobby') return NextResponse.json({ error: 'Not in lobby' }, { status: 400 });

    const participantsSnap = await adminDb.ref(roomParticipantsPath(roomCode)).get();
    const participantsMap = (participantsSnap.val() || {}) as Record<string, Participant>;
    const participantList = Object.values(participantsMap);

    if (participantList.length < 2) return NextResponse.json({ error: 'Need at least 2 players' }, { status: 400 });
    if (!participantList.every((p) => p.teamId)) return NextResponse.json({ error: 'All must pick a team' }, { status: 400 });

    const auctionPlayers = getAuctionPlayers();
    const playerOrder = buildFlatPlayerOrder(auctionPlayers);
    const retentions = getRetentions();

    const players: Record<string, AuctionPlayer> = {};
    playerOrder.forEach((id, i) => {
      players[id] = { playerId: id, set: 0, order: i, status: 'pending' };
    });

    const purses: Record<string, AuctionState['purses'][string]> = {};
    for (const p of participantList) {
      const teamId = p.teamId!;
      const retention = retentions[teamId];
      const retainedOverseas = retention
        ? retention.retained.filter((r) => {
            const pl = getPlayerById(r.playerId);
            return pl?.isOverseas;
          }).length
        : 0;
      purses[teamId] = initTeamPurse(
        teamId,
        retention?.purseUsed || 0,
        retention?.retained.length || 0,
        retainedOverseas
      );
    }

    const firstPlayerId = playerOrder[0] || null;
    const firstPlayer = firstPlayerId ? getPlayerById(firstPlayerId) : null;
    if (firstPlayerId && players[firstPlayerId]) {
      players[firstPlayerId].status = 'bidding';
    }

    const now = Date.now();
    const auction: AuctionState = {
      status: 'active',
      currentSet: 0,
      currentIndex: 0,
      currentPlayerId: firstPlayerId,
      currentBid: firstPlayer?.basePrice || 200,
      currentBidderId: null,
      currentBidderTeam: null,
      timerExpiresAt: now + room.timerDuration * 1000,
      timerRemaining: null,
      players,
      playerOrder,
      purses,
      soldPlayers: [],
      unsoldPlayers: [],
      setNames: SET_NAMES,
    };

    await adminDb.ref(auctionPath(roomCode)).set(auction);
    await adminDb.ref(roomPath(roomCode) + '/status').set('auction');

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[POST /api/rooms/[roomCode]/auction/start] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
