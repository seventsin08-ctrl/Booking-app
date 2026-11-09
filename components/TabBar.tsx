import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useStore } from '@/lib/store';
import { radius, useTheme } from '@/lib/theme';
import { IconName, tap } from './ui';

const TABS: Record<string, { label: string; icon: IconName; active: IconName }> = {
  index: { label: 'Explore', icon: 'search-outline', active: 'search' },
  wishlists: { label: 'Saved', icon: 'heart-outline', active: 'heart' },
  trips: { label: 'Trips', icon: 'calendar-clear-outline', active: 'calendar-clear' },
  inbox: { label: 'Inbox', icon: 'chatbubble-ellipses-outline', active: 'chatbubble-ellipses' },
  profile: { label: 'Profile', icon: 'person-circle-outline', active: 'person-circle' },
};

export const TAB_BAR_SPACE = 96;

export function TabBar({ state, navigation }: BottomTabBarProps) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { unreadMessages, unreadNotifications } = useStore();

  const inner = (
    <View style={styles.row}>
      {state.routes.map((route, i) => {
        const t = TABS[route.name];
        if (!t) return null;
        const focused = state.index === i;
        const badge = route.name === 'inbox' && unreadMessages + unreadNotifications > 0;
        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={t.label}
            onPress={() => {
              tap();
              const e = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!focused && !e.defaultPrevented) navigation.navigate(route.name);
            }}
            style={[styles.item, focused && { backgroundColor: colors.primary, paddingHorizontal: 16, flexGrow: 1.6 }]}
          >
            <View>
              <Ionicons name={focused ? t.active : t.icon} size={22} color={focused ? colors.onPrimary : colors.text} />
              {badge && <View style={[styles.badge, { backgroundColor: colors.accent, borderColor: colors.card }]} />}
            </View>
            {focused && <Text numberOfLines={1} style={{ color: colors.onPrimary, fontWeight: '600', fontSize: 14 }}>{t.label}</Text>}
          </Pressable>
        );
      })}
    </View>
  );

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom: Math.max(insets.bottom - 6, 10) }]}>
      <View style={[styles.bar, { borderColor: colors.border, shadowOpacity: isDark ? 0 : 0.1 }]}>
        {Platform.OS === 'ios' ? (
          <BlurView intensity={80} tint={isDark ? 'dark' : 'light'} style={[StyleSheet.absoluteFill, { backgroundColor: colors.glass }]} />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.card }]} />
        )}
        {inner}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 16, right: 16 },
  bar: {
    borderRadius: radius.pill, overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth,
    shadowColor: '#000', shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 10,
  },
  row: { flexDirection: 'row', alignItems: 'center', padding: 7, gap: 4 },
  item: { height: 50, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 7, flexGrow: 1, flexBasis: 0 },
  badge: { position: 'absolute', top: -2, right: -4, width: 10, height: 10, borderRadius: 5, borderWidth: 1.5 },
});
