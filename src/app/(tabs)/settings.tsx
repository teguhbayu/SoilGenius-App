import React from 'react';
import { View, ScrollView, Pressable, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Cpu, ChevronRight, Sliders } from 'lucide-react-native';
import { SafeAreaView } from '@/components/ui/styled';
import { MeshBackground } from '@/components/ui/mesh-background';
import { GlassCard } from '@/components/ui/glass-card';
import { Skeleton } from '@/components/ui/skeleton';
import { useSettings } from '@/hooks/use-settings';
import { useThemeMode } from '@/hooks/use-theme-mode';
import { useToast } from '@/hooks/use-toast';
import { SettingsHeader } from '@/components/settings/settings-header';
import { ConfigSummaryCard } from '@/components/settings/config-summary-card';
import { ApiServerConfigCard } from '@/components/settings/api-server-config-card';
import { ServerConfigCard } from '@/components/settings/server-config-card';
import { MqttConfigCard } from '@/components/settings/mqtt-config-card';
import { NotificationConfigCard } from '@/components/settings/notification-config-card';
import { ThemeConfigCard } from '@/components/settings/theme-config-card';
import { SaveConfigButton } from '@/components/settings/save-config-button';

function SettingsScreenSkeleton() {
  return (
    <View className="gap-4">
      <GlassCard glowColor="#10B981" contentClassName="p-4 rounded-[20px] gap-3">
        <View className="flex-row items-center gap-2">
          <Skeleton width={32} height={32} borderRadius={10} />
          <View className="gap-1 flex-1">
            <Skeleton width="45%" height={15} borderRadius={4} />
            <Skeleton width="65%" height={10} borderRadius={3} />
          </View>
        </View>
        <View className="flex-row gap-2 pt-1">
          <Skeleton width="48%" height={38} borderRadius={10} />
          <Skeleton width="48%" height={38} borderRadius={10} />
        </View>
      </GlassCard>

      {[...Array(3)].map((_, i) => (
        <GlassCard key={i} glowColor="#10B981" contentClassName="p-4 rounded-[20px] gap-3">
          <View className="flex-row items-center gap-2">
            <Skeleton width={26} height={26} borderRadius={8} />
            <Skeleton width="40%" height={15} borderRadius={4} />
          </View>
          <View className="gap-2">
            <Skeleton width={80} height={11} borderRadius={3} />
            <Skeleton width="100%" height={42} borderRadius={12} />
          </View>
          <View className="gap-2">
            <Skeleton width={80} height={11} borderRadius={3} />
            <Skeleton width="100%" height={42} borderRadius={12} />
          </View>
        </GlassCard>
      ))}
    </View>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const {
    config,
    apiServerIp,
    apiServerPort,
    serverIp,
    serverPort,
    mqttChannel,
    isLoading,
    isSaving,
    isSaved,
    setApiServerIp,
    setApiServerPort,
    setServerIp,
    setServerPort,
    setMqttChannel,
    saveConfig,
    resetToDefault,
  } = useSettings();

  const { themeMode, setThemeMode } = useThemeMode();
  const toast = useToast();

  const handleSave = async () => {
    try {
      await saveConfig();
      toast.success("Konfigurasi berhasil disimpan!");
    } catch (err: any) {
      toast.error(err?.message || "Gagal menyimpan konfigurasi");
    }
  };

  const handleReset = async () => {
    await resetToDefault();
    toast.info("Pengaturan dikembalikan ke awal");
  };

  return (
    <View className="flex-1">
      <MeshBackground />

      <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
        <SettingsHeader onReset={handleReset} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          className="flex-1"
          contentContainerClassName="px-4 pt-3 pb-24 max-w-[500px] self-center w-full gap-4"
        >
          {isLoading ? (
            <SettingsScreenSkeleton />
          ) : (
            <>
              <ConfigSummaryCard config={config} />

              {/* Push Notification Service Configuration */}
              <NotificationConfigCard />

              {/* Actuator & IoT Relay Control Hub Navigation */}
              <Pressable
                onPress={() => router.push('/actuator')}
                className="active:scale-[0.99]"
              >
                <GlassCard
                  glowColor="#10B981"
                  borderColor="rgba(16, 185, 129, 0.4)"
                  contentClassName="p-4 rounded-[22px] flex-row items-center gap-3"
                >
                  <View className="w-11 h-11 rounded-2xl items-center justify-center bg-emerald-600 shadow-sm shadow-emerald-600/40">
                    <Cpu size={22} color="#FFFFFF" />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2">
                      <Text className="text-sm font-extrabold text-emerald-950 dark:text-emerald-50">
                        Kontrol & Otomasi Aktuator
                      </Text>
                      <View className="px-2 py-0.5 rounded-full bg-emerald-500/15">
                        <Text className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                          IoT
                        </Text>
                      </View>
                    </View>
                    <Text className="text-xs text-emerald-800/70 dark:text-emerald-300/70 mt-0.5">
                      Atur jadwal relai, dosing pupuk, batas kelembapan, & sakelar
                    </Text>
                  </View>
                  <ChevronRight size={18} color="#059669" />
                </GlassCard>
              </Pressable>

              <ApiServerConfigCard
                apiServerIp={apiServerIp}
                apiServerPort={apiServerPort}
                onChangeIp={setApiServerIp}
                onChangePort={setApiServerPort}
              />

              <ServerConfigCard
                serverIp={serverIp}
                serverPort={serverPort}
                onChangeIp={setServerIp}
                onChangePort={setServerPort}
              />

              <MqttConfigCard
                channel={mqttChannel}
                onChangeChannel={setMqttChannel}
              />

              <ThemeConfigCard
                currentMode={themeMode}
                onSelectMode={setThemeMode}
              />

              <SaveConfigButton
                onSave={handleSave}
                isSaving={isSaving}
                isSaved={isSaved}
              />
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
