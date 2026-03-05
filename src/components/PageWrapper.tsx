'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

const pageVariants = {
    initial: { opacity: 0, scale: 0.98, filter: 'blur(10px)' },
    animate: { opacity: 1, scale: 1, filter: 'blur(0px)', transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
    exit: { opacity: 0, scale: 1.02, filter: 'blur(10px)', transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } }
};

export default function PageWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={pathname}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="w-full flex-1 relative"
            >
                {/* Premium subtle scanline overlay */}
                <div className="absolute inset-0 pointer-events-none z-50 mix-blend-overlay opacity-30"
                    style={{ backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.4) 50%)', backgroundSize: '100% 4px' }} />

                {/* Subtle red ambient glow at edges */}
                <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-red-600/5 to-transparent pointer-events-none z-0 mix-blend-screen" />
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-red-600/5 to-transparent pointer-events-none z-0 mix-blend-screen" />

                {children}
            </motion.div>
        </AnimatePresence>
    );
}
