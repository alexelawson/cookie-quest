// Fargo: drive the CR-V into town and find Lil Q's (the only gas station; cheapest gas in the country). She races you on scooters
// for the gas (scooter.js). Win, and the ENTER sign over her shop starts blinking: walk in with Alex, grab a drink and a snack off the
// shelves and bring them to her (lilqshop.js). Jackie's in there too, and she'll help if you bring her plain pasta from the diner.
const FW=448, FH=336;
const DRIVE = {ROAD:.12, GRASS:.06};   // how fast the CR-V goes on the road / off it (px/ms)
const CHEAPEST = '2.79';
const CAR_COLOR = {body:'#8fa3b8', dark:'#6c7f94', light:'#b9c8d6'};  // steel blue-gray; change to match his CR-V

const ROADS=[R(0,40,FW,24), R(0,168,FW,24), R(0,290,FW,24), R(40,0,24,FH), R(210,0,24,FH), R(380,0,24,FH)];
// stations: lot top-left and which side the road is on ('up' = road above the lot)
const STATIONS=[
  {x:300,y:192,face:'up', brand:'#e08a2a'},   // Lil Q's: the only gas station in town
].map(s=>{
  const lot=R(s.x,s.y,48,28), store=R(s.x+4,s.y+28,40,20), door=R(s.x+16,s.y+20,16,9);   // the shop door, from the lot side
  return {...s, lot, store, door, island:R(s.x+18,s.y+11,12,6), sign:{x:s.x+50,y:s.y+2}, person:{x:s.x+38,y:s.y+20}, price:CHEAPEST, seen:true, name:FARGO.bob, signText:FARGO.bobSign};
});
// two dirt-path shortcuts across the fields (handy in the scooter race): [x1,y1, x2,y2], about 9 px wide. 45-degree diagonals, so the arrow keys can follow them
const SHORTCUTS=[[240,168,136,64],[392,290,350,248],[350,248,350,214]];
const segDist=(x,y,[x1,y1,x2,y2])=>{const dx=x2-x1,dy=y2-y1,t=Math.max(0,Math.min(1,((x-x1)*dx+(y-y1)*dy)/(dx*dx+dy*dy))); return Math.hypot(x-(x1+t*dx),y-(y1+t*dy))};
const onShortcut=(x,y)=>SHORTCUTS.some(sc=>segDist(x,y,sc)<5);
const shortcutBoxes=SHORTCUTS.flatMap(([x1,y1,x2,y2])=>{const n=Math.ceil(Math.hypot(x2-x1,y2-y1)/6); return [...Array(n+1)].map((_,k)=>R(x1+(x2-x1)*k/n-6,y1+(y2-y1)*k/n-6,12,12))});
// the diner (top left): plain pasta for Jackie. A little parking lot, the diner below it.
const DINER={lot:R(90,64,48,28), bld:R(92,92,44,22)};
const HOUSES=[R(70,124,24,20),R(110,132,26,20),R(244,74,26,20),
  R(70,200,24,20),R(70,240,24,20),R(184,250,22,20),R(244,200,26,20),R(244,250,26,20),
  R(8,86,24,18),R(412,80,28,20),R(412,210,28,20),R(260,10,26,20),R(412,250,28,20)];
const TOWER={x:186,y:142};
// landmarks: the Fargo Theatre on Broadway (the top road), the Fargodome, and an NDSU Bison statue
const THEATRE=R(80,6,46,32), DOME=R(240,104,58,46), BISON=R(300,138,22,14);
const LANDMARKS=[THEATRE,DOME,BISON];
// locals who know where the cheap gas is: drive up and ask (each one gives a clue)
const WELCOME=R(12,196,24,12);
// green EXIT signs pointing back to the highway (the way out is the left end of the middle road)
const EXIT_SIGNS=[{x:346,y:146,dir:'<'},{x:66,y:68,dir:'v'},{x:66,y:266,dir:'^'}];

const fargo={bob:0, introPending:false, pending:null, won:false, onFoot:false, car:null, alex:null, alexMood:'ok', moodT:0};
const fargoDone=()=>have.fargo&&!fargo.replay;   // (after baking you can race Lil Q again: fargo.replay)
// have.fargoStage remembers progress across reloads: 'race' (met Lil Q), 'store' (won the race: go shopping), 'reward' (Alex has her snacks: see Lil Q)
let fargoTrees=[];
function fargoNewRun(){ fargo.onFoot=false; fargo.car=null; fargo.alex=null; fargo.alexMood='ok' }

// (the tiny pixel font, GLYPH and pixText, lives in world.js)

