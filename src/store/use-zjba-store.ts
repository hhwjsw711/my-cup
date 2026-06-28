import { create } from 'zustand';

import scheduleData from '@/data/zjba-schedule.json';
import { fetchScores } from '@/lib/zjba-api';
import {
  buildMatches,
  filterByCity,
  getCities,
  groupByBucket,
} from '@/lib/zjba-utils';
import { ALL_CITIES, ZJBAMatch, ZJBAScheduleMatch } from '@/types/zjba';
import { MatchBucket } from '@/types/match';

export const BUCKET_ORDER: readonly MatchBucket[] = ['past', 'today', 'upcoming'];
export const BUCKET_LABELS: Record<MatchBucket, string> = {
  past: '已结束',
  today: '今天',
  upcoming: '即将开始',
};

const EMPTY_GROUPS: Record<MatchBucket, ZJBAMatch[]> = { past: [], today: [], upcoming: [] };

type Status = 'idle' | 'loading' | 'success' | 'error';

const SCHEDULE = scheduleData as Record<string, ZJBAScheduleMatch[]>;
const CITIES = [ALL_CITIES, ...getCities(SCHEDULE)];

interface ZJBAState {
  status: Status;
  error: string | null;
  cities: readonly string[];
  selectedCity: string;
  grouped: Record<MatchBucket, ZJBAMatch[]>;
  selectedBucket: MatchBucket;
  _allMatches: ZJBAMatch[];
  fetchMatches: () => Promise<void>;
  setSelectedCity: (city: string) => void;
  setSelectedBucket: (bucket: MatchBucket) => void;
}

export const useZJBAStore = create<ZJBAState>((set, get) => ({
  status: 'idle',
  error: null,
  cities: CITIES,
  selectedCity: ALL_CITIES,
  grouped: EMPTY_GROUPS,
  selectedBucket: 'today',

  setSelectedCity: (selectedCity) => {
    const state = get();
    if (state.status !== 'success') {
      set({ selectedCity });
      return;
    }
    const allMatches = get()._allMatches;
    if (!allMatches) return;
    const filtered = filterByCity(allMatches, selectedCity === ALL_CITIES ? null : selectedCity);
    set({ selectedCity, grouped: groupByBucket(filtered) });
  },

  setSelectedBucket: (selectedBucket) => set({ selectedBucket }),

  fetchMatches: async () => {
    if (get().status === 'loading') return;
    set({ status: 'loading', error: null });

    try {
      const scores = await fetchScores();
      const now = new Date();
      const allMatches = buildMatches(SCHEDULE, scores, now);
      const filtered = filterByCity(
        allMatches,
        get().selectedCity === ALL_CITIES ? null : get().selectedCity,
      );
      set({
        _allMatches: allMatches,
        grouped: groupByBucket(filtered),
        status: 'success',
      });
    } catch (error) {
      set({
        status: 'error',
        error: error instanceof Error ? error.message : '加载失败，请重试',
      });
    }
  },

  _allMatches: [] as ZJBAMatch[],
}));
