import teamsData from '@/data/teams.json';
import playersData from '@/data/players.json';
import retentionsData from '@/data/retentions.json';
import type { Team, Player, RetentionsData, TeamRetention } from './types';

const teams = teamsData as Team[];
const players = playersData as Player[];
const retentions = retentionsData as RetentionsData;

export function getTeams(): Team[] {
  return teams;
}

export function getTeamById(teamId: string): Team | undefined {
  return teams.find((t) => t.id === teamId);
}

export function getPlayers(): Player[] {
  return players;
}

export function getPlayerById(playerId: string): Player | undefined {
  return players.find((p) => p.id === playerId);
}

export function getRetentions(): RetentionsData {
  return retentions;
}

export function getTeamRetention(teamId: string): TeamRetention | undefined {
  return retentions[teamId];
}

export function getRetainedPlayerIds(): Set<string> {
  const ids = new Set<string>();
  for (const team of Object.values(retentions)) {
    for (const r of team.retained) {
      ids.add(r.playerId);
    }
  }
  return ids;
}

export function getAuctionPlayers(): Player[] {
  const retainedIds = getRetainedPlayerIds();
  return players.filter((p) => !retainedIds.has(p.id));
}
