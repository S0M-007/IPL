'use client';

import { useAuction } from '@/hooks/useAuction';
import { useAuth } from '@/components/providers/AuthProvider';
import { CurrentPlayerCard } from './CurrentPlayerCard';
import { BidPanel } from './BidPanel';
import { AuctionTimer } from './AuctionTimer';
import { SetProgress } from './SetProgress';
import { TeamStandings } from './TeamStandings';
import { HostControls } from './HostControls';
import { CompletedPlayers } from './CompletedPlayers';
import { AuctionResults } from './AuctionResults';
import { ChatPanel } from '@/components/rooms/ChatPanel';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { canTeamBid, getNextBid } from '@/lib/auction-logic';
import { getPlayerById, getRetentions } from '@/lib/data';
import type { Participant } from '@/lib/types';

interface AuctionViewProps {
  roomCode: string;
  participants: Participant[];
  isHost: boolean;
  timerDuration: number;
}

export function AuctionView({ roomCode, participants, isHost, timerDuration }: AuctionViewProps) {
  const { user } = useAuth();
  const { auction, loading } = useAuction(roomCode);

  if (loading || !auction) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (auction.status === 'completed') {
    return <AuctionResults auction={auction} />;
  }

  const myParticipant = participants.find((p) => p.userId === user?.uid);
  const myTeamId = myParticipant?.teamId || null;
  const currentPlayer = auction.currentPlayerId ? getPlayerById(auction.currentPlayerId) : null;

  let canBid = false;
  if (myTeamId && currentPlayer && auction.purses[myTeamId] && auction.status === 'active') {
    const nextBid = auction.currentBidderTeam ? getNextBid(auction.currentBid) : auction.currentBid;
    const retentions = getRetentions();
    const retainedOverseas = retentions[myTeamId]
      ? retentions[myTeamId].retained.filter((r) => {
          const pl = getPlayerById(r.playerId);
          return pl?.isOverseas;
        }).length
      : 0;
    const result = canTeamBid(auction.purses[myTeamId], nextBid, currentPlayer, retainedOverseas);
    canBid = result.canBid && auction.currentBidderTeam !== myTeamId;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 max-w-[1400px] mx-auto px-4 py-4">
      {/* Left: Team Standings */}
      <div className="lg:col-span-3 space-y-4">
        <Card variant="elevated" className="p-4">
          <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-3">Team Standings</h3>
          <TeamStandings purses={auction.purses} />
        </Card>

        <Card variant="elevated" className="p-4">
          <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-3">History</h3>
          <CompletedPlayers
            soldPlayers={auction.soldPlayers || []}
            unsoldPlayers={auction.unsoldPlayers || []}
          />
        </Card>
      </div>

      {/* Center: Main Auction Area */}
      <div className="lg:col-span-6 space-y-4">
        <SetProgress
          currentSet={auction.currentSet}
          currentIndex={auction.currentIndex}
          totalPlayers={auction.playerOrder?.length || 0}
        />

        {auction.status === 'paused' && (
          <div className="text-center py-2">
            <Badge variant="warning" size="md">Auction Paused</Badge>
          </div>
        )}

        <div className="flex flex-col items-center gap-6">
          <AuctionTimer expiresAt={auction.timerExpiresAt} totalDuration={timerDuration} />

          {auction.currentPlayerId ? (
            <CurrentPlayerCard
              playerId={auction.currentPlayerId}
              currentBid={auction.currentBid}
              bidderTeam={auction.currentBidderTeam}
            />
          ) : (
            <Card variant="elevated" className="p-8 text-center w-full">
              <p className="text-gray-400">Waiting for next player...</p>
            </Card>
          )}

          <div className="w-full max-w-sm">
            <BidPanel
              roomCode={roomCode}
              currentBid={auction.currentBid}
              currentBidderTeam={auction.currentBidderTeam}
              myTeamId={myTeamId}
              canBid={canBid}
              auctionStatus={auction.status}
            />
          </div>

          {isHost && (
            <div className="w-full">
              <Card variant="default" className="p-3">
                <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Host Controls</h3>
                <HostControls
                  roomCode={roomCode}
                  auctionStatus={auction.status}
                  hasCurrentPlayer={!!auction.currentPlayerId}
                  hasBidder={!!auction.currentBidderId}
                />
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Right: Chat */}
      <div className="lg:col-span-3">
        <Card variant="elevated" className="h-[calc(100vh-8rem)] flex flex-col">
          <h3 className="text-xs text-gray-500 uppercase tracking-wider p-4 pb-0">Chat</h3>
          <ChatPanel roomCode={roomCode} />
        </Card>
      </div>
    </div>
  );
}
