// Jack C: building a little log cabin in the meadow above the kitchen, at the edge of the snow. He's also a woodworker.
// His best maple plank is buried in the lumber yard. Slide the logs out of the way to get it out (three yards, a sliding-block puzzle)
// and he turns it into a cutting board for you: the cookies get served on it, and Maureen and Ethan notice. Words live in story.js (JACKC).
const JACKC_SITE={x:204, y:44};                  // the middle of the cabin's foundation
const JACKC_SPOT={x:185, y:54};                  // where he stands
// The lumber yard puzzle. Each yard is a 6 x 6 grid; a piece is [x, y, length, 'h' or 'v', kind]: 'p' the maple plank (always first, always on
// row 2: it has to slide out the gate on the right), 'l' a log (slides only along its length), 's' a stump (never moves).
// par is the fewest moves it can be done in (worked out by a solver; sliding one piece any distance is one move).
const YARDS=[
  {par:6,  p:[[1,2,2,'h','p'],[1,5,3,'h','l'],[3,1,3,'v','l'],[3,4,2,'h','l'],[4,0,2,'h','l'],[0,4,2,'h','l'],[4,2,2,'v','l'],[0,3,3,'h','l']]},
  {par:11, p:[[0,2,2,'h','p'],[4,0,1,'h','s'],[3,1,3,'v','l'],[0,4,2,'v','l'],[4,3,2,'h','l'],[3,5,2,'h','l'],[5,0,3,'v','l'],[4,1,2,'v','l'],[2,1,2,'v','l'],[3,4,3,'h','l']]},
  {par:14, p:[[1,2,2,'h','p'],[3,3,1,'h','s'],[3,0,2,'h','l'],[2,0,2,'v','l'],[5,1,3,'v','l'],[0,1,2,'v','l'],[4,1,2,'v','l'],[4,4,2,'h','l'],[2,5,3,'h','l'],[0,4,3,'h','l'],[3,1,2,'v','l']]},
];
const YARD={N:6, CELL:13, OX:14, OY:9, HINTS:3};                                              // grid size, a cell in px, where the grid sits in the picture, hints per yard
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

// ---------- the lumber yard: slide the logs to free the maple plank (three yards) ----------
// It plays in the #crane pop-up. Touch: drag a log. Keys: arrows slide the chosen log along its length; an arrow across it picks the
// next log over that way. The big button asks Jack for a hint (the next move flashes); "Start over" resets the yard.
const yd={open:false, lvl:0, ps:[], sel:0, moves:0, hints:0, hint:null, t:0, raf:0, last:0, won:0, drag:null, parts:[]};
const ydAt=(ps,x,y)=>ps.findIndex(p=>p.dir==='h'?(y===p.y&&x>=p.x&&x<p.x+p.len):(x===p.x&&y>=p.y&&y<p.y+p.len));
function ydRange(ps,i){ const p=ps[i], N=YARD.N; if(p.kind==='s')return [0,0]; let lo=0, hi=0;   // how far piece i can slide: [cells back, cells forward]
  const free=(x,y)=>x>=0&&y>=0&&x<N&&y<N&&ydAt(ps,x,y)<0;
  while(p.dir==='h'?free(p.x-lo-1,p.y):free(p.x,p.y-lo-1))lo++;
  while(p.dir==='h'?(free(p.x+p.len+hi,p.y)||(p.kind==='p'&&p.x+p.len+hi>=N&&hi<p.len+N)):free(p.x,p.y+p.len+hi))hi++;                 // (the plank can carry on out through the gate)
  return [lo,hi] }
function ydSolve(ps0){   // breadth-first search for the shortest way out: returns the first move [piece, new position], or null
  const N=YARD.N, base=ps0.map(p=>({...p})), pos=p=>p.dir==='h'?p.x:p.y, key=s=>s.join(','), start=base.map(pos), seen=new Set([key(start)]); let q=[[start,null]];
  for(let d=0;d<40&&q.length;d++){ const nq=[]; for(const [s,first] of q){ if(s[0]+base[0].len>=N)return first;
      const cur=base.map((p,i)=>({...p,[p.dir==='h'?'x':'y']:s[i]}));
      cur.forEach((p,i)=>{ if(p.kind==='s')return; const [lo,hi]=ydRange(cur,i); for(let k=-lo;k<=Math.min(hi,N-p.len-s[i]+(i?0:0));k++){ if(!k)continue; const ns=s.slice(); ns[i]=s[i]+k; if(ns[i]+p.len>N)continue; const kk=key(ns); if(!seen.has(kk)){seen.add(kk); nq.push([ns,first||[i,ns[i]]])} } }) }
    q=nq } return null }
