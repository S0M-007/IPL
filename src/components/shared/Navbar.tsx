import Link from 'next/link';

export function Navbar() {
  return (
    <nav className="border-b border-gray-800 bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <Link href="/" className="text-lg font-bold text-orange-500">
            IPL Auction Game
          </Link>
          <div className="flex gap-6">
            <Link href="/teams" className="text-sm text-gray-400 hover:text-white transition-colors">Teams</Link>
            <Link href="/players" className="text-sm text-gray-400 hover:text-white transition-colors">Players</Link>
            <Link href="/rooms" className="text-sm text-gray-400 hover:text-white transition-colors">Live Rooms</Link>
            <Link href="/how-to-play" className="text-sm text-gray-400 hover:text-white transition-colors">How to Play</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
