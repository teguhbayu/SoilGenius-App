import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from '@/components/ui/styled';
import { useRouter } from 'expo-router';
import {
  Wifi,
  WifiOff,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  CheckCircle2,
  Server,
  Activity,
  ChevronLeft,
  KeyRound,
  Save,
} from 'lucide-react-native';

import { GlassCard } from '@/components/ui/glass-card';
import { MeshBackground } from '@/components/ui/mesh-background';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function SettingsScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [isPinging, setIsPinging] = useState<boolean>(false);
  const [pingResult, setPingResult] = useState<string | null>('18 ms (Stabil)');

  const [ssid, setSsid] = useState<string>('Kebun_Smart_Agri');
  const [password, setPassword] = useState<string>('pertanian2026');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  const handleTestPing = () => {
    setIsPinging(true);
    setPingResult(null);
    setTimeout(() => {
      setIsPinging(false);
      const latency = Math.floor(Math.random() * 12) + 14;
      setPingResult(`${latency} ms (Stabil)`);
    }, 1000);
  };

  const handleToggleConnection = () => {
    setIsConnected((prev) => !prev);
    setPingResult(null);
  };

  const handleSaveWifi = () => {
    if (!ssid.trim()) {
      if (Platform.OS === 'web') {
        window.alert('Nama SSID Wi-Fi tidak boleh kosong');
      } else {
        Alert.alert('Peringatan', 'Nama SSID Wi-Fi tidak boleh kosong');
      }
      return;
    }

    if (password.length < 8) {
      if (Platform.OS === 'web') {
        window.alert('Kata sandi minimal 8 karakter');
      } else {
        Alert.alert('Peringatan', 'Kata sandi minimal 8 karakter');
      }
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccessMessage(`Kredensial Wi-Fi "${ssid}" berhasil dikirim dan disimpan ke modul ESP32!`);
      setTimeout(() => {
        setSaveSuccessMessage(null);
      }, 5000);
    }, 1200);
  };

  return (
    <View className="flex-1">
      <MeshBackground />

      <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
        <View className="flex-row items-center px-4 py-2">
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full border items-center justify-center bg-white/85 dark:bg-white/10 border-emerald-500/20 dark:border-white/15 active:opacity-70">
            <ChevronLeft size={20} color={colors.text} />
          </Pressable>

          <View className="ml-3">
            <Text className="text-xl font-extrabold tracking-tight text-emerald-950 dark:text-emerald-50">
              Pengaturan ESP32
            </Text>
            <Text className="text-xs text-emerald-800/70 dark:text-emerald-300/70">
              Konfigurasi Jaringan & Perangkat IoT
            </Text>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerClassName="px-4 pt-2 pb-24 max-w-[500px] self-center w-full gap-4">
          {saveSuccessMessage && (
            <GlassCard variant="tinted" contentClassName="p-3 rounded-2xl">
              <View className="flex-row items-center gap-2">
                <CheckCircle2 size={18} color="#059669" />
                <Text className="text-xs font-semibold text-emerald-800 dark:text-emerald-200 flex-1">
                  {saveSuccessMessage}
                </Text>
              </View>
            </GlassCard>
          )}

          <GlassCard
            glowColor={isConnected ? '#10B981' : '#EF4444'}
            borderColor={isConnected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}
            contentClassName="p-4 rounded-[20px] gap-3">
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center gap-3 flex-1">
                <View
                  className={`w-10 h-10 rounded-xl items-center justify-center ${
                    isConnected
                      ? 'bg-emerald-100 dark:bg-emerald-950/50'
                      : 'bg-red-100 dark:bg-red-950/50'
                  }`}>
                  {isConnected ? (
                    <Wifi size={20} color="#059669" />
                  ) : (
                    <WifiOff size={20} color="#DC2626" />
                  )}
                </View>
                <View>
                  <Text className="text-base font-bold text-emerald-950 dark:text-emerald-50">
                    Status Koneksi ESP32
                  </Text>
                  <Text className="text-xs text-gray-500">
                    Node Telemetri Kebun #01
                  </Text>
                </View>
              </View>

              <View
                className={`flex-row items-center gap-1.5 py-1 px-3 rounded-full border ${
                  isConnected
                    ? 'bg-emerald-100 border-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-500/40'
                    : 'bg-red-100 border-red-300 dark:bg-red-950/40 dark:border-red-500/40'
                }`}>
                <View
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? 'bg-emerald-500' : 'bg-red-500'
                  }`}
                />
                <Text
                  className={`text-xs font-bold ${
                    isConnected ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'
                  }`}>
                  {isConnected ? 'Terhubung' : 'Terputus'}
                </Text>
              </View>
            </View>

            <View className="p-3 rounded-2xl gap-2.5 bg-black/[0.03] dark:bg-white/[0.03]">
              <View className="flex-row justify-between items-center">
                <Text className="text-xs text-gray-500">Model Mikrokontroler</Text>
                <Text className="text-xs font-bold text-emerald-950 dark:text-emerald-50">ESP32-WROOM-32D</Text>
              </View>
              <View className="h-[1px] bg-black/5 dark:bg-white/5" />
              <View className="flex-row justify-between items-center">
                <Text className="text-xs text-gray-500">Alamat IP Lokal</Text>
                <Text className="text-xs font-bold text-emerald-950 dark:text-emerald-50">{isConnected ? '192.168.1.120' : '—'}</Text>
              </View>
              <View className="h-[1px] bg-black/5 dark:bg-white/5" />
              <View className="flex-row justify-between items-center">
                <Text className="text-xs text-gray-500">MAC Address</Text>
                <Text className="text-xs font-bold text-emerald-950 dark:text-emerald-50">24:6F:28:8A:BC:12</Text>
              </View>
              <View className="h-[1px] bg-black/5 dark:bg-white/5" />
              <View className="flex-row justify-between items-center">
                <Text className="text-xs text-gray-500">Kekuatan Sinyal (RSSI)</Text>
                <Text className={`text-xs font-bold ${isConnected ? 'text-emerald-600' : 'text-gray-400'}`}>
                  {isConnected ? '-58 dBm (Sangat Baik)' : 'Tidak ada sinyal'}
                </Text>
              </View>
              <View className="h-[1px] bg-black/5 dark:bg-white/5" />
              <View className="flex-row justify-between items-center">
                <Text className="text-xs text-gray-500">Uji Latensi (Ping)</Text>
                <Text className="text-xs font-bold text-emerald-950 dark:text-emerald-50">
                  {isPinging ? 'Mengukur...' : pingResult ?? 'Belum diuji'}
                </Text>
              </View>
            </View>

            <View className="flex-row gap-2 items-center">
              <Pressable
                onPress={handleTestPing}
                disabled={!isConnected || isPinging}
                className={`flex-1 flex-row items-center justify-center gap-2 py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/30 active:opacity-70 ${
                  !isConnected || isPinging ? 'opacity-50' : ''
                }`}>
                {isPinging ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Activity size={16} color={colors.primary} />
                )}
                <Text className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  {isPinging ? 'Menguji Ping...' : 'Uji Respon & Latensi'}
                </Text>
              </Pressable>

              <Pressable
                onPress={handleToggleConnection}
                className="flex-row items-center gap-1.5 py-2.5 px-3 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 active:opacity-70">
                <RefreshCw size={13} color="#6B7280" />
                <Text className="text-[11px] font-semibold text-gray-500">
                  {isConnected ? 'Simulasi Putus' : 'Simulasi Sambung'}
                </Text>
              </Pressable>
            </View>
          </GlassCard>

          <GlassCard
            glowColor="#10B981"
            borderColor="rgba(16, 185, 129, 0.3)"
            contentClassName="p-4 rounded-[20px] gap-3">
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-xl items-center justify-center bg-emerald-100 dark:bg-emerald-950/50">
                <KeyRound size={20} color="#059669" />
              </View>
              <View>
                <Text className="text-base font-bold text-emerald-950 dark:text-emerald-50">
                  Ganti Sandi WiFi ESP32
                </Text>
                <Text className="text-xs text-gray-500">
                  Perbarui Kredensial Akses Access Point
                </Text>
              </View>
            </View>

            <View className="gap-3 mt-1">
              <View className="gap-1.5">
                <Text className="text-xs font-semibold text-emerald-950 dark:text-emerald-50">
                  Nama Jaringan Wi-Fi (SSID)
                </Text>
                <View className="flex-row items-center border border-emerald-500/30 dark:border-emerald-400/30 rounded-xl px-3 h-12 bg-white/80 dark:bg-emerald-950/30">
                  <Wifi size={18} color="#059669" className="mr-2.5" />
                  <TextInput
                    value={ssid}
                    onChangeText={setSsid}
                    placeholder="Masukkan nama WiFi..."
                    placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                    className="flex-1 text-sm h-full text-emerald-950 dark:text-emerald-50"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View className="gap-1.5">
                <Text className="text-xs font-semibold text-emerald-950 dark:text-emerald-50">
                  Kata Sandi Baru
                </Text>
                <View className="flex-row items-center border border-emerald-500/30 dark:border-emerald-400/30 rounded-xl px-3 h-12 bg-white/80 dark:bg-emerald-950/30">
                  <Lock size={18} color="#059669" className="mr-2.5" />
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Masukkan sandi WiFi baru..."
                    placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                    secureTextEntry={!showPassword}
                    className="flex-1 text-sm h-full text-emerald-950 dark:text-emerald-50"
                    autoCapitalize="none"
                  />
                  <Pressable
                    onPress={() => setShowPassword((prev) => !prev)}
                    className="p-1.5">
                    {showPassword ? (
                      <EyeOff size={18} color="#6B7280" />
                    ) : (
                      <Eye size={18} color="#6B7280" />
                    )}
                  </Pressable>
                </View>
                <Text className="text-[11px] text-gray-500 pl-0.5">
                  Panjang kata sandi minimal 8 karakter (WPA2-PSK).
                </Text>
              </View>

              <View className="flex-row items-center gap-2 flex-wrap">
                <Text className="text-[11px] font-medium text-gray-500">
                  Saran:
                </Text>
                <Pressable
                  onPress={() => setSsid('Kebun_Smart_Agri')}
                  className="py-1 px-2.5 rounded-lg border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 active:opacity-70">
                  <Text className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                    Kebun_Smart_Agri
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setSsid('ESP32_AccessPoint')}
                  className="py-1 px-2.5 rounded-lg border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 active:opacity-70">
                  <Text className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                    ESP32_AccessPoint
                  </Text>
                </Pressable>
              </View>

              <Pressable
                onPress={handleSaveWifi}
                disabled={isSaving}
                className="flex-row items-center justify-center gap-2 py-3.5 rounded-2xl bg-emerald-600 mt-1.5 shadow-md active:opacity-85">
                {isSaving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Save size={18} color="#FFFFFF" />
                )}
                <Text className="text-white text-sm font-bold">
                  {isSaving ? 'Mengirim ke ESP32...' : 'Simpan Sandi & Terapkan'}
                </Text>
              </Pressable>
            </View>
          </GlassCard>

          <GlassCard
            glowColor="#34D399"
            borderColor="rgba(52, 211, 153, 0.25)"
            contentClassName="p-4 rounded-[20px] gap-2.5">
            <View className="flex-row items-center gap-2">
              <Server size={18} color="#059669" />
              <Text className="text-sm font-bold text-emerald-950 dark:text-emerald-50">
                Protokol Pengiriman Data
              </Text>
            </View>

            <Text className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Modul ESP32 secara periodik mengirimkan pembacaan pH, suhu, dan kelembapan melalui protokol MQTT / HTTP REST ke database cloud pertanian.
            </Text>

            <View className="flex-row flex-wrap gap-2 mt-1">
              <View className="py-1 px-2.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/40">
                <Text className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">
                  MQTT: broker.emqx.io
                </Text>
              </View>
              <View className="py-1 px-2.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/40">
                <Text className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">
                  Port: 1883 / TLS
                </Text>
              </View>
              <View className="py-1 px-2.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/40">
                <Text className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">
                  Interval: 5 Detik
                </Text>
              </View>
            </View>
          </GlassCard>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
