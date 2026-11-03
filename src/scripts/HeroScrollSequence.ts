// HeroScrollSequence.ts: Apple-style scroll-scrubbed image sequence with WebGL fallback

export interface HeroScrollOptions {
  track: HTMLElement;
  heroSection: HTMLElement;
  container: HTMLElement;
  wrapper?: HTMLElement | null;
  imgLight: HTMLImageElement;
  imgDark: HTMLImageElement;
  canvas: HTMLCanvasElement;
  webglFallback: HTMLElement;
  scrollCue?: HTMLElement | null;
}

export function initHeroScrollSequence(opts: HeroScrollOptions) {
  const {
    track,
    heroSection,
    wrapper,
    imgLight,
    imgDark,
    canvas,
    webglFallback,
    scrollCue
  } = opts;

  const TOTAL_FRAMES = 90;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // 1. Check fallbacks
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const conn = (navigator as any).connection;
  const isSaveData = Boolean(conn?.saveData);
  const isSlowConnection = conn?.effectiveType === 'slow-2g' || conn?.effectiveType === '2g';

  const getTheme = (): 'light' | 'dark' => {
    return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  };

  const getThemeBgColor = (): string => {
    const computed = getComputedStyle(document.documentElement).getPropertyValue('--color-bg').trim();
    if (computed) return computed;
    return currentTheme === 'dark' ? '#0E0E0E' : '#FFFFFF';
  };

  const getIsMobile = (): boolean => window.innerWidth < 768;

  let currentTheme = getTheme();
  let isMobile = getIsMobile();

  const getInitialImg = (): HTMLImageElement => {
    return currentTheme === 'dark' ? imgDark : imgLight;
  };

  // Helper to format frame path
  const getFrameUrl = (theme: 'light' | 'dark', mobile: boolean, index: number): string => {
    const padded = String(Math.max(1, Math.min(TOTAL_FRAMES, index))).padStart(4, '0');
    const device = mobile ? 'mobile' : 'desktop';
    return `/media/hero-seq/${theme}/${device}/${padded}.webp`;
  };

  // Sample corner pixel and blend hero background
  const sampledColors = new Map<string, string>();
  function sampleAndBlendBackground(source: CanvasImageSource) {
    if (sampledColors.has(currentTheme)) {
      heroSection.style.backgroundColor = sampledColors.get(currentTheme)!;
      return;
    }
    try {
      const sampleCanvas = document.createElement('canvas');
      sampleCanvas.width = 1;
      sampleCanvas.height = 1;
      const sCtx = sampleCanvas.getContext('2d', { willReadFrequently: true });
      if (!sCtx) return;
      sCtx.drawImage(source, 0, 0, 1, 1, 0, 0, 1, 1);
      const [r, g, b] = sCtx.getImageData(0, 0, 1, 1).data;
      const rgbColor = `rgb(${r}, ${g}, ${b})`;
      sampledColors.set(currentTheme, rgbColor);
      heroSection.style.backgroundColor = rgbColor;
    } catch {
      const fallbackColor = getThemeBgColor();
      sampledColors.set(currentTheme, fallbackColor);
      heroSection.style.backgroundColor = fallbackColor;
    }
  }

  // Pre-set background color based on computed style immediately
  heroSection.style.backgroundColor = getThemeBgColor();

  // Fallback A: Reduced motion - static first frame only
  if (prefersReducedMotion) {
    const initialImg = getInitialImg();
    if (initialImg.complete && initialImg.naturalWidth > 0) {
      sampleAndBlendBackground(initialImg);
    } else {
      initialImg.onload = () => sampleAndBlendBackground(initialImg);
    }
    return;
  }

  // Fallback B: Save-Data or very slow connection - static first frame only
  if (isSaveData || isSlowConnection) {
    const initialImg = getInitialImg();
    if (initialImg.complete && initialImg.naturalWidth > 0) {
      sampleAndBlendBackground(initialImg);
    } else {
      initialImg.onload = () => sampleAndBlendBackground(initialImg);
    }
    return;
  }

  // Image Cache: key = `${theme}-${device}-${frameIndex}`
  const imageCache = new Map<string, HTMLImageElement>();
  let hasSwappedToCanvas = false;
  let targetProgress = 0;
  let smoothedIndex = 1;
  let lastDrawnIndex = -1;
  let isDestroyed = false;
  let isRafRunning = false;

  function getCacheKey(theme: 'light' | 'dark', mobile: boolean, index: number) {
    return `${theme}-${mobile ? 'm' : 'd'}-${index}`;
  }

  // Nearest loaded frame finder: never show blank canvas
  function getNearestLoadedFrame(targetIdx: number, theme: 'light' | 'dark', mobile: boolean): HTMLImageElement | null {
    const directKey = getCacheKey(theme, mobile, targetIdx);
    const direct = imageCache.get(directKey);
    if (direct && direct.complete && direct.naturalWidth > 0) return direct;

    // Search outward: ±1, ±2, ±3...
    for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
      const lower = targetIdx - offset;
      if (lower >= 1) {
        const lowerImg = imageCache.get(getCacheKey(theme, mobile, lower));
        if (lowerImg && lowerImg.complete && lowerImg.naturalWidth > 0) return lowerImg;
      }
      const upper = targetIdx + offset;
      if (upper <= TOTAL_FRAMES) {
        const upperImg = imageCache.get(getCacheKey(theme, mobile, upper));
        if (upperImg && upperImg.complete && upperImg.naturalWidth > 0) return upperImg;
      }
    }

    const initialImg = getInitialImg();
    return initialImg.complete && initialImg.naturalWidth > 0 ? initialImg : null;
  }

  // Draw frame on canvas
  function renderFrame(frameIdx: number) {
    if (!ctx) return;
    const nearestImg = getNearestLoadedFrame(frameIdx, currentTheme, isMobile);
    if (!nearestImg) return;

    if (canvas.width !== nearestImg.naturalWidth || canvas.height !== nearestImg.naturalHeight) {
      canvas.width = nearestImg.naturalWidth;
      canvas.height = nearestImg.naturalHeight;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(nearestImg, 0, 0, canvas.width, canvas.height);
    lastDrawnIndex = frameIdx;

    if (!hasSwappedToCanvas) {
      canvas.style.display = 'block';
      canvas.style.opacity = '1';
      imgLight.style.display = 'none';
      imgDark.style.display = 'none';
      if (wrapper) wrapper.classList.add('has-canvas');
      hasSwappedToCanvas = true;
      sampleAndBlendBackground(canvas);
    }
  }

  // Fallback C: WebGL cube if frame assets are completely missing
  async function activateWebGLFallback() {
    console.warn('[Hero] Frame sequences missing or failed to load. Falling back to WebGL cube.');
    canvas.style.display = 'none';
    imgLight.style.display = 'none';
    imgDark.style.display = 'none';
    if (wrapper) wrapper.classList.add('has-canvas');
    webglFallback.style.display = 'block';
    try {
      const { initHero3D } = await import('./Hero3D');
      initHero3D(webglFallback);
    } catch (err) {
      console.error('Failed to initialize WebGL fallback', err);
    }
  }

  // Preload remaining frames sequentially in idle slices to ensure 0 main-thread blocking
  function startPreloading() {
    const testImg = new Image();
    testImg.src = getFrameUrl(currentTheme, isMobile, 1);

    testImg.onload = () => {
      imageCache.set(getCacheKey(currentTheme, isMobile, 1), testImg);
      renderFrame(1);
      sampleAndBlendBackground(testImg);

      let preloadIdx = 2;
      function preloadChunk(deadline?: any) {
        if (isDestroyed) return;
        let count = 0;
        while (preloadIdx <= TOTAL_FRAMES && count < 4 && (!deadline || deadline.timeRemaining() > 4)) {
          const idx = preloadIdx++;
          count++;
          const img = new Image();
          img.src = getFrameUrl(currentTheme, isMobile, idx);
          img.onload = () => {
            imageCache.set(getCacheKey(currentTheme, isMobile, idx), img);
            const currentTargetIdx = Math.round(smoothedIndex);
            if (currentTargetIdx === idx && lastDrawnIndex !== idx) {
              renderFrame(idx);
            }
          };
        }

        if (preloadIdx <= TOTAL_FRAMES && !isDestroyed) {
          if ('requestIdleCallback' in window) {
            (window as any).requestIdleCallback(preloadChunk);
          } else {
            setTimeout(preloadChunk, 60);
          }
        }
      }

      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(preloadChunk);
      } else {
        setTimeout(preloadChunk, 100);
      }
    };

    testImg.onerror = () => {
      activateWebGLFallback();
    };
  }

  startPreloading();

  // Scroll Progress Calculator
  function updateScrollProgress() {
    const rect = track.getBoundingClientRect();
    const totalScroll = track.offsetHeight - window.innerHeight;
    if (totalScroll > 0) {
      const currentScroll = -rect.top;
      targetProgress = Math.min(Math.max(currentScroll / totalScroll, 0), 1);
    } else {
      targetProgress = 0;
    }

    if (scrollCue) {
      scrollCue.style.opacity = targetProgress > 0.08 ? '0' : '0.75';
    }

    triggerTick();
  }

  // Animation Loop: lerp ~0.15 for smooth physical feel, running ONLY when moving
  function animationTick() {
    if (isDestroyed) {
      isRafRunning = false;
      return;
    }

    const targetIndex = 1 + targetProgress * (TOTAL_FRAMES - 1);
    const diff = targetIndex - smoothedIndex;

    if (Math.abs(diff) < 0.005) {
      smoothedIndex = targetIndex;
      const frameIndex = Math.round(smoothedIndex);
      if (hasSwappedToCanvas && frameIndex !== lastDrawnIndex) {
        renderFrame(frameIndex);
      }
      isRafRunning = false;
      return;
    }

    smoothedIndex += diff * 0.15;
    const frameIndex = Math.round(smoothedIndex);

    if (hasSwappedToCanvas && frameIndex !== lastDrawnIndex) {
      renderFrame(frameIndex);
    }

    requestAnimationFrame(animationTick);
  }

  function triggerTick() {
    if (!isRafRunning) {
      isRafRunning = true;
      requestAnimationFrame(animationTick);
    }
  }

  // Scroll listener
  window.addEventListener('scroll', updateScrollProgress, { passive: true });
  updateScrollProgress();

  // Resize listener
  function handleResize() {
    const newIsMobile = getIsMobile();
    if (newIsMobile !== isMobile) {
      isMobile = newIsMobile;
      lastDrawnIndex = -1;
      startPreloading();
    }
    updateScrollProgress();
  }

  window.addEventListener('resize', handleResize, { passive: true });

  // Theme change listener
  function handleThemeChange(newTheme: 'light' | 'dark') {
    if (newTheme === currentTheme) return;
    currentTheme = newTheme;
    lastDrawnIndex = -1;
    heroSection.style.backgroundColor = getThemeBgColor();

    if (!hasSwappedToCanvas) {
      const initialImg = getInitialImg();
      if (initialImg.complete && initialImg.naturalWidth > 0) {
        sampleAndBlendBackground(initialImg);
      }
      return;
    }

    const currIdx = Math.round(smoothedIndex);
    const themeTest = new Image();
    themeTest.src = getFrameUrl(currentTheme, isMobile, currIdx);
    themeTest.onload = () => {
      imageCache.set(getCacheKey(currentTheme, isMobile, currIdx), themeTest);
      renderFrame(currIdx);
      sampleAndBlendBackground(themeTest);
      startPreloading();
    };
  }

  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.attributeName === 'data-theme') {
        const theme = getTheme();
        handleThemeChange(theme);
      }
    }
  });

  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  const customThemeHandler = (e: any) => {
    if (e.detail?.theme) {
      handleThemeChange(e.detail.theme);
    }
  };
  window.addEventListener('rhsp-theme-change', customThemeHandler);

  return function destroy() {
    isDestroyed = true;
    isRafRunning = false;
    window.removeEventListener('scroll', updateScrollProgress);
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('rhsp-theme-change', customThemeHandler);
    observer.disconnect();
  };
}
