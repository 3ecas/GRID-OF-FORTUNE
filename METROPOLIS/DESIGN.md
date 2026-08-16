# Metropolis — design

The whole game, kept deliberately small. Six resources, twelve buildings, four
stages.

**All of this is built.** The numbers in the tables below are the ones in
`js/core/config.js` and `js/data/`, with two changes made during the build:
gatherers run at 12s (halved to 6s on matching terrain) rather than 20s, and
the Cottage costs raw goods rather than refined ones so that the very first
coin does not depend on a sawmill you cannot yet afford.

## The fantasy

You are not managing people. You are *tending a place*. You tap the land, put
something down, come back later, and the field you started on has quietly
turned into a city. The pleasure is watching the map change, and the fact that
it keeps changing while you are not looking.

## The core loop

**Short loop (seconds).** Click what is ready. Wild resources on open ground,
goods piled outside your buildings. One sweep of the board, then you are done.

**Long loop (minutes to hours).** Buildings fill on their own. You spend what
you swept on the next building, place it, and leave. The board is a little
denser than it was.

**The arc.** Early on you click the *land*. Later you click your *buildings*.
By the end you click a *city*. Same verb the whole way through — it just pays
more each time.

## Five rules I would hold to

1. **Never punish absence.** Nothing rots, dies, or resets. The worst thing
   that happens while you are away is that a building fills up and waits.
2. **A sweep is 8–15 clicks.** At every stage. When the grid grows, buildings
   must hold more, not demand more clicking. This one number keeps it cozy.
3. **Progress is visible on the map, not in a number.** If a change cannot be
   seen on the grid, it is probably the wrong change.
4. **Density is always rewarded.** Building next to buildings makes things
   better, never worse. Paving the map is the goal, so the rules must agree.
5. **No progress bars.** Readiness is shown as goods sitting outside a
   building, not a timer. You should be able to read the whole board at a
   glance and never watch a countdown.

## Resources — six, in three layers

| | Resource | Comes from | Spent on |
| --- | --- | --- | --- |
| Raw | **Wood** | wild trees, Lumber Camp | everything early |
| Raw | **Stone** | wild rocks, Quarry | civic buildings |
| Raw | **Food** | wild berries, Forager's Hut | homes, Market |
| Refined | **Planks** | Sawmill (2 wood → 1) | homes, mid buildings |
| Refined | **Bricks** | Kiln (2 stone + 1 wood → 1) | homes, late buildings |
| Prosperity | **Coin** | homes and the Market | land expansion, civic |

Three is too few to make building interesting; ten is bookkeeping. Six gives
two real decisions: *do I burn wood or turn it into planks*, and *do I chase
materials or coin*.

## Buildings — twelve, four jobs

**Gatherers** — fill from the ground they stand on.

| Building | Cost | Makes | Rate | Holds |
| --- | --- | --- | --- | --- |
| Lumber Camp | 12 wood | wood | 1 / 20s on forest, 1 / 40s elsewhere | 20 |
| Quarry | 10 wood, 8 stone | stone | 1 / 20s on rock, 1 / 40s elsewhere | 20 |
| Forager's Hut | 10 wood | food | 1 / 20s on meadow, 1 / 40s elsewhere | 20 |

**Refiners** — turn raw into refined, slowly, from your stock.

| Building | Cost | Makes | Rate | Holds |
| --- | --- | --- | --- | --- |
| Sawmill | 20 wood, 10 stone | planks | 1 / 90s | 10 |
| Kiln | 18 wood, 20 stone | bricks | 1 / 120s | 10 |

**Homes** — make coin, and coin scales with comfort.

| Building | Cost | Makes | Residents |
| --- | --- | --- | --- |
| Cottage | 8 planks, 4 bricks | 1 coin / 60s × comfort | 2 |
| Townhouse | 16 planks, 14 bricks | 3 coin / 60s × comfort | 5 |

**Civic** — the reason a city beats a warehouse.

| Building | Cost | Does |
| --- | --- | --- |
| Well | 12 stone | +comfort to the 8 plots around it |
| Garden | 6 planks, 8 food | +comfort, produces nothing, purely lovely |
| Market | 20 planks, 12 bricks | +comfort, and sells surplus food for coin |
| Storehouse | 14 planks, 6 bricks | raises the cap on every resource |
| Town Hall | 40 planks, 30 bricks, 200 coin | one only — unlocks *collect all* and the next grid size |

