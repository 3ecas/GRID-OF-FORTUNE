window.Game = window.Game || {};

/**
 * terrain.js — the ground itself.
 *
 * Terrain decides two things: what tends to grow wild on a plot, and which
 * gatherer works fast when built there. It never blocks a build.
 */
(function () {
    var list = [
        {
            id: "meadow",
            name: "Meadow",
            resource: "food", // what it favours
            weight: 38 // share of the map
        },
        {
            id: "forest",
            name: "Forest",
            resource: "wood",
            weight: 38
        },
        {
            id: "rock",
            name: "Rocky",
            resource: "stone",
            weight: 24
        }
    ];

    var index = {};
    list.forEach(function (terrain) {
        index[terrain.id] = terrain;
    });

    var totalWeight = list.reduce(function (sum, terrain) {
        return sum + terrain.weight;
    }, 0);

    Game.TerrainTypes = {
        list: list,

        byId: function (id) {
            return index[id] || null;
        },

        random: function () {
            var roll = Math.random() * totalWeight;
            for (var i = 0; i < list.length; i++) {
                roll -= list[i].weight;
                if (roll <= 0) return list[i];
            }
            return list[0];
        },

        /** The resource a terrain favours, e.g. forest -> wood. */
        resourceOf: function (id) {
            var terrain = index[id];
            return terrain ? terrain.resource : null;
        }
    };
})();
