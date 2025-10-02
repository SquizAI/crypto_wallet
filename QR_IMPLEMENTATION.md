# QR Code Implementation Guide

## Overview

This document details the QR code scanning and display functionality implemented for the stablecoin wallet application.

## Components Created

### 1. QRScanner Component
**Location:** `/src/components/qr/QRScanner.tsx`

A modal-based QR code scanner that uses the device's camera to scan wallet addresses.

**Features:**
- Camera permission handling with clear error messages
- Automatic address extraction from multiple QR formats
- Support for plain addresses and Ethereum URI schemes
- Real-time scanning with visual targeting overlay
- Mobile and desktop browser support
- Error recovery and user feedback

**Props:**
```typescript
interface QRScannerProps {
  isOpen: boolean;           // Modal open state
  onClose: () => void;       // Close handler
  onScan: (address: string) => void;  // Success callback with scanned address
  title?: string;            // Optional modal title
}
```

**Supported QR Formats:**
- Plain address: `0x1234...`
- Ethereum URI: `ethereum:0x1234...`
- With parameters: `ethereum:0x1234?value=1.5`

**States:**
1. `initializing` - Setting up camera
2. `scanning` - Active scanning mode
3. `success` - Valid address scanned
4. `error` - Camera unavailable or permission denied

### 2. QRDisplay Component
**Location:** `/src/components/qr/QRDisplay.tsx`

Displays a wallet address as a QR code with download and copy functionality.

**Features:**
- High-quality QR code generation
- Copy address to clipboard
- Download QR code as PNG image
- Customizable size and labels
- Responsive design

**Props:**
```typescript
interface QRDisplayProps {
  data: string;              // Address or data to encode
  size?: number;             // QR code size (default: 256px)
  showDownload?: boolean;    // Show download button (default: true)
  showCopy?: boolean;        // Show copy button (default: true)
  label?: string;            // Label for downloaded file (default: "Wallet Address")
  className?: string;        // Optional styling
}
```

## Integration Points

### 1. Send Modal Integration
**File:** `/src/components/modals/SendModal.tsx`

**Changes:**
- Added QR scanner button next to recipient address field
- Integrated scanner modal that opens on button click
- Auto-fills recipient field when address is scanned
- Clears validation errors on successful scan

**Usage:**
```tsx
// QR scan button in recipient field
<Button
  variant="secondary"
  onClick={() => setIsQRScannerOpen(true)}
  title="Scan QR Code"
>
  <QRIcon />
</Button>

// Scanner modal
<QRScanner
  isOpen={isQRScannerOpen}
  onClose={() => setIsQRScannerOpen(false)}
  onScan={handleQRScan}
  title="Scan Recipient Address"
/>
```

### 2. Receive Modal Integration
**File:** `/src/components/modals/ReceiveModal.tsx`

**Changes:**
- Replaced manual QR generation with QRDisplay component
- Added download and copy functionality
- Simplified code by using reusable component

**Usage:**
```tsx
<QRDisplay
  data={address}
  size={256}
  showDownload={true}
  showCopy={true}
  label={`${selectedToken} Wallet Address`}
/>
```

### 3. Address Book Integration
**File:** `/src/components/address-book/AddressFormModal.tsx`

**Changes:**
- Added QR scanner button in address input field
- Only shown when adding new addresses (not when editing)
- Integrates with React Hook Form for validation

**Usage:**
```tsx
// QR scan button (only for new addresses)
{!isEditing && (
  <Button
    type="button"
    variant="secondary"
    onClick={() => setIsQRScannerOpen(true)}
    title="Scan QR Code"
  >
    <QRIcon />
  </Button>
)}

// Scanner modal
<QRScanner
  isOpen={isQRScannerOpen}
  onClose={() => setIsQRScannerOpen(false)}
  onScan={handleQRScan}
  title="Scan Address QR Code"
/>
```

## Dependencies

### Installed Packages