// ---------- the town, painted once ----------
const fargoBg=document.createElement('canvas'); fargoBg.width=FW; fargoBg.height=FH;
(function(){
  const g=fargoBg.getContext('2d'), F=(c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};
  // summer on the plains: dry grass, flat as a table
  F('#cdb978',0,0,FW,FH); for(let i=0;i<1100;i++)F(['#bfa865','#d9c98e','#a9a35a','#c4ad6c'][i%4],rnd()*FW|0,rnd()*FH|0,2,1);
  for(const r of ROADS){F('#9a9690',r.x,r.y,r.w,r.h); for(let i=0;i<r.w*r.h/25;i++)F(rnd()<.5?'#8b8780':'#a9a59e',r.x+rnd()*r.w|0,r.y+rnd()*r.h|0,1,1)}
  for(const r of ROADS){   // dusty shoulders + a faded center line
    if(r.w>r.h){F('#b09a68',r.x,r.y,r.w,1);F('#b09a68',r.x,r.y+r.h-1,r.w,1); for(let x=r.x;x<r.x+r.w;x+=10)F('#e2c75a',x,r.y+(r.h>>1),5,1)}
    else{F('#b09a68',r.x,r.y,1,r.h);F('#b09a68',r.x+r.w-1,r.y,1,r.h); for(let y=r.y;y<r.y+r.h;y+=10)F('#e2c75a',r.x+(r.w>>1),y,1,5)}
  }
  for(const r of ROADS)for(let i=0;i<(r.w*r.h)/600;i++){const x=r.x+3+rnd()*(r.w-8)|0, y=r.y+3+rnd()*(r.h-8)|0;   // tar-sealed cracks + patches
    if(rnd()<.6){F('#6f6c67',x,y,1,1);F('#6f6c67',x+1,y+1,1,1);F('#6f6c67',x+2,y+1,1,1);F('#6f6c67',x+3,y+2,1,1)} else F('#8c8882',x,y,5,3)}
  for(const v of ROADS.filter(r=>r.h>r.w))for(const h of ROADS.filter(r=>r.w>r.h)){   // crosswalks at every intersection
    F('#9a9690',v.x+1,h.y+1,v.w-2,h.h-2);
    for(let x=v.x+2;x<v.x+v.w-2;x+=3){F('#e9e6dc',x,h.y-4,2,3);F('#e9e6dc',x,h.y+h.h+1,2,3)}
    for(let y=h.y+2;y<h.y+h.h-2;y+=3){if(v.x>4)F('#e9e6dc',v.x-4,y,3,2);F('#e9e6dc',v.x+v.w+1,y,3,2)}}
  for(let i=0;i<500;i++){const x=rnd()*FW|0,y=rnd()*FH|0; if(ROADS.some(r=>x>=r.x-2&&x<=r.x+r.w+2&&y>=r.y-2&&y<=r.y+r.h+2))continue;   // grass tufts
    F('#a9a35a',x,y,1,2); F('#8f9a4a',x+1,y-1,1,3); F('#a9a35a',x+2,y,1,2)}
  for(const s of STATIONS){
    F('#b4b2ad',s.lot.x,s.lot.y,s.lot.w,s.lot.h); for(let x=s.lot.x+4;x<s.lot.x+44;x+=8)F('#a3a19c',x,s.lot.y+4,1,20);
    F('#d6d3cc',s.lot.x,s.lot.y,s.lot.w,1); F('#d6d3cc',s.lot.x,s.lot.y+s.lot.h-1,s.lot.w,1);   // curbs
    for(let i=0;i<3;i++)F('#9a9893',s.lot.x+6+rnd()*36|0,s.lot.y+5+rnd()*16|0,3,2);              // oil spots
    const st=s.store; F('#d9d4c8',st.x,st.y,st.w,st.h); F(s.brand,st.x,st.y,st.w,4); F('#9fd2f0',st.x+4,st.y+8,10,7); F('#9fd2f0',st.x+26,st.y+8,10,7);
    F('#c4bfb2',st.x,st.y+4,st.w,1); F('#bdb7aa',st.x,st.y+st.h-1,st.w,1); F('#e6e2d8',st.x,st.y+4,1,st.h-4);
    F('#ffffff',st.x+4,st.y+8,10,1); F('#ffffff',st.x+26,st.y+8,10,1); F('#7fb8dc',st.x+4,st.y+14,10,1); F('#7fb8dc',st.x+26,st.y+14,10,1);
    F('#f4d35e',st.x+6,st.y+10,3,3); F('#e54b4b',st.x+29,st.y+10,4,3); F('#3d8ad6',st.x+10,st.y+11,2,2);   // posters in the windows
    F('#e9eef3',st.x+st.w-3,st.y+6,4,6); F('#3d8ad6',st.x+st.w-3,st.y+7,4,1);               // ice chest
    F('#6b6f7a',st.x+16,s.face==='up'?st.y+2:st.y+st.h-12,8,12); F('#ffd98a',st.x+22,s.face==='up'?st.y+8:st.y+st.h-6,1,2); F('#c9c4b8',st.x,st.y-2,st.w,2);
    F('#a9aeb8',s.island.x-1,s.island.y+s.island.h,s.island.w+2,1); F('#8a8f9a',s.island.x,s.island.y,s.island.w,s.island.h); F('#a9aeb8',s.island.x,s.island.y,s.island.w,1); F(s.brand,s.island.x+2,s.island.y-3,3,6); F(s.brand,s.island.x+7,s.island.y-3,3,6);
    F('#8a8f9a',s.sign.x+8,s.sign.y+9,2,14);   // sign pole
  }
  for(const h of HOUSES){
    const wall=['#b5654f','#e8dcc2','#7fa0b8','#c9a06a','#9fb38a','#f0ece2'][(h.x*7+h.y)%6], roof=['#5f564e','#4a5a6a','#6b4a3a'][(h.x+h.y)%3];
    F('rgba(60,50,30,.25)',h.x+1,h.y+h.h,h.w,2);                                                    // shadow
    F(wall,h.x,h.y+6,h.w,h.h-6); for(let y=h.y+9;y<h.y+h.h;y+=2)F('rgba(0,0,0,.07)',h.x,y,h.w,1);   // lap siding
    F(roof,h.x-1,h.y,h.w+2,8); for(let y=h.y+1;y<h.y+6;y+=2)for(let x=h.x-1+(y%4?0:2);x<h.x+h.w;x+=4)F('rgba(0,0,0,.18)',x,y,1,1);   // shingles
    F('#4a433c',h.x-1,h.y+6,h.w+2,2); F('rgba(255,255,255,.18)',h.x,h.y,h.w,1);
    F('#8a5a44',h.x+h.w-6,h.y-3,3,5); F('#6b4434',h.x+h.w-6,h.y-3,3,1);                             // chimney
    for(const wx of [h.x+3,h.x+h.w-10]){F('#f6efe2',wx,h.y+10,7,6); F('#ffd98a',wx+1,h.y+11,5,4); F('#f6efe2',wx+3,h.y+11,1,4); F('#5a6a4a',wx-1,h.y+10,1,6); F('#5a6a4a',wx+7,h.y+10,1,6)}
    F('#f6efe2',h.x+h.w/2-3|0,h.y+h.h-8,7,8); F('#5a3a22',h.x+h.w/2-2|0,h.y+h.h-7,5,7); F('#f4d35e',h.x+h.w/2+1|0,h.y+h.h-4,1,1);
    F('#8a8f9a',h.x+h.w/2-4|0,h.y+h.h,9,2);                                                          // front step
    if((h.x+h.y)%2){F('#6b4a2f',h.x-4,h.y+h.h-4,1,5); F('#3d6fb0',h.x-5,h.y+h.h-6,3,2)}              // mailbox
    else for(let x=h.x+1;x<h.x+h.w;x+=5){F('#4f7d3a',x,h.y+h.h-2,3,2); F('#e54b7a',x+1,h.y+h.h-2,1,1)}   // flower bed
  }
  // welcome sign
  F('#8a8f9a',WELCOME.x+3,WELCOME.y+10,2,6); F('#8a8f9a',WELCOME.x+19,WELCOME.y+10,2,6);
  F('#2f5f9e',WELCOME.x,WELCOME.y,24,11); F('#ffffff',WELCOME.x,WELCOME.y,24,1); pixText(g,'FARGO',WELCOME.x+3,WELCOME.y+3,'#ffffff');
})();
// white arrows painted on the road, pointing out of town (the road at the left edge)
(function(){ const g=fargoBg.getContext('2d'), F=(c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};
  for(const ax of [16,90,160]){ const y=183; F('#e9e6df',ax+2,y,10,2); for(let k=0;k<4;k++)F('#e9e6df',ax+k,y+1-k,1,2*k+1>0?1:1), F('#e9e6df',ax+k,y-k+1,1,1), F('#e9e6df',ax+k,y+k,1,1); F('#e9e6df',ax,y,1,2) } })();
