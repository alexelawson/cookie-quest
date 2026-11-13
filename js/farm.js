// The farm: talk to Keelan, then get the escaped hens back in the pen before too many are loose.
// All the difficulty knobs live in FARM.
const FARM = {
  HENS: 20,            // hens in a full pen
  ESCAPES: 26,         // how many escapes happen in one attempt (including the ones already out)
  START_LOOSE: 5,      // already out when the chase starts
  FIRST_GAP: 1800,     // ms between escapes at the start...
  LAST_GAP: 6000,      // ...stretching to this by the last escape
  LOSE_AT: 9,          // this many loose at once and they scatter
  FLEE_RADIUS: 38,     // how close you get before a hen runs
  FLEE_SPEED: .054,    // px/ms (you walk at .07)
  WANDER_SPEED: .018,
  KEELAN_SPEED: .05,
};
// Tuned with a bot (20 runs each). The chase ends the moment all 20 are home.
// A good player always wins (~1.5 min), a sloppy one about half the time.
// With Keelan helping, everyone wins in under a minute.
// Lower FLEE_SPEED or raise FIRST_GAP to make it easier.
const PEN = R(94,64,52,52);                 // inside of the fence, where penned hens wander
const PEN_FENCE = R(90,60,60,60);
const BARN = R(20,30,56,44);
const DROP = R(108,118,24,14);              // stand here holding a hen to put it back
const GATE = {x:120, y:124};
const FARM_AREA = R(4,12,158,134);          // loose hens stay in here
const CUPCAKE = {x:48, y:22};               // behind the barn; its frosting peeks up over the roof
const KEELAN_HOME = {x:142, y:134};

const rand=(a,b)=>a+Math.random()*(b-a);
const penHen=()=>({x:rand(PEN.x+3,PEN.x+PEN.w-3), y:rand(PEN.y+4,PEN.y+PEN.h-1), vx:0, vy:0, t:rand(0,1500), f:1});

const farm = {
  active:false, penned:[], loose:[], carrying:null,
  escapesLeft:0, escIdx:0, gapT:0, alertT:0, alertAt:null, popT:0,
  keelan:{x:KEELAN_HOME.x, y:KEELAN_HOME.y, dir:'down', step:0, t:0, moving:false, carrying:null},
};

function farmReset(){
  farm.active=false; farm.won=false; farm.loose=[]; farm.carrying=null; farm.keelan.carrying=null;
  farm.penned=[...Array(FARM.HENS)].map(penHen);
  Object.assign(farm.keelan,{x:KEELAN_HOME.x,y:KEELAN_HOME.y,dir:'down',moving:false});
  if(typeof sceneMusic==='function'&&typeof scene!=='undefined'&&scene)sceneMusic();   // back to the map music
}
const escapeGap=i=>FARM.FIRST_GAP+(FARM.LAST_GAP-FARM.FIRST_GAP)*Math.min(1,i/(FARM.ESCAPES-1));

function farmStart(){
  farmReset(); farm.active=true; farm.escapesLeft=FARM.ESCAPES; farm.escIdx=0; sceneMusic();   // the hen-chase music
  for(let i=0;i<FARM.START_LOOSE;i++)escapeOne();
  farm.gapT=escapeGap(farm.escIdx);
}
function escapeOne(){
  if(!farm.penned.length||farm.escapesLeft<=0)return;
  farm.penned.pop(); farm.escapesLeft--; farm.escIdx++;
  // slips through a gap somewhere in the fence and bolts
  const f=PEN_FENCE, side=Math.floor(Math.random()*4); let x,y,vx,vy;
  if(side===0){x=f.x-4; y=rand(f.y+6,f.y+f.h-4); vx=-1; vy=rand(-.6,.6)}             // left
  else if(side===1){x=f.x+f.w+4; y=rand(f.y+6,f.y+f.h-4); vx=1; vy=rand(-.6,.6)}     // right
  else if(side===2){x=rand(f.x+6,f.x+f.w-6); y=f.y-3; vx=rand(-.6,.6); vy=-1}        // top
  else {x=Math.random()<.5?rand(f.x+6,106):rand(134,f.x+f.w-6); y=f.y+f.h+5; vx=rand(-.6,.6); vy=1} // bottom, not the gate
  const n=Math.hypot(vx,vy);
  farm.loose.push({x,y,vx:vx/n*.08,vy:vy/n*.08,t:800,burst:true,f:vx<0?-1:1});
  farm.alertT=700; farm.alertAt={x,y};
}

