'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { getIdToken } from '@/lib/firebase/auth-service';
import { Check, SkipForward, Pause, Play, Square } from 'lucide-react';

interface HostControlsProps {
  roomCode: string;
  auctionStatus: string;
  hasCurrentPlayer: boolean;
  hasBidder: boolean;
}

export function HostControls({ roomCode, auctionStatus, hasCurrentPlayer, hasBidder }: HostControlsProps) {
  const [loading, setLoading] = useState('');
  const [error, setError] = useState('');
  const [confirmEnd, setConfirmEnd] = useState(false);

  async function action(endpoint: string) {
    try {
      setLoading(endpoint);
      setError('');
      const token = await getIdToken();
      if (!token) return;
      const res = await fetch(`/api/rooms/${roomCode}/auction/${endpoint}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || `${endpoint} failed`);
      }
    } catch {
      setError('Network error. Try again.');
    } finally {
      setLoading('');
    }
  }

  if (auctionStatus === 'completed') return null;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {hasCurrentPlayer && (
          <Button
            onClick={() => action('resolve')}
            loading={loading === 'resolve'}
            variant="secondary"
            size="sm"
          >
            <Check className="w-4 h-4" />
            {hasBidder ? 'Sold!' : 'Unsold'}
          </Button>
        )}

        {!hasCurrentPlayer && (
          <Button
            onClick={() => action('advance')}
            loading={loading === 'advance'}
            variant="secondary"
            size="sm"
          >
            <SkipForward className="w-4 h-4" />
            Next Player
          </Button>
        )}

        {auctionStatus === 'active' && (
          <Button
            onClick={() => action('pause')}
            loading={loading === 'pause'}
            variant="ghost"
            size="sm"
          >
            <Pause className="w-4 h-4" /> Pause
          </Button>
        )}

        {auctionStatus === 'paused' && (
          <Button
            onClick={() => action('resume')}
            loading={loading === 'resume'}
            variant="ghost"
            size="sm"
          >
            <Play className="w-4 h-4" /> Resume
          </Button>
        )}

        {!confirmEnd ? (
          <Button
            onClick={() => setConfirmEnd(true)}
            variant="danger"
            size="sm"
          >
            <Square className="w-4 h-4" /> End
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              onClick={() => { action('end'); setConfirmEnd(false); }}
              loading={loading === 'end'}
              variant="danger"
              size="sm"
            >
              Confirm End
            </Button>
            <Button
              onClick={() => setConfirmEnd(false)}
              variant="ghost"
              size="sm"
            >
              Cancel
            </Button>
          </div>
        )}
      </div>

      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
}
