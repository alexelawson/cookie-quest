# The Great Cookie Quest

A Christmas game: travel to four lands to gather chocolate chip cookie ingredients, then bake them at home.

## Run it
Open `index.html` in a browser. No build step, no dependencies.
For live reload while editing: `python3 -m http.server` and visit http://localhost:8000.

## Layout
| File | What's in it |
|---|---|
| `js/story.js` | All dialogue, character names, the ending note (Keelan's questions are in `KEELAN`) |
| `js/world.js` | Map size, collision rects (`solids`), door zones (`triggers`), map painting |
| `js/state.js` | Player, basket save (localStorage), particles |
| `js/input.js` | Keyboard + touch d-pad |
| `js/ui.js` | Dialog system (pages + button menus), land/kitchen interactions |
| `js/farm.js` | Farm mission: Keelan, hen chase, hidden cupcake. Difficulty knobs in `FARM` at the top |
| `js/game.js` | Movement, collision, rendering, main loop |
| `css/style.css` | Page and UI styling |

Everything is drawn with `fillRect` on a 224×168 canvas scaled up with `image-rendering: pixelated`.

## Roadmap
- [x] Farm: Keelan Q&A, hen chase, hidden cupcake (Keelan helps if you give it to him)
- [ ] Farm: butter churning
- [ ] Mill: wheat harvest + crossword + millstone timing
- [ ] Night city: rooftop chocolate heist
- [ ] Fargo: cheapest-gas hunt + sugar beet harvest
- [ ] Kitchen: mix, bake, decorate, final note

## Spoilers
The cupcake is hidden under the tree just east of the road between the farm and the mill, on the same row as the pen's top fence. A sparkle peeks out from its right edge every few seconds.
