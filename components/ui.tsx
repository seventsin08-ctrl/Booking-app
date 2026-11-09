import React, { useState } from 'react';
import {
  ActivityIndicator, Platform, Pressable, ScrollView, StyleProp, StyleSheet, Switch, Text, TextInput,
  TextInputProps, TextStyle, View, ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { radius, useTheme } from '@/lib/theme';

export type IconName = React.ComponentProps<typeof Ionicons>['name'];

let hapticsEnabled = true;
export const setHapticsEnabled = (v: boolean) => {
  hapticsEnabled = v;
};

export function tap(style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) {
  if (hapticsEnabled && Platform.OS !== 'web') Haptics.impactAsync(style).catch(() => {});
}

export function T({
  children, style, variant = 'body', color, numberOfLines, center,
}: {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
  variant?: 'large' | 'title' | 'title2' | 'headline' | 'body' | 'callout' | 'caption' | 'footnote';
  color?: string;
  numberOfLines?: number;
  center?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <Text
      numberOfLines={numberOfLines}
      style={[typo[variant], { color: color ?? colors.text }, center && { textAlign: 'center' }, style]}
    >
      {children}
    </Text>
  );
}

export const typo = StyleSheet.create({
  large: { fontSize: 32, fontWeight: '700', letterSpacing: -0.6 },
  title: { fontSize: 26, fontWeight: '700', letterSpacing: -0.4 },
  title2: { fontSize: 20, fontWeight: '600', letterSpacing: -0.3 },
  headline: { fontSize: 16, fontWeight: '600', letterSpacing: -0.2 },
  body: { fontSize: 15, lineHeight: 21 },
  callout: { fontSize: 14, lineHeight: 19 },
  caption: { fontSize: 12.5 },
  footnote: { fontSize: 11, fontWeight: '500' },
});

/** Full-screen container that respects the notch/home indicator without extra vertical padding. */
export function Screen({
  children, scroll = true, edges = ['top'], contentStyle, padded = true, bottomInset = 0, keyboard,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  edges?: ('top' | 'bottom')[];
  contentStyle?: StyleProp<ViewStyle>;
  padded?: boolean;
  bottomInset?: number;
  keyboard?: boolean;
}) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const pt = edges.includes('top') ? insets.top : 0;
  const pb = (edges.includes('bottom') ? insets.bottom : 0) + bottomInset;
  const inner = [padded && { paddingHorizontal: 20 }, contentStyle];
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: pt }}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={[{ paddingBottom: pb + 16, flexGrow: 1 }, inner]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={keyboard ? 'interactive' : 'on-drag'}
          automaticallyAdjustKeyboardInsets
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[{ flex: 1, paddingBottom: pb }, inner]}>{children}</View>
      )}
    </View>
  );
}

