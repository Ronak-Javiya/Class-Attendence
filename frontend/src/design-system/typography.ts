/**
 * Design Tokens - Typography
 * Type scale and font definitions for the design system
 */

export const typography = {
  // Font Family
  fontFamily: {
    sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
    mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', 'monospace'],
  },

  // Type Scale
  fontSize: {
    display: {
      size: '2.5rem',     // 40px
      lineHeight: '1.2',
      fontWeight: '700',
      letterSpacing: '-0.02em',
    },
    h1: {
      size: '1.875rem',   // 30px
      lineHeight: '1.3',
      fontWeight: '600',
      letterSpacing: '-0.01em',
    },
    h2: {
      size: '1.5rem',     // 24px
      lineHeight: '1.35',
      fontWeight: '600',
      letterSpacing: '-0.01em',
    },
    h3: {
      size: '1.25rem',    // 20px
      lineHeight: '1.4',
      fontWeight: '600',
      letterSpacing: '0',
    },
    h4: {
      size: '1.125rem',   // 18px
      lineHeight: '1.5',
      fontWeight: '600',
      letterSpacing: '0',
    },
    body: {
      size: '1rem',       // 16px
      lineHeight: '1.6',
      fontWeight: '400',
      letterSpacing: '0',
    },
    bodySm: {
      size: '0.875rem',   // 14px
      lineHeight: '1.5',
      fontWeight: '400',
      letterSpacing: '0',
    },
    caption: {
      size: '0.75rem',    // 12px
      lineHeight: '1.5',
      fontWeight: '500',
      letterSpacing: '0.05em',
    },
  },

  // Font Weights
  fontWeight: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  // Letter Spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },

  // Line Heights
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
} as const;

// Typography style generator
export function getTypographyStyle(variant: keyof typeof typography.fontSize) {
  return typography.fontSize[variant];
}

// Responsive typography classes
export const typographyClasses = {
  display: 'text-display font-bold tracking-tight leading-tight',
  h1: 'text-h1 font-semibold tracking-tight leading-snug',
  h2: 'text-h2 font-semibold tracking-tight leading-snug',
  h3: 'text-h3 font-semibold leading-snug',
  h4: 'text-h4 font-semibold leading-normal',
  body: 'text-body leading-relaxed',
  bodySm: 'text-body-sm leading-normal',
  caption: 'text-caption font-medium tracking-wide uppercase',
} as const;
