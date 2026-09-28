/*
 * automap.js — automapper for the generic text-adventure engine.
 *
 * Room positions are computed, not authored. The layout engine works on an
 * integer grid in three passes:
 *   1. rooms joined by bi-directional compass passages (N–S, E–W, NE–SW, …)
 *      are attached rigidly at their ideal offsets, forming tight clusters;
 *   2. rooms reachable only by one-way or non-compass passages are attached
 *      next to their placed neighbours;
 *   3. the whole graph relaxes toward a minimum-energy state — each room may
 *      move only between free grid cells, pulled by springs that prefer the
 *      compass-true offset of every passage.
 * The layout re-relaxes whenever a new room or passage is discovered. The
 * stored layout (localStorage) is a warm start: every previously placed room
 * is held near its old cell by a weak anchor spring, so the map stays
 * familiar — but compass springs pull harder than anchors, so movement is
 * always true to the map even when a new passage contradicts an old guess.
 * Re-layout drops the anchors and re-optimizes from scratch.
 *
 * Every connection is drawn port-to-port: a room box has a small port
 * rectangle on the side matching the direction of travel (N port on the
 * north side, and so on), and edges run between ports as orthogonal
 * polylines routed through the channels between grid cells, around the
 * room boxes — never through them.
 *
 * Explored view charts only passages actually walked (engine.state.exitsUsed);
 * the cheat view draws the full static map, and exportPdf() downloads that
 * full engine-laid-out map as a one-page PDF.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.AutoMap = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const OPPOSITES = {
    north: 'south', south: 'north',
    east: 'west', west: 'east',
    northeast: 'southwest', southwest: 'northeast',
    northwest: 'southeast', southeast: 'northwest',
    up: 'down', down: 'up',
    in: 'out', out: 'in'
  };

  /* Port geometry: [fx, fy] position on the box border (fractions of the
   * half-size), [sx, sy] outward stub direction. */
  const PORTS = {
    north: [0, -1, 0, -1],
    south: [0, 1, 0, 1],
    east: [1, 0, 1, 0],
    west: [-1, 0, -1, 0],
    northeast: [1, -1, 1, -1],
    northwest: [-1, -1, -1, -1],
    southeast: [1, 1, 1, 1],
    southwest: [-1, 1, -1, 1],
    up: [0.6, -1, 0, -1],
    down: [0.6, 1, 0, 1],
    in: [1, 0.55, 1, 0],
    out: [-1, 0.55, -1, 0]
  };
  // rank when several directions join the same two rooms: compass wins
  const DIR_RANK = {
    north: 0, south: 0, east: 0, west: 0,
    northeast: 0, northwest: 0, southeast: 0, southwest: 0,
    up: 1, down: 1, in: 2, out: 2
  };
  const WARPS = new Set(['xyzzy', 'plugh', 'plover']);   // magic leaves no trail

  /* Ideal grid offset (unit cells) implied by each travel direction. Up/down
   * lean vertical; in/out lean toward their port sides (E/W). */
  const DIR_VEC = {
    north: [0, -1], south: [0, 1], east: [1, 0], west: [-1, 0],
    northeast: [1, -1], northwest: [-1, -1], southeast: [1, 1], southwest: [-1, 1],
    up: [0, -1], down: [0, 1], in: [1, 0], out: [-1, 0]
  };

  const LAYOUT_KEY = 'adventure.mapLayout.v3';

  function loadLayoutStore() {
    if (typeof window === 'undefined' || !window.localStorage) return {};
    try { return JSON.parse(window.localStorage.getItem(LAYOUT_KEY)) || {}; }
    catch (err) { return {}; }
  }

  function saveLayoutStore(store) {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try { window.localStorage.setItem(LAYOUT_KEY, JSON.stringify(store)); }
    catch (err) { /* storage full/blocked: layout just won't persist */ }
  }

  /* Spring energy of one passage. `vec` is the ideal offset from this room to
   * the other (null for directionless passages, which merely prefer to be
   * adjacent); `[dx, dy]` is the actual offset. Compass passages pay a steep
   * surcharge for pointing the wrong way, so north stays above south even
   * when the graph has to stretch. */
  function springCost(vec, w, dx, dy) {
    if (vec) {
      const ex = dx - vec[0], ey = dy - vec[1];
      let cost = w * (ex * ex + ey * ey);
      if (w >= 2) {
        if (vec[0] && dx * vec[0] < 0) cost += w * 4;
        if (vec[1] && dy * vec[1] < 0) cost += w * 4;
      }
      return cost;
    }
    const d = Math.max(Math.abs(dx), Math.abs(dy));
    return w * (d - 1) * (d - 1);
  }

  function portDir(dir) {
    if (dir === 'enter') return 'in';
    return PORTS[dir] ? dir : null;
  }

  function normalizeExit(s) {
    if (typeof s === 'string') return s;
    if (Array.isArray(s)) {
      for (const spec of s) {
        if (spec && typeof spec.to === 'string') return spec.to;
      }
      return null;
    }
    return s && (typeof s.to === 'string' ? s.to : null);
  }

  /* Direction of the nearest port for a room→room bearing (fallback for
   * word motions like CRAWL or BUILDING that have no compass meaning). */
  function angleDir(dx, dy) {
    const angle = Math.atan2(dy, dx);                    // screen coords: +y down
    const oct = Math.round(angle / (Math.PI / 4));
    switch ((oct + 8) % 8) {
      case 0: return 'east';
      case 1: return 'southeast';
      case 2: return 'south';
      case 3: return 'southwest';
      case 4: return 'west';
      case 5: return 'northwest';
      case 6: return 'north';
      default: return 'northeast';
    }
  }

  function segIntersectsRect(x1, y1, x2, y2, r) {
    // quick reject
    if (Math.max(x1, x2) < r.x || Math.min(x1, x2) > r.x + r.w ||
        Math.max(y1, y2) < r.y || Math.min(y1, y2) > r.y + r.h) return false;
    // endpoint inside
    const inside = (x, y) => x > r.x && x < r.x + r.w && y > r.y && y < r.y + r.h;
    if (inside(x1, y1) || inside(x2, y2)) return true;
    // segment vs each rect side
    const sides = [
      [r.x, r.y, r.x + r.w, r.y], [r.x, r.y + r.h, r.x + r.w, r.y + r.h],
      [r.x, r.y, r.x, r.y + r.h], [r.x + r.w, r.y, r.x + r.w, r.y + r.h]
    ];
    const cross = (ax, ay, bx, by, cx, cy) => (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
    for (const [ax, ay, bx, by] of sides) {
      const d1 = cross(x1, y1, x2, y2, ax, ay);
      const d2 = cross(x1, y1, x2, y2, bx, by);
      const d3 = cross(ax, ay, bx, by, x1, y1);
      const d4 = cross(ax, ay, bx, by, x2, y2);
      if (((d1 > 0) !== (d2 > 0)) && ((d3 > 0) !== (d4 > 0))) return true;
    }
    return false;
  }

  function hashLane(key) {
    let h = 0;
    for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) | 0;
    return ((h % 5) + 5) % 5 - 2;                        // -2..2
  }

  class AutoMap {
    constructor(engine, canvas) {
      this.engine = engine;
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.revealAll = false; // cheat mode: show the whole map
      this.zoom = 1;           // 1 = fit to frame
      this.panX = 0;           // css px offset from centered position
      this.panY = 0;
      this.store = loadLayoutStore();  // mode -> { roomId: [x, y] } locked cells
      this._layoutCache = null;
      this.bindPointerControls();
    }

    /* -------------------------------------------- view controls */
    zoomIn() { this.setZoom(this.zoom * 1.25); }
    zoomOut() { this.setZoom(this.zoom / 1.25); }
    setZoom(z) {
      this.zoom = Math.min(4, Math.max(0.4, z));
      this.draw();
    }
    centerView() {
      this.zoom = 1;
      this.panX = 0;
      this.panY = 0;
      this.draw();
    }

    bindPointerControls() {
      const canvas = this.canvas;
      let dragging = false, lastX = 0, lastY = 0;
      canvas.addEventListener('pointerdown', e => {
        dragging = true; lastX = e.clientX; lastY = e.clientY;
        canvas.setPointerCapture(e.pointerId);
        canvas.style.cursor = 'grabbing';
      });
      canvas.addEventListener('pointermove', e => {
        if (!dragging) return;
        this.panX += e.clientX - lastX;
        this.panY += e.clientY - lastY;
        lastX = e.clientX; lastY = e.clientY;
        this.draw();
      });
      const stop = e => {
        dragging = false;
        canvas.style.cursor = 'grab';
        if (e.pointerId !== undefined && canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
      };
      canvas.addEventListener('pointerup', stop);
      canvas.addEventListener('pointercancel', stop);
      canvas.addEventListener('wheel', e => {
        e.preventDefault();
        this.setZoom(this.zoom * (e.deltaY < 0 ? 1.1 : 1 / 1.1));
      }, { passive: false });
      canvas.style.cursor = 'grab';
      canvas.style.touchAction = 'none';
    }

    /* Rooms to show: everything in cheat mode, else only visited rooms. */
    visibleRooms() {
      const g = this.engine.game;
      const st = this.engine.state;
      const all = Object.keys(g.rooms);
      if (this.revealAll) return all;
      return all.filter(id => st.visited[id]);
    }

    /* ---------------------------------------------- edge model */
    /* Collect one edge per connected room pair, remembering the best
     * (most compass-like) direction seen from each side. */
    collectEdges(visible) {
      const g = this.engine.game;
      const visSet = new Set(visible);
      const pairs = new Map();   // "a|b" (sorted) -> {a, b, ab, ba}

      const addDirected = (from, to, dir) => {
        if (from === to || !visSet.has(from) || !visSet.has(to) || WARPS.has(dir)) return;
        const [a, b] = from < to ? [from, to] : [to, from];
        const key = a + '|' + b;
        let entry = pairs.get(key);
        if (!entry) { entry = { a, b, ab: null, ba: null }; pairs.set(key, entry); }
        const slot = from === a ? 'ab' : 'ba';
        const cur = entry[slot];
        const rank = d => { const p = portDir(d); return p === null ? 3 : DIR_RANK[p]; };
        if (cur === null || rank(dir) < rank(cur)) entry[slot] = dir;
      };

      if (this.revealAll) {
        for (const id of visible) {
          const exits = g.rooms[id].exits || {};
          for (const dir in exits) {
            const to = normalizeExit(exits[dir]);
            if (to) addDirected(id, to, dir);
          }
        }
      } else {
        const used = this.engine.state.exitsUsed || {};
        for (const key in used) {
          const idx = key.lastIndexOf('>');
          if (idx > 0) addDirected(key.slice(0, idx), used[key], key.slice(idx + 1));
        }
      }
      return Array.from(pairs.values());
    }

    /* --------------------------------------------- layout engine */
    /* Classify each pair edge for the solver: ideal offset + spring weight.
     * Bi-directional compass passages are the strong, cluster-forming ties;
     * one-way compass passages pull half as hard; up/down and in/out give a
     * gentle nudge; anything else just wants adjacency. */
    classifyEdges(edges) {
      const compass = d => d !== null && DIR_RANK[d] === 0;
      return edges.map(e => {
        let pa = portDir(e.ab);
        let pb = portDir(e.ba);
        // word motions (DOWNSTREAM, CRAWL, …) have no port: fall back to the
        // best compass direction the static travel table knows for this pair
        if (pa === null) pa = portDir(this.staticReverse(e.b, e.a, pb && OPPOSITES[pb]));
        if (pb === null) pb = portDir(this.staticReverse(e.a, e.b, pa && OPPOSITES[pa]));
        let vec = null, w = 1;
        if (compass(pa) && compass(pb) && OPPOSITES[pa] === pb) { vec = DIR_VEC[pa]; w = 4; }
        else if (compass(pa) && compass(pb)) { vec = null; w = 1.5; }  // bent passage: no direction wins, stay adjacent
        else if (compass(pa)) { vec = DIR_VEC[pa]; w = 2; }
        else if (compass(pb)) { vec = DIR_VEC[OPPOSITES[pb]]; w = 2; }
        else if (pa && DIR_VEC[pa]) { vec = DIR_VEC[pa]; w = 1.5; }
        else if (pb && DIR_VEC[pb]) { vec = DIR_VEC[OPPOSITES[pb]]; w = 1.5; }
        return { a: e.a, b: e.b, vec, w };
      });
    }

    /* Total spring energy of room `id` sitting at (x, y). */
    localEnergy(id, x, y, adj, pos) {
      let energy = 0;
      for (const n of adj[id] || []) {
        const p = pos[n.other];
        if (p) energy += springCost(n.vec, n.w, p[0] - x, p[1] - y);
      }
      return energy;
    }

    /* Place `visible` rooms on the unit grid. `seed` (the stored layout) is a
     * warm start: seeded rooms begin at their old cells and are held there by
     * a weak, saturating anchor spring — strong enough to keep the map
     * familiar, weak enough that any compass passage can overrule it. */
    solveLayout(visible, edges, seed) {
      const ids = visible.slice().sort();
      const pos = {};                 // id -> [x, y]
      const occupied = new Map();     // "x,y" -> id
      const anchors = {};             // id -> warm-start cell
      const put = (id, x, y) => { pos[id] = [x, y]; occupied.set(x + ',' + y, id); };
      const free = (x, y) => !occupied.has(x + ',' + y);

      for (const id of ids) {
        const p = seed && seed[id];
        if (!Array.isArray(p) || p.length !== 2 || !isFinite(p[0]) || !isFinite(p[1])) continue;
        if (!free(p[0], p[1])) continue;
        put(id, p[0], p[1]);
        anchors[id] = [p[0], p[1]];
      }

      const springs = this.classifyEdges(edges);
      const adj = {};                 // id -> [{other, vec: id->other, w}]
      for (const s of springs) {
        (adj[s.a] = adj[s.a] || []).push({ other: s.b, vec: s.vec, w: s.w });
        (adj[s.b] = adj[s.b] || []).push({ other: s.a, vec: s.vec ? [-s.vec[0], -s.vec[1]] : null, w: s.w });
      }

      const nearestFree = (x, y) => {
        if (free(x, y)) return [x, y];
        for (let r = 1; r < 40; r++) {
          let best = null, bestD = Infinity;
          for (let dy = -r; dy <= r; dy++) {
            for (let dx = -r; dx <= r; dx++) {
              if (Math.max(Math.abs(dx), Math.abs(dy)) !== r || !free(x + dx, y + dy)) continue;
              const d = dx * dx + dy * dy;
              if (d < bestD) { bestD = d; best = [x + dx, y + dy]; }
            }
          }
          if (best) return best;
        }
        return [x, y];
      };

      /* Pass 1+2: greedy attachment, strongest placed tie first, so rigid
       * bi-directional compass clusters assemble before loose passages. */
      const unplaced = new Set(ids.filter(id => !pos[id]));
      while (unplaced.size) {
        let pick = null, pickW = -1, anchor = null;
        for (const id of Array.from(unplaced).sort()) {
          for (const n of adj[id] || []) {
            if (!pos[n.other] || n.w <= pickW) continue;
            pick = id; pickW = n.w; anchor = n;
          }
        }
        if (!pick) {
          // seed a fresh component beside what exists (or at the origin)
          pick = Array.from(unplaced).sort()[0];
          let sx = 0, sy = 0;
          if (Object.keys(pos).length) {
            let maxX = -Infinity, minY = Infinity;
            for (const id in pos) { maxX = Math.max(maxX, pos[id][0]); minY = Math.min(minY, pos[id][1]); }
            sx = maxX + 2; sy = minY;
          }
          const [x, y] = nearestFree(sx, sy);
          put(pick, x, y);
        } else {
          const [ax, ay] = pos[anchor.other];
          const ideal = anchor.vec ? [ax - anchor.vec[0], ay - anchor.vec[1]] : [ax + 1, ay];
          let best = null, bestE = Infinity;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const cx = ideal[0] + dx, cy = ideal[1] + dy;
              if (!free(cx, cy)) continue;
              const e = this.localEnergy(pick, cx, cy, adj, pos);
              if (e < bestE - 1e-9) { bestE = e; best = [cx, cy]; }
            }
          }
          const [x, y] = best || nearestFree(ideal[0], ideal[1]);
          put(pick, x, y);
        }
        unplaced.delete(pick);
      }

      /* Pass 3: relax toward minimum energy. Each sweep offers every room its
       * neighbouring cells plus the ideal cell of each passage; a room moves
       * only onto a free cell that strictly lowers its energy. When the ideal
       * cell is taken, the two rooms may swap instead — that's what untangles
       * "right place, wrong occupant" deadlocks the greedy pass leaves. */
      const energyAt = (id, x, y) => {
        let e = this.localEnergy(id, x, y, adj, pos);
        const a = anchors[id];
        if (a) e += 0.4 * Math.min((x - a[0]) * (x - a[0]) + (y - a[1]) * (y - a[1]), 8);
        return e;
      };
      for (let iter = 0; iter < 120; iter++) {
        let moved = false;
        for (const id of ids) {
          const [cx, cy] = pos[id];
          const cur = energyAt(id, cx, cy);
          const cand = new Map();
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) cand.set((cx + dx) + ',' + (cy + dy), [cx + dx, cy + dy]);
          }
          for (const n of adj[id] || []) {
            if (!pos[n.other] || !n.vec) continue;
            const ix = pos[n.other][0] - n.vec[0], iy = pos[n.other][1] - n.vec[1];
            cand.set(ix + ',' + iy, [ix, iy]);
          }
          let best = null, bestE = cur - 1e-9;
          for (const [, [x, y]] of cand) {
            if ((x === cx && y === cy) || !free(x, y)) continue;
            const e = energyAt(id, x, y);
            if (e < bestE) { bestE = e; best = [x, y]; }
          }
          if (best) {
            occupied.delete(cx + ',' + cy);
            put(id, best[0], best[1]);
            moved = true;
          }
        }
        for (const id of ids) {
          for (const n of adj[id] || []) {
            if (!n.vec || !pos[n.other]) continue;
            const tx = pos[n.other][0] - n.vec[0], ty = pos[n.other][1] - n.vec[1];
            const otherId = occupied.get(tx + ',' + ty);
            if (!otherId || otherId === id) continue;
            const [ax, ay] = pos[id], [bx, by] = pos[otherId];
            const before = energyAt(id, ax, ay) + energyAt(otherId, bx, by);
            pos[id] = [bx, by]; pos[otherId] = [ax, ay];
            const after = energyAt(id, bx, by) + energyAt(otherId, ax, ay);
            if (after < before - 1e-9) {
              occupied.set(ax + ',' + ay, otherId);
              occupied.set(bx + ',' + by, id);
              moved = true;
            } else {
              pos[id] = [ax, ay]; pos[otherId] = [bx, by];
            }
          }
        }
        if (!moved) break;
      }
      return pos;
    }

    /* Grid positions + pair edges (also used by the test suite). Re-solves
     * whenever a room or passage appears — warm-started from the stored
     * layout — and returns positions scaled ×2 so routing channels stay open
     * between rooms. */
    layout() {
      const visible = this.visibleRooms();
      const edges = this.collectEdges(visible);
      const mode = this.revealAll ? 'full' : 'explored';
      const cacheKey = mode + ':' + visible.slice().sort().join(',') + '#'
        + edges.map(e => e.a + '>' + e.ab + '|' + e.ba + '<' + e.b).sort().join(';');
      if (!this._layoutCache || this._layoutCache.key !== cacheKey) {
        const seed = this.store[mode] || {};
        const unit = this.solveLayout(visible, edges, seed);
        this.store[mode] = Object.assign({}, seed, unit);
        saveLayoutStore(this.store);
        this._layoutCache = { key: cacheKey, unit };
      }
      const unit = this._layoutCache.unit;
      const pos = {};
      for (const id in unit) pos[id] = [unit[id][0] * 2, unit[id][1] * 2];
      return { pos, edges };
    }

    /* Forget the stored layout for the current view and re-optimize. */
    relayout() {
      const mode = this.revealAll ? 'full' : 'explored';
      this.store[mode] = {};
      this._layoutCache = null;
      saveLayoutStore(this.store);
      this.draw();
    }

    /* Static direction leading from `to` back to `from` (for arrival ports
     * on passages walked only one way). */
    staticReverse(from, to, preferred) {
      const exits = this.engine.game.rooms[to] && this.engine.game.rooms[to].exits;
      if (!exits) return null;
      if (preferred && exits[preferred] && normalizeExit(exits[preferred]) === from) return preferred;
      let best = null, bestRank = 4;
      for (const dir in exits) {
        if (WARPS.has(dir) || normalizeExit(exits[dir]) !== from) continue;
        const p = portDir(dir);
        const rank = p === null ? 3 : DIR_RANK[p];
        if (rank < bestRank) { best = dir; bestRank = rank; }
      }
      return best;
    }

    /* ------------------------------------------------ drawing */
    draw() {
      const { pos, edges } = this.layout();

      const ctx = this.ctx;
      const canvas = this.canvas;
      const dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
      const cssW = canvas.clientWidth || 600;
      const cssH = canvas.clientHeight || 420;
      canvas.width = cssW * dpr;
      canvas.height = cssH * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cssW, cssH);

      const b = this.bounds(pos);
      if (!b) return;
      const cols = b.maxX - b.minX + 1, rows = b.maxY - b.minY + 1;
      /* Zoom 1 has to genuinely fit the whole map in the frame, however big
       * it is. A floor here would push a large map (the full-map cheat view
       * of a 128-room cave) off the edges of the canvas, leaving the
       * viewport parked in an empty gap between clusters. Legibility comes
       * back through the zoom controls, and labels drop out on their own
       * once a room box is too small to hold one. */
      const fitCell = Math.min(110, Math.min((cssW - 40) / cols, (cssH - 40) / rows));
      const cell = Math.max(4, fitCell * this.zoom);
      this.renderScene(ctx, pos, edges, {
        cell,
        originX: (cssW - cols * cell) / 2 + cell / 2 + this.panX,
        originY: (cssH - rows * cell) / 2 + cell / 2 + this.panY,
        minX: b.minX,
        minY: b.minY,
        revealAll: this.revealAll
      });
    }

    /* Bounding box of the laid-out grid positions (null when empty). */
    bounds(pos) {
      const ids = Object.keys(pos);
      if (!ids.length) return null;
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      for (const id of ids) {
        minX = Math.min(minX, pos[id][0]); maxX = Math.max(maxX, pos[id][0]);
        minY = Math.min(minY, pos[id][1]); maxY = Math.max(maxY, pos[id][1]);
      }
      return { minX, maxX, minY, maxY };
    }

    /* Draw the map scene — passages, room boxes, ports, labels — into `ctx`
     * with the given view ({cell, originX, originY, minX, minY, revealAll}).
     * Shared by the live canvas and the PDF exporter. */
    renderScene(ctx, pos, edges, view) {
      const g = this.engine.game;
      const { cell, originX, originY, minX, minY, revealAll } = view;
      const ids = Object.keys(pos);
      const boxW = cell * 0.72, boxH = cell * 0.5;
      const center = id => [
        originX + (pos[id][0] - minX) * cell,
        originY + (pos[id][1] - minY) * cell
      ];

      // room obstacle rectangles (slightly inflated)
      const rects = {};
      for (const id of ids) {
        const [x, y] = center(id);
        rects[id] = { x: x - boxW / 2 - 2, y: y - boxH / 2 - 2, w: boxW + 4, h: boxH + 4 };
      }
      const rectList = Object.values(rects);
      const clearPath = pts => {
        for (let i = 0; i < pts.length - 1; i++) {
          for (const r of rectList) {
            if (segIntersectsRect(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], r)) return false;
          }
        }
        return true;
      };

      const portPoint = (id, dir) => {
        const [cx, cy] = center(id);
        const [fx, fy, sx, sy] = PORTS[dir];
        const px = cx + fx * boxW / 2;
        const py = cy + fy * boxH / 2;
        const len = Math.hypot(sx, sy) || 1;
        const stub = 5 + cell * 0.06;
        return {
          x: px, y: py, sx: sx / len, sy: sy / len, dir,
          ex: px + (sx / len) * stub, ey: py + (sy / len) * stub
        };
      };

      // channel coordinates: the open corridors between grid cells
      const chY = (id, side, lane) => center(id)[1] + side * cell / 2 + lane;
      const chX = (id, side, lane) => center(id)[0] + side * cell / 2 + lane;

      /* Build an orthogonal route between two ports, along the channels.
       * A diagonal "straight shot" is allowed only when it reads as a
       * deliberate line: facing ports, nearly aligned on the port axis. */
      const routeEdge = (fromId, toId, p1, p2, lane) => {
        const eps = Math.max(4, cell * 0.1);
        const corner1 = p1.sx !== 0 && p1.sy !== 0;
        const corner2 = p2.sx !== 0 && p2.sy !== 0;
        // 1. straight shot for facing ports
        if (OPPOSITES[p1.dir] === p2.dir) {
          let ok = false;
          const dx = p2.ex - p1.ex, dy = p2.ey - p1.ey;
          if (!corner1 && !corner2) {
            ok = (p1.sy !== 0 ? Math.abs(dx) <= eps : Math.abs(dy) <= eps) &&
              (dx * p1.sx + dy * p1.sy) > 0;
          } else if (corner1 && corner2) {
            // true 45° between diagonal neighbours only — never a long
            // oblique line across the map
            ok = Math.abs(dx * p1.sy - dy * p1.sx) <= eps &&
              (dx * p1.sx + dy * p1.sy) > 0 &&
              Math.max(Math.abs(dx), Math.abs(dy)) <= cell * 2.4;
          }
          if (ok && clearPath([[p1.ex, p1.ey], [p2.ex, p2.ey]])) {
            return [[p1.x, p1.y], [p1.ex, p1.ey], [p2.ex, p2.ey], [p2.x, p2.y]];
          }
        }
        // 2. single elbow — must leave p1 along its stub axis, outward, and
        //    enter p2 against its stub
        const elbows = [];
        if ((p1.sy !== 0 || corner1) && (p2.sx !== 0 || corner2)) elbows.push([p1.ex, p2.ey]);
        if ((p1.sx !== 0 || corner1) && (p2.sy !== 0 || corner2)) elbows.push([p2.ex, p1.ey]);
        for (const c of elbows) {
          const outward = (c[0] - p1.ex) * p1.sx + (c[1] - p1.ey) * p1.sy;
          const inward = (p2.ex - c[0]) * p2.sx + (p2.ey - c[1]) * p2.sy;
          if (outward < 0 || inward > 0) continue;
          const pts = [[p1.ex, p1.ey], c, [p2.ex, p2.ey]];
          if (clearPath(pts)) return [[p1.x, p1.y], ...pts, [p2.x, p2.y]];
        }
        // 3. channel route: exit into the channel beside each room, then
        //    connect the two channel points with at most one connector.
        const chanPoint = (id, p) => {
          if (p.sy !== 0 && p.sx !== 0) {          // corner port: cell corner
            return { x: chX(id, Math.sign(p.sx), lane), y: chY(id, Math.sign(p.sy), lane), kind: 'c' };
          }
          if (p.sy !== 0) return { x: p.ex, y: chY(id, Math.sign(p.sy), lane), kind: 'h' };
          return { x: chX(id, Math.sign(p.sx), lane), y: p.ey, kind: 'v' };
        };
        const w1 = chanPoint(fromId, p1);
        const w2 = chanPoint(toId, p2);
        const mid = [];
        const boundaryX = x => {
          const k = Math.round((x - originX) / cell - 0.5);
          return originX + (k + 0.5) * cell + lane;
        };
        const boundaryY = y => {
          const k = Math.round((y - originY) / cell - 0.5);
          return originY + (k + 0.5) * cell + lane;
        };
        const horiz1 = w1.kind !== 'v';
        const horiz2 = w2.kind !== 'v';
        if (horiz1 && !horiz2) mid.push([w2.x, w1.y]);
        else if (!horiz1 && horiz2) mid.push([w1.x, w2.y]);
        else if (horiz1 && horiz2 && Math.abs(w1.y - w2.y) > 1) {
          const xb = boundaryX((w1.x + w2.x) / 2);
          mid.push([xb, w1.y], [xb, w2.y]);
        } else if (!horiz1 && !horiz2 && Math.abs(w1.x - w2.x) > 1) {
          const yb = boundaryY((w1.y + w2.y) / 2);
          mid.push([w1.x, yb], [w2.x, yb]);
        }
        return [[p1.x, p1.y], [p1.ex, p1.ey], [w1.x, w1.y], ...mid, [w2.x, w2.y], [p2.ex, p2.ey], [p2.x, p2.y]];
      };

      /* ---- edges ---- */
      const portsUsed = {};                    // roomId -> Set of port dirs
      const usePort = (id, dir) => {
        (portsUsed[id] = portsUsed[id] || new Set()).add(dir);
      };

      ctx.strokeStyle = '#b7b3a8';
      ctx.lineWidth = 1.5;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      const longLinks = [];        // distant passages become connector marks
      for (const e of edges) {
        if (!pos[e.a] || !pos[e.b]) continue;
        const [ax, ay] = center(e.a);
        const [bx, by] = center(e.b);
        // resolve the departure port on each side
        let dA = portDir(e.ab);
        let dB = portDir(e.ba !== null ? e.ba : this.staticReverse(e.a, e.b, dA && OPPOSITES[dA]));
        if (!dA && dB) dA = OPPOSITES[dB];
        if (!dB && dA) dB = OPPOSITES[dA];
        if (!dA) dA = angleDir(bx - ax, by - ay);
        if (!dB) dB = angleDir(ax - bx, ay - by);
        const p1 = portPoint(e.a, dA);
        const p2 = portPoint(e.b, dB);
        usePort(e.a, dA);
        usePort(e.b, dB);
        // a passage spanning more than 2 room-steps is never routed as a
        // line — it gets a matched pair of lettered connector marks, the
        // way hand-drawn cave maps do it
        const gd = Math.max(Math.abs(pos[e.a][0] - pos[e.b][0]), Math.abs(pos[e.a][1] - pos[e.b][1]));
        if (gd > 4) { longLinks.push({ e, p1, p2 }); continue; }
        const lane = hashLane(e.a + '|' + e.b) * Math.min(4, cell * 0.03);
        const pts = routeEdge(e.a, e.b, p1, p2, lane);
        ctx.beginPath();
        ctx.moveTo(pts[0][0], pts[0][1]);
        for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
        ctx.stroke();
        // one-way passage: arrowhead pointing into the destination port
        if (e.ab === null || e.ba === null) {
          const p = e.ba === null ? p2 : p1;
          const nx = -p.sy, ny = p.sx;
          ctx.fillStyle = '#8a877d';
          ctx.beginPath();
          ctx.moveTo(p.x + p.sx, p.y + p.sy);
          ctx.lineTo(p.ex + nx * 3.2, p.ey + ny * 3.2);
          ctx.lineTo(p.ex - nx * 3.2, p.ey - ny * 3.2);
          ctx.closePath();
          ctx.fill();
        }
      }

      /* ---- connector marks for distant passages ---- */
      longLinks.sort((u, v) => (u.e.a + '|' + u.e.b).localeCompare(v.e.a + '|' + v.e.b));
      const alphaSeq = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const markSize = Math.max(7, cell * 0.16);
      ctx.font = '700 ' + Math.max(6, markSize * 0.72) + 'px "DM Mono", monospace';
      longLinks.forEach((l, i) => {
        const label = i < alphaSeq.length ? alphaSeq[i]
          : alphaSeq[Math.floor(i / alphaSeq.length) - 1] + alphaSeq[i % alphaSeq.length];
        for (const p of [l.p1, l.p2]) {
          const qx = p.ex + p.sx * 3, qy = p.ey + p.sy * 3;
          const nx = -p.sy, ny = p.sx;
          ctx.strokeStyle = '#b7b3a8';
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(qx, qy);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(qx + p.sx * markSize * 1.35, qy + p.sy * markSize * 1.35);
          ctx.lineTo(qx + nx * markSize * 0.7, qy + ny * markSize * 0.7);
          ctx.lineTo(qx - nx * markSize * 0.7, qy - ny * markSize * 0.7);
          ctx.closePath();
          ctx.fillStyle = '#f5f0df';
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#7b7c77';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(label, qx + p.sx * markSize * 0.4, qy + p.sy * markSize * 0.4);
        }
      });

      /* ---- room boxes ---- */
      const current = this.engine.state.room;
      const visitedMap = this.engine.state.visited;
      for (const id of ids) {
        const [x, y] = center(id);
        const room = g.rooms[id];
        const isCurrent = id === current;
        const unexplored = revealAll && !visitedMap[id];
        ctx.beginPath();
        this.roundRect(ctx, x - boxW / 2, y - boxH / 2, boxW, boxH, 6);
        ctx.globalAlpha = unexplored ? 0.45 : 1;
        ctx.fillStyle = isCurrent ? '#e85f35' : (room.dark ? '#3a3d3f' : '#f5f0df');
        ctx.fill();
        ctx.strokeStyle = isCurrent ? '#b94020' : '#101214';
        ctx.lineWidth = isCurrent ? 2 : 1;
        if (unexplored) ctx.setLineDash([3, 3]);
        ctx.stroke();
        ctx.setLineDash([]);

        /* ---- ports: small rectangles on the border, direction-true ---- */
        const ports = portsUsed[id];
        if (ports) {
          for (const dir of ports) {
            const p = portPoint(id, dir);
            const vertical = p.sy !== 0 && p.sx === 0;
            const pw = vertical ? 7 : 4.5;
            const ph = vertical ? 4.5 : 7;
            ctx.fillStyle = isCurrent ? '#b94020' : '#101214';
            ctx.fillRect(p.x - pw / 2, p.y - ph / 2, pw, ph);
            if (dir === 'up' || dir === 'down') {
              ctx.fillStyle = '#7b7c77';
              ctx.font = '8px "DM Mono", monospace';
              ctx.textAlign = 'center';
              ctx.textBaseline = dir === 'up' ? 'bottom' : 'top';
              ctx.fillText(dir === 'up' ? 'U' : 'D', p.ex + 5, p.ey);
            }
          }
        }

        /* label — only when the box is actually big enough to hold one */
        if (boxW > 26) {
          ctx.fillStyle = isCurrent ? '#fff' : (room.dark ? '#d8d5cd' : '#101214');
          ctx.font = '600 ' + Math.max(8, cell * 0.115) + 'px "Space Grotesk", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const label = (room.mapLabel || room.name);
          const short = label.length > 16 ? label.slice(0, 15) + '…' : label;
          ctx.fillText(short, x, y, boxW - 10);
        }
        ctx.globalAlpha = 1;
      }
    }

    /* ------------------------------------------------ PDF export */
    /* Export the complete map — every room and passage, exactly as laid out
     * by the layout engine (the cheat view) — as a downloadable one-page
     * PDF. Renders to an offscreen canvas at print detail, embeds the bitmap
     * as a JPEG in a hand-built PDF, and triggers the download. Works from
     * either view; returns false when no DOM is available or the map is
     * empty. */
    exportPdf(filename) {
      if (typeof document === 'undefined') return false;
      const prevReveal = this.revealAll;
      this.revealAll = true;
      const { pos, edges } = this.layout();
      this.revealAll = prevReveal;

      const b = this.bounds(pos);
      if (!b) return false;
      const cols = b.maxX - b.minX + 1, rows = b.maxY - b.minY + 1;
      const margin = 48, header = 72;
      // print-detail cells, capped so the bitmap stays a manageable size
      const cell = Math.max(40, Math.min(96, Math.floor(Math.min(
        (6800 - margin * 2) / cols,
        (6800 - margin * 2 - header) / rows))));
      const w = cols * cell + margin * 2;
      const h = rows * cell + margin * 2 + header;

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#f5f0df';                 // in-game map-frame ivory
      ctx.fillRect(0, 0, w, h);
      this.drawExportHeader(ctx, w, margin);
      this.renderScene(ctx, pos, edges, {
        cell,
        originX: margin + cell / 2,
        originY: margin + header + cell / 2,
        minX: b.minX,
        minY: b.minY,
        revealAll: true
      });

      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      const bin = atob(dataUrl.slice(dataUrl.indexOf(',') + 1));
      const jpeg = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) jpeg[i] = bin.charCodeAt(i);

      const blob = this.buildImagePdf(jpeg, w, h);
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename || 'adventure-full-map.pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(link.href), 4000);
      return true;
    }

    /* Title, subtitle, and legend across the top of the export canvas. */
    drawExportHeader(ctx, w, margin) {
      const meta = this.engine.game.meta || {};
      ctx.fillStyle = '#101214';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.font = '700 34px "Space Grotesk", sans-serif';
      ctx.fillText((meta.title || 'ADVENTURE') + ' — FULL MAP', margin, margin + 26);
      ctx.fillStyle = '#7b7c77';
      ctx.font = '15px "DM Mono", monospace';
      ctx.fillText('Complete cave map as laid out by the game engine · '
        + new Date().toLocaleDateString(), margin, margin + 52);

      const items = [
        { label: 'You are here', fill: '#e85f35', stroke: '#b94020' },
        { label: 'Dark room', fill: '#3a3d3f', stroke: '#101214' },
        { label: 'Surface / lit', fill: '#f5f0df', stroke: '#101214' },
        { label: 'Unexplored', fill: '#f5f0df', stroke: '#101214', dashed: true }
      ];
      ctx.font = '13px "DM Mono", monospace';
      const swatch = 16, gap = 7, itemGap = 22;
      let x = w - margin;
      for (let i = items.length - 1; i >= 0; i--) {
        const it = items[i];
        x -= ctx.measureText(it.label).width;
        ctx.fillStyle = '#101214';
        ctx.fillText(it.label, x, margin + 30);
        x -= gap + swatch;
        ctx.fillStyle = it.fill;
        ctx.strokeStyle = it.stroke;
        ctx.lineWidth = 1;
        ctx.globalAlpha = it.dashed ? 0.45 : 1;
        ctx.fillRect(x, margin + 18, swatch, 14);
        ctx.globalAlpha = 1;
        if (it.dashed) ctx.setLineDash([3, 3]);
        ctx.strokeRect(x, margin + 18, swatch, 14);
        ctx.setLineDash([]);
        x -= itemGap;
      }
    }

    /* Assemble a minimal single-page PDF embedding one JPEG (w×h px, placed
     * at 2 px per PDF point) and return it as a Blob. */
    buildImagePdf(jpeg, w, h) {
      const pageW = w / 2, pageH = h / 2;
      const enc = s => {
        const bytes = new Uint8Array(s.length);
        for (let i = 0; i < s.length; i++) bytes[i] = s.charCodeAt(i) & 0xff;
        return bytes;
      };
      const parts = [];
      const offsets = [];
      let filePos = 0;
      const push = bytes => { parts.push(bytes); filePos += bytes.length; };
      const obj = (num, body) => {
        offsets[num] = filePos;
        push(enc(num + ' 0 obj\n' + body + '\nendobj\n'));
      };

      push(enc('%PDF-1.4\n%ÆÓÄÿ\n'));
      obj(1, '<< /Type /Catalog /Pages 2 0 R >>');
      obj(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
      obj(3, '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + pageW + ' ' + pageH + '] '
        + '/Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>');
      offsets[4] = filePos;
      push(enc('4 0 obj\n<< /Type /XObject /Subtype /Image /Width ' + w + ' /Height ' + h
        + ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length '
        + jpeg.length + ' >>\nstream\n'));
      push(jpeg);
      push(enc('\nendstream\nendobj\n'));
      const content = 'q ' + pageW + ' 0 0 ' + pageH + ' 0 0 cm /Im0 Do Q';
      obj(5, '<< /Length ' + content.length + ' >>\nstream\n' + content + '\nendstream');

      const xrefPos = filePos;
      let tail = 'xref\n0 6\n0000000000 65535 f \n';
      for (let i = 1; i <= 5; i++) tail += String(offsets[i]).padStart(10, '0') + ' 00000 n \n';
      tail += 'trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n' + xrefPos + '\n%%EOF';
      push(enc(tail));
      return new Blob(parts, { type: 'application/pdf' });
    }

    roundRect(ctx, x, y, w, h, r) {
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }
  }

  return AutoMap;
});
