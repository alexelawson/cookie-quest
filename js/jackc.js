// Jack C: building a little log cabin in the meadow above the kitchen, at the edge of the snow.
// Help him stack five logs with the crane and he gives you a Gingerbread House costume. Words live in story.js (JACKC).
const JACKC_SITE={x:204, y:44};                  // the middle of the cabin's foundation
const JACKC_SPOT={x:185, y:54};                  // where he stands
const CRANE={LOGS:5, LOG_W:30, LOG_H:6, GROUND:84, BASE_X:64, SWING:34, SPEEDS:[1.5,1.8,2.1,2.4,2.7], OK:11, PERFECT:2};   // per log: how fast it swings (radians a second); how far off still sits, and how close is perfect

// ---------- how he looks: shortish, medium-brown hair, a green-and-black plaid shirt, jeans, tan work boots, a tool belt with a hammer ----------
const JACKC_PAL={H:'#7a4f2e',h:'#5e3b20',S:'#f0c6a0',s:'#d9a882',E:'#2b2236',M:'#b5654f',r:'#eaa3a0',
  P:'#3f8a4e',p:'#1d2a22',w:'#2a5a34',B:'#7a4a2a',b:'#c9ced4',J:'#3a5f9e',j:'#2c4a7c'};
const JACKC_SPR={
  down:["...hHHHh...","..hHHHHHh..","..HSSSSSH..","..SESSSES..","..SrSsSrS..","...SMMMS...",
        ".PwPPwPPwP.",".wpwwpwwpw.",".PwPPwPPwP.",".SwPPwPPwS.",".SBBbBBBBS.","..JJJJJJJ..","..JJJjJJJ.."],
  up:  ["...hHHHh...","..hHHHHHh..","..HHHHHHH..","..HHHHHHH..","..hHHHHHh..","...SSSSS...",
        ".PwPPwPPwP.",".wpwwpwwpw.",".PwPPwPPwP.",".SwPPwPPwS.",".SBBBBBBBS.","..JJJJJJJ..","..JJJjJJJ.."],
};
function drawJackC(x,y,dir='down'){
  const X=Math.round(x)-5, Y=Math.round(y)-18, F=(c,dx,dy,w,h)=>{ctx.fillStyle=c;ctx.fillRect(X+dx,Y+dy,w,h)};
  F('rgba(0,0,0,.25)',1,17,9,2);
  F('#3a5f9e',2,13,3,3); F('#3a5f9e',6,13,3,3); F('#2c4a7c',4,13,1,3);                 // legs
  F('#c9a06a',1,16,4,2); F('#c9a06a',6,16,4,2); F('#8a6a3a',1,17,4,1); F('#8a6a3a',6,17,4,1);   // tan work boots
  drawSprite(ctx,X,Y,JACKC_SPR,JACKC_PAL,dir==='up'?'up':'down',3,3);
  if(dir!=='up'){F('#8a5a34',9,10,1,4); F('#9aa3b0',8,9,3,1)}                             // a hammer on the belt
}
PORTRAITS['Jack C']={size:32, bg:'#e4efe0', draw(g){ const F=px(g);
  for(let y=22;y<32;y++)for(let x=3;x<29;x++){const d=(x%4===1)+(y%4===1); F(d===2?'#1d2a22':d?'#2a5a34':'#3f8a4e',x,y,1,1)}   // plaid shirt
  F('#f0c6a0',13,19,6,4); F('#3f8a4e',11,22,4,3); F('#3f8a4e',17,22,4,3);                // neck, collar
  F('#f0c6a0',9,7,14,14); F('#d9a882',9,18,14,3); F('#f0c6a0',11,21,10,1);              // face
  F('#7a4f2e',8,3,16,6); F('#7a4f2e',7,6,3,7); F('#7a4f2e',22,6,3,7); F('#5e3b20',10,8,5,1); F('#9a6a40',12,3,6,1);   // medium-brown hair
  F('#ffffff',11,12,3,2); F('#ffffff',18,12,3,2); F('#2b2236',12,12,2,2); F('#2b2236',19,12,2,2);
  F('#5e3b20',11,10,4,1); F('#5e3b20',18,10,4,1); F('#eaa3a0',10,15,2,1); F('#eaa3a0',20,15,2,1); F('#d9a882',15,14,2,2);
  F('#b5654f',13,17,6,1); F('#b5654f',12,16,1,1); F('#b5654f',19,16,1,1);               // a big grin
  F('#e8c04a',23,7,1,6); F('#2b2236',23,6,1,1) }};                                       // a carpenter's pencil behind his ear

