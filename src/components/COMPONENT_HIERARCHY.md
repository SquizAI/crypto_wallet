# Component Hierarchy and Flow

## Visual Component Tree

```
OnboardingLayout (Main Orchestrator)
├── Welcome Screen
│   ├── Card (UI)
│   │   ├── CardContent
│   │   │   ├── Logo/Branding
│   │   │   ├── Feature Grid (3 features)
│   │   │   ├── Button (Primary) → "Create New Wallet"
│   │   │   └── Button (Secondary) → "Import Existing Wallet"
│
├── Create Wallet Flow
│   └── CreateWallet
│       ├── Card (UI)
│       │   ├── CardHeader
│       │   │   ├── CardTitle
│       │   │   └── CardDescription
│       │   └── CardContent
│       │       ├── Alert (error display)
│       │       ├── PasswordInput (password)
│       │       ├── Requirements Checklist
│       │       ├── PasswordInput (confirm)
│       │       ├── Alert (security warning)
│       │       └── Buttons (Back, Create)
│       │
│       └── OnSuccess → RecoveryPhrase
│
├── Recovery Phrase Display
│   └── RecoveryPhrase
│       ├── Card (UI)
│       │   ├── CardHeader
│       │   │   ├── CardTitle
│       │   │   └── CardDescription
│       │   └── CardContent
│       │       ├── Alert (security warnings)
│       │       ├── Mnemonic Grid (12 words, 3x4)
│       │       ├── Button (Copy to Clipboard)
│       │       ├── Button (Download Text File)
│       │       ├── Alert (storage warning)
│       │       ├── Checkbox (confirmation)
│       │       └── Button (Continue)
│       │
│       └── OnConfirm → Complete
│
└── Import Wallet Flow
    └── ImportWallet
        ├── Card (UI)
        │   ├── CardHeader
        │   │   ├── CardTitle
        │   │   └── CardDescription
        │   └── CardContent
        │       ├── Alert (error display)
        │       ├── Tab Buttons (Mnemonic | Private Key)
        │       ├── Conditional Content:
        │       │   ├── Textarea (mnemonic input)
        │       │   └── Input (private key input)
        │       ├── Password Setup Section
        │       │   ├── PasswordInput (password)
        │       │   └── PasswordInput (confirm)
        │       ├── Alert (info)
        │       └── Buttons (Back, Import)
        │
        └── OnSuccess → Complete
```

## User Flow Diagram

```
┌─────────────────┐
│  User Opens App │
└────────┬────────┘
         │
         ▼
  ┌──────────────┐
  │Has Wallet?   │
  └──┬────────┬──┘
     │ No     │ Yes
     ▼        ▼
┌─────────┐  ┌────────────┐
│Welcome  │  │Dashboard   │
│Screen   │  │(Main App)  │
└────┬────┘  └────────────┘
     │
     ├─────────────────┬───────────────────┐
     │                 │                   │
     ▼                 ▼                   ▼
┌──────────┐    ┌──────────┐      ┌──────────────┐
│ Create   │    │ Import   │      │ Import       │
│ Password │    │ Mnemonic │      │ Private Key  │
└────┬─────┘    └────┬─────┘      └──────┬───────┘
     │               │                    │
     ▼               │                    │
┌──────────┐         │                    │
│ Recovery │         │                    │
│ Phrase   │         │                    │
└────┬─────┘         │                    │
     │               │                    │
     ├───────────────┴────────────────────┘
     │
     ▼
┌──────────────┐
│ Success!     │
│ → Dashboard  │
└──────────────┘
```

## State Flow

```
┌────────────────────────────────────────────────────┐
│ WalletContext (Global State)                       │
│                                                     │
│ State:                                             │
│ - address: string | null                          │
│ - isUnlocked: boolean                             │
│ - isLoading: boolean                              │
│ - error: string | null                            │
│                                                     │
│ Methods:                                           │
│ - createWallet(password) → mnemonic              │
│ - importWallet(mnemonic, password)                │
│ - unlock(password)                                │
│ - lock()                                          │
│ - hasExistingWallet() → boolean                   │
│ - clearError()                                    │
└────────────────────────────────────────────────────┘
                          │
                          │ Consumed by
                          ▼
        ┌─────────────────────────────────┐
        │ OnboardingLayout (Local State)   │
        │                                  │
        │ State:                           │
        │ - step: 'welcome' | 'create' |   │
        │         'import' | 'recovery'    │
        │ - mnemonic: string              │
        └─────────────────────────────────┘
                          │
                          │ Passes props to
                          ▼
        ┌─────────────────────────────────┐
        │ Child Components (Local State)   │
        │                                  │
        │ CreateWallet:                    │
        │ - password, confirmPassword      │
        │ - validationError               │
        │                                  │
        │ RecoveryPhrase:                  │
        │ - isSaved, copied               │
        │                                  │
        │ ImportWallet:                    │
        │ - method, mnemonic/privateKey   │
        │ - password, confirmPassword     │
        └─────────────────────────────────┘
```

