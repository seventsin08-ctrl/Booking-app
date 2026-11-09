import React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, T } from '@/components/ui';
import { Logo } from '@/components/Logo';
import { SmartImage } from '@/components/SmartImage';
import { LISTINGS } from '@/lib/data';
import { radius, useTheme } from '@/lib/theme';

export default function Welcome() {
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { height, width } = useWindowDimensions();
  // Collage scales with the screen so the whole page always fits without scrolling
  const collageH = Math.min(Math.max(height * 0.42, 220), 420);
  const col = (width - 40 - 10) / 2;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top + 8, paddingBottom: insets.bottom + 12, paddingHorizontal: 20 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, height: 44 }}>
        <Logo size={26} />
        <T variant="title2" style={{ fontWeight: '700' }}>Staymark</T>
      </View>

      <View style={{ flexDirection: 'row', gap: 10, height: collageH, marginTop: 12 }}>
        <SmartImage uri={LISTINGS[0].images[0]} seed="w1" style={{ width: col, height: '100%', borderRadius: radius.xl }} />
        <View style={{ width: col, gap: 10 }}>
          <SmartImage uri={LISTINGS[4].images[0]} seed="w2" style={{ flex: 1, borderRadius: radius.xl }} />
          <SmartImage uri={LISTINGS[2].images[0]} seed="w3" style={{ flex: 1, borderRadius: radius.xl }} />
        </View>
      </View>

      <View style={{ flex: 1, justifyContent: 'center', gap: 10 }}>
        <T variant="large">
          Find the <T variant="large" style={[styles.hl, { backgroundColor: colors.highlight }]}> best </T> stay{'\n'}for your next trip
        </T>
        <T variant="body" color={colors.textSecondary}>
          Villas, cabins, city lofts and more. Bookmark the places you love and book in a few taps.
        </T>
      </View>

      <View style={{ gap: 10 }}>
        <Button title="Create account" onPress={() => router.push('/sign-up')} />
        <Button title="I already have an account" variant="secondary" onPress={() => router.push('/sign-in')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({ hl: { borderRadius: 8, overflow: 'hidden' } });
