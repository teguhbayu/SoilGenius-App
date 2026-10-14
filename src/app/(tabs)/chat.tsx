import React, { useRef, useEffect } from 'react';
import {
  View,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from '@/components/ui/styled';
import { MeshBackground } from '@/components/ui/mesh-background';
import { useChat } from '@/hooks/use-chat';
import { ChatHeader } from '@/components/chat/chat-header';
import { ChatBubble } from '@/components/chat/chat-bubble';
import { ChatTypingIndicator } from '@/components/chat/chat-typing-indicator';
import { ChatSuggestions } from '@/components/chat/chat-suggestions';
import { ChatInput } from '@/components/chat/chat-input';
import { ChatEmptyState } from '@/components/chat/chat-empty-state';

export default function ChatScreen() {
  const {
    messages,
    isLoading,
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

          <ChatInput onSend={sendMessage} isLoading={isLoading} />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
