'use client';

import { useState } from 'react';
import AuthGuard from '@/components/auth/AuthGuard';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { RoomBrowser } from '@/components/rooms/RoomBrowser';
import { CreateRoomModal } from '@/components/rooms/CreateRoomModal';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';

export default function RoomsPage() {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <AuthGuard>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-7xl mx-auto px-4 py-10 w-full">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white">Rooms</h1>
              <p className="text-gray-400 mt-1">Join a room or create your own</p>
            </div>
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="w-4 h-4" /> Create Room
            </Button>
          </div>
          <RoomBrowser />
        </main>
        <Footer />
        <CreateRoomModal isOpen={showCreate} onClose={() => setShowCreate(false)} />
      </div>
    </AuthGuard>
  );
}
