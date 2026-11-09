import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Group, Header, Screen, SwitchRow, T, tap } from '@/components/ui';
import { ThemeMode, radius, useTheme } from '@/lib/theme';
import { useStore } from '@/lib/store';

const OPTIONS: { key: ThemeMode; label: string; bg: string; fg: string; card: string }[] = [
  { key: 'light', label: 'Light', bg: '#EEEBE6', fg: '#111', card: '#fff' },
  { key: 'dark', label: 'Dark', bg: '#000', fg: '#fff', card: '#1C1C1E' },
  { key: 'system', label: 'Automatic', bg: '#EEEBE6', fg: '#111', card: '#1C1C1E' },
];

export default function Appearance() {
  const { mode, setMode, colors } = useTheme();
  const { settings, updateSettings } = useStore();
  return (
    <Screen edges={['top', 'bottom']}>
      <Header title="Appearance" />
      <View style={styles.row}>
        {OPTIONS.map((o) => {
          const active = mode === o.key;
          return (
            <Pressable key={o.key} onPress={() => { tap(); setMode(o.key); }} style={{ flex: 1, alignItems: 'center', gap: 10 }}
              accessibilityRole="radio" accessibilityState={{ selected: active }}>
              <View style={[styles.preview, { backgroundColor: o.bg, borderColor: active ? colors.text : colors.border }]}>
                {o.key === 'system' && <View style={[StyleSheet.absoluteFill, { left: '50%', backgroundColor: '#000', borderTopRightRadius: 14, borderBottomRightRadius: 14 }]} />}
                <View style={[styles.bar, { backgroundColor: o.card }]} />
                <View style={[styles.bar, { backgroundColor: o.card, width: '60%' }]} />
                <View style={[styles.pill, { backgroundColor: o.key === 'dark' ? '#fff' : '#111' }]} />
              </View>
              <T variant="callout" style={{ fontWeight: '600' }}>{o.label}</T>
              <Ionicons name={active ? 'checkmark-circle' : 'ellipse-outline'} size={22} color={active ? colors.text : colors.textTertiary} />
            </Pressable>
          );
        })}
      </View>
      <T variant="caption" color={colors.textSecondary} style={{ marginBottom: 22, marginHorizontal: 4 }}>
        Automatic follows your iPhone or Android system setting and switches at sunset if you've enabled it there.
      </T>
      <Group title="Feel">
        <SwitchRow icon="pulse-outline" title="Haptic feedback" subtitle="Subtle vibrations when tapping" value={settings.hapticFeedback} onChange={(v) => updateSettings({ hapticFeedback: v })} />
      </Group>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12, marginVertical: 16 },
  preview: { width: '100%', aspectRatio: 0.62, borderRadius: radius.md, borderWidth: 2, padding: 10, gap: 6, overflow: 'hidden', justifyContent: 'flex-end' },
  bar: { height: 14, borderRadius: 5 },
  pill: { height: 16, borderRadius: 8, width: '70%', alignSelf: 'center', marginTop: 6 },
});
