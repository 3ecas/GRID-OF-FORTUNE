window.Game = window.Game || {};

/**
 * boot.js — the shared startup sequence for every page.
 * A page script calls Game.Boot.start(setupFn) and nothing else.
 */
(function () {
    function startWorld() {
        var now = Game.Clock.now();

        // Catch up on time spent away or on another page, then keep ticking.
        Game.Comfort.recompute();
        Game.Production.update(now);
        Game.Spawner.update(now);
        Game.State.save(now);

        Game.Clock.start(function (tickNow) {
            Game.Production.update(tickNow);
            Game.Spawner.update(tickNow);
            Game.Events.emit("tick", { now: tickNow });
            Game.State.autosave(tickNow);
        });
    }

    function persistBeforeLeaving() {
        // Pages are separate documents, so the world must be written to disk
        // before navigating away or the last few clicks are lost.
        window.addEventListener("pagehide", function () {
            Game.State.save();
        });
        document.addEventListener("visibilitychange", function () {
            if (document.visibilityState === "hidden") Game.State.save();
        });
    }

    Game.Boot = {
        start: function (setupPage) {
            document.addEventListener("DOMContentLoaded", function () {
                Game.State.init();

                Game.Icons.hydrate(document);
                Game.Nav.init();
                Game.Hud.init();
                Game.Toast.init();

                if (typeof setupPage === "function") setupPage();

                persistBeforeLeaving();
                startWorld();
            });
        }
    };
})();
