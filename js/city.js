// The city at night: the chocolate heist.
// You play a crew of three and switch between them:
//   you  = sonar pulse (lights up the dark, shows invisible tripwires)
//   Lars = sprint (fast enough to get through the searchlights)
//   John = lift (the steel beam, the skylight grate)
// Route: roof A (briefing) -> John bridges the gap -> roof B (searchlights; Lars cuts the fuse)
//        -> roof C (a guard with a flashlight + lasers around the skylight) -> the vault -> cookie signal.
const CW=520, CH=200;
const ROOF_A=R(6,30,112,156), ROOF_B=R(150,20,170,166), ROOF_C=R(352,26,160,160);
const BEAM_SLOT=R(116,96,36,12);          // where the beam bridges A -> B
const PLANK_BC=R(318,140,36,12);          // fixed plank B -> C
const LOOSE_BEAM=R(96,128,8,34);          // the beam lying on roof A before John lifts it
const FUSE={x:312,y:100};   // just past the last searchlight column
const SKYLIGHT=R(462,40,24,16);
const LADDER=R(10,166,22,14);
const STRANGER={x:44,y:62};
// tripwires (invisible unless you ping the sonar): [x1,y1,x2,y2]
const LASERS=[
  [420,26,420,126],                     // wall on the left side of the skylight area
  [420,126,448,126],[462,126,512,126],  // bottom row, gap at 448-462
  [420,100,486,100],[500,100,512,100],  // middle row, gap at 486-500
  [420,76,464,76],[480,76,512,76],      // top row, gap at 464-480 right below the skylight
];
// searchlights sweep up and down in four columns across the middle of roof B.
// Tuned so walking straight through is rarely safe (~8%) but Lars's sprint usually is (~30%).
const LIGHTS=[{x:204,speed:.12,phase:0},{x:232,speed:.16,phase:1.7},{x:260,speed:.14,phase:3.4},{x:288,speed:.18,phase:5.1}];
const LIGHT_R=16;
const GUARD={x:396, y0:44, y1:176, speed:.03};
const CHECKPOINTS=[
  {hero:[40,150],lars:[56,150],john:[48,164]},     // 0: start, roof A
  {hero:[166,100],lars:[166,116],john:[180,108]},  // 1: across the beam, roof B
  {hero:[362,176],lars:[372,176],john:[362,166]},  // 2: across the plank, roof C (out of the guard's light)
];

const heist={
  crew:[{id:'hero',x:40,y:150,dir:'up',step:0,t:0,moving:false},{id:'lars',x:56,y:150,dir:'up',step:0,t:0,moving:false},{id:'john',x:48,y:164,dir:'up',step:0,t:0,moving:false}],
  lead:0, follow:true, trail:[], sprintT:0, sprintCd:0, sonarT:0, sonarCd:0, sonarAt:null,
  guardY:GUARD.y0, guardDir:1, guardWait:0, flashT:0, caught:false, hinted:{},
};
const heistStage=()=>have.heistStage||0;   // 0 nothing, 1 beam up, 2 lights out, 3 grate off, 4 got the chocolate, 5 beat Lars at anagrams (reward pending)

