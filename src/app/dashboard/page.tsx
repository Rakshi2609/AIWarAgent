"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchTeam } from '../../services/api';
import { ScoreBreakdown } from '../../types';
import ScoreCard from '../../components/ScoreCard';

export default function DashboardPage() {
  const router = useRouter();
  const [teamName, setTeamName] = useState<string | null>(null);
  const [scores, setScores] = useState<ScoreBreakdown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = localStorage.getItem('teamName');
    if (!t) { router.push('/login'); return; }
    setTeamName(t);
    fetchTeam(t)
      .then((data) => setScores(Array.isArray(data) ? data : []))
      .catch((err) => setError(String(err)))
      .finally(() => setLoading(false));
  }, [router]);

  const total = scores.reduce((acc, s) => acc + (s.subtotal || 0), 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">
            {teamName ? `👋 ${teamName}` : 'Dashboard'}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Your scores and submission links</p>
        </div>
        <Link
          href="/submit"
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-full text-sm transition-colors shadow"
        >
          + Submit Project Link
        </Link>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-indigo-600 bg-indigo-50 rounded-xl px-5 py-4">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Loading team data...
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-5 py-4">{error}</div>
      )}

      {!loading && !error && (
        <>
          {/* Total score banner */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl px-8 py-6 flex items-center justify-between shadow">
            <div>
              <p className="text-sm text-indigo-200 font-medium uppercase tracking-wide">Total Score</p>
              <p className="text-5xl font-black mt-1">{total}</p>
            </div>
            <div className="text-right">
              <p className="text-indigo-200 text-sm">Rounds completed</p>
              <p className="text-3xl font-bold mt-1">{scores.length} / 3</p>
            </div>
          </div>

          {/* Score cards */}
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-4">Round Breakdown</h2>
            {scores.length === 0 ? (
              <div className="bg-white rounded-2xl border px-6 py-10 text-center text-gray-400">
                No scores yet. Judges will update this after each round.
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {scores.map((s) => <ScoreCard key={s.round} score={s} />)}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
