// The Confectioner: waiting under the skylight. Joe holds A to zap him with Doc Alex's gadget;
// he turns into a gingerbread man, then his riddle (the vault in city.js) guards the chocolate.
// Words live in story.js (HEIST.boss...).
const BOSS={ZAP_MS:3600, DRAIN:.18, ZAP_ANIM:1700};   // hold this long to win; lose 18% a second when you let go; the zap + puff takes this long
// a villainous pastry chef: tall white hat, monocle, curly black mustache, black chef's coat, pink apron with sprinkles
const CONF_PAL={T:'#f7f5ef',t:'#d9d4c8',S:'#f0c6a0',s:'#d9a882',W:'#ffffff',E:'#2b2236',O:'#e0b030',M:'#1d1a22',d:'#7a2a2a',
  C:'#24222c',c:'#3a3746',w:'#f7f5ef',A:'#f28cb8',a:'#d9709e',y:'#f4d35e',b:'#5fa8e8',g:'#7fd39a',P:'#3a3746',B:'#14131a'};
const CONF_SPR={down:[
  "......TTTT......",
  "....TTTTTTTT....",
  "...TTTtTTtTTT...",
  "...TTTTTTTTTT...",
  "....tttttttt....",
  "....SSSSSSSS....",
  "....SWESSOEO....",
  "....SSSSsSSS....",
  "...MMMSssSMMM...",
  "..M.MMMMMMMM.M..",
  "....sSSddSSs....",
  ".....ssSSss.....",
  "...CCCCwwCCCC...",
  "..CCCAAAAAACCC..",
  ".CCcAAyAAbAAcCC.",
  ".CCcAAAAAAAAcCC.",
  ".CCcAgAAAyAAcCC.",
  ".CC.AAAAAAAA.CC.",
  ".CC.AAbAAgAA.CC.",
  ".SS.AAAAAAAA.SS.",
  "....aaaaaaaa....",
  "....PPPP.PPP....",
  "....PPP..PPP....",
  "....PPP..PPP....",
  "....PPP..PPP....",
  "...BBBB..BBBB...",
]};
const GINGER_PAL={T:'#f7f5ef',G:'#b8743a',g:'#9a5a2a',w:'#ffffff',r:'#e54b4b',k:'#2b2236'};
const GINGER_SPR={down:[
  "...TTT...",
  "..TTTTT..",
  "..GGGGG..",
  ".GGkGkGG.",
  ".GwwGwwG.",
  "..GgggG..",
  "GGGGrGGGG",
  "wGGGGGGGw",
  "..GGrGG..",
  "..GGGGG..",
  ".GGG.GGG.",
  ".ww...ww.",
]};
function drawConfectioner(g,x,y,shake){ blit(g,Math.round(x)-8+(shake||0),Math.round(y)-26,blinkNow(7)?CONF_SPR.down.map((r,i)=>i===6?r.replace(/[WE]/g,'s'):r):CONF_SPR.down,CONF_PAL) }
function drawGingerbread(g,x,y,hop){ blit(g,Math.round(x)-4,Math.round(y)-12-(hop||0),GINGER_SPR.down,GINGER_PAL) }
// his face when he talks: before (the chef) and after (a cookie)
PORTRAITS['The Confectioner']={size:32, bg:'#2a1a24', draw(g){ const F=px(g);
  F('#24222c',4,24,24,8); F('#f7f5ef',13,24,6,4); F('#f28cb8',10,28,12,4);                                     // coat, collar, apron
  F('#f0c6a0',9,10,14,13); F('#d9a882',9,20,14,3);                                                           // face
  F('#f7f5ef',7,0,18,8); F('#f7f5ef',9,-1,14,2); F('#d9d4c8',11,2,1,5); F('#d9d4c8',19,2,1,5); F('#d9d4c8',8,8,16,2);   // tall hat
  F('#ffffff',11,13,3,2); F('#2b2236',12,13,2,2); F('#2b2236',18,13,2,2); F('#e0b030',16,11,6,1); F('#e0b030',16,16,6,1); F('#e0b030',16,11,1,6); F('#e0b030',21,11,1,6); F('#e0b030',21,17,1,5);   // eyes, monocle + chain
  F('#1d1a22',9,17,14,2); F('#1d1a22',6,16,3,2); F('#1d1a22',23,16,3,2); F('#1d1a22',5,14,2,2); F('#1d1a22',25,14,2,2);   // the mustache, curled
  F('#7a2a2a',13,20,6,1); F('#1d1a22',10,10,4,1); F('#1d1a22',18,10,4,1) }};                                  // sly grin, eyebrows
