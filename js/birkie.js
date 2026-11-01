// The Vikings ski the Birkie: guide a pack of Vikings (and the flour) from Cable to Main Street, Hayward.
// You lead; they follow your exact tracks. Steer left/right, tap A in rhythm on climbs, tuck (Down) on descents.
const BIRK={
  W:224, L:2700,                         // course size (px)
  STEER:.065, HALF:34,                   // steering speed, trail half-width
  // speed = base + bonus x rhythm. Rhythm (0-1) builds with on-beat taps, drops with off-beat ones, fades if you stop.
  SPEED:{flat:[.040,.026], up:[.015,.040], down:[.095,0], lake:[.028,.032], finish:[.05,.02]},
  BEAT:640, WINDOW:100,                  // poling rhythm (ms) and how close to the beat counts as good
  GAIN:.35, MISS_KEEP:.5, FADE_MS:1400,  // how fast rhythm builds, how much a miss keeps, how fast it fades
  PUSH_COST:4, MISS_COST:10, REGEN:.004, // stamina
  CRASH_MS:1300, CLOCK:170,              // a crash costs 1.3s; race clock runs 170x real time
  CUTOFF:3*3600,                         // the sweep closes the course at 3:00:00
  ELITE:2*3600+30*60,                    // under 2:30 gets a shout-out
  // simulated finish times: great rhythm ~2:22, ok ~2:47, sloppy ~3:13, never poling 3:50
};
// course sections, top to bottom
const BIRK_SECTIONS=[
  {y:0,    type:'flat', name:'Start · Cable'},
  {y:160,  type:'roll', name:'Powerline Hills'},
  {y:480,  type:'up',   name:'Firetower Hill (high point)'},
  {y:690,  type:'down', name:''},
  {y:820,  type:'flat', name:''},
  {y:1060, type:'down', name:'Bobblehead Hill', turn:true},
  {y:1260, type:'flat', name:'OO · halfway'},
  {y:1420, type:'roll', name:''},
  {y:1760, type:'up',   name:'"That" hill (you know the one)'},
  {y:1960, type:'roll', name:'Sunset & Duffy Hills'},
  {y:2140, type:'flat', name:'Bridge over Highway 77', bridge:true},
  {y:2240, type:'lake', name:'Lake Hayward (windy!)'},
  {y:2560, type:'finish', name:'Main Street · Hayward'},
];
const FEEDS=[{y:820},{y:1700}];
const FINISH_Y=2620;
// trail centerline wanders; Bobblehead has a sharp left turn; the bridge and Main Street are straight
function trailX(y){
  if(y>2140)return 112;
  let x=112+44*Math.sin(y/260)+18*Math.sin(y/97);
  if(y>1060&&y<1260)x-=Math.min(40,(y-1060)*.5);            // Bobblehead's left turn
  if(y>2040)x=x+(112-x)*Math.min(1,(y-2040)/100);           // straighten out toward the bridge
  return x;
}
const trailHalf=y=>y>=2140&&y<2240?16:y>=2560?60:BIRK.HALF;
function sectionAt(y){let s=BIRK_SECTIONS[0]; for(const t of BIRK_SECTIONS)if(y>=t.y)s=t; return s}
function terrainAt(y){const s=sectionAt(y); if(s.type!=='roll')return s.type; return Math.floor((y-s.y)/70)%2?'down':'up'}
// people who fell, a snowmobile crossing at Bobblehead, a deer on the lake
const FALLEN=[[300,.6],[620,-.5],[980,.4],[1380,-.6],[1520,.5],[1860,-.4],[2010,.5],[2350,-.5]].map(([y,o])=>({y,x:trailX(y)+o*BIRK.HALF}));

