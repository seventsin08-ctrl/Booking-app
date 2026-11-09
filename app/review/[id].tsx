import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Card, Header, Input, Screen, T, tap } from '@/components/ui';
import { SmartImage } from '@/components/SmartImage';
import { formatRange } from '@/lib/data';
import { useStore } from '@/lib/store';
import { useTheme } from '@/lib/theme';

const LABELS = ['', 'Terrible', 'Poor', 'Okay', 'Great', 'Amazing'];

export default function ReviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const router = useRouter();
  const { bookings, getListing, addReview } = useStore();
  const b = bookings.find((x) => x.id === id);
  const l = b && getListing(b.listingId);
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!b) return;
    if (!rating) return setError('Tap a star to rate your stay.');
    if (text.trim().length < 10) return setError('Tell us a little more (at least 10 characters).');
    setLoading(true);
    await addReview(b.id, rating, text);
    setLoading(false);
    router.back();
  };

  return (
    <Screen edges={['top', 'bottom']} keyboard>
      <Header title="Write a review" />
      {l && b && (
        <Card style={{ flexDirection: 'row', gap: 12, alignItems: 'center', padding: 10 }}>
          <SmartImage uri={l.images[0]} seed={l.id} style={{ width: 64, height: 64, borderRadius: 12 }} />
          <View style={{ flex: 1 }}>
            <T variant="headline">{l.title}</T>
            <T variant="caption" color={colors.textSecondary}>{formatRange(b.checkIn, b.checkOut)} · Hosted by {l.host.name}</T>
          </View>
        </Card>
      )}
      <T variant="title" center style={{ marginTop: 28 }}>How was your stay?</T>
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10, marginTop: 16 }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Pressable key={n} onPress={() => { tap(); setRating(n); setError(''); }} hitSlop={4} accessibilityLabel={`${n} stars`}>
            <Ionicons name={n <= rating ? 'star' : 'star-outline'} size={40} color={n <= rating ? colors.star : colors.textTertiary} />
          </Pressable>
        ))}
      </View>
      <T center color={colors.textSecondary} style={{ marginTop: 8, height: 22 }}>{LABELS[rating]}</T>
      <View style={{ marginTop: 18 }}>
        <Input label="Your review" placeholder="What did you love? What could be better?" value={text} onChangeText={setText} multiline maxLength={600} />
        <T variant="caption" color={colors.textTertiary} style={{ alignSelf: 'flex-end', marginTop: 4 }}>{text.length}/600</T>
      </View>
      {!!error && <T color={colors.danger} style={{ marginTop: 8 }}>{error}</T>}
      <View style={{ flex: 1, minHeight: 20 }} />
      <Button title="Submit review" onPress={submit} loading={loading} />
    </Screen>
  );
}
