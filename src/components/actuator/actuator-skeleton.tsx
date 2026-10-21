import React from 'react';
import { View } from 'react-native';
import { GlassCard } from '@/components/ui/glass-card';
import { Skeleton } from '@/components/ui/skeleton';

export function ActuatorScreenSkeleton() {
  return (
    <View className="gap-4">
      {/* Skeleton Master Card */}
      <GlassCard glowColor="#10B981" contentClassName="p-4 rounded-[24px] gap-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2.5 flex-1">
            <Skeleton width={36} height={36} borderRadius={12} />
            <View className="gap-1.5 flex-1">
              <Skeleton width="50%" height={16} borderRadius={5} />
              <Skeleton width="70%" height={11} borderRadius={4} />
            </View>
          </View>
          <Skeleton width={60} height={24} borderRadius={12} />
        </View>
        <Skeleton width="100%" height={56} borderRadius={16} />
        <Skeleton width="100%" height={44} borderRadius={16} />
      </GlassCard>

      {/* Filter Tabs Skeleton */}
      <View className="flex-row gap-2">
        <Skeleton width={70} height={32} borderRadius={16} />
        <Skeleton width={80} height={32} borderRadius={16} />
        <Skeleton width={80} height={32} borderRadius={16} />
        <Skeleton width={90} height={32} borderRadius={16} />
      </View>

      {/* Actuator Cards Skeleton */}
      {[...Array(3)].map((_, i) => (
        <GlassCard
          key={i}
          glowColor="#10B981"
          contentClassName="p-4 rounded-[24px] gap-3"
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3 flex-1">
              <Skeleton width={42} height={42} borderRadius={16} />
              <View className="gap-1.5 flex-1">
                <Skeleton width="60%" height={16} borderRadius={5} />
                <Skeleton width="40%" height={12} borderRadius={4} />
              </View>
            </View>
            <Skeleton width={44} height={26} borderRadius={13} />
          </View>
          <Skeleton width="90%" height={12} borderRadius={4} />
          <Skeleton width="100%" height={38} borderRadius={12} />
          <Skeleton width="100%" height={36} borderRadius={12} />
        </GlassCard>
      ))}
    </View>
  );
}
