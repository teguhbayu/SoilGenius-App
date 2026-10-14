import { useState, useEffect, useCallback } from 'react';
import { Appearance } from 'react-native';
import { Uniwind } from 'uniwind';
import { getItem, setItem } from '@/services/storage';

export type ThemeMode = 'light' | 'dark' | 'system';

const THEME_STORAGE_KEY = '@soilgenius_theme_mode_v1';

export function useThemeMode() {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');

  const applyTheme = (mode: ThemeMode) => {
    try {
      Uniwind.setTheme(mode);
    } catch {
      return;
    }

    try {
      Appearance.setColorScheme(mode === 'system' ? 'unspecified' : mode);
    } catch {
      return;
    }
  };

  useEffect(() => {
    async function loadTheme() {
      const saved = await getItem(THEME_STORAGE_KEY);
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        setThemeModeState(saved);
        applyTheme(saved);
      }
    }
    loadTheme();
  }, []);

  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    setThemeModeState(mode);
    applyTheme(mode);
    await setItem(THEME_STORAGE_KEY, mode);
  }, []);

  return {
    themeMode,
    setThemeMode,
  };
}
