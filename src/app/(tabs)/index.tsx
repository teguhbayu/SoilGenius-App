import { Image, SafeAreaView } from "@/components/ui/styled";
import { useRouter } from "expo-router";
import {
  Calendar,
  Camera,
  ChevronRight,
  Droplets,
  Flame,
  FlaskConical,
  RefreshCw,
  Settings,
  Snowflake,
  Sparkles,
  Thermometer,
  TrendingUp,
  Wifi,
  WifiOff,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Dimensions,
  LayoutChangeEvent,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";

import { GlassCard } from "@/components/ui/glass-card";
import { MeshBackground } from "@/components/ui/mesh-background";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useSettings } from "@/hooks/use-settings";
import { useSoilData } from "@/hooks/use-soil-data";
import { MetricConfig, MetricType } from "@/types/soil";
import Svg, {
  Circle,
  Defs,
  Line,
  Path,
  Stop,
  LinearGradient as SvgLinearGradient,
  Text as SvgText,
} from "react-native-svg";
type PresetType = "normal" | "hot_dry" | "cold_acid" | "alkaline_wet";

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

export default function DashboardScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const { config } = useSettings();
  const [activeMetric, setActiveMetric] = useState<MetricType>("ph");
  const [selectedPointIndex, setSelectedPointIndex] = useState<number>(6);
  const [chartWidth, setChartWidth] = useState<number>(
    Dimensions.get("window").width - 64,
  );
  const isDark = scheme === "dark";
  const colors = Colors[isDark ? "dark" : "light"];

  const {
    metricsData,
    currentRecord,
    isConnected,
    isRefreshing,
    lastUpdated,
    refresh,
  } = useSoilData({
    ip: config.apiServerIp,
    port: config.apiServerPort,
    limit: 7,
    pollIntervalMs: 10000,
    baseConfigs: METRICS_DATA,
  });

  const metric = metricsData[activeMetric];
  const MetricIcon = metric.icon;
  const [activePreset, setActivePreset] = useState<PresetType>("normal");

  const phValue = currentRecord?.ph ?? 6.8;
  const tempValue = currentRecord?.tempC ?? 32.5;
  const moistureValue = currentRecord?.moisture ?? 31;

  React.useEffect(() => {
    if (metric.data.length > 0) {
      setSelectedPointIndex(metric.data.length - 1);
    }
  }, [activeMetric, metric.data]);

  const chartHeight = 160;
  const paddingLeft = 32;
  const paddingRight = 20;
  const paddingTop = 24;
  const paddingBottom = 28;

  const usableWidth = Math.max(chartWidth - paddingLeft - paddingRight, 100);
  const usableHeight = chartHeight - paddingTop - paddingBottom;

  const points = metric.data.map((item, index) => {
    const divisor = Math.max(metric.data.length - 1, 1);
    const x = paddingLeft + (index / divisor) * usableWidth;
    const clampedVal = Math.max(metric.minY, Math.min(metric.maxY, item.value));
    const range = Math.max(metric.maxY - metric.minY, 0.0001);
    const normalizedY = (clampedVal - metric.minY) / range;
    const y = paddingTop + (1 - normalizedY) * usableHeight;
    return { x, y, data: item };
  });

  const linePath = buildSmoothPath(points);
  const areaPath = points.length
    ? `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${(chartHeight - paddingBottom).toFixed(1)} L ${points[0].x.toFixed(1)} ${(chartHeight - paddingBottom).toFixed(1)} Z`
    : "";

  const selectedPoint =
    points[selectedPointIndex] ||
    points[points.length - 1] || {
      x: 0,
      y: 0,
      data: { day: "-", value: 0, date: "-" },
    };

  const handleLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 50) {
      setChartWidth(w);
    }
  };

  const onRefresh = () => {
    refresh();
  };

  const getPhAccent = (ph: number) => {
    if (ph < 6.5) {
      return {
        label: "Asam",
        color: "#D97706",
        bgClass: "bg-amber-100 dark:bg-amber-500/20",
        textClass: "text-amber-700 dark:text-amber-300",
        border: "rgba(245, 158, 11, 0.35)",
      };
    }
    if (ph <= 7.5) {
      return {
        label: "Netral",
        color: "#059669",
        bgClass: "bg-emerald-100 dark:bg-emerald-500/20",
        textClass: "text-emerald-700 dark:text-emerald-300",
        border: "rgba(16, 185, 129, 0.35)",
      };
    }
    return {
      label: "Basa",
      color: "#7C3AED",
      bgClass: "bg-purple-100 dark:bg-purple-500/20",
      textClass: "text-purple-700 dark:text-purple-300",
      border: "rgba(139, 92, 246, 0.35)",
    };
  };

  const getTempAccent = (t: number) => {
    if (t > 32) {
      return {
        label: "Panas",
        color: "#DC2626",
        bgClass: "bg-red-100 dark:bg-red-500/20",
        textClass: "text-red-700 dark:text-red-300",
        valueClass: "text-red-600 dark:text-red-400",
        border: "rgba(239, 68, 68, 0.35)",
        icon: Flame,
      };
    }
    if (t >= 22) {
      return {
        label: "Normal",
        color: "#059669",
        bgClass: "bg-emerald-100 dark:bg-emerald-500/20",
        textClass: "text-emerald-700 dark:text-emerald-300",
        valueClass: "text-emerald-700 dark:text-emerald-300",
        border: "rgba(16, 185, 129, 0.35)",
        icon: Thermometer,
      };
    }
    return {
      label: "Dingin",
      color: "#2563EB",
      bgClass: "bg-blue-100 dark:bg-blue-500/20",
      textClass: "text-blue-700 dark:text-blue-300",
      valueClass: "text-blue-600 dark:text-blue-400",
      border: "rgba(59, 130, 246, 0.35)",
      icon: Snowflake,
    };
  };

  const getMoistureAccent = (m: number) => {
    if (m < 40) {
      return {
        label: "Kering",
        color: "#D97706",
        bgClass: "bg-amber-100 dark:bg-amber-500/20",
        textClass: "text-amber-700 dark:text-amber-300",
        border: "rgba(245, 158, 11, 0.35)",
      };
    }
    if (m <= 80) {
      return {
        label: "Optimal",
        color: "#0284C7",
        bgClass: "bg-sky-100 dark:bg-sky-500/20",
        textClass: "text-sky-700 dark:text-sky-300",
        border: "rgba(2, 132, 199, 0.35)",
      };
    }
    return {
      label: "Basah",
      color: "#4F46E5",
      bgClass: "bg-indigo-100 dark:bg-indigo-500/20",
      textClass: "text-indigo-700 dark:text-indigo-300",
      border: "rgba(79, 70, 229, 0.35)",
    };
  };

  const phAccent = getPhAccent(phValue);
  const tempAccent = getTempAccent(tempValue);
  const moistureAccent = getMoistureAccent(moistureValue);
  const TempIcon = tempAccent.icon;

  return (
    <View className="flex-1">
      <MeshBackground />

      <SafeAreaView className="flex-1" edges={["top", "left", "right"]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          className="flex-1"
          contentContainerClassName="px-4 pt-2 pb-24 max-w-[500px] self-center w-full gap-4"
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        >
          <View className="flex-row justify-between items-center py-1">
            <View className="flex-1 gap-2 flex-row items-center">
              <View className="w-8 h-8 aspect-square p-1.5 rounded-xl overflow-hidden bg-white/90 shadow-xs items-center justify-center">
                <Image
                  source={require("@/assets/images/soilgenius.png")}
                  className="w-full h-full"
                  contentFit="cover"
                />
              </View>
              <Text className="text-2xl font-extrabold tracking-tight text-emerald-700 dark:text-emerald-50">
                SoilGenius
              </Text>
            </View>

            <View className="flex-row items-center gap-2">
              <Pressable
                onPress={() => router.push("/settings")}
                className="flex-row items-center gap-1.5 px-3 h-10 rounded-full border-[1.5px] bg-white/90 dark:bg-white/10 border-emerald-500/25 dark:border-emerald-400/30 active:opacity-70"
              >
                {isConnected ? (
                  <Wifi size={15} color={isDark ? "#34D399" : "#059669"} />
                ) : (
                  <WifiOff size={15} color="#DC2626" />
                )}
                <View
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? "bg-emerald-500" : "bg-red-500"
                  }`}
                />
                <Text
                  className={`text-xs font-bold ${
                    isConnected
                      ? "text-emerald-800 dark:text-emerald-200"
                      : "text-red-700 dark:text-red-300"
                  }`}
                >
                  {isConnected ? "Online" : "Offline"}
                </Text>
              </Pressable>

              <Pressable
                onPress={onRefresh}
                className="w-10 h-10 rounded-full border-[1.5px] items-center justify-center bg-white/90 dark:bg-white/10 border-emerald-500/25 dark:border-emerald-400/30 active:opacity-70"
              >
                <RefreshCw size={18} color={colors.primary} />
              </Pressable>
            </View>
          </View>

          <View className="flex-row flex-wrap gap-3">
            <View className="w-full flex-grow">
              <GlassCard
                borderColor={phAccent.border}
                glowColor={phAccent.color}
                contentClassName="p-3.5 rounded-[20px] min-h-[124px] justify-between"
              >
                <View className="flex-row justify-between items-center">
                  <View
                    className={`w-7 h-7 rounded-[10px] items-center justify-center ${phAccent.bgClass}`}
                  >
                    <FlaskConical size={16} color={phAccent.color} />
                  </View>
                  <View
                    className={`px-2 py-0.5 rounded-lg ${phAccent.bgClass}`}
                  >
                    <Text
                      className={`text-[11px] font-extrabold ${phAccent.textClass}`}
                    >
                      {phAccent.label}
                    </Text>
                  </View>
                </View>

                <Text className="text-[13px] font-semibold text-emerald-900/70 dark:text-emerald-200/70 mt-1.5">
                  pH Tanah
                </Text>

                <View className="flex-row items-baseline gap-1 mt-0.5">
                  <Text className="text-3xl font-extrabold tracking-tight leading-9 text-emerald-950 dark:text-emerald-50">
                    {phValue.toFixed(1)}
                  </Text>
                  <Text className={`text-sm font-bold ${phAccent.textClass}`}>
                    pH
                  </Text>
                </View>
              </GlassCard>
            </View>

            <View className="w-[48%] flex-grow">
              <GlassCard
                borderColor={tempAccent.border}
                glowColor={tempAccent.color}
                contentClassName="p-3.5 rounded-[20px] min-h-[124px] justify-between"
              >
                <View className="flex-row justify-between items-center">
                  <View
                    className={`w-7 h-7 rounded-[10px] items-center justify-center ${tempAccent.bgClass}`}
                  >
                    <TempIcon size={16} color={tempAccent.color} />
                  </View>
                  <View
                    className={`px-2 py-0.5 rounded-lg ${tempAccent.bgClass}`}
                  >
                    <Text
                      className={`text-[11px] font-extrabold ${tempAccent.textClass}`}
                    >
                      {tempAccent.label}
                    </Text>
                  </View>
                </View>

                <Text className="text-[13px] font-semibold text-emerald-900/70 dark:text-emerald-200/70 mt-1.5">
                  Suhu
                </Text>

                <View className="flex-row items-baseline gap-1 mt-0.5">
                  <Text
                    className={`text-3xl font-extrabold tracking-tight leading-9 ${tempAccent.valueClass}`}
                  >
                    {tempValue.toFixed(1)}
                  </Text>
                  <Text className={`text-sm font-bold ${tempAccent.textClass}`}>
                    °C
                  </Text>
                </View>
              </GlassCard>
            </View>

            <View className="w-[48%] flex-grow">
              <GlassCard
                borderColor={moistureAccent.border}
                glowColor={moistureAccent.color}
                contentClassName="p-3.5 rounded-[20px] min-h-[124px] justify-between"
              >
                <View className="flex-row justify-between items-center">
                  <View
                    className={`w-7 h-7 rounded-[10px] items-center justify-center ${moistureAccent.bgClass}`}
                  >
                    <Droplets size={16} color={moistureAccent.color} />
                  </View>
                  <View
                    className={`px-2 py-0.5 rounded-lg ${moistureAccent.bgClass}`}
                  >
                    <Text
                      className={`text-[11px] font-extrabold ${moistureAccent.textClass}`}
                    >
                      {moistureAccent.label}
                    </Text>
                  </View>
                </View>

                <Text className="text-[13px] font-semibold text-emerald-900/70 dark:text-emerald-200/70 mt-1.5">
                  Soil Moisture
                </Text>

                <View className="flex-row items-baseline gap-1 mt-0.5">
                  <Text className="text-3xl font-extrabold tracking-tight leading-9 text-emerald-950 dark:text-emerald-50">
                    {moistureValue}
                  </Text>
                  <Text
                    className={`text-sm font-bold ${moistureAccent.textClass}`}
                  >
                    %
                  </Text>
                </View>
              </GlassCard>
            </View>
          </View>
          <Pressable
            onPress={() => router.push("/ai")}
            className="flex-1 active:scale-[0.98]"
          >
            <View className="p-2.5 rounded-[18px] flex-row justify-center items-center gap-2 bg-green-700 text-white">
              <Sparkles className="text-white" color={"#fff"} strokeWidth={2} />
              <View className="">
                <Text className="text-xl font-semibold text-white dark:text-emerald-50">
                  Analisa AI
                </Text>
              </View>
            </View>
          </Pressable>

          <View className="flex-row gap-2.5 mt-1.5">
            <Pressable
              onPress={() => router.push("/camera")}
              className="flex-1 active:scale-[0.98]"
            >
              <GlassCard
                glowColor="#10B981"
                borderColor="rgba(16, 185, 129, 0.45)"
                contentClassName="p-2.5 rounded-[18px] flex-row items-center gap-2"
              >
                <View className="w-8 h-8 rounded-[10px] items-center justify-center bg-emerald-600 shadow-sm shadow-emerald-600/40">
                  <Camera size={18} color="#FFFFFF" />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-bold text-emerald-950 dark:text-emerald-50">
                    Buka Kamera
                  </Text>
                  <Text className="text-[10px] text-emerald-800/70 dark:text-emerald-300/70">
                    Foto Tanah
                  </Text>
                </View>
                <ChevronRight size={16} color="#059669" />
              </GlassCard>
            </Pressable>

            <Pressable
              onPress={() => router.push("/settings")}
              className="flex-1 active:scale-[0.98]"
            >
              <GlassCard
                glowColor="#34D399"
                borderColor="rgba(16, 185, 129, 0.3)"
                contentClassName="p-2.5 rounded-[18px] flex-row items-center gap-2"
              >
                <View className="w-8 h-8 rounded-[10px] items-center justify-center bg-emerald-100 dark:bg-emerald-950/60">
                  <Settings size={18} color={isDark ? "#34D399" : "#059669"} />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-bold text-emerald-950 dark:text-emerald-50">
                    Pengaturan
                  </Text>
                  <Text className="text-[10px] text-emerald-800/70 dark:text-emerald-300/70">
                    Atur Wifi
                  </Text>
                </View>
                <ChevronRight size={16} color="#059669" />
              </GlassCard>
            </Pressable>
          </View>
          <GlassCard
            glowColor={metric.color}
            contentClassName="p-4 rounded-[22px] gap-3"
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <View
                  className="w-8 h-8 rounded-xl items-center justify-center"
                  style={{ backgroundColor: metric.accentBg }}
                >
                  <MetricIcon size={18} color={metric.color} />
                </View>
                <View>
                  <Text className="text-sm font-extrabold text-emerald-950 dark:text-emerald-50">
                    Tren Historis Tanah ({metric.data.length} Titik Data)
                  </Text>
                  <Text className="text-[11px] text-emerald-800/70 dark:text-emerald-300/70">
                    Rentang Target: {metric.targetRange}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center gap-1 bg-emerald-100 dark:bg-emerald-950/40 px-2 py-0.5 rounded-lg">
                <TrendingUp size={12} color="#059669" />
                <Text className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                  {metric.statusLabel}
                </Text>
              </View>
            </View>

            <View className="flex-row gap-1.5 p-1 rounded-xl bg-black/[0.03] dark:bg-white/[0.04]">
              {(["ph", "moisture", "temperature"] as MetricType[]).map(
                (type) => {
                  const conf = metricsData[type];
                  const isActive = activeMetric === type;
                  return (
                    <Pressable
                      key={type}
                      onPress={() => {
                        setActiveMetric(type);
                        setSelectedPointIndex(
                          Math.max(conf.data.length - 1, 0)
                        );
                      }}
                      className={`flex-1 py-1.5 rounded-lg items-center justify-center flex-row gap-1.5 ${
                        isActive
                          ? "bg-white dark:bg-white/20 shadow-sm"
                          : "active:opacity-70"
                      }`}
                    >
                      <conf.icon
                        size={13}
                        color={
                          isActive ? conf.color : isDark ? "#9CA3AF" : "#64748B"
                        }
                      />
                      <Text
                        className={`text-[11px] font-bold ${
                          isActive
                            ? "text-emerald-950 dark:text-emerald-50"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {conf.label.split(" ")[0]}
                      </Text>
                    </Pressable>
                  );
                },
              )}
            </View>

            <View className="p-2.5 rounded-xl border border-emerald-500/20 bg-white/60 dark:bg-white/[0.04] flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Calendar size={14} color="#059669" />
                <Text className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                  {selectedPoint.data.day} ({selectedPoint.data.date}):
                </Text>
                <Text className="text-sm font-extrabold text-emerald-950 dark:text-emerald-50">
                  {selectedPoint.data.value} {metric.unit}
                </Text>
              </View>
              <Text className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                Ketuk titik grafik
              </Text>
            </View>

            <View onLayout={handleLayout} className="w-full h-40 mt-1">
              <Svg width={chartWidth} height={chartHeight}>
                <Defs>
                  <SvgLinearGradient
                    id="chartGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <Stop
                      offset="0%"
                      stopColor={metric.color}
                      stopOpacity={0.35}
                    />
                    <Stop
                      offset="50%"
                      stopColor={metric.color}
                      stopOpacity={0.12}
                    />
                    <Stop
                      offset="100%"
                      stopColor={metric.color}
                      stopOpacity={0}
                    />
                  </SvgLinearGradient>
                </Defs>

                {[0.25, 0.5, 0.75].map((fraction) => {
                  const yPos = paddingTop + fraction * usableHeight;
                  return (
                    <Line
                      key={fraction}
                      x1={paddingLeft}
                      y1={yPos}
                      x2={chartWidth - paddingRight}
                      y2={yPos}
                      stroke={
                        isDark
                          ? "rgba(255, 255, 255, 0.08)"
                          : "rgba(0, 0, 0, 0.06)"
                      }
                      strokeDasharray="4 4"
                      strokeWidth={1}
                    />
                  );
                })}

                <SvgText
                  x={paddingLeft - 6}
                  y={paddingTop + 4}
                  fill={isDark ? "#9CA3AF" : "#64748B"}
                  fontSize="9"
                  fontWeight="600"
                  textAnchor="end"
                >
                  {metric.maxY}
                </SvgText>

                <SvgText
                  x={paddingLeft - 6}
                  y={chartHeight - paddingBottom + 2}
                  fill={isDark ? "#9CA3AF" : "#64748B"}
                  fontSize="9"
                  fontWeight="600"
                  textAnchor="end"
                >
                  {metric.minY}
                </SvgText>

                {areaPath !== "" && (
                  <Path d={areaPath} fill="url(#chartGradient)" />
                )}

                {linePath !== "" && (
                  <Path
                    d={linePath}
                    fill="none"
                    stroke={metric.color}
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {points.map((pt, idx) => {
                  const isSelected = idx === selectedPointIndex;
                  return (
                    <React.Fragment key={idx}>
                      {isSelected && (
                        <Circle
                          cx={pt.x}
                          cy={pt.y}
                          r={8}
                          fill={metric.color}
                          fillOpacity={0.25}
                        />
                      )}
                      <Circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isSelected ? 4.5 : 3}
                        fill={isSelected ? "#FFFFFF" : metric.color}
                        stroke={metric.color}
                        strokeWidth={isSelected ? 2.5 : 1.5}
                        onPress={() => setSelectedPointIndex(idx)}
                      />
                      <SvgText
                        x={pt.x}
                        y={chartHeight - 8}
                        fill={
                          isSelected
                            ? isDark
                              ? "#34D399"
                              : "#059669"
                            : isDark
                              ? "#9CA3AF"
                              : "#64748B"
                        }
                        fontSize="10"
                        fontWeight={isSelected ? "800" : "500"}
                        textAnchor="middle"
                      >
                        {pt.data.day}
                      </SvgText>
                    </React.Fragment>
                  );
                })}
              </Svg>
            </View>

            <View className="flex-row justify-between items-center pt-2 border-t border-black/5 dark:border-white/5">
              <View>
                <Text className="text-[10px] text-gray-500">
                  Nilai Rata-rata
                </Text>
                <Text className="text-xs font-bold text-emerald-950 dark:text-emerald-50">
                  {(
                    metric.data.reduce((acc, curr) => acc + curr.value, 0) /
                    Math.max(metric.data.length, 1)
                  ).toFixed(1)}{" "}
                  {metric.unit}
                </Text>
              </View>

              <View>
                <Text className="text-[10px] text-gray-500">
                  Stabilitas Parameter
                </Text>
                <Text className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  98.2% (Konsisten)
                </Text>
              </View>

              <View>
                <Text className="text-[10px] text-gray-500">
                  Pembaruan Terakhir
                </Text>
                <Text className="text-xs font-bold text-emerald-950 dark:text-emerald-50">
                  {lastUpdated}
                </Text>
              </View>
            </View>
          </GlassCard>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
