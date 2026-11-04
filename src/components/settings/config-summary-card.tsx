import React from 'react';
import { View, Text } from 'react-native';
import { Network } from 'lucide-react-native';
import { GlassCard } from '@/components/ui/glass-card';
import { AppSettingsConfig } from '@/types/settings';

interface ConfigSummaryCardProps {
  config: AppSettingsConfig;
}

export function ConfigSummaryCard({ config }: ConfigSummaryCardProps) {
  return (
    <GlassCard
      glowColor="#10B981"
      borderColor="rgba(16, 185, 129, 0.3)"
      contentClassName="p-4 rounded-[22px] gap-3"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2.5">
          <View className="w-9 h-9 rounded-xl items-center justify-center bg-emerald-500/15 border border-emerald-500/30">
            <Network size={18} color="#059669" />
          </View>
          <View>
            <Text className="text-sm font-extrabold text-emerald-950 dark:text-emerald-50">
              Koneksi Server REST API
            </Text>
            <Text className="text-[11px] text-emerald-800/70 dark:text-emerald-300/70">
              Endpoint backend sistem
            </Text>
          </View>
        </View>

        <View className="flex-row items-center gap-1.5 py-1 px-2.5 rounded-full bg-emerald-500/15 border border-emerald-500/30">
          <View className="w-2 h-2 rounded-full bg-emerald-500" />
          <Text className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
            Tersimpan
          </Text>
        </View>
      </View>

      <View className="p-3 rounded-xl bg-white/60 dark:bg-white/[0.04] border border-black/5 dark:border-white/5 gap-2">
        <View className="flex-row justify-between items-center">
          <Text className="text-[11px] text-emerald-900/60 dark:text-emerald-300/60 font-medium">
            URL Base REST API:
          </Text>
          <Text className="text-xs font-mono font-bold text-emerald-950 dark:text-emerald-50">
            http://{config.apiServerIp}:{config.apiServerPort}
          </Text>
        </View>

        <View className="h-[1px] bg-black/5 dark:bg-white/5" />

        <View className="flex-row justify-between items-center">
          <Text className="text-[11px] text-emerald-900/60 dark:text-emerald-300/60 font-medium">
            Protokol:
          </Text>
          <Text className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-300">
            HTTP REST JSON
          </Text>
        </View>
      </View>
    </GlassCard>
  );
}
