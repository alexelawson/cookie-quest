// Extra people: Jackie (Fargo, in Lil Q's shop), Logan (the clover field on the farm),
// the Vikings and Lil Q passing by on the main road, and Alex's "where to next?" hints when you stand still.
// Their lines are in story.js (JACKIE, LOGAN, HINTS).

// ---------- Jackie: short, short black hair, very direct ----------
// Jackie: short, short black hair (side-swept), very direct: one eyebrow up, flat mouth, arms crossed. 11 x 17 px.
const JACKIE_PAL={H:'#1e1b22',h:'#0f0d12',L:'#3a3640',S:'#f0c6a0',s:'#dcae88',E:'#2b2b2b',W:'#ffffff',B:'#1e1b22',M:'#a8574a',T:'#2b2b33',t:'#3c3c48',J:'#3a5f9e'};
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
  F('#1e1b22',9,4,14,4); F('#1e1b22',9,8,2,6); F('#1e1b22',21,8,2,4); F('#1e1b22',11,8,7,2); F('#3a3640',12,5,6,1); F('#0f0d12',9,12,2,3);   // black pixie cut, fringe swept over
  F('#1e1b22',12,11,3,1); F('#1e1b22',17,10,3,1);                                 // one eyebrow up
  F('#ffffff',12,13,3,2); F('#ffffff',17,13,3,2); F('#5a3a22',13,13,2,2); F('#5a3a22',18,13,2,2);
  F('#d9a37f',15,16,2,2); F('#b5654f',13,19,6,1);                                  // flat, unimpressed mouth
}};

// ---------- Ethan (Joe's brother): stocky, short-medium brown hair, glasses, grey/white/black, black Crocs ----------
// Ethan: Joe's brother, solid and stocky (broad shoulders, normal height). Short medium-brown hair, glasses, grey tee with white trim, black shorts, black Crocs. 11 x 22 px.
const ETHAN_PAL={H:'#6b4428',h:'#4f301b',L:'#8a5a38',S:'#eab896',s:'#d4a07c',E:'#2b2b2b',G:'#1d1d22',g:'#9fd2f0',M:'#b5654f',T:'#8a8f9a',l:'#9aa0ab',t:'#6f7480',R:'#ffffff',K:'#1d1d22',k:'#2b2b33'};
const ETHAN_SPR={
  down:["...HHLLH...","..HHHHHHH..","..HSSSSSH..","..GGGSGGG..","..gEgGgEg..","..SSSsSSS..","...sMMMs...",
        ".TTTRRRTTT.","STTTTTTTTtS","STTTTTTTTtS","SRTTTTTTTRS","STTTTTTTTtS",".ttttttttt.",".KKKKkKKKK.",".KKKKkKKKK."],
  up:  ["...HHLLH...","..HHHHHHH..","..HHHHHHH..","..HHHHHHH..","..GHHHHHG..","..hHHHHHh..","...sSSSs...",
        ".TTTTTTTTT.","STTTTTTTTtS","STTTTTTTTtS","SRTTTTTTTRS","STTTTTTTTtS",".ttttttttt.",".KKKKKKKKK.",".KKKKKKKKK."],
};
function drawEthan(x,y,dir='down',chew=0){
  const X=Math.round(x)-5, Y=Math.round(y)-21, F=(c,dx,dy,w,h)=>{ctx.fillStyle=c;ctx.fillRect(X+dx,Y+dy,w,h)};
  F('rgba(0,0,0,.25)',1,20,9,2);
  F('#eab896',2,14,3,4); F('#eab896',6,14,3,4); F('#d4a07c',4,14,1,4); F('#d4a07c',8,14,1,4);                 // legs
  F('#1d1d22',1,18,4,2); F('#1d1d22',6,18,4,2); F('#3a3f4a',2,18,1,1); F('#3a3f4a',4,19,1,1); F('#3a3f4a',7,18,1,1); F('#3a3f4a',9,19,1,1); F('#3a3f4a',3,19,1,1); F('#3a3f4a',8,18,1,1);   // black Crocs (with the holes)
  let set=ETHAN_SPR; if(chew&&dir!=='up')set={down:ETHAN_SPR.down.map((r,i)=>i===6?'...sSSSs...':i===7?'.TTTRMRTTT.':r)};   // chewing: mouth drops a row
  drawSprite(ctx,X,Y-1,set,ETHAN_PAL,dir==='up'?'up':'down',4,4);
}
PORTRAITS['Ethan']={size:32, bg:'#d9dde3', draw(g){ const F=px(g);
  F('#8a8f9a',4,24,24,8); F('#ffffff',13,24,6,2); F('#eab896',13,20,6,4);
  F('#eab896',9,6,14,14); F('#eab896',10,20,12,1); F('#d9a37f',11,20,10,2); F('#eab896',12,21,8,1); F('#6b4428',9,4,14,5); F('#8a5a38',12,4,6,1); F('#6b4428',8,7,2,6); F('#6b4428',22,7,2,6);
  F('#1d1d22',9,11,6,5); F('#1d1d22',17,11,6,5); F('#1d1d22',15,12,2,1); F('#cfe6f2',10,12,4,3); F('#cfe6f2',18,12,4,3); F('#3b2a1e',11,13,2,2); F('#3b2a1e',19,13,2,2);
  F('#d9a37f',15,16,2,2); F('#b5654f',13,19,6,1);
}};
// ---------- Maureen (Joe's mom): tall and thin, soft light-brown waves, a very precise (and very sweet) baker ----------
// Maureen: Joe's mom. Tall and thin, soft light-brown waves to her shoulders with a side part, a quilted sage puffer vest over a purple
// V-neck with a gold pendant, jeans, ankle boots, a warm smile. 11 x 24 px.
const MAUREEN_PAL={H:'#ab7f57',c:'#c9a07a',h:'#8a6240',S:'#f2cfb0',s:'#e0b896',E:'#4a6a8a',B:'#8f6a48',r:'#eaa3a0',M:'#c06a60',P:'#7b4fb8',p:'#62399a',Y:'#e8c04a',
  V:'#5f8a72',v:'#4a705b',q:'#7aa58c',J:'#3a5f9e',j:'#2c4a7c'};
