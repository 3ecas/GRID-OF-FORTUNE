window.Game = window.Game || {};

/**
 * gridview.js — draws the map and turns clicks into system calls.
 * It never changes state itself; it asks Harvest / Construction to do it.
 */
(function () {
    var host = null;
    var tiles = []; // cell id -> button element

    /* ---------------------------------------------------------------- build */

    function build() {
        var size = Game.Grid.size();
        host.style.setProperty("--cols", size.cols);
        host.innerHTML = "";
        tiles = [];

        Game.Grid.cells().forEach(function (cell) {
            var tile = document.createElement("button");
            tile.type = "button";
            tile.className = "cell";
            tile.dataset.cell = cell.id;
            tiles[cell.id] = tile;
            host.appendChild(tile);
        });

        paintAll();
    }

    /* ---------------------------------------------------------------- paint */

    function describe(cell) {
        var where = "Plot " + (cell.x + 1) + ", " + (cell.y + 1);

        if (cell.building) {
            var building = Game.Buildings.byId(cell.building);
            var label = where + ": " + (building ? building.name : "building");
            if (cell.stock > 0) {
                var made = Game.Resources.byId(building.produces);
                label +=
                    ", " +
                    cell.stock +
                    " " +
                    (made ? made.name.toLowerCase() : "goods") +
                    " ready";
            }
            return label;
        }

        if (cell.resource) {
            var resource = Game.Resources.byId(cell.resource);
            return (
                where +
                ": " +
                (resource ? resource.name : "resource") +
                ", click to gather"
            );
        }

        var terrain = Game.TerrainTypes.byId(cell.terrain);
        return where + ": open " + (terrain ? terrain.name.toLowerCase() : "ground");
    }

    /** The little pile of goods waiting outside a building. */
    function pile(cell, building) {
        if (!cell.stock || !building.produces) return "";

        var resource = Game.Resources.byId(building.produces);
        if (!resource) return "";

        var full = cell.stock >= (building.holds || 0);
        return (
            '<span class="cell__pile ' +
            resource.tint +
            (full ? " is-full" : "") +
            '">' +
            Game.Icons.svg(resource.icon) +
            "</span>"
        );
    }

    function contents(cell) {
        if (cell.building) {
            var building = Game.Buildings.byId(cell.building);
            if (!building) return "";
            return (
                '<span class="cell__building">' +
                Game.Icons.svg(building.icon) +
                "</span>" +
                pile(cell, building)
            );
        }

        if (cell.resource) {
            var resource = Game.Resources.byId(cell.resource);
            if (!resource) return "";
            return (
                '<span class="cell__node ' +
                resource.tint +
                '">' +
                Game.Icons.svg(resource.icon) +
                "</span>"
            );
        }

        // A plot that was just harvested shows nothing at all — it simply sits
        // empty until something grows there again.
        return "";
    }

    /** Should this plot glow as a valid target for the current mode? */
    function targetState(cell, selection) {
        if (selection.mode === "build") {
            return Game.Grid.canBuild(cell) ? "target" : "blocked";
        }
        if (selection.mode === "demolish") {
            return cell.building ? "target" : "blocked";
        }
        return "";
    }

    function paint(cell, selection) {
        var tile = tiles[cell.id];
        if (!tile) return;

        selection = selection || Game.Construction.selection();

        var classes = ["cell", "cell--" + cell.terrain];
        classes.push((cell.x + cell.y) % 2 === 0 ? "cell--shade-a" : "cell--shade-b");

        if (cell.building) {
            classes.push("cell--building");
            if (cell.stock > 0) classes.push("cell--ready");
        } else if (cell.resource) {
            classes.push("cell--resource");
        } else {
            classes.push("cell--open");
        }

        var state = targetState(cell, selection);
        if (state) classes.push("is-" + state);

        tile.className = classes.join(" ");
        tile.innerHTML = contents(cell);
        tile.setAttribute("aria-label", describe(cell));
        tile.title = describe(cell);
    }

    function paintAll() {
        var selection = Game.Construction.selection();
        Game.Grid.cells().forEach(function (cell) {
            paint(cell, selection);
        });
    }

    /* --------------------------------------------------------------- clicks */

    function onClick(event) {
        var tile = event.target.closest("[data-cell]");
        if (!tile) return;

        var cell = Game.Grid.byId(Number(tile.dataset.cell));
        if (!cell) return;

        var mode = Game.Construction.selection().mode;

        if (mode === "demolish") {
            if (cell.building) Game.Construction.demolish(cell.id);
            else Game.Toast.notice("Nothing to demolish on this plot.", "info");
            return;
        }

        // Gathering always wins: it is also how you clear a plot to build on.
        if (cell.resource) {
            Game.Harvest.gather(cell.id);
            return;
        }

        if (cell.building && cell.stock > 0) {
            Game.Harvest.collect(cell.id);
            return;
        }

        if (mode === "build") {
            var building = Game.Construction.selected();
            if (building) Game.Construction.place(cell.id, building.id);
            return;
        }

        if (cell.building) {
            var placed = Game.Buildings.byId(cell.building);
            if (placed) {
                Game.Toast.notice(placed.name + ". " + placed.blurb, "info");
            }
        }
    }

    /* ------------------------------------------------------------------ api */

    Game.GridView = {
        init: function () {
            host = document.getElementById("grid");
            if (!host) return;

            build();
            host.addEventListener("click", onClick);

            Game.Events.on("cell:changed", function (detail) {
                paint(detail.cell);
            });

            Game.Events.on("grid:changed", build);
            Game.Events.on("selection:changed", paintAll);

            // The pop and the "+n" have to be added after the plot repaints.
            Game.Events.on("resource:collected", function (detail) {
                var tile = tiles[detail.cell.id];
                var resource = Game.Resources.byId(detail.resourceId);
                if (!tile || !resource) return;

                if (detail.source === "wild") {
                    var ghost = document.createElement("span");
                    ghost.className = "cell__pop " + resource.tint;
                    ghost.innerHTML = Game.Icons.svg(resource.icon);
                    tile.appendChild(ghost);
                    Game.Toast.autoRemove(ghost, 900);
                }

                Game.Toast.float(
                    tile,
                    "+" + detail.amount,
                    resource.icon,
                    resource.tint
                );
            });
        }
    };
})();
