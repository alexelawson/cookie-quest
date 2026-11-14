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
  fargo:  [{z:R(0,166,6,28),   when:()=>!fargo.onFoot,   // (no arrow here: the LEAVE FARGO highway sign points the way)
           go:()=>goTo('world','fromFargo')}],
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
  const lx=m.dir==='left'?m.x+2:m.x+8, ly=m.dir==='left'?m.y-14:m.y-8, word=m.text||'EXIT';
  F('#1d2130',lx-1,ly-1,textW(word)+3,7); pixText(ctx,word,lx+1,ly,'#f4d35e');
}
// the bouncing arrow over Joe's head when there's something to do right here
function drawNearMark(){
  if(!near||paused||fade.next||scene===SCENES.birkie)return;
  const x=Math.round(P.x), y=Math.round(P.y)-(have.crown?36:31)+Math.round(Math.sin(time/150)*2), F=(c,dx,dy,w,h)=>{ctx.fillStyle=c;ctx.fillRect(x+dx,y+dy,w,h)};
  const glow=Math.floor(time/300)%2?'#fff3a8':'#f4d35e';   // a bigger bouncing arrow over Joe's head that flashes: "you can do something here"
  F('#1d2130',-6,-2,13,1);
  for(let i=0;i<7;i++){F('#1d2130',-6+i,i-1,1,1); F('#1d2130',6-i,i-1,1,1); if(i<6)F(i<2?'#ffffff':glow,-5+i,i-1,11-i*2,1)}
  F('#1d2130',0,6,1,1);
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
  goggles: {give:true, from:'city'},     // Doc Alex's spare goggles, pushed up on his head
  disc:    {give:true, from:'golf'},     // Margie's "lucky" disc, on his back
  hat:     {give:true, from:'fargo'},    // a Lil Q's Gas & Go trucker hat
  jersey:  {give:true, from:'mill'},     // a purple #18 Vikings jersey, from a football Viking after the Birkie
  gadget:  {give:true},                  // Doc Alex's gadget: handed over at the briefing (city.js). Joe holds it (always in the heist)
};
// after a stop's reward lands in the basket: that stop's keepsake scene (once), then carry on
function giveKeepsake(key,then){
  const k=Object.keys(GEAR).find(g=>GEAR[g].from===key); if(!k||(have.gear&&k in have.gear))return then&&then();
  const lines=KEEPSAKES[k], T=GEAR_TEXT[k];
  const place={farm:KEELAN.place,city:HEIST.place,golf:GOLF_TEXT.place,fargo:FARGO.place,mill:BIRKIE.place}[key]||'';
  let i=0; const next=()=>{ if(i<lines.length){const [sp,tx,face]=lines[i++]; return showDialog({place,speaker:sp,face,pages:[tx],actions:[{label:'Next',fn:next}]})} closeDialog(); gotIt() };
  next();
  function gotIt(){ have.gear=have.gear||{}; have.gear[k]=1; save(); sfx('pickup'); showItem(k,then) }
}
const gearWorn=k=>have.gear&&have.gear[k]===1;
function gearTick(){
  if(scene!==SCENES.world)return;
  for(const k in GEAR){ const g=GEAR[k]; if(g.give||(have.gear&&k in have.gear))continue;
    if(Math.hypot(P.x-g.x,P.y-g.y)<8){ have.gear=have.gear||{}; have.gear[k]=1; save(); sfx('pickup');
      showItem(k); return } }
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
  if(gearWorn('disc')){ if(c.dir==='up'){F('#5a3a22',2,7,8,1); F('#f4d35e',-1,6,4,5); F('#e0b030',-1,9,4,1); F('#ffe98a',0,6,2,1); F('#c9902a',0,8,2,1)}   // Margie's lucky disc, slung over one shoulder (a strap across the back)
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
  if(gearWorn('goggles')&&bare&&c.dir!=='up'){                                             // Doc Alex's goggles: up on his forehead, or round his neck under the hat
    const gy=hat?6:0; F('#2b2b2b',2,gy,8,1);
    const lh=hat?1:2; if(c.dir==='down'){F('#7fd3ff',3,gy,2,lh); F('#7fd3ff',7,gy,2,lh); F('#d6f2ff',3,gy,1,1)} else F('#7fd3ff',c.dir==='left'?3:7,gy,2,lh) }
  if(gearWorn('oakleys')&&head!=='potato'){
    if(c.dir==='down'){F('#1d1d22',2,4,8,1); F('#e0603a',3,4,2,1); F('#7a4fa0',7,4,2,1); F('#ffd0a0',3,4,1,1)}
    else if(c.dir==='left'){F('#1d1d22',2,4,5,1); F('#e0603a',2,4,2,1)}
    else if(c.dir==='right'){F('#1d1d22',5,4,5,1); F('#7a4fa0',8,4,2,1)}
    else F('#1d1d22',2,4,8,1);   // the strap round the back
  }
  if(have.gear.gadget&&(gearWorn('gadget')||scene===SCENES.city)&&g===ctx){   // Doc Alex's gadget, in his hand: chrome, a glowing cyan tip, a twinkle
    const glow=Math.floor(time/220)%2?'#bff6ff':'#5fe0ff', d=c.dir, hy=12;
    if(d==='down'){F('#1d2130',10,hy-1,4,4); F('#d6dbe3',10,hy-1,3,3); F('#ffffff',10,hy-1,1,1); F(glow,11,hy+2,2,2)}
    else if(d==='right'){F('#1d2130',8,hy,6,3); F('#d6dbe3',8,hy,5,2); F('#ffffff',8,hy,2,1); F(glow,13,hy,2,2)}
    else if(d==='left'){F('#1d2130',-2,hy,6,3); F('#d6dbe3',-1,hy,5,2); F('#ffffff',2,hy,2,1); F(glow,-3,hy,2,2)}
    else {F('#d6dbe3',0,hy,2,2); F(glow,0,hy-1,1,1)}
    if(Math.floor(time/500)%3===0){ const sx=d==='left'?-3:d==='up'?0:13; F('#ffffff',sx,hy-4,1,3); F('#ffffff',sx-1,hy-3,3,1) }
  }
}

// ---------- crabs on the Vancouver beaches: they scuttle sideways and wave their claws ----------
const CRABS=[[44,241,1.7],[108,261,2.4]];   // [x, y, phase]
function drawCrab(x,y,ph){
  const F=(c,dx,dy,w,h)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x+dx),Math.round(y+dy),w,h)}, claw=Math.floor(time/260+ph*3)%2;
  F('rgba(0,0,0,.2)',-3,1,7,1);
  F('#d9452f',-2,-2,5,3); F('#f06a4a',-1,-2,3,1); F('#a8322a',-2,0,5,1);                    // shell
  F('#ffffff',-1,-4,1,1); F('#ffffff',1,-4,1,1); F('#1d1d22',-1,-4,1,1); F('#1d1d22',1,-4,1,1); F('#d9452f',-1,-3,1,1); F('#d9452f',1,-3,1,1);   // eyes on stalks
  F('#d9452f',-4,-3-claw,2,2); F('#d9452f',3,-3-claw,2,2);                                   // claws, waving
  F('#a8322a',-3,0,1,1); F('#a8322a',3,0,1,1); F('#a8322a',-3,1,1,1); F('#a8322a',3,1,1,1);  // legs
}
{const ents=SCENES.world.ents; SCENES.world.ents=function(list){ ents.call(this,list);
  for(const [cx,cy,ph] of CRABS){ const x=cx+Math.sin(time/900+ph)*6, y=cy; list.push({y,draw:()=>drawCrab(x,y,ph)}) } }}

