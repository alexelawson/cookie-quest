// The Confectioner: once the lasers are off he pops up right there on roof C and dodges along the roof; Joe lines up under him and presses A to zap.
// Three hits and he turns into a gingerbread man, then his safe (openVault in city.js) guards the chocolate.
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
// the fight happens right on roof C (no pop-up): he pops up out of a puff of sugar and dodges along the roof; Joe stands under him and fires up
const boss={on:false, hits:0, phase:'', t:0, x:460, v:-1, pause:0, shots:[], miss:0, parts:[], cool:0, flash:0};
const AIM={Y:58, HIT:6, SPEEDS:[.028,.038,.048], MIN:430, MAX:488, FINALE:3200, APPEAR:700};   // the line he paces (feet); how close counts; how fast he dodges after each hit (px/ms); how far; how long the transformation and the entrance run
const confWaiting=()=>heistStage()===3&&!have.confectionerBeat;
function sugarPuff(x,y,n,spread){ for(let k=0;k<n;k++){const a=k/n*Math.PI*2; boss.parts.push({x,y,vx:Math.cos(a)*spread*(.5+Math.random()),vy:Math.sin(a)*spread*.7-.02,life:450+Math.random()*300,c:['#ffffff','#f7f5ef','#f28cb8','#f4d35e'][k%4]})} }
// he appears: a puff of powdered sugar, then his lines, then the fight
function openBoss(){
  if(boss.on)return;
  Object.assign(boss,{on:true,hits:0,phase:'appear',t:0,x:460,v:-1,pause:0,shots:[],miss:0,parts:[],cool:0,flash:0});
  if(lead().id!=='hero')switchTo(0);
  for(const k in dirs)dirs[k]=false; sfx('whoosh'); sugarPuff(boss.x,AIM.Y-12,30,.06); playSong('boss');
}
function bossStartFight(){
  say(HEIST.bossIntro.map(([sp,tx])=>[sp,tx,sp]),()=>{ boss.phase='fight'; boss.t=0; flashPrompt(HEIST.bossHold,3200) });
}
const bossLinedUp=()=>Math.abs(boss.x-P.x)<=AIM.HIT&&P.y>AIM.Y;
function bossFire(){
  if(!boss.on||boss.phase!=='fight'||boss.cool>0)return;
  if(lead().id!=='hero')return flashPrompt(HEIST.onlyJoe);
  boss.cool=350; const on=bossLinedUp(); boss.shots.push({t:0,hit:on,x:P.x,y0:P.y-14});
  if(on){ boss.hits++; sfx('chunk'); boss.pause=500; boss.flash=180; sugarPuff(boss.x,AIM.Y-14,10,.05);
    if(boss.hits>=3){ boss.phase='zap'; boss.t=0; sfx('reward'); flashPrompt(HEIST.bossZap,900); return }
    flashPrompt(HEIST.bossTaunts[boss.hits-1],1800); boss.v=boss.x<(AIM.MIN+AIM.MAX)/2?1:-1 }   // and he bolts away from you
  else { sfx('bad'); flashPrompt(HEIST.bossMiss[boss.miss++%HEIST.bossMiss.length],1400) }
}
function bossTick(dt){
  for(const p of boss.parts){p.x+=p.vx*dt; p.y+=p.vy*dt; p.vy+=.0003*dt; p.life-=dt} boss.parts=boss.parts.filter(p=>p.life>0);
  if(!boss.on)return;
  if(boss.cool>0)boss.cool-=dt; if(boss.flash>0)boss.flash-=dt;
  for(const s of boss.shots)s.t+=dt; boss.shots=boss.shots.filter(s=>s.t<220);
  if(P.y<AIM.Y+8)P.y=AIM.Y+8;   // you stay on your side of the roof
  if(boss.phase==='appear'){ boss.t+=dt; if(boss.t>=AIM.APPEAR){ boss.phase='talk'; bossStartFight() } }
  else if(boss.phase==='fight'){
    if(boss.pause>0){boss.pause-=dt}
    else { const sp=AIM.SPEEDS[Math.min(2,boss.hits)]; boss.x+=boss.v*sp*dt;
      if(boss.x<=AIM.MIN){boss.x=AIM.MIN;boss.v=1} if(boss.x>=AIM.MAX){boss.x=AIM.MAX;boss.v=-1}
      if(Math.random()<dt/1400){boss.v*=-1} if(Math.random()<dt/2600)boss.pause=250+Math.random()*350 }   // he changes direction and stops to taunt you
  } else if(boss.phase==='zap'){ boss.t+=dt;
    if(boss.t>900&&boss.t-dt<=900){ sfx('fanfare'); sugarPuff(boss.x,AIM.Y-12,40,.08) }
    if(boss.t>=AIM.FINALE)bossWon() }
}
function bossWon(){
  boss.on=false; boss.phase='done'; have.confectionerBeat=true; have.gingerX=Math.round(boss.x); save(); sceneMusic();
  say(HEIST.bossWin.map(([sp,tx])=>[sp,tx,sp==='The Confectioner'?'Gingerbread Confectioner':sp]),()=>openVault());
}
// his look changes with each hit: hat, then mustache, then the whole thing
function confPal(h){ const p={...CONF_PAL}; if(h>=1){p.T='#b8743a';p.t='#ffffff'} if(h>=2){p.M='#ffffff';p.S='#d9a070';p.s='#b8743a'} return p }
// on the roof: him (an ent, so he gets the outline and sorts with the crew)
function bossEnts(list){
  const st=heistStage();
  if(boss.on){ list.push({y:AIM.Y, draw:()=>{
    const ph=boss.phase, shake=(ph==='zap'&&boss.t<900)||boss.flash>0?Math.round((Math.random()-.5)*3):0, x=Math.round(boss.x)+shake;
    if(ph==='appear'){ if(boss.t>AIM.APPEAR*.45&&Math.floor(boss.t/60)%2)blit(ctx,x-8,AIM.Y-26,CONF_SPR.down,CONF_PAL); return }   // he flickers in
    if(ph!=='zap')return blit(ctx,x-8,AIM.Y-26,blinkNow(7)?CONF_SPR.down.map((r,i)=>i===6?r.replace(/[WE]/g,'s'):r):CONF_SPR.down,confPal(boss.hits));
    if(boss.t<900)return Math.floor(boss.t/70)%2?drawGingerbread(ctx,x,AIM.Y,0):blit(ctx,x-8,AIM.Y-26,CONF_SPR.down,confPal(2));
    const a=(boss.t-900)/260; drawGingerbread(ctx,boss.x+Math.cos(a)*16,AIM.Y+Math.sin(a)*3,Math.floor(time/90)%2*2) }});   // a tiny gingerbread man running in circles
  } else if(confWaiting()){ list.push({y:AIM.Y, draw:()=>blit(ctx,452,AIM.Y-26,CONF_SPR.down,CONF_PAL)}) }   // (back after a reload: he's waiting by the skylight)
  else if(have.confectionerBeat&&st>=3&&st<5){ list.push({y:AIM.Y, draw:()=>drawGingerbread(ctx,have.gingerX||460,AIM.Y,0)}) }   // beaten: a gingerbread man, sulking
}
// on top of the dark: the aim line over Joe's head, the bolts, the sugar, the flashes
function bossOver(){
  const F=(c,x,y,w,h)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),w,h)};
  if(boss.on&&boss.phase==='fight'&&lead().id==='hero'){ const on=bossLinedUp(), col=on?'#ff5a5a':'rgba(244,211,94,.7)';
    for(let y=P.y-18;y>AIM.Y-8;y-=4)F(col,P.x,y,1,2);   // a dotted line up from Joe: red when he's right over you
    if(on){const y=AIM.Y-14; F(col,boss.x-7,y-7,3,1); F(col,boss.x-7,y-7,1,3); F(col,boss.x+5,y-7,3,1); F(col,boss.x+7,y-7,1,3); F(col,boss.x-7,y+7,3,1); F(col,boss.x-7,y+5,1,3); F(col,boss.x+5,y+7,3,1); F(col,boss.x+7,y+5,1,3)} }
  for(const s of boss.shots){ const y1=s.hit?AIM.Y-16:AIM.Y-34; let px=s.x;
    for(let k=0;k<=10;k++){const y=s.y0+(y1-s.y0)*k/10, x=s.x+(k&&k<10?(Math.random()-.5)*5:0); F('#7fe8ff',Math.min(px,x)-1,y-1,Math.abs(x-px)+3,4); F('#ffffff',Math.min(px,x),y,Math.abs(x-px)+1,2); px=x}
    if(!s.hit)F('#ffd84d',s.x-2,y1-2,4,4) }
  for(const p of boss.parts){ ctx.globalAlpha=Math.max(0,Math.min(1,p.life/400)); F(p.c,p.x,p.y,2,2) } ctx.globalAlpha=1;
  if(boss.on&&boss.phase==='zap'){ const tf=ctx.getTransform(), cx=-tf.e, cy=-tf.f;
    if(boss.t<900&&Math.floor(boss.t/90)%3===0){ ctx.globalAlpha=.6; F('#ffffff',cx,cy,VW,VH); ctx.globalAlpha=1 }
    if(boss.t>1200&&Math.floor(time/250)%4){ const w=textW('GINGERBREAD')+6, x=Math.round(boss.x-w/2), y=AIM.Y-44; F('#1d1a22',x,y,w,9); F('#f4d35e',x,y+8,w,1); pixText(ctx,'GINGERBREAD',x+3,y+2,'#f4d35e') } }   // a blinking banner
}
