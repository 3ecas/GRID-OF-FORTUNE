window.Game = window.Game || {};

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

    function reach(start, need) {
        var found = [start];
        var seen = {};
        var queue = [start];
        seen[start.id] = true;

        while (queue.length) {
            var cell = queue.shift();

            var around = [
                at(cell.x, cell.y - 1),
                at(cell.x - 1, cell.y),
                at(cell.x + 1, cell.y),
                at(cell.x, cell.y + 1)
            ];

            for (var i = 0; i < around.length; i++) {
                var other = around[i];
                if (!other || seen[other.id]) continue;
                if (other.piece !== start.piece) continue;

                seen[other.id] = true;
                found.push(other);
                queue.push(other);
            }
        }

        return found.length >= need ? found : null;
    }

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

    function rubbleAround(cells) {
        var hit = [];
        var seen = {};

        cells.forEach(function (cell) {
            [[0, -1], [0, 1], [-1, 0], [1, 0]].forEach(function (step) {
                var near = at(cell.x + step[0], cell.y + step[1]);
                if (!near || seen[near.id]) return;
                if (near.piece !== "rubble") return;

                seen[near.id] = true;
                hit.push(near);
            });
        });

        return hit;
    }

    function fullLine() {
        var settings = Game.Config.game;
        var x, y, line, full;

        if (settings.clearColumns) {
            for (x = 0; x < cols; x++) {
                line = [];
                full = true;
                for (y = 0; y < rows; y++) {
                    var down = at(x, y);

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

    function resolve(steps) {
        var guard = 0;

        var chain = 0;

        var first = fall();
        if (first.length) {
            steps.push({ type: "fall", moves: first, board: snapshot() });
        }

        while (guard++ < 200) {
            var pair = nextGroup();

            if (pair) {
                chain++;

                var lit = snapshot();
                var fuse = pair.eat
                    .slice()
                    .reverse()
                    .map(function (cell) {
                        return cell.id;
                    });

                pair.eat.forEach(function (cell) {
                    if (cell !== pair.keep) cell.piece = null;
                });
                pair.keep.piece = pair.piece.next;

                var grown = Game.Pieces.byId(pair.piece.next);
                var over = Game.Config.game;
                var times = Math.min(
                    over.chainMost,
                    1 + (chain - 1) * over.chainStep
                );

                steps.push({
                    type: "merge",
                    cell: pair.keep,
                    piece: grown.id,
                    from: pair.piece.id,
                    took: pair.eat.length,
                    fuse: fuse,
                    lit: lit,
                    chain: chain,
                    times: times,
                    points: Math.round((grown.points || 0) * times),
                    board: snapshot()
                });

                if (Game.Config.game.rubbleBreaks) {
                    var broken = rubbleAround(pair.eat);
                    if (broken.length) {
                        steps.push({
                            type: "clear",
                            cells: broken.map(function (cell) {
                                cell.piece = null;
                                return cell.id;
                            }),
                            points: 0,
                            board: snapshot()
                        });
                    }
                }

                if (!grown.next && Game.Config.game.cashTop) {
                    pair.keep.piece = Game.Config.game.cashLeaves
                        ? Game.Pieces.rubble.id
                        : null;

                    steps.push({
                        type: "cash",
                        cells: [pair.keep.id],
                        piece: grown.id,
                        spent: Game.Config.game.cashLeaves,
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

        highest: function () {
            var best = null;
            cells.forEach(function (cell) {
                if (!cell.piece) return;
                var piece = Game.Pieces.byId(cell.piece);
                if (!best || piece.tier > best.tier) best = piece;
            });
            return best;
        },

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

        settle: function () {
            return report(resolve([]));
        },

        drop: function (column, pieceId) {
            var spot = this.landing(column);
            if (!spot) return null;

            spot.piece = pieceId;

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
