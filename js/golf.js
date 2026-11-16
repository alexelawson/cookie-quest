// Wylee Woods Disc Golf: a six-hole round through the Vermont woods against Jack and Margie. Win it and Margie hands over the milk.
// Throwing: tap once to lock your aim (the arrow sweeps), tap again to lock your power (the meter pulses).
// Inside the circle around the basket it's a putt: slower sweep, shorter throw, easier to sink.
const GOLF={
  MAX:150, PUTT_MAX:58, PUTT_RANGE:45,              // throw distances (px)
  AIM_SPAN:.6, AIM_PERIOD:1600,                      // drive aim sweeps +-0.6 rad
  PUTT_SPAN:.32, PUTT_PERIOD:2100,                   // putt aim sweeps slower and narrower
  POWER_PERIOD:1300, PUTT_POWER_PERIOD:1700,
  CHAINS:6, PUTT_CHAINS:7.5, TREE_R:6, TREE_HIT:1.6, TREE_NUDGE:.18,   // trees: only a hit within 1.6px of dead center stops the disc; closer passes get nudged around
  FADE:.35, SPEED:.22, MAX_STROKES:7,
  PLATFORM:1.3, HIKE:.75, HIKE_WILD:.22,            // platform throws go 30% farther; hikes go 75% as far, +-0.11 rad wild
  // opponents' score on each hole relative to par (chances). Margie's really good; Jack is comically bad.
  MARGIE:{'-1':.3,'0':.55,'1':.15},
  JACK:{'1':.2,'2':.35,'3':.3,'4':.15},
};
const GW=224, GH=168, GOLF_OB=R(4,8,216,156);
const HOLES=[
  {tee:{x:24,y:138}, basket:{x:192,y:36}, par:3, water:[],
   trees:[[70,112],[100,84],[132,124],[152,62],[176,98],[62,52],[122,30],[40,96]]},
  // The Lookout: you throw from a raised platform. From up there the disc flies farther and clears the trees near the tee.
  {tee:{x:28,y:138}, basket:{x:198,y:30}, par:3, water:[], platform:true,
   trees:[[56,118],[70,104],[84,92],[50,96],[96,124],[66,82],[140,52],[176,70],[150,108]]},
  {tee:{x:20,y:90}, basket:{x:204,y:88}, par:3, water:[{x:110,y:90,rx:40,ry:32}],
   trees:[[182,58],[186,122],[162,96],[60,40],[60,140],[140,30],[140,150]]},
  // Hut! Hut!: face away from the basket and hike it through your legs (shorter, a little wild, no fade)
  {tee:{x:40,y:86}, basket:{x:190,y:86}, par:3, water:[], hike:true,
   trees:[[116,50],[120,124],[154,64],[154,108],[80,30],[80,142],[200,40],[200,132]]},
  {tee:{x:112,y:146}, basket:{x:112,y:24}, par:3, water:[],
   trees:[...[30,48,66,84,102,120,138].flatMap(y=>[[82,y],[142,y]]),[112,92]]},
  // The Sugarbush: a dogleg. The basket is around the corner behind a stand of sugar maples, too far to reach in one. Up the fairway first, then turn right. Par 4.
  {tee:{x:28,y:148}, basket:{x:196,y:42}, par:4, water:[], path:[[28,148],[58,58],[196,42]], wall:[[20,96],[96,84]],
   trees:[[92,112],[108,98],[124,110],[100,124],[118,82],[136,94],[84,96],[142,116],[150,70],[30,60],[86,36],[160,24],[186,78],[60,132]]},
];
// a foot is 1.6 px (so the longest drive is about 240 ft, and the holes run 250 to 320 ft, like a real wooded course)
const GOLF_FT=1.6, golfFeet=px=>Math.round(px*GOLF_FT/5)*5;
const holePath=h=>h.path||[[h.tee.x,h.tee.y],[h.basket.x,h.basket.y]];
const holeFeet=h=>{ const P=holePath(h); let d=0; for(let i=1;i<P.length;i++)d+=Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]); return golfFeet(d) };
// which kind of tree each one is (sugar maple, pine, white birch): mixed, but the same every time
const treeKind=(hi,ti)=>hi===4?'m':hi===5?(ti<9?'m':'pb'[ti%2]):'mpbmp'[(hi*3+ti*2)%5];
function drawGolfTree(x,y,k){ if(k==='p')drawPine(x,y,darkPine); else if(k==='b')drawPine(x,y,birchSprite); else drawTree(x,y) }
// the clearing by the first tee, before a round: the course kiosk, a picnic table with the milk on it
const KIOSK=R(16,96,18,6), PICNIC=R(70,140,22,8);
const golf={active:false, hole:0, strokes:0, lie:null, prevLie:null, state:'idle', t:0, angle:0, power:0, flight:null,
  you:[], margie:[], jack:[], msg:'', done:false};

function drawBasket(x,y){
  const F=(c,dx,dy,w,h)=>{ctx.fillStyle=c;ctx.fillRect(x+dx,y+dy,w,h)};
  F('rgba(0,0,0,.25)',-5,6,11,2); F('#8a8f9a',-1,-14,2,20); F('#c9ced4',-5,-14,11,2); F('#f4d35e',-5,-12,11,1);
  for(let i=-4;i<=4;i+=2)F('#b4bac3',i,-11,1,6); F('#8a8f9a',-5,-5,11,4); F('#5f6676',-4,-4,9,2);
}
function drawCow(x,y){
  const F=(c,dx,dy,w,h)=>{ctx.fillStyle=c;ctx.fillRect(x+dx,y+dy,w,h)};
  F('rgba(0,0,0,.2)',0,8,14,2); F('#fffaf0',0,0,12,7); F('#2b2b2b',2,1,3,3); F('#2b2b2b',8,3,3,2);
  F('#fffaf0',11,-2,5,5); F('#f2a7a0',14,1,2,2); F('#2b2b2b',13,-1,1,1); F('#3b2a1e',1,7,2,2); F('#3b2a1e',9,7,2,2);
  if((time/1500|0)%3===0)F('#2b2b2b',-1,1,1,3);   // tail swish
}
// Jack: short blond hair, teal polo, khaki shorts
// Jack: extremely serious, extremely into stats. Blond, teal polo, khaki shorts, a disc in hand. 12 x 20 px.
const JACK_PAL={L:'#e6c46a',l:'#c9a54a',y:'#f2d88a',S:'#f3cba8',s:'#ddb18c',B:'#a8873a',W:'#ffffff',E:'#2b2b2b',M:'#b07060',P:'#2a9d8f',p:'#1f7a6f',K:'#c9b17a',k:'#a8925e'};
const JACK_SPR={down:["...LLLLLL...","..LLyyLLLL..","..LBBSSBBL..","..SWESSEWS..","..sSSssSSs..","...SSMMSS...",
  "..PPWWWWPP..",".PPPPPWPPPP.",".SPPPPPPPpS.",".SPPPPPPPpS.",".SPPPPPPPpS.","..KKKKKKKK..","..KKKkkKKK.."]};
