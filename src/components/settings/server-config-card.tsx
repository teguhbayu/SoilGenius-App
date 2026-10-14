import { GlassCard } from '@/components/ui/glass-card';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Globe, Server } from 'lucide-react-native';
import { Text, TextInput, View } from 'react-native';

interface ServerConfigCardProps {
  serverIp: string;
  serverPort: string;
  onChangeIp: (ip: string) => void;
  onChangePort: (port: string) => void;
}


export function ServerConfigCard({
  serverIp,
  serverPort,
  onChangeIp,
  onChangePort,
}: ServerConfigCardProps) {
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
          <Server size={18} color="#059669" />
        </View>
        <View className="flex-1">
          <Text className="text-sm font-extrabold text-emerald-950 dark:text-emerald-50">
            Server IP / Host Broker
          </Text>
          <Text className="text-[11px] text-emerald-800/70 dark:text-emerald-300/70">
            Alamat IP atau domain MQTT broker
          </Text>
        </View>
      </View>

      <View className="gap-2.5">
        <View className="gap-1">
          <Text className="text-xs font-bold text-emerald-900/80 dark:text-emerald-200/80">
            Alamat IP / Host
          </Text>
          <View className="flex-row items-center px-3 py-2.5 rounded-xl bg-white/70 dark:bg-white/[0.05] border border-emerald-500/25 dark:border-white/10">
            <Globe size={16} color="#059669" />
            <TextInput
              value={serverIp}
              onChangeText={onChangeIp}
              placeholder="Contoh: 192.168.1.100"
              placeholderTextColor={isDark ? '#9CA3AF' : '#64748B'}
              autoCapitalize="none"
              autoCorrect={false}
              className="flex-1 ml-2.5 text-sm font-mono text-emerald-950 dark:text-emerald-50"
            />
          </View>
        </View>

        <View className="gap-1">
          <Text className="text-xs font-bold text-emerald-900/80 dark:text-emerald-200/80">
            Port MQTT
          </Text>
          <View className="flex-row items-center px-3 py-2.5 rounded-xl bg-white/70 dark:bg-white/[0.05] border border-emerald-500/25 dark:border-white/10">
            <TextInput
              value={serverPort}
              onChangeText={onChangePort}
              placeholder="1883"
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
