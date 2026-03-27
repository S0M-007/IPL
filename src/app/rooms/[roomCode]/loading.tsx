export default function RoomLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-gray-700 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400 text-sm">Loading room...</p>
      </div>
    </div>
  );
}
