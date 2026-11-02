// The city at night: the chocolate heist.
// You play a crew of three and switch between them:
//   you  = sonar pulse (lights up the dark, chalk-marks the invisible tripwires)
//   Lars = sprint (fast enough to dash between cover under the searchlights)
//   John = lift (carries the log, rips off the grate)
// Route: roof A (a log blocks the way to Dr. Alex's rooftop lab: John lifts it and carries it; the briefing; then the log bridges the gap) -> roof B (searchlights; Lars
//        hops cover to cover to the LIGHT POWER switch) -> roof C (a guard + a laser maze around the skylight) -> the vault.
const CW=520, CH=200;
const ROOF_A=R(6,30,112,156), ROOF_B=R(150,20,170,166), ROOF_C=R(352,26,160,160);
const BEAM_SLOT=R(116,96,36,12);          // where the log bridges A -> B
const PLANK_BC=R(318,140,36,12);          // fixed plank B -> C
const PLANK_GATE=R(336,138,3,16);               // a locked gate across that plank: it takes the key
const KEY_SPOT={x:230,y:176};             // the gate key, on a hook under a parked spotlight: only reachable while the lights are out
const gateOpen=()=>!!have.plankGate||heistStage()>=2;
const LIGHTS_OUT_MS=20000;                 // Lars's switch only kills the searchlights for this long; they stay off once the whole crew is on roof C
const DEFUSE_MS=4000;                      // hold A this long at the laser panel (it keeps half if you let go past halfway)
const STACK=R(448,52,52,22);               // the whole crew stands here before John rips the grate
const LOOSE_BEAM=R(41,117,34,7);          // the log, wedged between the water tank and the vents: it blocks the only way to Dr. Alex until John lifts it
// roof A: a water tank and a bank of vents split the roof; the only way through is a narrow gap between them
const TANK=R(6,112,40,18), VENTS=R(70,112,48,14);
const LAB={bench:R(16,46,32,8), coil:R(56,40,6,8)};
const LOG_DROP=R(90,92,28,22);            // the edge of roof A: walk up here to cross (Lars jumps, or John lays the log across)
const FUSE={x:312,y:100};
const SKYLIGHT=R(462,40,24,16);
const LADDER=R(10,166,22,14);
const STRANGER={x:40,y:66};               // Dr. Alex, at her lab bench (the client)
// roof C laser maze. Invisible ones only show while the sonar's going (and stay chalk-marked after a ping).
const LASERS=[
  [420,26,420,150],                        // wall on the left of the maze
  [420,150,436,150],[450,150,512,150],    // row 1: gap at 436-450
  [420,98,466,98],[480,98,512,98],        // row 3: gap at 466-480
];
const BLINK={y:124, x1:420, x2:512, period:2400, on:1300, warn:300};        // row 2: a visible beam across the whole row that blinks off
const SLIDER={y:72, x1:420, x2:512, gap:16, speed:.0011};                     // row 4: a visible beam with a gap that slides back and forth
const LASER_PANEL=R(496,52,12,8);          // past the maze, next to the skylight: shuts every laser off so the rest of the crew can walk through
const lasersOff=()=>!!have.lasersOff;
// searchlights on roof B: some sweep up and down, some swing in loops. Lamps sit on the roof's top edge.
const LIGHTS=[{x:200,kind:'sweep',speed:.15,phase:0},{x:228,kind:'orbit',cx:228,cy:104,r:46,speed:.09,phase:0},
              {x:258,kind:'sweep',speed:.21,phase:2.2},{x:286,kind:'orbit',cx:286,cy:100,r:52,speed:-.11,phase:1.3},
              {x:246,kind:'across',y:100,x1:196,x2:296,speed:.07,phase:1},    // and one that sweeps side to side across the middle
              {x:KEY_SPOT.x,kind:'fixed',y:KEY_SPOT.y-5,speed:0,phase:0}];     // and one parked on the key that never moves
const LIGHT_R=16;
// cover on roof B: crouch in the shadow right next to these and the lights can't see you
const COVERS=[R(204,118,16,10),R(238,66,10,12),R(262,130,14,14),R(170,32,10,10)];
const coverZone=o=>R(o.x-6,o.y-7,o.w+12,o.h+14);
const GUARD={x:396, y0:44, y1:176, speed:.03};
const CHECKPOINTS=[
  {hero:[40,156],lars:[52,162],john:[30,148]},     // 0: start, roof A (by the ladder)
  {hero:[166,100],lars:[166,116],john:[180,108]},  // 1: across the log, roof B
  {hero:[361,178],lars:[357,168],john:[358,184]},  // 2: across the plank, roof C (far enough left that the guard's flashlight never reaches)
];

const heist={
  crew:[{id:'hero',x:40,y:156,dir:'up',step:0,t:0,moving:false},{id:'lars',x:52,y:162,dir:'up',step:0,t:0,moving:false},{id:'john',x:30,y:148,dir:'up',step:0,t:0,moving:false}],
  lead:0, follow:true, trail:[], sprintT:0, sprintCd:0, sonarT:0, sonarCd:0, sonarAt:null, marked:false, carry:null,
  guardY:GUARD.y0, guardDir:1, guardWait:0, flashT:0, caught:false, hinted:{},
};
const heistStage=()=>have.heistStage||0;   // 0 nothing, 1 log across, 2 lights out, 3 grate off, 4 got the chocolate, 5 beat Lars at anagrams (reward pending)

// ---------- background: Vancouver at night, from the rooftops ----------
const cityRain=[...Array(170)].map(()=>({x:Math.random()*CW,y:Math.random()*CH}));
const cars=[...Array(8)].map((_,i)=>({lane:i%2, x:i<4?120:322, y:Math.random()*CH, v:(i%2?1:-1)*(.03+Math.random()*.03)}));
let flashT=0, nextFlash=9000;
const cityBg=document.createElement('canvas'); cityBg.width=CW; cityBg.height=CH;
(function(){
  const g=cityBg.getContext('2d'), F=(c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};
  F('#05060c',0,0,CW,CH);                                                         // the street, way down there
  for(const [x0,w] of [[118,32],[320,32]]){
    F('#0b0d16',x0,0,w,CH); for(let y=0;y<CH;y+=12)F('#1d2030',x0+w/2-1,y,1,6);                                      // the road and its center line
    for(let y=4;y<CH;y+=7)for(const sx of [x0+1,x0+w-4]){F('#141826',sx,y,3,5); if(rnd()<.35)F(rnd()<.5?'#f3d27a':'#8fd3ff',sx+1,y+1,1,2)}   // building walls, a few lit windows
    for(let k=0;k<6;k++){const y=rnd()*CH|0; F(['rgba(255,80,160,.25)','rgba(90,200,255,.22)','rgba(255,200,90,.2)'][k%3],x0+5,y,w-10,2)}   // neon reflected in the wet road
  }
  for(const r of [ROOF_A,ROOF_B,ROOF_C]){
    F('#141724',r.x-4,r.y-4,r.w+8,r.h+8); F('#2e3346',r.x-3,r.y-3,r.w+6,r.h+6); F('#3e445a',r.x-3,r.y-3,r.w+6,1);   // parapet: dark wall, a lit top edge
    F('#232737',r.x,r.y,r.w,r.h);                                                                // wet tar roof
    for(let i=0;i<r.w*r.h/10;i++)F(rnd()<.5?'#1f2332':'#292e40',r.x+rnd()*r.w|0,r.y+rnd()*r.h|0,1,1);                 // gravel
    for(let i=0;i<6;i++){const px=r.x+4+rnd()*(r.w-30)|0, py=r.y+6+rnd()*(r.h-16)|0, pw=10+rnd()*16|0;                // puddles with a sheen
      F('#1a2030',px,py,pw,3); F('#2f3a55',px+2,py,pw-6,1)}
    for(let x=r.x+14;x<r.x+r.w-8;x+=28)F('#262b3c',x,r.y+2,1,r.h-4);                                                  // roofing seams
    for(let i=0;i<30;i++)F(rnd()<.5?'#2f4a35':'#3a5a3e',r.x+rnd()*r.w|0,r.y+(rnd()<.5?1:r.h-2),2,1);                    // moss along the edges
    F('#3a3f52',r.x+r.w-4,r.y+6,2,r.h-12); F('#4a5064',r.x+r.w-4,r.y+6,1,r.h-12);                                     // a drainpipe
  }
  const plank=p=>{F('#4a3420',p.x,p.y,p.w,p.h); for(let x=p.x;x<p.x+p.w;x+=5)F('#3a2816',x,p.y,1,p.h); F('#5e4430',p.x,p.y,p.w,1)};
  plank(PLANK_BC);
  const ac=(r)=>{const {x,y,w,h}=r; F('rgba(0,0,0,.45)',x+2,y+h,w,3); F('#6f7686',x,y,w,h); F('#8b93a3',x,y,w,1); F('#4a5064',x+2,y+2,Math.min(8,w-4),h-4);
    for(let k=y+3;k<y+h-2;k+=2)F('#2e3346',x+2,k,Math.min(8,w-4),1); if(w>12){F('#5a6070',x+w-5,y+2,3,h-4); F('#c9ced4',x+w-4,y+3,1,1)}};
  // roof A: Dr. Alex's rooftop lab (bench of bubbling flasks, a tesla coil), a water tank, a bank of vents
  {const b=LAB.bench; F('rgba(0,0,0,.4)',b.x+1,b.y+b.h,b.w,3); F('#5a3a22',b.x,b.y,b.w,b.h); F('#7a5232',b.x,b.y,b.w,2);
    for(const [fx,c] of [[b.x+3,'#5fff8a'],[b.x+10,'#ff5fd2'],[b.x+18,'#5fd2ff'],[b.x+25,'#ffd75f']]){F('#cfe6f2',fx,b.y-5,4,6); F(c,fx,b.y-2,4,3); F('#cfe6f2',fx+1,b.y-7,2,2)}
    const c=LAB.coil; F('#3a3f52',c.x-1,c.y+6,8,3); F('#b87333',c.x+1,c.y,4,7); for(let k=c.y;k<c.y+7;k+=2)F('#8a5522',c.x+1,k,4,1); F('#c9ced4',c.x,c.y-3,6,3)}
  {const t=TANK; F('rgba(0,0,0,.45)',t.x+2,t.y+t.h,t.w,3); for(const lx of [t.x+4,t.x+t.w-6])F('#3a3f52',lx,t.y+t.h-4,2,4);
    F('#5a4a3a',t.x+2,t.y,t.w-4,t.h-4); F('#6e5b48',t.x+2,t.y,t.w-4,2); for(let x=t.x+6;x<t.x+t.w-4;x+=6)F('#4a3c2e',x,t.y,1,t.h-4); F('#3a2e22',t.x+2,t.y+5,t.w-4,1); F('#3a2e22',t.x+2,t.y+10,t.w-4,1)}
  ac(VENTS); F('#5a6070',VENTS.x+20,VENTS.y-6,6,6); F('#3a3f52',VENTS.x+21,VENTS.y-6,4,1);   // with an exhaust stack
  F('#8b93a3',12,170,2,10); F('#8b93a3',28,170,2,10); for(let y=171;y<180;y+=2)F('#8b93a3',12,y,18,1);                    // ladder top
  // roof B: cover (AC units, a vent, a tank, the chimney) and the searchlight lamps on the top edge
  ac(COVERS[0]); ac(COVERS[1]);
  {const t=COVERS[2]; F('rgba(0,0,0,.45)',t.x+2,t.y+t.h,t.w,3); F('#3f5a7a',t.x,t.y,t.w,t.h); F('#56769a',t.x,t.y,t.w,2); F('#2e4560',t.x+t.w-3,t.y,3,t.h)}
  {const c=COVERS[3]; F('rgba(0,0,0,.45)',c.x+2,c.y+c.h,c.w,3); F('#6b3b32',c.x,c.y,c.w,c.h); F('#7a4a3e',c.x,c.y,c.w,1); for(let y=c.y+3;y<c.y+c.h;y+=2)F('#5a332b',c.x,y,c.w,1); F('#2b1a16',c.x+2,c.y+2,c.w-4,3)}
  for(const L of LIGHTS){const x=L.kind==='orbit'?L.cx:L.x; F('#2b2f3a',x-1,ROOF_B.y-6,3,6); F('#8b93a3',x-4,ROOF_B.y-9,9,5); F('#c9ced4',x-3,ROOF_B.y-9,7,1); F('#fff4c4',x-2,ROOF_B.y-5,5,2)}
  // roof C: the old candy works. Striped awning edge, the skylight, laser posts
  for(let x=352;x<512;x+=8){F(x%16?'#e8e2d6':'#c8322b',x,ROOF_C.y-4,8,3)}
  F('#141724',SKYLIGHT.x-3,SKYLIGHT.y-3,SKYLIGHT.w+6,SKYLIGHT.h+6); F('#0f1626',SKYLIGHT.x,SKYLIGHT.y,SKYLIGHT.w,SKYLIGHT.h);
  F('#2c3a5a',SKYLIGHT.x+1,SKYLIGHT.y+1,10,14); F('#2c3a5a',SKYLIGHT.x+13,SKYLIGHT.y+1,10,14); F('#ffe9a8',SKYLIGHT.x+3,SKYLIGHT.y+3,2,2);   // a warm light down in the vault
  for(const y of [72,98,124,150]){F('#3a3f52',418,y-3,4,6); F('#5a1f22',419,y-1,2,2); F('#3a3f52',510,y-3,3,6)}
})();

