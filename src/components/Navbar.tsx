'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Trophy, Send, LayoutDashboard, LogOut, Flame } from 'lucide-react';

export default function Navbar() {
  const { data: session } = useSession();
  // @ts-expect-error custom field
  const teamName = session?.user?.teamName as string | undefined;

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className="glass sticky top-0 z-50 border-b border-red-900/30 bg-black/70 backdrop-blur-xl"
    >
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg border border-red-500/30 flex items-center justify-center transition-all group-hover:scale-110 group-hover:border-red-400 bg-red-950/40 shadow-[0_0_15px_rgba(220,38,38,0.15)] group-hover:shadow-[0_0_20px_rgba(220,38,38,0.3)]">
            <Flame size={16} className="text-red-500 transition-transform group-hover:scale-110" />
          </div>
          <span className="font-sans font-black text-xl tracking-tight text-white uppercase flex items-center gap-1 group-hover:text-red-50 transition-colors">
            AI<span className="text-red-500">WAR</span>
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-zinc-800 text-zinc-400 bg-zinc-900/80">
            SYS_V.26
          </span>
        </Link>

        <div className="hidden sm:flex items-center gap-1 font-sans font-medium text-sm">
          <NavLink href="/leaderboard" icon={<Trophy size={16} />}>Leaderboard</NavLink>
          {session && (
            <>
              <NavLink href="/submit" icon={<Send size={16} />}>Uplink</NavLink>
              <NavLink href="/dashboard" icon={<LayoutDashboard size={16} />}>Terminal</NavLink>
            </>
          )}
        </div>

        <div className="flex items-center gap-4">
          {session ? (
            <>
              {session.user?.image && (
                <Image
                  src={session.user.image}
                  alt="avatar"
                  width={32}
                  height={32}
                  className="rounded-full border border-red-500/50 shadow-[0_0_10px_rgba(220,38,38,0.2)]"
                />
              )}
              <span className="hidden md:block text-sm font-medium text-zinc-300">
                {teamName ?? session.user?.name}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wide border border-zinc-800 text-zinc-400 hover:bg-red-500/10 hover:text-red-400 transition-all hover:border-red-500/50"
              >
                <LogOut size={14} /> Disconnect
              </button>
            </>
          ) : (
            <Link href="/login"
              className="px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all bg-red-600 hover:bg-red-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_30px_rgba(220,38,38,0.5)] hover:-translate-y-0.5"
            >
              Initialize Override
            </Link>
          )}
        </div>
      </div>
    </motion.nav>
  );
}

function NavLink({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Link href={href}
      className="flex items-center gap-2 px-4 py-2 rounded-lg text-zinc-400 hover:text-white transition-all hover:bg-white/5 border border-transparent hover:border-white/10"
    >
      {icon} {children}
    </Link>
  );
}
