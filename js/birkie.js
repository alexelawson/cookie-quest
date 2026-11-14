// The Vikings ski the Birkie: guide a pack of Vikings (and the flour) from Cable to Main Street, Hayward.
// A lane runner on a skate trail: tap left/right to change lanes, jump fallen skiers, go around packs of slow skiers,
// grab a cup of flat Coke at each feed station and hold steady while you drink it. The sweep snowmobile is behind you.
const BIRK={
  W:224, L:2700,                         // course size (px)
  LANE:16,                               // distance between lanes (px); three lanes: -1, 0, 1
  LANE_MS:110,                           // how quickly you slide over to a new lane
  SPEED:{flat:.057, up:.039, down:.082, lake:.052, finish:.064},   // px per ms at full energy
  TIRED:.6,                              // speed multiplier at zero energy
  DRAIN:{up:.0019, other:.0008},         // energy lost per ms
  JUMP_LEN:28, JUMP_H:9,                 // a jump carries you this far down the trail (px), this high (so it feels the same uphill or down)
  CRASH_MS:1350, CRASH_COST:13,          // a crash: how long you're down, and the energy it costs
  BANANA:12,                             // the banana at Highway OO: this much energy, if you're in its lane
  DRINK_MS:2000, SPILL_KEEP:15,          // feed stations: hold steady this long to drink; a spill still gives you a little
  CUP_SWING:650,
  GUST_EVERY:2400, GUST_WARN:650,         // on the lake: a gust every ~2.4-3.6 s, with this much warning before it shoves you                         // the volunteer swings the cup between two lanes this often (ms)
  CLOCK:170,                             // the race clock runs 170x real time
  CUTOFF:3*3600,                         // the sweep snowmobile reaches the finish at 3:00:00
  SWEEP_START:15*60,                     // ...and leaves the start at 0:15:00, at a steady pace
  ELITE:2*3600+24*60,                    // under 2:24 gets a shout-out
  // simulated (tests/birkie-difficulty.js), with the pile-ups you have to jump: sharp 20/20 ~2:22, good 20/20 ~2:35, casual 15/20, distracted 3/20, never reacting 0/20
};
// course sections, top to bottom: the real landmarks of the Birkie skate course, in their real order (about 52 px per km):
// Cable start -> Powerline Hills -> The Wall (5K) -> Timber Trail (7K) -> Bobblehead Hill, where the snowmobilers watch (8K)
// -> Firetower Hill, the high point (11.5K) -> the Birkie Drop -> Boedecker Hill + aid station (16K) -> Highway OO (21K, cowbells and bananas)
// -> Gravel Pit aid station (29.5K) -> Mosquito Brook (35K) -> "that" hill at 39-40K (costumes, drums) -> Hatchery Creek aid station (41K)
// -> Sunset Hill -> Lake Hayward -> the International Bridge over Highway 63 -> Main Street, Hayward.
const BIRK_SECTIONS=[
  {y:0,    type:'flat', name:'Start · Cable'},
  {y:130,  type:'roll', name:'Powerline Hills'},
  {y:255,  type:'up',   name:'The Wall'},
  {y:315,  type:'flat', name:'Timber Trail'},
  {y:415,  type:'down', name:'Bobblehead Hill', turn:true},
  {y:500,  type:'up',   name:'Firetower Hill (high point)'},
  {y:625,  type:'down', name:'The Birkie Drop'},
  {y:760,  type:'up',   name:'Boedecker Hill'},
  {y:830,  type:'flat', name:''},
  {y:960,  type:'down', name:''},
  {y:1040, type:'flat', name:'Highway OO'},
  {y:1140, type:'roll', name:''},
  {y:1440, type:'flat', name:''},                 // (the Gravel Pit aid station: its arch says so)
  {y:1580, type:'roll', name:''},
  {y:1780, type:'flat', name:'Mosquito Brook'},
  {y:1860, type:'up',   name:'"That" hill (you know the one)'},
  {y:2030, type:'flat', name:''},                 // (the Hatchery Creek aid station)
  {y:2090, type:'roll', name:'Sunset Hill'},
  {y:2190, type:'lake', name:'Lake Hayward (windy!)'},
  {y:2400, type:'flat', name:'The International Bridge', bridge:true},
  {y:2500, type:'finish', name:'Main Street · Hayward'},
];
const LAKE_Y=2190;
const FEEDS=[{y:860,name:'BOEDECKER'},{y:1500,name:'GRAVEL PIT'},{y:2058,name:'HATCHERY CREEK'}];   // three of the real aid stations (the last one's just before Sunset Hill and the lake)
const FINISH_Y=2620;
const KM=FINISH_Y/50;   // px per kilometer
// trail centerline wanders; Timber Trail is twisty; Bobblehead has a sharp left turn; the lake, the bridge and Main Street are straight
function trailX(y){
  if(y>LAKE_Y)return 112;
  let x=112+44*Math.sin(y/260)+18*Math.sin(y/97);
  if(y>315&&y<415)x+=12*Math.sin((y-315)/11)*Math.sin((y-315)/100*Math.PI);   // Timber Trail: tight S-turns through the trees
  if(y>415&&y<560)x-=Math.min(34,(y-415)*.5)*Math.max(0,Math.min(1,(560-y)/50));   // Bobblehead's left turn at the bottom
  if(y>LAKE_Y-100)x=x+(112-x)*Math.min(1,(y-(LAKE_Y-100))/100);           // straighten out toward the lake
  return Math.max(46,Math.min(BIRK.W-46,x));
}
const BRIDGE={y0:2400,y1:2500};
const BROOK={y:1812}, OO={y:1080};   // where the trail crosses Mosquito Brook and Highway OO
const FIRETOWER={y:600}, POWERLINES=[168,232], BOBBLE={y:488}, GRAVEL={y:1470}, BANANA={y:OO.y+22};
const trailHalf=y=>y>=BRIDGE.y0&&y<BRIDGE.y1?18:y>=BRIDGE.y1+20?60:34;
const laneScale=y=>Math.min(1,trailHalf(y)/34);              // lanes squeeze together on the narrow bridge
const laneX=(y,lane)=>trailX(y)+lane*BIRK.LANE*laneScale(y);
function sectionAt(y){let s=BIRK_SECTIONS[0]; for(const t of BIRK_SECTIONS)if(y>=t.y)s=t; return s}
function terrainAt(y){const s=sectionAt(y); if(s.type!=='roll')return s.type; return Math.floor((y-s.y)/70)%2?'down':'up'}
// what's on the trail: skiers who fell (jump them) and packs of slow skiers across two lanes (go around).
// Never on the bridge, never right at a feed station; there's always a way through.
const OBSTACLES=(()=>{const out=[], lanes=[0,-1,1,0,1,-1,-1,0,1,1,0,-1], gaps=[112,92,128,84,104,118,96];
  let y=230, k=0; while(y<2540){
    if(!FEEDS.some(f=>y>f.y-90&&y<f.y+70)&&!(y>BRIDGE.y0-40&&y<BRIDGE.y1+40)&&Math.abs(y-BROOK.y)>24&&Math.abs(y-OO.y)>44){
      const lane=lanes[k%lanes.length];
      if(k%3===2)out.push({kind:'pack',y,lanes:lane===1?[0,1]:lane===-1?[-1,0]:[0,1]});
      else out.push({kind:'fallen',y,lanes:[lane]});
      k++ }
    y+=gaps[k%gaps.length] }
  // pile-ups: skiers tangled across all three lanes. No way around: jump them. Kept clear of everything else.
  const clear=y=>!FEEDS.some(f=>y>f.y-90&&y<f.y+70)&&!(y>BRIDGE.y0-40&&y<BRIDGE.y1+40)&&Math.abs(y-BROOK.y)>30&&Math.abs(y-OO.y)>50&&!out.some(o=>Math.abs(o.y-y)<46);
  for(const want of [380,700,1180,1640,1930,2290]){ let y=want; for(let d=0;d<90&&!clear(y);d+=6)y=clear(want+d)?want+d:want-d; if(clear(y))out.push({kind:'pileup',y,lanes:[-1,0,1]}) }
  out.sort((a,b)=>a.y-b.y);
  return out})();
const FALLEN=OBSTACLES.filter(o=>o.kind==='fallen');   // (kept for anything that still looks for fallen skiers)

