window.Game = window.Game || {};

/**
 * icons.js — the icon set. No emoji anywhere in the game.
 *
 * Two families, on purpose:
 *
 *   line — UI chrome. One stroke weight, inherits the parent's colour so it
 *          reads on any surface.
 *
 *   art  — the ladder itself. Flat geometry, two tones, and a single light
 *          source: the right-hand face is always the shaded one. No
 *          highlights, no emblems, no trinkets. Every shape sets its own fill
 *          from the --i-* palette in theme.css, so the whole set recolours
 *          from one place.
 *
 * Use it two ways:
 *   markup:  <span data-icon="crown"></span>   then Game.Icons.hydrate(root)
 *   string:  Game.Icons.svg("crown")
 */
(function () {
    /* ------------------------------------------------------------ line icons */

    var line = {
        place:
            '<rect x="3.4" y="3.4" width="17.2" height="17.2" rx="4.4"/>' +
            '<path d="M12 8.4v7.2M8.4 12h7.2"/>',

        close: '<path d="M6.8 6.8 17.2 17.2M17.2 6.8 6.8 17.2"/>'
    };

    /* ---------------------------------------------------- illustrated icons */

    var art = {
        /* --- out of the ground --- */

        dirt:
            '<path d="M2.6 18.8c0-4.4 4.2-7.6 9.4-7.6s9.4 3.2 9.4 7.6Z" ' +
            'fill="var(--i-dirt)"/>' +
            '<path d="M12 11.2c5.2 0 9.4 3.2 9.4 7.6H12Z" ' +
            'fill="var(--i-dirt-deep)"/>' +
            '<path d="M7.4 13.6a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z" ' +
            'fill="var(--i-dirt-light)"/>',

        rock:
            '<path d="M3 19.2 5.6 9.6 12 6.6l6.6 3.8 2.4 8.8Z" ' +
            'fill="var(--i-rock)"/>' +
            '<path d="M12 6.6l6.6 3.8 2.4 8.8H12Z" ' +
            'fill="var(--i-rock-deep)"/>' +
            '<path d="M5.6 9.6 12 6.6l6.6 3.8-6.6 2.4Z" ' +
            'fill="var(--i-rock-light)"/>',

        /* smelted: a small rough bar */
        iron:
            '<path d="M3.4 19.4 5.6 13h12.8l2.2 6.4Z" fill="var(--i-iron)"/>' +
            '<path d="M12 13h6.4l2.2 6.4H12Z" fill="var(--i-iron-deep)"/>' +
            '<path d="M5.6 13 7 9.6h10l1.4 3.4Z" fill="var(--i-iron-light)"/>' +
            '<path d="M12 9.6h5l1.4 3.4H12Z" fill="var(--i-iron)"/>',

        /* two bright nuggets */
        silver_ore:
            '<path d="M12.4 19.6c-3 0-5-1.8-5-4.2s2-4.2 5-4.2 5 1.8 5 4.2-2 4.2-5 4.2Z" ' +
            'fill="var(--i-silver)"/>' +
            '<path d="M12.4 11.2c3 0 5 1.8 5 4.2s-2 4.2-5 4.2Z" ' +
            'fill="var(--i-silver-deep)"/>' +
            '<path d="M8.4 12.4c-2.4 0-4-1.4-4-3.4s1.6-3.4 4-3.4 4 1.4 4 3.4-1.6 3.4-4 3.4Z" ' +
            'fill="var(--i-silver-light)"/>' +
            '<path d="M8.4 5.6c2.4 0 4 1.4 4 3.4s-1.6 3.4-4 3.4Z" ' +
            'fill="var(--i-silver)"/>',

        /* a cast block — a cube, so it never reads as another bar */
        tin:
            '<path d="M12 3.4 20.6 8.2 12 13 3.4 8.2Z" ' +
            'fill="var(--i-tin-light)"/>' +
            '<path d="M3.4 8.2 12 13v7.6L3.4 15.8Z" fill="var(--i-tin)"/>' +
            '<path d="M20.6 8.2 12 13v7.6l8.6-4.8Z" ' +
            'fill="var(--i-tin-deep)"/>',

        /* --- minted --- */

        copper:
            '<circle cx="12" cy="12" r="7" fill="var(--i-copper)"/>' +
            '<path d="M12 5a7 7 0 0 1 0 14Z" fill="var(--i-copper-deep)"/>' +
            '<circle cx="12" cy="12" r="3.4" fill="var(--i-copper-light)"/>',

        silver:
            '<circle cx="12" cy="12" r="8" fill="var(--i-silver)"/>' +
            '<path d="M12 4a8 8 0 0 1 0 16Z" fill="var(--i-silver-deep)"/>' +
            '<circle cx="12" cy="12" r="4.8" fill="var(--i-silver-light)"/>' +
            '<circle cx="12" cy="12" r="2" fill="var(--i-silver)"/>',

        gold:
            '<circle cx="12" cy="12" r="9" fill="var(--i-gold)"/>' +
            '<path d="M12 3a9 9 0 0 1 0 18Z" fill="var(--i-gold-deep)"/>' +
            '<circle cx="12" cy="12" r="5.8" fill="var(--i-gold-light)"/>' +
            '<circle cx="12" cy="12" r="3" fill="var(--i-gold)"/>',

        /* three discs, seen from an angle */
        coins:
            '<ellipse cx="12" cy="17.4" rx="8" ry="2.8" ' +
            'fill="var(--i-gold-deep)"/>' +
            '<ellipse cx="12" cy="12.6" rx="8" ry="2.8" fill="var(--i-gold)"/>' +
            '<ellipse cx="12" cy="7.8" rx="8" ry="2.8" ' +
            'fill="var(--i-gold-light)"/>',

        /* one cast bar, tapered the way a bar is, with a lit top face */
        ingot:
            '<path d="M3.6 19.8 6.6 12.6h10.8l3 7.2Z" fill="var(--i-gold)"/>' +
            '<path d="M12 12.6h5.4l3 7.2H12Z" fill="var(--i-gold-deep)"/>' +
            '<path d="M6.6 12.6 8.2 9.2h7.6l1.6 3.4Z" ' +
            'fill="var(--i-gold-light)"/>' +
            '<path d="M12 9.2h3.8l1.6 3.4H12Z" fill="var(--i-gold)"/>',

        /* --- cut --- */

        /* pear cut */
        topaz:
            '<path d="M12 2.6c3.6 4 5.6 6.9 5.6 10.2a5.6 5.6 0 0 1-11.2 0c0-3.3 2-6.2 5.6-10.2Z" ' +
            'fill="var(--i-topaz)"/>' +
            '<path d="M12 2.6c3.6 4 5.6 6.9 5.6 10.2a5.6 5.6 0 0 1-5.6 5.6Z" ' +
            'fill="var(--i-topaz-deep)"/>' +
            '<path d="M6.4 12.8h11.2a5.6 5.6 0 0 1-11.2 0Z" ' +
            'fill="var(--i-topaz-light)" opacity=".45"/>',

        /* a single hexagonal crystal, cut down the middle */
        amethyst:
            '<path d="M12 2.6 17.2 8v8.4L12 21.4 6.8 16.4V8Z" ' +
            'fill="var(--i-amethyst)"/>' +
            '<path d="M12 2.6 17.2 8v8.4L12 21.4Z" ' +
            'fill="var(--i-amethyst-deep)"/>' +
            '<path d="M6.8 8 12 2.6 17.2 8 12 10.6Z" ' +
            'fill="var(--i-amethyst-light)"/>',

        /* step cut */
        emerald:
            '<path d="M8.4 4h7.2l4.4 4.4v7.2L15.6 20H8.4L4 15.6V8.4Z" ' +
            'fill="var(--i-emerald)"/>' +
            '<path d="M12 4h3.6L20 8.4v7.2L15.6 20H12Z" ' +
            'fill="var(--i-emerald-deep)"/>' +
            '<path d="M9.6 7h4.8l2.6 2.6v4.8L14.4 17H9.6L7 14.4V9.6Z" ' +
            'fill="var(--i-emerald-light)" opacity=".5"/>',

        /* marquise */
        ruby:
            '<path d="M12 2.6c3.3 3.7 5 6.8 5 9.4s-1.7 5.7-5 9.4c-3.3-3.7-5-6.8-5-9.4s1.7-5.7 5-9.4Z" ' +
            'fill="var(--i-ruby)"/>' +
            '<path d="M12 2.6c3.3 3.7 5 6.8 5 9.4s-1.7 5.7-5 9.4Z" ' +
            'fill="var(--i-ruby-deep)"/>' +
            '<path d="M12 2.6c3.3 3.7 5 6.8 5 9.4H7c0-2.6 1.7-5.7 5-9.4Z" ' +
            'fill="var(--i-ruby-light)" opacity=".4"/>',

        /* brilliant: table, girdle, pavilion */
        sapphire:
            '<path d="M7.4 3.6h9.2L21 9.4 12 20.8 3 9.4Z" ' +
            'fill="var(--i-sapphire)"/>' +
            '<path d="M12 3.6h4.6L21 9.4 12 20.8Z" ' +
            'fill="var(--i-sapphire-deep)"/>' +
            '<path d="M7.4 3.6h9.2L18.4 9.4H5.6Z" ' +
            'fill="var(--i-sapphire-light)"/>' +
            '<path d="M12 3.6h4.6l1.8 5.8H12Z" fill="var(--i-sapphire)"/>',

        diamond:
            '<path d="M7.4 3.6h9.2L21 9.4 12 20.8 3 9.4Z" ' +
            'fill="var(--i-diamond)"/>' +
            '<path d="M12 3.6h4.6L21 9.4 12 20.8Z" ' +
            'fill="var(--i-diamond-deep)"/>' +
            '<path d="M7.4 3.6h9.2L18.4 9.4H5.6Z" ' +
            'fill="var(--i-diamond-light)"/>' +
            '<path d="M12 3.6h4.6l1.8 5.8H12Z" fill="var(--i-diamond)"/>',

        /* --- kept --- */

        crown:
            '<path d="M2.8 6.8 7 12.2 12 4l5 8.2 4.2-5.4-1.4 10.2H4.2Z" ' +
            'fill="var(--i-gold)"/>' +
            '<path d="M12 4l5 8.2 4.2-5.4-1.4 10.2H12Z" ' +
            'fill="var(--i-gold-deep)"/>' +
            '<path d="M4.2 17.8h15.6V20H4.2Z" fill="var(--i-gold-light)"/>' +
            '<path d="M12 17.8h7.8V20H12Z" fill="var(--i-gold)"/>',

        /* what a crown goes into */
        treasure:
            '<path d="M3.4 12.6h17.2v7.4H3.4Z" fill="var(--i-copper)"/>' +
            '<path d="M12 12.6h8.6v7.4H12Z" fill="var(--i-copper-deep)"/>' +
            '<path d="M3.4 12.6a8.6 5.2 0 0 1 17.2 0Z" ' +
            'fill="var(--i-copper-light)"/>' +
            '<path d="M12 7.4a8.6 5.2 0 0 1 8.6 5.2H12Z" ' +
            'fill="var(--i-copper)"/>' +
            '<path d="M10.4 11.4h3.2v5.2h-3.2Z" fill="var(--i-gold)"/>',

        /* and what the treasure goes into */
        vault:
            '<rect x="2.8" y="3.8" width="18.4" height="16.4" rx="3" ' +
            'fill="var(--i-silver)"/>' +
            '<path d="M12 3.8h6.4a3 3 0 0 1 3 3v10.4a3 3 0 0 1-3 3H12Z" ' +
            'fill="var(--i-silver-deep)"/>' +
            '<circle cx="12" cy="12" r="5.6" fill="var(--i-silver-light)"/>' +
            '<circle cx="12" cy="12" r="2.2" fill="var(--i-gold)"/>',

        /* spoil: flat, broken, plainly not worth anything */
        rubble:
            '<path d="M2.6 19.8 5 15.4l4 1 2.2 3.4Z" fill="var(--i-rock)"/>' +
            '<path d="M9.4 19.8 11 13.6l4.6-.8 2.2 7Z" ' +
            'fill="var(--i-rock-deep)"/>' +
            '<path d="M11 13.6l4.6-.8-.4 3Z" fill="var(--i-rock)"/>' +
            '<path d="M16.4 19.8 18 15.8l3.4 1v3Z" fill="var(--i-rock)"/>' +
            '<path d="M6.2 12.6 8.4 9.4l2.6 2-1.4 2.6Z" ' +
            'fill="var(--i-rock-light)"/>',

        /* thrown about when something joins up */
        sparkle:
            '<path d="M12 2.2 14 10 21.8 12 14 14 12 21.8 10 14 2.2 12 10 10Z" ' +
            'fill="var(--i-gold-light)"/>'
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
