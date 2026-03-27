'use client';

import { useEffect, useState } from 'react';
import { subscribeToRoom, subscribeToParticipants } from '@/lib/firebase/room-listeners';
import { useAuth } from '@/components/providers/AuthProvider';
import type { Room, Participant } from '@/lib/types';

export function useRoom(roomCode: string) {
  const { user } = useAuth();
  const [room, setRoom] = useState<Room | null>(null);
  const [participants, setParticipants] = useState<Record<string, Participant>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubRoom = subscribeToRoom(roomCode, (r) => {
      setRoom(r);
      setLoading(false);
    });
    const unsubParticipants = subscribeToParticipants(roomCode, setParticipants);

    return () => {
      unsubRoom();
      unsubParticipants();
    };
  }, [roomCode]);

  const isHost = room?.hostId === user?.uid;
  const participantList = Object.values(participants);
  const myParticipant = user ? participants[user.uid] : undefined;

  return { room, participants: participantList, participantsMap: participants, isHost, myParticipant, loading };
}
