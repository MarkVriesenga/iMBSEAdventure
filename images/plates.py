#!/usr/bin/env python3
"""plates.py — one entry per distinct room of the iMBSE platform.

60 plates cover all 64 rooms: the three rooms of the Ambiguity Swamp share one
plate and the three walkable Trace Catacombs share another, because in both
cases looking identical is the point. The extra room keys are listed in each
plate's `aliases`, and ROOM_TO_PLATE at the bottom maps all 64 keys.

Fourteen of these rooms have somebody in them. Everything human on the
platform is drawn from prop_figure in props.py, so the guide, the priest, the
oracle, the pilot and the thing in the Uncanny Valley all read as the same
species — which matters, because one of them is you.
"""
import math

from kit import (W, H, CX, Palette, Scene, arc_pts, blob, lerp, lp, mid, path, wob, wp,
                 outdoor_band, stage_cavern, stage_chamber, stage_corridor,
                 stage_interior, stage_ledge, stage_outdoor, stage_passage,
                 stage_water, opening, sky)
from props import *          # noqa: F401,F403  — the prop_* library
from props import _dark, _rim, _shadow

REGISTRY = {}
TITLES = {}
ORDER = []
ALIASES = {}


def plate(key, title, palette="stone", seed=None, aliases=()):
    def deco(fn):
        REGISTRY[key] = (fn, palette, seed)
        TITLES[key] = title
        ORDER.append(key)
        ALIASES[key] = list(aliases)
        return fn
    return deco


def build(key):
    fn, palette, seed = REGISTRY[key]
    s = Scene(key, TITLES[key], palette, seed)
    fn(s)
    return s.render()


# ---------------------------------------------------------------- local kit
def _stream(s, pts, width=30, tone="#bcdae6"):
    """Telemetry, running downhill. A cut channel, not a stroked line."""
    n = len(pts)
    left, right = [], []
    for i, (x, y) in enumerate(pts):
        t = i / max(1, n - 1)
        hw = width * (.55 + .95 * t)
        left.append((x - hw, y))
        right.append((x + hw, y))
    w = wp(left + right[::-1], s.rng, 3, 20, True)
    s.gfill(w, s.lin([("0", "#35545f", 1), ("1", "#0a161c", 1)]), "props")
    cid = s.clip(w)
    out = []
    for i in range(30):
        u = (i + .5) / 30
        k = u * (n - 1)
        j = min(int(k), n - 2)
        a = lp(left[j], left[j + 1], k - j)
        b = lp(right[j], right[j + 1], k - j)
        sag = s.rng.uniform(-8, 12)
        out.append('<path d="%s" fill="none" stroke="%s" stroke-opacity="%.2f" '
                   'stroke-width="%.1f" stroke-linecap="round"/>'
                   % (path(wob((a[0], a[1] + sag), (b[0], b[1] + sag), s.rng, 3, 14)),
                      tone, s.rng.uniform(.18, .70), s.rng.uniform(1.6, 4.6)))
    s.add('<g clip-path="url(#%s)">%s</g>' % (cid, "".join(out)), "rim")
    for edge in (left, right):
        s.stroke(wp(edge, s.rng, 3, 20), s.pal.ink, 5.0, .6, False, "props")
        s.stroke(wp(edge, s.rng, 3, 20), s.pal.rim, 2.6, .45, False, "rim")


def _mist(s, y, h=220, op=.55, color="#e6eef2", rows=7):
    s.screen('<rect x="-40" y="%.1f" width="%d" height="%.1f" fill="url(#%s)"/>'
             % (y - h * .5, W + 80, h,
                s.lin([("0", color, 0), ("0.5", color, .34), ("1", color, 0)])),
             op * .8)
    for i in range(rows):
        cy = y + s.rng.uniform(-h * .45, h * .45)
        s.ellipse(s.rng.uniform(-60, W + 60), cy, s.rng.uniform(150, 400),
                  s.rng.uniform(18, 54), color, s.rng.uniform(.10, .26) * op,
                  "props", blur="soft")


def _hole(s, cx, cy, rr, squash=.45, rim_op=.5):
    pts = blob(cx, cy, rr, s.rng, squash=squash)
    w = wp(pts, s.rng, 4, 16, True)
    s.fill(w, "#000", 1, "props")
    far = [q for q in pts if q[1] <= cy]
    near = [q for q in pts if q[1] > cy]
    if len(far) > 1:
        crest = [(x, y + rr * squash * .62) for x, y in far]
        s.gfill(wp(far + crest[::-1], s.rng, 3, 14, True),
                s.lin([("0", s.pal.rock_far[1], 1), ("1", "#000", 1)],
                      user=(0, cy - rr * squash, 0, cy + rr * squash * .2)), "props")
        s.stroke(wp(far, s.rng, 4, 16), s.pal.rim, 2.6, rim_op * .5, False, "rim")
    s.stroke(w, s.pal.ink, 4.5, .85, True, "props")
    if len(near) > 1:
        s.stroke(wp(near, s.rng, 4, 16), s.pal.rim, 3.6, rim_op, False, "rim")
    return pts


def _boulders(s, box, n=14, r=(40, 110), layer="props"):
    p = s.pal
    x0, y0, x1, y1 = box
    for _ in range(n):
        cx, cy = s.rng.uniform(x0, x1), s.rng.uniform(y0, y1)
        rr = s.rng.uniform(*r)
        pts = blob(cx, cy, rr, s.rng, k=s.rng.randint(5, 7), squash=.78)
        w = wp(pts, s.rng, rr * .05, 26, True)
        s.gfill(w, s.lin([("0", p.rock_far[0], 1), ("1", p.ink, 1)]), layer)
        s.stroke(w, p.ink, 3.2, .9, True, layer)
        lit = [q for q in pts if q[1] <= cy]
        if len(lit) > 1:
            s.stroke(wp(lit, s.rng, rr * .04, 20), p.rim, 2.2,
                     s.rng.uniform(.08, .24), False, "rim")


def _scrawl(s, x, y, words=1, scale=1.0, color=None, op=.55, letters=4):
    """Lettering: a sign, a placard, a stencil, a timeline on a whiteboard."""
    col = color or s.pal.accent
    for wnum in range(words):
        wx = x + wnum * 150 * scale
        for i in range(letters):
            lx = wx + i * 30 * scale
            k = s.rng.randint(2, 4)
            pts = [(lx + s.rng.uniform(-10, 10) * scale,
                    y + s.rng.uniform(-22, 22) * scale) for _ in range(k)]
            s.stroke(wp(pts, s.rng, 2, 10), col, 4.2 * scale,
                     s.rng.uniform(op * .7, op), False, "rim")


def _placard(s, x, y, half=140):
    """The scorched placard that hangs in every hall, naming its face."""
    q = [(x - half, y + 44), (x - half, y - 44), (x + half, y - 44), (x + half, y + 44)]
    s.fill(wp(q, s.rng, 1.4, 14, True), "#d8d2bc", .92, "props")
    _rim(s, q, .8, 2.6, None, True)
    _scrawl(s, x - half * .74, y - 14, 1, .62, "#3a3630", .85, 5)
    _scrawl(s, x - half * .74, y + 16, 1, .62, "#3a3630", .85, 5)
    # scorched at one corner, because he has read them all
    s.fill(wp([(x + half - 40, y - 44), (x + half, y - 44), (x + half, y - 4)],
              s.rng, 3, 10, True), "#2a201a", .8, "props")


def _rack(s, x0, x1, y0, y1, rows=6, glow="#5fd6ab"):
    """Racked equipment: shelving, cabinets, cases of sunsetted features."""
    p = s.pal
    _dark(s, [(x0, y1), (x0, y0), (x1, y0), (x1, y1)], (p.rock_near[0], p.ink))
    for i in range(rows + 1):
        y = lerp(y0, y1, i / rows)
        s.stroke(wob((x0, y), (x1, y), s.rng, 1.6, 26), p.ink, 6, 1, False, "props")
        s.stroke(wob((x0, y), (x1, y), s.rng, 1.6, 26), p.rim, 2.0, .35, False, "rim")
        if i < rows:
            for j in range(6):
                bx = lerp(x0 + 16, x1 - 16, (j + .5) / 6)
                if s.rng.random() < .5:
                    s.ellipse(bx, y + (y1 - y0) / rows * .5, 4, 4, glow,
                              s.rng.uniform(.3, .8), "rim")


# ===========================================================================
# ACT I — THE FOREST
# ===========================================================================
@plate("endOfRoad", "End of the Road", "day", seed=101)
def _end_of_road(s):
    stage_outdoor(s, horizon=520, sun=(240, 150),
                  bands=((0, "#94a481", "#71835c"), (48, "#67784d", "#465433")))
    prop_forest_band(s, 596, 13, (200, 340), tone="#22301c", rim_op=.05, spread=118)
    prop_path(s, near=(CX - 60, H + 40, 330), far=(CX + 30, 640, 72), tone="#9a9078")
    # the chain-link gate, open so long the weeds have grown through it
    for x in (CX - 250, CX + 250):
        s.stroke(wob((x, 900), (x, 660), s.rng, 2, 24), "#3a3a33", 14, 1, False, "props")
    for i in range(9):
        x = lerp(CX - 240, CX - 40, i / 8)
        s.stroke(wob((x, 890), (x + 30, 676), s.rng, 2, 20), "#4a4a42", 3, .55,
                 False, "props")
    # the dented sign
    q = [(CX + 90, 820), (CX + 90, 720), (CX + 420, 712), (CX + 424, 816)]
    s.fill(wp(q, s.rng, 2, 14, True), "#cfd3cc", .92, "props")
    _rim(s, q, .7, 2.6, None, True)
    _scrawl(s, CX + 120, 752, 2, .58, "#2a2f2a", .9, 4)
    _scrawl(s, CX + 130, 792, 1, .5, "#8a3f2a", .8, 6)
    _stream(s, [(CX - 340, 850), (CX - 300, 950), (CX - 250, H + 30)], 34)
    s.rocks((40, 940, 1020, 1045), 12, (8, 24), rim_op=(.04, .14))
    s.light(240, 150, 1600, color="#fff3d0", strength=.85, tint=.16)


@plate("shedYard", "Yard of the Legacy Shed", "day", seed=102)
def _shed_yard(s):
    stage_outdoor(s, horizon=530, sun=(820, 160),
                  bands=((0, "#8f9d78", "#6a7a52"), (46, "#5d6c46", "#3c4830")))
    prop_forest_band(s, 600, 11, (180, 300), tone="#22301c", rim_op=.05, spread=112)
    prop_house(s, CX + 60, 930, 330, 250, door=True, boarded=False,
               window=[(-170, False)])
    # the rusted remains of five earlier programs
    for i, x in enumerate((150, 300, 800, 930, 1010)):
        _boulders(s, (x - 60, 900 + i * 8, x + 60, 1000 + i * 8), 3, (30, 62))
        s.stroke(wob((x - 50, 960), (x + 50, 946), s.rng, 3, 16), "#7a4a2a", 8,
                 .6, False, "rim")
    s.light(820, 160, 1600, color="#fff3d0", strength=.82, tint=.16)


@plate("insideShed", "Inside the Legacy Shed", "house", seed=103)
def _inside_shed(s):
    s.dark_floor = .74
    g = stage_interior(s, wall_y=(170, 700), back_half=430)
    opening(s, g["br"] + 190, 430, 840, 120, "square", depth=.2, rim_op=.5)
    s.beam((g["br"] + 190, 470), (700, H + 20), (1058, 900), "#ffe6b8", .30)
    _rack(s, g["bl"] + 30, g["bl"] + 360, 300, 660, 5, glow="#c9a06a")
    prop_table(s, CX + 60, 930, 250, 140, ("#8a7048", "#3a2c1c"))
    prop_lamp(s, CX - 40, 790, .58, lit=False)
    prop_treasure_glint(s, [(CX + 120, 792), (CX + 200, 800), (CX - 130, 796)],
                        "#e8dfc0")
    # somebody's mug, still here, with somebody's coffee still in it
    s.ellipse(CX + 250, 782, 26, 12, "#cfc6ac", .9, "props")
    s.light(g["br"] + 150, 520, 1050, color="#ffdca8", strength=.95, tint=.24)
    s.light(CX - 60, 950, 620, strength=.35, tint=.08)


@plate("hillInForest", "Hill in the Forest", "day", seed=104)
def _hill(s):
    stage_outdoor(s, horizon=470, sun=(760, 150),
                  bands=((0, "#96a683", "#6e8058"), (44, "#5f7048", "#3e4b2e")))
    crest = [(x, 720 - 160 * math.exp(-((x - CX) / 420.) ** 2) + s.rng.uniform(-10, 10))
             for x in range(-60, W + 120, 60)]
    s.surface(crest + [(W + 60, H + 60), (-60, H + 60)], ("#8a9670", "#3c4630"), 5, 40)
    prop_forest_band(s, 560, 9, (170, 280), tone="#22301c", rim_op=.05, spread=110)
    # the platform: a rectangle of white light hanging with nothing holding it up
    q = [(CX - 190, 250), (CX + 190, 236), (CX + 196, 320), (CX - 186, 334)]
    s.fill(wp(q, s.rng, 2, 16, True), "#f2f6fa", .92, "props")
    _rim(s, q, .9, 3.0, "#ffffff", True)
    s.screen('<ellipse cx="%d" cy="284" rx="330" ry="180" fill="url(#%s)" '
             'filter="url(#soft)"/>'
             % (CX, s.rad([("0", "#ffffff", .55), ("1", "#ffffff", 0)])), .9)
    for i in range(4):                          # something small falls off it
        s.ellipse(CX + 120 + i * 26, 360 + i * 60, 5, 5, "#e8eef2",
                  .7 - i * .12, "rim")
    s.light(760, 150, 1600, color="#fff3d0", strength=.82, tint=.16)


@plate("forestNorth", "Forest, North of the Road", "day", seed=105)
def _forest_north(s):
    stage_outdoor(s, horizon=560, sun=(900, 300),
                  bands=((0, "#8d9d78", "#5f7049"), (46, "#4f5f3c", "#2f3a24")))
    prop_forest_band(s, 600, 16, (240, 360), tone="#28361f", rim_op=.07, spread=90)
    prop_forest_band(s, 740, 9, (340, 500), tone="#16200f", rim_op=.10, spread=130)
    s.light(900, 300, 1200, color="#fff3d0", strength=.8, tint=.20)


@plate("forestWest", "Forest, West of the Road", "day", seed=106)
def _forest_west(s):
    stage_outdoor(s, horizon=580, sun=(200, 280),
                  bands=((0, "#84947097"[:7], "#5a6c46"), (44, "#48583a", "#2b3520")))
    prop_forest_band(s, 620, 14, (200, 330), tone="#243019", rim_op=.06, spread=100)
    for _ in range(60):                         # unversioned undergrowth
        cx, cy = s.rng.uniform(-20, W + 20), s.rng.uniform(700, H + 10)
        s.fill(wp(blob(cx, cy, s.rng.uniform(30, 90), s.rng, k=8, squash=.55),
                  s.rng, 4, 12, True), "#1c2a14", s.rng.uniform(.5, 1), "props")
    s.light(200, 280, 1200, color="#fff3d0", strength=.72, tint=.18)


@plate("theTrunk", "The Great Trunk", "day", seed=107)
def _trunk(s):
    stage_outdoor(s, horizon=600, sun=(880, 220),
                  bands=((0, "#8d9d78", "#5f7049"), (46, "#4f5f3c", "#2f3a24")))
    prop_forest_band(s, 640, 10, (170, 260), tone="#22301c", rim_op=.05, spread=120)
    # one enormous tree in a clearing it made itself
    trunk = [(CX - 150, H + 40), (CX - 120, 620), (CX - 90, 300),
             (CX + 90, 300), (CX + 120, 620), (CX + 150, H + 40)]
    gid = s.lin([("0", "#4a3a26", 1), ("1", "#150f08", 1)], "0%", "0%", "100%", "0%")
    s.gfill(wp(trunk, s.rng, 5, 30, True), gid, "props")
    s.stroke(wp(trunk, s.rng, 5, 30, True), "#0c0906", 3.4, .8, True, "props")
    s.stroke(wp(trunk[:3], s.rng, 5, 30), "#c9a06a", 3.0, .35, False, "rim")
    for _ in range(26):                         # the scars, one per branch taken
        y = s.rng.uniform(340, 980)
        x = s.rng.uniform(CX - 120, CX + 120)
        rr = s.rng.uniform(14, 40)
        s.ellipse(x, y, rr, rr * .55, "#2a1f12", .9, "props")
        s.stroke(arc_pts(x, y, rr, rr * .55, math.pi, math.pi * 2, 12), "#c9a06a",
                 2.0, s.rng.uniform(.2, .5), False, "rim")
    for x in (150, 920):
        prop_tree(s, x, H + 90, 820, 260, tone="#16200f", rim_op=.1)
    s.light(880, 220, 1300, color="#fff3d0", strength=.78, tint=.18)


@plate("balloonMeadow", "Meadow of the Balloon", "day", seed=108)
def _meadow(s):
    stage_outdoor(s, horizon=560, sun=(260, 150),
                  bands=((0, "#96a683", "#6e8058"), (46, "#5f7048", "#3e4b2e")))
    prop_forest_band(s, 600, 11, (180, 290), tone="#22301c", rim_op=.05, spread=115)
    # the envelope, half-inflated and stirring
    env = arc_pts(CX + 30, 430, 330, 330, math.pi * .96, math.pi * 2.04, 30)
    gid = s.lin([("0", "#d8c9a8", 1), ("1", "#8a6a44", 1)])
    s.gfill(wp(env + [(CX + 130, 620), (CX - 70, 620)], s.rng, 5, 26, True), gid, "props")
    for i in range(7):                          # the stripes
        a0 = math.pi * (.96 + .18 * i)
        s.stroke(arc_pts(CX + 30, 430, 330 - i * 4, 330, a0, a0 + math.pi * .09, 10),
                 "#b8452f", 26, .55, False, "props")
    _rim(s, env[2:26], .55, 3.0, None)
    for dx in (-90, 90):
        s.stroke(wob((CX + 30 + dx, 620), (CX + 30 + dx * .5, 780), s.rng, 2, 16),
                 "#2a2118", 5, 1, False, "props")
    prop_basket(s, CX + 30, 830, 110, 52)
    for i, dx in enumerate((-96, -32, 32, 96)):  # sandbags stencilled TECHNICAL DEBT
        q = [(CX + 30 + dx - 26, 860), (CX + 30 + dx - 22, 940),
             (CX + 30 + dx + 22, 940), (CX + 30 + dx + 26, 860)]
        _dark(s, q, ("#8a7a5c", "#241f14"))
        _rim(s, q[:2], .5, 2.2, None)
    # the tether, to an iron ring set in concrete
    s.stroke(wp([(CX - 60, 880), (CX - 280, 960), (CX - 400, 1010)], s.rng, 3, 20),
             "#cfc6ac", 5, .8, False, "props")
    s.ellipse(CX - 420, 1016, 36, 14, "#8d939a", .9, "props")
    s.light(260, 150, 1600, color="#fff3d0", strength=.85, tint=.16)


@plate("gully", "Gully of the Data Creek", "water", seed=109)
def _gully(s):
    sky(s, 260, sun=(700, 120))
    for sgn, x in ((-1, 210), (1, 850)):
        pts = [(x - sgn * 320, -60), (x, 240), (x + sgn * 110, 620),
               (x + sgn * 60, H + 60), (x - sgn * 520, H + 60)]
        s.surface(pts, ("#6d7a52", "#232a1a"), 8, 40)
    prop_forest_band(s, 460, 8, (180, 300), tone="#22301c", rim_op=.06, spread=110)
    s.surface([(-60, 800), (W + 60, 780), (W + 60, H + 60), (-60, H + 60)],
              ("#8f9670", "#3a402c"), 6, 40)
    _stream(s, [(CX + 20, 640), (CX - 40, 820), (CX + 40, 960), (CX - 40, H + 30)], 52)
    s.specks((CX - 200, 640, CX + 200, H), 90, "#bcdae6", (1.2, 3.6), (.12, .5))
    s.rocks((60, 830, 1000, 1045), 20, (12, 36), rim_op=(.10, .26))
    s.light(700, 200, 1400, color="#ffe9c0", strength=.78, tint=.16)


@plate("creekBed", "Creek Bed", "water", seed=110)
def _creek_bed(s):
    sky(s, 220, sun=(300, 110))
    prop_cliffs(s, y_top=120, y_base=520, tone=("#8a9670", "#3c4630"))
    s.surface([(-60, 560), (W + 60, 540), (W + 60, H + 60), (-60, H + 60)],
              ("#a9a693", "#454336"), 6, 44)
    _stream(s, [(CX - 40, 600), (CX + 30, 780), (CX - 30, 980), (CX + 20, H + 30)], 90)
    s.rocks((0, 700, 1050, 1045), 46, (10, 34), rim_op=(.14, .34))
    prop_treasure_glint(s, [(CX + 250, 940)], "#cfd6dc")
    s.light(300, 180, 1400, color="#ffe9c0", strength=.78, tint=.16)


@plate("sinkhole", "The Sinkhole", "water", seed=111)
def _sinkhole(s):
    sky(s, 190, sun=None)
    prop_cliffs(s, y_top=60, y_base=560, tone=("#7c8470", "#2f342a"))
    s.surface([(-60, 600), (W + 60, 580), (W + 60, H + 60), (-60, H + 60)],
              ("#8d8a78", "#33322a"), 6, 44)
    _stream(s, [(CX - 200, 640), (CX - 80, 780), (CX - 10, 880)], 70)
    _hole(s, CX + 20, 940, 250, .48)
    # the steel service hatch, padlocked from the far side
    q = [(CX + 200, 1010), (CX + 210, 890), (CX + 420, 880), (CX + 424, 1006)]
    _dark(s, q, ("#7c848c", "#191d21"))
    _rim(s, q, .7, 3.0, None, True)
    for i in range(4):
        s.ellipse(lerp(CX + 220, CX + 400, i / 3), 940, 8, 8, "#b06a3a", .6, "rim")
    for _ in range(20):
        s.line((s.rng.uniform(CX + 200, CX + 420), s.rng.uniform(890, 1000)),
               (s.rng.uniform(CX + 200, CX + 420), s.rng.uniform(940, 1010)),
               "#8a4a22", s.rng.uniform(2, 6), s.rng.uniform(.2, .5), 2.0, 20)
    s.rocks((0, 880, 1050, 1045), 22, (12, 40), rim_op=(.10, .28))
    s.light(CX, 300, 1300, color="#cfe6f2", strength=.6, tint=.14)


# ===========================================================================
# ACT II — THE EDGE OF THE PLATFORM
# ===========================================================================
@plate("ingressDeck", "Ingress Deck", "canyon", seed=201)
def _ingress(s):
    sky(s, 620, sun=(880, 200))
    _mist(s, 640, 340, .9, "#dfe8ee")
    # a steel deck, and then four thousand feet of nothing
    deck = [(-60, 760), (W + 60, 740), (W + 60, H + 60), (-60, H + 60)]
    s.surface(deck, ("#8d939a", "#2b3036"), 4, 50, edge="#14171a", edge_op=.6)
    for i in range(9):
        x = lerp(-40, W + 40, i / 8)
        s.line((x, 770), (x + 20, H + 40), "#1e2328", 3.0, .30, 2.0, 44)
    prop_railing(s, [(-40, 780), (CX, 760), (W + 40, 780)], height=110, posts=9)
    # the balloon, hooked on an antenna mast and dying quietly
    s.stroke(wob((880, 760), (900, 200), s.rng, 2, 30), "#3a4048", 14, 1, False, "props")
    env = blob(830, 520, 210, s.rng, k=11, squash=.62)
    s.fill(wp(env, s.rng, 6, 18, True), "#a89478", .85, "props")
    s.stroke(wp(env, s.rng, 6, 18, True), "#3a2f20", 3.0, .7, True, "props")
    s.stroke(wp([(700, 640), (760, 780), (700, 900)], s.rng, 4, 16), "#8a7a5c",
             4, .8, False, "props")
    s.screen('<rect x="0" y="0" width="%d" height="760" fill="url(#%s)"/>'
             % (W, s.lin([("0", "#cfe0ea", .5), ("1", "#cfe0ea", 0)])), .5)
    s.light(880, 200, 1700, color="#ffe9c0", strength=.7, tint=.14)


@plate("firewallGate", "The Firewall Gate", "lava", seed=202)
def _firewall(s):
    p = s.pal
    s.add('<rect x="0" y="0" width="%d" height="%d" fill="url(#%s)"/>'
          % (W, H, s.lin([("0", "#160a08", 1), ("0.5", "#2a0f0a", 1),
                          ("1", "#0a0605", 1)])), "bg")
    # a wall of rules, each one burning and sliding over the one below it
    for i in range(26):
        y = lerp(-40, H + 40, i / 25)
        a = (-60, y + s.rng.uniform(-14, 14))
        b = (W + 60, y + s.rng.uniform(-14, 14))
        s.stroke(wob(a, b, s.rng, 6, 40), "#7a2a12", 26, .85, False, "props")
        s.stroke(wob((a[0], a[1] - 10), (b[0], b[1] - 10), s.rng, 6, 40), "#ff9a3a",
                 3.4, s.rng.uniform(.3, .8), False, "rim")
    # exactly one gap, and a number over it
    opening(s, CX, 420, 900, 110, "arch", depth=.96, glow="#ffd0a0", rim_op=.7)
    _scrawl(s, CX - 70, 360, 1, 1.1, "#ffd0a0", .9, 3)
    s.screen('<ellipse cx="%d" cy="640" rx="260" ry="330" fill="url(#%s)" '
             'filter="url(#soft)"/>'
             % (CX, s.rad([("0", "#ffd0a0", .45), ("1", "#ffd0a0", 0)])), .9)
    s.specks((0, 0, W, H), 120, "#ffc46a", (1.2, 4), (.15, .6))
    s.light(CX, 640, 1100, color="#ff9a3a", strength=.55, tint=.30)


@plate("atrium", "Atrium of the Seven Halls", "bank", seed=203)
def _atrium(s):
    p = s.pal
    g = stage_chamber(s, back=(470, 250), floor_y=820, ceil_y=-300,
                      ceiling=False, texture="courses")
    dome = arc_pts(CX, 330, 720, 360, math.pi, 2 * math.pi, 34)
    s.surface([(-80, -60), (W + 80, -60)] + dome[::-1],
              (p.rock_far[1], p.rock_far[0]), 4, 40)
    for i in range(11):                         # the ribs of the frosted dome
        a = math.pi + math.pi * (i + .5) / 11
        s.line((CX, 20), (CX + math.cos(a) * 720, 330 + math.sin(a) * 360),
               p.rock_edge, 2.2, .22, 3.0, 40)
    prop_arch_ring(s, cy=470, n=7, rr=520)
    # the brass directory plate, and the stair down through the middle of it
    ring = arc_pts(CX, 940, 330, 120, 0, 2 * math.pi, 40)
    s.gfill(wp(ring, s.rng, 3, 24, True),
            s.lin([("0", "#c9a86a", 1), ("1", "#5c4a24", 1)]), "props")
    s.stroke(wp(ring, s.rng, 3, 24, True), "#2a2118", 3.0, .7, True, "props")
    _scrawl(s, CX - 220, 908, 3, .5, "#3a2f18", .8, 4)
    _hole(s, CX, 950, 130, .42)
    prop_folding_table(s, 250, 990, 190)        # Pathfinder Thomas keeps his table here
    prop_figure(s, 250, 900, 400, ("#5d6670", "#0d1013"), .8)
    s.light(CX, 900, 980, strength=.9, tint=.16)
    s.light(CX, 300, 900, strength=.55, tint=.20)


@plate("observabilityBalcony", "Observability Balcony", "bank", seed=204)
def _balcony(s):
    g = stage_chamber(s, back=(460, 220), floor_y=830, ceil_y=120, texture="courses")
    prop_screens(s, 250, 640, 7)
    prop_railing(s, [(-40, 900), (CX, 880), (W + 40, 900)], height=120, posts=9)
    # straight down through four thousand feet to a gravel road and a tin shed
    s.fill([(-60, 900), (W + 60, 880), (W + 60, H + 60), (-60, H + 60)], "#0a0d10",
           .9, "geo")
    _mist(s, 990, 160, .7, "#cfe0ea")
    s.light(CX, 460, 1000, color="#9fe8c0", strength=.55, tint=.22)
    s.light(CX, 860, 700, strength=.6, tint=.12)


