import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth-helpers';
import { adminDb } from '@/lib/firebase/admin';
import { roomPath, auctionPath } from '@/lib/firebase/db-paths';
import { getPlayerById } from '@/lib/data';
import type { AuctionState } from '@/lib/types';

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
    const playerOrder = auction.playerOrder || [];
    let nextIndex = auction.currentIndex + 1;

    while (nextIndex < playerOrder.length) {
      const pid = playerOrder[nextIndex];
      if (auction.players[pid]?.status === 'pending') break;
      nextIndex++;
    }

    if (nextIndex >= playerOrder.length) {
      await adminDb.ref(auctionPath(roomCode)).update({
        status: 'completed',
        currentPlayerId: null,
        currentBid: 0,
        currentBidderId: null,
        currentBidderTeam: null,
        timerExpiresAt: null,
      });
      await adminDb.ref(roomPath(roomCode) + '/status').set('completed');
      return NextResponse.json({ success: true, completed: true });
    }

    const nextPlayerId = playerOrder[nextIndex];
    const nextPlayer = getPlayerById(nextPlayerId);
    const now = Date.now();

    const updates: Record<string, unknown> = {
      currentIndex: nextIndex,
      currentPlayerId: nextPlayerId,
      currentBid: nextPlayer?.basePrice || 200,
      currentBidderId: null,
      currentBidderTeam: null,
      timerExpiresAt: now + room.timerDuration * 1000,
      [`players/${nextPlayerId}/status`]: 'bidding',
    };

    await adminDb.ref(auctionPath(roomCode)).update(updates);

    return NextResponse.json({ success: true, completed: false, nextPlayer: nextPlayerId });
  } catch (err) {
    console.error('[POST /api/rooms/[roomCode]/auction/advance] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