// the shortcuts: packed dirt with a worn middle and grassy edges
(function(){ const g=fargoBg.getContext('2d'), F=(c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};
  for(const [x1,y1,x2,y2] of SHORTCUTS){ const n=Math.ceil(Math.hypot(x2-x1,y2-y1));
    for(let k=0;k<=n;k++){const x=x1+(x2-x1)*k/n, y=y1+(y2-y1)*k/n; F('#9a8a5a',x-5|0,y-5|0,10,10)}
    for(let k=0;k<=n;k++){const x=x1+(x2-x1)*k/n, y=y1+(y2-y1)*k/n; F('#b8a070',x-4|0,y-4|0,8,8)}
    for(let k=0;k<=n;k+=2){const x=x1+(x2-x1)*k/n, y=y1+(y2-y1)*k/n; F('#cdb688',x-1|0,y-1|0,2,2); if(rnd()<.3)F('#8a7a4a',x-3+rnd()*6|0,y-3+rnd()*6|0,1,1)} }
})();
// the diner: a cream and teal box with a red stripe, big windows, a DINER sign on the roof
(function(){
  const g=fargoBg.getContext('2d'), F=(c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(x,y,w,h)}, L=DINER.lot, b=DINER.bld;
  F('#b4b2ad',L.x,L.y,L.w,L.h); for(let x=L.x+4;x<L.x+44;x+=8)F('#a3a19c',x,L.y+4,1,20); F('#d6d3cc',L.x,L.y,L.w,1); F('#d6d3cc',L.x,L.y+L.h-1,L.w,1);
  F('rgba(60,50,30,.25)',b.x+1,b.y+b.h,b.w,2);
  F('#f3ead2',b.x,b.y,b.w,b.h); F('#3fa59a',b.x,b.y,b.w,4); F('#c8322b',b.x,b.y+b.h-6,b.w,2); F('#c9ced4',b.x,b.y+b.h-1,b.w,1);
  for(let x=b.x+3;x<b.x+b.w-3;x+=8){F('#9fd2f0',x,b.y+6,6,6); F('#ffffff',x,b.y+6,6,1)}       // windows
  F('#3fa59a',b.x+18,b.y-1,8,7); F('#6b6f7a',b.x+19,b.y,6,6);                                // the door (from the lot side)
  F('#2b2f3a',b.x+8,b.y-9,28,8); F('#3fa59a',b.x+8,b.y-9,28,1); pixText(g,FARGO.diner,b.x+11,b.y-7,'#ff7a8a');   // the roof sign
  F('#8a8f9a',b.x+12,b.y-1,1,1); F('#8a8f9a',b.x+31,b.y-1,1,1);
})();
// the landmarks, painted on the town
(function(){
  const g=fargoBg.getContext('2d'), F=(c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};
  // out back (along the bottom edge): Red River Valley sugar beet rows, a red barn with a white-trimmed door, a silo
  for(const [x0,x1] of [[66,208],[236,378]]){ F('#6b5236',x0,318,x1-x0,18);
    for(let y=320;y<336;y+=4)for(let x=x0+2;x<x1-2;x+=3){F('#3f7d2e',x,y,2,2); F('#5fa843',x,y,1,1); F('#e8dcc2',x+1,y+2,1,1)} }   // beet leaves, a peek of white beet
  {const x=418,y=316; F('#a8322a',x,y+6,28,14); F('#c8443a',x,y+6,28,1); F('#5f564e',x-2,y,32,7); for(let k=0;k<4;k++)F('#4a433c',x-2+k,y+k,32-k*2,1);   // the barn
   F('#ffffff',x+10,y+10,8,10); F('#a8322a',x+11,y+11,6,9); F('#ffffff',x+11,y+11,6,1); F('#ffffff',x+13,y+11,1,9); F('#ffffff',x+11,y+15,6,1);
   F('#d6d3cc',x-10,y-6,8,26); F('#b4b2ad',x-10,y-6,8,2); F('#8a8f9a',x-9,y-8,6,2)}                                        // a silo
  {const x=12,y=318; F('#2f6b3a',x,y+4,22,10); F('#f4d35e',x+2,y+9,4,5); F('#f4d35e',x+15,y+9,5,5); F('#1d1d22',x+3,y+11,3,3); F('#1d1d22',x+16,y+11,4,4); F('#9fd2f0',x+11,y,8,5); F('#2f6b3a',x+10,y-1,10,1)}   // a tractor in the field
  // the Fargo Theatre: art-deco brick front, cream trim, a marquee over the doors (its bulbs and the tall blade sign are drawn live)
  {const t=THEATRE; F('rgba(60,50,30,.25)',t.x+1,t.y+t.h,t.w,2);
   F('#9a3f30',t.x,t.y+4,t.w,t.h-4); for(let y=t.y+6;y<t.y+t.h;y+=3)F('#8a3426',t.x,y,t.w,1);                   // brick
   F('#efe2c0',t.x,t.y+3,t.w,2); F('#efe2c0',t.x+4,t.y,t.w-8,3); for(let x=t.x+6;x<t.x+t.w-6;x+=6)F('#d9c99a',x,t.y,2,3);   // stepped deco parapet
   F('#efe2c0',t.x,t.y+4,2,t.h-4); F('#efe2c0',t.x+t.w-2,t.y+4,2,t.h-4);
   for(let x=t.x+8;x<t.x+t.w-8;x+=8)F('#ffd98a',x,t.y+8,4,6);                                              // lit upstairs windows
   F('#3a2a2a',t.x+10,t.y+t.h-8,t.w-20,8); F('#ffd98a',t.x+12,t.y+t.h-7,8,6); F('#ffd98a',t.x+t.w-20,t.y+t.h-7,8,6);   // glass doors
   F('#8a1f1a',t.x+t.w/2-4,t.y+t.h,8,2)}                                                                     // a red carpet to the sidewalk
  // the Fargodome: a big white dome on a grey base
  {const d=DOME; F('rgba(60,50,30,.25)',d.x+2,d.y+d.h,d.w-2,3);
   F('#b8bcc4',d.x,d.y+30,d.w,16); F('#9aa0aa',d.x,d.y+44,d.w,2); for(let x=d.x+3;x<d.x+d.w-3;x+=6)F('#7f8692',x,d.y+33,3,8);   // base with doors
   for(let y=0;y<30;y++){const k=1-((30-y)/30)**2, w=Math.round(d.w*Math.sqrt(Math.max(0,k))); F(y<6?'#ffffff':'#eef1f5',d.x+(d.w-w)/2|0,d.y+y,w,1)}   // the dome
   for(let x=d.x+8;x<d.x+d.w-6;x+=8)F('#d6dbe3',x,d.y+12,1,18); F('#d6dbe3',d.x+4,d.y+22,d.w-8,1);          // its ribs
   F('#1f5a34',d.x+8,d.y+35,d.w-16,6); pixText(g,'FARGODOME',d.x+11,d.y+36,'#f4d35e')}
  // the Bison statue on a little plinth
  {const b=BISON; F('#8a8f9a',b.x+2,b.y+10,b.w-4,4); F('#b4b8c0',b.x+2,b.y+10,b.w-4,1); pixText(g,'NDSU',b.x+4,b.y+11,'#1f5a34');
   const B='#5a3a22', D='#3e2716', L='#7a5232'; F(B,b.x+5,b.y+3,12,5); F(D,b.x+4,b.y+2,6,6); F(L,b.x+5,b.y+2,4,1); F(D,b.x+3,b.y+5,2,3);   // body, big humped head
   F('#efe2c0',b.x+3,b.y+2,1,1); F('#efe2c0',b.x+7,b.y+1,1,1);                                                  // horns
   F(D,b.x+6,b.y+8,2,2); F(D,b.x+14,b.y+8,2,2); F(B,b.x+17,b.y+4,2,1)}                                          // legs, tail
})();
// pine trees scattered where nothing else is
(function(){
  const blocked=r=>[...ROADS,...HOUSES,...STATIONS.flatMap(s=>[s.lot,s.store,R(s.sign.x-2,s.sign.y-2,22,24)]),R(TOWER.x-18,TOWER.y-40,36,46),...LANDMARKS,DINER.lot,DINER.bld,...shortcutBoxes,R(0,160,40,60),WELCOME,...EXIT_SIGNS.map(s=>R(s.x,s.y,26,18))]
    .some(o=>hit(R(r.x-3,r.y-3,r.w+6,r.h+6),o));
  for(let n=0;n<400&&fargoTrees.length<16;n++){const x=8+rnd()*(FW-16)|0, y=16+rnd()*(FH-20)|0; const box=R(x-6,y-16,12,17);
    if(!blocked(box)&&!fargoTrees.some(([tx,ty])=>Math.abs(tx-x)<12&&Math.abs(ty-y)<14))fargoTrees.push([x,y])}
})();
// wheat and sunflower fields on the open land (painted onto the town background)
(function(){
  const g=fargoBg.getContext('2d'), F=(c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};
  const blocked=r=>[...ROADS,...HOUSES,...STATIONS.flatMap(s=>[s.lot,s.store,R(s.sign.x-2,s.sign.y-2,22,24)]),R(TOWER.x-18,TOWER.y-40,36,46),...LANDMARKS,DINER.lot,DINER.bld,...shortcutBoxes,R(0,160,40,60),WELCOME,...EXIT_SIGNS.map(s=>R(s.x,s.y,26,18)),...fargoTrees.map(([x,y])=>R(x-6,y-16,12,17))]
    .some(o=>hit(R(r.x-4,r.y-4,r.w+8,r.h+8),o));
  let n=0; for(let k=0;k<300&&n<6;k++){const f=R(8+rnd()*(FW-60)|0,12+rnd()*(FH-40)|0,44,26); if(blocked(f))continue; n++;
    for(let x=f.x-2;x<=f.x+f.w+1;x+=6){F('#7a5a3a',x,f.y-3,1,3); F('#7a5a3a',x,f.y+f.h,1,3)} F('#9a7a5a',f.x-2,f.y-2,f.w+4,1); F('#9a7a5a',f.x-2,f.y+f.h+1,f.w+4,1);   // a split-rail fence
    if(n%2){F('#d9b24a',f.x,f.y,f.w,f.h); for(let y=f.y+2;y<f.y+f.h;y+=4){F('#c09634',f.x,y,f.w,1); for(let x=f.x+1;x<f.x+f.w;x+=3)F('#ecd06a',x,y-2,1,2)}}   // wheat
    else {F('#6f8f3a',f.x,f.y,f.w,f.h); for(let y=f.y+2;y<f.y+f.h-1;y+=5)for(let x=f.x+2;x<f.x+f.w-2;x+=4){F('#f4c430',x,y,3,3); F('#6b4a2a',x+1,y+1,1,1)}}   // sunflowers
  }
})();
const pineSprite=document.createElement('canvas'); pineSprite.width=12; pineSprite.height=18;
(function(){const g=pineSprite.getContext('2d'), F=(c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};
  // a summer cottonwood (it used to be a snowy pine; the name stuck)
  F('rgba(60,50,30,.3)',2,16,9,2); F('#5a3a22',5,11,2,7); F('#7a5232',5,11,1,6); F('#4a2e1a',4,17,4,1); F('#4f7d3a',1,3,10,9); F('#5f9444',2,1,8,4); F('#6aa84a',3,2,4,3); F('#3f6b30',2,9,8,2); F('#6aa84a',8,5,2,2);
  F('#3f6b30',0,6,1,4); F('#3f6b30',11,6,1,3); F('#8cc463',4,2,2,1); F('#8cc463',2,5,1,2); F('#355a28',6,8,2,2); F('#355a28',3,10,2,1);})();

