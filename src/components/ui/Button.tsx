/**
 * Button Component - Glassmorphic Design
 *
 * Premium button with gradient backgrounds, glow effects, and smooth animations.
 * October 2025 - Modern UI Design
 */

'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Button visual variant
   * @default 'primary'
   */
  variant?: ButtonVariant;

  /**
   * Button size
   * @default 'md'
   */
  size?: ButtonSize;

  /**
   * Show loading spinner
   * @default false
   */
  loading?: boolean;

  /**
   * @deprecated Use loading instead
   */
  isLoading?: boolean;

  /**
   * Full width button
   * @default false
   */
  fullWidth?: boolean;

  /**
   * Button content
   */
  children: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: `
    gradient-primary text-white font-semibold
    hover:scale-105 hover-glow-blue
    active:scale-100
    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
    shadow-lg
  `,
  secondary: `
    glass text-white font-medium
    hover:bg-white/20 hover:scale-102
    active:scale-100
    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
  `,
  danger: `
    gradient-danger text-white font-semibold
    hover:scale-105 glow-red
    active:scale-100
    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
    shadow-lg
  `,
  success: `
    bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold
    hover:scale-105 shadow-lg shadow-green-500/30
    active:scale-100
    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
  `,
  ghost: `
    bg-transparent text-gray-300
    hover:bg-white/10 hover:text-white
    active:bg-white/20
    disabled:opacity-50 disabled:cursor-not-allowed
  `,
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-2.5 text-base',
  lg: 'px-8 py-3.5 text-lg',
};

/**
 * Button component with glassmorphic design and loading state
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      isLoading = false,
      fullWidth = false,
      disabled,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const showLoading = loading || isLoading;

    return (
      <button
        ref={ref}
        disabled={disabled || showLoading}
        className={`
          rounded-xl font-medium
          transition-all duration-300 ease-out
          focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-900
          ripple
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        {...props}
      >
        {showLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Loading...</span>
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
