#!/usr/bin/env python3
"""kit.py — the shared drawing kit for the Colossal Cave room plates.

Every plate is 1058 x 1052 px (2x the app's 531 x 526 automap frame) and is
built the same way: dark geometry, one or two light sources, rim highlights
that fall off with distance from the light, then vignette and grain.

The pieces:

  Scene      layer manager + gradient registry; emits the finished SVG
  Palette    the colour set for a room family (rock, rim, accent, sky...)
  stage_*    whole-room templates (chamber, passage, cavern, ledge, outdoor,
             interior, water)
  prop_*     things that stand in a room (table, ladder, altar, machine...)

A plate is normally 5-25 lines: pick a stage, pick a light, add props.
"""
import math
import random

W, H = 1058, 1052
CX = W / 2

FRAME_LINE = "#b9b3a1"


# ============================================================ small geometry
def lerp(a, b, t):
    return a + (b - a) * t


def lp(p, q, t):
    return (lerp(p[0], q[0], t), lerp(p[1], q[1], t))


def toward(p, v, t):
    return lp(p, v, t)


def mid(p, q):
    return lp(p, q, .5)


def smooth(points):
    """Quadratic-through-midpoints: the drawn-by-hand curve."""
    if len(points) < 2:
        return ""
    d = "M %.1f %.1f" % points[0]
    if len(points) == 2:
        return d + " L %.1f %.1f" % points[1]
    for i in range(1, len(points) - 1):
        mx = (points[i][0] + points[i + 1][0]) / 2
        my = (points[i][1] + points[i + 1][1]) / 2
        d += " Q %.1f %.1f %.1f %.1f" % (points[i][0], points[i][1], mx, my)
    d += " L %.1f %.1f" % points[-1]
    return d


def path(pts, close=False):
    return smooth(pts) + (" Z" if close else "")


def wob(p0, p1, rng, amp=2.0, seg=26):
    """Jitter a straight run perpendicular to itself."""
    (x0, y0), (x1, y1) = p0, p1
    L = math.hypot(x1 - x0, y1 - y0) or 1.0
    n = max(2, int(L / seg))
    nx, ny = -(y1 - y0) / L, (x1 - x0) / L
    out = []
    for i in range(n + 1):
        t = i / n
        x, y = x0 + (x1 - x0) * t, y0 + (y1 - y0) * t
        if 0 < i < n:
            o = rng.uniform(-amp, amp)
            x += nx * o
            y += ny * o
        out.append((x, y))
    return out


def wp(pts, rng, amp=3.0, seg=26, close=False):
    seq = list(pts) + [pts[0]] if close else list(pts)
    out = []
    for i in range(len(seq) - 1):
        w = wob(seq[i], seq[i + 1], rng, amp, seg)
        out += w if i == 0 else w[1:]
    return out


def blob(cx, cy, r, rng, k=None, squash=.62):
    k = k or rng.randint(7, 11)
    return [(cx + math.cos(2 * math.pi * i / k) * r * rng.uniform(.55, 1.15),
             cy + math.sin(2 * math.pi * i / k) * r * rng.uniform(.55, 1.15) * squash)
            for i in range(k)]


def arc_pts(cx, cy, rx, ry, a0, a1, n=18):
    return [(cx + math.cos(lerp(a0, a1, i / n)) * rx,
             cy + math.sin(lerp(a0, a1, i / n)) * ry) for i in range(n + 1)]


# ==================================================================== colour
class Palette:
    """One room family's colour set. Every plate reads its tones from here."""

    def __init__(self, name, bg, rock_near, rock_far, rock_edge, rim, accent,
                 ground, sky=None, haze=None, ink="#04060a"):
        self.name = name
        self.bg = bg                 # (top, mid, bottom) background gradient
        self.rock_near = rock_near   # (light, dark) near surfaces
        self.rock_far = rock_far     # (light, dark) surfaces at depth
        self.rock_edge = rock_edge   # colour of drawn edges / cracks
        self.rim = rim               # rim-light colour (the key light's hue)
        self.accent = accent         # brightest highlight
        self.ground = ground         # (light, dark) floor
        self.sky = sky               # (top, horizon) for outdoor stages
        self.haze = haze or rim      # atmospheric wash
        self.ink = ink               # deepest shadow


