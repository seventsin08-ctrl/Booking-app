import React from 'react';
import { Image } from 'expo-image';
import { useTheme } from '@/lib/theme';

/** The Staymark bookmark mark. Tinted to the current theme. */
export function Logo({ size = 48, color }: { size?: number; color?: string }) {
  const { colors } = useTheme();
  return (
    <Image
      source={require('@/assets/images/splash-icon.png')}
      style={{ width: size, height: size }}
      tintColor={color ?? colors.text}
      contentFit="contain"
    />
  );
}
