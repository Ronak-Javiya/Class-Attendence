/**
 * ThemeContext — Manages Light/Dark theme state
 * Persists preference to localStorage and applies `.dark` class to <html>
 */

import * as React from 'react';
import { STORAGE_KEYS } from '@/lib/constants';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = React.createContext<ThemeContextType>({
    theme: 'light',
    toggleTheme: () => { },
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = React.useState<Theme>(() => {
        const stored = localStorage.getItem(STORAGE_KEYS.THEME);
        if (stored === 'dark' || stored === 'light') return stored;
        // Respect system preference
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
        return 'light';
    });

    React.useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem(STORAGE_KEYS.THEME, theme);
    }, [theme]);

    const toggleTheme = React.useCallback(() => {
        setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    }, []);

    const value = React.useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = React.useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

export default ThemeContext;