export function Header({
  title, right, back = true, large, onBack, transparent,
}: {
  title?: string;
  right?: React.ReactNode;
  back?: boolean;
  large?: boolean;
  onBack?: () => void;
  transparent?: boolean;
}) {
  const router = useRouter();
  return (
    <View style={[styles.header, transparent && { position: 'absolute', left: 20, right: 20, zIndex: 5 }]}>
      <View style={{ width: 44 }}>
        {back && (
          <IconButton
            icon="chevron-back"
            onPress={onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/')))}
            label="Back"
          />
        )}
      </View>
      {!large && (
        <T variant="headline" numberOfLines={1} style={{ flex: 1, textAlign: 'center' }}>
          {title}
        </T>
      )}
      {large && <View style={{ flex: 1 }} />}
      <View style={{ minWidth: 44, alignItems: 'flex-end' }}>{right}</View>
    </View>
  );
}

export function IconButton({
  icon, onPress, size = 44, label, filled, badge, iconColor, bg, style,
}: {
  icon: IconName;
  onPress?: () => void;
  size?: number;
  label?: string;
  filled?: boolean;
  badge?: boolean;
  iconColor?: string;
  bg?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      onPress={() => {
        tap();
        onPress?.();
      }}
      style={({ pressed }) => [
        {
          width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center',
          backgroundColor: bg ?? (filled ? colors.primary : colors.card), opacity: pressed ? 0.7 : 1,
        },
        style,
      ]}
    >
      <Ionicons name={icon} size={size * 0.45} color={iconColor ?? (filled ? colors.onPrimary : colors.text)} />
      {badge && <View style={[styles.dot, { backgroundColor: colors.accent, borderColor: bg ?? colors.card }]} />}
    </Pressable>
  );
}

export function Button({
  title, onPress, variant = 'primary', icon, loading, disabled, style, small,
}: {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  small?: boolean;
}) {
  const { colors } = useTheme();
  const bg = {
    primary: colors.primary, secondary: colors.card, outline: 'transparent', ghost: 'transparent', danger: colors.dangerSoft,
  }[variant];
  const fg = { primary: colors.onPrimary, secondary: colors.text, outline: colors.text, ghost: colors.text, danger: colors.danger }[variant];
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={() => {
        tap(Haptics.ImpactFeedbackStyle.Medium);
        onPress?.();
      }}
      style={({ pressed }) => [
        {
          height: small ? 40 : 54, paddingHorizontal: small ? 16 : 22, borderRadius: radius.pill, backgroundColor: bg,
          alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8,
          borderWidth: variant === 'outline' ? 1.2 : 0, borderColor: colors.border,
          opacity: disabled ? 0.4 : pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <>
          {icon && <Ionicons name={icon} size={small ? 16 : 19} color={fg} />}
          <Text style={{ color: fg, fontSize: small ? 14 : 16, fontWeight: '600' }}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}

export function Card({ children, style, onPress }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void }) {
  const { colors } = useTheme();
  const base = [{ backgroundColor: colors.card, borderRadius: radius.lg, padding: 16 }, style];
  if (!onPress) return <View style={base}>{children}</View>;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [base, { opacity: pressed ? 0.85 : 1 }]}>
      {children}
    </Pressable>
  );
}

export function Input({
  label, icon, secure, error, style, ...rest
}: TextInputProps & { label?: string; icon?: IconName; secure?: boolean; error?: string }) {
  const { colors } = useTheme();
  const [hidden, setHidden] = useState(!!secure);
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ gap: 6 }}>
      {label && <T variant="caption" color={colors.textSecondary} style={{ marginLeft: 4, fontWeight: '500' }}>{label}</T>}
      <View
        style={[
          styles.input,
          { backgroundColor: colors.card, borderColor: error ? colors.danger : focused ? colors.text : colors.border },
          rest.multiline && { height: undefined, minHeight: 100, alignItems: 'flex-start', paddingVertical: 12 },
        ]}
      >
        {icon && <Ionicons name={icon} size={19} color={colors.textSecondary} />}
        <TextInput
          placeholderTextColor={colors.textTertiary}
          secureTextEntry={hidden}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[{ flex: 1, color: colors.text, fontSize: 16, paddingVertical: 0 }, rest.multiline && { textAlignVertical: 'top' }, style]}
          {...rest}
        />
        {secure && (
          <Pressable onPress={() => setHidden((h) => !h)} hitSlop={10} accessibilityLabel={hidden ? 'Show password' : 'Hide password'}>
            <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={20} color={colors.textSecondary} />
          </Pressable>
        )}
      </View>
      {!!error && <T variant="caption" color={colors.danger} style={{ marginLeft: 4 }}>{error}</T>}
    </View>
  );
}

export function Chip({
  label, active, onPress, icon, count,
}: { label: string; active?: boolean; onPress?: () => void; icon?: IconName; count?: number }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={() => {
        tap();
        onPress?.();
      }}
      style={({ pressed }) => [
        styles.chip,
        { backgroundColor: active ? colors.primary : colors.card, opacity: pressed ? 0.8 : 1 },
      ]}
    >
      {icon && <Ionicons name={icon} size={16} color={active ? colors.onPrimary : colors.text} />}
      <Text style={{ color: active ? colors.onPrimary : colors.text, fontWeight: '600', fontSize: 14 }}>{label}</Text>
      {count != null && (
        <Text style={{ color: active ? colors.onPrimary : colors.textSecondary, fontSize: 12, opacity: 0.8 }}>{count}</Text>
      )}
    </Pressable>
  );
}

