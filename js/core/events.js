window.Game = window.Game || {};

(function () {
    var listeners = {};

    Game.Events = {
        on: function (type, handler) {
            (listeners[type] || (listeners[type] = [])).push(handler);
            return function () {
                Game.Events.off(type, handler);
            };
        },

        off: function (type, handler) {
            var bucket = listeners[type];
            if (!bucket) return;
            var i = bucket.indexOf(handler);
            if (i !== -1) bucket.splice(i, 1);
        },

        emit: function (type, detail) {
            var bucket = listeners[type];
            if (!bucket) return;

            bucket.slice().forEach(function (handler) {
                handler(detail || {});
            });
        }
    };
})();
