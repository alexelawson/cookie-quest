// Fargo: the scooter race against Lil Q, right through town (top-down, on the same streets you drive).
// Steer with the arrows. Two laps: hit the three checkpoints in order (the arrow by Joe points to the next one), then back past Lil Q's.
// Alex cheers from the car at Lil Q's when you come by.
// Roads are fast and grass is slow. The two dirt paths are shortcuts, and the orange arrows on the road give you a burst of speed.
// Lil Q sticks to the roads. Words live in story.js (FARGO.race...).
const RACE={
  ROAD:.1, GRASS:.05,               // your speed on roads + dirt paths / on grass (px/ms)
  BOOST:1.6, BOOST_MS:1100,         // the orange arrows: how much faster, and for how long
  Q_SPEED:.11,                      // Lil Q's speed (she never leaves the road). Lower = easier race
  COUNT:2400,                       // the 3-2-1-GO countdown
  CP_R:16,                          // how close counts as reaching a checkpoint
  LAPS:2,                           // laps around town
};
const RACE_START={x:334,y:175}, RACE_FINISH=R(300,168,54,56);   // the finish: the road in front of Lil Q's, and her lot
// the checkpoints, in order: by the Fargo Theatre, the farm (bottom left), the barn (bottom right). Then the finish at Lil Q's.
const RACE_CPS=[{x:103,y:52,name:'the Theatre'},{x:52,y:302,name:'the farm'},{x:392,y:302,name:'the barn'}];
const RACE_PADS=[{x:222,y:120,d:'up'},{x:52,y:180,d:'down'},{x:220,y:302,d:'right'},{x:392,y:240,d:'up'}];   // the boost arrows
const Q_PATH=[{x:322,y:186},{x:222,y:184},{x:222,y:56},{x:103,y:56},{x:56,y:56},{x:56,y:306},{x:392,y:306},{x:396,y:184},{x:330,y:184}];   // Lil Q's line, all roads
const race={phase:'count', t:0, cp:0, lap:0, qlap:0, boost:0, qi:1, qx:0, qy:0, qdir:'left', won:null, say:'', tauntT:0, taunt:2600, pops:[], padUsed:{}, cheer:'', cheerT:0};

function openRace(){ goTo('scooter','start') }
function raceReset(){
  Object.assign(race,{phase:'count',t:0,cp:0,lap:0,qlap:0,cheer:FARGO.raceCheer[0],cheerT:2400,boost:0,qi:1,qx:Q_PATH[0].x,qy:Q_PATH[0].y,qdir:'left',won:null,say:'',tauntT:0,taunt:2600,pops:[],padUsed:{}});
  P.x=RACE_START.x; P.y=RACE_START.y; P.dir='left'; for(const k in dirs)dirs[k]=false;
}
const raceLeft=()=>{   // how far you still have to go (straight lines between what's left), for 1st/2nd
  let d=0, x=P.x, y=P.y; for(let i=race.cp;i<RACE_CPS.length;i++){d+=Math.hypot(RACE_CPS[i].x-x,RACE_CPS[i].y-y); x=RACE_CPS[i].x; y=RACE_CPS[i].y} return d+Math.hypot(330-x,180-y)+(RACE.LAPS-1-race.lap)*lapLen() };
