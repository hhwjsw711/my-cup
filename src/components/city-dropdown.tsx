import { useEffect, useState } from 'react';
import { FlatList, Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useZJBAStore } from '@/store/use-zjba-store';

export function CityDropdown() {
  const [visible, setVisible] = useState(false);
  const cities = useZJBAStore((s) => s.cities);
  const selectedCity = useZJBAStore((s) => s.selectedCity);
  const setSelectedCity = useZJBAStore((s) => s.setSelectedCity);
  const insets = useSafeAreaInsets();

  const handleSelect = (city: string) => {
    setSelectedCity(city);
    setVisible(false);
  };

  useEffect(() => {
    if (!visible || Platform.OS !== 'web') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setVisible(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [visible]);

  return (
    <>
      <Pressable
        onPress={() => setVisible(true)}
        style={({ pressed }) => [styles.trigger, pressed && styles.pressed]}>
        <ThemedText type="smallBold" style={styles.triggerText}>
          {selectedCity}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          ▾
        </ThemedText>
      </Pressable>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}>
        <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
          <View style={[styles.sheet, { paddingBottom: insets.bottom + Spacing.three }]}>
            <ThemedView type="backgroundElement" style={styles.sheetInner}>
              <FlatList
                data={cities}
                keyExtractor={(item) => item}
                contentContainerStyle={{ paddingBottom: Spacing.three }}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => handleSelect(item)}
                    style={({ pressed }) => [
                      styles.option,
                      item === selectedCity && styles.optionSelected,
                      pressed && styles.pressed,
                    ]}>
                    <ThemedText
                      type="default"
                      style={item === selectedCity && { fontWeight: '700' }}>
                      {item}
                    </ThemedText>
                    {item === selectedCity && (
                      <ThemedText themeColor="textSecondary">✓</ThemedText>
                    )}
                  </Pressable>
                )}
              />
            </ThemedView>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.one,
  },
  triggerText: {
    fontSize: 16,
  },
  pressed: {
    opacity: 0.7,
  },
  overlay: {
    flex: 1,
    backgroundColor: '#00000066',
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '60%',
  },
  sheetInner: {
    borderTopLeftRadius: Spacing.three,
    borderTopRightRadius: Spacing.three,
    padding: Spacing.three,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.two,
  },
  optionSelected: {
    backgroundColor: '#208AEF1a',
  },
});