export function Segmented<K extends string>({
  options, value, onChange,
}: { options: { key: K; label: string; badge?: number }[]; value: K; onChange: (k: K) => void }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.segment, { backgroundColor: colors.card }]}>
      {options.map((o) => {
        const active = o.key === value;
        return (
          <Pressable
            key={o.key}
            onPress={() => {
              tap();
              onChange(o.key);
            }}
            style={[styles.segmentItem, active && { backgroundColor: colors.primary }]}
          >
            <Text style={{ color: active ? colors.onPrimary : colors.textSecondary, fontWeight: '600', fontSize: 14 }}>
              {o.label}
            </Text>
            {!!o.badge && (
              <View style={[styles.badge, { backgroundColor: colors.accent }]}>
                <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>{o.badge}</Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

/** iOS-style inset grouped list */
export function Group({ title, children, footer }: { title?: string; children: React.ReactNode; footer?: string }) {
  const { colors } = useTheme();
  const items = React.Children.toArray(children).filter(Boolean);
  return (
    <View style={{ marginBottom: 22 }}>
      {title && (
        <T variant="footnote" color={colors.textSecondary} style={{ marginLeft: 16, marginBottom: 7, textTransform: 'uppercase', letterSpacing: 0.4 }}>
          {title}
        </T>
      )}
      <View style={{ backgroundColor: colors.card, borderRadius: radius.lg, overflow: 'hidden' }}>
        {items.map((c, i) => (
          <View key={i}>
            {c}
            {i < items.length - 1 && <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: colors.separator, marginLeft: 56 }} />}
          </View>
        ))}
      </View>
      {footer && (
        <T variant="caption" color={colors.textSecondary} style={{ marginHorizontal: 16, marginTop: 7, lineHeight: 17 }}>
          {footer}
        </T>
      )}
    </View>
  );
}

export function Row({
  icon, title, subtitle, value, onPress, chevron = true, danger, right, iconBg,
}: {
  icon?: IconName;
  title: string;
  subtitle?: string;
  value?: string;
  onPress?: () => void;
  chevron?: boolean;
  danger?: boolean;
  right?: React.ReactNode;
  iconBg?: string;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      disabled={!onPress}
      onPress={() => {
        tap();
        onPress?.();
      }}
      style={({ pressed }) => [styles.row, { backgroundColor: pressed ? colors.elevated : 'transparent' }]}
    >
      {icon && (
        <View style={[styles.rowIcon, { backgroundColor: iconBg ?? colors.elevated }]}>
          <Ionicons name={icon} size={18} color={danger ? colors.danger : iconBg ? '#fff' : colors.text} />
        </View>
      )}
      <View style={{ flex: 1 }}>
        <T variant="body" color={danger ? colors.danger : colors.text} style={{ fontWeight: '500' }}>{title}</T>
        {subtitle && <T variant="caption" color={colors.textSecondary} style={{ marginTop: 2 }}>{subtitle}</T>}
      </View>
      {value && <T variant="callout" color={colors.textSecondary}>{value}</T>}
      {right}
      {onPress && chevron && !right && <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />}
    </Pressable>
  );
}

export function SwitchRow({
  icon, title, subtitle, value, onChange, iconBg, disabled,
}: { icon?: IconName; title: string; subtitle?: string; value: boolean; onChange: (v: boolean) => void; iconBg?: string; disabled?: boolean }) {
  const { colors } = useTheme();
  return (
    <Row
      icon={icon}
      iconBg={iconBg}
      title={title}
      subtitle={subtitle}
      chevron={false}
      right={
        <Switch
          value={value}
          disabled={disabled}
          onValueChange={(v) => {
            tap();
            onChange(v);
          }}
          trackColor={{ true: '#34C759', false: colors.border }}
          thumbColor={Platform.OS === 'android' ? '#fff' : undefined}
          ios_backgroundColor={colors.border}
        />
      }
    />
  );
}

export function Stepper({
  label, sub, value, onChange, min = 0, max = 16,
}: { label: string; sub?: string; value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  const { colors } = useTheme();
  const btn = (icon: IconName, disabled: boolean, d: number) => (
    <Pressable
      disabled={disabled}
      accessibilityLabel={`${d > 0 ? 'Increase' : 'Decrease'} ${label}`}
      onPress={() => {
        tap();
        onChange(value + d);
      }}
      style={[
        styles.stepBtn,
        { borderColor: colors.border, opacity: disabled ? 0.3 : 1 },
        d > 0 && !disabled && { backgroundColor: colors.primary, borderColor: colors.primary },
      ]}
    >
      <Ionicons name={icon} size={16} color={d > 0 && !disabled ? colors.onPrimary : colors.text} />
    </Pressable>
  );
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10 }}>
      <View style={{ flex: 1 }}>
        <T variant="headline">{label}</T>
        {sub && <T variant="caption" color={colors.textSecondary}>{sub}</T>}
      </View>
      {btn('remove', value <= min, -1)}
      <T variant="headline" style={{ width: 36, textAlign: 'center' }}>{value}</T>
      {btn('add', value >= max, 1)}
    </View>
  );
}

export function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  const { colors } = useTheme();
  return <View style={[{ height: StyleSheet.hairlineWidth, backgroundColor: colors.separator, marginVertical: 18 }, style]} />;
}

export function Empty({ icon, title, text, action }: { icon: IconName; title: string; text: string; action?: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={{ alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24, gap: 10 }}>
      <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
        <Ionicons name={icon} size={30} color={colors.text} />
      </View>
      <T variant="title2" center>{title}</T>
      <T variant="callout" color={colors.textSecondary} center>{text}</T>
      {action && <View style={{ marginTop: 10 }}>{action}</View>}
    </View>
  );
}

export function Pill({ label, tone = 'neutral', icon }: { label: string; tone?: 'neutral' | 'dark' | 'success' | 'accent' | 'danger'; icon?: IconName }) {
  const { colors } = useTheme();
  const map = {
    neutral: [colors.elevated, colors.text],
    dark: [colors.primary, colors.onPrimary],
    success: [colors.successSoft, colors.success],
    accent: [colors.accent, '#fff'],
    danger: [colors.dangerSoft, colors.danger],
  } as const;
  const [bg, fg] = map[tone];
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, alignSelf: 'flex-start' }}>
      {tone === 'success' && !icon && <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: fg }} />}
      {icon && <Ionicons name={icon} size={12} color={fg} />}
      <Text style={{ color: fg, fontSize: 12, fontWeight: '600' }}>{label}</Text>
    </View>
  );
}

