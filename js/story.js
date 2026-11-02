// Dialogue, character names and the ending note. Edit the words here.
const ITEMS = [
  {key:'farm',  label:'Eggs & butter'},
  {key:'mill',  label:'Flour'},
  {key:'city',  label:'Chocolate'},
  {key:'fargo', label:'Sugar'},
  {key:'golf',  label:'Milk'},
];
// ---------- The farm: Keelan ----------
// Each question is a button; the answer plays as one page per string.
const KEELAN = {
  place:'The Farm', name:'Keelan',
  hello:"Hey. You here about the eggs? Because we've got a situation...",
  helloAgain:"Back for another round?",
  questions:[
    {q:"What happened here?",       a:["One of the hens found a gap in the fence.","Then she found all the other gaps. Then she told her friends."]},
    {q:"How do I catch them?",      a:["Run right into one to scoop it up. You can only carry one at a time.",
                                       "Bring it back to the gate and it'll hop in.",
                                       "Get all twenty home at once and they'll settle down.",
                                       "If nine are loose at once, you lose."]},
    {q:"How many chickens are there?", a:["Twenty. When they're all home, anyway."]},
    {q:"Can't you catch them?",     a:["I've been chasing them since sunrise. I'm running on empty.",
                                       "Man... I could really go for a sweet treat right now..."]},
    {q:"Can I get eggs and butter?", a:["Get my girls back in the pen and they're all yours."]},
  ],
  ready:"I'm ready!",
  start:["Alright. Stand back from the gate...","...and there they go."],
  cupcakeQ:"Give Keelan the cupcake",
  cupcakeA:["Wait. Is that a cupcake?","...","Okay. I've got a second wind. I'll help you round them up."],
  cupcakeLate:["For me? You already did all the work.","...I'm eating it anyway. Thanks."],
  foundCupcake:"You found a cupcake hidden behind the barn. You think Keelan might want it?",
  cupcakeUnlock:"🔓 New costume unlocked: Cupcake! Change outfits any time in ⚙ Settings.",
  midHello:"Keep going, you've got this!",
  midQ:"How am I doing?",
  backToIt:"Back to it",
  lose:["Whoa. Whoa. That's too many.","Let's get them settled and try again. Talk to me when you're ready to try again."],
  win:["That's all twenty. You're a natural.","Eggs are yours. I'll throw in some butter too."],
  thanks:"Thanks, Keelan!",
  after:"All twenty, home and accounted for. Thanks again.",
  bye:"Bye",
};

