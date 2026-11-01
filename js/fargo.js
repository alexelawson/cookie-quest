// Fargo: drive the CR-V around town on fumes, find the cheapest gas, stop Gary's pump on exactly $30.00,
// then walk into his shop and pick the right drink + snack for Alex.
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
  const door=s.face==='up'?R(s.x+16,s.y+20,16,9):R(s.x+16,s.y-1,16,9);   // the shop door, from the lot side
  return {...s, lot, store, door, island:R(s.x+18,s.y+11,12,6), sign:{x:s.x+50,y:s.y+2},
    person:{x:s.x+38,y:s.y+20}, price:'', seen:false, name:''};
});
const HOUSES=[R(70,124,24,20),R(110,132,26,20),R(244,74,26,20),R(244,118,26,20),R(284,130,22,20),
  R(70,200,24,20),R(70,240,24,20),R(184,250,22,20),R(244,200,26,20),R(244,250,26,20),
  R(8,86,24,18),R(412,80,28,20),R(412,210,28,20),R(80,8,26,20),R(260,10,26,20),R(412,250,28,20)];
const TOWER={x:186,y:142};
const WELCOME=R(12,196,24,12);

const fargo={fuel:FUEL.START, gary:0, introPending:false, warned:false, won:false,
  onFoot:false, car:null, alex:null, alexMood:'ok', moodT:0, wallet:0, strikes:0};
// have.fargoStage remembers progress across reloads: 'store' (pump done, go shopping), 'reward' (sugar not yet taken)
let fargoTrees=[];

