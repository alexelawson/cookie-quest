# The Great Cookie Quest

A Christmas game: travel to four lands to gather chocolate chip cookie ingredients, then bake them at home.

## Run it
Open `index.html` in a browser. No build step, no dependencies.
For live reload while editing: `python3 -m http.server` and visit http://localhost:8000.

## Layout
| File | What's in it |
|---|---|
| `js/story.js` | All dialogue, character names, the ending note. Keelan is in `KEELAN`; Jack + Margie in `GOLF_TEXT`; the heist crew + The Confectioner in `HEIST`; Bob, Alex's snack reactions and the correct drink/snack are in `FARGO` |
| `js/world.js` | Overworld map: collision rects (`solids`), doors (`triggers`), painting. Also defines the scene system (`SCENES`) |
| `js/kitchen.js` | Kitchen interior scene; baking starts at the counter, recipe card on the fridge |
| `js/city.js` | The chocolate heist: crew switching (you/Lars/John), sonar, sprint, lift, searchlights, guard, lasers, vault, cookie signal |
| `js/portraits.js` | Faces shown beside dialog text, one painter per speaker name |
| `js/larsgames.js` | Pick-a-game menu at the end of the heist, quick draw, darts, and the how-to-play card. Difficulty in `QUICKDRAW` and `DARTS` |
| `js/anagrams.js` | Anagrams vs. Lars: letter sets + accepted words, scoring, Lars's difficulty in `ANAGRAM.LARS` |
| `js/golf.js` | Creamery Hills Disc Golf: 5 holes vs Jack and Margie (incl. a platform tee and a hike-it-through-your-legs hole) for the milk. Holes in `HOLES`, difficulty in `GOLF` |
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
- `node tests/heist-scenarios.js` plays the heist start to finish (every skill, every way to get caught, reloads).
- `node tests/golf-scenarios.js` plays the disc golf course (hazards, winning, losing).
- `node tests/golf-difficulty.js '{}'` simulates players of different precision against Margie and Jack.
- `node tests/farm-difficulty.js '{}'` simulates players of different skill; pass JSON to try other `FARM` settings.

## Adding a new place
Add an object to `SCENES` with `w`, `h`, `bounds`, `bg` (a canvas), `solids`, `triggers` and `entries`, plus optional `ambient/update/under/ents/over` hooks. Doors call `goTo('sceneName','entryName')`.

## Roadmap
- [x] Farm: Keelan Q&A, hen chase, hidden cupcake (Keelan helps if you give it to him)
- [ ] Farm: butter churning
- [ ] Mill: wheat harvest + crossword + millstone timing
- [x] Night city: rooftop chocolate heist with John and Lars
- [x] Fargo: cheapest-gas hunt, stop the pump on $30.00, pick Alex's drink + snack
- [x] Disc golf (milk): 5 holes vs Jack and Margie
- [ ] Kitchen: mix, bake, decorate, final note

## Spoilers
The cupcake is behind the barn, in the middle. Its frosting peeks up over the roof, and a sparkle flashes beside it every few seconds. Walk behind the barn to grab it.

## Spoilers: Fargo
Bob's station (always $2.79) moves each attempt. Alex wants ginger ale + Mott's berry gummies. Two wrong picks and she sends you back outside.

## Spoilers: the heist
Switch to John to lift the beam. Set the crew to Hold, switch to Lars, and sprint through a gap in the searchlights to the fuse box. On the last roof, wait for the guard to walk away, ping sonar, and follow the gaps in the lasers: bottom row left of center, middle row on the right, top row in the middle. Switch to John for the grate. In the vault, ping sonar: the chocolate is the crate with bars. Then beat Lars at a game of your choice: anagrams (he scores ~4,000-5,500), quick draw (he reacts in ~0.25s), or darts.

## Rewards
Finishing a land shows a pop-up with the item's pixel art; tapping it flies it into the basket. Add the art for a new item to `ART` and its text to `REWARDS` in `js/ui.js`, then call `showReward('key')`.
