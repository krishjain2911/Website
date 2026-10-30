import { execSync } from 'child_process';
import fs from 'fs';

const pages = [
  { name: 'Homepage (/)', url: 'http://localhost:4321/', file: 'lh-home.json' },
  { name: 'About (/about)', url: 'http://localhost:4321/about', file: 'lh-about.json' },
  { name: 'Solutions Index (/solutions)', url: 'http://localhost:4321/solutions', file: 'lh-solutions.json' },
  { name: 'Product Detail (/solutions/voice-agents)', url: 'http://localhost:4321/solutions/voice-agents', file: 'lh-product.json' }
];

console.log('Running mobile Lighthouse audits on all three pages...\n');

for (const p of pages) {
  console.log(`Auditing ${p.name} ...`);
  try {
    execSync(`npx -y lighthouse ${p.url} --chrome-flags="--headless" --output=json --output-path=./${p.file} --form-factor=mobile --screenEmulation.mobile --throttling.rttMs=150 --throttling.throughputKbps=1638.4 --quiet`, { stdio: 'inherit' });
  } catch (err) {
    console.error(`Audit failed for ${p.url}:`, err.message);
  }
}

console.log('\n--- AUDIT SUMMARY ---\n');

for (const p of pages) {
  if (!fs.existsSync(p.file)) continue;
  const report = JSON.parse(fs.readFileSync(p.file, 'utf8'));
  const cats = report.categories;
  const audits = report.audits;
  
  console.log(`=== ${p.name} ===`);
  console.log(`Performance:    ${Math.round(cats.performance.score * 100)}`);
  console.log(`Accessibility:  ${Math.round(cats.accessibility.score * 100)}`);
  console.log(`Best Practices: ${Math.round(cats['best-practices'].score * 100)}`);
  console.log(`SEO:            ${Math.round(cats.seo.score * 100)}`);
  console.log(`LCP:            ${audits['largest-contentful-paint']?.displayValue}`);
  console.log(`CLS:            ${audits['cumulative-layout-shift']?.displayValue}`);
  console.log(`TBT:            ${audits['total-blocking-time']?.displayValue}`);
  console.log(`FCP:            ${audits['first-contentful-paint']?.displayValue}\n`);
}
