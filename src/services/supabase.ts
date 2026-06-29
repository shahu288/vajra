import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://placeholder-url.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

// SSR-safe storage adapter for web support
const isServer = typeof window === 'undefined';
const ssrSafeStorage = {
  getItem: (key: string) => {
    if (isServer) return Promise.resolve(null);
    return AsyncStorage.getItem(key);
  },
  setItem: (key: string, value: string) => {
    if (isServer) return Promise.resolve();
    return AsyncStorage.setItem(key, value);
  },
  removeItem: (key: string) => {
    if (isServer) return Promise.resolve();
    return AsyncStorage.removeItem(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ssrSafeStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Disables web routing parameters on mobile startup
  },
});
