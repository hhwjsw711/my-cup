import { RawMatch, RawTeam } from '@/types/match';

/**
 * World Cup 2026 data layer.
 *
 * We use the live API (`https://worldcup26.ir`), which serves real, up-to-date
 * results: finished matches include actual scores and scorers. Each endpoint
 * wraps its payload in a single key (`{ games }`, `{ teams }`), unwrapped here.
 *
 * The repo also ships static JSON fixtures on raw.githubusercontent.com, but
 * those are a pre-tournament seed (every match 0-0 / notstarted), so we don't
 * use them. If the live API ever starts enforcing the documented JWT, add an
 * `Authorization: Bearer <jwt>` header inside `getJson`.
 */
const API_BASE = 'https://worldcup26.ir';

const GAMES_URL = `${API_BASE}/get/games`;
const TEAMS_URL = `${API_BASE}/get/teams`;

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`请求失败 (${response.status}) — ${url}`);
  }
  return (await response.json()) as T;
}

export async function fetchRawMatches(): Promise<RawMatch[]> {
  const { games } = await getJson<{ games: RawMatch[] }>(GAMES_URL);
  return games;
}

export async function fetchRawTeams(): Promise<RawTeam[]> {
  const { teams } = await getJson<{ teams: RawTeam[] }>(TEAMS_URL);
  return teams;
}
