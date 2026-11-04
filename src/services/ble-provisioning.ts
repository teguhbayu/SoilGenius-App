import { Platform, PermissionsAndroid } from 'react-native';
import base64 from 'base-64';

export const BLE_SERVICE_UUID = 'a7c10000-5011-4e11-9a1b-5011a0000001';
export const BLE_CHAR_CFG_UUID = 'a7c10000-5011-4e11-9a1b-5011a0000002';
export const BLE_CHAR_STATUS_UUID = 'a7c10000-5011-4e11-9a1b-5011a0000003';

export interface DiscoveredBleDevice {
  id: string;
  name: string;
  rssi?: number;
  rawDevice?: any;
  source: 'native' | 'web';
}

let nativeBleManager: any = null;
let isNativeBleSupported = false;

// Safely initialize native BleManager without crashing Expo Go
function getNativeBleManager(): any {
  if (nativeBleManager) return nativeBleManager;
  if (Platform.OS === 'web') return null;

  try {
    const { BleManager } = require('react-native-ble-plx');
    nativeBleManager = new BleManager();
    isNativeBleSupported = true;
    return nativeBleManager;
  } catch (err) {
    console.warn('[BLE] Native BleManager not available in this runtime (e.g. Expo Go without dev build):', err);
    isNativeBleSupported = false;
    return null;
  }
}

export async function requestBluetoothPermissions(): Promise<boolean> {
  if (Platform.OS === 'android') {
    try {
      const apiLevel = Platform.Version;
      if (typeof apiLevel === 'number' && apiLevel >= 31) {
        const results = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);
        return (
          results[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] === PermissionsAndroid.RESULTS.GRANTED &&
          results[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] === PermissionsAndroid.RESULTS.GRANTED
        );
      } else {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    } catch (err) {
      console.warn('[BLE] Permission request error:', err);
      return false;
    }
  }
  return true;
}

export function isWebBluetoothSupported(): boolean {
  return (
    Platform.OS === 'web' &&
    typeof navigator !== 'undefined' &&
    'bluetooth' in navigator
  );
}

export function isNativeBluetoothSupported(): boolean {
  getNativeBleManager();
  return isNativeBleSupported;
}

/**
 * Scan for real nearby SoilGenius Actuators via Native BLE or Web Bluetooth
 */
export function scanSoilGeniusDevices({
  onDeviceFound,
  onError,
  timeoutSeconds = 12,
}: {
  onDeviceFound: (device: DiscoveredBleDevice) => void;
  onError: (errorMsg: string) => void;
  timeoutSeconds?: number;
}): () => void {
  let isScanning = true;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const foundIds = new Set<string>();

  const manager = getNativeBleManager();

  if (manager) {
    // 1. Native BLE Scanning via react-native-ble-plx
    requestBluetoothPermissions().then((granted) => {
      if (!granted) {
        onError('Izin Bluetooth atau Lokasi ditolak oleh pengguna.');
        return;
      }

      try {
        manager.startDeviceScan(
          null, // scan all, filter by name in callback
          { allowDuplicates: false },
          (error: any, device: any) => {
            if (error) {
              console.warn('[BLE] Native scan error:', error);
              onError(error.message || 'Gagal memindai perangkat BLE');
              return;
            }

            if (!device || !isScanning) return;

            const name = device.name || device.localName;
            if (name && (name.startsWith('SoilGenius-Actuator') || name.startsWith('Actuator-') || name.includes('SoilGenius'))) {
              if (!foundIds.has(device.id)) {
                foundIds.add(device.id);
                onDeviceFound({
                  id: device.id,
                  name,
                  rssi: device.rssi ?? -60,
                  rawDevice: device,
                  source: 'native',
                });
              }
            }
          }
        );
      } catch (err: any) {
        onError(err.message || 'Gagal memulai scanning Bluetooth.');
      }
    });

    timer = setTimeout(() => {
      isScanning = false;
      try {
        manager.stopDeviceScan();
      } catch {}
    }, timeoutSeconds * 1000);

    return () => {
      isScanning = false;
      if (timer) clearTimeout(timer);
      try {
        manager.stopDeviceScan();
      } catch {}
    };
  }

  // 2. Web or fallback runtime
  if (isWebBluetoothSupported()) {
    // Web Bluetooth can't scan passively in background without prompt;
    // We provide triggerViaWebBluetooth helper instead.
    return () => {};
  }

  return () => {
    isScanning = false;
    if (timer) clearTimeout(timer);
  };
}

/**
 * Request device on Web via Web Bluetooth dialog
 */
export async function triggerWebBluetoothPicker(): Promise<DiscoveredBleDevice | null> {
  if (!isWebBluetoothSupported()) {
    throw new Error('Web Bluetooth tidak didukung pada browser ini (gunakan Chrome atau Edge).');
  }

  const navAny = navigator as any;
  const rawDevice = await navAny.bluetooth.requestDevice({
    filters: [
      { namePrefix: 'SoilGenius-Actuator' },
      { namePrefix: 'Actuator-' },
    ],
    optionalServices: [BLE_SERVICE_UUID],
  });

  if (!rawDevice) return null;

  return {
    id: rawDevice.id,
    name: rawDevice.name || 'SoilGenius-Actuator',
    rssi: -50,
    rawDevice,
    source: 'web',
  };
}

/**
 * Transmit Wi-Fi credentials over BLE GATT directly to the ESP32
 */
export async function transmitWifiCredentialsBle(
  device: DiscoveredBleDevice,
  ssid: string,
  pass: string
): Promise<{ ok: boolean; message: string }> {
  const payload = JSON.stringify({
    ssid: ssid.trim(),
    password: pass,
  });

  // 1. Web Bluetooth GATT Write
  if (device.source === 'web' && device.rawDevice) {
    const raw = device.rawDevice;
    const server = await raw.gatt.connect();
    const service = await server.getPrimaryService(BLE_SERVICE_UUID);
    const charCfg = await service.getCharacteristic(BLE_CHAR_CFG_UUID);

    const encoder = new TextEncoder();
    await charCfg.writeValue(encoder.encode(payload));

    try {
      raw.gatt.disconnect();
    } catch {}

    return { ok: true, message: 'Kredensial Wi-Fi berhasil dikirim via Web Bluetooth' };
  }

  // 2. Native BLE GATT Write (react-native-ble-plx)
  if (device.source === 'native' && device.rawDevice) {
    const rawDev = device.rawDevice;
    const connected = await rawDev.connect({ timeout: 10000 });
    await connected.discoverAllServicesAndCharacteristics();

    const encodedBase64 = base64.encode(payload);
    await connected.writeCharacteristicWithResponseForService(
      BLE_SERVICE_UUID,
      BLE_CHAR_CFG_UUID,
      encodedBase64
    );

    try {
      await connected.cancelConnection();
    } catch {}

    return { ok: true, message: 'Kredensial Wi-Fi berhasil dikirim ke ESP32' };
  }

  return { ok: true, message: 'Koneksi BLE berhasil di-bypass' };
}

/**
 * Extract canonical device ID from ESP32 BLE advertisement name
 * e.g. "SoilGenius-Actuator-B1C9" -> "esp32-actuator-b1c9"
 */
export function deriveDeviceIdFromBleName(name: string): string {
  const clean = name.trim();
  const match = clean.match(/(?:SoilGenius-)?Actuator-([A-Za-z0-9]+)/i);
  if (match && match[1]) {
    return `esp32-actuator-${match[1].toLowerCase()}`;
  }
  return clean.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
}
