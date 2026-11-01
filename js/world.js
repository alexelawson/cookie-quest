// The overworld: size, collision boxes, doors, and the one-time painting of the map.
// Other places you can walk into (kitchen, city rooftops) are separate scenes; see kitchen.js and city.js.
const WW=384, WH=288, VW=224, VH=168;
const cv=document.getElementById('game'), ctx=cv.getContext('2d'); ctx.imageSmoothingEnabled=false;
const R=(x,y,w,h)=>({x,y,w,h});
const REG={farm:R(0,0,164,144), mill:R(220,0,164,144), city:R(0,170,164,118), fargo:R(220,170,164,118)};
const trees=[[172,30],[212,30],[172,64],[212,64],[172,98],[170,200],[214,228],[170,262],[214,276],[110,154],[270,154]];
const solids=[
  R(20,30,56,44),                                            // barn
  R(90,60,60,3),R(90,117,60,3),R(90,60,3,60),R(147,60,3,60), // pen fence
  R(300,26,32,48),                                           // windmill
  R(170,108,44,34),                                          // kitchen
  R(8,178,40,52),R(110,184,48,56),R(16,246,44,38),           // city buildings
  R(310,180,60,40),R(256,198,6,10),R(280,198,6,10),R(235,214,3,12), // gas shop, pumps, sign pole
  ...trees.map(([x,y])=>R(x-3,y-3,6,4)),
];
const triggers=[
  {z:R(306,74,20,12),  label:'Visit The Old Mill', act:()=>openLand('mill')},
  {z:R(124,240,20,12), label:'Enter the city',     act:()=>goTo('city','fromStreet')},
  {z:R(330,220,20,12), label:'Drive into Fargo',   act:()=>goTo('fargo','fromHighway')},
  {z:R(182,142,20,10), label:'Enter your kitchen', act:()=>goTo('kitchen','fromDoor')},
  // Keelan's trigger moves with him; see farm.js
];
const hit=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;

// seeded random so the world looks the same every time
let seed=7; const rnd=()=>((seed=(seed*16807)%2147483647)/2147483647);