// ---------- talking to Keelan ----------
function talkToKeelan(){
  const K=KEELAN, say=(pages,after)=>showDialog({place:K.place,speaker:K.name,pages,actions:[{label:'OK',fn:after||talkToKeelan}]});
  if(have.farm){
    if(have.cupcake&&!have.gaveCupcake) return showDialog({place:K.place,speaker:K.name,pages:[K.after],menu:true,actions:[
      {label:K.cupcakeQ,fn:()=>{have.gaveCupcake=true;save();renderBasket();
        showDialog({place:K.place,speaker:K.name,pages:K.cupcakeLate,actions:[CLOSE]})}},{label:K.bye,ghost:true,fn:closeDialog}]});
    return showDialog({place:K.place,speaker:K.name,pages:[K.after],actions:[CLOSE]});
  }
  if(farm.won||have.farmWon) return showReward('farm');   // won but didn't take them yet (even after a reload)
  const opts=[];
  if(farm.active){
    opts.push({label:K.midQ,fn:()=>say([`${farm.penned.length} of ${FARM.HENS} in the pen. ${farm.loose.length} running around.`,
      farm.escapesLeft>0?"Get all twenty home at once and they'll settle down.":"They're worn out. They won't sneak out again. Round up the rest!"])});
  } else {
    K.questions.forEach((q,i)=>{ if(i===1&&have.gaveCupcake)return; opts.push({label:q.q,fn:()=>say(q.a)}) });   // (once he's had the cupcake, no more "Can't you catch them?")
  }
  if(have.cupcake&&!have.gaveCupcake) opts.push({label:K.cupcakeQ,fn:()=>{
    have.gaveCupcake=true; save(); renderBasket(); say(K.cupcakeA)}});
  if(farm.active) opts.push({label:K.backToIt,ghost:true,fn:closeDialog});
  else {
    opts.push({label:K.ready,fn:()=>{showDialog({place:K.place,speaker:K.name,pages:K.start,actions:[{label:'Go!',fn:()=>{farmStart();closeDialog()}}]})}});
    opts.push({label:K.bye,ghost:true,fn:closeDialog});
  }
  const hello=farm.active?K.midHello:(have.metKeelan?K.helloAgain:K.hello);
  have.metKeelan=true; save();
  showDialog({place:K.place,speaker:K.name,pages:[hello],actions:opts,menu:true});
}

// ---------- movement helpers ----------
const HEN_ONLY=[R(14,10,68,24), R(100,134,22,14)];   // behind the barn, under the roadside tree: places hens would vanish
function henBlocked(x,y){
  const b=R(x-3,y-3,6,4);
  if(HEN_ONLY.some(z=>hit(b,z)))return true;
  if(b.x<FARM_AREA.x||b.y<FARM_AREA.y||b.x+b.w>FARM_AREA.x+FARM_AREA.w||b.y+b.h>FARM_AREA.y+FARM_AREA.h)return true;
  return solids.some(s=>hit(b,s));
}
// Route around the pen and barn: if the straight line to the target crosses one, head for its best corner first.
const RAW=[PEN_FENCE,BARN], OBST=RAW.map(o=>R(o.x-4,o.y-4,o.w+8,o.h+8));
const CORNERS=[PEN_FENCE,BARN].flatMap(o=>{const e=R(o.x-10,o.y-10,o.w+20,o.h+20);
  return [{x:e.x,y:e.y},{x:e.x+e.w,y:e.y},{x:e.x,y:e.y+e.h},{x:e.x+e.w,y:e.y+e.h}]});
const inside=(p,c)=>p.x>c.x&&p.x<c.x+c.w&&p.y>c.y&&p.y<c.y+c.h;
function segClear(a,b){
  // standing inside an obstacle's margin (hugging the fence)? check against the bare fence instead
  const obs=OBST.map((c,i)=>inside(a,c)||inside(b,c)?RAW[i]:c);
  for(let k=1;k<24;k++){const t=k/24, p={x:a.x+(b.x-a.x)*t, y:a.y+(b.y-a.y)*t};
    for(const c of obs)if(inside(p,c))return false}
  return true;
}
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
// Shortest route via up to two corners; returns the next point to walk toward.
function waypoint(from,to){
  if(segClear(from,to))return to;
  let best=null,bd=1e9;
  for(const c1 of CORNERS){
    if(dist(from,c1)<2||!segClear(from,c1))continue;
    if(segClear(c1,to)){const d=dist(from,c1)+dist(c1,to); if(d<bd){bd=d;best=c1}; continue}
    for(const c2 of CORNERS){if(c2===c1||!segClear(c1,c2)||!segClear(c2,to))continue;
      const d=dist(from,c1)+dist(c1,c2)+dist(c2,to); if(d<bd){bd=d;best=c1}}
  }
  return best||to;
}
function personBlocked(x,y){
  const b=R(x-4,y-3,8,4);
  if(b.x<2||b.y<10||b.x+b.w>WW-2||b.y+b.h>WH-2)return true;
  return solids.some(s=>hit(b,s));
}
const bodyBox=(x,y)=>R(x-5,y-12,10,13);
const henBox=h=>R(h.x-3,h.y-5,6,6);

