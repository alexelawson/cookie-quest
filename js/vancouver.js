// Vancouver, on foot. You come over the Lions Gate Bridge from the north, down the causeway through Stanley Park's cedars
// (the totem poles and the lighthouse out at Brockton Point to the east, Third Beach and its crabs to the west), past English Bay
// and Coal Harbour (Canada Place's five sails), into downtown: glass towers, Gastown's brick and its steam clock, the pho place (REALLY GOOD PHO, ENTER HERE:
// that's the way up to the rooftops and the heist), and Science World on False Creek at the bottom.
// North is up. The words are in VANCOUVER (story.js). You can only walk where VAN_WALK says: roads, trails, beaches, the seawalls.
const VCW=288, VCH=360;
const VAN_WALK=[
  R(138,2,12,322),                       // the bridge deck, the causeway through the park, then Georgia Street
  R(150,91,98,8),                        // the trail east to Brockton Point (totem poles, the lighthouse)
  R(48,117,90,8), R(44,104,12,34),       // the trail west to Third Beach, and the beach
  R(40,180,98,16),                       // English Bay beach
  R(150,188,86,8),                       // the Coal Harbour seawall, out to Canada Place
  R(24,227,258,12), R(24,275,258,12),    // two cross streets
  R(75,190,12,134), R(211,196,12,128),   // two side streets
  R(24,316,258,8),                       // the False Creek seawall
];
const VAN={ tower:{x:144,y:26}, totems:{x:208,y:89}, light:{x:250,y:94}, clock:{x:153,y:226}, door:{x:181,y:275}, dome:{x:252,y:338,r:15},
  crabs:[[50,112,1.7],[52,130,3.1],[66,188,2.4],[104,191,.6]], cedars:[[128,60],[160,70],[126,84],[162,112],[124,104],[160,140],[128,150],[176,86],[230,86],[190,104],[70,112],[96,130],[112,112],[60,150],[158,166],[126,168]] };
