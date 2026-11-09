import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, T } from '@/components/ui';
import { SmartImage } from '@/components/SmartImage';
import { formatMoney, formatRange } from '@/lib/data';
import { useStore } from '@/lib/store';
import { radius, useTheme } from '@/lib/theme';

export default function Success() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { bookings, getListing, settings } = useStore();
  const b = bookings.find((x) => x.id === id);
  const l = b && getListing(b.listingId);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 16, paddingHorizontal: 20 }}>
      <View style={{ flex: 1, justifyContent: 'center', gap: 18 }}>
        <View style={{ alignItems: 'center', gap: 12 }}>
          <View style={{ width: 84, height: 84, borderRadius: 42, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="checkmark" size={44} color={colors.onPrimary} />
          </View>
          <T variant="large" center>You're going!</T>
          <T color={colors.textSecondary} center>Your reservation is confirmed. We've sent the details to your notifications and opened a chat with your host.</T>
        </View>
        {b && l && (
          <Card style={{ gap: 12 }}>
            <SmartImage uri={l.images[0]} seed={l.id} style={{ width: '100%', height: 150, borderRadius: radius.md }} />
            <T variant="title2">{l.title}</T>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <T color={colors.textSecondary}>{formatRange(b.checkIn, b.checkOut)}</T>
              <T variant="headline">{formatMoney(b.total, settings.currency)}</T>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <T color={colors.textSecondary}>Confirmation code</T>
              <T variant="headline">{b.code}</T>
            </View>
          </Card>
        )}
      </View>
      <View style={{ gap: 10 }}>
        <Button title="View trip" onPress={() => router.replace(`/trip/${id}`)} />
        <Button title="Back to explore" variant="secondary" onPress={() => router.dismissTo('/')} />
      </View>
    </View>
  );
}
