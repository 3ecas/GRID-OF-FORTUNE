window.Game = window.Game || {};

(function () {
    function available() {
        try {
            var probe = "__storage_probe__";
            window.localStorage.setItem(probe, "1");
            window.localStorage.removeItem(probe);
            return true;
        } catch (err) {
            return false;
        }
    }

    var enabled = available();

    Game.Storage = {
        enabled: enabled,

        read: function (key) {
            if (!enabled) return null;
            try {
                var raw = window.localStorage.getItem(key);
                return raw ? JSON.parse(raw) : null;
            } catch (err) {
                return null;
            }
        },

        write: function (key, data) {
            if (!enabled) return false;
            try {
                window.localStorage.setItem(key, JSON.stringify(data));
                return true;
            } catch (err) {
                return false;
            }
        },

        clear: function (key) {
            if (!enabled) return;
            try {
                window.localStorage.removeItem(key);
            } catch (err) {
            }
        }
    };
})();