const vanLook=k=>({z:null, label:VANCOUVER.looks[k].label, btn:'Look', act:()=>showDialog({place:VANCOUVER.place,speaker:VANCOUVER.sign,pages:[VANCOUVER.looks[k].text],actions:[CLOSE]})});
const VAN_TRIGGERS=[
  {z:R(172,275,18,6), label:VANCOUVER.elevator, act:()=>openWardrobe(()=>{ heist.outfitReact=true; goTo('city','fromStreet') })},
  {...vanLook('clock'),z:R(150,227,14,6)}, {...vanLook('totems'),z:R(198,91,22,8)}, {...vanLook('lighthouse'),z:R(236,91,12,8),act:()=>{ VAN.lit=time; sfx('pickup'); showDialog({place:VANCOUVER.place,speaker:VANCOUVER.sign,pages:[VANCOUVER.looks.lighthouse.text],actions:[CLOSE]}) }},
  {...vanLook('sails'),z:R(222,188,14,8)}, {...vanLook('science'),z:R(240,316,24,8)}, {...vanLook('beach'),z:R(44,106,12,30)},
];
// where the land is (the park is a rounded point; it widens into the beaches and then the city)
const vanParkW=y=>105*Math.sqrt(Math.max(0,1-((y-112)/72)**2));
function vanLand(x,y){
  if(y<44)return false;
  if(y>=200)return y<324&&x>=20;
  let l=144-vanParkW(y), r=144+vanParkW(y);
  if(y>=170){ const k=Math.min(1,(y-170)/10), k2=Math.min(1,(y-170)/16); l=Math.min(l,93+(24-93)*k); r=Math.max(r,195+(240-195)*k2) }
  return x>=l&&x<=r;
}
const vanBg=document.createElement('canvas'); vanBg.width=VCW; vanBg.height=VCH;
(function(){
  const g=vanBg.getContext('2d'), F=(c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};
  const near=(x,y,d)=>{for(const [dx,dy] of [[d,0],[-d,0],[0,d],[0,-d],[d,d],[-d,-d],[d,-d],[-d,d]])if(!vanLand(x+dx,y+dy))return true; return false};
  // ---- water ----
  F('#2b4a86',0,0,VCW,VCH);
  for(let i=0;i<520;i++){const x=rnd()*VCW|0, y=rnd()*VCH|0; F(['#3a5c9c','#24407a','#5a7cc0','#c86a9a','#f3c46a'][i%5],x,y,i%5>2?2:5,1)}
  // ---- land: a stone seawall round the edge, then ground ----
  for(let y=40;y<328;y++)for(let x=14;x<VCW;x++){ if(!vanLand(x,y)){ if(vanLand(x+2,y)||vanLand(x-2,y)||vanLand(x,y+2)||vanLand(x,y-2))F('#8fb0d8',x,y,1,1); continue }
    const park=y<176, edge=near(x,y,3);
    F(edge?(near(x,y,1)?'#8a8478':'#c9c2b4'):park?'#3d7044':'#4a5064',x,y,1,1) }
  // beaches: Third Beach on the park's west side, English Bay below it
  const sand=(x,y)=>{F('#d8c69a',x,y,1,1); if(rnd()<.12)F(rnd()<.5?'#c4b184':'#e6d6ae',x,y,1,1)};
  for(let y=98;y<144;y++)for(let x=36;x<62;x++)if(vanLand(x,y)&&x<144-vanParkW(y)+15)sand(x,y);
  for(let y=176;y<200;y++)for(let x=20;x<136;x++)if(vanLand(x,y))sand(x,y);
  const logd=(x,y,w)=>{F('rgba(0,0,0,.18)',x+1,y+2,w,1); F('#8a7458',x,y,w,2); F('#b39c78',x,y,w,1); F('#6b5a44',x+w-1,y,1,2); F('#d8c8a8',x,y,1,2)};
  logd(46,102,9); logd(48,122,8); logd(47,138,9); logd(44,184,16); logd(72,194,14); logd(96,184,12); logd(118,194,10);
  // Siwash Rock, standing off the seawall, with its one little tree
  F('#6f6a60',26,82,5,9); F('#8a8478',27,81,3,9); F('#a8a296',27,81,1,6); F('#2f6b3a',27,78,3,3); F('#8fb0d8',25,91,7,1);
  // the Inukshuk at English Bay
  {const x=30,y=186; F('rgba(0,0,0,.2)',x-1,y+8,9,1); F('#8a8478',x,y+4,2,4); F('#8a8478',x+5,y+4,2,4); F('#a8a296',x-1,y+2,9,2); F('#8a8478',x+2,y,3,2); F('#a8a296',x+2,y-2,3,2); F('#6f6a60',x-1,y+3,9,1)}
  // ---- Stanley Park: forest floor, then a canopy of cedars and firs seen from above; the paths and the lagoon stay clear ----
  const clear=(x,y)=>(x>132&&x<156)||(y>86&&y<103&&x>150)||(y>112&&y<129&&x<140)||(((x-104)/24)**2+((y-146)/13)**2<1)||(x>194&&x<228&&y>72&&y<92);
  for(let i=0;i<900;i++){const x=20+rnd()*250|0, y=46+rnd()*128|0; if(vanLand(x,y)&&!near(x,y,4)&&y<176)F(rnd()<.5?'#356a3e':'#467c4c',x,y,2,1)}
  for(let y=50;y<172;y+=6)for(let x=36;x<254;x+=7){ const ox=x+((y/6|0)%2)*3+(rnd()*3|0)-1, oy=y+(rnd()*3|0)-1;
    if(!vanLand(ox,oy)||near(ox,oy,7)||clear(ox,oy)||clear(ox+6,oy+5)||oy>170)continue;
    const d=rnd()<.5; F('#16381f',ox,oy+1,8,7); F(d?'#1f4a2c':'#24532c',ox,oy,8,7); F(d?'#2f6b3a':'#2b6034',ox+1,oy,6,5); F('#3d8443',ox+1,oy+1,3,2); F('#4d9a50',ox+2,oy+1,1,1) }
  // the causeway (and Georgia Street after it): three lanes
  F('#3a3f4a',137,0,14,324); for(let i=0;i<160;i++)F(rnd()<.5?'#343944':'#424854',137+rnd()*14|0,rnd()*324|0,2,1);
  for(let y=2;y<324;y+=7){F('#d9d9d0',141,y,1,4); F('#d9d9d0',146,y,1,4)}
  F('#2f7a4a',135,0,2,46); F('#4f9a68',135,0,1,46); F('#2f7a4a',151,0,2,46); F('#1f5a36',152,0,1,46); for(let y=1;y<46;y+=4){F('#1f5a36',135,y,2,1); F('#1f5a36',151,y,2,1)}   // the bridge's green railings
  F('rgba(10,20,50,.35)',153,2,4,40); F('#8a8478',130,22,28,8); F('#a8a296',130,22,28,1); F('#3a3f4a',137,22,14,8);                                       // the tower's pier
  // the trails: packed gravel
  const trail=(x,y,w,h)=>{F('#b9a888',x,y,w,h); for(let i=0;i<w*h/7;i++)F(rnd()<.5?'#a89878':'#cbbb9c',x+rnd()*w|0,y+rnd()*h|0,1,1)};
  trail(151,90,98,10); trail(46,116,91,10); trail(196,76,30,14);
  // Lost Lagoon, with its fountain
  for(let y=-11;y<=11;y++){const w=Math.round(22*Math.sqrt(1-(y/11.5)**2)); F('#5d8f6a',104-w-1,146+y,w*2+2,1); F('#3d7fb8',104-w,146+y,w*2,1)}
  F('#5a9bd0',92,141,12,3); F('#d7ecf8',96,140,5,1); F('#e8f4fb',104,143,1,5); F('#e8f4fb',102,145,5,1); F('#ffffff',104,142,1,1); F('#4d9a50',118,150,3,1); F('#4d9a50',90,151,2,1);
  // Canada Place: a pier out into Coal Harbour with its five white sails
  {const x=238,y=170; F('rgba(10,20,50,.3)',x+2,y+2,22,32); F('#aab2c0',x,y,22,32); F('#d6dbe4',x,y,22,1); F('#d6dbe4',x,y,1,32); F('#7d8694',x+21,y,1,32);
    for(let k=0;k<5;k++){const sy=y+2+k*6; for(let r=0;r<3;r++){const ins=(2-r)*3; F('#ffffff',x+2+ins,sy+r,18-ins*2,1); F('#dfe5ee',x+2+ins,sy+4-r,18-ins*2,1)} F('#ffffff',x+2,sy+2,18,1); F('#b4bccb',x+3,sy+5,16,1); F('#8a93a4',x+10,sy+2,2,1)}   // each sail a peaked tent, from above
    F('#c8322b',x+10,y-5,1,5); F('#f2efe6',x+11,y-5,3,2); F('#c8322b',x+12,y-5,1,2)}
  // the marina in Coal Harbour: a dock and little boats
  F('#6b4a2f',220,160,3,10); F('#8a6a4a',220,160,1,10); for(const fy of [152,158])F('#6b4a2f',223,fy+3,10,1);
  for(const [bx,by] of [[224,150],[224,157],[224,164]]){F('#f2f2ee',bx,by,7,4); F('#d9d9d4',bx,by+3,7,1); F('#9aa3b2',bx+3,by+1,1,2); F('#ffe9a8',bx+1,by+1,2,1)}
  // ---- downtown ----
  // streets: wet asphalt, lane dashes, crosswalks at the corners
  const street=(x,y,w,h)=>{F('#2a2e3a',x,y,w,h); for(let i=0;i<w*h/22;i++)F(rnd()<.5?'#252934':'#323744',x+rnd()*w|0,y+rnd()*h|0,2,1);
    if(w>h){for(let k=x+2;k<x+w;k+=8)F('#c9a640',k,y+(h>>1),4,1)} else for(let k=y+2;k<y+h;k+=8)F('#c9a640',x+(w>>1),k,1,4)};
  street(22,226,262,14); street(22,274,262,14); street(74,198,14,126); street(210,198,14,126);
  for(const sy of [226,274])for(const sx of [74,137,210]){F('#2a2e3a',sx,sy,14,14); for(let k=0;k<14;k+=3){F('#d9d9d0',sx+k,sy-3,2,3); F('#d9d9d0',sx+k,sy+14,2,3); F('#d9d9d0',sx-3,sy+k,3,2); F('#d9d9d0',sx+14,sy+k,3,2)}}
  for(const [px,py,pw] of [[30,232,10],[100,280,12],[160,231,8],[232,282,10],[78,250,6]]){F('#1d2230',px,py,pw,3); F('#3a4a70',px+2,py,pw-5,1)}   // puddles
  // a building, seen from above: its roof, and a strip of its south face (windows, some lit)
  const bld=(x,y,w,h,roof,face,o={})=>{ const fh=o.fh||7, rh=h-fh, rd=shade(roof,.78), rl=shade(roof,1.25);
    F('rgba(0,0,0,.3)',x+2,y+h,w,2); F('rgba(0,0,0,.3)',x+w,y+3,2,h-1);
    F(roof,x,y,w,rh); F(rl,x,y,w,1); F(rl,x,y,1,rh); F(rd,x+w-1,y,1,rh); F(rd,x,y+rh-1,w,1); F(shade(roof,1.1),x+2,y+2,w-4,rh-4);
    F(face,x,y+rh,w,fh); F(shade(face,.8),x,y+rh,w,1);
    for(let wx=x+2;wx<x+w-2;wx+=4)for(let wy=y+rh+2;wy<y+h-1;wy+=3)F(rnd()<.55?'#f3d27a':rnd()<.2?'#ffb3d0':shade(face,.6),wx,wy,2,2);
    if(o.green){F('#3d6b3a',x+3,y+3,w-6,rh-6); for(let k=x+4;k<x+w-5;k+=5){F('#4f8a45',k,y+4+((k/5|0)%2)*2,3,3); F('#62a356',k+1,y+4+((k/5|0)%2)*2,1,1)}}
    if(o.pool){F('#e8e2d6',x+w-13,y+3,10,7); F('#5fb8e8',x+w-12,y+4,8,5); F('#a8dcf4',x+w-11,y+5,3,1)}
    if(o.units)for(let k=0;k<o.units;k++){const ux=x+4+k*8, uy=y+3+(k%2)*4; if(ux>x+w-8)break; F('rgba(0,0,0,.3)',ux+1,uy+4,5,1); F('#8b93a3',ux,uy,5,4); F('#c9ced4',ux,uy,5,1); F('#4a5064',ux+1,uy+2,3,1)}
    if(o.door!=null){F('#ffe9a8',x+o.door-3,y+h-5,6,5); F(shade(face,.5),x+o.door,y+h-5,1,5)} };
  const park=(x,y,w,h)=>{F('#4f8a45',x,y,w,h); for(let i=0;i<w*h/8;i++)F(rnd()<.5?'#458040':'#5d9a52',x+rnd()*w|0,y+rnd()*h|0,2,1)};
  const stree=(x,y)=>{F('rgba(0,0,0,.25)',x-2,y+2,6,2); F('#1f4a2c',x-3,y-3,7,6); F('#2f6b3a',x-2,y-4,5,5); F('#4d9a50',x-2,y-3,2,2)};
  // row 1, west to east: West End walk-ups, a green-roofed glass tower, Gastown brick + Harbour Centre, the convention centre's living roof
  bld(27,203,20,21,'#7a6a5a','#a8563e',{units:1}); bld(50,206,22,18,'#5a6070','#c9b48a',{units:2}); stree(49,202); stree(72,203);
  bld(91,201,44,23,'#2f7a76','#27635f',{green:true,fh:8});
  bld(153,202,32,20,'#5a4a42','#9a3b2e',{units:2,fh:8,door:10});
  bld(189,201,20,23,'#2c6a8a','#22506c',{fh:8}); {const cx=199, cy=209; for(let y=-7;y<=7;y++){const w=Math.round(Math.sqrt(49-y*y)); F('#9aa3b2',cx-w,cy+y+1,w*2,1)} for(let y=-7;y<=7;y++){const w=Math.round(Math.sqrt(49-y*y)); F('#c9ced8',cx-w,cy+y,w*2,1)}
    for(let y=-4;y<=4;y++){const w=Math.round(Math.sqrt(16-y*y)); F('#e9edf3',cx-w,cy+y,w*2,1)} for(let a=0;a<12;a++)F('#ffe9a8',cx+Math.round(Math.cos(a*.524)*6),cy+Math.round(Math.sin(a*.524)*6),1,1); F('#7d8694',cx,cy,1,1)}   // the lookout pod, from above
  bld(226,202,54,22,'#6a7a5a','#aab2c0',{fh:6}); park(228,204,50,13); for(let k=230;k<276;k+=6)F('#6aa862',k,206+(k%4),3,1); F('#d6dbe4',246,198,10,4);
  for(let x=150;x<210;x+=1)for(let y=224;y<226;y++)F(((x+y)%4<2)?'#7a4a42':'#693c36',x,y,1,1);                                           // Gastown's brick sidewalk
  // row 2: a tower with a rooftop pool, twin condos, THE ELEVATOR building, the art gallery (stone, a little green dome) on its lawn
  bld(27,242,45,30,'#3a6a8a','#2e5670',{pool:true,units:2,fh:9});
  bld(91,242,20,30,'#2f7a76','#27635f',{fh:9,units:1}); bld(115,246,20,26,'#5a6a8a','#46557a',{fh:9,green:true});
  bld(153,241,54,31,'#3a3540','#5a3a3a',{fh:11});
  // ...which is a pho place, with a big sign on the roof: REALLY GOOD PHO. ENTER HERE. (the arrows blink: see over())
  {const dx=VAN.door.x; F('#1d1420',155,243,50,17); F('#c8322b',155,243,50,1); F('#c8322b',155,259,50,1); F('#c8322b',155,243,1,17); F('#c8322b',204,243,1,17);
    pixText(g,'REALLY GOOD',158,245,'#ffd84d'); pixText(g,'PHO',172,252,'#7fe8ff');
    F('#f2efe6',188,253,9,3); F('#d9d5ca',189,256,7,1); F('#e8c070',189,253,7,1); F('#4d9a50',191,252,2,1); F('#c8322b',194,252,1,1); F('#f2efe6',163,251,1,6); F('#f2efe6',165,251,1,6);   // a bowl, chopsticks
    F('#1d1420',dx-21,262,42,7); pixText(g,'ENTER HERE',dx-19,263,'#ff7ad1');
    F('#ffe9a8',dx-4,269,8,3); F('#8a1f1a',dx-4,272,8,3); F('#c8322b',dx-6,268,12,1)}
  park(226,241,56,32); bld(236,246,36,22,'#b9b2a6','#d6d0c4',{fh:8,door:18}); F('#5f9a8a',251,250,6,5); F('#7fbca8',252,250,3,2); stree(230,246); stree(277,247); stree(230,268); stree(277,268);
  // row 3: condos, BC Place (the big white stadium roof), a park, and the plaza in front of Science World
  bld(27,290,20,23,'#5a6070','#8a93a4',{units:1}); bld(51,290,21,23,'#2f7a76','#27635f',{green:true});
  {const cx=112, cy=302; F('rgba(0,0,0,.3)',93,313,40,2); for(let y=-11;y<=11;y++){const w=Math.round(21*Math.sqrt(1-(y/11.5)**2)); F('#c9ced8',cx-w,cy+y,w*2,1); F('#eef1f5',cx-w+1,cy+y,Math.max(0,w*2-4),1)}
    for(let a=0;a<16;a++){const t=a*.3927; F('#8a93a4',cx+Math.round(Math.cos(t)*19),cy+Math.round(Math.sin(t)*10),1,2)} for(let k=-14;k<=14;k+=7)F('#d6dbe4',cx+k,cy-9,1,18); F('#d6dbe4',cx-18,cy,36,1)}
  bld(153,290,24,23,'#6a5a7a','#544664',{units:2}); park(181,289,26,26); stree(188,296); stree(200,306); stree(192,310); F('#8a5a34',184,301,6,2);
  F('#5a6278',226,288,56,28); for(let x=226;x<282;x+=6)F('#4a5064',x,288,1,28); for(let y=288;y<316;y+=6)F('#4a5064',226,y,56,1); stree(232,294); stree(276,294); F('#c8322b',240,300,3,3); F('#f4d35e',262,303,3,3);   // a paved plaza, a couple of sculptures
  // ---- False Creek: the seawall, Science World on its pier, boats ----
  F('#c9c2b4',20,316,268,8); for(let x=20;x<288;x+=5)F('#b0a998',x,316,1,8); F('#8a8478',20,323,268,1);
  {const {x:cx,y:cy,r}=VAN.dome; F('rgba(10,20,50,.3)',cx-r-3,cy+4,r*2+10,r+2); F('#aab2c0',cx-r-4,cy-r-6,r*2+8,r*2+8); F('#d6dbe4',cx-r-4,cy-r-6,r*2+8,1); F('#7d8694',cx-r-4,cy+r+1,r*2+8,1); F('#aab2c0',cx-6,324,12,8);
    for(let y=-r;y<=r;y++){const w=Math.round(Math.sqrt(r*r-y*y)); for(let x=-w;x<w;x++){ const tri=((x+r)>>1)+((y+r)>>1), lit=(-x-y)/(r*1.6);   // a geodesic sphere: little triangles of mirror, lit from the top left
        F(tri%2?(lit>.25?'#eef3f8':lit>-.1?'#c3ccd8':'#8d99ab'):(lit>.25?'#d6dee8':lit>-.1?'#a9b4c4':'#74819a'),cx+x,cy+y,1,1)}}
    for(let a=0;a<20;a++){const t=a*.314; F(a%2?'#ffe9a8':'#ffffff',cx+Math.round(Math.cos(t)*(r-1)),cy+Math.round(Math.sin(t)*(r-1)),1,1)} }   // its ring of lights
  for(const [bx,by] of [[60,336],[150,344],[196,332]]){F('rgba(10,20,50,.3)',bx+1,by+4,8,1); F('#f2f2ee',bx,by,8,4); F('#d9d9d4',bx,by+3,8,1); F('#9aa3b2',bx+3,by-5,1,5); F('#ffe9a8',bx+2,by+1,3,1)}
})();
// the bridge tower you walk under as you arrive
function drawVanTower(){ const F=(c,x,y,w,h)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h)}, ty=VAN.tower.y;
  for(const tx of [132,153]){F('#2f7a4a',tx,ty-24,3,28); F('#4f9a68',tx,ty-24,1,28); F('#1f5a36',tx+2,ty-24,1,28)}
  F('#2f7a4a',132,ty-24,24,2); F('#4f9a68',132,ty-24,24,1); F('#2f7a4a',135,ty-13,18,2); for(let k=0;k<9;k++){F('#2f7a4a',135+k*2,ty-22+k,2,1); F('#2f7a4a',151-k*2,ty-22+k,2,1)}
  if(Math.floor(time/900)%2){F('#ff3b3b',133,ty-25,1,1); F('#ff3b3b',154,ty-25,1,1)} }
