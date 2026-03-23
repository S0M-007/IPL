import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { TeamLogo } from '@/components/shared/TeamLogo';
import teamsData from '@/data/teams.json';

export default function TeamsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">IPL Teams</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {teamsData.map((team) => (
          <Link key={team.id} href={`/teams/${team.id}`}>
            <Card className="hover:border-gray-600 transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <TeamLogo shortName={team.shortName} primaryColor={team.primaryColor} size="lg" />
                <div>
                  <p className="font-semibold">{team.name}</p>
                  <p className="text-sm text-gray-400">{team.homeGround}</p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
