// Plays the Vikings Birkie (the lane runner). Run: node tests/birkie-scenarios.js
const {chromium}=require('playwright');const path=require('path');const fs=require('fs');(async()=>{
const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
const URL='file://'+path.resolve(__dirname,'../index.html');
const BOT=fs.readFileSync(path.join(__dirname,'birkie-difficulty.js'),'utf8').match(/window\.birkBot=[\s\S]*?\} \} \};/)[0];   // the same skier the simulator uses
const helpers=()=>{window.T={
  btns:()=>[...$('dbtns').querySelectorAll('button')].map(b=>b.textContent),
  click:t=>[...$('dbtns').querySelectorAll('button')].find(b=>b.textContent===t).click(),
  through:()=>{const seen=[]; for(let i=0;i<30&&!dlg.hidden&&!T.btns().includes('Try again');i++){seen.push($('dspeaker').textContent+': '+$('dtext').textContent); [...$('dbtns').querySelectorAll('button')][0].click()} return seen},
  run:n=>{for(let i=0;i<n;i++)update(16.7)},
  tap:k=>{dirs[k]=true; update(16.7); dirs[k]=false; update(16.7)},
  // put Joe just above a spot on the course, in a lane, at speed, with nothing else going on
  setup:(y,lane)=>{birk.lane=lane; birk.lx=lane*BIRK.LANE*laneScale(y); P.y=y; P.x=trailX(y)+birk.lx; birk.v=.06; birk.jumpD=0; birk.crashT=0; birk.drink=null; birk.energy=80; birk.msg=''; birk.hit=new Set(OBSTACLES.filter(o=>o!==T.only)); birk.said={feedAhead820:1,feedAhead1500:1,feedAhead2390:1}},   // only T.only counts (if set)
  ski:(miss=0,max=40000)=>{const bot=birkBot(miss); let f=0; while(birk.running&&f++<max){bot(); update(16.7); if(!dlg.hidden&&birk.running)T.through()} return f},
}};
const fresh=async()=>{await p.goto(URL);await p.evaluate(()=>localStorage.clear());await p.reload();await p.click('#startBtn'); await p.evaluate(()=>skipWelcome());await p.evaluate(helpers); await p.addScriptTag({content:BOT})};
const R=[];const ok=(n,c,x='')=>R.push((c?'PASS ':'FAIL ')+n+(x?'  ('+x+')':''));
const start=()=>p.evaluate(()=>{P.x=320;P.y=84;update(16.7); action(); while(T.btns().includes('Next'))T.click('Next'); T.click('Head to the start line'); T.run(45); const card=$('howTitle').textContent, steps=$('howControls').textContent; $('howOk').click(); const hello=T.through(); T.run(2); return {card,steps,hello}});
await fresh();
let r=await p.evaluate(()=>{P.x=320;P.y=84;update(16.7); const lbl=prompt.textContent; action(); const sp=$('dspeaker').textContent; const pages=[]; while(T.btns().includes('Next')){pages.push($('dtext').textContent);T.click('Next')} closeDialog(); return {lbl,sp,pages}});
ok('A John explains: Vikings carry the flour, Birkie-style',r.lbl==='Talk to John'&&r.sp==='John'&&r.pages.join(' ').includes('Vikings'),r.pages[2]);
r=await start(); const r2=await p.evaluate(()=>({running:birk.running,scene:scene===SCENES.birkie,label:$('alabel').textContent,hud:$('hud').textContent}));
ok('A how-to card (lanes, jumping, packs, feed cups), then the race starts',r.card==='The Birkie'&&/lane/i.test(r.steps)&&/jump/i.test(r.steps)&&/spill/i.test(r.steps)&&r2.running&&r2.scene,r2.hud);
ok('A the A button says Jump; no more rhythm meter',r2.label==='Jump'&&!/Rhythm/.test(r2.hud)&&/Energy/.test(r2.hud),r2.label+' | '+r2.hud);
// B. lanes
r=await p.evaluate(()=>{T.only=null; T.setup(300,0); T.tap('right'); const a=birk.lane; dirs.right=true; T.run(20); const held=birk.lane; dirs.right=false; T.run(1); T.tap('right'); const clamp=birk.lane; T.tap('left'); T.tap('left'); const b=birk.lane; T.run(30); const off=P.x-trailX(P.y); return {a,held,clamp,b,off}});
ok('B a tap changes one lane; holding the key doesn\'t keep switching; three lanes, no further',r.a===1&&r.held===1&&r.clamp===1&&r.b===-1&&r.off<-12,JSON.stringify(r));
// C. fallen skiers: jump them, or crash
r=await p.evaluate(()=>{const o=OBSTACLES.find(o=>o.kind==='fallen'); T.only=o; T.setup(o.y-30,o.lanes[0]); let crashed=false; for(let i=0;i<60;i++){ if(o.y-P.y<BIRK.JUMP_LEN*.6&&birk.jumpD===0&&P.y<o.y)birkJump(); update(16.7); if(birk.crashT>0)crashed=true} const jumped=!crashed&&P.y>o.y;
  T.setup(o.y-30,o.lanes[0]); let msg=''; for(let i=0;i<40&&!msg;i++){update(16.7); if(birk.crashT>0)msg=birk.msg} const y=P.y; T.run(30); const stuck=Math.abs(P.y-y)<.5; T.run(120); return {jumped,msg,stuck,moved:P.y>y+5,known:BIRKIE.crash.includes(msg)}});
