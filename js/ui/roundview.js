window.Game = window.Game || {};

(function () {
    var handHost = null;
    var trackHost = null;
    var overHost = null;
    var pendingOver = null;

    function dealingNow() {
        var round = Game.Round.get();
        if (!round) return {};

        var live = {};
        Game.Pieces.dealing(round.highest).forEach(function (piece) {
            live[piece.id] = true;
        });
        return live;
    }

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

    function showOver(detail) {
        if (!overHost) return;

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

            Game.Events.on("game:seam", function (detail) {
                var level = detail.level;
                if (!level) return;

                Game.Toast.notice(
                    "The seam widens — " +
                        level.count +
                        (level.count === 1 ? " piece" : " pieces") +
                        " every " +
                        level.every,
                    "warn"
                );
            });

            Game.Events.on("game:grown", function (detail) {
                Game.Toast.notice(
                    detail.grown === 1
                        ? "One left behind grew up"
                        : detail.grown + " left behind grew up",
                    "info"
                );
            });

            Game.Events.on("game:found", renderTrack);

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
