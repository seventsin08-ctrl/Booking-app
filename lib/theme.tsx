import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import * as SystemUI from 'expo-system-ui';
import { storage } from './storage';

export type ThemeMode = 'system' | 'light' | 'dark';

const light = {
  bg: '#EEEBE6',
  card: '#FFFFFF',
  elevated: '#F6F4F0',
  text: '#111111',
  textSecondary: '#7C7771',
  textTertiary: '#ABA59E',
  border: '#E3DFD9',
  separator: 'rgba(60,60,67,0.14)',
  primary: '#111111',
  onPrimary: '#FFFFFF',
  accent: '#E0896A',
  accentSoft: '#F7E2D8',
  highlight: '#9FE3DA',
  success: '#5FA36A',
  successSoft: '#E3F1E3',
  warning: '#E5A33A',
  danger: '#E5484D',
  dangerSoft: '#FBE3E3',
  star: '#F5A524',
  overlay: 'rgba(0,0,0,0.35)',
  glass: 'rgba(255,255,255,0.85)',
  shadow: '#000000',
};

const dark: typeof light = {
  bg: '#000000',
  card: '#1C1C1E',
  elevated: '#2C2C2E',
  text: '#F5F5F7',
  textSecondary: '#98989F',
  textTertiary: '#636366',
  border: '#38383A',
  separator: 'rgba(84,84,88,0.6)',
  primary: '#FFFFFF',
  onPrimary: '#000000',
  accent: '#F09B7C',
  accentSoft: '#3A2620',
  highlight: '#2F6E66',
  success: '#6CC57A',
  successSoft: '#1E3322',
  warning: '#F0B04A',
  danger: '#FF6369',
  dangerSoft: '#3B1B1D',
  star: '#F5B642',
  overlay: 'rgba(0,0,0,0.55)',
  glass: 'rgba(28,28,30,0.88)',
  shadow: '#000000',
};

export type Colors = typeof light;

type ThemeCtx = {
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
  isDark: boolean;
  colors: Colors;
};

const Ctx = createContext<ThemeCtx>({ mode: 'system', setMode: () => {}, isDark: false, colors: light });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    storage.get<ThemeMode>('theme:mode', 'system').then(setModeState);
  }, []);

  const setMode = (m: ThemeMode) => {
    setModeState(m);
    storage.set('theme:mode', m);
  };

  const isDark = mode === 'system' ? system === 'dark' : mode === 'dark';
  const colors = isDark ? dark : light;

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.bg).catch(() => {});
  }, [colors.bg]);

  const value = useMemo(() => ({ mode, setMode, isDark, colors }), [mode, isDark, colors]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useTheme = () => useContext(Ctx);

export const radius = { sm: 10, md: 16, lg: 22, xl: 28, pill: 999 };
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28 };
