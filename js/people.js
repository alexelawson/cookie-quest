// Extra people: Jackie (Fargo, after you get kicked out of the shop), Logan (the clover field on the farm),
// the Vikings and Lil Q passing by on the main road, and Alex's "where to next?" hints when you stand still.
// Their lines are in story.js (JACKIE, LOGAN, HINTS).

// ---------- Jackie: short, short brown hair, very direct ----------
// Jackie: short, short brown hair (side-swept), very direct: one eyebrow up, flat mouth, arms crossed. 11 x 17 px.
const JACKIE_PAL={H:'#6b4428',h:'#4f301b',L:'#8a5a38',S:'#f0c6a0',s:'#dcae88',E:'#2b2b2b',W:'#ffffff',B:'#3b2a1e',M:'#a8574a',T:'#2b2b33',t:'#3c3c48',J:'#3a5f9e'};
const JACKIE_SPR={
  down:["..HHHHHHH..",".HHHHLLHHH.",".HSSHHHHBH.",".HSWESSWEh.","..SSSsSSS..","..sSMMMSs..",
        "..TTTTTTT..",".TTTTTTTTT.",".TSSSSSSST.",".TsSSSSSsT.",".TtTTTTTtT."],
  up:  ["..HHHHHHH..",".HHHLLHHHH.",".HHHHHHHHH.",".HHHHHHHHh.","..hHHHHHh..","...sSSSs...",
        "..TTTTTTT..",".TTTTTTTTT.",".TTTTTTTTT.",".TTTTTTTTT.",".TtTTTTTtT."],
};
function drawJackie(x,y,dir='down'){
  const X=Math.round(x)-5, Y=Math.round(y)-16, F=(c,dx,dy,w,h)=>{ctx.fillStyle=c;ctx.fillRect(X+dx,Y+dy,w,h)};
  F('rgba(0,0,0,.25)',1,15,9,2);
  F('#3a5f9e',3,11,2,4); F('#3a5f9e',6,11,2,4); F('#2c4a7c',4,11,1,4); F('#2c4a7c',7,11,1,4);
  F('#f2f2ee',2,15,3,1); F('#f2f2ee',6,15,3,1); F('#c9ced4',2,15,1,1); F('#c9ced4',6,15,1,1);   // white sneakers
  drawSprite(ctx,X,Y,JACKIE_SPR,JACKIE_PAL,dir==='up'?'up':'down',3,3);
}
PORTRAITS['Jackie']={size:32, bg:'#e8dcc8', draw(g){ const F=px(g);
  F('#2b2b33',5,25,22,7); F('#f0c6a0',13,21,6,4);
  F('#f0c6a0',10,7,12,15); F('#e3b08c',10,18,1,3); F('#e3b08c',21,18,1,3);
  F('#6b4428',9,4,14,4); F('#6b4428',9,8,2,6); F('#6b4428',21,8,2,4); F('#6b4428',11,8,7,2); F('#8a5a38',12,5,6,1); F('#4f301b',9,12,2,3);   // pixie cut, fringe swept over
  F('#3b2a1e',12,11,3,1); F('#3b2a1e',17,10,3,1);                                 // one eyebrow up
  F('#ffffff',12,13,3,2); F('#ffffff',17,13,3,2); F('#5a3a22',13,13,2,2); F('#5a3a22',18,13,2,2);
  F('#d9a37f',15,16,2,2); F('#b5654f',13,19,6,1);                                  // flat, unimpressed mouth
}};