@plate("deprecatedWing", "The Deprecated Wing", "mine", seed=205)
def _deprecated(s):
    g = stage_chamber(s, back=(400, 330), floor_y=810, ceil_y=170, texture="courses")
    for i, x in enumerate((g["bl"] + 140, CX, g["br"] - 140)):
        # sunsetted features, standing about under sheets
        sheet = [(x - 110, g["bby"]), (x - 96, 470 + i * 20), (x, 430 + i * 20),
                 (x + 96, 470 + i * 20), (x + 110, g["bby"])]
        s.gfill(wp(sheet, s.rng, 5, 18, True),
                s.lin([("0", "#b6b1a3", 1), ("1", "#2a2822", 1)]), "props")
        s.stroke(wp(sheet, s.rng, 5, 18, True), "#0d0c0a", 2.6, .8, True, "props")
        _rim(s, sheet[1:4], .5, 2.6, None)
    # a stack of back issues, left where somebody meant to come back for them
    for i in range(7):
        q = [(180, 1010 - i * 16), (180, 992 - i * 16), (330, 988 - i * 16),
             (330, 1006 - i * 16)]
        s.fill(wp(q, s.rng, 1.2, 12, True), "#8a7a5c", .9, "props")
        _rim(s, q[1:3], .35, 1.8, None)
    prop_treasure_glint(s, [(820, 980)], "#9fe8ff")
    s.light(CX - 60, 950, 860, strength=.95)


@plate("companyStore", "The Company Store", "bank", seed=206)
def _store(s):
    g = stage_chamber(s, back=(380, 280), floor_y=820, ceil_y=140, texture="courses")
    # a shuttered concession, with a roll-down grille
    q = [(CX - 300, g["bby"] - 20), (CX - 300, 340), (CX + 300, 340),
         (CX + 300, g["bby"] - 20)]
    _dark(s, q, ("#3a4048", "#0b0e11"))
    for i in range(18):
        y = lerp(360, g["bby"] - 40, i / 17)
        s.stroke(wob((CX - 290, y), (CX + 290, y), s.rng, 1.2, 20), "#6b747d", 7,
                 .9, False, "props")
        s.stroke(wob((CX - 290, y - 3), (CX + 290, y - 3), s.rng, 1.2, 20),
                 s.pal.rim, 1.6, .3, False, "rim")
    _rim(s, q, .7, 3.2, None, True)
    # the hand-lettered sign, and the tin
    sign = [(CX - 250, 300), (CX - 246, 200), (CX + 250, 194), (CX + 254, 296)]
    s.fill(wp(sign, s.rng, 1.6, 14, True), "#d8d2bc", .93, "props")
    _rim(s, sign, .8, 2.6, None, True)
    _scrawl(s, CX - 210, 232, 3, .55, "#3a3630", .9, 4)
    _scrawl(s, CX - 190, 272, 2, .5, "#8a3f2a", .8, 5)
    tin = [(CX + 150, 900), (CX + 150, 820), (CX + 250, 820), (CX + 250, 900)]
    _dark(s, tin, ("#8a7a4a", "#241c0e"))
    _rim(s, tin, .85, 2.6, s.pal.accent, True)
    prop_screens(s, 380, 560, 2)
    s.light(CX, 900, 880, strength=.9, tint=.14)


# ===========================================================================
# HALL 1 — HUMAN-AI INTERFACE CLIENTS
# ===========================================================================
@plate("clientConcourse", "Client Concourse", "bank", seed=301)
def _concourse(s):
    g = stage_corridor(s, half=250, floor_y=840, ceil_y=170, far=(120, 420, 800),
                       texture="courses")
    for sgn in (-1, 1):                         # every way anyone ever tried to talk
        for i in range(4):
            x = CX + sgn * (300 + i * 96)
            y = 600 - i * 34
            q = [(x - 54, y), (x - 48, y - 96), (x + 48, y - 96), (x + 54, y)]
            _dark(s, q, ("#3a4048", "#0b0e11"))
            s.gfill(wp([(x - 42, y - 12), (x - 38, y - 84), (x + 38, y - 84),
                        (x + 42, y - 12)], s.rng, 1.2, 12, True),
                    s.lin([("0", "#5fd6ab", .55), ("1", "#12332a", .8)]), "props")
            _rim(s, q, .5, 2.2, None, True)
    # the espresso urn, muttering to itself on a trestle table
    prop_table(s, 250, 960, 150, 90, ("#8a8272", "#2a251c"))
    urn = [(210, 870), (206, 760), (290, 756), (296, 866)]
    _dark(s, urn, ("#9aa3ae", "#2b3138"))
    _rim(s, urn, .8, 2.8, None, True)
    s.ellipse(252, 748, 46, 16, "#c2cad3", .8, "props")
    _placard(s, 830, 470, 150)
    s.light(CX, 900, 900, strength=.9, tint=.14)


@plate("chatParlor", "The Chat Parlor", "bank", seed=302)
def _chat_parlor(s):
    g = stage_chamber(s, back=(400, 300), floor_y=820, ceil_y=150, texture="courses")
    # a console of mirror-glass, and the same answer coming back out of it
    q = [(CX - 260, 700), (CX - 250, 380), (CX + 250, 380), (CX + 260, 700)]
    gid = s.lin([("0", "#2a3138", 1), ("0.5", "#161b20", 1), ("1", "#0a0d10", 1)])
    s.gfill(wp(q, s.rng, 1.4, 18, True), gid, "props")
    _rim(s, q, .8, 3.2, None, True)
    for i in range(6):
        y = 430 + i * 42
        s.stroke(wob((CX - 200, y), (CX + 150, y - 16), s.rng, 2, 24), "#9fb4c2",
                 2.0, .12 + .04 * i, False, "rim")
    s.screen('<ellipse cx="%d" cy="520" rx="280" ry="200" fill="url(#%s)" '
             'filter="url(#soft)"/>'
             % (CX, s.rad([("0", "#9fd8e0", .35), ("1", "#9fd8e0", 0)])), .8)
    # the weary engineer, who has been doing this for some time
    prop_figure(s, CX - 20, 960, 460, ("#39414a", "#0a0d10"), .75, pose="sit")
    s.ellipse(CX - 20, 560, 74, 74, "#39414a", .45, "props")  # their reflection
    s.light(CX, 560, 900, color="#9fd8e0", strength=.6, tint=.22)
    s.light(CX - 60, 940, 700, strength=.65, tint=.12)


@plate("uncannyValley", "The Uncanny Valley", "shadow", seed=303)
def _uncanny(s):
    s.dark_floor = .80
    g = stage_chamber(s, back=(360, 330), floor_y=820, ceil_y=160, texture="chisel")
    # something at the far end, doing what you did one turn ago
    prop_figure(s, CX + 40, g["bby"] - 10, 470, ("#6b737a", "#2a2e33"), .5)
    s.screen('<ellipse cx="%d" cy="640" rx="220" ry="280" fill="url(#%s)" '
             'filter="url(#soft)"/>'
             % (CX + 40, s.rad([("0", "#8c939a", .28), ("1", "#8c939a", 0)])), .8)
    # very nearly right, and off by one frame
    prop_figure(s, CX + 74, g["bby"] - 10, 470, ("#585f66", "#23272b"), .22)
    # the anti-static mat
    mat = [(CX - 300, 990), (CX - 180, 930), (CX + 60, 934), (CX - 40, 998)]
    s.fill(wp(mat, s.rng, 3, 18, True), "#0d1013", .95, "props")
    _rim(s, mat, .5, 2.6, None, True)
    s.light(CX - 120, 960, 760, strength=.8)


# ===========================================================================
# HALL 2 — REQUIREMENT ENGINEERING
# ===========================================================================
@plate("requirementsHall", "Hall of Requirements", "temple", seed=311)
def _requirements(s):
    g = stage_corridor(s, half=250, floor_y=840, ceil_y=140, far=(110, 400, 800),
                       texture="courses")
    for sgn in (-1, 1):                         # filing cabinets to the ceiling
        _rack(s, CX + sgn * 280 - sgn * 0, CX + sgn * 560, 160, 840, 9, glow="#c9a86a")
    _placard(s, CX, 300, 150)
    s.specks((200, 400, 860, 840), 70, "#d8c9a8", (1, 3), (.05, .2))
    s.light(CX, 940, 900, strength=.92, tint=.22)


@plate("shallQuarry", "The Shall Quarry", "temple", seed=312)
def _quarry(s):
    p = s.pal
    g = stage_chamber(s, back=(430, 280), floor_y=820, ceil_y=90, texture="courses")
    # a working face of pale stone, cut into slabs, every one of them lettered
    for row in range(5):
        for col in range(4):
            x = lerp(g["bl"] + 60, g["br"] - 60, (col + .5) / 4)
            y = lerp(g["by"] + 60, g["bby"] - 60, (row + .5) / 5)
            hw, hh = 108, 46
            q = [(x - hw, y - hh), (x + hw, y - hh), (x + hw, y + hh), (x - hw, y + hh)]
            _dark(s, q, ("#b6a37e", "#3a3024"))
            _rim(s, q, .35, 2.0, None, True)
            _scrawl(s, x - hw * .7, y, 1, .42, "#6b5c3f", .7, 4)
    # the one short slab, low down, that is not sand
    x, y = g["bl"] + 190, g["bby"] - 100
    q = [(x - 84, y - 34), (x + 84, y - 34), (x + 84, y + 34), (x - 84, y + 34)]
    _dark(s, q, ("#e0c795", "#6b5c3f"))
    _rim(s, q, 1.0, 3.4, "#fff3d0", True)
    _scrawl(s, x - 60, y, 1, .40, "#3a2f18", .95, 4)
    s.screen('<ellipse cx="%.0f" cy="%.0f" rx="180" ry="120" fill="url(#%s)" '
             'filter="url(#soft)"/>'
             % (x, y, s.rad([("0", "#ffd9a0", .5), ("1", "#ffd9a0", 0)])), .9)
    for _ in range(40):                         # the dust of the ones that crumbled
        s.ellipse(s.rng.uniform(60, 1000), s.rng.uniform(880, 1040),
                  s.rng.uniform(20, 70), s.rng.uniform(6, 18), "#c9b891",
                  s.rng.uniform(.2, .5), "props")
    s.light(CX, 940, 900, strength=.92, tint=.24)


@plate("swamp1", "Somewhere in the Ambiguity Swamp", "moss", seed=313,
       aliases=("swamp2", "swamp3"))
def _swamp(s):
    stage_cavern(s, ceil_y=250, floor_y=760, moss=True, stal=True, back_wall=520)
    s.fill([(-80, 780), (W + 80, 760), (W + 80, H + 60), (-80, H + 60)], "#101a18",
           1, "geo")
    for _ in range(30):                         # standing water, and things in it
        cx, cy = s.rng.uniform(-20, W + 20), s.rng.uniform(800, H)
        s.fill(wp(blob(cx, cy, s.rng.uniform(40, 140), s.rng, k=8, squash=.28),
                  s.rng, 4, 14, True), "#1c2f2a", s.rng.uniform(.4, .9), "props")
        s.stroke(wp(blob(cx, cy, s.rng.uniform(40, 120), s.rng, k=8, squash=.28)[:4],
                    s.rng, 4, 14), "#7fd8b6", 1.8, s.rng.uniform(.1, .3), False, "rim")
    _mist(s, 820, 260, .6, "#cfe8dc")
    for x in (200, 520, 860):
        opening(s, x, 560, 800, 70, "arch", rim_op=.3)
    s.light(CX, 940, 880, strength=.9, tint=.2)


@plate("backlogEnd", "The Backlog, End of", "earth", seed=314)
def _backlog(s):
    g = stage_chamber(s, back=(430, 200), floor_y=820, ceil_y=60, texture="chisel")
    # choked to the roof with cards that will never be pulled
    for _ in range(260):
        cx = s.rng.uniform(-20, W + 20)
        cy = s.rng.uniform(120, H + 10)
        wdt = s.rng.uniform(34, 70)
        a = s.rng.uniform(-.5, .5)
        dx, dy = math.cos(a) * wdt, math.sin(a) * wdt
        q = [(cx - dx, cy - dy), (cx + dx, cy + dy),
             (cx + dx - dy * .5, cy + dy + dx * .5),
             (cx - dx - dy * .5, cy - dy + dx * .5)]
        s.fill(wp(q, s.rng, 1.4, 10, True),
               s.rng.choice(["#c9c2a8", "#b6ad92", "#a2997e"]),
               s.rng.uniform(.5, .95), "props")
        s.stroke(wp(q[:2], s.rng, 1.4, 10), s.pal.rim, 1.2,
                 s.rng.uniform(.05, .2), False, "rim")
    opening(s, g["br"] + 120, 520, 830, 90, "arch", rim_op=.5)
    s.light(CX - 60, 950, 820, strength=.9)


# ===========================================================================
# HALL 3 — MODEL ENGINEERING
# ===========================================================================
@plate("modelForge", "The Model Forge", "lava", seed=321)
def _forge(s):
    g = stage_chamber(s, back=(430, 300), floor_y=820, ceil_y=140, texture="chisel")
    # a hearth of white light
    hearth = [(g["bl"] + 90, g["bby"]), (g["bl"] + 110, 520), (g["bl"] + 330, 510),
              (g["bl"] + 350, g["bby"])]
    s.gfill(wp(hearth, s.rng, 3, 18, True),
            s.lin([("0", "#fff3d0", 1), ("1", "#c9481a", 1)]), "props")
    s.screen('<ellipse cx="%.0f" cy="640" rx="300" ry="280" fill="url(#%s)" '
             'filter="url(#soft)"/>'
             % (g["bl"] + 220, s.rad([("0", "#ffd9a0", .6), ("1", "#ff7a2f", 0)])), .95)
    prop_table(s, CX + 160, 940, 190, 120, ("#5a4a3a", "#1a120c"))   # the anvil bench
    prop_golem(s, CX + 40, g["bby"] - 10, 540)   # the Diagram Golem, being consistent
    _placard(s, g["br"] - 120, 400, 130)
    s.specks((g["bl"], 400, g["br"], 900), 90, "#ffc46a", (1.2, 4), (.15, .6))
    s.light(g["bl"] + 220, 660, 900, color="#ff9a4d", strength=.6, tint=.28)
    s.light(CX + 60, 950, 780, strength=.7)


@plate("metamodelVault", "The Digital Thread Vault", "marble", seed=322)
def _vault(s):
    p = s.pal
    g = stage_chamber(s, back=(400, 260), floor_y=820, ceil_y=100, texture="courses")
    # seven empty sockets in a ring at chest height
    for i in range(7):
        a = math.pi * (1.06 + .88 * i / 6)
        x = CX + math.cos(a) * 400
        y = 640 + math.sin(a) * 130
        s.ellipse(x, y, 44, 44, "#0a0908", 1, "props")
        s.add('<circle cx="%.1f" cy="%.1f" r="44" fill="none" stroke="%s" '
              'stroke-opacity="0.75" stroke-width="4"/>' % (x, y, p.rim), "rim")
        s.add('<circle cx="%.1f" cy="%.1f" r="60" fill="none" stroke="%s" '
              'stroke-opacity="0.25" stroke-width="2"/>' % (x, y, p.accent), "rim")
    # the shelf of lesser niches, each lined with foam
    for i in range(6):
        x = lerp(CX - 330, CX + 330, i / 5)
        q = [(x - 46, 830), (x - 46, 750), (x + 46, 750), (x + 46, 830)]
        _dark(s, q, ("#4a463f", "#0c0b0a"))
        _rim(s, q, .5, 2.2, None, True)
        s.fill(wp([(x - 36, 822), (x - 36, 762), (x + 36, 762), (x + 36, 822)],
                  s.rng, 1.2, 10, True), "#2a2724", .9, "props")
    # one thread of light, out of the floor, through the ring, into the ceiling
    s.stroke(wp([(CX, H + 20), (CX + 10, 700), (CX - 8, 400), (CX, -20)], s.rng, 3, 30),
             "#fff0d4", 7, .85, False, "rim")
    s.screen('<ellipse cx="%d" cy="560" rx="90" ry="620" fill="url(#%s)" '
             'filter="url(#soft)"/>'
             % (CX, s.rad([("0", "#ffd9a0", .45), ("1", "#ffd9a0", 0)])), .9)
    s.light(CX, 640, 980, strength=.75, tint=.24)


@plate("versionCrypt", "The Version Crypt", "hades", seed=323)
def _crypt(s):
    g = stage_chamber(s, back=(400, 240), floor_y=820, ceil_y=80, texture="courses")
    for sgn in (-1, 1):                         # shelves going back further than the program
        for row in range(5):
            y = 300 + row * 110
            x0 = CX + sgn * 150
            x1 = CX + sgn * 520
            s.stroke(wob((x0, y), (x1, y - sgn * 10), s.rng, 1.6, 24), "#2a2f34", 8,
                      1, False, "props")
            s.stroke(wob((x0, y - 4), (x1, y - sgn * 10 - 4), s.rng, 1.6, 24),
                     s.pal.rim, 1.8, .3, False, "rim")
            for k in range(4):                  # commits, lying in amber
                x = lerp(x0, x1, (k + .5) / 4)
                s.ellipse(x, y - 26, 26, 22, "#8a6a20", .55, "props")
                s.ellipse(x - 4, y - 30, 12, 10, "#e0c795", .5, "rim")
    # one of them gold all the way through, and an API token on a hook beside it
    s.ellipse(CX - 300, 494, 34, 30, "#ffd27a", .95, "props")
    prop_treasure_glint(s, [(CX - 300, 494)], "#fff3c8")
    s.stroke(wp([(CX - 210, 470), (CX - 200, 540), (CX - 214, 590)], s.rng, 2, 12),
             "#c9c2a8", 4, .8, False, "props")
    s.light(CX, 900, 860, strength=.9, tint=.18)


@plate("mergeChasm", "The Merge Chasm", "stone", seed=324)
def _merge(s):
    stage_ledge(s, lip=880, far_lip=520, far_wall=260, wall_top=-60,
                depth_color="#141a1e")
    # two histories, running side by side forty feet down and never touching
    for i, (x0, col) in enumerate(((-60, "#7fb6cc"), (-40, "#c9a86a"))):
        pts = [(x0 + j * 130 + i * 26, 700 + 22 * math.sin(j + i) + i * 34)
               for j in range(10)]
        s.stroke(wp(pts, s.rng, 4, 22), col, 4.0, .5 - i * .1, False, "rim")
    _mist(s, 720, 240, .5)
    s.rocks((40, 880, 1020, 1045), 16, (12, 36))
    s.light(CX - 40, 990, 860, strength=.95)


@plate("farSide", "The Rebased Shore", "stone", seed=325)
def _far_side(s):
    g = stage_chamber(s, back=(380, 340), floor_y=800, ceil_y=180, texture="courses")
    # tidy in the way only a rewritten history is tidy
    for i in range(9):
        y = lerp(g["by"] + 40, g["bby"] - 30, (i + .5) / 9)
        s.stroke(wob((g["bl"] + 30, y), (g["br"] - 30, y), s.rng, 1.2, 30),
                 s.pal.rim, 1.8, .22, False, "rim")
    _hole(s, CX + 160, 950, 170, .44)
    opening(s, g["bl"] - 150, 470, 800, 110, "arch")
    s.light(CX - 60, 950, 880, strength=.95)


# ===========================================================================
# HALL 4 — COPILOT HELPERS
# ===========================================================================
@plate("copilotRoost", "The Copilot Roost", "earth", seed=331)
def _roost(s):
    g = stage_chamber(s, back=(430, 240), floor_y=830, ceil_y=-140,
                      ceiling=False, texture="chisel")
    for i, y in enumerate((250, 380, 510)):     # beams, loud with small helpful things
        s.stroke(wob((-40, y), (W + 40, y + 12), s.rng, 3, 30), "#3a2c1c", 26, 1,
                 False, "props")
        s.stroke(wob((-40, y - 12), (W + 40, y), s.rng, 3, 30), s.pal.rim, 2.4,
                 .35, False, "rim")
        for k in range(8):
            bx = -20 + (W + 40) * (k + s.rng.uniform(.2, .8)) / 8
            if abs(bx - 830) < 130 and i == 2:
                continue
            rr = s.rng.uniform(28, 40)
            body = blob(bx, y - rr - 6, rr, s.rng, k=8, squash=.82)
            s.gfill(wp(body, s.rng, 2, 10, True),
                    s.lin([("0", "#8a7a5c", 1), ("1", "#1c1710", 1)]), "props")
            s.stroke(wp(body, s.rng, 2, 10, True), "#0c0906", 2.0, .85, True, "props")
            _rim(s, body[:4], .55, 2.4, None)
            s.stroke(wp([(bx + rr * .5, y - rr * 1.2), (bx + rr * 1.4, y - rr * 1.5)],
                        s.rng, 1.4, 8), "#e0b46a", 4, .9, False, "rim")
            s.ellipse(bx + rr * .38, y - rr * 1.28, 5, 5, s.pal.accent, .8, "rim")
    # one grey bird by itself on the back beam, and the others giving it room
    bx, by = 830, 456
    s.screen('<ellipse cx="%.0f" cy="%.0f" rx="150" ry="130" fill="url(#%s)" '
             'filter="url(#soft)"/>'
             % (bx, by, s.rad([("0", "#cfd6dc", .40), ("1", "#cfd6dc", 0)])), .9)
    body = blob(bx, by, 54, s.rng, k=9, squash=.84)
    s.gfill(wp(body, s.rng, 2, 10, True),
            s.lin([("0", "#c2cad3", 1), ("1", "#4a5058", 1)]), "props")
    s.stroke(wp(body, s.rng, 2, 10, True), "#0c0e10", 2.4, .9, True, "props")
    _rim(s, body[:5], .95, 3.2, "#ffffff")
    s.stroke(wp([(bx + 30, by - 62), (bx + 96, by - 88)], s.rng, 1.4, 8), "#e0b46a",
             6, .95, False, "rim")
    s.ellipse(bx + 22, by - 70, 7, 7, "#ffd24a", 1, "rim")
    # one grey feather, already on the boards below it
    s.fill(wp([(bx - 40, 800), (bx + 10, 770), (bx + 60, 800), (bx + 8, 812)],
              s.rng, 2, 8, True), "#c2cad3", .8, "props")
    _placard(s, 260, 620, 140)
    s.light(CX - 40, 950, 900, strength=.92)


@plate("promptGarden", "The Prompt Garden", "moss", seed=332)
def _garden(s):
    g = stage_chamber(s, back=(400, 260), floor_y=820, ceil_y=-200,
                      ceiling=False, texture="chisel")
    for x in (g["bl"] + 120, CX - 40, g["br"] - 150):   # trellises
        for i in range(6):
            y = lerp(260, 800, i / 5)
            s.stroke(wob((x - 110, y), (x + 110, y), s.rng, 2, 20), "#3a3026", 5,
                     .8, False, "props")
        s.stroke(wob((x, 240), (x, 820), s.rng, 2, 24), "#3a3026", 7, .9, False, "props")
    prop_beanstalks(s, (g["bl"] + 60, 780, g["br"] - 60, 830), 10)
    # one withered vine, going up a light shaft toward the gantries
    shaft = [(CX + 240, 300), (CX + 400, 290), (CX + 400, -60), (CX + 240, -60)]
    s.fill(wp(shaft, s.rng, 3, 20, True), "#0a0f0d", .9, "geo")
    s.stroke(wp(shaft, s.rng, 3, 20, True), s.pal.rim, 2.4, .35, True, "rim")
    s.stroke(wp([(CX + 320, 820), (CX + 300, 600), (CX + 330, 380), (CX + 316, 200)],
                s.rng, 4, 20), "#4a4230", 10, 1, False, "props")
    prop_cage(s, 240, 700, 60, 130)             # the Context Cage, on its hook
    s.light(CX - 40, 940, 900, strength=.9, tint=.2)


@plate("hallucinationGallery", "The Hallucination Gallery", "marble", seed=333)
def _gallery(s):
    g = stage_chamber(s, back=(440, 240), floor_y=820, ceil_y=100, texture="courses")
    # portraits of systems that were never built, beautifully rendered
    for i in range(5):
        x = lerp(g["bl"] + 110, g["br"] - 110, i / 4)
        hw, hh = 92, 128
        q = [(x - hw, 620), (x - hw, 620 - hh * 2), (x + hw, 620 - hh * 2), (x + hw, 620)]
        _dark(s, q, ("#c9a86a", "#3a2f18"))
        _rim(s, q, .7, 3.0, "#e0c795", True)
        inner = [(x - hw + 20, 604), (x - hw + 20, 620 - hh * 2 + 20),
                 (x + hw - 20, 620 - hh * 2 + 20), (x + hw - 20, 604)]
        s.gfill(wp(inner, s.rng, 1.4, 14, True),
                s.lin([("0", "#4a5058", 1), ("1", "#12161a", 1)]), "props")
        for k in range(5):                      # a plausible architecture, in each
            yy = lerp(620 - hh * 2 + 40, 584, (k + 1) / 6)
            s.stroke(wob((x - hw + 34, yy), (x + hw - 34, yy), s.rng, 2, 14),
                     "#9fb4c2", 2.0, s.rng.uniform(.2, .5), False, "rim")
    prop_confabulator(s, CX + 40, 800, 230)     # which has never said I don't know
    s.light(CX, 900, 900, strength=.85, tint=.2)


# ===========================================================================
# HALL 5 — MISSION ENGINEERING
# ===========================================================================
@plate("missionDeck", "Mission Deck", "water", seed=341)
def _mission_deck(s):
    p = s.pal
    g = stage_chamber(s, back=(430, 260), floor_y=700, ceil_y=100, texture="courses")
    # the floor is glass, and under the glass is the world, turning
    floor = [(-80, 700), (W + 80, 680), (W + 80, H + 60), (-80, H + 60)]
    s.gfill(wp(floor, s.rng, 3, 40, True),
            s.lin([("0", "#16323a", 1), ("1", "#050b10", 1)]), "geo")
    globe = arc_pts(CX, 1180, 620, 480, math.pi, 2 * math.pi, 40)
    s.gfill(wp(globe + [(CX + 620, H + 60), (CX - 620, H + 60)], s.rng, 4, 30, True),
            s.lin([("0", "#2f6f8a", 1), ("1", "#0b2230", 1)]), "props")
    s.stroke(wp(globe, s.rng, 4, 30), "#9fd8e0", 3.0, .5, False, "rim")
    for i in range(7):                          # the mission, drawn on it in light
        a0 = math.pi * (1.05 + .12 * i)
        s.stroke(arc_pts(CX, 1180, 500 - i * 30, 400 - i * 26, a0, a0 + .5, 12),
                 "#ffd9a0", 2.6, s.rng.uniform(.3, .7), False, "rim")
    for i in range(9):                          # the glass, and its joints
        x = lerp(-40, W + 40, i / 8)
        s.line((x, 700), (x + (x - CX) * .3, H + 40), "#9fd8e0", 1.6, .18, 2.0, 44)
    _placard(s, 250, 480, 140)
    # the charter, framed by the rail
    q = [(CX + 260, 600), (CX + 264, 420), (CX + 470, 414), (CX + 474, 596)]
    _dark(s, q, ("#c9a86a", "#3a2f18"))
    s.fill(wp([(CX + 280, 584), (CX + 284, 436), (CX + 452, 430), (CX + 456, 580)],
              s.rng, 1.4, 12, True), "#e8e2d2", .92, "props")
    _scrawl(s, CX + 300, 480, 1, .55, "#3a3630", .9, 5)
    _scrawl(s, CX + 300, 530, 1, .5, "#3a3630", .8, 4)
    s.light(CX, 800, 1000, strength=.8, tint=.2)