// ---------- the CR-V ----------
const carSprites={}, carSpritesEmpty={};
function buildCar(into,withPeople){
  const base=document.createElement('canvas'); base.width=24; base.height=14;
  const g=base.getContext('2d'), F=(c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(x,y,w,h)}, C=CAR_COLOR;
  F('#1d1d22',4,0,5,2); F('#1d1d22',15,0,5,2); F('#1d1d22',4,12,5,2); F('#1d1d22',15,12,5,2);   // tires
  F(C.body,1,2,22,10); F(C.body,0,3,24,8);                                    // boxy body, facing right
  F(C.light,16,3,6,8);                                                        // hood
  F('#2b3a4f',13,3,3,8); F('#2b3a4f',2,3,2,8); F('#2b3a4f',5,2,7,1); F('#2b3a4f',5,11,7,1);  // windshield, rear glass, side windows
  F(C.dark,4,3,9,8); F('#c9d1d8',5,4,7,1); F('#c9d1d8',5,9,7,1);            // roof + roof rails
  F('#fff3c4',23,3,1,2); F('#fff3c4',23,9,1,2); F('#d33b2f',0,3,1,2); F('#d33b2f',0,9,1,2);   // lights
  if(withPeople){   // seen through the glass roof: you driving (top), Alex riding shotgun (bottom)
    F('#4a5a70',7,3,7,8);
    F('#b08355',10,3,3,3); F('#8d6440',10,3,1,3); F('#f0c6a0',13,4,1,1);
    F('#3b2416',10,8,3,3); F('#3b2416',8,8,2,3); F('#4e3020',8,9,1,1); F('#f2c9a5',13,9,1,1);
  }
  const carSprites=into; carSprites.right=base;
  const mk=(w,h,fn)=>{const c=document.createElement('canvas'); c.width=w; c.height=h; const x=c.getContext('2d'); fn(x); return c};
  carSprites.left=mk(24,14,x=>{x.translate(24,0);x.scale(-1,1);x.drawImage(base,0,0)});
  carSprites.down=mk(14,24,x=>{x.translate(14,0);x.rotate(Math.PI/2);x.drawImage(base,0,0)});
  carSprites.up=mk(14,24,x=>{x.translate(0,24);x.rotate(-Math.PI/2);x.drawImage(base,0,0)});
}
buildCar(carSprites,true); buildCar(carSpritesEmpty,false);
function drawCar(x,y,dir=P.dir,parked=false){
  const set=parked?carSpritesEmpty:carSprites, s=set[dir]||set.right, ox=Math.round(x-s.width/2), oy=Math.round(y-s.height/2);
  ctx.fillStyle='rgba(0,0,0,.18)'; ctx.fillRect(ox+1,oy+s.height-2,s.width-2,3);
  ctx.drawImage(s,ox,oy);
}

// ---------- people ----------
// Lil Q (the code still calls her "bob"): biker. Short red hair, shades, black moto tee under a leather vest, jeans, boots.
// Lil Q (the code still calls her "bob"): biker. Short spiky red hair, shades, red lips, gold earrings, black tee with an orange wing under a leather vest, tattoos. 12 x 21 px.
const BOB_PAL={R:'#c8402a',r:'#e0603a',d:'#9a2e1e',S:'#f0c3a0',s:'#d9a882',G:'#1c1c20',g:'#3a4a60',Y:'#f4d35e',l:'#c0303a',V:'#4a2e1c',v:'#6b4428',T:'#1c1c20',O:'#e8742a',W:'#ffffff',i:'#2b3a4f',J:'#2c3e5a',C:'#c9ced4'};
const BOB_SPR={down:["........RR..","..RRrRRRdR..","..RRRrrRRR..","..RSSSSSSR..","..SGgGGgGS..","..YSSssSSY..","...SSllSS...","....sSSs....",
  ".VVVTTTTVVV.","SVvVTTTTVvVS","SVvVTOOTVvVS","iVvVOOOOVvVi","SVvVTWWTVvVS","SVVVTTTTVVVS","..JJCCCCJJ.."]};
function drawBob(x,y){
  const X=Math.round(x)-6, Y=Math.round(y)-20, F=(c,dx,dy,w,h)=>{ctx.fillStyle=c;ctx.fillRect(X+dx,Y+dy,w,h)};
  F('rgba(0,0,0,.2)',1,19,10,2);
  F('#2c3e5a',3,14,3,5); F('#2c3e5a',6,14,3,5); F('#22324a',5,14,1,5); F('#3d5274',3,15,1,2); F('#3d5274',6,15,1,2);   // jeans
  F('#1d1d22',2,18,4,2); F('#1d1d22',6,18,4,2); F('#3a3a44',2,18,1,1); F('#3a3a44',6,18,1,1);                          // boots
  drawSprite(ctx,X,Y-1,BOB_SPR,BOB_PAL,'down',null,8);   // (shades on: no blinking to see)
}
// Lil Q's motorcycle, parked by her shop
function drawBike(x,y){
  const F=(c,dx,dy,w,h)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x)+dx,Math.round(y)+dy,w,h)};
  F('rgba(0,0,0,.18)',-1,12,8,2);
  F('#1d1d22',1,0,4,3); F('#1d1d22',1,11,4,3);          // tires (it's parked nose-down)
  F('#c9ced4',2,3,2,8); F('#1c1c20',0,4,6,5); F('#e8742a',1,5,4,2);   // tank in orange + black
  F('#3b2416',1,8,4,3); F('#c9ced4',-1,2,8,1);           // seat, handlebars
}
// Alex: dark brown hair just below the shoulders, brown eyes, a green tee. Her mood shows in a little bubble.
// Alex, waiting in the car park: long straight dark-brown hair swept back off her face, past her shoulders; big smile; green scoop-neck tee. mood: happy / frown / ok
const ALEX_SPR={down:["..HHHHHHHH..",".HHLLhLLHHH.",".HHSSSSSSHH.",".HSBWSSBWSH.",".HSEESSEESH.",".HSSSssSSSH.",".HSSSSSSSSH.",
  ".HHHsSSsHHH.",".HHTTSSTTHH.",".HHTTTTTTHH.",".HSTTTTTTSH.","..STTTTTtS..","..STTTTTtS..","..sTTTTTts..","...PPPPPP...","...PPPPPP..."]};   // tall and lanky
