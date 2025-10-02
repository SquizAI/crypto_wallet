/**
 * Dropdown Component
 *
 * Select dropdown with custom styling and keyboard navigation.
 */

'use client';

import { forwardRef, type SelectHTMLAttributes } from 'react';

export interface DropdownOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface DropdownProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  /**
   * Dropdown label
   */
  label?: string;

  /**
   * Options for the dropdown
   */
  options: DropdownOption[];

  /**
   * Error message to display
   */
  error?: string;

  /**
   * Helper text to display below dropdown
   */
  helperText?: string;

  /**
   * Full width dropdown
   * @default false
   */
  fullWidth?: boolean;

  /**
   * Placeholder text
   */
  placeholder?: string;
}

/**
 * Dropdown select component
 */
export const Dropdown = forwardRef<HTMLSelectElement, DropdownProps>(
  (
    {
      label,
      options,
      error,
      helperText,
      fullWidth = false,
      placeholder,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const dropdownId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className={`${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label
            htmlFor={dropdownId}
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            {label}
          </label>
        )}

        <select
          ref={ref}
          id={dropdownId}
          className={`
            w-full px-4 py-2
            border rounded-lg
            glass text-white
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-slate-900
            disabled:opacity-50 disabled:cursor-not-allowed
            appearance-none
            ${
              error
                ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                : 'border-white/20 focus:ring-blue-400 focus:border-blue-400'
            }
            ${className}
          `}
          aria-invalid={!!error}
          aria-describedby={
            error
              ? `${dropdownId}-error`
              : helperText
              ? `${dropdownId}-helper`
              : undefined
          }
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
            backgroundPosition: 'right 0.5rem center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '1.5em 1.5em',
            paddingRight: '2.5rem',
          }}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>

        {error && (
          <p
            id={`${dropdownId}-error`}
            className="mt-1 text-sm text-red-600"
            role="alert"
          >
            {error}
          </p>
        )}

        {helperText && !error && (
          <p id={`${dropdownId}-helper`} className="mt-1 text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Dropdown.displayName = 'Dropdown';