function drawJack(x,y){
  const X=Math.round(x)-6, Y=Math.round(y)-19, F=(c,dx,dy,w,h)=>{ctx.fillStyle=c;ctx.fillRect(X+dx,Y+dy,w,h)};
  F('rgba(0,0,0,.2)',1,18,10,2); F('#f3cba8',3,13,2,4); F('#f3cba8',7,13,2,4); F('#ddb18c',4,13,1,4); F('#ddb18c',8,13,1,4);
  F('#ffffff',3,17,2,1); F('#ffffff',7,17,2,1); F('#3b3b44',2,18,4,1); F('#3b3b44',6,18,4,1);
  drawSprite(ctx,X,Y,JACK_SPR,JACK_PAL,'down',3,6);
  F('#f4d35e',11,9,4,1); F('#e8742a',11,8,4,1); F('#ffe98a',12,8,2,1);   // a disc in hand
}
// Margie: long blond hair, fun heart-shaped pink sunglasses, bright top
// Margie: the one to beat. Long blond hair, heart sunglasses, pink top with a yellow heart, denim shorts, a disc in hand. 12 x 20 px.
const MARGIE_PAL={L:'#e6c46a',l:'#c9a54a',y:'#f2d88a',S:'#f3cba8',s:'#ddb18c',G:'#ff4fa3',w:'#ffffff',M:'#c9576a',T:'#e54b7a',t:'#c23a64',Y:'#ffd84d',J:'#3a5f9e',j:'#2c4a7c'};
const MARGIE_SPR={down:["..LLLLLLLL..",".LLyyyLLLLL.",".LLSSSSSSLL.",".LLGwGGwGLL.",".LLSGSSGSLL.",".LLSSssSSLL.",".LLSSMMSSLL.",
  ".LTTTTTTTTL.",".LTTYTTYTTL.",".STTYYYYTTS.",".STTTYYTTtS.","..JJJJJJJJ..","..JJJjjJJJ.."]};