const birk={running:false, v:0, energy:100, lane:0, lx:0, jumpD:0, crashT:0, t:0, trail:[], vikings:[], msg:'', msgT:0, drink:null, said:{}};
const birkBg=document.createElement('canvas'); birkBg.width=BIRK.W; birkBg.height=BIRK.L;
(function(){
  const g=birkBg.getContext('2d'), F=(c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),w,h)}, W=BIRK.W, L=BIRK.L;
  // deep snow: soft drifts with blue shadows and a little sparkle
  F('#dbe6f0',0,0,W,L); for(let i=0;i<1500;i++){const x=rnd()*W, y=rnd()*L, w=6+rnd()*14|0; F('#cddae6',x,y,w,1); F('#eaf1f7',x+1,y-1,w-2,1)}
  for(let i=0;i<1200;i++)F('#ffffff',rnd()*W|0,rnd()*L|0,1,1);
  // Lake Hayward: wind-scoured ice with snow drifts, a shoreline at each end
  F('#d2e3f0',0,LAKE_Y,W,BRIDGE.y0-LAKE_Y); for(let i=0;i<340;i++){const x=rnd()*W, y=LAKE_Y+rnd()*(BRIDGE.y0-LAKE_Y), w=5+rnd()*16|0; F(rnd()<.5?'#c2d6e6':'#e4eff7',x,y,w,1)}
  for(let i=0;i<26;i++){const x=rnd()*W|0, y=LAKE_Y+12+rnd()*(BRIDGE.y0-LAKE_Y-24)|0; for(let k=0;k<6+rnd()*8;k++)F('#b3cadc',x+k,y+(k>>2),1,1)}   // cracks in the ice
  for(let x=0;x<W;x+=2){const d=Math.round(Math.sin(x/13)*2+Math.sin(x/5)); F('#dbe6f0',x,LAKE_Y-2,2,5+d); F('#b9c9d6',x,LAKE_Y+3+d,2,1); F('#dbe6f0',x,BRIDGE.y0-10-d,2,10+d); F('#b9c9d6',x,BRIDGE.y0-11-d,2,1)}
  // the groomed skate trail: corduroy, soft snowbanks, faint lane lines. Climbs are shaded and herringboned; downhills are bright and streaky
  for(let y=0;y<L;y++){ const cx=trailX(y), hw=trailHalf(y), t=terrainAt(y), sc=laneScale(y);
    F(t==='up'?'#eaf0f6':t==='down'?'#fbfdfe':'#f5f8fb',cx-hw,y,hw*2,1); if(y%2===0)F(t==='up'?'#e1e9f1':'#ecf1f6',cx-hw+2,y,hw*2-4,1);
    F('#ffffff',cx-hw-2,y,3,1); F('#ffffff',cx+hw-1,y,3,1); F('#b9c9d8',cx-hw-3,y,1,1); F('#b9c9d8',cx+hw+2,y,1,1); F('#d3dee8',cx-hw+1,y,1,1); F('#dde6ee',cx+hw-2,y,1,1);                    // snowbanks, and the shadow under them
    if(hw>=30)for(const l of [-1,0,1]){ const lx=cx+l*BIRK.LANE*sc;
      if(t==='up'){ const k=y%6; if(k<3){F('#cfdae5',lx-4+k,y,2,1); F('#cfdae5',lx+3-k,y,2,1)} }                                      // herringbone tracks up the climb
      else if(t==='down'){ if(y%16<10){F('#e6edf4',lx-3,y,1,1); F('#e6edf4',lx+3,y,1,1)} }                                            // long fast tracks down
      else if(y%10<4&&l!==0)F('#e4ebf2',cx+l*8*sc,y,1,1) } }                                                 // faint lane lines on the flats
  // the start in Cable: the start pen (fences, wave flags, a warming tent), and the crowd seeing everyone off
  for(let y=0;y<74;y+=1){const cx=trailX(y); if(y%3===0){F('#c8322b',cx-40,y,1,2); F('#c8322b',cx+39,y,1,2)} if(y%12===0){F('#8a8f9a',cx-40,y-3,1,6); F('#8a8f9a',cx+39,y-3,1,6)}}
  for(let k=0;k<5;k++){const y=8+k*14, cx=trailX(y); for(const sd of [-1,1]){const x=cx+sd*44; F('#8a8f9a',x,y-9,1,11); F(['#4f2683','#ffc62f','#2f6db0','#c8322b','#2f8a4a'][k],x+(sd<0?-6:1),y-9,6,4)}}
  {const x=trailX(40)+52, y=44; F('rgba(0,0,0,.12)',x-1,y+12,30,3); F('#f4f1ea',x,y,28,12); F('#1d3f73',x-1,y-5,30,6); for(let k=0;k<30;k+=6)F('#ffffff',x-1+k,y-5,3,6); F('#5a3a22',x+11,y+4,6,8); pixText(g,'WAX',x+8,y-4,'#ffffff')}
  // Powerline Hills: a cleared corridor with steel pylons either side of the trail (the wires are drawn live, overhead)
  for(const py of POWERLINES){ for(let x=0;x<W;x+=3)F('#e4edf5',x,py-10+Math.round(Math.sin(x/17)*2),3,20);
    for(let y=py-12;y<py+12;y++){const cx=trailX(y), hw=trailHalf(y); F('#f5f8fb',cx-hw,y,hw*2,1); if(y%2===0)F('#ecf1f6',cx-hw+2,y,hw*2-4,1); F('#ffffff',cx-hw-2,y,3,1); F('#ffffff',cx+hw-1,y,3,1)}
    for(const x of [trailX(py)-64, trailX(py)+54]){ if(x<2||x>W-14)continue; F('rgba(0,0,0,.12)',x-2,py+3,16,3);
      F('#6f7686',x,py-34,1,38); F('#6f7686',x+10,py-34,1,38); for(let k=py-32;k<py+2;k+=7){F('#8b93a3',x,k,11,1); for(let d=0;d<7;d++){F('#8b93a3',x+1+d,k+d,1,1); F('#8b93a3',x+9-d,k+d,1,1)}}
      F('#6f7686',x-5,py-34,21,1); F('#6f7686',x-3,py-28,17,1); F('#c9ced4',x-5,py-33,1,2); F('#c9ced4',x+15,py-33,1,2) } }
  // Bobblehead Hill: the snowmobilers park at the bottom of the turn to watch the wipeouts (they're drawn live; these are their sleds)
  {const y=BOBBLE.y, cx=trailX(y); for(let k=0;k<4;k++){const x=cx+42+k*13, yy=y-6+(k%2)*5; if(x>W-12)break; F('rgba(0,0,0,.15)',x-1,yy+5,12,2);
     F(['#c8322b','#2f6db0','#f4d35e','#2f8a4a'][k],x,yy,10,5); F('#1d1d22',x+1,yy-2,6,2); F('#9fd2f0',x+7,yy-3,2,3); F('#1d1d22',x-1,yy+5,12,1); F('#c9ced4',x+8,yy+5,3,1)}}
  // the fire tower on Firetower Hill, the high point of the course: a steel lattice lookout with a cab on top
  {const x=trailX(FIRETOWER.y)+50|0, y=FIRETOWER.y; F('rgba(0,0,0,.12)',x-6,y+2,24,4);
    for(const lx of [x-4,x+12])F('#6b7280',lx,y-50,2,52); for(let k=y-48;k<y;k+=8){F('#8b93a3',x-4,k,18,1); for(let d=0;d<8;d++){F('#8b93a3',x-4+d*2,k+d,1,1); F('#8b93a3',x+12-d*2,k+d,1,1)}}
    F('#5a2a20',x-8,y-65,26,2); F('#7a3a2a',x-7,y-63,24,3); F('#a8504a',x-6,y-60,22,10); F('#ffe9a8',x-3,y-57,5,5); F('#ffe9a8',x+6,y-57,5,5); F('#c8d6e2',x-3,y-57,5,1); F('#ffffff',x-8,y-66,26,1);
    F('#8a5a34',x-12,y-4,1,6); F('#1d3f73',x-22,y-12,22,9); pixText(g,'1730',x-20,y-10,'#ffffff')}                                    // "1730 ft": the top
  // Highway OO: the road, snowbanks, parked cars, and the snow-packed ski bridge across it
  {const y=OO.y, cx=trailX(y)|0; F('#e6eef5',0,y-14,W,4); F('#5f6676',0,y-10,W,20); F('#6f7686',0,y-10,W,1); F('#f4d35e',0,y-1,W,2); for(let x=0;x<W;x+=10)F('#5f6676',x+6,y-1,3,2); F('#ffffff',0,y+10,W,3); F('#ffffff',0,y-13,W,3);
    for(const [x,c] of [[cx-78,'#c8322b'],[cx-98,'#2f6db0'],[cx+62,'#e9eef3'],[cx+84,'#2f8a4a']]){ if(x<2||x>W-16)continue; F('rgba(0,0,0,.2)',x+1,y+7,14,2); F(c,x,y+1,14,6); F(c,x+3,y-1,8,3); F('#9fd2f0',x+4,y,6,2); F('#1d1d22',x+1,y+6,3,2); F('#1d1d22',x+10,y+6,3,2)}
    F('#eef3f7',cx-36,y-12,72,24); for(let yy=y-12;yy<y+12;yy+=2)F('#e1e9f0',cx-34,yy,68,1); for(const sd of [-1,1]){F('#8a5a34',cx+sd*36-1,y-13,2,26); for(let yy=y-12;yy<y+13;yy+=6)F('#6b4428',cx+sd*36-2,yy,4,2)}
    F('#8a8f9a',cx+44,y-28,1,14); F('#2f8a4a',cx+38,y-36,14,9); F('#ffffff',cx+38,y-36,14,1); pixText(g,'OO',cx+41,y-34,'#ffffff')}
  // the Gravel Pit: an open pit beside the trail, gravel piles dusted with snow
  {const y=GRAVEL.y, sd=trailX(y)>112?-1:1, cx=trailX(y)+sd*74; for(let r=0;r<22;r++){const w=Math.round(Math.sqrt(1-((r-11)/11)**2)*30); F(r<3?'#cfc4ae':'#bfb198',cx-w,y-11+r,w*2,1)}
    for(let i=0;i<60;i++)F(rnd()<.5?'#a99a80':'#d9cfba',cx-26+rnd()*52|0,y-9+rnd()*18|0,2,1);
    for(const [dx,h] of [[-14,9],[4,12],[18,7]])for(let r=0;r<h;r++){F(r<3?'#ffffff':'#9c8e76',cx+dx-r,y-6-h+r+6,r*2+1,1)} }
  // Mosquito Brook: dark open water between iced edges, a plank bridge with rails
  {const y=BROOK.y, cx=trailX(y)|0; for(let x=0;x<W;x++){const w=Math.round(Math.sin(x/9)*2+Math.sin(x/23)*2); if(Math.abs(x-cx)<36)continue; F('#eaf2f8',x,y-6+w,1,12); F('#4f86ac',x,y-4+w,1,8); F('#7fb0d0',x,y-3+w,1,2); if(x%7===0)F('#cfe2ef',x,y+1+w,2,1)}
    F('#c9b08a',cx-36,y-7,72,14); for(let x=cx-36;x<cx+36;x+=4)F('#b09770',x,y-7,1,14); F('#f5f8fb',cx-33,y-7,66,14); for(let yy=y-7;yy<y+7;yy+=2)F('#ecf1f6',cx-31,yy,62,1);
    for(const sd of [-1,1]){F('#6b4428',cx+sd*35-1,y-9,2,18); F('#8a5a34',cx+sd*35-1,y-9,2,1); for(let yy=y-8;yy<y+9;yy+=5)F('#5a3418',cx+sd*35-2,yy,4,1)}}
  // on the lake: little evergreens stuck in the snow to mark the trail, ice-fishing shacks, a couple of snowmobile tracks
  for(let y=LAKE_Y+14;y<BRIDGE.y0-14;y+=18)for(const sd of [-1,1]){const x=112+sd*38; F('#2f5e3a',x-1,y-4,3,4); F('#356b42',x,y-6,1,2); F('#5a3a22',x,y,1,1)}
  for(const [x,y,c] of [[24,LAKE_Y+50,'#c8322b'],[186,LAKE_Y+86,'#2f6db0'],[30,LAKE_Y+140,'#2f8a4a'],[190,LAKE_Y+170,'#e8742a']]){ F('rgba(0,0,0,.12)',x+1,y+9,14,2); F(c,x,y,13,9); F('#1d1d22',x-1,y-2,15,2); F('#ffffff',x-1,y-3,15,1); F('#5a3a22',x+5,y+3,3,6); F('#8a8f9a',x+10,y-6,1,4); F('#0b0c12',x+18,y+6,3,2) }
  // the International Bridge over Highway 63 into town: the highway and its traffic underneath, railings (the flags are drawn live so they wave)
  F('#d8dfe6',0,BRIDGE.y0-6,W,BRIDGE.y1-BRIDGE.y0+12);
  F('#4a505e',0,BRIDGE.y0+30,W,40); F('#f4d35e',0,BRIDGE.y0+49,W,2); for(let x=0;x<W;x+=14){F('#ffffff',x,BRIDGE.y0+39,6,1); F('#ffffff',x+7,BRIDGE.y0+60,6,1)}
  for(const [x,y,c] of [[20,BRIDGE.y0+33,'#c8322b'],[60,BRIDGE.y0+53,'#e9eef3'],[160,BRIDGE.y0+34,'#2f6db0'],[196,BRIDGE.y0+54,'#f4d35e']]){F(c,x,y,14,7); F('#9fd2f0',x+3,y+1,7,2); F('#1d1d22',x+1,y+6,3,2); F('#1d1d22',x+10,y+6,3,2)}
  F('#9aa3b0',92,BRIDGE.y0,40,BRIDGE.y1-BRIDGE.y0); F('#f6f9fb',94,BRIDGE.y0,36,BRIDGE.y1-BRIDGE.y0); for(let y=BRIDGE.y0;y<BRIDGE.y1;y+=2)F('#ebf1f6',95,y,34,1);
  F('#5f6676',90,BRIDGE.y0,3,BRIDGE.y1-BRIDGE.y0); F('#5f6676',131,BRIDGE.y0,3,BRIDGE.y1-BRIDGE.y0); for(let y=BRIDGE.y0;y<BRIDGE.y1;y+=8){F('#8a8f9a',89,y,5,2); F('#8a8f9a',130,y,5,2)}
  // Main Street, Hayward: snow trucked in down the middle, brick storefronts with awnings on both sides, barriers with banners
  {const Y=BRIDGE.y1+24, cols=['#9a3f30','#7a8aa0','#c49a6a','#6b8f71','#b5654f','#8a6a4a'], awn=['#c8322b','#2f6db0','#2f8a4a','#e8742a','#4f2683'];
    F('#c9ced4',0,Y-4,W,L-Y+4); for(let y=Y-4;y<L;y++){F('#f5f8fb',52,y,120,1); if(y%2===0)F('#ecf1f6',54,y,116,1)}
    for(let k=0;k*30<L-Y;k++)for(const sd of [0,1]){ const x=sd?186:0, y=Y+k*30, c=cols[(k*2+sd)%cols.length], a=awn[(k+sd*2)%awn.length];
      F(c,x,y,38,27); for(let yy=y+2;yy<y+27;yy+=3)F('rgba(0,0,0,.09)',x,yy,38,1); F('#efe2c0',x,y,38,2); F('rgba(0,0,0,.25)',x,y+26,38,1);
      for(let w=0;w<3;w++){F('#2b3a4f',x+4+w*11,y+5,7,7); F('#ffd98a',x+5+w*11,y+6,5,5)} F('#ffffff',x,y-1,38,1);
      const ax=sd?x-5:x+38; for(let yy=y+3;yy<y+25;yy+=4){F(a,ax,yy,5,2); F('#ffffff',ax,yy+2,5,2)} }                                // striped awnings over the sidewalk
    for(let y=Y+2;y<L;y+=1){ if(y%3)for(const x of [50,172])F('#c8322b',x,y,2,1); }
    for(let y=Y+10;y<L-20;y+=24)for(const x of [44,173]){F(['#4f2683','#1d3f73','#2f8a4a'][(y/24|0)%3],x,y,7,12); F('#ffc62f',x+1,y+2,5,1); F('#ffffff',x+1,y+5,5,1)} }
  // feed stations: striped tents both sides, long tables of cups, drink coolers, boxes of cookies, and crushed cups down the trail after
  for(const f of FEEDS){const cx=trailX(f.y);
    for(const sd of [-1,1]){ const x=sd<0?cx-34-34:cx+34+4;
      F('rgba(0,0,0,.12)',x,f.y+4,30,3);
      F('#e8742a',x-2,f.y-26,34,6); for(let i=0;i<34;i+=8)F('#ffffff',x-2+i,f.y-26,4,6); for(let i=0;i<34;i+=4)F(i%8?'#ffffff':'#e8742a',x-2+i,f.y-20,4,2); F('#c85a1a',x-2,f.y-27,34,1);   // the tent roof, scalloped
      F('#8a8f9a',x-1,f.y-18,1,20); F('#8a8f9a',x+30,f.y-18,1,20);
      F('#8a5a34',x+1,f.y-7,28,9); F('#c49a6a',x+1,f.y-7,28,2);                                                                       // the table
      for(let i=0;i<7;i++){F('#ffffff',x+2+i*4,f.y-11,3,4); F('#4a2412',x+2+i*4,f.y-11,3,1)} for(let i=0;i<6;i++){F('#ffffff',x+4+i*4,f.y-8,3,3); F('#4a2412',x+4+i*4,f.y-8,3,1)}   // two rows of flat Coke
      const jx=sd<0?x+1:x+22; F('#e8742a',jx,f.y-17,7,7); F('#ffffff',jx,f.y-18,7,2); F('#1d1d22',jx+3,f.y-12,1,2);                  // the big orange drink cooler
      F('#b08355',sd<0?x+22:x+2,f.y-15,7,5); F('#8a5a34',sd<0?x+22:x+2,f.y-15,7,1);                                                   // a box of cookies
      F('#8a8f9a',x+14,f.y-40,1,14); F('#1d3f73',x+15,f.y-40,9,5); F('#ffc62f',x+15,f.y-38,9,1) }                                     // a flag on the tent
    for(let i=0;i<26;i++){const y=f.y+12+rnd()*70, sd=rnd()<.5?-1:1, x=trailX(y)+sd*(22+rnd()*11); F('#ffffff',x,y,2,1); F('#d9c8b8',x+2,y,1,1)} }   // crushed cups
  // a kilometer marker every 5K
  for(let k=5;k<50;k+=5){const y=Math.round(k*KM), x=Math.round(trailX(y)-trailHalf(y)-16); if(y>LAKE_Y&&y<BRIDGE.y1)continue; F('#8a5a34',x+6,y,1,7); F('#f4d35e',x,y-7,14,8); F('#1d1d22',x,y-7,14,1); F('#1d1d22',x,y,14,1); pixText(g,k+'K',x+(k<10?4:2),y-5,'#1d1d22')}
  // the forest: pines and paper birches (it IS the Birkebeiner), drawn back to front
  const clearOf=(x,y)=>POWERLINES.some(p=>Math.abs(y-p)<16)||Math.abs(y-OO.y)<24||Math.abs(y-BROOK.y)<12||FEEDS.some(f=>Math.abs(y-f.y+8)<34&&Math.abs(x-trailX(f.y))<76)
    ||(Math.abs(y-GRAVEL.y)<20&&(trailX(GRAVEL.y)>112?x<trailX(y):x>trailX(y)))||(Math.abs(y-FIRETOWER.y+26)<44&&x>trailX(y)&&x<trailX(y)+84)||(Math.abs(y-BOBBLE.y)<16&&x>trailX(y))||y<80;
  const trees=[]; for(let n=0;n<900;n++){const y=rnd()*(LAKE_Y-8), side=rnd()<.5?-1:1, x=trailX(y)+side*(trailHalf(y)+7+rnd()*rnd()*90); if(x<1||x>W-1||clearOf(x,y))continue; trees.push([x|0,y|0,rnd(),rnd()])}
  trees.sort((a,b)=>a[1]-b[1]);
  for(const [x,y,k,v] of trees){ F('rgba(60,90,120,.16)',x-1,y,9,2); F('rgba(60,90,120,.1)',x+3,y+1,8,1);                              // a blue shadow on the snow
    if(k<.3){ const h=13+v*6|0; F('#f4f1ea',x,y-h,2,h); F('#d9d4c8',x+1,y-h,1,h); for(let m=y-h+2;m<y;m+=3+(v*3|0))F('#3a3a3a',x+((m>>1)%2),m,1,1);   // paper birch
      F('#9a958a',x-3,y-h+1,3,1); F('#9a958a',x+2,y-h+3,3,1); F('#9a958a',x-2,y-h+5,2,1); F('#9a958a',x+2,y-h-1,2,1); F('#9a958a',x-1,y-h-2,1,2) }
    else { const big=k>.75, dk=v<.5?'#2a5636':'#2f5e3a', lt=v<.5?'#33653f':'#3a7248'; F('#5a3a22',x,y-2,2,3);
      if(big){F(dk,x-6,y-8,14,7); F(lt,x-5,y-13,12,6); F(dk,x-3,y-18,8,6); F(lt,x-2,y-21,6,4); F(dk,x,y-23,2,3); F('#ffffff',x-5,y-13,5,1); F('#ffffff',x-2,y-21,5,1); F('#ffffff',x-6,y-8,6,1); F('#e6eef5',x+2,y-17,4,1)}
      else {F(dk,x-4,y-8,10,7); F(lt,x-3,y-12,8,5); F(dk,x-1,y-15,4,4); F('#ffffff',x-3,y-12,7,1); F('#ffffff',x-4,y-8,4,1); F('#ffffff',x-1,y-15,3,1)} } }
})();
// a skate skier coming down the trail toward you, 15 x 25 px: race suit, a light blue Birkie bib with a number, a hat (beanie with a pom,
// headband, cowboy hat...), shades, poles. Two frames: weight on one ski while the other kicks out to the side, arms poling.
// o: jersey, trim, panels, pants, plaid, hat/band/pom, headband, cowboy, bare, hair, braids, glasses, bib (false = none), boot, ski, step, down (fallen)
function drawSkier(x,y,o={}){
  const X=Math.round(x)-7, Y=Math.round(y)-22, F=(c,dx,dy,w=1,h=1)=>{ctx.fillStyle=c;ctx.fillRect(X+dx,Y+dy,w,h)};
  if(o.down){ // sprawled in the snow: skis crossed, poles flung, hat knocked off
    const D=(c,dx,dy,w,h)=>F(c,dx+2,dy+6,w,h);
    D('rgba(0,0,0,.2)',-3,12,16,4);
    for(let k=0;k<14;k++){D('#2b2b36',-3+k,9+Math.floor(k/3),1,1); D('#2b2b36',-2+k,15-Math.floor(k/3),1,1)}   // crossed skis
    D(o.jersey||'#c8322b',0,9,8,4); D(o.pants||o.jersey||'#1d1d22',7,10,4,3); D('#f0c6a0',-2,9,3,3); D(o.cowboy||o.hat||o.headband||'#e8742a',-5,7,3,2); D('#ffffff',-6,7,1,1);
    D('#3b3b44',1,5,1,5); D('#3b3b44',9,13,4,1); if(o.bib!==false){D('#8fd4f2',2,10,4,2); D('#1d3a6b',3,10,2,1)} return}
  const st=o.step!=null?o.step:0, mir=st%2===1, hi=st%2===0, M=(c,dx,dy,w=1,h=1)=>F(c,mir?15-dx-w:dx,dy,w,h);   // M: mirrored on the other stride
  const jersey=o.jersey||'#fbfbf7', pants=o.pants||o.jersey||'#1d1d22', skin='#f0c6a0', ski=o.ski||'#d8e04a', tip=o.tip||'#1d1d22', boot=o.boot||'#3a3f4a';
  const cloth=(c,dx,dy,w,h,fn=F)=>{ fn(c,dx,dy,w,h); if(o.plaid)for(let a=0;a<w;a++)for(let b=0;b<h;b++)if((a+b+dx+dy)%2)fn(o.plaid,dx+a,dy+b,1,1) };   // (buffalo plaid, if you're that guy)
  F('rgba(0,0,0,.14)',2,21,12,3);
  // skis in a V, tips toward you: the gliding ski under you, the other kicked way out to the side
  for(let k=0;k<10;k++){ M(ski,5-(k>5?1:0),16+k,2,1); M(ski,10+((k+1)>>1),15+k,2,1) } M(tip,4,25,2,1); M(tip,15,24,1,1); M(tip,14,24,1,1);
  // legs: one bent under the hips (all your weight), one pushing out
  cloth(pants,4,13,3,5,M); cloth(pants,8,13,2,1,M); cloth(pants,9,14,2,1,M); cloth(pants,10,15,2,1,M); cloth(pants,11,16,2,2,M); M(boot,4,18,3,2); M(boot,11,18,3,2); M('rgba(255,255,255,.35)',4,18,3,1); M('rgba(255,255,255,.35)',11,18,3,1);
  if(o.stripe){M(o.stripe,4,13,1,5); M(o.stripe,12,16,1,2)}
  // hips + body, leaning over the gliding ski
  M(pants,4,11,6,2); M(jersey,3,5,7,7); if(o.trim)M(o.trim,3,5,7,1); if(o.panels){M(o.panels,3,6,1,6); M(o.panels,9,6,1,6)}
  if(o.bib!==false){ M('#8fd4f2',4,6,5,5); M('#bfe6f8',4,6,5,1); M('#1d3a6b',5,8,1,2); M('#1d3a6b',7,8,1,2); M('#ffffff',4,10,5,1) }   // the bib: light blue, a number
  // arms + poles: hands high and forward to plant, then low and past the hips
  for(const sd of [0,1]){ const A=(c,dx,dy,w=1,h=1)=>M(c,sd?13-dx-w:dx,dy,w,h), sleeve=(dx,dy,w,h)=>cloth(o.sleeve||jersey,dx,dy,w,h,A), glove=o.glove||'#1d1d22';
    if(hi){ sleeve(2,6,1,2); sleeve(1,7,1,2); A(glove,0,7,1,2); A('#5f6370',0,9,1,7); A('#5f6370',-1,16,1,6); A('#c9ced4',-1,22,2,1) }
    else  { sleeve(2,6,1,5); A(glove,2,11,1,1); A('#5f6370',1,12,1,4); A('#5f6370',0,16,1,5); A('#c9ced4',-1,21,2,1) } }
  // head: a buff round the neck, a face, and something on top
  const H=(c,dx,dy,w=1,h=1)=>M(c,dx-1,dy,w,h);
  H(o.buff||'#7fd0d8',5,4,5,1); H(skin,5,0,5,4);
  const hair=o.hair||'#8a5a34';
  if(o.braids){H(hair,4,2,1,5); H(hair,10,2,1,5)}
  if(o.bare){ H(hair,5,-1,5,2); H(hair,4,0,1,2); H(hair,10,0,1,2); H('#c99a66',6,-1,2,1) }
  else if(o.cowboy){ H(o.cowboy,5,-4,5,3); H('rgba(0,0,0,.12)',7,-4,1,2); H(o.band||'#1d1d22',5,-2,5,1); H(o.cowboy,2,-1,11,1); H(o.cowboy,2,-2,1,1); H(o.cowboy,12,-2,1,1) }
  else if(o.headband){ H(hair,5,-1,5,1); H(hair,4,0,1,2); H(hair,10,0,1,2); H(o.headband,5,0,5,1); H(hair,7,-2,2,1) }
  else { const h=o.hat||'#2f6db0'; H(h,4,-2,7,3); H(h,5,-3,5,1); H(o.band||'rgba(255,255,255,.35)',4,0,7,1); H(o.pom||'#ffffff',6,-5,3,2) }
  if(o.glasses){ H(o.glasses,5,1,5,2); H('rgba(255,255,255,.55)',6,1,1,1); H('rgba(255,255,255,.55)',9,1,1,1) } else { H('#2b2b2b',6,1,1,1); H('#2b2b2b',8,1,1,1) }
  H(o.glasses?'#b5654f':'#c97a62',7,3,1,1); if(o.paint){H(o.paint,5,2,1,1); H(o.paint,9,2,1,1)}   // (a smile; glitter on the cheeks, some years)
}
// the other racers: race suits (two-tone panels, trim), beanies with poms, headbands, shades... and a guy in a cowboy hat and buffalo plaid
const SKIER_LOOKS=[
  {jersey:'#1f2f5a',trim:'#ffffff',panels:'#c9d2e6',stripe:'#ffffff',hat:'#b99be0',band:'#d6c4f0',pom:'#b99be0',hair:'#8a5a34',braids:true,paint:'#ffffff',buff:'#c9a0e0'},   // navy suit, lavender hat, braids, glitter
  {jersey:'#1d1d22',sleeve:'#f4d35e',plaid:'#1d1d22',pants:'#f4d35e',cowboy:'#f2ead8',band:'#e8742a',glasses:'#1d1d22',tip:'#f4d35e'},                               // the cowboy hat and yellow plaid
  {jersey:'#2f6fe0',trim:'#ffffff',panels:'#1d3a8a',stripe:'#e54b4b',headband:'#e54b7a',glasses:'#e86aa8',hair:'#c99a5a',buff:'#5fd0e0'},                           // bright blue suit, pink shades
  {jersey:'#c8322b',trim:'#1d1d22',panels:'#1d1d22',pants:'#1d1d22',headband:'#ffffff',glasses:'#1d1d22',hair:'#3a2a1e'},
  {jersey:'#2f8a4a',trim:'#f4d35e',panels:'#1d4a2a',pants:'#1d1d22',hat:'#c8322b',band:'#ffffff',pom:'#ffffff'},
  {jersey:'#1d1d22',trim:'#2f8a4a',panels:'#2f8a4a',hat:'#7a4fa0',band:'#e8742a',pom:'#e8742a',glasses:'#e8742a',buff:'#2f8a4a'},
  {jersey:'#e8742a',trim:'#1d1d22',panels:'#1d1d22',pants:'#1d1d22',hat:'#e8742a',band:'#1d1d22',pom:'#1d1d22',glasses:'#5fa8e8'},
  {jersey:'#f2f2ee',trim:'#c8322b',panels:'#2f6db0',pants:'#2f6db0',stripe:'#c8322b',hat:'#c8322b',band:'#f2f2ee',pom:'#f2f2ee',hair:'#c99a5a',braids:true}];
