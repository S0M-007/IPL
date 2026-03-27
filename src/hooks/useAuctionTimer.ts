'use client';

import { useEffect, useState, useRef } from 'react';

export function useAuctionTimer(expiresAt: number | null) {
  const [remaining, setRemaining] = useState<number>(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!expiresAt) {
      setRemaining(0);
      return;
    }

    function tick() {
      const left = Math.max(0, expiresAt! - Date.now());
      setRemaining(left);
      if (left > 0) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    tick();
    return () => cancelAnimationFrame(rafRef.current);
  }, [expiresAt]);

  const seconds = Math.ceil(remaining / 1000);
  const isUrgent = seconds <= 3 && seconds > 0;
  const isExpired = expiresAt !== null && remaining === 0;

  return { remaining, seconds, isUrgent, isExpired };
}
