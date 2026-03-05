'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, Shield, BarChart3, Terminal } from 'lucide-react';
import { useState, useEffect } from 'react';

const features = [
    { icon: Shield, title: 'Secure Protocol', desc: 'Encrypted OAuth node access restricted to verified leaders.' },
    { icon: BarChart3, title: 'Live Telemetry', desc: 'Direct neural link to Google Sheets for real-time score injection.' },
    { icon: Zap, title: 'Auto Sequencing', desc: 'Leaderboard matrix recalculates instantly upon data shift.' },
];

function TypewriterText({ text, delay = 0 }: { text: string; delay?: number }) {
    const [displayedText, setDisplayedText] = useState('');

    useEffect(() => {
        let i = 0;
        const timer = setTimeout(() => {
            const interval = setInterval(() => {
                if (i <= text.length) {
                    setDisplayedText(text.slice(0, i));
                    i++;
                } else {
                    clearInterval(interval);
                }
            }, 30);
            return () => clearInterval(interval);
        }, delay * 1000);
        return () => clearTimeout(timer);
    }, [text, delay]);

    return (
        <span className="font-mono relative">
            <span className="opacity-0">{text}</span>
            <span className="absolute left-0 top-0 text-sky-300/80">{displayedText}</span>
            <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="inline-block w-2 h-4 bg-sky-400 ml-1 translate-y-1"
            />
        </span>
    );
}

export default function HeroSection() {
    return (
        <section className="relative overflow-hidden rounded-3xl min-h-[500px] flex flex-col justify-center px-4 md:px-12 py-16 mt-8 border border-sky-900/40 bg-black/20 backdrop-blur-sm"
            style={{ boxShadow: 'inset 0 0 100px rgba(56, 189, 248, 0.05)' }}>

            {/* Holographic scanning line */}
            <motion.div
                animate={{ top: ['-10%', '110%'] }}
                transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
                className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-sky-400 to-transparent opacity-20 blur-sm pointer-events-none z-0"
            />

            <div className="relative z-10 max-w-3xl">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-3 px-4 py-2 text-[10px] font-mono uppercase tracking-[0.3em] mb-8 border-l-2 border-sky-400 bg-sky-900/10 text-sky-400"
                >
                    <Terminal size={14} className="animate-pulse text-sky-300" />
                    Neural Evaluation Protocol v2.0
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, filter: 'blur(0px)' }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="text-5xl md:text-7xl font-black leading-[1.05] tracking-tight mb-6 drop-shadow-2xl uppercase font-mono"
                >
                    <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">Deploy.</span><br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-violet-500 drop-shadow-[0_0_30px_rgba(56,189,248,0.4)]">Dominate.</span>
                </motion.h1>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2, delay: 0.6 }}
                    className="text-sm md:text-base mb-10 max-w-xl h-12"
                >
                    <TypewriterText text="Initiate telemetric sync. Submit your codebase, await judge node synchronization, and track live global rankings." delay={0.6} />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.5 }}
                    className="flex flex-wrap gap-4"
                >
                    <Link href="/login"
                        className="group relative inline-flex items-center gap-2 px-8 py-3.5 font-bold text-sm transition-all duration-300 border border-sky-400/50 bg-sky-900/20 uppercase tracking-widest text-sky-100 overflow-hidden"
                    >
                        <div className="absolute inset-0 w-full h-full bg-sky-400/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                        <span className="relative z-10 flex items-center gap-2">Authenticate Node <ArrowRight size={16} /></span>
                        <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-sky-300" />
                        <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-sky-300" />
                    </Link>
                    <Link href="/leaderboard"
                        className="group relative inline-flex items-center gap-2 px-8 py-3.5 font-mono font-semibold text-sm transition-all duration-300 text-sky-400/70 hover:text-sky-300 uppercase tracking-widest"
                    >
                        <span className="group-hover:translate-x-1 transition-transform">Access Matrix // Leaderboard</span>
                    </Link>
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="relative z-10 mt-16 grid grid-cols-1 md:grid-cols-3 gap-4"
            >
                {features.map(({ icon: Icon, title, desc }) => (
                    <div key={title}
                        className="glass flex flex-col gap-2 p-5 rounded-2xl hover:border-sky-400/50 transition-colors"
                    >
                        <Icon size={20} className="text-sky-400" />
                        <p className="text-sm font-bold text-white tracking-wide">{title}</p>
                        <p className="text-xs text-sky-200/50 leading-relaxed">{desc}</p>
                    </div>
                ))}
            </motion.div>
        </section>
    );
}