PALETTES = {
    # Surfaces are painted at their *lit* value; Scene.light() then masks the
    # darkness back in, so these tones look bright read on their own.
    # warm brown stone lit by a carried lamp — the default underground look
    "earth": Palette("earth", ("#0b0a09", "#15120e", "#0a0908"),
                     ("#8a7355", "#2b241b"), ("#5c4b38", "#150f0b"),
                     "#c19a68", "#ff9a4d", "#ffd7a0", ("#77644a", "#221c15")),
    # cool grey granite, still lamp-lit
    "stone": Palette("stone", ("#08090b", "#111417", "#08090a"),
                     ("#7b8894", "#232a30"), ("#4e5a64", "#12171b"),
                     "#a9b6c0", "#ffa15c", "#ffdcae", ("#6a7681", "#1c2226")),
    # phosphorescent moss / mineral glow
    "moss": Palette("moss", ("#0a1614", "#0b1113", "#06080a"),
                    ("#4e6b60", "#131c1a"), ("#33473f", "#0a100f"),
                    "#7fd8b6", "#5fd6ab", "#d8fff0", ("#44605a", "#111a1a")),
    # torch-lit temple: ivory limestone, gold flame
    "temple": Palette("temple", ("#0c0a08", "#1a1410", "#0a0806"),
                      ("#b6a37e", "#3a3024"), ("#7d6c50", "#231c14"),
                      "#e0c795", "#ffb454", "#ffe9bf", ("#9c8a67", "#2d2519")),
    # the land of the dead: cold, sickly, bloodless
    "hades": Palette("hades", ("#07090c", "#0d1116", "#05070a"),
                     ("#6c7783", "#1a1f25"), ("#414b55", "#0d1116"),
                     "#98a6b3", "#9fe3d6", "#e8fbff", ("#5a6570", "#161b21")),
    # water: dam, reservoir, river
    "water": Palette("water", ("#070d14", "#0c1620", "#05090f"),
                     ("#8aa6ba", "#1d2831"), ("#56707f", "#101820"),
                     "#b9d5e6", "#a8e0f5", "#f2fbff", ("#6d8695", "#161e26")),
    # coal mine: everything black, lamp does all the work
    "mine": Palette("mine", ("#070707", "#0e0c0a", "#050505"),
                    ("#6d6355", "#211c17"), ("#453d33", "#100d0b"),
                    "#9a8a72", "#ff9646", "#ffe0b4", ("#5c5245", "#1a1613")),
    # the white house, inside: warm wood, daylight through windows
    "house": Palette("house", ("#151009", "#241a10", "#120d08"),
                     ("#b2916a", "#3c2f20"), ("#8a6f4c", "#2a2016"),
                     "#d8b98a", "#ffcf87", "#fff2d6", ("#9c7c52", "#31251a")),
    # outdoors, daylight
    "day": Palette("day", ("#8fb3c4", "#b7cbd2", "#cdd6cc"),
                   ("#3d5138", "#131a12"), ("#5c6f52", "#28331f"),
                   "#26301f", "#fff3d0", "#ffffff", ("#7e8a56", "#2f3a22"),
                   sky=("#6b9ec2", "#e2e7d8"), haze="#d3e0dc", ink="#121710"),
    # ice: a glacier, or a frozen chamber
    "ice": Palette("ice", ("#0a1218", "#0f1a22", "#070d12"),
                   ("#a9c8da", "#2c3d49"), ("#7ea2b8", "#18242c"),
                   "#d3e9f5", "#bfe6ff", "#ffffff", ("#8fb2c6", "#1d2b34")),
    # the volcano — basalt lit from below
    "lava": Palette("lava", ("#100807", "#1c0d08", "#0a0605"),
                    ("#6e4534", "#241310"), ("#4a2a1e", "#150a08"),
                    "#a05a34", "#ff7a2f", "#ffd39a", ("#5c3626", "#1c0e0a")),
    # cold institutional marble
    "bank": Palette("bank", ("#0a0c10", "#12161c", "#080a0e"),
                    ("#9aa3ae", "#2b3138"), ("#6d7681", "#171c22"),
                    "#c2cad3", "#e8dfc2", "#fffaea", ("#818b96", "#20262c")),
    # sunless, colourless, featureless
    "shadow": Palette("shadow", ("#3b4046", "#4e545a", "#31363b"),
                      ("#5d646b", "#2a2e33"), ("#767d84", "#42474d"),
                      "#8c939a", "#cfd6dc", "#eef2f5", ("#5a6067", "#2f3439"),
                      sky=("#4a5158", "#7d858c"), haze="#9aa2a9", ink="#23272b"),
    # polished marble, torchlight
    "marble": Palette("marble", ("#0b0b0e", "#14141a", "#08080b"),
                      ("#a89f96", "#2f2b29"), ("#7a736c", "#1a1817"),
                      "#cfc6bb", "#ffc978", "#fff0d4", ("#8d857c", "#22201e")),
    # outdoors at the bottom of a canyon / under cliffs — cooler, deeper
    "canyon": Palette("canyon", ("#5f7382", "#8b98a0", "#a9aca4"),
                      ("#8d938f", "#2b2f31"), ("#a6aaa4", "#4a4f50"),
                      "#3a4042", "#ffe9c0", "#ffffff", ("#7d8478", "#2d3230"),
                      sky=("#5f88a8", "#d5dcdb"), haze="#c4d2d6", ink="#101416"),
}


