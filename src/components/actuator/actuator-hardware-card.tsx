import React, { useState } from "react";
import {
  View,
  Text,
  Switch,
  Pressable,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  Droplets,
  Cpu,
  Clock,
  Play,
  Power,
  Zap,
  CheckCircle2,
  RefreshCw,
  Bluetooth,
  ShieldCheck,
  Wifi,
  Sliders,
  X,
} from "lucide-react-native";
import { GlassCard } from "@/components/ui/glass-card";
import { DeviceDto } from "@/types/device";
import { useColorScheme } from "@/hooks/use-color-scheme";

interface ActuatorHardwareCardProps {
  device: DeviceDto | null;
  onToggleRelay: (
    deviceId: string,
    relayKey: string,
    currentState: boolean,
    durationSeconds?: number,
  ) => Promise<void>;
  onOpenPump?: (deviceId: string, durationSeconds?: number) => Promise<void>;
  onClosePump?: (deviceId: string) => Promise<void>;
  onTriggerPulse: (
    deviceId: string,
    relayKey: string,
    pulseSeconds?: number,
  ) => Promise<void>;
  onOpenBlePairing?: () => void;
}

const DURATION_PRESETS = [
  { label: "10s", value: 10 },
  { label: "30s", value: 30 },
  { label: "1m", value: 60 },
  { label: "5m", value: 300 },
];

