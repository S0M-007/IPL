import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { Card } from '@/components/ui';
import { BID_INCREMENTS, SET_NAMES, MAX_SQUAD_SIZE, MAX_OVERSEAS, TOTAL_PURSE } from '@/lib/constants';
import { formatPrice } from '@/lib/utils';

export default function HowToPlayPage() {
  const steps = [
    { title: 'Create or Join a Room', desc: 'The host creates a room and shares the code. Other players join using the room code or by browsing public rooms.' },
    { title: 'Pick Your Team', desc: 'Each player selects one of the 10 IPL teams. Teams come with pre-retained players and remaining purse.' },
    { title: 'Bidding Begins', desc: 'Players are presented in sets. The host controls the flow. When a player comes up, teams can bid if they have enough purse.' },
    { title: 'Timer Countdown', desc: 'Each bid resets a countdown timer. When the timer runs out, the player is sold to the highest bidder.' },
    { title: 'Build Your Squad', desc: 'Keep bidding across all sets. Manage your purse wisely to build a balanced squad of 25 players.' },
    { title: 'Final Results', desc: 'Once all sets are completed, see the final standings and compare squads!' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-10 w-full">
        <h1 className="text-3xl font-bold text-white mb-2">How to Play</h1>
        <p className="text-gray-400 mb-10">Everything you need to know about the IPL Auction Game</p>

        <div className="space-y-4 mb-12">
          {steps.map((step, i) => (
            <Card key={i} variant="default" className="p-5 flex gap-4">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
                {i + 1}
              </div>
              <div>
                <h3 className="font-semibold text-white">{step.title}</h3>
                <p className="text-sm text-gray-400 mt-1">{step.desc}</p>
              </div>
            </Card>
          ))}
        </div>

        <Card variant="elevated" className="p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Squad Constraints</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase">Max Squad</p>
              <p className="text-xl font-bold text-white">{MAX_SQUAD_SIZE}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Max Overseas</p>
              <p className="text-xl font-bold text-amber-400">{MAX_OVERSEAS}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Total Purse</p>
              <p className="text-xl font-bold text-emerald-400">₹{formatPrice(TOTAL_PURSE)}</p>
            </div>
          </div>
        </Card>

        <Card variant="elevated" className="p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Bid Increments</h2>
          <div className="space-y-2">
            {Object.entries(BID_INCREMENTS).map(([range, increment]) => (
              <div key={range} className="flex justify-between text-sm py-2 border-b border-gray-800 last:border-0">
                <span className="text-gray-400">₹{range.replace('-', ' — ₹').replace('+', '+')} L</span>
                <span className="text-white font-medium">+₹{increment} L</span>
              </div>
            ))}
          </div>
        </Card>

        <Card variant="elevated" className="p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Auction Sets</h2>
          <div className="space-y-2">
            {SET_NAMES.map((name, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-800 last:border-0">
                <span className="text-xs text-indigo-400 font-medium w-6">{i + 1}</span>
                <span className="text-sm text-gray-300">{name}</span>
              </div>
            ))}
          </div>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
