import { get, set, remove, update } from 'firebase/database';
import { ref } from 'firebase/database';
import { db } from './config';
import { roomRef, publicRoomsRef } from './db';
import { generateRoomCode } from '../utils/room-code';
import type { Room, RoomSettings, Participant, AuctionMode } from '../../types/room';
import type { AuctionState } from '../../types/auction';

export type RoomServiceResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function createRoom(
  hostUid: string,
  hostName: string,
  mode: AuctionMode,
  leagueName: string,
  teamId: string,
  visibility: 'public' | 'private',
  timerDuration: RoomSettings['timerDuration'],
): Promise<RoomServiceResult<string>> {
  try {
    const roomCode = generateRoomCode();

    const hostParticipant: Participant = {
      uid: hostUid,
      displayName: hostName,
      teamId,
      isHost: true,
      isReady: true,
      joinedAt: Date.now(),
      isConnected: true,
    };

    const settings: RoomSettings = {
      auctionMode: mode,
      timerDuration,
      visibility,
      maxPlayers: 10,
      allowMidJoin: true,
      allowSpectators: true,
    };

    const room: Room = {
      code: roomCode,
      hostId: hostUid,
      createdAt: Date.now(),
      status: 'lobby',
      settings,
      participants: { [hostUid]: hostParticipant },
      spectators: {},
    };

    await set(roomRef(roomCode), room);

    if (visibility === 'public') {
      await set(ref(db, `publicRooms/${roomCode}`), {
        code: roomCode,
        hostName,
        leagueName,
        mode,
        playerCount: 1,
        maxPlayers: settings.maxPlayers,
        createdAt: room.createdAt,
      });
    }

    return { success: true, data: roomCode };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create room';
    return { success: false, error: message };
  }
}

export async function joinRoom(
  roomCode: string,
  uid: string,
  displayName: string,
): Promise<RoomServiceResult> {
  try {
    const snapshot = await get(roomRef(roomCode));
    if (!snapshot.exists()) {
      return { success: false, error: 'Room not found' };
    }

    const room = snapshot.val() as Room;

    if (room.status !== 'lobby' && !room.settings.allowMidJoin) {
      return { success: false, error: 'Room is not accepting new players' };
    }

    const currentCount = Object.keys(room.participants ?? {}).length;
    if (currentCount >= room.settings.maxPlayers) {
      return { success: false, error: 'Room is full' };
    }

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

    // Update public room player count if applicable
    if (room.settings.visibility === 'public') {
      await update(ref(db, `publicRooms/${roomCode}`), {
        playerCount: currentCount + 1,
      });
    }

    return { success: true, data: undefined };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to join room';
    return { success: false, error: message };
  }
}

export async function startAuction(roomCode: string): Promise<RoomServiceResult> {
  try {
    const initialAuction: AuctionState = {
      currentSetIndex: 0,
      currentPlayerIndex: 0,
      currentPlayer: null,
      timer: {
        expiresAt: 0,
        duration: 0,
        isPaused: true,
      },
      completedPlayers: {},
      teams: {},
      totalPlayersInPool: 0,
      playersAuctioned: 0,
      playerOrder: [],
    };

    await update(roomRef(roomCode), {
      status: 'auction',
      auction: initialAuction,
    });

    return { success: true, data: undefined };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to start auction';
    return { success: false, error: message };
  }
}

export async function deleteRoom(roomCode: string): Promise<RoomServiceResult> {
  try {
    await remove(roomRef(roomCode));
    await remove(ref(db, `publicRooms/${roomCode}`));
    return { success: true, data: undefined };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to delete room';
    return { success: false, error: message };
  }
}
