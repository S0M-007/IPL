import Link from 'next/link';
import { getTeams } from '@/lib/data';
import { getRetentions } from '@/lib/data';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { Card } from '@/components/ui';
import { formatPrice } from '@/lib/utils';

export default function TeamsPage() {
  const teams = getTeams();
  const retentions = getRetentions();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 py-10 w-full">
        <h1 className="text-3xl font-bold text-white mb-2">IPL Teams</h1>
        <p className="text-gray-400 mb-8">All 10 teams with their retained squads and remaining purse</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {teams.map((team) => {
            const retention = retentions[team.id];
            return (
              <Link key={team.id} href={`/teams/${team.id}`}>
                <Card variant="elevated" className="p-5 hover:border-gray-700 transition-all group">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm mb-4"
                    style={{
                      backgroundColor: team.primaryColor,
                      color: team.id === 'csk' ? '#1a1a1a' : '#fff',
                    }}
                  >
                    {team.shortName}
                  </div>
                  <h3 className="font-semibold text-white group-hover:text-indigo-400 transition-colors">
                    {team.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">{team.homeGround}</p>
                  {retention && (
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Purse Left</span>
                        <span className="text-emerald-400 font-medium">
                          ₹{formatPrice(retention.purseRemaining)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full"
                          style={{
                            width: `${(retention.purseRemaining / 12000) * 100}%`,
                            backgroundColor: team.primaryColor,
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-500">
                        {retention.retained.length} retained
                      </p>
                    </div>
                  )}
                </Card>
              </Link>
            );
          })}
        </div>
      </main>
      <Footer />
    </div>
  );
}
