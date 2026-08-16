window.Game = window.Game || {};

/**
 * nav.js — marks the current page in the top bar. The markup lives in each
 * html file so every page renders correctly before scripts run.
 */
(function () {
    function currentFile() {
        var path = window.location.pathname;
        var file = path.substring(path.lastIndexOf("/") + 1);
        return file || "index.html";
    }

    Game.Nav = {
        init: function () {
            var here = currentFile();
            var links = document.querySelectorAll("[data-nav]");

            Array.prototype.forEach.call(links, function (link) {
                var active = link.getAttribute("data-nav") === here;
                link.classList.toggle("is-active", active);
                if (active) {
                    link.setAttribute("aria-current", "page");
                } else {
                    link.removeAttribute("aria-current");
                }
            });
        }
    };
})();
