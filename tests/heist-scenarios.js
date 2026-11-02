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

// A. Dr. Alex: you walk up to her lab bench for the briefing
let r=await p.evaluate(()=>{T.enter(); const auto=!dlg.hidden&&$('dspeaker').textContent==='Dr. Alex'; T.clickThrough(); T.hints=[]; const w=T.walkTo(58,140); const hint=T.hints.join(' / ');
  const pre=(()=>{T.walkTo(76,146); update(16.7); action(); const t=T.clickThrough(); return t.join(' ')})();
  T.path([[58,140],[58,100],[46,78]]); update(16.7); const lbl=prompt.textContent; action(); const face=!$('dportrait').hidden; const lines=T.clickThrough(); const how=!$('howto').hidden, rows=$('howRows').children.length, ctl=$('howControls').textContent; $('howOk').click(); update(16.7); T.walkTo(58,100);
  return {auto,hint,pre,lbl,face,lines,how,rows,ctl,bar:!$('crewbar').hidden,hud:$('hud').textContent,lab:$('alabel').textContent}});
ok('A no briefing pops up on its own; John points out the lab bench',!r.auto&&r.hint.includes('lab bench'),r.hint);
ok('A the log waits until you\'ve talked to her',r.pre.includes('lab coat'),r.pre);
ok('A walk up to Dr. Alex (Alex as a mad scientist) and she briefs the crew',r.lbl==='Talk to Dr. Alex'&&r.face&&r.lines[0].startsWith('Dr. Alex')&&r.lines.join().includes('formula')&&r.lines.some(l=>l.startsWith('John'))&&r.lines.some(l=>l.startsWith('Lars')),r.lines.length+' lines');
ok('A how-to card lists all 3 powers + controls',r.how&&r.rows===3&&r.ctl.includes('Space')&&r.ctl.includes('press F'),r.rows+' rows');
ok('A crew bar + objective + skill label',r.bar&&r.hud.includes('Bridge')&&r.lab==='Sonar',r.hud+' / '+r.lab);
// B. the log: you can't lift it; Lars tries the long jump (and finds ice cream)
r=await p.evaluate(()=>{T.hints=[]; T.path([[58,100],[58,140],[76,146]]); const hint=T.hints; update(16.7); const lbl=prompt.textContent; action();
  const menu=T.btns(); if(!menu.includes('Use it as a bridge'))return {dbg:[lbl,menu.join('|'),$('dtext').textContent,P.x|0,P.y|0,dlg.hidden]}; [...$('dbtns').querySelectorAll('button')].find(b=>b.textContent==='Use it as a bridge').click(); const msg=T.clickThrough().join(' / '); const st1=have.heistStage||0;
  update(16.7); action(); [...$('dbtns').querySelectorAll('button')].find(b=>b.textContent==='Have Lars try to long-jump the gap').click(); const cut1=T.clickThrough(); const L=heist.crew.find(c=>c.id==='lars'); let maxX=0, air=0, annoyed=false;
  for(let i=0;i<300;i++){SCENES.city.ambient(16.7); maxX=Math.max(maxX,L.x); air=Math.max(air,(heist.jump&&heist.jump.air)||0); annoyed=annoyed||heist.annoyT>0} const landed=Math.round(L.x); const cut=[...cut1,'JUMP '+Math.round(maxX)+' air '+Math.round(air)+' land '+landed+' annoyed '+annoyed,...T.clickThrough()].join(' / '); const ice=!$('reward').hidden&&$('rewardName').textContent; if(ice)collectReward();
  return {hint,lbl,menu,msg,cut,ice,st1}});
if(r.dbg){console.log(R.join('\n'),r.dbg);process.exit(1)}
await p.waitForTimeout(1000);
ok('B John hints at the log',r.hint.join().includes('log'),r.hint[0]); ok('B the log offers bridge / Lars long jump / leave',r.lbl==='Look at the log'&&r.menu.join()==='Use it as a bridge,Have Lars try to long-jump the gap,Leave it',r.menu.join(' | '));
ok('B you can\'t lift it; John says switch to him',r.msg.includes('Switch to me')&&!r.st1,r.msg); ok('B Lars really runs and jumps, boings back, John is annoyed',r.cut.includes('Headwind')&&/JUMP 12\d air 1\d land 112 annoyed true/.test(r.cut)&&!r.st1,r.cut);
ok('B ...and Lars lands next to a pint of Maple Rosemary ice cream',r.ice==='Maple Rosemary ice cream'&&r.cut.includes('Maple Rosemary'),r.ice);
// John carries it: too long to fit past the tank sideways, turn it upright, through, sideways again, across the gap
r=await p.evaluate(()=>{switchTo(2); T.path([[58,140],[76,146]]); update(16.7); action(); [...$('dbtns').querySelectorAll('button')].find(b=>b.textContent==='Use it as a bridge').click(); const said=T.clickThrough();
  const out={said:said[0],carry:heist.carry&&heist.carry.rot};
  switchTo(0); out.switchBlocked=heist.lead===2&&prompt.textContent.includes('hands full');
  out.sideways=T.walkTo(58,100,300); out.stuckY=Math.round(P.y);
  out.turn=(()=>{T.walkTo(58,150); useSkill(); return heist.carry.rot})();
  out.upright=T.walkTo(58,100,400);
  out.noRoom=(()=>{const k=P.y; P.y=40; P.x=66; useSkill(); const m=prompt.textContent, rot=heist.carry.rot; P.y=k; P.x=58; return rot==='v'&&m.includes('No room')})();
  useSkill(); out.turnBack=heist.carry.rot; out.toGap=T.walkTo(98,102); update(16.7); out.lbl=prompt.textContent; action(); out.done=T.clickThrough()[0]; out.st=have.heistStage; out.carrying=!!heist.carry;
  return out});
