/**
 * Token Selector Component
 *
 * Dropdown for selecting tokens in swap interface
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { TOKENS, type TokenSymbol } from '@/constants/tokens';

interface TokenSelectorProps {
  /**
   * Currently selected token
   */
  selectedToken: TokenSymbol;

  /**
   * Callback when token is selected
   */
  onSelect: (token: TokenSymbol) => void;

  /**
   * Token to exclude from list (opposite side of swap)
   */
  excludeToken?: TokenSymbol;

  /**
   * Disabled state
   */
  disabled?: boolean;

  /**
   * Custom label
   */
  label?: string;
}

export function TokenSelector({
  selectedToken,
  onSelect,
  excludeToken,
  disabled = false,
  label,
}: TokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedTokenConfig = TOKENS[selectedToken];
  const availableTokens = Object.keys(TOKENS).filter(
    (symbol) => symbol !== excludeToken
  ) as TokenSymbol[];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleSelect = (token: TokenSymbol) => {
    onSelect(token);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-400 mb-2">
          {label}
        </label>
      )}

      {/* Selected Token Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full flex items-center gap-3 px-4 py-3 rounded-xl
          border border-white/10 bg-white/5
          transition-all duration-200
          ${
            disabled
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-white/10 hover:border-white/20 active:bg-white/15'
          }
        `}
      >
        <div className="flex items-center gap-3 flex-1">
          {selectedTokenConfig.logoUrl && (
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
              <Image
                src={selectedTokenConfig.logoUrl}
                alt={selectedTokenConfig.symbol}
                width={32}
                height={32}
                className="w-6 h-6"
              />
            </div>
          )}
          <div className="flex flex-col items-start">
            <span className="text-white font-semibold">
              {selectedTokenConfig.symbol}
            </span>
            <span className="text-xs text-gray-400">
              {selectedTokenConfig.name}
            </span>
          </div>
        </div>

        {/* Chevron Icon */}
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && !disabled && (
        <div
          className="absolute z-50 w-full mt-2 rounded-xl border border-white/10 bg-gray-900/95 backdrop-blur-xl shadow-2xl overflow-hidden animate-fadeIn"
        >
          <div className="py-2">
            {availableTokens.map((symbol) => {
              const token = TOKENS[symbol];
              const isSelected = symbol === selectedToken;

              return (
                <button
                  key={symbol}
                  type="button"
                  onClick={() => handleSelect(symbol)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3
                    transition-colors duration-200
                    ${
                      isSelected
                        ? 'bg-blue-500/20 text-white'
                        : 'hover:bg-white/5 text-gray-300'
                    }
                  `}
                >
                  {token.logoUrl && (
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                      <Image
                        src={token.logoUrl}
                        alt={token.symbol}
                        width={32}
                        height={32}
                        className="w-6 h-6"
                      />
                    </div>
                  )}
                  <div className="flex flex-col items-start flex-1">
                    <span className="font-semibold">{token.symbol}</span>
                    <span className="text-xs text-gray-400">{token.name}</span>
                  </div>

                  {isSelected && (
                    <svg
                      className="w-5 h-5 text-blue-400"
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
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
