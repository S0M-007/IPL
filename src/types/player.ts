export type PlayerRole = 'BAT' | 'BOWL' | 'AR' | 'WK';

export interface Player {
  id: string;
  name: string;
  country: string;
  isOverseas: boolean;
  role: PlayerRole;
  basePrice: number; // In lakhs
  specialization?: string;
}

export interface RetainedPlayer {
  playerId: string;
  teamId: string;
  retentionPrice: number; // In lakhs
  retentionSlot: number;
}
