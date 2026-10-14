import React from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { Save, CheckCircle2 } from 'lucide-react-native';

interface SaveConfigButtonProps {
  onSave: () => void;
  isSaving: boolean;
  isSaved: boolean;
}

export function SaveConfigButton({
  onSave,
  isSaving,
  isSaved,
}: SaveConfigButtonProps) {
  return (
    <View className="gap-2 pt-1 pb-4">
      {isSaved && (
        <View className="flex-row items-center justify-center gap-2 p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30">
          <CheckCircle2 size={16} color="#059669" />
          <Text className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
            Konfigurasi berhasil disimpan!
          </Text>
        </View>
      )}

      <Pressable
        onPress={onSave}
        disabled={isSaving}
        className="active:scale-[0.98] transition-all"
      >
        <View className="p-3.5 rounded-2xl flex-row justify-center items-center gap-2 bg-emerald-600 dark:bg-emerald-600 shadow-md shadow-emerald-700/30">
          {isSaving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Save size={18} color="#FFFFFF" />
          )}
          <Text className="text-base font-bold text-white">
            {isSaving ? 'Menyimpan...' : 'Simpan Konfigurasi'}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}
