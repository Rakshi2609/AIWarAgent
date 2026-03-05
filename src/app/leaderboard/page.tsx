'use client';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchLeaderboard } from '../../store/slices/leaderboardSlice';
import PageWrapper from '../../components/PageWrapper';
import LeaderboardTable from '../../components/LeaderboardTable';
import { motion } from 'framer-motion';
import { Trophy, RefreshCw, AlertCircle } from 'lucide-react';

export default function LeaderboardPage() {
  const dispatch = useAppDispatch();
  const { entries, status, error } = useAppSelector((state) => state.leaderboard);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchLeaderboard());
    }
  }, [status, dispatch]);

  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(fetchLeaderboard());
    }, 5000);
    return () => clearInterval(interval);
  }, [dispatch]);

  const isLoading = status === 'loading' || status === 'idle';

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 relative"
        >
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest mb-4 border border-white/10"
              style={{ background: 'var(--bg-elevated)', color: 'var(--accent-light)' }}>
              <Trophy size={14} className="text-amber-500" />
              Live Rankings Matrix
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight uppercase flex items-center gap-3">
              <span className="w-2 h-8 bg-red-600 rounded-sm" />
              Leaderboard
            </h1>
            <p className="text-sm mt-3 font-sans text-zinc-400">
              Auto-updating global intelligence ranking based on neural sync evaluation.
            </p>
          </div>

          <button
            onClick={() => dispatch(fetchLeaderboard())}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all w-fit bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-zinc-300 hover:text-white disabled:opacity-50 hover:scale-[1.02] shadow-lg group"
          >
            <RefreshCw size={14} className={`${isLoading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} text-amber-500`} />
            {isLoading ? 'Syncing...' : 'Force Sync'}
          </button>
        </motion.div>

        {/* Error State */}
        {status === 'error' && (
          <div className="flex items-center gap-3 p-4 rounded-xl text-sm mb-8 border border-red-500/30 bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
            <AlertCircle size={18} className="text-red-400 shrink-0" />
            <span className="text-red-100 font-medium">{error}</span>
            <button
              onClick={() => dispatch(fetchLeaderboard())}
              className="ml-auto underline text-xs font-bold text-red-300 hover:text-red-100 transition-colors uppercase tracking-wider">
              Retry Sync
            </button>
          </div>
        )}

        {/* Table */}
        <div style={{ filter: isLoading ? 'grayscale(0.4) opacity(0.6)' : 'none', transition: 'all 0.5s ease' }}>
          <LeaderboardTable entries={entries} isLoading={isLoading} />
        </div>
      </div>
    </PageWrapper>
  );
}
