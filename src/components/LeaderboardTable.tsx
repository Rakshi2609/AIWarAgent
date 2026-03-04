import { LeaderboardEntry } from '../types';

interface Props {
  entries: LeaderboardEntry[];
}

const medals = ['🥇', '🥈', '🥉'];

export default function LeaderboardTable({ entries }: Props) {
  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-xl border px-6 py-12 text-center text-gray-400">
        No leaderboard data yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border shadow-sm">
      <table className="min-w-full bg-white text-sm">
        <thead>
          <tr className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 border-b">
            <th className="px-5 py-3 text-left">Rank</th>
            <th className="px-5 py-3 text-left">Team Name</th>
            <th className="px-5 py-3 text-right">Round 1</th>
            <th className="px-5 py-3 text-right">Round 2</th>
            <th className="px-5 py-3 text-right">Round 3</th>
            <th className="px-5 py-3 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e, idx) => (
            <tr
              key={e.team}
              className={`border-t transition-colors hover:bg-indigo-50 ${
                idx === 0 ? 'bg-yellow-50' : ''
              }`}
            >
              <td className="px-5 py-3.5 font-medium">
                {medals[idx] ?? idx + 1}
              </td>
              <td className="px-5 py-3.5 font-semibold text-gray-800">{e.team}</td>
              <td className="px-5 py-3.5 text-right text-gray-600">{e.r1 ?? '—'}</td>
              <td className="px-5 py-3.5 text-right text-gray-600">{e.r2 ?? '—'}</td>
              <td className="px-5 py-3.5 text-right text-gray-600">{e.r3 ?? '—'}</td>
              <td className="px-5 py-3.5 text-right font-bold text-indigo-700">{e.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
