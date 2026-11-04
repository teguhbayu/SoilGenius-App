import { useRouter } from "expo-router";
import {
  AlertCircle,
  Award,
  BrainCircuit,
  Calendar,
  Camera,
  ChevronLeft,
  Droplets,
  Layers,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Sprout,
  Wrench,
} from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";

import { GlassCard } from "@/components/ui/glass-card";
import { MeshBackground } from "@/components/ui/mesh-background";
import { Skeleton } from "@/components/ui/skeleton";
import { Image, SafeAreaView } from "@/components/ui/styled";
import { getCropImage } from "@/constants/plants";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useSettings } from "@/hooks/use-settings";
import { useToast } from "@/hooks/use-toast";
import { fetchSoilAiAnalysis } from "@/services/soil-data";
import { SoilAiAnalysis } from "@/types/soil";

function getCategoryIcon(category: string) {
  switch (category?.toLowerCase()) {
    case "aerasi":
      return <Layers size={15} color="#059669" />;
    case "pemupukan":
      return <Sprout size={15} color="#059669" />;
    case "drainase":
      return <Droplets size={15} color="#0284C7" />;
    case "patogen":
      return <ShieldCheck size={15} color="#059669" />;
    default:
      return <Wrench size={15} color="#059669" />;
  }
}

function getCropBadgeStyle(compatibility: number, badgeColor?: string) {
  if (badgeColor) return badgeColor;
  if (compatibility >= 90) {
    return "text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-700";
  }
  return "text-teal-700 dark:text-teal-300 bg-teal-100 dark:bg-teal-950/50 border-teal-300 dark:border-teal-700";
}

function AiScreenSkeleton() {
  return (
    <View className="gap-4">
      {/* Banner Status Analisis Sedang Berlangsung */}
      <GlassCard
        glowColor="#059669"
        borderColor="rgba(5, 150, 105, 0.35)"
        contentClassName="p-4 rounded-[22px] flex-row items-center gap-3 bg-emerald-500/10 dark:bg-emerald-500/15"
      >
        <ActivityIndicator size="small" color="#059669" />
        <View className="flex-1">
          <Text className="text-xs font-bold text-emerald-950 dark:text-emerald-50">
            Sistem Pakar AI Sedang Menganalisis...
          </Text>
          <Text className="text-[10px] text-emerald-800/80 dark:text-emerald-300/80 mt-0.5 leading-relaxed">
            Mengevaluasi telemetri tanah & visual foto tanaman. Proses ini dapat memakan waktu hingga 2 menit, mohon tunggu...
          </Text>
        </View>
      </GlassCard>

      {/* Skeleton Card 1: Kesimpulan & Klasifikasi */}
      <GlassCard
        glowColor="#10B981"
        contentClassName="p-4 rounded-[22px] gap-3"
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2 flex-1">
            <Skeleton width={32} height={32} borderRadius={12} />
            <View className="gap-1.5 flex-1">
              <Skeleton width="60%" height={16} borderRadius={6} />
              <Skeleton width="40%" height={10} borderRadius={4} />
            </View>
          </View>
          <Skeleton width={70} height={24} borderRadius={12} />
        </View>

        {/* Highlight Klasifikasi Tanah */}
        <Skeleton width="100%" height={56} borderRadius={14} />

        {/* Narrative text lines */}
        <View className="gap-2 pt-1">
          <Skeleton width="100%" height={12} borderRadius={4} />
          <Skeleton width="96%" height={12} borderRadius={4} />
          <Skeleton width="92%" height={12} borderRadius={4} />
          <Skeleton width="75%" height={12} borderRadius={4} />
        </View>

        {/* 2 Badges: Status Kualitas & Retensi Air (Matches actual Card 1) */}
        <View className="flex-row flex-wrap gap-2 pt-1 border-t border-black/5 dark:border-white/5">
          <View className="flex-1 min-w-[120px] p-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 gap-1.5">
            <Skeleton width={60} height={10} borderRadius={4} />
            <Skeleton width="75%" height={14} borderRadius={4} />
          </View>
          <View className="flex-1 min-w-[120px] p-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 gap-1.5">
            <Skeleton width={60} height={10} borderRadius={4} />
            <Skeleton width="70%" height={14} borderRadius={4} />
          </View>
        </View>
      </GlassCard>

      {/* Skeleton Card 2: Kualitas Tanah & Skor Dinamis (Matches actual Card 2) */}
      <GlassCard
        glowColor="#059669"
        contentClassName="p-4 rounded-[22px] gap-3"
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2 flex-1">
            <Skeleton width={32} height={32} borderRadius={12} />
            <View className="gap-1.5 flex-1">
              <Skeleton width="50%" height={16} borderRadius={6} />
              <Skeleton width="65%" height={10} borderRadius={4} />
            </View>
          </View>
          <View className="items-end gap-1">
            <Skeleton width={60} height={28} borderRadius={6} />
            <Skeleton width={50} height={10} borderRadius={4} />
          </View>
        </View>
      </GlassCard>

      {/* Skeleton Card 3: Tanaman yang Cocok */}
      <GlassCard
        glowColor="#10B981"
        contentClassName="p-4 rounded-[22px] gap-3"
      >
        <View className="flex-row items-center gap-2">
          <Skeleton width={32} height={32} borderRadius={12} />
          <View className="gap-1.5 flex-1">
            <Skeleton width="55%" height={16} borderRadius={6} />
            <Skeleton width="70%" height={10} borderRadius={4} />
          </View>
        </View>

        <View className="gap-2.5 mt-1">
          {[...Array(3)].map((_, i) => (
            <View
              key={i}
              className="p-3 rounded-2xl bg-white/70 dark:bg-white/[0.03] border border-black/5 dark:border-white/5 gap-2.5"
            >
              <View className="flex-row items-center gap-3">
                <Skeleton width={56} height={56} borderRadius={12} />
                <View className="flex-1">
                  <View className="flex-row justify-between items-start">
                    <View className="gap-1 flex-1 mr-2">
                      <Skeleton width={110} height={15} borderRadius={4} />
                      <Skeleton width={80} height={10} borderRadius={3} />
                    </View>
                    <Skeleton width={80} height={20} borderRadius={10} />
                  </View>
                </View>
              </View>
              <View className="gap-1.5">
                <Skeleton width="100%" height={11} borderRadius={3} />
                <Skeleton width="90%" height={11} borderRadius={3} />
              </View>
              <View className="flex-row gap-4 pt-1 border-t border-black/5 dark:border-white/5">
                <Skeleton width={80} height={12} borderRadius={4} />
                <Skeleton width={70} height={12} borderRadius={4} />
              </View>
            </View>
          ))}
        </View>
      </GlassCard>

      {/* Skeleton Card 4: Rekomendasi Perawatan */}
      <GlassCard
        glowColor="#10B981"
        contentClassName="p-4 rounded-[22px] gap-3"
      >
        <View className="flex-row items-center gap-2">
          <Skeleton width={32} height={32} borderRadius={12} />
          <View className="gap-1.5 flex-1">
            <Skeleton width="60%" height={16} borderRadius={6} />
            <Skeleton width="50%" height={10} borderRadius={4} />
          </View>
        </View>

        <View className="gap-3 mt-1">
          {[...Array(4)].map((_, i) => (
            <View
              key={i}
              className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-500/20 gap-2"
            >
              <View className="flex-row items-center gap-2">
                <Skeleton width={16} height={16} borderRadius={4} />
                <Skeleton width="55%" height={13} borderRadius={4} />
              </View>
              <View className="gap-1.5 pl-6">
                <Skeleton width="100%" height={11} borderRadius={3} />
                <Skeleton width="92%" height={11} borderRadius={3} />
                <Skeleton width="75%" height={11} borderRadius={3} />
              </View>
            </View>
          ))}
        </View>
      </GlassCard>
    </View>
  );
}

