window.Game = window.Game || {};

/**
 * buildingsview.js — the catalogue, grouped by what each building is for.
 * Picking a card sets what the map will place on the next plot you click.
 */
(function () {
    var host = null;

    var GROUPS = [
        {
            kind: "gatherer",
            title: "Gatherers",
            note: "Work the ground they stand on. Twice as fast on matching terrain."
        },
        {
            kind: "home",
            title: "Homes",
            note: "Make coin. Comfortable neighbours make more of it."
        },
        {
            kind: "refiner",
            title: "Workshops",
            note: "Turn raw goods from the store into better ones."
        },
        {
            kind: "civic",
            title: "Civic",
            note: "Change the rules around them."
        }
    ];

    function chip(resourceId, amount, short) {
        var resource = Game.Resources.byId(resourceId);
        return (
            '<span class="chip ' +
            (short ? "chip--short" : "") +
            '">' +
            Game.Icons.svg(resource ? resource.icon : "spark") +
            amount +
            "</span>"
        );
    }

    function costChips(cost) {
        return Object.keys(cost)
            .map(function (id) {
                return chip(id, cost[id], Game.Inventory.get(id) < cost[id]);
            })
            .join("");
    }

    /** One plain line describing what the building actually does. */
    function effect(building) {
        var parts = [];

        if (building.produces && building.every) {
            var made = Game.Resources.byId(building.produces);
            var amount = building.amount || 1;
            parts.push(
                amount +
                    " " +
                    made.name.toLowerCase() +
                    " every " +
                    building.every +
                    "s, holds " +
                    building.holds
            );
        }

        var inputs = building.consumes || building.sells;
        if (inputs) {
            parts.push(
                "uses " +
                    Object.keys(inputs)
                        .map(function (id) {
                            var resource = Game.Resources.byId(id);
                            return inputs[id] + " " + resource.name.toLowerCase();
                        })
                        .join(" and ")
            );
        }

        if (building.residents) parts.push(building.residents + " residents");
        if (building.storage) parts.push("+" + building.storage + " storage");
        if (building.comfort) {
            parts.push(
                (building.comfort > 0 ? "+" : "") +
                    building.comfort +
                    " comfort nearby"
            );
        }
        if (building.collectAll) parts.push("collect the whole city at once");

        return parts.join(" · ");
    }

    function card(building, selectedId) {
        var standing = Game.Grid.countOf(building.id);
        var locked = !Game.Construction.isUnlocked(building);
        var spent = Game.Construction.isSpent(building);
        var affordable = Game.Inventory.canAfford(building.cost);
        var selected = building.id === selectedId;

        var note;
        if (locked) {
            note = "Unlocks as a " + Game.Stages.at(building.stage).name;
        } else if (spent) {
            note = "Already standing";
        } else if (selected) {
            note = "Now click a plot on the map";
        } else if (!affordable) {
            note = "Not enough yet";
        } else {
            note = effect(building);
        }

        return (
            '<article class="card build-card' +
            (selected ? " is-selected" : "") +
            (locked ? " is-locked" : "") +
            '">' +
            '<div class="build-card__head">' +
            '<div class="build-card__icon">' +
            Game.Icons.svg(building.icon) +
            "</div>" +
            "<div>" +
            '<h3 class="build-card__title">' +
            building.name +
            (standing ? '<span class="pill">' + standing + "</span>" : "") +
            "</h3>" +
            '<div class="build-card__cost">' +
            costChips(building.cost) +
            "</div>" +
            "</div>" +
            "</div>" +
            '<p class="build-card__blurb">' +
            building.blurb +
            "</p>" +
            '<div class="build-card__foot">' +
            '<button type="button" class="btn ' +
            (selected ? "btn--on" : "btn--primary") +
            '" data-building="' +
            building.id +
            '"' +
            (locked || spent || (!affordable && !selected) ? " disabled" : "") +
            ">" +
            Game.Icons.svg(selected ? "check" : "place") +
            (selected ? "Selected" : "Select") +
            "</button>" +
            '<span class="build-card__note">' +
            note +
            "</span>" +
            "</div>" +
            "</article>"
        );
    }

    function render() {
        if (!host) return;

        var selection = Game.Construction.selection();
        var selectedId =
            selection.mode === "build" ? selection.buildingId : null;

        host.innerHTML = GROUPS.map(function (group) {
            var buildings = Game.Buildings.ofKind(group.kind);
            if (!buildings.length) return "";

            return (
                '<section class="group">' +
                '<div class="group__head">' +
                '<h2 class="group__title">' +
                group.title +
                "</h2>" +
                '<p class="group__note">' +
                group.note +
                "</p>" +
                "</div>" +
                '<div class="cards">' +
                buildings
                    .map(function (building) {
                        return card(building, selectedId);
                    })
                    .join("") +
                "</div>" +
                "</section>"
            );
        }).join("");
    }

    function onClick(event) {
        var button = event.target.closest("[data-building]");
        if (!button) return;
        Game.Construction.select(button.dataset.building);
    }

    Game.BuildingsView = {
        init: function () {
            host = document.getElementById("buildingCards");
            if (!host) return;

            render();
            host.addEventListener("click", onClick);

            Game.Events.on("selection:changed", render);
            Game.Events.on("inventory:changed", render);
            Game.Events.on("building:placed", render);
            Game.Events.on("building:demolished", render);
            Game.Events.on("stage:changed", render);
            Game.Events.on("grid:changed", render);
        }
    };
})();
