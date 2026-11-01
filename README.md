# The Great Cookie Quest

A Christmas game: travel to four lands to gather chocolate chip cookie ingredients, then bake them at home.

## Run it
Open `index.html` in a browser. No build step, no dependencies.
For live reload while editing: `python3 -m http.server` and visit http://localhost:8000.

## Layout
| File | What's in it |
|---|---|
| `js/story.js` | All dialogue, character names, the ending note. Keelan is in `KEELAN`; Jack + Margie in `GOLF_TEXT`; Bryan (the pond, sprinkles) in `BRYAN`; the heist crew + The Confectioner in `HEIST`; Lil Q (the gas station owner), Alex's snack reactions and the correct drink/snack are in `FARGO` |
| `js/world.js` | Overworld map: collision rects (`solids`), doors (`triggers`), painting. Also defines the scene system (`SCENES`) |
| `js/kitchen.js` | Kitchen interior scene; baking starts at the counter, recipe card on the fridge |
| `js/city.js` | The chocolate heist: crew switching (you/Lars/John), sonar, sprint, lift, searchlights, guard, lasers, vault, cookie signal |
| `js/portraits.js` | Faces shown beside dialog text, one painter per speaker name |
| `js/larsgames.js` | Lars's anagram challenge at the end of the heist, and the crew's how-to-play card |
| `js/anagrams.js` | Anagrams vs. Lars: 14 letter sets (one picked at random each game) + accepted words, scoring, Lars's difficulty in `ANAGRAM.LARS` |
| `js/story.js` → `VAULT_PUZZLES` | The vault's logic puzzles (and an inside-joke one). Add your own: a rule, three labels, the right answer. Crates get shuffled every time |
| `js/golf.js` | Wylee Woods Disc Golf: 5 holes vs Jack and Margie (incl. a platform tee and a hike-it-through-your-legs hole) for the milk. Holes in `HOLES`, difficulty in `GOLF` |
| `js/birkie.js` | The Birkie: John (brown hair, reading glasses) at the trailhead sends you off; guide the Vikings from Cable to Main Street, Hayward (pole in rhythm, tuck, snowplow, feed stations) for the flour. Course in `BIRK_SECTIONS`, difficulty in `BIRK` |
| `js/fargo.js` | Fargo: drive the CR-V, find the cheapest gas, Bob's $30.00 pump, then the snack stop for Alex. Car color in `CAR_COLOR`, fuel/speeds in `FUEL` |
| `js/sound.js` | All the sounds (made with Web Audio, no files): `sfx('name')` plays one from `SFX`. Background music in `SONGS`: one little loop per place (farm hoedown, breezy Wylee Woods, Hall of the Mountain King for the Birkie, sneaky heist, Fargo road trip, Deck the Halls at home, Jingle Bells for the Cookie Dance). Loudness in `SOUND` (`MUSIC` for the music); Sound and Music on/off in ⚙ Settings |
| `js/crossword.js` + `CROSSWORD` in story.js | The smudged recipe card: a crossword you solve before the baking. Change the words and clues in `CROSSWORD`; the grid arranges itself |
| `js/extras.js` | Exits (walk into them to leave, with a bouncing EXIT arrow: `EXITS`), the arrow over Joe's head when he can do something, Joe's hidden gear (`GEAR`: where the Oakleys, headband and carbon shoes are), and the sign in front of each land (`LAND_SIGNS`). Gear text: `GEAR_TEXT` in story.js |
| `js/people.js` | Jackie (Fargo, after Alex kicks Joe out of the shop; `JACKIE`), Logan in the clover patch (`LOGAN_TEXT`), the Vikings and Lil Q passing on the road, and Alex's "where to next?" hints when Joe stands still (`HINTS`) |
| `js/ending.js` | The ending: credits, Joe's stats, secrets found (find all 7 for the Cookie Legend crown + a secret note), the photo album, then the note. All its words are in `ENDING` in story.js; the note is `KITCHEN.note`. The album is also in ⚙ Settings |
| `js/state.js` | Player, basket save (localStorage), particles |
| `js/input.js` | Keyboard + touch d-pad |
| `js/ui.js` | Dialog system (pages + button menus), land/kitchen interactions |
| `js/kitchen.js` | The kitchen and the finale: everyone comes over, pour each ingredient to the gold line, crack 2 eggs, stir, bake to 10:00, party, crown. Amounts and tolerances in `KITCHEN.steps` (story.js), oven speed in `BAKE` |
| `js/farm.js` | Farm mission: Keelan, hen chase, hidden cupcake. Difficulty knobs in `FARM` at the top |
| `js/game.js` | Runs the current scene: movement, collision, `goTo()` fade transitions, rendering, main loop |
| `css/style.css` | Page and UI styling |

