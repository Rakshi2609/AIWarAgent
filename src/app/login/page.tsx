'use client';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, Chrome, Lock, ShieldCheck } from 'lucide-react';
import PageWrapper from '../../components/PageWrapper';

export default function LoginPage() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) router.push('/dashboard');
  }, [session, router]);

  return (
    <PageWrapper>
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-full max-w-md relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
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

            <button
              onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold text-sm transition-all border border-red-500/30 mb-8 text-zinc-100 uppercase tracking-widest bg-red-600/10 hover:bg-red-600 hover:text-white hover:border-red-500 hover:scale-[1.02] shadow-[0_0_20px_rgba(220,38,38,0.1)] hover:shadow-[0_0_30px_rgba(220,38,38,0.3)]"
            >
              <Chrome size={18} className="text-current" />
              Establish Identity
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

          <p className="text-center text-[10px] uppercase font-sans font-semibold tracking-wider mt-8 text-zinc-600">
            Unregistered node connection request? <span className="text-red-500/80">Access Denied.</span>
          </p>
        </div>
      </div>
    </PageWrapper>
  );
}
