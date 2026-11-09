import React, { useMemo, useState } from 'react';
import { FlatList, Modal, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Chip, Divider, Empty, IconButton, Stepper, SwitchRow, T, tap } from '@/components/ui';
import { ListingRow } from '@/components/ListingCard';
import { ALL_AMENITIES, CATEGORIES, Listing, formatMoney, formatRange, nightsBetween, parseISODate, toISODate } from '@/lib/data';
import { useStore } from '@/lib/store';
import { radius, useTheme } from '@/lib/theme';

const PRICE = [
  { key: 'any', label: 'Any price', min: 0, max: Infinity },
  { key: 'a', label: 'Under $100', min: 0, max: 100 },
  { key: 'b', label: '$100 – $200', min: 100, max: 200 },
  { key: 'c', label: '$200 – $350', min: 200, max: 350 },
  { key: 'd', label: '$350+', min: 350, max: Infinity },
];
const TYPES: Listing['type'][] = ['Entire home', 'Apartment', 'Villa', 'Cabin', 'Hotel room', 'Private room', 'Tiny home'];
const SORTS = [
  { key: 'rec', label: 'Recommended' },
  { key: 'low', label: 'Price: low to high' },
  { key: 'high', label: 'Price: high to low' },
  { key: 'rating', label: 'Top rated' },
] as const;

type Filters = { price: string; types: string[]; bedrooms: number; amenities: string[]; instant: boolean; superhost: boolean };
const EMPTY: Filters = { price: 'any', types: [], bedrooms: 0, amenities: [], instant: false, superhost: false };

