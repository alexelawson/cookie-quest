// The overworld: size, collision boxes, doors, and the one-time painting of the map.
// Other places you can walk into (kitchen, city rooftops) are separate scenes; see kitchen.js and city.js.
const WW=384, WH=288, VW=224, VH=168;
const cv=document.getElementById('game'), ctx=cv.getContext('2d'); ctx.imageSmoothingEnabled=false;
const R=(x,y,w,h)=>({x,y,w,h});
const REG={farm:R(0,0,164,144), mill:R(220,0,164,144), city:R(0,170,164,118), fargo:R(220,170,164,118)};
const trees=[[172,30],[212,30],[172,64],[212,64],[100,192],[54,236],[170,200],[214,228],[110,154],[270,154]];
// snowy pines around the Birkie trailhead, dark pines in Wylee Woods (the disc golf entrance)
const pines=[[228,14],[244,30],[262,12],[284,26],[232,52],[268,48],[290,62],[352,10],[372,24],[358,44],[378,62],[346,30],[236,74]];
const woods=[[168,250],[176,240],[171,270],[166,284],[212,248],[217,262],[211,282],[218,242]];
const solids=[
  R(20,30,56,44),                                            // barn
  R(90,60,60,3),R(90,117,60,3),R(90,60,3,60),R(147,60,3,60), // pen fence
  R(338,104,32,20),                                          // yurt
  R(291,62,4,5),R(338,62,4,5),                               // Birkie arch posts
  R(237,90,10,14),R(261,90,10,14),R(273,124,10,14),          // parked cars
  R(327,77,8,4),                                             // John
  R(178,282,4,4),R(201,282,4,4),                             // Wylee Woods arch posts
  R(166,98,52,42),                                           // farmhouse (your kitchen)
  R(67,204,3,3),R(103,260,3,3),                              // city streetlamps
  R(8,178,40,52),R(110,184,48,56),R(0,242,64,46),R(94,224,6,4),   // city towers, the water, the steam clock
  R(310,180,60,40),R(256,198,6,10),R(280,198,6,10),R(235,214,3,12), // gas shop, pumps, sign pole
  ...[...trees,...pines,...woods].map(([x,y])=>R(x-3,y-3,6,4)),
];
const triggers=[
  {z:R(320,70,24,18),  label:'Talk to John', btn:'Talk', act:()=>talkJohn()},
  {z:R(124,240,20,12), label:'Take the elevator up', act:()=>goTo('city','fromStreet')},
  {z:R(330,220,20,12), label:'Drive into Fargo',   act:()=>goTo('fargo','fromHighway')},
  {z:R(182,142,20,10), label:'Enter your kitchen', act:()=>goTo('kitchen','fromDoor')},
  {z:R(184,276,16,10), label:'Go to the disc golf course', act:()=>goTo('golf','fromRoad')},
  // Keelan's trigger moves with him; see farm.js
];
// ---------- tiny pixel font ----------
const GLYPH={'0':'111101101101111','1':'010110010010111','2':'111001111100111','3':'111001111001111','4':'101101111001001',
  '5':'111100111001111','6':'111100111101111','7':'111001010010010','8':'111101111101111','9':'111101111001111',
  '?':'111001011000010','F':'111100110100100','A':'010101111101101','R':'110101110101101','G':'011100101101011','O':'010101101101010',
  'B':'110101110101110','C':'011100100100011','D':'110101101101110','E':'111100110100111','I':'111010010010111','K':'101101110101101',
  'L':'100100100100111','M':'1000111011101011000110001','N':'10011101101110011001','S':'011100010001110','W':'1000110001101011101110001','Y':'101101010010010',
  'T':'111010010010010','H':'101101111101101','P':'110101110100100','U':'101101101101111','V':'101101101101010',"'":'11000','X':'101101010101101','<':'001010100010001','>':'100010001010100'};