// ---------- his building site ----------
function drawJackSite(){
  const F=(c,x,y,w,h)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h)}, s=JACKC_SITE, x0=s.x-10, y0=s.y-6;
  F('#9aa3b0',x0-1,y0+10,22,3); F('#c9ced4',x0-1,y0+10,22,1); F('#6b7380',x0-1,y0+12,22,1);   // a stone foundation
  if(have.gingerHouseCostume){                                                               // the finished cabin
    for(let k=0;k<5;k++){F(k%2?'#8a5a34':'#a8743f',x0,y0+8-k*2,20,2); F('#d9b27a',x0-1,y0+8-k*2,1,2); F('#d9b27a',x0+20,y0+8-k*2,1,2)}
    F('#5a3a22',x0+8,y0+3,4,7); F('#fff3a8',x0+2,y0+2,3,3); F('#fff3a8',x0+15,y0+2,3,3);    // door and windows
    for(let k=0;k<7;k++)F(k%2?'#7a2a2a':'#8a3a2a',x0-2+k,y0-k,24-k*2,1); F('#5f6676',x0+15,y0-8,3,5);   // roof, chimney
    if(Math.floor(time/600)%2)F('rgba(240,240,240,.7)',x0+16,y0-11,2,2); return }
  F('#8a5a34',x0,y0+8,20,2); F('#d9b27a',x0-1,y0+8,1,2); F('#d9b27a',x0+20,y0+8,1,2);      // the first log is down
  for(const [lx,ly] of [[0,0],[4,0],[8,0],[2,-4],[6,-4],[4,-8]]){ const x=x0+2+lx, y=y0+22+ly;   // a pile of logs waiting, out front (seen end-on)
    F('#6b4428',x,y,4,4); F('#d9b27a',x,y,3,3); F('#b88a50',x+1,y+1,1,1) }
}
function drawJackCrane(){   // a small crane beside the site (until the cabin's done)
  if(have.gingerHouseCostume)return; const F=(c,x,y,w,h)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h)}, s=JACKC_SITE;
  F('#f4b400',s.x+12,s.y-26,2,30); F('#c98f00',s.x+13,s.y-26,1,30); F('#f4b400',s.x-10,s.y-26,24,2); F('#c98f00',s.x-10,s.y-25,24,1);   // a yellow crane on the right, its arm over the site
  F('#3b3b44',s.x,s.y-24,1,10+Math.round(Math.sin(time/500)*1)); F('#3b3b44',s.x-2,s.y-14,5,1);
}
function talkJackC(){
  const J=JACKC;
  if(have.gingerHouseCostume)return showDialog({place:J.place,speaker:J.name,pages:[J.after],actions:[CLOSE]});
  showDialog({place:J.place,speaker:J.name,pages:J.hello,actions:[{label:J.help,fn:()=>{closeDialog(); openCrane()}},{label:J.later,ghost:true,fn:closeDialog}]});
}
triggers.push({z:R(JACKC_SPOT.x-12,JACKC_SPOT.y-10,24,20), label:'Talk to Jack C', btn:'Talk', act:talkJackC});
solids.push(R(JACKC_SITE.x-11,JACKC_SITE.y-2,22,9), R(JACKC_SITE.x-9,JACKC_SITE.y+10,13,6), R(JACKC_SITE.x+11,JACKC_SITE.y-4,4,8), R(JACKC_SPOT.x-3,JACKC_SPOT.y-3,6,4));
{const ents=SCENES.world.ents; SCENES.world.ents=function(list){ ents.call(this,list);
  list.push({y:JACKC_SITE.y+14,draw:drawJackSite},{y:JACKC_SITE.y-1,draw:drawJackCrane},{y:JACKC_SPOT.y,draw:()=>drawJackC(JACKC_SPOT.x,JACKC_SPOT.y,'down')}) }}

