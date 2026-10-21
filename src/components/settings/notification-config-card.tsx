import React from 'react';
import { View, Text, Switch, Pressable } from 'react-native';
import { Bell, BellRing, Send, CheckCircle2, AlertCircle } from 'lucide-react-native';
import { GlassCard } from '@/components/ui/glass-card';
import { useSoilNotification } from '@/components/notification/soil-notification-provider';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useToast } from '@/hooks/use-toast';

export function NotificationConfigCard() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const toast = useToast();

  const {
    isEnabled,
    hasPermission,
    latestData,
    lastCheckTime,
    toggleNotifications,
    triggerTest,
  } = useSoilNotification();

  const handleToggle = async (val: boolean) => {
    await toggleNotifications(val);
    if (val) {
      toast.success('Notifikasi data tanah baru diaktifkan');
    } else {
      toast.info('Notifikasi data tanah baru dinonaktifkan');
    }
  };

  const handleTest = async () => {
    try {
      await triggerTest();
      toast.success('Notifikasi uji coba berhasil dikirim!');
    } catch (err: any) {
      toast.error('Gagal mengirim notifikasi uji coba');
    }
  };

  return (
    <GlassCard
      glowColor="#10B981"
      borderColor={
        isEnabled
          ? 'rgba(16, 185, 129, 0.35)'
          : isDark
          ? 'rgba(255, 255, 255, 0.1)'
          : 'rgba(16, 185, 129, 0.2)'
      }
      contentClassName="p-4 rounded-[22px] gap-3"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2.5 flex-1 pr-2">
          <View className="w-9 h-9 rounded-xl items-center justify-center bg-emerald-500/15 border border-emerald-500/30">
            {isEnabled ? (
              <BellRing size={18} color="#059669" />
            ) : (
              <Bell size={18} color="#6B7280" />
            )}
          </View>
          <View className="flex-1">
            <Text className="text-sm font-extrabold text-emerald-950 dark:text-emerald-50">
              Notifikasi Data Real-Time
            </Text>
            <Text className="text-[11px] text-emerald-800/70 dark:text-emerald-300/70">
              Pemberitahuan data baru dari /api/v1/data/current
            </Text>
          </View>
        </View>

        <Switch
          value={isEnabled}
          onValueChange={handleToggle}
          trackColor={{ false: isDark ? '#374151' : '#D1D5DB', true: '#10B981' }}
          thumbColor="#FFFFFF"
        />
      </View>

      {/* Permission & Status Pill */}
      <View className="flex-row items-center justify-between p-2.5 rounded-xl bg-white/60 dark:bg-white/[0.04] border border-black/5 dark:border-white/10">
        <View className="flex-row items-center gap-1.5">
          {hasPermission ? (
            <CheckCircle2 size={13} color="#059669" />
          ) : (
            <AlertCircle size={13} color="#D97706" />
          )}
          <Text className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">
            {hasPermission ? 'Izin Notifikasi Aktif' : 'Izin Belum Diberikan'}
          </Text>
        </View>

        <View className="flex-row items-center gap-1">
          <View
            className={`w-2 h-2 rounded-full ${
              isEnabled ? 'bg-emerald-500' : 'bg-gray-400'
            }`}
          />
          <Text className="text-[10px] font-bold text-gray-500 dark:text-gray-400">
            {isEnabled ? 'Monitoring Aktif' : 'Nonaktif'}
          </Text>
        </View>
      </View>

      {/* Latest sync info */}
      {latestData && (
        <View className="px-1">
          <Text className="text-[10px] text-gray-500 dark:text-gray-400">
            Data Terkini: Kelembapan {latestData.moisture}% • Suhu {latestData.tempC}°C • pH {latestData.ph}
          </Text>
        </View>
      )}

      {/* Test notification button */}
      <Pressable
        onPress={handleTest}
        className="py-2.5 px-3 rounded-xl bg-emerald-600/10 dark:bg-emerald-500/15 border border-emerald-500/25 flex-row items-center justify-center gap-2 active:opacity-75"
      >
        <Send size={13} color="#059669" />
        <Text className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
          Uji Coba Push Notifikasi
        </Text>
      </Pressable>
    </GlassCard>
  );
}
