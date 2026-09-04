window.Game = window.Game || {};

/* =============================================================================
   BOONS
   -----------------------------------------------------------------------------
   Every so often the run stops and asks the player a question. Three offers are
   drawn from the pool below and one is taken; the rest of the run is played
   with whatever was chosen.

   Two things set the pace, and both come from the game rather than a timer:
   making a piece for the first time, and passing a score mark. Neither needs
   tuning as the ladder grows — a player who is climbing is asked more often
   than one who is stuck, which is the way round it should be.

   The offers are deliberately different in kind rather than in degree. Space is
   the safe pick and worth about a tier over a run; a bomb answers the trouble
   you are in right now; and dealing closer to your best is the only one that
   touches how expensive a rung is, so it is offered once and late.

   Nothing here is written to the save. A boon lasts a run.
   ============================================================================= */

(function () {
    var MARKS = [1000, 5000, 25000, 125000, 625000];
    var FROM_TIER = 5;              // no interruptions while the run is warming up
    var SHOW = 3;                   // offers put in front of the player

    var base = null;                // config as it was before any boon touched it
    var run = null;

    function settings() {
        return Game.Config.game;
    }

    function remember() {
        base = {
            cols: settings().cols,
            rows: settings().rows,
            dealBehind: settings().dealBehind,
            fallFewer: settings().fallFewer,
            fallSlower: settings().fallSlower
        };
    }

    function restore() {
        if (!base) return remember();
        Object.keys(base).forEach(function (key) {
            settings()[key] = base[key];
        });
    }

    /* ---- growing the board without losing what is on it -------------------- */
    function grow(moreCols, moreRows) {
        var size = Game.Board.size();
        var was = Game.Board.snapshot();
        var cols = size.cols + moreCols;
        var rows = size.rows + moreRows;
        var next = [];
        var i;

        for (i = 0; i < cols * rows; i++) next.push(null);

        // new rows appear above what is already stacked, new columns to the right
        for (var y = 0; y < size.rows; y++) {
            for (var x = 0; x < size.cols; x++) {
                next[(y + moreRows) * cols + x] = was[y * size.cols + x];
            }
        }

        settings().cols = cols;
        settings().rows = rows;
        Game.Board.build(cols, rows);
        Game.Board.load(next);
        if (Game.BoardView && Game.BoardView.rebuild) Game.BoardView.rebuild();
    }

    function toHand(piece) {
        var state = Game.Round.get();
        if (!state || !piece) return;
        state.hand.unshift(piece);
        Game.Events.emit("game:hand", {});
    }

    /* ---- the pool ---------------------------------------------------------- */
    var POOL = [
        {
            id: "wider",
            name: "Wider",
            note: "One more column",
            icon: "rock",
            open: function () { return Game.Board.size().cols < 10; },
            take: function () { grow(1, 0); }
        },
        {
            id: "deeper",
            name: "Deeper",
            note: "One more row",
            icon: "iron",
            open: function () { return Game.Board.size().rows < 15; },
            take: function () { grow(0, 1); }
        },
        {
            id: "bomb",
            name: "Dynamite",
            note: "A stick in your hand, now",
            icon: "dynamite",
            open: function () { return true; },
            take: function () { toHand(Game.Pieces.dynamite); }
        },
        {
            id: "star",
            name: "Star",
            note: "A lodestone in your hand, now",
            icon: "lodestone",
            open: function () { return true; },
            take: function () { toHand(Game.Pieces.lodestone); }
        },
        {
            id: "lighter",
            name: "Lighter sky",
            note: "One less piece in every fall",
            icon: "rubble",
            open: function () { return (settings().fallFewer || 0) < 3; },
            take: function () { settings().fallFewer = (settings().fallFewer || 0) + 1; }
        },
        {
            id: "slower",
            name: "Longer calm",
            note: "One more play between falls",
            icon: "sparkle",
            open: function () { return (settings().fallSlower || 0) < 4; },
            take: function () { settings().fallSlower = (settings().fallSlower || 0) + 1; }
        },
        {
            id: "closer",
            name: "Richer seam",
            note: "Dealt one rung nearer your best",
            icon: "crown",
            rare: true,                       // the only offer that changes the climb
            open: function () {
                return run.taken.length >= 2 && (settings().dealBehind || 0) > 0;
            },
            take: function () { settings().dealBehind = settings().dealBehind - 1; }
        }
    ];

    function draw() {
        var pool = POOL.filter(function (offer) {
            if (run.used[offer.id] && offer.rare) return false;
            return offer.open();
        });

        var picked = [];
        while (picked.length < SHOW && pool.length) {
            var i = Math.floor(Math.random() * pool.length);
            picked.push(pool.splice(i, 1)[0]);
        }
        return picked;
    }

    function offer(reason) {
        if (!run || run.open) return;
        if (settings().boons === false) return;
        var choices = draw();
        if (!choices.length) return;

        run.open = true;
        Game.Events.emit("boon:offer", { choices: choices, reason: reason });
    }

    /* ---- what makes the run stop and ask ----------------------------------- */
    function onFound(detail) {
        if (!run || !detail || !detail.pieces) return;

        var worth = detail.pieces.some(function (id) {
            var piece = Game.Pieces.byId(id);
            return piece && piece.tier >= FROM_TIER;
        });
        if (worth) offer("found");
    }

    function onPlaced() {
        if (!run) return;
        var score = Game.Round.get() ? Game.Round.get().score : 0;

        while (run.mark < MARKS.length && score >= MARKS[run.mark]) {
            run.mark += 1;
            offer("score");
        }
    }

    Game.Boons = {
        init: function () {
            remember();

            Game.Events.on("game:started", function () {
                restore();
                run = { taken: [], used: {}, mark: 0, open: false };
            });

            Game.Events.on("game:found", onFound);
            Game.Events.on("game:placed", onPlaced);
        },

        // what the run has collected so far, for anything that wants to show it
        taken: function () {
            return run ? run.taken.slice() : [];
        },

        choose: function (id) {
            if (!run || !run.open) return false;

            var offerTaken = POOL.filter(function (one) { return one.id === id; })[0];
            if (!offerTaken) return false;

            offerTaken.take();
            run.taken.push(offerTaken.id);
            run.used[offerTaken.id] = true;
            run.open = false;

            Game.Events.emit("boon:taken", { offer: offerTaken });
            return true;
        }
    };
})();