const lapLen=()=>{ let d=0, x=330, y=180; for(const c of RACE_CPS){d+=Math.hypot(c.x-x,c.y-y); x=c.x; y=c.y} return d+Math.hypot(330-x,180-y) };
const qLeft=()=>{ if(race.qi>=Q_PATH.length)return 0; let d=Math.hypot(Q_PATH[race.qi].x-race.qx,Q_PATH[race.qi].y-race.qy); for(let i=race.qi;i<Q_PATH.length-1;i++)d+=Math.hypot(Q_PATH[i+1].x-Q_PATH[i].x,Q_PATH[i+1].y-Q_PATH[i].y); return d*.86+(RACE.LAPS-1-race.qlap)*lapLen() };   // (her road distance, scaled to roughly match straight lines)
function racePop(text,col){ race.pops.push({text:text.toUpperCase(),col:col||'#ffffff',t:0}) }
function raceTick(dt){
  for(const p of race.pops)p.t+=dt; race.pops=race.pops.filter(p=>p.t<900);
  if(race.tauntT>0)race.tauntT-=dt; if(race.cheerT>0)race.cheerT-=dt;
  if(race.phase==='count'){ const was=race.t; race.t+=dt; const n=k=>Math.floor(k/(RACE.COUNT/3)); if(n(race.t)!==n(was)&&race.t<RACE.COUNT)sfx('blip');
    if(race.t>=RACE.COUNT){race.phase='go'; race.t=0; sfx('ding')} return }
  if(race.phase==='done'){ race.t+=dt; if(race.t>=900&&race.t-dt<900)raceOver(); return }
  race.t+=dt; if(race.boost>0)race.boost-=dt;
  // Lil Q, along her line
  let step=RACE.Q_SPEED*dt*(1+.04*Math.sin(race.t/900));
  while(step>0&&race.qi<Q_PATH.length){ const t=Q_PATH[race.qi], dx=t.x-race.qx, dy=t.y-race.qy, d=Math.hypot(dx,dy);
    if(Math.abs(dx)>Math.abs(dy))race.qdir=dx<0?'left':'right'; else race.qdir=dy<0?'up':'down';
    if(d<=step){race.qx=t.x; race.qy=t.y; step-=d; race.qi++; if(race.qi>=Q_PATH.length&&race.qlap<RACE.LAPS-1){race.qlap++; race.qi=1}} else {race.qx+=dx/d*step; race.qy+=dy/d*step; step=0} }
  // you: boost arrows, checkpoints, the finish
  RACE_PADS.forEach((p,i)=>{ if(Math.hypot(P.x-p.x,P.y-p.y)<9){ if(!race.padUsed[i]){race.boost=RACE.BOOST_MS; sfx('whoosh'); racePop(FARGO.raceBoost,'#ffd84d')} race.padUsed[i]=1 } else race.padUsed[i]=0 });
  const cp=RACE_CPS[race.cp]; if(cp&&Math.hypot(P.x-cp.x,P.y-cp.y)<RACE.CP_R){ race.cp++; sfx('good'); racePop(race.cp<RACE_CPS.length?`${FARGO.raceCP} ${race.cp}/${RACE_CPS.length}`:FARGO.raceHome,'#9be89b') }
  if((race.taunt-=dt)<=0){ race.taunt=4200; race.say=FARGO.raceTaunts[Math.floor(race.t/4200)%FARGO.raceTaunts.length]; race.tauntT=2200 }
  if(race.cp>=RACE_CPS.length&&race.lap<RACE.LAPS-1&&hit(R(P.x-4,P.y-3,8,4),RACE_FINISH)){ race.lap++; race.cp=0; sfx('ding'); racePop(FARGO.raceLap2,'#ffd84d'); race.cheer=FARGO.raceCheer[1+race.lap%2]; race.cheerT=2600 }   // around again (Alex cheers)
  const youDone=race.lap>=RACE.LAPS-1&&race.cp>=RACE_CPS.length&&hit(R(P.x-4,P.y-3,8,4),RACE_FINISH), qDone=race.qi>=Q_PATH.length&&race.qlap>=RACE.LAPS-1;
  if(youDone||qDone){ race.won=youDone; race.phase='done'; race.t=0; race.tauntT=0; for(const k in dirs)dirs[k]=false; sfx(race.won?'fanfare':'bad') }
}
function raceOver(){
  const back=()=>{ fargo.fromRace=true; goTo('fargo','fromRace') };
  if(race.won){
    if(have.fargo){ fargo.replay=false; return say([[FARGO.bob,FARGO.replayWon]],back) }
    have.fargoStage='store'; save(); fargo.afterRace=true;
    return say(FARGO.raceWon.map(t=>[FARGO.bob,t]),()=>goTo('fargo','fromRace'));
  }
  showDialog({place:FARGO.place,speaker:FARGO.bob,pages:FARGO.raceLost,actions:[{label:FARGO.rematch,fn:()=>{closeDialog();raceReset()}},{label:FARGO.raceQuit,ghost:true,fn:()=>{closeDialog();fargo.replay=false;back()}}]});
}
function raceHowTo(then){
  const c=document.createElement('canvas'); c.width=c.height=32; const g=c.getContext('2d'); g.fillStyle='#f3e3c4'; g.fillRect(0,0,32,32);
  const keep=ctx; ctx=g; try{ drawTopScooter(16,29,'down','#e8742a'); drawBob(16,27) } finally { ctx=keep }
  const row=document.createElement('div'); row.className='hrow'; const tx=document.createElement('div'); tx.innerHTML=FARGO.howToWho; row.append(c,tx);
  $('howTitle').textContent=FARGO.howToTitle; $('howRows').replaceChildren(row);
  $('howControls').replaceChildren(...FARGO.howToSteps.map(x=>{const li=document.createElement('li'); li.textContent=x; return li}));
  $('howOk').textContent=FARGO.howToOk; $('howOk').onclick=()=>{ $('howto').hidden=true; paused=false; then&&then() };
  paused=true; prompt.hidden=true; $('howto').hidden=false; setTimeout(()=>$('howOk').focus({preventScroll:true}),0);
}

