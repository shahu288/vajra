export const spacing = {
  // ─── Base Scale (4px grid) ──────────────────────────────────────
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  xxxxl: 40,

  // ─── Screen Layout ─────────────────────────────────────────────
  screen: {
    paddingHorizontal: 20,  // Unified screen edge padding (standardized from 16/20 inconsistency)
    paddingBottom: 100,     // Tab bar buffer for scroll content
    maxWidth: 430,          // Mobile-first viewport max width
  },

  // ─── Section Layout ────────────────────────────────────────────
  section: {
    gap: 20,        // Gap between major screen sections
    titleGap: 10,   // Gap between section title and its content
  },

  // ─── Card Layout ───────────────────────────────────────────────
  card: {
    padding: 18,    // Standard card internal padding
    paddingLg: 24,  // Larger card padding (monolith, hero sections)
    gap: 14,        // Standard gap within card content
  },

  // ─── Header Layout ─────────────────────────────────────────────
  header: {
    paddingVertical: 18,  // Vertical padding for screen headers
  },

  // ─── Border Radius ─────────────────────────────────────────────
  borderRadius: {
    xs: 4,       // Tiny elements (trend blocks, micro-indicators)
    sm: 8,       // Small badges, status tags, share buttons
    md: 12,      // Inputs, buttons, message bubbles, mood buttons
    lg: 16,      // Standard cards, vow cards, milestones, grid cards
    xl: 20,      // Prominent cards (Card component default)
    xxl: 24,     // Hero containers (monolith)
    modal: 28,   // Bottom sheet modal corners
    pill: 9999,  // Pill shapes, badges, aura circles
    avatar: 14,  // Avatar/profile picture corners
  },
};

export type Spacing = typeof spacing;
