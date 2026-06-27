import { SegmentedControl } from '@expo/ui/community/segmented-control';
import Head from 'expo-router/head';
import { useEffect } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MatchList } from '@/components/match-list';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { BUCKET_LABELS, BUCKET_ORDER, useMatchesStore } from '@/store/use-matches-store';

export default function HomeScreen() {
  const theme = useTheme();

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
        <title>Sport</title>
        <meta name="description" content="FIFA World Cup 2026 match tracker — past, today, and upcoming matches with live scores" />
      </Head>
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
          <ThemedText type="subtitle" style={styles.title}>
            World Cup 2026
          </ThemedText>

          <SegmentedControl
            values={BUCKET_ORDER.map((bucket) => BUCKET_LABELS[bucket])}
            selectedIndex={BUCKET_ORDER.indexOf(selectedBucket)}
            onChange={(event) =>
              setSelectedBucket(BUCKET_ORDER[event.nativeEvent.selectedSegmentIndex])
            }
            tintColor={theme.backgroundSelected}
            style={styles.segmented}
          />

          <View style={styles.body}>
            {status === 'loading' ? (
              <View style={styles.center}>
                <ActivityIndicator />
              </View>
            ) : status === 'error' ? (
              <View style={styles.center}>
                <ThemedText themeColor="textSecondary" style={styles.errorText}>
                  {error ?? 'Could not load matches.'}
                </ThemedText>
                <Pressable
                  onPress={fetchMatches}
                  style={({ pressed }) => pressed && styles.pressed}>
                  <ThemedView type="backgroundElement" style={styles.retryButton}>
                    <ThemedText type="smallBold">Try again</ThemedText>
                  </ThemedView>
                </Pressable>
              </View>
            ) : (
              <MatchList matches={matches} bottomInset={BottomTabInset + Spacing.four} />
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
  segmented: {
    width: '100%',
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
