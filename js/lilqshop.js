// Fargo: inside Lil Q's Gas & Go, laid out like a real gas station shop: the coolers along the back wall, three aisles running
// toward them (chips on the left, groceries in the middle, candy on the right), coffee + fountain drinks on the side wall, and the
// counter up front by the door. Alex walks in with you and waits at the counter. Walk up to a drink or a snack and grab it (one drink
// and one snack at a time; grabbing another swaps it), then bring them to her. Jackie's in the aisles: she'll give you clues, but only
// after you bring her a bowl of plain pasta from the diner. Once Alex has the right ones, the EXIT sign by the door lights up.
// Words live in story.js (FARGO, JACKIE).
const SHOP={W:224, H:168,
  COOLER:{x:8, y:3, w:20, n:8},                // the cooler doors along the back wall
  GONDOLAS:[R(42,56,12,62), R(86,56,12,62), R(130,56,12,62)],   // the three aisles of shelves (chips / groceries / candy)
  COUNTER:R(162,110,50,12),
  DOOR:R(100,158,24,10),
  ALEX:{x:186,y:136}, JACKIE:{x:70,y:108},      // where Alex waits (at the counter); where Jackie stands (in the chips aisle)
};
// small pixel versions of everything on the shelves (5-7 px wide, so they're sized right next to the people)
const MINI={
  coke:{t:'can',c:['#c8102e','#8e0b21','#e0384f'],b:'#ffffff'}, pepsi:{t:'can',c:['#1c3f94','#122b6a','#2f58b8'],b:'#d0213a',b2:'#ffffff'},
  gingerale:{t:'can',c:['#2f7a46','#1f5a32','#4a9a62'],b:'#e0c068'}, sprite:{t:'bottle',c:['#4fbf73','#2e9e4f','#8fe0a8'],cap:'#2e7d3e',b:'#f2e14c'},
  pedialyte:{t:'bottle',c:['#f3b7cf','#d98aab','#ffd6e6'],cap:'#7a4fa0',b:'#ffffff'},
  pringles:{t:'tube',c:['#c8102e','#8e0b21','#e0384f'],b:'#f4d35e'}, cheetos:{t:'bag',c:['#f28c28','#c8661a','#ffb347'],b:'#ffd84d'},
  smartfood:{t:'bag',c:['#1a1a26','#0c0c14','#3a3a4c'],b:'#f4d35e'}, almondjoy:{t:'bar',c:['#1f4fa0','#123a7c','#3f74c8'],b:'#ffffff'},
  snickers:{t:'bar',c:['#5a3220','#3e2216','#7a4a30'],b:'#2f6db0'}, motts:{t:'pouch',c:['#7a2b5a','#5e2046','#9a3d74'],b:'#f2e6ee'},
  // (just for show)
  water:{t:'bottle',c:['#cfe8f5','#9fc8e0','#ffffff'],cap:'#3d8ad6',b:'#3d8ad6'}, sports:{t:'bottle',c:['#f28c28','#c8661a','#ffb347'],cap:'#1d1d22',b:'#1d1d22'},
  sportsB:{t:'bottle',c:['#3d8ad6','#2a6aa8','#7fb8ec'],cap:'#1d1d22',b:'#ffffff'}, energy:{t:'can',c:['#1d1d22','#0c0c10','#3a3a44'],b:'#7dff8a'},
  energyB:{t:'can',c:['#e6e9ee','#b9bec7','#ffffff'],b:'#3d8ad6'}, juice:{t:'carton',c:['#f4a62a','#c8801a','#ffc85a'],b:'#2f8a4a'}, milk:{t:'carton',c:['#f6f6f2','#c9ced4','#ffffff'],b:'#3d8ad6'},
  chipsA:{t:'bag',c:['#f4d35e','#c9a83a','#fff0a0'],b:'#c8322b'}, chipsB:{t:'bag',c:['#2f6db0','#1f4f8a','#5f94d8'],b:'#ffffff'}, chipsC:{t:'bag',c:['#2f8a4a','#1f6a34','#5fbf6a'],b:'#f4d35e'},
  pretzel:{t:'bag',c:['#c8722a','#9a521a','#e8a25a'],b:'#ffffff'}, cereal:{t:'box',c:['#e54b4b','#b03030','#ff8080'],b:'#f4d35e'}, cerealB:{t:'box',c:['#f4d35e','#c9a83a','#fff0a0'],b:'#3d8ad6'},
  bread:{t:'bag',c:['#f6efe2','#d9cfba','#ffffff'],b:'#e54b4b'}, soup:{t:'can',c:['#e54b4b','#b03030','#ff8080'],b:'#ffffff'}, oil:{t:'bottle',c:['#2b2f3a','#1d2130','#4a505e'],cap:'#f4d35e',b:'#f4d35e'},
  candyA:{t:'bar',c:['#e54b4b','#b03030','#ff8080'],b:'#ffffff'}, candyB:{t:'bar',c:['#f4d35e','#c9a83a','#fff0a0'],b:'#5a3220'}, candyC:{t:'bar',c:['#7a4fa0','#5a3580','#a37fc8'],b:'#ffffff'},
  gum:{t:'pouch',c:['#3fa59a','#2a7a72','#7fd8cc'],b:'#ffffff'},
};
// draw one at (x = left, y = bottom)
function drawMini(g,id,x,y){
  const m=MINI[id]; if(!m)return; const [B,D,L]=m.c, F=(c,dx,dy,w=1,h=1)=>{g.fillStyle=c;g.fillRect(Math.round(x)+dx,Math.round(y)+dy,w,h)};
  if(m.t==='can'){ F('#b9bec7',0,-8,5,1); F(B,0,-7,5,6); F(D,0,-7,1,6); F(L,1,-7,1,6); F(m.b,0,-5,5,1); if(m.b2)F(m.b2,0,-4,5,1); F('#9aa0aa',0,-1,5,1) }
  else if(m.t==='bottle'){ F(m.cap,1,-9,3,1); F(L,1,-8,3,1); F(B,0,-7,5,7); F(D,0,-7,1,7); F(L,1,-6,1,4); F(m.b,0,-5,5,2) }
  else if(m.t==='tube'){ F('#e8d48a',0,-9,5,1); F(B,0,-8,5,8); F(D,0,-8,1,8); F(L,1,-8,1,8); F(m.b,2,-6,2,1); F(m.b,2,-4,2,1) }
  else if(m.t==='bag'){ F(D,0,-8,6,1); F(B,0,-7,6,6); F(D,5,-7,1,6); F(L,1,-7,1,5); F(m.b,2,-5,3,2); F(D,0,-1,6,1) }
  else if(m.t==='bar'){ F(D,0,-4,7,4); F(B,1,-4,5,4); F(L,1,-4,5,1); F(m.b,2,-3,3,1) }
  else if(m.t==='pouch'){ F(B,0,-8,5,8); F(D,4,-8,1,8); F(L,1,-8,1,7); F(m.b,1,-6,3,3); F('#e54b4b',1,-6,1,1); F('#3d8ad6',3,-5,1,1); F('#f4d35e',2,-4,1,1) }
  else if(m.t==='carton'){ F(L,1,-9,3,1); F(B,0,-8,5,8); F(D,0,-8,1,8); F(m.b,0,-5,5,2) }
  else if(m.t==='box'){ F(B,0,-9,6,9); F(D,5,-9,1,9); F(L,0,-9,6,1); F(m.b,1,-6,3,3) }
}
const lq={drink:null, snack:null, mood:'ok', moodT:0, alex:{x:112,y:156}, jackieN:0};
// the cooler: what's behind each door (top shelf to bottom); the ones you can grab are FARGO.drinks
const COOLER_DOORS=[['water','water','water'],['sportsB','pedialyte','sports'],['energy','energyB','energy'],['coke','coke','coke'],['pepsi','pepsi','pepsi'],['sprite','sprite','sprite'],['gingerale','gingerale','gingerale'],['juice','milk','juice']];
// the aisles: [left side, right side] of each gondola, top to bottom (5 spots a side). The ones you can grab are FARGO.snacks.
const GONDOLA_STOCK=[
  [['chipsA','pringles','chipsB','chipsC','pretzel'],['chipsB','cheetos','chipsA','smartfood','chipsC']],
  [['cereal','cerealB','soup','bread','oil'],['soup','cereal','bread','cerealB','oil']],
  [['candyA','almondjoy','candyB','gum','candyC'],['candyB','snickers','candyC','motts','gum']],
];
const SLOT_Y=k=>SHOP.GONDOLAS[0].y+11+k*11;   // the bottom of each shelf spot
const isGrabbable=id=>FARGO.drinks.some(d=>d.id===id)||FARGO.snacks.some(d=>d.id===id);
// every grabbable item: where it is and the spot you stand on to grab it
const SHOP_ITEMS=[];
COOLER_DOORS.forEach((rows,i)=>{ const id=rows.find(isGrabbable); const d=FARGO.drinks.find(x=>x.id===id); if(!d)return;
  const x=SHOP.COOLER.x+i*SHOP.COOLER.w; SHOP_ITEMS.push({...d,kind:'drink',door:i,row:rows.indexOf(id),spot:R(x+3,38,SHOP.COOLER.w-6,10)}) });
