import { ref, update, get } from 'firebase/database';
import { db } from '../firebase/config';
import { auctionRef, roomRef } from '../firebase/db';
import { getNextBidAmount } from './bid-calculator';
import { buildPlayerSets } from './set-manager';
import type { AuctionState, CurrentPlayerState, CompletedPlayer } from '@/types/auction';
import type { TeamAuctionState } from '@/types/team';
import type { Player } from '@/types/player';
import playersData from '@/data/players.json';
import retentionsData from '@/data/retentions.json';
import teamsData from '@/data/teams.json';

const players = playersData as Player[];
const retentions = retentionsData as Record<
  string,
  {
    purseUsed: number;
    purseRemaining: number;
    retained: { playerId: string; price: number; slot: number }[];
  }
>;
const teams = teamsData as { id: string; name: string; shortName: string; primaryColor: string; secondaryColor: string; homeGround: string }[];

function findPlayer(playerId: string): Player | undefined {
  return players.find((p) => p.id === playerId);
}

/**
 * Initialize the auction: build player order, set up team states,
 * present the first player, and write everything to Firebase.
 */
export async function initializeAuction(
  roomCode: string,
  mode: 'ipl2026' | 'mega' | 'legends',
  timerDuration: number,
  participantTeamIds: string[]
): Promise<void> {
  // Gather retained player IDs across participating teams
  const retainedPlayerIds: string[] = [];
  for (const teamId of participantTeamIds) {
    const teamRetention = retentions[teamId];
    if (teamRetention) {
      retainedPlayerIds.push(...teamRetention.retained.map((r) => r.playerId));
    }
  }

  // Build player order (array of sets)
  const playerOrder = buildPlayerSets(mode, retainedPlayerIds);

  // Calculate total players in the auction pool
  const totalPlayersInPool = playerOrder.reduce((sum, set) => sum + set.length, 0);

  // Build initial team states
  const teamStates: Record<string, TeamAuctionState> = {};
  for (const teamId of participantTeamIds) {
    const teamRetention = retentions[teamId];
    const retainedIds = teamRetention ? teamRetention.retained.map((r) => r.playerId) : [];
    const overseasRetained = retainedIds.filter((pid) => {
      const p = findPlayer(pid);
      return p?.isOverseas ?? false;
    });

    let purseRemaining: number;
    if (mode === 'ipl2026' && teamRetention) {
      purseRemaining = 12000 - teamRetention.purseUsed;
    } else {
      purseRemaining = 12000;
    }

    teamStates[teamId] = {
      teamId,
      purseRemaining,
      overseasCount: overseasRetained.length,
      slotsUsed: retainedIds.length,
      retained: retainedIds,
      bought: [],
    };
  }

  // Build the first player presentation
  const firstPlayerId = playerOrder[0][0];
  const firstPlayer = findPlayer(firstPlayerId);

  const currentPlayer: CurrentPlayerState = {
    playerId: firstPlayerId,
    currentBid: firstPlayer?.basePrice ?? 200,
    currentBidder: null,
    bidCount: 0,
    status: 'bidding',
  };

  const auctionState: AuctionState = {
    currentSetIndex: 0,
    currentPlayerIndex: 0,
    currentPlayer,
    timer: {
      expiresAt: Date.now() + timerDuration * 1000,
      duration: timerDuration,
      isPaused: false,
    },
    completedPlayers: {},
    teams: teamStates,
    totalPlayersInPool,
    playersAuctioned: 0,
    playerOrder,
  };

  // Write to Firebase
  const updates: Record<string, unknown> = {};
  updates[`rooms/${roomCode}/auction`] = auctionState;
  updates[`rooms/${roomCode}/status`] = 'auction';
  await update(ref(db), updates);
}

/**
 * Present a specific player from a given set and index.
 */
export async function presentPlayer(
  roomCode: string,
  setIndex: number,
  playerIndex: number,
  timerDuration: number
): Promise<void> {
  const snapshot = await get(auctionRef(roomCode));
  const state = snapshot.val() as AuctionState;
  const playerId = state.playerOrder[setIndex][playerIndex];
  const player = findPlayer(playerId);

  const currentPlayer: CurrentPlayerState = {
    playerId,
    currentBid: player?.basePrice ?? 200,
    currentBidder: null,
    bidCount: 0,
    status: 'bidding',
  };

  const updates: Record<string, unknown> = {
    [`rooms/${roomCode}/auction/currentSetIndex`]: setIndex,
    [`rooms/${roomCode}/auction/currentPlayerIndex`]: playerIndex,
    [`rooms/${roomCode}/auction/currentPlayer`]: currentPlayer,
    [`rooms/${roomCode}/auction/timer`]: {
      expiresAt: Date.now() + timerDuration * 1000,
      duration: timerDuration,
      isPaused: false,
    },
  };

  await update(ref(db), updates);
}

/**
 * Place a bid on the current player for a team.
 */
