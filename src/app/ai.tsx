import { useRouter } from "expo-router";
import {
  Award,
  BrainCircuit,
  Calendar,
  ChevronLeft,
  Droplets,
  FlaskConical,
  Layers,
  ShieldCheck,
  Sparkles,
  Sprout,
  Thermometer,
  TrendingUp,
  Wrench,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Dimensions,
  LayoutChangeEvent,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";


import { GlassCard } from "@/components/ui/glass-card";
import { MeshBackground } from "@/components/ui/mesh-background";
import { SafeAreaView } from "@/components/ui/styled";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

type MetricType = "ph" | "moisture" | "temperature";

interface MetricConfig {
  id: MetricType;
  label: string;
  unit: string;
  color: string;
  accentBg: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  minY: number;
  maxY: number;
  data: { day: string; value: number; date: string }[];
  targetRange: string;
  statusLabel: string;
}

const METRICS_DATA: Record<MetricType, MetricConfig> = {
  ph: {
    id: "ph",
    label: "pH Tanah",
    unit: "pH",
    color: "#059669",
    accentBg: "rgba(16, 185, 129, 0.15)",
    icon: FlaskConical,
    minY: 5.5,
    maxY: 7.5,
    targetRange: "6.0 - 7.0 pH",
    statusLabel: "Netral Optimal",
    data: [
      { day: "Sen", value: 6.1, date: "5 Sep" },
      { day: "Sel", value: 6.3, date: "6 Sep" },
      { day: "Rab", value: 6.2, date: "7 Sep" },
      { day: "Kam", value: 6.5, date: "8 Sep" },
      { day: "Jum", value: 6.4, date: "9 Sep" },
      { day: "Sab", value: 6.6, date: "10 Sep" },
      { day: "Min", value: 6.5, date: "11 Sep" },
    ],
  },
  moisture: {
    id: "moisture",
    label: "Kelembapan",
    unit: "%",
    color: "#0284C7",
    accentBg: "rgba(2, 132, 199, 0.15)",
    icon: Droplets,
    minY: 40,
    maxY: 90,
    targetRange: "60% - 75%",
    statusLabel: "Kadar Ideal",
    data: [
      { day: "Sen", value: 58, date: "5 Sep" },
      { day: "Sel", value: 62, date: "6 Sep" },
      { day: "Rab", value: 60, date: "7 Sep" },
      { day: "Kam", value: 68, date: "8 Sep" },
      { day: "Jum", value: 65, date: "9 Sep" },
      { day: "Sab", value: 72, date: "10 Sep" },
      { day: "Min", value: 68, date: "11 Sep" },
    ],
  },
  temperature: {
    id: "temperature",
    label: "Suhu Tanah",
    unit: "°C",
    color: "#D97706",
    accentBg: "rgba(217, 119, 6, 0.15)",
    icon: Thermometer,
    minY: 20,
    maxY: 32,
    targetRange: "24°C - 28°C",
    statusLabel: "Suhu Normal",
    data: [
      { day: "Sen", value: 28.2, date: "5 Sep" },
      { day: "Sel", value: 27.5, date: "6 Sep" },
      { day: "Rab", value: 26.8, date: "7 Sep" },
      { day: "Kam", value: 25.4, date: "8 Sep" },
      { day: "Jum", value: 26.0, date: "9 Sep" },
      { day: "Sab", value: 27.1, date: "10 Sep" },
      { day: "Min", value: 26.4, date: "11 Sep" },
    ],
  },
};

const RECOMMENDED_CROPS = [
  {
    name: "Cabai Rawit",
    latin: "Capsicum frutescens",
    compatibility: 96,
    badge: "Sangat Cocok",
    badgeColor:
      "text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-700",
    cycle: "75 - 85 Hari",
    waterNeed: "Sedang",
    reason:
      "Toleransi optimal pada pH 6.0-6.8 dan kelembapan tanah 60-70%. Kondisi saat ini memicu diferensiasi bunga lebat.",
  },
  {
    name: "Tomat Cherry",
    latin: "Solanum lycopersicum var. cerasiforme",
    compatibility: 93,
    badge: "Sangat Cocok",
    badgeColor:
      "text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-700",
    cycle: "60 - 70 Hari",
    waterNeed: "Tinggi",
    reason:
      "Kandungan kalium dan drainase tanah yang terukur mencegah keretakan buah (blossom end rot).",
  },
  {
    name: "Jagung Manis",
    latin: "Zea mays saccharata",
    compatibility: 89,
    badge: "Cocok",
    badgeColor:
      "text-teal-700 dark:text-teal-300 bg-teal-100 dark:bg-teal-950/50 border-teal-300 dark:border-teal-700",
    cycle: "70 - 75 Hari",
    waterNeed: "Sedang",
    reason:
      "Struktur tanah yang remah dengan pasokan nitrogen stabil mendukung pengisian tongkol sempurna.",
  },
  {
    name: "Selada Keriting Hijau",
    latin: "Lactuca sativa",
    compatibility: 85,
    badge: "Cocok",
    badgeColor:
      "text-teal-700 dark:text-teal-300 bg-teal-100 dark:bg-teal-950/50 border-teal-300 dark:border-teal-700",
    cycle: "35 - 45 Hari",
    waterNeed: "Tinggi",
    reason:
      "Suhu perakaran di kisaran 26°C mencegah tanaman mengalami pembungaan dini (bolting).",
  },
];

const SOIL_QUALITY_PARAMS = [
  {
    label: "Bahan Organik (BO)",
    value: "4.6%",
    status: "Sangat Baik",
    score: 92,
    note: "Target > 3.0%",
  },
  {
    label: "Kapasitas Tukar Kation (KTK)",
    value: "23.4 meq",
    status: "Tinggi",
    score: 88,
    note: "Retensi hara optimal",
  },
  {
    label: "Nitrogen Tersedia (N)",
    value: "0.38%",
    status: "Optimal",
    score: 86,
    note: "Vegetatif subur",
  },
  {
    label: "Fosfor Tersedia (P₂O₅)",
    value: "24 ppm",
    status: "Sedang",
    score: 78,
    note: "Cukup untuk perakaran",
  },
  {
    label: "Kalium Dapat Dipertukarkan (K)",
    value: "0.62 meq",
    status: "Tinggi",
    score: 90,
    note: "Ketahanan penyakit",
  },
  {
    label: "Kepadatan Lindak (Bulk Density)",
    value: "1.18 g/cm³",
    status: "Gembur",
    score: 91,
    note: "Aerasi akar prima",
  },
];

function getControlPoint(
  current: { x: number; y: number },
  previous?: { x: number; y: number },
  next?: { x: number; y: number },
  reverse?: boolean,
) {
  const p = previous || current;
  const n = next || current;
  const smoothing = 0.2;
  const opposedLine = {
    length: Math.hypot(n.x - p.x, n.y - p.y),
    angle: Math.atan2(n.y - p.y, n.x - p.x),
  };
  const angle = opposedLine.angle + (reverse ? Math.PI : 0);
  const length = opposedLine.length * smoothing;
  return {
    x: current.x + Math.cos(angle) * length,
    y: current.y + Math.sin(angle) * length,
  };
}

function buildSmoothPath(points: { x: number; y: number }[]): string {
  if (!points.length) return "";
  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const cp1 = getControlPoint(points[i], points[i - 1], points[i + 1], false);
    const cp2 = getControlPoint(points[i + 1], points[i], points[i + 2], true);
    d += ` C ${cp1.x.toFixed(1)} ${cp1.y.toFixed(1)}, ${cp2.x.toFixed(1)} ${cp2.y.toFixed(1)}, ${points[i + 1].x.toFixed(1)} ${points[i + 1].y.toFixed(1)}`;
  }
  return d;
}