// Joe: just Joe. His usual white shirt with the red trim, dark pants, his own brown hair (no hat, no bib)
const JOE_RACE_KIT=()=>({jersey:'#fbfbf7',trim:'#c8322b',panels:'#e3e3de',pants:'#2a2a33',stripe:'#c8322b',hair:'#a8794c',bare:true,bib:false,buff:'#c8322b',tip:'#c8322b',step:P.step});
const VIKING_KINDS=[{kind:'norse',sack:true},{kind:'football',num:'21'},{kind:'norse'},{kind:'football',num:'52'}];   // the lead Norse Viking carries the flour
function drawVikingSkier(x,y,v,step){
  const X=Math.round(x)-6, Y=Math.round(y)-17, F=(c,dx,dy,w,h)=>{ctx.fillStyle=c;ctx.fillRect(X+dx,Y+dy,w,h)}, fb=v.kind==='football', push=step%2;
  F('rgba(0,0,0,.2)',0,16,12,2);
  for(let k=0;k<13;k++){const d=Math.floor(k/(push?3:4)), e=Math.floor(k/(push?4:3)); F(fb?'#1d1d22':'#8a6a4a',4-d,5+k,1,1); F(fb?'#1d1d22':'#8a6a4a',7+e,5+k,1,1)}   // skis in a V
  F(fb?'#1d1d22':'#6b4a2f',0,6,1,9); F(fb?'#1d1d22':'#6b4a2f',11,6,1,9); if(!fb){F('#c9ced4',0,14,1,2); F('#c9ced4',11,14,1,2)}   // poles (the Norse ones look a lot like spears)
  if(fb){
    F('#ffc62f',3,11,2,4); F('#ffc62f',7,11,2,4); F('#4f2683',3,14,6,1);                  // gold pants, purple socks
    F('#4f2683',1,5,10,7); F('#ffc62f',1,5,2,2); F('#ffc62f',9,5,2,2); F('#3d1d66',1,5,10,1); pixText(ctx,v.num,X+3,Y+7,'#ffffff');   // jersey + pads + number
    F('#8a5a34',4,3,4,2); F('#4f2683',3,-1,6,5); F('#ffc62f',5,-1,2,5); F('#c9ced4',3,3,6,1); F('#c9ced4',5,2,1,3);   // helmet, stripe, facemask
    F('#7a4fc0',3,-1,2,1); F('#3d1d66',10,6,1,6); F('#e0a820',4,11,1,3); F('#e0a820',8,11,1,3);   // shading
  } else {
    F('#6b4a2f',3,11,2,4); F('#6b4a2f',7,11,2,4); F('#8a6a4a',3,14,2,1); F('#8a6a4a',7,14,2,1);   // leather trousers, fur boots
    F('#8a8f9a',2,6,8,6); F('#6f7480',3,7,1,1); F('#6f7480',5,8,1,1); F('#6f7480',7,7,1,1); F('#6f7480',4,10,1,1); F('#6f7480',8,9,1,1); F('#4a3020',2,10,8,1);   // chainmail, belt
    F('#7a5a3a',1,5,10,2); F('#9a7a54',2,5,8,1);                                            // fur over the shoulders
    F('#f0c6a0',4,1,4,3); F('#c8642a',3,3,6,3); F('#c8642a',4,6,4,1); F('#e08a4a',4,3,2,1);   // red beard
    F('#9aa3b0',3,-1,6,3); F('#c9ced4',4,-1,2,1); F('#f6f2e4',1,-2,2,2); F('#f6f2e4',9,-2,2,2); F('#e8e2d6',1,-4,1,2); F('#e8e2d6',10,-4,1,2);   // iron helmet, horns
    if(v.sack){F('#efe2c4',3,6,6,5); F('#c94a3a',4,8,4,1); F('#8a5a34',5,5,2,1)}         // the flour, on his back
    F('#2b2b2b',5,2,1,1); F('#2b2b2b',7,2,1,1); F('#e89a5a',3,5,1,1); F('#e89a5a',8,5,1,1); F('#6f7686',3,1,6,1); F('#d9cdb4',1,-1,1,1); F('#d9cdb4',10,-1,1,1);   // eyes, braid shine, helmet rim, horn shading
  }
}

