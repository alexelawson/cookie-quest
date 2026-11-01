// Plays through the chocolate heist. Run: node tests/heist-scenarios.js
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
  enter:()=>{P.x=134;P.y=244;update(16.7);action(); if(!$('wardrobe').hidden)$('wardGo').click(); T.run(40)},
}};
const fresh=async()=>{await p.goto(URL);await p.evaluate(()=>localStorage.clear());await p.reload();await p.click('#startBtn'); await p.evaluate(()=>skipWelcome());await p.evaluate(helpers)};
const R=[];const ok=(n,c,x='')=>R.push((c?'PASS ':'FAIL ')+n+(x?'  ('+x+')':''));
await fresh();

// A. briefing
let r=await p.evaluate(()=>{T.enter(); const face=!$('dportrait').hidden&&$('dspeaker').textContent==='The Stranger'; const lines=T.clickThrough(); const how=!$('howto').hidden, rows=$('howRows').children.length, ctl=$('howControls').textContent; $('howOk').click(); update(16.7); T.clickThrough(); update(16.7); return {face,how,rows,ctl,lines,bar:!$('crewbar').hidden,hud:$('hud').textContent,lab:$('alabel').textContent}});
ok('A the stranger\'s face shows beside his lines',r.face);
ok('A stranger briefs the crew, John + Lars chime in',r.lines[0].startsWith('The Stranger')&&r.lines.some(l=>l.startsWith('John'))&&r.lines.some(l=>l.startsWith('Lars')),r.lines.length+' lines');
r.portrait=await p.evaluate(()=>1);
ok('A how-to card lists all 3 powers + controls',r.how&&r.rows===3&&r.ctl.includes('Space')&&r.ctl.includes('press F'),r.rows+' rows');
ok('A crew bar + objective + skill label',r.bar&&r.hud.includes('Bridge')&&r.lab==='Sonar',r.hud+' / '+r.lab);
// B. only John lifts the beam
r=await p.evaluate(()=>{T.hints=[]; const w=T.walkTo(88,140); const hint=T.hints; update(16.7); const lbl=prompt.textContent; action();
  const menu=T.btns(); [...$('dbtns').querySelectorAll('button')].find(b=>b.textContent==='Use it as a bridge').click(); const msg=T.clickThrough().join(' / '); const st1=have.heistStage||0;
  update(16.7); action(); [...$('dbtns').querySelectorAll('button')].find(b=>b.textContent==='Have Lars try to long-jump the gap').click(); const cut1=T.clickThrough(); const L=heist.crew.find(c=>c.id==='lars'); let maxX=0, air=0, annoyed=false;
  for(let i=0;i<260;i++){SCENES.city.ambient(16.7); maxX=Math.max(maxX,L.x); air=Math.max(air,(heist.jump&&heist.jump.air)||0); annoyed=annoyed||heist.annoyT>0} const landed=Math.round(L.x); const cut=[...cut1,'JUMP '+Math.round(maxX)+' air '+Math.round(air)+' land '+landed+' annoyed '+annoyed,...T.clickThrough()].join(' / '); const ice=!$('reward').hidden&&$('rewardName').textContent; if(ice)collectReward(); window._B={w,hint,lbl,menu,msg,cut,ice,st1}; return 1});
await p.waitForTimeout(1000);
r=await p.evaluate(()=>{const {w,hint,lbl,menu,msg,cut,ice,st1}=window._B;
  switchTo(2); T.walkTo(86,136); update(16.7); action(); [...$('dbtns').querySelectorAll('button')].find(b=>b.textContent==='Use it as a bridge').click(); const said=T.clickThrough();
  return {w,hint,lbl,menu,msg,cut,ice,st1,st2:have.heistStage,said}});
ok('B John hints at the gap',r.hint.join().includes('log'),r.hint[0]); ok('B the log offers bridge / Lars long jump / leave',r.lbl==='Look at the log'&&r.menu.join()==='Use it as a bridge,Have Lars try to long-jump the gap,Leave it',r.menu.join(' | '));
ok('B you can\'t lift it; John says switch to him',r.msg.includes('Switch to me')&&!r.st1,r.msg); ok('B Lars really runs and jumps, boings back, John is annoyed',r.cut.includes('Headwind')&&/JUMP 12\d air 1\d land 112 annoyed true/.test(r.cut)&&!r.st1,r.cut);
ok('B John lifts the beam',r.st2===1,r.said[0]);
ok('B ...and Lars lands next to a pint of Maple Rosemary ice cream',r.ice==='Maple Rosemary ice cream'&&r.cut.includes('Maple Rosemary'),r.ice);
r=await p.evaluate(()=>{T.hints=[]; const w=T.path([[110,102],[170,102]]); return {w,hint:T.hints,x:P.x}});
ok('B the crew crosses the beam to roof B',r.w==='ok',r.w); ok('B Lars calls the searchlights',r.hint.join().includes('Searchlights'),r.hint[0]);
// C. searchlights: walking through gets you caught; a followed crew too
r=await p.evaluate(()=>{switchTo(0); const w=T.walkTo(316,110); const msg=dlg.hidden?'':$('dtext').textContent; T.clickThrough(); return {w,msg,back:Math.round(P.x)+','+Math.round(P.y)}});
ok('C walking into the lights gets you caught and reset',r.w==='dialog'&&r.msg.includes('searchlight'),r.msg+' -> '+r.back);
r=await p.evaluate(()=>{const L=LIGHTS[0], l=lightPos(L); const c=heist.crew[2]; const keep={x:c.x,y:c.y};
  c.x=l.x+LIGHT_R+1; c.y=l.y+7; const edge=checkHazards(); c.x=l.x; c.y=l.y+7; const center=checkHazards(); c.x=keep.x; c.y=keep.y;
  return {edge:!!edge, center:center&&center.who}});
