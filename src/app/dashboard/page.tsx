'use client';
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Award, Sparkles } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchTeamData } from '../../store/slices/teamSlice';
import PageWrapper from '../../components/PageWrapper';
import ScoreCard from '../../components/ScoreCard';

export default function DashboardPage() {
  const { data: session } = useSession();
  const dispatch = useAppDispatch();
  const { scores, status } = useAppSelector((state) => state.team);

  // @ts-expect-error custom NextAuth fields
  const teamName = session?.user?.teamName as string | undefined;

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchTeamData());
    }
  }, [status, dispatch]);

  const isLoading = status === 'loading' || status === 'idle';

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border border-white/5 relative overflow-hidden"
          style={{ background: 'var(--bg-card)' }}
        >
          <div className="absolute top-0 right-1/4 w-64 h-64 bg-red-500/5 blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest mb-4 border border-white/10"
              style={{ background: 'var(--bg-elevated)', color: 'var(--accent-light)' }}>
              <LayoutDashboard size={14} /> Intelligence Overview
            </div>
            <h1 className="text-3xl font-black mb-2 tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Welcome back, <span className="text-red-500">{teamName ?? 'Operative'}</span>
            </h1>
            <p className="text-sm font-sans text-zinc-400">
              Deep-dive metrics and performance evaluations across all operational phases.
            </p>
          </div>

          {/* Grand Total Badge */}
          <div className="flex flex-col items-end card p-6 relative overflow-hidden shrink-0 border border-white/10 group hover:border-red-500/30 transition-colors"
            style={{ background: 'var(--bg-elevated)' }}>
            <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Award size={100} style={{ color: 'var(--accent)' }} />
            </div>
            <p className="text-xs font-bold mb-1.5 uppercase tracking-widest flex items-center gap-1.5 z-10"
              style={{ color: 'var(--text-secondary)' }}>
              <Sparkles size={14} className="text-red-400" />
              Total Sync Value
            </p>
            <p className="text-5xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] group-hover:text-red-500 group-hover:drop-shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all z-10">
              {isLoading ? '...' : (scores?.grandTotal ?? 0)}
            </p>
          </div>
        </motion.div>

        {/* Rounds Breakdown */}
        {isLoading ? (
          <div className="grid md:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-6 h-64 border"
                style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
                <div className="shimmer h-6 w-1/3 rounded-md mb-6 bg-white/5" />
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="shimmer h-2 w-full rounded-md bg-white/5" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : !scores?.rounds?.length ? (
          <div className="card p-16 text-center border-white/5 bg-black/40 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6">
              <LayoutDashboard size={24} className="text-zinc-600" />
            </div>
            <p className="text-xl font-bold text-white mb-2">No intelligence available yet.</p>
            <p className="text-sm text-zinc-500 font-sans">Awaiting neural sync from operational judge nodes.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {scores.rounds.map((r, i) => (
              <motion.div
                key={r.round}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
              >
                <ScoreCard round={r} index={i} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