// ---------- background ----------
const cityRain=[...Array(160)].map(()=>({x:Math.random()*CW,y:Math.random()*CH}));
const cars=[...Array(8)].map((_,i)=>({lane:i%2, x:i<4?120:322, y:Math.random()*CH, v:(i%2?1:-1)*(.03+Math.random()*.03)}));
let flashT=0, nextFlash=9000;
const cityBg=document.createElement('canvas'); cityBg.width=CW; cityBg.height=CH;
(function(){
  const g=cityBg.getContext('2d'), F=(c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};
  F('#07080f',0,0,CW,CH);                                                         // the street, far below
  for(const [x0,w] of [[118,32],[320,32]]){F('#0c0e18',x0,0,w,CH); for(let y=0;y<CH;y+=12)F('#232636',x0+w/2-1,y,1,6)}
  for(const r of [ROOF_A,ROOF_B,ROOF_C]){
    F('#2a2e3e',r.x-3,r.y-3,r.w+6,r.h+6); F('#3a3f52',r.x,r.y,r.w,r.h);
    for(let i=0;i<r.w*r.h/18;i++)F(rnd()<.5?'#353a4c':'#41475c',r.x+rnd()*r.w|0,r.y+rnd()*r.h|0,1,1);
    for(let i=0;i<5;i++)F('#30354a',r.x+rnd()*(r.w-20)|0,r.y+rnd()*(r.h-10)|0,14+rnd()*12|0,3);   // puddles
  }
  const plank=p=>{F('#5a4128',p.x,p.y,p.w,p.h); for(let x=p.x;x<p.x+p.w;x+=5)F('#46321e',x,p.y,1,p.h); F('#6e5034',p.x,p.y,p.w,1)};
  plank(PLANK_BC);
  // roof clutter
  F('#8b93a3',24,40,16,10); F('#5f6676',26,42,12,6);                           // AC unit
  F('#8b93a3',230,160,16,10); F('#5f6676',232,162,12,6);
  F('#6b3b32',170,32,10,10); F('#4a2a24',172,34,6,6);                           // chimney
  F('#8b93a3',12,170,2,10); F('#8b93a3',28,170,2,10); for(let y=171;y<180;y+=2)F('#8b93a3',12,y,18,1);   // ladder top
  // fuse box
  F('#5f6676',FUSE.x-6,FUSE.y-10,12,10); F('#3a3f52',FUSE.x-5,FUSE.y-9,10,8); F('#f4d35e',FUSE.x-1,FUSE.y-8,2,4); F('#f4d35e',FUSE.x-2,FUSE.y-6,4,1);
  // the old candy works: striped awning edge + the skylight frame
  for(let x=352;x<512;x+=8){F(x%16?'#e8e2d6':'#c8322b',x,ROOF_C.y-3,8,3)}
  F('#2a2e3e',SKYLIGHT.x-2,SKYLIGHT.y-2,SKYLIGHT.w+4,SKYLIGHT.h+4); F('#1a2338',SKYLIGHT.x,SKYLIGHT.y,SKYLIGHT.w,SKYLIGHT.h);
  F('#4d5a78',SKYLIGHT.x+1,SKYLIGHT.y+1,10,14); F('#4d5a78',SKYLIGHT.x+13,SKYLIGHT.y+1,10,14);
  // laser emitters: tiny red dots at the ends (the beams themselves are invisible)
  for(const [x1,y1,x2,y2] of LASERS){F('#6a1f22',x1-1,y1-1,2,2); F('#6a1f22',x2-1,y2-1,2,2)}
})();

