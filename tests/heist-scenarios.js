// Plays through the chocolate heist. Run: node tests/heist-scenarios.js
// The hard parts (searchlights, laser maze) are played by the bots in heist-bots.js.
const {chromium}=require('playwright');const path=require('path');(async()=>{
const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
const URL='file://'+path.resolve(__dirname,'../index.html');
const helpers=()=>{window.T={
  btns:()=>[...$('dbtns').querySelectorAll('button')].map(b=>b.textContent),
  clickThrough:()=>{const seen=[]; for(let i=0;i<30&&!dlg.hidden;i++){seen.push($('dspeaker').textContent+': '+$('dtext').textContent); [...$('dbtns').querySelectorAll('button')][0].click()} return seen},
  run:n=>{for(let i=0;i<n;i++)update(16.7)},
  // walk the current leader to (x,y); stops if a dialog opens (e.g. caught)
  walkTo:(x,y,max=900)=>{for(let i=0;i<max;i++){if(!dlg.hidden){if($('dspeaker').textContent==='Spotted!')return 'dialog'; T.hints.push(T.clickThrough().join(' / ')); continue} const dx=x-P.x,dy=y-P.y; if(Math.hypot(dx,dy)<1.5)break;
     for(const k in dirs)dirs[k]=false; if(dx>1)dirs.right=true;if(dx<-1)dirs.left=true;if(dy>1)dirs.down=true;if(dy<-1)dirs.up=true; update(16.7)}
     for(const k in dirs)dirs[k]=false; return Math.hypot(x-P.x,y-P.y)<3?'ok':'stuck at '+(P.x|0)+','+(P.y|0)},
  path:(pts)=>{for(const [x,y] of pts){const r=T.walkTo(x,y); if(r!=='ok')return r} return 'ok'},
  hints:[],
  enter:()=>{P.x=134;P.y=244;update(16.7);action(); if(!$('wardrobe').hidden)$('wardGo').click(); for(let i=0;i<200&&(scene!==SCENES.city||fade.next);i++)update(16.7); T.run(5)},
}};
const BOTS=require('fs').readFileSync(path.join(__dirname,'heist-bots.js'),'utf8').split('if(typeof module')[0];
const fresh=async()=>{await p.goto(URL);await p.evaluate(()=>localStorage.clear());await p.reload();await p.click('#startBtn'); await p.evaluate(()=>skipWelcome());await p.evaluate(helpers); await p.addScriptTag({content:BOTS})};
const R=[];const ok=(n,c,x='')=>R.push((c?'PASS ':'FAIL ')+n+(x?'  ('+x+')':''));
await fresh();

// A. the log blocks the way to Dr. Alex: only John can lift it, then he carries it and follows you
let r=await p.evaluate(()=>{T.enter(); const auto=!dlg.hidden&&$('dspeaker').textContent==='Dr. Alex'; T.clickThrough(); T.hints=[];
  const blockedW=T.walkTo(58,100,400), stuckY=Math.round(P.y), hint=T.hints.join(' / ');
  const look=lbl=>{T.walkTo(58,132); update(16.7); const l=prompt.textContent; action(); const menu=T.btns(); [...$('dbtns').querySelectorAll('button')].find(b=>b.textContent==='Lift it').click(); return {l,menu,said:T.clickThrough().join(' / ')}};
  const joe=look(), lars=(switchTo(1),look()), john=(switchTo(2),look());
  const carrying=!!heist.carry; switchTo(0); const switched=heist.lead===0;
  const w=T.path([[58,100],[46,78]]); const J=heist.crew.find(c=>c.id==='john'), johnNear=Math.hypot(J.x-P.x,J.y-P.y)<40;
  update(16.7); const lbl=prompt.textContent; action(); const face=!$('dportrait').hidden; const lines=T.clickThrough(); const how=!$('howto').hidden, rows=$('howRows').children.length, ctl=$('howControls').textContent, sel=$('howTitle').textContent+'|'+$('howOk').textContent+'|'+[...$('howRows').children].map(r=>r.querySelector('i').textContent).join(','), onOne=$('howRows').querySelectorAll('.on').length; $('howRows').children[0].click(); $('howOk').click(); update(16.7); T.walkTo(58,100);
  return {auto,blockedW,stuckY,hint,joe,lars,john,carrying,switched,w,johnNear,lbl,face,lines,how,rows,ctl,sel,onOne,lead:heist.lead,banner:$('roundTitle').textContent,bar:!$('crewbar').hidden,hud:$('hud').textContent,lab:$('alabel').textContent}});
ok('A no briefing pops up on its own',!r.auto);
ok('A the log blocks the way to Dr. Alex; John says so',r.blockedW!=='ok'&&r.stuckY>125&&r.hint.includes('blocking'),r.blockedW+' | '+r.hint);
ok('A the log: Lift it / Leave it',r.joe.l==='Look at the log'&&r.joe.menu.join()==='Lift it,Leave it',r.joe.menu.join(' | '));
ok('A Joe and Lars can\'t lift it; John can',r.joe.said.includes('Step aside Joe')&&r.lars.said.includes('forklift')&&r.john.said.includes('right behind you')&&r.carrying,r.john.said);
ok('A John keeps carrying the log; you can switch back and walk to Dr. Alex with him following',r.switched&&r.w==='ok'&&r.johnNear,r.w);
ok('A walk up to Dr. Alex (Alex as a mad scientist) and she briefs the crew',r.lbl==='Talk to Dr. Alex'&&r.face&&r.lines[0].startsWith('Dr. Alex')&&r.lines.join().includes('formula')&&r.lines.some(l=>l.startsWith('John'))&&r.lines.some(l=>l.startsWith('Lars')),r.lines.length+' lines');
ok('A agent select: 3 agents with roles + powers + controls, LOCK IN',r.how&&r.rows===3&&r.ctl.includes('Space')&&r.ctl.includes('press F')&&r.sel==='Agent select|LOCK IN|Initiator,Duelist,Sentinel'&&r.onOne===1&&r.lead===0,r.sel);
ok('A Dr. Alex hands Joe the defuser',r.lines.join().includes('defuser'));
ok('A crew bar + objective + skill label',r.bar&&r.hud.includes('Bridge')&&r.lab==='Sonar',r.hud+' / '+r.lab);
// B. the gap: Lars tries the long jump (and finds ice cream), then John lays the log across
r=await p.evaluate(()=>{T.hints=[]; const w=T.walkTo(98,102); update(16.7); const lbl=prompt.textContent; action(); const menu=T.btns();
  [...$('dbtns').querySelectorAll('button')].find(b=>b.textContent==='Lars: long-jump it').click(); const cut1=T.clickThrough(); const L=heist.crew.find(c=>c.id==='lars'); let maxX=0, air=0, annoyed=false;
  for(let i=0;i<300;i++){SCENES.city.ambient(16.7); maxX=Math.max(maxX,L.x); air=Math.max(air,(heist.jump&&heist.jump.air)||0); annoyed=annoyed||heist.annoyT>0} const landed=Math.round(L.x); const cut=[...cut1,'JUMP '+Math.round(maxX)+' air '+Math.round(air)+' land '+landed+' annoyed '+annoyed,...T.clickThrough()].join(' / '); const ice=!$('reward').hidden&&$('rewardName').textContent; if(ice)collectReward();
  return {w,hint:T.hints.join(' / '),lbl,menu,cut,ice,st1:have.heistStage||0}});
await p.waitForTimeout(1000);
ok('B John points out the gap',r.hint.includes('gap'),r.hint);
ok('B at the gap: Lars / the log / not yet',r.w==='ok'&&r.lbl==='Cross the gap'&&r.menu.join()==='Lars: long-jump it,John: lay the log across,Not yet',r.lbl+' | '+r.menu.join(' | '));
ok('B Lars really runs and jumps, boings back, John is annoyed',r.cut.includes('Headwind')&&/JUMP 12\d air 1\d land 112 annoyed true/.test(r.cut)&&!r.st1,r.cut);
ok('B ...and Lars lands next to a pint of Rosemary Maple ice cream',r.ice==='Rosemary Maple ice cream'&&r.cut.includes('Rosemary Maple'),r.ice);
r=await p.evaluate(()=>{T.clickThrough(); paused=false; T.walkTo(98,102); update(16.7); action(); [...$('dbtns').querySelectorAll('button')].find(b=>b.textContent==='John: lay the log across').click(); const done=T.clickThrough()[0]; return {done,st:have.heistStage,carrying:!!heist.carry}}); await p.evaluate(()=>T.clickThrough());
ok('B John lays the log across the gap',r.st===1&&!r.carrying&&r.done.includes('Log bridge'),r.done);
r=await p.evaluate(()=>{const seen=new Set(); for(let i=0;i<300;i++){if(!$('roundBanner').hidden)seen.add($('roundTitle').textContent); update(16.7)} return [...seen]});
ok('B ROUND WON, then ROUND 2',r.includes('ROUND WON')&&r.includes('ROUND 2'),r.join(', '));
r=await p.evaluate(()=>{T.hints=[]; const w=T.path([[110,102],[170,102]]); return {w,hint:T.hints,x:P.x}});
ok('B the crew crosses the log to roof B',r.w==='ok',r.w); ok('B Lars calls the searchlights',r.hint.join().includes('Searchlights')&&r.hint.join().includes('signal'),r.hint[0]);
// C. searchlights
r=await p.evaluate(()=>{switchTo(0); const w=T.walkTo(304,100); const msg=dlg.hidden?'':$('dtext').textContent; T.clickThrough(); return {w,msg,back:Math.round(P.x)+','+Math.round(P.y)}});
ok('C walking into the lights gets you caught and reset',r.w==='dialog'&&r.msg.includes('searchlight'),r.msg+' -> '+r.back);
r=await p.evaluate(()=>{const L=LIGHTS[0], l=lightPos(L); const c=heist.crew[2]; const keep={x:c.x,y:c.y};
  c.x=l.x+LIGHT_R+1; c.y=l.y+7; const edge=checkHazards(); c.x=l.x; c.y=l.y+7; const center=checkHazards();
  const o=COVERS[0]; c.x=o.x-3; c.y=o.y+5; const sp=LIGHTS.map(L=>({...L})); LIGHTS.forEach(L=>{L.kind='sweep';L.x=c.x;L.speed=0;L.phase=Math.asin(Math.max(-1,Math.min(1,((c.y-7-ROOF_B.y-LIGHT_R)/(ROOF_B.h-LIGHT_R*2))*2-1)))}); const cover=checkHazards(); LIGHTS.forEach((L,i)=>Object.assign(L,sp[i]));
  c.x=keep.x; c.y=keep.y; return {edge:!!edge, center:center&&center.who, cover:!!cover}});
ok('C just outside a light is safe; inside it isn\'t (and it says who); in the shadow of cover the light can\'t see you',!r.edge&&r.center==='john'&&!r.cover,JSON.stringify(r));
r=await p.evaluate(()=>{const s0=SCENES.city.speed(); switchTo(1); const s1=SCENES.city.speed(); switchTo(0); return {you:s0,lars:s1}});
ok('C Lars walks faster than everyone',r.lars>r.you,`${r.you} vs ${r.lars}`);
r=await p.evaluate(()=>{let n=0; for(let k=0;k<10;k++){have.heistStage=1; placeAtCheckpoint(); switchTo(1); time+=7919; if(heistBots.naive().ok)n++; T.clickThrough()} return n});
ok('C walking straight to the switch (no cover, no timing) basically never works',r<=1,r+'/10 made it');
r=await p.evaluate(()=>{have.heistStage=1; placeAtCheckpoint(); switchTo(0); if(heist.follow)toggleFollow(); switchTo(1); const res=heistBots.lights(); const said=T.clickThrough();
  return {res,said,st:have.heistStage,others:heist.crew.filter(c=>c.id!=='lars').map(c=>(c.x|0)+','+(c.y|0))}});
ok('C crew holds while Lars dashes shadow to shadow and flips the switch: 20 seconds of dark',r.res.ok&&r.st===1&&r.said.join().includes('Twenty seconds'),JSON.stringify(r.res)+' '+(r.said.join(' / ')||''));
// C2. the lights come back on if you're too slow; Lars can flip it again
r=await p.evaluate(()=>{const hud=$('hud').textContent; const off=!lightsOn(); heist.lightsOutT=40; T.run(5); const back=dlg.hidden?'':$('dtext').textContent; T.clickThrough(); const on=lightsOn(); update(16.7); action(); T.clickThrough(); return {hud,off,back,on,again:heist.lightsOutT>0}});
ok('C the HUD counts down; when it runs out the lights come back on; Lars can flip it again',/Lights back in 0:\d\d/.test(r.hud)&&r.off&&r.back.includes('back up')&&r.on&&r.again,r.hud+' | '+r.back);
// D. the gate on the plank is locked; the key's under the parked spotlight (only reachable in the dark); nobody mentions it until you try the gate
r=await p.evaluate(()=>{const saidOut=heist.lightsOutT; heist.lightsOutT=0; const keyLit=lightsOn(); switchTo(0); const k={x:P.x,y:P.y};
  P.x=KEY_SPOT.x; P.y=KEY_SPOT.y; const hz=checkHazards(); const trigLit=(heistTrigger()||{}).label||'';
  P.x=326; P.y=146; update(16.7); const lbl=prompt.textContent; action(); const locked=T.clickThrough().join(' / ');
  P.x=k.x; P.y=k.y; heist.lightsOutT=LIGHTS_OUT_MS; P.x=KEY_SPOT.x; P.y=KEY_SPOT.y; const trigDark=(heistTrigger()||{}).label||''; P.x=k.x; P.y=k.y; syncLeadFromP();
  T.hints=[]; const res=heistBots.across(); window.ACROSS=res.said; T.clickThrough(); T.run(40); window.ACROSS=[...res.said,...T.clickThrough()];
  return {keyLit,spotted:!!hz,trigLit,lbl,locked,trigDark,res,lit:lightsOn(),st:have.heistStage,gate:!!have.plankGate,crew:heist.crew.map(c=>c.id+':'+(c.x|0)+','+(c.y|0)).join(' '),banner:$('roundTitle').textContent}});
ok('D with the lights on, the key sits in a parked spotlight (step in and you\'re spotted; can\'t grab it)',r.keyLit&&r.spotted&&r.trigLit!=='Grab the key',r.trigLit);
ok('D at the gate: "it\'s locked, there\'s got to be a key"',r.lbl==='Check the gate'&&r.locked.includes('key around here'),r.locked);
ok('D in the dark you can grab the key',r.trigDark==='Grab the key',r.trigDark);
ok('D Lars grabs the key, unlocks the gate, and the crew all get onto roof C in time; the lights stay off',r.res.ok&&r.gate&&r.st===2&&!r.lit&&r.res.said.join().includes("It's open"),JSON.stringify(r.res)+' '+r.crew);
ok('D ROUND WON, then ROUND 3',['ROUND WON','ROUND 3'].includes(r.banner),r.banner);
r=await p.evaluate(()=>{switchTo(0); T.hints=[]; const w=T.walkTo(361,178); T.run(2); return {w,hint:T.hints,said:(window.ACROSS||[]).join(' / ')}});
ok('D you mention the tripwires and the sonar',(r.hint.join()+r.said).includes('sonar'),r.hint[0]);
// E. the laser maze
r=await p.evaluate(()=>{const w=T.path([[384,184],[443,184],[443,165]]); if(w!=='ok')return {w,pre:true};
  const w2=T.walkTo(443,140); const w3=T.walkTo(443,100); const msg=dlg.hidden?'':$('dtext').textContent; T.clickThrough(); return {w,w2,w3,msg,pos:(P.x|0)+','+(P.y|0)}});
ok('E walking straight up through the maze trips a laser and resets you',r.w3==='dialog'&&r.msg.includes('laser'),(r.msg||r.w)+' -> '+r.pos);
r=await p.evaluate(()=>{const on=t=>laserSegs(t).some(([a,b,c,d,v])=>v&&b===BLINK.y); const states=new Set(); for(let t=0;t<BLINK.period;t+=100)states.add(on(t));
  const g1=sliderGap(0), g2=sliderGap(1400); const marked0=heist.marked; P.x=440; P.y=180; useSkill(); return {blink:[...states].length===2,slides:Math.abs(g1-g2)>20,marked0,marked:heist.marked}});
ok('E a visible row blinks on and off; the top row\'s gap slides back and forth',r.blink&&r.slides);
ok('E one sonar ping near the maze chalk-marks the hidden tripwires',!r.marked0&&r.marked);
r=await p.evaluate(()=>{placeAtCheckpoint(); heist.marked=true; if(heist.follow)toggleFollow(); switchTo(0); const res=heistBots.lasers();
  T.walkTo(500,64); update(16.7); const lbl=prompt.textContent;
  actionHeld=true; action(); T.run(150); actionHeld=false; T.run(1); const half=heist.defuse&&heist.defuse.p, halfMsg=prompt.textContent, offEarly=!!have.lasersOff;
  switchTo(2); startDefuse(); const notJohn=prompt.textContent; switchTo(0); update(16.7);
  actionHeld=true; action(); T.run(150); actionHeld=false; const said=T.clickThrough(); return {res,lbl,half,halfMsg,offEarly,notJohn,said,off:!!have.lasersOff,pos:(P.x|0)+','+(P.y|0)}});
ok('E Joe (crew on Hold) times the blink and the slider, dodges the guard, and gets through the maze',r.res.ok,JSON.stringify(r.res)+' at '+r.pos);
ok('E past the maze: hold to defuse the laser panel; let go past halfway and it keeps half',r.lbl==='Defuse the lasers (hold)'&&r.half===.5&&r.halfMsg.includes('Half')&&!r.offEarly,r.lbl+' / '+r.half+' / '+r.halfMsg);
ok('E only Joe has the defuser; holding to the end shuts every laser off',r.notJohn.includes('Only Joe')&&r.off&&r.said[0].includes('Lasers off'),r.notJohn+' / '+r.said[0]);
r=await p.evaluate(()=>{switchTo(2); let w=0; while(!(heist.guardDir<0&&heist.guardY<110&&heist.guardWait<=0)&&w<1500){update(16.7);w++}
  const route=T.path([[384,184],[443,184],[443,100],[474,66]]); const msg=dlg.hidden?'':$('dtext').textContent; T.clickThrough(); update(16.7); return {route,msg,lbl:prompt.textContent}});
ok('E with the lasers off, John walks straight up to the grate',r.route==='ok'&&r.lbl.includes('grate'),r.route+' '+r.msg);
// F. only John can open the grate
r=await p.evaluate(()=>{switchTo(0); ripGrate(); const msg=prompt.textContent; switchTo(2); update(16.7); const lbl1=(heistTrigger()||{}).label||''; action(); const early=T.clickThrough(); const st1=have.heistStage;
  switchTo(1); let w=0; while(!(heist.guardDir<0&&heist.guardY<110&&heist.guardWait<=0)&&w<1500){update(16.7);w++} const lw=T.path([[384,184],[443,184],[443,100],[456,68]]); T.clickThrough();
  switchTo(2); update(16.7); const lbl=prompt.textContent; action(); const said=T.clickThrough(); update(16.7); return {msg,lbl1,early,st1,lw,lbl,said,st:have.heistStage,next:prompt.textContent}});
ok('F only John can rip the grate',r.msg.includes('Only John'),r.msg);
ok('F stack up first: the whole crew has to be on the skylight',r.lbl1.includes('/3 stacked')&&r.early.join().includes('Stack up')&&r.st1===2,r.lbl1+' / '+r.early[0]);
ok('F all three stacked: John breaches',r.lw==='ok'&&r.lbl.includes('3/3')&&r.said.join().includes('Breaching')&&r.st===3,r.lw+' / '+r.lbl+' / '+r.said.join(' | '));
ok('F then you can drop in',r.next==='Drop through the skylight',r.next);
// G. vault: three crates and a logic puzzle; raisins first, then the real thing
r=await p.evaluate(()=>{action(); const open=!$('vault').hidden; const rule=$('vaultRule').textContent, labels=[0,1,2].map(i=>$('crateLabel'+i).textContent);
  const wrong=vault.choc===0?1:0; pickCrate(wrong); const raisin=T.clickThrough(); const reopened=!$('vault').hidden;
  $('vaultHint').click(); const hint=!$('vaultHintText').hidden&&$('vaultHintText').textContent;
  pickCrate(vault.choc); const fin=T.clickThrough(); const ask=$('dtext').textContent, btns=T.btns(); [...$('dbtns').querySelectorAll('button')].find(b=>b.textContent==='Bring it').click(); return {open,rule,labels,raisin,reopened,hint,fin,ask,btns,ana:!$('anagram').hidden,st:have.heistStage}});
ok('G vault: a rule and three labeled crates',r.open&&r.rule.length>5&&r.labels.every(l=>l.length>2)&&!r.labels.join().includes('{'),r.rule+' | '+r.labels.join(' | '));
ok('G raisins: John objects, choose again',r.raisin.join().includes('Raisins')&&r.reopened,r.raisin[0]);
ok('G Lars gives a hint if you ask',!!r.hint,r.hint);
ok('G finale, then Lars challenges you to anagrams (no other games)',r.fin.some(l=>l.includes('final ingredient'))&&r.btns.join()==='Bring it'&&r.ana&&r.st===4,r.ask);
// the right crate moves around, and the puzzles rotate
r=await p.evaluate(()=>{const spots=new Set(), rules=new Set(); for(let k=0;k<40;k++){openVault(); spots.add(vault.choc); rules.add(vault.puzzle.rule); $('vault').hidden=true} vault.open=false; paused=false; return {spots:[...spots].sort().join(),rules:rules.size}});
ok('G the chocolate crate is shuffled and the puzzle changes',r.spots==='0,1,2'&&r.rules>=3,JSON.stringify(r));
r=await p.evaluate(()=>{openAnagrams(); return 1});
// lose to Lars first (do nothing), then rematch with new letters and win
r=await p.evaluate(()=>{const set1=ana.set.letters; anaGo(); for(let i=0;i<60*62;i++)update(16.7); const res=$('anaResult').textContent; $('anaNext').click(); const gl=T.clickThrough(); const again=T.btns(); [...$('dbtns').querySelectorAll('button')].find(b=>b.textContent==='Bring it').click();
  return {set1,res,gl,again,open:!$('anagram').hidden,set2:ana.set.letters}});
ok('G doing nothing loses to Lars, and he gloats',r.res.startsWith('Lars wins')&&r.gl.join().includes('Again'),r.res);
ok('G rematch uses different letters',r.again.join()==='Bring it'&&r.open&&r.set2!==r.set1,r.set1+' -> '+r.set2);
r=await p.evaluate(()=>{const seen=new Set(); for(let k=0;k<30;k++){$('anagram').hidden=true; ana.open=false; openAnagrams(); seen.add(ana.set.letters)} return seen.size});
ok('G lots of different letter sets',r>=8,r+' sets seen in 30 games');
r=await p.evaluate(()=>{$('anagram').hidden=true; ana.open=false; return 1});
r=await p.evaluate(()=>{openAnagrams(); anaGo(); const type=w=>{for(const ch of w){const i=ana.letters.findIndex((l,j)=>l===ch&&!ana.picked.includes(j)); ana.picked.push(i)} anaSubmit(); return $('anaMsg').textContent};
  const msgs=[type('ZZZ'.slice(0,0)+ana.set.letters.slice(0,3).split('').reverse().join(''))];
  const ws=[...ana.set.words[6],...ana.set.words[5]]; for(const w of ws)msgs.push(type(w)); const dup=type(ws[0]);
  for(let i=0;i<60*62;i++)update(16.7); const res=$('anaResult').textContent; $('anaNext').click(); const lines=T.clickThrough();
  return {msgs,dup,res,lines,reward:!$('reward').hidden,name:$('rewardName').textContent,st:have.heistStage,lars:ana.lars,you:ana.you}});
ok('G real words score, repeats don\'t',r.msgs.slice(1).every(m=>m.includes('+'))&&r.dup.includes('Already'),r.msgs.slice(0,3).join(' | '));
ok('G beat Lars -> chocolate',r.res.startsWith('Joe wins')&&r.lines.join().includes('two out of three')&&r.reward&&r.name==='Chocolate'&&r.st===5,`${r.you} vs ${r.lars}: ${r.res}`);
if(await p.evaluate(()=>$('reward').hidden)){console.log(R.join('\n'));console.log('stopped before reward', errs);process.exit(1)}
await p.click('#rewardArt',{force:true}); await p.waitForTimeout(900);
r=await p.evaluate(()=>({city:!!have.city,basket:$('basket').textContent}));
ok('G chocolate in the basket',r.city&&r.basket.includes('Chocolate'));
// H. the way home: just a quick word (no long cutscene), then back on the main map
r=await p.evaluate(()=>{const ks=()=>{const l=[];for(let i=0;i<15&&!dlg.hidden&&!l.join().includes('Settings');i++){l.push($('dspeaker').textContent+': '+$('dtext').textContent);const bs=[...$('dbtns').querySelectorAll('button')];(bs.find(x=>x.textContent==='Next')||bs[0]).click()}return {l,gear:Object.keys(have.gear||{}).join()}};window.K=ks(); const lines=T.clickThrough(); T.run(60); return {k:K,lines,world:scene===SCENES.world,bar:$('crewbar').hidden}});
ok('H Dr. Alex hands Joe her spare goggles',r.k.l[0].startsWith('Dr. Alex')&&r.k.gear.includes('goggles'),r.k.l[0]);
ok('H a few lines from Lars and John, then you\'re back on the map',r.lines.join().includes('rolls eyes')&&r.lines.length<=5&&r.world&&r.bar,JSON.stringify(r));
// I. reload mid-heist resumes at the right checkpoint
await fresh(); await p.evaluate(()=>{have.heistStage=2; have.heistBriefed=true; save()}); await p.reload(); await p.click('#startBtn'); await p.evaluate(()=>skipWelcome()); await p.evaluate(helpers);
r=await p.evaluate(()=>{T.enter(); const sp=dlg.hidden?'':$('dspeaker').textContent; return {sp,pos:(P.x|0)+','+(P.y|0),onC:hit(R(P.x-1,P.y-1,2,2),ROOF_C)}}); ok('I reload at stage 2 starts on roof C, no briefing',r.sp!=='Dr. Alex'&&r.onC,r.pos+' '+r.sp);
// J. checkpoints are safe to stand on
r=await p.evaluate(()=>{const bad=[]; for(let st=0;st<3;st++){have.heistStage=st; placeAtCheckpoint(); T.clickThrough(); for(let i=0;i<900;i++){update(16.7); if(!dlg.hidden){if($('dspeaker').textContent==='Spotted!'){bad.push(st+': '+$('dtext').textContent); T.clickThrough(); break} T.clickThrough()}}} return bad});
ok('J standing still at each checkpoint never gets you caught',r.length===0,r.join('; '));
console.log(R.join('\n')); console.log('page errors:',errs.length?errs:'none'); await b.close()})();
