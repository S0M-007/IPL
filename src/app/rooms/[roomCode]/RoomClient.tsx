'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import {
  Copy,
  Share2,
  Crown,
  Circle,
  Settings,
  MessageSquare,
  Users,
  Play,
  X,
  Send,
  Check,
  Pause,
  ChevronRight,
  Trophy,
  Gavel,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRoom } from '@/lib/hooks/useRoom';
import { useChat } from '@/lib/hooks/useChat';
import { useAuction } from '@/lib/hooks/useAuction';
import { useTimer } from '@/lib/hooks/useTimer';
import { TeamLogo } from '@/components/shared/TeamLogo';
import { PriceDisplay } from '@/components/shared/PriceDisplay';
import { RoleBadge } from '@/components/shared/RoleBadge';
import { initializeAuction } from '@/lib/engine/auction-engine';
import { getNextBidAmount } from '@/lib/engine/bid-calculator';
import { formatPrice } from '@/lib/utils/price-formatter';
import teamsData from '@/data/teams.json';
import playersData from '@/data/players.json';
import type { Player } from '@/types/player';

const allPlayers = playersData as Player[];
function findPlayer(id: string): Player | undefined {
  return allPlayers.find((p) => p.id === id);
}

export function RoomClient({ roomCode }: { roomCode: string }) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const {
    room,
    participants,
    isHost,
    myTeamId,
    loading: roomLoading,
    error: roomError,
    joinRoom,
    selectTeam,
    updateSettings,
    kickParticipant,
  } = useRoom(roomCode, user?.uid);

  const { messages, sendMessage } = useChat(roomCode, user?.uid);

  const {
    auctionState,
    currentPlayerData,
    myTeamState,
    canBid,
    bidReason,
    bid,
    resolve,
    advance,
    pause,
    resume,
    end,
    loading: auctionLoading,
  } = useAuction(roomCode, myTeamId, room?.settings?.timerDuration ?? 15);

  const [activeTab, setActiveTab] = useState<'players' | 'chat' | 'settings'>('players');
  const [auctionTab, setAuctionTab] = useState<'activity' | 'chat'>('activity');
  const [joinName, setJoinName] = useState('');
  const [joinError, setJoinError] = useState('');
  const [joining, setJoining] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [starting, setStarting] = useState(false);
  const [resolving, setResolving] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [authLoading, user, router]);

  // Timer expired handler for host: resolve then advance
  const handleTimerExpired = useCallback(() => {
    if (!isHost) return;
    if (!auctionState?.currentPlayer) return;
    if (auctionState.currentPlayer.status !== 'bidding') return;

    setResolving(true);
    resolve().then(() => {
      setTimeout(() => {
        advance().then(() => setResolving(false));
      }, 2000);
    });
  }, [isHost, auctionState?.currentPlayer, resolve, advance]);

  const { secondsRemaining, percentage, isWarning } = useTimer(
    auctionState?.timer?.expiresAt ?? 0,
    auctionState?.timer?.isPaused ?? true,
    handleTimerExpired,
  );

  // Derived data
  const participantsList = useMemo(
    () => Object.values(participants),
    [participants],
  );

  const teamOwnerMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const p of participantsList) {
      if (p.teamId) map[p.teamId] = p.displayName;
    }
    return map;
  }, [participantsList]);

  const onlineCount = participantsList.filter((p) => p.isConnected).length;
  const teamsWithPlayers = participantsList.filter((p) => p.teamId).length;
  const canStartAuction = teamsWithPlayers >= 1;

  // Team lookup helper
  const teamMap = useMemo(() => {
    const m: Record<string, (typeof teamsData)[number]> = {};
    for (const t of teamsData) m[t.id] = t;
    return m;
  }, []);

  // Sorted teams by purse for sidebar
  const sortedTeamStates = useMemo(() => {
    if (!auctionState?.teams) return [];
    return Object.values(auctionState.teams).sort((a, b) => b.purseRemaining - a.purseRemaining);
  }, [auctionState?.teams]);

  // ─── Handlers ──────────────────────────────────────────────────────────────

  async function handleJoin() {
    if (!joinName.trim() || !user) return;
    setJoining(true);
    setJoinError('');
    try {
      await joinRoom(joinName.trim(), user.uid);
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : 'Failed to join');
    } finally {
      setJoining(false);
    }
  }

  async function handleTeamSelect(teamId: string) {
    if (!user) return;
    if (teamOwnerMap[teamId] && teamOwnerMap[teamId] !== participants[user.uid]?.displayName) return;
    if (myTeamId === teamId) return;
    await selectTeam(user.uid, teamId);
  }

  async function handleSendChat(e: React.FormEvent) {
    e.preventDefault();
    if (!chatInput.trim() || !user) return;
    const me = participants[user.uid];
    await sendMessage(chatInput.trim(), me?.displayName ?? 'Anonymous', myTeamId);
    setChatInput('');
  }

  async function handleStartAuction() {
    if (teamsWithPlayers < 10) {
      setShowConfirmModal(true);
      return;
    }
    await doStartAuction();
  }

  async function doStartAuction() {
    if (!room) return;
    setStarting(true);
    setShowConfirmModal(false);
    try {
      const participantTeamIds = participantsList
        .filter((p) => p.teamId)
        .map((p) => p.teamId!);
      await initializeAuction(
        roomCode,
        room.settings.auctionMode,
        room.settings.timerDuration,
        participantTeamIds,
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to start auction');
    }
    setStarting(false);
  }

  function handleCopyCode() {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleShare() {
    const url = `${window.location.origin}/rooms/${roomCode}`;
    if (navigator.share) {
      navigator.share({ title: 'Join my IPL Auction', url });
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function handleBid() {
    await bid();
  }

  async function handlePause() {
    await pause();
  }

  async function handleResume() {
    await resume();
  }

  async function handleEnd() {
    setShowEndConfirm(false);
    await end();
  }

  async function handleAdvance() {
    await advance();
  }

  // ─── Loading / Error states ────────────────────────────────────────────────

  if (authLoading || roomLoading) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400">Loading room...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  if (roomError || !room) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-8 text-center max-w-md">
          <h2 className="text-xl font-bold text-white mb-2">Room Not Found</h2>
          <p className="text-gray-400 mb-6">{roomError ?? 'This room does not exist or has been deleted.'}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-all duration-300"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // ─── Join form (not a participant yet) ─────────────────────────────────────

  const isParticipant = !!participants[user.uid];

  if (!isParticipant) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center px-4">
        <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold text-white mb-2 text-center">Join Room</h2>
          <p className="text-gray-400 text-center mb-6">
            Room <span className="font-mono text-orange-400">{roomCode}</span>
          </p>
          {joinError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2 mb-4 text-red-400 text-sm">
              {joinError}
            </div>
          )}
          <input
            type="text"
            value={joinName}
            onChange={(e) => setJoinName(e.target.value)}
            placeholder="Enter your display name"
            maxLength={20}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 transition-all duration-300 mb-4"
            onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
          />
          <button
            onClick={handleJoin}
            disabled={joining || !joinName.trim()}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-300"
          >
            {joining ? 'Joining...' : 'Join Room'}
          </button>
        </div>
      </div>
    );
  }

  // ─── Auction Complete view ─────────────────────────────────────────────────

  if (room.status === 'completed') {
    const teamStandings = auctionState
      ? Object.values(auctionState.teams)
          .map((ts) => {
            const team = teamMap[ts.teamId];
            const totalSpent = (team ? 12000 : 12000) - ts.purseRemaining;
            return { ...ts, team, totalSpent };
          })
          .sort((a, b) => b.totalSpent - a.totalSpent)
      : [];

    return (
      <div className="min-h-screen bg-[#0a0e1a] text-white flex flex-col items-center justify-center px-4 py-8">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 max-w-2xl w-full">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-orange-500/20 flex items-center justify-center">
              <Trophy className="w-10 h-10 text-orange-400" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Auction Complete!</h1>
            <p className="text-gray-400">
              Room <span className="font-mono text-orange-400">{roomCode}</span> — {auctionState?.playersAuctioned ?? 0} players auctioned
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-300 mb-2">Final Standings</h2>
            {teamStandings.map((ts, idx) => (
              <div
                key={ts.teamId}
                className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3"
              >
                <span className="text-gray-500 font-mono text-sm w-6 text-right">{idx + 1}.</span>
                {ts.team && (
                  <TeamLogo shortName={ts.team.shortName} primaryColor={ts.team.primaryColor} size="sm" />
                )}
                <div className="flex-1 min-w-0">
                  <span className="text-white font-medium text-sm">
                    {ts.team?.name ?? ts.teamId}
                  </span>
                  <span className="text-gray-500 text-xs ml-2">
                    {ts.bought.length} bought + {ts.retained.length} retained
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-orange-400 font-semibold text-sm">{formatPrice(ts.totalSpent)}</span>
                  <span className="text-gray-500 text-xs block">{formatPrice(ts.purseRemaining)} left</span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => router.push('/')}
            className="mt-8 w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-all duration-300"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // ─── Live Auction view ─────────────────────────────────────────────────────

  if (room.status === 'auction' || room.status === 'paused') {
    const current = auctionState?.currentPlayer ?? null;
    const playerData = currentPlayerData;
    const isPaused = auctionState?.timer?.isPaused ?? false;
    const currentSetLength = auctionState?.playerOrder?.[auctionState.currentSetIndex]?.length ?? 0;

    const bidderTeam = current?.currentBidder ? teamMap[current.currentBidder] : null;
    const nextBidAmount = current ? getNextBidAmount(current.currentBid) : 0;

    // SVG timer config
    const timerRadius = 54;
    const timerCircumference = 2 * Math.PI * timerRadius;
    const timerOffset = timerCircumference - (percentage / 100) * timerCircumference;

    const isSoldOrUnsold = current?.status === 'sold' || current?.status === 'unsold';
    const soldTeam = current?.status === 'sold' && current.currentBidder ? teamMap[current.currentBidder] : null;

    return (
      <div className="min-h-screen bg-[#0a0e1a] text-white flex flex-col">
        {/* ── Top Bar ─────────────────────────────────────────────────────── */}
        <header className="bg-gray-900/50 backdrop-blur-xl border-b border-white/10 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
            {/* Left: room code + player count */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-3 py-1.5 transition-all duration-300"
              >
                <span className="font-mono text-lg font-bold tracking-widest text-orange-400">
                  {roomCode}
                </span>
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-green-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-gray-400" />
                )}
              </button>
              <div className="flex items-center gap-1.5 text-sm text-gray-400">
                <Circle className="w-2 h-2 fill-green-400 text-green-400" />
                <span>{onlineCount}</span>
              </div>
            </div>

            {/* Center: set progress */}
            <div className="text-sm text-gray-400 text-center">
              <span className="text-white font-medium">Set {(auctionState?.currentSetIndex ?? 0) + 1}</span>
              <span className="mx-1.5">—</span>
              <span>Player {(auctionState?.currentPlayerIndex ?? 0) + 1}/{currentSetLength}</span>
              <span className="mx-1.5 text-gray-600">|</span>
              <span>{auctionState?.playersAuctioned ?? 0}/{auctionState?.totalPlayersInPool ?? 0} done</span>
            </div>

            {/* Right: host controls + purse */}
            <div className="flex items-center gap-3">
              {myTeamState && (
                <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm">
                  <span className="text-gray-400">Purse: </span>
                  <span className="text-orange-400 font-semibold">{formatPrice(myTeamState.purseRemaining)}</span>
                </div>
              )}
              {isHost && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={isPaused ? handleResume : handlePause}
                    className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-3 py-1.5 text-sm transition-all duration-300"
                  >
                    {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                    {isPaused ? 'Resume' : 'Pause'}
                  </button>
                  <button
                    onClick={() => setShowEndConfirm(true)}
                    className="flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl px-3 py-1.5 text-sm transition-all duration-300"
                  >
                    <X className="w-3.5 h-3.5" />
                    End
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── Main Content ────────────────────────────────────────────────── */}
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 flex gap-6">
          {/* ── Left: Player card + actions ──────────────────────────────── */}
          <div className="flex-1 flex flex-col gap-6">
            {/* Player card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              {current && playerData ? (
                <div className="flex flex-col items-center text-center gap-4">
                  {/* Player info */}
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">{playerData.name}</h2>
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      <RoleBadge role={playerData.role} />
                      <span className="text-sm text-gray-400">{playerData.country}</span>
                      {playerData.isOverseas && (
                        <span className="bg-cyan-500/20 text-cyan-400 text-xs px-2 py-0.5 rounded-full font-medium">
                          OS
                        </span>
                      )}
                      {playerData.specialization && (
                        <span className="text-xs text-gray-500">({playerData.specialization})</span>
                      )}
                    </div>
                    <p className="text-gray-500 text-sm mt-1">
                      Base: <span className="text-gray-300">{formatPrice(playerData.basePrice)}</span>
                    </p>
                  </div>

                  {/* SOLD / UNSOLD overlay */}
                  {isSoldOrUnsold ? (
                    <div className="py-6">
                      {current.status === 'sold' ? (
                        <div className="flex flex-col items-center gap-3">
                          <div className="bg-green-500/20 border border-green-500/40 rounded-2xl px-8 py-4">
                            <p className="text-green-400 text-lg font-bold tracking-wider">SOLD!</p>
                          </div>
                          <div className="flex items-center gap-3">
                            {soldTeam && (
                              <TeamLogo
                                shortName={soldTeam.shortName}
                                primaryColor={soldTeam.primaryColor}
                                size="md"
                              />
                            )}
                            <div>
                              <p className="text-white font-semibold">{soldTeam?.name ?? current.currentBidder}</p>
                              <p className="text-orange-400 text-2xl font-bold">{formatPrice(current.currentBid)}</p>
                            </div>
                          </div>
                          {isHost && (
                            <button
                              onClick={handleAdvance}
                              className="mt-2 flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2.5 rounded-xl transition-all duration-300"
                            >
                              Next Player
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-3">
                          <div className="bg-gray-500/20 border border-gray-500/40 rounded-2xl px-8 py-4">
                            <p className="text-gray-400 text-lg font-bold tracking-wider">UNSOLD</p>
                          </div>
                          {isHost && (
                            <button
                              onClick={handleAdvance}
                              className="mt-2 flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2.5 rounded-xl transition-all duration-300"
                            >
                              Next Player
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      {/* Current bid display */}
                      <div className="py-4">
                        {current.bidCount > 0 ? (
                          <div className="flex flex-col items-center gap-2">
                            <p className="text-gray-500 text-xs uppercase tracking-wider">Current Bid</p>
                            <p className="text-4xl font-bold text-orange-400">{formatPrice(current.currentBid)}</p>
                            {bidderTeam && (
                              <div className="flex items-center gap-2">
                                <TeamLogo
                                  shortName={bidderTeam.shortName}
                                  primaryColor={bidderTeam.primaryColor}
                                  size="sm"
                                />
                                <span className="text-gray-300 text-sm">{bidderTeam.name}</span>
                              </div>
                            )}
                            <p className="text-gray-600 text-xs">{current.bidCount} bid{current.bidCount > 1 ? 's' : ''}</p>
                          </div>
                        ) : (
                          <div className="text-center">
                            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Starting Price</p>
                            <p className="text-4xl font-bold text-orange-400">{formatPrice(current.currentBid)}</p>
                            <p className="text-gray-500 text-sm mt-2">No bids yet</p>
                          </div>
                        )}
                      </div>

                      {/* Timer */}
                      <div className="relative w-32 h-32">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                          <circle
                            cx="60"
                            cy="60"
                            r={timerRadius}
                            fill="none"
                            stroke="rgba(255,255,255,0.05)"
                            strokeWidth="6"
                          />
                          <circle
                            cx="60"
                            cy="60"
                            r={timerRadius}
                            fill="none"
                            stroke={isPaused ? '#6b7280' : isWarning ? '#ef4444' : '#f97316'}
                            strokeWidth="6"
                            strokeLinecap="round"
                            strokeDasharray={timerCircumference}
                            strokeDashoffset={timerOffset}
                            className="transition-all duration-200"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span
                            className={clsx(
                              'text-3xl font-bold tabular-nums',
                              isPaused ? 'text-gray-500' : isWarning ? 'text-red-400' : 'text-white',
                            )}
                          >
                            {secondsRemaining}
                          </span>
                          {isPaused && <span className="text-xs text-gray-500">PAUSED</span>}
                        </div>
                      </div>

                      {/* Bid button */}
                      <button
                        onClick={handleBid}
                        disabled={!canBid || resolving}
                        className={clsx(
                          'w-full max-w-xs py-4 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2',
                          canBid && !resolving
                            ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/20'
                            : 'bg-gray-700 text-gray-500 cursor-not-allowed',
                        )}
                      >
                        <Gavel className="w-5 h-5" />
                        BID {formatPrice(nextBidAmount)}
                      </button>
                      {!canBid && bidReason && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {bidReason}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-12 h-12 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-gray-400">
                    {resolving ? 'Resolving player...' : 'Loading next player...'}
                  </p>
                </div>
              )}
            </div>

            {/* Activity / Chat tabs */}
            <div className="bg-white/5 border border-white/10 rounded-2xl flex flex-col min-h-0 max-h-80">
              <div className="flex gap-1 p-1 border-b border-white/10">
                {(['activity', 'chat'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setAuctionTab(tab)}
                    className={clsx(
                      'flex-1 py-2 rounded-xl text-sm font-medium transition-all duration-300 capitalize',
                      auctionTab === tab ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300',
                    )}
                  >
                    {tab === 'chat' ? 'Chat' : 'Activity'}
                    {tab === 'chat' && messages.length > 0 && (
                      <span className="ml-1.5 bg-orange-500/20 text-orange-400 text-xs px-1.5 py-0.5 rounded-full">
                        {messages.length}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {auctionTab === 'activity' ? (
                <div className="flex-1 overflow-y-auto p-4 space-y-2 text-sm">
                  {auctionState?.completedPlayers && Object.keys(auctionState.completedPlayers).length > 0 ? (
                    Object.entries(auctionState.completedPlayers)
                      .reverse()
                      .map(([pid, cp]) => {
                        const p = findPlayer(pid);
                        const buyerTeam = cp.soldTo ? teamMap[cp.soldTo] : null;
                        return (
                          <div key={pid} className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2">
                            <span className="text-white font-medium truncate">{p?.name ?? pid}</span>
                            <span className="text-gray-600">—</span>
                            {cp.soldTo ? (
                              <>
                                {buyerTeam && (
                                  <TeamLogo shortName={buyerTeam.shortName} primaryColor={buyerTeam.primaryColor} size="sm" />
                                )}
                                <span className="text-orange-400 font-semibold">{formatPrice(cp.soldPrice)}</span>
                              </>
                            ) : (
                              <span className="text-gray-500">Unsold</span>
                            )}
                          </div>
                        );
                      })
                  ) : (
                    <p className="text-gray-500 text-center py-4">No completed players yet</p>
                  )}
                </div>
              ) : (
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.length === 0 && (
                      <p className="text-gray-500 text-sm text-center py-4">No messages yet</p>
                    )}
                    {messages.map((msg) => {
                      const isSystem = msg.type === 'system';
                      const isMe = msg.senderId === user.uid;
                      const senderTeam = teamsData.find((t) => t.id === msg.senderTeamId);

                      if (isSystem) {
                        return (
                          <div key={msg.id} className="text-center">
                            <span className="text-xs text-gray-500 italic bg-white/5 px-3 py-1 rounded-full">
                              {msg.text}
                            </span>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={msg.id}
                          className={clsx('flex gap-2', isMe ? 'flex-row-reverse' : 'flex-row')}
                        >
                          {senderTeam ? (
                            <TeamLogo
                              shortName={senderTeam.shortName}
                              primaryColor={senderTeam.primaryColor}
                              size="sm"
                              className="flex-shrink-0 mt-0.5"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs text-gray-500 flex-shrink-0 mt-0.5">
                              {msg.senderName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div
                            className={clsx(
                              'max-w-[70%] rounded-2xl px-3 py-2',
                              isMe
                                ? 'bg-orange-500/20 border border-orange-500/30'
                                : 'bg-white/5 border border-white/10',
                            )}
                          >
                            {!isMe && (
                              <p className="text-xs text-cyan-400 mb-0.5">{msg.senderName}</p>
                            )}
                            <p className="text-sm text-white break-words">{msg.text}</p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={chatEndRef} />
                  </div>
                  <form onSubmit={handleSendChat} className="flex gap-2 p-3 border-t border-white/10">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Type a message..."
                      maxLength={200}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 transition-all duration-300"
                    />
                    <button
                      type="submit"
                      disabled={!chatInput.trim()}
                      className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl px-4 py-2 transition-all duration-300"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>

          {/* ── Right Sidebar ────────────────────────────────────────────── */}
          <aside className="w-72 flex-shrink-0 hidden lg:flex flex-col gap-4">
            {/* My squad */}
            {myTeamState && myTeamId && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                  {teamMap[myTeamId] && (
                    <TeamLogo
                      shortName={teamMap[myTeamId].shortName}
                      primaryColor={teamMap[myTeamId].primaryColor}
                      size="sm"
                    />
                  )}
                  Your Squad ({myTeamState.slotsUsed})
                </h3>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {myTeamState.retained.length > 0 && (
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Retained ({myTeamState.retained.length})</p>
                  )}
                  {myTeamState.retained.map((pid) => {
                    const p = findPlayer(pid);
                    return (
                      <div key={pid} className="flex items-center justify-between text-xs bg-white/5 rounded-lg px-2 py-1.5">
                        <span className="text-white truncate">{p?.name ?? pid}</span>
                        <span className="text-purple-400 text-[10px] ml-1">RTM</span>
                      </div>
                    );
                  })}
                  {myTeamState.bought.length > 0 && (
                    <p className="text-xs text-gray-500 uppercase tracking-wider mt-2">Bought ({myTeamState.bought.length})</p>
                  )}
                  {myTeamState.bought.map((b) => {
                    const p = findPlayer(b.playerId);
                    return (
                      <div key={b.playerId} className="flex items-center justify-between text-xs bg-white/5 rounded-lg px-2 py-1.5">
                        <span className="text-white truncate">{p?.name ?? b.playerId}</span>
                        <span className="text-orange-400 font-medium ml-1">{formatPrice(b.soldPrice)}</span>
                      </div>
                    );
                  })}
                  {myTeamState.slotsUsed === 0 && (
                    <p className="text-gray-600 text-xs text-center py-2">No players yet</p>
                  )}
                </div>
              </div>
            )}

            {/* All teams purse */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex-1 min-h-0">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">All Teams</h3>
              <div className="space-y-1.5 overflow-y-auto max-h-96">
                {sortedTeamStates.map((ts) => {
                  const team = teamMap[ts.teamId];
                  if (!team) return null;
                  const isMyTeam = ts.teamId === myTeamId;
                  return (
                    <div
                      key={ts.teamId}
                      className={clsx(
                        'flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs transition-all duration-300',
                        isMyTeam ? 'bg-orange-500/10 border border-orange-500/30' : 'bg-white/5',
                      )}
                    >
                      <TeamLogo shortName={team.shortName} primaryColor={team.primaryColor} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{team.shortName}</p>
                        <p className="text-gray-500 text-[10px]">{ts.slotsUsed} players | {ts.overseasCount} OS</p>
                      </div>
                      <span className="text-orange-400 font-semibold whitespace-nowrap">
                        {formatPrice(ts.purseRemaining)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>
        </main>

        {/* ── End Auction Confirmation Modal ──────────────────────────────── */}
        {showEndConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full">
              <h3 className="text-lg font-bold text-white mb-2">End Auction?</h3>
              <p className="text-gray-400 text-sm mb-6">
                This will end the auction immediately. All remaining players will not be auctioned.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowEndConfirm(false)}
                  className="flex-1 py-2.5 bg-white/5 border border-white/10 text-gray-300 rounded-xl hover:bg-white/10 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEnd}
                  className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-all duration-300"
                >
                  End Auction
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── Lobby view ────────────────────────────────────────────────────────────

  const timerOptions: Array<5 | 10 | 15 | 20 | 25> = [5, 10, 15, 20, 25];

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white flex flex-col">
      {/* ── Top Bar ─────────────────────────────────────────────────────────── */}
      <header className="bg-gray-900/50 backdrop-blur-xl border-b border-white/10 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-2 transition-all duration-300 group"
            >
              <span className="font-mono text-xl font-bold tracking-widest text-orange-400">
                {roomCode}
              </span>
              {copied ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
              )}
            </button>
            <div className="flex items-center gap-1.5 text-sm text-gray-400">
              <Circle className="w-2.5 h-2.5 fill-green-400 text-green-400" />
              <span>{onlineCount} online</span>
            </div>
          </div>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-2 text-sm text-gray-300 hover:text-white transition-all duration-300"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>
      </header>

      {/* ── Main content ────────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 flex flex-col gap-6">
        {/* Team Selection Grid */}
        <section>
          <h2 className="text-lg font-semibold mb-3 text-gray-300">Select Your Team</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {teamsData.map((team) => {
              const owner = teamOwnerMap[team.id];
              const isMine = myTeamId === team.id;
              const isTaken = !!owner && !isMine;

              return (
                <button
                  key={team.id}
                  onClick={() => handleTeamSelect(team.id)}
                  disabled={isTaken}
                  className={clsx(
                    'relative flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-300',
                    isMine
                      ? 'bg-orange-500/10 border-orange-500 ring-2 ring-orange-500/50'
                      : isTaken
                        ? 'bg-white/[0.02] border-white/5 opacity-50 cursor-not-allowed'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 cursor-pointer',
                  )}
                >
                  <TeamLogo shortName={team.shortName} primaryColor={team.primaryColor} size="lg" />
                  <span className="text-sm font-medium text-white">{team.shortName}</span>
                  <span
                    className={clsx(
                      'text-xs truncate max-w-full',
                      isMine ? 'text-orange-400' : isTaken ? 'text-gray-500' : 'text-cyan-400',
                    )}
                  >
                    {isMine ? 'You' : owner ?? 'Available'}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Tabs section */}
        <section className="flex-1 flex flex-col min-h-0">
          {/* Tab headers */}
          <div className="flex gap-1 bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-t-2xl p-1">
            {([
              { key: 'players' as const, label: 'Players', icon: Users },
              { key: 'chat' as const, label: 'Chat', icon: MessageSquare },
              { key: 'settings' as const, label: 'Settings', icon: Settings },
            ]).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={clsx(
                  'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-300',
                  activeTab === key
                    ? 'bg-white/10 text-white'
                    : 'text-gray-500 hover:text-gray-300',
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
                {key === 'chat' && messages.length > 0 && (
                  <span className="bg-orange-500/20 text-orange-400 text-xs px-1.5 py-0.5 rounded-full">
                    {messages.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 bg-gray-900/50 backdrop-blur-xl border border-white/10 border-t-0 rounded-b-2xl overflow-hidden flex flex-col">
            {/* ── Players Tab ──────────────────────────────────────────────── */}
            {activeTab === 'players' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {participantsList.map((p) => {
                  const pTeam = teamsData.find((t) => t.id === p.teamId);
                  return (
                    <div
                      key={p.uid}
                      className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 transition-all duration-300"
                    >
                      {pTeam ? (
                        <TeamLogo shortName={pTeam.shortName} primaryColor={pTeam.primaryColor} size="sm" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs text-gray-500">
                          ?
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white truncate">
                            {p.displayName}
                          </span>
                          {p.isHost && <Crown className="w-4 h-4 text-yellow-400 flex-shrink-0" />}
                        </div>
                        {pTeam && (
                          <span className="text-xs text-gray-500">{pTeam.name}</span>
                        )}
                      </div>

                      <Circle
                        className={clsx(
                          'w-2.5 h-2.5 flex-shrink-0',
                          p.isConnected
                            ? 'fill-green-400 text-green-400'
                            : 'fill-gray-600 text-gray-600',
                        )}
                      />

                      {isHost && p.uid !== user.uid && (
                        <button
                          onClick={() => kickParticipant(p.uid)}
                          className="text-gray-600 hover:text-red-400 transition-colors"
                          title="Kick player"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
                {participantsList.length === 0 && (
                  <p className="text-gray-500 text-sm text-center py-8">No players yet</p>
                )}
              </div>
            )}

            {/* ── Chat Tab ─────────────────────────────────────────────────── */}
            {activeTab === 'chat' && (
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 && (
                    <p className="text-gray-500 text-sm text-center py-8">
                      No messages yet. Say something!
                    </p>
                  )}
                  {messages.map((msg) => {
                    const isSystem = msg.type === 'system';
                    const isMe = msg.senderId === user.uid;
                    const senderTeam = teamsData.find((t) => t.id === msg.senderTeamId);

                    if (isSystem) {
                      return (
                        <div key={msg.id} className="text-center">
                          <span className="text-xs text-gray-500 italic bg-white/5 px-3 py-1 rounded-full">
                            {msg.text}
                          </span>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={msg.id}
                        className={clsx('flex gap-2', isMe ? 'flex-row-reverse' : 'flex-row')}
                      >
                        {senderTeam ? (
                          <TeamLogo
                            shortName={senderTeam.shortName}
                            primaryColor={senderTeam.primaryColor}
                            size="sm"
                            className="flex-shrink-0 mt-0.5"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs text-gray-500 flex-shrink-0 mt-0.5">
                            {msg.senderName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div
                          className={clsx(
                            'max-w-[70%] rounded-2xl px-3 py-2',
                            isMe
                              ? 'bg-orange-500/20 border border-orange-500/30'
                              : 'bg-white/5 border border-white/10',
                          )}
                        >
                          {!isMe && (
                            <p className="text-xs text-cyan-400 mb-0.5">{msg.senderName}</p>
                          )}
                          <p className="text-sm text-white break-words">{msg.text}</p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={chatEndRef} />
                </div>
                <form
                  onSubmit={handleSendChat}
                  className="flex gap-2 p-3 border-t border-white/10"
                >
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type a message..."
                    maxLength={200}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 transition-all duration-300"
                  />
                  <button
                    type="submit"
                    disabled={!chatInput.trim()}
                    className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl px-4 py-2 transition-all duration-300"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

            {/* ── Settings Tab ─────────────────────────────────────────────── */}
            {activeTab === 'settings' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Auction mode (read-only) */}
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Auction Mode</label>
                  <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white capitalize">
                    {room.settings.auctionMode === 'ipl2026'
                      ? 'IPL 2026'
                      : room.settings.auctionMode === 'mega'
                        ? 'Mega Auction'
                        : 'Legends Auction'}
                  </div>
                </div>

                {/* Timer duration */}
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Timer Duration</label>
                  <div className="flex gap-2">
                    {timerOptions.map((t) => (
                      <button
                        key={t}
                        onClick={() => isHost && updateSettings({ timerDuration: t })}
                        disabled={!isHost}
                        className={clsx(
                          'flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all duration-300',
                          room.settings.timerDuration === t
                            ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                            : isHost
                              ? 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                              : 'bg-white/5 border-white/10 text-gray-600 cursor-not-allowed',
                        )}
                      >
                        {t}s
                      </button>
                    ))}
                  </div>
                </div>

                {/* Room info */}
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Room Info</label>
                  <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Visibility</span>
                      <span className="text-white capitalize">{room.settings.visibility}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Max Players</span>
                      <span className="text-white">{room.settings.maxPlayers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Mid-Join</span>
                      <span className="text-white">{room.settings.allowMidJoin ? 'Allowed' : 'Disabled'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Spectators</span>
                      <span className="text-white">{room.settings.allowSpectators ? 'Allowed' : 'Disabled'}</span>
                    </div>
                  </div>
                </div>

                {!isHost && (
                  <p className="text-xs text-gray-500 text-center">
                    Only the host can modify settings.
                  </p>
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* ── Start Auction Button (host only) ──────────────────────────────── */}
      {isHost && (
        <div className="sticky bottom-0 bg-gradient-to-t from-[#0a0e1a] via-[#0a0e1a] to-transparent pt-4 pb-4 px-4">
          <div className="max-w-5xl mx-auto">
            <button
              onClick={handleStartAuction}
              disabled={!canStartAuction || starting}
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed text-white font-bold text-lg rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg shadow-orange-500/20 disabled:shadow-none"
            >
              <Play className="w-5 h-5" />
              {starting ? 'Starting...' : 'Start Auction'}
            </button>
            {!canStartAuction && (
              <p className="text-xs text-gray-500 text-center mt-2">
                At least 1 player must select a team to start.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Confirmation Modal ─────────────────────────────────────────────── */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-white mb-2">Start with fewer teams?</h3>
            <p className="text-gray-400 text-sm mb-6">
              Only {teamsWithPlayers} of 10 teams are filled. Are you sure you want to start the
              auction?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 bg-white/5 border border-white/10 text-gray-300 rounded-xl hover:bg-white/10 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={doStartAuction}
                disabled={starting}
                className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-all duration-300"
              >
                {starting ? 'Starting...' : 'Start Anyway'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
