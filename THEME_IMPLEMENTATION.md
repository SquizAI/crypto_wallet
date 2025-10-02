# Theme Toggle Implementation

Complete dark/light theme system with persistence, system preference detection, and smooth transitions.

---

## Implementation Summary

### Files Created

1. **`/Users/mattysquarzoni/lee_class/stablecoin-wallet/src/context/ThemeContext.tsx`**
   - Theme context with React hooks
   - System preference detection via `prefers-color-scheme`
   - localStorage persistence
   - Automatic theme application to document root

2. **`/Users/mattysquarzoni/lee_class/stablecoin-wallet/src/components/ui/ThemeToggle.tsx`**
   - Interactive theme toggle component
   - Animated sun/moon icons
   - Both full and compact variants
   - Accessible (ARIA labels, keyboard navigation)

### Files Modified

1. **`/Users/mattysquarzoni/lee_class/stablecoin-wallet/src/app/globals.css`**
   - Added CSS variables for both themes
   - Theme-aware color system
   - Smooth transition animations
   - Updated glassmorphism effects
   - Theme-aware scrollbars

2. **`/Users/mattysquarzoni/lee_class/stablecoin-wallet/src/providers/Providers.tsx`**
   - Added ThemeProvider to provider tree
   - Ensures theme applied before render

3. **`/Users/mattysquarzoni/lee_class/stablecoin-wallet/src/app/settings/page.tsx`**
   - Added Appearance section
   - Integrated ThemeToggle component

---

## Features

### 1. System Preference Detection
- Automatically detects user's OS theme preference
- Uses `prefers-color-scheme` media query
- Falls back to dark theme if no preference

### 2. localStorage Persistence
- Saves theme preference to localStorage
- Survives page reloads and browser restarts
- Priority: localStorage > system preference > default (dark)

### 3. Smooth Transitions
- 300ms CSS transitions on all theme-aware properties
- Animated icon transitions in toggle component
- No flash of incorrect theme on page load

### 4. Theme-Aware CSS Variables
All colors automatically adapt to theme:
- `--background`: Main background color
- `--foreground`: Primary text color
- `--surface`: Card/surface background
- `--text-primary/secondary/tertiary`: Text hierarchy
- `--border-primary/secondary`: Border colors
- `--hover-overlay/active-overlay`: Interactive states
- `--glass-bg/glass-border`: Glassmorphism effects

### 5. Accessibility
- Proper ARIA labels (role="switch", aria-checked)
- Keyboard navigation support
- Focus-visible states
- Touch-friendly (44px minimum target size)

---

## Usage Examples

### Basic Usage in Components

```tsx
import { useTheme } from '@/context/ThemeContext';

function MyComponent() {
  const { theme, toggleTheme, setTheme } = useTheme();

  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={toggleTheme}>Toggle Theme</button>
      <button onClick={() => setTheme('light')}>Light Mode</button>
      <button onClick={() => setTheme('dark')}>Dark Mode</button>
    </div>
  );
}
```

### Using Theme Toggle Components

```tsx
import { ThemeToggle, CompactThemeToggle } from '@/components/ui/ThemeToggle';

// Full toggle with label
<ThemeToggle showLabel />

// Without label
<ThemeToggle />

// Compact version (for headers/navbars)
<CompactThemeToggle />
```

### Using CSS Variables in Components

```tsx
// Use theme-aware colors
<div className="bg-[var(--background)] text-[var(--foreground)]">
  <div className="bg-[var(--surface)] border-[var(--border-primary)]">
    Theme-aware content
  </div>
</div>

// Or use utility classes (they automatically adapt)
<div className="glass-card">
  This card adapts to theme
</div>
```

### Conditional Styling Based on Theme

```tsx
function ThemedComponent() {
  const { theme } = useTheme();

  return (
    <div className={theme === 'dark' ? 'dark-specific' : 'light-specific'}>
      Content
    </div>
  );
}
```

---

## CSS Variable Reference

### Dark Theme Colors
```css
--background: #0d1117;
--foreground: #F8FAFC;
--surface: #161b22;
--text-primary: #F8FAFC;
--text-secondary: #94a3b8;
--text-tertiary: #64748b;
--border-primary: rgba(255, 255, 255, 0.1);
--glass-bg: rgba(255, 255, 255, 0.03);
```

### Light Theme Colors
```css
--background: #ffffff;
--foreground: #0f172a;
--surface: #f8fafc;
--text-primary: #0f172a;
--text-secondary: #475569;
--text-tertiary: #64748b;
--border-primary: rgba(15, 23, 42, 0.1);
--glass-bg: rgba(15, 23, 42, 0.03);
```

---

## Theme Detection Flow

1. **Initial Load**
   ```
   Check localStorage
   ↓
   If found → Use stored preference
   ↓
   If not found → Check system preference
   ↓
   Apply theme to document root
   ```

2. **System Theme Change**
   ```
   Media query listener detects change
   ↓
   Check if user has manual preference
   ↓
   If no preference → Follow system theme
   ↓
   If has preference → Keep manual preference
   ```

3. **Manual Toggle**
   ```
   User clicks toggle
   ↓
   Update state
   ↓
   Apply to document root
   ↓
   Save to localStorage
   ```

---

## Best Practices