// three totem poles: carved faces, a thunderbird's wings on top
function drawTotems(){ const F=(c,x,y,w,h)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h)}, y=VAN.totems.y;
  [[VAN.totems.x-8,'#c8322b','#2f8a8a',17],[VAN.totems.x,'#2f8a8a','#c8322b',20],[VAN.totems.x+8,'#c8322b','#1d1d22',16]].forEach(([x,a,b,h])=>{
    F('rgba(0,0,0,.25)',x-1,y,6,2); F('#7a4a2a',x,y-h,4,h); F('#96643c',x,y-h,1,h); F('#5a3418',x+3,y-h,1,h);
    for(let k=y-h+2;k<y-2;k+=5){F('#f2efe6',x,k,4,2); F('#1d1d22',x,k,1,1); F('#1d1d22',x+3,k,1,1); F(a,x,k+2,4,1); F(b,x+1,k+3,2,1)}
    F(a,x-3,y-h+1,10,2); F('#1d1d22',x-3,y-h+3,3,1); F('#1d1d22',x+4,y-h+3,3,1); F(b,x+1,y-h-1,2,2) }) }
// the Brockton Point lighthouse: white, a red band, a red lantern room that blinks
function drawVanLight(){ const F=(c,x,y,w,h)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h)}, {x,y}=VAN.light;
  F('rgba(0,0,0,.25)',x-3,y,8,2); F('#8a8478',x-3,y-2,8,2); F('#f2efe6',x-2,y-14,6,12); F('#d6d0c4',x+3,y-14,1,12); F('#c8322b',x-2,y-9,6,3); F('#1d1d22',x,y-5,2,3);
  F('#c8322b',x-3,y-16,8,2); F('#2b2b33',x-2,y-19,6,3); F(Math.floor(time/700)%3?'#ffe9a8':'#fffbe0',x-1,y-18,4,2); F('#c8322b',x-1,y-21,4,2); F('#c8322b',x,y-22,2,1);
  if(Math.floor(time/700)%3===0){ctx.fillStyle='rgba(255,240,180,.25)'; ctx.fillRect(x-7,y-20,16,5)}
  F('#5a3a22',x-1,y-5,3,5); F('#ffe9a8',x,y-4,1,3);                                                        // a little door facing the trail
  if(VAN.lit){ const a=(time-VAN.lit)/700; ctx.save(); ctx.translate(x+1,y-17); ctx.rotate(a); const gr=ctx.createLinearGradient(0,0,60,0); gr.addColorStop(0,'rgba(255,240,180,.55)'); gr.addColorStop(1,'rgba(255,240,180,0)');
    ctx.fillStyle=gr; ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(60,-9); ctx.lineTo(60,9); ctx.closePath(); ctx.fill(); ctx.restore() } }   // once Joe's been up, the lamp sweeps its beam around