function drawMargie(x,y){
  const X=Math.round(x)-6, Y=Math.round(y)-19, F=(c,dx,dy,w,h)=>{ctx.fillStyle=c;ctx.fillRect(X+dx,Y+dy,w,h)};
  F('rgba(0,0,0,.2)',1,18,10,2); F('#f3cba8',3,13,2,4); F('#f3cba8',7,13,2,4); F('#ddb18c',4,13,1,4); F('#ddb18c',8,13,1,4);
  F('#ffffff',2,17,3,2); F('#ffffff',7,17,3,2); F('#ff4fa3',3,17,1,1); F('#ff4fa3',8,17,1,1); F('#d9d9d4',2,18,3,1); F('#d9d9d4',7,18,3,1);   // white sneakers, pink laces
  drawSprite(ctx,X,Y,MARGIE_SPR,MARGIE_PAL,'down',null,7);   // (sunglasses: no blinking to see)
  F('#7fd3ff',-3,8,4,1); F('#2f6db0',-3,9,4,1); F('#c9eeff',-2,8,2,1);   // a disc in hand
}
// ---------- backgrounds, one per hole: a fairway cut through the Vermont woods ----------
const golfBgs=HOLES.map((h,i)=>{
  const c=document.createElement('canvas'); c.width=GW; c.height=GH; const g=c.getContext('2d'), F=(col,x,y,w,hh)=>{g.fillStyle=col;g.fillRect(Math.round(x),Math.round(y),w,hh)};
  const O=GOLF_OB, PA=holePath(h), t=h.tee, b=h.basket;
  // how far a point is from the fairway's center line, and how far along it
  const along=(x,y)=>{ let best=1e9, at=0, run=0; for(let k=1;k<PA.length;k++){ const [x1,y1]=PA[k-1],[x2,y2]=PA[k], L=Math.hypot(x2-x1,y2-y1), u=Math.max(0,Math.min(1,((x-x1)*(x2-x1)+(y-y1)*(y2-y1))/(L*L))), d=Math.hypot(x-(x1+(x2-x1)*u),y-(y1+(y2-y1)*u)); if(d<best){best=d; at=run+u*L} run+=L } return [best,at] };
  // rough: long grass, a little darker and scruffier than the fairway
  F('#5a9440',0,0,GW,GH);
  for(let k=0;k<900;k++)F(rnd()<.5?'#659f48':'#4f8838',rnd()*GW|0,rnd()*GH|0,1,2);
  for(let k=0;k<120;k++){const x=rnd()*GW|0, y=rnd()*GH|0; F('#4a8035',x,y,1,2); F('#4a8035',x+2,y,1,2); F('#659f48',x+1,y-1,1,3)}
  // the fairway: mown short, striped by the mower, soft at the edges
  for(let y=O.y;y<O.y+O.h;y++)for(let x=O.x;x<O.x+O.w;x++){ const [d,at]=along(x,y), w=12+2*Math.sin(at/23+i); if(d<w){ const edge=d>w-2; F(edge?'#6aa84a':(Math.floor(at/9)%2?'#7dbd59':'#74b452'),x,y,1,1) } }
  for(let k=0;k<40;k++){const x=O.x+rnd()*O.w|0, y=O.y+rnd()*O.h|0; if(along(x,y)[0]<10)F('#8bc867',x,y,2,1)}
  for(let k=0;k<70;k++){const x=6+rnd()*(GW-12)|0, y=10+rnd()*(GH-20)|0; if(along(x,y)[0]>15)F(['#c8742a','#b8433a','#d9a03a'][k%3],x,y,1,1)}   // a few fallen maple leaves
  // wildflowers and ferns in the rough
  for(let k=0;k<30;k++){const x=8+rnd()*(GW-16)|0, y=12+rnd()*(GH-24)|0; if(along(x,y)[0]<14)continue; const col=['#ffffff','#f4d35e','#c9a0e8','#f2a7c8'][k%4]; F(col,x-1,y,1,1); F(col,x+1,y,1,1); F(col,x,y-1,1,1); F(col,x,y+1,1,1); F('#f4d35e',x,y,1,1)}
  for(let k=0;k<26;k++){const x=8+rnd()*(GW-16)|0, y=12+rnd()*(GH-24)|0; if(along(x,y)[0]<15)continue; F('#2f6b36',x-2,y,5,1); F('#3d8443',x-1,y-1,1,1); F('#3d8443',x+1,y-1,1,1); F('#4d9a50',x,y-2,1,2)}
  for(let k=0;k<5;k++){const x=14+rnd()*(GW-28)|0, y=16+rnd()*(GH-32)|0; if(along(x,y)[0]<18)continue; F('rgba(0,0,0,.18)',x,y+3,6,1); F('#8a8478',x,y,6,3); F('#8a8478',x+1,y-1,4,1); F('#a8a296',x+1,y-1,3,1); F('#4a7442',x+3,y,2,1)}   // granite, a bit of moss
  // water: a pond with a muddy rim, lily pads, cattails (and, on the pond hole, a beaver lodge)
  for(const w of h.water){ g.fillStyle='#6b5a3a'; g.beginPath(); g.ellipse(w.x,w.y,w.rx+2,w.ry+2,0,0,Math.PI*2); g.fill(); g.fillStyle='#3d7fb8'; g.beginPath(); g.ellipse(w.x,w.y,w.rx,w.ry,0,0,Math.PI*2); g.fill();
    g.fillStyle='#4f93cc'; g.beginPath(); g.ellipse(w.x-6,w.y-6,w.rx*.62,w.ry*.52,0,0,Math.PI*2); g.fill(); F('#d7ecf8',w.x-12,w.y-9,7,1); F('#d7ecf8',w.x+8,w.y+7,5,1); F('#d7ecf8',w.x-2,w.y+14,4,1);
    for(const [dx,dy] of [[-18,10],[14,-12],[22,8],[-8,18]]){F('#4d9a50',w.x+dx,w.y+dy,4,2); F('#6ab563',w.x+dx,w.y+dy,2,1); if(dx>0)F('#f2a7c8',w.x+dx+1,w.y+dy-1,1,1)}
    for(let a=0;a<6.28;a+=.5){ if(rnd()<.55)continue; const x=w.x+Math.cos(a)*(w.rx+1), y=w.y+Math.sin(a)*(w.ry+1); F('#4f8a37',x,y-5,1,6); F('#6b4428',x,y-7,1,3) }
    F('#6b4a2f',w.x+6,w.y-4,12,6); F('#8a6a4a',w.x+8,w.y-6,8,3); F('#5a3d26',w.x+7,w.y-2,10,1); F('#8a6a4a',w.x+10,w.y-7,4,1); F('#1d1420',w.x+11,w.y+1,3,1) }   // the lodge: a heap of sticks
  // a dry-stone wall wandering through, the way they do in every Vermont wood
  if(h.wall){ const [[x1,y1],[x2,y2]]=h.wall, L=Math.hypot(x2-x1,y2-y1); for(let d=0;d<L;d+=4){ const x=x1+(x2-x1)*d/L, y=y1+(y2-y1)*d/L+Math.round(Math.sin(d/9)*1.5); if(along(x,y)[0]<9&&d%12)continue;   // (tumbled down where the fairway crosses it)
      F('rgba(0,0,0,.2)',x,y+3,5,1); F(rnd()<.5?'#8a8478':'#9a9488',x,y,5,3); F('#b4aea2',x,y,4,1); F('#6f6a60',x+4,y+1,1,2); if(rnd()<.2)F('#4a7442',x+1,y,2,1) } }
  // sap lines strung between the maples (the sugarbush holes)
  if(i===4||i===5){ g.strokeStyle='rgba(120,190,235,.75)'; g.lineWidth=1; const ms=h.trees.filter((_,k)=>treeKind(i,k)==='m'); for(let k=1;k<ms.length;k++){ const [x1,y1]=ms[k-1],[x2,y2]=ms[k]; if(Math.hypot(x2-x1,y2-y1)>34)continue; g.beginPath(); g.moveTo(x1+.5,y1-7.5); g.quadraticCurveTo((x1+x2)/2,(y1+y2)/2-4,x2+.5,y2-7.5); g.stroke() } }
  // the tee: a gravel pad edged with timbers, and a little sign post with the hole number
  F('rgba(0,0,0,.15)',t.x-9,t.y+5,19,2); F('#6b4a2f',t.x-10,t.y-6,20,12); F('#a8a296',t.x-9,t.y-5,18,10); for(let k=0;k<50;k++)F(rnd()<.5?'#8a8478':'#c4beb2',t.x-9+rnd()*18|0,t.y-5+rnd()*10|0,1,1);
  { const sx=t.x+(t.x>150?14:-15), sy=t.y-2; F('#6b4a2f',sx+2,sy-2,2,9); F('#3d6b3a',sx-1,sy-9,8,8); F('#4f8a45',sx-1,sy-9,8,1); pixText(g,String(i+1),sx+1,sy-8,'#ffffff') }
  // the basket's spot: a ring of mulch; and the putting circle
  g.fillStyle='#8a6a4a'; g.beginPath(); g.ellipse(b.x,b.y+4,8,5,0,0,Math.PI*2); g.fill(); for(let k=0;k<14;k++)F(rnd()<.5?'#6b4a2f':'#a8866a',b.x-6+rnd()*12|0,b.y+1+rnd()*6|0,2,1);
  g.strokeStyle='rgba(255,255,255,.4)'; g.setLineDash([2,4]); g.beginPath(); g.arc(b.x,b.y,GOLF.PUTT_RANGE,0,Math.PI*2); g.stroke(); g.setLineDash([]);
  // the woods all around: out of bounds. A wall of dark canopy, a few pale birch trunks, white stakes where the mowing stops
  const blob=(x,y)=>{ const d=rnd()<.5; F('#16381f',x,y+1,9,8); F(d?'#1f4a2c':'#24532c',x,y,9,8); F(d?'#2f6b3a':'#2b6034',x+1,y,7,6); F('#3d8443',x+1,y+1,3,2); if(rnd()<.3)F('#4d9a50',x+2,y+1,1,1) };
  F('#1f4a2c',0,0,GW,O.y-1); F('#1f4a2c',0,O.y+O.h+1,GW,GH); F('#1f4a2c',0,0,O.x-1,GH); F('#1f4a2c',O.x+O.w+1,0,GW,GH);
  for(let x=-4;x<GW;x+=6){ blob(x+(rnd()*3|0),-3); blob(x+(rnd()*3|0),O.y-7+(rnd()*3|0)); blob(x+(rnd()*3|0),O.y+O.h-1+(rnd()*3|0)); blob(x+(rnd()*3|0),GH-6) }
  for(let y=-2;y<GH;y+=6){ blob(-5+(rnd()*2|0),y); blob(O.x+O.w-1+(rnd()*2|0),y+(rnd()*3|0)) }
  for(let x=O.x-2;x<O.x+O.w;x+=7){ if(rnd()<.75)blob(x+(rnd()*3|0),O.y-2+(rnd()*4|0)); if(rnd()<.75)blob(x+(rnd()*3|0),O.y+O.h-8+(rnd()*4|0)) }   // a ragged inner edge: the woods lean in over the rough
  for(let y=O.y;y<O.y+O.h;y+=7){ if(rnd()<.7)blob(O.x-3+(rnd()*4|0),y+(rnd()*3|0)); if(rnd()<.7)blob(O.x+O.w-7+(rnd()*4|0),y+(rnd()*3|0)) }
  for(let k=0;k<7;k++){ const x=10+rnd()*(GW-20)|0, top=rnd()<.5; F('#eef0ea',x,top?O.y-2:O.y+O.h-3,2,5); F('#3a3a3a',x,(top?O.y-2:O.y+O.h-3)+2,2,1) }
  for(let x=O.x+6;x<O.x+O.w;x+=14){ F('#ffffff',x,O.y,1,3); F('#c8322b',x,O.y,1,1); F('#ffffff',x,O.y+O.h-3,1,3); F('#c8322b',x,O.y+O.h-3,1,1) }
  for(let y=O.y+6;y<O.y+O.h;y+=14){ F('#ffffff',O.x,y,1,3); F('#c8322b',O.x,y,1,1); F('#ffffff',O.x+O.w-1,y,1,3); F('#c8322b',O.x+O.w-1,y,1,1) }
  return c;
});
// the clearing before a round: the course kiosk (a map of the six holes under a little roof) and a picnic table with two old milk cans
function drawGolfClearing(){ const F=(c,x,y,w,h)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h)};
  { const x=KIOSK.x, y=KIOSK.y-16; F('rgba(0,0,0,.2)',x-1,y+21,20,2); F('#5a3d26',x+1,y+6,2,16); F('#5a3d26',x+15,y+6,2,16); F('#3d6b3a',x-3,y,24,5); F('#4f8a45',x-3,y,24,1); F('#2f5a32',x-3,y+4,24,1);
    F('#e9d9b4',x+3,y+6,12,11); F('#6aa84a',x+4,y+7,10,9); for(let k=0;k<6;k++){F('#f4d35e',x+5+(k%3)*3,y+8+(k>2?4:0),2,2); F('#ffffff',x+5+(k%3)*3,y+8+(k>2?4:0),1,1)} F('#3d7fb8',x+10,y+13,3,2) }
  { const x=PICNIC.x, y=PICNIC.y-8; F('rgba(0,0,0,.2)',x,y+15,24,2); F('#8a5a34',x,y+6,22,4); F('#a8743f',x,y+6,22,1); F('#6b4428',x+2,y+10,2,6); F('#6b4428',x+18,y+10,2,6); F('#8a5a34',x-2,y+12,26,2); F('#a8743f',x-2,y+12,26,1);
    for(const cx of [x+4,x+11]){ F('#9aa3b0',cx,y-1,5,7); F('#c9ced4',cx,y-1,2,7); F('#7d8694',cx+1,y-3,3,2); F('#c9ced4',cx+1,y-3,1,1); F('#5f6676',cx,y+2,5,1) } F('#f4d35e',x+17,y+4,4,2); F('#e8742a',x+17,y+5,4,1) } }