@plate("warRoom", "The War Room", "bank", seed=342)
def _war_room(s):
    g = stage_chamber(s, back=(440, 250), floor_y=830, ceil_y=110, texture="courses")
    prop_tea_table(s, CX, 960, 400)             # a table the size of a runway
    for _ in range(26):                         # pieces that move by themselves
        x = s.rng.uniform(CX - 340, CX + 340)
        y = s.rng.uniform(800, 850)
        s.fill(wp(blob(x, y, s.rng.uniform(10, 22), s.rng, k=6, squash=.7), s.rng,
                  2, 8, True), s.rng.choice(["#c9483a", "#4f7fd0", "#d8c24a"]),
               .85, "props")
    # a fog with a budget line, and a dome at the head of the table
    _mist(s, 780, 220, 1.0, "#dfe6ea")
    dome = arc_pts(CX + 20, 700, 130, 110, math.pi, 2 * math.pi, 20)
    s.gfill(wp(dome + [(CX + 150, 720), (CX - 110, 720)], s.rng, 2, 14, True),
            s.lin([("0", "#c9d6dc", .35), ("1", "#5d6b72", .18)]), "props")
    s.stroke(wp(dome, s.rng, 2, 14), "#eaf1f5", 2.6, .55, False, "rim")
    prop_treasure_glint(s, [(CX + 20, 680)], "#ffe9b0")
    _placard(s, 250, 430, 130)
    s.light(CX, 900, 920, strength=.85, tint=.14)


@plate("groundTruthRange", "The Ground Truth Range", "canyon", seed=343)
def _range(s):
    sky(s, 300, sun=(240, 130))
    for y, c0, c1 in ((300, "#8794a0", "#66727d"), (360, "#6b7681", "#49535c"),
                      (430, "#535d66", "#333b42")):
        outdoor_band(s, y, (c0, c1), rough=26, step=90)
    s.surface([(-60, 620), (W + 60, 600), (W + 60, H + 60), (-60, H + 60)],
              ("#8d9078", "#33362a"), 6, 44)
    for i in range(7):                          # the range, and its markers
        t = (i + 1) / 8
        y = lerp(660, H, t)
        s.stroke(wob((-40, y), (W + 40, y + s.rng.uniform(-10, 10)), s.rng, 6, 44),
                 "#6b6e58", 2.0, .22, False, "detail")
        for x in (200, 860):
            s.stroke(wob((x, y), (x, y - 40 * (1 - t)), s.rng, 2, 12), "#cfd3cc",
                     3, .5, False, "rim")
    # a plain grey stone with nothing written on it
    stone = blob(CX + 30, 950, 74, s.rng, k=8, squash=.8)
    _dark(s, stone, ("#9aa0a6", "#2b3036"))
    _rim(s, [q for q in stone if q[1] <= 950], .8, 3.2, None)
    s.light(240, 200, 1500, color="#ffe9c0", strength=.75, tint=.14)


# ===========================================================================
# HALL 6 — SYSTEMS ENGINEERING
# ===========================================================================
@plate("vFoundry", "The V Foundry", "lava", seed=351)
def _foundry(s):
    g = stage_chamber(s, back=(440, 240), floor_y=820, ceil_y=-160,
                      ceiling=False, texture="chisel")
    s.screen('<rect x="0" y="0" width="%d" height="420" fill="url(#%s)"/>'
             % (W, s.lin([("0", "#ffd9a0", .5), ("1", "#ffd9a0", 0)])), .7)
    # two golden arms, cast and left in the sand, never joined
    for sgn, (x0, y0, x1, y1) in ((-1, (200, 900, 480, 640)), (1, (860, 900, 580, 640))):
        arm = [(x0, y0), (x1, y1)]
        s.stroke(wp(arm, s.rng, 3, 20), "#3a2f18", 54, 1, False, "props")
        gid = s.lin([("0", "#ffd27a", 1), ("1", "#8a6420", 1)])
        s.stroke(wp(arm, s.rng, 3, 20), "#c9a049", 40, 1, False, "props")
        s.stroke(wp([(x0, y0 - 18), (x1, y1 - 18)], s.rng, 3, 20), "#fff3c8", 5,
                 .7, False, "rim")
        for i in range(4):
            t = (i + .5) / 4
            px, py = lp((x0, y0), (x1, y1), t)
            s.ellipse(px, py, 10, 10, "#fff3c8", .5, "rim")
    for _ in range(30):                         # the sand of the casting floor
        s.ellipse(s.rng.uniform(60, 1000), s.rng.uniform(880, 1040),
                  s.rng.uniform(30, 90), s.rng.uniform(8, 20), "#8a7a5c",
                  s.rng.uniform(.15, .4), "props")
    _placard(s, CX, 340, 140)
    s.light(CX, 500, 1100, color="#ffd9a0", strength=.55, tint=.24)
    s.light(CX, 950, 820, strength=.7)


@plate("pullRequestBridge", "The Pull Request Bridge", "stone", seed=352)
def _bridge(s):
    stage_ledge(s, lip=920, far_lip=560, far_wall=300, wall_top=-20,
                depth_color="#141a1e")
    _mist(s, 740, 280, .7)
    prop_bridge(s, near=(CX, 920, 290), far=(CX + 10, 580, 118), planks=16)
    prop_troll(s, CX - 250, 990, 1.05)          # arms folded, and entirely correct
    # review comments, tied to the ropes
    for i in range(7):
        x = s.rng.uniform(CX - 160, CX + 190)
        y = s.rng.uniform(640, 860)
        q = [(x - 30, y), (x - 28, y - 26), (x + 30, y - 28), (x + 32, y - 2)]
        s.fill(wp(q, s.rng, 1.2, 8, True), "#d8d2bc", .7, "props")
    s.rocks((40, 910, 1020, 1045), 16, (12, 36))
    s.light(CX + 60, 1000, 880, strength=.95)


@plate("integrationBay", "The Integration Bay", "ice", seed=353)
def _integration(s):
    g = stage_chamber(s, back=(400, 250), floor_y=820, ceil_y=-120,
                      ceiling=False, texture="courses")
    # a gantry, and an arc of white light on it
    for x in (g["bl"] + 90, g["br"] - 90):
        s.stroke(wob((x, 820), (x, 120), s.rng, 2, 30), "#2b3d49", 24, 1, False, "props")
        s.stroke(wob((x + 9, 820), (x + 9, 120), s.rng, 2, 30), s.pal.rim, 2.4,
                 .4, False, "rim")
    s.stroke(wob((g["bl"] + 60, 150), (g["br"] - 60, 140), s.rng, 2, 30), "#2b3d49",
             22, 1, False, "props")
    ax, ay = CX, 620
    s.screen('<ellipse cx="%d" cy="%d" rx="330" ry="300" fill="url(#%s)" '
             'filter="url(#soft)"/>'
             % (ax, ay, s.rad([("0", "#ffffff", .85), ("0.3", "#bfe6ff", .5),
                               ("1", "#bfe6ff", 0)])), 1.0)
    for i in range(14):
        a = s.rng.uniform(0, math.pi * 2)
        L = s.rng.uniform(60, 260)
        s.stroke([(ax, ay), (ax + math.cos(a) * L, ay + math.sin(a) * L)], "#ffffff",
                 s.rng.uniform(1.2, 3), s.rng.uniform(.2, .7), False, "rim")
    s.ellipse(ax, ay, 40, 40, "#ffffff", 1, "rim")
    s.specks((ax - 300, ay - 260, ax + 300, ay + 300), 120, "#dff2ff", (1, 4), (.2, .8))
    s.light(ax, ay, 1000, color="#bfe6ff", strength=.5, tint=.30)
    s.light(CX, 960, 780, strength=.7)


@plate("interfaceLedge", "The Interface Ledge", "stone", seed=354)
def _ledge(s):
    stage_ledge(s, lip=840, far_lip=660, far_wall=340, wall_top=-40,
                depth_color="#141a1e")
    # a ledge of published interfaces, each one a plank you can stand on
    for i in range(6):
        y = 850 + i * 34
        s.stroke(wob((-40, y), (W + 40, y + s.rng.uniform(-8, 8)), s.rng, 3, 30),
                 "#8a7a5c", 18, .9, False, "props")
        s.stroke(wob((-40, y - 8), (W + 40, y - 8), s.rng, 3, 30), s.pal.rim, 2.0,
                 .35, False, "rim")
    # the Sealed Blob: seamless, undocumented, and shut tighter than a drum
    blob_pts = blob(CX + 40, 800, 200, s.rng, k=13, squash=.86)
    s.gfill(wp(blob_pts, s.rng, 3, 20, True),
            s.lin([("0", "#4a5058", 1), ("1", "#0b0e11", 1)]), "props")
    s.stroke(wp(blob_pts, s.rng, 3, 20, True), "#05070a", 3.4, .9, True, "props")
    _rim(s, [q for q in blob_pts if q[1] <= 790], .55, 3.2, None)
    s.light(CX - 60, 960, 880, strength=.95)


@plate("trace1", "Twisty little traces, all alike", "mine", seed=355,
       aliases=("trace2", "trace3"))
def _traces(s):
    g = stage_chamber(s, back=(250, 340), floor_y=830, ceil_y=170, texture="chisel")
    opening(s, CX - 40, 430, g["bby"] - 8, 88, "arch")
    opening(s, g["bl"] - 120, 500, 830, 92, "crawl")
    opening(s, g["br"] + 150, 470, 810, 80, "arch")
    for _ in range(40):                         # traces, going everywhere and nowhere
        x0 = s.rng.uniform(g["bl"], g["br"])
        y0 = s.rng.uniform(g["by"], g["bby"])
        s.stroke(wp([(x0, y0), (x0 + s.rng.uniform(-90, 90), y0 + s.rng.uniform(-60, 60)),
                     (x0 + s.rng.uniform(-160, 160), y0 + s.rng.uniform(-100, 100))],
                    s.rng, 3, 14), s.pal.rim, 1.6, s.rng.uniform(.08, .26), False, "rim")
    s.rocks((80, 790, 980, 1020), 14, (12, 34))
    s.light(CX - 30, 940, 860, strength=.95)


@plate("trace4", "Dead end — the Regression's Cache", "mine", seed=356)
def _cache(s):
    g = stage_chamber(s, back=(300, 320), floor_y=830, ceil_y=150, texture="chisel")
    s.cracks((g["bl"], g["by"] + 40, g["br"], g["bby"] - 30), 12, op=(.18, .42))
    # everything the Regression has ever taken, in a heap
    for _ in range(34):
        cx = s.rng.uniform(220, 840)
        cy = s.rng.uniform(870, 1030)
        rr = s.rng.uniform(18, 54)
        q = blob(cx, cy, rr, s.rng, k=7, squash=.7)
        s.gfill(wp(q, s.rng, 2, 12, True),
                s.lin([("0", s.rng.choice(["#c9a86a", "#9aa3ae", "#7fb6cc", "#c9483a"]), 1),
                       ("1", "#1a1712", 1)]), "props")
        s.stroke(wp(q[:4], s.rng, 2, 12), s.pal.accent, 2.0,
                 s.rng.uniform(.2, .6), False, "rim")
    prop_treasure_glint(s, [(400, 900), (600, 940), (720, 890)])
    s.light(CX, 950, 800, strength=.95)


# ===========================================================================
# HALL 7 — MACRO ENGINEERING
# ===========================================================================
@plate("macroGantry", "The Macro Gantry", "bank", seed=361)
def _gantry(s):
    p = s.pal
    s.add('<rect x="0" y="0" width="%d" height="%d" fill="url(#%s)"/>'
          % (W, H, s.lin([("0", p.bg[0], 1), ("0.5", p.bg[1], 1), ("1", p.bg[2], 1)])),
          "bg")
    # a scale model of a continent, complete to the level of power lines
    s.surface([(-80, 380), (W + 80, 360), (W + 80, H + 60), (-80, H + 60)],
              ("#5a6a58", "#141a14"), 6, 44)
    for i in range(9):
        y = 440 + i * 70
        s.stroke(wob((-40, y), (W + 40, y + s.rng.uniform(-16, 16)), s.rng, 8, 44),
                 "#7f8f7a", 1.8, .18, False, "detail")
    for _ in range(40):                         # cities, and the lines between them
        x, y = s.rng.uniform(0, W), s.rng.uniform(420, H)
        s.ellipse(x, y, s.rng.uniform(3, 9), s.rng.uniform(2, 5), "#ffd9a0",
                  s.rng.uniform(.3, .9), "rim")
    for _ in range(16):
        x0, y0 = s.rng.uniform(0, W), s.rng.uniform(420, H)
        s.stroke([(x0, y0), (x0 + s.rng.uniform(-200, 200), y0 + s.rng.uniform(-90, 90))],
                 "#9fd8e0", 1.2, s.rng.uniform(.1, .3), False, "rim")
    # the gantry we are standing on
    for x in (-40, W + 40):
        s.stroke(wob((x, 200), (x, H + 40), s.rng, 2, 30), "#2b3138", 30, 1, False, "props")
    s.stroke(wob((-40, 300), (W + 40, 290), s.rng, 2, 30), "#2b3138", 26, 1, False, "props")
    prop_railing(s, [(-40, 980), (CX, 960), (W + 40, 980)], height=120, posts=9)
    _placard(s, CX + 250, 640, 130)
    s.light(CX, 800, 1000, strength=.7, tint=.16)


@plate("titanScaffold", "The Titan's Scaffold", "stone", seed=362)
def _scaffold(s):
    g = stage_chamber(s, back=(430, 240), floor_y=830, ceil_y=-200,
                      ceiling=False, texture="courses")
    for x in (140, 400, 660, 920):              # scaffolding
        s.stroke(wob((x, 830), (x, -40), s.rng, 2, 30), "#4a5058", 12, 1, False, "props")
    for y in (200, 400, 600):
        s.stroke(wob((100, y), (960, y - 8), s.rng, 2, 30), "#4a5058", 10, 1, False, "props")
    # forty feet of slide rule, lying on a pad, graduated in orders of magnitude
    q = [(-40, 800), (W + 40, 780), (W + 40, 880), (-40, 900)]
    _dark(s, q, ("#c9c2a8", "#3a352a"))
    _rim(s, q[:2], .8, 3.4, None)
    for i in range(30):
        x = lerp(-20, W + 20, i / 29)
        L = 40 if i % 5 == 0 else 22
        s.stroke([(x, 800 - i * .6), (x, 800 - i * .6 + L)], "#2a251c", 2.4, .7,
                 False, "props")
    s.stroke(wob((-40, 842), (W + 40, 824), s.rng, 2, 30), "#8a7a5c", 12, .9,
             False, "props")
    # the brass scaling lever, with two positions and no labels
    s.stroke(wp([(880, 960), (900, 800), (940, 720)], s.rng, 2, 14), "#c9a86a", 16,
             1, False, "props")
    s.ellipse(944, 712, 22, 22, "#e0c795", .95, "props")
    s.ellipse(880, 962, 46, 18, "#5c4a24", .9, "props")
    s.light(CX - 60, 970, 900, strength=.92)


@plate("orbitalRing", "The Orbital Ring", "ice", seed=363)
def _orbital(s):
    p = s.pal
    s.add('<rect x="0" y="0" width="%d" height="%d" fill="url(#%s)"/>'
          % (W, H, s.lin([("0", "#04060a", 1), ("0.6", "#0a1218", 1), ("1", "#060a0e", 1)])),
          "bg")
    s.specks((0, 0, W, 700), 220, "#dff2ff", (1, 2.6), (.2, .9))
    # the curve of the planet, under your boots
    planet = arc_pts(CX, 1560, 1180, 900, math.pi * 1.12, math.pi * 1.88, 40)
    s.gfill(wp(planet + [(W + 80, H + 60), (-80, H + 60)], s.rng, 4, 30, True),
            s.lin([("0", "#2f6f8a", 1), ("1", "#08131c", 1)]), "geo")
    s.stroke(wp(planet, s.rng, 4, 30), "#9fd8e0", 4.0, .7, False, "rim")
    s.screen('<ellipse cx="%d" cy="700" rx="700" ry="180" fill="url(#%s)" '
             'filter="url(#soft)"/>'
             % (CX, s.rad([("0", "#bfe6ff", .45), ("1", "#bfe6ff", 0)])), .9)
    # the ring itself, seen edge-on
    for dy, op in ((0, .9), (26, .5)):
        s.stroke([(-60, 660 + dy), (CX, 620 + dy), (W + 60, 660 + dy)], "#a9c8da",
                 14 - dy * .2, op, False, "props")
        s.stroke([(-60, 654 + dy), (CX, 614 + dy), (W + 60, 654 + dy)], "#ffffff",
                 3, op * .6, False, "rim")
    # a plinth, because there was nowhere else grand enough
    plinth = [(CX - 90, 900), (CX - 70, 780), (CX + 70, 780), (CX + 90, 900)]
    _dark(s, plinth, ("#8fb2c6", "#1d2b34"))
    _rim(s, plinth, .8, 3.0, None, True)
    # the first one, the one that worked, blown in a single piece
    gq = [(CX - 46, 780), (CX - 58, 700), (CX - 24, 640), (CX + 24, 640),
          (CX + 58, 700), (CX + 46, 780)]
    s.gfill(wp(gq, s.rng, 1.6, 12, True),
            s.lin([("0", "#eaf6ff", .8), ("1", "#5d8a9c", .55)]), "props")
    _rim(s, gq, 1.0, 2.6, "#ffffff", True)
    prop_treasure_glint(s, [(CX, 700)], "#dff2ff")
    s.light(CX, 720, 900, color="#bfe6ff", strength=.5, tint=.24)


# ===========================================================================
# ACT III — THE DEEP STACK
# ===========================================================================
@plate("spiralStair", "The Spiral Stair", "mine", seed=401)
def _spiral(s):
    g = stage_chamber(s, back=(300, 200), floor_y=840, ceil_y=-260,
                      ceiling=False, texture="chisel")
    # cast iron, going down through the floor of the world
    for i in range(11):
        t = i / 10
        y = lerp(180, 940, t)
        hw = lerp(90, 260, t)
        a = math.pi * 2 * t * 1.3
        cx = CX + math.cos(a) * 90
        q = [(cx - hw, y), (cx + hw, y - 14), (cx + hw * .9, y + 26), (cx - hw * .9, y + 40)]
        _dark(s, q, ("#6d6355", "#100d0b"))
        _rim(s, q[:2], .55, 2.6, None)
    s.stroke(wp([(CX, -40), (CX + 20, 400), (CX - 10, 940)], s.rng, 3, 24), "#2a2622",
             26, 1, False, "props")
    # the handrail: missing in places, and very recently put back in others
    for i in range(5):
        y = 260 + i * 150
        if i == 2:
            continue
        s.stroke(wp([(CX - 220, y), (CX + 200, y - 40)], s.rng, 3, 18), "#4a4238",
                 8, .9, False, "props")
        s.stroke(wp([(CX - 220, y - 6), (CX + 200, y - 46)], s.rng, 3, 18),
                 s.pal.rim, 2.0, .35, False, "rim")
    s.light(CX, 960, 820, strength=.9)


@plate("rootCellar", "The Root Cellar", "earth", seed=402)
def _root_cellar(s):
    g = stage_chamber(s, back=(430, 300), floor_y=810, ceil_y=140, texture="chisel")
    # where all of it comes down to conduit and root
    for _ in range(26):
        x0 = s.rng.uniform(-40, W + 40)
        s.stroke(wp([(x0, 140), (x0 + s.rng.uniform(-60, 60), 400),
                     (x0 + s.rng.uniform(-120, 120), 700),
                     (x0 + s.rng.uniform(-60, 60), 830)], s.rng, 4, 24),
                 "#2a2118", s.rng.uniform(8, 26), .95, False, "props")
        s.stroke(wp([(x0 + 6, 140), (x0 + 6, 400)], s.rng, 4, 24), s.pal.rim, 1.8,
                 s.rng.uniform(.1, .3), False, "rim")
    for _ in range(16):                         # and conduit, and cable tray
        y = s.rng.uniform(300, 700)
        s.stroke(wob((-40, y), (W + 40, y + s.rng.uniform(-30, 30)), s.rng, 3, 30),
                 "#3a4048", s.rng.uniform(9, 20), .9, False, "props")
    for d in (('bl', 'crawl'), ('br', 'arch')):
        pass
    opening(s, g["bl"] - 150, 500, 810, 100, "arch")
    opening(s, g["br"] + 150, 500, 810, 100, "arch")
    s.rocks((60, 820, 1000, 1045), 18, (10, 30))
    s.light(CX, 950, 900, strength=.95)


@plate("tokenFountain", "The Token Fountain", "ice", seed=403)
def _fountain(s):
    g = stage_chamber(s, back=(380, 280), floor_y=820, ceil_y=-160,
                      ceiling=False, texture="courses")
    # light pouring in from a source only ever described in the singular
    s.stroke(wp([(CX, -40), (CX + 14, 300), (CX - 6, 560)], s.rng, 4, 26), "#dff2ff",
             34, .55, False, "props")
    s.screen('<ellipse cx="%d" cy="360" rx="200" ry="440" fill="url(#%s)" '
             'filter="url(#soft)"/>'
             % (CX, s.rad([("0", "#bfe6ff", .55), ("1", "#bfe6ff", 0)])), .95)
    basin = arc_pts(CX, 700, 330, 130, 0, math.pi * 2, 40)
    s.gfill(wp(basin, s.rng, 3, 24, True),
            s.lin([("0", "#a9c8da", 1), ("1", "#1d2b34", 1)]), "props")
    s.stroke(wp(basin, s.rng, 3, 24, True), "#0a1218", 3.0, .8, True, "props")
    inner = arc_pts(CX, 700, 270, 100, 0, math.pi * 2, 40)
    s.gfill(wp(inner, s.rng, 3, 20, True),
            s.lin([("0", "#eaf6ff", .9), ("1", "#6f9cb0", .8)]), "props")
    for i in range(9):
        s.stroke(arc_pts(CX, 700, 60 + i * 24, 22 + i * 9, s.rng.uniform(0, 3),
                         s.rng.uniform(3.4, 6.3), 18), "#ffffff", 2.4 - i * .16,
                 .5 - i * .04, False, "rim")
    s.specks((CX - 340, 560, CX + 340, 800), 90, "#ffffff", (1, 3.4), (.2, .8))
    # a scuffed flask, chained to the rim, long enough to reach the water
    s.ellipse(CX + 300, 740, 30, 44, "#4a5058", .95, "props")
    prop_chain(s, CX + 320, 700, 780, 6, 9)
    s.light(CX, 620, 1000, color="#bfe6ff", strength=.55, tint=.28)
    s.light(CX, 960, 760, strength=.6)


@plate("sandbox", "The Sandbox", "bank", seed=404)
def _sandbox(s):
    g = stage_chamber(s, back=(430, 260), floor_y=820, ceil_y=100, texture="courses")
    # padded, white, and nothing that happens here has ever happened
    for row in range(6):
        for col in range(8):
            x = lerp(-40, W + 40, (col + .5) / 8)
            y = lerp(140, 820, (row + .5) / 6)
            q = blob(x, y, 78, s.rng, k=8, squash=.68)
            s.gfill(wp(q, s.rng, 3, 14, True),
                    s.lin([("0", "#e2e6ea", 1), ("1", "#8f98a2", 1)]), "props")
            s.stroke(wp(q, s.rng, 3, 14, True), "#6b747d", 2.0, .5, True, "props")
    prop_bot(s, CX + 190, 1000, 1.0, chained=True)   # patient, enormous, hungry
    s.light(CX - 100, 960, 900, strength=.85, tint=.10)


@plate("serviceShaft", "The Service Shaft", "mine", seed=405)
def _shaft(s):
    g = stage_chamber(s, back=(260, 200), floor_y=850, ceil_y=-300,
                      ceiling=False, texture="chisel")
    prop_ladder(s, CX - 190, -40, 900, 52, 16)
    for i in range(10):                         # cable trays, going down out of it
        y = lerp(-20, 860, i / 9)
        s.stroke(wob((CX + 90, y), (W + 40, y + 30), s.rng, 2, 24), "#3a4048", 16,
                 .95, False, "props")
        s.stroke(wob((CX + 90, y - 5), (W + 40, y + 25), s.rng, 2, 24), s.pal.rim,
                 1.6, .25, False, "rim")
    _hole(s, CX + 30, 960, 190, .44)
    # the hatch, with the padlock on this side of it
    q = [(CX - 60, 1000), (CX - 50, 880), (CX + 130, 872), (CX + 136, 996)]
    _dark(s, q, ("#7c848c", "#191d21"))
    _rim(s, q, .7, 3.0, None, True)
    s.ellipse(CX + 40, 934, 20, 24, "#c9a86a", .9, "props")
    s.light(CX - 40, 980, 800, strength=.9)


@plate("landing", "The Telemetry Landing", "water", seed=406)
def _landing(s):
    stage_water(s, shore_y=880, far_y=560, wall_top=100, flow=1.1)
    s.surface([(-60, 900), (W + 60, 880), (W + 60, H + 60), (-60, H + 60)],
              ("#6b5a3e", "#1c1710"), 5, 44)
    for i in range(9):                          # a timber landing
        y = 910 + i * 26
        s.stroke(wob((-40, y), (W + 40, y + s.rng.uniform(-6, 6)), s.rng, 3, 30),
                 "#4a3c28", 16, .9, False, "props")
        s.stroke(wob((-40, y - 7), (W + 40, y - 7), s.rng, 3, 30), s.pal.rim, 1.8,
                 .3, False, "rim")
    for x in (140, 900):                        # bollards, and a coil of rope
        q = [(x - 30, 940), (x - 24, 850), (x + 24, 850), (x + 30, 940)]
        _dark(s, q, ("#6b5a3e", "#150f08"))
        _rim(s, q, .6, 2.4, None, True)
    prop_sternwheeler(s, CX + 40, 830, 330)     # Commander Alexander, tied up
    _mist(s, 640, 220, .5)
    s.light(CX + 40, 700, 1000, color="#ffdca8", strength=.6, tint=.20)
    s.light(CX, 980, 780, strength=.7, tint=.14)


@plate("legacyPit", "The Legacy Serpent Pit", "moss", seed=407)
def _legacy_pit(s):
    g = stage_chamber(s, back=(400, 300), floor_y=800, ceil_y=140, texture="chisel")
    _hole(s, CX + 40, 960, 250, .42)            # the only way down
    prop_snake(s, CX + 60, 900, 1.25)           # undocumented, unmaintained, load-bearing
    for _ in range(20):                         # and still running
        x = s.rng.uniform(g["bl"], g["br"])
        y = s.rng.uniform(700, 860)
        s.ellipse(x, y, s.rng.uniform(3, 7), s.rng.uniform(3, 7), "#7fd8b6",
                  s.rng.uniform(.2, .7), "rim")
    opening(s, g["bl"] - 150, 480, 800, 100, "arch")
    opening(s, g["br"] + 150, 480, 800, 100, "arch")
    s.light(CX - 120, 950, 880, strength=.92, tint=.18)


@plate("incidentRoom", "The Incident Room", "mine", seed=408)
def _incident(s):
    g = stage_chamber(s, back=(430, 250), floor_y=820, ceil_y=120, texture="courses")
    # a whiteboard nobody has wiped in eleven years, with the timeline still on it
    q = [(g["bl"] + 70, 620), (g["bl"] + 76, 300), (g["bl"] + 500, 292),
         (g["bl"] + 504, 616)]
    s.fill(wp(q, s.rng, 1.6, 16, True), "#d8d8d0", .9, "props")
    _rim(s, q, .7, 2.6, None, True)
    s.stroke(wp([(g["bl"] + 100, 420), (g["bl"] + 470, 410)], s.rng, 3, 20),
             "#3a4048", 4, .8, False, "props")
    for i in range(6):
        x = lerp(g["bl"] + 110, g["bl"] + 460, i / 5)
        s.stroke([(x, 400), (x, 440)], "#c9483a", 3.4, .8, False, "props")
        _scrawl(s, x - 14, 470 + (i % 2) * 34, 1, .34, "#3a4048", .8, 2)
    _scrawl(s, g["bl"] + 110, 340, 2, .5, "#c9483a", .85, 4)
    prop_table(s, CX + 120, 900, 300, 120, ("#5a4a3a", "#1a120c"))
    for dx in (-200, -60, 90, 230):             # eleven chairs, and nobody in them
        q = [(CX + 120 + dx - 34, 960), (CX + 120 + dx - 28, 850),
             (CX + 120 + dx + 28, 850), (CX + 120 + dx + 34, 960)]
        _dark(s, q, ("#3a4048", "#0b0e11"))
        _rim(s, q[1:3], .35, 2.0, None)
    prop_dannet(s, CX - 60, 830, .70)           # arguing with itself, at a walking pace
    s.light(CX - 40, 950, 880, strength=.92)


