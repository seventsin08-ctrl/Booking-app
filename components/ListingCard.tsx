import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Listing, formatMoney } from '@/lib/data';
import { useStore } from '@/lib/store';
import { radius, useTheme } from '@/lib/theme';
import { SmartImage } from './SmartImage';
import { T, tap } from './ui';

export function HeartButton({ id, size = 38 }: { id: string; size?: number }) {
  const { isFavorite, toggleFavorite } = useStore();
  const { colors } = useTheme();
  const fav = isFavorite(id);
  return (
    <Pressable
      accessibilityLabel={fav ? 'Remove from wishlist' : 'Save to wishlist'}
      hitSlop={8}
      onPress={() => {
        tap();
        toggleFavorite(id);
      }}
      style={{ width: size, height: size, borderRadius: 12, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' }}
    >
      <Ionicons name={fav ? 'heart' : 'heart-outline'} size={size * 0.52} color={fav ? '#F0436A' : colors.text} />
    </Pressable>
  );
}

export function Rating({ value, count, color }: { value: number; count?: number; color?: string }) {
  const { colors } = useTheme();
  if (!value) return <T variant="caption" color={color ?? colors.textSecondary}>New</T>;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
      <Ionicons name="star" size={12} color={colors.star} />
      <T variant="caption" color={color} style={{ fontWeight: '600' }}>{value.toFixed(2).replace(/0$/, '')}</T>
      {count != null && <T variant="caption" color={color ?? colors.textSecondary}>({count})</T>}
    </View>
  );
}

/** Large hero card with the info floating over the photo (Explore → Popular). */
export function FeaturedCard({ l, width }: { l: Listing; width: number }) {
  const router = useRouter();
  const { ratingFor, settings } = useStore();
  const { colors } = useTheme();
  const r = ratingFor(l);
  return (
    <Pressable onPress={() => router.push(`/listing/${l.id}`)} style={{ width }}>
      <View style={[styles.featured, { backgroundColor: colors.card }]}>
        <SmartImage uri={l.images[0]} seed={l.id} style={{ width: '100%', height: '100%', borderRadius: radius.lg }} />
        <View style={{ position: 'absolute', top: 18, right: 18 }}>
          <HeartButton id={l.id} />
        </View>
        <View style={styles.featuredInfo}>
          <T variant="headline" color="#fff" numberOfLines={1}>{l.title}</T>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 }}>
              <Ionicons name="location" size={12} color="#ddd" />
              <T variant="caption" color="#ddd" numberOfLines={1}>{l.city}, {l.country}</T>
            </View>
            <Rating value={r.rating} color="#fff" />
          </View>
          <T variant="caption" color="#fff" style={{ marginTop: 6, fontWeight: '700' }}>
            {formatMoney(l.price, settings.currency)} <T variant="caption" color="#ddd">/ night</T>
          </T>
        </View>
      </View>
    </Pressable>
  );
}

/** Compact horizontal row card (Explore list, wishlist, search). */
export function ListingRow({ l }: { l: Listing }) {
  const router = useRouter();
  const { ratingFor, settings } = useStore();
  const { colors } = useTheme();
  const r = ratingFor(l);
  return (
    <Pressable
      onPress={() => router.push(`/listing/${l.id}`)}
      style={({ pressed }) => [styles.row, { backgroundColor: colors.card, opacity: pressed ? 0.9 : 1 }]}
    >
      <SmartImage uri={l.images[0]} seed={l.id} style={styles.rowImg} />
      <View style={{ flex: 1, paddingVertical: 4, gap: 3 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <T variant="caption" color={colors.textSecondary} style={{ flex: 1 }} numberOfLines={1}>{l.type} · {l.city}</T>
          <Rating value={r.rating} />
        </View>
        <T variant="headline" numberOfLines={1}>{l.title}</T>
        <T variant="caption" color={colors.textSecondary} numberOfLines={1}>
          {l.guests} guests · {l.bedrooms} bd · {l.baths} ba
        </T>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 'auto' }}>
          <T variant="headline" style={{ flex: 1 }}>
            {formatMoney(l.price, settings.currency)}<T variant="caption" color={colors.textSecondary}> / night</T>
          </T>
          <HeartButton id={l.id} size={32} />
        </View>
      </View>
    </Pressable>
  );
}

/** Grid card (wishlist grid / host). */
export function ListingTile({ l, width }: { l: Listing; width: number }) {
  const router = useRouter();
  const { ratingFor, settings } = useStore();
  const { colors } = useTheme();
  const r = ratingFor(l);
  return (
    <Pressable onPress={() => router.push(`/listing/${l.id}`)} style={{ width, gap: 6 }}>
      <View>
        <SmartImage uri={l.images[0]} seed={l.id} style={{ width, height: width, borderRadius: radius.lg }} />
        <View style={{ position: 'absolute', top: 10, right: 10 }}>
          <HeartButton id={l.id} size={32} />
        </View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <T variant="callout" style={{ flex: 1, fontWeight: '600' }} numberOfLines={1}>{l.city}</T>
        <Rating value={r.rating} />
      </View>
      <T variant="caption" color={colors.textSecondary} numberOfLines={1}>{l.title}</T>
      <T variant="callout" style={{ fontWeight: '600' }}>
        {formatMoney(l.price, settings.currency)}<T variant="caption" color={colors.textSecondary}> night</T>
      </T>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  featured: { height: 340, borderRadius: radius.xl, padding: 8 },
  featuredInfo: {
    position: 'absolute', left: 18, right: 18, bottom: 18, padding: 14, borderRadius: radius.md,
    backgroundColor: 'rgba(20,20,20,0.55)',
  },
  row: { flexDirection: 'row', gap: 12, padding: 10, borderRadius: radius.lg },
  rowImg: { width: 104, height: 112, borderRadius: radius.md },
});
