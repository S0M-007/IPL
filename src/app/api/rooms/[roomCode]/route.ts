import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth-helpers';
import { adminDb } from '@/lib/firebase/admin';
import { roomPath, publicRoomPath, auctionPath, chatPath } from '@/lib/firebase/db-paths';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ roomCode: string }> }
) {
  try {
    const authUser = await verifyAuthToken(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { roomCode } = await params;
    const roomSnap = await adminDb.ref(roomPath(roomCode)).get();
    if (!roomSnap.exists()) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    const room = roomSnap.val();
    if (room.hostId !== authUser.uid) {
      return NextResponse.json({ error: 'Only the host can delete the room' }, { status: 403 });
    }

    await Promise.all([
      adminDb.ref(roomPath(roomCode)).remove(),
      adminDb.ref(publicRoomPath(roomCode)).remove(),
      adminDb.ref(auctionPath(roomCode)).remove(),
      adminDb.ref(chatPath(roomCode)).remove(),
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[DELETE /api/rooms/[roomCode]] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
