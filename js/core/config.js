window.Game = window.Game || {};

Game.Config = {
    game: {
        saveKey: "gridoffortune.save",

        cols: 6,
        rows: 9,
        seedPieces: 6,
        handSize: 1,

        introPause: 500,

        // was 3. Two-of-a-kind makes each rung cost 2x the one below instead
        // of 3x, which is what puts the top of the ladder in reach at all.
        mergeAt: 3,

        // count the corners as touching too, not just the four sides
        mergeDiagonals: false,

        dealBehind: 1,   // was 2 — deal closer to your best piece

        growStranded: false,

        sameInRow: 2,

        surplusStays: true,

        surplusMost: 0,

        falls: [
            { after: 0, count: 2, every: 5 },
            { after: 110, count: 3, every: 5 },
            { after: 150, count: 3, every: 4 },
            { after: 200, count: 2, every: 2 },
            { after: 250, count: 4, every: 3 },
            { after: 310, count: 3, every: 2 },
            { after: 370, count: 2, every: 1 },
            { after: 430, count: 3, every: 1 }
        ],

        // Two knobs over the table above, both keeping its shape: fallFewer
        // takes pieces off every count, fallSlower puts plays between falls.
        fallFewer: 1,
        fallSlower: 1,

        fallRoom: 0.25,
        fallLeast: 1,

        fallEven: true,

        liveArt: true,      // read ICONS/EXPORT/ on every load
        liveArtWait: 1500,

        clearColumns: false,
        clearRows: false,
        clearBonus: 3,

        cashBonus: 2,
        cashLeaves: true,

        chainStep: 1,
        chainMost: 5,

        shakeForce: 0.6,

        blastPays: 1,

        dynamiteFuse: 12,

        blastSpacing: 2,

        dynamiteFrom: 1250,

        dynamiteChance: 0.07,
        dynamiteCap: 1,

        // The star is no longer dealt into the grid — it is charged on the
        // meter under the board and spent from there. js/systems/starmeter.js
        lodestoneFrom: 6250,
        lodestoneChance: 0,
        lodestoneCap: 1,

        // Roughly how many merges at your current level fill the meter. The
        // need scales with what a merge is worth, so a star costs the same
        // effort at dirt as it does at diamond — score just arrives faster.
        // starLeast is the floor, and it is what paces the opening, where a
        // merge is worth almost nothing.
        starPace: 24,
        starLeast: 900,

        // pieces out of the sky before a stick of dynamite is owed:
        // the bomb is paid for by being buried, not by scoring
        bombPace: 14,

        rubbleFrom: 8,
        rubbleRise: 0.05,
        rubbleMost: 0.45,
        rubbleCap: 1,
        rubbleBreaks: true
    }
};