@plate("shrine", "The Shrine of the Model", "temple", seed=409)
def _shrine(s):
    g = stage_chamber(s, back=(470, 200), floor_y=830, ceil_y=-60, texture="courses")
    # a face of light, composed entirely of everything anyone has ever written down
    face = blob(CX, 480, 420, s.rng, k=15, squash=.92)
    s.gfill(wp(face, s.rng, 6, 22, True),
            s.lin([("0", "#fff3d0", 1), ("0.6", "#e0c795", 1), ("1", "#7a6540", 1)]),
            "props")
    s.screen('<ellipse cx="%d" cy="480" rx="620" ry="560" fill="url(#%s)" '
             'filter="url(#soft2)"/>'
             % (CX, s.rad([("0", "#ffe9bf", .7), ("1", "#ffe9bf", 0)])), 1.0)
    for _ in range(120):                        # made of writing, all the way down
        x = s.rng.uniform(CX - 380, CX + 380)
        y = s.rng.uniform(180, 780)
        if (x - CX) ** 2 / 400 ** 2 + (y - 480) ** 2 / 380 ** 2 > 1:
            continue
        s.stroke([(x, y), (x + s.rng.uniform(20, 70), y)], "#8a7040",
                 s.rng.uniform(1.2, 3), s.rng.uniform(.15, .5), False, "detail")
    for ex in (-140, 140):                      # and serene about it
        s.ellipse(CX + ex, 420, 46, 30, "#fffaf0", .8, "rim")
        s.ellipse(CX + ex, 420, 18, 18, "#7a6540", .9, "props")
    s.stroke(arc_pts(CX, 560, 150, 60, .3, math.pi - .3, 16), "#7a6540", 5, .5,
             False, "detail")
    prop_candles(s, CX - 300, 940, 1.6)
    prop_candles(s, CX + 300, 940, 1.6)
    s.light(CX, 480, 1200, color="#ffe9bf", strength=.5, tint=.30)
    s.light(CX, 960, 760, strength=.6, tint=.16)


@plate("visionPool", "The Vision Pool", "water", seed=410)
def _vision_pool(s):
    g = stage_chamber(s, back=(430, 260), floor_y=760, ceil_y=100, texture="chisel")
    # a pool with no inflow
    pool = arc_pts(CX + 40, 900, 400, 180, 0, math.pi * 2, 44)
    s.gfill(wp(pool, s.rng, 4, 26, True),
            s.lin([("0", "#2f6f8a", 1), ("1", "#06131a", 1)]), "props")
    s.stroke(wp(pool, s.rng, 4, 26, True), "#9fd8e0", 3.0, .55, True, "rim")
    s.screen('<ellipse cx="%d" cy="900" rx="420" ry="200" fill="url(#%s)" '
             'filter="url(#soft)"/>'
             % (CX + 40, s.rad([("0", "#bfe6ff", .3), ("1", "#bfe6ff", 0)])), .85)
    for i in range(7):
        s.stroke(arc_pts(CX + 40, 900, 90 + i * 44, 40 + i * 20, s.rng.uniform(0, 3),
                         s.rng.uniform(3.4, 6.3), 20), "#dff2ff", 2.0, .3 - i * .03,
                 False, "rim")
    # Prophet Katie, both hands in the water up to the wrist, looking at the ceiling
    prop_figure(s, CX - 300, 930, 420, ("#5d6670", "#0d1013"), .85, pose="kneel")
    s.stroke(wp([(CX - 210, 800), (CX - 110, 860), (CX - 30, 892)], s.rng, 2, 12),
             "#5d6670", 26, 1, False, "props")
    s.stroke(wp([(CX - 210, 794), (CX - 110, 854), (CX - 30, 886)], s.rng, 2, 12),
             s.pal.rim, 3.0, .6, False, "rim")
    s.light(CX + 40, 880, 1000, color="#bfe6ff", strength=.5, tint=.22)
    s.light(CX - 200, 860, 700, strength=.6, tint=.12)


@plate("chapel", "The Chapel of the Nightly Build", "bank", seed=411)
def _chapel(s):
    g = stage_interior(s, wall_y=(150, 720), back_half=440)
    s.dark_floor = .72
    # a board on the wall where the results go up at 04:00, green for six weeks
    q = [(CX - 230, 560), (CX - 226, 300), (CX + 230, 294), (CX + 234, 554)]
    _dark(s, q, ("#3a4048", "#0b0e11"))
    _rim(s, q, .7, 2.8, None, True)
    for row in range(6):
        for col in range(7):
            x = lerp(CX - 200, CX + 200, (col + .5) / 7)
            y = lerp(330, 520, (row + .5) / 6)
            s.ellipse(x, y, 18, 12, "#4fbf6a", .85, "props")
            s.screen('<ellipse cx="%.0f" cy="%.0f" rx="26" ry="18" fill="%s" '
                     'filter="url(#soft3)"/>' % (x, y, "#4fbf6a"), .5)
    s.screen('<ellipse cx="%d" cy="430" rx="420" ry="260" fill="url(#%s)" '
             'filter="url(#soft)"/>'
             % (CX, s.rad([("0", "#4fbf6a", .30), ("1", "#4fbf6a", 0)])), .85)
    for row in range(3):                        # nine chairs
        for col in range(3):
            x = lerp(CX - 300, CX + 300, (col + .5) / 3)
            y = 780 + row * 90
            q = [(x - 44, y + 60), (x - 38, y - 40), (x + 38, y - 40), (x + 44, y + 60)]
            _dark(s, q, ("#8a8272", "#241f18"))
            _rim(s, q[1:3], .4, 2.2, None)
    # Saint Mark, in the back row, feet up, eating somebody else's lunch
    prop_figure(s, CX + 300, 980, 420, ("#4e4840", "#0a0908"), .85, pose="sit")
    s.light(CX, 430, 900, color="#9fe8c0", strength=.45, tint=.20)
    s.light(CX, 950, 800, strength=.7, tint=.12)


@plate("monolith", "The Monolith", "mine", seed=412)
def _monolith(s):
    p = s.pal
    s.add('<rect x="0" y="0" width="%d" height="%d" fill="url(#%s)"/>'
          % (W, H, s.lin([("0", "#07070a", 1), ("0.5", "#0e0d10", 1), ("1", "#050506", 1)])),
          "bg")
    s.surface([(-80, 860), (W + 80, 840), (W + 80, H + 60), (-80, H + 60)],
              (p.ground[0], p.ink), 5, 44)
    # a single black slab, up out of the floor and through every floor above this
    slab = [(CX - 210, 900), (CX - 190, -60), (CX + 190, -60), (CX + 210, 900)]
    s.gfill(wp(slab, s.rng, 3, 30, True),
            s.lin([("0", "#15161a", 1), ("1", "#020203", 1)], "0%", "0%", "100%", "0%"),
            "props")
    s.stroke(wp(slab, s.rng, 3, 30, True), "#000", 5, 1, True, "props")
    s.stroke(wp([slab[0], slab[1]], s.rng, 3, 30), "#6d6355", 3.0, .5, False, "rim")
    for i in range(9):                          # the dark here has a grain to it
        x = lerp(CX - 190, CX + 190, (i + .5) / 9)
        s.line((x, -40), (x + s.rng.uniform(-10, 10), 890), "#26241f",
               s.rng.uniform(1.4, 3), s.rng.uniform(.2, .5), 2.0, 44)
    for _ in range(18):                         # everything is bolted to it
        y = s.rng.uniform(120, 860)
        sgn = s.rng.choice((-1, 1))
        s.stroke(wob((CX + sgn * 200, y), (CX + sgn * 480, y + s.rng.uniform(-40, 40)),
                     s.rng, 2, 20), "#3a3630", s.rng.uniform(8, 18), .9, False, "props")
        s.ellipse(CX + sgn * 210, y, 12, 12, "#6d6355", .7, "rim")
    s.light(CX - 60, 980, 820, strength=.9)


# ===========================================================================
# ACT IV — THE RELEASE CANDIDATE
# ===========================================================================
@plate("rcAtrium", "The Release Candidate", "ice", seed=501)
def _rc_atrium(s):
    p = s.pal
    g = stage_chamber(s, back=(470, 250), floor_y=820, ceil_y=-300,
                      ceiling=False, texture="courses")
    dome = arc_pts(CX, 330, 720, 360, math.pi, 2 * math.pi, 34)
    s.surface([(-80, -60), (W + 80, -60)] + dome[::-1],
              (p.rock_far[1], p.rock_far[0]), 4, 40)
    prop_arch_ring(s, cy=470, n=7, rr=520)
    # sealed and perfect, with nothing in it that moves, and no stair in the floor
    ring = arc_pts(CX, 940, 330, 120, 0, 2 * math.pi, 40)
    s.gfill(wp(ring, s.rng, 3, 24, True),
            s.lin([("0", "#a9c8da", 1), ("1", "#1d2b34", 1)]), "props")
    s.stroke(wp(ring, s.rng, 3, 24, True), "#0a1218", 3.0, .8, True, "props")
    for i in range(9):                          # the mirroring: everything doubled
        x = lerp(-40, W + 40, i / 8)
        s.line((x, 830), (x, H + 40), "#bfe6ff", 1.4, .12, 1.2, 44)
    s.screen('<rect x="0" y="820" width="%d" height="%d" fill="url(#%s)"/>'
             % (W, H - 820, s.lin([("0", "#bfe6ff", .22), ("1", "#bfe6ff", 0)])), .8)
    s.light(CX, 620, 1100, color="#bfe6ff", strength=.45, tint=.24)


@plate("boardroom", "The Boardroom at the End of the Sprint", "ice", seed=502)
def _boardroom(s):
    g = stage_chamber(s, back=(440, 230), floor_y=830, ceil_y=100, texture="courses")
    # a room built entirely for one side of a table to be longer than the other
    table = [(-120, H + 60), (200, 700), (860, 690), (W + 120, H + 60)]
    s.gfill(wp(table, s.rng, 3, 30, True),
            s.lin([("0", "#3a4048", 1), ("1", "#0b0e11", 1)]), "props")
    s.stroke(wp(table[1:3], s.rng, 3, 30), s.pal.rim, 3.4, .6, False, "rim")
    for i in range(5):                          # chairs down the long side
        x = lerp(60, 980, (i + .5) / 5)
        q = [(x - 40, 980 - i * 4), (x - 34, 850), (x + 34, 850), (x + 40, 980 - i * 4)]
        _dark(s, q, ("#2b3138", "#080a0c"))
        _rim(s, q[1:3], .3, 2.0, None)
    # the last slide, which has been the last slide for some time
    q = [(CX - 300, 560), (CX - 296, 300), (CX + 300, 294), (CX + 304, 556)]
    s.gfill(wp(q, s.rng, 1.6, 16, True),
            s.lin([("0", "#dfe8ee", .9), ("1", "#8fa8b4", .8)]), "props")
    _rim(s, q, .7, 2.6, None, True)
    _scrawl(s, CX - 250, 380, 3, .55, "#3a4048", .7, 4)
    _scrawl(s, CX - 250, 460, 2, .5, "#3a4048", .6, 5)
    prop_paper_man(s, CX + 40, 860, 1.55, faces=3)  # he has a set of them
    s.light(CX, 430, 900, color="#dfe8ee", strength=.45, tint=.18)
    s.light(CX, 950, 800, strength=.65, tint=.12)


@plate("rcMonolith", "The Monolith, Mirrored", "ice", seed=503)
def _rc_monolith(s):
    p = s.pal
    s.add('<rect x="0" y="0" width="%d" height="%d" fill="url(#%s)"/>'
          % (W, H, s.lin([("0", "#0a1218", 1), ("0.5", "#0f1a22", 1), ("1", "#070d12", 1)])),
          "bg")
    s.surface([(-80, 860), (W + 80, 840), (W + 80, H + 60), (-80, H + 60)],
              ("#8fb2c6", "#1d2b34"), 5, 44)
    slab = [(CX - 210, 900), (CX - 190, -60), (CX + 190, -60), (CX + 210, 900)]
    s.gfill(wp(slab, s.rng, 3, 30, True),
            s.lin([("0", "#1a1c20", 1), ("1", "#030405", 1)], "0%", "0%", "100%", "0%"),
            "props")
    s.stroke(wp(slab, s.rng, 3, 30, True), "#000", 5, 1, True, "props")
    s.stroke(wp([slab[0], slab[1]], s.rng, 3, 30), "#a9c8da", 3.4, .6, False, "rim")
    # its reflection in the floor, which is the tell: this one is the original
    s.gfill(wp([(CX - 210, 900), (CX - 230, H + 60), (CX + 230, H + 60), (CX + 210, 900)],
               s.rng, 3, 24, True),
            s.lin([("0", "#1a1c20", .7), ("1", "#0a1218", 0)]), "props")
    for _ in range(14):
        y = s.rng.uniform(120, 860)
        sgn = s.rng.choice((-1, 1))
        s.stroke(wob((CX + sgn * 200, y), (CX + sgn * 460, y + s.rng.uniform(-40, 40)),
                     s.rng, 2, 20), "#3a4650", s.rng.uniform(8, 18), .9, False, "props")
    s.light(CX - 60, 980, 860, color="#bfe6ff", strength=.7, tint=.18)


@plate("rcBalcony", "The Last Balcony", "ice", seed=504)
def _rc_balcony(s):
    g = stage_chamber(s, back=(460, 220), floor_y=830, ceil_y=120, texture="courses")
    prop_screens(s, 250, 640, 7, tone="#1c242a")     # nothing on the dashboards
    prop_railing(s, [(-40, 900), (CX, 880), (W + 40, 900)], height=120, posts=9)
    s.fill([(-60, 900), (W + 60, 880), (W + 60, H + 60), (-60, H + 60)], "#060a0e",
           .95, "geo")
    # the whole length of the monolith, going down through the floors
    slab = [(CX - 90, 900), (CX - 74, 250), (CX + 74, 250), (CX + 90, 900)]
    s.gfill(wp(slab, s.rng, 3, 26, True),
            s.lin([("0", "#15181c", 1), ("1", "#020304", 1)], "0%", "0%", "100%", "0%"),
            "props")
    s.stroke(wp([slab[0], slab[1]], s.rng, 3, 26), "#a9c8da", 2.6, .45, False, "rim")
    for i in range(9):                          # floor after floor of it
        y = 300 + i * 66
        s.stroke(wob((CX - 300, y), (CX + 300, y - 6), s.rng, 2, 24), "#2b3d49", 6,
                 .7, False, "props")
    s.light(CX, 700, 900, color="#bfe6ff", strength=.45, tint=.20)
    s.light(CX, 950, 700, strength=.55)


# ===========================================================================
# ACT I — THE FOREST, THE REST OF IT
# ===========================================================================
@plate("programBoneyard", "The Program Boneyard", "day", seed=601)
def _boneyard(s):
    stage_outdoor(s, horizon=530, sun=(770, 170),
                  bands=((0, "#8d9d78", "#68794f"), (46, "#586845", "#39462c")))
    prop_forest_band(s, 588, 11, (180, 300), tone="#22301c", rim_op=.05, spread=115)
    for i in range(5):                          # five, in the order they were cancelled
        x, y = 130 + i * 200, 770 + i * 34
        hw = 74 + i * 14
        body = [(x - hw, y + 78), (x - hw * .84, y - 46 - i * 14),
                (x + hw * .84, y - 58 - i * 16), (x + hw, y + 78)]
        s.gfill(wp(body, s.rng, 4, 18, True),
                s.lin([("0", "#6e6a5c", 1), ("1", "#241f18", 1)]), "props")
        s.stroke(wp(body, s.rng, 4, 18, True), "#141210", 3.0, .85, True, "props")
        _rim(s, body[1:3], .45, 2.6, None)
        for k in range(i + 1):                  # each one further through than the last
            s.stroke(wob((x - hw * .66, y - 16 + k * 20), (x + hw * .66, y - 24 + k * 20),
                         s.rng, 2, 14), "#8a5230", 5, .5, False, "rim")
        s.stroke(wob((x - hw * .5, y + 78), (x + hw * .5, y + 78), s.rng, 2, 12),
                 "#2a2620", 10, .5, False, "props")
    for i in range(11):                         # the fence, and the tidy thing
        fx = lerp(-20, W + 20, i / 10)
        s.stroke(wob((fx, 700), (fx, 620), s.rng, 1.6, 14), "#3f4238", 5, .8, False, "props")
    s.stroke(wob((-20, 632), (W + 20, 626), s.rng, 2, 30), "#3f4238", 4, .7, False, "props")
    for i in range(6):                          # nameplates, unscrewed and stacked
        q = [(760, 700 - i * 13), (760, 686 - i * 13), (900, 682 - i * 13), (900, 696 - i * 13)]
        s.fill(wp(q, s.rng, 1.2, 10, True), "#c8c2ac", .9, "props")
        _rim(s, q[1:3], .4, 1.8, None)
    s.light(770, 170, 1600, color="#fff3d0", strength=.82, tint=.16)


@plate("antennaFarm", "The Antenna Farm", "day", seed=602)
def _antenna_farm(s):
    stage_outdoor(s, horizon=480, sun=(300, 150),
                  bands=((0, "#93a37e", "#6c7d54"), (54, "#5c6c46", "#3b4830")))
    prop_forest_band(s, 566, 9, (150, 250), tone="#22301c", rim_op=.05, spread=130)
    cloud = (272, 118)                          # the same patch, every one of them
    s.screen('<ellipse cx="272" cy="118" rx="230" ry="90" fill="url(#%s)" '
             'filter="url(#soft)"/>'
             % s.rad([("0", "#ffffff", .55), ("1", "#ffffff", 0)]), .9)
    for x, sc, base in ((90, .48, 790), (280, .72, 840), (540, 1.0, 900),
                        (790, .68, 850), (1000, .46, 800)):
        top = base - 330 * sc
        s.stroke(wob((x, base), (x, top), s.rng, 2, 26), "#2f3a3a", 9 * sc, 1,
                 False, "props")
        for k, side in enumerate((-1, 1, -1)):  # guys, all of them still tight
            s.stroke(wob((x, top + 40 * k), (x + side * (90 + 60 * k), base),
                         s.rng, 2, 22), "#2f3a3a", 1.8, .45, False, "props")
        a = math.atan2(cloud[1] - top, cloud[0] - x)
        rr = 96 * sc
        cup = arc_pts(x, top, rr, rr * .9, a - 1.45, a + 1.45, 18)
        s.gfill(wp(cup + [(x, top)], s.rng, 2, 12, True),
                s.lin([("0", "#d3d7d0", 1), ("1", "#4e5551", 1)]), "props")
        s.stroke(wp(cup, s.rng, 2, 12), "#eef2ec", 2.6, .5, False, "rim")
        s.stroke(wp([(x, top), (x + math.cos(a) * rr * .8, top + math.sin(a) * rr * .8)],
                    s.rng, 1.6, 10), "#2f3a3a", 4 * sc, .9, False, "props")
        s.ellipse(x + math.cos(a) * rr * .8, top + math.sin(a) * rr * .8, 7, 7,
                  "#ffe9c0", .7, "rim")
    s.specks((60, 100, 1000, 620), 70, "#e8f2f6", (1.0, 2.6), (.10, .34))
    s.light(300, 150, 1500, color="#fff3d0", strength=.8, tint=.16)


@plate("surveyorsStake", "The Surveyor's Stake", "day", seed=603)
def _stake(s):
    stage_outdoor(s, horizon=430, sun=(830, 150),
                  bands=((0, "#8fa07a", "#6a7b52"), (58, "#586845", "#39462c")))
    prop_forest_band(s, 508, 12, (200, 330), tone="#22301c", rim_op=.05, spread=120)
    # the platform's shadow, lying over all of it from four thousand feet up
    s.ellipse(CX - 60, 780, 640, 210, "#1b2418", .34, "geo", blur="soft2")
    plug = [(CX - 216, 1010), (CX - 172, 806), (CX + 176, 798), (CX + 220, 1002)]
    s.gfill(wp(plug, s.rng, 4, 18, True),
            s.lin([("0", "#bcb9ab", 1), ("1", "#3c3b34", 1)]), "props")
    s.stroke(wp(plug, s.rng, 4, 18, True), "#141513", 3.2, .8, True, "props")
    disc = arc_pts(CX + 4, 826, 148, 52, 0, 2 * math.pi, 40)
    s.gfill(wp(disc, s.rng, 2, 16, True),
            s.lin([("0", "#e6c87e", 1), ("1", "#6b5322", 1)]), "props")
    s.stroke(wp(disc, s.rng, 2, 16, True), "#2a2118", 3.0, .85, True, "props")
    s.stroke(arc_pts(CX + 4, 826, 112, 38, 0, 2 * math.pi, 30), "#3a2f18", 1.8,
             .6, True, "props")
    _scrawl(s, CX - 92, 812, 1, .46, "#3a2f18", .85, 5)   # an elevation
    _scrawl(s, CX - 66, 844, 1, .38, "#3a2f18", .7, 4)    # and a date from before
    s.stroke(wp([(CX + 4, 806), (CX + 4, 846)], s.rng, 1, 8), "#3a2f18", 2.2, .7,
             False, "props")
    s.stroke(wp([(CX - 16, 826), (CX + 24, 826)], s.rng, 1, 8), "#3a2f18", 2.2, .7,
             False, "props")
    s.rocks((40, 900, 1020, 1045), 14, (8, 22), rim_op=(.06, .18))
    s.light(830, 150, 1500, color="#fff3d0", strength=.8, tint=.16)


@plate("fireRoad", "The Fire Road", "day", seed=604)
def _fire_road(s):
    stage_outdoor(s, horizon=560, sun=(560, 150),
                  bands=((0, "#8a9a76", "#65764e"), (44, "#54644160"[:7], "#374429")))
    # a straight cut, graded once, running from nothing to nothing
    prop_forest_band(s, 600, 10, (240, 380), tone="#1e2b18", rim_op=.05, spread=68)
    for sgn in (-1, 1):
        wall = [(CX + sgn * 120, 596), (CX + sgn * 470, 820), (CX + sgn * 900, H + 60),
                (CX + sgn * 1200, H + 60), (CX + sgn * 1200, 560)]
        s.fill(wp(wall, s.rng, 6, 30, True), "#1a2614", .92, "geo")
    prop_forest_band(s, 700, 7, (300, 460), tone="#141f0e", rim_op=.04, spread=150)
    prop_path(s, near=(CX, H + 40, 300), far=(CX, 600, 26), tone="#a49a80")
    for i in range(9):                          # the grader's ruts, and nothing in them
        t = (i + 1) / 10
        y = lerp(620, H + 20, t ** 1.8)
        hw = lerp(30, 300, t ** 1.8)
        for sgn in (-1, 1):
            s.stroke(wob((CX + sgn * hw * .42, y), (CX + sgn * hw * .5, y + 40),
                         s.rng, 3, 20), "#7d7460", 3.0, .22 + .2 * t, False, "detail")
    s.screen('<rect x="0" y="480" width="%d" height="240" fill="url(#%s)"/>'
             % (W, s.lin([("0", "#dfe7dd", 0), ("0.5", "#dfe7dd", .5),
                          ("1", "#dfe7dd", 0)])), .30)
    s.light(560, 200, 1500, color="#fff3d0", strength=.78, tint=.16)


@plate("culvertMouth", "The Culvert Mouth", "water", seed=605)
def _culvert(s):
    sky(s, 210, sun=(880, 120))
    prop_cliffs(s, y_top=80, y_base=560, tone=("#83907a", "#333b2c"))
    # the hillside, with a concrete throat in it
    s.surface([(-60, 430), (240, 470), (CX, 520), (820, 470), (W + 60, 420),
               (W + 60, 900), (-60, 900)], ("#6f7a62", "#252c1f"), 7, 40)
    portal = [(CX - 250, 880), (CX - 236, 700)] + \
        arc_pts(CX, 700, 236, 210, math.pi, 2 * math.pi, 20) + [(CX + 250, 880)]
    s.gfill(wp(portal, s.rng, 3, 20, True),
            s.lin([("0", "#b4b2a4", 1), ("1", "#3e3f3a", 1)]), "props")
    s.stroke(wp(portal, s.rng, 3, 20, True), "#14171a", 3.6, .8, True, "props")
    mouth = [(CX - 180, 880), (CX - 170, 690)] + \
        arc_pts(CX, 690, 170, 150, math.pi, 2 * math.pi, 18) + [(CX + 180, 880)]
    s.fill(wp(mouth, s.rng, 3, 18, True), "#000", .96, "props")
    _rim(s, mouth, .5, 3.0, None, True)
    for i in range(7):                          # the grating, cut through and bent back
        x = lerp(CX - 150, CX + 150, i / 6)
        bend = 0 if i in (2, 3, 4) else 1
        if bend:
            s.stroke(wob((x, 860), (x, 590), s.rng, 2, 20), "#5a5f5c", 11, 1,
                     False, "props")
        else:
            s.stroke(wp([(x, 860), (x + 20, 700), (x + 90, 640)], s.rng, 3, 16),
                     "#5a5f5c", 11, 1, False, "props")
        s.stroke(wob((x - 3, 850), (x - 3, 620), s.rng, 2, 20), s.pal.rim, 2.0,
                 .3, False, "rim")
    s.surface([(-60, 880), (W + 60, 870), (W + 60, H + 60), (-60, H + 60)],
              ("#9a9a86", "#3a3a30"), 6, 44)
    _stream(s, [(CX, 830), (CX - 60, 930), (CX + 30, H + 30)], 96)
    s.specks((CX - 240, 800, CX + 240, H), 110, "#cfe6f2", (1.2, 3.8), (.15, .55))
    s.rocks((0, 900, 1050, 1045), 20, (10, 32), rim_op=(.10, .28))
    s.light(CX, 760, 900, color="#cfe6f2", strength=.55, tint=.14)
    s.light(880, 180, 1300, color="#ffe9c0", strength=.7, tint=.14)


@plate("telemetryWeir", "The Telemetry Weir", "water", seed=606)
def _weir(s):
    sky(s, 240, sun=(240, 130))
    prop_forest_band(s, 380, 9, (170, 280), tone="#22301c", rim_op=.06, spread=120)
    s.surface([(-60, 420), (W + 60, 400), (W + 60, H + 60), (-60, H + 60)],
              ("#8d9478", "#363c2c"), 6, 44)
    for i in range(5):                          # a stepped weir, measured all the way down
        y = 560 + i * 92
        hw = 300 + i * 90
        step = [(CX - hw, y + 78), (CX - hw + 30, y), (CX + hw - 30, y - 6),
                (CX + hw, y + 72)]
        s.gfill(wp(step, s.rng, 3, 22, True),
                s.lin([("0", "#a8a898", 1), ("1", "#3c4038", 1)]), "geo")
        s.stroke(wp(step[1:3], s.rng, 3, 22), "#eaf4f8", 3.4, .55, False, "rim")
        for j in range(14):                     # water going over, as it does
            x = s.rng.uniform(CX - hw + 40, CX + hw - 40)
            s.stroke(wob((x, y - 4), (x + s.rng.uniform(-14, 14), y + 74),
                         s.rng, 3, 14), "#cfe8f4", s.rng.uniform(1.6, 4.2),
                     s.rng.uniform(.2, .6), False, "rim")
    # the gauge board nobody reads, and the hut nobody has unlocked
    s.stroke(wob((250, 900), (250, 520), s.rng, 2, 20), "#4a4f48", 16, 1, False, "props")
    for i in range(9):
        y = 540 + i * 40
        s.stroke(wob((236, y), (272, y), s.rng, 1, 8), "#e8ece6", 3.0, .8, False, "rim")
    prop_house(s, 880, 620, 190, 150, door=True, boarded=True)
    _mist(s, 700, 200, .5, "#dfeef5")
    s.rocks((0, 940, 1050, 1045), 18, (10, 30), rim_op=(.10, .26))
    s.light(240, 200, 1400, color="#ffe9c0", strength=.72, tint=.14)


