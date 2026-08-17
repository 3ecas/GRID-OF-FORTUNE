window.Game = window.Game || {};

(function () {
    var config = null;
    var state = null;

    function settings() {
        return config || (config = Game.Config.game);
    }

    function readSave() {
        var save = Game.Storage.read(settings().saveKey) || {};
        return {
            best: save.best || 0,
            found: Array.isArray(save.found) ? save.found : []
        };
    }

    function writeSave() {
        Game.Storage.write(settings().saveKey, {
            best: state.best,
            found: state.found
        });
    }

    function fillHand() {
        while (state.hand.length < settings().handSize) {
            state.hand.push(Game.Pieces.randomFor(state.highest));
        }
    }

    function rubbleChance() {
        var s = settings();
        var over = state.highest - s.rubbleFrom + 1;
        if (over <= 0) return 0;
        return Math.min(s.rubbleMost, over * s.rubbleRise);
    }

    function rubbleNow() {
        return Math.random() < rubbleChance();
    }

    function seam() {
        var table = settings().falls;
        var found = null;

        for (var i = 0; i < table.length; i++) {
            var level = table[i];

            if (typeof level.after === "number") {
                if (state.placed >= level.after) found = level;
                continue;
            }

            var piece = Game.Pieces.byId(level.at);
            if (piece && state.highest >= piece.tier) found = level;
        }

        return found;
    }

    function fallGap() {
        var level = seam();
        return level ? level.every : Infinity;
    }

    function fallCount() {
        var level = seam();
        return level ? level.count : 0;
    }

    function rain() {
        var count = fallCount();
        var made = [];
        var steps = [];
        var points = 0;
        var dirt = 0;

        for (var i = 0; i < count; i++) {
            var open = [];
            for (var col = 0; col < Game.Board.size().cols; col++) {
                if (Game.Board.landing(col)) open.push(col);
            }
            if (!open.length) break;

            var where = open[Math.floor(Math.random() * open.length)];
            var spoilt = dirt < settings().rubbleCap && rubbleNow();
            if (spoilt) dirt++;

            var piece = spoilt
                ? Game.Pieces.rubble
                : Game.Pieces.randomFor(state.highest);
            var result = Game.Board.drop(where, piece.id);
            if (!result) continue;

            steps = steps.concat(result.steps);
            made = made.concat(result.made);
            points += result.points;
        }

        if (!steps.length) return;

        Game.Events.emit("game:rain", { steps: steps, count: count });
        absorb({ made: made, points: points }, 0);
    }

    function grownTo(piece, tier) {
        while (piece && piece.tier < tier && piece.next) {
            piece = Game.Pieces.byId(piece.next);
        }
        return piece;
    }

    function absorb(result, depth) {
        state.score += result.points;
        state.tally += result.made.length;
        record(result.made);
        raise(result.made, depth || 0);
    }

    function checkSeam() {
        var now = seam();
        if (now === state.seam) return;

        state.seam = now;
        Game.Events.emit("game:seam", { level: now });
    }

    function raise(made, depth) {
        var before = Game.Pieces.dealing(state.highest)[0];

        made.forEach(function (step) {
            var piece = Game.Pieces.byId(step.piece);
            if (piece.tier > state.highest) state.highest = piece.tier;
        });

        checkSeam();

        var after = Game.Pieces.dealing(state.highest)[0];
        if (after === before || depth > 12) return;

        Game.Events.emit("game:dealing", { lowest: after });

        state.hand = state.hand.map(function (piece) {
            return grownTo(piece, after.tier);
        });
        Game.Events.emit("game:hand", {});

        var grown = Game.Board.growUpTo(after.tier);
        if (!grown) return;

        var settled = Game.Board.settle();
        Game.Events.emit("game:grown", { grown: grown, settled: settled });
        absorb(settled, depth + 1);
    }

    function record(made) {
        var fresh = [];

        made.forEach(function (step) {
            if (state.found.indexOf(step.piece) !== -1) return;
            state.found.push(step.piece);
            fresh.push(step.piece);
        });

        if (!fresh.length) return;
        writeSave();
        Game.Events.emit("game:found", { pieces: fresh });
    }

    function finish(reason) {
        if (!state.running) return;
        state.running = false;

        var record = state.score > state.best;
        if (record) state.best = state.score;
        writeSave();

        var top = Game.Pieces.top;
        var crowns = Game.Board.cells().filter(function (cell) {
            return cell.piece === top.id;
        }).length;

        Game.Events.emit("game:over", {
            reason: reason,
            score: state.score,
            best: state.best,
            record: record,
            made: state.tally,
            moves: state.placed,
            crowns: crowns,
            highest: Game.Board.highest()
        });
    }

    Game.Round = {
        get: function () {
            return state;
        },

        found: function (pieceId) {
            return !!state && state.found.indexOf(pieceId) !== -1;
        },

        start: function () {
            var save = state ? state : readSave();

            Game.Board.build(settings().cols, settings().rows);
            Game.Board.seed(settings().seedPieces, 1);

            state = {
                running: true,
                score: 0,
                placed: 0,
                tally: 0,
                highest: 1,
                sinceFall: 0,
                seam: null,
                hand: [],
                picked: 0,
                best: save.best,
                found: save.found
            };
            state.seam = seam();
            fillHand();

            Game.Events.emit("game:started", {});
        },

        pick: function (index) {
            if (!state || index < 0 || index >= state.hand.length) return;
            state.picked = index;
            Game.Events.emit("game:hand", {});
        },

        cycle: function (step) {
            if (!state || !state.running || state.hand.length < 2) return;
            var count = state.hand.length;
            this.pick((state.picked + step + count) % count);
        },

        play: function (column) {
            if (!state || !state.running) return null;

            var index = Math.min(state.picked, state.hand.length - 1);
            var piece = state.hand[index];
            if (!piece) return null;

            var result = Game.Board.drop(column, piece.id);
            if (!result) return null;

            state.hand.splice(index, 1);
            state.picked = 0;
            state.placed += 1;
            checkSeam();

            Game.Events.emit("board:steps", { steps: result.steps });

            absorb(result, 0);
            fillHand();

            state.sinceFall += 1;
            if (state.sinceFall >= fallGap()) {
                state.sinceFall = 0;
                rain();
            }

            Game.Events.emit("game:placed", { result: result });
            Game.Events.emit("game:hand", {});

            if (Game.Board.isFull()) finish("full");

            return result;
        },

        give: function () {
            finish("full");
        }
    };
})();
