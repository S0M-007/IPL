import { ref, type DatabaseReference } from 'firebase/database';
import { db } from './config';

export function roomRef(roomCode: string): DatabaseReference {
  return ref(db, `rooms/${roomCode}`);
}

export function roomSettingsRef(roomCode: string): DatabaseReference {
  return ref(db, `rooms/${roomCode}/settings`);
}

export function participantsRef(roomCode: string): DatabaseReference {
  return ref(db, `rooms/${roomCode}/participants`);
}

export function auctionRef(roomCode: string): DatabaseReference {
  return ref(db, `rooms/${roomCode}/auction`);
}

export function chatRef(roomCode: string): DatabaseReference {
  return ref(db, `rooms/${roomCode}/chat`);
}

export function publicRoomsRef(): DatabaseReference {
  return ref(db, 'publicRooms');
}

export function userRef(uid: string): DatabaseReference {
  return ref(db, `users/${uid}`);
}

export function leagueRef(leagueId: string): DatabaseReference {
  return ref(db, `leagues/${leagueId}`);
}
