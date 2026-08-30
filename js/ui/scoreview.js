window.Game = window.Game || {};

(function () {
    var host = null;
    var valueEl = null;
    var bestEl = null;

    var shown = 0;
    var target = 0;
    var frame = null;

    /* Points that have left a merge but not yet reached the score. The settle
       must not reconcile past them or they would be counted twice; `era` lets
       a new game throw away numbers still in flight from the old one. */
    var pending = 0;
    var era = 0;

    var COUNT_MS = 420;

    function paint() {
        if (valueEl) valueEl.textContent = Math.round(shown);
    }

    function paintBest() {
        var round = Game.Round.get();
        if (!bestEl || !round) return;
        bestEl.textContent = round.best ? "best " + round.best : "";
    }

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

            var eased = 1 - Math.pow(1 - t, 3);
            shown = from + gap * eased;
            paint();
            if (t < 1) frame = window.requestAnimationFrame(step);
            else frame = null;
        }

        frame = window.requestAnimationFrame(step);
    }

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
                era += 1;
                pending = 0;
                if (frame) window.cancelAnimationFrame(frame);
                frame = null;
                shown = 0;
                target = 0;
                paint();
                paintBest();
            });

            Game.Events.on("board:merged", function (detail) {
                var points = detail.step.points;
                if (!points) return;

                var mine = era;
                pending += points;

                /* the score counts it as the number lands, not before */
                window.setTimeout(function () {
                    if (mine !== era) return;
                    pending -= points;
                    target += points;
                    pop(points);
                    run();
                }, Game.Toast.FLY_MS - 60);
            });

            Game.Events.on("board:settled", function () {
                var round = Game.Round.get();
                if (!round || pending > 0) return;
                if (target === round.score) return;
                target = round.score;
                run();
            });

            Game.Events.on("game:over", paintBest);
        }
    };
})();