// ---------- the crane game: stack five logs ----------
const cr={open:false, logs:[], t:0, raf:0, last:0, drop:null, done:false, fall:null, msgT:0};
function openCrane(){
  Object.assign(cr,{open:true, logs:[], t:0, drop:null, done:false, fall:null}); const J=JACKC;
  $('craneTitle').textContent=J.title; $('craneMsg').textContent=J.hint; $('craneBtn').textContent=J.drop; $('craneLater').textContent=J.later; $('craneLater').hidden=false;
  const f=$('craneFace'), g=f.getContext('2d'), p=PORTRAITS['Jack C']; g.fillStyle=p.bg; g.fillRect(0,0,32,32); p.draw(g);
  $('crane').hidden=false; paused=true; prompt.hidden=true; craneLoop(); setTimeout(()=>$('craneBtn').focus({preventScroll:true}),0);
}
function closeCrane(){ cr.open=false; $('crane').hidden=true; paused=overlayOpen() }
const craneTopX=()=>cr.logs.length?cr.logs[cr.logs.length-1]:CRANE.BASE_X;
const craneX=()=>CRANE.BASE_X+Math.sin(cr.t/1000*CRANE.SPEEDS[Math.min(cr.logs.length,CRANE.LOGS-1)])*CRANE.SWING;
function craneDrop(){
  if(!cr.open)return; if(cr.done){ closeCrane(); return craneWon() }
  if(cr.drop||cr.fall)return; cr.drop={x:craneX(), y:16}; sfx('click');
}
function craneTick(dt){
  cr.t+=dt;
  if(cr.drop){ const d=cr.drop, ty=CRANE.GROUND-(cr.logs.length+1)*CRANE.LOG_H; d.y+=dt*.12;
    if(d.y>=ty){ const off=d.x-craneTopX(); cr.drop=null;
      if(Math.abs(off)<=CRANE.OK){ cr.logs.push(d.x); sfx('thud'); $('craneMsg').textContent=Math.abs(off)<=CRANE.PERFECT?JACKC.perfect:JACKC.nice;
        if(cr.logs.length>=CRANE.LOGS){ cr.done=true; sfx('fanfare'); $('craneMsg').textContent=JACKC.done; $('craneBtn').textContent=JACKC.doneBtn; $('craneLater').hidden=true } }
      else { sfx('bad'); cr.fall={x:d.x, y:ty, dir:off>0?1:-1, t:0}; $('craneMsg').textContent=JACKC.off } } }
  if(cr.fall){ cr.fall.t+=dt; if(cr.fall.t>700)cr.fall=null }
}
function craneLoop(){
  if(cr.raf)return; cr.last=performance.now();
  const f=now=>{ cr.raf=0; if(!cr.open)return; const dt=Math.min(50,now-cr.last); cr.last=now; craneTick(dt); drawCrane(); cr.raf=requestAnimationFrame(f) };
  cr.raf=requestAnimationFrame(f);
}
function drawLog(g,cx,y,rot){ const F=(c,x,yy,w,h)=>{g.fillStyle=c;g.fillRect(Math.round(x),Math.round(yy),w,h)}, W=CRANE.LOG_W, H=CRANE.LOG_H, x=cx-W/2;
  if(rot){g.save(); g.translate(cx,y+H/2); g.rotate(rot); g.translate(-cx,-(y+H/2))}
  F('#8a5a34',x,y,W,H); F('#a8743f',x,y,W,2); F('#6b4428',x,y+H-1,W,1); F('#7a4a2a',x+8,y+3,6,1); F('#7a4a2a',x+18,y+2,5,1);
  F('#d9b27a',x-1,y,2,H); F('#d9b27a',x+W-1,y,2,H); F('#b88a50',x-1,y+2,2,2); F('#b88a50',x+W-1,y+2,2,2);
  if(rot)g.restore() }