# ===========================================================================
# THE PLATFORM — THE HALLS NOBODY PUT ON THE DIRECTORY PLATE
# ===========================================================================
def _chair(s, cx, base_y, scale=1.0, tone=("#5a5348", "#191612"), face=1):
    """One chair, empty. There are a great many of these up here."""
    h = 150 * scale
    seat = [(cx - 54 * scale, base_y - h * .42), (cx + 56 * scale, base_y - h * .46),
            (cx + 58 * scale, base_y - h * .28), (cx - 56 * scale, base_y - h * .24)]
    _dark(s, seat, tone)
    _rim(s, seat[:2], .45, 2.4, None)
    bx = 34 * scale * face
    back = [(cx + bx, base_y - h * .44), (cx + bx * 1.16, base_y - h),
            (cx + bx * 1.9, base_y - h * .98), (cx + bx * 1.72, base_y - h * .42)]
    _dark(s, back, tone)
    _rim(s, back[:2], .45, 2.4, None)
    for dx in (-46, 44):
        s.stroke(wob((cx + dx * scale, base_y - h * .28),
                     (cx + dx * scale * 1.12, base_y), s.rng, 1.4, 12), tone[1],
                 6 * scale, .9, False, "props")
    _shadow(s, cx, base_y + 4, 68 * scale, 14 * scale, .6)


def _paper(s, x, y, half=90, tall=64, tone="#ddd7c2", lines=2, op=.92):
    """A sheet: a form, a certificate, a notice, a sign-off."""
    q = [(x - half, y + tall), (x - half + 4, y - tall), (x + half, y - tall + 5),
         (x + half - 3, y + tall - 4)]
    s.fill(wp(q, s.rng, 1.2, 12, True), tone, op, "props")
    _rim(s, q, .55, 2.2, None, True)
    for i in range(lines):
        _scrawl(s, x - half * .72, y - tall * .45 + i * (tall * 1.5 / max(1, lines)),
                1, half / 240., "#3a3630", .8, 5)
    return q


@plate("mastWalk", "The Mast Walk", "canyon", seed=611)
def _mast_walk(s):
    sky(s, 700, sun=(180, 160))
    _mist(s, 780, 260, .55, "#dfe8ee", rows=5)
    # the underside of the platform, which is the part nobody photographs
    s.surface([(-60, -60), (W + 60, -60), (W + 60, 340), (700, 402), (CX, 366),
               (200, 420), (-60, 366)], ("#3a4046", "#080b0d"), 6, 44)
    s.stroke(wp([(-60, 366), (200, 420), (CX, 366), (700, 402), (W + 60, 340)],
                s.rng, 5, 30), "#c4d2d6", 3.0, .30, False, "rim")
    for i in range(13):
        x = lerp(-40, W + 40, i / 12)
        s.stroke(wob((x, 340), (x + s.rng.uniform(-30, 30), 340 + s.rng.uniform(40, 190)),
                     s.rng, 3, 18), "#14181c", s.rng.uniform(8, 26), .9, False, "props")
    s.stroke(wob((900, 340), (880, H + 40), s.rng, 3, 34), "#3a4048", 26, 1, False, "props")
    # the envelope, hanging off it below you like a shed skin
    env = [(830, 380), (700, 520), (660, 720), (720, 900), (830, 1000), (900, 860),
           (930, 640), (910, 460)]
    s.gfill(wp(env, s.rng, 8, 20, True),
            s.lin([("0", "#a89478", 1), ("1", "#2a2318", 1)]), "props")
    s.stroke(wp(env, s.rng, 8, 20, True), "#241d14", 3.2, .8, True, "props")
    _rim(s, env[:3], .5, 3.0, None)
    for i in range(6):
        s.stroke(wp([(870, 400), (700 + i * 46, 940)], s.rng, 5, 22), "#8a7a5c", 2.2,
                 .45, False, "props")
    # the catwalk, out along the mast
    walk = [(-60, 900), (300, 830), (720, 790), (W + 60, 770)]
    s.stroke(wp(walk, s.rng, 3, 30), "#5a6167", 26, 1, False, "props")
    s.stroke(wp([(p[0], p[1] - 13) for p in walk], s.rng, 3, 30), s.pal.rim, 2.4,
             .45, False, "rim")
    prop_railing(s, [(-40, 880), (CX, 812), (W + 40, 772)], height=110, posts=10)
    for i in range(9):                          # grating, and four thousand feet under it
        x = lerp(-40, W + 40, i / 8)
        s.stroke(wob((x, 880), (x + 26, H + 40), s.rng, 2, 26), "#1a1f22", 3.0, .3,
                 False, "detail")
    s.light(180, 200, 1500, color="#ffe9c0", strength=.7, tint=.14)


@plate("slaLounge", "The SLA Lounge", "bank", seed=612)
def _sla_lounge(s):
    g = stage_chamber(s, back=(430, 260), floor_y=830, ceil_y=140, texture="courses")
    prop_rug(s, CX, 950, 330, 130)
    for x, sc, face in ((250, .95, 1), (410, 1.05, 1), (660, 1.05, -1), (830, .95, -1)):
        _chair(s, x, 960, sc, ("#4a4a52", "#131418"), face)
    prop_table(s, CX + 20, 900, 150, 70, ("#6a6f76", "#22262c"))
    # three nines, framed, and the pencil arithmetic under the glass
    frame = [(CX - 210, 560), (CX - 204, 350), (CX + 210, 344), (CX + 216, 554)]
    _dark(s, frame, ("#c9a86a", "#3a2f18"))
    _paper(s, CX + 4, 452, 176, 92, "#efe9d6", 2)
    _scrawl(s, CX - 130, 500, 2, .44, "#3f5aa0", .75, 5)   # somebody's pencil
    s.stroke(wob((CX + 60, 520), (CX + 160, 516), s.rng, 1.4, 10), "#3f5aa0", 2.6,
             .8, False, "props")
    s.stroke(wob((CX + 60, 528), (CX + 160, 524), s.rng, 1.4, 10), "#3f5aa0", 2.6,
             .8, False, "props")
    s.light(CX, 880, 900, strength=.85, tint=.14)


@plate("archiveStacks", "The Archive Stacks", "mine", seed=613)
def _stacks(s):
    g = stage_chamber(s, back=(300, 300), floor_y=840, ceil_y=150, texture="courses")
    # rolling shelves, wound tight: only one aisle can be open at a time
    for i, x in enumerate((-40, 130, 300, 690, 860, 1020)):
        block = [(x - 90, 900), (x - 78, 260), (x + 78, 250), (x + 90, 890)]
        s.gfill(wp(block, s.rng, 3, 22, True),
                s.lin([("0", "#5c5245", 1), ("1", "#0f0d0b", 1)]), "props")
        s.stroke(wp(block, s.rng, 3, 22, True), "#080706", 3.0, .9, True, "props")
        _rim(s, block[1:3], .35, 2.4, None)
        for k in range(9):
            y = lerp(300, 870, k / 8)
            s.stroke(wob((x - 74, y), (x + 74, y - 4), s.rng, 1.4, 18), "#241f18", 7,
                     1, False, "props")
            for j in range(7):
                bx = lerp(x - 62, x + 62, (j + .5) / 7)
                s.fill(wp([(bx - 7, y), (bx - 7, y - 44), (bx + 7, y - 45), (bx + 7, y)],
                          s.rng, 1, 8, True),
                       s.rng.choice(["#6b3b32", "#3b4a5c", "#4a5240", "#5c4a2a"]),
                       s.rng.uniform(.5, .95), "props")
    opening(s, CX, 300, 880, 150, "square", depth=.94)      # the one open aisle
    for i in range(6):                          # the rails they run on
        s.stroke(wob((-40, 900 + i * 30), (W + 40, 896 + i * 30), s.rng, 2, 30),
                 "#3a342c", 4, .5, False, "detail")
    s.stroke(wob((0, 930), (W, 926), s.rng, 2, 30), s.pal.rim, 2.2, .35, False, "rim")
    s.light(CX, 940, 780, strength=.95)
    s.light(CX, 560, 460, strength=.35, tint=.10)


@plate("accessibilityWing", "The Accessibility Wing", "bank", seed=614)
def _a11y_wing(s):
    g = stage_chamber(s, back=(430, 250), floor_y=830, ceil_y=130, texture="courses")
    # high contrast, and it means it: black on white, at size, with room around it
    for i, y in enumerate((330, 470, 610)):
        q = [(g["bl"] + 70, y + 52), (g["bl"] + 70, y - 52), (g["br"] - 70, y - 56),
             (g["br"] - 70, y + 48)]
        s.fill(wp(q, s.rng, 1.4, 16, True), "#f4f1e6", .95, "props")
        _rim(s, q, .8, 3.0, "#ffffff", True)
        _scrawl(s, g["bl"] + 110, y, 3 - i, .78, "#0a0c10", .95, 5)
    # a sane tab order, drawn as the one straight line in the building
    pts = [(g["bl"] + 40, 300), (g["br"] - 40, 300), (g["bl"] + 40, 440),
           (g["br"] - 40, 440), (g["bl"] + 40, 580), (g["br"] - 40, 580)]
    for i in range(len(pts) - 1):
        s.stroke(wp([pts[i], pts[i + 1]], s.rng, 1.2, 20), "#5fd6ab", 2.2, .5,
                 False, "rim")
    _chair(s, CX + 40, 960, 1.0, ("#4a4a52", "#131418"), -1)
    prop_table(s, CX - 190, 930, 160, 80, ("#6a6f76", "#22262c"))
    # the screen reader, talking quietly to nobody
    s.screen('<ellipse cx="%d" cy="880" rx="200" ry="120" fill="url(#%s)" '
             'filter="url(#soft)"/>'
             % (CX - 190, s.rad([("0", "#9fd8e0", .40), ("1", "#9fd8e0", 0)])), .8)
    for i in range(5):
        rr = 40 + i * 46
        s.stroke(arc_pts(CX - 190, 862, rr, rr * .6, math.pi * 1.15, math.pi * 1.85, 14),
                 "#9fd8e0", 2.2, .5 - i * .08, False, "rim")
    s.light(CX, 560, 1000, strength=.7, tint=.12)
    s.light(CX, 900, 820, strength=.8, tint=.12)


@plate("helpDesk", "The Help Desk", "bank", seed=615)
def _help_desk(s):
    g = stage_chamber(s, back=(400, 270), floor_y=830, ceil_y=140, texture="courses")
    # NOW SERVING 0 OF 0
    board = [(CX - 210, 330), (CX - 206, 232), (CX + 210, 226), (CX + 214, 324)]
    _dark(s, board, ("#2a3138", "#0a0d10"))
    _rim(s, board, .7, 2.8, None, True)
    _scrawl(s, CX - 160, 278, 2, .52, "#c9483a", .9, 4)
    counter = [(CX - 340, 980), (CX - 310, 700), (CX + 310, 692), (CX + 344, 972)]
    s.gfill(wp(counter, s.rng, 2, 20, True),
            s.lin([("0", "#9aa3ae", 1), ("1", "#22262c", 1)]), "props")
    s.stroke(wp(counter, s.rng, 2, 20, True), "#0a0d10", 3.0, .85, True, "props")
    s.stroke(wp(counter[1:3], s.rng, 2, 20), s.pal.rim, 3.0, .5, False, "rim")
    # the bell, and the sign
    s.ellipse(CX + 210, 686, 34, 24, "#c9a86a", .95, "props")
    s.ellipse(CX + 210, 668, 8, 8, "#e8dfc2", .9, "rim")
    _paper(s, CX - 170, 640, 150, 54, "#e4dfcc", 1)
    # a chair with a cardigan over the back of it, still warm
    _chair(s, CX + 20, 620, .8, ("#454a52", "#12141a"), -1)
    card = [(CX + 44, 560), (CX + 30, 470), (CX + 96, 462), (CX + 112, 552)]
    s.gfill(wp(card, s.rng, 3, 14, True),
            s.lin([("0", "#a8552f", 1), ("1", "#3a1c10", 1)]), "props")
    _rim(s, card[:3], .5, 2.4, None)
    s.light(CX, 900, 900, strength=.85, tint=.14)


@plate("matrixRoom", "The Traceability Matrix", "bank", seed=616)
def _matrix_room(s):
    g = stage_chamber(s, back=(440, 240), floor_y=830, ceil_y=120, texture="courses")
    x0, x1, y0, y1 = g["bl"] + 40, g["br"] - 40, 290, 760
    cols, rows = 16, 11
    s.fill(wp([(x0, y1), (x0, y0), (x1, y0), (x1, y1)], s.rng, 1.4, 20, True),
           "#cfc9b4", .93, "props")
    for i in range(cols + 1):
        x = lerp(x0, x1, i / cols)
        s.stroke(wob((x, y0), (x, y1), s.rng, 1.2, 26), "#565244", 1.6, .5, False, "props")
    for j in range(rows + 1):
        y = lerp(y0, y1, j / rows)
        s.stroke(wob((x0, y), (x1, y), s.rng, 1.2, 26), "#565244", 1.6, .5, False, "props")
    for j in range(rows):                       # a hand that got faster, and then stopped
        for i in range(cols):
            if s.rng.random() > max(0., .96 - 1.15 * (i / cols) - .055 * j):
                continue
            px = lerp(x0, x1, (i + .5) / cols)
            py = lerp(y0, y1, (j + .5) / rows)
            s.stroke(wp([(px - 11, py - 2), (px - 3, py + 10), (px + 12, py - 13)],
                        s.rng, 2 + j * .4, 8), "#2f3a48", 2.8,
                     max(.25, .9 - .05 * j), False, "props")
    _rim(s, [(x0, y1), (x0, y0), (x1, y0), (x1, y1)], .6, 3.0, None, True)
    prop_table(s, CX, 950, 260, 90, ("#6a6f76", "#22262c"))
    s.light(CX, 560, 1000, strength=.75, tint=.12)
    s.light(CX, 920, 760, strength=.7, tint=.12)


@plate("tagCellar", "The Tag Cellar", "earth", seed=617)
def _tag_cellar(s):
    g = stage_chamber(s, back=(330, 300), floor_y=830, ceil_y=160, texture="courses")
    arch = arc_pts(CX, 300, 460, 260, math.pi, 2 * math.pi, 26)
    s.surface([(-60, -60), (W + 60, -60)] + arch[::-1], ("#3a2f22", "#120e0a"), 4, 34)
    # racked bottles, laid down to see how they age
    for row in range(6):
        y = 380 + row * 84
        for col in range(9):
            x = lerp(150, 910, (col + .5) / 9)
            if abs(x - CX) < 90 and row > 3:
                continue
            s.ellipse(x, y, 26, 22, "#1a1a14", .95, "props")
            s.ellipse(x - 4, y - 4, 15, 12, "#4a5238", .9, "props")
            s.ellipse(x - 7, y - 7, 6, 5, s.pal.rim, .5, "rim")
            lab = [(x - 17, y + 20), (x - 17, y + 6), (x + 17, y + 6), (x + 17, y + 20)]
            s.fill(wp(lab, s.rng, 1, 6, True), "#cfc4a4", .8, "props")
        s.stroke(wob((140, y + 34), (920, y + 32), s.rng, 1.6, 20), "#3a2f1e", 9, 1,
                 False, "props")
        s.stroke(wob((140, y + 29), (920, y + 27), s.rng, 1.6, 20), s.pal.rim, 1.8,
                 .3, False, "rim")
    # the two that are both v2.0, pulled out and stood up, saying nothing
    for x in (CX - 60, CX + 60):
        q = [(x - 26, 950), (x - 20, 800), (x + 20, 798), (x + 26, 948)]
        _dark(s, q, ("#4a5238", "#120f0a"))
        _rim(s, q[:3], .6, 2.6, None)
        s.fill(wp([(x - 20, 890), (x - 20, 856), (x + 20, 855), (x + 20, 889)],
                  s.rng, 1, 6, True), "#cfc4a4", .9, "props")
    s.light(CX, 900, 800, strength=.95)


@plate("patternLibrary", "The Pattern Library", "house", seed=618)
def _pattern_library(s):
    g = stage_interior(s, wall_y=(150, 720), back_half=430)
    prop_shelves(s, -40, g["bl"] + 250, 200, 740, 6, ransacked=False)
    prop_shelves(s, g["br"] - 250, W + 40, 200, 740, 6, ransacked=False)
    prop_shelves(s, g["bl"] + 60, g["br"] - 60, 220, 660, 5, ransacked=False)
    prop_table(s, CX, 930, 250, 110, ("#8a7048", "#3a2c1c"))
    # one book, open, at the page that is coming away from the binding
    for sgn in (-1, 1):
        leaf = [(CX, 828), (CX + sgn * 160, 806), (CX + sgn * 168, 846),
                (CX + sgn * 10, 862)]
        s.fill(wp(leaf, s.rng, 2, 12, True), "#e8e0c8", .95, "props")
        _rim(s, leaf[:2], .6, 2.4, None)
        _scrawl(s, CX + sgn * 130 - 60, 828, 1, .42, "#3a3630", .8, 5)
    s.stroke(wp([(CX, 826), (CX, 862)], s.rng, 1.2, 8), "#5a4a30", 3.0, .8, False, "props")
    _scrawl(s, CX - 90, 806, 2, .5, "#7a3a22", .9, 4)     # KNOW WHEN NOT TO
    prop_lamp(s, CX + 240, 880, .5, lit=True)
    s.light(CX + 240, 830, 760, color="#ffdca8", strength=.85, tint=.22)
    s.light(CX, 500, 900, strength=.45, tint=.14)


@plate("promptCompost", "The Compost Heap", "moss", seed=619)
def _compost(s):
    g = stage_cavern(s, ceil_y=280, floor_y=700, moss=True, stal=False, back_wall=520)
    # everything the garden could not use, going quietly back to tokens
    heap = blob(CX + 20, 900, 380, s.rng, k=13, squash=.52)
    heap = [(x, min(y, 1010)) for x, y in heap]
    s.gfill(wp(heap, s.rng, 8, 20, True),
            s.lin([("0", "#5b5230", 1), ("1", "#12140c", 1)]), "props")
    s.stroke(wp(heap, s.rng, 8, 20, True), "#0a0c08", 3.2, .85, True, "props")
    for _ in range(70):                         # four hundred variations on "please"
        x = s.rng.uniform(CX - 330, CX + 360)
        y = s.rng.uniform(700, 1000)
        if (x - CX - 20) ** 2 / 380. ** 2 + (y - 900) ** 2 / 200. ** 2 > 1:
            continue
        q = [(x - 34, y + 12), (x - 30, y - 12), (x + 32, y - 16), (x + 30, y + 10)]
        s.fill(wp(q, s.rng, 2, 8, True),
               s.rng.choice(["#8a8462", "#6e6a4a", "#a49c74"]), s.rng.uniform(.3, .8),
               "props")
    s.screen('<ellipse cx="%d" cy="900" rx="420" ry="200" fill="url(#%s)" '
             'filter="url(#soft)"/>'
             % (CX + 20, s.rad([("0", "#c8a34a", .34), ("1", "#c8a34a", 0)])), .8)
    for _ in range(26):                         # warm to stand near
        x = s.rng.uniform(CX - 300, CX + 340)
        s.stroke(wp([(x, 820), (x + s.rng.uniform(-30, 30), 700),
                     (x + s.rng.uniform(-60, 60), 560)], s.rng, 6, 18),
                 "#9aa87a", 2.0, s.rng.uniform(.06, .2), False, "rim")
    # and something growing out of the top of it that nobody planted
    s.stroke(wp([(CX + 40, 720), (CX + 20, 560), (CX + 90, 420), (CX + 40, 300)],
                s.rng, 5, 18), "#2e4a30", 16, 1, False, "props")
    for i in range(7):
        t = (i + 1) / 8
        px = lerp(CX + 40, CX + 40, t) + s.rng.uniform(-70, 70)
        py = lerp(700, 320, t)
        lf = blob(px, py, 46, s.rng, k=7, squash=.5)
        s.fill(wp(lf, s.rng, 3, 10, True), "#3d6b45", .9, "props")
        _rim(s, lf[:4], .5, 2.4, "#7fd8b6")
    s.light(CX + 20, 860, 900, color="#c8a34a", strength=.55, tint=.22)
    s.light(CX, 520, 700, strength=.4, tint=.16)


@plate("citationWell", "The Citation Well", "stone", seed=620)
def _citation_well(s):
    g = stage_chamber(s, back=(340, 300), floor_y=840, ceil_y=160, texture="chisel")
    # a round stone well, and a rope that goes down a very long way
    ring = arc_pts(CX, 880, 260, 96, 0, 2 * math.pi, 40)
    s.gfill(wp(ring, s.rng, 4, 20, True),
            s.lin([("0", "#8a8f95", 1), ("1", "#22282c", 1)]), "props")
    s.stroke(wp(ring, s.rng, 4, 20, True), "#0a0d10", 3.4, .9, True, "props")
    inner = arc_pts(CX, 884, 200, 72, 0, 2 * math.pi, 36)
    s.fill(wp(inner, s.rng, 3, 16, True), "#000", 1, "props")
    _rim(s, [q for q in ring if q[1] <= 880], .6, 3.2, None)
    for sgn in (-1, 1):                         # the gantry over it
        s.stroke(wob((CX + sgn * 210, 860), (CX + sgn * 190, 470), s.rng, 2, 22),
                 "#4a4137", 18, 1, False, "props")
    s.stroke(wob((CX - 200, 470), (CX + 200, 466), s.rng, 2, 22), "#4a4137", 16, 1,
             False, "props")
    prop_chain(s, CX, 470, 830, 14, 10)
    # the bucket, which has never been wet
    q = [(CX - 60, 900), (CX - 48, 812), (CX + 48, 810), (CX + 60, 896)]
    s.gfill(wp(q, s.rng, 2, 14, True),
            s.lin([("0", "#9aa3ae", 1), ("1", "#20252a", 1)]), "props")
    _rim(s, q, .8, 3.0, None, True)
    s.stroke(arc_pts(CX, 812, 54, 26, math.pi, 2 * math.pi, 14), "#c2cad3", 2.6, .6,
             False, "rim")
    _paper(s, CX + 330, 620, 130, 60, "#d8d2bc", 1)      # ALL CLAIMS DRAWN HERE
    s.light(CX, 700, 820, strength=.92)
    s.light(CX, 940, 520, strength=.5, tint=.10)


@plate("contingencyCloset", "The Contingency Closet", "bank", seed=621)
def _contingency(s):
    g = stage_chamber(s, back=(280, 250), floor_y=830, ceil_y=150, texture="courses")
    # shelved to the ceiling, every one of them numbered and signed off
    for x0, x1 in ((-40, g["bl"] + 40), (g["bl"] + 60, g["br"] - 60), (g["br"] - 40, W + 40)):
        for row in range(7):
            y = 240 + row * 96
            s.stroke(wob((x0, y + 66), (x1, y + 62), s.rng, 1.4, 20), "#3a3f45", 9, 1,
                     False, "props")
            s.stroke(wob((x0, y + 60), (x1, y + 56), s.rng, 1.4, 20), s.pal.rim, 1.8,
                     .3, False, "rim")
            n = max(3, int((x1 - x0) / 62))
            for j in range(n):
                bx = lerp(x0 + 16, x1 - 16, (j + .5) / n)
                q = [(bx - 22, y + 64), (bx - 22, y - 2), (bx + 22, y - 4), (bx + 22, y + 62)]
                s.gfill(wp(q, s.rng, 1.2, 10, True),
                        s.lin([("0", s.rng.choice(["#7a4a3a", "#3b4a5c", "#4a5240"]), 1),
                               ("1", "#151517", 1)]), "props")
                s.fill(wp([(bx - 16, y + 34), (bx - 16, y + 12), (bx + 16, y + 11),
                           (bx + 16, y + 33)], s.rng, 1, 6, True), "#d8d2bc", .85, "props")
    # one gap on the middle shelf, exactly one binder wide
    s.fill(wp([(CX - 22, 540), (CX - 22, 474), (CX + 22, 472), (CX + 22, 538)],
              s.rng, 1.2, 10, True), "#05070a", 1, "props")
    s.light(CX, 900, 880, strength=.85, tint=.14)
    s.light(CX, 460, 620, strength=.4, tint=.10)


@plate("sensorLine", "The Sensor Line", "canyon", seed=622)
def _sensor_line(s):
    sky(s, 320, sun=(260, 140))
    for y, c0, c1 in ((320, "#8794a0", "#66727d"), (380, "#6b7681", "#49535c"),
                      (450, "#535d66", "#333b42")):
        outdoor_band(s, y, (c0, c1), rough=26, step=90)
    s.surface([(-60, 620), (W + 60, 604), (W + 60, H + 60), (-60, H + 60)],
              ("#8d9078", "#33362a"), 6, 44)
    target = (CX + 40, 560)
    stone = blob(target[0], target[1], 46, s.rng, k=8, squash=.8)
    _dark(s, stone, ("#9aa0a6", "#2b3036"))
    _rim(s, [q for q in stone if q[1] <= target[1]], .7, 2.8, None)
    # staked out at measured intervals, all pointed at the same thing
    for i, (x, y, sc) in enumerate(((120, 1000, 1.0), (330, 930, .84), (560, 880, .72),
                                    (780, 830, .6), (960, 790, .5))):
        s.stroke(wob((x, y), (x, y - 210 * sc), s.rng, 2, 18), "#3e443f", 9 * sc, 1,
                 False, "props")
        head = (x, y - 210 * sc)
        a = math.atan2(target[1] - head[1], target[0] - head[0])
        box = [(head[0] - 30 * sc, head[1] + 22 * sc), (head[0] - 26 * sc, head[1] - 24 * sc),
               (head[0] + 34 * sc, head[1] - 28 * sc), (head[0] + 38 * sc, head[1] + 18 * sc)]
        _dark(s, box, ("#b9bdb4", "#2b3036"))
        _rim(s, box, .7, 2.4, None, True)
        s.stroke(wp([head, (head[0] + math.cos(a) * 90 * sc,
                            head[1] + math.sin(a) * 90 * sc)], s.rng, 1.4, 12),
                 "#e8ece6", 3.0 * sc, .55, False, "rim")
        _scrawl(s, x - 24 * sc, y - 250 * sc, 1, .34 * sc, "#e8ece6", .55, 3)
        _shadow(s, x, y + 4, 40 * sc, 10 * sc, .5)
    s.light(260, 220, 1500, color="#ffe9c0", strength=.75, tint=.14)


@plate("acceptanceFloor", "The Acceptance Floor", "bank", seed=623)
def _acceptance(s):
    g = stage_chamber(s, back=(470, 230), floor_y=800, ceil_y=100, texture="courses")
    # a wide clean empty floor, and a rectangle taped out on it
    quad = [(CX - 470, 1010), (CX - 250, 806), (CX + 250, 800), (CX + 476, 1000)]
    for i in range(4):
        a, b = quad[i], quad[(i + 1) % 4]
        s.stroke(wob(a, b, s.rng, 2, 20), "#d8c24a", 12, .85, False, "props")
        s.stroke(wob((a[0], a[1] - 4), (b[0], b[1] - 4), s.rng, 2, 20), "#fff3c8", 2.4,
                 .4, False, "rim")
    s.fill(wp(quad, s.rng, 2, 24, True), "#0a0d10", .18, "props")
    # by the door: a table, a pen, and one sheet that is already signed
    prop_table(s, 190, 780, 130, 66, ("#6a6f76", "#22262c"))
    _paper(s, 190, 700, 78, 46, "#e4dfcc", 2)
    s.stroke(wob((236, 706), (280, 690), s.rng, 1.2, 8), "#1a1c20", 4.0, .9, False, "props")
    opening(s, g["br"] + 30, 380, 780, 110, "square", depth=.85)
    s.light(CX, 880, 1000, strength=.8, tint=.12)
    s.light(CX, 400, 800, strength=.5, tint=.12)


