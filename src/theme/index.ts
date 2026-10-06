import { colors } from './colors';
import { spacing } from './spacing';
import { typography, textStyles } from './typography';
import { shadows } from './shadows';
import { animations } from './animations';
import { ds, getThemeStyles } from './styles';

export const theme = {
  colors,
  spacing,
  typography,
  textStyles,
  shadows,
  animations,
  ds,
};

export type Theme = typeof theme;

// Named re-exports for direct imports
export { colors } from './colors';
export { spacing } from './spacing';
export { typography, textStyles } from './typography';
export { shadows } from './shadows';
export { animations } from './animations';
export { ds, getThemeStyles } from './styles';
export { THEMES, obsidianTheme } from './themes';
export type { ThemeId, ThemeConfig, ThemeColors } from './themes';
export { ThemeProvider, useTheme } from './ThemeContext';
