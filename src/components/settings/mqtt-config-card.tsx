import { GlassCard } from "@/components/ui/glass-card";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Layers, Radio } from "lucide-react-native";
import { Text, TextInput, View } from "react-native";

interface MqttConfigCardProps {
  channel: string;
  onChangeChannel: (channel: string) => void;
}

export function MqttConfigCard({
  channel,
  onChangeChannel,
}: MqttConfigCardProps) {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  return (
    <GlassCard
      glowColor="#10B981"
      borderColor="rgba(16, 185, 129, 0.25)"
      contentClassName="p-4 rounded-[22px] gap-3"
    >
      <View className="flex-row items-center gap-2.5">
        <View className="w-9 h-9 rounded-xl items-center justify-center bg-emerald-500/15 border border-emerald-500/30">
          <Layers size={18} color="#059669" />
        </View>
        <View className="flex-1">
          <Text className="text-sm font-extrabold text-emerald-950 dark:text-emerald-50">
            MQTT Channel / Topik
          </Text>
          <Text className="text-[11px] text-emerald-800/70 dark:text-emerald-300/70">
            Kanal subskripsi data sensor tanah
          </Text>
        </View>
      </View>

      <View className="gap-2.5">
        <View className="gap-1">
          <Text className="text-xs font-bold text-emerald-900/80 dark:text-emerald-200/80">
            Topik Subskripsi
          </Text>
          <View className="flex-row items-center px-3 py-2.5 rounded-xl bg-white/70 dark:bg-white/[0.05] border border-emerald-500/25 dark:border-white/10">
            <Radio size={16} color="#059669" />
            <TextInput
              value={channel}
              onChangeText={onChangeChannel}
              placeholder="soilgenius/sensor/data"
              placeholderTextColor={isDark ? "#9CA3AF" : "#64748B"}
              autoCapitalize="none"
              autoCorrect={false}
              className="flex-1 ml-2.5 text-sm font-mono text-emerald-950 dark:text-emerald-50"
            />
          </View>
        </View>
      </View>
    </GlassCard>
  );
}
