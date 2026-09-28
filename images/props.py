#!/usr/bin/env python3
"""props.py — the things that stand in the rooms of the iMBSE platform.

Every prop draws straight into a Scene's layers, takes its colours from the
scene palette, and puts its lit edges on the "rim" layer so the room's light
falls off across them consistently.
"""
import math

from kit import (W, H, CX, arc_pts, blob, lerp, lp, mid, opening, path,
                 wob, wp)


# ------------------------------------------------------------------ helpers
def _dark(s, pts, tone=None, op=1.0, layer="props"):
    p = s.pal
    tone = tone or (p.rock_near[0], p.ink)
    gid = s.lin([("0", tone[0], 1), ("1", tone[1], 1)])
    s.gfill(wp(pts, s.rng, 1.6, 16, True), gid, layer)
    if op < 1:
        s.fill(wp(pts, s.rng, 1.6, 16, True), p.ink, 1 - op, layer)


def _rim(s, pts, op=.8, sw=2.4, color=None, close=False):
    s.stroke(wp(pts, s.rng, 1.4, 14, close), color or s.pal.rim, sw, op, close,
             "rim")


def _shadow(s, cx, cy, rx, ry=None, op=.75):
    s.ellipse(cx, cy, rx, ry or rx * .22, "#000", op, "props", blur="soft3")


# =================================================================== lights
def prop_lamp(s, cx, cy, scale=1.0, lit=True):
    """The brass lantern, standing on the ground."""
    p = s.pal
    r = s.rng

    def T(x, y):
        return (cx + x * scale, cy + y * scale)

    _shadow(s, cx, cy + 4, 96 * scale, 22 * scale)
    body = [T(-42, -28), T(42, -28), T(38, -128), T(-38, -128)]
    base = [T(-58, 0), T(58, 0), T(46, -28), T(-46, -28)]
    cap = [T(-50, -128), T(50, -128), T(32, -162), T(-32, -162)]
    s.fill(wp(body, r, 1.4, 16, True), "#100d0a", 1, "props")
    if lit:
        s.screen('<ellipse cx="%.0f" cy="%.0f" rx="%.0f" ry="%.0f" '
                 'fill="url(#%s)" filter="url(#soft3)"/>'
                 % (T(0, -78)[0], T(0, -78)[1], 78 * scale, 92 * scale,
                    s.rad([("0", p.accent, .9), ("0.34", p.rim, .4),
                           ("1", p.rim, 0)])), .95)
        f = T(0, -82)
        s.add('<path d="M %.1f %.1f C %.1f %.1f %.1f %.1f %.1f %.1f C %.1f %.1f '
              '%.1f %.1f %.1f %.1f Z" fill="%s" opacity="0.95" '
              'filter="url(#soft4)"/>'
              % (f[0], f[1] + 30 * scale, f[0] - 16 * scale, f[1] + 12 * scale,
                 f[0] - 14 * scale, f[1] - 10 * scale, f[0], f[1] - 30 * scale,
                 f[0] + 14 * scale, f[1] - 10 * scale, f[0] + 16 * scale,
                 f[1] + 12 * scale, f[0], f[1] + 30 * scale, p.accent), "props")
    for pts in (base, cap):
        s.fill(wp(pts, r, 1.4, 16, True), "#0c0d0e", 1, "props")
        _rim(s, pts, .78, 2.6, p.accent, True)
    _rim(s, body, .85, 2.6, p.accent, True)
    for x in (-21, 0, 21):
        s.stroke(wob(T(x, -30), T(x, -126), r, 1.2, 30), "#0a0a0b", 5 * scale,
                 .95, False, "props")
        s.stroke(wob(T(x, -30), T(x, -126), r, 1.2, 30), p.accent, 1.8, .55,
                 False, "rim")
    h0, h1 = T(-48, -150), T(48, -150)
    s.add('<path d="M %.1f %.1f C %.1f %.1f %.1f %.1f %.1f %.1f" fill="none" '
          'stroke="#0a0a0b" stroke-width="%.1f" stroke-linecap="round"/>'
          % (h0[0], h0[1], h0[0], h0[1] - 72 * scale, h1[0], h1[1] - 72 * scale,
             h1[0], h1[1], 9 * scale), "props")
    s.add('<path d="M %.1f %.1f C %.1f %.1f %.1f %.1f %.1f %.1f" fill="none" '
          'stroke="%s" stroke-opacity="0.8" stroke-width="%.1f" '
          'stroke-linecap="round"/>'
          % (h0[0], h0[1], h0[0], h0[1] - 72 * scale, h1[0], h1[1] - 72 * scale,
             h1[0], h1[1], p.accent, 3.4 * scale), "rim")


def prop_torch(s, cx, cy, scale=1.0, on_pedestal=False):
    """A torch, burning."""
    p = s.pal
    r = s.rng
    shaft = [(cx - 9 * scale, cy), (cx + 9 * scale, cy),
             (cx + 6 * scale, cy - 96 * scale), (cx - 6 * scale, cy - 96 * scale)]
    s.fill(wp(shaft, r, 1.2, 14, True), "#0e0c0a", 1, "props")
    _rim(s, shaft, .7, 2.2, p.accent, True)
    fy = cy - 104 * scale
    s.screen('<ellipse cx="%.0f" cy="%.0f" rx="%.0f" ry="%.0f" fill="url(#%s)" '
             'filter="url(#soft)"/>'
             % (cx, fy, 190 * scale, 200 * scale,
                s.rad([("0", "#fff3d8", .95), ("0.3", p.accent, .5),
                       ("1", p.rim, 0)])), .95)
    for i, (rr, col, op) in enumerate(((34, p.rim, .9), (20, p.accent, .95),
                                       (10, "#fffaf0", 1))):
        rr *= scale
        s.add('<path d="M %.1f %.1f C %.1f %.1f %.1f %.1f %.1f %.1f C %.1f %.1f '
              '%.1f %.1f %.1f %.1f Z" fill="%s" opacity="%.2f" '
              'filter="url(#soft4)"/>'
              % (cx, fy + rr * .9, cx - rr, fy + rr * .1, cx - rr * .8,
                 fy - rr * 1.1, cx, fy - rr * 2.1, cx + rr * .8, fy - rr * 1.1,
                 cx + rr, fy + rr * .1, cx, fy + rr * .9, col, op), "props")


def prop_candles(s, cx, cy, scale=1.0):
    p = s.pal
    for i, dx in enumerate((-16, 16)):
        x = cx + dx * scale
        s.fill(wp([(x - 6 * scale, cy), (x + 6 * scale, cy),
                   (x + 5 * scale, cy - 44 * scale), (x - 5 * scale, cy - 44 * scale)],
                  s.rng, 1, 10, True), "#efe6cf", .85, "props")
        s.screen('<ellipse cx="%.0f" cy="%.0f" rx="%.0f" ry="%.0f" '
                 'fill="url(#%s)" filter="url(#soft3)"/>'
                 % (x, cy - 54 * scale, 44 * scale, 52 * scale,
                    s.rad([("0", "#fff0cf", .9), ("1", p.rim, 0)])), .9)
        s.ellipse(x, cy - 52 * scale, 4 * scale, 8 * scale, "#fff6e2", .95, "props")


# ================================================================ structures
def prop_stairs(s, x, y, half, steps=7, down=True, depth=140, rim_op=.6):
    """A stair running away from the viewer, up or down."""
    p = s.pal
    dirn = 1 if down else -1
    for i in range(steps):
        t0, t1 = i / steps, (i + 1) / steps
        hw0 = lerp(half, half * .58, t0)
        hw1 = lerp(half, half * .58, t1)
        y0 = y + dirn * depth * t0
        y1 = y + dirn * depth * t1
        q = [(x - hw0, y0), (x + hw0, y0), (x + hw1, y1), (x - hw1, y1)]
        _dark(s, q, (p.rock_near[0], p.ink), 1 - .08 * i)
        s.stroke(wp([(x - hw1, y1), (x + hw1, y1)], s.rng, 1.2, 20), p.rim,
                 2.2 - i * .12, rim_op * (1 - i / (steps + 2)), False, "rim")


def prop_ladder(s, x, y_top, y_bot, half=26, rungs=8, wooden=True):
    p = s.pal
    col = p.rim
    for dx in (-half, half):
        s.stroke(wob((x + dx, y_top), (x + dx * 1.25, y_bot), s.rng, 1.6, 30),
                 p.ink, 9, 1, False, "props")
        s.stroke(wob((x + dx, y_top), (x + dx * 1.25, y_bot), s.rng, 1.6, 30),
                 col, 2.4, .7, False, "rim")
    for i in range(rungs + 1):
        t = i / rungs
        y = lerp(y_top, y_bot, t)
        hw = half * lerp(1, 1.25, t)
        s.stroke(wob((x - hw, y), (x + hw, y), s.rng, 1.2, 18), p.ink, 7, 1,
                 False, "props")
        s.stroke(wob((x - hw, y), (x + hw, y), s.rng, 1.2, 18), col, 2.0, .6,
                 False, "rim")


def prop_railing(s, pts, height=70, posts=7, rope=False):
    """A wooden railing following a line of points."""
    p = s.pal
    tops = []
    for i in range(posts):
        t = i / (posts - 1)
        k = t * (len(pts) - 1)
        j = min(int(k), len(pts) - 2)
        base = lp(pts[j], pts[j + 1], k - j)
        top = (base[0], base[1] - height)
        tops.append(top)
        s.stroke(wob(base, top, s.rng, 1.4, 22), p.ink, 8, 1, False, "props")
        s.stroke(wob(base, top, s.rng, 1.4, 22), p.rim, 2.4, .55, False, "rim")
    if rope:
        rp = []
        for i in range(len(tops) - 1):
            rp += [tops[i], (mid(tops[i], tops[i + 1])[0],
                             mid(tops[i], tops[i + 1])[1] + 10)]
        rp.append(tops[-1])
    else:
        rp = tops
    s.stroke(wp(rp, s.rng, 1.4, 18), p.ink, 6, 1, False, "props")
    s.stroke(wp(rp, s.rng, 1.4, 18), p.rim, 2.2, .6, False, "rim")
    mids = [(t[0], t[1] + height * .45) for t in tops]
    s.stroke(wp(mids, s.rng, 1.4, 18), p.ink, 4.4, .9, False, "props")
    s.stroke(wp(mids, s.rng, 1.4, 18), p.rim, 1.5, .38, False, "rim")


def prop_bridge(s, near=(404, 902, 248), far=(529, 668, 124), planks=15):
    """A wooden foot bridge running away from the viewer."""
    p = s.pal
    nx, ny, nhw = near
    fx, fy, fhw = far
    nL, nR = (nx - nhw / 2, ny), (nx + nhw / 2, ny)
    fL, fR = (fx - fhw / 2, fy), (fx + fhw / 2, fy)
    deck = [nL, fL, fR, nR]
    dw = wp(deck, s.rng, 2, 22, True)
    s.add('<path d="%s" fill="#000" opacity="0.85" filter="url(#soft3)" '
          'transform="translate(0 14)"/>' % path(dw, True), "props")
    s.fill(wp([nL, nR, (nR[0] - 6, nR[1] + 22), (nL[0] + 6, nL[1] + 22)],
              s.rng, 1.6, 20, True), "#14140f", 1, "props")
    gid = s.lin([("0", "#c8c2a6", .95), ("1", "#7a7a68", .85)])
    s.gfill(dw, gid, "props")
    s.fill(dw, p.ink, .18, "props")
    for i in range(planks + 1):
        t = (i / planks) ** 1.55
        a, c = lp(nL, fL, t), lp(nR, fR, t)
        sag = 10 * math.sin(math.pi * t)
        s.stroke(wob((a[0], a[1] + sag), (c[0], c[1] + sag), s.rng, 1.6, 24),
                 "#2b2a22", max(1.2, 3 - t * 2), .42, False, "props")
    s.stroke(wp(deck[0:2], s.rng, 2, 22), "#fbf7e6", 2.2, .4, False, "rim")
    s.stroke(wp(deck[2:4], s.rng, 2, 22), "#fbf7e6", 2.2, .4, False, "rim")
    s.stroke(dw, "#0a0c0d", 2.2, .8, True, "props")
    for a, c in ((nL, fL), (nR, fR)):
        prop_railing(s, [a, c], height=96, posts=5, rope=True)


def prop_door(s, cx, cy, half=86, height=210, open_=False, gothic=False,
              boarded=False, hole=False):
    """A wooden door set in a wall."""
    p = s.pal
    frame = [(cx - half, cy), (cx - half, cy - height), (cx + half, cy - height),
             (cx + half, cy)]
    if open_:
        s.fill(wp(frame, s.rng, 1.6, 16, True), "#000", 1, "props")
        _rim(s, frame, .7, 2.6, None, True)
        return
    _dark(s, frame, ("#3b2c1c", "#120d08"))
    for i in range(5):
        x = lerp(cx - half + 8, cx + half - 8, i / 4)
        s.stroke(wob((x, cy - 6), (x, cy - height + 6), s.rng, 1.2, 26), p.ink,
                 2.2, .7, False, "props")
    _rim(s, frame, .68, 2.6, None, True)
    if gothic:
        for i, dy in enumerate((.32, .5, .68)):
            y = cy - height * dy
            s.stroke(wob((cx - half * .55, y), (cx + half * .55, y), s.rng, 3, 12),
                     p.accent, 1.6, .30, False, "rim")
    if boarded:
        for i, dy in enumerate((.28, .58, .84)):
            y = cy - height * dy
            q = [(cx - half * 1.15, y + 12), (cx + half * 1.15, y - 8),
                 (cx + half * 1.15, y + 20), (cx - half * 1.15, y + 40)]
            _dark(s, q, ("#4a3722", "#1a1108"))
            _rim(s, q[:2], .5, 2.2, None)
    if hole:
        hp = blob(cx + half * .1, cy - height * .55, half * .55, s.rng, squash=1.3)
        s.fill(wp(hp, s.rng, 3, 12, True), "#000", 1, "props")
        _rim(s, hp, .55, 2.4, None, True)


