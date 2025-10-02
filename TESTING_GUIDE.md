# Wallet Onboarding Components - Testing Guide

## Quick Start

```bash
# 1. Start development server
npm run dev

# 2. Open browser to one of these pages:
# - Component showcase: http://localhost:3000/component-showcase
# - Onboarding flow: http://localhost:3000/onboarding
```

## Test Pages Available

### 1. Component Showcase (`/component-showcase`)
Visual demonstration of all UI components in isolation.

**What to test:**
- Button variants (primary, secondary, danger, ghost)
- Button sizes (sm, md, lg)
- Loading states
- Input fields with labels and errors
- Password input with show/hide toggle
- Password strength indicator
- Alert messages (info, success, warning, danger)
- Card variants (default, elevated, outlined)
- Form combinations

### 2. Onboarding Flow (`/onboarding`)
Complete wallet creation and import flow.

**What to test:**
- Welcome screen
- Create wallet flow
- Recovery phrase display
- Import wallet flow
- Success confirmation

## Detailed Test Cases

### Test Case 1: Create Wallet - Password Validation

**Steps:**
1. Navigate to `/onboarding`
2. Click "Create New Wallet"
3. Try entering weak passwords and observe validation

**Expected Results:**
- [ ] Password requirements checklist shows in real-time
- [ ] Green checkmarks appear as requirements are met
- [ ] Password strength indicator updates (Weak → Fair → Good → Strong)
- [ ] Confirm password shows error if passwords don't match
- [ ] Create button is disabled until all requirements are met

**Test Passwords:**
```
"abc" → Should show: Missing all requirements
"Password" → Should show: Missing number and special char
"Password1" → Should show: Missing special char
"Password1!" → Should show: All requirements met (Strong)
```

### Test Case 2: Create Wallet - Success Flow

**Steps:**
1. Navigate to `/onboarding`
2. Click "Create New Wallet"
3. Enter valid password: `SecurePass123!`
4. Confirm password: `SecurePass123!`
5. Click "Create Wallet"

**Expected Results:**
- [ ] Loading spinner appears on button
- [ ] Button text changes to "Loading..."
- [ ] After creation, automatically navigates to recovery phrase screen
- [ ] 12 words are displayed in a 3x4 grid
- [ ] Each word is numbered 1-12
- [ ] Security warnings are visible

### Test Case 3: Recovery Phrase - Save Options

**Steps:**
1. Complete wallet creation (Test Case 2)
2. On recovery phrase screen, test save options

**Expected Results:**

**Copy to Clipboard:**
- [ ] Click "Copy to Clipboard" button
- [ ] Button text changes to "Copied!" with checkmark
- [ ] After 2 seconds, button reverts to "Copy to Clipboard"
- [ ] Paste somewhere to verify 12 words are copied

**Download as Text:**
- [ ] Click "Download as Text" button
- [ ] File `recovery-phrase.txt` downloads
- [ ] File contains exactly 12 words separated by spaces
- [ ] No extra formatting or characters

**Confirmation:**
- [ ] Continue button is disabled initially
- [ ] Click confirmation checkbox
- [ ] Continue button becomes enabled
- [ ] Click Continue
- [ ] Success screen appears

### Test Case 4: Import Wallet - Mnemonic Validation

**Steps:**
1. Navigate to `/onboarding`
2. Click "Import Existing Wallet"
3. Ensure "Recovery Phrase" tab is selected
4. Test various inputs

**Test Inputs:**

**Invalid - Too Few Words:**
```
test wallet mnemonic phrase
```
Expected: Error "Recovery phrase must be 12 or 24 words"

**Invalid - Too Many Words:**
```
one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen
```
Expected: Error "Recovery phrase must be 12 or 24 words"

**Valid - 12 Words:**
```
abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about
```
Expected: No error, can proceed with password

**Valid - 24 Words:**
```
abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon art
```
Expected: No error, can proceed with password

