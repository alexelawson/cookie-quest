// The overworld: size, collision boxes, doors, and the one-time painting of the map.
// Other places you can walk into (kitchen, city rooftops) are separate scenes; see kitchen.js and city.js.
const WW=384, WH=288, VW=224, VH=168;
const cv=document.getElementById('game'), ctx=cv.getContext('2d'); ctx.imageSmoothingEnabled=false;
const R=(x,y,w,h)=>({x,y,w,h});
const REG={farm:R(0,0,164,144), mill:R(220,0,164,144), city:R(0,170,164,118), fargo:R(220,170,164,118)};
const trees=[[172,30],[212,30],[172,64],[212,64],[214,228],[110,154],[270,154]];
// snowy pines around the Birkie trailhead, dark pines in Wylee Woods (the disc golf entrance)
const pines=[[228,14],[244,30],[262,12],[284,26],[232,52],[268,48],[290,62],[352,10],[372,24],[358,44],[378,62],[346,30],[236,74]];
const cedars=[[100,194],[62,224],[154,252]];   // mossy cedars in the city
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
  R(108,16,52,30),                                           // Bryan's pond (he's out in his boat)
  R(67,204,3,3),R(103,258,3,3),                              // city streetlamps
  R(8,178,40,52),R(110,184,48,56),R(0,244,72,44),R(72,264,92,24),R(94,224,6,4),   // city towers, the ocean, the steam clock
  R(310,180,60,40),R(256,198,6,10),R(280,198,6,10),R(235,214,3,12), // gas shop, pumps, sign pole
  ...[...trees,...pines,...woods,...cedars].map(([x,y])=>R(x-3,y-3,6,4)),
];
const triggers=[
  {z:R(320,70,24,18),  label:'Talk to John', btn:'Talk', act:()=>talkJohn()},
  {z:R(86,36,26,16),   label:'Talk to Bryan', btn:'Talk', act:()=>talkBryan()},
  {z:R(124,240,20,12), label:'Take the elevator up', act:()=>openWardrobe(()=>{ heist.outfitReact=true; goTo('city','fromStreet') })},
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
  'T':'111010010010010','H':'101101111101101','P':'110101110100100','U':'101101101101111','V':'101101101101010',"'":'11000',':':'01010','X':'101101010101101','Q':'010101101111011','<':'001010100010001','>':'100010001010100','J':'001001001101010','Z':'111001010100111'};
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
  // Each land has its own ground, with a soft ragged edge where it meets the meadow (no hard lines):
  // the farm is lush green, the Birkie snowy, Fargo dry summer grass, Vancouver wet pavement, Wylee Woods forest floor.
  const soft=(r,col,sides='tblr')=>{   // a few pixels of the land's color spilling over its edges
    if(sides.includes('b'))for(let x=r.x;x<r.x+r.w;x++){const d=(rnd()<.5)+(rnd()<.25); if(d)F(col,x,r.y+r.h,1,d)}
    if(sides.includes('t'))for(let x=r.x;x<r.x+r.w;x++){const d=(rnd()<.5)+(rnd()<.25); if(d)F(col,x,r.y-d,1,d)}
    if(sides.includes('r'))for(let y=r.y;y<r.y+r.h;y++){const d=(rnd()<.5)+(rnd()<.25); if(d)F(col,r.x+r.w,y,d,1)}
    if(sides.includes('l'))for(let y=r.y;y<r.y+r.h;y++){const d=(rnd()<.5)+(rnd()<.25); if(d)F(col,r.x-d,y,d,1)}};
  F('#6fae4d',0,0,WW,WH);                                                                   // the meadow in between
  for(let i=0;i<260;i++)F(rnd()<.5?'#67a446':'#78b755',rnd()*WW|0,rnd()*WH|0,1,1);
  // farm: a slightly brighter, mown green
  F('#79ba56',0,0,164,144); soft(R(0,0,164,144),'#79ba56','br');
  for(let i=0;i<160;i++)F('#86c562',rnd()*164|0,rnd()*144|0,1,1);
  for(let x=0;x<164;x+=12)F('rgba(255,255,255,.035)',x,0,6,144);                           // faint mowing stripes
  const meadow=(x,y)=>!(x>=220&&y<150)&&!(y>=166&&(x<166||x>=218))&&!(y>=148&&y<166);       // grass, not snow/sand/city/road
  for(let i=0;i<120;i++){const x=rnd()*WW|0, y=rnd()*WH|0; if(!meadow(x,y))continue; F('#5a9a3e',x,y,1,2); F('#5a9a3e',x+2,y,1,2); F('#62a245',x+1,y-1,1,3)}   // a few grass tufts
  // wildflowers, in a few tidy patches instead of everywhere
  for(const [cx,cy,n] of [[156,138,9],[94,132,8],[150,14,7],[10,140,6]])for(let i=0;i<n;i++){
    const x=cx+(rnd()*16-8|0), y=cy+(rnd()*8-4|0), c=['#ffffff','#f4d35e','#f2a7c8','#c9b7f0'][i%4];
    F(c,x-1,y,1,1); F(c,x+1,y,1,1); F(c,x,y-1,1,1); F(c,x,y+1,1,1); F(i%4===1?'#e8742a':'#f4d35e',x,y,1,1)}
  F('#b9905c',93,63,54,54); for(let i=0;i<120;i++)F('#a67f4e',93+rnd()*54|0,63+rnd()*54|0,1,1);
  F('#f1e3c9',90,60,60,3);F('#f1e3c9',90,117,60,3);F('#f1e3c9',90,60,3,60);F('#f1e3c9',147,60,3,60);
  for(let x=90;x<150;x+=8){F('#b8a07a',x,59,2,4);F('#b8a07a',x,116,2,4)} for(let y=60;y<120;y+=8){F('#b8a07a',89,y,4,2);F('#b8a07a',146,y,4,2)}
  for(let i=0;i<80;i++)F(rnd()<.6?'#e8c35a':'#d9b04a',94+rnd()*52|0,64+rnd()*52|0,2,1);                                  // straw
  F('#7a5232',128,66,14,5); F('#5a3d26',128,70,14,1); F('#e8c35a',129,66,12,2); F('#d9a63a',131,66,2,1); F('#d9a63a',136,67,2,1);   // feed trough
  F('#8a8f9a',97,104,8,5); F('#5fa8e8',98,105,6,3); F('#9fd2f0',99,105,2,1);             // water dish
  // hay bales by the barn
  for(const [hx,hy] of [[60,78],[68,80]]){F('rgba(0,0,0,.15)',hx,hy+6,8,2); F('#d9b04a',hx,hy,8,6); F('#e8c35a',hx,hy,8,2); F('#b8903a',hx+2,hy,1,6); F('#b8903a',hx+5,hy,1,6)}
  // Bryan's pond in the corner of the farm, with a little dock
  for(let y=14;y<48;y++){const t=(y-31)/17, hw=Math.sqrt(Math.max(0,1-t*t))*27+Math.sin(y/3)*1.5; F('#3d7fb8',134-hw|0,y,hw*2|0,1)}
  for(let y=18;y<44;y++){const t=(y-31)/13, hw=Math.sqrt(Math.max(0,1-t*t))*20; F('#4a8ec6',134-hw|0,y,hw*2|0,1)}
  F('#d7ecf8',124,22,6,1); F('#d7ecf8',140,38,5,1); F('#d7ecf8',118,34,4,1);
  for(let x=98;x<114;x+=3){F('#8a6a4a',x,30,2,6)} F('#6b4a2f',98,35,16,1); F('#6b4a2f',99,36,1,3); F('#6b4a2f',112,36,1,3);   // dock
  // (the paths are all drawn together further down, so they match)
  // Birkie trailhead: snow, a groomed trail heading north under the arch, a parking lot, the yurt
  F('#eef3f7',220,0,164,144); soft(R(220,0,164,144),'#eef3f7','lb'); soft(R(219,0,1,144),'#ffffff','l');
  for(let i=0;i<90;i++)F(rnd()<.5?'#dfe7ef':'#ffffff',220+rnd()*164|0,rnd()*144|0,2,1);
  F('#f7fafc',300,0,32,76); for(let y=0;y<76;y+=2)F('#e1e9f0',302,y,28,1);       // corduroy
  F('#5d636e',230,86,80,56); for(let i=0;i<120;i++)F('#555a64',230+rnd()*80|0,86+rnd()*56|0,2,1);    // parking lot
  F('#dfe6ec',230,86,78,2); F('#dfe6ec',230,140,78,2);                                               // plowed snowbanks
  for(let x=233;x<300;x+=12){F('#e8e8e0',x,89,1,16); F('#e8e8e0',x,123,1,16)}
  const car=(x,y,c,rack)=>{F('rgba(0,0,0,.25)',x+1,y+14,10,2); F(c,x,y,10,15); F('#9fc4dc',x+1,y+2,8,3); F('#9fc4dc',x+1,y+11,8,2); F('#ffffff',x,y,10,1);
    if(rack){F('#2b2b2b',x+1,y+5,8,1); F('#2b2b2b',x+1,y+9,8,1); F('#c8322b',x+2,y+5,1,5); F('#ffc62f',x+5,y+5,1,5)} };
  car(237,90,'#2f6b36',true); car(261,90,'#2f6db0',false); car(273,124,'#8a8f9a',true);
  // city (Vancouver, in the rain): glass towers with rooftop gardens, a green bike lane, the Gastown steam clock, moss, the beach, freighters, mountains
  F('#262a38',0,170,164,118); F('#4a5064',0,168,164,2); F('#4a5064',164,168,2,68); F('#5a6278',0,168,164,1);   // a curb all the way round
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
  // moss everywhere: in the sidewalk cracks, along the curbs, on the tower roofs
  for(let i=0;i<220;i++){const x=rnd()*164|0, y=170+rnd()*90|0; F(rnd()<.5?'#3a5e36':'#4a7442',x,y,1+(rnd()*3|0),1)}
  for(let x=0;x<70;x+=3)F(rnd()<.5?'#3a5e36':'#4a7442',x,231,2,1); for(let x=8;x<48;x+=2)F('#4a7442',x,229,1,1);
  F('#3a5e36',110,239,48,1); for(let x=110;x<158;x+=3)F('#4a7442',x,238,2,1);
  // the beach (driftwood logs), English Bay, and the North Shore mountains across the water
  F('#cdb98e',0,232,72,12); F('#cdb98e',72,256,92,8); for(let i=0;i<70;i++)F('#bba878',rnd()*164|0,232+rnd()*32|0,1,1);
  for(const [x,y,w] of [[6,236,16],[30,239,12],[50,235,14],[92,259,18],[130,260,14]]){F('#8a7458',x,y,w,2); F('#a8916f',x,y,w,1); F('#6b5a44',x+w-1,y,1,2)}   // driftwood
  F('#1e3a52',0,244,72,44); F('#1e3a52',72,264,92,24); F('#e8eef0',0,244,72,1); F('#e8eef0',72,264,92,1);   // ocean, little waves at the shore
  for(let i=0;i<70;i++){const x=rnd()*164|0, y=246+rnd()*30|0; if(x>=72&&y<266)continue; F('#2a4c68',x,y,5,1)}
  for(let x=0;x<164;x++){const h=6+Math.round(5*Math.sin(x/9)+3*Math.sin(x/4.3+1)); F('#3a4a62',x,288-h,1,h); if(h>9)F('#e8eef4',x,288-h,1,2)}   // mountains
  for(let x=0;x<164;x+=2){const h=3+Math.round(2*Math.sin(x/5)); F('#2b3a50',x,288-h,2,h)}
  F('rgba(200,210,225,.18)',0,276,164,4);   // mist
  // the green bike lane next to the street
  F('#3f8a4a',86,170,4,74); for(let y=180;y<240;y+=22){F('#e8eef0',87,y,2,1); F('#e8eef0',86,y+2,1,2); F('#e8eef0',89,y+2,1,2)}
  // fargo
  F('#cdb978',220,170,164,118); soft(R(220,170,164,118),'#cdb978','lt');                                 // fargo: dry, flat, summer
  for(let i=0;i<150;i++)F(['#bfa865','#d9c98e','#c4b06c'][i%3],220+rnd()*164|0,170+rnd()*118|0,2,1);
  // the gas station forecourt: one clean slab of asphalt from the road to the shop door
  F('#9a9690',250,166,128,70); for(let i=0;i<160;i++)F(rnd()<.5?'#8f8b85':'#a5a19a',250+rnd()*128|0,166+rnd()*70|0,1,1);
  F('#b5b1aa',250,166,128,1); F('#7f7b75',250,235,128,1); F('#7f7b75',250,166,1,70); F('#7f7b75',377,166,1,70);
  for(let x=300;x<372;x+=12)F('#e2dfd8',x,224,1,10);                                       // parking spaces in front of the shop
  F('#d9d4c8',310,180,60,40); F('#2f6db0',310,180,60,8); F('#1d3f73',314,181,52,7); pixText(g,'FARGO GAS',322,182,'#ffffff');
  F('#6b6f7a',334,206,12,14); F('#9fd2f0',314,194,14,9); F('#9fd2f0',352,194,14,9);
  F('#c7372f',256,198,6,10); F('#c7372f',280,198,6,10); F('#f1f4f8',257,200,4,3); F('#f1f4f8',281,200,4,3);
  F('#8a8f9a',235,214,3,12); F('#1d3f73',222,200,30,15); F('#c7372f',222,200,30,3);
  const DIG={'2':['111','001','111','100','111'],'7':['111','001','010','010','010'],'9':['111','101','111','001','111'],'.':['0','0','0','0','1']};
  let tx=230; for(const ch of '2.79'){const m=DIG[ch]; m.forEach((row,ry)=>[...row].forEach((c,rx)=>{if(c==='1')F('#ffd84d',tx+rx,206+ry,1,1)})); tx+=m[0].length+1}
  for(let y=244;y<284;y+=8){F('#9a7b66',236,y,140,4); for(let x=240;x<374;x+=6){F('#7d2b52',x,y+1,3,2);F('#4f9a3c',x+1,y-2,1,3)}}
  // roads
  const road=(x,y,w,h)=>{F('#c9a46b',x,y,w,h); for(let i=0;i<w*h/30;i++)F('#b8935b',x+rnd()*w|0,y+rnd()*h|0,1,1);
    for(let i=0;i<w*h/140;i++)F(rnd()<.5?'#a9a39a':'#d8c49a',x+rnd()*w|0,y+rnd()*h|0,1,1);                                 // pebbles
    if(w>h){F('#b38c58',x,y,w,1); F('#b38c58',x,y+h-1,w,1); for(let k=0;k<w;k+=3)if(rnd()<.5)F('#8cc866',x+k,y-1,1,1)}   // edges, grass creeping in
    else {F('#b38c58',x,y,1,h); F('#b38c58',x+w-1,y,1,h)}};
  // one road across the middle, one down to Wylee Woods, and matching footpaths up to each place
  road(0,150,WW,14); road(186,164,12,124);
  const path=(x,y,w,h)=>{F('#c9a46b',x,y,w,h); for(let i=0;i<w*h/30;i++)F('#b8935b',x+rnd()*w|0,y+rnd()*h|0,1,1);
    if(w<h){F('#b38c58',x,y,1,h); F('#b38c58',x+w-1,y,1,h)} else {F('#b38c58',x,y,w,1); F('#b38c58',x,y+h-1,w,1)}};
  path(43,74,10,76);     // the farm: road to the barn doors
  path(187,140,10,10);   // the kitchen: road to the porch steps
  path(311,74,10,76);    // the Birkie: road to the arch
  // the cupcake trail: a narrow trodden track that peels off the barn path and sneaks round behind the barn
  const track=(x,y,w,h)=>F('#c2b07a',x,y,w,h);
  track(12,98,31,3); track(10,22,3,79); track(10,20,34,3);
  // city streets: wet asphalt, dashed lines, puddles reflecting the lights, a manhole (it steams)
  F('#22252f',72,164,12,92); F('#22252f',72,244,72,12); F('#3a3f50',71,164,1,80); F('#3a3f50',84,164,1,80);
  for(let y=168;y<244;y+=8)F('#c9a640',77,y,2,4); for(let x=88;x<144;x+=8)F('#c9a640',x,249,4,2);
  for(const [x,y,w] of [[74,186,8],[96,252,12],[74,232,6]]){F('#2e3a55',x,y,w,3); F('#f3d27a',x+2,y+1,w-5,1)}
  F('#14161f',75,214,6,4); F('#30343f',76,215,4,2);
  // Wylee Woods: forest floor around the end of the south road (the arch itself is a sprite)
  F('#3f6b3a',164,236,56,52); for(let i=0;i<160;i++)F(rnd()<.5?'#355c31':'#4d7d45',164+rnd()*56|0,236+rnd()*52|0,1,1);
  for(let i=0;i<30;i++)F('#7a5a3a',164+rnd()*56|0,236+rnd()*52|0,1,1);
  soft(R(164,236,56,52),'#3f6b3a','t');
  road(186,236,12,52); for(let i=0;i<12;i++)F('#5a7f3f',186+rnd()*12|0,240+rnd()*48|0,1,1);
  // your kitchen: an old white farmhouse with a gray shingle roof, a front gable, green shutters and a wraparound porch
  F('#8a3a2a',172,76,6,14); F('#6b2a1e',172,76,6,2); F('#a54a36',173,80,4,1); F('#a54a36',173,85,4,1);   // brick chimney
  F('#5f6470',164,86,56,20); F('#3f434c',164,86,56,2); for(let y=89;y<106;y+=3)F('#4f545e',164,y,56,1);   // shingle roof
  for(let k=0;k<13;k++){const y=80+k, hw=k+1; F('#4f545e',192-hw-2,y,hw*2+4,1); if(k>1)F('#f2efe6',192-hw+1,y,hw*2-2,1)}   // front gable
  F('#ffd98a',189,86,6,5); F('#cbb67a',191,86,1,5); F('#cbb67a',189,88,6,1);                               // attic window
  F('#5a3a22',167,95,50,9); F('#f2e6c8',168,96,48,7); pixText(g,'THE KITCHEN',170,97,'#8a2a22');              // the sign
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
const barnSprite=document.createElement('canvas'); barnSprite.width=64; barnSprite.height=62;
(function(){const g=barnSprite.getContext('2d'); g.translate(-16,-14); const F=(c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};
  F('rgba(0,0,0,.18)',18,73,60,3);                                                       // shadow at the base
  // roof: shingle rows, darker toward the eaves, white trim
  F('#7a2a22',16,26,64,10); F('#8f3328',20,22,56,6);
  for(let y=23;y<36;y+=2){F('#6a2219',y<28?20:16,y,y<28?56:64,1); for(let x=(y%4?18:20);x<80;x+=4)F('#9a3a2e',x,y-1,1,1)}
  F('#f1e3c9',16,35,64,1); F('#f1e3c9',20,22,56,1);
  // walls: vertical planks with a bit of shading
  F('#b7412e',20,36,56,38); for(let x=22;x<76;x+=4)F('#a5392a',x,36,1,38); F('#c9523c',20,36,56,1); F('#8f3328',20,72,56,2);
  F('#f1e3c9',20,36,1,38); F('#f1e3c9',75,36,1,38);                                      // corner trim
  // big doors
  F('#f1e3c9',38,52,20,22); F('#5a2a20',40,54,16,20); F('#f1e3c9',40,54,16,1); F('#f1e3c9',47,54,2,20);
  g.strokeStyle='#f1e3c9';g.lineWidth=1;g.beginPath();g.moveTo(40.5,54.5);g.lineTo(47.5,73.5);g.moveTo(47.5,54.5);g.lineTo(40.5,73.5);g.moveTo(49.5,54.5);g.lineTo(55.5,73.5);g.moveTo(55.5,54.5);g.lineTo(49.5,73.5);g.stroke();
  F('#c9a24a',46,63,1,2); F('#c9a24a',49,63,1,2);                                        // handles
  // hayloft with hay poking out, and two windows
  F('#f1e3c9',43,39,10,10); F('#3a1a14',44,40,8,8); F('#e8c35a',44,45,8,3); F('#f4d77a',45,44,2,2); F('#d9b04a',49,45,1,2); F('#e8c35a',43,47,2,2);
  F('#f1e3c9',26,40,8,6); F('#5a7a9a',27,41,6,4); F('#f1e3c9',29,41,1,4);
  F('#f1e3c9',62,40,8,6); F('#5a7a9a',63,41,6,4); F('#f1e3c9',65,41,1,4);
  // a rooster weathervane on the left of the roof
  F('#3a3a3a',29,15,1,8); F('#3a3a3a',26,17,7,1); F('#3a3a3a',30,13,4,2); F('#3a3a3a',33,12,1,2); F('#3a3a3a',28,14,2,1);
})();
const drawBarn=()=>ctx.drawImage(barnSprite,16,14);