const MAUREEN_SPR={
  down:["...hHHHh...","..hHHcHHHh.",".hHHHHHSHHh",".hHSBSBSHHh",".hHSESESHh.",".hHrSSSrHh.",".hHSMMMSHh.","..hHsSsHHh.",
        ".hHVPSPVHh.",".PhVPYPVhP.",".PqqqPqqqP.",".PVVVPVVVP.",".pqqqPqqqp.",".SVVvPvVVS.","..vVVPVVv..","..JJJJJJJ..","..JJJjJJJ.."],
  up:  ["...hHHHh...","..hHHcHHHh.",".hHHHcHHHHh",".hHHcHHHHHh",".hHHcHHHHHh",".hHHHcHHHHh",".hHHHcHHHh.","..hHHHHHHh.",
        ".hHVVVVVHh.",".PhVVVVVhP.",".PqqqqqqqP.",".PVVVVVVVP.",".pqqqqqqqp.",".SVVVvVVVS.","..vVVVVVv..","..JJJJJJJ..","..JJJjJJJ.."],
};
function drawMaureen(x,y,dir='down',chew=0){
  const X=Math.round(x)-5, Y=Math.round(y)-23, F=(c,dx,dy,w,h)=>{ctx.fillStyle=c;ctx.fillRect(X+dx,Y+dy,w,h)};
  F('rgba(0,0,0,.22)',1,22,9,2);
  F('#3a5f9e',3,16,2,6); F('#3a5f9e',6,16,2,6); F('#2c4a7c',4,16,1,6); F('#2c4a7c',7,16,1,6); F('#4d74b4',3,17,1,2); F('#4d74b4',6,17,1,2);   // jeans
  F('#6b4428',2,20,3,3); F('#6b4428',6,20,3,3); F('#8a5a38',2,20,2,1); F('#8a5a38',6,20,2,1);   // ankle boots
  let set=MAUREEN_SPR; if(chew&&dir!=='up')set={down:MAUREEN_SPR.down.map((r,i)=>i===6?'.hHSSMSSHh.':r)};
  drawSprite(ctx,X,Y-1,set,MAUREEN_PAL,dir==='up'?'up':'down',4,5);
}
PORTRAITS['Maureen']={size:32, bg:'#e6eee8', draw(g){ const F=px(g);
  F('#ab7f57',7,4,18,21); F('#ab7f57',9,2,14,3); F('#ab7f57',6,7,20,15);                                    // soft waves down to her shoulders
  for(const [y,o] of [[9,0],[12,1],[15,0],[18,1],[21,0]]){F('#ab7f57',5-o,y,2,3); F('#ab7f57',25+o,y,2,3); F('#8a6240',5-o,y+2,1,1); F('#8a6240',26+o,y+2,1,1)}   // a wavy outline
  F('#ab7f57',4,23,5,3); F('#ab7f57',23,23,5,3); F('#8a6240',4,25,3,1); F('#8a6240',25,25,3,1);                // the ends flip out at the shoulders
  for(const [x,y] of [[7,10],[8,12],[7,14],[8,16],[7,18],[24,10],[23,12],[24,14],[23,16],[24,18]])F('#c9a07a',x,y,1,2);   // soft S-shaped highlights
  F('#5f8a72',3,26,26,6); F('#7aa58c',3,28,9,1); F('#7aa58c',20,28,9,1); F('#7aa58c',3,31,9,1); F('#7aa58c',20,31,9,1);   // the puffer vest, quilted
  F('#7b4fb8',12,26,8,6); F('#f2cfb0',14,24,4,4); F('#f2cfb0',15,28,2,1); F('#e8c04a',15,29,2,2);                 // purple V-neck, gold pendant
  F('#f2cfb0',10,7,12,12); F('#f2cfb0',11,19,10,2); F('#f2cfb0',13,21,6,1); F('#e3b898',14,22,4,2);   // face, a soft chin
  F('#ab7f57',9,5,9,4); F('#ab7f57',9,8,4,2); F('#c9a07a',11,5,5,1); F('#8a6240',18,5,1,3);   // side-swept bangs + shine
  F('#6b5038',11,11,4,1); F('#6b5038',18,11,4,1);                                                              // brows
  F('#ffffff',12,13,3,2); F('#ffffff',18,13,3,2); F('#4a6a8a',13,13,2,2); F('#4a6a8a',19,13,2,2); F('#2b2236',13,13,1,1); F('#2b2236',19,13,1,1);
  F('#eaa3a0',11,16,2,1); F('#eaa3a0',20,16,2,1); F('#e3b898',15,15,2,2);
  F('#c06a60',14,18,4,1); F('#c06a60',13,17,1,1); F('#c06a60',18,17,1,1);                                     // a closed, warm smile
  F('#e8c04a',9,17,1,2); F('#e8c04a',22,17,1,2);                                                               // little gold earrings
}};

