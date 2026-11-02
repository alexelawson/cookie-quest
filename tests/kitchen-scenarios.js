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
r=await p.evaluate(()=>{P.x=64;P.y=60; update(16.7); action(); const pages=[]; while(T.btns().includes('Next')){pages.push($('dtext').textContent);T.click('Next')} T.click("Let's bake"); const pwOpen=!$('xword').hidden, bakeFirst=!$('bake').hidden;
  $('pwInput').value='  '+PASSWORD.word[0].toUpperCase()+PASSWORD.word.slice(1)+' '; pwCheck(); const right=$('pwMsg').textContent, btn=$('pwGo').textContent; $('pwGo').click();
  return {pages,pwOpen,bakeFirst,right,btn,ok:have.passwordOk,open:!$('bake').hidden,step:$('bakeStep').textContent}});
ok('B Let\'s bake opens the locked recipe card first (the secret word)',r.pwOpen&&!r.bakeFirst,r.right);
ok('B the right word (any capitals, extra spaces) unlocks it and goes straight on to baking at step 1 (butter)',r.ok&&r.btn==="Let's bake"&&r.open&&r.step.includes('Butter'),r.step);
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
r=await p.evaluate(()=>{let s=stepNow(); T.pour(s.target/s.rate); const flour=bake.state; bakePress(); s=stepNow(); T.pour(s.target/s.rate); const choc=bake.state; bakePress();
  for(let k=0;k<12;k++)bakePress(); const stir=bake.state; bakePress(); return {flour,choc,stir,oven:bake.state,step:$('bakeStep').textContent}});
ok('C flour, chocolate, then stir 12 times; then the oven',r.flour==='good'&&r.choc==='good'&&r.stir==='good'&&r.oven==='oven'&&r.step==='00:00',JSON.stringify(r));
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
r=await p.evaluate(()=>{P.x=134;P.y=244;update(16.7); action(); const open=!$('wardrobe').hidden, n=$('outfits').children.length;
  [...$('outfits').children].find(b=>b.dataset.id==='sweater').click(); const line=$('wardLine').textContent; $('wardGo').click(); T.run(40);
  return {open,n,line,outfit:have.outfit,city:scene===SCENES.city}});
ok('F the elevator opens the wardrobe first; pick an outfit; then the city',r.open&&r.n===7&&r.line.includes('Festive')&&r.outfit==='sweater'&&r.city,r.line);
r=await p.evaluate(()=>{const seen=[]; for(let i=0;i<20&&!dlg.hidden;i++){seen.push($('dspeaker').textContent+': '+$('dtext').textContent); [...$('dbtns').querySelectorAll('button')][0].click(); if(!$('howto').hidden)$('howOk').click(); T.run(2)} T.run(5); for(let i=0;i<5&&!dlg.hidden;i++){seen.push($('dspeaker').textContent+': '+$('dtext').textContent);[...$('dbtns').querySelectorAll('button')][0].click(); T.run(2)} return seen});
ok('F the crew reacts to the outfit',r.some(l=>l.includes('from space')),r.slice(-2).join(' | '));
// G. the welcome from Alex, and Joe's look
await p.goto(URL); await p.evaluate(()=>localStorage.clear()); await p.reload(); await p.click('#startBtn'); await p.evaluate(helpers);
r=await p.evaluate(()=>{const sp=$('dspeaker').textContent, pages=[]; while(T.btns().includes('Next')){pages.push($('dtext').textContent);T.click('Next')} pages.push($('dtext').textContent); T.click("Let's go!");
  const open=!$('wardrobe').hidden, n=$('outfits').children.length, first=$('outfits').children[0].dataset.id, title=$('wardTitle').textContent;
  [...$('outfits').children].find(b=>b.dataset.id==='vikings').click(); $('wardGo').click(); return {sp,pages,open,n,first,title,look:have.look,welcomed:have.welcomed}});
