// Plays the whole game start to finish, the way Joe might: welcome, every stop in a different order,
// the secrets, the secret word, baking, the party, the ending, then Play again. Reloads the page after
// every step to make sure progress saves. Run: node tests/full-playthrough.js
// (Each stop's own gameplay is tested in its own suite; this one tests how the pieces fit together.)
const {chromium}=require('playwright');const path=require('path');(async()=>{
const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
const URL='file://'+path.resolve(__dirname,'../index.html');
const R=[];const ok=(n,c,x='')=>R.push((c?'PASS ':'FAIL ')+n+(x?'  ('+x+')':''));
const helpers=()=>{window.T={
  btns:()=>[...$('dbtns').querySelectorAll('button')].map(b=>b.textContent),
  click:t=>{const b=[...$('dbtns').querySelectorAll('button')].find(b=>b.textContent===t); if(!b)throw new Error('no button '+t+' in '+T.btns()); b.click()},
  pages:()=>{const out=[]; while(!dlg.hidden&&T.btns().includes('Next')){out.push($('dtext').textContent);T.click('Next')} out.push($('dtext').textContent); return out},
  run:n=>{for(let i=0;i<n;i++)update(16.7)},
  at:(x,y)=>{P.x=x;P.y=y;T.run(2)},
}};
const boot=async()=>{await p.click('#startBtn'); await p.waitForTimeout(150); await p.evaluate(helpers)};
const reload=async()=>{await p.reload(); await boot()};
const reward=async(key)=>{ await p.evaluate(k=>{ if($('reward').hidden)showReward(k) },key); await p.click('#rewardArt',{force:true}); await p.waitForTimeout(900) };
const basket=()=>p.evaluate(()=>[...$('basket').querySelectorAll('.slot.got')].map(s=>s.dataset.key));

// 1. a brand new game: Alex's welcome, pick a look, the basket is all shadows
await p.goto(URL); await p.evaluate(()=>localStorage.clear()); await p.reload(); await p.click('#startBtn'); await p.evaluate(helpers);
let r=await p.evaluate(()=>{const sp=$('dspeaker').textContent, pages=T.pages(); T.click(ALEX_WELCOME.go); const ward=!$('wardrobe').hidden; $('wardGo').click();
  return {sp,n:pages.length,ward,welcomed:have.welcomed,paused,shadows:[...$('basket').children].filter(s=>!s.classList.contains('got')).length,song}});
ok('1 new game: Alex welcomes Joe, he picks a look, five empty spots in the basket',r.sp==='Alex'&&r.ward&&r.welcomed&&!r.paused&&r.shadows===5,JSON.stringify(r));
await reload();
r=await p.evaluate(()=>({dlg:dlg.hidden,ward:$('wardrobe').hidden,paused}));
ok('1 reload: no welcome the second time, Joe can walk',r.dlg&&r.ward&&!r.paused);

// 2. every stop, in an odd order, reloading after each; Alex's hint always points at something still missing
const order=['golf','city','farm','fargo','mill'];
for(const key of order){
  await reward(key); await reload();
  r=await p.evaluate(k=>{const missing=ITEMS.filter(i=>!have[i.key]).map(i=>i.key); return {have:!!have[k],missing,hint:nextHint(),want:missing.length?HINTS[missing[0]]:HINTS.home}},key);
  const got=await basket();
  ok(`2 ${key}: in the basket after a reload; the hint points at what's next`,r.have&&got.includes(key)&&r.hint===r.want,`${got.length}/5 · ${r.hint.slice(0,30)}`);
}

// 3. the secrets, found the real way: walking, talking
r=await p.evaluate(()=>{ goTo('world','start'); T.run(40); const out={};
  for(const k of ['oakleys','headband','shoes']){T.at(GEAR[k].x,GEAR[k].y); out[k]=have.gear&&have.gear[k]; closeDialog()}
  T.at(LOGAN.x+6,LOGAN.y+2); action(); T.pages(); T.click(LOGAN_TEXT.help); $('cloverField').querySelector('[data-four]').click(); T.pages(); T.click(LOGAN_TEXT.wear); out.clover=have.gear.clover;
  T.at(CUPCAKE.x,CUPCAKE.y); out.cupcake=!!have.cupcake; while(!dlg.hidden)[...$('dbtns').querySelectorAll('button')][0].click();
  talkBryan(); T.pages(); [...$('dbtns').querySelectorAll('button')][0].click(); return out});
await p.click('#rewardArt',{force:true}); await p.waitForTimeout(900);
await p.evaluate(()=>{have.icecream=true; save(); renderBasket()});   // (Lars's long jump is tested in the heist suite)
await reload();
r=await p.evaluate(()=>({found:secretsFound(),of:SECRETS.length,bonus:[...$('basket').querySelectorAll('.slot.bonus,.slot.extra')].map(s=>s.dataset.key)}));
ok('3 all seven secrets found by walking and talking, and they survive a reload',r.found===r.of,JSON.stringify(r));

// 4. home: everyone's there, bake, party
r=await p.evaluate(()=>{goTo('kitchen','fromDoor'); T.run(40); const crowd=CROWD.filter(c=>!c.needs||have[c.needs]).length;
  T.at(64,60); action(); T.pages(); T.click("Let's bake"); return {crowd,bake:!$('bake').hidden}});
ok('4 everyone came over; Let\'s bake goes straight to baking',r.crowd>=12&&r.bake,r.crowd+' guests');
r=await p.evaluate(()=>{const tick=ms=>{for(let t=0;t<ms;t+=16.7)SCENES.kitchen.ambient(16.7)};
  for(let guard=0;guard<30&&bake.state!=='oven';guard++){const s=stepNow(); if(bake.state==='good'){bakePress();continue}
    if(s.kind==='pour'){bakePress(); tick(s.target/s.rate*1000); bakeRelease()} else if(s.kind==='count'){for(let k=0;k<s.target;k++)bakePress(); eggsDone()} else {for(let k=0;k<(s.taps||12);k++)bakePress()}}
  bakePress(); tick(BAKE.TARGET/BAKE.RATE*1000); bakePress(); const done=bake.state; bakePress(); return {done,taste:!!kit.taste,baked:have.baked}});
ok('4 every baking step, then the oven to 10:00: the taste test starts',r.taste&&r.baked,JSON.stringify(r));

// 5. the party, the dance, the ending
await p.evaluate(()=>{const tick=ms=>{for(let t=0;t<ms;t+=16.7)SCENES.kitchen.ambient(16.7)}; const clk=()=>{while(!dlg.hidden)[...$('dbtns').querySelectorAll('button')][0].click()};
  tick(TASTE.WALK+60); clk(); tick(TASTE.NERVOUS+60); clk(); tick(PARTY.WALK+PARTY.HUG+400); clk(); tick(1700)});   // the taste test, the hug, everyone's lines, the crown
await p.waitForTimeout(8000);
r=await p.evaluate(()=>({crown:!!have.crown,dance:kit.dance,ending:!$('ending').hidden,song}));
ok('5 the crown, the Cookie Dance (Jingle Bells), then the credits',r.crown&&r.dance&&r.ending,JSON.stringify(r));
r=await p.evaluate(()=>{$('endSkip').click(); const stats=$('ecard').textContent; $('endNext').click(); const secret=$('ecard').textContent; $('endNext').click();
  const album=[]; for(let i=0;i<6;i++){album.push(!!$('ecard').querySelector('.polaroid canvas')); const n=$('ecard').querySelectorAll('.pnav button')[1]; if(i<5)n.click()}
  $('endNext').click(); return {stats,secret,album,note:$('ecard').textContent}});
ok('5 stats count all 7 secrets and show the Cookie Legend',r.stats.includes('7 of 7')&&r.stats.includes('LEGEND'),r.stats.slice(0,60));
ok('5 the secret note (only for finding everything), all six photos unlocked, then the note',r.secret.includes(await p.evaluate(()=>ENDING.secretTitle))&&r.album.every(Boolean)&&r.note.includes('Merry Christmas'));
await p.evaluate(()=>$('endNext').click());
await reload();
r=await p.evaluate(()=>({crown:!!have.crown,legend:allSecrets(),scene:scene===SCENES.world}));
ok('5 after a reload Joe still has his (legendary) crown',r.crown&&r.legend);

// 6. Play again: everything starts over, including the new stuff
r=await p.evaluate(()=>{goTo('kitchen','fromDoor'); T.run(40); T.at(64,60); action(); const ending=!$('ending').hidden; $('endSkip').click(); $('endNext').click(); $('endNext').click(); $('endNext').click();
  const pa=[...$('ecard').querySelectorAll('button')].find(b=>b.textContent===KITCHEN.playAgain); if(!pa)return {err:$('ecard').textContent.slice(0,80)+' | dlg '+$('dtext').textContent+' | near '+(near&&near.label),keys:[]}; pa.click(); T.run(40);
  return {ending,keys:Object.keys(have),basket:[...$('basket').querySelectorAll('.slot.got')].length,gear:!!have.gear,crown:!!have.crown,scene:scene===SCENES.world,closed:$('ending').hidden}});
ok('6 the counter replays the ending; Play again wipes everything (basket, gear, crown)',r.ending&&r.basket===0&&!r.gear&&!r.crown&&r.scene&&r.closed,JSON.stringify(r.keys));

console.log(R.join('\n')); console.log('page errors:',errs.length?errs:'none'); await b.close(); process.exit(R.some(l=>l.startsWith('FAIL'))||errs.length?1:0)})();
