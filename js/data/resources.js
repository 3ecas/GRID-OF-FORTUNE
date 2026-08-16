window.Game = window.Game || {};

/**
 * resources.js — six things the village counts, in three layers.
 *
 *   raw         gathered from the ground, by hand or by a gatherer
 *   refined     made by a building out of raw goods
 *   prosperity  what the city itself produces
 *
 *   wild    can appear on open ground (and how often, relative to the others)
 *   capped  counts against storage
 */
(function () {
    var list = [
        {
            id: "wood",
            name: "Wood",
            icon: "tree",
            tint: "tint-wood",
            layer: "raw",
            wild: 40,
            capped: true,
            yield: 1,
            blurb: "Timber from the trees along the treeline."
        },
        {
            id: "stone",
            name: "Stone",
            icon: "stone",
            tint: "tint-stone",
            layer: "raw",
            wild: 25,
            capped: true,
            yield: 1,
            blurb: "Loose rock pushed up through the soil."
        },
        {
            id: "food",
            name: "Food",
            icon: "berry",
            tint: "tint-food",
            layer: "raw",
            wild: 35,
            capped: true,
            yield: 1,
            blurb: "Sweet berries from the hedges between the plots."
        },
        {
            id: "plank",
            name: "Planks",
            icon: "plank",
            tint: "tint-plank",
            layer: "refined",
            wild: 0,
            capped: true,
            yield: 1,
            blurb: "Cut and stacked at the sawmill."
        },
        {
            id: "brick",
            name: "Bricks",
            icon: "brick",
            tint: "tint-brick",
            layer: "refined",
            wild: 0,
            capped: true,
            yield: 1,
            blurb: "Fired in the kiln, still warm."
        },
        {
            id: "coin",
            name: "Coin",
            icon: "coin",
            tint: "tint-coin",
            layer: "prosperity",
            wild: 0,
            capped: false,
            yield: 1,
            blurb: "What a contented town produces on its own."
        }
    ];

    var index = {};
    list.forEach(function (resource) {
        index[resource.id] = resource;
    });

    var wildList = list.filter(function (resource) {
        return resource.wild > 0;
    });

    function pickWeighted(items, weightOf) {
        var total = items.reduce(function (sum, item) {
            return sum + weightOf(item);
        }, 0);
        var roll = Math.random() * total;
        for (var i = 0; i < items.length; i++) {
            roll -= weightOf(items[i]);
            if (roll <= 0) return items[i];
        }
        return items[items.length - 1];
    }

    Game.Resources = {
        list: list,
        wild: wildList,

        ids: function () {
            return list.map(function (resource) {
                return resource.id;
            });
        },

        byId: function (id) {
            return index[id] || null;
        },

        ofLayer: function (layer) {
            return list.filter(function (resource) {
                return resource.layer === layer;
            });
        },

        /**
         * What sprouts on a plot. Most of the time the ground decides;
         * the rest of the time anything can turn up.
         */
        randomFor: function (terrainId) {
            var favoured = Game.TerrainTypes.resourceOf(terrainId);
            if (favoured && Math.random() < Game.Config.spawner.terrainBias) {
                return index[favoured];
            }
            return pickWeighted(wildList, function (resource) {
                return resource.wild;
            });
        }
    };
})();