def prop_window(s, cx, cy, half=70, height=90, open_=False, boarded=False,
                daylight=False):
    p = s.pal
    q = [(cx - half, cy), (cx - half, cy - height), (cx + half, cy - height),
         (cx + half, cy)]
    if daylight:
        gid = s.lin([("0", "#fff6dd", .95), ("1", "#c8d8dc", .8)])
        s.gfill(wp(q, s.rng, 1.2, 14, True), gid, "props")
        s.screen('<ellipse cx="%.0f" cy="%.0f" rx="%.0f" ry="%.0f" '
                 'fill="url(#%s)" filter="url(#soft)"/>'
                 % (cx, cy - height / 2, half * 3, height * 2.4,
                    s.rad([("0", "#fff3d0", .55), ("1", "#fff3d0", 0)])), .8)
    else:
        s.fill(wp(q, s.rng, 1.2, 14, True), "#0a0d10", 1, "props")
    if boarded:
        for i in range(3):
            y = lerp(cy - height + 10, cy - 10, i / 2)
            b = [(cx - half - 10, y + 8), (cx + half + 10, y - 6),
                 (cx + half + 10, y + 14), (cx - half - 10, y + 28)]
            _dark(s, b, ("#4a3722", "#1a1108"))
            _rim(s, b[:2], .45, 2.0, None)
    _rim(s, q, .7, 2.6, None, True)
    s.stroke(wob((cx, cy), (cx, cy - height), s.rng, 1, 16), p.ink, 3, .8,
             False, "props")
    s.stroke(wob((cx - half, cy - height / 2), (cx + half, cy - height / 2),
                 s.rng, 1, 16), p.ink, 3, .8, False, "props")


def prop_grating(s, cx, cy, half=110, bars=6, above=True, light=True):
    """The grating — seen from below, with daylight coming through."""
    p = s.pal
    q = [(cx - half, cy + half * .34), (cx - half * .82, cy - half * .34),
         (cx + half * .82, cy - half * .34), (cx + half, cy + half * .34)]
    s.fill(wp(q, s.rng, 2, 14, True), "#0b0d0e", 1, "props")
    if light:
        s.screen('<ellipse cx="%.0f" cy="%.0f" rx="%.0f" ry="%.0f" '
                 'fill="url(#%s)" filter="url(#soft)"/>'
                 % (cx, cy, half * 2.2, half * 1.5,
                    s.rad([("0", "#e8f0e0", .8), ("1", "#cfe0e2", 0)])), .85)
        s.beam((cx, cy), (cx - half * 2.4, cy + 420), (cx + half * 2.4, cy + 420),
               "#dfe9dd", .28)
    for i in range(bars + 1):
        t = i / bars
        s.stroke(wob(lp(q[0], q[3], t), lp(q[1], q[2], t), s.rng, 1.2, 12),
                 "#05070a", 7, 1, False, "props")
        s.stroke(wob(lp(q[0], q[3], t), lp(q[1], q[2], t), s.rng, 1.2, 12),
                 p.accent, 2.0, .5, False, "rim")
    _rim(s, q, .6, 3.0, None, True)


def prop_chain(s, x, y_top, y_bot, links=14, r=11):
    p = s.pal
    for i in range(links):
        t = i / links
        y = lerp(y_top, y_bot, t)
        rr = r * lerp(.8, 1.1, t)
        s.add('<ellipse cx="%.1f" cy="%.1f" rx="%.1f" ry="%.1f" fill="none" '
              'stroke="%s" stroke-width="%.1f"/>'
              % (x + math.sin(i * 1.7) * 2, y, rr * (.5 if i % 2 else .85), rr,
                 p.ink, 6), "props")
        s.add('<ellipse cx="%.1f" cy="%.1f" rx="%.1f" ry="%.1f" fill="none" '
              'stroke="%s" stroke-opacity="0.55" stroke-width="2"/>'
              % (x + math.sin(i * 1.7) * 2, y, rr * (.5 if i % 2 else .85), rr,
                 p.rim), "rim")


def prop_basket(s, cx, cy, half=96, depth=54):
    p = s.pal
    q = [(cx - half, cy - depth), (cx + half, cy - depth),
         (cx + half * .8, cy + depth), (cx - half * .8, cy + depth)]
    _dark(s, q, ("#4a3a26", "#12100c"))
    _rim(s, q, .7, 2.6, None, True)
    for i in range(6):
        t = (i + 1) / 7
        s.stroke(wob(lp(q[0], q[3], t), lp(q[1], q[2], t), s.rng, 1.2, 16),
                 p.rim, 1.4, .3, False, "rim")
    s.ellipse(cx, cy - depth, half, half * .3, "#000", .9, "props")
    s.add('<ellipse cx="%.1f" cy="%.1f" rx="%.1f" ry="%.1f" fill="none" '
          'stroke="%s" stroke-opacity="0.6" stroke-width="2.4"/>'
          % (cx, cy - depth, half, half * .3, p.rim), "rim")


def prop_timbers(s, box, n=9):
    """Broken pit props strewn about."""
    p = s.pal
    x0, y0, x1, y1 = box
    for _ in range(n):
        cx = s.rng.uniform(x0, x1)
        cy = s.rng.uniform(y0, y1)
        L = s.rng.uniform(90, 250)
        a = s.rng.uniform(-.6, .6) + (0 if s.rng.random() < .7 else 1.4)
        th = s.rng.uniform(9, 20)
        dx, dy = math.cos(a) * L / 2, math.sin(a) * L / 2
        nx, ny = -math.sin(a) * th, math.cos(a) * th
        q = [(cx - dx + nx, cy - dy + ny), (cx + dx + nx, cy + dy + ny),
             (cx + dx - nx, cy + dy - ny), (cx - dx - nx, cy - dy - ny)]
        _dark(s, q, ("#443524", "#12100c"))
        _rim(s, q[:2], s.rng.uniform(.25, .6), 2.2, None)


def prop_machine(s, cx, cy, w=250, h=210):
    """A big machine: a lid, a switch, and rivets."""
    p = s.pal
    q = [(cx - w / 2, cy), (cx - w / 2 + 14, cy - h), (cx + w / 2 - 14, cy - h),
         (cx + w / 2, cy)]
    _dark(s, q, ("#3a3f44", "#0b0e11"))
    _rim(s, q, .75, 3.0, None, True)
    lid = [(cx - w / 2 + 16, cy - h), (cx + w / 2 - 16, cy - h),
           (cx + w / 2 - 26, cy - h - 34), (cx - w / 2 + 26, cy - h - 34)]
    _dark(s, lid, ("#4a5057", "#12161a"))
    _rim(s, lid, .8, 2.8, None, True)
    s.ellipse(cx, cy - h * .55, w * .22, w * .22, "#05070a", 1, "props")
    s.add('<circle cx="%.1f" cy="%.1f" r="%.1f" fill="none" stroke="%s" '
          'stroke-opacity="0.65" stroke-width="3"/>'
          % (cx, cy - h * .55, w * .22, p.rim), "rim")
    for i in range(10):
        a = 2 * math.pi * i / 10
        s.ellipse(cx + math.cos(a) * w * .30, cy - h * .55 + math.sin(a) * w * .30,
                  4, 4, p.rim, .5, "rim")
    sw = [(cx + w * .26, cy - h * .22), (cx + w * .38, cy - h * .22),
          (cx + w * .38, cy - h * .34), (cx + w * .26, cy - h * .34)]
    s.fill(wp(sw, s.rng, 1, 8, True), p.accent, .8, "props")
    _rim(s, sw, .9, 2.0, None, True)


def prop_panel(s, cx, cy, w=300, h=150, buttons=("#4f7fd0", "#d8c24a",
                                                 "#8a6a3a", "#c9483a")):
    """A control panel: the dam's bubble and bolt, or the four buttons."""
    p = s.pal
    q = [(cx - w / 2, cy), (cx - w / 2, cy - h), (cx + w / 2, cy - h),
         (cx + w / 2, cy)]
    _dark(s, q, ("#3a4048", "#0c1013"))
    _rim(s, q, .7, 2.8, None, True)
    n = len(buttons)
    for i, col in enumerate(buttons):
        bx = lerp(cx - w / 2 + w / (n + 1), cx + w / 2 - w / (n + 1), i / max(1, n - 1))
        s.ellipse(bx, cy - h * .5, w * .06, w * .06, col, .9, "props")
        s.add('<circle cx="%.1f" cy="%.1f" r="%.1f" fill="none" stroke="%s" '
              'stroke-opacity="0.8" stroke-width="2.4"/>'
              % (bx, cy - h * .5, w * .06, p.rim), "rim")
        s.screen('<circle cx="%.1f" cy="%.1f" r="%.1f" fill="%s" '
                 'filter="url(#soft3)"/>' % (bx, cy - h * .5, w * .08, col), .45)


def prop_pedestal(s, cx, cy, half=72, height=120):
    p = s.pal
    q = [(cx - half, cy), (cx - half * .72, cy - height),
         (cx + half * .72, cy - height), (cx + half, cy)]
    _dark(s, q, ("#6a6152", "#171410"))
    _rim(s, q, .8, 3.0, None, True)
    top = [(cx - half * .9, cy - height), (cx, cy - height - 20),
           (cx + half * .9, cy - height), (cx, cy - height + 18)]
    s.fill(wp(top, s.rng, 1.4, 12, True), "#8d8570", .8, "props")
    _rim(s, top, .85, 2.4, None, True)


def prop_altar(s, cx, cy, half=200, height=110):
    p = s.pal
    top = [(cx - half, cy - height), (cx + half, cy - height),
           (cx + half * .78, cy - height + 34), (cx - half * .78, cy - height + 34)]
    face = [(cx - half * .78, cy - height + 34), (cx + half * .78, cy - height + 34),
            (cx + half * .70, cy), (cx - half * .70, cy)]
    _dark(s, face, ("#5b5344", "#151310"))
    s.fill(wp(top, s.rng, 1.6, 16, True), "#8b8370", .9, "props")
    _rim(s, top, .9, 3.0, None, True)
    _rim(s, face[:2], .5, 2.4, None)
    for i in range(4):
        y = lerp(cy - height + 52, cy - 14, i / 3)
        s.stroke(wob((cx - half * .6, y), (cx + half * .6, y), s.rng, 2, 20),
                 p.rim, 1.4, .18, False, "rim")


def prop_gate(s, cx, cy, half=210, height=330, bars=9):
    """A barred gate in an arched opening."""
    p = s.pal
    arch = ([(cx - half, cy)] +
            arc_pts(cx, cy - height + half, half, half * 1.05, math.pi,
                    2 * math.pi, 20) + [(cx + half, cy)])
    s.fill(wp(arch, s.rng, 2.4, 16, True), "#000", 1, "props")
    for i in range(1, bars):
        t = i / bars
        x = lerp(cx - half * .9, cx + half * .9, t)
        ytop = cy - height + half - math.sqrt(max(0, 1 - ((x - cx) / (half * .92)) ** 2)) * half * 1.02
        s.stroke(wob((x, cy), (x, ytop), s.rng, 1.2, 26), "#05070a", 8, 1,
                 False, "props")
        s.stroke(wob((x, cy), (x, ytop), s.rng, 1.2, 26), p.rim, 2.2, .5,
                 False, "rim")
    _rim(s, arch, .8, 3.4, None, True)


def prop_mirror(s, cx, cy, half=250, height=380, reflect=None):
    """An enormous two-sided mirror."""
    p = s.pal
    q = [(cx - half, cy), (cx - half, cy - height), (cx + half, cy - height),
         (cx + half, cy)]
    gid = s.lin([("0", "#2a3138", 1), ("0.5", "#161b20", 1), ("1", "#0a0d10", 1)])
    s.gfill(wp(q, s.rng, 1.2, 20, True), gid, "props")
    # a dim double of the room, thrown back at the viewer
    s.screen('<ellipse cx="%.0f" cy="%.0f" rx="%.0f" ry="%.0f" fill="url(#%s)" '
             'filter="url(#soft)"/>'
             % (cx, cy - height * .55, half * .7, height * .34,
                s.rad([("0", p.accent, .5), ("1", p.rim, 0)])), .7)
    for i in range(5):
        y = cy - height * (.2 + i * .16)
        s.stroke(wob((cx - half * .8, y), (cx + half * .5, y - 26), s.rng, 2, 30),
                 "#9fb4c2", 1.6, .10 + .04 * i, False, "rim")
    _rim(s, q, .85, 3.4, None, True)


def prop_case(s, cx, cy, half=130, height=170, empty=True):
    """A glass-fronted case."""
    p = s.pal
    q = [(cx - half, cy), (cx - half, cy - height), (cx + half, cy - height),
         (cx + half, cy)]
    outer = [(cx - half - 16, cy + 14), (cx - half - 16, cy - height - 16),
             (cx + half + 16, cy - height - 16), (cx + half + 16, cy + 14)]
    _dark(s, outer, ("#6b5334", "#241a10"))
    _rim(s, outer, .55, 2.6, None, True)
    s.fill(wp(q, s.rng, 1.2, 16, True), "#161310", 1, "props")
    gid = s.lin([("0", "#c9d6dc", .22), ("0.45", "#5d6b72", .10),
                 ("1", "#12161a", .05)])
    s.gfill(wp(q, s.rng, 1.2, 16, True), gid, "props")
    s.stroke(wp([(cx - half + 10, cy - 12), (cx + half * .2, cy - height + 20)],
                s.rng, 1, 20), "#eaf1f5", 2.0, .22, False, "rim")
    for i in (1, 2):
        y = cy - height * i / 3
        s.stroke(wob((cx - half, y), (cx + half, y), s.rng, 1, 18), "#3a2c1c",
                 5, 1, False, "props")
        s.stroke(wob((cx - half, y), (cx + half, y), s.rng, 1, 18), p.rim, 1.8,
                 .5, False, "rim")
    s.stroke(wob((cx, cy), (cx, cy - height), s.rng, 1, 18), "#3a2c1c", 5, 1,
             False, "props")
    _rim(s, q, .8, 3.4, None, True)


