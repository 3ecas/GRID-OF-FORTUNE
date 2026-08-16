window.Game = window.Game || {};

/**
 * terrainmap.js — lays out the ground.
 *
 * Pure noise gives confetti, which is no fun to read and no fun to plan on.
 * So the map is rolled at random and then smoothed a couple of times: each
 * plot takes whatever its neighbours mostly are. That leaves woods, outcrops
 * and open meadow in patches you can actually aim a building at.
 */
(function () {
    function majority(values) {
        var tally = {};
        var best = values[0];
        var bestCount = 0;

        values.forEach(function (value) {
            tally[value] = (tally[value] || 0) + 1;
            if (tally[value] > bestCount) {
                bestCount = tally[value];
                best = value;
            }
        });

        return best;
    }

    function neighbourhood(map, cols, rows, x, y) {
        var values = [map[y * cols + x]];
        var steps = [[0, -1], [0, 1], [-1, 0], [1, 0]];

        steps.forEach(function (step) {
            var nx = x + step[0];
            var ny = y + step[1];
            if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) return;
            values.push(map[ny * cols + nx]);
        });

        return values;
    }

    function smooth(map, cols, rows) {
        var next = map.slice();
        for (var y = 0; y < rows; y++) {
            for (var x = 0; x < cols; x++) {
                next[y * cols + x] = majority(
                    neighbourhood(map, cols, rows, x, y)
                );
            }
        }
        return next;
    }

    function countOf(map, terrainId) {
        return map.filter(function (value) {
            return value === terrainId;
        }).length;
    }

    /**
     * Smoothing can round a terrain clean off a small map, which would leave
     * a player with, say, nowhere to put a lumber camp. So after smoothing,
     * any type that came out too thin gets a patch carved for it out of the
     * most common one.
     */
    function ensureVariety(map, cols, rows) {
        var floor = Math.max(2, Math.round(cols * rows * 0.1));

        Game.TerrainTypes.list.forEach(function (terrain) {
            var missing = floor - countOf(map, terrain.id);
            if (missing <= 0) return;

            var common = majority(map);
            var candidates = [];
            map.forEach(function (value, index) {
                if (value === common) candidates.push(index);
            });
            if (!candidates.length) return;

            // start somewhere in the common ground and spread outwards, so
            // the patch reads as one place rather than scattered dots
            var seed = candidates[Math.floor(Math.random() * candidates.length)];
            var queue = [seed];
            var seen = {};

            while (queue.length && missing > 0) {
                var index = queue.shift();
                if (seen[index]) continue;
                seen[index] = true;

                if (map[index] === common) {
                    map[index] = terrain.id;
                    missing--;
                }

                var x = index % cols;
                var y = Math.floor(index / cols);
                [[0, -1], [0, 1], [-1, 0], [1, 0]].forEach(function (step) {
                    var nx = x + step[0];
                    var ny = y + step[1];
                    if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) return;
                    queue.push(ny * cols + nx);
                });
            }
        });

        return map;
    }

    Game.TerrainMap = {
        /** A fresh map of terrain ids, one per plot, in row order. */
        generate: function (cols, rows) {
            var map = [];
            for (var i = 0; i < cols * rows; i++) {
                map.push(Game.TerrainTypes.random().id);
            }

            map = smooth(map, cols, rows);
            map = smooth(map, cols, rows);
            return ensureVariety(map, cols, rows);
        },

        /**
         * Ground for a plot on the new frontier. It leans towards whatever it
         * touches, so patches carry on past the old edge instead of stopping
         * dead at it.
         */
        grow: function (neighbourTerrains) {
            if (neighbourTerrains.length && Math.random() < 0.65) {
                return majority(neighbourTerrains);
            }
            return Game.TerrainTypes.random().id;
        }
    };
})();
