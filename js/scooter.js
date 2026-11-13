// Fargo: the scooter race against Lil Q, down Broadway to the Fargodome. Side view.
// You don't steer. You KICK (A / Space) in rhythm: a dot sweeps across the meter after every kick, and kicking while it's in the
// green is a good kick. Too early and you wobble (lose speed), too late and the kick is weak. Tuck in right behind Lil Q to draft:
// you slow down less, and a full draft bar turns your next good kick into a SLINGSHOT. Words live in story.js (FARGO.race...).
const RACE={
  START:60, FINISH:2400,          // where the start and finish lines are (px)
  PERIOD:600, GREEN:[.55,.85],    // the meter: how long the dot takes to cross (ms), and where the green zone is
  KICK:.037, LATE:.018, SLING:.11, EARLY_LOSS:.85,  // speed from a good kick / a late one / a slingshot; a too-early kick keeps 85% of your speed
  DECAY:1600, DRAFT_DECAY:3000,   // how fast you slow down on your own, and while drafting (bigger = slower)
  DRAFT:[4,40], DRAFT_MS:1400,    // how close behind her counts as drafting (px), and how long to fill the bar
  Q_SPEED:.126, Q_ACCEL:900,      // Lil Q: steady top speed (19 mph on the readout), and how fast she gets there. Lower = easier race
  MAX:.32, MPH:150,               // top speed; px/ms -> mph for the readout
  COUNT:2400,                     // the 3-2-1-GO countdown
};
const LANE={JOE:150, Q:134};
const race={phase:'count', t:0, x:RACE.START, v:0, kt:0, kicks:0, wob:0, kickAnim:0, qx:RACE.START, qv:0, draft:0, ready:false, sling:0, pops:[], taunt:0, won:null};