def prop_table(s, cx, cy, half=210, height=96, top_tone=("#7a6141", "#3a2c1c")):
    p = s.pal
    top = [(cx - half, cy - height), (cx + half, cy - height),
           (cx + half * .84, cy - height + 30), (cx - half * .84, cy - height + 30)]
    _shadow(s, cx, cy + 6, half * .95, 22)
    s.fill(wp(top, s.rng, 1.4, 18, True), top_tone[0], .95, "props")
    _rim(s, top, .8, 2.6, None, True)
    for dx in (-half * .74, half * .74):
        leg = [(cx + dx - 12, cy - height + 26), (cx + dx + 12, cy - height + 26),
               (cx + dx + 10, cy), (cx + dx - 10, cy)]
        _dark(s, leg, (top_tone[1], p.ink))
        _rim(s, leg[:2], .4, 2.0, None)


def prop_rug(s, cx, cy, half=260, depth=110, pulled=False):
    p = s.pal
    q = [(cx - half, cy), (cx + half, cy), (cx + half * 1.24, cy + depth),
         (cx - half * 1.24, cy + depth)]
    if pulled:
        q = [(x + 120, y) for x, y in q]
    gid = s.lin([("0", "#6d2f2a", 1), ("1", "#2a1210", 1)])
    s.gfill(wp(q, s.rng, 2.4, 20, True), gid, "props")
    _rim(s, q, .5, 2.4, None, True)
    inner = [lp(q[0], mid(q[1], q[3]), .18), lp(q[1], mid(q[0], q[2]), .18),
             lp(q[2], mid(q[1], q[3]), .18), lp(q[3], mid(q[0], q[2]), .18)]
    s.stroke(wp(inner, s.rng, 2, 16, True), "#c9a06a", 1.8, .30, True, "rim")


def prop_chimney(s, cx, cy, half=70, height=260):
    p = s.pal
    q = [(cx - half, cy), (cx - half, cy - height), (cx + half, cy - height),
         (cx + half, cy)]
    s.fill(wp(q, s.rng, 2, 18, True), "#000", 1, "props")
    _rim(s, q, .55, 2.6, None, True)
    for i in range(6):
        y = lerp(cy - height + 20, cy - 20, i / 5)
        s.stroke(wob((cx - half + 8, y), (cx + half - 8, y + s.rng.uniform(-6, 6)),
                     s.rng, 2, 16), p.rim, 1.2, .16, False, "rim")


def prop_bones(s, box, n=16):
    """The remains of previous, less fortunate adventurers."""
    p = s.pal
    x0, y0, x1, y1 = box
    for _ in range(n):
        cx = s.rng.uniform(x0, x1)
        cy = s.rng.uniform(y0, y1)
        L = s.rng.uniform(30, 96)
        a = s.rng.uniform(0, math.pi)
        dx, dy = math.cos(a) * L / 2, math.sin(a) * L / 2 * .5
        s.stroke(wob((cx - dx, cy - dy), (cx + dx, cy + dy), s.rng, 1.6, 20),
                 p.ink, 9, 1, False, "props")
        s.stroke(wob((cx - dx, cy - dy), (cx + dx, cy + dy), s.rng, 1.6, 20),
                 "#cfd6cf", 3.0, s.rng.uniform(.25, .6), False, "rim")
        for sx in (-1, 1):
            s.ellipse(cx + dx * sx, cy + dy * sx, 6, 5, "#cfd6cf",
                      s.rng.uniform(.2, .5), "rim")
    for _ in range(3):
        cx = s.rng.uniform(x0, x1)
        cy = s.rng.uniform(y0, y1)
        s.ellipse(cx, cy, 22, 18, p.ink, 1, "props")
        s.add('<ellipse cx="%.1f" cy="%.1f" rx="22" ry="18" fill="none" '
              'stroke="#cfd6cf" stroke-opacity="0.5" stroke-width="2.4"/>'
              % (cx, cy), "rim")
        for ex in (-8, 8):
            s.ellipse(cx + ex, cy - 3, 5, 6, "#000", .9, "props")


def prop_coffin(s, cx, cy, half=170, height=70):
    p = s.pal
    top = [(cx - half, cy - height), (cx - half * .55, cy - height - 26),
           (cx + half * .8, cy - height - 12), (cx + half, cy - height + 16),
           (cx + half * .5, cy - height + 40), (cx - half * .8, cy - height + 30)]
    _shadow(s, cx, cy + 4, half, 22)
    gid = s.lin([("0", "#d9b45c", 1), ("1", "#6b5222", 1)])
    s.gfill(wp(top, s.rng, 2, 16, True), gid, "props")
    _rim(s, top, .9, 3.0, "#ffe9b0", True)
    for i in range(4):
        t = (i + 1) / 5
        s.stroke(wp([lp(top[0], top[5], t), lp(top[2], top[3], t)], s.rng, 2, 16),
                 "#ffe9b0", 1.4, .25, False, "rim")


def prop_boat(s, cx, cy, half=180):
    p = s.pal
    hull = [(cx - half, cy), (cx - half * .6, cy - 34), (cx + half * .6, cy - 34),
            (cx + half, cy), (cx + half * .55, cy + 26), (cx - half * .55, cy + 26)]
    _dark(s, hull, ("#4a4438", "#14120e"))
    _rim(s, hull, .7, 2.6, None, True)
    s.ellipse(cx, cy - 18, half * .62, 16, "#000", .85, "props")


# ================================================================== outdoors
def _crown_outline(cx, cy, rx, ry, rng, lobes=9):
    """One closed, bumpy outline for a tree crown — drawn as a single opaque
    silhouette so overlapping lobes never show as translucent seams."""
    pts = []
    for i in range(lobes * 3):
        a = math.pi * 2 * i / (lobes * 3)
        bump = 1 + .26 * math.sin(a * lobes + rng.uniform(0, 6.2))
        jit = rng.uniform(.88, 1.10)
        pts.append((cx + math.cos(a) * rx * bump * jit,
                    cy + math.sin(a) * ry * bump * jit))
    return pts


def prop_tree(s, cx, base_y, height=420, spread=180, bare=False, tone=None,
              rim_op=.16):
    """A tree in silhouette, opaque, with a lit edge on the light side."""
    p = s.pal
    r = s.rng
    col = tone or "#1e2a1e"
    tw = height * .035
    trunk = [(cx - tw, base_y), (cx - tw * .55, base_y - height * .62),
             (cx + tw * .55, base_y - height * .62), (cx + tw, base_y)]
    s.fill(wp(trunk, r, 2, 18, True), col, 1, "props")
    s.stroke(wp(trunk[1:3], r, 2, 18), p.rim, 2.0, rim_op, False, "rim")
    if bare:
        for i in range(9):
            a = -math.pi / 2 + r.uniform(-1.2, 1.2)
            L = height * r.uniform(.22, .48)
            x0, y0 = cx + r.uniform(-6, 6), base_y - height * r.uniform(.5, .75)
            e = (x0 + math.cos(a) * L, y0 + math.sin(a) * L)
            s.stroke(wob((x0, y0), e, r, 3, 20), col, 8, 1, False, "props")
            s.stroke(wob((x0, y0), e, r, 3, 20), p.rim, 1.6, rim_op * .8,
                      False, "rim")
        return
    cy = base_y - height * .70
    crown = _crown_outline(cx, cy, spread, spread * .78, r)
    s.fill(wp(crown, r, 4, 16, True), col, 1, "props")
    # a little internal massing so the crown is not one flat shape
    cid = s.clip(wp(crown, r, 4, 16, True))
    inner = "".join(
        '<path d="%s" fill="#000" fill-opacity="%.2f"/>'
        % (path(wp(blob(cx + r.uniform(-spread * .5, spread * .5),
                        cy + r.uniform(-spread * .1, spread * .5),
                        spread * r.uniform(.3, .55), r, squash=.8), r, 4, 12,
                   True), True), r.uniform(.10, .26))
        for _ in range(4))
    s.add('<g clip-path="url(#%s)">%s</g>' % (cid, inner), "props")
    lit = [q for q in crown if q[1] <= cy]
    if len(lit) > 2:
        s.stroke(wp(lit, r, 4, 16), p.rim, 2.2, rim_op, False, "rim")
    _shadow(s, cx, base_y + 2, spread * .6, spread * .12, .35)


def prop_forest_band(s, y, density=14, height=(200, 420), tone=None,
                     spread=150, rim_op=.16, bare=False):
    """A row of trees; drawn back-to-front so the nearer ones read in front."""
    xs = [-80 + (W + 160) * (i + s.rng.uniform(.15, .85)) / density
          for i in range(density)]
    order = sorted(range(density), key=lambda i: s.rng.random())
    for i in order:
        prop_tree(s, xs[i], y + s.rng.uniform(-16, 26), s.rng.uniform(*height),
                  spread * s.rng.uniform(.7, 1.2), tone=tone, rim_op=rim_op,
                  bare=bare)


def prop_house(s, cx, base_y, half=430, height=330, side="front", door=True,
               boarded=True, window=None):
    """A small brick building. side picks which face we are looking at."""
    p = s.pal
    r = s.rng
    wall = [(cx - half, base_y), (cx - half, base_y - height),
            (cx + half, base_y - height), (cx + half, base_y)]
    gid = s.lin([("0", "#e6e2d2", 1), ("1", "#8e8b7c", 1)])
    s.gfill(wp(wall, r, 2, 40, True), gid, "props")
    roof = [(cx - half - 34, base_y - height), (cx, base_y - height - 150),
            (cx + half + 34, base_y - height)]
    s.fill(wp(roof, r, 2.4, 30, True), "#3b3a33", 1, "props")
    _rim(s, roof[:2], .55, 3.0, None)
    s.stroke(wp(wall, r, 2, 40, True), "#2b2a24", 2.4, .55, True, "detail")
    for i in range(9):
        y = lerp(base_y - height + 14, base_y - 10, i / 8)
        s.stroke(wob((cx - half + 6, y), (cx + half - 6, y + r.uniform(-3, 3)),
                     r, 1.4, 40), "#a9a595", 1.4, .30, False, "detail")
    if door:
        prop_door(s, cx, base_y, 78, 190, boarded=boarded)
    if window:
        for wx, wopen in window:
            prop_window(s, cx + wx, base_y - height * .46, 62, 84,
                        open_=wopen, boarded=boarded and not wopen,
                        daylight=wopen)


def prop_mailbox(s, cx, base_y, scale=1.0):
    p = s.pal
    r = s.rng
    post = [(cx - 9 * scale, base_y), (cx + 9 * scale, base_y),
            (cx + 7 * scale, base_y - 96 * scale), (cx - 7 * scale, base_y - 96 * scale)]
    _shadow(s, cx, base_y + 4, 52 * scale, 14 * scale, .5)
    s.fill(wp(post, r, 1.2, 14, True), "#241d14", 1, "props")
    _rim(s, post[2:], .5, 2.0, None)
    y = base_y - 96 * scale
    box = ([(cx - 46 * scale, y)] +
           arc_pts(cx, y - 20 * scale, 46 * scale, 34 * scale, math.pi,
                   2 * math.pi, 12) + [(cx + 46 * scale, y)])
    gid = s.lin([("0", "#5d5a4e", 1), ("1", "#22201a", 1)])
    s.gfill(wp(box, r, 1.4, 12, True), gid, "props")
    _rim(s, box, .8, 2.6, None, True)
    s.stroke(wob((cx + 30 * scale, y - 6 * scale), (cx + 30 * scale, y - 44 * scale),
                 r, 1, 10), "#b04a2a", 3.4, .9, False, "props")


def prop_path(s, near=(CX, H + 40, 380), far=(CX, 600, 60), tone="#7d7a63"):
    """A worn track running away from the viewer."""
    p = s.pal
    nx, ny, nhw = near
    fx, fy, fhw = far
    q = [(nx - nhw, ny), (fx - fhw, fy), (fx + fhw, fy), (nx + nhw, ny)]
    gid = s.lin([("0", tone, .30), ("1", tone, .75)], user=(0, fy, 0, ny))
    s.gfill(wp(q, s.rng, 6, 40, True), gid, "geo")
    s.stroke(wp(q[:2], s.rng, 6, 40), p.rock_edge, 2.0, .30, False, "detail")
    s.stroke(wp(q[2:], s.rng, 6, 40), p.rock_edge, 2.0, .30, False, "detail")


