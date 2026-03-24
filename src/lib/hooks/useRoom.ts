'use client';

import { useState, useEffect, useCallback } from 'react';
import { onValue, set, remove, update, onDisconnect } from 'firebase/database';
import { ref } from 'firebase/database';
import { db } from '../firebase/config';
import { roomRef, participantsRef, roomSettingsRef } from '../firebase/db';
import type { Room, Participant, RoomSettings } from '../../types/room';

interface UseRoomReturn {
  room: Room | null;
  participants: Record<string, Participant>;
  isHost: boolean;
  myTeamId: string | null;
  loading: boolean;
  error: string | null;
  joinRoom: (displayName: string, uid: string) => Promise<void>;
  leaveRoom: (uid: string) => Promise<void>;
  selectTeam: (uid: string, teamId: string) => Promise<void>;
  updateSettings: (settings: Partial<RoomSettings>) => Promise<void>;
  kickParticipant: (uid: string) => Promise<void>;
}

export function useRoom(roomCode: string, currentUid?: string): UseRoomReturn {
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomCode) return;

    const unsubscribe = onValue(
      roomRef(roomCode),
      (snapshot) => {
        if (snapshot.exists()) {
          setRoom(snapshot.val() as Room);
          setError(null);
        } else {
          setRoom(null);
          setError('Room not found');
        }
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [roomCode]);

  // Set up onDisconnect for the current user
  useEffect(() => {
    if (!roomCode || !currentUid) return;

    const participantConnectedRef = ref(
      db,
      `rooms/${roomCode}/participants/${currentUid}/isConnected`,
    );
    onDisconnect(participantConnectedRef).set(false);

    // Set connected when this effect runs
    set(participantConnectedRef, true);
  }, [roomCode, currentUid]);

  const participants = room?.participants ?? {};
  const isHost = currentUid ? participants[currentUid]?.isHost === true : false;
  const myTeamId = currentUid ? participants[currentUid]?.teamId ?? null : null;

  const joinRoom = useCallback(
    async (displayName: string, uid: string) => {
      const participant: Participant = {
        uid,
        displayName,
        teamId: null,
        isHost: false,
        isReady: false,
        joinedAt: Date.now(),
        isConnected: true,
      };
      await set(ref(db, `rooms/${roomCode}/participants/${uid}`), participant);
    },
    [roomCode],
  );

  const leaveRoom = useCallback(
    async (uid: string) => {
      await remove(ref(db, `rooms/${roomCode}/participants/${uid}`));
    },
    [roomCode],
  );

  const selectTeam = useCallback(
    async (uid: string, teamId: string) => {
      await update(ref(db, `rooms/${roomCode}/participants/${uid}`), { teamId });
    },
    [roomCode],
  );

  const updateSettings = useCallback(
    async (settings: Partial<RoomSettings>) => {
      await update(roomSettingsRef(roomCode), settings);
    },
    [roomCode],
  );

  const kickParticipant = useCallback(
    async (uid: string) => {
      await remove(ref(db, `rooms/${roomCode}/participants/${uid}`));
    },
    [roomCode],
  );

  return {
    room,
    participants,
    isHost,
    myTeamId,
    loading,
    error,
    joinRoom,
    leaveRoom,
    selectTeam,
    updateSettings,
    kickParticipant,
  };
}
