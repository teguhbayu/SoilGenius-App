import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useColorScheme } from '@/hooks/use-color-scheme';

const { width } = Dimensions.get('window');

export function MeshBackground() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={
          isDark
            ? ['#06180F', '#092317', '#04120B']
            : ['#F3FAF5', '#EAF6EF', '#F6FCF8']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View
        style={[
          styles.glowCircle,
          {
            top: -60,
            right: -60,
            width: width * 0.9,
            height: width * 0.9,
          },
        ]}>
        <LinearGradient
          colors={
            isDark
              ? ['rgba(16, 185, 129, 0.28)', 'rgba(5, 150, 105, 0.10)', 'transparent']
              : ['rgba(16, 185, 129, 0.32)', 'rgba(52, 211, 153, 0.14)', 'transparent']
          }
          style={StyleSheet.absoluteFill}
        />
      </View>

      <View
        style={[
          styles.glowCircle,
          {
            top: '30%',
            left: -80,
            width: width * 0.85,
            height: width * 0.85,
          },
        ]}>
        <LinearGradient
          colors={
            isDark
              ? ['rgba(5, 150, 105, 0.22)', 'rgba(4, 120, 87, 0.08)', 'transparent']
              : ['rgba(52, 211, 153, 0.26)', 'rgba(110, 231, 183, 0.10)', 'transparent']
          }
          style={StyleSheet.absoluteFill}
        />
      </View>

      <View
        style={[
          styles.glowCircle,
          {
            bottom: -50,
            right: -40,
            width: width * 0.8,
            height: width * 0.8,
          },
        ]}>
        <LinearGradient
          colors={
            isDark
              ? ['rgba(16, 185, 129, 0.20)', 'transparent']
              : ['rgba(5, 150, 105, 0.25)', 'rgba(52, 211, 153, 0.08)', 'transparent']
          }
          style={StyleSheet.absoluteFill}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  glowCircle: {
    position: 'absolute',
    borderRadius: 9999,
    overflow: 'hidden',
  },
});