ok('G Alex welcomes Joe and explains the game',r.sp==='Alex'&&r.pages.join(' ').includes('Merry Christmas')&&r.pages.join(' ').includes('kitchen'),r.pages.length+' pages');
ok('G then Joe picks his look (jersey first), and it sticks',r.open&&r.n===8&&r.first==='jersey'&&r.look==='vikings'&&r.welcomed,r.title);
await p.reload(); await p.click('#startBtn'); r=await p.evaluate(()=>({dlg:!dlg.hidden,ward:!$('wardrobe').hidden})); ok('G no welcome the second time',!r.dlg&&!r.ward);
// I. Bryan by the pond gives sprinkles; they show up in the basket and add a step to the baking
await fresh({farm:1,mill:1,city:1,fargo:1,golf:1});
r=await p.evaluate(()=>{P.x=96;P.y=48; update(16.7); const lbl=prompt.textContent; action(); const pages=[]; while(T.btns().includes('Next')){pages.push($('dtext').textContent);T.click('Next')} pages.push($('dtext').textContent); T.click('Take the sprinkles');
  const reward=!$('reward').hidden&&$('rewardName').textContent; collectReward(); return {lbl,pages,reward}});
await p.waitForTimeout(900);
r.after=await p.evaluate(()=>({basket:$('basket').textContent, have:!!have.sprinkles}));
ok('I Bryan is chill and gives Joe sprinkles',r.lbl==='Talk to Bryan'&&r.pages.join(' ').includes('sprinkles')&&r.reward==='Sprinkles'&&r.after.have&&r.after.basket.includes('Sprinkles'),r.pages.slice(-1)[0]);
r=await p.evaluate(()=>{goTo('kitchen','fromDoor'); T.run(40); openBake(); const n=bakeSteps().length; bake.i=n-1; bakeSetup(); const step=$('bakeStep').textContent, btn=$('bakeBtn').textContent; for(let k=0;k<6;k++)bakePress(); return {n,step,btn,state:bake.state,crowd:CROWD.some(c=>c.name==='Bryan')}});
ok('I with sprinkles there is a shake-the-sprinkles step, and Bryan comes to the party',r.n===7&&r.step.includes("Bryan's sprinkles")&&r.btn==='Shake!'&&r.state==='good'&&r.crowd,r.step);
// J. the cupcake unlocks a cupcake costume; Settings > Change outfit works anywhere
await fresh({welcomed:true});
r=await p.evaluate(()=>{const before=WARDROBE.outfits.filter(o=>!o.unlock||have[o.unlock]).map(o=>o.id);
  P.x=CUPCAKE.x; P.y=CUPCAKE.y+4; update(16.7); const pages=[]; while(T.btns().includes('Next')){pages.push($('dtext').textContent);T.click('Next')} pages.push($('dtext').textContent); T.click('Close');
  $('settingsBtn').click(); $('setOutfit').click(); const ids=[...$('outfits').children].map(b=>b.dataset.id); const title=$('wardTitle').textContent;
  [...$('outfits').children].find(b=>b.dataset.id==='cupcake').click(); $('wardGo').click(); update(16.7);
  return {before,pages,ids,title,look:have.look,paused,avant:ids.includes('avant')}});
ok('J Avant Guard is there; Cupcake is locked until you find the cupcake',r.avant&&!r.before.includes('cupcake')&&r.pages.join(' ').includes('unlocked'),r.pages.slice(-1)[0]);
ok('J Settings > Change outfit: pick the Cupcake costume any time',r.ids.includes('cupcake')&&r.look==='cupcake'&&!r.paused&&r.title.includes('look'),r.ids.join(','));
// K. the secret word: a wrong word says try again, Later closes it, typing WASD/Space goes in the box (not to the game)
await fresh(ALL);
await p.evaluate(()=>{goTo('kitchen','fromDoor'); T.run(90)}); await p.waitForTimeout(300); await p.evaluate(()=>openPassword(openBake)); await p.waitForTimeout(100);
r=await p.evaluate(()=>({open:!$('xword').hidden,focus:document.activeElement===$('pwInput'),title:$('pwTitle').textContent}));
ok('K the locked recipe card opens with the box ready to type in',r.open&&r.focus,r.title);
await p.keyboard.type('was d'); await p.keyboard.press('Enter');
r=await p.evaluate(()=>({typed:$('pwInput').value,msg:$('pwMsg').textContent,ok:!!have.passwordOk,tries:have.pwTries,moved:dirs.up||dirs.left||dirs.down||dirs.right,bake:!$('bake').hidden}));
ok('K typing goes in the box (W, A, S, D and Space too); a wrong word says try again',r.typed==='was d'&&r.msg.includes('not it')&&!r.ok&&r.tries===1&&!r.moved&&!r.bake,r.typed+' / '+r.msg);
r=await p.evaluate(()=>{$('pwLater').click(); return {closed:$('xword').hidden,paused}});
ok('K Later closes it and you can walk again',r.closed&&!r.paused);
r=await p.evaluate(()=>{openPassword(openBake); return 1}); await p.keyboard.type(await p.evaluate(()=>PASSWORD.word)); await p.keyboard.press('Enter'); await p.keyboard.press('Enter');
r=await p.evaluate(()=>({ok:!!have.passwordOk,bake:!$('bake').hidden,closed:$('xword').hidden}));
ok('K the right word, then Enter again: on to baking',r.ok&&r.bake&&r.closed,JSON.stringify(r));
await p.evaluate(()=>closeBake());
// L. background music: each place has its own song; the Cookie Dance has Jingle Bells; Settings can turn music off
r=await p.evaluate(async()=>{const out={}; for(const [s,e] of [['world','start'],['golf','fromRoad'],['birkie','start'],['fargo','fromHighway'],['city','start'],['kitchen','fromDoor']]){goTo(s,e); for(let i=0;i<60;i++)update(16.7); out[s]=song}
  kit.dance=true; sceneMusic(); out.dance=song; kit.dance=false; sceneMusic();
  $('settingsBtn').click(); const box=!!$('musicToggle'); $('musicToggle').checked=false; $('musicToggle').onchange(); const off=song; $('musicToggle').checked=true; $('musicToggle').onchange(); const on=song; $('settingsClose').click();
  return {...out,box,off,on}});
