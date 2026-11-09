import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Linking, Modal, Platform, Pressable, ScrollView, Share, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar, Button, Card, Divider, Empty, Footer, IconButton, Pill, T, tap } from '@/components/ui';
import { SmartImage } from '@/components/SmartImage';
import { Rating } from '@/components/ListingCard';
import { AMENITY_ICONS, formatMoney } from '@/lib/data';
import { useAuth } from '@/lib/auth';
import { useStore } from '@/lib/store';
import { radius, useTheme } from '@/lib/theme';

export default function ListingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { user } = useAuth();
  const { getListing, reviewsFor, ratingFor, isFavorite, toggleFavorite, viewListing, openConversation, settings, deleteListing } = useStore();
  const [page, setPage] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [showAmenities, setShowAmenities] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const l = getListing(id);

  useEffect(() => {
    if (l) viewListing(l.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [l?.id]);

  if (!l) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top, paddingHorizontal: 20 }}>
        <IconButton icon="chevron-back" onPress={() => router.back()} />
        <Empty icon="home-outline" title="Listing not found" text="This stay may have been removed by the host." />
      </View>
    );
  }

  const fav = isFavorite(l.id);
  const r = ratingFor(l);
  const reviews = reviewsFor(l.id);
  const heroH = Math.min(Math.round(height * 0.42), 420);
  const mine = l.createdBy && l.createdBy === user?.id;

  const share = () =>
    Share.share({ message: `Check out ${l.title} in ${l.city} on Staymark — ${formatMoney(l.price, settings.currency)}/night. staymark://listing/${l.id}` }).catch(() => {});

  const openMaps = () => {
    const label = encodeURIComponent(l.title);
    if (!l.lat && !l.lng) {
      const q = encodeURIComponent(l.address);
      return Linking.openURL(Platform.OS === 'ios' ? `maps:0,0?q=${q}` : `https://www.google.com/maps/search/?api=1&query=${q}`);
    }
    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${l.lat},${l.lng}`,
      android: `geo:${l.lat},${l.lng}?q=${l.lat},${l.lng}(${label})`,
      default: `https://www.google.com/maps/search/?api=1&query=${l.lat},${l.lng}`,
    })!;
    Linking.openURL(url).catch(() => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${l.lat},${l.lng}`));
  };

  const contact = () => {
    const c = openConversation(l.id);
    if (c) router.push(`/chat/${c}`);
  };

  const remove = () =>
    Alert.alert('Delete listing?', 'Guests will no longer be able to find or book this stay.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteListing(l.id); router.back(); } },
    ]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={{ height: heroH }}>
          <FlatList
            data={l.images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(u, i) => u + i}
            onMomentumScrollEnd={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / width))}
            renderItem={({ item, index }) => <SmartImage uri={item} seed={`${l.id}-${index}`} style={{ width, height: heroH }} />}
          />
          <View style={[styles.heroBar, { top: insets.top + 6 }]}>
            <IconButton icon="chevron-back" label="Back" onPress={() => router.back()} bg={colors.glass} />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <IconButton icon="share-outline" label="Share" onPress={share} bg={colors.glass} />
              <IconButton icon={fav ? 'heart' : 'heart-outline'} label="Save" onPress={() => toggleFavorite(l.id)}
                bg={colors.glass} iconColor={fav ? '#F0436A' : colors.text} />
            </View>
          </View>
          <View style={styles.dots}>
            {l.images.map((_, i) => (
              <View key={i} style={[styles.dot, { backgroundColor: i === page ? '#fff' : 'rgba(255,255,255,0.5)', width: i === page ? 16 : 6 }]} />
            ))}
          </View>
          <View style={[styles.priceTag]}>
            <T variant="caption" color="#fff" style={{ fontWeight: '700' }}>🔥 {formatMoney(l.price, settings.currency)}/night</T>
          </View>
        </View>

        <View style={[styles.sheet, { backgroundColor: colors.bg }]}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
            <View style={{ flex: 1, gap: 6 }}>
              <T variant="title">{l.title}</T>
              <Pressable onPress={openMaps} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Ionicons name="location" size={14} color={colors.textSecondary} />
                <T variant="callout" color={colors.textSecondary} style={{ textDecorationLine: 'underline' }}>{l.city}, {l.country}</T>
              </Pressable>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 2 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <T variant="title2">{r.rating ? r.rating.toFixed(2).replace(/0$/, '') : 'New'}</T>
                <Ionicons name="star" size={16} color={colors.star} />
              </View>
              <Pressable onPress={() => setShowReviews(true)}>
                <T variant="caption" color={colors.textSecondary} style={{ textDecorationLine: 'underline' }}>{r.count} reviews</T>
              </Pressable>
            </View>
          </View>

          <View style={styles.stats}>
            {[
              ['people-outline', `${l.guests} guests`],
              ['bed-outline', `${l.bedrooms} bedroom${l.bedrooms > 1 ? 's' : ''}`],
              ['moon-outline', `${l.beds} bed${l.beds > 1 ? 's' : ''}`],
              ['water-outline', `${l.baths} bath${l.baths > 1 ? 's' : ''}`],
            ].map(([icon, label]) => (
              <View key={label} style={[styles.stat, { backgroundColor: colors.card }]}>
                <Ionicons name={icon as never} size={18} color={colors.text} />
                <T variant="caption" style={{ fontWeight: '600' }}>{label}</T>
              </View>
            ))}
          </View>

          <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Avatar uri={l.host.avatar} name={l.host.name} size={48} />
            <View style={{ flex: 1 }}>
              <T variant="headline">Hosted by {l.host.name}</T>
              <T variant="caption" color={colors.textSecondary}>
                {l.host.superhost ? 'Superhost · ' : ''}{l.host.years} year{l.host.years === 1 ? '' : 's'} hosting · {l.host.responseRate}% response
              </T>
            </View>
            {!mine && <IconButton icon="chatbubble-ellipses-outline" label="Message host" onPress={contact} bg={colors.elevated} />}
          </Card>

          <View style={{ gap: 16, marginTop: 20 }}>
            {l.highlights.map((h) => (
              <View key={h.title} style={{ flexDirection: 'row', gap: 14 }}>
                <Ionicons name={h.icon as never} size={24} color={colors.text} />
                <View style={{ flex: 1 }}>
                  <T variant="headline">{h.title}</T>
                  <T variant="callout" color={colors.textSecondary}>{h.text}</T>
                </View>
              </View>
            ))}
          </View>

          <Divider />
          <T variant="title2" style={{ marginBottom: 8 }}>About</T>
          <T color={colors.textSecondary} numberOfLines={expanded ? undefined : 4}>{l.description}</T>
          <Pressable onPress={() => setExpanded((e) => !e)} style={{ marginTop: 8 }}>
            <T style={{ fontWeight: '600', textDecorationLine: 'underline' }}>{expanded ? 'Show less' : 'Read more'}</T>
          </Pressable>

          <Divider />
          <T variant="title2" style={{ marginBottom: 12 }}>Amenities</T>
          <View style={styles.amenities}>
            {l.amenities.slice(0, 5).map((a) => (
              <View key={a} style={[styles.amenity, { backgroundColor: colors.card }]}>
                <Ionicons name={(AMENITY_ICONS[a] ?? 'checkmark-outline') as never} size={16} color={colors.text} />
                <T variant="callout">{a}</T>
              </View>
            ))}
            {l.amenities.length > 5 && (
              <Pressable onPress={() => setShowAmenities(true)} style={[styles.amenity, { backgroundColor: colors.card }]}>
                <T variant="callout" style={{ fontWeight: '600' }}>+{l.amenities.length - 5}</T>
              </Pressable>
            )}
          </View>

          <Divider />
          <T variant="title2" style={{ marginBottom: 4 }}>Where you'll be</T>
          <T variant="callout" color={colors.textSecondary} style={{ marginBottom: 12 }}>{l.address}</T>
          <Pressable onPress={openMaps} style={[styles.map, { backgroundColor: colors.card }]}>
            <SmartImage uri={l.images[1] ?? l.images[0]} seed={`${l.id}-map`} style={[StyleSheet.absoluteFill, { opacity: 0.35, borderRadius: radius.lg }]} />
            <View style={[styles.pin, { backgroundColor: colors.primary }]}>
              <Ionicons name="home" size={20} color={colors.onPrimary} />
            </View>
            <View style={[styles.mapBtn, { backgroundColor: colors.card }]}>
              <Ionicons name="navigate-outline" size={15} color={colors.text} />
              <T variant="caption" style={{ fontWeight: '600' }}>Open in Maps</T>
            </View>
          </Pressable>

          <Divider />
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="star" size={18} color={colors.star} />
              <T variant="title2">{r.rating ? r.rating.toFixed(2).replace(/0$/, '') : 'New'} · {r.count} reviews</T>
            </View>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }} style={{ marginHorizontal: -20 }}>
            <View style={{ width: 8 }} />
            {reviews.slice(0, 6).map((rv) => (
              <Card key={rv.id} style={{ width: Math.min(width * 0.78, 320), gap: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Avatar uri={rv.avatar} name={rv.author} size={38} />
                  <View style={{ flex: 1 }}>
                    <T variant="headline">{rv.author}</T>
                    <T variant="caption" color={colors.textSecondary}>{new Date(rv.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</T>
                  </View>
                  <Rating value={rv.rating} />
                </View>
                <T variant="callout" color={colors.textSecondary} numberOfLines={4}>{rv.text}</T>
              </Card>
            ))}
            <View style={{ width: 8 }} />
          </ScrollView>
          {reviews.length > 0 && (
            <Button title={`Show all ${reviews.length} reviews`} variant="outline" onPress={() => setShowReviews(true)} style={{ marginTop: 14 }} />
          )}

          <Divider />
          <T variant="title2" style={{ marginBottom: 10 }}>Things to know</T>
          <Card style={{ gap: 14 }}>
            <View style={{ gap: 6 }}>
              <T variant="headline">House rules</T>
              {l.rules.map((x) => (
                <View key={x} style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                  <Ionicons name="checkmark" size={15} color={colors.textSecondary} />
                  <T variant="callout" color={colors.textSecondary}>{x}</T>
                </View>
              ))}
            </View>
            <View style={{ gap: 6 }}>
              <T variant="headline">Cancellation policy</T>
              <T variant="callout" color={colors.textSecondary}>{l.cancellation}</T>
            </View>
            <View style={{ gap: 6 }}>
              <T variant="headline">Safety & property</T>
              <T variant="callout" color={colors.textSecondary}>
                {l.amenities.includes('Smoke alarm') ? 'Smoke alarm installed' : 'No smoke alarm reported'} ·{' '}
                {l.amenities.includes('Security cameras') ? 'Security cameras on property' : 'No security cameras'}
              </T>
            </View>
          </Card>
          {mine && <Button title="Delete this listing" variant="danger" icon="trash-outline" onPress={remove} style={{ marginTop: 20 }} />}
        </View>
      </ScrollView>

      <Footer>
        <View style={{ flex: 1 }}>
          <T variant="title2">{formatMoney(l.price, settings.currency)}<T variant="callout" color={colors.textSecondary}> / night</T></T>
          <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center', marginTop: 2 }}>
            {l.instantBook ? <Pill label="Instant Book" icon="flash" tone="success" /> : <T variant="caption" color={colors.textSecondary}>Host confirms within 24h</T>}
          </View>
        </View>
        <Button title={mine ? 'Your listing' : 'Reserve'} disabled={!!mine} onPress={() => { tap(); router.push(`/book/${l.id}`); }} style={{ paddingHorizontal: 34 }} />
      </Footer>

      <Modal visible={showAmenities} animationType="slide" presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : undefined} onRequestClose={() => setShowAmenities(false)}>
        <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: Platform.OS === 'ios' ? 12 : insets.top + 8, paddingHorizontal: 20 }}>
          <IconButton icon="close" onPress={() => setShowAmenities(false)} label="Close" />
          <T variant="title" style={{ marginVertical: 12 }}>What this place offers</T>
          <ScrollView>
            {l.amenities.map((a) => (
              <View key={a} style={[styles.amenityRow, { borderColor: colors.separator }]}>
                <Ionicons name={(AMENITY_ICONS[a] ?? 'checkmark-outline') as never} size={22} color={colors.text} />
                <T>{a}</T>
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>

      <Modal visible={showReviews} animationType="slide" presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : undefined} onRequestClose={() => setShowReviews(false)}>
        <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: Platform.OS === 'ios' ? 12 : insets.top + 8 }}>
          <View style={{ paddingHorizontal: 20 }}>
            <IconButton icon="close" onPress={() => setShowReviews(false)} label="Close" />
            <T variant="title" style={{ marginVertical: 12 }}>★ {r.rating ? r.rating.toFixed(2) : 'New'} · {r.count} reviews</T>
          </View>
          <FlatList
            data={reviews}
            keyExtractor={(x) => x.id}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 12, paddingBottom: insets.bottom + 20 }}
            renderItem={({ item: rv }) => (
              <Card style={{ gap: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Avatar uri={rv.avatar} name={rv.author} size={38} />
                  <View style={{ flex: 1 }}>
                    <T variant="headline">{rv.author}</T>
                    <T variant="caption" color={colors.textSecondary}>{new Date(rv.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</T>
                  </View>
                  <Rating value={rv.rating} />
                </View>
                <T variant="callout" color={colors.textSecondary}>{rv.text}</T>
              </Card>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  heroBar: { position: 'absolute', left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between' },
  dots: { position: 'absolute', bottom: 38, alignSelf: 'center', flexDirection: 'row', gap: 5 },
  dot: { height: 6, borderRadius: 3 },
  priceTag: { position: 'absolute', right: 16, bottom: 38, backgroundColor: 'rgba(20,20,20,0.6)', paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.pill },
  sheet: { marginTop: -24, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: 20, paddingTop: 24 },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 18 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, height: 38, borderRadius: radius.pill },
  amenities: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  amenity: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 14, height: 42, borderRadius: radius.md },
  amenityRow: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 16, borderBottomWidth: StyleSheet.hairlineWidth },
  map: { height: 170, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  pin: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  mapBtn: { position: 'absolute', bottom: 12, right: 12, flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, height: 32, borderRadius: radius.pill },
});