function ydLoad(n){ const J=JACKC, Y=YARDS[n]; yd.lvl=n; yd.ps=Y.p.map(([x,y,len,dir,kind])=>({x,y,len,dir,kind,dx:0,dy:0})); yd.sel=0; yd.moves=0; yd.lastMv=null; yd.hints=YARD.HINTS; yd.hint=null; yd.won=0; yd.out=0;
  wkMsg(J.yards[n]); ydButtons() }
function ydButtons(){ const J=JACKC; $('craneBtn').hidden=false; $('craneBtn').textContent=yd.won?(yd.lvl<YARDS.length-1?J.next:J.doneBtn):J.hintBtn.replace('{n}',yd.hints);
  wkChoices(yd.won?null:[{label:J.reset,key:'KeyR',fn:()=>{ydLoad(yd.lvl); sfx('click')}}]); $('craneLater').hidden=!!yd.won&&yd.lvl===YARDS.length-1 }
function openCrane(){
  const J=JACKC; Object.assign(yd,{open:true,t:0,parts:[]}); $('craneTitle').textContent=J.title; $('craneLater').textContent=J.later;
  const f=$('craneFace'), g=f.getContext('2d'), p=PORTRAITS['Jack C']; g.fillStyle=p.bg; g.fillRect(0,0,32,32); p.draw(g);
  $('crane').hidden=false; paused=true; prompt.hidden=true; ydLoad(0); ydLoop(); setTimeout(()=>$('craneBtn').focus({preventScroll:true}),0);
}
function closeCrane(){ yd.open=false; $('crane').hidden=true; wkChoices(null); paused=overlayOpen() }
const wkMsg=t=>{ $('craneMsg').textContent=t };
function wkChoices(list){   // extra buttons under the picture: [{label, key, fn}]
  let row=$('craneChoices'); if(!row){ row=document.createElement('div'); row.id='craneChoices'; row.className='brow wkrow'; $('craneBtn').parentNode.before(row) }
  row.replaceChildren(...(list||[]).map(o=>{ const b=document.createElement('button'); b.className=$('craneLater').className+' wkbtn'; b.textContent=o.label; b.dataset.key=o.key; b.addEventListener('click',e=>{e.preventDefault(); o.fn()}); return b })); row.hidden=!list||!list.length }
// slide piece i by k cells (negative = left / up). Returns true if it moved
function ydMove(i,k){ const J=JACKC; if(yd.won||!k)return false; const p=yd.ps[i], [lo,hi]=ydRange(yd.ps,i); k=Math.max(-lo,Math.min(hi,k)); if(!k){ sfx('bad'); p.bump=160; return false }
  if(p.dir==='h'){p.x+=k; p.dx=-k*YARD.CELL} else {p.y+=k; p.dy=-k*YARD.CELL}
  if(!(yd.lastMv&&yd.lastMv.i===i&&yd.lastMv.s===Math.sign(k)))yd.moves++; yd.lastMv={i,s:Math.sign(k)}; yd.sel=i; yd.hint=null;   // (sliding the same log further the same way is still one move) sfx(p.kind==='p'?'click':'thud');
  if(p.kind==='p'&&p.x+p.len>=YARD.N){ yd.won=1; yd.out=0; sfx('fanfare'); const par=YARDS[yd.lvl].par;
    wkMsg((yd.moves<=par?J.wonPar:J.won).replace('{n}',yd.moves).replace('{par}',par)+(yd.lvl===YARDS.length-1?' '+J.done:'')); ydButtons();
    for(let n=0;n<24;n++)yd.parts.push({x:100+Math.random()*10,y:38+Math.random()*10,vx:(Math.random()-.3)*.05,vy:-.02-Math.random()*.05,c:n%2?'#f4d35e':'#e6cf9e',life:700+Math.random()*600}) }
  else if(yd.moves===YARDS[yd.lvl].par+6)wkMsg(J.nudge);
  return true }
function craneDrop(){ const J=JACKC;   // the big button: a hint, or on to the next yard
  if(!yd.open)return;
  if(yd.won){ if(yd.lvl<YARDS.length-1){ ydLoad(yd.lvl+1); sfx('pickup') } else { closeCrane(); craneWon() } return }
  if(yd.hints<=0){ wkMsg(J.noHints); sfx('bad'); return }
  const m=ydSolve(yd.ps); if(!m)return; yd.hints--; yd.hint={i:m[0],to:m[1],t:0}; yd.sel=m[0]; sfx('pickup'); wkMsg(J.hintSay); ydButtons() }
