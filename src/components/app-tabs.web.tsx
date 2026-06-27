import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import { Pressable, View, StyleSheet, useColorScheme } from 'react-native';

import { ThemedText } from './themed-text';

import { Colors, MaxContentWidth, Spacing } from '@/constants/theme';

export default function AppTabs() {
  return (
    <Tabs style={{ flex: 1 }}>
      <TabSlot style={{ flex: 1 }} />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="home" href="/" asChild>
            <TabButton>世界杯</TabButton>
          </TabTrigger>
          <TabTrigger name="explore" href="/explore" asChild>
            <TabButton>浙BA</TabButton>
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

export function TabButton({ children, isFocused, ...props }: TabTriggerSlotProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme ?? 'light'];

  return (
    <Pressable {...props} style={({ pressed }) => pressed && styles.pressed}>
      <View
        style={[
          styles.tabButtonView,
          isFocused && { backgroundColor: colors.backgroundSelected },
        ]}>
        <ThemedText
          type={isFocused ? 'smallBold' : 'small'}
          themeColor={isFocused ? 'text' : 'textSecondary'}>
          {children}
        </ThemedText>
      </View>
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme ?? 'light'];

  return (
    <View
      {...props}
      style={[styles.tabListContainer, { backgroundColor: colors.backgroundElement }]}>
      <View style={styles.innerContainer}>{props.children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabListContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    paddingTop: Spacing.one,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  innerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
    maxWidth: MaxContentWidth,
  },
  tabButtonView: {
    flex: 1,
    paddingVertical: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Spacing.five,
    marginHorizontal: Spacing.three,
  },
  pressed: {
    opacity: 0.7,
  },
});
