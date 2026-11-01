// Fargo: drive the CR-V around town on fumes, find the cheapest gas, then stop Gary's pump on exactly $30.00.
const FW=448, FH=336;
const FUEL = {START:30, DRAIN:.03, ROAD:.12, SNOW:.06, PUSH:.025};  // fuel 0-100, drain per px; speeds in px/ms
const PRICES = ['2.99','3.09','3.15','3.19','3.29'];  // the others; Gary's is always 2.79
const CHEAPEST = '2.79';
const CAR_COLOR = {body:'#8fa3b8', dark:'#6c7f94', light:'#b9c8d6'};  // steel blue-gray; change to match his CR-V

const ROADS=[R(0,40,FW,24), R(0,168,FW,24), R(0,290,FW,24), R(40,0,24,FH), R(210,0,24,FH), R(380,0,24,FH)];
// stations: lot top-left and which side the road is on ('up' = road above the lot)
const STATIONS=[
  {x:90, y:64, face:'up',   brand:'#c8322b'},
  {x:310,y:64, face:'up',   brand:'#2f8a4a'},
  {x:130,y:192,face:'up',   brand:'#2f6db0'},
  {x:300,y:192,face:'up',   brand:'#e08a2a'},
  {x:110,y:262,face:'down', brand:'#7a4fa0'},
  {x:300,y:262,face:'down', brand:'#d2a32a'},
].map(s=>{
  const lot=R(s.x,s.y,48,28), store=s.face==='up'?R(s.x+4,s.y+28,40,20):R(s.x+4,s.y-20,40,20);
  return {...s, lot, store, island:R(s.x+18,s.y+11,12,6), sign:{x:s.x+50,y:s.y+2},
    person:{x:s.x+38,y:s.y+20}, price:'', seen:false, name:''};
});
const HOUSES=[R(70,124,24,20),R(110,132,26,20),R(244,74,26,20),R(244,118,26,20),R(284,130,22,20),
  R(70,200,24,20),R(70,240,24,20),R(184,250,22,20),R(244,200,26,20),R(244,250,26,20),
  R(8,86,24,18),R(412,80,28,20),R(412,210,28,20),R(80,8,26,20),R(260,10,26,20),R(412,250,28,20)];
const TOWER={x:186,y:142};
const WELCOME=R(12,196,24,12);

const fargo={fuel:FUEL.START, gary:0, introPending:false, warned:false, won:false};
let fargoTrees=[];

function fargoNewRun(){
  fargo.fuel=FUEL.START; fargo.warned=false;
  const others=[...PRICES].sort(()=>Math.random()-.5), names=[...FARGO.attendants].sort(()=>Math.random()-.5);
  fargo.gary=Math.floor(Math.random()*STATIONS.length);
  let k=0; STATIONS.forEach((s,i)=>{s.seen=false; s.price=i===fargo.gary?CHEAPEST:others[k]; s.name=i===fargo.gary?FARGO.gary:names[k]; if(i!==fargo.gary)k++});
}

// ---------- tiny pixel font ----------
const GLYPH={'0':'111101101101111','1':'010110010010111','2':'111001111100111','3':'111001111001111','4':'101101111001001',
  '5':'111100111001111','6':'111100111101111','7':'111001010010010','8':'111101111101111','9':'111101111001111',
  '?':'111001011000010','F':'111100110100100','A':'010101111101101','R':'110101110101101','G':'011100101101011','O':'010101101101010'};
function pixText(g,str,x,y,color){
  g.fillStyle=color;
  for(const ch of str){
    if(ch==='.'){g.fillRect(x,y+4,1,1); x+=2; continue}
    const m=GLYPH[ch]; if(m)for(let i=0;i<15;i++)if(m[i]==='1')g.fillRect(x+i%3,y+(i/3|0),1,1);
    x+=4;
  }
}

