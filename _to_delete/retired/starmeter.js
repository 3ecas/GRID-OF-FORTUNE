window.Game = window.Game || {};

/* =============================================================================
   STAR METER
   -----------------------------------------------------------------------------
   The star used to be a piece you had to be dealt and then merge next to. It is
   now something you earn: every point scored feeds a meter under the board, and
   a full meter is one star, spent whenever you like.

   What it costs is deliberately not a fixed number of points. A merge at
   diamond is worth thousands of times a merge at dirt, so a fixed cost would
   mean one star an hour early on and a star a move later. Instead the meter
   asks for `starPace` merges at whatever level you are playing at, which keeps
   a star worth about the same amount of work all the way up the ladder — the
   score just arrives faster, so it fills faster.

   Spending one owes the board a sweep, which is exactly what waking a lodestone
   used to do: the player picks a piece and every one of them leaves the board.
   ============================================================================= */

(function () {
    var charge = 0;      // 0..1
    var seen = 0;        // score at the last reading
    var ready = false;

    function settings() {
        return Game.Config.game;
    }

    /* what a full meter costs right now, in points */
    function need() {
        var state = Game.Round.get();
        var top = state ? Game.Pieces.list[state.highest - 1] : null;
        var worth = (top && top.points) || 1;
        return Math.max(settings().starLeast || 60, worth * (settings().starPace || 6));
    }

    function tell() {
        Game.Events.emit("star:change", { charge: charge, ready: ready });
    }

    function reset() {
        charge = 0;
        ready = false;
        seen = Game.Round.get() ? Game.Round.get().score : 0;
        tell();
    }

    function earn() {
        var state = Game.Round.get();
        if (!state || ready) return;

        var gained = state.score - seen;
        seen = state.score;
        if (gained <= 0) return;

        charge = Math.min(1, charge + gained / need());
        if (charge >= 1) {
            ready = true;
            Game.Events.emit("star:ready", {});
        }
        tell();
    }

    Game.StarMeter = {
        init: function () {
            Game.Events.on("game:started", reset);
            Game.Events.on("game:placed", earn);
            Game.Events.on("board:steps", earn);
        },

        charge: function () {
            return charge;
        },

        ready: function () {
            return ready;
        },

        /* Spend it. The board is owed a sweep and the game drops into the same
           choosing state a woken lodestone produced. */
        fire: function () {
            var state = Game.Round.get();
            if (!ready || !state || !state.running) return false;

            ready = false;
            charge = 0;
            seen = state.score;

            Game.Board.owe(1);
            Game.Events.emit("star:spent", {});
            Game.Events.emit("game:choosing", { owed: Game.Board.owes() });
            tell();
            return true;
        }
    };
})();
