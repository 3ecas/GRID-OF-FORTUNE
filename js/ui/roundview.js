window.Game = window.Game || {};

/**
 * roundview.js — the hand, the run along the bottom, and the card at the end.
 *
 * The screen holds three things: the board, the two pieces in your hand, and
 * the ladder along the foot. Everything you might want to look up — what a
 * rung is called, what it pays — is on the bar itself, under the cursor.
 */
(function () {
    var handHost = null;
    var trackHost = null;
    var overHost = null;
    var pendingOver = null;

    /* -------------------------------------------------------------- track */

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

    /**
     * The whole ladder along the foot of the screen, left to right.
     *
     * It tracks *this game*, not any all-time record — you can only reach a
     * rung by making everything under it, so how far the colour runs is
     * exactly how far you have climbed. Each rung carries its own label,
     * shown on hover, so nothing else has to exist to explain it.
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
                    '">' +
                    '<span class="step__bit ' +
                    piece.tint +
                    '">' +
                    Game.Icons.svg(piece.icon) +
                    "</span>" +
                    '<span class="step__tip">' +
                    '<span class="step__art ' +
                    piece.tint +
                    '">' +
                    Game.Icons.svg(piece.icon) +
                    "</span>" +
                    '<span class="step__name">' +
                    piece.name +
                    "</span>" +
                    '<span class="step__worth">' +
                    (piece.points ? piece.points : "start") +
                    "</span>" +
                    "</span>" +
                    "</li>"
                );
            })
            .join("");
    }

    /* --------------------------------------------------------------- hand */

    function renderHand() {
        var round = Game.Round.get();
        if (!handHost || !round) return;

        handHost.innerHTML = round.hand
            .map(function (piece, index) {
                return (
                    '<button type="button" class="slot ' +
                    piece.tint +
                    (index === round.picked ? " is-picked" : "") +
                    '" data-pick="' +
                    index +
                    '" title="' +
                    piece.name +
                    '">' +
                    Game.Icons.svg(piece.icon) +
                    "</button>"
                );
            })
            .join("");
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
            (top ? "You got as far as " + top.name : "Nothing made") +
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

    /**
     * The wheel swaps which of the two you are holding, from anywhere on the
     * page — you spend the whole game with the cursor over the board, so
     * reaching down to the hand to click would be the slow way round.
     */
    function onWheel(event) {
        var round = Game.Round.get();
        if (!round || !round.running) return;

        event.preventDefault();
        Game.Round.cycle(event.deltaY > 0 ? 1 : -1);
    }

    Game.RoundView = {
        init: function () {
            handHost = document.getElementById("hand");
            trackHost = document.getElementById("track");
            overHost = document.getElementById("over");

            if (handHost) {
                handHost.addEventListener("click", function (event) {
                    var pick = event.target.closest("[data-pick]");
                    if (pick) Game.Round.pick(Number(pick.dataset.pick));
                });
            }
            document.addEventListener("wheel", onWheel, { passive: false });

            Game.Events.on("game:started", function () {
                hideOver();
                renderHand();
                renderTrack();
            });

            Game.Events.on("game:hand", renderHand);
            Game.Events.on("game:placed", renderTrack);

            Game.Events.on("game:dealing", function (detail) {
                renderTrack();
                Game.Toast.notice(
                    "Now dealing " + detail.lowest.name.toLowerCase() + "s",
                    "good"
                );
            });

            /* No notice when the seam gives way. It used to be worth saying,
               back when it happened every eighth drop — now it happens up to
               every single one, and a message that fires fifty times a run is
               not news, it is a thing sitting on top of your hand. You can
               see the pieces land. */

            Game.Events.on("game:grown", function (detail) {
                Game.Toast.notice(
                    detail.grown === 1
                        ? "One left behind grew up"
                        : detail.grown + " left behind grew up",
                    "info"
                );
            });

            Game.Events.on("game:found", function (detail) {
                renderTrack();
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
