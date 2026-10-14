import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Bot, Trash2 } from "lucide-react-native";
import { Alert, Pressable, Text, View } from "react-native";

interface ChatHeaderProps {
  onClear: () => void;
  messageCount: number;
}

export function ChatHeader({ onClear, messageCount }: ChatHeaderProps) {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const colors = Colors[isDark ? "dark" : "light"];

  const handleClearPress = () => {
    Alert.alert(
      "Hapus Percakapan",
      "Apakah Anda yakin ingin menghapus seluruh riwayat percakapan ini?",
      [
        { text: "Batal", style: "cancel" },
        { text: "Hapus", style: "destructive", onPress: onClear },
      ],
    );
  };

  return (
    <View className="flex-row items-center justify-between px-4 py-2 border-b border-emerald-500/10 dark:border-white/10">
      <View className="flex-row items-center gap-3">
        <View className="w-10 h-10 rounded-2xl items-center justify-center bg-emerald-500/20 border border-emerald-500/30">
          <Bot size={22} color="#059669" />
        </View>
        <View>
          <View className="flex-row items-center gap-1.5">
            <Text className="text-lg font-extrabold tracking-tight text-emerald-950 dark:text-emerald-50">
              SoilGenius AI
            </Text>
            <View className="w-2 h-2 rounded-full bg-emerald-500" />
          </View>
          <Text className="text-[11px] font-medium text-emerald-800/70 dark:text-emerald-300/70">
            Pakar Tanah & Tanaman
          </Text>
        </View>
      </View>

      <View className="flex-row items-center gap-2">
        {messageCount > 1 && (
          <Pressable
            onPress={handleClearPress}
            hitSlop={8}
            className="w-9 h-9 rounded-xl items-center justify-center bg-white/70 dark:bg-white/10 border border-emerald-500/20 dark:border-white/10 active:opacity-60"
          >
            <Trash2 size={16} color={isDark ? "#F87171" : "#DC2626"} />
          </Pressable>
        )}
      </View>
    </View>
  );
}
