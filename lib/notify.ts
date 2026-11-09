import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

let configured = false;

export function configureNotifications() {
  if (configured || Platform.OS === 'web') return;
  configured = true;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'Staymark',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 200, 120, 200],
      lightColor: '#111111',
    }).catch(() => {});
  }
}

export async function ensurePermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    if (!current.canAskAgain) return false;
    const req = await Notifications.requestPermissionsAsync();
    return req.granted;
  } catch {
    return false;
  }
}

export async function pushNow(title: string, body: string, data: Record<string, unknown> = {}) {
  if (Platform.OS === 'web') return;
  try {
    if (!(await ensurePermission())) return;
    await Notifications.scheduleNotificationAsync({ content: { title, body, data }, trigger: null });
  } catch {}
}

export async function pushAt(date: Date, title: string, body: string, data: Record<string, unknown> = {}) {
  if (Platform.OS === 'web' || date.getTime() <= Date.now()) return null;
  try {
    if (!(await ensurePermission())) return null;
    return await Notifications.scheduleNotificationAsync({
      content: { title, body, data },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date },
    });
  } catch {
    return null;
  }
}

export async function cancelScheduled(id?: string | null) {
  if (!id || Platform.OS === 'web') return;
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch {}
}