export function Avatar({ uri, name, size = 44 }: { uri?: string; name?: string; size?: number }) {
  const { colors } = useTheme();
  const initials = (name ?? '?').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  if (uri) return <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.elevated }} />;
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: colors.onPrimary, fontWeight: '700', fontSize: size * 0.36 }}>{initials}</Text>
    </View>
  );
}

export function Footer({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        paddingHorizontal: 20, paddingTop: 12, paddingBottom: Math.max(insets.bottom, 14), backgroundColor: colors.card,
        borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, flexDirection: 'row', alignItems: 'center', gap: 12,
        shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 16, shadowOffset: { width: 0, height: -4 }, elevation: 12,
      }}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', height: 56, gap: 8 },
  dot: { position: 'absolute', top: 9, right: 10, width: 9, height: 9, borderRadius: 5, borderWidth: 1.5 },
  input: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 54, borderRadius: radius.md, paddingHorizontal: 16, borderWidth: 1 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 40, paddingHorizontal: 16, borderRadius: radius.pill },
  segment: { flexDirection: 'row', padding: 4, borderRadius: radius.pill },
  segmentItem: { flex: 1, height: 38, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 },
  badge: { minWidth: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, minHeight: 54, paddingVertical: 10 },
  rowIcon: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  stepBtn: { width: 34, height: 34, borderRadius: 17, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});
