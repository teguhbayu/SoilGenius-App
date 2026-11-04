import React from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, RotateCcw, Save } from 'lucide-react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface ActuatorHeaderProps {
  onReset: () => void;
  onSave: () => void;
  isSaving: boolean;
}

export function ActuatorHeader({ onReset, onSave, isSaving }: ActuatorHeaderProps) {
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  return (
    <View className="px-4 pt-3 pb-3 flex-row items-center justify-between border-b border-black/5 dark:border-white/10 bg-transparent">
      <View className="flex-row items-center gap-2.5 flex-1 min-w-0 mr-2">
        <Pressable
          onPress={handleBack}
          hitSlop={8}
          className="w-10 h-10 rounded-full border items-center justify-center bg-white/80 dark:bg-white/10 border-black/10 dark:border-white/15 active:opacity-70 shrink-0"
        >
          <ChevronLeft size={20} color={colors.text} />
        </Pressable>

        <View className="flex-1 min-w-0">
          <Text
            className="text-base sm:text-lg font-black tracking-tight text-emerald-950 dark:text-emerald-50"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            Aktuator & Otomasi
          </Text>
          <Text
            className="text-[11px] sm:text-xs text-emerald-800/70 dark:text-emerald-300/70"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            Kontrol Relai, Pompa, & Jadwal IoT
          </Text>
        </View>
      </View>

      <View className="flex-row items-center gap-1.5 shrink-0">
        <Pressable
          onPress={onReset}
          hitSlop={6}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border items-center justify-center bg-white/80 dark:bg-white/10 border-black/10 dark:border-white/15 active:opacity-70"
        >
          <RotateCcw size={15} color={colors.text} />
        </Pressable>

        <Pressable
          onPress={onSave}
          disabled={isSaving}
          hitSlop={6}
          className="px-3 h-9 sm:h-10 rounded-full bg-emerald-600 dark:bg-emerald-500 items-center justify-center flex-row gap-1.5 active:opacity-80 shadow-sm"
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Save size={14} color="#FFFFFF" />
              <Text className="text-xs font-bold text-white">Simpan</Text>
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}