// ---------- the town, painted once ----------
const fargoBg=document.createElement('canvas'); fargoBg.width=FW; fargoBg.height=FH;
(function(){
  const g=fargoBg.getContext('2d'), F=(c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};
  F('#eef3f7',0,0,FW,FH); for(let i=0;i<900;i++)F(rnd()<.5?'#dde6ef':'#ffffff',rnd()*FW|0,rnd()*FH|0,2,1);
  for(const r of ROADS){F('#9a9690',r.x,r.y,r.w,r.h); for(let i=0;i<r.w*r.h/25;i++)F(rnd()<.5?'#8b8780':'#a9a59e',r.x+rnd()*r.w|0,r.y+rnd()*r.h|0,1,1)}
  for(const r of ROADS){   // slushy tire tracks + snowbank edges
    if(r.w>r.h){F('#86827b',r.x,r.y+7,r.w,2);F('#86827b',r.x,r.y+15,r.w,2);F('#dfe7ee',r.x,r.y,r.w,1);F('#dfe7ee',r.x,r.y+r.h-1,r.w,1)}
    else{F('#86827b',r.x+7,r.y,2,r.h);F('#86827b',r.x+15,r.y,2,r.h);F('#dfe7ee',r.x,r.y,1,r.h);F('#dfe7ee',r.x+r.w-1,r.y,1,r.h)}
  }
  for(const s of STATIONS){
    F('#b4b2ad',s.lot.x,s.lot.y,s.lot.w,s.lot.h); for(let x=s.lot.x+4;x<s.lot.x+44;x+=8)F('#a3a19c',x,s.lot.y+4,1,20);
    const st=s.store; F('#d9d4c8',st.x,st.y,st.w,st.h); F(s.brand,st.x,st.y,st.w,4); F('#9fd2f0',st.x+4,st.y+8,10,7); F('#9fd2f0',st.x+26,st.y+8,10,7);
    F('#6b6f7a',st.x+16,s.face==='up'?st.y+8:st.y+8,8,12); F('#ffffff',st.x,st.y-2,st.w,2);
    F('#8a8f9a',s.island.x,s.island.y,s.island.w,s.island.h); F(s.brand,s.island.x+2,s.island.y-3,3,6); F(s.brand,s.island.x+7,s.island.y-3,3,6);
    F('#8a8f9a',s.sign.x+8,s.sign.y+9,2,14);   // sign pole
  }
  for(const h of HOUSES){
    F('#b5654f',h.x,h.y+6,h.w,h.h-6); F('#ffffff',h.x-1,h.y,h.w+2,8); F('#e3ebf2',h.x-1,h.y+6,h.w+2,2);
    F('#ffd98a',h.x+4,h.y+11,5,4); F('#ffd98a',h.x+h.w-9,h.y+11,5,4); F('#5a3a22',h.x+h.w/2-2|0,h.y+h.h-7,5,7);
  }
  // welcome sign
  F('#8a8f9a',WELCOME.x+3,WELCOME.y+10,2,6); F('#8a8f9a',WELCOME.x+19,WELCOME.y+10,2,6);
  F('#2f5f9e',WELCOME.x,WELCOME.y,24,11); F('#ffffff',WELCOME.x,WELCOME.y,24,1); pixText(g,'FARGO',WELCOME.x+3,WELCOME.y+3,'#ffffff');
})();
// pine trees scattered where nothing else is
(function(){
  const blocked=r=>[...ROADS,...HOUSES,...STATIONS.flatMap(s=>[s.lot,s.store,R(s.sign.x-2,s.sign.y-2,22,24)]),R(TOWER.x-18,TOWER.y-40,36,46),R(0,160,40,60),WELCOME]
    .some(o=>hit(R(r.x-3,r.y-3,r.w+6,r.h+6),o));
  for(let n=0;n<400&&fargoTrees.length<34;n++){const x=8+rnd()*(FW-16)|0, y=16+rnd()*(FH-20)|0; const box=R(x-6,y-16,12,17);
    if(!blocked(box)&&!fargoTrees.some(([tx,ty])=>Math.abs(tx-x)<12&&Math.abs(ty-y)<14))fargoTrees.push([x,y])}
})();
const pineSprite=document.createElement('canvas'); pineSprite.width=12; pineSprite.height=18;
(function(){const g=pineSprite.getContext('2d'), F=(c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};
  F('#5a3a22',5,14,2,4); F('#2f5e3a',1,10,10,5); F('#356b42',2,6,8,5); F('#3d7a4a',4,2,4,5); F('#5a3a22',5,0,2,2);
  F('#ffffff',1,10,4,1); F('#ffffff',7,10,3,1); F('#ffffff',2,6,3,1); F('#ffffff',6,6,3,1); F('#ffffff',4,2,4,1);})();