ok('C jump a fallen skier and you sail over (the Vikings hop too)',r.jumped);
ok('C ski into one: crash, a short pause, then you go again',r.known&&r.stuck&&r.moved,r.msg);
// D. packs: go around (jumping doesn't help)
r=await p.evaluate(()=>{const o=OBSTACLES.find(o=>o.kind==='pack'); T.only=o; const free=[-1,0,1].find(l=>!o.lanes.includes(l));
  T.setup(o.y-20,o.lanes[0]); birkJump(); let hitWhileJumping=false; for(let i=0;i<30;i++){update(16.7); if(birk.crashT>0)hitWhileJumping=true}
  const msg=birk.msg; T.setup(o.y-20,free); let clean=true; for(let i=0;i<30;i++){update(16.7); if(birk.crashT>0)clean=false} return {hitWhileJumping,msg,clean,known:BIRKIE.packCrash.includes(msg)}});
ok('D a pack of slow skiers: jumping won\'t clear it, going around will',r.hitWhileJumping&&r.known&&r.clean,r.msg);
// E. feed stations: grab the cup, hold steady, don't spill
r=await p.evaluate(()=>{const f=FEEDS[0], out={}; f.cup2=f.cup;   // hold the cup still for these
  f.used=false; T.setup(f.y-4,f.cup); birk.energy=30; T.run(10); out.grab=birk.msg; out.drinking=!!birk.drink; T.run(Math.ceil(BIRK.DRINK_MS/16.7)+5); out.full=birk.energy; out.done=birk.msg;
  f.used=false; T.setup(f.y-4,f.cup); birk.energy=30; T.run(10); T.tap(f.cup===1?'left':'right'); out.spill=birk.msg; out.after=birk.energy; out.gone=!birk.drink;
  f.used=false; T.setup(f.y-4,f.cup); birk.energy=30; T.run(10); birkJump(); out.spillJump=birk.msg;
  f.used=false; T.setup(f.y-4,f.cup===0?1:0); birk.energy=30; T.run(10); out.missed=birk.msg; out.missE=birk.energy; out.grabLine=BIRKIE.grab; out.spills=BIRKIE.spill; return out});
ok('E ski into the cup\'s lane: grab it, hold steady, energy full',r.grab===r.grabLine&&r.drinking&&r.full>99&&r.done.includes('Flat Coke'),JSON.stringify(r).slice(0,300));
ok('E change lanes (or jump) while drinking and it spills: just a sip',r.spills.includes(r.spill)&&r.gone&&r.after<60&&r.spills.includes(r.spillJump),r.spill);
ok('E wrong lane: you miss the cup',r.missed.includes('Missed')&&r.missE<35,r.missed);
// F. energy
r=await p.evaluate(()=>{T.only=null; T.setup(500,0); birk.energy=100; birk.v=.03; T.run(200); const vFull=birk.v, eAfter=birk.energy; T.setup(500,0); birk.energy=0; birk.v=.03; T.run(200); return {vFull,eAfter,vEmpty:birk.v}});
ok('F energy drains as you go, and running on empty is slow',r.eAfter<100&&r.vEmpty<r.vFull*.8,`${r.vFull.toFixed(3)} vs ${r.vEmpty.toFixed(3)}`);
// G. the course is always passable
r=await p.evaluate(()=>{const bad=OBSTACLES.filter(o=>o.lanes.length>=3||(o.y>BRIDGE.y0-40&&o.y<BRIDGE.y1+40)||FEEDS.some(f=>Math.abs(o.y-f.y)<60)); return {bad:bad.length,n:OBSTACLES.length,packs:OBSTACLES.filter(o=>o.kind==='pack').length,bridge:laneX(2450,1)-laneX(2450,0),trail:laneX(1000,1)-laneX(1000,0),order:sectionAt(2200).type==='lake'&&sectionAt(2450).bridge&&sectionAt(2560).type==='finish'}});
ok('G every obstacle leaves a way through; none on the bridge or at a feed; lanes squeeze on the bridge',!r.bad&&r.n>12&&r.packs>2&&r.bridge<r.trail,JSON.stringify(r));
ok('G the finish: across the lake, over the International Bridge, then Main Street',r.order);
r=await p.evaluate(()=>{T.only=null; T.setup(2200,0); birk.gustT=1; birk.said.gust=0; for(let i=0;i<5;i++)update(16.7); const warned=!!birk.gust, dir=birk.gust&&birk.gust.dir; for(let i=0;i<60;i++)update(16.7); return {warned,dir,lane:birk.lane,msg:birk.msg}});
ok('G on the lake a gust is coming (blowing snow), then it shoves you a lane',r.warned&&r.lane===r.dir,JSON.stringify(r));
r=await p.evaluate(()=>({names:BIRK_SECTIONS.map(s=>s.name).join('|'),kinds:VIKING_KINDS.map(v=>v.kind).join(',')}));
ok('G real landmarks: Firetower, Mosquito Brook, Highway OO, "That" hill, Hatchery; Norse and football Vikings',/Firetower/.test(r.names)&&/Mosquito/.test(r.names)&&/OO/.test(r.names)&&/Hatchery/.test(r.names)&&r.kinds==='norse,football,norse,football',r.names);
// K. the feed cup swings between two lanes; John and the Vikings talk in a pop-up like the rest of the game
r=await p.evaluate(()=>{const f=FEEDS[1]; const lanes=new Set(); for(let t=0;t<BIRK.CUP_SWING*4;t+=100)lanes.add(cupLane(f,t));
  T.only=null; T.setup(600,0); birkSay('Test from John'); draw(); const john=!$('radio').hidden&&$('radioWho').textContent.startsWith('John')&&$('radioText').textContent==='Test from John';
  birk.t=0; birk.said={}; for(let y=0;y<3000;y+=400)birk.said['sweep'+Math.floor(y/400)]=1; birk.msgT=0; birk.vikingT=1; T.run(2); draw(); const vik=!$('radio').hidden&&/Viking/.test($('radioWho').textContent), line=$('radioText').textContent;
  const all=[...Object.values(BIRKIE.vikings).flat(),...Object.values(BIRKIE.footballVikings).flat()].includes(line); return {two:lanes.size===2,john,vik,line,all,fc:BIRKIE.vikings.feed.some(l=>/Flat Coke/.test(l))}});
