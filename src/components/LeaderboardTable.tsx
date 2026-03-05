'use client';
import { Trophy, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { LeaderboardEntry } from '../types';

interface Props {
  entries: LeaderboardEntry[];
  isLoading?: boolean;
}

const RANK_STYLES: Record<number, { medal: string; bg: string; border: string }> = {
  1: { medal: '🥇', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.4)' },
  2: { medal: '🥈', bg: 'rgba(226,232,240,0.05)', border: 'rgba(226,232,240,0.3)' },
  3: { medal: '🥉', bg: 'rgba(180,83,9,0.08)', border: 'rgba(180,83,9,0.4)' },
};

function DecryptedText({ text, delay = 0 }: { text: string | number; delay?: number }) {
  const [displayed, setDisplayed] = useState('');
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  useEffect(() => {
    let iteration = 0;
    let interval: NodeJS.Timeout;

    const str = String(text);

    const startTimer = setTimeout(() => {
      interval = setInterval(() => {
        setDisplayed(str.split('').map((letter, index) => {
          if (index < iteration) return str[index];
          return chars[Math.floor(Math.random() * chars.length)];
        }).join(''));

        if (iteration >= str.length) {
          clearInterval(interval);
        }
        iteration += 1 / 3;
      }, 30);
    }, delay * 1000);

    return () => {
      clearTimeout(startTimer);
      clearInterval(interval);
    }
  }, [text, delay]);

  return <span className="font-mono tracking-wider">{displayed}</span>;
}

function SkeletonRow() {
  return (
    <tr className="border-t border-white/5">
      {[...Array(6)].map((_, i) => (
        <td key={i} className="px-6 py-5">
          <div className="shimmer h-4 rounded bg-white/5" style={{ width: i === 1 ? '160px' : '48px' }} />
        </td>
      ))}
    </tr>
  );
}

export default function LeaderboardTable({ entries, isLoading }: Props) {
  if (!isLoading && entries.length === 0) {
    return (
      <div className="card flex flex-col items-center justify-center py-24 text-center border-white/5 bg-black/40">
        <Activity className="mb-4 text-red-500 animate-pulse" size={48} />
        <p className="font-sans font-bold text-zinc-300 uppercase tracking-widest text-sm">No Intel Found</p>
        <p className="text-sm mt-3 font-sans text-zinc-500">Awaiting automated neural sync from operational nodes</p>
      </div>
    );
  }

  return (
    <div className="card rounded-2xl overflow-hidden shadow-2xl bg-black/60 border-white/10 relative">

      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm relative z-10 w-full table-fixed">
          <thead className="bg-black/80 border-b border-white/10 backdrop-blur-md">
            <tr>
              {['Rank', 'Node Hash', 'Protocol 1', 'Protocol 2', 'Protocol 3', 'Sync Total'].map((h) => (
                <th key={h} className="px-6 py-5 text-left text-xs font-sans font-bold uppercase tracking-widest text-zinc-400">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 bg-black/20">
            {isLoading
              ? [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
              : entries.map((e, idx) => {
                const style = RANK_STYLES[e.rank] ?? null;
                return (
                  <motion.tr
                    key={e.teamName}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1, duration: 0.4 }}
                    className="transition-colors hover:bg-white/5 group relative"
                    style={{
                      background: style ? style.bg : 'transparent',
                    }}
                  >
                    {style && (
                      <td className="absolute left-0 top-0 bottom-0 w-1 rounded-r shadow-[0_0_10px_currentColor] z-20" style={{ backgroundColor: style.border }} />
                    )}
                    <td className="px-6 py-5 font-bold text-xl w-24">
                      {style ? style.medal : (
                        <span className="text-zinc-600 font-sans text-sm">{e.rank < 10 ? `0${e.rank}` : e.rank}</span>
                      )}
                    </td>
                    <td className="px-6 py-5 font-bold text-zinc-100 truncate">
                      <DecryptedText text={e.teamName} delay={0.1 + (idx * 0.1)} />
                    </td>
                    <td className="px-6 py-5 text-zinc-400 font-mono text-sm">
                      <DecryptedText text={e.r1 || '00'} delay={0.3 + (idx * 0.1)} />
                    </td>
                    <td className="px-6 py-5 text-zinc-400 font-mono text-sm">
                      <DecryptedText text={e.r2 || '00'} delay={0.4 + (idx * 0.1)} />
                    </td>
                    <td className="px-6 py-5 text-zinc-400 font-mono text-sm">
                      <DecryptedText text={e.r3 || '00'} delay={0.5 + (idx * 0.1)} />
                    </td>
                    <td className="px-6 py-5 w-36 relative">
                      <span className="font-black text-lg absolute inset-y-0 left-6 flex items-center text-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,0.5)] group-hover:scale-110 transition-transform origin-left">
                        <DecryptedText text={e.total} delay={0.6 + (idx * 0.1)} />
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
