window.Game = window.Game || {};

/**
 * grid.js — questions about plots. No DOM, no timers, just the model.
 */
(function () {
    var AROUND = [
        [-1, -1], [0, -1], [1, -1],
        [-1, 0], [1, 0],
        [-1, 1], [0, 1], [1, 1]
    ];

    function grid() {
        return Game.State.data.grid;
    }

    Game.Grid = {
        size: function () {
            return { cols: grid().cols, rows: grid().rows };
        },

        cells: function () {
            return grid().cells;
        },

        byId: function (id) {
            return grid().cells[id] || null;
        },

        at: function (x, y) {
            var g = grid();
            if (x < 0 || y < 0 || x >= g.cols || y >= g.rows) return null;
            return g.cells[y * g.cols + x];
        },

        /** The eight plots touching this one. */
        around: function (cell) {
            var self = this;
            var found = [];
            AROUND.forEach(function (step) {
                var neighbour = self.at(cell.x + step[0], cell.y + step[1]);
                if (neighbour) found.push(neighbour);
            });
            return found;
        },

        isResting: function (cell, now) {
            return !!cell.cooldown && now < cell.cooldown.until;
        },

        /** Can a resource appear here right now? */
        canSprout: function (cell, now) {
            if (cell.building) return false;
            if (cell.resource) return false;
            return !this.isResting(cell, now);
        },

        /** Can a building go here? Resting land is fine to build on. */
        canBuild: function (cell) {
            return !cell.building && !cell.resource;
        },

        sproutable: function (now) {
            var self = this;
            return grid().cells.filter(function (cell) {
                return self.canSprout(cell, now);
            });
        },

        /** Every plot carrying a building, optionally of one kind. */
        built: function (kind) {
            return grid().cells.filter(function (cell) {
                if (!cell.building) return false;
                if (!kind) return true;
                var building = Game.Buildings.byId(cell.building);
                return !!building && building.kind === kind;
            });
        },

        countOf: function (buildingId) {
            return grid().cells.filter(function (cell) {
                return cell.building === buildingId;
            }).length;
        },

        countResources: function () {
            return grid().cells.filter(function (cell) {
                return !!cell.resource;
            }).length;
        },

        countBuildings: function () {
            return this.built().length;
        },

        /** Starts the rest timer that keeps a plot bare for a while. */
        rest: function (cell, durationMs, reason, now) {
            cell.cooldown = {
                from: now,
                until: now + durationMs,
                reason: reason
            };
        },

        clearRest: function (cell) {
            cell.cooldown = null;
        }
    };
})();
