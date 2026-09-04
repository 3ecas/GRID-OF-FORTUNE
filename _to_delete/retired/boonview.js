window.Game = window.Game || {};

/* =============================================================================
   BOON VIEW
   -----------------------------------------------------------------------------
   The card that comes up when the run stops to ask. It covers the board, which
   is also what stops the player carrying on before they have answered — there
   is no separate paused state to keep in step with anything.
   ============================================================================= */

(function () {
    var host = null;

    function card(offer) {
        return (
            '<button class="boon" type="button" data-boon="' + offer.id + '">' +
            '<span class="boon__art" data-icon="' + offer.icon + '"></span>' +
            '<span class="boon__text">' +
            '<span class="boon__name">' + offer.name + "</span>" +
            '<span class="boon__note">' + offer.note + "</span>" +
            "</span>" +
            "</button>"
        );
    }

    function show(detail) {
        if (!host) return;

        host.innerHTML =
            '<div class="boons__card">' +
            '<span class="boons__eyebrow">' +
            (detail.reason === "score" ? "A milestone" : "Something new made") +
            "</span>" +
            '<span class="boons__title">Take one</span>' +
            '<div class="boons__row">' +
            detail.choices.map(card).join("") +
            "</div>" +
            "</div>";

        Game.Icons.hydrate(host);
        host.classList.add("is-on");
    }

    function hide() {
        if (!host) return;
        host.classList.remove("is-on");
        host.innerHTML = "";
    }

    Game.BoonView = {
        init: function () {
            host = document.getElementById("boons");
            if (!host) return;

            host.addEventListener("click", function (event) {
                var pick = event.target.closest("[data-boon]");
                if (!pick) return;
                Game.Boons.choose(pick.getAttribute("data-boon"));
            });

            Game.Events.on("boon:offer", show);
            Game.Events.on("boon:taken", hide);
            Game.Events.on("game:started", hide);
            Game.Events.on("game:over", hide);
        }
    };
})();
