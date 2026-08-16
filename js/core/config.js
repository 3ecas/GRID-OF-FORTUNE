window.Game = window.Game || {};

/**
 * config.js — every tunable number lives here.
 * Balance changes should never require touching a system file.
 */
Game.Config = {
    game: {
        saveKey: "gridoffortune.save",

        cols: 6,
        rows: 6,
        seedPieces: 8, // pieces already down at the start
        handSize: 2, // either of them is yours to play

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
    }
};
