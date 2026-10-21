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
import { SafeAreaView } from "@/components/ui/styled";
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
        <Skeleton width="100%" height={42} borderRadius={14} />

        {/* Narrative text lines */}
        <View className="gap-2 pt-1">
          <Skeleton width="100%" height={12} borderRadius={4} />
          <Skeleton width="96%" height={12} borderRadius={4} />
          <Skeleton width="92%" height={12} borderRadius={4} />
          <Skeleton width="75%" height={12} borderRadius={4} />
        </View>

        {/* 5 Badges */}
        <View className="flex-row flex-wrap gap-2 pt-1">
          {[...Array(5)].map((_, i) => (
            <View
              key={i}
              className="flex-1 min-w-[120px] p-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 gap-1.5"
            >
              <Skeleton width={55} height={10} borderRadius={4} />
              <Skeleton width="80%" height={14} borderRadius={4} />
            </View>
          ))}
        </View>
      </GlassCard>

      {/* Skeleton Card 2: Kualitas Tanah */}
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
            <Skeleton width={50} height={26} borderRadius={6} />
            <Skeleton width={60} height={10} borderRadius={4} />
          </View>
        </View>

        {/* 6 Quality Parameters */}
        <View className="gap-2 mt-1">
          {[...Array(6)].map((_, i) => (
            <View
              key={i}
              className="p-2.5 rounded-xl bg-white/70 dark:bg-white/[0.03] border border-black/5 dark:border-white/5 gap-2"
            >
              <View className="flex-row justify-between items-center">
                <View className="gap-1 flex-1 mr-2">
                  <Skeleton width={130} height={12} borderRadius={4} />
                  <Skeleton width={90} height={9} borderRadius={3} />
                </View>
                <View className="items-end gap-1">
                  <Skeleton width={45} height={12} borderRadius={4} />
                  <Skeleton width={55} height={10} borderRadius={4} />
                </View>
              </View>
              <Skeleton width="100%" height={6} borderRadius={3} />
            </View>
          ))}
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
              <View className="flex-row justify-between items-start">
                <View className="gap-1 flex-1 mr-2">
                  <Skeleton width={110} height={15} borderRadius={4} />
                  <Skeleton width={80} height={10} borderRadius={3} />
                </View>
                <Skeleton width={90} height={20} borderRadius={10} />
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

  const loadAiData = useCallback(
    async (isManualRefresh = false) => {
      if (isManualRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setErrorMessage(null);

      try {
        const result = await fetchSoilAiAnalysis({
          ip: config.apiServerIp,
          port: config.apiServerPort,
        });

        if (result) {
          setData(result);
          if (isManualRefresh) {
            toast.success("Diagnosa AI berhasil diperbarui!");
          }
        } else {
          setData(null);
          setErrorMessage("Belum ada data diagnosa AI dari server.");
          if (isManualRefresh) {
            toast.info("Belum ada data diagnosa dari server.");
          }
        }
      } catch (err: any) {
        console.error("AI Fetch error:", err);
        setErrorMessage(err?.message || "Gagal menghubungi API server.");
        if (isManualRefresh) {
          toast.error("Gagal memuat diagnosa: " + (err?.message || ""));
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [config.apiServerIp, config.apiServerPort, toast],
  );

  useEffect(() => {
    loadAiData();
  }, [loadAiData]);

  const onRefresh = () => {
    loadAiData(true);
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

          <Pressable
            onPress={onRefresh}
            disabled={isLoading || isRefreshing}
            className="w-10 h-10 rounded-full border items-center justify-center bg-white/85 dark:bg-white/10 border-emerald-500/20 dark:border-white/15 active:opacity-70"
          >
            {isRefreshing ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <RefreshCw size={18} color={colors.primary} />
            )}
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerClassName="px-4 pt-2 pb-24 max-w-[500px] self-center w-full gap-4"
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        >
          {/* While Loading: Show Skeleton Instead of Default Dummy Data */}
          {isLoading ? (
            <AiScreenSkeleton />
          ) : !data ? (
            /* Empty / Not Found State */
            <GlassCard
              glowColor="#10B981"
              contentClassName="p-6 rounded-[24px] items-center text-center gap-3"
            >
              <View className="w-14 h-14 rounded-2xl items-center justify-center bg-emerald-100 dark:bg-emerald-950/60 mt-2">
                <AlertCircle size={28} color="#059669" />
              </View>

              <Text className="text-lg font-extrabold text-emerald-950 dark:text-emerald-50 text-center">
                Belum Ada Hasil Diagnosa AI
              </Text>

              <Text className="text-xs text-gray-600 dark:text-gray-300 text-center leading-relaxed max-w-[320px]">
                {errorMessage ||
                  "Sistem belum menemukan hasil analisis tanah. Pastikan kamera telah mengambil foto tanah terbaru untuk mendiagnosa kondisi lahan."}
              </Text>

              <View className="flex-row gap-3 w-full mt-2">
                <Pressable
                  onPress={() => loadAiData(true)}
                  className="flex-1 py-3 rounded-2xl border border-black/10 dark:border-white/20 bg-white/80 dark:bg-white/10 items-center flex-row justify-center gap-2 active:opacity-70"
                >
                  <RotateCcw size={16} color={colors.text} />
                  <Text className="text-xs font-bold text-emerald-950 dark:text-emerald-50">
                    Coba Lagi
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => router.push("/camera")}
                  className="flex-[1.2] py-3 rounded-2xl bg-emerald-600 items-center flex-row justify-center gap-2 shadow-sm active:opacity-85"
                >
                  <Camera size={16} color="#FFFFFF" />
                  <Text className="text-xs font-bold text-white">
                    Ambil Foto
                  </Text>
                </Pressable>
              </View>
            </GlassCard>
          ) : (
            /* Render Live AI Diagnosed Data */
            <>
              {/* Card 1: Kesimpulan Hasil Data & Klasifikasi Tanah */}
              <GlassCard
                glowColor="#10B981"
                contentClassName="p-4 rounded-[22px] gap-3"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2 flex-1 mr-2">
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
                  </View>

                  <View className="flex-row items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <Sparkles size={14} color="#059669" />
                    <Text className="text-[11px] font-bold text-emerald-800 dark:text-emerald-200">
                      AI Ready
                    </Text>
                  </View>
                </View>

                {/* Highlight Klasifikasi Tanah */}
                <View className="flex-row items-center gap-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <Layers size={16} color="#059669" />
                  <View className="flex-1 flex-row items-baseline justify-between">
                    <Text className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                      Klasifikasi Tanah:
                    </Text>
                    <Text className="text-sm font-extrabold text-emerald-800 dark:text-emerald-200">
                      Tanah {data.soilType}
                    </Text>
                  </View>
                </View>

                <Text className="text-xs text-emerald-950/80 dark:text-emerald-100/80 leading-relaxed">
                  {data.kesimpulan}
                </Text>

                {/* Badges Grid */}
                <View className="flex-row flex-wrap gap-2 pt-1">
                  <View className="flex-1 min-w-[120px] p-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5">
                    <Text className="text-[10px] text-gray-500">
                      Klasifikasi
                    </Text>
                    <Text className="text-xs font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">
                      {data.soilType}
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

                  <View className="flex-1 min-w-[120px] p-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5">
                    <Text className="text-[10px] text-gray-500">
                      Tingkat Salinitas
                    </Text>
                    <Text className="text-xs font-bold text-emerald-950 dark:text-emerald-50 mt-0.5">
                      {data.tingkatSalinitas}
                    </Text>
                  </View>

                  <View className="flex-1 min-w-[120px] p-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5">
                    <Text className="text-[10px] text-gray-500">
                      Risiko Penyakit
                    </Text>
                    <Text className="text-xs font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">
                      {data.risikoPenyakit}
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
                  {(data.tanamanCocok || []).map((crop, i) => (
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
