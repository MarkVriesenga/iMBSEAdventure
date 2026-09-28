#!/usr/bin/env python3
"""build.py — render every registered plate to svg/ and png/, then write a
contact sheet for review.

  python3 build.py                 # everything
  python3 build.py cellar maze1    # just these keys
  python3 build.py --svg-only      # skip the raster pass
  python3 build.py --no-quantize   # keep the 24-bit pngs as Chrome wrote them
"""
import concurrent.futures as cf
import json
import os
import pathlib
import subprocess
import sys

import plates

HERE = pathlib.Path(__file__).parent
SVG = HERE / "svg"
PNG = HERE / "png"
WEBP = HERE / "webp"
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
W, H = 1058, 1052


def render_png(key):
    src = SVG / (key + ".svg")
    shim = PNG / ("_%s.html" % key)
    shim.write_text(
        "<!doctype html><meta charset=utf-8>"
        "<style>html,body{margin:0;padding:0;overflow:hidden;background:#000}"
        "img{display:block;width:%dpx;height:%dpx}</style>"
        '<img src="../svg/%s.svg">' % (W, H, key))
    subprocess.run(
        [CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars",
         "--force-device-scale-factor=1", "--virtual-time-budget=4000",
         "--window-size=%d,%d" % (W, H),
         "--screenshot=%s" % (PNG / (key + ".png")),
         "file://%s" % shim],
        capture_output=True)
    shim.unlink(missing_ok=True)
    return key


def quantize_png(keys):
    """The app ships these pngs, so squeeze them: an adaptive 256-colour
    palette holds up on this artwork (it is all soft gradients under grain) and
    takes roughly 1.3 MB down to 250 KB. Dithering is off on purpose: it adds
    high-frequency noise that triples the file for no visible gain here."""
    try:
        from PIL import Image
    except ImportError:
        print("  (Pillow not installed — shipping the full-colour pngs)")
        return
    total = 0
    for k in keys:
        p = PNG / (k + ".png")
        if not p.exists():
            continue
        im = Image.open(p).convert("RGB")
        im.quantize(colors=256, method=Image.FASTOCTREE, dither=Image.NONE) \
          .save(p, "PNG", optimize=True)
        total += p.stat().st_size
    print("png: %d files, %.1f MB total" % (len(keys), total / 1e6))


def write_webp(keys):
    """A lighter alternative set, same pixels — not used by the app."""
    try:
        from PIL import Image
    except ImportError:
        return
    WEBP.mkdir(exist_ok=True)
    total = 0
    for k in keys:
        src = PNG / (k + ".png")
        if not src.exists():
            continue
        dst = WEBP / (k + ".webp")
        Image.open(src).convert("RGB").save(dst, "WEBP", quality=82, method=5)
        total += dst.stat().st_size
    print("webp: %d files, %.1f MB total" % (len(keys), total / 1e6))


def contact_sheet(keys):
    cells = "".join(
        '<figure><img src="png/%s.png" alt="%s" loading="lazy">'
        '<figcaption><b>%s</b><span>%s</span></figcaption></figure>'
        % (k, plates.TITLES[k], plates.TITLES[k], k) for k in keys)
    (HERE / "contact-sheet.html").write_text(
        "<!doctype html><meta charset=utf-8><title>iMBSE — plates</title>"
        "<style>"
        "body{margin:0;background:#f3f1eb;color:#101214;"
        "font:14px/1.4 ui-sans-serif,system-ui,-apple-system,sans-serif;padding:26px}"
        "h1{font-size:22px;letter-spacing:-.03em;margin:0 0 4px}"
        "p.sub{margin:0 0 22px;color:#7b7c77;font-family:ui-monospace,Menlo,monospace;"
        "font-size:11px;letter-spacing:.08em;text-transform:uppercase}"
        ".grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(266px,1fr));gap:20px}"
        "figure{margin:0}"
        "img{display:block;width:100%%;aspect-ratio:1058/1052;object-fit:cover;"
        "background:#0a0b0d;border:1px solid #d8d5cd;border-radius:8px}"
        "figcaption{display:flex;justify-content:space-between;gap:8px;margin-top:6px;"
        "font-size:12px}"
        "figcaption span{color:#7b7c77;font-family:ui-monospace,Menlo,monospace;font-size:10px}"
        "</style>"
        "<h1>iMBSE — room plates</h1>"
        "<p class=sub>%d plates &middot; 1058 &times; 1052 &middot; fits the 531 &times; 526 automap frame</p>"
        '<div class="grid">%s</div>' % (len(keys), cells))