// ---------- race ----------
function birkStart(){
  Object.assign(birk,{fx:[],banana:false,bananaLane:[-1,0,1][Math.floor(Math.random()*3)],gust:null,gustT:1800,vikingT:9000,afterFeed:0,msgWho:'John',running:true,v:.03,energy:100,lane:0,lx:0,jumpD:0,crashT:0,t:0,trail:[],msg:'',msgT:0,drink:null,said:{},hit:new Set(),prev:{}});
  FEEDS.forEach(f=>{f.used=false; f.cup=[-1,0,1][Math.floor(Math.random()*3)]; f.cup2=f.cup===0?(Math.random()<.5?-1:1):0}); birkSay(BIRKIE.radioStart[1]);
  P.x=trailX(30); P.y=30; P.dir='down';
  birk.vikings=[0,1,2,3].map(i=>({x:P.x,y:P.y-14*(i+1)}));
}
// which lane the cup is over right now (the volunteer swings it back and forth between two lanes)
const cupLane=(f,t=time)=>Math.floor(t/BIRK.CUP_SWING)%2?f.cup2:f.cup;
// messages from John on the radio (or a Viking, piping up), shown in a pop-up like the rest of the game
function birkSay(m,who='John'){birk.msg=m; birk.msgWho=who; birk.msgT=2200+m.length*45; birk.vikingT=Math.max(birk.vikingT||0,4000)}
const vikingSays=k=>{const fb=Math.random()<.5, a=(fb?BIRKIE.footballVikings:BIRKIE.vikings)[k]; birkSay(a[Math.floor(Math.random()*a.length)],fb?'Football Viking':'Viking')};
function birkOnce(k,m){if(!birk.said[k]){birk.said[k]=true; birkSay(m)}}
const birkAir=()=>birk.jumpD>0?Math.sin(Math.PI*Math.min(1,birk.jumpD/BIRK.JUMP_LEN))*BIRK.JUMP_H:0;
function spill(){ const d=birk.drink; if(!d)return; birk.drink=null; sfx('splash'); birk.energy=Math.min(100,birk.energy+BIRK.SPILL_KEEP); birkSay(BIRKIE.spill[Math.floor(Math.random()*BIRKIE.spill.length)]) }
// little bits of snow: spray when you change lanes or land, a burst when you crash
function birkSnow(x,y,n,dir=0,pow=1){ if(!birk.fx)birk.fx=[]; for(let k=0;k<n;k++)birk.fx.push({x:x+(Math.random()-.5)*6,y:y-Math.random()*3,vx:(dir*.03+(Math.random()-.5)*.04)*pow,vy:-(.01+Math.random()*.035)*pow,life:260+Math.random()*240,c:Math.random()<.5?'#ffffff':'#d7e3ee'}) }
function birkLane(d){ if(!birk.running||birk.crashT>0)return; const n=Math.max(-1,Math.min(1,birk.lane+d)); if(n===birk.lane)return; birk.lane=n; sfx('whoosh'); birkSnow(P.x,P.y,6,-d); if(birk.drink)spill() }
function birkJump(){ if(!birk.running||birk.crashT>0||birk.jumpD>0)return; birk.jumpD=.001; sfx('jump'); if(birk.drink)spill() }
function birkTap(){ birkJump() }   // the A button
// where the sweep snowmobile is: leaves the start at SWEEP_START, reaches the finish at CUTOFF
const sweepY=()=>{const c=birk.t*BIRK.CLOCK/1000; return Math.max(0,Math.min(1,(c-BIRK.SWEEP_START)/(BIRK.CUTOFF-BIRK.SWEEP_START)))*FINISH_Y};
const clockStr=ms=>{const s=Math.floor(ms*BIRK.CLOCK/1000), h=Math.floor(s/3600), m=Math.floor(s%3600/60), x=s%60; return `${h}:${String(m).padStart(2,'0')}:${String(x).padStart(2,'0')}`};
const curLane=()=>Math.round(birk.lx/(BIRK.LANE*laneScale(P.y)||1));
function birkUpdate(dt){
  if(!birk.running)return;
  birk.t+=dt; if(birk.msgT>0)birk.msgT-=dt;
  if(birk.fx){ for(const f of birk.fx){f.x+=f.vx*dt; f.y+=f.vy*dt; f.vy+=.00012*dt; f.life-=dt} birk.fx=birk.fx.filter(f=>f.life>0) }
  // taps: a fresh press of left/right changes lane, up jumps (holding a key doesn't keep switching)
  for(const k of ['left','right','up']){ if(dirs[k]&&!birk.prev[k]){ if(k==='up')birkJump(); else birkLane(k==='left'?-1:1) } birk.prev[k]=dirs[k] }
  if(sweepY()>=P.y)return birkFinish(false);                       // the sweep caught you
  if(P.y-sweepY()<160)birkOnce('sweep'+Math.floor(P.y/400),BIRKIE.sweepClose);
  if(birk.crashT>0){birk.crashT-=dt; return}
  const terr=terrainAt(P.y);
  birk.energy=Math.max(0,birk.energy-dt*(terr==='up'?BIRK.DRAIN.up:BIRK.DRAIN.other));
  if(birk.energy<20)birkOnce('bonk'+Math.floor(P.y/500),BIRKIE.bonk);
  const target=(BIRK.SPEED[terr]||BIRK.SPEED.flat)*(BIRK.TIRED+(1-BIRK.TIRED)*birk.energy/100);
  birk.v+=(target-birk.v)*Math.min(1,dt/400);
  // slide toward your lane, and move down the trail
  const want=birk.lane*BIRK.LANE*laneScale(P.y); birk.lx+=(want-birk.lx)*Math.min(1,dt/BIRK.LANE_MS);
  P.y+=birk.v*dt; if(birk.jumpD>0){birk.jumpD+=birk.v*dt; if(birk.jumpD>=BIRK.JUMP_LEN){birk.jumpD=0; birkSnow(P.x,P.y,7,0,.8)}}   // (a puff of snow when you land)
  P.x=trailX(P.y)+birk.lx; P.moving=true; P.t+=dt; if(P.t>200){P.t=0;P.step++}
  P.dir=Math.abs(want-birk.lx)>2?(want>birk.lx?'right':'left'):'down';
  // the Vikings follow your tracks (and hop where you hopped)
  const t=birk.trail; t.push({x:P.x,y:P.y,air:birkAir()}); if(t.length>600)t.shift();
  birk.vikings.forEach((v,i)=>{let need=(i+1)*14, k=t.length-1, acc=0; while(k>0&&acc<need){acc+=Math.hypot(t[k].x-t[k-1].x,t[k].y-t[k-1].y);k--} const g=t[Math.max(0,k)]; v.x=g.x; v.y=g.y; v.air=g.air||0});
  // obstacles
  const lane=curLane();
  for(const o of OBSTACLES){ if(birk.hit.has(o))continue; const oy=obstacleY(o); if(Math.abs(P.y-oy)>5)continue;
    if(!o.lanes.includes(lane))continue;
    if(o.kind!=='pack'&&birkAir()>2)continue;                       // cleared it (fallen skiers and pile-ups can be jumped; packs can't)
    birk.hit.add(o); birk.crashT=BIRK.CRASH_MS; birk.v=0; birk.jumpD=0; birk.energy=Math.max(0,birk.energy-BIRK.CRASH_COST); sfx('crash'); birkSnow(P.x,P.y,22,0,1.8);
    if(birk.drink)spill(); else if(o.kind!=='pack'&&Math.abs(P.y-BOBBLE.y)<90)birkSay(BIRKIE.bobble,'Snowmobiler'); else birkSay(o.kind==='pack'?BIRKIE.packCrash[Math.floor(Math.random()*BIRKIE.packCrash.length)]:BIRKIE.crash[Math.floor(Math.random()*BIRKIE.crash.length)]);
    break }
  for(const o of OBSTACLES)if(o.kind==='pileup'&&o.y-P.y>0&&o.y-P.y<110)birkOnce('pile'+o.y,BIRKIE.pileupAhead);
  // feed stations: be in the cup's lane to grab it, then hold steady (no jumping, no lane changes) until it's down
  for(const f of FEEDS){ if(!f.used&&f.y-P.y<150&&f.y>P.y)birkOnce('feedAhead'+f.y,BIRKIE.feedAhead);
    if(!f.used&&P.y>=f.y){ f.used=true;
      if(lane===cupLane(f)&&birkAir()<2){ birk.drink={t:0}; sfx('pickup'); birkSay(BIRKIE.grab) } else birkSay(BIRKIE.feedMissed) } }
  if(!birk.banana&&P.y>=BANANA.y){ birk.banana=true; if(lane===birk.bananaLane&&birkAir()<2){ birk.gotBanana=true; birk.energy=Math.min(100,birk.energy+BIRK.BANANA); sfx('pickup'); birkSay(BIRKIE.banana) } }   // a banana at OO: a little boost, no stopping
  if(birk.drink){ birk.drink.t+=dt; if(birk.drink.t>=BIRK.DRINK_MS){ birk.drink=null; birk.energy=100; birkSay(BIRKIE.feed); birk.afterFeed=1500; sfx('glug'); setTimeout(()=>sfx('glug'),120); setTimeout(()=>sfx('glug'),240) } }
  for(const sec of BIRK_SECTIONS)if(sec.type==='up'&&sec.y>400&&P.y>sec.y-40&&P.y<sec.y&&(sec.y===500||sec.y===1860))birkOnce('climb'+sec.y,BIRKIE.climb);   // the two big climbs: Firetower and "that" hill
  if(P.y>25*KM&&P.y<25*KM+40)birkOnce('half',BIRKIE.halfway); if(P.y>LAKE_Y+10&&P.y<LAKE_Y+50)birkOnce('lake',BIRKIE.lake); if(P.y>BRIDGE.y0-30&&P.y<BRIDGE.y0)birkOnce('bridge',BIRKIE.bridge);
  // crosswind on the lake: a gust is coming (you can see the snow streak), then it shoves you a lane
  if(terr==='lake'&&!FEEDS.some(f=>Math.abs(P.y-f.y)<110)){ birk.gustT=(birk.gustT??1800)-dt;
    if(birk.gustT<=0&&!birk.gust){ birk.gust={t:BIRK.GUST_WARN, dir:birk.lane>=1?-1:birk.lane<=-1?1:(Math.random()<.5?-1:1)}; birkOnce('gust',BIRKIE.gust) }
    if(birk.gust){ birk.gust.t-=dt; if(birk.gust.t<=0){ birk.lane=Math.max(-1,Math.min(1,birk.lane+birk.gust.dir)); sfx('whoosh'); birk.gust=null; birk.gustT=BIRK.GUST_EVERY+Math.random()*1200 } } }
  else birk.gust=null;
  // the Vikings pipe up now and then (and always have something to say about the flat Coke)
  if(birk.afterFeed>0){birk.afterFeed-=dt; if(birk.afterFeed<=0)vikingSays('feed')}
  birk.vikingT=(birk.vikingT||9000)-dt;
  if(birk.vikingT<=0&&birk.msgT<=0){ vikingSays(P.y>BRIDGE.y0-40?'finish':terrainAt(P.y)==='up'?'climb':terrainAt(P.y)==='lake'?'lake':'tired'); birk.vikingT=9000+Math.random()*6000 }
  if(P.y>=FINISH_Y)birkFinish(true);
}
let radioShown=null;
function birkRadio(){
  const show=birk.running&&birk.msgT>0&&!paused, el=$('radio');
  if(!show){ if(!el.hidden)el.hidden=true; radioShown=null; return }
  const key=birk.msgWho+'|'+birk.msg; if(radioShown===key&&!el.hidden)return; radioShown=key;
  const who=birk.msgWho==='John'?'Trail John':birk.msgWho, p=PORTRAITS[who]||PORTRAITS['Trail John'], g=$('radioFace').getContext('2d');
  g.fillStyle=p.bg; g.fillRect(0,0,40,40); g.save(); g.scale(40/p.size,40/p.size); p.draw(g); g.restore();
  $('radioWho').textContent=birk.msgWho==='Snowmobiler'?BIRKIE.sledName:birk.msgWho==='Viking'?BIRKIE.vikingName:birk.msgWho==='Football Viking'?BIRKIE.footballName:BIRKIE.john+' '+BIRKIE.onRadio; $('radioText').textContent=birk.msg; el.hidden=false;
}
// on a phone: swipe left/right on the game to change lanes, swipe up (or tap) to jump
{let sw=null; cv.addEventListener('pointerdown',e=>{ if(scene===SCENES.birkie&&birk.running)sw={x:e.clientX,y:e.clientY} });
  cv.addEventListener('pointerup',e=>{ if(!sw)return; const dx=e.clientX-sw.x, dy=e.clientY-sw.y; sw=null;
    if(Math.abs(dx)>24&&Math.abs(dx)>Math.abs(dy))birkLane(dx>0?1:-1); else birkJump() });
  cv.addEventListener('pointercancel',()=>{sw=null}) }