const birk={running:false, v:0, stamina:100, push:0, crashT:0, beatT:0, t:0, trail:[], vikings:[], msg:'', msgT:0, done:false, flash:''};
const birkBg=document.createElement('canvas'); birkBg.width=BIRK.W; birkBg.height=BIRK.L;
(function(){
  const g=birkBg.getContext('2d'), F=(c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};
  F('#e9f0f6',0,0,BIRK.W,BIRK.L); for(let i=0;i<4000;i++)F(rnd()<.5?'#dbe5ee':'#ffffff',rnd()*BIRK.W|0,rnd()*BIRK.L|0,2,1);
  for(let y=0;y<BIRK.L;y+=2){const cx=trailX(y), hw=trailHalf(y);                      // groomed trail with classic tracks
    F('#f6f9fb',cx-hw,y,hw*2,2); F('#cfdbe6',cx-hw+6,y,1,2); F('#cfdbe6',cx-hw+10,y,1,2); F('#dde6ee',cx-hw,y,1,2); F('#dde6ee',cx+hw-1,y,1,2)}
  // the lake: flat and icy-blue
  F('#d4e5f1',0,2240,BIRK.W,320); for(let i=0;i<300;i++)F('#c3d8e8',rnd()*BIRK.W|0,2240+rnd()*320|0,6,1);
  for(let y=2240;y<2560;y+=2){F('#f6f9fb',112-BIRK.HALF,y,BIRK.HALF*2,2)}
  // the bridge over Highway 77: road underneath, rails on the sides
  F('#5f6676',0,2160,BIRK.W,50); F('#f4d35e',0,2184,BIRK.W,2); for(let x=0;x<BIRK.W;x+=14)F('#ffffff',x,2172,6,1);
  F('#f6f9fb',96,2140,32,100); F('#8a5a34',94,2140,2,100); F('#8a5a34',128,2140,2,100);
  // Main Street: buildings, crowd barriers
  for(let x=0;x<BIRK.W;x+=28){if(x>40&&x<170)continue; F(['#b5654f','#7a8aa0','#c49a6a','#6b8f71'][(x/28)%4],x,2580,24,120); F('#ffd98a',x+4,2590,5,6); F('#ffd98a',x+14,2590,5,6)}
  F('#c8322b',48,2570,2,140); F('#c8322b',174,2570,2,140);
  // feed stations: a table with cups
  for(const f of FEEDS){const x=trailX(f.y)+BIRK.HALF+2; F('#8a5a34',x,f.y-6,18,10); F('#c49a6a',x,f.y-6,18,3); for(let i=0;i<4;i++){F('#ffffff',x+2+i*4,f.y-9,3,3); F('#e8742a',x+2+i*4,f.y-9,3,1)}}
  // pines along the trail edges
  for(let n=0;n<520;n++){const y=rnd()*(2140)|0, side=rnd()<.5?-1:1, x=trailX(y)+side*(trailHalf(y)+8+rnd()*60);
    if(x<2||x>BIRK.W-2)continue; F('#5a3a22',x,y,2,3); F('#2f5e3a',x-4,y-8,10,8); F('#356b42',x-3,y-12,8,5); F('#ffffff',x-3,y-12,7,1); F('#ffffff',x-4,y-8,4,1)}
})();
function drawSkier(x,y,o={}){ // generic skier: o.jersey, o.helmet, o.horns, o.down (fallen), o.hair
  const X=Math.round(x)-5, Y=Math.round(y)-16, F=(c,dx,dy,w,h)=>{ctx.fillStyle=c;ctx.fillRect(X+dx,Y+dy,w,h)};
  if(o.down){F('rgba(0,0,0,.2)',-2,13,14,3); F(o.jersey||'#c8322b',-1,9,10,4); F('#f0c6a0',9,9,3,3); F('#2b2b36',-4,13,16,1); F('#2b2b36',-2,6,1,8); return}
  F('rgba(0,0,0,.18)',0,15,10,2);
  F('#2b2b36',1,3,1,14); F('#2b2b36',8,3,1,14);                     // skis (seen from above, pointing down the trail)
  F('#3b3b44',0,6,1,9); F('#3b3b44',9,6,1,9);                       // poles
  F(o.pants||'#1d1d22',2,10,6,4); F(o.jersey||'#fbfbf7',2,4,6,6); if(o.trim)F(o.trim,2,4,6,1);
  F('#f0c6a0',3,0,4,4); F(o.hair||'#b08355',3,0,4,2);
  if(o.helmet){F(o.helmet,2,-1,6,3); if(o.horns){F('#f6f2e4',1,-3,1,3); F('#f6f2e4',8,-3,1,3)}}
}
const VIKING_LOOK={jersey:'#4f2683', trim:'#ffc62f', pants:'#ffc62f', helmet:'#4f2683', horns:true};

