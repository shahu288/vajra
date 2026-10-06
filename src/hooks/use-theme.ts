import { useTheme as useVajraTheme } from '@/theme';

export function useTheme() {
  const { colors } = useVajraTheme();
  return {
    text: colors.text.primary,
    background: colors.bg.primary,
    backgroundElement: colors.bg.surface,
    backgroundSelected: colors.bg.surfaceAlt,
    textSecondary: colors.text.secondary,
    primary: colors.primary,
  };
}
