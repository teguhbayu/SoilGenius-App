import { SafeAreaView } from "@/components/ui/styled";
import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import {
  ArrowRight,
  BrainCircuit,
  Camera as CameraIcon,
  CheckCircle2,
  ChevronLeft,
  Cpu,
  Database,
  FlipHorizontal,
  History,
  Image as ImageIcon,
  RotateCcw,
  Scan,
  Sparkles,
  Zap,
  ZapOff,
} from "lucide-react-native";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { GlassCard } from "@/components/ui/glass-card";
import { MeshBackground } from "@/components/ui/mesh-background";
import { Skeleton } from "@/components/ui/skeleton";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useSettings } from "@/hooks/use-settings";
import { useToast } from "@/hooks/use-toast";
import { uploadSoilPhoto } from "@/services/soil-data";

const { width: screenWidth } = Dimensions.get("window");

async function uriToBase64(uri: string): Promise<string> {
  if (uri.startsWith("data:image/")) return uri;

  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (result) {
          resolve(result);
        } else {
          reject(new Error("Gagal mengonversi foto"));
        }
      };
      reader.onerror = () => reject(new Error("Gagal membaca foto"));
      reader.readAsDataURL(blob);
    });
  } catch (e: any) {
    throw new Error("Gagal memproses foto: " + (e?.message || ""));
  }
}

