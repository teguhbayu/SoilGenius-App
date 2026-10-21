import React from 'react';
import { View, Text, Switch, Pressable } from 'react-native';
import { ShieldCheck, ShieldAlert, Zap, AlertOctagon, Sliders } from 'lucide-react-native';
import { GlassCard } from '@/components/ui/glass-card';
import { ActuatorSystemSettings, ActuatorConfigItem } from '@/types/actuator';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface ActuatorMasterCardProps {
  settings: ActuatorSystemSettings;
  actuators: ActuatorConfigItem[];
  onUpdateSettings: (updates: Partial<ActuatorSystemSettings>) => void;
  onEmergencyStop: () => void;
}

export function ActuatorMasterCard({
  settings,
  actuators,
  onUpdateSettings,
  onEmergencyStop,
}: ActuatorMasterCardProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const runningCount = actuators.filter((a) => a.isActive || a.status === 'running').length;
  const isEmergency = settings.emergencyStop;

  return (
    <GlassCard
      glowColor={isEmergency ? '#EF4444' : '#10B981'}
      borderColor={isEmergency ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.3)'}
      contentClassName="p-4 rounded-[24px] gap-3.5"
    >
      {/* Header section with status pill */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2.5">
          <View
            className={`w-9 h-9 rounded-xl items-center justify-center ${
              isEmergency
                ? 'bg-red-500/15 border border-red-500/30'
                : 'bg-emerald-500/15 border border-emerald-500/30'
            }`}
          >
            {isEmergency ? (
              <ShieldAlert size={18} color="#EF4444" />
            ) : (
              <ShieldCheck size={18} color="#059669" />
            )}
          </View>
          <View>
            <Text className="text-sm font-extrabold text-emerald-950 dark:text-emerald-50">
              Pusat Kendali Otomasi
            </Text>
            <Text className="text-[11px] text-emerald-800/70 dark:text-emerald-300/70">
              {isEmergency
                ? 'Sistem Terkunci (Emergency Stop)'
                : settings.masterAutomationEnabled
                ? 'Otomasi Aktif & Siaga Sensor'
                : 'Otomasi Sensor Disederhanakan'}
            </Text>
          </View>
        </View>

        <View
          className={`px-2.5 py-1 rounded-full border flex-row items-center gap-1.5 ${
            isEmergency
              ? 'bg-red-500/15 border-red-500/30'
              : runningCount > 0
              ? 'bg-amber-500/15 border-amber-500/30'
              : 'bg-emerald-500/15 border-emerald-500/30'
          }`}
        >
          <View
            className={`w-2 h-2 rounded-full ${
              isEmergency
                ? 'bg-red-500'
                : runningCount > 0
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
          />
          <Text
            className={`text-[11px] font-bold ${
              isEmergency
                ? 'text-red-700 dark:text-red-300'
                : runningCount > 0
                ? 'text-amber-700 dark:text-amber-300'
                : 'text-emerald-700 dark:text-emerald-300'
            }`}
          >
            {isEmergency ? 'STOP' : `${runningCount} Aktif`}
          </Text>
        </View>
      </View>

      {/* Control row: Master Switch & Summary */}
      <View className="p-3 rounded-2xl bg-white/60 dark:bg-white/[0.04] border border-black/5 dark:border-white/10 flex-row items-center justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-xs font-bold text-emerald-950 dark:text-emerald-50">
            Master Otomasi Berbasis Sensor
          </Text>
          <Text className="text-[11px] text-emerald-800/70 dark:text-emerald-300/70 mt-0.5">
            Izinkan relay menyala otomatis saat sensor mencapai ambang batas
          </Text>
        </View>
        <Switch
          value={settings.masterAutomationEnabled && !isEmergency}
          disabled={isEmergency}
          onValueChange={(val) =>
            onUpdateSettings({ masterAutomationEnabled: val })
          }
          trackColor={{ false: isDark ? '#374151' : '#D1D5DB', true: '#10B981' }}
          thumbColor="#FFFFFF"
        />
      </View>

      {/* Emergency Stop / Recovery Button */}
      <View className="flex-row gap-2.5 pt-0.5">
        <Pressable
          onPress={onEmergencyStop}
          className={`flex-1 py-3 px-3.5 rounded-2xl flex-row items-center justify-center gap-2 active:opacity-85 ${
            isEmergency ? 'bg-emerald-600' : 'bg-red-600'
          }`}
        >
          {isEmergency ? (
            <>
              <Zap size={16} color="#FFFFFF" />
              <Text className="text-xs font-bold text-white">
                Buka Kunci Sistem (Pulihkan)
              </Text>
            </>
          ) : (
            <>
              <AlertOctagon size={16} color="#FFFFFF" />
              <Text className="text-xs font-bold text-white">
                Emergency Stop (Matikan Semua)
              </Text>
            </>
          )}
        </Pressable>
      </View>
    </GlassCard>
  );
}