// ---------- a few fun little things: ducks paddling on Brian's pond, a snowman by the Birkie lot ----------
function drawDuck(x,y,flip,ph){
  const F=(c,dx,dy,w,h)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x+(flip?-dx-w+1:dx)),Math.round(y+dy),w,h)}, bob=Math.floor(time/400+ph)%2;
  F('rgba(255,255,255,.35)',-3,1,8,1);                                                            // a little wake
  F('#f2efe6',-2,-2+bob,5,3); F('#d9d4c8',-2,0+bob,5,1); F('#2f8a4a',2,-4+bob,2,2); F('#f4a020',4,-3+bob,2,1); F('#1d1d22',3,-4+bob,1,1);
}
function drawSnowman(x,y){
  const F=(c,dx,dy,w,h)=>{ctx.fillStyle=c;ctx.fillRect(x+dx,y+dy,w,h)};
  F('rgba(0,0,0,.15)',-5,0,11,2); F('#ffffff',-4,-7,9,7); F('#e6eef4',-4,-1,9,1); F('#ffffff',-3,-13,7,6); F('#ffffff',-2,-17,5,4);
  F('#1d1d22',-1,-16,1,1); F('#1d1d22',1,-16,1,1); F('#f08a24',0,-15,2,1);                     // eyes, carrot nose
  F('#c8322b',-3,-13,7,1); F('#c8322b',2,-12,2,3);                                                // a red scarf
  F('#1d1d22',-3,-19,7,2); F('#1d1d22',-2,-22,5,3); F('#1d1d22',0,-10,1,1); F('#1d1d22',0,-8,1,1);   // top hat, buttons
  F('#6b4428',-7,-11,3,1); F('#6b4428',5,-12,3,1); F('#6b4428',-8,-12,1,1); F('#6b4428',7,-13,1,1);   // stick arms
}
solids.push(R(258,74,9,4));
// a little green tractor working the sugar beet rows out back of Lil Q's (main map)
function drawTractor(x,y,flip){
  const F=(c,dx,dy,w,h)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x+(flip?-dx-w+1:dx)),Math.round(y+dy),w,h)}, bump=Math.floor(time/180)%2;
  F('rgba(0,0,0,.2)',-6,2,14,2);
  F('#2f7a3a',-5,-6+bump,10,5); F('#3f9a4a',-5,-6+bump,10,1); F('#9fd2f0',-1,-11+bump,5,5); F('#2f7a3a',-2,-12+bump,7,1); F('#1d1d22',-3,-10+bump,1,4);   // body, cab, exhaust
  F('#1d1d22',-6,-3,5,5); F('#f4d35e',-5,-2,3,3); F('#1d1d22',3,-1,3,3); F('#f4d35e',4,0,1,1);                                     // big back wheel, small front wheel
  if(Math.floor(time/400)%2)F('rgba(220,220,220,.6)',-4,-14+bump,2,2);                                                          // a puff of smoke
}
{const ents=SCENES.world.ents; SCENES.world.ents=function(list){ ents.call(this,list);
  for(const [cx,cy,ph] of [[146,32,0],[152,38,1.3],[140,40,2.2]]){ const x=cx+Math.sin(time/1500+ph)*5, fl=Math.cos(time/1500+ph)<0; list.push({y:cy,draw:()=>drawDuck(x,cy,fl,ph)}) }
  list.push({y:78,draw:()=>drawSnowman(262,78)}) }}

