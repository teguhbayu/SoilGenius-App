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
import { useIotHub } from '@/hooks/use-iot-hub';
import { useToast } from '@/hooks/use-toast';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { ActuatorHeader } from '@/components/actuator/actuator-header';
import { ServerHubStatusCard } from '@/components/actuator/server-hub-status-card';
import { ActuatorHardwareCard } from '@/components/actuator/actuator-hardware-card';
import { ScheduleManagerCard } from '@/components/actuator/schedule-manager-card';
import { RulesManagerCard } from '@/components/actuator/rules-manager-card';
import { BleProvisioningModal } from '@/components/actuator/ble-provisioning-modal';
import { ActuatorScreenSkeleton } from '@/components/actuator/actuator-skeleton';
import { AlertOctagon, Zap } from 'lucide-react-native';
import { GlassCard } from '@/components/ui/glass-card';

export default function ActuatorTabScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];
  const toast = useToast();

  const {
    devices,
    actuatorDevice,
    rules,
    schedules,
    isLoading,
    isRefreshing,
    serverOnline,
    loadHubData,
    toggleRelay,
    openPumpManually,
    closePumpManually,
    triggerPulse,
    triggerEmergency,
    handleToggleRule,
    handleCreateRule,
    handleDeleteRule,
    handleToggleSchedule,
    handleCreateSchedule,
    handleDeleteSchedule,
    handleUnpairDevice,
  } = useIotHub();

  const [isBleModalVisible, setIsBleModalVisible] = useState<boolean>(false);
  const [isEmergencyActive, setIsEmergencyActive] = useState<boolean>(false);

  const handleRefresh = useCallback(async () => {
    await loadHubData(true);
    toast.info('Status server hub, pompa & jadwal diperbarui');
  }, [loadHubData, toast]);

  const handleToggle = async (
    deviceId: string,
    relayKey: string,
    currentState: boolean,
    durationSeconds?: number
  ) => {
    try {
      await toggleRelay(deviceId, relayKey, currentState, durationSeconds);
      toast.success(
        currentState
          ? 'Perintah mematikan pompa dikirim'
          : `Perintah menyalakan pompa (${durationSeconds ? durationSeconds + 's' : 'Manual'}) dikirim`
      );
    } catch (err: any) {
      toast.error(err.message || 'Gagal mengirim perintah ke server');
    }
  };

  const handleOpenPump = async (deviceId: string, durationSeconds?: number) => {
    try {
      await openPumpManually(deviceId, durationSeconds);
      toast.success(
        `Perintah BUKA POMPA (${durationSeconds ? durationSeconds + 's' : 'Manual'}) dikirim ke server via MQTT`
      );
    } catch (err: any) {
      toast.error(err.message || 'Gagal membuka pompa');
    }
  };

  const handleClosePump = async (deviceId: string) => {
    try {
      await closePumpManually(deviceId);
      toast.info('Perintah TUTUP POMPA (Matikan) dikirim ke server via MQTT');
    } catch (err: any) {
      toast.error(err.message || 'Gagal menutup pompa');
    }
  };

  const handleTestPulse = async (deviceId: string, relayKey: string) => {
    try {
      await triggerPulse(deviceId, relayKey, 5);
      toast.info('Perintah tes pulsa 5s dikirim via MQTT QOS-1');
    } catch (err: any) {
      toast.error(err.message || 'Gagal mengirim tes pulsa');
    }
  };

  const handleEmergencyStop = async () => {
    try {
      setIsEmergencyActive(true);
      await triggerEmergency();
      toast.error('EMERGENCY STOP DIAKTIFKAN! Pompa diputus.');
    } catch (err: any) {
      toast.error(err.message || 'Gagal memicu emergency stop');
    }
  };

  const handleToggleRuleClick = async (ruleId: string) => {
    try {
      await handleToggleRule(ruleId);
      toast.success('Status aturan otomasi berhasil diubah');
    } catch (err: any) {
      toast.error(err.message || 'Gagal mengubah aturan');
    }
  };

  const handleCreateRuleSubmit = async (ruleData: any) => {
    try {
      await handleCreateRule(ruleData);
      toast.success('Aturan otomasi server berhasil disimpan');
    } catch (err: any) {
      toast.error(err.message || 'Gagal membuat aturan baru');
      throw err;
    }
  };

  const handleDeleteRuleClick = async (ruleId: string) => {
    try {
      await handleDeleteRule(ruleId);
      toast.info('Aturan otomasi dihapus');
    } catch (err: any) {
      toast.error(err.message || 'Gagal menghapus aturan');
    }
  };

  const handleToggleScheduleClick = async (scheduleId: string) => {
    try {
      await handleToggleSchedule(scheduleId);
      toast.success('Status jadwal penyiraman diperbarui');
    } catch (err: any) {
      toast.error(err.message || 'Gagal mengubah status jadwal');
    }
  };

  const handleCreateScheduleSubmit = async (scheduleData: any) => {
    try {
      await handleCreateSchedule(scheduleData);
      toast.success('Jadwal penyiraman berhasil disimpan di server');
    } catch (err: any) {
      toast.error(err.message || 'Gagal membuat jadwal baru');
      throw err;
    }
  };

  const handleDeleteScheduleClick = async (scheduleId: string) => {
    try {
      await handleDeleteSchedule(scheduleId);
      toast.info('Jadwal penyiraman dihapus dari server');
    } catch (err: any) {
      toast.error(err.message || 'Gagal menghapus jadwal');
    }
  };

  const handleUnpair = async (deviceId: string) => {
    try {
      await handleUnpairDevice(deviceId);
      toast.info('Perangkat aktuator berhasil dihapus');
    } catch (err: any) {
      toast.error(err.message || 'Gagal menghapus perangkat');
    }
  };

  return (
    <View className="flex-1">
      <MeshBackground />

      <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
        <ActuatorHeader
          onReset={handleRefresh}
          onSave={handleRefresh}
          isSaving={isRefreshing}
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
              {/* Emergency Stop Card */}
              <GlassCard
                glowColor={isEmergencyActive ? '#EF4444' : '#10B981'}
                borderColor={isEmergencyActive ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.25)'}
                contentClassName="p-3.5 rounded-[22px] flex-row items-center justify-between gap-2"
              >
                <View className="flex-row items-center gap-2.5 flex-1 min-w-0 pr-1">
                  <View className="w-8 h-8 rounded-xl items-center justify-center bg-red-500/15 shrink-0">
                    <AlertOctagon size={16} color="#EF4444" />
                  </View>
                  <View className="flex-1 min-w-0">
                    <Text
                      className="text-xs font-bold text-emerald-950 dark:text-emerald-50"
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      Sistem Pengaman Darurat
                    </Text>
                    <Text
                      className="text-[10px] text-gray-500 dark:text-gray-400"
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      Putus daya pompa & relai seketika
                    </Text>
                  </View>
                </View>

                <Pressable
                  onPress={handleEmergencyStop}
                  className="px-3 py-2 rounded-xl bg-red-600 flex-row items-center gap-1.5 active:opacity-85 shadow-sm shrink-0"
                >
                  <AlertOctagon size={13} color="#FFFFFF" />
                  <Text className="text-xs font-bold text-white">E-STOP</Text>
                </Pressable>
              </GlassCard>

              {/* 1. Server Hub & Nodes Architecture Card */}
              <ServerHubStatusCard
                serverOnline={serverOnline}
                actuatorDevice={actuatorDevice}
                onOpenBlePairing={() => setIsBleModalVisible(true)}
                onUnpairDevice={handleUnpair}
              />

              {/* 2. Actuator Hardware Card (Manual Open / Close & State) */}
              <ActuatorHardwareCard
                device={actuatorDevice}
                onToggleRelay={handleToggle}
                onOpenPump={handleOpenPump}
                onClosePump={handleClosePump}
                onTriggerPulse={handleTestPulse}
                onOpenBlePairing={() => setIsBleModalVisible(true)}
              />

              {/* 3. Server-Side Pump Irrigation Schedules (Open / Close Schedule) */}
              <ScheduleManagerCard
                schedules={schedules}
                actuatorDeviceId={actuatorDevice?.id || ''}
                onToggleSchedule={handleToggleScheduleClick}
                onCreateSchedule={handleCreateScheduleSubmit}
                onDeleteSchedule={handleDeleteScheduleClick}
              />

              {/* 4. Server-Side Automation Rules Manager */}
              <RulesManagerCard
                rules={rules}
                actuatorDeviceId={actuatorDevice?.id || ''}
                onToggleRule={handleToggleRuleClick}
                onCreateRule={handleCreateRuleSubmit}
                onDeleteRule={handleDeleteRuleClick}
              />
            </>
          )}
        </ScrollView>
      </SafeAreaView>

      {/* BLE Provisioning & Wi-Fi Claim Modal */}
      <BleProvisioningModal
        visible={isBleModalVisible}
        onClose={() => setIsBleModalVisible(false)}
        onSuccess={() => {
          loadHubData(false);
          toast.success('Actuator ESP32 berhasil dipasangkan ke Server Hub!');
        }}
      />
    </View>
  );
}
