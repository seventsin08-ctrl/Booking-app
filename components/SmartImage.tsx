import React, { useState } from 'react';
import { StyleProp, View } from 'react-native';
import { Image, ImageStyle } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme';

/** Image with caching, a soft placeholder and an offline fallback. */
export function SmartImage({ uri, style, seed }: { uri?: string; style?: StyleProp<ImageStyle>; seed?: string }) {
  const { colors } = useTheme();
  const [attempt, setAttempt] = useState(0);
  const fallback = `https://picsum.photos/seed/${encodeURIComponent(seed ?? uri ?? 'stay')}/900/700`;
  const src = attempt === 0 ? uri : attempt === 1 ? fallback : undefined;
  if (!src) {
    return (
      <View style={[style as object, { backgroundColor: colors.elevated, alignItems: 'center', justifyContent: 'center' }]}>
        <Ionicons name="image-outline" size={28} color={colors.textTertiary} />
      </View>
    );
  }
  return (
    <Image
      source={{ uri: src }}
      style={[{ backgroundColor: colors.elevated }, style]}
      contentFit="cover"
      transition={250}
      cachePolicy="memory-disk"
      onError={() => setAttempt((a) => a + 1)}
    />
  );
}
