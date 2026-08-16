window.Game = window.Game || {};

/**
 * stages.js — how far the village has come, and how big the land is.
 *
 * Each stage widens the grid by a ring of fresh ground, which means fresh
 * wild resources on the frontier. The early game never really ends, it just
 * moves to the edge of the map.
 */
(function () {
    var list = [
        {
            id: "hamlet",
            name: "Hamlet",
            size: 5,
            cost: null,
            blurb: "A few plots of open ground."
        },
        {
            id: "village",
            name: "Village",
            size: 7,
            cost: { coin: 150 },
            blurb: "Room to work the land properly."
        },
        {
            id: "town",
            name: "Town",
            size: 9,
            cost: { coin: 800 },
            blurb: "Streets, trade, and neighbours worth having."
        },
        {
            id: "metropolis",
            name: "Metropolis",
            size: 11,
            cost: { coin: 2500 },
            blurb: "The whole valley, built."
        }
    ];

    Game.Stages = {
        list: list,

        at: function (index) {
            return list[Math.min(index, list.length - 1)];
        },

        next: function (index) {
            return list[index + 1] || null;
        },

        isLast: function (index) {
            return index >= list.length - 1;
        }
    };
})();
