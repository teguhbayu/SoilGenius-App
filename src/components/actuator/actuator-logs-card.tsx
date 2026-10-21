import React from 'react';
import { View, Text } from 'react-native';
import { History, CheckCircle2, Zap, Clock, Sliders } from 'lucide-react-native';
import { GlassCard } from '@/components/ui/glass-card';
import { ActuatorActivityLog } from '@/types/actuator';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface ActuatorLogsCardProps {
  logs: ActuatorActivityLog[];
}

export function ActuatorLogsCard({ logs }: ActuatorLogsCardProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  return (
    <GlassCard
      glowColor="#10B981"
      borderColor={isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(16, 185, 129, 0.2)'}
      contentClassName="p-4 rounded-[24px] gap-3"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2.5">
          <View className="w-8 h-8 rounded-xl items-center justify-center bg-emerald-500/15 border border-emerald-500/30">
            <History size={16} color="#059669" />
          </View>
          <View>
            <Text className="text-sm font-extrabold text-emerald-950 dark:text-emerald-50">
              Riwayat Aktivitas Aktuator
            </Text>
            <Text className="text-[11px] text-emerald-800/70 dark:text-emerald-300/70">
              Catatan eksekusi & pemicu otomatis terbaru
            </Text>
          </View>
        </View>

        <Text className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
          {logs.length} Log
        </Text>
      </View>

      {logs.length === 0 ? (
        <View className="py-6 items-center justify-center gap-1.5">
          <Text className="text-xs text-gray-500 dark:text-gray-400">
            Belum ada catatan aktivitas aktuator.
          </Text>
        </View>
      ) : (
        <View className="gap-2.5 mt-1">
          {logs.slice(0, 5).map((log) => {
            const isAuto = log.triggerType === 'auto';
            const isSchedule = log.triggerType === 'schedule';

            return (
              <View
                key={log.id}
                className="p-3 rounded-2xl bg-white/50 dark:bg-white/[0.04] border border-black/5 dark:border-white/10 flex-row items-start justify-between gap-2"
              >
                <View className="flex-1 pr-1">
                  <View className="flex-row items-center gap-1.5 mb-1">
                    <Text className="text-xs font-bold text-emerald-950 dark:text-emerald-100">
                      {log.actuatorName}
                    </Text>
                  </View>
                  <Text className="text-[11px] text-gray-600 dark:text-gray-300 leading-tight">
                    {log.action}
                  </Text>
                  <Text className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                    {log.timestamp}
                  </Text>
                </View>

                <View
                  className={`px-2 py-0.5 rounded-md ${
                    isAuto
                      ? 'bg-emerald-500/15 border border-emerald-500/30'
                      : isSchedule
                      ? 'bg-blue-500/15 border border-blue-500/30'
                      : 'bg-amber-500/15 border border-amber-500/30'
                  }`}
                >
                  <Text
                    className={`text-[9px] font-bold uppercase ${
                      isAuto
                        ? 'text-emerald-700 dark:text-emerald-300'
                        : isSchedule
                        ? 'text-blue-700 dark:text-blue-300'
                        : 'text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    {log.triggerType}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </GlassCard>
  );
}
