import {
  SoilDataRecord,
  SoilDataApiResponse,
  SoilCurrentDataApiResponse,
  MetricType,
  MetricConfig,
  MetricDataPoint,
} from '@/types/soil';

let isAndroid = false;
try {
  const { Platform } = require('react-native');
  isAndroid = Platform?.OS === 'android';
} catch {}

let cachedWorkingBaseUrl: string | null = null;

const DAYS_ID = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const MONTHS_ID = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
];

export function cleanBaseUrl(ip?: string, port?: string): string {
  const defaultPort = port?.trim() || '5000';
  const rawIp = ip?.trim() || 'localhost';

  if (rawIp.startsWith('http://') || rawIp.startsWith('https://')) {
    const url = new URL(rawIp);
    const host = url.hostname;
    const protocol = url.protocol;
    const resolvedPort = url.port || defaultPort;
    return `${protocol}//${host}:${resolvedPort}`;
  }

  // Handle case where user entered ip:port
  if (rawIp.includes(':')) {
    return `http://${rawIp}`;
  }

  return `http://${rawIp}:${defaultPort}`;
}

export function getCandidateBaseUrls(ip?: string, port?: string): string[] {
  const candidates: string[] = [];
  const primaryPort = port?.trim() || '5000';

  if (cachedWorkingBaseUrl) {
    candidates.push(cachedWorkingBaseUrl);
  }

  if (ip?.trim()) {
    candidates.push(cleanBaseUrl(ip, primaryPort));
  }

  // Host LAN IP discovered on local network
  candidates.push(`http://10.1.21.75:${primaryPort}`);

  if (isAndroid) {
    candidates.push(`http://10.0.2.2:${primaryPort}`);
  }

  candidates.push(`http://localhost:${primaryPort}`);
  candidates.push(`http://127.0.0.1:${primaryPort}`);

  // Deduplicate preserving order
  return Array.from(new Set(candidates));
}

