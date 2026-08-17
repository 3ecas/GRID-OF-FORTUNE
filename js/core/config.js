window.Game = window.Game || {};

Game.Config = {
    game: {
        saveKey: "gridoffortune.save",

        cols: 6,
        rows: 6,
        seedPieces: 8,
        handSize: 2,

        mergeAt: 2,

        dealBehind: 2,

        falls: [
            { after: 0, count: 1, every: 8 },
            { after: 50, count: 2, every: 7 },
            { after: 110, count: 2, every: 5 },
            { after: 180, count: 3, every: 5 },
            { after: 250, count: 3, every: 4 },
            { after: 330, count: 3, every: 3 },
            { after: 420, count: 4, every: 3 },
            { after: 520, count: 4, every: 2 },
            { after: 620, count: 5, every: 2 },
            { after: 720, count: 5, every: 1 },
            { after: 820, count: 6, every: 1 },
            { after: 920, count: 7, every: 1 },
            { after: 1020, count: 9, every: 1 },
            { after: 1120, count: 12, every: 1 }
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
