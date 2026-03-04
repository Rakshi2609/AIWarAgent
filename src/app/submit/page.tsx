"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { submitProject } from '../../services/api';

export default function SubmitPage() {
  const router = useRouter();
  const [round, setRound] = useState('1');
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [teamName, setTeamName] = useState<string | null>(null);

  useEffect(() => {
    const t = localStorage.getItem('teamName');
    if (!t) { router.push('/login'); return; }
    setTeamName(t);
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      await submitProject(teamName || '', round, link.trim());
      setSuccess(`Round ${round} submission saved successfully!`);
      setLink('');
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
          <h1 className="text-3xl font-extrabold text-gray-900">Submit Project</h1>
          <p className="text-gray-500 mt-2 text-sm">
            {teamName ? `Submitting as: ${teamName}` : 'Loading...'}
          </p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border shadow-sm px-8 py-8 space-y-5"
        >
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Round</label>
            <select
              value={round}
              onChange={(e) => setRound(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
            >
              <option value="1">Round 1</option>
              <option value="2">Round 2</option>
              <option value="3">Round 3</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Google Drive Link</label>
            <input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              required
              placeholder="https://drive.google.com/..."
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-2.5">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-2.5">
              ✓ {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !teamName}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold rounded-lg transition-colors"
          >
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  );
}
          <label className="block text-sm font-medium">Google Drive Link</label>
          <input value={link} onChange={(e) => setLink(e.target.value)} required className="mt-1 w-full border px-3 py-2 rounded" />
        </div>
        {error && <div className="text-red-500">{error}</div>}
        {success && <div className="text-green-600">{success}</div>}
        <div>
          <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
}
