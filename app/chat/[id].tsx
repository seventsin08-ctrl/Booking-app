import React, { useEffect, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar, Empty, IconButton, T, tap } from '@/components/ui';
import { Logo } from '@/components/Logo';
import { useStore } from '@/lib/store';
import { radius, useTheme } from '@/lib/theme';

const QUICK = ['What time is check-in?', 'Is parking available?', "What's the Wi-Fi like?", 'Can I bring my pet?'];

export default function Chat() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { conversations, sendMessage, markConversationRead, deleteConversation } = useStore();
  const [text, setText] = useState('');
  const list = useRef<FlatList>(null);
  const c = conversations.find((x) => x.id === id);
  const count = c?.messages.length ?? 0;
  const lastFromHost = c?.messages[count - 1]?.from === 'me';

  useEffect(() => {
    if (c?.unread) markConversationRead(c.id);
    setTimeout(() => list.current?.scrollToEnd({ animated: true }), 60);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  if (!c) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top, paddingHorizontal: 20 }}>
        <IconButton icon="chevron-back" onPress={() => router.back()} />
        <Empty icon="chatbubbles-outline" title="Conversation not found" text="It may have been deleted." />
      </View>
    );
  }

  const send = (t = text) => {
    if (!t.trim()) return;
    tap();
    sendMessage(c.id, t);
    setText('');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.head, { paddingTop: insets.top + 4, backgroundColor: colors.bg, borderBottomColor: colors.separator }]}>
        <IconButton icon="chevron-back" label="Back" onPress={() => router.back()} />
        <Pressable style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 }} disabled={!c.listingId}
          onPress={() => c.listingId && router.push(`/listing/${c.listingId}`)}>
          {c.avatar ? <Avatar uri={c.avatar} name={c.name} size={38} /> : (
            <View style={[styles.brand, { backgroundColor: colors.card }]}><Logo size={20} /></View>
          )}
          <View style={{ flex: 1 }}>
            <T variant="headline" numberOfLines={1}>{c.name}</T>
            <T variant="caption" color={colors.textSecondary} numberOfLines={1}>{c.subtitle}</T>
          </View>
        </Pressable>
        <IconButton icon="trash-outline" label="Delete conversation" onPress={() => { deleteConversation(c.id); router.back(); }} />
      </View>

      <FlatList
        ref={list}
        data={c.messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: 16, gap: 8, flexGrow: 1 }}
        onContentSizeChange={() => list.current?.scrollToEnd({ animated: false })}
        keyboardDismissMode="interactive"
        ListEmptyComponent={<Empty icon="hand-left-outline" title={`Say hi to ${c.name}`} text="Ask a question about the stay or your trip." />}
        renderItem={({ item: m }) => {
          const me = m.from === 'me';
          return (
            <View style={{ alignItems: me ? 'flex-end' : 'flex-start' }}>
              <View style={[styles.bubble, me ? { backgroundColor: colors.primary, borderBottomRightRadius: 6 } : { backgroundColor: colors.card, borderBottomLeftRadius: 6 }]}>
                <T color={me ? colors.onPrimary : colors.text}>{m.text}</T>
              </View>
              <T variant="footnote" color={colors.textTertiary} style={{ marginTop: 3, marginHorizontal: 6 }}>
                {new Date(m.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
              </T>
            </View>
          );
        }}
        ListFooterComponent={lastFromHost ? <T variant="caption" color={colors.textSecondary} style={{ marginTop: 4 }}>{c.name} is typing…</T> : null}
      />

      <View style={{ paddingBottom: Math.max(insets.bottom, 10), paddingTop: 8, backgroundColor: colors.bg }}>
        <View style={{ flexDirection: 'row', flexWrap: 'nowrap', gap: 8, paddingHorizontal: 16, marginBottom: 8 }}>
          <FlatList horizontal data={QUICK} keyExtractor={(q) => q} showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <Pressable onPress={() => send(item)} style={[styles.quick, { borderColor: colors.border, backgroundColor: colors.card }]}>
                <T variant="caption" style={{ fontWeight: '600' }}>{item}</T>
              </Pressable>
            )} />
        </View>
        <View style={[styles.inputBar, { backgroundColor: colors.card, marginHorizontal: 16 }]}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Write a message…"
            placeholderTextColor={colors.textTertiary}
            style={{ flex: 1, color: colors.text, fontSize: 16, maxHeight: 110, paddingVertical: 8 }}
            multiline
          />
          <Pressable onPress={() => send()} disabled={!text.trim()} accessibilityLabel="Send"
            style={[styles.send, { backgroundColor: colors.primary, opacity: text.trim() ? 1 : 0.3 }]}>
            <Ionicons name="arrow-up" size={20} color={colors.onPrimary} />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingBottom: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  brand: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  bubble: { maxWidth: '80%', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20 },
  quick: { height: 34, paddingHorizontal: 12, borderRadius: radius.pill, borderWidth: 1, justifyContent: 'center' },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, borderRadius: 24, paddingLeft: 16, padding: 6 },
  send: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
});
