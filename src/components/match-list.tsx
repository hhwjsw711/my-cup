import { FlatList, StyleSheet, View } from 'react-native';

import { MatchCard } from '@/components/match-card';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { Match } from '@/types/match';

export function MatchList({
  matches,
  bottomInset,
}: {
  matches: Match[];
  bottomInset: number;
}) {
  if (matches.length === 0) {
    return (
      <View style={styles.empty}>
        <ThemedText themeColor="textSecondary">当天暂无比赛</ThemedText>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.list}
      data={matches}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <MatchCard match={item} />}
      contentContainerStyle={[styles.content, { paddingBottom: bottomInset }]}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  content: {
    gap: Spacing.two,
    paddingTop: Spacing.two,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: Spacing.six,
  },
});
