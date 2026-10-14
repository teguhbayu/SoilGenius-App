import React from 'react';

export interface SoilDataRecord {
  time: string;
  ph: number;
  tempC: number;
  moisture: number;
  photo?: string | null;
}

export interface SoilDataApiResponse {
  status: number;
  message: string;
  data: SoilDataRecord[];
}

export interface SoilCurrentDataApiResponse {
  status: number;
  message: string;
  data: SoilDataRecord | null;
}

export type MetricType = 'ph' | 'moisture' | 'temperature';

export interface MetricDataPoint {
  day: string;
  value: number;
  date: string;
}

export interface MetricConfig {
  id: MetricType;
  label: string;
  unit: string;
  color: string;
  accentBg: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  minY: number;
  maxY: number;
  data: MetricDataPoint[];
  targetRange: string;
  statusLabel: string;
}
