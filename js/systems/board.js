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
     * Spreads outwards from a square gathering its own kind, in the order it
     * meets them, and stops the moment it has enough. Nothing beyond that is
     * taken: three alike touching is one join and a piece left over, not one
     * greedy join that spends the spare for nothing extra.
     *
     * Gives back null if there are not enough to join at all.
     */
    function reach(start, need) {
        var found = [start];
        var seen = {};
        var queue = [start];
        seen[start.id] = true;

        while (queue.length && found.length < need) {
            var cell = queue.shift();

            // up, then across, and only then down — the square below was
            // already looked at on the way up, so it is never the one kept
            var around = [
                at(cell.x, cell.y - 1),
                at(cell.x - 1, cell.y),
                at(cell.x + 1, cell.y),
                at(cell.x, cell.y + 1)
            ];

            for (var i = 0; i < around.length && found.length < need; i++) {
                var other = around[i];
                if (!other || seen[other.id]) continue;
                if (other.piece !== start.piece) continue;

                seen[other.id] = true;
                found.push(other);
                queue.push(other);
            }
        }

        return found.length === need ? found : null;
    }

    /**
     * The next group ready to join, searched from the ground up so the
     * settlement resolves from the bottom like it would if you were building
     * it. The first square found is the lowest and leftmost, so that is the
     * one left holding what they become — which is also where gravity would
     * have put it.
     */
    function nextGroup() {
        var need = Game.Config.game.mergeAt || 2;

        for (var y = rows - 1; y >= 0; y--) {
            for (var x = 0; x < cols; x++) {
                var cell = at(x, y);
                if (!cell.piece) continue;

                var piece = Game.Pieces.byId(cell.piece);
                if (!piece || !piece.next) continue;

                var taking = reach(cell, need);
                if (taking) {
                    return { keep: cell, eat: taking, piece: piece };
                }
            }
        }
        return null;
    }

    /**
     * A row or column with nothing missing.
     *
     * Columns are the interesting one: gravity packs the bottom, so a full
     * row turns up on its own, but a full column means you stacked all the
     * way to the ceiling — one square from being unable to drop there at all.
     * Paying out for that is paying out for the risk.
     */
    function fullLine() {
        var settings = Game.Config.game;
        var x, y, line, full;

        if (settings.clearColumns) {
            for (x = 0; x < cols; x++) {
                line = [];
                full = true;
                for (y = 0; y < rows; y++) {
                    var down = at(x, y);
                    // rubble spoils the column it lands in: it cannot merge
                    // and it cannot be cashed, so the square is gone for good.
                    // Without this the clear sweeps rubble away too, and a
                    // valve that opens whenever the board is full can never
                    // be overwhelmed — no run would ever end.
                    if (!down.piece || down.piece === "rubble") {
                        full = false;
                        break;
                    }
                    line.push(down);
                }
                if (full) return line;
            }
        }

        if (settings.clearRows) {
            for (y = 0; y < rows; y++) {
                line = [];
                full = true;
                for (x = 0; x < cols; x++) {
                    var across = at(x, y);
                    if (!across.piece) { full = false; break; }
                    line.push(across);
                }
                if (full) return line;
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

        while (guard++ < 200) {
            var pair = nextGroup();

            if (pair) {
                pair.eat.forEach(function (cell) {
                    if (cell !== pair.keep) cell.piece = null;
                });
                pair.keep.piece = pair.piece.next;

                var grown = Game.Pieces.byId(pair.piece.next);
                steps.push({
                    type: "merge",
                    cell: pair.keep,
                    piece: grown.id,
                    from: pair.piece.id,
                    took: pair.eat.length,
                    points: grown.points || 0,
                    board: snapshot()
                });

                /* The top of the ladder has nothing above it, so left on the
                   board it is dead weight forever. Instead it is cashed in on
                   the spot: paid out at a premium and carried off, freeing the
                   square. Without this the endgame is nothing but disposing of
                   vaults, and no amount of pressure ends a run — a full column
                   clears, so pressure only makes clears more frequent. */
                if (!grown.next && Game.Config.game.cashTop) {
                    pair.keep.piece = null;
                    steps.push({
                        type: "cash",
                        cells: [pair.keep.id],
                        piece: grown.id,
                        points: Math.round(
                            (grown.points || 0) * Game.Config.game.cashBonus
                        ),
                        board: snapshot()
                    });
                }
            } else {
                var line = fullLine();
                if (!line) break;

                var worth = 0;
                var ids = line.map(function (cell) {
                    var piece = Game.Pieces.byId(cell.piece);
                    worth += (piece && piece.points) || 0;
                    cell.piece = null;
                    return cell.id;
                });

                steps.push({
                    type: "clear",
                    cells: ids,
                    points: Math.round(worth * Game.Config.game.clearBonus),
                    board: snapshot()
                });
            }

            var after = fall();
            if (after.length) {
                steps.push({ type: "fall", moves: after, board: snapshot() });
            }
        }

        return steps;
    }

    function report(steps) {
        var made = steps.filter(function (step) {
            return step.type === "merge";
        });

        // clears pay too, but they make nothing, so they are not "made"
        var points = steps.reduce(function (sum, step) {
            return sum + (step.points || 0);
        }, 0);

        return { steps: steps, made: made, points: points };
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
