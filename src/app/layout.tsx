import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '../components/Navbar';
import StoreProvider from '../components/StoreProvider';
import SessionProviderWrapper from '../components/SessionProviderWrapper';


const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'AI War 2026 — Hackathon Portal',
  description: 'Submit projects, track scores, and view live leaderboard for AI War 2026.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} style={{ colorScheme: 'dark' }}>
      <body className="bg-black text-white min-h-screen relative selection:bg-purple-900/50">
        <SessionProviderWrapper>
          <StoreProvider>

            <div className="relative z-10 flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-10 relative">
                {children}
              </main>
              <footer className="border-t py-8 text-center text-xs mt-auto glass-footer">
                <p className="text-gray-400">AI War 2026 &mdash; Evaluation Portal</p>
                <p className="mt-1 text-gray-500">Powered by Next.js &amp; Three.js</p>
              </footer>
            </div>
          </StoreProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
