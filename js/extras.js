// Small things that work across the whole game:
//  - exits: walk into one and you leave (no button), with a bouncing EXIT arrow so you can see where it is
//  - the "you can do something here" arrow over Joe's head
//  - Joe's gear (Oakleys, a headband, carbon running shoes) hidden around the map, worn once found
//  - a sign in front of each land on the main map
// Text for the gear is in story.js (GEAR_TEXT).

// ---------- exits ----------
// z: walk into this box to leave. mark: where the arrow goes, pointing dir. when: only while this is true.
const EXITS={
  kitchen:[{z:R(100,160,24,8), mark:{x:112,y:158,dir:'down'}, go:()=>goTo('world','fromKitchen')}],
  golf:   [{z:R(96,160,32,8),  mark:{x:112,y:160,dir:'down'}, when:()=>!golf.active, go:()=>goTo('world','fromGolf')}],
  fargo:  [{z:R(0,166,6,28),   mark:{x:6,y:179,dir:'left'},  when:()=>!fargo.onFoot, go:()=>goTo('world','fromFargo')}],
  city:   [{z:LADDER,          mark:{x:21,y:170,dir:'down'}, go:()=>goTo('world','fromCity')}],
};
let exitArmed=false;   // you have to step out of an exit before it works (so arriving next to one doesn't bounce you out)
const sceneName=()=>Object.keys(SCENES).find(k=>SCENES[k]===scene);
const exitsHere=()=>(scene===SCENES.kitchen&&(kit.taste||kit.hugging))?[]:(EXITS[sceneName()]||[]).filter(e=>!e.when||e.when());   // (no EXIT arrow in the middle of the taste test)
function sceneExitTick(){
  const feet=scene.feet?scene.feet(P.x,P.y):R(P.x-4,P.y-3,8,4), e=exitsHere().find(e=>hit(feet,e.z));
  if(!e){exitArmed=true; return}
  if(exitArmed&&!paused&&!fade.next){exitArmed=false; sfx('whoosh'); e.go()}
}
function drawExitMark(m){
  const bob=Math.round(Math.sin(time/180)*2), F=(c,x,y,w,h)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h)};
  const ax=m.dir==='left'?m.x+bob:m.x, ay=m.dir==='down'?m.y+bob:m.y;
  // the arrow: a gold triangle with a dark outline
  if(m.dir==='down'){for(let i=0;i<5;i++){F('#1d2130',ax-5+i,ay-3+i,11-i*2,1)} for(let i=0;i<4;i++)F('#f4d35e',ax-4+i,ay-3+i,9-i*2,1); F('#1d2130',ax-2,ay-8,5,5); F('#f4d35e',ax-1,ay-8,3,5)}
  else {for(let i=0;i<5;i++){F('#1d2130',ax+i,ay-4+i,1,9-i*2)} for(let i=0;i<4;i++)F('#f4d35e',ax+1+i,ay-3+i,1,7-i*2); F('#1d2130',ax+5,ay-2,6,5); F('#f4d35e',ax+5,ay-1,5,3)}
  const lx=m.dir==='left'?m.x+2:m.x+8, ly=m.dir==='left'?m.y-14:m.y-8;
  F('#1d2130',lx-1,ly-1,textW('EXIT')+3,7); pixText(ctx,'EXIT',lx+1-1+1,ly+1-1+1-1,'#f4d35e');
}
// the bouncing arrow over Joe's head when there's something to do right here
function drawNearMark(){
  if(!near||paused||fade.next||scene===SCENES.birkie)return;
  const x=Math.round(P.x), y=Math.round(P.y)-(have.crown?33:28)+Math.round(Math.sin(time/150)*2), F=(c,dx,dy,w,h)=>{ctx.fillStyle=c;ctx.fillRect(x+dx,y+dy,w,h)};
  F('#1d2130',-4,-1,9,1); F('#1d2130',-4,0,1,1); F('#1d2130',4,0,1,1);
  for(let i=0;i<4;i++){F('#1d2130',-4+i,i,1,1); F('#1d2130',4-i,i,1,1); F('#f4d35e',-3+i,i,7-i*2,1)}
  F('#1d2130',0,4,1,1);
}

