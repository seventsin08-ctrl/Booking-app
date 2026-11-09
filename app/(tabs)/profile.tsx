import React from 'react';
import { Alert, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { Avatar, Card, Group, Row, SwitchRow, T } from '@/components/ui';
import { Logo } from '@/components/Logo';
import { TAB_BAR_SPACE } from '@/components/TabBar';
import { useAuth } from '@/lib/auth';
import { useStore } from '@/lib/store';
import { useTheme } from '@/lib/theme';

export default function Profile() {
  const { colors, mode, isDark, setMode } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();
  const { myBookings, favorites, settings, hostMode, setHostMode } = useStore();
  const trips = myBookings.filter((b) => b.status === 'confirmed').length;
  const years = user ? Math.max(0, new Date().getFullYear() - new Date(user.createdAt).getFullYear()) : 0;

  const logout = () => {
    if (Platform.OS === 'web') return signOut();
    Alert.alert('Log out?', 'You can sign back in any time.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: TAB_BAR_SPACE + insets.bottom }} showsVerticalScrollIndicator={false}>
        <View style={styles.head}><T variant="large">Profile</T></View>

        <Card onPress={() => router.push('/settings/personal')} style={styles.profile}>
          <Avatar uri={user?.avatar} name={user?.name} size={64} />
          <View style={{ flex: 1, gap: 2 }}>
            <T variant="title2" numberOfLines={1}>{user?.name}</T>
            <T variant="callout" color={colors.textSecondary} numberOfLines={1}>{user?.email}</T>
            <T variant="caption" color={colors.textSecondary}>Show profile ›</T>
          </View>
        </Card>

        <View style={styles.stats}>
          {[
            [String(trips), 'Trips'],
            [String(favorites.length), 'Saved'],
            [years ? `${years}y` : 'New', 'On Staymark'],
          ].map(([v, l]) => (
            <Card key={l} style={{ flex: 1, alignItems: 'center', paddingVertical: 14 }}>
              <T variant="title2">{v}</T>
              <T variant="caption" color={colors.textSecondary}>{l}</T>
            </Card>
          ))}
        </View>

        <Card onPress={() => router.push(hostMode ? '/host' : '/host/new')} style={[styles.host, { backgroundColor: colors.primary }]}>
          <View style={{ flex: 1, gap: 4 }}>
            <T variant="headline" color={colors.onPrimary}>{hostMode ? 'Switch to hosting' : 'Become a host'}</T>
            <T variant="caption" color={colors.onPrimary} style={{ opacity: 0.75 }}>
              {hostMode ? 'Manage your listings and reservations.' : "It's easy to start hosting and earn extra income."}
            </T>
          </View>
          <View style={[styles.hostIcon, { backgroundColor: colors.onPrimary }]}><Logo size={24} color={colors.primary} /></View>
        </Card>

        <Group title="Account settings">
          <Row icon="person-outline" title="Personal information" onPress={() => router.push('/settings/personal')} />
          <Row icon="shield-checkmark-outline" title="Login & security" onPress={() => router.push('/settings/security')} />
          <Row icon="card-outline" title="Payments & payouts" onPress={() => router.push('/settings/payments')} />
          <Row icon="notifications-outline" title="Notifications" value={settings.push ? 'On' : 'Off'} onPress={() => router.push('/settings/notifications')} />
          <Row icon="globe-outline" title="Language & currency" value={`${settings.language.slice(0, 2).toUpperCase()} · ${settings.currency}`} onPress={() => router.push('/settings/currency')} />
        </Group>

        <Group title="Appearance">
          <SwitchRow icon="moon-outline" title="Dark mode" subtitle={mode === 'system' ? 'Following system' : undefined} value={isDark} onChange={(v) => setMode(v ? 'dark' : 'light')} />
          <Row icon="contrast-outline" title="Theme" value={mode[0].toUpperCase() + mode.slice(1)} onPress={() => router.push('/settings/appearance')} />
        </Group>

        <Group title="Hosting">
          <SwitchRow icon="swap-horizontal-outline" title="Host mode" subtitle="Show hosting tools" value={hostMode} onChange={setHostMode} />
          <Row icon="add-circle-outline" title="List your space" onPress={() => router.push('/host/new')} />
          {hostMode && <Row icon="stats-chart-outline" title="Host dashboard" onPress={() => router.push('/host')} />}
        </Group>

        <Group title="Support">
          <Row icon="help-buoy-outline" title="Get help" onPress={() => router.push('/settings/help')} />
          <Row icon="document-text-outline" title="Terms & privacy" onPress={() => router.push('/settings/legal')} />
        </Group>

        <Group>
          <Row icon="log-out-outline" title="Log out" danger chevron={false} onPress={logout} />
        </Group>
        <T variant="caption" color={colors.textTertiary} center>Staymark v{Constants.expoConfig?.version ?? '1.0.0'}</T>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  head: { paddingVertical: 10, minHeight: 64, justifyContent: 'center' },
  profile: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  stats: { flexDirection: 'row', gap: 10, marginVertical: 12 },
  host: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 22 },
  hostIcon: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
});
