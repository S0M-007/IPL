'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { TeamLogo } from '@/components/shared/TeamLogo';
import teamsData from '@/data/teams.json';
import { Suspense } from 'react';

const MODE_LABELS: Record<string, string> = {
  regular: 'Regular Auction',
  fantasy: 'Fantasy Mode',
  alltime: 'All-Time XI',
};

const MODE_COLORS: Record<string, string> = {
  regular: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
  fantasy: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40',
  alltime: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
};

function CreateLeagueForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const mode = searchParams.get('mode') || 'regular';

  const [leagueName, setLeagueName] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

  const canStart = leagueName.trim().length > 0 && selectedTeam !== null;

  function handleStart() {
    console.log('Creating league:', { leagueName, selectedTeam, mode });
    router.push('/rooms/DEMO');
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
          Create a League
        </h1>
        <span
          className={`inline-block rounded-full border px-4 py-1 text-sm font-medium ${MODE_COLORS[mode] || MODE_COLORS.regular}`}
        >
          {MODE_LABELS[mode] || MODE_LABELS.regular}
        </span>
      </div>

      {/* League Name */}
      <div className="mb-8">
        <label
          htmlFor="league-name"
          className="block text-sm font-medium text-gray-400 mb-2"
        >
          League Name
        </label>
        <input
          id="league-name"
          type="text"
          placeholder="Enter your league name"
          value={leagueName}
          onChange={(e) => setLeagueName(e.target.value)}
          maxLength={30}
          className="w-full rounded-xl border border-gray-700 bg-gray-800/60 px-5 py-4 text-xl text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 backdrop-blur-xl"
        />
      </div>

      {/* Team Selection */}
      <div className="mb-10">
        <p className="text-sm font-medium text-gray-400 mb-4">
          Choose Your Franchise
        </p>
        <div className="grid grid-cols-5 gap-4">
          {teamsData.map((team) => {
            const isSelected = selectedTeam === team.id;
            return (
              <button
                key={team.id}
                onClick={() => setSelectedTeam(team.id)}
                className={`flex flex-col items-center gap-2 rounded-2xl p-4 transition-all duration-200 ${
                  isSelected
                    ? 'bg-white/10 ring-2 ring-orange-500 scale-105 shadow-lg shadow-orange-500/20'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:scale-105'
                }`}
              >
                <TeamLogo
                  shortName={team.shortName}
                  primaryColor={team.primaryColor}
                  size="lg"
                />
                <span className="text-xs text-gray-300 font-medium text-center leading-tight">
                  {team.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Start Button */}
      <button
        onClick={handleStart}
        disabled={!canStart}
        className="w-full rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 py-4 text-lg font-bold text-white transition-all hover:scale-105 hover:shadow-lg hover:shadow-orange-500/30 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
      >
        START
      </button>
    </div>
  );
}

export default function CreateLeaguePage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-3xl px-4 py-12 text-center text-gray-400">
          Loading...
        </div>
      }
    >
      <CreateLeagueForm />
    </Suspense>
  );
}
