window.Game = window.Game || {};

(function () {
    var ladder = [
        { id: "dirt", name: "Dirt", icon: "dirt", tint: "tint-dirt", points: 1 },
        { id: "stone", name: "Stone", icon: "rock", tint: "tint-rock", points: 2 },
        { id: "iron", name: "Iron", icon: "iron", tint: "tint-iron", points: 3 },
        { id: "silver_ore", name: "Silver", icon: "silver_ore", tint: "tint-ore", points: 5 },
        { id: "tin", name: "Tin", icon: "tin", tint: "tint-tin", points: 8 },

        { id: "copper", name: "Copper Coin", icon: "copper", tint: "tint-copper", points: 12 },
        { id: "silver", name: "Silver Coin", icon: "silver", tint: "tint-silver", points: 18 },
        { id: "gold", name: "Gold Coin", icon: "gold", tint: "tint-gold", points: 27 },
        { id: "coins", name: "Coin Stack", icon: "coins", tint: "tint-coins", points: 40 },
        { id: "ingot", name: "Ingot", icon: "ingot", tint: "tint-ingot", points: 60 },

        { id: "topaz", name: "Topaz", icon: "topaz", tint: "tint-topaz", points: 90 },
        { id: "amethyst", name: "Amethyst", icon: "amethyst", tint: "tint-amethyst", points: 135 },
        { id: "emerald", name: "Emerald", icon: "emerald", tint: "tint-emerald", points: 200 },
        { id: "ruby", name: "Ruby", icon: "ruby", tint: "tint-ruby", points: 300 },
        { id: "sapphire", name: "Sapphire", icon: "sapphire", tint: "tint-sapphire", points: 450 },
        { id: "diamond", name: "Diamond", icon: "diamond", tint: "tint-diamond", points: 675 },

        { id: "crown", name: "Crown", icon: "crown", tint: "tint-crown", points: 1000 },
        { id: "chest", name: "Treasure", icon: "treasure", tint: "tint-treasure", points: 1600 },
        { id: "vault", name: "Vault", icon: "vault", tint: "tint-vault", points: 2500 }
    ];

    ladder.forEach(function (piece, index) {
        var above = ladder[index + 1];
        piece.tier = index + 1;
        piece.next = above ? above.id : null;
    });

    var rubble = {
        id: "rubble",
        name: "Rubble",
        icon: "rubble",
        tint: "tint-rock",
        tier: 0,
        next: null,
        points: 0
    };

    var dynamite = {
        id: "dynamite",
        name: "Dynamite",
        icon: "dynamite",
        tint: "tint-tnt",
        tier: 0,
        next: null,
        points: 0
    };

    var lodestone = {
        id: "lodestone",
        name: "Lodestone",
        icon: "lodestone",
        tint: "tint-lode",
        tier: 0,
        next: null,
        points: 0
    };

    var index = { rubble: rubble, dynamite: dynamite, lodestone: lodestone };
    ladder.forEach(function (piece) {
        index[piece.id] = piece;
    });

    var made = ladder.filter(function (piece) {
        return piece.tier > 1;
    });

    var WINDOW = 3;
    var CHANCE = [46, 34, 20];

    function windowTop(highestTier) {
        var behind = Game.Config.game.dealBehind;
        var peak = ladder.length;
        var made = highestTier || 1;
        var reach = made >= peak ? peak : made - behind;

        return Math.max(WINDOW, Math.min(reach, peak - (made >= peak ? 0 : 2)));
    }

    Game.Pieces = {
        list: ladder,
        made: made,
        top: ladder[ladder.length - 1],
        rubble: rubble,
        dynamite: dynamite,
        lodestone: lodestone,

        byId: function (id) {
            return index[id] || null;
        },

        dealing: function (highestTier) {
            var top = windowTop(highestTier);
            return ladder.slice(Math.max(0, top - WINDOW), top);
        },

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

        under: function (id) {
            var piece = index[id];
            return piece ? ladder[piece.tier - 2] || null : null;
        }
    };
})();
