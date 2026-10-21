import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChatMessage } from '@/types/chat';
import { requestLlmCompletion } from '@/services/llm';
import { useSettings } from '@/hooks/use-settings';
import { useToast } from '@/hooks/use-toast';

const STORAGE_KEY = '@soilgenius_chat_logs_v1';

const INITIAL_WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome_initial_001',
  role: 'assistant',
  content:
    'Halo! Saya asisten agronomi cerdas SoilGenius. Saya siap membantu Anda menganalisis kondisi tanah lahan, rekomendasi tanaman, dosis pemupukan, dan teknik perawatan tanah. Ada yang ingin Anda tanyakan seputar lahan atau tanaman Anda hari ini?',
  createdAt: Date.now(),
};

export function useChat(options?: { ip?: string; port?: string }) {
  const { config } = useSettings();
  const toast = useToast();
  const ip = options?.ip ?? config.apiServerIp;
  const port = options?.port ?? config.apiServerPort;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);

  const persistMessages = useCallback(async (newMessages: ChatMessage[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newMessages));
    } catch {
      return;
    }
  }, []);

  useEffect(() => {
    async function loadChatLogs() {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed: ChatMessage[] = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed);
            setIsReady(true);
            return;
          }
        }
      } catch {
        return;
      }
      setMessages([INITIAL_WELCOME_MESSAGE]);
      await persistMessages([INITIAL_WELCOME_MESSAGE]);
      setIsReady(true);
    }

    loadChatLogs();
  }, [persistMessages]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      const userMessage: ChatMessage = {
        id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        role: 'user',
        content: trimmed,
        createdAt: Date.now(),
      };

      const updatedHistory = [...messages, userMessage];
      setMessages(updatedHistory);
      await persistMessages(updatedHistory);
      setIsLoading(true);

      try {
        const response = await requestLlmCompletion({
          history: updatedHistory,
          message: trimmed,
          ip,
          port,
        });

        const assistantMessage: ChatMessage = {
          id: `assistant_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          role: 'assistant',
          content: response.content,
          createdAt: Date.now(),
        };

        const finalHistory = [...updatedHistory, assistantMessage];
        setMessages(finalHistory);
        await persistMessages(finalHistory);
      } catch (err: any) {
        console.error('Chat error:', err);
        toast.error(err?.message || 'Gagal menghubungi asisten AI');

        const errorMessage: ChatMessage = {
          id: `assistant_err_${Date.now()}`,
          role: 'assistant',
          content:
            err?.message
              ? `Maaf, terjadi kendala: ${err.message}. Pastikan server aktif atau periksa alamat IP server di menu Pengaturan.`
              : 'Maaf, terjadi kendala saat memproses jawaban. Silakan periksa koneksi atau coba lagi nanti.',
          createdAt: Date.now(),
        };
        const finalHistory = [...updatedHistory, errorMessage];
        setMessages(finalHistory);
        await persistMessages(finalHistory);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading, persistMessages, ip, port, toast]
  );

  const clearHistory = useCallback(async () => {
    const reset = [INITIAL_WELCOME_MESSAGE];
    setMessages(reset);
    await persistMessages(reset);
    toast.info('Riwayat percakapan telah dibersihkan');
  }, [persistMessages, toast]);

  const deleteMessage = useCallback(
    async (id: string) => {
      const filtered = messages.filter((msg) => msg.id !== id);
      const toSave = filtered.length > 0 ? filtered : [INITIAL_WELCOME_MESSAGE];
      setMessages(toSave);
      await persistMessages(toSave);
    },
    [messages, persistMessages]
  );

  return {
    messages,
    isLoading,
    isReady,
    sendMessage,
    clearHistory,
    deleteMessage,
  };
}
