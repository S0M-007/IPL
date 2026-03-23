import Link from 'next/link';
import teamsData from '@/data/teams.json';

export default function TeamsPage() {
  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      {/* Header area with subtle gradient */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-cyan-500/5" />
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }} />
        <div className="relative mx-auto max-w-7xl px-4 pt-16 pb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-2">
            <span className="bg-gradient-to-r from-[#ff6b00] to-[#ff9500] bg-clip-text text-transparent">
              IPL Teams
            </span>
          </h1>
          <p className="text-center text-gray-400 text-lg">
            Choose your franchise and build the ultimate squad
          </p>
        </div>
      </div>

      {/* Teams grid */}
      <div className="mx-auto max-w-7xl px-4 pb-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {teamsData.map((team) => (
            <Link key={team.id} href={`/teams/${team.id}`} className="group">
              <div
                className="relative bg-gray-900/50 border border-white/10 rounded-2xl p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-white/20 overflow-hidden"
                style={{
                  boxShadow: 'none',
                }}
                onMouseEnter={undefined}
              >
                {/* Top color accent strip */}
                <div
                  className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl transition-all duration-300 group-hover:h-1.5"
                  style={{ backgroundColor: team.primaryColor }}
                />

                {/* Hover glow effect via CSS */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    boxShadow: `inset 0 0 30px ${team.primaryColor}15, 0 0 40px ${team.primaryColor}20`,
                  }}
                />

                <div className="relative flex flex-col items-center text-center gap-3">
                  {/* Team abbreviation circle */}
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold transition-transform duration-300 group-hover:scale-110"
                    style={{
                      backgroundColor: `${team.primaryColor}20`,
                      color: team.primaryColor,
                      border: `2px solid ${team.primaryColor}40`,
                    }}
                  >
                    {team.shortName}
                  </div>

                  {/* Team name */}
                  <h2 className="font-bold text-white text-sm leading-tight">
                    {team.name}
                  </h2>

                  {/* Home ground */}
                  <p className="text-xs text-gray-400 leading-snug">
                    {team.homeGround}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
