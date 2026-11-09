import React from 'react';
import { Alert, Linking, Platform, Share, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Avatar, Button, Card, Empty, Group, Header, Pill, Row, Screen, T } from '@/components/ui';
import { SmartImage } from '@/components/SmartImage';
import { EXTRAS, formatDate, formatMoney, nightsBetween } from '@/lib/data';
import { useStore } from '@/lib/store';
import { radius, useTheme } from '@/lib/theme';
import { tripStatus } from '@/lib/trips';

export default function Trip() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const router = useRouter();
  const { bookings, getListing, cancelBooking, openConversation, settings } = useStore();
  const b = bookings.find((x) => x.id === id);
  const l = b && getListing(b.listingId);

  if (!b || !l) {
    return (
      <Screen>
        <Header title="Trip" />
        <Empty icon="airplane-outline" title="Trip not found" text="This reservation is no longer available." />
      </Screen>
    );
  }

  const status = tripStatus(b);
  const n = nightsBetween(b.checkIn, b.checkOut);
  const guests = b.guests.adults + b.guests.children;
  const money = (v: number) => formatMoney(v, settings.currency);

  const directions = () => {
    if (!l.lat && !l.lng) return Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(l.address)}`);
    const url = Platform.select({
      ios: `maps:0,0?daddr=${l.lat},${l.lng}`,
      android: `google.navigation:q=${l.lat},${l.lng}`,
      default: `https://www.google.com/maps/dir/?api=1&destination=${l.lat},${l.lng}`,
    })!;
    Linking.openURL(url).catch(() => Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${l.lat},${l.lng}`));
  };

  const cancel = () => {
    const doIt = () => cancelBooking(b.id);
    if (Platform.OS === 'web') return doIt();
    Alert.alert('Cancel reservation?', `${l.cancellation}`, [
      { text: 'Keep reservation', style: 'cancel' },
      { text: 'Cancel reservation', style: 'destructive', onPress: doIt },
    ]);
  };

  const message = () => {
    const c = openConversation(l.id);
    if (c) router.push(`/chat/${c}`);
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <Header
        title="Your trip"
        right={
          <Button small variant="secondary" title="Share" icon="share-outline"
            onPress={() => Share.share({ message: `I'm staying at ${l.title} (${l.city}) ${formatDate(b.checkIn)} – ${formatDate(b.checkOut)}. Confirmation ${b.code}` })} />
        }
      />
      <Card style={{ padding: 8 }}>
        <SmartImage uri={l.images[0]} seed={l.id} style={{ width: '100%', height: 190, borderRadius: radius.md }} />
        <View style={{ padding: 8, gap: 6 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            {status === 'upcoming' && <Pill tone="success" label="Confirmed" />}
            {status === 'past' && <Pill tone="dark" label="Completed" />}
            {status === 'cancelled' && <Pill tone="danger" label="Cancelled" />}
            <T variant="caption" color={colors.textSecondary}>Code {b.code}</T>
          </View>
          <T variant="title2">{l.title}</T>
          <T variant="callout" color={colors.textSecondary}>{l.address}</T>
        </View>
      </Card>

      <View style={styles.split}>
        <Card style={{ flex: 1 }}>
          <T variant="caption" color={colors.textSecondary}>Check-in</T>
          <T variant="headline">{formatDate(b.checkIn, { weekday: 'short', month: 'short', day: 'numeric' })}</T>
          <T variant="caption" color={colors.textSecondary}>{l.checkInTime}</T>
        </Card>
        <Card style={{ flex: 1 }}>
          <T variant="caption" color={colors.textSecondary}>Checkout</T>
          <T variant="headline">{formatDate(b.checkOut, { weekday: 'short', month: 'short', day: 'numeric' })}</T>
          <T variant="caption" color={colors.textSecondary}>{l.checkOutTime}</T>
        </Card>
      </View>

      <Group title="Reservation">
        <Row icon="people-outline" title="Guests" value={`${guests} guest${guests > 1 ? 's' : ''}${b.guests.infants ? `, ${b.guests.infants} infant` : ''}${b.guests.pets ? `, ${b.guests.pets} pet` : ''}`} />
        <Row icon="moon-outline" title="Nights" value={String(n)} />
        {b.extras.length > 0 && <Row icon="sparkles-outline" title="Extras" value={b.extras.map((e) => EXTRAS.find((x) => x.key === e)?.label).join(', ')} />}
        <Row icon="card-outline" title="Paid with" value={b.paymentLabel} />
        <Row icon="receipt-outline" title={status === 'cancelled' ? 'Refund' : 'Total paid'} value={money(b.total)} />
      </Group>

      <Group title="Host">
        <Row icon="chatbubble-ellipses-outline" title={`Message ${l.host.name}`} subtitle="Ask about check-in, parking & more" onPress={message} />
        <Row icon="navigate-outline" title="Get directions" subtitle={l.city} onPress={directions} />
        <Row icon="home-outline" title="Show listing" onPress={() => router.push(`/listing/${l.id}`)} />
      </Group>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <Avatar uri={l.host.avatar} name={l.host.name} size={40} />
        <T variant="callout" color={colors.textSecondary} style={{ flex: 1 }}>
          {l.host.name} will send check-in instructions 24 hours before arrival.
        </T>
      </View>

      {status === 'past' && !b.reviewed && <Button title="Write a review" icon="star-outline" onPress={() => router.push(`/review/${b.id}`)} />}
      {status === 'upcoming' && <Button title="Cancel reservation" variant="danger" onPress={cancel} />}
      {status !== 'upcoming' && <Button title="Book again" variant="secondary" style={{ marginTop: 10 }} onPress={() => router.push(`/book/${l.id}`)} />}
    </Screen>
  );
}

const styles = StyleSheet.create({ split: { flexDirection: 'row', gap: 12, marginVertical: 16 } });