// ---------- Broadway, painted once ----------
const raceBg=document.createElement('canvas'); raceBg.width=RACE.FINISH+260; raceBg.height=VH;
(function(){
  const g=raceBg.getContext('2d'), W=raceBg.width, F=(c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};
  for(let y=0;y<72;y++){const k=y/72; F(`rgb(${143+k*60|0},${199+k*34|0},${234+k*10|0})`,0,y,W,1)}                  // summer sky
  for(let i=0;i<24;i++){const x=i*137%W, y=10+(i*29)%34; F('#ffffff',x,y,18,3); F('#ffffff',x+4,y-2,10,2); F('#e8f3fa',x+2,y+3,14,1)}   // clouds
  F('#c9b878',0,72,W,32); for(let i=0;i<W/3;i++)F(['#bfa865','#d9c98e','#a9a35a'][i%3],rnd()*W|0,72+rnd()*30|0,2,1);   // prairie, flat as a table
  for(let x=120;x<W;x+=420){ F('#c9ccd2',x,40,10,34); F('#b4b8c0',x+10,46,8,28); F('#9aa0aa',x,40,10,2); F('#8a8f9a',x+3,36,4,4) }   // grain elevators on the horizon
  for(let x=330;x<W;x+=640){ F('#9fb0c2',x-8,54,16,9); F('#7d8694',x-6,63,2,10); F('#7d8694',x+4,63,2,10); pixText(g,'FARGO',x-7,56,'#2f5f9e') }   // water towers
  // downtown: brick storefronts with awnings along Broadway, then open road to the Fargodome
  const awn=['#c8322b','#2f8a4a','#2f6db0','#e08a2a','#7a4fa0','#d2a32a'];
  for(let x=180,k=0;x<1500;x+=46,k++){
    if(x>660&&x<760)continue;                                   // (the theatre goes here)
    const h=26+(k*7)%14, wall=['#9a3f30','#b5654f','#8a6a4a','#c9a06a','#7f5a44'][k%5];
    F(wall,x,104-h,42,h); for(let y=104-h+3;y<104;y+=3)F('rgba(0,0,0,.08)',x,y,42,1);
    F('#efe2c0',x,104-h,42,2); for(let wx=x+4;wx<x+38;wx+=10)F('#ffd98a',wx,104-h+6,6,5);   // upstairs windows
    F('#2b3a4f',x+4,92,22,10); F('#9fd2f0',x+5,93,20,4); F('#5a3a22',x+30,90,8,14);        // shop window, door
    for(let ax=x+2;ax<x+40;ax+=4){F(awn[k%6],ax,86,2,4); F('#ffffff',ax+2,86,2,4)}         // striped awning
  }
  {const x=670, t=R(x,58,80,46); F('#9a3f30',t.x,t.y,t.w,t.h); for(let y=t.y+2;y<t.y+t.h;y+=3)F('#8a3426',t.x,y,t.w,1);   // the Fargo Theatre
   F('#efe2c0',t.x,t.y,t.w,3); F('#1d2433',t.x+8,t.y+18,t.w-16,9); pixText(g,FARGO.marquee,t.x+t.w/2-14,t.y+20,'#ffd84d');
   for(let bx=t.x+9;bx<t.x+t.w-8;bx+=2){F('#fff3a8',bx,t.y+17,1,1); F('#fff3a8',bx,t.y+27,1,1)}
   F('#c7372f',t.x-8,t.y-14,9,40); [...'FARGO'].forEach((ch,i)=>pixText(g,ch,t.x-6,t.y-12+i*6,'#ffd84d')); F('#3a2a2a',t.x+28,t.y+32,24,14)}
  {const d=RACE.FINISH+40; for(let y=0;y<36;y++){const k=1-((36-y)/36)**2, w=Math.round(150*Math.sqrt(Math.max(0,k))); F(y<6?'#ffffff':'#eef1f5',d+(150-w)/2|0,40+y,w,1)}   // the Fargodome
   F('#b8bcc4',d,76,150,28); for(let x=d+6;x<d+144;x+=10)F('#7f8692',x,80,5,14); F('#1f5a34',d+40,96,70,7); pixText(g,'FARGODOME',d+52,97,'#f4d35e')}
  F('#cfcac0',0,104,W,8); for(let x=0;x<W;x+=12)F('#bdb7aa',x,104,1,8); F('#e6e2d8',0,104,W,1);   // sidewalk
  F('#6f6c67',0,112,W,46); for(let i=0;i<W*46/30;i++)F(rnd()<.5?'#64615c':'#7a7771',rnd()*W|0,112+rnd()*46|0,1,1);   // Broadway
  for(let x=0;x<W;x+=16)F('#e2c75a',x,141,8,1);                                                   // the center line
  F('#d6d3cc',0,158,W,2); F('#cdb978',0,160,W,8); for(let i=0;i<W/4;i++)F('#a9a35a',rnd()*W|0,161+rnd()*6|0,1,2);   // curb, grass
  for(const fx of [RACE.START,RACE.FINISH])for(let y=112;y<158;y+=3)for(let k=0;k<2;k++)F((y/3+k)%2?'#ffffff':'#1d1d22',fx+k*3,y,3,3);   // start + finish lines
})();

// ---------- the riders ----------
function drawScooter(x,y,deck){
  const F=(c,dx,dy,w,h)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x)+dx,Math.round(y)+dy,w,h)};
  F('rgba(0,0,0,.25)',-9,1,20,2);
  F(deck,-8,-3,16,2); F('#1d1d22',-8,-1,16,1);                                      // the deck
  F('#9aa0aa',6,-17,2,14); F('#1d1d22',3,-18,7,2); F('#c9ced4',4,-18,1,1);          // the stem + handlebars
  for(const wx of [-9,5]){F('#1d1d22',wx,-2,4,4); F('#c9ced4',wx+1,-1,2,2)}           // wheels
}
function drawRaceJoe(x,y){
  drawScooter(x,y,'#c8322b');
  const keep=P.moving; P.moving=race.kickAnim>0; P.step=race.kickAnim>90?1:0; drawPlayer(x-1,y-3); P.moving=keep;
  if(race.kickAnim>0){const F=(c,dx,dy,w,h)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x)+dx,Math.round(y)+dy,w,h)}; const k=race.kickAnim/180;   // the pushing foot
    F('#2a2a33',-6-Math.round(k*6),-5,3,2); F('#2b2b33',-8-Math.round(k*6),-3,3,2)}
  if(race.wob>0&&Math.floor(time/60)%2){ctx.fillStyle='#ffffff'; ctx.fillRect(Math.round(x)-12,Math.round(y)-26,2,2); ctx.fillRect(Math.round(x)+10,Math.round(y)-22,2,2)}   // wobble
}
function drawRaceQ(x,y){ drawScooter(x,y,'#e8742a'); drawBob(x-1,y-3) }

