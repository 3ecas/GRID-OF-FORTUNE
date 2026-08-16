window.Game = window.Game || {};

/**
 * pieces.js — one ladder, bottom to top.
 *
 * The only rule in the game: two of the same thing, touching, become the
 * next thing up. That is it. Whatever comes out can merge again straight
 * away, so a single piece dropped in the right place can climb a long way.
 *
 * The ladder is just this list, in order. Adding a rung is one entry — the
 * board, the album and the score all read off it, nothing else to change.
 *
 *   weight  how often it turns up in the hand (0 = only ever made)
 *   points  what making it is worth
 */
(function () {
    /* Dug out of the ground, smelted, minted, cut, and finally locked away. */
    var ladder = [
        /* Points climb by about half again each rung, not double. Doubling
           looks right on paper but the score is the *sum of every merge*, and
           making one of a rung means making two of the one below — so a
           doubling ladder compounds into the millions. Half again keeps a
           good run in five figures while a vault is still worth a thousand
           stones. */
        /* Every rung owns its own tint. Sharing one between rungs reads as a
           bug at the table: four alike-looking squares that will not join,
           because two of them were never the same thing. */
        { id: "dirt", name: "Dirt", icon: "dirt", tint: "tint-dirt" },
        { id: "stone", name: "Stone", icon: "rock", tint: "tint-rock", points: 1 },
        { id: "iron", name: "Iron", icon: "iron", tint: "tint-iron", points: 2 },
        { id: "silver_ore", name: "Silver", icon: "silver_ore", tint: "tint-ore", points: 3 },
        { id: "tin", name: "Tin", icon: "tin", tint: "tint-tin", points: 5 },

        { id: "copper", name: "Copper Coin", icon: "copper", tint: "tint-copper", points: 7 },
        { id: "silver", name: "Silver Coin", icon: "silver", tint: "tint-silver", points: 11 },
        { id: "gold", name: "Gold Coin", icon: "gold", tint: "tint-gold", points: 16 },
        { id: "coins", name: "Coin Stack", icon: "coins", tint: "tint-coins", points: 24 },
        { id: "ingot", name: "Ingot", icon: "ingot", tint: "tint-ingot", points: 36 },

        { id: "topaz", name: "Topaz", icon: "topaz", tint: "tint-topaz", points: 54 },
        { id: "amethyst", name: "Amethyst", icon: "amethyst", tint: "tint-amethyst", points: 81 },
        { id: "emerald", name: "Emerald", icon: "emerald", tint: "tint-emerald", points: 122 },
        { id: "ruby", name: "Ruby", icon: "ruby", tint: "tint-ruby", points: 183 },
        { id: "sapphire", name: "Sapphire", icon: "sapphire", tint: "tint-sapphire", points: 274 },
        { id: "diamond", name: "Diamond", icon: "diamond", tint: "tint-diamond", points: 411 },

        { id: "crown", name: "Crown", icon: "crown", tint: "tint-crown", points: 617 },
        { id: "chest", name: "Treasure", icon: "treasure", tint: "tint-treasure", points: 925 },
        { id: "vault", name: "Vault", icon: "vault", tint: "tint-vault", points: 1388 }
    ];

    // each rung knows the one above it
    ladder.forEach(function (piece, index) {
        var above = ladder[index + 1];
        piece.tier = index + 1;
        piece.next = above ? above.id : null;
    });

    /**
     * Rubble. Not on the ladder, and that is the whole point of it.
     *
     * Everything dealt from the ladder merges, which means every piece that
     * arrives is also fuel — measured, six extra pieces every single drop
     * could not fill the board, because they all merged away again. Nothing
     * that can merge is ever really pressure. Rubble cannot merge with
     * anything, so it only ever accumulates, and the one way to be rid of it
     * is to complete the column it is sitting in.
     */
    var rubble = {
        id: "rubble",
        name: "Rubble",
        icon: "rubble",
        tint: "tint-rock",
        tier: 0,
        next: null,
        points: 0
    };

    var index = { rubble: rubble };
    ladder.forEach(function (piece) {
        index[piece.id] = piece;
    });

    var made = ladder.filter(function (piece) {
        return piece.tier > 1;
    });

    var WINDOW = 3; // how many rungs are ever in the hand at once
    var CHANCE = [46, 34, 20]; // ... and how often each turns up

    /**
     * Which three rungs are being dealt. It slides up behind you: once the
     * board has seen something two rungs above the current window, saplings
     * stop coming and trees take their place.
     *
     * Without this the ladder caps out around six rungs — pieces get stranded
     * and there is no way to move them — and the top would be unreachable
     * however long you played. The top two rungs are never dealt.
     */
    function windowTop(highestTier) {
        var behind = Game.Config.game.dealBehind;
        var reach = (highestTier || 1) - behind;
        return Math.max(WINDOW, Math.min(reach, ladder.length - 2));
    }

    Game.Pieces = {
        list: ladder,
        made: made,
        top: ladder[ladder.length - 1],
        rubble: rubble,

        byId: function (id) {
            return index[id] || null;
        },

        /** The rungs currently being dealt, lowest first. */
        dealing: function (highestTier) {
            var top = windowTop(highestTier);
            return ladder.slice(Math.max(0, top - WINDOW), top);
        },

        /** One piece for the hand, from the rungs currently in play. */
        randomFor: function (highestTier) {
            var options = this.dealing(highestTier);
            var total = options.reduce(function (sum, piece, i) {
                return sum + (CHANCE[i] || 10);
            }, 0);

            var roll = Math.random() * total;
            for (var i = 0; i < options.length; i++) {
                roll -= CHANCE[i] || 10;
                if (roll <= 0) return options[i];
            }
            return options[0];
        },

        /** The rung below this one. */
        under: function (id) {
            var piece = index[id];
            return piece ? ladder[piece.tier - 2] || null : null;
        }
    };
})();
