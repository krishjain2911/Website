// localStorage and sessionStorage helpers for PEG Board (pins, explored, order, arrival)
// All storage access stays inside try/catch; counters and pins degrade silently

const PINS_KEY = 'rhsp.pegboard.pins';
const EXPLORED_KEY = 'rhsp.pegboard.explored';
const ORDER_KEY = 'rhsp.pegboard.v2.order';
const LEGACY_ORDER_KEY = 'rhsp.pegboard.order';
const ARRIVAL_KEY = 'rhsp.pegboard.v2.arrival';

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
    if (typeof window === 'undefined' || !window.localStorage) return [];
    const raw = window.localStorage.getItem(EXPLORED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function markExplored(slug: string): string[] {
  try {
    const list = getExploredSlugs();
    if (!list.includes(slug)) {
      const next = [...list, slug];
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(EXPLORED_KEY, JSON.stringify(next));
      }
      window.dispatchEvent(new CustomEvent('rhsp:pegboard:explored-changed', { detail: { explored: next } }));
      return next;
    }
    return list;
  } catch {
    return [];
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