// ---------- The city: the chocolate heist ----------
// You, Lars and John vs. The Confectioner. Change any of these lines.
const HEIST = {
  place:'The City at Night', stranger:'Dr. Alex', villain:'The Confectioner',   // the client: Alex, in a mad-scientist costume
  crew:{hero:'Joe', lars:'Lars', john:'John'},
  briefing:["Ah. You came. Excellent. EXCELLENT.",
            "For years I have perfected the ultimate chocolate chip cookie. The formula is complete... except for one ingredient.",
            "The chocolate's gone. Every last bar in the city. Taken by someone calling himself The Confectioner.",
            "He's holed up in the old candy works, three rooftops east. Searchlights. Guards. Lasers you can't see.",
            "Bring me that chocolate. Science will thank you. (So will I.)"],
  crewHello:[['John',"We got you, man."],['Lars',"I am ready."]],
  strangerAgain:"Three rooftops east. Go! Science waits for no one.",
  whoIsThat:"Who's that by the lab bench? Go talk to her. Something's bubbling.",
  briefFirst:"Let's see what the lady in the lab coat wants first.",
  howTo:"Tap a face (or press 1, 2, 3) to switch who you control. A uses their skill. Hold keeps the others in place.",
  skills:{hero:'Sonar', lars:'Sprint', john:'Lift'},
  johnGap:"That log's not gonna lift itself. Well. I'll lift it. Switch to me.",
  beamLook:"A huge tree trunk. Somebody's been hauling firewood up here. It's just about as long as the gap to the next roof.",
  beamBridge:"Use it as a bridge",
  beamJump:"Have Lars try to long-jump the gap",
  // Lars tries the long jump: these lines, then he actually runs and jumps (and boings right back), then the after lines
  beamJumpBefore:[['Lars',"Finally. Stand back."],['Lars',"Personal best, 2019. This is nothing."],['John',"Lars, no."]],
  beamJumpAfter:[['Lars',"..."],['Lars',"Headwind."],['John',"There is NO wind. "],['John',"I'm lifting the log. Nobody talk to me."],['Lars',"I was SO close."]],
  // ...and where he lands, he finds something (only the first time): a bonus for the cookies
  jumpIceCream:[['Lars',"Wait. What's this?"],['Lars',"A pint of Maple Rosemary ice cream. In the gutter. Still frozen."],['John',"...Why is that up here."],['Lars',"Don't question the rooftops, John."]],
  beamLeave:"Leave it",
  beamTooHeavy:[['Joe',"Hnnngh. Nope."],['John',"Step aside. Switch to me."]],
  onlyJohn:"Only John can lift that.",
  beamDone:"Log bridge is up. Watch your step, it's a little rolly.",
  carryHint:"Oof. Long one. It won't fit through the gap by the tank sideways. Tap A to turn it.",
  noRoom:"No room to turn it here.",
  handsFull:"John's got his hands full. Put the log down first.",
  layLog:"Lay the log across the gap",
  turnIt:"Turn it sideways (A) to lay it across",
  larsLights:"Searchlights. Tell these guys to hold up and let me run it. I'll hide in the shadows behind the vents and tanks, then sprint.",
  fuse:"Flip the LIGHT POWER switch",
  onlyLars:"It's across the searchlights. Lars is the only one fast enough.",
  fuseDone:"*KA-CHUNK* Lights out.",
  heroLasers:"Tripwires around the skylight. Some I can see, some I can't. One ping of the sonar and I'll chalk-mark the hidden ones. There's a control panel past them, by the skylight. If I get through, I can shut them all off for everyone.",
  lasersOff:"Shut off the lasers",
  lasersDone:"*click* Lasers off. Come on up, guys. Watch out for the guard.",
  grate:"Rip off the grate",
  grateDone:"Grate's off.",
  dropIn:"Drop through the skylight",
  spottedLight:"A searchlight catches {who}!",
  spottedGuard:"\"Hey! Who's up there?!\"",
  spottedLaser:"{Who} tripped a laser. Alarms everywhere!",
  backToCheckpoint:"Back to the last checkpoint.",
  followTip:"{who} was following right behind you. Set the crew to Hold, and they'll wait while you go.",
  followTipYou:"You were tagging along right behind {lead}. Set the crew to Hold, and the others wait while one person goes.",
  vaultTitle:"The Confectioner's vault",
  vaultNote:"One crate has the chocolate. Two have raisins. The Confectioner left a rule:",
  vaultHint:"Ask Lars for a hint",
  raisins:[['John',"Raisins. In a cookie. ABSOLUTELY not."],['Lars',"That's a crime. Read the labels again."]],
  gotIt:"Chocolate. A whole crate of it.",
  villainNote:"A last note, taped inside the lid: \"Fine. Keep your chocolate. Why so salty? —The Confectioner\"",
  finale:[['Dr. Alex',"You found it! The final ingredient!"],['Dr. Alex',"The formula is complete. MWAHAHAHA. Ahem. I mean: thank you."],['John',"Can we go home now? It's cold."]],
  thanks:"Let's go bake",
  larsChallenge:[['Lars',"Hold up. Before we go home..."],['Lars',"Loser carries the chocolate down the ladder. Anagrams. Right now."],['John',"Oh no. Not this again."]],
  larsPick:"Six letters, sixty seconds. Different letters every game, so no memorizing.",
  larsReady:"Bring it",
  howToTitle:"The crew",
  howToSkills:{hero:"Sonar pulse. Lights up the dark and shows the invisible tripwires. Ping near them once and they stay chalk-marked.",
               lars:"Sprint. A short burst of speed. Dash from shadow to shadow under the searchlights.",
               john:"Lift. Carries heavy things: the log (tap A to turn it), the grate."},
  howToControls:["Switch who you control: tap their face below the screen, or press 1, 2, 3.",
                 "Use their power: the A button, or Space.",
                 "Crew: Follow / Hold: tap the toggle or press F. On Hold, the others stay put while you go alone."],
  howToOk:"Got it",
  anagramTitle:"Anagrams vs. Lars",
  anagramRules:"Make words from the six letters. Longer words score way more. Beat Lars before the clock runs out.",
  anagramStart:"Go!",
  anagramDone:"Collect the chocolate",
  anagramRematch:"Rematch",
  larsWins:[['Lars',"Ha! Again? New letters this time, if that helps."]],
  larsLoses:[['Lars',"...Best two out of three?"],['John',"No. You carry the chocolate, Lars."]],
  // after the chocolate: Lars lugs the crate back to the grate, John rolls his eyes, and everyone heads home
  exitLines:[['Lars',"Who packed this?! It weighs as much as a Viking."],['John',"*rolls eyes* You lost. You carry. Those are the rules."],['Lars',"Best three out of five?"],['John',"Down the grate, Lars."]],
  strangerRematch:"Your friend wants his rematch.",
  after:"The cookie signal's up. The experiment can begin.",
  climbDown:"Climb down the ladder",
};

// ---------- The welcome: Alex explains the game when you press Start the first time ----------
const ALEX_WELCOME = {speaker:'Alex', place:'Home',
  pages:["Merry Christmas, to the best boyfriend EVER. ",
    "Okay. We're making chocolate chip cookies. And I need your help.",
    "Walk with the arrow keys (or the pad under the screen). Press Space or A to talk to people and do things.",
    "Everything you get goes in the basket up top. When it's full, meet me in the kitchen.",
    "Oh, and look around. Some people might need a little favor..."],
  go:"Let's go!",
  lookTitle:"Pick Joe's look", lookIntro:"First things first. What are you wearing today?", lookGo:"Looks good"};

// ---------- Bryan: super chill, hanging out by his boat on the pond. Find him and he gives you sprinkles ----------
const BRYAN = {name:'Bryan', place:'The Pond',
  hello:["Oh. Hey.","...","Nice day for it.","Oh, you're making cookies? Here. Have some sprinkles."],
  take:"Take the sprinkles",
  after:["Hey again.","Boat's good. Water's good. We're good."]};