// ---------- Logan: short, medium brown hair, in his rollerski gear, "taking a break from his workout" to look for four-leaf clovers ----------
const LOGAN={x:36, y:122};   // his own quiet corner, left of the farm path
const LOGAN_KIT={suit:'#1f3a73', suitD:'#152a55', stripe:'#ffffff', helmet:'#f6f6f2', helmetD:'#c9ced4', vent:'#1f3a73', hair:'#7a5232', skin:'#f0c6a0'};   // Middlebury navy and white
// pose 'search': in the clover patch, bent over his magnifying glass (on the map). 'sit': on the grass. Otherwise standing (at the party, at the Birkie finish).
function drawLogan(x,y,pose){
  const F=(c,dx,dy,w,h)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x)-5+dx,Math.round(y)-16+dy,w,h)}, K=LOGAN_KIT;
  if(pose==='search'){   // standing on his rollerskis in the clover patch, bent over a big magnifying glass (facing left)
    const sway=Math.round(Math.sin(time/900)), G='#d9a92e', g2='#f4d35e', lx=-8+sway, ly=9;
    F('rgba(0,0,0,.2)',-3,15,15,2);
    F(K.suitD,8,8,2,6); F(K.suit,6,8,2,6); F(K.stripe,6,8,1,6); F('#2b2b33',5,14,4,1); F('#2b2b33',8,14,3,1);   // legs, race shoes
    F(K.suit,3,3,7,6); F(K.suit,2,4,2,4); F(K.suitD,3,8,7,1); F(K.stripe,3,5,7,1); F(K.suitD,9,3,1,5);         // bent over at the hips
    F(K.skin,-1,0,5,5); F('#e3b08c',3,3,1,2); F(K.hair,3,0,1,3); F('#2b2b2b',0,2,1,1); F('#b5654f',0,4,2,1);       // head, peering down
    F(K.helmet,0,-3,4,1); F(K.helmet,-1,-2,6,1); F(K.helmet,-2,-1,7,1); F(K.vent,1,-2,1,1); F(K.vent,3,-2,1,1); F(K.helmetD,-2,0,2,1);   // vented helmet
    F('#1d1d22',1,-1,3,1); F('#7fb0ff',1,-1,1,1);                                                                 // sunglasses up on the helmet
    F(K.suit,1,4,2,3); F(K.suit,0,6,2,2); F(K.skin,-1,8,2,2);                                                     // arm reaching down
    F('#8a5a34',lx+7,ly+3,3,1); F('#6a4224',lx+7,ly+4,3,1);                                                       // the handle
    F('rgba(220,240,255,.55)',lx+1,ly+2,5,3); F('rgba(220,240,255,.55)',lx+2,ly+1,3,5);                           // the lens...
    F('#3f9a46',lx+2,ly+2,2,2); F('#3f9a46',lx+4,ly+2,1,2); F('#3f9a46',lx+2,ly+4,2,1); F('#3f9a46',lx+4,ly+4,1,1); F('#a8ecb0',lx+2,ly+2,1,1);   // ...with the clover big inside it
    for(const [a,c,w,h] of [[2,0,3,1],[2,6,3,1],[0,2,1,3],[6,2,1,3],[1,1,1,1],[5,1,1,1],[1,5,1,1],[5,5,1,1]])F(G,lx+a,ly+c,w,h);   // the gold rim
    F(g2,lx+2,ly,2,1); F('#ffffff',lx+4,ly+2,1,1);                                                               // shine
    return }
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
// his rollerskis and poles, set down in the grass in front of him (drawn flat on the ground, no outline)
function drawLoganGear(){
  const F=(c,x,y,w,h)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h)}, x0=LOGAN.x-14, y0=LOGAN.y+12;
  for(const dy of [0,4]){ const y=y0+dy;                                                   // two rollerskis side by side
    F('rgba(0,0,0,.18)',x0,y+2,16,1);                                                      // a soft shadow on the grass
    F('#b9c1cb',x0+2,y,12,1); F('#7d8694',x0+2,y+1,12,1);                                  // the aluminum shaft
    F('#1d1d22',x0,y,3,2); F('#1d1d22',x0+13,y,3,2); F('#8a8f9a',x0+1,y,1,1); F('#8a8f9a',x0+14,y,1,1);   // a wheel at each end
    F('#c8322b',x0+6,y-1,4,1); F('#e85a50',x0+6,y-1,1,1) }                                 // the red binding
  F('#3b3b44',x0-1,y0+9,19,1); F('#3b3b44',x0,y0+11,19,1);                                 // the poles, lying next to them
  F('#c8322b',x0-2,y0+9,2,1); F('#c8322b',x0-1,y0+11,2,1); F('#9aa3b0',x0+16,y0+8,1,3); F('#9aa3b0',x0+17,y0+10,1,3);   // grips and baskets
}
// his spot: a few clearly drawn clovers, and butterflies that stay right here
function drawLoganSpot(){
  const F=(c,x,y,w,h)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h)}, x0=LOGAN.x, y0=LOGAN.y;
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
  if(have.gear&&'clover' in have.gear) return showDialog({place:T.place,speaker:'Logan',pages:[T.after[Math.floor(Math.random()*T.after.length)]],actions:have.baked?[{label:REPLAY.logan,fn:()=>{closeDialog(); openCloverHunt()}},CLOSE]:[CLOSE]});
  showDialog({place:T.place,speaker:'Logan',pages:T.hello,actions:[{label:T.help,fn:()=>{ closeDialog(); openCloverHunt() }},{label:T.later,ghost:true,fn:closeDialog}]});
}
const logan={searchT:0};
// Logan's game: each clover he checks, a Gracie Abrams song comes on. Name the album. 8 right in a row and you find the four-leaf.
const HUNT={STREAK:8};
const hunt={open:false, n:0, song:null, deck:[], lock:false};
function drawHuntClover(g,leaves){
  const F=(c,x,y,w=1,h=1)=>{g.fillStyle=c;g.fillRect(x,y,w,h)}; g.clearRect(0,0,14,14);
  const leaf=(a,b)=>{F('#2e7d32',3+a,2+b,3,3); F('#5fbf5f',3+a,2+b,2,2); F('#a8ecb0',3+a,2+b,1,1)};
  F('#2e7d32',6,7,1,5); F('#2e7d32',7,11,1,1);
  if(leaves===4){leaf(0,0); leaf(4,0); leaf(0,4); leaf(4,4)} else {leaf(0,1); leaf(4,1); leaf(2,-2)}
}
function huntDeal(){
  const T=LOGAN_TEXT; if(!hunt.deck.length)hunt.deck=[...T.songs].sort(()=>Math.random()-.5);
  hunt.song=hunt.deck.pop(); $('huntSong').textContent=hunt.song[0];
  const c=$('huntClover').getContext('2d'); drawHuntClover(c,3);
  $('huntStreak').textContent=T.streak.replace('{n}',hunt.n);
  $('huntDots').replaceChildren(...Array.from({length:HUNT.STREAK},(_,k)=>{const d=document.createElement('i'); if(k<hunt.n)d.className='on'; return d}));
}
function openCloverHunt(){
  const T=LOGAN_TEXT; Object.assign(hunt,{open:true,n:0,deck:[],lock:false});
  $('cloverTitle').textContent=T.huntTitle; $('cloverMsg').textContent=T.huntIntro; $('cloverLater').textContent=T.huntLater;
  const face=$('cloverFace').getContext('2d'); face.clearRect(0,0,32,32); face.fillStyle=PORTRAITS.Logan.bg; face.fillRect(0,0,32,32); PORTRAITS.Logan.draw(face);
  const field=$('cloverField'); field.innerHTML='<div class="hcard"><canvas id="huntClover" width="14" height="14" aria-hidden="true"></canvas><span class="hnote">♪</span><b id="huntSong"></b></div><div class="hdots" id="huntDots" aria-hidden="true"></div><small id="huntStreak"></small><div class="habums"></div>';
  T.albums.forEach((a,k)=>{const b=document.createElement('button'); b.type='button'; b.className='btn halbum'; b.textContent=a; b.onclick=()=>huntPick(k); field.querySelector('.habums').append(b)});
  huntDeal(); paused=true; prompt.hidden=true; $('cloverHunt').hidden=false; sfx('blip'); setTimeout(()=>field.querySelector('.halbum').focus({preventScroll:true}),0);
}
function huntPick(k){
  const T=LOGAN_TEXT; if(!hunt.open||hunt.lock)return;
  if(k===hunt.song[1]){ hunt.n++; sfx('type',500+hunt.n*60); $('cloverMsg').textContent=T.huntRight[Math.floor(Math.random()*T.huntRight.length)];
    if(hunt.n>=HUNT.STREAK){ const again=have.gear&&'clover' in have.gear; closeCloverHunt(); have.gear=have.gear||{}; have.gear.clover=1; save(); sfx('reward');
      if(again)return showDialog({place:T.place,speaker:'Logan',pages:[T.foundAgain],actions:[CLOSE]});
      return showDialog({place:T.place,speaker:'Logan',pages:T.found,actions:[{label:'OK',fn:()=>{closeDialog(); showItem('clover')}}]}) } }
  else { hunt.n=0; sfx('bad'); $('cloverMsg').textContent=T.huntWrong[Math.floor(Math.random()*T.huntWrong.length)]; const c=$('cloverField').querySelector('.hcard'); c.classList.remove('nope'); void c.offsetWidth; c.classList.add('nope') }
  hunt.lock=true; setTimeout(()=>{ hunt.lock=false; if(hunt.open)huntDeal() },350);
}
function closeCloverHunt(){ hunt.open=false; $('cloverHunt').hidden=true; paused=overlayOpen() }
$('cloverLater').onclick=closeCloverHunt;
addEventListener('keydown',e=>{ if(!hunt.open)return;
  if(e.code==='Escape'){e.preventDefault(); closeCloverHunt(); return}
  if(['ArrowLeft','KeyA','Digit1'].includes(e.code)){e.preventDefault(); e.stopImmediatePropagation(); $('cloverField').querySelectorAll('.halbum')[0].focus({preventScroll:true}); if(e.code==='Digit1')huntPick(0)}
  if(['ArrowRight','KeyD','Digit2'].includes(e.code)){e.preventDefault(); e.stopImmediatePropagation(); $('cloverField').querySelectorAll('.halbum')[1].focus({preventScroll:true}); if(e.code==='Digit2')huntPick(1)}
},true);
triggers.push({z:R(LOGAN.x-30,LOGAN.y-10,40,18), label:'Talk to Logan', btn:'Talk', act:talkLogan});