### Test Case 5: Import Wallet - Password Setup

**Steps:**
1. Navigate to `/onboarding`
2. Click "Import Existing Wallet"
3. Enter valid 12-word mnemonic
4. Test password validation

**Expected Results:**
- [ ] Password field shows strength indicator
- [ ] Weak passwords shown in red/orange
- [ ] Strong passwords shown in green
- [ ] Confirm password validates match
- [ ] Import button disabled until:
  - Valid mnemonic entered
  - Password at least 8 characters
  - Passwords match
- [ ] Click Import → Loading state → Success

### Test Case 6: Private Key Tab (Currently Disabled)

**Steps:**
1. Navigate to `/onboarding`
2. Click "Import Existing Wallet"
3. Click "Private Key" tab

**Expected Results:**
- [ ] Warning alert appears: "Private key import is currently not supported"
- [ ] Input field is disabled
- [ ] Import button is disabled
- [ ] Message says to use Recovery Phrase method

### Test Case 7: Responsive Design

**Steps:**
Test on different screen sizes using browser DevTools.

**Desktop (1920x1080):**
- [ ] Cards centered with max-width
- [ ] Mnemonic grid shows 3 columns
- [ ] Buttons are appropriate size
- [ ] No horizontal scrolling

**Tablet (768x1024):**
- [ ] Cards adjust to width
- [ ] Mnemonic grid shows 3 columns
- [ ] Buttons stack properly
- [ ] Touch targets are large enough

**Mobile (375x667):**
- [ ] Cards take full width with padding
- [ ] Mnemonic grid adjusts to 2 columns
- [ ] Buttons stack vertically
- [ ] Text is readable
- [ ] No horizontal scrolling

### Test Case 8: Accessibility

**Keyboard Navigation:**
- [ ] Tab through all form fields
- [ ] Enter key submits forms
- [ ] Space toggles checkboxes
- [ ] Focus indicators visible
- [ ] No keyboard traps

**Screen Reader (VoiceOver/NVDA):**
- [ ] Headings announce properly
- [ ] Form labels read correctly
- [ ] Error messages announced
- [ ] Button states announced (loading, disabled)
- [ ] Alerts have role="alert"

**Visual:**
- [ ] Color contrast meets WCAG AA (4.5:1 for text)
- [ ] Focus indicators visible
- [ ] Error messages in red AND text
- [ ] No color-only information

### Test Case 9: Error Handling

**Test Invalid Password (Create Wallet):**
1. Enter password that doesn't meet requirements
2. Try to submit
**Expected:** Button disabled, can't submit

**Test Wallet Creation Failure:**
1. Mock wallet service error (would need code change)
**Expected:** Error message in red Alert component

**Test Import with Invalid Mnemonic:**
1. Enter random text
2. Try to submit
**Expected:** Validation error appears

### Test Case 10: Data Security

**Sensitive Data Clearing:**
1. Create a wallet
2. Open browser DevTools → Components/React DevTools
3. Inspect OnboardingLayout state
**Expected:** After moving to success screen, mnemonic should be cleared from state

**Console Logging:**
1. Open browser DevTools → Console
2. Complete entire flow
**Expected:** No passwords, mnemonics, or private keys logged

**Local Storage:**
1. Complete wallet creation
2. Open DevTools → Application → Local Storage
**Expected:**
- Encrypted wallet data stored
- Public address stored
- NO plaintext mnemonic or password

### Test Case 11: Back Button Navigation

**Steps:**
1. Navigate to `/onboarding`
2. Click "Create New Wallet"
3. Click "Back" button
4. Should return to welcome screen

**Expected Results:**
- [ ] Back button visible and functional
- [ ] Returns to previous screen
- [ ] Form data cleared
- [ ] No errors thrown

**Repeat for Import Flow:**
1. Click "Import Existing Wallet"
2. Click "Back" button
3. Should return to welcome screen

### Test Case 12: Form Validation Edge Cases

