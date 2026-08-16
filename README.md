# Grid of Fortune

A drop-and-merge puzzle that runs in the browser. No build step, no
dependencies — open `index.html` and play.

## The game

A 6×6 board and a hand of two pieces. No clock, nothing to spend, nothing to
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

## The ladder

Nineteen rungs, dug out of the ground and locked away again:

```
dirt → stone → iron → silver → tin →
copper coin → silver coin → gold coin → coin stack → ingot →
topaz → amethyst → emerald → ruby → sapphire → diamond →
crown → treasure → vault
```

Ore, then coin, then stone, then what you keep them in. Every stone has its own
cut — pear, step, marquise, brilliant — so they never blur into coloured lumps.
The whole theme is that list in `js/data/pieces.js` plus its icons; nothing
else in the game knows what a diamond is, which is what makes adding a rung a
one-line job.

Points climb by about half again each rung, not double. Doubling looks right on
paper, but the score is the *sum of every merge*, and making one of a rung
means making two of the one below — so a doubling ladder compounds into the
millions. Half again keeps a good run in five figures while a vault is still
worth 1,388 stones.

## Playing

You hold **two pieces**. Scroll the wheel anywhere on the page to swap between
them, or click. Whichever you do not play stays in hand, so every drop is the
same question: which of these two, and into which column.

The screen is the board, the strip beside it and the hand. The strip is the
ladder standing on end, exactly as tall as the board, lighting up as far as you
have climbed *this game*, with a ring on the three rungs currently being dealt.
The button on the hand opens the fuller sheet — score, point values, and
everything you have ever made.

**The hand climbs with you.** Only three rungs are ever dealt, and the window
slides up as you go, trailing two rungs behind the best thing you have made.
Without that the ladder caps out around six rungs and the top is unreachable
however long you play. The top two rungs are never dealt; those you build.

**And the ground grows up behind it.** When a rung stops being dealt, anything
still standing at that rung — on the board or in your hand — grows to the
bottom of the new window. You only ever drop from the top, so a piece buried
under a pile can only be reached by a twin falling onto it, and once the hand
has moved past that rung no twin is ever coming. With this rule nothing is ever
below what is being dealt, so **every square always has a way out**.

**Every sixth drop the seam gives way** and two pieces fall in on their own,
into columns you did not pick. They come from the rungs already in your hand,
so they are never unmergeable — what they cost you is the choice of where.

**Nothing ends the game but a full board.** The vault has nothing above it, so
it simply sits there taking a square — reaching the top is not a win, it is the
start of the squeeze. The score is the point.

## Layout

```
index.html
css/
  theme.css        palette (including the icon palette), reset, base type
  components.css   buttons, tints, notices, floating gains
  game.css         the board, the strip, the hand, the sheet, the end
js/
  core/
    config.js      every tunable number
    events.js      pub/sub bus
    storage.js     localStorage access
  data/
    pieces.js      the ladder — content, no behaviour
  systems/         change state, emit events, never touch the DOM
    board.js       the grid, the falling, the merging
    round.js       a game: hand, score, what is dealt, when it ends
  ui/              listen and draw, never edit state directly
    icons.js       line icons for chrome, flat vector art for the ladder
    boardview.js   draws the board, plays a move out beat by beat
    roundview.js   the hand, the strip, the sheet, the end card
    scoreview.js   the number at the top, counting rather than jumping
    effects.js     weight and payoff: thumps, rings, shoves, shake
    sparks.js      the burst thrown out when something joins up
    toast.js       notices and floating gains
  pages/
    game.js        entry point
```

The split to keep: **data** describes content, **systems** change state and
announce events, **ui** listens and draws.

## Balance

Every number below was measured with a bot that weighs every column each turn.
A person jams long before any of them.

| | |
| --- | --- |
| Game length | `dealBehind` in `config.js`: 2 → ~440 drops, 3 → ~765 |
| Falls | none 436 drops, two every eight 383, two every six 371, three every five 296 |
| Score | ~3,700 after 120 drops · ~30,000 at a first vault · ~167,000 for a full run |

## Save data

Best score and everything you have ever made are kept in `localStorage` under
`gridoffortune.save`.
