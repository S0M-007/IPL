'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { RoleBadge } from '@/components/shared/RoleBadge';
import { PriceDisplay } from '@/components/shared/PriceDisplay';
import playersData from '@/data/players.json';
import type { PlayerRole } from '@/types';

const ROLES: (PlayerRole | 'ALL')[] = ['ALL', 'BAT', 'BOWL', 'AR', 'WK'];

export default function PlayersPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<PlayerRole | 'ALL'>('ALL');

  const filtered = useMemo(() => {
    return playersData.filter((p) => {
      if (roleFilter !== 'ALL' && p.role !== roleFilter) return false;
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [search, roleFilter]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Players</h1>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Input
          placeholder="Search players..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-xs"
        />
        <div className="flex gap-2">
          {ROLES.map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                roleFilter === role
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {role === 'ALL' ? 'All' : role}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-gray-500 mb-4">{filtered.length} players</p>

      <div className="space-y-2">
        {filtered.map((player) => (
          <Card key={player.id} className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <RoleBadge role={player.role} />
              <div>
                <p className="font-medium">{player.name}</p>
                <p className="text-xs text-gray-500">
                  {player.country}
                  {player.isOverseas && ' (Overseas)'}
                  {player.specialization && ` · ${player.specialization}`}
                </p>
              </div>
            </div>
            <PriceDisplay lakhs={player.basePrice} label="Base" />
          </Card>
        ))}
      </div>
    </div>
  );
}