export async function fetchSoilData(options?: {
  ip?: string;
  port?: string;
  limit?: number;
}): Promise<SoilDataRecord[]> {
  const limit = options?.limit ?? 7;
  const candidates = getCandidateBaseUrls(options?.ip, options?.port);

  let lastError: Error | null = null;

  for (const baseUrl of candidates) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const url = `${baseUrl}/api/v1/data?limit=${limit}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const json: SoilDataApiResponse = await response.json();

      if (json && Array.isArray(json.data)) {
        cachedWorkingBaseUrl = baseUrl;
        return json.data;
      }
    } catch (err: any) {
      lastError = err;
      // Continue to next candidate
    }
  }

  throw lastError || new Error('Gagal terhubung ke API Server');
}

export async function fetchCurrentSoilData(options?: {
  ip?: string;
  port?: string;
}): Promise<SoilDataRecord | null> {
  const candidates = getCandidateBaseUrls(options?.ip, options?.port);

  let lastError: Error | null = null;

  for (const baseUrl of candidates) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const url = `${baseUrl}/api/v1/data/current`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const json: SoilCurrentDataApiResponse = await response.json();

      if (json && json.status === 200) {
        cachedWorkingBaseUrl = baseUrl;
        return json.data;
      }
    } catch (err: any) {
      lastError = err;
      // Continue to next candidate
    }
  }

  throw lastError || new Error('Gagal terhubung ke API Server (data/current)');
}

export function formatSoilDataPoints(
  records: SoilDataRecord[],
  metricType: MetricType
): MetricDataPoint[] {
  if (!records.length) return [];

  // Sort ascending by time (oldest to newest) for left-to-right graph plotting
  const sorted = [...records].sort(
    (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
  );

  const uniqueDays = new Set(
    sorted.map((r) => new Date(r.time).toDateString())
  );
  const isAllSameDay = uniqueDays.size <= 1 && sorted.length > 1;

  return sorted.map((record) => {
    const d = new Date(record.time);
    const dayName = DAYS_ID[d.getDay()] || 'Sen';
    const dateFormatted = `${d.getDate()} ${MONTHS_ID[d.getMonth()] || ''}`;
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const timeFormatted = `${hours}:${minutes}`;

    let val = 0;
    if (metricType === 'ph') {
      val = Number(record.ph.toFixed(1));
    } else if (metricType === 'temperature') {
      val = Number(record.tempC.toFixed(1));
    } else if (metricType === 'moisture') {
      val = Math.round(record.moisture);
    }

    return {
      day: isAllSameDay ? timeFormatted : dayName,
      date: isAllSameDay ? `${dateFormatted} ${timeFormatted}` : dateFormatted,
      value: val,
    };
  });
}

export function computeMetricStatus(
  metricType: MetricType,
  latestValue: number
): string {
  switch (metricType) {
    case 'ph':
      if (latestValue < 6.5) return 'Cenderung Asam';
      if (latestValue <= 7.5) return 'Netral Optimal';
      return 'Cenderung Basa';
    case 'moisture':
      if (latestValue < 40) return 'Kering';
      if (latestValue <= 80) return 'Kadar Ideal';
      return 'Basah Berlebih';
    case 'temperature':
      if (latestValue < 22) return 'Suhu Dingin';
      if (latestValue <= 32) return 'Suhu Normal';
      return 'Suhu Panas';
  }
}

export function computeMinMax(
  metricType: MetricType,
  dataPoints: MetricDataPoint[]
): { minY: number; maxY: number } {
  if (!dataPoints.length) {
    if (metricType === 'ph') return { minY: 5.5, maxY: 7.5 };
    if (metricType === 'moisture') return { minY: 40, maxY: 90 };
    return { minY: 20, maxY: 32 };
  }

  const values = dataPoints.map((d) => d.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);

  if (metricType === 'ph') {
    const minY = Math.max(0, Math.floor((minVal - 0.3) * 10) / 10);
    const maxY = Math.min(14, Math.ceil((maxVal + 0.3) * 10) / 10);
    return {
      minY,
      maxY: maxY <= minY ? minY + 1.0 : maxY,
    };
  }

  if (metricType === 'moisture') {
    const minY = Math.max(0, Math.floor((minVal - 5) / 5) * 5);
    const maxY = Math.min(100, Math.ceil((maxVal + 5) / 5) * 5);
    return {
      minY,
      maxY: maxY <= minY ? minY + 10 : maxY,
    };
  }

  // temperature
  const minY = Math.max(0, Math.floor(minVal - 2));
  const maxY = Math.ceil(maxVal + 2);
  return {
    minY,
    maxY: maxY <= minY ? minY + 5 : maxY,
  };
}

export function buildMetricsDataFromRecords(
  records: SoilDataRecord[],
  baseConfigs: Record<MetricType, MetricConfig>
): Record<MetricType, MetricConfig> {
  const result: Record<MetricType, MetricConfig> = { ...baseConfigs };

  (['ph', 'moisture', 'temperature'] as MetricType[]).forEach((type) => {
    const base = baseConfigs[type];
    const dataPoints = formatSoilDataPoints(records, type);
    const { minY, maxY } = computeMinMax(type, dataPoints);

    const latestValue = dataPoints.length
      ? dataPoints[dataPoints.length - 1].value
      : (type === 'ph' ? 6.8 : type === 'temperature' ? 28 : 60);

    result[type] = {
      ...base,
      data: dataPoints.length ? dataPoints : base.data,
      minY,
      maxY,
      statusLabel: dataPoints.length
        ? computeMetricStatus(type, latestValue)
        : base.statusLabel,
    };
  });

  return result;
}

export function formatLastUpdated(date: Date): string {
  const now = new Date();
  const isToday =
    now.getDate() === date.getDate() &&
    now.getMonth() === date.getMonth() &&
    now.getFullYear() === date.getFullYear();

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  if (isToday) {
    return `Hari ini, ${hours}:${minutes} WIB`;
  }

  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    yesterday.getDate() === date.getDate() &&
    yesterday.getMonth() === date.getMonth() &&
    yesterday.getFullYear() === date.getFullYear();

  if (isYesterday) {
    return `Kemarin, ${hours}:${minutes} WIB`;
  }

  const day = date.getDate();
  const month = MONTHS_ID[date.getMonth()] || '';
  return `${day} ${month}, ${hours}:${minutes} WIB`;
}
