import localScores from '@/data/zjba-scores.json';
import { ZJBAScores } from '@/types/zjba';

const SCORES_URL =
  'https://raw.githubusercontent.com/hhwjsw711/my-cup/main/scores.json';

export async function fetchScores(): Promise<ZJBAScores> {
  if (__DEV__) {
    return localScores as ZJBAScores;
  }
  try {
    const response = await fetch(`${SCORES_URL}?t=${Date.now()}`);
    if (!response.ok) return {};
    return (await response.json()) as ZJBAScores;
  } catch {
    return {};
  }
}

export { SCORES_URL };
