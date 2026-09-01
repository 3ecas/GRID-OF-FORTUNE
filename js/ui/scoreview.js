window.Game = window.Game || {};

(function () {
    var host = null;
    var valueEl = null;
    var bestEl = null;
    var veinEl = null;
    var veinFillEl = null;

    var shown = 0;
    var target = 0;
    var frame = null;

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

    function paintVein(charge, of, armed) {
        if (!veinEl || !veinFillEl) return;

        var share = of > 0 ? Math.min(1, charge / of) : 0;
        veinFillEl.style.transition = "";
        veinFillEl.style.width = Math.round(share * 100) + "%";
        veinEl.classList.remove("is-running");
        veinEl.classList.toggle("is-armed", !!armed);
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
            veinEl = host.querySelector(".vein");
            veinFillEl = host.querySelector(".vein__fill");

            Game.Events.on("game:started", function () {
                era += 1;
                pending = 0;
                if (frame) window.cancelAnimationFrame(frame);
                frame = null;
                shown = 0;
                target = 0;
                paint();
                paintBest();
                paintVein(0, 1, false);
            });

            Game.Events.on("game:charge", function (detail) {
                paintVein(detail.charge, detail.of, detail.armed);
            });

            Game.Events.on("game:armed", function () {
                paintVein(1, 1, true);
                Game.Toast.float(veinEl, "Seam charged", null, "tint-star");
            });

            Game.Events.on("board:veining", function (detail) {
                if (!veinEl || !veinFillEl) return;

                // the meter is the timer: it runs down over exactly as long as
                // the pour takes to watch
                var span = Math.max(400, Math.round(detail.span || 0));

                veinEl.classList.remove("is-armed");
                veinEl.classList.add("is-running");

                veinFillEl.style.transition = "none";
                veinFillEl.style.width = "100%";
                void veinFillEl.offsetWidth;
                veinFillEl.style.transition = "width " + span + "ms linear";
                veinFillEl.style.width = "0%";

                window.setTimeout(function () {
                    if (!veinEl || !veinFillEl) return;
                    veinFillEl.style.transition = "";
                    veinEl.classList.remove("is-running");
                }, span + 80);
            });

            Game.Events.on("board:merged", function (detail) {
                var points = detail.step.points;
                if (!points) return;

                var mine = era;
                pending += points;

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
