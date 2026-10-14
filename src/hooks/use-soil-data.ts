import { useState, useEffect, useCallback, useRef } from 'react';
import {
  SoilDataRecord,
  MetricType,
  MetricConfig,
} from '@/types/soil';
import {
  fetchSoilData,
  fetchCurrentSoilData,
  buildMetricsDataFromRecords,
  formatLastUpdated,
} from '@/services/soil-data';

interface UseSoilDataOptions {
  ip?: string;
  port?: string;
  limit?: number;
  pollIntervalMs?: number;
  baseConfigs: Record<MetricType, MetricConfig>;
}

export function useSoilData({
  ip,
  port,
  limit = 7,
  pollIntervalMs = 10000,
  baseConfigs,
}: UseSoilDataOptions) {
  const [metricsData, setMetricsData] =
    useState<Record<MetricType, MetricConfig>>(baseConfigs);
  const [currentRecord, setCurrentRecord] = useState<SoilDataRecord | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>('Memuat...');
  const [error, setError] = useState<string | null>(null);

  const baseConfigsRef = useRef(baseConfigs);
  baseConfigsRef.current = baseConfigs;

  const loadData = useCallback(
    async (isManualRefresh = false) => {
      if (isManualRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      try {
        // Fetch current data and historical data concurrently
        const [currentRes, historyRes] = await Promise.allSettled([
          fetchCurrentSoilData({ ip, port }),
          fetchSoilData({ ip, port, limit }),
        ]);

        let resolvedCurrent: SoilDataRecord | null = null;
        let hasSuccess = false;

        if (currentRes.status === 'fulfilled' && currentRes.value) {
          resolvedCurrent = currentRes.value;
          hasSuccess = true;
        }

        if (historyRes.status === 'fulfilled' && historyRes.value.length > 0) {
          hasSuccess = true;
          const records = historyRes.value;
          const updated = buildMetricsDataFromRecords(
            records,
            baseConfigsRef.current
          );
          setMetricsData(updated);

          // If current endpoint returned null, fallback to the newest historical record
          if (!resolvedCurrent) {
            const sorted = [...records].sort(
              (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
            );
            resolvedCurrent = sorted[0];
          }
        }

        if (hasSuccess) {
          if (resolvedCurrent) {
            setCurrentRecord(resolvedCurrent);
            setLastUpdated(formatLastUpdated(new Date(resolvedCurrent.time)));
          }
          setIsConnected(true);
          setError(null);
        } else {
          const firstErr =
            currentRes.status === 'rejected'
              ? currentRes.reason
              : historyRes.status === 'rejected'
                ? historyRes.reason
                : new Error('Gagal mengambil data dari server');
          throw firstErr;
        }
      } catch (err: any) {
        setIsConnected(false);
        setError(err?.message || 'Gagal mengambil data dari server');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [ip, port, limit]
  );

  // Initial fetch and options reload
  useEffect(() => {
    loadData(false);
  }, [loadData]);

  // Periodic polling for live /data/current updates
  useEffect(() => {
    if (!pollIntervalMs || pollIntervalMs <= 0) return;

    const intervalId = setInterval(async () => {
      try {
        const liveCurrent = await fetchCurrentSoilData({ ip, port });
        if (liveCurrent) {
          setCurrentRecord((prev) => {
            // Only update if time or reading has changed
            if (!prev || prev.time !== liveCurrent.time || prev.ph !== liveCurrent.ph || prev.tempC !== liveCurrent.tempC || prev.moisture !== liveCurrent.moisture) {
              setLastUpdated(formatLastUpdated(new Date(liveCurrent.time)));
              return liveCurrent;
            }
            return prev;
          });
          setIsConnected(true);
        }
      } catch {
        // Background polling errors do not disrupt the screen
      }
    }, pollIntervalMs);

    return () => clearInterval(intervalId);
  }, [ip, port, pollIntervalMs]);

  const refresh = useCallback(async () => {
    await loadData(true);
  }, [loadData]);

  return {
    metricsData,
    currentRecord,
    latestRecord: currentRecord, // alias for backwards compatibility
    isConnected,
    isLoading,
    isRefreshing,
    lastUpdated,
    error,
    refresh,
  };
}
