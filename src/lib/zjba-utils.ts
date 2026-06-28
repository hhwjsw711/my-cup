import { MatchBucket } from '@/types/match';
import { ZJBAMatch, ZJBAScheduleMatch, ZJBAScores } from '@/types/zjba';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function getMatchBucket(kickoff: Date, now: Date = new Date()): MatchBucket {
  const diffDays = Math.round(
    (startOfDay(kickoff).getTime() - startOfDay(now).getTime()) / MS_PER_DAY,
  );
  if (diffDays === 0) return 'today';
  return diffDays < 0 ? 'past' : 'upcoming';
}

function parseMatchDate(date: string, time: string): Date {
  const [year, month, day] = date.split('-').map(Number);
  const [hours, minutes] = time.split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes);
}

function formatKickoffTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function buildMatches(
  schedule: Record<string, ZJBAScheduleMatch[]>,
  scores: ZJBAScores,
  now: Date,
): ZJBAMatch[] {
  const matches: ZJBAMatch[] = [];

  for (const [city, cityMatches] of Object.entries(schedule)) {
    for (const raw of cityMatches) {
      const kickoff = parseMatchDate(raw.date, raw.time);
      const scoreData = scores[raw.id];
      const hasScore =
        scoreData != null && scoreData.home != null && scoreData.away != null;
      matches.push({
        id: raw.id,
        city,
        kickoff,
        kickoffTime: formatKickoffTime(kickoff),
        home: raw.home,
        away: raw.away,
        format: raw.format,
        round: raw.round,
        venue: raw.venue,
        score: hasScore
          ? { home: scoreData.home!, away: scoreData.away! }
          : { home: 0, away: 0 },
        hasScore,
        bucket: getMatchBucket(kickoff, now),
      });
    }
  }

  return matches;
}

export function groupByBucket(matches: ZJBAMatch[]): Record<MatchBucket, ZJBAMatch[]> {
  const grouped: Record<MatchBucket, ZJBAMatch[]> = { past: [], today: [], upcoming: [] };
  for (const match of matches) {
    grouped[match.bucket].push(match);
  }
  grouped.past.sort((a, b) => b.kickoff.getTime() - a.kickoff.getTime());
  grouped.today.sort((a, b) => a.kickoff.getTime() - b.kickoff.getTime());
  grouped.upcoming.sort((a, b) => a.kickoff.getTime() - b.kickoff.getTime());
  return grouped;
}

export function filterByCity(matches: ZJBAMatch[], city: string | null): ZJBAMatch[] {
  if (!city) return matches;
  return matches.filter((m) => m.city === city);
}

export function getCities(schedule: Record<string, ZJBAScheduleMatch[]>): string[] {
  return Object.keys(schedule);
}
