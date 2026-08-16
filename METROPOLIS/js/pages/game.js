window.Game = window.Game || {};

/**
 * pages/game.js — entry point for index.html, which is the whole game.
 */
document.addEventListener("DOMContentLoaded", function () {
    Game.Icons.hydrate(document);
    Game.Toast.init();

    Game.BoardView.init();
    Game.RoundView.init();
    Game.ScoreView.init();

    Game.Round.start();
});
