window.Game = window.Game || {};

/* =============================================================================
   LIVE ART
   -----------------------------------------------------------------------------
   Reads the piece art straight out of ICONS/EXPORT/ when the game boots, so
   exporting an SVG and refreshing the page is the whole loop. No build step and
   no terminal, which matters when the editor does not have one.

   Files there are named by ladder position — 01_DIRT.svg, 02_ROCK.svg — so the
   folder reads in the order the game plays. The bare name still works.

   Whatever the folder does not have keeps the art baked into icons.js. That is what
   the iOS build ships, so turning liveArt off in config changes nothing about
   how the game looks — it only stops it looking for files.

   The cleaning up is done by the browser rather than by hand. The file is put
   into the document out of sight, and then getComputedStyle is asked what each
   element actually ends up looking like. That resolves Illustrator's <style>
   block of .st0/.st1 classes properly — including cascade and specificity —
   where picking the rules apart with string matching would only mostly work.
   ============================================================================= */

(function () {
    var FOLDER = "ICONS/EXPORT/";
    var BOX = 24;

    // the same canvas and fit tools/art.js uses, so a piece looks identical
    // whether it was read from the folder or baked into icons.js
    var CANVAS = 512;
    var FIT = 0.9;

    var PAINT = [
        "fill", "fill-opacity", "fill-rule",
        "stroke", "stroke-width", "stroke-linecap", "stroke-linejoin",
        "stroke-miterlimit", "stroke-dasharray", "stroke-opacity", "opacity"
    ];

    var DULL = { "fill-opacity": "1", "fill-rule": "nonzero", "stroke": "none",
                 "stroke-width": "1px", "stroke-linecap": "butt",
                 "stroke-linejoin": "miter", "stroke-miterlimit": "4",
                 "stroke-dasharray": "none", "stroke-opacity": "1", "opacity": "1" };

    /* 01_DIRT.svg, 02_ROCK.svg: the ladder position the piece sits at, so the
       export folder sorts the way the game plays. Off-ladder pieces are 00. */
    function numbered(icon) {
        var list = Game.Pieces ? Game.Pieces.list : [];
        var tier = 0;
        for (var i = 0; i < list.length; i++) {
            if (list[i].icon === icon) { tier = list[i].tier; break; }
        }
        return (tier < 10 ? "0" : "") + tier + "_" + icon.toUpperCase();
    }

    function box(svg) {
        var vb = (svg.getAttribute("viewBox") || "").trim().split(/[\s,]+/).map(Number);
        if (vb.length === 4 && vb.every(function (n) { return !isNaN(n); })) {
            return { x: vb[0], y: vb[1], w: vb[2], h: vb[3] };
        }
        var w = parseFloat(svg.getAttribute("width"));
        var h = parseFloat(svg.getAttribute("height"));
        if (w && h) return { x: 0, y: 0, w: w, h: h };
        return null;
    }

    // let the browser resolve the stylesheet, then write the answers onto the
    // elements themselves so no class names escape into the page
    function bake(root) {
        var all = root.querySelectorAll("*");
        var doomed = [];

        Array.prototype.forEach.call(all, function (el) {
            var tag = (el.tagName || "").toLowerCase();
            if (tag === "style" || tag === "image") { doomed.push(el); return; }

            var seen = window.getComputedStyle(el);
            if (seen.display === "none" || seen.visibility === "hidden") {
                doomed.push(el);
                return;
            }
            if (tag === "svg" || tag === "defs" || tag === "clippath" ||
                tag === "lineargradient" || tag === "radialgradient" || tag === "stop") {
                return;
            }
            PAINT.forEach(function (prop) {
                var v = seen.getPropertyValue(prop);
                if (!v || v === DULL[prop]) return;
                el.setAttribute(prop, v.trim());
            });
        });

        doomed.forEach(function (el) {
            if (el.parentNode) el.parentNode.removeChild(el);
        });

        Array.prototype.forEach.call(root.querySelectorAll("[class]"), function (el) {
            el.removeAttribute("class");
        });
    }

    // every tile inlines the same markup, so ids have to be unique per piece or
    // one gradient answers for all of them
    function namespaceIds(markup, key) {
        var ids = [];
        markup.replace(/\bid\s*=\s*"([^"]+)"/g, function (_, id) { ids.push(id); return _; });

        ids.forEach(function (id) {
            var tag = key + "-" + id.replace(/[^\w-]/g, "");
            markup = markup
                .split('id="' + id + '"').join('id="' + tag + '"')
                .split("url(#" + id + ")").join("url(#" + tag + ")")
                .split('href="#' + id + '"').join('href="#' + tag + '"');
        });
        return markup;
    }

    function convert(text, key) {
        var doc = new DOMParser().parseFromString(text, "image/svg+xml");
        if (doc.querySelector("parsererror")) return null;

        var svg = doc.documentElement;
        if (!svg || svg.tagName.toLowerCase() !== "svg") return null;

        var b = box(svg);
        if (!b || !b.w || !b.h) return null;

        // out of sight but still laid out, so computed styles are real
        var hide = document.createElement("div");
        hide.setAttribute("aria-hidden", "true");
        hide.style.cssText =
            "position:absolute;left:-9999px;top:0;width:0;height:0;overflow:hidden";
        var live = document.importNode(svg, true);
        hide.appendChild(live);
        document.body.appendChild(hide);

        var markup;
        try {
            bake(live);
            markup = live.innerHTML;
        } finally {
            document.body.removeChild(hide);
        }

        if (!markup || !markup.trim()) return null;

        markup = namespaceIds(markup.trim(), key);

        // a square export carries the whole canvas; one cropped to the artwork
        // has lost it, and CANVAS stands in — see tools/art.js
        var canvas = Math.abs(b.w - b.h) <= 0.5 ? Math.max(b.w, b.h) : CANVAS;
        var scale = (BOX / canvas) * FIT;
        var tx = (BOX - b.w * scale) / 2 - b.x * scale;
        var ty = (BOX - b.h * scale) / 2 - b.y * scale;
        var round = function (n) { return Math.round(n * 1e4) / 1e4; };

        return '<g transform="translate(' + round(tx) + " " + round(ty) +
               ") scale(" + round(scale) + ')">' + markup + "</g>";
    }

    function fetchText(url) {
        return fetch(url, { cache: "no-store" }).then(function (r) {
            return r.ok ? r.text() : null;
        }).catch(function () { return null; });
    }

    Game.LiveArt = {
        // resolve when every piece that has a file has been swapped in
        load: function () {
            var s = Game.Config.game;
            if (!s.liveArt || typeof fetch !== "function" || typeof DOMParser !== "function") {
                return Promise.resolve(0);
            }

            // Naming the pieces you have art for keeps this silent. Asking for
            // all thirty-five and seeing what answers works too, but every
            // piece without a file is a 404 in the console, which is a lot of
            // red for a thing that is working correctly.
            var asked = Array.isArray(s.liveArt) ? s.liveArt : Game.Icons.keys();

            var wanted = {};
            asked.forEach(function (name) {
                var key = name.toLowerCase();
                if (!Game.Icons.has(key) && Game.Pieces) {
                    var piece = Game.Pieces.byId(key);
                    if (piece && piece.icon) key = piece.icon;
                }
                if (!Game.Icons.has(key)) {
                    if (window.console) console.warn(
                        "live art: there is no piece called \"" + name + "\" to replace");
                    return;
                }
                wanted[key] = [numbered(key), key.toUpperCase(), key];
            });
            // a piece whose art is filed under another name should answer to
            // both, so STONE.svg and ROCK.svg each reach art.rock
            // a piece filed under another name answers to both, so STONE.svg
            // and ROCK.svg each reach art.rock
            (Game.Pieces ? Game.Pieces.list : []).forEach(function (piece) {
                if (piece.icon === piece.id || !wanted[piece.icon]) return;
                wanted[piece.icon].push(piece.id.toUpperCase(), piece.id);
            });

            var swapped = 0;
            var jobs = Object.keys(wanted).map(function (key) {
                var names = wanted[key];

                var next = function (i) {
                    if (i >= names.length) return Promise.resolve();
                    return fetchText(FOLDER + names[i] + ".svg").then(function (text) {
                        if (!text) return next(i + 1);
                        var markup = convert(text, key);
                        if (!markup) {
                            if (window.console) console.warn(
                                "live art: " + names[i] + ".svg could not be read; keeping the built-in " + key);
                            return;
                        }
                        if (Game.Icons.replace(key, markup)) swapped++;
                    });
                };

                return next(0);
            });

            return Promise.all(jobs).then(function () {
                if (swapped && window.console) {
                    console.info("live art: " + swapped + " piece" + (swapped === 1 ? "" : "s") +
                                 " read from " + FOLDER + " (set liveArt false in config to stop)");
                }
                return swapped;
            });
        }
    };
})();
