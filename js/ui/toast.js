window.Game = window.Game || {};

(function () {
    function drop(element) {
        if (element.parentNode) element.parentNode.removeChild(element);
    }

    Game.Toast = {
        autoRemove: function (element, fallbackMs) {
            element.addEventListener("animationend", function () {
                drop(element);
            });
            window.setTimeout(function () {
                drop(element);
            }, fallbackMs);
        },

        FLY_MS: 430,

        toScore: function (anchor, text, iconName, tintClass) {
            if (!anchor) return;

            var box = anchor.getBoundingClientRect();
            var x = box.left + box.width / 2;
            var y = box.top + box.height / 2;

            var chip = document.createElement("div");
            chip.className = "float float--fly " + (tintClass || "");
            chip.style.left = x + "px";
            chip.style.top = y + "px";

            var score = document.getElementById("scoreboard");
            if (score) {
                var aim = score.getBoundingClientRect();
                chip.style.setProperty("--dx", aim.left + aim.width / 2 - x + "px");
                chip.style.setProperty("--dy", aim.top + aim.height / 2 - y + "px");
            }

            chip.innerHTML =
                (iconName ? Game.Icons.svg(iconName) : "") +
                "<span>" +
                text +
                "</span>";

            document.body.appendChild(chip);
            this.autoRemove(chip, this.FLY_MS + 260);
        },

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