// ---------- Joe's stealth wardrobe (picked before the city) ----------
const WARDROBE = {title:"Suit up, Joe", intro:"It's a stealth mission. What are you wearing?", go:"Suit up",
  jersey:{id:'jersey', name:"Joe's Jersey", line:"White jersey, red trim. The classic Joe."},   // only offered at the start
  outfits:[
    {id:'cape',    name:"The Classic",      line:"Dark suit, mask, dramatic cape. Very brooding."},
    {id:'ninja',   name:"All-Black Ninja",  line:"Head to toe in black. Only your eyes show."},
    {id:'burglar', name:"Cat Burglar",      line:"Striped shirt, beanie, eye mask, and a sack for the loot."},
    {id:'hoodie',  name:"Hoodie & Sweats",  line:"Hood up. Mysterious. Mostly just comfy."},
    {id:'sweater', name:"Ugly Xmas Sweater",line:"Stealth: zero. Festive: maximum."},
    {id:'vikings', name:"Vikings Gameday",  line:"Purple jersey, gold pants, horned helmet. SKOL."},
    {id:'disco',   name:"70s Disco",        line:"White suit, gold chain, big hair. Stayin' alive."},
    {id:'avant',   name:"Avant Guard",      line:"Black turtleneck, one enormous white shoulder, red beret, tiny sunglasses. It's a statement."},
    {id:'cupcake', name:"Cupcake",          line:"A whole cupcake. Frosting hat, sprinkles, cherry on top. Unlocked by finding the cupcake.", unlock:'cupcakeCostume'},
  ],
  changeOutfit:"Change outfit",   // the button in Settings
  changeIntro:"Change it up any time. What are you wearing?",
  react:{cape:[['Lars',"Very dramatic. The cape is a lot."],['John',"I love the cape."]], ninja:[['John',"I can't see you. That's the point, right?"]],
         burglar:[['Lars',"You look like a cartoon robber."],['John',"It's perfect."]], hoodie:[['John',"Respect. Comfort first."]],
         sweater:[['Lars',"They're going to see you from space."],['John',"Festive though."]],
         vikings:[['John',"SKOL!!!"],['Lars',"We're breaking into a vault, not tailgating."],['John',"Why not both."]],
         avant:[['Lars',"Is that... art?"],['John',"He looks like a security guard from the year 3000."],['Lars',"Avant Guard. I get it. I hate that I get it."]],
         cupcake:[['John',"Oh no. He's a cupcake."],['Lars',"Every searchlight in the city is about to want a bite."],['John',"I'd eat him. Respectfully."]],
         disco:[['John',"Bro."],['John',"BRO. It's a heist, not a roller rink."],['Lars',"Is that a gold chain?"],['John',"The searchlights are gonna think you're a disco ball. Do NOT do the Hustle up there."]]}};

// ---------- The vault puzzles (the heist's last lock) ----------
// One is picked at random each time, and the crates are shuffled, so the right one moves around.
// Each puzzle has three crates, X, Y and Z. `answer` is the one with the chocolate.
// In a label, {X} / {Y} / {Z} become "the left crate", "the middle crate" or "the right crate", wherever that crate ended up.
// To add an inside joke: a rule that asks the question, three labels that are the answer choices, and the right one.
const VAULT_PUZZLES = [
  {rule:"\"Exactly ONE of these labels is true.\"",
   labels:{X:"The chocolate is in this crate.", Y:"The chocolate is NOT in this crate.", Z:"The chocolate is not in {X}."}, answer:'Y',
   hint:"Pretend the chocolate is in each crate, one at a time, and count how many labels would be true."},
  {rule:"\"Every single label is a LIE.\"",
   labels:{X:"The chocolate is in this crate.", Y:"The chocolate is in {X}.", Z:"The chocolate is not in this crate."}, answer:'Z',
   hint:"If every label is a lie, flip each one around. Which crate says it DOESN'T have the chocolate?"},
  {rule:"\"Exactly ONE of these labels is true.\"",
   labels:{X:"Raisins are in this crate.", Y:"Raisins are in this crate.", Z:"Raisins are in {Y}."}, answer:'Y',
   hint:"Try the chocolate in each crate and count the true labels. Only one crate makes exactly one true."},
  {rule:"\"The chocolate's label is TRUE. Raisin labels LIE.\"",
   labels:{X:"{Y} has raisins.", Y:"{Z} has the chocolate.", Z:"This crate has the chocolate."}, answer:'X',
   hint:"Raisin crates always lie. Try the chocolate in each crate: the chocolate's label has to come out true, and the other two false."},
  // An inside joke instead of logic: the question goes in the rule, the choices on the labels.
  {rule:"\"Only the real one knows: where was the cheapest gas on the road trip?\"",
   labels:{X:"Fargo", Y:"Bismarck", Z:"Minneapolis"}, answer:'X',
   hint:"Think road trip. Think future home."},
];

