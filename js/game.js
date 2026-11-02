// Movement, collision, scene switching, drawing, and the main loop.
let scene=SCENES.world;
const fade={t:0, dur:260, next:null};   // fade to black, swap scene, fade back in

function goTo(name,entry){
  if(fade.next)return;
  fade.next={name,entry}; fade.t=0; paused=true; prompt.hidden=true; near=null; $('alabel').textContent='';
  for(const k in dirs)dirs[k]=false;
}
function finishSwap(){
  const {name,entry}=fade.next; scene.leave&&scene.leave(); scene=SCENES[name];
  const e=scene.entries[entry]||scene.entries.start; P.x=e.x; P.y=e.y; P.dir=e.dir||'down'; P.moving=false;
  scene.enter&&scene.enter(); sceneMusic(); exitArmed=false;
}

function blocked(nx,ny,sc=scene){
  const box=sc.feet?sc.feet(nx,ny):R(nx-4,ny-3,8,4), b=sc.bounds;
  if(box.x<b.x||box.y<b.y||box.x+box.w>b.x+b.w||box.y+box.h>b.y+b.h)return true;
  // scenes with a `walk` list (rooftops) only let you stand inside those areas
  if(sc.walk){const pts=[[box.x,box.y],[box.x+box.w,box.y],[box.x,box.y+box.h],[box.x+box.w,box.y+box.h]];
    if(!pts.every(([x,y])=>sc.walk.some(w=>x>=w.x&&x<=w.x+w.w&&y>=w.y&&y<=w.y+w.h)))return true}
  return sc.solids.some(s=>hit(box,s));
}

function update(dt){
  time+=dt;
  scene.ambient&&scene.ambient(dt);   // ambient things run even while paused
  extrasAlways(dt);
  if(fade.next){
    const was=fade.t; fade.t+=dt;
    if(was<fade.dur&&fade.t>=fade.dur)finishSwap();
    if(fade.t>=fade.dur*2){fade.next=null; paused=!dlg.hidden||!$('reward').hidden}
    return;
  }
  if(paused){updateHud();peopleTick(dt);return}
  let dx=(dirs.right?1:0)-(dirs.left?1:0), dy=(dirs.down?1:0)-(dirs.up?1:0);
  P.moving=!!(dx||dy);
  if(P.moving){
    if(dx&&dy){dx*=.707;dy*=.707}
    const sp=(scene.speed?scene.speed():.07)*dt, x0=P.x, y0=P.y;
    if(!blocked(P.x+dx*sp,P.y))P.x+=dx*sp;
    if(!blocked(P.x,P.y+dy*sp))P.y+=dy*sp;
    if(scene!==SCENES.fargo||fargo.onFoot)have.steps=(have.steps||0)+Math.hypot(P.x-x0,P.y-y0)/3;   // roughly one step every 3 pixels (saved with everything else)
    scene.moved&&scene.moved(Math.hypot(P.x-x0,P.y-y0));
    P.dir=Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up');
    P.t+=dt; if(P.t>140){P.t=0;P.step++}
  }
  scene.update&&scene.update(dt); updateHud(); peopleTick(dt);
  if(paused)return;  // a mission may have opened a dialog
  extrasTick(); if(paused||fade.next)return;   // exits, picking up gear (extras.js)
  const feet=scene.feet?scene.feet(P.x,P.y):R(P.x-4,P.y-3,8,4);
  const t=(scene.dynTrigger&&scene.dynTrigger())||scene.triggers.find(tr=>hit(feet,tr.z))||null;
  if((t&&t.label)!==(near&&near.label)){prompt.hidden=!t; if(t)prompt.textContent=t.label}
  $('alabel').textContent=t?(t.btn||'Enter'):(scene.abilityLabel?scene.abilityLabel():'');
  near=t;
}

// the little status bar in the corner of the screen (hen counts, fuel...), per scene
let lastHud=null;
function updateHud(){
  $('golfRestart').hidden=!(scene===SCENES.golf&&golf.active&&!golf.practice&&(golf.state==='aim'||golf.state==='power'));
  const h=scene.hud?scene.hud():''; const el=$('hud'); el.hidden=!h;
  if(h!==lastHud){el.innerHTML=h; lastHud=h}
}

