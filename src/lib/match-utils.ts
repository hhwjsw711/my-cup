import { Match, MatchBucket, RawMatch, RawTeam, Team } from '@/types/match';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/**
 * Venue UTC offsets for June–July 2026 (summer DST in US/Canada).
 * Mexico abolished DST in 2022, so its cities stay at UTC-6 year-round.
 */
const VENUE_UTC_OFFSETS: Record<string, number> = {
  '1': -6,  // Mexico City (CST)
  '2': -6,  // Guadalajara (CST)
  '3': -6,  // Monterrey (CST)
  '4': -5,  // Dallas (CDT)
  '5': -5,  // Houston (CDT)
  '6': -5,  // Kansas City (CDT)
  '7': -4,  // Atlanta (EDT)
  '8': -4,  // Miami (EDT)
  '9': -4,  // Boston (EDT)
  '10': -4, // Philadelphia (EDT)
  '11': -4, // New York/New Jersey (EDT)
  '12': -4, // Toronto (EDT)
  '13': -7, // Vancouver (PDT)
  '14': -7, // Seattle (PDT)
  '15': -7, // San Francisco Bay Area (PDT)
  '16': -7, // Los Angeles (PDT)
};

/**
 * Parse the API's `MM/DD/YYYY HH:mm` venue-local date into a UTC-based `Date`.
 *
 * The API returns the kickoff in the **venue's local time** (e.g. 21:00 in
 * Vancouver = UTC-7). We convert to UTC so that bucketing (past / today /
 * upcoming) and display formatting use the device's local timezone via
 * `getHours()` / `getMinutes()` / `startOfDay()`.
 */
export function parseLocalDate(localDate: string, venueUtcOffset: number): Date {
  const [datePart, timePart = '00:00'] = localDate.trim().split(' ');
  const [month, day, year] = datePart.split('/').map(Number);
  const [hours, minutes] = timePart.split(':').map(Number);
  return new Date(Date.UTC(year, month - 1, day, hours - venueUtcOffset, minutes));
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

/** Format a 24h date to Chinese 24h time, e.g. "14:00". */
function formatKickoffTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
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
  return teams.get(id) ?? { id, name: '待定', fifaCode: '', flag: '' };
}

/** Join a raw match with team data and compute its display fields + bucket. */
export function enrichMatch(raw: RawMatch, teams: Map<string, Team>, now: Date): Match {
  const venueOffset = VENUE_UTC_OFFSETS[raw.stadium_id] ?? 0;
  const kickoff = parseLocalDate(raw.local_date, venueOffset);
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
