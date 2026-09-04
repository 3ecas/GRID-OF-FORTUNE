window.Game = window.Game || {};

(function () {
    var handHost = null;
    var trackHost = null;
    var overHost = null;
    var sheetHost = null;
    var menuHost = null;
    var backBtn = null;
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

        var dealt = Game.Pieces.dealing(round.highest);
        var lowest = dealt.length ? dealt[0].tier : 1;

        trackHost.innerHTML = Game.Pieces.list
            .slice()
            .reverse()
            .map(function (piece) {
                var known = piece.tier <= round.highest;
                var past = piece.tier < lowest;

                return (
                    '<li class="step' +
                    (known ? " is-known" : "") +
                    (past ? " is-past" : "") +
                    (live[piece.id] ? " is-dealing" : "") +
                    '">' +
                    '<span class="step__bit ' +
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
                    "</li>"
                );
            })
            .join("");
    }

    function openSheet() {
        if (!sheetHost) return;
        renderTrack();
        sheetHost.classList.add("is-open");

        var live = trackHost && trackHost.querySelector(".is-dealing");
        if (live && live.scrollIntoView) {
            live.scrollIntoView({ block: "center" });
        }
    }

    function closeSheet() {
        if (sheetHost) sheetHost.classList.remove("is-open");
    }

    function waiting(on) {
        if (!handHost) return;
        handHost.classList.toggle("is-waiting", !!on);
    }

    function renderHand() {
        var round = Game.Round.get();
        if (!handHost || !round) return;

        var piece = round.hand[0];
        handHost.innerHTML = piece
            ? '<span class="slot is-picked ' +
              piece.tint +
              '" title="' +
              piece.name +
              '">' +
              Game.Icons.svg(piece.icon) +
              "</span>"
            : "";
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
                ? '<span class="over__crown">' + Game.Icons.svg(top.icon) + "</span>"
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
            '<button type="button" class="word" id="againBtn">Again</button>' +
            "</div>";
        overHost.classList.add("is-open");
    }

    function hideOver() {
        if (!overHost) return;
        overHost.classList.remove("is-open");
        overHost.innerHTML = "";
    }

    function renderMenu() {
        if (!menuHost) return;

        var save = Game.Round.peek();
        var going = Game.Round.saved();

        // The title and four ways in. Nothing else: the menu is a door, not a
        // dashboard, and everything it used to explain the game now says is
        // said better by the first thirty seconds of playing it.
        menuHost.innerHTML =
            '<div class="menu__inner">' +
            '<h1 class="menu__mark">Grid of Fortune</h1>' +
            (save.best ? '<span class="menu__best">Best ' + save.best + "</span>" : "") +
            '<nav class="keys">' +
            key("playNew", "play", "New game", false) +
            key("goOn", "resume", "Continue", !going) +
            // Game.Sound paints this one itself — it swaps between the
            // speaker and the crossed-out speaker as it is pressed
            '<button type="button" class="key" data-sound aria-label="Sound"></button>' +
            key("howBtn", "help", "How to play", false) +
            "</nav>" +
            "</div>";

        menuHost.classList.add("is-open");
        Game.Icons.hydrate(menuHost);

        if (Game.Sound && Game.Sound.button) Game.Sound.button();
        if (backBtn) backBtn.classList.remove("is-on");
    }

    function key(id, icon, label, off) {
        return '<button type="button" class="key" id="' + id + '"' +
               ' data-icon="' + icon + '" aria-label="' + label + '"' +
               (off ? " disabled" : "") + "></button>";
    }

    function hideMenu() {
        if (menuHost) menuHost.classList.remove("is-open");
    }

    Game.RoundView = {
        menu: renderMenu,

        init: function () {
            handHost = document.getElementById("hand");
            trackHost = document.getElementById("track");
            overHost = document.getElementById("over");
            sheetHost = document.getElementById("sheet");
            menuHost = document.getElementById("menu");

            var rungs = document.getElementById("rungsBtn");
            if (rungs) rungs.addEventListener("click", openSheet);

            backBtn = document.getElementById("backBtn");
            if (backBtn) {
                backBtn.addEventListener("click", function () {
                    closeSheet();
                    renderMenu();
                });
            }

            if (sheetHost) {
                sheetHost.addEventListener("click", function (event) {
                    if (!event.target.closest(".sheet__card")) closeSheet();
                });
            }

            if (menuHost) {
                menuHost.addEventListener("click", function (event) {
                    if (event.target.closest("#howBtn")) {
                        return Game.HowTo && Game.HowTo.open();
                    }
                    if (event.target.closest("#goOn")) {
                        if (!Game.Round.resume()) Game.Round.start();
                    } else if (event.target.closest("#playNew")) {
                        Game.Round.start();
                    }
                });
            }

            document.addEventListener("keydown", function (event) {
                if (event.key === "Escape") closeSheet();
            });

            Game.Events.on("game:started", function () {
                hideOver();
                hideMenu();
                closeSheet();
                if (backBtn) backBtn.classList.add("is-on");
                waiting(false);
                renderHand();
                renderTrack();
            });

            Game.Events.on("game:hand", renderHand);
            Game.Events.on("game:placed", renderTrack);

            Game.Events.on("game:choosing", function () {
                waiting(true);
            });
            Game.Events.on("game:chosen", function () {
                waiting(false);
            });

            Game.Events.on("game:dealing", renderTrack);

            Game.Events.on("game:found", renderTrack);

            Game.Events.on("game:over", function (detail) {
                if (backBtn) backBtn.classList.remove("is-on");
                showOver(detail);
            });
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
