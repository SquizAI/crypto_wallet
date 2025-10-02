/**
 * Network Switcher Component
 *
 * Dropdown component for switching between supported networks
 * Features:
 * - Visual network indicators with colors and icons
 * - Loading states during network switching
 * - Error handling
 * - Glassmorphic design
 * - Mobile responsive
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useNetwork } from '@/hooks/useNetwork';
import { getAllNetworks } from '@/config/networks';
import type { NetworkId } from '@/types/network';

/**
 * Network icon component
 */
function NetworkIcon({ icon, color, size = 20 }: { icon: string; color: string; size?: number }) {
  return (
    <div
      className="rounded-full flex items-center justify-center font-semibold text-white"
      style={{
        backgroundColor: color,
        width: size,
        height: size,
        fontSize: size * 0.5,
      }}
    >
      {icon === 'ethereum' && '♦'}
      {icon === 'polygon' && '◆'}
      {icon === 'arbitrum' && '◢'}
      {icon === 'optimism' && '○'}
      {icon === 'base' && '◉'}
    </div>
  );
}

/**
 * Network Switcher Component
 */
export function NetworkSwitcher() {
  const {
    currentNetwork,
    networkConfig,
    availableNetworks,
    isLoading,
    switchNetwork,
    error,
    clearError,
  } = useNetwork();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const networks = getAllNetworks();

  /**
   * Close dropdown when clicking outside
   */
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

  /**
   * Handle network selection
   */
  const handleNetworkSelect = async (networkId: NetworkId) => {
    setIsOpen(false);
    clearError();

    try {
      await switchNetwork(networkId);
    } catch (err) {
      console.error('Failed to switch network:', err);
    }
  };

  /**
   * Toggle dropdown
   */
  const toggleDropdown = () => {
    if (!isLoading) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Selected Network Button */}
      <button
        onClick={toggleDropdown}
        disabled={isLoading}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Switch network"
        aria-expanded={isOpen}
      >
        <NetworkIcon icon={networkConfig.icon} color={networkConfig.color} size={20} />
        <span className="font-medium text-sm text-gray-900 hidden sm:inline">
          {networkConfig.shortName}
        </span>
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        ) : (
          <svg
            className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-56 rounded-lg border border-gray-200 bg-white/95 backdrop-blur-md shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-2">
            <div className="px-3 py-2 mb-2 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Select Network
              </p>
            </div>

            {/* Network Options */}
            <div className="space-y-1">
              {networks.map((network) => {
                const isSelected = network.id === currentNetwork;
                const isAvailable = availableNetworks.includes(network.id);

                return (
                  <button
                    key={network.id}
                    onClick={() => handleNetworkSelect(network.id)}
                    disabled={!isAvailable || isSelected}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                      isSelected
                        ? 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200'
                        : 'hover:bg-gray-50'
                    } ${!isAvailable ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <NetworkIcon icon={network.icon} color={network.color} size={24} />
                    <div className="flex-1 text-left">
                      <p className="font-medium text-sm text-gray-900">{network.name}</p>
                      <p className="text-xs text-gray-500">Chain ID: {network.chainId}</p>
                    </div>
                    {isSelected && (
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Network Info Footer */}
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="px-3 py-2 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600">
                  <span className="font-medium">Current:</span> {networkConfig.name}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Explorer: {networkConfig.blockExplorer.name}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div className="absolute top-full right-0 mt-2 w-72 p-4 rounded-lg bg-red-50 border border-red-200 shadow-lg z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-900">Network Error</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
            <button
              onClick={clearError}
              className="text-red-400 hover:text-red-600 transition-colors"
              aria-label="Close error"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Compact Network Indicator (for mobile/minimal display)
 */
export function NetworkIndicator() {
  const { networkConfig } = useNetwork();

  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-full border"
      style={{
        borderColor: networkConfig.color,
        backgroundColor: `${networkConfig.color}15`,
      }}
    >
      <NetworkIcon icon={networkConfig.icon} color={networkConfig.color} size={16} />
      <span className="text-xs font-medium" style={{ color: networkConfig.color }}>
        {networkConfig.shortName}
      </span>
    </div>
  );
}

/**
 * Network Badge (for displaying network in lists)
 */
export function NetworkBadge({ networkId }: { networkId: NetworkId }) {
  const networks = getAllNetworks();
  const network = networks.find((n) => n.id === networkId);

  if (!network) return null;

  return (
    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-100">
      <NetworkIcon icon={network.icon} color={network.color} size={14} />
      <span className="text-xs font-medium text-gray-700">{network.shortName}</span>
    </div>
  );
}
