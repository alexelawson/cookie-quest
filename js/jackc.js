// Jack C: building a little log cabin in the meadow above the kitchen, at the edge of the snow. He's also a woodworker.
// Help him make a cutting board at his bench (saw, glue up the stripes, plane, oil) and it's yours: the cookies get served on it,
// and Maureen and Ethan notice. Words live in story.js (JACKC).
const JACKC_SITE={x:204, y:44};                  // the middle of the cabin's foundation
const JACKC_SPOT={x:185, y:54};                  // where he stands
const WORK={ CUTS:2, SAW_SPEEDS:[1.9,2.7], SAW_OK:4, SAW_PERFECT:1, KNOT_JUMP:9,          // the saw: how fast it slides (radians a second) on each cut, how close to the line counts
  STRIPS:5, SHOW_MS:2600, PEEK_MS:900, CLAMP_AT:3, CLAMP_MS:2400,                              // the glue-up: how long the pattern shows; the clamp pops after this many strips
  STROKES:16, TOO_FAST:200, SNEEZE_AT:8,                                                       // the plane: strokes to finish; faster than this (ms) tears the grain
  OIL_RATE:.42, OIL_LO:.76, OIL_HI:.92 };                                                      // the oil: how fast it soaks in while you hold; let go between these
const WOODS=[{id:'walnut',col:'#5a3a26',lt:'#74503a',dk:'#422a1a'},{id:'maple',col:'#e6cf9e',lt:'#f2e2bc',dk:'#cdb480'},{id:'cherry',col:'#a8563a',lt:'#c06e4e',dk:'#8a4028'}];

// ---------- how he looks: shortish, clean-shaven, light-medium brown hair, a red plaid shirt, jeans, tan work boots, a tool belt with a hammer ----------
const JACKC_PAL={H:'#a4744a',h:'#86592f',S:'#f0c6a0',s:'#e3b48e',E:'#2b2236',M:'#c9786a',r:'#eaa3a0',
  P:'#c8322b',p:'#3a1414',w:'#8a1f1a',B:'#7a4a2a',b:'#c9ced4',J:'#3a5f9e',j:'#2c4a7c'};