@plate("contractShelf", "The Shelf of Published Contracts", "stone", seed=624)
def _contract_shelf(s):
    stage_ledge(s, lip=860, far_lip=640, far_wall=320, wall_top=-40,
                depth_color="#141a1e")
    # a rank of interfaces on brackets, each one stamped and dated and stable
    for i in range(7):
        y = 700 + i * 52
        x0, x1 = -40 - i * 10, W + 40 + i * 10
        s.stroke(wob((x0, y), (x1, y + s.rng.uniform(-6, 6)), s.rng, 2, 30), "#8a7a5c",
                 22, .95, False, "props")
        s.stroke(wob((x0, y - 10), (x1, y - 10), s.rng, 2, 30), s.pal.rim, 2.4, .45,
                 False, "rim")
        for j in range(5):                      # the brackets, bolted through
            bx = lerp(60, W - 60, (j + .5) / 5)
            s.stroke(wp([(bx, y + 10), (bx + 26, y + 54)], s.rng, 1.4, 10), "#3a4046",
                     8, .9, False, "props")
            s.ellipse(bx, y, 6, 6, s.pal.accent, .5, "rim")
        _paper(s, 150 + i * 20, y - 34, 46, 22, "#d8d2bc", 1, .8)
    # and underneath, in the dark, everything they promised to hide
    s.fill([(-60, 940), (W + 60, 930), (W + 60, H + 60), (-60, H + 60)], "#04060a",
           .92, "props")
    for _ in range(24):
        x, y = s.rng.uniform(0, W), s.rng.uniform(950, 1040)
        s.stroke(wp([(x, y), (x + s.rng.uniform(-80, 80), y + s.rng.uniform(-30, 30)),
                     (x + s.rng.uniform(-140, 140), y + s.rng.uniform(-20, 40))],
                    s.rng, 4, 14), s.pal.rim, 1.6, s.rng.uniform(.05, .18), False, "rim")
    s.light(CX, 780, 900, strength=.9)


@plate("supplyChain", "The Supply Chain", "bank", seed=625)
def _supply_chain(s):
    g = stage_chamber(s, back=(430, 250), floor_y=830, ceil_y=130, texture="courses")
    opening(s, g["bl"] - 40, 560, 860, 130, "square", depth=.9)
    opening(s, g["br"] + 40, 560, 860, 130, "square", depth=.9)
    # a conveyor, in through one wall and out through the other
    belt = [(-60, 880), (CX, 840), (W + 60, 876)]
    s.stroke(wp(belt, s.rng, 3, 30), "#2b3138", 60, 1, False, "props")
    s.stroke(wp([(p[0], p[1] - 30) for p in belt], s.rng, 3, 30), "#4d545c", 16, 1,
             False, "props")
    s.stroke(wp([(p[0], p[1] - 38) for p in belt], s.rng, 3, 30), s.pal.rim, 2.4, .45,
             False, "rim")
    for i in range(15):
        x = lerp(-40, W + 40, i / 14)
        s.stroke(wob((x, 900), (x, 1000), s.rng, 1.4, 12), "#20252b", 7, .9, False, "props")
    for i in range(7):                          # the same parts, with a different sticker
        x = lerp(-20, W + 20, (i + .5) / 7)
        y = 830 - abs(x - CX) * .035
        q = [(x - 54, y + 30), (x - 48, y - 44), (x + 48, y - 48), (x + 54, y + 26)]
        s.gfill(wp(q, s.rng, 2, 12, True),
                s.lin([("0", "#8a7a5c", 1), ("1", "#241f18", 1)]), "props")
        s.stroke(wp(q, s.rng, 2, 12, True), "#0a0d10", 2.6, .85, True, "props")
        _rim(s, q[1:3], .5, 2.4, None)
        s.fill(wp([(x - 24, y - 4), (x - 22, y - 30), (x + 26, y - 32), (x + 28, y - 6)],
                  s.rng, 1, 8, True),
               "#c9483a" if i > 3 else "#4f7fd0", .85, "props")
    s.light(CX, 860, 950, strength=.85, tint=.14)


@plate("deorbitGantry", "The Deorbit Gantry", "ice", seed=626)
def _deorbit(s):
    g = stage_chamber(s, back=(440, 220), floor_y=800, ceil_y=-140, ceiling=False,
                      texture="courses")
    s.screen('<rect x="0" y="0" width="%d" height="460" fill="url(#%s)"/>'
             % (W, s.lin([("0", "#bfe6ff", .35), ("1", "#bfe6ff", 0)])), .7)
    # the end of the ring: a rail, and then nothing
    for x in (g["bl"] + 80, g["br"] - 80):
        s.stroke(wob((x, 830), (x, 140), s.rng, 2, 30), "#2b3d49", 26, 1, False, "props")
        s.stroke(wob((x + 10, 830), (x + 10, 140), s.rng, 2, 30), s.pal.rim, 2.4, .4,
                 False, "rim")
    for i in range(7):                          # the last bay of the ring, braced
        x = lerp(g["bl"] + 80, g["br"] - 80, i / 6)
        s.stroke(wob((x, 830), (x + 40, 200), s.rng, 3, 26), "#22323d", 9, .8,
                 False, "props")
    for y in (300, 470, 640):
        s.stroke(wob((g["bl"] + 60, y), (g["br"] - 60, y - 12), s.rng, 3, 26), "#2b3d49",
                 14, .95, False, "props")
        s.stroke(wob((g["bl"] + 60, y - 8), (g["br"] - 60, y - 20), s.rng, 3, 26),
                 s.pal.rim, 2.0, .35, False, "rim")
    rail = [(-60, 900), (CX, 860), (W + 60, 892)]
    s.stroke(wp(rail, s.rng, 3, 30), "#39505f", 30, 1, False, "props")
    s.stroke(wp([(p[0], p[1] - 16) for p in rail], s.rng, 3, 30), "#d3e9f5", 3.4, .7,
             False, "rim")
    s.fill([(-60, 940), (W + 60, 920), (W + 60, H + 60), (-60, H + 60)], "#050a0e",
           .95, "geo")
    _mist(s, 1000, 150, .6, "#cfe0ea")
    # the lever, in the position it has always been in
    s.stroke(wob((CX + 250, 880), (CX + 250, 700), s.rng, 2, 16), "#2b3d49", 22, 1,
             False, "props")
    s.stroke(wp([(CX + 250, 720), (CX + 330, 640)], s.rng, 2, 12), "#c9483a", 16, 1,
             False, "props")
    s.ellipse(CX + 334, 634, 20, 20, "#e8695a", .9, "props")
    _paper(s, CX + 130, 660, 110, 74, "#dfe7ec", 3)     # a very clear procedure
    s.light(CX, 700, 1000, color="#bfe6ff", strength=.5, tint=.24)
    s.light(CX, 900, 800, strength=.6, tint=.14)


@plate("contextWell", "The Context Well", "ice", seed=627)
def _context_well(s):
    p = s.pal
    s.add('<rect x="0" y="0" width="%d" height="%d" fill="url(#%s)"/>'
          % (W, H, s.lin([("0", "#0d1a22", 1), ("0.55", "#0a1218", 1),
                          ("1", "#05090c", 1)])), "bg")
    # looking straight up a shaft: the whole platform, stacked, floor by floor
    for i in range(11):
        t = i / 10.
        hw = lerp(500, 60, t ** .8)
        y = lerp(H + 40, 150, t ** 1.15)
        q = [(CX - hw, y), (CX - hw * .94, y - lerp(120, 16, t)),
             (CX + hw * .94, y - lerp(120, 16, t)), (CX + hw, y)]
        s.gfill(wp(q, s.rng, 2.4 - 2 * t, 20, True),
                s.lin([("0", "#2c3d49", 1), ("1", "#080e13", 1)]), "geo")
        s.stroke(wp(q, s.rng, 2.4 - 2 * t, 20, True), "#04070a", 3.0 - 2 * t, .8,
                 True, "geo")
        s.stroke(wp(q[1:3], s.rng, 2 - 1.6 * t, 18), p.rim,
                 2.6 - 1.6 * t, .18 + .06 * i, False, "rim")
        for j in range(6):                      # the floors, one after another
            x = lerp(CX - hw * .9, CX + hw * .9, (j + .5) / 6)
            s.stroke(wob((x, y), (x, y - lerp(120, 16, t)), s.rng, 1.2, 12), "#101a20",
                     lerp(9, 1.5, t), .7, False, "geo")
    # and the light does not come from the top
    s.screen('<ellipse cx="%d" cy="360" rx="230" ry="120" fill="url(#%s)" '
             'filter="url(#soft)"/>'
             % (CX, s.rad([("0", "#ffffff", .85), ("0.4", "#bfe6ff", .45),
                           ("1", "#bfe6ff", 0)])), 1.0)
    s.fill(wp([(CX - 70, 170), (CX - 66, 140), (CX + 66, 140), (CX + 70, 170)],
              s.rng, 1.2, 10, True), "#0a1218", .95, "geo")
    for i in range(9):
        a = math.pi * (1.06 + .88 * (i + .5) / 9)
        s.stroke(wp([(CX, 360), (CX + math.cos(a) * 620, 360 - math.sin(a) * 520)],
                    s.rng, 3, 26), "#dff2ff", 2.2, s.rng.uniform(.10, .30), False, "rim")
    s.specks((CX - 400, 300, CX + 400, H), 130, "#dff2ff", (1, 3.4), (.12, .5))
    s.light(CX, 380, 1000, color="#bfe6ff", strength=.6, tint=.26)
    s.light(CX, 980, 620, strength=.45, tint=.12)


@plate("postmortemArchive", "The Postmortem Archive", "mine", seed=628)
def _postmortem(s):
    g = stage_chamber(s, back=(360, 260), floor_y=840, ceil_y=140, texture="courses")
    # box files floor to ceiling, one per incident, all of them the same document
    for x0, x1 in ((-40, g["bl"] + 30), (g["bl"] + 50, g["br"] - 50), (g["br"] - 30, W + 40)):
        for row in range(8):
            y = 200 + row * 88
            s.stroke(wob((x0, y + 62), (x1, y + 58), s.rng, 1.4, 20), "#241f18", 8, 1,
                     False, "props")
            n = max(3, int((x1 - x0) / 74))
            for j in range(n):
                bx = lerp(x0 + 20, x1 - 20, (j + .5) / n)
                q = [(bx - 30, y + 60), (bx - 30, y + 2), (bx + 30, y), (bx + 30, y + 58)]
                s.gfill(wp(q, s.rng, 1.2, 10, True),
                        s.lin([("0", "#6b6153", 1), ("1", "#131110", 1)]), "props")
                s.stroke(wp(q, s.rng, 1.2, 10, True), "#080706", 1.8, .8, True, "props")
                s.fill(wp([(bx - 22, y + 44), (bx - 22, y + 22), (bx + 22, y + 20),
                           (bx + 22, y + 42)], s.rng, 1, 6, True), "#cfc9b4", .8, "props")
                s.stroke(wob((bx - 16, y + 33), (bx + 16, y + 32), s.rng, 1, 6),
                         "#3a3630", 1.6, .7, False, "props")
    # two, pulled down at random, open on the floor, identical
    for x, rot in ((330, -6), (700, 5)):
        for sgn in (-1, 1):
            leaf = [(x, 960), (x + sgn * 140, 940 + rot), (x + sgn * 146, 986 + rot),
                    (x + sgn * 8, 1000)]
            s.fill(wp(leaf, s.rng, 2, 12, True), "#d8d2bc", .9, "props")
            _scrawl(s, x + sgn * 120 - 56, 964, 1, .38, "#3a3630", .8, 5)
    s.light(CX, 940, 800, strength=.95)
    s.light(CX, 480, 480, strength=.3, tint=.08)


@plate("onboardingFunnel", "The Onboarding Funnel", "bank", seed=629)
def _funnel(s):
    stage_passage(s, vp=(CX, 640), mouth=(0.48, 150, 960), depth=.94, ribs=9,
                  floor_light=.20, lit="near")
    # lined, the whole way down, with things you have already been told
    for i in range(9):
        t = .06 + .085 * i
        hw = lerp(500, 60, t / .8)
        y = lerp(560, 640, t)
        for sgn in (-1, 1):
            x = CX + sgn * hw * .82
            q = [(x - 44 * (1 - t), y + 70 * (1 - t)), (x - 40 * (1 - t), y - 66 * (1 - t)),
                 (x + 44 * (1 - t), y - 62 * (1 - t)), (x + 46 * (1 - t), y + 66 * (1 - t))]
            s.fill(wp(q, s.rng, 1.2, 10, True), "#d8d2bc", .8 - .5 * t, "props")
            _rim(s, q, .35, 1.8, None, True)
    # STEP 3 OF 4, at the elbow, and it has said so for some distance
    board = [(CX - 150, 380), (CX - 146, 292), (CX + 150, 286), (CX + 154, 374)]
    _dark(s, board, ("#2a3138", "#0a0d10"))
    _rim(s, board, .8, 3.0, None, True)
    _scrawl(s, CX - 110, 334, 2, .5, "#5fd6ab", .9, 4)
    s.light(CX, 900, 820, strength=.75, tint=.14)
    s.light(CX, 620, 420, color="#5fd6ab", strength=.3, tint=.16)


@plate("sessionArchive", "The Session Archive", "bank", seed=630)
def _session_archive(s):
    g = stage_chamber(s, back=(430, 240), floor_y=840, ceil_y=120, texture="courses")
    # one spool for every conversation, all of them still running, all at once
    for row in range(6):
        y = 270 + row * 110
        for col in range(8):
            x = lerp(g["bl"] + 60, g["br"] - 60, (col + .5) / 8)
            bay = [(x - 58, y + 52), (x - 56, y - 50), (x + 56, y - 52), (x + 58, y + 50)]
            _dark(s, bay, ("#3f464e", "#0c0f13"))
            _rim(s, bay, .4, 2.0, None, True)
            for dx in (-26, 26):
                s.ellipse(x + dx, y, 24, 24, "#1a1e22", 1, "props")
                s.stroke(arc_pts(x + dx, y, 24, 24, 0, 2 * math.pi, 18), "#8f9aa4",
                         2.2, .6, True, "props")
                s.ellipse(x + dx, y, 7, 7, "#c2cad3", .7, "rim")
                for k in range(3):
                    a = s.rng.uniform(0, math.pi * 2)
                    s.stroke([(x + dx, y), (x + dx + math.cos(a) * 22,
                                            y + math.sin(a) * 22)], "#5c646c", 1.6,
                             .5, False, "props")
            s.stroke(wob((x - 26, y - 24), (x + 26, y - 24), s.rng, 1.2, 8), "#6b7078",
                     2.0, .7, False, "props")
            s.ellipse(x, y + 34, 4, 4, "#5fd6ab", s.rng.uniform(.3, .8), "rim")
    prop_table(s, CX, 970, 200, 70, ("#6a6f76", "#22262c"))
    s.specks((60, 240, 1000, 860), 120, "#9fd8e0", (1, 2.6), (.08, .26))
    s.light(CX, 540, 1000, strength=.6, tint=.14)
    s.light(CX, 940, 760, strength=.7, tint=.12)


@plate("personaGallery", "The Gallery of Personas", "bank", seed=631)
def _persona_gallery(s):
    g = stage_chamber(s, back=(460, 240), floor_y=830, ceil_y=120, texture="courses")
    # life-size cut-outs, in a curve, none of them ever met
    order = [(-2, .74), (2, .74), (-1, .86), (1, .86), (0, 1.0)]
    for slot, sc in order:
        x = CX + slot * 205
        base = 900 + abs(slot) * -18
        h = 430 * sc
        real = slot == 1
        tone = ("#8d949c", "#2a3038") if not real else ("#b9b2a2", "#3a352c")
        prop_figure(s, x, base, h, tone, .35 if not real else .6)
        stand = [(x - 70 * sc, base + 26), (x - 60 * sc, base - 6),
                 (x + 60 * sc, base - 6), (x + 70 * sc, base + 26)]
        _dark(s, stand, ("#5a616a", "#14171b"))
        _rim(s, stand[1:3], .4, 2.0, None)
        # a name, an age, a goal and a frustration, printed at the hip
        _scrawl(s, x - 54 * sc, base - h * .42, 1, .34 * sc, "#e8e4d8", .55, 5)
        _scrawl(s, x - 54 * sc, base - h * .36, 1, .3 * sc, "#e8e4d8", .4, 4)
    # the coffee ring, on the one that is a photograph
    s.stroke(arc_pts(CX + 205 + 20, 894, 26, 10, 0, 2 * math.pi, 18), "#7a5a3a", 3.0,
             .55, True, "props")
    s.light(CX, 560, 1000, strength=.65, tint=.12)
    s.light(CX, 920, 820, strength=.75, tint=.12)


@plate("notificationStorm", "The Notification Storm", "bank", seed=632)
def _storm(s):
    g = stage_chamber(s, back=(450, 240), floor_y=830, ceil_y=120, texture="courses")
    # every alert ever raised, still raising, arriving at eye level
    for i in range(70):
        y = 520 + s.rng.gauss(0, 96)
        x = s.rng.uniform(-40, W + 40)
        hw = s.rng.uniform(60, 150)
        hh = hw * s.rng.uniform(.22, .34)
        q = [(x - hw, y + hh), (x - hw + 4, y - hh), (x + hw, y - hh + 3), (x + hw - 3, y + hh)]
        col = s.rng.choice(["#c9483a", "#d8a13a", "#4f7fd0", "#9aa3ae"])
        s.gfill(wp(q, s.rng, 1.4, 10, True),
                s.lin([("0", col, .92), ("1", "#101418", .95)]), "props")
        s.stroke(wp(q, s.rng, 1.4, 10, True), "#05070a", 1.8, .8, True, "props")
        _scrawl(s, x - hw * .7, y - hh * .1, 1, hw / 320., "#f2efe6", .5, 4)
        s.ellipse(x - hw + 22, y - 2, 7, 7, "#fffaea", .6, "rim")
    s.screen('<rect x="0" y="380" width="%d" height="300" fill="url(#%s)"/>'
             % (W, s.lin([("0", "#e8dfc2", 0), ("0.5", "#e8dfc2", .30),
                          ("1", "#e8dfc2", 0)])), .5)
    _chair(s, CX, 970, 1.0, ("#4a4a52", "#131418"), -1)   # nobody has read one since week three
    s.light(CX, 520, 1000, strength=.7, tint=.16)
    s.light(CX, 940, 700, strength=.6, tint=.10)


@plate("elicitationBooth", "The Elicitation Booth", "bank", seed=633)
def _booth(s):
    g = stage_chamber(s, back=(360, 280), floor_y=830, ceil_y=170, texture="courses")
    # soundproofing on all six surfaces, including the door
    for x0, y0, x1, y1 in ((g["bl"], 300, g["br"], 780), (-40, 200, g["bl"], 900),
                           (g["br"], 200, W + 40, 900)):
        cols = max(3, int((x1 - x0) / 76))
        rows = max(3, int((y1 - y0) / 76))
        for i in range(cols):
            for j in range(rows):
                px = lerp(x0, x1, (i + .5) / cols)
                py = lerp(y0, y1, (j + .5) / rows)
                w_ = (x1 - x0) / cols * .46
                tri = [(px - w_, py + w_), (px, py - w_), (px + w_, py + w_)]
                s.fill(wp(tri, s.rng, 1.6, 10, True), "#2b2f36",
                       s.rng.uniform(.5, .95), "props")
                s.stroke(wp(tri[:2], s.rng, 1.6, 10), s.pal.rim, 1.4,
                         s.rng.uniform(.05, .18), False, "rim")
    prop_table(s, CX, 900, 200, 90, ("#6a6f76", "#22262c"))
    _chair(s, CX - 210, 980, 1.0, ("#4a4a52", "#131418"), 1)
    _chair(s, CX + 210, 900, .92, ("#3f434a", "#101216"), -1)   # never sat in
    _paper(s, CX - 20, 830, 96, 52, "#e4dfcc", 2)     # and the first question is a good one
    s.light(CX, 860, 780, strength=.8, tint=.14)


@plate("assayOffice", "The Assay Office", "temple", seed=634)
def _assay(s):
    g = stage_chamber(s, back=(400, 280), floor_y=830, ceil_y=160, texture="courses")
    prop_table(s, CX, 900, 340, 110, ("#7a6141", "#332a1c"))
    # the balance: this is where a slab is found out
    s.stroke(wob((CX - 130, 790), (CX - 130, 610), s.rng, 1.6, 16), "#3a3024", 10, 1,
             False, "props")
    beam = [(CX - 300, 618), (CX + 40, 606)]
    s.stroke(wp(beam, s.rng, 1.6, 14), "#c9a86a", 7, 1, False, "props")
    for bx, dy in ((CX - 290, 622), (CX + 30, 610)):
        s.stroke(wp([(bx, dy), (bx, dy + 90)], s.rng, 1.4, 10), "#8a7a5c", 2.0, .8,
                 False, "props")
        pan = arc_pts(bx, dy + 96, 62, 20, 0, math.pi, 14)
        s.gfill(wp(pan, s.rng, 1.6, 10, True),
                s.lin([("0", "#c9a86a", 1), ("1", "#4a3c20", 1)]), "props")
        _rim(s, pan, .6, 2.2, None)
    # the acid, the hammers, and two slabs — one of which is about to be a disappointment
    q = [(CX + 250, 800), (CX + 244, 700), (CX + 320, 696), (CX + 328, 796)]
    s.gfill(wp(q, s.rng, 1.6, 10, True),
            s.lin([("0", "#7fd8b6", .8), ("1", "#1d3a30", 1)]), "props")
    _rim(s, q, .7, 2.4, None, True)
    for i in range(5):
        hx = CX - 340 + i * 34
        s.stroke(wp([(hx, 800), (hx + 6, 700)], s.rng, 1.2, 8), "#5a4a34", 5, 1,
                 False, "props")
        s.fill(wp([(hx - 14, 706), (hx - 12, 682), (hx + 22, 680), (hx + 24, 704)],
                  s.rng, 1.2, 8, True), "#8f959c", .95, "props")
    for x, gold in ((CX - 40, True), (CX + 90, False)):
        slab = [(x - 66, 800), (x - 58, 726), (x + 58, 722), (x + 66, 796)]
        s.gfill(wp(slab, s.rng, 2, 12, True),
                s.lin([("0", "#b6a37e" if gold else "#8a8578", 1), ("1", "#2a2318", 1)]),
                "props")
        _rim(s, slab, .6, 2.4, "#ffe9bf" if gold else None, True)
        _scrawl(s, x - 44, 760, 1, .4, "#ffd27a" if gold else "#3a3024", .85, 5)
    prop_torch(s, 180, 700, .8)
    s.light(180, 660, 900, color="#ffb454", strength=.7, tint=.24)
    s.light(CX, 880, 820, strength=.75, tint=.16)


@plate("ossuary", "The Ossuary of Cut Requirements", "hades", seed=635)
def _ossuary(s):
    g = stage_chamber(s, back=(340, 290), floor_y=840, ceil_y=160, texture="chisel")
    # racked, stacked like long bones, each labelled with the release it did not make
    for x0, x1 in ((-40, g["bl"] + 20), (g["bl"] + 40, g["br"] - 40), (g["br"] - 20, W + 40)):
        for row in range(6):
            y = 300 + row * 96
            s.stroke(wob((x0, y + 62), (x1, y + 58), s.rng, 1.4, 20), "#2a3038", 8, 1,
                     False, "props")
            n = max(4, int((x1 - x0) / 30))
            for j in range(n):
                bx = lerp(x0 + 12, x1 - 12, (j + .5) / n)
                ln = s.rng.uniform(40, 58)
                s.stroke(wob((bx, y + 56), (bx + s.rng.uniform(-4, 4), y + 56 - ln),
                             s.rng, 1.6, 10), "#cfc9b4", s.rng.uniform(7, 12), .85,
                         False, "props")
                s.ellipse(bx, y + 56 - ln, 7, 6, "#e8e2d0", .8, "props")
                s.ellipse(bx, y + 56 - ln, 4, 3, s.pal.rim, .35, "rim")
            _paper(s, lerp(x0, x1, .5), y + 78, min(90, (x1 - x0) * .2), 16,
                   "#9aa3ae", 1, .7)
    prop_bones(s, (140, 900, 920, 1030), 12)
    s.light(CX, 940, 800, strength=.95)
    s.light(CX, 520, 460, color="#9fe3d6", strength=.28, tint=.14)


@plate("metamodelStair", "The Metamodel Stair", "marble", seed=636)
def _meta_stair(s):
    g = stage_chamber(s, back=(400, 220), floor_y=850, ceil_y=100, texture="courses")
    prop_stairs(s, CX, 1000, 420, steps=9, down=False, depth=520, rim_op=.5)
    # at each landing, the thing that describes the thing below it
    for i, (y, hw) in enumerate(((820, 380), (650, 280), (500, 196), (380, 130))):
        q = [(CX - hw, y), (CX - hw * .96, y - hw * .62), (CX + hw * .96, y - hw * .62),
             (CX + hw, y)]
        s.gfill(wp(q, s.rng, 2, 16, True),
                s.lin([("0", "#cfc6bb", .30 + .16 * i), ("1", "#2a2725", .5)]), "props")
        s.stroke(wp(q, s.rng, 2, 16, True), "#ffc978", 2.6, .35 + .12 * i, True, "rim")
        # each one holds a smaller copy of the one under it
        inner = [(CX - hw * .44, y - hw * .10), (CX - hw * .42, y - hw * .44),
                 (CX + hw * .42, y - hw * .44), (CX + hw * .44, y - hw * .10)]
        s.stroke(wp(inner, s.rng, 1.6, 12, True), "#fff0d4", 1.8, .3 + .1 * i, True, "rim")
        for k in range(3):
            s.stroke(wob((CX - hw * .3, y - hw * .16 - k * hw * .09),
                         (CX + hw * .3, y - hw * .17 - k * hw * .09), s.rng, 1.4, 12),
                     "#e0d6c6", 1.6, .18 + .06 * i, False, "rim")
    prop_torch(s, 160, 760, .8)
    prop_torch(s, 900, 760, .8)
    s.light(CX, 520, 1000, color="#ffc978", strength=.55, tint=.22)
    s.light(CX, 940, 760, strength=.7, tint=.16)


@plate("metamodelLoft", "The Metamodel Loft", "marble", seed=637)
def _meta_loft(s):
    g = stage_chamber(s, back=(300, 300), floor_y=830, ceil_y=180, texture="courses")
    # the top landing: the model describes itself, and stops
    hw, y = 330, 760
    for i in range(6):
        k = .62 ** i
        q = [(CX - hw * k, y * 1 - (1 - k) * 190), (CX - hw * k * .96, y - hw * k * .78 - (1 - k) * 190),
             (CX + hw * k * .96, y - hw * k * .78 - (1 - k) * 190), (CX + hw * k, y - (1 - k) * 190)]
        s.gfill(wp(q, s.rng, 2, 16, True),
                s.lin([("0", "#cfc6bb", .22 + .1 * i), ("1", "#26231f", .55)]), "props")
        s.stroke(wp(q, s.rng, 2, 16, True), "#ffc978", 2.4, .30 + .1 * i, True, "rim")
        for j in range(3):
            s.stroke(wob((CX - hw * k * .62, y - hw * k * .18 - j * hw * k * .18 - (1 - k) * 190),
                         (CX + hw * k * .62, y - hw * k * .19 - j * hw * k * .18 - (1 - k) * 190),
                         s.rng, 1.4, 12), "#e8dfcb", 1.6, .2, False, "rim")
    s.screen('<ellipse cx="%d" cy="600" rx="300" ry="260" fill="url(#%s)" '
             'filter="url(#soft)"/>'
             % (CX, s.rad([("0", "#fff0d4", .45), ("1", "#fff0d4", 0)])), .9)
    prop_torch(s, 190, 740, .75)
    prop_torch(s, 870, 740, .75)
    s.light(CX, 620, 900, color="#ffc978", strength=.6, tint=.24)
    s.light(CX, 900, 700, strength=.6, tint=.16)


@plate("slagPit", "The Slag Pit", "lava", seed=638)
def _slag(s):
    g = stage_cavern(s, ceil_y=250, floor_y=680, moss=False, stal=True, back_wall=480)
    prop_lava(s, 980, rows=5)
    # what the forge could not use
    for _ in range(40):
        x, y = s.rng.uniform(60, 1000), s.rng.uniform(720, 980)
        q = blob(x, y, s.rng.uniform(20, 70), s.rng, k=7, squash=.5)
        s.gfill(wp(q, s.rng, 3, 12, True),
                s.lin([("0", "#5a3a28", 1), ("1", "#150a08", 1)]), "props")
        s.stroke(wp(q[:4], s.rng, 3, 12), "#ff7a2f", 2.0, s.rng.uniform(.1, .4),
                 False, "rim")
    for _ in range(18):                         # diagrams beaten too thin
        x, y = s.rng.uniform(100, 960), s.rng.uniform(700, 940)
        s.stroke(wp([(x, y), (x + s.rng.uniform(-120, 120), y + s.rng.uniform(-40, 40))],
                    s.rng, 4, 14), "#c9a86a", s.rng.uniform(1.6, 4),
                 s.rng.uniform(.15, .45), False, "rim")
    # one enormous half-finished block, with a name on it
    blk = [(CX - 250, 900), (CX - 210, 600), (CX + 200, 570), (CX + 260, 880)]
    s.gfill(wp(blk, s.rng, 5, 20, True),
            s.lin([("0", "#6e4534", 1), ("1", "#150a08", 1)]), "props")
    s.stroke(wp(blk, s.rng, 5, 20, True), "#0a0605", 3.6, .9, True, "props")
    _rim(s, blk[1:3], .55, 3.2, "#ff9a4d")
    for i in range(5):                          # unfinished, and it shows
        y = 640 + i * 58
        s.stroke(wob((CX - 200 + i * 8, y), (CX + 150 - i * 6, y - 8), s.rng, 3, 16),
                 "#3a2118", 9, .8, False, "props")
    _scrawl(s, CX - 150, 690, 2, .62, "#ffd39a", .85, 5)
    s.light(CX, 960, 1000, color="#ff7a2f", strength=.6, tint=.30)
    s.light(CX - 40, 800, 760, strength=.8, tint=.16)


