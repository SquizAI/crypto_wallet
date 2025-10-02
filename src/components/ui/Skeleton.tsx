/**
 * Skeleton Component
 *
 * Loading skeleton for content placeholders during data fetching.
 */

'use client';

export interface SkeletonProps {
  /**
   * Width of skeleton (CSS value)
   * @default '100%'
   */
  width?: string | number;

  /**
   * Height of skeleton (CSS value)
   * @default '1rem'
   */
  height?: string | number;

  /**
   * Border radius
   * @default 'md'
   */
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';

  /**
   * Additional class names
   */
  className?: string;
}

const roundedStyles = {
  none: '',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full',
};

/**
 * Skeleton loading placeholder
 */
export function Skeleton({
  width = '100%',
  height = '1rem',
  rounded = 'md',
  className = '',
}: SkeletonProps) {
  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div
      className={`bg-white/5 animate-pulse ${roundedStyles[rounded]} ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}

/**
 * Balance Card Skeleton
 */
export function BalanceCardSkeleton() {
  return (
    <div className="p-6 bg-white rounded-lg border border-gray-200">
      <div className="flex items-center gap-3 mb-4">
        <Skeleton width={40} height={40} rounded="full" />
        <Skeleton width={80} height={20} />
      </div>
      <Skeleton width="60%" height={32} className="mb-2" />
      <Skeleton width="40%" height={16} className="mb-4" />
      <div className="flex gap-2">
        <Skeleton width="48%" height={36} rounded="lg" />
        <Skeleton width="48%" height={36} rounded="lg" />
      </div>
    </div>
  );
}

/**
 * Transaction List Item Skeleton
 */
export function TransactionItemSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200">
      <div className="flex items-center gap-3">
        <Skeleton width={40} height={40} rounded="full" />
        <div className="space-y-2">
          <Skeleton width={120} height={16} />
          <Skeleton width={80} height={14} />
        </div>
      </div>
      <div className="text-right space-y-2">
        <Skeleton width={100} height={16} />
        <Skeleton width={60} height={14} />
      </div>
    </div>
  );
}

/**
 * Transaction List Skeleton
 */
export function TransactionListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {Array.from({ length: count }).map((_, i) => (
        <TransactionItemSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Dashboard Header Skeleton
 */
export function DashboardHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
      <Skeleton width={120} height={32} />
      <div className="flex items-center gap-3">
        <Skeleton width={150} height={36} rounded="lg" />
        <Skeleton width={80} height={36} rounded="lg" />
      </div>
    </div>
  );
}
