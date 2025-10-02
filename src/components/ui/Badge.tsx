/**
 * Badge Component
 *
 * Status badge for displaying transaction statuses and other labels.
 */

'use client';

import type { ReactNode } from 'react';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
  /**
   * Badge visual variant
   * @default 'neutral'
   */
  variant?: BadgeVariant;

  /**
   * Badge size
   * @default 'md'
   */
  size?: BadgeSize;

  /**
   * Badge content
   */
  children: ReactNode;

  /**
   * Additional class names
   */
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-green-500/20 text-green-400 border-green-500/30',
  warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  error: 'bg-red-500/20 text-red-400 border-red-500/30',
  info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  neutral: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

/**
 * Badge component for status indicators
 */
export function Badge({
  variant = 'neutral',
  size = 'md',
  children,
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center justify-center
        font-medium rounded-full border
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}

/**
 * Transaction Status Badge
 * Specialized badge for transaction statuses
 */
export interface TransactionStatusBadgeProps {
  status: 'pending' | 'confirmed' | 'failed';
  size?: BadgeSize;
  className?: string;
}

export function TransactionStatusBadge({
  status,
  size = 'md',
  className = '',
}: TransactionStatusBadgeProps) {
  const variantMap: Record<string, BadgeVariant> = {
    pending: 'warning',
    confirmed: 'success',
    failed: 'error',
  };

  const labelMap: Record<string, string> = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    failed: 'Failed',
  };

  return (
    <Badge variant={variantMap[status]} size={size} className={className}>
      <span className="flex items-center gap-1.5">
        {status === 'pending' && (
          <svg
            className="animate-spin h-3 w-3"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
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
        )}
        {status === 'confirmed' && (
          <svg
            className="h-3 w-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
        {status === 'failed' && (
          <svg
            className="h-3 w-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        )}
        {labelMap[status]}
      </span>
    </Badge>
  );
}
