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

  async function action(endpoint: string) {
    try {
      setLoading(endpoint);
      const token = await getIdToken();
      if (!token) return;
      await fetch(`/api/rooms/${roomCode}/auction/${endpoint}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } finally {
      setLoading('');
    }
  }

  if (auctionStatus === 'completed') return null;

  return (
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

      <Button
        onClick={() => action('end')}
        loading={loading === 'end'}
        variant="danger"
        size="sm"
      >
        <Square className="w-4 h-4" /> End
      </Button>
    </div>
  );
}