// ---------- update ----------
function farmAmbient(dt){
  for(const h of farm.penned){
    h.t-=dt;
    if(h.t<=0){h.t=rand(600,2000); const m=Math.random()<.5; h.vx=m?rand(-.015,.015):0; h.vy=m?rand(-.015,.015):0; if(h.vx)h.f=h.vx<0?-1:1}
    h.x=Math.min(PEN.x+PEN.w-3,Math.max(PEN.x+3,h.x+h.vx*dt)); h.y=Math.min(PEN.y+PEN.h-1,Math.max(PEN.y+4,h.y+h.vy*dt));
  }
  if(farm.alertT>0)farm.alertT-=dt;
  if(farm.popT>0)farm.popT-=dt;
}

function farmUpdate(dt){
  // the cupcake
  if(!have.cupcake&&!have.gaveCupcake&&Math.abs(P.x-CUPCAKE.x)<16&&P.y<=CUPCAKE.y+7){
    have.cupcake=true; save(); renderBasket();
    have.cupcakeCostume=true; save(); sfx('pickup');
    showDialog({place:'Behind the barn',speaker:'Ooh',pages:[KEELAN.foundCupcake,KEELAN.cupcakeUnlock],actions:outfitActions('cupcake')}); return;
  }
  const k=farm.keelan, helping=have.gaveCupcake&&farm.active;

  // Keelan: chase when he's helping, otherwise wander home
  let goal=null;
  if(helping){
    if(k.carrying) goal=GATE;
    else if(farm.loose.length){goal=farm.loose.reduce((a,h)=>Math.hypot(h.x-k.x,h.y-k.y)<Math.hypot(a.x-k.x,a.y-k.y)?h:a)}
  } else if(Math.hypot(k.x-KEELAN_HOME.x,k.y-KEELAN_HOME.y)>2) goal=KEELAN_HOME;
  k.moving=false;
  if(goal){
    const w=waypoint(k,goal); let dx=w.x-k.x, dy=w.y-k.y; const d=Math.hypot(dx,dy);
    if(d>1){dx/=d;dy/=d; const sp=FARM.KEELAN_SPEED*dt;
      if(!personBlocked(k.x+dx*sp,k.y))k.x+=dx*sp; if(!personBlocked(k.x,k.y+dy*sp))k.y+=dy*sp;
      k.moving=true; k.dir=Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up');
      k.t+=dt; if(k.t>150){k.t=0;k.step++}}
  }
  if(!farm.active)return;

  // escapes: fast at first, slower later
  if(farm.escapesLeft>0){farm.gapT-=dt; if(farm.gapT<=0){escapeOne(); farm.gapT=escapeGap(farm.escIdx)}}

  // loose hens: wander, and run from whoever is closest
  const chasers=[P]; if(helping)chasers.push(k);
  for(const h of farm.loose){
    let c=null,cd=1e9; for(const p of chasers){const d=Math.hypot(h.x-p.x,h.y-p.y); if(d<cd){cd=d;c=p}}
    if(h.burst){h.t-=dt; if(h.t<=0){h.burst=false;h.t=0}}
    else if(cd<FARM.FLEE_RADIUS){
      let ax=h.x-c.x, ay=h.y-c.y; const n=Math.hypot(ax,ay)||1; ax/=n; ay/=n;
      if(Math.random()<dt/700){h.jx=rand(-.8,.8);h.jy=rand(-.8,.8)} // a panicked sidestep now and then
      ax+=h.jx||0; ay+=h.jy||0; const m=Math.hypot(ax,ay)||1;
      h.vx=ax/m*FARM.FLEE_SPEED; h.vy=ay/m*FARM.FLEE_SPEED;
    } else {
      h.jx=h.jy=0; h.t-=dt;
      if(h.t<=0){h.t=rand(500,1600); const m=Math.random()<.6; h.vx=m?rand(-1,1)*FARM.WANDER_SPEED:0; h.vy=m?rand(-1,1)*FARM.WANDER_SPEED:0}
    }
    if(!henBlocked(h.x+h.vx*dt,h.y))h.x+=h.vx*dt; else if(!h.burst)h.vx*=-.5;
    if(!henBlocked(h.x,h.y+h.vy*dt))h.y+=h.vy*dt; else if(!h.burst)h.vy*=-.5;
    if(h.vx)h.f=h.vx<0?-1:1;
  }

  // catching and dropping
  const grab=(who,set)=>{const b=bodyBox(who.x,who.y); const i=farm.loose.findIndex(h=>hit(b,henBox(h))); if(i>=0)set(farm.loose.splice(i,1)[0])};
  if(!farm.carrying)grab(P,h=>{farm.carrying=h; sfx('cluck')});
  if(helping&&!k.carrying)grab(k,h=>k.carrying=h);
  const putBack=()=>{const h=penHen(); h.x=GATE.x+rand(-4,4); h.y=PEN.y+PEN.h-2; farm.penned.push(h); farm.popT=500};
  if(farm.carrying&&hit(R(P.x-4,P.y-3,8,4),DROP)){farm.carrying=null; putBack(); sfx('drop')}
  if(k.carrying&&hit(R(k.x-4,k.y-3,8,4),DROP)){k.carrying=null; putBack()}

  // win / lose
  if(farm.loose.length>=FARM.LOSE_AT){
    farmReset(); showDialog({place:KEELAN.place,speaker:KEELAN.name,pages:KEELAN.lose,actions:[CLOSE]});
  } else if(farm.penned.length>=FARM.HENS){   // everyone's home
    farm.active=false; farm.won=true; have.farmWon=true; save(); sceneMusic();
    showDialog({place:KEELAN.place,speaker:KEELAN.name,pages:KEELAN.win,actions:[{label:KEELAN.thanks,fn:()=>{closeDialog();showReward('farm')}}]});
  }
}

