import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const svg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#080E1A" />
      <stop offset="50%" stop-color="#0B1220" />
      <stop offset="100%" stop-color="#050811" />
    </linearGradient>

    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(30, 75, 143, 0.12)" stroke-width="1" />
    </pattern>

    <linearGradient id="peg-top" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFBD3A" />
      <stop offset="60%" stop-color="#F7941D" />
      <stop offset="100%" stop-color="#EE4B2B" />
    </linearGradient>

    <linearGradient id="peg-left" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E83D1B" />
      <stop offset="100%" stop-color="#A61C05" />
    </linearGradient>

    <linearGradient id="peg-right" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF7F1F" />
      <stop offset="100%" stop-color="#D93815" />
    </linearGradient>

    <linearGradient id="hole-grad" x1="50%" y1="0%" x2="50%" y2="100%">
      <stop offset="0%" stop-color="#050B14" />
      <stop offset="100%" stop-color="#1E4B8F" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)" />
  <rect width="1200" height="630" fill="url(#grid)" />

  <!-- Outer frame border with morph corner accents -->
  <rect x="30" y="30" width="1140" height="570" rx="16" fill="none" stroke="rgba(30, 75, 143, 0.35)" stroke-width="1" />

  <!-- Monospace Header Label -->
  <text x="90" y="110" font-family="'JetBrains Mono', monospace" font-size="16" font-weight="600" fill="#F7941D" letter-spacing="4">
    RHSP // MISSION CONTROL
  </text>

  <!-- Wordmark -->
  <text x="90" y="210" font-family="'Raleway', sans-serif" font-size="76" font-weight="800" fill="#F8FAFC" letter-spacing="-1.5">
    RHSP
  </text>
  <text x="90" y="270" font-family="'Raleway', sans-serif" font-size="28" font-weight="600" fill="#94A3B8" letter-spacing="1">
    ROUND HOLE SQUARE PEG
  </text>

  <!-- Tagline -->
  <text x="90" y="380" font-family="'Raleway', sans-serif" font-size="52" font-weight="700" fill="#FFFFFF">
    Understand the challenge. <tspan fill="url(#peg-top)">Engineer the adapter.</tspan>
  </text>

  <!-- Subtitle -->
  <text x="90" y="440" font-family="'Raleway', sans-serif" font-size="22" font-weight="400" fill="#94A3B8">
    Enterprise OutSystems &amp; High-Code Solutions
  </text>

  <!-- Footer Micro-labels -->
  <text x="90" y="540" font-family="'JetBrains Mono', monospace" font-size="14" fill="#64748B" letter-spacing="2">
    MUMBAI // OUTSYSTEMS // HIGH-CODE // SOVEREIGN AI
  </text>

  <!-- Graphic on the Right Side: Tilted cube + Hole -->
  <g transform="translate(820, 180) scale(2.6)">
    <!-- Base Ellipse -->
    <ellipse cx="60" cy="98" rx="46" ry="13" fill="url(#hole-grad)" stroke="#1E4B8F" stroke-width="1.5" />
    <!-- Tilted Cube -->
    <polygon points="60,12 96,37 60,53 24,37" fill="url(#peg-top)" stroke="#FFA336" stroke-width="0.8" />
    <polygon points="24,37 60,53 60,95 24,73" fill="url(#peg-left)" stroke="#C72C0B" stroke-width="0.8" />
    <polygon points="60,53 96,37 96,73 60,95" fill="url(#peg-right)" stroke="#E04618" stroke-width="0.8" />
    <line x1="60" y1="12" x2="60" y2="53" stroke="rgba(255,255,255,0.4)" stroke-width="1" />
  </g>
</svg>
`;

async function buildOg() {
  const publicDir = path.resolve('public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  const outputPath = path.join(publicDir, 'og-image.png');
  await sharp(Buffer.from(svg))
    .png({ quality: 90, compressionLevel: 9 })
    .toFile(outputPath);
  console.log('Generated OG image at:', outputPath);
}

buildOg().catch(err => {
  console.error(err);
  process.exit(1);
});