function drawAlex(x,y,mood,g=ctx){
  const X=Math.round(x)-6, Y=Math.round(y)-21, F=(c,dx,dy,w,h)=>{g.fillStyle=c;g.fillRect(X+dx,Y+dy,w,h)};
  const pal={H:ALEX.hair,h:ALEX.hairD,L:ALEX.hairL,B:ALEX.hairD,S:ALEX.skin,s:ALEX.skinS,W:'#ffffff',E:ALEX.eye,T:ALEX.top,t:ALEX.topD,P:ALEX.pants};
  F('rgba(0,0,0,.2)',2,20,8,2);
  F(ALEX.pants,3,16,2,4); F(ALEX.pants,7,16,2,4); F('#22222a',4,16,1,4); F('#22222a',8,16,1,4);                                  // long legs
  F(ALEX.shoe,2,20,3,1); F(ALEX.shoe,7,20,3,1); F('#5a4030',2,20,1,1); F('#5a4030',7,20,1,1);
  drawSprite(g,X,Y,blinkNow(10)?{down:ALEX_SPR.down.map((r,i)=>i===3?r.replace(/W/g,'B'):r)}:ALEX_SPR,pal,'down',4,10);   // big dark eyes with a sparkle (the sparkle goes too when she blinks)
  if(mood==='happy'){F(ALEX.mouth,5,6,2,1); F(ALEX.blush,2,5,1,1); F(ALEX.blush,9,5,1,1); F(ALEX.blush,3,5,1,1); F(ALEX.blush,8,5,1,1)}   // a sweet little smile, rosy cheeks
  else if(mood==='frown'){F(ALEX.frown,5,6,2,1); F(ALEX.skin,3,3,2,1); F(ALEX.skin,7,3,2,1); F(ALEX.hairD,3,3,1,1); F(ALEX.hairD,4,2,1,1); F(ALEX.hairD,8,3,1,1); F(ALEX.hairD,7,2,1,1)}   // cross brows
  else {F(ALEX.mouth,5,6,2,1); F(ALEX.blush,2,5,1,1); F(ALEX.blush,9,5,1,1)}   // her usual sweet smile
  if(mood!=='ok'){ // bubble
    const bx=Math.round(x)+5, by=Math.round(y)-30; g.fillStyle='#ffffff'; g.fillRect(bx,by,9,8); g.fillRect(bx+1,by+8,2,2);
    g.fillStyle=mood==='happy'?'#e54b7a':'#4a4a5a';
    if(mood==='happy'){g.fillRect(bx+2,by+2,2,2);g.fillRect(bx+5,by+2,2,2);g.fillRect(bx+2,by+3,5,2);g.fillRect(bx+3,by+5,3,1);g.fillRect(bx+4,by+6,1,1)}
    else {g.fillRect(bx+2,by+2,1,1);g.fillRect(bx+6,by+2,1,1);g.fillRect(bx+3,by+5,3,1);g.fillRect(bx+2,by+6,1,1);g.fillRect(bx+6,by+6,1,1)}
  }
}
function drawWaterTower(){
  const F=(c,x,y,w,h)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h)}, x=TOWER.x, y=TOWER.y;
  F('#7d8694',x-12,y-18,2,18); F('#7d8694',x+10,y-18,2,18); F('#7d8694',x-1,y-18,2,18); F('#7d8694',x-11,y-10,22,1);
  F('#9fb0c2',x-15,y-36,30,18); F('#b9c8d6',x-15,y-36,30,3); F('#7d8fa2',x-15,y-20,30,2); F('#8a96a6',x-13,y-39,26,3);
  for(let i=-14;i<15;i+=4)F('#8ea0b4',x+i,y-32,1,1);                                   // rivets
  F('#6c7a8a',x+13,y-36,2,18); F('#c9d6e2',x-13,y-34,2,10);                            // shade + shine
  F('#5f6874',x+5,y-18,1,18); for(let k=y-16;k<y;k+=3)F('#5f6874',x+5,k,3,1); F('#5f6874',x+8,y-18,1,18);   // ladder
  F('#e54b4b',x-1,y-42,2,3);                                                           // the blinking light's mount
  if((time/700|0)%2)F('#ff6b6b',x-1,y-43,2,1);
  pixText(ctx,'FARGO',x-10,y-30,'#2f5f9e');
}
// the name board on each shop (Bob's moves around, so it's drawn live)
function textW(t){let w=0; for(const ch of t){const m=GLYPH[ch]; w+=(ch==='.'?2:(m?m.length/5:3)+1)} return w-1}
// the road signs pointing the way out of town: green highway boards, HWY and a big arrow
function drawExitSign(e){
  const F=(c,x,y,w,h)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h)}, x=e.x, y=e.y;
  F('rgba(0,0,0,.2)',x+12,y+17,4,2); F('#8a8f9a',x+12,y+12,2,6);
  F('#ffffff',x-1,y-1,28,14); F('#1d6b3a',x,y,26,12); F('#2a8a4c',x,y,26,1);
  pixText(ctx,'HWY',x+2,y+4,'#ffffff');
  const ax=x+17, ay=y+2, A=(dx,dy,w=1,h=1)=>F('#ffffff',ax+dx,ay+dy,w,h);   // a big arrow, 8x8
  if(e.dir==='<'){A(1,4,7,1); A(1,3,7,1); A(0,3,1,2); A(1,2,1,4); A(2,1,1,6); A(3,0,1,8)}
  else if(e.dir==='v'){A(3,0,2,7); A(0,4,8,1); A(1,5,6,1); A(2,6,4,1); A(3,7,2,1)}
  else {A(3,1,2,7); A(0,3,8,1); A(1,2,6,1); A(2,1,4,1); A(3,0,2,1)}
}
// the way out: an overhead highway sign across the road at the left edge of town (drawn on top, so the car drives under it)
function drawHighwayGantry(){
  const F=(c,x,y,w,h)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h)}, t='LEAVE FARGO', w=textW(t)+20, x=46, y=150;
  F('#6b6f7a',x+2,y+14,2,4); F('#6b6f7a',x+w-4,y+14,2,4); F('#6b6f7a',x+2,y+42,2,8); F('#6b6f7a',x+w-4,y+42,2,8);   // the posts, either side of the road
  F('rgba(0,0,0,.25)',x+2,y+15,w,2);
  F('#ffffff',x-1,y-1,w+2,16); F('#1d6b3a',x,y,w,14); F('#2a8a4c',x,y,w,1);
  const on=Math.floor(time/400)%2, A=(dx,dy,ww=1,hh=1)=>F(on?'#ffd84d':'#ffffff',x+3+dx,y+3+dy,ww,hh);
  A(1,4,7,1); A(1,3,7,1); A(0,3,1,2); A(1,2,1,4); A(2,1,1,6); A(3,0,1,8);                              // the arrow, blinking
  pixText(ctx,t,x+13,y+5,'#ffffff');
}

function drawShopSign(s){
  if(!s.signText)return; const st=s.store, w=textW(s.signText)+4, x=Math.round(st.x+(st.w-w)/2), y=s.face==='up'?st.y+st.h-8:st.y;
  ctx.fillStyle=s.brand; ctx.fillRect(x,y,w,8); ctx.fillStyle='rgba(255,255,255,.35)'; ctx.fillRect(x,y,w,1); pixText(ctx,s.signText,x+2,y+2,'#ffffff');
}
function drawSign(s){
  const near=s.seen, x=s.sign.x, y=s.sign.y;
  ctx.fillStyle='#1d2433'; ctx.fillRect(x,y,18,10); ctx.fillStyle=s.brand; ctx.fillRect(x,y,18,2);
  pixText(ctx, near?s.price:'?.??', x+2, y+4, near?(s.price===CHEAPEST?'#7dff8a':'#ffd84d'):'#58607a');
}

// ---------- the Fargo Theatre's blade sign and marquee (drawn live so the bulbs chase) ----------
function drawTheatreSign(){
  const t=THEATRE, F=(c,x,y,w,h)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h)}, on=Math.floor(time/200)%2;
  F('#1d2433',t.x+4,t.y+16,t.w-8,8); F('#efe2c0',t.x+4,t.y+15,t.w-8,1); F('#efe2c0',t.x+4,t.y+24,t.w-8,1);       // the marquee
  for(let x=t.x+5;x<t.x+t.w-4;x+=2){F((x/2+on)%2?'#fff3a8':'#a8762a',x,t.y+15,1,1); F((x/2+on+1)%2?'#fff3a8':'#a8762a',x,t.y+24,1,1)}
  pixText(ctx,FARGO.marquee,t.x+t.w/2-textW(FARGO.marquee)/2|0,t.y+17,'#ffd84d');
  const bx=t.x-9, by=t.y+1; F('#8a1f1a',bx,by,9,30); F('#c7372f',bx+1,by+1,7,28); F('#5a3a22',bx+8,by+4,2,2); F('#5a3a22',bx+8,by+22,2,2);   // the tall blade sign on the corner
  for(let y=by+1;y<by+29;y+=2){F((y/2+on)%2?'#fff3a8':'#a8762a',bx,y,1,1); F((y/2+on+1)%2?'#fff3a8':'#a8762a',bx+8,y,1,1)}
  [...'FARGO'].forEach((ch,i)=>pixText(ctx,ch,bx+3,by+2+i*5,'#ffd84d'));
}
// ---------- pulling into Lil Q's: she challenges you to a scooter race (scooter.js) ----------
function pullIn(){
  if(fargoDone()) return showDialog({place:FARGO.place,speaker:FARGO.bob,pages:[FARGO.after],actions:have.baked?[{label:REPLAY.fargo,fn:()=>{closeDialog(); fargo.replay=true; openRace()}},CLOSE]:[CLOSE]});
  if(have.fargoStage==='reward') return lilQWins();
  if(have.fargoStage==='store'){ const g=STATIONS[fargo.bob]; P.x=g.lot.x+10; P.y=g.lot.y+22; P.dir='right'; return parkAndGetOut() }   // back from the diner: park, the shop's open
  const met=have.fargoStage==='race'; have.fargoStage='race'; save();
  showDialog({place:FARGO.place,speaker:FARGO.bob,pages:met?[FARGO.rematchHello]:[...FARGO.bobHello,...FARGO.bobBet],actions:[{label:FARGO.raceGo,fn:()=>{closeDialog();openRace()}},{label:FARGO.raceLater,ghost:true,fn:closeDialog}]});
}
// the diner: Deb hands over a bowl of plain pasta (for Jackie, in the shop)
function pullInDiner(){
  if(have.fargoPasta) return showDialog({place:FARGO.place,speaker:FARGO.dinerCook,pages:[FARGO.dinerAgain],actions:[CLOSE]});
  showDialog({place:FARGO.place,speaker:FARGO.dinerCook,pages:[FARGO.dinerHello],actions:[
    {label:FARGO.askPasta,fn:()=>{ showDialog({place:FARGO.place,speaker:FARGO.dinerCook,pages:FARGO.dinerPasta,actions:[{label:'OK',fn:()=>{closeDialog(); showReward('fargoPasta')}}]}) }},
    {label:FARGO.dinerBye,ghost:true,fn:closeDialog}]});
}
// the pasta bowl (in the basket, over Joe's head, in Jackie's hands)
function drawPastaBowl(g,x,y,s=1){ const F=(c,dx,dy,w,h)=>{g.fillStyle=c;g.fillRect(x+dx*s,y+dy*s,w*s,h*s)};   // a bowl, (x,y) = top-left, 9x7 at s=1
  F('#f4d35e',1,0,7,2); F('#e8c048',2,1,2,1); F('#fff0a0',5,0,2,1); F('#e8c048',6,1,1,1);   // pasta piled up
  F('#ffffff',0,2,9,2); F('#3d8ad6',0,2,9,1); F('#e9eef3',1,4,7,1); F('#c9ced4',2,5,5,1); F('#9aa0aa',3,6,3,1) }   // a white bowl with a blue rim
