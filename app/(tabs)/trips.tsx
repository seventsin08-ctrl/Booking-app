import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar, Button, Empty, IconButton, Pill, Segmented, T } from '@/components/ui';
import { SmartImage } from '@/components/SmartImage';
import { TAB_BAR_SPACE } from '@/components/TabBar';
import { formatMoney, formatRange, nightsBetween, parseISODate, toISODate } from '@/lib/data';
import { Booking, useStore } from '@/lib/store';
import { radius, useTheme } from '@/lib/theme';
import { TripTab, tripStatus } from '@/lib/trips';

type Tab = TripTab;

export default function Trips() {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { myBookings } = useStore();
  const [tab, setTab] = useState<Tab>('upcoming');

  const groups = useMemo(() => {
    const g: Record<Tab, Booking[]> = { upcoming: [], past: [], cancelled: [] };
    myBookings.forEach((b) => g[tripStatus(b)].push(b));
    g.upcoming.sort((a, b) => a.checkIn.localeCompare(b.checkIn));
    g.past.sort((a, b) => b.checkIn.localeCompare(a.checkIn));
    g.cancelled.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return g;
  }, [myBookings]);

  // week strip (like a planner) highlighting days with upcoming stays
  const week = useMemo(() => {
    const out: { iso: string; d: Date; count: number }[] = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const iso = toISODate(d);
      out.push({ iso, d, count: groups.upcoming.filter((b) => b.checkIn <= iso && b.checkOut > iso).length });
    }
    return out;
  }, [groups.upcoming]);

  const list = groups[tab];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: TAB_BAR_SPACE + insets.bottom }} showsVerticalScrollIndicator={false}>
        <View style={styles.head}>
          <T variant="large">Trips</T>
          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
            <View style={[styles.month, { backgroundColor: colors.card }]}>
              <Ionicons name="calendar-outline" size={16} color={colors.text} />
              <T variant="callout" style={{ fontWeight: '600' }}>{new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</T>
            </View>
            <IconButton icon="add" filled label="Plan a new trip" onPress={() => router.push('/search')} />
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 6, marginBottom: 16 }}>
          {week.map((w, i) => {
            const active = i === 0;
            return (
              <View key={w.iso} style={[styles.day, { backgroundColor: active ? colors.primary : colors.card }]}>
                <T variant="caption" color={active ? colors.onPrimary : colors.textSecondary}>{w.d.toLocaleDateString('en-US', { weekday: 'short' })}</T>
                <T variant="title2" color={active ? colors.onPrimary : colors.text}>{w.d.getDate()}</T>
                <T variant="footnote" color={active ? colors.highlight : colors.textSecondary} numberOfLines={1}>
                  {w.count ? `${w.count} stay` : '—'}
                </T>
              </View>
            );
          })}
        </View>

        <Segmented
          value={tab}
          onChange={setTab}
          options={[
            { key: 'upcoming', label: 'Upcoming', badge: groups.upcoming.length || undefined },
            { key: 'past', label: 'Past' },
            { key: 'cancelled', label: 'Cancelled' },
          ]}
        />

        <View style={{ marginTop: 16, gap: 12 }}>
          {list.length === 0 ? (
            <Empty
              icon={tab === 'upcoming' ? 'airplane-outline' : 'time-outline'}
              title={tab === 'upcoming' ? 'No trips booked… yet!' : tab === 'past' ? 'No past trips' : 'Nothing cancelled'}
              text={tab === 'upcoming' ? 'Time to dust off your bags and start planning your next adventure.' : 'Your trips will show up here.'}
              action={tab === 'upcoming' ? <Button small title="Start searching" onPress={() => router.push('/')} /> : undefined}
            />
          ) : (
            list.map((b) => <TripRow key={b.id} b={b} tab={tab} />)
          )}
          {tab === 'upcoming' && list.length > 0 && (
            <Pressable onPress={() => router.push('/search')} style={[styles.open, { borderColor: colors.border }]}>
              <Ionicons name="add" size={18} color={colors.textSecondary} />
              <T variant="callout" color={colors.textSecondary}>Plan another getaway</T>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function TripRow({ b, tab }: { b: Booking; tab: Tab }) {
  const { colors } = useTheme();
  const router = useRouter();
  const { getListing, settings } = useStore();
  const l = getListing(b.listingId);
  const d = parseISODate(b.checkIn);
  const n = nightsBetween(b.checkIn, b.checkOut);
  const daysTo = Math.ceil((d.getTime() - parseISODate(toISODate(new Date())).getTime()) / 86400000);
  return (
    <View style={{ flexDirection: 'row', gap: 12 }}>
      <View style={{ width: 46, paddingTop: 14 }}>
        <T variant="headline">{d.toLocaleDateString('en-US', { month: 'short' })} {d.getDate()}</T>
        <T variant="caption" color={colors.textSecondary}>{d.toLocaleDateString('en-US', { weekday: 'short' })}</T>
      </View>
      <Pressable onPress={() => router.push(`/trip/${b.id}`)} style={({ pressed }) => [styles.card, { backgroundColor: colors.card, opacity: pressed ? 0.85 : 1 }]}>
        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          {l ? <SmartImage uri={l.images[0]} seed={l.id} style={styles.thumb} /> : <View style={[styles.thumb, { backgroundColor: colors.elevated }]} />}
          <View style={{ flex: 1 }}>
            <T variant="headline" numberOfLines={1}>{l?.title ?? 'Removed listing'}</T>
            <T variant="caption" color={colors.textSecondary} numberOfLines={1}>{formatRange(b.checkIn, b.checkOut)} · {n} night{n > 1 ? 's' : ''}</T>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
          {tab === 'upcoming' && <Pill tone={daysTo <= 0 ? 'dark' : 'success'} label={daysTo <= 0 ? 'Checked in' : daysTo === 1 ? 'Tomorrow' : `In ${daysTo} days`} />}
          {tab === 'past' && <Pill tone={b.reviewed ? 'dark' : 'accent'} label={b.reviewed ? 'Completed' : 'Leave a review'} />}
          {tab === 'cancelled' && <Pill tone="danger" label="Cancelled" />}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            {l && <Avatar uri={l.host.avatar} name={l.host.name} size={22} />}
            <T variant="caption" color={colors.textSecondary}>{formatMoney(b.total, settings.currency)}</T>
          </View>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
  month: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 44, paddingHorizontal: 14, borderRadius: radius.pill },
  day: { flex: 1, borderRadius: radius.pill, alignItems: 'center', paddingVertical: 10, gap: 2 },
  card: { flex: 1, borderRadius: radius.lg, padding: 12 },
  thumb: { width: 44, height: 44, borderRadius: 22 },
  open: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 52, borderRadius: radius.lg, borderWidth: 1.2, borderStyle: 'dashed', marginLeft: 58 },
});
