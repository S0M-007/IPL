import { Card } from '@/components/ui/Card';
import { Users, Timer, Gavel, Trophy } from 'lucide-react';

const steps = [
  {
    icon: Users,
    title: '1. Create or Join a Room',
    desc: 'Enter your name, pick an IPL franchise, and create a room. Share the 6-character code with friends or browse public rooms.',
  },
  {
    icon: Timer,
    title: '2. Configure the Auction',
    desc: 'The host sets the bid timer (5-25 seconds), auction mode (IPL 2026, Mega, or Legends), and room visibility.',
  },
  {
    icon: Gavel,
    title: '3. Bid on Players',
    desc: 'Players are presented one at a time. Click BID to place your bid. The timer resets with each bid. When the timer expires, the player is sold to the highest bidder.',
  },
  {
    icon: Trophy,
    title: '4. Build Your Squad',
    desc: 'Manage your budget wisely. Build a balanced squad of 18-25 players with a maximum of 8 overseas players.',
  },
];

const rules = [
  { title: 'Bid Increments', items: ['Under 1 Cr: +5 Lakhs', '1-5 Cr: +20 Lakhs', 'Above 5 Cr: +25 Lakhs'] },
  { title: 'Squad Limits', items: ['Minimum: 18 players', 'Maximum: 25 players', 'Max overseas: 8 players'] },
  { title: 'Budget', items: ['IPL 2026: Variable (after retentions)', 'Mega Auction: Flat 120 Cr', 'Purse reserve ensures you can fill minimum slots'] },
];

export default function HowToPlayPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">How to Play</h1>

      <div className="space-y-4 mb-12">
        {steps.map(({ icon: Icon, title, desc }) => (
          <Card key={title} className="flex gap-4">
            <div className="shrink-0 w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <Icon className="text-orange-500" size={20} />
            </div>
            <div>
              <h3 className="font-semibold mb-1">{title}</h3>
              <p className="text-sm text-gray-400">{desc}</p>
            </div>
          </Card>
        ))}
      </div>

      <h2 className="text-2xl font-bold mb-4">Rules</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {rules.map(({ title, items }) => (
          <Card key={title}>
            <h3 className="font-semibold mb-2 text-orange-400">{title}</h3>
            <ul className="space-y-1">
              {items.map((item) => (
                <li key={item} className="text-sm text-gray-400">&#8226; {item}</li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  );
}