# =================================================================== the scene
class Scene:
    """Collects layers and gradient defs, then emits one finished SVG."""

    LAYERS = ("bg", "geo", "detail", "props", "light", "rim", "fx")

    def __init__(self, key, title, palette="earth", seed=None):
        self.key = key
        self.title = title
        self.pal = PALETTES[palette] if isinstance(palette, str) else palette
        self.rng = random.Random(seed if seed is not None else
                                 (abs(hash(key)) % 10_000_019))
        self.defs = []
        self.layers = {k: [] for k in self.LAYERS}
        self._n = 0
        self._lights = []
        # how black the unlit parts go; outdoor plates lower it
        self.dark_floor = .18 if self.pal.name in ("day", "canyon") else .88

    # ---- plumbing --------------------------------------------------------
    def uid(self, tag="g"):
        self._n += 1
        return "%s%d" % (tag, self._n)

    def add(self, svg, layer="geo"):
        self.layers[layer].append(svg)
        return svg

    def lin(self, stops, x1="0%", y1="0%", x2="0%", y2="100%", user=None):
        gid = self.uid("lg")
        u = ' gradientUnits="userSpaceOnUse"' if user else ""
        if user:
            x1, y1, x2, y2 = ("%.1f" % v for v in user)
        s = "".join('<stop offset="%s" stop-color="%s" stop-opacity="%.3f"/>'
                    % (o, c, a) for o, c, a in stops)
        self.defs.append('<linearGradient id="%s"%s x1="%s" y1="%s" x2="%s" '
                         'y2="%s">%s</linearGradient>' % (gid, u, x1, y1, x2, y2, s))
        return gid

    def rad(self, stops, cx="50%", cy="50%", r="50%", user=None):
        gid = self.uid("rg")
        u = ""
        if user:
            u = ' gradientUnits="userSpaceOnUse"'
            cx, cy, r = ("%.1f" % v for v in user)
        s = "".join('<stop offset="%s" stop-color="%s" stop-opacity="%.3f"/>'
                    % (o, c, a) for o, c, a in stops)
        self.defs.append('<radialGradient id="%s"%s cx="%s" cy="%s" r="%s">%s'
                         '</radialGradient>' % (gid, u, cx, cy, r, s))
        return gid

    def clip(self, pts, close=True):
        cid = self.uid("cp")
        self.defs.append('<clipPath id="%s"><path d="%s"/></clipPath>'
                         % (cid, path(pts, close)))
        return cid

    # ---- drawing ---------------------------------------------------------
    def stroke(self, pts, color, sw=2.0, op=1.0, close=False, layer="detail",
               blur=None):
        f = ' filter="url(#%s)"' % blur if blur else ""
        return self.add('<path d="%s" fill="none" stroke="%s" '
                        'stroke-opacity="%.3f" stroke-width="%.2f" '
                        'stroke-linecap="round" stroke-linejoin="round"%s/>'
                        % (path(pts, close), color, op, sw, f), layer)

    def line(self, p0, p1, color, sw=2.0, op=1.0, amp=1.6, seg=34,
             layer="detail"):
        return self.stroke(wob(p0, p1, self.rng, amp, seg), color, sw, op,
                           False, layer)

    def fill(self, pts, color, op=1.0, layer="geo", close=True, extra=""):
        return self.add('<path d="%s" fill="%s" fill-opacity="%.3f" %s/>'
                        % (path(pts, close), color, op, extra), layer)

    def gfill(self, pts, gid, layer="geo", close=True, extra=""):
        return self.add('<path d="%s" fill="url(#%s)" %s/>'
                        % (path(pts, close), gid, extra), layer)

    def rect(self, x, y, w, h, color, op=1.0, layer="geo"):
        return self.add('<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" '
                        'fill="%s" fill-opacity="%.3f"/>' % (x, y, w, h, color, op),
                        layer)

    def ellipse(self, cx, cy, rx, ry, color, op=1.0, layer="geo", blur=None,
                grad=False):
        f = ' filter="url(#%s)"' % blur if blur else ""
        col = 'url(#%s)' % color if grad else color
        return self.add('<ellipse cx="%.1f" cy="%.1f" rx="%.1f" ry="%.1f" '
                        'fill="%s" opacity="%.3f"%s/>'
                        % (cx, cy, rx, ry, col, op, f), layer)

    def screen(self, svg, op=1.0, layer="light"):
        return self.add('<g style="mix-blend-mode:screen" opacity="%.3f">%s</g>'
                        % (op, svg), layer)

    def group(self, svg, layer="props", transform=None, opacity=None):
        t = ' transform="%s"' % transform if transform else ""
        o = ' opacity="%.3f"' % opacity if opacity is not None else ""
        return self.add('<g%s%s>%s</g>' % (t, o, svg), layer)

    # ---- surfaces --------------------------------------------------------
    def surface(self, pts, tones, amp=3.0, seg=30, layer="geo", vertical=True,
                edge=None, edge_op=.55, edge_sw=2.0):
        """A rock plane: gradient fill plus an optional drawn boundary."""
        w = wp(pts, self.rng, amp, seg, True)
        gid = self.lin([("0", tones[0], 1), ("1", tones[1], 1)],
                       *(("0%", "0%", "0%", "100%") if vertical
                         else ("0%", "0%", "100%", "0%")))
        self.gfill(w, gid, layer)
        if edge:
            self.stroke(w, edge, edge_sw, edge_op, True, "detail")
        return w

    def rocks(self, box, n, r=(6, 24), squash=.55, tone=None, rim=None,
              rim_op=(.10, .38), layer="geo"):
        """Loose stone scattered over a patch of floor."""
        x0, y0, x1, y1 = box
        tone = tone or self.pal.rock_near
        for _ in range(n):
            cx = self.rng.uniform(x0, x1)
            cy = self.rng.uniform(y0, y1)
            rr = self.rng.uniform(*r)
            pts = blob(cx, cy, rr, self.rng, squash=squash)
            pts = [(px, min(py, cy + rr * squash * .4)) for px, py in pts]
            w = wp(pts, self.rng, max(1.2, rr * .08), 12, True)
            gid = self.lin([("0", tone[0], 1), ("1", tone[1], 1)])
            self.gfill(w, gid, layer)
            self.stroke(w, self.pal.ink, 1.5, .8, True, layer)
            lit = [p for p in pts if p[1] <= cy]
            if len(lit) > 1:
                self.stroke(wp(lit, self.rng, 1.4, 12), rim or self.pal.rim,
                            1.8, self.rng.uniform(*rim_op), False, "rim")

    def cracks(self, box, n, color=None, op=(.12, .38), length=(40, 140)):
        x0, y0, x1, y1 = box
        col = color or self.pal.rock_edge
        for _ in range(n):
            px, py = self.rng.uniform(x0, x1), self.rng.uniform(y0, y1)
            L = self.rng.uniform(*length)
            a = self.rng.uniform(0, math.pi * 2)
            self.line((px, py), (px + math.cos(a) * L, py + math.sin(a) * L),
                      col, self.rng.uniform(1.0, 1.8),
                      self.rng.uniform(*op), 3.0, 26)

    def specks(self, box, n, color, r=(1.0, 3.4), op=(.15, .6), layer="light"):
        x0, y0, x1, y1 = box
        s = "".join('<circle cx="%.0f" cy="%.0f" r="%.1f" fill="%s" '
                    'opacity="%.2f"/>'
                    % (self.rng.uniform(x0, x1), self.rng.uniform(y0, y1),
                       self.rng.uniform(*r), color, self.rng.uniform(*op))
                    for _ in range(n))
        return self.add(s, layer)

    # ---- light -----------------------------------------------------------
    def light(self, x, y, r, color=None, strength=.85, core=None, core_r=None,
              squash=1.0, tint=.30):
        """Register a light.

        Surfaces are painted at their lit value, so a light does two things:
        it carves a hole in the scene's darkness (the real work), and it lays
        a weak warm tint over what it reaches (the colour of the source).
        """
        col = color or self.pal.rim
        self._lights.append((x, y, r, r * squash, strength))
        if tint:
            gid = self.rad([("0", core or self.pal.accent, .55),
                            ("0.30", col, .30), ("0.70", col, .10),
                            ("1", col, 0)], user=(x, y, r))
            self.screen('<rect x="0" y="0" width="%d" height="%d" '
                        'fill="url(#%s)"/>' % (W, H, gid), tint)
        if core_r:
            cg = self.rad([("0", "#fffdf6", 1),
                           ("0.45", core or self.pal.accent, .9), ("1", col, 0)],
                          user=(x, y, core_r))
            self.screen('<ellipse cx="%.0f" cy="%.0f" rx="%.0f" ry="%.0f" '
                        'fill="url(#%s)" filter="url(#soft3)"/>'
                        % (x, y, core_r, core_r, cg), 1.0)
        return None

    def darkness(self, floor=None):
        """Black everything the lights don't reach. Called once, at render."""
        floor = self.dark_floor if floor is None else floor
        if not self._lights or floor <= 0:
            return
        holes = []
        for (x, y, rx, ry, strength) in self._lights:
            gid = self.rad([("0", "#000", min(1.0, strength * 1.15)),
                            ("0.30", "#000", strength * .92),
                            ("0.62", "#000", strength * .48),
                            ("0.85", "#000", strength * .14),
                            ("1", "#000", 0)])
            holes.append('<ellipse cx="%.1f" cy="%.1f" rx="%.1f" ry="%.1f" '
                         'fill="url(#%s)"/>' % (x, y, rx, ry, gid))
        mid = self.uid("mk")
        self.defs.append(
            '<mask id="%s" maskUnits="userSpaceOnUse" x="0" y="0" width="%d" '
            'height="%d"><rect width="%d" height="%d" fill="#fff"/>%s</mask>'
            % (mid, W, H, W, H, "".join(holes)))
        self.layers["fx"].insert(0, '<rect x="0" y="0" width="%d" height="%d" '
                                    'fill="%s" opacity="%.2f" mask="url(#%s)"/>'
                                    % (W, H, self.pal.ink, floor, mid))

    def ambient(self, x, y, rx, ry, color=None, op=.35, blur="soft2"):
        gid = self.rad([("0", color or self.pal.haze, .5),
                        ("0.55", color or self.pal.haze, .18),
                        ("1", color or self.pal.haze, 0)])
        self.screen('<ellipse cx="%.0f" cy="%.0f" rx="%.0f" ry="%.0f" '
                    'fill="url(#%s)" filter="url(#%s)"/>'
                    % (x, y, rx, ry, gid, blur), op)

    def beam(self, apex, left, right, color=None, op=.22):
        """A wedge of light — a shaft from a grating, a doorway, a window."""
        gid = self.lin([("0", color or self.pal.accent, .55),
                        ("0.5", color or self.pal.rim, .18),
                        ("1", color or self.pal.rim, 0)],
                       user=(apex[0], apex[1], (left[0] + right[0]) / 2,
                             (left[1] + right[1]) / 2))
        self.screen('<path d="%s" fill="url(#%s)" filter="url(#soft)"/>'
                    % (path([apex, left, right], True), gid), op)

    # ---- output ----------------------------------------------------------
    def vignette(self, strength=.55, edge=.92, cx="50%", cy="54%", r="72%"):
        gid = self.rad([("0.34", self.pal.ink, 0), ("0.76", self.pal.ink, strength),
                        ("1", "#000", edge)], cx, cy, r)
        self.add('<rect x="0" y="0" width="%d" height="%d" fill="url(#%s)"/>'
                 % (W, H, gid), "fx")

    def texture(self, pts, kind="strata", n=9, op=(.10, .30), color=None,
                amp=6.0):
        """Break a flat surface up: bedding planes, tool marks, or a grid of
        laid stone. Clipped to the surface so it never leaks."""
        col = color or self.pal.rock_edge
        cid = self.clip(wp(pts, self.rng, 2, 30, True))
        xs = [p[0] for p in pts]
        ys = [p[1] for p in pts]
        x0, x1, y0, y1 = min(xs), max(xs), min(ys), max(ys)
        out = []
        if kind in ("strata", "courses"):
            for i in range(n):
                y = lerp(y0, y1, (i + .5) / n) + self.rng.uniform(-amp, amp)
                a = (x0 - 40, y + self.rng.uniform(-amp, amp))
                b = (x1 + 40, y + self.rng.uniform(-amp, amp))
                out.append('<path d="%s" fill="none" stroke="%s" '
                           'stroke-opacity="%.3f" stroke-width="%.1f" '
                           'stroke-linecap="round"/>'
                           % (path(wob(a, b, self.rng, amp * .6, 44)), col,
                              self.rng.uniform(*op), self.rng.uniform(1.2, 2.4)))
            if kind == "courses":
                for i in range(n * 2):
                    y = lerp(y0, y1, (i % n + .5) / n)
                    x = self.rng.uniform(x0, x1)
                    out.append('<path d="%s" fill="none" stroke="%s" '
                               'stroke-opacity="%.3f" stroke-width="1.6" '
                               'stroke-linecap="round"/>'
                               % (path(wob((x, y), (x + self.rng.uniform(-14, 14),
                                                    y + (y1 - y0) / n), self.rng,
                                           2, 20)), col,
                                  self.rng.uniform(*op)))
        elif kind == "chisel":
            for i in range(n * 3):
                x = self.rng.uniform(x0, x1)
                y = self.rng.uniform(y0, y1)
                L = self.rng.uniform(18, 60)
                a = self.rng.uniform(-.5, .5)
                out.append('<path d="%s" fill="none" stroke="%s" '
                           'stroke-opacity="%.3f" stroke-width="1.4" '
                           'stroke-linecap="round"/>'
                           % (path(wob((x, y), (x + math.cos(a) * L,
                                                y + math.sin(a) * L), self.rng,
                                       2, 20)), col, self.rng.uniform(*op)))
        elif kind == "grain":       # wood
            for i in range(n * 2):
                x = lerp(x0, x1, (i + .5) / (n * 2))
                out.append('<path d="%s" fill="none" stroke="%s" '
                           'stroke-opacity="%.3f" stroke-width="1.5" '
                           'stroke-linecap="round"/>'
                           % (path(wob((x, y0 - 20), (x, y1 + 20), self.rng,
                                       amp, 40)), col, self.rng.uniform(*op)))
        self.add('<g clip-path="url(#%s)">%s</g>' % (cid, "".join(out)), "detail")

    def render(self):
        self.darkness()
        if len(self.layers["fx"]) < 2:
            self.vignette()
        body = "".join("".join(self.layers[k]) for k in self.LAYERS)
        return (
            '<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="%d" '
            'viewBox="0 0 %d %d">\n<title>%s</title>\n<defs>%s%s</defs>\n'
            '<g clip-path="url(#frame)">%s\n'
            '<rect x="0" y="0" width="%d" height="%d" filter="url(#grain)" '
            'opacity="0.10" style="mix-blend-mode:screen"/></g>\n'
            '<rect x="1" y="1" width="%d" height="%d" rx="19" ry="19" '
            'fill="none" stroke="%s" stroke-width="2"/>\n</svg>\n'
            % (W, H, W, H, self.title, COMMON_DEFS, "".join(self.defs), body,
               W, H, W - 2, H - 2, FRAME_LINE))


