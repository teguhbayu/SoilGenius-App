import React from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { ChevronLeft, RotateCcw, Sliders } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface SettingsHeaderProps {
  onReset: () => void;
}

export function SettingsHeader({ onReset }: SettingsHeaderProps) {
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

  const handleResetPress = () => {
    Alert.alert(
      'Reset Konfigurasi',
      'Kembalikan pengaturan Server API ke nilai default?',
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: onReset },
      ]
    );
  };

  return (
    <View className="flex-row items-center justify-between px-4 py-2 border-b border-emerald-500/10 dark:border-white/10">
      <View className="flex-row items-center gap-3">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full border items-center justify-center bg-white/80 dark:bg-white/10 border-emerald-500/20 dark:border-white/15 active:opacity-70"
        >
          <ChevronLeft size={20} color={colors.text} />
        </Pressable>
        <View>
          <Text className="text-xl font-extrabold tracking-tight text-emerald-950 dark:text-emerald-50">
            Konfigurasi
          </Text>
          <Text className="text-xs text-emerald-800/70 dark:text-emerald-300/70">
            Endpoint REST API
          </Text>
        </View>
      </View>

      <Pressable
        onPress={handleResetPress}
        hitSlop={8}
        className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full border bg-white/80 dark:bg-white/10 border-emerald-500/20 dark:border-white/15 active:opacity-70"
      >
        <RotateCcw size={13} color="#059669" />
        <Text className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">
          Default
        </Text>
      </Pressable>
    </View>
  );
}
