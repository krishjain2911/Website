import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const PROJECTS = [
  {
    slug: 'sonakshi',
    code: 'RHSP-01 // SONAKSHI',
    title: 'Autonomous Voice Agent Architecture',
    tagline: 'Deterministic execution meets dynamic conversation.',
    accent: '#38BDF8',
    accentSec: '#2DD4BF',
    typeBadge: 'ENTERPRISE ACCELERATOR',
    schematic: 'voice'
  },
  {
    slug: 'clm',
    code: 'RHSP-02 // CLM',
    title: 'Enterprise Contract Lifecycle',
    tagline: 'Legacy paper into deterministic governance.',
    accent: '#F7941D',
    accentSec: '#FBBF24',
    typeBadge: 'DEPLOYED SOLUTION',
    schematic: 'contract'
  },
  {
    slug: 'dms',
    code: 'RHSP-03 // DMS',
    title: 'Document Intelligence Engine',
    tagline: 'Unstructured archives into structured retrieval.',
    accent: '#818CF8',
    accentSec: '#A78BFA',
    typeBadge: 'DEPLOYED SOLUTION',
    schematic: 'document'
  },
  {
    slug: 'whatsapp-journeys',
    code: 'RHSP-04 // WHATSAPP',
    title: 'Conversational Banking Suite',
    tagline: 'Direct customer access without friction.',
    accent: '#34D399',
    accentSec: '#10B981',
    typeBadge: 'DEPLOYED SOLUTION',
    schematic: 'chat'
  },
  {
    slug: 'sovereign-ai',
    code: 'RHSP-05 // SOVEREIGN',
    title: 'Private Enterprise Intelligence Stack',
    tagline: 'On-premise intelligence without external egress.',
    accent: '#FB7185',
    accentSec: '#F43F5E',
    typeBadge: 'ENTERPRISE ACCELERATOR',
    schematic: 'security'
  },
  {
    slug: 'ask-me-anything',
    code: 'RHSP-06 // AMA',
    title: 'Operational Intelligence Core',
    tagline: 'Operational queries into verified answers.',
    accent: '#22D3EE',
    accentSec: '#0284C7',
    typeBadge: 'ENTERPRISE ACCELERATOR',
    schematic: 'graph'
  }
];

