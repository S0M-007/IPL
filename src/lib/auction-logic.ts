import { MAX_SQUAD_SIZE, MAX_OVERSEAS } from './constants';
import type { Player, TeamPurse } from './types';

export function getNextBid(currentBid: number): number {
  return currentBid + getBidIncrement(currentBid);
}

export function getBidIncrement(currentBid: number): number {
  if (currentBid < 100) return 5;
  if (currentBid < 200) return 10;
  if (currentBid < 500) return 25;
  if (currentBid < 1000) return 25;
  return 50;
}

export function canTeamBid(
  purse: TeamPurse,
  nextBid: number,
  player: Player,
  retainedOverseas: number
): { canBid: boolean; reason?: string } {
  const totalOverseas = purse.overseasCount + retainedOverseas;

  if (purse.remaining < nextBid) {
    return { canBid: false, reason: 'Insufficient purse' };
  }

  if (purse.playersBought >= MAX_SQUAD_SIZE) {
    return { canBid: false, reason: 'Squad full' };
  }

  if (player.isOverseas && totalOverseas >= MAX_OVERSEAS) {
    return { canBid: false, reason: 'Overseas slots full' };
  }

  const slotsNeeded = MAX_SQUAD_SIZE - purse.playersBought - 1;
  const minReserve = slotsNeeded * 50;
  if (purse.remaining - nextBid < minReserve) {
    return { canBid: false, reason: 'Must reserve purse for remaining slots' };
  }

  return { canBid: true };
}

export function buildPlayerOrder(players: Player[]): { setIndex: number; players: Player[] }[] {
  const marquee = players.filter((p) => p.basePrice >= 200).slice(0, 10);
  const marqueeIds = new Set(marquee.map((p) => p.id));
  const remaining = players.filter((p) => !marqueeIds.has(p.id));

  const set2 = remaining.filter((p) => p.role === 'BAT' || p.role === 'BOWL');
  const set2Ids = new Set(set2.map((p) => p.id));
  const afterSet2 = remaining.filter((p) => !set2Ids.has(p.id));

  const set3 = afterSet2.filter((p) => p.role === 'AR' || p.role === 'WK');
  const set3Ids = new Set(set3.map((p) => p.id));
  const afterSet3 = afterSet2.filter((p) => !set3Ids.has(p.id));

  return [
    { setIndex: 0, players: marquee },
    { setIndex: 1, players: set2 },
    { setIndex: 2, players: set3 },
    { setIndex: 3, players: afterSet3 },
    { setIndex: 4, players: [] },
  ];
}

export function buildFlatPlayerOrder(players: Player[]): string[] {
  return buildPlayerOrder(players).flatMap((s) => s.players.map((p) => p.id));
}

export function initTeamPurse(
  teamId: string,
  retentionSpent: number,
  retainedCount: number,
  retainedOverseas: number
): TeamPurse {
  return {
    teamId,
    remaining: 12000 - retentionSpent,
    spent: retentionSpent,
    playersBought: retainedCount,
    overseasCount: retainedOverseas,
  };
}
