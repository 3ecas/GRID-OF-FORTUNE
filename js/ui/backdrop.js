window.Game = window.Game || {};

/* =============================================================================
   BACKDROP
   -----------------------------------------------------------------------------
   The ground the game sits on, made out of the game. Rather than invent a
   pattern, this scatters the pieces' own silhouettes across the page at a size
   nobody would call a piece — a diamond four hundred pixels wide, a star, the
   hexagon of zinc — and drops them to a few percent opacity.

   Two things fall out of doing it this way. The colours are automatically the
   game's colours, because the art is drawn in the same --i-* tokens the tiles
   are; and it can never drift out of step with the art, since redrawing a piece
   redraws its shadow on the wall behind the board too.

   The middle of the screen is left alone. Everything is placed out at the
   edges, where the board and the hand are not.
   ============================================================================= */

(function () {
    /* pieces with a silhouette worth reading at size, and where each one sits:
       x and y as percentages, kept clear of the middle band */
    var CAST = [
        { art: "diamond",  x: -8,  y: 6,   size: 46, spin: -14, fade: 0.09 },
        { art: "lodestone", x: 78, y: -6,  size: 52, spin: 12,  fade: 0.08 },
        { art: "zinc",     x: 82,  y: 34,  size: 34, spin: -8,  fade: 0.07 },
        { art: "amethyst", x: -12, y: 44,  size: 40, spin: 16,  fade: 0.07 },
        { art: "crown",    x: 58,  y: 82,  size: 44, spin: -10, fade: 0.08 },
        { art: "rock",     x: -6,  y: 76,  size: 38, spin: 8,   fade: 0.09 },
        { art: "emerald",  x: 30,  y: -12, size: 30, spin: -18, fade: 0.06 },
        { art: "quartz",   x: 24,  y: 88,  size: 28, spin: 14,  fade: 0.06 }
    ];

    Game.Backdrop = {
        init: function () {
            var host = document.getElementById("backdrop");
            if (!host || !Game.Icons) return;

            host.innerHTML = CAST.map(function (one, i) {
                if (!Game.Icons.has(one.art)) return "";
                return '<span class="shard" style="' +
                    "left:" + one.x + "%;" +
                    "top:" + one.y + "%;" +
                    "width:" + one.size + "vmin;" +
                    "height:" + one.size + "vmin;" +
                    "opacity:" + one.fade + ";" +
                    "--spin:" + one.spin + "deg;" +
                    "--drift:" + (26 + i * 7) + "s;" +
                    "--wait:-" + (i * 5) + "s;" +
                    '">' + Game.Icons.svg(one.art) + "</span>";
            }).join("");
        }
    };
})();
