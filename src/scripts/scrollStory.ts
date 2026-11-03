/**
 * scrollStory.ts
 * Centralized, high-performance scroll & rAF controller for the RHSP homepage story.
 * - Single rAF loop; no layout thrash (read first, write second).
 * - IntersectionObserver gating: subscribers only update when visible or near viewport.
 * - ResizeObserver + fonts.ready + pageshow (bfcache) measurement caching.
 * - Shared easing and interpolation primitives.
 */

export interface ViewportState {
  scrollY: number;
  viewportWidth: number;
  viewportHeight: number;
  isReducedMotion: boolean;
}

export interface ScrollSubscriber {
  id: string;
  gateElement?: HTMLElement | null;
  measure?: (vp: ViewportState) => void;
  update?: (vp: ViewportState) => void;
  onActiveChange?: (isActive: boolean) => void;
}

// Math & Easing Primitives
export function clamp(val: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, val));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

export function easeOutCubic(t: number): number {
  const f = t - 1;
  return f * f * f + 1;
}

export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

class ScrollStoryController {
  private subscribers: Map<string, ScrollSubscriber> = new Map();
  private activeSubscribers: Set<string> = new Set();
  private observer: IntersectionObserver | null = null;
  private isTicking = false;
  private needsMeasure = true;

  private vp: ViewportState = {
    scrollY: 0,
    viewportWidth: 1440,
    viewportHeight: 900,
    isReducedMotion: false
  };

  constructor() {
    if (typeof window === 'undefined') return;
    this.init();
  }

  private init() {
    this.checkReducedMotion();

    if (typeof IntersectionObserver !== 'undefined') {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const id = (entry.target as HTMLElement).dataset.storyGateId;
            if (!id) return;
            const sub = this.subscribers.get(id);
            if (!sub) return;

            const wasActive = this.activeSubscribers.has(id);
            const isActive = entry.isIntersecting;

            if (isActive) {
              this.activeSubscribers.add(id);
            } else {
              this.activeSubscribers.delete(id);
            }

            if (wasActive !== isActive && sub.onActiveChange) {
              sub.onActiveChange(isActive);
            }
          });
          this.requestTick();
        },
        {
          rootMargin: '100px 0px 100px 0px', // Preload buffer
          threshold: [0, 0.05, 0.5, 1.0]
        }
      );
    }

    const onScroll = () => {
      this.requestTick();
    };

    const onResize = () => {
      this.needsMeasure = true;
      this.checkReducedMotion();
      this.requestTick();
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('pageshow', () => {
      this.needsMeasure = true;
      this.requestTick();
    });

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        this.needsMeasure = true;
        this.requestTick();
      });
    }

    // Astro view transitions hook
    document.addEventListener('astro:after-swap', () => {
      this.needsMeasure = true;
      this.requestTick();
    });

    this.needsMeasure = true;
    this.requestTick();
  }

  private checkReducedMotion() {
    if (typeof window === 'undefined') return;
    this.vp.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  public subscribe(sub: ScrollSubscriber) {
    this.subscribers.set(sub.id, sub);

    if (sub.gateElement && this.observer) {
      sub.gateElement.dataset.storyGateId = sub.id;
      this.observer.observe(sub.gateElement);
    } else {
      // If no gate element, always active
      this.activeSubscribers.add(sub.id);
    }

    this.needsMeasure = true;
    this.requestTick();
  }

  public unsubscribe(id: string) {
    const sub = this.subscribers.get(id);
    if (sub?.gateElement && this.observer) {
      this.observer.unobserve(sub.gateElement);
    }
    this.subscribers.delete(id);
    this.activeSubscribers.delete(id);
  }

  public invalidate() {
    this.needsMeasure = true;
    this.requestTick();
  }

  public requestTick() {
    if (this.isTicking) return;
    this.isTicking = true;
    requestAnimationFrame(this.tick);
  }

  private tick = () => {
    this.vp.scrollY = window.scrollY;
    this.vp.viewportWidth = window.innerWidth;
    this.vp.viewportHeight = window.innerHeight;

    // 1. Batch Read Phase (Measure)
    if (this.needsMeasure) {
      this.subscribers.forEach((sub) => {
        if (sub.measure) {
          sub.measure(this.vp);
        }
      });
      this.needsMeasure = false;
    }

    // 2. Batch Write Phase (Update active subscribers only)
    this.activeSubscribers.forEach((id) => {
      const sub = this.subscribers.get(id);
      if (sub && sub.update) {
        sub.update(this.vp);
      }
    });

    this.isTicking = false;
  };

  public getViewport(): ViewportState {
    return { ...this.vp };
  }
}

// Global Singleton
let storyController: ScrollStoryController | null = null;

export function getScrollStory(): ScrollStoryController {
  if (!storyController) {
    storyController = new ScrollStoryController();
  }
  return storyController;
}

