# Icons

Art for the board pieces. Three folders, one job each.

| folder | what is in it |
|---|---|
| `AF/` | the Affinity documents you draw in |
| `EXPORT/` | the SVGs the game reads |
| `REFERENCES/` | PNG renders of what each piece looks like in the game right now |

## The loop

1. Draw the piece on a 512x512 canvas.
2. Export SVG into `EXPORT/`, named for its ladder position.
3. Refresh the game.

That is all, and it is the same whether you add one piece or all thirty-nine at once. `js/ui/liveart.js` asks the dev server what is in `EXPORT/` on
every load and reads whatever it finds, so a new piece needs no code change and
no entry in config.

## Naming

`<ladder position>_<PIECE>.svg` — `01_DIRT.svg` up to `35_CROWN.svg`, and `00_`
for the four that sit off the ladder (`RUBBLE`, `DYNAMITE`, `LODESTONE`,
`SPARKLE`). The number is only there so the folder sorts the way the game plays;
it is ignored when matching. Three pieces are filed under their art name rather
than their game name: `02_ROCK` is Stone, `10_SILVER_ORE` is Silver, `11_INGOT`
is Gold. Either spelling is accepted.

## The canvas

Draw on a square canvas — 512x512 is the intended one — and export the whole
canvas, not the selection. The canvas is the frame: whatever margin you leave
around a piece is kept, and every piece is dropped into the tile at the same
scale, so a small gem stays small next to a big rock. `FIT` in `tools/art.js`
(0.9) is how much of the tile the canvas fills; changing it means re-importing
the whole set.

An export cropped to the artwork still comes out the right size, but it has lost
where the piece sat on the canvas, so it is centred. Only a piece meant to sit
deliberately off-centre needs the full canvas.

## Before shipping

Live art is preview only — it never touches the source. Bake the current art
into `js/ui/icons.js`, which is what the iOS build carries:

    npm run art:watch            # imports on every export, leave it running
    node tools/art.js "ICONS/EXPORT/04_IRON.svg" iron --write   # or one at a time