// ---------- the race ----------
function openRace(){ goTo('scooter','start') }
function raceReset(){
  Object.assign(race,{tauntT:0,say:'',phase:'count',t:0,x:RACE.START,v:0,kt:0,kicks:0,wob:0,kickAnim:0,qx:RACE.START,qv:0,draft:0,ready:false,sling:0,pops:[],taunt:2600,won:null});
  P.x=RACE.START; P.y=LANE.JOE; P.dir='right';
}
function racePop(text,col){ race.pops.push({text:text.toUpperCase(),col:col||'#ffffff',t:0,x:race.x,y:LANE.JOE-30}) }   // (the pixel font is all caps)
function raceKick(){
  if(race.phase!=='go'||paused)return;
  const f=race.kt/RACE.PERIOD; race.kickAnim=180;
  if(race.kicks>0&&f<RACE.GREEN[0]){ race.v*=RACE.EARLY_LOSS; race.wob=350; race.kt=0; sfx('bad'); racePop(FARGO.raceKicks.early,'#ff8a8a'); return }   // too early: wobble
  race.kicks++;
  if(race.kicks===1||f<=RACE.GREEN[1]){
    race.v+=RACE.KICK;
    if(race.ready){ race.v+=RACE.SLING; race.ready=false; race.draft=0; race.sling=900; sfx('whoosh'); racePop(FARGO.raceKicks.sling,'#ffd84d') }
    else { sfx('type',520); if(race.kicks%4===0)racePop(FARGO.raceKicks.good,'#9be89b') }
  } else { race.v+=RACE.LATE; sfx('type',300); racePop(FARGO.raceKicks.late,'#c9ced4') }
  race.v=Math.min(RACE.MAX,race.v); race.kt=0;
}
function raceTick(dt){
  for(const p of race.pops)p.t+=dt; race.pops=race.pops.filter(p=>p.t<700);
  if(race.kickAnim>0)race.kickAnim-=dt; if(race.wob>0)race.wob-=dt; if(race.sling>0)race.sling-=dt;
  if(race.phase==='count'){ const was=race.t; race.t+=dt; const n=k=>Math.floor(k/(RACE.COUNT/3)); if(n(race.t)!==n(was)&&race.t<RACE.COUNT)sfx('blip');
    if(race.t>=RACE.COUNT){race.phase='go'; race.t=0; sfx('ding')} return }
  if(race.phase==='done'){ race.t+=dt; race.v*=Math.exp(-dt/400); race.qv*=Math.exp(-dt/400); race.x+=race.v*dt; race.qx+=race.qv*dt; P.x=race.x; if(race.t>=900&&race.t-dt<900)raceOver(); return }
  race.t+=dt; race.kt+=dt;
  const gap=race.qx-race.x, drafting=gap>RACE.DRAFT[0]&&gap<RACE.DRAFT[1];
  race.v-=race.v*dt/(drafting?RACE.DRAFT_DECAY:RACE.DECAY);
  if(drafting&&!race.ready){ race.draft=Math.min(1,race.draft+dt/RACE.DRAFT_MS); if(race.draft>=1){race.ready=true; sfx('good'); racePop(FARGO.raceKicks.ready,'#ffd84d')} }
  else if(!drafting&&!race.ready)race.draft=Math.max(0,race.draft-dt/2500);
  race.x+=race.v*dt; P.x=race.x;
  const qTop=RACE.Q_SPEED*(1+.04*Math.sin(race.t/900));
  race.qv+=(qTop-race.qv)*Math.min(1,dt/RACE.Q_ACCEL); race.qx+=race.qv*dt;
  if((race.taunt-=dt)<=0){ race.taunt=4200; race.say=FARGO.raceTaunts[Math.floor(race.t/4200)%FARGO.raceTaunts.length]; race.tauntT=2200 }   // Lil Q talks trash (a speech bubble)
  if(race.tauntT>0)race.tauntT-=dt;
  if(race.x>=RACE.FINISH||race.qx>=RACE.FINISH){ race.tauntT=0; race.won=race.x>=race.qx; race.phase='done'; race.t=0; sfx(race.won?'fanfare':'bad') }
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
  const keep=ctx; ctx=g; try{ drawScooter(16,30,'#e8742a'); drawBob(15,27) } finally { ctx=keep }
  const row=document.createElement('div'); row.className='hrow'; const tx=document.createElement('div'); tx.innerHTML=FARGO.howToWho; row.append(c,tx);
  $('howTitle').textContent=FARGO.howToTitle; $('howRows').replaceChildren(row);
  $('howControls').replaceChildren(...FARGO.howToSteps.map(x=>{const li=document.createElement('li'); li.textContent=x; return li}));
  $('howOk').textContent=FARGO.howToOk; $('howOk').onclick=()=>{ $('howto').hidden=true; paused=false; then&&then() };
  paused=true; prompt.hidden=true; $('howto').hidden=false; setTimeout(()=>$('howOk').focus({preventScroll:true}),0);
}