COMMON_DEFS = """
  <filter id="grain" x="0" y="0" width="100%%" height="100%%">
    <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="4" seed="9"/>
    <feColorMatrix type="saturate" values="0"/>
  </filter>
  <filter id="soft"><feGaussianBlur stdDeviation="20"/></filter>
  <filter id="soft2"><feGaussianBlur stdDeviation="46"/></filter>
  <filter id="soft3"><feGaussianBlur stdDeviation="6"/></filter>
  <filter id="soft4"><feGaussianBlur stdDeviation="2.2"/></filter>
  <clipPath id="frame"><rect x="0" y="0" width="%d" height="%d" rx="20" ry="20"/></clipPath>
""" % (W, H)


# ================================================================== the sky
def sky(s, horizon=560, sun=None):
    """Daylight backdrop for the outdoor stages."""
    p = s.pal
    top, hz = p.sky or ("#7ba7c4", "#dfe6dc")
    gid = s.lin([("0", top, 1), ("0.72", hz, 1), ("1", hz, 1)],
                user=(0, -40, 0, horizon + 30))
    s.add('<rect x="0" y="0" width="%d" height="%.1f" fill="url(#%s)"/>'
          % (W, horizon + 30, gid), "bg")
    # a few flat cloud bars, kept low-contrast so they never pull focus
    for _ in range(7):
        cy = s.rng.uniform(60, horizon - 120)
        cx = s.rng.uniform(-60, W + 60)
        rx = s.rng.uniform(90, 300)
        s.ellipse(cx, cy, rx, rx * s.rng.uniform(.07, .14), "#ffffff",
                  s.rng.uniform(.10, .30), "bg", blur="soft3")
    if sun:
        s.screen('<ellipse cx="%.0f" cy="%.0f" rx="240" ry="240" '
                 'fill="url(#%s)" filter="url(#soft2)"/>'
                 % (sun[0], sun[1],
                    s.rad([("0", "#fff6dd", .8), ("1", "#fff6dd", 0)])), .55)


