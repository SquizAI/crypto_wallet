/**
 * Environment Variables Validation
 *
 * This module validates all environment variables at runtime using Zod.
 * It ensures type safety and provides clear error messages if required
 * variables are missing or invalid.
 */

import { z } from 'zod';

/**
 * Environment variables schema
 * All NEXT_PUBLIC_* variables are accessible on the client side
 */
const envSchema = z.object({
  /**
   * Ethereum network to connect to
   * - mainnet: Production Ethereum network
   * - sepolia: Ethereum test network
   */
  NEXT_PUBLIC_NETWORK: z.enum(['mainnet', 'sepolia']),

  /**
   * RPC URL for connecting to Ethereum network
   * Should be a full URL including API key
   */
  NEXT_PUBLIC_RPC_URL: z.string().url({
    message: 'NEXT_PUBLIC_RPC_URL must be a valid URL',
  }),

  /**
   * Enable/disable analytics tracking
   * Converts string 'true'/'false' to boolean
   */
  NEXT_PUBLIC_ENABLE_ANALYTICS: z
    .string()
    .transform((val) => val === 'true')
    .pipe(z.boolean()),

  /**
   * Sentry DSN for error tracking (optional)
   * Only validated if provided
   */
  NEXT_PUBLIC_SENTRY_DSN: z
    .string()
    .url({
      message: 'NEXT_PUBLIC_SENTRY_DSN must be a valid URL',
    })
    .optional(),
});

/**
 * Validated environment variables
 * Use this export throughout the application to access env vars
 */
export const env = envSchema.parse({
  NEXT_PUBLIC_NETWORK: process.env.NEXT_PUBLIC_NETWORK,
  NEXT_PUBLIC_RPC_URL: process.env.NEXT_PUBLIC_RPC_URL,
  NEXT_PUBLIC_ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS,
  NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
});

/**
 * Type-safe environment variables
 * Inferred from the Zod schema
 */
export type Env = z.infer<typeof envSchema>;

/**
 * Helper function to check if we're on mainnet
 */
export const isMainnet = () => env.NEXT_PUBLIC_NETWORK === 'mainnet';

/**
 * Helper function to check if we're on a testnet
 */
export const isTestnet = () => env.NEXT_PUBLIC_NETWORK === 'sepolia';