// ---------- The Birkie trailhead: John sends the Vikings off with the flour, then the crossword ----------
const BIRKIE = {
  place:'Birkie Trailhead', john:'John',
  johnHello:["You're here for flour? Great. Problem.",
    "The flour's at the start in Cable. The bakery's in Hayward. Fifty kilometers of hills in between.",
    "The Vikings offered to ski it over, Birkebeiner-style. Like the old legend.",
    "They're strong. They are NOT good skiers. Guide them, would you?"],
  go:"Head to the start line",
  later:"Later",
  johnDone:"The flour made it! Go bake something good with it.",
  takeFlour:"Take the flour",
  johnAfter:"Come back anytime. Bring a pencil.",
  howToTitle:"The Birkie",
  howToSteps:["It's a skate race. You ski on your own; tap left or right to change lanes (or swipe on a phone). The Vikings follow your tracks exactly.",
    "Jump over skiers who fell: Up, A or Space (or swipe up / tap).",
    "Packs of slow skiers take up two lanes. Go around them.",
    "Feed stations: a volunteer swings a cup of flat Coke between two lanes. Be in the cup's lane right when you get there to grab it, then hold steady while you drink. Jump or change lanes and it spills.",
    "Your energy drains as you go (faster uphill). Low energy is slow. Flat Coke fills it back up.",
    "Stay ahead of the sweep snowmobile (the red dot on the left). If it catches you, you're out. It reaches Main Street at 3:00:00."],
  howToOk:"Let's ski",
  // John talks to you over the radio for the whole race. Short lines fit best (they wrap onto up to 3 lines).
  radioStart:["John here, on the radio. The Vikings are lined up behind you.","They'll follow your tracks exactly. Watch the sweep snowmobile on the left. Go!"],
  crash:["Yard sale! Shake it off.","Down goes a Viking. Up you get.","Face plant. Happens to everyone.","Skis everywhere! Regroup and go."],
  packCrash:["You skied right into a pack. Lots of apologizing. Go around next time.","Tangled up in a pack of skiers. Somebody's pole is in your bib."],
  bonk:"You're bonking! Get to the next feed station.",
  feedAhead:"Feed station! The volunteer's swinging the cup. Be in its lane when you get there.",
  grab:"Got it! Now drink. Hold steady, don't spill it.",
  holdSteady:"drinking... hold steady",
  spill:["Flat Coke all over your bib. You got a sip, at least.","SPLASH. The volunteer saw that. Most of it's on the snow."],
  feedMissed:"Missed the cup! The next one's further on.",
  feed:"Flat Coke! The real fuel of the Birkie. Energy's full.",
  bridge:"The International Bridge! All the flags! Main Street's right there. Bring it home!",
  onRadio:"(on the radio)", vikingName:"A Viking",
  // the Vikings pipe up every so often. Add as many as you like.
  vikings:{
    feed:["Flat Coke?! Are you kidding me? Where's the mead?","Flat Coke. FLAT. Coke. We sailed here for this?","I asked for a turkey leg. They gave me a cup."],
    tired:["Man, I'm tired.","I can't feel my beard.","My horns are cold.","Are we there yet? It's been like 50 kilometers.","Odin, give me strength. And better wax.","Is it too late to just pillage the bakery?"],
    climb:["Who put a hill HERE?","I've raided villages with fewer hills than this.","Is skiing always this... uphill?"],
    lake:["This lake is colder than the fjords back home.","Should've brought the longship."],
    finish:["FLAGS! I LOVE FLAGS!","SKOL!!! SKOL!!!","Is that the finish? I'm going to cry into my beard."],
  },
  sweepClose:"The sweep snowmobile is right behind you. Pick it up!",
  climb:"Climb coming. It'll eat your energy. Stay smooth.",
  halfway:"Halfway! OO is behind you. Keep it steady.",
  lake:"Lake Hayward. It's windy out there. The bridge is on the other side. Keep pushing.",
  finishWin:t=>[`Main Street, Hayward! You finished in ${t}.`,"The crowd is going nuts. The flour made it."],
  finishLate:t=>[`The sweep snowmobile caught you at ${t}.`,"The Vikings are sitting in the snow eating the flour. Want to try again?"],
  elite:"Under 2:30?! That's elite wave. The crowd is losing it.",
  vikingsWin:"The Vikings are yelling SKOL at everyone on Main Street. Come see me for the flour.",
  againAsk:"Back to the start?",
  again:"Try again",
  leave:"Back to the trailhead",
};

