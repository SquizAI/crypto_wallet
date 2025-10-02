/**
 * Alert Component - Glassmorphic Design
 *
 * Premium alerts with glass effect and glow icons.
 * October 2025 - Modern UI Design
 */

'use client';

import { type ReactNode, type HTMLAttributes } from 'react';

export type AlertVariant = 'info' | 'success' | 'warning' | 'danger' | 'error';

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Alert variant
   * @default 'info'
   */
  variant?: AlertVariant;

  /**
   * Alert title
   */
  title?: string;

  /**
   * Alert content
   */
  children: ReactNode;

  /**
   * Show icon
   * @default true
   */
  showIcon?: boolean;
}

const variantStyles = {
  info: {
    container: 'glass border-blue-400/30 text-blue-100',
    title: 'text-blue-50',
    iconBg: 'bg-blue-500/20',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="w-5 h-5 text-blue-400"
      >
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  success: {
    container: 'glass border-green-400/30 text-green-100',
    title: 'text-green-50',
    iconBg: 'bg-green-500/20',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="w-5 h-5 text-green-400"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  warning: {
    container: 'glass border-amber-400/30 text-amber-100',
    title: 'text-amber-50',
    iconBg: 'bg-amber-500/20',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="w-5 h-5 text-amber-400"
      >
        <path
          fillRule="evenodd"
          d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  danger: {
    container: 'glass border-red-400/30 text-red-100',
    title: 'text-red-50',
    iconBg: 'bg-red-500/20',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="w-5 h-5 text-red-400"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  error: {
    container: 'glass border-red-400/30 text-red-100',
    title: 'text-red-50',
    iconBg: 'bg-red-500/20',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="w-5 h-5 text-red-400"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
};

/**
 * Glassmorphic alert component for displaying important messages
 */
export function Alert({
  variant = 'info',
  title,
  children,
  showIcon = true,
  className = '',
  ...props
}: AlertProps) {
  const styles = variantStyles[variant];

  return (
    <div
      role="alert"
      className={`
        border rounded-xl p-4
        ${styles.container}
        ${className}
      `}
      {...props}
    >
      <div className="flex gap-3">
        {showIcon && (
          <div className="flex-shrink-0">
            <div className={`w-8 h-8 rounded-lg ${styles.iconBg} flex items-center justify-center`}>
              {styles.icon}
            </div>
          </div>
        )}

        <div className="flex-1">
          {title && (
            <h4 className={`font-bold mb-1 ${styles.title}`}>{title}</h4>
          )}
          <div className="text-sm leading-relaxed">{children}</div>
        </div>
      </div>
    </div>
  );
}
