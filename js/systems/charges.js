window.Game = window.Game || {};

/* =============================================================================
   CHARGES
   -----------------------------------------------------------------------------
   Two dials either side of the hand. Both fill, both are spent by pressing
   them, and that is where the similarity ends — what feeds them is the point.

     star   fills on score.   Playing well earns it. Spending one owes the board
                              a sweep: pick a piece and every one of them goes.
     bomb   fills on falls.   Being buried earns it. Spending one puts a stick
                              of dynamite in your hand to place where you like.

   So the star is a reward and the bomb is a relief valve, and a run that is
   going badly is quietly handed the tool for digging out while a run that is
   going well is handed the tool for pressing an advantage. Feeding them both
   from score would have made them the same dial twice.

   What the star costs scales with the level being played: a merge at diamond is
   worth thousands of times a merge at dirt, so a flat price would mean one star
   an hour early and one a move late. The bomb counts pieces instead, which does
   not inflate, so it needs no scaling.
   ============================================================================= */

(function () {
    function settings() {
        return Game.Config.game;
    }

    /* one dial: what fills it, what it costs, what spending it does */
    function dial(name, cost, spend) {
        var charge = 0;
        var ready = false;

        function tell() {
            Game.Events.emit("charge:change", {
                name: name, charge: charge, ready: ready
            });
        }

        return {
            name: name,

            reset: function () {
                charge = 0;
                ready = false;
                tell();
            },

            /* `much` is in whatever unit this dial counts — points, or pieces */
            feed: function (much) {
                if (ready || much <= 0) return;

                charge = Math.min(1, charge + much / cost());
                if (charge >= 1) {
                    ready = true;
                    Game.Events.emit("charge:ready", { name: name });
                }
                tell();
            },

            charge: function () { return charge; },
            ready: function () { return ready; },

            /* Spending is two steps: press the dial to take it in hand, then
               pick the square it acts on. Nothing is deducted until the pick,
               so changing your mind costs nothing. */
            spend: function (cell) {
                var state = Game.Round.get();
                if (!ready || !state || !state.running) return false;
                if (!spend(cell)) return false;

                ready = false;
                charge = 0;
                Game.Events.emit("charge:spent", { name: name });
                tell();
                return true;
            }
        };
    }

    /* ---- what each one asks for -------------------------------------------- */
    function starCost() {
        var state = Game.Round.get();
        var top = state ? Game.Pieces.list[state.highest - 1] : null;
        var worth = (top && top.points) || 1;
        return Math.max(settings().starLeast || 900, worth * (settings().starPace || 24));
    }

    function bombCost() {
        return Math.max(1, settings().bombPace || 14);
    }

    /* ---- what each one does to the square you pick -------------------------- */
    function sweep(cell) {
        if (!cell || !cell.piece) return false;      // an empty square is not a kind
        Game.Board.owe(1);
        return !!Game.Round.choose(cell.piece);
    }

    function drop(cell) {
        if (!cell) return false;
        // the stick is placed, not detonated: it falls down the column you
        // picked and burns its fuse there like any other stick
        return !!Game.Round.place(cell.x, Game.Pieces.dynamite.id);
    }

    var star = dial("star", starCost, sweep);
    var bomb = dial("bomb", bombCost, drop);

    var armed = null;                 // the dial waiting for a square
    var seen = 0;   // score at the last reading, so only the gain is counted

    Game.Charges = {
        star: star,
        bomb: bomb,

        byName: function (name) {
            return name === "bomb" ? bomb : star;
        },

        armed: function () {
            return armed;
        },

        /* pressing a ready dial takes it in hand; pressing it again puts it
           back. The board is told either way, so it knows whether the next tap
           is a piece being played or a target being picked. */
        toggle: function (name) {
            var one = this.byName(name);

            if (armed === name) return this.disarm();
            if (!one.ready()) return false;

            armed = name;
            Game.Events.emit("charge:armed", { name: name });
            Game.Events.emit("game:choosing", { owed: 1 });
            return true;
        },

        disarm: function () {
            if (!armed) return false;
            armed = null;
            Game.Events.emit("charge:armed", { name: null });
            if (Game.Board.owes() <= 0) Game.Events.emit("game:chosen", {});
            return false;
        },

        /* the board hands back the square that was tapped */
        aim: function (cell) {
            if (!armed) return false;

            var one = this.byName(armed);
            var name = armed;
            armed = null;
            Game.Events.emit("charge:armed", { name: null });

            if (!one.spend(cell)) {
                // an unusable square: put it back in hand rather than eat it
                armed = name;
                Game.Events.emit("charge:armed", { name: name });
                return false;
            }

            if (Game.Board.owes() <= 0) Game.Events.emit("game:chosen", {});
            return true;
        },

        init: function () {
            Game.Events.on("game:started", function () {
                seen = Game.Round.get() ? Game.Round.get().score : 0;
                armed = null;
                star.reset();
                bomb.reset();
            });

            // score feeds the star
            Game.Events.on("board:steps", function () {
                var state = Game.Round.get();
                if (!state) return;
                var gained = state.score - seen;
                seen = state.score;
                star.feed(gained);
            });

            // what the sky drops feeds the bomb
            Game.Events.on("game:rain", function (detail) {
                bomb.feed((detail && detail.count) || 1);
            });
        }
    };
})();
