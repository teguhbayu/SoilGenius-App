import { SafeAreaView } from "@/components/ui/styled";
import { useRouter } from "expo-router";
import {
  Camera,
  ChevronRight,
  Droplets,
  Flame,
  FlaskConical,
  RefreshCw,
  Settings,
  Snowflake,
  Thermometer,
  Wifi,
} from "lucide-react-native";
import { useState } from "react";
import {
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

type PresetType = "normal" | "hot_dry" | "cold_acid" | "alkaline_wet";

export default function DashboardScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const colors = Colors[isDark ? "dark" : "light"];

  const [refreshing, setRefreshing] = useState(false);
  const [activePreset, setActivePreset] = useState<PresetType>("normal");

  const [phValue, setPhValue] = useState<number>(6.8);
  const [tempValue, setTempValue] = useState<number>(27.5);
  const [moistureValue, setMoistureValue] = useState<number>(68);

  const applyPreset = (preset: PresetType) => {
    setActivePreset(preset);
    if (preset === "normal") {
      setPhValue(6.8);
      setTempValue(27.5);
      setMoistureValue(68);
    } else if (preset === "hot_dry") {
      setPhValue(6.2);
      setTempValue(35.5);
      setMoistureValue(26);
    } else if (preset === "cold_acid") {
      setPhValue(5.3);
      setTempValue(17.8);
      setMoistureValue(52);
    } else if (preset === "alkaline_wet") {
      setPhValue(8.4);
      setTempValue(25.0);
      setMoistureValue(92);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 600);
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
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        >
          <View className="flex-row justify-between items-center py-1">
            <View className="flex-1 gap-0.5">
              <Text className="text-2xl font-extrabold tracking-tight text-emerald-950 dark:text-emerald-50">
                Sampling Tanah
              </Text>
            </View>

            <Pressable
              onPress={onRefresh}
              className="w-10 h-10 rounded-full border-[1.5px] items-center justify-center bg-white/90 dark:bg-white/10 border-emerald-500/25 dark:border-emerald-400/30 active:opacity-70"
            >
              <RefreshCw size={18} color={colors.primary} />
            </Pressable>
          </View>

          <View className="flex-row flex-wrap gap-3">
            <View className="w-[48%] flex-grow">
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

            <View className="w-[48%] flex-grow">
              <GlassCard
                borderColor="rgba(16, 185, 129, 0.35)"
                glowColor="#10B981"
                contentClassName="p-3.5 rounded-[20px] min-h-[124px] justify-between"
              >
                <View className="flex-row justify-between items-center">
                  <View className="w-7 h-7 rounded-[10px] items-center justify-center bg-emerald-100 dark:bg-emerald-500/20">
                    <Wifi size={16} color="#059669" />
                  </View>
                  <View className="px-2 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-500/20">
                    <Text className="text-[11px] font-extrabold text-emerald-700 dark:text-emerald-300">
                      Kuat
                    </Text>
                  </View>
                </View>

                <Text className="text-[13px] font-semibold text-emerald-900/70 dark:text-emerald-200/70 mt-1.5">
                  Sinyal WiFi
                </Text>

                <View className="flex-row items-baseline gap-1 mt-0.5">
                  <Text className="text-3xl font-extrabold tracking-tight leading-9 text-emerald-950 dark:text-emerald-50">
                    -58
                  </Text>
                  <Text className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                    dBm
                  </Text>
                </View>
              </GlassCard>
            </View>
          </View>

          <View className="gap-2 mt-1">
            <Text className="text-[11px] font-bold tracking-wider text-emerald-900/70 dark:text-emerald-300/70">
              SIMULASI STATUS:
            </Text>
            <View className="flex-row flex-wrap gap-1.5">
              <Pressable
                onPress={() => applyPreset("normal")}
                className={`py-1.5 px-3 rounded-xl border ${
                  activePreset === "normal"
                    ? "bg-emerald-600 border-emerald-500 shadow-sm"
                    : "bg-white/60 dark:bg-white/10 border-emerald-500/20 dark:border-white/10"
                }`}
              >
                <Text
                  className={`text-[11px] font-semibold ${
                    activePreset === "normal"
                      ? "text-white font-bold"
                      : "text-emerald-900 dark:text-emerald-200"
                  }`}
                >
                  Normal (Hijau)
                </Text>
              </Pressable>

              <Pressable
                onPress={() => applyPreset("hot_dry")}
                className={`py-1.5 px-3 rounded-xl border ${
                  activePreset === "hot_dry"
                    ? "bg-red-600 border-red-500 shadow-sm"
                    : "bg-white/60 dark:bg-white/10 border-red-500/20 dark:border-white/10"
                }`}
              >
                <Text
                  className={`text-[11px] font-semibold ${
                    activePreset === "hot_dry"
                      ? "text-white font-bold"
                      : "text-emerald-900 dark:text-emerald-200"
                  }`}
                >
                  Panas (Merah)
                </Text>
              </Pressable>

              <Pressable
                onPress={() => applyPreset("cold_acid")}
                className={`py-1.5 px-3 rounded-xl border ${
                  activePreset === "cold_acid"
                    ? "bg-blue-600 border-blue-500 shadow-sm"
                    : "bg-white/60 dark:bg-white/10 border-blue-500/20 dark:border-white/10"
                }`}
              >
                <Text
                  className={`text-[11px] font-semibold ${
                    activePreset === "cold_acid"
                      ? "text-white font-bold"
                      : "text-emerald-900 dark:text-emerald-200"
                  }`}
                >
                  Dingin (Biru)
                </Text>
              </Pressable>

              <Pressable
                onPress={() => applyPreset("alkaline_wet")}
                className={`py-1.5 px-3 rounded-xl border ${
                  activePreset === "alkaline_wet"
                    ? "bg-purple-600 border-purple-500 shadow-sm"
                    : "bg-white/60 dark:bg-white/10 border-purple-500/20 dark:border-white/10"
                }`}
              >
                <Text
                  className={`text-[11px] font-semibold ${
                    activePreset === "alkaline_wet"
                      ? "text-white font-bold"
                      : "text-emerald-900 dark:text-emerald-200"
                  }`}
                >
                  Basa (Ungu)
                </Text>
              </Pressable>
            </View>
          </View>

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
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
