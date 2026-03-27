'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { TeamLogo } from '@/components/shared/TeamLogo';
import { PriceDisplay } from '@/components/shared/PriceDisplay';
import { getNextBid } from '@/lib/auction-logic';
import { getIdToken } from '@/lib/firebase/auth-service';
import { Gavel } from 'lucide-react';

interface BidPanelProps {
  roomCode: string;
  currentBid: number;
  currentBidderTeam: string | null;
  myTeamId: string | null;
  canBid: boolean;
  auctionStatus: string;
}

export function BidPanel({
  roomCode,
  currentBid,
  currentBidderTeam,
  myTeamId,
  canBid,
  auctionStatus,
}: BidPanelProps) {
  const [bidding, setBidding] = useState(false);
  const [error, setError] = useState('');

  const isMyBid = currentBidderTeam === myTeamId;
  const nextBid = currentBidderTeam ? getNextBid(currentBid) : currentBid;

  async function handleBid() {
    try {
      setBidding(true);
      setError('');
      const token = await getIdToken();
      if (!token) return;

      const res = await fetch(`/api/rooms/${roomCode}/auction/bid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Bid failed');
      }
    } finally {
      setBidding(false);
    }
  }

  if (auctionStatus !== 'active') return null;

  return (
    <div className="space-y-4">
      {currentBidderTeam && (
        <div className="flex items-center gap-2 justify-center">
          <TeamLogo teamId={currentBidderTeam} size="sm" />
          <span className="text-sm text-gray-400">has the highest bid</span>
        </div>
      )}

      {isMyBid ? (
        <div className="text-center py-3 px-4 bg-green-500/10 border border-green-500/20 rounded-lg">
          <p className="text-green-400 font-medium">You have the highest bid!</p>
        </div>
      ) : (
        <Button
          onClick={handleBid}
          loading={bidding}
          disabled={!canBid || !myTeamId}
          className="w-full text-lg py-3"
        >
          <Gavel className="w-5 h-5" />
          Bid <PriceDisplay amount={nextBid} size="md" className="text-white" />
        </Button>
      )}

      {error && <p className="text-red-400 text-sm text-center">{error}</p>}
    </div>
  );
}
