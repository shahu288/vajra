export const typography = {
  fontFamily: {
    regular: 'System', // System regular fallback, override in font loaders if custom fonts needed
    medium: 'System',  // System medium weight
    mono: 'SpaceMono-Regular' // SpaceMono-Regular for stable numerals
  },
  
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const
  },
  
  fontSize: {
    xxs: 10,
    xs: 12,       // Captions, metadata, disabled labels
    sm: 14,       // Standard body copy
    md: 16,       // Subheaders, behavior text
    lg: 18,       // Section headers
    xl: 22,       // Modal titles, screen header titles
    score: 56,    // Monospace numerals display (large)
    flameLabel: 14 // Labels near the flame
  }
};

export type Typography = typeof typography;