// ---------- Ethan (Joe's brother): a little stocky, short-medium brown hair, glasses, grey/white/black, black Crocs ----------
// Ethan: Joe's brother, a little stocky. Short medium-brown hair, glasses, grey tee with white trim, black shorts, black Crocs. 13 x 20 px.
const ETHAN_PAL={H:'#6b4428',h:'#4f301b',L:'#8a5a38',S:'#eab896',s:'#d4a07c',E:'#2b2b2b',G:'#1d1d22',g:'#9fd2f0',M:'#b5654f',T:'#8a8f9a',l:'#9aa0ab',t:'#6f7480',R:'#ffffff',K:'#1d1d22',k:'#2b2b33'};
const ETHAN_SPR={
  down:["...HHHLLHH...","..HHHHHHHHH..","..HSSSSSSSH..","..SGGGSGGGS..","..sGgEGEgGs..","..SSSSsSSSS..","...sSMMMSs...",
        ".TTTTRRRTTTT.","STTTTTTTTTTtS","STTTTTTTTTTtS","SRTTTTTTTTTRS","sRTTTTTTTTTRs",".ttttttttttt.",".KKKKKkKKKKK.","..KKKKkKKKK.."],
  up:  ["...HHHLLHH...","..HHHHHHHHH..","..HHHHHHHHH..","..HHHHHHHHH..","..sHHHHHHHs..","..hHHHHHHHh..","...sSSSSSs...",
        ".TTTTTTTTTTT.","STTTTTTTTTTtS","STTTTTTTTTTtS","SRTTTTTTTTTRS","sRTTTTTTTTTRs",".ttttttttttt.",".KKKKKKKKKKK.","..KKKKKKKKK.."],
};
function drawEthan(x,y,dir='down',chew=0){
  const X=Math.round(x)-6, Y=Math.round(y)-19, F=(c,dx,dy,w,h)=>{ctx.fillStyle=c;ctx.fillRect(X+dx,Y+dy,w,h)};
  F('rgba(0,0,0,.25)',1,18,11,2);
  F('#eab896',3,14,3,3); F('#eab896',7,14,3,3); F('#d4a07c',5,14,1,3); F('#d4a07c',9,14,1,3);
  F('#1d1d22',2,17,4,2); F('#1d1d22',7,17,4,2); F('#3a3f4a',3,17,1,1); F('#3a3f4a',8,17,1,1); F('#3a3f4a',5,18,1,1); F('#3a3f4a',10,18,1,1); F('#3a3f4a',4,18,1,1); F('#3a3f4a',9,17,1,1);   // black Crocs (with the holes)
  let set=ETHAN_SPR; if(chew&&dir!=='up')set={down:ETHAN_SPR.down.map((r,i)=>i===6?'...sSSSSSs...':i===7?'.TTTTRMRTTTT.':r)};   // chewing: mouth drops a row
  drawSprite(ctx,X,Y-1,set,ETHAN_PAL,dir==='up'?'up':'down',4,4);
}
PORTRAITS['Ethan']={size:32, bg:'#d9dde3', draw(g){ const F=px(g);
  F('#8a8f9a',3,24,26,8); F('#ffffff',13,24,6,2); F('#eab896',12,20,8,4);
  F('#eab896',8,6,16,16); F('#d9a37f',8,18,16,4); F('#6b4428',8,4,16,5); F('#8a5a38',11,4,7,1); F('#6b4428',7,7,2,6); F('#6b4428',23,7,2,6);
  F('#1d1d22',9,11,6,5); F('#1d1d22',17,11,6,5); F('#1d1d22',15,12,2,1); F('#cfe6f2',10,12,4,3); F('#cfe6f2',18,12,4,3); F('#3b2a1e',11,13,2,2); F('#3b2a1e',19,13,2,2);
  F('#d9a37f',15,16,2,2); F('#b5654f',13,19,6,1);
}};
// ---------- Maureen (Joe's mom): tall and thin, curly light-brown hair, a very precise (and very sweet) baker ----------
// Maureen: Joe's mom. Tall and thin, curly light-brown hair, a fitted purple V-neck top with a gold pendant, a belt, jeans, ankle boots, a warm smile. 11 x 24 px.
const MAUREEN_PAL={H:'#b08560',c:'#c9a07a',h:'#8f6a48',S:'#f2cfb0',s:'#e0b896',E:'#4a6a8a',B:'#8f6a48',r:'#eaa3a0',M:'#c06a60',P:'#7b4fb8',p:'#62399a',l:'#9a72d0',Y:'#e8c04a',T:'#5a3a22',J:'#3a5f9e',j:'#2c4a7c'};
const MAUREEN_SPR={
  down:["...HcHcHc..","..cHhhhhHc.",".HcSSSSScH.",".cHSBSBSHc.",".HcSESEScH.",".cHrSSSrHc.",".HcSMMMScH.","..cHsSsHc..",
        "..PPSSSPP..",".SPPPYPPPS.",".SPlPPPPpS.",".SPlPPPPpS.",".SPPPPPPpS.",".sPPPPPPps.","..TTTYTTT..","..JJJJJJJ..","..JJJjJJJ.."],
  up:  ["...HcHHcH..","..cHHHHHcH.",".HHcHHHcHH.",".cHHHHcHHc.",".HHcHHHHcH.",".hHHHcHHHh.",".HhHHHHHhH.","..chsSshc..",
        "..PPPPPPP..",".SPPPPPPPS.",".SPPPPPPpS.",".SPPPPPPpS.",".SPPPPPPpS.",".sPPPPPPps.","..TTTTTTT..","..JJJJJJJ..","..JJJjJJJ.."],
};
function drawMaureen(x,y,dir='down',chew=0){
  const X=Math.round(x)-5, Y=Math.round(y)-23, F=(c,dx,dy,w,h)=>{ctx.fillStyle=c;ctx.fillRect(X+dx,Y+dy,w,h)};
  F('rgba(0,0,0,.22)',1,22,9,2);
  F('#3a5f9e',3,16,2,6); F('#3a5f9e',6,16,2,6); F('#2c4a7c',4,16,1,6); F('#2c4a7c',7,16,1,6); F('#4d74b4',3,17,1,2); F('#4d74b4',6,17,1,2);   // jeans
  F('#6b4428',2,20,3,3); F('#6b4428',6,20,3,3); F('#8a5a38',2,20,2,1); F('#8a5a38',6,20,2,1);   // ankle boots
  let set=MAUREEN_SPR; if(chew&&dir!=='up')set={down:MAUREEN_SPR.down.map((r,i)=>i===6?'.HcSSMSScH.':r)};
  drawSprite(ctx,X,Y-1,set,MAUREEN_PAL,dir==='up'?'up':'down',4,5);
}
PORTRAITS['Maureen']={size:32, bg:'#ece4f4', draw(g){ const F=px(g);
  F('#9b8ac4',4,25,24,7); F('#ffffff',12,25,8,4); F('#f2cfb0',13,21,6,4);
  F('#f2cfb0',10,7,12,15); F('#e3b898',10,19,12,3);
  for(const [x,y] of [[8,3],[11,1],[15,0],[19,1],[22,3],[7,7],[23,7],[6,11],[24,11],[7,15],[23,15],[8,19],[22,19]]){F('#b08560',x,y,4,4); F('#c9a07a',x,y,2,2)}
  F('#ffffff',12,12,3,2); F('#ffffff',18,12,3,2); F('#4a6a8a',13,12,2,2); F('#4a6a8a',19,12,2,2); F('#e8a0a0',11,16,2,1); F('#e8a0a0',20,16,2,1);
  F('#e3b898',15,15,2,2); F('#c06a60',13,18,6,1); F('#c06a60',12,17,1,1); F('#c06a60',19,17,1,1);
}};