def prop_cliffs(s, y_top=120, y_base=520, side="both", tone=None):
    """Pale cliff walls closing in from the sides."""
    p = s.pal
    tone = tone or ("#eae6d2", "#6b6759")
    for sgn in ((-1, 1) if side == "both" else ((-1,) if side == "left" else (1,))):
        base = CX + sgn * W * .22
        far = CX + sgn * W * .78
        pts = [(base + sgn * 30, y_base), (base, y_top - 40),
               (far, y_top - 200), (far, y_base + 220)]
        gid = s.lin([("0", tone[0], 1), ("1", tone[1], 1)], "0%", "0%", "100%", "0%")
        s.gfill(wp(pts, s.rng, 6, 40, True), gid, "geo")
        for i in range(7):
            t = (i + 1) / 8
            a = lp(pts[0], pts[3], t)
            b = lp(pts[1], pts[2], t)
            s.stroke(wob(a, b, s.rng, 5, 34), p.rock_edge, 1.6,
                     s.rng.uniform(.12, .3), False, "detail")
        s.stroke(wp(pts[1:3], s.rng, 6, 30), p.accent, 2.4, .3, False, "rim")


def prop_waterfall(s, cx, y_top, y_bot, half=150, mist=True):
    p = s.pal
    q = [(cx - half, y_top), (cx + half, y_top), (cx + half * 1.35, y_bot),
         (cx - half * 1.35, y_bot)]
    gid = s.lin([("0", "#dfeef5", .92), ("0.55", "#9fc0cf", .8),
                 ("1", "#6f8c9c", .7)])
    s.gfill(wp(q, s.rng, 3, 30, True), gid, "props")
    for i in range(16):
        t = (i + .5) / 16
        a = lp(q[0], q[1], t)
        b = lp(q[3], q[2], t)
        s.stroke(wob(a, b, s.rng, 5, 40), "#ffffff", s.rng.uniform(1.2, 3),
                 s.rng.uniform(.15, .5), False, "rim")
    if mist:
        s.screen('<ellipse cx="%.0f" cy="%.0f" rx="%.0f" ry="%.0f" '
                 'fill="url(#%s)" filter="url(#soft2)"/>'
                 % (cx, y_bot, half * 2.2, half * .9,
                    s.rad([("0", "#eaf6fb", .8), ("1", "#eaf6fb", 0)])), .8)


def prop_rainbow(s, cx, cy, rx, ry, width=54, op=.85, span=(math.pi, 2 * math.pi)):
    bands = ["#d9534f", "#e08b3c", "#ddc24a", "#5aa25c", "#4a7fc1",
             "#7a5aa8"]
    for i, col in enumerate(bands):
        rr = rx - i * width / len(bands)
        ryy = ry - i * width / len(bands) * (ry / max(rx, 1))
        pts = arc_pts(cx, cy, rr, ryy, span[0], span[1], 40)
        s.stroke(pts, col, width / len(bands) + 2, op * (.55 + .06 * i),
                 False, "props")
    s.screen('<path d="%s" fill="none" stroke="#ffffff" stroke-opacity="0.5" '
             'stroke-width="%.1f" filter="url(#soft)"/>'
             % (path(arc_pts(cx, cy, rx - width / 2, ry - width / 2,
                             span[0], span[1], 40)), width), .5)


def prop_slide(s, cx, y_top, y_bot, half=120):
    """The steep metal slide / ramp."""
    p = s.pal
    q = [(cx - half, y_bot), (cx - half * .45, y_top), (cx + half * .45, y_top),
         (cx + half, y_bot)]
    gid = s.lin([("0", "#2b3138", 1), ("1", "#0a0d10", 1)])
    s.gfill(wp(q, s.rng, 2, 22, True), gid, "props")
    for i in range(5):
        t = (i + 1) / 6
        s.stroke(wob(lp(q[0], q[1], t), lp(q[3], q[2], t), s.rng, 2, 24),
                 p.rim, 1.6, .18 + .06 * i, False, "rim")
    _rim(s, [q[1], q[0]], .6, 2.6, None)
    _rim(s, [q[2], q[3]], .6, 2.6, None)


def prop_engravings(s, box, n=7):
    """Old carvings scratched into a wall."""
    p = s.pal
    x0, y0, x1, y1 = box
    for _ in range(n):
        cx = s.rng.uniform(x0, x1)
        cy = s.rng.uniform(y0, y1)
        k = s.rng.randint(3, 6)
        pts = [(cx + s.rng.uniform(-46, 46), cy + s.rng.uniform(-34, 34))
               for _ in range(k)]
        s.stroke(wp(pts, s.rng, 2, 12), p.rim, 2.0, s.rng.uniform(.18, .45),
                 False, "rim")
        s.ellipse(cx, cy, s.rng.uniform(10, 26), s.rng.uniform(8, 20), "none",
                  0, "rim")


def prop_paint_splatter(s, box, n=60):
    """Spattered colour over a floor."""
    cols = ["#c14f3a", "#d8a13c", "#5f8f4a", "#3f6f9c", "#7a4f8f", "#c9c2a8",
            "#8a3f52", "#3f8f8a"]
    x0, y0, x1, y1 = box
    for _ in range(n):
        cx = s.rng.uniform(x0, x1)
        cy = s.rng.uniform(y0, y1)
        r = s.rng.uniform(6, 34)
        s.fill(wp(blob(cx, cy, r, s.rng, squash=.5), s.rng, 2, 10, True),
               s.rng.choice(cols), s.rng.uniform(.18, .55), "props")


def prop_sword(s, cx, cy, rot=0, scale=1.0):
    """A sword, lying on the ground."""
    p = s.pal
    r = s.rng
    g = ['<g transform="translate(%.1f %.1f) rotate(%.1f) scale(%.3f)">'
         % (cx, cy, rot, scale)]
    g.append('<ellipse cx="10" cy="18" rx="196" ry="20" fill="#000" '
             'opacity="0.8" filter="url(#soft3)"/>')
    blade = [(-46, -14), (100, -10), (172, -1), (100, 9), (-46, 13)]
    g.append('<path d="%s" fill="#101418"/>' % path(wp(blade, r, 1.2, 14, True), True))
    g.append('<path d="%s" fill="none" stroke="#cfe3ec" stroke-opacity="0.9" '
             'stroke-width="2.8" stroke-linecap="round"/>'
             % path(wp(blade[0:3], r, 1.2, 14)))
    g.append('<path d="%s" fill="none" stroke="%s" stroke-opacity="0.45" '
             'stroke-width="2.2" stroke-linecap="round"/>'
             % (path(wp(blade[2:5], r, 1.2, 14)), p.accent))
    guard = [(-62, -36), (-40, -17), (-40, 16), (-62, 35), (-74, 26), (-57, 0),
             (-74, -27)]
    g.append('<path d="%s" fill="#0d0f11" stroke="%s" stroke-opacity="0.7" '
             'stroke-width="2.4"/>' % (path(wp(guard, r, 1.2, 12, True), True),
                                       p.accent))
    grip = [(-62, -10), (-122, -9), (-122, 8), (-62, 9)]
    g.append('<path d="%s" fill="#0b0c0d" stroke="%s" stroke-opacity="0.55" '
             'stroke-width="2.2"/>' % (path(wp(grip, r, 1, 12, True), True),
                                       p.accent))
    g.append('<ellipse cx="-134" cy="0" rx="17" ry="16" fill="#0b0c0d" '
             'stroke="%s" stroke-opacity="0.75" stroke-width="2.6"/>' % p.accent)
    g.append("</g>")
    s.add("".join(g), "props")


def prop_treasure_glint(s, pts, color="#ffe9b0"):
    """Small sparkles for treasure lying about."""
    for (x, y) in pts:
        s.screen('<circle cx="%.0f" cy="%.0f" r="16" fill="%s" '
                 'filter="url(#soft3)"/>' % (x, y, color), .55)
        s.ellipse(x, y, 4, 4, "#fffaf0", .9, "rim")


def prop_megalith_door(s, cx, base_y, half=110, height=250, open_=True):
    """Two uprights and a lintel around a dark way in — a barrow mouth."""
    p = s.pal
    r = s.rng
    for sgn in (-1, 1):
        x = cx + sgn * (half + 46)
        q = [(x - 44, base_y), (x - 38, base_y - height),
             (x + 38, base_y - height - 12), (x + 44, base_y + 6)]
        _dark(s, q, ("#b3b09a", "#4c4a3f"))
        s.stroke(wp(q, r, 2.4, 20, True), "#22241f", 2.6, .6, True, "detail")
        _rim(s, [q[1], q[2]], .35, 2.4, None)
    lint = [(cx - half - 96, base_y - height), (cx + half + 96, base_y - height - 14),
            (cx + half + 90, base_y - height - 78), (cx - half - 90, base_y - height - 64)]
    _dark(s, lint, ("#c0bda6", "#55534६".replace("६", "6") if False else "#555349"))
    s.stroke(wp(lint, r, 2.4, 22, True), "#22241f", 2.8, .6, True, "detail")
    _rim(s, lint[:2], .40, 2.6, None)
    mouth = [(cx - half, base_y + 6), (cx - half + 6, base_y - height + 14),
             (cx + half - 6, base_y - height + 6), (cx + half, base_y + 6)]
    s.fill(wp(mouth, r, 2.6, 18, True), "#05060a", 1, "props")
    s.stroke(wp(mouth, r, 2.6, 18, True), "#000", 6, .7, True, "props")


# ============================================================ more props
def prop_hedge(s, y, height=180, tone=("#3f5a3a", "#16210f"), n=9):
    """A clipped hedge running across the frame — the formal garden."""
    pts = []
    x = -60
    while x < W + 80:
        pts.append((x, y - height + s.rng.uniform(-14, 14)))
        x += s.rng.uniform(50, 90)
    body = pts + [(W + 80, y + 40), (-60, y + 40)]
    gid = s.lin([("0", tone[0], 1), ("1", tone[1], 1)])
    s.gfill(wp(body, s.rng, 5, 20, True), gid, "props")
    s.stroke(wp(pts, s.rng, 5, 20), s.pal.rim, 2.2, .22, False, "rim")
    for _ in range(40):                       # a little leaf texture
        cx, cy = s.rng.uniform(-40, W + 40), s.rng.uniform(y - height, y)
        s.fill(wp(blob(cx, cy, s.rng.uniform(10, 26), s.rng, squash=.8), s.rng,
                  3, 10, True), "#000", s.rng.uniform(.06, .18), "props")


def prop_topiary(s, cx, base_y, height=280, shape="bird"):
    """A bush clipped into a fantastic shape."""
    p = s.pal
    r = s.rng
    trunk = [(cx - 14, base_y), (cx - 8, base_y - height * .35),
             (cx + 8, base_y - height * .35), (cx + 14, base_y)]
    s.fill(wp(trunk, r, 2, 14, True), "#16210f", 1, "props")
    parts = {"bird": [(0, .58, .30), (.22, .80, .16), (-.10, .90, .10)],
             "beast": [(0, .55, .34), (.30, .70, .18), (-.26, .68, .14)],
             "cone": [(0, .50, .30), (0, .74, .20), (0, .92, .11)]}[shape]
    for dx, dy, rr in parts:
        s.fill(wp(blob(cx + dx * height, base_y - dy * height, rr * height, r,
                       squash=.9), r, 4, 12, True), "#1e2f18", 1, "props")
    s.stroke(wp(blob(cx, base_y - height * .6, height * .32, r, squash=.9)[:5],
                r, 4, 12), p.rim, 2.0, .20, False, "rim")


def prop_tea_table(s, cx, cy, half=230):
    """The oblong table, set for tea by someone quite mad."""
    p = s.pal
    prop_table(s, cx, cy, half, 110, ("#8a7048", "#3a2c1c"))
    top = cy - 110
    for i, dx in enumerate((-.62, -.28, .06, .40, .72)):
        x = cx + dx * half
        h = 26 + (i % 3) * 10
        cup = [(x - 16, top), (x - 12, top - h), (x + 12, top - h), (x + 16, top)]
        s.fill(wp(cup, s.rng, 1, 8, True), "#e8e2cf", .85, "props")
        _rim(s, cup, .5, 1.8, None, True)
    s.fill(wp([(cx + half * .1, top), (cx + half * .1, top - 54),
               (cx + half * .34, top - 54), (cx + half * .34, top)],
              s.rng, 1, 8, True), "#d8cfae", .8, "props")


def prop_carousel(s, cx, cy):
    """Eight ways out, and the whole room turning."""
    p = s.pal
    for i in range(8):
        a = math.pi * (1.06 + .88 * i / 7)
        x, y = cx + math.cos(a) * 620, cy + math.sin(a) * 520
        s.fill(wp(blob(x, y + 60, 90, s.rng, squash=.9), s.rng, 4, 14, True),
               "#000", .92, "props")
        s.stroke(wp(blob(x, y + 60, 90, s.rng, squash=.9)[:5], s.rng, 4, 14),
                 p.rim, 2.2, .35, False, "rim")
    for i in range(26):                       # the spin, as smeared arcs
        rr = s.rng.uniform(180, 720)
        a0 = s.rng.uniform(math.pi, 2 * math.pi)
        a1 = a0 + s.rng.uniform(.3, 1.1)
        s.stroke(arc_pts(cx, cy, rr, rr * .55, a0, a1, 14), p.accent,
                 s.rng.uniform(1.2, 4), s.rng.uniform(.05, .22), False, "rim")


def prop_statue(s, cx, base_y, height=420, club=True):
    """One of the two stone guardians, club raised."""
    p = s.pal
    r = s.rng
    body = [(cx - height * .16, base_y), (cx - height * .13, base_y - height * .62),
            (cx - height * .09, base_y - height * .74),
            (cx + height * .09, base_y - height * .74),
            (cx + height * .13, base_y - height * .62),
            (cx + height * .16, base_y)]
    _dark(s, body, ("#8d8578", "#1e1c19"))
    _rim(s, body, .5, 3.0, None, True)
    hd = base_y - height * .84
    s.fill(wp(blob(cx, hd, height * .10, r, squash=1.05), r, 2, 10, True),
           "#7c7568", 1, "props")
    _rim(s, blob(cx, hd, height * .10, r, squash=1.05)[:5], .5, 2.4, None)
    if club:
        ax, ay = cx + height * .18, base_y - height * .70
        s.stroke(wob((cx + height * .12, base_y - height * .58), (ax, ay - height * .22),
                     r, 2, 20), "#6f6a5e", height * .055, 1, False, "props")
        s.fill(wp(blob(ax + height * .02, ay - height * .30, height * .09, r,
                       squash=1.1), r, 2, 10, True), "#6f6a5e", 1, "props")


