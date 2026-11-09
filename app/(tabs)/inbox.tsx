import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar, Empty, IconButton, Segmented, T, tap } from '@/components/ui';
import { Logo } from '@/components/Logo';
import { TAB_BAR_SPACE } from '@/components/TabBar';
import { useStore } from '@/lib/store';
import { timeAgo } from '@/lib/data';
import { radius, useTheme } from '@/lib/theme';

export default function Inbox() {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ tab?: string }>();
  const { conversations, notifications, unreadMessages, unreadNotifications, markNotificationsRead, removeNotification, clearNotifications } = useStore();
  const [tab, setTab] = useState<'messages' | 'notifications'>(params.tab === 'notifications' ? 'notifications' : 'messages');

  useEffect(() => {
    if (params.tab === 'notifications') setTab('notifications');
  }, [params.tab]);

  const sorted = [...conversations].sort((a, b) => {
    const la = a.messages[a.messages.length - 1]?.date ?? '';
    const lb = b.messages[b.messages.length - 1]?.date ?? '';
    return lb.localeCompare(la);
  });

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: TAB_BAR_SPACE + insets.bottom }} showsVerticalScrollIndicator={false}>
        <View style={styles.head}>
          <T variant="large">Inbox</T>
          {tab === 'notifications' && notifications.length > 0 && (
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <IconButton icon="checkmark-done" label="Mark all as read" onPress={markNotificationsRead} />
              <IconButton icon="trash-outline" label="Clear all" onPress={clearNotifications} />
            </View>
          )}
        </View>
        <Segmented
          value={tab}
          onChange={setTab}
          options={[
            { key: 'messages', label: 'Messages', badge: unreadMessages || undefined },
            { key: 'notifications', label: 'Notifications', badge: unreadNotifications || undefined },
          ]}
        />

        <View style={{ marginTop: 16, gap: 10 }}>
          {tab === 'messages' &&
            (sorted.length === 0 ? (
              <Empty icon="chatbubbles-outline" title="No messages" text="When you contact a host or book a stay, your messages will show up here." />
            ) : (
              sorted.map((c) => {
                const last = c.messages[c.messages.length - 1];
                return (
                  <Pressable
                    key={c.id}
                    onPress={() => { tap(); router.push(`/chat/${c.id}`); }}
                    style={({ pressed }) => [styles.item, { backgroundColor: colors.card, opacity: pressed ? 0.85 : 1 }]}
                  >
                    {c.avatar ? <Avatar uri={c.avatar} name={c.name} size={50} /> : (
                      <View style={[styles.brand, { backgroundColor: colors.elevated }]}><Logo size={26} /></View>
                    )}
                    <View style={{ flex: 1, gap: 2 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <T variant="headline" style={{ flex: 1 }} numberOfLines={1}>{c.name}</T>
                        {last && <T variant="caption" color={colors.textSecondary}>{timeAgo(last.date)}</T>}
                      </View>
                      <T variant="caption" color={colors.textSecondary} numberOfLines={1}>{c.subtitle}</T>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <T variant="callout" numberOfLines={1} style={{ flex: 1, fontWeight: c.unread ? '600' : '400' }} color={c.unread ? colors.text : colors.textSecondary}>
                          {last ? `${last.from === 'me' ? 'You: ' : ''}${last.text}` : 'Say hello 👋'}
                        </T>
                        {c.unread > 0 && <View style={[styles.unread, { backgroundColor: colors.accent }]}><T variant="footnote" color="#fff">{c.unread}</T></View>}
                      </View>
                    </View>
                  </Pressable>
                );
              })
            ))}

          {tab === 'notifications' &&
            (notifications.length === 0 ? (
              <Empty icon="notifications-outline" title="You're all caught up" text="Booking updates, reminders and messages from hosts will appear here." />
            ) : (
              notifications.map((n) => (
                <Pressable
                  key={n.id}
                  onPress={() => { if (n.link) router.push(n.link as never); }}
                  style={({ pressed }) => [styles.item, { backgroundColor: colors.card, opacity: pressed ? 0.85 : 1 }]}
                >
                  <View style={[styles.nIcon, { backgroundColor: n.read ? colors.elevated : colors.primary }]}>
                    {n.icon === 'bookmark' ? <Logo size={20} color={n.read ? colors.text : colors.onPrimary} /> : (
                      <Ionicons name={n.icon as never} size={20} color={n.read ? colors.text : colors.onPrimary} />
                    )}
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <T variant="headline" style={{ flex: 1 }}>{n.title}</T>
                      <T variant="caption" color={colors.textSecondary}>{timeAgo(n.date)}</T>
                    </View>
                    <T variant="callout" color={colors.textSecondary}>{n.body}</T>
                  </View>
                  <Pressable onPress={() => removeNotification(n.id)} hitSlop={10} accessibilityLabel="Dismiss notification">
                    <Ionicons name="close" size={16} color={colors.textTertiary} />
                  </Pressable>
                </Pressable>
              ))
            ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, minHeight: 64 },
  item: { flexDirection: 'row', gap: 12, padding: 14, borderRadius: radius.lg, alignItems: 'flex-start' },
  brand: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
  unread: { minWidth: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  nIcon: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
});