const JACKC_SPR={
  down:["...hHHHh...","..hHHHHHh..","..HSSSSSH..","..SESSSES..","..SrSSSrS..","...sMMMs...",
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
PORTRAITS['Jack C']={size:32, bg:'#f3e6d8', draw(g){ const F=px(g);
  for(let y=22;y<32;y++)for(let x=3;x<29;x++){const d=(x%4===1)+(y%4===1); F(d===2?'#3a1414':d?'#8a1f1a':'#c8322b',x,y,1,1)}   // red plaid shirt
  F('#f0c6a0',13,19,6,4); F('#e3b48e',13,19,6,1); F('#c8322b',11,22,4,3); F('#c8322b',17,22,4,3);   // neck, collar
  F('#f0c6a0',9,7,14,13); F('#f0c6a0',10,20,12,1); F('#f0c6a0',12,21,8,1);              // face, clean-shaven, a soft round chin
  F('#a4744a',8,3,16,6); F('#a4744a',7,6,3,7); F('#a4744a',22,6,3,7); F('#86592f',10,8,5,1); F('#c4945f',12,3,6,1); F('#c4945f',9,5,3,1);   // light-medium brown hair
  F('#ffffff',11,12,3,2); F('#ffffff',18,12,3,2); F('#2b2236',12,12,2,2); F('#2b2236',19,12,2,2);
  F('#86592f',11,10,4,1); F('#86592f',18,10,4,1); F('#eaa3a0',10,15,2,1); F('#eaa3a0',20,15,2,1); F('#d9a882',15,14,2,2);
  F('#c9786a',13,17,6,1); F('#c9786a',12,16,1,1); F('#c9786a',19,16,1,1);               // a big grin
  F('#e8c04a',23,7,1,6); F('#2b2236',23,6,1,1) }};                                       // a carpenter's pencil behind his ear

// ---------- his building site ----------
function drawJackSite(){
  const F=(c,x,y,w,h)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h)}, s=JACKC_SITE, x0=s.x-10, y0=s.y-6;
  F('#9aa3b0',x0-1,y0+10,22,3); F('#c9ced4',x0-1,y0+10,22,1); F('#6b7380',x0-1,y0+12,22,1);   // a stone foundation
  if(have.board){                                                                            // the finished cabin
    for(let k=0;k<5;k++){F(k%2?'#8a5a34':'#a8743f',x0,y0+8-k*2,20,2); F('#d9b27a',x0-1,y0+8-k*2,1,2); F('#d9b27a',x0+20,y0+8-k*2,1,2)}
    F('#5a3a22',x0+8,y0+3,4,7); F('#fff3a8',x0+2,y0+2,3,3); F('#fff3a8',x0+15,y0+2,3,3);    // door and windows
    for(let k=0;k<7;k++)F(k%2?'#7a2a2a':'#8a3a2a',x0-2+k,y0-k,24-k*2,1); F('#5f6676',x0+15,y0-8,3,5);   // roof, chimney
    if(Math.floor(time/600)%2)F('rgba(240,240,240,.7)',x0+16,y0-11,2,2); return }
  F('#8a5a34',x0,y0+8,20,2); F('#d9b27a',x0-1,y0+8,1,2); F('#d9b27a',x0+20,y0+8,1,2);      // the first log is down
  for(const [lx,ly] of [[0,0],[4,0],[8,0],[2,-4],[6,-4],[4,-8]]){ const x=x0+2+lx, y=y0+22+ly;   // a pile of logs waiting, out front (seen end-on)
    F('#6b4428',x,y,4,4); F('#d9b27a',x,y,3,3); F('#b88a50',x+1,y+1,1,1) }
}
function drawJackCrane(){   // his workbench beside the site: a vise, a hand plane, boards leaning on it, a sawhorse
  const F=(c,x,y,w,h)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h)}, s=JACKC_SITE, x=s.x+11, y=s.y-6;
  F('rgba(0,0,0,.2)',x-1,y+8,10,2); F('#8a5a34',x,y+3,8,2); F('#a8743f',x,y+3,8,1); F('#6b4428',x,y+5,1,4); F('#6b4428',x+7,y+5,1,4);       // the bench
  F('#5f6676',x+6,y+1,2,2); F('#9aa3b0',x+1,y+2,3,1); F('#3b2416',x+2,y+1,1,1);                                                             // vise, plane
  F('#e6cf9e',x+9,y-2,1,10); F('#5a3a26',x+10,y-1,1,9); F('#a8563a',x+11,y,1,8);                                                            // maple, walnut and cherry boards leaning up
  if(!have.board&&Math.floor(time/700)%2)F('#f4d35e',x+3,y-2,1,1) }
function talkJackC(){
  const J=JACKC;
  if(have.board)return showDialog({place:J.place,speaker:J.name,pages:[J.after],actions:have.baked?[{label:REPLAY.jackc,fn:()=>{closeDialog(); say([[J.name,REPLAY.jackcAgain]],openCrane)}},CLOSE]:[CLOSE]});
  showDialog({place:J.place,speaker:J.name,pages:J.hello,actions:[{label:J.help,fn:()=>{closeDialog(); openCrane()}},{label:J.later,ghost:true,fn:closeDialog}]});
}
triggers.push({z:R(JACKC_SPOT.x-12,JACKC_SPOT.y-10,24,20), label:'Talk to Jack C', btn:'Talk', act:talkJackC});
solids.push(R(JACKC_SITE.x-11,JACKC_SITE.y-2,22,9), R(JACKC_SITE.x-9,JACKC_SITE.y+10,13,6), R(JACKC_SITE.x+11,JACKC_SITE.y-4,4,8), R(JACKC_SPOT.x-3,JACKC_SPOT.y-3,6,4));
{const ents=SCENES.world.ents; SCENES.world.ents=function(list){ ents.call(this,list);
  list.push({y:JACKC_SITE.y+14,draw:drawJackSite},{y:JACKC_SITE.y-1,draw:drawJackCrane},{y:JACKC_SPOT.y,draw:()=>drawJackC(JACKC_SPOT.x,JACKC_SPOT.y,'down')}) }}

