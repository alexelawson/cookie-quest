// Plays the baking finale and the wardrobe. Run: node tests/kitchen-scenarios.js
const {chromium}=require('playwright');const path=require('path');(async()=>{
const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
const URL='file://'+path.resolve(__dirname,'../index.html');
const helpers=()=>{window.T={
  btns:()=>[...$('dbtns').querySelectorAll('button')].map(b=>b.textContent),
  click:t=>[...$('dbtns').querySelectorAll('button')].find(b=>b.textContent===t).click(),
  through:()=>{const seen=[]; for(let i=0;i<40&&!dlg.hidden;i++){const bs=T.btns(); if(bs.includes('Play again'))break; seen.push($('dspeaker').textContent+': '+$('dtext').textContent); [...$('dbtns').querySelectorAll('button')][0].click()} return seen},
  run:n=>{for(let i=0;i<n;i++)update(16.7)},
  tick:ms=>{for(let t=0;t<ms;t+=16.7)SCENES.kitchen.ambient(16.7)},
  pour:secs=>{bakePress(); T.tick(secs*1000); bakeRelease()},
  onBeat:()=>{T.tick(STIR.BEAT-bake.bt%STIR.BEAT+4); bakePress()},
  offBeat:()=>{const o=bake.bt%STIR.BEAT; T.tick((STIR.BEAT/2-o+STIR.BEAT)%STIR.BEAT); bakePress()},
  scoopAt:i=>{for(let g=0;g<600&&!(Math.abs(bake.sx-SCOOP.SPOTS[i])<1.5&&!bake.drop);g++)SCENES.kitchen.ambient(16.7); bakePress(); T.tick(300)},
  scoopGap:()=>{for(let g=0;g<600&&!(Math.abs(bake.sx-(SCOOP.SPOTS[0]+7))<1&&!bake.drop);g++)SCENES.kitchen.ambient(16.7); bakePress()},
  cellXY:i=>{const c=$('bakeArt'), r=c.getBoundingClientRect(), q=chipXY(i); return {x:r.left+c.clientLeft+(q.x+.5)*c.clientWidth/c.width, y:r.top+c.clientTop+(q.y+.5)*c.clientHeight/c.height}},
}};
const fresh=async(st)=>{await p.goto(URL);await p.evaluate(s=>{localStorage.clear(); if(s)localStorage.setItem('cookie-quest-v1',JSON.stringify(s))},st);await p.reload();await p.click('#startBtn'); await p.evaluate(()=>skipWelcome());await p.evaluate(helpers)};
const R=[];const ok=(n,c,x='')=>R.push((c?'PASS ':'FAIL ')+n+(x?'  ('+x+')':''));
const ALL={farm:1,mill:1,city:1,fargo:1,golf:1};
// A. not everything yet: no crowd, recipe card says what's missing
await fresh({farm:1});
let r=await p.evaluate(()=>{goTo('kitchen','fromDoor'); T.run(40); const crowd=!!crowdNear(); P.x=64;P.y=60; update(16.7); action(); return {crowd,msg:$('dtext').textContent}});
ok('A missing ingredients: the card lists them, nobody is over yet',r.msg.includes('Flour')&&!r.crowd,r.msg);
// B. everything: the whole crew is in the kitchen
await fresh(ALL);
r=await p.evaluate(()=>{goTo('kitchen','fromDoor'); T.run(40); P.x=30;P.y=94; update(16.7); const lbl=prompt.textContent; action(); const sp=$('dspeaker').textContent; T.through(); return {lbl,sp,n:CROWD.length}});
ok('B everyone came over (and you can talk to them)',r.lbl==='Talk to Keelan'&&r.sp==='Keelan'&&r.n>=10,r.lbl);
r=await p.evaluate(()=>{P.x=64;P.y=60; update(16.7); action(); const pages=[]; while(T.btns().includes('Next')){pages.push($('dtext').textContent);T.click('Next')} T.click("Let's bake");
  return {pages,open:!$('bake').hidden,step:$('bakeStep').textContent}});
ok('B Let\'s bake goes straight to baking at step 1 (butter), no locked recipe card',r.open&&r.step.includes('Butter'),r.step);
// the BAKE arrow over the counter shows once everything's in, and goes away while baking
await p.evaluate(()=>{closeBake(); window.marks=[]; const d=drawExitMark; window.drawExitMark=m=>{marks.push(m.text||'EXIT'); d(m)}});
r=await p.evaluate(async()=>{const w=ms=>new Promise(res=>setTimeout(res,ms)); marks.length=0; await w(200); const idle=marks.includes('BAKE'); openBake(); await w(50); marks.length=0; await w(200); const baking=marks.includes('BAKE'); return {idle,baking}});
ok('B a bouncing BAKE arrow points at the counter (and hides while you bake)',r.idle&&!r.baking,JSON.stringify(r));
// C. pouring: too little, too much, spill, then right on the line
r=await p.evaluate(()=>{const s=stepNow(), out={}; T.pour(.6); out.little=$('bakeMsg').textContent; T.tick(700);
  T.pour(2.4); out.much=$('bakeMsg').textContent; T.tick(700); bakePress(); T.tick(4000); out.spill=$('bakeMsg').textContent; bakeRelease(); T.tick(800);
  T.pour(s.target/s.rate); out.good=bake.state; out.goodMsg=$('bakeMsg').textContent; return out});
ok('C butter: too little / too much / spilling all get a redo',r.little.includes('enough')&&r.much.includes('too much')&&r.spill.includes('everywhere'),r.little+' | '+r.much+' | '+r.spill);
ok('C butter: stop on the gold line and Alex approves',r.good==='good'&&r.goodMsg.includes("Keelan's butter"),r.goodMsg);
r=await p.evaluate(()=>{bakePress(); const s=stepNow(); T.pour(s.target/s.rate); const sugar=bake.state; bakePress();
  for(let k=0;k<3;k++)bakePress(); const many=$('bakeMsg').textContent; T.tick(600); bakePress(); eggsDone(); const few=$('bakeMsg').textContent; bakePress(); eggsDone(); const eggs=bake.state; bakePress();
  return {sugar,many,few,eggs,step:$('bakeStep').textContent}});
ok('C sugar on the line; eggs: 3 is too many, 1 is too few, 2 is right',r.sugar==='good'&&r.many.includes('lot of eggs')&&r.few.includes('one more')&&r.eggs==='good'&&r.step.includes('Flour'),r.many+' | '+r.few);
r=await p.evaluate(()=>{let s=stepNow(); T.pour(s.target/s.rate); const flour=bake.state; const noStir=!bakeSteps().some(s=>s.kind==='rhythm'); return {flour,noStir}});
ok('C flour, and there is no stirring step any more',r.flour==='good'&&r.noStir,JSON.stringify(r));
r=await p.evaluate(()=>{bakePress(); const step=$('bakeStep').textContent; T.scoopGap(); const miss=$('bakeMsg').textContent, none=bake.tray.filter(Boolean).length; T.tick(400);
  T.scoopAt(0); const one=bake.tray.filter(Boolean).length; T.scoopAt(0); const taken=$('bakeMsg').textContent; T.tick(400);
  for(let i=1;i<6;i++)T.scoopAt(i); return {step,miss,none,one,taken,state:bake.state}});
ok('C scoop: dropping between spots misses, a full spot is taken, six on the spots is done',r.step.includes('Scoop')&&r.miss.includes('Missed')&&r.none===0&&r.one===1&&r.taken.includes('already')&&r.state==='good',JSON.stringify(r));
r=await p.evaluate(()=>{bakePress(); const shape=bake.shape, want=[...shapeCells(shape)], msg=$('bakeMsg').textContent, card=KITCHEN.shapes[shape];
  let wrong=[...Array(25).keys()].filter(i=>!want.includes(i)).slice(0,want.length); wrong=[...wrong,...want.slice(0,want.length-wrong.length)]; wrong.forEach(chipToggle);   /* (a big shape like the star leaves fewer empty cells than it has chips) */ const bad=$('bakeMsg').textContent;
  bakeAltPress(); const cleared=bake.chips.size; return {shape,want,msg,card,bad,cleared,cells:want.map(T.cellXY)}});
ok('C chips: the card names the shape; a wrong pattern gets a nudge; Start over clears it',r.msg.includes(r.card)&&r.bad.includes("doesn't match")&&r.cleared===0,r.shape+' | '+r.bad);
for(const c of r.cells.slice(0,-1)) await p.mouse.click(c.x,c.y);
await p.mouse.click(r.cells[0].x,r.cells[0].y); await p.mouse.click(r.cells[0].x,r.cells[0].y);   // pick one up and put it back
await p.mouse.click(r.cells.at(-1).x,r.cells.at(-1).y);
r=await p.evaluate(()=>({state:bake.state,msg:$('bakeMsg').textContent,n:bake.chips.size}));
ok('C chips: tapping the cookie places chips; matching the card finishes the step',r.state==='good'&&r.msg.includes('searchlight'),JSON.stringify(r));
r=await p.evaluate(()=>{const seen=new Set(); for(let k=0;k<12;k++){openBake(); seen.add(bake.shape)} closeBake(); openBake(); bake.i=bakeSteps().findIndex(s=>s.key==='chocolate'); bakeSetup(); return {seen:[...seen]}});
ok('C every tray gets a different chip pattern than the last one',r.seen.length>=3,r.seen.join(','));
r=await p.evaluate(()=>{const s0=bake.shape; let prev=s0, rep=0; for(let k=0;k<30;k++){openBake(); if(bake.shape===prev)rep++; prev=bake.shape} bake.i=bakeSteps().findIndex(s=>s.key==='chocolate'); bakeSetup(); for(const c of shapeCells(bake.shape))chipToggle(c); bakePress(); return {rep,oven:bake.state,step:$('bakeStep').textContent}});
ok('C ...never the same twice in a row; then the oven',r.rep===0&&r.oven==='oven'&&r.step==='00:00',JSON.stringify(r));
// D. baking: too early, too late, then 10:00
r=await p.evaluate(()=>{const at=m=>{bakePress(); T.tick(m/BAKE.RATE*1000); bakePress(); return $('bakeMsg').textContent};
  const raw=at(6); T.tick(700); const burnt=at(12.5); T.tick(700); const auto=(()=>{bakePress(); T.tick(16/BAKE.RATE*1000); return $('bakeMsg').textContent})(); T.tick(700);
  const good=at(10.1); return {raw,burnt,auto,good,state:bake.state}});
ok('D pull early: raw; late: burnt; forget them: burnt',r.raw.includes('raw')&&r.burnt.includes('Burnt')&&r.auto.includes('Burnt'),r.raw+' | '+r.burnt);
ok('D 10:00 on the dot: golden brown',r.state==='done'&&r.good.includes('PERFECT'),r.good);
// E. party: everyone talks, Joe gets the crown, the note
r=await p.evaluate(()=>{bakePress(); const closed0=$('bake').hidden, partyEarly=kit.party; T.tick(TASTE.WALK+60); const E=kit.tasters.Ethan, at=Math.hypot(E.x-TASTE.SPOT.Ethan.x,E.y-TASTE.SPOT.Ethan.y);
  const before=T.through(); T.tick(TASTE.NERVOUS/2); draw(); const nervous=kit.taste&&kit.taste.phase, hugEarly=kit.hugging;
  const cap=$('caption'), cr=cap.getBoundingClientRect(), gr=$('game').getBoundingClientRect(), capOk=!cap.hidden&&$('captionText').textContent===KITCHEN.tasteHush&&cr.top>=gr.top-2&&cr.bottom<gr.top+gr.height*.45&&cr.left>=gr.left&&cr.right<=gr.right&&exitsHere().length===0; T.tick(TASTE.NERVOUS/2+60); const after=T.through();
  return {closed0,partyEarly,at,before,nervous,hugEarly,after,capOk,party:kit.party,hugging:kit.hugging}});
ok('E first, Ethan and Maureen step up to taste one (Ethan: designated grill master)',r.closed0&&!r.partyEarly&&r.at<2&&r.before.some(l=>l.startsWith('Ethan:')&&l.includes('grill master'))&&r.before.some(l=>l.startsWith('Maureen:')),r.before[0]);
ok('E the caption while they chew is a pop-up up top, fully on screen, no EXIT arrow under it',r.capOk);
ok('E everyone holds their breath while they chew... then they love them',r.nervous==='nervous'&&!r.hugEarly&&r.after.some(l=>l.startsWith('Maureen:'))&&r.after.some(l=>l.startsWith('Ethan:'))&&r.party&&r.hugging,r.after.join(' / ').slice(0,120));
r=await p.evaluate(()=>{const party=kit.party, closed=$('bake').hidden; const A=CROWD.find(c=>c.name==='Alex'); const start={x:A.x,y:A.y}; T.tick(PARTY.WALK+400); const near=Math.hypot(kit.alex.x-P.x,kit.alex.y-P.y), hugging=kit.hugging, noDlg=dlg.hidden; T.tick(PARTY.HUG+200);
  const lines=T.through(); T.tick(1700); const dance=kit.dance; return new Promise(res=>setTimeout(()=>res({party,closed,start,near,hugging,noDlg,lines,dance,crown:!!have.crown,baked:!!have.baked,ending:!$('ending').hidden,credits:!$('credits').hidden}),PARTY.BEAT*16+300))});
ok('E Alex walks over and hugs Joe first',r.hugging&&r.noDlg&&r.near<10&&Math.hypot(r.start.x-112,r.start.y-134)>30,'gap '+r.near.toFixed(1));
ok('E party: everyone has a line, and they bounce',r.party&&r.closed&&['Alex','Keelan','Lil Q','Lars','John','Margie','Jack'].every(n=>r.lines.some(l=>l.startsWith(n+':'))),r.lines.length+' lines');
ok('E Joe gets a crown, everyone does THE COOKIE DANCE, then the credits roll',r.dance&&r.crown&&r.baked&&r.ending&&r.credits);
r=await p.evaluate(()=>{const names=[...document.querySelectorAll('.crow b')].map(b=>b.textContent); $('endSkip').click(); const stats=$('ecard').textContent; $('endNext').click(); const album=$('ecard').querySelector('small').textContent, cv=!!$('ecard').querySelector('.polaroid canvas');
  for(let i=0;i<5;i++)$('ecard').querySelectorAll('.pnav button')[1].click(); const last=$('ecard').querySelector('.polaroid p').textContent; $('endNext').click(); const note=$('ecard').textContent, again=[...$('ecard').querySelectorAll('button')].some(b=>b.textContent==='Play again'), keep=$('endNext').textContent;
  return {names,stats,album,cv,last,note,again,keep,cap:ENDING.photos.kitchen}});
ok('E credits list the whole cast (no Jackie if Joe never met her)',r.names.includes('Joe')&&r.names.includes('Logan')&&r.names.includes('Lil Q')&&!r.names.includes('Jackie'),r.names.length+' names');
ok('E then Joe\'s stats, with secrets found',r.stats.includes('Birkie time')&&r.stats.includes('Secrets found'),r.stats.slice(0,80));
ok('E then the photo album (six photos), then Alex\'s note with Play again',r.album.includes('album')&&r.cv&&r.last===r.cap&&r.note.includes('Merry Christmas')&&r.again&&r.keep==='Keep exploring',r.last);
r=await p.evaluate(()=>{$('endNext').click(); goTo('world','fromKitchen'); T.run(30); return {crown:!!have.crown,scene:scene===SCENES.world}});
ok('E the crown stays on outside',r.crown&&r.scene);
r=await p.evaluate(()=>{const moves=new Set(); for(let k=0;k<16;k++){kit.danceAt=time-k*PARTY.BEAT-1; const m=danceMove(0); moves.add(m.dx+','+(m.dy<-1?'up':'0')+','+m.cookie)} return [...moves]});
ok('E the Cookie Dance: step left, step right, hops, cookies up',r.length>=4,r.join(' | '));
// F. the wardrobe before the city
await fresh({});
r=await p.evaluate(()=>{goTo('vancouver','fromBridge'); T.run(40); P.x=181;P.y=279;update(16.7); action(); const open=!$('wardrobe').hidden, n=$('outfits').children.length;
  [...$('outfits').children].find(b=>b.dataset.id==='sweater').click(); const line=$('wardLine').textContent; $('wardGo').click(); T.run(40);
  return {open,n,line,outfit:have.outfit,city:scene===SCENES.city}});
ok('F the elevator opens the wardrobe first; pick an outfit; then the city',r.open&&r.n===8&&r.line.includes('Festive')&&r.outfit==='sweater'&&r.city,r.line);
r=await p.evaluate(()=>{const seen=[]; for(let k=0;k<10&&$('howto').hidden&&dlg.hidden;k++)T.run(1); if(!$('howto').hidden){$('howOk').click(); T.run(3)} for(let i=0;i<20&&!dlg.hidden;i++){seen.push($('dspeaker').textContent+': '+$('dtext').textContent); [...$('dbtns').querySelectorAll('button')][0].click(); if(!$('howto').hidden)$('howOk').click(); T.run(2)} T.run(5); for(let i=0;i<5&&!dlg.hidden;i++){seen.push($('dspeaker').textContent+': '+$('dtext').textContent);[...$('dbtns').querySelectorAll('button')][0].click(); T.run(2)} return seen});
ok('F the crew reacts to the outfit',r.some(l=>l.includes('from space')),r.slice(-2).join(' | '));
// G. the welcome from Alex, and Joe's look
await p.goto(URL); await p.evaluate(()=>localStorage.clear()); await p.reload(); await p.click('#startBtn'); await p.evaluate(helpers);
r=await p.evaluate(()=>{const sp=$('dspeaker').textContent, pages=[]; while(T.btns().includes('Next')){pages.push($('dtext').textContent);T.click('Next')} pages.push($('dtext').textContent); T.click("Let's go!");
  const open=!$('wardrobe').hidden, n=$('outfits').children.length, first=$('outfits').children[0].dataset.id, ids=[...$('outfits').children].map(b=>b.dataset.id), title=$('wardTitle').textContent;
  [...$('outfits').children].find(b=>b.dataset.id==='disco').click(); $('wardGo').click(); return {sp,pages,open,n,first,ids,title,look:have.look,welcomed:have.welcomed}});
ok('G Alex welcomes Joe and explains the game',r.sp==='Alex'&&r.pages.join(' ').includes('Merry Christmas')&&r.pages.join(' ').includes('kitchen'),r.pages.length+' pages');
ok('G then Joe picks his look (jeans & a tee first; no jersey, GRP shorts or Vikings; Dave and John are there), and it sticks',r.open&&r.n===8&&r.first==='tee'&&!r.ids.some(i=>['jersey','grp','vikings','cape'].includes(i))&&r.ids.includes('dave')&&r.ids.includes('john')&&r.look==='disco'&&r.welcomed,r.title);
await p.reload(); await p.click('#startBtn'); r=await p.evaluate(()=>({dlg:!dlg.hidden,ward:!$('wardrobe').hidden})); ok('G no welcome the second time',!r.dlg&&!r.ward);
// I. Brian by the pond gives sprinkles; they show up in the basket and add a step to the baking
await fresh({farm:1,mill:1,city:1,fargo:1,golf:1});
r=await p.evaluate(()=>{P.x=96;P.y=48; update(16.7); const lbl=prompt.textContent; action(); const pages=[]; while(T.btns().includes('Next')){pages.push($('dtext').textContent);T.click('Next')} pages.push($('dtext').textContent); T.click('Take the sprinkles');
  const reward=!$('reward').hidden&&$('rewardName').textContent; collectReward(); return {lbl,pages,reward}});
await p.waitForTimeout(900);
r.after=await p.evaluate(()=>({basket:$('basket').textContent, have:!!have.sprinkles}));
ok('I Brian is chill and gives Joe sprinkles',r.lbl==='Talk to Brian'&&r.pages.join(' ').includes('sprinkles')&&r.reward==='Sprinkles'&&r.after.have&&r.after.basket.includes('Sprinkles'),r.pages.slice(-1)[0]);
r=await p.evaluate(()=>{goTo('kitchen','fromDoor'); T.run(40); openBake(); const n=bakeSteps().length; bake.i=n-1; bakeSetup(); const step=$('bakeStep').textContent, btn=$('bakeBtn').textContent; for(let k=0;k<6;k++)bakePress(); return {n,step,btn,state:bake.state,crowd:CROWD.some(c=>c.name==='Brian')}});
ok('I with sprinkles there is a shake-the-sprinkles step, and Brian comes to the party',r.n===7&&r.step.includes("Brian's sprinkles")&&r.btn==='Shake!'&&r.state==='good'&&r.crowd,r.step);
// J. the cupcake unlocks a cupcake costume; Settings > Change outfit works anywhere
await fresh({welcomed:true});
r=await p.evaluate(()=>{const before=WARDROBE.outfits.filter(o=>!o.unlock||have[o.unlock]).map(o=>o.id);
  P.x=CUPCAKE.x; P.y=CUPCAKE.y+4; update(16.7); const pages=[]; while(T.btns().includes('Next')){pages.push($('dtext').textContent);T.click('Next')} pages.push($('dtext').textContent); const ask=T.btns().join(); T.click('Not now'); const lookAfterNo=have.look||null;
  $('settingsBtn').click(); $('setOutfit').click(); const ids=[...$('outfits').children].map(b=>b.dataset.id); const title=$('wardTitle').textContent;
  [...$('outfits').children].find(b=>b.dataset.id==='cupcake').click(); $('wardGo').click(); update(16.7);
  return {before,pages,ask,lookAfterNo,ids,title,look:have.look,paused,avant:ids.includes('avant')}});
ok('J Avant Guard is there; Cupcake is locked until you find the cupcake',r.avant&&!r.before.includes('cupcake')&&r.pages.join(' ').includes('unlocked'),r.pages.slice(-1)[0]);
ok('J a new costume asks: Wear it now / Not now (Not now leaves Joe as he was)',r.ask==='Wear it now,Not now'&&r.lookAfterNo!=='cupcake',r.ask);
ok('J Settings > Change outfit: pick the Cupcake costume any time',r.ids.includes('cupcake')&&r.look==='cupcake'&&!r.paused&&r.title.includes('look'),r.ids.join(','));

// L. background music: each place has its own song; the Cookie Dance has Jingle Bells; Settings can turn music off
r=await p.evaluate(async()=>{const out={}; for(const [s,e] of [['world','start'],['golf','fromRoad'],['birkie','start'],['fargo','fromHighway'],['city','start'],['kitchen','fromDoor']]){goTo(s,e); for(let i=0;i<60;i++)update(16.7); out[s]=song}
  kit.dance=true; sceneMusic(); out.dance=song; kit.dance=false; sceneMusic();
  $('settingsBtn').click(); const box=!!$('musicToggle'); $('musicToggle').checked=false; $('musicToggle').onchange(); const off=song; $('musicToggle').checked=true; $('musicToggle').onchange(); const on=song; $('settingsClose').click();
  goTo('world','start'); for(let i=0;i<60;i++)update(16.7); farmStart(); out.chase=song; farmReset(); out.afterChase=song;
  openEnding(); out.ending=song; closeEnding();
  const bad=Object.entries(SONGS).filter(([k,S])=>{const n=t=>t.trim().split(/\s+/).reduce((a,x)=>a+(+x.split(':')[1]),0); return Math.abs(n(S.lead)-n(S.bass))>1e-6}).map(([k])=>k); out.uneven=bad.join();
  return {...out,box,off,on}});
ok('L each place plays its own song (the map, the hen chase, the ending too; every song\'s melody and bass line up)',r.world==='world'&&r.chase==='chase'&&r.afterChase==='world'&&r.ending==='ending'&&!r.uneven&&r.golf==='golf'&&r.birkie==='birkie'&&r.fargo==='fargo'&&r.city==='heist'&&r.kitchen==='kitchen',JSON.stringify(r));
ok('L the Cookie Dance switches to Jingle Bells; Settings > Music turns it off and on',r.dance==='jingle'&&r.box&&r.off===null&&r.on==='kitchen');
// M. exits: walk into them and you leave, no button; arriving next to one doesn't bounce you straight back out
await fresh(ALL);
r=await p.evaluate(()=>{const out={}; goTo('kitchen','fromDoor'); T.run(40); out.stay=scene===SCENES.kitchen; P.x=112;P.y=162; T.run(40); out.kitchen=scene===SCENES.world;
  goTo('fargo','fromHighway'); T.run(40); try{closeDialog()}catch(e){} paused=false; P.x=3;P.y=180; T.run(40); out.fargo=scene===SCENES.world;
  have.heistBriefed=true; have.heistHowTo=true; goTo('city','fromStreet'); T.run(90); try{closeDialog()}catch(e){} paused=false; T.run(2); P.x=20;P.y=172; T.run(40); out.city=scene===SCENES.vancouver; P.x=144;P.y=5; T.run(40); out.bridge=scene===SCENES.world; P.x=78;P.y=240; update(16.7); action(); T.run(40); out.over=scene===SCENES.vancouver; return out});
ok('M exits: kitchen door and Fargo highway take you out; the rooftop ladder puts you on the street in Vancouver; the bridge goes both ways',r.stay&&r.kitchen&&r.fargo&&r.city&&r.bridge&&r.over,JSON.stringify(r));
// N. gear: find it on the map, Joe wears it, Settings can take it off
await fresh({});
r=await p.evaluate(()=>{const got=[]; for(const k in GEAR){if(GEAR[k].give)continue; P.x=GEAR[k].x;P.y=GEAR[k].y; T.run(1); got.push(k+':'+(have.gear&&have.gear[k])+':'+(!$('itemCard').hidden&&$('itemName').textContent)+':'+$('itemCanvas').getContext('2d').getImageData(0,0,40,30).data.some((v,i)=>i%4===3&&v>0)); $('itemBtn').click()}
  $('settingsBtn').click(); const rows=[...$('gearRows').querySelectorAll('input')]; rows[0].checked=false; rows[0].onchange(); const off=have.gear.headband; $('settingsClose').click(); return {got,rows:rows.length,off}});
ok('N the headband and carbon shoes can be found; each shows a card with its picture; Joe wears them',r.got.every(g=>{const [k,on,name,pic]=g.split(':'); return on==='1'&&name&&name!=='false'&&pic==='true'}),r.got.join(' | '));
ok('N Settings lists the gear and can take it off',r.rows===2&&r.off===0);
// O. the signpost, the Fargo signs, and the ice cream served with the cookies
// O. Logan: talk, help him look, and he gives Joe a lucky clover
r=await p.evaluate(()=>{P.x=LOGAN.x+6;P.y=LOGAN.y+2; T.run(1); const lbl=prompt.textContent; action(); const pages=[]; while(T.btns().includes('Next')){pages.push($('dtext').textContent);T.click('Next')} T.click('Play his game'); const huntOpen=!$('cloverHunt').hidden, n=$('cloverField').querySelectorAll('.halbum').length, song=$('huntSong').textContent; $('cloverField').querySelectorAll('.halbum')[1-hunt.song[1]].click(); const miss=$('cloverMsg').textContent, still=!$('cloverHunt').hidden&&!(have.gear&&have.gear.clover)&&hunt.n===0; hunt.lock=false; huntDeal(); (()=>{for(let k=0;k<8&&hunt.open;k++){$('cloverField').querySelectorAll('.halbum')[hunt.song[1]].click(); hunt.lock=false; if(hunt.open)huntDeal()}})(); const found=$('dspeaker').textContent+': '+$('dtext').textContent; while(T.btns().includes('Next'))T.click('Next'); T.click('OK'); const card=$('itemName').textContent+' / '+$('itemBtn').textContent; $('itemBtn').click(); return {lbl,pages,found,hunt:huntOpen,n,song,miss,still,card,clover:have.gear&&have.gear.clover}});
ok('O Logan is looking for four-leaf clovers and gives Joe one',r.lbl==='Talk to Logan'&&r.pages.join().includes('break from my workout')&&r.found.startsWith('Logan')&&r.clover===1&&r.card==='Lucky clover / Pin it on',r.found+' / '+r.card);
ok('O his game: a song title comes on, pick its album (2 choices); a wrong pick resets the streak; 8 in a row finds the four-leaf',r.hunt&&r.n===2&&r.song.length>2&&r.still&&r.miss.length>5,r.song+' / '+r.miss);
// P. Alex's hint when Joe stands still, gone once he moves
r=await p.evaluate(()=>{goTo('world','start'); T.run(40); closeDialog(); paused=false; P.x=60;P.y=150; T.run(Math.ceil(HINTS.AFTER_MS/16.7)+5); const shown=!$('hint').hidden, text=$('hintText').textContent; dirs.right=true; T.run(3); dirs.right=false; return {shown,text,gone:$('hint').hidden}});
ok('P standing still: Alex says where to go next; moving hides it',r.shown&&r.text.includes('Keelan')&&r.gone,r.text);
// Q. the photo album in Settings shows locked photos as ?
r=await p.evaluate(()=>{$('settingsBtn').click(); $('setAlbum').click(); const locked=!!$('ecard').querySelector('.plocked'), btn=$('endNext').textContent; $('endNext').click(); return {locked,btn,closed:$('ending').hidden,paused}});
ok('Q Settings > Photo album: locked photos until you finish that stop',r.locked&&r.btn==='Close'&&r.closed&&!r.paused);
// (R. Jackie lives in tests/fargo-scenarios.js now: she's in Lil Q's shop)
// P. Grp the rooster: only after the farm (Keelan's keepsake), then he follows Joe everywhere, dressed for each place
await fresh({});
r=await p.evaluate(()=>{const before=!!henEnt(); have.gear={hen:1}; const keep=scene; const out={};
  for(const n of ['world','city','birkie','golf','fargo','kitchen']){scene=SCENES[n]; fargo.onFoot=true; const e=henEnt(); out[n]=!!e; if(e)e.draw()}
  scene=SCENES.fargo; fargo.onFoot=false; out.driving=!!henEnt(); scene=keep;
  const px=(n)=>{scene=SCENES[n]; ctx.setTransform(1,0,0,1,0,0); ctx.fillStyle='#000'; ctx.fillRect(0,0,30,30); drawGrp(15,28,1,n); const d=ctx.getImageData(0,0,30,30).data; let h=0; for(let i=0;i<d.length;i+=4)h=(h*31+d[i]+d[i+1]*7+d[i+2]*13)%1e9; return h};
  const looks=new Set(['world','city','birkie','golf','fargo','kitchen'].map(px)).size; scene=keep;
  return {before,out,looks}});
ok('P no Grp before the farm',!r.before);
ok('P after the farm he follows Joe in every world, and rides along in the car in Fargo',Object.values(r.out).every(v=>v),JSON.stringify(r.out));
ok('P a different outfit in each world',r.looks===6,r.looks+' looks');
// P. the main road: only the two football Vikings jog by (no Lil Q, no Norse Viking), and you can talk to them as they pass
r=await p.evaluate(()=>{goTo('world','start'); T.run(40); if(!dlg.hidden)closeDialog(); const kinds=new Set(); const orig=drawVikingStanding; let bob=0; const ob=drawBob;
  window.drawBob=(...a)=>{bob++; return ob(...a)}; drawVikingStanding=(x,y,k,n)=>{kinds.add(k); return orig(x,y,k,n)};
  time=Math.floor(time/JOG.EVERY)*JOG.EVERY+JOG.EVERY*.3; for(let k=0;k<30;k++)draw(); const x=joggerX(0); P.x=x; P.y=JOG.Y; const t=joggerTrigger(); let said='', who='';
  if(t){t.act(); said=$('dtext').textContent; who=$('dspeaker').textContent; closeDialog()} const t2=joggerTrigger(); if(t2){t2.act(); said+=' / '+$('dtext').textContent; closeDialog()}
  drawVikingStanding=orig; window.drawBob=ob; return {kinds:[...kinds].join(),bob,label:t&&t.label,said,who}});
ok('P only the football Vikings jog the main road',r.kinds==='football'&&r.bob===0,JSON.stringify(r));
ok('P talk to them as they run by: a different line each time',r.label==='Talk to the Vikings'&&r.who==='A football Viking'&&r.said.split(' / ').length===2&&r.said.split(' / ')[0]!==r.said.split(' / ')[1],r.said);
console.log(R.join('\n')); console.log('page errors:',errs.length?errs:'none'); await b.close()})();