# ================================================================== stages
def stage_chamber(s, back=(320, 470), floor_y=790, ceil_y=250, spread=1.0,
                  back_tone=None, rough=True, ceiling=True, texture="strata"):
    """A rock room seen from inside: back wall, two side walls, floor, ceiling.

    back = (half-width, y of the back wall's top). Returns a dict of the key
    points so props and openings can be placed against real geometry.
    """
    p = s.pal
    bw, by = back
    bl, br = CX - bw, CX + bw
    bby = floor_y - 40            # where the back wall meets the floor
    ol, orr = CX - bw * spread - 520, CX + bw * spread + 520   # off-frame edges

    s.add('<rect x="0" y="0" width="%d" height="%d" fill="url(#%s)"/>'
          % (W, H, s.lin([("0", p.bg[0], 1), ("0.5", p.bg[1], 1),
                          ("1", p.bg[2], 1)])), "bg")

    back_pts = [(bl, by), (br, by), (br, bby), (bl, bby)]
    if rough:
        back_pts = [(bl, by + s.rng.uniform(-18, 18)),
                    (CX, by - s.rng.uniform(10, 40)),
                    (br, by + s.rng.uniform(-18, 18)),
                    (br, bby), (bl, bby)]
    s.surface(back_pts, p.rock_far, 5, 34, edge=p.rock_edge, edge_op=.5)
    s.texture(back_pts, texture, 8, (.10, .26))

    # side walls converge on the back wall
    lw = [(ol, ceil_y - 190), (bl, by), (bl, bby), (ol, H + 60)]
    rw = [(orr, ceil_y - 190), (br, by), (br, bby), (orr, H + 60)]
    s.surface(lw, p.rock_near, 5, 34, vertical=False, edge=p.rock_edge, edge_op=.45)
    s.surface(rw, p.rock_near, 5, 34, vertical=False, edge=p.rock_edge, edge_op=.45)
    for wall, sgn in ((lw, -1), (rw, 1)):
        for i in range(6):
            t = (i + .5) / 6
            s.line(lp(wall[0], wall[1], t), lp(wall[3], wall[2], t),
                   p.rock_edge, s.rng.uniform(1.2, 2.2),
                   s.rng.uniform(.10, .26), 4.0, 34)
        for i in range(7):
            t = (i + .5) / 7
            a = lp(wall[1], wall[2], t)
            b = lp(wall[0], wall[3], t)
            s.line(a, lp(a, b, s.rng.uniform(.3, .9)), p.rock_edge,
                   s.rng.uniform(1.2, 2.0), s.rng.uniform(.08, .22), 5.0, 40)

    if ceiling:
        cpts = [(-60, -60), (W + 60, -60), (orr, ceil_y - 190),
                (br, by), (bl, by), (ol, ceil_y - 190)]
        s.surface(cpts, (p.rock_far[1], p.rock_far[0]), 5, 40)
        for i in range(4):
            x = lerp(-40, W + 40, i / 3)
            s.line((x, -40), (lerp(bl + 40, br - 40, i / 3), by),
                   p.rock_edge, s.rng.uniform(1.6, 2.6), .30, 3.0, 40)

    # floor
    fl = [(ol - 200, H + 60), (bl, bby), (br, bby), (orr + 200, H + 60)]
    s.surface(fl, p.ground, 4, 40)
    for i in range(9):
        t = i / 8
        s.line((lerp(-200, W + 200, t), H + 40),
               (lerp(bl + 20, br - 20, t), bby), p.rock_edge, 1.2, .12, 3.0, 46)
    s.rocks((60, bby - 6, W - 60, H - 30), 26, (6, 20))
    s.cracks((bl, by + 30, br, bby - 20), 7)
    # the wall/floor junction reads as the room's strongest line
    s.stroke(wob((bl, bby), (br, bby), s.rng, 3, 30), p.ink, 4, .55, False, "detail")

    return {"bl": bl, "br": br, "by": by, "bby": bby, "floor": bby,
            "ol": ol, "or": orr, "bw": bw}


def opening(s, x, y_top, y_bot, half, kind="arch", depth=.9, glow=None,
            rim_op=.45):
    """Cut a dark way-out into a wall: an arch, a crawl, a doorway, a stair."""
    p = s.pal
    if kind == "crawl":
        pts = ([(x - half, y_bot)] +
               arc_pts(x, y_bot - (y_bot - y_top) * .35, half,
                       (y_bot - y_top) * .55, math.pi, 2 * math.pi, 14) +
               [(x + half, y_bot)])
    elif kind == "square":
        pts = [(x - half, y_bot), (x - half, y_top), (x + half, y_top),
               (x + half, y_bot)]
    else:
        pts = ([(x - half, y_bot)] +
               arc_pts(x, y_top + half * .75, half, half * .95,
                       math.pi, 2 * math.pi, 16) +
               [(x + half, y_bot)])
    w = wp(pts, s.rng, 2.4, 18, True)
    gid = s.lin([("0", "#000", 1), ("1", p.ink, 1)])
    s.gfill(w, gid, "geo")
    s.fill(w, "#000", depth, "geo")
    if glow:
        s.screen('<ellipse cx="%.0f" cy="%.0f" rx="%.0f" ry="%.0f" '
                 'fill="url(#%s)" filter="url(#soft)"/>'
                 % (x, (y_top + y_bot) / 2, half * 1.3, (y_bot - y_top) * .5,
                    s.rad([("0", glow, .9), ("1", glow, 0)])), .8)
    # the jamb catches the light; the head of the arch barely does
    s.stroke(w, p.ink, 5.0, .7, True, "geo")
    s.stroke(w, p.rim, 3.0, rim_op, True, "rim")
    inner = [(px + (x - px) * .07, py + ((y_top + y_bot) / 2 - py) * .07)
             for px, py in wp(pts, s.rng, 2.0, 18, True)]
    s.stroke(inner, p.rim, 1.6, rim_op * .35, True, "rim")
    return w


