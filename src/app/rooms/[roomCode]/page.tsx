'use client';

import { use } from 'react';
import AuthGuard from '@/components/auth/AuthGuard';
import { Navbar } from '@/components/shared/Navbar';
import { useRoom } from '@/hooks/useRoom';
import { LobbyView } from '@/components/rooms/LobbyView';
import { AuctionView } from '@/components/auction/AuctionView';
import { Spinner } from '@/components/ui/Spinner';

export default function RoomPage({ params }: { params: Promise<{ roomCode: string }> }) {
  const { roomCode } = use(params);

  return (
    <AuthGuard>
      <RoomContent roomCode={roomCode} />
    </AuthGuard>
  );
}

function RoomContent({ roomCode }: { roomCode: string }) {
  const { room, participants, isHost, loading } = useRoom(roomCode);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-2">Room Not Found</h1>
            <p className="text-gray-400">This room may have been deleted or the code is invalid.</p>
          </div>
        </div>
      </div>
    );
  }

  if (room.status === 'lobby') {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <LobbyView room={room} participants={participants} isHost={isHost} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <AuctionView
          roomCode={roomCode}
          participants={participants}
          isHost={isHost}
          timerDuration={room.timerDuration}
        />
      </main>
    </div>
  );
}