export default function CameraScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const colors = Colors[isDark ? "dark" : "light"];
  const { config } = useSettings();
  const toast = useToast();

  const [facing, setFacing] = useState<CameraType>("back");
  const [torch, setTorch] = useState<boolean>(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [capturedBase64, setCapturedBase64] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const cameraRef = useRef<CameraView>(null);

  const toggleFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const toggleTorch = () => {
    setTorch((current) => !current);
  };

  const handleTakePicture = async () => {
    if (cameraRef.current && !isCapturing) {
      try {
        setIsCapturing(true);
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.85,
          skipProcessing: false,
          base64: true,
        });
        if (photo?.uri) {
          setCapturedPhoto(photo.uri);
          setCapturedBase64(
            photo.base64 ? `data:image/jpeg;base64,${photo.base64}` : null
          );
          toast.success("Foto berhasil diambil!");
        }
      } catch (err: any) {
        console.error("Failed to take picture:", err);
        toast.error("Gagal mengambil foto: " + (err?.message || ""));
      } finally {
        setIsCapturing(false);
      }
    }
  };

  const handleSimulateCapture = () => {
    setCapturedPhoto(
      "https://images.unsplash.com/photo-1530968033775-2c92736b131e?w=800&auto=format&fit=crop&q=80",
    );
    setCapturedBase64(null);
    toast.info("Menggunakan simulasi foto tanaman");
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.85,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setCapturedPhoto(asset.uri);
        setCapturedBase64(
          asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : null,
        );
        toast.success("Foto tanah berhasil dipilih dari galeri!");
      }
    } catch (err: any) {
      console.error("Failed to pick image:", err);
      toast.error("Gagal memilih foto: " + (err?.message || ""));
    }
  };

  const handleRetake = () => {
    setCapturedPhoto(null);
    setCapturedBase64(null);
  };

  const handleUploadAndAnalyze = async () => {
    if (!capturedPhoto || isUploading) return;

    try {
      setIsUploading(true);
      let base64ToSend = capturedBase64;
      if (!base64ToSend) {
        base64ToSend = await uriToBase64(capturedPhoto);
      }

      await uploadSoilPhoto(base64ToSend, {
        ip: config.apiServerIp,
        port: config.apiServerPort,
      });

      toast.success("Foto berhasil diunggah! Membuka Diagnosa AI...");
      router.push("/ai");
    } catch (err: any) {
      console.error("Failed to upload photo:", err);
      toast.error(err?.message || "Gagal mengunggah foto ke server");
    } finally {
      setIsUploading(false);
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
            <Text className="text-lg font-extrabold tracking-tight text-emerald-950 dark:text-emerald-50">
              Kamera Cerdas IoT
            </Text>
            <Text className="text-xs text-emerald-800/70 dark:text-emerald-300/70">
              Foto Tanaman untuk Diagnosa
            </Text>
          </View>

          <Pressable
            onPress={handlePickImage}
            className="flex-row items-center gap-1.5 py-1.5 px-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 active:opacity-70"
          >
            <ImageIcon size={14} color="#059669" />
            <Text className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
              Galeri
            </Text>
          </Pressable>
        </View>

        {capturedPhoto ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerClassName="px-4 pt-2 pb-24 max-w-[500px] self-center w-full gap-4"
          >
            <GlassCard
              glowColor="#10B981"
              borderColor="rgba(16, 185, 129, 0.4)"
              contentClassName="p-4 rounded-[20px] gap-3"
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-1.5">
                  <CheckCircle2 size={16} color="#059669" />
                  <Text className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                    Foto Berhasil Dipilih
                  </Text>
                </View>
                <Text className="text-[11px] text-gray-500">
                  Kualitas Tinggi (HD)
                </Text>
              </View>

              <View className="w-full h-72 rounded-2xl overflow-hidden bg-black">
                <Image
                  source={{ uri: capturedPhoto }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              </View>

              <View className="flex-row gap-2.5">
                <Pressable
                  onPress={handleRetake}
                  className="flex-1 flex-row items-center justify-center gap-1.5 py-3 rounded-2xl border border-black/10 dark:border-white/20 bg-white/90 dark:bg-white/10 active:opacity-70"
                >
                  <RotateCcw size={16} color={colors.text} />
                  <Text className="text-xs font-semibold text-emerald-950 dark:text-emerald-50">
                    Foto Ulang
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handlePickImage}
                  className="flex-1 flex-row items-center justify-center gap-1.5 py-3 rounded-2xl border border-emerald-500/30 bg-white/90 dark:bg-white/10 active:opacity-70"
                >
                  <ImageIcon size={16} color={colors.primary} />
                  <Text className="text-xs font-semibold text-emerald-950 dark:text-emerald-50">
                    Ganti Galeri
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handleUploadAndAnalyze}
                  disabled={isUploading}
                  className="flex-[1.4] flex-row items-center justify-center gap-1.5 py-3 rounded-2xl bg-emerald-600 shadow-sm active:opacity-85"
                >
                  {isUploading ? (
                    <>
                      <ActivityIndicator size="small" color="#FFFFFF" />
                      <Text className="text-xs font-bold text-white">
                        Mengunggah...
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text className="text-xs font-bold text-white">
                        Siap Analisis
                      </Text>
                      <ArrowRight size={16} color="#FFFFFF" />
                    </>
                  )}
                </Pressable>
              </View>
            </GlassCard>

            <GlassCard
              glowColor="#10B981"
              borderColor="rgba(16, 185, 129, 0.35)"
              contentClassName="p-4 rounded-[20px] gap-3"
            >
              <View className="flex-row items-center gap-2">
                <Sparkles size={18} color="#059669" />
                <Text className="text-base font-bold text-emerald-950 dark:text-emerald-50">
                  Alur Proses Analisis Lanjutan
                </Text>
              </View>
              <Text className="text-xs text-emerald-800/70 dark:text-emerald-300/70 leading-relaxed">
                Halaman ini siap dihubungkan dengan modul pengolahan citra dan
                kecerdasan buatan:
              </Text>

              <View className="gap-3 mt-2">
                <View className="flex-row gap-3 items-start">
                  <View className="w-7 h-7 rounded-full items-center justify-center bg-emerald-600 mt-0.5">
                    <CheckCircle2 size={14} color="#FFFFFF" />
                  </View>
                  <View className="flex-1 gap-0.5">
                    <Text className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                      1. Ambil Foto Tanaman (Aktif)
                    </Text>
                    <Text className="text-[11px] text-gray-500 leading-snug">
                      Menangkap detail tekstur dan warna daun melalui kamera
                      perangkat.
                    </Text>
                  </View>
                </View>

                <View className="flex-row gap-3 items-start">
                  <View className="w-7 h-7 rounded-full items-center justify-center bg-slate-200 dark:bg-emerald-950 mt-0.5">
                    <Cpu size={14} color={isDark ? "#34D399" : "#64748B"} />
                  </View>
                  <View className="flex-1 gap-0.5">
                    <Text className="text-xs font-bold text-emerald-950 dark:text-emerald-50">
                      2. Computer Vision (CV Preprocessing)
                    </Text>
                    <Text className="text-[11px] text-gray-500 leading-snug">
                      Segmentasi daun, deteksi bercak penyakit, dan normalisasi
                      warna citra.
                    </Text>
                  </View>
                </View>

                <View className="flex-row gap-3 items-start">
                  <View className="w-7 h-7 rounded-full items-center justify-center bg-slate-200 dark:bg-emerald-950 mt-0.5">
                    <Database
                      size={14}
                      color={isDark ? "#34D399" : "#64748B"}
                    />
                  </View>
                  <View className="flex-1 gap-0.5">
                    <Text className="text-xs font-bold text-emerald-950 dark:text-emerald-50">
                      3. Simpan ke Database
                    </Text>
                    <Text className="text-[11px] text-gray-500 leading-snug">
                      Penyimpanan metadata & foto ke cloud/local database IoT.
                    </Text>
                  </View>
                </View>

                <View className="flex-row gap-3 items-start">
                  <View className="w-7 h-7 rounded-full items-center justify-center bg-slate-200 dark:bg-emerald-950 mt-0.5">
                    <History size={14} color={isDark ? "#34D399" : "#64748B"} />
                  </View>
                  <View className="flex-1 gap-0.5">
                    <Text className="text-xs font-bold text-emerald-950 dark:text-emerald-50">
                      4. Tarik Historis Data Sensor
                    </Text>
                    <Text className="text-[11px] text-gray-500 leading-snug">
                      Menggabungkan rekaman pH, suhu, dan kelembapan dari modul
                      ESP32.
                    </Text>
                  </View>
                </View>

                <View className="flex-row gap-3 items-start">
                  <View className="w-7 h-7 rounded-full items-center justify-center bg-slate-200 dark:bg-emerald-950 mt-0.5">
                    <BrainCircuit
                      size={14}
                      color={isDark ? "#34D399" : "#64748B"}
                    />
                  </View>
                  <View className="flex-1 gap-0.5">
                    <Text className="text-xs font-bold text-emerald-950 dark:text-emerald-50">
                      5. Kirim ke LLM (Diagnosa AI)
                    </Text>
                    <Text className="text-[11px] text-gray-500 leading-snug">
                      Analisis gabungan foto + telemetri untuk rekomendasi
                      tindakan petani.
                    </Text>
                  </View>
                </View>
              </View>
            </GlassCard>
          </ScrollView>
        ) : (
          <View className="flex-1 px-4 pb-20 max-w-[500px] self-center w-full">
            {!permission ? (
              <View className="flex-1 py-4">
                <GlassCard
                  glowColor="#10B981"
                  borderColor="rgba(16, 185, 129, 0.3)"
                  contentClassName="p-5 rounded-[28px] flex-1 justify-between items-center"
                >
                  <View className="w-full flex-row justify-between items-center">
                    <Skeleton width={40} height={40} borderRadius={20} />
                    <Skeleton width={120} height={28} borderRadius={14} />
                    <Skeleton width={40} height={40} borderRadius={20} />
                  </View>

                  <View className="items-center gap-3">
                    <Skeleton width={80} height={80} borderRadius={40} />
                    <Skeleton width={180} height={14} borderRadius={6} />
                  </View>

                  <View className="w-full flex-row justify-around items-center pb-2">
                    <Skeleton width={44} height={44} borderRadius={22} />
                    <Skeleton width={72} height={72} borderRadius={36} />
                    <Skeleton width={44} height={44} borderRadius={22} />
                  </View>
                </GlassCard>
              </View>
            ) : !permission.granted ? (
              <View className="flex-1 items-center justify-center">
                <GlassCard
                  glowColor="#10B981"
                  borderColor="rgba(16, 185, 129, 0.45)"
                  contentClassName="p-6 rounded-[24px] items-center text-center gap-3 max-w-[360px] w-full"
                >
                  <View className="w-16 h-16 rounded-full items-center justify-center bg-emerald-100 dark:bg-emerald-900/30">
                    <CameraIcon size={32} color={colors.primary} />
                  </View>
                  <Text className="text-xl font-extrabold text-emerald-950 dark:text-emerald-50 text-center">
                    Akses Kamera Diperlukan
                  </Text>
                  <Text className="text-xs text-gray-600 dark:text-gray-400 text-center leading-relaxed">
                    Aplikasi membutuhkan izin kamera untuk memotret daun dan
                    tanah agar sistem dapat menganalisis kesehatan tanaman.
                  </Text>

                  <Pressable
                    onPress={requestPermission}
                    className="w-full py-3.5 rounded-2xl bg-emerald-600 items-center mt-2 active:opacity-85"
                  >
                    <Text className="text-white font-bold text-sm">
                      Izinkan Akses Kamera
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={handlePickImage}
                    className="w-full py-3.5 rounded-2xl bg-white/90 dark:bg-white/10 border border-emerald-500/30 items-center flex-row justify-center gap-2 mt-2 active:opacity-70"
                  >
                    <ImageIcon size={18} color={colors.primary} />
                    <Text className="text-xs font-bold text-emerald-950 dark:text-emerald-50">
                      Pilih Foto dari Galeri
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={handleSimulateCapture}
                    className="py-2 active:opacity-70"
                  >
                    <Text className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 underline">
                      Gunakan Simulasi Foto Tanaman
                    </Text>
                  </Pressable>
                </GlassCard>
              </View>
            ) : (
              <View className="flex-1 relative">
                <View
                  pointerEvents="none"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    borderRadius: 28,
                    boxShadow: [
                      {
                        offsetX: 0,
                        offsetY: 0,
                        blurRadius: 18,
                        spreadDistance: 1,
                        color: "rgba(16, 185, 129, 0.18)",
                      },
                      {
                        offsetX: 0,
                        offsetY: 0,
                        blurRadius: 45,
                        spreadDistance: 4,
                        color: "rgba(16, 185, 129, 0.08)",
                      },
                    ] as any,
                  }}
                />
                <View className="flex-1 rounded-[28px] overflow-hidden bg-black relative border-[1.5px] border-emerald-500/30">
                  <CameraView
                    ref={cameraRef}
                    style={{ flex: 1, justifyContent: "space-between" }}
                    facing={facing}
                    enableTorch={torch}
                  >
                    <View
                      className="absolute inset-0 items-center justify-center"
                      pointerEvents="none"
                    >
                      <View
                        style={{
                          width: Math.min(screenWidth * 0.7, 260),
                          height: Math.min(screenWidth * 0.7, 260),
                        }}
                        className="relative items-center justify-center"
                      >
                        <View className="absolute top-0 left-0 w-8 h-8 border-t-[3px] border-l-[3px] border-emerald-400 rounded-tl-xl" />
                        <View className="absolute top-0 right-0 w-8 h-8 border-t-[3px] border-r-[3px] border-emerald-400 rounded-tr-xl" />
                        <View className="absolute bottom-0 left-0 w-8 h-8 border-b-[3px] border-l-[3px] border-emerald-400 rounded-bl-xl" />
                        <View className="absolute bottom-0 right-0 w-8 h-8 border-b-[3px] border-r-[3px] border-emerald-400 rounded-br-xl" />

                        <View className="flex-row items-center gap-1.5 py-1 px-3 rounded-full bg-black/70 border border-emerald-400/40">
                          <Scan size={14} color="#34D399" />
                          <Text className="text-[11px] font-semibold text-white">
                            Arahkan ke Tanah
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View className="flex-row justify-between p-4">
                      <Pressable
                        onPress={toggleTorch}
                        className={`w-11 h-11 rounded-full items-center justify-center border border-white/25 active:opacity-70 ${
                          torch ? "bg-amber-500/50" : "bg-black/50"
                        }`}
                      >
                        {torch ? (
                          <Zap size={20} color="#FBBF24" />
                        ) : (
                          <ZapOff size={20} color="#FFFFFF" />
                        )}
                      </Pressable>

                      <Pressable
                        onPress={toggleFacing}
                        className="w-11 h-11 rounded-full items-center justify-center bg-black/50 border border-white/25 active:opacity-70"
                      >
                        <FlipHorizontal size={20} color="#FFFFFF" />
                      </Pressable>
                    </View>

                    <View className="p-4 items-center justify-center">
                      <View className="flex-row items-center justify-between w-full max-w-[280px]">
                        <Pressable
                          onPress={handleSimulateCapture}
                          className="w-11 h-11 rounded-full items-center justify-center bg-black/50 border border-white/25 active:opacity-70"
                        >
                          <Sparkles size={18} color="#34D399" />
                        </Pressable>

                        <Pressable
                          onPress={handleTakePicture}
                          disabled={isCapturing}
                          className="w-[74px] h-[74px] rounded-full border-4 border-emerald-400 bg-white/30 items-center justify-center active:scale-95"
                        >
                          <View className="w-14 h-14 rounded-full bg-white items-center justify-center shadow-md">
                            <CameraIcon size={26} color="#059669" />
                          </View>
                        </Pressable>

                        <Pressable
                          onPress={handlePickImage}
                          className="w-11 h-11 rounded-full items-center justify-center bg-black/50 border border-white/25 active:opacity-70"
                        >
                          <ImageIcon size={18} color="#FFFFFF" />
                        </Pressable>
                      </View>
                    </View>
                  </CameraView>
                </View>
              </View>
            )}
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}