// ---------- crew sprites ----------
function crewSprite(c,g=ctx){ ({hero:drawHero,lars:drawLars,john:drawJohn})[c.id](c,g) }
function legs(c){ return [c.moving&&c.step%2?1:0, c.moving&&!(c.step%2)?1:0] }
// you: dark hoodie, mask, cape (no ears, no emblem)
function drawHero(c,g=ctx){
  const x=Math.round(c.x)-6, y=Math.round(c.y)-18, F=(col,dx,dy,w,h)=>{g.fillStyle=col;g.fillRect(x+dx,y+dy,w,h)};
  const skin='#f0c6a0', hair='#b08355', suit='#34405c', cape='#0e1017', capeL='#1d2130', mask='#0b0c12', eye='#3d8ad6';
  const [a,b]=legs(c), sway=c.moving?(c.step%2?1:-1):0;
  F('rgba(0,0,0,.25)',1,17,10,2);
  if(c.dir!=='up'){F(cape,0+sway,7,12,10); F(capeL,1+sway,8,1,8)}            // cape behind you
  F('#14161f',3,13,2,4-a); F('#14161f',7,13,2,4-b); F('#0b0c12',2,17-a,3,1); F('#0b0c12',7,17-b,3,1);
  F(suit,2,7,8,7); F('#5a3a22',2,12,8,1); F(suit,1,8,1,4); F(suit,10,8,1,4);
  F(skin,3,2,6,5);
  if(c.dir==='up'){F(hair,2,0,8,6); F(cape,0+sway,6,12,12); F(capeL,5,7,2,10)}
  else {
    F(hair,2,0,8,3);
    if(c.dir==='down'){F(hair,2,3,1,2);F(hair,9,3,1,2);F(mask,3,3,6,2);F(eye,4,4,1,1);F(eye,7,4,1,1);F('#b5654f',5,6,2,1)}
    if(c.dir==='left'){F(hair,7,2,3,4);F(mask,3,3,4,2);F(eye,3,4,1,1)}
    if(c.dir==='right'){F(hair,2,2,3,4);F(mask,5,3,4,2);F(eye,8,4,1,1)}
  }
}
// Lars: tall runner, short blond hair, singlet with a race bib, split shorts, neon shoes
function drawLars(c,g=ctx){
  const x=Math.round(c.x)-5, y=Math.round(c.y)-23, F=(col,dx,dy,w,h)=>{g.fillStyle=col;g.fillRect(x+dx,y+dy,w,h)};
  const skin='#f3cba8', hair='#e6c46a', singlet='#2f6db0', shorts='#1c1c22', shoe='#b6ff3b';
  const [a,b]=legs(c);
  F('rgba(0,0,0,.25)',1,22,8,2);
  F(skin,2,14,2,7-a); F(skin,6,14,2,7-b); F('#ffffff',2,20-a,2,1); F('#ffffff',6,20-b,2,1);   // long legs, white socks
  F(shoe,1,21-a,3,2); F(shoe,6,21-b,3,2);
  F(shorts,2,12,6,3); F(shorts,1,13,1,2);
  F(singlet,2,6,6,7); F(skin,1,6,1,6); F(skin,8,6,1,6);                // singlet, bare arms
  F('#ffffff',3,8,4,3); F('#c8322b',4,9,2,1);                          // race bib
  F(skin,3,1,4,5); F(skin,4,5,2,1);
  F(hair,3,0,4,2);
  if(c.dir==='up')F(hair,3,0,4,4);
  else if(c.dir==='left'){F(hair,6,1,1,1);F('#2b2b2b',3,3,1,1)}
  else if(c.dir==='right'){F(hair,3,1,1,1);F('#2b2b2b',6,3,1,1)}
  else {F('#3d6fb0',4,3,1,1);F('#3d6fb0',6,3,1,1);F('#c9876f',4,5,2,1)}
}
// John: shorter, super jacked, white muscle tank, jeans, red bandana
function drawJohn(c,g=ctx){
  const x=Math.round(c.x)-7, y=Math.round(c.y)-18, F=(col,dx,dy,w,h)=>{g.fillStyle=col;g.fillRect(x+dx,y+dy,w,h)};
  const skin='#e2aa80', skinS='#c98f66', hair='#5a3b24', tank='#f4f4f0', jean='#3a5f9e', jeanD='#2c4a7c';
  const [a,b]=legs(c);
  F('rgba(0,0,0,.25)',2,17,11,2);
  F(jean,3,12,4,5-a); F(jean,8,12,4,5-b); F(jeanD,7,12,1,4); F('#3b2a1e',3,16-a,4,2); F('#3b2a1e',8,16-b,4,2);
  F(skin,1,6,13,7); F(skinS,1,10,1,3); F(skinS,13,10,1,3);             // huge shoulders and arms
  F(skin,0,8,2,5); F(skin,13,8,2,5);
  F(tank,4,6,7,6); F(tank,5,5,1,1); F(tank,9,5,1,1); F('#e2e2dc',4,11,7,1);
  F(skin,5,0,5,6); F(skin,6,5,3,1);                                     // head, thick neck
  F(hair,5,2,5,1); F('#c8322b',4,0,7,2); F('#c8322b',11,1,2,1); F('#9e2620',12,2,1,1);   // red bandana, knot
  if(c.dir==='up')F(hair,5,2,5,3);
  else if(c.dir==='left'){F('#2b2b2b',5,3,1,1)}
  else if(c.dir==='right'){F('#2b2b2b',9,3,1,1)}
  else {F('#2b2b2b',6,3,1,1);F('#2b2b2b',8,3,1,1);F('#a86a50',6,5,3,1)}
}
function drawStranger(){
  const F=(c,x,y,w,h)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h)};
  const x=STRANGER.x-5,y=STRANGER.y-20;
  F('rgba(0,0,0,.35)',x-1,y+20,12,2);
  F('#1b1c24',x,y+6,10,14); F('#262833',x+1,y+6,8,12); F('#14151c',x,y+19,4,2); F('#14151c',x+6,y+19,4,2);   // long coat
  F('#c9a787',x+3,y+2,5,4); F('#14151c',x+1,y,9,3); F('#14151c',x-1,y+2,13,1);                               // face under a hat brim
  F('#8a8f9a',x+7,y+6,1,6);                                                                                   // turned-up collar
}
function drawGuard(){
  const gy=heist.guardY, x=GUARD.x-5, y=Math.round(gy)-18, F=(c,dx,dy,w,h)=>{ctx.fillStyle=c;ctx.fillRect(x+dx,y+dy,w,h)};
  F('rgba(0,0,0,.25)',1,17,10,2);
  F('#2c2c34',3,12,2,5); F('#2c2c34',6,12,2,5); F('#5a5f6a',1,6,9,7); F('#e9b98f',3,1,5,5); F('#1c1c22',2,0,7,3);
  if(heist.guardDir>0){F('#2b2b2b',4,3,1,1);F('#2b2b2b',6,3,1,1);F('#c9ced4',8,11,2,3)} else F('#c9ced4',8,6,2,3);
}
function drawBeam(){
  ctx.fillStyle='#7d8694';
  if(heistStage()>=1){const b=BEAM_SLOT; ctx.fillRect(b.x,b.y+2,b.w,8); ctx.fillStyle='#5f6676'; ctx.fillRect(b.x,b.y+5,b.w,2); for(let x=b.x+3;x<b.x+b.w;x+=6)ctx.fillRect(x,b.y+3,1,6)}
  else {const b=LOOSE_BEAM; ctx.fillRect(b.x,b.y,b.w,b.h); ctx.fillStyle='#5f6676'; ctx.fillRect(b.x+3,b.y,2,b.h);
    ctx.fillStyle='#c9d1db'; ctx.fillRect(b.x+1,b.y+((time/30)%(b.h+20))-10,b.w-2,3);          // a glint runs along it
    // dashed outline across the gap, showing where it'd fit
    const s=BEAM_SLOT, on=(time/300|0)%2; ctx.fillStyle=`rgba(200,215,235,${on?.55:.3})`;
    for(let x=s.x;x<s.x+s.w;x+=6){ctx.fillRect(x,s.y+2,3,1); ctx.fillRect(x,s.y+9,3,1)} ctx.fillRect(s.x,s.y+2,1,8); ctx.fillRect(s.x+s.w-1,s.y+2,1,8)}
}
function drawGrate(){
  if(heistStage()>=3){ctx.fillStyle='#5f6676'; ctx.fillRect(SKYLIGHT.x+26,SKYLIGHT.y+18,12,10); return}   // tossed aside
  ctx.fillStyle='#8b93a3'; for(let x=SKYLIGHT.x;x<SKYLIGHT.x+SKYLIGHT.w;x+=4)ctx.fillRect(x,SKYLIGHT.y,1,SKYLIGHT.h);
  ctx.fillRect(SKYLIGHT.x,SKYLIGHT.y+7,SKYLIGHT.w,1);
}

