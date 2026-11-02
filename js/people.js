// Extra people: Jackie (Fargo, after you get kicked out of the shop), Logan (the clover field on the farm),
// the Vikings and Lil Q passing by on the main road, and Alex's "where to next?" hints when you stand still.
// Their lines are in story.js (JACKIE, LOGAN, HINTS).

// ---------- Jackie: short, short brown hair, very direct ----------
function drawJackie(x,y,dir='down'){
  const F=(c,dx,dy,w,h)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x)-5+dx,Math.round(y)-16+dy,w,h)};
  const skin='#f0c6a0', hair='#6b4428', hairD='#4f301b', top='#2b2b33', jean='#3a5f9e';
  F('rgba(0,0,0,.25)',1,15,9,2);
  F(jean,3,11,2,4); F(jean,6,11,2,4); F('#f2f2ee',2,15,3,1); F('#f2f2ee',6,15,3,1);
  F(top,2,6,7,5); F(top,1,7,1,3); F(top,9,7,1,3); F(skin,2,8,7,2); F('#e3b08c',2,9,7,1);   // arms crossed. obviously
  F(skin,3,1,5,5);
  F(hair,2,0,7,2); F(hairD,2,2,1,2);
  if(dir==='up'){F(hair,2,0,7,5)} else {F(hair,8,1,1,2); F(hair,3,2,3,1); F('#2b2b2b',4,3,1,1); F('#2b2b2b',6,3,1,1); F('#3b2a1e',6,2,1,1); F('#b5654f',4,5,3,1)}   // side-swept fringe, one eyebrow up, flat mouth
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
function drawEthan(x,y,dir='down',chew=0){
  const F=(c,dx,dy,w,h)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x)-6+dx,Math.round(y)-19+dy,w,h)};
  const skin='#eab896', hair='#6b4428', hairL='#8a5a38';
  F('rgba(0,0,0,.25)',1,18,11,2);
  F('#1d1d22',2,17,4,2); F('#1d1d22',7,17,4,2); F('#3a3f4a',3,17,1,1); F('#3a3f4a',8,17,1,1); F('#3a3f4a',5,18,1,1); F('#3a3f4a',10,18,1,1);   // black Crocs (with the holes)
  F(skin,3,14,3,3); F(skin,7,14,3,3);
  F('#1d1d22',2,11,9,4); F('#2b2b33',6,11,1,4);                                         // black shorts
  F('#8a8f9a',1,5,11,7); F('#9aa0ab',1,5,11,1); F('#ffffff',5,5,3,1); F('#ffffff',1,9,1,3); F('#ffffff',11,9,1,3); F('#6f7480',1,11,11,1);   // grey tee, white trim
  F(skin,0,6,1,5); F(skin,12,6,1,5);
  F(skin,3,0,7,6); F(skin,4,5,5,1);                                                    // a broad face
  F(hair,3,-1,7,2); F(hairL,4,-1,3,1); F(hair,2,0,1,3); F(hair,10,0,1,3);
  if(dir==='up'){F(hair,3,-1,7,5); return}
  F('#1d1d22',3,2,3,2); F('#1d1d22',7,2,3,2); F('#1d1d22',6,2,1,1); F('#9fd2f0',4,2,1,1); F('#9fd2f0',8,2,1,1);   // glasses
  F('#b5654f',5,4+(chew?1:0),3,1);
}
PORTRAITS['Ethan']={size:32, bg:'#d9dde3', draw(g){ const F=px(g);
  F('#8a8f9a',3,24,26,8); F('#ffffff',13,24,6,2); F('#eab896',12,20,8,4);
  F('#eab896',8,6,16,16); F('#d9a37f',8,18,16,4); F('#6b4428',8,4,16,5); F('#8a5a38',11,4,7,1); F('#6b4428',7,7,2,6); F('#6b4428',23,7,2,6);
  F('#1d1d22',9,11,6,5); F('#1d1d22',17,11,6,5); F('#1d1d22',15,12,2,1); F('#cfe6f2',10,12,4,3); F('#cfe6f2',18,12,4,3); F('#3b2a1e',11,13,2,2); F('#3b2a1e',19,13,2,2);
  F('#d9a37f',15,16,2,2); F('#b5654f',13,19,6,1);
}};
// ---------- Maureen (Joe's mom): tall and thin, curly light-brown hair, a very precise (and very sweet) baker ----------
function drawMaureen(x,y,dir='down',chew=0){
  const F=(c,dx,dy,w,h)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x)-5+dx,Math.round(y)-23+dy,w,h)};
  const skin='#f2cfb0', hair='#b08560', hairL='#c9a07a', hairD='#8f6a48';
  F('rgba(0,0,0,.22)',1,22,9,2);
  F('#5a6070',3,15,2,7); F('#5a6070',6,15,2,7); F('#8a5a3a',2,21,3,2); F('#8a5a3a',6,21,3,2);   // slim trousers, flats
  F('#9b8ac4',2,7,7,9); F('#b8aadb',2,7,7,1); F('#ffffff',4,7,3,3); F('#7a6aa8',2,15,7,1);    // lavender cardigan over a white blouse
  F('#f6efe2',3,10,5,5); F('#e8dcc6',3,14,5,1);                                                 // an apron
  F(skin,1,8,1,6); F(skin,9,8,1,6);
  F(skin,3,1,5,6); F(skin,4,6,3,1);
  for(const [hx,hy] of [[2,0],[4,-1],[6,-1],[8,0],[1,2],[9,2],[1,4],[9,4],[2,6],[8,6]]){F(hair,hx,hy,2,2); F(hairL,hx,hy,1,1)}   // curls
  F(hairD,3,0,5,1);
  if(dir==='up'){F(hair,3,0,5,5); return}
  F('#4a6a8a',4,3,1,1); F('#4a6a8a',6,3,1,1); F('#e8a0a0',3,4,1,1); F('#e8a0a0',7,4,1,1); F('#c06a60',4,5+(chew?1:0),3,1);   // a warm smile
}
PORTRAITS['Maureen']={size:32, bg:'#ece4f4', draw(g){ const F=px(g);
  F('#9b8ac4',4,25,24,7); F('#ffffff',12,25,8,4); F('#f2cfb0',13,21,6,4);
  F('#f2cfb0',10,7,12,15); F('#e3b898',10,19,12,3);
  for(const [x,y] of [[8,3],[11,1],[15,0],[19,1],[22,3],[7,7],[23,7],[6,11],[24,11],[7,15],[23,15],[8,19],[22,19]]){F('#b08560',x,y,4,4); F('#c9a07a',x,y,2,2)}
  F('#ffffff',12,12,3,2); F('#ffffff',18,12,3,2); F('#4a6a8a',13,12,2,2); F('#4a6a8a',19,12,2,2); F('#e8a0a0',11,16,2,1); F('#e8a0a0',20,16,2,1);
  F('#e3b898',15,15,2,2); F('#c06a60',13,18,6,1); F('#c06a60',12,17,1,1); F('#c06a60',19,17,1,1);
}};

