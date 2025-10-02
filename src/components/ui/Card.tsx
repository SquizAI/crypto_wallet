/**
 * Card Component - Glassmorphic Design
 *
 * Premium glassmorphic cards with blur effects and smooth animations.
 * October 2025 - Modern UI Design
 */

'use client';

import { type ReactNode, type HTMLAttributes } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Card content
   */
  children: ReactNode;

  /**
   * Card variant
   * @default 'default'
   */
  variant?: 'default' | 'elevated' | 'outlined';

  /**
   * Card padding size
   * @default 'md'
   */
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const variantStyles = {
  default: 'glass-card',
  elevated: 'glass-strong card-lift',
  outlined: 'glass border-2 border-white/20',
};

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

/**
 * Glassmorphic card container component
 */
export function Card({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  ...props
}: CardProps) {
  return (
    <div
      className={`
        rounded-2xl
        ${variantStyles[variant]}
        ${paddingStyles[padding]}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Card Header
 */
export function CardHeader({
  children,
  className = '',
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`mb-6 ${className}`} {...props}>
      {children}
    </div>
  );
}

/**
 * Card Title
 */
export function CardTitle({
  children,
  className = '',
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={`text-2xl md:text-3xl font-bold text-white tracking-tight ${className}`} {...props}>
      {children}
    </h3>
  );
}

/**
 * Card Description
 */
export function CardDescription({
  children,
  className = '',
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={`text-base text-gray-300 mt-2 leading-relaxed ${className}`} {...props}>
      {children}
    </p>
  );
}

/**
 * Card Content
 */
export function CardContent({
  children,
  className = '',
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}

/**
 * Card Footer
 */
export function CardFooter({
  children,
  className = '',
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`mt-6 pt-6 border-t border-white/10 ${className}`} {...props}>
      {children}
    </div>
  );
}
