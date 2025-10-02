const sharp = require('sharp');
const path = require('path');

// Create a simple OG image with gradient background and text
const width = 1200;
const height = 630;

// Create SVG with text
const svg = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0d1117;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1a1f2e;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="text" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#10b981;stop-opacity:1" />
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="${width}" height="${height}" fill="url(#bg)"/>

  <!-- Grid pattern -->
  <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
    <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(59, 130, 246, 0.1)" stroke-width="1"/>
  </pattern>
  <rect width="${width}" height="${height}" fill="url(#grid)"/>

  <!-- Gradient orbs -->
  <circle cx="150" cy="150" r="200" fill="url(#text)" opacity="0.15" filter="url(#glow)"/>
  <circle cx="1050" cy="480" r="150" fill="url(#text)" opacity="0.15" filter="url(#glow)"/>

  <!-- Logo/Icon -->
  <rect x="490" y="140" width="220" height="220" rx="40" fill="url(#text)" opacity="0.2"/>
  <text x="600" y="280" font-size="120" text-anchor="middle" fill="url(#text)" font-family="system-ui, -apple-system, sans-serif">💎</text>

  <!-- Title -->
  <text x="600" y="430" font-size="72" font-weight="800" text-anchor="middle" fill="url(#text)" font-family="system-ui, -apple-system, sans-serif">Stablecoin Wallet</text>

  <!-- Subtitle -->
  <text x="600" y="490" font-size="28" text-anchor="middle" fill="rgba(255, 255, 255, 0.8)" font-family="system-ui, -apple-system, sans-serif">Secure Ethereum wallet for USDC, USDT &amp; DAI</text>

  <!-- Badges -->
  <g transform="translate(250, 530)">
    <rect width="180" height="50" rx="12" fill="rgba(255, 255, 255, 0.1)" stroke="rgba(255, 255, 255, 0.2)" stroke-width="1"/>
    <text x="90" y="33" font-size="18" font-weight="600" text-anchor="middle" fill="white" font-family="system-ui, -apple-system, sans-serif">🔒 Encrypted</text>
  </g>

  <g transform="translate(510, 530)">
    <rect width="180" height="50" rx="12" fill="rgba(255, 255, 255, 0.1)" stroke="rgba(255, 255, 255, 0.2)" stroke-width="1"/>
    <text x="90" y="33" font-size="18" font-weight="600" text-anchor="middle" fill="white" font-family="system-ui, -apple-system, sans-serif">⚡ Fast</text>
  </g>

  <g transform="translate(770, 530)">
    <rect width="180" height="50" rx="12" fill="rgba(255, 255, 255, 0.1)" stroke="rgba(255, 255, 255, 0.2)" stroke-width="1"/>
    <text x="90" y="33" font-size="18" font-weight="600" text-anchor="middle" fill="white" font-family="system-ui, -apple-system, sans-serif">🎨 Modern</text>
  </g>
</svg>
`;

// Generate PNG from SVG
const outputPath = path.join(__dirname, '..', 'public', 'og-image.png');

sharp(Buffer.from(svg))
  .png()
  .toFile(outputPath)
  .then(() => {
    console.log('✅ OG image generated successfully:', outputPath);
  })
  .catch((err) => {
    console.error('❌ Error generating OG image:', err);
    process.exit(1);
  });
