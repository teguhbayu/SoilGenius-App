import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { Sparkles, Sprout, FlaskConical, Droplets } from 'lucide-react-native';
import { ChatSuggestion } from '@/types/chat';

interface ChatSuggestionsProps {
  onSelect: (prompt: string) => void;
}

const SUGGESTIONS: (ChatSuggestion & { icon: React.ComponentType<{ size?: number; color?: string }> })[] = [
  {
    id: 'sug_1',
    label: 'Cara Menaikkan pH',
    prompt: 'Bagaimana cara menaikkan pH tanah yang terlalu asam secara efektif?',
    icon: FlaskConical,
  },
  {
    id: 'sug_2',
    label: 'Rekomendasi Pupuk',
    prompt: 'Apa rekomendasi pupuk organik dan anorganik terbaik untuk fase awal tanam cabai?',
    icon: Sprout,
  },
  {
    id: 'sug_3',
    label: 'Atur Kelembapan',
    prompt: 'Bagaimana cara mengatasi kelembapan tanah yang terlalu tinggi agar akar tidak busuk?',
    icon: Droplets,
  },
  {
    id: 'sug_4',
    label: 'Gemburkan Tanah',
    prompt: 'Metode apa yang paling aman untuk menggemburkan tanah padat di sekitar perakaran?',
    icon: Sparkles,
  },
];

export function ChatSuggestions({ onSelect }: ChatSuggestionsProps) {
  return (
    <View className="py-2">
      <View className="flex-row items-center gap-1.5 px-1 mb-2">
        <Sparkles size={13} color="#059669" />
        <Text className="text-[11px] font-bold text-emerald-800/80 dark:text-emerald-300/80">
          Saran Pertanyaan:
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-2 px-1"
      >
        {SUGGESTIONS.map((item) => {
          const Icon = item.icon;
          return (
            <Pressable
              key={item.id}
              onPress={() => onSelect(item.prompt)}
              className="flex-row items-center gap-1.5 px-3 py-2 rounded-xl bg-white/70 dark:bg-white/10 border border-emerald-500/25 dark:border-white/10 active:opacity-70 shadow-xs"
            >
              <Icon size={13} color="#059669" />
              <Text className="text-xs font-semibold text-emerald-950 dark:text-emerald-50">
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
