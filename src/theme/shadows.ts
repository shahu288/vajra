import { Platform, ViewStyle } from 'react-native';

// ─── Shadow / Elevation System ─────────────────────────────────
// Centralized elevation levels for consistent depth across the app.
// Each level provides both native (iOS/Android) and web shadow values.

export type ShadowLevel = 'none' | 'sm' | 'md' | 'lg';

interface ShadowStyle {
  native: ViewStyle;
  web: Record<string, string>;
}

const shadowDefinitions: Record<ShadowLevel, ShadowStyle> = {
  none: {
    native: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    web: {
      boxShadow: 'none',
    },
  },

  /** Subtle — minimal lift for nested cards, badges */
  sm: {
    native: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 2,
    },
    web: {
      boxShadow: '0 4px 12px 0 rgba(0, 0, 0, 0.25)',
    },
  },

  /** Standard — default card depth, glass panels */
  md: {
    native: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      elevation: 6,
    },
    web: {
      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.4), inset 0 1px 1px 0 rgba(255, 255, 255, 0.07)',
    },
  },

  /** Prominent — hero sections, modals, monolith container */
  lg: {
    native: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.35,
      shadowRadius: 24,
      elevation: 10,
    },
    web: {
      boxShadow: '0 16px 48px rgba(0, 0, 0, 0.45), inset 0 1px 1px 0 rgba(255, 255, 255, 0.07)',
    },
  },
};

/**
 * Get platform-appropriate shadow styles for a given elevation level.
 * 
 * Usage:
 * ```ts
 * const cardStyle = {
 *   ...shadows.get('md'),
 *   backgroundColor: colors.bg.card,
 * };
 * ```
 */
function getShadow(level: ShadowLevel): ViewStyle {
  const def = shadowDefinitions[level];
  return Platform.select({
    web: def.web as unknown as ViewStyle,
    default: def.native,
  }) as ViewStyle;
}

/**
 * Generate a colored glow shadow.
 * Used for status-tinted cards, active states, and accent highlights.
 * 
 * Usage:
 * ```ts
 * const glowStyle = shadows.glow('#F5A623', 0.15);
 * ```
 * 
 * @param color - The hex color for the glow
 * @param intensity - Glow opacity (0-1), defaults to 0.15
 */
function glowShadow(color: string, intensity: number = 0.15): ViewStyle {
  return Platform.select({
    web: {
      boxShadow: `0 0 20px ${color}${Math.round(intensity * 255).toString(16).padStart(2, '0')}`,
    } as unknown as ViewStyle,
    default: {
      shadowColor: color,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: intensity,
      shadowRadius: 12,
      elevation: 4,
    },
  }) as ViewStyle;
}

/**
 * Generate a colored glow shadow for the monolith/hero container.
 * Combines the standard large shadow with a colored ambient glow.
 */
function heroGlow(color: string, intensity: number = 0.05): ViewStyle {
  return Platform.select({
    web: {
      boxShadow: `0 0 45px ${color}${Math.round(intensity * 255).toString(16).padStart(2, '0')}, 0 16px 48px rgba(0, 0, 0, 0.45), inset 0 1px 1px 0 rgba(255, 255, 255, 0.07)`,
    } as unknown as ViewStyle,
    default: {
      shadowColor: color,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: intensity,
      shadowRadius: 20,
      elevation: 10,
    },
  }) as ViewStyle;
}

/**
 * Generate a text glow effect (web only, no-op on native).
 * 
 * @param color - The hex color for the text glow
 * @param radius - Blur radius in pixels, defaults to 10
 */
function textGlow(color: string, radius: number = 10): ViewStyle {
  return Platform.select({
    web: {
      textShadow: `0 0 ${radius}px ${color}`,
    } as unknown as ViewStyle,
    default: {},
  }) as ViewStyle;
}

/**
 * Glassmorphism backdrop blur (web only, no-op on native).
 */
function glassmorphism(blurPx: number = 20): ViewStyle {
  return Platform.select({
    web: {
      backdropFilter: `blur(${blurPx}px)`,
    } as unknown as ViewStyle,
    default: {},
  }) as ViewStyle;
}

/**
 * Modal shadow — top-direction shadow for bottom sheets.
 */
function modalShadow(): ViewStyle {
  return Platform.select({
    web: {
      boxShadow: '0 -8px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
    } as unknown as ViewStyle,
    default: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 12,
    },
  }) as ViewStyle;
}

export const shadows = {
  get: getShadow,
  glow: glowShadow,
  heroGlow,
  textGlow,
  glassmorphism,
  modalShadow,
  levels: shadowDefinitions,
};

export type Shadows = typeof shadows;