// where an obstacle is on the trail
const obstacleY=o=>o.y;   // (packs used to creep along; it made unfair pile-ups with fallen skiers)
const J=t=>[BIRKIE.john,t,'Trail John'];   // a line from John, with his face
function birkFinish(made){
  sfx(made?'fanfare':'buzz');
  birk.running=false; birk.drink=null; $('radio').hidden=true; const tm=clockStr(birk.t); FEEDS.forEach(f=>f.used=false);
  if(made){ have.birkie=true; have.birkieTime=tm; save(); const elite=birk.t*BIRK.CLOCK/1000<BIRK.ELITE;
    say([J(BIRKIE.finishWin(tm)[0]),J(elite?BIRKIE.elite:BIRKIE.finishWin(tm)[1]),['Alex',BIRKIE.alexCheer],J(BIRKIE.vikingsWin),J(BIRKIE.johnDone)],()=>showReward('mill',()=>goTo('world','fromMill'))) }   // John hands you the flour right there
  else say([J(BIRKIE.finishLate(tm)[0]),J(BIRKIE.finishLate(tm)[1])],()=>showDialog({place:BIRKIE.place,speaker:BIRKIE.john,face:'Trail John',pages:[BIRKIE.againAsk],actions:[{label:BIRKIE.again,fn:()=>{closeDialog();birkStart()}},{label:BIRKIE.leave,ghost:true,fn:()=>{closeDialog();goTo('world','fromMill')}}]}));
}
function birkHowTo(then){
  const T=BIRKIE;
  const c=document.createElement('canvas'); c.width=c.height=32; const g=c.getContext('2d'); g.fillStyle='#d6e4ef'; g.fillRect(0,0,32,32);
  // draw a Viking skier into the little picture
  g.save(); g.scale(2,2); const F=(col,x,y,w,h)=>{g.fillStyle=col;g.fillRect(x,y,w,h)};
  F('#2b2b36',4,3,1,13); F('#2b2b36',11,3,1,13); F('#ffc62f',5,10,6,4); F('#4f2683',5,4,6,6); F('#ffc62f',5,4,6,1); F('#f0c6a0',6,1,4,3); F('#4f2683',5,0,6,2); F('#f6f2e4',4,-1,1,3); F('#f6f2e4',11,-1,1,3);
  g.restore();
  const row=document.createElement('div'); row.className='hrow'; const tx=document.createElement('div'); tx.innerHTML='<b>The Vikings</b><span>Strong. Not good skiers. They follow your tracks exactly, flour and all.</span>'; row.append(c,tx);
  $('howTitle').textContent=T.howToTitle; $('howRows').replaceChildren(row);
  $('howControls').replaceChildren(...T.howToSteps.map(x=>{const li=document.createElement('li'); li.textContent=x; return li}));
  $('howOk').textContent=T.howToOk; $('howOk').onclick=()=>{ $('howto').hidden=true; paused=false; then&&then() };
  paused=true; prompt.hidden=true; $('howto').hidden=false; setTimeout(()=>$('howOk').focus({preventScroll:true}),0);
}
// John at the trailhead (not heist John): brown hair, reading glasses, Birkie volunteer jacket, clipboard
function trailJohnDir(){ const dx=P.x-331, dy=P.y-81; return scene!==SCENES.world||Math.hypot(dx,dy)>60?'down':Math.abs(dx)>Math.abs(dy)?(dx<0?'left':'right'):(dy<0?'up':'down') }
const TJOHN_PAL={H:'#6b4429',h:'#4f301b',L:'#8a5a38',S:'#eab896',s:'#d4a07c',G:'#c9a24a',W:'#ffffff',E:'#2b2236',M:'#b5735a',C:'#1d3f73',c:'#163261',l:'#2a5590',R:'#c8322b',w:'#ffffff'};
const TJOHN_SPR={
  down: ["...HHHHH...","..HHLLHHH..","..HSSSSSH..","..GGGSGGG..","..GEWGWEG..","..sSSSSSs..","...SMMMS...","..CCwwwCC..",".CCCCCCCCC.","CClCCCCCcCC","CRRRRRRRRRC","CCCCCCCCcCC","CCCCCCCCcCC","SCCCCCCCcCS",".ccccccccc."],
  up:   ["...HHHHH...","..HHLLHHH..","..HHHHHHH..","..HHHLHHH..","..HhHHHhH..","..shhhhhs..","...sSSSs...","..CCCCCCC..",".CCCCCCCCC.","CCCCCCCCcCC","CRRRRRRRRRC","CCCCCCCCcCC","CCCCCCCCcCC","SCCCCCCCcCS",".ccccccccc."],
  right:["...HHHHH...","..HHLLHHH..","..HHHSSSS..","..HHSSGGG..","..HhSSGEG..","..hSSSSSSS.","...sSSMS...","..CCCCww...","..CCCCCCC..","..CCClCCc..","..RRCCCRR..","..CCCCCCc..","..CCCCCCc..","..CCCSSCc..","..ccccccc.."],
};
function drawTrailJohn(cx,cy,dir){
  const x=Math.round(cx)-5, y=Math.round(cy)-21, F=(c,dx,dy,w,h)=>{ctx.fillStyle=c;ctx.fillRect(x+dx,y+dy,w,h)};
  F('rgba(0,0,0,.25)',1,20,9,2);
  F('#b59a6e',2,15,3,5); F('#b59a6e',6,15,3,5); F('#9a805a',4,15,1,5); F('#9a805a',8,15,1,5); F('#2b2b2b',2,19,3,2); F('#2b2b2b',6,19,3,2); F('#4a4a55',2,19,2,1); F('#4a4a55',6,19,2,1);   // khakis, boots
  drawSprite(ctx,x,y,TJOHN_SPR,TJOHN_PAL,dir||'down',4,9);
  if(dir==='down'||!dir){F('#8a5a34',8,10,3,5); F('#ffffff',8,11,3,3); F('#8a8f9a',8,12,2,1); F('#8a8f9a',8,13,1,1); F('#c9ced4',9,10,1,1); F('#eab896',10,13,1,1)}   // the clipboard, with notes
}
function talkJohn(){
  const T=BIRKIE;
  if(have.mill)return showDialog({place:T.place,speaker:T.john,face:'Trail John',pages:[T.johnAfter],actions:have.baked?[{label:REPLAY.birkie,fn:()=>{closeDialog();goTo('birkie','start')}},CLOSE]:[CLOSE]});
  if(have.birkie)return showDialog({place:T.place,speaker:T.john,face:'Trail John',pages:[T.johnDone],actions:[{label:T.takeFlour,fn:()=>{closeDialog();showReward('mill')}}]});
  showDialog({place:T.place,speaker:T.john,face:'Trail John',pages:T.johnHello,actions:[{label:T.go,fn:()=>{closeDialog();goTo('birkie','start')}},{label:T.later,ghost:true,fn:closeDialog}]});
}