ok('K the volunteer swings the cup between two lanes',r.two);
ok('K John\'s radio messages show in a pop-up with his face and name',r.john);
ok('K the Vikings pipe up too (including about the flat Coke)',r.vik&&r.all&&r.fc,r.line);
// H. lose: never dodging, the sweep catches you
await fresh(); await start();
r=await p.evaluate(()=>{T.ski(1); return {lines:T.through(),btns:T.btns(),done:!!have.birkie}});
ok('H never dodging anything: the sweep catches you, try again offered',r.lines.join().includes('sweep')&&r.btns.includes('Try again')&&!r.done,r.lines[0]);
// I. win: a decent skier finishes, John hands over the flour right away
r=await p.evaluate(()=>{T.click('Try again'); T.ski(.1); const lines=T.through(); return {lines,done:!!have.birkie,time:have.birkieTime,reward:!$('reward').hidden,name:$('rewardName').textContent}});
ok('I a decent skier makes the cutoff; Vikings celebrate; Alex cheers at the line',r.done&&r.lines.join().includes('SKOL')&&r.lines.some(l=>l.startsWith('Alex:'))&&r.lines.filter(l=>!l.startsWith('Alex:')).every(l=>l.startsWith('John:')),r.time+' | '+r.lines[0]);
ok('I John hands over the flour right at the finish',r.reward&&r.name==='Flour');
await p.click('#rewardArt',{force:true}); await p.waitForTimeout(900);
r=await p.evaluate(()=>{const ks=()=>{const l=[];for(let i=0;i<15&&!dlg.hidden&&!l.join().includes('Settings');i++){l.push($('dspeaker').textContent+': '+$('dtext').textContent);const b=T.btns();T.click(b.includes('Next')?'Next':b[0])}if(!$('itemCard').hidden){l.push('CARD: '+$('itemName').textContent+' | '+$('itemLine').textContent+' '+$('itemTip').textContent); $('itemBtn').click()} return {l,gear:Object.keys(have.gear||{}).join()}};window.K=ks(); T.run(45); return {k:K,mill:!!have.mill,world:scene===SCENES.world,got:!!$('basket').querySelector('[data-key="mill"].got')}});
ok('I flour in the basket, back at the trailhead',r.mill&&r.world&&r.got);
ok('I a football Viking hands Joe the #18 jersey',r.k.l.some(l=>l.startsWith('Football Viking:')&&l.includes('18'))&&r.k.gear.includes('jersey'),r.k.l.join(' | '));
// J. phone: swipe to change lanes, tap to jump
await fresh(); await start();
r=await p.evaluate(()=>{T.setup(300,0); const c=$('game'), ev=(t,x,y)=>c.dispatchEvent(new PointerEvent(t,{clientX:x,clientY:y,bubbles:true}));
  ev('pointerdown',200,300); ev('pointerup',260,305); const swipe=birk.lane; ev('pointerdown',200,300); ev('pointerup',201,300); const tap=birk.jumpD>0; return {swipe,tap}});
ok('J on a phone: swipe right changes lane, a tap jumps',r.swipe===1&&r.tap,JSON.stringify(r));
console.log(R.join('\n')); console.log('page errors:',errs.length?errs:'none'); await b.close()})();
