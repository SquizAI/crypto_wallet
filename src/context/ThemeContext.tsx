/**
 * Theme Context
 *
 * Manages application theme state (dark/light mode) with:
 * - System preference detection
 * - localStorage persistence
 * - Smooth theme transitions
 * - CSS class application to document root
 *
 * @example
 * ```tsx
 * const { theme, toggleTheme, setTheme } = useTheme();
 *
 * // Toggle between themes
 * <button onClick={toggleTheme}>Toggle Theme</button>
 *
 * // Set specific theme
 * <button onClick={() => setTheme('light')}>Light Mode</button>
 * ```
 */

'use client';

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';

/**
 * Theme Types
 */
export type Theme = 'dark' | 'light';

/**
 * Theme Context Value
 */
interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  systemTheme: Theme;
}

/**
 * Local Storage Key
 */
const THEME_STORAGE_KEY = 'stablecoin-wallet-theme';

/**
 * Theme Context
 */
const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Get System Theme Preference
 */
function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  return mediaQuery.matches ? 'dark' : 'light';
}

/**
 * Get Initial Theme
 * Priority: localStorage > system preference > default (dark)
 */
function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';

  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') {
      return stored;
    }
  } catch (error) {
    console.error('Error reading theme from localStorage:', error);
  }

  return getSystemTheme();
}

/**
 * Apply Theme to Document
 */
function applyTheme(theme: Theme) {
  if (typeof window === 'undefined') return;

  const root = document.documentElement;

  // Remove existing theme classes
  root.classList.remove('dark', 'light');

  // Add new theme class
  root.classList.add(theme);

  // Update meta theme-color for mobile browsers
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute(
      'content',
      theme === 'dark' ? '#0d1117' : '#ffffff'
    );
  }
}

/**
 * Theme Provider Props
 */
interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * Theme Provider Component
 *
 * Provides theme state and controls to the application.
 * Handles system preference detection, persistence, and theme application.
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [systemTheme, setSystemTheme] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  // Initialize theme on mount
  useEffect(() => {
    const initialTheme = getInitialTheme();
    const initialSystemTheme = getSystemTheme();

    setThemeState(initialTheme);
    setSystemTheme(initialSystemTheme);
    applyTheme(initialTheme);
    setMounted(true);
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      const newSystemTheme = e.matches ? 'dark' : 'light';
      setSystemTheme(newSystemTheme);

      // If user hasn't set a preference, follow system theme
      try {
        const stored = localStorage.getItem(THEME_STORAGE_KEY);
        if (!stored) {
          setThemeState(newSystemTheme);
          applyTheme(newSystemTheme);
        }
      } catch (error) {
        console.error('Error checking theme preference:', error);
      }
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    // Legacy browsers
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  /**
   * Set Theme
   * Persists to localStorage and applies to document
   */
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    applyTheme(newTheme);

    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (error) {
      console.error('Error saving theme to localStorage:', error);
    }
  }, []);

  /**
   * Toggle Theme
   * Switches between dark and light modes
   */
  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  /**
   * Context Value
   */
  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme,
      toggleTheme,
      systemTheme,
    }),
    [theme, setTheme, toggleTheme, systemTheme]
  );

  // Prevent flash of incorrect theme on SSR
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * useTheme Hook
 *
 * Access theme state and controls from any component.
 *
 * @throws {Error} If used outside of ThemeProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { theme, toggleTheme } = useTheme();
 *
 *   return (
 *     <button onClick={toggleTheme}>
 *       Current theme: {theme}
 *     </button>
 *   );
 * }
 * ```
 */
export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }

  return context;
}