function fargoNewRun(){
  fargo.fuel=FUEL.START; fargo.warned=false;
  const others=[...PRICES].sort(()=>Math.random()-.5), names=[...FARGO.attendants].sort(()=>Math.random()-.5);
  fargo.gary=have.fargoGary!=null?have.fargoGary:Math.floor(Math.random()*STATIONS.length);
  fargo.onFoot=false; fargo.car=null; fargo.alex=null; fargo.alexMood='ok'; fargo.strikes=0;
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
    F('#6b6f7a',st.x+16,s.face==='up'?st.y+2:st.y+st.h-12,8,12); F('#ffd98a',st.x+22,s.face==='up'?st.y+8:st.y+st.h-6,1,2); F('#ffffff',st.x,st.y-2,st.w,2);
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
function drawCar(x,y,dir=P.dir){
  const s=carSprites[dir]||carSprites.right, ox=Math.round(x-s.width/2), oy=Math.round(y-s.height/2);
  ctx.fillStyle='rgba(0,0,0,.18)'; ctx.fillRect(ox+1,oy+s.height-2,s.width-2,3);
  ctx.drawImage(s,ox,oy);
  if(fargo.fuel<=0&&P.moving&&!fargo.onFoot){ctx.fillStyle='#fff'; ctx.fillRect(ox-3+((time/120|0)%2),oy+s.height/2,2,2)}   // puffs while pushing
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
// Alex: long dark brown hair, brown eyes, green winter coat. Her mood shows in a little bubble.
function drawAlex(x,y,mood){
  const F=(c,dx,dy,w,h)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x)-6+dx,Math.round(y)-19+dy,w,h)};
  const hair='#3b2416', hairL='#4e3020', skin='#f2c9a5', eye='#5a3a22', coat='#3f6b4f';
  F('rgba(0,0,0,.2)',1,18,10,2);
  F('#2c2c34',3,13,3,5); F('#2c2c34',6,13,3,5); F('#3b2a1e',2,17,4,2); F('#3b2a1e',6,17,4,2);
  F(coat,2,7,8,7); F(coat,1,8,1,5); F(coat,10,8,1,5); F('#335a42',6,7,1,7);
  F(hair,2,0,8,3); F(hair,1,2,2,10); F(hair,9,2,2,10); F(hairL,2,1,3,1);   // long hair down past the shoulders
  F(skin,3,2,6,5); F(hair,3,2,4,1); F(hair,3,3,1,1);   // side-swept fringe
  F(eye,4,4,1,1); F(eye,7,4,1,1);
  if(mood==='happy'){F('#c0645a',5,6,2,1); F('#f0a39a',3,5,1,1); F('#f0a39a',8,5,1,1)}
  else if(mood==='frown'){F('#8a4a40',5,6,2,1); F('#8a4a40',4,7,1,1); F('#8a4a40',7,7,1,1); F(hair,4,3,1,1); F(hair,7,3,1,1)}
  else F('#b5735a',5,6,2,1);
  if(mood!=='ok'){ // bubble
    const bx=Math.round(x)+5, by=Math.round(y)-30; ctx.fillStyle='#ffffff'; ctx.fillRect(bx,by,9,8); ctx.fillRect(bx+1,by+8,2,2);
    ctx.fillStyle=mood==='happy'?'#e54b7a':'#4a4a5a';
    if(mood==='happy'){ctx.fillRect(bx+2,by+2,2,2);ctx.fillRect(bx+5,by+2,2,2);ctx.fillRect(bx+2,by+3,5,2);ctx.fillRect(bx+3,by+5,3,1);ctx.fillRect(bx+4,by+6,1,1)}
    else {ctx.fillRect(bx+2,by+2,1,1);ctx.fillRect(bx+6,by+2,1,1);ctx.fillRect(bx+3,by+5,3,1);ctx.fillRect(bx+2,by+6,1,1);ctx.fillRect(bx+6,by+6,1,1)}
  }
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
    setTimeout(()=>{ $('pump').hidden=true; pump.open=false; have.fargoStage='store'; have.fargoGary=fargo.gary; save();
      showDialog({place:FARGO.place,speaker:FARGO.gary,pages:FARGO.pumpWin,actions:[{label:FARGO.goInside,fn:()=>{closeDialog();parkAndGetOut()}}]}) },700);
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
    if(have.fargoStage==='reward') return showReward('fargo');
    if(have.fargoStage==='store') return showDialog({place:FARGO.place,speaker:FARGO.gary,pages:[FARGO.garyWaiting],actions:[CLOSE]});
    return showDialog({place:FARGO.place,speaker:FARGO.gary,pages:[...FARGO.garyHello,...FARGO.garyBet],actions:[{label:FARGO.fill,fn:()=>{closeDialog();openPump()}}]});
  }
  if(fargo.onFoot) return;
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
  w:FW, h:FH, bounds:R(0,0,FW,FH), bg:fargoBg,
  get triggers(){ return fargo.onFoot?[]:FARGO_TRIGGERS },
  baseSolids:[...HOUSES, ...STATIONS.flatMap(s=>[s.store,s.island,R(s.sign.x+7,s.sign.y+14,4,4),R(s.person.x-3,s.person.y-3,6,4)]),
    ...fargoTrees.map(([x,y])=>R(x-3,y-2,6,3)), R(TOWER.x-13,TOWER.y-4,26,5), R(WELCOME.x,WELCOME.y+10,24,6)],
  get solids(){ if(!fargo.onFoot||!fargo.car)return this.baseSolids; const c=fargo.car, a=fargo.alex;
    return [...this.baseSolids, c.dir==='up'||c.dir==='down'?R(c.x-6,c.y-11,12,22):R(c.x-11,c.y-6,22,12), ...(a?[R(a.x-3,a.y-3,6,4)]:[])] },
  entries:{start:{x:20,y:180,dir:'right'}, fromHighway:{x:20,y:180,dir:'right'}},
  feet:(x,y)=>fargo.onFoot?R(x-4,y-3,8,4):R(x-6,y-4,12,8),
  speed:()=>fargo.onFoot?.07:fargo.fuel<=0?FUEL.PUSH:(onRoad(P.x,P.y)?FUEL.ROAD:FUEL.SNOW),
  dynTrigger(){
    const g=STATIONS[fargo.gary];
    if(!fargo.onFoot)return null;
    if(have.fargoStage==='store'&&hit(R(P.x-4,P.y-3,8,4),g.door))return SHOP_TRIGGER;
    if(fargo.alex&&Math.hypot(P.x-fargo.alex.x,P.y-fargo.alex.y)<14)return ALEX_TRIGGER;
    if(Math.hypot(P.x-g.person.x,P.y-g.person.y)<14)return GARY_TRIGGER;
    return null;
  },
  moved(d){
    if(!fargo.onFoot&&fargo.fuel>0){fargo.fuel=Math.max(0,fargo.fuel-d*FUEL.DRAIN);
      if(fargo.fuel<=0&&!fargo.warned){fargo.warned=true; showDialog({place:FARGO.place,speaker:'Uh oh',pages:[FARGO.empty],actions:[CLOSE]})}}
  },
  enter(){
    fargoNewRun(); fargo.introPending=!have.fargo&&!have.fargoStage&&!have.fargoIntro;
    if(have.fargoStage==='store'){   // came back mid-errand (e.g. after a reload): car's already parked at Gary's
      const g=STATIONS[fargo.gary]; STATIONS.forEach(s=>s.seen=true); P.x=g.lot.x+10; P.y=g.lot.y+22; P.dir='right'; parkAndGetOut();
    }
  },
  ambient(dt){ pumpTick(dt); if(fargo.moodT>0){fargo.moodT-=dt; if(fargo.moodT<=0)fargo.alexMood='ok'} },
  update(){
    if(fargo.introPending){fargo.introPending=false; have.fargoIntro=true; save(); return showDialog({place:FARGO.place,speaker:'Welcome to Fargo',pages:FARGO.intro,actions:[CLOSE]})}
    for(const s of STATIONS)if(!s.seen&&Math.hypot(P.x-(s.sign.x+9),P.y-(s.sign.y+5))<80)s.seen=true;
  },
  drawPlayer:(x,y)=>fargo.onFoot?drawPlayer(x,y):drawCar(x,y),
  ents(list){
    fargoTrees.forEach(([x,y])=>list.push({y,draw:()=>ctx.drawImage(pineSprite,x-6,y-17)}));
    list.push({y:TOWER.y,draw:drawWaterTower});
    STATIONS.forEach((s,i)=>list.push({y:s.person.y,draw:()=>i===fargo.gary?drawGary(s.person.x,s.person.y):drawAttendant(s.person.x,s.person.y,i)}));
    if(fargo.onFoot&&fargo.car){const c=fargo.car, a=fargo.alex; list.push({y:c.y+5,draw:()=>drawCar(c.x,c.y,c.dir)});
      if(a)list.push({y:a.y,draw:()=>drawAlex(a.x,a.y,fargo.alexMood)})}
  },
  under(){ STATIONS.forEach(drawSign) },
  over(){
    for(const s of STATIONS){ // canopies over the pumps
      ctx.fillStyle='rgba(0,0,0,.08)'; ctx.fillRect(s.x+6,s.y+8,40,14);
      ctx.fillStyle='rgba(241,244,248,.6)'; ctx.fillRect(s.x+8,s.y+3,32,10); ctx.fillStyle=s.brand; ctx.fillRect(s.x+8,s.y+11,32,2);   // see-through so the car shows
    }
    ctx.fillStyle='rgba(255,255,255,.85)';  // light snow
    for(let i=0;i<50;i++){const sx=(i*97+time*.02*(1+i%3))%FW, sy=(i*53+time*.03*(1+i%2))%FH; ctx.fillRect(sx|0,sy|0,1,1)}
  },
  hud(){
    if(fargo.onFoot) return `<span>Wallet $${fargo.wallet.toFixed(2)}</span><span class="pips" title="Strikes">Strikes ${[...Array(FARGO.strikesOut)].map((_,i)=>`<i class="${i<fargo.strikes?'on':''}"></i>`).join('')}</span>`;
    const bars=10, on=Math.ceil(fargo.fuel/10);
    const gauge=[...Array(bars)].map((_,i)=>`<i class="${i<on?'on fuel':''}"></i>`).join('');
    const seen=STATIONS.filter(s=>s.seen).map(s=>s.price).sort();
    return `<span class="pips" title="Fuel">${fargo.fuel<=0?'EMPTY':'Fuel'} ${gauge}</span><span>${seen.length?'Best $'+seen[0]:'No prices yet'}</span>`;
  },
};
fargoNewRun();