def prop_pentagram(s, cx, cy, rr=300):
    """The great pentagram, drawn in black chalk."""
    p = s.pal
    pts = [(cx + math.cos(-math.pi / 2 + 2 * math.pi * i / 5) * rr,
            cy + math.sin(-math.pi / 2 + 2 * math.pi * i / 5) * rr * .42)
           for i in range(5)]
    star = [pts[(i * 2) % 5] for i in range(6)]
    s.stroke(wp(star, s.rng, 3, 18), "#0a0a0b", 12, .9, False, "props")
    s.stroke(wp(star, s.rng, 3, 18), p.rim, 3.0, .45, False, "rim")
    s.stroke(arc_pts(cx, cy, rr * 1.12, rr * .47, 0, 2 * math.pi, 40), "#0a0a0b",
             10, .85, False, "props")
    s.ellipse(cx, cy, rr * .26, rr * .11, "#000", 1, "props")
    s.add('<ellipse cx="%.1f" cy="%.1f" rx="%.1f" ry="%.1f" fill="none" '
          'stroke="%s" stroke-opacity="0.5" stroke-width="3"/>'
          % (cx, cy, rr * .26, rr * .11, p.rim), "rim")


def prop_aquarium(s, cx, cy, half=280, height=340):
    """A glass tank, lit from within, full of murk."""
    p = s.pal
    q = [(cx - half, cy), (cx - half, cy - height), (cx + half, cy - height),
         (cx + half, cy)]
    gid = s.lin([("0", "#2f5d63", .9), ("0.6", "#16343a", .95), ("1", "#0b1a1e", 1)])
    s.gfill(wp(q, s.rng, 1.4, 20, True), gid, "props")
    s.screen('<ellipse cx="%.0f" cy="%.0f" rx="%.0f" ry="%.0f" fill="url(#%s)" '
             'filter="url(#soft)"/>'
             % (cx, cy - height * .55, half * 1.2, height * .7,
                s.rad([("0", "#8fe3e0", .45), ("1", "#8fe3e0", 0)])), .8)
    for _ in range(18):
        s.fill(wp(blob(s.rng.uniform(cx - half, cx + half),
                       s.rng.uniform(cy - height, cy), s.rng.uniform(12, 40),
                       s.rng, squash=.7), s.rng, 3, 10, True), "#0c2226",
               s.rng.uniform(.2, .5), "props")
    _rim(s, q, .75, 3.4, None, True)


def prop_menhir(s, cx, base_y, height=560, lean=-.12):
    """An enormous standing stone, leaning where it fell."""
    p = s.pal
    dx = lean * height
    q = [(cx - 120, base_y), (cx - 96 + dx, base_y - height),
         (cx + 96 + dx, base_y - height * .96), (cx + 120, base_y + 10)]
    _dark(s, q, ("#8b8578", "#1d1b18"))
    s.stroke(wp(q, s.rng, 3, 22, True), "#0d0d0c", 3.0, .7, True, "detail")
    _rim(s, [q[0], q[1]], .55, 3.2, None)
    s.texture(q, "strata", 9, (.10, .26))


def prop_posts(s, cx, cy, half=320, height=260):
    """Four posts and a wooden roof — a structure in a room."""
    p = s.pal
    for dx, dy, sc in ((-1, 0, 1.0), (1, 0, 1.0), (-.55, -.34, .72),
                       (.55, -.34, .72)):
        x = cx + dx * half
        y = cy + dy * height
        h = height * sc
        q = [(x - 16 * sc, y), (x - 13 * sc, y - h), (x + 13 * sc, y - h),
             (x + 16 * sc, y)]
        _dark(s, q, ("#6b5334", "#1c150e"))
        _rim(s, q, .55, 2.4, None, True)
    roof = [(cx - half - 40, cy - height), (cx - half * .5, cy - height * 1.36),
            (cx + half * .5, cy - height * 1.36), (cx + half + 40, cy - height)]
    _dark(s, roof, ("#5b4830", "#181209"))
    _rim(s, roof[:3], .5, 2.8, None)


def prop_cage(s, cx, cy, half=200, height=320, inside=False):
    """A steel cage — from outside, or from within."""
    p = s.pal
    if inside:
        for i in range(9):
            x = lerp(-40, W + 40, i / 8)
            s.stroke(wob((x, -40), (x + (x - CX) * .18, H + 40), s.rng, 2, 40),
                     "#0a0c0e", 22, 1, False, "props")
            s.stroke(wob((x - 6, -40), (x - 6 + (x - CX) * .18, H + 40), s.rng, 2, 40),
                     p.rim, 3.0, .45, False, "rim")
        return
    q = [(cx - half, cy), (cx - half, cy - height), (cx + half, cy - height),
         (cx + half, cy)]
    s.fill(wp(q, s.rng, 1.4, 16, True), "#05070a", .9, "props")
    for i in range(9):
        x = lerp(cx - half, cx + half, i / 8)
        s.stroke(wob((x, cy), (x, cy - height), s.rng, 1.2, 24), "#0a0c0e", 9,
                 1, False, "props")
        s.stroke(wob((x, cy), (x, cy - height), s.rng, 1.2, 24), p.rim, 2.2,
                 .45, False, "rim")
    _rim(s, q, .7, 3.4, None, True)


def prop_aqueduct(s, y_base=620, arches=5, height=300):
    """A monumental aqueduct marching across the view on stone pillars."""
    p = s.pal
    span = (W + 160) / arches
    for i in range(arches):
        x = -80 + span * (i + .5)
        pier = [(x - span * .16, y_base), (x - span * .12, y_base - height),
                (x + span * .12, y_base - height), (x + span * .16, y_base)]
        _dark(s, pier, ("#9a9285", "#25231f"))
        _rim(s, pier, .4, 2.6, None, True)
        a = arc_pts(x + span * .5, y_base - height, span * .34, span * .30,
                    math.pi, 2 * math.pi, 16)
        s.stroke(a, "#25231f", 4, .5, False, "detail")
    top = [(-80, y_base - height), (W + 80, y_base - height - 14)]
    s.surface([(-80, y_base - height), (W + 80, y_base - height - 14),
               (W + 80, y_base - height - 90), (-80, y_base - height - 76)],
              ("#a9a194", "#3a3733"), 3, 44, layer="props")
    s.stroke(wp(top, s.rng, 2, 40), p.rim, 2.4, .4, False, "rim")


def prop_surf(s, y, rows=7, tone="#dfeef5"):
    """Heavy surf breaking on a shore."""
    for i in range(rows):
        t = (i + 1) / rows
        yy = y + t * t * 180
        pts = [(x, yy + 14 * math.sin(x / 90. + i) + s.rng.uniform(-6, 6))
               for x in range(-60, W + 100, 60)]
        s.stroke(wp(pts, s.rng, 4, 30), tone, lerp(2, 7, t),
                 lerp(.20, .55, t), False, "rim")
    s.screen('<rect x="-40" y="%.1f" width="%d" height="240" fill="url(#%s)"/>'
             % (y - 40, W + 80,
                s.lin([("0", "#eaf6fb", .45), ("1", "#eaf6fb", 0)])), .6)


def prop_beam(s, y, color="#ff4a3a", thick=5):
    """A narrow beam of light crossing a corridor, inches above the floor."""
    s.screen('<rect x="-40" y="%.1f" width="%d" height="%d" fill="%s" '
             'filter="url(#soft3)"/>' % (y - thick * 2, W + 80, thick * 4, color), .9)
    s.add('<rect x="-40" y="%.1f" width="%d" height="%.1f" fill="%s" '
          'opacity="0.95"/>' % (y, W + 80, thick, color), "rim")


def prop_sandstone(s, rows=3, cols=4, y0=430, y1=880):
    """A grid of great pushable blocks."""
    p = s.pal
    for r in range(rows):
        for c in range(cols):
            if (r + c) % 3 == 0:
                continue
            x = lerp(120, W - 120, (c + .5) / cols)
            y = lerp(y0, y1, (r + .5) / rows)
            hw, hh = (W - 240) / cols * .44, (y1 - y0) / rows * .44
            q = [(x - hw, y - hh), (x + hw, y - hh), (x + hw, y + hh),
                 (x - hw, y + hh)]
            _dark(s, q, ("#b09268", "#31261a"))
            _rim(s, q, .45, 2.6, None, True)
            s.texture(q, "strata", 4, (.10, .22))


def prop_shelves(s, x0, x1, y0, y1, rows=5, ransacked=True):
    """Shelving — a library, a workshop, a museum."""
    p = s.pal
    _dark(s, [(x0, y1), (x0, y0), (x1, y0), (x1, y1)], ("#4a3a26", "#14100b"))
    for i in range(rows + 1):
        y = lerp(y0, y1, i / rows)
        s.stroke(wob((x0, y), (x1, y), s.rng, 1.6, 26), "#2a2016", 8, 1,
                 False, "props")
        s.stroke(wob((x0, y), (x1, y), s.rng, 1.6, 26), p.rim, 2.0, .4,
                 False, "rim")
        if i < rows and not ransacked:
            for j in range(7):
                bx = lerp(x0 + 20, x1 - 20, (j + .5) / 7)
                bq = [(bx - 12, y), (bx - 12, y + (y1 - y0) / rows * .7),
                      (bx + 12, y + (y1 - y0) / rows * .7), (bx + 12, y)]
                s.fill(wp(bq, s.rng, 1, 8, True),
                       s.rng.choice(["#6b3b32", "#3b4a5c", "#4a5240"]), .8, "props")


def prop_crystals(s, box, n=14):
    """Crystal-encrusted formations, catching whatever light there is."""
    p = s.pal
    x0, y0, x1, y1 = box
    for _ in range(n):
        cx = s.rng.uniform(x0, x1)
        by = s.rng.uniform(y0, y1)
        h = s.rng.uniform(60, 260)
        w = h * s.rng.uniform(.12, .28)
        q = [(cx - w, by), (cx + s.rng.uniform(-w * .4, w * .4), by - h),
             (cx + w, by)]
        s.fill(wp(q, s.rng, 2, 14, True), "#16232a", 1, "props")
        s.stroke(wp(q[:2], s.rng, 2, 14), p.accent, 2.4,
                 s.rng.uniform(.25, .7), False, "rim")
        s.stroke(wp(q[1:], s.rng, 2, 14), p.rim, 1.8,
                 s.rng.uniform(.12, .35), False, "rim")
        s.screen('<ellipse cx="%.0f" cy="%.0f" rx="%.0f" ry="%.0f" '
                 'fill="url(#%s)" filter="url(#soft3)"/>'
                 % (cx, by - h, w * 2.4, h * .3,
                    s.rad([("0", p.accent, .5), ("1", p.rim, 0)])), .6)


def prop_runes(s, box, n=16):
    """Magical runes, carefully drawn."""
    p = s.pal
    x0, y0, x1, y1 = box
    for _ in range(n):
        cx, cy = s.rng.uniform(x0, x1), s.rng.uniform(y0, y1)
        r = s.rng.uniform(14, 34)
        k = s.rng.randint(3, 5)
        pts = [(cx + math.cos(2 * math.pi * i / k) * r,
                cy + math.sin(2 * math.pi * i / k) * r * .5) for i in range(k)]
        s.stroke(wp(pts, s.rng, 2, 10, True), p.accent, 2.0,
                 s.rng.uniform(.2, .5), True, "rim")


def prop_balloon(s, cx, cy, r=190):
    """A wicker basket and its cloth bag, hanging."""
    p = s.pal
    bag = blob(cx, cy - r * 1.15, r, s.rng, k=12, squash=1.15)
    gid = s.lin([("0", "#c9b08a", 1), ("1", "#5b4a34", 1)])
    s.gfill(wp(bag, s.rng, 4, 16, True), gid, "props")
    _rim(s, [q for q in bag if q[1] <= cy - r * 1.15], .6, 2.8, None)
    for dx in (-r * .5, r * .5):
        s.stroke(wob((cx + dx, cy - r * .35), (cx + dx * .5, cy + r * .12),
                     s.rng, 1.4, 16), "#2a2118", 4, 1, False, "props")
    prop_basket(s, cx, cy + r * .3, r * .5, r * .22)


def prop_pillar_arch(s, cx, y_base, half=250, height=520):
    """A tall arch — a gateway, a vaulted hall."""
    p = s.pal
    for sgn in (-1, 1):
        x = cx + sgn * half
        q = [(x - 40, y_base), (x - 32, y_base - height),
             (x + 32, y_base - height), (x + 40, y_base)]
        _dark(s, q, ("#9a9285", "#25231f"))
        _rim(s, q, .5, 2.8, None, True)
    a = arc_pts(cx, y_base - height, half + 40, half * .5, math.pi, 2 * math.pi, 20)
    s.surface(a + [(cx + half + 40, y_base - height - 90),
                   (cx - half - 40, y_base - height - 90)],
              ("#a49b8e", "#2c2926"), 3, 26, layer="props")
    s.stroke(a, p.rim, 2.6, .45, False, "rim")


