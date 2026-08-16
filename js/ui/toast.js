window.Game = window.Game || {};

/**
 * toast.js — short lived feedback: the "+1" that lifts off a harvested plot
 * and the little message pill at the bottom of the screen.
 */
(function () {
    var host = null;
    var MAX_NOTICES = 3;
    var NOTICE_MS = 2200;

    function showNotice(text, tone) {
        if (!host) return;

        while (host.children.length >= MAX_NOTICES) {
            host.removeChild(host.firstElementChild);
        }

        var pill = document.createElement("div");
        pill.className = "notice notice--" + (tone || "info");
        pill.textContent = text;
        host.appendChild(pill);

        window.setTimeout(function () {
            pill.classList.add("is-leaving");
            window.setTimeout(function () {
                if (pill.parentNode) pill.parentNode.removeChild(pill);
            }, 250);
        }, NOTICE_MS);
    }

    function drop(element) {
        if (element.parentNode) element.parentNode.removeChild(element);
    }

    Game.Toast = {
        /**
         * Removes a decoration when its animation ends, with a timer as a
         * backstop: a hidden tab throttles animations, so animationend alone
         * would leave leftovers stacked on screen when the player returns.
         */
        autoRemove: function (element, fallbackMs) {
            element.addEventListener("animationend", function () {
                drop(element);
            });
            window.setTimeout(function () {
                drop(element);
            }, fallbackMs);
        },

        init: function () {
            host = document.getElementById("noticeHost");
            Game.Events.on("notice", function (detail) {
                showNotice(detail.text, detail.tone);
            });
        },

        notice: showNotice,

        /** Floats a label up from an element, e.g. "+250" over a square. */
        float: function (anchor, text, iconName, tintClass, extraClass) {
            if (!anchor) return;

            var box = anchor.getBoundingClientRect();
            var chip = document.createElement("div");
            chip.className =
                "float " + (tintClass || "") + " " + (extraClass || "");
            chip.style.left = box.left + box.width / 2 + "px";
            chip.style.top = box.top + box.height / 2 + "px";
            chip.innerHTML =
                (iconName ? Game.Icons.svg(iconName) : "") +
                "<span>" +
                text +
                "</span>";

            document.body.appendChild(chip);
            this.autoRemove(chip, 1600);
        }
    };
})();
