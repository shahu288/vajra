export const colors = {
  // ─── Brand Colors ───────────────────────────────────────────────
  primary: '#F3BA45',     // Imperial Gold: Primary CTAs, active states, highlights
  secondary: '#FFE48A',   // Warm Champagne: Metallic highlights, glints, reflections
  tertiary: '#1C2027',    // Precision Slate: Secondary surfaces
  accent: '#F3BA45',      // Imperial Gold
  danger: '#A33A3A',      // Muted Deep Red: Broken / missed vows

  // ─── Backgrounds ───────────────────────────────────────────────
  bg: {
    primary: '#0B0C0E',         // Deep Cold Obsidian Slate (Primary app background)
    surface: '#14171C',         // Gunmetal Slate (Panels, modals, bottom nav, inputs)
    surfaceAlt: '#1C2027',      // Precision Slate (Secondary surfaces)
    card: 'rgba(20, 23, 28, 0.90)', // Gunmetal translucent card background
    input: '#14171C',           // Gunmetal input background
    overlay: 'rgba(11, 12, 14, 0.88)',
    overlayHeavy: 'rgba(11, 12, 14, 0.96)',
    modalSurface: '#14171C',
  },

  // ─── Text ──────────────────────────────────────────────────────
  text: {
    primary: '#F5F6F8',     // Titanium Off-White: Headings, values, primary labels
    secondary: '#8A91A0',   // Steel Blue-Grey: Metadata, secondary labels, inactive
    tertiary: '#555C6B',    // Muted Slate for captions/disabled text
    inverse: '#0B0C0E',     // Obsidian Slate text on gold CTAs
    white: '#FFFFFF',
  },

  // ─── Borders ───────────────────────────────────────────────────
  border: {
    default: '#262A33',                 // Precision Metallic Slate (1px subtle border)
    lowContrast: 'rgba(38, 42, 51, 0.6)', // Subtle panel borders
    separator: 'rgba(38, 42, 51, 0.4)',
    subtle: 'rgba(38, 42, 51, 0.25)',
    viewport: '#262A33',                // Frame boundary
    dashed: 'rgba(243, 186, 69, 0.35)', // Imperial gold dashed border
  },

  // ─── States ────────────────────────────────────────────────────
  state: {
    disabled: '#1C2027',    // Disabled button background
    disabledOpacity: 0.4,   // Opacity for disabled elements
  },

  // ─── Semantic Alpha Helpers ────────────────────────────────────
  alpha: {
    /** Use: `${colors.primary}${colors.alpha.tintBg}` → 'rgba' equivalent ~0.05 */
    tintBg: '0D',     // ~5% opacity
    tintBgMd: '18',   // ~10% opacity
    tintBorder: '40',  // ~25% opacity
    tintBorderMd: '66', // ~40% opacity
    tintGlow: '40',    // ~25% opacity
    statusBg: '18',    // Status badge background suffix
  },
};

export type Colors = typeof colors;