const bg=document.createElement('canvas'); bg.width=WW; bg.height=WH;
(function paint(){
  const g=bg.getContext('2d');
  const F=(c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};
  F('#6aa84a',0,0,WW,WH);
  for(let i=0;i<900;i++)F(rnd()<.5?'#5e9a40':'#79b857',rnd()*WW|0,rnd()*WH|0,1,2);
  // farm
  F('#78b955',0,0,164,144);
  for(let i=0;i<250;i++)F('#8cc866',rnd()*164|0,rnd()*144|0,1,1);
  F('#b9905c',93,63,54,54); for(let i=0;i<120;i++)F('#a67f4e',93+rnd()*54|0,63+rnd()*54|0,1,1);
  F('#f1e3c9',90,60,60,3);F('#f1e3c9',90,117,60,3);F('#f1e3c9',90,60,3,60);F('#f1e3c9',147,60,3,60);
  for(let x=90;x<150;x+=8){F('#d9c6a5',x,60,2,3);F('#d9c6a5',x,117,2,3)}
  // mill: wheat field
  F('#d9b24a',236,82,140,54);
  for(let y=84;y<136;y+=6){F('#c09634',236,y,140,1); for(let x=238;x<376;x+=4)F('#ecd06a',x+(y%4),y-2,1,2)}
  F('#cbbfa6',302,32,28,42); for(let y=36;y<74;y+=6)F('#b7aa8f',302,y,28,1);
  F('#6b4a34',298,24,36,10); F('#4b3426',310,58,12,16); F('#f3d27a',312,40,8,6);
  // city
  F('#262a38',0,170,164,118);
  for(let i=0;i<60;i++)F('#323a52',rnd()*164|0,170+rnd()*118|0,4,1);
  for(const b of [R(8,178,40,52),R(110,184,48,56),R(16,246,44,38)]){
    F('#2c3044',b.x-1,b.y-4,b.w+2,5); F('#3b4058',b.x,b.y,b.w,b.h);
    for(let y=b.y+5;y<b.y+b.h-8;y+=8)for(let x=b.x+4;x<b.x+b.w-5;x+=7)F(rnd()<.45?'#f3d27a':'#4c5373',x,y,4,5);
  }
  F('#15171f',128,226,12,14); F('#f3d27a',129,224,10,1);
  // fargo
  F('#eef3f7',220,170,164,118);
  for(let i=0;i<300;i++)F(rnd()<.5?'#d6e0ea':'#ffffff',220+rnd()*164|0,170+rnd()*118|0,2,1);
  F('#d9d4c8',310,180,60,40); F('#2f6db0',310,180,60,8); F('#f1f4f8',316,182,48,4);
  F('#6b6f7a',334,206,12,14); F('#9fd2f0',314,194,14,9); F('#9fd2f0',352,194,14,9);
  F('#c7372f',256,198,6,10); F('#c7372f',280,198,6,10); F('#f1f4f8',257,200,4,3); F('#f1f4f8',281,200,4,3);
  F('#8a8f9a',235,214,3,12); F('#1d3f73',222,200,30,15); F('#c7372f',222,200,30,3);
  const DIG={'2':['111','001','111','100','111'],'7':['111','001','010','010','010'],'9':['111','101','111','001','111'],'.':['0','0','0','0','1']};
  let tx=230; for(const ch of '2.79'){const m=DIG[ch]; m.forEach((row,ry)=>[...row].forEach((c,rx)=>{if(c==='1')F('#ffd84d',tx+rx,206+ry,1,1)})); tx+=m[0].length+1}
  for(let y=244;y<284;y+=8){F('#9a7b66',236,y,140,4); for(let x=240;x<374;x+=6){F('#7d2b52',x,y+1,3,2);F('#4f9a3c',x+1,y-2,1,3)}}
  // roads
  const road=(x,y,w,h)=>{F('#c9a46b',x,y,w,h); for(let i=0;i<w*h/30;i++)F('#b8935b',x+rnd()*w|0,y+rnd()*h|0,1,1)};
  road(0,150,WW,14); road(184,164,16,124); road(187,140,10,12);
  road(42,74,12,76); road(310,74,12,76); road(72,164,12,92); road(72,244,72,12); road(298,164,10,66); road(298,222,48,10);
  // kitchen
  F('#7f3434',166,104,52,12); F('#8f3d3d',170,100,44,6); F('#5a4a44',204,92,6,12);
  F('#f0dcc0',170,116,44,26); F('#e2cba9',170,116,44,2);
  F('#6b4430',186,128,12,14); F('#e8b04a',196,134,1,2); F('#a99a86',184,141,16,2);
  F('#ffd98a',174,122,8,7); F('#ffd98a',202,122,8,7); F('#a8794f',174,125,8,1); F('#a8794f',202,125,8,1);
  // trees
  // pen gate (bottom fence, hens squeeze under it)
  F('#8a5a34',112,117,16,3); F('#6b4428',112,118,16,1); F('#5a3a22',112,117,1,3); F('#5a3a22',127,117,1,3);
})();

// The barn is a sprite too, so you (and the hens) can walk behind it.
const barnSprite=document.createElement('canvas'); barnSprite.width=64; barnSprite.height=52;
(function(){const g=barnSprite.getContext('2d'); g.translate(-16,-22); const F=(c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};
  F('#7a2a22',16,26,64,10); F('#8f3328',20,22,56,6); F('#b7412e',20,36,56,38);
  for(let y=40;y<74;y+=5)F('#a5392a',20,y,56,1);
  F('#f1e3c9',38,52,20,22); F('#5a2a20',40,54,16,20); F('#f1e3c9',40,54,16,1);
  g.strokeStyle='#f1e3c9';g.lineWidth=1;g.beginPath();g.moveTo(40.5,54.5);g.lineTo(55.5,73.5);g.moveTo(55.5,54.5);g.lineTo(40.5,73.5);g.stroke();
  F('#f1e3c9',26,40,8,6);F('#f1e3c9',62,40,8,6);
})();
const drawBarn=()=>ctx.drawImage(barnSprite,16,22);