SCENES.scooter={ music:'fargo',
  w:raceBg.width, h:VH, bounds:R(0,0,raceBg.width,VH), bg:raceBg, solids:[], triggers:[],
  entries:{start:{x:RACE.START,y:LANE.JOE,dir:'right'}},
  speed:()=>0,                                   // the arrows don't move you: kicking does
  key(code,e){ if(['Space','Enter','KeyE','ArrowRight','KeyD'].includes(code)){ if(!e||!e.repeat)raceKick(); return true } return false },
  ability:raceKick, abilityLabel:()=>'Kick',
  enter(){ raceReset(); if(!have.raceHowTo)race.phase='wait' },   // (the how-to card first, the very first time)
  ambient(dt){ if(paused||fade.next)return;
    if(race.phase==='wait')return raceHowTo(()=>{have.raceHowTo=true; save(); race.phase='count'; race.t=0});
    raceTick(dt) },
  update(){ P.dir='right'; P.y=LANE.JOE },
  drawPlayer:(x,y)=>drawRaceJoe(x,y),
  ents(list){ list.push({y:LANE.Q,draw:()=>drawRaceQ(race.qx,LANE.Q)});
    list.push({y:LANE.Q-40,draw:()=>{const x=RACE.FINISH, F=(c,dx,dy,w,h)=>{ctx.fillStyle=c;ctx.fillRect(x+dx,dy,w,h)};   // the finish arch
      F('#5f6676',-2,92,2,68); F('#5f6676',8,92,2,68); F('#1d2130',-12,90,32,10); pixText(ctx,'FINISH',x-10,92,'#ffd84d')}});
  },
  over(){
    const F=(c,x,y,w,h)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),w,h)};
    if(race.phase==='go'){ const gap=race.qx-race.x; if(gap>RACE.DRAFT[0]&&gap<RACE.DRAFT[1])for(let k=0;k<5;k++){const y=LANE.JOE-20+k*4, x=race.x+6+((time/30+k*9)%Math.max(4,gap-4)); F('rgba(255,255,255,.7)',x,y,4,1)} }   // the draft: wind lines
    if(race.sling>0)for(let k=0;k<6;k++)F('rgba(255,216,77,.8)',race.x-20-((time/20+k*7)%18),LANE.JOE-22+k*4,8,1);
    for(const p of race.pops){ const w=textW(p.text)+4, x=Math.round(race.x-w/2), y=Math.round(p.y-p.t/60);
      F('rgba(20,22,34,.75)',x,y-1,w,8); pixText(ctx,p.text,x+2,y+1,p.col) }
    if(race.tauntT>0&&race.say){ const words=race.say.toUpperCase().split(' '), lines=['']; for(const w of words){ if((lines[lines.length-1]+' '+w).trim().length>20)lines.push(w); else lines[lines.length-1]=(lines[lines.length-1]+' '+w).trim() }
      const w=Math.max(...lines.map(l=>textW(l)))+6, h=lines.length*7+4, x=Math.round(race.qx-w/2+6), y=LANE.Q-30-h;
      F('#1d2130',x-1,y-1,w+2,h+2); F('#fff6e0',x,y,w,h); F('#fff6e0',x+6,y+h,3,2); F('#1d2130',x+5,y+h,1,2); F('#1d2130',x+9,y+h,1,2);
      lines.forEach((l,i)=>pixText(ctx,l,x+3,y+3+i*7,'#7a3a12')) }
    // on screen: the kick meter, the draft bar, how far each of you has to go, the countdown
    const tf=ctx.getTransform(); ctx.setTransform(1,0,0,1,0,0);
    const mx=62, my=6, mw=100;
    F('#1d2130',mx-2,my-2,mw+4,10); F('#3a4258',mx,my,mw,6); F('#3f9a52',mx+mw*RACE.GREEN[0],my,mw*(RACE.GREEN[1]-RACE.GREEN[0]),6);
    const f=race.phase==='go'?Math.min(1,race.kt/RACE.PERIOD):0, inGreen=f>=RACE.GREEN[0]&&f<=RACE.GREEN[1];
    F(inGreen?'#ffffff':'#ffd84d',mx+f*mw-1,my-2,3,10);
    F('#1d2130',mx-2,my+10,mw+4,5); F(race.ready&&Math.floor(time/150)%2?'#ffd84d':'#7fe8ff',mx,my+11,mw*race.draft,3); pixText(ctx,'DRAFT',mx+mw+6,my+9,race.ready?'#ffd84d':'#cfe8f5');
    const px=x=>12+Math.min(1,(x-RACE.START)/(RACE.FINISH-RACE.START))*200;
    F('rgba(29,33,48,.8)',8,VH-10,208,6); F('#ffffff',212,VH-11,2,8); F('#e8742a',px(race.qx)-1,VH-10,3,6); F('#c8322b',px(race.x)-1,VH-11,3,8); F('#ffffff',px(race.x),VH-10,1,6);
    if(race.phase==='count'){ const n=3-Math.floor(race.t/(RACE.COUNT/3)); ctx.save(); ctx.translate(VW/2-6,52); ctx.scale(3,3); pixText(ctx,String(Math.max(1,n)),0,0,'#ffd84d'); ctx.restore() }
    else if(race.phase==='go'&&race.t<700){ ctx.save(); ctx.translate(VW/2-10,52); ctx.scale(3,3); pixText(ctx,'GO',0,0,'#9be89b'); ctx.restore() }
    else if(race.phase==='done'){ const t=race.won?'YOU WIN':'LIL Q WINS'; ctx.save(); ctx.translate(VW/2-textW(t)*1.5,52); ctx.scale(3,3); pixText(ctx,t,0,0,race.won?'#ffd84d':'#ff8a8a'); ctx.restore() }
    ctx.setTransform(tf);
  },
  hud(){ return `<span>${Math.round(race.v*RACE.MPH)} mph</span><span>Lil Q ${Math.round(race.qv*RACE.MPH)} mph</span>` },
};
