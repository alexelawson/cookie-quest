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
const fresh=async(st)=>{await p.goto(URL);await p.evaluate(s=>{localStorage.clear(); if(s)localStorage.setItem('cookie-quest-v1',JSON.stringify(s))},st);await p.reload();await p.click('#startBtn');await p.evaluate(helpers)};
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
r=await p.evaluate(()=>{P.x=64;P.y=60; update(16.7); action(); const pages=[]; while(T.btns().includes('Next')){pages.push($('dtext').textContent);T.click('Next')} T.click("Let's bake"); return {pages,open:!$('bake').hidden,step:$('bakeStep').textContent}});
ok('B Start baking opens the baking card at step 1 (butter)',r.open&&r.step.includes('Butter'),r.step);
// C. pouring: too little, too much, spill, then right on the line
r=await p.evaluate(()=>{const s=stepNow(), out={}; T.pour(.6); out.little=$('bakeMsg').textContent; T.tick(700);
  T.pour(2.4); out.much=$('bakeMsg').textContent; T.tick(700); bakePress(); T.tick(4000); out.spill=$('bakeMsg').textContent; bakeRelease(); T.tick(800);
  T.pour(s.target/s.rate); out.good=bake.state; out.goodMsg=$('bakeMsg').textContent; return out});
ok('C butter: too little / too much / spilling all get a redo',r.little.includes('enough')&&r.much.includes('too much')&&r.spill.includes('everywhere'),r.little+' | '+r.much+' | '+r.spill);
ok('C butter: stop on the gold line and Keelan approves',r.good==='good'&&r.goodMsg.startsWith('Keelan'),r.goodMsg);
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
r=await p.evaluate(()=>{bakePress(); const party=kit.party, closed=$('bake').hidden; const lines=T.through(); T.tick(1700); return new Promise(res=>setTimeout(()=>res({party,closed,lines,crown:!!have.crown,baked:!!have.baked,note:$('dtext').textContent,btns:T.btns()}),900))});
ok('E party: everyone has a line, and they bounce',r.party&&r.closed&&['Alex','Keelan','Bob','Lars','John','The Stranger','Margie','Jack'].every(n=>r.lines.some(l=>l.startsWith(n+':'))),r.lines.length+' lines');
ok('E Joe gets a crown, then the note',r.crown&&r.baked&&r.note.includes('Merry Christmas')&&r.btns.includes('Play again'),r.note);
r=await p.evaluate(()=>{T.click('Keep exploring'); goTo('world','fromKitchen'); T.run(30); return {crown:!!have.crown,scene:scene===SCENES.world}});
ok('E the crown stays on outside',r.crown&&r.scene);
// F. the wardrobe before the city
await fresh({});
r=await p.evaluate(()=>{P.x=134;P.y=244;update(16.7); action(); const open=!$('wardrobe').hidden, n=$('outfits').children.length;
  [...$('outfits').children].find(b=>b.dataset.id==='sweater').click(); const line=$('wardLine').textContent; $('wardGo').click(); T.run(40);
  return {open,n,line,outfit:have.outfit,city:scene===SCENES.city}});
ok('F the elevator opens the wardrobe first; pick an outfit; then the city',r.open&&r.n===5&&r.line.includes('Festive')&&r.outfit==='sweater'&&r.city,r.line);
r=await p.evaluate(()=>{const seen=[]; for(let i=0;i<20&&!dlg.hidden;i++){seen.push($('dspeaker').textContent+': '+$('dtext').textContent); [...$('dbtns').querySelectorAll('button')][0].click(); if(!$('howto').hidden)$('howOk').click(); T.run(2)} T.run(5); for(let i=0;i<5&&!dlg.hidden;i++){seen.push($('dspeaker').textContent+': '+$('dtext').textContent);[...$('dbtns').querySelectorAll('button')][0].click(); T.run(2)} return seen});
ok('F the crew reacts to the outfit',r.some(l=>l.includes('from space')),r.slice(-2).join(' | '));
console.log(R.join('\n')); console.log('page errors:',errs.length?errs:'none'); await b.close()})();