// ---------- a clear sign in front of each land ----------
// wooden boards on two posts: [text, x, y] (top-left of the board). Fargo has its own blue road sign below.
const LAND_SIGNS=[['THE FARM',58,132],['THE BIRKIE',326,130]];
{const g=bg.getContext('2d'), F=(c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};
  for(const [t,x,y] of LAND_SIGNS){const w=textW(t)+8;
    F('rgba(0,0,0,.25)',x+2,y+16,w-2,2); F('#5a3a22',x+3,y+9,2,8); F('#5a3a22',x+w-5,y+9,2,8);
    F('#5a3a22',x,y,w,11); F('#f2e6c8',x+1,y+1,w-2,9); F('#d9c9a2',x+1,y+9,w-2,1); pixText(g,t,x+4,y+3,'#3b2a1e');
    solids.push(R(x+3,y+14,2,3),R(x+w-5,y+14,2,3))}}
// Vancouver: a gateway over the street where it leaves the main road (two lamp posts and a sign)
{const g=bg.getContext('2d'), F=(c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(x,y,w,h)}, t='VANCOUVER', w=textW(t)+10, x=78-w/2|0, y=166;
  for(const px of [x+2,x+w-4]){F('#3a3f50',px,y+2,2,14); F('#5a6278',px,y+2,1,14); F('#ffe9a8',px-1,y+15,4,2)}   // posts with little lamps
  F('#1d2a44',x,y,w,10); F('#2f4a78',x+1,y+1,w-2,8); F('#c9a640',x,y,w,1); F('#c9a640',x,y+9,w,1); pixText(g,t,x+5,y+2,'#ffd84d');
  solids.push(R(x+2,y+14,2,3),R(x+w-4,y+14,2,3))}