// ---------- drawing ----------
// a kick scooter seen from above: deck, two wheels, the handlebar at the front
function drawTopScooter(x,y,dir,deck){ const F=(c,dx,dy,w,h)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x)+dx,Math.round(y)+dy,w,h)};
  F('rgba(0,0,0,.22)',-7,1,15,2);
  if(dir==='left'||dir==='right'){ const f=dir==='right'?1:-1; F('#1d1d22',-8,-1,3,3); F('#1d1d22',6,-1,3,3); F(deck,-6,-1,12,2); F('#9aa0aa',f>0?5:-6,-4,1,4); F('#1d1d22',f>0?4:-7,-5,3,1) }
  else { F('#1d1d22',-1,-7,3,3); F('#1d1d22',-1,3,3,3); F(deck,-1,-5,2,9); F('#1d1d22',-3,dir==='up'?-7:4,7,1) }
}
function drawCheckpoint(cp,i){
  const next=i===race.cp, done=i<race.cp, x=cp.x, y=cp.y, F=(c,dx,dy,w,h)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x)+dx,Math.round(y)+dy,w,h)}, on=Math.floor(time/250)%2;
  if(next){ ctx.strokeStyle=on?'rgba(255,216,77,.95)':'rgba(255,255,255,.7)'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(x,y,RACE.CP_R-3,0,Math.PI*2); ctx.stroke() }   // a ring on the road
  F('#5f6676',10,-18,1,18); F(done?'#7f8692':'#ffffff',11,-18,8,6); if(!done)for(let k=0;k<4;k++)F('#1d1d22',11+k*2,-18+(k%2)*3,2,3);   // a checkered flag on a pole
  F(done?'#5f6676':next?'#c8322b':'#2b2f3a',6,-26,11,8); pixText(ctx,String(i+1),10,-25,'#ffffff');
}
function drawPad(p){ const F=(c,dx,dy,w,h)=>{ctx.fillStyle=c;ctx.fillRect(p.x+dx,p.y+dy,w,h)}, k=Math.floor(time/120)%3;
  F('rgba(232,116,42,.35)',-7,-7,14,14);
  for(let i=0;i<3;i++){ const c=i===k?'#fff3a8':'#e8742a', o=-4+i*4;   // three chevrons, running
    if(p.d==='up')for(let j=0;j<4;j++){F(c,-j-1,o+j,1,1);F(c,j,o+j,1,1)} else if(p.d==='down')for(let j=0;j<4;j++){F(c,-j-1,-o-j,1,1);F(c,j,-o-j,1,1)}
    else for(let j=0;j<4;j++){F(c,-o-j,-j-1,1,1);F(c,-o-j,j,1,1)} }
}
function drawRaceArrow(){   // points from Joe to where to go next
  const t=race.cp<RACE_CPS.length?RACE_CPS[race.cp]:{x:330,y:180}, a=Math.atan2(t.y-P.y,t.x-P.x), d=Math.hypot(t.y-P.y,t.x-P.x); if(d<24)return;
  const cx=P.x+Math.cos(a)*16, cy=P.y-8+Math.sin(a)*16; ctx.save(); ctx.translate(Math.round(cx),Math.round(cy)); ctx.rotate(a);
  ctx.fillStyle='#1d2130'; ctx.beginPath(); ctx.moveTo(6,0); ctx.lineTo(-4,-5); ctx.lineTo(-2,0); ctx.lineTo(-4,5); ctx.closePath(); ctx.fill();
  ctx.fillStyle=Math.floor(time/250)%2?'#fff3a8':'#f4d35e'; ctx.beginPath(); ctx.moveTo(4,0); ctx.lineTo(-3,-3); ctx.lineTo(-1,0); ctx.lineTo(-3,3); ctx.closePath(); ctx.fill(); ctx.restore();
}

