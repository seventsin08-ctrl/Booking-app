import React, { useEffect, useState } from 'react';
import { Linking, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Button, Group, Header, Row, Screen, SwitchRow } from '@/components/ui';
import { ensurePermission, pushNow } from '@/lib/notify';
import { useStore } from '@/lib/store';

export default function NotificationSettings() {
  const { settings, updateSettings, notify } = useStore();
  const [status, setStatus] = useState<'granted' | 'denied' | 'undetermined' | 'unsupported'>('undetermined');

  const refresh = async () => {
    if (Platform.OS === 'web') return setStatus('unsupported');
    const p = await Notifications.getPermissionsAsync();
    setStatus(p.granted ? 'granted' : p.canAskAgain ? 'undetermined' : 'denied');
  };
  useEffect(() => { refresh(); }, []);

  const togglePush = async (v: boolean) => {
    if (v) {
      const ok = await ensurePermission();
      await refresh();
      if (!ok && Platform.OS !== 'web') return Linking.openSettings();
    }
    updateSettings({ push: v });
  };

  const disabled = !settings.push;
  const label = { granted: 'Allowed', denied: 'Blocked in Settings', undetermined: 'Not requested', unsupported: 'Not available on web' }[status];

  return (
    <Screen edges={['top', 'bottom']}>
      <Header title="Notifications" />
      <Group title="Push notifications" footer="Push notifications appear on your lock screen even when Staymark is closed.">
        <SwitchRow icon="notifications-outline" title="Allow notifications" value={settings.push} onChange={togglePush} />
        <Row icon="phone-portrait-outline" title="System permission" value={label} onPress={status === 'denied' ? () => Linking.openSettings() : undefined} chevron={status === 'denied'} />
      </Group>
      <Group title="Notify me about">
        <SwitchRow icon="checkmark-circle-outline" title="Booking updates" subtitle="Confirmations, changes and cancellations" value={settings.bookingUpdates} disabled={disabled} onChange={(v) => updateSettings({ bookingUpdates: v })} />
        <SwitchRow icon="chatbubble-ellipses-outline" title="Messages" subtitle="New messages from hosts" value={settings.messages} disabled={disabled} onChange={(v) => updateSettings({ messages: v })} />
        <SwitchRow icon="alarm-outline" title="Trip reminders" subtitle="The day before you check in" value={settings.reminders} disabled={disabled} onChange={(v) => updateSettings({ reminders: v })} />
        <SwitchRow icon="pricetag-outline" title="Deals & inspiration" subtitle="Price drops on saved stays" value={settings.promotions} disabled={disabled} onChange={(v) => updateSettings({ promotions: v })} />
      </Group>
      <Button
        title="Send a test notification"
        variant="secondary"
        icon="paper-plane-outline"
        onPress={() => {
          notify('Test notification 🔔', 'Notifications are working. You\'re all set!', 'notifications-outline');
          if (!settings.push) pushNow('Test notification 🔔', 'Notifications are working.');
        }}
      />
    </Screen>
  );
}
