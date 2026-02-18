/**
 * Design Tokens - Spacing
 * Spacing scale based on 4px base unit
 */

export const spacing = {
  // Base unit: 4px
  base: 4,

  // Spacing scale
  scale: {
    0: '0px',
    1: '4px',     // 0.25rem
    2: '8px',     // 0.5rem
    3: '12px',    // 0.75rem
    4: '16px',    // 1rem
    5: '20px',    // 1.25rem
    6: '24px',    // 1.5rem
    8: '32px',    // 2rem
    10: '40px',   // 2.5rem
    12: '48px',   // 3rem
    16: '64px',   // 4rem
    20: '80px',   // 5rem
    24: '96px',   // 6rem
  },

  // Named spacing for specific use cases
  named: {
    // Micro spacing
    'icon-gap': '4px',
    'tight': '8px',
    
    // Component spacing
    'compact': '12px',
    'standard': '16px',
    'comfortable': '24px',
    
    // Layout spacing
    'large': '32px',
    'xlarge': '48px',
    'section': '64px',
  },

  // Layout-specific
  layout: {
    pagePadding: {
      mobile: '16px',
      tablet: '24px',
      desktop: '48px',
    },
    sidebar: {
      width: '260px',
      collapsedWidth: '72px',
    },
    topbar: {
      height: '64px',
    },
    container: {
      maxWidth: '1400px',
      gutter: '24px',
    },
  },
} as const;

// Helper to convert spacing number to pixels
export function spacingToPx(value: number): string {
  return `${value * spacing.base}px`;
}

// Helper to convert spacing number to rem
export function spacingToRem(value: number): string {
  return `${(value * spacing.base) / 16}rem`;
}