// ---------- crew sprites ----------
function crewSprite(c,g=ctx){ ({hero:drawHero,lars:drawLars,john:drawJohn})[c.id](c,g); if(c.id==='hero'&&g===ctx)drawGear(c,g,heroLook()) }
function legs(c){ return [c.moving&&c.step%2?1:0, c.moving&&!(c.step%2)?1:0] }
// Joe: whatever he picked in the wardrobe (WARDROBE in story.js). Colors and pieces for each outfit:
const OUTFIT_LOOK={
  cape:   {top:'#34405c', pants:'#14161f', boots:'#0b0c12', belt:'#5a3a22', cape:['#0e1017','#1d2130'], head:'hair', mask:'#0b0c12'},
  potato: {top:'foil', pants:'#9aa1aa', boots:'#6b4a2e', head:'potato'},                 // a baked potato in foil, split open, with a pat of butter on top
  crumb:  {top:'crumb', pants:'#2b2d33', boots:'#141519', belt:'#c9ced4', cape:['#5d626d','#454953'], head:'hair', mask:'#141519', whisk:true},   // Captain Crumb: an original baker superhero
  sweater:{top:'sweater', pants:'#3a5f9e', boots:'#3b2a1e', head:'santa'},
  vikings:{top:'jersey', pants:'#ffc62f', boots:'#f2f2ee', head:'helmet'},
  disco:  {top:'disco', pants:'#f2efe6', boots:'#e8b04a', head:'afro', flare:true},
  avant:  {top:'avant', pants:'#1d1d22', boots:'#f2f2ee', head:'beret', flare:true},
  cupcake:{top:'cupcake', pants:'#f2efe6', boots:'#e54b7a', head:'frosting'},
};
const heroLook=()=>OUTFIT_LOOK[have.outfit]||OUTFIT_LOOK.cape;
function drawHero(c,g=ctx,look=heroLook()){
  const x=Math.round(c.x)-6, y=Math.round(c.y)-20, F=(col,dx,dy,w,h)=>{g.fillStyle=col;g.fillRect(x+dx,y+dy,w,h)};
  const skin='#f0c6a0', hair='#b08355', eye='#3d8ad6', L=look;
  const [a,b]=legs(c), sway=c.moving?(c.step%2?1:-1):0;
  F('rgba(0,0,0,.25)',1,19,10,2);
  if(L.cape&&c.dir!=='up'){F(L.cape[0],0+sway,7,12,12); F(L.cape[1],1+sway,8,1,10)}            // cape behind you
  const dk=col=>{if(typeof col!=='string'||col[0]!=='#'||col.length!==7)return col; return '#'+[1,3,5].map(k=>Math.max(0,parseInt(col.slice(k,k+2),16)-34).toString(16).padStart(2,'0')).join('')};
  F(L.pants,3,13,2,6-a); F(L.pants,7,13,2,6-b); F(dk(L.pants),4,13,1,6-a); F(dk(L.pants),8,13,1,6-b); F(L.boots,2,19-a,3,1); F(L.boots,7,19-b,3,1);
  if(L.flare){F(L.pants,2,18-a,4,1); F(L.pants,6,18-b,4,1); F(L.boots,2,19-a,4,1); F(L.boots,6,19-b,4,1)}   // bell-bottoms + platforms
  // body
  if(L.top==='crumb'){F('#2b2d33',2,7,8,7); F('#2b2d33',1,8,1,4); F('#2b2d33',10,8,1,4); F('#f2f2ee',1,11,1,2); F('#f2f2ee',10,11,1,2);   // black suit, white oven-mitt gloves
    if(c.dir==='down'){F('#f2f2ee',4,8,4,3); F('#ffffff',4,8,2,1); F('#6b707a',5,9,1,1); F('#6b707a',7,8,1,1); F('#6b707a',6,10,1,1)} }   // the white cookie emblem   // the cookie emblem
  else if(L.top==='foil'){F('#b9c0c8',1,6,10,8); F('#8d949c',1,13,10,1); for(const [fx,fy] of [[2,7],[5,8],[8,7],[3,10],[7,11],[9,9],[4,12]])F('#eef1f4',fx,fy,1,1); F('#8d949c',6,9,1,2); F('#8d949c',3,8,1,1)}   // crinkly foil   // fuzzy suit, lighter belly
  else if(L.top==='sweater'){F('#c8322b',1,7,10,6); F('#2f8a4a',1,9,10,1); F('#2f8a4a',1,12,10,1); F('#ffffff',3,8,1,1); F('#ffffff',6,8,1,1); F('#ffffff',9,8,1,1); F('#ffffff',4,10,1,1); F('#ffffff',8,10,1,1); F('#f4d35e',6,10,1,2)}
  else if(L.top==='jersey'){F('#4f2683',1,7,10,6); F('#ffc62f',1,7,2,2); F('#ffc62f',9,7,2,2); F('#ffffff',5,9,2,3); F('#ffc62f',1,12,10,1)}   // purple jersey, gold shoulders, a white number
  else if(L.top==='avant'){F('#1d1d22',2,6,8,7); F('#1d1d22',3,5,6,1); F('#f2f2ee',-1,5,5,5); F('#d9d9d4',-1,9,5,1); F('#1d1d22',10,8,1,5); F('#f2f2ee',3,12,6,1)}   // turtleneck, one huge white shoulder
  else if(L.top==='cupcake'){   // a big pleated cupcake wrapper from the chest to the knees, little arms poking out
    for(let yy=7;yy<16;yy++){const inset=Math.floor((yy-7)/3); F('#e0b46a',-1+inset,yy,14-inset*2,1)}
    for(let xx=0;xx<12;xx+=2)F('#b8863e',xx+(xx>5?0:0),8,1,8); F('#f2d49a',-1,7,14,1); F('#b8863e',1,15,10,1);
    F('#f0c6a0',-2,9,1,3); F('#f0c6a0',13,9,1,3)}
  else if(L.top==='disco'){F('#f2efe6',1,7,10,6); F('#e8742a',4,7,4,4); F('#f2efe6',5,8,2,3); F('#ffd84d',5,10,2,1); F('#d9d3c4',1,9,1,4); F('#d9d3c4',10,9,1,4)}   // white suit, orange wide collar, gold chain
  else {F(L.top,2,7,8,7); F(L.top,1,8,1,4); F(L.top,10,8,1,4); F(dk(L.top),9,8,1,5); F(dk(L.top),2,13,8,1)}
  if(L.belt)F(L.belt,2,12,8,1);
  if(L.whisk&&c.dir!=='left'){F('#8a5a34',9,11,1,2); F('#c9ced4',8,13,3,1); F('#c9ced4',8,14,1,1); F('#c9ced4',10,14,1,1); F('#c9ced4',9,15,1,1)}   // a whisk on the belt
  F(skin,3,2,6,5);
  // head
  if(L.head==='potato'){ const SK='#8a5a34', SKD='#6b4428', FL='#f6e7bd', BU='#f6d44c';   // potato skin around the face, fluffy inside, butter melting on top, chives
    F(SK,1,-1,10,8); F(SKD,1,6,10,1); F(SKD,2,0,1,1); F(SKD,9,3,1,1);
    if(c.dir!=='up'){ F(FL,2,0,8,6);
      if(c.dir==='down'){F(skin,3,1,6,5); F(eye,4,3,1,1); F(eye,7,3,1,1); F('#b5654f',5,5,2,1); F('#f5b6b0',3,4,1,1); F('#f5b6b0',8,4,1,1)}
      if(c.dir==='left'){F(skin,2,1,4,5); F(eye,3,3,1,1)}
      if(c.dir==='right'){F(skin,6,1,4,5); F(eye,8,3,1,1)} }
    F(BU,3,-3,6,3); F('#fff3a8',4,-3,3,1); F('#e0b830',3,-1,6,1); F(BU,3,0,1,1); F(BU,8,0,1,2);   // the butter hat, dripping
    for(const [cx,cy] of [[2,-1],[9,0],[5,-4],[1,2]])F('#3f9a3a',cx,cy,1,1);                       // chives
    return }
  if(L.head==='helmet'){ F('#4f2683',2,-1,8,7); F('#3d1d66',2,5,8,1); F('#ffc62f',5,-1,2,7);                                // helmet with a gold stripe
    if(c.dir==='up')return;
    if(c.dir==='down'){F(skin,3,3,6,3); F(eye,4,4,1,1); F(eye,7,4,1,1); F('#8a8f9a',3,5,6,1); F('#8a8f9a',4,4,1,2); F('#8a8f9a',7,4,1,2); F('#f2f2ee',1,1,2,2); F('#f2f2ee',9,1,2,2)}
    if(c.dir==='left'){F(skin,2,3,4,3); F(eye,3,4,1,1); F('#8a8f9a',2,5,4,1); F('#f2f2ee',7,1,3,2)}
    if(c.dir==='right'){F(skin,6,3,4,3); F(eye,8,4,1,1); F('#8a8f9a',6,5,4,1); F('#f2f2ee',2,1,3,2)}
    return }
  if(L.head==='beret'){ F('#1d1d22',3,2,6,1);   // slicked hair under the beret
    if(c.dir==='up'){F('#c8322b',1,-2,9,4); return}
    F('#c8322b',1,-2,9,3); F('#c8322b',8,-3,2,2); F('#8a1f1a',5,-3,1,1);
    if(c.dir==='down'){F('#1d1d22',3,3,2,2); F('#1d1d22',7,3,2,2); F('#1d1d22',5,3,2,1); F('#b5654f',5,6,2,1)}   // tiny round sunglasses
    if(c.dir==='left'){F('#1d1d22',2,3,2,2)}
    if(c.dir==='right'){F('#1d1d22',8,3,2,2)}
    return }
  if(L.head==='frosting'){   // a giant swirl of pink frosting all around the face, sprinkles, cherry on top
    const P1='#f39ac0', P2='#fcc9de';
    F(P1,-1,3,14,5); F(P1,0,0,12,4); F(P1,2,-3,8,3); F(P1,4,-5,4,2);
    F(P2,1,1,4,1); F(P2,3,-2,3,1); F(P2,5,-4,2,1); F(P2,0,5,3,1); F(P2,9,4,3,1);
    for(const [sx,sy,col] of [[1,4,'#4fbf73'],[10,2,'#5fa8e8'],[3,-2,'#f4d35e'],[8,-3,'#ffffff'],[11,6,'#e54b4b'],[0,1,'#5fa8e8'],[6,-4,'#4fbf73']])F(col,sx,sy,1,1);
    F('#c8322b',5,-8,3,3); F('#e85a50',5,-8,1,1); F('#2f8a4a',7,-10,1,2);   // cherry
    if(c.dir==='up')return;
    if(c.dir==='down'){F(skin,3,2,6,5); F(eye,4,4,1,1); F(eye,7,4,1,1); F('#b5654f',5,6,2,1); F('#f2a7a0',3,5,1,1); F('#f2a7a0',8,5,1,1)}
    if(c.dir==='left'){F(skin,2,2,5,5); F(eye,3,4,1,1); F('#b5654f',3,6,1,1)}
    if(c.dir==='right'){F(skin,5,2,5,5); F(eye,8,4,1,1); F('#b5654f',8,6,1,1)}
    return }
  if(L.head==='afro'){ F('#4a2e1c',0,-3,12,7); F('#5a3a22',1,-4,10,2); F('#4a2e1c',0,3,2,3); F('#4a2e1c',10,3,2,3);               // big 70s hair
    if(c.dir==='up'){F('#4a2e1c',1,0,10,7); return}
    if(c.dir==='down'){F('#e8b04a',3,3,6,2); F('#5a3a22',4,3,1,1); F('#5a3a22',7,3,1,1); F('#b5654f',5,6,2,1); F('#5a3a22',4,5,4,1)}   // gold aviators, a mustache
    if(c.dir==='left'){F('#e8b04a',2,3,3,2)}
    if(c.dir==='right'){F('#e8b04a',7,3,3,2)}
    return }
  if(L.head==='hood'){ F(L.hat,1,0,10,4); F(L.hat,1,3,2,5); F(L.hat,9,3,2,5); F('#4f535c',2,4,1,3); F('#4f535c',9,4,1,3);
    if(c.dir==='up'){F(L.hat,1,0,10,8); return}
    F('#d9ad88',3,3,6,1);
    if(c.dir==='down'){F(eye,4,4,1,1); F(eye,7,4,1,1); F('#b5654f',5,6,2,1); F('#e8e8e0',4,7,1,2); F('#e8e8e0',7,7,1,2)}
    if(c.dir==='left'){F(L.hat,7,2,3,5); F(eye,3,4,1,1)}
    if(c.dir==='right'){F(L.hat,2,2,3,5); F(eye,8,4,1,1)}
    return }
  if(c.dir==='up'&&L.cape){F(L.cape[0],0+sway,6,12,12); F(L.cape[1],5,7,2,10)}
  { // Joe's head: the same as in his jersey (squarer, shaded hair, eye whites); a mask goes over the eyes
    const set=c.dir==='left'?JOE_ROWS.right:(JOE_ROWS[c.dir]||JOE_ROWS.down), head=set.slice(0,8).map((r,i)=>i===7?r.replace(/[^.]/g,'.'):r);
    let rows=head; if(blinkNow()&&c.dir!=='up')rows=rows.map((r,i)=>i===5?r.replace(/[WE]/g,'s'):r);
    blit(g,x,y-1,rows,JOE_PAL,c.dir==='left');
    const m=L.mask;
    if(m&&c.dir!=='up'){ if(c.dir==='down'){F(m,2,3,8,2); F('#ffffff',3,4,1,1); F(eye,4,4,1,1); F(eye,7,4,1,1); F('#ffffff',8,4,1,1)}
      else if(c.dir==='left'){F(m,1,3,6,2); F(eye,3,4,1,1)} else {F(m,5,3,6,2); F(eye,8,4,1,1)} }
  }
  if(L.head==='santa'){F('#c8322b',3,-3,6,3); F('#c8322b',8,-4,2,2); F('#ffffff',11,-5,2,2); F('#c8322b',10,-5,1,2); F('#ffffff',2,0,8,1)}
}
// ---------- the wardrobe: pick Joe's stealth outfit before going up ----------
function openWardrobe(then,mode='heist',fromSettings=false){   // mode 'look' = Joe's everyday look at the start (adds the jersey)
  const W=WARDROBE, look=mode==='look', open=W.outfits.filter(o=>!o.unlock||have[o.unlock]), list=look?[W.jersey,...open]:open, key=look?'look':'outfit';
  let pick=have[key]||(look?'jersey':'cape');
  $('wardTitle').textContent=look?ALEX_WELCOME.lookTitle:W.title; $('wardIntro').textContent=fromSettings?W.changeIntro:look?ALEX_WELCOME.lookIntro:W.intro; $('wardGo').textContent=look?ALEX_WELCOME.lookGo:W.go;
  const render=()=>{ $('outfits').querySelectorAll('.outfit').forEach(b=>b.classList.toggle('on',b.dataset.id===pick)); $('wardLine').textContent=list.find(o=>o.id===pick).line };
  $('outfits').replaceChildren(...list.map(o=>{const b=document.createElement('button'); b.className='outfit'; b.dataset.id=o.id;
    const cv=document.createElement('canvas'); cv.width=16; cv.height=29; const who={x:8,y:28,dir:'down',moving:false,step:0};
    if(o.id==='jersey')drawJoeJersey(who,cv.getContext('2d')); else drawHero(who,cv.getContext('2d'),OUTFIT_LOOK[o.id]);
    const sp=document.createElement('span'); sp.textContent=o.name; b.append(cv,sp); b.onclick=()=>{pick=o.id; render()}; return b}));
  $('wardGo').onclick=()=>{ $('wardrobe').hidden=true; have[key]=pick; save(); paused=false; then&&then() };
  render(); paused=true; prompt.hidden=true; $('wardrobe').hidden=false; setTimeout(()=>$('wardGo').focus({preventScroll:true}),0);
}
// Lars: tall runner, short blond hair, singlet with a race bib, split shorts, neon shoes
// Lars: tall runner, short blond hair, blue singlet with a race bib, split shorts, white socks, neon pink racing shoes. 10 x 24 px.
const LARS_PAL={L:'#e6c46a',l:'#c9a54a',y:'#f2d88a',S:'#f3cba8',s:'#ddb18c',E:'#3d6fb0',M:'#c9876f',B:'#2f6db0',b:'#245a94',w:'#ffffff',r:'#c8322b',K:'#1c1c22',k:'#2e2e38'};
const LARS_SPR={
  down: ["...LyyL...","..LLLLLL..","..LSSSSL..","..SESSES..","..sSssSs..","...SMMS...",
         ".SBBBBBBS.",".SBBBBBbS.",".SBwwwwbS.",".SBwrrwbS.",".SBwwwwbS.",".sBBBBBbs.","..KKKKKK..","..KKkkKK.."],
  right:["...LLyyL..","..LLLLLLL.","..LLLSSSS.","..LLsSSES.","...lSSSSSS","....SSMS..",
         "..BBBBBB..","..BBBBBSb.","..BBwwSwb.","..BBwrSwb.","..BBwwSwb.","..BBBBsBb.","..KKKKKK..","..KKkkKK.."],
  up:   ["...LyyL...","..LLLLLL..","..LLLLLL..","..sLLLLs..","...lLLl...","....ss....",
         ".SBBBBBBS.",".SBBBBBbS.",".SBBBBBbS.",".SBBBBBbS.",".SBBBBBbS.",".sBBBBBbs.","..KKKKKK..","..KKKKKK.."],
};
function drawLars(c,g=ctx){
  const x=Math.round(c.x)-5, y=Math.round(c.y)-23, F=(col,dx,dy,w,h)=>{g.fillStyle=col;g.fillRect(x+dx,y+dy,w,h)};
  const [a,b]=legs(c);
  F('rgba(0,0,0,.25)',1,22,8,2);
  const leg=(x0,lift)=>{F('#f3cba8',x0,14,2,6-lift); F('#ddb18c',x0+1,14,1,6-lift); F('#ffffff',x0,20-lift,2,1); F('#ff1fd2',x0-1,21-lift,3,2); F('#ffb3f5',x0-1,21-lift,2,1); F('#c6ff1a',x0-1,22-lift,3,1)};   // long legs, white socks, neon pink racers with neon-yellow soles
  leg(2,a); leg(6,b);
  drawSprite(g,x,y,LARS_SPR,LARS_PAL,c.dir||'down',3,11);
}
// John: shorter, super jacked, white muscle tank, jeans, red bandana
// John: shorter, super jacked, a big head, white muscle tank, jeans, a red bandana knotted at the back. 15 x 21 px.
const JOHN_PAL={R:'#c8322b',r:'#9e2620',w:'#f4f4f0',H:'#5a3b24',S:'#e2aa80',s:'#c98f66',E:'#2b2b2b',M:'#a86a50',T:'#f4f4f0',t:'#dcdcd6'};
const JOHN_SPR={
  down: ["...RRRRRRRRR...","...RRwRRRRwRRr.","...HHHHHHHHH.r.","...SSSSSSSSS...","...SSESSSESS...","...sSSSsSSSs...","...SSSMMMSSS...","....sSSSSSs....",".SSSTTTTTTTSSS.",".SSSTTTTTTTSSS.","SSSsTTTTTTTsSSS","SSSsTTTTTTTsSSS","SsSsTTTTTTtsSsS","SsSstttttttsSsS","SsS.........SsS"],
  right:["....RRRRRRRRR..","..rRRRwRRRRwR..",".r..HHHHHHH....","....SSSSSSSS...","....SSSSSSES...","....sSSSSSSSS..","....SSSSSMSS...",".....sSSSSs....",".SSSTTTTTTTSSS.",".SSSTTTTTTTSSS.","SSSsTTTTTTTsSSS","SSSsTTTTTTTsSSS","SsSsTTTTTTtsSsS","SsSstttttttsSsS","SsS.........SsS"],
  up:   ["...RRRRRRRRR...","...RRRRRRRRR...","...rRHHHHHRr...","...r.HHHHHH....","....sHHHHHs....","....sHHHHHs....","....sSSSSSs....",".....sSSSs.....",".SSSTTTTTTTSSS.",".SSSTTTTTTTSSS.","SSSsTTTTTTTsSSS","SSSsTTTTTTTsSSS","SsSsTTTTTTtsSsS","SsSstttttttsSsS","SsS.........SsS"],
};
function drawJohn(c,g=ctx){
  const x=Math.round(c.x)-7, y=Math.round(c.y)-18, F=(col,dx,dy,w,h)=>{g.fillStyle=col;g.fillRect(x+dx,y+dy,w,h)};
  const [a,b]=legs(c);
  F('rgba(0,0,0,.25)',2,17,11,2);
  F('#3a5f9e',3,12,4,5-a); F('#3a5f9e',8,12,4,5-b); F('#2c4a7c',6,12,1,4-a); F('#2c4a7c',11,12,1,4-b); F('#4d74b4',3,13,1,2); F('#4d74b4',8,13,1,2);   // jeans
  F('#3b2a1e',3,16-a,4,2); F('#3b2a1e',8,16-b,4,2); F('#5a4030',3,16-a,2,1); F('#5a4030',8,16-b,2,1);                                                       // boots
  drawSprite(g,x,y-2,JOHN_SPR,JOHN_PAL,c.dir||'down',4,12);   // (a bigger head: it starts two rows higher)
}
// Dr. Alex: Alex in a mad-scientist costume. Lab coat over her green tee, goggles, hair gone wild, a bubbling flask.
function drawStranger(sx=STRANGER.x,sy=STRANGER.y){
  drawAlex(sx,sy,'ok');
  const F=(c,dx,dy,w,h)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(sx)-6+dx,Math.round(sy)-21+dy,w,h)};
  F('#f4f4f0',1,8,3,10); F('#f4f4f0',8,8,3,10); F('#dcdcd6',3,8,1,10); F('#dcdcd6',8,8,1,10); F('#f4f4f0',2,16,2,2); F('#f4f4f0',8,16,2,2); F('#c9ced4',2,12,1,1);   // a long lab coat, open over the tee (and a pen in the pocket)
  F(ALEX.hair,0,0,2,2); F(ALEX.hair,10,0,2,2); F(ALEX.hair,1,-1,2,1); F(ALEX.hair,5,-2,2,2); F(ALEX.hair,9,-1,2,1); F(ALEX.hair,0,4,1,3); F(ALEX.hair,11,4,1,3);   // frizzed out
  F('#2b2b2b',1,4,10,1); F('#2b2b2b',2,3,4,3); F('#2b2b2b',6,3,4,3); F('#7fd3ff',3,3,2,2); F('#7fd3ff',7,3,2,2); F('#d6f2ff',3,3,1,1); F('#d6f2ff',7,3,1,1);   // lab goggles, on
  const b=Math.floor(time/300)%3; F('#cfe6f2',11,11,3,4); F('#5fff8a',11,13,3,2); F('#cfe6f2',12,10,1,1); F('#9fffbf',12,8-b,1,1);   // a bubbling flask
}
// the Confectioner's guard: cap with a badge, grey uniform, a flashlight
const GUARD_PAL={C:'#1c1c22',c:'#2b2b33',Y:'#e0b030',S:'#e9b98f',s:'#d29f77',E:'#2b2b2b',M:'#a86a50',U:'#5a5f6a',u:'#474c56',l:'#6f7480'};
const GUARD_SPR={
  down:["..CCCCCC..","..CCYYCC..","..cccccc..","...SESES..","...sSSSs..","...SMMMS..",
        ".UUUUUUUU.",".UUYUUUlU.",".UUUUUUuU.",".UuuuuuuU.",".UUUUUUuU.",".SUUUUUuS.",".UUUUUUUU."],
  up:  ["..CCCCCC..","..CCCCCC..","..CCCCCC..","...sSSSs..","...SSSSS..","....sSs...",
        ".UUUUUUUU.",".UUUUUUlU.",".UUUUUUuU.",".UuuuuuuU.",".UUUUUUuU.",".SUUUUUuS.",".UUUUUUUU."],
};
function drawGuard(){
  const gy=heist.guardY, x=GUARD.x-5, y=Math.round(gy)-18, F=(c,dx,dy,w,h)=>{ctx.fillStyle=c;ctx.fillRect(x+dx,y+dy,w,h)};
  F('rgba(0,0,0,.25)',1,17,10,2);
  F('#2c2c34',3,13,2,4); F('#2c2c34',6,13,2,4); F('#1d1d22',2,17,3,1); F('#1d1d22',6,17,3,1);
  drawSprite(ctx,x,y,GUARD_SPR,GUARD_PAL,heist.guardDir>0?'down':'up',3,13);
  if(heist.guardDir>0){F('#c9ced4',8,11,2,3); F('#fff4c4',8,13,2,1)} else F('#c9ced4',8,6,2,3);
}
// the log: a big tree trunk. Lying on roof A, carried by John (sideways or upright), or across the gap.
function logH(x,y,w){const F=(c,a,b,ww,h)=>{ctx.fillStyle=c;ctx.fillRect(a,b,ww,h)};
  F('#4a2e1a',x,y,w,7); F('#7a5232',x,y+1,w,4); F('#8f6440',x,y+1,w,1); for(let k=x+3;k<x+w-3;k+=5)F('#4a2e1a',k,y+((k/5|0)%2?2:4),3,1);
  F('#d9b47c',x+w-3,y,3,7); F('#b08a5a',x+w-2,y+2,1,3); F('#d9b47c',x,y,2,7)}
