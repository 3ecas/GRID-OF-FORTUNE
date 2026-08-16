window.Game = window.Game || {};

/**
 * state.js — the single source of truth, plus load/save plumbing.
 *
 * A cell (plot) looks like:
 *   {
 *     id: 0, x: 0, y: 0,
 *     terrain: "forest",
 *     resource: "wood" | null,     // growing wild, click to gather
 *     building: "lumber_camp" | null,
 *     stock: 0,                    // goods waiting outside the building
 *     progress: 0,                 // ms banked toward the next unit
 *     comfort: 0,                  // homes only, set by systems/comfort.js
 *     cooldown: { from, until, reason } | null
 *   }
 */
(function () {
    var dirty = false;
    var lastSaveAt = 0;

    function makeCell(id, x, y, terrain) {
        return {
            id: id,
            x: x,
            y: y,
            terrain: terrain,
            resource: null,
            building: null,
            stock: 0,
            progress: 0,
            comfort: 0,
            cooldown: null
        };
    }

    function makeCells(cols, rows) {
        var terrain = Game.TerrainMap.generate(cols, rows);
        var cells = [];
        for (var y = 0; y < rows; y++) {
            for (var x = 0; x < cols; x++) {
                cells.push(makeCell(cells.length, x, y, terrain[cells.length]));
            }
        }
        return cells;
    }

    function emptyCounters() {
        var counters = {};
        Game.Resources.ids().forEach(function (id) {
            counters[id] = 0;
        });
        return counters;
    }

    function createState(now) {
        var size = Game.Stages.at(0).size;

        return {
            version: Game.Config.save.version,
            createdAt: now,
            updatedAt: now,
            stage: 0,
            grid: { cols: size, rows: size, cells: makeCells(size, size) },
            inventory: emptyCounters(),
            stats: {
                collected: emptyCounters(),
                built: 0,
                demolished: 0
            },
            selection: { mode: "idle", buildingId: null },
            spawner: { nextSpawnAt: now, seeded: false },
            production: { lastAt: now }
        };
    }

    /** Guards against a save file from an older or broken build. */
    function isUsable(save) {
        if (!save || save.version !== Game.Config.save.version) return false;
        if (!save.grid || !Array.isArray(save.grid.cells)) return false;
        if (save.grid.cells.length !== save.grid.cols * save.grid.rows) {
            return false;
        }
        return !!save.inventory && !!save.stats && !!save.spawner;
    }

    /** Fills in anything a save is missing. */
    function normalise(save, now) {
        Game.Resources.ids().forEach(function (id) {
            if (typeof save.inventory[id] !== "number") save.inventory[id] = 0;
            if (typeof save.stats.collected[id] !== "number") {
                save.stats.collected[id] = 0;
            }
        });

        if (!save.selection) save.selection = { mode: "idle", buildingId: null };
        if (typeof save.stage !== "number") save.stage = 0;
        if (!save.production) save.production = { lastAt: now };
        if (typeof save.spawner.nextSpawnAt !== "number") {
            save.spawner.nextSpawnAt = now;
        }

        save.grid.cells.forEach(function (cell) {
            if (typeof cell.stock !== "number") cell.stock = 0;
            if (typeof cell.progress !== "number") cell.progress = 0;
            if (typeof cell.comfort !== "number") cell.comfort = 0;
            if (!cell.terrain) cell.terrain = "meadow";
        });

        return save;
    }

    Game.State = {
        data: null,

        init: function (now) {
            now = now || Date.now();
            var save = Game.Storage.read(Game.Config.save.key);
            this.data = isUsable(save) ? normalise(save, now) : createState(now);
            lastSaveAt = now;
            dirty = false;
            return this.data;
        },

        /** Marks the state as changed so the next autosave writes it out. */
        touch: function () {
            dirty = true;
        },

        save: function (now) {
            if (!this.data) return;
            this.data.updatedAt = now || Date.now();
            Game.Storage.write(Game.Config.save.key, this.data);
            lastSaveAt = this.data.updatedAt;
            dirty = false;
        },

        /** Called on every tick; writes at most once per autosave window. */
        autosave: function (now) {
            if (!dirty) return;
            if (now - lastSaveAt < Game.Config.save.autosaveMs) return;
            this.save(now);
        },

        /** Swaps in a freshly grown grid, keeping everything already built. */
        replaceGrid: function (cols, rows, cells) {
            this.data.grid = { cols: cols, rows: rows, cells: cells };
            this.touch();
            Game.Events.emit("grid:changed", {});
        },

        reset: function (now) {
            now = now || Date.now();
            Game.Storage.clear(Game.Config.save.key);
            this.data = createState(now);
            this.save(now);
            Game.Events.emit("grid:changed", {});
            Game.Events.emit("inventory:changed", {
                inventory: this.data.inventory
            });
            Game.Events.emit("selection:changed", {
                selection: this.data.selection
            });
            return this.data;
        }
    };
})();