function ydKey(code){ const d={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1],KeyA:[-1,0],KeyD:[1,0],KeyW:[0,-1],KeyS:[0,1]}[code]; if(!d||yd.won)return false;
  const p=yd.ps[yd.sel]; if(p.kind!=='s'&&((p.dir==='h'&&d[0])||(p.dir==='v'&&d[1]))){ ydMove(yd.sel,d[0]||d[1]); return true }
  // across the log: pick the nearest log over that way
  const cx=q=>q.x+(q.dir==='h'?q.len/2:.5), cy=q=>q.y+(q.dir==='v'?q.len/2:.5); let best=-1, bd=1e9;
  yd.ps.forEach((q,i)=>{ if(i===yd.sel||q.kind==='s')return; const ax=(cx(q)-cx(p))*d[0]+(cy(q)-cy(p))*d[1], off=Math.abs((cx(q)-cx(p))*d[1])+Math.abs((cy(q)-cy(p))*d[0]); if(ax>.2){ const s=ax+off*1.6; if(s<bd){bd=s; best=i} } });
  if(best>=0){ yd.sel=best; sfx('click') } return true }
function craneTick(dt){ yd.t+=dt;
  for(const p of yd.ps){ p.dx*=Math.pow(.004,dt/1000*6); p.dy*=Math.pow(.004,dt/1000*6); if(Math.abs(p.dx)<.3)p.dx=0; if(Math.abs(p.dy)<.3)p.dy=0; if(p.bump>0)p.bump-=dt }
  if(yd.hint)yd.hint.t+=dt; if(yd.won)yd.out+=dt;
  for(const q of yd.parts){ q.x+=q.vx*dt; q.y+=q.vy*dt; q.vy+=.00012*dt; q.life-=dt } yd.parts=yd.parts.filter(q=>q.life>0) }
function ydLoop(){ if(yd.raf)return; yd.last=performance.now();
  const f=now=>{ yd.raf=0; if(!yd.open)return; const dt=Math.min(50,now-yd.last); yd.last=now; craneTick(dt); drawCrane(); yd.raf=requestAnimationFrame(f) }; yd.raf=requestAnimationFrame(f) }
// a cutting board, striped: (x,y) its top left; strips run left to right. shine 0..1 = how oiled it is
function drawBoard(g,x,y,w,h,pattern,shine=0,n=pattern.length){ const F=(c,xx,yy,ww,hh)=>{g.fillStyle=c;g.fillRect(Math.round(xx),Math.round(yy),ww,hh)}, sh=h/pattern.length;
  for(let k=0;k<n;k++){ const W=WOODS[pattern[k]], yy=y+Math.round(k*sh), hh=Math.round((k+1)*sh)-Math.round(k*sh); F(W.col,x,yy,w,hh); F(W.lt,x,yy,w,1); for(let i=3;i<w-2;i+=7)F(W.dk,x+i+(k*3)%5,yy+1+(i%2),3,1) }
  if(shine>0){ g.globalAlpha=shine*.35; F('#ffb347',x,y,w,Math.round(n*sh)); g.globalAlpha=shine*.5; F('#fff3d0',x+2,y+1,w-4,1); F('#fff3d0',x+4,y+3,Math.round(w/3),1); g.globalAlpha=1 } }
