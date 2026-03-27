'use client';

import { useState } from 'react';
import { getTeams, getRetentions } from '@/lib/data';
import { getIdToken } from '@/lib/firebase/auth-service';
import { Card } from '@/components/ui/Card';
import { formatPrice } from '@/lib/utils';
import type { Participant } from '@/lib/types';

interface TeamSelectorProps {
  roomCode: string;
  participants: Participant[];
  currentTeamId: string | null;
}

export function TeamSelector({ roomCode, participants, currentTeamId }: TeamSelectorProps) {
  const teams = getTeams();
  const retentions = getRetentions();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const takenTeams = new Set(
    participants.filter((p) => p.teamId).map((p) => p.teamId!)
  );

  async function selectTeam(teamId: string) {
    try {
      setLoading(true);
      setError('');
      const token = await getIdToken();
      if (!token) return;

      const res = await fetch(`/api/rooms/${roomCode}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ teamId }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to select team');
      }
    } catch {
      setError('Network error. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      {teams.map((team) => {
        const isTaken = takenTeams.has(team.id) && currentTeamId !== team.id;
        const isSelected = currentTeamId === team.id;
        const retention = retentions[team.id];

        return (
          <button
            key={team.id}
            onClick={() => !isTaken && !loading && selectTeam(team.id)}
            disabled={isTaken || loading}
            className="text-left disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Card
              variant={isSelected ? 'elevated' : 'default'}
              className={`p-3 transition-all ${
                isSelected
                  ? 'ring-2 ring-indigo-500'
                  : 'hover:border-gray-700'
              }`}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs mb-2"
                style={{
                  backgroundColor: team.primaryColor,
                  color: team.id === 'csk' ? '#1a1a1a' : '#fff',
                }}
              >
                {team.shortName}
              </div>
              <p className="text-xs font-medium text-white truncate">{team.name}</p>
              {retention && (
                <p className="text-[10px] text-gray-500 mt-1">
                  ₹{formatPrice(retention.purseRemaining)} left
                </p>
              )}
              {isTaken && (
                <p className="text-[10px] text-red-400 mt-1">Taken</p>
              )}
            </Card>
          </button>
        );
      })}
    </div>
    </div>
  );
}
