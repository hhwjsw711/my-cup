import Head from 'expo-router/head';
import { useEffect } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MatchList } from '@/components/match-list';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { BUCKET_LABELS, BUCKET_ORDER, useMatchesStore } from '@/store/use-matches-store';

function BucketPill({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => pressed && styles.pressed}>
      <ThemedView
        type={selected ? 'backgroundSelected' : 'backgroundElement'}
        style={styles.pill}>
        <ThemedText
          type={selected ? 'smallBold' : 'small'}
          themeColor={selected ? 'text' : 'textSecondary'}>
          {label}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

export default function HomeScreen() {
  const status = useMatchesStore((state) => state.status);
  const error = useMatchesStore((state) => state.error);
  const selectedBucket = useMatchesStore((state) => state.selectedBucket);
  const setSelectedBucket = useMatchesStore((state) => state.setSelectedBucket);
  const matches = useMatchesStore((state) => state.grouped[state.selectedBucket]);
  const fetchMatches = useMatchesStore((state) => state.fetchMatches);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  return (
    <>
      <Head>
        <title>Sport — 世界杯赛程</title>
        <meta name="description" content="2026 世界杯赛程追踪，已结束、今天、即将开始的比赛实时比分" />
      </Head>
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
          <ThemedText type="subtitle" style={styles.title}>
            2026 世界杯
          </ThemedText>

          <ThemedView type="backgroundElement" style={styles.pillBar}>
            <View style={styles.pillRow}>
              {BUCKET_ORDER.map((bucket) => (
                <BucketPill
                  key={bucket}
                  label={BUCKET_LABELS[bucket]}
                  selected={selectedBucket === bucket}
                  onPress={() => setSelectedBucket(bucket)}
                />
              ))}
            </View>
          </ThemedView>

          <View style={styles.body}>
            {status === 'loading' ? (
              <View style={styles.center}>
                <ActivityIndicator />
              </View>
            ) : status === 'error' ? (
              <View style={styles.center}>
                <ThemedText themeColor="textSecondary" style={styles.errorText}>
                  {error ?? '加载失败，请检查网络'}
                </ThemedText>
                <Pressable
                  onPress={fetchMatches}
                  style={({ pressed }) => pressed && styles.pressed}>
                  <ThemedView type="backgroundElement" style={styles.retryButton}>
                    <ThemedText type="smallBold">重试</ThemedText>
                  </ThemedView>
                </Pressable>
              </View>
            ) : (
              <MatchList matches={matches} bottomInset={BottomTabInset} />
            )}
          </View>
        </SafeAreaView>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.three,
    gap: Spacing.three,
  },
  title: {
    paddingTop: Spacing.two,
  },
  pillBar: {
    padding: Spacing.half,
    borderRadius: Spacing.five,
    flexDirection: 'row',
  },
  pillRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    flex: 1,
  },
  pill: {
    flex: 1,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.five,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    paddingBottom: Spacing.six,
  },
  errorText: {
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.five,
  },
  pressed: {
    opacity: 0.7,
  },
});
