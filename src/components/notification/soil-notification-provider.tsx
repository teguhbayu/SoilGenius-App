import React, { createContext, useContext } from 'react';
import { useSoilNotificationMonitor } from '@/hooks/use-soil-notification-monitor';
import { SoilDataRecord } from '@/types/soil';

interface SoilNotificationContextValue {
  isEnabled: boolean;
  hasPermission: boolean;
  latestData: SoilDataRecord | null;
  lastCheckTime: Date | null;
  toggleNotifications: (enabled: boolean) => Promise<void>;
  triggerTest: () => Promise<void>;
  checkCurrentData: () => Promise<void>;
}

const SoilNotificationContext = createContext<SoilNotificationContextValue | null>(null);

export function SoilNotificationProvider({ children }: { children: React.ReactNode }) {
  const monitor = useSoilNotificationMonitor();

  return (
    <SoilNotificationContext.Provider value={monitor}>
      {children}
    </SoilNotificationContext.Provider>
  );
}

export function useSoilNotification() {
  const context = useContext(SoilNotificationContext);
  if (!context) {
    throw new Error('useSoilNotification must be used within a SoilNotificationProvider');
  }
  return context;
}
