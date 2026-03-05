'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle, AlertCircle, ExternalLink, Loader2 } from 'lucide-react';
import { useAppDispatch } from '../store';
import { updateSubmission } from '../store/slices/teamSlice';

interface Props {
    existingLinks: Record<string, string>;
}

const ROUNDS = [1, 2, 3] as const;

export default function SubmitForm({ existingLinks }: Props) {
    const dispatch = useAppDispatch();
    const [round, setRound] = useState<1 | 2 | 3>(1);
    const [link, setLink] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setStatus('loading');
        setErrorMsg('');

        try {
            const res = await fetch('/api/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ round, link }),
            });
            const data = await res.json();

            if (!res.ok) {
                setErrorMsg(data.error ?? 'Submission failed');
                setStatus('error');
                return;
            }

            dispatch(updateSubmission({ round, link }));
            setStatus('success');
            setLink('');
        } catch {
            setErrorMsg('Network error. Please try again.');
            setStatus('error');
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-8 border border-white/5 relative overflow-hidden"
            style={{ background: 'var(--bg-card)' }}
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-3xl pointer-events-none" />

            <h2 className="text-xl font-black mb-6 flex items-center gap-2 text-white uppercase tracking-tight">
                <span className="w-2 h-6 bg-red-600 rounded-sm" />
                Submit Protocol
            </h2>

            {/* Round selector */}
            <div className="flex gap-2 mb-8 bg-black/40 p-1.5 rounded-xl border border-white/5">
                {ROUNDS.map((r) => (
                    <button
                        key={r}
                        onClick={() => { setRound(r); setStatus('idle'); }}
                        className="flex-1 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 relative overflow-hidden"
                        style={{
                            color: round === r ? '#fff' : 'var(--text-secondary)',
                        }}
                    >
                        {round === r && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute inset-0 bg-red-600 rounded-lg -z-10"
                            />
                        )}
                        <span className="relative z-10 flex items-center justify-center gap-1.5 font-sans uppercase tracking-wider text-xs">
                            Phase {r}
                            {existingLinks[r] && (
                                <span className="text-red-300 text-[10px] ml-1">✓</span>
                            )}
                        </span>
                    </button>
                ))}
            </div>

            {/* Existing link */}
            {existingLinks[round] && (
                <div className="flex items-center gap-3 mb-5 px-4 py-3.5 rounded-xl text-xs border border-green-500/20 bg-green-500/5 transition-all">
                    <CheckCircle size={14} className="text-green-500 shrink-0" />
                    <span className="text-zinc-300">Intel successfully transmitted for Phase {round}</span>
                    <a href={existingLinks[round]} target="_blank" rel="noreferrer"
                        className="ml-auto flex items-center gap-1 font-semibold text-zinc-400 hover:text-green-400 transition-colors uppercase tracking-wider text-[10px]">
                        Verify <ExternalLink size={12} />
                    </a>
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
                        Data Uplink URL (GDrive)
                    </label>
                    <input
                        type="url"
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        placeholder="https://drive.google.com/..."
                        required
                        className="w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all font-mono"
                        style={{
                            background: 'var(--bg-elevated)',
                            border: '1px solid var(--border-subtle)',
                            color: 'var(--text-primary)',
                        }}
                        onFocus={(e) => {
                            e.target.style.borderColor = 'rgba(239, 68, 68, 0.5)';
                            e.target.style.boxShadow = '0 0 15px rgba(220, 38, 38, 0.1)';
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = 'var(--border-subtle)';
                            e.target.style.boxShadow = 'none';
                        }}
                    />
                </div>

                {status === 'error' && (
                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-xs border border-red-500/20 bg-red-500/10">
                        <AlertCircle size={14} className="text-red-400" />
                        <span className="text-red-200">{errorMsg}</span>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-xs border border-green-500/20 bg-green-500/10">
                        <CheckCircle size={14} className="text-green-400" />
                        <span className="text-green-200">Transmission successful for Phase {round}.</span>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm tracking-wide uppercase transition-all hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 bg-red-600 hover:bg-red-500 text-white shadow-[0_4px_20px_rgba(220,38,38,0.25)] hover:shadow-[0_4px_25px_rgba(220,38,38,0.4)]"
                >
                    {status === 'loading' ? (
                        <><Loader2 size={16} className="animate-spin" /> Transmitting…</>
                    ) : (
                        <><Send size={16} /> Execute Phase {round} Upload</>
                    )}
                </button>
            </form>
        </motion.div>
    );
}
