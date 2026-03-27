'use client';

import { useEffect, useState } from 'react';
import { subscribeToPublicRooms } from '@/lib/firebase/room-listeners';
import type { PublicRoom } from '@/lib/types';

export function usePublicRooms() {
  const [rooms, setRooms] = useState<PublicRoom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToPublicRooms((r) => {
      setRooms(r);
      setLoading(false);
    });
    return unsub;
  }, []);

  return { rooms, loading };
}