Everything is drawn with `fillRect` on a 224×168 canvas scaled up with `image-rendering: pixelated`.

## Before giving it to Joe
Press **Start over** so the game starts fresh with Alex's welcome.

## Tests
Needs Node and Playwright (`npm i -D playwright && npx playwright install chromium`).
- `node tests/farm-scenarios.js` plays through every farm path (cupcake before/during/after, losing, reloads, kitchen detours).
- `node tests/fargo-scenarios.js` plays through Fargo (wrong station, running out of gas, pump, wrong snacks, kicked out, reloads).
- `node tests/heist-scenarios.js` plays the heist start to finish (every skill, every way to get caught, reloads).
- `node tests/golf-scenarios.js` plays the disc golf course (hazards, winning, losing).
- `node tests/golf-difficulty.js '{}'` simulates players of different precision against Margie and Jack.
- `node tests/birkie-scenarios.js` skis the Birkie (crashes, deep snow, feeds, cutoff, winning, reloads).
- `node tests/birkie-difficulty.js '{}'` simulates skiers with different rhythm against the 3:00:00 cutoff.
- `node tests/kitchen-scenarios.js` bakes the cookies (every way to mess up a pour, the eggs, the oven) and plays the party; also the wardrobe.
- `node tests/farm-difficulty.js '{}'` simulates players of different skill; pass JSON to try other `FARM` settings.

## Adding a new place
Add an object to `SCENES` with `w`, `h`, `bounds`, `bg` (a canvas), `solids`, `triggers` and `entries`, plus optional `ambient/update/under/ents/over` hooks. Doors call `goTo('sceneName','entryName')`.

## Roadmap
- [x] Farm: Keelan Q&A, hen chase, hidden cupcake (Keelan helps if you give it to him)
- [ ] Farm: butter churning
- [x] Birkie trailhead (flour): parking lot, yurt, American Birkebeiner arch, the race with the Vikings
- [x] Crossword: the smudged recipe card, solved in the kitchen before baking (`CROSSWORD` in story.js)
- [x] Night city: rooftop chocolate heist with John and Lars
- [x] Fargo: cheapest-gas hunt, stop the pump on $30.00, pick Alex's drink + snack
- [x] Disc golf (milk): 5 holes vs Jack and Margie
- [x] Kitchen: everyone comes over, mix, bake, party, Joe's crown, final note
- [x] Wardrobe: Joe picks his look at the start and a stealth outfit before the city (`WARDROBE` in story.js), incl. Vikings gameday, 70s disco, Avant Guard, and a Cupcake costume unlocked by finding the cupcake. Change outfits any time in ⚙ Settings
- [x] Welcome from Alex when you first press Start (`ALEX_WELCOME` in story.js)
- [x] Finale: Alex hugs Joe, crown, THE COOKIE DANCE

## Spoilers
If Lars tries to long-jump the gap in the heist, he lands next to a pint of Maple Rosemary ice cream (a bonus; it shows up at the party).
Bryan is fishing by the pond in the top corner of the farm. Talk to him for sprinkles: a bonus that adds a shake-the-sprinkles step to the baking.
The cupcake is behind the barn, in the middle. Its frosting peeks up over the roof, and a sparkle flashes beside it every few seconds. Walk behind the barn to grab it.

## Spoilers: Joe's gear
Oakleys on the Vancouver beach (bottom left), a headband in the snow by the Birkie yurt, carbon racing shoes past the Fargo gas station. Each one glints every few seconds. Logan (in the clover patch by the barn path) gives Joe a lucky clover if he helps him look.

## Spoilers: Fargo
Bob's station (always $2.79) moves each attempt. Alex wants ginger ale + Mott's berry gummies. Two wrong picks and she sends you back outside.

## Spoilers: the heist
Switch to John to lift the log (or let Lars try to long-jump it first, for fun). Set the crew to Hold, switch to Lars, and sprint through a gap in the searchlights to the fuse box. On the last roof, wait for the guard to walk away, ping sonar, and follow the gaps in the lasers: bottom row left of center, middle row on the right, top row in the middle. Switch to John for the grate. In the vault, solve the label puzzle (Lars gives a hint). Then beat Lars at anagrams (he usually scores ~3,600).

## Rewards
Finishing a land shows a pop-up with the item's pixel art; tapping it flies it into the basket. Add the art for a new item to `ART` and its text to `REWARDS` in `js/ui.js`, then call `showReward('key')`.
