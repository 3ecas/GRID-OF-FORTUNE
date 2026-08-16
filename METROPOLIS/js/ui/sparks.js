window.Game = window.Game || {};

/**
 * sparks.js — the little burst of leaves thrown out when something joins up.
 *
 * Each leaf gets its own angle, distance, spin and green, so no two bursts
 * look alike. They arc up and fall back, which reads as a pop rather than a
 * spray.
 */
(function () {
    var host = null;

    var GREENS = [
        ["#9ec78c", "#7ba668"],
        ["#b3d3a0", "#8fb87c"],
        ["#88b877", "#6b9a5b"],
        ["#c6d9a8", "#a3bd82"]
    ];

    var LIFE_MS = 780;

    function ensureHost() {
        if (host) return host;
        host = document.createElement("div");
        host.className = "sparks";
        document.body.appendChild(host);
        return host;
    }

    Game.Sparks = {
        /** Throws `count` leaves out from a point on the screen. */
        burst: function (x, y, count) {
            var where = ensureHost();
            var total = count || 9;

            for (var i = 0; i < total; i++) {
                // spread them round a circle, with a wobble so it is not a wheel
                var angle =
                    (i / total) * Math.PI * 2 + (Math.random() - 0.5) * 0.7;
                var reach = 34 + Math.random() * 46;
                var green = GREENS[Math.floor(Math.random() * GREENS.length)];

                var leaf = document.createElement("span");
                leaf.className = "spark";
                leaf.style.left = x + "px";
                leaf.style.top = y + "px";
                leaf.style.setProperty("--dx", Math.cos(angle) * reach + "px");
                leaf.style.setProperty(
                    "--dy",
                    Math.sin(angle) * reach - 26 + "px"
                );
                leaf.style.setProperty(
                    "--spin",
                    Math.round((Math.random() - 0.5) * 400) + "deg"
                );
                leaf.style.setProperty("--size", 11 + Math.random() * 9 + "px");
                leaf.style.setProperty("--delay", Math.random() * 60 + "ms");
                leaf.style.setProperty("--i-leaf", green[0]);
                leaf.style.setProperty("--i-leaf-deep", green[1]);
                leaf.innerHTML = Game.Icons.svg("leaf");

                where.appendChild(leaf);
                Game.Toast.autoRemove(leaf, LIFE_MS + 200);
            }
        }
    };
})();
