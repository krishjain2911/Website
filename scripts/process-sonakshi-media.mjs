import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';

const RAW = 'public/media/raw';
const OUT = 'public/images/solutions/sonakshi';
const LOOPS = path.join(OUT, 'loops');
fs.mkdirSync(LOOPS, { recursive: true });

const [cardsIn, uploadIn, dashIn] = process.argv.slice(2);
const VF = "scale='min(1280,iw)':-2:flags=lanczos,fps=30,format=yuv420p";
const run = (args) => execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: 'inherit' });
const probe = (f) => JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0',
  '-show_entries', 'stream=width,height:format=duration', '-of', 'json', f]).toString());
const kb = (f) => `${(fs.statSync(f).size / 1024).toFixed(0)} KB`;

function loop(input, name) {
  const src = path.join(RAW, input);
  const base = path.join(LOOPS, name);
  // H.264 mp4: universal. No audio track (muted loop), faststart so it plays before it is fully downloaded.
  run(['-i', src, '-an', '-vf', VF, '-c:v', 'libx264', '-profile:v', 'high', '-crf', '27', '-preset', 'slow', '-movflags', '+faststart', `${base}.mp4`]);
  // VP9 webm: smaller in Chrome/Firefox/Edge
  run(['-i', src, '-an', '-vf', VF, '-c:v', 'libvpx-vp9', '-crf', '36', '-b:v', '0', '-row-mt', '1', `${base}.webm`]);
  // Poster = first meaningful frame, shown before play and under reduced motion
  run(['-ss', '0.4', '-i', src, '-frames:v', '1', '-vf', "scale='min(1280,iw)':-2", '-q:v', '4', `${base}.jpg`]);
  const { streams: [s], format } = probe(`${base}.mp4`);
  console.log(`${name}: ${s.width}x${s.height}, ${Number(format.duration).toFixed(1)}s, mp4 ${kb(`${base}.mp4`)}, webm ${kb(`${base}.webm`)}`);
  console.log(`  aspectRatio="${s.width} / ${s.height}"`);
}

loop(cardsIn, 'sonakshi-product-cards');
loop(uploadIn, 'sonakshi-admin-upload');

// screenshot: png (fallback) + webp, max 1800px wide
const img = sharp(path.join(RAW, dashIn)).resize({ width: 1800, withoutEnlargement: true });
await img.clone().png({ compressionLevel: 9, adaptiveFiltering: true }).toFile(path.join(OUT, 'sonakshi-admin-dashboard.png'));
await img.clone().webp({ quality: 82 }).toFile(path.join(OUT, 'sonakshi-admin-dashboard.webp'));
const out = await sharp(path.join(OUT, 'sonakshi-admin-dashboard.png')).metadata();
console.log(`dashboard: ${out.width}x${out.height} (add to knownDimensions in MediaPicture.astro)`);
