// Movement, collision, drawing, and the main loop.
function blocked(nx,ny){
  const box=R(nx-4,ny-3,8,4);
  if(box.x<2||box.y<10||box.x+box.w>WW-2||box.y+box.h>WH-2)return true;
  return solids.some(s=>hit(box,s));
}
function update(dt){
  time+=dt;
  // ambient things run even while paused
  for(const r of rain){r.y+=dt*.25;r.x-=dt*.05;if(r.y>288){r.y=170;r.x=rnd()*170}if(r.x<0)r.x+=164}
  for(const s of snow){s.y+=dt*s.s*.12;s.x+=Math.sin((time+s.y*40)/600)*.15;if(s.y>288){s.y=170;s.x=220+rnd()*164}}
  if(Math.random()<dt/400)smoke.push({x:207,y:90,a:1});
  for(const p of smoke){p.y-=dt*.012;p.x+=dt*.004;p.a-=dt/2600} while(smoke.length&&smoke[0].a<=0)smoke.shift();
  farmAmbient(dt);
  if(paused){farmHud();return}
  let dx=(dirs.right?1:0)-(dirs.left?1:0), dy=(dirs.down?1:0)-(dirs.up?1:0);
  P.moving=!!(dx||dy);
  if(P.moving){
    if(dx&&dy){dx*=.707;dy*=.707}
    const sp=.07*dt;
    if(!blocked(P.x+dx*sp,P.y))P.x+=dx*sp;
    if(!blocked(P.x,P.y+dy*sp))P.y+=dy*sp;
    P.dir=Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up');
    P.t+=dt; if(P.t>140){P.t=0;P.step++}
  }
  farmUpdate(dt); farmHud();
  if(paused)return;  // a mission may have opened a dialog
  const feet=R(P.x-4,P.y-3,8,4);
  const t=farmTrigger()||triggers.find(tr=>hit(feet,tr.z))||null;
  if((t&&t.label)!==(near&&near.label)){near=t; prompt.hidden=!t; if(t)prompt.textContent=t.label; $('alabel').textContent=t?(t.key==='keelan'?'Talk':'Enter'):''}
  else near=t;
}

// ===================== DRAW =====================
function drawPlayer(x0,y0){
  const x=Math.round(x0)-6, y=Math.round(y0)-18;
  const F=(c,dx,dy,w,h)=>{ctx.fillStyle=c;ctx.fillRect(x+dx,y+dy,w,h)};
  const skin='#f0c6a0',hair='#b08355',hairD='#8d6440',shirt='#fbfbf7',red='#c8322b',blk='#1d1d22',eye='#3d8ad6';
  F('rgba(0,0,0,.25)',2,17,8,2);
  const a=P.moving&&P.step%2?1:0, b=P.moving&&!(P.step%2)?1:0;
  F(skin,3,14,2,3-a); F(skin,7,14,2,3-b); F(blk,3,14,2,1); F(blk,7,14,2,1);
  F(blk,2,17-a,3,1); F(blk,7,17-b,3,1);
  F(blk,2,12,8,3);
  F(shirt,2,7,8,5); F(shirt,1,7,1,2); F(shirt,10,7,1,2); F(red,1,8,1,1); F(red,10,8,1,1);
  F(skin,1,9,1,3); F(skin,10,9,1,3);
  F(skin,3,2,6,5);
  if(P.dir==='up'){F(hair,2,0,8,6); F(hairD,3,5,6,1); F(shirt,4,7,4,1)}
  else{
    F(hair,2,0,8,3);
    if(P.dir==='down'){F(hair,2,3,1,2);F(hair,9,3,1,2);F(hairD,3,2,4,1);F(eye,4,4,1,1);F(eye,7,4,1,1);F('#b5654f',5,6,2,1);F(red,5,7,2,1)}
    if(P.dir==='left'){F(hair,7,2,3,4);F(hairD,3,2,3,1);F(eye,3,4,1,1);F(red,3,7,2,1)}
    if(P.dir==='right'){F(hair,2,2,3,4);F(hairD,6,2,3,1);F(eye,8,4,1,1);F(red,7,7,2,1)}
  }
}
function draw(){
  const cx=Math.round(Math.max(0,Math.min(WW-VW,P.x-VW/2))), cy=Math.round(Math.max(0,Math.min(WH-VH,P.y-VH/2)));
  ctx.setTransform(1,0,0,1,0,0); ctx.drawImage(bg,cx,cy,VW,VH,0,0,VW,VH);
  ctx.setTransform(1,0,0,1,-cx,-cy);
  // windmill blades
  ctx.save(); ctx.translate(316,38); ctx.rotate(time/1400);
  for(let k=0;k<4;k++){ctx.rotate(Math.PI/2); ctx.fillStyle='#7a5a3c'; ctx.fillRect(-1,2,2,22); ctx.fillStyle='#f2ead8'; ctx.fillRect(1,6,6,17)}
  ctx.restore(); ctx.fillStyle='#4b3426'; ctx.fillRect(314,36,4,4);
  drawCupcake();
  // chimney smoke
  for(const p of smoke){ctx.fillStyle=`rgba(240,240,240,${Math.max(0,p.a)*.7})`;ctx.fillRect(Math.round(p.x),Math.round(p.y),3,3)}
  // people, hens and trees, back to front
  const ents=trees.map(([x,y])=>({y,draw:()=>drawTree(x,y)}));
  farmEntities(ents);
  ents.push({y:P.y,draw:()=>{drawPlayer(P.x,P.y); if(farm.carrying)drawHen(P.x,P.y-20,P.dir==='left'?-1:1)}});
  ents.sort((a,b)=>a.y-b.y).forEach(e=>e.draw());
  farmOverlay();
  // gas canopy (overhead)
  ctx.fillStyle='#c7372f';ctx.fillRect(244,184,52,6);ctx.fillStyle='#f1f4f8';ctx.fillRect(244,189,52,2);
  ctx.fillStyle='#8a8f9a';ctx.fillRect(246,191,2,14);ctx.fillRect(292,191,2,14);
  // city: dark, rain, searchlight
  ctx.save(); ctx.beginPath(); ctx.rect(0,170,164,118); ctx.clip();
  ctx.fillStyle='rgba(10,12,30,.28)'; ctx.fillRect(0,170,164,118);
  const ang=Math.sin(time/1800)*.6;
  ctx.fillStyle='rgba(255,240,180,.08)'; ctx.beginPath(); ctx.moveTo(78,288);
  ctx.lineTo(78+Math.sin(ang-.12)*220,288-Math.cos(ang-.12)*220); ctx.lineTo(78+Math.sin(ang+.12)*220,288-Math.cos(ang+.12)*220); ctx.fill();
  ctx.fillStyle='rgba(170,190,230,.55)'; for(const r of rain)ctx.fillRect(Math.round(r.x),Math.round(r.y),1,3);
  ctx.restore();
  // snow
  ctx.fillStyle='#ffffff'; for(const s of snow)ctx.fillRect(Math.round(s.x),Math.round(s.y),1,1);
}

// ===================== LOOP =====================
let last=performance.now();
function loop(now){const dt=Math.min(50,now-last);last=now;update(dt);draw();requestAnimationFrame(loop)}
renderBasket(); requestAnimationFrame(loop);