// ---------- the CR-V ----------
const carSprites={};
(function(){
  const base=document.createElement('canvas'); base.width=24; base.height=14;
  const g=base.getContext('2d'), F=(c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(x,y,w,h)}, C=CAR_COLOR;
  F('#1d1d22',4,0,5,2); F('#1d1d22',15,0,5,2); F('#1d1d22',4,12,5,2); F('#1d1d22',15,12,5,2);   // tires
  F(C.body,1,2,22,10); F(C.body,0,3,24,8);                                    // boxy body, facing right
  F(C.light,16,3,6,8);                                                        // hood
  F('#2b3a4f',13,3,3,8); F('#2b3a4f',2,3,2,8); F('#2b3a4f',5,2,7,1); F('#2b3a4f',5,11,7,1);  // windshield, rear glass, side windows
  F(C.dark,4,3,9,8); F('#c9d1d8',5,4,7,1); F('#c9d1d8',5,9,7,1);            // roof + roof rails
  F('#ffffff',6,5,3,1); F('#ffffff',9,7,2,1);                               // a little snow on the roof
  F('#fff3c4',23,3,1,2); F('#fff3c4',23,9,1,2); F('#d33b2f',0,3,1,2); F('#d33b2f',0,9,1,2);   // lights
  carSprites.right=base;
  const mk=(w,h,fn)=>{const c=document.createElement('canvas'); c.width=w; c.height=h; const x=c.getContext('2d'); fn(x); return c};
  carSprites.left=mk(24,14,x=>{x.translate(24,0);x.scale(-1,1);x.drawImage(base,0,0)});
  carSprites.down=mk(14,24,x=>{x.translate(14,0);x.rotate(Math.PI/2);x.drawImage(base,0,0)});
  carSprites.up=mk(14,24,x=>{x.translate(0,24);x.rotate(-Math.PI/2);x.drawImage(base,0,0)});
})();
function drawCar(x,y){
  const s=carSprites[P.dir]||carSprites.right, ox=Math.round(x-s.width/2), oy=Math.round(y-s.height/2);
  ctx.fillStyle='rgba(0,0,0,.18)'; ctx.fillRect(ox+1,oy+s.height-2,s.width-2,3);
  ctx.drawImage(s,ox,oy);
  if(fargo.fuel<=0&&P.moving){ctx.fillStyle='#fff'; ctx.fillRect(ox-3+((time/120|0)%2),oy+s.height/2,2,2)}   // puffs while pushing
}

// ---------- people ----------
function drawGary(x,y){
  const F=(c,dx,dy,w,h)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x)-6+dx,Math.round(y)-19+dy,w,h)};
  F('rgba(0,0,0,.2)',1,18,10,2);
  F('#3a5f9e',3,12,3,6); F('#3a5f9e',6,12,3,6); F('#3b2a1e',2,17,4,2); F('#3b2a1e',6,17,4,2);
  F('#c0392b',1,6,10,7); F('#a8302a',1,8,10,1); F('#a8302a',1,10,10,1); F('#c0392b',0,7,1,5); F('#c0392b',11,7,1,5);   // puffy coat
  F('#e9b98f',3,2,6,5); F('#6b4a2f',4,5,4,1);                                 // face + mustache
  F('#6b4a2f',2,0,8,3); F('#6b4a2f',1,2,2,4); F('#6b4a2f',9,2,2,4); F('#efe2c4',2,2,8,1);   // trapper hat with flaps
  F('#2b2b2b',4,3,1,1); F('#2b2b2b',7,3,1,1);
}
function drawAttendant(x,y,i){
  const coats=['#2f6db0','#2f8a4a','#7a4fa0','#e08a2a','#555b66'], F=(c,dx,dy,w,h)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x)-5+dx,Math.round(y)-17+dy,w,h)};
  F('rgba(0,0,0,.2)',1,16,8,2); F('#2c3e5a',2,11,3,5); F('#2c3e5a',5,11,3,5);
  F(coats[i%coats.length],1,5,8,7); F('#e9b98f',2,1,6,4); F(['#c8322b','#f4d35e','#3d8ad6'][i%3],2,0,6,2); F('#2b2b2b',3,3,1,1); F('#2b2b2b',6,3,1,1);
}
function drawWaterTower(){
  const F=(c,x,y,w,h)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h)}, x=TOWER.x, y=TOWER.y;
  F('#7d8694',x-12,y-18,2,18); F('#7d8694',x+10,y-18,2,18); F('#7d8694',x-1,y-18,2,18); F('#7d8694',x-11,y-10,22,1);
  F('#9fb0c2',x-15,y-36,30,18); F('#b9c8d6',x-15,y-36,30,3); F('#7d8fa2',x-15,y-20,30,2); F('#ffffff',x-13,y-39,26,3);
  pixText(ctx,'FARGO',x-10,y-30,'#2f5f9e');
}
function drawSign(s){
  const near=s.seen, x=s.sign.x, y=s.sign.y;
  ctx.fillStyle='#1d2433'; ctx.fillRect(x,y,18,10); ctx.fillStyle=s.brand; ctx.fillRect(x,y,18,2);
  pixText(ctx, near?s.price:'?.??', x+2, y+4, near?(s.price===CHEAPEST?'#7dff8a':'#ffd84d'):'#58607a');
}

