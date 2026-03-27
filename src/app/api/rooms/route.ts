import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth-helpers';
import { adminDb } from '@/lib/firebase/admin';
import { roomPath, roomParticipantPath, publicRoomPath } from '@/lib/firebase/db-paths';
import { generateRoomCode } from '@/lib/utils';
import type { Room, Participant, PublicRoom, AuctionMode, RoomVisibility } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const authUser = await verifyAuthToken(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const mode = (body.mode || 'classic') as AuctionMode;
    const timerDuration = body.timerDuration || 15;
    const visibility = (body.visibility || 'public') as RoomVisibility;
    const maxPlayers = Math.min(body.maxPlayers || 10, 10);

    const code = generateRoomCode();
    const now = Date.now();

    const room: Room = {
      code,
      hostId: authUser.uid,
      hostName: authUser.name || authUser.email || 'Host',
      mode,
      timerDuration,
      visibility,
      maxPlayers,
      status: 'lobby',
      createdAt: now,
    };

    const participant: Participant = {
      id: authUser.uid,
      userId: authUser.uid,
      displayName: authUser.name || authUser.email || 'Host',
      teamId: null,
      joinedAt: now,
    };

    console.log('[POST /api/rooms] Creating room:', code);
    await adminDb.ref(roomPath(code)).set(room);
    console.log('[POST /api/rooms] Room created, adding participant');
    await adminDb.ref(roomParticipantPath(code, authUser.uid)).set(participant);
    console.log('[POST /api/rooms] Participant added');

    if (visibility === 'public') {
      const publicRoom: PublicRoom = {
        code,
        hostName: room.hostName,
        mode,
        playerCount: 1,
        maxPlayers,
        status: 'lobby',
        createdAt: now,
      };
      await adminDb.ref(publicRoomPath(code)).set(publicRoom);
      console.log('[POST /api/rooms] Public listing created');
    }

    return NextResponse.json({ code });
  } catch (err) {
    console.error('[POST /api/rooms] Error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
