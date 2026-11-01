// Plays the disc golf course. Run: node tests/golf-scenarios.js
const {chromium}=require('playwright');const path=require('path');(async()=>{
const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
const URL='file://'+path.resolve(__dirname,'../index.html');
const helpers=()=>{window.T={
  btns:()=>[...$('dbtns').querySelectorAll('button')].map(b=>b.textContent),
  click:t=>[...$('dbtns').querySelectorAll('button')].find(b=>b.textContent===t).click(),
  through:()=>{const seen=[]; for(let i=0;i<40&&!dlg.hidden;i++){seen.push($('dspeaker').textContent+': '+$('dtext').textContent); [...$('dbtns').querySelectorAll('button')][0].click()} return seen},
  run:n=>{for(let i=0;i<n;i++)update(16.7)},
  // throw with an exact angle offset + power (bypassing the sweeps)
  throwAt:(off,pw)=>{golfTap(); golf.angle=aimBase()+off; golfTap(); golf.flight=golfFlight(golfHole(),golf.lie,golf.angle,pw,isPutt()); golf.flight.i=0; golf.flight.putt=isPutt(); for(let i=0;i<200&&golf.state==='flight';i++)update(16.7)},
  bestThrow:()=>{const h=golfHole(),b=h.basket,putt=isPutt(),span=putt?GOLF.PUTT_SPAN:GOLF.AIM_SPAN; let best=null;
    for(let o=-span;o<=span;o+=span/20)for(let pw=.1;pw<=1.001;pw+=.025){const f=golfFlight(h,golf.lie,aimBase()+o,pw,putt); const sc=f.result==='in'?-1:(f.result==='water'||f.result==='ob')?999:Math.hypot(f.end.x-b.x,f.end.y-b.y)+(f.result==='tree'?30:0); if(!best||sc<best.sc)best={o,pw,sc}} return best},
}};
const fresh=async()=>{await p.goto(URL);await p.evaluate(()=>localStorage.clear());await p.reload();await p.click('#startBtn');await p.evaluate(helpers)};
const R=[];const ok=(n,c,x='')=>R.push((c?'PASS ':'FAIL ')+n+(x?'  ('+x+')':''));
await fresh();
let r=await p.evaluate(()=>{P.x=192;P.y=281;update(16.7); const lbl=prompt.textContent; action(); T.run(40); return {lbl,scene:scene===SCENES.golf,slot:$('basket').textContent}});
ok('A the south road leads to the course',r.lbl==='Go to the disc golf course'&&r.scene,r.lbl); ok('A milk is on the shopping list',r.slot.includes('Milk'),r.slot);
r=await p.evaluate(()=>{P.x=MARGIE_SPOT.x+12;P.y=MARGIE_SPOT.y;update(16.7); const lbl=prompt.textContent; action(); const face=!$('dportrait').hidden; const pages=[]; while(T.btns().includes('Next')){pages.push($('dtext').textContent);T.click('Next')} const btns=T.btns(); T.click("Let's play"); update(16.7); return {lbl,face,pages,btns,active:golf.active,label:$('alabel').textContent,hud:$('hud').textContent}});
ok('B talk to Margie (portrait shows), she explains, you start a round',r.lbl==='Talk to Margie'&&r.face&&r.active,r.pages[0]); ok('B A button says Aim, HUD shows the hole',r.label==='Aim'&&r.hud.includes('H1'),r.hud);
// the sweep and meter actually move
r=await p.evaluate(()=>{const a1=aimNow(); T.run(20); const a2=aimNow(); golfTap(); const p1=powerNow(); T.run(15); const p2=powerNow(); update(16.7); return {aim:Math.abs(a2-a1)>.01, pow:Math.abs(p2-p1)>.01, label:$('alabel').textContent}});
ok('B aim sweeps, power pulses, A says Throw',r.aim&&r.pow&&r.label==='Throw');
r=await p.evaluate(()=>{golf.state='aim'; return 1});
// hazards: tree, water, out of bounds
r=await p.evaluate(()=>{const h=HOLES[1]; const water=golfFlight(h,h.tee,0,.6,false); const ob=golfFlight(h,h.tee,Math.PI/2,1,false); const h1=HOLES[0]; const t=h1.trees[0]; const toTree=golfFlight(h1,h1.tee,Math.atan2(t[1]-3-h1.tee.y,t[0]-h1.tee.x),1,false); return {water:water.result,ob:ob.result,tree:toTree.result}});
ok('C water, out of bounds and trees all do their thing',r.water==='water'&&r.ob==='ob'&&r.tree==='tree',JSON.stringify(r));
// water costs a stroke and you throw again from the same spot
r=await p.evaluate(()=>{golf.hole=1; golfStartHole(); const before={...golf.lie}; golfTap(); golf.angle=0; golfTap(); golf.flight=golfFlight(HOLES[1],golf.lie,0,.6,false); golf.flight.i=0; for(let i=0;i<200&&golf.state==='flight';i++)update(16.7);
  return {strokes:golf.strokes, same:golf.lie.x===before.x&&golf.lie.y===before.y, msg:golf.msg}});
ok('C landing in the pond: penalty stroke, rethrow from the same spot',r.strokes===2&&r.same&&r.msg.includes('Splash'),r.msg);
// a perfect round wins the milk (Margie forced to an average round so the test is deterministic)
r=await p.evaluate(async()=>{const wait=ms=>new Promise(r=>setTimeout(r,ms)); const keepM=GOLF.MARGIE, keepJ=GOLF.JACK; GOLF.MARGIE={'0':1}; GOLF.JACK={'0':1};
  golfStartRound(); const lines=[]; let guard=0;
  while((golf.active||golf.state==='between')&&guard++<80){ if(!dlg.hidden){lines.push(...T.through()); continue} if(golf.state!=='aim'){T.run(3); await wait(60); continue} const bt=T.bestThrow(); T.throwAt(bt.o,bt.pw); T.run(10) }
  for(let i=0;i<60&&$('reward').hidden;i++){T.run(10); await wait(30); if(!dlg.hidden)lines.push(...T.through())}
  GOLF.MARGIE=keepM; GOLF.JACK=keepJ; return {lines,you:golf.you,reward:!$('reward').hidden,name:$('rewardName').textContent}});
ok('D a sharp round beats them and wins the milk',r.reward&&r.name==='Milk',`you ${r.you.join(',')} | ${r.lines.filter(l=>l.startsWith(': Final')).join('')}`);
ok('D Margie and Jack react after every hole',r.lines.filter(l=>l.startsWith('Margie')).length>=3&&r.lines.filter(l=>l.startsWith('Jack')).length>=3);
await p.click('#rewardArt',{force:true}); await p.waitForTimeout(900);
r=await p.evaluate(()=>({golf:!!have.golf,basket:$('basket').textContent})); ok('D milk goes in the basket',r.golf&&r.basket.includes('✓ Milk'),r.basket);
// a bad round loses and offers another go
await fresh(); r=await p.evaluate(async()=>{const wait=ms=>new Promise(r=>setTimeout(r,ms)); P.x=192;P.y=281;update(16.7);action();T.run(40); GOLF.MARGIE={'-1':1}; golfStartRound(); let guard=0, lines=[];
  while((golf.active||golf.state==='between')&&guard++<120){ if(!dlg.hidden){ if(T.btns().includes('Play again'))break; lines.push(...T.through()); continue} if(golf.state!=='aim'){T.run(3); await wait(60); continue} T.throwAt(0,.12); }
  T.run(10); await wait(100); const last=[]; while(T.btns().includes('Next')||T.btns().includes('OK')){last.push($('dtext').textContent); [...$('dbtns').querySelectorAll('button')][0].click(); T.run(1)}
  return {last,btns:T.btns(),golf:!!have.golf}});
ok('E a weak round loses and Margie offers another',r.btns.includes('Play again')&&!r.golf,r.last.join(' | '));
// leaving the course
r=await p.evaluate(()=>{T.click('Maybe later'); P.x=112;P.y=164;update(16.7); const lbl=prompt.textContent; action(); T.run(40); return {lbl,world:scene===SCENES.world}});
ok('F walk back out to the road',r.lbl==='Head back to the road'&&r.world,r.lbl);
console.log(R.join('\n')); console.log('page errors:',errs.length?errs:'none'); await b.close()})();