function logV(x,y,h){const F=(c,a,b,ww,hh)=>{ctx.fillStyle=c;ctx.fillRect(a,b,ww,hh)};
  F('#4a2e1a',x,y,7,h); F('#7a5232',x+1,y,4,h); F('#8f6440',x+1,y,1,h); for(let k=y+3;k<y+h-3;k+=5)F('#4a2e1a',x+((k/5|0)%2?2:4),k,1,3);
  F('#d9b47c',x,y,7,3); F('#b08a5a',x+2,y+1,3,1)}
function drawBeam(){
  if(heistStage()>=1){const b=BEAM_SLOT; logH(b.x,b.y+2,b.w); return}
  if(heist.carry)return;   // John's got it (drawn with him)
  const b=LOOSE_BEAM; ctx.fillStyle='rgba(0,0,0,.35)'; ctx.fillRect(b.x+1,b.y+6,b.w,2); logH(b.x,b.y,b.w);
  // dashed outline across the gap, showing where it'd fit
  const s=BEAM_SLOT, on=(time/300|0)%2; ctx.fillStyle=`rgba(200,215,235,${on?.55:.3})`;
  for(let x=s.x;x<s.x+s.w;x+=6){ctx.fillRect(x,s.y+2,3,1); ctx.fillRect(x,s.y+9,3,1)} ctx.fillRect(s.x,s.y+2,1,8); ctx.fillRect(s.x+s.w-1,s.y+2,1,8);
}
function drawCarriedLog(c){ if(!heist.carry||c.id!=='john')return; logV(Math.round(c.x)+3,Math.round(c.y)-32,30) }   // up on John's shoulder
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
  heist.guardY=GUARD.y0; heist.guardDir=1; heist.guardWait=0; heist.carry=null; heist.lightsOutT=0; heist.defuse=null; heist.defusing=false;
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
  if(id==='hero'&&heist.sonarCd<=0){sfx('ping'); heist.sonarT=4200; heist.sonarCd=1600; heist.sonarAt={x:P.x,y:P.y}; if(P.x>ROOF_C.x-10)heist.marked=true}   // pinging near the maze chalk-marks the tripwires
  if(id==='lars'&&heist.sprintCd<=0){sfx('whoosh'); heist.sprintT=800; heist.sprintCd=1100}
  if(id==='john')flashPrompt(heist.carry?HEIST.johnHolding:'Nothing heavy here.')
}
function flashPrompt(text){prompt.textContent=text; prompt.hidden=false; heist.promptT=1400}