// ---------- the workshop game: make a cutting board in four steps (saw, glue-up, plane, oil) ----------
// It plays in the same pop-up the old crane game used (#crane). One big button does most of it; the glue-up adds three wood buttons
// (or keys 1 2 3) and the plane adds left / right (or the arrow keys).
const wk={open:false, stage:'saw', t:0, raf:0, last:0, parts:[], shake:0, msgT:0};
const wkMsg=t=>{ $('craneMsg').textContent=t };
const wkBtn=(t,show=true)=>{ $('craneBtn').textContent=t; $('craneBtn').hidden=!show };
function wkChoices(list){   // extra buttons under the picture: [{label, key, fn, cls}]
  let row=$('craneChoices'); if(!row){ row=document.createElement('div'); row.id='craneChoices'; row.className='brow wkrow'; $('craneBtn').parentNode.before(row) }
  row.replaceChildren(...(list||[]).map(o=>{ const b=document.createElement('button'); b.className='btn wkbtn'; b.textContent=o.label; if(o.col){b.style.background=o.col; b.style.color=o.dark?'#f7efdf':'#2b2236'} b.dataset.key=o.key;
    b.addEventListener('pointerdown',e=>{e.preventDefault(); o.fn()}); return b })); row.hidden=!list||!list.length }
function openCrane(){
  const J=JACKC; Object.assign(wk,{open:true, t:0, parts:[], shake:0});
  $('craneTitle').textContent=J.title; $('craneLater').textContent=J.later; $('craneLater').hidden=false;
  const f=$('craneFace'), g=f.getContext('2d'), p=PORTRAITS['Jack C']; g.fillStyle=p.bg; g.fillRect(0,0,32,32); p.draw(g);
  $('crane').hidden=false; paused=true; prompt.hidden=true; wkStage('saw'); wkLoop(); setTimeout(()=>$('craneBtn').focus({preventScroll:true}),0);
}
function closeCrane(){ wk.open=false; $('crane').hidden=true; wkChoices(null); paused=overlayOpen() }
function wkStage(st){ const J=JACKC; wk.stage=st; wk.st=0; wkChoices(null);
  if(st==='saw'){ wk.cut=0; wk.cuts=[]; wk.line=34+Math.random()*20|0; wk.knot=null; wk.off=null; wk.sawT=0; wkMsg(J.sawHint); wkBtn(J.sawBtn) }
  if(st==='glue'){ do{ wk.pattern=[...Array(WORK.STRIPS)].map(()=>Math.random()*3|0) }while(new Set(wk.pattern).size<2);
    wk.laid=[]; wk.show=WORK.SHOW_MS; wk.clamp=0; wk.clamped=false; wk.bounce=null; wkMsg(J.glueShow); wkBtn('',false) }
  if(st==='plane'){ wk.strokes=0; wk.side=-1; wk.lastStroke=-9999; wk.planeX=0; wk.sneezed=false; wkMsg(J.planeHint); wkBtn('',false);
    wkChoices([{label:'◀',key:'ArrowLeft',fn:()=>wkStroke(-1)},{label:'▶',key:'ArrowRight',fn:()=>wkStroke(1)}]) }
  if(st==='oil'){ wk.oil=0; wk.holding=false; wkMsg(J.oilHint); wkBtn(J.oilBtn) }
  if(st==='done'){ sfx('fanfare'); wkMsg(J.done); wkBtn(J.doneBtn); $('craneLater').hidden=true; for(let k=0;k<26;k++)wk.parts.push({x:40+Math.random()*48,y:44+Math.random()*14,vx:(Math.random()-.5)*.03,vy:-.02-Math.random()*.03,c:'#f4d35e',life:900+Math.random()*700}) }
}
const sawX=()=>64+Math.sin(wk.sawT/1000*WORK.SAW_SPEEDS[wk.cut])*46;
// the big button (also Space / Enter)
function craneDrop(down=true){ const J=JACKC;
  if(!wk.open)return;
  if(wk.stage==='done'){ if(down){ closeCrane(); craneWon() } return }
  if(wk.stage==='saw'&&down){ if(wk.off)return; const x=sawX(), target=wk.cut?128-wk.line:wk.line, d=Math.abs(x-target);
    if(d<=WORK.SAW_OK){ sfx('thud'); wk.cuts.push(x); wk.off={x,side:wk.cut?1:-1,t:0}; for(let k=0;k<10;k++)wk.parts.push({x,y:52,vx:(Math.random()-.5)*.05,vy:-.03-Math.random()*.04,c:'#e6cf9e',life:500});
      wkMsg(d<=WORK.SAW_PERFECT?J.sawPerfect:J.sawNice) }
    else { sfx('bad'); wk.shake=250; wkMsg(J.sawOff) } return }
  if(wk.stage==='glue'&&down&&wk.clamp>0){ wk.clamp=0; wk.clamped=true; sfx('click'); wkMsg(J.clampSaved); wkGlueButtons(); return }
  if(wk.stage==='oil'){ if(down){ wk.holding=true; return }
    if(!wk.holding)return; wk.holding=false;
    if(wk.oil>=WORK.OIL_LO&&wk.oil<=WORK.OIL_HI){ sfx('pickup'); return wkStage('done') }
    wkMsg(wk.oil<WORK.OIL_LO?J.oilMore:J.oilHint) }
}
function wkGlueButtons(){ wkChoices(WOODS.map((w,i)=>({label:JACKC.woods[i], key:'Digit'+(i+1), col:w.col, dark:i!==1, fn:()=>wkLay(i)}))) }
function wkLay(i){ const J=JACKC; if(wk.stage!=='glue'||wk.show>0||wk.clamp>0)return;
  if(i===wk.pattern[wk.laid.length]){ wk.laid.push(i); sfx('click'); wk.slide=180;
    if(wk.laid.length>=WORK.STRIPS){ wkChoices(null); wkMsg(J.glueDone); wk.st=1; wk.wait=900; return }
    if(wk.laid.length===WORK.CLAMP_AT&&!wk.clamped){ wk.clamp=WORK.CLAMP_MS; sfx('bad'); wk.shake=300; wkMsg(J.clampPop); wkChoices(null); wkBtn(J.clampBtn); return }
    wkMsg(J.glueNice) }
  else { sfx('bad'); wk.bounce={i,t:0}; wk.show=WORK.PEEK_MS; wkMsg(J.glueWrong); wkChoices(null) } }