export function ActuatorHardwareCard({
  device,
  onToggleRelay,
  onOpenPump,
  onClosePump,
  onTriggerPulse,
  onOpenBlePairing,
}: ActuatorHardwareCardProps) {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const [selectedDuration, setSelectedDuration] = useState<number>(10);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState<boolean>(false);
  const [customSecondsInput, setCustomSecondsInput] = useState<string>("15");

  if (!device) {
    return (
      <GlassCard
        glowColor="#059669"
        borderColor={
          isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(16, 185, 129, 0.25)"
        }
        contentClassName="p-5 rounded-[26px] items-center text-center gap-3.5"
      >
        <View className="w-12 h-12 rounded-2xl items-center justify-center bg-emerald-500/15 border border-emerald-500/30">
          <Cpu size={24} color="#059669" />
        </View>

        <View className="items-center">
          <Text className="text-sm font-extrabold text-emerald-950 dark:text-emerald-50 text-center">
            Belum Ada Aktuator Terpasang
          </Text>
          <Text className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1 leading-relaxed max-w-[320px]">
            Pompa air 3.3V belum terhubung. Silakan pasangkan modul Actuator
            ESP32 melalui Bluetooth BLE untuk mengendalikan irigasi.
          </Text>
        </View>

        {onOpenBlePairing && (
          <Pressable
            onPress={onOpenBlePairing}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 flex-row items-center gap-2 active:opacity-85 shadow-sm mt-1"
          >
            <Bluetooth size={14} color="#FFFFFF" />
            <Text className="text-xs font-bold text-white">
              Pasangkan Aktuator (BLE)
            </Text>
          </Pressable>
        )}
      </GlassCard>
    );
  }

  const reportedState = device.reportedState || {};
  const desiredState = device.desiredState || {};

  // Single physical actuator: 3.3V DC Water Pump on GPIO 16
  const isReportedOn = Boolean(reportedState.water_pump);
  const isDesiredOn =
    desiredState.water_pump !== undefined
      ? Boolean(desiredState.water_pump)
      : isReportedOn;

  const isPendingAck = isDesiredOn !== isReportedOn;
  const remainingSeconds =
    typeof reportedState.remainingSeconds === "number"
      ? reportedState.remainingSeconds
      : 0;

  const formatRemaining = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleOpen = () => {
    if (onOpenPump) {
      onOpenPump(device.id, selectedDuration);
    } else {
      onToggleRelay(device.id, "water_pump", false, selectedDuration);
    }
  };

  const handleClose = () => {
    if (onClosePump) {
      onClosePump(device.id);
    } else {
      onToggleRelay(device.id, "water_pump", true, 0);
    }
  };

  return (
    <GlassCard
      glowColor="#10B981"
      borderColor={
        isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(16, 185, 129, 0.25)"
      }
      contentClassName="p-4 rounded-[26px] gap-3.5"
    >
      {/* Header */}
      <View className="flex-row items-center justify-between gap-2">
        <View className="flex-row items-center gap-2.5 flex-1 min-w-0">
          <View className="w-9 h-9 rounded-xl items-center justify-center bg-sky-500/15 border border-sky-500/30 shrink-0">
            <Droplets size={18} color="#0284C7" />
          </View>
          <View className="flex-1 min-w-0">
            <Text
              className="text-sm font-extrabold text-emerald-950 dark:text-emerald-50"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              Kendali Manual Pompa Air
            </Text>
            <Text
              className="text-[11px] text-emerald-800/70 dark:text-emerald-300/70"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {device.name || device.id} • ESP32
            </Text>
          </View>
        </View>
      </View>

      {/* Main Single Water Pump Card */}
      <View className="p-3.5 sm:p-4 rounded-2xl bg-white/60 dark:bg-white/[0.04] border border-black/5 dark:border-white/10 gap-3">
        {/* Top: Pump Identity & Master Switch */}
        <View className="flex-row items-center justify-between gap-2">
          <View className="flex-row items-center gap-2.5 flex-1 min-w-0 pr-1">
            <View
              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl items-center justify-center shrink-0 ${
                isReportedOn
                  ? "bg-sky-500/20 border border-sky-500/40 shadow-sm"
                  : "bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10"
              }`}
            >
              <Droplets
                size={20}
                color={
                  isReportedOn ? "#0284C7" : isDark ? "#9CA3AF" : "#6B7280"
                }
              />
            </View>

            <View className="flex-1 min-w-0">
              <View className="flex-row flex-wrap items-center gap-1.5">
                <Text
                  className="text-sm font-extrabold text-emerald-950 dark:text-emerald-100"
                  numberOfLines={1}
                >
                  Pompa Air / Relai
                </Text>
                <View
                  className={`px-1.5 py-0.5 rounded-full ${
                    isReportedOn
                      ? "bg-sky-500/20 border border-sky-500/30"
                      : "bg-black/5 dark:bg-white/10"
                  }`}
                >
                  <Text
                    className={`text-[9px] font-black ${
                      isReportedOn
                        ? "text-sky-700 dark:text-sky-300"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {isReportedOn ? "ON" : "OFF"}
                  </Text>
                </View>
              </View>

              <Text
                className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                ESP32 GPIO Pin 15 • Relai Aktuator
              </Text>
            </View>
          </View>

          {/* Toggle Switch */}
          <View className="items-end gap-0.5 shrink-0">
            <Switch
              value={isDesiredOn}
              onValueChange={() => {
                onToggleRelay(
                  device.id,
                  "water_pump",
                  isReportedOn,
                  selectedDuration,
                );
              }}
              trackColor={{
                false: isDark ? "#374151" : "#D1D5DB",
                true: "#0284C7",
              }}
              thumbColor="#FFFFFF"
            />
            <Text className="text-[9px] font-bold text-gray-400">
              {isReportedOn ? "ON" : "OFF"}
            </Text>
          </View>
        </View>

        {/* Middle: Active Countdown & Status */}
        {isReportedOn ? (
          <View className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Clock size={14} color="#0284C7" />
              <View>
                <Text className="text-[11px] font-bold text-sky-900 dark:text-sky-100">
                  Pompa Sedang Terbuka (Menyiram)
                </Text>
                <Text className="text-[10px] text-sky-700 dark:text-sky-300">
                  Failsafe watchdog aktif melindungi pompa
                </Text>
              </View>
            </View>

            <View className="items-end">
              <Text className="text-xs font-mono font-black text-sky-700 dark:text-sky-300">
                {remainingSeconds > 0
                  ? formatRemaining(remainingSeconds)
                  : "Aktif"}
              </Text>
              <Text className="text-[9px] text-sky-600 dark:text-sky-400">
                sisa waktu
              </Text>
            </View>
          </View>
        ) : (
          <View className="p-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 flex-row items-center justify-between">
            <View className="flex-row items-center gap-1">
              <View className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <Text className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                Standby
              </Text>
            </View>
          </View>
        )}

        {/* Selector Waktu Nyala Manual */}
        <View className="gap-2 pt-1 border-t border-black/5 dark:border-white/5">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-1.5">
              <Clock size={12} color={isDark ? "#9CA3AF" : "#6B7280"} />
              <Text className="text-[11px] font-bold text-emerald-950 dark:text-emerald-100">
                Waktu Nyala Manual:
              </Text>
            </View>
            <View className="px-2 py-0.5 rounded-full bg-sky-500/15 border border-sky-500/30">
              <Text className="text-[10px] font-black text-sky-700 dark:text-sky-300">
                {selectedDuration >= 60
                  ? `${Math.floor(selectedDuration / 60)}m ${selectedDuration % 60 ? (selectedDuration % 60) + "s" : ""}`.trim()
                  : `${selectedDuration} detik`}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center gap-1.5 flex-wrap">
            {DURATION_PRESETS.map((preset) => {
              const isSelected = selectedDuration === preset.value;
              return (
                <Pressable
                  key={preset.value}
                  onPress={() => setSelectedDuration(preset.value)}
                  className={`px-3 py-1.5 rounded-xl border items-center justify-center active:opacity-75 ${
                    isSelected
                      ? "bg-sky-500/25 border-sky-500 shadow-sm"
                      : "bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/10"
                  }`}
                >
                  <Text
                    className={`text-xs font-bold ${
                      isSelected
                        ? "text-sky-800 dark:text-sky-200"
                        : "text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {preset.label}
                  </Text>
                </Pressable>
              );
            })}

            <Pressable
              onPress={() => {
                setCustomSecondsInput(String(selectedDuration));
                setIsCustomModalOpen(true);
              }}
              className={`px-3 py-1.5 rounded-xl max-w-[30%] border flex-row items-center gap-1 active:opacity-75 ${
                !DURATION_PRESETS.some((p) => p.value === selectedDuration)
                  ? "bg-sky-500/25 border-sky-500 shadow-sm"
                  : "bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/10"
              }`}
            >
              <Sliders
                size={11}
                color={
                  !DURATION_PRESETS.some((p) => p.value === selectedDuration)
                    ? "#0284C7"
                    : "#6B7280"
                }
              />
              <Text
                className={`text-xs font-bold ${
                  !DURATION_PRESETS.some((p) => p.value === selectedDuration)
                    ? "text-sky-800 dark:text-sky-200"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                {!DURATION_PRESETS.some((p) => p.value === selectedDuration)
                  ? `${selectedDuration}s`
                  : "Kustom..."}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Manual Quick Actions: BUKA POMPA / TUTUP POMPA / TES 5S */}
        <View className="flex-row flex-wrap sm:flex-nowrap gap-2 pt-1">
          <Pressable
            onPress={handleOpen}
            disabled={isReportedOn}
            className={`flex-1 min-w-[100px] py-2.5 px-2 rounded-xl flex-row items-center justify-center gap-1.5 shadow-sm active:opacity-80 ${
              isReportedOn
                ? "bg-sky-500/20 border border-sky-500/30 opacity-60"
                : "bg-sky-600"
            }`}
          >
            <Play size={13} color={isReportedOn ? "#0284C7" : "#FFFFFF"} />
            <Text
              className={`text-xs font-bold ${
                isReportedOn ? "text-sky-700 dark:text-sky-300" : "text-white"
              }`}
              numberOfLines={1}
            >
              {isReportedOn
                ? "Terbuka"
                : `Buka Pompa (${selectedDuration >= 60 ? `${Math.floor(selectedDuration / 60)}m` : `${selectedDuration}s`})`}
            </Text>
          </Pressable>

          <Pressable
            onPress={handleClose}
            disabled={!isReportedOn}
            className={`flex-1 min-w-[100px] py-2.5 px-2 rounded-xl flex-row items-center justify-center gap-1.5 shadow-sm active:opacity-80 ${
              !isReportedOn
                ? "bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 opacity-50"
                : "bg-red-600"
            }`}
          >
            <Power size={13} color={!isReportedOn ? "#6B7280" : "#FFFFFF"} />
            <Text
              className={`text-xs font-bold ${
                !isReportedOn ? "text-gray-500" : "text-white"
              }`}
              numberOfLines={1}
            >
              Tutup Pompa
            </Text>
          </Pressable>
        </View>
        <View className="flex-row flex-wrap sm:flex-nowrap gap-2 pt-1">
          <Pressable
            onPress={() => onTriggerPulse(device.id, "water_pump", 5)}
            className="py-2.5 w-full px-3 rounded-xl bg-black/5 dark:bg-white/10 border border-black/5 dark:border-white/10 flex-row items-center justify-center gap-1 active:opacity-70 shrink-0"
          >
            <Zap size={13} color="#059669" />
            <Text
              className="text-xs font-bold text-emerald-800 dark:text-emerald-300"
              numberOfLines={1}
            >
              Tes 5s
            </Text>
          </Pressable>
        </View>

        {/* Sync Status Row */}
        <View className="flex-row items-center justify-between pt-1 border-t border-black/5 dark:border-white/5">
          <View className="flex-row items-center gap-1.5 flex-1 pr-2">
            {isPendingAck ? (
              <>
                <RefreshCw size={11} color="#D97706" />
                <Text
                  className="text-[10px] font-bold text-amber-700 dark:text-amber-300"
                  numberOfLines={1}
                >
                  Sinkronisasi ke GPIO 15...
                </Text>
              </>
            ) : (
              <>
                <CheckCircle2 size={11} color="#059669" />
                <Text
                  className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400"
                  numberOfLines={1}
                >
                  Tersinkronisasi (Reported = Desired)
                </Text>
              </>
            )}
          </View>
        </View>

        {/* Hardware Specs & Diagnostics Pills */}
        <View className="flex-row flex-wrap items-center gap-1.5 pt-1 border-t border-black/5 dark:border-white/5">
          <View className="px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/[0.06]">
            <Text className="text-[10px] font-mono text-gray-500">
              Pin: GPIO 15
            </Text>
          </View>
          <View className="px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/[0.06]">
            <Text className="text-[10px] font-mono text-gray-500">
              Beban: Relai / Pompa
            </Text>
          </View>
          <View className="px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/[0.06]">
            <Text className="text-[10px] font-mono text-gray-500">
              Failsafe: 300s
            </Text>
          </View>
          {reportedState.rssi !== undefined && (
            <View className="px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/[0.06] flex-row items-center gap-1">
              <Wifi size={9} color="#6B7280" />
              <Text className="text-[10px] font-mono text-gray-500">
                {reportedState.rssi} dBm
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Modal Input Durasi Nyala Kustom */}
      <Modal
        visible={isCustomModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsCustomModalOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1 justify-center items-center p-4 sm:p-6 bg-black/60"
        >
          <View className="w-full max-w-sm rounded-[24px] bg-white dark:bg-gray-900 border border-black/10 dark:border-white/15 p-5 sm:p-6 gap-4 shadow-xl">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Clock size={18} color="#0284C7" />
                <Text className="text-sm font-extrabold text-gray-900 dark:text-white">
                  Set Waktu Nyala Pompa
                </Text>
              </View>
              <Pressable
                onPress={() => setIsCustomModalOpen(false)}
                className="w-7 h-7 rounded-full items-center justify-center bg-black/5 dark:bg-white/10"
              >
                <X size={14} color="#6B7280" />
              </Pressable>
            </View>

            <View className="gap-1.5">
              <Text className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                Masukkan durasi nyala manual (detik):
              </Text>
              <View className="flex-row items-center gap-2">
                <TextInput
                  value={customSecondsInput}
                  onChangeText={setCustomSecondsInput}
                  keyboardType="numeric"
                  placeholder="Misal: 15"
                  placeholderTextColor="#9CA3AF"
                  className="flex-1 px-3.5 py-2.5 min-h-[44px] rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-bold text-sm"
                />
                <Text className="text-xs font-bold text-gray-500">detik</Text>
              </View>
              <Text className="text-[10px] text-gray-400">
                Rentang aman: 1 detik s/d 3600 detik (1 jam)
              </Text>
            </View>

            <View className="flex-row gap-2.5 pt-1">
              <Pressable
                onPress={() => setIsCustomModalOpen(false)}
                className="flex-1 py-3 min-h-[44px] rounded-xl border border-gray-200 dark:border-gray-700 items-center justify-center active:opacity-75"
              >
                <Text className="text-xs font-bold text-gray-600 dark:text-gray-400">
                  Batal
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  const val = parseInt(customSecondsInput, 10);
                  if (!isNaN(val) && val > 0) {
                    setSelectedDuration(Math.min(val, 3600));
                  }
                  setIsCustomModalOpen(false);
                }}
                className="flex-1 py-3 min-h-[44px] rounded-xl bg-sky-600 items-center justify-center active:opacity-85 shadow-sm"
              >
                <Text className="text-xs font-bold text-white">Terapkan</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </GlassCard>
  );
}
