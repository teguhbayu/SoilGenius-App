import AsyncStorage from '@react-native-async-storage/async-storage';

export async function setItem(key: string, value: string): Promise<void> {
  try {
    await AsyncStorage.setItem(key, value);
  } catch {
    return;
  }

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      return;
    }
  }
}

export async function getItem(key: string): Promise<string | null> {
  try {
    const val = await AsyncStorage.getItem(key);
    if (val !== null) return val;
  } catch {
    return null;
  }

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const val = window.localStorage.getItem(key);
      if (val !== null) return val;
    } catch {
      return null;
    }
  }

  return null;
}
