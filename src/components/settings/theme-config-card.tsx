import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Palette, Sun, Moon, Monitor } from 'lucide-react-native';
import { GlassCard } from '@/components/ui/glass-card';
import { ThemeMode } from '@/hooks/use-theme-mode';

interface ThemeConfigCardProps {
  currentMode: ThemeMode;
  onSelectMode: (mode: ThemeMode) => void;
}

const THEME_OPTIONS: {
  id: ThemeMode;
  label: string;
  desc: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
}[] = [
  {
    id: 'light',
    label: 'Terang',
    desc: 'Mode cerah',
    icon: Sun,
  },
  {
    id: 'dark',
    label: 'Gelap',
    desc: 'Mode redup',
    icon: Moon,
  },
  {
    id: 'system',
    label: 'Sistem',
    desc: 'Ikuti perangkat',
    icon: Monitor,
  },
];

export function ThemeConfigCard({
  currentMode,
  onSelectMode,
}: ThemeConfigCardProps) {
  return (
    <GlassCard
      glowColor="#10B981"
      borderColor="rgba(16, 185, 129, 0.25)"
      contentClassName="p-4 rounded-[22px] gap-3"
    >
      <View className="flex-row items-center gap-2.5">
        <View className="w-9 h-9 rounded-xl items-center justify-center bg-emerald-500/15 border border-emerald-500/30">
          <Palette size={18} color="#059669" />
        </View>
        <View className="flex-1">
          <Text className="text-sm font-extrabold text-emerald-950 dark:text-emerald-50">
            Mode Tampilan
          </Text>
          <Text className="text-[11px] text-emerald-800/70 dark:text-emerald-300/70">
            Pilih tema terang, gelap, atau otomatis sistem
          </Text>
        </View>
      </View>

      <View className="flex-row gap-2 pt-1">
        {THEME_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const isActive = currentMode === opt.id;

          return (
            <Pressable
              key={opt.id}
              onPress={() => onSelectMode(opt.id)}
              className={`flex-1 py-3 px-2 rounded-xl border items-center justify-center gap-1.5 transition-all active:scale-[0.97] ${
                isActive
                  ? 'bg-emerald-600 border-emerald-500 shadow-sm shadow-emerald-700/30'
                  : 'bg-white/60 dark:bg-white/[0.04] border-black/5 dark:border-white/10'
              }`}
            >
              <Icon
                size={18}
                color={isActive ? '#FFFFFF' : '#059669'}
              />
              <Text
                className={`text-xs font-bold ${
                  isActive
                    ? 'text-white'
                    : 'text-emerald-950 dark:text-emerald-50'
                }`}
              >
                {opt.label}
              </Text>
              <Text
                className={`text-[10px] ${
                  isActive
                    ? 'text-emerald-100/80'
                    : 'text-emerald-900/60 dark:text-emerald-300/60'
                }`}
              >
                {opt.desc}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </GlassCard>
  );
}
