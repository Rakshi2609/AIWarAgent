"use client";
import { useEffect, useState } from 'react';
import { fetchLeaderboard } from '../../services/api';
import { LeaderboardEntry } from '../../types';
import LeaderboardTable from '../../components/LeaderboardTable';

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    fetchLeaderboard()
      .then((data) => { if (mounted) setEntries(Array.isArray(data) ? data : []); })
      .catch((err) => setError(String(err)))
      .finally(() => setLoading(false));
    return () => { mounted = false; };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">🏆 Leaderboard</h1>
        <p className="text-sm text-gray-500 mt-1">Updated live from the judging sheet.</p>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-indigo-600 bg-indigo-50 rounded-xl px-5 py-4">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Loading leaderboard...
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-5 py-4">
          {error}
        </div>
      )}
      {!loading && !error && <LeaderboardTable entries={entries} />}
    </div>
  );
}
