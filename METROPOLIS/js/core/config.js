window.Game = window.Game || {};

/**
 * config.js — every tunable number lives here.
 * Balance changes should never require touching a system file.
 */
Game.Config = {
    save: {
        key: "metropolis.save",
        version: 2,
        autosaveMs: 2000
    },

    grid: {
        cols: 5,
        rows: 5
    },

    /* Wild resources on open ground */
    spawner: {
        intervalMs: 3000, // one spawn attempt this often
        maxPlotRatio: 0.4, // never cover more than this share of open plots
        seedCount: 5, // nodes a brand new village starts with
        catchUpMs: 10 * 60 * 1000, // how much time away is simulated
        terrainBias: 0.7 // chance a node matches its terrain
    },

    /* How long a plot stays bare */
    cooldown: {
        harvestMs: 6000,
        demolishMs: 20000
    },

    /* Buildings that fill up on their own */
    production: {
        matchedBonus: 2, // gatherers work this much faster on their terrain
        catchUpMs: 12 * 60 * 60 * 1000 // absence simulated on return
    },

    /* What the village can hold */
    storage: {
        base: 60, // per raw and refined resource
        perStorehouse: 80
    },

    /* Comfort turns into coin: multiplier = 1 + comfort * step */
    comfort: {
        step: 0.1,
        min: 0.4,
        max: 2.5,
        neighbourHome: 1, // a home likes other homes
        maxHomeBonus: 3,
        industryPenalty: -2 // ... and dislikes industry next door
    },

    /* The merging game */
    game: {
        saveKey: "metropolis.game",
        cols: 6,
        rows: 6,
        seedPieces: 8, // ground already laid at the start
        handSize: 2, // either of them, plus whatever you have set aside
        /* How far the hand trails the best thing you have built, and the
           single biggest thing controlling how long a game runs: 2 finishes
           in about 80 drops, 3 in about 140, 4 in about 230. */
        dealBehind: 3
    },

    tickMs: 250
};
