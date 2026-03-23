import teamsData from '@/data/teams.json';

export const TEAM_COLORS: Record<string, { primary: string; secondary: string }> = {};

for (const team of teamsData) {
  TEAM_COLORS[team.id] = {
    primary: team.primaryColor,
    secondary: team.secondaryColor,
  };
}
