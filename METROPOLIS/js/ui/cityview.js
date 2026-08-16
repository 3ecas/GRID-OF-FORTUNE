window.Game = window.Game || {};

/**
 * cityview.js — how far the village has come, and the land it could claim.
 */
(function () {
    var stageHost = null;
    var statsHost = null;
    var stepsHost = null;

    function stat(label, value, note) {
        return (
            '<div class="stats__cell">' +
            '<dt class="stats__label">' +
            label +
            "</dt>" +
            '<dd class="stats__value">' +
            value +
            (note ? '<span class="stats__note">' + note + "</span>" : "") +
            "</dd>" +
            "</div>"
        );
    }

    function renderStage() {
        if (!stageHost) return;

        var stage = Game.Expansion.current();
        var next = Game.Expansion.next();
        var size = Game.Grid.size();

        var action;
        if (!next) {
            action =
                '<p class="muted">Every plot in the valley is yours. ' +
                "Nothing left to claim.</p>";
        } else {
            var cost = next.cost.coin;
            var have = Game.Inventory.get("coin");
            var ready = have >= cost;

            action =
                '<div class="claim">' +
                '<div class="claim__text">' +
                "<strong>Claim more land</strong>" +
                '<span class="muted">Grow to ' +
                next.size +
                " × " +
                next.size +
                " and become a " +
                next.name +
                ". The new ring comes with fresh ground.</span>" +
                "</div>" +
                '<button type="button" class="btn btn--primary" id="expandBtn"' +
                (ready ? "" : " disabled") +
                ">" +
                Game.Icons.svg("coin") +
                cost +
                "</button>" +
                (ready
                    ? ""
                    : '<span class="claim__note">' +
                      (cost - have) +
                      " more coin needed</span>") +
                "</div>";
        }

        stageHost.innerHTML =
            '<div class="stage">' +
            '<span class="stage__name">' +
            stage.name +
            "</span>" +
            '<span class="stage__size">' +
            size.cols +
            " × " +
            size.rows +
            " · " +
            size.cols * size.rows +
            " plots</span>" +
            '<p class="stage__blurb">' +
            stage.blurb +
            "</p>" +
            "</div>" +
            action;
    }

    function renderStats() {
        if (!statsHost) return;

        var homes = Game.Grid.built("home").length;
        var comfort = Game.Comfort.average();
        var multiplier = Game.Comfort.multiplier(comfort);

        statsHost.innerHTML =
            stat("Residents", Game.Comfort.residents()) +
            stat("Homes", homes) +
            stat(
                "Comfort",
                (comfort > 0 ? "+" : "") + Math.round(comfort * 10) / 10,
                "×" + (Math.round(multiplier * 100) / 100) + " coin"
            ) +
            stat("Buildings", Game.Grid.countBuildings()) +
            stat("Built all time", Game.State.data.stats.built) +
            stat("Coin earned", Game.State.data.stats.collected.coin || 0);
    }

    function renderSteps() {
        if (!stepsHost) return;

        var current = Game.State.data.stage;

        stepsHost.innerHTML = Game.Stages.list
            .map(function (stage, index) {
                var state = "is-locked";
                if (index < current) state = "is-done";
                else if (index === current) state = "is-current";

                return (
                    '<li class="step ' +
                    state +
                    '">' +
                    '<span class="step__dot"></span>' +
                    '<span class="step__body">' +
                    '<span class="step__name">' +
                    stage.name +
                    "</span>" +
                    '<span class="step__size">' +
                    stage.size +
                    " × " +
                    stage.size +
                    (stage.cost ? " · " + stage.cost.coin + " coin" : " · start") +
                    "</span>" +
                    "</span>" +
                    "</li>"
                );
            })
            .join("");
    }

    function renderAll() {
        renderStage();
        renderStats();
        renderSteps();
    }

    function onClick(event) {
        if (!event.target.closest("#expandBtn")) return;
        Game.Expansion.expand();
    }

    Game.CityView = {
        init: function () {
            stageHost = document.getElementById("cityStage");
            statsHost = document.getElementById("cityStats");
            stepsHost = document.getElementById("citySteps");
            if (!stageHost) return;

            renderAll();
            stageHost.addEventListener("click", onClick);

            Game.Events.on("inventory:changed", renderStage);
            Game.Events.on("building:placed", renderStats);
            Game.Events.on("building:demolished", renderStats);
            Game.Events.on("stage:changed", renderAll);
            Game.Events.on("grid:changed", renderAll);
        }
    };
})();
