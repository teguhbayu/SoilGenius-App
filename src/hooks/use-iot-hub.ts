import { useState, useEffect, useCallback, useRef } from 'react';
import { useSettings } from '@/hooks/use-settings';
import {
  fetchDevices,
  sendDeviceCommand,
  sendEmergencyStop,
  fetchRules,
  createRule,
  toggleRule,
  deleteRule,
  claimDevice,
  deleteDevice,
  fetchSchedules,
  createSchedule,
  toggleSchedule,
  deleteSchedule,
} from '@/services/device-api';
import { DeviceDto, RuleDto, ScheduleDto } from '@/types/device';

export function useIotHub() {
  const { config } = useSettings();
  const [devices, setDevices] = useState<DeviceDto[]>([]);
  const [rules, setRules] = useState<RuleDto[]>([]);
  const [schedules, setSchedules] = useState<ScheduleDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [pendingCmdId, setPendingCmdId] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [serverOnline, setServerOnline] = useState<boolean>(true);

  const ip = config.apiServerIp;
  const port = config.apiServerPort;

  const loadHubData = useCallback(
    async (isManualRefresh = false) => {
      if (isManualRefresh) setIsRefreshing(true);
      try {
        const [devicesData, rulesData, schedulesData] = await Promise.all([
          fetchDevices({ ip, port }).catch(() => []),
          fetchRules({ ip, port }).catch(() => []),
          fetchSchedules({ ip, port }).catch(() => []),
        ]);

        if (devicesData) {
          setDevices(devicesData);
          setServerOnline(true);
        }

        if (rulesData) {
          setRules(rulesData);
        }

        if (schedulesData) {
          setSchedules(schedulesData);
        }

        setLastSyncTime(new Date());
      } catch (err) {
        setServerOnline(false);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [ip, port]
  );

  // Initial fetch and auto-polling every 6 seconds
  useEffect(() => {
    loadHubData(false);

    const interval = setInterval(() => {
      loadHubData(false);
    }, 6000);

    return () => clearInterval(interval);
  }, [loadHubData]);

  // Primary actuator device
  const actuatorDevice =
    devices.find((d) => d.type === 'actuator') || devices[0] || null;

  // Toggle relay on actuator
  const toggleRelay = useCallback(
    async (
      deviceId: string,
      relayKey: string,
      currentState: boolean,
      durationSeconds = 300
    ) => {
      const nextState = !currentState;
      const action = nextState ? 'turn_on' : 'turn_off';

      // Optimistic update
      setDevices((prev) =>
        prev.map((dev) => {
          if (dev.id === deviceId) {
            return {
              ...dev,
              desiredState: {
                ...dev.desiredState,
                [relayKey]: nextState,
              },
            };
          }
          return dev;
        })
      );

      try {
        const res = await sendDeviceCommand(
          deviceId,
          {
            action,
            payload: {
              [relayKey]: nextState,
              actuatorKey: relayKey,
              ...(nextState && durationSeconds ? { durationSeconds } : {}),
            },
            ...(nextState && durationSeconds ? { durationSeconds } : {}),
            failsafeSeconds: durationSeconds,
          },
          { ip, port }
        );

        if (res && res.cmdId) {
          setPendingCmdId(res.cmdId);
        }

        // Trigger quick refresh
        setTimeout(() => loadHubData(false), 800);
      } catch (err) {
        // Revert on error
        loadHubData(false);
        throw err;
      }
    },
    [ip, port, loadHubData]
  );

  // Trigger test pulse
  const triggerPulse = useCallback(
    async (deviceId: string, relayKey: string, pulseSeconds = 5) => {
      try {
        const res = await sendDeviceCommand(
          deviceId,
          {
            action: 'pulse',
            payload: {
              [relayKey]: true,
              pulseSeconds,
            },
            failsafeSeconds: pulseSeconds + 5,
          },
          { ip, port }
        );

        if (res && res.cmdId) {
          setPendingCmdId(res.cmdId);
        }

        setTimeout(() => loadHubData(false), 600);
      } catch (err) {
        throw err;
      }
    },
    [ip, port, loadHubData]
  );

  // Emergency stop
  const triggerEmergency = useCallback(async () => {
    // Optimistically shut down all
    setDevices((prev) =>
      prev.map((d) => ({
        ...d,
        desiredState: {
          ...d.desiredState,
          water_pump: false,
          emergencyStop: true,
        },
      }))
    );

    try {
      await sendEmergencyStop({ ip, port });
      setTimeout(() => loadHubData(false), 500);
    } catch (err) {
      loadHubData(false);
      throw err;
    }
  }, [ip, port, loadHubData]);

  // Rule actions
  const handleToggleRule = useCallback(
    async (ruleId: string) => {
      setRules((prev) =>
        prev.map((r) => (r.id === ruleId ? { ...r, isActive: !r.isActive } : r))
      );
      try {
        await toggleRule(ruleId, { ip, port });
      } catch (err) {
        loadHubData(false);
        throw err;
      }
    },
    [ip, port, loadHubData]
  );

  const handleCreateRule = useCallback(
    async (ruleData: Partial<RuleDto>) => {
      try {
        const newRule = await createRule(ruleData, { ip, port });
        setRules((prev) => [newRule, ...prev]);
        return newRule;
      } catch (err) {
        throw err;
      }
    },
    [ip, port]
  );

  const handleDeleteRule = useCallback(
    async (ruleId: string) => {
      setRules((prev) => prev.filter((r) => r.id !== ruleId));
      try {
        await deleteRule(ruleId, { ip, port });
      } catch (err) {
        loadHubData(false);
        throw err;
      }
    },
    [ip, port, loadHubData]
  );

  const handleUnpairDevice = useCallback(
    async (deviceId: string) => {
      setDevices((prev) => prev.filter((d) => d.id !== deviceId));
      try {
        await deleteDevice(deviceId, { ip, port });
        await loadHubData(true);
      } catch (err) {
        loadHubData(false);
        throw err;
      }
    },
    [ip, port, loadHubData]
  );

  // Manual pump open (turn on)
  const openPumpManually = useCallback(
    async (deviceId: string, durationSeconds = 300) => {
      setDevices((prev) =>
        prev.map((dev) => {
          if (dev.id === deviceId) {
            return {
              ...dev,
              desiredState: { ...dev.desiredState, water_pump: true },
            };
          }
          return dev;
        })
      );

      try {
        const res = await sendDeviceCommand(
          deviceId,
          {
            action: 'turn_on',
            payload: {
              water_pump: true,
              ...(durationSeconds ? { durationSeconds } : {}),
            },
            ...(durationSeconds ? { durationSeconds } : {}),
            failsafeSeconds: durationSeconds,
          },
          { ip, port }
        );
        if (res && res.cmdId) setPendingCmdId(res.cmdId);
        setTimeout(() => loadHubData(false), 600);
      } catch (err) {
        loadHubData(false);
        throw err;
      }
    },
    [ip, port, loadHubData]
  );

  // Manual pump close (turn off)
  const closePumpManually = useCallback(
    async (deviceId: string) => {
      setDevices((prev) =>
        prev.map((dev) => {
          if (dev.id === deviceId) {
            return {
              ...dev,
              desiredState: { ...dev.desiredState, water_pump: false },
            };
          }
          return dev;
        })
      );

      try {
        const res = await sendDeviceCommand(
          deviceId,
          {
            action: 'turn_off',
            payload: { water_pump: false },
            failsafeSeconds: 0,
          },
          { ip, port }
        );
        if (res && res.cmdId) setPendingCmdId(res.cmdId);
        setTimeout(() => loadHubData(false), 600);
      } catch (err) {
        loadHubData(false);
        throw err;
      }
    },
    [ip, port, loadHubData]
  );

  // Schedule management actions
  const handleToggleSchedule = useCallback(
    async (scheduleId: string) => {
      setSchedules((prev) =>
        prev.map((s) => (s.id === scheduleId ? { ...s, isActive: !s.isActive } : s))
      );
      try {
        await toggleSchedule(scheduleId, { ip, port });
      } catch (err) {
        loadHubData(false);
        throw err;
      }
    },
    [ip, port, loadHubData]
  );

  const handleCreateSchedule = useCallback(
    async (scheduleData: Partial<ScheduleDto>) => {
      try {
        const newSched = await createSchedule(scheduleData, { ip, port });
        setSchedules((prev) => [newSched, ...prev]);
        return newSched;
      } catch (err) {
        throw err;
      }
    },
    [ip, port]
  );

  const handleDeleteSchedule = useCallback(
    async (scheduleId: string) => {
      setSchedules((prev) => prev.filter((s) => s.id !== scheduleId));
      try {
        await deleteSchedule(scheduleId, { ip, port });
      } catch (err) {
        loadHubData(false);
        throw err;
      }
    },
    [ip, port, loadHubData]
  );

  return {
    devices,
    actuatorDevice,
    rules,
    schedules,
    isLoading,
    isRefreshing,
    serverOnline,
    lastSyncTime,
    pendingCmdId,
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
  };
}
