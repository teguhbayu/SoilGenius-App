import React, { useState } from 'react';
import {
  View,
  Text,
  Switch,
  Pressable,
  TextInput,
} from 'react-native';
import {
  Droplets,
  Sprout,
  FlaskConical,
  Wind,
  CloudRain,
  Play,
  Clock,
  Gauge,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Cpu,
  Radio,
} from 'lucide-react-native';
import { GlassCard } from '@/components/ui/glass-card';
import { ActuatorConfigItem, ActuatorMode } from '@/types/actuator';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface ActuatorCardProps {
  actuator: ActuatorConfigItem;
  isEmergencyLocked: boolean;
  onToggleActive: (id: string) => void;
  onUpdate: (id: string, updates: Partial<ActuatorConfigItem>) => void;
  onTestPulse: (id: string) => void;
}

function getActuatorIcon(type: ActuatorConfigItem['type']) {
  switch (type) {
    case 'water_pump':
      return <Droplets size={18} color="#0284C7" />;
    case 'fertilizer_pump':
      return <Sprout size={18} color="#059669" />;
    case 'ph_doser':
      return <FlaskConical size={18} color="#8B5CF6" />;
    case 'cooling_fan':
      return <Wind size={18} color="#D97706" />;
    case 'mist_sprayer':
      return <CloudRain size={18} color="#06B6D4" />;
  }
}

function getActuatorColor(type: ActuatorConfigItem['type']) {
  switch (type) {
    case 'water_pump':
      return {
        glow: '#0284C7',
        bg: 'bg-sky-500/15',
        border: 'border-sky-500/30',
        text: 'text-sky-700 dark:text-sky-300',
      };
    case 'fertilizer_pump':
      return {
        glow: '#059669',
        bg: 'bg-emerald-500/15',
        border: 'border-emerald-500/30',
        text: 'text-emerald-700 dark:text-emerald-300',
      };
    case 'ph_doser':
      return {
        glow: '#8B5CF6',
        bg: 'bg-purple-500/15',
        border: 'border-purple-500/30',
        text: 'text-purple-700 dark:text-purple-300',
      };
    case 'cooling_fan':
      return {
        glow: '#D97706',
        bg: 'bg-amber-500/15',
        border: 'border-amber-500/30',
        text: 'text-amber-700 dark:text-amber-300',
      };
    case 'mist_sprayer':
      return {
        glow: '#06B6D4',
        bg: 'bg-cyan-500/15',
        border: 'border-cyan-500/30',
        text: 'text-cyan-700 dark:text-cyan-300',
      };
  }
}

