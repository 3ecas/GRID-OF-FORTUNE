#!/usr/bin/env node
/* =============================================================================
   GRID OF FORTUNE — piece art importer
   -----------------------------------------------------------------------------
   Takes an SVG straight out of Illustrator and turns it into an entry for the
   `art` map in js/ui/icons.js.

     node tools/art.js art/dirt.svg dirt            # print the entry
     node tools/art.js art/dirt.svg dirt --write    # replace it in icons.js
     node tools/art.js art/dirt.svg dirt --tokens   # fills -> theme variables

   It does NOT rewrite your path data. Illustrator's coordinates are left
   exactly as exported and the whole drawing is wrapped in one <g> that scales
   the source artboard into the 24x24 box every other piece is drawn in. Nothing
   to go wrong in the maths, and gradients, masks and nested transforms survive.

   Two things it does fix, both of which bite when art is inlined rather than
   loaded as a file:

     - ids are namespaced. Every tile on the board inlines the same markup, so
       an Illustrator gradient called "linearGradient-1" would appear thirty
       times in one document and every reference would resolve to the first.
     - width/height are dropped, so the icon fills its tile instead of forcing
       Illustrator's export size.
   ============================================================================= */

const fs = require("fs");
const path = require("path");

const BOX = 24;                                   // the viewBox every icon uses
const CANVAS = 512;                               // the square the art is drawn on
const FIT = 0.9;                                  // how much of the box that canvas fills

/* Every piece is drawn on the same 512x512 canvas and dropped into the box at
   one fixed scale, so a small gem stays small beside a big rock instead of both
   being stretched to fill the tile. FIT leaves a margin so nothing touches the
   edge of the cell. Change FIT and re-import the set; never for one piece. */
const ICONS = path.join(__dirname, "..", "js", "ui", "icons.js");

/* ---------- arguments ------------------------------------------------------ */
const args = process.argv.slice(2);
const flags = new Set(args.filter(a => a.startsWith("--")));
const [src, name] = args.filter(a => !a.startsWith("--"));

/* --nudge=x,y shifts the art inside the box, --zoom=n scales it about the
   centre. Both are in 24ths, the same units the icons are drawn in, so
   --nudge=0,1.3 drops a piece by about a twentieth of a tile. Use them to sit
   new art on the same ground line as the pieces already in the game.        */
function opt(flag, fallback) {
    const hit = args.find(a => a.startsWith("--" + flag + "="));
    return hit ? hit.slice(flag.length + 3) : fallback;
}
const nudge = String(opt("nudge", "0,0")).split(",").map(Number);
const zoom = Number(opt("zoom", 1));
if (nudge.some(isNaN) || isNaN(zoom) || !zoom) {
    console.error("--nudge takes x,y and --zoom takes a number, e.g. --nudge=0,1.3 --zoom=1.1");
    process.exit(1);
}

if (!src || !name) {
    console.error("usage: node tools/art.js <file.svg> <icon-name> [--write] [--tokens]");
    process.exit(1);
}
if (!fs.existsSync(src)) {
    console.error("no such file: " + src);
    process.exit(1);
}

const svg = fs.readFileSync(src, "utf8");

/* ---------- the source artboard -------------------------------------------- */
function artboard(text) {
    const vb = text.match(/viewBox\s*=\s*"([^"]+)"/i);
    if (vb) {
        const n = vb[1].trim().split(/[\s,]+/).map(Number);
        if (n.length === 4 && n.every(v => !isNaN(v))) {
            return { x: n[0], y: n[1], w: n[2], h: n[3] };
        }
    }
    const w = text.match(/\bwidth\s*=\s*"([\d.]+)/i);
    const h = text.match(/\bheight\s*=\s*"([\d.]+)/i);
    if (w && h) return { x: 0, y: 0, w: parseFloat(w[1]), h: parseFloat(h[1]) };
    return null;
}

const box = artboard(svg);
if (!box || !box.w || !box.h) {
    console.error("could not read a viewBox or width/height from " + src);
    console.error("in Illustrator: File > Export > Export As > SVG, and tick Responsive off.");
    process.exit(1);
}

/* ---------- the drawing itself --------------------------------------------- */
const open = svg.search(/<svg[\s>]/i);
if (open === -1) { console.error("that file has no <svg> root"); process.exit(1); }
let body = svg.slice(svg.indexOf(">", open) + 1, svg.lastIndexOf("</svg>"));

body = body
    .replace(/<\?xml[\s\S]*?\?>/gi, "")
    .replace(/<!DOCTYPE[\s\S]*?>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<title[\s\S]*?<\/title>/gi, "")
    .replace(/<desc[\s\S]*?<\/desc>/gi, "")
    .trim();

/* ---------- fold the <style> block into presentation attributes ------------
   Illustrator writes its styling as a stylesheet of .st0/.st1 classes. Those
   class names are global the moment this markup is inlined into the page, so
   two pieces imported from two Illustrator files would fight over .st0 and the
   second one would repaint the first. Reading the rules out into per-element
   attributes removes the stylesheet entirely.                               */
const rules = {};                              // class -> { prop: value }
const order = [];
body = body.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (_, css) => {
    css.replace(/([^{}]+)\{([^}]*)\}/g, (_, sel, decls) => {
        const props = {};
        decls.split(";").forEach(d => {
            const i = d.indexOf(":");
            if (i === -1) return;
            const k = d.slice(0, i).trim(), v = d.slice(i + 1).trim();
            if (k) props[k] = v.replace(/(\d)px\b/g, "$1");
        });
        sel.split(",").forEach(one => {
            const m = one.trim().match(/^\.([\w-]+)$/);
            if (!m) return;
            const cls = m[1];
            if (!rules[cls]) { rules[cls] = {}; order.push(cls); }
            Object.assign(rules[cls], props);      // later rules win, as in CSS
        });
        return "";
    });
    return "";
});