ok('L each place plays its own song',r.world==='farm'&&r.golf==='golf'&&r.birkie==='birkie'&&r.fargo==='fargo'&&r.city==='heist'&&r.kitchen==='kitchen',JSON.stringify(r));
ok('L the Cookie Dance switches to Jingle Bells; Settings > Music turns it off and on',r.dance==='jingle'&&r.box&&r.off===null&&r.on==='kitchen');
// M. exits: walk into them and you leave, no button; arriving next to one doesn't bounce you straight back out
await fresh(ALL);
r=await p.evaluate(()=>{const out={}; goTo('kitchen','fromDoor'); T.run(40); out.stay=scene===SCENES.kitchen; P.x=112;P.y=162; T.run(40); out.kitchen=scene===SCENES.world;
  goTo('fargo','fromHighway'); T.run(40); try{closeDialog()}catch(e){} paused=false; P.x=3;P.y=180; T.run(40); out.fargo=scene===SCENES.world;
  have.heistBriefed=true; have.heistHowTo=true; goTo('city','fromStreet'); T.run(90); try{closeDialog()}catch(e){} paused=false; T.run(2); P.x=20;P.y=172; T.run(40); out.city=scene===SCENES.world; return out});
ok('M exits: kitchen door, Fargo highway and the rooftop ladder all just take you out',r.stay&&r.kitchen&&r.fargo&&r.city,JSON.stringify(r));
// N. gear: find it on the map, Joe wears it, Settings can take it off
await fresh({});
r=await p.evaluate(()=>{const got=[]; for(const k in GEAR){if(GEAR[k].give)continue; P.x=GEAR[k].x;P.y=GEAR[k].y; T.run(1); got.push(k+':'+(have.gear&&have.gear[k])+':'+$('dtext').textContent.slice(0,20)); closeDialog(); paused=false}
  $('settingsBtn').click(); const rows=[...$('gearRows').querySelectorAll('input')]; rows[0].checked=false; rows[0].onchange(); const off=have.gear.oakleys; $('settingsClose').click(); return {got,rows:rows.length,off}});