function drawCrane(){
  const c=$('craneArt'), g=c.getContext('2d'), F=(col,x,y,w,h)=>{g.fillStyle=col;g.fillRect(Math.round(x),Math.round(y),w,h)}, W=c.width, H=c.height;
  g.imageSmoothingEnabled=false;
  for(let y=0;y<H;y++){F(y<40?'#a9d4f0':'#c4e4f6',0,y,W,1)}                                       // sky
  F('#6aa85a',0,CRANE.GROUND,W,H-CRANE.GROUND); F('#5a9a4a',0,CRANE.GROUND,W,1);                  // meadow
  for(const [tx,ty] of [[8,60],[118,64],[104,58]]){F('#2f6b3a',tx-4,ty,9,CRANE.GROUND-ty); F('#3f7d45',tx-3,ty-6,7,8); F('#4f8d4f',tx-2,ty-10,5,6)}   // pine trees
  F('#9aa3b0',CRANE.BASE_X-20,CRANE.GROUND-2,40,3); F('#c9ced4',CRANE.BASE_X-20,CRANE.GROUND-2,40,1);   // foundation
  // the crane: a yellow tower on the left, the arm across the top
  F('#f4b400',2,6,4,CRANE.GROUND-6); for(let y=10;y<CRANE.GROUND;y+=6)F('#c98f00',2,y,4,1); F('#f4b400',2,4,W-8,3); F('#c98f00',2,6,W-8,1);
  // Jack C cheering on the right
  { const was=ctx; ctx=g; drawJackC(112,CRANE.GROUND+1,'down'); ctx=was; if(cr.done&&Math.floor(cr.t/300)%2)F('#f4d35e',108,CRANE.GROUND-24,2,2) }
  // the walls so far
  cr.logs.forEach((x,i)=>drawLog(g,x,CRANE.GROUND-(i+1)*CRANE.LOG_H,0));
  if(cr.done){ const top=CRANE.GROUND-CRANE.LOGS*CRANE.LOG_H, cx=craneTopX(); for(let k=0;k<12;k++)F(k%2?'#7a2a2a':'#8a3a2a',cx-19+k*1.5,top-1-k,38-k*3,1); return }   // the roof goes on
  // the swinging log on its cable (or the one falling)
  const sx=craneX(), hx=cr.drop?cr.drop.x:sx;
  F('#3b3b44',hx-2,7,5,2);                                                                   // trolley
  if(!cr.drop){ F('#3b3b44',sx,9,1,7); drawLog(g,sx,16,0) }
  else { F('#3b3b44',hx,9,1,7); drawLog(g,cr.drop.x,cr.drop.y,0) }
  if(cr.fall){ const k=cr.fall.t/700; drawLog(g,cr.fall.x+cr.fall.dir*k*30,cr.fall.y+k*k*40,cr.fall.dir*k*2) }
  // a faint guide straight down from the log
  if(!cr.drop&&!cr.fall){ g.globalAlpha=.25; F('#2b2236',sx,22,1,CRANE.GROUND-cr.logs.length*CRANE.LOG_H-22); g.globalAlpha=1 }
}
function craneWon(){
  have.gingerHouseCostume=true; save(); sfx('reward'); renderBasket&&renderBasket();
  showDialog({place:JACKC.place,speaker:JACKC.name,pages:[...JACKC.thanks,JACKC.unlock],actions:[CLOSE]});
}
$('craneBtn').addEventListener('pointerdown',e=>{e.preventDefault(); craneDrop()});
$('craneBtn').addEventListener('keydown',e=>{ if(['Space','Enter'].includes(e.code)){e.preventDefault(); e.stopImmediatePropagation(); if(!e.repeat)craneDrop()} });
$('craneLater').onclick=closeCrane;
addEventListener('keydown',e=>{ if(!cr.open)return; if(e.code==='Escape'){e.preventDefault(); closeCrane(); return}
  if(['Space','Enter'].includes(e.code)&&document.activeElement!==$('craneLater')){e.preventDefault(); e.stopImmediatePropagation(); if(!e.repeat)craneDrop()} },true);
