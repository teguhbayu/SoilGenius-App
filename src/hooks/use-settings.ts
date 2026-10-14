import { useState, useEffect, useCallback } from 'react';
import { AppSettingsConfig } from '@/types/settings';
import { getItem, setItem } from '@/services/storage';

const STORAGE_KEY = '@soilgenius_app_configs_v2';

export const DEFAULT_CONFIG: AppSettingsConfig = {
  apiServerIp: '192.168.1.100',
  apiServerPort: '5000',
  serverIp: '192.168.1.100',
  serverPort: '1883',
  mqttChannel: 'soilgenius/sensor/data',
};

export function useSettings() {
  const [config, setConfig] = useState<AppSettingsConfig>(DEFAULT_CONFIG);
  const [apiServerIp, setApiServerIp] = useState<string>(DEFAULT_CONFIG.apiServerIp);
  const [apiServerPort, setApiServerPort] = useState<string>(DEFAULT_CONFIG.apiServerPort);
  const [serverIp, setServerIp] = useState<string>(DEFAULT_CONFIG.serverIp);
  const [serverPort, setServerPort] = useState<string>(DEFAULT_CONFIG.serverPort);
  const [mqttChannel, setMqttChannel] = useState<string>(DEFAULT_CONFIG.mqttChannel);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  useEffect(() => {
    async function loadConfig() {
      try {
        const stored = await getItem(STORAGE_KEY);
        if (stored) {
          const parsed: Partial<AppSettingsConfig> = JSON.parse(stored);
          const merged: AppSettingsConfig = {
            apiServerIp: parsed.apiServerIp ?? DEFAULT_CONFIG.apiServerIp,
            apiServerPort: parsed.apiServerPort ?? DEFAULT_CONFIG.apiServerPort,
            serverIp: parsed.serverIp ?? DEFAULT_CONFIG.serverIp,
            serverPort: parsed.serverPort ?? DEFAULT_CONFIG.serverPort,
            mqttChannel: parsed.mqttChannel ?? DEFAULT_CONFIG.mqttChannel,
          };
          setConfig(merged);
          setApiServerIp(merged.apiServerIp);
          setApiServerPort(merged.apiServerPort);
          setServerIp(merged.serverIp);
          setServerPort(merged.serverPort);
          setMqttChannel(merged.mqttChannel);
        }
      } catch {
        return;
      } finally {
        setIsLoading(false);
      }
    }

    loadConfig();
  }, []);

  const saveConfig = useCallback(async () => {
    setIsSaving(true);
    const newConfig: AppSettingsConfig = {
      apiServerIp: apiServerIp.trim() || DEFAULT_CONFIG.apiServerIp,
      apiServerPort: apiServerPort.trim() || DEFAULT_CONFIG.apiServerPort,
      serverIp: serverIp.trim() || DEFAULT_CONFIG.serverIp,
      serverPort: serverPort.trim() || DEFAULT_CONFIG.serverPort,
      mqttChannel: mqttChannel.trim() || DEFAULT_CONFIG.mqttChannel,
    };

    try {
      await setItem(STORAGE_KEY, JSON.stringify(newConfig));
      setConfig(newConfig);
      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
      }, 3000);
    } catch {
      return;
    } finally {
      setIsSaving(false);
    }
  }, [apiServerIp, apiServerPort, serverIp, serverPort, mqttChannel]);

  const resetToDefault = useCallback(async () => {
    try {
      await setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CONFIG));
      setConfig(DEFAULT_CONFIG);
      setApiServerIp(DEFAULT_CONFIG.apiServerIp);
      setApiServerPort(DEFAULT_CONFIG.apiServerPort);
      setServerIp(DEFAULT_CONFIG.serverIp);
      setServerPort(DEFAULT_CONFIG.serverPort);
      setMqttChannel(DEFAULT_CONFIG.mqttChannel);
      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
      }, 3000);
    } catch {
      return;
    }
  }, []);

  return {
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
  };
}