## Component Dependencies

```
UI Components (Reusable, No Dependencies)
├── Button
├── Input
├── PasswordInput → Input
├── Card
└── Alert

Wallet Components (Business Logic)
├── OnboardingLayout
│   ├── CreateWallet
│   │   ├── Button
│   │   ├── PasswordInput
│   │   ├── Card
│   │   ├── Alert
│   │   └── WalletContext
│   │
│   ├── RecoveryPhrase
│   │   ├── Button
│   │   ├── Card
│   │   └── Alert
│   │
│   └── ImportWallet
│       ├── Button
│       ├── Input
│       ├── PasswordInput
│       ├── Card
│       ├── Alert
│       └── WalletContext
```

## Data Flow Patterns

### 1. Create Wallet Flow
```
User Input (password)
    ↓
CreateWallet Component (validation)
    ↓
WalletContext.createWallet()
    ↓
WalletService.createWallet()
    ↓
Returns: { address, mnemonic }
    ↓
CreateWallet calls onSuccess(mnemonic)
    ↓
OnboardingLayout sets mnemonic & step='recovery'
    ↓
RecoveryPhrase displays mnemonic
    ↓
User confirms
    ↓
OnboardingLayout calls onComplete()
    ↓
Parent navigates to dashboard
```

### 2. Import Wallet Flow
```
User Input (mnemonic + password)
    ↓
ImportWallet Component (validation)
    ↓
WalletContext.importWallet()
    ↓
WalletService.importFromMnemonic()
    ↓
Returns: address
    ↓
ImportWallet calls onSuccess()
    ↓
OnboardingLayout calls onComplete()
    ↓
Parent navigates to dashboard
```

## Styling Architecture

```
Tailwind CSS Design System
├── Colors
│   ├── Primary: blue-600
│   ├── Secondary: gray-200
│   ├── Success: green-500
│   ├── Warning: yellow-500
│   └── Danger: red-500
│
├── Spacing
│   ├── Padding: 4, 6, 8, 12 (Tailwind units)
│   ├── Margin: Same as padding
│   └── Gap: 2, 3, 4, 6
│
├── Typography
│   ├── Headings: text-xl to text-4xl, font-bold/semibold
│   ├── Body: text-sm to text-base
│   └── Labels: text-xs to text-sm
│
├── Responsive Breakpoints
│   ├── Mobile: < 640px (default)
│   ├── Tablet: md: >= 768px
│   └── Desktop: lg: >= 1024px
│
└── Effects
    ├── Transitions: duration-200
    ├── Shadows: shadow-sm to shadow-lg
    ├── Rounded: rounded-lg, rounded-2xl
    └── Gradients: from-blue-50 to-purple-50
```

## File Size Breakdown

```
UI Components:
  Button.tsx          ~129 lines    Variants, sizes, loading
  Input.tsx           ~76 lines     Label, error, validation
  PasswordInput.tsx   ~140 lines    Toggle, strength meter
  Card.tsx            ~96 lines     Compound components
  Alert.tsx           ~125 lines    Severity levels

Wallet Components:
  CreateWallet.tsx    ~231 lines    Password setup, validation
  RecoveryPhrase.tsx  ~195 lines    Display, copy, download
  ImportWallet.tsx    ~268 lines    Tabs, validation
  OnboardingLayout.tsx~259 lines    Flow orchestration

Total: ~1,681 lines of production code
```

## Integration Points

### 1. WalletContext Integration
```tsx
const {
  createWallet,    // Called by CreateWallet
  importWallet,    // Called by ImportWallet
  isLoading,       // Loading state
  error,           // Error display
  clearError       // Clear errors
} = useWallet();
```

### 2. Router Integration
```tsx
import { useRouter } from 'next/navigation';

const router = useRouter();
// After onComplete callback:
router.push('/dashboard');
```

### 3. Local Storage (Automatic)
```
WalletService handles storage:
- Encrypted wallet → localStorage
- Address → localStorage (public)
- No sensitive data in state
```

## Security Boundaries

```
┌─────────────────────────────────────────┐
│ Component Layer (UI)                    │
│ - Display only                          │
│ - No crypto operations                  │
│ - Validation only                       │
│ - Clear sensitive data after use        │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│ Context Layer (State)                   │
│ - Public data only (address, status)    │
│ - No private keys or mnemonics stored   │
│ - Calls service layer                   │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│ Service Layer (Crypto)                  │
│ - Wallet creation/import                │
│ - Encryption/decryption                 │
│ - Key derivation                        │
│ - Local storage management              │
└─────────────────────────────────────────┘
```

This architecture ensures:
- Clear separation of concerns
- Security best practices
- Maintainable code structure
- Type safety throughout
- Reusable components
- Testable units
