/**
 * Design Tokens - Colors
 * Centralized color definitions for the Smart Attendance College design system
 */

export const colors = {
  // Primary Brand Colors
  primary: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
    950: '#172554',
  },

  // Secondary Accent Colors
  secondary: {
    50: '#EEF2FF',
    100: '#E0E7FF',
    200: '#C7D2FE',
    300: '#A5B4FC',
    400: '#818CF8',
    500: '#6366F1',
    600: '#4F46E5',
    700: '#4338CA',
    800: '#3730A3',
    900: '#312E81',
    950: '#1E1B4B',
  },

  // Surface/Neutral Colors
  surface: {
    0: '#FFFFFF',
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
    950: '#020617',
  },

  // Semantic Colors - Success
  success: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981',
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
    950: '#022C22',
  },

  // Semantic Colors - Warning
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
    950: '#451A03',
  },

  // Semantic Colors - Error
  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
    950: '#450A0A',
  },

  // Semantic Colors - Info
  info: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
    950: '#172554',
  },

  // Role-specific Colors
  role: {
    student: {
      light: '#EDE9FE',
      DEFAULT: '#8B5CF6',
      dark: '#6D28D9',
    },
    faculty: {
      light: '#E0F2FE',
      DEFAULT: '#0EA5E9',
      dark: '#0369A1',
    },
    admin: {
      light: '#FEF3C7',
      DEFAULT: '#F59E0B',
      dark: '#B45309',
    },
    hod: {
      light: '#D1FAE5',
      DEFAULT: '#10B981',
      dark: '#047857',
    },
  },
} as const;

// Helper function to get color by path
export function getColor(path: string): string {
  const parts = path.split('.');
  let current: any = colors;
  
  for (const part of parts) {
    if (current[part] === undefined) {
      console.warn(`Color path not found: ${path}`);
      return '#000000';
    }
    current = current[part];
  }
  
  if (typeof current === 'string') {
    return current;
  }
  
  console.warn(`Color path does not resolve to string: ${path}`);
  return '#000000';
}