// ---------- The disc golf course: Jack and Margie (milk for the cookies) ----------
const GOLF_TEXT = {
  place:'Wylee Woods Disc Golf',
  jack:'Jack', margie:'Margie',
  margieHello:["Oh hey! You here for the milk? Cool cool cool.","The creamery only gives the good stuff to whoever wins the round. I made that rule up just now. It's legally binding.","Five holes. Beat Jack, and at least tie me. You won't. But I love that for you."],
  jackHello:"Margie's averaging 2.6 throws a hole this month. I'm at 4.9. I have a spreadsheet. I don't want to talk about the spreadsheet.",
  ready:"Let's play",
  notYet:"Maybe later",
  howToTitle:"How to throw",
  howToPeople:{Margie:"The one to beat. Wears heart sunglasses. Has never once doubted herself. Tie her or better.", Jack:"Extremely serious. Extremely into stats. Extremely bad. Beat him."},
  howToSteps:["Tap A (or Space) to stop the sweeping arrow. That's your aim.",
              "Tap again to stop the power meter. A fuller bar throws farther.",
              "Long throws curve a little to the left at the end.",
              "Inside the dotted circle around the basket it's a putt: slower arrow, shorter throw.",
              "Hit a tree dead center and it stops your disc. Clip one and it glances off.",
              "Out of bounds (past the white stakes) or in the water: +1 penalty stroke, and you rethrow from the same spot.",
              "Five holes. Fewest throws wins: beat Jack, and tie or beat Margie."],
  howToOk:"Got it",
  practiceAsk:"Want a practice throw first? It doesn't count. I count mine, but I'm built different.",
  practice:"Practice throw",
  startRound:"Start the round",
  practiceAgain:"Throw again",
  practiceIn:"Chains! Okay, show-off. That's MY move.",
  practiceDist:d=>`About ${d} feet from the basket.`,
  practiceWater:"Splash! The pond says hi. Good thing it doesn't count.",
  practiceOb:"Out of bounds. Bold. Wrong, but bold.",
  practiceTree:"Bonk! Trees are just aggressive bushes.",
  restartAsk:"Start the round over from hole 1? Your scores so far get wiped.", restartYes:"Start over", restartNo:"Keep playing",
  holeNames:["Hole 1: The Opener","Hole 2: The Lookout","Hole 3: Cow Pond","Hole 4: Hut! Hut!","Hole 5: The Tunnel"],
  platformHint:"You throw this one from the platform. Up there your drive sails right over the trees. I call it my throne. Don't look down. I never look down.",
  hikeHint:"House rule: face away from the basket and hike it through your legs. My through-the-legs accuracy is 11%. Up from 8%. HUT! HUT!",
  water:"Splash. That's a penalty stroke, back to where you threw from.",
  ob:"Out of bounds. Penalty stroke, back to where you threw from.",
  // the pop-up when you go out of bounds or in the water. n = the throw you're on next
  obTitle:"OUT OF BOUNDS!", waterTitle:"SPLASH!",
  penalty:n=>`+1 penalty stroke. You throw again from the same spot. Next up: throw ${n}.`,
  penaltyOk:"Ugh. Okay.",
  tree:"*THWACK* Right off a tree.",
  chains:"Chains!",
  ace:"ACE!!! In one throw!",
  margieHole:{'-1':"Birdie. Obviously. Somebody paint my portrait.",'0':"Par. I let you have that one. You're welcome.",'1':"Bogey?! A cow made eye contact with me. Mid-throw."},
  jackHole:{'-1':"BIRDIE. That's my first birdie since April 3rd. Writing it down.",'0':"Par. Par is 100th percentile for me. Logging it.",'1':"Bogey. Wind out of the northwest at four miles an hour. Statistically significant.",'2':"Double bogey. Updating the spreadsheet. Lowering my expectations column."},
  win:["Okay, okay. You earned it. I'm still the best, but you earned it.","Jack, give them the milk."],
  jackWin:"Whole milk. 3.25% fat. I checked. Cookies deserve the data.",
  lose:["Good round though! Not MY round, but good! Want to go again?"],
  again:"Play again",
  after:"Come back anytime. The cows like you. The cows have taste. Like me.",
  enter:"Go to the disc golf course",
  leave:"Head back to the road",
};