ok('C standing just outside a light is safe; inside it is not, and it says who',!r.edge&&r.center==='john',JSON.stringify(r));
r=await p.evaluate(()=>{const s0=SCENES.city.speed(); switchTo(1); const s1=SCENES.city.speed(); switchTo(0); return {you:s0,lars:s1}});
ok('C Lars walks faster than everyone',r.lars>r.you,`${r.you} vs ${r.lars}`);
// how often a walk vs a sprint across the light columns at y=40 would be safe
r=await p.evaluate(()=>{const safe=(t0,speed)=>{for(let x=182;x<=310;x+=2){const t=t0+(x-182)/speed; const keep=time; time=t; const ok=LIGHTS.every(L=>{const l=lightPos(L); return Math.hypot(x-l.x,104-7-l.y)>LIGHT_R-2}); time=keep; if(!ok)return false} return true};
  let w=0,s=0,n=0; for(let t=0;t<60000;t+=50){n++; if(safe(t,.07))w++; if(safe(t,.19))s++} return {walk:(w/n*100).toFixed(0),sprint:(s/n*100).toFixed(0)}});
ok('C the lights are much easier to beat sprinting',+r.sprint>=2*+r.walk&&+r.sprint>=25,`walking safe ${r.walk}% of the time, sprinting ${r.sprint}%`);
// Lars runs it: hold the crew, wait for a gap, sprint
r=await p.evaluate(()=>{toggleFollow(); switchTo(1); const w0=T.path([[170,104],[182,104]]); if(w0!=='ok')return {w0};
  const safe=(t0)=>{for(let x=P.x;x<=310;x+=2){const t=t0+(x-P.x)/.19; const keep=time; time=t; const ok=LIGHTS.every(L=>{const l=lightPos(L); return Math.hypot(x-l.x,104-7-l.y)>LIGHT_R+1}); time=keep; if(!ok)return false} return true};
  let waited=0; while(!safe(time)&&waited<600){update(16.7);waited++}
  useSkill(); const w=T.walkTo(310,104,60); const caughtMsg=dlg.hidden?'':$('dtext').textContent;
  update(16.7); const lbl=prompt.textContent; action(); const said=T.clickThrough();
  return {w0,waited,w,caughtMsg,lbl,said,st:have.heistStage,others:heist.crew.filter(c=>c.id!=='lars').map(c=>(c.x|0)+','+(c.y|0))}});
ok('C crew holds while Lars sprints to the fuse box',r.w!=='dialog'&&r.lbl==='Flip the LIGHT POWER switch',`${r.w} ${r.caughtMsg||''} waited ${r.waited} frames; others at ${r.others}`);
ok('C Lars cuts the power',r.st===2,r.said&&r.said[0]);
// D. regroup, cross to roof C
r=await p.evaluate(()=>{switchTo(0); toggleFollow(); T.hints=[]; const w=T.path([[200,146],[310,146],[356,146],[362,176]]); return {w,hint:T.hints,hud:$('hud').textContent}});
ok('D everyone crosses roof B with the lights off and gets to roof C',r.w==='ok',r.w); ok('D you mention the tripwires',r.hint.join().includes('sonar'),r.hint[0]);
// E. lasers are invisible and real
r=await p.evaluate(()=>{const keep={...heist.crew.map(c=>({...c}))}; const w=T.path([[440,180],[440,140]]); if(w!=='ok')return {w,pre:true};
  const w2=T.walkTo(440,90); const msg=dlg.hidden?'':$('dtext').textContent; T.clickThrough(); return {w2,msg,pos:(P.x|0)+','+(P.y|0)}});
ok('E walking straight up trips a laser and resets to roof C',r.w2==='dialog'&&r.msg.includes('laser'),(r.msg||r.w)+' -> '+r.pos);
// guard: wait until he walks away, then thread the lasers with sonar on, the crew following your exact steps
r=await p.evaluate(()=>{let w=0; while(!(heist.guardDir<0&&heist.guardY<120&&heist.guardWait<=0)&&w<1000){update(16.7);w++}
  useSkill(); const route=T.path([[455,180],[455,136],[455,112],[493,112],[493,88],[472,88],[472,68]]);
  const msg=dlg.hidden?'':$('dtext').textContent; T.clickThrough(); return {route,msg,sonar:heist.sonarT>0,crew:heist.crew.map(c=>c.id+'@'+(c.x|0)+','+(c.y|0)).join(' ')}});