// a snowmobiler's face for the radio pop-up: a red helmet, a dark visor, a big grin
PORTRAITS['Snowmobiler']={size:32, bg:'#d6e4ef', draw(g){ const F=(c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};
  F('#1d1d22',6,24,20,8); F('#f4d35e',6,27,20,1); F('#c8322b',7,4,18,18); F('#e0584c',9,5,8,3); F('#8e1f1a',23,6,2,14); F('#1d1d22',9,10,14,6); F('#4a5a78',10,11,6,2);
  F('#f0c6a0',10,17,12,6); F('#ffffff',12,19,8,2); F('#8a3a2a',12,21,8,1); F('#c8322b',7,20,3,4); F('#c8322b',22,20,3,4); F('#ffffff',14,2,4,2) }};
const johnFace=document.createElement('canvas'); johnFace.width=johnFace.height=32;   // painted once the portraits load
setTimeout(()=>{const g=johnFace.getContext('2d'); const pt=PORTRAITS['Trail John']; g.fillStyle=pt.bg; g.fillRect(0,0,32,32); pt.draw(g)},0);
const birkStartArch=archSprite(60,24,g=>{const F=(c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};
  F('#8a8f9a',0,0,3,24); F('#8a8f9a',57,0,3,24); F('#1d3f73',0,0,60,16); F('#c8322b',0,0,60,2); F('#c8322b',0,14,60,2);
  pixText(g,'AMERICAN',13,3,'#ffffff'); pixText(g,'BIRKEBEINER',8,9,'#ffffff')});
