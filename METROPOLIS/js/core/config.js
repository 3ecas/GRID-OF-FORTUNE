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
        /* How far the hand trails the best thing you have made, and the
           single biggest thing controlling how long a game runs. On the
           nineteen-rung ladder a bot that never jams goes about 440 drops at
           2 and about 765 at 3 — a person will jam long before either. */
        dealBehind: 2,

        /* Every so often the seam gives way and a few pieces fall in on their
           own, into columns you did not pick.
           They come from the rungs already in your hand, so they are never
           unmergeable — the difficulty is losing the choice of where, not
           what. Measured against a bot that weighs every column: no falls
           436 drops, two every eight 383, two every six 371, three every
           five 296. A person feels it more than that, because a person is
           not re-planning the whole board each turn. */
        wildEvery: 6, // drops between falls
        wildCount: 2 // pieces each time
    },

    tickMs: 250
};
