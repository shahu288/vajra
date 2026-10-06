import { Platform, StyleSheet } from 'react-native';
import { colors as defaultColors } from './colors';
import { spacing } from './spacing';
import { typography, textStyles } from './typography';
import { shadows } from './shadows';
import { ThemeColors } from './themes';

// ─── Design System Prebuilt Styles Generator ─────────────────────
// Generates reusable StyleSheet objects per theme palette.
export function getThemeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    // ─── Screen Containers ───────────────────────────────────────
    /** Full-screen base container */
    screen: {
      flex: 1,
      backgroundColor: colors.bg.primary,
    },

    /** Centered mobile-first viewport wrapper (used on Home) */
    viewport: {
      width: '100%',
      maxWidth: spacing.screen.maxWidth,
      height: '100%',
      backgroundColor: colors.bg.primary,
      borderLeftWidth: 1,
      borderRightWidth: 1,
      borderColor: colors.border.viewport,
      position: 'relative',
      overflow: 'hidden',
    },

    /** Standard screen horizontal padding */
    screenPadding: {
      paddingHorizontal: spacing.screen.paddingHorizontal,
    },

    /** Standard scroll content padding (includes tab bar buffer) */
    scrollContent: {
      paddingBottom: spacing.screen.paddingBottom,
    },

    /** SafeAreaView flex wrapper */
    safeArea: {
      flex: 1,
    },

    // ─── Dark Overlay ────────────────────────────────────────────
    /** Heavy dark overlay for image backgrounds */
    darkOverlay: {
      ...StyleSheet.absoluteFill,
      backgroundColor: colors.bg.overlayHeavy,
    },

    // ─── Background Auras ───────────────────────────────────────
    /** Absolute-fill wrapper for background glow elements */
    auraWrapper: {
      ...StyleSheet.absoluteFill,
      overflow: 'hidden',
    },

    /** Individual glow aura orb — needs position/size overrides per-screen */
    glowAura: {
      position: 'absolute',
      borderRadius: spacing.borderRadius.pill,
      ...Platform.select({
        web: {
          filter: 'blur(80px)',
        } as any,
        default: {},
      }),
    },

    // ─── Screen Header ──────────────────────────────────────────
    /** Standard screen header container with bottom separator */
    header: {
      paddingVertical: spacing.header.paddingVertical,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.separator,
    },

    /** Screen header title text */
    headerTitle: {
      ...textStyles.screenTitle,
      color: colors.text.primary,
    },

    /** Screen header subtitle text */
    headerSubtitle: {
      ...textStyles.screenSubtitle,
      color: colors.text.secondary,
      marginTop: 3,
    },

    // ─── Section ─────────────────────────────────────────────────
    /** Section container with standard gap */
    section: {
      gap: spacing.section.titleGap,
    },

    /** Section title label — "DAILY COMMITMENTS", "MY VOWS", etc. */
    sectionTitle: {
      ...textStyles.sectionLabel,
      color: colors.text.secondary,
      marginBottom: 2,
    },

    // ─── Cards ───────────────────────────────────────────────────
    /** Standard glassmorphic card */
    card: {
      backgroundColor: colors.bg.card,
      borderColor: colors.border.default,
      borderWidth: 1,
      borderRadius: spacing.borderRadius.xl,
      padding: spacing.card.padding,
      ...shadows.get('md'),
      ...shadows.glassmorphism(),
    },

    /** Card with large padding for hero sections */
    cardLg: {
      backgroundColor: colors.bg.card,
      borderColor: colors.border.default,
      borderWidth: 1,
      borderRadius: spacing.borderRadius.xxl,
      padding: spacing.card.paddingLg,
      ...shadows.get('lg'),
      ...shadows.glassmorphism(),
    },

    /** Nested/inner card (within another card) */
    cardNested: {
      backgroundColor: colors.bg.card,
      borderColor: colors.border.default,
      borderWidth: 1,
      borderRadius: spacing.borderRadius.lg,
      padding: spacing.card.padding,
      ...shadows.get('sm'),
      ...shadows.glassmorphism(),
    },

    // ─── Buttons ─────────────────────────────────────────────────
    /** Primary CTA button — gold background */
    buttonPrimary: {
      backgroundColor: colors.primary,
      paddingVertical: 14,
      paddingHorizontal: spacing.lg,
      borderRadius: spacing.borderRadius.md,
      alignItems: 'center',
      ...Platform.select({
        web: {
          cursor: 'pointer',
        } as any,
        default: {},
      }),
    },

    /** Primary button text — dark on gold */
    buttonPrimaryText: {
      ...textStyles.buttonLabel,
      color: colors.text.inverse,
    },

    /** Secondary button — transparent background with gold outline */
    buttonSecondary: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.primary,
      paddingVertical: 14,
      paddingHorizontal: spacing.lg,
      borderRadius: spacing.borderRadius.md,
      alignItems: 'center',
      ...Platform.select({
        web: {
          cursor: 'pointer',
        } as any,
        default: {},
      }),
    },

    /** Secondary button text */
    buttonSecondaryText: {
      ...textStyles.buttonLabel,
      color: colors.primary,
    },

    /** Danger/destructive button — red background */
    buttonDanger: {
      backgroundColor: colors.danger,
      paddingVertical: 14,
      paddingHorizontal: spacing.lg,
      borderRadius: spacing.borderRadius.md,
      alignItems: 'center',
      ...Platform.select({
        web: {
          cursor: 'pointer',
        } as any,
        default: {},
      }),
    },

    /** Danger button text */
    buttonDangerText: {
      ...textStyles.buttonLabel,
      color: colors.text.white,
    },

    /** Accent button */
    buttonAccent: {
      paddingVertical: 10,
      paddingHorizontal: spacing.lg,
      borderRadius: spacing.borderRadius.md,
      alignItems: 'center',
      ...Platform.select({
        web: {
          cursor: 'pointer',
        } as any,
        default: {},
      }),
    },

    /** Small action button — used in cards */
    buttonSmall: {
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderRadius: spacing.borderRadius.sm,
      borderWidth: 1,
      borderColor: colors.border.dashed,
      backgroundColor: colors.bg.surfaceAlt,
      ...Platform.select({
        web: {
          cursor: 'pointer',
        } as any,
        default: {},
      }),
    },

    /** Small button text */
    buttonSmallText: {
      ...textStyles.badgeText,
      color: colors.text.secondary,
    },

    /** Disabled state */
    buttonDisabled: {
      backgroundColor: colors.state.disabled,
      opacity: colors.state.disabledOpacity,
    },

    // ─── Inputs ──────────────────────────────────────────────────
    /** Standard single-line text input */
    input: {
      backgroundColor: colors.bg.input,
      borderWidth: 1,
      borderColor: colors.border.lowContrast,
      borderRadius: spacing.borderRadius.md,
      paddingHorizontal: 14,
      paddingVertical: 12,
      ...textStyles.inputText,
      color: colors.text.primary,
      ...Platform.select({
        web: {
          outlineStyle: 'none',
        } as any,
        default: {},
      }),
    },

    /** Multiline text area */
    textArea: {
      backgroundColor: colors.bg.input,
      borderWidth: 1,
      borderColor: colors.border.lowContrast,
      borderRadius: spacing.borderRadius.md,
      padding: spacing.md,
      ...textStyles.inputText,
      color: colors.text.primary,
      minHeight: 80,
      textAlignVertical: 'top',
      ...Platform.select({
        web: {
          outlineStyle: 'none',
        } as any,
        default: {},
      }),
    },

    // ─── Badges & Pills ─────────────────────────────────────────
    /** Pill badge */
    pill: {
      borderWidth: 1,
      borderRadius: spacing.borderRadius.pill,
      paddingHorizontal: 14,
      paddingVertical: 4,
      alignSelf: 'center',
    },

    /** Pill text */
    pillText: {
      ...textStyles.caption,
      textAlign: 'center',
    },

    /** Small status badge */
    statusBadge: {
      borderWidth: 1,
      paddingHorizontal: spacing.sm,
      paddingVertical: 3,
      borderRadius: spacing.borderRadius.sm,
    },

    /** Status badge text */
    statusBadgeText: {
      ...textStyles.badgeText,
    },

    // ─── Progress Bars ───────────────────────────────────────────
    /** Progress bar track/container */
    progressBarContainer: {
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border.lowContrast,
      overflow: 'hidden',
    },

    /** Progress bar track — medium height variant */
    progressBarContainerMd: {
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.border.lowContrast,
      overflow: 'hidden',
    },

    /** Progress bar track — large variant */
    progressBarContainerLg: {
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.border.lowContrast,
      overflow: 'hidden',
    },

    /** Progress bar track — extra large */
    progressBarContainerXl: {
      height: 12,
      borderRadius: 6,
      backgroundColor: colors.border.subtle,
      borderColor: colors.border.lowContrast,
      borderWidth: 1,
      overflow: 'hidden',
    },

    /** Progress bar fill */
    progressBarFill: {
      height: '100%',
      borderRadius: 2,
    },

    // ─── Separators ──────────────────────────────────────────────
    /** Horizontal section separator line */
    separator: {
      borderTopWidth: 1,
      borderTopColor: colors.border.separator,
    },

    // ─── Left Accent Bar ────────────────────────────────────────
    /** Vertical accent bar on the left edge of cards */
    leftAccentBar: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: 4,
    },

    // ─── Reflection / Blockquote ─────────────────────────────────
    /** Reflection snippet container */
    reflectionSnippet: {
      borderLeftWidth: 2,
      borderLeftColor: colors.border.default,
      paddingLeft: 10,
      marginTop: 4,
    },

    /** Reflection snippet text */
    reflectionSnippetText: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
      fontStyle: 'italic',
    },

    // ─── Message Bubbles ─────────────────────────────────────────
    /** Chat message bubble base */
    messageBubble: {
      maxWidth: '75%',
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 14,
    },

    /** Own message bubble */
    messageBubbleMine: {
      backgroundColor: 'rgba(201, 154, 90, 0.12)',
      borderColor: colors.primary,
      borderWidth: 1,
    },

    /** Others' message bubble */
    messageBubbleTheirs: {
      backgroundColor: colors.bg.surfaceAlt,
      borderWidth: 1,
      borderColor: colors.border.separator,
    },

    // ─── System Messages ─────────────────────────────────────────
    /** System notification banner in chat */
    systemMessage: {
      fontSize: typography.fontSize.xs,
      color: colors.text.secondary,
      backgroundColor: colors.bg.surfaceAlt,
      borderColor: colors.border.lowContrast,
      borderWidth: 1,
      paddingHorizontal: spacing.md,
      paddingVertical: 6,
      borderRadius: spacing.borderRadius.sm,
      fontFamily: typography.fontFamily.mono,
      textAlign: 'center',
    },

    // ─── Notch / Drag Handle ─────────────────────────────────────
    /** Modal drag handle / notch bar */
    notch: {
      width: 44,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.text.tertiary,
      alignSelf: 'center',
      marginTop: 14,
      marginBottom: spacing.sm,
    },

    // ─── Trend Indicators ────────────────────────────────────────
    /** Small trend block */
    trendBlock: {
      width: 6,
      height: 6,
      borderRadius: spacing.borderRadius.xs,
    },
  });
}

// Default export static ds for obsidian fallback
export const ds = getThemeStyles(defaultColors as any);
export type DesignSystem = ReturnType<typeof getThemeStyles>;