// ---------- hazards ----------
function lightPosAt(L,t){ const a=t*L.speed/60+L.phase;
  if(L.kind==='orbit')return {x:L.cx+Math.cos(a)*L.r*.38, y:L.cy+Math.sin(a)*L.r};
  if(L.kind==='across')return {x:L.x1+((Math.sin(a)+1)/2)*(L.x2-L.x1), y:L.y};
  if(L.kind==='fixed')return {x:L.x, y:L.y};
  return {x:L.x, y:ROOF_B.y+LIGHT_R+((Math.sin(a)+1)/2)*(ROOF_B.h-LIGHT_R*2)} }
const lightPos=L=>lightPosAt(L,time);
const inCover=(x,y)=>COVERS.some(o=>hit(R(x-3,y-3,6,4),coverZone(o)));
const lightsOn=()=>heistStage()<2&&!(heist.lightsOutT>0);
// the lasers that are on right now: [x1,y1,x2,y2,visible]
function laserSegs(t=time){
  const out=LASERS.map(l=>[...l,false]);
  if((t%BLINK.period)<BLINK.on)out.push([BLINK.x1,BLINK.y,BLINK.x2,BLINK.y,true]);
  const gx=sliderGap(t); out.push([SLIDER.x1,SLIDER.y,gx,SLIDER.y,true],[gx+SLIDER.gap,SLIDER.y,SLIDER.x2,SLIDER.y,true]);
  return out }
