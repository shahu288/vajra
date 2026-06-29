export const colors = {
  primary: '#FF5A00',     // Vibrant Orange: Living Flame, streaks, Discipline Score
  secondary: '#4B7355',   // Muted Sage Green: Sleep, recovery
  tertiary: '#00E5FF',    // Electric Cyan (The Thunderbolt): Interactive paths, active triggers
  accent: '#6C5B95',      // Dusk Violet: Focus sessions, AI insights
  danger: '#993D3D',      // Muted Oxblood Crimson: Missed vows, relapses
  
  bg: {
    primary: '#05050A',   // Deep obsidian base with subtle navy undertone
    surface: '#0B0B12',   // Midnight charcoal card base
    surfaceAlt: '#12121E' // Highlighted states, active elements
  },
  
  text: {
    primary: '#FFFFFF',   // Stark white (The Diamond)
    secondary: '#8E8E9F', // Refined silver slate muted text
    tertiary: '#4E4E5F',  // Dark slate for disabled labels, captions
    dark: '#05050A'       // Dark text when overlaying bright highlights
  },
  
  border: {
    lowContrast: '#161626', // Refined thin borders
    subtle: '#0C0C14'       // Separators
  }
};

export type Colors = typeof colors;