function wkStroke(dir){ const J=JACKC; if(wk.stage!=='plane'||wk.st)return;
  const dt=wk.t-wk.lastStroke;
  if(dir!==wk.side){ sfx('bad'); wkMsg(J.planeWrong); return }
  wk.lastStroke=wk.t;
  if(dt<WORK.TOO_FAST){ wk.strokes=Math.max(0,wk.strokes-2); sfx('bad'); wk.shake=200; wkMsg(J.planeFast); wk.side=-wk.side; return }
  wk.strokes++; wk.planeDir=dir; wk.planeT=220; sfx('whoosh'); for(let k=0;k<3;k++)wk.parts.push({x:64+dir*20,y:50,vx:dir*(.02+Math.random()*.03),vy:-.03-Math.random()*.03,c:k%2?'#f2e2bc':'#e6cf9e',life:700,curl:true});
  if(wk.strokes>=WORK.STROKES){ wkChoices(null); wkMsg(J.planeDone); wk.st=1; wk.wait=900; return }
  if(wk.strokes===WORK.SNEEZE_AT&&!wk.sneezed){ wk.sneezed=true; wk.shake=500; sfx('alarm'); wkMsg(J.sneeze); for(let k=0;k<30;k++)wk.parts.push({x:64+(Math.random()-.5)*50,y:46,vx:(Math.random()-.5)*.08,vy:-.02-Math.random()*.06,c:'#e6cf9e',life:900}); wk.side=Math.random()<.5?-1:1; return }   // sawdust: Joe sneezes and loses his place (watch the arrow)
  wk.side=-wk.side; wkMsg(J.planeGo) }