// Deb, the diner cook, out front: white apron, a hairnet, a spatula
const DEB={x:132,y:86};   // (in the lot, beside the diner's sign)
function drawDeb(x,y){ const X=Math.round(x)-5, Y=Math.round(y)-17, F=(c,dx,dy,w,h)=>{ctx.fillStyle=c;ctx.fillRect(X+dx,Y+dy,w,h)};
  F('rgba(0,0,0,.2)',1,16,9,2); F('#3a4458',3,12,2,4); F('#3a4458',6,12,2,4); F('#1d1d22',2,15,3,1); F('#1d1d22',6,15,3,1);
  F('#3fa59a',1,6,9,7); F('#ffffff',3,6,5,7); F('#e9eef3',3,11,5,2); F('#f0c6a0',0,7,1,4); F('#f0c6a0',10,7,1,4);   // teal uniform, white apron
  F('#9aa0aa',10,3,1,5); F('#5f6676',9,2,3,2);                                                               // spatula
  F('#f0c6a0',2,1,7,5); F('#c99a66',1,0,9,2); F('#e9eef3',2,-1,7,2); F('#2b2b2b',4,3,1,1); F('#2b2b2b',6,3,1,1); F('#b5654f',4,5,3,1);   // face, hair under a hairnet
  if(!have.fargoPasta&&have.jackieAsked&&Math.floor(time/400)%2){ F('#ffffff',11,-9,7,7); F('#1d2130',14,-8,1,3); F('#1d2130',14,-4,1,1) }   // "!" once Jackie's asked for pasta
}
// back outside with Alex's snacks: Lil Q gives you the sugar
function lilQWins(){ showDialog({place:FARGO.place,speaker:FARGO.bob,pages:FARGO.win,actions:[{label:FARGO.thanks,fn:()=>{closeDialog();backInTheCar();showReward('fargo')}}]}) }
const FARGO_TRIGGERS=[
  ...STATIONS.map(s=>({z:s.lot, label:FARGO.pullIn, act:pullIn})),
  {z:DINER.lot, label:FARGO.pullInDiner, act:pullInDiner},
];
const onRoad=(x,y)=>onShortcut(x,y)||ROADS.some(r=>x>=r.x&&x<=r.x+r.w&&y>=r.y&&y<=r.y+r.h)||[...STATIONS.map(s=>s.lot),DINER.lot].some(l=>x>=l.x&&x<=l.x+l.w&&y>=l.y&&y<=l.y+l.h);

SCENES.fargo={ music:'fargo',
  w:FW, h:FH, bounds:R(0,0,FW,FH), bg:fargoBg,
  get triggers(){ return fargo.onFoot?[]:FARGO_TRIGGERS },
  baseSolids:[...HOUSES, ...STATIONS.flatMap(s=>[s.store,s.island,R(s.sign.x+7,s.sign.y+14,4,4),R(s.person.x-3,s.person.y-3,6,4)]), DINER.bld, R(DEB.x-3,DEB.y-3,6,4),
    ...fargoTrees.map(([x,y])=>R(x-3,y-2,6,3)), R(TOWER.x-13,TOWER.y-4,26,5), R(WELCOME.x,WELCOME.y+10,24,6), R(THEATRE.x,THEATRE.y+8,THEATRE.w,THEATRE.h-10), R(DOME.x+2,DOME.y+14,DOME.w-4,DOME.h-16), R(BISON.x+2,BISON.y+8,BISON.w-4,6)],
  get solids(){ if(!fargo.onFoot||!fargo.car)return this.baseSolids; const c=fargo.car, a=fargo.alex;
    return [...this.baseSolids, c.dir==='up'||c.dir==='down'?R(c.x-6,c.y-11,12,22):R(c.x-11,c.y-6,22,12), ...(a?[R(a.x-3,a.y-3,6,4)]:[])] },
  entries:{start:{x:20,y:180,dir:'right'}, fromHighway:{x:20,y:180,dir:'right'}, fromRace:{x:20,y:180,dir:'right'}, fromShop:{x:20,y:180,dir:'right'}},
  feet:(x,y)=>fargo.onFoot?R(x-4,y-3,8,4):R(x-6,y-4,12,8),
  speed:()=>fargo.onFoot?.07:(onRoad(P.x,P.y)?DRIVE.ROAD:DRIVE.GRASS),
  dynTrigger(){
    const g=STATIONS[fargo.bob];
    if(!fargo.onFoot)return null;
    if(have.fargoStage==='store'&&hit(R(P.x-4,P.y-3,8,4),g.door))return SHOP_TRIGGER;
    if(fargo.alex&&Math.hypot(P.x-fargo.alex.x,P.y-fargo.alex.y)<14)return ALEX_TRIGGER;
    if(have.fargoStage==='store'&&fargo.car&&Math.hypot(P.x-fargo.car.x,P.y-fargo.car.y)<18)return {label:FARGO.driveOff,act:backInTheCar};   // (to go get Jackie's pasta)
    if(Math.hypot(P.x-g.person.x,P.y-g.person.y)<14)return BOB_TRIGGER;
    return null;
  },
  enter(){
    fargoNewRun(); fargo.introPending=!have.fargo&&!have.fargoStage&&!have.fargoIntro; fargo.pending=null;
    const g=STATIONS[fargo.bob];
    if(have.fargoStage==='store'||have.fargoStage==='reward'){   // just won the race, came out of the shop, or came back after a reload: parked at Lil Q's, on foot
      P.x=g.lot.x+10; P.y=g.lot.y+22; P.dir='right'; parkAndGetOut();
      if(have.fargoStage==='reward'||fargo.fromShop){ const d=freeSpotNear(g.door.x+8,g.door.y+4); P.x=d.x; P.y=d.y; P.dir='down' }   // (out the shop door)
      if(have.fargoStage==='reward'){ fargo.alexMood='happy'; fargo.moodT=4000; fargo.pending=lilQWins }
    } else if(fargo.fromRace){ P.x=g.lot.x+24; P.y=g.lot.y-10; P.dir='down' }   // (lost, or "later": the car's back on the road by her lot)
    if(have.fargoStage==='store'&&fargo.afterRace)fargo.pending=()=>say(FARGO.snackAsk);   // just won the race: "Want anything from inside?"
    fargo.fromRace=false; fargo.afterRace=false; fargo.fromShop=false;
  },
  ambient(dt){ if(fargo.moodT>0){fargo.moodT-=dt; if(fargo.moodT<=0)fargo.alexMood='ok'} },
  update(){
    if(fargo.introPending){fargo.introPending=false; have.fargoIntro=true; save(); return showDialog({place:FARGO.place,speaker:FARGO.introSpeaker,pages:FARGO.intro,actions:[CLOSE]})}
    if(fargo.pending){const f=fargo.pending; fargo.pending=null; return f()}
  },
  drawPlayer:(x,y)=>fargo.onFoot?drawPlayer(x,y):drawCar(x,y),
  ents(list){
    fargoTrees.forEach(([x,y])=>list.push({y,draw:()=>ctx.drawImage(pineSprite,x-6,y-17)}));
    list.push({y:TOWER.y,draw:drawWaterTower},{y:THEATRE.y+THEATRE.h,draw:drawTheatreSign});
    EXIT_SIGNS.forEach(e=>list.push({y:e.y+18,draw:()=>drawExitSign(e)}));
    STATIONS.forEach(s=>list.push({y:s.person.y,draw:()=>drawBob(s.person.x,s.person.y)}));
    list.push({y:DEB.y,draw:()=>drawDeb(DEB.x,DEB.y)});
    const b=STATIONS[fargo.bob]; list.push({y:b.y+26,draw:()=>drawBike(b.x+43,b.y+12)});
    if(fargo.onFoot&&fargo.car){const c=fargo.car, a=fargo.alex; list.push({y:c.y+5,draw:()=>drawCar(c.x,c.y,c.dir,true)});
      if(a)list.push({y:a.y,draw:()=>drawAlex(a.x,a.y,fargo.alexMood)})}
  },
  under(){ STATIONS.forEach(drawSign); STATIONS.forEach(drawShopSign) },
  over(){
    for(const s of STATIONS){ // canopies over the pumps
      ctx.fillStyle='rgba(0,0,0,.08)'; ctx.fillRect(s.x+6,s.y+8,40,14);
      ctx.fillStyle='rgba(241,244,248,.6)'; ctx.fillRect(s.x+8,s.y+3,32,10); ctx.fillStyle=s.brand; ctx.fillRect(s.x+8,s.y+11,32,2);   // see-through so the car shows
    }
    drawHighwayGantry();
    if(have.fargoStage==='store'&&fargo.onFoot)drawEnterSign();
    if(have.fargoPasta&&!have.jackieFed&&fargo.onFoot){ ctx.fillStyle='rgba(29,33,48,.55)'; ctx.fillRect(Math.round(P.x)-6,Math.round(P.y)-36,13,10); drawPastaBowl(ctx,Math.round(P.x)-4,Math.round(P.y)-35) }   // carrying the pasta
    ctx.fillStyle='rgba(120,100,60,.35)';    // a little summer dust drifting across the plains
    for(let i=0;i<14;i++){const sx=(i*97+time*.03*(1+i%3))%FW, sy=(i*53+Math.sin(time/700+i)*6+FH)%FH; ctx.fillRect(sx|0,sy|0,1,1)}
  },
  hud(){
    if(fargo.onFoot) return have.fargoStage!=='store'?'':have.jackieAsked&&!have.fargoPasta?`<span>${FARGO.hudPasta}</span>`:`<span>${FARGO.goInside}: get Alex a snack</span>`;
    if(fargoDone())return '';
    if(have.fargoStage==='store'&&have.jackieAsked&&!have.fargoPasta)return `<span>${FARGO.hudPasta}</span>`;
    return `<span>${have.fargoStage==='race'?'Race Lil Q':have.fargoStage==='store'?"Back to Lil Q's":FARGO.hudGoal}</span>`;
  },
};
fargoNewRun();
// a blinking ENTER sign over Lil Q's shop door once you've won the race, with a bouncing arrow
function drawEnterSign(){
  const g=STATIONS[fargo.bob], on=Math.floor(time/400)%2===0, t=FARGO.enterSign, w=textW(t)+6, x=Math.round(g.door.x+g.door.w/2-w/2), y=g.store.y-1, F=(c,x,y,w,h)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h)};
  if(on){F('rgba(255,216,77,.22)',x-3,y-3,w+6,15)}
  F('#1d2130',x-1,y-1,w+2,11); F(on?'#e8742a':'#7a4a24',x,y,w,9); pixText(ctx,t,x+3,y+2,on?'#ffffff':'#d9b48a');
}