export default function AiScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const colors = Colors[isDark ? "dark" : "light"];
  const { config } = useSettings();
  const toast = useToast();

  const [data, setData] = useState<SoilAiAnalysis | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isMountedRef = React.useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadAiData = useCallback(
    async (isManualRefresh = false) => {
      if (isManualRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setErrorMessage(null);

      // Allow up to 3 attempts with progressive delay if analysis is currently in progress
      const maxAttempts = 3;
      let attempt = 0;
      let lastErr: any = null;

      while (attempt < maxAttempts) {
        if (!isMountedRef.current) return;
        attempt++;

        try {
          const result = await fetchSoilAiAnalysis({
            ip: config.apiServerIp,
            port: config.apiServerPort,
            timeoutMs: 150000,
          });

          if (!isMountedRef.current) return;

          if (result) {
            setData(result);
            setErrorMessage(null);
            setIsLoading(false);
            setIsRefreshing(false);
            return;
          }
        } catch (err: any) {
          lastErr = err;
          console.warn(`[AI] Attempt ${attempt} failed:`, err?.message || err);
        }

        if (attempt < maxAttempts && isMountedRef.current) {
          await new Promise((resolve) => setTimeout(resolve, 3000));
        }
      }

      if (!isMountedRef.current) return;

      const msg =
        lastErr?.message ||
        "Belum ada data analisis AI. Ambil foto tanah terlebih dahulu pada menu Kamera.";
      setErrorMessage(msg);
      toast.error(msg);
      setIsLoading(false);
      setIsRefreshing(false);
    },
    [config.apiServerIp, config.apiServerPort, toast],
  );

  useEffect(() => {
    loadAiData();
  }, [loadAiData]);

  const onRefresh = useCallback(() => {
    loadAiData(true);
  }, [loadAiData]);

  return (
    <View className="flex-1 bg-surface-50 dark:bg-[#07130E]">
      <MeshBackground />

      <SafeAreaView className="flex-1" edges={["top", "left", "right"]}>
        {/* Header Bar */}
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-black/5 dark:border-white/5">
          <View className="flex-row items-center gap-2">
            <Pressable
              onPress={() => router.back()}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Kembali"
              className="w-9 h-9 rounded-full items-center justify-center bg-black/5 dark:bg-white/10 active:opacity-60"
            >
              <ChevronLeft size={20} color={colors.text} />
            </Pressable>

            <View className="flex-row items-center gap-2">
              <View className="w-8 h-8 rounded-xl items-center justify-center bg-emerald-500/15">
                <BrainCircuit size={18} color="#059669" />
              </View>
              <View>
                <Text className="text-base font-black text-emerald-950 dark:text-emerald-50">
                  AI Soil Analysis
                </Text>
                <Text className="text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold">
                  Sistem Pakar & Bio-Agronomi
                </Text>
              </View>
            </View>
          </View>

          <Pressable
            onPress={() => loadAiData(true)}
            disabled={isLoading || isRefreshing}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Refresh Analisis AI"
            className="w-9 h-9 rounded-full items-center justify-center bg-black/5 dark:bg-white/10 active:opacity-60"
          >
            {isRefreshing ? (
              <ActivityIndicator size="small" color="#059669" />
            ) : (
              <RefreshCw size={16} color={colors.text} />
            )}
          </Pressable>
        </View>

        <ScrollView
          className="flex-1 px-4"
          contentContainerStyle={{
            paddingTop: 16,
            paddingBottom: 40,
            gap: 16,
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor="#059669"
              colors={["#059669"]}
            />
          }
        >
          {isLoading ? (
            <AiScreenSkeleton />
          ) : errorMessage || !data ? (
            <View className="py-12 items-center gap-4">
              <GlassCard
                glowColor="#EF4444"
                contentClassName="p-6 rounded-[24px] items-center text-center gap-3"
              >
                <View className="w-14 h-14 rounded-2xl items-center justify-center bg-rose-50 dark:bg-rose-950/40">
                  <AlertCircle size={28} color="#EF4444" />
                </View>

                <Text className="text-base font-extrabold text-emerald-950 dark:text-emerald-50 text-center">
                  Data Analisis Belum Tersedia
                </Text>

                <Text className="text-xs text-gray-600 dark:text-gray-300 text-center leading-relaxed max-w-[280px]">
                  {errorMessage ||
                    "Ambil foto tanah dengan kamera SoilGenius untuk menjalankan sistem pakar AI."}
                </Text>

                <View className="flex-row gap-2.5 mt-2">
                  <Pressable
                    onPress={() => loadAiData(true)}
                    className="flex-row items-center gap-1.5 px-4 py-2.5 rounded-xl bg-black/5 dark:bg-white/10 active:opacity-70"
                  >
                    <RotateCcw size={14} color={colors.text} />
                    <Text className="text-xs font-bold text-gray-800 dark:text-gray-200">
                      Coba Lagi
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => router.push("/camera")}
                    className="flex-row items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 active:opacity-80"
                  >
                    <Camera size={14} color="#FFFFFF" />
                    <Text className="text-xs font-bold text-white">
                      Buka Kamera
                    </Text>
                  </Pressable>
                </View>
              </GlassCard>
            </View>
          ) : (
            <>
              {/* Card 1: Diagnosa & Kesimpulan Komprehensif */}
              <GlassCard
                glowColor="#10B981"
                contentClassName="p-4 rounded-[22px] gap-3.5"
              >
                {/* Header Card Diagnosa */}
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2">
                    <View className="w-8 h-8 rounded-xl items-center justify-center bg-emerald-100 dark:bg-emerald-950/60">
                      <Sparkles size={18} color="#059669" />
                    </View>
                    <View>
                      <Text className="text-base font-extrabold text-emerald-950 dark:text-emerald-50">
                        Diagnosa Kondisi Tanah
                      </Text>
                      <Text className="text-[11px] text-emerald-800/70 dark:text-emerald-300/70">
                        Analisis Telemetri & Citra Visual
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Highlight Klasifikasi Tanah */}
                <View className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex-row items-center justify-between">
                  <View>
                    <Text className="text-[10px] uppercase font-bold tracking-wider text-emerald-800 dark:text-emerald-200">
                      Klasifikasi Tanah
                    </Text>
                    <Text className="text-lg font-black text-emerald-950 dark:text-emerald-50">
                      Tanah {data.soilType}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-[10px] uppercase font-bold tracking-wider text-emerald-800 dark:text-emerald-200">
                      Indeks Kesuburan
                    </Text>
                    <Text className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                      {data.score}
                      <Text className="text-xs font-semibold text-gray-500">
                        /100
                      </Text>
                    </Text>
                  </View>
                </View>

                {/* Narasi Kesimpulan */}
                <View className="gap-1.5">
                  <Text className="text-xs font-bold text-emerald-950 dark:text-emerald-50">
                    Kesimpulan Agronomi:
                  </Text>
                  <Text className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                    {data.kesimpulan}
                  </Text>
                </View>

                {/* Badges Biosfer & Ekologi Tanah */}
                <View className="flex-row flex-wrap gap-2 pt-1 border-t border-black/5 dark:border-white/5">
                  <View className="flex-1 min-w-[120px] p-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5">
                    <Text className="text-[10px] text-gray-500">
                      Status Kualitas
                    </Text>
                    <Text className="text-xs font-bold text-emerald-800 dark:text-emerald-200 mt-0.5">
                      {data.statusKualitas}
                    </Text>
                  </View>

                  <View className="flex-1 min-w-[120px] p-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5">
                    <Text className="text-[10px] text-gray-500">
                      Retensi Air
                    </Text>
                    <Text className="text-xs font-bold text-emerald-950 dark:text-emerald-50 mt-0.5">
                      {data.retensiAir}
                    </Text>
                  </View>
                </View>
              </GlassCard>

              {/* Card 2: Kualitas Tanah & Skor Dinamis */}
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
                        Tipe: Tanah {data.soilType}
                      </Text>
                    </View>
                  </View>

                  <View className="items-end">
                    <View className="flex-row items-baseline gap-0.5">
                      <Text className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                        {data.score}
                      </Text>
                      <Text className="text-xs font-bold text-gray-400">
                        /100
                      </Text>
                    </View>
                    <Text className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300">
                      {data.statusKualitas}
                    </Text>
                  </View>
                </View>
              </GlassCard>

              {/* Card 3: Tanaman yang Cocok Ditanam */}
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
                      Rekomendasi Berdasarkan Profil Tanah {data.soilType}
                    </Text>
                  </View>
                </View>

                <View className="gap-2.5 mt-1">
                  {(data.tanamanCocok || []).map((crop, i) => {
                    const plantImgUri = getCropImage(
                      crop.category,
                      crop.name,
                      crop.image,
                    );
                    return (
                      <View
                        key={i}
                        className="p-3 rounded-2xl bg-white/70 dark:bg-white/[0.03] border border-black/5 dark:border-white/5 gap-2.5"
                      >
                        <View className="flex-row items-center gap-3">
                          <Image
                            source={{ uri: plantImgUri }}
                            contentFit="cover"
                            transition={200}
                            className="w-14 h-14 rounded-xl border border-black/5 dark:border-white/10 bg-emerald-100/50 dark:bg-emerald-950/40"
                          />
                          <View className="flex-1">
                            <View className="flex-row justify-between items-start gap-1">
                              <View className="flex-1 mr-1">
                                <Text
                                  className="text-sm font-bold text-emerald-950 dark:text-emerald-50"
                                  numberOfLines={1}
                                >
                                  {crop.name}
                                </Text>
                                <Text
                                  className="text-[11px] italic text-gray-500"
                                  numberOfLines={1}
                                >
                                  {crop.latin}
                                </Text>
                              </View>

                              <View
                                className={`px-2 py-0.5 rounded-full border ${getCropBadgeStyle(
                                  crop.compatibility,
                                  crop.badgeColor,
                                )}`}
                              >
                                <Text className="text-[10px] font-bold">
                                  {crop.compatibility}% {crop.badge}
                                </Text>
                              </View>
                            </View>
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
                    );
                  })}
                </View>
              </GlassCard>

              {/* Card 4: Rekomendasi Perawatan Tanah */}
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
                      Instruksi Agronomi untuk Tanah {data.soilType}
                    </Text>
                  </View>
                </View>

                <View className="gap-3 mt-1">
                  {(data.perawatanTanah || []).map((care, i) => (
                    <View
                      key={i}
                      className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-500/20 gap-1.5"
                    >
                      <View className="flex-row items-center gap-1.5">
                        {getCategoryIcon(care.category)}
                        <Text className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                          {care.title}
                        </Text>
                      </View>

                      <Text className="text-xs text-emerald-950/80 dark:text-emerald-200/80 leading-relaxed pl-5">
                        {care.description}
                      </Text>

                      {care.points && care.points.length > 0 && (
                        <View className="gap-1 pl-5 mt-1">
                          {care.points.map((pt, pIdx) => (
                            <Text
                              key={pIdx}
                              className="text-xs text-emerald-950/80 dark:text-emerald-200/80 leading-relaxed"
                            >
                              • {pt}
                            </Text>
                          ))}
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              </GlassCard>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
