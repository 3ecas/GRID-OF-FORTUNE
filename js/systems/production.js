window.Game = window.Game || {};

/**
 * production.js — buildings filling themselves up.
 *
 * Every building banks time. When it has banked a full cycle it puts one lot
 * of goods outside its door and starts again, until it is holding as much as
 * it can and simply waits for you. Nothing is ever lost by being away: the
 * worst case is a full building doing nothing.
 *
 * Because it is all time arithmetic, an absence is caught up in one pass on
 * the next load — no ticking required while the tab is shut.
 */
(function () {
    function scale(cost, times) {
        var scaled = {};
        Object.keys(cost).forEach(function (id) {
            scaled[id] = cost[id] * times;
        });
        return scaled;
    }

    /** How long one lot takes here, in ms. */
    function cycleMs(cell, building) {
        var seconds = building.every;

        if (building.kind === "gatherer" && building.terrain) {
            if (cell.terrain === building.terrain) {
                seconds = seconds / Game.Config.production.matchedBonus;
            }
        }

        if (building.kind === "home") {
            seconds = seconds / Game.Comfort.multiplierFor(cell);
        }

        return seconds * 1000;
    }

    /** Advances one building. Returns true if its pile changed. */
    function step(cell, elapsed) {
        var building = Game.Buildings.byId(cell.building);
        if (!building || !building.produces || !building.every) return false;

        var holds = building.holds || 0;
        var per = building.amount || 1;
        var ms = cycleMs(cell, building);

        cell.progress += elapsed;
        var cycles = Math.floor(cell.progress / ms);
        if (cycles <= 0) return false;

        // never bank more than one spare cycle while blocked
        var blocked = function () {
            cell.progress = Math.min(cell.progress, ms);
            return false;
        };

        var space = Math.floor((holds - cell.stock) / per);
        if (space <= 0) return blocked();
        cycles = Math.min(cycles, space);

        var inputs = building.consumes || building.sells;
        if (inputs) {
            cycles = Math.min(cycles, Game.Inventory.timesAffordable(inputs));
            if (cycles <= 0) return blocked();
            Game.Inventory.spend(scale(inputs, cycles));
        }

        cell.stock += cycles * per;
        cell.progress -= cycles * ms;
        return true;
    }

    Game.Production = {
        update: function (now) {
            var clock = Game.State.data.production;
            var elapsed = now - clock.lastAt;

            if (elapsed <= 0) {
                clock.lastAt = now;
                return;
            }

            elapsed = Math.min(elapsed, Game.Config.production.catchUpMs);
            clock.lastAt = now;

            var changed = [];
            Game.Grid.built().forEach(function (cell) {
                if (step(cell, elapsed)) changed.push(cell);
            });

            if (!changed.length) return;

            Game.State.touch();
            changed.forEach(function (cell) {
                Game.Events.emit("cell:changed", { cell: cell });
            });
        },

        /** Seconds between lots here, for the buildings page. */
        secondsPer: function (cell, building) {
            return cycleMs(cell, building) / 1000;
        }
    };
})();
