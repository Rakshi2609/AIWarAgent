export interface LeaderboardEntry {
  team: string;
  r1: number;
  r2: number;
  r3: number;
  total: number;
}

export interface ScoreCriteria {
  architecture: number;
  innovation: number;
  technical: number;
  presentation: number;
}

export interface ScoreBreakdown {
  team: string;
  round: string;
  criteria: ScoreCriteria;
  subtotal: number;
}

export interface Team {
  team: string;
  leader?: string;
}
