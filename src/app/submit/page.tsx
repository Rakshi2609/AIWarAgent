'use client';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Link as LinkIcon, ShieldAlert } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchTeamData } from '../../store/slices/teamSlice';
import PageWrapper from '../../components/PageWrapper';
import SubmitForm from '../../components/SubmitForm';

export default function SubmitPage() {
  const dispatch = useAppDispatch();
  const { submissions, status } = useAppSelector((state) => state.team);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchTeamData());
    }
  }, [status, dispatch]);

  const isLoading = status === 'loading' || status === 'idle';

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 relative z-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest mb-4 border border-white/10"
            style={{ background: 'var(--bg-elevated)', color: 'var(--accent-light)' }}>
            <Send size={14} className="text-red-500" /> Secure Uplink
          </div>
          <h1 className="text-4xl font-black mb-3 text-white tracking-tight uppercase flex items-center gap-3">
            <span className="w-2 h-8 bg-red-600 rounded-sm" />
            Project Transmission
          </h1>
          <p className="text-sm font-sans text-zinc-400">
            Establish a secure connection and transmit your Google Drive payload for evaluation.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-[1fr_300px] gap-8">
          {/* Main Form Area */}
          <div className="relative">
            {isLoading ? (
              <div className="card h-96 p-8 flex items-center justify-center flex-col gap-4 border border-white/5 bg-black/60 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent pointer-events-none" />
                <div className="w-10 h-10 rounded-full border-[3px] border-zinc-800 border-t-red-500 animate-spin z-10" />
                <p className="text-sm font-bold uppercase tracking-widest text-zinc-500 z-10">Initializing Uplink...</p>
              </div>
            ) : (
              <SubmitForm existingLinks={submissions} />
            )}
          </div>

          {/* Guidelines Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-6 h-fit border border-white/5 relative overflow-hidden group hover:border-red-500/20 transition-colors"
            style={{ background: 'var(--bg-elevated)' }}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 blur-2xl group-hover:bg-red-500/10 transition-colors pointer-events-none" />

            <h3 className="font-bold text-sm mb-5 flex items-center gap-2 uppercase tracking-widest text-white">
              <ShieldAlert size={16} className="text-red-500" />
              Directives
            </h3>

            <ul className="space-y-5 relative z-10">
              {[
                { title: 'Data Format', desc: 'System only accepts valid Google Drive endpoints.' },
                { title: 'Clearance', desc: 'Set payload permissions to "Anyone with the link can view".' },
                { title: 'Overrides', desc: 'Resubmissions permitted until the operational window closes.' },
              ].map(({ title, desc }) => (
                <li key={title} className="pl-3 border-l-[1.5px] border-zinc-800 hover:border-red-500/50 transition-colors py-1">
                  <p className="text-xs font-bold text-zinc-200 uppercase tracking-wide">
                    {title}
                  </p>
                  <p className="text-xs mt-1.5 leading-relaxed text-zinc-500">
                    {desc}
                  </p>
                </li>
              ))}
            </ul>

            <div className="mt-8 pt-6 border-t border-white/10 relative z-10">
              <p className="text-[10px] uppercase font-bold tracking-widest mb-3 text-zinc-600">Valid Target Protocol</p>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-mono break-all bg-black/50 border border-white/5 text-zinc-400 group-hover:border-red-500/20 transition-colors">
                <LinkIcon size={12} className="shrink-0 text-red-500/50" />
                drive.google.com/drive/folders/1a2...
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  );
}
