import Link from 'next/link';

export default function RoomNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white mb-2">Room Not Found</h1>
        <p className="text-gray-400 mb-6">
          This room may have been deleted or the code is invalid.
        </p>
        <Link
          href="/rooms"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium px-6 py-2.5 rounded-lg transition-all"
        >
          Browse Rooms
        </Link>
      </div>
    </div>
  );
}
