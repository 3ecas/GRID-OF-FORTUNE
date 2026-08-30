window.Game = window.Game || {};

(function () {

    var line = {
        place:
            '<rect x="3.4" y="3.4" width="17.2" height="17.2" rx="4.4"/>' +
            '<path d="M12 8.4v7.2M8.4 12h7.2"/>',

        close: '<path d="M6.8 6.8 17.2 17.2M17.2 6.8 6.8 17.2"/>',

        sound:
            '<path d="M4 9.4h3.3L11.8 5.5v13L7.3 14.6H4z"/>' +
            '<path d="M15.2 9.7a3.3 3.3 0 0 1 0 4.6"/>' +
            '<path d="M17.8 7.1a6.9 6.9 0 0 1 0 9.8"/>',

        mute:
            '<path d="M4 9.4h3.3L11.8 5.5v13L7.3 14.6H4z"/>' +
            '<path d="M15.4 9.9 20 14.5M20 9.9l-4.6 4.6"/>',

        ladder: '<path d="M9 6.2h6M7.5 12h9M6 17.8h12"/>',

        back: '<path d="M18.4 12H6.2M11.4 6.8 6.2 12l5.2 5.2"/>',

        play: '<path d="M8.6 5.9 18.4 12l-9.8 6.1Z" fill="currentColor" stroke="none"/>'
    };

    var art = {

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

        iron:
            '<path d="M3.4 19.4 5.6 13h12.8l2.2 6.4Z" fill="var(--i-iron)"/>' +
            '<path d="M12 13h6.4l2.2 6.4H12Z" fill="var(--i-iron-deep)"/>' +
            '<path d="M5.6 13 7 9.6h10l1.4 3.4Z" fill="var(--i-iron-light)"/>' +
            '<path d="M12 9.6h5l1.4 3.4H12Z" fill="var(--i-iron)"/>',

        silver_ore:
            '<path d="M12.4 19.6c-3 0-5-1.8-5-4.2s2-4.2 5-4.2 5 1.8 5 4.2-2 4.2-5 4.2Z" ' +
            'fill="var(--i-silver)"/>' +
            '<path d="M12.4 11.2c3 0 5 1.8 5 4.2s-2 4.2-5 4.2Z" ' +
            'fill="var(--i-silver-deep)"/>' +
            '<path d="M8.4 12.4c-2.4 0-4-1.4-4-3.4s1.6-3.4 4-3.4 4 1.4 4 3.4-1.6 3.4-4 3.4Z" ' +
            'fill="var(--i-silver-light)"/>' +
            '<path d="M8.4 5.6c2.4 0 4 1.4 4 3.4s-1.6 3.4-4 3.4Z" ' +
            'fill="var(--i-silver)"/>',

        tin:
            '<path d="M12 3.4 20.6 8.2 12 13 3.4 8.2Z" ' +
            'fill="var(--i-tin-light)"/>' +
            '<path d="M3.4 8.2 12 13v7.6L3.4 15.8Z" fill="var(--i-tin)"/>' +
            '<path d="M20.6 8.2 12 13v7.6l8.6-4.8Z" ' +
            'fill="var(--i-tin-deep)"/>',

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

        coins:
            '<ellipse cx="12" cy="17.4" rx="8" ry="2.8" ' +
            'fill="var(--i-gold-deep)"/>' +
            '<ellipse cx="12" cy="12.6" rx="8" ry="2.8" fill="var(--i-gold)"/>' +
            '<ellipse cx="12" cy="7.8" rx="8" ry="2.8" ' +
            'fill="var(--i-gold-light)"/>',

        ingot:
            '<path d="M3.6 19.8 6.6 12.6h10.8l3 7.2Z" fill="var(--i-gold)"/>' +
            '<path d="M12 12.6h5.4l3 7.2H12Z" fill="var(--i-gold-deep)"/>' +
            '<path d="M6.6 12.6 8.2 9.2h7.6l1.6 3.4Z" ' +
            'fill="var(--i-gold-light)"/>' +
            '<path d="M12 9.2h3.8l1.6 3.4H12Z" fill="var(--i-gold)"/>',

        topaz:
            '<path d="M12 2.6c3.6 4 5.6 6.9 5.6 10.2a5.6 5.6 0 0 1-11.2 0c0-3.3 2-6.2 5.6-10.2Z" ' +
            'fill="var(--i-topaz)"/>' +
            '<path d="M12 2.6c3.6 4 5.6 6.9 5.6 10.2a5.6 5.6 0 0 1-5.6 5.6Z" ' +
            'fill="var(--i-topaz-deep)"/>' +
            '<path d="M6.4 12.8h11.2a5.6 5.6 0 0 1-11.2 0Z" ' +
            'fill="var(--i-topaz-light)" opacity=".45"/>',

        amethyst:
            '<path d="M12 2.6 17.2 8v8.4L12 21.4 6.8 16.4V8Z" ' +
            'fill="var(--i-amethyst)"/>' +
            '<path d="M12 2.6 17.2 8v8.4L12 21.4Z" ' +
            'fill="var(--i-amethyst-deep)"/>' +
            '<path d="M6.8 8 12 2.6 17.2 8 12 10.6Z" ' +
            'fill="var(--i-amethyst-light)"/>',

        emerald:
            '<path d="M8.4 4h7.2l4.4 4.4v7.2L15.6 20H8.4L4 15.6V8.4Z" ' +
            'fill="var(--i-emerald)"/>' +
            '<path d="M12 4h3.6L20 8.4v7.2L15.6 20H12Z" ' +
            'fill="var(--i-emerald-deep)"/>' +
            '<path d="M9.6 7h4.8l2.6 2.6v4.8L14.4 17H9.6L7 14.4V9.6Z" ' +
            'fill="var(--i-emerald-light)" opacity=".5"/>',

        ruby:
            '<path d="M12 2.6c3.3 3.7 5 6.8 5 9.4s-1.7 5.7-5 9.4c-3.3-3.7-5-6.8-5-9.4s1.7-5.7 5-9.4Z" ' +
            'fill="var(--i-ruby)"/>' +
            '<path d="M12 2.6c3.3 3.7 5 6.8 5 9.4s-1.7 5.7-5 9.4Z" ' +
            'fill="var(--i-ruby-deep)"/>' +
            '<path d="M12 2.6c3.3 3.7 5 6.8 5 9.4H7c0-2.6 1.7-5.7 5-9.4Z" ' +
            'fill="var(--i-ruby-light)" opacity=".4"/>',

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

        crown:
            '<path d="M2.8 6.8 7 12.2 12 4l5 8.2 4.2-5.4-1.4 10.2H4.2Z" ' +
            'fill="var(--i-gold)"/>' +
            '<path d="M12 4l5 8.2 4.2-5.4-1.4 10.2H12Z" ' +
            'fill="var(--i-gold-deep)"/>' +
            '<path d="M4.2 17.8h15.6V20H4.2Z" fill="var(--i-gold-light)"/>' +
            '<path d="M12 17.8h7.8V20H12Z" fill="var(--i-gold)"/>',

        treasure:
            '<path d="M3.4 12.6h17.2v7.4H3.4Z" fill="var(--i-copper)"/>' +
            '<path d="M12 12.6h8.6v7.4H12Z" fill="var(--i-copper-deep)"/>' +
            '<path d="M3.4 12.6a8.6 5.2 0 0 1 17.2 0Z" ' +
            'fill="var(--i-copper-light)"/>' +
            '<path d="M12 7.4a8.6 5.2 0 0 1 8.6 5.2H12Z" ' +
            'fill="var(--i-copper)"/>' +
            '<path d="M10.4 11.4h3.2v5.2h-3.2Z" fill="var(--i-gold)"/>',

        vault:
            '<rect x="2.8" y="3.8" width="18.4" height="16.4" rx="3" ' +
            'fill="var(--i-silver)"/>' +
            '<path d="M12 3.8h6.4a3 3 0 0 1 3 3v10.4a3 3 0 0 1-3 3H12Z" ' +
            'fill="var(--i-silver-deep)"/>' +
            '<circle cx="12" cy="12" r="5.6" fill="var(--i-silver-light)"/>' +
            '<circle cx="12" cy="12" r="2.2" fill="var(--i-gold)"/>',

        dynamite:
            '<path d="M5.6 10.8h12.8a1.8 1.8 0 0 1 1.8 1.8v4.6a1.8 1.8 0 0 1 ' +
            '-1.8 1.8H5.6a1.8 1.8 0 0 1-1.8-1.8v-4.6a1.8 1.8 0 0 1 1.8-1.8Z" ' +
            'fill="var(--i-tnt)"/>' +
            '<path d="M12 10.8h6.4a1.8 1.8 0 0 1 1.8 1.8v4.6a1.8 1.8 0 0 1 ' +
            '-1.8 1.8H12Z" fill="var(--i-tnt-deep)"/>' +
            '<path d="M3.8 13.4h16.4v2.2H3.8Z" fill="var(--i-tnt-light)"/>' +
            '<path d="M11 10.8V8.4a2.6 2.6 0 0 1 2.6-2.6h.6v1.6h-.6a1 1 0 0 ' +
            '0-1 1v2.4Z" fill="var(--i-tnt-fuse)"/>' +
            '<path d="M15.2 4.2a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z" ' +
            'fill="var(--i-tnt-spark)"/>',

        lodestone:
            '<path d="M6.2 4.6h4v8.2a1.8 1.8 0 0 0 3.6 0V4.6h4v8.2a5.4 5.4 0 ' +
            '0 1-11.6 0Z" fill="var(--i-lode)"/>' +
            '<path d="M13.8 4.6h4v8.2a5.4 5.4 0 0 1-5.8 5.4v-3.8a1.8 1.8 0 0 ' +
            '0 1.8-1.6Z" fill="var(--i-lode-deep)"/>' +
            '<path d="M6.2 4.6h4v3.2h-4ZM13.8 4.6h4v3.2h-4Z" ' +
            'fill="var(--i-lode-tip)"/>',

        rubble:
            '<path d="M2.6 19.8 5 15.4l4 1 2.2 3.4Z" fill="var(--i-rock)"/>' +
            '<path d="M9.4 19.8 11 13.6l4.6-.8 2.2 7Z" ' +
            'fill="var(--i-rock-deep)"/>' +
            '<path d="M11 13.6l4.6-.8-.4 3Z" fill="var(--i-rock)"/>' +
            '<path d="M16.4 19.8 18 15.8l3.4 1v3Z" fill="var(--i-rock)"/>' +
            '<path d="M6.2 12.6 8.4 9.4l2.6 2-1.4 2.6Z" ' +
            'fill="var(--i-rock-light)"/>',

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
