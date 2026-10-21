import { useState, useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { useSettings } from '@/hooks/use-settings';
import { fetchCurrentSoilData } from '@/services/soil-data';
import {
  registerForPushNotificationsAsync,
  sendSoilDataNotification,
  sendTestNotification,
  getIsNotificationEnabled,
  setIsNotificationEnabled,
  getLastNotifiedTime,
  setLastNotifiedTime,
} from '@/services/notification';
import { SoilDataRecord } from '@/types/soil';

const POLLING_INTERVAL_MS = 15000; // Check /api/v1/data/current every 15 seconds

export function useSoilNotificationMonitor() {
  const { config } = useSettings();
  const router = useRouter();

  const [isEnabled, setIsEnabled] = useState<boolean>(true);
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [latestData, setLatestData] = useState<SoilDataRecord | null>(null);
  const [lastCheckTime, setLastCheckTime] = useState<Date | null>(null);

  const lastNotifiedTimeRef = useRef<string | null>(null);
  const isEnabledRef = useRef<boolean>(true);
  const isCheckingRef = useRef<boolean>(false);

  // Initialize permissions & stored preferences
  useEffect(() => {
    let isMounted = true;

    async function init() {
      const [permissionGranted, storedEnabled, storedLastTime] = await Promise.all([
        registerForPushNotificationsAsync(),
        getIsNotificationEnabled(),
        getLastNotifiedTime(),
      ]);

      if (isMounted) {
        setHasPermission(permissionGranted);
        setIsEnabled(storedEnabled);
        isEnabledRef.current = storedEnabled;
        if (storedLastTime) {
          lastNotifiedTimeRef.current = storedLastTime;
        }
      }
    }

    init();

    // Listen to user clicking on notification
    let responseSubscription: { remove: () => void } | null = null;
    try {
      responseSubscription = Notifications.addNotificationResponseReceivedListener(
        (response) => {
          const url = response.notification.request.content.data?.url;
          if (url) {
            try {
              router.push(url as any);
            } catch {
              // fallback
            }
          }
        }
      );
    } catch (err) {
      console.warn('Notifications response listener unavailable:', err);
    }

    return () => {
      isMounted = false;
      responseSubscription?.remove();
    };
  }, [router]);

  // Function to query /api/v1/data/current and trigger notification if new
  const checkCurrentData = useCallback(async () => {
    if (isCheckingRef.current) return;
    isCheckingRef.current = true;

    try {
      const current = await fetchCurrentSoilData({
        ip: config.apiServerIp,
        port: config.apiServerPort,
      });

      setLastCheckTime(new Date());

      if (current && current.time) {
        setLatestData(current);

        const lastTime = lastNotifiedTimeRef.current;

        if (!lastTime) {
          // First check: store timestamp without firing so we don't spam on launch
          lastNotifiedTimeRef.current = current.time;
          await setLastNotifiedTime(current.time);
        } else if (current.time !== lastTime) {
          // New data detected from /api/v1/data/current!
          lastNotifiedTimeRef.current = current.time;
          await setLastNotifiedTime(current.time);

          if (isEnabledRef.current) {
            await sendSoilDataNotification(current);
          }
        }
      }
    } catch (err) {
      // Server might be temporarily unreachable, keep trying quietly
    } finally {
      isCheckingRef.current = false;
    }
  }, [config.apiServerIp, config.apiServerPort]);

  // Periodic polling interval
  useEffect(() => {
    // Initial check
    checkCurrentData();

    const interval = setInterval(() => {
      checkCurrentData();
    }, POLLING_INTERVAL_MS);

    // Also check immediately when app returns to foreground
    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        checkCurrentData();
      }
    };

    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      clearInterval(interval);
      appStateSubscription.remove();
    };
  }, [checkCurrentData]);

  // Toggle notifications on/off
  const toggleNotifications = useCallback(async (value: boolean) => {
    setIsEnabled(value);
    isEnabledRef.current = value;
    await setIsNotificationEnabled(value);
  }, []);

  // Send test push notification
  const triggerTest = useCallback(async () => {
    await sendTestNotification();
  }, []);

  return {
    isEnabled,
    hasPermission,
    latestData,
    lastCheckTime,
    toggleNotifications,
    triggerTest,
    checkCurrentData,
  };
}
