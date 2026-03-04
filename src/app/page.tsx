"use client";
import Link from 'next/link';

export default function Home() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white px-8 py-14 shadow-lg">
        <div className="max-w-xl">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full mb-4">
            Live Event
          </span>
          <h1 className="text-4xl font-extrabold leading-tight">AI Hackathon 2026</h1>
          <p className="mt-3 text-indigo-100 text-lg">
            Build, submit, and compete. Log in to submit your project links for each round and track your scores live.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/login"
              className="px-5 py-2.5 bg-white text-indigo-700 font-semibold rounded-full shadow hover:bg-indigo-50 transition-colors"
            >
              Team Login
            </Link>
            <Link
              href="/leaderboard"
              className="px-5 py-2.5 bg-white/20 text-white font-semibold rounded-full hover:bg-white/30 transition-colors"
            >
              View Leaderboard
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white rounded-2xl border shadow-sm px-8 py-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6">How it works</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { step: '01', title: 'Login', desc: 'Login with your team name and leader name.' },
            { step: '02', title: 'Submit', desc: 'Paste your Google Drive link for each round.' },
            { step: '03', title: 'Score', desc: 'Judges score in Google Sheets — live leaderboard.' },
          ].map(({ step, title, desc }) => (
            <div key={step} className="flex gap-4">
              <span className="text-3xl font-black text-indigo-100 shrink-0">{step}</span>
              <div>
                <h3 className="font-semibold text-gray-800">{title}</h3>
                <p className="text-sm text-gray-500 mt-1">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
