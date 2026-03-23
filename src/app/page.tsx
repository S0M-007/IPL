'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { TeamLogo } from '@/components/shared/TeamLogo';
import teamsData from '@/data/teams.json';
import { Users, Zap, Trophy, Globe } from 'lucide-react';

export default function HomePage() {
  const [name, setName] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [joinCode, setJoinCode] = useState('');

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4">
          Play IPL Auction<br />
          <span className="text-orange-500">with Friends</span>
        </h1>
        <p className="text-gray-400 text-lg">
          Create a room, pick your franchise, and bid on real IPL players in real-time
        </p>
      </div>

      {/* Create Room */}
      <Card className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Create a Room</h2>
        <Input
          label="Your Name"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={20}
          className="mb-4"
        />
        <p className="text-sm text-gray-400 mb-2">Choose Your Team</p>
        <div className="flex flex-wrap gap-3 mb-4">
          {teamsData.map((team) => (
            <button
              key={team.id}
              onClick={() => setSelectedTeam(team.id)}
              className={`rounded-full transition-all ${selectedTeam === team.id ? 'ring-2 ring-orange-500 ring-offset-2 ring-offset-gray-900 scale-110' : 'hover:scale-105'}`}
            >
              <TeamLogo shortName={team.shortName} primaryColor={team.primaryColor} />
            </button>
          ))}
        </div>
        <Button size="lg" className="w-full" disabled={!name.trim() || !selectedTeam}>
          Create Room
        </Button>
      </Card>

      {/* Join Room */}
      <Card className="mb-12">
        <h2 className="text-lg font-semibold mb-4">Join a Room</h2>
        <div className="flex gap-3">
          <Input
            placeholder="Enter room code"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            maxLength={6}
            className="flex-1 uppercase tracking-widest text-center font-mono"
          />
          <Button disabled={joinCode.length !== 6}>Join</Button>
        </div>
        <div className="mt-3 text-center">
          <Link href="/rooms" className="text-sm text-orange-400 hover:text-orange-300">
            Browse Live Rooms
          </Link>
        </div>
      </Card>

      {/* Features */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Users, title: 'Multiplayer', desc: 'Up to 10 players' },
          { icon: Zap, title: 'Real-Time', desc: 'Live bidding' },
          { icon: Trophy, title: 'IPL 2026', desc: 'Official player list' },
          { icon: Globe, title: '350+ Players', desc: 'All IPL stars' },
        ].map(({ icon: Icon, title, desc }) => (
          <Card key={title} className="text-center">
            <Icon className="mx-auto mb-2 text-orange-500" size={24} />
            <p className="font-medium text-sm">{title}</p>
            <p className="text-xs text-gray-500">{desc}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
