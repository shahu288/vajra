import { TextStyle, Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

export const typography = {
  // ─── Font Families ─────────────────────────────────────────────
  // Ancient etched artifact typography for important identity + modern precision typography for everything functional
  fontFamily: {
    // DISPLAY FONT: Cinzel (Weights: 500, 600, 700)
    // Fallback: "Cinzel", Georgia, serif
    display: isWeb ? '"Cinzel", Georgia, serif' : 'Cinzel_600SemiBold',
    displayMedium: isWeb ? '"Cinzel", Georgia, serif' : 'Cinzel_500Medium',
    displaySemiBold: isWeb ? '"Cinzel", Georgia, serif' : 'Cinzel_600SemiBold',
    displayBold: isWeb ? '"Cinzel", Georgia, serif' : 'Cinzel_700Bold',

    // UI / DATA FONT: Plus Jakarta Sans (Weights: 400, 500, 600, 700, 800)
    // Fallback: "Plus Jakarta Sans", Inter, sans-serif
    ui: isWeb ? '"Plus Jakarta Sans", Inter, sans-serif' : 'PlusJakartaSans_400Regular',
    uiMedium: isWeb ? '"Plus Jakarta Sans", Inter, sans-serif' : 'PlusJakartaSans_500Medium',
    uiSemiBold: isWeb ? '"Plus Jakarta Sans", Inter, sans-serif' : 'PlusJakartaSans_600SemiBold',
    uiBold: isWeb ? '"Plus Jakarta Sans", Inter, sans-serif' : 'PlusJakartaSans_700Bold',
    uiExtraBold: isWeb ? '"Plus Jakarta Sans", Inter, sans-serif' : 'PlusJakartaSans_800ExtraBold',

    // Compatibility mappings for existing usages
    regular: isWeb ? '"Plus Jakarta Sans", Inter, sans-serif' : 'PlusJakartaSans_400Regular',
    medium: isWeb ? '"Plus Jakarta Sans", Inter, sans-serif' : 'PlusJakartaSans_500Medium',
    semibold: isWeb ? '"Plus Jakarta Sans", Inter, sans-serif' : 'PlusJakartaSans_600SemiBold',
    bold: isWeb ? '"Plus Jakarta Sans", Inter, sans-serif' : 'PlusJakartaSans_700Bold',
    mono: isWeb ? '"Plus Jakarta Sans", Inter, sans-serif' : 'PlusJakartaSans_600SemiBold', // Precision UI numbers/data
    serif: isWeb ? '"Cinzel", Georgia, serif' : 'Cinzel_600SemiBold',
  },

  // ─── Font Weights ──────────────────────────────────────────────
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },

  // ─── Font Sizes ────────────────────────────────────────────────
  fontSize: {
    micro: 8,       // Status badge text, tiny pills
    xxs: 9,         // Section labels, difficulty tags
    xs: 10,         // Eyebrows, tertiary tags
    sm: 11,         // Navigation, card header stamp, small labels
    md: 12,         // Metadata, tags, code
    lg: 13,         // Streak labels, primary CTAs, adjuster buttons
    xl: 14,         // Body medium, input labels
    '2xl': 15,      // Body default, inputs
    '3xl': 18,      // Section headings, modal subheads
    '4xl': 20,      // Card main title, major vow headings, medium numbers
    '5xl': 24,      // Screen header titles
    '6xl': 28,      // Large display titles, hero score numbers
    '7xl': 32,      // Hero numerals
    hero: 40,       // Large hero displays
  },

  // ─── Letter Spacing ────────────────────────────────────────────
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    subtle: 0.2,    // Metadata (0.2px)
    streak: 0.3,    // Streak labels (0.3px)
    nav: 0.5,       // Navigation tracking (0.3 - 0.6px)
    label: 1,       // Eyebrow / small labels (1px)
    button: 1,      // Primary CTA tracking (1px)
    headerStamp: 1.5, // Card classification stamp (1.5px)
    tracked: 2,
    brand: 4,
  },

  // ─── Line Heights ──────────────────────────────────────────────
  lineHeight: {
    none: 1,
    tight: 1.1,
    display: 1.2,
    title: 1.22,
    section: 1.25,
    label: 1.3,
    meta: 1.4,
    body: 1.5,
    relaxed: 1.6,
  },
};

