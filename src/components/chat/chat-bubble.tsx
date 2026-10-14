import React from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { Bot, User } from 'lucide-react-native';
import { ChatMessage } from '@/types/chat';
import { GlassCard } from '@/components/ui/glass-card';

interface ChatBubbleProps {
  message: ChatMessage;
  onDelete?: (id: string) => void;
}

export function ChatBubble({ message, onDelete }: ChatBubbleProps) {
  const isUser = message.role === 'user';

  const timeString = new Date(message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleLongPress = () => {
    if (!onDelete) return;
    Alert.alert(
      'Hapus Pesan',
      'Apakah Anda ingin menghapus pesan ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => onDelete(message.id),
        },
      ]
    );
  };

  if (isUser) {
    return (
      <Pressable
        onLongPress={handleLongPress}
        className="self-end max-w-[82%] mb-3 active:opacity-90"
      >
        <View className="bg-emerald-600 dark:bg-emerald-600 rounded-[20px] rounded-tr-[4px] px-4 py-3 shadow-sm shadow-emerald-900/10 border border-emerald-500/40">
          <Text
            selectable
            className="text-white text-sm leading-relaxed font-normal"
          >
            {message.content}
          </Text>
          <View className="flex-row justify-end items-center mt-1.5 gap-1">
            <Text className="text-[10px] text-emerald-100/75 font-medium">
              {timeString}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      onLongPress={handleLongPress}
      className="self-start max-w-[88%] mb-3 active:opacity-95"
    >
      <GlassCard
        glowColor="#10B981"
        borderColor="rgba(16, 185, 129, 0.25)"
        contentClassName="p-3.5 rounded-[20px] rounded-tl-[4px] gap-2"
      >
        <View className="flex-row items-center justify-between gap-2 border-b border-black/5 dark:border-white/5 pb-1.5">
          <View className="flex-row items-center gap-1.5">
            <View className="w-5 h-5 rounded-md items-center justify-center bg-emerald-100 dark:bg-emerald-950/60">
              <Bot size={13} color="#059669" />
            </View>
            <Text className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
              SoilGenius AI
            </Text>
          </View>
          <Text className="text-[10px] text-emerald-900/50 dark:text-emerald-300/50">
            {timeString}
          </Text>
        </View>

        <Text
          selectable
          className="text-emerald-950 dark:text-emerald-50 text-sm leading-relaxed"
        >
          {message.content}
        </Text>
      </GlassCard>
    </Pressable>
  );
}
