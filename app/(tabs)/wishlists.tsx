import React, { useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Empty, Segmented, T } from '@/components/ui';
import { ListingTile } from '@/components/ListingCard';
import { TAB_BAR_SPACE } from '@/components/TabBar';
import { Listing } from '@/lib/data';
import { useStore } from '@/lib/store';
import { useTheme } from '@/lib/theme';

export default function Wishlists() {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { favorites, recentlyViewed, getListing, clearRecentlyViewed } = useStore();
  const [tab, setTab] = useState<'saved' | 'recent'>('saved');
  const cols = width > 700 ? 3 : 2;
  const tileW = (width - 40 - (cols - 1) * 14) / cols;
  const ids = tab === 'saved' ? favorites : recentlyViewed;
  const items = ids.map(getListing).filter(Boolean) as Listing[];

  const clear = () => {
    if (Platform.OS === 'web') return clearRecentlyViewed();
    Alert.alert('Clear recently viewed?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: clearRecentlyViewed },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: TAB_BAR_SPACE + insets.bottom }} showsVerticalScrollIndicator={false}>
        <View style={styles.head}>
          <T variant="large">Saved</T>
          {tab === 'recent' && items.length > 0 && (
            <Pressable onPress={clear} hitSlop={8}><T style={{ fontWeight: '600', textDecorationLine: 'underline' }}>Clear</T></Pressable>
          )}
        </View>
        <Segmented
          value={tab}
          onChange={setTab}
          options={[{ key: 'saved', label: `Wishlist${favorites.length ? ` (${favorites.length})` : ''}` }, { key: 'recent', label: 'Recently viewed' }]}
        />
        {items.length === 0 ? (
          <Empty
            icon={tab === 'saved' ? 'heart-outline' : 'time-outline'}
            title={tab === 'saved' ? 'Create your first wishlist' : 'Nothing viewed yet'}
            text={tab === 'saved' ? 'As you search, tap the heart icon to save your favourite places to stay.' : 'Stays you open will appear here so you can find them again.'}
            action={<Button small title="Explore stays" onPress={() => router.push('/')} />}
          />
        ) : (
          <View style={styles.grid}>
            {items.map((l) => <ListingTile key={l.id} l={l} width={tileW} />)}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, minHeight: 64 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 18, rowGap: 20 },
});