// ---------- Logan: short, medium brown hair, in his rollerski gear, "taking a break from his workout" to look for four-leaf clovers ----------
const LOGAN={x:36, y:122};   // his own quiet corner, left of the farm path
const LOGAN_KIT={suit:'#1f3a73', suitD:'#152a55', stripe:'#ffffff', helmet:'#f6f6f2', helmetD:'#c9ced4', vent:'#1f3a73', hair:'#7a5232', skin:'#f0c6a0'};   // Middlebury navy and white
// pose 'sit': on the grass, legs out, magnifying glass over the clovers. Otherwise standing (at the party, at the Birkie finish).
function drawLogan(x,y,pose){
  const F=(c,dx,dy,w,h)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x)-5+dx,Math.round(y)-16+dy,w,h)}, K=LOGAN_KIT;
  if(pose==='sit'){   // side-on, sitting in the grass facing left: legs out in front, glass held over the clovers
    F('rgba(0,0,0,.16)',-5,14,14,2);
    F(K.suit,-3,11,7,3); F(K.suitD,-3,13,7,1); F(K.stripe,-3,11,7,1);                     // legs stretched out
    F('#2b2b33',-5,10,2,4); F('#ffffff',-5,13,2,1);                                       // race shoes, toes up
    F(K.suit,3,4,5,10); F(K.suitD,7,4,1,10); F(K.stripe,3,7,5,1);                         // upright back
    F(K.suit,7,7,2,5); F(K.skin,8,12,2,1);                                                // back arm, propped on the grass
    F(K.suit,0,7,3,2); F(K.skin,-1,7,1,2); F('#8a5a34',-2,8,1,3);                         // front arm, holding the magnifying glass
    F('#c9a24a',-7,9,5,5); F('#e8f4f8',-6,10,3,3); F('#ffffff',-6,10,1,1);
    F(K.skin,2,-1,5,5); F(K.hair,6,-1,2,2); F(K.hair,7,1,1,1); F('#e3b08c',5,1,1,1);                             // head, looking down at the clovers
    F(K.helmet,3,-5,3,1); F(K.helmet,2,-4,6,1); F(K.helmet,1,-3,7,2); F(K.vent,3,-4,1,2); F(K.vent,5,-4,1,2); F(K.vent,7,-3,1,1); F(K.helmetD,1,-1,7,1); F(K.vent,0,-2,2,1);   // a vented helmet, visor at the front
    F('#1d1d22',0,-1,3,1); F('#7fb0ff',1,-1,1,1); F('#3a3a44',6,0,1,3);   // sunglasses perched on the visor; chin strap
    F('#2b2b2b',2,1,1,1); F('#b5654f',2,3,2,1);
    return }
  F('rgba(0,0,0,.25)',1,15,10,2);
  F(K.suit,3,10,2,5); F(K.suit,6,10,2,5); F(K.stripe,3,10,1,5); F(K.stripe,7,10,1,5); F('#2b2b33',2,15,3,1); F('#2b2b33',6,15,3,1);
  F(K.suit,2,5,7,6); F(K.stripe,2,7,7,1); F(K.skin,1,6,1,4); F(K.skin,9,6,1,4);
  F(K.skin,3,0,5,5); F(K.hair,2,3,1,2); F(K.hair,8,3,1,2);
  F(K.helmet,4,-4,3,1); F(K.helmet,3,-3,5,1); F(K.helmet,2,-2,7,2); F(K.vent,4,-3,1,2); F(K.vent,6,-3,1,2); F(K.vent,3,-2,1,1); F(K.vent,7,-2,1,1); F(K.helmetD,2,0,7,1); F(K.vent,2,-1,7,1);   // vented helmet, navy visor
  F('#1d1d22',3,0,5,1); F('#7fb0ff',4,0,1,1); F('#3a3a44',2,1,1,3); F('#3a3a44',8,1,1,3);   // sunglasses up on the helmet, straps
  F(K.suitD,8,6,1,5); F(K.suitD,2,10,6,1);
  F('#2b2b2b',4,2,1,1); F('#2b2b2b',6,2,1,1); F('#b5654f',4,4,3,1);
}
// his spot: rollerskis and poles lying in the grass, a few clearly drawn clovers, and butterflies that stay right here
const LOGAN_CLOVERS=[[-25,-6,3],[-14,0,4],[-31,3,3],[-22,5,3]];   // [dx, dy, leaves] from Logan: the one under his glass has four
function drawClover(x,y,n){ const F=(c,a,b,w,h)=>{ctx.fillStyle=c;ctx.fillRect(x+a,y+b,w,h)};
  const leaf=(a,b)=>{F('#2e7d32',a,b,3,3); F('#5fbf5f',a,b,2,2); F('#a8ecb0',a,b,1,1)};
  F('#2e7d32',3,5,1,3); F('#2e7d32',4,7,1,1);                                             // stem
  if(n===4){ leaf(0,0); leaf(4,0); leaf(0,4); leaf(4,4); F('#1d5a2a',3,3,1,1) }
  else { leaf(0,1); leaf(4,1); leaf(2,-2); F('#1d5a2a',3,3,1,1) } }
