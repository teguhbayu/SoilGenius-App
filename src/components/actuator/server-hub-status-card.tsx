import React from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import {
  Server,
  Radio,
  Wifi,
  Cpu,
  Plus,
  CheckCircle2,
  AlertCircle,
  Bluetooth,
  Trash2,
} from 'lucide-react-native';
import { GlassCard } from '@/components/ui/glass-card';
import { DeviceDto } from '@/types/device';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface ServerHubStatusCardProps {
  serverOnline: boolean;
  actuatorDevice: DeviceDto | null;
  onOpenBlePairing: () => void;
  onUnpairDevice?: (deviceId: string) => void;
}

export function ServerHubStatusCard({
  serverOnline,
  actuatorDevice,
  onOpenBlePairing,
  onUnpairDevice,
}: ServerHubStatusCardProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const isActuatorOnline = actuatorDevice?.status === 'online';

  const handleConfirmUnpair = () => {
    if (!actuatorDevice || !onUnpairDevice) return;
    Alert.alert(
      'Hapus / Putuskan Perangkat',
      `Yakin ingin menghapus perangkat "${actuatorDevice.name || actuatorDevice.id}" dari server?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => onUnpairDevice(actuatorDevice.id),
        },
      ]
    );
  };

  return (
    <GlassCard
      glowColor={serverOnline ? '#10B981' : '#EF4444'}
      borderColor={
        serverOnline
          ? 'rgba(16, 185, 129, 0.35)'
          : 'rgba(239, 68, 68, 0.35)'
      }
      contentClassName="p-4 rounded-[26px] gap-3.5"
    >
      {/* Server as Central Hub Status Header */}
      <View className="flex-row items-center justify-between gap-2">
        <View className="flex-row items-center gap-2.5 flex-1 min-w-0">
          <View className="w-10 h-10 rounded-xl items-center justify-center bg-emerald-500/15 border border-emerald-500/30 shrink-0">
            <Server size={20} color="#059669" />
          </View>
          <View className="flex-1 min-w-0">
            <Text
              className="text-sm font-extrabold text-emerald-950 dark:text-emerald-50"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              Pusat Server Hub
            </Text>
            <Text
              className="text-[11px] text-emerald-800/70 dark:text-emerald-300/70"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              Sensor ESP32 • Actuator • Mobile
            </Text>
          </View>
        </View>

        <View
          className={`px-2 py-0.5 rounded-full border flex-row items-center gap-1 shrink-0 ${
            serverOnline
              ? 'bg-emerald-500/15 border-emerald-500/30'
              : 'bg-red-500/15 border-red-500/30'
          }`}
        >
          <View
            className={`w-1.5 h-1.5 rounded-full ${
              serverOnline ? 'bg-emerald-500' : 'bg-red-500'
            }`}
          />
          <Text
            className={`text-[10px] font-bold ${
              serverOnline
                ? 'text-emerald-700 dark:text-emerald-300'
                : 'text-red-700 dark:text-red-300'
            }`}
          >
            {serverOnline ? 'Online' : 'Offline'}
          </Text>
        </View>
      </View>

      {/* Nodes Status Grid */}
      <View className="flex-row gap-2.5">
        {/* Node 1: Sensor ESP32 (Single Master Node) */}
        <View className="flex-1 p-3 rounded-2xl bg-white/60 dark:bg-white/[0.04] border border-black/5 dark:border-white/10 gap-1.5">
          <View className="flex-row items-center justify-between">
            <View className="w-7 h-7 rounded-lg items-center justify-center bg-sky-500/15">
              <Radio size={14} color="#0284C7" />
            </View>
            <View className="px-1.5 py-0.5 rounded-md bg-sky-500/15">
              <Text className="text-[9px] font-bold text-sky-700 dark:text-sky-300">
                Master Sensor
              </Text>
            </View>
          </View>
          <Text className="text-xs font-bold text-emerald-950 dark:text-emerald-100">
            Sensor ESP32
          </Text>
          <Text className="text-[10px] text-gray-500">
            Sumber Data Tunggal Lahan
          </Text>
          <View className="flex-row items-center gap-1 mt-0.5">
            <CheckCircle2 size={10} color="#059669" />
            <Text className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
              Telemetri Aktif
            </Text>
          </View>
        </View>

        {/* Node 2: Actuator ESP32 */}
        <View className="flex-1 p-3 rounded-2xl bg-white/60 dark:bg-white/[0.04] border border-black/5 dark:border-white/10 gap-1.5">
          <View className="flex-row items-center justify-between">
            <View className="w-7 h-7 rounded-lg items-center justify-center bg-emerald-500/15">
              <Cpu size={14} color="#059669" />
            </View>
            <View
              className={`px-1.5 py-0.5 rounded-md ${
                !actuatorDevice
                  ? 'bg-amber-500/15'
                  : isActuatorOnline
                  ? 'bg-emerald-500/15'
                  : 'bg-gray-500/15'
              }`}
            >
              <Text
                className={`text-[9px] font-bold ${
                  !actuatorDevice
                    ? 'text-amber-700 dark:text-amber-300'
                    : isActuatorOnline
                    ? 'text-emerald-700 dark:text-emerald-300'
                    : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                {!actuatorDevice
                  ? 'Belum Pasang'
                  : isActuatorOnline
                  ? 'Online (MQTT)'
                  : 'Offline'}
              </Text>
            </View>
          </View>
          <Text className="text-xs font-bold text-emerald-950 dark:text-emerald-100">
            Actuator ESP32
          </Text>
          <Text className="text-[10px] text-gray-500 font-mono" numberOfLines={1}>
            {actuatorDevice ? actuatorDevice.id : 'Belum Terpasang'}
          </Text>
          <View className="flex-row items-center gap-1 mt-0.5">
            <Wifi size={10} color={isActuatorOnline ? '#059669' : '#6B7280'} />
            <Text className="text-[10px] font-semibold text-gray-600 dark:text-gray-300" numberOfLines={1}>
              {actuatorDevice?.ipAddress || (actuatorDevice ? 'Menunggu IP...' : 'Belum Terhubung')}
            </Text>
          </View>
        </View>
      </View>

      {/* BLE Provisioning / Manage Trigger */}
      <View className="flex-row gap-2">
        <Pressable
          onPress={onOpenBlePairing}
          className="flex-1 p-3 rounded-2xl bg-emerald-600/10 dark:bg-emerald-500/15 border border-emerald-500/25 flex-row items-center justify-between active:opacity-75"
        >
          <View className="flex-row items-center gap-2.5 flex-1 min-w-0 mr-1">
            <View className="w-8 h-8 rounded-xl bg-emerald-600 items-center justify-center shrink-0">
              <Bluetooth size={16} color="#FFFFFF" />
            </View>
            <View className="flex-1 min-w-0">
              <Text
                className="text-xs font-bold text-emerald-950 dark:text-emerald-50"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {actuatorDevice ? 'Pasang / Ganti Node (BLE)' : 'Pasangkan Aktuator (BLE)'}
              </Text>
              <Text
                className="text-[10px] text-emerald-800/70 dark:text-emerald-300/70"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                Kirim Wi-Fi & Daftarkan ke Server
              </Text>
            </View>
          </View>

          <Plus size={16} color="#059669" className="shrink-0" />
        </Pressable>

        {actuatorDevice && onUnpairDevice && (
          <Pressable
            onPress={handleConfirmUnpair}
            hitSlop={8}
            className="w-11 sm:w-12 rounded-2xl bg-red-500/10 border border-red-500/20 items-center justify-center active:opacity-75 shrink-0"
          >
            <Trash2 size={16} color="#EF4444" />
          </Pressable>
        )}
      </View>
    </GlassCard>
  );
}
