window.Game = window.Game || {};

(function () {
    var host = null;
    var tiles = [];
    var shown = [];
    var hovered = -1;
    var busy = false;
    var pointer = { x: 0, y: 0, known: false };
    var seenThisDrop = {};
    var pending = [];

    var FALL_MS = 140;
    var MERGE_MS = 125;
    var CLEAR_MS = 240;
    var FUSE_MS = 58;

    function build() {
        var size = Game.Board.size();
        host.style.setProperty("--cols", size.cols);
        host.innerHTML = "";
        tiles = [];
        shown = [];

        Game.Board.cells().forEach(function (cell) {
            var tile = document.createElement("button");
            tile.type = "button";
            tile.className = "tile";
            tile.dataset.cell = cell.id;
            tile.dataset.column = cell.x;
            tiles[cell.id] = tile;
            shown[cell.id] = null;
            host.appendChild(tile);
        });

        paintBoard(Game.Board.snapshot());
    }

    function paintContents(id, piece) {
        var tile = tiles[id];
        if (!tile || shown[id] === piece) return;
        shown[id] = piece;

        if (!piece) {
            tile.innerHTML = "";
            tile.setAttribute(
                "aria-label",
                "Drop into column " + (Game.Board.byId(id).x + 1)
            );
            return;
        }

        var art = Game.Pieces.byId(piece);
        tile.innerHTML =
            '<span class="tile__art">' + Game.Icons.svg(art.icon) + "</span>";
        tile.setAttribute("aria-label", art.name);
    }

    function paintState(id) {
        var tile = tiles[id];
        if (!tile) return;

        var cell = Game.Board.byId(id);
        var landing = hovered >= 0 ? Game.Board.landing(hovered) : null;
        var classes = ["tile"];

        if (shown[id]) {
            classes.push("tile--full", Game.Pieces.byId(shown[id]).tint);
        } else {
            classes.push("tile--empty");
        }

        if (!busy) {
            if (cell.x === hovered) classes.push("is-column");
            if (landing && landing.id === id) classes.push("is-landing");
        }

        var next = classes.join(" ");
        if (tile.className !== next) tile.className = next;
    }

    function paintBoard(board) {
        board.forEach(function (piece, id) {
            paintContents(id, piece);
        });
        board.forEach(function (piece, id) {
            paintState(id);
        });
    }

    function paintHover() {
        shown.forEach(function (piece, id) {
            paintState(id);
        });
    }

    function playFall(moves) {
        moves.forEach(function (move) {
            var tile = tiles[move.to];
            var art = tile && tile.querySelector(".tile__art");
            if (!art) return;

            art.style.setProperty("--fall", move.distance);
            art.classList.remove("is-falling");
            void art.offsetWidth;
            art.classList.add("is-falling");
        });

        window.setTimeout(function () {
            var landed = 0;

            moves.forEach(function (move) {
                var cell = Game.Board.byId(move.to);
                if (!cell) return;
                Game.Effects.land(tiles[move.to], around(cell));
                landed++;
            });

            if (landed) Game.Events.emit("board:landed", { count: landed });
        }, FALL_MS - 60);
    }

    function around(cell) {
        if (!cell) return [];

        return [[0, -1], [0, 1], [-1, 0], [1, 0]]
            .map(function (step) {
                var near = Game.Board.at(cell.x + step[0], cell.y + step[1]);
                return near
                    ? { tile: tiles[near.id], dx: step[0], dy: step[1] }
                    : null;
            })
            .filter(Boolean);
    }

    function playMerge(step, chain) {
        var tile = tiles[step.cell.id];
        if (!tile) return;

        var made = Game.Pieces.byId(step.piece);
        var fresh = !seenThisDrop[made.id] && Game.Round.found(made.id);

        tile.classList.remove("is-landed");
        tile.classList.remove("is-made");
        void tile.offsetWidth;
        tile.classList.add("is-made");

        Game.Events.emit("board:merged", { step: step, chain: chain });

        var neighbours = around(step.cell);
        Game.Effects.burst(tile, neighbours, made.tier, chain);
        Game.Effects.shake(host, made.tier, chain);
        Game.Effects.flash(made.tier);

        Game.Effects.combo(step.times || 1);

        Game.Toast.float(
            tile,
            "+" + step.points,
            made.icon,
            made.tint,
            made.tier >= 6 ? "float--big" : ""
        );

        var box = tile.getBoundingClientRect();
        var x = box.left + box.width / 2;
        var y = box.top + box.height / 2;

        Game.Sparks.ring(x, y, made.tier);
        Game.Sparks.burst(x, y, 9 + Math.min(20, made.tier + chain * 3), made);

        if (fresh) {
            seenThisDrop[made.id] = true;
            Game.Effects.discover(tile);
        }
    }

    function playFuse(step, chain, done) {
        var trail = (step.fuse || []).filter(function (id) {
            return id !== step.cell.id;
        });

        if (!trail.length || !step.lit) {
            playMerge(step, chain);
            done();
            return;
        }

        paintBoard(step.lit);

        var at = 0;

        function burn() {
            if (at >= trail.length) {
                paintBoard(step.board);
                playMerge(step, chain);
                done();
                return;
            }

            var id = trail[at];
            at++;

            var tile = tiles[id];
            if (tile) {
                tile.classList.remove("is-fused");
                void tile.offsetWidth;
                tile.classList.add("is-fused");

                var box = tile.getBoundingClientRect();
                Game.Sparks.burst(
                    box.left + box.width / 2,
                    box.top + box.height / 2,
                    3
                );
            }

            Game.Events.emit("board:fuse", {
                step: at,
                of: trail.length,
                piece: step.from
            });

            window.setTimeout(function () {
                paintContents(id, null);
                paintState(id);
                burn();
            }, FUSE_MS);
        }

        burn();
    }

    function playClear(step) {
        var middle = tiles[step.cells[Math.floor(step.cells.length / 2)]];

        step.cells.forEach(function (id, i) {
            var tile = tiles[id];
            if (!tile) return;
            tile.classList.remove("is-cleared");
            void tile.offsetWidth;
            tile.style.setProperty("--wait", i * 40 + "ms");
            tile.classList.add("is-cleared");

            var box = tile.getBoundingClientRect();
            Game.Sparks.burst(
                box.left + box.width / 2,
                box.top + box.height / 2,
                5
            );
        });

        Game.Effects.shake(host, 8, 0);
        Game.Effects.flash(8);

        if (middle && step.points) {
            Game.Toast.float(
                middle,
                "+" + step.points,
                null,
                "tint-gold",
                "float--big"
            );
        }
    }

    function playSteps(steps, index, chain) {
        if (index >= steps.length) {
            advance();
            return;
        }

        var step = steps[index];

        if (step.type === "fall") {
            paintBoard(step.board);
            playFall(step.moves);
            window.setTimeout(function () {
                playSteps(steps, index + 1, chain);
            }, FALL_MS);
            return;
        }

        if (step.type === "clear" || step.type === "cash") {
            paintBoard(step.board);
            playClear(step);
            Game.Events.emit("board:merged", { step: step, chain: chain });
            window.setTimeout(function () {
                playSteps(steps, index + 1, chain);
            }, CLEAR_MS);
            return;
        }

        var made = Game.Pieces.byId(step.piece);
        var hold = MERGE_MS + (made.tier >= 7 ? 110 : 0);

        playFuse(step, chain, function () {
            window.setTimeout(function () {
                playSteps(steps, index + 1, chain + 1);
            }, hold);
        });
    }

    function enqueue(steps) {
        if (!steps || !steps.length) return;
        pending.push(steps);
        if (!busy) advance();
    }

    function advance() {
        if (!pending.length) {
            busy = false;
            paintHover();
            Game.Events.emit("board:settled", {});
            return;
        }

        busy = true;
        seenThisDrop = {};
        playSteps(pending.shift(), 0, 0);
    }

    function columnOf(event) {
        var tile = event.target.closest("[data-column]");
        return tile ? Number(tile.dataset.column) : -1;
    }

    function onMove(event) {
        pointer.x = event.clientX;
        pointer.y = event.clientY;
        pointer.known = true;

        var column = columnOf(event);
        if (column === hovered) return;
        hovered = column;
        if (!busy) paintHover();
    }

    function onLeave() {
        if (hovered === -1) return;
        hovered = -1;
        paintHover();
    }

    function onClick(event) {
        if (busy) return;

        var column = columnOf(event);
        if (column < 0) return;

        var round = Game.Round.get();
        if (!round || !round.running) return;

        if (!Game.Round.play(column)) {
            Game.Toast.notice("That column is full.", "warn");
        }
    }

    Game.BoardView = {
        init: function () {
            host = document.getElementById("board");
            if (!host) return;

            host.addEventListener("click", onClick);
            document.addEventListener("mousemove", onMove);
            host.addEventListener("mouseleave", onLeave);

            Game.Events.on("game:started", function () {
                hovered = -1;
                busy = false;
                pending = [];
                build();
            });

            Game.Events.on("board:steps", function (detail) {
                enqueue(detail.steps);
            });

            Game.Events.on("game:grown", function (detail) {
                enqueue(detail.settled.steps);
            });

            Game.Events.on("game:rain", function (detail) {
                enqueue(detail.steps);
            });
        },

        isBusy: function () {
            return busy;
        },

        refresh: function () {
            paintBoard(Game.Board.snapshot());
        }
    };
})();
