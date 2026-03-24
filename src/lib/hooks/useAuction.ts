'use client';

import { useState, useEffect, useCallback } from 'react';
import { onValue } from 'firebase/database';
import { auctionRef } from '../firebase/db';
import {
  placeBid as placeBidEngine,
  resolveCurrentPlayer,
  advanceToNextPlayer,
  pauseAuction,
  resumeAuction,
  endAuction,
} from '../engine/auction-engine';
import { canTeamBid } from '../engine/bid-calculator';
import { getNextBidAmount } from '../engine/bid-calculator';
import type { AuctionState } from '@/types/auction';
import type { TeamAuctionState } from '@/types/team';
import type { Player } from '@/types/player';
import playersData from '@/data/players.json';

const players = playersData as Player[];

function findPlayer(playerId: string): Player | undefined {
  return players.find((p) => p.id === playerId);
}

interface UseAuctionReturn {
  auctionState: AuctionState | null;
  currentPlayerData: Player | null;
  myTeamState: TeamAuctionState | null;
  canBid: boolean;
  bidReason: string;
  bid: () => Promise<void>;
  resolve: () => Promise<void>;
  advance: () => Promise<boolean>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  end: () => Promise<void>;
  loading: boolean;
}

export function useAuction(
  roomCode: string | null,
  myTeamId: string | null,
  timerDuration: number
): UseAuctionReturn {
  const [auctionState, setAuctionState] = useState<AuctionState | null>(null);
  const [loading, setLoading] = useState(true);

  // Subscribe to auction state from Firebase
  useEffect(() => {
    if (!roomCode) return;

    const unsubscribe = onValue(auctionRef(roomCode), (snapshot) => {
      const data = snapshot.val() as AuctionState | null;
      setAuctionState(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [roomCode]);

  // Derive current player data
  const currentPlayerData =
    auctionState?.currentPlayer
      ? findPlayer(auctionState.currentPlayer.playerId) ?? null
      : null;

  // Derive my team state
  const myTeamState =
    auctionState && myTeamId ? auctionState.teams[myTeamId] ?? null : null;

  // Calculate whether the team can bid
  let canBidValue = false;
  let bidReason = '';

  if (auctionState?.currentPlayer && myTeamState && currentPlayerData) {
    const current = auctionState.currentPlayer;

    if (current.status !== 'bidding') {
      bidReason = 'Bidding is not active';
    } else if (current.currentBidder === myTeamId) {
      bidReason = 'You are already the highest bidder';
    } else if (auctionState.timer.isPaused) {
      bidReason = 'Auction is paused';
    } else {
      const nextBid = getNextBidAmount(current.currentBid);
      const result = canTeamBid(myTeamState, nextBid, currentPlayerData.isOverseas);
      if (result.allowed) {
        canBidValue = true;
      } else {
        bidReason = result.reason ?? 'Cannot bid';
      }
    }
  } else if (!myTeamState) {
    bidReason = 'No team assigned';
  } else if (!auctionState?.currentPlayer) {
    bidReason = 'No player on the block';
  }

  const bid = useCallback(async () => {
    if (!roomCode || !myTeamId) return;
    await placeBidEngine(roomCode, myTeamId, timerDuration);
  }, [roomCode, myTeamId, timerDuration]);

  const resolve = useCallback(async () => {
    if (!roomCode) return;
    await resolveCurrentPlayer(roomCode);
  }, [roomCode]);

  const advance = useCallback(async (): Promise<boolean> => {
    if (!roomCode) return false;
    return advanceToNextPlayer(roomCode, timerDuration);
  }, [roomCode, timerDuration]);

  const pause = useCallback(async () => {
    if (!roomCode) return;
    await pauseAuction(roomCode);
  }, [roomCode]);

  const resume = useCallback(async () => {
    if (!roomCode) return;
    await resumeAuction(roomCode, timerDuration);
  }, [roomCode, timerDuration]);

  const end = useCallback(async () => {
    if (!roomCode) return;
    await endAuction(roomCode);
  }, [roomCode]);

  return {
    auctionState,
    currentPlayerData,
    myTeamState,
    canBid: canBidValue,
    bidReason,
    bid,
    resolve,
    advance,
    pause,
    resume,
    end,
    loading,
  };
}
