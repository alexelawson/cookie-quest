// Plays the disc golf course. Run: node tests/golf-scenarios.js
const {chromium}=require('playwright');const path=require('path');(async()=>{
const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
const URL='file://'+path.resolve(__dirname,'../index.html');
const helpers=()=>{window.T={
  btns:()=>[...$('dbtns').querySelectorAll('button')].map(b=>b.textContent),
  click:t=>[...$('dbtns').querySelectorAll('button')].find(b=>b.textContent===t).click(),
  through:()=>{const seen=[]; for(let i=0;i<40&&!dlg.hidden&&!T.btns().includes('Play again');i++){seen.push($('dspeaker').textContent+': '+$('dtext').textContent); [...$('dbtns').querySelectorAll('button')][0].click()} return seen},
  run:n=>{for(let i=0;i<n;i++)update(16.7)},
  // throw with an exact angle offset + power (bypassing the sweeps)
  throwAt:(off,pw)=>{const mode=throwMode(); golfTap(); golf.angle=aimBase()+off; golfTap(); golf.flight=golfFlight(golfHole(),golf.lie,golf.angle,pw,isPutt(),mode); golf.flight.i=0; golf.flight.putt=isPutt(); for(let i=0;i<200&&golf.state==='flight';i++)update(16.7)},
  bestThrow:()=>{const h=golfHole(),b=h.basket,putt=isPutt(),span=putt?GOLF.PUTT_SPAN:GOLF.AIM_SPAN; let best=null;
    const mode=throwMode(); for(let o=-span;o<=span;o+=span/20)for(let pw=.1;pw<=1.001;pw+=.025){const f=golfFlight(h,golf.lie,aimBase()+o,pw,putt,mode); const sc=f.result==='in'?-1:(f.result==='water'||f.result==='ob')?999:Math.hypot(f.end.x-b.x,f.end.y-b.y)+(f.result==='tree'?30:0); if(!best||sc<best.sc)best={o,pw,sc}} return best},
}};
const fresh=async()=>{await p.goto(URL);await p.evaluate(()=>localStorage.clear());await p.reload();await p.click('#startBtn');await p.evaluate(helpers)};
const R=[];const ok=(n,c,x='')=>R.push((c?'PASS ':'FAIL ')+n+(x?'  ('+x+')':''));
await fresh();
let r=await p.evaluate(()=>{P.x=192;P.y=281;update(16.7); const lbl=prompt.textContent; action(); T.run(40); return {lbl,scene:scene===SCENES.golf,slot:$('basket').textContent}});
ok('A the south road leads to the course',r.lbl==='Go to the disc golf course'&&r.scene,r.lbl); ok('A milk is on the shopping list',r.slot.includes('Milk'),r.slot);
r=await p.evaluate(()=>{P.x=MARGIE_SPOT.x+12;P.y=MARGIE_SPOT.y;update(16.7); const lbl=prompt.textContent; action(); const face=!$('dportrait').hidden; const pages=[]; while(T.btns().includes('Next')){pages.push($('dtext').textContent);T.click('Next')} const btns=T.btns(); T.click("Let's play"); const card=!$('howto').hidden, steps=$('howControls').children.length, rows=$('howRows').textContent; $('howOk').click();
  const ask=T.btns(); T.click('Practice throw'); update(16.7); const prac=$('hud').textContent;
  golfTap(); golf.angle=aimBase(); golfTap(); golf.flight=golfFlight(golfHole(),golf.lie,golf.angle,.5,false); golf.flight.i=0; for(let i=0;i<200&&golf.state==='flight';i++)update(16.7);
  return {lbl,face,pages,btns,card,steps,rows,ask,prac,active:golf.active};});
ok('B talk to Margie (portrait shows) and she explains the stakes',r.lbl==='Talk to Margie'&&r.face&&r.pages[0].includes('milk'),r.pages[0]);
ok('B instructions card first (Margie + Jack + steps)',r.card&&r.steps>=5&&r.rows.includes('Margie')&&r.rows.includes('Jack'),r.steps+' steps');
ok('B then a practice throw is offered',r.ask.join()==='Practice throw,Start the round'&&r.prac.includes('Practice'),r.ask.join(' | '));
await p.waitForFunction(()=>!dlg.hidden&&T.btns().includes('Throw again'),null,{timeout:5000});
r=await p.evaluate(()=>{const said=$('dtext').textContent; T.click('Throw again'); const again=golf.practice&&golf.state==='aim'&&golf.lie.x===HOLES[0].tee.x; const counted=golf.you.length;
  golfTap(); golfTap(); golf.flight=golfFlight(golfHole(),golf.lie,aimBase(),.5,false); golf.flight.i=0; for(let i=0;i<200&&golf.state==='flight';i++)update(16.7); return {said,again,counted}});
ok('B practice shows how close you got; throw again resets to the tee; nothing counts',r.said.includes('feet')&&r.again&&r.counted===0,r.said);
await p.waitForFunction(()=>!dlg.hidden&&T.btns().includes('Start the round'),null,{timeout:5000});
r=await p.evaluate(()=>{T.click('Start the round'); update(16.7); return {active:golf.active,practice:golf.practice,label:$('alabel').textContent,hud:$('hud').textContent}});
ok('B the round starts: A says Aim, HUD shows hole 1',r.active&&!r.practice&&r.label==='Aim'&&r.hud.includes('H1'),r.hud);
r=await p.evaluate(()=>{const btn=!$('golfRestart').hidden; golf.hole=2; golf.you=[1,0]; golf.strokes=3; $('golfRestart').click(); const ask=$('dtext').textContent; T.click('Start over'); for(let i=0;i<5&&!dlg.hidden;i++)[...$('dbtns').querySelectorAll('button')][0].click(); update(16.7);
  return {btn,ask,hole:golf.hole,you:golf.you.length,strokes:golf.strokes,active:golf.active}});
ok('B the Restart round button asks, then starts over from hole 1',r.btn&&r.ask.includes('over')&&r.hole===0&&r.you===0&&r.strokes===0&&r.active,JSON.stringify(r));
// the sweep and meter actually move
r=await p.evaluate(()=>{const a1=aimNow(); T.run(20); const a2=aimNow(); golfTap(); const p1=powerNow(); T.run(15); const p2=powerNow(); update(16.7); return {aim:Math.abs(a2-a1)>.01, pow:Math.abs(p2-p1)>.01, label:$('alabel').textContent}});
ok('B aim sweeps, power pulses, A says Throw',r.aim&&r.pow&&r.label==='Throw');
r=await p.evaluate(()=>{golf.state='aim'; return 1});
// hazards: tree, water, out of bounds
r=await p.evaluate(()=>{const h=HOLES[2]; const water=golfFlight(h,h.tee,0,.6,false); const ob=golfFlight(h,h.tee,Math.PI/2,1,false); const h1=HOLES[0]; const t=h1.trees[0]; const toTree=golfFlight(h1,h1.tee,Math.atan2(t[1]-3-h1.tee.y,t[0]-h1.tee.x),1,false); return {water:water.result,ob:ob.result,tree:toTree.result}});
ok('C water, out of bounds and trees all do their thing',r.water==='water'&&r.ob==='ob'&&r.tree==='tree',JSON.stringify(r));
r=await p.evaluate(()=>{const h=HOLES[0], t=h.trees[0], tee=h.tee, d=Math.hypot(t[0]-tee.x,t[1]-3-tee.y), base=Math.atan2(t[1]-3-tee.y,t[0]-tee.x);
  const at=off=>{const f=golfFlight(h,tee,base+off/d,1,false); return f.result+(f.result!=='tree'?'':' at '+Math.round(f.end.x)+','+Math.round(f.end.y))};
  return {center:at(0), slight:at(.8), close:at(3), closeOther:at(-3), edge:at(5)}});
ok('C trees: dead center stops the disc, close passes glance around it',r.center.startsWith('tree')&&r.slight.startsWith('tree')&&!r.close.startsWith('tree')&&!r.closeOther.includes('tree at 6')&&!r.edge.startsWith('tree'),JSON.stringify(r));
// water costs a stroke and you throw again from the same spot
r=await p.evaluate(()=>{golf.hole=2; golfStartHole(); T.through(); const before={...golf.lie}; golfTap(); golf.angle=0; golfTap(); golf.flight=golfFlight(HOLES[2],golf.lie,0,.6,false); golf.flight.i=0; for(let i=0;i<200&&golf.state==='flight';i++)update(16.7);
  return {strokes:golf.strokes, same:golf.lie.x===before.x&&golf.lie.y===before.y, msg:golf.msg}});
ok('C landing in the pond: penalty stroke, rethrow from the same spot',r.strokes===2&&r.same&&r.msg.includes('Splash'),JSON.stringify(r));
r=await p.evaluate(()=>{const L=HOLES[1], hk=HOLES[3]; const t=L.trees.find(([x,y])=>Math.hypot(x-L.tee.x,y-L.tee.y)<60); const a=Math.atan2(t[1]-3-L.tee.y,t[0]-L.tee.x);   // straight at a tree by the tee
  const plat=golfFlight(L,L.tee,a,1,false,'platform'), flat=golfFlight(L,L.tee,a,1,false,'');
  const ha=Math.atan2(hk.basket.y-hk.tee.y,hk.basket.x-hk.tee.x), hike=golfFlight(hk,hk.tee,ha,1,false,'hike'), norm=golfFlight(hk,hk.tee,ha,1,false,'');
  golf.hole=3; golfStartHole(); const hint=T.through(); update(16.7); golfTap(); update(16.7); const lab=$('alabel').textContent, facing=P.dir; golf.state='aim';
  return {plat:plat.result+' '+plat.path.length, flat:flat.result+' '+flat.path.length, hike:hike.path.length, norm:norm.path.length, hint:hint.join(), lab, facing}});
ok('C the platform drive clears the trees by the tee and goes farther',r.plat.split(' ')[0]!=='tree'&&r.flat.split(' ')[0]==='tree',`${r.plat} vs ${r.flat}`);
ok('C the hike hole: shorter throw, Jack explains, you face away, button says Hike!',r.hike<r.norm&&r.hint.includes('HUT')&&r.lab==='Hike!'&&r.facing==='left',`${r.hike} vs ${r.norm}, ${r.lab}, ${r.facing}`);
// a perfect round wins the milk (Margie forced to an average round so the test is deterministic)
r=await p.evaluate(async()=>{const wait=ms=>new Promise(r=>setTimeout(r,ms)); const keepM=GOLF.MARGIE, keepJ=GOLF.JACK; GOLF.MARGIE={'0':1}; GOLF.JACK={'0':1};
  golfStartRound(); const lines=[]; let guard=0;
  while((golf.active||golf.state==='between')&&guard++<160){ if(!dlg.hidden){lines.push(...T.through()); continue} if(golf.state!=='aim'){T.run(3); await wait(60); continue} const bt=T.bestThrow(); T.throwAt(bt.o,bt.pw); T.run(10) }
  for(let i=0;i<60&&$('reward').hidden;i++){T.run(10); await wait(30); if(!dlg.hidden)lines.push(...T.through())}
  GOLF.MARGIE=keepM; GOLF.JACK=keepJ; return {lines,you:golf.you,reward:!$('reward').hidden,name:$('rewardName').textContent}});
ok('D a sharp round beats them and wins the milk',r.reward&&r.name==='Milk',`you ${r.you.join(',')} | ${r.lines.filter(l=>l.startsWith(': Final')).join('')}`);
ok('D Margie and Jack react after every hole',r.lines.filter(l=>l.startsWith('Margie')).length>=3&&r.lines.filter(l=>l.startsWith('Jack')).length>=3);
await p.click('#rewardArt',{force:true}); await p.waitForTimeout(900);
r=await p.evaluate(()=>({golf:!!have.golf,basket:$('basket').textContent})); ok('D milk goes in the basket',r.golf&&r.basket.includes('✓ Milk'),r.basket);
// a bad round loses and offers another go
await fresh(); r=await p.evaluate(async()=>{const wait=ms=>new Promise(r=>setTimeout(r,ms)); P.x=192;P.y=281;update(16.7);action();T.run(40); GOLF.MARGIE={'-1':1}; golfStartRound(); let guard=0, lines=[];
  while((golf.active||golf.state==='between')&&guard++<200){ if(!dlg.hidden){ if(T.btns().includes('Play again'))break; lines.push(...T.through()); continue} if(golf.state!=='aim'){T.run(3); await wait(60); continue} T.throwAt(0,.12); }
  T.run(10); await wait(100); const last=[]; while(!dlg.hidden&&(T.btns().includes('Next')||T.btns().includes('OK'))){last.push($('dtext').textContent); [...$('dbtns').querySelectorAll('button')][0].click(); T.run(1)}
  return {last,btns:T.btns(),golf:!!have.golf}});
ok('E a weak round loses and Margie offers another',r.btns.includes('Play again')&&!r.golf,r.last.join(' | '));
if(!r.btns.includes('Play again')){console.log(R.join('\n'));console.log('weak round ended with',JSON.stringify(r).slice(0,600));process.exit(1)}
// leaving the course
r=await p.evaluate(()=>{T.click('Maybe later'); P.x=112;P.y=164;update(16.7); const lbl=prompt.textContent; action(); T.run(40); return {lbl,world:scene===SCENES.world}});
ok('F walk back out to the road',r.lbl==='Head back to the road'&&r.world,r.lbl);
console.log(R.join('\n')); console.log('page errors:',errs.length?errs:'none'); await b.close()})();
