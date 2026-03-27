import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth-helpers';
import { adminDb } from '@/lib/firebase/admin';
import { chatPath, roomPath } from '@/lib/firebase/db-paths';
import type { ChatMessage } from '@/lib/types';

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
    const text = (body.text || '').trim();

    if (!text || text.length > 500) {
      return NextResponse.json({ error: 'Invalid message' }, { status: 400 });
    }

    const roomSnap = await adminDb.ref(roomPath(roomCode)).get();
    if (!roomSnap.exists()) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    const chatRef = adminDb.ref(chatPath(roomCode)).push();
    const message: ChatMessage = {
      id: chatRef.key!,
      userId: authUser.uid,
      displayName: authUser.name || authUser.email || 'Player',
      text,
      timestamp: Date.now(),
      type: 'message',
    };

    await chatRef.set(message);

    return NextResponse.json({ success: true, id: message.id });
  } catch (err) {
    console.error('[POST /api/rooms/[roomCode]/chat] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
