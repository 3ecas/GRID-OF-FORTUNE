window.Game = window.Game || {};

/**
 * scoreview.js — the number at the top of the screen.
 *
 * It does not jump. It counts, and it counts in step with the board: each
 * merge in a chain adds its own share as that merge pops, so a five-deep
 * cascade reads as five separate gains rather than one number appearing out
 * of nowhere at the end.
 */
(function () {
    var host = null;
    var valueEl = null;
    var bestEl = null;

    var shown = 0; // what the screen says
    var target = 0; // what it is counting towards
    var frame = null;

    var COUNT_MS = 420;

    function paint() {
        if (valueEl) valueEl.textContent = Math.round(shown);
    }

    function paintBest() {
        var round = Game.Round.get();
        if (!bestEl || !round) return;
        bestEl.textContent = round.best ? "best " + round.best : "";
    }

    /** Eases the shown figure towards the target. */
    function run() {
        var from = shown;
        var gap = target - from;
        if (gap <= 0) {
            shown = target;
            paint();
            return;
        }

        var started = null;
        if (frame) window.cancelAnimationFrame(frame);

        function step(now) {
            if (started === null) started = now;
            var t = Math.min(1, (now - started) / COUNT_MS);
            // fast out of the gate, settling at the end
            var eased = 1 - Math.pow(1 - t, 3);
            shown = from + gap * eased;
            paint();
            if (t < 1) frame = window.requestAnimationFrame(step);
            else frame = null;
        }

        frame = window.requestAnimationFrame(step);
    }

    /** A pop sized to what was just won. */
    function pop(points) {
        if (!valueEl) return;
        var weight = Math.min(1, points / 3000);

        valueEl.style.setProperty("--pop", 1.12 + weight * 0.34);
        valueEl.classList.remove("is-up");
        void valueEl.offsetWidth;
        valueEl.classList.add("is-up");
    }

    Game.ScoreView = {
        init: function () {
            host = document.getElementById("scoreboard");
            if (!host) return;

            valueEl = host.querySelector(".scoreboard__value");
            bestEl = host.querySelector(".scoreboard__best");

            Game.Events.on("game:started", function () {
                if (frame) window.cancelAnimationFrame(frame);
                frame = null;
                shown = 0;
                target = 0;
                paint();
                paintBest();
            });

            // one gain per merge, as that merge lands
            Game.Events.on("board:merged", function (detail) {
                if (!detail.step.points) return;
                target += detail.step.points;
                pop(detail.step.points);
                run();
            });

            // catch anything the beats missed, such as a grow-up cascade
            Game.Events.on("board:settled", function () {
                var round = Game.Round.get();
                if (!round || target === round.score) return;
                target = round.score;
                run();
            });

            Game.Events.on("game:over", paintBest);
        }
    };
})();
