# Grid of Fortune

A drop-and-merge puzzle that runs in the browser. No build step, no
dependencies — open `index.html` and play.

## The game

A 6×6 board and one piece in hand. No clock, nothing to spend, nothing to
manage. One rule:

> **Three of the same thing, touching, become the next one up.**

You drop a piece into a column and it falls to the ground. When three join,
what was above drops into the gap, which can set off another merge — so one
piece can start a long chain. A run longer than three joins all at once,
however far it has grown.

**A run gives back what it is worth.** Three become one, four become two, five
become three — a run of any length hands back all but two of itself, one rung
up. Before that a run of six gave back exactly what a run of three did, so
building anything past the minimum was a straight loss. Five is where it pays:
the three that come back are touching, so they go again on their own.

Every merge now frees exactly two squares whatever its size. Big runs stopped
being how you clear the board and became how you climb.

**Everything falls, and that is not decoration.** A merge always takes two
squares more than it gives back, so without gravity every merge leaves two
holes exactly where the surplus stood. The board then settles at about half full no matter
what size it is — measured, across every board from 4×4 to 6×6 — and what you
are left with is scattered pieces with a gap between each one. Falling closes
those holes the moment they appear: the built part stays packed, the empty part
stays overhead.

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

The ladder runs 1 to 2,500, climbing by about half again each rung rather than
doubling. Doubling looks right on paper, but the score is the *sum of every
merge*, and making one of a rung means making three of the one below — so a
doubling ladder compounds into the millions. Half again keeps a good run in
five figures while a vault is still worth 1,250 stones.

Dirt is the one value you can never collect: nothing on the ladder points at
it, so no merge ever produces one. Its 1 is there to say where the climb
starts.

## Playing

You hold **one piece**. There is nothing to hold back and nothing to swap, so
every drop is the same question, stripped to its bones: which column. The
column lights up on the tap that picks it and then lets go — there is no hover
on a phone, and a highlight that trailed the cursor read as part of the board.
Nothing pops up over the game: a merge pays out where it happens and the board
speaks for itself.

Nothing on screen is in a box. No cards, no panels, no pills — the menu and
the end card are text on the ground, and the end card only blurs the board
behind it rather than covering it, so the run you just lost stays in sight.

The screen is the board and the hand, and that is all. An arrow in the top
left goes back to the menu, and the button centred at the foot of the screen
opens the ladder: all nineteen rungs standing on end, scrollable, lit as
far as you have climbed *this game*, with a ring on the three being dealt. It
opens where you are rather than at the top, so the rungs in your hand are the
ones you see first.

**The hand climbs with you.** Only three rungs are ever dealt, and the window
slides up as you go, trailing two rungs behind the best thing you have made.
Without that the ladder caps out around six rungs and the top is unreachable
however long you play. The top two rungs are never dealt; those you build.

**The same piece comes at most twice in a row.** Beyond that the hand has to
offer you something else. Three of a kind in a row is a gift, not a puzzle.

**Nothing grows up behind it.** When a rung stops being dealt, whatever is
still standing on it stays exactly what it is. You only ever drop from the top,
so a piece buried under a pile can only be reached by its own kind falling onto
it — and once the hand has moved past that rung, none is coming. That leaves
pieces you can no longer complete, and digging them out before they cost you
the board is the skill. Nothing on the board is guaranteed a way out.

**The ladder shows what is gone.** Rungs below the dealing window are struck
through and greyed: they will never be dealt again, so anything of theirs still
standing on the board is yours to finish or live with.

**The seam schedule ends where games end.** It used to run to twelve pieces a
drop, four steps past anything a run reached — reaching them meant surviving
pressure whose whole job is to stop you, so tightening the schedule only
brought the same last step forward rather than unlocking the ones above. Those
four are gone and the rest arrive about a third sooner, so a run now meets the
last step instead of dying short of it.

**Every sixth drop the seam gives way** and two pieces fall in on their own,
into columns you did not pick. They come from the rungs already in your hand,
so they are never unmergeable — what they cost you is the choice of where.