// ---------- race ----------
function birkStart(){
  Object.assign(birk,{running:true,v:.03,stamina:100,q:0,crashT:0,beatT:0,t:0,trail:[],msg:'',msgT:0,done:false});
  P.x=trailX(30); P.y=30; P.dir='down';
  birk.vikings=[0,1,2,3].map(i=>({x:P.x,y:P.y-14*(i+1),down:0}));
}
function birkTap(){
  if(!birk.running||birk.crashT>0)return;
  const terr=terrainAt(P.y), phase=birk.beatT%BIRK.BEAT, off=Math.min(phase,BIRK.BEAT-phase);
  if(off<=BIRK.WINDOW){ birk.q=birk.q+(1-birk.q)*BIRK.GAIN; birk.stamina=Math.max(0,birk.stamina-BIRK.PUSH_COST); birk.flash='good' }
  else { birk.q*=BIRK.MISS_KEEP; birk.stamina=Math.max(0,birk.stamina-BIRK.MISS_COST); birk.flash='miss' }   // off beat: you lose your rhythm
  birk.flashT=220;
}
function birkSay(m){birk.msg=m; birk.msgT=1600}
const clockStr=ms=>{const s=Math.floor(ms*BIRK.CLOCK/1000), h=Math.floor(s/3600), m=Math.floor(s%3600/60), x=s%60; return `${h}:${String(m).padStart(2,'0')}:${String(x).padStart(2,'0')}`};
function birkUpdate(dt){
  if(!birk.running)return;
  birk.t+=dt; birk.beatT+=dt; if(birk.flashT>0)birk.flashT-=dt; if(birk.msgT>0)birk.msgT-=dt;
  if(birk.t*BIRK.CLOCK/1000>=BIRK.CUTOFF)return birkFinish(false);
  if(birk.crashT>0){birk.crashT-=dt; return}
  const terr=terrainAt(P.y);
  birk.q*=Math.exp(-dt/BIRK.FADE_MS); if(birk.stamina<=0)birk.q=Math.min(birk.q,.1);
  const [base,bonus]=BIRK.SPEED[terr]||BIRK.SPEED.flat; let target=base+bonus*birk.q;
  if(terr==='down'&&dirs.down)target+=.035;                  // tuck
  if(dirs.up)target*=.5;                                      // snowplow
  if(birk.stamina<=0){target=Math.min(target,.03); if(!birk.bonked){birk.bonked=true; birkSay(BIRKIE.bonk)}} else if(birk.stamina>25)birk.bonked=false;
  const off=Math.abs(P.x-trailX(P.y))>trailHalf(P.y); if(off)target=Math.min(target,.025);
  birk.v+=(target-birk.v)*Math.min(1,dt/350);
  if(terr!=='up')birk.stamina=Math.min(100,birk.stamina+BIRK.REGEN*dt*(terr==='down'?1.6:1));
  const steer=(dirs.right?1:0)-(dirs.left?1:0);
  P.x=Math.max(4,Math.min(BIRK.W-4,P.x+steer*BIRK.STEER*dt*(terr==='down'&&dirs.down?.7:1)));
  P.y+=birk.v*dt; P.moving=true; P.t+=dt; if(P.t>160){P.t=0;P.step++}
  P.dir=steer>0?'right':steer<0?'left':'down';
  // the Vikings follow your tracks
  const t=birk.trail; t.push({x:P.x,y:P.y}); if(t.length>600)t.shift();
  birk.vikings.forEach((v,i)=>{let need=(i+1)*14, k=t.length-1, acc=0; while(k>0&&acc<need){acc+=Math.hypot(t[k].x-t[k-1].x,t[k].y-t[k-1].y);k--} const g=t[Math.max(0,k)]; v.x=g.x; v.y=g.y});
  // crashes into people who fell
  for(const f of FALLEN)if(Math.abs(P.y-f.y)<6&&Math.abs(P.x-f.x)<9){birk.crashT=BIRK.CRASH_MS; birk.v=0; birkSay(BIRKIE.crash[Math.floor(Math.random()*BIRKIE.crash.length)]); P.y+=10; break}
  // feed stations
  for(const f of FEEDS)if(!f.used&&Math.abs(P.y-f.y)<14){f.used=true; birk.stamina=100; birkSay(BIRKIE.feed)}
  if(P.y>=FINISH_Y)birkFinish(true);
}
function birkFinish(made){
  birk.running=false; const tm=clockStr(birk.t); FEEDS.forEach(f=>f.used=false);
  if(made){ have.birkie=true; have.birkieTime=tm; save(); const elite=birk.t*BIRK.CLOCK/1000<BIRK.ELITE;
    say([['',BIRKIE.finishWin(tm)[0]],['',elite?BIRKIE.elite:BIRKIE.finishWin(tm)[1]],...BIRKIE.vikingsWin],()=>goTo('world','fromMill')) }
  else say([['',BIRKIE.finishLate(tm)[0]],['',BIRKIE.finishLate(tm)[1]]],()=>showDialog({place:BIRKIE.place,speaker:'Viking',pages:['Again?'],actions:[{label:BIRKIE.again,fn:()=>{closeDialog();birkStart()}},{label:BIRKIE.leave,ghost:true,fn:()=>{closeDialog();goTo('world','fromMill')}}]}));
}
function birkHowTo(then){
  const T=BIRKIE;
  const c=document.createElement('canvas'); c.width=c.height=32; const g=c.getContext('2d'); g.fillStyle='#d6e4ef'; g.fillRect(0,0,32,32);
  // draw a Viking skier into the little picture
  g.save(); g.scale(2,2); const F=(col,x,y,w,h)=>{g.fillStyle=col;g.fillRect(x,y,w,h)};
  F('#2b2b36',4,3,1,13); F('#2b2b36',11,3,1,13); F('#ffc62f',5,10,6,4); F('#4f2683',5,4,6,6); F('#ffc62f',5,4,6,1); F('#f0c6a0',6,1,4,3); F('#4f2683',5,0,6,2); F('#f6f2e4',4,-1,1,3); F('#f6f2e4',11,-1,1,3);
  g.restore();
  const row=document.createElement('div'); row.className='hrow'; const tx=document.createElement('div'); tx.innerHTML='<b>The Vikings</b><span>Strong. Not good skiers. They follow your tracks exactly, flour and all.</span>'; row.append(c,tx);
  $('howTitle').textContent=T.howToTitle; $('howRows').replaceChildren(row);
  $('howControls').replaceChildren(...T.howToSteps.map(x=>{const li=document.createElement('li'); li.textContent=x; return li}));
  $('howOk').textContent=T.howToOk; $('howOk').onclick=()=>{ $('howto').hidden=true; paused=false; then&&then() };
  paused=true; prompt.hidden=true; $('howto').hidden=false; setTimeout(()=>$('howOk').focus({preventScroll:true}),0);
}
// John at the trailhead (not heist John): brown hair, reading glasses, Birkie volunteer jacket, clipboard
function trailJohnDir(){ const dx=P.x-331, dy=P.y-81; return scene!==SCENES.world||Math.hypot(dx,dy)>60?'down':Math.abs(dx)>Math.abs(dy)?(dx<0?'left':'right'):(dy<0?'up':'down') }
function drawTrailJohn(cx,cy,dir){
  const x=cx-5, y=cy-20, F=(c,dx,dy,w,h)=>{ctx.fillStyle=c;ctx.fillRect(x+dx,y+dy,w,h)};
  const skin='#eab896', hair='#6b4429', coat='#1d3f73', pants='#b59a6e', glass='#c9a24a';
  F('rgba(0,0,0,.25)',1,19,9,2);
  F(pants,2,13,3,6); F(pants,6,13,3,6); F('#2b2b2b',2,18,3,2); F('#2b2b2b',6,18,3,2);
  F(coat,1,6,9,8); F('#c8322b',1,9,9,1); F('#ffffff',4,6,3,1);                     // jacket with a red stripe
  F(coat,0,7,1,6); F(coat,10,7,1,6); F(skin,0,13,1,1); F(skin,10,13,1,1);
  F(skin,3,1,5,5); F(skin,4,5,3,1);
  F(hair,3,0,5,2); F(hair,2,1,1,3); F(hair,8,1,1,3);
  if(dir==='up')F(hair,3,0,5,5);
  else if(dir==='left'){F('#2b2b2b',3,3,1,1); F(glass,3,3,2,1); F(hair,7,1,1,3)}
  else if(dir==='right'){F('#2b2b2b',7,3,1,1); F(glass,6,3,2,1); F(hair,3,1,1,3)}
  else {F(glass,3,3,2,2); F(glass,6,3,2,2); F(glass,5,3,1,1); F('#2b2b2b',4,4,1,1); F('#2b2b2b',6,4,1,1); F('#b5735a',4,5,3,1)}   // reading glasses
  if(dir!=='up'){F('#8a5a34',8,9,3,5); F('#ffffff',8,10,3,3)}                       // clipboard
}
function talkJohn(){
  const T=BIRKIE;
  if(have.mill)return showDialog({place:T.place,speaker:T.john,face:'Trail John',pages:[T.johnAfter],actions:[CLOSE]});
  if(have.birkie)return showDialog({place:T.place,speaker:T.john,face:'Trail John',pages:[T.johnDone,T.crosswordSoon],actions:[{label:T.takeFlour,fn:()=>{closeDialog();showReward('mill')}}]});
  showDialog({place:T.place,speaker:T.john,face:'Trail John',pages:T.johnHello,actions:[{label:T.go,fn:()=>{closeDialog();goTo('birkie','start')}},{label:T.later,ghost:true,fn:closeDialog}]});
}

