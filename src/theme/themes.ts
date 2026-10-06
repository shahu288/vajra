export type ThemeId = 'obsidian';

export interface ThemeColors {
  primary: string;
  secondary: string;
  tertiary: string;
  accent: string;
  danger: string;

  bg: {
    primary: string;
    surface: string;
    surfaceAlt: string;
    card: string;
    input: string;
    overlay: string;
    overlayHeavy: string;
    modalSurface: string;
    outerBg: string;
    mobileFrame: string;
  };

  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
    white: string;
  };

  border: {
    default: string;
    lowContrast: string;
    separator: string;
    subtle: string;
    viewport: string;
    dashed: string;
  };

  state: {
    disabled: string;
    disabledOpacity: number;
  };

  alpha: {
    tintBg: string;
    tintBgMd: string;
    tintBorder: string;
    tintBorderMd: string;
    tintGlow: string;
    statusBg: string;
  };

  preview: {
    bg: string;
    card: string;
    accent: string;
    text: string;
    textSecondary: string;
    border: string;
  };
}

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  subtitle: string;
  isDark: boolean;
  colors: ThemeColors;
}

export const obsidianTheme: ThemeConfig = {
  id: 'obsidian',
  name: 'Forged Obsidian',
  subtitle: 'Deep cold obsidian & imperial gold • Discipline Sanctuary',
  isDark: true,
  colors: {
    primary: '#F3BA45',
    secondary: '#FFE48A',
    tertiary: '#1C2027',
    accent: '#F3BA45',
    danger: '#A33A3A',

    bg: {
      primary: '#0B0C0E',
      surface: '#14171C',
      surfaceAlt: '#1C2027',
      card: 'rgba(20, 23, 28, 0.90)',
      input: '#14171C',
      overlay: 'rgba(11, 12, 14, 0.88)',
      overlayHeavy: 'rgba(11, 12, 14, 0.96)',
      modalSurface: '#14171C',
      outerBg: '#060708',
      mobileFrame: '#0B0C0E',
    },

    text: {
      primary: '#F5F6F8',
      secondary: '#8A91A0',
      tertiary: '#555C6B',
      inverse: '#0B0C0E',
      white: '#FFFFFF',
    },

    border: {
      default: '#262A33',
      lowContrast: 'rgba(38, 42, 51, 0.6)',
      separator: 'rgba(38, 42, 51, 0.4)',
      subtle: 'rgba(38, 42, 51, 0.25)',
      viewport: '#262A33',
      dashed: 'rgba(243, 186, 69, 0.35)',
    },

    state: {
      disabled: '#1C2027',
      disabledOpacity: 0.4,
    },

    alpha: {
      tintBg: '0D',
      tintBgMd: '18',
      tintBorder: '40',
      tintBorderMd: '66',
      tintGlow: '40',
      statusBg: '18',
    },

    preview: {
      bg: '#0B0C0E',
      card: '#14171C',
      accent: '#F3BA45',
      text: '#F5F6F8',
      textSecondary: '#8A91A0',
      border: '#262A33',
    },
  },
};

export const THEMES: Record<ThemeId, ThemeConfig> = {
  obsidian: obsidianTheme,
};
