import React from 'react';
import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import { Pressable, useColorScheme, View, StyleSheet, Text } from 'react-native';
import { LayoutDashboard, Camera, Settings, Leaf, MessageSquare, SlidersHorizontal } from 'lucide-react-native';

import { Colors, MaxContentWidth, Spacing } from '@/constants/theme';

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="index" href="/" asChild>
            <TabButton icon={LayoutDashboard}>Dashboard</TabButton>
          </TabTrigger>
          <TabTrigger name="camera" href="/camera" asChild>
            <TabButton icon={Camera}>Kamera</TabButton>
          </TabTrigger>
          <TabTrigger name="chat" href="/chat" asChild>
            <TabButton icon={MessageSquare}>Chat AI</TabButton>
          </TabTrigger>
          <TabTrigger name="actuator" href="/actuator" asChild>
            <TabButton icon={SlidersHorizontal}>Aktuator</TabButton>
          </TabTrigger>
          <TabTrigger name="settings" href="/settings" asChild>
            <TabButton icon={Settings}>Pengaturan</TabButton>
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

interface TabButtonProps extends TabTriggerSlotProps {
  icon?: React.ComponentType<{ size?: number; color?: string }>;
}

export function TabButton({
  children,
  isFocused,
  icon: IconComponent,
  ...props
}: TabButtonProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

  const activeColor = colors.primary;
  const inactiveColor = colors.textSecondary;

  return (
    <Pressable {...props} style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}>
      <View
        style={[
          styles.tabButtonView,
          isFocused && {
            backgroundColor: isDark ? 'rgba(16, 185, 129, 0.22)' : 'rgba(16, 185, 129, 0.12)',
            borderColor: isDark ? 'rgba(52, 211, 153, 0.4)' : 'rgba(16, 185, 129, 0.25)',
          },
        ]}>
        {IconComponent && (
          <IconComponent
            size={18}
            color={isFocused ? activeColor : inactiveColor}
          />
        )}
        <Text
          style={[
            styles.tabText,
            {
              color: isFocused ? activeColor : inactiveColor,
              fontWeight: isFocused ? '700' : '500',
            },
          ]}>
          {children}
        </Text>
      </View>
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

  return (
    <View {...props} style={styles.tabListContainer}>
      <View
        style={[
          styles.innerContainer,
          {
            backgroundColor: isDark ? 'rgba(14, 40, 29, 0.88)' : 'rgba(255, 255, 255, 0.88)',
            borderColor: isDark ? 'rgba(52, 211, 153, 0.25)' : 'rgba(255, 255, 255, 0.95)',
          },
          {
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          } as any,
        ]}>
        <View style={styles.brandContainer}>
          <View style={[styles.brandIconBg, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : '#ECFDF5' }]}>
            <Leaf size={16} color={colors.primary} />
          </View>
          <Text style={[styles.brandText, { color: colors.text }]}>
            Agri<Text style={{ color: colors.primary }}>Node</Text>
          </Text>
        </View>

        <View style={styles.navItems}>
          {props.children}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabListContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: Spacing.four,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    zIndex: 99,
  },
  innerContainer: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: 30,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexGrow: 1,
    gap: Spacing.three,
    maxWidth: 620,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginRight: Spacing.two,
  },
  brandIconBg: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  navItems: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  pressable: {
    borderRadius: 20,
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.97 }],
  },
  tabButtonView: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabText: {
    fontSize: 13,
  },
});