@plate("contextWindow", "The Context Window", "bank", seed=639)
def _context_window(s):
    g = stage_chamber(s, back=(400, 260), floor_y=830, ceil_y=140, texture="courses")
    opening(s, g["bl"] - 60, 420, 880, 130, "square", depth=.9)
    _paper(s, g["bl"] - 60, 350, 76, 44, "#e4dfcc", 1)   # the stated capacity, posted
    # exactly four things in here, evenly spaced, with a great deal of room round them
    for i, x in enumerate((CX - 270, CX - 90, CX + 90, CX + 270)):
        y = 900
        q = [(x - 62, y + 26), (x - 54, y - 76), (x + 54, y - 80), (x + 62, y + 22)]
        s.gfill(wp(q, s.rng, 2, 12, True),
                s.lin([("0", "#9aa3ae", 1), ("1", "#1a1e22", 1)]), "props")
        s.stroke(wp(q, s.rng, 2, 12, True), "#05070a", 2.6, .85, True, "props")
        _rim(s, q[1:3], .55, 2.6, None)
        _shadow(s, x, y + 28, 70, 16, .6)
        s.stroke(wob((x - 40, y - 20), (x + 40, y - 24), s.rng, 1.2, 10), s.pal.accent,
                 2.0, .35, False, "rim")
    # and, just outside the door, set down politely by your own hands
    for i in range(6):
        x = g["bl"] - 130 + s.rng.uniform(-40, 40)
        y = 940 + i * 14
        q = [(x - 40, y + 14), (x - 34, y - 44), (x + 34, y - 46), (x + 40, y + 12)]
        s.fill(wp(q, s.rng, 2, 10, True), "#141a1e", .95, "props")
        _rim(s, q[1:3], .3, 2.0, None)
    s.light(CX, 880, 980, strength=.85, tint=.12)


@plate("rateLimiter", "The Rate Limiter", "bank", seed=640)
def _rate_limiter(s):
    g = stage_corridor(s, half=280, floor_y=840, ceil_y=170, far=(120, 430, 800),
                       texture="courses")
    # a turnstile, of the sort that admits one person every so often
    for sgn in (-1, 1):
        post = [(CX + sgn * 140 - 34, 900), (CX + sgn * 140 - 28, 680),
                (CX + sgn * 140 + 28, 676), (CX + sgn * 140 + 34, 896)]
        s.gfill(wp(post, s.rng, 2, 14, True),
                s.lin([("0", "#9aa3ae", 1), ("1", "#1c2126", 1)]), "props")
        s.stroke(wp(post, s.rng, 2, 14, True), "#05070a", 2.8, .9, True, "props")
        _rim(s, post[1:3], .6, 2.6, None)
    for a in (0.0, 2.094, 4.189):               # three arms, one of them across the way
        L = 190
        s.stroke(wp([(CX + 140, 720), (CX + 140 + math.cos(a) * L,
                                       720 + math.sin(a) * L * .38)], s.rng, 1.6, 14),
                 "#c2cad3", 13, 1, False, "props")
        s.stroke(wp([(CX + 140, 716), (CX + 140 + math.cos(a) * L,
                                       716 + math.sin(a) * L * .38)], s.rng, 1.6, 14),
                 "#ffffff", 2.4, .45, False, "rim")
    s.ellipse(CX - 140, 664, 26, 18, "#c9483a", .85, "props")
    s.ellipse(CX - 140, 660, 9, 7, "#ff8a7a", .8, "rim")
    # the queue, painted on the floor by somebody who has never stood in it
    for i in range(6):
        y = 900 + i * 30
        s.stroke(wob((CX - 300 + i * 8, y), (CX + 300 - i * 8, y - 4), s.rng, 2, 22),
                 "#d8c24a", 5, .35 - .04 * i, False, "props")
    s.light(CX, 880, 900, strength=.85, tint=.14)


@plate("agentYard", "The Agent Yard", "bank", seed=641)
def _agent_yard(s):
    g = stage_chamber(s, back=(470, 250), floor_y=790, ceil_y=110, texture="courses")
    # small helpers, going about errands at speed — each one doing the one in front's
    ring = arc_pts(CX, 900, 400, 150, 0, 2 * math.pi, 13)
    for i, (x, y) in enumerate(ring):
        sc = .5 + .5 * (y - 750) / 300.
        prop_figure(s, x, y, 210 * sc, ("#5a616a", "#12151a"), .35)
        for k in range(3):                      # at speed, and therefore smeared
            s.fill(wp([(x - 40 * sc - k * 26, y), (x - 34 * sc - k * 26, y - 150 * sc),
                       (x - 10 * sc - k * 26, y - 150 * sc), (x - 16 * sc - k * 26, y)],
                      s.rng, 3, 12, True), "#5a616a", .18 - k * .05, "props")
        a = math.atan2(ring[(i + 1) % len(ring)][1] - y, ring[(i + 1) % len(ring)][0] - x)
        s.stroke(wp([(x + math.cos(a) * 40, y - 60 * sc),
                     (x + math.cos(a) * 110, y - 62 * sc)], s.rng, 2, 10),
                 s.pal.accent, 2.2, .35, False, "rim")
    s.ellipse(CX, 900, 300, 112, "#0a0d10", .5, "props", blur="soft")
    s.light(CX, 860, 1000, strength=.8, tint=.14)
    s.light(CX, 460, 700, strength=.4, tint=.10)


@plate("fineTuningCellar", "The Fine-Tuning Cellar", "earth", seed=642)
def _fine_tuning(s):
    g = stage_chamber(s, back=(320, 300), floor_y=840, ceil_y=170, texture="courses")
    # where a helper is taught to agree: the same answer, written out, a great many times
    for row in range(9):
        y = 340 + row * 56
        for col in range(3):
            x = lerp(g["bl"] + 60, g["br"] - 60, (col + .5) / 3)
            _scrawl(s, x - 100, y, 2, .44, "#b89a6a", .30 + .05 * row, 5)
    prop_table(s, CX, 940, 260, 100, ("#6a5638", "#2a2016"))
    for i in range(5):
        _paper(s, CX - 120 + i * 60, 860, 54, 34, "#cfc4a4", 1, .85)
    # the shelf near the door, and the box on it, labelled and dated
    s.stroke(wob((g["br"] - 300, 700), (g["br"] + 40, 692), s.rng, 1.6, 18), "#3a2f1e",
             11, 1, False, "props")
    box = [(g["br"] - 190, 686), (g["br"] - 186, 606), (g["br"] - 60, 600),
           (g["br"] - 56, 682)]
    s.gfill(wp(box, s.rng, 2, 12, True),
            s.lin([("0", "#8a7048", 1), ("1", "#241c10", 1)]), "props")
    s.stroke(wp(box, s.rng, 2, 12, True), "#0d0a06", 2.6, .9, True, "props")
    _rim(s, box[1:3], .7, 2.8, None)
    _paper(s, g["br"] - 124, 646, 44, 22, "#ddd7c2", 1, .95)
    prop_treasure_glint(s, [(g["br"] - 124, 640)], "#ffe9b0")
    s.light(CX + 120, 880, 820, strength=.95)


@plate("sortieBoard", "The Sortie Board", "bank", seed=643)
def _sortie(s):
    g = stage_chamber(s, back=(450, 240), floor_y=830, ceil_y=120, texture="courses")
    x0, x1, y0, y1 = g["bl"] + 30, g["br"] - 30, 260, 780
    s.gfill(wp([(x0, y1), (x0, y0), (x1, y0), (x1, y1)], s.rng, 1.6, 20, True),
            s.lin([("0", "#2a2f2c", 1), ("1", "#141715", 1)]), "props")
    _rim(s, [(x0, y1), (x0, y0), (x1, y0), (x1, y1)], .7, 3.4, None, True)
    cols = (x0 + 120, x0 + 330, x0 + 520, x0 + 700)
    for cx_ in cols:                            # ruled, in chalk, by hand
        s.stroke(wob((cx_, y0 + 20), (cx_, y1 - 20), s.rng, 1.6, 22), "#cfc9b4", 2.2,
                 .6, False, "rim")
    for i in range(13):
        y = lerp(y0 + 34, y1 - 24, i / 12)
        s.stroke(wob((x0 + 20, y), (x1 - 20, y - 3), s.rng, 1.4, 22), "#cfc9b4", 1.4,
                 .28, False, "rim")
        if i == 0:
            _scrawl(s, x0 + 40, y - 22, 4, .48, "#e8e4d8", .85, 4)
            continue
        for k, cx_ in enumerate(cols[:3]):      # time out, time back, and what for
            if k == 2:
                continue
            _scrawl(s, cx_ - 90, y - 14, 1, .4, "#cfc9b4", .55, 4)
    # the WHAT FOR column, ruled twice and never filled in
    s.stroke(wob((cols[2] + 4, y0 + 20), (cols[2] + 4, y1 - 20), s.rng, 1.6, 22),
             "#cfc9b4", 2.4, .7, False, "rim")
    s.light(CX, 520, 1000, strength=.65, tint=.12)
    s.light(CX, 920, 760, strength=.7, tint=.12)


@plate("weatherDeck", "The Weather Deck", "canyon", seed=644)
def _weather_deck(s):
    sky(s, 560, sun=None)
    # the skin of the cloud the platform makes for itself
    for i in range(9):
        y = 200 + i * 54
        s.screen('<ellipse cx="%.0f" cy="%.0f" rx="%.0f" ry="%.0f" fill="url(#%s)" '
                 'filter="url(#soft)"/>'
                 % (s.rng.uniform(100, 960), y, s.rng.uniform(280, 560),
                    s.rng.uniform(50, 110),
                    s.rad([("0", "#e8eef2", .6), ("1", "#e8eef2", 0)])),
                 s.rng.uniform(.4, .9))
    _mist(s, 620, 400, 1.0, "#dfe8ee")
    deck = [(-60, 800), (W + 60, 776), (W + 60, H + 60), (-60, H + 60)]
    s.surface(deck, ("#8d939a", "#2b3036"), 4, 50, edge="#14171a", edge_op=.6)
    for i in range(13):
        x = lerp(-40, W + 40, i / 12)
        s.line((x, 810), (x + 24, H + 40), "#1e2328", 2.6, .28, 2.0, 44)
    prop_railing(s, [(-40, 812), (CX, 786), (W + 40, 806)], height=118, posts=11)
    for _ in range(140):                        # rained on, at four thousand feet, by us
        x, y = s.rng.uniform(-40, W + 40), s.rng.uniform(120, 1000)
        s.stroke([(x, y), (x - 9, y + s.rng.uniform(30, 70))], "#dfeef5",
                 s.rng.uniform(1.0, 2.2), s.rng.uniform(.14, .5), False, "rim")
    for _ in range(26):                         # standing water on the plate
        s.ellipse(s.rng.uniform(0, W), s.rng.uniform(860, 1040), s.rng.uniform(30, 110),
                  s.rng.uniform(6, 16), "#c4d2d6", s.rng.uniform(.1, .3), "props")
    s.light(CX, 400, 1500, color="#e8eef2", strength=.6, tint=.10)


@plate("debriefRoom", "The Debrief Room", "bank", seed=645)
def _debrief(s):
    g = stage_chamber(s, back=(430, 250), floor_y=820, ceil_y=130, texture="courses")
    # nine chairs, in a circle, and they are used
    ring = arc_pts(CX, 930, 380, 150, 0, 2 * math.pi, 9)
    for x, y in sorted(ring, key=lambda q: q[1]):
        sc = .62 + .5 * (y - 780) / 300.
        _chair(s, x, y, sc, ("#4a4a52", "#131418"), 1 if y < 930 else -1)
    # the flip chart, which is full
    s.stroke(wob((250, 880), (210, 560), s.rng, 1.6, 16), "#5a5f66", 8, 1, False, "props")
    s.stroke(wob((250, 880), (300, 560), s.rng, 1.6, 16), "#5a5f66", 8, 1, False, "props")
    q = [(140, 620), (150, 330), (400, 322), (396, 612)]
    s.fill(wp(q, s.rng, 1.6, 14, True), "#eee9da", .95, "props")
    _rim(s, q, .8, 2.8, None, True)
    for i in range(7):
        _scrawl(s, 175, 370 + i * 36, 2, .4, "#2f3a48", .8, 4)
    for i in range(3):
        _scrawl(s, 175, 370 + (4 + i) * 36, 1, .4, "#c9483a", .8, 4)
    s.light(CX, 880, 950, strength=.8, tint=.14)
    s.light(300, 480, 600, strength=.45, tint=.12)


@plate("rehearsalHangar", "The Rehearsal Hangar", "ice", seed=646)
def _rehearsal(s):
    g = stage_chamber(s, back=(490, 200), floor_y=840, ceil_y=-160, ceiling=False,
                      texture="courses")
    for i in range(9):                          # the roof trusses of a very large shed
        y = 90 + i * 34
        s.stroke(wob((-40, y), (W + 40, y + s.rng.uniform(-10, 10)), s.rng, 3, 34),
                 "#1d2b34", 7, .8, False, "props")
    for i in range(7):
        x = lerp(-40, W + 40, i / 6)
        s.stroke(wob((x, 60), (x, 400), s.rng, 2, 24), "#1d2b34", 9, .7, False, "props")
    # the mission, flown at one to one, to an empty floor, for eleven years
    s.screen('<ellipse cx="%d" cy="600" rx="440" ry="300" fill="url(#%s)" '
             'filter="url(#soft)"/>'
             % (CX, s.rad([("0", "#bfe6ff", .40), ("1", "#bfe6ff", 0)])), .9)
    for i in range(5):
        t = i / 4.
        x = lerp(200, 880, t)
        y = 640 - 120 * math.sin(t * math.pi)
        body = [(x - 130, y + 26), (x - 90, y - 34), (x + 110, y - 30), (x + 140, y + 22)]
        s.gfill(wp(body, s.rng, 3, 14, True),
                s.lin([("0", "#d3e9f5", .52 - .07 * i), ("1", "#7ea2b8", .10)]), "props")
        s.stroke(wp(body, s.rng, 3, 14, True), "#dff2ff", 2.4, .55 - .08 * i, True, "rim")
        s.stroke(wp([(x - 40, y - 30), (x - 10, y - 92), (x + 60, y - 88)], s.rng, 3, 12),
                 "#dff2ff", 2.2, .42 - .06 * i, False, "rim")
    for i in range(11):                         # the tape on the floor it is flown over
        x = lerp(-20, W + 20, i / 10)
        s.stroke(wob((x, 880), (x + (x - CX) * .2, H + 40), s.rng, 2, 26), "#d8c24a",
                 3.4, .45, False, "props")
    s.light(CX, 620, 1200, color="#bfe6ff", strength=.62, tint=.26)
    s.light(CX, 950, 900, strength=.85, tint=.12)


@plate("continentalFloor", "The Continental Model Floor", "bank", seed=647)
def _continental(s):
    g = stage_chamber(s, back=(480, 200), floor_y=620, ceil_y=90, texture="courses")
    # the gantry's model, but underfoot: a continent, at eight minutes a crossing
    floor = [(-80, 620), (W + 80, 600), (W + 80, H + 60), (-80, H + 60)]
    s.gfill(wp(floor, s.rng, 3, 40, True),
            s.lin([("0", "#3f5a63", 1), ("1", "#0d1720", 1)]), "geo")
    coast = [(-60, 900), (140, 840), (300, 870), (420, 800), (560, 820), (700, 760),
             (860, 790), (W + 60, 740)]
    s.gfill(wp(coast + [(W + 60, H + 60), (-60, H + 60)], s.rng, 6, 26, True),
            s.lin([("0", "#7d8a64", 1), ("1", "#232c1c", 1)]), "props")
    s.stroke(wp(coast, s.rng, 6, 26), "#bfe6ff", 3.4, .8, False, "rim")
    for _ in range(9):                          # rivers, in the way rivers are
        x = s.rng.uniform(0, W)
        s.stroke(wp([(x, H + 20), (x + s.rng.uniform(-90, 90), 960),
                     (x + s.rng.uniform(-160, 160), 860),
                     (x + s.rng.uniform(-200, 200), 790)], s.rng, 6, 18), "#7fb6cc",
                 s.rng.uniform(1.4, 3.0), s.rng.uniform(.2, .5), False, "rim")
    for _ in range(26):                         # a city is a smudge
        s.ellipse(s.rng.uniform(0, W), s.rng.uniform(760, 1040), s.rng.uniform(14, 46),
                  s.rng.uniform(5, 16), "#e8dfc2", s.rng.uniform(.2, .6), "props",
                  blur="soft3")
    for _ in range(7):                          # a power line is a hair
        y = s.rng.uniform(740, 1010)
        s.stroke(wob((-40, y), (W + 40, y + s.rng.uniform(-60, 60)), s.rng, 5, 34),
                 "#ffd9a0", 1.0, s.rng.uniform(.2, .45), False, "rim")
    prop_railing(s, [(-40, 700), (CX, 668), (W + 40, 692)], height=90, posts=9)
    s.light(CX, 900, 1250, strength=.95, tint=.16)
    s.light(CX - 250, 1010, 800, strength=.8, tint=.10)
    s.light(CX, 400, 760, strength=.5, tint=.12)


@plate("magnitudeStair", "The Order-of-Magnitude Stair", "bank", seed=648)
def _magnitude(s):
    p = s.pal
    s.add('<rect x="0" y="0" width="%d" height="%d" fill="url(#%s)"/>'
          % (W, H, s.lin([("0", p.bg[0], 1), ("0.5", p.bg[1], 1), ("1", p.bg[2], 1)])),
          "bg")
    # ten steps, and each step is ten of the last
    y, x = H + 70, -150.
    for i in range(10):
        rise = 24 * (1.44 ** i)
        run = 40 * (1.44 ** i)
        q = [(x, y), (x, y - rise), (x + run, y - rise), (x + run, y)]
        s.gfill(wp(q, s.rng, 2, 16, True),
                s.lin([("0", "#7b848f", 1), ("1", "#161b21", 1)]), "geo")
        s.stroke(wp(q, s.rng, 2, 16, True), "#05070a", 2.6, .8, True, "geo")
        s.stroke(wp(q[1:3], s.rng, 2, 16), p.rim, 2.6, .5, False, "rim")
        _scrawl(s, x + 8, y - rise - 18, 1, .2 + .05 * i, "#e8dfc2", .5, 2)
        x += run
        y -= rise
        if x > W + 200:
            break
    # from up here you cannot see any of this at all, and can see what it was for
    s.screen('<ellipse cx="850" cy="200" rx="440" ry="320" fill="url(#%s)" '
             'filter="url(#soft)"/>'
             % s.rad([("0", "#fffaea", .85), ("1", "#fffaea", 0)]), 1.0)
    for i in range(4):
        s.stroke(arc_pts(850, 210, 130 + i * 60, 120 + i * 54, math.pi * .95,
                         math.pi * 2.05, 20), "#fffaea", 2.2, .55 - .09 * i, False, "rim")
    s.specks((540, 40, W, 460), 120, "#fffaea", (1, 3.4), (.15, .55))
    s.light(850, 220, 1100, strength=.7, tint=.26)
    s.light(240, 980, 900, strength=.85, tint=.14)
    s.light(CX + 120, 720, 800, strength=.65, tint=.12)


@plate("longNowRoom", "The Long Now Room", "temple", seed=649)
def _long_now(s):
    g = stage_chamber(s, back=(380, 260), floor_y=830, ceil_y=150, texture="courses")
    # a clock that ticks once a year
    face = arc_pts(CX, 520, 260, 260, 0, 2 * math.pi, 48)
    s.gfill(wp(face, s.rng, 3, 20, True),
            s.lin([("0", "#b6a37e", 1), ("1", "#2a2318", 1)]), "props")
    s.stroke(wp(face, s.rng, 3, 20, True), "#1a140e", 3.6, .9, True, "props")
    _rim(s, face[:24], .6, 3.0, None)
    for i in range(12):
        a = math.pi * 2 * i / 12
        s.stroke([(CX + math.cos(a) * 214, 520 + math.sin(a) * 214),
                  (CX + math.cos(a) * 244, 520 + math.sin(a) * 244)], "#ffe9bf", 3.4,
                 .6, False, "rim")
    s.stroke(wp([(CX, 520), (CX + 6, 330)], s.rng, 1.2, 10), "#ffe9bf", 6, .85,
             False, "rim")
    # and a dial that turns once a century, behind it
    dial = arc_pts(CX, 520, 96, 96, 0, 2 * math.pi, 30)
    s.gfill(wp(dial, s.rng, 2, 14, True),
            s.lin([("0", "#7d6c50", 1), ("1", "#171208", 1)]), "props")
    s.stroke(wp([(CX, 520), (CX - 62, 468)], s.rng, 1.2, 8), "#ffb454", 4, .8, False, "rim")
    # the maintenance schedule, in a hand that expected to be dead before the next entry
    _paper(s, 190, 700, 120, 150, "#ddd7c2", 6)
    prop_candles(s, 880, 800, 1.0)
    prop_pedestal(s, CX, 900, 120, 150)
    s.light(880, 760, 800, color="#ffb454", strength=.6, tint=.24)
    s.light(CX, 560, 900, color="#ffe9bf", strength=.5, tint=.20)
    s.light(CX, 940, 700, strength=.6, tint=.16)


@plate("ballastYard", "The Ballast Yard", "stone", seed=650)
def _ballast(s):
    g = stage_chamber(s, back=(440, 250), floor_y=830, ceil_y=130, texture="courses")
    # stacks of the mass you have to add to a thing to make it behave at size
    for col, (x, n) in enumerate(((170, 7), (340, 5), (540, 8), (740, 4), (920, 6))):
        for i in range(n):
            y = 990 - i * 46
            hw = 92 - i * 3
            q = [(x - hw, y + 24), (x - hw + 8, y - 22), (x + hw - 6, y - 24),
                 (x + hw, y + 22)]
            s.gfill(wp(q, s.rng, 2, 12, True),
                    s.lin([("0", "#7b8894" if i % 3 else "#8a8272", 1),
                           ("1", "#12171b", 1)]), "props")
            s.stroke(wp(q, s.rng, 2, 12, True), "#05070a", 2.4, .85, True, "props")
            _rim(s, q[1:3], .45, 2.4, None)
            if i % 3 == 0:                      # most of it is process
                for k in range(4):
                    s.stroke(wob((x - hw + 20, y - 12 + k * 9), (x + hw - 20, y - 14 + k * 9),
                                 s.rng, 1, 8), "#cfc9b4", 1.6, .35, False, "rim")
    s.stroke(wob((-40, 700), (W + 40, 690), s.rng, 2, 30), "#3a4046", 16, 1, False, "props")
    prop_chain(s, 300, 240, 690, 12, 12)
    prop_chain(s, 760, 240, 690, 12, 12)
    s.light(CX, 900, 900, strength=.9)


# ===========================================================================
# ACT IV — THE RELEASE CANDIDATE, THE REST OF IT
# ===========================================================================
@plate("rcConcourse", "The Client Concourse, Mirrored", "ice", seed=661)
def _rc_concourse(s):
    g = stage_corridor(s, half=250, floor_y=840, ceil_y=170, far=(120, 420, 800),
                       texture="courses")
    for sgn in (-1, 1):                         # every way, laid out again, with nobody
        for i in range(4):
            x = CX + sgn * (300 + i * 96)
            y = 600 - i * 34
            q = [(x - 54, y), (x - 48, y - 96), (x + 48, y - 96), (x + 54, y)]
            _dark(s, q, ("#2c3d49", "#080d11"))
            s.gfill(wp([(x - 42, y - 12), (x - 38, y - 84), (x + 38, y - 84),
                        (x + 42, y - 12)], s.rng, 1.2, 12, True),
                    s.lin([("0", "#bfe6ff", .35), ("1", "#0e1a22", .9)]), "props")
            _rim(s, q, .55, 2.2, None, True)
    # the teletype at the far end, stopped in the middle of a word
    prop_table(s, CX, 880, 170, 90, ("#4a5560", "#161c22"))
    tt = [(CX - 120, 800), (CX - 110, 700), (CX + 110, 694), (CX + 120, 794)]
    _dark(s, tt, ("#a9c8da", "#1a252c"))
    _rim(s, tt, .8, 3.0, None, True)
    sheet = [(CX - 84, 700), (CX - 78, 600), (CX + 78, 594), (CX + 84, 694)]
    s.fill(wp(sheet, s.rng, 1.4, 12, True), "#eef6fa", .95, "props")
    for i in range(3):
        _scrawl(s, CX - 60, 620 + i * 26, 2, .38, "#2a3138", .8, 4)
    _scrawl(s, CX - 60, 698, 1, .38, "#2a3138", .8, 2)      # it stopped mid-word
    s.light(CX, 700, 900, color="#bfe6ff", strength=.5, tint=.24)
    s.light(CX, 920, 780, strength=.6, tint=.14)


@plate("rcWing", "The Deprecated Wing, Mirrored", "ice", seed=662)
def _rc_wing(s):
    g = stage_chamber(s, back=(400, 300), floor_y=820, ceil_y=160, texture="courses")
    # this room, and this room, and this room, going back as far as the light reaches
    for d in range(5):
        k = .78 ** d
        off = 1 - k
        for i, sgn in enumerate((-1, 0, 1)):
            x = CX + sgn * 230 * k
            base = 900 - off * 300
            top = 470 - off * 260
            sheet = [(x - 118 * k, base), (x - 100 * k, top + 40 * k), (x, top),
                     (x + 100 * k, top + 40 * k), (x + 118 * k, base)]
            s.gfill(wp(sheet, s.rng, 5 * k, 18, True),
                    s.lin([("0", "#a9c8da", .95 - d * .17), ("1", "#12202a", 1)]),
                    "props")
            s.stroke(wp(sheet, s.rng, 5 * k, 18, True), "#060c11", 2.6 * k, .8,
                     True, "props")
            _rim(s, sheet[1:4], .45 - d * .07, 2.6 * k, None)
    for _ in range(40):                         # dust, on all of them
        s.ellipse(s.rng.uniform(60, 1000), s.rng.uniform(600, 1000),
                  s.rng.uniform(1, 3), s.rng.uniform(1, 3), "#dff2ff",
                  s.rng.uniform(.1, .4), "rim")
    s.light(CX, 900, 760, color="#bfe6ff", strength=.9, tint=.16)


# ===========================================================================
# ACT V — THE GROUND
# ===========================================================================
# The last act happens outdoors, at ground level, mostly in the wet. It keeps
# the day palette's low dark floor; only the hour changes.
DAWN = Palette("day", ("#232a38", "#3a3f4a", "#4a4436"),
               ("#3a4438", "#12160f"), ("#57604c", "#252c1d"),
               "#2a3020", "#ffb87a", "#ffe8c8", ("#6e6a4e", "#26261c"),
               sky=("#2b3c63", "#f0b47e"), haze="#d8a882", ink="#0e1014")


