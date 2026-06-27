import { create } from 'zustand';

import { enrichMatch, groupMatchesByBucket, indexTeamsById } from '@/lib/match-utils';
import { fetchRawMatches, fetchRawTeams } from '@/lib/worldcup-api';
import { Match, MatchBucket } from '@/types/match';

type Status = 'idle' | 'loading' | 'success' | 'error';

/** Tab order + labels for the segmented control. */
export const BUCKET_ORDER: readonly MatchBucket[] = ['past', 'today', 'upcoming'];
export const BUCKET_LABELS: Record<MatchBucket, string> = {
  past: '已结束',
  today: '今天',
  upcoming: '即将开始',
};

const EMPTY_GROUPS: Record<MatchBucket, Match[]> = { past: [], today: [], upcoming: [] };

interface MatchesState {
  status: Status;
  error: string | null;
  /** Matches pre-grouped by bucket so selectors return stable references. */
  grouped: Record<MatchBucket, Match[]>;
  /** Which bucket the segmented control currently shows. */
  selectedBucket: MatchBucket;
  fetchMatches: () => Promise<void>;
  setSelectedBucket: (bucket: MatchBucket) => void;
}

export const useMatchesStore = create<MatchesState>((set, get) => ({
  status: 'idle',
  error: null,
  grouped: EMPTY_GROUPS,
  selectedBucket: 'today',

  setSelectedBucket: (selectedBucket) => set({ selectedBucket }),

  fetchMatches: async () => {
    // Don't fire a second request while one is already in flight.
    if (get().status === 'loading') return;
    set({ status: 'loading', error: null });

    try {
      const [rawMatches, rawTeams] = await Promise.all([fetchRawMatches(), fetchRawTeams()]);
      const teams = indexTeamsById(rawTeams);
      const now = new Date();
      const matches = rawMatches.map((raw) => enrichMatch(raw, teams, now));
      set({ grouped: groupMatchesByBucket(matches), status: 'success' });
    } catch (error) {
      set({
        status: 'error',
        error: error instanceof Error ? error.message : '加载失败，请重试',
      });
    }
  },
}));
