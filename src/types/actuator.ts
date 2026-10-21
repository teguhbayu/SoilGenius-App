export type ActuatorType =
  | 'water_pump'
  | 'fertilizer_pump'
  | 'ph_doser'
  | 'cooling_fan'
  | 'mist_sprayer';

export type ActuatorMode = 'auto' | 'manual' | 'schedule';
export type ActuatorStatus = 'idle' | 'running' | 'disabled';

export interface ActuatorConfigItem {
  id: string;
  type: ActuatorType;
  name: string;
  description: string;
  gpioPin: string;
  mqttTopic: string;
  isActive: boolean; // Manual running toggle state
  mode: ActuatorMode;
  status: ActuatorStatus;

  // Threshold & sensor trigger settings
  triggerThresholdMin?: number; // e.g. Moisture < 55% or pH < 6.0
  triggerThresholdMax?: number; // e.g. Temp > 32°C or pH > 7.5
  targetValue?: number; // Target moisture 75%
  maxDurationMinutes: number; // Safety timeout in minutes
  cooldownMinutes: number; // Delay between automatic triggers

  // Scheduling & Dosing settings
  scheduleTime?: string; // Format "HH:mm" (e.g. "06:30")
  scheduleDaysInterval?: number; // Repeat every N days
  dosageMl?: number; // Amount of liquid in ml

  lastTriggeredAt?: string | null;
}

export interface ActuatorSystemSettings {
  masterAutomationEnabled: boolean;
  emergencyStop: boolean;
  failSafeTimeoutMinutes: number;
  notificationOnTrigger: boolean;
}

export interface ActuatorActivityLog {
  id: string;
  actuatorId: string;
  actuatorName: string;
  action: string;
  timestamp: string;
  triggerType: 'auto' | 'manual' | 'schedule';
}
