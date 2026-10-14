import React from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from '@/components/ui/styled';
import { MeshBackground } from '@/components/ui/mesh-background';
import { useSettings } from '@/hooks/use-settings';
import { useThemeMode } from '@/hooks/use-theme-mode';
import { SettingsHeader } from '@/components/settings/settings-header';
import { ConfigSummaryCard } from '@/components/settings/config-summary-card';
import { ApiServerConfigCard } from '@/components/settings/api-server-config-card';
import { ServerConfigCard } from '@/components/settings/server-config-card';
import { MqttConfigCard } from '@/components/settings/mqtt-config-card';
import { ThemeConfigCard } from '@/components/settings/theme-config-card';
import { SaveConfigButton } from '@/components/settings/save-config-button';

export default function SettingsScreen() {
  const {
    config,
    apiServerIp,
    apiServerPort,
    serverIp,
    serverPort,
    mqttChannel,
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

  return (
    <View className="flex-1">
      <MeshBackground />

      <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
        <SettingsHeader onReset={resetToDefault} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          className="flex-1"
          contentContainerClassName="px-4 pt-3 pb-24 max-w-[500px] self-center w-full gap-4"
        >
          <ConfigSummaryCard config={config} />

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
            onSave={saveConfig}
            isSaving={isSaving}
            isSaved={isSaved}
          />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
