window.Game = window.Game || {};

/**
 * sparks.js — the little burst thrown out when something joins up.
 *
 * Each spark gets its own angle, distance, spin and colour, so no two bursts
 * look alike. They arc up and fall back, which reads as a pop rather than a
 * spray.
 */
(function () {
    var host = null;

    /* struck metal and stone dust */
    var GLINTS = [
        "#f3d894",
        "#e9bd93",
        "#dee4ea",
        "#dfb45f",
        "#d8e8f0",
        "#b39ad6",
        "#8fb5df",
        "#86c3a0"
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
                var glint = GLINTS[Math.floor(Math.random() * GLINTS.length)];

                var spark = document.createElement("span");
                spark.className = "spark";
                spark.style.left = x + "px";
                spark.style.top = y + "px";
                spark.style.setProperty("--dx", Math.cos(angle) * reach + "px");
                spark.style.setProperty(
                    "--dy",
                    Math.sin(angle) * reach - 26 + "px"
                );
                spark.style.setProperty(
                    "--spin",
                    Math.round((Math.random() - 0.5) * 400) + "deg"
                );
                spark.style.setProperty("--size", 10 + Math.random() * 10 + "px");
                spark.style.setProperty("--delay", Math.random() * 60 + "ms");
                spark.style.setProperty("--i-gold-light", glint);
                spark.innerHTML = Game.Icons.svg("sparkle");

                where.appendChild(spark);
                Game.Toast.autoRemove(spark, LIFE_MS + 200);
            }
        }
    };
})();
