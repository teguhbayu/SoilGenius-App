import '@/global.css';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { useThemeMode } from '@/hooks/use-theme-mode';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useThemeMode();
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="ai" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}
