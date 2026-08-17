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

        /* How many touching alike it takes to join. Fewer than this and
           nothing happens; this many or more and the whole connected run
           joins at once, however long it has grown. */
        mergeAt: 3,

        /* How far the hand trails the best thing you have made, and the
           single biggest thing controlling how long a game runs. On the
           nineteen-rung ladder a bot that never jams goes about 440 drops at
           2 and about 765 at 3 — a person will jam long before either. */
        dealBehind: 2,

        /* Every so often the seam gives way and pieces fall in on their own,
           into columns you did not pick. They come from the rungs already in
           your hand, so they are never unmergeable — what they cost you is
           the choice of where.

           This is a table of levels, not a ramp, and it is read off the best
           rung you have MADE rather than the number of drops you have taken.
           Two reasons. On the clock it tightened whether or not you were
           getting anywhere, so a slow game — the one already going badly —
           got squeezed for being slow. And a ramp cannot be read: three
           interacting dials had to be simulated to find out what the game
           actually did at drop 120. This you can just look at.

           Below the first entry nothing falls at all, so the opening is
           yours alone: no pressure until you have minted a coin.

           Each step is a real moment in the run, announced when it lands.

           `at` names a rung, so reordering the ladder cannot silently
           rewrite the difficulty. */
        falls: [
            { at: "copper", count: 1, every: 7 },
            { at: "gold", count: 2, every: 6 },
            { at: "amethyst", count: 3, every: 4 },
            { at: "diamond", count: 3, every: 3 }
        ],

        /* Filling a line does nothing. Stacking to the ceiling is not an
           achievement, it is the mistake the game is about avoiding — paying
           it out and handing the space back turned the board into a valve
           that opened whenever it got tight, and a run stopped being able to
           end. A column with no merge left in it just stands there. */
        clearColumns: false,
        clearRows: false,
        clearBonus: 3,

        /* The top rung is carried off the moment it is made, paid at this
           much of its worth. */
        cashTop: true,
        cashBonus: 2,

        /* A drop that keeps knocking things over pays more with every join
           it sets off — second join double, third triple, and so on. Capped,
           because a long cascade already pays plenty by being long, and
           without a ceiling one lucky drop dwarfs a whole careful game. */
        chainStep: 1,
        chainMost: 5,

        /* Rubble: the only thing that cannot join anything.

           It thickens with how far UP you have got, not with how long you
           have been playing. Tying it to the clock punished you for a slow
           game you were already losing, and it kept climbing whether or not
           you were getting anywhere — reach the good stones and the seam
           turns bad, sit at the bottom and it stays clean.

           rubbleCap is what keeps it from arriving in a heap: without it a
           four-piece fall can be four rubble, which is not difficulty, it is
           just a turn taken away from you.

           It comes off the board only by being beside a join when one
           happens, which keeps it a nuisance rather than a death sentence —
           clearable, but only by playing into the mess, not away from it. */
        rubbleFrom: 8, // the rung the seam starts to give at — the gold coin
        rubbleRise: 0.05, // ... and how much likelier with every rung above
        rubbleMost: 0.45, // never more likely than this
        rubbleCap: 1, // at most this many in any one fall
        rubbleBreaks: true // a join alongside it knocks it out
    }
};