const sliderGap=t=>SLIDER.x1+4+((Math.sin(t*SLIDER.speed)+1)/2)*(SLIDER.x2-SLIDER.x1-SLIDER.gap-8);
function crewPositions(){syncLeadFromP(); return heist.crew.map(c=>({x:c.x,y:c.y,id:c.id}))}
function segHitsBox(x1,y1,x2,y2,b){ // thin laser vs feet box
  if(x1===x2)return x1>=b.x&&x1<=b.x+b.w&&Math.max(y1,y2)>=b.y&&Math.min(y1,y2)<=b.y+b.h;
  return y1>=b.y&&y1<=b.y+b.h&&Math.max(x1,x2)>=b.x&&Math.min(x1,x2)<=b.x+b.w;
}
function checkHazards(){
  const pos=crewPositions();
  for(const p of pos){
    if(lightsOn()&&!inCover(p.x,p.y)) for(const L of LIGHTS){const l=lightPos(L); if(Math.hypot(p.x-l.x,p.y-7-l.y)<LIGHT_R-2)return {msg:HEIST.spottedLight, who:p.id}}
    // guard's flashlight cone (he faces the way he's walking)
    const gx=GUARD.x, gy=heist.guardY-6, along=(p.y-3-gy)*heist.guardDir, perp=Math.abs(p.x-gx);
    if(heist.guardWait<=0&&along>0&&along<62&&perp<along*.5+3)return {msg:HEIST.spottedGuard, who:p.id};
    const box=R(p.x-3,p.y-3,6,4);
    if(heistStage()<4&&!lasersOff())for(const [x1,y1,x2,y2] of laserSegs())if(segHitsBox(x1,y1,x2,y2,box))return {msg:HEIST.spottedLaser, who:p.id};
  }
  return null;
}
function caught(hz){
  sfx('alarm'); have.spotted=(have.spotted||0)+1; save();
  heist.flashT=500; heist.caughtWho=hz.who; for(const k in dirs)dirs[k]=false;
  const name=HEIST.crew[hz.who], you=hz.who===lead().id;
  const pages=[hz.msg.replace('{who}',you?'you':name).replace('{Who}',you?'You':name)];
  if(!you&&heist.follow)pages.push(HEIST.followTip.replace('{who}',name));
  pages.push(HEIST.backToCheckpoint);
  showDialog({place:HEIST.place,speaker:'Spotted!',pages,actions:[{label:'OK',fn:()=>{closeDialog();heist.caughtWho=null;placeAtCheckpoint()}}]});
}

