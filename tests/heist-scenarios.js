// Plays through the chocolate heist. Run: node tests/heist-scenarios.js
// The hard parts (searchlights, laser maze) are played by the bots in heist-bots.js.
const {chromium}=require('playwright');const path=require('path');(async()=>{
const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
const URL='file://'+path.resolve(__dirname,'../index.html');
const helpers=()=>{window.T={
  btns:()=>[...$('dbtns').querySelectorAll('button')].map(b=>b.textContent),
  clickThrough:()=>{const seen=[]; for(let i=0;i<30&&(!dlg.hidden||!$('itemCard').hidden);i++){ if(!$('itemCard').hidden){seen.push('CARD: '+$('itemName').textContent); $('itemBtn').click(); continue} seen.push($('dspeaker').textContent+': '+$('dtext').textContent); [...$('dbtns').querySelectorAll('button')][0].click()} return seen},   // (and the "you got something" card)
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

// A. the log blocks the way to Doc Alex: only John can lift it, then he carries it and follows you
let r=await p.evaluate(()=>{T.enter(); for(let k=0;k<5&&$('howto').hidden;k++)update(16.7); const how=!$('howto').hidden, rows=$('howRows').children.length, ctl=$('howControls').textContent, sel=$('howTitle').textContent+'|'+$('howOk').textContent+'|'+[...$('howRows').children].map(r=>r.querySelector('i').textContent).join(','), onOne=$('howRows').querySelectorAll('.on').length; if(how){$('howRows').children[0].click(); $('howOk').click()} update(16.7);
  const auto=!dlg.hidden&&$('dspeaker').textContent==='Doc Alex'; T.clickThrough(); T.hints=[];
  const blockedW=T.walkTo(58,100,400), stuckY=Math.round(P.y), hint=T.hints.join(' / ');
  const look=lbl=>{T.walkTo(58,132); update(16.7); const l=prompt.textContent; action(); const menu=T.btns(); [...$('dbtns').querySelectorAll('button')].find(b=>b.textContent==='Lift it').click(); return {l,menu,said:T.clickThrough().join(' / ')}};
  const joe=look(), lars=(switchTo(1),look()), john=(switchTo(2),look()); const stuckLog=!heist.carry;
  // the lever puzzle: Joe's sonar finds a cinder block under the tarp; Lars gets the board from behind the vents; set them up; John pries the log loose
  switchTo(0); const toTarp=T.walkTo(TARP.x,TARP.y+4); update(16.7); const tarpLbl=prompt.textContent; action(); const beforePing=T.clickThrough().join(' / ');
  useSkill(); T.run(40); const found=T.clickThrough().join(' / '); update(16.7); action(); [...$('dbtns').querySelectorAll('button')].find(b=>b.textContent===HEIST.takeBlock).click(); const joeHasBlock=heist.lever.blockBy==='hero';
  switchTo(2); const johnBoard=T.walkTo(BOARD.x,BOARD.y+4); update(16.7); action(); const johnTry=T.clickThrough().join(' / ');
  switchTo(1); const larsBoard=T.walkTo(BOARD.x,BOARD.y+4); update(16.7); action(); const larsGot=T.clickThrough().join(' / '); const larsHasBoard=heist.lever.boardBy==='lars';
  const lay=(who,lbl)=>{switchTo(who); T.walkTo(58,132); update(16.7); action(); const b=[...$('dbtns').querySelectorAll('button')].find(b=>b.textContent===lbl); if(!b){const m=T.btns(); closeDialog(); return 'no button: '+m.join('|')} b.click(); return T.clickThrough().join(' / ')||'ok'};
  const boardFirst=lay(1,HEIST.setBoard), blockSet=lay(0,HEIST.setBlock), boardSet=lay(1,HEIST.setBoard);
  switchTo(2); T.walkTo(58,132); update(16.7); action(); const menu2=T.btns(); [...$('dbtns').querySelectorAll('button')].find(b=>b.textContent===HEIST.pushLever).click(); const pop=T.clickThrough().join(' / ');
  const lever={toTarp,tarpLbl,beforePing,found,joeHasBlock,johnBoard,johnTry,larsBoard,larsGot,larsHasBoard,boardFirst,blockSet,boardSet,menu2,pop};
  const carrying=!!heist.carry; switchTo(0); const switched=heist.lead===0;
  const w=T.path([[58,100],[46,78]]); const J=heist.crew.find(c=>c.id==='john'), johnNear=Math.hypot(J.x-P.x,J.y-P.y)<40;
  update(16.7); const lbl=prompt.textContent; action(); const face=!$('dportrait').hidden; const lines=T.clickThrough(); const howAgain=!$('howto').hidden; update(16.7); T.walkTo(58,100);
  return {lever,stuckLog,howAgain,auto,blockedW,stuckY,hint,joe,lars,john,carrying,switched,w,johnNear,lbl,face,lines,how,rows,ctl,sel,onOne,lead:heist.lead,gadget:have.gear&&have.gear.gadget,banner:$('roundTitle').textContent,bar:!$('crewbar').hidden,hud:$('hud').textContent,lab:$('alabel').textContent}});
ok('A no briefing pops up on its own',!r.auto);
ok('A the log blocks the way to Doc Alex; John says so',r.blockedW!=='ok'&&r.stuckY>125&&r.hint.includes('blocking'),r.blockedW+' | '+r.hint);
ok('A the log: Lift it / Leave it',r.joe.l==='Look at the log'&&r.joe.menu.join()==='Lift it,Leave it',r.joe.menu.join(' | '));
ok('A nobody can just lift it: Joe and Lars can\'t, and John says it\'s wedged and they need leverage',r.joe.said.includes('Step aside Joe')&&r.lars.said.includes('forklift')&&r.john.said.includes('leverage')&&r.stuckLog,r.john.said);
const L=r.lever;
ok('A lever: Joe walks to the tarp, it tells him to ping his sonar there, and the sonar finds a cinder block he can carry',L.toTarp==='ok'&&L.tarpLbl==='Look under the tarp'&&L.beforePing.includes('Sonar')&&L.found.includes('cinder block')&&L.joeHasBlock,JSON.stringify(L).slice(0,400));
ok('A lever: only Lars can climb up the vents to get the board',L.johnBoard==='ok'&&L.johnTry.includes('Lars is agile')&&L.larsBoard==='ok'&&L.larsHasBoard,L.johnTry+' | '+L.larsGot);
ok('A lever: the board needs the block under it first; block, then board',L.boardFirst.includes('rest on first')&&L.blockSet&&L.boardSet.includes('Physics'),L.boardFirst+' | '+L.boardSet);
ok('A lever: then John pushes down, the log pops loose and he carries it',L.menu2.includes('John: push down on the lever')&&L.pop.includes('pops loose')&&L.pop.includes('right behind you')&&r.carrying,L.pop);
ok('A John keeps carrying the log; you can switch back and walk to Doc Alex with him following',r.switched&&r.w==='ok'&&r.johnNear,r.w);
ok('A walk up to Doc Alex (Alex as a mad scientist) and she briefs the crew',r.lbl==='Talk to Doc Alex'&&r.face&&r.lines[0].startsWith('Doc Alex')&&r.lines.join().includes('formula')&&r.lines.some(l=>l.startsWith('John'))&&r.lines.some(l=>l.startsWith('Lars')),r.lines.length+' lines');
ok('A agent select shows right as you arrive (3 agents, roles, powers, controls, LOCK IN), not again after the briefing',!r.howAgain&&r.how&&r.rows===3&&r.ctl.includes('Space')&&r.ctl.includes('F)')&&r.sel==='Agent select|LOCK IN|Initiator,Duelist,Sentinel'&&r.onOne===1&&r.lead===0,r.sel);
ok('A Doc Alex hands Joe her gadget: a "you got something" card, and he holds it',r.lines.join().includes('Laser panels hate it')&&r.lines.join().includes('GIGACOOKIES')&&r.lines.includes("CARD: Doc Alex's gadget")&&r.gadget===1,r.lines.slice(-4).join(' | '));
ok('A crew bar + objective + skill label',r.bar&&r.hud.includes('Bridge')&&r.lab==='Sonar',r.hud+' / '+r.lab);
// B. the gap: Lars tries the long jump (and finds ice cream), then John lays the log across
r=await p.evaluate(()=>{T.hints=[]; const w=T.walkTo(98,102); update(16.7); const lbl=prompt.textContent; action(); const menu=T.btns();
  [...$('dbtns').querySelectorAll('button')].find(b=>b.textContent==='Lars: long-jump it').click(); const cut1=T.clickThrough(); const L=heist.crew.find(c=>c.id==='lars'); let maxX=0, air=0, annoyed=false;
  for(let i=0;i<300;i++){SCENES.city.ambient(16.7); maxX=Math.max(maxX,L.x); air=Math.max(air,(heist.jump&&heist.jump.air)||0); annoyed=annoyed||heist.annoyT>0} const landed=Math.round(L.x); const cut=[...cut1,'JUMP '+Math.round(maxX)+' air '+Math.round(air)+' land '+landed+' annoyed '+annoyed,...T.clickThrough()].join(' / '); const ice=!$('reward').hidden&&$('rewardName').textContent; if(ice)collectReward();
  return {w,hint:T.hints.join(' / '),lbl,menu,cut,ice,st1:have.heistStage||0}});
await p.waitForTimeout(1000);
ok('B no hint about the gap any more (that line is gone)',!r.hint.includes('get across'),r.hint);
ok('B at the gap: Lars / the log / not yet',r.w==='ok'&&r.lbl==='Cross the gap'&&r.menu.join()==='Lars: long-jump it,John: lay the log across,Not yet',r.lbl+' | '+r.menu.join(' | '));
ok('B Lars really runs and jumps, boings back, John is annoyed',r.cut.includes('Headwind')&&/JUMP 12\d air 1\d land 112 annoyed true/.test(r.cut)&&!r.st1,r.cut);
ok('B ...and Lars lands next to a pint of Rosemary Maple ice cream',r.ice==='Rosemary Maple ice cream'&&r.cut.includes('Rosemary Maple'),r.ice);
r=await p.evaluate(()=>{T.clickThrough(); paused=false; T.walkTo(98,102); update(16.7); action(); [...$('dbtns').querySelectorAll('button')].find(b=>b.textContent==='John: lay the log across').click(); const done=T.clickThrough()[0]; return {done,st:have.heistStage,carrying:!!heist.carry}}); await p.evaluate(()=>T.clickThrough());
ok('B John lays the log across the gap',r.st===1&&!r.carrying&&r.done.includes('Log bridge'),r.done);
r=await p.evaluate(()=>{const seen=new Set(); for(let i=0;i<300;i++){if(!$('roundBanner').hidden)seen.add($('roundTitle').textContent); update(16.7)} return [...seen]});
ok('B no ROUND WON banner, straight to ROUND 2',!r.includes('ROUND WON')&&r.includes('ROUND 2'),r.join(', '));
r=await p.evaluate(()=>{T.hints=[]; const w=T.path([[110,102],[170,102]]); return {w,hint:T.hints,x:P.x}});
ok('B the crew crosses the log to roof B',r.w==='ok',r.w); ok('B Lars calls the searchlights',r.hint.join().includes('Searchlights')&&r.hint.join().includes('fast enough'),r.hint[0]);
// C. searchlights
r=await p.evaluate(()=>{switchTo(0); const w=T.walkTo(304,100); const msg=dlg.hidden?'':$('dtext').textContent; T.clickThrough(); return {w,msg,back:Math.round(P.x)+','+Math.round(P.y)}});
ok('C walking into the lights gets you caught and reset',r.w==='dialog'&&r.msg.includes('searchlight'),r.msg+' -> '+r.back);
r=await p.evaluate(()=>{const L=LIGHTS.find(L=>{const l=lightPos(L); return !inCover(l.x,l.y+7)&&!inCover(l.x+LIGHT_R+1,l.y+7)})||LIGHTS[0], l=lightPos(L); const c=heist.crew[2]; const keep={x:c.x,y:c.y};   // (a light that isn't over cover right now)
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
r=await p.evaluate(()=>{const hud=SCENES.city.hud().replace(/<[^>]+>/g,''); const off=!lightsOn(); heist.lightsOutT=40; T.run(5); const back=dlg.hidden?'':$('dtext').textContent; T.clickThrough(); const on=lightsOn(); update(16.7); action(); T.clickThrough(); return {hud,off,back,on,again:heist.lightsOutT>0}});
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
ok('D you mention the tripwires (and that you need a way to see them)',(r.hint.join()+r.said).includes('Tripwires'),r.hint[0]);
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
  switchTo(2); startDefuse(); const notJohn=prompt.textContent; const johnGrid=!$('lasergrid').hidden; switchTo(0); update(16.7);
  action(); const open=!$('lasergrid').hidden, watch=$('gridMsg').textContent, lit=$('lgrid').querySelectorAll('.lit').length, locked=$('lgrid').children[0].disabled;
  return {res,lbl,notJohn,johnGrid,open,watch,lit,locked,pos:(P.x|0)+','+(P.y|0)}});
ok('E Joe (crew on Hold) times the blink and the slider, dodges the guard, and gets through the maze',r.res.ok,JSON.stringify(r.res)+' at '+r.pos);
ok('E past the maze: only Joe can hack the laser panel; it opens a grid that shows a pattern to memorize',r.lbl==='Hack the laser panel'&&r.notJohn.includes('Only Joe')&&!r.johnGrid&&r.open&&r.watch.includes('Memorize')&&r.lit===7&&r.locked,JSON.stringify(r));
await p.waitForTimeout(2700);
r=await p.evaluate(()=>{ const go=$('gridMsg').textContent, open=!$('lgrid').children[0].disabled, want=[...lg.want], wrong=[...Array(16).keys()].find(i=>!lg.want.has(i));
  $('lgrid').children[wrong].click(); return {go,open,wrongMsg:$('gridMsg').textContent,bad:$('lgrid').querySelectorAll('.bad').length,want}});
ok('E after a moment the squares go dark and you tap them; a wrong square flashes red and it shows again',r.go.includes('same squares')&&r.open&&r.wrongMsg.includes('Wrong')&&r.bad===1,JSON.stringify(r));
const solve=async()=>{ await p.waitForTimeout(2700); return p.evaluate(()=>{ const board=$('lgrid').children.length, n=lg.want.size; for(const i of [...lg.want])$('lgrid').children[i].click(); return {msg:$('gridMsg').textContent,round:lg.round,board,n} }) };
await p.waitForTimeout(900); let g1=await solve(); await p.waitForTimeout(900); let g2=await solve(); await p.waitForTimeout(900); let g3=await solve(); await p.waitForTimeout(700);
r=await p.evaluate(()=>({said:T.clickThrough(),off:!!have.lasersOff,closed:$('lasergrid').hidden}));
ok('E the board grows each round (5x5, 6x6, 7x7) with more squares (7, 10, 14)',[g1.board,g2.board,g3.board].join()==='25,36,49'&&[g1.n,g2.n,g3.n].join()==='7,10,14',JSON.stringify([g1,g2,g3]));
ok('E three rounds from memory shut every laser off',g1.round===1&&g1.msg.includes('Nice')&&g2.round===2&&g3.round===3&&r.off&&r.closed&&r.said[0].includes('Lasers off'),JSON.stringify([g1,g2,g3,r.said[0]]));
r=await p.evaluate(()=>{const L=[]; SCENES.city.ents(L); const guardGone=!L.some(e=>e.draw===drawGuard); const on=boss.on, ph=boss.phase, st=have.heistStage;
  update(16.7); const lbl=prompt.hidden?'':prompt.textContent; return {on,ph,st,lbl,guardGone,boss:!!document.getElementById('boss')}});
ok('E lasers off: the Confectioner pops up right on the roof (no pop-up window, no hatch to pry open)',r.on&&r.ph==='appear'&&r.st===3&&r.guardGone&&!r.boss&&!r.lbl.includes('hatch'),JSON.stringify(r));
// G0. the Confectioner, on the roof: line up under him and press A to zap him with Doc Alex's gadget; he turns into a gingerbread man
r=await p.evaluate(()=>{for(let k=0;k<60&&dlg.hidden;k++)update(16.7); const intro=T.clickThrough(); const fighting=boss.phase==='fight', hud=SCENES.city.hud(), lbl=SCENES.city.abilityLabel();
  const bossSong=song; const moves=[]; for(let k=0;k<20;k++){bossTick(50); moves.push(Math.round(boss.x))}
  switchTo(1); boss.cool=0; bossFire(); const notLars=prompt.textContent, larsHits=boss.hits; switchTo(0);
  boss.pause=0; boss.cool=0; P.y=AIM.Y+24; P.x=boss.x>460?AIM.MIN:AIM.MAX; bossFire(); const missMsg=prompt.textContent, afterMiss=boss.hits;
  const hitOnce=()=>{ boss.cool=0; boss.pause=0; boss.stun=0; boss.canes=[]; P.x=boss.x; P.y=AIM.Y+24; bossFire() };
  boss.canes=[{x:P.x,y:P.y-30}]; boss.stun=0; for(let k=0;k<12&&!boss.stun;k++)bossTick(16.7); const stunned=boss.stun>0, stunMsg=prompt.textContent; boss.cool=0; const h0=boss.hits; P.x=boss.x; bossFire(); const noFireStunned=boss.hits===h0; boss.stun=0;
  hitOnce(); const taunt1=prompt.textContent, hit1=boss.hits, hud1=SCENES.city.hud(); hitOnce(); hitOnce(); const zap=boss.phase;
  P.y=AIM.Y; bossTick(16); const pushed=P.y>AIM.Y;
  for(let k=0;k<80;k++)bossTick(50);
  const after=song; const win=T.clickThrough(); return {okMiss:HEIST.bossMiss.includes(missMsg),okTaunt:taunt1===HEIST.bossTaunts[0],bossSong,after,hud,hud1,lbl,intro,fighting,moves:new Set(moves).size,notLars,larsHits,missMsg,afterMiss,taunt1,hit1,zap,pushed,win,beat:!!have.confectionerBeat,stunned,stunMsg,noFireStunned,choc:(()=>{const c=chocSpot(); P.x=c.x; P.y=c.y+2; update(16.7); return near&&near.label})()}});
ok('G0 he talks first, then the fight is on the roof (HUD counts the hits; A says Zap)',r.intro.some(l=>l.startsWith('The Confectioner:'))&&r.fighting&&r.hud.includes('Zap the Confectioner')&&r.hud.includes('○○○')&&r.lbl==='Zap',r.intro.join(' | ')+' / '+r.hud+' / '+r.lbl);
ok('G0 he dodges side to side; only Joe can zap; out of line misses, right under him hits (and his hat turns to gingerbread)',r.moves>5&&r.larsHits===0&&r.notLars.includes('Only Joe')&&r.afterMiss===0&&r.okMiss&&r.hit1===1&&r.okTaunt&&r.hud1.includes('●○○'),JSON.stringify({m:r.moves,miss:r.missMsg,t:r.taunt1,h:r.hud1,l:r.notLars}));
ok('G0 you can\'t walk up into him',r.pushed);
ok('G0 the fight has its own music, and the heist music comes back after',r.bossSong==='boss'&&r.after==='heist',r.bossSong+' / '+r.after);
ok('G0 he throws candy canes: one to the head stuns you (no zapping while you see stars)',r.stunned&&r.stunMsg.includes('Candy cane')&&r.noFireStunned,r.stunMsg);
ok('G0 three hits zap him into a gingerbread man (a big show), and the chocolate drops on the roof',r.zap==='zap'&&r.beat&&r.win.join().includes('gingerbread man')&&r.choc==='Pick up the chocolate',r.choc+' / '+r.win.join(' | '));
// G. pick up the chocolate; the fire escape shows up; the crew still follows; walk over and Lars challenges you
r=await p.evaluate(()=>{action(); const fin=T.clickThrough(); const st4=have.heistStage, held=!!have.chocHeld;
  if(!heist.follow)toggleFollow(); const L=heist.crew.find(c=>c.id==='lars'), before=Math.hypot(L.x-P.x,L.y-P.y); T.walkTo(436,100); T.run(80); const after=Math.hypot(L.x-P.x,L.y-P.y);
  const w=T.walkTo(474,64); update(16.7); const exitLbl=prompt.textContent; action(); const lars=[]; for(let i=0;i<10&&!dlg.hidden&&!T.btns().includes('Bring it');i++){lars.push($('dspeaker').textContent+': '+$('dtext').textContent); $('dbtns').querySelector('button').click()}
  const btns=T.btns(); const bring=[...$('dbtns').querySelectorAll('button')].find(b=>b.textContent==='Bring it'); if(bring)bring.click(); return {fin,st4,held,before:Math.round(before),after:Math.round(after),w,exitLbl,lars,btns,ana:!$('anagram').hidden,st:have.heistStage}});
ok('G pick up the chocolate: "Why so salty?", the finale, and the fire escape shows up',r.held&&r.fin[0].includes('Chocolate')&&r.fin.some(l=>l.includes('salty'))&&r.fin.some(l=>l.includes('final ingredient'))&&r.st4===4,JSON.stringify(r.fin.slice(-2)));
ok('G the crew keeps following you after the lasers (the old bug)',r.after<40,r.before+' -> '+r.after);
ok('G walk to the fire escape: Lars challenges you to anagrams',r.w==='ok'&&r.exitLbl==='Climb down the fire escape'&&r.lars.some(l=>l.includes('Anagrams'))&&r.btns.join()==='Bring it'&&r.ana&&r.st===4,r.w+' / '+r.exitLbl);
r=await p.evaluate(()=>{$('anagram').hidden=true; ana.open=false; return 1});
r=await p.evaluate(()=>{openAnagrams(); return 1});
r=await p.evaluate(()=>{const seen=new Set(); for(let k=0;k<30;k++){$('anagram').hidden=true; ana.open=false; openAnagrams(); seen.add(ana.set.letters)} return seen.size});
ok('G lots of different letter sets',r>=8,r+' sets seen in 30 games');
r=await p.evaluate(()=>{$('anagram').hidden=true; ana.open=false; openAnagrams(); anaGo(); const seen=[]; for(let i=0;i<60*20;i++){update(16.7); const t=$('anaLarsWord').textContent; if(t&&!seen.includes(t))seen.push(t)}
  const leaked=ana.larsFound.filter(w=>seen.some(t=>t.toUpperCase().includes(w.toUpperCase())));
  return {seen:seen.slice(0,3),found:ana.larsFound.length,leaked}});
ok('G during the game you only see Lars\'s points, never his words',r.found>0&&r.seen.length>0&&r.leaked.length===0&&r.seen.every(t=>/\+\d+/.test(t)),JSON.stringify(r));
r=await p.evaluate(()=>{$('anagram').hidden=true; ana.open=false; return 1});
r=await p.evaluate(()=>{openAnagrams(); anaGo(); const type=w=>{for(const ch of w){const i=ana.letters.findIndex((l,j)=>l===ch&&!ana.picked.includes(j)); ana.picked.push(i)} anaSubmit(); return $('anaMsg').textContent};
  const msgs=[type('ZZZ'.slice(0,0)+ana.set.letters.slice(0,3).split('').reverse().join(''))];
  const ws=[...ana.set.words[6],...ana.set.words[5]]; for(const w of ws)msgs.push(type(w)); const dup=type(ws[0]);
  for(let i=0;i<60*62;i++)update(16.7); const res=$('anaResult').textContent; $('anaNext').click(); const dancer=heist.dance&&heist.dance.who; T.run(Math.ceil(DANCE_MS/16.7)+5); const lines=T.clickThrough();
  return {msgs,dup,res,lines,dancer,reward:!$('reward').hidden,name:$('rewardName').textContent,st:have.heistStage,lars:ana.lars,you:ana.you}});
ok('G real words score, repeats don\'t',r.msgs.slice(1).every(m=>m.includes('+'))&&r.dup.includes('Already'),r.msgs.slice(0,3).join(' | '));
ok('G beat Lars: Joe does a little dance, Lars carries it, chocolate',r.dancer==='hero'&&r.res.startsWith('Joe wins')&&r.lines.join().includes('two out of three')&&r.reward&&r.name==='Chocolate'&&r.st===5,`${r.you} vs ${r.lars}: ${r.res}`);
if(await p.evaluate(()=>$('reward').hidden)){console.log(R.join('\n'));console.log('stopped before reward', errs);process.exit(1)}
await p.click('#rewardArt',{force:true}); await p.waitForTimeout(900);
r=await p.evaluate(()=>({city:!!have.city,basket:$('basket').textContent}));
ok('G chocolate in the basket',r.city&&r.basket.includes('Chocolate'));
// H. the way home: just a quick word (no long cutscene), then back on the main map
r=await p.evaluate(()=>{const ks=()=>{const l=[];for(let i=0;i<15&&!dlg.hidden&&!l.join().includes('Settings');i++){l.push($('dspeaker').textContent+': '+$('dtext').textContent);const bs=[...$('dbtns').querySelectorAll('button')];(bs.find(x=>x.textContent==='Next')||bs[0]).click()}if(!$('itemCard').hidden){l.push('CARD: '+$('itemName').textContent+' | '+$('itemLine').textContent+' '+$('itemTip').textContent); $('itemBtn').click()} return {l,gear:Object.keys(have.gear||{}).join()}};window.K=ks(); const lines=T.clickThrough(); T.run(60); return {k:K,lines,world:scene===SCENES.world,bar:$('crewbar').hidden}});
ok('H Doc Alex hands Joe her spare goggles',r.k.l[0].startsWith('Doc Alex')&&r.k.gear.includes('goggles'),r.k.l[0]);
ok('H no extra lines on the way out: straight back to the map',r.lines.length===0&&r.world&&r.bar,JSON.stringify(r));
// I. reload mid-heist resumes at the right checkpoint
await fresh(); await p.evaluate(()=>{have.heistStage=2; have.heistBriefed=true; save()}); await p.reload(); await p.click('#startBtn'); await p.evaluate(()=>skipWelcome()); await p.evaluate(helpers);
r=await p.evaluate(()=>{T.enter(); const sp=dlg.hidden?'':$('dspeaker').textContent; return {sp,pos:(P.x|0)+','+(P.y|0),onC:hit(R(P.x-1,P.y-1,2,2),ROOF_C)}}); ok('I reload at stage 2 starts on roof C, no briefing',r.sp!=='Doc Alex'&&r.onC,r.pos+' '+r.sp);
// J. checkpoints are safe to stand on
r=await p.evaluate(()=>{const bad=[]; for(let st=0;st<3;st++){have.heistStage=st; placeAtCheckpoint(); T.clickThrough(); for(let i=0;i<900;i++){update(16.7); if(!dlg.hidden){if($('dspeaker').textContent==='Spotted!'){bad.push(st+': '+$('dtext').textContent); T.clickThrough(); break} T.clickThrough()}}} return bad});
ok('J standing still at each checkpoint never gets you caught',r.length===0,r.join('; '));
// K. lose to Lars: he dances, then Joe lugs the (huge) chocolate to the fire escape himself, and that's it: no rematch needed
await fresh(); await p.evaluate(()=>{Object.assign(have,{heistStage:4,heistBriefed:true,heistHowTo:true,lasersOff:true,confectionerBeat:true,chocHeld:true}); save()}); await p.reload(); await p.click('#startBtn'); await p.evaluate(()=>skipWelcome()); await p.evaluate(helpers);
r=await p.evaluate(()=>{T.enter(); T.clickThrough(); openAnagrams(); anaGo(); for(let i=0;i<60*62;i++)update(16.7); const res=$('anaResult').textContent; $('anaNext').click(); const dancer=heist.dance&&heist.dance.who;
  const frozen=(()=>{const x=P.x; dirs.right=true; T.run(10); dirs.right=false; return P.x===x})(); T.run(Math.ceil(DANCE_MS/16.7)+5); const gloat=T.clickThrough(); const lugging=!!heist.lug;
  let t=0; while(heist.lug&&t<20000){update(16.7); t+=16.7} return {res,dancer,frozen,gloat,lugging,t:Math.round(t),reward:!$('reward').hidden,name:$('rewardName').textContent,st:have.heistStage}});
ok('K lose to Lars: he does a little dance (you can\'t walk off mid-dance), then gloats',r.res.startsWith('Lars wins')&&r.dancer==='lars'&&r.frozen&&r.gloat.join().includes('Loser carries'),r.gloat.join(' | '));
ok('K then Joe lugs the giant chocolate over and down the fire escape himself, and you get the chocolate anyway',r.lugging&&r.t>2000&&r.t<15000&&r.reward&&r.name==='Chocolate'&&r.st===5,JSON.stringify(r));
console.log(R.join('\n')); console.log('page errors:',errs.length?errs:'none'); await b.close()})();
