window.Game = window.Game || {};

/**
 * buildbar.js — the strip under the map showing what a click will do, plus
 * the Town Hall bell once there is one to ring.
 */
(function () {
    var host = null;
    var collectButton = null;

    function modeView() {
        var selection = Game.Construction.selection();

        if (selection.mode === "build") {
            var building = Game.Construction.selected();
            if (building) {
                return {
                    icon: building.icon,
                    badge: "buildbar__badge--build",
                    title: "Placing a " + building.name,
                    sub: "Click an open plot. Clear anything growing there first."
                };
            }
        }

        if (selection.mode === "demolish") {
            return {
                icon: "pickaxe",
                badge: "buildbar__badge--demolish",
                title: "Demolishing",
                sub: "Click a building to remove it. Goods waiting are handed in."
            };
        }

        return {
            icon: "sprout",
            badge: "",
            title: "Gathering",
            sub: "Click anything growing, or any building with goods outside."
        };
    }

    function waiting() {
        return Game.Grid.built().reduce(function (sum, cell) {
            return sum + cell.stock;
        }, 0);
    }

    function render() {
        if (!host) return;

        var selection = Game.Construction.selection();
        var view = modeView();
        var demolishing = selection.mode === "demolish";
        var ready = waiting();

        var actions = "";

        if (Game.Harvest.canCollectAll()) {
            actions +=
                '<button type="button" class="btn btn--small btn--primary" ' +
                'data-action="collect-all"' +
                (ready ? "" : " disabled") +
                ">" +
                Game.Icons.svg("check") +
                "Collect all" +
                (ready ? " (" + ready + ")" : "") +
                "</button>";
        }

        actions +=
            '<button type="button" class="btn btn--small ' +
            (demolishing ? "btn--on" : "") +
            '" data-action="demolish">' +
            Game.Icons.svg("pickaxe") +
            (demolishing ? "Stop" : "Demolish") +
            "</button>";

        actions +=
            selection.mode === "build"
                ? '<button type="button" class="btn btn--small btn--ghost" ' +
                  'data-action="cancel">' +
                  Game.Icons.svg("close") +
                  "Cancel</button>"
                : '<a class="btn btn--small btn--primary" href="buildings.html">' +
                  Game.Icons.svg("place") +
                  "Build</a>";

        host.innerHTML =
            '<div class="buildbar__mode">' +
            '<span class="buildbar__badge ' +
            view.badge +
            '">' +
            Game.Icons.svg(view.icon) +
            "</span>" +
            '<span class="buildbar__text">' +
            "<span>" +
            view.title +
            "</span>" +
            '<span class="buildbar__sub">' +
            view.sub +
            "</span>" +
            "</span>" +
            "</div>" +
            '<div class="buildbar__actions">' +
            actions +
            "</div>";

        collectButton = host.querySelector('[data-action="collect-all"]');
    }

    /**
     * Production ticks constantly, so the bell button is patched in place
     * rather than rebuilding the whole bar every few hundred milliseconds.
     */
    function refreshCollectAll() {
        if (!collectButton) return;

        var ready = waiting();
        collectButton.disabled = !ready;
        collectButton.innerHTML =
            Game.Icons.svg("check") +
            "Collect all" +
            (ready ? " (" + ready + ")" : "");
    }

    function onClick(event) {
        var button = event.target.closest("[data-action]");
        if (!button) return;

        var action = button.dataset.action;

        if (action === "demolish") {
            var on = Game.Construction.selection().mode === "demolish";
            Game.Construction.demolishMode(!on);
        } else if (action === "cancel") {
            Game.Construction.idle();
        } else if (action === "collect-all") {
            Game.Harvest.collectAll();
        }
    }

    Game.BuildBar = {
        init: function () {
            host = document.getElementById("buildbar");
            if (!host) return;

            render();
            host.addEventListener("click", onClick);

            Game.Events.on("selection:changed", render);
            Game.Events.on("building:placed", render);
            Game.Events.on("building:demolished", render);
            Game.Events.on("grid:changed", render);
            Game.Events.on("cell:changed", refreshCollectAll);
        }
    };
})();
