import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const refDir = path.join(rootDir, 'ref-90');
const finalDir = path.join(rootDir, 'final-100');
const artifactRefDir = 'C:/Users/msi/.gemini/antigravity/brain/8f1454a9-2515-439e-82f8-a418871b80b4/ref-90';
const artifactFinalDir = 'C:/Users/msi/.gemini/antigravity/brain/8f1454a9-2515-439e-82f8-a418871b80b4/final-100';

const refMeas = JSON.parse(fs.readFileSync(path.join(refDir, 'measurements.json'), 'utf8'));
const finalMeas = JSON.parse(fs.readFileSync(path.join(finalDir, 'final-measurements.json'), 'utf8'));
const fitAudits = JSON.parse(fs.readFileSync(path.join(finalDir, 'fit-audits.json'), 'utf8'));

const viewports = ['1366x768', '1440x900', '1536x730', '1920x1080'];
const keys = [
  { label: 'Nav logo width', refKey: 'navLogoWidth', finalKey: 'navLogoWidth' },
  { label: 'Nav text height', refKey: 'navTextHeight', finalKey: 'navTextHeight' },
  { label: 'Hero headline height', refKey: 'heroHeadlineHeight', finalKey: 'heroHeadlineHeight' },
  { label: 'Cube width on PEG intro', refKey: 'cubeWidth', finalKey: 'cubeWidth' },
  { label: 'Project card width', refKey: 'projectCardWidth', finalKey: 'projectCardWidth' },
  { label: 'Container width', refKey: 'containerWidth', finalKey: 'containerWidth' },
  { label: 'Stage pill height', refKey: 'stagePillHeight', finalKey: 'stagePillHeight' }
];

console.log('=== VERIFICATION MEASUREMENTS TABLE ===');
for (const vp of viewports) {
  console.log(`\n### Viewport: ${vp}`);
  console.log('| Metric | ref-90 (Physical Px) | final-100 (Physical Px) | Delta | Status |');
  console.log('| :--- | :--- | :--- | :--- | :--- |');
  for (const k of keys) {
    const refVal = refMeas[vp][k.refKey] * 0.9;
    const finalVal = finalMeas[vp][k.finalKey];
    const diff = Math.abs(refVal - finalVal);
    const pass = diff <= 2.0;
    console.log(`| ${k.label} | ${refVal.toFixed(2)}px | ${finalVal.toFixed(2)}px | ${diff.toFixed(2)}px | ${pass ? 'PASS (<= 2px)' : 'FAIL'} |`);
  }
}

