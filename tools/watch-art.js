#!/usr/bin/env node
/* =============================================================================
   GRID OF FORTUNE — art watcher
   -----------------------------------------------------------------------------
     npm run art:watch

   Watches ICONS/EXPORT/ and re-imports a piece the moment you export it from
   the drawing app. Export, alt-tab, refresh — that is the whole loop.
   Pass another folder as an argument to watch that one instead.

   What it cannot do is press Export for you. Saving a .ai writes Illustrator's
   own format, which nothing here can read; the SVG only appears when you export
   one. Illustrator's Asset Export panel makes that a single click, and this
   picks the file up from there.

   The art stays inlined into js/ui/icons.js rather than being fetched at
   runtime, because the sparks thrown off a merge clone a piece's markup dozens
   of times and the iOS build has to carry every icon anyway. Regenerating on
   export gets the convenience without giving that up.

   Naming: a leading ladder number is ignored, then the file is matched against
   the art keys in icons.js and then against piece ids — so 02_ROCK.svg,
   ROCK.svg and STONE.svg all land on the `rock` icon.

   Per-piece tweaks live in art.json beside the art so a re-export does not undo
   them, keyed by the file name as exported:

     { "01_DIRT.svg": { "nudge": [0, 1.3], "zoom": 1.05, "tokens": false } }
   ============================================================================= */

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { spawnSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const DIR = process.argv[2] || path.join(ROOT, "ICONS", "EXPORT");
const ART = path.join(ROOT, "tools", "art.js");
const OPTS = path.join(DIR, "art.json");

/* ---------- what names are legal ------------------------------------------- */
function knownIcons() {
    const sandbox = { window: {} };
    sandbox.window = sandbox;
    vm.createContext(sandbox);
    for (const f of ["js/core/config.js", "js/data/pieces.js"]) {
        vm.runInContext(fs.readFileSync(path.join(ROOT, f), "utf8"), sandbox, { filename: f });
    }
    const byPiece = {};
    sandbox.Game.Pieces.list.forEach(p => { byPiece[p.id] = p.icon; });

    const icons = fs.readFileSync(path.join(ROOT, "js", "ui", "icons.js"), "utf8");
    const art = new Set();
    const block = icons.slice(icons.indexOf("var art = {"));
    block.replace(/^\s{8}([a-z_][\w]*):/gm, (_, k) => (art.add(k), _));
    return { art, byPiece };
}

const { art, byPiece } = knownIcons();

function iconFor(file) {
    const stem = path.basename(file)
        .replace(/\.svg$/i, "")
        .replace(/^\d+[_-]/, "")                    // 02_ROCK.svg -> ROCK
        .toLowerCase();
    if (art.has(stem)) return stem;                 // ROCK.svg  -> rock
    if (byPiece[stem]) return byPiece[stem];        // STONE.svg -> rock
    return null;
}

function options(file) {
    if (!fs.existsSync(OPTS)) return [];
    let cfg;
    try { cfg = JSON.parse(fs.readFileSync(OPTS, "utf8")); }
    catch (e) { console.error("  ! " + path.basename(OPTS) + " is not valid JSON: " + e.message); return []; }
    const o = cfg[path.basename(file)] || cfg[path.basename(file).toLowerCase()] || {};
    const out = [];
    if (Array.isArray(o.nudge)) out.push("--nudge=" + o.nudge.join(","));
    if (o.zoom) out.push("--zoom=" + o.zoom);
    if (o.tokens) out.push("--tokens");
    return out;
}

/* ---------- import one file ------------------------------------------------ */
function bring(file) {
    const icon = iconFor(file);
    const base = path.basename(file);

    if (!icon) {
        console.error("  ? " + base + " — no icon called \"" +
            base.replace(/\.svg$/i, "").replace(/^\d+[_-]/, "").toLowerCase() +
            "\". Name it after the piece (01_DIRT.svg, DIRT.svg, STONE.svg) or after " +
            "the art key in icons.js.");
        return;
    }

    const run = spawnSync(process.execPath, [ART, file, icon, "--write", ...options(file)],
                          { encoding: "utf8" });
    const said = (run.stderr || "").trim().split("\n").filter(Boolean);

    if (run.status !== 0) {
        console.error("  x " + base + " -> " + icon);
        said.forEach(l => console.error("      " + l.trim()));
        return;
    }
    const stamp = new Date().toLocaleTimeString();
    console.error(stamp + "  " + base + " -> icons.js art." + icon);
    said.filter(l => l.trim().startsWith("!")).forEach(l => console.error("      " + l.trim()));
}

/* ---------- watch ---------------------------------------------------------- */
if (!fs.existsSync(DIR)) {
    console.error("no such folder: " + DIR);
    process.exit(1);
}

const svgs = fs.readdirSync(DIR).filter(f => /\.svg$/i.test(f));
console.error("watching " + path.relative(ROOT, DIR) + "/  (" + svgs.length +
              " svg" + (svgs.length === 1 ? "" : "s") + ")  — export from Illustrator and refresh the game");
svgs.forEach(f => {
    const icon = iconFor(f);
    console.error("    " + f + (icon ? "  ->  art." + icon : "  ->  ? no matching icon"));
});

const pending = new Map();
fs.watch(DIR, (event, file) => {
    if (!file || !/\.svg$/i.test(file)) return;
    const full = path.join(DIR, file);

    // editors and exporters touch a file several times per save
    clearTimeout(pending.get(file));
    pending.set(file, setTimeout(() => {
        pending.delete(file);
        if (!fs.existsSync(full)) return;
        if (!fs.statSync(full).size) return;
        bring(full);
    }, 250));
});

process.on("SIGINT", () => { console.error("\nstopped watching"); process.exit(0); });
