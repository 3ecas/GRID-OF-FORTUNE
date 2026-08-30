window.Game = window.Game || {};

document.addEventListener("DOMContentLoaded", function () {
    Game.Icons.hydrate(document);
    Game.Sound.start();

    Game.BoardView.init();
    Game.RoundView.init();
    Game.ScoreView.init();

    Game.RoundView.menu();
});