// his spot: rollerskis and poles in the grass behind him, a few clearly drawn clovers, and butterflies that stay right here
function drawLoganSpot(){
  const F=(c,x,y,w,h)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h)}, x0=LOGAN.x, y0=LOGAN.y;
  for(const dy of [3,6]){F('#1d1d22',x0-6,y0+dy,14,1); F('#8a8f9a',x0-5,y0+dy+1,2,1); F('#8a8f9a',x0+5,y0+dy+1,2,1); F('#c8322b',x0-1,y0+dy-1,4,1)}   // rollerskis
  F('#3b3b44',x0+5,y0-18,1,17); F('#3b3b44',x0+8,y0-17,1,16); F('#c8322b',x0+5,y0-19,1,2); F('#c8322b',x0+8,y0-18,1,2);          // poles, planted
  for(const [dx,dy,n] of LOGAN_CLOVERS){ drawClover(x0+dx,y0+dy,n);
    if(n===4&&Math.floor(time/300)%4===0){F('#fff3a8',x0+dx+8,y0+dy-3,1,3); F('#fff3a8',x0+dx+7,y0+dy-2,3,1)} }
  for(const [k,c] of [[0,'#f4d35e'],[1,'#f2a7c8'],[2,'#9fd2f0']]){                       // butterflies, only around his spot
    const t=time/700+k*2.1, bx=Math.round(x0-12+Math.sin(t)*14+Math.sin(t*2.3)*3), by=Math.round(y0-14+Math.sin(t*1.6+k)*7), open=Math.floor(time/110+k)%2;
    F(c,bx-(open?2:1),by,open?2:1,2); F(c,bx+1,by,open?2:1,2); F('#3a3a3a',bx,by,1,2) }
}
PORTRAITS['Logan']={size:32, bg:'#d6eec4', draw(g){ const F=px(g);
  F('#1f3a73',5,25,22,7); F('#ffffff',5,28,22,2); F('#152a55',5,31,22,1); F('#f0c6a0',13,21,6,4);   // Middlebury navy and white
  F('#f0c6a0',10,8,12,14); F('#e3b08c',10,19,1,3); F('#e3b08c',21,19,1,3); F('#7a5232',9,11,2,7); F('#7a5232',21,11,2,7);   // medium brown hair under the helmet
  F('#f6f6f2',11,0,10,2); F('#f6f6f2',9,2,14,2); F('#f6f6f2',8,4,16,4); F('#1f3a73',12,1,2,5); F('#1f3a73',18,1,2,5); F('#1f3a73',9,4,2,3); F('#1f3a73',21,4,2,3); F('#c9ced4',8,7,16,1); F('#1f3a73',8,8,16,2);   // a vented helmet, navy visor
  F('#1d1d22',10,9,12,2); F('#7fb0ff',11,9,4,1); F('#7fb0ff',17,9,4,1); F('#3a3a44',9,10,1,10); F('#3a3a44',22,10,1,10);   // sunglasses on the visor, chin straps
  F('#ffffff',12,13,3,2); F('#ffffff',17,13,3,2); F('#3d6b8a',13,13,2,2); F('#3d6b8a',18,13,2,2);
  F('#d9a37f',15,16,2,2); F('#b5654f',13,19,6,1); F('#b5654f',19,18,1,1);
  F('#2e7d32',25,6,1,5); F('#5fbf5f',23,2,3,3); F('#5fbf5f',26,2,3,3); F('#5fbf5f',23,5,3,3); F('#5fbf5f',26,5,3,3);   // a four-leaf clover
}};
function talkLogan(){
  const T=LOGAN_TEXT;
  if(have.gear&&'clover' in have.gear) return showDialog({place:T.place,speaker:'Logan',pages:[T.after[Math.floor(Math.random()*T.after.length)]],actions:[CLOSE]});
  showDialog({place:T.place,speaker:'Logan',pages:T.hello,actions:[{label:T.help,fn:()=>{ closeDialog(); openCloverHunt() }},{label:T.later,ghost:true,fn:closeDialog}]});
}
const logan={searchT:0};
// the clover hunt: a field of clovers pops up; one has four leaves. Tap it (or arrow keys + Enter). A few misses and it starts to glint.
const HUNT={COLS:7, ROWS:5, HINT_AFTER:4};
const hunt={open:false, four:0, misses:0};
function drawHuntClover(g,leaves,seed,glint){
  const r=k=>{const x=Math.sin(seed*91.7+k*12.9)*43758.5; return x-Math.floor(x)};
  const F=(c,x,y,w=1,h=1)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};
  g.clearRect(0,0,14,14);
  for(let k=0;k<4;k++)F(r(k)<.5?'#4f8f3d':'#6aab50',Math.floor(r(k+5)*14),Math.floor(r(k+9)*6)+8,1,3);   // grass blades
  const ox=3+Math.floor(r(1)*3)-1, oy=2+Math.floor(r(2)*3)-1, dark=r(3)<.5?'#2e7d32':'#2a7030', mid=r(4)<.5?'#5fbf5f':'#56b356', light='#a8ecb0';
  const leaf=(a,b)=>{F(dark,ox+a,oy+b,3,3); F(mid,ox+a,oy+b,2,2); F(light,ox+a,oy+b,1,1)};
  F(dark,ox+3,oy+5,1,4); F(dark,ox+4,oy+8,1,1);   // stem
  if(leaves===4){leaf(0,0); leaf(4,0); leaf(0,4); leaf(4,4)}
  else { const turn=Math.floor(r(6)*4); [[[0,1],[4,1],[2,-2]],[[0,0],[4,0],[2,4]],[[0,0],[0,4],[4,2]],[[4,0],[4,4],[0,2]]][turn].forEach(([a,b])=>leaf(a,b)) }   // three leaves, turned different ways
  F('#1d5a2a',ox+3,oy+3,1,1);
  if(glint){F('#fff3a8',ox+8,oy-1,1,3); F('#fff3a8',ox+7,oy,3,1)}
}
function openCloverHunt(){
  const T=LOGAN_TEXT, n=HUNT.COLS*HUNT.ROWS; hunt.open=true; hunt.misses=0; hunt.four=Math.floor(Math.random()*n); hunt.seed=Math.floor(Math.random()*1000);
  $('cloverTitle').textContent=T.huntTitle; $('cloverMsg').textContent=T.huntIntro; $('cloverLater').textContent=T.huntLater;
  const face=$('cloverFace').getContext('2d'); face.clearRect(0,0,32,32); face.fillStyle=PORTRAITS.Logan.bg; face.fillRect(0,0,32,32); PORTRAITS.Logan.draw(face);
  const btns=[...Array(n)].map((_,i)=>{const b=document.createElement('button'); b.type='button'; b.className='clov'; b.setAttribute('aria-label','Clover '+(i+1)); if(i===hunt.four)b.dataset.four='1';
    const c=document.createElement('canvas'); c.width=c.height=14; drawHuntClover(c.getContext('2d'),i===hunt.four?4:3,hunt.seed+i,false); b.append(c);
    b.onclick=()=>pickClover(i,b); return b});
  $('cloverField').replaceChildren(...btns);
  paused=true; prompt.hidden=true; $('cloverHunt').hidden=false; sfx('blip'); setTimeout(()=>btns[Math.floor(n/2)].focus({preventScroll:true}),0);
}
function pickClover(i,b){
  const T=LOGAN_TEXT;
  if(i===hunt.four){ closeCloverHunt(); have.gear=have.gear||{}; have.gear.clover=1; save(); sfx('reward');
    return showDialog({place:T.place,speaker:'Logan',pages:T.found,actions:[{label:T.wear,fn:closeDialog}]}) }
  hunt.misses++; sfx('bad'); b.classList.remove('nope'); void b.offsetWidth; b.classList.add('nope');
  $('cloverMsg').textContent=T.huntMiss[(hunt.misses-1)%T.huntMiss.length];
  if(hunt.misses>=HUNT.HINT_AFTER){ const fb=$('cloverField').children[hunt.four]; drawHuntClover(fb.querySelector('canvas').getContext('2d'),4,hunt.seed+hunt.four,true); if(hunt.misses===HUNT.HINT_AFTER)$('cloverMsg').textContent=T.huntHint }
}
function closeCloverHunt(){ hunt.open=false; $('cloverHunt').hidden=true; paused=overlayOpen() }
$('cloverLater').onclick=closeCloverHunt;
addEventListener('keydown',e=>{ if(!hunt.open)return;
  if(e.code==='Escape'){e.preventDefault(); closeCloverHunt(); return}
  const btns=[...$('cloverField').children], i=btns.indexOf(document.activeElement); if(i<0)return;
  const d={ArrowLeft:-1,ArrowRight:1,ArrowUp:-HUNT.COLS,ArrowDown:HUNT.COLS,KeyA:-1,KeyD:1,KeyW:-HUNT.COLS,KeyS:HUNT.COLS}[e.code];
  if(d){e.preventDefault(); e.stopImmediatePropagation(); btns[(i+d+btns.length)%btns.length].focus({preventScroll:true})}
},true);
triggers.push({z:R(LOGAN.x-30,LOGAN.y-10,40,18), label:'Talk to Logan', btn:'Talk', act:talkLogan});

