import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Card, Footer, Header, Input, Screen, Stepper, T, tap } from '@/components/ui';
import { Calendar } from '@/components/Calendar';
import { SmartImage } from '@/components/SmartImage';
import { Rating } from '@/components/ListingCard';
import { EXTRAS, formatMoney, formatRange, nightsBetween, priceBreakdown } from '@/lib/data';
import { useStore } from '@/lib/store';
import { radius, useTheme } from '@/lib/theme';

export default function Book() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const router = useRouter();
  const { getListing, unavailableDates, paymentMethods, createBooking, settings, ratingFor } = useStore();
  const l = getListing(id)!;
  const [start, setStart] = useState<string | null>(null);
  const [end, setEnd] = useState<string | null>(null);
  const [g, setG] = useState({ adults: 1, children: 0, infants: 0, pets: 0 });
  const [extras, setExtras] = useState<string[]>([]);
  const [pickedPm, setPmId] = useState<string | undefined>();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const blocked = useMemo(() => unavailableDates(l.id), [l.id, unavailableDates]);

  const nights = start && end ? nightsBetween(start, end) : 0;
  const price = priceBreakdown(l, Math.max(nights, 1), extras);
  const money = (v: number) => formatMoney(v, settings.currency);
  const pm = paymentMethods.find((p) => p.id === pickedPm) ?? paymentMethods.find((p) => p.isDefault) ?? paymentMethods[0];
  const pmId = pm?.id;
  const total = g.adults + g.children;
  const petsOk = l.amenities.includes('Pets allowed');

  const confirm = async () => {
    setError('');
    if (!start || !end) return setError('Select your check-in and check-out dates.');
    if (!pm) return setError('Add a payment method to continue.');
    setLoading(true);
    try {
      // Simulated secure payment authorisation
      await new Promise((r) => setTimeout(r, 900));
      const b = await createBooking({
        listingId: l.id, checkIn: start, checkOut: end, guests: g, extras, total: priceBreakdown(l, nights, extras).total,
        paymentLabel: `${pm.brand} •••• ${pm.last4}`, message,
      });
      router.replace({ pathname: '/book/success', params: { id: b.id } });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const line = (label: string, value: string, strong?: boolean, green?: boolean) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
      <T variant={strong ? 'headline' : 'callout'} color={strong ? colors.text : colors.textSecondary}>{label}</T>
      <T variant={strong ? 'headline' : 'callout'} color={green ? colors.success : colors.text}>{value}</T>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Screen keyboard>
        <Header title={l.instantBook ? 'Confirm and pay' : 'Request to book'} />
        <Card style={{ flexDirection: 'row', gap: 12, alignItems: 'center', padding: 10 }}>
          <SmartImage uri={l.images[0]} seed={l.id} style={{ width: 76, height: 76, borderRadius: 14 }} />
          <View style={{ flex: 1, gap: 3 }}>
            <T variant="headline" numberOfLines={1}>{l.title}</T>
            <T variant="caption" color={colors.textSecondary} numberOfLines={1}>{l.address}</T>
            <Rating value={ratingFor(l).rating} count={ratingFor(l).count} />
          </View>
          <T variant="headline">{money(l.price)}</T>
        </Card>

        <T variant="title2" style={styles.h}>Select dates</T>
        <Card>
          <Calendar start={start} end={end} onChange={(a, b) => { setStart(a); setEnd(b); setError(''); }} unavailable={blocked} />
          <View style={[styles.dateRow, { borderTopColor: colors.separator }]}>
            <View style={{ flex: 1 }}>
              <T variant="caption" color={colors.textSecondary}>CHECK-IN</T>
              <T variant="headline">{start ? new Date(start + 'T00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : 'Add date'}</T>
            </View>
            <Ionicons name="arrow-forward" size={16} color={colors.textTertiary} />
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <T variant="caption" color={colors.textSecondary}>CHECKOUT</T>
              <T variant="headline">{end ? new Date(end + 'T00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : 'Add date'}</T>
            </View>
          </View>
          <T variant="caption" color={colors.textSecondary} style={{ marginTop: 8 }}>
            Crossed-out dates are unavailable. {nights >= 7 ? '10% weekly discount applied 🎉' : 'Stay 7+ nights for 10% off.'}
          </T>
        </Card>

        <T variant="title2" style={styles.h}>Guests</T>
        <Card style={{ paddingVertical: 6 }}>
          <Stepper label="Adults" sub="Ages 13+" value={g.adults} min={1} max={l.guests - g.children} onChange={(v) => setG({ ...g, adults: v })} />
          <Stepper label="Children" sub="Ages 2–12" value={g.children} max={l.guests - g.adults} onChange={(v) => setG({ ...g, children: v })} />
          <Stepper label="Infants" sub="Under 2" value={g.infants} max={5} onChange={(v) => setG({ ...g, infants: v })} />
          {petsOk && <Stepper label="Pets" value={g.pets} max={2} onChange={(v) => setG({ ...g, pets: v })} />}
          <T variant="caption" color={colors.textSecondary} style={{ paddingBottom: 8 }}>
            This place has a maximum of {l.guests} guests{petsOk ? '' : ', not including infants. Pets aren\'t allowed'}.
          </T>
        </Card>

        <T variant="title2" style={styles.h}>Add extras</T>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {EXTRAS.map((e) => {
            const on = extras.includes(e.key);
            return (
              <Pressable
                key={e.key}
                onPress={() => { tap(); setExtras(on ? extras.filter((x) => x !== e.key) : [...extras, e.key]); }}
                style={[styles.extra, { backgroundColor: on ? colors.primary : colors.card }]}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: on }}
              >
                <Ionicons name={e.icon as never} size={20} color={on ? colors.onPrimary : colors.text} />
                <T variant="callout" color={on ? colors.onPrimary : colors.text} style={{ fontWeight: '600' }} center>{e.label}</T>
                <T variant="caption" color={on ? colors.onPrimary : colors.textSecondary}>{money(e.price)}{e.perNight ? '/night' : ''}</T>
              </Pressable>
            );
          })}
        </View>

        <T variant="title2" style={styles.h}>Pay with</T>
        <Card style={{ padding: 6 }}>
          {paymentMethods.map((p) => (
            <Pressable key={p.id} onPress={() => { tap(); setPmId(p.id); }} style={styles.pm}>
              <View style={[styles.cardIcon, { backgroundColor: colors.elevated }]}>
                <Ionicons name="card-outline" size={18} color={colors.text} />
              </View>
              <View style={{ flex: 1 }}>
                <T variant="headline">{p.brand} •••• {p.last4}</T>
                <T variant="caption" color={colors.textSecondary}>Expires {p.exp}</T>
              </View>
              <Ionicons name={pmId === p.id ? 'radio-button-on' : 'radio-button-off'} size={22} color={colors.text} />
            </Pressable>
          ))}
          <Pressable onPress={() => router.push('/settings/payments')} style={styles.pm}>
            <View style={[styles.cardIcon, { backgroundColor: colors.elevated }]}>
              <Ionicons name="add" size={20} color={colors.text} />
            </View>
            <T variant="headline">Add payment method</T>
          </Pressable>
        </Card>

        <T variant="title2" style={styles.h}>Message the host</T>
        <Input
          placeholder={`Hi ${l.host.name}, I'm coming for… (optional)`}
          value={message}
          onChangeText={setMessage}
          multiline
        />

        <T variant="title2" style={styles.h}>Price details</T>
        <Card>
          {nights > 0 ? (
            <>
              {line(`${money(l.price)} × ${nights} night${nights > 1 ? 's' : ''}`, money(price.base))}
              {price.weeklyDiscount > 0 && line('Weekly discount', `−${money(price.weeklyDiscount)}`, false, true)}
              {price.extraTotal > 0 && line('Extras', money(price.extraTotal))}
              {price.cleaning > 0 && line('Cleaning fee', money(price.cleaning))}
              {line('Staymark service fee', money(price.service))}
              {line('Taxes', money(price.taxes))}
              <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: colors.separator, marginVertical: 10 }} />
              {line(`Total (${settings.currency})`, money(price.total), true)}
            </>
          ) : (
            <T variant="callout" color={colors.textSecondary}>Choose dates to see the full price.</T>
          )}
        </Card>
        <T variant="caption" color={colors.textSecondary} style={{ marginTop: 12 }}>
          {l.cancellation} By selecting the button below, you agree to the House Rules and Staymark's Rebooking and Refund Policy.
        </T>
        {!!error && <T variant="callout" color={colors.danger} style={{ marginTop: 12 }}>{error}</T>}
      </Screen>
      <Footer>
        <View style={{ flex: 1 }}>
          <T variant="caption" color={colors.textSecondary}>{start && end ? `${formatRange(start, end)} · ${total} guest${total > 1 ? 's' : ''}` : 'Total'}</T>
          <T variant="title2">{nights ? money(price.total) : '—'}</T>
        </View>
        <Button title={l.instantBook ? 'Book now' : 'Request'} onPress={confirm} loading={loading} disabled={!nights} style={{ paddingHorizontal: 30 }} />
      </Footer>
    </View>
  );
}

const styles = StyleSheet.create({
  h: { marginTop: 22, marginBottom: 10 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 12, borderTopWidth: StyleSheet.hairlineWidth, marginTop: 12, paddingTop: 12 },
  extra: { flex: 1, borderRadius: radius.lg, padding: 12, gap: 4, alignItems: 'center', minHeight: 96, justifyContent: 'center' },
  pm: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10 },
  cardIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
