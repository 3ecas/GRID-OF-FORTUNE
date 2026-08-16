window.Game = window.Game || {};

/**
 * board.js — the grid, the falling, and the merging.
 *
 * You drop a piece into a column and it falls to the ground. Two of the same
 * thing touching become the next one up, whatever is above drops into the gap,
 * and that can set off another merge — so one piece can start a long chain.
 *
 * Everything falling is what keeps the board solid. A merge takes two squares
 * and gives back one, so without gravity every merge leaves a hole exactly
 * where the twin stood, and the board settles into scattered pieces with a gap
 * between each one.
 *
 * A move does not come back as one finished board. It comes back as the
 * sequence it actually happened in — fall, join, fall, join — each with a
 * picture of the board at that moment, so the view can play it out in order
 * instead of showing the answer straight away.
 */
(function () {
    var cells = [];
    var cols = 0;
    var rows = 0;

    function at(x, y) {
        if (x < 0 || y < 0 || x >= cols || y >= rows) return null;
        return cells[y * cols + x];
    }

    function snapshot() {
        return cells.map(function (cell) {
            return cell.piece;
        });
    }

    /** Packs every column down to the ground, reporting what moved where. */
    function fall() {
        var moves = [];

        for (var x = 0; x < cols; x++) {
            var stack = [];
            for (var y = rows - 1; y >= 0; y--) {
                var cell = at(x, y);
                if (cell.piece) {
                    stack.push({ piece: cell.piece, id: cell.id, y: cell.y });
                }
            }

            var i = 0;
            for (var y2 = rows - 1; y2 >= 0; y2--, i++) {
                var target = at(x, y2);
                var item = i < stack.length ? stack[i] : null;

                target.piece = item ? item.piece : null;

                if (item && item.id !== target.id) {
                    moves.push({
                        to: target.id,
                        distance: target.y - item.y
                    });
                }
            }
        }

        return moves;
    }

    /**
     * The next pair to join, searched from the ground up so the settlement
     * resolves from the bottom like it would if you were building it.
     */
    function nextPair() {
        for (var y = rows - 1; y >= 0; y--) {
            for (var x = 0; x < cols; x++) {
                var cell = at(x, y);
                if (!cell.piece) continue;

                var piece = Game.Pieces.byId(cell.piece);
                if (!piece || !piece.next) continue;

                var around = [at(x, y - 1), at(x - 1, y), at(x + 1, y)];
                for (var i = 0; i < around.length; i++) {
                    var other = around[i];
                    if (other && other.piece === cell.piece) {
                        return { keep: cell, eat: other, piece: piece };
                    }
                }
            }
        }
        return null;
    }

    /** Runs the board to a standstill, keeping every beat in order. */
    function resolve(steps) {
        var guard = 0;

        var first = fall();
        if (first.length) {
            steps.push({ type: "fall", moves: first, board: snapshot() });
        }

        while (guard++ < 120) {
            var pair = nextPair();
            if (!pair) break;

            pair.eat.piece = null;
            pair.keep.piece = pair.piece.next;

            var grown = Game.Pieces.byId(pair.piece.next);
            steps.push({
                type: "merge",
                cell: pair.keep,
                piece: grown.id,
                from: pair.piece.id,
                points: grown.points || 0,
                board: snapshot()
            });

            var after = fall();
            if (after.length) {
                steps.push({ type: "fall", moves: after, board: snapshot() });
            }
        }

        return steps;
    }

    /** Pulls the merges out of a sequence, for scoring and the album. */
    function madeIn(steps) {
        return steps.filter(function (step) {
            return step.type === "merge";
        });
    }

    function report(steps) {
        var made = madeIn(steps);
        return {
            steps: steps,
            made: made,
            points: made.reduce(function (sum, step) {
                return sum + step.points;
            }, 0)
        };
    }

    Game.Board = {
        size: function () {
            return { cols: cols, rows: rows };
        },

        cells: function () {
            return cells;
        },

        byId: function (id) {
            return cells[id] || null;
        },

        at: at,
        snapshot: snapshot,

        empties: function () {
            return cells.filter(function (cell) {
                return !cell.piece;
            });
        },

        isFull: function () {
            return this.empties().length === 0;
        },

        density: function () {
            return 1 - this.empties().length / cells.length;
        },

        /** The best thing standing right now. */
        highest: function () {
            var best = null;
            cells.forEach(function (cell) {
                if (!cell.piece) return;
                var piece = Game.Pieces.byId(cell.piece);
                if (!best || piece.tier > best.tier) best = piece;
            });
            return best;
        },

        /** Where a piece dropped into this column would come to rest. */
        landing: function (column) {
            if (column < 0 || column >= cols) return null;
            for (var y = rows - 1; y >= 0; y--) {
                var cell = at(column, y);
                if (!cell.piece) return cell;
            }
            return null;
        },

        build: function (width, height) {
            cols = width;
            rows = height;
            cells = [];
            for (var y = 0; y < rows; y++) {
                for (var x = 0; x < cols; x++) {
                    cells.push({ id: cells.length, x: x, y: y, piece: null });
                }
            }
            return cells;
        },

        /** Some ground already laid, so the first drop has something to land on. */
        seed: function (count, highestTier) {
            for (var i = 0; i < count; i++) {
                if (!this.empties().length) break;
                var column = Math.floor(Math.random() * cols);
                var spot = this.landing(column);
                if (!spot) continue;
                spot.piece = Game.Pieces.randomFor(highestTier || 1).id;
            }
            resolve([]);
        },

        /** Lets the board settle after something changed it from outside. */
        settle: function () {
            return report(resolve([]));
        },

        /** The only move: drop a piece into a column. */
        drop: function (column, pieceId) {
            var spot = this.landing(column);
            if (!spot) return null;

            spot.piece = pieceId;

            // the piece coming in from above the board is the first beat
            var steps = [
                {
                    type: "fall",
                    moves: [{ to: spot.id, distance: spot.y + 1 }],
                    board: snapshot()
                }
            ];

            var out = report(resolve(steps));
            out.cell = spot;
            return out;
        },

        /**
         * Brings anything left below the rungs still being dealt up to the
         * bottom of them.
         *
         * Without this, a piece can be buried under a pile it can never merge
         * with: you only ever drop from the top, so the only twin it could
         * meet would have to be dealt — and once the hand has moved on, that
         * twin is never coming. The square is dead for the rest of the game.
         *
         * So the countryside keeps growing on its own. Nothing on the board is
         * ever below what is being dealt, which means every square always has
         * a way out.
         */
        growUpTo: function (tier) {
            var grown = 0;

            cells.forEach(function (cell) {
                if (!cell.piece) return;
                var piece = Game.Pieces.byId(cell.piece);

                while (piece && piece.tier < tier && piece.next) {
                    cell.piece = piece.next;
                    piece = Game.Pieces.byId(piece.next);
                    grown++;
                }
            });

            return grown;
        }
    };
})();
