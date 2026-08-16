window.Game = window.Game || {};

/**
 * buildings.js — twelve buildings, four jobs. Everything a building does is
 * described here; the systems just read it.
 *
 *   kind: "gatherer"  fills itself from the ground it stands on
 *         "refiner"   turns stored raw goods into refined ones
 *         "home"      makes coin, scaled by how comfortable it is
 *         "civic"     changes the rules around it
 *
 *   every: seconds between one unit of output
 *   holds: how much it keeps before it stops and waits for you
 *   consumes: taken from the village store each time it makes a unit
 *   comfort: what it does to homes on the eight plots around it
 */
(function () {
    var list = [
        /* --- gatherers ------------------------------------------------- */
        {
            id: "lumber_camp",
            name: "Lumber Camp",
            icon: "lumber_camp",
            kind: "gatherer",
            stage: 0,
            cost: { wood: 12 },
            produces: "wood",
            terrain: "forest",
            every: 12,
            holds: 20,
            comfort: -2,
            blurb: "Cuts timber. Twice as quick standing in forest."
        },
        {
            id: "quarry",
            name: "Quarry",
            icon: "quarry",
            kind: "gatherer",
            stage: 0,
            cost: { wood: 10, stone: 8 },
            produces: "stone",
            terrain: "rock",
            every: 12,
            holds: 20,
            comfort: -2,
            blurb: "Works the rock. Twice as quick on rocky ground."
        },
        {
            id: "forager",
            name: "Forager's Hut",
            icon: "forager",
            kind: "gatherer",
            stage: 0,
            cost: { wood: 10, food: 6 },
            produces: "food",
            terrain: "meadow",
            every: 12,
            holds: 20,
            comfort: -1,
            blurb: "Picks the hedges. Twice as quick out in meadow."
        },

        /* --- homes ------------------------------------------------------ */
        {
            id: "cottage",
            name: "Cottage",
            icon: "cottage",
            kind: "home",
            stage: 0,
            cost: { wood: 18, stone: 10, food: 6 },
            produces: "coin",
            every: 45,
            holds: 12,
            residents: 2,
            blurb: "A family, and the first coin the village ever sees."
        },
        {
            id: "townhouse",
            name: "Townhouse",
            icon: "townhouse",
            kind: "home",
            stage: 2,
            cost: { plank: 16, brick: 12 },
            produces: "coin",
            every: 45,
            amount: 3,
            holds: 24,
            residents: 5,
            blurb: "Three storeys of neighbours. Earns like it."
        },

        /* --- refiners --------------------------------------------------- */
        {
            id: "sawmill",
            name: "Sawmill",
            icon: "sawmill",
            kind: "refiner",
            stage: 1,
            cost: { wood: 30, stone: 18 },
            produces: "plank",
            consumes: { wood: 2 },
            every: 45,
            holds: 12,
            comfort: -2,
            blurb: "Two wood in, one plank out. Noisy neighbour."
        },
        {
            id: "kiln",
            name: "Kiln",
            icon: "kiln",
            kind: "refiner",
            stage: 1,
            cost: { wood: 24, stone: 26 },
            produces: "brick",
            consumes: { stone: 2, wood: 1 },
            every: 60,
            holds: 12,
            comfort: -3,
            blurb: "Fires bricks all day. Smoke and heat."
        },

        /* --- civic ------------------------------------------------------ */
        {
            id: "well",
            name: "Well",
            icon: "well",
            kind: "civic",
            stage: 0,
            cost: { stone: 14 },
            comfort: 2,
            blurb: "Clean water. Every home nearby is happier for it."
        },
        {
            id: "garden",
            name: "Garden",
            icon: "garden",
            kind: "civic",
            stage: 1,
            cost: { plank: 8, food: 10 },
            comfort: 3,
            blurb: "Produces nothing at all. Makes everything better."
        },
        {
            id: "market",
            name: "Market",
            icon: "market",
            kind: "civic",
            stage: 2,
            cost: { plank: 20, brick: 10, food: 20 },
            comfort: 3,
            sells: { food: 2 }, // food traded away each cycle...
            produces: "coin", // ... for coin
            every: 30,
            holds: 20,
            blurb: "Trades spare food for coin, and lifts the whole street."
        },
        {
            id: "storehouse",
            name: "Storehouse",
            icon: "storehouse",
            kind: "civic",
            stage: 2,
            cost: { plank: 14, brick: 8 },
            storage: 80,
            blurb: "Room for more of everything."
        },
        {
            id: "town_hall",
            name: "Town Hall",
            icon: "town_hall",
            kind: "civic",
            stage: 2,
            unique: true,
            cost: { plank: 40, brick: 30, coin: 400 },
            comfort: 4,
            collectAll: true,
            blurb: "One only. Rings the bell and the whole city hands in at once."
        }
    ];

    var index = {};
    list.forEach(function (building) {
        index[building.id] = building;
    });

    Game.Buildings = {
        list: list,

        byId: function (id) {
            return index[id] || null;
        },

        ofKind: function (kind) {
            return list.filter(function (building) {
                return building.kind === kind;
            });
        },

        /** Buildings the village is allowed to put down at this stage. */
        unlocked: function (stageIndex) {
            return list.filter(function (building) {
                return building.stage <= stageIndex;
            });
        }
    };
})();
