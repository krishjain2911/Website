import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import sharp from 'sharp';

const RAW_DIR = path.resolve('public/media/raw');
const OUT_DIR = path.resolve('public/media');
const HERO_SEQ_DIR = path.resolve('public/media/hero-seq');
const MANIFEST_PATH = path.resolve('public/media/manifest.json');
const HERO_MANIFEST_PATH = path.resolve('public/media/hero-seq/manifest.json');

// Expected assets per Prompt 3 and Image Update
const EXPECTED_IMAGES = [
  'product-voice-agents.png',
  'product-sovereign-ai.png',
  'product-ask-me-anything.png',
  'product-whatsapp-journeys.png',
  'product-clm.png',
  'product-dms.png',
  'feature-voice.png',
  'feature-sovereign.png',
  'feature-paper-to-platform.png',
  'feature-build-stack.png',
  'feature-peg.png',
  'before-whatsapp.png',
  'before-clm.png',
  'before-dms.png',
  'about-hero.png',
  'about-approach.png',
  'about-mission-icon.png',
  'about-purpose-icon.png',
  'about-vision-icon.png',
  'contact-angle.png',
  'og-default.png'
];

const EXPECTED_VIDEOS = [
  'peg-plan.mp4',
  'peg-engineer.mp4',
  'peg-gen-ai.mp4',
  'statement-band.mp4'
];

const WIDTHS = [480, 960, 1600];

// Locate ffmpeg binary
function getFfmpeg() {
  const candidates = [
    'ffmpeg',
    'C:/Users/msi/AppData/Local/Microsoft/WinGet/Links/ffmpeg.exe',
    path.join(process.env.LOCALAPPDATA || '', 'Microsoft/WinGet/Links/ffmpeg.exe')
  ];
  for (const cmd of candidates) {
    try {
      execSync(`"${cmd}" -version`, { stdio: 'ignore' });
      return cmd;
    } catch {}
  }
  return null;
}

