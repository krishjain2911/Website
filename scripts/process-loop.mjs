// Usage: node scripts/process-loop.mjs <solution-slug> <loop-name> <file-in-public/media/raw>
// Example: node scripts/process-loop.mjs vernacular-documents vernacular-template-flow vernacular-template-flow.mp4
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const [slug, name, input] = process.argv.slice(2);
if (!slug || !name || !input) {
  console.error('Usage: node scripts/process-loop.mjs <slug> <loop-name> <raw-file-name>');
  process.exit(1);
}
const src = path.join('public/media/raw', input);
if (!fs.existsSync(src)) {
  console.error(`Not found: ${src}\nFiles in public/media/raw:\n  ` + fs.readdirSync('public/media/raw').join('\n  '));
  process.exit(1);
}
const dir = path.join('public/images/solutions', slug, 'loops');
fs.mkdirSync(dir, { recursive: true });
const base = path.join(dir, name);

const VF = "scale='min(1280,iw)':-2:flags=lanczos,fps=30,format=yuv420p";
const run = (args) => execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: 'inherit' });
const kb = (f) => `${(fs.statSync(f).size / 1024).toFixed(0)} KB`;

// mp4 (works everywhere), no audio, starts playing before fully downloaded
run(['-i', src, '-an', '-vf', VF, '-c:v', 'libx264', '-profile:v', 'high', '-crf', '27', '-preset', 'slow', '-movflags', '+faststart', `${base}.mp4`]);
// webm (smaller in Chrome/Firefox/Edge)
run(['-i', src, '-an', '-vf', VF, '-c:v', 'libvpx-vp9', '-crf', '36', '-b:v', '0', '-row-mt', '1', `${base}.webm`]);
// poster image
run(['-ss', '0.4', '-i', src, '-frames:v', '1', '-vf', "scale='min(1280,iw)':-2", '-q:v', '4', `${base}.jpg`]);

const info = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0',
  '-show_entries', 'stream=width,height:format=duration', '-of', 'json', `${base}.mp4`]).toString());
const s = info.streams[0];
console.log(`${name}: ${s.width}x${s.height}, ${Number(info.format.duration).toFixed(1)}s`);
console.log(`  mp4 ${kb(base + '.mp4')}, webm ${kb(base + '.webm')}, poster ${kb(base + '.jpg')}`);
console.log(`  use aspectRatio="${s.width} / ${s.height}"`);