const vanRain=[...Array(150)].map(()=>({x:Math.random()*VCW,y:Math.random()*VCH}));
SCENES.vancouver={ place:VANCOUVER.place, music:'world',
  w:VCW, h:VCH, bounds:R(0,0,VCW,VCH), bg:vanBg, walk:VAN_WALK, solids:[], triggers:VAN_TRIGGERS,
  entries:{start:{x:144,y:14,dir:'down'}, fromBridge:{x:144,y:14,dir:'down'}, fromRoof:{x:181,y:285,dir:'down'}},
  ambient(dt){ for(const r of vanRain){r.y+=dt*.25; r.x-=dt*.05; if(r.y>VCH){r.y=-4; r.x=Math.random()*(VCW+40)} if(r.x<0)r.x+=VCW} },
  under(){ const F=(c,x,y,w,h)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),w,h)};
    ctx.fillStyle='rgba(170,200,230,.4)'; for(let i=0;i<26;i++){const k=Math.floor(time/500+i*.37), ph=((time/500+i*.37)%1), rx=(i*37+k*53)%VCW, ry=(i*61+k*29)%VCH, r=1+ph*3; if(!vanLand(rx,ry)&&!(rx>132&&rx<156&&ry<46))ctx.fillRect(rx-r,ry,r*2,1)}   // rain rings on the water
    {const bx=40+(Math.sin(time/7000)+1)*70, by=346, b=Math.round(Math.sin(time/900)); F('rgba(10,20,50,.3)',bx+1,by+5+b,12,1); F('#f2efe6',bx,by+b,12,5); ['#e54b4b','#f4a03a','#f4d35e','#4fbf73','#5fa8e8'].forEach((c,i)=>F(c,bx+1+i*2,by-2+b,2,2)); F('#ffe9a8',bx+2,by+2+b,8,1)}   // the little rainbow ferry on False Creek
    {const x=18+Math.sin(time/5000)*5, y=150; F('#e8a020',x,y,2,7); F('#f0c6a0',x,y+3,2,1); F('#3a3f4a',x-2+(Math.floor(time/400)%2)*4,y+3,2,1)}   // a kayak off Third Beach
    {const sx=258+Math.sin(time/9000)*10, sy=150; F('rgba(10,20,50,.25)',sx+1,sy+5,12,1); F('#f2efe6',sx,sy,12,3); F('#f4d35e',sx,sy+1,12,1); F('#f2efe6',sx+3,sy-3,3,9); F('#8a93a4',sx+11,sy+1,2,1)}   // a float plane taxiing in Coal Harbour
  },
  ents(list){
    list.push({y:VAN.tower.y+4,draw:drawVanTower},{y:VAN.totems.y,draw:drawTotems},{y:VAN.light.y,draw:drawVanLight},{y:VAN.clock.y,draw:()=>drawSteamClock(VAN.clock.x,VAN.clock.y)});
    VAN.cedars.forEach(([x,y])=>list.push({y,draw:()=>drawPine(x,y,mossCedar)}));
    for(const [cx,cy,ph] of VAN.crabs){ const x=cx+Math.sin(time/900+ph)*(cy>170?6:3); list.push({y:cy,draw:()=>drawCrab(x,cy,ph)}) }
  },
  over(){ const F=(c,x,y,w,h)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h)};
    {const dx=VAN.door.x, b=Math.floor(time/250)%3, c=Math.floor(time/250)%2?'#ffd84d':'#ff7ad1';                                     // blinking arrows either side of the sign, pointing down at the door
      for(const ax of [dx-28,dx+23]){ F(c,ax+1,261+b,3,4); F(c,ax-1,265+b,7,1); F(c,ax,266+b,5,1); F(c,ax+1,267+b,3,1); F(c,ax+2,268+b,1,1) }
      if(Math.floor(time/500)%2){F('rgba(255,216,77,.5)',156,244,48,1); F('rgba(255,216,77,.5)',156,258,48,1)}}
    for(let y=6;y<44;y+=6){const on=Math.floor(time/400+y)%4; F(on?'#fff3c4':'#ffffff',135,y,1,1); F(on?'#fff3c4':'#ffffff',152,y,1,1)}                 // lights along the bridge
    for(const [x,y] of [[90,228],[154,240],[226,228],[90,290],[208,276],[136,206],[40,276]]){ F('#4a4f60',x,y-14,1,14); F('#4a4f60',x-1,y-15,4,1); F('#ffe9a8',x+1,y-14,2,2);   // streetlamps
      const gr=ctx.createRadialGradient(x+2,y-8,1,x+2,y-4,18); gr.addColorStop(0,'rgba(255,225,150,.3)'); gr.addColorStop(1,'rgba(255,225,150,0)'); ctx.fillStyle=gr; ctx.fillRect(x-18,y-26,40,36)}
    {const gr=ctx.createLinearGradient(0,0,0,VCH); gr.addColorStop(0,'rgba(255,140,170,.12)'); gr.addColorStop(.5,'rgba(190,110,210,.09)'); gr.addColorStop(1,'rgba(70,90,190,.1)'); ctx.fillStyle=gr; ctx.fillRect(0,0,VCW,VCH)}   // dusk
    ctx.fillStyle='rgba(200,210,240,.3)'; for(const r of vanRain)ctx.fillRect(Math.round(r.x),Math.round(r.y),1,3);                                       // it's always raining in Vancouver
  },
};
