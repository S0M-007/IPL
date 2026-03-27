import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { Card } from '@/components/ui';

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-10 w-full">
        <h1 className="text-3xl font-bold text-white mb-2">Leaderboard</h1>
        <p className="text-gray-400 mb-8">See how teams performed across auctions</p>

        <Card variant="elevated" className="p-12 text-center">
          <p className="text-gray-500 text-lg">Complete an auction to see results here</p>
          <p className="text-gray-600 text-sm mt-2">Leaderboard will populate after games are played</p>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