function craneTick(dt){ const J=JACKC; wk.t+=dt; if(wk.shake>0)wk.shake-=dt;
  for(const p of wk.parts){ p.x+=p.vx*dt; p.y+=p.vy*dt; p.vy+=.00012*dt; p.life-=dt } wk.parts=wk.parts.filter(p=>p.life>0);
  if(wk.stage==='saw'){ if(!wk.off){ const before=sawX(); wk.sawT+=dt; if(wk.cut===1){ const kx=wk.knotX=86, a=sawX(); if((before-kx)*(a-kx)<0)wk.sawT+=WORK.KNOT_JUMP*18 } }   // the knot: the saw skips as it crosses it
    else { wk.off.t+=dt; if(wk.off.t>650){ wk.off=null; wk.cut++; if(wk.cut>=WORK.CUTS)wkStage('glue'); else { wk.sawT=0; wkMsg(J.sawKnot) } } } }
  if(wk.stage==='glue'){ if(wk.slide>0)wk.slide-=dt; if(wk.bounce){wk.bounce.t+=dt; if(wk.bounce.t>500)wk.bounce=null}
    if(wk.show>0){ wk.show-=dt; if(wk.show<=0&&!wk.st){ wkMsg(J.glueGo); wkBtn('',false); wkGlueButtons() } }
    if(wk.clamp>0){ wk.clamp-=dt; if(wk.clamp<=0){ wk.laid.pop(); sfx('thud'); wkMsg(J.clampLost); wkBtn('',false); wkGlueButtons() } }
    else if($('craneBtn').textContent===J.clampBtn&&!$('craneBtn').hidden)wkBtn('',false);
    if(wk.st&&(wk.wait-=dt)<=0)wkStage('plane') }
  if(wk.stage==='plane'){ if(wk.planeT>0)wk.planeT-=dt; if(wk.st&&(wk.wait-=dt)<=0)wkStage('oil') }
  if(wk.stage==='oil'&&wk.holding){ wk.oil+=dt/1000*WORK.OIL_RATE; if(Math.floor((wk.oil-dt/1000*WORK.OIL_RATE)*12)!==Math.floor(wk.oil*12))sfx('click');
    if(wk.oil>1){ wk.holding=false; wk.oil=.45; sfx('bad'); wk.shake=300; wkMsg(J.oilOver); for(let k=0;k<14;k++)wk.parts.push({x:44+Math.random()*40,y:56,vx:0,vy:.02+Math.random()*.02,c:'#c98a3a',life:700}) } }
}
function wkLoop(){
  if(wk.raf)return; wk.last=performance.now();
  const f=now=>{ wk.raf=0; if(!wk.open)return; const dt=Math.min(50,now-wk.last); wk.last=now; craneTick(dt); drawCrane(); wk.raf=requestAnimationFrame(f) };
  wk.raf=requestAnimationFrame(f);
}
// a cutting board, striped: (x,y) its top left; strips run left to right. shine 0..1 = how oiled it is
function drawBoard(g,x,y,w,h,pattern,shine=0,n=pattern.length){ const F=(c,xx,yy,ww,hh)=>{g.fillStyle=c;g.fillRect(Math.round(xx),Math.round(yy),ww,hh)}, sh=h/pattern.length;
  for(let k=0;k<n;k++){ const W=WOODS[pattern[k]], yy=y+Math.round(k*sh), hh=Math.round((k+1)*sh)-Math.round(k*sh); F(W.col,x,yy,w,hh); F(W.lt,x,yy,w,1); for(let i=3;i<w-2;i+=7)F(W.dk,x+i+(k*3)%5,yy+1+(i%2),3,1) }
  if(shine>0){ g.globalAlpha=shine*.35; F('#ffb347',x,y,w,Math.round(n*sh)); g.globalAlpha=shine*.5; F('#fff3d0',x+2,y+1,w-4,1); F('#fff3d0',x+4,y+3,Math.round(w/3),1); g.globalAlpha=1 } }
