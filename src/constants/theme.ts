import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#0F291E',
    background: '#F4FAF6',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#DCFCE7',
    textSecondary: '#4B6B5B',
    primary: '#059669',
    primaryLight: '#10B981',
    primaryDark: '#064E3B',
    primaryMint: '#A7F3D0',
    primarySubtle: '#ECFDF5',
    card: 'rgba(255, 255, 255, 0.82)',
    cardBorder: 'rgba(255, 255, 255, 0.95)',
    glassOverlay: 'rgba(255, 255, 255, 0.65)',
    glassGreen: 'rgba(16, 185, 129, 0.1)',
    glassBorderGreen: 'rgba(16, 185, 129, 0.22)',
    tint: '#059669',
    tempHot: '#EF4444',
    tempNormal: '#10B981',
    tempCold: '#3B82F6',
    phAcidic: '#F59E0B',
    phNeutral: '#10B981',
    phAlkaline: '#8B5CF6',
    moisture: '#0284C7',
  },
  dark: {
    text: '#F0FDF4',
    background: '#061A12',
    backgroundElement: '#0E281D',
    backgroundSelected: '#163E2D',
    textSecondary: '#86A996',
    primary: '#10B981',
    primaryLight: '#34D399',
    primaryDark: '#047857',
    primaryMint: '#6EE7B7',
    primarySubtle: '#064E3B',
    card: 'rgba(14, 40, 29, 0.85)',
    cardBorder: 'rgba(52, 211, 153, 0.25)',
    glassOverlay: 'rgba(14, 40, 29, 0.7)',
    glassGreen: 'rgba(16, 185, 129, 0.15)',
    glassBorderGreen: 'rgba(52, 211, 153, 0.3)',
    tint: '#34D399',
    tempHot: '#F87171',
    tempNormal: '#34D399',
    tempCold: '#60A5FA',
    phAcidic: '#FBBF24',
    phNeutral: '#34D399',
    phAlkaline: '#A78BFA',
    moisture: '#38BDF8',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