def stage_passage(s, vp=(CX, 600), mouth=(0.46, 190, 900), depth=.90,
                  glow=None, ribs=9, floor_light=.16, lit="far"):
    """A corridor receding to a vanishing point. mouth = (half-width fraction,
    top y, bottom y) of the near opening."""
    p = s.pal
    hw, top, bot = mouth[0] * W, mouth[1], mouth[2]
    M = [(CX - hw, bot), (CX - hw * .93, top), (CX + hw * .93, top), (CX + hw, bot)]

    s.add('<rect x="0" y="0" width="%d" height="%d" fill="url(#%s)"/>'
          % (W, H, s.lin([("0", p.bg[0], 1), ("0.5", p.bg[1], 1),
                          ("1", p.bg[2], 1)])), "bg")

    def ring(t):
        return [toward(q, vp, t) for q in M]

    F = ring(depth)
    if lit == "near":
        # the lamp is behind us: the passage swallows the light with depth
        gid = s.rad([("0", p.ink, 1), ("0.30", p.rock_far[1], 1),
                     ("0.70", p.rock_far[0], 1), ("1", p.rock_near[0], 1)],
                    user=(vp[0], vp[1], W * .42))
    else:
        gid = s.rad([("0", p.accent if glow else p.rock_far[0], 1),
                     ("0.22", glow or p.rock_far[0], 1),
                     ("0.62", p.rock_far[1], 1), ("1", p.ink, 1)],
                    user=(vp[0], vp[1], W * .30))
    s.gfill(wp(M, s.rng, 3, 22, True), gid, "geo")

    cid = s.clip(wp(M, s.rng, 3, 22, True))
    inner = []
    order = ["l", "r", "t", "l", "r", "t", "l", "r", "b", "l", "r", "t"][:ribs]
    for i, which in enumerate(order):
        t = .05 + .78 * (i + 1) / (len(order) + 1) + s.rng.uniform(-.02, .02)
        r = ring(t)
        d = 1 - t
        if which in "lr":
            a0, a1 = (r[1], r[0]) if which == "l" else (r[2], r[3])
            u0 = s.rng.uniform(0, .40)
            u1 = min(1, u0 + s.rng.uniform(.30, .62))
            a, c = lp(a0, a1, u0), lp(a0, a1, u1)
            reach = s.rng.uniform(.10, .26) * d + .03
            tip = (lerp(a[0], vp[0], reach), lerp((a[1] + c[1]) / 2, vp[1], reach * .4))
            out = -260 if which == "l" else 260
            mass = [(a[0] + out, a[1] - 60), a, tip, c, (c[0] + out, c[1] + 60)]
        elif which == "t":
            a0, a1 = r[1], r[2]
            u0 = s.rng.uniform(.05, .5)
            u1 = min(1, u0 + s.rng.uniform(.22, .45))
            a, c = lp(a0, a1, u0), lp(a0, a1, u1)
            tip = (mid(a, c)[0], lerp(a[1], vp[1], s.rng.uniform(.10, .26) * d + .04))
            mass = [(a[0], a[1] - 220), a, tip, c, (c[0], c[1] - 220)]
        else:
            a, c = lp(r[0], r[3], .1), lp(r[0], r[3], .9)
            tip = (mid(a, c)[0], lerp(a[1], vp[1], .18))
            mass = [(a[0], a[1] + 220), a, tip, c, (c[0], c[1] + 220)]
        inner.append(('<path d="%s" fill="%s" fill-opacity="%.3f"/>'
                      % (path(wp(mass, s.rng, 2.2 * d + 1, 14, True), True),
                         p.ink, .90 + .10 * t)))
        inner.append('<path d="%s" fill="none" stroke="%s" stroke-opacity="%.3f"'
                     ' stroke-width="%.2f" stroke-linecap="round"/>'
                     % (path(wp([a, tip, c], s.rng, 2.2 * d + 1, 14)),
                        p.accent if (t > .5) == (lit == "far") else p.rim,
                        (.16 + .5 * t) if lit == "far" else (.62 - .46 * t),
                        max(.9, 2.2 * d + .5)))
    s.add('<g clip-path="url(#%s)">%s</g>' % (cid, "".join(inner)), "geo")

    if floor_light:
        for i in range(5):
            u = (i + 1) / 6
            s.screen('<path d="%s" fill="none" stroke="%s" stroke-opacity="%.3f"'
                     ' stroke-width="%.1f" stroke-linecap="round"/>'
                     % (path(wob(lp(M[0], M[3], u), lp(F[0], F[3], u), s.rng, 4, 40)),
                        p.accent, s.rng.uniform(.05, .14), s.rng.uniform(2, 5)),
                     floor_light)
    return {"M": M, "vp": vp, "ring": ring}


def stage_cavern(s, ceil_y=300, floor_y=600, moss=True, stal=True,
                 back_wall=520):
    """A wide space with a high ceiling."""
    p = s.pal
    s.add('<rect x="0" y="0" width="%d" height="%d" fill="url(#%s)"/>'
          % (W, H, s.lin([("0", p.bg[0], 1), ("0.44", p.bg[1], 1),
                          ("1", p.bg[2], 1)])), "bg")
    s.ambient(CX, ceil_y - 60, 760, 430, op=.8)

    gid = s.lin([("0", p.ground[0], 1), ("1", p.ground[1], 1)],
                user=(0, floor_y - 40, 0, H))
    s.add('<rect x="-40" y="%.1f" width="%d" height="%.1f" fill="url(#%s)"/>'
          % (floor_y - 40, W + 80, H - floor_y + 100, gid), "geo")

    far = [(x, back_wall + 30 * math.sin(x / 210.) + s.rng.uniform(-14, 14))
           for x in range(-40, W + 100, 62)]
    s.surface(far + [(W + 60, floor_y + 90), (-40, floor_y + 90)],
              (p.rock_far[1], p.rock_far[0]), 3, 40)
    s.stroke(wp(far, s.rng, 3, 40), p.rim, 2.6, .32, False, "rim")

    ceil = [(x, ceil_y + 36 * math.sin(x / 170. + .8) + s.rng.uniform(-16, 16))
            for x in range(-40, W + 100, 54)]
    s.surface([(-60, -60), (W + 60, -60)] + ceil[::-1],
              (p.rock_far[1], p.rock_far[0]), 3, 44)
    s.stroke(wp(ceil, s.rng, 3, 44), p.rim, 2.4, .36, False, "rim")

    if stal:
        for row, (span, thin, op, y0) in enumerate(
                (((24, 110), (22, 70), .55, ceil_y - 22),
                 ((30, 200), (14, 56), 1.0, ceil_y))):
            x = -20
            while x < W + 20:
                wdt = s.rng.uniform(*thin)
                ln = s.rng.uniform(*span)
                by = y0 + 36 * math.sin(x / 170. + .8) + s.rng.uniform(-12, 12)
                tip = (x + wdt / 2 + s.rng.uniform(-18, 18), by + ln)
                sh = s.rng.uniform(.3, .6)
                side = s.rng.choice((-1, 1))
                m = (lerp(x + wdt / 2, tip[0], sh) + side * wdt * .34,
                     lerp(by, tip[1], sh))
                pts = [(x, by - 12), m, tip, (x + wdt, by - 12 + s.rng.uniform(-8, 8))]
                s.fill(wp(pts, s.rng, 2, 16, True), p.ink, op, "geo")
                s.stroke(wp(pts[0:3], s.rng, 2, 16), p.rim, 1.9,
                         s.rng.uniform(.18, .55) * op, False, "rim")
                x += wdt + s.rng.uniform(4, 46)

    if moss:
        for _ in range(24):
            mx, my = s.rng.uniform(-10, W + 10), s.rng.uniform(40, ceil_y - 40)
            r = s.rng.uniform(24, 82)
            s.screen('<ellipse cx="%.0f" cy="%.0f" rx="%.0f" ry="%.0f" '
                     'fill="url(#%s)" filter="url(#soft)"/>'
                     % (mx, my, r * 2, r * 1.25,
                        s.rad([("0", p.rim, .85), ("0.45", p.rock_edge, .32),
                               ("1", p.rock_edge, 0)])), s.rng.uniform(.35, .8))
            s.fill(wp(blob(mx, my, r * .8, s.rng), s.rng, 3, 14, True), p.rim,
                   s.rng.uniform(.18, .40), "props")
            s.fill(wp(blob(mx + s.rng.uniform(-16, 16), my + s.rng.uniform(-12, 12),
                           r * .34, s.rng), s.rng, 2, 10, True), p.accent,
                   s.rng.uniform(.25, .55), "props")
        s.specks((-10, 24, W + 10, ceil_y), 200, p.rim, (1, 4.2), (.2, .9))
    s.rocks((-20, floor_y - 20, W + 20, floor_y + 120), 26, (8, 30))
    return {"floor": floor_y, "ceil": ceil_y, "far": back_wall}


