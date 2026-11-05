import { ZONE_ORDER } from '../data/pegBoard';

const MQ = '(hover: hover) and (pointer: fine) and (min-width: 900px)';
const P = 32, HALF = 16, TW = 208, CORD = 22; // tile art 208 wide = 6.5 holes, leaves a 16px gap at stride 7
const LEFT = 3, RIGHT = 3, FH = 8, PLAQ_ROWS = 3; // footprint cols c-3..c+3 (7), rows r..r+7
type Slot = [number, number];
const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);

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

  let occ = new Uint8Array(0), occRows = 0;
  function buildOcc(ignore?: string) {
    let maxRow = 0;
    pos.forEach(([, r]) => (maxRow = Math.max(maxRow, r + FH)));
    occRows = maxRow + 80;
    occ = new Uint8Array(cols * occRows);
    const mark = (x0: number, x1: number, y0: number, y1: number) => {
      for (let y = Math.max(0, y0); y <= Math.min(occRows - 1, y1); y++)
        for (let x = Math.max(0, x0); x <= Math.min(cols - 1, x1); x++) occ[y * cols + x] = 1;
    };
    pos.forEach(([c, r], id) => {
      if (id !== ignore) mark(c - LEFT, c + RIGHT, r, r + FH - 1);
    });
    plaques.forEach((y) => mark(0, cols - 1, y, y + PLAQ_ROWS - 1));
  }

  function isFree(c: number, r: number): boolean {
    if (c - LEFT < 0 || c + RIGHT >= cols || r < 0) return false; // rows below the grid are always free
    for (let y = r; y <= Math.min(occRows - 1, r + FH - 1); y++)
      for (let x = c - LEFT; x <= c + RIGHT; x++) if (occ[y * cols + x]) return false;
    return true;
  }

  function nearest(c: number, r: number): Slot { // ring search, closest first, prefers same row
    if (isFree(c, r)) return [c, r];
    for (let d = 1; d <= 60; d++) {
      let best: Slot | null = null, bestCost = 1e9;
      for (let dy = -d; dy <= d; dy++) {
        const rem = d - Math.abs(dy);
        for (const dx of rem === 0 ? [0] : [-rem, rem]) {
          if (!isFree(c + dx, r + dy)) continue;
          const cost = dx * dx + dy * dy * 1.4; // slightly prefer sideways moves
          if (cost < bestCost) {
            bestCost = cost;
            best = [c + dx, r + dy];
          }
        }
      }
      if (best) return best;
    }
    return [c, r];
  }

  // ---------- default arrangement (same order as the flow layout) ----------
  function seed(missingOnly: boolean) {
    const perRow = Math.max(1, Math.floor(cols / 7));
    let row = 0;
    for (const z of ZONE_ORDER) {
      const ids = [...tiles.values()]
        .filter((t) => t.dataset.zoneId === z || t.dataset.zone === z)
        .map((t) => t.dataset.id!);
      if (!missingOnly || !plaques.has(z)) plaques.set(z, row);
      row = (plaques.get(z) ?? row) + PLAQ_ROWS + 1;
      ids.forEach((id, i) => {
        if (missingOnly && pos.has(id)) return;
        const want: Slot = [LEFT + 7 * (i % perRow), row + FH * Math.floor(i / perRow)];
        if (missingOnly) {
          buildOcc(id);
          pos.set(id, nearest(want[0], want[1]));
        } else {
          pos.set(id, want);
        }
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
      el.style.translate = ''; // Ensure individual style.translate does not mask --x/--y
      maxRow = Math.max(maxRow, r + FH);
    });
    canvas.querySelectorAll<HTMLElement>('[data-plaque]').forEach((p) => {
      const y = plaques.get(p.dataset.plaque!) ?? 0;
      p.style.setProperty('--y', `${y * P}px`);
      maxRow = Math.max(maxRow, y + PLAQ_ROWS);
    });
    canvas.style.height = `${(maxRow + 6) * P}px`; // board always has room below
  }

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
    pos.clear();
    plaques.clear();
    seed(false);
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
      el.style.translate = '';
    });
    canvas.hidden = true;
    flow.hidden = false;
    delete board.dataset.mode;
  }

  function relayout() {
    // after width change
    pos.forEach(([c, r], id) => {
      buildOcc(id);
      if (!isFree(c, r)) pos.set(id, nearest(c, r));
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
    canvasRect: DOMRect;
  } = null;
  let curH = 0;
  let lastC = NaN, lastR = NaN;

  board.addEventListener('pointerdown', (e) => {
    if (!free || drag || e.button !== 0) return;
    const t = e.target as HTMLElement;
    const el = t.closest<HTMLElement>('.pb-tile');
    if (!el || t.closest('button,input,[data-nodrag],.tile-pin-btn')) return;
    const r = el.getBoundingClientRect();
    const k = r.width / el.offsetWidth || 1;
    const canvasRect = canvas.getBoundingClientRect();
    const bx = (e.clientX - canvasRect.left) / k;
    const by = (e.clientY - canvasRect.top) / k;
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
      ey: e.clientY,
      canvasRect
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
      buildOcc(drag.id); // built once per drag
      curH = canvas.offsetHeight;
      lastC = NaN;
      lastR = NaN;
      const [ox, oy] = xy(drag.from); // mark the hole it left
      origin.hidden = false;
      origin.style.translate = `${ox + TW / 2 - HALF}px ${oy - CORD - HALF}px`;
      ghost.hidden = false;
    }
    if (!drag.raf) drag.raf = requestAnimationFrame(tick);
  });

  function tick() {
    if (!drag) return;
    drag.raf = 0;
    drag.canvasRect = canvas.getBoundingClientRect(); // read once per frame before any writes
    const cr = drag.canvasRect;
    const x = (drag.ex - cr.left) / drag.k - drag.gx;
    const y = (drag.ey - cr.top) / drag.k - drag.gy;
    drag.el.style.translate = `${x}px ${y}px`; // direct, no CSS variable lookup
    drag.el.style.transform = reduce()
      ? ''
      : `rotate(${clamp((drag.ex - drag.sx) / drag.k / 60, -3, 3)}deg) scale(1.02)`;
    const c = Math.round((x + TW / 2 - HALF) / P);
    const r = Math.max(0, Math.round((y - CORD - HALF) / P));
    if (c !== lastC || r !== lastR) {
      lastC = c;
      lastR = r;
      const cand = nearest(c, r);
      if (Math.abs(cand[0] - c) + Math.abs(cand[1] - r) <= 6) drag.to = cand;
      const [gx, gy] = xy(drag.to);
      ghost.style.translate = `${gx}px ${gy}px`;
      ghost.classList.toggle('is-nudged', drag.to[0] !== c || drag.to[1] !== r);
      const need = (drag.to[1] + FH + 6) * P;
      if (need > curH) {
        curH = need;
        canvas.style.height = `${need}px`;
      }
    }
    const vy = drag.ey / drag.k;
    if (vy < 90) window.scrollBy(0, -14);
    else if (vy > window.innerHeight - 90) window.scrollBy(0, 14);
    if (vy < 90 || vy > window.innerHeight - 90) {
      drag.raf = requestAnimationFrame(tick);
    }
  }

  const end = (e: PointerEvent) => {
    if (!drag || e.pointerId !== drag.pid) return;
    const d = drag;
    if (d.started) {
      pos.set(d.id, d.to);
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
    drag.el.style.translate = '';
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
    buildOcc(id);
    if (!isFree(nc, nr)) return;
    pos.set(id, [nc, nr]);
    paint();
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
    const plaque = target?.querySelector('.zone-plaque') ?? (target?.classList.contains('zone-plaque') ? target : null);
    if (plaque) {
      plaque.classList.add('is-highlighted');
      setTimeout(() => plaque.classList.remove('is-highlighted'), 1500);
    }
  }) as EventListener);

  apply();
}
