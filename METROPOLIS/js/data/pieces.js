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
    var ladder = [
        { id: "sapling", name: "Sapling", icon: "sapling", tint: "tint-leaf" },
        { id: "tree", name: "Tree", icon: "tree", tint: "tint-leaf", points: 5 },
        { id: "grove", name: "Grove", icon: "grove", tint: "tint-wood", points: 15 },
        { id: "orchard", name: "Orchard", icon: "orchard", tint: "tint-food", points: 40 },
        { id: "farm", name: "Farm", icon: "forager", tint: "tint-food", points: 100 },
        { id: "cottage", name: "Cottage", icon: "cottage", tint: "tint-plank", points: 250 },
        { id: "townhouse", name: "Townhouse", icon: "townhouse", tint: "tint-plank", points: 600 },
        { id: "market", name: "Market", icon: "market", tint: "tint-brick", points: 1500 },
        { id: "town", name: "Town Hall", icon: "town_hall", tint: "tint-brick", points: 3500 },
        { id: "metropolis", name: "Metropolis", icon: "metropolis", tint: "tint-coin", points: 9000 }
    ];

    // each rung knows the one above it
    ladder.forEach(function (piece, index) {
        var above = ladder[index + 1];
        piece.tier = index + 1;
        piece.next = above ? above.id : null;
    });

    var index = {};
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
