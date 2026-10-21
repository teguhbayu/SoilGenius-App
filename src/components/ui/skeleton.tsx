import React, { useEffect, useRef } from "react";
import { Animated, StyleProp, ViewStyle } from "react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

export function Skeleton({
  width,
  height,
  borderRadius = 8,
  style,
  className,
}: SkeletonProps) {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const opacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.8,
          duration: 850,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.35,
          duration: 850,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [opacity]);

  const baseBg = isDark
    ? "rgba(255, 255, 255, 0.09)"
    : "rgba(15, 23, 42, 0.07)";

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height: height as any,
          borderRadius,
          backgroundColor: baseBg,
          opacity,
        },
        style,
      ]}
      className={className}
    />
  );
}