def check_coverage():
    """Every room in the canon must map to a plate, or the Room tab silently
    falls back to darkness. Fail the build instead."""
    canon = HERE.parent / "imbse-canon.js"
    if not canon.exists():
        return
    out = subprocess.run(
        ["node", "-e",
         "const C=require(%r);const R=C.rooms||C;console.log(Object.keys(R).join(','))"
         % str(canon)],
        capture_output=True, text=True)
    if out.returncode != 0:
        print("  (could not read the canon — skipping coverage check)")
        return
    rooms = [r for r in out.stdout.strip().split(",") if r]
    missing = [r for r in rooms if r not in plates.ROOM_TO_PLATE]
    if missing:
        sys.exit("rooms with no plate: " + ", ".join(missing))
    extra = [k for k in plates.ROOM_TO_PLATE if k not in rooms]
    if extra:
        sys.exit("plates for rooms that do not exist: " + ", ".join(extra))
    print("coverage: %d rooms -> %d plates" % (len(rooms), len(plates.ORDER)))


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    svg_only = "--svg-only" in sys.argv
    SVG.mkdir(exist_ok=True)
    PNG.mkdir(exist_ok=True)
    check_coverage()
    keys = args or plates.ORDER
    bad = [k for k in keys if k not in plates.REGISTRY]
    if bad:
        sys.exit("unknown plate(s): " + ", ".join(bad))

    for k in keys:
        (SVG / (k + ".svg")).write_text(plates.build(k))
    print("svg: %d plates" % len(keys))

    if not svg_only:
        n = max(2, (os.cpu_count() or 4) - 2)
        with cf.ThreadPoolExecutor(max_workers=n) as ex:
            for i, k in enumerate(ex.map(render_png, keys), 1):
                if i % 10 == 0 or i == len(keys):
                    print("  png %d/%d" % (i, len(keys)))
        write_webp(keys)
        if "--no-quantize" not in sys.argv:
            quantize_png(keys)
    contact_sheet(plates.ORDER)
    manifest = {
        "frame": {"css_w": 531, "css_h": 526, "px_w": W, "px_h": H},
        "plates": {k: {"title": plates.TITLES[k],
                       "svg": "svg/%s.svg" % k,
                       "png": "png/%s.png" % k,
                       "webp": "webp/%s.webp" % k,
                       "rooms": [k] + plates.ALIASES.get(k, [])}
                   for k in plates.ORDER},
        "room_to_plate": plates.ROOM_TO_PLATE,
    }
    (HERE / "manifest.json").write_text(json.dumps(manifest, indent=1))

    # the same map as a plain script, so the app can read it over file://
    (HERE / "plates-manifest.js").write_text(
        "/* plates-manifest.js — generated by images/build.py. Do not edit.\n"
        " * Maps every iMBSE room key onto the plate that illustrates it.\n"
        " */\n"
        "window.IMBSE_PLATES = {\n"
        "  dir: 'images/png/',\n"
        "  ext: '.png',\n"
        "  titles: %s,\n"
        "  roomToPlate: %s\n"
        "};\n" % (json.dumps(plates.TITLES, indent=2, sort_keys=True),
                   json.dumps(plates.ROOM_TO_PLATE, indent=2, sort_keys=True)))
    print("contact-sheet.html, manifest.json and plates-manifest.js written")


if __name__ == "__main__":
    main()
