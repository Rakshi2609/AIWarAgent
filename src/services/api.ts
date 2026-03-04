import { LeaderboardEntry, ScoreBreakdown, Team } from '../types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '';

async function handleResponse(res: Response) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const url = `${API_BASE}?action=leaderboard`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch leaderboard');
  return handleResponse(res);
}

export async function loginTeam(team: string, leader: string): Promise<{ success: boolean } | any> {
  const url = `${API_BASE}?action=login`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ team, leader }),
  });
  if (!res.ok) throw new Error('Login failed');
  return handleResponse(res);
}

export async function fetchTeam(team: string): Promise<ScoreBreakdown[] | any> {
  const url = `${API_BASE}?action=team&team=${encodeURIComponent(team)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch team data');
  return handleResponse(res);
}

export async function submitProject(team: string, round: string, link: string): Promise<any> {
  const url = `${API_BASE}?action=submit`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ team, round, link }),
  });
  if (!res.ok) throw new Error('Submission failed');
  return handleResponse(res);
}