// 1. Apple-style Scroll Scrubbed Hero Sequence Processing
async function processHeroSequence(ffmpegCmd) {
  console.log('\n--- Processing Hero Scroll Image Sequence ---');

  // Skip extraction if already built unless FORCE_HERO is specified
  const lightDesktop = path.join(HERO_SEQ_DIR, 'light/desktop');
  if (fs.existsSync(HERO_MANIFEST_PATH) && fs.existsSync(lightDesktop) && fs.readdirSync(lightDesktop).length >= 80 && !process.env.FORCE_HERO) {
    console.log('[SKIP] Hero image sequence frames already generated (90 frames). Skipping extraction.');
    return JSON.parse(fs.readFileSync(HERO_MANIFEST_PATH, 'utf8'));
  }

  if (!ffmpegCmd) {
    console.warn('[SKIP] FFmpeg not found. Hero sequence extraction skipped.');
    return null;
  }

  const themes = [
    { name: 'light', rawFile: 'hero-fit-light.mp4', startOffset: 0.27 },
    { name: 'dark', rawFile: 'hero-fit-dark.mp4', startOffset: 0 }
  ];

  const tempBase = path.resolve('scratch/hero-seq-temp');
  if (!fs.existsSync(tempBase)) {
    fs.mkdirSync(tempBase, { recursive: true });
  }

  const summary = {
    generatedAt: new Date().toISOString(),
    sets: {}
  };

  for (const { name: theme, rawFile, startOffset } of themes) {
    const rawPath = path.join(RAW_DIR, rawFile);
    if (!fs.existsSync(rawPath)) {
      console.warn(`[WARN] Video raw file not found: ${rawPath}`);
      continue;
    }

    const tempDir = path.join(tempBase, theme);
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    fs.mkdirSync(tempDir, { recursive: true });

    console.log(`\nExtracting frames for [${theme}] theme at 15fps (~90 frames)...`);
    // Extract 6s at 15fps (~90 frames). Start offset trims initial video zoom glitch if present.
    const ssArg = startOffset > 0 ? `-ss ${startOffset}` : '';
    execSync(
      `"${ffmpegCmd}" -y ${ssArg} -t 6 -i "${rawPath}" -vf "fps=15" "${path.join(tempDir, 'frame_%04d.png')}"`,
      { stdio: 'ignore' }
    );

    const rawFrames = fs.readdirSync(tempDir).filter(f => f.endsWith('.png')).sort();
    console.log(`Extracted ${rawFrames.length} frames for ${theme}. Processing crops and WebP encodings...`);

    const desktopDir = path.join(HERO_SEQ_DIR, theme, 'desktop');
    const mobileDir = path.join(HERO_SEQ_DIR, theme, 'mobile');

    fs.mkdirSync(desktopDir, { recursive: true });
    fs.mkdirSync(mobileDir, { recursive: true });

    // Clean previous
    for (const f of fs.readdirSync(desktopDir)) fs.unlinkSync(path.join(desktopDir, f));
    for (const f of fs.readdirSync(mobileDir)) fs.unlinkSync(path.join(mobileDir, f));

    // Crop to the cube & hole area (1280x720 -> centered 720x720 square from x:280..1000)
    const cropOpts = { left: 280, top: 0, width: 720, height: 720 };

    for (let i = 0; i < rawFrames.length; i++) {
      const srcFrame = path.join(tempDir, rawFrames[i]);
      const frameNum = String(i + 1).padStart(4, '0');
      const outDesktop = path.join(desktopDir, `${frameNum}.webp`);
      const outMobile = path.join(mobileDir, `${frameNum}.webp`);

      // Desktop: 1000px wide, WebP q=70
      await sharp(srcFrame)
        .extract(cropOpts)
        .resize(1000, 1000)
        .webp({ quality: 70, effort: 4 })
        .toFile(outDesktop);

      // Mobile: 600px wide, WebP q=70
      await sharp(srcFrame)
        .extract(cropOpts)
        .resize(600, 600)
        .webp({ quality: 70, effort: 4 })
        .toFile(outMobile);
    }

    // Check size & mobile downsampling rule (target ≤ 2.5MB desktop, ≤ 1MB mobile)
    let desktopBytes = fs.readdirSync(desktopDir).reduce((acc, f) => acc + fs.statSync(path.join(desktopDir, f)).size, 0);
    let mobileBytes = fs.readdirSync(mobileDir).reduce((acc, f) => acc + fs.statSync(path.join(mobileDir, f)).size, 0);

    let mobileFramesCount = rawFrames.length;

    // "on mobile, use every 2nd frame if needed" (if mobile exceeds 1MB target)
    if (mobileBytes > 1024 * 1024) {
      console.log(`[OPTIMIZE] Mobile ${theme} size (${(mobileBytes / 1024 / 1024).toFixed(2)}MB) > 1MB. Downsampling to every 2nd frame...`);
      const mobileFiles = fs.readdirSync(mobileDir).filter(f => f.endsWith('.webp')).sort();
      // Remove even-index files or odd-index files to keep every 2nd frame
      const kept = [];
      for (let j = 0; j < mobileFiles.length; j += 2) {
        kept.push(mobileFiles[j]);
      }
      for (const f of mobileFiles) {
        if (!kept.includes(f)) {
          fs.unlinkSync(path.join(mobileDir, f));
        }
      }
      // Re-index sequentially 0001.webp, 0002.webp...
      for (let k = 0; k < kept.length; k++) {
        const oldP = path.join(mobileDir, kept[k]);
        const newP = path.join(mobileDir, `${String(k + 1).padStart(4, '0')}.webp`);
        if (oldP !== newP) {
          fs.renameSync(oldP, newP);
        }
      }
      mobileFramesCount = kept.length;
      mobileBytes = fs.readdirSync(mobileDir).reduce((acc, f) => acc + fs.statSync(path.join(mobileDir, f)).size, 0);
    }

    const desktopMB = (desktopBytes / 1024 / 1024).toFixed(2);
    const mobileMB = (mobileBytes / 1024 / 1024).toFixed(2);
    const desktopPass = desktopBytes <= 2.5 * 1024 * 1024;
    const mobilePass = mobileBytes <= 1.0 * 1024 * 1024;

    console.log(`\n=== Hero Sequence Weight Report [${theme.toUpperCase()}] ===`);
    console.log(`  Desktop: ${rawFrames.length} frames | ${desktopMB} MB (${desktopBytes.toLocaleString()} bytes) [Target ≤ 2.5MB: ${desktopPass ? 'PASS ✓' : 'FAIL ✗'}]`);
    console.log(`  Mobile:  ${mobileFramesCount} frames | ${mobileMB} MB (${mobileBytes.toLocaleString()} bytes) [Target ≤ 1.0MB: ${mobilePass ? 'PASS ✓' : 'FAIL ✗'}]`);

    summary.sets[theme] = {
      desktop: {
        frames: rawFrames.length,
        totalBytes: desktopBytes,
        totalMB: desktopMB,
        width: 1000,
        height: 1000,
        pass: desktopPass
      },
      mobile: {
        frames: mobileFramesCount,
        totalBytes: mobileBytes,
        totalMB: mobileMB,
        width: 600,
        height: 600,
        pass: mobilePass
      }
    };
  }

  // Sample corner pixel for both themes to record exact background color
  try {
    const lightF1 = path.join(HERO_SEQ_DIR, 'light/desktop/0001.webp');
    const darkF1 = path.join(HERO_SEQ_DIR, 'dark/desktop/0001.webp');
    if (fs.existsSync(lightF1) && fs.existsSync(darkF1)) {
      const { data: dL } = await sharp(lightF1).raw().toBuffer({ resolveWithObject: true });
      const { data: dD } = await sharp(darkF1).raw().toBuffer({ resolveWithObject: true });
      summary.sampledColors = {
        light: `rgb(${dL[0]}, ${dL[1]}, ${dL[2]})`,
        dark: `rgb(${dD[0]}, ${dD[1]}, ${dD[2]})`
      };
      console.log(`\nSampled Corner Pixel Colors:`);
      console.log(`  Light: ${summary.sampledColors.light}`);
      console.log(`  Dark:  ${summary.sampledColors.dark}`);
    }
  } catch (err) {
    console.warn('Failed to sample corner pixel:', err);
  }

  // Clean temp
  try {
    fs.rmSync(tempBase, { recursive: true, force: true });
  } catch {}

  fs.writeFileSync(HERO_MANIFEST_PATH, JSON.stringify(summary, null, 2));
  return summary;
}

