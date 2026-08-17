window.Game = window.Game || {};

(function () {
    var host = null;

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

    var LIFE_MS = 640;

    function ensureHost() {
        if (host) return host;
        host = document.createElement("div");
        host.className = "sparks";
        document.body.appendChild(host);
        return host;
    }

    function shard(x, y, angle, reach, piece) {
        var spark = document.createElement("span");
        spark.className = "spark";

        if (piece) {
            spark.className += " spark--piece " + piece.tint;
            spark.innerHTML = Game.Icons.svg(piece.icon);
            spark.style.setProperty("--size", 16 + Math.random() * 16 + "px");
        } else {
            spark.innerHTML = Game.Icons.svg("sparkle");
            spark.style.setProperty("--size", 9 + Math.random() * 9 + "px");
            spark.style.setProperty(
                "--i-gold-light",
                GLINTS[Math.floor(Math.random() * GLINTS.length)]
            );
        }

        spark.style.left = x + "px";
        spark.style.top = y + "px";
        spark.style.setProperty("--dx", Math.cos(angle) * reach + "px");
        spark.style.setProperty("--dy", Math.sin(angle) * reach - 30 + "px");
        spark.style.setProperty(
            "--spin",
            Math.round((Math.random() - 0.5) * 620) + "deg"
        );
        spark.style.setProperty("--delay", Math.random() * 44 + "ms");

        ensureHost().appendChild(spark);
        Game.Toast.autoRemove(spark, LIFE_MS + 260);
    }

    Game.Sparks = {
        burst: function (x, y, count, piece) {
            var total = count || 9;

            for (var i = 0; i < total; i++) {
                var angle =
                    (i / total) * Math.PI * 2 + (Math.random() - 0.5) * 0.8;
                shard(x, y, angle, 40 + Math.random() * 58, null);
            }

            if (!piece) return;

            var chunks = Math.max(4, Math.min(9, 3 + Math.round(total / 3)));
            for (var j = 0; j < chunks; j++) {
                var lean =
                    (j / chunks) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
                shard(x, y, lean, 54 + Math.random() * 70, piece);
            }
        },

        ring: function (x, y, tier) {
            var wave = document.createElement("span");
            wave.className = "shock";
            wave.style.left = x + "px";
            wave.style.top = y + "px";
            wave.style.setProperty("--reach", 90 + Math.min(tier, 12) * 16 + "px");
            ensureHost().appendChild(wave);
            Game.Toast.autoRemove(wave, 620);
        }
    };
})();
