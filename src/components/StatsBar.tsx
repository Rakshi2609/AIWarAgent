'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Users, Trophy, Layers, Brain } from 'lucide-react';

const stats = [
    { icon: Users, label: 'Competing Teams', value: 24, suffix: '+' },
    { icon: Layers, label: 'Rounds', value: 3, suffix: '' },
    { icon: Brain, label: 'Scoring Categories', value: 4, suffix: '' },
    { icon: Trophy, label: 'Prizes', value: 3, suffix: '' },
];

function Counter({ to }: { to: number }) {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true });

    useEffect(() => {
        if (!inView) return;
        let start = 0;
        const step = to / 40;
        const timer = setInterval(() => {
            start += step;
            if (start >= to) { setCount(to); clearInterval(timer); }
            else setCount(Math.floor(start));
        }, 30);
        return () => clearInterval(timer);
    }, [inView, to]);

    return <span ref={ref}>{count}</span>;
}

export default function StatsBar() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 my-12"
        >
            {stats.map(({ icon: Icon, label, value, suffix }, i) => (
                <motion.div
                    key={label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.4 }}
                    className="card p-5 flex flex-col items-center text-center hover:border-[var(--border-bright)] transition-all duration-300"
                    style={{ background: 'var(--bg-card)' }}
                >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                        style={{ background: 'var(--accent-soft)' }}>
                        <Icon size={20} style={{ color: 'var(--accent-light)' }} />
                    </div>
                    <p className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
                        <Counter to={value} />{suffix}
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{label}</p>
                </motion.div>
            ))}
        </motion.div>
    );
}