// ---------- two football Vikings jogging laps on the main road (you can talk to them; they don't stop) ----------
const JOG={EVERY:22000, ON:.6, Y:157};
function joggerX(k){ const vt=(time%JOG.EVERY)/JOG.EVERY; return vt<JOG.ON?-20+vt/JOG.ON*(WW+40)-k*12:null }
function roadWalkers(list){
  for(let k=0;k<2;k++){const x=joggerX(k); if(x==null)continue; const vy=JOG.Y-1+Math.abs(Math.sin(time/110+k))*-2;
    list.push({y:JOG.Y,draw:()=>drawVikingStanding(x,vy,'football',k?'21':'52')})}
}
let jogLine=0;
function joggerTrigger(){
  for(let k=0;k<2;k++){const x=joggerX(k); if(x!=null&&Math.abs(P.x-x)<14&&Math.abs(P.y-JOG.Y)<14)
    return {label:'Talk to the Vikings', btn:'Talk', act:()=>{const n=jogLine++%ROAD_VIKINGS.lines.length; showDialog({speaker:ROAD_VIKINGS.name,face:'Football Viking',pages:[ROAD_VIKINGS.lines[n]],actions:[CLOSE]})}}}
  return null;
}
{const dt=SCENES.world.dynTrigger; SCENES.world.dynTrigger=()=>dt()||joggerTrigger()}

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

// every frame (from game.js), even while paused. Logan's search only counts down while Joe is still on the map.
function peopleTick(dt){
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
  list.push({y:LOGAN.y-12,draw:drawLoganGear,flat:true},{y:LOGAN.y-12,draw:drawLoganSpot},{y:LOGAN.y+6,draw:()=>drawLogan(LOGAN.x-1,LOGAN.y+7,'search')});
  roadWalkers(list) }}