Twelve is enough that the catalogue feels like a game and small enough that you
can hold all of it in your head.

## Terrain and placement

Every plot has a terrain: **forest**, **rock**, or **meadow**. It decides what
grows wild there and it doubles the matching gatherer. That is the whole
placement puzzle for gatherers — find the forest, put the camp on it.

Adjacency is the placement puzzle for everything else, and it is **all
upside**:

- homes next to homes → +comfort (a street becomes a neighbourhood)
- well, garden or market next to homes → +comfort
- gatherers and refiners next to homes → −comfort

That last one is the only negative in the game, and it is not about leaving
land empty — it is about *where things go*. It is what makes players build an
industrial edge and a residential middle without ever being told to. Zoning
emerges on its own, and zoning is what makes a grid look like a city.

Comfort is one number per home:

```
coin rate = base × (1 + comfort / 10)
```

Ignore it entirely and the game still works, just at half pace. That is the
right shape for cozy: depth for people who want it, invisible to people who
do not.

## Progression — four stages

| Stage | Grid | Unlocked by | New toys |
| --- | --- | --- | --- |
| Hamlet | 5×5 | start | gatherers, Well |
| Village | 7×7 | 150 coin | Sawmill, Kiln, Cottage, Garden |
| Town | 9×9 | 800 coin | Townhouse, Market, Storehouse |
| Metropolis | 11×11 | Town Hall | *collect all*, the last of everything |

**Each expansion adds a ring of fresh terrain** — which means fresh wild
resources on the frontier. That is the quiet trick that keeps the whole thing
alive: the early game does not end, it moves to the edge of the map. You are
clicking berries on the outskirts of a city, and it still feels good.

121 plots at the end. Big enough to look like a city, small enough to sweep.

## Idle pacing

| | Fills in | A sweep gives |
| --- | --- | --- |
| Hamlet | 5–7 min | ~10 clicks, ~10 goods |
| Village | 10–20 min | ~12 clicks, ~150 goods |
| Town | 1–3 hours | ~14 clicks, ~800 goods |
| Metropolis | 6–8 hours | 1 click, everything |

Buildings stop when full, so being away is naturally bounded and no offline
cap is needed beyond the capacity itself. Storage upgrades are what buy you
longer absences — that is the real progression curve, and it means the game
gently asks for less of your time as you get further in. Most idle games do
the opposite.

Two session shapes, both complete:

- **60 seconds** — sweep, spend, leave.
- **10 minutes** — sweep, plan a district, watch the frontier fill in.

## Readiness, without timers

A building with goods waiting shows a small stack of them at its edge — one
icon for a little, a fuller pile when it is capped. No rings, no bars, no
numbers counting down. You learn to read the board the way you read a garden.

Wild resources behave the way they do now: they appear, you take them, the plot
goes quiet. Nothing indicates when it will come back, and that is correct.

## What I would deliberately leave out

- **Workers and villagers.** Residents are a score, not a labour pool. The
  moment people need feeding and assigning, it stops being cozy.
- **Prestige or reset loops.** You built this city. Nothing should take it.
- **Decay, spoilage, disasters, taxes, weather.** Every one of them punishes
  being away.
- **Random rarity.** No lucky drops. Every reward is earned by placement.
- **A tech tree.** Stage unlocks already pace the catalogue.
- **A seventh resource or a thirteenth building.** The temptation will be
  constant. The answer is that the game gets better when a new idea *replaces*
  something rather than joining it.

## Measured pace

From a fresh village, simulated with a player who sweeps the board once a
minute and builds sensibly:

| | |
| --- | --- |
| First building | ~2 minutes |
| 12 buildings down | ~15 minutes |
| 150 coin, first expansion | ~26 minutes |
| 477 coin | 1 hour |

A sweep is 10–15 clicks at any point, which is the number that matters. Wood
hits its 60 cap early and stays there — that is deliberate, and it is what
makes the Storehouse feel like a relief rather than a chore.

## Where to take it next

The game is complete as designed. If it wants more, in the order I would try:

1. **A second look at the late game.** Metropolis at 2500 coin is a long haul
   from Town at 800. Worth playing to see whether it wants a fourth home tier
   or a coin multiplier rather than a bigger number.
2. **Roads.** Purely visual, drawn between adjacent buildings. Would do more
   for the "it looks like a city" feeling than any new building.
3. **A named village.** One text field, enormous effect.

And the standing rule: a new idea should replace something, not join it.
