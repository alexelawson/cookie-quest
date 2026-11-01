// Dialogue, character names and the ending note. Edit the words here.
const ITEMS = [
  {key:'farm',  label:'Eggs & butter'},
  {key:'mill',  label:'Flour'},
  {key:'city',  label:'Chocolate'},
  {key:'fargo', label:'Sugar'},
];
const STORY = {
  mill:{place:'The Old Mill', speaker:'The Miller',
    lines:["Flour? I can grind you some flour.",
           "But first you'll solve my crossword. I don't make the rules. Well. I do."],
    mission:"Mission preview: harvest the wheat, solve the crossword, then time the millstone just right.",
    done:"You got a sack of flour!", again:"Come back anytime. Bring a pencil."},
  city:{place:'The City at Night', speaker:'A voice in the rain',
    lines:["The chocolate's gone. Taken right off the shelf.",
           "This city needs someone to get it back.",
           "...Yes, it's for cookies. That doesn't make it any less serious."],
    mission:"Mission preview: cape on, sneak across the rooftops, dodge the searchlights and recover the chocolate.",
    done:"You recovered the chocolate!", again:"The city sleeps a little easier tonight."},
};
// ---------- The farm: Keelan ----------
// Each question is a button; the answer plays as one page per string.
const KEELAN = {
  place:'The Farm', name:'Keelan',
  hello:"Hey. You here about the eggs? Because we've got a situation.",
  helloAgain:"Back for another round?",
  questions:[
    {q:"What happened here?",       a:["One of the hens found a gap in the fence.","Then she found all the other gaps. Then she told her friends."]},
    {q:"How do I catch them?",      a:["Run right into one to scoop it up. You can only carry one at a time.",
                                       "Bring it back to the gate and it'll hop in.",
                                       "They'll keep sneaking out, fast at first. Get all twenty home at once and they'll settle down.",
                                       "If nine are loose at once, they scatter and we start over."]},
    {q:"How many chickens are there?", a:["Twenty. When they're all home, anyway."]},
    {q:"Can't you catch them?",     a:["I've been chasing them since sunrise. I'm running on empty.",
                                       "Man. I could really go for something sweet right now."]},
    {q:"Can I get eggs and butter?", a:["Get my girls back in the pen and they're all yours."]},
  ],
  ready:"I'm ready",
  start:["Alright. Stand back from the gate...","...and there they go."],
  cupcakeQ:"Give Keelan the cupcake",
  cupcakeA:["Wait. Is that a cupcake?","...","Okay. I've got a second wind. I'll help you round them up."],
  cupcakeLate:["For me? You already did all the work.","...I'm eating it anyway. Thanks."],
  foundCupcake:"You found a cupcake hidden behind the barn. Chocolate, with sprinkles.",
  midHello:"Keep going, you've got this!",
  midQ:"How am I doing?",
  backToIt:"Back to it",
  lose:["Whoa. Whoa. That's too many.","Let's get them settled and try again. Talk to me when you're ready."],
  win:["That's all twenty. You're a natural.","Eggs are yours. I'll throw in some butter too."],
  thanks:"Thanks, Keelan!",
  after:"All twenty, home and accounted for. Thanks again.",
  bye:"Bye",
};

// ---------- Fargo: Bob (runs the cheapest gas station in the country) and Alex, your passenger ----------
const FARGO = {
  place:'Fargo, ND', bob:'Bob',
  intro:["We're running on fumes.","Somewhere in this town is the cheapest gas in the whole country. Find it. I believe in you."],
  introSpeaker:'Alex',
  attendants:['Deb','Lars','Shelly','Ole','Marv'],
  ask:p=>`$${p} a gallon. Fill 'er up?`,
  fill:"Fill up", keep:"Keep looking",
  wrong:p=>[`Tank's full. At $${p} a gallon.`,"On your way out of town you pass a sign that says $2.79.","Oof."],
  retry:"Try again",
  bobHello:["Well, look at that. You found it. Cheapest gas in the whole country.","Two seventy-nine. Rode my bike from Sturgis to Florida and back and never saw cheaper."],
  bobBet:["Here's the deal. Stop that pump on exactly thirty bucks and I'll throw in some sugar.","My cousin grows the beets out back. Best sugar there is."],
  pumpTitle:"Bob's bet: stop on exactly $30.00",
  pumpHint:"Hold to pump. Let go to stop. Quick taps for the last few cents.",
  bust:["Ohhh, a penny over. So close.","Over again. Go ahead, I'll reset it.","Thirty and what now? Again!","Steady hands, friend. One more try."],
  pumpWin:["Thirty dollars even. Respect.","Now go on inside and grab something for your co-pilot. She's been real patient."],
  goInside:"Go inside",
  bobWaiting:"Go on in, she's waiting. Don't come back with the wrong snack, man.",
  win:["Now that's a good road-trip partner.","Here ya go. Sugar, fresh from the Red River Valley."],
  thanks:"Thanks, Bob!",
  after:"Ride safe. It's not this cheap anywhere else, you know.",
  empty:"Out of gas! You're pushing the CR-V now.",
  emptyAlex:"I'll steer.",
  leave:"Head back to the highway",

  // ---- the snack stop: Alex (the passenger) ----
  // Change her lines here. `correct` says which drink + snack she wants.
  shop:"Bob's Gas & Go",
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

const KITCHEN = {place:'Home', speaker:'Your kitchen',
  recipeTitle:"Chocolate Chip Cookies",
  recipeFooter:"Bake at 375° for 10 minutes. Do not eat all the dough first.",
  oven:"The oven's warming up. It already smells like home in here.",
  tree:"The tree's a little crooked. It's perfect.",
  missing:"The recipe card says you still need:",
  ready:["Everything's in the basket.","Time to bake."],
  finale:"Coming next: add the ingredients in the right order, pull the cookies out before they burn, then decorate them however you like.",
  note:"Merry Christmas! Love, Alex"};