// ===================== DRAW =====================
// Joe's look on the map: the white jersey, or whatever he picked at the start (have.look)
function drawPlayer(x0,y0){
  const c={x:x0,y:y0,dir:P.dir,moving:P.moving,step:P.step};
  const look=have.look&&have.look!=='jersey'&&OUTFIT_LOOK[have.look]; if(look)drawHero(c,ctx,look); else drawJoeJersey(c,ctx);
  drawGear(c,ctx,look||null);   // Oakleys, headband, racing shoes, if he found them
  if(have.crown&&scene!==SCENES.kitchen)drawCrown(x0,y0-25);   // the Cookie King
}
// ---------- pixel-grid sprites: rows of characters, one per pixel ('.' is see-through). flip mirrors left-right. ----------
function blit(g,x,y,rows,pal,flip){
  for(let r=0;r<rows.length;r++){const row=rows[r], w=row.length;
    for(let c=0;c<w;c++){const k=row[c]; if(k==='.'||k===' ')continue; const col=pal[k]; if(!col)continue; g.fillStyle=col; g.fillRect(x+(flip?w-1-c:c),y+r,1,1)}}
}
const blinkNow=(seed=0)=>((time+seed*977)%3700)<130;   // everyone blinks now and then (seed staggers them)
// Joe in his jersey: white with red trim, brown hair. 12 x 21 px; eyes on row 4, jersey from row 7, shoes on row 19 (the gear in extras.js lines up with those)
const JOE_PAL={o:'#3b2a24',H:'#a8794c',L:'#c99a66',h:'#7d5636',S:'#f2c9a3',s:'#d9a583',B:'#6b4a2e',W:'#ffffff',E:'#3d7fc9',M:'#b5654f',J:'#fbfbf7',j:'#d6d6cc',R:'#c8322b',K:'#2a2a33',k:'#3e3e4a'};
const JOE_ROWS={
  down:["..oooooooo..",".oHHLLLHHHo.",".oHLHHHHhHo.",".oHBBSSBBHo.",".oSWESSEWSo.",".oSSSssSSSo.","..osSMMSso..",
        "oJJJJSSJJJJo","oRJJJRRJJJRo","oSJJJJJJJjSo","oSJJJJJJJjSo","osjjjjjjjjso",".oKKKKKKKKo.",".oKKKkkKKKo."],
  up:  ["..oooooooo..",".oHHLLLHHHo.",".oHHHHHHHHo.",".oHHHHHHHHo.",".oHHHHHHHHo.",".ohHHHHHHho.","..osSSSSso..",
        "oJJJJJJJJJJo","oRJJJJJJJJRo","oSJJJJJJJjSo","oSJJJJJJJjSo","osjjjjjjjjso",".oKKKKKKKKo.",".oKKKKKKKKo."],
  right:["..oooooooo..",".oHHHLLLHHo.",".oHHHHHHHHo.",".oHHHHSSBSo.",".oHHHSSSWEo.",".ohHsSSSSSSo","..ohSSSSMSo.",
        ".oJJJJJRSSJo",".oJJJJJJRRJo",".oJJJJSJJJjo",".oJJJJSJJJjo",".ojjjjsjjjjo",".oKKKKKKKKo.",".oKKKkkKKKo."],
};
function drawJoeJersey(P,g=ctx){
  const x=Math.round(P.x)-6, y=Math.round(P.y)-20, pal=JOE_PAL, dir=P.dir||'down';
  const F=(c,dx,dy,w,h)=>{g.fillStyle=c;g.fillRect(x+dx,y+dy,w,h)};
  F('rgba(0,0,0,.25)',2,19,8,2);
  const a=P.moving&&P.step%2?1:0, b=P.moving&&!(P.step%2)?1:0;
  const leg=(x0,lift,outer)=>{F(pal.o,outer,14,1,6-lift); F(pal.K,x0,14,2,1); F(pal.S,x0,15,2,3-lift); F(pal.s,x0+1,15,1,3-lift); F(pal.W,x0,18-lift,2,1); F('#1d1d22',x0-1,19-lift,3,1); F('#4a4a55',x0-1,19-lift,1,1);};
  leg(3,a,2); leg(7,b,9); F(pal.K,5,14,2,1);   // (the gap between his legs shows the ground)
  let rows=dir==='left'?JOE_ROWS.right:(JOE_ROWS[dir]||JOE_ROWS.down);
  if(blinkNow()&&dir!=='up')rows=rows.map((r,i)=>i===4?r.replace(/W/g,'s').replace(/E/g,'s'):r);
  blit(g,x,y,rows,pal,dir==='left');
}

function draw(){
  // camera follows you; scenes smaller than the screen are centered
  const cam=(p,size,view)=>size<=view?Math.round((size-view)/2):Math.round(Math.max(0,Math.min(size-view,p-view/2)));
  const cx=cam(P.x,scene.w,VW), cy=cam(P.y,scene.h,VH);
  ctx.setTransform(1,0,0,1,0,0); ctx.fillStyle='#0d0f1a'; ctx.fillRect(0,0,VW,VH);
  ctx.setTransform(1,0,0,1,-cx,-cy); ctx.drawImage(scene.bg,0,0);
  scene.under&&scene.under();
  // people, hens and furniture, back to front
  const ents=[]; scene.ents&&scene.ents(ents);
  ents.push({y:P.y,draw:()=>{(scene.drawPlayer||drawPlayer)(P.x,P.y); if(farm.carrying&&scene===SCENES.world)drawHen(P.x,P.y-20,P.dir==='left'?-1:1)}});
  const hen=henEnt(); if(hen)ents.push(hen);   // Grp the rooster, dressed for wherever Joe is (extras.js)
  ents.sort((a,b)=>a.y-b.y).forEach(e=>e.draw());
  scene.over&&scene.over();
  extrasDraw();
  if(fade.next){
    const a=fade.t<fade.dur?fade.t/fade.dur:Math.max(0,2-fade.t/fade.dur);
    ctx.setTransform(1,0,0,1,0,0); ctx.fillStyle=`rgba(8,9,16,${a})`; ctx.fillRect(0,0,VW,VH);
  }
}

// ===================== LOOP =====================
let last=performance.now();
function loop(now){const dt=Math.min(50,now-last);last=now;update(dt);draw();requestAnimationFrame(loop)}
renderBasket(); requestAnimationFrame(loop);