// ---------- the pump ----------
const pump={open:false, cents:0, holding:false, heldMs:0, frac:0, lock:0, tries:0};
function openPump(){
  pump.open=true; pump.cents=0; pump.frac=0; pump.holding=false; pump.lock=0; pump.tries=0;
  $('pumpTitle').textContent=FARGO.pumpTitle; $('pumpMsg').textContent=FARGO.pumpHint; renderPump();
  paused=true; prompt.hidden=true; $('pump').hidden=false; setTimeout(()=>$('pumpBtn').focus({preventScroll:true}),0);
}
function renderPump(){
  $('pumpSale').textContent='$'+(pump.cents/100).toFixed(2);
  $('pumpGal').textContent=(pump.cents/279).toFixed(3);
  $('pump').classList.toggle('over',pump.cents>3000);
}
function pumpPress(){ if(!pump.open||pump.lock>0||pump.holding)return; pump.holding=true; pump.heldMs=0; $('pumpBtn').classList.add('on') }
function pumpRelease(){
  if(!pump.holding)return; pump.holding=false; $('pumpBtn').classList.remove('on');
  if(pump.cents>3000){
    $('pumpMsg').textContent=FARGO.bust[pump.tries++%FARGO.bust.length]; pump.lock=1300;
  } else if(pump.cents===3000){
    pump.lock=99999; $('pumpMsg').textContent='$30.00 on the nose!';
    setTimeout(()=>{ $('pump').hidden=true; pump.open=false; fargo.won=true; have.fargoWon=true; save();
      showDialog({place:FARGO.place,speaker:FARGO.gary,pages:FARGO.win,actions:[{label:FARGO.thanks,fn:()=>{closeDialog();showReward('fargo')}}]}) },700);
  }
}
function pumpTick(dt){
  if(!pump.open)return;
  if(pump.lock>0&&pump.lock<99999){pump.lock-=dt; if(pump.lock<=0){pump.cents=0; pump.frac=0; $('pumpMsg').textContent=FARGO.pumpHint; renderPump()}}
  if(pump.holding){
    pump.heldMs+=dt; const rate=Math.min(650,12+pump.heldMs*.9);     // cents per second, speeds up the longer you hold
    pump.frac+=rate*dt/1000; const add=Math.floor(pump.frac); if(add){pump.frac-=add; pump.cents+=add; renderPump()}
  }
}
$('pumpBtn').addEventListener('pointerdown',e=>{e.preventDefault();pumpPress()});
['pointerup','pointerleave','pointercancel'].forEach(t=>$('pumpBtn').addEventListener(t,pumpRelease));
// Space/Enter hold works too; runs before the normal controls so they don't also fire
addEventListener('keydown',e=>{if(!pump.open)return; if(['Space','Enter'].includes(e.code)){e.preventDefault(); e.stopImmediatePropagation(); if(!e.repeat)pumpPress()} else if(e.code!=='Tab'){e.preventDefault(); e.stopImmediatePropagation()}},true);
addEventListener('keyup',e=>{if(pump.open&&['Space','Enter'].includes(e.code)){e.preventDefault(); e.stopImmediatePropagation(); pumpRelease()}},true);

// ---------- pulling into a station ----------
function pullIn(i){
  const s=STATIONS[i]; s.seen=true;
  if(i===fargo.gary){
    if(have.fargo) return showDialog({place:FARGO.place,speaker:FARGO.gary,pages:[FARGO.after],actions:[CLOSE]});
    if(fargo.won||have.fargoWon) return showReward('fargo');
    return showDialog({place:FARGO.place,speaker:FARGO.gary,pages:[...FARGO.garyHello,...FARGO.garyBet],actions:[{label:FARGO.fill,fn:()=>{closeDialog();openPump()}}]});
  }
  showDialog({place:FARGO.place,speaker:s.name,pages:[FARGO.ask(s.price)],actions:[
    {label:FARGO.fill,fn:()=>{
      if(have.fargo) return showDialog({place:FARGO.place,speaker:s.name,pages:[`Tank's full. At $${s.price} a gallon. Gary's is cheaper, ya know.`],actions:[CLOSE]});
      showDialog({place:FARGO.place,speaker:s.name,pages:FARGO.wrong(s.price),actions:[{label:FARGO.retry,fn:()=>{closeDialog();goTo('fargo','fromHighway')}}]})}},
    {label:FARGO.keep,ghost:true,fn:closeDialog}]});
}
const FARGO_TRIGGERS=[
  {z:R(0,166,6,28), label:FARGO.leave, act:()=>goTo('world','fromFargo')},
  ...STATIONS.map((s,i)=>({z:s.lot, label:'Pull up to the pump', act:()=>pullIn(i)})),
];
const onRoad=(x,y)=>ROADS.some(r=>x>=r.x&&x<=r.x+r.w&&y>=r.y&&y<=r.y+r.h)||STATIONS.some(s=>x>=s.lot.x&&x<=s.lot.x+s.lot.w&&y>=s.lot.y&&y<=s.lot.y+s.lot.h);