export function ActuatorCard({
  actuator,
  isEmergencyLocked,
  onToggleActive,
  onUpdate,
  onTestPulse,
}: ActuatorCardProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const colors = getActuatorColor(actuator.type);
  const isRunning = actuator.isActive || actuator.status === 'running';

  const modes: { label: string; mode: ActuatorMode }[] = [
    { label: 'Otomatis', mode: 'auto' },
    { label: 'Jadwal', mode: 'schedule' },
    { label: 'Manual', mode: 'manual' },
  ];

  return (
    <GlassCard
      glowColor={isRunning ? colors.glow : '#10B981'}
      borderColor={
        isRunning
          ? 'rgba(16, 185, 129, 0.45)'
          : isDark
          ? 'rgba(255, 255, 255, 0.1)'
          : 'rgba(16, 185, 129, 0.2)'
      }
      contentClassName="p-4 rounded-[24px] gap-3"
    >
      {/* Top Header: Icon, Name, Pin, Active Switch */}
      <View className="flex-row items-start justify-between">
        <View className="flex-row items-center gap-3 flex-1 pr-2">
          <View
            className={`w-11 h-11 rounded-2xl items-center justify-center ${colors.bg} ${colors.border} border`}
          >
            {getActuatorIcon(actuator.type)}
          </View>

          <View className="flex-1">
            <View className="flex-row items-center gap-2">
              <Text className="text-sm font-extrabold text-emerald-950 dark:text-emerald-50">
                {actuator.name}
              </Text>
              {isRunning && (
                <View className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40">
                  <Text className="text-[10px] font-black text-emerald-700 dark:text-emerald-300">
                    AKTIF
                  </Text>
                </View>
              )}
            </View>

            <View className="flex-row flex-wrap items-center gap-1.5 mt-1">
              <View className="flex-row items-center gap-1 px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/[0.06]">
                <Cpu size={10} color={isDark ? '#9CA3AF' : '#6B7280'} />
                <Text className="text-[10px] font-medium text-gray-600 dark:text-gray-300">
                  {actuator.gpioPin}
                </Text>
              </View>

              <View className="flex-row items-center gap-1 px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/[0.06]">
                <Radio size={10} color={isDark ? '#9CA3AF' : '#6B7280'} />
                <Text className="text-[10px] font-mono text-gray-600 dark:text-gray-300">
                  {actuator.mqttTopic.split('/').pop()}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Live Power Toggle */}
        <View className="items-end gap-1">
          <Switch
            value={isRunning}
            disabled={isEmergencyLocked}
            onValueChange={() => onToggleActive(actuator.id)}
            trackColor={{ false: isDark ? '#374151' : '#D1D5DB', true: '#10B981' }}
            thumbColor="#FFFFFF"
          />
          <Text className="text-[10px] font-bold text-gray-500 dark:text-gray-400">
            {isRunning ? 'ON' : 'OFF'}
          </Text>
        </View>
      </View>

      {/* Description */}
      <Text className="text-[11px] leading-relaxed text-gray-600 dark:text-gray-300">
        {actuator.description}
      </Text>

      {/* Mode Selector Segmented Tabs */}
      <View className="flex-row p-1 rounded-xl bg-black/5 dark:bg-white/[0.06] border border-black/5 dark:border-white/10">
        {modes.map((item) => {
          const isSelected = actuator.mode === item.mode;
          return (
            <Pressable
              key={item.mode}
              onPress={() => onUpdate(actuator.id, { mode: item.mode })}
              className={`flex-1 py-1.5 rounded-lg items-center justify-center ${
                isSelected
                  ? 'bg-white dark:bg-emerald-600 shadow-sm'
                  : 'bg-transparent'
              }`}
            >
              <Text
                className={`text-xs font-bold ${
                  isSelected
                    ? isDark
                      ? 'text-white'
                      : 'text-emerald-950'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Mode Summary Indicator */}
      <View className="p-2.5 rounded-xl bg-emerald-500/[0.07] border border-emerald-500/20 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2 flex-1">
          <SlidersHorizontal size={14} color="#059669" />
          <Text className="text-[11px] font-semibold text-emerald-900 dark:text-emerald-200">
            {actuator.mode === 'auto' &&
              (actuator.triggerThresholdMin !== undefined
                ? `Pemicu: < ${actuator.triggerThresholdMin}% Kelembapan`
                : actuator.triggerThresholdMax !== undefined
                ? `Pemicu: > ${actuator.triggerThresholdMax}°C Suhu`
                : 'Pemicu: Ambang Batas Sensor')}
            {actuator.mode === 'schedule' &&
              `Jadwal: ${actuator.scheduleTime || '06:00'} (Setiap ${
                actuator.scheduleDaysInterval || 1
              } hari)`}
            {actuator.mode === 'manual' && 'Mode Manual (Dipicu Sakelar)'}
          </Text>
        </View>

        <Pressable
          onPress={() => setIsExpanded((prev) => !prev)}
          hitSlop={8}
          className="flex-row items-center gap-1 pl-2"
        >
          <Text className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
            {isExpanded ? 'Tutup' : 'Atur'}
          </Text>
          {isExpanded ? (
            <ChevronUp size={14} color="#059669" />
          ) : (
            <ChevronDown size={14} color="#059669" />
          )}
        </Pressable>
      </View>

      {/* Expandable Parameters Settings */}
      {isExpanded && (
        <View className="gap-3 pt-2 border-t border-black/5 dark:border-white/10">
          {actuator.mode === 'auto' && (
            <View className="gap-2.5">
              <Text className="text-xs font-bold text-emerald-950 dark:text-emerald-100">
                Parameter Pemicu Otomatis
              </Text>

              {actuator.triggerThresholdMin !== undefined && (
                <View className="flex-row items-center justify-between gap-3">
                  <View className="flex-1">
                    <Text className="text-[11px] font-medium text-gray-700 dark:text-gray-300">
                      Ambang Batas Minimum:
                    </Text>
                    <Text className="text-[10px] text-gray-500">
                      Relay aktif jika sensor di bawah nilai ini
                    </Text>
                  </View>
                  <View className="w-24 px-3 py-1.5 rounded-xl bg-white/80 dark:bg-white/[0.08] border border-black/10 dark:border-white/15">
                    <TextInput
                      keyboardType="numeric"
                      value={String(actuator.triggerThresholdMin ?? '')}
                      onChangeText={(val) => {
                        const parsed = parseFloat(val);
                        onUpdate(actuator.id, {
                          triggerThresholdMin: isNaN(parsed) ? 0 : parsed,
                        });
                      }}
                      className="text-xs font-bold text-emerald-950 dark:text-emerald-100 text-center p-0"
                    />
                  </View>
                </View>
              )}

              {actuator.triggerThresholdMax !== undefined && (
                <View className="flex-row items-center justify-between gap-3">
                  <View className="flex-1">
                    <Text className="text-[11px] font-medium text-gray-700 dark:text-gray-300">
                      Ambang Batas Maksimum:
                    </Text>
                    <Text className="text-[10px] text-gray-500">
                      Relay aktif jika sensor di atas nilai ini
                    </Text>
                  </View>
                  <View className="w-24 px-3 py-1.5 rounded-xl bg-white/80 dark:bg-white/[0.08] border border-black/10 dark:border-white/15">
                    <TextInput
                      keyboardType="numeric"
                      value={String(actuator.triggerThresholdMax ?? '')}
                      onChangeText={(val) => {
                        const parsed = parseFloat(val);
                        onUpdate(actuator.id, {
                          triggerThresholdMax: isNaN(parsed) ? 0 : parsed,
                        });
                      }}
                      className="text-xs font-bold text-emerald-950 dark:text-emerald-100 text-center p-0"
                    />
                  </View>
                </View>
              )}

              {actuator.targetValue !== undefined && (
                <View className="flex-row items-center justify-between gap-3">
                  <View className="flex-1">
                    <Text className="text-[11px] font-medium text-gray-700 dark:text-gray-300">
                      Target Nilai Ideal:
                    </Text>
                    <Text className="text-[10px] text-gray-500">
                      Kondisi target penghentian otomatis
                    </Text>
                  </View>
                  <View className="w-24 px-3 py-1.5 rounded-xl bg-white/80 dark:bg-white/[0.08] border border-black/10 dark:border-white/15">
                    <TextInput
                      keyboardType="numeric"
                      value={String(actuator.targetValue ?? '')}
                      onChangeText={(val) => {
                        const parsed = parseFloat(val);
                        onUpdate(actuator.id, {
                          targetValue: isNaN(parsed) ? 0 : parsed,
                        });
                      }}
                      className="text-xs font-bold text-emerald-950 dark:text-emerald-100 text-center p-0"
                    />
                  </View>
                </View>
              )}

              <View className="flex-row items-center justify-between gap-3">
                <View className="flex-1">
                  <Text className="text-[11px] font-medium text-gray-700 dark:text-gray-300">
                    Batas Maks Durasi (Menit):
                  </Text>
                  <Text className="text-[10px] text-gray-500">
                    Fail-safe untuk mematikan relay secara otomatis
                  </Text>
                </View>
                <View className="w-24 px-3 py-1.5 rounded-xl bg-white/80 dark:bg-white/[0.08] border border-black/10 dark:border-white/15">
                  <TextInput
                    keyboardType="numeric"
                    value={String(actuator.maxDurationMinutes)}
                    onChangeText={(val) => {
                      const parsed = parseInt(val, 10);
                      onUpdate(actuator.id, {
                        maxDurationMinutes: isNaN(parsed) ? 1 : parsed,
                      });
                    }}
                    className="text-xs font-bold text-emerald-950 dark:text-emerald-100 text-center p-0"
                  />
                </View>
              </View>

              <View className="flex-row items-center justify-between gap-3">
                <View className="flex-1">
                  <Text className="text-[11px] font-medium text-gray-700 dark:text-gray-300">
                    Jeda Cooldown (Menit):
                  </Text>
                  <Text className="text-[10px] text-gray-500">
                    Waktu jeda sebelum dapat menyala kembali
                  </Text>
                </View>
                <View className="w-24 px-3 py-1.5 rounded-xl bg-white/80 dark:bg-white/[0.08] border border-black/10 dark:border-white/15">
                  <TextInput
                    keyboardType="numeric"
                    value={String(actuator.cooldownMinutes)}
                    onChangeText={(val) => {
                      const parsed = parseInt(val, 10);
                      onUpdate(actuator.id, {
                        cooldownMinutes: isNaN(parsed) ? 5 : parsed,
                      });
                    }}
                    className="text-xs font-bold text-emerald-950 dark:text-emerald-100 text-center p-0"
                  />
                </View>
              </View>
            </View>
          )}

          {actuator.mode === 'schedule' && (
            <View className="gap-2.5">
              <Text className="text-xs font-bold text-emerald-950 dark:text-emerald-100">
                Jadwal Eksekusi Rutin
              </Text>

              <View className="flex-row items-center justify-between gap-3">
                <View className="flex-1">
                  <Text className="text-[11px] font-medium text-gray-700 dark:text-gray-300">
                    Waktu Pemicu (HH:mm):
                  </Text>
                  <Text className="text-[10px] text-gray-500">
                    Contoh: 06:30 atau 17:00 WIB
                  </Text>
                </View>
                <View className="w-24 px-3 py-1.5 rounded-xl bg-white/80 dark:bg-white/[0.08] border border-black/10 dark:border-white/15">
                  <TextInput
                    value={actuator.scheduleTime || '06:00'}
                    onChangeText={(val) =>
                      onUpdate(actuator.id, { scheduleTime: val })
                    }
                    placeholder="06:00"
                    placeholderTextColor="#9CA3AF"
                    className="text-xs font-bold text-emerald-950 dark:text-emerald-100 text-center p-0"
                  />
                </View>
              </View>

              <View className="flex-row items-center justify-between gap-3">
                <View className="flex-1">
                  <Text className="text-[11px] font-medium text-gray-700 dark:text-gray-300">
                    Interval Siklus (Hari):
                  </Text>
                  <Text className="text-[10px] text-gray-500">
                    Ulangi setiap N hari
                  </Text>
                </View>
                <View className="w-24 px-3 py-1.5 rounded-xl bg-white/80 dark:bg-white/[0.08] border border-black/10 dark:border-white/15">
                  <TextInput
                    keyboardType="numeric"
                    value={String(actuator.scheduleDaysInterval || 1)}
                    onChangeText={(val) => {
                      const parsed = parseInt(val, 10);
                      onUpdate(actuator.id, {
                        scheduleDaysInterval: isNaN(parsed) ? 1 : parsed,
                      });
                    }}
                    className="text-xs font-bold text-emerald-950 dark:text-emerald-100 text-center p-0"
                  />
                </View>
              </View>

              {actuator.dosageMl !== undefined && (
                <View className="flex-row items-center justify-between gap-3">
                  <View className="flex-1">
                    <Text className="text-[11px] font-medium text-gray-700 dark:text-gray-300">
                      Dosis Cairan (ml):
                    </Text>
                    <Text className="text-[10px] text-gray-500">
                      Takaran pompa peristaltik
                    </Text>
                  </View>
                  <View className="w-24 px-3 py-1.5 rounded-xl bg-white/80 dark:bg-white/[0.08] border border-black/10 dark:border-white/15">
                    <TextInput
                      keyboardType="numeric"
                      value={String(actuator.dosageMl || 50)}
                      onChangeText={(val) => {
                        const parsed = parseInt(val, 10);
                        onUpdate(actuator.id, {
                          dosageMl: isNaN(parsed) ? 0 : parsed,
                        });
                      }}
                      className="text-xs font-bold text-emerald-950 dark:text-emerald-100 text-center p-0"
                    />
                  </View>
                </View>
              )}
            </View>
          )}

          {actuator.mode === 'manual' && (
            <View className="p-3 rounded-xl bg-black/5 dark:bg-white/[0.04]">
              <Text className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                Mode manual aktif: Aktuator hanya akan beroperasi saat tombol daya dinyalakan atau saat menjalankan tes pulsa perangkat keras.
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Footer: Test Pulse Simulation & Last Triggered Info */}
      <View className="pt-2 border-t border-black/5 dark:border-white/10 flex-row items-center justify-between">
        <View className="flex-row items-center gap-1.5 flex-1 pr-2">
          <Clock size={12} color={isDark ? '#9CA3AF' : '#6B7280'} />
          <Text
            numberOfLines={1}
            className="text-[10px] text-gray-500 dark:text-gray-400"
          >
            {actuator.lastTriggeredAt || 'Belum pernah dipicu'}
          </Text>
        </View>

        <Pressable
          onPress={() => onTestPulse(actuator.id)}
          disabled={isEmergencyLocked}
          className="px-2.5 py-1.5 rounded-xl bg-black/5 dark:bg-white/[0.08] flex-row items-center gap-1.5 active:opacity-70"
        >
          <Play size={11} color="#059669" />
          <Text className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
            Tes 5s
          </Text>
        </Pressable>
      </View>
    </GlassCard>
  );
}
