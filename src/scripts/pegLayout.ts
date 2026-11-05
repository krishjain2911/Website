import { getLayout, saveLayout, type Layout } from './pegBoardState';
import { ZONE_ORDER } from '../data/pegBoard';

const MQ = '(hover: hover) and (pointer: fine) and (min-width: 900px)';
const P = 32;
const HALF = 16;
const TW = 224;
const CORD = 22;
const LEFT = 3;
const RIGHT = 4;
const FH = 8;
const PLAQ_ROWS = 3; // footprint: cols c-3..c+4, rows r..r+7
type Rect = { x0: number; x1: number; y0: number; y1: number };
type Slot = [number, number];

export function initPegLayout(board: HTMLElement) {
  const canvas = board.querySelector<HTMLElement>('#pb-canvas')!;
  const flow = board.querySelector<HTMLElement>('.board-zones-container')!;
  const ghost = canvas.querySelector<HTMLElement>('#pb-ghost')!;
  const origin = canvas.querySelector<HTMLElement>('#pb-hole-origin')!;
  const mq = matchMedia(MQ);
  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  let free = false;
  let cols = 0;
  const tiles = new Map<string, HTMLElement>(); // id -> element
  const home = new Map<string, { parent: HTMLElement; next: Node | null }>();
  const pos = new Map<string, Slot>();
  const plaques = new Map<string, number>();
  let drag: null | {
    id: string;
    el: HTMLElement;
    pid: number;
    sx: number;
    sy: number;
    gx: number;
    gy: number;
    k: number;
    started: boolean;
    from: Slot;
    to: Slot;
    raf: number;
    ex: number;
    ey: number;
  } = null;

  const rectOf = (c: number, r: number): Rect => ({ x0: c - LEFT, x1: c + RIGHT, y0: r, y1: r + FH - 1 });
  const hit = (a: Rect, b: Rect) => a.x0 <= b.x1 && a.x1 >= b.x0 && a.y0 <= b.y1 && a.y1 >= b.y0;
  const plaqueRects = (): Rect[] =>
    [...plaques.values()].map((y) => ({ x0: 0, x1: cols - 1, y0: y, y1: y + PLAQ_ROWS - 1 }));

  function isFree(c: number, r: number, ignore?: string) {
    if (c - LEFT < 0 || c + RIGHT >= cols || r < 0) return false;
    const me = rectOf(c, r);
    for (const [id, s] of pos) if (id !== ignore && hit(me, rectOf(s[0], s[1]))) return false;
    return !plaqueRects().some((p) => hit(me, p));
  }

  function nearest(c: number, r: number, ignore?: string): Slot {
    // spiral outwards by Manhattan distance
    for (let d = 0; d < 200; d++) {
      for (let dy = -d; dy <= d; dy++) {
        const rem = d - Math.abs(dy);
        for (const dx of rem === 0 ? [0] : [-rem, rem]) {
          if (isFree(c + dx, r + dy, ignore)) return [c + dx, r + dy];
        }
      }
    }
    return [c, r];
  }

  // ---------- default arrangement (same order as the flow layout) ----------
  function seed(missingOnly: boolean) {
    const perRow = Math.max(1, Math.floor(cols / (LEFT + RIGHT + 1)));
    let row = 0;
    for (const z of ZONE_ORDER) {
      const ids = [...tiles.values()]
        .filter((t) => t.dataset.zoneId === z || t.dataset.zone === z)
        .map((t) => t.dataset.id!);
      if (!missingOnly || !plaques.has(z)) plaques.set(z, row);
      row = (plaques.get(z) ?? row) + PLAQ_ROWS + 1;
      ids.forEach((id, i) => {
        if (missingOnly && pos.has(id)) return;
        const want: Slot = [LEFT + (LEFT + RIGHT + 1) * (i % perRow), row + FH * Math.floor(i / perRow)];
        pos.set(id, missingOnly ? nearest(want[0], want[1], id) : want);
      });
      row += FH * Math.ceil(Math.max(ids.length, 1) / perRow) + 1;
    }
  }

  // ---------- paint ----------
  const xy = (s: Slot) => [P * s[0] + HALF - TW / 2, P * s[1] + HALF + CORD] as const;
  function paint() {
    let maxRow = 0;
    pos.forEach(([c, r], id) => {
      const el = tiles.get(id);
      if (!el) return;
      const [x, y] = xy([c, r]);
      el.style.setProperty('--x', `${x}px`);
      el.style.setProperty('--y', `${y}px`);
      maxRow = Math.max(maxRow, r + FH);
    });
    canvas.querySelectorAll<HTMLElement>('[data-plaque]').forEach((p) => {
      const y = plaques.get(p.dataset.plaque!) ?? 0;
      p.style.setProperty('--y', `${y * P}px`);
      maxRow = Math.max(maxRow, y + PLAQ_ROWS);
    });
    canvas.style.height = `${(maxRow + 6) * P}px`; // board always has room below
  }
  const persist = () => saveLayout({ tiles: Object.fromEntries(pos), plaques: Object.fromEntries(plaques) } as Layout);

  // ---------- enter / leave free mode ----------
  function measure() {
    cols = Math.floor(canvas.clientWidth / P);
  }
  function enter() {
    if (free) return;
    free = true;
    canvas.hidden = false;
    flow.hidden = true;
    board.dataset.mode = 'free';
    board.querySelectorAll<HTMLElement>('.pb-tile').forEach((el) => {
      const id = el.dataset.id!;
      tiles.set(id, el);
      home.set(id, { parent: el.parentElement!, next: el.nextSibling });
      canvas.appendChild(el); // keeps all listeners, pins, view-transition name
    });
    measure();
    const saved = getLayout();
    pos.clear();
    plaques.clear();
    if (saved) {
      Object.entries(saved.tiles).forEach(([id, s]) => tiles.has(id) && pos.set(id, s));
      Object.entries(saved.plaques).forEach(([z, y]) => plaques.set(z, y));
      seed(true); // add tiles that are new
      relayout(); // fix anything out of bounds
    } else {
      seed(false);
    }
    paint();
  }
  function leave() {
    if (!free) return;
    free = false;
    cancel();
    tiles.forEach((el, id) => {
      const h = home.get(id);
      if (h) {
        h.parent.insertBefore(el, h.next);
      }
      el.style.removeProperty('--x');
      el.style.removeProperty('--y');
    });
    canvas.hidden = true;
    flow.hidden = false;
    delete board.dataset.mode;
  }
  function relayout() {
    // after width change or reset
    pos.forEach(([c, r], id) => {
      if (!isFree(c, r, id)) pos.set(id, nearest(c, r, id));
    });
  }
  const apply = () => (mq.matches ? enter() : leave());
  mq.addEventListener('change', apply);
  new ResizeObserver(() => {
    if (!free) return;
    const old = cols;
    measure();
    if (cols !== old) {
      relayout();
      paint();
      persist();
    }
  }).observe(canvas);
  window.addEventListener('rhsp:pegboard:layout-reset', () => {
    if (!free) return;
    pos.clear();
    plaques.clear();
    seed(false);
    paint();
  });

  // ---------- drag ----------
  const toBoard = (e: { clientX: number; clientY: number }, k: number) => {
    const r = canvas.getBoundingClientRect();
    return [(e.clientX - r.left) / k, (e.clientY - r.top) / k] as const;
  };

  board.addEventListener('pointerdown', (e) => {
    if (!free || drag || e.button !== 0) return;
    const t = e.target as HTMLElement;
    const el = t.closest<HTMLElement>('.pb-tile');
    if (!el || t.closest('button,input,[data-nodrag],.tile-pin-btn')) return;
    const r = el.getBoundingClientRect();
    const k = r.width / el.offsetWidth || 1;
    const [bx, by] = toBoard(e, k);
    const id = el.dataset.id!;
    const from = pos.get(id);
    if (!from) return;
    const [x, y] = xy(from);
    drag = {
      id,
      el,
      pid: e.pointerId,
      sx: e.clientX,
      sy: e.clientY,
      gx: bx - x,
      gy: by - y,
      k,
      started: false,
      from,
      to: from,
      raf: 0,
      ex: e.clientX,
      ey: e.clientY
    };
  });

  board.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.pid) return;
    drag.ex = e.clientX;
    drag.ey = e.clientY;
    if (!drag.started) {
      if (Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) < 6 * drag.k) return;
      drag.started = true;
      try {
        drag.el.setPointerCapture(e.pointerId);
      } catch {}
      drag.el.classList.add('is-dragging');
      drag.el.dataset.noclick = '1';
      document.documentElement.classList.add('pb-is-dragging');
      const [ox, oy] = xy(drag.from); // mark the hole it left
      origin.hidden = false;
      origin.style.setProperty('--x', `${ox + TW / 2 - HALF}px`);
      origin.style.setProperty('--y', `${oy - CORD - HALF}px`);
      ghost.hidden = false;
    }
    if (!drag.raf) drag.raf = requestAnimationFrame(tick);
  });

  function tick() {
    if (!drag) return;
    drag.raf = 0;
    const [bx, by] = toBoard({ clientX: drag.ex, clientY: drag.ey }, drag.k);
    const x = bx - drag.gx;
    const y = by - drag.gy; // tile top-left in board px
    drag.el.style.setProperty('--x', `${x}px`);
    drag.el.style.setProperty('--y', `${y}px`);
    const rot = reduce() ? 0 : Math.max(-3, Math.min(3, (drag.ex - drag.sx) / drag.k / 60));
    drag.el.style.transform = `rotate(${rot}deg) scale(1.02)`;
    const c = Math.round((x + TW / 2 - HALF) / P);
    const r = Math.round((y - CORD - HALF) / P);
    drag.to = nearest(c, Math.max(0, r), drag.id); // where it WILL land
    const [gx, gy] = xy(drag.to);
    ghost.style.setProperty('--x', `${gx}px`);
    ghost.style.setProperty('--y', `${gy}px`);
    ghost.classList.toggle('is-nudged', drag.to[0] !== c || drag.to[1] !== r);
    const curH = parseFloat(canvas.style.height) || 0;
    canvas.style.height = `${Math.max(curH, (drag.to[1] + FH + 6) * P)}px`; // grow downwards

    // edge auto-scroll
    const vy = drag.ey / drag.k;
    const vh = window.innerHeight;
    if (vy < 90) {
      window.scrollBy(0, -14);
    } else if (vy > vh - 90) {
      window.scrollBy(0, 14);
    }
    if (vy < 90 || vy > vh - 90) {
      drag.raf = requestAnimationFrame(tick);
    }
  }

  const end = (e: PointerEvent) => {
    if (!drag || e.pointerId !== drag.pid) return;
    const d = drag;
    if (d.started) {
      pos.set(d.id, d.to);
      persist();
      setTimeout(() => delete d.el.dataset.noclick, 50);
    }
    cleanup();
    paint();
  };
  board.addEventListener('pointerup', end);
  board.addEventListener('pointercancel', end);
  window.addEventListener('keydown', (e) => e.key === 'Escape' && cancel());

  function cancel() {
    if (drag) {
      pos.set(drag.id, drag.from);
      cleanup();
      paint();
    }
  }

  function cleanup() {
    if (!drag) return;
    cancelAnimationFrame(drag.raf);
    drag.el.classList.remove('is-dragging');
    drag.el.style.transform = '';
    try {
      drag.el.releasePointerCapture(drag.pid);
    } catch {}
    ghost.hidden = true;
    origin.hidden = true;
    document.documentElement.classList.remove('pb-is-dragging');
    drag = null;
  }

  board.addEventListener(
    'click',
    (e) => {
      // swallow the click that ends a drag
      const t = (e.target as HTMLElement).closest<HTMLElement>('.pb-tile');
      if (t?.dataset.noclick) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    true
  );
  board.addEventListener('dragstart', (e) => e.preventDefault());

  // ---------- keyboard: Alt+arrows = 1 hole, Alt+Shift+arrows = 8 holes ----------
  board.addEventListener('keydown', (e) => {
    if (!free || !e.altKey || !/^Arrow(Left|Right|Up|Down)$/.test(e.key)) return;
    const el = (e.target as HTMLElement).closest<HTMLElement>('.pb-tile');
    if (!el) return;
    const id = el.dataset.id!;
    const curPos = pos.get(id);
    if (!curPos) return;
    const [c, r] = curPos;
    const s = e.shiftKey ? 8 : 1;
    const [nc, nr] = [
      c + (e.key === 'ArrowRight' ? s : e.key === 'ArrowLeft' ? -s : 0),
      r + (e.key === 'ArrowDown' ? s : e.key === 'ArrowUp' ? -s : 0)
    ];
    e.preventDefault();
    if (!isFree(nc, nr, id)) return;
    pos.set(id, [nc, nr]);
    paint();
    persist();
    const live = document.getElementById('search-live-status');
    if (live) {
      live.textContent = `Moved ${el.querySelector('.tile-title')?.textContent ?? id} to column ${nc + 1}, row ${nr + 1}.`;
    }
    el.focus();
  });

  // zone chips scroll to the zone label in either mode
  window.addEventListener('rhsp:pegboard:scroll-zone', ((ev: CustomEvent) => {
    const z = ev.detail?.zone as string;
    const target = free ? canvas.querySelector(`[data-plaque="${z}"]`) : flow.querySelector(`#zone-band-${z}`);
    target?.scrollIntoView({ block: 'start', behavior: reduce() ? 'auto' : 'smooth' });
  }) as EventListener);

  apply();
}
