import { saveOrder } from './pegBoardState';

const MQ = '(hover: hover) and (pointer: fine) and (min-width: 900px)';

type Drag = {
  el: HTMLElement;
  zone: HTMLElement;
  id: number;
  sx: number;
  sy: number;
  ox: number;
  oy: number;
  started: boolean;
  k: number;
  ph: HTMLElement | null;
};

let drag: Drag | null = null; // THE single active drag

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
      ox: 0,
      oy: 0,
      started: false,
      k,
      ph: null
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

      const r = drag.el.getBoundingClientRect();
      const zr = drag.zone.getBoundingClientRect();
      drag.ox = (r.left - zr.left) / drag.k;
      drag.oy = (r.top - zr.top) / drag.k;

      drag.ph = document.createElement('div'); // placeholder keeps the slot
      drag.ph.className = 'pb-tile-ph';
      drag.ph.style.cssText = `width:${drag.el.offsetWidth}px;height:${drag.el.offsetHeight}px`;
      drag.el.before(drag.ph);

      try {
        drag.el.setPointerCapture(e.pointerId); // capture only when actual drag starts
      } catch {}

      drag.el.classList.add('is-dragging'); // z-index:20; transition:none; cursor:grabbing
      drag.el.dataset.noclick = '1';
      drag.el.style.width = `${drag.el.offsetWidth}px`;
      drag.el.style.height = `${drag.el.offsetHeight}px`;
      drag.el.style.left = `${drag.ox}px`;
      drag.el.style.top = `${drag.oy}px`;
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const rot = reduceMotion ? 0 : Math.max(-4, Math.min(4, dx / 40));
    drag.el.style.transform = `translate(${dx}px,${dy}px) rotate(${rot}deg)`;

    // Find sibling in the SAME zone only under pointer
    const sibs = [...drag.zone.querySelectorAll<HTMLElement>('.pb-tile:not(.is-dragging)')];
    const hit = sibs.find((s) => {
      const b = s.getBoundingClientRect();
      return e.clientX > b.left && e.clientX < b.right && e.clientY > b.top && e.clientY < b.bottom;
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
          const ddx = (a.left - b.left) / drag!.k;
          const ddy = (a.top - b.top) / drag!.k;
          if (!ddx && !ddy) return;
          s.animate([{ transform: `translate(${ddx}px,${ddy}px)` }, { transform: 'none' }], {
            duration: 180,
            easing: 'cubic-bezier(.22,1,.36,1)'
          });
        });
      }
    }
  });

  const end = (e: PointerEvent) => {
    if (!drag || e.pointerId !== drag.id) return;
    if (drag.started && drag.ph) {
      drag.ph.replaceWith(drag.el); // drop into the placeholder slot
      const ids = [...drag.zone.querySelectorAll<HTMLElement>('.pb-tile')].map((t) => t.dataset.id || '');
      const zoneId = drag.zone.dataset.zone || '';
      if (zoneId) {
        saveOrder(zoneId, ids);
      }
      setTimeout(() => {
        if (drag?.el) {
          delete drag.el.dataset.noclick;
        }
      }, 50);
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