// Keelan's talk zone follows him around
const KEELAN_TRIGGER={label:'Talk to Keelan', btn:'Talk', act:()=>talkToKeelan()};
function farmTrigger(){
  const k=farm.keelan;
  return Math.hypot(P.x-k.x,P.y-k.y)<16?KEELAN_TRIGGER:null;
}

// ---------- HUD ----------
function farmHud(){
  if(!farm.active)return '';
  const pips=[...Array(FARM.LOSE_AT)].map((_,i)=>`<i class="${i<farm.loose.length?'on':''}"></i>`).join('');
  return `<span>Pen ${farm.penned.length}/${FARM.HENS}</span><span class="pips" title="Loose hens">Loose ${pips}</span>`;
}

// ---------- drawing ----------
function drawHen(x,y,f){
  x=Math.round(x);y=Math.round(y);
  ctx.fillStyle='rgba(0,0,0,.2)';ctx.fillRect(x-3,y+1,6,1);
  ctx.fillStyle='#fffaf0';ctx.fillRect(x-3,y-4,6,5);ctx.fillRect(x+(f>0?1:-3),y-6,2,2);
  ctx.fillStyle='#e9dfcc';ctx.fillRect(x-3,y-1,6,1);
  ctx.fillStyle='#d43b2f';ctx.fillRect(x+(f>0?2:-3),y-7,1,1);
  ctx.fillStyle='#e8a33a';ctx.fillRect(x+(f>0?3:-4),y-5,1,1);ctx.fillRect(x-1,y+1,1,1);
}
// Keelan: tall and lanky farmer, short brown hair, red plaid shirt with rolled sleeves, jeans, work boots. 10 x 24 px.
const KEELAN_PAL={H:'#5a3b24',h:'#3f2918',L:'#7a5236',S:'#e9b98f',s:'#d29f77',E:'#2b2b2b',B:'#3f2918',M:'#b5735a',P:'#c0392b',D:'#7a1f1a',l:'#e0675b',T:'#3b2a1e',Y:'#c9a24a'};
const KEELAN_SPR={
  down:["..HHLLHH..",".HHHHHHHH.",".HSBSSBSH.",".sSESSESs.","..SSssSS..","..sSMMSs..","...sSSs...",
        ".PDPPDPPD.",".DDDDDDDD.",".PDPPDPPD.",".lDllDllD.",".SDPPDPPS.",".SDPPDPPS.",".STTTYTTS."],
  right:["..HHLLHH..","..HHHHHHH.","..HHHSBSS.","..HHsSSES.","...hSSSSSS","....SSMS..","....sSs...",
        ".PDPPDPPD.",".DDDDDDDD.",".PDPPDPPD.",".lDllDllD.",".PDPPSPPD.",".PDPPSPPD.",".TTTTYTTT."],
  up:  ["..HHLLHH..",".HHHHHHHH.",".HHHHHHHH.",".sHHHHHHs.","..hHHHHh..","...hhhh...","....ss....",
        ".PDPPDPPD.",".DDDDDDDD.",".PDPPDPPD.",".lDllDllD.",".SDPPDPPS.",".SDPPDPPS.",".STTTTTTS."],
};
function drawKeelan(k){
  const x=Math.round(k.x)-5, y=Math.round(k.y)-23, F=(c,dx,dy,w,h)=>{ctx.fillStyle=c;ctx.fillRect(x+dx,y+dy,w,h)};
  F('rgba(0,0,0,.25)',1,22,8,2);
  const a=k.moving&&k.step%2?1:0, b=k.moving&&!(k.step%2)?1:0;
  const leg=(x0,lift)=>{F('#3a5f9e',x0,14,2,7-lift); F('#2c4a7c',x0+1,14,1,7-lift); F('#4d74b4',x0,15,1,2); F('#5a3a22',x0-1,21-lift,3,2); F('#7a5236',x0-1,21-lift,1,1)};   // long skinny legs, work boots
  leg(2,a); leg(6,b);
  drawSprite(ctx,x,y,KEELAN_SPR,KEELAN_PAL,k.dir||'down',3,1);
  if(k.carrying)drawHen(k.x,k.y-24,k.dir==='left'?-1:1);
}
function drawCupcake(){
  if(have.cupcake||have.gaveCupcake)return;
  const x=CUPCAKE.x-5,y=CUPCAKE.y-8, F=(c,dx,dy,w,h)=>{ctx.fillStyle=c;ctx.fillRect(x+dx,y+dy,w,h)};
  F('#e9a6c0',1,7,8,5); for(const k of [2,4,6])F('#c77a9a',k+.5|0,7,1,5);               // pink striped wrapper (mostly hidden behind the roof)
  F('#fbd3e3',3,2,4,1); F('#f7a8c8',2,3,6,1); F('#f7a8c8',1,4,8,1); F('#f7a8c8',0,5,10,1); F('#e07ba3',0,6,10,1);   // a big swirl of pink frosting
  F('#fde6ef',3,3,2,1); F('#fde6ef',2,4,2,1);                                              // shine on the frosting
  F('#f4d35e',6,4,1,1); F('#5fa8e8',3,5,1,1); F('#7fd39a',7,5,1,1); F('#ffffff',5,3,1,1);  // sprinkles
  F('#d8283c',4,0,2,2); F('#ff8a9a',4,0,1,1); F('#3f7a2e',6,-1,1,1);                       // a cherry on top
}
// a sparkle flashes beside the tree every few seconds
function drawCupcakeGlint(){
  if(have.cupcake||have.gaveCupcake||(time%2000)>500)return;
  const x=56,y=14; ctx.fillStyle='#fff3a8';
  ctx.fillRect(x,y-2,1,5); ctx.fillRect(x-2,y,5,1); ctx.fillStyle='#ffffff'; ctx.fillRect(x,y,1,1);
}
// entities for depth sorting
function farmEntities(list){
  for(const h of farm.penned)list.push({y:h.y,draw:()=>drawHen(h.x,h.y,h.f)});
  for(const h of farm.loose)list.push({y:h.y,draw:()=>drawHen(h.x,h.y,h.f)});
  list.push({y:farm.keelan.y,draw:()=>drawKeelan(farm.keelan)});
}
function farmOverlay(){
  if(farm.alertT>0&&farm.active&&farm.alertAt){const a=farm.alertAt; ctx.fillStyle='#ffd84d';ctx.fillRect(a.x-1,a.y-18,2,6);ctx.fillRect(a.x-1,a.y-10,2,2)}
  if(farm.popT>0){ctx.fillStyle='#ffd84d';ctx.font='8px monospace';ctx.fillText('+1',GATE.x-4,PEN.y+PEN.h-8-(500-farm.popT)/40)}
  drawCupcakeGlint();
}

farmReset();

// Brian, chilling by his boat. Gives you sprinkles (a bonus for the cookies).
function talkBrian(){
  const B=BRIAN;
  if(have.sprinkles)return showDialog({place:B.place,speaker:B.name,pages:B.after,actions:[CLOSE]});
  showDialog({place:B.place,speaker:B.name,pages:B.hello,actions:[{label:B.take,fn:()=>{closeDialog(); showReward('sprinkles')}}]});
}
