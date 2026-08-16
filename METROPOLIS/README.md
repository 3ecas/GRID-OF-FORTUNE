# Metropolis

A cozy village simulator that runs in the browser. No build step, no
dependencies — open `index.html` and play.

Six resources, twelve buildings, four stages. The design it is built to is in
[DESIGN.md](DESIGN.md).

**The game is `index.html`** — one page, no menu, no clock. Merge things until
the board is full. Open it and play.

The village simulator that came before it is still in the folder, unlinked
from the game and reachable directly at `village.html` if you want it.

| File             | What it is                                              |
| ---------------- | ------------------------------------------------------- |
| `index.html`     | **The game.** One screen, a quiet few minutes a round.  |
| `village.html`   | The old village map, plus its three pages below.        |
| `buildings.html` | The village catalogue.                                  |
| `inventory.html` | Village stock and storage.                              |
| `city.html`      | Village stage and expansion.                            |

## The game

A 6×6 board and a hand of three pieces. No clock, nothing to spend, nothing to
manage. One rule:

> **Two of the same thing, touching, become the next one up.**

You drop a piece into a column and it falls to the ground. When two join, what
was above drops into the gap, which can set off another merge — so one piece
can start a long chain.

**Everything falls, and that is not decoration.** A merge takes two squares and
gives back one, so without gravity every merge leaves a hole exactly where the
twin stood. The board then settles at about half full no matter what size it
is — measured, across every board from 4×4 to 6×6 — and what you are left with
is scattered pieces with a gap between each one. Falling closes those holes the
moment they appear: the built part stays packed, the empty part stays overhead.

The ladder is ten rungs, sapling to metropolis:

```
sapling → tree → grove → orchard → farm →
cottage → townhouse → market → town hall → metropolis
```

You hold **two pieces**. Scroll the wheel anywhere on the page to swap between
them, or click. Whichever you do not play stays in hand, so every drop is the
same question: which of these two, and into which column.

The screen is the board and the hand, and nothing else. The button on the right
of the hand opens the ladder — score, everything you have made, and the three
rungs currently being dealt. Click away, hit the close button or press Escape
to shut it.

**The hand climbs with you.** Only three rungs are ever dealt, and the window
slides up as you go, trailing two rungs behind the best thing you have built:
once the board has seen a farm, saplings stop coming and trees take their
place. Without that the ladder caps out around six rungs and the top is
unreachable however long you play. The top two rungs are never dealt; those you
have to build.

**And the countryside grows up behind it.** When a rung stops being dealt,
anything still standing at that rung — on the board, in your hand, or set
aside — grows to the bottom of the new window, and the board settles again.

That is not a flourish. You only ever drop from the top, so a piece buried
under a pile can only be reached by a twin falling onto it — and once the hand
has moved past that rung, no twin is ever coming. The square would be dead for
the rest of the game. With this rule nothing on the board is ever below what is
being dealt, so **every square always has a way out**. Verified across ten
full games: zero stranded pieces.

**Building the Metropolis wins.** That is the end of the game, not a high
score to chase — a good player gets there in about 140 drops. If the board
fills to the top first, that is the other ending.

**Game length is one number:** `dealBehind` in `js/core/config.js`, which is
how far the hand trails the best thing you have built. Measured with a bot
playing well: **2 → 79 drops, 3 → 141, 4 → 233**. Board size barely moves it
(5×5 finishes in 132, 6×6 in 154). The other lever is the ladder itself —
each rung above Cottage costs roughly 25–30 drops, so four more rungs is
another hundred.

The ladder down the side of the page stays dark until you have made each rung,
and remembers between games.

Adding a rung is one line in `js/data/pieces.js`. The board, the album, the
deal window and the score all read off that list.

Best score and everything you have ever made are kept in `localStorage` under
`metropolis.game`.

## How it plays

**Click the land.** Wild wood, stone and food appear on open ground and give 1
each. The plot goes quiet afterwards and something grows somewhere else.

**Click your buildings.** Gatherers fill themselves from the ground they stand
on — twice as fast on matching terrain. Refiners turn stored raw goods into
planks and bricks. Homes make coin. Anything with goods waiting shows a small
pile at its corner; click it to take them.

**Watch the map fill.** A plot with a building on it never grows anything
again. That is the point. Demolish and the land recovers after a while.

**Zoning matters.** Homes earn more coin beside wells, gardens, markets and
other homes, and less beside a sawmill or a kiln. Nothing forces you to care,
but an industrial edge and a residential middle earn roughly twice what a
jumble does.

**Claim more land.** Coin buys the next grid size: 5×5 → 7×7 → 9×9 → 11×11.
Each expansion wraps a ring of fresh ground around what you built, so wild
resources start turning up on the frontier again.

Nothing is ever lost by being away. Buildings fill to their capacity and wait,
and up to twelve hours of absence is caught up on the next load.

## Layout

```
index.html · buildings.html · inventory.html · city.html
css/
  theme.css        palette (including the icon palette), reset, base type
  layout.css       top bar, nav, HUD, page shell
  components.css   buttons, panels, chips, notices, floating feedback
  grid.css         the map
  pages.css        catalogue, inventory and city pages
js/
  core/
    config.js      every tunable number
    events.js      pub/sub bus
    storage.js     localStorage access
    state.js       the save file and its shape
    clock.js       the single tick loop
    boot.js        shared page startup
  data/            content, no behaviour
    terrain.js     the three grounds
    resources.js   the six resources
    buildings.js   the twelve buildings
    stages.js      the four stages
  systems/         change state, emit events, never touch the DOM
    terrainmap.js  laying out clustered ground
    grid.js        plot queries
    capacity.js    storage ceilings
    inventory.js   the store
    comfort.js     adjacency, and what it is worth
    production.js  buildings filling themselves up
    spawner.js     where wild resources appear
    harvest.js     gathering and collecting
    construction.js  select / place / demolish
    expansion.js   growing the map
  ui/              listen and draw, never edit state directly
    icons.js       line icons for chrome, flat vector art for the world
    nav.js         active menu item
    hud.js         resource counters
    toast.js       "+n" floats and message pills
    gridview.js    draws the map, handles clicks
    buildbar.js    current mode, demolish, collect all
    buildingsview.js · inventoryview.js · cityview.js
  pages/           one entry point per html file
    village.js · buildings.js · inventory.js · city.js
```

The split to keep: **data** describes content, **systems** change state and
announce events, **ui** listens and draws.

## Adding content

- **A resource** — one entry in `js/data/resources.js` plus an icon. It appears
  in the HUD, inventory and storage automatically.
- **A building** — one entry in `js/data/buildings.js` plus an icon. `kind`
  decides how it behaves; `produces`, `every`, `holds`, `consumes`, `comfort`,
  `storage` and `residents` are all read by the systems.
- **An icon** — `js/ui/icons.js`. Chrome goes in `line` (stroke, three elements
  max). Anything in the world goes in `art` (flat fills from the `--i-*`
  palette, a lit face and a shaded face, no outlines).
- **Balance** — `js/core/config.js` and the numbers in the data files.

## Save data

Stored in `localStorage` under `metropolis.save`. *Inventory → Start a new
village* wipes it. Changing `Config.save.version` retires old saves.
