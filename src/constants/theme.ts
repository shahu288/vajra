/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 *
 * Colors are sourced from the canonical design system in src/theme/colors.ts
 */

import '@/global.css';

import { Platform } from 'react-native';
import { colors } from '@/theme/colors';

export const Colors = {
  light: {
    text: colors.text.primary,
    background: colors.bg.primary,
    backgroundElement: colors.bg.surface,
    backgroundSelected: colors.bg.surfaceAlt,
    textSecondary: colors.text.secondary,
  },
  dark: {
    text: colors.text.primary,
    background: colors.bg.primary,
    backgroundElement: colors.bg.surface,
    backgroundSelected: colors.bg.surfaceAlt,
    textSecondary: colors.text.secondary,
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-ui)',
    serif: 'var(--font-display)',
    rounded: 'var(--font-ui)',
    mono: 'var(--font-ui)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