// Trees are drawn as sprites, depth-sorted with people, so you can walk behind them.
const treeSprite=document.createElement('canvas'); treeSprite.width=16; treeSprite.height=20;
(function(){const g=treeSprite.getContext('2d'); const F=(c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};
  F('rgba(0,0,0,.18)',2,17,12,3);                                                        // shadow on the ground
  F('#5a3d26',6,13,4,6); F('#7a5232',7,13,1,5); F('#4a3020',9,14,1,5); F('#5a3d26',5,18,6,1);   // trunk with bark + root flare
  F('#24532c',1,5,14,9); F('#24532c',2,3,12,12); F('#24532c',4,1,8,15);                  // dark outer canopy
  F('#2f6b36',2,4,12,9); F('#2f6b36',4,2,8,12);                                          // mid
  F('#3d8443',3,3,8,6); F('#3d8443',5,2,6,8); F('#4d9a50',4,3,4,3); F('#4d9a50',8,5,2,2); F('#6ab563',5,3,2,1);   // light from the top left
  F('#1f472a',9,10,4,2); F('#1f472a',3,12,3,1); F('#24532c',12,8,2,3);                   // shade underneath
})();
const drawTree=(x,y)=>ctx.drawImage(treeSprite,x-8,y-19);
// Bryan: medium brown hair, buzzed super short, gray tee, jeans. Very chill.
// Bryan: chill, buzz cut, half-asleep smile, grey tee, jeans, brown boots. 12 x 20 px.
const BRYAN_PAL={H:'#7a5232',h:'#5e3e25',S:'#e8b48e',s:'#d09a74',E:'#3b2a20',M:'#b5654f',T:'#8d949e',t:'#737a85',l:'#a5abb4',J:'#3a5f9e',j:'#2c4a7c',B:'#5a3a22'};
const BRYAN_SPR={
  down:["...HHHHHH...","..HhHHhHHH..","..HSSSSSSH..","..SEESSEES..","..sSSssSSs..","...SMMMMS...",
        ".TTTTllTTTT.",".TTTTTTTTtT.",".TTTTTTTTtT.",".STTTTTTTtS.",".STTTTTTTtS.",".SttttttttS."],
  right:["...HHHHHH...","..HHhHHHHH..","..HHHSSSSS..","..HHsSSEES..","..hSSSSSSSS.","...sSSSSMS..",
        ".TTTTTTTTTT.",".TTTTTTTTtT.",".TTTTSTTTtT.",".TTTTSTTTtT.",".TTTTSTTTtT.",".ttttsttttt."],
};
function drawBryan(x,y,dir='right',g=ctx){
  const X=Math.round(x)-6, Y=Math.round(y)-19, F=(c,dx,dy,w,h)=>{g.fillStyle=c;g.fillRect(X+dx,Y+dy,w,h)};
  F('rgba(0,0,0,.2)',1,18,10,2);
  F('#3a5f9e',3,12,3,6); F('#3a5f9e',6,12,3,6); F('#2c4a7c',5,12,1,5); F('#4d74b4',3,13,1,3); F('#4d74b4',6,13,1,3);   // jeans
  F('#5a3a22',2,17,4,2); F('#5a3a22',6,17,4,2); F('#7a5236',2,17,2,1); F('#7a5236',6,17,2,1);                          // boots
  drawSprite(g,X,Y,BRYAN_SPR,BRYAN_PAL,dir==='up'?'down':dir,null,2);   // (his eyes are already half shut)
}
// Bryan lounging in his boat by the dock: leaning back, hands behind his head, feet up
function drawBryanInBoat(x,y){ const b=Math.round(Math.sin(time/700)*1), F=(c,dx,dy,w,h)=>{ctx.fillStyle=c;ctx.fillRect(x+dx,y+b+dy,w,h)};
  const skin='#e8b48e', hair='#7a5232', tee='#8d949e';
  F(tee,4,-3,6,5); F(skin,6,-8,5,5); F(hair,6,-9,5,2); F(hair,10,-8,1,2);           // leaning back against the stern, buzz cut
  F(skin,4,-9,2,2); F(skin,11,-9,2,2); F(tee,4,-7,2,2); F(tee,11,-7,2,2);           // hands behind his head
  F('#2b2b2b',7,-6,1,1); F('#2b2b2b',9,-6,1,1); F('#b5654f',8,-4,2,1);              // eyes half shut, little smile
  F('#3a5f9e',10,-1,6,2); F('#5a3a22',16,-2,2,2) }                                 // jeans, feet up on the seat
