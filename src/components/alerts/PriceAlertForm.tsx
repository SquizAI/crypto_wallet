/**
 * Price Alert Form Component
 *
 * Form for creating and editing price alerts.
 * Supports multiple alert conditions and validation.
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { AlertToken, AlertCondition, PriceAlert } from '@/types/alerts';

export interface PriceAlertFormProps {
  /**
   * Existing alert to edit (null for new alert)
   */
  alert?: PriceAlert | null;

  /**
   * Form submission handler
   */
  onSubmit: (
    token: AlertToken,
    condition: AlertCondition,
    targetValue: number,
    label?: string
  ) => Promise<void>;

  /**
   * Cancel handler
   */
  onCancel: () => void;

  /**
   * Current token prices for reference
   */
  currentPrices?: Record<AlertToken, number>;
}

const TOKEN_OPTIONS: AlertToken[] = ['USDC', 'USDT', 'DAI'];

const CONDITION_OPTIONS: { value: AlertCondition; label: string }[] = [
  { value: 'above', label: 'Price goes above' },
  { value: 'below', label: 'Price falls below' },
  { value: 'percent_up', label: 'Price increases by %' },
  { value: 'percent_down', label: 'Price decreases by %' },
];

/**
 * PriceAlertForm Component
 */
export function PriceAlertForm({
  alert,
  onSubmit,
  onCancel,
  currentPrices,
}: PriceAlertFormProps) {
  const [token, setToken] = useState<AlertToken>(alert?.token || 'USDC');
  const [condition, setCondition] = useState<AlertCondition>(alert?.condition || 'above');
  const [targetValue, setTargetValue] = useState(
    alert?.targetValue.toString() || ''
  );
  const [label, setLabel] = useState(alert?.label || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update form when alert changes
  useEffect(() => {
    if (alert) {
      setToken(alert.token);
      setCondition(alert.condition);
      setTargetValue(alert.targetValue.toString());
      setLabel(alert.label || '');
    }
  }, [alert]);

  /**
   * Validate form
   */
  const validate = (): boolean => {
    setError(null);

    if (!targetValue || targetValue.trim() === '') {
      setError('Please enter a target value');
      return false;
    }

    const numValue = parseFloat(targetValue);

    if (isNaN(numValue) || numValue <= 0) {
      setError('Target value must be a positive number');
      return false;
    }

    // Validate percentage values
    if (condition === 'percent_up' || condition === 'percent_down') {
      if (numValue > 100) {
        setError('Percentage cannot exceed 100%');
        return false;
      }
    }

    // Validate price values
    if (condition === 'above' || condition === 'below') {
      if (numValue > 10) {
        setError('Price alert seems too high for stablecoins (max $10)');
        return false;
      }
    }

    return true;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const numValue = parseFloat(targetValue);
      await onSubmit(token, condition, numValue, label || undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save alert');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentPrice = currentPrices?.[token];
  const isPercentageCondition = condition === 'percent_up' || condition === 'percent_down';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Token Selection */}
      <div>
        <label htmlFor="token" className="block text-sm font-medium text-gray-300 mb-2">
          Token
        </label>
        <select
          id="token"
          value={token}
          onChange={(e) => setToken(e.target.value as AlertToken)}
          className="w-full px-4 py-3 rounded-xl glass text-white border border-white/10
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     transition-all duration-200"
          disabled={isSubmitting}
        >
          {TOKEN_OPTIONS.map((t) => (
            <option key={t} value={t} className="bg-slate-800">
              {t}
              {currentPrices?.[t] && ` ($${currentPrices[t].toFixed(4)})`}
            </option>
          ))}
        </select>
      </div>

      {/* Condition Selection */}
      <div>
        <label htmlFor="condition" className="block text-sm font-medium text-gray-300 mb-2">
          Alert Condition
        </label>
        <select
          id="condition"
          value={condition}
          onChange={(e) => setCondition(e.target.value as AlertCondition)}
          className="w-full px-4 py-3 rounded-xl glass text-white border border-white/10
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     transition-all duration-200"
          disabled={isSubmitting}
        >
          {CONDITION_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-slate-800">
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Target Value */}
      <div>
        <label htmlFor="targetValue" className="block text-sm font-medium text-gray-300 mb-2">
          Target {isPercentageCondition ? 'Percentage' : 'Price'}
        </label>
        <div className="relative">
          <Input
            id="targetValue"
            type="number"
            step={isPercentageCondition ? '0.01' : '0.0001'}
            value={targetValue}
            onChange={(e) => setTargetValue(e.target.value)}
            placeholder={isPercentageCondition ? '5.0' : '1.0000'}
            disabled={isSubmitting}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
            {isPercentageCondition ? '%' : '$'}
          </span>
        </div>
        {currentPrice && (
          <p className="mt-2 text-xs text-gray-400">
            Current {token} price: ${currentPrice.toFixed(4)}
          </p>
        )}
      </div>

      {/* Label (Optional) */}
      <div>
        <label htmlFor="label" className="block text-sm font-medium text-gray-300 mb-2">
          Label <span className="text-gray-500">(Optional)</span>
        </label>
        <Input
          id="label"
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g., USDC dip opportunity"
          disabled={isSubmitting}
          maxLength={50}
        />
        <p className="mt-1 text-xs text-gray-500">Give your alert a memorable name</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          type="submit"
          variant="primary"
          fullWidth
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          {alert ? 'Update Alert' : 'Create Alert'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          fullWidth
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