// ---------- Joe's gear ----------
// where each one is hidden on the main map (feet position)
const GEAR={
  oakleys: {x:40, y:237},    // on the beach in Vancouver
  headband:{x:366,y:86},     // in the snow by the Birkie yurt
  shoes:   {x:228,y:232},    // out past the Fargo gas station
  clover:  {give:true},      // Logan gives Joe this one (people.js)
  // keepsakes: one from each stop, handed over right after that stop's reward (KEEPSAKES in story.js)
  hen:     {give:true, from:'farm'},     // Grp ("G"), Joe's rooster: follows him everywhere
  goggles: {give:true, from:'city'},     // Dr. Alex's spare goggles, pushed up on his head
  disc:    {give:true, from:'golf'},     // Margie's "lucky" disc, on his back
  hat:     {give:true, from:'fargo'},    // a Lil Q's Gas & Go trucker hat
  jersey:  {give:true, from:'mill'},     // a purple #18 Vikings jersey, from a football Viking after the Birkie
};
// after a stop's reward lands in the basket: that stop's keepsake scene (once), then carry on
function giveKeepsake(key,then){
  const k=Object.keys(GEAR).find(g=>GEAR[g].from===key); if(!k||(have.gear&&k in have.gear))return then&&then();
  const lines=KEEPSAKES[k], T=GEAR_TEXT[k];
  const place={farm:KEELAN.place,city:HEIST.place,golf:GOLF_TEXT.place,fargo:FARGO.place,mill:BIRKIE.place}[key]||'';
  let i=0; const next=()=>{ if(i<lines.length){const [sp,tx,face]=lines[i++]; return showDialog({place,speaker:sp,face,pages:[tx],actions:[{label:'Next',fn:next}]})} closeDialog(); gotIt() };
  next();
  function gotIt(){ have.gear=have.gear||{}; have.gear[k]=1; save(); sfx('pickup');
    showDialog({place:GEAR_TEXT.place,speaker:'',pages:[T.found,GEAR_TEXT.tip],actions:[{label:T.wear,fn:()=>{closeDialog(); then&&then()}}]}) }
}
const gearWorn=k=>have.gear&&have.gear[k]===1;
function gearTick(){
  if(scene!==SCENES.world)return;
  for(const k in GEAR){ const g=GEAR[k]; if(g.give||(have.gear&&k in have.gear))continue;
    if(Math.hypot(P.x-g.x,P.y-g.y)<8){ have.gear=have.gear||{}; have.gear[k]=1; save(); sfx('pickup');
      const T=GEAR_TEXT[k]; showDialog({place:GEAR_TEXT.place,speaker:'',pages:[T.found,GEAR_TEXT.tip],actions:[{label:T.wear,fn:closeDialog}]}); return } }
}
function drawGearItem(k,x,y){
  const F=(c,dx,dy,w,h)=>{ctx.fillStyle=c;ctx.fillRect(x+dx,y+dy,w,h)};
  F('rgba(0,0,0,.2)',-4,1,9,1);
  if(k==='oakleys'){F('#1d1d22',-4,-2,9,1); F('#1d1d22',-4,-1,1,1); F('#1d1d22',4,-1,1,1); F('#e0603a',-3,-1,3,2); F('#7a4fa0',1,-1,3,2); F('#ffd0a0',-3,-1,1,1)}
  if(k==='headband'){F('#2fb3a0',-3,-3,7,1); F('#2fb3a0',-4,-2,1,2); F('#2fb3a0',4,-2,1,2); F('#2fb3a0',-3,0,7,1); F('#ffffff',-1,-3,3,1)}
  if(k==='shoes'){F('#ff5a1f',-5,-2,4,2); F('#ffffff',-5,0,5,1); F('#ff5a1f',1,-2,4,2); F('#ffffff',1,0,5,1); F('#1d1d22',-4,-2,1,1); F('#1d1d22',2,-2,1,1); F('#f4d35e',-2,-1,1,1); F('#f4d35e',4,-1,1,1)}
  if((time+x*37)%2400<380){ctx.fillStyle='#fff3a8'; ctx.fillRect(x+5,y-8,1,5); ctx.fillRect(x+3,y-6,5,1); ctx.fillStyle='#ffffff'; ctx.fillRect(x+5,y-6,1,1)}   // a glint
}
// drawn on top of whatever Joe is wearing. c: {x,y,dir,moving,step}; look: the outfit (null for the jersey)
function drawGear(c,g=ctx,look=null){
  if(!have.gear)return; const x=Math.round(c.x)-6, y=Math.round(c.y)-20, F=(col,dx,dy,w,h)=>{g.fillStyle=col;g.fillRect(x+dx,y+dy,w,h)};
  const head=look?look.head:'hair', a=c.moving&&c.step%2?1:0, b=c.moving&&!(c.step%2)?1:0;
  if(gearWorn('jersey')){ const P='#4f2683', PD='#3d1d66', GO='#ffc62f', W='#ffffff';      // a purple #18 Vikings jersey: white/gold sleeve stripes, numbers front and back
    F(P,2,7,8,7); F(PD,2,13,8,1); F(P,1,7,1,3); F(P,10,7,1,3); F(W,1,8,1,1); F(W,10,8,1,1); F(GO,1,9,1,1); F(GO,10,9,1,1);
    if(c.dir==='down'||c.dir==='up'){ if(c.dir==='down'){F(W,5,7,2,1)}                    // white collar trim
      F(W,3,8,1,5); F(W,5,8,3,1); F(W,5,10,3,1); F(W,5,12,3,1); F(W,5,9,1,1); F(W,7,9,1,1); F(W,5,11,1,1); F(W,7,11,1,1);   // 1 8
      F(GO,4,8,1,1); F(GO,8,12,1,1) }                                                      // gold outline flecks, like the real trim
    else { const sx=c.dir==='left'?4:5; F(W,sx,8,3,1); F(W,sx,12,3,1); F(W,sx,10,3,1); F(W,sx,9,1,1); F(W,sx+2,9,1,1); F(W,sx,11,1,1); F(W,sx+2,11,1,1) } }   // side-on: the 8 on the sleeve-side
  if(gearWorn('disc')){ if(c.dir==='up'){F('#f4d35e',3,7,6,6); F('#f4d35e',2,8,8,4); F('#e0b030',4,9,4,2); F('#ffe98a',4,7,3,1); F('#c9902a',5,9,2,2)}   // Margie's lucky disc, on his back
    else if(c.dir==='left'){F('#f4d35e',11,8,1,4); F('#e0b030',12,9,1,2)} else if(c.dir==='right'){F('#f4d35e',0,8,1,4); F('#e0b030',-1,9,1,2)} }   // (side-on: just its rim)
  if(gearWorn('clover')&&c.dir!=='up'){ const tw=Math.floor(time/250)%3===0;               // the lucky clover pin, with a gold glint
    if(gearWorn('jersey')){ const px=c.dir==='left'?9:0; F('#1d5a2a',px,5,3,3); F('#5fd36a',px,5,1,1); F('#5fd36a',px+2,5,1,1); F('#5fd36a',px,7,1,1); F('#5fd36a',px+2,7,1,1); F('#9ff0a8',px,5,1,1); if(tw)F('#fff3a8',px+3,4,1,1) }   // small, on the shoulder, so the 18 shows
    else { const px=c.dir==='left'?3:7; F('#1d5a2a',px-1,7,5,5); F('#5fd36a',px,7,1,1); F('#5fd36a',px+2,7,1,1); F('#5fd36a',px,9,1,1); F('#5fd36a',px+2,9,1,1); F('#3fbf55',px+1,8,1,1); F('#9ff0a8',px,7,1,1); F('#2e8a3e',px+1,10,1,2); if(tw)F('#fff3a8',px+3,6,1,1) } }
  if(gearWorn('shoes')){F('#ff5a1f',2,19-a,3,1); F('#ff5a1f',7,19-b,3,1); F('#f4d35e',4,19-a,1,1); F('#f4d35e',9,19-b,1,1)}   // bright carbon racers
  const bare=head==='hair'||!look;
  if(gearWorn('headband')&&bare&&!gearWorn('hat')){F('#2fb3a0',2,1,8,1); if(c.dir==='down')F('#ffffff',5,1,2,1)}
  const hat=gearWorn('hat')&&bare;
  if(hat){ F('#c8322b',2,-1,8,3); F('#ffffff',3,-1,6,2); F('#e9e2d2',2,1,8,1);            // trucker hat: white foam front, red mesh back
    if(c.dir==='down')F('#c8322b',2,2,8,1); else if(c.dir==='left')F('#c8322b',0,2,4,1); else if(c.dir==='right')F('#c8322b',8,2,4,1); else F('#e9e2d2',3,-1,6,2) }
  if(gearWorn('goggles')&&bare&&c.dir!=='up'){                                             // Dr. Alex's goggles: up on his forehead, or round his neck under the hat
    const gy=hat?6:0; F('#2b2b2b',2,gy,8,1);
    const lh=hat?1:2; if(c.dir==='down'){F('#7fd3ff',3,gy,2,lh); F('#7fd3ff',7,gy,2,lh); F('#d6f2ff',3,gy,1,1)} else F('#7fd3ff',c.dir==='left'?3:7,gy,2,lh) }
  if(gearWorn('oakleys')&&head!=='potato'){
    if(c.dir==='down'){F('#1d1d22',2,4,8,1); F('#e0603a',3,4,2,1); F('#7a4fa0',7,4,2,1); F('#ffd0a0',3,4,1,1)}
    else if(c.dir==='left'){F('#1d1d22',2,4,5,1); F('#e0603a',2,4,2,1)}
    else if(c.dir==='right'){F('#1d1d22',5,4,5,1); F('#7a4fa0',8,4,2,1)}
    else F('#1d1d22',2,4,8,1);   // the strap round the back
  }
}

