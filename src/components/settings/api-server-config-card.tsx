import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { Network, Globe } from 'lucide-react-native';
import { GlassCard } from '@/components/ui/glass-card';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface ApiServerConfigCardProps {
  apiServerIp: string;
  apiServerPort: string;
  onChangeIp: (ip: string) => void;
  onChangePort: (port: string) => void;
}

export function ApiServerConfigCard({
  apiServerIp,
  apiServerPort,
  onChangeIp,
  onChangePort,
}: ApiServerConfigCardProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  return (
    <GlassCard
      glowColor="#10B981"
      borderColor="rgba(16, 185, 129, 0.25)"
      contentClassName="p-4 rounded-[22px] gap-3"
    >
      <View className="flex-row items-center gap-2.5">
        <View className="w-9 h-9 rounded-xl items-center justify-center bg-emerald-500/15 border border-emerald-500/30">
          <Network size={18} color="#059669" />
        </View>
        <View className="flex-1">
          <Text className="text-sm font-extrabold text-emerald-950 dark:text-emerald-50">
            API Server IP
          </Text>
          <Text className="text-[11px] text-emerald-800/70 dark:text-emerald-300/70">
            Alamat server REST API / backend sistem
          </Text>
        </View>
      </View>

      <View className="gap-2.5">
        <View className="gap-1">
          <Text className="text-xs font-bold text-emerald-900/80 dark:text-emerald-200/80">
            IP Server / Host API
          </Text>
          <View className="flex-row items-center px-3 py-2.5 rounded-xl bg-white/70 dark:bg-white/[0.05] border border-emerald-500/25 dark:border-white/10">
            <Globe size={16} color="#059669" />
            <TextInput
              value={apiServerIp}
              onChangeText={onChangeIp}
              placeholder="Contoh: 192.168.1.100 atau api.domain.com"
              placeholderTextColor={isDark ? '#9CA3AF' : '#64748B'}
              autoCapitalize="none"
              autoCorrect={false}
              className="flex-1 ml-2.5 text-sm font-mono text-emerald-950 dark:text-emerald-50"
            />
          </View>
        </View>

        <View className="gap-1">
          <Text className="text-xs font-bold text-emerald-900/80 dark:text-emerald-200/80">
            Port API
          </Text>
          <View className="flex-row items-center px-3 py-2.5 rounded-xl bg-white/70 dark:bg-white/[0.05] border border-emerald-500/25 dark:border-white/10">
            <TextInput
              value={apiServerPort}
              onChangeText={onChangePort}
              placeholder="5000"
              placeholderTextColor={isDark ? '#9CA3AF' : '#64748B'}
              keyboardType="numeric"
              autoCapitalize="none"
              autoCorrect={false}
              className="flex-1 text-sm font-mono text-emerald-950 dark:text-emerald-50"
            />
          </View>
        </View>
      </View>
    </GlassCard>
  );
}
