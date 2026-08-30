window.Game = window.Game || {};

(function () {
    var line = {
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

        coal:
            '<path d="M4.6 14.2 8 7.4l6.6-1.6 5 4.4-1.2 6.6-6.8 2.6-6-2.4Z" ' +
            'fill="var(--i-coal)"/>' +
            '<path d="M11.6 8.6 19.6 10.2l-1.2 6.6-6.8 2.6Z" ' +
            'fill="var(--i-coal-deep)"/>' +
            '<path d="M8 7.4 14.6 5.8l5 4.4-8 -1.6Z" ' +
            'fill="var(--i-coal-light)"/>',

        zinc:
            '<path d="M8.2 4.6h7.6l3.8 6.6-3.8 6.6H8.2L4.4 11.2Z" ' +
            'fill="var(--i-zinc)"/>' +
            '<path d="M12 4.6h3.8l3.8 6.6-3.8 6.6H12Z" ' +
            'fill="var(--i-zinc-deep)"/>' +
            '<path d="M8.2 4.6h7.6l1.6 2.8H6.6Z" ' +
            'fill="var(--i-zinc-light)"/>',

        bronze:
            '<path d="M12 5.4a6.6 6.6 0 1 1 0 13.2 6.6 6.6 0 0 1 0-13.2Zm0 3.6a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" ' +
            'fill="var(--i-bronze)"/>' +
            '<path d="M12 5.4a6.6 6.6 0 0 1 0 13.2v-3.6a3 3 0 0 0 0-6Z" ' +
            'fill="var(--i-bronze-deep)"/>' +
            '<path d="M12 5.4a6.6 6.6 0 0 0-6.6 6.6h3.6a3 3 0 0 1 3-3Z" ' +
            'fill="var(--i-bronze-light)"/>',

        titanium:
            '<path d="M12 3.4 19.8 8v8l-7.8 4.6L4.2 16V8Z" ' +
            'fill="var(--i-titanium)"/>' +
            '<path d="M12 3.4 19.8 8v8l-7.8 4.6Z" ' +
            'fill="var(--i-titanium-deep)"/>' +
            '<path d="M12 7.4 16.2 9.8v4.4L12 16.6 7.8 14.2V9.8Z" ' +
            'fill="var(--i-titanium-light)" opacity=".5"/>',

        iridium:
            '<path d="M6.4 8.2 12 4.8l5.6 3.4v6.4L12 18l-5.6-3.4Z" ' +
            'fill="var(--i-iridium)"/>' +
            '<path d="M12 4.8 17.6 8.2v6.4L12 18Z" ' +
            'fill="var(--i-iridium-deep)"/>' +
            '<path d="M6.4 8.2 12 4.8l5.6 3.4L12 11.4Z" ' +
            'fill="var(--i-iridium-light)"/>' +
            '<path d="M9 19.6h6l-1 1.8h-4Z" fill="var(--i-iridium-deep)"/>',

        quartz:
            '<path d="M9.4 2.8h5.2l2.8 5.6-2 12H8.6l-2-12Z" ' +
            'fill="var(--i-quartz)"/>' +
            '<path d="M12 2.8h2.6l2.8 5.6-2 12H12Z" ' +
            'fill="var(--i-quartz-deep)"/>' +
            '<path d="M9.4 2.8h5.2l2.8 5.6H6.6Z" ' +
            'fill="var(--i-quartz-light)"/>',

        turquoise:
            '<path d="M12 4.4c4.6 0 7.6 3 7.6 7s-3 7-7.6 7-7.6-3-7.6-7 3-7 7.6-7Z" ' +
            'fill="var(--i-turquoise)"/>' +
            '<path d="M12 4.4c4.6 0 7.6 3 7.6 7s-3 7-7.6 7Z" ' +
            'fill="var(--i-turquoise-deep)"/>' +
            '<path d="M7 9.6c1.6-.8 3-.4 4.2.6M13.4 15.6c1.6.4 2.8-.2 3.6-1.4" ' +
            'stroke="var(--i-turquoise-deep)" stroke-width="1.1" fill="none" ' +
            'stroke-linecap="round"/>' +
            '<path d="M8 7.6c1.4-.9 3-1.2 4-1.2" stroke="var(--i-turquoise-light)" ' +
            'stroke-width="1.3" fill="none" stroke-linecap="round"/>',

        garnet:
            '<path d="M12 3 18.6 7v10L12 21 5.4 17V7Z" fill="var(--i-garnet)"/>' +
            '<path d="M12 3 18.6 7v10L12 21Z" fill="var(--i-garnet-deep)"/>' +
            '<path d="M12 3 18.6 7 12 10.6 5.4 7Z" ' +
            'fill="var(--i-garnet-light)" opacity=".7"/>',

        lapis:
            '<path d="M5 6.4h14a1.6 1.6 0 0 1 1.6 1.6v8a1.6 1.6 0 0 1-1.6 1.6H5A1.6 1.6 0 0 1 3.4 16V8A1.6 1.6 0 0 1 5 6.4Z" ' +
            'fill="var(--i-lapis)"/>' +
            '<path d="M12 6.4h7a1.6 1.6 0 0 1 1.6 1.6v8a1.6 1.6 0 0 1-1.6 1.6h-7Z" ' +
            'fill="var(--i-lapis-deep)"/>' +
            '<circle cx="7.6" cy="10" r="1" fill="var(--i-lapis-fleck)"/>' +
            '<circle cx="15.4" cy="13.6" r=".9" fill="var(--i-lapis-fleck)"/>' +
            '<circle cx="11" cy="14.6" r=".7" fill="var(--i-lapis-fleck)" opacity=".8"/>' +
            '<circle cx="16.6" cy="9" r=".6" fill="var(--i-lapis-fleck)" opacity=".7"/>',

        tourmaline:
            '<path d="M8.6 3.2h6.8l1.8 3v14.6H6.8V6.2Z" ' +
            'fill="var(--i-tourmaline)"/>' +
            '<path d="M6.8 13.4h10.4v7.4H6.8Z" ' +
            'fill="var(--i-tourmaline-deep)"/>' +
            '<path d="M8.6 3.2h6.8l1.8 3H6.8Z" ' +
            'fill="var(--i-tourmaline-light)"/>',

        jadeite:
            '<path d="M12 4a8 8 0 1 1 0 16 8 8 0 0 1 0-16Zm0 5.4a2.6 2.6 0 1 0 0 5.2 2.6 2.6 0 0 0 0-5.2Z" ' +
            'fill="var(--i-jadeite)"/>' +
            '<path d="M12 4a8 8 0 0 1 0 16v-5.4a2.6 2.6 0 0 0 0-5.2Z" ' +
            'fill="var(--i-jadeite-deep)"/>' +
            '<path d="M6.6 7.4A8 8 0 0 1 12 4v5.4a2.6 2.6 0 0 0-2.3 1.4Z" ' +
            'fill="var(--i-jadeite-light)" opacity=".75"/>',

        beryl:
            '<path d="M8.4 3.6h7.2l2.4 3.4v10l-2.4 3.4H8.4L6 17V7Z" ' +
            'fill="var(--i-beryl)"/>' +
            '<path d="M12 3.6h3.6L18 7v10l-2.4 3.4H12Z" ' +
            'fill="var(--i-beryl-deep)"/>' +
            '<path d="M8.4 3.6h7.2L18 7H6Z" ' +
            'fill="var(--i-beryl-light)"/>' +
            '<path d="M9.4 8.6h5.2v6.8H9.4Z" ' +
            'fill="var(--i-beryl-light)" opacity=".35"/>',

        platinum:
            '<path d="M4.2 9.4h15.6l1.4 5.2H2.8Z" fill="var(--i-platinum)"/>' +
            '<path d="M12 9.4h7.8l1.4 5.2H12Z" fill="var(--i-platinum-deep)"/>' +
            '<path d="M4.2 9.4h15.6l-.5 1.8H4.7Z" fill="var(--i-platinum-light)"/>' +
            '<path d="M6.6 15.8h10.8l.8 2.8H5.8Z" fill="var(--i-platinum)" opacity=".55"/>',

        rhodium:
            '<path d="M12 2.8 19.6 12 12 21.2 4.4 12Z" fill="var(--i-rhodium)"/>' +
            '<path d="M12 2.8 19.6 12 12 21.2Z" fill="var(--i-rhodium-deep)"/>' +
            '<path d="M12 2.8 16 12H8Z" fill="var(--i-rhodium-light)"/>' +
            '<path d="M9.2 8.4 12 5v3.6Z" fill="var(--i-shine)"/>',

        citrine:
            '<path d="M8 3.4h8A4.6 4.6 0 0 1 20.6 8v8a4.6 4.6 0 0 1-4.6 4.6H8A4.6 4.6 0 0 1 3.4 16V8A4.6 4.6 0 0 1 8 3.4Z" ' +
            'fill="var(--i-citrine)"/>' +
            '<path d="M12 3.4h4A4.6 4.6 0 0 1 20.6 8v8a4.6 4.6 0 0 1-4.6 4.6h-4Z" ' +
            'fill="var(--i-citrine-deep)"/>' +
            '<path d="M9.4 7.4h5.2l2 2v5.2l-2 2H9.4l-2-2V9.4Z" ' +
            'fill="var(--i-citrine-light)" opacity=".45"/>',

        peridot:
            '<path d="M12 3c3.4 0 5.8 3.8 5.8 9s-2.4 9-5.8 9-5.8-3.8-5.8-9S8.6 3 12 3Z" ' +
            'fill="var(--i-peridot)"/>' +
            '<path d="M12 3c3.4 0 5.8 3.8 5.8 9s-2.4 9-5.8 9Z" ' +
            'fill="var(--i-peridot-deep)"/>' +
            '<path d="M12 5.4c2 0 3.4 2.7 3.4 6.6H8.6c0-3.9 1.4-6.6 3.4-6.6Z" ' +
            'fill="var(--i-peridot-light)" opacity=".45"/>',

        aquamarine:
            '<path d="M9 2.8h6l2.4 2.4v13.6L15 21.2H9l-2.4-2.4V5.2Z" ' +
            'fill="var(--i-aqua)"/>' +
            '<path d="M12 2.8h3l2.4 2.4v13.6L15 21.2h-3Z" ' +
            'fill="var(--i-aqua-deep)"/>' +
            '<path d="M10 5.6h4l1.2 1.2v10.4L14 18.4h-4l-1.2-1.2V6.8Z" ' +
            'fill="var(--i-aqua-light)" opacity=".45"/>',

        tanzanite:
            '<path d="M12 3.2 20.5 18.2a1.5 1.5 0 0 1-1.3 2.2H4.8a1.5 1.5 0 0 1-1.3-2.2Z" ' +
            'fill="var(--i-tanzanite)"/>' +
            '<path d="M12 3.2 20.5 18.2a1.5 1.5 0 0 1-1.3 2.2H12Z" ' +
            'fill="var(--i-tanzanite-deep)"/>' +
            '<path d="M12 3.2 16.7 11.4H7.3Z" ' +
            'fill="var(--i-tanzanite-light)" opacity=".5"/>',

        opal:
            '<path d="M3.6 16.2a8.4 8.4 0 0 1 16.8 0 1.8 1.8 0 0 1-1.8 1.8H5.4a1.8 1.8 0 0 1-1.8-1.8Z" ' +
            'fill="var(--i-opal)"/>' +
            '<path d="M12 7.8a8.4 8.4 0 0 1 8.4 8.4 1.8 1.8 0 0 1-1.8 1.8H12Z" ' +
            'fill="var(--i-opal-deep)"/>' +
            '<path d="M6.2 14.6a5.8 5.8 0 0 1 4.4-4.5l1 2.6-3.4 3.6Z" ' +
            'fill="var(--i-opal-fire)"/>' +
            '<path d="M12.6 10.2a5.8 5.8 0 0 1 4 3.2l-3.2 2.4-1.8-3Z" ' +
            'fill="var(--i-opal-glow)"/>' +
            '<circle cx="9.2" cy="16.4" r=".9" fill="var(--i-opal-spark)"/>' +
            '<circle cx="15.4" cy="16.6" r=".7" fill="var(--i-opal-fire)" opacity=".9"/>' +
            '<path d="M6.6 11.8a6.6 6.6 0 0 1 3.2-2.4" stroke="var(--i-opal-light)" ' +
            'stroke-width="1.1" stroke-linecap="round" fill="none" opacity=".8"/>',

        alexandrite:
            '<path d="M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18Z" ' +
            'fill="var(--i-alexandrite)"/>' +
            '<path d="M12 3a9 9 0 0 1 0 18Z" ' +
            'fill="var(--i-alexandrite-deep)"/>' +
            '<path d="M12 5.6A6.4 6.4 0 0 0 5.6 12H12Z" ' +
            'fill="var(--i-alexandrite-light)" opacity=".55"/>',

        paraiba:
            '<path d="M12 2.6 20.2 8.6 17 19.6H7L3.8 8.6Z" ' +
            'fill="var(--i-paraiba)"/>' +
            '<path d="M12 2.6 20.2 8.6 17 19.6H12Z" ' +
            'fill="var(--i-paraiba-deep)"/>' +
            '<path d="M12 2.6 20.2 8.6H3.8Z" ' +
            'fill="var(--i-paraiba-light)" opacity=".5"/>',

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
            '<circle cx="12" cy="12" r="8.6" fill="var(--i-star-halo)"/>' +
            '<path d="M12 2.6 14.3 9.3 21 11.6 14.3 13.9 12 20.6 9.7 13.9 3 11.6 9.7 9.3Z" ' +
            'fill="var(--i-star)"/>' +
            '<path d="M12 2.6 14.3 9.3 21 11.6 14.3 13.9 12 20.6Z" ' +
            'fill="var(--i-star-deep)"/>' +
            '<path d="M12 6.8 13.1 10.4 16.7 11.6 13.1 12.8 12 16.4 10.9 12.8 7.3 11.6 10.9 10.4Z" ' +
            'fill="var(--i-star-light)"/>' +
            '<path d="M19.6 4.2 20.2 6l1.8.6-1.8.6-.6 1.8-.6-1.8-1.8-.6 1.8-.6Z" ' +
            'fill="var(--i-star-light)"/>' +
            '<path d="M4.6 15.2 5.1 16.6l1.4.5-1.4.5-.5 1.4-.5-1.4L2.7 17l1.4-.5Z" ' +
            'fill="var(--i-star)"/>' +
            '<circle cx="18.9" cy="17.6" r=".9" fill="var(--i-star-light)"/>' +
            '<circle cx="5.4" cy="6.2" r=".7" fill="var(--i-star)"/>',

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
