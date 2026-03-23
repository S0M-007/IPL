export type RoomStatus = 'lobby' | 'auction' | 'paused' | 'completed';
export type AuctionMode = 'ipl2026' | 'mega' | 'legends';

export interface Room {
  code: string;
  hostId: string;
  createdAt: number;
  status: RoomStatus;
  settings: RoomSettings;
  participants: Record<string, Participant>;
  spectators: Record<string, Spectator>;
}

export interface RoomSettings {
  auctionMode: AuctionMode;
  timerDuration: 5 | 10 | 15 | 20 | 25;
  visibility: 'public' | 'private';
  maxPlayers: number;
  allowMidJoin: boolean;
  allowSpectators: boolean;
}

export interface Participant {
  uid: string;
  displayName: string;
  teamId: string | null;
  isHost: boolean;
  isReady: boolean;
  joinedAt: number;
  isConnected: boolean;
}

export interface Spectator {
  uid: string;
  displayName: string;
  joinedAt: number;
}
