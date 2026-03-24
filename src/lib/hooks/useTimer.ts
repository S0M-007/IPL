'use client';

import { useState, useEffect, useRef } from 'react';

interface UseTimerReturn {
  secondsRemaining: number;
  percentage: number;
  isWarning: boolean;
}

/**
 * Countdown timer hook using requestAnimationFrame.
 * Updates roughly every 100ms for smooth UI rendering.
 *
 * @param expiresAt - Unix timestamp (ms) when the timer expires
 * @param isPaused - Whether the timer is paused
 * @param onExpired - Callback fired once when the timer reaches 0
 */
export function useTimer(
  expiresAt: number,
  isPaused: boolean,
  onExpired?: () => void
): UseTimerReturn {
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const expiredFiredRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const onExpiredRef = useRef(onExpired);
  const initialSecondsRef = useRef(0);
  onExpiredRef.current = onExpired;

  // When expiresAt changes, capture the initial duration for percentage calculation
  // and reset the expired flag
  useEffect(() => {
    expiredFiredRef.current = false;
    if (expiresAt > 0) {
      const initial = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
      initialSecondsRef.current = initial;
      setSecondsRemaining(initial);
    }
  }, [expiresAt]);

  useEffect(() => {
    if (isPaused || !expiresAt) {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    let lastUpdate = 0;

    const tick = (timestamp: number) => {
      // Throttle updates to roughly every 100ms
      if (timestamp - lastUpdate >= 100 || lastUpdate === 0) {
        lastUpdate = timestamp;
        const remaining = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
        setSecondsRemaining(remaining);

        if (remaining <= 0 && !expiredFiredRef.current) {
          expiredFiredRef.current = true;
          onExpiredRef.current?.();
        }
      }

      if (Math.ceil((expiresAt - Date.now()) / 1000) > 0) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [expiresAt, isPaused]);

  // Percentage of time remaining (100% = full, 0% = expired)
  const total = initialSecondsRef.current;
  const percentage = total > 0
    ? Math.min(100, Math.max(0, (secondsRemaining / total) * 100))
    : 0;

  return {
    secondsRemaining,
    percentage,
    isWarning: secondsRemaining > 0 && secondsRemaining < 3,
  };
}