def _hut(s, cx, base_y, half=200, height=170, lit=True, tone=("#8a8f86", "#2a2e2a")):
    """A portacabin on blocks: the whole of the follow-on programme, so far."""
    body = [(cx - half, base_y), (cx - half + 6, base_y - height),
            (cx + half - 6, base_y - height - 8), (cx + half, base_y - 8)]
    s.gfill(wp(body, s.rng, 2, 18, True), s.lin([("0", tone[0], 1), ("1", tone[1], 1)]),
            "props")
    s.stroke(wp(body, s.rng, 2, 18, True), "#0e1210", 3.0, .9, True, "props")
    _rim(s, body[1:3], .55, 2.6, None)
    roof = [(cx - half - 16, base_y - height + 4), (cx - half - 6, base_y - height - 22),
            (cx + half + 6, base_y - height - 30), (cx + half + 16, base_y - 4 - height)]
    s.fill(wp(roof, s.rng, 2, 14, True), "#3f4642", .95, "props")
    _rim(s, roof[1:3], .5, 2.4, None)
    for i in range(4):                          # up on blocks, as they always are
        bx = lerp(cx - half + 30, cx + half - 30, i / 3)
        s.fill(wp([(bx - 20, base_y + 34), (bx - 18, base_y - 4), (bx + 18, base_y - 6),
                   (bx + 20, base_y + 32)], s.rng, 1.6, 8, True), "#3a3a34", .9, "props")
    win = [(cx - half * .45, base_y - height * .34), (cx - half * .45, base_y - height * .78),
           (cx + half * .18, base_y - height * .80), (cx + half * .18, base_y - height * .36)]
    if lit:
        s.gfill(wp(win, s.rng, 1.4, 10, True),
                s.lin([("0", "#ffe0a8", 1), ("1", "#c98a3a", 1)]), "props")
        s.screen('<ellipse cx="%.0f" cy="%.0f" rx="200" ry="150" fill="url(#%s)" '
                 'filter="url(#soft)"/>'
                 % (cx - half * .14, base_y - height * .56,
                    s.rad([("0", "#ffd9a0", .55), ("1", "#ffd9a0", 0)])), .9)
    else:
        _dark(s, win, ("#39424a", "#0d1114"))
    _rim(s, win, .6, 2.2, None, True)
    door = [(cx + half * .42, base_y - 4), (cx + half * .42, base_y - height * .74),
            (cx + half * .80, base_y - height * .76), (cx + half * .80, base_y - 6)]
    _dark(s, door, ("#4a5048", "#12160f"))
    _rim(s, door, .5, 2.2, None, True)
    return body


@plate("scatterField", "The Scatter Field", "day", seed=671)
def _scatter(s):
    stage_outdoor(s, horizon=520, sun=(300, 160),
                  bands=((0, "#8a9a76", "#65764e"), (46, "#546441", "#374429")))
    prop_forest_band(s, 580, 12, (240, 400), tone="#22301c", rim_op=.06, spread=100)
    # four thousand feet of platform, arriving, and still arriving
    for _ in range(46):
        x, y = s.rng.uniform(-40, W + 40), s.rng.uniform(120, 900)
        t = (y - 120) / 800.
        hw = lerp(16, 74, t) * s.rng.uniform(.6, 1.4)
        q = [(x - hw, y + hw * .7), (x - hw * .84, y - hw * .7), (x + hw, y - hw * .6),
             (x + hw * .9, y + hw * .8)]
        s.gfill(wp(q, s.rng, 2, 10, True),
                s.lin([("0", "#e4dfcc", 1), ("1", "#8a8878", 1)]), "props")
        s.stroke(wp(q, s.rng, 2, 10, True), "#2a2c26", 1.8, .7, True, "props")
        _scrawl(s, x - hw * .6, y, 1, hw / 260., "#3a3630", .55, 4)
    for _ in range(80):                         # and the forest taking it all calmly
        x, y = s.rng.uniform(0, W), s.rng.uniform(700, H)
        s.fill(wp(blob(x, y, s.rng.uniform(20, 70), s.rng, k=8, squash=.5), s.rng, 4,
                  12, True), "#26361c", s.rng.uniform(.4, .95), "props")
    for _ in range(18):                         # sheets, caught in the branches
        x, y = s.rng.uniform(60, W - 60), s.rng.uniform(300, 620)
        s.fill(wp([(x - 40, y + 20), (x - 30, y - 26), (x + 44, y - 18), (x + 36, y + 26)],
                  s.rng, 5, 10, True), "#efe9d6", s.rng.uniform(.5, .95), "props")
    prop_treasure_glint(s, [(300, 960), (700, 990), (520, 930)], "#e8dfc0")
    s.light(300, 200, 1500, color="#fff3d0", strength=.78, tint=.16)


@plate("wreckOfTheHalls", "The Halls, Come Down", "day", seed=672)
def _wreck(s):
    stage_outdoor(s, horizon=500, sun=(820, 180),
                  bands=((0, "#8a9a76", "#63744c"), (46, "#516041", "#354228")))
    prop_forest_band(s, 560, 10, (200, 320), tone="#22301c", rim_op=.05, spread=118)
    # seven halls, no longer bolted to anything, lying open like a diagram
    for i, (x, y, w_, rot) in enumerate(((120, 800, 210, .16), (380, 760, 190, -.10),
                                         (640, 790, 230, .08), (900, 750, 180, -.14),
                                         (250, 960, 260, -.06), (600, 990, 240, .10),
                                         (900, 940, 200, -.18))):
        h_ = w_ * .55
        q = [(x - w_, y + h_ + rot * 200), (x - w_ * .9, y - h_),
             (x + w_, y - h_ + rot * 120), (x + w_ * .94, y + h_)]
        s.gfill(wp(q, s.rng, 4, 16, True),
                s.lin([("0", "#b0b4ac", 1), ("1", "#2f3430", 1)]), "props")
        s.stroke(wp(q, s.rng, 4, 16, True), "#141713", 3.0, .9, True, "props")
        _rim(s, q[1:3], .5, 2.6, None)
        for k in range(4):                      # you can walk in through the roof
            s.stroke(wob(lp(q[1], q[2], (k + .5) / 4), lp(q[0], q[3], (k + .5) / 4),
                         s.rng, 3, 14), "#3a4038", 4, .55, False, "props")
        s.fill(wp([lp(q[1], q[2], .3), lp(q[1], q[2], .62), lp(q[0], q[3], .58),
                   lp(q[0], q[3], .28)], s.rng, 3, 12, True), "#0d1010", .85, "props")
    # the vault came down with the rest of it, and its niches are tipped out
    niche = [(CX - 180, 700), (CX - 160, 590), (CX + 180, 578), (CX + 200, 690)]
    s.gfill(wp(niche, s.rng, 3, 14, True),
            s.lin([("0", "#c9c4b2", 1), ("1", "#3a3a32", 1)]), "props")
    for i in range(13):
        nx = CX - 150 + (i % 7) * 50
        ny = 620 + (i // 7) * 46
        s.fill(wp([(nx - 16, ny + 16), (nx - 14, ny - 16), (nx + 16, ny - 17),
                   (nx + 15, ny + 15)], s.rng, 1.4, 8, True), "#111412", .9, "props")
    # and everything you spent the game putting somewhere safe, in the wet grass, safe
    glints = [(220, 1000), (400, 1030), (560, 1005), (720, 1035), (860, 1000),
              (300, 940), (640, 950)]
    for x, y in glints:
        s.ellipse(x, y, 26, 12, "#e8dfc0", .55, "props", blur="soft3")
    prop_treasure_glint(s, glints, "#ffe9b0")
    s.light(820, 200, 1500, color="#fff3d0", strength=.8, tint=.16)


@plate("newProgramOffice", "The New Program Office", "day", seed=673)
def _npo(s):
    stage_outdoor(s, horizon=540, sun=(240, 190),
                  bands=((0, "#87977394"[:7], "#617248"), (46, "#4f5e3d", "#333f26")))
    prop_forest_band(s, 596, 11, (200, 330), tone="#1e2b18", rim_op=.05, spread=110)
    prop_path(s, near=(CX - 40, H + 40, 300), far=(CX + 20, 610, 40), tone="#a49a80")
    _hut(s, CX + 20, 880, 300, 230, lit=True)
    # the generator, running, three weeks old and the only new thing here
    gen = [(180, 900), (186, 810), (330, 802), (336, 892)]
    s.gfill(wp(gen, s.rng, 2, 12, True), s.lin([("0", "#c9772a", 1), ("1", "#3a2410", 1)]),
            "props")
    s.stroke(wp(gen, s.rng, 2, 12, True), "#160e06", 2.6, .9, True, "props")
    _rim(s, gen[1:3], .6, 2.6, None)
    for i in range(5):
        s.stroke(wp([(250 + i * 6, 800), (240 + i * 14, 740 - i * 20)], s.rng, 4, 10),
                 "#cfd3cc", 3.0, .18, False, "rim")
    s.stroke(wp([(336, 860), (420, 880), (CX - 80, 856)], s.rng, 4, 14), "#1a1c18", 5,
             .9, False, "props")
    s.light(CX - 40, 800, 1000, color="#ffd9a0", strength=.5, tint=.20)
    s.light(240, 220, 1400, color="#fff3d0", strength=.6, tint=.14)


@plate("siteHut", "The Site Hut", "day", seed=674)
def _site_hut(s):
    stage_outdoor(s, horizon=560, sun=(880, 240),
                  bands=((0, "#7f8f6d", "#5b6c45"), (46, "#4a5939", "#2f3a23")))
    prop_forest_band(s, 610, 13, (230, 360), tone="#1c2816", rim_op=.04, spread=96)
    _mist(s, 700, 200, .5, "#cfd8cc")
    _hut(s, CX + 40, 900, 230, 190, lit=False, tone=("#78807a", "#22261f"))
    # colder, smaller, a little way off, and the work is being done in here
    for i in range(9):
        x = lerp(120, 300, i / 8)
        s.stroke(wob((x, 980), (x + 10, 900), s.rng, 3, 12), "#4a5240", 4, .6,
                 False, "props")
    s.stroke(wp([(CX + 40, 720), (CX + 30, 640)], s.rng, 3, 12), "#5a6058", 8, .9,
             False, "props")   # a stovepipe, not lit either
    s.rocks((40, 960, 1020, 1045), 14, (8, 22), rim_op=(.04, .14))
    s.light(880, 260, 1300, color="#e8ecdc", strength=.6, tint=.10)


@plate("recordsOffice", "The Records Office", "house", seed=675)
def _records(s):
    g = stage_interior(s, wall_y=(150, 720), back_half=430)
    prop_shelves(s, -40, g["bl"] + 120, 200, 700, 6, ransacked=False)
    prop_shelves(s, g["br"] - 120, W + 40, 200, 700, 6, ransacked=False)
    # a counter, a clerk, and a shelf of things that became true by being written down
    counter = [(CX - 380, 1000), (CX - 340, 760), (CX + 340, 752), (CX + 384, 992)]
    s.gfill(wp(counter, s.rng, 2, 20, True),
            s.lin([("0", "#9c7c52", 1), ("1", "#2a2016", 1)]), "props")
    s.stroke(wp(counter, s.rng, 2, 20, True), "#120c06", 3.0, .9, True, "props")
    s.stroke(wp(counter[1:3], s.rng, 2, 20), s.pal.rim, 3.0, .5, False, "rim")
    prop_figure(s, CX + 40, 748, 400, ("#4a4238", "#0f0c08"), .6)
    # the form, with a field for who is going to live with it
    _paper(s, CX - 190, 800, 130, 76, "#e8e0c8", 3)
    prop_lamp(s, CX - 330, 770, .5, lit=True)
    prop_window(s, CX, 380, 130, 150, daylight=True)
    s.beam((CX, 420), (CX - 320, H + 20), (CX + 340, H + 20), "#ffe6b8", .26)
    s.light(CX, 460, 1000, color="#ffdca8", strength=.55, tint=.20)
    s.light(CX - 300, 800, 700, color="#ffdca8", strength=.6, tint=.18)


@plate("signingTent", "The Signing Tent", "day", seed=676)
def _signing(s):
    stage_outdoor(s, horizon=560, sun=(300, 200),
                  bands=((0, "#7f8f6d", "#5b6c45"), (46, "#4a5939", "#2f3a23")))
    prop_forest_band(s, 610, 10, (200, 320), tone="#1e2b18", rim_op=.04, spread=120)
    # a gazebo, on wet grass
    for x in (200, 860, 300, 760):
        s.stroke(wob((x, 940), (x + (x - CX) * .04, 470), s.rng, 2, 20), "#c8c4b4", 10,
                 1, False, "props")
    canopy = [(120, 470), (CX, 330), (940, 462), (CX, 520)]
    s.gfill(wp(canopy, s.rng, 4, 18, True),
            s.lin([("0", "#f2efe4", 1), ("1", "#8e8c80", 1)]), "props")
    s.stroke(wp(canopy, s.rng, 4, 18, True), "#2a2c26", 2.6, .85, True, "props")
    _rim(s, canopy[:2], .7, 3.0, "#ffffff")
    prop_folding_table(s, CX, 900, 300)
    _chair(s, CX - 180, 990, 1.0, ("#4a4a42", "#151610"), 1)     # two on one side
    _chair(s, CX + 20, 995, 1.0, ("#4a4a42", "#151610"), 1)
    _chair(s, CX + 250, 900, .92, ("#4a4a42", "#151610"), -1)    # one on the other
    _paper(s, CX - 40, 820, 110, 58, "#efe9d6", 2)
    s.stroke(wob((CX + 90, 826), (CX + 150, 806), s.rng, 1.2, 8), "#1a1c20", 5.0, .9,
             False, "props")   # there is always a pen on the table
    for _ in range(40):                         # wet grass
        x, y = s.rng.uniform(0, W), s.rng.uniform(900, H)
        s.stroke(wp([(x, y), (x + s.rng.uniform(-12, 12), y - s.rng.uniform(20, 50))],
                    s.rng, 2, 8), "#8fa07a", 2.0, s.rng.uniform(.15, .4), False, "rim")
    s.light(300, 240, 1400, color="#fff3d0", strength=.7, tint=.14)


@plate("theRoadAtDawn", "The Road at Dawn", DAWN, seed=677)
def _road_dawn(s):
    stage_outdoor(s, horizon=560, sun=(760, 470), mist=True,
                  bands=((0, "#3d4636", "#242c1e"), (44, "#2c3527", "#171d14")))
    prop_forest_band(s, 610, 14, (240, 400), tone="#0e1409", rim_op=.22, spread=94)
    prop_path(s, near=(CX - 20, H + 40, 320), far=(CX + 30, 604, 44), tone="#6a6250")
    # the hour when it stops being night
    s.screen('<rect x="0" y="250" width="%d" height="540" fill="url(#%s)"/>'
             % (W, s.lin([("0", "#ffb87a", 0), ("0.58", "#ffb87a", .52),
                          ("1", "#ffb87a", 0)])), .7)
    s.screen('<ellipse cx="760" cy="560" rx="300" ry="150" fill="url(#%s)" '
             'filter="url(#soft)"/>'
             % s.rad([("0", "#ffe8c8", .8), ("1", "#ffe8c8", 0)]), .9)
    _mist(s, 640, 220, .8, "#e0c0a0")
    for _ in range(18):                         # frost, or dew, or both
        s.ellipse(s.rng.uniform(0, W), s.rng.uniform(840, H), s.rng.uniform(18, 62),
                  s.rng.uniform(3, 8), "#d8c6ae", s.rng.uniform(.05, .14), "props",
                  blur="soft3")
    s.light(760, 500, 1500, color="#ffb87a", strength=.62, tint=.26)


@plate("siteGate", "The Site Gate", "day", seed=678)
def _site_gate(s):
    stage_outdoor(s, horizon=550, sun=(760, 200),
                  bands=((0, "#87977394"[:7], "#61724894"[:7]), (46, "#4f5e3d", "#333f26")))
    prop_forest_band(s, 600, 11, (210, 340), tone="#1e2b18", rim_op=.05, spread=104)
    prop_path(s, near=(CX, H + 40, 300), far=(CX + 10, 606, 40), tone="#a49a80")
    # a hoop of temporary fencing, three weeks old
    for i in range(7):
        x0 = lerp(-40, W + 40, i / 7)
        x1 = lerp(-40, W + 40, (i + 1) / 7) - 14
        y = 800 - abs(lerp(-40, W + 40, (i + .5) / 7) - CX) * .06
        panel = [(x0, y + 190), (x0 + 6, y - 30), (x1, y - 34), (x1 - 4, y + 186)]
        s.stroke(wp(panel, s.rng, 2, 14, True), "#b9bdb4", 7, .95, True, "props")
        for k in range(9):                      # mesh
            kx = lerp(x0 + 8, x1 - 8, (k + .5) / 9)
            s.stroke(wob((kx, y + 180), (kx + 8, y - 26), s.rng, 2, 16), "#8f958c", 2.2,
                     .55, False, "props")
        for k in range(5):
            ky = lerp(y - 26, y + 180, (k + .5) / 5)
            s.stroke(wob((x0 + 8, ky), (x1 - 8, ky - 3), s.rng, 2, 16), "#8f958c", 2.2,
                     .45, False, "props")
        s.fill(wp([(x0 - 14, y + 210), (x0 - 10, y + 176), (x0 + 40, y + 174),
                   (x0 + 44, y + 208)], s.rng, 1.6, 8, True), "#2a2c28", .9, "props")
    _paper(s, CX + 240, 760, 96, 60, "#f2efe4", 2)      # the laminated sign
    # the visitors' book, on a lectern, under a bag — the first thing this programme built
    s.stroke(wob((300, 990), (312, 830), s.rng, 2, 14), "#6a5a40", 12, 1, False, "props")
    top = [(238, 836), (250, 792), (386, 800), (372, 846)]
    s.gfill(wp(top, s.rng, 2, 12, True), s.lin([("0", "#8a7048", 1), ("1", "#2a2016", 1)]),
            "props")
    bag = [(232, 848), (246, 780), (392, 788), (380, 856)]
    s.fill(wp(bag, s.rng, 4, 12, True), "#9fb6c4", .55, "props")
    _rim(s, bag[1:3], .6, 2.4, "#dfeef5")
    s.light(760, 240, 1400, color="#fff3d0", strength=.72, tint=.14)


@plate("tarpaulin", "Under the Tarpaulin", "day", seed=679)
def _tarpaulin(s):
    stage_outdoor(s, horizon=580, sun=(200, 220), mist=False,
                  bands=((0, "#7b8b69", "#586842"), (44, "#465534", "#2b3620")))
    # scaffold poles, and a blue tarpaulin over them
    for x in (90, 380, 690, 980):
        s.stroke(wob((x, 1000), (x + (x - CX) * .05, 380), s.rng, 2, 20), "#8f958c", 13,
                 1, False, "props")
    tarp = [(-60, 420), (200, 330), (CX, 380), (860, 320), (W + 60, 400),
            (W + 60, 520), (CX, 470), (-60, 520)]
    s.gfill(wp(tarp, s.rng, 6, 20, True),
            s.lin([("0", "#3f7ba8", 1), ("1", "#123044", 1)]), "props")
    s.stroke(wp(tarp, s.rng, 6, 20, True), "#0a1620", 3.0, .9, True, "props")
    for i in range(9):                          # the folds it has taken
        x = lerp(-40, W + 40, i / 8)
        s.stroke(wob((x, 340 + s.rng.uniform(0, 60)), (x + 30, 500), s.rng, 4, 16),
                 "#7fbcd8", 2.4, s.rng.uniform(.1, .35), False, "rim")
    s.screen('<rect x="0" y="480" width="%d" height="240" fill="url(#%s)"/>'
             % (W, s.lin([("0", "#3f7ba8", .3), ("1", "#3f7ba8", 0)])), .5)
    # laid out on pallets in rows, by somebody who has been sorting it very well
    for row in range(3):
        y = 720 + row * 120
        for col in range(4):
            x = lerp(110, 950, (col + .5) / 4) + row * 22
            pal = [(x - 96, y + 52), (x - 88, y + 26), (x + 92, y + 20), (x + 100, y + 46)]
            s.gfill(wp(pal, s.rng, 2, 12, True),
                    s.lin([("0", "#8a7048", 1), ("1", "#2a2016", 1)]), "props")
            for k in range(4):                  # sorted, and squared off
                q = [(x - 74 + k * 38, y + 26), (x - 72 + k * 38, y - 34 - k % 2 * 12),
                     (x - 42 + k * 38, y - 36 - k % 2 * 12), (x - 44 + k * 38, y + 24)]
                s.gfill(wp(q, s.rng, 1.6, 10, True),
                        s.lin([("0", "#b0b4ac", 1), ("1", "#2f3430", 1)]), "props")
                s.stroke(wp(q, s.rng, 1.6, 10, True), "#141713", 1.8, .8, True, "props")
                _rim(s, q[1:3], .35, 2.0, None)
    s.light(CX, 780, 1200, color="#e8ecdc", strength=.5, tint=.10)
    s.light(200, 260, 1200, color="#fff3d0", strength=.5, tint=.12)


@plate("weighbridge", "The Weighbridge", "day", seed=680)
def _weighbridge(s):
    stage_outdoor(s, horizon=560, sun=(880, 210),
                  bands=((0, "#7f8f6d", "#5b6c45"), (46, "#4a5939", "#2f3a23")))
    prop_forest_band(s, 606, 9, (180, 290), tone="#1e2b18", rim_op=.04, spread=130)
    # a steel plate in the ground, and a readout beside it
    plate_q = [(CX - 430, 1020), (CX - 250, 800), (CX + 260, 792), (CX + 440, 1010)]
    s.gfill(wp(plate_q, s.rng, 3, 22, True),
            s.lin([("0", "#9aa0a0", 1), ("1", "#40453f", 1)]), "props")
    s.stroke(wp(plate_q, s.rng, 3, 22, True), "#14171a", 3.4, .9, True, "props")
    _rim(s, plate_q[1:3], .6, 3.0, None)
    for i in range(5):
        s.stroke(wob(lp(plate_q[1], plate_q[2], (i + .5) / 5),
                     lp(plate_q[0], plate_q[3], (i + .5) / 5), s.rng, 3, 20), "#61665f",
                 3.0, .5, False, "props")
    s.stroke(wob((150, 900), (160, 620), s.rng, 2, 18), "#4a4f48", 12, 1, False, "props")
    box = [(96, 626), (104, 512), (256, 504), (250, 618)]
    _dark(s, box, ("#b9bdb4", "#2b3036"))
    _rim(s, box, .7, 2.6, None, True)
    s.fill(wp([(116, 596), (122, 538), (236, 532), (230, 590)], s.rng, 1.4, 10, True),
           "#1a2018", .95, "props")
    _scrawl(s, 132, 566, 1, .46, "#7fd8a0", .9, 4)      # simply what it weighs
    # the man in the high-visibility jacket, who does not care what it was
    prop_figure(s, 800, 980, 430, ("#c8a83a", "#3a2f10"), .8)
    s.ellipse(800, 830, 60, 42, "#ffe14a", .35, "rim")
    s.light(880, 250, 1400, color="#fff3d0", strength=.72, tint=.14)


@plate("readingRoom", "The Reading Room", "house", seed=681)
def _reading_room(s):
    g = stage_interior(s, wall_y=(150, 700), back_half=420)
    # ninety years of lodged decisions, in boxes along the wall
    for x0, x1 in ((-40, g["bl"] + 80), (g["br"] - 80, W + 40)):
        for row in range(5):
            y = 250 + row * 92
            s.stroke(wob((x0, y + 62), (x1, y + 58), s.rng, 1.4, 18), "#2a2016", 9, 1,
                     False, "props")
            n = max(2, int((x1 - x0) / 78))
            for j in range(n):
                bx = lerp(x0 + 20, x1 - 20, (j + .5) / n)
                q = [(bx - 32, y + 58), (bx - 32, y + 2), (bx + 32, y), (bx + 32, y + 56)]
                s.gfill(wp(q, s.rng, 1.2, 10, True),
                        s.lin([("0", "#9c7c52", 1), ("1", "#251b12", 1)]), "props")
                _rim(s, q[1:3], .35, 2.0, None)
                s.fill(wp([(bx - 22, y + 42), (bx - 22, y + 22), (bx + 22, y + 20),
                           (bx + 22, y + 40)], s.rng, 1, 6, True), "#ddd7c2", .8, "props")
    # a long table, with a lamp at each place
    prop_table(s, CX, 950, 400, 130, ("#8a7048", "#3a2c1c"))
    for i, x in enumerate((CX - 280, CX - 100, CX + 100, CX + 280)):
        prop_lamp(s, x, 830, .42, lit=i in (1, 2))
        _paper(s, x, 880, 62, 34, "#e8e0c8", 1, .9)
    # the chair with the cardigan over the back of it
    _chair(s, CX - 100, 1000, 1.0, ("#4a4238", "#12100c"), -1)
    card = [(CX - 66, 940), (CX - 84, 836), (CX - 8, 828), (CX + 12, 932)]
    s.gfill(wp(card, s.rng, 3, 14, True),
            s.lin([("0", "#a8552f", 1), ("1", "#3a1c10", 1)]), "props")
    _rim(s, card[:3], .5, 2.4, None)
    s.light(CX - 100, 800, 760, color="#ffdca8", strength=.8, tint=.22)
    s.light(CX + 100, 800, 700, color="#ffdca8", strength=.7, tint=.20)
    s.light(CX, 420, 900, strength=.35, tint=.12)


@plate("countyRoad", "The County Road", "day", seed=682)
def _county_road(s):
    stage_outdoor(s, horizon=540, sun=(250, 200),
                  bands=((0, "#82926e", "#5d6e46"), (46, "#4c5b3b", "#313d25")))
    prop_forest_band(s, 592, 10, (190, 300), tone="#1e2b18", rim_op=.05, spread=118)
    # where the gravel gives out and the tarmac starts
    grav = [(-60, H + 60), (-60, 900), (CX - 40, 700), (CX + 60, 690), (CX + 40, H + 60)]
    s.gfill(wp(grav, s.rng, 5, 26, True),
            s.lin([("0", "#a49a80", 1), ("1", "#4a4638", 1)]), "geo")
    tar = [(CX + 40, H + 60), (CX + 60, 690), (W + 60, 660), (W + 60, H + 60)]
    s.gfill(wp(tar, s.rng, 4, 26, True),
            s.lin([("0", "#4a4c4e", 1), ("1", "#1a1c1e", 1)]), "geo")
    s.stroke(wp([(CX + 60, 690), (CX + 40, H + 60)], s.rng, 4, 22), "#12140f", 5, .7,
             False, "detail")
    for i in range(6):                          # the centre line, going somewhere else
        y = 720 + i * 62
        s.stroke(wob((lerp(CX + 140, CX + 260, i / 5), y),
                     (lerp(CX + 160, CX + 300, i / 5), y + 34), s.rng, 2, 12), "#d8c24a",
                 7, .6, False, "props")
    # a bus shelter, a timetable behind scratched perspex, and the first bus at ten past six
    for x in (150, 470):
        s.stroke(wob((x, 900), (x + 6, 520), s.rng, 2, 16), "#7a8078", 10, 1, False, "props")
    roof = [(120, 528), (140, 486), (500, 478), (486, 520)]
    s.gfill(wp(roof, s.rng, 2, 12, True), s.lin([("0", "#b9bdb4", 1), ("1", "#3a4038", 1)]),
            "props")
    back = [(150, 890), (156, 540), (466, 532), (462, 880)]
    s.gfill(wp(back, s.rng, 2, 16, True), s.lin([("0", "#7f8f92", .55), ("1", "#2a3034", .8)]),
            "props")
    _rim(s, back, .6, 2.6, None, True)
    _paper(s, 240, 660, 62, 88, "#e8e4d4", 4)
    for _ in range(9):                          # scratched
        x0, y0 = s.rng.uniform(180, 300), s.rng.uniform(590, 730)
        s.stroke(wob((x0, y0), (x0 + s.rng.uniform(-40, 40), y0 + s.rng.uniform(-30, 30)),
                     s.rng, 2, 10), "#ffffff", 1.4, s.rng.uniform(.2, .5), False, "rim")
    s.stroke(wob((300, 880), (430, 876), s.rng, 2, 14), "#5a5a4e", 14, 1, False, "props")
    s.light(250, 240, 1400, color="#fff3d0", strength=.7, tint=.14)


# ===========================================================================
# every room key -> the plate that serves it
# ===========================================================================
ROOM_TO_PLATE = {}
for _k in ORDER:
    ROOM_TO_PLATE[_k] = _k
    for _a in ALIASES.get(_k, ()):
        ROOM_TO_PLATE[_a] = _k