function drawCrane(){
  const c=$('craneArt'), g=c.getContext('2d'), W=c.width, H=c.height, J=JACKC; g.imageSmoothingEnabled=false; g.setTransform(1,0,0,1,0,0);
  const sx=wk.shake>0?Math.round(Math.sin(wk.t/22)*2):0; g.translate(sx,0);
  const F=(col,x,y,w,h)=>{g.fillStyle=col;g.fillRect(Math.round(x),Math.round(y),w,h)};
  // the workshop: plank walls, a window onto the snow, a pegboard of tools, a lamp, the bench
  F('#b98a58',-4,0,W+8,66); for(let x=-4;x<W+4;x+=12){F('#a87a4a',x,0,1,66); F('#c79a66',x+1,0,1,66)} for(let i=0;i<14;i++)F('#a87a4a',(i*37)%W,(i*23)%60,3,1);
  F('#3b2a1e',8,8,30,24); F('#cfe6f5',10,10,26,20); F('#e9f2f8',10,24,26,6); F('#3b2a1e',22,10,2,20); F('#3b2a1e',10,19,26,2); for(let k=0;k<6;k++)F('#ffffff',12+(k*9+Math.floor(wk.t/260))%22,11+(k*7+Math.floor(wk.t/130))%12,1,1);   // window: it's snowing
  F('#2f6b3a',13,22,3,8); F('#2f6b3a',30,20,3,10);
  F('#6b4a2f',78,8,42,26); F('#7a5838',79,9,40,24); for(let x=82;x<118;x+=6)for(let y=12;y<32;y+=6)F('#5a3d26',x,y,1,1);                           // pegboard
  F('#9aa3b0',84,12,2,12); F('#5a3a22',83,22,4,6); F('#9aa3b0',92,12,10,2); F('#5a3a22',92,14,3,8); F('#c8322b',106,12,3,10); F('#9aa3b0',112,12,1,14); F('#f4d35e',111,24,3,4);   // chisel, saw, level, a square
  F('#3b3b44',60,0,1,8); F('#2b2e36',55,8,11,4); F('#ffe9a8',57,12,7,1); g.globalAlpha=.10; F('#ffe9a8',40,13,48,53); g.globalAlpha=1;               // a hanging lamp
  F('#6b4a2f',-4,66,W+8,H-66); for(let x=-4;x<W+4;x+=16)F('#5a3d26',x,66,1,H-66); F('#7f5a3a',-4,66,W+8,1);                                         // floor
  F('#8a5a34',10,60,96,6); F('#a8743f',10,60,96,1); F('#6b4428',10,65,96,1); F('#6b4428',14,66,5,22); F('#6b4428',97,66,5,22); F('#5a3a22',14,78,88,3);   // the bench
  F('#5f6676',12,54,6,6); F('#9aa3b0',12,54,6,1); F('#3b3b44',9,56,3,2);                                                                             // a vise on the end
  for(const [x,y] of [[30,88],[70,90],[52,86],[90,87],[22,91]])F('#e6cf9e',x,y,3,1);                                                                 // shavings on the floor
  { const was=ctx; ctx=g; drawJackC(118,90,'down'); ctx=was; if(wk.stage==='done'&&Math.floor(wk.t/300)%2)F('#f4d35e',114,64,2,2) }                   // Jack C, watching
  // the step dots
  ['saw','glue','plane','oil'].forEach((s,i)=>{ const on=['saw','glue','plane','oil','done'].indexOf(wk.stage); F(i<on?'#4fbf73':i===on?'#f4d35e':'#5a3d26',50+i*8,3,5,3) });
  if(wk.stage==='saw'){
    const x0=18, x1=110, y=50, kept0=wk.cuts[0]||x0, kept1=wk.cuts[1]||x1;
    F('rgba(0,0,0,.2)',kept0+1,y+9,kept1-kept0,1); F('#e6cf9e',kept0,y,kept1-kept0,9); F('#f2e2bc',kept0,y,kept1-kept0,1); F('#cdb480',kept0,y+8,kept1-kept0,1); for(let i=kept0+4;i<kept1-4;i+=9)F('#cdb480',i,y+3+(i%3),5,1);   // the maple board
    if(wk.cut===1){ F('#8a5a34',wk.knotX-2,y+3,4,3); F('#5a3a22',wk.knotX-1,y+4,2,1) }                                                              // a knot
    const target=wk.cut?128-wk.line:wk.line; if(!wk.off){ for(let k=0;k<9;k+=2)F('#3b3b44',target,y+k,1,1); F('#c8322b',target-1,y-3,3,2) }          // the pencil line, a little arrow
    if(wk.off){ const k=wk.off.t/650, ox=wk.off.side<0?x0:wk.off.x, ow=wk.off.side<0?wk.off.x-x0:x1-wk.off.x; F('#e6cf9e',ox+wk.off.side*k*8,y+k*k*40,ow,9) }
    const sxw=wk.off?wk.off.x:sawX(), bob=wk.off?0:Math.round(Math.sin(wk.t/60)*1.5);                                                              // the hand saw
    F('#c9ced4',sxw,y-16+bob,2,22); F('#e9eef3',sxw,y-16+bob,1,22); for(let k=0;k<22;k+=2)F('#8a8f9a',sxw+2,y-16+bob+k,1,1); F('#8a5a34',sxw-2,y-24+bob,6,9); F('#5a3a22',sxw,y-22+bob,2,5);
  }
  if(wk.stage==='glue'){
    const bx=34, by=40, bw=60, bh=20;
    F('#5f6676',bx-6,by-3,4,bh+6); F('#9aa3b0',bx-6,by-3,1,bh+6); F('#5f6676',bx+bw+2,by-3,4,bh+6); F('#3b3b44',bx-8,by+bh/2-1,2,3);                       // the clamps
    if(wk.clamp>0){ const k=Math.floor(wk.t/90)%2; F('#c8322b',bx+bw+2+k*3,by-5-k*2,5,bh+6); F('#f4d35e',bx+bw+10,by-8,2,2); F('#f4d35e',bx+bw+13,by-3,2,2) }   // one's popping off!
    F('#3b2a1e',bx-1,by-1,bw+2,bh+2); F('#2b2018',bx,by,bw,bh);
    drawBoard(g,bx,by,bw,bh,wk.pattern,0,wk.laid.length);
    if(wk.slide>0&&wk.laid.length){ const k=wk.laid.length-1, W=WOODS[wk.laid[k]]; F(W.lt,bx-Math.round(wk.slide/6),by+k*4,6,4) }
    for(let k=0;k<wk.laid.length-1;k++)F('#f6f0dc',bx,by+(k+1)*4-1+((k%2)?0:0),bw,1), g.globalAlpha=1;                                               // glue lines
    if(wk.bounce){ const k=wk.bounce.t/500, W=WOODS[wk.bounce.i]; F(W.col,bx+bw*.3+k*40,by+wk.laid.length*4-k*30+k*k*50,30,4) }
    if(wk.show>0){ F('#fffdf6',40,12,48,24); F('#3b3b44',40,12,48,1); F('#c8322b',62,10,4,3); drawBoard(g,44,15,40,18,wk.pattern,0); for(let k=0;k<WORK.STRIPS;k++)pixText(g,String(k+1),36-0,15+k*3.6|0,'#3b2a1e') }   // Jack's drawing, pinned up: remember it!
    else { F('#fffdf6',40,12,48,24); F('#3b3b44',40,12,48,1); F('#c8322b',62,10,4,3); for(let k=0;k<WORK.STRIPS;k++){ const yy=15+Math.round(k*3.6); if(k<wk.laid.length){const Wd=WOODS[wk.pattern[k]]; F(Wd.col,44,yy,40,4)} else { F('#e6dcc4',44,yy,40,3); if(k===wk.laid.length&&Math.floor(wk.t/300)%2)F('#f4d35e',44,yy,40,3) } } }   // (the drawing's gone: blanks, the next one blinking)
  }
  if(wk.stage==='plane'){
    const bx=34, by=44, bw=60, bh=14, k=wk.strokes/WORK.STROKES;
    drawBoard(g,bx,by,bw,bh,wk.pattern,0); g.globalAlpha=(1-k)*.55; for(let i=0;i<40;i++)F(i%2?'#3b2a1e':'#f6f0dc',bx+(i*17)%bw,by+(i*7)%bh,3,1); g.globalAlpha=1;   // rough and gluey, until it's planed
    const px=64+(wk.planeT>0?wk.planeDir*(1-wk.planeT/220)*22:0)-9;
    F('#3b3b44',px,by-7,18,5); F('#9aa3b0',px,by-7,18,1); F('#8a5a34',px+2,by-13,5,6); F('#8a5a34',px+12,by-11,4,4); F('#c9ced4',px+8,by-3,3,2);            // the hand plane
    if(!wk.st){ const d=wk.side, cx=d<0?20:108, on=Math.floor(wk.t/200)%2, col=on?'#f4d35e':'#c9a640'; F('#3b2a1e',cx-9,40,18,13); F(col,cx-5+(d<0?3:0),45,8,3); for(let i=0;i<5;i++)F(col,d<0?cx-6+i:cx+5-i,46-i,1,1+i*2) }   // which way next: a big arrow on that side
    F('#3b2a1e',34,70,60,5); F('#4fbf73',35,71,Math.round(58*k),3);
  }
  if(wk.stage==='oil'||wk.stage==='done'){
    const bx=34, by=42, bw=60, bh=18, o=wk.stage==='done'?1:Math.min(1,wk.oil);
    F('rgba(0,0,0,.25)',bx+2,by+bh,bw,2); drawBoard(g,bx,by,bw,bh,wk.pattern,o); F('#3b2a1e',bx+bw-6,by+bh/2-2,3,3);                                       // (a hole to hang it by)
    if(wk.stage==='oil'){ if(wk.holding){ const rx=bx+8+(Math.sin(wk.t/140)+1)*20; F('#f2efe6',rx,by+4+Math.round(Math.sin(wk.t/90)*3),12,8); F('#d9d5ca',rx,by+10+Math.round(Math.sin(wk.t/90)*3),12,2) }
      F('#5a3a22',16,40,8,14); F('#c98a3a',17,44,6,9); F('#3b2a1e',18,37,4,3);                                                                           // the oil bottle
      F('#3b2a1e',104,20,8,44); F('#2b2018',105,21,6,42); const lo=63-Math.round(42*WORK.OIL_LO), hi=63-Math.round(42*WORK.OIL_HI); F('#4fbf73',105,hi,6,lo-hi); F('#c98a3a',105,63-Math.round(42*Math.min(1,wk.oil)),6,Math.round(42*Math.min(1,wk.oil))); F('#f4d35e',103,hi,10,1); F('#f4d35e',103,lo,10,1) }   // the gauge: let go in the green
    else if(Math.floor(wk.t/250)%2){ F('#ffffff',bx+8,by+2,1,3); F('#ffffff',bx+7,by+3,3,1); F('#ffffff',bx+44,by+12,1,3); F('#ffffff',bx+43,by+13,3,1) }
  }
  for(const p of wk.parts){ g.globalAlpha=Math.min(1,p.life/300); F(p.c,p.x,p.y,p.curl?2:1,p.curl?2:1); if(p.curl)F(p.c,p.x+1,p.y-1,1,1) } g.globalAlpha=1;
  g.setTransform(1,0,0,1,0,0);
}
function craneWon(){
  const again=!!have.board; have.boardPattern=wk.pattern.slice(); save(); sfx('reward');
  if(again)return showDialog({place:JACKC.place,speaker:JACKC.name,pages:[JACKC.thanks[0]],actions:[CLOSE]});
  say(JACKC.thanks.map(t=>[JACKC.name,t,'Jack C']),()=>showReward('board'));
}
$('craneBtn').addEventListener('pointerdown',e=>{e.preventDefault(); craneDrop(true)});
for(const ev of ['pointerup','pointerleave','pointercancel'])$('craneBtn').addEventListener(ev,()=>craneDrop(false));
$('craneLater').onclick=closeCrane;
addEventListener('keydown',e=>{ if(!wk.open)return; if(e.code==='Escape'){e.preventDefault(); closeCrane(); return}
  const b=[...document.querySelectorAll('#craneChoices button')].find(b=>b.dataset.key===e.code||(b.dataset.key==='ArrowLeft'&&e.code==='KeyA')||(b.dataset.key==='ArrowRight'&&e.code==='KeyD')||(e.code==='Numpad'+(b.dataset.key||'').slice(-1)));
  if(b){ e.preventDefault(); e.stopImmediatePropagation(); if(!e.repeat)b.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,cancelable:true})); return }
  if(['Space','Enter'].includes(e.code)&&document.activeElement!==$('craneLater')){e.preventDefault(); e.stopImmediatePropagation(); if(!e.repeat)craneDrop(true)} },true);
addEventListener('keyup',e=>{ if(wk.open&&['Space','Enter'].includes(e.code))craneDrop(false) },true);
