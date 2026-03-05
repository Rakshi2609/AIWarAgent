'use client';
import { motion } from 'framer-motion';
import { Cpu, Lightbulb, Code2, Presentation, ShieldAlert } from 'lucide-react';
import { RoundScore } from '../types';

const CRITERIA_META = [
  { key: 'architecture' as const, label: 'SYS_ARCH', icon: Cpu, color: '#f87171' }, // red-400
  { key: 'innovation' as const, label: 'N_NOVATION', icon: Lightbulb, color: '#fbbf24' }, // amber-400
  { key: 'technical' as const, label: 'TECH_IMPL', icon: Code2, color: '#a1a1aa' }, // zinc-400
  { key: 'presentation' as const, label: 'DATA_PRES', icon: Presentation, color: '#ef4444' }, // red-500
];

const MAX_SCORE = 25;
const ROUND_LABELS = ['', 'PHASE_01', 'PHASE_02', 'PHASE_03'];

interface Props {
  round: RoundScore;
  index?: number;
}

export default function ScoreCard({ round, index = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="card relative p-7 bg-black/60 border-white/5 overflow-hidden group hover:border-red-500/30"
    >
      {/* Background Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Decorative corner accents */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-red-500/30 rounded-tl-xl opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-x-2 -translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-red-500/30 rounded-br-xl opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-8 pb-4 border-b border-white/10 group-hover:border-red-500/20 transition-colors">
        <h3 className="font-sans font-bold text-sm tracking-widest text-zinc-300 flex items-center gap-2">
          <ShieldAlert size={14} className="text-red-500" />
          {ROUND_LABELS[round.round]}
        </h3>
        <div className="flex items-end gap-1.5 font-sans">
          <span className="text-[10px] text-zinc-500 uppercase font-semibold mb-1">Score_Val</span>
          <span className="text-3xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] group-hover:text-red-500 group-hover:drop-shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all">
            {round.total}
          </span>
          <span className="text-xs text-zinc-600 font-bold mb-1.5">/{MAX_SCORE * 4}</span>
        </div>
      </div>

      {/* Criteria Segmented Meters */}
      <div className="relative z-10 space-y-6">
        {CRITERIA_META.map(({ key, label, icon: Icon, color }) => {
          const score = round.criteria[key];
          const pct = Math.min((score / MAX_SCORE) * 100, 100);
          const segments = 10;
          const activeSegments = Math.round((pct / 100) * segments);

          return (
            <div key={key}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon size={14} style={{ color }} className="opacity-90" />
                  <span className="text-xs font-sans font-bold tracking-wider text-zinc-400">{label}</span>
                </div>
                <span className="text-xs font-sans font-bold text-zinc-200">
                  {score}<span className="text-zinc-600">/{MAX_SCORE}</span>
                </span>
              </div>

              <div className="flex gap-1 h-2.5">
                {[...Array(segments)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scaleY: 0 }}
                    animate={{ opacity: i < activeSegments ? 1 : 0.15, scaleY: 1 }}
                    transition={{ delay: 0.2 + (i * 0.04), duration: 0.2 }}
                    className="flex-1 rounded-[1px]"
                    style={{
                      background: i < activeSegments ? color : 'var(--bg-elevated)',
                      boxShadow: i < activeSegments ? `0 0 10px ${color}40` : 'none'
                    }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
