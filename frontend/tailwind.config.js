/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ['class'],
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
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
                // Semantic Colors
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
                // Role Colors
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
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
            },
            fontSize: {
                'display': ['2.5rem', { lineHeight: '1.2', fontWeight: '700' }],
                'h1': ['1.875rem', { lineHeight: '1.3', fontWeight: '600' }],
                'h2': ['1.5rem', { lineHeight: '1.35', fontWeight: '600' }],
                'h3': ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }],
                'h4': ['1.125rem', { lineHeight: '1.5', fontWeight: '600' }],
                'body': ['1rem', { lineHeight: '1.6', fontWeight: '400' }],
                'body-sm': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
                'caption': ['0.75rem', { lineHeight: '1.5', fontWeight: '500' }],
            },
            spacing: {
                '18': '4.5rem',
                '22': '5.5rem',
                '30': '7.5rem',
            },
            boxShadow: {
                'elevation-1': '0 1px 2px rgba(0,0,0,0.05)',
                'elevation-2': '0 1px 3px rgba(0,0,0,0.1)',
                'elevation-3': '0 4px 6px rgba(0,0,0,0.1)',
                'elevation-4': '0 10px 15px rgba(0,0,0,0.1)',
                'elevation-5': '0 20px 25px rgba(0,0,0,0.15)',
                'focus': '0 0 0 3px rgba(37,99,235,0.1)',
                'focus-error': '0 0 0 3px rgba(239,68,68,0.1)',
            },
            borderRadius: {
                'sm': '4px',
                'md': '8px',
                'lg': '12px',
                'xl': '16px',
                'full': '9999px',
            },
            animation: {
                'fade-in': 'fadeIn 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                'fade-out': 'fadeOut 200ms ease-out',
                'slide-in-right': 'slideInRight 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                'slide-up': 'slideUp 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                'scale-in': 'scaleIn 200ms cubic-bezier(0.16, 1, 0.3, 1)',
                'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'spin-slow': 'spin 2s linear infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                fadeOut: {
                    '0%': { opacity: '1' },
                    '100%': { opacity: '0' },
                },
                slideInRight: {
                    '0%': { opacity: '0', transform: 'translateX(100%)' },
                    '100%': { opacity: '1', transform: 'translateX(0)' },
                },
                slideUp: {
                    '0%': { opacity: '1', transform: 'translateY(0)' },
                    '100%': { opacity: '0', transform: 'translateY(-10px)' },
                },
                scaleIn: {
                    '0%': { opacity: '0', transform: 'scale(0.95)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
            },
            transitionTimingFunction: {
                'ease-out-custom': 'cubic-bezier(0.4, 0, 0.2, 1)',
                'ease-spring': 'cubic-bezier(0.16, 1, 0.3, 1)',
            },
            maxWidth: {
                'container': '1400px',
            },
        },
    },
    plugins: [
        function({ addUtilities }) {
            addUtilities({
                '.text-balance': {
                    'text-wrap': 'balance',
                },
            })
        },
    ],
}