// ─── Centralized Typography Tokens (Section 16) ───────────────────
export const TypographyTokens: Record<string, TextStyle> = {
  /** displayXL: Cinzel / 28px / 600 / 1.2 */
  displayXL: {
    fontFamily: typography.fontFamily.displaySemiBold,
    fontSize: 28,
    fontWeight: '600',
    lineHeight: 34,
    color: '#F5F6F8',
    letterSpacing: 0.2,
  },

  /** displayL: Cinzel / 24px / 600 / 1.2 (Screen Title) */
  displayL: {
    fontFamily: typography.fontFamily.displaySemiBold,
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 29,
    color: '#F5F6F8',
    letterSpacing: 0,
  },

  /** displayM: Cinzel / 20px / 700 / 1.22 (Card Main Title) */
  displayM: {
    fontFamily: typography.fontFamily.displayBold,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 25,
    color: '#F5F6F8',
    letterSpacing: 0,
  },

  /** section: Cinzel / 18px / 600 / 1.25 (Section Headings) */
  section: {
    fontFamily: typography.fontFamily.displaySemiBold,
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 23,
    color: '#F5F6F8',
    letterSpacing: 0.5,
  },

  /** body: Plus Jakarta Sans / 15px / 400 / 1.5 */
  body: {
    fontFamily: typography.fontFamily.ui,
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 23,
    color: '#8A91A0',
  },

  /** bodyMedium: Plus Jakarta Sans / 14px / 500 / 1.45 */
  bodyMedium: {
    fontFamily: typography.fontFamily.uiMedium,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    color: '#8A91A0',
  },

  /** metadata: Plus Jakarta Sans / 12px / 500 / 1.4 / 0.2px tracking */
  metadata: {
    fontFamily: typography.fontFamily.uiMedium,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 17,
    letterSpacing: 0.2,
    color: '#8A91A0',
  },

  /** label: Plus Jakarta Sans / 11px / 700 / 1.3 / 1.5px tracking */
  label: {
    fontFamily: typography.fontFamily.uiBold,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: '#8A91A0',
  },

  /** streak: Plus Jakarta Sans / 13px / 600 / 1.3 / 0.3px tracking */
  streak: {
    fontFamily: typography.fontFamily.uiSemiBold,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 17,
    letterSpacing: 0.3,
    color: '#F5F6F8',
  },

  /** number: Plus Jakarta Sans / 20px / 700 / 1.2 */
  number: {
    fontFamily: typography.fontFamily.uiBold,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 24,
    color: '#F5F6F8',
  },

  /** heroNumber: Plus Jakarta Sans / 30px / 700 / 1.1 */
  heroNumber: {
    fontFamily: typography.fontFamily.uiBold,
    fontSize: 30,
    fontWeight: '700',
    lineHeight: 33,
    color: '#F5F6F8',
  },

  /** button: Plus Jakarta Sans / 13px / 700 / 1.2 / 1px tracking / uppercase */
  button: {
    fontFamily: typography.fontFamily.uiBold,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 16,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#0B0C0E',
  },

  /** nav: Plus Jakarta Sans / 11px / 600 / 1.2 */
  nav: {
    fontFamily: typography.fontFamily.uiSemiBold,
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 13,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: '#8A91A0',
  },
};

// ─── React Native Style Equivalent (Section 18) ───────────────────
export const Typography: Record<string, TextStyle> = {
  screenTitle: {
    fontFamily: typography.fontFamily.displaySemiBold,
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 29,
    color: '#F5F6F8',
    letterSpacing: 0,
  },
  cardHeader: {
    fontFamily: typography.fontFamily.uiBold,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: '#F3BA45',
  },
  cardTitle: {
    fontFamily: typography.fontFamily.displayBold,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 25,
    letterSpacing: 0,
    color: '#F5F6F8',
  },
  metadata: {
    fontFamily: typography.fontFamily.uiMedium,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 17,
    letterSpacing: 0.2,
    color: '#8A91A0',
  },
  streak: {
    fontFamily: typography.fontFamily.uiSemiBold,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 17,
    letterSpacing: 0.3,
    color: '#F5F6F8',
  },
  button: {
    fontFamily: typography.fontFamily.uiBold,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 16,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#0B0C0E',
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.displaySemiBold,
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 23,
    letterSpacing: 0.5,
    color: '#F5F6F8',
  },
  eyebrow: {
    fontFamily: typography.fontFamily.uiBold,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#8A91A0',
  },
  number: {
    fontFamily: typography.fontFamily.uiBold,
    fontWeight: '700',
    color: '#F5F6F8',
  },
};

