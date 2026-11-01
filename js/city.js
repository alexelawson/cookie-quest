// The city at night: rainy rooftops joined by planks. The chocolate heist will happen up here.
// For now: explore, meet the stranger, climb back down.
const CW=320, CH=168;
const ROOFS=[R(4,22,96,130), R(130,10,90,150), R(240,30,76,112)];
const PLANKS=[R(96,78,38,12), R(216,114,28,12)];
const CITY_TRIGGERS=[
  {z:R(6,138,22,14),   label:'Climb down the ladder', act:()=>goTo('world','fromCity')},
  {z:R(278,72,30,24),  label:'Talk to the stranger', btn:'Talk', act:()=>openLand('city')},
];
const cityRain=[...Array(140)].map(()=>({x:Math.random()*CW,y:Math.random()*CH}));
const cars=[...Array(6)].map((_,i)=>({lane:i%2, x:i<3?110:226, y:Math.random()*CH, v:(i%2?1:-1)*(.03+Math.random()*.03)}));
let flashT=0, nextFlash=9000;

const cityBg=document.createElement('canvas'); cityBg.width=CW; cityBg.height=CH;
(function(){
  const g=cityBg.getContext('2d'), F=(c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};
  F('#07080f',0,0,CW,CH);                                           // the street, far below
  for(const [x0,w] of [[100,30],[220,20]]){F('#0c0e18',x0,0,w,CH); for(let y=0;y<CH;y+=12)F('#232636',x0+w/2-1,y,1,6)}
  for(const r of ROOFS){
    F('#2a2e3e',r.x-2,r.y-2,r.w+4,r.h+4);                           // parapet
    F('#3a3f52',r.x,r.y,r.w,r.h);
    for(let i=0;i<r.w*r.h/18;i++)F(rnd()<.5?'#353a4c':'#41475c',r.x+rnd()*r.w|0,r.y+rnd()*r.h|0,1,1);
    for(let i=0;i<4;i++)F('#30354a',r.x+rnd()*(r.w-20)|0,r.y+rnd()*(r.h-10)|0,14+rnd()*12|0,3);   // puddles
  }
  for(const p of PLANKS){F('#5a4128',p.x,p.y,p.w,p.h); for(let x=p.x;x<p.x+p.w;x+=5)F('#46321e',x,p.y,1,p.h); F('#6e5034',p.x,p.y,p.w,1)}
  // skylight, AC units, chimney, ladder top
  F('#4d5a78',60,100,20,14); F('#7f93b8',62,102,7,10); F('#7f93b8',71,102,7,10);
  F('#8b93a3',30,40,16,10); F('#5f6676',32,42,12,6); F('#8b93a3',180,120,16,10); F('#5f6676',182,122,12,6);
  F('#6b3b32',270,50,10,10); F('#4a2a24',272,52,6,6);
  F('#8b93a3',10,146,2,8); F('#8b93a3',22,146,2,8); for(let y=147;y<154;y+=2)F('#8b93a3',10,y,14,1);
  // antenna
  F('#5f6676',299,36,2,14);
})();
function drawWaterTower(){
  const F=(c,x,y,w,h)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h)};
  F('#3b2a20',150,30,2,8); F('#3b2a20',166,30,2,8);
  F('#6b4a34',148,12,22,20); for(let x=150;x<170;x+=4)F('#5a3d2a',x,12,1,20); F('#4a3326',146,8,26,5); F('#3b2a20',156,4,6,5);
}
function drawStranger(){
  const F=(c,x,y,w,h)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h)};
  const x=292,y=66, sway=Math.sin(time/600)>.95?1:0;
  F('rgba(0,0,0,.35)',x-1,y+20,12,2);
  F('#1b1c24',x,y+6,10,14); F('#262833',x+1,y+6,8,12); F('#14151c',x+sway,y+19,4,2); F('#14151c',x+6,y+19,4,2);   // long coat
  F('#c9a787',x+3,y+2,5,4); F('#14151c',x+1,y,9,3); F('#14151c',x-1,y+2,13,1);                                    // face under a hat brim
}
SCENES.city={
  w:CW, h:CH, bounds:R(0,0,CW,CH), bg:cityBg, triggers:CITY_TRIGGERS, walk:[...ROOFS,...PLANKS],
  solids:[R(148,26,22,10), R(30,40,16,10), R(180,120,16,10), R(270,50,10,10), R(60,100,20,14), R(288,80,14,8)],
  entries:{start:{x:18,y:130,dir:'up'}, fromStreet:{x:18,y:130,dir:'up'}},
  ambient(dt){
    for(const r of cityRain){r.y+=dt*.32;r.x-=dt*.08;if(r.y>CH){r.y=-4;r.x=Math.random()*(CW+40)}}
    for(const c of cars){c.y+=c.v*dt; if(c.y>CH+6)c.y=-6; if(c.y<-6)c.y=CH+6}
    nextFlash-=dt; if(nextFlash<=0){flashT=140; nextFlash=8000+Math.random()*9000} if(flashT>0)flashT-=dt;
  },
  under(){
    for(const c of cars){const x=c.x+(c.lane?14:4); ctx.fillStyle=c.v>0?'#ffe9a0':'#ff4a3a'; ctx.fillRect(x,c.y|0,1,1); ctx.fillRect(x+3,c.y|0,1,1)}
  },
  ents(list){list.push({y:36,draw:drawWaterTower},{y:86,draw:drawStranger})},
  over(){
    ctx.fillStyle='rgba(12,14,40,.32)'; ctx.fillRect(0,0,CW,CH);                    // night
    for(const [bx,phase] of [[115,0],[230,2.2]]){                                    // searchlights sweeping from the street
      const a=Math.sin(time/1700+phase)*.7; ctx.fillStyle='rgba(255,244,190,.09)'; ctx.beginPath(); ctx.moveTo(bx,CH+10);
      ctx.lineTo(bx+Math.sin(a-.1)*260,CH+10-Math.cos(a-.1)*260); ctx.lineTo(bx+Math.sin(a+.1)*260,CH+10-Math.cos(a+.1)*260); ctx.fill();
    }
    ctx.fillStyle='rgba(255,70,140,.12)'; ctx.fillRect(126,60,6,40);                  // neon spill from a sign below
    ctx.fillStyle=(time%1400)<700?'#ff3b3b':'#5a1a1a'; ctx.fillRect(299,34,2,2);       // antenna light
    ctx.fillStyle='rgba(170,190,230,.5)'; for(const r of cityRain)ctx.fillRect(r.x|0,r.y|0,1,3);
    if(flashT>0){ctx.fillStyle=`rgba(220,230,255,${flashT/140*.35})`; ctx.fillRect(0,0,CW,CH)}
  },
};
