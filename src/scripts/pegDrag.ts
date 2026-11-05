import { saveOrder } from './pegBoardState';

const MQ = '(hover: hover) and (pointer: fine) and (min-width: 900px)';

type Drag = {
  el: HTMLElement;
  zone: HTMLElement;
  id: number;
  sx: number;
  sy: number; // pointer start (screen px)
  w: number;
  h: number; // tile size in CSS px, measured BEFORE any class change
  k: number; // screen px per CSS px (html zoom .9)
  started: boolean;
  ph: HTMLElement | null;
  raf: number;
  px: number;
  py: number;
};

let drag: Drag | null = null; // THE single active drag

export function triggerTileSwing(el: HTMLElement) {
  if (typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  el.classList.remove('is-swinging');
  void el.offsetWidth; // force reflow
  el.classList.add('is-swinging');
  setTimeout(() => el.classList.remove('is-swinging'), 1250);
}

export function initPegDrag(board: HTMLElement) {
  const mq = matchMedia(MQ);

  const apply = () => {
    board.classList.toggle('drag-enabled', mq.matches);
    if (!mq.matches) cancel(true);
  };

  mq.addEventListener('change', apply);
  apply();

  // Prevent HTML5 native link dragging
  board.addEventListener('dragstart', (e) => e.preventDefault());

  // Pointerdown: start tracking one tile only
  board.addEventListener('pointerdown', (e) => {
    if (!mq.matches || drag || e.button !== 0) return; // one drag at a time
    const el = (e.target as HTMLElement).closest<HTMLElement>('.pb-tile');
    if (!el || (e.target as HTMLElement).closest('button,input,a[data-nodrag],.tile-pin-btn')) return;
    const zone = el.parentElement?.closest<HTMLElement>('[data-zone], .zone-tiles-track');
    if (!zone) return;

    const r = el.getBoundingClientRect();
    const k = r.width / el.offsetWidth || 1;
    drag = {
      el,
      zone,
      id: e.pointerId,
      sx: e.clientX,
      sy: e.clientY,
      w: el.offsetWidth,
      h: el.offsetHeight,
      k,
      started: false,
      ph: null,
      raf: 0,
      px: e.clientX,
      py: e.clientY
    };
  });

  // Pointermove: drag with 6px threshold & same-zone sibling sliding
  board.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = (e.clientX - drag.sx) / drag.k;
    const dy = (e.clientY - drag.sy) / drag.k;

    if (!drag.started) {
      if (Math.hypot(dx, dy) < 6) return;
      drag.started = true;
      const { el, w, h } = drag;

      drag.ph = document.createElement('div');
      drag.ph.className = 'pb-tile-ph';
      drag.ph.style.cssText = `width:${w}px;height:${h}px;grid-column:auto`; // keeps the slot
      el.before(drag.ph);

      // Lift the tile OUT of the grid without changing its size:
      el.style.width = `${w}px`;
      el.style.height = `${h}px`; // set size FIRST
      el.classList.add('is-dragging'); // then position:fixed
      const r = drag.ph.getBoundingClientRect();
      el.style.left = `${r.left / drag.k}px`; // fixed coords in CSS px
      el.style.top = `${r.top / drag.k}px`;
      el.dataset.noclick = '1';
      try {
        el.setPointerCapture(e.pointerId);
      } catch {}
      document.documentElement.classList.add('pb-is-dragging'); // disables hover/tilt/text selection
    }

    drag.px = e.clientX;
    drag.py = e.clientY;
    if (!drag.raf) {
      drag.raf = requestAnimationFrame(() => {
        if (!drag || !drag.started) return;
        drag.raf = 0;
        const ddx = (drag.px - drag.sx) / drag.k;
        const ddy = (drag.py - drag.sy) / drag.k;
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const rot = reduceMotion ? 0 : Math.max(-3, Math.min(3, ddx / 60));
        drag.el.style.transform = `translate3d(${ddx}px,${ddy}px,0) rotate(${rot}deg) scale(1.02)`;

        // Edge auto-scroll: if within 80px of viewport top/bottom, scrollBy(0, ±12)
        const vh = window.innerHeight;
        if (drag.py < 80) {
          window.scrollBy(0, -12);
        } else if (drag.py > vh - 80) {
          window.scrollBy(0, 12);
        }

        // Sibling hit-test + FLIP
        const curPx = drag.px;
        const curPy = drag.py;
        const sibs = [...drag.zone.querySelectorAll<HTMLElement>('.pb-tile:not(.is-dragging)')];
        const hit = sibs.find((s) => {
          const b = s.getBoundingClientRect();
          return curPx > b.left && curPx < b.right && curPy > b.top && curPy < b.bottom;
        });

        if (hit && drag.ph) {
          const first = new Map(sibs.map((s) => [s, s.getBoundingClientRect()]));
          const isPhBeforeHit = !!(hit.compareDocumentPosition(drag.ph) & Node.DOCUMENT_POSITION_PRECEDING);
          if (isPhBeforeHit) {
            hit.after(drag.ph);
          } else {
            hit.before(drag.ph);
          }

          if (!reduceMotion) {
            sibs.forEach((s) => {
              const a = first.get(s);
              if (!a) return;
              const b = s.getBoundingClientRect();
              const diffX = (a.left - b.left) / drag!.k;
              const diffY = (a.top - b.top) / drag!.k;
              if (!diffX && !diffY) return;
              s.animate([{ transform: `translate(${diffX}px,${diffY}px)` }, { transform: 'none' }], {
                duration: 180,
                easing: 'cubic-bezier(.22,1,.36,1)'
              });
            });
          }
        }
      });
    }
  });

  const end = (e: PointerEvent) => {
    if (!drag || e.pointerId !== drag.id) return;
    if (drag.started && drag.ph) {
      const { el, ph, zone, k } = drag;
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const to = ph.getBoundingClientRect();
      const from = el.getBoundingClientRect();

      ph.replaceWith(el);
      cleanup(); // tile is back in flow

      if (!reduceMotion) {
        el.animate(
          [
            { transform: `translate(${(from.left - to.left) / k}px, ${(from.top - to.top) / k}px) scale(1.02)` },
            { transform: 'none' }
          ],
          { duration: 220, easing: 'cubic-bezier(.22, 1, .36, 1)' }
        );
      }

      // Damped swing after drop
      triggerTileSwing(el);

      const ids = [...zone.querySelectorAll<HTMLElement>('.pb-tile')].map((t) => t.dataset.id || '');
      const zoneId = zone.dataset.zone || '';
      if (zoneId) {
        saveOrder(zoneId, ids);
      }
      setTimeout(() => {
        delete el.dataset.noclick;
      }, 50);
      return;
    }
    cleanup();
  };

  board.addEventListener('pointerup', end);
  board.addEventListener('pointercancel', end);

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') cancel(true);
  });

  // Swallow click that follows a drag
  board.addEventListener(
    'click',
    (e) => {
      const t = (e.target as HTMLElement).closest<HTMLElement>('.pb-tile');
      if (t?.dataset.noclick) {
        e.preventDefault();
        e.stopPropagation();
        delete t.dataset.noclick;
      }
    },
    true
  );

  // Keyboard fallback: Alt+ArrowLeft / Alt+ArrowRight on focused tile
  board.addEventListener('keydown', (e) => {
    if (!e.altKey || (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight')) return;
    const tile = (e.target as HTMLElement).closest<HTMLElement>('.pb-tile');
    if (!tile) return;
    const zone = tile.parentElement?.closest<HTMLElement>('[data-zone], .zone-tiles-track');
    if (!zone) return;

    const sibs = [...zone.querySelectorAll<HTMLElement>('.pb-tile')];
    const currentIndex = sibs.indexOf(tile);
    if (currentIndex === -1) return;

    const newIndex = e.key === 'ArrowLeft' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= sibs.length) return;

    e.preventDefault();
    const targetSibling = sibs[newIndex];
    if (e.key === 'ArrowLeft') {
      zone.insertBefore(tile, targetSibling);
    } else {
      zone.insertBefore(tile, targetSibling.nextSibling);
    }

    triggerTileSwing(tile);

    const ids = [...zone.querySelectorAll<HTMLElement>('.pb-tile')].map((t) => t.dataset.id || '');
    const zoneId = zone.dataset.zone || '';
    if (zoneId) {
      saveOrder(zoneId, ids);
    }

    const liveStatus = document.getElementById('search-live-status');
    const tileTitle = tile.querySelector('.tile-title')?.textContent || tile.dataset.id || 'Tile';
    if (liveStatus) {
      liveStatus.textContent = `Moved ${tileTitle} to position ${newIndex + 1} of ${sibs.length}.`;
    }

    tile.focus();
  });
}

function cancel(restore: boolean) {
  if (drag?.ph && restore) {
    drag.ph.remove();
  }
  cleanup();
}

function cleanup() {
  if (!drag) return;
  if (drag.raf) {
    cancelAnimationFrame(drag.raf);
    drag.raf = 0;
  }
  document.documentElement.classList.remove('pb-is-dragging');
  drag.el.classList.remove('is-dragging');
  drag.el.style.transform = '';
  drag.el.style.width = '';
  drag.el.style.height = '';
  drag.el.style.left = '';
  drag.el.style.top = '';
  try {
    drag.el.releasePointerCapture(drag.id);
  } catch {}
  drag = null;
}