// ─── Named Text Styles (for backwards compatibility across app) ───
export const textStyles: Record<string, TextStyle> = {
  /** Screen header title — Cinzel 24px 600 */
  screenTitle: Typography.screenTitle,

  /** Screen header subtitle — date, path info, invite codes (Plus Jakarta Sans) */
  screenSubtitle: {
    fontFamily: typography.fontFamily.uiMedium,
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
    letterSpacing: typography.letterSpacing.subtle,
    color: '#8A91A0',
  },

  /** Section label — Plus Jakarta Sans 11px 700 uppercase (1px tracking) */
  sectionLabel: {
    fontFamily: typography.fontFamily.uiBold,
    fontSize: typography.fontSize.sm,
    fontWeight: '700',
    letterSpacing: typography.letterSpacing.label,
    textTransform: 'uppercase',
    color: '#F3BA45', // Imperial Gold accent for section titles
  },

  /** Body default — Plus Jakarta Sans 15px 400 */
  bodyDefault: {
    fontFamily: typography.fontFamily.ui,
    fontSize: typography.fontSize['2xl'],
    fontWeight: '400',
    lineHeight: 22,
    color: '#F5F6F8',
  },

  /** Body small — Plus Jakarta Sans 12px 500 */
  bodySmall: {
    fontFamily: typography.fontFamily.uiMedium,
    fontSize: typography.fontSize.md,
    fontWeight: '500',
    color: '#8A91A0',
  },

  /** Caption — metadata, timestamps, tertiary info (Plus Jakarta Sans) */
  caption: {
    fontFamily: typography.fontFamily.uiMedium,
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
    letterSpacing: typography.letterSpacing.subtle,
    color: '#8A91A0',
  },

  /** Mono label — Plus Jakarta Sans 12px 600 precision text */
  monoLabel: {
    fontFamily: typography.fontFamily.uiSemiBold,
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    letterSpacing: typography.letterSpacing.subtle,
    color: '#F5F6F8',
  },

  /** Button label — Plus Jakarta Sans 13px 700 uppercase (1px tracking) */
  buttonLabel: Typography.button,

  /** Badge text — tiny badge/status text (Plus Jakarta Sans) */
  badgeText: {
    fontFamily: typography.fontFamily.uiBold,
    fontSize: typography.fontSize.xxs,
    fontWeight: '700',
    letterSpacing: typography.letterSpacing.label,
    textTransform: 'uppercase',
  },

  /** Hero score — Plus Jakarta Sans 30-32px 700 (Precise functional number, not Cinzel!) */
  heroScore: {
    fontFamily: typography.fontFamily.uiBold,
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    color: '#F5F6F8',
  },

  /** Stats value — Plus Jakarta Sans 24px 700 */
  statsValue: {
    fontFamily: typography.fontFamily.uiBold,
    fontSize: typography.fontSize['5xl'],
    fontWeight: '700',
    color: '#F5F6F8',
  },

  /** Feature numeral — Plus Jakarta Sans 28px 700 */
  featureNumeral: {
    fontFamily: typography.fontFamily.uiBold,
    fontSize: typography.fontSize['6xl'],
    fontWeight: '700',
    color: '#F5F6F8',
  },

  /** Input text — Plus Jakarta Sans 15-16px 500 */
  inputText: {
    fontFamily: typography.fontFamily.uiMedium,
    fontSize: typography.fontSize['2xl'],
    fontWeight: '500',
    color: '#F5F6F8',
  },
};

export type TypographyType = typeof typography;
export type TextStyles = typeof textStyles;