export default function Results() {
  const p = useLocalSearchParams<Record<string, string>>();
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { listings, unavailableDates, ratingFor, settings } = useStore();
  const [filters, setFilters] = useState<Filters>(EMPTY);
  const [draft, setDraft] = useState<Filters>(EMPTY);
  const [sheet, setSheet] = useState(false);
  const [sort, setSort] = useState<(typeof SORTS)[number]['key']>('rec');

  const guests = Number(p.adults || 0) + Number(p.children || 0);
  const pets = Number(p.pets || 0);
  const category = p.category && p.category !== 'all' ? p.category : '';

  const apply = (f: Filters, list: Listing[]) => {
    const pr = PRICE.find((x) => x.key === f.price)!;
    const q = (p.q || '').toLowerCase();
    return list.filter((l) => {
      if (q && !`${l.title} ${l.city} ${l.country} ${l.type}`.toLowerCase().includes(q)) return false;
      if (category && !l.categories.includes(category as never)) return false;
      if (guests && l.guests < guests) return false;
      if (pets && !l.amenities.includes('Pets allowed')) return false;
      if (l.price < pr.min || l.price >= pr.max) return false;
      if (f.types.length && !f.types.includes(l.type)) return false;
      if (f.bedrooms && l.bedrooms < f.bedrooms) return false;
      if (f.amenities.some((a) => !l.amenities.includes(a))) return false;
      if (f.instant && !l.instantBook) return false;
      if (f.superhost && !l.host.superhost) return false;
      if (p.checkIn && p.checkOut) {
        const blocked = unavailableDates(l.id);
        const n = nightsBetween(p.checkIn, p.checkOut);
        for (let i = 0; i < n; i++) {
          const d = parseISODate(p.checkIn);
          d.setDate(d.getDate() + i);
          if (blocked.has(toISODate(d))) return false;
        }
      }
      return true;
    });
  };

  const results = useMemo(() => {
    const r = apply(filters, listings);
    if (sort === 'low') r.sort((a, b) => a.price - b.price);
    if (sort === 'high') r.sort((a, b) => b.price - a.price);
    if (sort === 'rating') r.sort((a, b) => ratingFor(b).rating - ratingFor(a).rating);
    return r;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, listings, sort, p.q, p.checkIn, p.checkOut, guests, pets, category]);
  const draftCount = apply(draft, listings).length;
  const activeCount =
    (filters.price !== 'any' ? 1 : 0) + filters.types.length + (filters.bedrooms ? 1 : 0) + filters.amenities.length +
    (filters.instant ? 1 : 0) + (filters.superhost ? 1 : 0);

  const summary = [
    p.q || (category ? CATEGORIES.find((c) => c.key === category)?.label : 'Anywhere'),
    p.checkIn && p.checkOut ? formatRange(p.checkIn, p.checkOut) : 'Any week',
    guests ? `${guests} guest${guests > 1 ? 's' : ''}` : 'Add guests',
  ].join(' · ');

  const toggle = (k: 'types' | 'amenities', v: string) =>
    setDraft((d) => ({ ...d, [k]: d[k].includes(v) ? d[k].filter((x) => x !== v) : [...d[k], v] }));

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top + 4 }}>
      <View style={styles.head}>
        <IconButton icon="chevron-back" label="Back" onPress={() => router.back()} />
        <Pressable onPress={() => router.push('/search')} style={[styles.summary, { backgroundColor: colors.card }]}>
          <Ionicons name="search" size={16} color={colors.text} />
          <T variant="callout" numberOfLines={1} style={{ flex: 1, fontWeight: '600' }}>{summary}</T>
        </Pressable>
        <View>
          <IconButton icon="options-outline" label="Filters" onPress={() => { setDraft(filters); setSheet(true); }} />
          {activeCount > 0 && (
            <View style={[styles.count, { backgroundColor: colors.primary }]}>
              <T variant="footnote" color={colors.onPrimary}>{activeCount}</T>
            </View>
          )}
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingVertical: 10 }}>
        {SORTS.map((s) => <Chip key={s.key} label={s.label} active={sort === s.key} onPress={() => setSort(s.key)} />)}
      </ScrollView>

      <FlatList
        data={results}
        keyExtractor={(l) => l.id}
        renderItem={({ item }) => <ListingRow l={item} />}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 12, paddingBottom: insets.bottom + 20 }}
        ListHeaderComponent={<T variant="callout" color={colors.textSecondary}>{results.length} stay{results.length === 1 ? '' : 's'} found</T>}
        ListEmptyComponent={
          <Empty icon="search-outline" title="No exact matches" text="Try changing or removing some of your filters or adjusting your search area."
            action={<Button small title="Clear filters" variant="outline" onPress={() => setFilters(EMPTY)} />} />
        }
        showsVerticalScrollIndicator={false}
      />

      <Modal visible={sheet} animationType="slide" presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : undefined} onRequestClose={() => setSheet(false)}>
        <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: Platform.OS === 'ios' ? 8 : insets.top }}>
          <View style={styles.head}>
            <IconButton icon="close" label="Close" onPress={() => setSheet(false)} />
            <T variant="headline">Filters</T>
            <View style={{ width: 44 }} />
          </View>
          <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
            <T variant="title2" style={{ marginBottom: 12 }}>Price per night</T>
            <View style={styles.wrap}>
              {PRICE.map((x) => (
                <Chip key={x.key} label={x.key === 'any' ? x.label : x.label.replace(/\$(\d+)/g, (_, n) => formatMoney(Number(n), settings.currency))}
                  active={draft.price === x.key} onPress={() => setDraft({ ...draft, price: x.key })} />
              ))}
            </View>
            <Divider />
            <T variant="title2" style={{ marginBottom: 12 }}>Type of place</T>
            <View style={styles.wrap}>
              {TYPES.map((t) => <Chip key={t} label={t} active={draft.types.includes(t)} onPress={() => toggle('types', t)} />)}
            </View>
            <Divider />
            <T variant="title2">Rooms</T>
            <Stepper label="Bedrooms" sub="Minimum" value={draft.bedrooms} max={6} onChange={(v) => setDraft({ ...draft, bedrooms: v })} />
            <Divider />
            <T variant="title2" style={{ marginBottom: 12 }}>Amenities</T>
            <View style={styles.wrap}>
              {ALL_AMENITIES.slice(0, 16).map((a) => <Chip key={a} label={a} active={draft.amenities.includes(a)} onPress={() => toggle('amenities', a)} />)}
            </View>
            <Divider />
            <View style={{ backgroundColor: colors.card, borderRadius: radius.lg, overflow: 'hidden' }}>
              <SwitchRow icon="flash-outline" title="Instant Book" subtitle="Book without waiting for host approval" value={draft.instant} onChange={(v) => setDraft({ ...draft, instant: v })} />
              <SwitchRow icon="ribbon-outline" title="Superhost" subtitle="Stay with recognized hosts" value={draft.superhost} onChange={(v) => setDraft({ ...draft, superhost: v })} />
            </View>
          </ScrollView>
          <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 14), backgroundColor: colors.card }]}>
            <Pressable onPress={() => { tap(); setDraft(EMPTY); }} hitSlop={8}>
              <T style={{ textDecorationLine: 'underline', fontWeight: '600' }}>Clear all</T>
            </Pressable>
            <Button title={`Show ${draftCount} stay${draftCount === 1 ? '' : 's'}`} onPress={() => { setFilters(draft); setSheet(false); }} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, height: 52, justifyContent: 'space-between' },
  summary: { flex: 1, height: 44, borderRadius: radius.pill, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14 },
  count: { position: 'absolute', top: -2, right: -2, minWidth: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 12 },
});
