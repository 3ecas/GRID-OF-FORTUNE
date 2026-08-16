window.Game = window.Game || {};

/**
 * comfort.js — how pleasant it is to live on a plot.
 *
 * The only rule in the game that pushes back on placement, and it is about
 * *where* things go, never about leaving land empty. Homes like homes, wells,
 * gardens and markets. They do not like the sawmill next door. Follow it and
 * the map sorts itself into an industrial edge and a residential middle, which
 * is exactly what makes a grid start looking like a city.
 *
 * Comfort is a plain number of points. Homes turn it into a coin multiplier.
 */
(function () {
    function settings() {
        return Game.Config.comfort;
    }

    Game.Comfort = {
        /** Points for one home, from the eight plots around it. */
        scoreFor: function (cell) {
            var config = settings();
            var homeBonus = 0;
            var score = 0;

            Game.Grid.around(cell).forEach(function (neighbour) {
                if (!neighbour.building) return;
                var building = Game.Buildings.byId(neighbour.building);
                if (!building) return;

                if (building.kind === "home") {
                    homeBonus += config.neighbourHome;
                    return;
                }
                if (building.comfort) score += building.comfort;
            });

            return score + Math.min(homeBonus, config.maxHomeBonus);
        },

        /** Comfort points turned into a rate multiplier. */
        multiplier: function (points) {
            var config = settings();
            var value = 1 + points * config.step;
            return Math.min(config.max, Math.max(config.min, value));
        },

        multiplierFor: function (cell) {
            return this.multiplier(cell.comfort || 0);
        },

        /** Recalculates every home. Cheap, so it runs on any build change. */
        recompute: function () {
            var self = this;
            Game.Grid.built("home").forEach(function (cell) {
                cell.comfort = self.scoreFor(cell);
            });
            Game.State.touch();
        },

        /** Average comfort across the town, for the city page. */
        average: function () {
            var homes = Game.Grid.built("home");
            if (!homes.length) return 0;
            var total = homes.reduce(function (sum, cell) {
                return sum + (cell.comfort || 0);
            }, 0);
            return total / homes.length;
        },

        residents: function () {
            return Game.Grid.built("home").reduce(function (sum, cell) {
                var building = Game.Buildings.byId(cell.building);
                return sum + ((building && building.residents) || 0);
            }, 0);
        }
    };
})();