function renderSvg(project, width, height) {
  const { code, title, tagline, accent, accentSec, typeBadge, schematic } = project;

  // Visual schematic details per project type
  let centerSchematic = '';
  if (schematic === 'voice') {
    centerSchematic = `
      <!-- Voice Waveform & Telemetry Nodes -->
      <g transform="translate(680, 480)" stroke="${accent}" stroke-width="2.5" fill="none">
        <path d="M -260 0 Q -220 -80 -180 0 T -100 0 T -20 -110 T 60 70 T 140 -90 T 220 0 T 280 0" opacity="0.85" />
        <path d="M -260 0 Q -200 60 -150 0 T -70 80 T 10 -40 T 90 90 T 170 -50 T 280 0" opacity="0.45" stroke="${accentSec}" />
        <circle cx="-180" cy="0" r="6" fill="${accent}" />
        <circle cx="-20" cy="-110" r="7" fill="${accentSec}" />
        <circle cx="140" cy="-90" r="7" fill="${accent}" />
        <circle cx="60" cy="70" r="6" fill="${accentSec}" />
      </g>
      <text x="680" y="620" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" fill="#94A3B8" letter-spacing="3">REAL-TIME DUAL-STREAM AUDIO PIPELINE &lt;500MS</text>
    `;
  } else if (schematic === 'contract') {
    centerSchematic = `
      <!-- Contract Clause Parsing Graph -->
      <g transform="translate(680, 470)" stroke="${accent}" stroke-width="2" fill="none">
        <rect x="-240" y="-120" width="130" height="180" rx="8" stroke="#334155" fill="#0B132B" opacity="0.9" />
        <line x1="-220" y1="-85" x2="-130" y2="-85" stroke="${accent}" stroke-width="3" />
        <line x1="-220" y1="-55" x2="-150" y2="-55" stroke="#475569" stroke-width="2" />
        <line x1="-220" y1="-30" x2="-140" y2="-30" stroke="#475569" stroke-width="2" />
        <line x1="-220" y1="-5" x2="-160" y2="-5" stroke="#475569" stroke-width="2" />
        
        <!-- Arrow vector -->
        <path d="M -90 -30 L -10 -30" stroke="${accent}" stroke-dasharray="4,4" marker-end="url(#arrow)" />
        
        <rect x="0" y="-140" width="160" height="220" rx="8" stroke="${accent}" stroke-width="2" fill="#0F172A" />
        <text x="80" y="-105" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="${accentSec}" letter-spacing="1">SEMANTIC GRAPH</text>
        <circle cx="40" cy="-55" r="14" fill="#1E293B" stroke="${accent}" />
        <circle cx="120" cy="-55" r="14" fill="#1E293B" stroke="${accentSec}" />
        <circle cx="80" cy="15" r="14" fill="#1E293B" stroke="${accent}" />
        <line x1="40" y1="-55" x2="120" y2="-55" stroke="#64748B" stroke-width="1.5" />
        <line x1="40" y1="-55" x2="80" y2="15" stroke="#64748B" stroke-width="1.5" />
        <line x1="120" y1="-55" x2="80" y2="15" stroke="#64748B" stroke-width="1.5" />
      </g>
      <text x="680" y="620" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" fill="#94A3B8" letter-spacing="3">DETERMINISTIC REDLINE COMPLIANCE ENGINE</text>
    `;
  } else if (schematic === 'document') {
    centerSchematic = `
      <!-- Document Optical & Vector Tree -->
      <g transform="translate(680, 470)" stroke="${accent}" stroke-width="2" fill="none">
        <rect x="-220" y="-110" width="120" height="160" rx="6" stroke="#334155" fill="#0B132B" />
        <circle cx="-160" cy="-30" r="28" stroke="${accent}" stroke-dasharray="6,4" />
        
        <path d="M -80 -30 C -20 -30, -20 -80, 40 -80" stroke="${accent}" stroke-width="2" />
        <path d="M -80 -30 C -20 -30, -20 20, 40 20" stroke="${accentSec}" stroke-width="2" />
        
        <rect x="50" y="-100" width="140" height="40" rx="6" fill="#1E293B" stroke="${accent}" />
        <text x="120" y="-75" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#E2E8F0">OCR EXTRACTION</text>
        
        <rect x="50" y="0" width="140" height="40" rx="6" fill="#1E293B" stroke="${accentSec}" />
        <text x="120" y="25" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#E2E8F0">SEMANTIC EMBEDDING</text>
      </g>
      <text x="680" y="620" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" fill="#94A3B8" letter-spacing="3">HYBRID NEURAL OCR &amp; EMBEDDING STORAGE</text>
    `;
  } else if (schematic === 'chat') {
    centerSchematic = `
      <!-- WhatsApp Conversational State Engine -->
      <g transform="translate(680, 470)" stroke="${accent}" stroke-width="2" fill="none">
        <!-- User Chat Bubble -->
        <rect x="-220" y="-100" width="180" height="54" rx="14" fill="#1E293B" stroke="#334155" />
        <text x="-130" y="-68" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="#E2E8F0">Account Statement PDF</text>
        
        <!-- Adapter Gateway Hub -->
        <circle cx="40" cy="-73" r="28" fill="#0B132B" stroke="${accent}" stroke-width="2.5" />
        <text x="40" y="-68" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10" font-weight="700" fill="${accent}">CORE</text>
        
        <!-- Bot Response Bubble -->
        <rect x="110" y="-40" width="190" height="60" rx="14" fill="#064E3B" stroke="${accentSec}" />
        <text x="205" y="-14" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" fill="#D1FAE5" font-weight="600">Generated &amp; Dispatched</text>
      </g>
      <text x="680" y="620" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" fill="#94A3B8" letter-spacing="3">OMNICHANNEL WEBHOOK &amp; CORE BANKING BROKER</text>
    `;
  } else if (schematic === 'security') {
    centerSchematic = `
      <!-- Sovereign Air-Gapped Perimeter -->
      <g transform="translate(680, 470)" stroke="${accent}" stroke-width="2" fill="none">
        <polygon points="0,-120 120,-40 120,80 0,160 -120,80 -120,-40" stroke="${accent}" stroke-width="2" fill="#0B132B" />
        <polygon points="0,-80 80,-25 80,55 0,110 -80,55 -80,-25" stroke="${accentSec}" stroke-width="1.5" stroke-dasharray="5,4" fill="#0F172A" />
        <circle cx="0" cy="15" r="32" fill="#1E1B4B" stroke="${accent}" stroke-width="2" />
        <text x="0" y="20" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" font-weight="800" fill="#F87171" letter-spacing="1">AIR GAP</text>
      </g>
      <text x="680" y="620" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" fill="#94A3B8" letter-spacing="3">ZERO EXTERNAL NETWORK EGRESS · LOCAL HARDWARE ENCLAVE</text>
    `;
  } else {
    centerSchematic = `
      <!-- Graph RAG Retrieval Node Network -->
      <g transform="translate(680, 470)" stroke="${accent}" stroke-width="1.8" fill="none">
        <circle cx="-160" cy="-60" r="22" fill="#0B132B" stroke="#475569" />
        <circle cx="-80" cy="40" r="18" fill="#0B132B" stroke="#475569" />
        <circle cx="20" cy="-90" r="26" fill="#0B132B" stroke="${accentSec}" />
        <circle cx="120" cy="-20" r="34" fill="#0F172A" stroke="${accent}" stroke-width="2.5" />
        <circle cx="200" cy="60" r="16" fill="#0B132B" stroke="#475569" />
        
        <line x1="-140" y1="-50" x2="-95" y2="25" stroke="#334155" />
        <line x1="-65" y1="30" x2="95" y2="-5" stroke="${accentSec}" stroke-dasharray="4,4" />
        <line x1="0" y1="-75" x2="90" y2="-30" stroke="${accent}" />
        <line x1="145" y1="5" x2="185" y2="50" stroke="#334155" />
        
        <text x="120" y="-15" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#E2E8F0">SYNTHESIS</text>
      </g>
      <text x="680" y="620" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" fill="#94A3B8" letter-spacing="3">CROSS-ENCODER RERANKING &amp; MULTI-TENANT CONTEXT</text>
    `;
  }

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" width="${width}" height="${height}">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0B132B" />
          <stop offset="60%" stop-color="#070D1F" />
          <stop offset="100%" stop-color="#020617" />
        </linearGradient>
        
        <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="${accent}" />
          <stop offset="100%" stop-color="${accentSec}" />
        </linearGradient>

        <radialGradient id="glow" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stop-color="${accent}" stop-opacity="0.16" />
          <stop offset="100%" stop-color="#020617" stop-opacity="0" />
        </radialGradient>

        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <circle cx="20" cy="20" r="1" fill="#334155" opacity="0.25" />
          <line x1="0" y1="40" x2="40" y2="40" stroke="#1E293B" stroke-width="0.5" opacity="0.3" />
          <line x1="40" y1="0" x2="40" y2="40" stroke="#1E293B" stroke-width="0.5" opacity="0.3" />
        </pattern>
        
        <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="${accent}" />
        </marker>
      </defs>

      <!-- Background Canvas -->
      <rect width="1600" height="1000" fill="url(#bg)" />
      <rect width="1600" height="1000" fill="url(#glow)" />
      <rect width="1600" height="1000" fill="url(#grid)" />

      <!-- Outer Frame & Decorative Accents -->
      <rect x="40" y="40" width="1520" height="920" rx="16" fill="none" stroke="#1E293B" stroke-width="1.5" />
      <line x1="40" y1="120" x2="1560" y2="120" stroke="#1E293B" stroke-width="1.5" />
      <line x1="40" y1="880" x2="1560" y2="880" stroke="#1E293B" stroke-width="1.5" />

      <!-- Top Technical Status Bar -->
      <g transform="translate(80, 85)">
        <!-- Window Dots -->
        <circle cx="0" cy="0" r="5" fill="#EF4444" opacity="0.8" />
        <circle cx="18" cy="0" r="5" fill="#F59E0B" opacity="0.8" />
        <circle cx="36" cy="0" r="5" fill="#10B981" opacity="0.8" />
        
        <text x="80" y="4" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="700" fill="#94A3B8" letter-spacing="2">
          RHSP CORE ARCHITECTURE // <tspan fill="${accent}">${code}</tspan>
        </text>

        <!-- Status Pill -->
        <g transform="translate(1220, -12)">
          <rect width="180" height="26" rx="13" fill="#1E293B" stroke="${accent}" stroke-width="1" />
          <circle cx="16" cy="13" r="4" fill="${accentSec}" />
          <text x="30" y="17" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#E2E8F0" letter-spacing="1.5">${typeBadge}</text>
        </g>
      </g>

      <!-- RHSP Subtle Geometric Watermark: Round Hole + Square Peg -->
      <g transform="translate(1320, 470)" opacity="0.35">
        <!-- Round hole -->
        <circle cx="0" cy="0" r="90" fill="none" stroke="#334155" stroke-width="2" />
        <circle cx="0" cy="0" r="110" fill="none" stroke="#1E293B" stroke-width="1" stroke-dasharray="6,6" />
        <!-- Isometric square peg motif -->
        <polygon points="0,-45 42,-20 42,30 0,55 -42,30 -42,-20" fill="none" stroke="${accent}" stroke-width="2" />
        <line x1="0" y1="5" x2="0" y2="55" stroke="${accent}" stroke-width="1.5" />
        <line x1="0" y1="5" x2="42" y2="-20" stroke="${accent}" stroke-width="1.5" />
        <line x1="0" y1="5" x2="-42" y2="-20" stroke="${accent}" stroke-width="1.5" />
      </g>

      <!-- Main Project Header Typography -->
      <g transform="translate(80, 220)">
        <rect width="90" height="24" rx="4" fill="#1E293B" />
        <text x="45" y="16" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" font-weight="800" fill="${accent}" letter-spacing="2">STAGE 03</text>
        
        <text x="0" y="70" font-family="system-ui, -apple-system, sans-serif" font-size="44" font-weight="800" fill="#FFFFFF" letter-spacing="-0.5">
          ${title}
        </text>
        
        <text x="0" y="112" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="400" fill="#94A3B8">
          ${tagline}
        </text>
      </g>

      <!-- Center Technical Schematic -->
      ${centerSchematic}

      <!-- Bottom Metric & Telemetry Rail -->
      <g transform="translate(80, 750)">
        <!-- Box 1 -->
        <rect x="0" y="0" width="280" height="90" rx="8" fill="#0B132B" stroke="#1E293B" stroke-width="1.5" />
        <text x="24" y="32" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#64748B" letter-spacing="2">ADAPTER TOPOLOGY</text>
        <text x="24" y="66" font-family="system-ui, sans-serif" font-size="22" font-weight="800" fill="${accent}">Deterministic</text>

        <!-- Box 2 -->
        <rect x="310" y="0" width="280" height="90" rx="8" fill="#0B132B" stroke="#1E293B" stroke-width="1.5" />
        <text x="334" y="32" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#64748B" letter-spacing="2">SECURITY AUDIT</text>
        <text x="334" y="66" font-family="system-ui, sans-serif" font-size="22" font-weight="800" fill="#E2E8F0">Zero Egress</text>

        <!-- Box 3 -->
        <rect x="620" y="0" width="280" height="90" rx="8" fill="#0B132B" stroke="#1E293B" stroke-width="1.5" />
        <text x="644" y="32" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#64748B" letter-spacing="2">GOVERNANCE</text>
        <text x="644" y="66" font-family="system-ui, sans-serif" font-size="22" font-weight="800" fill="${accentSec}">Hardened</text>
      </g>

      <!-- Mandatory Caption and Footer Legal/Brand Marker -->
      <g transform="translate(80, 925)">
        <text x="0" y="0" font-family="system-ui, sans-serif" font-size="13" font-weight="500" fill="#64748B">
          Round Hole Square Peg (RHSP) · Enterprise Production Systems
        </text>
        
        <!-- MANDATORY BRAND CAPTION -->
        <text x="1440" y="0" text-anchor="end" font-family="system-ui, sans-serif" font-size="13" font-weight="600" fill="#94A3B8" letter-spacing="1">
          Representative interface
        </text>
      </g>
    </svg>
  `;
}

async function main() {
  console.log('Generating canonical project posters and asset directories...');
  const baseOutDir = path.resolve('public/media/projects');
  fs.mkdirSync(baseOutDir, { recursive: true });

  for (const project of PROJECTS) {
    const projectDir = path.join(baseOutDir, project.slug);
    fs.mkdirSync(projectDir, { recursive: true });

    // 1600x1000 Desktop primary poster
    const svg1600 = renderSvg(project, 1600, 1000);
    const hero1600Path = path.join(projectDir, 'hero.webp');
    await sharp(Buffer.from(svg1600))
      .webp({ quality: 85, effort: 6 })
      .toFile(hero1600Path);

    const stats1600 = fs.statSync(hero1600Path);
    console.log(`  ✓ ${project.slug}/hero.webp: 1600x1000 (${Math.round(stats1600.size / 1024)} KB)`);

    // 800x500 Mobile / srcset poster
    const svg800 = renderSvg(project, 800, 500);
    const hero800Path = path.join(projectDir, 'hero-800.webp');
    await sharp(Buffer.from(svg800))
      .webp({ quality: 85, effort: 6 })
      .toFile(hero800Path);

    const stats800 = fs.statSync(hero800Path);
    console.log(`  ✓ ${project.slug}/hero-800.webp: 800x500 (${Math.round(stats800.size / 1024)} KB)`);
  }

  // Also optimize aboutus.png to aboutus.webp in public/media/about/ if aboutus.png exists
  const aboutusPng = path.resolve('public/media/raw/aboutus.png');
  const aboutDir = path.resolve('public/media/about');
  fs.mkdirSync(aboutDir, { recursive: true });
  if (fs.existsSync(aboutusPng)) {
    const aboutusWebp = path.join(aboutDir, 'aboutus.webp');
    await sharp(aboutusPng)
      .webp({ quality: 80, effort: 6 })
      .toFile(aboutusWebp);
    const aboutStat = fs.statSync(aboutusWebp);
    console.log(`  ✓ about/aboutus.webp created: ${Math.round(aboutStat.size / 1024)} KB (optimized from 643 KB)`);
  }

  console.log('\nAll project posters successfully generated within size budgets!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