// ---------- on foot + the shop ----------
const SHOP_TRIGGER={label:FARGO.goInside, act:()=>{ sfx('click'); goTo('lilqshop','door') }};   // into the shop (lilqshop.js); Alex comes too
const ALEX_TRIGGER={label:'Talk to Alex', btn:'Talk', act:()=>showDialog({place:FARGO.place,speaker:'Alex',pages:[FARGO.alexWaiting],actions:[CLOSE]})};
const BOB_TRIGGER={label:'Talk to '+FARGO.bob, btn:'Talk', act:()=>showDialog({place:FARGO.place,speaker:FARGO.bob,pages:[FARGO.bobWaiting],actions:[CLOSE]})};
function parkAndGetOut(){
  // the car pulls up to the pump on the side away from the shop, so the door is always clear
  const g=STATIONS[fargo.bob];
  const c={x:g.x+24, y:g.face==='up'?g.y+5:g.y+23, dir:'right'}; fargo.car=c; fargo.onFoot=true;
  fargo.alex=null; const a=freeSpotNear(c.x-18, c.y); fargo.alex=a;        // Alex leans by the back of the car
  const me=freeSpotNear(g.x+9, g.face==='up'?g.y+22:g.y+6); P.x=me.x; P.y=me.y;   // you, on the shop side
  P.dir=g.face==='up'?'down':'up'; P.moving=false;
}
// nearest place you can stand around (cx,cy), not on top of the car, Alex, or the door itself
function freeSpotNear(cx,cy){
  const sc=SCENES.fargo, door=STATIONS[fargo.bob].door;
  for(let r=0;r<40;r+=2)for(let a=0;a<16;a++){const x=Math.round(cx+Math.cos(a/16*Math.PI*2)*r), y=Math.round(cy+Math.sin(a/16*Math.PI*2)*r);
    if(!blocked(x,y,sc)&&!hit(R(x-4,y-3,8,4),door))return {x,y}}
  return {x:cx,y:cy};
}
function backInTheCar(){ if(fargo.car){P.x=fargo.car.x;P.y=fargo.car.y;P.dir=fargo.car.dir} fargo.onFoot=false; fargo.car=null; fargo.alex=null }

// Alex's face for the shop panel (40x40): long dark brown hair with a side part, brown eyes
// Alex's colors, shared by her face (pop-ups) and her little walking sprite, so she always looks the same
const ALEX={hair:'#3b2416', hairD:'#2a170f', hairL:'#4e3020', skin:'#f2c9a5', skinS:'#e3b08c', eye:'#5a3a22', lash:'#24140c',
  top:'#3f7a55', topD:'#2f5f42', pants:'#2c2c34', shoe:'#3b2a1e', blush:'#f2a7a0', mouth:'#c06a60', smile:'#b4544c', frown:'#a85a50'};
function drawAlexFace(g,mood){
  const F=(c,x,y,w=1,h=1)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};
  const {hair,hairD,hairL,skin,skinS,eye,lash}=ALEX;
  // long hair behind (falls past the shoulders, slightly wavy)
  // hair just below the shoulders (ends around y 36, curling in a little)
  for(let y=5;y<37;y++){let w; if(y<17){const t=(17-y)/12; w=Math.sqrt(Math.max(0,1-t*t))*13} else w=13-Math.max(0,y-31)*0.9;
    const wave=Math.round(Math.sin(y/3.4)*0.3); F(hair,Math.round(20-w)+wave,y,Math.round(w*2)-wave*2,1)}   // (straight)
  F(hairD,8,26,2,9); F(hairD,30,26,2,9);
  // shoulders in her light blue tee (same as her sprite), scoop neck
  F(ALEX.top,8,35,24,5); F(ALEX.top,6,37,28,3); F(skinS,17,30,6,5); F(skin,17,30,6,3); F(skin,17,35,6,1); F(skin,18,36,4,1); F(ALEX.topD,16,35,1,2); F(ALEX.topD,23,35,1,2); F(ALEX.topD,17,37,6,1);
  // face (soft oval, narrower toward the chin)
  for(let y=9;y<31;y++){const t=(y-19.5)/11.2; let hw=Math.sqrt(Math.max(0,1-t*t))*9.8; if(y>24)hw*=1-(y-24)*0.035; F(skin,Math.round(20-hw),y,Math.round(hw*2),1)}
  F(skinS,11,24,1,2); F(skinS,28,24,1,2);   // jaw shading
  // hair in front
  // side part, sweeping across the forehead // side part, sweeping across the forehead
    // swept back off the face: a high, smooth hairline with a side part, long straight lengths framing the face
    F(hair,11,5,18,4); F(hair,10,8,4,3); F(hair,26,8,4,3); F(hair,12,8,3,1); F(hair,25,8,3,1); F(hairD,16,5,1,3);
    F(hair,9,11,3,19); F(hair,28,11,3,19); F(hairD,11,14,1,14); F(hairD,28,14,1,14);
    F(hairL,12,6,4,1); F(hairL,18,6,8,1); F(hairL,20,7,4,1); F(hairL,10,15,1,11); F(hairL,29,15,1,11);
  
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
  if(mood!=='frown'){F(ALEX.blush,13,22,2,1); F(ALEX.blush,25,22,2,1)}
  // mouth
  if(mood==='happy'){F(ALEX.smile,17,25,6); F(ALEX.smile,16,24,1); F(ALEX.smile,23,24,1); F(ALEX.mouth,18,26,4); F('#ffffff',18,25,4)}   // a big happy smile
  else if(mood==='frown'){F(ALEX.frown,17,26,6); F(ALEX.frown,16,27,1); F(ALEX.frown,23,27,1)}
  else {F(ALEX.smile,18,25,4); F(ALEX.smile,17,24,1); F(ALEX.smile,22,24,1); F(ALEX.mouth,19,26,2)}   // her usual sweet smile (closed)
}