// ---------- throwing ----------
const golfHole=()=>HOLES[golf.hole];
const isPutt=()=>Math.hypot(golf.lie.x-golfHole().basket.x,golf.lie.y-golfHole().basket.y)<=GOLF.PUTT_RANGE;
const aimBase=()=>{const b=golfHole().basket; return Math.atan2(b.y-golf.lie.y,b.x-golf.lie.x)};
function aimNow(){const span=isPutt()?GOLF.PUTT_SPAN:GOLF.AIM_SPAN, per=isPutt()?GOLF.PUTT_PERIOD:GOLF.AIM_PERIOD; return aimBase()+span*Math.sin(golf.t/per*Math.PI*2)}
function powerNow(){const per=isPutt()?GOLF.PUTT_POWER_PERIOD:GOLF.POWER_PERIOD, ph=(golf.t%per)/per; return ph<.5?ph*2:2-ph*2}
const inWater=(h,x,y)=>h.water.some(w=>((x-w.x)/w.rx)**2+((y-w.y)/w.ry)**2<=1);
// where a throw goes: returns {path, end, result:'in'|'tree'|'water'|'ob'|'land'}
// special first throws: 'platform' (farther, sails over the trees early on) or 'hike' (through the legs: shorter, no fade)
function throwMode(){const h=golfHole(); if(golf.lie.x!==h.tee.x||golf.lie.y!==h.tee.y)return ''; return h.platform?'platform':h.hike?'hike':''}   // a rethrow from the tee is still special
function golfFlight(h,lie,angle,power,putt,mode=''){
  const mult=mode==='platform'?GOLF.PLATFORM:mode==='hike'?GOLF.HIKE:1;
  const D=Math.max(8,power*(putt?GOLF.PUTT_MAX:GOLF.MAX)*mult), path=[], passed=new Set(); let x=lie.x,y=lie.y,a=angle;
  for(let s=0;s<=D;s+=1){
    if(!putt&&mode!=='hike'){const f=s/D; if(f>.72)a-=GOLF.FADE/(D*.28)}    // backhand fade at the end
    x+=Math.cos(a); y+=Math.sin(a); path.push({x,y});
    const db=Math.hypot(x-h.basket.x,y-h.basket.y);
    if(db<(putt?GOLF.PUTT_CHAINS:GOLF.CHAINS)&&(putt||s>D*.55))return {path,end:{x:h.basket.x,y:h.basket.y},result:'in'};
    // trees: a dead-center hit stops the disc; anything else glances off and curves around the trunk
    if(!(mode==='platform'&&s<D*.5))for(const [tx,ty] of h.trees){ const cy=ty-3; if(passed.has(tx+','+ty)||Math.hypot(x-tx,y-cy)>=GOLF.TREE_R)continue;
      passed.add(tx+','+ty); const side=Math.cos(a)*(cy-y)-Math.sin(a)*(tx-x);   // how far the trunk is from the disc's line (+ = to the right)
      if(Math.abs(side)<GOLF.TREE_HIT){ const bx=x-Math.cos(a)*4, by=y-Math.sin(a)*4; path.push({x:bx,y:by}); return {path,end:{x:bx,y:by},result:'tree'} }
      a-=Math.sign(side)*GOLF.TREE_NUDGE }
    if(x<GOLF_OB.x||y<GOLF_OB.y||x>GOLF_OB.x+GOLF_OB.w||y>GOLF_OB.y+GOLF_OB.h)return {path,end:{x,y},result:'ob'};
  }
  return {path,end:{x,y},result:inWater(h,x,y)?'water':'land'};
}
function golfTap(){
  if(!golf.active)return;
  if(golf.state==='aim'){golf.angle=aimNow(); golf.state='power'; golf.t=Math.random()*400; return}
  if(golf.state==='power'){
    golf.power=powerNow(); const putt=isPutt(), mode=throwMode();
    if(mode==='hike')golf.angle+=(Math.random()-.5)*GOLF.HIKE_WILD;      // you can't really see where it's going
    golf.flight=golfFlight(golfHole(),golf.lie,golf.angle,golf.power,putt,mode); golf.flight.i=0; golf.flight.putt=putt; golf.flight.mode=mode;
    golf.strokes++; golf.state='flight'; golf.msg=''; golf.trail=[]; golf.introT=0; sfx('whoosh');
  }
}
function golfLand(){
  const f=golf.flight, h=golfHole(), T=GOLF_TEXT;
  if(golf.practice){ sfx(f.result==='in'?'chains':f.result==='water'?'splash':f.result==='tree'?'thud':'click'); if(f.result!=='water'&&f.result!=='ob')golf.lie={...f.end}; P.x=golf.lie.x; P.y=golf.lie.y+4; return golfPracticeResult() }
  sfx(f.result==='in'?'chains':f.result==='water'?'splash':f.result==='ob'?'buzz':f.result==='tree'?'thud':'click');
  if(f.result==='in'){ golf.msg=golf.strokes===1?T.ace:T.chains; golf.fx={kind:'in',t:0}; return golfHoleDone() }
  if(f.result==='water'||f.result==='ob'){ if(f.result==='water')golf.fx={kind:'splash',t:0,x:f.end.x,y:f.end.y}; golf.strokes++; golf.msg=f.result==='water'?T.water:T.ob; P.x=golf.lie.x; P.y=golf.lie.y+4;
    // pop-up: what happened and the penalty
    golf.state='penalty';
    return showDialog({place:T.place,speaker:f.result==='water'?T.waterTitle:T.obTitle,pages:[T.penalty(golf.strokes+1)],actions:[{label:T.penaltyOk,fn:()=>{closeDialog();
      if(golf.strokes>=GOLF.MAX_STROKES)return golfHoleDone(true); golf.state='aim'; golf.t=Math.random()*1000}}]}) }
  else { golf.prevLie={...golf.lie}; golf.lie={...f.end}; if(f.result==='tree'){golf.msg=T.tree; flashGolf(T.tree)} }
  P.x=golf.lie.x; P.y=golf.lie.y+4;
  if(golf.strokes>=GOLF.MAX_STROKES)return golfHoleDone(true);
  golf.state='aim'; golf.t=Math.random()*1000;
}
function sampleScore(dist){let r=Math.random(); for(const [k,p] of Object.entries(dist)){r-=p; if(r<=0)return +k} return 0}
function golfHoleDone(pickedUp){
  golf.state='between'; const h=golfHole(), T=GOLF_TEXT, rel=golf.strokes-h.par;
  const m=sampleScore(GOLF.MARGIE), j=sampleScore(GOLF.JACK);
  golf.you.push(rel); golf.margie.push(m); golf.jack.push(j);
  const word=r=>r<=-2?'Eagle':r===-1?'Birdie':r===0?'Par':r===1?'Bogey':r===2?'Double bogey':`+${r}`;
  const lines=[['',`${golf.msg?golf.msg+' ':''}${pickedUp?'You pick up.':''} ${word(rel)} (${golf.strokes} throws).`.trim()],
    ['Margie',T.margieHole[String(m)]],['Jack',T.jackHole[String(j)]]];
  golf.timer=setTimeout(()=>say(lines,()=>{ if(golf.hole<HOLES.length-1){golf.hole++; golfStartHole()} else golfRoundOver() }),500);
}
function golfStartHole(){
  const h=golfHole(); golf.lie={...h.tee}; golf.prevLie={...h.tee}; golf.strokes=0; golf.state='aim'; golf.t=Math.random()*1000; golf.msg='';
  P.x=h.tee.x; P.y=h.tee.y+4; P.dir='right';
  golf.introT=2600; golf.trail=[];   // (the big wooden tee sign shows the hole's name: see over())
  if(h.platform)say([['Margie',GOLF_TEXT.platformHint]]);
  if(h.hike){P.dir='left'; say([['Jack',GOLF_TEXT.hikeHint]])}
  if(h.path)say([['Margie',GOLF_TEXT.doglegHint]]);
}
const onPlatform=()=>golf.active&&golfHole().platform&&golf.lie&&golf.lie.x===golfHole().tee.x&&golf.lie.y===golfHole().tee.y&&golf.state!=='between';
function flashGolf(t){prompt.textContent=t; prompt.hidden=false; golf.promptT=1800}
function golfRoundOver(){
  golf.active=false; golf.state='idle';
  const sum=a=>a.reduce((x,y)=>x+y,0), you=sum(golf.you), m=sum(golf.margie), j=sum(golf.jack);
  const fmt=v=>v===0?'E':v>0?`+${v}`:`${v}`;
  const card=`Final: Joe ${fmt(you)} · Margie ${fmt(m)} · Jack ${fmt(j)}`;
  const won=you<j&&you<=m;
  const h=HOLES[0]; P.x=h.tee.x+30; P.y=h.tee.y-10;
  have.golfCard=`Joe ${fmt(you)} · Margie ${fmt(m)} · Jack ${fmt(j)}`;
  if(won){ have.golfWon=true; save(); say([['',card],...GOLF_TEXT.win.map(t=>['Margie',t]),['Jack',GOLF_TEXT.jackWin]],()=>showReward('golf')) }
  else say([['',card],['Margie',GOLF_TEXT.lose[0]]],()=>{ showDialog({place:GOLF_TEXT.place,speaker:'Margie',pages:['Another round?'],actions:[{label:GOLF_TEXT.again,fn:()=>{closeDialog();golfStartRound()}},{label:GOLF_TEXT.notYet,ghost:true,fn:closeDialog}]}) });
}
function golfRestart(){
  if(!golf.active)return; const T=GOLF_TEXT;
  showDialog({place:T.place,speaker:'Margie',pages:[T.restartAsk],actions:[{label:T.restartYes,fn:()=>{closeDialog(); clearTimeout(golf.timer); golf.flight=null; golfStartRound()}},{label:T.restartNo,ghost:true,fn:closeDialog}]});
}
$('golfRestart').onclick=()=>{ $('golfRestart').blur(); golfRestart() };
function golfStartRound(){ Object.assign(golf,{active:true,practice:false,hole:0,you:[],margie:[],jack:[]}); golfStartHole() }

