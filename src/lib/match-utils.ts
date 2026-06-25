import { Match, MatchBucket, RawMatch, RawTeam, Team } from '@/types/match';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/**
 * Parse the API's `MM/DD/YYYY HH:mm` local date into a `Date`.
 * We parse the parts by hand because `new Date(string)` is unreliable across
 * JS engines (notably Hermes) for non-ISO formats.
 */
export function parseLocalDate(localDate: string): Date {
  const [datePart, timePart = '00:00'] = localDate.trim().split(' ');
  const [month, day, year] = datePart.split('/').map(Number);
  const [hours, minutes] = timePart.split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes);
}

/** Midnight (local) for a given date — lets us compare calendar days. */
function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * Bucket a kickoff relative to `now`:
 *  - `today`    → same calendar day
 *  - `past`     → any day before today (most recent being yesterday)
 *  - `upcoming` → any day after today (nearest being tomorrow)
 */
export function getMatchBucket(kickoff: Date, now: Date = new Date()): MatchBucket {
  const diffDays = Math.round(
    (startOfDay(kickoff).getTime() - startOfDay(now).getTime()) / MS_PER_DAY,
  );
  if (diffDays === 0) return 'today';
  return diffDays < 0 ? 'past' : 'upcoming';
}

/** Format a 24h date into a friendly 12h time, e.g. "1:00 PM". */
function formatKickoffTime(date: Date): string {
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const period = date.getHours() >= 12 ? 'PM' : 'AM';
  const hours = date.getHours() % 12 || 12;
  return `${hours}:${minutes} ${period}`;
}

/** Build an id → Team lookup so we can join matches with their teams. */
export function indexTeamsById(teams: RawTeam[]): Map<string, Team> {
  const index = new Map<string, Team>();
  for (const team of teams) {
    index.set(team.id, {
      id: team.id,
      name: team.name_en,
      fifaCode: team.fifa_code,
      flag: team.flag,
    });
  }
  return index;
}

/** Knockout matches can reference teams that aren't decided yet. */
function resolveTeam(id: string, teams: Map<string, Team>): Team {
  return teams.get(id) ?? { id, name: 'TBD', fifaCode: '', flag: '' };
}

/** Join a raw match with team data and compute its display fields + bucket. */
export function enrichMatch(raw: RawMatch, teams: Map<string, Team>, now: Date): Match {
  const kickoff = parseLocalDate(raw.local_date);
  const hasScore =
    raw.finished === 'TRUE' || raw.time_elapsed === 'live' || raw.time_elapsed === 'finished';
  return {
    id: raw.id,
    home: resolveTeam(raw.home_team_id, teams),
    away: resolveTeam(raw.away_team_id, teams),
    kickoff,
    kickoffTime: formatKickoffTime(kickoff),
    score: { home: Number(raw.home_score) || 0, away: Number(raw.away_score) || 0 },
    hasScore,
    group: raw.group,
    bucket: getMatchBucket(kickoff, now),
  };
}

/**
 * Split matches into past / today / upcoming, sorted for display:
 * past is newest-first, today and upcoming are earliest-first.
 */
export function groupMatchesByBucket(matches: Match[]): Record<MatchBucket, Match[]> {
  const grouped: Record<MatchBucket, Match[]> = { past: [], today: [], upcoming: [] };
  for (const match of matches) {
    grouped[match.bucket].push(match);
  }
  grouped.past.sort((a, b) => b.kickoff.getTime() - a.kickoff.getTime());
  grouped.today.sort((a, b) => a.kickoff.getTime() - b.kickoff.getTime());
  grouped.upcoming.sort((a, b) => a.kickoff.getTime() - b.kickoff.getTime());
  return grouped;
}
