window.Game = window.Game || {};

/**
 * harvest.js — gathering by hand.
 *
 * Wild resources on open ground, and the piles of goods waiting outside a
 * building. Both are the same gesture: click the thing, take what is there.
 */
(function () {
    function record(resourceId, amount) {
        Game.State.data.stats.collected[resourceId] += amount;
        Game.State.touch();
    }

    function full(resource) {
        Game.Events.emit("notice", {
            text: "No room for more " + resource.name.toLowerCase() + ".",
            tone: "warn"
        });
    }

    Game.Harvest = {
        /** Takes the wild resource growing on a plot. */
        gather: function (cellId, now) {
            now = now || Game.Clock.now();

            var cell = Game.Grid.byId(cellId);
            if (!cell || !cell.resource) return null;

            var resource = Game.Resources.byId(cell.resource);
            if (!resource) return null;

            var stored = Game.Inventory.add(resource.id, resource.yield);
            if (stored <= 0) {
                full(resource);
                return null;
            }

            cell.resource = null;
            Game.Grid.rest(cell, Game.Config.cooldown.harvestMs, "harvest", now);
            record(resource.id, stored);

            Game.Events.emit("cell:changed", { cell: cell });
            Game.Events.emit("resource:collected", {
                cell: cell,
                resourceId: resource.id,
                amount: stored,
                source: "wild"
            });

            return { resource: resource, amount: stored };
        },

        /**
         * Takes the pile waiting outside a building. Anything that will not
         * fit in the store stays where it is rather than being thrown away.
         */
        collect: function (cellId) {
            var cell = Game.Grid.byId(cellId);
            if (!cell || !cell.building || cell.stock <= 0) return null;

            var building = Game.Buildings.byId(cell.building);
            var resource = Game.Resources.byId(building && building.produces);
            if (!resource) return null;

            var stored = Game.Inventory.add(resource.id, cell.stock);
            if (stored <= 0) {
                full(resource);
                return null;
            }

            cell.stock -= stored;
            record(resource.id, stored);

            Game.Events.emit("cell:changed", { cell: cell });
            Game.Events.emit("resource:collected", {
                cell: cell,
                resourceId: resource.id,
                amount: stored,
                source: "building"
            });

            return { resource: resource, amount: stored };
        },

        /** The Town Hall bell: every building hands in at once. */
        collectAll: function () {
            var self = this;
            var total = 0;

            Game.Grid.built().forEach(function (cell) {
                if (cell.stock <= 0) return;
                var taken = self.collect(cell.id);
                if (taken) total += taken.amount;
            });

            Game.Events.emit("notice", {
                text: total
                    ? "Collected " + total + " from across the city."
                    : "Nothing waiting to be collected.",
                tone: total ? "good" : "info"
            });

            return total;
        },

        /** Is there a Town Hall standing? */
        canCollectAll: function () {
            return Game.Grid.built("civic").some(function (cell) {
                var building = Game.Buildings.byId(cell.building);
                return !!(building && building.collectAll);
            });
        }
    };
})();