**A lodestone draws out a kind.** Rarer than dynamite and answering a
different problem: dynamite clears a *place*, a lodestone clears a *kind*. A
merge landing against one wakes it, the board stops and lights up, and whatever
piece you name is pulled off it wherever it happens to be — which is the only
thing that shifts one stranded here and another stranded three columns over.
It pays the same salvage a blast does.

**Dynamite is the way out.** Once you are past 500 points it starts coming in
with the seam. It joins nothing, and a merge landing against it sets it off:
everything in the eight squares around it goes, the stick with it. It waits twelve drops and then goes off
whether or not a merge has reached it — without that, a stick landing among
pieces too old to merge waits forever and becomes part of the very problem it
exists to solve. It pays back about a third of what it destroyed — not the full value, because the ladder climbs by
half again a rung while a blast takes three pieces to a merge's three, so
paying in full would make blowing a run up worth twice merging it. A third
leaves building clearly better while still handing something back for pieces
you could no longer use, which matters with nothing growing up behind the
window any more: a stick is the only thing that shifts a piece you can never
complete. One caught in another's blast goes off in turn, so a
line of them runs.

**Nothing ends the game but a full board.** The vault has nothing above it, so
it simply sits there taking a square — reaching the top is not a win, it is the
start of the squeeze. The score is the point.

**A game arrives rather than appears.** The board opens empty, holds for half a
second, then the six starting pieces fall in one at a time — the same fall the
game uses all the way through, not a special effect. Each one goes to a column
where it will not join anything, so the board is laid out rather than played:
the run starts from what you were dealt, not from a merge you did not make.
Where every column would join, it lands anyway and scores nothing — about one
opening in fifty.

**A run keeps itself.** The arrow in the top left goes back to the menu at any
point and costs you nothing. The menu offers Play, and Continue when there is a
run in progress — every drop is written to `localStorage`, so closing the tab is
not the same as losing. Continue leads whenever it is there, so Play cannot
quietly throw away a game you were in the middle of. Reaching a full board ends
the run and clears it.

## Layout

```
index.html
css/
  theme.css        palette (including the icon palette), reset, base type
  components.css   buttons, tints, floating gains
  game.css         the board, the strip, the hand, the sheet, the end
js/
  core/
    config.js      every tunable number
    events.js      pub/sub bus
    storage.js     localStorage access
  data/
    pieces.js      the ladder, plus rubble and dynamite — content, no behaviour
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
    toast.js       the floating gains thrown off a merge
  pages/
    game.js        entry point
```

The split to keep: **data** describes content, **systems** change state and
announce events, **ui** listens and draws.

## Balance

Measured with a greedy bot that weighs every column each turn — it plays worse
than the column-weighing bot the older figures came from, so read these as a
floor. A person jams long before any of them.

Fifteen runs at the current rules (merge-3, one piece in hand, nothing growing
up behind the window):

| | |
| --- | --- |
| Game length | ~340 drops median |
| Score | ~20,000 median |
| Ladder reached | sapphire, median |
| Board | sits about 40% full; nearly bare a seventh of the time |
| Falls | opens at two every five; a run reaches step 6 of 8 |

How full the board sits is not a dial. It settles near 40% under every falls
schedule tried — gentle, flat or harsh — because it is set by the merge rule
giving back all but two squares, not by what falls in. What *is* a dial is how
often the board looks bare, and that is almost entirely the opening: starting
at two every five rather than one every eight cut it from a fifth of the run to
a seventh. It costs about a third of the run and, because score is exponential
in how high you climb, most of the score with it.

Keeping the surplus is the biggest single lever in the game. Measured against
throwing it away, over fifteen runs each: runs about a third shorter, score
about three and a half times higher, and a median run reaches diamond instead
of topaz — 84% of the ladder rather than 58%. Paying for every piece a run
gives back rather than just one (`surplusPays`) multiplies score by ten rather
than three and a half, and puts a median run at treasure; it is off for that
reason.

Roughly four merges in five are still plain threes, so all of that comes from
the one in five that is bigger.

**Score and survival are coupled** through `dynamiteFrom`. That gate is read
off the score, so anything that changes scoring also changes when the first
stick falls — and dynamite is what keeps a jammed board playable. A change
that only looks like scoring will move run length too.

## Save data

Best score and everything you have ever made are kept in `localStorage` under
`gridoffortune.save`.
