# Wallet Onboarding Components

Complete wallet onboarding UI flow for creating and importing wallets. This is the first user-facing interface users will see when they open the app.

## Components Overview

### UI Components (`/ui`)
Reusable UI components that follow consistent design patterns:

- **Button** - Versatile button with variants (primary, secondary, danger, ghost), sizes, and loading states
- **Input** - Input field with label, error, and helper text support
- **PasswordInput** - Input with show/hide toggle and password strength indicator
- **Card** - Container component with header, content, and footer sections
- **Alert** - Alert messages with severity levels (info, success, warning, danger)

### Wallet Components (`/wallet`)
Wallet-specific components for the onboarding flow:

- **OnboardingLayout** - Main orchestrator for the wallet setup flow
- **CreateWallet** - New wallet creation with password setup
- **RecoveryPhrase** - Display and secure storage of 12-word mnemonic
- **ImportWallet** - Import existing wallet from recovery phrase

## Features

### CreateWallet
- Password strength indicator with real-time feedback
- Password requirements checklist with visual indicators
- Password confirmation validation
- Secure wallet creation process
- Error handling and display

### RecoveryPhrase
- 12-word mnemonic displayed in numbered grid (3 columns, 4 rows)
- Copy to clipboard functionality
- Download as text file option
- Comprehensive security warnings
- Confirmation checkbox before proceeding
- Automatic mnemonic clearing from memory

### ImportWallet
- Tab switcher for import methods (Recovery Phrase / Private Key)
- 12/24 word mnemonic validation
- Password setup for wallet encryption
- Password confirmation
- Input validation with helpful error messages

### OnboardingLayout
- Welcome screen with feature highlights
- Action buttons for create/import
- Responsive, gradient background design
- Flow orchestration between components
- Success confirmation screen

## Usage Examples

### Basic Integration

```tsx
// app/page.tsx
'use client';

import { OnboardingLayout } from '@/components/wallet/OnboardingLayout';
import { useWallet } from '@/context/WalletContext';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const { hasExistingWallet } = useWallet();

  if (!hasExistingWallet()) {
    return (
      <OnboardingLayout
        onComplete={() => router.push('/dashboard')}
      />
    );
  }

  return <Dashboard />;
}
```

### Individual Component Usage

```tsx
// Create Wallet
import { CreateWallet } from '@/components/wallet/CreateWallet';

function MyCreatePage() {
  const handleSuccess = (mnemonic: string) => {
    console.log('Wallet created, show recovery phrase');
    // Navigate to recovery phrase display
  };

  return (
    <CreateWallet
      onSuccess={handleSuccess}
      onBack={() => router.back()}
    />
  );
}
```

```tsx
// Recovery Phrase
import { RecoveryPhrase } from '@/components/wallet/RecoveryPhrase';

function MyRecoveryPage({ mnemonic }: { mnemonic: string }) {
  const handleConfirm = () => {
    console.log('User confirmed they saved the phrase');
    // Navigate to dashboard
  };

  return (
    <RecoveryPhrase
      mnemonic={mnemonic}
      onConfirm={handleConfirm}
    />
  );
}
```

```tsx
// Import Wallet
import { ImportWallet } from '@/components/wallet/ImportWallet';

function MyImportPage() {
  const handleSuccess = () => {
    console.log('Wallet imported successfully');
    // Navigate to dashboard
  };

  return (
    <ImportWallet
      onSuccess={handleSuccess}
      onBack={() => router.back()}
    />
  );
}
```

### Using UI Components

```tsx
import { Button, Input, PasswordInput, Card, Alert } from '@/components/ui';

function MyForm() {
  return (
    <Card variant="elevated" padding="lg">
      <Alert variant="warning" title="Important">
        Please fill out all required fields.
      </Alert>

      <Input
        label="Email"
        type="email"
        error={error}
        helperText="We'll never share your email"
      />

      <PasswordInput
        label="Password"
        showStrength
      />

      <Button
        variant="primary"
        fullWidth
        isLoading={loading}
      >
        Submit
      </Button>
    </Card>
  );
}
```

## Component API Reference

### OnboardingLayout
```tsx
interface OnboardingLayoutProps {
  onComplete: () => void;
}
```

### CreateWallet
```tsx
interface CreateWalletProps {
  onSuccess: (mnemonic: string) => void;
  onBack?: () => void;
}
```

### RecoveryPhrase
```tsx
interface RecoveryPhraseProps {
  mnemonic: string;
  onConfirm: () => void;
}
```

### ImportWallet
```tsx
interface ImportWalletProps {
  onSuccess: () => void;
  onBack?: () => void;
}
```

### Button
```tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
  children: ReactNode;
}
```

### Input
```tsx
interface InputProps {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  // ...standard input props
}
```

### PasswordInput
```tsx
interface PasswordInputProps extends InputProps {
  showStrength?: boolean;
}
```

## Styling

All components use Tailwind CSS with a consistent design system:

- **Primary Color**: Blue (#3B82F6)
- **Success Color**: Green (#10B981)
- **Warning Color**: Yellow/Orange
- **Danger Color**: Red (#EF4444)
- **Background**: Gradient from blue-50 to purple-50
- **Cards**: White with shadows or borders
- **Transitions**: Smooth 200ms duration

## Security Best Practices

The components follow strict security guidelines:

1. **No Console Logging**: Sensitive data (mnemonics, private keys, passwords) are never logged
2. **Memory Clearing**: Sensitive data is cleared from state after use
3. **Secure Display**: Recovery phrases are displayed with warnings
4. **Password Visibility**: Toggle available but default is hidden
5. **Validation**: Strong client-side validation before submission
6. **HTTPS Only**: Should only be served over HTTPS in production

## Accessibility

All components are built with accessibility in mind:

- Proper ARIA labels and roles
- Keyboard navigation support
- Focus management
- Error announcements for screen readers
- Sufficient color contrast
- Responsive touch targets

## Browser Compatibility

- Modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Requires JavaScript enabled
- Local storage support required
- Clipboard API for copy functionality

## File Structure

```
src/components/
├── index.ts                    # Main export
├── ui/
│   ├── index.ts               # UI components export
│   ├── Alert.tsx              # Alert component
│   ├── Button.tsx             # Button component
│   ├── Card.tsx               # Card component
│   ├── Input.tsx              # Input component
│   └── PasswordInput.tsx      # Password input component
└── wallet/
    ├── index.ts               # Wallet components export
    ├── CreateWallet.tsx       # Wallet creation
    ├── ImportWallet.tsx       # Wallet import
    ├── OnboardingLayout.tsx   # Onboarding orchestrator
    └── RecoveryPhrase.tsx     # Recovery phrase display
```

## Next Steps

1. **Testing**: Test the complete onboarding flow
2. **Customization**: Adjust colors and styling to match brand
3. **Validation**: Add BIP39 wordlist validation for mnemonic input
4. **Analytics**: Add event tracking for onboarding steps
5. **Error Recovery**: Implement better error recovery flows
6. **Internationalization**: Add i18n support for multiple languages

## Dependencies

- React 18+
- Next.js 14+
- Tailwind CSS
- WalletContext from `@/context/WalletContext`
- WalletService from `@/services/walletService`

## License

Part of the Stablecoin Wallet application.
