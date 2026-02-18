/**
 * Design Tokens - Shadows
 * Elevation system for the design system
 */

export const shadows = {
  // Elevation levels
  elevation: {
    0: 'none',
    1: '0 1px 2px rgba(0,0,0,0.05)',
    2: '0 1px 3px rgba(0,0,0,0.1)',
    3: '0 4px 6px rgba(0,0,0,0.1)',
    4: '0 10px 15px rgba(0,0,0,0.1)',
    5: '0 20px 25px rgba(0,0,0,0.15)',
  },

  // Focus states
  focus: {
    primary: '0 0 0 3px rgba(37,99,235,0.1)',
    error: '0 0 0 3px rgba(239,68,68,0.1)',
    success: '0 0 0 3px rgba(16,185,129,0.1)',
    warning: '0 0 0 3px rgba(245,158,11,0.1)',
  },

  // Component-specific shadows
  components: {
    button: '0 1px 2px rgba(0,0,0,0.05)',
    card: '0 1px 3px rgba(0,0,0,0.1)',
    cardHover: '0 4px 6px rgba(0,0,0,0.1)',
    dropdown: '0 4px 6px rgba(0,0,0,0.1)',
    modal: '0 20px 25px rgba(0,0,0,0.15)',
    toast: '0 10px 15px rgba(0,0,0,0.1)',
  },

  // Inset shadows
  inset: {
    sm: 'inset 0 1px 2px rgba(0,0,0,0.05)',
    md: 'inset 0 2px 4px rgba(0,0,0,0.06)',
  },
} as const;

// Border radius tokens
export const borderRadius = {
  none: '0px',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '24px',
  full: '9999px',
} as const;

// Helper to get shadow by elevation
export function getShadow(level: keyof typeof shadows.elevation): string {
  return shadows.elevation[level];
}