PORTRAITS['Gingerbread Confectioner']={size:32, bg:'#2a1a24', draw(g){ const F=px(g);
  F('#f7f5ef',10,1,12,6); F('#f7f5ef',12,0,8,2); F('#d9d4c8',10,6,12,1);                                       // the tiny hat survived
  F('#b8743a',7,7,18,17); F('#b8743a',5,10,22,11); F('#9a5a2a',7,22,18,2);                                    // cookie head
  F('#2b2236',11,12,3,3); F('#2b2236',19,12,3,3); F('#ffffff',9,17,5,1); F('#ffffff',18,17,5,1); F('#ffffff',14,16,4,1);   // eyes, icing mustache
  F('#7a2a2a',14,20,4,1); F('#b8743a',4,25,24,7); F('#e54b4b',14,27,4,3); F('#ffffff',4,25,24,1) }};       // tiny frown, gumdrop button
const boss={open:false, p:0, phase:'fight', t:0, taunt:-1, raf:0, last:0, btnHeld:false};
function openBoss(){
  say(HEIST.bossIntro.map(([sp,tx])=>[sp,tx,sp]),()=>{
    Object.assign(boss,{open:true,p:0,phase:'fight',t:0,taunt:-1});
    $('bossTitle').textContent=HEIST.bossTitle; $('bossMsg').textContent=HEIST.bossHold; $('bossBtn').textContent=HEIST.bossBtn;
    $('boss').hidden=false; paused=true; prompt.hidden=true; playSong('boss'); bossLoop(); setTimeout(()=>$('bossBtn').focus({preventScroll:true}),0);
  });
}
function bossHeld(){ return boss.btnHeld||actionHeld }
function bossTick(dt){
  if(!boss.open)return;
  if(boss.phase==='fight'){
    const was=boss.p;
    if(bossHeld()){ boss.p=Math.min(1,boss.p+dt/BOSS.ZAP_MS); if(Math.floor(was*20)!==Math.floor(boss.p*20))sfx('type',300+boss.p*900) }
    else boss.p=Math.max(0,boss.p-dt/1000*BOSS.DRAIN);
    const N=HEIST.bossTaunts.length, n=Math.min(N-1,Math.floor(boss.p*(N+1))-1);   // taunt 1 at 25%, 2 at 50%, 3 at 75%
    if(bossHeld()&&n>boss.taunt){ boss.taunt=n; $('bossMsg').textContent=HEIST.bossTaunts[n] }
    if(!bossHeld()&&was>boss.p&&boss.p>0&&was>=.15&&$('bossMsg').textContent!==HEIST.bossLetGo){ $('bossMsg').textContent=HEIST.bossLetGo; boss.taunt=-1 }
    if(boss.p>=1){ boss.phase='zap'; boss.t=0; sfx('chunk'); sfx('reward'); $('bossMsg').textContent=HEIST.bossZap }
  } else if(boss.phase==='zap'){ boss.t+=dt; if(boss.t>=BOSS.ZAP_ANIM)bossWon() }
  $('bossFill').style.width=Math.round(boss.p*100)+'%';
}
function bossWon(){
  boss.open=false; boss.phase='done'; $('boss').hidden=true; have.confectionerBeat=true; save(); sceneMusic();
  say(HEIST.bossWin.map(([sp,tx])=>[sp,tx,sp==='The Confectioner'?'Gingerbread Confectioner':sp]),()=>openVault());
}
function bossLoop(){
  if(boss.raf)return; boss.last=performance.now();
  const f=now=>{ boss.raf=0; if(!boss.open&&boss.phase!=='zap')return; const dt=Math.min(50,now-boss.last); boss.last=now; bossTick(dt); drawBoss(now); if(boss.open)boss.raf=requestAnimationFrame(f) };
  boss.raf=requestAnimationFrame(f);
}
function drawBoss(now){
  const c=$('bossArt'), g=c.getContext('2d'), F=(col,x,y,w,h)=>{g.fillStyle=col;g.fillRect(x,y,w,h)}, W=c.width, FLOOR=50;
  g.imageSmoothingEnabled=false;
  F('#2a1a24',0,0,W,FLOOR); F('#33202c',0,0,W,4);
  for(const sy of [12,28]){ F('#5a3a2a',4,sy,64,2); for(let k=0;k<8;k++){const cols=['#f28cb8','#f4d35e','#7fd39a','#5fa8e8','#e54b4b']; F('#cfe6f2',7+k*8,sy-7,5,7); F(cols[(k+sy)%5],8+k*8,sy-4,3,4); F('#9aa3b0',7+k*8,sy-8,5,1)} }   // jars of candy
  // the vault door, round and heavy
  F('#3a3f52',96,6,30,42); F('#5f6676',98,8,26,38); F('#8b93a3',98,8,26,1); F('#4a5060',100,10,22,34);
  F('#c9ced4',109,24,4,4); for(const [dx,dy] of [[0,-7],[0,7],[-7,0],[7,0]])F('#9aa3b0',110+dx,25+dy,2,2); F('#9aa3b0',110,19,2,13); F('#9aa3b0',104,25,14,2);
  for(let x=0;x<W;x+=8)for(let y=FLOOR;y<64;y+=4)F(((x+y)/4)%2?'#3a2430':'#4a2e3a',x,y,8,4);                 // checkered floor
  F('#1d1a22',0,FLOOR,W,1);
  const feet=FLOOR+8;
  drawGrp(8,feet,1,'city',false,g);
  crewSprite({id:'john',x:20,y:feet-1,dir:'right',moving:false,step:0},g);
  crewSprite({id:'lars',x:32,y:feet+1,dir:'right',moving:false,step:0},g);
  crewSprite({id:'hero',x:46,y:feet,dir:'right',moving:false,step:0},g);
  const zap=boss.phase==='zap', held=boss.phase==='fight'&&bossHeld()&&boss.p>0;
  if(!zap||boss.t<500){ drawConfectioner(g,86,feet,held?(Math.floor(now/60)%2?1:-1):0) }
  else { const hop=Math.floor(now/180)%2; drawGingerbread(g,86,feet,hop);
    const k=(boss.t-500)/1200; if(k<1)for(let i=0;i<14;i++){const a=i/14*Math.PI*2, r=4+k*18; g.globalAlpha=1-k; F('#ffffff',86+Math.cos(a)*r,feet-14+Math.sin(a)*r*.6,2,2); g.globalAlpha=1} }   // a puff of powdered sugar
  if(held||(zap&&boss.t<500)){                                                                    // the beam from Doc Alex's gadget
    const x0=53, x1=80, y0=feet-11, thick=zap?3:1+Math.round(boss.p*2);
    let py=y0; for(let x=x0;x<x1;x+=3){const ny=y0+Math.round((Math.random()-.5)*4*(.5+boss.p)); F('#7fe8ff',x,Math.min(py,ny)-1,3,Math.abs(ny-py)+thick+2); F('#ffffff',x,Math.min(py,ny),3,Math.abs(ny-py)+Math.max(1,thick-1)); py=ny}
    F('#e0b030',51,y0-1,3,3);                                                                  // the gadget's tip
  }
  if(zap&&boss.t<500){ g.globalAlpha=1-boss.t/500; F('#ffffff',0,0,W,64); g.globalAlpha=1 }
}
// the hold-to-zap button (touch or mouse). Space / A count too (actionHeld, from input.js)
{const b=$('bossBtn'), on=e=>{e.preventDefault(); boss.btnHeld=true; b.classList.add('on')}, off=()=>{boss.btnHeld=false; b.classList.remove('on')};
  b.addEventListener('pointerdown',on); ['pointerup','pointerleave','pointercancel'].forEach(t=>b.addEventListener(t,off)); b.addEventListener('contextmenu',e=>e.preventDefault())}