ok('N Oakleys, headband and carbon shoes can be found; Joe wears them',r.got.every(g=>g.split(':')[1]==='1'),r.got.join(' | '));
ok('N Settings lists the gear and can take it off',r.rows===3&&r.off===0);
// O. the signpost, the Fargo signs, and the ice cream served with the cookies
// O. Logan: talk, help him look, and he gives Joe a lucky clover
r=await p.evaluate(()=>{P.x=LOGAN.x+6;P.y=LOGAN.y+2; T.run(1); const lbl=prompt.textContent; action(); const pages=[]; while(T.btns().includes('Next')){pages.push($('dtext').textContent);T.click('Next')} T.click('Help him look'); T.run(130); const found=$('dspeaker').textContent+': '+$('dtext').textContent; while(T.btns().includes('Next'))T.click('Next'); T.click('Pin it on'); return {lbl,pages,found,clover:have.gear&&have.gear.clover}});
ok('O Logan is looking for four-leaf clovers and gives Joe one',r.lbl==='Talk to Logan'&&r.pages.join().includes('rollerski workout')&&r.found.startsWith('Logan')&&r.clover===1,r.found);
// P. Alex's hint when Joe stands still, gone once he moves
r=await p.evaluate(()=>{goTo('world','start'); T.run(40); closeDialog(); paused=false; P.x=60;P.y=150; T.run(Math.ceil(HINTS.AFTER_MS/16.7)+5); const shown=!$('hint').hidden, text=$('hintText').textContent; dirs.right=true; T.run(3); dirs.right=false; return {shown,text,gone:$('hint').hidden}});
ok('P standing still: Alex says where to go next; moving hides it',r.shown&&r.text.includes('Keelan')&&r.gone,r.text);
// Q. the photo album in Settings shows locked photos as ?
r=await p.evaluate(()=>{$('settingsBtn').click(); $('setAlbum').click(); const locked=!!$('ecard').querySelector('.plocked'), btn=$('endNext').textContent; $('endNext').click(); return {locked,btn,closed:$('ending').hidden,paused}});
ok('Q Settings > Photo album: locked photos until you finish that stop',r.locked&&r.btn==='Close'&&r.closed&&!r.paused);
// R. Jackie: get kicked out of the Fargo shop and she shows up to tell Joe what to do
await fresh({farm:1});
await p.evaluate(()=>{goTo('fargo','fromHighway'); T.run(40); try{closeDialog()}catch(e){} have.fargoStage='store'; parkAndGetOut(); paused=false; openShop();
  for(let k=0;k<2;k++){shop.drink='coke'; shop.snack='snickers'; giveToAlex()}});
await p.waitForTimeout(5000);
r=await p.evaluate(()=>{const sp=$('dspeaker').textContent, t=$('dtext').textContent; while(T.btns().includes('Next'))T.click('Next'); T.click('Okay, Jackie'); const j=fargo.jackie;
  P.x=j.x+8;P.y=j.y; T.run(1); const lbl=prompt.textContent; action(); const h1=$('dtext').textContent; closeDialog(); action(); const h2=$('dtext').textContent; closeDialog();
  const g=STATIONS[fargo.bob]; P.x=g.door.x+8; P.y=g.door.y+4; T.run(1); const door=prompt.textContent; return {sp,t,lbl,h1,h2,door,met:have.metJackie,tryAgain:JACKIE.tryAgain}});
ok('R kicked out: Jackie comes over and says to think, then go back in',r.sp==='Jackie'&&r.t.includes('kicked out')&&r.met,r.t);
ok('R talking to Jackie gives a hint each time; the door says try again',r.lbl==='Talk to Jackie'&&r.h1!==r.h2&&r.door===r.tryAgain,r.h1.slice(0,40)+' / '+r.door);
// P. Henrietta: only after the farm (Keelan's keepsake), then she follows Joe everywhere, dressed for each place
await fresh({});
r=await p.evaluate(()=>{const before=!!henEnt(); have.gear={hen:1}; const keep=scene; const out={};
  for(const n of ['world','city','birkie','golf','fargo','kitchen']){scene=SCENES[n]; fargo.onFoot=true; const e=henEnt(); out[n]=!!e; if(e)e.draw()}
  scene=SCENES.fargo; fargo.onFoot=false; out.driving=!!henEnt(); scene=keep;
  const px=(n)=>{scene=SCENES[n]; ctx.setTransform(1,0,0,1,0,0); ctx.fillStyle='#000'; ctx.fillRect(0,0,30,30); drawHenrietta(15,25,1,n); const d=ctx.getImageData(6,10,18,18).data; let h=0; for(let i=0;i<d.length;i+=4)h=(h*31+d[i]+d[i+1]*7+d[i+2]*13)%1e9; return h};
  const looks=new Set(['world','city','birkie','golf','fargo','kitchen'].map(px)).size; scene=keep;
  return {before,out,looks}});
ok('P no Henrietta before the farm',!r.before);
ok('P after the farm she follows Joe in every world (not while he drives)',Object.entries(r.out).every(([k,v])=>k==='driving'?!v:v),JSON.stringify(r.out));
ok('P a different outfit in each world',r.looks===6,r.looks+' looks');
console.log(R.join('\n')); console.log('page errors:',errs.length?errs:'none'); await b.close()})();