def stage_ledge(s, lip=700, far_lip=None, far_wall=430, depth_color=None,
                bridge=None, wall_top=180):
    """Standing at the edge of a drop: near ground, a void, and a far side."""
    p = s.pal
    s.add('<rect x="0" y="0" width="%d" height="%d" fill="url(#%s)"/>'
          % (W, H, s.lin([("0", p.bg[0], 1), ("0.5", p.bg[1], 1),
                          ("1", p.bg[2], 1)])), "bg")
    far_lip = far_lip if far_lip is not None else lip - 170

    far_edge = [(x, far_lip + 20 * math.sin(x / 150.) + s.rng.uniform(-9, 9))
                for x in range(-40, W + 100, 56)]
    near_edge = [(x, lip + 28 * math.sin(x / 185. + 1.5) + s.rng.uniform(-11, 11))
                 for x in range(-40, W + 100, 56)]

    # the far side of the gap, rising out of the dark
    s.surface([(-40, wall_top)] +
              [(x, far_wall + 26 * math.sin(x / 190.) + s.rng.uniform(-12, 12))
               for x in range(-40, W + 100, 70)] +
              [(W + 60, wall_top)], (p.rock_far[1], p.rock_far[0]), 4, 40)
    s.surface(far_edge + [(W + 60, far_lip - 120), (-40, far_lip - 120)],
              p.rock_far, 3, 40)

    # near bank
    s.surface(near_edge + [(W + 60, H + 60), (-40, H + 60)], p.ground, 3, 34)

    # the drop itself
    gid = s.lin([("0", depth_color or p.rock_far[1], 1), ("0.2", "#000", 1),
                 ("1", "#000", 1)], user=(0, far_lip, 0, lip + 60))
    s.gfill(wp(far_edge + near_edge[::-1], s.rng, 3, 32, True), gid, "geo")
    for i, (px, py) in enumerate(far_edge):
        s.line((px, py + 3), (px + s.rng.uniform(-16, 16),
                              py + s.rng.uniform(28, 84)), p.rim, 1.4,
               s.rng.uniform(.05, .17), 2.5, 24)
    s.stroke(wp(far_edge, s.rng, 3, 32), p.rim, 3.2, .66, False, "rim")
    s.stroke(wp(far_edge, s.rng, 3, 32), p.accent, 1.4, .38, False, "rim")
    s.stroke(wp(near_edge, s.rng, 3, 32), p.rim, 3.6, .5, False, "rim")
    for edge, up in ((far_edge, -1), (near_edge, 1)):
        for i in range(0, len(edge) - 1, 2):
            px, py = edge[i]
            wdt, hh = s.rng.uniform(20, 54), s.rng.uniform(10, 26) * up
            tri = [(px, py), (px + wdt / 2, py + hh), (px + wdt, py)]
            s.fill(wp(tri, s.rng, 1.6, 12, True), p.ink, 1, "geo")
            s.stroke(wp(tri[0:2], s.rng, 1.6, 12), p.rim, 1.6,
                     s.rng.uniform(.12, .42), False, "rim")
    return {"near": lip, "far": far_lip, "near_edge": near_edge,
            "far_edge": far_edge}


def outdoor_band(s, y, tone, rough=26, step=70, top=260):
    """One receding band of land. Stacking these gives aerial perspective."""
    pts = [(x, y + s.rng.uniform(-rough, rough)) for x in range(-60, W + 120, step)]
    s.surface(pts + [(W + 60, y + top), (-60, y + top)], tone, 5, 40)
    return pts


def stage_outdoor(s, horizon=560, ground_tone=None, sun=None, mist=True,
                  bands=((0, "#8fa07a", "#6e7f58"), (58, "#6d7a4e", "#4d5936"))):
    """Daylight: sky, receding bands of land, then ground at our feet."""
    p = s.pal
    sky(s, horizon, sun)
    for dy, c0, c1 in bands:
        outdoor_band(s, horizon + dy, (c0, c1))
    g = ground_tone or p.ground
    fg_y = horizon + 150
    gid = s.lin([("0", g[0], 1), ("1", g[1], 1)], user=(0, fg_y, 0, H))
    pts = [(x, fg_y + s.rng.uniform(-22, 22)) for x in range(-60, W + 120, 80)]
    s.gfill(wp(pts + [(W + 60, H + 60), (-60, H + 60)], s.rng, 5, 40, True),
            gid, "geo")
    # the ground darkens toward the viewer so foreground shapes read
    s.add('<rect x="-40" y="%.1f" width="%d" height="%.1f" fill="url(#%s)"/>'
          % (H - 340, W + 80, 400,
             s.lin([("0", p.ink, 0), ("1", p.ink, .55)])), "geo")
    for i in range(14):                       # tufts and hollows in the ground
        t = (i + .5) / 14
        y = lerp(horizon + 14, H + 30, t ** 1.7)
        s.line((-60, y + s.rng.uniform(-8, 8)), (W + 60, y + s.rng.uniform(-8, 8)),
               p.rock_edge, s.rng.uniform(1.2, 2.4), lerp(.10, .26, t), 6.0, 46)
    if mist:
        s.screen('<rect x="0" y="%.1f" width="%d" height="110" fill="url(#%s)"/>'
                 % (horizon - 66, W,
                    s.lin([("0", p.haze, 0), ("0.6", p.haze, .45), ("1", p.haze, 0)])),
                 .16)
    return {"horizon": horizon}


