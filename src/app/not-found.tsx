import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-700 mb-4">404</h1>
        <h2 className="text-xl font-semibold text-white mb-2">Page Not Found</h2>
        <p className="text-gray-400 mb-6">The page you are looking for does not exist.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium px-6 py-2.5 rounded-lg transition-all"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
