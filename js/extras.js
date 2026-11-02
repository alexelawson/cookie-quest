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
};
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
  if(!have.gear)return; const x=Math.round(c.x)-6, y=Math.round(c.y)-18, F=(col,dx,dy,w,h)=>{g.fillStyle=col;g.fillRect(x+dx,y+dy,w,h)};
  const head=look?look.head:'hair', a=c.moving&&c.step%2?1:0, b=c.moving&&!(c.step%2)?1:0;
  if(gearWorn('clover')&&c.dir!=='up'){F('#3d8443',c.dir==='left'?3:7,8,2,2); F('#5fb060',c.dir==='left'?3:7,8,1,1)}   // the lucky clover, pinned on
  if(gearWorn('shoes')){F('#ff5a1f',2,17-a,3,1); F('#ff5a1f',7,17-b,3,1); F('#f4d35e',4,17-a,1,1); F('#f4d35e',9,17-b,1,1)}   // bright carbon racers
  if(gearWorn('headband')&&(head==='hair'||!look)){F('#2fb3a0',2,1,8,1); if(c.dir==='down')F('#ffffff',5,1,2,1)}
  if(gearWorn('oakleys')&&head!=='wrap'){
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

// called from game.js every frame
function extrasTick(){ sceneExitTick(); gearTick() }
function extrasDraw(){ for(const e of exitsHere())drawExitMark(e.mark); drawNearMark(); drawThink() }

// ---------- settings: take gear off / put it back on ----------
function renderGearSettings(){
  const box=$('gearRows'); box.replaceChildren(); const found=Object.keys(GEAR).filter(k=>have.gear&&k in have.gear); box.hidden=!found.length;
  for(const k of found){ const l=document.createElement('label'); l.className='srow'; const cb=document.createElement('input'); cb.type='checkbox'; cb.checked=gearWorn(k);
    cb.onchange=()=>{have.gear[k]=cb.checked?1:0; save()}; l.append(cb,' '+GEAR_TEXT[k].name); box.append(l) }
}
