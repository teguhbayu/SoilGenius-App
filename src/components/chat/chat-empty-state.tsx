import { GlassCard } from '@/components/ui/glass-card';
import { BrainCircuit, Flame, Sprout } from 'lucide-react-native';
import { Text, View } from 'react-native';

const CAPABILITIES = [
  {
    icon: Sprout,
    title: 'Analisis Kesuburan',
    desc: 'Interpretasi data pH, suhu, dan kelembapan secara akurat',
  },
  {
    icon: Flame,
    title: 'Saran Pemupukan',
    desc: 'Rekomendasi takaran NPK, dolomit, dan pupuk organik',
  },
];

export function ChatEmptyState() {
  return (
    <View className="my-2">
      <GlassCard
        glowColor="#10B981"
        borderColor="rgba(16, 185, 129, 0.3)"
        contentClassName="p-4 rounded-[22px] gap-3"
      >
        <View className="flex-row items-center gap-2.5">
          <View className="w-10 h-10 rounded-xl items-center justify-center bg-emerald-500/15 border border-emerald-500/30">
            <BrainCircuit size={20} color="#059669" />
          </View>
          <View className="flex-1">
            <Text className="text-base font-extrabold text-emerald-950 dark:text-emerald-50">
              Konsultasi AI
            </Text>
            <Text className="text-xs text-emerald-800/70 dark:text-emerald-300/70">
              Tanyakan rencana pengelolaan lahan Anda
            </Text>
          </View>
        </View>

        <View className="gap-2 pt-1 border-t border-black/5 dark:border-white/5">
          {CAPABILITIES.map((cap, i) => {
            const Icon = cap.icon;
            return (
              <View
                key={i}
                className="flex-row items-center gap-2.5 p-2 rounded-xl bg-white/60 dark:bg-white/[0.04] border border-black/5 dark:border-white/5"
              >
                <View className="w-7 h-7 rounded-lg items-center justify-center bg-emerald-100 dark:bg-emerald-950/50">
                  <Icon size={14} color="#059669" />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-bold text-emerald-950 dark:text-emerald-50">
                    {cap.title}
                  </Text>
                  <Text className="text-[10px] text-emerald-800/70 dark:text-emerald-300/70">
                    {cap.desc}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </GlassCard>
    </View>
  );
}