// ---------- the Vikings jogging, and Lil Q scooting by, on the main road ----------
function roadWalkers(list){
  const vt=(time%22000)/22000;                 // the Vikings, left to right, every 22 s
  if(vt<.6){const x=-20+vt/.6*(WW+40); for(let k=0;k<2;k++){const vx=x-k*12, vy=156+Math.abs(Math.sin(time/110+k))*-2; list.push({y:157,draw:()=>drawVikingStanding(vx,vy,k?'football':'norse','52')})}}
  const qt=((time+9000)%27000)/27000;          // Lil Q on her scooter, right to left, every 27 s
  if(qt<.4){const x=WW+20-qt/.4*(WW+40), y=162; list.push({y,draw:()=>{const F=(c,dx,dy,w,h)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x)+dx,y+dy,w,h)};
    F('rgba(0,0,0,.2)',-7,1,14,2); F('#c8322b',-6,-4,10,2); F('#2b2b2b',-7,-2,3,3); F('#2b2b2b',3,-2,3,3); F('#8a8f9a',-6,-8,1,5); F('#8a8f9a',-7,-8,3,1);
    drawBob(x+1,y-3); ctx.fillStyle='rgba(255,255,255,.5)'; ctx.fillRect(Math.round(x)+8+((time/80|0)%3),y-2,2,1)}})}
}

