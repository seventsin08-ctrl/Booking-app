import React from 'react';
import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Avatar, Button, Card, Empty, Header, Pill, Screen, T } from '@/components/ui';
import { ListingTile } from '@/components/ListingCard';
import { formatMoney, formatRange, toISODate } from '@/lib/data';
import { useAuth } from '@/lib/auth';
import { useStore } from '@/lib/store';
import { useTheme } from '@/lib/theme';

export default function HostDashboard() {
  const { colors } = useTheme();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { user } = useAuth();
  const { listings, bookings, settings, setHostMode } = useStore();
  const mine = listings.filter((l) => l.createdBy === user?.id);
  const ids = new Set(mine.map((l) => l.id));
  const res = bookings.filter((b) => ids.has(b.listingId) && b.status === 'confirmed').sort((a, b) => a.checkIn.localeCompare(b.checkIn));
  const today = toISODate(new Date());
  const upcoming = res.filter((b) => b.checkOut >= today);
  const earnings = res.reduce((s, b) => s + b.total * 0.97, 0);

  return (
    <Screen edges={['top', 'bottom']}>
      <Header title="Hosting" right={<Button small variant="secondary" title="Travel" onPress={() => { setHostMode(false); router.dismissTo('/(tabs)/profile'); }} />} />
      <T variant="large" style={{ marginTop: 6 }}>Welcome, {user?.name.split(' ')[0]}</T>
      <View style={styles.stats}>
        {[
          [String(mine.length), 'Listings'],
          [String(upcoming.length), 'Upcoming'],
          [formatMoney(earnings, settings.currency), 'Earnings'],
        ].map(([v, l]) => (
          <Card key={l} style={{ flex: 1, paddingVertical: 14, alignItems: 'center' }}>
            <T variant="title2" numberOfLines={1}>{v}</T>
            <T variant="caption" color={colors.textSecondary}>{l}</T>
          </Card>
        ))}
      </View>

      <View style={styles.sectionHead}>
        <T variant="title2">Your listings</T>
        <Button small title="New" icon="add" onPress={() => router.push('/host/new')} />
      </View>
      {mine.length === 0 ? (
        <Card><Empty icon="home-outline" title="No listings yet" text="Create your first listing in a few minutes." /></Card>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
          {mine.map((l) => <ListingTile key={l.id} l={l} width={Math.min(width * 0.45, 200)} />)}
        </ScrollView>
      )}

      <T variant="title2" style={{ marginTop: 24, marginBottom: 12 }}>Reservations</T>
      {upcoming.length === 0 ? (
        <Card><T color={colors.textSecondary}>You don't have any upcoming guests. Reservations for your listings will appear here.</T></Card>
      ) : (
        <View style={{ gap: 10 }}>
          {upcoming.map((b) => {
            const l = mine.find((x) => x.id === b.listingId)!;
            return (
              <Card key={b.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Avatar name={b.guestName} size={44} />
                <View style={{ flex: 1 }}>
                  <T variant="headline">{b.guestName}</T>
                  <T variant="caption" color={colors.textSecondary}>{l.title} · {formatRange(b.checkIn, b.checkOut)}</T>
                </View>
                <Pill tone={b.checkIn <= today ? 'dark' : 'success'} label={b.checkIn <= today ? 'Hosting' : 'Confirmed'} />
              </Card>
            );
          })}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', gap: 10, marginVertical: 16 },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 8 },
});