// Trees are drawn as sprites, depth-sorted with people, so you can walk behind them.
const treeSprite=document.createElement('canvas'); treeSprite.width=12; treeSprite.height=17;
(function(){const g=treeSprite.getContext('2d'); const F=(c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};
  F('#6b4a2f',5,13,3,4); F('#2f6b36',0,2,12,11); F('#3d8443',2,0,8,6); F('#4d9a50',3,3,3,3);})();
const drawTree=(x,y)=>ctx.drawImage(treeSprite,x-6,y-16);

// ---------- scenes ----------
// Each place you can be is a scene: its size, background, what blocks you, its doors,
// and hooks for animating/drawing. game.js runs whichever scene you're in.
const SCENES={};
SCENES.world={
  w:WW, h:WH, bounds:R(2,10,WW-4,WH-12), bg, solids, triggers,
  entries:{start:{x:192,y:156,dir:'down'}, fromKitchen:{x:192,y:157,dir:'down'}, fromCity:{x:134,y:256,dir:'down'}, fromFargo:{x:340,y:238,dir:'down'}},
  hud:()=>farmHud(),
  dynTrigger:()=>farmTrigger(),
  ambient(dt){
    for(const r of rain){r.y+=dt*.25;r.x-=dt*.05;if(r.y>288){r.y=170;r.x=rnd()*170}if(r.x<0)r.x+=164}
    for(const s of snow){s.y+=dt*s.s*.12;s.x+=Math.sin((time+s.y*40)/600)*.15;if(s.y>288){s.y=170;s.x=220+rnd()*164}}
    if(Math.random()<dt/400)smoke.push({x:207,y:90,a:1});
    for(const p of smoke){p.y-=dt*.012;p.x+=dt*.004;p.a-=dt/2600} while(smoke.length&&smoke[0].a<=0)smoke.shift();
    farmAmbient(dt);
  },
  update(dt){farmUpdate(dt)},
  under(){
    ctx.save(); ctx.translate(316,38); ctx.rotate(time/1400);   // windmill blades
    for(let k=0;k<4;k++){ctx.rotate(Math.PI/2); ctx.fillStyle='#7a5a3c'; ctx.fillRect(-1,2,2,22); ctx.fillStyle='#f2ead8'; ctx.fillRect(1,6,6,17)}
    ctx.restore(); ctx.fillStyle='#4b3426'; ctx.fillRect(314,36,4,4);
    drawCupcake();
    for(const p of smoke){ctx.fillStyle=`rgba(240,240,240,${Math.max(0,p.a)*.7})`;ctx.fillRect(Math.round(p.x),Math.round(p.y),3,3)}
  },
  ents(list){trees.forEach(([x,y])=>list.push({y,draw:()=>drawTree(x,y)})); list.push({y:74,draw:drawBarn}); farmEntities(list)},
  over(){
    farmOverlay();
    ctx.fillStyle='#c7372f';ctx.fillRect(244,184,52,6);ctx.fillStyle='#f1f4f8';ctx.fillRect(244,189,52,2);   // gas canopy
    ctx.fillStyle='#8a8f9a';ctx.fillRect(246,191,2,14);ctx.fillRect(292,191,2,14);
    ctx.save(); ctx.beginPath(); ctx.rect(0,170,164,118); ctx.clip();                                        // city: dark, rain, searchlight
    ctx.fillStyle='rgba(10,12,30,.28)'; ctx.fillRect(0,170,164,118);
    const ang=Math.sin(time/1800)*.6;
    ctx.fillStyle='rgba(255,240,180,.08)'; ctx.beginPath(); ctx.moveTo(78,288);
    ctx.lineTo(78+Math.sin(ang-.12)*220,288-Math.cos(ang-.12)*220); ctx.lineTo(78+Math.sin(ang+.12)*220,288-Math.cos(ang+.12)*220); ctx.fill();
    ctx.fillStyle='rgba(170,190,230,.55)'; for(const r of rain)ctx.fillRect(Math.round(r.x),Math.round(r.y),1,3);
    ctx.restore();
    ctx.fillStyle='#ffffff'; for(const s of snow)ctx.fillRect(Math.round(s.x),Math.round(s.y),1,1);
  },
};
