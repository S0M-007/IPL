'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePublicRooms } from '@/hooks/usePublicRooms';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { getIdToken } from '@/lib/firebase/auth-service';
import { Users, ArrowRight } from 'lucide-react';
import { timeAgo } from '@/lib/utils';

export function RoomBrowser() {
  const { rooms, loading } = usePublicRooms();
  const router = useRouter();
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState<string | null>(null);

  async function joinRoom(code: string) {
    try {
      setJoining(code);
      const token = await getIdToken();
      if (!token) return;

      const res = await fetch(`/api/rooms/${code}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({}),
      });

      if (res.ok) {
        router.push(`/rooms/${code}`);
      }
    } finally {
      setJoining(null);
    }
  }

  function handleCodeJoin() {
    const code = joinCode.trim().toUpperCase();
    if (code.length === 6) joinRoom(code);
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-2 mb-8">
        <input
          type="text"
          placeholder="Enter room code..."
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
          maxLength={6}
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent uppercase tracking-widest font-mono"
        />
        <Button onClick={handleCodeJoin} disabled={joinCode.length !== 6}>
          Join <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      {rooms.length === 0 ? (
        <Card variant="default" className="p-12 text-center">
          <p className="text-gray-500">No public rooms available</p>
          <p className="text-gray-600 text-sm mt-1">Create one to get started!</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room) => (
            <Card key={room.code} variant="elevated" className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-sm text-indigo-400 tracking-widest">
                  {room.code}
                </span>
                <Badge variant="info" size="sm">
                  {room.mode}
                </Badge>
              </div>
              <p className="text-sm text-gray-400 mb-1">Hosted by {room.hostName}</p>
              <div className="flex items-center gap-1 text-xs text-gray-500 mb-4">
                <Users className="w-3 h-3" />
                {room.playerCount}/{room.maxPlayers} players
                <span className="ml-auto">{timeAgo(room.createdAt)}</span>
              </div>
              <Button
                onClick={() => joinRoom(room.code)}
                loading={joining === room.code}
                size="sm"
                className="w-full"
              >
                Join Room
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
