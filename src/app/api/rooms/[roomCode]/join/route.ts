import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth-helpers';
import { adminDb } from '@/lib/firebase/admin';
import { roomPath, roomParticipantsPath, roomParticipantPath, publicRoomPath } from '@/lib/firebase/db-paths';
import type { Participant } from '@/lib/types';

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
    const body = await request.json();
    const teamId: string | null = body.teamId || null;

    const roomSnap = await adminDb.ref(roomPath(roomCode)).get();
    if (!roomSnap.exists()) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    const room = roomSnap.val();
    if (room.status !== 'lobby') {
      return NextResponse.json({ error: 'Room is not in lobby' }, { status: 400 });
    }

    const participantsSnap = await adminDb.ref(roomParticipantsPath(roomCode)).get();
    const participants = participantsSnap.val() || {};
    const count = Object.keys(participants).length;

    if (count >= room.maxPlayers) {
      return NextResponse.json({ error: 'Room is full' }, { status: 400 });
    }

    if (teamId) {
      const teamTaken = Object.values(participants).some(
        (p: unknown) => (p as Participant).teamId === teamId && (p as Participant).userId !== authUser.uid
      );
      if (teamTaken) {
        return NextResponse.json({ error: 'Team already taken' }, { status: 400 });
      }
    }

    const participant: Participant = {
      id: authUser.uid,
      userId: authUser.uid,
      displayName: authUser.name || authUser.email || 'Player',
      teamId,
      joinedAt: Date.now(),
    };

    await adminDb.ref(roomParticipantPath(roomCode, authUser.uid)).set(participant);

    if (room.visibility === 'public') {
      await adminDb.ref(publicRoomPath(roomCode) + '/playerCount').set(count + 1);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[POST /api/rooms/[roomCode]/join] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
