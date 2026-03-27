import { ref, onValue, type Unsubscribe } from 'firebase/database';
import { db } from './client';
import { roomPath, roomParticipantsPath, publicRoomsPath } from './db-paths';
import type { Room, Participant, PublicRoom } from '../types';

export function subscribeToRoom(
  roomCode: string,
  callback: (room: Room | null) => void
): Unsubscribe {
  return onValue(ref(db, roomPath(roomCode)), (snap) => {
    callback(snap.exists() ? (snap.val() as Room) : null);
  });
}

export function subscribeToParticipants(
  roomCode: string,
  callback: (participants: Record<string, Participant>) => void
): Unsubscribe {
  return onValue(ref(db, roomParticipantsPath(roomCode)), (snap) => {
    callback(snap.exists() ? (snap.val() as Record<string, Participant>) : {});
  });
}

export function subscribeToPublicRooms(
  callback: (rooms: PublicRoom[]) => void
): Unsubscribe {
  return onValue(ref(db, publicRoomsPath()), (snap) => {
    if (!snap.exists()) {
      callback([]);
      return;
    }
    const data = snap.val() as Record<string, PublicRoom>;
    const rooms = Object.values(data).filter((r) => r.status === 'lobby');
    rooms.sort((a, b) => b.createdAt - a.createdAt);
    callback(rooms);
  });
}