// ---------- Fargo: Lil Q (runs the cheapest gas station in the country) and Alex, your passenger ----------
const FARGO = {
  place:'Fargo, ND', bob:'Lil Q',   // the gas station owner's name (the code calls her "bob")
  intro:["We're running on fumes.","Somewhere in this town is the cheapest gas in the whole country. Find it. I believe in you."],
  introSpeaker:'Alex',
  attendants:['Deb','Lars','Shelly','Ole','Marv'],
  // the signs on the gas station shops (keep them short: about 9 letters fits). Lil Q's always says LIL Q'S.
  stationSigns:['GAS N GO','PRAIRIE','RED RIVER','BISON','STAR GAS'],
  bobSign:"LIL Q'S",
  ask:p=>`$${p} a gallon. Fill 'er up?`,
  fill:"Fill up", keep:"Keep looking",
  wrong:p=>[`Tank's full. At $${p} a gallon.`,"On your way out of town you pass a sign that says $2.79.","Oof."],
  retry:"Try again",
  bobHello:["Yo yo YO. Look who found it. Cheapest gas in the whole dang country.","They call me Lil Q. I rode my scooter here all the way from Elinor's. Three days. Top speed nineteen. No regrets.","Two seventy-nine a gallon. Lil Q don't play."],
  bobBet:["Here's the deal, rookie. Stop that pump on thirty dollars EXACTLY and Lil Q hooks you up with sugar.","Beets from out back. Sweetest in the Red River Valley. That's a bar. Write it down."],
  pumpTitle:"Lil Q's bet: stop on exactly $30.00",
  pumpHint:"Hold to pump. Let go to stop. Quick taps for the last few cents.",
  bust:["Ohhh, a penny over! The pump don't lie, baby.","Over again! Lil Q resets. Lil Q forgives.","Thirty and WHAT?? Run it back.","Steady hands, rookie. Be the pump. Become the pump."],
  pumpWin:["THIRTY. EVEN. Somebody get this rookie a record deal.","Now go inside and grab something for your co-pilot. She's been real patient. Unlike Lil Q."],
  goInside:"Go inside",
  bobWaiting:"Go on in, she's waiting. Wrong snack and Lil Q writes a diss track about you.",
  win:["Ginger ale AND Mott's? That's love, rookie. Lil Q respects it.","Here. Sugar, straight outta the Red River Valley. Peace."],
  thanks:"Thanks, Lil Q!",
  after:"Lil Q out. *revs scooter* *scooter goes meep*",
  empty:"Out of gas! You're pushing the CR-V now.",
  emptyAlex:"I'll steer.",
  leave:"Head back to the highway",

  // ---- the snack stop: Alex (the passenger) ----
  // Change her lines here. `correct` says which drink + snack she wants.
  shop:"Lil Q's Gas & Go",
  wallet:20,          // dollars left after $30 of gas
  wrongCost:3,        // each wrong pick costs this much
  strikesOut:2,       // this many wrong picks and you get sent back outside
  correct:{drink:'gingerale', snack:'motts'},
  drinks:[
    {id:'coke',      name:'Coke',        react:"Coke? Close. But no."},
    {id:'sprite',    name:'Sprite',      react:"Sprite?? We are not on the same page."},
    {id:'gingerale', name:'Ginger Ale',  react:"Ginger ale!"},
    {id:'pepsi',     name:'Pepsi',       react:"Pepsi. Who even are you right now."},
    {id:'pedialyte', name:'Pedialyte',   react:"Pedialyte? Do I look hungover to you?"},
  ],
  snacks:[
    {id:'pringles',  name:'Pringles Original', react:"Pringles. Bold choice. Wrong, but bold."},
    {id:'cheetos',   name:'Cheetos',           react:"Cheetos? My fingers will be orange the whole drive."},
    {id:'smartfood', name:'Smartfood Popcorn', react:"Smartfood is fine. It's not what I wanted, but it's fine."},
    {id:'almondjoy', name:'Almond Joy',        react:"Almond Joy?! Do you know me at all?"},
    {id:'snickers',  name:'Snickers',          react:"Snickers. Nope."},
    {id:'motts',     name:"Mott's Berry Gummies", react:"Mott's!"},
  ],
  alexHello:"Okay. You know what I like. Don't mess this up.",
  pickBoth:"Pick a drink and a snack.",
  give:"Give to Alex",
  alexWin:"Ginger ale AND Mott's? You know me so well.",
  strike:"That'll cost you.",
  kickedOut:"Okay. Out. Go think about what you've done.",
  alexOutside:"...",
  alexWaiting:"Snacks. Please. I've been in this car for nine hours.",
};