GONDOLA_STOCK.forEach((sides,gi)=>sides.forEach((ids,side)=>ids.forEach((id,k)=>{ const s=FARGO.snacks.find(x=>x.id===id); if(!s)return; const g=SHOP.GONDOLAS[gi];
  SHOP_ITEMS.push({...s,kind:'snack',gi,side,k,spot:side?R(g.x+g.w+1,SLOT_Y(k)-8,8,10):R(g.x-9,SLOT_Y(k)-8,8,10)}) })));
const shopDone=()=>have.fargoStage==='reward'||have.fargo;
const held=id=>lq.drink===id||lq.snack===id;
// the big detailed pictures (ITEM_ART in fargo.js) for the HUD: "Holding: [picture] Ginger Ale"
const itemPic={}; for(const id in ITEM_ART){const c=document.createElement('canvas'); c.width=16; c.height=20; ITEM_ART[id](c.getContext('2d')); itemPic[id]=c.toDataURL()}

// ---------- the shop, painted once ----------
const COFFEE=R(2,44,12,58), ATM=R(178,14,14,24), ICE=R(56,146,22,11), HATS={x:206,y:150};
const shopBg=document.createElement('canvas'); shopBg.width=SHOP.W; shopBg.height=SHOP.H;
(function(){
  const g=shopBg.getContext('2d'), F=(c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};
  // floor: cream tiles with grout lines and a little scuffing, a welcome mat by the door
  for(let y=36;y<SHOP.H;y+=8)for(let x=0;x<SHOP.W;x+=8){F((x+y)/8%2?'#efe9dc':'#e2dac8',x,y,8,8); F('rgba(0,0,0,.05)',x,y,8,1); F('rgba(0,0,0,.05)',x,y,1,8)}
  for(let i=0;i<40;i++)F('rgba(120,100,70,.08)',rnd()*SHOP.W|0,40+rnd()*118|0,2,1);
  F('#5a4a3a',100,150,24,8); F('#6e5c48',101,151,22,6); for(let x=103;x<122;x+=3)F('#5a4a3a',x,152,1,4);
  // the back wall
  F('#cdd9c6',0,0,SHOP.W,36); F('#b9c7b1',0,30,SHOP.W,4); F('#9aa58f',0,34,SHOP.W,2);
  // the cooler: a steel frame, a glowing light strip, eight glass doors, three shelves of stock behind each
  const co=SHOP.COOLER, W=co.w*co.n;
  F('#5f6676',co.x-2,co.y-2,W+4,32); F('#8a8f9a',co.x-1,co.y-1,W+2,30); F('#fff6c8',co.x,co.y-1,W,1);
  COOLER_DOORS.forEach((rows,i)=>{const x=co.x+i*co.w; F('#dff0f7',x+1,co.y,co.w-2,27);
    rows.forEach((id,r)=>{const yb=co.y+9+r*9; F('#b9c8d6',x+1,yb,co.w-2,1); const live=isGrabbable(id)&&rows.indexOf(id)===r; if(!live){drawMini(g,id,x+3,yb); drawMini(g,id,x+11,yb)}});   // (the front row of each drink you can grab is drawn live)
    F('rgba(255,255,255,.55)',x+2,co.y+1,1,25); F('#5f6676',x+co.w-1,co.y,1,27); F('#c9ced4',x+co.w-3,co.y+8,1,6)});
  // the ATM and a trash can at the back
  {const a=ATM; F('rgba(0,0,0,.15)',a.x,a.y+a.h,a.w,2); F('#5f6676',a.x,a.y,a.w,a.h); F('#3a3f4c',a.x,a.y,a.w,2); F('#9fe8a8',a.x+3,a.y+4,8,5); F('#2b2f3a',a.x+3,a.y+11,8,4); for(let k=0;k<3;k++)F('#c9ced4',a.x+4+k*2,a.y+12,1,1); F('#1d1d22',a.x+4,a.y+18,6,1); pixText(g,'ATM',a.x+2,a.y-6,'#2f6db0')}
  F('#5f6676',198,24,10,13); F('#4a505e',198,24,10,2); F('#8a8f9a',199,27,1,9);
  // coffee + fountain drinks along the left wall: pots on a warmer, cups, a soda fountain
  {const c=COFFEE; F('#7a4a24',c.x,c.y,c.w,c.h); F('#a26c40',c.x+c.w-2,c.y,2,c.h); F('#5a3418',c.x,c.y,1,c.h);
   for(let k=0;k<3;k++){const y=c.y+4+k*8; F('#1d1d22',c.x+3,y+4,7,1); F('#c9ced4',c.x+4,y,5,4); F('#3a2418',c.x+5,y+2,3,2); F('#e54b4b',c.x+9,y+1,1,2)}   // coffee pots
   for(let k=0;k<3;k++)F('#f6efe2',c.x+3+k*3,c.y+29,2,4);                                                                                         // cups
   F('#c9ced4',c.x+1,c.y+36,10,20); F('#9aa0aa',c.x+1,c.y+52,10,4); for(let k=0;k<3;k++){F(['#c8102e','#4fbf73','#f28c28'][k],c.x+2+k*3,c.y+38,2,4); F('#5f6676',c.x+2+k*3,c.y+44,2,2)}   // the soda fountain
  }
  // the gondolas: steel shelves with orange endcaps, stock on both sides (the grabbable products are drawn live)
  SHOP.GONDOLAS.forEach((gd,gi)=>{ F('rgba(0,0,0,.15)',gd.x+2,gd.y+gd.h,gd.w,3); F('#5f6676',gd.x,gd.y,gd.w,gd.h); F('#8a8f9a',gd.x+1,gd.y,gd.w-2,gd.h); F('#4a505e',gd.x+5,gd.y,2,gd.h);
    F('#e8742a',gd.x,gd.y-4,gd.w,4); F('#c85a1a',gd.x,gd.y-1,gd.w,1); F('#e8742a',gd.x,gd.y+gd.h,gd.w,3);   // endcaps
    for(let k=0;k<5;k++){const yb=SLOT_Y(k); F('#6f7686',gd.x+1,yb,gd.w-2,1);
      [0,1].forEach(side=>{const id=GONDOLA_STOCK[gi][side][k]; if(!isGrabbable(id))drawMini(g,id,side?gd.x+6:gd.x,yb)})}
    pixText(g,['CHIPS','FOOD','CANDY'][gi],gd.x+gd.w/2-(gi===1?7:9),gd.y-10,'#c85a1a') });
  // the counter by the door: register, the hot dog roller, impulse candy, cigarettes-and-stuff wall behind it
  const c=SHOP.COUNTER;
  F('#9aa58f',SHOP.W-8,80,8,56); for(let y=84;y<132;y+=6)for(let x=SHOP.W-7;x<SHOP.W-1;x+=2)F(['#e54b4b','#f4d35e','#3d8ad6','#ffffff'][(x+y)%4],x,y,1,4);   // the back bar
  F('rgba(0,0,0,.15)',c.x+2,c.y+c.h,c.w,2); F('#8a5a34',c.x,c.y,c.w,c.h); F('#a26c40',c.x,c.y,c.w,3); F('#6a4224',c.x,c.y+c.h-2,c.w,2); for(let x=c.x+4;x<c.x+c.w;x+=10)F('#7a4e2c',x,c.y+4,1,c.h-6);
  F('#3a3f4c',c.x+20,c.y-6,12,8); F('#2b2f3a',c.x+20,c.y-6,12,1); F('#9fe8a8',c.x+22,c.y-4,8,3);                                // the register
  F('#c9ced4',c.x+2,c.y-4,14,5); for(let k=0;k<4;k++)F(k%2?'#e8a26a':'#c87a4a',c.x+3,c.y-3+k,12,1); F('#9aa0aa',c.x+2,c.y+1,14,1);   // hot dog roller
  for(let k=0;k<4;k++)F(['#e54b4b','#f4d35e','#7a4fa0','#2f8a4a'][k],c.x+36+k*3,c.y-3,2,4);                                   // impulse candy at the counter
  F('#e8742a',c.x+4,c.y+4,30,6); pixText(g,"LIL Q'S",c.x+6,c.y+5,'#ffffff');
  // the lottery stand + an ice chest by the door
  F('#2f6db0',84,140,10,16); F('#f4d35e',85,142,8,3); F('#ffffff',85,146,8,1); F('#ffffff',85,148,8,1); F('#1d2130',88,156,2,2);
  {const i=ICE; F('rgba(0,0,0,.15)',i.x,i.y+i.h,i.w,2); F('#e9eef3',i.x,i.y,i.w,i.h); F('#3d8ad6',i.x,i.y+3,i.w,5); pixText(g,'ICE',i.x+5,i.y+3,'#ffffff'); F('#c9ced4',i.x,i.y,i.w,1)}
  // the front wall: windows either side of the door (the lot outside, the pump)
  F('#b9c7b1',0,158,SHOP.DOOR.x,10); F('#b9c7b1',SHOP.DOOR.x+SHOP.DOOR.w,158,SHOP.W-SHOP.DOOR.x-SHOP.DOOR.w,10); F('#9aa58f',0,158,SHOP.W,1);
  for(const wx of [30,172]){F('#5f6676',wx-1,159,32,8); F('#9fd2f0',wx,160,30,6); F('#cdb978',wx,164,30,2); F('#ffffff',wx+2,160,6,1)}
  F('#e8742a',36,161,3,4); F('#8a8f9a',37,160,1,1);
  F('#cfe7f2',SHOP.DOOR.x,159,SHOP.DOOR.w,9); F('#9aa0aa',SHOP.DOOR.x+SHOP.DOOR.w/2,159,1,9); F('#c9ced4',SHOP.DOOR.x+9,163,2,1); F('#c9ced4',SHOP.DOOR.x+13,163,2,1);
})();
// Lil Q's trucker hats on a little stand by the counter (an ent, so it gets the outline)
function drawHatStand(){ const x=HATS.x, y=HATS.y, F=(c,dx,dy,w,h)=>{ctx.fillStyle=c;ctx.fillRect(x+dx,y+dy,w,h)};
  F('rgba(0,0,0,.2)',-3,0,7,2); F('#5f6676',0,-13,1,13); F('#5f6676',-2,-1,5,1);
  for(const [dx,dy] of [[-4,-13],[1,-10],[-4,-7]]){F('#e8742a',dx,dy,4,2); F('#ffffff',dx+1,dy,2,1); F('#c85a1a',dx-1,dy+2,5,1)} }

