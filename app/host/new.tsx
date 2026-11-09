import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Button, Card, Chip, Header, Input, Screen, Stepper, SwitchRow, T } from '@/components/ui';
import { SmartImage } from '@/components/SmartImage';
import { ALL_AMENITIES, CATEGORIES, Category, LISTINGS, Listing } from '@/lib/data';
import { useAuth } from '@/lib/auth';
import { useStore } from '@/lib/store';
import { radius, useTheme } from '@/lib/theme';

const TYPES: Listing['type'][] = ['Entire home', 'Apartment', 'Villa', 'Cabin', 'Private room', 'Tiny home'];
const STOCK = [LISTINGS[5].images, LISTINGS[1].images, LISTINGS[2].images].flat();

export default function NewListing() {
  const { colors } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { createListing, setHostMode } = useStore();
  const [title, setTitle] = useState('');
  const [type, setType] = useState<Listing['type']>('Entire home');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [address, setAddress] = useState('');
  const [price, setPrice] = useState('');
  const [cleaning, setCleaning] = useState('');
  const [description, setDescription] = useState('');
  const [guests, setGuests] = useState(2);
  const [bedrooms, setBedrooms] = useState(1);
  const [beds, setBeds] = useState(1);
  const [baths, setBaths] = useState(1);
  const [amenities, setAmenities] = useState<string[]>(['Wi-Fi', 'Kitchen']);
  const [cats, setCats] = useState<Category[]>([]);
  const [instant, setInstant] = useState(true);
  const [photos, setPhotos] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const addPhotos = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return Alert.alert('Permission needed', 'Allow photo access to add pictures of your place.');
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsMultipleSelection: true, selectionLimit: 8, quality: 0.6 });
    if (!r.canceled) setPhotos((p) => [...p, ...r.assets.map((a) => a.uri)].slice(0, 8));
  };

  const publish = async () => {
    setError('');
    const p = Number(price);
    if (title.trim().length < 5) return setError('Give your place a title (5+ characters).');
    if (!city.trim() || !country.trim()) return setError('Add the city and country.');
    if (!p || p < 10) return setError('Set a nightly price of at least $10.');
    if (description.trim().length < 20) return setError('Describe your place in at least 20 characters.');
    setLoading(true);
    try {
      const images = photos.length ? photos : [...STOCK].sort(() => Math.random() - 0.5).slice(0, 4);
      const l = await createListing({
        title: title.trim(), type, city: city.trim(), country: country.trim(), address: address.trim() || `${city.trim()}, ${country.trim()}`,
        lat: 0, lng: 0, price: p, cleaningFee: Number(cleaning) || 0, categories: cats.length ? cats : ['city'], images,
        guests, bedrooms, beds, baths, amenities, description: description.trim(),
        highlights: [
          { icon: 'sparkles-outline', title: 'New on Staymark', text: 'Be one of the first guests to stay here.' },
          ...(instant ? [{ icon: 'flash-outline', title: 'Instant Book', text: 'Book without waiting for approval.' }] : []),
        ],
        host: { name: user?.name.split(' ')[0] ?? 'Host', avatar: user?.avatar ?? '', superhost: false, years: 0, responseRate: 100, userId: user?.id },
        rules: ['Check-in after 3:00 PM', 'Checkout before 11:00 AM', 'No parties or events'],
        cancellation: 'Free cancellation up to 48 hours before check-in.', checkInTime: '3:00 PM', checkOutTime: '11:00 AM', instantBook: instant,
      });
      setHostMode(true);
      router.replace(`/listing/${l.id}`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const toggle = <K extends string>(list: K[], set: (v: K[]) => void, v: K) => set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  return (
    <Screen edges={['top', 'bottom']} keyboard>
      <Header title="List your space" />
      <T variant="title" style={{ marginTop: 6, marginBottom: 16 }}>Tell us about your place</T>

      <T variant="headline" style={styles.h}>Photos</T>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
        <Pressable onPress={addPhotos} style={[styles.photo, styles.add, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <Ionicons name="camera-outline" size={26} color={colors.text} />
          <T variant="caption">Add photos</T>
        </Pressable>
        {photos.map((p, i) => (
          <View key={p + i}>
            <SmartImage uri={p} style={styles.photo} />
            <Pressable onPress={() => setPhotos(photos.filter((_, j) => j !== i))} style={styles.remove} hitSlop={6}>
              <Ionicons name="close" size={14} color="#fff" />
            </Pressable>
          </View>
        ))}
      </ScrollView>
      {photos.length === 0 && <T variant="caption" color={colors.textSecondary} style={{ marginTop: 6 }}>No photos? We'll use beautiful placeholders until you add your own.</T>}

      <View style={{ gap: 12, marginTop: 18 }}>
        <Input label="Title" value={title} onChangeText={setTitle} placeholder="Sunny loft with rooftop terrace" maxLength={60} />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}><Input label="City" value={city} onChangeText={setCity} /></View>
          <View style={{ flex: 1 }}><Input label="Country" value={country} onChangeText={setCountry} /></View>
        </View>
        <Input label="Street address" value={address} onChangeText={setAddress} placeholder="Only shared after booking" />
      </View>

      <T variant="headline" style={styles.h}>Type of place</T>
      <View style={styles.wrap}>{TYPES.map((t) => <Chip key={t} label={t} active={type === t} onPress={() => setType(t)} />)}</View>

      <T variant="headline" style={styles.h}>Category</T>
      <View style={styles.wrap}>
        {CATEGORIES.filter((c) => c.key !== 'all').map((c) => (
          <Chip key={c.key} label={c.label} icon={c.icon as never} active={cats.includes(c.key as Category)} onPress={() => toggle(cats, setCats, c.key as Category)} />
        ))}
      </View>

      <T variant="headline" style={styles.h}>Basics</T>
      <Card style={{ paddingVertical: 4 }}>
        <Stepper label="Guests" value={guests} min={1} max={16} onChange={setGuests} />
        <Stepper label="Bedrooms" value={bedrooms} min={1} max={10} onChange={setBedrooms} />
        <Stepper label="Beds" value={beds} min={1} max={16} onChange={setBeds} />
        <Stepper label="Bathrooms" value={baths} min={1} max={8} onChange={setBaths} />
      </Card>

      <T variant="headline" style={styles.h}>Amenities</T>
      <View style={styles.wrap}>{ALL_AMENITIES.map((a) => <Chip key={a} label={a} active={amenities.includes(a)} onPress={() => toggle(amenities, setAmenities, a)} />)}</View>

      <View style={{ gap: 12, marginTop: 18 }}>
        <Input label="Description" value={description} onChangeText={setDescription} multiline maxLength={800}
          placeholder="What makes your place special? Describe the space, the neighbourhood and getting around." />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}><Input label="Price per night (USD)" icon="pricetag-outline" value={price} onChangeText={(t) => setPrice(t.replace(/\D/g, ''))} keyboardType="number-pad" placeholder="120" /></View>
          <View style={{ flex: 1 }}><Input label="Cleaning fee (USD)" value={cleaning} onChangeText={(t) => setCleaning(t.replace(/\D/g, ''))} keyboardType="number-pad" placeholder="0" /></View>
        </View>
      </View>

      <View style={{ backgroundColor: colors.card, borderRadius: radius.lg, marginTop: 18, overflow: 'hidden' }}>
        <SwitchRow icon="flash-outline" title="Instant Book" subtitle="Guests can book without waiting for approval" value={instant} onChange={setInstant} />
      </View>
      {!!error && <T color={colors.danger} style={{ marginTop: 12 }}>{error}</T>}
      <Button title="Publish listing" onPress={publish} loading={loading} style={{ marginTop: 20 }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  h: { marginTop: 20, marginBottom: 10 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  photo: { width: 100, height: 100, borderRadius: radius.md },
  add: { borderWidth: 1.2, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: 4 },
  remove: { position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
});
