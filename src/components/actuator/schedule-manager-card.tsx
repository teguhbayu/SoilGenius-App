import React, { useState } from "react";
import {
  View,
  Text,
  Switch,
  Pressable,
  TextInput,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  Clock,
  Plus,
  Trash2,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  X,
  Play,
  Power,
  Server,
} from "lucide-react-native";
import { GlassCard } from "@/components/ui/glass-card";
import { ScheduleDto } from "@/types/device";
import { useColorScheme } from "@/hooks/use-color-scheme";

interface ScheduleManagerCardProps {
  schedules: ScheduleDto[];
  actuatorDeviceId: string;
  onToggleSchedule: (scheduleId: string) => Promise<void>;
  onCreateSchedule: (scheduleData: Partial<ScheduleDto>) => Promise<any>;
  onDeleteSchedule: (scheduleId: string) => Promise<void>;
}

export function ScheduleManagerCard({
  schedules,
  actuatorDeviceId,
  onToggleSchedule,
  onCreateSchedule,
  onDeleteSchedule,
}: ScheduleManagerCardProps) {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [scheduleName, setScheduleName] = useState<string>("");
  const [openTime, setOpenTime] = useState<string>("07:00");
  const [closeTime, setCloseTime] = useState<string>("07:15");
  const [daysPreset, setDaysPreset] = useState<"ALL" | "WEEKDAYS" | "WEEKEND">(
    "ALL",
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const calculateDurationMinutes = (open: string, close: string) => {
    try {
      const [oh, om] = open.split(":").map((v) => parseInt(v, 10));
      const [ch, cm] = close.split(":").map((v) => parseInt(v, 10));
      if (isNaN(oh) || isNaN(om) || isNaN(ch) || isNaN(cm)) return null;
      let diff = ch * 60 + cm - (oh * 60 + om);
      if (diff < 0) diff += 24 * 60; // Crosses midnight
      return diff;
    } catch {
      return null;
    }
  };

  const getDaysLabel = (days: string) => {
    if (!days || days === "ALL") return "Setiap Hari";
    if (days === "1,2,3,4,5") return "Sen - Jum (Hari Kerja)";
    if (days === "6,0" || days === "0,6") return "Sab - Min (Akhir Pekan)";
    return `Hari: ${days}`;
  };

  const handleSubmit = async () => {
    if (!scheduleName.trim() || !openTime.trim() || !closeTime.trim()) return;

    let daysStr = "ALL";
    if (daysPreset === "WEEKDAYS") daysStr = "1,2,3,4,5";
    else if (daysPreset === "WEEKEND") daysStr = "6,0";

    setIsSubmitting(true);
    try {
      await onCreateSchedule({
        name: scheduleName.trim(),
        actuatorDeviceId,
        openTime: openTime.trim(),
        closeTime: closeTime.trim(),
        daysOfWeek: daysStr,
        isActive: true,
      });

      setIsModalVisible(false);
      setScheduleName("");
      setOpenTime("07:00");
      setCloseTime("07:15");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <GlassCard
      glowColor="#0284C7"
      borderColor={
        isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(2, 132, 199, 0.25)"
      }
      contentClassName="p-4 rounded-[24px] gap-3.5"
    >
      {/* Header */}
      <View className="flex-row items-center gap-2.5">
        <View className="w-9 h-9 rounded-xl items-center justify-center bg-sky-500/15 border border-sky-500/30 shrink-0">
          <Clock size={18} color="#0284C7" />
        </View>
        <View className="flex-1 min-w-0">
          <Text
            className="text-sm font-extrabold text-emerald-950 dark:text-emerald-50"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            Jadwal Penyiraman (Server)
          </Text>
          <Text
            className="text-[11px] text-emerald-800/70 dark:text-emerald-300/70"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            Disimpan & dikendalikan otomatis oleh server
          </Text>
        </View>
      </View>

      {/* Schedules list */}
      {!actuatorDeviceId ? (
        <View className="py-5 items-center justify-center">
          <Text className="text-xs text-gray-500 text-center">
            Pasangkan perangkat aktuator terlebih dahulu untuk menambahkan
            jadwal penyiraman.
          </Text>
        </View>
      ) : schedules.length === 0 ? (
        <View className="py-5 items-center justify-center gap-1.5">
          <Text className="text-xs text-gray-500 text-center font-medium">
            Belum ada jadwal penyiraman di server.
          </Text>
          <Text className="text-[11px] text-gray-400 text-center">
            Klik 'Tambah Jadwal' untuk mengatur jam buka dan tutup pompa.
          </Text>
        </View>
      ) : (
        <View className="gap-2.5">
          {schedules.map((schedule) => {
            const durationMin = calculateDurationMinutes(
              schedule.openTime,
              schedule.closeTime,
            );

            return (
              <View
                key={schedule.id}
                className="p-3.5 rounded-2xl bg-white/60 dark:bg-white/[0.04] border border-black/5 dark:border-white/10 gap-2.5"
              >
                {/* Title & switch */}
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2 flex-1 pr-2">
                    <View className="w-7 h-7 rounded-lg items-center justify-center bg-sky-500/15">
                      <Clock size={14} color="#0284C7" />
                    </View>
                    <View className="flex-1">
                      <Text
                        className="text-xs font-bold text-emerald-950 dark:text-emerald-100"
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {schedule.name}
                      </Text>
                      <Text className="text-[10px] text-gray-500">
                        {getDaysLabel(schedule.daysOfWeek)}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center gap-2">
                    <Switch
                      value={schedule.isActive}
                      onValueChange={() => onToggleSchedule(schedule.id)}
                      trackColor={{
                        false: isDark ? "#374151" : "#D1D5DB",
                        true: "#0284C7",
                      }}
                      thumbColor="#FFFFFF"
                    />
                    <Pressable
                      onPress={() => onDeleteSchedule(schedule.id)}
                      hitSlop={8}
                      className="p-1"
                    >
                      <Trash2 size={13} color="#EF4444" />
                    </Pressable>
                  </View>
                </View>

                {/* Open & Close Times */}
                <View className="flex-row items-center justify-between p-2.5 rounded-xl bg-sky-500/5 dark:bg-sky-500/10 border border-sky-500/15">
                  <View className="flex-row items-center gap-2">
                    <View className="items-center">
                      <Text className="text-[9px] font-bold text-gray-500">
                        BUKA POMPA
                      </Text>
                      <Text className="text-sm font-mono font-black text-sky-700 dark:text-sky-300">
                        {schedule.openTime}
                      </Text>
                    </View>

                    <ArrowRight size={14} color="#0284C7" />

                    <View className="items-center">
                      <Text className="text-[9px] font-bold text-gray-500">
                        TUTUP POMPA
                      </Text>
                      <Text className="text-sm font-mono font-black text-red-600 dark:text-red-400">
                        {schedule.closeTime}
                      </Text>
                    </View>
                  </View>

                  {durationMin !== null && (
                    <View className="px-2 py-1 rounded-lg bg-sky-500/20">
                      <Text className="text-[10px] font-bold text-sky-800 dark:text-sky-200">
                        {durationMin} Menit
                      </Text>
                    </View>
                  )}
                </View>

                {/* Last run execution status */}
                {schedule.lastRunAction && (
                  <View className="flex-row items-center gap-1.5 pt-0.5">
                    <CheckCircle2 size={10} color="#059669" />
                    <Text className="text-[10px] text-gray-500 dark:text-gray-400">
                      Terakhir dieksekusi:{" "}
                      {schedule.lastRunAction.toUpperCase()}
                      {schedule.lastRunAt
                        ? ` • ${new Date(schedule.lastRunAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                        : ""}
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}

      {/* Add New Schedule Button (Full Width at Bottom of Container) */}
      <Pressable
        onPress={() => {
          if (!actuatorDeviceId) return;
          setIsModalVisible(true);
        }}
        disabled={!actuatorDeviceId}
        className={`w-full py-2.5 px-4 rounded-xl flex-row items-center justify-center gap-2 active:opacity-80 shadow-sm ${
          actuatorDeviceId ? "bg-sky-600" : "bg-gray-400 opacity-60"
        }`}
      >
        <Plus size={14} color="#FFFFFF" />
        <Text className="text-xs font-bold text-white">Tambah Jadwal Baru</Text>
      </Pressable>

      {/* Modal Add Schedule */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1 bg-black/60 items-center justify-center p-4 sm:p-6"
        >
          <GlassCard
            glowColor="#0284C7"
            borderColor="rgba(2, 132, 199, 0.4)"
            contentClassName="p-4 sm:p-5 rounded-[28px] max-w-[400px] w-full max-h-[85vh] gap-3"
            className="w-[90%]"
          >
            <View className="flex-row items-center justify-between border-b border-black/5 dark:border-white/10 pb-2.5">
              <View className="flex-row items-center gap-2 flex-1 min-w-0 mr-2">
                <Clock size={16} color="#0284C7" className="shrink-0" />
                <Text
                  className="text-sm font-extrabold text-emerald-950 dark:text-emerald-50"
                  numberOfLines={1}
                >
                  Tambah Jadwal Penyiraman
                </Text>
              </View>
              <Pressable
                onPress={() => setIsModalVisible(false)}
                className="w-7 h-7 rounded-full items-center justify-center bg-black/5 dark:bg-white/10 shrink-0"
              >
                <X size={14} color="#6B7280" />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerClassName="gap-3.5 pb-6 pt-1 px-1"
              keyboardShouldPersistTaps="handled"
            >
              {/* Nama Jadwal */}
              <View className="gap-1.5">
                <Text className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                  Nama Jadwal:
                </Text>
                <TextInput
                  value={scheduleName}
                  onChangeText={setScheduleName}
                  placeholder="Contoh: Penyiraman Pagi"
                  placeholderTextColor="#9CA3AF"
                  className="px-3.5 py-2.5 min-h-[44px] rounded-xl bg-white/80 dark:bg-white/[0.06] border border-black/10 dark:border-white/10 text-xs text-emerald-950 dark:text-emerald-100"
                />
              </View>

              {/* Jam Buka & Jam Tutup */}
              <View className="flex-row gap-2.5">
                <View className="flex-1 gap-1.5">
                  <Text className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                    Jam Buka Pompa:
                  </Text>
                  <TextInput
                    value={openTime}
                    onChangeText={setOpenTime}
                    placeholder="07:00"
                    placeholderTextColor="#9CA3AF"
                    className="px-3.5 py-2.5 min-h-[44px] rounded-xl bg-white/80 dark:bg-white/[0.06] border border-black/10 dark:border-white/10 text-xs text-center font-mono font-bold text-sky-700 dark:text-sky-300"
                  />
                </View>

                <View className="flex-1 gap-1.5">
                  <Text className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                    Jam Tutup Pompa:
                  </Text>
                  <TextInput
                    value={closeTime}
                    onChangeText={setCloseTime}
                    placeholder="07:15"
                    placeholderTextColor="#9CA3AF"
                    className="px-3.5 py-2.5 min-h-[44px] rounded-xl bg-white/80 dark:bg-white/[0.06] border border-black/10 dark:border-white/10 text-xs text-center font-mono font-bold text-red-600 dark:text-red-400"
                  />
                </View>
              </View>

              {/* Hari Eksekusi Preset */}
              <View className="gap-1.5">
                <Text className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                  Hari Eksekusi:
                </Text>
                <View className="flex-row gap-2">
                  {[
                    { id: "ALL", label: "Setiap Hari" },
                    { id: "WEEKDAYS", label: "Sen - Jum" },
                    { id: "WEEKEND", label: "Sab - Min" },
                  ].map((item) => (
                    <Pressable
                      key={item.id}
                      onPress={() => setDaysPreset(item.id as any)}
                      className={`flex-1 py-2.5 min-h-[40px] rounded-xl items-center justify-center border ${
                        daysPreset === item.id
                          ? "bg-sky-600 border-sky-600"
                          : "bg-white/80 dark:bg-white/[0.06] border-black/10 dark:border-white/10"
                      }`}
                    >
                      <Text
                        className={`text-[11px] font-bold ${
                          daysPreset === item.id
                            ? "text-white"
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {item.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Info Box */}
             

              <Pressable
                onPress={handleSubmit}
                disabled={isSubmitting}
                className="py-3 min-h-[44px] rounded-xl bg-sky-600 items-center justify-center active:opacity-85 shadow-sm mt-1"
              >
                <Text className="text-xs font-bold text-white">
                  {isSubmitting ? "Menyimpan..." : "Simpan Jadwal"}
                </Text>
              </Pressable>
            </ScrollView>
          </GlassCard>
        </KeyboardAvoidingView>
      </Modal>
    </GlassCard>
  );
}
