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
  Cpu,
  Plus,
  Trash2,
  Clock,
  Sparkles,
  Sliders,
  Check,
  X,
  Gauge,
  Thermometer,
  Droplets,
  FlaskConical,
} from "lucide-react-native";
import { GlassCard } from "@/components/ui/glass-card";
import { RuleDto, RuleOperator, RuleAction } from "@/types/device";
import { useColorScheme } from "@/hooks/use-color-scheme";

interface RulesManagerCardProps {
  rules: RuleDto[];
  actuatorDeviceId: string;
  onToggleRule: (ruleId: string) => Promise<void>;
  onCreateRule: (ruleData: Partial<RuleDto>) => Promise<any>;
  onDeleteRule: (ruleId: string) => Promise<void>;
}

export function RulesManagerCard({
  rules,
  actuatorDeviceId,
  onToggleRule,
  onCreateRule,
  onDeleteRule,
}: RulesManagerCardProps) {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [ruleName, setRuleName] = useState<string>("");
  const [sensorMetric, setSensorMetric] = useState<"moisture" | "tempC" | "ph">(
    "moisture",
  );
  const [operator, setOperator] = useState<RuleOperator>("LESS_THAN");
  const [thresholdValue, setThresholdValue] = useState<string>("50");
  const [actionType, setActionType] = useState<RuleAction>("turn_on");
  const [durationMinutes, setDurationMinutes] = useState<string>("5");
  const [cooldownMinutes, setCooldownMinutes] = useState<string>("30");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case "moisture":
        return <Droplets size={14} color="#0284C7" />;
      case "tempC":
        return <Thermometer size={14} color="#D97706" />;
      case "ph":
        return <FlaskConical size={14} color="#8B5CF6" />;
      default:
        return <Gauge size={14} color="#059669" />;
    }
  };

  const getMetricLabel = (metric: string) => {
    switch (metric) {
      case "moisture":
        return "Kelembapan";
      case "tempC":
        return "Suhu Tanah";
      case "ph":
        return "pH Tanah";
      default:
        return metric;
    }
  };

  const getOperatorSymbol = (op: RuleOperator) => {
    switch (op) {
      case "LESS_THAN":
        return "<";
      case "GREATER_THAN":
        return ">";
      case "LESS_THAN_OR_EQUAL":
        return "<=";
      case "GREATER_THAN_OR_EQUAL":
        return ">=";
    }
  };

  const handleSubmit = async () => {
    if (!ruleName.trim() || !thresholdValue.trim()) return;
    setIsSubmitting(true);
    try {
      await onCreateRule({
        name: ruleName.trim(),
        actuatorDeviceId,
        sensorMetric,
        operator,
        thresholdValue: parseFloat(thresholdValue) || 50,
        actionType,
        durationSeconds: (parseInt(durationMinutes, 10) || 5) * 60,
        cooldownMinutes: parseInt(cooldownMinutes, 10) || 30,
        isActive: true,
      });

      setIsModalVisible(false);
      setRuleName("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <GlassCard
      glowColor="#10B981"
      borderColor={
        isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(16, 185, 129, 0.25)"
      }
      contentClassName="p-4 rounded-[24px] gap-3.5"
    >
      {/* Header */}
      <View className="flex-row items-center gap-2.5">
        <View className="w-9 h-9 rounded-xl items-center justify-center bg-emerald-500/15 border border-emerald-500/30 shrink-0">
          <Sliders size={18} color="#059669" />
        </View>
        <View className="flex-1 min-w-0">
          <Text
            className="text-sm font-extrabold text-emerald-950 dark:text-emerald-50"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            Otomasi Server-Side
          </Text>
          <Text
            className="text-[11px] text-emerald-800/70 dark:text-emerald-300/70"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            Evaluasi kondisi sensor tanah & trigger aktuator
          </Text>
        </View>
      </View>

      {/* Rules list */}
      {!actuatorDeviceId ? (
        <View className="py-5 items-center justify-center">
          <Text className="text-xs text-gray-500 text-center">
            Pasangkan perangkat aktuator terlebih dahulu untuk menambahkan
            aturan otomasi.
          </Text>
        </View>
      ) : rules.length === 0 ? (
        <View className="py-5 items-center justify-center">
          <Text className="text-xs text-gray-500">
            Belum ada aturan otomasi aktif. Klik 'Tambah Aturan' untuk membuat.
          </Text>
        </View>
      ) : (
        <View className="gap-2.5">
          {rules.map((rule) => (
            <View
              key={rule.id}
              className="p-3 rounded-2xl bg-white/60 dark:bg-white/[0.04] border border-black/5 dark:border-white/10 gap-2"
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2 flex-1 min-w-0 pr-2">
                  <View className="w-6 h-6 rounded-lg items-center justify-center bg-black/5 dark:bg-white/[0.06] shrink-0">
                    {getMetricIcon(rule.sensorMetric)}
                  </View>
                  <Text
                    className="text-xs font-bold text-emerald-950 dark:text-emerald-100 flex-1"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {rule.name}
                  </Text>
                </View>

                <View className="flex-row items-center gap-2">
                  <Switch
                    value={rule.isActive}
                    onValueChange={() => onToggleRule(rule.id)}
                    trackColor={{
                      false: isDark ? "#374151" : "#D1D5DB",
                      true: "#10B981",
                    }}
                    thumbColor="#FFFFFF"
                  />
                  <Pressable
                    onPress={() => onDeleteRule(rule.id)}
                    hitSlop={8}
                    className="p-1"
                  >
                    <Trash2 size={13} color="#EF4444" />
                  </Pressable>
                </View>
              </View>

              {/* Condition & action pill */}
              <View className="flex-row flex-wrap items-center gap-1.5 pt-0.5">
                <View className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/25">
                  <Text className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                    Kondisi: {getMetricLabel(rule.sensorMetric)}{" "}
                    {getOperatorSymbol(rule.operator)} {rule.thresholdValue}
                    {rule.sensorMetric === "moisture"
                      ? "%"
                      : rule.sensorMetric === "tempC"
                        ? "°C"
                        : ""}
                  </Text>
                </View>

                <View className="px-2 py-0.5 rounded-md bg-sky-500/15 border border-sky-500/25">
                  <Text className="text-[10px] font-bold text-sky-800 dark:text-sky-300">
                    Aksi: Pompa Air (
                    {rule.actionType === "turn_on"
                      ? "Nyalakan"
                      : rule.actionType === "turn_off"
                        ? "Matikan"
                        : "Pulsa"}
                    ) ({Math.round(rule.durationSeconds / 60)}m)
                  </Text>
                </View>

                <View className="px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/[0.06]">
                  <Text className="text-[10px] text-gray-500">
                    Cooldown: {rule.cooldownMinutes}m
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Add New Rule Button (Full Width at Bottom of Container) */}
      <Pressable
        onPress={() => {
          if (!actuatorDeviceId) return;
          setIsModalVisible(true);
        }}
        disabled={!actuatorDeviceId}
        className={`w-full py-2.5 px-4 rounded-xl flex-row items-center justify-center gap-2 active:opacity-80 shadow-sm ${
          actuatorDeviceId ? "bg-emerald-600" : "bg-gray-400 opacity-60"
        }`}
      >
        <Plus size={14} color="#FFFFFF" />
        <Text className="text-xs font-bold text-white">Tambah Aturan Baru</Text>
      </Pressable>

      {/* Modal Add Rule */}
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
            glowColor="#10B981"
            borderColor="rgba(16, 185, 129, 0.4)"
            contentClassName="p-4 sm:p-5 rounded-[28px] max-w-[420px] w-full max-h-[85vh] gap-3.5"
            className="w-[90%]"
          >
            <View className="flex-row items-center justify-between border-b border-black/5 dark:border-white/10 pb-3">
              <View className="flex-row items-center gap-2 flex-1 min-w-0 mr-2">
                <Sliders size={16} color="#059669" className="shrink-0" />
                <Text
                  className="text-sm font-extrabold text-emerald-950 dark:text-emerald-50"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  Tambah Aturan Otomasi
                </Text>
              </View>
              <Pressable
                onPress={() => setIsModalVisible(false)}
                className="w-8 h-8 rounded-full items-center justify-center bg-black/5 dark:bg-white/10 shrink-0"
              >
                <X size={15} color="#6B7280" />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerClassName="gap-3.5 pb-6 pt-1 px-1"
              keyboardShouldPersistTaps="handled"
            >
              <View className="gap-1.5">
                <Text className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                  Nama Aturan:
                </Text>
                <TextInput
                  value={ruleName}
                  onChangeText={setRuleName}
                  placeholder="Contoh: Pompa Air Darurat"
                  placeholderTextColor="#9CA3AF"
                  className="px-3.5 py-2.5 rounded-xl bg-white/80 dark:bg-white/[0.06] border border-black/10 dark:border-white/10 text-xs text-emerald-950 dark:text-emerald-100 min-h-[44px]"
                />
              </View>

              {/* Metric Selector */}
              <View className="gap-1.5">
                <Text className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                  Parameter Sensor:
                </Text>
                <View className="flex-row gap-1.5">
                  {[
                    { id: "moisture", label: "Kelembapan" },
                    { id: "tempC", label: "Suhu" },
                    { id: "ph", label: "pH" },
                  ].map((item) => (
                    <Pressable
                      key={item.id}
                      onPress={() => setSensorMetric(item.id as any)}
                      className={`flex-1 py-2 rounded-xl items-center border active:opacity-75 ${
                        sensorMetric === item.id
                          ? "bg-emerald-600 border-emerald-600"
                          : "bg-white/80 dark:bg-white/[0.06] border-black/10 dark:border-white/10"
                      }`}
                    >
                      <Text
                        className={`text-[11px] font-bold ${
                          sensorMetric === item.id
                            ? "text-white"
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                        numberOfLines={1}
                      >
                        {item.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Action Selector */}
              <View className="gap-1.5">
                <Text className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                  Aksi Pompa / Relai (GPIO 15):
                </Text>
                <View className="flex-row gap-1.5">
                  {[
                    { id: "turn_on", label: "Nyalakan Pompa" },
                    { id: "turn_off", label: "Matikan Pompa" },
                  ].map((item) => (
                    <Pressable
                      key={item.id}
                      onPress={() => setActionType(item.id as RuleAction)}
                      className={`flex-1 py-2 rounded-xl items-center border active:opacity-75 ${
                        actionType === item.id
                          ? "bg-sky-600 border-sky-600"
                          : "bg-white/80 dark:bg-white/[0.06] border-black/10 dark:border-white/10"
                      }`}
                    >
                      <Text
                        className={`text-[11px] font-bold ${
                          actionType === item.id
                            ? "text-white"
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                        numberOfLines={1}
                      >
                        {item.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Operator & Threshold */}
              <View className="flex-row gap-2">
                <View className="flex-1 gap-1.5">
                  <Text className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                    Operator:
                  </Text>
                  <View className="flex-row gap-1">
                    {(["LESS_THAN", "GREATER_THAN"] as RuleOperator[]).map(
                      (op) => (
                        <Pressable
                          key={op}
                          onPress={() => setOperator(op)}
                          className={`flex-1 py-2 rounded-xl items-center border active:opacity-75 ${
                            operator === op
                              ? "bg-emerald-600 border-emerald-600"
                              : "bg-white/80 dark:bg-white/[0.06] border-black/10 dark:border-white/10"
                          }`}
                        >
                          <Text
                            className={`text-xs font-black ${
                              operator === op
                                ? "text-white"
                                : "text-gray-700 dark:text-gray-300"
                            }`}
                          >
                            {op === "LESS_THAN" ? "<" : ">"}
                          </Text>
                        </Pressable>
                      ),
                    )}
                  </View>
                </View>

                <View className="flex-1 gap-1.5">
                  <Text className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                    Nilai Ambang:
                  </Text>
                  <TextInput
                    keyboardType="numeric"
                    value={thresholdValue}
                    onChangeText={setThresholdValue}
                    placeholder="50"
                    placeholderTextColor="#9CA3AF"
                    className="px-3 py-2 rounded-xl bg-white/80 dark:bg-white/[0.06] border border-black/10 dark:border-white/10 text-xs text-center font-bold text-emerald-950 dark:text-emerald-100 min-h-[42px]"
                  />
                </View>
              </View>

              {/* Durasi & Cooldown */}
              <View className="flex-row gap-2">
                <View className="flex-1 gap-1.5">
                  <Text className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                    Durasi (Menit):
                  </Text>
                  <TextInput
                    keyboardType="numeric"
                    value={durationMinutes}
                    onChangeText={setDurationMinutes}
                    placeholder="5"
                    className="px-3 py-2 rounded-xl bg-white/80 dark:bg-white/[0.06] border border-black/10 dark:border-white/10 text-xs text-center font-bold text-emerald-950 dark:text-emerald-100 min-h-[42px]"
                  />
                </View>

                <View className="flex-1 gap-1.5">
                  <Text className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                    Cooldown (Menit):
                  </Text>
                  <TextInput
                    keyboardType="numeric"
                    value={cooldownMinutes}
                    onChangeText={setCooldownMinutes}
                    placeholder="30"
                    className="px-3 py-2 rounded-xl bg-white/80 dark:bg-white/[0.06] border border-black/10 dark:border-white/10 text-xs text-center font-bold text-emerald-950 dark:text-emerald-100 min-h-[42px]"
                  />
                </View>
              </View>

              <Pressable
                onPress={handleSubmit}
                disabled={isSubmitting}
                className="py-3 rounded-xl bg-emerald-600 items-center justify-center active:opacity-85 shadow-sm mt-2 min-h-[44px]"
              >
                <Text className="text-xs font-bold text-white">
                  {isSubmitting ? "Menyimpan..." : "Simpan Aturan Otomasi"}
                </Text>
              </Pressable>
            </ScrollView>
          </GlassCard>
        </KeyboardAvoidingView>
      </Modal>
    </GlassCard>
  );
}