def stage_corridor(s, half=250, floor_y=830, ceil_y=210, far=(120, 470, 760),
                   glow=None, texture="strata"):
    """A passage running away from us, ending in a dark way-on. This is the
    lamp-lit workhorse: near walls bright, the far end swallowed."""
    g = stage_chamber(s, back=(half, ceil_y + 150), floor_y=floor_y,
                      ceil_y=ceil_y, texture=texture)
    fh, ftop, fbot = far
    opening(s, CX, ftop, min(fbot, g["bby"] - 4), fh, "arch", glow=glow)
    return g


def stage_interior(s, wall_y=(150, 720), back_half=440, floor_boards=True):
    """A built room: back wall, side walls in perspective, boarded floor."""
    p = s.pal
    top, bot = wall_y
    bl, br = CX - back_half, CX + back_half
    s.add('<rect x="0" y="0" width="%d" height="%d" fill="url(#%s)"/>'
          % (W, H, s.lin([("0", p.bg[0], 1), ("0.5", p.bg[1], 1),
                          ("1", p.bg[2], 1)])), "bg")
    s.surface([(bl, top), (br, top), (br, bot), (bl, bot)], p.rock_far, 1.5, 60)
    s.surface([(-60, top - 150), (bl, top), (bl, bot), (-60, bot + 190)],
              p.rock_near, 1.5, 60, vertical=False)
    s.surface([(W + 60, top - 150), (br, top), (br, bot), (W + 60, bot + 190)],
              p.rock_near, 1.5, 60, vertical=False)
    s.surface([(-60, top - 150), (bl, top), (br, top), (W + 60, top - 150)],
              (p.rock_far[1], p.rock_far[0]), 1.5, 60)
    s.surface([(-60, bot + 190), (bl, bot), (br, bot), (W + 60, bot + 190),
               (W + 60, H + 60), (-60, H + 60)], p.ground, 1.5, 60)
    for x in (bl, br):
        s.line((x, top), (x, bot), p.rock_edge, 2.0, .45, 1.2, 60)
    s.line((bl, bot), (br, bot), p.rock_edge, 2.2, .5, 1.2, 60)
    s.line((bl, top), (br, top), p.rock_edge, 2.0, .40, 1.2, 60)
    if floor_boards:
        for i in range(11):
            t = i / 10
            s.line(lp((bl, bot), (br, bot), t),
                   lp((-60, H + 40), (W + 60, H + 40), t),
                   p.rock_edge, 1.6, .22, 1.0, 60)
        for i in range(1, 5):
            y = lerp(bot, H + 40, (i / 5) ** 1.5)
            s.line((-60, y), (W + 60, y), p.rock_edge, 1.2, .14, 1.5, 60)
    return {"bl": bl, "br": br, "top": top, "bot": bot}


def stage_water(s, shore_y=690, far_y=470, wall_top=140, flow=1.0, mud=False):
    """A body of water with a far bank. flow scales the surface chop."""
    p = s.pal
    s.add('<rect x="0" y="0" width="%d" height="%d" fill="url(#%s)"/>'
          % (W, H, s.lin([("0", p.bg[0], 1), ("0.5", p.bg[1], 1),
                          ("1", p.bg[2], 1)])), "bg")
    s.surface([(-40, wall_top)] +
              [(x, far_y - 60 + 24 * math.sin(x / 200.) + s.rng.uniform(-12, 12))
               for x in range(-40, W + 100, 70)] + [(W + 60, wall_top)],
              (p.rock_far[1], p.rock_far[0]), 4, 40)
    far_bank = [(x, far_y + s.rng.uniform(-8, 8)) for x in range(-40, W + 100, 60)]
    s.surface(far_bank + [(W + 60, far_y - 80), (-40, far_y - 80)], p.rock_far,
              3, 34)
    s.stroke(wp(far_bank, s.rng, 3, 34), p.rim, 2.4, .40, False, "rim")

    if mud:
        gid = s.lin([("0", "#3a3228", 1), ("1", "#141210", 1)],
                    user=(0, far_y, 0, shore_y + 60))
    else:
        gid = s.lin([("0", p.rock_near[0], 1), ("0.35", p.rock_far[1], 1),
                     ("1", p.ink, 1)], user=(0, far_y, 0, H))
    s.add('<rect x="-40" y="%.1f" width="%d" height="%.1f" fill="url(#%s)"/>'
          % (far_y, W + 80, H - far_y + 80, gid), "geo")

    if not mud:
        # the far edge takes the most light: it separates water from bank
        s.stroke(wob((-40, far_y + 4), (W + 40, far_y + 2), s.rng, 3, 40),
                 p.accent, 4.0, .55, False, "rim")
        s.screen('<rect x="-40" y="%.1f" width="%d" height="150" '
                 'fill="url(#%s)"/>'
                 % (far_y, W + 80,
                    s.lin([("0", p.rim, .45), ("1", p.rim, 0)])), .7)
        # a broad shimmer where the light glances off the surface
        s.screen('<ellipse cx="%.0f" cy="%.0f" rx="%d" ry="%d" fill="url(#%s)" '
                 'filter="url(#soft2)"/>'
                 % (CX + s.rng.uniform(-140, 140), far_y + 120, 640, 130,
                    s.rad([("0", p.accent, .34), ("1", p.accent, 0)])), .8)
        for i in range(34):
            t = (i / 33) ** 1.7
            y = lerp(far_y + 6, H + 20, t)
            n = int(lerp(3, 10, t))
            xs = [-40]
            while xs[-1] < W + 40:
                xs.append(xs[-1] + s.rng.uniform(40, 150) * (0.5 + t))
            for j in range(len(xs) - 1):
                if s.rng.random() > lerp(.35, .8, t):
                    continue
                a = (xs[j], y + s.rng.uniform(-3, 3) * flow)
                c = (xs[j + 1], y + s.rng.uniform(-3, 3) * flow)
                s.stroke(wob(a, c, s.rng, 1.6 * flow, 26), p.rim,
                         lerp(1.2, 3.6, t), s.rng.uniform(.18, .55) * (.4 + t),
                         False, "rim")
        s.ambient(CX, far_y + 90, 620, 130, op=.30)
    else:
        for _ in range(50):
            cx = s.rng.uniform(-20, W + 20)
            cy = s.rng.uniform(far_y + 10, H)
            r = s.rng.uniform(18, 70) * (0.4 + (cy - far_y) / 500)
            s.fill(wp(blob(cx, cy, r, s.rng, squash=.35), s.rng, 2, 14, True),
                   "#201c17", s.rng.uniform(.3, .8), "geo")
            s.stroke(wp(blob(cx, cy, r, s.rng, squash=.35)[:4], s.rng, 2, 14),
                     p.rim, 1.6, s.rng.uniform(.06, .2), False, "rim")
    return {"shore": shore_y, "far": far_y}
