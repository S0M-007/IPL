'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { onValue } from 'firebase/database';
import { publicRoomsRef } from '@/lib/firebase/db';
import { useAuth } from '@/lib/hooks/useAuth';
import { Users, Loader2, Radio, ArrowLeft } from 'lucide-react';
import clsx from 'clsx';

interface PublicRoom {
  code: string;
  hostName: string;
  leagueName: string;
  mode: 'ipl2026' | 'mega' | 'legends';
  playerCount: number;
  maxPlayers: number;
  createdAt: number;
  status?: 'lobby' | 'auction' | 'completed';
}

const modeConfig: Record<string, { label: string; color: string; bg: string }> = {
  ipl2026: { label: 'IPL 2026', color: 'text-orange-400', bg: 'bg-orange-500/15' },
  mega: { label: 'Mega', color: 'text-cyan-400', bg: 'bg-cyan-500/15' },
  legends: { label: 'Legends', color: 'text-purple-400', bg: 'bg-purple-500/15' },
};

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  lobby: { label: 'Lobby', color: 'text-green-400', dot: 'bg-green-400' },
  auction: { label: 'Live', color: 'text-orange-400', dot: 'bg-orange-400' },
  completed: { label: 'Completed', color: 'text-gray-400', dot: 'bg-gray-400' },
};

export default function RoomsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [rooms, setRooms] = useState<PublicRoom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onValue(publicRoomsRef(), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const roomList = Object.values(data) as PublicRoom[];
        // Sort by most recent first
        roomList.sort((a, b) => b.createdAt - a.createdAt);
        setRooms(roomList);
      } else {
        setRooms([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading || authLoading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin" style={{ color: 'var(--accent-orange)' }} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <button
          onClick={() => router.push('/main')}
          className="p-2 rounded-xl transition-colors hover:bg-white/5"
          style={{ color: 'var(--text-muted)' }}
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-2">
          <Radio size={20} className="text-green-400 animate-pulse" />
          <h1 className="text-3xl font-bold">Live Auction Rooms</h1>
        </div>
      </div>
      <p className="text-sm mb-8 ml-12" style={{ color: 'var(--text-muted)' }}>
        Browse public rooms and jump into an ongoing auction.
      </p>

      {rooms.length === 0 ? (
        /* Empty state */
        <div
          className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center"
        >
          <div
            className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          >
            <Users size={28} style={{ color: 'var(--text-muted)' }} />
          </div>
          <p className="font-medium text-lg" style={{ color: 'var(--text-secondary)' }}>
            No live rooms yet
          </p>
          <p className="text-sm mt-1 mb-6" style={{ color: 'var(--text-muted)' }}>
            Create one and invite your friends!
          </p>
          <Link
            href="/main"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all hover:scale-105"
            style={{
              background: 'var(--accent-orange)',
              color: '#000',
            }}
          >
            Create a Room
          </Link>
        </div>
      ) : (
        /* Room grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room) => {
            const mode = modeConfig[room.mode] || modeConfig.ipl2026;
            const status = statusConfig[room.status || 'lobby'];

            return (
              <div
                key={room.code}
                className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-3 transition-all duration-200 hover:scale-105 hover:border-white/20 hover:bg-white/[0.07]"
              >
                {/* Top row: league name + status */}
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-base truncate" style={{ color: 'var(--text-primary)' }}>
                    {room.leagueName}
                  </h3>
                  <span className={clsx('flex items-center gap-1.5 text-xs font-medium shrink-0', status.color)}>
                    <span className={clsx('w-1.5 h-1.5 rounded-full', status.dot)} />
                    {status.label}
                  </span>
                </div>

                {/* Host */}
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Hosted by <span style={{ color: 'var(--text-secondary)' }}>{room.hostName}</span>
                </p>

                {/* Mode badge + player count */}
                <div className="flex items-center justify-between mt-auto">
                  <span className={clsx('text-xs font-semibold px-2.5 py-1 rounded-lg', mode.color, mode.bg)}>
                    {mode.label}
                  </span>
                  <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <Users size={13} />
                    {room.playerCount}/{room.maxPlayers} players
                  </span>
                </div>

                {/* Join button */}
                <button
                  onClick={() => router.push(`/rooms/${room.code}`)}
                  className="w-full mt-1 py-2 rounded-xl text-sm font-semibold transition-all hover:brightness-110"
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    color: 'var(--accent-cyan)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  Join Room
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