function pixText(g,str,x,y,color){
  g.fillStyle=color;
  for(const ch of str){
    if(ch==='.'){g.fillRect(x,y+4,1,1); x+=2; continue}
    const m=GLYPH[ch], w=m?m.length/5:3; if(m)for(let i=0;i<m.length;i++)if(m[i]==='1')g.fillRect(x+i%w,y+(i/w|0),1,1);
    x+=w+1;   // most letters are 3 wide; M, N and W are wider
  }
}

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
  // a worn footpath from the road up to the barn door...
  for(let y=74;y<150;y++){const x=45+Math.round(Math.sin(y/9)*2); F('#c9ad74',x,y,8,1); if(y%5===0)F('#b39760',x+1+(y%3),y,2,1)}
  for(let i=0;i<14;i++)F('#8cc866',44+rnd()*10|0,76+rnd()*72|0,1,2);
  // ...and a fainter trodden trail that forks off and sneaks around the side of the barn (toward the cupcake)
  for(let y=24;y<96;y++){const x=9+Math.round(Math.sin(y/7)); F('#a9c56f',x,y,3,1)}
  for(let x=12;x<47;x++)F('#a9c56f',x,19+Math.round(Math.sin(x/6)),3,1);
  for(let x=12;x<45;x++){const y=96+Math.round((x-12)*.12); F('#a9c56f',x,y,3,1)}
  F('#e54b7a',10,30,1,1); F('#f4d35e',12,46,1,1); F('#5fa8e8',9,63,1,1); F('#ffffff',24,20,1,1);   // a few stray sprinkles
  // Birkie trailhead: snow, a groomed trail heading north under the arch, a parking lot, the yurt
  F('#eef3f7',220,0,164,144);
  for(let i=0;i<260;i++)F(rnd()<.5?'#d6e0ea':'#ffffff',220+rnd()*164|0,rnd()*144|0,2,1);
  F('#f7fafc',300,0,32,76); for(let y=0;y<76;y+=2)F('#e1e9f0',302,y,28,1);       // corduroy
  F('#c4d0dc',304,0,1,76); F('#c4d0dc',308,0,1,76); F('#c4d0dc',324,0,1,76); F('#c4d0dc',328,0,1,76);   // classic tracks
  F('#5d636e',230,86,80,56); for(let i=0;i<120;i++)F('#555a64',230+rnd()*80|0,86+rnd()*56|0,2,1);    // parking lot
  F('#dfe6ec',230,86,78,2); F('#dfe6ec',230,140,78,2);                                               // plowed snowbanks
  for(let x=233;x<300;x+=12){F('#e8e8e0',x,89,1,16); F('#e8e8e0',x,123,1,16)}
  const car=(x,y,c,rack)=>{F('rgba(0,0,0,.25)',x+1,y+14,10,2); F(c,x,y,10,15); F('#9fc4dc',x+1,y+2,8,3); F('#9fc4dc',x+1,y+11,8,2); F('#ffffff',x,y,10,1);
    if(rack){F('#2b2b2b',x+1,y+5,8,1); F('#2b2b2b',x+1,y+9,8,1); F('#c8322b',x+2,y+5,1,5); F('#ffc62f',x+5,y+5,1,5)} };
  car(237,90,'#2f6b36',true); car(261,90,'#2f6db0',false); car(273,124,'#8a8f9a',true);
  // city (Vancouver, in the rain): glass towers with rooftop gardens, a green bike lane, the Gastown steam clock, the seawall
  F('#262a38',0,170,164,118);
  for(let i=0;i<60;i++)F('#323a52',rnd()*164|0,170+rnd()*118|0,4,1);
  for(let x=0;x<164;x+=8)for(let y=172;y<288;y+=8)F('#2d3242',x,y,1,1);                         // sidewalk slabs
  const glass=(b,base,line,shine)=>{F(base,b.x,b.y,b.w,b.h);
    for(let y=b.y+3;y<b.y+b.h-8;y+=4)F(line,b.x,y,b.w,1); for(let x=b.x+4;x<b.x+b.w;x+=5)F(line,x,b.y,1,b.h-8);   // floors + mullions
    for(let k=0;k<b.h-8;k++){const x=b.x+b.w-6-Math.floor(k*.6); if(x>b.x)F(shine,x,b.y+k,2,1)}                    // a reflection streak
    for(let y=b.y+4;y<b.y+b.h-10;y+=4)for(let x=b.x+1;x<b.x+b.w-3;x+=5)if(rnd()<.22)F('#f3d27a',x,y,3,2)};          // a few lit windows
  // a teal glass tower with a green roof garden
  {const b=R(8,178,40,52); F('#1d3a42',b.x-1,b.y-5,b.w+2,6); F('#3d6b3a',b.x+2,b.y-5,b.w-4,4);
    for(let x=b.x+4;x<b.x+b.w-4;x+=7){F('#4f8a45',x,b.y-6,4,3); F('#62a356',x+1,b.y-6,2,1)}
    glass(b,'#2f5f6f','#29525f','#6fb0c0'); F('#ffe9a8',b.x+12,b.y+b.h-8,16,8); F('#d9c27a',b.x+19,b.y+b.h-8,1,8)}   // glowing lobby
  // the tall blue one: a stepped glass crown, and an elevator lobby (the way up to the rooftops)
  {const b=R(110,184,48,56); F('#1c2c44',b.x+6,b.y-8,b.w-12,4); F('#1c2c44',b.x-1,b.y-5,b.w+2,6); F('#4f8fd0',b.x+8,b.y-8,b.w-16,1);
    glass(b,'#2c4a6e','#243d5c','#7fb0e0'); F('#ffe9a8',126,b.y+b.h-10,16,10); F('#d9c27a',134,b.y+b.h-10,1,10); F('#9aa3b2',125,b.y+b.h-11,18,1)}
  // the seawall and False Creek
  F('#1e3a52',0,244,62,44); for(let i=0;i<40;i++)F('#2a4c68',rnd()*60|0,246+rnd()*40|0,5,1);
  F('#8a8f9a',0,242,63,2); F('#8a8f9a',62,242,2,46); F('#6b6f7a',0,244,62,1);
  // the green bike lane next to the street
  F('#3f8a4a',86,170,4,74); for(let y=180;y<240;y+=22){F('#e8eef0',87,y,2,1); F('#e8eef0',86,y+2,1,2); F('#e8eef0',89,y+2,1,2)}
  // fargo
  F('#cdb978',220,170,164,118);                                                                            // fargo: dry, flat, summer
  for(let i=0;i<360;i++)F(['#bfa865','#d9c98e','#a9a35a'][i%3],220+rnd()*164|0,170+rnd()*118|0,2,1);
  F('#d9d4c8',310,180,60,40); F('#2f6db0',310,180,60,8); F('#1d3f73',314,181,52,7); pixText(g,'GAS N SNACKS',316,182,'#ffffff');
  F('#6b6f7a',334,206,12,14); F('#9fd2f0',314,194,14,9); F('#9fd2f0',352,194,14,9);
  F('#c7372f',256,198,6,10); F('#c7372f',280,198,6,10); F('#f1f4f8',257,200,4,3); F('#f1f4f8',281,200,4,3);
  F('#8a8f9a',235,214,3,12); F('#1d3f73',222,200,30,15); F('#c7372f',222,200,30,3);
  const DIG={'2':['111','001','111','100','111'],'7':['111','001','010','010','010'],'9':['111','101','111','001','111'],'.':['0','0','0','0','1']};
  let tx=230; for(const ch of '2.79'){const m=DIG[ch]; m.forEach((row,ry)=>[...row].forEach((c,rx)=>{if(c==='1')F('#ffd84d',tx+rx,206+ry,1,1)})); tx+=m[0].length+1}
  for(let y=244;y<284;y+=8){F('#9a7b66',236,y,140,4); for(let x=240;x<374;x+=6){F('#7d2b52',x,y+1,3,2);F('#4f9a3c',x+1,y-2,1,3)}}
  // roads
  const road=(x,y,w,h)=>{F('#c9a46b',x,y,w,h); for(let i=0;i<w*h/30;i++)F('#b8935b',x+rnd()*w|0,y+rnd()*h|0,1,1)};
  road(0,150,WW,14); road(184,164,16,124); road(187,140,10,12);
  road(310,74,12,76); road(298,164,10,66); road(298,222,48,10);
  // city streets: wet asphalt, dashed lines, puddles reflecting the lights, a manhole (it steams)
  F('#22252f',72,164,12,92); F('#22252f',72,244,72,12); F('#3a3f50',71,164,1,80); F('#3a3f50',84,164,1,80);
  for(let y=168;y<244;y+=8)F('#c9a640',77,y,2,4); for(let x=88;x<144;x+=8)F('#c9a640',x,249,4,2);
  for(const [x,y,w] of [[74,186,8],[96,252,12],[74,232,6]]){F('#2e3a55',x,y,w,3); F('#f3d27a',x+2,y+1,w-5,1)}
  F('#14161f',75,214,6,4); F('#30343f',76,215,4,2);
  // Wylee Woods: forest floor around the end of the south road (the arch itself is a sprite)
  F('#3f6b3a',164,236,56,52); for(let i=0;i<160;i++)F(rnd()<.5?'#355c31':'#4d7d45',164+rnd()*56|0,236+rnd()*52|0,1,1);
  for(let i=0;i<30;i++)F('#7a5a3a',164+rnd()*56|0,236+rnd()*52|0,1,1);
  road(184,236,16,52); for(let i=0;i<16;i++)F('#5a7f3f',184+rnd()*16|0,240+rnd()*48|0,1,1);
  // your kitchen: an old white farmhouse with a gray shingle roof, a front gable, green shutters and a wraparound porch
  F('#8a3a2a',172,76,6,14); F('#6b2a1e',172,76,6,2); F('#a54a36',173,80,4,1); F('#a54a36',173,85,4,1);   // brick chimney
  F('#5f6470',164,86,56,20); F('#3f434c',164,86,56,2); for(let y=89;y<106;y+=3)F('#4f545e',164,y,56,1);   // shingle roof
  for(let k=0;k<13;k++){const y=80+k, hw=k+1; F('#4f545e',192-hw-2,y,hw*2+4,1); if(k>1)F('#f2efe6',192-hw+1,y,hw*2-2,1)}   // front gable
  F('#ffd98a',189,86,6,5); F('#cbb67a',191,86,1,5); F('#cbb67a',189,88,6,1);                               // attic window
  F('#f2efe6',168,104,48,24); for(let y=106;y<128;y+=3)F('#dcd6c8',168,y,48,1);                            // white clapboard
  for(const x of [172,204]){F('#ffd98a',x,109,8,10); F('#cbb67a',x+3,109,1,10); F('#cbb67a',x,113,8,1); F('#2f5a3a',x-3,109,3,10); F('#2f5a3a',x+8,109,3,10)}
  F('#2f5a3a',187,112,10,16); F('#26493a',187,112,10,1); F('#e8b04a',195,120,1,2);                         // front door
  F('#3d8443',189,114,6,6); F('#2f5a3a',191,116,2,2); F('#c8322b',191,119,2,2);                            // wreath with a bow
  F('#7d8290',164,126,56,3); F('#9a9fab',164,126,56,1);                                                    // porch roof
  for(let x=166,i=0;x<219;x+=4,i++)F(['#e54b4b','#f4d35e','#4fbf73','#5fa8e8'][i%4],x,129,1,1);           // Christmas lights
  F('#8a6a4a',164,137,56,5); F('#755a3e',164,139,56,1);                                                    // porch floor
  for(const x of [165,177,206,217])F('#f2efe6',x,129,2,9);                                                 // posts
  F('#f2efe6',164,133,20,1); F('#f2efe6',200,133,20,1); for(let x=167;x<184;x+=3)F('#e4ded0',x,133,1,4); for(let x=202;x<217;x+=3)F('#e4ded0',x,133,1,4);   // railings
  F('#6b4430',209,131,4,6); F('#6b4430',208,136,6,1);                                                      // rocking chair
  F('#a99a86',186,142,12,2);                                                                              // steps
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
const makePine=(dark,snowy)=>{const c=document.createElement('canvas'); c.width=12; c.height=20; const g=c.getContext('2d'); const F=(col,x,y,w,h)=>{g.fillStyle=col;g.fillRect(x,y,w,h)};
  F('#5a3d26',5,16,2,4); F(dark,1,11,10,6); F(dark,2,6,8,6); F(dark,4,1,4,6); F(dark,5,0,2,1);
  if(snowy){F('#ffffff',1,11,4,1); F('#ffffff',7,11,3,1); F('#ffffff',2,6,3,1); F('#ffffff',7,6,2,1); F('#ffffff',4,1,4,1)}
  else{F('#3f7a45',3,8,2,2); F('#3f7a45',6,13,2,2); F('#3f7a45',5,3,1,2)} return c};