# ===================================================== COLOSSAL CAVE props
def prop_snake(s, cx, base_y, scale=1.0, rearing=True):
    """The huge green fierce snake, coiled and barring the way."""
    p = s.pal
    r = s.rng
    coil = []
    for i in range(30):                        # one long body, doubled back
        t = i / 29
        coil.append((cx + math.sin(t * 6.6) * 210 * scale * (1 - .25 * t),
                     base_y - t * 60 * scale + math.cos(t * 5.1) * 22 * scale))
    s.stroke(wp(coil, r, 3, 18), "#0b1a10", 46 * scale, 1, False, "props")
    s.stroke(wp(coil, r, 3, 18), "#4f8f52", 30 * scale, .85, False, "props")
    s.stroke([(x, y - 11 * scale) for x, y in coil], "#8fd07a", 5 * scale, .45,
             False, "rim")
    for i in range(0, len(coil) - 2, 3):       # scales, as short cross ticks
        x, y = coil[i]
        s.stroke([(x - 12 * scale, y - 6 * scale), (x + 12 * scale, y + 6 * scale)],
                 "#12331c", 2.4, .5, False, "props")
    hx = cx - 190 * scale
    hy = base_y - (150 if rearing else 20) * scale
    neck = [(coil[0][0], coil[0][1]), (hx + 60 * scale, hy + 90 * scale), (hx, hy)]
    s.stroke(wp(neck, r, 2, 14), "#0b1a10", 40 * scale, 1, False, "props")
    s.stroke(wp(neck, r, 2, 14), "#4f8f52", 26 * scale, .9, False, "props")
    head = [(hx - 62 * scale, hy + 8 * scale), (hx - 20 * scale, hy - 22 * scale),
            (hx + 34 * scale, hy - 10 * scale), (hx + 30 * scale, hy + 26 * scale),
            (hx - 40 * scale, hy + 30 * scale)]
    s.fill(wp(head, r, 2, 12, True), "#12331c", 1, "props")
    _rim(s, head[:3], .7, 2.6, "#8fd07a")
    s.ellipse(hx - 18 * scale, hy - 2 * scale, 7 * scale, 9 * scale, "#ffd24a",
              .95, "rim")
    s.stroke([(hx - 62 * scale, hy + 16 * scale), (hx - 110 * scale, hy + 8 * scale),
              (hx - 96 * scale, hy + 26 * scale)], "#c9483a", 3.4, .8, False, "rim")


def prop_dragon(s, cx, base_y, scale=1.0):
    """The green dragon, sitting on a Persian rug, barring the way."""
    p = s.pal
    r = s.rng
    prop_rug(s, cx, base_y - 6 * scale, 300 * scale, 120 * scale)
    tail = [(cx + 300 * scale, base_y - 20 * scale),
            (cx + 150 * scale, base_y - 70 * scale),
            (cx + 30 * scale, base_y - 40 * scale)]
    s.stroke(wp(tail, r, 3, 16), "#0c1c10", 34 * scale, 1, False, "props")
    body = [(cx + 60 * scale, base_y - 10 * scale),
            (cx + 40 * scale, base_y - 150 * scale),
            (cx - 60 * scale, base_y - 190 * scale),
            (cx - 150 * scale, base_y - 140 * scale),
            (cx - 170 * scale, base_y - 10 * scale)]
    _dark(s, body, ("#3f7a41", "#0a1a0d"))
    _rim(s, body[1:4], .55, 3.0, "#8fd07a")
    wing = [(cx - 30 * scale, base_y - 170 * scale),
            (cx + 130 * scale, base_y - 330 * scale),
            (cx + 60 * scale, base_y - 250 * scale),
            (cx + 140 * scale, base_y - 240 * scale),
            (cx + 20 * scale, base_y - 150 * scale)]
    s.fill(wp(wing, r, 3, 14, True), "#14301a", 1, "props")
    _rim(s, wing[:3], .5, 2.4, "#8fd07a")
    hx, hy = cx - 230 * scale, base_y - 190 * scale
    head = [(hx - 90 * scale, hy + 20 * scale), (hx - 30 * scale, hy - 30 * scale),
            (hx + 60 * scale, hy - 16 * scale), (hx + 50 * scale, hy + 40 * scale),
            (hx - 60 * scale, hy + 48 * scale)]
    s.fill(wp(head, r, 2, 12, True), "#16331c", 1, "props")
    _rim(s, head[:3], .7, 2.8, "#8fd07a")
    s.ellipse(hx - 14 * scale, hy + 2 * scale, 9 * scale, 11 * scale, "#ffbe3a",
              .95, "rim")
    for i, dx in enumerate((-20, 10, 40)):     # spines along the back
        s.fill(wp([(cx + dx * scale - 16 * scale, base_y - 180 * scale),
                   (cx + dx * scale, base_y - 240 * scale),
                   (cx + dx * scale + 16 * scale, base_y - 176 * scale)],
                  r, 2, 8, True), "#0d2211", 1, "props")
    s.screen('<ellipse cx="%.0f" cy="%.0f" rx="%.0f" ry="%.0f" fill="url(#%s)" '
             'filter="url(#soft3)"/>'
             % (hx - 90 * scale, hy + 30 * scale, 90 * scale, 50 * scale,
                s.rad([("0", "#ff8a3a", .5), ("1", "#ff8a3a", 0)])), .7)


def prop_bear(s, cx, base_y, scale=1.0, chained=True):
    """The very docile bear, formerly ferocious, on a golden chain."""
    p = s.pal
    r = s.rng

    def S(v):
        return v * scale

    _shadow(s, cx, base_y + 8, S(230), S(32))
    for dx in (-130, -46, 58, 132):            # four short legs, under the bulk
        q = [(cx + S(dx) - S(36), base_y), (cx + S(dx) - S(30), base_y - S(92)),
             (cx + S(dx) + S(30), base_y - S(92)), (cx + S(dx) + S(36), base_y)]
        _dark(s, q, ("#4a3524", "#0d0906"))
        _rim(s, q[:2], .32, 2.2, None)
    body = blob(cx, base_y - S(185), S(200), r, k=11, squash=.62)
    gid = s.lin([("0", "#6f4f31", 1), ("1", "#180f08", 1)])
    s.gfill(wp(body, r, 5, 18, True), gid, "props")
    s.stroke(wp(body, r, 5, 18, True), "#090604", 3.2, .85, True, "props")
    _rim(s, [q for q in body if q[1] <= base_y - S(195)], .55, 3.4, None)
    hx, hy = cx - S(268), base_y - S(300)
    for dx in (-44, 44):                       # ears first, so the head laps them
        e = blob(hx + S(dx), hy - S(82), S(30), r, k=7)
        s.fill(wp(e, r, 2, 8, True), "#4a3524", 1, "props")
        _rim(s, e[:4], .4, 2.0, None)
    s.stroke(wob((hx + S(60), hy + S(60)), (cx - S(150), base_y - S(215)), r, 2, 16),
             "#4a3524", S(72), 1, False, "props")          # the neck
    head = blob(hx, hy, S(92), r, k=9, squash=.94)
    gid = s.lin([("0", "#7d5b3a", 1), ("1", "#2a1c11", 1)])
    s.gfill(wp(head, r, 3, 12, True), gid, "props")
    s.stroke(wp(head, r, 3, 12, True), "#0a0705", 2.6, .8, True, "props")
    _rim(s, head[:5], .75, 3.2, None)
    snout = blob(hx - S(74), hy + S(26), S(48), r, k=8, squash=.70)
    s.fill(wp(snout, r, 2, 10, True), "#6f4f31", 1, "props")
    _rim(s, snout[:4], .5, 2.4, None)
    s.ellipse(hx - S(112), hy + S(20), S(15), S(12), "#0a0705", 1, "props")
    s.ellipse(hx - S(26), hy - S(16), S(10), S(11), "#e8d9b0", .85, "rim")
    if chained:
        prop_chain(s, cx - S(330), base_y - S(330), base_y - S(30), 11, S(13))


def prop_vending(s, cx, base_y, w=280, h=430):
    """The massive vending machine, humming in a dead end."""
    p = s.pal
    q = [(cx - w / 2, base_y), (cx - w / 2 + 10, base_y - h),
         (cx + w / 2 - 10, base_y - h), (cx + w / 2, base_y)]
    _dark(s, q, ("#4a5057", "#0d1114"))
    _rim(s, q, .75, 3.2, None, True)
    glass = [(cx - w * .36, base_y - h * .30), (cx - w * .34, base_y - h * .86),
             (cx + w * .34, base_y - h * .86), (cx + w * .36, base_y - h * .30)]
    gid = s.lin([("0", "#2b4a52", .95), ("1", "#0b1416", 1)])
    s.gfill(wp(glass, s.rng, 1.4, 16, True), gid, "props")
    for i in range(3):                         # shelves of black rods
        y = lerp(base_y - h * .78, base_y - h * .38, i / 2)
        s.stroke(wob((cx - w * .32, y), (cx + w * .32, y), s.rng, 1.2, 18),
                 "#0a0d0f", 6, 1, False, "props")
        for j in range(4):
            bx = lerp(cx - w * .26, cx + w * .26, j / 3)
            s.stroke(wob((bx, y - 4), (bx, y - h * .11), s.rng, 1, 10), "#15181a",
                     9, 1, False, "props")
            s.ellipse(bx, y - h * .12, 5, 5, "#b06a3a", .8, "rim")
    _rim(s, glass, .55, 2.4, None, True)
    s.screen('<ellipse cx="%.0f" cy="%.0f" rx="%.0f" ry="%.0f" fill="url(#%s)" '
             'filter="url(#soft)"/>'
             % (cx, base_y - h * .58, w * .7, h * .45,
                s.rad([("0", "#9fd8e0", .40), ("1", "#9fd8e0", 0)])), .8)
    slot = [(cx - w * .16, base_y - h * .22), (cx - w * .16, base_y - h * .26),
            (cx + w * .16, base_y - h * .26), (cx + w * .16, base_y - h * .22)]
    s.fill(wp(slot, s.rng, 1, 8, True), "#05070a", 1, "props")
    _rim(s, slot, .8, 2.0, p.accent, True)
    s.ellipse(cx + w * .28, base_y - h * .20, 9, 9, p.accent, .85, "rim")


def prop_clam(s, cx, cy, half=190):
    """The giant clam, shut tight: two ribbed valves meeting on a dark line."""
    p = s.pal
    r = s.rng
    _shadow(s, cx, cy + 16, half * .96, half * .15)
    for sgn in (1, -1):                        # the lower valve, then the upper
        h = half * (.40 if sgn > 0 else .58)
        dx, dy = (0, 0) if sgn > 0 else (-26, -26)   # the upper shell overhangs
        lip = [(cx + dx + math.cos(math.pi * (1 - i / 20)) * half,
                cy + dy + sgn * math.sin(math.pi * (1 - i / 20)) * h)
               for i in range(21)]
        shell = [(cx + dx - half, cy + dy)] + lip + [(cx + dx + half, cy + dy)]
        gid = s.lin([("0", "#b9ae91", 1), ("1", "#332d24", 1)],
                    user=(0, cy - h, 0, cy + h))
        s.gfill(wp(shell, r, 2.4, 16, True), gid, "props")
        s.stroke(wp(shell, r, 2.4, 16, True), "#1b1813", 3.2, .8, True, "props")
        for i in range(13):                    # ribs radiating from the hinge
            a = math.pi * (1 - (i + .5) / 13)
            s.stroke(wob((cx + dx, cy + dy),
                         (cx + dx + math.cos(a) * half * .96,
                          cy + dy + sgn * math.sin(a) * h * .94), r, 2, 18),
                     "#332e24", 2.4, .55, False, "detail")
        if sgn < 0:
            s.stroke(wp(lip[3:18], r, 2.4, 16), p.rim, 3.0, .55, False, "rim")
    zig = [(cx - half - 13 * (1 - i / 12) - 13 * (i / 12) * 2,
            cy - 13 - 13 * (i % 2)) for i in range(13)]
    for i, (zx, zy) in enumerate(zig):
        zig[i] = (lerp(cx - half, cx + half - 26, i / 12), zy)
    gape = [(cx - half, cy)] + zig + [(cx + half, cy)]
    s.fill(wp(gape, r, 1.4, 12, True), "#07060a", .95, "props")
    s.stroke(wp(zig, r, 1.4, 12), p.rim, 2.8, .55, False, "rim")


def prop_beanstalks(s, box, n=9):
    """A nursery of young beanstalks, murmuring quietly."""
    p = s.pal
    x0, y0, x1, y1 = box
    for _ in range(n):
        bx = s.rng.uniform(x0, x1)
        by = s.rng.uniform(y0, y1)
        h = s.rng.uniform(90, 230)
        stem = [(bx, by), (bx + s.rng.uniform(-30, 30), by - h * .55),
                (bx + s.rng.uniform(-46, 46), by - h)]
        s.stroke(wp(stem, s.rng, 3, 14), "#22401f", 9, 1, False, "props")
        s.stroke(wp(stem, s.rng, 3, 14), "#7fc06a", 2.2, .45, False, "rim")
        for t in (.35, .62, .88):
            px, py = lp(stem[0], stem[2], t)
            leaf = blob(px + s.rng.uniform(-26, 26), py, s.rng.uniform(16, 32),
                        s.rng, k=7, squash=.55)
            s.fill(wp(leaf, s.rng, 2, 10, True), "#2c5426", .95, "props")
            s.stroke(wp(leaf[:4], s.rng, 2, 10), "#8fd07a", 1.6,
                     s.rng.uniform(.15, .4), False, "rim")