// his boat, bobbing on the pond
function drawBoat(x,y){ const b=Math.round(Math.sin(time/700)*1), F=(c,dx,dy,w,h)=>{ctx.fillStyle=c;ctx.fillRect(x+dx,y+b+dy,w,h)};
  F('rgba(20,40,70,.35)',-1,6,20,2); F('#7a4e2c',0,0,18,6); F('#a26c40',1,0,16,2); F('#5a3a22',2,5,14,1); F('#c94a3a',0,2,18,1);
  F('#6b4a2f',4,2,1,3); F('#6b4a2f',13,2,1,3); F('#c9a27a',-3,4,6,1); F('#c9a27a',15,4,6,1);   // seats, oars
  F('#f2efe6',8,-1,3,2) }   // a cooler
const makePine=(dark,snowy)=>{const c=document.createElement('canvas'); c.width=12; c.height=20; const g=c.getContext('2d'); const F=(col,x,y,w,h)=>{g.fillStyle=col;g.fillRect(x,y,w,h)};
  F('#5a3d26',5,16,2,4); F(dark,1,11,10,6); F(dark,2,6,8,6); F(dark,4,1,4,6); F(dark,5,0,2,1);
  if(snowy){F('#ffffff',1,11,4,1); F('#ffffff',7,11,3,1); F('#ffffff',2,6,3,1); F('#ffffff',7,6,2,1); F('#ffffff',4,1,4,1)}
  else{F('#3f7a45',3,8,2,2); F('#3f7a45',6,13,2,2); F('#3f7a45',5,3,1,2)} return c};
