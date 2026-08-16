window.Game = window.Game || {};

/**
 * round.js — a game of Metropolis.
 *
 * No clock and nothing to spend: you place pieces, things join up, and the
 * board slowly fills. It ends when there is nowhere left to put anything.
 *
 * Two things are written down between games — the best score, and every kind
 * of thing you have ever managed to make.
 */
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

    /** Walks a piece up the ladder until it reaches this rung. */
    function grownTo(piece, tier) {
        while (piece && piece.tier < tier && piece.next) {
            piece = Game.Pieces.byId(piece.next);
        }
        return piece;
    }

    /** Takes what a settling produced: points, album, and the hand moving up. */
    function absorb(result, depth) {
        state.score += result.points;
        state.tally += result.made.length;
        record(result.made);
        raise(result.made, depth || 0);
    }

    /**
     * Notices when the game has climbed far enough that the bottom rung stops
     * being dealt — the moment saplings give way to trees — and brings the
     * stragglers on the board up with it so nothing is left stranded.
     */
    function raise(made, depth) {
        var before = Game.Pieces.dealing(state.highest)[0];

        made.forEach(function (step) {
            var piece = Game.Pieces.byId(step.piece);
            if (piece.tier > state.highest) state.highest = piece.tier;
        });

        var after = Game.Pieces.dealing(state.highest)[0];
        if (after === before || depth > 12) return;

        Game.Events.emit("game:dealing", { lowest: after });

        // what you are holding grows up too, or you could plant a sapling
        // onto a board that has left saplings behind
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

    /** Records anything made for the first time ever. */
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

        Game.Events.emit("game:over", {
            reason: reason, // "built" if you got to the top, "full" if not
            score: state.score,
            best: state.best,
            record: record,
            made: state.tally,
            moves: state.placed,
            highest: Game.Board.highest()
        });
    }

    Game.Round = {
        get: function () {
            return state;
        },

        /** Everything made this game, and everything ever made. */
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
                tally: 0, // how many things joined up this game
                highest: 1, // the best rung reached, which sets what is dealt
                hand: [],
                picked: 0,
                best: save.best,
                found: save.found
            };
            fillHand();

            Game.Events.emit("game:started", {});
        },

        /** Which of the waiting pieces is in hand. */
        pick: function (index) {
            if (!state || index < 0 || index >= state.hand.length) return;
            state.picked = index;
            Game.Events.emit("game:hand", {});
        },

        /** Wheel the hand along, wrapping round. */
        cycle: function (step) {
            if (!state || !state.running || state.hand.length < 2) return;
            var count = state.hand.length;
            this.pick((state.picked + step + count) % count);
        },

        /** The only move: drop the piece in hand into a column. */
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
            absorb(result, 0);
            fillHand();

            Game.Events.emit("game:placed", { result: result });
            Game.Events.emit("game:hand", {});

            // the top of the ladder is the point of the whole thing
            if (state.highest >= Game.Pieces.list.length) finish("built");
            else if (Game.Board.isFull()) finish("full");

            return result;
        },

        give: function () {
            finish("full");
        }
    };
})();