export async function placeBid(
  roomCode: string,
  teamId: string,
  timerDuration: number
): Promise<void> {
  const snapshot = await get(auctionRef(roomCode));
  const state = snapshot.val() as AuctionState;
  const current = state.currentPlayer;

  if (!current || current.status !== 'bidding') return;

  const nextBid = getNextBidAmount(current.currentBid);

  const updates: Record<string, unknown> = {
    [`rooms/${roomCode}/auction/currentPlayer/currentBid`]: nextBid,
    [`rooms/${roomCode}/auction/currentPlayer/currentBidder`]: teamId,
    [`rooms/${roomCode}/auction/currentPlayer/bidCount`]: current.bidCount + 1,
    [`rooms/${roomCode}/auction/timer`]: {
      expiresAt: Date.now() + timerDuration * 1000,
      duration: timerDuration,
      isPaused: false,
    },
  };

  await update(ref(db), updates);
}

/**
 * Resolve the current player as sold or unsold.
 */
export async function resolveCurrentPlayer(roomCode: string): Promise<void> {
  const snapshot = await get(auctionRef(roomCode));
  const state = snapshot.val() as AuctionState;
  const current = state.currentPlayer;

  if (!current) return;

  const updates: Record<string, unknown> = {};

  if (current.bidCount === 0) {
    // Unsold
    updates[`rooms/${roomCode}/auction/currentPlayer/status`] = 'unsold';

    const completed: CompletedPlayer = {
      soldTo: null,
      soldPrice: 0,
      bidCount: 0,
    };
    updates[`rooms/${roomCode}/auction/completedPlayers/${current.playerId}`] = completed;
  } else {
    // Sold
    const soldTo = current.currentBidder!;
    const soldPrice = current.currentBid;

    updates[`rooms/${roomCode}/auction/currentPlayer/status`] = 'sold';

    const completed: CompletedPlayer = {
      soldTo,
      soldPrice,
      bidCount: current.bidCount,
    };
    updates[`rooms/${roomCode}/auction/completedPlayers/${current.playerId}`] = completed;

    // Update team state
    const team = state.teams[soldTo];
    const player = findPlayer(current.playerId);
    const newBought = [...(team.bought || []), { playerId: current.playerId, soldPrice }];

    updates[`rooms/${roomCode}/auction/teams/${soldTo}/purseRemaining`] =
      team.purseRemaining - soldPrice;
    updates[`rooms/${roomCode}/auction/teams/${soldTo}/slotsUsed`] = team.slotsUsed + 1;
    updates[`rooms/${roomCode}/auction/teams/${soldTo}/bought`] = newBought;

    if (player?.isOverseas) {
      updates[`rooms/${roomCode}/auction/teams/${soldTo}/overseasCount`] =
        team.overseasCount + 1;
    }
  }

  updates[`rooms/${roomCode}/auction/playersAuctioned`] = state.playersAuctioned + 1;

  await update(ref(db), updates);
}

/**
 * Advance to the next player in the auction order.
 * Returns false if the auction is complete, true otherwise.
 */
export async function advanceToNextPlayer(
  roomCode: string,
  timerDuration: number
): Promise<boolean> {
  const snapshot = await get(auctionRef(roomCode));
  const state = snapshot.val() as AuctionState;

  let nextSetIndex = state.currentSetIndex;
  let nextPlayerIndex = state.currentPlayerIndex + 1;

  // Check if we've gone past the current set
  if (nextPlayerIndex >= state.playerOrder[nextSetIndex].length) {
    nextSetIndex++;
    nextPlayerIndex = 0;
  }

  // Check if we've gone past all sets
  if (nextSetIndex >= state.playerOrder.length) {
    await update(ref(db), {
      [`rooms/${roomCode}/status`]: 'completed',
    });
    return false;
  }

  await presentPlayer(roomCode, nextSetIndex, nextPlayerIndex, timerDuration);
  return true;
}

/**
 * Pause the auction timer.
 */
export async function pauseAuction(roomCode: string): Promise<void> {
  const updates: Record<string, unknown> = {
    [`rooms/${roomCode}/auction/timer/isPaused`]: true,
    [`rooms/${roomCode}/status`]: 'paused',
  };
  await update(ref(db), updates);
}

/**
 * Resume the auction timer.
 */
export async function resumeAuction(
  roomCode: string,
  timerDuration: number
): Promise<void> {
  const updates: Record<string, unknown> = {
    [`rooms/${roomCode}/auction/timer`]: {
      expiresAt: Date.now() + timerDuration * 1000,
      duration: timerDuration,
      isPaused: false,
    },
    [`rooms/${roomCode}/status`]: 'auction',
  };
  await update(ref(db), updates);
}

/**
 * End the auction immediately.
 */
export async function endAuction(roomCode: string): Promise<void> {
  await update(ref(db), {
    [`rooms/${roomCode}/status`]: 'completed',
  });
}
