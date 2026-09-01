window.Game = window.Game || {};

Game.Config = {
    game: {
        saveKey: "gridoffortune.save",

        cols: 6,
        rows: 6,
        seedPieces: 6,
        handSize: 1,

        introPause: 500,

        mergeAt: 3,

        dealBehind: 2,

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

        fallRoom: 0.25,
        fallLeast: 1,

        fallEven: true,

        veinCharge: 160,
        veinTime: 4000,
        veinPays: 2,
        veinFloor: 0.35,
        veinRoom: 4,
        veinSeed: 5,
        veinRush: 0.15,

        stepFall: 140,
        stepMerge: 125,
        stepClear: 240,

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

        lodestoneFrom: 6250,
        lodestoneChance: 0.015,
        lodestoneCap: 1,

        rubbleFrom: 8,
        rubbleRise: 0.05,
        rubbleMost: 0.45,
        rubbleCap: 1,
        rubbleBreaks: true
    }
};
