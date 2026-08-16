window.Game = window.Game || {};

/**
 * inventoryview.js — what the village is holding, and how close to full.
 */
(function () {
    var cardsHost = null;
    var statsHost = null;

    function bar(amount, cap) {
        if (cap === Infinity) return "";
        var pct = Math.min(100, Math.round((amount / cap) * 100));
        return (
            '<span class="meter"><span class="meter__fill" style="width:' +
            pct +
            '%"></span></span>'
        );
    }

    function card(resource) {
        var amount = Game.Inventory.get(resource.id);
        var cap = Game.Capacity.of(resource.id);
        var collected = Game.State.data.stats.collected[resource.id] || 0;
        var full = cap !== Infinity && amount >= cap;

        return (
            '<article class="card res-card' +
            (full ? " is-full" : "") +
            '">' +
            '<div class="res-card__icon ' +
            resource.tint +
            '">' +
            Game.Icons.svg(resource.icon) +
            "</div>" +
            '<div class="res-card__body">' +
            '<span class="res-card__name">' +
            resource.name +
            "</span>" +
            '<span class="res-card__value">' +
            amount +
            (cap === Infinity
                ? ""
                : '<span class="res-card__cap"> / ' + cap + "</span>") +
            "</span>" +
            bar(amount, cap) +
            '<span class="res-card__meta">' +
            (full ? "Store is full" : collected + " gathered all together") +
            "</span>" +
            "</div>" +
            "</article>"
        );
    }

    function renderCards() {
        if (!cardsHost) return;
        cardsHost.innerHTML = Game.Resources.list.map(card).join("");
    }

    function stat(label, value) {
        return (
            '<div class="stats__cell">' +
            '<dt class="stats__label">' +
            label +
            "</dt>" +
            '<dd class="stats__value">' +
            value +
            "</dd>" +
            "</div>"
        );
    }

    function renderStats() {
        if (!statsHost) return;

        var size = Game.Grid.size();
        var stats = Game.State.data.stats;
        var plots = size.cols * size.rows;
        var built = Game.Grid.countBuildings();
        var waiting = Game.Grid.built().reduce(function (sum, cell) {
            return sum + cell.stock;
        }, 0);

        statsHost.innerHTML =
            stat("Plots", plots) +
            stat("Buildings", built) +
            stat("Open ground", plots - built) +
            stat("Growing wild", Game.Grid.countResources()) +
            stat("Waiting to collect", waiting) +
            stat("Demolished", stats.demolished);
    }

    function renderAll() {
        renderCards();
        renderStats();
    }

    Game.InventoryView = {
        init: function () {
            cardsHost = document.getElementById("inventoryCards");
            statsHost = document.getElementById("villageStats");

            renderAll();

            Game.Events.on("inventory:changed", renderAll);
            Game.Events.on("cell:changed", renderStats);
            Game.Events.on("grid:changed", renderAll);
        }
    };
})();
