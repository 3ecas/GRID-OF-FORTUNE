window.Game = window.Game || {};

/**
 * pages/inventory.js — entry point for inventory.html.
 */
Game.Boot.start(function () {
    Game.InventoryView.init();

    var reset = document.getElementById("resetBtn");
    if (!reset) return;

    reset.addEventListener("click", function () {
        var sure = window.confirm(
            "Start a new village? Everything gathered and built is lost."
        );
        if (!sure) return;

        Game.State.reset();
        Game.Toast.notice("A fresh village.", "good");
    });
});