SCENES.scooter={ place:FARGO.place, music:'fargo',
  w:FW, h:FH, bounds:R(0,0,FW,FH), bg:fargoBg, triggers:[],
  get solids(){ const l=STATIONS[0].lot; return [...SCENES.fargo.baseSolids, R(l.x+19,l.y+8,22,12), R(l.x+5,l.y+9,6,4)] },   // (+ the parked CR-V and Alex)
  entries:{start:{x:RACE_START.x,y:RACE_START.y,dir:'left'}},
  speed:()=>race.phase!=='go'?0:(onRoad(P.x,P.y)?RACE.ROAD:RACE.GRASS)*(race.boost>0?RACE.BOOST:1),
  enter(){ raceReset(); if(!have.raceHowTo)race.phase='wait' },   // (the how-to card first, the very first time)
  ambient(dt){ if(paused||fade.next)return;
    if(race.phase==='wait')return raceHowTo(()=>{have.raceHowTo=true; save(); race.phase='count'; race.t=0});
    raceTick(dt) },
  drawPlayer:(x,y)=>{ drawTopScooter(x,y+1,P.dir,'#c8322b'); drawPlayer(x,y);
    if(race.boost>0)for(let k=0;k<3;k++){ctx.fillStyle='rgba(255,216,77,.8)'; const d=P.dir, ox=d==='left'?8+k*3:d==='right'?-10-k*3:-1+k*2-2, oy=d==='up'?4+k*3:d==='down'?-24-k*3:-12+k*4; ctx.fillRect(Math.round(x+ox),Math.round(y+oy),d==='left'||d==='right'?3:1,d==='left'||d==='right'?1:3)} },
  ents(list){
    fargoTrees.forEach(([x,y])=>list.push({y,draw:()=>ctx.drawImage(pineSprite,x-6,y-17)}));
    list.push({y:TOWER.y,draw:drawWaterTower},{y:THEATRE.y+THEATRE.h,draw:drawTheatreSign},{y:DEB.y,draw:()=>drawDeb(DEB.x,DEB.y)});
    EXIT_SIGNS.forEach(e=>list.push({y:e.y+18,draw:()=>drawExitSign(e)}));
    const b=STATIONS[0]; list.push({y:b.y+26,draw:()=>drawBike(b.x+43,b.y+12)});
    RACE_CPS.forEach((cp,i)=>list.push({y:cp.y,draw:()=>drawCheckpoint(cp,i)}));
    list.push({y:race.qy,draw:()=>{ drawTopScooter(race.qx,race.qy+1,race.qdir,'#e8742a'); drawBob(race.qx,race.qy) }});
    const lot=STATIONS[0].lot; list.push({y:lot.y+20,draw:()=>drawCar(lot.x+30,lot.y+14,'right',true)});   // the CR-V, parked at Lil Q's, with Alex cheering beside it
    list.push({y:lot.y+12,draw:()=>drawAlex(lot.x+8,lot.y+12-(race.cheerT>0&&Math.floor(time/180)%2?2:0),'happy')});
  },
  under(){ STATIONS.forEach(drawSign); STATIONS.forEach(drawShopSign); RACE_PADS.forEach(drawPad);
    for(let y=168;y<192;y+=3)for(let k=0;k<2;k++){ctx.fillStyle=(y/3+k)%2?'#ffffff':'#1d1d22'; ctx.fillRect(351+k*3,y,3,3)}   // the finish line across the road...
    for(let x=300;x<354;x+=3)for(let k=0;k<2;k++){ctx.fillStyle=(x/3+k)%2?'#ffffff':'#1d1d22'; ctx.fillRect(x,213+k*3,3,3)} },   // ...and across the back of her lot (where the shortcut comes in)
  over(){
    const F=(c,x,y,w,h)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),w,h)};
    for(const s of STATIONS){ ctx.fillStyle='rgba(241,244,248,.6)'; ctx.fillRect(s.x+8,s.y+3,32,10); ctx.fillStyle=s.brand; ctx.fillRect(s.x+8,s.y+11,32,2) }
    if(race.phase==='go')drawRaceArrow();
    for(const p of race.pops){ const w=textW(p.text)+6, x=Math.round(P.x-w/2), y=Math.round(P.y-40-p.t/60); F('#1d2130',x-1,y-1,w+2,10); F('rgba(29,33,48,.85)',x,y,w,8); pixText(ctx,p.text,x+3,y+1,p.col) }
    if(race.tauntT>0&&race.say){ const words=race.say.toUpperCase().split(' '), lines=['']; for(const w of words){ if((lines[lines.length-1]+' '+w).trim().length>20)lines.push(w); else lines[lines.length-1]=(lines[lines.length-1]+' '+w).trim() }
      const w=Math.max(...lines.map(l=>textW(l)))+6, h=lines.length*7+4, x=Math.round(race.qx-w/2), y=Math.round(race.qy)-28-h;
      F('#1d2130',x-1,y-1,w+2,h+2); F('#fff6e0',x,y,w,h); F('#fff6e0',x+w/2-1,y+h,3,2); lines.forEach((l,i)=>pixText(ctx,l,x+3,y+3+i*7,'#7a3a12')) }
    if(race.cheerT>0&&race.cheer){ const lot=STATIONS[0].lot, t=('Alex: '+race.cheer).toUpperCase(), w=textW(t)+6, x=Math.max(2,Math.round(lot.x+8-w/2)), y=lot.y+26;   // (under her, over the shop roof, so it never covers the racers)   // Alex's cheer, in a bubble
      F('#1d2130',x-1,y-1,w+2,10); F('#ffffff',x,y,w,8); F('#ffffff',lot.x+7,y-2,3,2); pixText(ctx,t,x+3,y+1,'#c8322b') }
    const tf=ctx.getTransform(); ctx.setTransform(1,0,0,1,0,0);
    if(race.phase==='count'){ const n=3-Math.floor(race.t/(RACE.COUNT/3)); ctx.save(); ctx.translate(VW/2-6,52); ctx.scale(3,3); pixText(ctx,String(Math.max(1,n)),0,0,'#ffd84d'); ctx.restore() }
    else if(race.phase==='go'&&race.t<700){ ctx.save(); ctx.translate(VW/2-10,52); ctx.scale(3,3); pixText(ctx,'GO',0,0,'#9be89b'); ctx.restore() }
    else if(race.phase==='done'){ const t=race.won?'YOU WIN':'LIL Q WINS'; ctx.save(); ctx.translate(VW/2-textW(t)*1.5,52); ctx.scale(3,3); pixText(ctx,t,0,0,race.won?'#ffd84d':'#ff8a8a'); ctx.restore() }
    ctx.setTransform(tf);
  },
  hud(){ const place=raceLeft()<=qLeft()?'1st':'2nd', cp=race.cp<RACE_CPS.length?`${FARGO.raceCP} ${race.cp+1}/${RACE_CPS.length}: ${RACE_CPS[race.cp].name}`:FARGO.raceHome;
    return `<span>${place}</span><span>${FARGO.raceLap} ${race.lap+1}/${RACE.LAPS}</span><span>${cp}</span>` },
};
