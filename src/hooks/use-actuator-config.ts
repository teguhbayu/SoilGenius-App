import { useState, useEffect, useCallback } from 'react';
import {
  ActuatorConfigItem,
  ActuatorSystemSettings,
  ActuatorActivityLog,
} from '@/types/actuator';
import { getItem, setItem } from '@/services/storage';

const STORAGE_ACTUATORS_KEY = '@soilgenius_actuators_config_v1';
const STORAGE_SYSTEM_SETTINGS_KEY = '@soilgenius_actuator_system_settings_v1';
const STORAGE_LOGS_KEY = '@soilgenius_actuator_logs_v1';

export const DEFAULT_ACTUATORS: ActuatorConfigItem[] = [
  {
    id: 'act_pump_1',
    type: 'water_pump',
    name: 'Pompa Irigasi Utama',
    description: 'Menjaga kadar kelembapan tanah optimal secara otomatis saat sensor mendeteksi tanah kering.',
    gpioPin: 'Relay 1 (GPIO 26)',
    mqttTopic: 'soilgenius/actuator/pump',
    isActive: false,
    mode: 'auto',
    status: 'idle',
    triggerThresholdMin: 55,
    targetValue: 75,
    maxDurationMinutes: 5,
    cooldownMinutes: 30,
    lastTriggeredAt: '2 jam yang lalu (Otomatis: 5 Menit)',
  },
  {
    id: 'act_fertilizer_1',
    type: 'fertilizer_pump',
    name: 'Injektor Dosing Pupuk NPK',
    description: 'Menyalurkan formula pupuk cair organik & NPK cair ke perakaran sesuai jadwal tanam.',
    gpioPin: 'Relay 2 (GPIO 27)',
    mqttTopic: 'soilgenius/actuator/fertilizer',
    isActive: false,
    mode: 'schedule',
    status: 'idle',
    scheduleTime: '06:30',
    scheduleDaysInterval: 3,
    dosageMl: 50,
    maxDurationMinutes: 2,
    cooldownMinutes: 60,
    lastTriggeredAt: 'Kemarin, 06:30 WIB (Terjadwal: 50 ml)',
  },
  {
    id: 'act_ph_buffer_1',
    type: 'ph_doser',
    name: 'Pompa Regulasi Buffer pH',
    description: 'Menstabilkan tingkat keasaman tanah jika pH tanah keluar dari rentang netral optimal (6.0 - 7.5).',
    gpioPin: 'Relay 3 (GPIO 14)',
    mqttTopic: 'soilgenius/actuator/ph_buffer',
    isActive: false,
    mode: 'auto',
    status: 'idle',
    triggerThresholdMin: 6.0,
    triggerThresholdMax: 7.5,
    dosageMl: 25,
    maxDurationMinutes: 1,
    cooldownMinutes: 120,
    lastTriggeredAt: '3 hari yang lalu (Otomatis: 25 ml)',
  },
  {
    id: 'act_fan_1',
    type: 'cooling_fan',
    name: 'Blower Aerasi & Pendingin',
    description: 'Mencegah panas berlebih dan meningkatkan sirkulasi oksigen di sekitar permukaan perakaran.',
    gpioPin: 'Relay 4 (GPIO 12)',
    mqttTopic: 'soilgenius/actuator/cooling',
    isActive: false,
    mode: 'auto',
    status: 'idle',
    triggerThresholdMax: 32,
    maxDurationMinutes: 15,
    cooldownMinutes: 15,
    lastTriggeredAt: '5 jam yang lalu (Otomatis: 15 Menit)',
  },
  {
    id: 'act_sprayer_1',
    type: 'mist_sprayer',
    name: 'Mist Sprayer Pengabut',
    description: 'Menyemprotkan partikel air mikro untuk menurunkan stres penguapan pada daun tanaman.',
    gpioPin: 'Relay 5 (GPIO 13)',
    mqttTopic: 'soilgenius/actuator/sprayer',
    isActive: false,
    mode: 'manual',
    status: 'idle',
    maxDurationMinutes: 2,
    cooldownMinutes: 45,
    lastTriggeredAt: '1 hari yang lalu (Manual: 1 Menit)',
  },
];

export const DEFAULT_SYSTEM_SETTINGS: ActuatorSystemSettings = {
  masterAutomationEnabled: true,
  emergencyStop: false,
  failSafeTimeoutMinutes: 20,
  notificationOnTrigger: true,
};

export const INITIAL_LOGS: ActuatorActivityLog[] = [
  {
    id: 'log_1',
    actuatorId: 'act_pump_1',
    actuatorName: 'Pompa Irigasi Utama',
    action: 'Penyiraman otomatis selesai (Kelembapan < 55%)',
    timestamp: 'Hari ini, 14:15 WIB',
    triggerType: 'auto',
  },
  {
    id: 'log_2',
    actuatorId: 'act_fan_1',
    actuatorName: 'Blower Aerasi & Pendingin',
    action: 'Pendinginan otomatis aktif (Suhu > 32°C)',
    timestamp: 'Hari ini, 12:40 WIB',
    triggerType: 'auto',
  },
  {
    id: 'log_3',
    actuatorId: 'act_fertilizer_1',
    actuatorName: 'Injektor Dosing Pupuk NPK',
    action: 'Dosing pupuk terjadwal sukses (50 ml)',
    timestamp: 'Kemarin, 06:30 WIB',
    triggerType: 'schedule',
  },
];

