import React, { useState } from 'react';
import { Linking, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Button, Card, Header, Screen, T, tap } from '@/components/ui';
import { useStore } from '@/lib/store';
import { useTheme } from '@/lib/theme';

const FAQ = [
  ['How do I cancel a reservation?', 'Go to Trips, open your reservation and tap "Cancel reservation". Your refund depends on the listing\'s cancellation policy.'],
  ['When am I charged?', 'Instant Book stays are charged when you confirm. Request-to-book stays are charged once the host accepts.'],
  ['How do I contact my host?', 'Open your trip and tap "Message host", or use the Inbox tab. Hosts usually reply within an hour.'],
  ['How do I change currency?', 'Profile → Language & currency. All prices update instantly.'],
  ['How do I turn on dark mode?', 'Profile → Appearance. Choose Light, Dark or Automatic to follow your phone.'],
  ['How do I list my place?', 'Profile → List your space. Add photos, a description and a nightly price — your listing goes live immediately.'],
];

export default function Help() {
  const { colors } = useTheme();
  const router = useRouter();
  const { conversations } = useStore();
  const [open, setOpen] = useState<number | null>(0);
  const support = conversations.find((c) => !c.listingId);
  return (
    <Screen edges={['top', 'bottom']}>
      <Header title="Help Center" />
      <T variant="title" style={{ marginVertical: 12 }}>How can we help?</T>
      <View style={{ gap: 10 }}>
        {FAQ.map(([q, a], i) => (
          <Card key={q} onPress={() => { tap(); setOpen(open === i ? null : i); }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <T variant="headline" style={{ flex: 1 }}>{q}</T>
              <Ionicons name={open === i ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textSecondary} />
            </View>
            {open === i && <T variant="callout" color={colors.textSecondary} style={{ marginTop: 8 }}>{a}</T>}
          </Card>
        ))}
      </View>
      <View style={{ gap: 10, marginTop: 24 }}>
        {support && <Button title="Chat with support" icon="chatbubble-ellipses-outline" onPress={() => router.push(`/chat/${support.id}`)} />}
        <Button title="Email us" variant="secondary" icon="mail-outline" onPress={() => Linking.openURL('mailto:support@staymark.app?subject=Help%20with%20Staymark')} />
      </View>
      <Pressable onPress={() => Linking.openURL('tel:911')} style={{ marginTop: 18, alignSelf: 'center' }}>
        <T variant="callout" color={colors.danger} style={{ fontWeight: '600' }}>Safety emergency? Call local authorities</T>
      </Pressable>
    </Screen>
  );
}