export default function AiScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const colors = Colors[isDark ? "dark" : "light"];

  const [activeMetric, setActiveMetric] = useState<MetricType>("ph");
  const [selectedPointIndex, setSelectedPointIndex] = useState<number>(6);
  const [chartWidth, setChartWidth] = useState<number>(
    Dimensions.get("window").width - 64,
  );

  const metric = METRICS_DATA[activeMetric];
  const MetricIcon = metric.icon;

  const chartHeight = 160;
  const paddingLeft = 32;
  const paddingRight = 20;
  const paddingTop = 24;
  const paddingBottom = 28;

  const usableWidth = Math.max(chartWidth - paddingLeft - paddingRight, 100);
  const usableHeight = chartHeight - paddingTop - paddingBottom;

  const points = metric.data.map((item, index) => {
    const x = paddingLeft + (index / (metric.data.length - 1)) * usableWidth;
    const clampedVal = Math.max(metric.minY, Math.min(metric.maxY, item.value));
    const normalizedY =
      (clampedVal - metric.minY) / (metric.maxY - metric.minY);
    const y = paddingTop + (1 - normalizedY) * usableHeight;
    return { x, y, data: item };
  });

  const linePath = buildSmoothPath(points);
  const areaPath = points.length
    ? `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${(chartHeight - paddingBottom).toFixed(1)} L ${points[0].x.toFixed(1)} ${(chartHeight - paddingBottom).toFixed(1)} Z`
    : "";

  const selectedPoint = points[selectedPointIndex] || points[points.length - 1];

  const handleLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 50) {
      setChartWidth(w);
    }
  };

  return (
    <View className="flex-1">
      <MeshBackground />

      <SafeAreaView className="flex-1" edges={["top", "left", "right"]}>
        <View className="flex-row items-center justify-between px-4 py-2">
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full border items-center justify-center bg-white/85 dark:bg-white/10 border-emerald-500/20 dark:border-white/15 active:opacity-70"
          >
            <ChevronLeft size={20} color={colors.text} />
          </Pressable>

          <View className="flex-1 ml-3">
            <Text className="text-xl font-extrabold tracking-tight text-emerald-950 dark:text-emerald-50">
              Diagnosa AI & Telemetri
            </Text>
            <Text className="text-xs text-emerald-800/70 dark:text-emerald-300/70">
              Analisis Komprehensif Lahan Cerdas
            </Text>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerClassName="px-4 pt-2 pb-24 max-w-[500px] self-center w-full gap-4"
        >
          

          <GlassCard
            glowColor="#10B981"
            contentClassName="p-4 rounded-[22px] gap-3"
          >
            <View className="flex-row items-center gap-2">
              <View className="w-8 h-8 rounded-xl items-center justify-center bg-emerald-100 dark:bg-emerald-950/60">
                <BrainCircuit size={18} color="#059669" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-extrabold text-emerald-950 dark:text-emerald-50">
                  Kesimpulan Hasil Data
                </Text>
                <Text className="text-[11px] text-emerald-800/70 dark:text-emerald-300/70">
                  Sintesis Diagnosa AI & Algoritma Agronomi
                </Text>
              </View>
              <View className="p-1 rounded-lg bg-emerald-500/10">
                <Sparkles size={16} color="#059669" />
              </View>
            </View>

            <Text className="text-xs text-emerald-950/80 dark:text-emerald-100/80 leading-relaxed">
              Berdasarkan agregasi 168 titik data sensor telemetri (pH,
              kelembapan, suhu) dan analisis citra daun, tanah perkebunan berada
              dalam kondisi{" "}
              <Text className="font-bold text-emerald-700 dark:text-emerald-300">
                Sangat Produktif
              </Text>
              . Penyangga kation tanah (buffering capacity) stabil pada pH 6.5,
              kelembapan mikro tanah terjaga konsisten tanpa indikasi genangan
              anoksik, serta tidak ditemukan jejak spora patogen busuk akar.
            </Text>

            <View className="flex-row flex-wrap gap-2 pt-1">
              <View className="flex-1 min-w-[120px] p-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5">
                <Text className="text-[10px] text-gray-500">
                  Status Biosfer
                </Text>
                <Text className="text-xs font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">
                  Mikroba Aktif
                </Text>
              </View>

              <View className="flex-1 min-w-[120px] p-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5">
                <Text className="text-[10px] text-gray-500">Retensi Air</Text>
                <Text className="text-xs font-bold text-emerald-950 dark:text-emerald-50 mt-0.5">
                  Optimal (68%)
                </Text>
              </View>

              <View className="flex-1 min-w-[120px] p-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5">
                <Text className="text-[10px] text-gray-500">
                  Tingkat Salinitas
                </Text>
                <Text className="text-xs font-bold text-emerald-950 dark:text-emerald-50 mt-0.5">
                  Rendah (Aman)
                </Text>
              </View>

              <View className="flex-1 min-w-[120px] p-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5">
                <Text className="text-[10px] text-gray-500">
                  Risiko Penyakit
                </Text>
                <Text className="text-xs font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">
                  Sangat Rendah (4%)
                </Text>
              </View>
            </View>
          </GlassCard>

          <GlassCard
            glowColor="#059669"
            contentClassName="p-4 rounded-[22px] gap-3"
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <View className="w-8 h-8 rounded-xl items-center justify-center bg-emerald-100 dark:bg-emerald-950/60">
                  <Award size={18} color="#059669" />
                </View>
                <View>
                  <Text className="text-base font-extrabold text-emerald-950 dark:text-emerald-50">
                    Kualitas Tanah
                  </Text>
                  <Text className="text-[11px] text-emerald-800/70 dark:text-emerald-300/70">
                    Indeks Kesuburan & Karakteristik Fisik-Kimia
                  </Text>
                </View>
              </View>

              <View className="items-end">
                <View className="flex-row items-baseline gap-0.5">
                  <Text className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    88
                  </Text>
                  <Text className="text-xs font-bold text-gray-400">/100</Text>
                </View>
                <Text className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300">
                  Sangat Subur
                </Text>
              </View>
            </View>

            <View className="gap-2 mt-1">
              {SOIL_QUALITY_PARAMS.map((param, i) => (
                <View
                  key={i}
                  className="p-2.5 rounded-xl bg-white/70 dark:bg-white/[0.03] border border-black/5 dark:border-white/5 gap-1.5"
                >
                  <View className="flex-row justify-between items-center">
                    <View className="flex-1 mr-2">
                      <Text className="text-xs font-bold text-emerald-950 dark:text-emerald-50">
                        {param.label}
                      </Text>
                      <Text className="text-[10px] text-gray-500">
                        {param.note}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-xs font-extrabold text-emerald-900 dark:text-emerald-100">
                        {param.value}
                      </Text>
                      <Text className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                        {param.status}
                      </Text>
                    </View>
                  </View>

                  <View className="w-full h-1.5 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
                    <View
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: `${param.score}%` }}
                    />
                  </View>
                </View>
              ))}
            </View>
          </GlassCard>

          <GlassCard
            glowColor="#10B981"
            contentClassName="p-4 rounded-[22px] gap-3"
          >
            <View className="flex-row items-center gap-2">
              <View className="w-8 h-8 rounded-xl items-center justify-center bg-emerald-100 dark:bg-emerald-950/60">
                <Sprout size={18} color="#059669" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-extrabold text-emerald-950 dark:text-emerald-50">
                  Tanaman yang Cocok Ditanam
                </Text>
                <Text className="text-[11px] text-emerald-800/70 dark:text-emerald-300/70">
                  Rekomendasi Berdasarkan Profil pH, Suhu, & Kelembapan
                </Text>
              </View>
            </View>

            <View className="gap-2.5 mt-1">
              {RECOMMENDED_CROPS.map((crop, i) => (
                <View
                  key={i}
                  className="p-3 rounded-2xl bg-white/70 dark:bg-white/[0.03] border border-black/5 dark:border-white/5 gap-2"
                >
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                      <Text className="text-sm font-bold text-emerald-950 dark:text-emerald-50">
                        {crop.name}
                      </Text>
                      <Text className="text-[11px] italic text-gray-500">
                        {crop.latin}
                      </Text>
                    </View>

                    <View
                      className={`px-2 py-0.5 rounded-full border ${crop.badgeColor}`}
                    >
                      <Text className="text-[10px] font-bold">
                        {crop.compatibility}% {crop.badge}
                      </Text>
                    </View>
                  </View>

                  <Text className="text-xs text-emerald-900/80 dark:text-emerald-200/80 leading-relaxed">
                    {crop.reason}
                  </Text>

                  <View className="flex-row items-center gap-3 pt-1 border-t border-black/5 dark:border-white/5">
                    <View className="flex-row items-center gap-1">
                      <Calendar size={11} color="#059669" />
                      <Text className="text-[11px] text-gray-600 dark:text-gray-300 font-medium">
                        Panen: {crop.cycle}
                      </Text>
                    </View>

                    <View className="flex-row items-center gap-1">
                      <Droplets size={11} color="#0284C7" />
                      <Text className="text-[11px] text-gray-600 dark:text-gray-300 font-medium">
                        Air: {crop.waterNeed}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </GlassCard>

          <GlassCard
            glowColor="#10B981"
            contentClassName="p-4 rounded-[22px] gap-3"
          >
            <View className="flex-row items-center gap-2">
              <View className="w-8 h-8 rounded-xl items-center justify-center bg-emerald-100 dark:bg-emerald-950/60">
                <Wrench size={18} color="#059669" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-extrabold text-emerald-950 dark:text-emerald-50">
                  Rekomendasi Perawatan Tanah
                </Text>
                <Text className="text-[11px] text-emerald-800/70 dark:text-emerald-300/70">
                  Instruksi Agronomi untuk Hasil Panen Maksimal
                </Text>
              </View>
            </View>

            <View className="gap-3 mt-1">
              <View className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-500/20 gap-1.5">
                <View className="flex-row items-center gap-1.5">
                  <Layers size={15} color="#059669" />
                  <Text className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                    1. Cara Menggemburkan (Aerasi Tanah)
                  </Text>
                </View>
                <Text className="text-xs text-emerald-950/80 dark:text-emerald-200/80 leading-relaxed pl-5">
                  Lakukan pendangiran ringan (dangir) sedalam 15 - 20 cm di
                  sekitar lingkar tajuk. Hindari pencangkulan terlalu dekat
                  dengan leher akar utama. Lakukan di pagi hari saat kelembapan
                  tanah berada di bawah 70% agar agregat tanah tidak memadat
                  kembali.
                </Text>
              </View>

              <View className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-500/20 gap-1.5">
                <View className="flex-row items-center gap-1.5">
                  <Sprout size={15} color="#059669" />
                  <Text className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                    2. Saran Pemupukan Berimbang
                  </Text>
                </View>
                <View className="gap-1 pl-5">
                  <Text className="text-xs text-emerald-950/80 dark:text-emerald-200/80 leading-relaxed">
                    • <Text className="font-semibold">Pupuk Organik:</Text>{" "}
                    Taburkan 1.5 - 2 kg kompos matang atau pupuk kascing per m²
                    untuk menjaga populasi cacing tanah dan mikroba dekomposer.
                  </Text>
                  <Text className="text-xs text-emerald-950/80 dark:text-emerald-200/80 leading-relaxed">
                    •{" "}
                    <Text className="font-semibold">
                      Pupuk Kimia (NPK 16-16-16):
                    </Text>{" "}
                    Aplikasi 5 - 7 gram per tanaman tiap 14 hari dengan metode
                    kocor (dilarutkan dalam 200 ml air) untuk serapan hara
                    instan.
                  </Text>
                  <Text className="text-xs text-emerald-950/80 dark:text-emerald-200/80 leading-relaxed">
                    •{" "}
                    <Text className="font-semibold">
                      Bio-fertilizer / PGPR:
                    </Text>{" "}
                    Semprotkan larutan Plant Growth-Promoting Rhizobacteria
                    sebulan sekali untuk melarutkan fosfat terikat.
                  </Text>
                </View>
              </View>

              <View className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-500/20 gap-1.5">
                <View className="flex-row items-center gap-1.5">
                  <Droplets size={15} color="#0284C7" />
                  <Text className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                    3. Pengaturan Drainase & Irigasi
                  </Text>
                </View>
                <Text className="text-xs text-emerald-950/80 dark:text-emerald-200/80 leading-relaxed pl-5">
                  Gunakan sistem irigasi tetes (drip) dengan debit 1.5 - 2 liter
                  per jam per titik. Pastikan kedalaman parit drainase minimal
                  20 cm di samping bedengan untuk mencegah akumulasi genangan
                  air saat hujan deras.
                </Text>
              </View>

              <View className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-500/20 gap-1.5">
                <View className="flex-row items-center gap-1.5">
                  <ShieldCheck size={15} color="#059669" />
                  <Text className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                    4. Pencegahan Jamur & Patogen Tanah
                  </Text>
                </View>
                <Text className="text-xs text-emerald-950/80 dark:text-emerald-200/80 leading-relaxed pl-5">
                  Inokulasikan jamur antagonis Trichoderma harzianum pada media
                  tanam setiap 30 hari sebagai biofungisida alami guna menangkal
                  serangan layu fusarium dan busuk pangkal batang
                  (Phytophthora).
                </Text>
              </View>
            </View>
          </GlassCard>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
