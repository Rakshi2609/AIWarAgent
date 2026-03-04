"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();
  const team = typeof window !== 'undefined' ? localStorage.getItem('teamName') : null;

  function handleLogout() {
    localStorage.removeItem('teamName');
    router.push('/');
  }

  return (
    <nav className="bg-indigo-700 text-white shadow-md">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold tracking-tight hover:opacity-90 transition-opacity">
            🤖 AI Hackathon
          </Link>
          <Link href="/leaderboard" className="text-sm font-medium text-indigo-200 hover:text-white transition-colors">
            Leaderboard
          </Link>
        </div>
        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link href="/submit" className="text-sm font-medium text-indigo-200 hover:text-white transition-colors">
            Submit
          </Link>
          {team ? (
            <>
              <Link href="/dashboard" className="text-sm font-medium text-indigo-200 hover:text-white transition-colors">
                Dashboard
              </Link>
              <span className="text-indigo-300 text-sm hidden sm:block">| {team}</span>
              <button
                onClick={handleLogout}
                className="text-sm bg-indigo-500 hover:bg-indigo-400 transition-colors px-3 py-1 rounded-full"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="text-sm bg-white text-indigo-700 font-semibold px-4 py-1.5 rounded-full hover:bg-indigo-50 transition-colors"
            >
              Team Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
