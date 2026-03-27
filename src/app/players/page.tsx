'use client';

import { useState, useMemo } from 'react';
import { getPlayers } from '@/lib/data';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { Card } from '@/components/ui';
import { RoleBadge } from '@/components/shared/RoleBadge';
import { PriceDisplay } from '@/components/shared/PriceDisplay';
import { CountryFlag } from '@/components/shared/CountryFlag';
import { Search } from 'lucide-react';
import type { PlayerRole } from '@/lib/types';

const ROLES = ['ALL', 'BAT', 'BOWL', 'AR', 'WK'] as const;

export default function PlayersPage() {
  const allPlayers = getPlayers();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [overseasOnly, setOverseasOnly] = useState(false);

  const filtered = useMemo(() => {
    return allPlayers.filter((p) => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (roleFilter !== 'ALL' && p.role !== roleFilter) return false;
      if (overseasOnly && !p.isOverseas) return false;
      return true;
    });
  }, [allPlayers, search, roleFilter, overseasOnly]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 py-10 w-full">
        <h1 className="text-3xl font-bold text-white mb-2">Player Database</h1>
        <p className="text-gray-400 mb-8">Browse all players available for the IPL auction</p>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search players..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-2">
            {ROLES.map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  roleFilter === role
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                {role}
              </button>
            ))}
          </div>

          <button
            onClick={() => setOverseasOnly(!overseasOnly)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              overseasOnly
                ? 'bg-amber-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            Overseas
          </button>
        </div>

        <p className="text-sm text-gray-500 mb-4">{filtered.length} players</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((player) => (
            <Card key={player.id} variant="default" className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-white">{player.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{player.specialization}</p>
                </div>
                <PriceDisplay amount={player.basePrice} size="sm" />
              </div>
              <div className="flex items-center gap-2 mt-3">
                <RoleBadge role={player.role as PlayerRole} size="sm" />
                <CountryFlag country={player.country} isOverseas={player.isOverseas} size="sm" />
              </div>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
