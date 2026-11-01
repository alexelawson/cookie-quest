// Plays through every Fargo path. Run: node tests/fargo-scenarios.js
const {chromium}=require('playwright');const path=require('path');(async()=>{
const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
const URL='file://'+path.resolve(__dirname,'../index.html');
const helpers=()=>{window.T={
  btns:()=>[...$('dbtns').querySelectorAll('button')].map(b=>b.textContent),
  click:t=>{const b=[...$('dbtns').querySelectorAll('button')].find(b=>b.textContent===t); if(!b)throw new Error('no button "'+t+'" in '+T.btns()+' | '+$('dtext').textContent); b.click()},
  pages:()=>{while(T.btns().includes('Next'))T.click('Next')},
  run:(n)=>{for(let i=0;i<n;i++)update(16.7)},
  enter:()=>{P.x=340;P.y=232;update(16.7);action();T.run(40)},
  toLot:i=>{const s=STATIONS[i];P.x=s.lot.x+10;P.y=s.lot.y+22;P.dir='right';update(16.7)},
  walkTo:(x,y,max=600)=>{for(let i=0;i<max;i++){const dx=x-P.x,dy=y-P.y; if(Math.hypot(dx,dy)<2)break; for(const k in dirs)dirs[k]=false;
     if(dx>1)dirs.right=true;if(dx<-1)dirs.left=true;if(dy>1)dirs.down=true;if(dy<-1)dirs.up=true; update(16.7)} for(const k in dirs)dirs[k]=false},
  pick:(d,s)=>{$('fridge').querySelector(`[data-id="${d}"]`).click();$('shelf').querySelector(`[data-id="${s}"]`).click();$('giveBtn').click()},
}};
const fresh=async()=>{await p.goto(URL);await p.evaluate(()=>localStorage.clear());await p.reload();await p.click('#startBtn');await p.evaluate(helpers)};
const R=[];const ok=(n,c,x='')=>R.push((c?'PASS ':'FAIL ')+n+(x?'  ('+x+')':''));
await fresh();

// A. arriving
let r=await p.evaluate(()=>{T.enter(); return {scene:scene===SCENES.fargo, dlg:$('dspeaker').textContent+': '+$('dtext').textContent, fuel:fargo.fuel, hud:$('hud').textContent}});
ok('A drive into Fargo, Alex gives the intro',r.scene&&r.dlg.startsWith('Alex')&&r.dlg.includes('fumes'),r.dlg); ok('A fuel gauge shows',r.hud.includes('Fuel'),r.hud);
await p.evaluate(()=>{T.pages();T.click('Close')});
// B. driving burns fuel; empty -> pushing
r=await p.evaluate(()=>{const f0=fargo.fuel; dirs.right=true; T.run(60); dirs.right=false; const f1=fargo.fuel, x1=P.x;
  fargo.fuel=0.01; dirs.right=true; T.run(5); dirs.right=false; const msg=$('dtext').textContent; T.click('Next'); const alex=$('dspeaker').textContent+': '+$('dtext').textContent; T.click('Close');
  const xa=P.x; dirs.right=true; T.run(30); dirs.right=false; return {burn:f0-f1, msg, alex, push:(P.x-xa)/30, hud:$('hud').textContent}});
ok('B driving uses fuel',r.burn>0,r.burn.toFixed(2)); ok('B running out warns + pushes slowly',r.msg.includes('pushing')&&r.push<0.6,r.push.toFixed(2)+' px/frame, '+r.hud); ok('B Alex reacts',r.alex.startsWith('Alex'),r.alex);
// C. wrong station
r=await p.evaluate(()=>{const w=STATIONS.findIndex((s,i)=>i!==fargo.bob); T.toLot(w); const lbl=prompt.textContent; action();
  const ask=$('dtext').textContent; T.click('Fill up'); const pages=[]; while(true){pages.push($('dtext').textContent); if(!T.btns().includes('Next'))break; T.click('Next')}
  const oldBob=fargo.bob; T.click('Try again'); T.run(40); return {lbl,ask,pages,fuel:fargo.fuel,seen:STATIONS.filter(s=>s.seen).length,cheap:STATIONS[fargo.bob].price}});
ok('C pull into a pricier station',r.lbl==='Pull up to the pump'&&/\$\d\.\d\d a gallon/.test(r.ask),r.ask); ok('C filling there fails with the $2.79 joke',r.pages.join(' ').includes('2.79'));
ok('C try again resets fuel and signs',r.fuel===30&&r.seen===0&&r.cheap==='2.79');
// D. Bob + pump
r=await p.evaluate(()=>{T.toLot(fargo.bob); action(); const hello=$('dtext').textContent; T.pages(); T.click('Fill up'); return {hello,pump:!$('pump').hidden}});
ok('D Bob at the cheapest station',r.hello.includes('found it')); ok('D pump opens',r.pump);
r=await p.evaluate(()=>{pump.cents=2995; pumpPress(); T.run(30); pumpRelease(); const over=pump.cents, msg=$('pumpMsg').textContent; T.run(90); return {over,msg,reset:pump.cents}});
ok('D going over busts and resets',r.over>3000&&r.reset===0,'$'+(r.over/100).toFixed(2)+' -> '+r.msg);
r=await p.evaluate(()=>{const t0=performance.now(); pump.cents=0; pumpPress(); let n=0; while(pump.cents<2950&&n<2000){T.run(1);n++} pumpRelease(); const fast=n*16.7/1000;
  let taps=0; while(pump.cents<3000&&taps<200){pumpPress(); T.run(1); pumpRelease(); taps++} return {fast,taps,cents:pump.cents}});
ok('D a full hold reaches ~$29.50 in a few seconds',r.fast>2&&r.fast<9,r.fast.toFixed(1)+'s'); ok('D single-frame taps land exactly on $30.00',r.cents===3000,r.taps+' taps');
await p.waitForFunction(()=>!dlg.hidden&&$('dspeaker').textContent==='Bob',null,{timeout:8000});
r=await p.evaluate(()=>{const ps=[]; while(true){ps.push($('dtext').textContent); if(!T.btns().includes('Next'))break; T.click('Next')} const line=ps.join(' '); T.click('Go inside'); return {line,onFoot:fargo.onFoot,car:!!fargo.car,alex:!!fargo.alex,stage:have.fargoStage,hud:$('hud').textContent,free:!blocked(P.x,P.y)}});
ok('D exact $30 -> go inside',r.line.includes('co-pilot')&&r.stage==='store'); ok('D you and Alex get out, car parked',r.onFoot&&r.car&&r.alex&&r.free,r.hud);
// E. shop: two wrong picks -> kicked out
r=await p.evaluate(()=>{const g=STATIONS[fargo.bob]; T.walkTo(g.door.x+8,g.door.y+4); const lbl=prompt.textContent; action(); return {lbl,open:!$('shop').hidden,give:$('giveBtn').disabled}});
ok('E walk to the shop door and go in',r.lbl==='Go inside'&&r.open,r.lbl); ok('E give button waits for both picks',r.give);
r=await p.evaluate(()=>{T.pick('coke','motts'); return {line:$('alexLine').textContent,mood:fargo.alexMood,wallet:fargo.wallet,strikes:fargo.strikes}});
ok('E wrong drink: frown, reaction, -$3, strike 1',r.mood==='frown'&&r.line.includes('Coke')&&r.wallet===17&&r.strikes===1,r.line);
r=await p.evaluate(()=>{T.pick('pedialyte','snickers'); return {line:$('alexLine').textContent,strikes:fargo.strikes,wallet:fargo.wallet}});
ok('E both wrong: both reactions, strike 2',r.strikes===2&&r.line.includes('hungover')&&r.line.includes('Nope'),r.line);
await p.waitForFunction(()=>$('shop').hidden,null,{timeout:8000});
r=await p.evaluate(()=>({shop:$('shop').hidden,paused,mood:fargo.alexMood,inLot:hit(R(P.x-4,P.y-3,8,4),STATIONS[fargo.bob].lot),hud:$('hud').textContent}));
ok('E two strikes: sent back outside',r.shop&&!r.paused&&r.inLot,r.hud); ok('E Alex frowning outside',r.mood==='frown');
// F. walk back in and get it right
r=await p.evaluate(()=>{const g=STATIONS[fargo.bob]; T.walkTo(g.door.x+8,g.door.y+4); const lbl=prompt.textContent; action(); if($('shop').hidden)return {strikes:'shop not opened ('+lbl+')'}; const strikes=fargo.strikes; T.pick('gingerale','motts'); return {strikes,line:$('alexLine').textContent,mood:fargo.alexMood}});
ok('F walking back in resets strikes',r.strikes===0,String(r.strikes)); ok('F ginger ale + Motts makes Alex happy',r.mood==='happy'&&r.line.includes('know me'),r.line);
await p.waitForFunction(()=>!dlg.hidden&&T.btns().join().includes('Next'),null,{timeout:8000});
r=await p.evaluate(()=>{const line=$('dtext').textContent; T.pages(); T.click('Thanks, Bob!'); return {line,reward:!$('reward').hidden,name:$('rewardName').textContent,onFoot:fargo.onFoot,stage:have.fargoStage}});
ok('F Bob hands over the sugar',r.reward&&r.name==='Sugar'&&r.stage==='reward',r.line); ok('F back in the car',!r.onFoot);
await p.click('#rewardArt',{force:true}); await p.waitForTimeout(900);
r=await p.evaluate(()=>({fargo:!!have.fargo,basket:$('basket').textContent,paused}));
ok('F sugar goes in the basket',r.fargo&&r.basket.includes('✓ Sugar')&&!r.paused,r.basket);
r=await p.evaluate(()=>{T.toLot(fargo.bob); action(); return $('dtext').textContent}); ok('F Bob after: goodbye line',r.includes('Ride safe'),r);
// G. reload in the middle of the shop errand
await fresh(); await p.evaluate(()=>{have.fargoStage='store'; have.fargoBob=3; save()}); await p.reload(); await p.click('#startBtn'); await p.evaluate(helpers);
r=await p.evaluate(()=>{T.enter(); return {intro:!dlg.hidden,onFoot:fargo.onFoot,bob:fargo.bob,car:fargo.car&&hit(R(fargo.car.x-1,fargo.car.y-1,2,2),STATIONS[3].lot),free:!blocked(P.x,P.y)}});
ok('G reload mid-errand: parked at Bob\'s, on foot, no intro',!r.intro&&r.onFoot&&r.bob===3&&r.car&&r.free);
// H. keyboard at the pump doesn't move you or open dialogs
await fresh(); r=await p.evaluate(()=>{T.enter(); T.pages(); T.click('Close'); T.toLot(fargo.bob); action(); T.pages(); T.click('Fill up'); return {x:P.x,y:P.y}});
await p.keyboard.down('Space'); await p.waitForTimeout(400); await p.keyboard.up('Space'); await p.keyboard.press('ArrowLeft');
r=await p.evaluate(o=>({cents:pump.cents,moved:P.x!==o.x||P.y!==o.y,dlg:dlg.hidden}),r);
ok('H holding Space pumps; arrows ignored',r.cents>0&&!r.moved&&r.dlg,'$'+(r.cents/100).toFixed(2));
// I. at every station: from where you get out, from where you get kicked out, and from the road, the door is reachable on foot
r=await p.evaluate(()=>{const sc=SCENES.fargo, bad=[];
  const reach=(sx,sy,door)=>{const seen=new Set(), q=[[Math.round(sx),Math.round(sy)]];
    while(q.length){const [x,y]=q.shift(); if(hit(R(x-4,y-3,8,4),door))return true; for(const [dx,dy] of [[2,0],[-2,0],[0,2],[0,-2]]){const nx=x+dx,ny=y+dy,k=nx+','+ny; if(seen.has(k)||blocked(nx,ny,sc))continue; seen.add(k); if(seen.size<6000)q.push([nx,ny])}} return false};
  for(let gi=0;gi<STATIONS.length;gi++){fargo.bob=gi; fargo.onFoot=false; fargo.car=null; T.toLot(gi); have.fargoStage='store'; parkAndGetOut();
    const g=STATIONS[gi], out=freeSpotNear(g.x+9, g.face==='up'?g.y+22:g.y+6), road={x:g.x+24,y:g.face==='up'?g.y-12:g.y+40};
    if(blocked(P.x,P.y,sc))bad.push(gi+': you are stuck after getting out');
    if(fargo.alex&&blocked(fargo.alex.x,fargo.alex.y,{...sc,solids:sc.baseSolids,bounds:sc.bounds}))bad.push(gi+': Alex inside something');
    if(!reach(P.x,P.y,g.door))bad.push(gi+': door unreachable after getting out');
    if(!reach(out.x,out.y,g.door))bad.push(gi+': door unreachable after kicked out');
    if(!reach(road.x,road.y,g.door))bad.push(gi+': door unreachable from the road');
    backInTheCar()}
  have.fargoStage=undefined; return bad});
ok('I door reachable on foot at every station (get out / kicked out / from road)',r.length===0,r.join('; '));
r=await p.evaluate(()=>{const c={}; for(let i=0;i<300;i++){fargoNewRun(); c[fargo.bob]=(c[fargo.bob]||0)+1} return c});
ok('J Bob is never at the station right by the start, and moves around',!r[2]&&Object.keys(r).length===5,JSON.stringify(r));
r=await p.evaluate(()=>({n:EXIT_SIGNS.length, onRoad:EXIT_SIGNS.some(e=>ROADS.some(rd=>hit(R(e.x,e.y,26,18),rd))), signs:STATIONS.map(s=>s.signText), bob:STATIONS[fargo.bob].signText}));
ok('K EXIT signs point the way out (none on the road), and every shop has a name sign',r.n>=3&&!r.onRoad&&r.signs.every(Boolean)&&r.bob==="BOB'S GAS",JSON.stringify(r));
console.log(R.join('\n')); console.log('page errors:',errs.length?errs:'none'); await b.close()})();