SCENES.fargo={
  w:FW, h:FH, bounds:R(0,0,FW,FH), bg:fargoBg, triggers:FARGO_TRIGGERS,
  solids:[...HOUSES, ...STATIONS.flatMap(s=>[s.store,s.island,R(s.sign.x+7,s.sign.y+14,4,4),R(s.person.x-3,s.person.y-3,6,4)]),
    ...fargoTrees.map(([x,y])=>R(x-3,y-2,6,3)), R(TOWER.x-13,TOWER.y-4,26,5), R(WELCOME.x,WELCOME.y+10,24,6)],
  entries:{start:{x:20,y:180,dir:'right'}, fromHighway:{x:20,y:180,dir:'right'}},
  feet:(x,y)=>R(x-6,y-4,12,8),
  speed:()=>fargo.fuel<=0?FUEL.PUSH:(onRoad(P.x,P.y)?FUEL.ROAD:FUEL.SNOW),
  moved(d){
    if(fargo.fuel>0){fargo.fuel=Math.max(0,fargo.fuel-d*FUEL.DRAIN);
      if(fargo.fuel<=0&&!fargo.warned){fargo.warned=true; showDialog({place:FARGO.place,speaker:'Uh oh',pages:[FARGO.empty],actions:[CLOSE]})}}
  },
  enter(){ fargoNewRun(); fargo.introPending=!have.fargo&&!have.fargoWon },
  ambient(dt){ pumpTick(dt) },
  update(){
    if(fargo.introPending){fargo.introPending=false; return showDialog({place:FARGO.place,speaker:'Welcome to Fargo',pages:FARGO.intro,actions:[CLOSE]})}
    for(const s of STATIONS)if(!s.seen&&Math.hypot(P.x-(s.sign.x+9),P.y-(s.sign.y+5))<80)s.seen=true;
  },
  drawPlayer:drawCar,
  ents(list){
    fargoTrees.forEach(([x,y])=>list.push({y,draw:()=>ctx.drawImage(pineSprite,x-6,y-17)}));
    list.push({y:TOWER.y,draw:drawWaterTower});
    STATIONS.forEach((s,i)=>list.push({y:s.person.y,draw:()=>i===fargo.gary?drawGary(s.person.x,s.person.y):drawAttendant(s.person.x,s.person.y,i)}));
  },
  under(){ STATIONS.forEach(drawSign) },
  over(){
    for(const s of STATIONS){ // canopies over the pumps
      ctx.fillStyle='rgba(0,0,0,.08)'; ctx.fillRect(s.x+6,s.y+8,40,14);
      ctx.fillStyle='#f1f4f8'; ctx.fillRect(s.x+8,s.y+3,32,10); ctx.fillStyle=s.brand; ctx.fillRect(s.x+8,s.y+11,32,2);
    }
    ctx.fillStyle='rgba(255,255,255,.85)';  // light snow
    for(let i=0;i<50;i++){const sx=(i*97+time*.02*(1+i%3))%FW, sy=(i*53+time*.03*(1+i%2))%FH; ctx.fillRect(sx|0,sy|0,1,1)}
  },
  hud(){
    const bars=10, on=Math.ceil(fargo.fuel/10);
    const gauge=[...Array(bars)].map((_,i)=>`<i class="${i<on?'on fuel':''}"></i>`).join('');
    const seen=STATIONS.filter(s=>s.seen).map(s=>s.price).sort();
    return `<span class="pips" title="Fuel">${fargo.fuel<=0?'EMPTY':'Fuel'} ${gauge}</span><span>${seen.length?'Best $'+seen[0]:'No prices yet'}</span>`;
  },
};
fargoNewRun();
