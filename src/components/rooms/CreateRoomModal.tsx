'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { getIdToken } from '@/lib/firebase/auth-service';
import { MODE_CONFIG } from '@/lib/constants';
import type { AuctionMode, RoomVisibility } from '@/lib/types';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateRoomModal({ isOpen, onClose }: CreateRoomModalProps) {
  const router = useRouter();
  const [mode, setMode] = useState<AuctionMode>('classic');
  const [visibility, setVisibility] = useState<RoomVisibility>('public');
  const [maxPlayers, setMaxPlayers] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleCreate() {
    try {
      setLoading(true);
      setError('');
      const token = await getIdToken();
      if (!token) throw new Error('Not authenticated');

      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          mode,
          timerDuration: MODE_CONFIG[mode].timer,
          visibility,
          maxPlayers,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create room');
      }

      const { code } = await res.json();
      router.push(`/rooms/${code}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to create room');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Room">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Auction Mode</label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.entries(MODE_CONFIG) as [AuctionMode, typeof MODE_CONFIG[string]][]).map(
              ([key, config]) => (
                <button
                  key={key}
                  onClick={() => setMode(key)}
                  className={`p-3 rounded-lg text-sm font-medium transition-colors border ${
                    mode === key
                      ? 'border-indigo-500 bg-indigo-500/10 text-white'
                      : 'border-gray-700 bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  {config.label.split(' ')[0]}
                </button>
              )
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Visibility</label>
          <div className="grid grid-cols-2 gap-2">
            {(['public', 'private'] as RoomVisibility[]).map((v) => (
              <button
                key={v}
                onClick={() => setVisibility(v)}
                className={`p-3 rounded-lg text-sm font-medium transition-colors border capitalize ${
                  visibility === v
                    ? 'border-indigo-500 bg-indigo-500/10 text-white'
                    : 'border-gray-700 bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Max Players: {maxPlayers}
          </label>
          <input
            type="range"
            min={2}
            max={10}
            value={maxPlayers}
            onChange={(e) => setMaxPlayers(Number(e.target.value))}
            className="w-full"
          />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <Button onClick={handleCreate} loading={loading} className="w-full">
          Create Room
        </Button>
      </div>
    </Modal>
  );
}