// Cutout helper for contact-* images (removes near-white background + defringes white halo)
async function cutoutContactImage(rawPath) {
  const { data, info } = await sharp(rawPath)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height } = info;
  const isCube = new Uint8Array(width * height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx], g = data[idx + 1], b = data[idx + 2];
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const diff = max - min;

      // Cut out floor shadow below cube vertex (y >= 1661)
      if (y >= 1661) continue;

      // Near-white background
      if (min >= 235 && diff <= 20) continue;
      if (min >= 220 && diff <= 14) continue;
      if (min >= 200 && diff <= 8) continue;

      // Must be orange / cube color: Red dominates
      if (r > b + 25 && r > 90) {
        isCube[y * width + x] = 1;
      }
    }
  }

  const output = Buffer.alloc(width * height * 4);
  const bgVal = 245;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pIdx = y * width + x;
      const oIdx = pIdx * 4;

      if (!isCube[pIdx]) {
        output[oIdx + 3] = 0;
        continue;
      }

      let emptyNeighbors = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const ny = y + dy, nx = x + dx;
          if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
            if (!isCube[ny * width + nx]) emptyNeighbors++;
          }
        }
      }

      const r = data[oIdx], g = data[oIdx + 1], b = data[oIdx + 2];

      if (emptyNeighbors === 0) {
        output[oIdx] = r;
        output[oIdx + 1] = g;
        output[oIdx + 2] = b;
        output[oIdx + 3] = 255;
      } else {
        // Edge feathering & decontaminate white background fringe
        const a = Math.max(0.35, Math.min(0.9, 1.0 - (emptyNeighbors / 8) * 0.65));
        output[oIdx + 3] = Math.round(a * 255);

        output[oIdx] = Math.max(0, Math.min(255, Math.round((r - (1 - a) * bgVal) / a)));
        output[oIdx + 1] = Math.max(0, Math.min(255, Math.round((g - (1 - a) * bgVal) / a)));
        output[oIdx + 2] = Math.max(0, Math.min(255, Math.round((b - (1 - a) * bgVal) / a)));
      }
    }
  }

  return sharp(output, { raw: { width, height, channels: 4 } });
}