const birkStartArch=archSprite(60,24,g=>{const F=(c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};
  F('#8a8f9a',0,0,3,24); F('#8a8f9a',57,0,3,24); F('#1d3f73',0,0,60,16); F('#c8322b',0,0,60,2); F('#c8322b',0,14,60,2);
  pixText(g,'AMERICAN',13,3,'#ffffff'); pixText(g,'BIRKEBEINER',8,9,'#ffffff')});
SCENES.birkie={ place:BIRKIE.place,
  w:BIRK.W, h:BIRK.L, bounds:R(0,0,BIRK.W,BIRK.L), bg:birkBg, solids:[], triggers:[],
  entries:{start:{x:112,y:30,dir:'down'}},
  enter(){ birk.running=false; P.x=trailX(30); P.y=30; birk.vikings=[0,1,2,3].map(i=>({x:P.x,y:16-i*14})); birk.introPending=true },
  speed:()=>0,                                  // you don't walk here; birkUpdate moves you
  ability:()=>birkTap(),
  abilityLabel:()=>birk.running?(terrainAt(P.y)==='up'?'Pole!':'Pole'):'',
  update(dt){
    if(birk.introPending){birk.introPending=false; return birkHowTo(()=>say(BIRKIE.vikingsHello,()=>birkStart()))}
    birkUpdate(dt);
  },
  drawPlayer:(x,y)=>{ if(birk.crashT>0)drawSkier(x,y,{down:true,jersey:'#fbfbf7'}); else drawSkier(x,y,{jersey:'#fbfbf7',trim:'#c8322b',hair:'#b08355'}) },
  under(){
    for(const f of FALLEN)drawSkier(f.x,f.y,{down:true,jersey:['#2f6db0','#e8742a','#2f8a4a','#c8322b'][Math.floor(f.y)%4]});
    // start arch: the American Birkebeiner banner over the start line
    ctx.drawImage(birkStartArch,trailX(46)-30,24);
    // section signs
    ctx.font='7px monospace'; for(const s of BIRK_SECTIONS){ if(!s.name)continue; const sx=Math.round(trailX(s.y+10)+BIRK.HALF+4), w=Math.ceil(ctx.measureText(s.name).width)+6, x=Math.max(2,Math.min(sx,BIRK.W-w-2));
      ctx.fillStyle='#8a5a34'; ctx.fillRect(x+4,s.y+10,2,8); ctx.fillStyle='#1d3f73'; ctx.fillRect(x,s.y,w,10); ctx.fillStyle='#ffffff'; ctx.fillText(s.name,x+3,s.y+7) }
    // finish banner + crowd
    ctx.fillStyle='#4f2683'; ctx.fillRect(40,FINISH_Y-8,144,9); ctx.fillStyle='#ffc62f'; ctx.font='7px monospace'; ctx.fillText('FINISH · HAYWARD',76,FINISH_Y-1);
    for(let i=0;i<30;i++){const x=i<15?30+((i*7)%18):176+((i*7)%18), y=2590+(i%15)*8, j=Math.sin(time/150+i)>.6?-1:0; ctx.fillStyle=['#c8322b','#2f6db0','#ffc62f','#4f2683','#2f8a4a'][i%5]; ctx.fillRect(x,y+j,4,5); ctx.fillStyle='#f0c6a0'; ctx.fillRect(x+1,y-2+j,2,2)}
  },
  ents(list){ birk.vikings.forEach((v,i)=>list.push({y:v.y,draw:()=>{drawSkier(v.x,v.y,VIKING_LOOK); if(i===0){ctx.fillStyle='#efe2c4'; ctx.fillRect(Math.round(v.x)-3,Math.round(v.y)-14,6,5); ctx.fillStyle='#c94a3a'; ctx.fillRect(Math.round(v.x)-2,Math.round(v.y)-12,4,1)}}})) },
  over(){
    const tf=ctx.getTransform(), cx=-tf.e, cy=-tf.f;
    // rhythm ring: closes in on you every beat (shown on climbs, where it matters most)
    if(birk.running&&birk.crashT<=0){const ph=(birk.beatT%BIRK.BEAT)/BIRK.BEAT, r=4+ (1-ph)*18, up=terrainAt(P.y)==='up';
      ctx.strokeStyle=up?'rgba(79,38,131,.85)':'rgba(79,38,131,.3)'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.arc(P.x,P.y-8,r,0,Math.PI*2); ctx.stroke();
      if(birk.flashT>0){ctx.fillStyle=birk.flash==='good'?'#2f8a4a':'#c8322b'; ctx.font='8px monospace'; ctx.fillText(birk.flash==='good'?'push!':'off beat',P.x+10,P.y-18)}}
    // falling snow + messages
    ctx.fillStyle='rgba(255,255,255,.9)'; for(let i=0;i<40;i++){const sx=(i*53+time*.02*(1+i%3))%BIRK.W, sy=cy+(i*37+time*.04*(1+i%2))%168; ctx.fillRect(sx|0,sy|0,1,1)}
    if(terrainAt(P.y)==='lake'){ctx.fillStyle='rgba(255,255,255,.5)'; for(let i=0;i<20;i++){const x=(i*61+time*.25)%BIRK.W; ctx.fillRect(x|0,(cy+(i*29)%168)|0,6,1)}}
    if(birk.msgT>0){ctx.font='8px monospace'; const w=birk.msg.length*4.9+10; ctx.fillStyle='rgba(29,33,48,.85)'; ctx.fillRect(cx+(VW-w)/2,cy+30,w,13); ctx.fillStyle='#ffffff'; ctx.fillText(birk.msg,cx+(VW-w)/2+5,cy+39)}
  },
  hud(){
    if(!birk.running)return '';
    const s=sectionAt(P.y), pips=[...Array(10)].map((_,i)=>`<i class="${i<Math.ceil(birk.stamina/10)?'on fuel':''}"></i>`).join('');
    const rh=[...Array(5)].map((_,i)=>`<i class="${i<Math.round(birk.q*5)?'on':''}"></i>`).join('');
    return `<span>${clockStr(birk.t)}</span><span class="pips">Rhythm ${rh}</span><span class="pips">Energy ${pips}</span><span>${Math.round(P.y/FINISH_Y*50)}km</span>`;
  },
};
