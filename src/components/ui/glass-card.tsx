import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { LinearGradient } from '@/components/ui/styled';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { StyleProp, ViewStyle } from 'react-native';

import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';

interface GlassCardProps extends ViewProps {
  children?: React.ReactNode;
  variant?: 'default' | 'tinted' | 'danger' | 'warning' | 'info';
  borderColor?: string;
  glowColor?: string;
  glowOpacity?: number;
  className?: string;
  contentClassName?: string;
  contentStyle?: StyleProp<ViewStyle>;
}

function toRgba(color: string, opacity: number): string {
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    if (hex.length === 3) {
      const r = parseInt(hex[0] + hex[0], 16);
      const g = parseInt(hex[1] + hex[1], 16);
      const b = parseInt(hex[2] + hex[2], 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    if (hex.length === 6) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
  }
  if (color.startsWith('rgba')) {
    return color.replace(/[\d\.]+\)$/, `${opacity})`);
  }
  if (color.startsWith('rgb')) {
    return color.replace('rgb', 'rgba').replace(')', `, ${opacity})`);
  }
  return color;
}

export function GlassCard({
  children,
  style,
  className,
  contentClassName,
  variant = 'default',
  borderColor,
  glowColor,
  glowOpacity,
  contentStyle,
  ...rest
}: GlassCardProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const gradientId = React.useId().replace(/:/g, '_');

  const resolveGlowColor = () => {
    if (glowColor) return glowColor;
    if (variant === 'danger') return '#EF4444';
    if (variant === 'warning') return '#F59E0B';
    if (variant === 'info') return '#3B82F6';
    if (variant === 'tinted') return '#10B981';
    if (borderColor) return borderColor;
    return '#10B981';
  };

  const rawGlow = resolveGlowColor();

  const getGradientColors = (): readonly [string, string, ...string[]] => {
    if (isDark) {
      if (variant === 'tinted') return ['rgba(16, 185, 129, 0.22)', 'rgba(6, 78, 59, 0.4)'];
      if (variant === 'danger') return ['rgba(239, 68, 68, 0.2)', 'rgba(127, 29, 29, 0.4)'];
      if (variant === 'warning') return ['rgba(245, 158, 11, 0.2)', 'rgba(120, 53, 15, 0.4)'];
      if (variant === 'info') return ['rgba(59, 130, 246, 0.2)', 'rgba(30, 58, 138, 0.4)'];
      return ['rgba(15, 42, 31, 0.82)', 'rgba(6, 21, 15, 0.88)'];
    }

    if (variant === 'tinted') return ['rgba(255, 255, 255, 0.92)', 'rgba(209, 250, 229, 0.75)'];
    if (variant === 'danger') return ['rgba(255, 255, 255, 0.92)', 'rgba(254, 226, 226, 0.75)'];
    if (variant === 'warning') return ['rgba(255, 255, 255, 0.92)', 'rgba(254, 243, 199, 0.75)'];
    if (variant === 'info') return ['rgba(255, 255, 255, 0.92)', 'rgba(224, 242, 254, 0.75)'];
    return ['rgba(255, 255, 255, 0.88)', 'rgba(255, 255, 255, 0.58)'];
  };

  const getBorderColor = () => {
    if (borderColor) return borderColor;

    if (isDark) {
      if (variant === 'tinted') return 'rgba(52, 211, 153, 0.35)';
      if (variant === 'danger') return 'rgba(248, 113, 113, 0.35)';
      if (variant === 'warning') return 'rgba(251, 191, 36, 0.35)';
      if (variant === 'info') return 'rgba(96, 165, 250, 0.35)';
      return 'rgba(52, 211, 153, 0.22)';
    }

    if (variant === 'tinted') return 'rgba(16, 185, 129, 0.3)';
    if (variant === 'danger') return 'rgba(239, 68, 68, 0.3)';
    if (variant === 'warning') return 'rgba(245, 158, 11, 0.3)';
    if (variant === 'info') return 'rgba(59, 130, 246, 0.3)';
    return 'rgba(255, 255, 255, 0.65)';
  };

  return (
    <View
      className={`rounded-[22px] relative ${className ?? ''}`}
      style={style}
      {...rest}>
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: -32,
          left: -32,
          right: -32,
          bottom: -32,
        }}>
        <Svg width="100%" height="100%">
          <Defs>
            <RadialGradient
              id={`glow-${gradientId}`}
              cx="50%"
              cy="50%"
              rx="50%"
              ry="50%"
              fx="50%"
              fy="50%">
              <Stop
                offset="0%"
                stopColor={rawGlow}
                stopOpacity={isDark ? (glowOpacity ? glowOpacity * 0.25 : 0.14) : (glowOpacity ? glowOpacity * 0.2 : 0.10)}
              />
              <Stop
                offset="40%"
                stopColor={rawGlow}
                stopOpacity={isDark ? (glowOpacity ? glowOpacity * 0.12 : 0.07) : (glowOpacity ? glowOpacity * 0.1 : 0.05)}
              />
              <Stop
                offset="75%"
                stopColor={rawGlow}
                stopOpacity={isDark ? (glowOpacity ? glowOpacity * 0.04 : 0.02) : (glowOpacity ? glowOpacity * 0.03 : 0.015)}
              />
              <Stop offset="100%" stopColor={rawGlow} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            rx={45}
            fill={`url(#glow-${gradientId})`}
          />
        </Svg>
      </View>
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius: 22,
            boxShadow: [
              {
                offsetX: 0,
                offsetY: 0,
                blurRadius: 16,
                spreadDistance: 1,
                color: toRgba(rawGlow, isDark ? 0.18 : 0.12),
              },
              {
                offsetX: 0,
                offsetY: 0,
                blurRadius: 36,
                spreadDistance: 3,
                color: toRgba(rawGlow, isDark ? 0.10 : 0.06),
              },
              {
                offsetX: 0,
                offsetY: 0,
                blurRadius: 64,
                spreadDistance: 6,
                color: toRgba(rawGlow, isDark ? 0.05 : 0.025),
              },
            ] as any,
          },
        ]}
      />
      <LinearGradient
        colors={getGradientColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className={`rounded-[20px] border-[1.5px] p-3.5 overflow-hidden relative ${contentClassName ?? ''}`}
        style={[
          {
            borderColor: getBorderColor(),
          },
          contentStyle,
        ]}>
        <LinearGradient
          pointerEvents="none"
          colors={[toRgba(rawGlow, isDark ? 0.12 : 0.07), 'transparent']}
          start={{ x: 1, y: 0 }}
          end={{ x: 0.2, y: 0.8 }}
          style={[StyleSheet.absoluteFill, { borderRadius: 20 }]}
        />
        <LinearGradient
          pointerEvents="none"
          colors={[
            'transparent',
            isDark ? 'rgba(255, 255, 255, 0.45)' : 'rgba(255, 255, 255, 0.95)',
            'transparent',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            position: 'absolute',
            top: 0,
            left: 12,
            right: 12,
            height: 1.5,
          }}
        />
        {children}
      </LinearGradient>
    </View>
  );
}
