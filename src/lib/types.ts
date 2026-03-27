// ── Player & Team Data Types ──

export type PlayerRole = 'BAT' | 'BOWL' | 'AR' | 'WK';

export interface Player {
  id: string;
  name: string;
  country: string;
  isOverseas: boolean;
  role: PlayerRole;
  basePrice: number;
  specialization: string;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  primaryColor: string;
  secondaryColor: string;
  homeGround: string;
}

export interface Retention {
  playerId: string;
  price: number;
  slot: number;
}

export interface TeamRetention {
  purseUsed: number;
  purseRemaining: number;
  retained: Retention[];
}

export type RetentionsData = Record<string, TeamRetention>;

// ── Room & Lobby Types ──

export type AuctionMode = 'classic' | 'speed' | 'custom';
export type RoomStatus = 'lobby' | 'auction' | 'completed';
export type RoomVisibility = 'public' | 'private';

export interface Room {
  code: string;
  hostId: string;
  hostName: string;
  mode: AuctionMode;
  timerDuration: number;
  visibility: RoomVisibility;
  maxPlayers: number;
  status: RoomStatus;
  createdAt: number;
}

export interface Participant {
  id: string;
  userId: string;
  displayName: string;
  teamId: string | null;
  joinedAt: number;
}

// ── Auction Types ──

export type AuctionStatus = 'active' | 'paused' | 'completed';

export interface AuctionPlayer {
  playerId: string;
  set: number;
  order: number;
  status: 'pending' | 'bidding' | 'sold' | 'unsold';
  soldTo?: string;
  soldPrice?: number;
}

export interface TeamPurse {
  teamId: string;
  remaining: number;
  spent: number;
  playersBought: number;
  overseasCount: number;
}

export interface AuctionState {
  status: AuctionStatus;
  currentSet: number;
  currentIndex: number;
  currentPlayerId: string | null;
  currentBid: number;
  currentBidderId: string | null;
  currentBidderTeam: string | null;
  timerExpiresAt: number | null;
  timerRemaining: number | null;
  players: Record<string, AuctionPlayer>;
  playerOrder: string[];
  purses: Record<string, TeamPurse>;
  soldPlayers: SoldPlayer[];
  unsoldPlayers: string[];
  setNames: string[];
}

export interface SoldPlayer {
  playerId: string;
  teamId: string;
  price: number;
  set: number;
}

// ── Chat Types ──

export interface ChatMessage {
  id: string;
  userId: string;
  displayName: string;
  text: string;
  timestamp: number;
  type: 'message' | 'system';
}

// ── Public Room (for room browser) ──

export interface PublicRoom {
  code: string;
  hostName: string;
  mode: AuctionMode;
  playerCount: number;
  maxPlayers: number;
  status: RoomStatus;
  createdAt: number;
}
