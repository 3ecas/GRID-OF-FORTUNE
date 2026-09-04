window.Game = window.Game || {};

/* =============================================================================
   STAR VIEW
   -----------------------------------------------------------------------------
   The meter under the board. It is drawn on a canvas rather than as a plain bar
   because the point of it is that it never sits still: motes drift up through
   the charged part the whole time, so a glance tells you the thing is filling
   even when no score has landed for a few moves.

   The bar keeps drawing at rest. That is the idle state, not a special case.
   ============================================================================= */

(function () {
    var host = null;
    var canvas = null;
    var ctx = null;
    var button = null;

    var charge = 0;       // what the meter is told
    var shown = 0;        // what it has caught up to, so the fill eases
    var ready = false;

    var motes = [];
    var wide = 0;
    var tall = 0;
    var last = 0;
    var still = false;

    function measure() {
        if (!canvas) return;
        var box = canvas.getBoundingClientRect();
        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        wide = Math.max(1, box.width);
        tall = Math.max(1, box.height);
        canvas.width = Math.round(wide * dpr);
        canvas.height = Math.round(tall * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function mote() {
        return {
            x: Math.random(),                        // across the bar, 0..1
            y: Math.random(),                        // up the bar, 0..1
            size: 0.7 + Math.random() * 1.6,
            rise: 0.10 + Math.random() * 0.22,       // bar heights per second
            drift: (Math.random() - 0.5) * 0.05,
            glow: 0.35 + Math.random() * 0.65
        };
    }

    function seed() {
        motes = [];
        for (var i = 0; i < 34; i++) motes.push(mote());
    }

    function paint(now) {
        if (!ctx) return;
        var gap = Math.min(0.05, (now - last) / 1000 || 0);
        last = now;

        shown += (charge - shown) * Math.min(1, gap * 6);

        ctx.clearRect(0, 0, wide, tall);

        var filled = Math.max(0, Math.min(1, shown)) * wide;

        // the charged run of the bar
        if (filled > 0) {
            var wash = ctx.createLinearGradient(0, 0, filled, 0);
            wash.addColorStop(0, ready ? "#ffd873" : "#e2b75c");
            wash.addColorStop(1, ready ? "#fff3b8" : "#ffc93f");
            ctx.fillStyle = wash;
            ctx.fillRect(0, 0, filled, tall);
        }

        // motes: inside the charge, and a few faint ones ahead of it so the
        // empty part of the bar is visibly waiting rather than dead
        for (var i = 0; i < motes.length; i++) {
            var m = motes[i];
            if (!still) {
                m.y -= m.rise * gap;
                m.x += m.drift * gap;
                if (m.y < -0.1) { motes[i] = mote(); motes[i].y = 1.1; continue; }
            }

            var x = m.x * wide;
            var y = m.y * tall;
            var inside = x <= filled;

            ctx.globalAlpha = (inside ? 0.85 : 0.22) * m.glow;
            ctx.fillStyle = inside ? "#fffdf0" : "#bfc6cf";
            ctx.beginPath();
            ctx.arc(x, y, m.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        if (!still) window.requestAnimationFrame(paint);
    }

    function show(detail) {
        charge = detail.charge;
        ready = detail.ready;
        if (!host) return;
        host.classList.toggle("is-ready", ready);
        if (button) button.disabled = !ready;
        if (still) window.requestAnimationFrame(paint);
    }

    Game.StarView = {
        init: function () {
            host = document.getElementById("star");
            if (!host) return;

            canvas = host.querySelector(".star__motes");
            button = host.querySelector(".star__go");
            if (!canvas || !canvas.getContext) return;
            ctx = canvas.getContext("2d");

            still = window.matchMedia
                && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

            measure();
            seed();
            window.addEventListener("resize", measure);

            button.addEventListener("click", function () {
                Game.StarMeter.fire();
            });

            Game.Events.on("star:change", show);
            Game.Events.on("game:started", function () {
                measure();
                seed();
            });

            last = window.performance ? window.performance.now() : Date.now();
            window.requestAnimationFrame(paint);
        }
    };
})();