async function processMedia() {
  console.log('--- RHSP Media Processing Pipeline ---');

  if (!fs.existsSync(RAW_DIR)) {
    fs.mkdirSync(RAW_DIR, { recursive: true });
    console.log(`Created raw media directory at ${RAW_DIR}`);
  }

  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  const manifest = {
    updatedAt: new Date().toISOString(),
    images: {},
    videos: {},
    heroSequence: null,
    missingExpected: {
      images: [],
      videos: []
    }
  };

  const ffmpegCmd = getFfmpeg();
  if (!ffmpegCmd) {
    console.warn('\n[NOTE] FFmpeg is not installed or not in PATH.');
    console.warn('To enable video optimization:');
    console.warn('  Windows: winget install Gyan.FFmpeg');
    console.warn('  macOS:   brew install ffmpeg');
    console.warn('  Linux:   sudo apt-get install ffmpeg\n');
  }

  // 1. Process Hero Sequence (Apple-style scroll scrubber)
  const heroSeqSummary = await processHeroSequence(ffmpegCmd);
  if (heroSeqSummary) {
    manifest.heroSequence = heroSeqSummary;
  }

  // 2. Process Standard Images (recursively from raw subfolders and mirror to output)
  const imageItems = [];

  function scanRawDir(dir, relDir = '') {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const curRel = relDir ? `${relDir}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        scanRawDir(fullPath, curRel);
      } else if (/\.(png|jpe?g|webp)$/i.test(entry.name)) {
        // Skip duplicate raw source backup from generator
        if (entry.name.startsWith('Gemini_Generated_Image_')) continue;
        const subfolder = relDir; // e.g. 'solutions', 'featured', 'before', 'about', 'contact', 'social'
        imageItems.push({
          rawPath: fullPath,
          key: path.parse(entry.name).name,
          file: entry.name,
          subfolder,
          url: `/media/raw/${curRel}`
        });
      }
    }
  }

  scanRawDir(RAW_DIR);

  for (const { rawPath, key, file, subfolder, url } of imageItems) {
    console.log(`Processing image: ${file} (key: ${key}, subfolder: ${subfolder || 'root'})`);

    const image = sharp(rawPath);
    const metadata = await image.metadata();

    const targetSubDir = subfolder ? path.join(OUT_DIR, subfolder) : OUT_DIR;
    fs.mkdirSync(targetSubDir, { recursive: true });

    const entryData = {
      raw: url,
      subfolder: subfolder || '',
      width: metadata.width,
      height: metadata.height,
      aspectRatio: metadata.width && metadata.height ? +(metadata.width / metadata.height).toFixed(3) : 1.778,
      formats: {
        avif: {},
        webp: {}
      }
    };

    manifest.images[key] = entryData;

    const isContact = key.startsWith('contact-');
    let sourceImage = sharp(rawPath);
    if (isContact) {
      console.log(`[CUTOUT] Removing white background and defringing for ${key}...`);
      const cutoutPipeline = await cutoutContactImage(rawPath);
      const cutoutBuffer = await cutoutPipeline.png().toBuffer();
      sourceImage = sharp(cutoutBuffer);

      // Save master png cutout fallback
      const rootPngOut = path.join(targetSubDir, `${key}.png`);
      fs.writeFileSync(rootPngOut, cutoutBuffer);
    }

    const isSmall = [
      'about-mission-icon',
      'about-purpose-icon',
      'about-vision-icon',
      'founder-subu',
      'founder-abhishek'
    ].includes(key);
    const targetWidths = isContact ? [480, 960] : isSmall ? [128, 200, 480, ...WIDTHS] : WIDTHS;

    for (const width of targetWidths) {
      if (metadata.width && width > metadata.width * 1.5) {
        continue;
      }

      const avifName = `${key}-${width}.avif`;
      const webpName = `${key}-${width}.webp`;
      const avifOut = path.join(targetSubDir, avifName);
      const webpOut = path.join(targetSubDir, webpName);

      await sourceImage
        .clone()
        .resize(width, null, { withoutEnlargement: true })
        .avif({ quality: 80, effort: 4 })
        .toFile(avifOut);

      await sourceImage
        .clone()
        .resize(width, null, { withoutEnlargement: true })
        .webp({ quality: 85, effort: 4 })
        .toFile(webpOut);

      const relPathPrefix = subfolder ? `/media/${subfolder}/` : '/media/';
      manifest.images[key].formats.avif[width] = `${relPathPrefix}${avifName}`;
      manifest.images[key].formats.webp[width] = `${relPathPrefix}${webpName}`;

      if (isContact) {
        if (!manifest.images[key].formats.png) manifest.images[key].formats.png = {};
        const pngName = `${key}-${width}.png`;
        const pngOut = path.join(targetSubDir, pngName);
        await sourceImage
          .clone()
          .resize(width, null, { withoutEnlargement: true })
          .png({ compressionLevel: 8 })
          .toFile(pngOut);
        manifest.images[key].formats.png[width] = `${relPathPrefix}${pngName}`;
      }
    }

    // Aliases for compatibility
    if (key === 'product-voice-agents') {
      manifest.images['product-sonakshi'] = manifest.images[key];
    }
    if (key === 'product-sovereign-ai') {
      manifest.images['product-sovreign'] = manifest.images[key];
    }
  }

  // 3. Process Standard Videos (Excluding hero-fit videos processed above)
  const rawFiles = fs.existsSync(RAW_DIR) ? fs.readdirSync(RAW_DIR) : [];
  const videoFiles = rawFiles.filter(f => /\.(mp4|mov|webm)$/i.test(f) && !f.startsWith('hero-fit-'));

  for (const file of videoFiles) {
    const rawPath = path.join(RAW_DIR, file);
    const key = path.parse(file).name;
    console.log(`Processing video: ${file} (key: ${key})`);

    manifest.videos[key] = {
      raw: `/media/raw/${file}`,
      mp4: `/media/raw/${file}`
    };

    if (ffmpegCmd) {
      const mp4Out = path.join(OUT_DIR, `${key}.mp4`);
      const posterRaw = path.join(OUT_DIR, `${key}-poster.png`);
      const posterAvif = path.join(OUT_DIR, `${key}-poster.avif`);

      try {
        execSync(
          `"${ffmpegCmd}" -y -i "${rawPath}" -an -t 6 -vf "scale='min(1280,iw)':-2" -c:v libx264 -pix_fmt yuv420p -crf 24 -preset slow "${mp4Out}"`,
          { stdio: 'inherit' }
        );
        manifest.videos[key].mp4 = `/media/${key}.mp4`;

        execSync(
          `"${ffmpegCmd}" -y -ss 00:00:01 -i "${rawPath}" -vframes 1 -update 1 "${posterRaw}"`,
          { stdio: 'inherit' }
        );

        if (fs.existsSync(posterRaw)) {
          await sharp(posterRaw).avif({ quality: 80 }).toFile(posterAvif);
          manifest.videos[key].poster = `/media/${key}-poster.avif`;
          fs.unlinkSync(posterRaw);
        }
      } catch (err) {
        console.error(`Failed to process video ${file} with ffmpeg:`, err);
      }
    }
  }

  // 4. Check for Missing Expected Assets
  for (const expectedImg of EXPECTED_IMAGES) {
    const key = path.parse(expectedImg).name;
    if (!manifest.images[key]) {
      manifest.missingExpected.images.push(expectedImg);
    }
  }

  for (const expectedVid of EXPECTED_VIDEOS) {
    const key = path.parse(expectedVid).name;
    if (!manifest.videos[key]) {
      manifest.missingExpected.videos.push(expectedVid);
    }
  }

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log(`\nManifest written to ${MANIFEST_PATH}`);
  console.log(`Images processed: ${Object.keys(manifest.images).length} / ${EXPECTED_IMAGES.length} expected`);
  console.log(`Videos processed: ${Object.keys(manifest.videos).length} / ${EXPECTED_VIDEOS.length} expected`);
  if (manifest.missingExpected.images.length > 0) {
    console.log(`Missing images (will display designed fallback):`, manifest.missingExpected.images);
  }
  if (manifest.missingExpected.videos.length > 0) {
    console.log(`Missing videos (will display designed fallback):`, manifest.missingExpected.videos);
  }
}

processMedia().catch(console.error);