// ---------- Alex's "where to next?" hints ----------
const idle={t:0, shown:false};
function hintTick(dt){
  if(scene!==SCENES.world||paused||fade.next||P.moving||farm.active){idle.t=0; if(P.moving||scene!==SCENES.world)hideHint(); return}
  idle.t+=dt; if(idle.t>HINTS.AFTER_MS&&!idle.shown)showHint();
}
function nextHint(){
  if(have.baked)return null;
  const miss=ITEMS.find(i=>!have[i.key]);
  return miss?HINTS[miss.key]:HINTS.home;
}
function showHint(){ const t=nextHint(); if(!t)return; idle.shown=true;
  $('hintText').textContent=t; const g=$('hintFace').getContext('2d'); g.fillStyle='#e3d6bd'; g.fillRect(0,0,40,40); drawAlexFace(g,'ok'); $('hint').hidden=false; sfx('blip') }
function hideHint(){ if(!$('hint').hidden)$('hint').hidden=true; idle.shown=false }

// Jackie in Fargo: shows up outside once Alex kicks you out of the shop
function jackieSpot(){ const g=STATIONS[fargo.bob]; return freeSpotNear(g.x+40, g.face==='up'?g.y+26:g.y+2) }
function jackieArrives(){
  fargo.jackie=jackieSpot(); have.metJackie=true; save(); fargo.thinkT=1600;
  setTimeout(()=>{ if(fargo.onFoot&&fargo.jackie&&$('shop').hidden&&dlg.hidden&&have.fargoStage==='store')showDialog({place:FARGO.place,speaker:'Jackie',pages:JACKIE.kicked,actions:[{label:JACKIE.ok,fn:closeDialog}]}) },1700);   // unless Joe's already back inside
}
function talkJackie(){ const n=Math.min(fargo.jackieHint||0,JACKIE.hints.length-1); fargo.jackieHint=n+1;
  showDialog({place:FARGO.place,speaker:'Jackie',pages:[JACKIE.hints[n]],actions:[CLOSE]}) }

