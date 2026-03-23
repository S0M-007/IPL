import { BID_INCREMENT_TIERS, MAX_SQUAD_SIZE, MIN_SQUAD_SIZE, MAX_OVERSEAS } from '../utils/constants';
import type { TeamAuctionState } from '@/types';

export function getNextBidAmount(currentBid: number): number {
  for (const tier of BID_INCREMENT_TIERS) {
    if (currentBid < tier.maxBid) {
      return currentBid + tier.increment;
    }
  }
  return currentBid + 25;
}

export function canTeamBid(
  team: TeamAuctionState,
  bidAmount: number,
  isPlayerOverseas: boolean
): { allowed: boolean; reason?: string } {
  if (team.slotsUsed >= MAX_SQUAD_SIZE) {
    return { allowed: false, reason: 'Squad full (25 players)' };
  }
  if (isPlayerOverseas && team.overseasCount >= MAX_OVERSEAS) {
    return { allowed: false, reason: 'Overseas limit reached (8)' };
  }
  const remainingSlots = MIN_SQUAD_SIZE - team.slotsUsed - 1;
  const minimumReserve = Math.max(0, remainingSlots) * 20;
  if (team.purseRemaining - bidAmount < minimumReserve) {
    return { allowed: false, reason: 'Insufficient purse for remaining slots' };
  }
  return { allowed: true };
}
