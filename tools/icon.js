#!/usr/bin/env node
/* =============================================================================
   GRID OF FORTUNE — app icon generator
   -----------------------------------------------------------------------------
   Four board squares, three of them empty and the fourth holding a gold coin.
   That is the game in one picture: the board is mostly empty, and what you are
   playing for is the one square you made something in.

   The coin is the ladder's own gold art from js/ui/icons.js, same proportions,
   so the icon cannot drift away from what the game actually draws.

   Writes a real PNG with nothing but node's own zlib — no image dependency to
   install, the same trick tools/icon.js uses over in SONAR.

     npm run icons
   ============================================================================= */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

/* ---------- minimal PNG writer -------------------------------------------- */
function crc32(buf) {
    let c, crc = 0xffffffff;
    for (let n = 0; n < buf.length; n++) {
        c = (crc ^ buf[n]) & 0xff;
        for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        crc = c ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
    const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body));
    return Buffer.concat([len, body, crc]);
}

/** pixels: (x,y) -> [r,g,b]. Colour type 2 — no alpha, which iOS requires. */
function writePNG(file, size, pixel) {
    const raw = Buffer.alloc(size * (size * 3 + 1));
    let o = 0;
    for (let y = 0; y < size; y++) {
        raw[o++] = 0;                       // filter: none
        for (let x = 0; x < size; x++) {
            const c = pixel(x, y);
            raw[o++] = c[0]; raw[o++] = c[1]; raw[o++] = c[2];
        }
    }
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
    ihdr[8] = 8;    // bit depth
    ihdr[9] = 2;    // colour type: truecolour
    fs.writeFileSync(file, Buffer.concat([
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        chunk('IHDR', ihdr),
        chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
        chunk('IEND', Buffer.alloc(0))
    ]));
}

/* ---------- the palette, straight out of css/theme.css --------------------- */
const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];

const BG        = hex('#f5efe3');   // --bg
const BG_DEEP   = hex('#efe7d8');   // --bg-deep
const TILE      = hex('#fffdf8');   // --panel
const GOLD      = hex('#e2b75c');   // --i-gold
const GOLD_LIT  = hex('#f8dc99');   // --i-gold-light
const GOLD_DEEP = hex('#b78d33');   // --i-gold-deep

/* ---------- geometry, as fractions of the icon ----------------------------- */
const MARGIN = 0.148;               // ground left around the four squares
const GAP    = 0.050;               // between squares, echoing the board
const RADIUS = 0.25;                // corner radius, as a fraction of a square

/** Is (x, y) inside a rounded rect? */
function inRounded(x, y, left, top, size, r) {
    if (x < left || x > left + size || y < top || y > top + size) return false;
    const qx = Math.min(x - left, left + size - x);
    const qy = Math.min(y - top, top + size - y);
    if (qx < r && qy < r) {
        const dx = r - qx, dy = r - qy;
        return dx * dx + dy * dy <= r * r;
    }
    return true;
}

/**
 * Colour at one sample point, in 0..1 icon space. Painted back to front, the
 * same order js/ui/icons.js lays the gold coin down in.
 */
function sample(x, y) {
    /* the ground: the game's warm cream, settling a touch deeper down the page */
    const t = (x + y) / 2;
    const ground = [
        BG[0] + (BG_DEEP[0] - BG[0]) * t,
        BG[1] + (BG_DEEP[1] - BG[1]) * t,
        BG[2] + (BG_DEEP[2] - BG[2]) * t
    ];

    const span = 1 - MARGIN * 2;
    const cell = (span - GAP) / 2;
    const r = cell * RADIUS;

    for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 2; col++) {
            const left = MARGIN + col * (cell + GAP);
            const top = MARGIN + row * (cell + GAP);
            if (!inRounded(x, y, left, top, cell, r)) continue;

            /* three squares stand empty; the last one is what you made */
            if (!(row === 1 && col === 1)) return TILE;

            /* the gold coin, at the ladder art's own proportions (r=9 of 24) */
            const cx = left + cell / 2, cy = top + cell / 2;
            const dx = x - cx, dy = y - cy;
            const d = Math.sqrt(dx * dx + dy * dy);

            if (d > (9 / 24) * cell) return TILE;
            if (d <= (3 / 24) * cell) return GOLD;
            if (d <= (5.8 / 24) * cell) return GOLD_LIT;
            return dx > 0 ? GOLD_DEEP : GOLD;
        }
    }

    return ground;
}

/* ---------- draw ----------------------------------------------------------- */
const SS = 3;                       // supersampling — circles need the help

function makeIcon(size, out) {
    writePNG(out, size, (px, py) => {
        let r = 0, g = 0, b = 0;
        for (let sy = 0; sy < SS; sy++) {
            for (let sx = 0; sx < SS; sx++) {
                const c = sample(
                    (px + (sx + 0.5) / SS) / size,
                    (py + (sy + 0.5) / SS) / size
                );
                r += c[0]; g += c[1]; b += c[2];
            }
        }
        const n = SS * SS;
        return [Math.round(r / n), Math.round(g / n), Math.round(b / n)];
    });
}

const root = path.join(__dirname, '..');
const targets = [
    [1024, path.join(root, 'ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png')]
];

for (const [size, out] of targets) {
    if (!fs.existsSync(path.dirname(out))) {
        console.error('missing: ' + path.dirname(out));
        process.exit(1);
    }
    makeIcon(size, out);
    console.log('wrote ' + size + '×' + size + '  ' + path.relative(root, out));
}
