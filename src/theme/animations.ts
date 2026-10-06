// ─── Animation Constants ───────────────────────────────────────
// Centralized timing and easing values for consistent motion across the app.

export const animations = {
  // ─── Easing Curves ─────────────────────────────────────────────
  // CSS easing strings for web transitions
  easing: {
    /** Spring-like deceleration — primary interaction curve */
    smooth: 'cubic-bezier(0.16, 1, 0.3, 1)',
    /** Standard ease — simple transitions */
    default: 'ease',
    /** Fluid deceleration — progress bars, gauges */
    fluid: 'cubic-bezier(0.1, 0.8, 0.3, 1)',
  },

  // ─── Durations (ms) ────────────────────────────────────────────
  duration: {
    /** Micro-interactions — button press feedback, toggles */
    instant: 100,
    /** Fast — hover effects, state changes */
    fast: 150,
    /** Normal — standard transitions, input focus */
    normal: 200,
    /** Slow — card transitions, page-level animations */
    slow: 300,
    /** Emphasis — progress bar fills, gauge animations */
    emphasis: 500,
  },

  // ─── Web Transition Presets ────────────────────────────────────
  // Ready-to-use CSS transition strings for web Platform.select
  transition: {
    /** All properties with smooth easing (cards, interactive elements) */
    all: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    /** All properties with standard easing (inputs, hover states) */
    allDefault: 'all 0.2s ease',
    /** Width transitions for progress bars */
    progress: 'width 0.5s cubic-bezier(0.1, 0.8, 0.3, 1)',
  },

  // ─── Aura Breathing Durations ──────────────────────────────────
  aura: {
    slow: '8s',     // Primary ambient glow cycle
    slower: '10s',  // Secondary ambient glow cycle (offset)
  },

  // ─── Hover Transforms ─────────────────────────────────────────
  // Standard hover transform values for web
  hover: {
    /** Subtle lift for interactive cards */
    lift: 'translateY(-2px)',
    /** Emphasized lift for selected/active cards */
    liftEmphasized: 'translateY(-4px) scale(1.02)',
    /** Card hover with subtle scale */
    cardHover: 'translateY(-2px) scale(1.01)',
  },
};

export type Animations = typeof animations;