function talkMargie(){
  const T=GOLF_TEXT;
  if(have.golf){ const acts=[CLOSE]; if(have.baked)acts.unshift({label:REPLAY.golf,fn:()=>{closeDialog();golfHowTo(golfPracticeAsk)}}); return showDialog({place:T.place,speaker:'Margie',pages:[T.after],actions:acts}) }   // (replays once you've baked)
  if(have.golfWon)return showReward('golf');
  showDialog({place:T.place,speaker:'Margie',pages:T.margieHello,actions:[{label:T.ready,fn:()=>{closeDialog();golfHowTo(golfPracticeAsk)}},{label:T.notYet,ghost:true,fn:closeDialog}]});
}
// instructions card, then the offer of a practice throw
function golfHowTo(then){
  const T=GOLF_TEXT;
  const rows=['Margie','Jack'].map(name=>{const p=PORTRAITS[name], c=document.createElement('canvas'); c.width=c.height=p.size; const g=c.getContext('2d'); g.fillStyle=p.bg; g.fillRect(0,0,p.size,p.size); p.draw(g);
    const row=document.createElement('div'); row.className='hrow'; const t=document.createElement('div'); t.innerHTML='<b></b><span></span>'; t.querySelector('b').textContent=name; t.querySelector('span').textContent=T.howToPeople[name]; row.append(c,t); return row});
  $('howTitle').textContent=T.howToTitle; $('howRows').replaceChildren(...rows);
  $('howControls').replaceChildren(...T.howToSteps.map(x=>{const li=document.createElement('li'); li.textContent=x; return li}));
  $('howOk').textContent=T.howToOk; $('howOk').onclick=()=>{ $('howto').hidden=true; paused=false; then&&then() };
  paused=true; prompt.hidden=true; $('howto').hidden=false; setTimeout(()=>$('howOk').focus({preventScroll:true}),0);
}
function golfPracticeAsk(){
  const T=GOLF_TEXT;
  showDialog({place:T.place,speaker:'Margie',pages:[T.practiceAsk],actions:[
    {label:T.practice,fn:()=>{closeDialog();golfPractice()}},{label:T.startRound,fn:()=>{closeDialog();golfStartRound()}}]});
}
function golfPractice(){
  Object.assign(golf,{active:true,practice:true,hole:0,you:[],margie:[],jack:[]});
  const h=HOLES[0]; golf.lie={...h.tee}; golf.prevLie={...h.tee}; golf.strokes=0; golf.state='aim'; golf.t=Math.random()*1000; golf.msg='';
  P.x=h.tee.x; P.y=h.tee.y+4; P.dir='right'; flashGolf(GOLF_TEXT.practice);
}
function golfPracticeResult(){
  const T=GOLF_TEXT, f=golf.flight, b=golfHole().basket;
  const line=f.result==='in'?T.practiceIn:f.result==='water'?T.practiceWater:f.result==='ob'?T.practiceOb:(f.result==='tree'?T.practiceTree+' ':'')+T.practiceDist(Math.round(Math.hypot(f.end.x-b.x,f.end.y-b.y)));
  golf.state='between';
  setTimeout(()=>showDialog({place:T.place,speaker:'Margie',pages:[line],actions:[
    {label:T.practiceAgain,fn:()=>{closeDialog();golfPractice()}},{label:T.startRound,fn:()=>{closeDialog();golf.practice=false;golfStartRound()}}]}),400);
}
// the scorecard, shown at the top between holes: one column a hole, a row each for par, Joe, Margie and Jack, totals on the right
function drawGolfCard(){ if(!golf.you.length)return; const F=(c,x,y,w,h)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h)}, n=HOLES.length, cw=17, x0=34, w=x0+n*cw+26, X=Math.round(112-w/2), Y=4, fmt=v=>v===0?'E':v>0?'+'+v:''+v, U=GOLF_TEXT.ui;
  F('rgba(0,0,0,.3)',X+2,Y+2,w,49); F('#3d6b3a',X,Y,w,49); F('#f6f1e2',X+1,Y+9,w-2,39); F('#4f8a45',X,Y,w,1);
  pixText(ctx,U.card,X+3,Y+2,'#ffffff'); for(let k=0;k<n;k++)pixText(ctx,String(k+1),X+x0+k*cw+6,Y+11,'#3d6b3a'); pixText(ctx,U.total,X+x0+n*cw+2,Y+11,'#3d6b3a'); F('#c8c0a8',X+2,Y+17,w-4,1);
  const rows=[[U.par,HOLES.map(h=>h.par),'#8a8478',true],['JOE',golf.you,'#c8322b'],['MARGIE',golf.margie,'#2b2236'],['JACK',golf.jack,'#2b2236']];
  rows.forEach(([name,vals,col,isPar],r)=>{ const y=Y+19+r*7-(r?0:0)+(r?0:0); if(!isPar&&r===1)F('#fbe9c8',X+2,y-1,w-4,7);
    pixText(ctx,name,X+3,y,col); vals.forEach((v,k)=>{ const t=isPar?String(v):String(HOLES[k].par+v), under=!isPar&&v<0; if(under){F('#f4d35e',X+x0+k*cw+3,y-1,9,7)} pixText(ctx,t,X+x0+k*cw+6,y,col) });
    if(!isPar)pixText(ctx,fmt(vals.reduce((a,b)=>a+b,0)),X+x0+n*cw+4,y,col); else pixText(ctx,String(HOLES.reduce((a,h)=>a+h.par,0)),X+x0+n*cw+4,y,col) }) }
