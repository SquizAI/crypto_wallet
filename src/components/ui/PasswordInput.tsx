/**
 * PasswordInput Component - Glassmorphic Design
 *
 * Password input with show/hide toggle and animated strength indicator.
 * October 2025 - Modern UI Design
 */

'use client';

import { forwardRef, useState, type InputHTMLAttributes } from 'react';
import { Input, type InputProps } from './Input';

export interface PasswordInputProps extends Omit<InputProps, 'type'> {
  /**
   * Show password strength indicator
   * @default false
   */
  showStrength?: boolean;
}

/**
 * Calculate password strength (0-4)
 */
function calculatePasswordStrength(password: string): number {
  if (!password) return 0;

  let strength = 0;

  // Length check
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;

  // Character variety checks
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;

  return Math.min(strength, 4);
}

/**
 * Get strength label and gradient color
 */
function getStrengthInfo(strength: number): {
  label: string;
  color: string;
} {
  const strengthMap = {
    0: { label: '', color: 'bg-gray-600' },
    1: { label: 'Weak', color: 'gradient-danger' },
    2: { label: 'Fair', color: 'gradient-warning' },
    3: { label: 'Good', color: 'bg-yellow-400' },
    4: { label: 'Strong', color: 'gradient-success' },
  };

  return strengthMap[strength as keyof typeof strengthMap];
}

/**
 * Password input with show/hide toggle and glassmorphic strength indicator
 */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ showStrength = false, value, onChange, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [internalValue, setInternalValue] = useState('');

    const currentValue = value !== undefined ? String(value) : internalValue;
    const strength = showStrength ? calculatePasswordStrength(currentValue) : 0;
    const strengthInfo = getStrengthInfo(strength);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (value === undefined) {
        setInternalValue(e.target.value);
      }
      onChange?.(e);
    };

    return (
      <div className="relative">
        <Input
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={handleChange}
          {...props}
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-10 text-gray-400 hover:text-white focus:outline-none transition-colors"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          tabIndex={-1}
        >
          {showPassword ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          )}
        </button>

        {showStrength && currentValue && (
          <div className="mt-3">
            <div className="flex gap-2 mb-2">
              {[1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                    level <= strength ? strengthInfo.color : 'bg-white/10'
                  }`}
                />
              ))}
            </div>
            {strengthInfo.label && (
              <p className="text-xs text-gray-300 font-medium">
                Password Strength: <span className="text-white">{strengthInfo.label}</span>
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