// pixel art for the shop items (16x20): shaded cans and bottles, crimped bags and wrappers, a little picture of what's inside.
// Colors and shapes only: no real logos or lettering.
const itemF=g=>(c,x,y,w=1,h=1)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};
function itemCan(g,body,dark,light){ const F=itemF(g);
  F('rgba(0,0,0,.22)',4,19,9,1);
  F('#8a8f9a',4,1,8,1); F('#d6dbe3',4,2,8,2); F('#ffffff',5,2,3,1); F('#9aa0aa',6,1,4,1); F('#b9bec7',7,2,2,1);   // the lid + tab
  F(body,4,4,8,14); F(dark,4,4,1,14); F(dark,11,4,1,14); F(light,6,4,1,14); F('rgba(255,255,255,.55)',6,5,1,6);    // the body: shaded edges, a shine
  F('#b9bec7',4,18,8,1); F('#8a8f9a',5,19,6,1);                                                                     // the bottom rim
}
function itemBag(g,body,dark,light){ const F=itemF(g);
  F('rgba(0,0,0,.2)',2,19,12,1);
  for(let x=2;x<14;x+=2){F(dark,x,1,1,2); F(body,x+1,1,1,2); F(dark,x,17,1,2); F(body,x+1,17,1,2)}             // crimped top and bottom
  F(body,2,3,12,14); F(body,1,5,1,10); F(body,14,5,1,10); F(dark,13,4,1,13); F(dark,14,6,1,8); F(light,3,4,1,11); F('rgba(255,255,255,.5)',3,4,1,4);   // puffy sides, a shine
}
function itemBar(g,body,dark,light){ const F=itemF(g);
  F('rgba(0,0,0,.2)',1,15,14,1);
  F(dark,0,7,1,7); F(dark,15,7,1,7); for(let y=7;y<14;y+=2){F(light,1,y,1,1); F(light,14,y,1,1)}                    // crimped wrapper ends
  F(body,1,7,14,7); F(light,2,7,12,1); F(dark,2,13,12,1); F('rgba(255,255,255,.35)',2,8,5,1);
}
const ITEM_ART={
  coke(g){ itemCan(g,'#c8102e','#8e0b21','#e0384f'); const F=itemF(g); for(let x=4;x<12;x++)F('#ffffff',x,9+Math.round(Math.sin(x/1.3))); F('#ffffff',4,13,8,1); F('#f2c9cf',8,14,3,1) },   // a white wave
  sprite(g){ const F=itemF(g); F('rgba(0,0,0,.2)',4,19,9,1);
    F('#2e7d3e',6,0,4,2); F('#4caf5f',7,0,2,1);                                    // cap
    F('#9fe0b0',6,2,4,2); F('#7fd39a',5,4,6,2);                                    // neck
    F('#4fbf73',4,6,8,13); F('#2e9e4f',4,6,1,13); F('#2e9e4f',11,6,1,13); F('#8fe0a8',6,6,1,12);   // green plastic
    F('#f2e14c',4,10,8,4); F('#d9c43a',4,13,8,1); F('#3d8ad6',6,11,4,2); F('#ffffff',9,7,1,3); F('#2e9e4f',5,18,6,1) },   // a yellow label
  gingerale(g){ itemCan(g,'#2f7a46','#1f5a32','#4a9a62'); const F=itemF(g); F('#e0c068',4,8,8,5); F('#c9a84a',4,12,8,1); F('#f6e8b0',5,9,2,1);
    for(const [x,y] of [[6,10],[9,9],[8,11],[10,11]])F('#ffffff',x,y); F('#f6e8b0',4,15,8,1) },   // a gold label with bubbles
  pepsi(g){ itemCan(g,'#1c3f94','#122b6a','#2f58b8'); const F=itemF(g); F('#ffffff',4,9,8,2); F('#d0213a',4,11,8,2); F('#ffffff',4,13,8,1); F('#9fb8f0',8,6,2,1) },   // red and white stripes
  pedialyte(g){ const F=itemF(g); F('rgba(0,0,0,.2)',4,19,9,1);
    F('#7a4fa0',5,0,6,2); F('#9a6fc0',6,0,3,1); F('#e9eef3',5,2,6,2);              // cap, neck
    F('#f3b7cf',3,4,10,15); F('#d98aab',3,4,1,15); F('#d98aab',12,4,1,15); F('#ffd6e6',5,4,1,14);   // pink liquid
    F('#ffffff',3,8,10,6); F('#7a4fa0',4,10,8,1); F('#b58ad8',5,12,6,1); F('#ffffff',10,5,1,2) },
  pringles(g){ const F=itemF(g); F('rgba(0,0,0,.22)',3,19,11,1);
    F('#9aa0aa',3,0,10,1); F('#e8d48a',3,1,10,2); F('#c9b46a',3,2,10,1);         // the foil lid
    F('#c8102e',3,3,10,16); F('#8e0b21',3,3,1,16); F('#8e0b21',12,3,1,16); F('#e0384f',5,3,1,16); F('#3a3a44',3,18,10,1);   // a tall red tube
    for(let k=0;k<3;k++){F('#f4d35e',6,8+k*2,5,2); F('#d9a52a',6,9+k*2,5,1)} F('#fff3b0',7,8,2,1) },   // a stack of chips
  cheetos(g){ itemBag(g,'#f28c28','#c8661a','#ffb347'); const F=itemF(g);
    F('#ffd84d',4,6,8,6); F('#e8741a',5,7,3,2); F('#e8741a',8,8,3,2); F('#f9a23a',6,10,4,1); F('#ffffff',10,5,1,1);   // a cheesy puff
    F('#c8322b',4,13,8,2) },
  smartfood(g){ itemBag(g,'#1a1a26','#0c0c14','#3a3a4c'); const F=itemF(g);
    F('#f4d35e',2,5,12,2); F('#2fbf5a',2,14,12,1);
    for(const [x,y] of [[6,9],[8,8],[7,11],[9,10],[5,11],[10,12]]){F('#fff8e6',x,y,2,2); F('#f4d35e',x+1,y+1)} },   // popcorn
  almondjoy(g){ itemBar(g,'#1f4fa0','#123a7c','#3f74c8'); const F=itemF(g);
    F('#ffffff',5,8,6,5); F('#f2f2ee',5,12,6,1); F('#6b3f22',6,9,4,3); F('#8a5a34',7,9,2,1); F('#ffffff',7,10,2,1) },   // a split chocolate bar, coconut inside
  snickers(g){ itemBar(g,'#5a3220','#3e2216','#7a4a30'); const F=itemF(g);
    F('#2f6db0',4,9,8,3); F('#ffffff',5,10,6,1); F('#c8322b',4,8,8,1); F('#c8322b',4,12,8,1) },
  motts(g){ const F=itemF(g); F('rgba(0,0,0,.2)',2,19,12,1);
    F('#7a2b5a',3,2,10,16); F('#5e2046',3,2,1,16); F('#5e2046',12,2,1,16); F('#9a3d74',4,2,1,15); F('#5e2046',7,2,2,1);   // a purple pouch with a tear notch
    F('#f2e6ee',4,5,8,8); for(const [x,y,c] of [[5,6,'#e54b4b'],[8,6,'#3d8ad6'],[6,9,'#f4d35e'],[9,9,'#a03d6a'],[5,11,'#2fbf5a'],[9,11,'#e8742a']])F(c,x,y,2,2);   // gummies in the window
    F('#ffffff',4,15,8,1); F('#e54b4b',10,3,2,2); F('#2f8a4a',11,2,1,1) },   // and a little berry
};
