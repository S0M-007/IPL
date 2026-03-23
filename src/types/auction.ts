import type { TeamAuctionState } from './team';

export interface AuctionState {
  currentSetIndex: number;
  currentPlayerIndex: number;
  currentPlayer: CurrentPlayerState | null;
  timer: TimerState;
  completedPlayers: Record<string, CompletedPlayer>;
  teams: Record<string, TeamAuctionState>;
  totalPlayersInPool: number;
  playersAuctioned: number;
}

export interface CurrentPlayerState {
  playerId: string;
  currentBid: number;
  currentBidder: string | null;
  bidCount: number;
  status: 'bidding' | 'sold' | 'unsold';
}

export interface TimerState {
  expiresAt: number;
  duration: number;
  isPaused: boolean;
}

export interface CompletedPlayer {
  soldTo: string | null;
  soldPrice: number;
  bidCount: number;
}
