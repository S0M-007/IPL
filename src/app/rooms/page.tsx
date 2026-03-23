import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function RoomsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Live Auction Rooms</h1>
      <p className="text-gray-400 mb-8">Browse public rooms and join an ongoing auction.</p>

      <Card className="text-center py-12">
        <p className="text-gray-500 mb-2">No live rooms right now</p>
        <p className="text-sm text-gray-600">Create a room to get started!</p>
        <Badge variant="warning" className="mt-4">Firebase not connected yet</Badge>
      </Card>
    </div>
  );
}