// Fargo on the main map (drawn on top): the theatre's teal FARGO marquee with chasing bulbs, its tall blade sign, the steel tower on its roof
function drawFargoTop(){
  const F=(c,x,y,w,h)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h)}, on=Math.floor(time/220)%2;
  // the steel tower up on the roof
  F('#3a3f4a',293,170,1,16); F('#3a3f4a',301,170,1,16); for(let y=172;y<186;y+=4){F('#3a3f4a',293,y,9,1); for(let k=0;k<4;k++)F('#3a3f4a',293+k*2,y+k,1,1)}
  F('#5f9a98',296,172,3,20);
  // the marquee: cream box, a teal panel with FARGO in salmon letters, little sign lines either side, bulbs along the top
  F('rgba(0,0,0,.25)',262,240,66,2);
  F('#efe6d2',262,226,66,14); F('#d9cdb4',262,238,66,2); F('#c9bca0',262,226,66,1);
  F('#2f7a78',279,227,32,11); F('#3f9a96',279,227,32,1); F('#e9dcc4',279,227,1,11); F('#e9dcc4',310,227,1,11);
  pixText(ctx,'FARGO',284,230,'#f6b08a');
  for(const sx of [265,314])for(let k=0;k<3;k++)F('#7a2a22',sx,229+k*3,10,1);                       // "now showing"
  F('#efe6d2',286,222,18,4); for(let k=0;k<4;k++)F('#c9bca0',288+k*4,222,2,4);                       // the crown on top
  for(let x=263;x<328;x+=3)F(((x/3|0)+on)%2?'#fff3a8':'#a8762a',x,225,1,1);                            // chasing bulbs
  // the blade sign, teal, F-A-R-G-O stacked, sticking out from the corner of the theatre
  F('rgba(0,0,0,.2)',258,186,10,46); F('#2f7a78',255,184,10,46); F('#3f9a96',255,184,1,46); F('#1f5a58',264,184,1,46); F('#e9dcc4',255,184,10,1); F('#e9dcc4',255,229,10,1);
  [...'FARGO'].forEach((ch,i)=>pixText(ctx,ch,258,188+i*8,'#efe6d2'));
  for(let y=186;y<228;y+=3){F((y/3+on)%2?'#fff3a8':'#a8762a',255,y,1,1)}
  // street lamps: black posts, a warm globe
  for(const lx of [240,330]){F('#1d1d22',lx,168,1,14); F('#1d1d22',lx-1,181,3,1); F('#fff3c8',lx-1,165,3,3); F('#1d1d22',lx-1,164,3,1)}
  for(const lx of [266,350]){F('#1d1d22',lx,236,1,20); F('#1d1d22',lx-1,255,3,1); F('#fff3c8',lx-1,234,3,3)}
}

