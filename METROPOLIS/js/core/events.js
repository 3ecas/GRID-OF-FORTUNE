window.Game = window.Game || {};

/**
 * events.js — tiny publish/subscribe bus. Systems announce what happened,
 * the UI listens. Nothing in js/systems ever touches the DOM.
 *
 * Events in use:
 *   tick                 { now }
 *   inventory:changed    { inventory, resourceId, delta }
 *   cell:changed         { cell }
 *   grid:changed         { }
 *   resource:spawned     { cell, resourceId }
 *   resource:collected   { cell, resourceId, amount }
 *   building:placed      { cell, buildingId }
 *   building:demolished  { cell, buildingId }
 *   selection:changed    { selection }
 *   notice               { text, tone }
 */
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
            // copy: a handler may unsubscribe while we iterate
            bucket.slice().forEach(function (handler) {
                handler(detail || {});
            });
        }
    };
})();