const hidden = new Set(order.filter(c => (rules[c].display || "").trim() === "none"));

if (order.length) {
    console.error("  folded " + order.length + " style rule(s) into attributes: ." + order.join(", ."));
}

/* drop anything the stylesheet hides, and any raster along with it - a hidden
   tracing layer is usually the bulk of an Illustrator export                */
if (hidden.size) {
    const before = body.length;
    hidden.forEach(cls => {
        const open = new RegExp('<g\\b[^>]*class="[^"]*\\b' + cls + '\\b[^"]*"[^>]*>', "i");
        let m;
        while ((m = body.match(open))) {
            const start = m.index;
            let i = start + m[0].length, depth = 1;
            const tag = /<\/?g\b/gi;
            tag.lastIndex = i;
            let t;
            while (depth > 0 && (t = tag.exec(body))) {
                depth += t[0][1] === "/" ? -1 : 1;
                i = tag.lastIndex;
            }
            const end = body.indexOf(">", i - 1) + 1;
            body = body.slice(0, start) + body.slice(end > 0 ? end : i);
        }
    });
    console.error("  dropped hidden layer(s) ." + [...hidden].join(", .") +
                  "  (" + (before - body.length) + " bytes)");
}

const rasters = (body.match(/<image\b/gi) || []).length;
if (rasters) {
    body = body.replace(/<image\b[^>]*\/>/gi, "").replace(/<image\b[\s\S]*?<\/image>/gi, "");
    console.error("  ! removed " + rasters + " embedded raster image(s). This importer is for");
    console.error("    vector art; a placed photo cannot become an inline icon.");
}

/* apply each element's classes as real attributes */
body = body.replace(/<([a-zA-Z][\w-]*)((?:\s+[^<>]*?)?)\/?>/g, (tag, el, attrs) => {
    const cm = attrs.match(/\sclass\s*=\s*"([^"]*)"/);
    if (!cm) return tag;
    const props = {};
    cm[1].trim().split(/\s+/).forEach(c => Object.assign(props, rules[c] || {}));
    let rest = attrs.replace(/\sclass\s*=\s*"[^"]*"/, "");
    Object.keys(props).forEach(k => {
        if (k === "display") return;
        if (new RegExp("\\s" + k + "\\s*=").test(rest)) return;   // an attribute already set wins
        rest += ' ' + k + '="' + props[k] + '"';
    });
    const selfClose = tag.trim().endsWith("/>");
    return "<" + el + rest + (selfClose ? "/>" : ">");
});