// ---------- The smudged recipe card: a crossword before the baking ----------
// Change, add or remove words freely: the grid fits them together by itself (letters only; spaces are ignored).
// Each answer needs to share a letter with at least one other answer so it can cross it.
const CROSSWORD = {
  title:"The smudged recipe card",
  intro:"Oh no. I spilled vanilla on the recipe card and smudged the ingredients. Help me figure out what goes in!",
  words:[
    {answer:'CHOCOLATE', clue:"Lars wanted to keep the whole crate"},
    {answer:'BUTTER',    clue:"Keelan's farm sent this. One cup, goes in first"},
    {answer:'FLOUR',     clue:"The Vikings skied it all the way to Main Street, Hayward"},
    {answer:'SUGAR',     clue:"Picked up in Fargo, after exactly $30.00 of gas"},
    {answer:'EGGS',      clue:"The hens did NOT want to give these up"},
    {answer:'MILK',      clue:"Margie says bringing this makes her the main character"},
    {answer:'OVEN',      clue:"375 degrees, ten minutes, don't walk away"},
    {answer:'COOKIE',    clue:"The whole point of this quest"},
  ],
  across:'Across', down:'Down',
  check:'Check', hint:'Hint', later:'Later',
  empty:"Some boxes are still empty. Keep going!",
  wrong:n=>n===1?"One letter's off. It's the red one.":`${n} letters are off. They're the red ones.`,
  hintSay:"Here, I'll fill one in for you.",
  wordDone:"That one's already right! Tap another clue.",
  solved:"You cracked it! The card's readable again. Let's bake.",
  solvedClue:"All the ingredients, figured out.",
  go:"Let's bake",
};
// ---------- Joe's gear, hidden around the main map (where: GEAR in extras.js) ----------
const GEAR_TEXT = {
  place:"Found something!",
  oakleys: {name:"Oakleys", found:"Oakley sunglasses, half buried in the sand. Joe puts them on. Instantly 40% faster.", wear:"Put them on"},
  headband:{name:"Headband", found:"A ski headband in the snow! It smells faintly of klister. Perfect.", wear:"Put it on"},
  shoes:   {name:"Carbon racing shoes", found:"Carbon-plated racing shoes! Joe could run a marathon in these. Or at least to the mailbox.", wear:"Lace them up"},
  clover:  {name:"Lucky clover"},
  tip:"(Take it off or put it back on any time in ⚙ Settings.)",
};
// ---------- Jackie (Fargo): shows up when Alex kicks Joe out of the shop. Very direct. ----------
const JACKIE = {
  kicked:["Hey. I'm Jackie. You just got kicked out of a gas station.","Here's what you do: stand here a second. Think about what she actually likes. Then go back in and try again. The door's right there."],
  ok:"Okay, Jackie",
  hints:["She's been in a car for nine hours. Her stomach is not happy. Think gentle. Bubbly, but gentle.",
         "Snack: fruity. Chewy. Not chocolate, not chips. It comes in a little pouch.",
         "Ginger ale. Mott's berry gummies. I can't make it more obvious than that. Go."],
  tryAgain:"Go back inside (try again)",
};
// ---------- Logan (the clover field on the farm, by the barn path) ----------
const LOGAN_TEXT = {
  place:"The clover patch",
  hello:["Shh. I'm looking for four-leaf clovers.","I've found three so far this year. Statistically, there's one right... somewhere."],
  help:"Help him look", later:"Leave him to it",
  found:["...","Wait. WAIT. Right by your foot. You found one!","Here. You keep it. Pin it on. You're gonna need the luck."],
  wear:"Pin it on",
  after:["Still looking. You're welcome to stay, but it's a quiet sport.","Found a three-leaf. Doesn't count.","Clovers are about patience. And crouching."],
};
// ---------- Alex's "where to next?" hints: shown if Joe stands still on the map for a bit ----------
const HINTS = {
  AFTER_MS:12000,   // how long Joe has to stand still before Alex chimes in
  farm:"Eggs and butter: Keelan's at the farm, top left. His hens could use some help.",
  mill:"Flour: John's at the Birkie trailhead, top right, under the big arch.",
  city:"Chocolate: the rainy city, bottom left. Take the elevator up to the rooftops.",
  fargo:"Sugar: Fargo, bottom right. Drive in and find the cheapest gas in town.",
  golf:"Milk: Wylee Woods, straight down the road from the kitchen. Beat Margie and Jack.",
  home:"That's everything! Head home to the kitchen and let's bake.",
};
// ---------- The ending: credits, Joe's stats, the photo album, then the note (KITCHEN.note) ----------
const ENDING = {
  creditsTitle:"THE GREAT COOKIE QUEST", creditsSub:"Starring",
  // [portrait, name, role, (only if have[...])]
  credits:[
    ['Joe','Joe','The Cookie King'],['Alex','Alex','Head Baker, Snack Critic'],['Keelan','Keelan','Eggs, Butter, Hen Wrangling'],
    ['Logan','Logan','Four-Leaf Clover Specialist'],['Bryan','Bryan','Sprinkles. Very Chill.'],['Trail John','John (the other one)','Flour, 50 km'],
    ['Lars','Lars','Long Jump (Attempted)'],['John','John','Heavy Lifting, Eye Rolling'],['Dr. Alex','Dr. Alex','Mad Scientist (Rooftop Division)'],
    ['Lil Q','Lil Q','Exactly $30.00 of Gas'],['Jackie','Jackie','Straight Talk','metJackie'],['Margie','Margie','The Main Character (self-appointed)'],
    ['Jack','Jack','2.1 Cookies Per Guest'],[null,'The Vikings','SKOL'],[null,'The Hens','Uncooperative'],
  ],
  thanks:["Made with love by Alex","For Joe · Christmas 2026"],
  skip:"Skip", next:"Next", close:"Close", toNote:"One more thing...",
  statsTitle:"Joe's stats",
  stats:{birkie:"Birkie time", golf:"Wylee Woods", anagrams:"Anagrams vs Lars", spotted:"Spotted on the rooftops", snacks:"Wrong snacks for Alex", hints:"Crossword hints", steps:"Steps walked", look:"Look"},
  secretsLine:(n,of)=>`Secrets found: ${n} of ${of}`,
  secretNames:{cupcake:'Cupcake',sprinkles:'Sprinkles',icecream:'Ice cream',oakleys:'Oakleys',headband:'Headband',shoes:'Carbon shoes',clover:'Lucky clover'},
  secretsTip:"Keep exploring to find the rest. Find them all for a surprise.",
  legend:"COOKIE LEGEND! Every secret found. The crown has been upgraded.",
  secretTitle:"For finding everything",
  secretNote:"(Alex: write a secret extra note here. Joe only sees it if he finds every secret.)",
  albumTitle:"The photo album", photoLocked:"(Finish this stop to unlock this photo.)",
  photos:{
    farm:"Keelan, Joe, and the world's least cooperative hens.",
    mill:"50 km with the Vikings. Main Street, Hayward.",
    city:"Lars and John, mid-heist. Nobody saw anything.",
    fargo:"Ginger ale and Mott's. Nailed it. (Eventually.)",
    golf:"Wylee Woods. Margie insisted on being in the photo.",
    kitchen:"The Cookie King and his head baker.",
  },
  noteTitle:"A note from Alex",
};
const KITCHEN = {place:'Home', speaker:'Your kitchen',
  recipeTitle:"Chocolate Chip Cookies",
  recipeFooter:"Bake at 375° for 10 minutes. Do not eat all the dough first.",
  oven:"The oven's warming up. It already smells like home in here.",
  tree:"The tree's a little crooked. It's perfect.",
  missing:"The recipe card says you still need:",
  ready:["Everything's in the basket.","And... everyone came over? Everyone came over.","Time to bake."],
  // what everyone says if you talk to them in the kitchen before baking
  crowd:{Keelan:"Those are my eggs. Treat them with respect.", Alex:"I'm on dough-tasting duty.", 'Lil Q':"Scooted all the way over from Fargo for this. Rookie better deliver.", Jack:"Cookies per guest is 2.1 right now. I need it at 3.",
         Lars:"I'll time the oven. I have a watch with splits.", John:"I'll carry the tray. Or the whole oven.", 
         Margie:"I brought the milk. I'm basically the main character.", Bryan:"Nice kitchen. Very chill in here.", Logan:"I checked your yard. No clovers. Great cookies though.", Jackie:"You figured out the snacks. Proud of you. Don't make it weird.", 'Trail John':"Flour made it all fifty kilometers.", Viking:"SKOL! When do we eat?"},
  // the baking card: one step per ingredient, in recipe order. target and tol are in cups.
  bakeTitle:"Bake the cookies",
  // Alex is your baking helper: she talks you through every step (her lines are the hint, good, and the oops lines below)
  steps:[
    {key:'butter',   name:'Butter',          kind:'pour', target:1,    label:'1 cup',   max:1.5, rate:.5,  tol:.08, color:'#f4e3a1', hint:"Butter first. One cup. Let go right on the gold line.", good:"One cup of Keelan's butter. Perfect."},
    {key:'sugar',    name:'Sugar',           kind:'pour', target:.75,  label:'¾ cup',   max:1.5, rate:.45, tol:.07, color:'#fbfbf7', hint:"Now the sugar from Fargo. Three quarters of a cup.", good:"Three quarters. Lil Q would be proud."},
    {key:'eggs',     name:'Eggs',            kind:'count',target:2,    label:'2 eggs',                                   hint:"Two eggs. Crack them in, then tell me when you're done.", good:"Two eggs, no shells. Look at you."},
    {key:'flour',    name:'Flour',           kind:'pour', target:2.25, label:'2¼ cups', max:3,   rate:.9,  tol:.12, color:'#f3eadb', hint:"Flour. Two and a quarter cups. It pours fast, careful.", good:"Two and a quarter. The Vikings' flour made it."},
    {key:'chocolate',name:'Chocolate chips', kind:'pour', target:2,    label:'2 cups',  max:3,   rate:.8,  tol:.12, color:'#5a3220', hint:"The good part. Two cups of heist chocolate.", good:"Two cups. Worth every searchlight."},
    {key:'stir',     name:'Stir it up',      kind:'stir', taps:12,                                                       hint:"Now stir! Fast!", good:"Now THAT is cookie dough. Don't eat it all."},
    // only if you found Bryan (needs: 'sprinkles')
    {key:'sprinkles',name:"Bryan's sprinkles", kind:'stir', taps:6, needs:'sprinkles', shake:true,                            hint:"Ooh, Bryan's sprinkles! Shake some on top.", good:"So festive. Bryan would say 'nice.'"},
  ],
  pourHold:"Hold to pour",
  tooMuch:"Whoa, way too much. Scoop it out and try again.", tooLittle:"Not quite enough. Dump it back and try again.", spilled:"Joe. It's everywhere. Again!",
  eggTap:"Crack an egg", eggDone:"That's enough", eggMany:"That's a lot of eggs. Keelan is crying. Start the eggs over.", eggFew:"We need one more.",
  stirTap:"Stir!",
  next:"Next",
  bakeHint:"Into the oven. Ten minutes. Pull them right at 10:00, golden, not burnt.", bakeStart:"Put them in", bakeOut:"Take them out",
  raw:"Still raw in the middle! New tray, try again.", burnt:"Burnt. Lars is already opening a window. New tray!", perfect:"Golden brown. PERFECT. Come here, you.",
  // the party, in order. [speaker, line] (or [speaker, line, portrait] to borrow someone's face)
  hug:"Alex gives Joe a big hug.",
  danceTitle:"THE COOKIE DANCE",
  party:[['Alex',"THEY'RE PERFECT. You're perfect. Okay, everybody's turn."],['Keelan',"Best eggs in the county. Best cookies in the world."],['Lil Q',"Thirty bucks of gas. Worth every penny. Lil Q approves. *mic drop*"],
    ['Lars',"Okay. These beat my PR."],['John',"Can I have six? I'm having six."],
    ['Margie',"Milk for dunking. My idea. All my ideas are great."],['Jack',"Ten out of ten. Cookie rating logged. Margin of error: zero."],['Bryan',"Nice."],['John',"SKOL!!! (the Vikings taught me that)",'Trail John'],
    ['','Everyone agrees. There is only one Cookie King.'],['','Joe gets a crown.'],['Alex',"And now... THE COOKIE DANCE. Everybody!"]],
  icecreamLine:"Cookie ice cream sandwiches. Maple rosemary. I found it on a roof. You're welcome.",   // only if Lars found the ice cream
  playAgain:"Play again", keepExploring:"Keep exploring",
  note:"Merry Christmas! Love, Alex"};