// ---------- story beats ----------
const say=(lines,done)=>{ // lines: [[speaker,text],...] (or [speaker,text,face] to use another portrait)
  let i=0; const next=()=>{ if(i>=lines.length){closeDialog(); done&&done(); return}
    const [sp,tx,face]=lines[i++]; showDialog({place:scene.place||HEIST.place,speaker:sp,face,pages:[tx],actions:[{label:i>=lines.length?'OK':'Next',fn:next}]}) };
  next();
};
function briefing(){
  have.heistBriefed=true; save();
  say([...HEIST.briefing.map(t=>[HEIST.stranger,t]),...HEIST.crewHello],()=>openHowTo());
}
function hintOnce(key,who,text){ if(heist.hinted[key])return; heist.hinted[key]=true; say([[who,text]]) }
// the log blocks the way: only John can lift it, and then he carries it everywhere until it's a bridge
function beamChoice(){
  const H=HEIST;
  showDialog({place:H.place,speaker:'',pages:[H.beamLook],menu:true,actions:[
    {label:H.beamLift,fn:()=>{ if(lead().id!=='john')return say(lead().id==='lars'?H.beamTooHeavyLars:H.beamTooHeavy); closeDialog(); pickUpLog() }},
    {label:H.beamLeave,ghost:true,fn:closeDialog}]});
}
function pickUpLog(){ heist.carry={rot:'v'}; sfx('thud'); say([['John',HEIST.carryHint]]) }
// at the edge of roof A: Lars wants to jump it; John has the log
function gapChoice(){
  const H=HEIST;
  showDialog({place:H.place,speaker:'',pages:[H.gapLook],menu:true,actions:[
    {label:H.beamJump,fn:()=>{ closeDialog(); say(H.beamJumpBefore,larsJump) }},
    {label:H.gapLog,fn:()=>{ if(!heist.carry)return say(H.needLog); if(!have.heistBriefed)return say([['John',H.briefFirst]]); closeDialog(); liftBeam() }},
    {label:H.gapLater,ghost:true,fn:closeDialog}]});
}
// Lars's long jump: walk back for a run-up, sprint at the gap, leap... and boing right back. John is not amused.
const JUMP={WALK:900, RUN:450, AIR:650, DAZE:1400, Y:104, START:58, EDGE:112};
function larsJump(){
  const L=heist.crew.find(c=>c.id==='lars'); syncLeadFromP();
  heist.jump={t:0, from:{x:L.x,y:L.y}}; paused=true; prompt.hidden=true;
}
function jumpTick(dt){
  const j=heist.jump; if(!j)return; j.t+=dt; const L=heist.crew.find(c=>c.id==='lars'), J=heist.crew.find(c=>c.id==='john'), t=j.t, set=(x,y)=>{L.x=x; L.y=y; if(lead()===L){P.x=x;P.y=y;P.dir=L.dir}};
  const lerp=(a,b,u)=>a+(b-a)*Math.max(0,Math.min(1,u));
  L.moving=true; L.t=(L.t||0)+dt; if(L.t>90){L.t=0; L.step++}
  if(t<JUMP.WALK){ const u=t/JUMP.WALK; if(u<.5){L.dir=j.from.x>JUMP.START?'left':'right'; set(lerp(j.from.x,JUMP.START,u*2),j.from.y)} else {L.dir='up'; set(JUMP.START,lerp(j.from.y,JUMP.Y,u*2-1))} }   // over to the gap between the tank and the vents, then up through it
  else if(t<JUMP.WALK+JUMP.RUN){ L.dir='right'; set(lerp(JUMP.START,JUMP.EDGE,(t-JUMP.WALK)/JUMP.RUN),JUMP.Y) }
  else if(t<JUMP.WALK+JUMP.RUN+JUMP.AIR){ if(!j.jumped){j.jumped=true; sfx('jump')} const u=(t-JUMP.WALK-JUMP.RUN)/JUMP.AIR; L.moving=false; j.air=Math.sin(Math.PI*u)*18; set(JUMP.EDGE+Math.sin(Math.PI*u)*14,JUMP.Y-j.air) }
  else { if(!j.landed){j.landed=true; sfx('boing')} j.air=0; L.moving=false; L.dir='down'; set(JUMP.EDGE,JUMP.Y); j.dazed=true;
    if(J){J.dir=J.x<L.x?'right':'left'}
    if(t>JUMP.WALK+JUMP.RUN+JUMP.AIR+JUMP.DAZE){ heist.jump=null; heist.annoyT=9000; heist.dazeT=2500; say(HEIST.beamJumpAfter,()=>{ if(!have.icecream)say(HEIST.jumpIceCream,()=>showReward('icecream')) }) } }
  if(t>JUMP.WALK+JUMP.RUN+JUMP.AIR*.8)heist.annoyT=Math.max(heist.annoyT||0,1);
}
function drawJumpEmotes(){
  const L=heist.crew.find(c=>c.id==='lars'), J=heist.crew.find(c=>c.id==='john'), F=(c,x,y,w,h)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),w,h)};
  if(heist.jump&&heist.jump.air>0){ctx.fillStyle='rgba(0,0,0,.3)'; ctx.fillRect(Math.round(L.x)-4,JUMP.Y-1,9,2)}           // his shadow stays on the roof
  if((heist.jump&&heist.jump.dazed)||heist.dazeT>0){ for(let k=0;k<3;k++){const a=time/180+k*2.1; F(k%2?'#ffe14a':'#ffffff',L.x+Math.cos(a)*6-1,L.y-27+Math.sin(a)*2,2,2)} }   // seeing stars
  if(heist.annoyT>0&&J){ const x=J.x+5, y=J.y-24, c='#ff4a3a', on=Math.floor(time/300)%2;                                   // John's anger mark
    F(c,x,y,2,1); F(c,x,y,1,2); F(c,x+4,y,2,1); F(c,x+5,y,1,2); F(c,x,y+5,2,1); F(c,x,y+4,1,2); F(c,x+4,y+5,2,1); F(c,x+5,y+4,1,2);
    if(on){F('#9fd2f0',J.x-8,J.y-20,2,3); F('#9fd2f0',J.x-7,J.y-21,1,1)} }                                                  // and a sweat drop
}
// ---------- the way home: a quick word, then down the grate ----------
function heistExit(){ say(HEIST.exitLines,()=>goTo('world','fromCity')) }
// the big breaker that runs the searchlights: lever up = on, lever down = off (after Lars flips it)
function drawPowerSwitch(){
  const on=lightsOn(), x=FUSE.x-14, y=FUSE.y-48, F=(c,dx,dy,w,h)=>{ctx.fillStyle=c;ctx.fillRect(x+dx,y+dy,w,h)};
  if(on){const gr=ctx.createRadialGradient(x+14,y+16,2,x+14,y+16,30); gr.addColorStop(0,'rgba(244,211,94,.22)'); gr.addColorStop(1,'rgba(244,211,94,0)'); ctx.fillStyle=gr; ctx.fillRect(x-16,y-14,60,60)}
  F('rgba(0,0,0,.35)',2,33,26,3);
  F('#6b7280',0,0,28,34); F('#8a92a0',0,0,28,1); F('#8a92a0',0,0,1,34); F('#3a3f52',0,33,28,1); F('#3a3f52',27,0,1,34);   // big metal cabinet
  for(let i=0;i<28;i+=4){F('#f4d35e',i,2,2,4); F('#1d1d22',i+2,2,2,4)}                                                  // hazard stripes
  F('#1d2130',3,8,22,13); pixText(ctx,'LIGHT',x+5,y+9,'#f4d35e'); pixText(ctx,'POWER',x+5,y+15,'#f4d35e');                     // the label
  F('#2b2f3a',10,22,8,11); F('#1d1d22',13,23,2,9);                                                                     // the slot
  if(on){F('#c9ced4',13,25,2,5); F('#e54b4b',9,22,10,3); F('#ff8a7a',9,22,10,1)} else {F('#c9ced4',13,27,2,4); F('#8a2a22',9,30,10,3)}   // the lever, up = on
  F(on?(Math.floor(time/400)%2?'#7dff8a':'#3fbf5a'):'#2a3a2a',21,23,4,3); F(on?'#4a2020':(Math.floor(time/400)%2?'#ff4a3a':'#a02a22'),21,28,4,3);   // ON / OFF lights
  if(on&&Math.floor(time/300)%2){F('#f4d35e',3,23,4,1); F('#f4d35e',4,24,3,1); F('#f4d35e',3,25,4,1); F('#f4d35e',4,26,2,2)}   // a little lightning bolt
  F('#1d1d22',28,10,12,2); F('#1d1d22',38,10,2,26);                                                                     // the cable to the lights
}
function liftBeam(){
  heist.carry=null; have.heistStage=1; save(); sfx('thud'); P.x=100; P.y=104; say([['John',HEIST.beamDone]],()=>roundWon(1));
}
// Lars flips the switch: 20 seconds of dark. Get everyone through the gate onto roof C before the lights come back.
function cutFuse(){
  if(lead().id!=='lars')return flashPrompt(HEIST.onlyLars);
  if(heist.lightsOutT>0)return flashPrompt(HEIST.lightsAlreadyOut);
  heist.lightsOutT=LIGHTS_OUT_MS; sfx('chunk'); say([['Lars',HEIST.fuseDone],['John',HEIST.lightsOutCall]]);
}
function lightsTick(dt){
  if(heistStage()!==1)return;
  if(gateOpen()&&heist.crew.every(c=>c.x>ROOF_C.x+2)){ heist.lightsOutT=0; have.heistStage=2; save(); sfx('fanfare'); return say([['Lars',HEIST.allAcross]],()=>roundWon(2)) }   // everyone made it: the lights stay off
  if(heist.lightsOutT>0){ heist.lightsOutT-=dt; if(heist.lightsOutT<=0){ heist.lightsOutT=0; sfx('bad'); say([['Lars',HEIST.lightsBack]]) } }
}
// the gate on the plank is locked; the key hangs under the parked spotlight (no one mentions it: you find out at the gate)
function grabKey(){ heist.keyHolder=lead().id; sfx('pickup'); flashPrompt(HEIST.gotKey) }
function checkGate(){
  const me=lead().id, name=HEIST.crew[me];
  if(heist.keyHolder===me){ have.plankGate=true; heist.keyHolder=null; save(); sfx('chunk'); return say([[name,HEIST.gateUnlocked]]) }
  if(heist.keyHolder)return say([[name,HEIST.gateHasKey.replace('{who}',HEIST.crew[heist.keyHolder])]]);
  say([[name,HEIST.gateLocked]]);
}
function drawKey(){
  if(gateOpen()||heist.keyHolder)return; const F=(c,x,y,w,h)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h)}, x=KEY_SPOT.x-3, y=KEY_SPOT.y-4;
  if(lightsOn()){ if(Math.floor(time/700)%5===0)F('#fff3a8',x+2,y+1,1,1); return }   // hidden in the glare: just a glint now and then
  F('#5a3a22',x+2,y-3,1,3); F('#e0b030',x,y,3,3); F('#1d2130',x+1,y+1,1,1); F('#e0b030',x+3,y+1,4,1); F('#e0b030',x+5,y+2,1,1); F('#e0b030',x+6,y+2,1,1);   // hook + key
  if(Math.floor(time/250)%3===0){F('#fff3a8',x+8,y-2,1,3); F('#fff3a8',x+7,y-1,3,1)} }
function drawHeldKey(c){ if(heist.keyHolder!==c.id)return; const x=Math.round(c.x)+5, y=Math.round(c.y)-9; ctx.fillStyle='#e0b030'; ctx.fillRect(x,y,2,2); ctx.fillRect(x+2,y+1,2,1) }
function drawGate(){ const F=(c,x,y,w,h)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h)};
  if(gateOpen()){F('#5f6676',PLANK_BC.x+2,PLANK_BC.y+PLANK_BC.h,12,3); F('#8b93a3',PLANK_BC.x+2,PLANK_BC.y+PLANK_BC.h,12,1); return}   // lifted off, lying by the plank
  const g=PLANK_GATE; F('rgba(0,0,0,.35)',g.x+1,g.y+g.h,g.w+1,2); F('#8b93a3',g.x,g.y-6,g.w,g.h+6); F('#5f6676',g.x+1,g.y-6,1,g.h+6);
  for(let y=g.y-4;y<g.y+g.h;y+=4)F('#c9ced4',g.x,y,g.w,1);
  F('#e0b030',g.x-2,g.y+5,5,4); F('#8a6a1a',g.x-1,g.y+7,3,1); F('#c9ced4',g.x-1,g.y+3,3,2) }   // a big padlock
// the laser panel: Joe holds A to defuse it (Dr. Alex's defuser); let go past halfway and it keeps half
function startDefuse(){
  if(lead().id!=='hero')return flashPrompt(HEIST.onlyJoe);
  heist.defuse=heist.defuse||{p:0,beep:0}; heist.defusing=true;
}
function defuseTick(dt){
  const d=heist.defuse; if(!d||!heist.defusing)return;
  const moving=dirs.up||dirs.down||dirs.left||dirs.right;
  if(actionHeld&&!moving){
    d.p+=dt/DEFUSE_MS; d.beep-=dt; if(d.beep<=0){sfx('blip'); d.beep=480-380*Math.min(1,d.p)}
    if(d.p>=1){heist.defuse=null; heist.defusing=false; lasersOffNow()}
  } else { heist.defusing=false; if(d.p>=.5){d.p=.5; flashPrompt(HEIST.defuseHalf)} else {d.p=0; flashPrompt(HEIST.defuseHold)} }
}
function drawDefuse(){ const d=heist.defuse; if(!d)return; const x=Math.round(P.x)-13, y=Math.round(P.y)-32, F=(c,a,b,w,h)=>{ctx.fillStyle=c;ctx.fillRect(a,b,w,h)};
  F('#0b0c12',x-1,y-1,28,5); F('#2a2f3e',x,y,26,3); F(d.p>=.5?'#3fbf5a':'#e8b453',x,y,Math.round(26*Math.min(1,d.p)),3); F('#ffffff',x+13,y-1,1,5) }
