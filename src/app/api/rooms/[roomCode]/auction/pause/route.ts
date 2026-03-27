import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth-helpers';
import { adminDb } from '@/lib/firebase/admin';
import { roomPath, auctionPath } from '@/lib/firebase/db-paths';

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
    const auction = auctionSnap.val();
    if (!auction || auction.status !== 'active') {
      return NextResponse.json({ error: 'Auction not active' }, { status: 400 });
    }

    const remaining = auction.timerExpiresAt
      ? Math.max(0, auction.timerExpiresAt - Date.now())
      : null;

    await adminDb.ref(auctionPath(roomCode)).update({
      status: 'paused',
      timerExpiresAt: null,
      timerRemaining: remaining,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[POST /api/rooms/[roomCode]/auction/pause] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
