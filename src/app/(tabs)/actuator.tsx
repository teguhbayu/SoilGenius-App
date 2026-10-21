import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Pressable,
} from 'react-native';
import { SafeAreaView } from '@/components/ui/styled';
import { MeshBackground } from '@/components/ui/mesh-background';
import { useActuatorConfig } from '@/hooks/use-actuator-config';
import { useToast } from '@/hooks/use-toast';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { ActuatorHeader } from '@/components/actuator/actuator-header';
import { ActuatorMasterCard } from '@/components/actuator/actuator-master-card';
import { ActuatorCard } from '@/components/actuator/actuator-card';
import { ActuatorLogsCard } from '@/components/actuator/actuator-logs-card';
import { ActuatorScreenSkeleton } from '@/components/actuator/actuator-skeleton';
import { ActuatorType } from '@/types/actuator';

type FilterCategory = 'all' | ActuatorType;

export default function ActuatorTabScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];
  const toast = useToast();

  const {
    actuators,
    systemSettings,
    logs,
    isLoading,
    isSaving,
    toggleActuatorActive,
    updateActuator,
    updateSystemSettings,
    triggerTestPulse,
    saveAllConfig,
    resetToDefault,
  } = useActuatorConfig();

  const [selectedFilter, setSelectedFilter] = useState<FilterCategory>('all');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsRefreshing(false);
    toast.info('Status relai diperbarui');
  }, [toast]);

  const handleSave = async () => {
    try {
      await saveAllConfig();
      toast.success('Konfigurasi aktuator berhasil disimpan!');
    } catch (err: any) {
      toast.error(err?.message || 'Gagal menyimpan konfigurasi');
    }
  };

  const handleReset = async () => {
    await resetToDefault();
    toast.info('Konfigurasi dikembalikan ke standar awal');
  };

  const handleToggle = (id: string) => {
    if (systemSettings.emergencyStop) {
      toast.error('Buka kunci Emergency Stop terlebih dahulu.');
      return;
    }
    const item = actuators.find((a) => a.id === id);
    toggleActuatorActive(id);
    if (item) {
      const willBeActive = !item.isActive;
      if (willBeActive) {
        toast.success(`${item.name} dinyalakan`);
      } else {
        toast.info(`${item.name} dimatikan`);
      }
    }
  };

  const handleEmergencyStopToggle = () => {
    const nextState = !systemSettings.emergencyStop;
    updateSystemSettings({ emergencyStop: nextState });
    if (nextState) {
      toast.error('EMERGENCY STOP DIAKTIFKAN! Seluruh relai diputus.');
    } else {
      toast.success('Sistem darurat dilepas. Kontrol relai kembali normal.');
    }
  };

  const handleTestPulse = (id: string) => {
    const item = actuators.find((a) => a.id === id);
    triggerTestPulse(id, 5);
    toast.info(`Menjalankan tes pulsa 5 detik untuk ${item?.name || 'aktuator'}...`);
  };

  const filterOptions: { id: FilterCategory; label: string }[] = [
    { id: 'all', label: 'Semua' },
    { id: 'water_pump', label: 'Irigasi' },
    { id: 'fertilizer_pump', label: 'Nutrisi' },
    { id: 'ph_doser', label: 'Buffer pH' },
    { id: 'cooling_fan', label: 'Aerasi' },
    { id: 'mist_sprayer', label: 'Pengabut' },
  ];

  const filteredActuators =
    selectedFilter === 'all'
      ? actuators
      : actuators.filter((a) => a.type === selectedFilter);

  return (
    <View className="flex-1">
      <MeshBackground />

      <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
        <ActuatorHeader
          onReset={handleReset}
          onSave={handleSave}
          isSaving={isSaving}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          className="flex-1"
          contentContainerClassName="px-4 pt-3 pb-24 max-w-[500px] self-center w-full gap-4"
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
        >
          {isLoading ? (
            <ActuatorScreenSkeleton />
          ) : (
            <>
              {/* Master Control & Safety Card */}
              <ActuatorMasterCard
                settings={systemSettings}
                actuators={actuators}
                onUpdateSettings={updateSystemSettings}
                onEmergencyStop={handleEmergencyStopToggle}
              />

              {/* Category Filter Pills */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerClassName="gap-2 py-1"
              >
                {filterOptions.map((opt) => {
                  const isSelected = selectedFilter === opt.id;
                  return (
                    <Pressable
                      key={opt.id}
                      onPress={() => setSelectedFilter(opt.id)}
                      className={`px-3.5 py-1.5 rounded-full border ${
                        isSelected
                          ? 'bg-emerald-600 border-emerald-600'
                          : 'bg-white/80 dark:bg-white/[0.06] border-black/10 dark:border-white/10'
                      }`}
                    >
                      <Text
                        className={`text-xs font-bold ${
                          isSelected
                            ? 'text-white'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {opt.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              {/* Actuator Cards List */}
              <View className="gap-3.5">
                {filteredActuators.map((actuator) => (
                  <ActuatorCard
                    key={actuator.id}
                    actuator={actuator}
                    isEmergencyLocked={systemSettings.emergencyStop}
                    onToggleActive={handleToggle}
                    onUpdate={updateActuator}
                    onTestPulse={handleTestPulse}
                  />
                ))}
              </View>

              {/* Logs Card */}
              <ActuatorLogsCard logs={logs} />
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