**Password Edge Cases:**
```
"        " (spaces) → Should not be accepted
"" (empty) → Button should be disabled
"Pass1!" (only 6 chars) → Should fail length requirement
"PASSWORD123!" (no lowercase) → Should fail lowercase requirement
"password123!" (no uppercase) → Should fail uppercase requirement
```

**Mnemonic Edge Cases:**
```
"  word1  word2  " (extra spaces) → Should be trimmed
"Word1 Word2" (capitalized) → Should be accepted (case-insensitive)
"word1,word2,word3" (commas) → Should fail (wrong separator)
```

## Component Showcase Testing

Navigate to `/component-showcase` and verify:

### Buttons
- [ ] Click each variant, observe hover states
- [ ] Click "Click to Load" → 2-second loading state
- [ ] Verify disabled states work

### Inputs
- [ ] Type in email field
- [ ] See helper text below
- [ ] Field with error shows red border

### Password Input
- [ ] Type password, see strength update
- [ ] Click eye icon to show/hide
- [ ] Strength bar colors change (gray → red → orange → yellow → green)

### Alerts
- [ ] Each variant has correct color
- [ ] Icons display correctly
- [ ] Title and content readable

### Cards
- [ ] Default has border
- [ ] Elevated has shadow
- [ ] Outlined has transparent background

## Performance Testing

### Load Time
1. Open DevTools → Network tab
2. Navigate to `/onboarding`
3. Check load time
**Expected:** < 2 seconds on 3G connection

### Bundle Size
```bash
npm run build
```
Check output for component chunks
**Expected:** Total JS < 500KB

### Runtime Performance
1. Open DevTools → Performance tab
2. Record wallet creation flow
3. Check for long tasks
**Expected:** No tasks > 50ms

## Browser Compatibility

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

## Common Issues and Solutions

### Issue: "Cannot find module '@/components/...'"
**Solution:** Ensure tsconfig.json has correct paths configuration

### Issue: Styles not applying
**Solution:** Check tailwind.config.ts includes correct content paths

### Issue: Context not found error
**Solution:** Ensure component is wrapped in WalletProvider

### Issue: Build fails
**Solution:** Run `npm run build` and check TypeScript errors

## Automated Testing (Future)

Example test structure to implement:

```typescript
// CreateWallet.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { CreateWallet } from './CreateWallet';

describe('CreateWallet', () => {
  it('validates password requirements', () => {
    render(<CreateWallet onSuccess={jest.fn()} />);

    const passwordInput = screen.getByLabelText('Password');
    fireEvent.change(passwordInput, { target: { value: 'weak' } });

    expect(screen.getByText('At least 8 characters')).toHaveClass('text-gray-600');
  });

  it('enables submit when valid', () => {
    render(<CreateWallet onSuccess={jest.fn()} />);

    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'SecurePass123!' }
    });
    fireEvent.change(screen.getByLabelText('Confirm Password'), {
      target: { value: 'SecurePass123!' }
    });

    expect(screen.getByText('Create Wallet')).not.toBeDisabled();
  });
});
```

## Test Checklist Summary

Before deploying to production, ensure:

- [ ] All UI components render correctly
- [ ] Form validation works as expected
- [ ] Error handling displays properly
- [ ] Loading states show during async operations
- [ ] Success flows complete end-to-end
- [ ] Responsive design works on all breakpoints
- [ ] Keyboard navigation functional
- [ ] Screen reader compatible
- [ ] No sensitive data in console or state
- [ ] Back buttons work correctly
- [ ] All test cases pass
- [ ] No TypeScript errors
- [ ] No console errors or warnings
- [ ] Tested on multiple browsers
- [ ] Performance is acceptable

## Reporting Issues

If you find bugs, document:
1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Browser/OS
5. Screenshots if applicable
6. Console errors

---

**Last Updated:** 2025-10-02
**Components Version:** 1.0.0
**Test Coverage:** Manual testing (automated tests pending)