// ---------- a clear sign in front of each land ----------
// wooden boards on two posts: [text, x, y] (top-left of the board). Fargo has its own blue road sign below.
const LAND_SIGNS=[['THE FARM',58,132],['VANCOUVER',104,166]];
{const g=bg.getContext('2d'), F=(c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};
  for(const [t,x,y] of LAND_SIGNS){const w=textW(t)+8;
    F('rgba(0,0,0,.25)',x+2,y+16,w-2,2); F('#5a3a22',x+3,y+9,2,8); F('#5a3a22',x+w-5,y+9,2,8);
    F('#5a3a22',x,y,w,11); F('#f2e6c8',x+1,y+1,w-2,9); F('#d9c9a2',x+1,y+9,w-2,1); pixText(g,t,x+4,y+3,'#3b2a1e');
    solids.push(R(x+3,y+14,2,3),R(x+w-5,y+14,2,3))}}
// the welcome-to-Fargo sign on the main map
solids.push(R(226,183,2,3),R(242,183,2,3));
{const g=bg.getContext('2d'), F=(c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};
  F('#8a8f9a',226,180,2,6); F('#8a8f9a',242,180,2,6); F('#2f5f9e',224,170,22,11); F('#ffffff',224,170,22,1); pixText(g,'FARGO',226,173,'#ffffff')}