ok('B John picks up the log; nobody else can be switched to while he carries it',r.carry==='h'&&r.switchBlocked&&r.said.includes('Tap A'),r.said);
ok('B sideways, the log won\'t fit between the tank and the vents',r.sideways!=='ok'&&r.stuckY>125,r.sideways);
ok('B turn it upright and it fits through; you can\'t turn it where there\'s no room',r.turn==='v'&&r.upright==='ok'&&r.noRoom,r.upright);
ok('B turn it sideways again, carry it to the edge, lay it across',r.turnBack==='h'&&r.toGap==='ok'&&r.lbl==='Lay the log across the gap'&&r.st===1&&!r.carrying,r.done);
r=await p.evaluate(()=>{T.hints=[]; const w=T.path([[110,102],[170,102]]); return {w,hint:T.hints,x:P.x}});
ok('B the crew crosses the log to roof B',r.w==='ok',r.w); ok('B Lars calls the searchlights (and the shadows)',r.hint.join().includes('Searchlights')&&r.hint.join().includes('shadows'),r.hint[0]);
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
ok('C crew holds while Lars dashes shadow to shadow and flips the switch',r.res.ok&&r.st===2,JSON.stringify(r.res)+' '+(r.said[0]||''));
// D. regroup, cross to roof C
r=await p.evaluate(()=>{switchTo(0); T.walkTo(166,104); toggleFollow(); T.hints=[]; const w=T.path([[196,156],[300,156],[316,146],[356,146],[361,178]]); return {w,hint:T.hints,hud:$('hud').textContent}});
ok('D everyone crosses roof B with the lights off and gets to roof C',r.w==='ok',r.w); ok('D you mention the tripwires and the sonar',r.hint.join().includes('sonar'),r.hint[0]);
// E. the laser maze
r=await p.evaluate(()=>{const w=T.path([[384,184],[443,184],[443,165]]); if(w!=='ok')return {w,pre:true};
  const w2=T.walkTo(443,140); const w3=T.walkTo(443,100); const msg=dlg.hidden?'':$('dtext').textContent; T.clickThrough(); return {w,w2,w3,msg,pos:(P.x|0)+','+(P.y|0)}});
ok('E walking straight up through the maze trips a laser and resets you',r.w3==='dialog'&&r.msg.includes('laser'),(r.msg||r.w)+' -> '+r.pos);
r=await p.evaluate(()=>{const on=t=>laserSegs(t).some(([a,b,c,d,v])=>v&&b===BLINK.y); const states=new Set(); for(let t=0;t<BLINK.period;t+=100)states.add(on(t));
  const g1=sliderGap(0), g2=sliderGap(1400); const marked0=heist.marked; P.x=440; P.y=180; useSkill(); return {blink:[...states].length===2,slides:Math.abs(g1-g2)>20,marked0,marked:heist.marked}});
ok('E a visible row blinks on and off; the top row\'s gap slides back and forth',r.blink&&r.slides);
ok('E one sonar ping near the maze chalk-marks the hidden tripwires',!r.marked0&&r.marked);
r=await p.evaluate(()=>{placeAtCheckpoint(); heist.marked=true; if(heist.follow)toggleFollow(); switchTo(2); const res=heistBots.lasers(); return {res,pos:(P.x|0)+','+(P.y|0),lbl:(update(16.7),prompt.textContent)}});
ok('E John (crew on Hold) times the blink and the slider, dodges the guard, and reaches the grate',r.res.ok&&r.lbl.includes('grate'),JSON.stringify(r.res)+' at '+r.pos);
// F. only John can open the grate
r=await p.evaluate(()=>{switchTo(0); const keep={x:P.x,y:P.y}; ripGrate(); const msg=prompt.textContent; switchTo(2); update(16.7); action(); const said=T.clickThrough(); update(16.7); return {msg,said,st:have.heistStage,next:prompt.textContent}});
ok('F only John can rip the grate',r.msg.includes('Only John')&&r.st===3,`${r.msg} / ${r.said[0]}`);
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
r=await p.evaluate(()=>{const lines=T.clickThrough(); T.run(60); return {lines,world:scene===SCENES.world,bar:$('crewbar').hidden}});
ok('H a few lines from Lars and John, then you\'re back on the map',r.lines.join().includes('rolls eyes')&&r.lines.length<=5&&r.world&&r.bar,JSON.stringify(r));
// I. reload mid-heist resumes at the right checkpoint
await fresh(); await p.evaluate(()=>{have.heistStage=2; have.heistBriefed=true; save()}); await p.reload(); await p.click('#startBtn'); await p.evaluate(()=>skipWelcome()); await p.evaluate(helpers);
r=await p.evaluate(()=>{T.enter(); const sp=dlg.hidden?'':$('dspeaker').textContent; return {sp,pos:(P.x|0)+','+(P.y|0),onC:hit(R(P.x-1,P.y-1,2,2),ROOF_C)}}); ok('I reload at stage 2 starts on roof C, no briefing',r.sp!=='Dr. Alex'&&r.onC,r.pos+' '+r.sp);
// J. checkpoints are safe to stand on
r=await p.evaluate(()=>{const bad=[]; for(let st=0;st<3;st++){have.heistStage=st; placeAtCheckpoint(); T.clickThrough(); for(let i=0;i<900;i++){update(16.7); if(!dlg.hidden){if($('dspeaker').textContent==='Spotted!'){bad.push(st+': '+$('dtext').textContent); T.clickThrough(); break} T.clickThrough()}}} return bad});
ok('J standing still at each checkpoint never gets you caught',r.length===0,r.join('; '));
console.log(R.join('\n')); console.log('page errors:',errs.length?errs:'none'); await b.close()})();
