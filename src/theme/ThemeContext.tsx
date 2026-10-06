import React, { createContext, useContext } from 'react';
import { View } from 'react-native';
import { obsidianTheme, ThemeId, ThemeConfig, ThemeColors } from './themes';
import { getThemeStyles } from './styles';

interface ThemeContextType {
  themeId: ThemeId;
  theme: ThemeConfig;
  colors: ThemeColors;
  ds: ReturnType<typeof getThemeStyles>;
  isDark: boolean;
  setTheme: (id: ThemeId) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const activeTheme = obsidianTheme;
  const activeColors = activeTheme.colors;
  const activeDs = getThemeStyles(activeColors);

  const value: ThemeContextType = {
    themeId: 'obsidian',
    theme: activeTheme,
    colors: activeColors,
    ds: activeDs,
    isDark: true,
    setTheme: async () => {},
  };

  return (
    <ThemeContext.Provider value={value}>
      <View style={{ flex: 1, backgroundColor: activeColors.bg.primary }}>
        {children}
      </View>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    const activeColors = obsidianTheme.colors;
    return {
      themeId: 'obsidian' as ThemeId,
      theme: obsidianTheme,
      colors: activeColors,
      ds: getThemeStyles(activeColors),
      isDark: true,
      setTheme: async () => {},
    };
  }
  return context;
}