// hook into the main map
{const ents=SCENES.world.ents;
  SCENES.world.ents=function(list){ ents.call(this,list);
    for(const k in GEAR)if(!GEAR[k].give&&!(have.gear&&k in have.gear))list.push({y:GEAR[k].y,draw:()=>drawGearItem(k,GEAR[k].x,GEAR[k].y)});
    list.push({y:182,draw:()=>drawCar(270,176,'right',true)});   // the CR-V at Fargo, parked a step back from the road: walk up to it to drive into town
  }}

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
  if(!henHere()||scene===SCENES.scooter)return null;   // (no room on the scooter)
  if(scene===SCENES.fargo&&!fargo.onFoot){ const d=P.dir==='left'?-1:1; return {y:P.y+1, draw:()=>drawGrp(P.x-1-3*d,P.y+11,d,'fargo',true)} }   // riding shotgun
  const h=henPos(), f=h.x<P.x?1:h.x>P.x?-1:(P.dir==='left'?-1:1), hop=P.moving&&Math.floor(time/150)%2?1:0;
  return {y:h.y, draw:()=>drawGrp(h.x,h.y-hop,f,sceneName())};
}
function drawGrp(x,y,f,where,headOnly,g=ctx){
  x=Math.round(x); y=Math.round(y);
  // P: draw a rect given for facing right; mirrored when he faces left
  const P=(c,dx,dy,w,h)=>{g.fillStyle=c; g.fillRect(f>0?x+dx:x-dx-w+1,y+dy,w,h)};
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
function extrasDraw(){ for(const e of exitsHere())if(e.mark&&(!e.markWhen||e.markWhen()))drawExitMark(e.mark); drawSparkles(); drawNearMark(); drawThink() }

// ---------- settings: take gear off / put it back on ----------
function renderGearSettings(){
  const box=$('gearRows'); box.replaceChildren(); const found=Object.keys(GEAR).filter(k=>have.gear&&k in have.gear); box.hidden=!found.length;
  for(const k of found){ const l=document.createElement('label'); l.className='srow'; const cb=document.createElement('input'); cb.type='checkbox'; cb.checked=gearWorn(k);
    cb.onchange=()=>{have.gear[k]=cb.checked?1:0; save()}; l.append(cb,' '+GEAR_TEXT[k].name); box.append(l) }
}

// ---------- item cards: a big picture of whatever Joe just found or was given ----------
// Each painter draws on a 40 x 30 canvas (shown at 4x), like the ingredient cards.
const GEAR_ART={
  gadget(F){ // Doc Alex's gadget: a chrome zapper with a glowing cyan dome, dials, and an antenna
    F('#1d2130',6,10,26,13); F('#c9ced4',7,11,24,11); F('#eef1f5',7,11,24,2); F('#9aa0aa',7,20,24,2);    // the body
    F('#5f6676',2,14,5,5); F('#3a3f4a',0,15,3,3);                                                       // the grip end
    F('#1d2130',30,12,6,9); F('#5fe0ff',31,13,4,7); F('#bff6ff',31,13,2,3);                            // the glowing tip
    F('#e54b4b',10,14,3,3); F('#f4d35e',15,14,3,3); F('#7dff8a',20,14,3,3);                              // buttons
    F('#3a3f4a',24,14,4,4); F('#c9ced4',25,15,2,2);                                                     // a dial
    F('#9aa0aa',14,3,1,8); F('#e54b4b',13,1,3,3); F('#ffffff',13,1,1,1);                                 // the antenna
    F('#ffffff',36,9,1,4); F('#ffffff',35,10,3,1); F('#bff6ff',38,16,1,1); F('#bff6ff',37,22,2,1) },   // sparkles
  oakleys(F){ // sporty wraparound shades with prism lenses
    F('#1d1d22',4,10,32,3); F('#1d1d22',2,12,3,4); F('#1d1d22',35,12,3,4); F('#1d1d22',18,13,4,3);
    F('#e0603a',5,13,13,7); F('#7a4fa0',22,13,13,7); F('#f4a04a',5,13,13,2); F('#a070d0',22,13,13,2); F('#1d1d22',5,20,13,1); F('#1d1d22',22,20,13,1);
    F('#ffe0b0',7,14,3,1); F('#ffffff',24,14,3,1); F('#3a3a44',0,13,3,1); F('#3a3a44',37,13,3,1) },
  headband(F){ // a teal ski headband, stretched in a loop
    F('#2fb3a0',8,9,24,4); F('#2fb3a0',8,19,24,4); F('#2fb3a0',5,11,4,10); F('#2fb3a0',31,11,4,10); F('#1f8a7a',8,12,24,1); F('#1f8a7a',8,22,24,1);
    F('#5fd8c4',9,9,22,1); F('#ffffff',17,10,6,2); F('#ffffff',15,20,10,1) },
  shoes(F){ // a pair of carbon racing shoes: orange uppers, big white soles, yellow laces
    for(const [x,y] of [[2,8],[20,14]]){ F('#ff5a1f',x+2,y,13,6); F('#ff5a1f',x,y+3,4,3); F('#ff7a3f',x+3,y,10,1); F('#ffffff',x-1,y+6,19,3); F('#d9d9d9',x-1,y+8,19,1);
      F('#1d1d22',x+14,y+1,3,5); F('#f4d35e',x+6,y+1,1,1); F('#f4d35e',x+8,y+1,1,1); F('#f4d35e',x+10,y+1,1,1); F('#2b2b33',x+3,y+4,8,1) } },
  clover(F){ // one big four-leaf clover
    const leaf=(x,y)=>{F('#2e7d32',x,y,9,9); F('#2e7d32',x+1,y-1,7,11); F('#5fbf5f',x+1,y,6,6); F('#a8ecb0',x+2,y+1,2,2)};
    leaf(10,2); leaf(21,2); leaf(10,13); leaf(21,13); F('#1d5a2a',19,11,2,2); F('#2e7d32',19,22,2,6); F('#2e7d32',21,26,2,2) },
  goggles(F){ // Doc Alex's lab goggles: black strap, two round cyan lenses
    F('#2b2b2b',0,12,40,3); F('#2b2b2b',6,8,12,12); F('#2b2b2b',22,8,12,12); F('#2b2b2b',18,12,4,4);
    F('#7fd3ff',8,10,8,8); F('#7fd3ff',24,10,8,8); F('#d6f2ff',9,11,3,2); F('#d6f2ff',25,11,3,2); F('#4aa8d8',8,16,8,2); F('#4aa8d8',24,16,8,2) },
  disc(F){ // Margie's lucky disc: a pink flying disc, tilted, with a white heart
    for(let y=-8;y<=8;y++){const h=Math.round(17*Math.sqrt(1-(y/9)**2)); F(y>5?'#b33a64':y<-5?'#ffb3d0':'#f28cb8',20-h,15+y,h*2,1)}
    for(let y=-6;y<=4;y++){const h=Math.round(12*Math.sqrt(1-(y/7)**2)); F('#e86a98',20-h,15+y,1,1); F('#e86a98',19+h,15+y,1,1)}
    F('#ffffff',16,11,3,2); F('#ffffff',21,11,3,2); F('#ffffff',15,12,10,3); F('#ffffff',16,15,8,1); F('#ffffff',17,16,6,1); F('#ffffff',18,17,4,1); F('#ffffff',19,18,2,1) },
  hat(F,g){ // a Lil Q's Gas & Go trucker hat, from the side: red front panel, white mesh back, flat brim
    F('#f2efe6',20,5,10,16); F('#f2efe6',30,7,3,14); F('#f2efe6',33,10,2,11); F('#f2efe6',20,3,7,2);                       // mesh back
    for(let x=21;x<34;x+=2)for(let y=6;y<20;y+=2)F('#cfcac0',x,y,1,1);
    F('#c8322b',8,5,14,16); F('#c8322b',10,3,11,2); F('#c8322b',6,9,2,12); F('#e8584c',10,3,9,1); F('#a02a22',6,19,16,2);   // red front
    F('#f4d35e',19,1,4,2); F('#d9a92e',20,2,2,1);                                                                            // the button on top
    F('#1d2130',0,20,24,3); F('#2f3446',0,20,24,1);                                                                          // the flat brim
    pixText(g,'LQ',10,9,'#ffffff') },
  jersey(F){ // the purple #18 Vikings jersey
    F('#4f2683',10,4,20,24); F('#4f2683',3,4,8,9); F('#4f2683',29,4,8,9); F('#3d1d66',10,26,20,2); F('#ffc62f',3,11,8,2); F('#ffc62f',29,11,8,2);
    F('#ffffff',16,3,8,3); F('#4f2683',17,3,6,2);
    F('#ffc62f',13,11,2,10); F('#ffc62f',12,12,1,1);                                                  // the 1
    F('#ffc62f',18,11,7,2); F('#ffc62f',18,15,7,2); F('#ffc62f',18,19,7,2); F('#ffc62f',18,11,2,10); F('#ffc62f',23,11,2,10) },   // the 8
};
function showItem(k,then,noAsk){   // noAsk: just "OK" (no "Not now")
  const T=GEAR_TEXT[k], c=$('itemCanvas'), g=c.getContext('2d'); g.imageSmoothingEnabled=false; g.clearRect(0,0,c.width,c.height);
  const F=(col,x,y,w,h)=>{g.fillStyle=col;g.fillRect(x,y,w,h)};
  c.width=k==='hen'?26:40; c.height=k==='hen'?20:30; g.imageSmoothingEnabled=false;   // Grp gets a smaller canvas, so he shows up bigger
  if(k==='hen')drawGrp(12,19,1,'world',false,g); else GEAR_ART[k]&&GEAR_ART[k](F,g);
  $('itemFrom').textContent=T.from||GEAR_TEXT.place; $('itemName').textContent=T.name; $('itemLine').textContent=T.found||'';
  $('itemTip').textContent=k==='hen'?'':GEAR_TEXT.tip; $('itemBtn').textContent=T.wear||'OK';
  $('itemBtn').onclick=()=>{ $('itemCard').hidden=true; paused=overlayOpen(); then&&then() };
  // the "Wear it?" question: a second button that keeps it in the bag (have.gear[k]=0: put it on any time in Settings)
  let no=$('itemNo'); if(!no){ no=document.createElement('button'); no.id='itemNo'; no.className='btn ghost'; $('itemBtn').after(no) }
  no.hidden=!!noAsk||k==='hen'; no.textContent=GEAR_TEXT.notNow;
  no.onclick=()=>{ have.gear[k]=0; save(); $('itemCard').hidden=true; paused=overlayOpen(); then&&then() };
  paused=true; prompt.hidden=true; $('itemCard').hidden=false; sfx('reward');
  setTimeout(()=>$('itemBtn').focus({preventScroll:true}),0);
}

// the Lions Gate Bridge across the bottom of Vancouver: two green towers, the deck, and the necklace of lights on the cables
function drawLionsGate(){
  const F=(c,x,y,w,h)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),w,h)}, DECK=279, TOP=261, T1=46, T2=118;
  F('rgba(0,0,0,.25)',0,DECK+2,164,2);
  F('#2a4a3a',0,DECK,164,2); F('#3f6b52',0,DECK,164,1);                                          // the deck
  for(let x=2;x<164;x+=6)F(Math.floor(time/600+x)%5?'#ffe9a8':'#fff8d8',x,DECK+1,1,1);             // streetlights on the deck
  const cable=(x0,y0,x1,y1,sag)=>{ for(let k=0;k<=1;k+=1/(Math.abs(x1-x0)*1.2)){const x=x0+(x1-x0)*k, y=y0+(y1-y0)*k+sag*4*k*(1-k); F('#5f8a6e',x,y,1,1)}
    for(let k=.04;k<1;k+=.09){const x=x0+(x1-x0)*k, y=y0+(y1-y0)*k+sag*4*k*(1-k); F(Math.floor(time/400+k*20)%4?'#fff3c4':'#ffffff',x,y,1,1); if(Math.round(k*100)%18<9)F('rgba(63,107,82,.55)',x,y+1,1,DECK-y-1)}};   // lights + a few hangers
  cable(T1+2,TOP+1,T2+2,TOP+1,12); cable(-6,DECK-4,T1+2,TOP+1,-3); cable(T2+2,TOP+1,170,DECK-4,-3);
  for(const x of [T1,T2]){F('#2f7a4a',x,TOP,4,DECK-TOP+2); F('#4f9a68',x,TOP,1,DECK-TOP+2); F('#1f5a36',x+3,TOP,1,DECK-TOP+2); F('#2f7a4a',x-1,TOP+5,6,1); F('#2f7a4a',x-1,TOP+11,6,1);
    if(Math.floor(time/900)%2)F('#ff3b3b',x+1,TOP-1,2,1)}                                         // the towers (with aircraft lights)
}