def prop_pillows(s, box, n=12, tone=("#5a2f6b", "#1d0f26")):
    """Velvet pillows, scattered about on the floor."""
    x0, y0, x1, y1 = box
    for _ in range(n):
        cx = s.rng.uniform(x0, x1)
        cy = s.rng.uniform(y0, y1)
        rr = s.rng.uniform(34, 64)
        q = blob(cx, cy, rr, s.rng, k=8, squash=.52)
        gid = s.lin([("0", tone[0], 1), ("1", tone[1], 1)])
        s.gfill(wp(q, s.rng, 3, 12, True), gid, "props")
        s.stroke(wp(q[:5], s.rng, 3, 12), s.pal.rim, 1.8,
                 s.rng.uniform(.15, .4), False, "rim")


def prop_bottles(s, box, n=18):
    """A pile of bottles, all of them empty."""
    p = s.pal
    x0, y0, x1, y1 = box
    for _ in range(n):
        bx = s.rng.uniform(x0, x1)
        by = s.rng.uniform(y0, y1)
        h = s.rng.uniform(46, 86)
        w = h * .32
        q = [(bx - w, by), (bx - w, by - h * .6), (bx - w * .32, by - h * .78),
             (bx - w * .32, by - h), (bx + w * .32, by - h),
             (bx + w * .32, by - h * .78), (bx + w, by - h * .6), (bx + w, by)]
        s.fill(wp(q, s.rng, 1.4, 10, True), "#16241f", .92, "props")
        s.stroke(wp(q[:4], s.rng, 1.4, 10), "#9fd8c8", 2.0,
                 s.rng.uniform(.2, .55), False, "rim")


def prop_curtains(s, y_top, y_bot, folds=13, tone=("#5c2a2a", "#170a0a")):
    """Heavy curtains, hung the full height of a wall."""
    p = s.pal
    for i in range(folds):
        x0 = lerp(-40, W + 40, i / folds)
        x1 = lerp(-40, W + 40, (i + 1) / folds)
        q = [(x0, y_top), (x1, y_top), (x1 + s.rng.uniform(-14, 14), y_bot),
             (x0 + s.rng.uniform(-14, 14), y_bot)]
        gid = s.lin([("0", tone[0], 1), ("1", tone[1], 1)], "0%", "0%", "100%", "0%")
        s.gfill(wp(q, s.rng, 2.6, 30, True), gid, "props")
        s.stroke(wp([q[0], q[3]], s.rng, 2.6, 30), "#0a0505", 5, .7, False, "props")
        s.stroke(wp([(q[0][0] + 8, q[0][1]), (q[3][0] + 8, q[3][1])], s.rng, 2.6, 30),
                 p.rim, 2.0, s.rng.uniform(.10, .30), False, "rim")


def prop_geyser(s, cx, y_base, height=520, half=90):
    """A column of blistering steam, erupting continuously."""
    # stacked puffs widening as they rise — never a hard-edged column
    for i in range(8):
        t = (i + .5) / 8
        cy = y_base - height * t
        rr = half * lerp(.75, 2.2, t)
        s.ellipse(cx + s.rng.uniform(-half * .45, half * .45), cy, rr, rr * .8,
                  "#e6f2f6", lerp(.34, .09, t), "props", blur="soft")
    for _ in range(24):
        cy = s.rng.uniform(y_base - height, y_base)
        t = (y_base - cy) / max(1.0, height)
        rr = s.rng.uniform(20, 66) * (.6 + t)
        s.ellipse(cx + s.rng.uniform(-half * (.7 + t), half * (.7 + t)), cy, rr,
                  rr * .72, "#f2fbff", s.rng.uniform(.05, .20), "props",
                  blur="soft3")
    s.screen('<ellipse cx="%.0f" cy="%.0f" rx="%.0f" ry="%.0f" fill="url(#%s)" '
             'filter="url(#soft2)"/>'
             % (cx, y_base - height * .5, half * 3, height * .6,
                s.rad([("0", "#eaf6fb", .6), ("1", "#eaf6fb", 0)])), .7)


def prop_lava(s, y, rows=6, cx=None, half=None):
    """Molten rock, glowing from below."""
    cx = CX if cx is None else cx
    half = (W * .7) if half is None else half
    top = [(cx - half + i * (2 * half / 9), y + s.rng.uniform(-26, 26))
           for i in range(10)]
    body = [(cx - half, y + 240)] + top + [(cx + half, y + 240)]
    gid = s.lin([("0", "#fff0c0", 1), ("0.22", "#ff9a3a", 1),
                 ("0.6", "#e2451a", 1), ("1", "#5c1508", 1)],
                user=(0, y - 60, 0, y + 250))
    s.gfill(wp(body, s.rng, 7, 30, True), gid, "props")
    for i in range(rows):
        t = (i + 1) / (rows + 1)
        yy = lerp(y + 20, y + 210, t)
        s.stroke(wob((cx - half * .9, yy), (cx + half * .9, yy + s.rng.uniform(-14, 14)),
                     s.rng, 10, 30), "#fff3d0", s.rng.uniform(2, 6),
                 s.rng.uniform(.25, .7), False, "rim")
    for _ in range(14):                        # islands of cooled black crust
        bx = s.rng.uniform(cx - half * .9, cx + half * .9)
        by = s.rng.uniform(y + 30, y + 210)
        rr = s.rng.uniform(24, 90)
        crust = blob(bx, by, rr, s.rng, k=7, squash=.34)
        s.fill(wp(crust, s.rng, 3, 12, True), "#1c0a06", s.rng.uniform(.55, .9),
               "props")
        s.stroke(wp(crust[:4], s.rng, 3, 12), "#ffb45a", 2.0,
                 s.rng.uniform(.3, .7), False, "rim")
    s.screen('<ellipse cx="%.0f" cy="%.0f" rx="%.0f" ry="%.0f" fill="url(#%s)" '
             'filter="url(#soft2)"/>'
             % (cx, y + 60, half * 1.2, 300,
                s.rad([("0", "#ff9a3a", .8), ("1", "#ff5a1a", 0)])), .9)
    s.specks((cx - half, y - 300, cx + half, y + 160), 90, "#ffc46a", (1.4, 5),
             (.2, .8))


# ============================================== iMBSE — the cast and the kit
def prop_figure(s, cx, base_y, height=300, tone=("#3a4048", "#0c0f13"), rim_op=.5,
                pose="stand", face=None, layer="props"):
    """One person, in silhouette, with a lit edge. Everything human on this
    platform is built from this: the guide, the priest, the oracle, the pilot,
    the engineer at the mirror-glass and the thing in the Uncanny Valley."""
    p = s.pal
    r = s.rng
    H = height

    def T(x, y):
        return (cx + x * H / 300.0, base_y - y * H / 300.0)

    s.screen('<ellipse cx="%.0f" cy="%.0f" rx="%.0f" ry="%.0f" fill="url(#%s)" '
             'filter="url(#soft)"/>'
             % (cx, base_y - H * .45, H * .70, H * .62,
                s.rad([("0", p.rim, .30), ("1", p.rim, 0)])), .8)
    _shadow(s, cx, base_y + 4, H * .30, H * .055, .75)
    if pose == "kneel":
        legs = [T(-52, 0), T(-40, 74), T(46, 78), T(70, 0)]
    elif pose == "sit":
        legs = [T(-46, 0), T(-40, 96), T(74, 104), T(96, 90), T(88, 0)]
    else:
        legs = [T(-40, 0), T(-30, 130), T(30, 130), T(40, 0)]
    _dark(s, legs, tone, layer=layer)
    top = 214 if pose == "stand" else 168
    torso = [T(-46, top * .60), T(-34, top), T(34, top), T(46, top * .60),
             T(38, legs[1][1] and 120 or 120), T(-38, 120)]
    torso = [T(-48, 118), T(-40, top - 20), T(-24, top), T(24, top),
             T(40, top - 20), T(48, 118)]
    gid = s.lin([("0", tone[0], 1), ("1", tone[1], 1)])
    s.gfill(wp(torso, r, 2, 16, True), gid, layer)
    s.stroke(wp(torso, r, 2, 16, True), p.ink, 2.4, .8, True, layer)
    s.stroke(wp(torso[1:5], r, 2, 16), p.rim, 3.6, min(1, rim_op * 1.5), False, "rim")
    head = blob(T(0, top + 46)[0], T(0, top + 46)[1], H * .085, r, k=9, squash=1.05)
    s.fill(wp(head, r, 2, 10, True), tone[0], 1, layer)
    s.stroke(wp(head, r, 2, 10, True), p.ink, 2.2, .8, True, layer)
    _rim(s, head[:5], min(1, rim_op * 1.6), 3.2, None)
    if face:
        s.ellipse(T(-14, top + 50)[0], T(-14, top + 50)[1], H * .012, H * .014,
                  face, .9, "rim")
        s.ellipse(T(14, top + 50)[0], T(14, top + 50)[1], H * .012, H * .014,
                  face, .9, "rim")
    return T


def prop_dannet(s, cx, base_y, scale=1.0):
    """Two heads on one iron yoke. The left one is having a wonderful time."""
    p = s.pal
    r = s.rng
    H = 460 * scale

    def T(x, y):
        return (cx + x * scale, base_y - y * scale)

    _shadow(s, cx, base_y + 6, 210 * scale, 40 * scale, .7)
    for dx in (-96, 96):                       # two heavy legs
        q = [T(dx - 46, 0), T(dx - 38, 170), T(dx + 38, 170), T(dx + 46, 0)]
        _dark(s, q, ("#4a4038", "#0d0b09"))
        _rim(s, q[:2], .35, 2.4, None)
    body = [T(-150, 150), T(-130, 330), T(130, 330), T(150, 150)]
    gid = s.lin([("0", "#6b5f4e", 1), ("1", "#15120e", 1)])
    s.gfill(wp(body, r, 3, 18, True), gid, "props")
    s.stroke(wp(body, r, 3, 18, True), "#080706", 3.0, .85, True, "props")
    _rim(s, body[1:3], .55, 3.2, None)
    # the yoke: iron, welded, worn smooth where they have pulled against it
    yoke = [T(-120, 340), T(120, 340), T(120, 384), T(-120, 384)]
    _dark(s, yoke, ("#9aa0a6", "#2b3036"))
    _rim(s, yoke[:2], .8, 3.4, None)
    for i in range(5):
        s.ellipse(T(-90 + i * 45, 362)[0], T(-90 + i * 45, 362)[1], 6 * scale,
                  6 * scale, p.rim, .5, "rim")
    for dx, tint, mood in ((-96, "#c9483a", "up"), (96, "#5f8f6a", "down")):
        hx, hy = T(dx, 452)
        head = blob(hx, hy, 62 * scale, r, k=9, squash=1.05)
        s.fill(wp(head, r, 2, 10, True), "#6b5f4e", 1, "props")
        s.stroke(wp(head, r, 2, 10, True), "#080706", 2.4, .85, True, "props")
        _rim(s, head[:5], .6, 2.6, None)
        for ex in (-22, 22):                   # the eyes: one delighted, one worried
            s.ellipse(hx + ex * scale, hy - 6 * scale, 8 * scale, 9 * scale, tint,
                      .95, "rim")
        m = 1 if mood == "up" else -1
        s.stroke(wp([(hx - 26 * scale, hy + 26 * scale),
                     (hx, hy + (26 + 10 * m) * scale),
                     (hx + 26 * scale, hy + 26 * scale)], r, 2, 8), "#080706",
                 4 * scale, .9, False, "props")
    # Dan's arm, breaking something; Kennet's arm, mending it
    s.stroke(wp([T(-150, 300), T(-260, 360), T(-300, 250)], r, 3, 14), "#4a4038",
             30 * scale, 1, False, "props")
    s.stroke(wp([T(150, 300), T(258, 250), T(300, 150)], r, 3, 14), "#4a4038",
             30 * scale, 1, False, "props")
    for i in range(7):                         # what Dan has just broken
        s.stroke([T(-300 + r.uniform(-30, 30), 230 - i * 12),
                  T(-270 + r.uniform(-40, 40), 190 - i * 14)], "#c9483a",
                 r.uniform(2, 4), r.uniform(.3, .7), False, "rim")
    s.screen('<ellipse cx="%.0f" cy="%.0f" rx="%.0f" ry="%.0f" fill="url(#%s)" '
             'filter="url(#soft3)"/>'
             % (T(300, 150)[0], T(300, 150)[1], 60 * scale, 60 * scale,
                s.rad([("0", "#7fd8b6", .55), ("1", "#7fd8b6", 0)])), .8)