// ---------- on foot + the shop ----------
const SHOP_TRIGGER={label:'Go inside', act:()=>openShop()};
const ALEX_TRIGGER={label:'Talk to Alex', btn:'Talk', act:()=>showDialog({place:FARGO.place,speaker:'Alex',pages:[fargo.alexMood==='frown'?FARGO.alexOutside:FARGO.alexWaiting],actions:[CLOSE]})};
const GARY_TRIGGER={label:'Talk to Gary', btn:'Talk', act:()=>showDialog({place:FARGO.place,speaker:FARGO.gary,pages:[FARGO.garyWaiting],actions:[CLOSE]})};
function parkAndGetOut(){
  // the car pulls up to the pump on the side away from the shop, so the door is always clear
  const g=STATIONS[fargo.gary];
  const c={x:g.x+24, y:g.face==='up'?g.y+5:g.y+23, dir:'right'}; fargo.car=c; fargo.onFoot=true; fargo.wallet=FARGO.wallet; fargo.strikes=0;
  fargo.alex=null; const a=freeSpotNear(c.x-18, c.y); fargo.alex=a;        // Alex leans by the back of the car
  const me=freeSpotNear(g.x+9, g.face==='up'?g.y+22:g.y+6); P.x=me.x; P.y=me.y;   // you, on the shop side
  P.dir=g.face==='up'?'down':'up'; P.moving=false;
}
// nearest place you can stand around (cx,cy), not on top of the car, Alex, or the door itself
function freeSpotNear(cx,cy){
  const sc=SCENES.fargo, door=STATIONS[fargo.gary].door;
  for(let r=0;r<40;r+=2)for(let a=0;a<16;a++){const x=Math.round(cx+Math.cos(a/16*Math.PI*2)*r), y=Math.round(cy+Math.sin(a/16*Math.PI*2)*r);
    if(!blocked(x,y,sc)&&!hit(R(x-4,y-3,8,4),door))return {x,y}}
  return {x:cx,y:cy};
}
function backInTheCar(){ if(fargo.car){P.x=fargo.car.x;P.y=fargo.car.y;P.dir=fargo.car.dir} fargo.onFoot=false; fargo.car=null; fargo.alex=null; fargo.fuel=100 }