// every frame (from game.js), even while paused. Logan's search only counts down while Joe is still on the map.
function peopleTick(dt){
  if(fargo.thinkT>0)fargo.thinkT-=dt;
  if(paused&&!$('hint').hidden)hideHint();
  hintTick(dt);
}
// a thought bubble over Joe's head ("..." while he thinks it over)
function drawThink(){
  const think=scene===SCENES.fargo&&fargo.thinkT>0; if(!think)return;
  const x=Math.round(P.x)+4, y=Math.round(P.y)-30, F=(c,dx,dy,w,h)=>{ctx.fillStyle=c;ctx.fillRect(x+dx,y+dy,w,h)};
  F('#1d2130',-1,-1,15,9); F('#ffffff',0,0,13,7); F('#1d2130',-3,8,3,3); F('#ffffff',-2,9,1,1); F('#1d2130',-5,12,2,2);
  const n=1+Math.floor(time/300)%3; for(let i=0;i<n;i++)F('#1d2130',2+i*4,3,2,2);
}
{const ents=SCENES.world.ents; SCENES.world.ents=function(list){ ents.call(this,list);
  list.push({y:LOGAN.y-12,draw:drawLoganSpot},{y:LOGAN.y,draw:()=>drawLogan(LOGAN.x,LOGAN.y,'sit')});
  roadWalkers(list) }}
