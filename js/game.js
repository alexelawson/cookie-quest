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
  if(fade.next){
    const was=fade.t; fade.t+=dt;
    if(was<fade.dur&&fade.t>=fade.dur)finishSwap();
    if(fade.t>=fade.dur*2){fade.next=null; paused=!dlg.hidden||!$('reward').hidden}
    return;
  }
  if(paused){updateHud();return}
  let dx=(dirs.right?1:0)-(dirs.left?1:0), dy=(dirs.down?1:0)-(dirs.up?1:0);
  P.moving=!!(dx||dy);
  if(P.moving){
    if(dx&&dy){dx*=.707;dy*=.707}
    const sp=(scene.speed?scene.speed():.07)*dt, x0=P.x, y0=P.y;
    if(!blocked(P.x+dx*sp,P.y))P.x+=dx*sp;
    if(!blocked(P.x,P.y+dy*sp))P.y+=dy*sp;
    scene.moved&&scene.moved(Math.hypot(P.x-x0,P.y-y0));
    P.dir=Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up');
    P.t+=dt; if(P.t>140){P.t=0;P.step++}
  }
  scene.update&&scene.update(dt); updateHud();
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
  if(have.crown&&scene!==SCENES.kitchen)drawCrown(x0,y0-23);   // the Cookie King
}
function drawJoeJersey(P,g=ctx){
  const x=Math.round(P.x)-6, y=Math.round(P.y)-18;
  const F=(c,dx,dy,w,h)=>{g.fillStyle=c;g.fillRect(x+dx,y+dy,w,h)};
  const skin='#f0c6a0',hair='#b08355',hairD='#8d6440',shirt='#fbfbf7',red='#c8322b',blk='#1d1d22',eye='#3d8ad6';
  F('rgba(0,0,0,.25)',2,17,8,2);
  const a=P.moving&&P.step%2?1:0, b=P.moving&&!(P.step%2)?1:0;
  F(skin,3,14,2,3-a); F(skin,7,14,2,3-b); F(blk,3,14,2,1); F(blk,7,14,2,1);
  F(blk,2,17-a,3,1); F(blk,7,17-b,3,1);
  F(blk,2,12,8,3);
  F(shirt,2,7,8,5); F(shirt,1,7,1,2); F(shirt,10,7,1,2); F(red,1,8,1,1); F(red,10,8,1,1); F('#e2e2d8',8,8,2,4); F('#e2e2d8',2,11,8,1);   // a little shading on the jersey
  F(skin,1,9,1,3); F(skin,10,9,1,3);
  F(skin,3,2,6,5);
  if(P.dir==='up'){F(hair,2,0,8,6); F(hairD,3,5,6,1); F(shirt,4,7,4,1)}
  else{
    F(hair,2,0,8,3); F('#c89a6a',3,0,3,1);   // hair highlight
    if(P.dir==='down'){F(hair,2,3,1,2);F(hair,9,3,1,2);F(hairD,3,2,4,1);F(eye,4,4,1,1);F(eye,7,4,1,1);F('#b5654f',5,6,2,1);F(red,5,7,2,1)}
    if(P.dir==='left'){F(hair,7,2,3,4);F(hairD,3,2,3,1);F(eye,3,4,1,1);F(red,3,7,2,1)}
    if(P.dir==='right'){F(hair,2,2,3,4);F(hairD,6,2,3,1);F(eye,8,4,1,1);F(red,7,7,2,1)}
  }
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
