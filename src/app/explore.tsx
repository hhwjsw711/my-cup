import { SegmentedControl } from '@expo/ui/community/segmented-control';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CityDropdown } from '@/components/city-dropdown';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ZJBAMatchCard } from '@/components/zjba-match-card';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { ALL_CITIES } from '@/types/zjba';
import {
  BUCKET_LABELS,
  BUCKET_ORDER,
  useZJBAStore,
} from '@/store/use-zjba-store';

function BucketSegments() {
  const [mounted, setMounted] = useState(false);
  const selectedBucket = useZJBAStore((s) => s.selectedBucket);
  const setSelectedBucket = useZJBAStore((s) => s.setSelectedBucket);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <ThemedView type="backgroundElement" style={styles.segmentedPh} />;
  }

  return (
    <SegmentedControl
      values={BUCKET_ORDER.map((bucket) => BUCKET_LABELS[bucket])}
      selectedIndex={BUCKET_ORDER.indexOf(selectedBucket)}
      onChange={(event) =>
        setSelectedBucket(BUCKET_ORDER[event.nativeEvent.selectedSegmentIndex])
      }
      tintColor="#208AEF"
      style={styles.segmented}
    />
  );
}

export default function ZJBAScreen() {
  const status = useZJBAStore((s) => s.status);
  const error = useZJBAStore((s) => s.error);
  const selectedCity = useZJBAStore((s) => s.selectedCity);
  const matches = useZJBAStore((s) => s.grouped[s.selectedBucket]);
  const fetchMatches = useZJBAStore((s) => s.fetchMatches);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const showCity = selectedCity === ALL_CITIES;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ThemedText type="subtitle" style={styles.title}>
          浙BA
        </ThemedText>

        <CityDropdown />

        <BucketSegments />

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
            <FlatList
              style={styles.list}
              data={matches}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <ZJBAMatchCard match={item} showCity={showCity} />
              )}
              contentContainerStyle={[styles.listContent, { paddingBottom: BottomTabInset }]}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.center}>
                  <ThemedText themeColor="textSecondary">当天暂无比赛</ThemedText>
                </View>
              }
            />
          )}
        </View>
      </SafeAreaView>
    </ThemedView>
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
  segmentedPh: {
    height: 36,
    width: '100%',
    borderRadius: Spacing.three,
  },
  segmented: {
    width: '100%',
    minHeight: 36,
  },
  body: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  listContent: {
    gap: Spacing.three,
    paddingTop: Spacing.three,
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
