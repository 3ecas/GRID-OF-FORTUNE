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

   The middle of the screen is left alone, and it is kept very faint: the board
   is not a white card any more, so nothing covers this up — anything stronger
   than a whisper tints the whole game.
   ============================================================================= */

(function () {
    /* pieces with a silhouette worth reading at size, and where each one sits:
       x and y as percentages, kept clear of the middle band */
    var CAST = [
        { art: "diamond",  x: -10, y: 4,   size: 44, spin: -14, fade: 0.045 },
        { art: "lodestone", x: 80, y: -8,  size: 48, spin: 12,  fade: 0.04 },
        { art: "amethyst", x: -14, y: 46,  size: 38, spin: 16,  fade: 0.035 },
        { art: "crown",    x: 62,  y: 84,  size: 42, spin: -10, fade: 0.04 },
        { art: "zinc",     x: 84,  y: 40,  size: 32, spin: -8,  fade: 0.035 }
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
