window.Game = window.Game || {};

/**
 * roundview.js — the hand, the sheet of everything you have made, and the
 * card at the end.
 *
 * The screen holds two things: the board and the hand. Everything else lives
 * behind the one button on the right of the hand.
 */
(function () {
    var handHost = null;
    var trackHost = null;
    var sheetHost = null;
    var overHost = null;
    var sheetOpen = false;
    var pendingOver = null;

    /** The rungs being dealt right now, as a lookup. */
    function dealingNow() {
        var round = Game.Round.get();
        if (!round) return {};

        var live = {};
        Game.Pieces.dealing(round.highest).forEach(function (piece) {
            live[piece.id] = true;
        });
        return live;
    }

    /* -------------------------------------------------------------- track */

    /**
     * The whole ladder as one strip above the board, left to right.
     *
     * This one tracks *this game*, not the all-time album — you can only
     * reach a rung by making everything under it, so how far the colour runs
     * is exactly how far you have climbed. The sheet keeps the album.
     */
    function renderTrack() {
        var round = Game.Round.get();
        if (!trackHost || !round) return;

        var live = dealingNow();

        trackHost.style.setProperty("--count", Game.Pieces.list.length);
        trackHost.innerHTML = Game.Pieces.list
            .map(function (piece) {
                var known = piece.tier <= round.highest;

                return (
                    '<li class="step' +
                    (known ? " is-known" : "") +
                    (live[piece.id] ? " is-dealing" : "") +
                    '" title="' +
                    piece.name +
                    (piece.points ? " · " + piece.points : "") +
                    '">' +
                    '<span class="step__bit ' +
                    piece.tint +
                    '">' +
                    Game.Icons.svg(piece.icon) +
                    "</span>" +
                    "</li>"
                );
            })
            .join("");
    }

    /* --------------------------------------------------------------- hand */

    function slot(piece, extra, attrs) {
        return (
            '<button type="button" class="slot ' +
            piece.tint +
            " " +
            extra +
            '" ' +
            attrs +
            ' title="' +
            piece.name +
            '">' +
            Game.Icons.svg(piece.icon) +
            "</button>"
        );
    }

    function renderHand() {
        var round = Game.Round.get();
        if (!handHost || !round) return;

        var hand = round.hand
            .map(function (piece, index) {
                return slot(
                    piece,
                    index === round.picked ? "is-picked" : "",
                    'data-pick="' + index + '"'
                );
            })
            .join("");

        handHost.innerHTML =
            '<span class="hand__row">' +
            hand +
            "</span>" +
            '<span class="hand__divider"></span>' +
            '<button type="button" class="slot slot--quiet" data-sheet="1" ' +
            'title="What you have made">' +
            Game.Icons.svg("crown") +
            "</button>";
    }

    /* -------------------------------------------------------------- sheet */

    function renderSheet() {
        var round = Game.Round.get();
        if (!sheetHost || !round || !sheetOpen) return;

        var dealing = dealingNow();

        var found = Game.Pieces.made.filter(function (piece) {
            return Game.Round.found(piece.id);
        }).length;

        var rungs = Game.Pieces.list
            .map(function (piece) {
                var known = piece.tier === 1 || Game.Round.found(piece.id);
                var live = dealing[piece.id];

                return (
                    '<li class="rung' +
                    (known ? " is-known" : "") +
                    (live ? " is-dealing" : "") +
                    '">' +
                    '<span class="rung__bit ' +
                    piece.tint +
                    '">' +
                    Game.Icons.svg(piece.icon) +
                    "</span>" +
                    '<span class="rung__name">' +
                    piece.name +
                    "</span>" +
                    '<span class="rung__points">' +
                    (piece.points || "start") +
                    "</span>" +
                    "</li>"
                );
            })
            .join("");

        sheetHost.innerHTML =
            '<div class="sheet__card">' +
            '<div class="sheet__head">' +
            "<div>" +
            '<span class="sheet__score">' +
            round.score +
            "</span>" +
            '<span class="sheet__best">best ' +
            round.best +
            "</span>" +
            "</div>" +
            '<button type="button" class="sheet__close" data-close="1" ' +
            'aria-label="Close">' +
            Game.Icons.svg("close") +
            "</button>" +
            "</div>" +
            '<div class="sheet__count">Made ' +
            found +
            " of " +
            Game.Pieces.made.length +
            "</div>" +
            '<ul class="ladder">' +
            rungs +
            "</ul>" +
            "</div>";
    }

    function openSheet() {
        sheetOpen = true;
        sheetHost.classList.add("is-open");
        renderSheet();
    }

    function closeSheet() {
        sheetOpen = false;
        sheetHost.classList.remove("is-open");
        sheetHost.innerHTML = "";
    }

    /* ---------------------------------------------------------------- end */

    function showOver(detail) {
        if (!overHost) return;

        // let the board finish settling before declaring the game done
        if (Game.BoardView.isBusy()) {
            pendingOver = detail;
            return;
        }
        pendingOver = null;
        closeSheet();

        var top = detail.highest;
        var crowned = detail.crowns > 0;

        overHost.innerHTML =
            '<div class="over__card' +
            (crowned ? " is-won" : "") +
            '">' +
            '<span class="over__label">No room left</span>' +
            (top
                ? '<span class="over__crown ' +
                  top.tint +
                  '">' +
                  Game.Icons.svg(top.icon) +
                  "</span>"
                : "") +
            '<span class="over__top">' +
            (crowned
                ? detail.crowns +
                  (detail.crowns === 1
                      ? " crown, and then some"
                      : " crowns, and then some")
                : top
                ? "You got as far as " + top.name
                : "Nothing made") +
            "</span>" +
            '<span class="over__score">' +
            detail.score +
            "</span>" +
            '<span class="over__meta">' +
            detail.moves +
            " drops · " +
            detail.made +
            (detail.made === 1 ? " thing made" : " things made") +
            (detail.record ? " · a new best" : " · best " + detail.best) +
            "</span>" +
            '<button type="button" class="btn btn--primary" id="againBtn">' +
            Game.Icons.svg("place") +
            "Again</button>" +
            "</div>";
        overHost.classList.add("is-open");
    }

    function hideOver() {
        if (!overHost) return;
        overHost.classList.remove("is-open");
        overHost.innerHTML = "";
    }

    /* ------------------------------------------------------------- events */

    function onHandClick(event) {
        if (event.target.closest("[data-sheet]")) return openSheet();

        var pick = event.target.closest("[data-pick]");
        if (pick) Game.Round.pick(Number(pick.dataset.pick));
    }

    /**
     * The wheel swaps which of the two you are holding, from anywhere on the
     * page — you spend the whole game with the cursor over the board, so
     * reaching down to the hand to click would be the slow way round.
     */
    function onWheel(event) {
        var round = Game.Round.get();
        if (!round || !round.running || sheetOpen) return;

        event.preventDefault();
        Game.Round.cycle(event.deltaY > 0 ? 1 : -1);
    }

    Game.RoundView = {
        init: function () {
            handHost = document.getElementById("hand");
            trackHost = document.getElementById("track");
            sheetHost = document.getElementById("sheet");
            overHost = document.getElementById("over");

            if (handHost) handHost.addEventListener("click", onHandClick);
            document.addEventListener("wheel", onWheel, { passive: false });

            if (sheetHost) {
                sheetHost.addEventListener("click", function (event) {
                    // the backdrop closes it as readily as the button
                    if (event.target.closest("[data-close]")) return closeSheet();
                    if (!event.target.closest(".sheet__card")) closeSheet();
                });
            }

            document.addEventListener("keydown", function (event) {
                if (event.key === "Escape") closeSheet();
            });

            Game.Events.on("game:started", function () {
                hideOver();
                closeSheet();
                renderHand();
                renderTrack();
            });

            Game.Events.on("game:hand", renderHand);
            Game.Events.on("game:placed", function () {
                renderTrack();
                renderSheet();
            });

            Game.Events.on("game:dealing", function (detail) {
                renderTrack();
                renderSheet();
                Game.Toast.notice(
                    "Now dealing " + detail.lowest.name.toLowerCase() + "s",
                    "good"
                );
            });

            Game.Events.on("game:rain", function (detail) {
                Game.Toast.notice(
                    detail.count === 1
                        ? "A piece came loose"
                        : detail.count + " pieces came loose",
                    "warn"
                );
            });

            Game.Events.on("game:grown", function (detail) {
                renderSheet();
                Game.Toast.notice(
                    detail.grown === 1
                        ? "One left behind grew up"
                        : detail.grown + " left behind grew up",
                    "info"
                );
            });

            Game.Events.on("game:found", function (detail) {
                renderTrack();
                renderSheet();
                detail.pieces.forEach(function (id) {
                    var piece = Game.Pieces.byId(id);
                    Game.Toast.notice("First " + piece.name + "!", "good");
                });
            });

            Game.Events.on("game:over", showOver);
            Game.Events.on("board:settled", function () {
                if (pendingOver) showOver(pendingOver);
            });

            if (overHost) {
                overHost.addEventListener("click", function (event) {
                    if (!event.target.closest("#againBtn")) return;
                    Game.Round.start();
                });
            }
        }
    };
})();
