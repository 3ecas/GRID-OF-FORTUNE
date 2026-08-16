window.Game = window.Game || {};

/**
 * clock.js — drives the world. One interval, one callback.
 * Systems never start their own timers.
 */
(function () {
    var handle = null;

    Game.Clock = {
        now: function () {
            return Date.now();
        },

        start: function (onTick) {
            this.stop();
            handle = window.setInterval(function () {
                onTick(Date.now());
            }, Game.Config.tickMs);
        },

        stop: function () {
            if (handle !== null) {
                window.clearInterval(handle);
                handle = null;
            }
        }
    };
})();
