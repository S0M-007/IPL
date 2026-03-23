export const BID_INCREMENT_TIERS = [
  { maxBid: 100, increment: 5 },   // Under 1 Cr: +5L
  { maxBid: 500, increment: 20 },  // 1-5 Cr: +20L
  { maxBid: Infinity, increment: 25 }, // Above 5 Cr: +25L
];

export const TIMER_OPTIONS = [5, 10, 15, 20, 25] as const;
export const MAX_SQUAD_SIZE = 25;
export const MIN_SQUAD_SIZE = 18;
export const MAX_OVERSEAS = 8;
export const DEFAULT_PURSE = 12000; // 120 Cr in lakhs
export const MEGA_PURSE = 12000;
export const IPL2026_BASE_PURSE = 12000;

export const ROLE_LABELS: Record<string, string> = {
  BAT: 'Batsman',
  BOWL: 'Bowler',
  AR: 'All-Rounder',
  WK: 'Wicket-Keeper',
};
