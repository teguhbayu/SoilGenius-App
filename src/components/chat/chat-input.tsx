import React, { useState } from 'react';
import {
  View,
  TextInput,
  Pressable,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { ArrowUp, Sparkles } from 'lucide-react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface ChatInputProps {
  onSend: (text: string) => void;
  isLoading: boolean;
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [inputText, setInputText] = useState<string>('');
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

  const canSend = inputText.trim().length > 0 && !isLoading;

  const handleSend = () => {
    if (!canSend) return;
    const textToSend = inputText;
    setInputText('');
    onSend(textToSend);
  };

  return (
    <View className="px-4 pt-1 pb-3">
      <View className="flex-row items-end gap-2 p-1.5 pl-3 rounded-[24px] bg-white/80 dark:bg-white/10 border border-emerald-500/30 dark:border-white/15 shadow-sm">
        <View className="pb-2 pl-0.5">
          <Sparkles size={16} color="#059669" />
        </View>

        <TextInput
          value={inputText}
          onChangeText={setInputText}
          placeholder="Tanya seputar tanah"
          placeholderTextColor={isDark ? '#9CA3AF' : '#64748B'}
          multiline
          maxLength={1000}
          editable={!isLoading}
          className="flex-1 text-sm text-emerald-950 dark:text-emerald-50 max-h-24 pt-2 pb-2 leading-relaxed"
          style={{
            minHeight: Platform.OS === 'ios' ? 36 : 38,
          }}
          onSubmitEditing={handleSend}
        />

        <Pressable
          onPress={handleSend}
          disabled={!canSend}
          className={`w-9 h-9 rounded-full items-center justify-center transition-all ${
            canSend
              ? 'bg-emerald-600 active:bg-emerald-700 shadow-sm shadow-emerald-700/40'
              : 'bg-black/5 dark:bg-white/5 opacity-50'
          }`}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <ArrowUp
              size={18}
              color={canSend ? '#FFFFFF' : isDark ? '#9CA3AF' : '#64748B'}
              strokeWidth={2.5}
            />
          )}
        </Pressable>
      </View>
    </View>
  );
}
