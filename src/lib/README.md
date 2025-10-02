# Environment Configuration

This directory contains the environment validation module for the stablecoin wallet project.

## Usage

Import the validated environment variables in any component or module:

```typescript
import { env, isMainnet, isTestnet } from '@/lib/env';

// Access validated environment variables
const rpcUrl = env.NEXT_PUBLIC_RPC_URL;
const network = env.NEXT_PUBLIC_NETWORK;

// Use helper functions
if (isMainnet()) {
  console.log('Running on Ethereum mainnet');
}

if (env.NEXT_PUBLIC_ENABLE_ANALYTICS) {
  // Initialize analytics
}
```

## Setup

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your actual values in `.env.local`:
   - Get an Alchemy API key from https://www.alchemy.com/
   - Or use Infura from https://www.infura.io/
   - Replace `YOUR_ALCHEMY_API_KEY` with your actual key

3. The validation will run automatically when the app starts

## Environment Variables

- **NEXT_PUBLIC_NETWORK**: Network to connect to (`mainnet` or `sepolia`)
- **NEXT_PUBLIC_RPC_URL**: RPC endpoint URL with API key
- **NEXT_PUBLIC_ENABLE_ANALYTICS**: Enable analytics tracking (`true` or `false`)
- **NEXT_PUBLIC_SENTRY_DSN**: Optional Sentry DSN for error tracking

## Type Safety

The `env` object is fully typed and validated at runtime using Zod. If any required variable is missing or invalid, the app will fail to start with a clear error message.
