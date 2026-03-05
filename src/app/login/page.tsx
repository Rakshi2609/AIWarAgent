'use client';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Chrome, Lock, ShieldCheck, UserPlus, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import PageWrapper from '../../components/PageWrapper';

export default function LoginPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Form State
  const [teamName, setTeamName] = useState('');
  const [leaderName, setLeaderName] = useState('');
  const [email, setEmail] = useState('');
  const [members, setMembers] = useState(['', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (session) router.push('/dashboard');
  }, [session, router]);

  const handleMemberChange = (index: number, value: string) => {
    const newMembers = [...members];
    newMembers[index] = value;
    setMembers(newMembers);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const filteredMembers = members.filter(m => m.trim() !== '');
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ teamName, leaderName, email, members: filteredMembers }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setSuccessMsg('Registry added successfully. Proceed to Establish Identity.');
      setMode('login');
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageWrapper>
      <div className="min-h-[80vh] flex items-center justify-center py-12">
        <div className="w-full max-w-md relative z-10">
          <AnimatePresence mode="wait">
            {mode === 'login' ? (
              <motion.div
                key="login-card"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                transition={{ duration: 0.3 }}
                className="card p-8 text-center relative overflow-hidden backdrop-blur-3xl bg-black/60 border-white/10 group"
              >
                <div className="absolute top-0 right-0 p-3 text-[9px] font-sans font-black tracking-widest text-red-500/50 uppercase">SEC//AUTH_INIT</div>
                <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full opacity-[0.15] pointer-events-none group-hover:opacity-30 transition-opacity"
                  style={{ background: 'radial-gradient(circle, #ef4444, transparent 70%)' }} />

                <div className="relative w-16 h-16 mx-auto mb-6 flex items-center justify-center border border-red-500/30 rounded-2xl group-hover:border-red-500/60 transition-colors"
                  style={{ background: 'rgba(239, 68, 68, 0.05)', boxShadow: '0 0 40px rgba(220, 38, 38, 0.15)' }}>
                  <Flame size={28} className="text-red-500 group-hover:scale-110 transition-transform" />
                </div>

                <h1 className="text-2xl font-black mb-1.5 uppercase tracking-widest text-white drop-shadow-md flex justify-center items-center gap-2">
                  System<span className="text-red-500">Override</span>
                </h1>
                <p className="text-xs mb-8 font-sans font-semibold text-zinc-400 tracking-wider">
                  AI WAR 2026 // UPLINK SECURED
                </p>

                {successMsg && (
                  <div className="mb-6 p-3 rounded-lg text-xs border border-green-500/30 bg-green-500/10 text-green-300 font-sans font-medium">
                    {successMsg}
                  </div>
                )}

                <button
                  onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold text-sm transition-all border border-red-500/30 mb-4 text-zinc-100 uppercase tracking-widest bg-red-600/10 hover:bg-red-600 hover:text-white hover:border-red-500 hover:scale-[1.02] shadow-[0_0_20px_rgba(220,38,38,0.1)] hover:shadow-[0_0_30px_rgba(220,38,38,0.3)]"
                >
                  <Chrome size={18} className="text-current" />
                  Establish Identity
                </button>

                <button
                  onClick={() => setMode('register')}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all border border-white/10 mb-8 text-zinc-300 uppercase tracking-widest hover:bg-white/5 hover:text-white hover:border-white/20"
                >
                  <UserPlus size={16} />
                  Register Node
                </button>

                <div className="space-y-3 text-left">
                  <div className="flex items-start gap-3 px-4 py-3 rounded-lg text-xs border border-white/5 bg-white/5 text-zinc-400 font-sans font-medium transition-colors hover:border-white/10">
                    <Lock size={14} className="text-red-400 shrink-0 mt-0.5" />
                    <span>RESTRICTED LOGS: Handshake requires registered clearance.</span>
                  </div>
                  <div className="flex items-start gap-3 px-4 py-3 rounded-lg text-xs border border-white/5 bg-white/5 text-zinc-400 font-sans font-medium transition-colors hover:border-white/10">
                    <ShieldCheck size={14} className="text-red-400 shrink-0 mt-0.5" />
                    <span>SECURE ENCLAVE: End-to-end telemetry isolation enforced.</span>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="register-card"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                transition={{ duration: 0.3 }}
                className="card p-8 relative overflow-hidden backdrop-blur-3xl bg-black/60 border-white/10"
              >
                <div className="absolute top-0 right-0 p-3 text-[9px] font-sans font-black tracking-widest text-red-500/50 uppercase">SEC//AUTH_REG</div>

                <button
                  onClick={() => setMode('login')}
                  className="flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors uppercase tracking-widest mb-6"
                >
                  <ArrowLeft size={14} /> Back to Uplink
                </button>

                <h2 className="text-xl font-black mb-6 uppercase tracking-widest text-white flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-red-600 rounded-sm" />
                  Register Node
                </h2>

                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">Team Name</label>
                    <input
                      required
                      value={teamName}
                      onChange={e => setTeamName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all font-mono bg-white/5 border border-white/10 text-white focus:border-red-500/50 focus:shadow-[0_0_15px_rgba(220,38,38,0.1)]"
                      placeholder="e.g. Neural Nexus"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">Leader Name</label>
                    <input
                      required
                      value={leaderName}
                      onChange={e => setLeaderName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all font-mono bg-white/5 border border-white/10 text-white focus:border-red-500/50 focus:shadow-[0_0_15px_rgba(220,38,38,0.1)]"
                      placeholder="Leader Name"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">Google Email (Required for Identity)</label>
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all font-mono bg-white/5 border border-white/10 text-white focus:border-red-500/50 focus:shadow-[0_0_15px_rgba(220,38,38,0.1)]"
                      placeholder="leader@gmail.com"
                    />
                  </div>

                  <div className="pt-2">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Additional Operatives (Optional)</label>
                    {members.map((m, idx) => (
                      <input
                        key={idx}
                        value={m}
                        onChange={e => handleMemberChange(idx, e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all font-mono bg-white/5 border border-white/10 text-white focus:border-red-500/50 focus:shadow-[0_0_15px_rgba(220,38,38,0.1)] mb-2"
                        placeholder={`Member ${idx + 2} Name`}
                      />
                    ))}
                  </div>

                  {errorMsg && (
                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-xs border border-red-500/20 bg-red-500/10">
                      <AlertCircle size={14} className="text-red-400" />
                      <span className="text-red-200">{errorMsg}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 py-3.5 mt-2 rounded-xl font-bold text-sm tracking-wide uppercase transition-all hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed bg-red-600 hover:bg-red-500 text-white shadow-[0_4px_20px_rgba(220,38,38,0.2)]"
                  >
                    {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                    {isSubmitting ? 'Registering...' : 'Initialize Registry'}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageWrapper>
  );
}