const shop={open:false, drink:null, snack:null};
function itemButton(it,kind){
  const b=document.createElement('button'); b.className='item'; b.dataset.id=it.id; b.setAttribute('aria-pressed','false');
  const c=document.createElement('canvas'); c.width=16; c.height=20; ITEM_ART[it.id](c.getContext('2d'));
  const l=document.createElement('span'); l.textContent=it.name; b.append(c,l);
  b.onclick=()=>{shop[kind]=it.id; [...b.parentNode.children].forEach(x=>x.setAttribute('aria-pressed',x===b?'true':'false')); updateShop()};
  return b;
}
function openShop(){
  shop.open=true; shop.drink=null; shop.snack=null; fargo.strikes=0;
  $('shopName').textContent=FARGO.shop;
  $('fridge').replaceChildren(...FARGO.drinks.map(d=>itemButton(d,'drink')));
  $('shelf').replaceChildren(...FARGO.snacks.map(d=>itemButton(d,'snack')));
  $('giveBtn').textContent=FARGO.give;
  alexSays(FARGO.alexHello,'ok'); updateShop();
  paused=true; prompt.hidden=true; $('shop').hidden=false; $('shop').scrollTop=0;
  setTimeout(()=>$('fridge').querySelector('button').focus({preventScroll:true}),0);
}
function updateShop(){
  $('giveBtn').disabled=!(shop.drink&&shop.snack);
  $('shopWallet').textContent='$'+fargo.wallet.toFixed(2);
  $('shopStrikes').innerHTML=[...Array(FARGO.strikesOut)].map((_,i)=>`<i class="${i<fargo.strikes?'on':''}"></i>`).join('');
}
function alexSays(text,mood){
  $('alexLine').textContent=text; fargo.alexMood=mood; fargo.moodT=0;
  const c=$('alexFace'), g=c.getContext('2d'); g.clearRect(0,0,c.width,c.height); drawAlexFace(g,mood);
}
function giveToAlex(){
  if(!shop.open||!(shop.drink&&shop.snack))return;
  const C=FARGO.correct, d=FARGO.drinks.find(x=>x.id===shop.drink), k=FARGO.snacks.find(x=>x.id===shop.snack);
  if(shop.drink===C.drink&&shop.snack===C.snack){
    alexSays(FARGO.alexWin,'happy'); $('giveBtn').disabled=true;
    setTimeout(()=>{ closeShop(); fargo.alexMood='happy'; fargo.moodT=4000; have.fargoStage='reward'; save();
      showDialog({place:FARGO.place,speaker:FARGO.gary,pages:FARGO.win,actions:[{label:FARGO.thanks,fn:()=>{closeDialog();backInTheCar();showReward('fargo')}}]}) },1400);
    return;
  }
  const lines=[]; if(shop.drink!==C.drink)lines.push(d.react); if(shop.snack!==C.snack)lines.push(k.react);
  fargo.strikes++; fargo.wallet=Math.max(0,fargo.wallet-FARGO.wrongCost);
  alexSays(lines.join(' ')+` (-$${FARGO.wrongCost})`,'frown'); updateShop();
  if(fargo.strikes>=FARGO.strikesOut){
    $('giveBtn').disabled=true;
    setTimeout(()=>{ alexSays(FARGO.kickedOut,'frown'); setTimeout(()=>{
      closeShop(); fargo.alexMood='frown'; fargo.moodT=5000;
      const g=STATIONS[fargo.gary], d=g.door, cx=g.x+9, cy=g.face==='up'?g.y+22:g.y+6;   // back outside, beside the door
      const spot=freeSpotNear(cx,cy); P.x=spot.x; P.y=spot.y; P.dir=g.face==='up'?'down':'up';
    },1500) },1500);
  }
}
function closeShop(){ shop.open=false; $('shop').hidden=true; paused=false }
$('giveBtn').onclick=giveToAlex;