### 1. Use CSS Variables
Always use CSS variables instead of hardcoded colors:
```tsx
// Good
<div className="bg-[var(--surface)]" />

// Bad
<div className="bg-gray-900" />
```

### 2. Test Both Themes
Ensure all components look good in both themes:
```tsx
// Test in both themes
function TestComponent() {
  const { setTheme } = useTheme();

  useEffect(() => {
    // Test light theme
    setTheme('light');
    // Check component appearance

    // Test dark theme
    setTheme('dark');
    // Check component appearance
  }, []);
}
```

### 3. Avoid Theme-Specific Logic
Let CSS variables handle theme changes:
```tsx
// Good - CSS handles it
<div className="text-[var(--text-primary)]" />

// Bad - unnecessary logic
<div className={theme === 'dark' ? 'text-white' : 'text-black'} />
```

### 4. Use Utility Classes
Leverage existing utility classes that adapt automatically:
```tsx
<div className="glass-card">
  <p className="text-[var(--text-primary)]">
    Content
  </p>
</div>
```

---

## Adding Theme Support to New Components

1. **Use CSS Variables**
   ```tsx
   <div style={{
     backgroundColor: 'var(--surface)',
     color: 'var(--text-primary)',
     borderColor: 'var(--border-primary)'
   }}>
   ```

2. **Or Use Tailwind with Variables**
   ```tsx
   <div className="bg-[var(--surface)] text-[var(--text-primary)] border-[var(--border-primary)]">
   ```

3. **Add Theme-Specific Styles in CSS**
   ```css
   .my-component {
     background: var(--surface);
   }

   .dark .my-component-special {
     box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
   }

   .light .my-component-special {
     box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
   }
   ```

---

## Mobile Considerations

### Theme-Color Meta Tag
The theme automatically updates the mobile browser chrome color:
```tsx
// Dark theme
<meta name="theme-color" content="#0d1117">

// Light theme
<meta name="theme-color" content="#ffffff">
```

### Touch Targets
ThemeToggle components have minimum 44px touch targets for accessibility.

### Performance
- Smooth transitions optimized for mobile
- Respects `prefers-reduced-motion` for users with motion sensitivity

---

## Testing

### Manual Testing Checklist
- [ ] Toggle switches between themes
- [ ] Theme persists after page reload
- [ ] System preference is detected on first load
- [ ] All pages render correctly in both themes
- [ ] Glassmorphism effects work in both themes
- [ ] Scrollbars adapt to theme
- [ ] No flash of incorrect theme on load
- [ ] Mobile browser chrome color updates

### System Preference Testing
1. **macOS**: System Preferences → General → Appearance
2. **Windows**: Settings → Personalization → Colors
3. **iOS**: Settings → Display & Brightness
4. **Android**: Settings → Display → Dark theme

### Browser DevTools Testing
```javascript
// Test dark theme detection
window.matchMedia('(prefers-color-scheme: dark)').matches

// Test light theme detection
window.matchMedia('(prefers-color-scheme: light)').matches

// Simulate theme change
window.matchMedia('(prefers-color-scheme: dark)').dispatchEvent(
  new Event('change')
)
```

---

## Troubleshooting

### Theme Not Persisting
- Check localStorage: `localStorage.getItem('stablecoin-wallet-theme')`
- Ensure browser allows localStorage
- Check for errors in console

### Flash of Incorrect Theme
- Ensure ThemeProvider is at top of provider tree
- Check that `suppressHydrationWarning` is on `<html>` tag
- Verify theme is applied before first render

### Transitions Too Slow/Fast
Adjust transition duration in globals.css:
```css
:root * {
  transition: background-color 300ms ease, /* Adjust timing here */
              border-color 300ms ease,
              color 300ms ease;
}
```

### Colors Not Changing
- Verify CSS variables are used instead of hardcoded colors
- Check that component doesn't override with inline styles
- Ensure `.dark` or `.light` class is on `<html>` element

---

## Future Enhancements

Potential improvements:
1. **Auto Theme** - Follow system preference automatically
2. **Scheduled Themes** - Auto-switch based on time of day
3. **Custom Themes** - Allow users to create custom color schemes
4. **Theme Preview** - Preview theme before applying
5. **High Contrast Mode** - Enhanced accessibility option
6. **Color Blindness Modes** - Specialized color schemes

---

## API Reference

### ThemeContext

```typescript
interface ThemeContextValue {
  theme: 'dark' | 'light';           // Current theme
  setTheme: (theme: Theme) => void;   // Set specific theme
  toggleTheme: () => void;            // Toggle between themes
  systemTheme: 'dark' | 'light';     // OS preference
}
```

### useTheme Hook

```typescript
const { theme, setTheme, toggleTheme, systemTheme } = useTheme();
```

### ThemeToggle Props

```typescript
interface ThemeToggleProps {
  className?: string;    // Additional CSS classes
  showLabel?: boolean;   // Show theme label text
}
```

---

## Summary

The dark/light theme toggle is now fully implemented with:
- Automatic system preference detection
- localStorage persistence
- Smooth transitions
- Accessible UI components
- Theme-aware CSS variables
- Mobile optimization

All pages and components automatically adapt to the selected theme. Users can toggle themes from the Settings page, and their preference will be saved and persist across sessions.
