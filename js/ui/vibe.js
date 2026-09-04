window.Game = window.Game || {};

/* =============================================================================
   VIBE
   -----------------------------------------------------------------------------
   The ground takes its colour from what you are digging out of it. Early on the
   page is earthy, because dirt and rock are earthy; by the time you are making
   amethyst it has gone violet, and gold turns it warm.

   The colour is read straight off the piece's own --i-* tokens, so this needs no
   palette of its own and cannot fall out of step with the art — redraw a piece
   in a new colour and the room it is played in changes with it.

   It moves on the deal window rather than on the single best piece you have
   ever made: the window is what you are actually handling move to move, so the
   room changes when the run changes, not when you get one lucky merge.
   ============================================================================= */

(function () {
    var root = document.documentElement;
    var showing = null;

    function tone(name, fallback) {
        var found = getComputedStyle(root).getPropertyValue(name).trim();
        return found || fallback;
    }

    function wear(icon) {
        if (!icon || icon === showing) return;
        showing = icon;

        var base = tone("--i-" + icon, tone("--ink-faint", "#a2aab6"));
        root.style.setProperty("--vibe", base);
        root.style.setProperty("--vibe-deep", tone("--i-" + icon + "-deep", base));
        root.style.setProperty("--vibe-light", tone("--i-" + icon + "-light", base));
    }

    /* the middle of what is being dealt — the piece the run is about right now */
    function current() {
        var state = Game.Round.get();
        if (!state || !Game.Pieces) return null;

        var dealing = Game.Pieces.dealing(state.highest);
        var piece = dealing[dealing.length - 1] || Game.Pieces.list[0];
        return piece && piece.icon;
    }

    Game.Vibe = {
        init: function () {
            var look = function () { wear(current()); };

            Game.Events.on("game:started", function () {
                showing = null;
                look();
            });
            Game.Events.on("game:dealing", look);
            Game.Events.on("game:found", look);

            wear("dirt");
        }
    };
})();
