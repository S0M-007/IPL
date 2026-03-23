export interface Team {
  id: string;
  name: string;
  shortName: string;
  primaryColor: string;
  secondaryColor: string;
  homeGround: string;
}

export interface TeamAuctionState {
  teamId: string;
  purseRemaining: number;
  overseasCount: number;
  slotsUsed: number;
  retained: string[];
  bought: { playerId: string; soldPrice: number }[];
}
