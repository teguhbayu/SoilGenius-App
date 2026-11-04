import { Platform } from 'react-native';
import {
  DeviceDto,
  RuleDto,
  ScheduleDto,
  ClaimTokenResponse,
  ClaimDevicePayload,
} from '@/types/device';

let cachedWorkingBaseUrl: string | null = null;

function getCandidateBaseUrls(customIp?: string, customPort?: string): string[] {
  const port = customPort && customPort.trim() !== '' ? customPort.trim() : '5000';
  const list: string[] = [];

  if (cachedWorkingBaseUrl) {
    list.push(cachedWorkingBaseUrl);
  }

  if (customIp && customIp.trim() !== '') {
    list.push(`http://${customIp.trim()}:${port}`);
  }

  list.push(`http://127.0.0.1:${port}`);
  list.push(`http://localhost:${port}`);

  if (Platform.OS === 'android') {
    list.push(`http://10.0.2.2:${port}`);
  }

  return [...new Set(list)];
}

async function apiRequest<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
  body?: any,
  options?: { ip?: string; port?: string }
): Promise<T> {
  const candidates = getCandidateBaseUrls(options?.ip, options?.port);
  let lastError: Error | null = null;

  for (const baseUrl of candidates) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const url = `${baseUrl}${endpoint}`;
      const response = await fetch(url, {
        method,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const json = await response.json();
      if (json && (json.status === 200 || json.status === 201)) {
        cachedWorkingBaseUrl = baseUrl;
        return json.data as T;
      } else {
        throw new Error(json?.message || 'API request failed');
      }
    } catch (err: any) {
      lastError = err;
    }
  }

  throw lastError || new Error(`Gagal terhubung ke API Server (${endpoint})`);
}

/**
 * Fetch all registered devices
 */
export async function fetchDevices(options?: { ip?: string; port?: string }): Promise<DeviceDto[]> {
  return await apiRequest<DeviceDto[]>('/api/v1/devices', 'GET', undefined, options);
}

/**
 * Fetch a single device by ID
 */
export async function fetchDeviceById(id: string, options?: { ip?: string; port?: string }): Promise<DeviceDto> {
  return await apiRequest<DeviceDto>(`/api/v1/devices/${id}`, 'GET', undefined, options);
}

/**
 * Send a command to an actuator (e.g. toggle relay, test pulse)
 */
export async function sendDeviceCommand(
  deviceId: string,
  command: {
    action: string;
    payload?: Record<string, any>;
    failsafeSeconds?: number;
  },
  options?: { ip?: string; port?: string }
): Promise<{ cmdId: string; status: string; desiredState: Record<string, any> }> {
  return await apiRequest(
    `/api/v1/devices/${deviceId}/command`,
    'POST',
    command,
    options
  );
}

/**
 * Emergency Stop: Dispatches immediate stop to all actuators
 */
export async function sendEmergencyStop(options?: { ip?: string; port?: string }): Promise<any> {
  return await apiRequest('/api/v1/devices/emergency-stop', 'POST', {}, options);
}

/**
 * Generate a short-lived claim token for BLE provisioning
 */
export async function requestClaimToken(
  deviceType: 'actuator' | 'sensor' = 'actuator',
  options?: { ip?: string; port?: string }
): Promise<ClaimTokenResponse> {
  return await apiRequest<ClaimTokenResponse>(
    '/api/v1/devices/claim-token',
    'POST',
    { deviceType },
    options
  );
}

/**
 * Register / claim a device with a token
 */
export async function claimDevice(
  payload: ClaimDevicePayload,
  options?: { ip?: string; port?: string }
): Promise<{ device: DeviceDto; credentialToken: string }> {
  return await apiRequest('/api/v1/devices/claim', 'POST', payload, options);
}

/**
 * Delete / unpair a device
 */
export async function deleteDevice(
  id: string,
  options?: { ip?: string; port?: string }
): Promise<boolean> {
  return await apiRequest<boolean>(`/api/v1/devices/${id}`, 'DELETE', undefined, options);
}

/**
 * Fetch all automation rules
 */
export async function fetchRules(options?: { ip?: string; port?: string }): Promise<RuleDto[]> {
  return await apiRequest<RuleDto[]>('/api/v1/rules', 'GET', undefined, options);
}

/**
 * Create a new rule
 */
export async function createRule(
  rule: Partial<RuleDto>,
  options?: { ip?: string; port?: string }
): Promise<RuleDto> {
  return await apiRequest<RuleDto>('/api/v1/rules', 'POST', rule, options);
}

/**
 * Update an existing rule
 */
export async function updateRule(
  id: string,
  updates: Partial<RuleDto>,
  options?: { ip?: string; port?: string }
): Promise<RuleDto> {
  return await apiRequest<RuleDto>(`/api/v1/rules/${id}`, 'PUT', updates, options);
}

/**
 * Toggle active status of a rule
 */
export async function toggleRule(
  id: string,
  options?: { ip?: string; port?: string }
): Promise<RuleDto> {
  return await apiRequest<RuleDto>(`/api/v1/rules/${id}/toggle`, 'PATCH', {}, options);
}

/**
 * Delete a rule
 */
export async function deleteRule(
  id: string,
  options?: { ip?: string; port?: string }
): Promise<boolean> {
  return await apiRequest<boolean>(`/api/v1/rules/${id}`, 'DELETE', undefined, options);
}

/**
 * Fetch all irrigation schedules
 */
export async function fetchSchedules(options?: { ip?: string; port?: string }): Promise<ScheduleDto[]> {
  return await apiRequest<ScheduleDto[]>('/api/v1/schedules', 'GET', undefined, options);
}

/**
 * Create a new irrigation schedule
 */
export async function createSchedule(
  schedule: Partial<ScheduleDto>,
  options?: { ip?: string; port?: string }
): Promise<ScheduleDto> {
  return await apiRequest<ScheduleDto>('/api/v1/schedules', 'POST', schedule, options);
}

/**
 * Update an existing irrigation schedule
 */
export async function updateSchedule(
  id: string,
  updates: Partial<ScheduleDto>,
  options?: { ip?: string; port?: string }
): Promise<ScheduleDto> {
  return await apiRequest<ScheduleDto>(`/api/v1/schedules/${id}`, 'PUT', updates, options);
}

/**
 * Toggle active status of an irrigation schedule
 */
export async function toggleSchedule(
  id: string,
  options?: { ip?: string; port?: string }
): Promise<ScheduleDto> {
  return await apiRequest<ScheduleDto>(`/api/v1/schedules/${id}/toggle`, 'PATCH', {}, options);
}

/**
 * Delete an irrigation schedule
 */
export async function deleteSchedule(
  id: string,
  options?: { ip?: string; port?: string }
): Promise<boolean> {
  return await apiRequest<boolean>(`/api/v1/schedules/${id}`, 'DELETE', undefined, options);
}
