import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar, Chip, Empty, IconButton, T, tap } from '@/components/ui';
import { FeaturedCard, ListingRow, ListingTile } from '@/components/ListingCard';
import { TAB_BAR_SPACE } from '@/components/TabBar';
import { CATEGORIES, Category } from '@/lib/data';
import { useAuth } from '@/lib/auth';
import { useStore } from '@/lib/store';
import { radius, useTheme } from '@/lib/theme';

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

export default function Explore() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { listings, unreadNotifications, recentlyViewed, getListing, ratingFor } = useStore();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [cat, setCat] = useState<Category | 'all'>('all');

  const filtered = useMemo(
    () => (cat === 'all' ? listings : listings.filter((l) => l.categories.includes(cat))),
    [listings, cat]
  );
  const popular = useMemo(
    () => [...filtered].sort((a, b) => ratingFor(b).count * ratingFor(b).rating - ratingFor(a).count * ratingFor(a).rating).slice(0, 5),
    [filtered, ratingFor]
  );
  const recent = recentlyViewed.map(getListing).filter(Boolean).slice(0, 6) as NonNullable<ReturnType<typeof getListing>>[];
  const cardW = Math.min(width - 56, 420);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 6, paddingBottom: TAB_BAR_SPACE + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.px}>
          <View style={styles.top}>
            <Pressable onPress={() => router.push('/(tabs)/profile')} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
              <Avatar uri={user?.avatar} name={user?.name} size={40} />
              <View>
                <T variant="caption" color={colors.textSecondary}>{greeting()}!</T>
                <T variant="headline" numberOfLines={1}>{user?.name}</T>
              </View>
            </Pressable>
            <IconButton icon="notifications-outline" label="Notifications" badge={unreadNotifications > 0}
              onPress={() => router.push({ pathname: '/(tabs)/inbox', params: { tab: 'notifications' } })} />
          </View>

          <T variant="large" style={{ marginTop: 18 }}>
            Find <T variant="large" style={{ backgroundColor: colors.highlight }}> the best </T>
            {'\n'}for your holiday
          </T>

          <Pressable
            onPress={() => { tap(); router.push('/search'); }}
            style={({ pressed }) => [styles.search, { backgroundColor: colors.card, opacity: pressed ? 0.85 : 1 }]}
            accessibilityRole="search"
          >
            <Ionicons name="search" size={20} color={colors.text} />
            <View style={{ flex: 1 }}>
              <T variant="headline">Where to?</T>
              <T variant="caption" color={colors.textSecondary}>Anywhere · Any week · Add guests</T>
            </View>
            <View style={[styles.filterBtn, { borderColor: colors.border }]}>
              <Ionicons name="options-outline" size={18} color={colors.text} />
            </View>
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.px, { gap: 8, paddingVertical: 16 }]}>
          {CATEGORIES.map((c) => (
            <Chip
              key={c.key}
              label={c.label}
              icon={c.icon as never}
              active={cat === c.key}
              count={c.key === 'all' ? listings.length : undefined}
              onPress={() => setCat(c.key)}
            />
          ))}
        </ScrollView>

        {filtered.length === 0 ? (
          <Empty icon="search-outline" title="Nothing here yet" text="No stays in this category right now. Try another one." />
        ) : (
          <>
            <SectionTitle title="Popular stays" onMore={() => router.push({ pathname: '/results', params: { category: cat } })} />
            <FlatList
              horizontal
              data={popular}
              keyExtractor={(l) => l.id}
              renderItem={({ item }) => <FeaturedCard l={item} width={cardW} />}
              showsHorizontalScrollIndicator={false}
              snapToInterval={cardW + 12}
              decelerationRate="fast"
              contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
            />

            {recent.length > 0 && (
              <>
                <SectionTitle title="Recently viewed" />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
                  {recent.map((l) => <ListingTile key={l.id} l={l} width={150} />)}
                </ScrollView>
              </>
            )}

            <SectionTitle title="Recommended for you" />
            <View style={[styles.px, { gap: 12 }]}>
              {filtered.map((l) => <ListingRow key={l.id} l={l} />)}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function SectionTitle({ title, onMore }: { title: string; onMore?: () => void }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.px, styles.section]}>
      <T variant="title2">{title}</T>
      {onMore && (
        <Pressable onPress={onMore} hitSlop={8} style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
          <T variant="callout" color={colors.textSecondary}>See all</T>
          <Ionicons name="chevron-forward" size={15} color={colors.textSecondary} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  px: { paddingHorizontal: 20 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  search: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 18, paddingLeft: 18, paddingRight: 10, height: 64, borderRadius: radius.pill },
  filterBtn: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  section: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 22, marginBottom: 12 },
});
