'use client';

import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { Card } from '@/components/ui';
import { Trophy, Zap, Settings, Users } from 'lucide-react';
import { MODE_CONFIG } from '@/lib/constants';

const modeIcons = { classic: Trophy, speed: Zap, custom: Settings };

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="py-20 px-4 text-center">
          <h1 className="text-5xl sm:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              IPL Auction
            </span>{' '}
            Game
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-12">
            Experience the thrill of the IPL mega auction. Build your dream squad in real-time
            multiplayer with friends.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
            {Object.entries(MODE_CONFIG).map(([key, mode]) => {
              const Icon = modeIcons[key as keyof typeof modeIcons];
              return (
                <Card key={key} variant="elevated" className="p-6 text-left hover:border-gray-700 transition-colors">
                  <Icon className="w-8 h-8 text-indigo-400 mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">{mode.label}</h3>
                  <p className="text-sm text-gray-400 mb-3">{mode.description}</p>
                  <p className="text-xs text-gray-500">Timer: {mode.timer}s per bid</p>
                </Card>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {user ? (
              <Link
                href="/rooms"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium px-8 py-3 rounded-lg text-lg transition-all"
              >
                <Users className="w-5 h-5" />
                Browse Rooms
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium px-8 py-3 rounded-lg text-lg transition-all"
              >
                Sign In to Play
              </Link>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
