import { ref, onValue, type Unsubscribe } from 'firebase/database';
import { db } from './client';
import { auctionPath } from './db-paths';
import type { AuctionState } from '../types';

export function subscribeToAuction(
  roomCode: string,
  callback: (auction: AuctionState | null) => void
): Unsubscribe {
  return onValue(
    ref(db, auctionPath(roomCode)),
    (snap) => {
      callback(snap.exists() ? (snap.val() as AuctionState) : null);
    },
    (error) => {
      console.error('[subscribeToAuction] Error:', error.message);
      callback(null);
    }
  );
}
