window.Game = window.Game || {};

/**
 * icons.js — the icon set. No emoji anywhere in the game.
 *
 * Two families, on purpose:
 *
 *   line — UI chrome (menu, buttons, status). One stroke weight, inherits the
 *          parent's colour so it reads on any surface.
 *
 *   art  — the world itself (resources, buildings). Flat vector illustration:
 *          layered shapes, a light face and a shaded face, no outlines. Every
 *          shape sets its own fill from the --i-* palette in theme.css, so the
 *          whole set recolours from one place.
 *
 * Use it two ways:
 *   markup:  <span data-icon="tree"></span>   then Game.Icons.hydrate(root)
 *   string:  Game.Icons.svg("tree")
 */
(function () {
    /* ------------------------------------------------------------ line icons */

    var line = {
        /* a plot of land, quartered */
        map:
            '<rect x="3.4" y="3.4" width="17.2" height="17.2" rx="4"/>' +
            '<path d="M12 3.4v17.2"/>' +
            '<path d="M3.4 12h17.2"/>',

        /* a chest: body, lid, latch */
        chest:
            '<rect x="3.2" y="7.4" width="17.6" height="12.6" rx="2.8"/>' +
            '<path d="M3.2 12.6h17.6"/>' +
            '<path d="M12 12.6v3"/>',

        /* a house in one outline */
        house:
            '<path d="M3.8 10.4 12 4.2l8.2 6.2v9.6H3.8Z"/>' +
            '<path d="M9.6 20v-5.4h4.8V20"/>',

        /* a skyline */
        city:
            '<rect x="3" y="12" width="5.4" height="8.6" rx="1.4"/>' +
            '<rect x="9.3" y="6.4" width="5.4" height="14.2" rx="1.4"/>' +
            '<rect x="15.6" y="9.4" width="5.4" height="11.2" rx="1.4"/>',

        place:
            '<rect x="3.4" y="3.4" width="17.2" height="17.2" rx="4.4"/>' +
            '<path d="M12 8.4v7.2M8.4 12h7.2"/>',

        pickaxe:
            '<path d="M4 11.4c4.6-5 11.4-5 16 0"/>' + '<path d="M12 8.8V21"/>',

        sprout:
            '<path d="M12 21v-6.2"/>' +
            '<path d="M12 14.8c0-2.8-1.8-4.6-4.8-4.8-.2 3 1.8 4.8 4.8 4.8Z"/>' +
            '<path d="M12 14.8c0-3 2-5 5.2-5.2.2 3.2-1.8 5.2-5.2 5.2Z"/>',

        clock:
            '<circle cx="12" cy="12" r="8.2"/>' + '<path d="M12 7.6V12l3 1.8"/>',

        close: '<path d="M6.8 6.8 17.2 17.2M17.2 6.8 6.8 17.2"/>',

        check: '<path d="M5.2 12.6 9.8 17.2 18.8 7.8"/>',

        spark:
            '<path d="M12 3.6 14.4 9.6 20.4 12 14.4 14.4 12 20.4 9.6 14.4 3.6 12 9.6 9.6Z"/>'
    };

    /* ---------------------------------------------------- illustrated icons */

    var art = {
        /* broadleaf tree: shaded crown, trunk below */
        tree:
            '<circle cx="15.7" cy="10.5" r="4.5" fill="var(--i-leaf-deep)"/>' +
            '<rect x="10.7" y="10.6" width="2.6" height="10" rx="1.3" ' +
            'fill="var(--i-bark)"/>' +
            '<circle cx="8.3" cy="10.5" r="4.5" fill="var(--i-leaf)"/>' +
            '<circle cx="12" cy="7.3" r="5.3" fill="var(--i-leaf)"/>',

        /* thrown about when something joins up */
        leaf:
            '<path d="M12 2.4c4.7 3.3 7.2 7.2 7.2 10.8 0 3.8-3.2 8.4-7.2 8.4s-7.2-4.6-7.2-8.4c0-3.6 2.5-7.5 7.2-10.8Z" ' +
            'fill="var(--i-leaf)"/>' +
            '<path d="M12 2.4c4.7 3.3 7.2 7.2 7.2 10.8 0 3.8-3.2 8.4-7.2 8.4Z" ' +
            'fill="var(--i-leaf-deep)"/>',

        /* the first rung: a sprout with two leaves */
        sapling:
            '<rect x="11.1" y="12.2" width="1.8" height="8.6" rx=".9" ' +
            'fill="var(--i-bark)"/>' +
            '<path d="M11.4 14.2c0-2.9-1.9-4.8-5-5-.2 3 1.7 5 5 5Z" ' +
            'fill="var(--i-leaf)"/>' +
            '<path d="M12.6 12.4c0-3.2 2.1-5.3 5.5-5.5.2 3.4-2 5.5-5.5 5.5Z" ' +
            'fill="var(--i-leaf-deep)"/>',

        /* a stand of trees */
        grove:
            '<circle cx="16.4" cy="10.8" r="4.6" fill="var(--i-leaf-deep)"/>' +
            '<rect x="15.4" y="14.6" width="2" height="6.2" rx="1" ' +
            'fill="var(--i-bark-deep)"/>' +
            '<rect x="6.6" y="12.4" width="2.4" height="8.4" rx="1.2" ' +
            'fill="var(--i-bark)"/>' +
            '<circle cx="7.8" cy="8.4" r="5.6" fill="var(--i-leaf)"/>',

        /* a fruit tree */
        orchard:
            '<circle cx="12" cy="9.4" r="6.4" fill="var(--i-leaf)"/>' +
            '<path d="M12 3c3.5 0 6.4 2.9 6.4 6.4S15.5 15.8 12 15.8Z" ' +
            'fill="var(--i-leaf-deep)"/>' +
            '<rect x="10.8" y="14.8" width="2.4" height="6" rx="1.2" ' +
            'fill="var(--i-bark-deep)"/>' +
            '<circle cx="8.6" cy="8" r="1.7" fill="var(--i-berry)"/>' +
            '<circle cx="14.4" cy="7.2" r="1.7" fill="var(--i-berry)"/>' +
            '<circle cx="13.4" cy="12.2" r="1.7" fill="var(--i-berry)"/>',

        /* faceted boulder with a smaller rock behind it — all straight edges,
           so it reads as cut stone rather than something soft */
        stone:
            '<path d="M14.6 20.2 16.5 14.6 18.7 13.7 21.2 17.2 21.5 20.2Z" ' +
            'fill="var(--i-rock-deep)"/>' +
            '<path d="M2.5 20.2 6.1 11.4 10.7 9.3 14.8 13.9 15.5 20.2Z" ' +
            'fill="var(--i-rock)"/>' +
            '<path d="M6.1 11.4 10.7 9.3 14.8 13.9 8.9 14.6Z" ' +
            'fill="var(--i-rock-light)"/>',

        /* two berries on a leafy stem */
        berry:
            '<path d="M13.2 5.5c1.1-2.2 3-3.1 5.6-3 .2 2.8-1.7 4.5-5.6 3Z" ' +
            'fill="var(--i-leaf)"/>' +
            '<path d="M13.5 4.3c.5.3.7.9.4 1.4-1.4 2.3-2.2 4.8-2.6 7.5-.1.6-.6' +
            ' 1-1.2.9s-1-.6-.9-1.2c.4-3 1.4-5.8 2.9-8.3.3-.5.9-.7 1.4-.3Z" ' +
            'fill="var(--i-leaf-deep)"/>' +
            '<circle cx="16.1" cy="16.6" r="3.5" fill="var(--i-berry-deep)"/>' +
            '<circle cx="8.9" cy="15.7" r="4.4" fill="var(--i-berry)"/>' +
            '<circle cx="7.4" cy="14.1" r="1.3" fill="var(--i-shine)"/>',

        /* refined goods */
        plank:
            '<rect x="3.6" y="6.4" width="16.8" height="4" rx="1.2" ' +
            'fill="var(--i-straw)"/>' +
            '<rect x="2.4" y="10.9" width="19.2" height="4" rx="1.2" ' +
            'fill="var(--i-bark)"/>' +
            '<rect x="3.2" y="15.4" width="17.6" height="4" rx="1.2" ' +
            'fill="var(--i-bark-deep)"/>',

        brick:
            '<rect x="7.8" y="8" width="8.4" height="4.2" rx="1" ' +
            'fill="var(--i-roof)"/>' +
            '<rect x="2.8" y="13" width="8.4" height="4.2" rx="1" ' +
            'fill="var(--i-roof-deep)"/>' +
            '<rect x="12.8" y="13" width="8.4" height="4.2" rx="1" ' +
            'fill="var(--i-roof)"/>',

        coin:
            '<circle cx="12" cy="12" r="8.6" fill="var(--i-coin)"/>' +
            '<circle cx="12" cy="12" r="6.1" fill="var(--i-coin-light)"/>' +
            '<circle cx="9.4" cy="9.4" r="1.7" fill="var(--i-shine)"/>',

        /* --- buildings: a shared kit of walls, roofs and one accent --- */

        /* thatched A-frame */
        hut:
            '<path d="M12 3 21.1 19.2a1 1 0 0 1-.9 1.5H3.8a1 1 0 0 1-.9-1.5Z" ' +
            'fill="var(--i-straw)"/>' +
            '<path d="M12 3l9.1 16.2a1 1 0 0 1-.9 1.5H12Z" ' +
            'fill="var(--i-straw-deep)"/>' +
            '<path d="M9.9 20.7v-3.9a2.1 2.1 0 0 1 4.2 0v3.9Z" ' +
            'fill="var(--i-door)"/>',

        /* open shelter over a stack of logs */
        lumber_camp:
            '<path d="M12 3.2 21.8 9.8a.9.9 0 0 1-.5 1.7H2.7a.9.9 0 0 1-.5-1.7Z" ' +
            'fill="var(--i-straw)"/>' +
            '<rect x="4.2" y="11.4" width="1.9" height="8.8" rx=".9" ' +
            'fill="var(--i-bark-deep)"/>' +
            '<rect x="17.9" y="11.4" width="1.9" height="8.8" rx=".9" ' +
            'fill="var(--i-bark-deep)"/>' +
            '<rect x="8.2" y="12.6" width="7.6" height="3.6" rx="1.8" ' +
            'fill="var(--i-bark)"/>' +
            '<rect x="6.4" y="16.4" width="11.2" height="3.8" rx="1.9" ' +
            'fill="var(--i-bark)"/>',

        /* a worked rock face, cut back in terraces */
        quarry:
            '<path d="M11.4 20.4v-6.6l4.9-2.4 5.1 2.8v6.2Z" ' +
            'fill="var(--i-rock-deep)"/>' +
            '<path d="M2.6 20.4v-7.6l4.6-2.8 4.8 2.2v8.2Z" ' +
            'fill="var(--i-rock)"/>' +
            '<path d="M2.6 12.8 7.2 10l4.8 2.2-4.6 2.6Z" ' +
            'fill="var(--i-rock-light)"/>' +
            '<rect x="15.4" y="3.8" width="1.7" height="7.4" rx=".8" ' +
            'transform="rotate(24 16.2 7.5)" fill="var(--i-bark)"/>',

        /* round hut with a picking basket */
        forager:
            '<path d="M12 4.4c3.9 0 7 3.1 7 6.9H5c0-3.8 3.1-6.9 7-6.9Z" ' +
            'fill="var(--i-straw)"/>' +
            '<path d="M12 4.4c3.9 0 7 3.1 7 6.9h-7Z" ' +
            'fill="var(--i-straw-deep)"/>' +
            '<path d="M5.6 11.3h12.8v8.9H5.6Z" fill="var(--i-wall)"/>' +
            '<path d="M12 11.3h6.4v8.9H12Z" fill="var(--i-wall-deep)"/>' +
            '<path d="M9.8 20.2v-4a2.2 2.2 0 0 1 4.4 0v4Z" ' +
            'fill="var(--i-door)"/>' +
            '<circle cx="20.3" cy="17.8" r="2.4" fill="var(--i-berry)"/>',

        /* barn with a wide roof */
        storehouse:
            '<path d="M4.6 10.6h14.8v9.8H4.6Z" fill="var(--i-wall)"/>' +
            '<path d="M12 10.6h7.4v9.8H12Z" fill="var(--i-wall-deep)"/>' +
            '<path d="M12 4.3 21.6 10a1 1 0 0 1-.5 1.9H2.9A1 1 0 0 1 2.4 10Z" ' +
            'fill="var(--i-roof)"/>' +
            '<path d="M9.7 20.4v-4.3a2.3 2.3 0 0 1 4.6 0v4.3Z" ' +
            'fill="var(--i-door)"/>',

        /* well: posts, roof, water, stone rim */
        well:
            '<rect x="6.1" y="7.6" width="1.9" height="8" rx="0.9" ' +
            'fill="var(--i-bark-deep)"/>' +
            '<rect x="16" y="7.6" width="1.9" height="8" rx="0.9" ' +
            'fill="var(--i-bark-deep)"/>' +
            '<path d="M12 2.4 21.3 8.2a1 1 0 0 1-.5 1.9H3.2a1 1 0 0 1-.5-1.9Z" ' +
            'fill="var(--i-roof)"/>' +
            '<ellipse cx="12" cy="13.3" rx="6.6" ry="2" ' +
            'fill="var(--i-water)"/>' +
            '<path d="M5.4 13.6h13.2v5a2.2 2.2 0 0 1-2.2 2.2H7.6a2.2 2.2 0 0 ' +
            '1-2.2-2.2Z" fill="var(--i-rock)"/>' +
            '<path d="M5.4 13.6h13.2v1.7H5.4Z" fill="var(--i-rock-light)"/>',

        /* cottage: one family, one chimney's worth of smoke */
        cottage:
            '<path d="M4.8 10.9h14.4v9.5H4.8Z" fill="var(--i-wall)"/>' +
            '<path d="M12 10.9h7.2v9.5H12Z" fill="var(--i-wall-deep)"/>' +
            '<path d="M12 3.9 21.6 10.3a.9.9 0 0 1-.5 1.7H2.9a.9.9 0 0 1-.5-1.7Z" ' +
            'fill="var(--i-roof)"/>' +
            '<path d="M9.9 20.4v-4.1a2.1 2.1 0 0 1 4.2 0v4.1Z" ' +
            'fill="var(--i-door)"/>' +
            '<rect x="6.2" y="13.2" width="2.7" height="2.7" rx=".7" ' +
            'fill="var(--i-glass)"/>',

        /* townhouse: three storeys of neighbours */
        townhouse:
            '<path d="M5.6 7.6h12.8v12.8H5.6Z" fill="var(--i-wall)"/>' +
            '<path d="M12 7.6h6.4v12.8H12Z" fill="var(--i-wall-deep)"/>' +
            '<path d="M12 2.6 20.6 7.2a.9.9 0 0 1-.4 1.7H3.8a.9.9 0 0 1-.4-1.7Z" ' +
            'fill="var(--i-roof)"/>' +
            '<rect x="7.4" y="10.4" width="2.6" height="2.8" rx=".7" ' +
            'fill="var(--i-glass)"/>' +
            '<rect x="14" y="10.4" width="2.6" height="2.8" rx=".7" ' +
            'fill="var(--i-glass)"/>' +
            '<rect x="7.4" y="15" width="2.6" height="2.8" rx=".7" ' +
            'fill="var(--i-glass)"/>' +
            '<path d="M13.4 20.4v-3.6a2 2 0 0 1 3.2 0v3.6Z" ' +
            'fill="var(--i-door)"/>',

        /* sawmill: a shed and a blade */
        sawmill:
            '<path d="M2.8 11.8h12.4v8.6H2.8Z" fill="var(--i-wall)"/>' +
            '<path d="M9 11.8h6.2v8.6H9Z" fill="var(--i-wall-deep)"/>' +
            '<path d="M9 5.8 16.6 11a.8.8 0 0 1-.4 1.5H1.8a.8.8 0 0 1-.4-1.5Z" ' +
            'fill="var(--i-roof)"/>' +
            '<circle cx="17.6" cy="15.6" r="4.8" fill="var(--i-rock-deep)"/>' +
            '<circle cx="17.6" cy="15.6" r="3" fill="var(--i-rock-light)"/>' +
            '<circle cx="17.6" cy="15.6" r="1.1" fill="var(--i-bark-deep)"/>',

        /* kiln: a domed oven, lit, with smoke lifting off it */
        kiln:
            '<circle cx="8.4" cy="4.8" r="2.3" fill="var(--i-rock-light)"/>' +
            '<circle cx="12.4" cy="7" r="1.6" fill="var(--i-rock-light)"/>' +
            '<path d="M12 8.8a6.6 6.6 0 0 1 6.6 6.6v2.4H5.4v-2.4A6.6 6.6 0 0 1 ' +
            '12 8.8Z" fill="var(--i-roof-deep)"/>' +
            '<path d="M12 8.8a6.6 6.6 0 0 1 6.6 6.6v2.4H12Z" ' +
            'fill="var(--i-bark-deep)"/>' +
            '<rect x="3.6" y="17.4" width="16.8" height="3" rx="1.2" ' +
            'fill="var(--i-rock)"/>' +
            '<path d="M10 17.4v-2a2 2 0 0 1 4 0v2Z" fill="var(--i-ember)"/>',

        /* garden: a hedge in bloom */
        garden:
            '<circle cx="6.6" cy="9.4" r="2.4" fill="var(--i-berry)"/>' +
            '<circle cx="12" cy="7.4" r="2.4" fill="var(--i-coin)"/>' +
            '<circle cx="17.4" cy="9.4" r="2.4" fill="var(--i-berry)"/>' +
            '<rect x="2.8" y="12.6" width="18.4" height="7.6" rx="3" ' +
            'fill="var(--i-leaf)"/>' +
            '<path d="M12 12.6h6.2a3 3 0 0 1 3 3v1.6a3 3 0 0 1-3 3H12Z" ' +
            'fill="var(--i-leaf-deep)"/>',

        /* market: a striped awning over a counter */
        market:
            '<rect x="4.4" y="13.4" width="15.2" height="6.8" rx="1.4" ' +
            'fill="var(--i-wall)"/>' +
            '<path d="M12 13.4h6.2a1.4 1.4 0 0 1 1.4 1.4v4a1.4 1.4 0 0 ' +
            '1-1.4 1.4H12Z" fill="var(--i-wall-deep)"/>' +
            '<path d="M2.4 7.6h19.2v4.2H2.4Z" fill="var(--i-roof)"/>' +
            '<rect x="6.2" y="7.6" width="3.2" height="4.2" ' +
            'fill="var(--i-wall)"/>' +
            '<rect x="14.6" y="7.6" width="3.2" height="4.2" ' +
            'fill="var(--i-wall)"/>' +
            '<rect x="10.4" y="4.4" width="3.2" height="3.2" rx="1" ' +
            'fill="var(--i-bark)"/>',

        /* metropolis: towers, the tallest crowned */
        metropolis:
            '<rect x="2.2" y="11.2" width="6" height="9.6" rx="1.3" ' +
            'fill="var(--i-wall-deep)"/>' +
            '<rect x="15.8" y="9.4" width="6" height="11.4" rx="1.3" ' +
            'fill="var(--i-wall-deep)"/>' +
            '<rect x="8.6" y="6.6" width="6.8" height="14.2" rx="1.3" ' +
            'fill="var(--i-wall)"/>' +
            '<path d="M12 1.8 16.2 6.6H7.8Z" fill="var(--i-roof)"/>' +
            '<rect x="4" y="13.4" width="2.4" height="2.6" rx=".6" ' +
            'fill="var(--i-glass)"/>' +
            '<rect x="17.6" y="11.8" width="2.4" height="2.6" rx=".6" ' +
            'fill="var(--i-glass)"/>' +
            '<rect x="10.8" y="9.4" width="2.4" height="2.6" rx=".6" ' +
            'fill="var(--i-glass)"/>' +
            '<rect x="10.8" y="14" width="2.4" height="2.6" rx=".6" ' +
            'fill="var(--i-glass)"/>',

        /* town hall: a broad civic front with a bell tower */
        town_hall:
            '<path d="M12 2 15.8 4.6a.7.7 0 0 1-.4 1.3H8.6a.7.7 0 0 1-.4-1.3Z" ' +
            'fill="var(--i-roof-deep)"/>' +
            '<rect x="10.1" y="5.9" width="3.8" height="4.6" ' +
            'fill="var(--i-wall)"/>' +
            '<path d="M2.6 13h18.8v7.4H2.6Z" fill="var(--i-wall)"/>' +
            '<path d="M12 13h9.4v7.4H12Z" fill="var(--i-wall-deep)"/>' +
            '<path d="M12 8.8 22 13.4a.8.8 0 0 1-.4 1.5H2.4A.8.8 0 0 1 2 13.4Z" ' +
            'fill="var(--i-roof)"/>' +
            '<circle cx="12" cy="7.9" r="1.4" fill="var(--i-coin-light)"/>' +
            '<path d="M9.9 20.4v-3.8a2.1 2.1 0 0 1 4.2 0v3.8Z" ' +
            'fill="var(--i-door)"/>'
    };

    function wrap(body, isArt) {
        return (
            '<svg class="icon' +
            (isArt ? " icon--art" : "") +
            '" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
            body +
            "</svg>"
        );
    }

    Game.Icons = {
        has: function (name) {
            return !!(art[name] || line[name]);
        },

        svg: function (name) {
            if (art[name]) return wrap(art[name], true);
            if (line[name]) return wrap(line[name], false);
            return "";
        },

        /** Replaces every <element data-icon="name"> inside root with its icon. */
        hydrate: function (root) {
            var host = root || document;
            var slots = host.querySelectorAll("[data-icon]");
            Array.prototype.forEach.call(slots, function (slot) {
                var name = slot.getAttribute("data-icon");
                if (!name || slot.firstElementChild) return;
                slot.innerHTML = Game.Icons.svg(name);
            });
        }
    };
})();
