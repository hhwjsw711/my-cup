import { Image } from "expo-image";
import { FlexAlignType, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { Match, Team } from "@/types/match";

function TeamRow({
  team,
  alignment,
}: {
  team: Team;
  alignment: FlexAlignType | undefined;
}) {
  return (
    <View style={[styles.teamRow, { alignItems: "center" }]}>
      {team.flag ? (
        <Image
          source={{ uri: team.flag }}
          style={styles.flag}
          contentFit="cover"
          transition={150}
        />
      ) : (
        <View style={[styles.flag, styles.flagPlaceholder]} />
      )}
      <ThemedText type="default" numberOfLines={1} style={styles.teamName}>
        {team.name}
      </ThemedText>
    </View>
  );
}

export function MatchCard({ match }: { match: Match }) {
  const scoreLabel = match.hasScore
    ? `${match.score.home} - ${match.score.away}`
    : "vs";

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <View style={styles.teams}>
        <TeamRow team={match.home} alignment="flex-start" />
        <View style={styles.meta}>
          {match.hasScore ? (
            <ThemedText type="default" style={styles.score}>
              {scoreLabel}
            </ThemedText>
          ) : (
            <ThemedText type="small" themeColor="textSecondary">
              {scoreLabel}
            </ThemedText>
          )}
          <ThemedText type="smallBold">{match.kickoffTime}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {match.group} 组
          </ThemedText>
        </View>
        <TeamRow team={match.away} alignment="flex-end" />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  teams: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Spacing.two,
  },
  teamRow: {
    gap: Spacing.two,
    width: "33%",
  },
  flag: {
    width: 28,
    height: 20,
    borderRadius: 3,
    backgroundColor: "#0000001a",
  },
  flagPlaceholder: {
    opacity: 0.4,
  },
  teamName: {
    flexShrink: 1,
  },
  meta: {
    alignItems: "center",
    gap: Spacing.half,
  },
  score: {
    fontSize: 18,
    fontWeight: "700",
  },
});
