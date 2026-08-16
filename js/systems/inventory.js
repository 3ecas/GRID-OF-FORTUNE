window.Game = window.Game || {};

/**
 * inventory.js — the village store. Every change goes through here so the
 * HUD only ever has one event to listen for.
 *
 * Adding respects the storage cap and reports how much actually fit, so
 * callers can leave the remainder where it was instead of destroying it.
 */
(function () {
    function stock() {
        return Game.State.data.inventory;
    }

    function announce(resourceId, delta) {
        Game.State.touch();
        Game.Events.emit("inventory:changed", {
            inventory: stock(),
            resourceId: resourceId,
            delta: delta
        });
    }

    Game.Inventory = {
        all: function () {
            return stock();
        },

        get: function (resourceId) {
            return stock()[resourceId] || 0;
        },

        /** Adds what fits and returns the amount actually stored. */
        add: function (resourceId, amount) {
            var room = Game.Capacity.room(resourceId);
            var stored = Math.min(amount, room);
            if (stored <= 0) return 0;

            var inventory = stock();
            inventory[resourceId] = (inventory[resourceId] || 0) + stored;
            announce(resourceId, stored);
            return stored;
        },

        canAfford: function (cost) {
            var inventory = stock();
            return Object.keys(cost).every(function (resourceId) {
                return (inventory[resourceId] || 0) >= cost[resourceId];
            });
        },

        /** Which resources are short, and by how much. */
        missing: function (cost) {
            var inventory = stock();
            var short = {};
            Object.keys(cost).forEach(function (resourceId) {
                var lack = cost[resourceId] - (inventory[resourceId] || 0);
                if (lack > 0) short[resourceId] = lack;
            });
            return short;
        },

        spend: function (cost) {
            if (!this.canAfford(cost)) return false;
            var inventory = stock();
            Object.keys(cost).forEach(function (resourceId) {
                inventory[resourceId] -= cost[resourceId];
            });
            announce(null, 0);
            return true;
        },

        /** How many times over the village could pay this cost. */
        timesAffordable: function (cost) {
            var inventory = stock();
            var ids = Object.keys(cost);
            if (!ids.length) return Infinity;

            return ids.reduce(function (least, resourceId) {
                var have = inventory[resourceId] || 0;
                return Math.min(least, Math.floor(have / cost[resourceId]));
            }, Infinity);
        }
    };
})();
