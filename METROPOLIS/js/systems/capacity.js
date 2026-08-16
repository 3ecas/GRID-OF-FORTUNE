window.Game = window.Game || {};

/**
 * capacity.js — how much the village can hold.
 *
 * Raw and refined goods are capped; coin never is. Storehouses raise the cap
 * for everything at once, which is what turns "build another storehouse" into
 * a real decision rather than a chore.
 */
(function () {
    Game.Capacity = {
        /** The ceiling for one resource, or Infinity if it has none. */
        of: function (resourceId) {
            var resource = Game.Resources.byId(resourceId);
            if (!resource || !resource.capped) return Infinity;

            var extra = 0;
            Game.Grid.built("civic").forEach(function (cell) {
                var building = Game.Buildings.byId(cell.building);
                if (building && building.storage) extra += building.storage;
            });

            return Game.Config.storage.base + extra;
        },

        /** How much more of this resource will fit. */
        room: function (resourceId) {
            var cap = this.of(resourceId);
            if (cap === Infinity) return Infinity;
            return Math.max(0, cap - Game.Inventory.get(resourceId));
        },

        isFull: function (resourceId) {
            return this.room(resourceId) <= 0;
        }
    };
})();
