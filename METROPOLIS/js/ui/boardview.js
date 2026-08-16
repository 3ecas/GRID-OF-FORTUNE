window.Game = window.Game || {};

/**
 * boardview.js — draws the board and takes the one move there is: a drop.
 *
 * A move is played out, not shown finished. The board hands back the beats it
 * actually happened in — the piece falls, lands, *then* notices its twin and
 * joins with it, then whatever was above drops into the gap — and each beat
 * is drawn and given its moment before the next one starts.
 *
 * Contents are only rewritten when the piece on a square really changes.
 * Redrawing them on every hover restarts each icon's entry animation and the
 * whole board flickers as the cursor moves.
 */
(function () {
    var host = null;
    var tiles = [];
    var shown = []; // what is currently drawn, by cell id
    var hovered = -1;
    var busy = false;
    var pointer = { x: 0, y: 0, known: false };
    var seenThisDrop = {};

    var FALL_MS = 190;
    var MERGE_MS = 175;

    /* --------------------------------------------------------------- build */

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

    /* --------------------------------------------------------------- paint */

    /** Only touches the DOM where the piece on a square has changed. */
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

    /** Classes only — safe to run on every mouse move. */
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

    /* ------------------------------------------------------------ the beats */

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

        // the thump, once each piece is actually down
        window.setTimeout(function () {
            moves.forEach(function (move) {
                var cell = Game.Board.byId(move.to);
                Game.Effects.land(tiles[move.to], around(cell));
            });
        }, FALL_MS - 60);
    }

    /** The four squares around one, and which way they should be shoved. */
    function around(cell) {
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

        var neighbours = around(step.cell);
        Game.Effects.burst(tile, neighbours, made.tier, chain);
        Game.Effects.shake(host, made.tier, chain);
        Game.Effects.flash(made.tier);
        Game.Effects.combo(chain + 1);

        // what it paid, floating off the square that paid it
        Game.Toast.float(
            tile,
            "+" + step.points,
            made.icon,
            made.tint,
            made.tier >= 6 ? "float--big" : ""
        );

        // leaves burst where you are looking, which is wherever the cursor is
        var box = tile.getBoundingClientRect();
        var x = pointer.known ? pointer.x : box.left + box.width / 2;
        var y = pointer.known ? pointer.y : box.top + box.height / 2;
        Game.Sparks.burst(x, y, 6 + Math.min(14, made.tier + chain * 2));

        if (fresh) {
            seenThisDrop[made.id] = true;
            Game.Effects.discover(tile);
            Game.Toast.float(tile, made.name, null, made.tint, "float--name");
        }
    }

    /** Walks the sequence, one beat at a time. */
    function playSteps(steps, index, chain) {
        if (index >= steps.length) {
            busy = false;
            paintHover();
            Game.Events.emit("board:settled", {});
            return;
        }

        var step = steps[index];
        paintBoard(step.board);

        if (step.type === "fall") {
            playFall(step.moves);
            window.setTimeout(function () {
                playSteps(steps, index + 1, chain);
            }, FALL_MS);
            return;
        }

        playMerge(step, chain);

        // the big ones are held a beat longer, so the payoff lands
        var made = Game.Pieces.byId(step.piece);
        var hold = MERGE_MS + (made.tier >= 7 ? 160 : 0);

        window.setTimeout(function () {
            playSteps(steps, index + 1, chain + 1);
        }, hold);
    }

    function play(steps) {
        seenThisDrop = {};
        if (!steps || !steps.length) {
            paintBoard(Game.Board.snapshot());
            return;
        }
        busy = true;
        playSteps(steps, 0, 0);
    }

    /* -------------------------------------------------------------- clicks */

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
        if (busy) return; // let the board finish settling first

        var column = columnOf(event);
        if (column < 0) return;

        var round = Game.Round.get();
        if (!round || !round.running) return;

        var result = Game.Round.play(column);
        if (!result) {
            Game.Toast.notice("That column is full.", "warn");
            return;
        }

        play(result.steps);
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
                build();
            });

            // the countryside growing up behind the hand
            Game.Events.on("game:grown", function (detail) {
                play(detail.settled.steps);
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
