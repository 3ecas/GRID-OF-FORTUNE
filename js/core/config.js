window.Game = window.Game || {};

Game.Config = {
    game: {
        saveKey: "gridoffortune.save",

        cols: 6,
        rows: 6,
        seedPieces: 8,
        handSize: 2,

        mergeAt: 3,

        dealBehind: 2,

        falls: [
            { after: 0, count: 1, every: 12 },
            { after: 150, count: 1, every: 9 },
            { after: 320, count: 1, every: 7 },
            { after: 500, count: 2, every: 9 },
            { after: 700, count: 2, every: 7 },
            { after: 900, count: 2, every: 5 },
            { after: 1100, count: 3, every: 6 },
            { after: 1300, count: 3, every: 4 },
            { after: 1500, count: 3, every: 3 },
            { after: 1700, count: 4, every: 3 },
            { after: 1900, count: 4, every: 2 },
            { after: 2100, count: 6, every: 2 },
            { after: 2300, count: 9, every: 1 },
            { after: 2500, count: 14, every: 1 }
        ],

        clearColumns: false,
        clearRows: false,
        clearBonus: 3,

        cashTop: true,
        cashBonus: 2,
        cashLeaves: true,

        chainStep: 1,
        chainMost: 5,

        rubbleFrom: 8,
        rubbleRise: 0.05,
        rubbleMost: 0.45,
        rubbleCap: 1,
        rubbleBreaks: true
    }
};