// Alex's face for the shop panel (40x40): long dark brown hair with a side part, brown eyes
function drawAlexFace(g,mood){
  const F=(c,x,y,w=1,h=1)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};
  const hair='#3a2216', hairD='#2a170f', hairL='#5a3626', skin='#f2c9a5', skinS='#e3b08c', eye='#5a3a22', lash='#24140c', coat='#3f6b4f', coatD='#335a42';
  // long hair behind (falls past the shoulders, slightly wavy)
  for(let y=5;y<39;y++){let w; if(y<17){const t=(17-y)/12; w=Math.sqrt(Math.max(0,1-t*t))*13.5} else w=13.5-Math.max(0,y-32)*0.6;
    const wave=Math.round(Math.sin(y/2.6)*0.8); F(hair,Math.round(20-w)+wave,y,Math.round(w*2)-wave*2,1)}
  F(hairD,7,26,2,12); F(hairD,31,26,2,12);
  // shoulders + coat, neck
  F(coat,8,35,24,5); F(coat,6,37,28,3); F(coatD,19,35,2,5); F(skinS,17,30,6,5); F(skin,17,30,6,3);
  // face (soft oval, narrower toward the chin)
  for(let y=9;y<31;y++){const t=(y-19.5)/11.2; let hw=Math.sqrt(Math.max(0,1-t*t))*9.8; if(y>24)hw*=1-(y-24)*0.035; F(skin,Math.round(20-hw),y,Math.round(hw*2),1)}
  F(skinS,11,24,1,2); F(skinS,28,24,1,2);   // jaw shading
  // hair in front
  // side part, sweeping across the forehead // side part, sweeping across the forehead
    F(hair,11,6,18,4); F(hair,10,8,7,5); F(hair,16,9,9,2); F(hair,24,9,6,3); F(hair,9,12,3,18); F(hair,28,12,3,18); F(hair,14,11,4,1);
    F(hairL,15,7,6,1); F(hairL,13,9,3,1); F(hairL,10,16,1,8); F(hairL,29,18,1,7);
  
  // eyebrows
  if(mood==='frown'){F(hairD,14,15,4); F(hairD,17,16,1); F(hairD,22,16,1); F(hairD,22,15,4)}
  else if(mood==='happy'){F(hairD,14,14,4); F(hairD,22,14,4)}
  else {F(hairD,14,15,4); F(hairD,22,15,4)}
  // eyes: lash line, white, brown iris, sparkle
  if(mood==='happy'){ // smiling eyes
    F(lash,14,19,1); F(lash,15,18,2); F(lash,17,19,1); F(lash,22,19,1); F(lash,23,18,2); F(lash,25,19,1);
  } else {
    F(lash,14,17,4); F(lash,13,17,1); F(lash,22,17,4); F(lash,26,17,1);
    F('#ffffff',14,18,4,2); F('#ffffff',22,18,4,2);
    F(eye,15,18,2,2); F(eye,23,18,2,2); F('#ffffff',15,18,1,1); F('#ffffff',23,18,1,1);
    if(mood==='frown'){F(skinS,14,18,4,1); F(skinS,22,18,4,1); F(lash,14,18,4,1); F(lash,22,18,4,1)}
  }
  // nose
  F(skinS,20,21,1,2); F(skinS,19,23,1,1);
  // cheeks
  if(mood!=='frown'){F('#f2a7a0',13,22,2,1); F('#f2a7a0',25,22,2,1)}
  // mouth
  if(mood==='happy'){F('#b4544c',17,25,6); F('#b4544c',16,24,1); F('#b4544c',23,24,1); F('#ffffff',18,25,4); F('#b4544c',18,26,4)}
  else if(mood==='frown'){F('#a85a50',17,26,6); F('#a85a50',16,27,1); F('#a85a50',23,27,1)}
  else {F('#c06a60',18,26,4); F('#d98a80',17,26,1); F('#d98a80',22,26,1)}
}

