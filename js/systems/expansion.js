window.Game = window.Game || {};

/**
 * expansion.js — growing the map.
 *
 * Each stage wraps a ring of fresh ground around what you have already built.
 * The old grid keeps everything, just re-centred, and the new ring arrives
 * empty with terrain that carries on from what it touches — which means wild
 * resources start appearing on the frontier. That is the trick that keeps the
 * early game alive: it does not end, it moves to the edge of the map.
 */
(function () {
    function stageIndex() {
        return Game.State.data.stage;
    }

    /** Terrain for a new plot, leaning on whatever is already around it. */
    function terrainFor(cells, size, x, y) {
        var neighbours = [];
        var steps = [[0, -1], [0, 1], [-1, 0], [1, 0]];

        steps.forEach(function (step) {
            var nx = x + step[0];
            var ny = y + step[1];
            if (nx < 0 || ny < 0 || nx >= size || ny >= size) return;
            var neighbour = cells[ny * size + nx];
            if (neighbour) neighbours.push(neighbour.terrain);
        });

        return Game.TerrainMap.grow(neighbours);
    }

    Game.Expansion = {
        current: function () {
            return Game.Stages.at(stageIndex());
        },

        next: function () {
            return Game.Stages.next(stageIndex());
        },

        canAfford: function () {
            var next = this.next();
            return !!next && Game.Inventory.canAfford(next.cost);
        },

        expand: function () {
            var next = this.next();
            if (!next) {
                Game.Events.emit("notice", {
                    text: "The valley is fully settled.",
                    tone: "info"
                });
                return false;
            }
            if (!Game.Inventory.spend(next.cost)) {
                Game.Events.emit("notice", {
                    text: "Not enough coin to expand yet.",
                    tone: "warn"
                });
                return false;
            }

            var old = Game.State.data.grid;
            var size = next.size;
            var offset = Math.floor((size - old.cols) / 2);
            var cells = new Array(size * size);

            // everything already built, re-centred on the bigger map
            old.cells.forEach(function (cell) {
                var x = cell.x + offset;
                var y = cell.y + offset;
                cell.id = y * size + x;
                cell.x = x;
                cell.y = y;
                cells[cell.id] = cell;
            });

            // then the new ring, filled in reading order so each plot can see
            // the ones already decided next to it
            for (var y = 0; y < size; y++) {
                for (var x = 0; x < size; x++) {
                    var id = y * size + x;
                    if (cells[id]) continue;
                    cells[id] = {
                        id: id,
                        x: x,
                        y: y,
                        terrain: terrainFor(cells, size, x, y),
                        resource: null,
                        building: null,
                        stock: 0,
                        progress: 0,
                        comfort: 0,
                        cooldown: null
                    };
                }
            }

            Game.State.data.stage = stageIndex() + 1;
            Game.State.replaceGrid(size, size, cells);
            Game.Comfort.recompute();
            Game.Spawner.seed(Game.Clock.now());
            Game.State.save();

            Game.Events.emit("stage:changed", { stage: Game.State.data.stage });
            Game.Events.emit("notice", {
                text: "The village is now a " + next.name + ".",
                tone: "good"
            });
            return true;
        }
    };
})();