body = body
    .replace(/\sclass\s*=\s*"[^"]*"/g, "")
    .replace(/<defs\s*>\s*<\/defs>/gi, "")
    .replace(/<g\s*>\s*<\/g>/g, "")
    .replace(/\s*\n\s*/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();

if (!body) { console.error("that file draws nothing"); process.exit(1); }

/* ---------- namespace every id so thirty copies can coexist ---------------- */
const ids = new Set();
body.replace(/\bid\s*=\s*"([^"]+)"/g, (_, id) => (ids.add(id), _));
const referenced = /url\(#|href="#/.test(body);
if (ids.size) console.error("  namespaced " + ids.size + " id(s) as " + name + "-*");
if (ids.size && referenced) {
    console.error("  ! a gradient or clip lives in <defs>, and the same markup is inlined on");
    console.error("    every tile, so those ids repeat across the page. Browsers resolve each");
    console.error("    reference to the first match and the defs are identical, so it draws");
    console.error("    correctly - it is just technically duplicate ids. Object > Expand in");
    console.error("    Illustrator before exporting avoids it entirely.");
}
ids.forEach(id => {
    const safe = id.replace(/[^\w-]/g, "");
    const tag = name + "-" + safe;
    body = body
        .split('id="' + id + '"').join('id="' + tag + '"')
        .split("url(#" + id + ")").join("url(#" + tag + ")")
        .split('href="#' + id + '"').join('href="#' + tag + '"');
});

/* ---------- optional: hand the fills to the theme -------------------------- */
if (flags.has("--tokens")) {
    const hexes = [...new Set((body.match(/fill\s*=\s*"#[0-9a-f]{3,8}"/gi) || [])
        .map(m => m.match(/#[0-9a-f]{3,8}/i)[0].toLowerCase()))];

    if (hexes.length === 0) {
        console.error("! --tokens: no plain fill=\"#rrggbb\" attributes to map.");
        console.error("  Illustrator may have written them as style=\"fill:#...\" or into a <style> block.");
        console.error("  Export with Styling: Presentation Attributes.");
    } else {
        const lum = h => {
            const s = h.slice(1);
            const f = s.length === 3 ? s.split("").map(c => c + c).join("") : s.slice(0, 6);
            const [r, g, b] = [0, 2, 4].map(i => parseInt(f.slice(i, i + 2), 16));
            return 0.2126 * r + 0.7152 * g + 0.0722 * b;
        };
        const sorted = [...hexes].sort((a, b) => lum(b) - lum(a));
        const token = sorted.length >= 3
            ? { [sorted[0]]: "-light", [sorted[sorted.length - 1]]: "-deep" }
            : {};
        sorted.forEach(h => {
            const suffix = token[h] !== undefined ? token[h] : "";
            body = body.split('fill="' + h + '"').join('fill="var(--i-' + name + suffix + ')"')
                       .split('fill="' + h.toUpperCase() + '"').join('fill="var(--i-' + name + suffix + ')"');
        });
        console.error("  mapped " + sorted.length + " fill(s) to --i-" + name + " / -light / -deep");
        if (sorted.length > 3) console.error("  ! more than three fills; the middle ones all became --i-" + name);
    }
}

/* ---------- fit the canvas into the 24x24 box ------------------------------
   The canvas is the frame, not the drawing, and the scale is a fixed number
   rather than one fitted to this piece — that is what keeps the set in
   proportion with itself.

   A square export carries the whole canvas, so its own size is the frame,
   whatever pixel size the document happens to be. A transparent export cropped
   to the artwork has thrown the frame away; CANVAS stands in for it, which
   still gives the right size, and centring puts the piece back where art drawn
   in the middle of the canvas belongs.                                      */
const square = Math.abs(box.w - box.h) <= 0.5;
const canvas = square ? Math.max(box.w, box.h) : CANVAS;
const scale = (BOX / canvas) * FIT * zoom;

if (!square) {
    console.error("  . export is " + box.w + "x" + box.h + ", cropped to the artwork rather than the");
    console.error("    whole canvas, so it is placed as " + CANVAS + "x" + CANVAS + " art and centred. Export");
    console.error("    the canvas instead if a piece is meant to sit off-centre.");
}
const tx = (BOX - box.w * scale) / 2 - box.x * scale + (nudge[0] || 0);
const ty = (BOX - box.h * scale) / 2 - box.y * scale + (nudge[1] || 0);
const round = n => (Math.round(n * 1e4) / 1e4).toString();

const transform = "translate(" + round(tx) + " " + round(ty) + ") scale(" + round(scale) + ")";
const inner = '<g transform="' + transform + '">' + body + "</g>";

/* ---------- emit it the way icons.js is written ---------------------------- */
function asJs(str) {
    const CHUNK = 68;
    const parts = [];
    for (let i = 0; i < str.length; i += CHUNK) parts.push(str.slice(i, i + CHUNK));
    return parts.map(p => "            '" + p.replace(/'/g, "\\'") + "'").join(" +\n");
}

const entry = "        " + name + ":\n" + asJs(inner) + ",";

if (!flags.has("--write")) {
    console.error("\n" + src + "  canvas " + canvas + "  ->  24x24 at scale " + round(scale));
    console.error("paste this into the `art` map in js/ui/icons.js:\n");
    console.log(entry);
    process.exit(0);
}

/* ---------- or splice it straight into icons.js ---------------------------- */
let file = fs.readFileSync(ICONS, "utf8");
const start = file.search(new RegExp("^        " + name + ":\\s*$", "m"));
if (start === -1) {
    console.error("icons.js has no `" + name + ":` entry in the art map to replace.");
    console.error("add one by hand first, or run without --write and paste it in.");
    process.exit(1);
}
const end = file.indexOf("',\n", start);
if (end === -1) { console.error("could not find the end of the " + name + " entry"); process.exit(1); }

file = file.slice(0, start) + entry + file.slice(end + 3 - 1);
fs.writeFileSync(ICONS, file);
console.error(src + "  ->  icons.js art." + name + "  (canvas " + canvas + ", scale " + round(scale) + ")");
