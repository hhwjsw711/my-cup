import { MatchBucket } from '@/types/match';

export interface ZJBAScheduleMatch {
  id: string;
  date: string;
  time: string;
  home: string;
  away: string;
  format: string;
  round: string;
  venue: string;
}

export interface ZJBAScores {
  [matchId: string]: {
    home: number | null;
    away: number | null;
  };
}

export interface ZJBAMatch {
  id: string;
  city: string;
  kickoff: Date;
  kickoffTime: string;
  home: string;
  away: string;
  format: string;
  round: string;
  venue: string;
  score: { home: number; away: number };
  hasScore: boolean;
  bucket: MatchBucket;
}

export const ALL_CITIES = '全部城市' as const;
