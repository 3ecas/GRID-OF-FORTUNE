window.Game = window.Game || {};

/**
 * hud.js — the counters in the top bar, on every page.
 *
 * Refined goods and coin stay hidden until the village has actually seen
 * some, so a new player starts with three numbers instead of six.
 */
(function () {
    var host = null;
    var shown = []; // resource ids currently on screen
    var values = {};
    var items = {};

    function visible() {
        return Game.Resources.list
            .filter(function (resource) {
                if (resource.layer === "raw") return true;
                return (
                    Game.Inventory.get(resource.id) > 0 ||
                    Game.State.data.stats.collected[resource.id] > 0
                );
            })
            .map(function (resource) {
                return resource.id;
            });
    }

    function build(ids) {
        host.innerHTML = "";
        values = {};
        items = {};
        shown = ids;

        ids.forEach(function (id) {
            var resource = Game.Resources.byId(id);
            var item = document.createElement("div");
            item.className = "hud__item";
            item.title = resource.name;
            item.innerHTML =
                '<span class="hud__icon ' +
                resource.tint +
                '">' +
                Game.Icons.svg(resource.icon) +
                "</span>" +
                '<span class="hud__value">0</span>';

            host.appendChild(item);
            items[id] = item;
            values[id] = item.querySelector(".hud__value");
        });
    }

    function sameList(a, b) {
        return a.length === b.length && a.every(function (id, i) {
            return id === b[i];
        });
    }

    function render(bumpedId) {
        var ids = visible();
        if (!sameList(ids, shown)) build(ids);

        ids.forEach(function (id) {
            values[id].textContent = Game.Inventory.get(id);
            items[id].classList.toggle("is-full", Game.Capacity.isFull(id));
        });

        if (!bumpedId || !items[bumpedId]) return;

        var item = items[bumpedId];
        item.classList.remove("is-bumped");
        void item.offsetWidth; // restart the animation
        item.classList.add("is-bumped");
    }

    Game.Hud = {
        init: function () {
            host = document.getElementById("hud");
            if (!host) return;

            build(visible());
            render();

            Game.Events.on("inventory:changed", function (detail) {
                render(detail.delta > 0 ? detail.resourceId : null);
            });
            Game.Events.on("grid:changed", function () {
                render();
            });
        }
    };
})();
