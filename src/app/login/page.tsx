"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginTeam } from '../../services/api';

export default function LoginPage() {
  const router = useRouter();
  const [team, setTeam] = useState('');
  const [leader, setLeader] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await loginTeam(team.trim(), leader.trim());
      localStorage.setItem('teamName', team.trim());
      router.push('/dashboard');
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Team Login</h1>
          <p className="text-gray-500 mt-2 text-sm">Enter your team name and leader to continue.</p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border shadow-sm px-8 py-8 space-y-5"
        >
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Team Name</label>
            <input
              value={team}
              onChange={(e) => setTeam(e.target.value)}
              required
              placeholder="e.g. Team Alpha"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Leader Name</label>
            <input
              value={leader}
              onChange={(e) => setLeader(e.target.value)}
              required
              placeholder="e.g. John"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
            />
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-2.5">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold rounded-lg transition-colors"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
