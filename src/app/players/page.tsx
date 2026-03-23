'use client';

import { useState, useMemo } from 'react';
import { Search, ArrowUpDown } from 'lucide-react';
import playersData from '@/data/players.json';
import type { PlayerRole } from '@/types';

const ROLE_FILTERS: { key: PlayerRole | 'ALL'; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'BAT', label: 'Batsman' },
  { key: 'BOWL', label: 'Bowler' },
  { key: 'AR', label: 'All-Rounder' },
  { key: 'WK', label: 'Wicket-Keeper' },
];

const ROLE_COLORS: Record<string, string> = {
  BAT: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  BOWL: 'bg-red-500/20 text-red-400 border-red-500/30',
  AR: 'bg-green-500/20 text-green-400 border-green-500/30',
  WK: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

const ROLE_LABELS: Record<string, string> = {
  BAT: 'BAT',
  BOWL: 'BOWL',
  AR: 'AR',
  WK: 'WK',
};

const FLAG_MAP: Record<string, string> = {
  IND: '🇮🇳',
  AUS: '🇦🇺',
  ENG: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  SA: '🇿🇦',
  NZ: '🇳🇿',
  WI: '🇯🇲',
  SL: '🇱🇰',
  AFG: '🇦🇫',
  BAN: '🇧🇩',
  PAK: '🇵🇰',
  ZIM: '🇿🇼',
  NEP: '🇳🇵',
  SCO: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  IRE: '🇮🇪',
  NAM: '🇳🇦',
  USA: '🇺🇸',
};

type SortKey = 'name' | 'basePrice' | 'role';
type SortDir = 'asc' | 'desc';

function formatPrice(lakhs: number): string {
  if (lakhs >= 100) {
    const cr = lakhs / 100;
    return `₹${cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(2)} Cr`;
  }
  return `₹${lakhs} L`;
}

export default function PlayersPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<PlayerRole | 'ALL'>('ALL');
  const [nationalityFilter, setNationalityFilter] = useState<'ALL' | 'INDIAN' | 'OVERSEAS'>('ALL');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'basePrice' ? 'desc' : 'asc');
    }
  };

  const filtered = useMemo(() => {
    let result = playersData.filter((p) => {
      if (roleFilter !== 'ALL' && p.role !== roleFilter) return false;
      if (nationalityFilter === 'INDIAN' && p.isOverseas) return false;
      if (nationalityFilter === 'OVERSEAS' && !p.isOverseas) return false;
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });

    result = [...result].sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'name') cmp = a.name.localeCompare(b.name);
      else if (sortKey === 'basePrice') cmp = a.basePrice - b.basePrice;
      else if (sortKey === 'role') cmp = a.role.localeCompare(b.role);
      return sortDir === 'desc' ? -cmp : cmp;
    });

    return result;
  }, [search, roleFilter, nationalityFilter, sortKey, sortDir]);

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-cyan-500/5" />
        <div className="relative mx-auto max-w-7xl px-4 pt-16 pb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-2">
            <span className="bg-gradient-to-r from-[#ff6b00] to-[#ff9500] bg-clip-text text-transparent">
              Player Database
            </span>
          </h1>
          <p className="text-center text-gray-400 text-lg">
            Browse and filter the complete IPL player pool
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-16">
        {/* Search bar */}
        <div className="relative max-w-xl mx-auto mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <input
            type="text"
            placeholder="Search players by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-900/50 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/25 transition-all duration-300 backdrop-blur-xl"
          />
        </div>

        {/* Filters row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
          {/* Role filter chips */}
          <div className="flex flex-wrap gap-2">
            {ROLE_FILTERS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setRoleFilter(key)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  roleFilter === key
                    ? 'bg-gradient-to-r from-[#ff6b00] to-[#ff9500] text-white shadow-lg shadow-orange-500/25 scale-105'
                    : 'bg-gray-900/50 border border-white/10 text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Indian / Overseas toggle */}
          <div className="flex gap-1 bg-gray-900/50 border border-white/10 rounded-xl p-1">
            {(['ALL', 'INDIAN', 'OVERSEAS'] as const).map((val) => (
              <button
                key={val}
                onClick={() => setNationalityFilter(val)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                  nationalityFilter === val
                    ? 'bg-cyan-500/20 text-[#00d4ff] border border-cyan-500/30'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {val === 'ALL' ? 'All' : val === 'INDIAN' ? 'Indian' : 'Overseas'}
              </button>
            ))}
          </div>
        </div>

        {/* Sort controls + count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">{filtered.length} players found</p>
          <div className="flex gap-2">
            {([
              { key: 'name' as SortKey, label: 'Name' },
              { key: 'basePrice' as SortKey, label: 'Price' },
              { key: 'role' as SortKey, label: 'Role' },
            ]).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => toggleSort(key)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${
                  sortKey === key
                    ? 'bg-white/10 text-white'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <ArrowUpDown size={12} />
                {label}
                {sortKey === key && (sortDir === 'asc' ? ' ↑' : ' ↓')}
              </button>
            ))}
          </div>
        </div>

        {/* Player cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map((player) => (
            <div
              key={player.id}
              className="bg-gray-900/50 border border-white/10 rounded-2xl p-4 backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:bg-white/5 hover:-translate-y-0.5 group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white truncate">{player.name}</h3>
                  <p className="text-sm text-gray-400 flex items-center gap-1 mt-0.5">
                    <span>{FLAG_MAP[player.country] || ''}</span>
                    <span>{player.country}</span>
                  </p>
                </div>
                {player.isOverseas && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-semibold shrink-0 ml-2">
                    OS
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span
                  className={`text-xs px-2.5 py-1 rounded-full border font-medium ${ROLE_COLORS[player.role] || ''}`}
                >
                  {ROLE_LABELS[player.role] || player.role}
                </span>
                <span className="text-orange-500 font-bold text-sm">
                  {formatPrice(player.basePrice)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No players found matching your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
