import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { Bot, Sparkles } from 'lucide-react-native';
import { GlassCard } from '@/components/ui/glass-card';

export function ChatTypingIndicator() {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const createDotAnimation = (anim: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0.3,
            duration: 350,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const anim1 = createDotAnimation(dot1, 0);
    const anim2 = createDotAnimation(dot2, 180);
    const anim3 = createDotAnimation(dot3, 360);

    anim1.start();
    anim2.start();
    anim3.start();

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  }, [dot1, dot2, dot3]);

  return (
    <View className="self-start max-w-[80%] mb-3">
      <GlassCard
        glowColor="#10B981"
        borderColor="rgba(16, 185, 129, 0.25)"
        contentClassName="p-3 rounded-[18px] rounded-tl-[4px] flex-row items-center gap-2.5"
      >
        <View className="w-5 h-5 rounded-md items-center justify-center bg-emerald-100 dark:bg-emerald-950/60">
          <Bot size={13} color="#059669" />
        </View>

        <View className="flex-row items-center gap-1.5 py-1 px-1">
          <Animated.View
            style={{ opacity: dot1, transform: [{ scale: dot1 }] }}
            className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400"
          />
          <Animated.View
            style={{ opacity: dot2, transform: [{ scale: dot2 }] }}
            className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400"
          />
          <Animated.View
            style={{ opacity: dot3, transform: [{ scale: dot3 }] }}
            className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400"
          />
        </View>

        <Text className="text-xs text-emerald-800/70 dark:text-emerald-300/70 font-medium ml-1">
          Mengetik...
        </Text>
      </GlassCard>
    </View>
  );
}
