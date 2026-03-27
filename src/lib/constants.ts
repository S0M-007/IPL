export const MAX_SQUAD_SIZE = 25;
export const MAX_OVERSEAS = 8;
export const TOTAL_PURSE = 12000; // in lakhs
export const ROOM_CODE_LENGTH = 6;
export const DEFAULT_TIMER = 15; // seconds
export const MAX_PLAYERS_PER_ROOM = 10;
export const MIN_PLAYERS_TO_START = 2;

export const BID_INCREMENTS: Record<string, number> = {
  '0-100': 5,
  '100-200': 10,
  '200-500': 25,
  '500-1000': 25,
  '1000-2000': 50,
  '2000+': 50,
};

export const SET_NAMES = [
  'Set 1 — Marquee Players',
  'Set 2 — Capped Players',
  'Set 3 — Capped All-Rounders & Wicketkeepers',
  'Set 4 — Uncapped Players',
  'Set 5 — Accelerated Set',
];

export const ROLE_LABELS: Record<string, string> = {
  BAT: 'Batsman',
  BOWL: 'Bowler',
  AR: 'All-Rounder',
  WK: 'Wicketkeeper',
};

export const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  BAT: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
  BOWL: { bg: 'bg-green-500/20', text: 'text-green-400' },
  AR: { bg: 'bg-purple-500/20', text: 'text-purple-400' },
  WK: { bg: 'bg-orange-500/20', text: 'text-orange-400' },
};

export const MODE_CONFIG: Record<string, { label: string; description: string; timer: number }> = {
  classic: {
    label: 'Classic Auction',
    description: 'Full IPL-style auction with 5 sets and standard bidding',
    timer: 15,
  },
  speed: {
    label: 'Speed Auction',
    description: 'Faster pace with shorter timers and accelerated sets',
    timer: 10,
  },
  custom: {
    label: 'Custom Auction',
    description: 'Set your own rules — timer, purse, and squad limits',
    timer: 15,
  },
};
