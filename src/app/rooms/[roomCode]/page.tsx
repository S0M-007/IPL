export default async function RoomPage({ params }: { params: Promise<{ roomCode: string }> }) {
  const { roomCode } = await params;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold mb-4">
        Room: <span className="text-orange-500 font-mono">{roomCode}</span>
      </h1>
      <p className="text-gray-400">
        Room lobby and auction interface will be built in Phase 2-4.
      </p>
    </div>
  );
}
