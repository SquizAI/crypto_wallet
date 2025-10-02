/**
 * Theme Toggle Component
 *
 * Interactive switch to toggle between dark and light themes.
 * Features animated sun/moon icons and smooth transitions.
 *
 * @example
 * ```tsx
 * <ThemeToggle />
 * ```
 */

'use client';

import { useTheme } from '@/context/ThemeContext';

/**
 * ThemeToggle Component Props
 */
interface ThemeToggleProps {
  /** Optional additional CSS classes */
  className?: string;
  /** Show theme label text */
  showLabel?: boolean;
}

/**
 * Sun Icon Component
 */
function SunIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  );
}

/**
 * Moon Icon Component
 */
function MoonIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
      />
    </svg>
  );
}

/**
 * ThemeToggle Component
 *
 * Provides a toggle switch to change between dark and light themes.
 * Displays current theme with animated icon transition.
 */
export function ThemeToggle({ className = '', showLabel = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative flex items-center gap-3 p-3 sm:p-4 rounded-xl
        bg-white/5 hover:bg-white/10 active:bg-white/15
        border border-white/10
        transition-all touch-manipulation
        ${className}
      `}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      role="switch"
      aria-checked={isDark}
    >
      {/* Icon Container with Toggle Switch */}
      <div className="flex items-center gap-3 w-full">
        {/* Switch Background */}
        <div className="relative w-14 h-8 bg-white/10 rounded-full transition-colors">
          {/* Switch Handle */}
          <div
            className={`
              absolute top-1 left-1 w-6 h-6 rounded-full
              bg-white shadow-lg
              flex items-center justify-center
              transition-all duration-300
              ${isDark ? 'translate-x-0' : 'translate-x-6'}
            `}
          >
            {/* Animated Icon */}
            <div className="relative w-4 h-4">
              <div
                className={`
                  absolute inset-0 transition-all duration-300
                  ${isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-180 scale-0'}
                `}
              >
                <MoonIcon className="w-4 h-4 text-blue-600" />
              </div>
              <div
                className={`
                  absolute inset-0 transition-all duration-300
                  ${isDark ? 'opacity-0 rotate-180 scale-0' : 'opacity-100 rotate-0 scale-100'}
                `}
              >
                <SunIcon className="w-4 h-4 text-amber-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Label (Optional) */}
        {showLabel && (
          <div className="flex-1 text-left">
            <p className="text-sm sm:text-base text-white font-medium">
              {isDark ? 'Dark Mode' : 'Light Mode'}
            </p>
            <p className="text-xs text-gray-400">
              {isDark ? 'Using dark theme' : 'Using light theme'}
            </p>
          </div>
        )}
      </div>

      {/* Current Theme Badge (Alternative to label) */}
      {!showLabel && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">
            {isDark ? 'Dark' : 'Light'}
          </span>
        </div>
      )}
    </button>
  );
}

/**
 * Compact Theme Toggle Button
 *
 * Smaller version without labels, ideal for headers/navbars.
 *
 * @example
 * ```tsx
 * <CompactThemeToggle />
 * ```
 */
export function CompactThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative p-2 rounded-lg
        bg-white/5 hover:bg-white/10 active:bg-white/15
        border border-white/10
        transition-all touch-manipulation
        ${className}
      `}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      role="switch"
      aria-checked={isDark}
    >
      <div className="relative w-5 h-5">
        {/* Moon Icon (Dark Mode) */}
        <div
          className={`
            absolute inset-0 transition-all duration-300
            ${isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-180 scale-0'}
          `}
        >
          <MoonIcon className="w-5 h-5 text-blue-400" />
        </div>
        {/* Sun Icon (Light Mode) */}
        <div
          className={`
            absolute inset-0 transition-all duration-300
            ${isDark ? 'opacity-0 rotate-180 scale-0' : 'opacity-100 rotate-0 scale-100'}
          `}
        >
          <SunIcon className="w-5 h-5 text-amber-500" />
        </div>
      </div>
    </button>
  );
}
