import React, { useRef, useEffect } from 'react';
import {
  View,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from '@/components/ui/styled';
import { MeshBackground } from '@/components/ui/mesh-background';
import { Skeleton } from '@/components/ui/skeleton';
import { useChat } from '@/hooks/use-chat';
import { ChatHeader } from '@/components/chat/chat-header';
import { ChatBubble } from '@/components/chat/chat-bubble';
import { ChatTypingIndicator } from '@/components/chat/chat-typing-indicator';
import { ChatSuggestions } from '@/components/chat/chat-suggestions';
import { ChatInput } from '@/components/chat/chat-input';
import { ChatEmptyState } from '@/components/chat/chat-empty-state';

function ChatScreenSkeleton() {
  return (
    <View className="px-4 pt-4 gap-4 flex-1">
      <View className="flex-row items-start gap-2.5 max-w-[85%]">
        <Skeleton width={32} height={32} borderRadius={16} />
        <View className="p-3.5 rounded-2xl bg-white/70 dark:bg-white/[0.04] border border-black/5 dark:border-white/5 gap-2 flex-1">
          <Skeleton width="100%" height={12} borderRadius={4} />
          <Skeleton width="90%" height={12} borderRadius={4} />
          <Skeleton width="60%" height={12} borderRadius={4} />
        </View>
      </View>

      <View className="flex-row items-start gap-2.5 max-w-[80%] self-end">
        <View className="p-3.5 rounded-2xl bg-emerald-600/20 border border-emerald-500/20 gap-2 flex-1">
          <Skeleton width="100%" height={12} borderRadius={4} />
          <Skeleton width="75%" height={12} borderRadius={4} />
        </View>
      </View>

      <View className="flex-row items-start gap-2.5 max-w-[85%]">
        <Skeleton width={32} height={32} borderRadius={16} />
        <View className="p-3.5 rounded-2xl bg-white/70 dark:bg-white/[0.04] border border-black/5 dark:border-white/5 gap-2 flex-1">
          <Skeleton width="100%" height={12} borderRadius={4} />
          <Skeleton width="95%" height={12} borderRadius={4} />
          <Skeleton width="80%" height={12} borderRadius={4} />
        </View>
      </View>
    </View>
  );
}

export default function ChatScreen() {
  const {
    messages,
    isLoading,
    isReady,
    sendMessage,
    clearHistory,
    deleteMessage,
  } = useChat();

  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 150);

    return () => clearTimeout(timeout);
  }, [messages, isLoading]);

  return (
    <View className="flex-1">
      <MeshBackground />

      <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex-1 max-w-[500px] self-center w-full"
        >
          <ChatHeader
            onClear={clearHistory}
            messageCount={messages.length}
          />

          {!isReady ? (
            <ChatScreenSkeleton />
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <ChatBubble message={item} onDelete={deleteMessage} />
              )}
              contentContainerClassName="px-4 pt-3 pb-4"
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={
                <View className="mb-3">
                  {messages.length <= 1 && <ChatEmptyState />}
                  <ChatSuggestions onSelect={sendMessage} />
                </View>
              }
              ListFooterComponent={
                isLoading ? <ChatTypingIndicator /> : null
              }
            />
          )}

          <ChatInput onSend={sendMessage} isLoading={isLoading} />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
