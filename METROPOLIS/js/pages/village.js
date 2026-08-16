window.Game = window.Game || {};

/**
 * pages/village.js — entry point for index.html.
 */
Game.Boot.start(function () {
    Game.GridView.init();
    Game.BuildBar.init();
});