def prop_sternwheeler(s, cx, y, half=340):
    """The Requisite Variety, tied up at the landing, with her pilot aboard."""
    p = s.pal
    r = s.rng
    hull = [(cx - half, y), (cx - half * .82, y - 46), (cx + half * .86, y - 46),
            (cx + half, y), (cx + half * .8, y + 40), (cx - half * .8, y + 40)]
    _dark(s, hull, ("#7c6a4e", "#171208"))
    _rim(s, hull[1:3], .7, 3.0, None)
    deck = [(cx - half * .66, y - 46), (cx - half * .6, y - 150),
            (cx + half * .5, y - 150), (cx + half * .58, y - 46)]
    _dark(s, deck, ("#a89478", "#241d12"))
    _rim(s, deck[1:3], .65, 2.8, None)
    for i in range(5):                          # the texas, and its windows
        x = lerp(cx - half * .5, cx + half * .4, i / 4)
        q = [(x - 22, y - 70), (x - 22, y - 128), (x + 22, y - 128), (x + 22, y - 70)]
        s.fill(wp(q, r, 1.2, 10, True), "#ffdca8", .5, "props")
        _rim(s, q, .5, 2.0, None, True)
    # the stern wheel
    wx = cx - half - 40
    for i in range(9):
        a = math.pi * 2 * i / 9
        s.stroke([(wx, y - 40), (wx + math.cos(a) * 92, y - 40 + math.sin(a) * 92)],
                 "#5c4a30", 9, 1, False, "props")
    s.add('<circle cx="%.1f" cy="%.1f" r="92" fill="none" stroke="#5c4a30" '
          'stroke-width="10"/>' % (wx, y - 40), "props")
    s.add('<circle cx="%.1f" cy="%.1f" r="92" fill="none" stroke="%s" '
          'stroke-opacity="0.5" stroke-width="3"/>' % (wx, y - 40, p.rim), "rim")
    # the pilot, one hand on a spoke and the other on a mug
    prop_figure(s, cx - half * .1, y - 150, 150, ("#4a5058", "#0d1013"), .7)
    s.add('<circle cx="%.1f" cy="%.1f" r="34" fill="none" stroke="#3a3026" '
          'stroke-width="7"/>' % (cx + half * .14, y - 196), "props")
    for i in range(8):
        a = math.pi * 2 * i / 8
        s.stroke([(cx + half * .14, y - 196),
                  (cx + half * .14 + math.cos(a) * 34, y - 196 + math.sin(a) * 34)],
                 "#3a3026", 4, 1, False, "props")
    s.screen('<ellipse cx="%.0f" cy="%.0f" rx="260" ry="120" fill="url(#%s)" '
             'filter="url(#soft)"/>'
             % (cx, y - 120, s.rad([("0", "#ffdca8", .35), ("1", "#ffdca8", 0)])), .8)


def prop_folding_table(s, cx, base_y, half=200):
    """Tom's table: a board, cards, a chalked-up scoreboard and a tin."""
    p = s.pal
    r = s.rng
    prop_table(s, cx, base_y, half, 120, ("#8a8272", "#2a251c"))
    top = base_y - 120
    board = [(cx - half * .7, top), (cx - half * .66, top - 54),
             (cx + half * .2, top - 54), (cx + half * .24, top)]
    s.fill(wp(board, r, 1.4, 12, True), "#d8d2bc", .9, "props")
    _rim(s, board, .6, 2.2, None, True)
    for i in range(4):                          # cards, face down
        x = cx + half * (.34 + i * .12)
        q = [(x - 16, top), (x - 14, top - 30), (x + 14, top - 30), (x + 16, top)]
        s.fill(wp(q, r, 1, 8, True), "#c9c2a8", .85, "props")
    tin = [(cx + half * .78, top), (cx + half * .78, top - 40),
           (cx + half * 1.02, top - 40), (cx + half * 1.02, top)]
    _dark(s, tin, ("#8a7a4a", "#241c0e"))
    _rim(s, tin, .8, 2.4, p.accent, True)


def prop_golem(s, cx, base_y, height=520):
    """Nine feet of stacked blocks and connectors, with a port for a head."""
    p = s.pal
    r = s.rng
    H = height
    _shadow(s, cx, base_y + 4, H * .30, H * .05, .7)
    rows = [(-.20, .00, .19), (-.17, .19, .17), (-.15, .36, .15), (-.12, .52, .13)]
    for dx, y0, hw in rows:
        q = [(cx - hw * H, base_y - y0 * H), (cx - hw * H, base_y - (y0 + .18) * H),
             (cx + hw * H, base_y - (y0 + .18) * H), (cx + hw * H, base_y - y0 * H)]
        _dark(s, q, ("#8d939a", "#1e2226"))
        s.stroke(wp(q, r, 1.6, 14, True), p.ink, 2.6, .8, True, "props")
        _rim(s, q[1:3], .55, 2.8, None)
        for k in range(3):                      # ports on every block
            s.ellipse(cx - hw * H + (k + 1) * (2 * hw * H) / 4,
                      base_y - (y0 + .09) * H, 7, 7, p.rim, .45, "rim")
    for i in range(3):                          # connectors between the blocks
        y = base_y - (.19 + i * .17) * H
        s.stroke(wob((cx - .12 * H, y), (cx + .12 * H, y), r, 1.4, 12), p.rim, 2.2,
                 .4, False, "rim")
    hq = [(cx - .09 * H, base_y - .70 * H), (cx - .07 * H, base_y - .82 * H),
          (cx + .07 * H, base_y - .82 * H), (cx + .09 * H, base_y - .70 * H)]
    _dark(s, hq, ("#a49aa0", "#23262a"))
    _rim(s, hq, .7, 2.8, None, True)
    s.ellipse(cx, base_y - .76 * H, .035 * H, .035 * H, "#05070a", 1, "props")
    s.add('<circle cx="%.1f" cy="%.1f" r="%.1f" fill="none" stroke="%s" '
          'stroke-opacity="0.8" stroke-width="3"/>'
          % (cx, base_y - .76 * H, .035 * H, p.accent), "rim")
    for sgn in (-1, 1):                         # arms, one across the plinth
        s.stroke(wp([(cx + sgn * .18 * H, base_y - .52 * H),
                     (cx + sgn * .34 * H, base_y - .40 * H),
                     (cx + sgn * .38 * H, base_y - .18 * H)], r, 2, 14),
                 "#6d747a", .05 * H, 1, False, "props")


def prop_troll(s, cx, base_y, scale=1.0):
    """The Reviewer Troll, arms folded, entirely correct about everything."""
    p = s.pal
    r = s.rng
    T = prop_figure(s, cx, base_y, 320 * scale, ("#5d6a4a", "#12160e"), .6,
                    face="#ffbe3a")
    # folded arms, which is the whole of his posture
    s.stroke(wp([T(-52, 150), T(0, 132), T(52, 150)], r, 2, 12), "#4e5a3e",
             26 * scale, 1, False, "props")
    s.stroke(wp([T(-52, 150), T(0, 132), T(52, 150)], r, 2, 12), p.rim, 2.4, .4,
             False, "rim")
    # the clipboard
    q = [T(58, 120), T(58, 190), T(112, 190), T(112, 120)]
    s.fill(wp(q, r, 1.2, 10, True), "#d8d2bc", .9, "props")
    _rim(s, q, .6, 2.0, None, True)


def prop_bot(s, cx, base_y, scale=1.0, chained=True):
    """The CI bot: boxy, patient, enormous, and green when it is happy."""
    p = s.pal
    r = s.rng

    def T(x, y):
        return (cx + x * scale, base_y - y * scale)

    _shadow(s, cx, base_y + 4, 150 * scale, 28 * scale, .7)
    for dx in (-86, 86):
        q = [T(dx - 30, 0), T(dx - 24, 78), T(dx + 24, 78), T(dx + 30, 0)]
        _dark(s, q, ("#3a4048", "#0b0e11"))
        _rim(s, q[:2], .35, 2.2, None)
    body = [T(-120, 70), T(-110, 250), T(110, 250), T(120, 70)]
    gid = s.lin([("0", "#5a636c", 1), ("1", "#12161a", 1)])
    s.gfill(wp(body, r, 2, 16, True), gid, "props")
    s.stroke(wp(body, r, 2, 16, True), p.ink, 2.6, .85, True, "props")
    _rim(s, body[1:3], .6, 3.0, None)
    # the small green check it lives for
    s.stroke(wp([T(-40, 160), T(-8, 130), T(52, 200)], r, 2, 10), "#4fbf6a",
             16 * scale, .95, False, "props")
    s.screen('<ellipse cx="%.0f" cy="%.0f" rx="%.0f" ry="%.0f" fill="url(#%s)" '
             'filter="url(#soft3)"/>'
             % (T(0, 165)[0], T(0, 165)[1], 90 * scale, 70 * scale,
                s.rad([("0", "#4fbf6a", .6), ("1", "#4fbf6a", 0)])), .9)
    head = [T(-58, 250), T(-50, 316), T(50, 316), T(58, 250)]
    _dark(s, head, ("#6b747d", "#161a1e"))
    _rim(s, head, .65, 2.6, None, True)
    for ex in (-24, 24):
        s.ellipse(T(ex, 288)[0], T(ex, 288)[1], 9 * scale, 9 * scale, "#9fe8ff",
                  .9, "rim")
    if chained:
        prop_chain(s, cx - 170 * scale, base_y - 190 * scale, base_y - 20 * scale,
                   9, 12 * scale)


def prop_paper_man(s, cx, base_y, scale=1.0, faces=3):
    """Dassault: a set of faces, worn one at a time, over a man made of paper."""
    p = s.pal
    r = s.rng
    T = prop_figure(s, cx, base_y, 340 * scale, ("#2b2a26", "#0a0908"), .55)
    hx, hy = T(0, 260)
    # the spare faces, hanging in the air beside him like slides
    for i in range(faces):
        a = -0.5 + i * 0.5
        fx = hx + math.cos(a) * 170 * scale
        fy = hy - 40 * scale + math.sin(a) * 60 * scale
        q = [(fx - 34 * scale, fy - 44 * scale), (fx + 34 * scale, fy - 50 * scale),
             (fx + 38 * scale, fy + 44 * scale), (fx - 30 * scale, fy + 50 * scale)]
        s.fill(wp(q, r, 2, 10, True), "#e8e2d2", .55 - i * .1, "props")
        s.stroke(wp(q, r, 2, 10, True), "#9a9488", 2.0, .5, True, "rim")
        for ex in (-12, 12):
            s.ellipse(fx + ex * scale, fy - 8 * scale, 4 * scale, 5 * scale,
                      "#3a3630", .6, "rim")
    # the face he has on
    s.fill(wp(blob(hx, hy, 44 * scale, r, k=9, squash=1.05), r, 2, 10, True),
           "#e8e2d2", .9, "props")
    _rim(s, blob(hx, hy, 44 * scale, r, k=9)[:5], .7, 2.4, None)


def prop_confabulator(s, cx, cy, half=280):
    """Enormous, serene, beautifully rendered, and certain about everything."""
    p = s.pal
    r = s.rng
    body = blob(cx, cy, half, r, k=13, squash=.66)
    gid = s.lin([("0", "#c9b98d", 1), ("1", "#2a231a", 1)])
    s.gfill(wp(body, r, 5, 18, True), gid, "props")
    s.stroke(wp(body, r, 5, 18, True), p.ink, 3.0, .8, True, "props")
    _rim(s, [q for q in body if q[1] <= cy], .6, 3.4, None)
    for sgn in (-1, 1):                          # wings, folded and gilt-edged
        w = [(cx, cy - half * .2), (cx + sgn * half * 1.25, cy - half * .55),
             (cx + sgn * half * 1.05, cy + half * .3), (cx + sgn * half * .3, cy + half * .4)]
        s.fill(wp(w, r, 4, 14, True), "#3a2f20", .95, "props")
        s.stroke(wp(w[:2], r, 4, 14), "#e0c795", 2.6, .55, False, "rim")
    hx, hy = cx, cy - half * .72
    s.fill(wp(blob(hx, hy, half * .27, r, k=9), r, 3, 10, True), "#d8c9a8", 1, "props")
    _rim(s, blob(hx, hy, half * .27, r, k=9)[:5], .7, 2.8, None)
    for ex in (-1, 1):
        s.ellipse(hx + ex * half * .10, hy - half * .03, half * .045, half * .05,
                  "#fff3d0", .95, "rim")
    s.screen('<ellipse cx="%.0f" cy="%.0f" rx="%.0f" ry="%.0f" fill="url(#%s)" '
             'filter="url(#soft)"/>'
             % (cx, cy, half * 1.8, half * 1.2,
                s.rad([("0", "#ffe9b0", .30), ("1", "#ffe9b0", 0)])), .85)


def prop_screens(s, y0, y1, cols=7, tone="#2f6f5a"):
    """A wall of dashboards, all green, all at once."""
    p = s.pal
    for i in range(cols):
        x0 = lerp(-30, W + 30, i / cols) + 8
        x1 = lerp(-30, W + 30, (i + 1) / cols) - 8
        q = [(x0, y1), (x0, y0), (x1, y0), (x1, y1)]
        gid = s.lin([("0", tone, 1), ("1", "#0b1a16", 1)])
        s.gfill(wp(q, s.rng, 1.4, 18, True), gid, "props")
        s.stroke(wp(q, s.rng, 1.4, 18, True), "#0a0d0f", 2.4, .8, True, "props")
        for k in range(5):                       # a plot on every one of them
            yy = lerp(y0 + 20, y1 - 20, (k + 1) / 6)
            pts = [(lerp(x0 + 10, x1 - 10, j / 6),
                    yy + s.rng.uniform(-10, 10)) for j in range(7)]
            s.stroke(wp(pts, s.rng, 2, 12), "#9fe8c0", 1.8,
                     s.rng.uniform(.25, .6), False, "rim")
        s.screen('<rect x="%.0f" y="%.0f" width="%.0f" height="%.0f" fill="url(#%s)"/>'
                 % (x0, y0, x1 - x0, y1 - y0,
                    s.rad([("0", "#5fd6ab", .28), ("1", "#5fd6ab", 0)])), .8)


def prop_arch_ring(s, cy=430, n=7, rr=470, tone=("#a8b0b8", "#22262b")):
    """Seven arches round a rotunda, each with a lit sigil over the keystone."""
    p = s.pal
    for i in range(n):
        t = (i + .5) / n
        a = math.pi * (1.02 + .96 * t)
        x = CX + math.cos(a) * rr
        y = cy + math.sin(a) * rr * .30
        h = lerp(300, 200, abs(x - CX) / rr)
        opening(s, x, y - h * .5, y + h * .5, h * .26, "arch", rim_op=.4)
        s.screen('<circle cx="%.0f" cy="%.0f" r="%.0f" fill="url(#%s)" '
                 'filter="url(#soft3)"/>'
                 % (x, y - h * .62, h * .10,
                    s.rad([("0", p.accent, .9), ("1", p.accent, 0)])), .9)
