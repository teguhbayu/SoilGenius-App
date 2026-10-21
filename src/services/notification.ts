import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { SoilDataRecord } from '@/types/soil';
import { getItem, setItem } from '@/services/storage';

export const NOTIFICATION_CHANNEL_ID = 'soil-data-alerts';
export const STORAGE_NOTIF_ENABLED_KEY = '@soilgenius_notif_enabled_v1';
export const STORAGE_LAST_NOTIFIED_TIME_KEY = '@soilgenius_last_notified_data_time_v1';

// Configure notification behavior for foreground notifications
if (Platform.OS !== 'web') {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  } catch (err) {
    console.warn('Failed to set notification handler:', err);
  }
}

/**
 * Request permissions and initialize Android notification channel
 */
export async function registerForPushNotificationsAsync(): Promise<boolean> {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') return true;
      if (Notification.permission !== 'denied') {
        const res = await Notification.requestPermission();
        return res === 'granted';
      }
    }
    return false;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return false;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL_ID, {
        name: 'Pembaruan Data Tanah',
        description: 'Notifikasi ketika terdeteksi pembaruan data tanah baru dari sensor /api/v1/data/current',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#10B981',
        sound: 'default',
        showBadge: true,
      });
    }

    return true;
  } catch (err) {
    console.warn('Failed to configure push notifications:', err);
    return false;
  }
}

/**
 * Dispatch a local push notification with the new soil data reading
 */
export async function sendSoilDataNotification(data: SoilDataRecord): Promise<void> {
  const title = 'Data Tanah Terbaru Terdeteksi 🌱';
  const phStr = typeof data.ph === 'number' ? data.ph.toFixed(1) : String(data.ph);
  const tempStr = typeof data.tempC === 'number' ? data.tempC.toFixed(1) : String(data.tempC);
  const moistureStr = typeof data.moisture === 'number' ? `${data.moisture}%` : String(data.moisture);
  const labelStr = data.label ? ` • ${data.label}` : '';

  const body = `Kelembapan: ${moistureStr} | Suhu: ${tempStr}°C | pH: ${phStr}${labelStr}`;

  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/favicon.png',
        });
      } catch {
        // web fallback
      }
    }
    return;
  }

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: {
          time: data.time,
          ph: data.ph,
          tempC: data.tempC,
          moisture: data.moisture,
          label: data.label,
          skor: data.skor,
          url: '/(tabs)',
        },
        sound: 'default',
      },
      trigger: Platform.OS === 'android' ? { channelId: NOTIFICATION_CHANNEL_ID } : null,
    });
  } catch (err) {
    console.warn('Failed to schedule notification:', err);
  }
}

/**
 * Send a sample notification to verify push notifications work
 */
export async function sendTestNotification(): Promise<void> {
  await sendSoilDataNotification({
    time: new Date().toISOString(),
    ph: 6.8,
    tempC: 27.5,
    moisture: 68,
    label: 'Optimal',
    skor: 92,
  });
}

/**
 * Check if push notifications are enabled by the user
 */
export async function getIsNotificationEnabled(): Promise<boolean> {
  const stored = await getItem(STORAGE_NOTIF_ENABLED_KEY);
  if (stored === null) return true; // Enabled by default
  return stored === 'true';
}

/**
 * Save notification toggle preference
 */
export async function setIsNotificationEnabled(enabled: boolean): Promise<void> {
  await setItem(STORAGE_NOTIF_ENABLED_KEY, enabled ? 'true' : 'false');
}

/**
 * Get last notified data timestamp
 */
export async function getLastNotifiedTime(): Promise<string | null> {
  return await getItem(STORAGE_LAST_NOTIFIED_TIME_KEY);
}

/**
 * Update last notified data timestamp
 */
export async function setLastNotifiedTime(time: string): Promise<void> {
  await setItem(STORAGE_LAST_NOTIFIED_TIME_KEY, time);
}