```json
{
  "html5-qrcode": "^2.3.8",  // For scanning QR codes
  "qrcode": "^1.5.4"         // For generating QR codes (already installed)
}
```

### Installation Command
```bash
npm install html5-qrcode
```

## Technical Details

### QR Scanner Implementation

The scanner uses the `html5-qrcode` library which provides:
- Cross-browser camera access
- QR code detection and decoding
- Camera permission handling
- Support for multiple QR formats

**Key Functions:**

1. **Camera Initialization:**
```typescript
const scanner = new Html5Qrcode(qrRegionId, {
  formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
  verbose: false,
});

await scanner.start(cameraId, {
  fps: 10,
  qrbox: { width: 250, height: 250 },
  aspectRatio: 1.0,
});
```

2. **Address Extraction:**
```typescript
function extractAddress(qrData: string): string | null {
  // Handle ethereum: URI scheme
  if (cleaned.toLowerCase().startsWith('ethereum:')) {
    const withoutScheme = cleaned.substring(9);
    const addressPart = withoutScheme.split('?')[0];
    const address = addressPart.split('@')[0];
    return isAddress(address) ? address : null;
  }

  // Handle plain address
  return isAddress(cleaned) ? cleaned : null;
}
```

3. **Cleanup:**
```typescript
useEffect(() => {
  return () => {
    if (scannerRef.current) {
      scannerRef.current.stop().then(() => {
        scannerRef.current?.clear();
        scannerRef.current = null;
      });
    }
  };
}, [isOpen]);
```

### QR Display Implementation

Uses the `qrcode` library to generate QR codes:

1. **Display Generation:**
```typescript
QRCode.toDataURL(data, {
  width: size,
  margin: 2,
  color: { dark: '#000000', light: '#ffffff' },
  errorCorrectionLevel: 'M',
});
```

2. **High-Quality Download:**
```typescript
QRCode.toCanvas(canvasRef.current, data, {
  width: size * 2,  // 2x resolution
  errorCorrectionLevel: 'H',  // Highest error correction
});
```

3. **Download Functionality:**
```typescript
canvasRef.current.toBlob((blob) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${label}-qr-code.png`;
  link.click();
  URL.revokeObjectURL(url);
}, 'image/png');
```

## User Experience

### Scanning Flow

1. User clicks QR scan button in Send or Address Book
2. Scanner modal opens with camera permission request
3. Camera view displays with targeting overlay
4. User positions QR code in frame
5. Address automatically detected and validated
6. Success state shown briefly
7. Modal closes and address auto-fills in form

### Error Handling

**Camera Permission Denied:**
- Clear error message displayed
- Instructions to enable camera in browser settings
- Close button to dismiss

**No Camera Available:**
- Detects missing camera hardware
- Displays appropriate error message
- Provides alternative input methods

**Invalid QR Code:**
- Validates scanned data is Ethereum address
- Shows error if QR contains invalid data
- Allows user to try again

### Mobile Optimization

- Prefers back camera on mobile devices
- Touch-optimized controls
- Responsive modal sizing
- Efficient camera resource management
- Proper cleanup to prevent battery drain

### Desktop Experience

- Webcam support
- Keyboard navigation (ESC to close)
- Clear visual feedback
- Accessible controls

## Accessibility

### ARIA Labels
```tsx
<div id={qrRegionId} aria-label="QR Code Scanner" />
<button title="Scan QR Code" aria-label="Open QR Scanner">
  <QRIcon />
