import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, IconButton, Stepper, T, tap } from '@/components/ui';
import { Calendar } from '@/components/Calendar';
import { formatRange } from '@/lib/data';
import { useStore } from '@/lib/store';
import { radius, useTheme } from '@/lib/theme';
import { ScrollView } from 'react-native';

type Section = 'where' | 'when' | 'who';

export default function Search() {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { listings } = useStore();
  const [open, setOpen] = useState<Section>('where');
  const [q, setQ] = useState('');
  const [start, setStart] = useState<string | null>(null);
  const [end, setEnd] = useState<string | null>(null);
  const [g, setG] = useState({ adults: 0, children: 0, infants: 0, pets: 0 });

  const places = useMemo(() => {
    const all = Array.from(new Set(listings.map((l) => `${l.city}, ${l.country}`)));
    const s = q.trim().toLowerCase();
    return (s ? all.filter((p) => p.toLowerCase().includes(s)) : all).slice(0, 6);
  }, [listings, q]);

  const guestCount = g.adults + g.children;
  const guestLabel = guestCount ? `${guestCount} guest${guestCount > 1 ? 's' : ''}${g.infants ? `, ${g.infants} infant${g.infants > 1 ? 's' : ''}` : ''}${g.pets ? `, ${g.pets} pet${g.pets > 1 ? 's' : ''}` : ''}` : 'Add guests';

  const go = () => {
    router.replace({
      pathname: '/results',
      params: {
        q: q.trim(), checkIn: start ?? '', checkOut: end ?? '',
        adults: String(g.adults), children: String(g.children), infants: String(g.infants), pets: String(g.pets),
      },
    });
  };

  const collapsed = (s: Section, label: string, value: string) => (
    <Pressable onPress={() => { tap(); setOpen(s); }}>
      <Card style={styles.collapsed}>
        <T color={colors.textSecondary}>{label}</T>
        <T variant="headline">{value}</T>
      </Card>
    </Pressable>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top + 4 }}>
      <View style={styles.head}>
        <IconButton icon="close" label="Close" onPress={() => router.back()} />
        <T variant="headline">Search stays</T>
        <View style={{ width: 44 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {open === 'where' ? (
          <Card style={{ gap: 14 }}>
            <T variant="title">Where to?</T>
            <View style={[styles.input, { borderColor: colors.border }]}>
              <Ionicons name="search" size={18} color={colors.text} />
              <TextInput
                autoFocus value={q} onChangeText={setQ} placeholder="Search destinations"
                placeholderTextColor={colors.textTertiary} style={{ flex: 1, color: colors.text, fontSize: 16 }}
                returnKeyType="next" onSubmitEditing={() => setOpen('when')}
              />
              {!!q && <Pressable onPress={() => setQ('')} hitSlop={8}><Ionicons name="close-circle" size={18} color={colors.textTertiary} /></Pressable>}
            </View>
            {places.map((p) => (
              <Pressable key={p} onPress={() => { tap(); setQ(p.split(',')[0]); setOpen('when'); }} style={styles.place}>
                <View style={[styles.placeIcon, { backgroundColor: colors.elevated }]}>
                  <Ionicons name="location-outline" size={20} color={colors.text} />
                </View>
                <T>{p}</T>
              </Pressable>
            ))}
          </Card>
        ) : collapsed('where', 'Where', q || "I'm flexible")}

        {open === 'when' ? (
          <Card style={{ gap: 12 }}>
            <T variant="title">When's your trip?</T>
            <Calendar start={start} end={end} onChange={(a, b) => { setStart(a); setEnd(b); }} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Pressable onPress={() => { setStart(null); setEnd(null); }} hitSlop={8}>
                <T style={{ textDecorationLine: 'underline', fontWeight: '600' }}>Clear dates</T>
              </Pressable>
              <Button small title={start && end ? 'Next' : 'Skip'} onPress={() => setOpen('who')} />
            </View>
          </Card>
        ) : collapsed('when', 'When', start && end ? formatRange(start, end) : 'Any week')}

        {open === 'who' ? (
          <Card>
            <T variant="title" style={{ marginBottom: 6 }}>Who's coming?</T>
            <Stepper label="Adults" sub="Ages 13 or above" value={g.adults} onChange={(v) => setG({ ...g, adults: v })} />
            <Stepper label="Children" sub="Ages 2–12" value={g.children} onChange={(v) => setG({ ...g, children: v, adults: Math.max(g.adults, v > 0 ? 1 : 0) })} />
            <Stepper label="Infants" sub="Under 2" value={g.infants} max={5} onChange={(v) => setG({ ...g, infants: v, adults: Math.max(g.adults, v > 0 ? 1 : 0) })} />
            <Stepper label="Pets" sub="Bringing a service animal?" value={g.pets} max={5} onChange={(v) => setG({ ...g, pets: v, adults: Math.max(g.adults, v > 0 ? 1 : 0) })} />
          </Card>
        ) : collapsed('who', 'Who', guestLabel)}
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 14), backgroundColor: colors.card }]}>
        <Pressable onPress={() => { setQ(''); setStart(null); setEnd(null); setG({ adults: 0, children: 0, infants: 0, pets: 0 }); setOpen('where'); }} hitSlop={8}>
          <T style={{ textDecorationLine: 'underline', fontWeight: '600' }}>Clear all</T>
        </Pressable>
        <Button title="Search" icon="search" onPress={go} style={{ paddingHorizontal: 28 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, height: 52 },
  collapsed: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 18 },
  input: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 52, borderWidth: 1, borderRadius: radius.md, paddingHorizontal: 14 },
  place: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  placeIcon: { width: 46, height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 12 },
});
