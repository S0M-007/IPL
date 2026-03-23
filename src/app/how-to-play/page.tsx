import { LogIn, Gamepad2, Users, Gavel, Trophy, Crown } from 'lucide-react';

const steps = [
  {
    icon: LogIn,
    number: 1,
    title: 'Sign In',
    desc: 'Create an account or sign in with Google to get started. Your progress and leagues are saved automatically.',
  },
  {
    icon: Gamepad2,
    number: 2,
    title: 'Choose Mode',
    desc: 'Pick from Regular (IPL 2026 rules), Fantasy (build your dream XI), or All-Time Legends mode for classic matchups.',
  },
  {
    icon: Users,
    number: 3,
    title: 'Create League',
    desc: 'Name your league, invite friends with a share code, and pick an IPL franchise to represent.',
  },
  {
    icon: Gavel,
    number: 4,
    title: 'Start Auction',
    desc: 'Players appear one at a time. Place bids before the countdown expires. The highest bidder wins the player.',
  },
  {
    icon: Trophy,
    number: 5,
    title: 'Build Squad',
    desc: 'Stay within your budget, manage overseas player slots, and build a balanced team of 18-25 players.',
  },
  {
    icon: Crown,
    number: 6,
    title: 'Win!',
    desc: 'In Fantasy mode, compete against friends on the leaderboard. Best squad composition wins bragging rights!',
  },
];

const bidIncrements = [
  { range: 'Under ₹1 Cr', increment: '₹5 Lakhs' },
  { range: '₹1 Cr — ₹5 Cr', increment: '₹20 Lakhs' },
  { range: 'Above ₹5 Cr', increment: '₹25 Lakhs' },
];

const squadConstraints = [
  { rule: 'Minimum Squad Size', value: '18 players' },
  { rule: 'Maximum Squad Size', value: '25 players' },
  { rule: 'Max Overseas Players', value: '8 players' },
  { rule: 'IPL 2026 Purse', value: 'Variable (post retentions)' },
  { rule: 'Mega Auction Purse', value: '₹120 Cr (flat)' },
];

export default function HowToPlayPage() {
  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-cyan-500/5" />
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }} />
        <div className="relative mx-auto max-w-4xl px-4 pt-16 pb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-2">
            <span className="bg-gradient-to-r from-[#ff6b00] to-[#ff9500] bg-clip-text text-transparent">
              How to Play
            </span>
          </h1>
          <p className="text-center text-gray-400 text-lg">
            Your step-by-step guide to the IPL Auction Game
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 pb-16">
        {/* Steps timeline */}
        <div className="relative">
          {/* Vertical connecting line */}
          <div className="absolute left-6 md:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-[#ff6b00] via-[#ff9500] to-[#00d4ff] opacity-30" />

          <div className="space-y-6">
            {steps.map(({ icon: Icon, number, title, desc }) => (
              <div key={number} className="relative flex gap-5 md:gap-7 group">
                {/* Number circle + icon */}
                <div className="relative z-10 shrink-0">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-[#ff6b00] to-[#ff9500] flex items-center justify-center shadow-lg shadow-orange-500/20 transition-transform duration-300 group-hover:scale-110">
                    <Icon className="text-white" size={22} />
                  </div>
                  {/* Step number badge */}
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#0a0e1a] border-2 border-orange-500 flex items-center justify-center text-[10px] font-bold text-orange-500">
                    {number}
                  </span>
                </div>

                {/* Content card */}
                <div className="flex-1 bg-gray-900/50 border border-white/10 rounded-2xl p-5 md:p-6 backdrop-blur-xl transition-all duration-300 group-hover:border-white/20 group-hover:bg-white/5 mb-0">
                  <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tables section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
          {/* Bid Increments */}
          <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-1 h-5 rounded-full bg-gradient-to-b from-[#ff6b00] to-[#ff9500]" />
              Bid Increments
            </h3>
            <div className="space-y-0">
              {bidIncrements.map(({ range, increment }, idx) => (
                <div
                  key={range}
                  className={`flex items-center justify-between py-3 ${
                    idx < bidIncrements.length - 1 ? 'border-b border-white/5' : ''
                  }`}
                >
                  <span className="text-gray-400 text-sm">{range}</span>
                  <span className="text-orange-500 font-semibold text-sm">{increment}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Squad Constraints */}
          <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-1 h-5 rounded-full bg-gradient-to-b from-[#00d4ff] to-cyan-400" />
              Squad Constraints
            </h3>
            <div className="space-y-0">
              {squadConstraints.map(({ rule, value }, idx) => (
                <div
                  key={rule}
                  className={`flex items-center justify-between py-3 ${
                    idx < squadConstraints.length - 1 ? 'border-b border-white/5' : ''
                  }`}
                >
                  <span className="text-gray-400 text-sm">{rule}</span>
                  <span className="text-[#00d4ff] font-semibold text-sm">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