</button>
```

### Keyboard Support
- ESC key closes scanner modal
- Tab navigation through controls
- Focus management on modal open/close

### Screen Reader Support
- Status announcements for scan success/failure
- Clear button labels
- Error message associations

## Browser Compatibility

### Supported Browsers
- Chrome/Edge 59+ (desktop and mobile)
- Safari 11+ (iOS and macOS)
- Firefox 63+ (desktop and mobile)
- Opera 46+

### Fallback Behavior
- Manual address input always available
- Clear error messages for unsupported browsers
- Graceful degradation

## Security Considerations

### Camera Permissions
- Only requests permission when needed
- Clears camera access on modal close
- No data stored or transmitted

### Address Validation
- All scanned addresses validated using ethers.js
- Prevents invalid addresses from being used
- Checksum validation included

### QR Code Generation
- Client-side only (no data leaves browser)
- No external QR code services used
- Safe for sensitive addresses

## Performance

### Optimization Techniques

1. **Lazy Loading:**
   - Scanner only initialized when modal opens
   - Proper cleanup when modal closes

2. **Resource Management:**
   - Camera stopped immediately when not needed
   - Canvas elements reused for downloads
   - Memory cleanup in useEffect

3. **Bundle Size:**
   - html5-qrcode: ~100KB (gzipped)
   - qrcode: ~20KB (gzipped)
   - No significant impact on load times

## Testing Recommendations

### Manual Testing

1. **Send Flow:**
   - Open Send modal
   - Click QR scan button
   - Allow camera permission
   - Scan valid wallet address QR
   - Verify address auto-fills correctly

2. **Receive Flow:**
   - Open Receive modal
   - Verify QR code displays correctly
   - Test copy button
   - Test download button
   - Verify downloaded image quality

3. **Address Book Flow:**
   - Open "Add Address" in Address Book
   - Click QR scan button
   - Scan address QR code
   - Verify address and validation work
   - Try editing existing entry (QR button should be hidden)

4. **Error Cases:**
   - Deny camera permission
   - Scan invalid QR code
   - Test with no camera available
   - Test on mobile and desktop

### Browser Testing

Test on:
- Chrome (desktop and mobile)
- Safari (iOS and macOS)
- Firefox (desktop and mobile)
- Edge (desktop)

### Mobile Testing

- Test on iOS Safari
- Test on Android Chrome
- Verify back camera is used
- Check touch interactions
- Verify modal sizing on small screens

## Future Enhancements

### Potential Features

1. **WalletConnect Integration:**
   - Scan WalletConnect QR codes
   - Connect to dApps via QR

2. **Batch Scanning:**
   - Scan multiple addresses
   - Bulk import to address book

3. **History:**
   - Save recently scanned addresses
   - Quick access to common addresses

4. **Advanced QR Options:**
   - Generate QR with amount
   - Generate QR with token type
   - EIP-681 payment request support

5. **Camera Settings:**
   - Switch between front/back camera
   - Adjust scan sensitivity
   - Flashlight toggle (mobile)

## Troubleshooting

### Common Issues

**Camera Not Working:**
- Check browser permissions
- Verify HTTPS (camera requires secure context)
- Test in different browser
- Check device camera availability

**QR Not Scanning:**
- Ensure good lighting
- Hold QR code steady
- Clean camera lens
- Try zooming in/out

**Download Not Working:**
- Check browser download permissions
- Verify popup blocker settings
- Try different browser

## Code Examples

### Custom QR Scanner Usage

```tsx
import { QRScanner } from '@/components/qr';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  const handleScan = (address: string) => {
    console.log('Scanned:', address);
    // Use the scanned address
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Scan QR
      </button>

      <QRScanner
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onScan={handleScan}
        title="Scan Wallet Address"
      />
    </>
  );
}
```

### Custom QR Display Usage

```tsx
import { QRDisplay } from '@/components/qr';

function MyComponent() {
  const address = '0x1234...';

  return (
    <QRDisplay
      data={address}
      size={200}
      showDownload={true}
      showCopy={true}
      label="My Wallet"
      className="my-custom-class"
    />
  );
}
```

## Summary

The QR code implementation provides a seamless way for users to:
- Scan wallet addresses using their device camera
- Share their wallet address via QR code
- Download and save QR codes
- Quickly add addresses to their address book

The implementation prioritizes:
- User experience with clear feedback
- Security with proper validation
- Performance with efficient resource management
- Accessibility with keyboard and screen reader support
- Mobile-first design with responsive layouts

All components are fully integrated into the existing application flow and maintain consistency with the glassmorphic design system.