const snowPine=makePine('#2b5a3a',true), darkPine=makePine('#1f4a2c',false), mossCedar=makePine('#24452c',false);
{const g=mossCedar.getContext('2d'); g.fillStyle='#6b8f3a'; for(const [x,y] of [[2,12],[8,14],[4,7],[7,9],[5,3]])g.fillRect(x,y,2,1); g.fillStyle='#4a7442'; g.fillRect(5,17,2,1)}   // hanging moss
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
SCENES.world={ music:'farm',
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
    drawBoat(114,27); drawBryanInBoat(114,27);
    drawCupcake();
    for(const p of smoke){ctx.fillStyle=`rgba(240,240,240,${Math.max(0,p.a)*.7})`;ctx.fillRect(Math.round(p.x),Math.round(p.y),3,3)}
  },
  ents(list){trees.forEach(([x,y])=>list.push({y,draw:()=>drawTree(x,y)}));

    pines.forEach(([x,y])=>list.push({y,draw:()=>drawPine(x,y,snowPine)})); cedars.forEach(([x,y])=>list.push({y,draw:()=>drawPine(x,y,mossCedar)})); woods.forEach(([x,y])=>list.push({y,draw:()=>drawPine(x,y,darkPine)}));
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
    for(const [x,y] of [[68,206],[104,260]]){ctx.fillStyle='#4a4f60'; ctx.fillRect(x,y-16,1,16); ctx.fillRect(x-1,y-17,4,1); ctx.fillStyle='#ffe9a8'; ctx.fillRect(x+1,y-16,2,2);   // streetlamps
      const gr=ctx.createRadialGradient(x+2,y-8,1,x+2,y-4,20); gr.addColorStop(0,'rgba(255,225,150,.32)'); gr.addColorStop(1,'rgba(255,225,150,0)'); ctx.fillStyle=gr; ctx.fillRect(x-20,y-28,44,40)}
    // the Gastown steam clock (it whistles steam on the quarter hour... here, every few seconds)
    {const x=94,y=228; ctx.fillStyle='#5a3a22'; ctx.fillRect(x,y-22,6,22); ctx.fillStyle='#7a5232'; ctx.fillRect(x+1,y-20,4,18); ctx.fillStyle='#c9a24a'; ctx.fillRect(x-1,y-23,8,2); ctx.fillRect(x-1,y-2,8,2);
      ctx.fillStyle='#f2efe6'; ctx.fillRect(x+1,y-18,4,4); ctx.fillStyle='#2b2b2b'; ctx.fillRect(x+3,y-17,1,2); ctx.fillRect(x+3,y-16,2,1);
      ctx.fillStyle='#c9a24a'; ctx.fillRect(x+2,y-26,2,3); if(Math.floor(time/2600)%3===0){ctx.fillStyle='rgba(235,235,240,.55)'; const t=(time%2600)/2600; for(let k=0;k<4;k++)ctx.fillRect(x+1+((k*3+Math.floor(t*6))%5),y-30-k*3-t*6,3,3)}}
    // rain rings on the water, and the little rainbow ferry going back and forth
    ctx.fillStyle='rgba(170,200,230,.45)'; for(let i=0;i<14;i++){const k=Math.floor(time/500+i*.37), ph=((time/500+i*.37)%1), rx=(i*23+k*17)%160+2, ry=(rx<72?248:268)+(i*13+k*7)%8, r=1+ph*3; ctx.fillRect(rx-r,ry,r*2,1)}
    // the freighters anchored out in the bay (they're always there)
    const ship=(x,y,len,cols)=>{const b=Math.round(Math.sin(time/1400+x)*.6); ctx.fillStyle='rgba(0,0,0,.25)'; ctx.fillRect(x+1,y+6+b,len,2);
      ctx.fillStyle='#2b2f3a'; ctx.fillRect(x,y+1+b,len,5); ctx.fillStyle='#8a2a22'; ctx.fillRect(x+1,y+5+b,len-2,1); ctx.fillRect(x+len,y+3+b,1,2);
      cols.forEach((c,i)=>{ctx.fillStyle=c; ctx.fillRect(x+3+i*4,y-2+b,4,3)});
      ctx.fillStyle='#e8eef0'; ctx.fillRect(x+len-7,y-5+b,5,6); ctx.fillStyle='#ffe9a8'; ctx.fillRect(x+len-6,y-4+b,1,1); ctx.fillRect(x+len-4,y-4+b,1,1);
      if(Math.floor(time/900+x)%2){ctx.fillStyle='#ff3b3b'; ctx.fillRect(x+len-5,y-7+b,1,1)}};
    ship(4,254,36,['#c8322b','#2f6db0','#e8a020','#2f8a4a','#c8322b','#5fa8e8']); ship(104,270,42,['#2f8a4a','#e8a020','#c8322b','#2f6db0','#e8a020','#8a5a9a','#2f6db0']);
    {const bx=Math.round(8+(Math.sin(time/5000)+1)*20), by=266; ctx.fillStyle='rgba(0,0,0,.25)'; ctx.fillRect(bx,by+5,14,2); ctx.fillStyle='#f2efe6'; ctx.fillRect(bx,by,14,5);
      ['#e54b4b','#f4a03a','#f4d35e','#4fbf73','#5fa8e8'].forEach((c,i)=>{ctx.fillStyle=c; ctx.fillRect(bx+2+i*2,by-2,2,2)}); ctx.fillStyle='#ffe9a8'; ctx.fillRect(bx+3,by+1,8,1)}
    ctx.fillStyle='#7d8694'; ctx.fillRect(150,170,1,10); if(Math.floor(time/700)%2){ctx.fillStyle='#ff3b3b'; ctx.fillRect(149,170,3,2)}   // antenna
    if(have.city){ // the cookie signal, up on the clouds
      ctx.fillStyle='rgba(255,240,180,.22)'; ctx.beginPath(); ctx.ellipse(46,184,16,9,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='rgba(30,22,16,.55)'; ctx.beginPath(); ctx.arc(46,184,6,0,Math.PI*2); ctx.fill(); ctx.fillStyle='rgba(255,240,180,.5)'; ctx.fillRect(43,182,2,2); ctx.fillRect(48,185,2,2); ctx.fillRect(45,187,1,1)}
    ctx.restore();
    ctx.fillStyle='#ffffff'; for(const s of snow)ctx.fillRect(Math.round(s.x),Math.round(s.y),1,1);
  },
};
