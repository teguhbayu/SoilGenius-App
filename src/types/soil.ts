import React from "react";

export interface SoilDataRecord {
  time: string;
  ph: number;
  tempC: number;
  moisture: number;
  label: string;
  skor: number;
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

export type MetricType = "ph" | "moisture" | "temperature";

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

export type SoilClassification =
  | "Aluvial"
  | "Vulkanik"
  | "Gambut"
  | "Humus"
  | "PMK"
  | "Laterit"
  | "Litosol"
  | "Kapur"
  | string;

export interface SoilQualityParam {
  label: string;
  value: string;
  status: string;
  score: number;
  note: string;
}

export interface RecommendedCrop {
  name: string;
  latin: string;
  category?: "sorgum" | "cabai" | "sawi" | "kacang" | "milet" | "lainnya" | string;
  image?: string;
  compatibility: number;
  badge: string;
  badgeColor?: string;
  cycle: string;
  waterNeed: string;
  reason: string;
}

export interface SoilCareRecommendation {
  category: "aerasi" | "pemupukan" | "drainase" | "patogen" | string;
  title: string;
  description: string;
  points?: string[];
}

export interface SoilAiAnalysis {
  id?: string;
  soilType: SoilClassification;
  score: number;
  statusKualitas: string;
  kesimpulan: string;
  statusBiosfer: string;
  retensiAir: string;
  tingkatSalinitas: string;
  risikoPenyakit: string;
  kualitasTanah: SoilQualityParam[];
  tanamanCocok: RecommendedCrop[];
  perawatanTanah: SoilCareRecommendation[];
  soilDataID?: string;
  createdAt?: string;
}

export interface SoilAiApiResponse {
  status: number;
  message: string;
  data: SoilAiAnalysis | null;
}
