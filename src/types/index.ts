// ─── Scoring ──────────────────────────────────────────────────────────────────
export interface ScoreCriteria {
  architecture: number;
  innovation: number;
  technical: number;
  presentation: number;
}

export interface RoundScore {
  round: 1 | 2 | 3;
  criteria: ScoreCriteria;
  total: number;
}

export interface ScoreBreakdown {
  teamName: string;
  rounds: RoundScore[];
  grandTotal: number;
}

// ─── Leaderboard ──────────────────────────────────────────────────────────────
export interface LeaderboardEntry {
  rank: number;
  teamName: string;
  r1: number;
  r2: number;
  r3: number;
  total: number;
}

// ─── Team / Auth ──────────────────────────────────────────────────────────────
export interface Team {
  teamName: string;
  leaderName: string;
  email: string;
}

export interface UserSession {
  teamName: string;
  leaderName: string;
  email: string;
  image?: string;
}

// ─── Submissions ──────────────────────────────────────────────────────────────
export interface Submission {
  round: 1 | 2 | 3;
  link: string;
  submittedAt?: string;
}
