import type { Player } from '@/types/player';
import playersData from '@/data/players.json';

const players = playersData as Player[];

/**
 * Organizes available players into auction sets by role.
 *
 * Set 1: Marquee (basePrice >= 200, overseas first then Indian)
 * Set 2: Batsmen (role === 'BAT', remaining after marquee)
 * Set 3: Bowlers (role === 'BOWL')
 * Set 4: All-Rounders (role === 'AR')
 * Set 5: Wicket-Keepers (role === 'WK')
 */
export function buildPlayerSets(
  mode: 'ipl2026' | 'mega' | 'legends',
  excludePlayerIds: string[]
): string[][] {
  const excluded = new Set(excludePlayerIds);
  const available = players.filter((p) => !excluded.has(p.id));

  // Set 1: Marquee players (high base price)
  const marquee = available
    .filter((p) => p.basePrice >= 200)
    .sort((a, b) => {
      // Overseas first, then Indian; within each group sort by base price descending
      if (a.isOverseas !== b.isOverseas) return a.isOverseas ? -1 : 1;
      return b.basePrice - a.basePrice;
    })
    .map((p) => p.id);

  const marqueeSet = new Set(marquee);
  const remaining = available.filter((p) => !marqueeSet.has(p.id));

  // Sets 2-5 by role
  const batsmen = remaining.filter((p) => p.role === 'BAT').map((p) => p.id);
  const bowlers = remaining.filter((p) => p.role === 'BOWL').map((p) => p.id);
  const allRounders = remaining.filter((p) => p.role === 'AR').map((p) => p.id);
  const wicketKeepers = remaining.filter((p) => p.role === 'WK').map((p) => p.id);

  // Only include non-empty sets
  const sets: string[][] = [];
  if (marquee.length > 0) sets.push(marquee);
  if (batsmen.length > 0) sets.push(batsmen);
  if (bowlers.length > 0) sets.push(bowlers);
  if (allRounders.length > 0) sets.push(allRounders);
  if (wicketKeepers.length > 0) sets.push(wicketKeepers);

  return sets;
}
