import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { ZJBAMatch } from '@/types/zjba';

const AVATAR_COLORS = [
  '#4A90D9', '#E85D75', '#2EAC68', '#E8A838', '#7B68EE',
  '#D9558A', '#3D9EA0', '#E8763C', '#5E5CE6', '#1DAF8E',
  '#CF3A4A', '#3E92CC', '#7FB069', '#9B59B6', '#D4538E',
];

function avatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function TeamAvatar({ name }: { name: string }) {
  const initial = name.charAt(0);
  const bg = avatarColor(name);
  return (
    <View style={[styles.avatar, { backgroundColor: bg }]}>
      <ThemedText style={styles.avatarText}>{initial}</ThemedText>
    </View>
  );
}

function CityBadge({ city }: { city: string }) {
  return (
    <ThemedView type="backgroundSelected" style={styles.badge}>
      <ThemedText type="small" themeColor="textSecondary">
        {city}
      </ThemedText>
    </ThemedView>
  );
}

export function ZJBAMatchCard({
  match,
  showCity,
}: {
  match: ZJBAMatch;
  showCity: boolean;
}) {
  const scoreLabel = match.hasScore
    ? `${match.score.home} - ${match.score.away}`
    : 'vs';

  const label = match.round || match.format;

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <View style={styles.row}>
        <View style={[styles.team, styles.teamLeft]}>
          <TeamAvatar name={match.home} />
          <ThemedText type="default" numberOfLines={1} style={styles.teamName}>
            {match.home}
          </ThemedText>
        </View>
        <View style={styles.scoreBox}>
          <ThemedText type="default" style={styles.score}>
            {scoreLabel}
          </ThemedText>
          <ThemedText type="smallBold">{match.kickoffTime}</ThemedText>
        </View>
        <View style={[styles.team, styles.teamRight]}>
          <ThemedText type="default" numberOfLines={1} style={styles.teamName}>
            {match.away}
          </ThemedText>
          <TeamAvatar name={match.away} />
        </View>
      </View>
      <View style={styles.labelRow}>
        <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
          {label}
        </ThemedText>
      </View>
      {showCity && (
        <View style={styles.cityRow}>
          <CityBadge city={match.city} />
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: Spacing.two + 2,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.one,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  team: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two - 2,
  },
  teamLeft: {
    justifyContent: 'flex-start',
  },
  teamRight: {
    justifyContent: 'flex-end',
  },
  teamName: {
    flexShrink: 1,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  scoreBox: {
    width: 64,
    alignItems: 'center',
    gap: Spacing.one - 1,
  },
  score: {
    fontSize: 18,
    fontWeight: '700',
  },
  labelRow: {
    alignItems: 'center',
  },
  cityRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  badge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one - 2,
    borderRadius: Spacing.one,
  },
});