// ---------- Logan: short, medium brown hair, looking for four-leaf clovers ----------
const LOGAN={x:34, y:122};
function drawLogan(x,y,lookUp=false){
  const F=(c,dx,dy,w,h)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x)-5+dx,Math.round(y)-16+dy,w,h)};
  const skin='#f0c6a0', hair='#7a5232', hairL='#8f6440', top='#4f9a50', pants='#6b5a44';
  const crouch=lookUp?0:2;   // bent over, staring at the grass
  F('rgba(0,0,0,.25)',1,15,10,2);
  F(pants,3,11+crouch,2,4-crouch); F(pants,6,11+crouch,2,4-crouch); F('#3b2a1e',2,15,3,1); F('#3b2a1e',6,15,3,1);
  F(top,2,6+crouch,7,5); F(top,1,7+crouch,1,3); F(top,9,7+crouch,1,3); F(skin,1,10+crouch,1,1); F(skin,9,10+crouch,1,2);
  F(skin,3,1+crouch,5,5);
  F(hair,2,crouch,7,2); F(hair,2,2+crouch,1,3); F(hair,8,2+crouch,1,3); F(hairL,4,crouch,3,1); F(hair,3,2+crouch,2,1);   // medium, a bit shaggy
  if(lookUp){F('#2b2b2b',4,3,1,1); F('#2b2b2b',6,3,1,1); F('#b5654f',4,5,3,1)} else F('#2b2b2b',4,4+crouch,3,1);   // eyes down
  if(!lookUp){F('#c9a24a',10,10+crouch,2,1); F('#c9a24a',11,8+crouch,3,3); F('#e8f4f8',12,9+crouch,1,1)}   // a magnifying glass
}
PORTRAITS['Logan']={size:32, bg:'#d6eec4', draw(g){ const F=px(g);
  F('#4f9a50',6,25,20,7); F('#3f7a45',14,25,4,2); F('#f0c6a0',13,21,6,4);
  F('#f0c6a0',10,7,12,15); F('#e3b08c',10,18,1,3); F('#e3b08c',21,18,1,3);
  F('#7a5232',9,4,14,5); F('#7a5232',8,7,3,8); F('#7a5232',21,7,3,8); F('#8f6440',12,4,6,1); F('#7a5232',11,9,4,1); F('#7a5232',17,9,3,1);   // medium shaggy hair
  F('#ffffff',12,13,3,2); F('#ffffff',17,13,3,2); F('#3d6b8a',13,13,2,2); F('#3d6b8a',18,13,2,2);
  F('#d9a37f',15,16,2,2); F('#b5654f',13,19,6,1); F('#b5654f',19,18,1,1);
  F('#3d8443',24,2,3,3); F('#3d8443',27,2,3,3); F('#3d8443',24,5,3,3); F('#3d8443',27,5,3,3); F('#2f6b36',26,7,1,4);   // a four-leaf clover
}};
// the clover patch (painted onto the map once)
{const g=bg.getContext('2d'); for(let i=0;i<34;i++){const a=rnd()*Math.PI*2, r=Math.sqrt(rnd())*11, x=LOGAN.x+Math.cos(a)*r*1.4|0, y=LOGAN.y+1+Math.sin(a)*r*.6|0;
  g.fillStyle=i%3?'#3f8f45':'#5aa85a'; g.fillRect(x,y,2,1); g.fillRect(x,y+1,1,1); g.fillRect(x+1,y-1,1,1)}}
