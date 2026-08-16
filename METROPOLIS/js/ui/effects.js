window.Game = window.Game || {};

/**
 * effects.js — how the board reacts to what happens on it.
 *
 * Sparks throws the leaves; this is everything else. The idea is escalation:
 * a grove is a tap, a metropolis is an event, and the fifth merge in one
 * chain hits harder than the first. Weight and payoff, scaled — so the board
 * always tells you how big a thing you just did.
 */
(function () {
    var flashHost = null;
    var comboHost = null;

    function restart(element, className) {
        element.classList.remove(className);
        void element.offsetWidth;
        element.classList.add(className);
    }

    function layer(className) {
        var node = document.createElement("div");
        node.className = className;
        document.body.appendChild(node);
        return node;
    }

    Game.Effects = {
        /** A piece coming to rest: it squashes, and the ground nudges. */
        land: function (tile, neighbours) {
            if (!tile) return;
            restart(tile, "is-landed");
            this.shove(neighbours, 3);
        },

        /** Neighbouring squares get pushed away from whatever just happened. */
        shove: function (neighbours, force) {
            neighbours.forEach(function (near) {
                if (!near.tile) return;
                near.tile.style.setProperty("--jx", near.dx * force + "px");
                near.tile.style.setProperty("--jy", near.dy * force + "px");
                restart(near.tile, "is-jolt");
            });
        },

        /**
         * A merge. `tier` is how far up the ladder it is, `chain` is how many
         * merges deep into this one drop we are — both make it bigger.
         */
        burst: function (tile, neighbours, tier, chain) {
            if (!tile) return;

            var weight = tier + chain * 1.5;

            var ring = document.createElement("span");
            ring.className = "tile__ring";
            ring.style.setProperty("--reach", 1.4 + weight * 0.14);
            tile.appendChild(ring);
            Game.Toast.autoRemove(ring, 720);

            this.shove(neighbours, 3 + Math.min(weight, 12));
        },

        /** The whole board flinches when something big lands on it. */
        shake: function (board, tier, chain) {
            var weight = tier + chain * 1.5;
            if (!board || weight < 6) return;
            board.style.setProperty("--shake", Math.min(weight - 4, 9) * 1.2 + "px");
            restart(board, "is-shaken");
        },

        /** A wash of warm light over everything, for the really big ones. */
        flash: function (tier) {
            if (tier < 7) return;
            if (!flashHost) flashHost = layer("flash");
            flashHost.style.setProperty("--glow", (tier - 6) * 0.07 + 0.08);
            restart(flashHost, "is-lit");
        },

        /** The running count when one drop keeps setting off more merges. */
        combo: function (count) {
            if (count < 2) return;
            if (!comboHost) comboHost = layer("combo");
            comboHost.textContent = "×" + count;
            comboHost.style.setProperty("--grow", 1 + Math.min(count, 8) * 0.11);
            restart(comboHost, "is-up");
        },

        /** Something made for the very first time gets a longer glow. */
        discover: function (tile) {
            if (!tile) return;
            restart(tile, "is-new");
        }
    };
})();