function lasersOffNow(){ have.lasersOff=true; save(); sfx('chunk'); say([[HEIST.crew.hero,HEIST.lasersDone],['Lars',HEIST.defuseCall]]) }
function drawLaserPanel(){ const p=LASER_PANEL, F=(c,x,y,w,h)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h)}, off=lasersOff();
  F('rgba(0,0,0,.4)',p.x+1,p.y+p.h,p.w,2); F('#5f6676',p.x,p.y,p.w,p.h); F('#8b93a3',p.x,p.y,p.w,1);
  F('#1d2130',p.x+2,p.y+2,8,4); F(off?'#3fbf5a':(Math.floor(time/300)%2?'#ff3b4a':'#8a1f28'),p.x+3,p.y+3,2,2); F(off?'#2a3a2a':'#c9ced4',p.x+7,p.y+3,2,2) }
const stacked=()=>crewPositions().filter(c=>hit(R(c.x-4,c.y-3,8,4),STACK)).length;
function ripGrate(){
  if(lead().id!=='john')return flashPrompt(HEIST.onlyJohn);
  const n=stacked(); if(n<3)return say([['John',HEIST.stackUp.replace('{n}',n)]]);
  have.heistStage=3; save(); sfx('thud'); say([['John',HEIST.breach],['John',HEIST.grateDone]],()=>roundWon(3));
}
// round banners: ROUND 1 / 2 / 3 when you get there, ROUND WON when you clear one
const banner={q:[],t:0};
function showBanner(title,sub){ banner.q.push([title,sub||'']); if(banner.t<=0)nextBanner() }
function nextBanner(){ const b=banner.q.shift(); if(!b){$('roundBanner').hidden=true; return}
  $('roundTitle').textContent=b[0]; $('roundSub').textContent=b[1]; const el=$('roundBanner'); el.hidden=true; void el.offsetWidth; el.hidden=false; banner.t=1900; sfx('blip') }
function bannerTick(dt){ if(banner.t>0){banner.t-=dt; if(banner.t<=0)nextBanner()} }
function roundStart(n){ const r=HEIST.rounds[n-1]; if(r)showBanner(r.title,r.name) }
function roundWon(n){ showBanner(HEIST.roundWon,HEIST.rounds[n-1].name); if(n<3)roundStart(n+1) }

// ---------- the vault: three crates and a puzzle (VAULT_PUZZLES in story.js) ----------
const vault={open:false, puzzle:null, order:[], choc:0};
const CRATE_POS=['the left crate','the middle crate','the right crate'];
function openVault(){
  // a different puzzle than last time, shuffled crates
  const pool=VAULT_PUZZLES.filter(p=>p!==vault.puzzle); vault.puzzle=pool[Math.floor(Math.random()*pool.length)];
  vault.order=['X','Y','Z'].sort(()=>Math.random()-.5); vault.choc=vault.order.indexOf(vault.puzzle.answer); vault.open=true;
  const name=k=>CRATE_POS[vault.order.indexOf(k)], fill=t=>{const f=t.replace(/\{([XYZ])\}/g,(_,k)=>name(k)); return f[0].toUpperCase()+f.slice(1)};
  $('vaultTitle').textContent=HEIST.vaultTitle; $('vaultNote').textContent=HEIST.vaultNote; $('vaultRule').textContent=vault.puzzle.rule;
  vault.order.forEach((k,i)=>{ $('crateLabel'+i).textContent=fill(vault.puzzle.labels[k]) });
  $('vaultHint').textContent=HEIST.vaultHint; $('vaultHint').hidden=false; $('vaultHintText').hidden=true; $('vaultHintText').textContent=vault.puzzle.hint;
  drawCrates(); paused=true; prompt.hidden=true; $('vault').hidden=false; setTimeout(()=>$('crate0').focus({preventScroll:true}),0);
}
function drawCrates(){
  [0,1,2].forEach(i=>{const c=$('crateArt'+i), g=c.getContext('2d'), F=(col,x,y,w,h)=>{g.fillStyle=col;g.fillRect(x,y,w,h)};
    g.clearRect(0,0,c.width,c.height);
    F('#8a5a34',2,6,28,22); F('#a26c40',2,6,28,3); F('#6a4224',2,16,28,2); F('#6a4224',2,6,2,22); F('#6a4224',28,6,2,22);
    F('#efe2c4',11,10,10,5); F('#6a4224',12,12,8,1);   // stenciled label
  });
}
function vaultHint(){ $('vaultHint').hidden=true; $('vaultHintText').hidden=false }
function pickCrate(i){
  if(!vault.open)return;
  if(i!==vault.choc){ sfx('bad'); $('vault').hidden=true; say(HEIST.raisins,()=>{ $('vault').hidden=false; paused=true }); return }
  vault.open=false; $('vault').hidden=true; have.heistStage=4; save(); sfx('fanfare');
  say([['',HEIST.gotIt],['',HEIST.villainNote],...HEIST.finale,...HEIST.larsChallenge],()=>openLarsMenu());
}
$('vaultHint').onclick=vaultHint; [0,1,2].forEach(i=>$('crate'+i).onclick=()=>pickCrate(i));