const snowPine=makePine('#2b5a3a',true), darkPine=makePine('#1f4a2c',false);
const drawPine=(x,y,s)=>ctx.drawImage(s,x-6,y-19);

// The two arches are sprites too, so you walk under the banner.
const archSprite=(w,h,draw)=>{const c=document.createElement('canvas'); c.width=w; c.height=h; draw(c.getContext('2d')); return c};
// American Birkebeiner start arch over the trail: posts at x 291 and 338, banner on top
const birkArch=archSprite(52,30,g=>{const F=(c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};
  F('#8a8f9a',1,0,3,30); F('#8a8f9a',48,0,3,30); F('#6b6f7a',3,0,1,30); F('#6b6f7a',50,0,1,30);
  F('#1d3f73',0,2,52,16); F('#c8322b',0,2,52,2); F('#c8322b',0,16,52,2);
  pixText(g,'AMERICAN',9,5,'#ffffff'); pixText(g,'BIRKEBEINER',4,11,'#ffffff')});
// Wylee Woods log arch over the south road
const woodsArch=archSprite(30,32,g=>{const F=(c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};
  F('#6b4a2f',2,4,3,28); F('#6b4a2f',25,4,3,28); F('#5a3d26',4,4,1,28); F('#5a3d26',27,4,1,28);
  F('#7a5636',0,2,30,4); F('#5a3d26',0,5,30,1); F('#8f6a46',2,2,26,1);          // log crossbar
  F('#3c2a1c',4,6,1,2); F('#3c2a1c',25,6,1,2);                                  // ropes
  F('#e9d9b4',3,8,24,15); F('#c8b48a',3,22,24,1); F('#c8b48a',3,8,24,1);
  pixText(g,'WYLEE',5,10,'#2f5a32'); pixText(g,'WOODS',5,16,'#2f5a32');
  F('#3d8443',0,0,5,3); F('#3d8443',24,0,6,3); F('#4d9a50',2,0,2,1); F('#4d9a50',26,0,2,1)});   // moss