const MARGIE_SPOT={x:46,y:118}, JACK_SPOT={x:62,y:128};
SCENES.golf={ place:GOLF_TEXT.place, music:'golf',
  w:GW, h:GH, bounds:R(4,30,216,136),
  get bg(){ return golfBgs[golf.active||golf.state==='between'?golf.hole:0] },
  get solids(){ return golf.active?[]:[KIOSK,PICNIC,...HOLES[0].trees.map(([x,y])=>R(x-3,y-3,6,4)),R(MARGIE_SPOT.x-4,MARGIE_SPOT.y-3,8,4),R(JACK_SPOT.x-4,JACK_SPOT.y-3,8,4),R(188,30,8,8)] },
  triggers:[],   // the way out is an exit at the bottom (extras.js)
  entries:{start:{x:112,y:154,dir:'up'}, fromRoad:{x:112,y:154,dir:'up'}},
  enter(){ golf.active=false; golf.state='idle' },
  speed:()=>golf.active?0:.07,
  dynTrigger(){
    if(golf.active)return null;
    if(Math.hypot(P.x-MARGIE_SPOT.x,P.y-MARGIE_SPOT.y)<15)return {label:'Talk to Margie',btn:'Talk',act:talkMargie};
    if(Math.hypot(P.x-JACK_SPOT.x,P.y-JACK_SPOT.y)<15)return {label:'Talk to Jack',btn:'Talk',act:()=>say([['Jack',GOLF_TEXT.jackHello]])};
    return null;
  },
  ability:()=>golfTap(),
  abilityLabel:()=>golf.active?(golf.state==='aim'?'Aim':golf.state==='power'?(throwMode()==='hike'?'Hike!':'Throw'):''):'',
  ambient(dt){ if(golf.promptT>0){golf.promptT-=dt; if(golf.promptT<=0&&!near)prompt.hidden=true} if(golf.introT>0)golf.introT-=dt; if(golf.fx){golf.fx.t+=dt; if(golf.fx.t>1400)golf.fx=null} },
  update(dt){
    if(!golf.active)return;
    if(golf.state==='aim'||golf.state==='power')golf.t+=dt;
    if(golf.state==='flight'){const f=golf.flight; f.i=Math.min(f.path.length-1,f.i+dt*GOLF.SPEED*(f.putt?.8:1)); if(f.i>=f.path.length-1)golfLand()}
  },
  drawPlayer:(x,y)=>{
    if(golf.active&&throwMode()==='hike'&&golf.state!=='flight')P.dir='left';   // facing away from the basket
    drawPlayer(x,y-(onPlatform()?7:0));
    if(golf.active&&throwMode()==='hike'&&(golf.state==='aim'||golf.state==='power')){ // HUT! HUT!
      const bx=Math.round(x)-22, by=Math.round(y)-34; ctx.fillStyle='#ffffff'; ctx.fillRect(bx,by,24,9); ctx.fillRect(bx+18,by+9,2,2);
      ctx.fillStyle='#2b2236'; ctx.font='7px monospace'; ctx.fillText('HUT!',bx+3,by+7)}
  },
  under(){
    const h=golf.active||golf.state==='between'?golfHole():HOLES[0]; drawBasket(h.basket.x,h.basket.y);
    if(h.platform){const t=h.tee, F=(c,x,y,w,hh)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,hh)};   // the lookout platform
      F('rgba(0,0,0,.22)',t.x-9,t.y+1,22,6); F('#6b4a2f',t.x-10,t.y-4,2,8); F('#6b4a2f',t.x+8,t.y-4,2,8);
      F('#a26c40',t.x-11,t.y-8,22,6); for(let xx=t.x-11;xx<t.x+11;xx+=4)F('#8a5a34',xx,t.y-8,1,6); F('#5a3a22',t.x-11,t.y-10,22,1);
      F('#6b4a2f',t.x+11,t.y-7,2,12); for(let yy=t.y-5;yy<t.y+5;yy+=3)F('#8a5a34',t.x+11,yy,4,1)}
    if(!golf.active&&golf.state!=='between'){ drawGolfClearing(); drawCow(22,44); drawCow(150,132) }   // (and a couple of cows who wandered over from next door)
  },
  ents(list){
    const h=golf.active||golf.state==='between'?golfHole():HOLES[0];
    const hi=HOLES.indexOf(h); h.trees.forEach(([x,y],k)=>list.push({y,draw:()=>drawGolfTree(x,y,treeKind(hi,k))}));
    const m=golf.active?{x:h.tee.x+(h.tee.x>150?-16:16),y:h.tee.y-14}:MARGIE_SPOT, j=golf.active?{x:h.tee.x+(h.tee.x>150?-28:28),y:h.tee.y-4}:JACK_SPOT;
    list.push({y:m.y,draw:()=>drawMargie(m.x,m.y)},{y:j.y,draw:()=>drawJack(j.x,j.y)});
  },
  over(){
    const F=(c,x,y,w,h)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),w,h)};
    const plaque=(x,y,w,h)=>{ F('rgba(0,0,0,.3)',x+1,y+h,w,1); F('#5a3d26',x,y,w,h); F('#7a5636',x+1,y+1,w-2,h-2); F('#8f6a46',x+1,y+1,w-2,1); F('#5a3d26',x+1,y+h-2,w-2,1) };
    if(golf.fx&&golf.fx.kind==='in'){ const b=golfHole().basket, k=golf.fx.t/1400; for(let n=0;n<10;n++){ const a=n*.63+k*2, r=4+k*16; F(n%2?'#f4d35e':'#ffffff',b.x+Math.cos(a)*r,b.y-8+Math.sin(a)*r*.7,1+(n%3===0),1+(n%3===0)) } }   // chains! a burst of sparkles
    if(golf.fx&&golf.fx.kind==='splash'){ const k=golf.fx.t/1400; ctx.strokeStyle=`rgba(215,236,248,${1-k})`; for(const r of [3+k*10,1+k*6]){ctx.beginPath(); ctx.ellipse(golf.fx.x,golf.fx.y,r,r*.5,0,0,Math.PI*2); ctx.stroke()} for(let n=0;n<5;n++)F('#d7ecf8',golf.fx.x-4+n*2,golf.fx.y-k*10*(1+n%2)+k*k*14,1,1) }
    if(!golf.active){ if(golf.state==='between')drawGolfCard(); return }
    const L=golf.lie, putt=isPutt(), h=golfHole(), mode=throwMode(), far=(putt?GOLF.PUTT_MAX:GOLF.MAX)*(mode==='platform'?GOLF.PLATFORM:mode==='hike'?GOLF.HIKE:1);
    const toGo=Math.hypot(h.basket.x-L.x,h.basket.y-L.y);
    if(golf.state==='aim'||golf.state==='power'){
      // the aim: a faint fan showing how far the arrow swings, and the arrow itself
      const base=aimBase(), span=putt?GOLF.PUTT_SPAN:GOLF.AIM_SPAN, a=golf.state==='aim'?aimNow():golf.angle, len=putt?26:38;
      if(golf.state==='aim'){ ctx.fillStyle='rgba(255,255,255,.13)'; ctx.beginPath(); ctx.moveTo(L.x,L.y); ctx.arc(L.x,L.y,len,base-span,base+span); ctx.closePath(); ctx.fill();
        ctx.strokeStyle='rgba(255,255,255,.35)'; ctx.beginPath(); ctx.arc(L.x,L.y,len,base-span,base+span); ctx.stroke() }
      for(let s=7;s<len-3;s+=3)F('#ffffff',L.x+Math.cos(a)*s-.5,L.y+Math.sin(a)*s-.5,2,2);
      const hx=L.x+Math.cos(a)*len, hy=L.y+Math.sin(a)*len; ctx.fillStyle='#1d2130'; ctx.beginPath(); ctx.moveTo(hx+Math.cos(a)*5,hy+Math.sin(a)*5); ctx.lineTo(hx+Math.cos(a+2.4)*5,hy+Math.sin(a+2.4)*5); ctx.lineTo(hx+Math.cos(a-2.4)*5,hy+Math.sin(a-2.4)*5); ctx.closePath(); ctx.fill();
      ctx.fillStyle='#f4d35e'; ctx.beginPath(); ctx.moveTo(hx+Math.cos(a)*4,hy+Math.sin(a)*4); ctx.lineTo(hx+Math.cos(a+2.4)*3.5,hy+Math.sin(a+2.4)*3.5); ctx.lineTo(hx+Math.cos(a-2.4)*3.5,hy+Math.sin(a-2.4)*3.5); ctx.closePath(); ctx.fill();
      // the power meter, along the bottom: green, gold, red; the white notch is how hard you'd throw to reach the basket from here
      const mx=108, my=154, mw=104, live=golf.state==='power', pw=live?powerNow():0, need=Math.min(1,toGo/far);
      plaque(mx-4,my-9,mw+8,20); pixText(ctx,putt?GOLF_TEXT.ui.putt:GOLF_TEXT.ui.power,mx,my-7,'#f6e7c8'); const dtxt=golfFeet(toGo)+' '+GOLF_TEXT.ui.ft; pixText(ctx,dtxt,mx+mw-textW(dtxt),my-7,'#f4d35e');
      F('#1d1420',mx-1,my,mw+2,8); for(let k=0;k<mw;k++)F(k/mw>.85?'#b8433a':k/mw>.5?'#b89a3a':'#3f7a45',mx+k,my+1,1,6);
      if(live){ for(let k=0;k<Math.round(pw*mw);k++)F(k/mw>.85?'#ff6a5a':k/mw>.5?'#f4d35e':'#8cff8c',mx+k,my+1,1,6); F('#ffffff',mx+Math.round(pw*mw)-1,my-1,2,10) }
      else if(Math.floor(time/400)%2)F('rgba(255,255,255,.25)',mx,my+1,mw,6);
      const nx=mx+Math.round(need*mw); F('#ffffff',nx,my-2,1,12); F('#ffffff',nx-1,my-3,3,1); F('#ffffff',nx-1,my+9,3,1);
    }
    if(golf.state==='flight'){ const f=golf.flight, p=f.path[Math.floor(f.i)], k=f.i/Math.max(1,f.path.length-1), up=f.putt?Math.sin(k*Math.PI)*3:Math.sin(k*Math.PI)*(f.mode==='platform'?16:9);   // the disc climbs and comes down; its shadow stays on the grass
      golf.trail.push({x:p.x,y:p.y-up}); if(golf.trail.length>14)golf.trail.shift(); golf.trail.forEach((q,n)=>{ ctx.fillStyle=`rgba(255,255,255,${n/40})`; ctx.fillRect(Math.round(q.x),Math.round(q.y),2,1) });
      F('rgba(0,0,0,.25)',p.x-2,p.y+2,5,2); const sp=Math.floor(time/60)%2; F('#b8501a',p.x-3,p.y-up-1,7,3); F('#e8742a',p.x-3,p.y-up-2,7,3); F('#f4a04a',p.x-2+sp*2,p.y-up-2,3,1); F('#ffffff',p.x-1,p.y-up-1,1,1) }
    else if(golf.lie&&golf.state!=='between'){ F('rgba(0,0,0,.2)',L.x-2,L.y+1,5,1); F('#e8742a',L.x-2,L.y-1,5,2); F('#f4a04a',L.x-1,L.y-1,2,1) }
    // the hole's sign, top left: number, par, how far it is
    { const t=`${GOLF_TEXT.ui.hole} ${golf.hole+1}  ${GOLF_TEXT.ui.par} ${h.par}  ${holeFeet(h)} ${GOLF_TEXT.ui.ft}`; plaque(2,1,textW(t)+7,10); pixText(ctx,t,6,3,'#f6e7c8') }
    // at the start of each hole, the big tee sign for a couple of seconds
    if(golf.introT>0&&!golf.practice){ const k=Math.min(1,(2600-golf.introT)/200,golf.introT/250), name=(GOLF_TEXT.holeNames[golf.hole].split(': ')[1]||'').toUpperCase(), l2=`${GOLF_TEXT.ui.par} ${h.par}   ${holeFeet(h)} ${GOLF_TEXT.ui.ft}`, w=Math.max(textW(name),textW(l2),60)+16, x=Math.round(112-w/2), y=Math.round(28-12*(1-k));
      ctx.globalAlpha=k; F('#5a3d26',x+6,y+30,3,10); F('#5a3d26',x+w-9,y+30,3,10); plaque(x,y,w,32); F('#3d6b3a',x+3,y+3,w-6,9); pixText(ctx,`${GOLF_TEXT.ui.hole} ${golf.hole+1}`,Math.round(112-textW(`${GOLF_TEXT.ui.hole} ${golf.hole+1}`)/2),y+5,'#ffffff');
      pixText(ctx,name,Math.round(112-textW(name)/2),y+15,'#f4d35e'); pixText(ctx,l2,Math.round(112-textW(l2)/2),y+23,'#f6e7c8'); ctx.globalAlpha=1 }
    if(golf.state==='between')drawGolfCard();
  },
  hud(){
    if(!golf.active)return '';
    if(golf.practice)return `<span>Practice throw: doesn't count</span>`;
    const sum=a=>a.reduce((x,y)=>x+y,0), fmt=v=>v===0?'E':v>0?`+${v}`:`${v}`;
    return `<span>H${golf.hole+1} · ${isPutt()?'Putt':'Throw '+(golf.strokes+1)}</span><span>Joe ${fmt(sum(golf.you))}</span><span>Margie ${fmt(sum(golf.margie))}</span><span>Jack ${fmt(sum(golf.jack))}</span>`;
  },
};
