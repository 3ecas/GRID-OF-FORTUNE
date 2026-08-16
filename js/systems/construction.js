window.Game = window.Game || {};

/**
 * construction.js — choosing, placing and demolishing buildings.
 *
 * The rule that shapes the map: a plot with a building on it never sprouts
 * again. Demolishing hands the plot back, but the land needs
 * Config.cooldown.demolishMs to recover before anything grows there.
 */
(function () {
    function selection() {
        return Game.State.data.selection;
    }

    function announce() {
        Game.State.touch();
        Game.Events.emit("selection:changed", { selection: selection() });
    }

    function notice(text, tone) {
        Game.Events.emit("notice", { text: text, tone: tone || "info" });
    }

    Game.Construction = {
        selection: selection,

        selected: function () {
            return Game.Buildings.byId(selection().buildingId);
        },

        /** Is this building available at the village's current stage? */
        isUnlocked: function (building) {
            return !!building && building.stage <= Game.State.data.stage;
        },

        /** A unique building that already exists cannot be built again. */
        isSpent: function (building) {
            return !!(building.unique && Game.Grid.countOf(building.id) > 0);
        },

        canPlace: function (building) {
            if (!this.isUnlocked(building)) return false;
            if (this.isSpent(building)) return false;
            return Game.Inventory.canAfford(building.cost);
        },

        /** Pick a building to place. Selecting the same one again clears it. */
        select: function (buildingId) {
            var current = selection();
            if (current.mode === "build" && current.buildingId === buildingId) {
                return this.idle();
            }
            current.mode = "build";
            current.buildingId = buildingId;
            announce();
        },

        demolishMode: function (on) {
            var current = selection();
            current.mode = on ? "demolish" : "idle";
            if (on) current.buildingId = null;
            announce();
        },

        idle: function () {
            var current = selection();
            current.mode = "idle";
            current.buildingId = null;
            announce();
        },

        place: function (cellId, buildingId) {
            var cell = Game.Grid.byId(cellId);
            var building = Game.Buildings.byId(buildingId);
            if (!cell || !building) return false;

            if (cell.building) {
                notice("Something is already built here.", "warn");
                return false;
            }
            if (cell.resource) {
                notice("Gather what is growing here first.", "warn");
                return false;
            }
            if (!this.isUnlocked(building)) {
                notice(building.name + " is not available yet.", "warn");
                return false;
            }
            if (this.isSpent(building)) {
                notice("There can only be one " + building.name + ".", "warn");
                return false;
            }
            if (!Game.Inventory.spend(building.cost)) {
                notice("Not enough for a " + building.name + ".", "warn");
                return false;
            }

            cell.building = building.id;
            cell.stock = 0;
            cell.progress = 0;
            Game.Grid.clearRest(cell);
            Game.State.data.stats.built += 1;
            Game.Comfort.recompute();
            Game.State.touch();

            Game.Events.emit("cell:changed", { cell: cell });
            Game.Events.emit("building:placed", {
                cell: cell,
                buildingId: building.id
            });
            notice(building.name + " built.", "good");
            return true;
        },

        demolish: function (cellId, now) {
            now = now || Game.Clock.now();

            var cell = Game.Grid.byId(cellId);
            if (!cell || !cell.building) return false;

            var building = Game.Buildings.byId(cell.building);

            // anything still waiting outside is handed in, not thrown away
            if (cell.stock > 0) Game.Harvest.collect(cell.id);

            cell.building = null;
            cell.stock = 0;
            cell.progress = 0;
            cell.comfort = 0;
            Game.Grid.rest(cell, Game.Config.cooldown.demolishMs, "demolish", now);
            Game.State.data.stats.demolished += 1;
            Game.Comfort.recompute();
            Game.State.touch();

            Game.Events.emit("cell:changed", { cell: cell });
            Game.Events.emit("building:demolished", {
                cell: cell,
                buildingId: building ? building.id : null
            });
            notice(
                (building ? building.name : "Building") + " removed.",
                "info"
            );
            return true;
        }
    };
})();