function shopNearItem(){ const f=R(P.x-4,P.y-3,8,4); return SHOP_ITEMS.find(it=>hit(f,it.spot)) }
function grabItem(it){ sfx('pickup'); if(it.kind==='drink')lq.drink=it.id; else lq.snack=it.id }
function giveSnacks(){
  if(!(lq.drink&&lq.snack))return say([['Alex',FARGO.needBoth]]);
  const C=FARGO.correct;
  if(lq.drink===C.drink&&lq.snack===C.snack){
    lq.mood='happy'; lq.moodT=99999; lq.drink=null; lq.snack=null; have.fargoStage='reward'; save(); sfx('fanfare');
    return say([['Alex',FARGO.alexWin]]);
  }
  const lines=[]; if(lq.drink!==C.drink){lines.push(FARGO.drinks.find(x=>x.id===lq.drink).react); lq.drink=null}
  if(lq.snack!==C.snack){lines.push(FARGO.snacks.find(x=>x.id===lq.snack).react); lq.snack=null}   // the wrong ones go back on the shelf
  have.fargoWrong=(have.fargoWrong||0)+1; save(); lq.mood='frown'; lq.moodT=2600; sfx('bad');
  say(lines.map(t=>['Alex',t]));
}
function talkShopJackie(){
  have.metJackie=true;
  if(!have.jackieFed){
    if(!have.fargoPasta)return say(JACKIE.hungry.map(t=>['Jackie',t]));
    have.jackieFed=true; save(); sfx('good'); lq.jackieN=1;
    return say([...JACKIE.thanks,JACKIE.hints[0]].map(t=>['Jackie',t]));
  }
  const n=Math.min(lq.jackieN,JACKIE.hints.length-1); lq.jackieN=n+1; save();
  say([['Jackie',JACKIE.hints[n]]]);
}