// pixel art for the shop items (16x20). Simple shapes and colors, no real packaging.
const ITEM_ART={
  coke(g){const F=(c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(x,y,w,h)}; F('#c9ced4',4,2,8,2); F('#c8102e',4,4,8,14); F('#9e0c24',4,4,1,14); F('#ffffff',5,10,2,1); F('#ffffff',7,11,3,1); F('#ffffff',10,10,2,1); F('#c9ced4',4,18,8,1)},
  sprite(g){const F=(c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(x,y,w,h)}; F('#2e9e4f',7,0,2,2); F('#7fd39a',7,2,2,3); F('#4fbf73',5,5,6,14); F('#2e9e4f',5,5,1,14); F('#f2e14c',5,10,6,3); F('#ffffff',9,6,1,3)},
  gingerale(g){const F=(c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(x,y,w,h)}; F('#c9ced4',4,2,8,2); F('#2f7a46',4,4,8,14); F('#245e36',4,4,1,14); F('#e0c068',4,8,8,4); F('#ffffff',6,9,4,1); F('#c9ced4',4,18,8,1)},
  pepsi(g){const F=(c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(x,y,w,h)}; F('#c9ced4',4,2,8,2); F('#1c3f94',4,4,8,14); F('#152f70',4,4,1,14); F('#ffffff',4,10,8,1); F('#d0213a',4,9,8,1); F('#c9ced4',4,18,8,1)},
  pedialyte(g){const F=(c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(x,y,w,h)}; F('#7a4fa0',6,0,4,2); F('#e9eef3',5,2,6,3); F('#f3b7cf',4,5,8,14); F('#ffffff',4,9,8,5); F('#7a4fa0',5,11,6,1); F('#ffffff',10,6,1,2)},
  pringles(g){const F=(c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(x,y,w,h)}; F('#d9b44a',4,0,8,2); F('#c8102e',4,2,8,17); F('#9e0c24',4,2,1,17); F('#f4d35e',6,9,4,3); F('#e0b040',6,11,4,1)},
  cheetos(g){const F=(c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(x,y,w,h)}; F('#d9661e',2,2,12,2); F('#f28c28',2,4,12,14); F('#d9661e',2,17,12,1); F('#ffb347',5,8,6,3); F('#e8741a',6,11,4,2); F('#ffffff',11,5,1,3)},
  smartfood(g){const F=(c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(x,y,w,h)}; F('#141420',2,2,12,16); F('#f4d35e',2,4,12,2); F('#fff8e6',6,9,2,2); F('#fff8e6',8,8,2,2); F('#fff8e6',7,11,2,2); F('#f4d35e',9,11,1,1)},
  almondjoy(g){const F=(c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(x,y,w,h)}; F('#1f4fa0',1,7,14,7); F('#173d7c',1,7,14,1); F('#ffffff',5,8,6,5); F('#6b3f22',6,9,4,3); F('#ffffff',7,10,2,1)},
  snickers(g){const F=(c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(x,y,w,h)}; F('#5a3220',1,7,14,7); F('#46271a',1,7,14,1); F('#2f6db0',4,9,8,3); F('#ffffff',5,10,6,1)},
  motts(g){const F=(c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(x,y,w,h)}; F('#7a2b5a',3,3,10,15); F('#5e2046',3,3,10,1); F('#e54b4b',5,8,2,2); F('#3d8ad6',8,9,2,2); F('#f4d35e',6,12,2,2); F('#a03d6a',9,12,2,2); F('#ffffff',4,15,8,1)},
};
