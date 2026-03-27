'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { TeamSelector } from './TeamSelector';
import { ParticipantList } from './ParticipantList';
import { ChatPanel } from './ChatPanel';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { getIdToken } from '@/lib/firebase/auth-service';
import { Copy, LogOut, Play } from 'lucide-react';
import { useState } from 'react';
import type { Room, Participant } from '@/lib/types';

interface LobbyViewProps {
  room: Room;
  participants: Participant[];
  isHost: boolean;
}

export function LobbyView({ room, participants, isHost }: LobbyViewProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [starting, setStarting] = useState(false);

  const myParticipant = participants.find((p) => p.userId === user?.uid);
  const allHaveTeams = participants.length >= 2 && participants.every((p) => p.teamId);

  async function copyCode() {
    await navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function leaveRoom() {
    const token = await getIdToken();
    if (!token) return;
    await fetch(`/api/rooms/${room.code}/leave`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    router.push('/rooms');
  }

  async function startAuction() {
    try {
      setStarting(true);
      const token = await getIdToken();
      if (!token) return;
      await fetch(`/api/rooms/${room.code}/auction/start`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } finally {
      setStarting(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">Room Lobby</h1>
            <Badge variant="info" size="md">{room.mode}</Badge>
          </div>
          <button
            onClick={copyCode}
            className="flex items-center gap-2 mt-1 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <span className="font-mono tracking-widest text-indigo-400">{room.code}</span>
            <Copy className="w-3 h-3" />
            {copied && <span className="text-xs text-green-400">Copied!</span>}
          </button>
        </div>
        <div className="flex gap-2">
          {isHost && (
            <Button
              onClick={startAuction}
              loading={starting}
              disabled={!allHaveTeams}
              size="sm"
            >
              <Play className="w-4 h-4" /> Start Auction
            </Button>
          )}
          <Button onClick={leaveRoom} variant="ghost" size="sm">
            <LogOut className="w-4 h-4" /> Leave
          </Button>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">
          Select Your Team
        </h2>
        <TeamSelector
          roomCode={room.code}
          participants={participants}
          currentTeamId={myParticipant?.teamId ?? null}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card variant="elevated" className="p-4 lg:col-span-1">
          <h2 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">
            Players ({participants.length}/{room.maxPlayers})
          </h2>
          <ParticipantList participants={participants} hostId={room.hostId} />
        </Card>

        <Card variant="elevated" className="lg:col-span-2 flex flex-col h-80 lg:h-auto">
          <h2 className="text-sm font-medium text-gray-400 p-4 pb-0 uppercase tracking-wider">
            Chat
          </h2>
          <ChatPanel roomCode={room.code} />
        </Card>
      </div>

      {isHost && !allHaveTeams && (
        <p className="text-center text-sm text-gray-500 mt-4">
          All players must select a team before starting (minimum 2 players)
        </p>
      )}
    </div>
  );
}