// ---------- Christmas on the main map ----------
// decorated Christmas trees: a snowy fir with a garland, twinkling ornaments and a gold star
function drawXmasTree(x,y,big){
  const s=big?1.5:1, F=(c,dx,dy,w,h)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x+dx*s),Math.round(y+dy*s),Math.max(1,Math.round(w*s)),Math.max(1,Math.round(h*s)))};
  F('rgba(0,0,0,.2)',-5,0,11,2); F('#5a3d26',-1,-3,2,3);
  for(let i=0;i<4;i++){const w=4+i*2.5, y0=-17+i*3.5; F(i%2?'#2b5a3a':'#2f6b3f',-w/2,y0,w,4.5); F('#ffffff',-w/2,y0,w/2,1)}   // tiers with snow on top
  F('#e9d27a',-4,-11,8,1); F('#e9d27a',-5,-6,10,1);                                                                  // a gold garland
  const tw=Math.floor(time/380);
  [[-2,-13,'#e54b4b'],[2,-9,'#5fa8e8'],[-4,-8,'#f4d35e'],[3,-5,'#e54b7a'],[-1,-4,'#ffffff'],[1,-15,'#7fd39a']].forEach(([dx,dy,c],k)=>F((tw+k)%4?c:'#fff6c8',dx,dy,1,1));
  F('#ffd84d',-1,-20,2,2); F('#ffd84d',-2,-19,4,1); if(tw%2)F('#fff3a8',0,-21,1,1);                                       // the star
}
const BIG_TREE={x:211,y:147};   // by the kitchen porch, out of the hens' way
solids.push(R(BIG_TREE.x-5,BIG_TREE.y-3,10,4));
{const e=SCENES.world.ents; SCENES.world.ents=function(list){ e.call(this,list); list.push({y:BIG_TREE.y,draw:()=>{drawXmasTree(BIG_TREE.x,BIG_TREE.y,true);
  const g=ctx; g.fillStyle='#c8322b'; g.fillRect(BIG_TREE.x-9,BIG_TREE.y-3,5,4); g.fillStyle='#f4d35e'; g.fillRect(BIG_TREE.x-7,BIG_TREE.y-3,1,4); g.fillStyle='#3d6fb0'; g.fillRect(BIG_TREE.x+5,BIG_TREE.y-2,4,3); g.fillStyle='#ffffff'; g.fillRect(BIG_TREE.x+6,BIG_TREE.y-2,1,3)}}) }}   // with presents
// the marina at False Creek: a dock with little boats tied up, their lights glowing in the water
function drawMarina(){
  const F=(c,x,y,w,h)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h)}, b=k=>Math.round(Math.sin(time/900+k)*.6);
  F('#6b4a2f',74,265,30,2); F('#8a6a4a',74,265,30,1); for(const fx of [80,90,100])F('#6b4a2f',fx,267,2,7);   // dock and fingers
  for(const [bx,k] of [[75,0],[84,1],[94,2]]){ const yy=269+b(k);
    F('#f2f2ee',bx,yy,5,3); F('#d9d9d4',bx,yy+2,5,1); F('#9aa3b2',bx+2,yy-5,1,5); F('#ffe9a8',bx+1,yy,2,1);    // a little sailboat, cabin light on
    F('rgba(243,196,106,.4)',bx+1,yy+4,1,2+(Math.floor(time/300+k)%2)) }
  for(const px of [74,84,94,103]){F('#3a3a44',px,262,1,3); F(Math.floor(time/500+px)%3?'#ffe9a8':'#fff6c8',px,261,1,1)}   // dock lamps
}
