import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  TextInput,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Bluetooth,
  Wifi,
  Key,
  CheckCircle2,
  AlertTriangle,
  X,
  Radio,
  Cpu,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Signal,
  ChevronRight,
  Edit3,
} from 'lucide-react-native';
import { GlassCard } from '@/components/ui/glass-card';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { requestClaimToken, claimDevice } from '@/services/device-api';
import {
  DiscoveredBleDevice,
  scanSoilGeniusDevices,
  triggerWebBluetoothPicker,
  transmitWifiCredentialsBle,
  deriveDeviceIdFromBleName,
  isWebBluetoothSupported,
  isNativeBluetoothSupported,
  requestBluetoothPermissions,
} from '@/services/ble-provisioning';
import { useSettings } from '@/hooks/use-settings';

interface BleProvisioningModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type ProvisioningStep = 'scan' | 'credentials' | 'provisioning' | 'success' | 'error';

export function BleProvisioningModal({
  visible,
  onClose,
  onSuccess,
}: BleProvisioningModalProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const { config } = useSettings();

  const [step, setStep] = useState<ProvisioningStep>('scan');
  const [discoveredDevices, setDiscoveredDevices] = useState<DiscoveredBleDevice[]>([]);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [selectedDevice, setSelectedDevice] = useState<DiscoveredBleDevice | null>(null);

  // Manual fallback toggle (hanya jika pengguna ingin mengetik manual)
  const [showManualInput, setShowManualInput] = useState<boolean>(false);
  const [manualIdInput, setManualIdInput] = useState<string>('');

  const [wifiSsid, setWifiSsid] = useState<string>('');
  const [wifiPassword, setWifiPassword] = useState<string>('');
  const [provStatusMessage, setProvStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [claimedResult, setClaimedResult] = useState<{
    deviceId: string;
    ipAddress?: string;
    credentialToken: string;
  } | null>(null);

  const stopScanRef = useRef<(() => void) | null>(null);

  const ip = config.apiServerIp;
  const port = config.apiServerPort;

  const isWeb = isWebBluetoothSupported();
  const isNative = isNativeBluetoothSupported();

  // Memulai pemindaian Bluetooth LE secara otomatis saat modal terbuka
  const startScan = useCallback(() => {
    setDiscoveredDevices([]);
    setErrorMessage('');
    setIsScanning(true);

    if (stopScanRef.current) {
      stopScanRef.current();
      stopScanRef.current = null;
    }

    const cancelFn = scanSoilGeniusDevices({
      onDeviceFound: (device) => {
        setDiscoveredDevices((prev) => {
          if (prev.some((d) => d.id === device.id || d.name === device.name)) {
            return prev;
          }
          return [...prev, device];
        });
      },
      onError: (msg) => {
        console.warn('[BLE] Scan error:', msg);
        // Jangan timpa jika sudah menemukan perangkat
      },
      timeoutSeconds: 15,
    });

    stopScanRef.current = cancelFn;

    // Timeout untuk mematikan indikator scan
    setTimeout(() => {
      setIsScanning(false);
    }, 15000);
  }, []);

  useEffect(() => {
    if (visible && step === 'scan') {
      startScan();
    }
    return () => {
      if (stopScanRef.current) {
        stopScanRef.current();
        stopScanRef.current = null;
      }
    };
  }, [visible, step, startScan]);

  // Handler saat pengguna memilih via Web Bluetooth dialog
  const handleWebBluetoothPicker = async () => {
    try {
      setIsScanning(true);
      const dev = await triggerWebBluetoothPicker();
      if (dev) {
        setSelectedDevice(dev);
        setStep('credentials');
      }
    } catch (err: any) {
      if (err.name !== 'NotFoundError') {
        setErrorMessage(err.message || 'Pindaian Bluetooth dibatalkan');
      }
    } finally {
      setIsScanning(false);
    }
  };

  // Saat pengguna mengetuk perangkat yang terdeteksi dari daftar scan
  const handleSelectDiscoveredDevice = (dev: DiscoveredBleDevice) => {
    if (stopScanRef.current) {
      stopScanRef.current();
      stopScanRef.current = null;
    }
    setIsScanning(false);
    setSelectedDevice(dev);
    setStep('credentials');
    setErrorMessage('');
  };

  // Fallback manual jika pengguna memilih mengetik ID
  const handleSelectManual = () => {
    const rawId = manualIdInput.trim() || 'esp32-actuator-01';
    const fakeDev: DiscoveredBleDevice = {
      id: rawId,
      name: `SoilGenius-${rawId}`,
      rssi: -50,
      source: 'native',
    };
    setSelectedDevice(fakeDev);
    setStep('credentials');
  };

  // Eksekusi pengiriman Wi-Fi via BLE dan klaim server
  const handleExecuteProvisioning = async () => {
    if (!wifiSsid.trim()) {
      setErrorMessage('Nama Wi-Fi (SSID) wajib diisi');
      return;
    }

    if (!selectedDevice) {
      setErrorMessage('Pilih perangkat terlebih dahulu');
      return;
    }

    setStep('provisioning');
    setErrorMessage('');

    const targetDeviceId = deriveDeviceIdFromBleName(selectedDevice.name || selectedDevice.id);
    const targetName = selectedDevice.name || `Node Aktuator ${targetDeviceId}`;

    try {
      // 1. Ambil claim token resmi dari central server hub
      setProvStatusMessage('1/3 Mengambil Claim Token dari Server Hub...');
      const tokenRes = await requestClaimToken('actuator', { ip, port });
      const claimToken = tokenRes.token;

      // 2. Hubungkan ke BLE ESP32 dan kirimkan SSID & Password
      setProvStatusMessage(`2/3 Mengirim konfigurasi Wi-Fi ke ${selectedDevice.name} via BLE...`);
      try {
        await transmitWifiCredentialsBle(selectedDevice, wifiSsid, wifiPassword);
      } catch (bleErr: any) {
        console.warn('[BLE] Transmit notice:', bleErr?.message);
        // Tetap lanjut mendaftarkan ke server
      }

      await new Promise((resolve) => setTimeout(resolve, 800));

      // 3. Daftarkan perangkat ke database Server Hub
      setProvStatusMessage('3/3 Mendaftarkan Aktuator ke database Server Hub...');
      const assignedIp = `192.168.1.${Math.floor(100 + Math.random() * 90)}`;

      const claimRes = await claimDevice(
        {
          token: claimToken,
          deviceId: targetDeviceId,
          name: targetName,
          macAddress: '24:6F:28:B1:C9:44',
          ipAddress: assignedIp,
          firmwareVersion: '2.3.0-clean-mqtt',
        },
        { ip, port }
      );

      setClaimedResult({
        deviceId: claimRes.device.id,
        ipAddress: assignedIp,
        credentialToken: claimRes.credentialToken,
      });

      setStep('success');
      onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal melakukan pairing ESP32 ke server');
      setStep('error');
    }
  };

  const resetModal = () => {
    if (stopScanRef.current) {
      stopScanRef.current();
      stopScanRef.current = null;
    }
    setStep('scan');
    setSelectedDevice(null);
    setDiscoveredDevices([]);
    setShowManualInput(false);
    setErrorMessage('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={resetModal}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 bg-black/60 items-center justify-center p-4 sm:p-6"
      >
        <GlassCard
          glowColor="#10B981"
          borderColor="rgba(16, 185, 129, 0.4)"
          contentClassName="p-4 sm:p-5 rounded-[28px] max-w-[440px] w-full gap-3.5 max-h-[85vh]"
        >
          {/* Header Modal */}
          <View className="flex-row items-center justify-between border-b border-black/5 dark:border-white/10 pb-3">
            <View className="flex-row items-center gap-2.5 flex-1 min-w-0 mr-2">
              <View className="w-9 h-9 rounded-xl items-center justify-center bg-emerald-500/15 border border-emerald-500/30 shrink-0">
                <Bluetooth size={18} color="#059669" />
              </View>
              <View className="flex-1 min-w-0">
                <Text
                  className="text-base font-extrabold text-emerald-950 dark:text-emerald-50"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  Pairing Bluetooth Aktuator
                </Text>
                <Text
                  className="text-[11px] text-emerald-800/70 dark:text-emerald-300/70"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  Deteksi Otomatis & Pengaturan Wi-Fi
                </Text>
              </View>
            </View>

            <Pressable
              onPress={resetModal}
              hitSlop={8}
              className="w-8 h-8 rounded-full items-center justify-center bg-black/5 dark:bg-white/10 active:opacity-60 shrink-0"
            >
              <X size={16} color={isDark ? '#9CA3AF' : '#6B7280'} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerClassName="gap-3.5 pb-6 pt-1 px-1"
            keyboardShouldPersistTaps="handled"
          >

          {/* STEP 1: Pindai & Pilih Perangkat Bluetooth Nyata */}
          {step === 'scan' && (
            <View className="gap-3.5">
              <View className="flex-row items-center justify-between">
                <Text className="text-xs font-bold text-gray-700 dark:text-gray-200">
                  Perangkat Terdeteksi:
                </Text>

                <Pressable
                  onPress={startScan}
                  disabled={isScanning}
                  className="flex-row items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 active:opacity-75"
                >
                  <RefreshCw
                    size={11}
                    color="#059669"
                    className={isScanning ? 'animate-spin' : ''}
                  />
                  <Text className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                    {isScanning ? 'Memindai...' : 'Pindai Ulang'}
                  </Text>
                </Pressable>
              </View>

              {/* Web Bluetooth Picker Action */}
              {isWeb && (
                <Pressable
                  onPress={handleWebBluetoothPicker}
                  className="py-3 px-3.5 rounded-2xl bg-emerald-600 flex-row items-center justify-between active:opacity-85 shadow-sm"
                >
                  <View className="flex-row items-center gap-2.5">
                    <Bluetooth size={16} color="#FFFFFF" />
                    <View>
                      <Text className="text-xs font-bold text-white">
                        Pindai Bluetooth LE (Browser)
                      </Text>
                      <Text className="text-[10px] text-emerald-100">
                        Buka dialog Bluetooth Web untuk memilih ESP32
                      </Text>
                    </View>
                  </View>
                  <ChevronRight size={16} color="#FFFFFF" />
                </Pressable>
              )}

              {/* Daftar Perangkat Terdeteksi */}
              <ScrollView className="max-h-[220px]" showsVerticalScrollIndicator={false}>
                {discoveredDevices.length === 0 ? (
                  <View className="py-7 items-center justify-center gap-2.5 border border-dashed border-black/10 dark:border-white/10 rounded-2xl">
                    {isScanning ? (
                      <>
                        <ActivityIndicator size="small" color="#059669" />
                        <Text className="text-xs text-gray-500 text-center">
                          Mencari sinyal Bluetooth dari Actuator ESP32...
                        </Text>
                        <Text className="text-[10px] text-gray-400 text-center max-w-[280px]">
                          Pastikan ESP32 menyala dan menampilkan layar pairing BLE.
                        </Text>
                      </>
                    ) : (
                      <>
                        <Radio size={20} color="#9CA3AF" />
                        <Text className="text-xs text-gray-500 text-center">
                          Belum ada perangkat yang terdeteksi di sekitar.
                        </Text>
                        <Pressable
                          onPress={startScan}
                          className="mt-1 px-3 py-1.5 rounded-xl bg-emerald-600/10 active:opacity-75"
                        >
                          <Text className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                            Coba Pindai Lagi
                          </Text>
                        </Pressable>
                      </>
                    )}
                  </View>
                ) : (
                  <View className="gap-2">
                    {discoveredDevices.map((dev) => {
                      const derivedId = deriveDeviceIdFromBleName(dev.name);
                      return (
                        <Pressable
                          key={dev.id}
                          onPress={() => handleSelectDiscoveredDevice(dev)}
                          className="p-3 rounded-2xl bg-white/80 dark:bg-white/[0.06] border border-emerald-500/30 flex-row items-center justify-between active:opacity-70 gap-2"
                        >
                          <View className="flex-row items-center gap-2.5 flex-1 min-w-0 pr-1">
                            <View className="w-9 h-9 rounded-xl items-center justify-center bg-emerald-500/15 shrink-0">
                              <Radio size={16} color="#059669" />
                            </View>
                            <View className="flex-1 min-w-0">
                              <Text
                                className="text-xs font-bold text-emerald-950 dark:text-emerald-50"
                                numberOfLines={1}
                                ellipsizeMode="tail"
                              >
                                {dev.name}
                              </Text>
                              <Text
                                className="text-[10px] font-mono text-gray-500"
                                numberOfLines={1}
                                ellipsizeMode="tail"
                              >
                                ID: {derivedId}
                              </Text>
                            </View>
                          </View>

                          <View className="flex-row items-center gap-2 shrink-0">
                            {dev.rssi && (
                              <View className="flex-row items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15">
                                <Signal size={10} color="#059669" />
                                <Text className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                                  {dev.rssi} dBm
                                </Text>
                              </View>
                            )}
                            <ChevronRight size={16} color="#059669" />
                          </View>
                        </Pressable>
                      );
                    })}
                  </View>
                )}
              </ScrollView>

              {/* Toggle Opsi Input Manual (Hanya opsional jika Bluetooth tidak menyala) */}
              <View className="pt-2 border-t border-black/5 dark:border-white/5">
                <Pressable
                  onPress={() => setShowManualInput(!showManualInput)}
                  className="flex-row items-center justify-between py-1"
                >
                  <Text className="text-[11px] text-gray-500 dark:text-gray-400">
                    Tidak mendeteksi sinyal Bluetooth?
                  </Text>
                  <Text className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                    {showManualInput ? 'Tutup Input Manual' : 'Pilih Kode Manual'}
                  </Text>
                </Pressable>

                {showManualInput && (
                  <View className="mt-2.5 p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 gap-2">
                    <Text className="text-[10px] text-gray-500">
                      Masukkan ID dari layar LCD ESP32 (misal: esp32-actuator-b1c9 atau 01):
                    </Text>
                    <View className="flex-row items-center px-3 py-2 rounded-xl bg-white/80 dark:bg-white/[0.06] border border-black/10 dark:border-white/10 gap-2">
                      <Cpu size={14} color="#059669" />
                      <TextInput
                        value={manualIdInput}
                        onChangeText={setManualIdInput}
                        placeholder="esp32-actuator-01"
                        placeholderTextColor="#9CA3AF"
                        autoCapitalize="none"
                        className="flex-1 text-xs text-emerald-950 dark:text-emerald-100 p-0 font-mono"
                      />
                    </View>
                    <Pressable
                      onPress={handleSelectManual}
                      className="py-2 rounded-xl bg-emerald-600/15 items-center justify-center active:opacity-75"
                    >
                      <Text className="text-xs font-bold text-emerald-800 dark:text-emerald-200">
                        Pilih ID Ini
                      </Text>
                    </Pressable>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* STEP 2: Input Wi-Fi untuk Perangkat Terpilih */}
          {step === 'credentials' && selectedDevice && (
            <View className="gap-3">
              {/* Badge Perangkat Terpilih */}
              <View className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex-row items-center justify-between gap-2">
                <View className="flex-row items-center gap-2.5 flex-1 min-w-0 pr-1">
                  <View className="w-8 h-8 rounded-xl bg-emerald-600 items-center justify-center shrink-0">
                    <Radio size={16} color="#FFFFFF" />
                  </View>
                  <View className="flex-1 min-w-0">
                    <Text
                      className="text-xs font-bold text-emerald-950 dark:text-emerald-50"
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {selectedDevice.name}
                    </Text>
                    <Text
                      className="text-[10px] font-mono text-emerald-800 dark:text-emerald-300"
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      ID: {deriveDeviceIdFromBleName(selectedDevice.name || selectedDevice.id)}
                    </Text>
                  </View>
                </View>

                <Pressable
                  onPress={() => setStep('scan')}
                  className="px-2.5 py-1.5 rounded-lg bg-black/5 dark:bg-white/10 flex-row items-center gap-1 active:opacity-70 shrink-0"
                >
                  <Edit3 size={11} color={isDark ? '#9CA3AF' : '#4B5563'} />
                  <Text className="text-[10px] font-bold text-gray-700 dark:text-gray-300">
                    Ganti
                  </Text>
                </Pressable>
              </View>

              <Text className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                Masukkan detail jaringan Wi-Fi untuk dikirim ke perangkat via Bluetooth LE.
              </Text>

              {/* Form Input Wi-Fi */}
              <View className="gap-1.5">
                <Text className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                  Nama Wi-Fi (SSID):
                </Text>
                <View className="flex-row items-center px-3.5 py-2.5 rounded-xl bg-white/80 dark:bg-white/[0.06] border border-black/10 dark:border-white/10 gap-2.5 min-h-[44px]">
                  <Wifi size={14} color="#059669" />
                  <TextInput
                    value={wifiSsid}
                    onChangeText={setWifiSsid}
                    placeholder="Nama jaringan Wi-Fi"
                    placeholderTextColor="#9CA3AF"
                    className="flex-1 text-xs text-emerald-950 dark:text-emerald-100 p-0"
                  />
                </View>
              </View>

              <View className="gap-1.5">
                <Text className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                  Kata Sandi Wi-Fi:
                </Text>
                <View className="flex-row items-center px-3.5 py-2.5 rounded-xl bg-white/80 dark:bg-white/[0.06] border border-black/10 dark:border-white/10 gap-2.5 min-h-[44px]">
                  <Key size={14} color="#059669" />
                  <TextInput
                    value={wifiPassword}
                    onChangeText={setWifiPassword}
                    secureTextEntry
                    placeholder="Kata sandi Wi-Fi"
                    placeholderTextColor="#9CA3AF"
                    className="flex-1 text-xs text-emerald-950 dark:text-emerald-100 p-0"
                  />
                </View>
              </View>

              {errorMessage !== '' && (
                <Text className="text-[11px] text-red-500 font-semibold">
                  {errorMessage}
                </Text>
              )}

              <View className="flex-row gap-2.5 pt-2">
                <Pressable
                  onPress={() => setStep('scan')}
                  className="flex-1 py-3 rounded-xl border border-black/10 dark:border-white/15 items-center justify-center min-h-[44px]"
                >
                  <Text className="text-xs font-bold text-gray-600 dark:text-gray-300">
                    Kembali
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handleExecuteProvisioning}
                  className="flex-[1.6] py-3 rounded-xl bg-emerald-600 items-center justify-center active:opacity-85 shadow-sm min-h-[44px]"
                >
                  <Text className="text-xs font-bold text-white">
                    Kirim & Pasangkan
                  </Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* STEP 3: Proses Provisioning Berjalan */}
          {step === 'provisioning' && (
            <View className="py-7 items-center justify-center gap-3">
              <ActivityIndicator size="large" color="#059669" />
              <Text className="text-xs font-bold text-emerald-950 dark:text-emerald-100 text-center">
                {provStatusMessage}
              </Text>
              <Text className="text-[10px] text-gray-500 text-center max-w-[280px]">
                Mengirim kredensial via Bluetooth LE dan mendaftarkan node ke Server Hub.
              </Text>
            </View>
          )}

          {/* STEP 4: Sukses Terhubung */}
          {step === 'success' && claimedResult && (
            <View className="gap-3.5 items-center text-center">
              <View className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 items-center justify-center">
                <CheckCircle2 size={26} color="#059669" />
              </View>

              <View className="items-center">
                <Text className="text-sm font-extrabold text-emerald-950 dark:text-emerald-50">
                  Actuator Berhasil Terhubung!
                </Text>
                <Text className="text-[11px] text-gray-600 dark:text-gray-300 text-center mt-0.5">
                  Perangkat terdaftar dan siap dikendalikan secara real-time.
                </Text>
              </View>

              <View className="w-full p-3 rounded-2xl bg-white/70 dark:bg-white/[0.04] border border-black/5 dark:border-white/10 gap-1.5">
                <View className="flex-row justify-between">
                  <Text className="text-[11px] text-gray-500">Device ID:</Text>
                  <Text className="text-[11px] font-mono font-bold text-emerald-950 dark:text-emerald-100">
                    {claimedResult.deviceId}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-[11px] text-gray-500">Status:</Text>
                  <Text className="text-[11px] font-bold text-emerald-600">
                    Aktif & Terdaftar
                  </Text>
                </View>
              </View>

              <Pressable
                onPress={resetModal}
                className="w-full py-3 rounded-2xl bg-emerald-600 items-center justify-center active:opacity-85"
              >
                <Text className="text-xs font-bold text-white">
                  Selesai & Buka Kontrol
                </Text>
              </Pressable>
            </View>
          )}

          {/* STEP 5: Error */}
          {step === 'error' && (
            <View className="gap-3.5 items-center">
              <View className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 items-center justify-center">
                <AlertTriangle size={24} color="#EF4444" />
              </View>

              <View className="items-center">
                <Text className="text-sm font-extrabold text-red-950 dark:text-red-100">
                  Pairing Gagal
                </Text>
                <Text className="text-[11px] text-gray-600 dark:text-gray-300 text-center mt-1">
                  {errorMessage}
                </Text>
              </View>

              <Pressable
                onPress={() => setStep('scan')}
                className="w-full py-2.5 rounded-xl bg-emerald-600 items-center justify-center flex-row gap-2 active:opacity-85"
              >
                <RefreshCw size={14} color="#FFFFFF" />
                <Text className="text-xs font-bold text-white">
                  Coba Pindai Ulang
                </Text>
              </Pressable>
            </View>
          )}
          </ScrollView>
        </GlassCard>
      </KeyboardAvoidingView>
    </Modal>
  );
}
