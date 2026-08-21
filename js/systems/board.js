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
                    stack.push({
                        piece: cell.piece,
                        fuse: cell.fuse || 0,
                        id: cell.id,
                        y: cell.y
                    });
                }
            }

            var i = 0;
            for (var y2 = rows - 1; y2 >= 0; y2--, i++) {
                var target = at(x, y2);
                var item = i < stack.length ? stack[i] : null;

                target.piece = item ? item.piece : null;
                target.fuse = item ? item.fuse : 0;

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

    /* Dynamite is set off the same way rubble is broken: by a merge landing
       against it. */
    function fuseLit(cells) {
        var lit = [];
        var seen = {};

        cells.forEach(function (cell) {
            [[0, -1], [0, 1], [-1, 0], [1, 0]].forEach(function (step) {
                var near = at(cell.x + step[0], cell.y + step[1]);
                if (!near || seen[near.id]) return;
                if (near.piece !== Game.Pieces.dynamite.id) return;

                seen[near.id] = true;
                lit.push(near);
            });
        });

        return lit;
    }

    /* Lodestones a merge has landed against. They are lifted off the board
       here; what they draw out waits on the player choosing a kind. */
    function stonesWoken(cells) {
        var woken = [];
        var seen = {};

        cells.forEach(function (cell) {
            [[0, -1], [0, 1], [-1, 0], [1, 0]].forEach(function (step) {
                var near = at(cell.x + step[0], cell.y + step[1]);
                if (!near || seen[near.id]) return;
                if (near.piece !== Game.Pieces.lodestone.id) return;

                seen[near.id] = true;
                woken.push(near);
            });
        });

        return woken;
    }

    /* Everything in the eight squares around a lit stick goes, the stick with
       it. A stick caught in another's blast goes off in turn, so a line of
       them runs. */
    function blast(sticks) {
        var gone = {};
        var fired = {};
        var queue = sticks.slice();

        while (queue.length) {
            var stick = queue.shift();
            if (fired[stick.id]) continue;
            fired[stick.id] = true;
            gone[stick.id] = stick;

            for (var dx = -1; dx <= 1; dx++) {
                for (var dy = -1; dy <= 1; dy++) {
                    if (!dx && !dy) continue;

                    var near = at(stick.x + dx, stick.y + dy);
                    if (!near || !near.piece) continue;

                    gone[near.id] = near;
                    if (near.piece === Game.Pieces.dynamite.id && !fired[near.id]) {
                        queue.push(near);
                    }
                }
            }
        }

        return Object.keys(gone).map(function (id) {
            return gone[id];
        });
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

    var owed = 0;

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

                var over = Game.Config.game;
                var grown = Game.Pieces.byId(pair.piece.next);

                /* how many pieces the run gives back — one, unless the
                   surplus is kept (see surplusStays in config) */
                var makes = 1;
                if (over.surplusStays) {
                    var need = over.mergeAt || 2;
                    makes = Math.max(1, pair.eat.length - (need - 1));
                    if (over.surplusMost > 0) {
                        makes = Math.min(makes, over.surplusMost);
                    }
                }

                /* eat[0] is the cell the run was found from, and the rest are
                   in breadth-first order out from it, so the kept pieces stay
                   packed together where the run began */
                pair.eat.forEach(function (cell, i) {
                    cell.piece = i < makes ? grown.id : null;
                });

                var times = Math.min(
                    over.chainMost,
                    1 + (chain - 1) * over.chainStep
                );

                steps.push({
                    type: "merge",
                    cell: pair.keep,
                    cells: pair.eat.slice(0, makes).map(function (cell) {
                        return cell.id;
                    }),
                    piece: grown.id,
                    from: pair.piece.id,
                    took: pair.eat.length,
                    fuse: fuse,
                    lit: lit,
                    chain: chain,
                    times: times,
                    makes: makes,
                    points: Math.round(
                        (grown.points || 0) *
                            (over.surplusPays === false ? 1 : makes) *
                            times
                    ),
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

                var woken = stonesWoken(pair.eat);
                if (woken.length) {
                    owed += woken.length;
                    steps.push({
                        type: "wake",
                        cells: woken.map(function (cell) {
                            cell.piece = null;
                            cell.fuse = 0;
                            return cell.id;
                        }),
                        points: 0,
                        board: snapshot()
                    });
                }

                var lit = fuseLit(pair.eat);
                if (lit.length) {
                    var salvage = 0;
                    var wrecked = blast(lit).map(function (cell) {
                        var was = Game.Pieces.byId(cell.piece);
                        salvage += (was && was.points) || 0;
                        cell.piece = null;
                        return cell.id;
                    });

                    steps.push({
                        type: "blast",
                        cells: wrecked,
                        points: Math.round(salvage * (over.blastPays || 0)),
                        board: snapshot()
                    });
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
            owed = 0;
            cells = [];
            for (var y = 0; y < rows; y++) {
                for (var x = 0; x < cols; x++) {
                    cells.push({
                        id: cells.length,
                        x: x,
                        y: y,
                        piece: null,
                        fuse: 0
                    });
                }
            }
            return cells;
        },

        /* Would dropping this piece into this column complete a run? Used by
           the opening, which lays the board out without setting anything off. */
        /* How many lodestone choices the board is waiting on. */
        owes: function () {
            return owed;
        },

        /* Draw every piece of one kind off the board. */
        sweep: function (pieceId) {
            if (owed <= 0) return null;
            owed -= 1;

            var worth = 0;
            var pulled = [];

            cells.forEach(function (cell) {
                if (cell.piece !== pieceId) return;
                var was = Game.Pieces.byId(cell.piece);
                worth += (was && was.points) || 0;
                cell.piece = null;
                cell.fuse = 0;
                pulled.push(cell.id);
            });

            if (!pulled.length) return report(resolve([]));

            return report(
                resolve([
                    {
                        type: "clear",
                        cells: pulled,
                        points: Math.round(
                            worth * (Game.Config.game.blastPays || 0)
                        ),
                        board: snapshot()
                    }
                ])
            );
        },

        /* One drop's worth of burning. Any stick that reaches the end of its
           fuse goes off where it stands, which is what stops a stick stranded
           among unmergeable pieces from becoming one of them. */
        burn: function () {
            var limit = Game.Config.game.dynamiteFuse || 0;
            if (!limit) return null;

            var stick = Game.Pieces.dynamite.id;
            var lit = [];

            cells.forEach(function (cell) {
                if (cell.piece !== stick) return;
                cell.fuse = (cell.fuse || 0) + 1;
                if (cell.fuse >= limit) lit.push(cell);
            });

            if (!lit.length) return null;

            var salvage = 0;
            var wrecked = blast(lit).map(function (cell) {
                var was = Game.Pieces.byId(cell.piece);
                salvage += (was && was.points) || 0;
                cell.piece = null;
                cell.fuse = 0;
                return cell.id;
            });

            return report(
                resolve([
                    {
                        type: "blast",
                        cells: wrecked,
                        points: Math.round(
                            salvage * (Game.Config.game.blastPays || 0)
                        ),
                        board: snapshot()
                    }
                ])
            );
        },

        /* How close a stick is to going off, 0 to 1. The view uses it to
           show the fuse burning down. */
        fuseAt: function (id) {
            var limit = Game.Config.game.dynamiteFuse || 0;
            var cell = cells[id];
            if (!limit || !cell || cell.piece !== Game.Pieces.dynamite.id) return 0;
            return Math.min(1, (cell.fuse || 0) / limit);
        },

        /* Is the landing spot in this column at least `gap` squares clear of
           every piece of this kind? Chebyshev, so diagonals count — two
           sticks touching corner to corner is still two sticks together. */
        spacedFrom: function (column, pieceId, gap) {
            var spot = this.landing(column);
            if (!spot) return false;
            if (!gap) return true;

            for (var i = 0; i < cells.length; i++) {
                var cell = cells[i];
                if (cell.piece !== pieceId) continue;
                var dx = Math.abs(cell.x - spot.x);
                var dy = Math.abs(cell.y - spot.y);
                if (Math.max(dx, dy) < gap) return false;
            }
            return true;
        },

        wouldJoin: function (column, pieceId) {
            var spot = this.landing(column);
            if (!spot) return false;

            var piece = Game.Pieces.byId(pieceId);
            if (!piece || !piece.next) return false;

            var was = spot.piece;
            spot.piece = pieceId;
            var joined = reach(spot, Game.Config.game.mergeAt || 2);
            spot.piece = was;

            return !!joined;
        },

        load: function (snapshot) {
            if (!Array.isArray(snapshot) || snapshot.length !== cells.length) {
                return false;
            }
            cells.forEach(function (cell, i) {
                var id = snapshot[i];
                cell.piece = id && Game.Pieces.byId(id) ? id : null;
            });
            return true;
        },

        settle: function () {
            return report(resolve([]));
        },

        drop: function (column, pieceId) {
            var spot = this.landing(column);
            if (!spot) return null;

            spot.piece = pieceId;
            spot.fuse = 0;

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