function talkLogan(){
  const T=LOGAN_TEXT;
  if(have.gear&&'clover' in have.gear) return showDialog({place:T.place,speaker:'Logan',pages:[T.after[Math.floor(Math.random()*T.after.length)]],actions:[CLOSE]});
  showDialog({place:T.place,speaker:'Logan',pages:T.hello,actions:[{label:T.help,fn:()=>{ closeDialog(); logan.searchT=1800; P.dir='left' }},{label:T.later,ghost:true,fn:closeDialog}]});
}
const logan={searchT:0};
triggers.push({z:R(LOGAN.x-11,LOGAN.y-8,22,14), label:'Talk to Logan', btn:'Talk', act:talkLogan});

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
  if(logan.searchT>0&&scene===SCENES.world){ logan.searchT-=dt; if(logan.searchT<=0&&!paused){ have.gear=have.gear||{}; have.gear.clover=1; save(); sfx('reward');
    showDialog({place:LOGAN_TEXT.place,speaker:'Logan',pages:LOGAN_TEXT.found,actions:[{label:LOGAN_TEXT.wear,fn:closeDialog}]}) } else if(logan.searchT<=0)logan.searchT=1 }
  if(paused&&!$('hint').hidden)hideHint();
  hintTick(dt);
}
// a thought bubble over Joe's head ("..." while he thinks it over)
function drawThink(){
  const think=(scene===SCENES.fargo&&fargo.thinkT>0)||(scene===SCENES.world&&logan.searchT>0); if(!think)return;
  const x=Math.round(P.x)+4, y=Math.round(P.y)-30, F=(c,dx,dy,w,h)=>{ctx.fillStyle=c;ctx.fillRect(x+dx,y+dy,w,h)};
  F('#1d2130',-1,-1,15,9); F('#ffffff',0,0,13,7); F('#1d2130',-3,8,3,3); F('#ffffff',-2,9,1,1); F('#1d2130',-5,12,2,2);
  const n=1+Math.floor(time/300)%3; for(let i=0;i<n;i++)F('#1d2130',2+i*4,3,2,2);
}
{const ents=SCENES.world.ents; SCENES.world.ents=function(list){ ents.call(this,list);
  list.push({y:LOGAN.y,draw:()=>drawLogan(LOGAN.x,LOGAN.y,Math.hypot(P.x-LOGAN.x,P.y-LOGAN.y)<20||Math.floor(time/2600)%4===0)});
  roadWalkers(list) }}
