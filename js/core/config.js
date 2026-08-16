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

           Both dials move against you: the gap closes and the fall gets
           heavier, until near the end four pieces come down after every
           single drop and your own move is one placement in five.

           More pieces makes a run shorter without making it meaner. Measured
           at nine tenths perfect play, going from two to four cut a run from
           230 drops to 146 while the score held or climbed — four pieces a
           turn is four more chances to merge, so the ladder is climbed
           faster even though there is less time to climb it. */
        wildFrom: 6, // drops between falls at the start
        wildTo: 1, // ... and once it has tightened all the way
        wildRamp: 30, // one step worse every this many placements
        wildCount: 2, // pieces each fall at the start
        wildMost: 4, // ... and once the seam has fully given way

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

        /* Rubble: the only thing that cannot join anything. The seam gets
           dirtier the longer you work it.

           It comes off the board only by being next to a join when one
           happens, which is what keeps it a nuisance rather than a slow
           death sentence — the mess is clearable, but only by playing into
           it rather than away from it. */
        rubbleAfter: 90, // clean falls until this many drops
        rubbleRamp: 260, // then the chance climbs over this many more
        rubbleMost: 0.75, // never quite all of it
        rubbleBreaks: true // a join alongside it knocks it out
    }
};
