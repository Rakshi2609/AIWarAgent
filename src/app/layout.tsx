import './globals.css';
import Navbar from '../components/Navbar';

export const metadata = {
  title: 'AI Hackathon Portal',
  description: 'Submit projects and view leaderboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
        <Navbar />
        <main className="max-w-5xl mx-auto px-4 py-10">{children}</main>
        <footer className="border-t mt-16 py-6 text-center text-sm text-gray-400">
          AI Hackathon Portal &mdash; Built with Next.js &amp; Google Sheets
        </footer>
      </body>
    </html>
  );
}
