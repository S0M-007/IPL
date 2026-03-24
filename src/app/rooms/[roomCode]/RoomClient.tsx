'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
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
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRoom } from '@/lib/hooks/useRoom';
import { useChat } from '@/lib/hooks/useChat';
import { TeamLogo } from '@/components/shared/TeamLogo';
import { startAuction } from '@/lib/firebase/room-service';
import teamsData from '@/data/teams.json';

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

  const [activeTab, setActiveTab] = useState<'players' | 'chat' | 'settings'>('players');
  const [joinName, setJoinName] = useState('');
  const [joinError, setJoinError] = useState('');
  const [joining, setJoining] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [starting, setStarting] = useState(false);
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
    setStarting(true);
    setShowConfirmModal(false);
    const result = await startAuction(roomCode);
    if (!result.success) {
      alert(result.error);
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

  // ─── Auction in progress placeholder ───────────────────────────────────────

  if (room.status !== 'lobby') {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-10 text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-500/20 flex items-center justify-center">
            <Play className="w-8 h-8 text-orange-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Auction in progress...</h2>
          <p className="text-gray-400">
            Room <span className="font-mono text-orange-400">{roomCode}</span>
          </p>
        </div>
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
