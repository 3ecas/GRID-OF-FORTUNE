window.Game = window.Game || {};

Game.Config = {
    game: {
        saveKey: "gridoffortune.save",

        cols: 6,
        rows: 6,
        seedPieces: 6,
        handSize: 1,

        /* The board opens empty and holds for this long before the starting
           pieces fall in, so a new game arrives rather than just appearing. */
        introPause: 500,

        mergeAt: 3,

        dealBehind: 2,

        /* Anything left standing on a rung that has stopped being dealt used
           to grow up to the bottom of the new window, so nothing was ever
           stranded. It is off: a piece you cannot get a third of again is a
           mistake you made, and digging it out is the skill. */
        growStranded: false,

        /* How many of the same piece the hand will deal in a row before it
           has to offer something else. */
        sameInRow: 2,

        /* A run of G joins into G - (mergeAt - 1) pieces one rung up: 3 makes
           1, 4 makes 2, 5 makes 3, and nothing is thrown away. Before this a
           run of six gave back exactly what a run of three did, so building
           anything bigger than the minimum was a straight loss.

           Every merge now frees exactly two squares whatever its size, which
           takes the board-clearing job away from big runs and hands them the
           climbing one instead. Five is the moment it pays: three of the next
           rung come back touching and go again on their own.

           Measured over fifteen bot runs: runs about a third shorter, and a
           median run reaches diamond rather than topaz. */
        surplusStays: true,

        /* Whether a run that gives back several pieces pays for all of them
           or just for one. Paying for all multiplies a good run by about ten;
           paying for one leaves it at about three and a half, which keeps the
           vault something you earn. */
        surplusPays: false,

        /* The most pieces a run can give back, however long it is. At 2 a run
           of five hands back two instead of three, and two of a kind do not
           join — so the cascade a five sets off never happens. 0 for no cap. */
        surplusMost: 0,

        /* The schedule ends where games end. The four steps that used to sit
           above this — 6, 7, 9 and 12 pieces every drop — could never fire:
           reaching them meant surviving pressure whose whole job is to stop
           you, so tightening the schedule only ever brought the same last
           step forward. They were numbers in a file, not difficulty.

           Brought forward by about a third as well, so the last step is one
           a run actually meets rather than one it dies just short of.

           It opens at two every five rather than one every eight. How full
           the board sits is not something falls control — it settles near
           40% whatever the schedule — but how often it looks *empty* is, and
           the gentle opening was where that showed. Starting here cuts the
           time the board is nearly bare from a fifth of the run to a sixth,
           and costs about forty drops. */
        falls: [
            { after: 0, count: 2, every: 5 },
            { after: 110, count: 3, every: 5 },
            { after: 150, count: 3, every: 4 },
            { after: 200, count: 3, every: 3 },
            { after: 250, count: 4, every: 3 },
            { after: 310, count: 4, every: 2 },
            { after: 370, count: 5, every: 2 },
            { after: 430, count: 5, every: 1 }
        ],

        clearColumns: false,
        clearRows: false,
        clearBonus: 3,

        cashTop: true,
        cashBonus: 2,
        cashLeaves: true,

        chainStep: 1,
        chainMost: 5,

        /* How hard the board shakes when something joins. 1 is what it was;
           players read the full-strength shake as the board itself moving and
           lost track of the pieces, so it is turned down. */
        shakeForce: 0.6,

        /* Dynamite: the one piece that gives a square back rather than taking
           one. A merge landing against it sets it off and everything in the
           eight squares around it goes, itself included — which is the only
           way to shift a piece you can no longer complete. It pays nothing,
           so clearing with it costs you whatever it takes out.

           It stays out of the opening entirely: nothing falls until the score
           says the board has had time to get into trouble. */
        /* What a blast pays, as a share of what it destroyed.

           Not the full value: the ladder climbs by half again a rung, but a
           blast takes three pieces to a merge's three, so paying in full
           would make blowing up a run worth twice merging it — destroying
           your best pieces would beat building with them. Half is exactly
           break-even; a third leaves merging clearly better while still
           handing something back for pieces you could no longer use. */
        blastPays: 0.35,

        /* How many drops a stick will sit before it goes off on its own.

           Without this it waits for a merge to land against it — and a stick
           that falls into a patch of pieces too old to merge waits forever,
           so the one thing that could clear that patch becomes part of it.
           The fuse is already lit in the art; this makes it mean something.
           0 for the old behaviour, where only a merge sets one off. */
        dynamiteFuse: 12,

        /* How much clear space a dynamite or lodestone wants from its own
           kind when it falls, measured in squares including diagonals. Two
           sticks side by side is one blast doing the work of two. */
        blastSpacing: 2,

        dynamiteFrom: 500,

        /* Was 0.12, which put sixty-odd sticks in a run — one every seven
           drops, so the board was never without one. At 0.07 it is about
           eighteen, one every twenty drops. Lower than this and runs start
           jamming: dynamite is most of what keeps a tight board playable. */
        dynamiteChance: 0.07,
        dynamiteCap: 1,

        /* Lodestone: rarer than dynamite and answers a different problem.
           Dynamite clears a place; a lodestone clears a kind, wherever it is,
           which is the only thing that shifts one piece stranded here and
           another stranded three columns over. Set off by a merge landing
           against it, then you choose what it draws out.

           It stops the game to ask a question, so it has to be rare or it
           stops being an event and becomes an interruption. At 0.06 a run
           threw up one every eighteen drops; this is one every hundred or so,
           about four in a run. */
        lodestoneFrom: 2500,
        lodestoneChance: 0.015,
        lodestoneCap: 1,

        rubbleFrom: 8,
        rubbleRise: 0.05,
        rubbleMost: 0.45,
        rubbleCap: 1,
        rubbleBreaks: true
    }
};