SCENES.lilqshop={ music:'fargo',
  w:SHOP.W, h:SHOP.H, bounds:R(0,0,SHOP.W,SHOP.H), bg:shopBg, triggers:[],
  get solids(){ return [R(0,0,SHOP.W,40), R(SHOP.W-8,0,8,SHOP.H), COFFEE, SHOP.COUNTER, R(SHOP.COUNTER.x,SHOP.COUNTER.y-16,SHOP.W-SHOP.COUNTER.x,16),   // walls, coffee bar, the counter (and behind it)
    ...SHOP.GONDOLAS.map(g=>R(g.x,g.y-4,g.w,g.h+6)), ICE, R(84,152,10,4),
    R(0,160,SHOP.DOOR.x,8), R(SHOP.DOOR.x+SHOP.DOOR.w,160,SHOP.W,8), R(lq.alex.x-3,lq.alex.y-3,6,4), R(SHOP.JACKIE.x-3,SHOP.JACKIE.y-3,6,4), R(HATS.x-3,HATS.y-2,6,3)] },
  entries:{door:{x:112,y:150,dir:'up'}},
  enter(){ lq.drink=null; lq.snack=null; lq.mood=shopDone()?'happy':'ok'; lq.moodT=shopDone()?99999:0; lq.alex={x:112,y:156}; lq.jackieN=have.jackieFed?1:0;
    lq.hello=!shopDone()&&!have.fargoShopHello },   // the first time in: "Don't mess this up"
  ambient(dt){
    if(lq.hello&&!paused&&!fade.next){ lq.hello=false; have.fargoShopHello=true; save(); say([['Alex',FARGO.alexHello]]) }
    const a=lq.alex, t=SHOP.ALEX, d=Math.hypot(t.x-a.x,t.y-a.y);   // Alex walks in with you, over to the counter
    if(d>.5){ const sp=.08*dt; if(a.y>142){a.y=Math.max(142,a.y-sp)} else {const k=Math.min(1,sp/d); a.x+=(t.x-a.x)*k; a.y+=(t.y-a.y)*k} }   // in through the door, then over
    if(lq.moodT>0&&lq.moodT<99999){lq.moodT-=dt; if(lq.moodT<=0)lq.mood='ok'}
  },
  dynTrigger(){
    if(Math.hypot(P.x-lq.alex.x,P.y-lq.alex.y)<16)return shopDone()?{label:FARGO.talkAlex,btn:'Talk',act:()=>say([['Alex',FARGO.alexWin]])}
      :(lq.drink||lq.snack)?{label:FARGO.give,btn:'Give',act:giveSnacks}:{label:FARGO.talkAlex,btn:'Talk',act:()=>say([['Alex',FARGO.alexWaiting]])};
    if(Math.hypot(P.x-SHOP.JACKIE.x,P.y-SHOP.JACKIE.y)<14)return {label:!have.jackieFed&&have.fargoPasta?JACKIE.give:JACKIE.talk,btn:'Talk',act:talkShopJackie};
    if(shopDone())return null;
    const it=shopNearItem(); if(!it)return null;
    const h=it.kind==='drink'?lq.drink:lq.snack; if(h===it.id)return null;
    return {label:h?FARGO.swap(it.name):FARGO.grab(it.name),btn:'Grab',act:()=>grabItem(it)};
  },
  under(){   // the products you can grab: gone from the shelf while you're holding them; a little glint on the one you're next to
    const near=!shopDone()&&shopNearItem();
    for(const it of SHOP_ITEMS){ if(held(it.id))continue;
      let x,y; if(it.kind==='drink'){x=SHOP.COOLER.x+it.door*SHOP.COOLER.w; y=SHOP.COOLER.y+9+it.row*9; drawMini(ctx,it.id,x+3,y); drawMini(ctx,it.id,x+11,y); x+=3}
      else {const g=SHOP.GONDOLAS[it.gi]; x=it.side?g.x+6:g.x; y=SLOT_Y(it.k); drawMini(ctx,it.id,x,y)}
      if(near===it&&Math.floor(time/250)%2){ctx.fillStyle='#ffffff'; ctx.fillRect(x+1,y-10,1,1); ctx.fillRect(x+2,y-11,1,1)} }
  },
  ents(list){
    list.push({y:lq.alex.y,draw:()=>drawAlex(lq.alex.x,lq.alex.y,lq.mood)});
    list.push({y:SHOP.JACKIE.y,draw:()=>drawJackie(SHOP.JACKIE.x,SHOP.JACKIE.y,'down')});
    list.push({y:HATS.y,draw:drawHatStand});
  },
  over(){
    const h=[lq.drink,lq.snack].filter(Boolean);   // what Joe's carrying, over his head
    h.forEach((id,i)=>{const x=Math.round(P.x-h.length*4+i*8), y=Math.round(P.y)-26; ctx.fillStyle='rgba(29,33,48,.55)'; ctx.fillRect(x-1,y-10,9,11); drawMini(ctx,id,x,y)});
    if(!have.jackieFed&&have.fargoPasta&&Math.floor(time/500)%2){ const x=SHOP.JACKIE.x+4, y=SHOP.JACKIE.y-26; ctx.fillStyle='#ffffff'; ctx.fillRect(x,y,7,7); ctx.fillStyle='#1d2130'; ctx.fillRect(x+3,y+1,1,3); ctx.fillRect(x+3,y+5,1,1) }   // "!" once you have her pasta
    // the EXIT sign by the door: lights up (and blinks) once Alex is happy
    const on=shopDone()&&Math.floor(time/400)%2===0, x=SHOP.DOOR.x+SHOP.DOOR.w+4, y=150;
    ctx.fillStyle='#1d2130'; ctx.fillRect(x-1,y-1,20,9); ctx.fillStyle=on?'#2fbf5a':shopDone()?'#1d5a32':'#2a3a30'; ctx.fillRect(x,y,18,7);
    pixText(ctx,'EXIT',x+2,y+1,on?'#ffffff':shopDone()?'#9fc8aa':'#5a6a5e');
    if(on){ctx.fillStyle='rgba(80,255,140,.15)'; ctx.fillRect(x-5,y-5,28,17)}
  },
  hud(){
    if(shopDone())return `<span>${FARGO.exitNow}</span>`;
    const nm=id=>id?`<img class="hudpic" src="${itemPic[id]}" alt="">`+[...FARGO.drinks,...FARGO.snacks].find(x=>x.id===id).name:'—';
    return `<span>${FARGO.holding}: ${nm(lq.drink)} · ${nm(lq.snack)}</span>`;
  },
};
EXITS.lilqshop=[{z:R(SHOP.DOOR.x,164,SHOP.DOOR.w,4), mark:{x:112,y:160,dir:'down'}, markWhen:shopDone, go:()=>{ fargo.fromShop=true; goTo('fargo','fromShop') }}];