SCENES.birkie={ place:BIRKIE.place, music:'birkie',
  w:BIRK.W, h:BIRK.L, bounds:R(0,0,BIRK.W,BIRK.L), bg:birkBg, solids:[], triggers:[],
  entries:{start:{x:112,y:30,dir:'down'}},
  leave(){ $('radio').hidden=true },
  enter(){ birk.running=false; P.x=trailX(30); P.y=30; birk.vikings=[0,1,2,3].map(i=>({x:P.x,y:16-i*14})); birk.introPending=true },
  speed:()=>0,                                  // you don't walk here; birkUpdate moves you
  ability:()=>birkTap(),
  abilityLabel:()=>birk.running?'Jump':'',
  update(dt){
    if(birk.introPending){birk.introPending=false; return birkHowTo(()=>say([J(BIRKIE.radioStart[0])],()=>birkStart()))}
    birkUpdate(dt);
  },
  drawPlayer:(x,y)=>{ if(birk.crashT>0)return drawSkier(x,y,{down:true,jersey:'#fbfbf7',pants:'#2a2a33',hat:'#a8794c'}); const h=birkAir();   // Joe, looking like Joe
    if(h>0){ctx.fillStyle='rgba(0,0,0,.15)'; ctx.fillRect(Math.round(x)-5,Math.round(y)-1,10,2)}                       // shadow stays on the snow
    drawSkier(x,y-h,JOE_RACE_KIT());
    if(birk.drink){const X=Math.round(x)+5, Y=Math.round(y-h)-12; ctx.fillStyle='#ffffff'; ctx.fillRect(X,Y,3,4); ctx.fillStyle='#4a2412'; ctx.fillRect(X,Y,3,2)} },
  under(){
    for(const o of OBSTACLES){const oy=obstacleY(o); if(Math.abs(oy-P.y)>200)continue;
      const look=k=>SKIER_LOOKS[(Math.floor(o.y/7)+k)%SKIER_LOOKS.length];
      if(o.kind==='fallen')drawSkier(laneX(oy,o.lanes[0]),oy,{down:true,...look(0)});
      else if(o.kind==='pileup'){ o.lanes.forEach((l,i)=>drawSkier(laneX(oy,l)+(i-1)*2,oy+(i%2)*2-1,{down:true,...look(i)}));   // a tangle across the whole trail
        const cx=Math.round(trailX(oy)); ctx.fillStyle='#3b3b44'; for(let k=0;k<5;k++)ctx.fillRect(cx-22+k*10,oy-4+(k%2)*6,6,1);   // poles everywhere
        if(Math.floor(time/250)%2){ctx.fillStyle='#e8742a'; ctx.fillRect(cx-30,oy-14,2,8); ctx.fillRect(cx+28,oy-14,2,8); ctx.fillStyle='#ffffff'; ctx.fillRect(cx-30,oy-14,2,2); ctx.fillRect(cx+28,oy-14,2,2)} }   // flashing marker stakes
      else o.lanes.forEach((l,i)=>drawSkier(laneX(oy,l),oy-(i%2)*2,{...look(i+2),step:Math.floor(time/300)+i}))}
    // feed stations: an arch with the station's name, strings of pennants, and a line of volunteers holding out cups and cheering
    for(const f of FEEDS){ if(Math.abs(f.y-P.y)>220)continue; const cx=Math.round(trailX(f.y)), hw=34, w=textW(f.name)+10;
      ctx.fillStyle='#8a8f9a'; ctx.fillRect(cx-hw-3,f.y-30,2,32); ctx.fillRect(cx+hw+1,f.y-30,2,32);
      ctx.fillStyle='#1d3f73'; ctx.fillRect(cx-hw-3,f.y-36,hw*2+6,12); ctx.fillStyle='#ffc62f'; ctx.fillRect(cx-hw-3,f.y-36,hw*2+6,1); ctx.fillRect(cx-hw-3,f.y-25,hw*2+6,1);
      pixText(ctx,f.name,cx-Math.round(textW(f.name)/2),f.y-33,'#ffffff');
      for(let k=0;k<9;k++){ const x=cx-hw+2+k*8, sag=Math.round(Math.sin(k/8*Math.PI)*3); ctx.fillStyle=['#c8322b','#ffc62f','#2f8a4a','#ffffff','#e8742a'][k%5]; ctx.fillRect(x,f.y-23+sag,4,2); ctx.fillRect(x+1,f.y-21+sag,2,1) }   // pennants
      for(let k=0;k<6;k++){ const sd=k%2?1:-1, yy=f.y+18+(k>>1)*13, x=Math.round(trailX(yy)+sd*38), up=Math.sin(time/170+k*1.7)>.2;   // volunteers down both sides after the tents
        ctx.fillStyle='rgba(0,0,0,.15)'; ctx.fillRect(x-3,yy,7,2); ctx.fillStyle='#3a4458'; ctx.fillRect(x-2,yy-4,2,4); ctx.fillRect(x+1,yy-4,2,4);
        ctx.fillStyle='#e8742a'; ctx.fillRect(x-3,yy-10,7,6); ctx.fillStyle='#ffd84d'; ctx.fillRect(x-3,yy-8,7,1);                                  // orange vest, a reflective stripe
        ctx.fillStyle='#f0c6a0'; ctx.fillRect(x-2,yy-14,5,4); ctx.fillStyle=['#2f6db0','#c8322b','#7a4fa0'][k%3]; ctx.fillRect(x-2,yy-16,5,2); ctx.fillRect(x-1,yy-17,3,1);
        ctx.fillStyle='#e8742a'; ctx.fillRect(sd<0?x+4:x-5,yy-(up?12:9),2,1); ctx.fillStyle='#ffffff'; ctx.fillRect(sd<0?x+6:x-8,yy-(up?14:10),2,3); ctx.fillStyle='#4a2412'; ctx.fillRect(sd<0?x+6:x-8,yy-(up?14:10),2,1) } }
    // the cup of flat Coke, held out over one lane by a volunteer at the trail edge (with a bouncing arrow over it)
    for(const f of FEEDS){ if(f.used||f.cup==null||Math.abs(f.y-P.y)>200)continue; const cl=cupLane(f), x=Math.round(laneX(f.y,cl)), y=f.y+6, side=(f.cup+f.cup2)<0?-1:1, ex=Math.round(trailX(f.y)+side*37);
      ctx.fillStyle='#e8742a'; for(let k=0;k<16;k+=3){ctx.fillRect(x-7,y-12+k,1,2); ctx.fillRect(x+7,y-12+k,1,2)}   // dashed lines marking the lane to aim for
      ctx.fillStyle='#e8742a'; ctx.fillRect(ex-3,y-12,7,10); ctx.fillStyle='#f0c6a0'; ctx.fillRect(ex-2,y-17,5,5); ctx.fillStyle='#6b4428'; ctx.fillRect(ex-2,y-17,5,2);   // the volunteer
      ctx.fillStyle='#f0c6a0'; ctx.fillRect(Math.min(ex,x),y-8,Math.abs(ex-x),2);                              // a looong arm
      ctx.fillStyle='#ffffff'; ctx.fillRect(x-3,y-11,6,7); ctx.fillStyle='#4a2412'; ctx.fillRect(x-3,y-11,6,2); ctx.fillStyle='#d9d9d4'; ctx.fillRect(x+2,y-11,1,7);
      const b=Math.round(Math.sin(time/140)*2); ctx.fillStyle='#e8742a'; ctx.fillRect(x-3,y-20+b,7,1); ctx.fillRect(x-2,y-19+b,5,1); ctx.fillRect(x-1,y-18+b,3,1); ctx.fillRect(x,y-17+b,1,1) }
    // Highway OO: a volunteer holds a banana out over one lane (ski through it for a little boost)
    if(birk.running&&!birk.banana&&Math.abs(BANANA.y-P.y)<200){ const y=BANANA.y, x=Math.round(laneX(y,birk.bananaLane)), sd=birk.bananaLane<0?-1:1, ex=Math.round(trailX(y)+sd*38);
      ctx.fillStyle='#2f8a4a'; ctx.fillRect(ex-3,y-10,7,10); ctx.fillStyle='#f0c6a0'; ctx.fillRect(ex-2,y-15,5,5); ctx.fillStyle='#c8322b'; ctx.fillRect(ex-2,y-17,5,2); ctx.fillStyle='#f0c6a0'; ctx.fillRect(Math.min(ex,x),y-7,Math.abs(ex-x),2);
      ctx.fillStyle='#f4d35e'; ctx.fillRect(x-3,y-9,6,2); ctx.fillRect(x-4,y-10,2,2); ctx.fillRect(x+2,y-10,2,2); ctx.fillStyle='#8a6a2a'; ctx.fillRect(x-4,y-11,1,1); ctx.fillRect(x+3,y-11,1,1);
      const b=Math.round(Math.sin(time/140)*2); ctx.fillStyle='#f4d35e'; ctx.fillRect(x-3,y-19+b,7,1); ctx.fillRect(x-2,y-18+b,5,1); ctx.fillRect(x-1,y-17+b,3,1); ctx.fillRect(x,y-16+b,1,1) }
    // Bobblehead Hill: the snowmobilers at the bottom of the turn, helmets bobbing, waiting for a wipeout
    if(Math.abs(P.y-BOBBLE.y)<200)for(let k=0;k<4;k++){ const x=Math.round(trailX(BOBBLE.y)+45+k*13), y=BOBBLE.y-9+(k%2)*5, b=Math.round(Math.sin(time/110+k*2)*1.5); if(x>BIRK.W-8)break;
      ctx.fillStyle=['#1d1d22','#2b3a63','#1d1d22','#4a2a1a'][k]; ctx.fillRect(x,y-7,6,7); ctx.fillStyle=['#c8322b','#f4d35e','#2f8a4a','#e9eef3'][k]; ctx.fillRect(x,y-13+b,6,6); ctx.fillStyle='#1d1d22'; ctx.fillRect(x+1,y-11+b,4,2);
      if(birk.crashT>0&&Math.abs(P.y-BOBBLE.y)<90){ctx.fillStyle='#f0c6a0'; ctx.fillRect(x-1,y-12,1,4); ctx.fillRect(x+6,y-12,1,4)} }   // arms up when somebody goes down
    // the sweep snowmobile, when it's close enough to see
    {const sy=sweepY(); if(birk.running&&sy>0){const sx=Math.round(trailX(sy)); ctx.fillStyle='rgba(0,0,0,.2)'; ctx.fillRect(sx-6,sy+1,12,3);
      ctx.fillStyle='#c8322b'; ctx.fillRect(sx-5,sy-12,10,12); ctx.fillStyle='#2b2b36'; ctx.fillRect(sx-6,sy-14,2,16); ctx.fillRect(sx+4,sy-14,2,16); ctx.fillStyle='#9fd2f0'; ctx.fillRect(sx-3,sy-3,6,2);
      ctx.fillStyle='#ffd84d'; if(Math.floor(time/250)%2)ctx.fillRect(sx-1,sy-13,2,2)}}
    // start arch: the American Birkebeiner banner over the start line
    ctx.drawImage(birkStartArch,trailX(46)-30,24);
    // section signs
    ctx.font='7px monospace'; for(const s of BIRK_SECTIONS){ if(!s.name)continue; const sx=Math.round(trailX(s.y+10)+34+4), w=Math.ceil(ctx.measureText(s.name).width)+6, x=Math.max(2,Math.min(sx,BIRK.W-w-2));
      ctx.fillStyle='#8a5a34'; ctx.fillRect(x+4,s.y+10,2,8); ctx.fillStyle='#1d3f73'; ctx.fillRect(x,s.y,w,10); ctx.fillStyle='#ffffff'; ctx.fillText(s.name,x+3,s.y+7) }
    // flags of every country along both sides of the International Bridge, waving
    {const C=[['#c8322b','#ffffff','#c8322b'],['#2f6db0','#ffffff','#2f6db0'],['#2f8a4a','#ffffff','#c8322b'],['#ffc62f','#2f6db0','#ffc62f'],['#1d1d22','#c8322b','#ffc62f'],['#ffffff','#c8322b','#ffffff'],['#2f6db0','#ffc62f','#2f6db0'],['#c8322b','#ffc62f','#2f8a4a']];
      let k=0; for(let y=BRIDGE.y0+4;y<BRIDGE.y1;y+=12)for(const side of [-1,1]){const px=side<0?88:135, c=C[k++%C.length], w=Math.round(Math.sin(time/160+y/9+side)*1);
        ctx.fillStyle='#8a8f9a'; ctx.fillRect(px,y-10,1,12); for(let i=0;i<3;i++){ctx.fillStyle=c[i]; ctx.fillRect(px+(side<0?-7:1),y-10+i*2+(i===1?w:0),6,2)}}}
    // spectators: cowbells at the Highway OO crossing, a costumed crowd on "That" hill
    const fan=(x,y,c,hat,j)=>{const b=Math.sin(time/150+x+y)>.4?-1:0; ctx.fillStyle='rgba(0,0,0,.15)'; ctx.fillRect(x-1,y+6,6,2); ctx.fillStyle=c; ctx.fillRect(x,y+b,4,6); ctx.fillStyle='#f0c6a0'; ctx.fillRect(x+1,y-2+b,2,2);
      if(hat){ctx.fillStyle=hat; ctx.fillRect(x,y-4+b,4,2)} if(j%3===0){ctx.fillStyle='#c9a24a'; ctx.fillRect(x+4,y-1+b+(Math.floor(time/120)%2),2,2)}};   // some ring cowbells
    if(Math.abs(P.y-OO.y)<200)for(let i=0;i<10;i++){const side=i%2?1:-1, x=Math.round(trailX(OO.y)+side*(40+(i>>1)*7)), y=OO.y-16+(i%3)*4; fan(x,y,['#c8322b','#2f6db0','#ffc62f','#2f8a4a','#7a4fa0'][i%5],i%4?null:'#e8742a',i)}
    if(P.y>1700&&P.y<2180)for(let i=0;i<22;i++){const yy=1876+i*7, side=i%2?1:-1, x=Math.round(trailX(yy)+side*(39+(i*5)%10));
      const costume=[['#f4d35e','#f4d35e'],['#c8322b',null],['#4f2683','#ffc62f'],['#ffffff','#ffffff'],['#2f8a4a','#c8322b'],['#e54b7a','#e54b7a']][i%6]; fan(x,yy,costume[0],costume[1],i)}   // a banana, a tutu, Vikings fans, a snowman...
    if(P.y>1700&&P.y<2180){ const yy=1950, x=Math.round(trailX(yy)-52), hit=Math.floor(time/300)%2; ctx.fillStyle='rgba(0,0,0,.15)'; ctx.fillRect(x-1,yy+1,12,2);   // ...and the drummer
      ctx.fillStyle='#8a5a34'; ctx.fillRect(x,yy-8,10,8); ctx.fillStyle='#f4f1ea'; ctx.fillRect(x,yy-9,10,2); ctx.fillStyle='#c8322b'; ctx.fillRect(x,yy-5,10,1); ctx.fillStyle='#5a3a22'; ctx.fillRect(x+2+hit*4,yy-13+hit,1,4); fan(x+13,yy-6,'#2f6db0','#ffc62f',1) }
    // finish banner + crowd
    ctx.fillStyle='#4f2683'; ctx.fillRect(40,FINISH_Y-8,144,9); ctx.fillStyle='#ffc62f'; ctx.font='7px monospace'; ctx.fillText('FINISH · HAYWARD',76,FINISH_Y-1);
    for(let i=0;i<30;i++){const x=i<15?40+((i*7)%9):174+((i*7)%9), y=BRIDGE.y1+30+(i%15)*8, j=Math.sin(time/150+i)>.6?-1:0; ctx.fillStyle=['#c8322b','#2f6db0','#ffc62f','#4f2683','#2f8a4a'][i%5]; ctx.fillRect(x,y+j,4,5); ctx.fillStyle='#f0c6a0'; ctx.fillRect(x+1,y-2+j,2,2)}
    // the finish: the whole crew came out to cheer, and Alex has a sign
    if(P.y>BRIDGE.y1-160){const by=Math.sin(time/130)>0?-2:0, Y=BRIDGE.y1;
      const L=(x,y,f)=>[x,y,f], left=[L(40,Y+34,()=>drawKeelan({x:40,y:Y+34+by,dir:'right',moving:false,step:0})),L(46,Y+50,()=>drawLars({x:46,y:Y+50+by,dir:'right',moving:false,step:0})),
        L(40,Y+66,()=>drawJohn({x:40,y:Y+66+by,dir:'right',moving:false,step:0})),L(46,Y+84,()=>drawMargie(46,Y+84+by)),L(40,Y+102,()=>drawJack(40,Y+102+by))];
      const right=[L(184,Y+34,()=>drawBob(184,Y+34+by)),L(178,Y+52,()=>drawBrian(178,Y+52+by,'left')),L(184,Y+70,()=>drawLogan(184,Y+70+by)),...(have.metJackie?[L(178,Y+88,()=>drawJackie(178,Y+88+by,'left'))]:[])];
      for(const [,,d] of [...left,...right])d();
      const ax=180, ay=FINISH_Y-12+by; drawAlex(ax,ay,'ok');   // Alex, right at the finish line, holding up a GO JOE! sign
      ctx.fillStyle='#8a5a34'; ctx.fillRect(ax,ay-30,1,12); ctx.fillStyle='#fffdf6'; ctx.fillRect(ax-14,ay-40,29,11); ctx.fillStyle='#2e9a45'; ctx.fillRect(ax-14,ay-40,29,1); ctx.fillRect(ax-14,ay-30,29,1); pixText(ctx,'GO JOE',ax-12,ay-37,'#c8322b')}
  },
  ents(list){ birk.vikings.forEach((v,i)=>list.push({y:v.y,draw:()=>{const y=v.y-(v.air||0); if(v.air>0){ctx.fillStyle='rgba(0,0,0,.12)'; ctx.fillRect(Math.round(v.x)-5,Math.round(v.y)-1,10,2)} drawVikingSkier(v.x,y,VIKING_KINDS[i],P.step+i)}})) },
  over(){
    const tf=ctx.getTransform(), cx=-tf.e, cy=-tf.f;
    // drinking: a meter at the bottom of the screen. Don't jump or change lanes until it's full.
    if(birk.drink){const k=Math.min(1,birk.drink.t/BIRK.DRINK_MS), bx=cx+52, by=cy+128;
      ctx.fillStyle='rgba(29,33,48,.9)'; ctx.fillRect(bx,by,120,20); ctx.fillStyle='#e8742a'; ctx.fillRect(bx,by,120,1);
      ctx.font='7px monospace'; ctx.fillStyle='#ffffff'; ctx.fillText(BIRKIE.holdSteady,bx+5,by+8);
      ctx.fillStyle='#3a3f50'; ctx.fillRect(bx+5,by+12,110,4); ctx.fillStyle='#c98a3a'; ctx.fillRect(bx+5,by+12,Math.round(110*k),4)}
    for(const f of birk.fx||[]){ ctx.globalAlpha=Math.min(1,f.life/200); ctx.fillStyle=f.c; ctx.fillRect(Math.round(f.x),Math.round(f.y),2,2) } ctx.globalAlpha=1;
    if(birk.running&&birk.crashT<=0){ const t=terrainAt(P.y);
      if(t==='down'){ ctx.fillStyle='rgba(255,255,255,.75)'; for(let i=0;i<7;i++){const x=P.x-26+i*9+(i%2)*3, y=cy+((i*41+time*.35)%168); ctx.fillRect(Math.round(x),Math.round(y),1,9)} }   // downhill: speed lines
      if(t==='up'&&Math.floor(time/400)%3===0){ ctx.fillStyle='rgba(255,255,255,.8)'; const k=(time%400)/400; ctx.fillRect(Math.round(P.x)+4+Math.round(k*3),Math.round(P.y)-22-Math.round(k*4),2,2); ctx.fillRect(Math.round(P.x)+6+Math.round(k*4),Math.round(P.y)-25-Math.round(k*5),2,1) } }   // climbing: huffing and puffing
    for(const py of POWERLINES){ if(Math.abs(py-P.y)>200)continue; ctx.fillStyle='rgba(40,46,60,.55)'; for(const dy of [-34,-31,-28])for(let x=0;x<BIRK.W;x+=2){const sag=Math.round(Math.sin(x/BIRK.W*Math.PI*3)**2*3); ctx.fillRect(x,py+dy+sag,2,1)} }   // the power lines, overhead
    // falling snow + messages
    ctx.fillStyle='rgba(255,255,255,.9)'; for(let i=0;i<40;i++){const sx=(i*53+time*.02*(1+i%3))%BIRK.W, sy=cy+(i*37+time*.04*(1+i%2))%168; ctx.fillRect(sx|0,sy|0,1,1)}
    if(terrainAt(P.y)==='lake'){ctx.fillStyle='rgba(255,255,255,.5)'; for(let i=0;i<20;i++){const x=(i*61+time*.25)%BIRK.W; ctx.fillRect(x|0,(cy+(i*29)%168)|0,6,1)}}
    if(birk.gust){const d=birk.gust.dir; ctx.fillStyle='rgba(255,255,255,.85)'; for(let i=0;i<26;i++){const x=((i*47+(d>0?1:-1)*time*.6)%BIRK.W+BIRK.W)%BIRK.W, y=cy+18+(i*37)%140; ctx.fillRect(x|0,y|0,10,1)}
      const ax=Math.round(P.x+d*14), ay=Math.round(P.y-30); ctx.fillStyle='#2f6db0'; ctx.fillRect(ax-3,ay,7,2); ctx.fillRect(d>0?ax+3:ax-4,ay-1,1,4); ctx.fillRect(d>0?ax+4:ax-5,ay,1,2)}   // streaks + an arrow showing which way
    birkRadio();   // John (or a Viking) on the radio: a pop-up like the rest of the game
    // the sweep tracker: a strip on the left edge from start (top) to finish (bottom)
    if(birk.running){const tx=cx+4, ty=cy+30, th=96, k=th/FINISH_Y; ctx.fillStyle='rgba(29,33,48,.55)'; ctx.fillRect(tx,ty,6,th);
      ctx.fillStyle='#4f2683'; ctx.fillRect(tx,ty+th-2,6,2);
      const sy=ty+sweepY()*k, py=ty+Math.min(P.y,FINISH_Y)*k; ctx.fillStyle='rgba(200,50,43,.45)'; ctx.fillRect(tx+1,ty,4,sy-ty);
      ctx.fillStyle='#c8322b'; ctx.fillRect(tx-1,sy-2,8,4); ctx.fillStyle='#ffffff'; ctx.fillRect(tx-1,py-2,8,4); ctx.fillStyle='#4f2683'; ctx.fillRect(tx,py-1,6,2);
      const gap=Math.max(0,(P.y-sweepY())/FINISH_Y*50), near=gap<3; ctx.font='7px monospace'; ctx.fillStyle=near?'#c8322b':'#1d2130'; ctx.fillText('sweep',tx-2,ty+th+9); ctx.fillText(gap.toFixed(1)+'km',tx-2,ty+th+17)}
  },
  hud(){
    if(!birk.running)return '';
    const pips=[...Array(10)].map((_,i)=>`<i class="${i<Math.ceil(birk.energy/10)?'on fuel':''}"></i>`).join('');
    const t=terrainAt(P.y), tw=t==='up'?BIRKIE.hudUp:t==='down'?BIRKIE.hudDown:t==='lake'?BIRKIE.hudLake:BIRKIE.hudFlat;
    return `<span>${clockStr(birk.t)}</span><span>${Math.min(50,P.y/KM).toFixed(1)}K · ${tw}</span><span class="pips">Energy ${pips}</span>`;
  },
};
