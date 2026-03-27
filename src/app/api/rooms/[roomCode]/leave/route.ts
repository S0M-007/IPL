import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth-helpers';
import { adminDb } from '@/lib/firebase/admin';
import {
  roomPath,
  roomParticipantsPath,
  roomParticipantPath,
  publicRoomPath,
  auctionPath,
  chatPath,
} from '@/lib/firebase/db-paths';

export async function POST(
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
    const isHost = room.hostId === authUser.uid;

    if (isHost) {
      await Promise.all([
        adminDb.ref(roomPath(roomCode)).remove(),
        adminDb.ref(publicRoomPath(roomCode)).remove(),
        adminDb.ref(auctionPath(roomCode)).remove(),
        adminDb.ref(chatPath(roomCode)).remove(),
      ]);
      return NextResponse.json({ success: true, deleted: true });
    }

    await adminDb.ref(roomParticipantPath(roomCode, authUser.uid)).remove();

    const participantsSnap = await adminDb.ref(roomParticipantsPath(roomCode)).get();
    const remaining = participantsSnap.val() || {};
    const count = Object.keys(remaining).length;

    if (room.visibility === 'public') {
      await adminDb.ref(publicRoomPath(roomCode) + '/playerCount').set(count);
    }

    return NextResponse.json({ success: true, deleted: false });
  } catch (err) {
    console.error('[POST /api/rooms/[roomCode]/leave] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
