// The Confectioner: waiting at the bottom of the fire escape. He dodges side to side; Joe taps ZAP when he's in the crosshair. Three hits;
// he turns into a gingerbread man, then his riddle (the vault in city.js) guards the chocolate.
// Words live in story.js (HEIST.boss...).
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
const boss={open:false, hits:0, phase:'fight', t:0, raf:0, last:0, x:88, v:1, pause:0, shots:[], miss:0, lastHeld:false, parts:[]};
const AIM={X:80, HIT:5, SPEEDS:[.035,.05,.065], MIN:66, MAX:110, FINALE:3200};   // the crosshair; how close counts; how fast he dodges after each hit (px/ms); how far; how long the transformation show runs
function openBoss(){
  say(HEIST.bossIntro.map(([sp,tx])=>[sp,tx,sp]),()=>{
    Object.assign(boss,{open:true,hits:0,phase:"fight",t:0,x:100,v:-1,pause:0,shots:[],miss:0,parts:[],cool:0,flash:0,lastHeld:actionHeld});
    $('bossTitle').textContent=HEIST.bossTitle; $('bossMsg').textContent=HEIST.bossHold; $('bossBtn').textContent=HEIST.bossBtn;
    $('bossFill').style.width='0%';
    $('boss').hidden=false; paused=true; prompt.hidden=true; playSong('boss'); bossLoop(); setTimeout(()=>$('bossBtn').focus({preventScroll:true}),0);
  });
}
function bossFire(){
  if(!boss.open||boss.phase!=='fight'||boss.cool>0)return;
  boss.cool=350; const on=Math.abs(boss.x-AIM.X)<=AIM.HIT; boss.shots.push({t:0,hit:on,x:on?boss.x:AIM.X});
  if(on){ boss.hits++; sfx('chunk'); boss.pause=500; boss.flash=180;
    for(let k=0;k<10;k++)boss.parts.push({x:boss.x,y:40,vx:(Math.random()-.5)*.12,vy:-Math.random()*.1,life:600,c:['#f7f5ef','#f28cb8','#f4d35e','#b8743a'][k%4]});
    $('bossFill').style.width=Math.round(boss.hits/3*100)+'%';
    if(boss.hits>=3){ boss.phase='zap'; boss.t=0; sfx('reward'); $('bossMsg').textContent=HEIST.bossZap; return }
    $('bossMsg').textContent=HEIST.bossTaunts[boss.hits-1]; boss.v=(Math.random()<.5?-1:1) }
  else { sfx('bad'); $('bossMsg').textContent=HEIST.bossMiss[boss.miss++%HEIST.bossMiss.length] }
}
function bossTick(dt){
  if(!boss.open)return;
  if(actionHeld&&!boss.lastHeld)bossFire(); boss.lastHeld=actionHeld;
  if(boss.cool>0)boss.cool-=dt; if(boss.flash>0)boss.flash-=dt;
  for(const p of boss.parts){p.x+=p.vx*dt; p.y+=p.vy*dt; p.vy+=.0003*dt; p.life-=dt} boss.parts=boss.parts.filter(p=>p.life>0);
  for(const s of boss.shots)s.t+=dt; boss.shots=boss.shots.filter(s=>s.t<220);
  if(boss.phase==='fight'){
    if(boss.pause>0){boss.pause-=dt}
    else { const sp=AIM.SPEEDS[Math.min(2,boss.hits)]; boss.x+=boss.v*sp*dt;
      if(boss.x<=AIM.MIN){boss.x=AIM.MIN;boss.v=1} if(boss.x>=AIM.MAX){boss.x=AIM.MAX;boss.v=-1}
      if(Math.random()<dt/1400){boss.v*=-1} if(Math.random()<dt/2600)boss.pause=250+Math.random()*350 }   // he changes direction and stops to taunt you
  } else if(boss.phase==='zap'){ boss.t+=dt;
    if(boss.t>900&&boss.t-dt<=900){ sfx('fanfare'); for(let k=0;k<40;k++){const a=k/40*Math.PI*2; boss.parts.push({x:86,y:40,vx:Math.cos(a)*.08*(1+Math.random()),vy:Math.sin(a)*.06-.03,life:1200,c:['#ffffff','#f7f5ef','#f28cb8','#f4d35e'][k%4]})} }
    if(boss.t>=AIM.FINALE)bossWon() }
}
function bossWon(){
  boss.open=false; boss.phase='done'; $('boss').hidden=true; have.confectionerBeat=true; save(); sceneMusic();
  say(HEIST.bossWin.map(([sp,tx])=>[sp,tx,sp==='The Confectioner'?'Gingerbread Confectioner':sp]),()=>openVault());
}
function bossLoop(){
  if(boss.raf)return; boss.last=performance.now();
  const f=now=>{ boss.raf=0; if(!boss.open)return; const dt=Math.min(50,now-boss.last); boss.last=now; bossTick(dt); if(boss.open){drawBoss(now); boss.raf=requestAnimationFrame(f)} };
  boss.raf=requestAnimationFrame(f);
}
// his look changes with each hit: hat, then mustache, then the whole thing
function confPal(h){ const p={...CONF_PAL}; if(h>=1){p.T='#b8743a';p.t='#ffffff'} if(h>=2){p.M='#ffffff';p.S='#d9a070';p.s='#b8743a'} return p }
function drawBoss(now){
  const c=$('bossArt'), g=c.getContext('2d'), F=(col,x,y,w,h)=>{g.fillStyle=col;g.fillRect(Math.round(x),Math.round(y),w,h)}, W=c.width, FLOOR=50;
  g.imageSmoothingEnabled=false; g.setTransform(1,0,0,1,0,0);
  const zap=boss.phase==='zap', shake=(zap&&boss.t<900)||(boss.flash>0)?(Math.random()-.5)*4:0; g.translate(Math.round(shake),Math.round(shake*.5));
  F('#2a1a24',-4,-4,W+8,FLOOR+4); F('#33202c',0,0,W,4);
  for(const sy of [12,28]){ F('#5a3a2a',4,sy,64,2); for(let k=0;k<8;k++){const cols=['#f28cb8','#f4d35e','#7fd39a','#5fa8e8','#e54b4b']; F('#cfe6f2',7+k*8,sy-7,5,7); F(cols[(k+sy)%5],8+k*8,sy-4,3,4); F('#9aa3b0',7+k*8,sy-8,5,1)} }   // jars of candy
  F('#3a3f52',96,6,30,42); F('#5f6676',98,8,26,38); F('#8b93a3',98,8,26,1); F('#4a5060',100,10,22,34);                                        // the vault door
  F('#c9ced4',109,24,4,4); for(const [dx,dy] of [[0,-7],[0,7],[-7,0],[7,0]])F('#9aa3b0',110+dx,25+dy,2,2); F('#9aa3b0',110,19,2,13); F('#9aa3b0',104,25,14,2);
  for(let x=-4;x<W+4;x+=8)for(let y=FLOOR;y<68;y+=4)F(((x+y)/4)%2?'#3a2430':'#4a2e3a',x,y,8,4);
  F('#1d1a22',0,FLOOR,W,1);
  const feet=FLOOR+8, hop=k=>zap&&boss.t>1400?Math.abs(Math.sin(now/120+k))*4|0:0;   // the crew jumps for joy at the end
  drawGrp(8,feet-hop(0),1,'city',false,g);
  crewSprite({id:'john',x:20,y:feet-1-hop(1),dir:'right',moving:false,step:0},g);
  crewSprite({id:'lars',x:32,y:feet+1-hop(2),dir:'right',moving:false,step:0},g);
  crewSprite({id:'hero',x:46,y:feet-hop(3),dir:'right',moving:false,step:0},g);
  // him: dodging (fight), then flickering between chef and cookie, then a tiny gingerbread man running in circles
  if(!zap){ blit(g,Math.round(boss.x)-8,feet-26,CONF_SPR.down,confPal(boss.hits)) }
  else if(boss.t<900){ (Math.floor(boss.t/70)%2?drawGingerbread(g,boss.x,feet,0):blit(g,Math.round(boss.x)-8,feet-26,CONF_SPR.down,confPal(2))) }
  else { const a=(boss.t-900)/260, gx=86+Math.cos(a)*16, gy=feet-1+Math.sin(a)*3; drawGingerbread(g,gx,gy,Math.floor(now/90)%2*2);
    if(Math.floor(now/300)%2)F('#ffffff',gx-12,gy-22,1,1) }
  // the crosshair (fight only): gold brackets; it turns red when he's lined up
  if(boss.phase==='fight'){ const on=Math.abs(boss.x-AIM.X)<=AIM.HIT, col=on?'#ff5a5a':'#f4d35e', x=AIM.X, y=feet-14;
    F(col,x-7,y-7,3,1); F(col,x-7,y-7,1,3); F(col,x+5,y-7,3,1); F(col,x+7,y-7,1,3); F(col,x-7,y+7,3,1); F(col,x-7,y+5,1,3); F(col,x+5,y+7,3,1); F(col,x+7,y+5,1,3); F(col,x,y,1,1) }
  // bolts from Doc Alex's gadget (Joe's hand) to where you fired
  for(const s of boss.shots){ const x0=53, y0=feet-11, x1=s.x, y1=s.hit?feet-16:feet-30; let py=y0;
    for(let k=0;k<=10;k++){const x=x0+(x1-x0)*k/10, y=y0+(y1-y0)*k/10+(k&&k<10?(Math.random()-.5)*5:0); F('#7fe8ff',x-1,Math.min(py,y)-1,3,Math.abs(y-py)+3); F('#ffffff',x,Math.min(py,y),1,Math.abs(y-py)+1); py=y}
    if(!s.hit)F('#ffd84d',x1-2,y1-2,4,4) }
  for(const p of boss.parts){ g.globalAlpha=Math.max(0,Math.min(1,p.life/400)); F(p.c,p.x,p.y,2,2) } g.globalAlpha=1;
  if(zap&&boss.t<900&&Math.floor(boss.t/90)%3===0){ g.globalAlpha=.7; F('#ffffff',-4,-4,W+8,72); g.globalAlpha=1 }
  if(zap&&boss.t>1200&&Math.floor(now/250)%4){ const w=textW('GINGERBREAD')+6, x=Math.round(W/2-w/2); F('#1d1a22',x,2,w,9); F('#f4d35e',x,10,w,1); pixText(g,'GINGERBREAD',x+3,4,'#f4d35e') }   // a blinking banner
  g.setTransform(1,0,0,1,0,0);
}
// the ZAP button (touch or mouse): one tap, one bolt. Space / A count too (bossTick watches actionHeld, from input.js)
{const b=$('bossBtn'); b.addEventListener('pointerdown',e=>{e.preventDefault(); b.classList.add('on'); bossFire()}); ['pointerup','pointerleave','pointercancel'].forEach(t=>b.addEventListener(t,()=>b.classList.remove('on'))); b.addEventListener('contextmenu',e=>e.preventDefault())}
