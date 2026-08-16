window.Game = window.Game || {};

/**
 * spawner.js — makes wild resources appear on open ground.
 *
 * One attempt fires every Config.spawner.intervalMs and lands on a random
 * plot that is free to sprout, so a resource can come back where it was taken
 * from or anywhere else. What grows depends mostly on the terrain: trees in
 * the woods, rock on the outcrops, berries in the meadow.
 *
 * Plots carrying a building never sprout. Plots resting after a harvest or a
 * demolition become eligible again when their timer runs out.
 */
(function () {
    function maxNodes() {
        var open = Game.Grid.cells().length - Game.Grid.countBuildings();
        return Math.max(1, Math.round(open * Game.Config.spawner.maxPlotRatio));
    }

    function place(cell, resource) {
        cell.resource = resource.id;
        cell.cooldown = null;
        Game.State.touch();
        Game.Events.emit("cell:changed", { cell: cell });
        Game.Events.emit("resource:spawned", {
            cell: cell,
            resourceId: resource.id
        });
    }

    /** One spawn roll at time `at`. Returns true if something appeared. */
    function attempt(at) {
        if (Game.Grid.countResources() >= maxNodes()) return false;

        var options = Game.Grid.sproutable(at);
        if (!options.length) return false;

        var cell = options[Math.floor(Math.random() * options.length)];
        place(cell, Game.Resources.randomFor(cell.terrain));
        return true;
    }

    /** Drops rest timers that have run out. */
    function clearFinishedRests(now) {
        Game.Grid.cells().forEach(function (cell) {
            if (cell.cooldown && now >= cell.cooldown.until) {
                Game.Grid.clearRest(cell);
                Game.State.touch();
            }
        });
    }

    Game.Spawner = {
        /**
         * Runs every pending spawn attempt up to `now`. The schedule is
         * timestamp based, so a page that was closed — or a trip to another
         * page of the game — is caught up on return, capped so that a week
         * away does not run a million rolls.
         */
        update: function (now) {
            var spawner = Game.State.data.spawner;
            var interval = Game.Config.spawner.intervalMs;

            if (!spawner.seeded) {
                this.seed(now);
                spawner.seeded = true;
                spawner.nextSpawnAt = now + interval;
            }

            var oldest = now - Game.Config.spawner.catchUpMs;
            if (spawner.nextSpawnAt < oldest) spawner.nextSpawnAt = oldest;

            while (spawner.nextSpawnAt <= now) {
                attempt(spawner.nextSpawnAt);
                spawner.nextSpawnAt += interval;
            }

            clearFinishedRests(now);
        },

        /** New ground starts with a few things already growing on it. */
        seed: function (now) {
            for (var i = 0; i < Game.Config.spawner.seedCount; i++) {
                attempt(now);
            }
        }
    };
})();