// hook into the main map
{const ents=SCENES.world.ents;
  SCENES.world.ents=function(list){ ents.call(this,list);
    for(const k in GEAR)if(!GEAR[k].give&&!(have.gear&&k in have.gear))list.push({y:GEAR[k].y,draw:()=>drawGearItem(k,GEAR[k].x,GEAR[k].y)}) }}

// the lucky clover sheds little green sparkles as Joe walks; Grp the rooster trots along behind him
const sparkles=[], henTrail=[]; let sparkleT=0, henScene=null;
function cloverTick(dt){
  if(gearWorn('clover')&&P.moving&&scene!==SCENES.birkie){ sparkleT-=dt; if(sparkleT<=0){ sparkleT=110; sparkles.push({x:P.x+(Math.random()*8-4),y:P.y-10+(Math.random()*6-3),vx:(Math.random()-.5)*.01,vy:-.012-Math.random()*.01,t:0,c:['#7fe08a','#c9f5a0','#fff3a8'][Math.floor(Math.random()*3)]}) } }
  for(const s of sparkles){s.t+=dt; s.x+=s.vx*dt; s.y+=s.vy*dt} while(sparkles.length&&sparkles[0].t>900)sparkles.shift();
  if(henScene!==scene){henScene=scene; henTrail.length=0}   // a new place: she starts right next to Joe
  if(henHere()){ const last=henTrail[henTrail.length-1]; if(!last||Math.hypot(P.x-last.x,P.y-last.y)>1.5){henTrail.push({x:P.x,y:P.y}); if(henTrail.length>40)henTrail.shift()}
    if(Math.random()<dt/7000)sfx('cluck') } else henTrail.length=0;
}
function henPos(){ if(!henTrail.length)return {x:P.x-10,y:P.y+2}; const k=Math.max(0,henTrail.length-12); return henTrail[k] }
function drawSparkles(){ for(const s of sparkles){ const a=1-s.t/900; ctx.globalAlpha=Math.max(0,a); ctx.fillStyle=s.c; ctx.fillRect(Math.round(s.x),Math.round(s.y),1,1); if(s.t<300){ctx.fillRect(Math.round(s.x)-1,Math.round(s.y),3,1); ctx.fillRect(Math.round(s.x),Math.round(s.y)-1,1,3)} } ctx.globalAlpha=1 }
// Grp ("G" for short: Green Red Poultry) comes everywhere once Keelan gives him to Joe (after the farm), dressed for each place.
// Drawn from Joe's own sketch: red comb and wattle, yellow beak, a white body streaked blue, purple and green, a yellow wing, a big red-brown and dark tail.
const henHere=()=>gearWorn('hen');
function henEnt(){
  if(!henHere())return null;
  if(scene===SCENES.fargo&&!fargo.onFoot){ const d=P.dir==='left'?-1:1; return {y:P.y+1, draw:()=>drawGrp(P.x-1-3*d,P.y+11,d,'fargo',true)} }   // riding shotgun
  const h=henPos(), f=h.x<P.x?1:h.x>P.x?-1:(P.dir==='left'?-1:1), hop=P.moving&&Math.floor(time/150)%2?1:0;
  return {y:h.y, draw:()=>drawGrp(h.x,h.y-hop,f,sceneName())};
}
function drawGrp(x,y,f,where,headOnly){
  x=Math.round(x); y=Math.round(y);
  // P: draw a rect given for facing right; mirrored when he faces left
  const P=(c,dx,dy,w,h)=>{ctx.fillStyle=c; ctx.fillRect(f>0?x+dx:x-dx-w+1,y+dy,w,h)};
  const W='#f4f1ea', WS='#d9d3c8', RED='#d43b2f', BEAK='#e8b04a', LEG='#e0a43a';
  if(!headOnly){
    if(where==='birkie'){P('#2f6db0',-7,1,15,1); P('#2f6db0',8,0,1,1); P('#2f6db0',-8,0,1,1)}                       // tiny skis
    P('rgba(0,0,0,.2)',-5,1,11,1);
    P(LEG,-1,-3,1,3); P(LEG,2,-3,1,3); P(LEG,-2,0,2,1); P(LEG,2,0,3,1);                                               // legs and toes
    // the tail: big sweeping feathers, red-brown with dark blue-green sickles
    P('#b5532f',-7,-10,3,5); P('#c46b4a',-6,-11,2,2); P('#8a3a22',-7,-6,2,1);
    P('#24365e',-9,-14,2,7); P('#2e7d4f',-8,-15,2,3); P('#24365e',-10,-12,1,4); P('#3a8f5f',-6,-13,1,3); P('#5d6fb3',-9,-8,1,2);
    // body
    P(W,-4,-9,8,6); P(WS,-4,-4,8,1); P('#c46b4a',-4,-9,2,2);
    P('#5d6fb3',-3,-7,1,2); P('#7a5ea8',-2,-6,1,2); P('#4fae6a',0,-8,1,2); P('#5d6fb3',3,-6,1,2);                       // the colored streaks
    P('#e8c84a',-1,-7,3,2); P('#3f9a5a',-1,-5,3,1);                                                                   // yellow wing, green edge
    // neck hackles
    P('#efe9df',1,-13,3,5); P('#6b6fb0',1,-12,1,3); P('#8a6fb0',3,-11,1,2);
  }
  // head: comb, eye, beak, wattle
  P(W,2,-16,3,3); P(RED,4,-15,1,1); P('#1d1d22',3,-15,1,1); P(BEAK,5,-15,2,1); P('#c98a2a',5,-14,1,1); P(RED,4,-13,1,2); P(RED,5,-13,1,1);
  const hatless=!['city','birkie','golf','fargo','kitchen'].includes(where)||where==='golf';
  if(hatless){P(RED,2,-18,1,2); P(RED,3,-19,1,3); P(RED,4,-18,1,2)}
  if(headOnly&&where!=='fargo')return;
  if(where==='kitchen'){   // chef's toque with pleats, and a little apron with a heart
    P('#ffffff',1,-21,6,3); P('#ffffff',2,-22,4,1); P('#e3e3dc',2,-18,4,2); P('#cfcfc6',3,-18,1,2); P('#cfcfc6',5,-18,1,2);
    if(!headOnly){P('#ffffff',-1,-8,4,5); P('#e3e3dc',-1,-4,4,1); P('#e3e3dc',1,-11,1,3); P('#e54b4b',0,-7,1,1); P('#e54b4b',2,-7,1,1); P('#e54b4b',1,-6,1,1)} }
  else if(where==='city'){  // stealth: black beanie with a cuff, a mask, a black turtleneck
    P('#1d1d22',1,-19,5,3); P('#3a3a44',1,-17,5,1); P('#1d1d22',3,-20,1,1);
    P('#0b0c12',2,-15,4,1); P('#ffffff',3,-15,1,1);
    if(!headOnly){P('#1d1d22',1,-12,3,3); P('#2b2b33',1,-10,3,1)} }
  else if(where==='birkie'){   // red knit hat with a stripe and pompom, race bib, poles
    P('#c8322b',1,-19,5,3); P('#ffffff',1,-17,5,1); P('#ffffff',3,-21,2,2);
    if(!headOnly){P('#ffffff',-2,-9,5,4); P('#c8322b',-2,-9,5,1); P('#1d1d22',0,-7,1,2); P('#1d1d22',-1,-7,1,1);    // bib, number 1
      P('#8a8f9a',6,-9,1,9); P('#1d1d22',6,-10,1,1); P('#8a8f9a',5,-1,3,1)} }                                           // a pole
  else if(where==='golf'){   // green visor, and an orange disc tucked under his wing
    P('#2f8a4a',2,-17,3,1); P('#2f8a4a',5,-17,3,1); P('#9fe39f',5,-17,2,1);
    if(!headOnly){P('#ff7a1a',-3,-5,5,2); P('#d65a00',-3,-4,5,1); P('#ffb066',-2,-5,2,1)} }
  else if(where==='fargo'){   // fur trapper hat with earflaps, buffalo-plaid scarf
    P('#7a4a2a',1,-19,5,3); P('#e9dcc4',1,-17,5,1); P('#7a4a2a',1,-16,1,3); P('#5a3a22',2,-19,3,1);
    P('#c8322b',1,-12,4,2); P('#1d1d22',2,-12,1,1); P('#1d1d22',4,-11,1,1); if(!headOnly){P('#c8322b',0,-11,1,3); P('#1d1d22',0,-10,1,1)} }
  else {   // the main map: a green-and-red neckerchief (Green Red Poultry colors)
    if(!headOnly){P('#2e9a45',1,-11,4,1); P('#2e9a45',2,-10,2,1); P('#c8322b',1,-11,1,1); P('#c8322b',4,-11,1,1); P('#2e9a45',3,-9,1,1)} }
}
const drawHenrietta=drawGrp;   // (older name)

// called from game.js every frame
function extrasTick(){ sceneExitTick(); gearTick() }
function extrasAlways(dt){ cloverTick(dt) }
function extrasDraw(){ for(const e of exitsHere())drawExitMark(e.mark); drawSparkles(); drawNearMark(); drawThink() }

// ---------- settings: take gear off / put it back on ----------
function renderGearSettings(){
  const box=$('gearRows'); box.replaceChildren(); const found=Object.keys(GEAR).filter(k=>have.gear&&k in have.gear); box.hidden=!found.length;
  for(const k of found){ const l=document.createElement('label'); l.className='srow'; const cb=document.createElement('input'); cb.type='checkbox'; cb.checked=gearWorn(k);
    cb.onchange=()=>{have.gear[k]=cb.checked?1:0; save()}; l.append(cb,' '+GEAR_TEXT[k].name); box.append(l) }
}
