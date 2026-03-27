'use client';

import { useEffect, useState } from 'react';
import { subscribeToAuction } from '@/lib/firebase/auction-listeners';
import type { AuctionState } from '@/lib/types';

export function useAuction(roomCode: string) {
  const [auction, setAuction] = useState<AuctionState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToAuction(roomCode, (a) => {
      setAuction(a);
      setLoading(false);
    });
    return unsub;
  }, [roomCode]);

  return { auction, loading };
}