ok('E the crew threads the lasers to the skylight without tripping one',r.route==='ok',r.route+' '+(r.msg||'')+' | '+r.crew);
// F. only John can open the grate
r=await p.evaluate(()=>{update(16.7); const lbl=prompt.textContent; action(); const msg=prompt.textContent;
  switchTo(2); const w=T.path([[472,68]]); update(16.7); action(); const said=T.clickThrough(); update(16.7); return {lbl,msg,w,said,st:have.heistStage,next:prompt.textContent}});
ok('F you can\'t rip the grate; John can',r.lbl.includes('grate')&&r.msg.includes('Only John')&&r.st===3,`${r.msg} / ${r.said[0]}`);
ok('F then you can drop in',r.next==='Drop through the skylight',r.next);
// G. vault: three crates and a logic puzzle; raisins first, then the real thing
r=await p.evaluate(()=>{action(); const open=!$('vault').hidden; const rule=$('vaultRule').textContent, labels=[0,1,2].map(i=>$('crateLabel'+i).textContent);
  const wrong=vault.choc===0?1:0; pickCrate(wrong); const raisin=T.clickThrough(); const reopened=!$('vault').hidden;
  $('vaultHint').click(); const hint=!$('vaultHintText').hidden&&$('vaultHintText').textContent;
  pickCrate(vault.choc); const fin=T.clickThrough(); const ask=$('dtext').textContent, btns=T.btns(); [...$('dbtns').querySelectorAll('button')].find(b=>b.textContent==='Bring it').click(); return {open,rule,labels,raisin,reopened,hint,fin,ask,btns,ana:!$('anagram').hidden,st:have.heistStage}});
ok('G vault: a rule and three labeled crates',r.open&&r.rule.length>5&&r.labels.every(l=>l.length>2)&&!r.labels.join().includes('{'),r.rule+' | '+r.labels.join(' | '));
ok('G raisins: John objects, choose again',r.raisin.join().includes('Raisins')&&r.reopened,r.raisin[0]);
ok('G Lars gives a hint if you ask',!!r.hint,r.hint);
ok('G finale, then Lars challenges you to anagrams (no other games)',r.fin.some(l=>l.includes('one with the chocolate'))&&r.btns.join()==='Bring it'&&r.ana&&r.st===4,r.ask);
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
r=await p.evaluate(()=>({city:!!have.city,basket:$('basket').textContent,exit:!!heist.exit})); ok('G chocolate in the basket, then the walk home starts',r.city&&r.basket.includes('✓ Chocolate')&&r.exit,r.basket);
// H. the way home: Lars lugs the crate to the grate, John rolls his eyes, everyone goes down the grate, back on the main map
r=await p.evaluate(()=>{const L=heist.crew.find(c=>c.id==='lars'), y0=L.y; for(let i=0;i<220;i++)SCENES.city.ambient(16.7); const y1=L.y, lines=T.clickThrough(); for(let i=0;i<60;i++){SCENES.city.ambient(16.7);update(16.7)}
  return {y0,y1,lines,world:scene===SCENES.world,bar:$('crewbar').hidden}});
ok('H Lars carries the crate to the grate, John rolls his eyes, and you land back on the map',r.y1<r.y0-30&&r.lines.join().includes('rolls eyes')&&r.world&&r.bar,JSON.stringify(r));
// I. reload mid-heist resumes at the right checkpoint
await fresh(); await p.evaluate(()=>{have.heistStage=2; have.heistBriefed=true; save()}); await p.reload(); await p.click('#startBtn'); await p.evaluate(()=>skipWelcome()); await p.evaluate(helpers);
r=await p.evaluate(()=>{T.enter(); const sp=dlg.hidden?'':$('dspeaker').textContent; return {sp,pos:(P.x|0)+','+(P.y|0),onC:hit(R(P.x-1,P.y-1,2,2),ROOF_C)}}); ok('I reload at stage 2 starts on roof C, no briefing',r.sp!=='The Stranger'&&r.onC,r.pos+' '+r.sp);
// J. checkpoints are safe to stand on
r=await p.evaluate(()=>{const bad=[]; for(let st=0;st<3;st++){have.heistStage=st; placeAtCheckpoint(); T.clickThrough(); for(let i=0;i<600;i++){update(16.7); if(!dlg.hidden){if($('dspeaker').textContent==='Spotted!'){bad.push(st+': '+$('dtext').textContent); T.clickThrough(); break} T.clickThrough()}}} return bad});
ok('J standing still at each checkpoint never gets you caught',r.length===0,r.join('; '));
console.log(R.join('\n')); console.log('page errors:',errs.length?errs:'none'); await b.close()})();