const yurt=archSprite(36,32,g=>{const F=(c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};
  F('rgba(0,0,0,.2)',2,29,32,3);
  F('#e8dcc0',2,14,32,16); F('#d6c7a4',2,14,32,2); for(let x=4;x<34;x+=5)F('#d6c7a4',x,16,1,14);   // canvas walls, lattice
  F('#2f6b8a',2,24,32,2);                                                                             // band
  F('#c94a3a',0,10,36,5); F('#c94a3a',4,6,28,5); F('#c94a3a',10,2,16,5); F('#a63a2d',0,14,36,1);       // roof
  F('#e8dcc0',15,1,6,2); F('#4b4b52',24,0,2,6);                                                       // crown, stovepipe
  F('#2f6b8a',14,19,8,11); F('#ffd98a',16,21,4,3); F('#1f4a63',14,19,8,1)});                          // door + window glow

// ---------- scenes ----------
// Each place you can be is a scene: its size, background, what blocks you, its doors,
// and hooks for animating/drawing. game.js runs whichever scene you're in.
const SCENES={};
SCENES.world={
  w:WW, h:WH, bounds:R(2,10,WW-4,WH-12), bg, solids, triggers,
  entries:{start:{x:192,y:156,dir:'down'}, fromKitchen:{x:192,y:157,dir:'down'}, fromCity:{x:134,y:256,dir:'down'}, fromFargo:{x:340,y:238,dir:'down'}, fromGolf:{x:192,y:266,dir:'up'}, fromMill:{x:316,y:92,dir:'down'}},
  hud:()=>farmHud(),
  dynTrigger:()=>farmTrigger(),
  ambient(dt){
    for(const r of rain){r.y+=dt*.25;r.x-=dt*.05;if(r.y>288){r.y=170;r.x=rnd()*170}if(r.x<0)r.x+=164}
    for(const s of snow){s.y+=dt*s.s*.12;s.x+=Math.sin((time+s.y*40)/600)*.15;if(s.y>144){s.y=0;s.x=220+rnd()*164}}   // snowing at the Birkie trailhead
    if(Math.random()<dt/400)smoke.push({x:174,y:72,a:1}); if(Math.random()<dt/300)smoke.push({x:77,y:212,a:.8}); if(Math.random()<dt/500)smoke.push({x:361,y:92,a:1});
    for(const p of smoke){p.y-=dt*.012;p.x+=dt*.004;p.a-=dt/2600} while(smoke.length&&smoke[0].a<=0)smoke.shift();
    farmAmbient(dt);
  },
  update(dt){farmUpdate(dt)},
  under(){
    drawCupcake();
    for(const p of smoke){ctx.fillStyle=`rgba(240,240,240,${Math.max(0,p.a)*.7})`;ctx.fillRect(Math.round(p.x),Math.round(p.y),3,3)}
  },
  ents(list){trees.forEach(([x,y])=>list.push({y,draw:()=>drawTree(x,y)}));
    pines.forEach(([x,y])=>list.push({y,draw:()=>drawPine(x,y,snowPine)})); woods.forEach(([x,y])=>list.push({y,draw:()=>drawPine(x,y,darkPine)}));
    list.push({y:67,draw:()=>ctx.drawImage(birkArch,290,38)}); list.push({y:286,draw:()=>ctx.drawImage(woodsArch,176,254)});
    list.push({y:124,draw:()=>ctx.drawImage(yurt,336,94)}); list.push({y:81,draw:()=>drawTrailJohn(331,81,trailJohnDir())}); list.push({y:74,draw:drawBarn}); farmEntities(list)},
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
    for(const [x,y] of [[68,206],[104,262]]){ctx.fillStyle='#4a4f60'; ctx.fillRect(x,y-16,1,16); ctx.fillRect(x-1,y-17,4,1); ctx.fillStyle='#ffe9a8'; ctx.fillRect(x+1,y-16,2,2);   // streetlamps
      const gr=ctx.createRadialGradient(x+2,y-8,1,x+2,y-4,20); gr.addColorStop(0,'rgba(255,225,150,.32)'); gr.addColorStop(1,'rgba(255,225,150,0)'); ctx.fillStyle=gr; ctx.fillRect(x-20,y-28,44,40)}
    // the Gastown steam clock (it whistles steam on the quarter hour... here, every few seconds)
    {const x=94,y=228; ctx.fillStyle='#5a3a22'; ctx.fillRect(x,y-22,6,22); ctx.fillStyle='#7a5232'; ctx.fillRect(x+1,y-20,4,18); ctx.fillStyle='#c9a24a'; ctx.fillRect(x-1,y-23,8,2); ctx.fillRect(x-1,y-2,8,2);
      ctx.fillStyle='#f2efe6'; ctx.fillRect(x+1,y-18,4,4); ctx.fillStyle='#2b2b2b'; ctx.fillRect(x+3,y-17,1,2); ctx.fillRect(x+3,y-16,2,1);
      ctx.fillStyle='#c9a24a'; ctx.fillRect(x+2,y-26,2,3); if(Math.floor(time/2600)%3===0){ctx.fillStyle='rgba(235,235,240,.55)'; const t=(time%2600)/2600; for(let k=0;k<4;k++)ctx.fillRect(x+1+((k*3+Math.floor(t*6))%5),y-30-k*3-t*6,3,3)}}
    // rain rings on the water, and the little rainbow ferry going back and forth
    ctx.fillStyle='rgba(170,200,230,.45)'; for(let i=0;i<6;i++){const ph=((time/600+i*.37)%1), rx=(i*23+Math.floor(time/600+i*.37)*17)%56+3, ry=250+(i*13+Math.floor(time/600+i*.37)*7)%34, r=1+ph*3; ctx.fillRect(rx-r,ry,r*2,1)}
    {const bx=Math.round(10+(Math.sin(time/5000)+1)*18), by=270; ctx.fillStyle='rgba(0,0,0,.25)'; ctx.fillRect(bx,by+5,14,2); ctx.fillStyle='#f2efe6'; ctx.fillRect(bx,by,14,5);
      ['#e54b4b','#f4a03a','#f4d35e','#4fbf73','#5fa8e8'].forEach((c,i)=>{ctx.fillStyle=c; ctx.fillRect(bx+2+i*2,by-2,2,2)}); ctx.fillStyle='#ffe9a8'; ctx.fillRect(bx+3,by+1,8,1)}
    ctx.fillStyle='#7d8694'; ctx.fillRect(150,170,1,10); if(Math.floor(time/700)%2){ctx.fillStyle='#ff3b3b'; ctx.fillRect(149,170,3,2)}   // antenna
    if(have.city){ // the cookie signal, up on the clouds
      ctx.fillStyle='rgba(255,240,180,.22)'; ctx.beginPath(); ctx.ellipse(46,184,16,9,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='rgba(30,22,16,.55)'; ctx.beginPath(); ctx.arc(46,184,6,0,Math.PI*2); ctx.fill(); ctx.fillStyle='rgba(255,240,180,.5)'; ctx.fillRect(43,182,2,2); ctx.fillRect(48,185,2,2); ctx.fillRect(45,187,1,1)}
    ctx.restore();
    ctx.fillStyle='#ffffff'; for(const s of snow)ctx.fillRect(Math.round(s.x),Math.round(s.y),1,1);
  },
};