// ---------- crew control ----------
const lead=()=>heist.crew[heist.lead];
function syncLeadFromP(){const c=lead(); c.x=P.x;c.y=P.y;c.dir=P.dir;c.moving=P.moving;c.step=P.step}
function switchTo(i){
  if(i===heist.lead||paused)return;
  syncLeadFromP(); heist.lead=i; const c=lead(); P.x=c.x;P.y=c.y;P.dir=c.dir;P.moving=false;
  heist.trail=[{x:c.x,y:c.y}]; heist.sprintT=0; renderCrewBar();
}
function toggleFollow(){ if(paused)return; heist.follow=!heist.follow; heist.trail=[{x:P.x,y:P.y}]; renderCrewBar() }
function placeAtCheckpoint(){
  const cp=CHECKPOINTS[Math.min(2,heistStage())];
  for(const c of heist.crew){const [x,y]=cp[c.id]; c.x=x;c.y=y;c.dir='right';c.moving=false}
  const c=lead(); P.x=c.x;P.y=c.y;P.dir=c.dir; heist.trail=[{x:c.x,y:c.y}];
  heist.guardY=GUARD.y0; heist.guardDir=1; heist.guardWait=0;
}
// followers walk the leader's path, spaced out, so they step where you stepped
function moveFollowers(dt){
  const t=heist.trail, last=t[t.length-1];
  if(!last||Math.hypot(P.x-last.x,P.y-last.y)>=1.5){t.push({x:P.x,y:P.y}); if(t.length>400)t.shift()}
  if(!heist.follow)return;
  const others=heist.crew.filter((_,i)=>i!==heist.lead);
  others.forEach((c,k)=>{
    // find the trail point about (k+1)*13 px behind the leader
    let need=(k+1)*13, i=t.length-1, acc=0;
    while(i>0&&acc<need){acc+=Math.hypot(t[i].x-t[i-1].x,t[i].y-t[i-1].y); i--}
    const goal=t[Math.max(0,i)], dx=goal.x-c.x, dy=goal.y-c.y, d=Math.hypot(dx,dy);
    c.moving=d>1;
    if(d>1){const sp=Math.min(d,.075*dt*(d>20?1.6:1)); c.x+=dx/d*sp; c.y+=dy/d*sp;
      c.dir=Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up'); c.t+=dt; if(c.t>140){c.t=0;c.step++}}
  });
}

// ---------- skills ----------
function useSkill(){
  const id=lead().id;
  if(id==='hero'&&heist.sonarCd<=0){heist.sonarT=4200; heist.sonarCd=1600; heist.sonarAt={x:P.x,y:P.y}}
  if(id==='lars'&&heist.sprintCd<=0){heist.sprintT=800; heist.sprintCd=1100}
  if(id==='john')flashPrompt('Nothing heavy here.');
}
function flashPrompt(text){prompt.textContent=text; prompt.hidden=false; heist.promptT=1400}

// ---------- hazards ----------
function lightPos(L){return {x:L.x, y:ROOF_B.y+LIGHT_R+((Math.sin(time*L.speed/60+L.phase)+1)/2)*(ROOF_B.h-LIGHT_R*2)}}
function crewPositions(){syncLeadFromP(); return heist.crew.map(c=>({x:c.x,y:c.y,id:c.id}))}
function segHitsBox(x1,y1,x2,y2,b){ // thin laser vs feet box
  if(x1===x2)return x1>=b.x&&x1<=b.x+b.w&&Math.max(y1,y2)>=b.y&&Math.min(y1,y2)<=b.y+b.h;
  return y1>=b.y&&y1<=b.y+b.h&&Math.max(x1,x2)>=b.x&&Math.min(x1,x2)<=b.x+b.w;
}
function checkHazards(){
  const pos=crewPositions();
  for(const p of pos){
    if(heistStage()<2) for(const L of LIGHTS){const l=lightPos(L); if(Math.hypot(p.x-l.x,p.y-7-l.y)<LIGHT_R-2)return {msg:HEIST.spottedLight, who:p.id}}
    // guard's flashlight cone (he faces the way he's walking)
    const gx=GUARD.x, gy=heist.guardY-6, along=(p.y-3-gy)*heist.guardDir, perp=Math.abs(p.x-gx);
    if(heist.guardWait<=0&&along>0&&along<62&&perp<along*.5+3)return {msg:HEIST.spottedGuard, who:p.id};
    const box=R(p.x-3,p.y-3,6,4);
    for(const [x1,y1,x2,y2] of LASERS)if(segHitsBox(x1,y1,x2,y2,box))return {msg:HEIST.spottedLaser, who:p.id};
  }
  return null;
}
function caught(hz){
  heist.flashT=500; heist.caughtWho=hz.who; for(const k in dirs)dirs[k]=false;
  const name=HEIST.crew[hz.who], you=hz.who===lead().id;
  const pages=[hz.msg.replace('{who}',you?'you':name).replace('{Who}',you?'You':name)];
  if(!you&&heist.follow)pages.push(hz.who==='hero'?HEIST.followTipYou.replace('{lead}',HEIST.crew[lead().id]):HEIST.followTip.replace('{who}',name));
  pages.push(HEIST.backToCheckpoint);
  showDialog({place:HEIST.place,speaker:'Spotted!',pages,actions:[{label:'OK',fn:()=>{closeDialog();heist.caughtWho=null;placeAtCheckpoint()}}]});
}

// ---------- story beats ----------
const say=(lines,done)=>{ // lines: [[speaker,text],...]
  let i=0; const next=()=>{ if(i>=lines.length){closeDialog(); done&&done(); return}
    const [sp,tx]=lines[i++]; showDialog({place:HEIST.place,speaker:sp,pages:[tx],actions:[{label:i>=lines.length?'OK':'Next',fn:next}]}) };
  next();
};
function briefing(){
  have.heistBriefed=true; save();
  say([...HEIST.briefing.map(t=>[HEIST.stranger,t]),...HEIST.crewHello],()=>openHowTo());
}
function hintOnce(key,who,text){ if(heist.hinted[key])return; heist.hinted[key]=true; say([[who,text]]) }
// walking up to the beam gives you a choice; only John can actually swing it over the gap
function beamChoice(){
  const H=HEIST;
  showDialog({place:H.place,speaker:'',pages:[H.beamLook],menu:true,actions:[
    {label:H.beamBridge,fn:()=>{ if(lead().id!=='john')return say(H.beamTooHeavy); closeDialog(); liftBeam() }},
    {label:H.beamCut,fn:()=>say(H.beamCutReply)},
    {label:H.beamLeave,ghost:true,fn:closeDialog}]});
}
function liftBeam(){
  have.heistStage=1; save(); heist.beamAnim=600; say([['John',HEIST.beamDone]]);
}
function cutFuse(){
  if(lead().id!=='lars')return flashPrompt(HEIST.onlyLars);
  have.heistStage=2; save(); say([['Lars',HEIST.fuseDone]]);
}
function ripGrate(){
  if(lead().id!=='john')return flashPrompt(HEIST.onlyJohn);
  have.heistStage=3; save(); say([['John',HEIST.grateDone]]);
}

// ---------- the vault: two crates ----------
const vault={open:false, pinged:false, choc:0};
function openVault(){
  vault.open=true; vault.pinged=false; vault.choc=Math.random()<.5?0:1;
  $('vaultTitle').textContent=HEIST.vaultTitle; $('vaultNote').textContent=HEIST.vaultNote; $('vaultPing').textContent=HEIST.vaultPing;
  drawCrates(); paused=true; prompt.hidden=true; $('vault').hidden=false; setTimeout(()=>$('vaultPing').focus({preventScroll:true}),0);
}
function drawCrates(){
  ['crateA','crateB'].forEach((id,i)=>{const c=$(id), g=c.getContext('2d'), F=(col,x,y,w,h)=>{g.fillStyle=col;g.fillRect(x,y,w,h)};
    g.clearRect(0,0,c.width,c.height);
    F('#8a5a34',2,6,28,22); F('#a26c40',2,6,28,3); F('#6a4224',2,16,28,2); F('#6a4224',2,6,2,22); F('#6a4224',28,6,2,22);
    F('#efe2c4',11,10,10,5); F('#6a4224',12,12,8,1);   // stenciled label
    if(vault.pinged){ g.globalAlpha=.85;
      if(i===vault.choc){F('#7fd3ff',7,18,6,8);F('#7fd3ff',14,18,6,8);F('#7fd3ff',21,18,5,8);F('#0d2a3a',7,21,19,1)}
      else for(let k=0;k<14;k++)F('#7fd3ff',5+(k*7)%22,18+(k*3)%8,2,2);
      g.globalAlpha=1; }
  });
}
function pingVault(){ vault.pinged=true; $('vaultNote').textContent=HEIST.vaultPinged; drawCrates() }
function pickCrate(i){
  if(!vault.open)return;
  if(i!==vault.choc){ $('vault').hidden=true; say(HEIST.raisins,()=>{ $('vault').hidden=false; paused=true }); return }
  vault.open=false; $('vault').hidden=true; have.heistStage=4; save();
  say([['',HEIST.gotIt],['',HEIST.villainNote],...HEIST.finale,...HEIST.larsChallenge],()=>openLarsMenu());
}
$('vaultPing').onclick=pingVault; $('crateA').parentNode.onclick=()=>pickCrate(0); $('crateB').parentNode.onclick=()=>pickCrate(1);

// ---------- triggers ----------
const nearCrew=(z,id)=>heist.crew.some(c=>(!id||c.id===id)&&hit(R(c.x-4,c.y-3,8,4),z));
function heistTrigger(){
  const feet=R(P.x-4,P.y-3,8,4), st=heistStage();
  if(hit(feet,LADDER))return {label:HEIST.climbDown, act:()=>goTo('world','fromCity')};
  if(Math.hypot(P.x-STRANGER.x,P.y-STRANGER.y)<16)return {label:'Talk to the stranger', btn:'Talk', act:()=>{
    if(have.city)return say([[HEIST.stranger,HEIST.after]]);
    if(st>=5)return showReward('city');
    if(st===4)return say([[HEIST.stranger,HEIST.strangerRematch],...HEIST.larsChallenge.slice(1,2)],()=>openLarsMenu());
    if(!have.heistBriefed)return briefing();
    say([[HEIST.stranger,HEIST.strangerAgain]])}};
  if(st<1&&hit(feet,R(LOOSE_BEAM.x-10,LOOSE_BEAM.y-6,LOOSE_BEAM.w+20,LOOSE_BEAM.h+12)))return {label:'Look at the beam', act:beamChoice};
  if(st<2&&hit(feet,R(FUSE.x-10,FUSE.y,20,14)))return {label:HEIST.fuse, act:cutFuse};
  if(st===2&&hit(feet,R(SKYLIGHT.x-4,SKYLIGHT.y+SKYLIGHT.h,SKYLIGHT.w+8,12)))return {label:HEIST.grate, act:ripGrate};
  if(st===3&&hit(feet,R(SKYLIGHT.x-4,SKYLIGHT.y+SKYLIGHT.h,SKYLIGHT.w+8,12)))return {label:HEIST.dropIn, act:openVault};
  return null;
}

// ---------- crew bar (under the screen) ----------
function renderCrewBar(){
  const bar=$('crewbar'); if(!bar)return;
  bar.querySelectorAll('[data-crew]').forEach(b=>{const i=+b.dataset.crew; b.setAttribute('aria-pressed',i===heist.lead?'true':'false')});
  $('followBtn').textContent=heist.follow?'Crew: Follow':'Crew: Hold';
  $('followBtn').setAttribute('aria-pressed',heist.follow?'false':'true');
}
function buildCrewBar(){
  $('crewbar').querySelectorAll('[data-crew]').forEach(b=>{
    const i=+b.dataset.crew, c=b.querySelector('canvas'), g=c.getContext('2d'), who=heist.crew[i];
    g.clearRect(0,0,c.width,c.height);
    crewSprite({...who, x:8, y:who.id==='lars'?24:20, dir:'down', moving:false}, g);   // portrait from the same sprite
    b.querySelector('span').textContent=HEIST.crew[who.id]+' · '+HEIST.skills[who.id];
    b.onclick=()=>switchTo(i);
  });
  $('followBtn').onclick=toggleFollow; $('helpBtn').onclick=()=>{ if(!paused)openHowTo() };
  renderCrewBar();
}

// ---------- scene ----------
const darkMask=document.createElement('canvas'); darkMask.width=VW; darkMask.height=VH;
SCENES.city={
  w:CW, h:CH, bounds:R(0,0,CW,CH), bg:cityBg, triggers:[],
  get walk(){ return [ROOF_A,ROOF_B,ROOF_C,PLANK_BC,LADDER,...(heistStage()>=1?[BEAM_SLOT]:[])] },
  get solids(){ return [R(24,40,16,10),R(230,160,16,10),R(170,32,10,10),R(FUSE.x-6,FUSE.y-6,12,6),SKYLIGHT,R(STRANGER.x-4,STRANGER.y-3,8,4),
    ...(heistStage()<1?[LOOSE_BEAM]:[])] },
  entries:{start:{x:40,y:150,dir:'up'}, fromStreet:{x:40,y:150,dir:'up'}},
  enter(){
    heist.lead=0; heist.follow=true; heist.hinted={}; heist.sonarT=0; heist.sprintT=0;
    placeAtCheckpoint(); $('crewbar').hidden=false; buildCrewBar();
    heist.briefPending=!have.heistBriefed;
  },
  leave(){ $('crewbar').hidden=true },
  speed:()=>heist.sprintT>0?.19:(lead().id==='lars'?.09:.07),
  dynTrigger:()=>heistTrigger(),
  ability:()=>useSkill(),
  key(code){ const i={Digit1:0,Digit2:1,Digit3:2}[code]; if(i!=null){switchTo(i);return true} if(code==='KeyF'){toggleFollow();return true} return false },
  abilityLabel:()=>HEIST.skills[lead().id],
  ambient(dt){
    anaTick(dt); lgTick(dt);
    for(const r of cityRain){r.y+=dt*.32;r.x-=dt*.08;if(r.y>CH){r.y=-4;r.x=Math.random()*(CW+40)}}
    for(const c of cars){c.y+=c.v*dt; if(c.y>CH+6)c.y=-6; if(c.y<-6)c.y=CH+6}
    nextFlash-=dt; if(nextFlash<=0){flashT=140; nextFlash=8000+Math.random()*9000} if(flashT>0)flashT-=dt;
    for(const k of ['sonarT','sonarCd','sprintT','sprintCd','flashT','promptT'])if(heist[k]>0)heist[k]-=dt;
    if(heist.promptT<=0&&heist.promptT>-999){heist.promptT=-999; if(near)prompt.textContent=near.label; else prompt.hidden=true}
  },
  update(dt){
    if(heist.briefPending){heist.briefPending=false; return briefing()}
    if(heistStage()>=4)return;
    // guard patrol: walks up and down, pauses at each end (flashlight off while he turns)
    if(heist.guardWait>0)heist.guardWait-=dt;
    else{heist.guardY+=heist.guardDir*GUARD.speed*dt;
      if(heist.guardY>GUARD.y1){heist.guardY=GUARD.y1;heist.guardDir=-1;heist.guardWait=900}
      if(heist.guardY<GUARD.y0){heist.guardY=GUARD.y0;heist.guardDir=1;heist.guardWait=900}}
    moveFollowers(dt);
    const hz=checkHazards(); if(hz)return caught(hz);
    // a few one-time hints as you reach each part
    const st=heistStage();
    if(st<1&&P.x>80&&P.y>80)hintOnce('gap','John',HEIST.johnGap);
    else if(st===1&&P.x>160)hintOnce('lights','Lars',HEIST.larsLights);
    else if(st>=2&&st<3&&P.x>356)hintOnce('lasers','You',HEIST.heroLasers);
  },
  drawPlayer:(x,y)=>{syncLeadFromP(); crewSprite(lead())},
  under(){
    for(const c of cars){const x=c.x+(c.lane?18:6); ctx.fillStyle=c.v>0?'#ffe9a0':'#ff4a3a'; ctx.fillRect(x,c.y|0,1,1); ctx.fillRect(x+3,c.y|0,1,1)}
    drawBeam(); drawGrate();
  },
  ents(list){
    heist.crew.forEach((c,i)=>{if(i!==heist.lead)list.push({y:c.y,draw:()=>crewSprite(c)})});
    list.push({y:STRANGER.y,draw:drawStranger});
    if(heistStage()<4)list.push({y:heist.guardY,draw:drawGuard});
  },
  over(){
    const st=heistStage();
    // searchlights on roof B
    if(st<2)for(const L of LIGHTS){const l=lightPos(L); ctx.fillStyle='rgba(255,244,190,.35)'; ctx.beginPath(); ctx.ellipse(l.x,l.y,LIGHT_R,LIGHT_R,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='rgba(255,244,190,.12)'; ctx.fillRect(l.x-5,l.y,10,CH)}
    // guard flashlight cone
    if(st<4&&heist.guardWait<=0){const gy=heist.guardY-6, d=heist.guardDir; ctx.fillStyle='rgba(255,236,150,.22)'; ctx.beginPath(); ctx.moveTo(GUARD.x,gy);
      ctx.lineTo(GUARD.x-31,gy+62*d); ctx.lineTo(GUARD.x+31,gy+62*d); ctx.fill()}
    // lasers show up only while the sonar is going
    const reveal=heist.sonarT>0?Math.min(1,heist.sonarT/600):0;
    if(reveal&&st<4){ctx.strokeStyle=`rgba(255,60,70,${.85*reveal})`; ctx.lineWidth=1; ctx.beginPath();
      for(const [x1,y1,x2,y2] of LASERS){ctx.moveTo(x1+.5,y1+.5); ctx.lineTo(x2+.5,y2+.5)} ctx.stroke()}
    // rain + darkness with light around the crew
    ctx.fillStyle='rgba(170,190,230,.45)'; for(const r of cityRain)ctx.fillRect(r.x|0,r.y|0,1,3);
    const m=darkMask.getContext('2d'), tf=ctx.getTransform(), cx=-tf.e, cy=-tf.f;
    m.globalCompositeOperation='source-over'; m.clearRect(0,0,VW,VH);
    m.fillStyle=`rgba(4,5,14,${st>=4?.35:.62-reveal*.3})`; m.fillRect(0,0,VW,VH);
    m.globalCompositeOperation='destination-out';
    const hole=(x,y,r)=>{const gr=m.createRadialGradient(x-cx,y-cy,2,x-cx,y-cy,r); gr.addColorStop(0,'rgba(0,0,0,1)'); gr.addColorStop(1,'rgba(0,0,0,0)'); m.fillStyle=gr; m.fillRect(x-cx-r,y-cy-r,r*2,r*2)};
    for(const c of crewPositions())hole(c.x,c.y-8,34);
    if(st<2)for(const L of LIGHTS){const l=lightPos(L); hole(l.x,l.y,24)}
    if(st<4)hole(GUARD.x,heist.guardY-6,26);
    hole(STRANGER.x,STRANGER.y-8,20);
    ctx.drawImage(darkMask,cx,cy);
    // sonar ring
    if(heist.sprintT>0){const c=lead(); for(let i=0;i<4;i++){ctx.fillStyle=`rgba(190,210,255,${.5-i*.1})`; const back=P.dir==='left'?1:P.dir==='right'?-1:0, up=P.dir==='up'?1:P.dir==='down'?-1:0;
      ctx.fillRect(Math.round(c.x+back*(6+i*4)+((time/40+i)%3)-1),Math.round(c.y-2+up*(6+i*4)),2,1)}}
    if(heist.sonarT>3400&&heist.sonarAt){const r=(4200-heist.sonarT)/800*150; ctx.strokeStyle=`rgba(127,211,255,${1-r/150})`; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(heist.sonarAt.x,heist.sonarAt.y-6,r,0,Math.PI*2); ctx.stroke()}
    if(reveal){ctx.fillStyle=`rgba(80,160,255,${.08*reveal})`; ctx.fillRect(cx,cy,VW,VH)}
    // the cookie signal, once the job's done
    if(st>=4||have.city){   // the cookie signal, shining on the low clouds over roof B
      const sx=236, sy=58, pulse=.5+.08*Math.sin(time/500);
      ctx.fillStyle='rgba(255,240,180,.10)'; ctx.beginPath(); ctx.moveTo(228,CH); ctx.lineTo(sx-36,sy); ctx.lineTo(sx+36,sy); ctx.fill();
      ctx.fillStyle=`rgba(255,236,170,${pulse})`; ctx.beginPath(); ctx.ellipse(sx,sy,34,24,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='rgba(255,246,210,.35)'; ctx.beginPath(); ctx.ellipse(sx,sy,40,29,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='rgba(60,36,18,.85)'; [[-14,-8],[4,-12],[14,2],[-4,8],[-20,2],[2,-2],[16,-10],[-10,12]].forEach(([dx,dy])=>{ctx.fillRect(sx+dx,sy+dy,5,4)})}
    if(flashT>0){ctx.fillStyle=`rgba(220,230,255,${flashT/140*.3})`; ctx.fillRect(cx,cy,VW,VH)}
    if(heist.flashT>0){ctx.fillStyle=`rgba(255,40,40,${heist.flashT/500*.35})`; ctx.fillRect(cx,cy,VW,VH)}
    if(heist.caughtWho){const c=heist.crew.find(c=>c.id===heist.caughtWho); if(c){ctx.fillStyle='#ff4a4a'; ctx.fillRect(c.x-1,c.y-34,3,7); ctx.fillRect(c.x-1,c.y-25,3,2)}}
  },
  hud(){ const st=heistStage(); const steps=['Bridge the gap','Kill the searchlights','Open the skylight','Crack the vault','Beat Lars at anagrams','Done!'];
    return st>=5||have.city?'':`<span>${steps[st]}</span>` },
};