function drawCrane(){
  const c=$('craneArt'), g=c.getContext('2d'), W=c.width, H=c.height, J=JACKC, N=YARD.N, C=YARD.CELL, ox=YARD.OX, oy=YARD.OY; g.imageSmoothingEnabled=false;
  const F=(col,x,y,w,h)=>{g.fillStyle=col;g.fillRect(Math.round(x),Math.round(y),w,h)};
  // the yard from above: snow-dusted grass, packed dirt inside a split-rail fence, a gate on the right of row 2, the bench beyond it
  F('#7fb563',0,0,W,H); for(let i=0;i<70;i++)F(i%3?'#72a857':'#8cc270',(i*37)%W,(i*53)%H,2,1); for(let i=0;i<16;i++)F('#eef4f8',(i*29)%W,(i*41)%H,3,2);
  F('#b9976a',ox-2,oy-2,N*C+4,N*C+4); for(let i=0;i<90;i++)F(i%2?'#a98658':'#c7a67a',ox+(i*31)%(N*C),oy+(i*17)%(N*C),2,1);
  for(let k=1;k<N;k++){ g.globalAlpha=.12; F('#3b2a1e',ox+k*C,oy,1,N*C); F('#3b2a1e',ox,oy+k*C,N*C,1); g.globalAlpha=1 }
  const gy=oy+2*C;                                                                                               // the gate row
  F('#8a6a4a',ox-4,oy-4,N*C+8,2); F('#8a6a4a',ox-4,oy+N*C+2,N*C+8,2); F('#8a6a4a',ox-4,oy-4,2,N*C+8); F('#8a6a4a',ox+N*C+2,oy-4,2,2*C+3); F('#8a6a4a',ox+N*C+2,gy+C+1,2,N*C-3*C+3);
  for(let k=0;k<=N;k+=2){ F('#6b4a2f',ox-5+k*C,oy-5,3,4); F('#6b4a2f',ox-5+k*C,oy+N*C+1,3,4) } F('#6b4a2f',ox+N*C+1,gy-2,4,3); F('#6b4a2f',ox+N*C+1,gy+C,4,3);
  F('#c7a67a',ox+N*C,gy,24,C); for(let k=0;k<3;k++){ const a=Math.floor(yd.t/260+k)%3; F(a?'#d9c08a':'#f4d35e',ox+N*C+5+k*5,gy+4,3,1); F(a?'#d9c08a':'#f4d35e',ox+N*C+6+k*5,gy+3,1,3); F(a?'#d9c08a':'#f4d35e',ox+N*C+7+k*5,gy+5,1,1) }   // arrows out the gate
  F('#8a5a34',104,14,20,6); F('#a8743f',104,14,20,1); F('#6b4428',106,20,2,8); F('#6b4428',120,20,2,8); F('#5f6676',118,11,4,3); F('#9aa3b0',106,12,6,2);   // his bench outside, a plane on it
  { const was=ctx; ctx=g; drawJackC(114,90,'down'); ctx=was }
  // the pieces
  const piece=(p,i)=>{ const x=ox+p.x*C+p.dx+(p.bump>0?Math.sin(yd.t/25)*1.5*(p.dir==='h'?1:0):0)+(i===0&&yd.won?Math.min(40,yd.out*.05):0), y=oy+p.y*C+p.dy+(p.bump>0?Math.sin(yd.t/25)*1.5*(p.dir==='v'?1:0):0), w=(p.dir==='h'?p.len:1)*C, h=(p.dir==='v'?p.len:1)*C;
    if(p.kind==='s'){ F('rgba(0,0,0,.25)',x+2,y+3,C-2,C-2); F('#6b4428',x+1,y+1,C-2,C-2); F('#d9b27a',x+2,y+2,C-4,C-4); F('#b88a50',x+4,y+4,C-8,C-8); F('#d9b27a',x+5,y+5,C-10,C-10); F('#4f8a45',x+1,y+C-4,3,2); return }   // a stump: growth rings, a bit of moss
    F('rgba(0,0,0,.25)',x+2,y+3,w-2,h-2);
    if(p.kind==='p'){ F('#cdb480',x+1,y+2,w-2,h-4); F('#e6cf9e',x+1,y+2,w-2,h-5); F('#f2e2bc',x+1,y+2,w-2,1); for(let k=4;k<w-4;k+=6)F('#cdb480',x+k,y+4+(k%4),4,1); F('#f4d35e',x+w-4,y+5,2,2);
      if(Math.floor(yd.t/350)%2){F('#ffffff',x+4,y+3,1,3); F('#ffffff',x+3,y+4,3,1)} }                                                                             // the maple plank: pale, clean, a little sparkle
    else { const a=['#8a5a34','#7a4e2c','#96643c'][i%3], b=['#a8743f','#96643c','#b07a48'][i%3];
      if(p.dir==='h'){ F(a,x+1,y+2,w-2,h-4); F(b,x+1,y+2,w-2,2); F('#6b4428',x+1,y+h-3,w-2,1); for(let k=5;k<w-5;k+=7)F('#6b4428',x+k,y+5+(k%3),4,1); F('#d9b27a',x+1,y+2,2,h-4); F('#d9b27a',x+w-3,y+2,2,h-4); F('#b88a50',x+1,y+5,2,2); F('#b88a50',x+w-3,y+5,2,2) }
      else { F(a,x+2,y+1,w-4,h-2); F(b,x+2,y+1,2,h-2); F('#6b4428',x+w-3,y+1,1,h-2); for(let k=5;k<h-5;k+=7)F('#6b4428',x+5+(k%3),y+k,1,4); F('#d9b27a',x+2,y+1,w-4,2); F('#d9b27a',x+2,y+h-3,w-4,2); F('#b88a50',x+5,y+1,2,2); F('#b88a50',x+5,y+h-3,2,2) }
      if((i*7)%5===0)F('#eef4f8',x+3,y+2,4,1) }                                                                                                                   // a dusting of snow on some
    if(i===yd.sel&&!yd.won){ const on=Math.floor(yd.t/300)%2; g.strokeStyle=on?'#ffffff':'#f4d35e'; g.lineWidth=1; g.strokeRect(Math.round(x)+.5,Math.round(y)+.5,w-1,h-1) } };
  yd.ps.forEach((p,i)=>{ if(i)piece(p,i) }); piece(yd.ps[0],0);
  if(yd.hint&&!yd.won){ const p=yd.ps[yd.hint.i], d=yd.hint.to-(p.dir==='h'?p.x:p.y), on=Math.floor(yd.hint.t/220)%2;                                              // the hint: a ghost of where that log should go
    if(on){ g.globalAlpha=.55; const hx=ox+(p.dir==='h'?yd.hint.to:p.x)*C, hy=oy+(p.dir==='v'?yd.hint.to:p.y)*C; F('#f4d35e',hx+1,hy+1,(p.dir==='h'?p.len:1)*C-2,(p.dir==='v'?p.len:1)*C-2); g.globalAlpha=1 } }
  // moves, par, which yard
  F('rgba(29,20,32,.8)',96,51,32,21); pixText(g,J.movesWord+' '+yd.moves,98,54,'#ffffff'); pixText(g,J.parWord+' '+YARDS[yd.lvl].par,98,63,'#f4d35e');
  YARDS.forEach((_,i)=>F(i<yd.lvl||(i===yd.lvl&&yd.won)?'#4fbf73':i===yd.lvl?'#f4d35e':'#5a3d26',104+i*7,3,5,3));
  for(const q of yd.parts){ g.globalAlpha=Math.min(1,q.life/300); F(q.c,q.x,q.y,2,2) } g.globalAlpha=1;
}
function craneWon(){
  const again=!!have.board; have.boardPattern=[...Array(5)].map((_,i)=>[1,0,1,2,1][(i+(Math.random()*5|0))%5]); save(); sfx('reward');
  if(again)return showDialog({place:JACKC.place,speaker:JACKC.name,pages:[JACKC.thanks[0]],actions:[CLOSE]});
  say(JACKC.thanks.map(t=>[JACKC.name,t,'Jack C']),()=>showReward('board'));
}
// touch / mouse: press a log, drag it along its length
{ const cv=$('craneArt'), cell=e=>{ const r=cv.getBoundingClientRect(), x=(e.clientX-r.left)/r.width*cv.width, y=(e.clientY-r.top)/r.height*cv.height; return [(x-YARD.OX)/YARD.CELL,(y-YARD.OY)/YARD.CELL] };
  cv.style.touchAction='none';
  cv.addEventListener('pointerdown',e=>{ if(!yd.open||yd.won)return; const [fx,fy]=cell(e), i=ydAt(yd.ps,Math.floor(fx),Math.floor(fy)); if(i<0||yd.ps[i].kind==='s')return; e.preventDefault(); yd.sel=i; const p=yd.ps[i]; yd.drag={i,at:p.dir==='h'?fx:fy}; try{cv.setPointerCapture(e.pointerId)}catch(_){} });
  cv.addEventListener('pointermove',e=>{ if(!yd.drag)return; const [fx,fy]=cell(e), p=yd.ps[yd.drag.i], now=p.dir==='h'?fx:fy, k=Math.round(now-yd.drag.at); if(k&&ydMove(yd.drag.i,k>0?1:-1))yd.drag.at+=k>0?1:-1 });
  for(const ev of ['pointerup','pointercancel'])cv.addEventListener(ev,()=>{ yd.drag=null }); }
$('craneBtn').addEventListener('click',e=>{e.preventDefault(); craneDrop()});
$('craneLater').onclick=closeCrane;
addEventListener('keydown',e=>{ if(!yd.open)return; if(e.code==='Escape'){e.preventDefault(); closeCrane(); return}
  if(ydKey(e.code)){ e.preventDefault(); e.stopImmediatePropagation(); return }
  if(e.code==='KeyR'&&!yd.won){ e.preventDefault(); ydLoad(yd.lvl); return }
  if(e.code==='Tab'&&!yd.won){ e.preventDefault(); e.stopImmediatePropagation(); do{ yd.sel=(yd.sel+1)%yd.ps.length }while(yd.ps[yd.sel].kind==='s'); return }
  if(['Space','Enter'].includes(e.code)&&document.activeElement!==$('craneLater')&&!(document.activeElement&&document.activeElement.classList.contains('wkbtn'))){e.preventDefault(); e.stopImmediatePropagation(); if(!e.repeat)craneDrop()} },true);
