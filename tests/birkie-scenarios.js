// Plays the Vikings Birkie. Run: node tests/birkie-scenarios.js
const {chromium}=require('playwright');const path=require('path');(async()=>{
const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
const URL='file://'+path.resolve(__dirname,'../index.html');
const helpers=()=>{window.T={
  btns:()=>[...$('dbtns').querySelectorAll('button')].map(b=>b.textContent),
  click:t=>[...$('dbtns').querySelectorAll('button')].find(b=>b.textContent===t).click(),
  through:()=>{const seen=[]; for(let i=0;i<30&&!dlg.hidden&&!T.btns().includes('Try again');i++){seen.push($('dspeaker').textContent+': '+$('dtext').textContent); [...$('dbtns').querySelectorAll('button')][0].click()} return seen},
  run:n=>{for(let i=0;i<n;i++)update(16.7)},
  // a decent skier: steers down the trail around fallen skiers, tucks downhill, poles on the beat
  ski:(maxFrames=20000,pole=true)=>{let next=null,f=0; while(birk.running&&f++<maxFrames){ let tx=trailX(P.y+20); for(const s of FALLEN)if(s.y>P.y&&s.y-P.y<40&&Math.abs(s.x-tx)<12)tx=s.x+(s.x<trailX(s.y)?14:-14);
      for(const k in dirs)dirs[k]=false; if(tx-P.x>1.5)dirs.right=true; if(tx-P.x<-1.5)dirs.left=true; if(terrainAt(P.y)==='down')dirs.down=true;
      const can=pole&&terrainAt(P.y)!=='down'&&birk.stamina>12; if(can&&next===null){let tb=BIRK.BEAT-birk.beatT%BIRK.BEAT; if(tb<BIRK.BEAT*.25)tb+=BIRK.BEAT; next=birk.t+tb} if(next!==null&&birk.t>=next){if(can)birkTap(); next=null}
      update(16.7); if(!dlg.hidden&&birk.running)T.through() } for(const k in dirs)dirs[k]=false; return f},
}};
const fresh=async()=>{await p.goto(URL);await p.evaluate(()=>localStorage.clear());await p.reload();await p.click('#startBtn'); await p.evaluate(()=>skipWelcome());await p.evaluate(helpers)};
const R=[];const ok=(n,c,x='')=>R.push((c?'PASS ':'FAIL ')+n+(x?'  ('+x+')':''));
await fresh();
let r=await p.evaluate(()=>{P.x=320;P.y=84;update(16.7); const lbl=prompt.textContent; action(); const sp=$('dspeaker').textContent; const pages=[]; while(T.btns().includes('Next')){pages.push($('dtext').textContent);T.click('Next')} pages.push($('dtext').textContent);
  const btns=T.btns(); T.click('Head to the start line'); T.run(45); const card=!$('howto').hidden&&$('howTitle').textContent; $('howOk').click(); const hello=T.through(); T.run(2);
  return {lbl,sp,pages,btns,card,hello,running:birk.running,scene:scene===SCENES.birkie,label:$('alabel').textContent,hud:$('hud').textContent}});
ok('A John explains: Vikings carry the flour, Birkie-style',r.lbl==='Talk to John'&&r.sp==='John'&&r.pages.join(' ').includes('Vikings'),r.pages[2]);
ok('A how-to card, then the Vikings, then the race starts',r.scene&&r.card==='The Birkie'&&r.hello.join().includes('Vikings')&&r.running,r.hud);
ok('A the A button says Pole',r.label.startsWith('Pole'),r.label);
// mechanics
r=await p.evaluate(()=>{const q0=birk.q; birk.beatT=Math.round(BIRK.BEAT*10); birkTap(); const good=birk.flash, q1=birk.q; birk.beatT=Math.round(BIRK.BEAT*10.5); birkTap(); const miss=birk.flash, q2=birk.q; return {q0,q1,q2,good,miss}});
ok('B on-beat taps build rhythm, off-beat taps knock it down',r.good==='good'&&r.q1>r.q0&&r.miss==='miss'&&r.q2<r.q1,JSON.stringify(r));
r=await p.evaluate(()=>{const f=FALLEN[0]; P.x=f.x; P.y=f.y-5; birk.v=.06; update(16.7); const c=birk.crashT>0, msg=birk.msg; const y=P.y; T.run(20); const stuck=Math.abs(P.y-y)<.5; T.run(80); return {c,msg,stuck,moved:P.y>y+1,known:BIRKIE.crash.includes(msg)}});
ok('B skiing into a fallen skier: crash, short pause, then you go again',r.c&&r.stuck&&r.moved&&r.known,r.msg);
r=await p.evaluate(()=>{birk.stamina=5; P.x=trailX(FEEDS[0].y); P.y=FEEDS[0].y-10; update(16.7); return {st:birk.stamina,msg:birk.msg}});
ok('B a feed station fills your energy back up',r.st===100&&r.msg.includes('Flat Coke'),r.msg);
r=await p.evaluate(()=>{const y=1265; P.x=trailX(y)+60; P.y=y; birk.v=.06; birk.q=1; T.run(60); const offV=birk.v; P.x=trailX(P.y); T.run(60); return {offV,onV:birk.v}});
ok('B deep snow off the trail is slow',r.offV<.03&&r.onV>r.offV,`${r.offV.toFixed(3)} vs ${r.onV.toFixed(3)}`);
// lose: never poling, the sweep catches you
await fresh(); r=await p.evaluate(()=>{P.x=320;P.y=84;update(16.7);action(); while(T.btns().includes('Next'))T.click('Next'); T.click('Head to the start line'); T.run(45); $('howOk').click(); T.through();
  T.ski(30000,false); const lines=T.through(); return {lines,btns:T.btns(),done:!!have.birkie}});
ok('C no poling: the sweep snowmobile catches you, try again offered',r.lines.join().includes('sweep')&&r.lines.every(l=>l.startsWith('John:'))&&r.btns.includes('Try again')&&!r.done,r.lines[0]);
// win: decent rhythm finishes, back at the trailhead, flour from John
r=await p.evaluate(()=>{T.click('Try again'); T.ski(); const lines=T.through(); return {lines,done:!!have.birkie,time:have.birkieTime,reward:!$('reward').hidden,name:$('rewardName').textContent}});
ok('D good rhythm makes the cutoff; Vikings celebrate',r.done&&r.lines.join().includes('SKOL')&&r.lines.every(l=>l.startsWith('John:')),r.time+' | '+r.lines[0]);
ok('D John hands over the flour right at the finish (no need to talk to him again)',r.reward&&r.name==='Flour',r.lines.slice(-1)[0]);
await p.click('#rewardArt',{force:true}); await p.waitForTimeout(900);
r=await p.evaluate(()=>{T.run(45); return {mill:!!have.mill,basket:$('basket').textContent,world:scene===SCENES.world}}); ok('D flour in the basket, back at the trailhead',r.mill&&r.world&&r.basket.includes('✓ Flour'),r.basket);
await fresh(); r=await p.evaluate(()=>{P.x=320;P.y=84;update(16.7);action(); while(T.btns().includes('Next'))T.click('Next'); T.click('Head to the start line'); T.run(45); $('howOk').click(); T.through(); const s0=sweepY(); birk.t=(BIRK.CUTOFF/2)*1000/BIRK.CLOCK; const mid=sweepY(); P.y=mid+40; P.x=trailX(P.y); update(16.7); const warn=birk.msg, still=birk.running; P.y=mid-1; update(16.7); return {s0,mid,warn:warn===BIRKIE.sweepClose,still,caught:!birk.running}});
ok('F the sweep starts behind you, warns you when close, and catches you if it reaches you',r.s0===0&&r.still&&r.warn&&r.caught,JSON.stringify(r));
// the course: you can't fall off the edge of the world; the bridge is narrow; Main Street is wide
r=await p.evaluate(()=>({bridge:trailHalf(2180),trail:trailHalf(1000),main:trailHalf(2600),bobble:trailX(1200)<trailX(1000)}));
ok('E the bridge is narrow, Main Street is wide, Bobblehead turns left',r.bridge<r.trail&&r.main>r.trail&&r.bobble,JSON.stringify(r));
console.log(R.join('\n')); console.log('page errors:',errs.length?errs:'none'); await b.close()})();
