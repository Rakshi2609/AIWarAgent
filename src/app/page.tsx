'use client';
import dynamic from 'next/dynamic';
import PageWrapper from '../components/PageWrapper';
import { motion } from 'framer-motion';
import { Shield, Radio, Crosshair } from 'lucide-react';

// Dynamic import — keeps R3F/Three out of SSR bundle
const TerminatorHeroSection = dynamic(
  () => import('../components/TerminatorHeroSection'),
  { ssr: false, loading: () => <div className="min-h-screen bg-black" /> }
);

const steps = [
  {
    icon: Shield,
    step: '01',
    title: 'Authenticate',
    desc: 'Bypass security. Only registered field operatives can establish connection.',
    color: '#ef4444', // red-500
  },
  {
    icon: Radio,
    step: '02',
    title: 'Uplink',
    desc: 'Transmit encrypted payload (Google Drive link) before the operational deadline.',
    color: '#a1a1aa', // zinc-400
  },
  {
    icon: Crosshair,
    step: '03',
    title: 'Evaluate',
    desc: 'System ranks your submission across 4 core metrics. Leaderboard updates in real-time.',
    color: '#fbbf24', // amber-400
  },
];

export default function Home() {
  return (
    <>
      {/* Full-viewport Terminator hero — outside PageWrapper so it bleeds edge-to-edge */}
      <div className="w-screen -ml-[50vw] relative left-1/2 right-1/2" style={{ marginTop: '-2.5rem' }}>
        <TerminatorHeroSection />
      </div>

      {/* Remaining page content */}
      <PageWrapper>
        <div className="space-y-6 pt-10">
          {/* How it works */}
          <section>
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-2xl font-black mb-8 flex items-center gap-3 text-white uppercase tracking-tight"
            >
              <span className="w-8 h-1 bg-red-600 rounded-full" />
              Operational Protocol
            </motion.h2>
            <div className="grid md:grid-cols-3 gap-6">
              {steps.map(({ icon: Icon, step, title, desc, color }, i) => (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12, duration: 0.4 }}
                  className="card p-6 border border-white/5 hover:border-red-500/30 transition-all duration-300 group"
                  style={{ background: 'var(--bg-card)' }}
                >
                  <div className="flex items-start gap-4 relative">
                    <div className="relative shrink-0 mt-1">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center relative z-10 transition-transform group-hover:scale-110"
                        style={{ background: `${color}15`, border: `1px solid ${color}30` }}
                      >
                        <Icon size={18} style={{ color }} className="drop-shadow-[0_0_8px_currentColor]" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold mb-2 text-lg text-white group-hover:text-red-400 transition-colors uppercase tracking-wide">
                        <span className="text-xs text-zinc-500 mr-2 font-mono">{step}</span>
                        {title}
                      </h3>
                      <p className="text-sm leading-relaxed text-zinc-400 group-hover:text-zinc-300 transition-colors">
                        {desc}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Scoring info */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="card p-8 mt-4 border border-white/5 relative overflow-hidden group"
            style={{ background: 'var(--bg-card)' }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-3xl group-hover:bg-red-500/10 transition-colors" />

            <h2 className="text-lg font-bold mb-6 text-white uppercase tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Evaluation Matrix
            </h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Architecture', color: '#f87171', desc: 'System design & scale capabilities' },
                { label: 'Innovation', color: '#fbbf24', desc: 'Novelty & tactical creativity' },
                { label: 'Implementation', color: '#a1a1aa', desc: 'Code efficiency & function' },
                { label: 'Presentation', color: '#ef4444', desc: 'Clarity of intelligence' },
              ].map(({ label, color, desc }) => (
                <div key={label} className="p-5 rounded-xl border border-white/5 hover:border-red-500/20 transition-colors" style={{ background: 'var(--bg-elevated)' }}>
                  <div className="w-2 h-2 rounded-sm mb-3 shadow-[0_0_5px_currentColor]" style={{ background: color }} />
                  <p className="text-sm font-bold text-zinc-100 uppercase tracking-wide">{label}</p>
                  <p className="text-xs mt-1.5 text-zinc-500">{desc}</p>
                </div>
              ))}
            </div>
          </motion.section>
        </div>
      </PageWrapper>
    </>
  );
}
