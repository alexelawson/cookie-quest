# The Great Cookie Quest

A Christmas game: travel to four lands to gather chocolate chip cookie ingredients, then bake them at home.

## Run it
Open `index.html` in a browser. No build step, no dependencies.
For live reload while editing: `python3 -m http.server` and visit http://localhost:8000.

## Layout
| File | What's in it |
|---|---|
| `js/story.js` | All dialogue, character names, the ending note. Keelan is in `KEELAN`; Bob, Alex's snack reactions and the correct drink/snack are in `FARGO` |
| `js/world.js` | Overworld map: collision rects (`solids`), doors (`triggers`), painting. Also defines the scene system (`SCENES`) |
| `js/kitchen.js` | Kitchen interior scene; baking starts at the counter, recipe card on the fridge |
| `js/city.js` | Night-city rooftop scene (heist goes here): roofs, planks, the stranger |
| `js/fargo.js` | Fargo: drive the CR-V, find the cheapest gas, Bob's $30.00 pump, then the snack stop for Alex. Car color in `CAR_COLOR`, fuel/speeds in `FUEL` |
| `js/state.js` | Player, basket save (localStorage), particles |
| `js/input.js` | Keyboard + touch d-pad |
| `js/ui.js` | Dialog system (pages + button menus), land/kitchen interactions |
| `js/farm.js` | Farm mission: Keelan, hen chase, hidden cupcake. Difficulty knobs in `FARM` at the top |
| `js/game.js` | Runs the current scene: movement, collision, `goTo()` fade transitions, rendering, main loop |
| `css/style.css` | Page and UI styling |

Everything is drawn with `fillRect` on a 224×168 canvas scaled up with `image-rendering: pixelated`.

## Tests
Needs Node and Playwright (`npm i -D playwright && npx playwright install chromium`).
- `node tests/farm-scenarios.js` plays through every farm path (cupcake before/during/after, losing, reloads, kitchen detours).
- `node tests/fargo-scenarios.js` plays through Fargo (wrong station, running out of gas, pump, wrong snacks, kicked out, reloads).
- `node tests/farm-difficulty.js '{}'` simulates players of different skill; pass JSON to try other `FARM` settings.

## Adding a new place
Add an object to `SCENES` with `w`, `h`, `bounds`, `bg` (a canvas), `solids`, `triggers` and `entries`, plus optional `ambient/update/under/ents/over` hooks. Doors call `goTo('sceneName','entryName')`.

## Roadmap
- [x] Farm: Keelan Q&A, hen chase, hidden cupcake (Keelan helps if you give it to him)
- [ ] Farm: butter churning
- [ ] Mill: wheat harvest + crossword + millstone timing
- [ ] Night city: rooftop chocolate heist
- [x] Fargo: cheapest-gas hunt, stop the pump on $30.00, pick Alex's drink + snack
- [ ] Kitchen: mix, bake, decorate, final note

## Spoilers
The cupcake is behind the barn, in the middle. Its frosting peeks up over the roof, and a sparkle flashes beside it every few seconds. Walk behind the barn to grab it.

## Spoilers: Fargo
Bob's station (always $2.79) moves each attempt. Alex wants ginger ale + Mott's berry gummies. Two wrong picks and she sends you back outside.

## Rewards
Finishing a land shows a pop-up with the item's pixel art; tapping it flies it into the basket. Add the art for a new item to `ART` and its text to `REWARDS` in `js/ui.js`, then call `showReward('key')`.