// ---------- triggers ----------
const nearCrew=(z,id)=>heist.crew.some(c=>(!id||c.id===id)&&hit(R(c.x-4,c.y-3,8,4),z));
function heistTrigger(){
  const feet=R(P.x-4,P.y-3,8,4), st=heistStage();
  if(Math.hypot(P.x-STRANGER.x,P.y-STRANGER.y)<16)return {label:'Talk to '+HEIST.stranger, btn:'Talk', act:()=>{
    if(have.city)return say([[HEIST.stranger,HEIST.after]]);
    if(st>=5)return showReward('city');
    if(st===4)return say([[HEIST.stranger,HEIST.strangerRematch],...HEIST.larsChallenge.slice(1,2)],()=>openLarsMenu());
    if(!have.heistBriefed)return briefing();
    say([[HEIST.stranger,HEIST.strangerAgain]])}};
  if(st<1&&hit(feet,LOG_DROP))return {label:HEIST.gapLabel, act:gapChoice};
  if(st<1&&!heist.carry&&hit(feet,R(LOOSE_BEAM.x-10,LOOSE_BEAM.y-6,LOOSE_BEAM.w+20,LOOSE_BEAM.h+12)))return {label:'Look at the log', act:beamChoice};
  if(st===1&&hit(feet,R(FUSE.x-14,FUSE.y-14,28,28)))return {label:heist.lightsOutT>0?HEIST.lightsAlreadyOut:HEIST.fuse, act:cutFuse};
  if(!gateOpen()&&hit(feet,R(PLANK_GATE.x-12,PLANK_GATE.y-2,PLANK_GATE.w+24,PLANK_GATE.h+4)))return {label:heist.keyHolder===lead().id?HEIST.gateUnlock:HEIST.gateCheck, act:checkGate};
  if(st===1&&!gateOpen()&&!heist.keyHolder&&!lightsOn()&&Math.hypot(P.x-KEY_SPOT.x,P.y-KEY_SPOT.y)<12)return {label:HEIST.grabKey, act:grabKey};
  if(st>=2&&st<4&&!lasersOff()&&hit(feet,R(LASER_PANEL.x-4,LASER_PANEL.y,LASER_PANEL.w+6,16)))return {label:heist.defuse?HEIST.defuseKeep:HEIST.defuseLabel, btn:'Hold', act:startDefuse};
  if(st===2&&hit(feet,R(SKYLIGHT.x-4,SKYLIGHT.y+SKYLIGHT.h,SKYLIGHT.w+8,12)))return {label:HEIST.grate+' ('+stacked()+'/3 stacked)', act:ripGrate};
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
SCENES.city={ music:'heist',
  w:CW, h:CH, bounds:R(0,0,CW,CH), bg:cityBg, triggers:[],
  get walk(){ return [ROOF_A,ROOF_B,ROOF_C,PLANK_BC,LADDER,...(heistStage()>=1?[BEAM_SLOT]:[])] },
  get solids(){ return [TANK,VENTS,LAB.bench,LAB.coil,...COVERS,R(FUSE.x-14,FUSE.y-20,28,6),SKYLIGHT,LASER_PANEL,R(STRANGER.x-4,STRANGER.y-3,8,4),
    ...(heistStage()<1&&!heist.carry?[LOOSE_BEAM]:[]),...(gateOpen()?[]:[PLANK_GATE])] },
  entries:{start:{x:40,y:156,dir:'up'}, fromStreet:{x:40,y:156,dir:'up'}},
  enter(){
    heist.lead=0; heist.follow=true; heist.hinted={}; heist.keyHolder=null; heist.sonarT=0; heist.sprintT=0; heist.marked=false;
    placeAtCheckpoint(); $('crewbar').hidden=false; buildCrewBar(); banner.q=[]; banner.t=0; $('roundBanner').hidden=true;
    if(heistStage()<3)roundStart(heistStage()+1);   // (Dr. Alex waits at her lab bench: walk up to her for the briefing)
  },
  leave(){ $('crewbar').hidden=true; banner.q=[]; banner.t=0; $('roundBanner').hidden=true },
  speed:()=>heist.sprintT>0?.19:(lead().id==='lars'?.09:lead().id==='john'&&heist.carry?.06:.07),
  dynTrigger:()=>heistTrigger(),
  ability:()=>useSkill(),
  key(code){ const i={Digit1:0,Digit2:1,Digit3:2}[code]; if(i!=null){switchTo(i);return true} if(code==='KeyF'){toggleFollow();return true} return false },
  abilityLabel:()=>HEIST.skills[lead().id],
  ambient(dt){
    anaTick(dt); jumpTick(dt); bannerTick(dt); if(heist.annoyT>0&&!heist.jump)heist.annoyT-=dt; if(heist.dazeT>0)heist.dazeT-=dt;
    for(const r of cityRain){r.y+=dt*.32;r.x-=dt*.08;if(r.y>CH){r.y=-4;r.x=Math.random()*(CW+40)}}
    for(const c of cars){c.y+=c.v*dt; if(c.y>CH+6)c.y=-6; if(c.y<-6)c.y=CH+6}
    nextFlash-=dt; if(nextFlash<=0){flashT=140; nextFlash=8000+Math.random()*9000} if(flashT>0)flashT-=dt;
    for(const k of ['sonarT','sonarCd','sprintT','sprintCd','flashT','promptT'])if(heist[k]>0)heist[k]-=dt;
    if(heist.promptT<=0&&heist.promptT>-999){heist.promptT=-999; if(near)prompt.textContent=near.label; else prompt.hidden=true}
  },
  update(dt){
    if(heist.outfitReact){heist.outfitReact=false; const r=WARDROBE.react[have.outfit]; if(r)return say(r)}
    if(heistStage()>=4)return;
    // guard patrol: walks up and down, pauses at each end (flashlight off while he turns)
    if(heist.guardWait>0)heist.guardWait-=dt;
    else{heist.guardY+=heist.guardDir*GUARD.speed*dt;
      if(heist.guardY>GUARD.y1){heist.guardY=GUARD.y1;heist.guardDir=-1;heist.guardWait=900}
      if(heist.guardY<GUARD.y0){heist.guardY=GUARD.y0;heist.guardDir=1;heist.guardWait=900}}
    moveFollowers(dt); lightsTick(dt); if(!dlg.hidden)return; defuseTick(dt);
    const hz=checkHazards(); if(hz)return caught(hz);
    // a few one-time hints as you reach each part
    const st=heistStage();
    if(st<1&&!heist.carry&&P.y<146)hintOnce('log','John',HEIST.johnLog);
    else if(!have.heistBriefed&&heist.carry&&P.y<108)hintOnce('who','John',HEIST.whoIsThat);
    else if(st<1&&have.heistBriefed&&heist.carry&&P.x>70&&P.y<110)hintOnce('gap','John',HEIST.johnGap);
    else if(st===1&&P.x>160)hintOnce('lights','Lars',HEIST.larsLights);
    else if(st>=2&&st<3&&P.x>356)hintOnce('lasers',HEIST.crew.hero,HEIST.heroLasers);
  },
  drawPlayer:(x,y)=>{syncLeadFromP(); crewSprite(lead()); drawCarriedLog(lead()); drawHeldKey(lead())},
  under(){
    for(const c of cars){const x=c.x+(c.lane?18:6); ctx.fillStyle=c.v>0?'#ffe9a0':'#ff4a3a'; ctx.fillRect(x,c.y|0,1,1); ctx.fillRect(x+3,c.y|0,1,1)}
    drawBeam(); drawGate(); drawKey(); drawGrate(); drawPowerSwitch(); drawLaserPanel();
  },
  ents(list){
    heist.crew.forEach((c,i)=>{if(i!==heist.lead)list.push({y:c.y,draw:()=>{crewSprite(c); drawCarriedLog(c); drawHeldKey(c)}})});
    list.push({y:STRANGER.y,draw:drawStranger});
    if(heistStage()<4)list.push({y:heist.guardY,draw:drawGuard});
  },
  over(){ drawJumpEmotes(); drawDefuse();
    const st=heistStage();
    // shadows behind the cover on roof B (where the lights can't see you)
    if(lightsOn())for(const o of COVERS){const z=coverZone(o); ctx.fillStyle='rgba(0,0,10,.28)'; ctx.fillRect(z.x,z.y,z.w,z.h)}
    // searchlights: a beam from each lamp on the roof edge down to a bright spot
    if(lightsOn())for(const L of LIGHTS){const l=lightPos(L), lx=L.kind==='orbit'?L.cx:L.x, ly=ROOF_B.y-5;
      ctx.fillStyle='rgba(255,244,190,.10)'; ctx.beginPath(); ctx.moveTo(lx-2,ly); ctx.lineTo(l.x-LIGHT_R,l.y); ctx.lineTo(l.x+LIGHT_R,l.y); ctx.lineTo(lx+2,ly); ctx.fill();
      const gr=ctx.createRadialGradient(l.x,l.y,2,l.x,l.y,LIGHT_R+2); gr.addColorStop(0,'rgba(255,248,210,.6)'); gr.addColorStop(.75,'rgba(255,244,190,.32)'); gr.addColorStop(1,'rgba(255,244,190,0)');
      ctx.fillStyle=gr; ctx.beginPath(); ctx.ellipse(l.x,l.y,LIGHT_R+2,LIGHT_R+2,0,0,Math.PI*2); ctx.fill()}
    // guard flashlight cone
    if(st<4&&heist.guardWait<=0){const gy=heist.guardY-6, d=heist.guardDir; ctx.fillStyle='rgba(255,236,150,.22)'; ctx.beginPath(); ctx.moveTo(GUARD.x,gy);
      ctx.lineTo(GUARD.x-31,gy+62*d); ctx.lineTo(GUARD.x+31,gy+62*d); ctx.fill()}
    // lasers: the visible ones always (with a flicker warning before the blinking row comes back on); the invisible ones only with sonar (then chalk-marked)
    const reveal=heist.sonarT>0?Math.min(1,heist.sonarT/600):0;
    if(st<4&&!lasersOff()){
      for(const [x1,y1,x2,y2,vis] of laserSegs()){
        if(vis){ctx.fillStyle='rgba(255,40,60,.25)'; ctx.fillRect(Math.min(x1,x2),y1-1,Math.abs(x2-x1),3); ctx.fillStyle='#ff3b4a'; ctx.fillRect(Math.min(x1,x2),y1,Math.abs(x2-x1),1)}
        else if(reveal){ctx.fillStyle=`rgba(255,60,70,${.85*reveal})`; if(x1===x2)ctx.fillRect(x1,Math.min(y1,y2),1,Math.abs(y2-y1)); else ctx.fillRect(Math.min(x1,x2),y1,Math.abs(x2-x1),1)}
        else if(heist.marked){ctx.fillStyle='rgba(255,255,255,.45)'; if(x1===x2){for(let y=Math.min(y1,y2);y<Math.max(y1,y2);y+=4)ctx.fillRect(x1,y,1,2)} else for(let x=Math.min(x1,x2);x<Math.max(x1,x2);x+=4)ctx.fillRect(x,y1,2,1)}}   // chalk marks
      const ph=time%BLINK.period; if(ph>BLINK.period-BLINK.warn&&Math.floor(time/60)%2){ctx.fillStyle='rgba(255,60,70,.5)'; ctx.fillRect(BLINK.x1,BLINK.y,BLINK.x2-BLINK.x1,1)}}
    // rain + darkness with light around the crew
    ctx.fillStyle='rgba(170,190,230,.45)'; for(const r of cityRain)ctx.fillRect(r.x|0,r.y|0,1,3);
    const m=darkMask.getContext('2d'), tf=ctx.getTransform(), cx=-tf.e, cy=-tf.f;
    m.globalCompositeOperation='source-over'; m.clearRect(0,0,VW,VH);
    m.fillStyle=`rgba(4,5,14,${st>=4?.35:.62-reveal*.3})`; m.fillRect(0,0,VW,VH);
    m.globalCompositeOperation='destination-out';
    const hole=(x,y,r)=>{const gr=m.createRadialGradient(x-cx,y-cy,2,x-cx,y-cy,r); gr.addColorStop(0,'rgba(0,0,0,1)'); gr.addColorStop(1,'rgba(0,0,0,0)'); m.fillStyle=gr; m.fillRect(x-cx-r,y-cy-r,r*2,r*2)};
    for(const c of crewPositions())hole(c.x,c.y-8,34);
    if(lightsOn())for(const L of LIGHTS){const l=lightPos(L); hole(l.x,l.y,24)}
    if(st<4)hole(GUARD.x,heist.guardY-6,26);
    hole(STRANGER.x,STRANGER.y-8,24); hole(LAB.bench.x+16,LAB.bench.y,22);   // Dr. Alex's lab glows
    if(st<4&&!lasersOff()){hole((BLINK.x1+BLINK.x2)/2,BLINK.y,22); hole(sliderGap(time)+8,SLIDER.y,20)}
    hole(LASER_PANEL.x+6,LASER_PANEL.y+4,14);
    hole(436,30,26); hole(476,30,26);   // under the neon sign
    ctx.drawImage(darkMask,cx,cy);
    // the old CANDY WORKS neon sign on roof C (one letter keeps flickering), and sparks off Dr. Alex's tesla coil
    {const flick=Math.floor(time/90)%23===0; ctx.fillStyle='rgba(255,90,180,.18)'; ctx.fillRect(404,24,104,13);
      const t='CANDY WORKS'; let x=410; for(let k=0;k<t.length;k++){const ch=t[k]; if(!(k===6&&flick))pixText(ctx,ch,x,28,'#ff7ad1'); x+=ch===' '?4:(GLYPH[ch]?GLYPH[ch].length/5:3)+1}}
    if(Math.floor(time/120)%5<2){const c=LAB.coil; ctx.fillStyle='#bfefff'; let x=c.x+3, y=c.y-4; for(let k=0;k<5;k++){x+=Math.round(Math.sin(time/30+k*2)*2); y-=2; ctx.fillRect(x,y,1,2)}}
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
  hud(){ const st=heistStage(); const steps=['Bridge the gap','Kill the lights, get everyone across','Defuse the lasers, stack up on the skylight','Crack the vault','Beat Lars at anagrams','Done!'];
    if(st===1&&heist.lightsOutT>0)return `<span>Lights back in 0:${String(Math.ceil(heist.lightsOutT/1000)).padStart(2,'0')}</span>`;
    return st>=5||have.city?'':`<span>${steps[st]}</span>` },
};
