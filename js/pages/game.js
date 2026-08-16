window.Game = window.Game || {};

/**
 * pages/game.js — entry point for index.html, which is the whole of
 * Grid of Fortune.
 */
document.addEventListener("DOMContentLoaded", function () {
    Game.Icons.hydrate(document);
    Game.Toast.init();

    Game.BoardView.init();
    Game.RoundView.init();
    Game.ScoreView.init();

    Game.Round.start();
});