export function useActuatorConfig() {
  const [actuators, setActuators] = useState<ActuatorConfigItem[]>(DEFAULT_ACTUATORS);
  const [systemSettings, setSystemSettings] = useState<ActuatorSystemSettings>(DEFAULT_SYSTEM_SETTINGS);
  const [logs, setLogs] = useState<ActuatorActivityLog[]>(INITIAL_LOGS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [storedActuators, storedSettings, storedLogs] = await Promise.all([
          getItem(STORAGE_ACTUATORS_KEY),
          getItem(STORAGE_SYSTEM_SETTINGS_KEY),
          getItem(STORAGE_LOGS_KEY),
        ]);

        if (storedActuators) {
          const parsed = JSON.parse(storedActuators);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setActuators(parsed);
          }
        }

        if (storedSettings) {
          const parsed = JSON.parse(storedSettings);
          setSystemSettings((prev) => ({ ...prev, ...parsed }));
        }

        if (storedLogs) {
          const parsed = JSON.parse(storedLogs);
          if (Array.isArray(parsed)) {
            setLogs(parsed);
          }
        }
      } catch (err) {
        console.error('Error loading actuator configuration:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const persistData = useCallback(
    async (
      updatedActuators: ActuatorConfigItem[],
      updatedSettings: ActuatorSystemSettings,
      updatedLogs: ActuatorActivityLog[]
    ) => {
      try {
        await Promise.all([
          setItem(STORAGE_ACTUATORS_KEY, JSON.stringify(updatedActuators)),
          setItem(STORAGE_SYSTEM_SETTINGS_KEY, JSON.stringify(updatedSettings)),
          setItem(STORAGE_LOGS_KEY, JSON.stringify(updatedLogs.slice(0, 20))),
        ]);
      } catch (err) {
        console.error('Failed to persist actuator data:', err);
      }
    },
    []
  );

  const toggleActuatorActive = useCallback(
    (id: string) => {
      setActuators((prev) => {
        const updated = prev.map((item) => {
          if (item.id === id) {
            const nextActive = !item.isActive;
            const nextStatus = nextActive ? ('running' as const) : ('idle' as const);

            // Add log
            const newLog: ActuatorActivityLog = {
              id: `log_${Date.now()}`,
              actuatorId: item.id,
              actuatorName: item.name,
              action: nextActive ? 'Aktuator dinyalakan (Manual)' : 'Aktuator dimatikan (Manual)',
              timestamp: 'Baru saja',
              triggerType: 'manual',
            };

            setLogs((prevLogs) => {
              const nextLogs = [newLog, ...prevLogs.slice(0, 19)];
              persistData(
                prev.map((i) => (i.id === id ? { ...i, isActive: nextActive, status: nextStatus } : i)),
                systemSettings,
                nextLogs
              );
              return nextLogs;
            });

            return {
              ...item,
              isActive: nextActive,
              status: nextStatus,
              lastTriggeredAt: nextActive ? 'Sedang berjalan (Manual)' : 'Baru saja dimatikan',
            };
          }
          return item;
        });

        return updated;
      });
    },
    [systemSettings, persistData]
  );

  const updateActuator = useCallback(
    (id: string, updates: Partial<ActuatorConfigItem>) => {
      setActuators((prev) => {
        const next = prev.map((item) => (item.id === id ? { ...item, ...updates } : item));
        persistData(next, systemSettings, logs);
        return next;
      });
    },
    [systemSettings, logs, persistData]
  );

  const updateSystemSettings = useCallback(
    (updates: Partial<ActuatorSystemSettings>) => {
      setSystemSettings((prev) => {
        const next = { ...prev, ...updates };

        // If emergency stop is triggered, immediately stop all actuators
        if (updates.emergencyStop) {
          setActuators((actPrev) =>
            actPrev.map((a) => ({
              ...a,
              isActive: false,
              status: 'disabled' as const,
              lastTriggeredAt: 'Emergency Stop Ditekan',
            }))
          );
        }

        persistData(actuators, next, logs);
        return next;
      });
    },
    [actuators, logs, persistData]
  );

  const triggerTestPulse = useCallback(
    (id: string, durationSeconds = 5) => {
      setActuators((prev) =>
        prev.map((item) => {
          if (item.id === id) {
            return {
              ...item,
              isActive: true,
              status: 'running',
              lastTriggeredAt: `Tes simulasi (${durationSeconds}s)`,
            };
          }
          return item;
        })
      );

      // Revert after test duration
      setTimeout(() => {
        setActuators((prev) =>
          prev.map((item) => {
            if (item.id === id) {
              return {
                ...item,
                isActive: false,
                status: 'idle',
                lastTriggeredAt: 'Tes simulasi selesai',
              };
            }
            return item;
          })
        );
      }, durationSeconds * 1000);
    },
    []
  );

  const saveAllConfig = useCallback(async () => {
    setIsSaving(true);
    try {
      await persistData(actuators, systemSettings, logs);
      await new Promise((resolve) => setTimeout(resolve, 400));
    } finally {
      setIsSaving(false);
    }
  }, [actuators, systemSettings, logs, persistData]);

  const resetToDefault = useCallback(async () => {
    setActuators(DEFAULT_ACTUATORS);
    setSystemSettings(DEFAULT_SYSTEM_SETTINGS);
    setLogs(INITIAL_LOGS);
    await persistData(DEFAULT_ACTUATORS, DEFAULT_SYSTEM_SETTINGS, INITIAL_LOGS);
  }, [persistData]);

  return {
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
  };
}
