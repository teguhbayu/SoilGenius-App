export type DeviceType = "sensor" | "actuator";
export type DeviceStatus = "online" | "offline";
export type RuleOperator =
  | "LESS_THAN"
  | "GREATER_THAN"
  | "LESS_THAN_OR_EQUAL"
  | "GREATER_THAN_OR_EQUAL";
export type RuleAction = "turn_on" | "turn_off" | "pulse";
export type CommandStatus = "pending" | "acked" | "failed";

export interface DeviceDto {
  id: string;
  name: string;
  type: DeviceType;
  status: DeviceStatus;
  lastSeen?: string | null;
  credentialToken?: string | null;
  desiredState: Record<string, any>;
  reportedState: Record<string, any>;
  ipAddress?: string | null;
  macAddress?: string | null;
  firmwareVersion?: string | null;
  createdAt: string;
  updatedAt: string;
  rules?: RuleDto[];
  commands?: DeviceCommandDto[];
}

export interface RuleDto {
  id: string;
  name: string;
  actuatorDeviceId: string;
  sensorMetric: "moisture" | "tempC" | "ph";
  operator: RuleOperator;
  thresholdValue: number;
  actionType: RuleAction;
  durationSeconds: number;
  cooldownMinutes: number;
  lastTriggeredAt?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  actuatorDevice?: {
    id: string;
    name: string;
    status: DeviceStatus;
  };
}

export interface DeviceCommandDto {
  id: string;
  cmdId: string;
  deviceId: string;
  action: string;
  payload: Record<string, any>;
  failsafeSeconds: number;
  status: CommandStatus;
  createdAt: string;
  ackedAt?: string | null;
}

export interface ClaimTokenResponse {
  token: string;
  expiresAt: string;
  expiresInSeconds: number;
}

export interface ClaimDevicePayload {
  token: string;
  deviceId: string;
  name?: string;
  macAddress?: string;
  ipAddress?: string;
  firmwareVersion?: string;
}

export interface ScheduleDto {
  id: string;
  name: string;
  actuatorDeviceId: string;
  openTime: string; // Format "HH:mm" e.g. "07:00"
  closeTime: string; // Format "HH:mm" e.g. "07:15"
  daysOfWeek: string; // "ALL" or "0,1,2,3,4,5,6"
  isActive: boolean;
  lastRunAction?: string | null;
  lastRunAt?: string | null;
  createdAt: string;
  updatedAt: string;
  actuatorDevice?: {
    id: string;
    name: string;
    status: DeviceStatus;
  };
}
