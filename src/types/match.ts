/**
 * Types for the FIFA World Cup 2026 data.
 *
 * Source: https://github.com/rezarahiminia/worldcup2026
 *
 * We read the pre-formatted JSON exports shipped in the repo (no auth required)
 * instead of the live `worldcup26.ir` API (which needs a JWT bearer token). The
 * `Raw*` shapes below mirror those files exactly, so swapping to the authed
 * endpoints later is mostly a drop-in change.
 */

/** A single match exactly as it appears in `football.matches.json`. */
export interface RawMatch {
  _id: { $oid: string };
  id: string;
  home_team_id: string;
  away_team_id: string;
  home_score: string;
  away_score: string;
  home_scorers: string | null;
  away_scorers: string | null;
  group: string;
  matchday: string;
  /** Kickoff in local time, formatted `MM/DD/YYYY HH:mm`, e.g. "06/25/2026 13:00". */
  local_date: string;
  persian_date: string;
  stadium_id: string;
  finished: 'TRUE' | 'FALSE';
  time_elapsed: 'notstarted' | 'live' | 'finished' | (string & {});
  type: 'group' | 'r32' | 'r16' | 'qf' | 'sf' | 'third' | 'final' | (string & {});
  /** Embedded team names — present on the live API, absent in the static fixtures. */
  home_team_name_en?: string;
  home_team_name_fa?: string;
  away_team_name_en?: string;
  away_team_name_fa?: string;
}

/** A team exactly as it appears in `football.teams.json`. */
export interface RawTeam {
  _id: { $oid: string };
  name_en: string;
  name_fa: string;
  flag: string;
  fifa_code: string;
  iso2: string;
  groups: string;
  id: string;
}

/** Which day-bucket a match falls into, relative to "today". */
export type MatchBucket = 'past' | 'today' | 'upcoming';

/** A normalized team used throughout the UI. */
export interface Team {
  id: string;
  name: string;
  fifaCode: string;
  flag: string;
}

/**
 * A match after we join it with team data and parse the kickoff date.
 * This is what the store exposes and the UI renders.
 */
export interface Match {
  id: string;
  home: Team;
  away: Team;
  /** Parsed kickoff timestamp. */
  kickoff: Date;
  /** Pre-formatted kickoff time, e.g. "1:00 PM". */
  kickoffTime: string;
  /** Goals for each side (0-0 before kickoff). */
  score: { home: number; away: number };
  /** True once the match is live or finished, so the score reflects real play. */
  hasScore: boolean;
  group: string;
  bucket: MatchBucket;
}
