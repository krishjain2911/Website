// localStorage and sessionStorage helpers for PEG Board (pins, explored, order, arrival)
// All storage access stays inside try/catch; counters and pins degrade silently

const PINS_KEY = 'rhsp.pegboard.pins';
const EXPLORED_KEY = 'rhsp.pegboard.v3.explored';
const LEGACY_EXPLORED_KEY = 'rhsp.pegboard.explored';
const ORDER_KEY = 'rhsp.pegboard.v2.order';
const LEGACY_ORDER_KEY = 'rhsp.pegboard.order';
const ARRIVAL_KEY = 'rhsp.pegboard.v2.arrival';

// In-memory explored list for the current session
let inMemoryExplored: string[] = [];

// Clean up any legacy persistent explored state from localStorage
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.removeItem(LEGACY_EXPLORED_KEY);
    window.localStorage.removeItem(EXPLORED_KEY);
  }
} catch {}

export function isPageReloadOrHardRefresh(): boolean {
  if (typeof window === 'undefined' || typeof performance === 'undefined') return false;
  try {
    const navEntries = performance.getEntriesByType('navigation');
    if (navEntries && navEntries.length > 0) {
      const navEntry = navEntries[0] as PerformanceNavigationTiming;
      return navEntry.type === 'reload';
    }
    if ((performance as any).navigation && (performance as any).navigation.type === 1) {
      return true;
    }
  } catch {}
  return false;
}

export function resetExplored(): void {
  inMemoryExplored = [];
  try {
    if (typeof window !== 'undefined') {
      if (window.sessionStorage) {
        window.sessionStorage.removeItem(EXPLORED_KEY);
        window.sessionStorage.removeItem(LEGACY_EXPLORED_KEY);
      }
      if (window.localStorage) {
        window.localStorage.removeItem(EXPLORED_KEY);
        window.localStorage.removeItem(LEGACY_EXPLORED_KEY);
      }
      window.dispatchEvent(new CustomEvent('rhsp:pegboard:explored-changed', { detail: { explored: [] } }));
    }
  } catch {}
}

export function initExploredState(): void {
  try {
    if (typeof window === 'undefined') return;

    // Detect if this is a page reload (F5, Ctrl+R, Ctrl+Shift+R, or reload button)
    const isReload = isPageReloadOrHardRefresh();

    // Check if this navigation is returning from a subpage (guide or solution)
    const referrer = document.referrer || '';
    const cameFromSubpage = referrer.includes('/peg-board/') || referrer.includes('/solutions/');

    let isBackForward = false;
    try {
      const navEntries = performance.getEntriesByType('navigation');
      if (navEntries && navEntries.length > 0) {
        isBackForward = (navEntries[0] as PerformanceNavigationTiming).type === 'back_forward';
      }
    } catch {}

    // On complete page reload, Ctrl+Shift+R, or direct fresh visit: reset progress bar
    if (isReload || (!cameFromSubpage && !isBackForward)) {
      resetExplored();
    } else {
      inMemoryExplored = getExploredSlugs();
    }
  } catch {}
}

// Proactively reset explored state when reload shortcuts are pressed
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', (e) => {
    if (((e.ctrlKey || e.metaKey) && (e.key === 'r' || e.key === 'R')) || e.key === 'F5') {
      resetExplored();
    }
  });
}

export function getPinnedSlugs(): string[] {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return [];
    const raw = window.localStorage.getItem(PINS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function isPinned(slug: string): boolean {
  return getPinnedSlugs().includes(slug);
}

export function togglePin(slug: string, source: string = 'toggle'): { pinned: boolean; slugs: string[] } {
  try {
    const slugs = getPinnedSlugs();
    const idx = slugs.indexOf(slug);
    let next: string[];
    let pinned: boolean;
    if (idx >= 0) {
      next = slugs.filter((s) => s !== slug);
      pinned = false;
    } else {
      next = [...slugs, slug];
      pinned = true;
    }
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(PINS_KEY, JSON.stringify(next));
    }
    window.dispatchEvent(
      new CustomEvent('rhsp:pegboard:pins-changed', {
        detail: { slugs: next, toggledSlug: slug, pinned, source }
      })
    );
    return { pinned, slugs: next };
  } catch {
    return { pinned: false, slugs: [] };
  }
}

export function getExploredSlugs(): string[] {
  try {
    if (typeof window === 'undefined') return inMemoryExplored;
    if (window.sessionStorage) {
      const raw = window.sessionStorage.getItem(EXPLORED_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    }
    return inMemoryExplored;
  } catch {
    return inMemoryExplored;
  }
}

export function markExplored(slug: string): string[] {
  try {
    const list = getExploredSlugs();
    if (!list.includes(slug)) {
      const next = [...list, slug];
      inMemoryExplored = next;
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.setItem(EXPLORED_KEY, JSON.stringify(next));
      }
      window.dispatchEvent(new CustomEvent('rhsp:pegboard:explored-changed', { detail: { explored: next } }));
      return next;
    }
    return list;
  } catch {
    return inMemoryExplored;
  }
}

export function getSavedTileOrder(): Record<string, string[]> | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    const raw = window.localStorage.getItem(ORDER_KEY) || window.localStorage.getItem(LEGACY_ORDER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : null;
  } catch {
    return null;
  }
}

export function saveTileOrder(order: Record<string, string[]>): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(ORDER_KEY, JSON.stringify(order));
    }
  } catch {
    // silent degrade
  }
}

export function saveOrder(zoneId: string, ids: string[]): void {
  try {
    const current = getSavedTileOrder() || {};
    current[zoneId] = ids;
    saveTileOrder(current);
  } catch {
    // silent degrade
  }
}

export function resetTileOrder(): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(ORDER_KEY);
      window.localStorage.removeItem(LEGACY_ORDER_KEY);
    }
    window.dispatchEvent(new CustomEvent('rhsp:pegboard:order-reset'));
  } catch {
    // silent degrade
  }
}

// Clear any previously saved v3 layout so visitors start with the default arrangement
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.removeItem('rhsp.pegboard.v3.layout');
  }
} catch {}

export function clearLayout(): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('rhsp.pegboard.v3.layout');
    }
  } catch {}
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('rhsp:pegboard:layout-reset'));
  }
}

export function hasArrivalPlayed(): boolean {
  try {
    if (typeof window === 'undefined' || !window.sessionStorage) return true;
    return window.sessionStorage.getItem(ARRIVAL_KEY) === 'true';
  } catch {
    return true;
  }
}

export function markArrivalPlayed(): void {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.setItem(ARRIVAL_KEY, 'true');
    }
  } catch {
    // silent degrade
  }
}

export const hasVisitedArrival = hasArrivalPlayed;
export const setArrivalVisited = markArrivalPlayed;
