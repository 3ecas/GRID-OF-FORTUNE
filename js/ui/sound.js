window.Game = window.Game || {};

/**
 * sound.js — every noise the game makes, built out of oscillators.
 *
 * There are no audio files. The whole set is synthesised on the spot, which
 * is the only way it works the same from a folder on disk, from a server and
 * from Pages, with nothing to download and nothing to go missing.
 *
 * Everything is tuned to one pentatonic scale, so nothing can clash with
 * anything else — a nine-deep cascade climbs the scale note by note and every
 * step of it is still in tune. The rising pitch *is* the multiplier: you hear
 * the chain getting more valuable before you read the number.
 *
 * Browsers will not let a page make noise until the person has touched it, so
 * nothing is built until the first click. If the browser refuses outright we
 * just stay silent — a game with no sound is fine, a game that throws is not.
 */
(function () {
    var KEY = "gridoffortune.sound";

    var ctx = null;
    var master = null;
    var noise = null;
    var on = true;
    var broken = false;

    /* C major pentatonic across three octaves. There is no wrong pair of
       notes in here, which is what lets the game stack sounds freely. */
    var SCALE = [
        261.63, 293.66, 329.63, 392.0, 440.0,
        523.25, 587.33, 659.25, 783.99, 880.0,
        1046.5, 1174.66, 1318.51
    ];

    function step(i) {
        return SCALE[Math.max(0, Math.min(SCALE.length - 1, i))];
    }

    /** Builds the audio stack on first use, once, and never complains. */
    function ensure() {
        if (ctx || broken) return ctx;

        var Ctor = window.AudioContext || window.webkitAudioContext;
        if (!Ctor) {
            broken = true;
            return null;
        }

        try {
            ctx = new Ctor();
            master = ctx.createGain();
            master.gain.value = 0.2; // quiet by default; this is a cosy game
            master.connect(ctx.destination);
        } catch (err) {
            broken = true;
            ctx = null;
        }

        return ctx;
    }

    /** A second of white noise, made once and shared by every crunch. */
    function hiss() {
        if (noise) return noise;
        var frames = Math.floor(ctx.sampleRate * 0.5);
        noise = ctx.createBuffer(1, frames, ctx.sampleRate);
        var data = noise.getChannelData(0);
        for (var i = 0; i < frames; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        return noise;
    }

    /**
     * One note. Everything with a pitch is made of these.
     *
     * The envelope ramps rather than jumping, because a gain that starts at
     * full volume clicks. Exponential ramps cannot touch zero, hence 0.0001.
     */
    function tone(o) {
        if (!on || !ensure()) return;

        var now = ctx.currentTime + (o.at || 0);
        var len = o.len || 0.18;
        var peak = o.gain || 0.3;

        var osc = ctx.createOscillator();
        var gain = ctx.createGain();

        osc.type = o.type || "triangle";
        osc.frequency.setValueAtTime(o.freq, now);
        if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, now + len);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(peak, now + 0.014);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + len);

        osc.connect(gain);
        gain.connect(master);
        osc.start(now);
        osc.stop(now + len + 0.03);
    }

    /** Noise through a narrow band — for things breaking rather than ringing. */
    function crunch(o) {
        if (!on || !ensure()) return;

        var now = ctx.currentTime + (o.at || 0);
        var len = o.len || 0.2;

        var src = ctx.createBufferSource();
        src.buffer = hiss();

        var band = ctx.createBiquadFilter();
        band.type = "bandpass";
        band.frequency.value = o.freq || 900;
        band.Q.value = o.q || 0.9;

        var gain = ctx.createGain();
        gain.gain.setValueAtTime(o.gain || 0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + len);

        src.connect(band);
        band.connect(gain);
        gain.connect(master);
        src.start(now);
        src.stop(now + len);
    }

    /* ------------------------------------------------------------- the kit */

    /**
     * Two joined up. Pitch climbs with the chain, so the fifth join in a
     * cascade is audibly higher than the first, and the good rungs get a
     * note underneath them for weight.
     */
    function joined(piece, chain, times) {
        var note = step(chain - 1 + Math.floor(piece.tier / 3));
        tone({ freq: note, len: 0.15, gain: 0.24 });

        if (piece.tier >= 6) {
            tone({ freq: note / 4, type: "sine", len: 0.3, gain: 0.2 });
        }

        // past the cap there is nothing left to climb, so it gets a sparkle
        if (times >= Game.Config.game.chainMost) {
            tone({ freq: note * 2, at: 0.07, len: 0.14, gain: 0.14, type: "sine" });
        }
    }

    /** Rubble knocked loose: a dry crack, no pitch, nothing musical. */
    function broke(count) {
        for (var i = 0; i < Math.min(count, 4); i++) {
            crunch({
                at: i * 0.045,
                freq: 620 + Math.random() * 500,
                len: 0.16,
                gain: 0.26
            });
        }
    }

    /** The top rung carried off — the one moment worth a small fanfare. */
    function cashed() {
        [0, 2, 4, 7].forEach(function (n, i) {
            tone({ freq: step(n + 5), at: i * 0.06, len: 0.26, gain: 0.2 });
        });
    }

    /** Something made for the first time ever. */
    function found() {
        [0, 3, 5].forEach(function (n, i) {
            tone({
                freq: step(n + 6),
                at: i * 0.075,
                len: 0.22,
                gain: 0.15,
                type: "sine"
            });
        });
    }

    /** Pieces coming to rest. Soft, low, and never in the way. */
    function landed(count) {
        tone({
            freq: 150,
            to: 90,
            type: "sine",
            len: 0.11,
            gain: Math.min(0.06 + count * 0.02, 0.16)
        });
    }

    /** The board filled. Walks back down the scale. */
    function over() {
        [8, 6, 4, 2].forEach(function (n, i) {
            tone({ freq: step(n), at: i * 0.15, len: 0.42, gain: 0.2 });
        });
    }

    /* ------------------------------------------------------------ the wiring */

    function onMerged(detail) {
        var s = detail.step;

        if (s.type === "merge") {
            joined(Game.Pieces.byId(s.piece), s.chain || 1, s.times || 1);
            return;
        }

        if (s.type === "cash") {
            cashed();
            return;
        }

        // a clear worth nothing is rubble breaking; worth something is a line
        if (s.type === "clear") {
            if (s.points) cashed();
            else broke(s.cells.length);
        }
    }

    function button() {
        var node = document.querySelector("[data-sound]");
        if (!node) return;

        function paint() {
            node.innerHTML = Game.Icons.svg(on ? "sound" : "mute");
            node.setAttribute("aria-pressed", on ? "false" : "true");
            node.setAttribute(
                "aria-label",
                on ? "Turn sound off" : "Turn sound on"
            );
            node.classList.toggle("is-off", !on);
        }

        node.addEventListener("click", function () {
            on = !on;
            Game.Storage.write(KEY, { on: on });
            paint();
            if (on) tone({ freq: step(5), len: 0.16, gain: 0.22 });
        });

        paint();
    }

    Game.Sound = {
        start: function () {
            var saved = Game.Storage.read(KEY);
            if (saved && typeof saved.on === "boolean") on = saved.on;

            /* The audio stack cannot be built before a gesture, and a context
               built too early lands in a suspended state that never wakes on
               its own. So: build on the first touch, and nudge it awake on
               every one after, since tabbing away suspends it again. */
            ["pointerdown", "keydown"].forEach(function (kind) {
                window.addEventListener(kind, function () {
                    if (!ensure()) return;
                    if (ctx.state === "suspended") ctx.resume();
                });
            });

            Game.Events.on("board:merged", onMerged);
            Game.Events.on("board:landed", function (d) {
                landed(d.count || 1);
            });
            Game.Events.on("game:found", found);
            Game.Events.on("game:over", over);

            button();
        },

        /** Whether the game is currently making noise. */
        on: function () {
            return on;
        }
    };
})();
