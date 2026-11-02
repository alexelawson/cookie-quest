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
  CRASH_MS:1600, CRASH_COST:16,          // a crash: how long you're down, and the energy it costs
  DRINK_MS:2000, SPILL_KEEP:15,          // feed stations: hold steady this long to drink; a spill still gives you a little
  CUP_SWING:650,
  GUST_EVERY:2400, GUST_WARN:650,         // on the lake: a gust every ~2.4-3.6 s, with this much warning before it shoves you                         // the volunteer swings the cup between two lanes this often (ms)
  CLOCK:170,                             // the race clock runs 170x real time
  CUTOFF:3*3600,                         // the sweep snowmobile reaches the finish at 3:00:00
  SWEEP_START:15*60,                     // ...and leaves the start at 0:15:00, at a steady pace
  ELITE:2*3600+24*60,                    // under 2:24 gets a shout-out
  // simulated (tests/birkie-difficulty.js): sharp ~2:21, good ~2:23, casual ~2:36 (19/20 finish), distracted ~13/20 finish, never dodging 0/20
};
// course sections, top to bottom (the landmarks)
const BIRK_SECTIONS=[
  {y:0,    type:'flat', name:'Start · Cable'},
  {y:160,  type:'roll', name:'Powerline Hills'},
  {y:480,  type:'up',   name:'Firetower Hill (high point)'},
  {y:690,  type:'down', name:''},
  {y:820,  type:'flat', name:''},
  {y:940,  type:'flat', name:'Mosquito Brook'},
  {y:1060, type:'down', name:'Bobblehead Hill', turn:true},
  {y:1260, type:'flat', name:'Highway OO · halfway'},
  {y:1420, type:'roll', name:''},
  {y:1760, type:'up',   name:'"That" hill (you know the one)'},
  {y:1960, type:'roll', name:'Sunset & Hatchery Hills'},
  {y:2140, type:'lake', name:'Lake Hayward (windy!)'},
  {y:2400, type:'flat', name:'The International Bridge', bridge:true},
  {y:2500, type:'finish', name:'Main Street · Hayward'},
];
const FEEDS=[{y:820},{y:1500},{y:2060}];   // (the last one's just before the lake, so the lake is all wind)
const FINISH_Y=2620;
// trail centerline wanders; Bobblehead has a sharp left turn; the lake, the bridge and Main Street are straight
function trailX(y){
  if(y>2140)return 112;
  let x=112+44*Math.sin(y/260)+18*Math.sin(y/97);
  if(y>1060&&y<1260)x-=Math.min(40,(y-1060)*.5);            // Bobblehead's left turn
  if(y>2040)x=x+(112-x)*Math.min(1,(y-2040)/100);           // straighten out toward the lake
  return x;
}
const BRIDGE={y0:2400,y1:2500};
const BROOK={y:968}, OO={y:1290};   // where the trail crosses Mosquito Brook and Highway OO
const FIRETOWER={y:560};
const trailHalf=y=>y>=BRIDGE.y0&&y<BRIDGE.y1?18:y>=BRIDGE.y1+20?60:34;
const laneScale=y=>Math.min(1,trailHalf(y)/34);              // lanes squeeze together on the narrow bridge
const laneX=(y,lane)=>trailX(y)+lane*BIRK.LANE*laneScale(y);
function sectionAt(y){let s=BIRK_SECTIONS[0]; for(const t of BIRK_SECTIONS)if(y>=t.y)s=t; return s}
function terrainAt(y){const s=sectionAt(y); if(s.type!=='roll')return s.type; return Math.floor((y-s.y)/70)%2?'down':'up'}
// what's on the trail: skiers who fell (jump them) and packs of slow skiers across two lanes (go around).
// Never on the bridge, never right at a feed station; there's always a way through.
const OBSTACLES=(()=>{const out=[], lanes=[0,-1,1,0,1,-1,-1,0,1,1,0,-1], gaps=[112,92,128,84,104,118,96];
  let y=230, k=0; while(y<2540){
    if(!FEEDS.some(f=>y>f.y-90&&y<f.y+70)&&!(y>BRIDGE.y0-40&&y<BRIDGE.y1+40)&&Math.abs(y-BROOK.y)>24&&Math.abs(y-OO.y)>24){
      const lane=lanes[k%lanes.length];
      if(k%3===2)out.push({kind:'pack',y,lanes:lane===1?[0,1]:lane===-1?[-1,0]:[0,1]});
      else out.push({kind:'fallen',y,lanes:[lane]});
      k++ }
    y+=gaps[k%gaps.length] }
  return out})();
const FALLEN=OBSTACLES.filter(o=>o.kind==='fallen');   // (kept for anything that still looks for fallen skiers)

const birk={running:false, v:0, energy:100, lane:0, lx:0, jumpD:0, crashT:0, t:0, trail:[], vikings:[], msg:'', msgT:0, drink:null, said:{}};
const birkBg=document.createElement('canvas'); birkBg.width=BIRK.W; birkBg.height=BIRK.L;
(function(){
  const g=birkBg.getContext('2d'), F=(c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};
  F('#e9f0f6',0,0,BIRK.W,BIRK.L); for(let i=0;i<4000;i++)F(rnd()<.5?'#dbe5ee':'#ffffff',rnd()*BIRK.W|0,rnd()*BIRK.L|0,2,1);
  for(let y=0;y<BIRK.L;y+=2){const cx=trailX(y), hw=trailHalf(y);                      // a wide groomed skate trail, corduroy
    F('#f6f9fb',cx-hw,y,hw*2,2); if(y%4===0)F('#ebf1f6',cx-hw+1,y,hw*2-2,1); F('#dde6ee',cx-hw,y,1,2); F('#dde6ee',cx+hw-1,y,1,2)}
  // the firetower on Firetower Hill: a lattice lookout tower beside the trail (it's the high point of the course)
  {const x=trailX(FIRETOWER.y)+52|0, y=FIRETOWER.y; F('rgba(0,0,0,.12)',x-6,y+2,22,4);
    for(const [lx,ly] of [[x-4,y],[x+12,y]]){F('#6b7280',lx,y-46,2,48)} for(let k=y-44;k<y;k+=8){F('#8b93a3',x-4,k,18,1); for(let d=0;d<8;d++)F('#8b93a3',x-4+d*2,k+d,1,1)}
    F('#7a3a2a',x-7,y-60,24,4); F('#a8504a',x-6,y-56,22,10); F('#ffe9a8',x-2,y-53,4,4); F('#ffe9a8',x+6,y-53,4,4); F('#5a2a20',x-8,y-61,26,2)}
  // Mosquito Brook: a little creek under the trail
  for(let x=0;x<BIRK.W;x++){const w=Math.round(Math.sin(x/9)*2); if(Math.abs(x-trailX(BROOK.y))<36)continue; F('#7fb0d0',x,BROOK.y-4+w,1,8); F('#a9cfe6',x,BROOK.y-3+w,1,2)}
  {const cx=trailX(BROOK.y)|0; F('#8a5a34',cx-37,BROOK.y-6,2,12); F('#8a5a34',cx+35,BROOK.y-6,2,12); for(let y=BROOK.y-6;y<BROOK.y+6;y+=4){F('#6b4428',cx-38,y,4,1); F('#6b4428',cx+34,y,4,1)}}
  // Highway OO: a road across the course, packed with snow where the skiers cross
  F('#5f6676',0,OO.y-10,BIRK.W,20); F('#f4d35e',0,OO.y-1,BIRK.W,2); {const cx=trailX(OO.y)|0; F('#eef3f7',cx-34,OO.y-10,68,20); for(let y=OO.y-10;y<OO.y+10;y+=4)F('#e1e9f0',cx-33,y,66,1)}
  // the lake: flat and icy-blue
  F('#d4e5f1',0,2140,BIRK.W,BRIDGE.y0-2140); for(let i=0;i<260;i++)F('#c3d8e8',rnd()*BIRK.W|0,2140+rnd()*(BRIDGE.y0-2140)|0,6,1);
  for(let y=2140;y<BRIDGE.y0;y+=2){F('#f6f9fb',112-34,y,68,2); if(y%4===0)F('#ebf1f6',112-33,y,66,1)}
  // the International Bridge over Highway 63 into town: the highway underneath, railings, flags of every country along both sides (drawn live so they wave)
  F('#d8dfe6',0,BRIDGE.y0-6,BIRK.W,BRIDGE.y1-BRIDGE.y0+12);
  F('#4a505e',0,BRIDGE.y0+30,BIRK.W,40); F('#f4d35e',0,BRIDGE.y0+49,BIRK.W,2); for(let x=0;x<BIRK.W;x+=14)F('#ffffff',x,BRIDGE.y0+39,6,1),F('#ffffff',x+7,BRIDGE.y0+60,6,1);
  F('#9aa3b0',92,BRIDGE.y0,40,BRIDGE.y1-BRIDGE.y0); F('#f6f9fb',94,BRIDGE.y0,36,BRIDGE.y1-BRIDGE.y0); for(let y=BRIDGE.y0;y<BRIDGE.y1;y+=4)F('#ebf1f6',95,y,34,1);
  F('#5f6676',90,BRIDGE.y0,3,BRIDGE.y1-BRIDGE.y0); F('#5f6676',131,BRIDGE.y0,3,BRIDGE.y1-BRIDGE.y0); for(let y=BRIDGE.y0;y<BRIDGE.y1;y+=8){F('#8a8f9a',89,y,5,2); F('#8a8f9a',130,y,5,2)}
  // Main Street: buildings, crowd barriers
  for(let x=0;x<BIRK.W;x+=28){if(x>40&&x<170)continue; F(['#b5654f','#7a8aa0','#c49a6a','#6b8f71'][(x/28)%4],x,BRIDGE.y1+30,24,170); F('#ffd98a',x+4,BRIDGE.y1+40,5,6); F('#ffd98a',x+14,BRIDGE.y1+40,5,6)}
  F('#c8322b',48,BRIDGE.y1+20,2,180); F('#c8322b',174,BRIDGE.y1+20,2,180);
  // feed stations: an orange tent and a table of flat Coke on each side, and a FEED banner over the trail (drawn in under())
  for(const f of FEEDS){const cx=trailX(f.y);
    for(const x of [cx+34+2, cx-34-24]){
      F('#c94a1a',x-2,f.y-22,26,4); for(let i=0;i<26;i+=6)F('#ffffff',x-2+i,f.y-22,3,4); F('#8a8f9a',x-1,f.y-18,1,14); F('#8a8f9a',x+22,f.y-18,1,14);   // striped tent roof
      F('#8a5a34',x,f.y-6,22,8); F('#c49a6a',x,f.y-6,22,2);
      for(let i=0;i<5;i++){F('#ffffff',x+1+i*4,f.y-10,3,4); F('#4a2412',x+1+i*4,f.y-10,3,2)}}}   // cups of flat Coke
  // pines along the trail edges
  for(let n=0;n<520;n++){const y=rnd()*(2130)|0, side=rnd()<.5?-1:1, x=trailX(y)+side*(trailHalf(y)+8+rnd()*60);
    if(x<2||x>BIRK.W-2)continue; F('#5a3a22',x,y,2,3); F('#2f5e3a',x-4,y-8,10,8); F('#356b42',x-3,y-12,8,5); F('#ffffff',x-3,y-12,7,1); F('#ffffff',x-4,y-8,4,1)}
})();
function drawSkier(x,y,o={}){ // generic skier: o.jersey, o.helmet, o.horns, o.down (fallen), o.hair
  const X=Math.round(x)-5, Y=Math.round(y)-16, F=(c,dx,dy,w,h)=>{ctx.fillStyle=c;ctx.fillRect(X+dx,Y+dy,w,h)};
  if(o.down){F('rgba(0,0,0,.2)',-2,13,14,3); F(o.jersey||'#c8322b',-1,9,10,4); F('#f0c6a0',9,9,3,3); F('#2b2b36',-4,13,16,1); F('#2b2b36',-2,6,1,8); return}
  F('rgba(0,0,0,.18)',0,15,10,2);
  // skate skis in a V (tails together behind, tips out in front); the pushing ski kicks out further
  const push=o.step!=null?o.step%2:0;
  for(let k=0;k<13;k++){const d=Math.floor(k/(push?3:4)), e=Math.floor(k/(push?4:3)); F('#2b2b36',3-d,4+k,1,1); F('#2b2b36',6+e,4+k,1,1)}
  F('#3b3b44',0,5,1,8); F('#3b3b44',9,5,1,8);                       // poles
  F(o.pants||'#1d1d22',2,10,6,4); F(o.jersey||'#fbfbf7',2,4,6,6); if(o.trim)F(o.trim,2,4,6,1);
  F('#f0c6a0',3,0,4,4); F(o.hair||'#b08355',3,0,4,2);
  if(o.helmet){F(o.helmet,2,-1,6,3); if(o.horns){F('#f6f2e4',1,-3,1,3); F('#f6f2e4',8,-3,1,3)}}
  if(o.headband)F(o.headband,3,1,4,1); if(o.glasses){F(o.glasses,2,2,6,1); F('#5a5f6a',3,2,1,1)}   // headband; wraparound sunglasses with a little shine
  if(o.panels){F(o.panels,2,5,1,5); F(o.panels,7,5,1,5)} if(o.stripe)F(o.stripe,2,12,6,1);   // race-suit side panels, a stripe on the tights
  F('rgba(0,0,0,.18)',6,4,1,6); F('rgba(0,0,0,.18)',5,10,2,4); F('rgba(255,255,255,.25)',4,0,2,1); F('#d9a583',6,2,1,2);   // shading: jersey side, tights, hair shine, cheek
  if(!o.glasses&&!o.helmet){F('#2b2b2b',4,2,1,1); F('#2b2b2b',6,2,1,1)}   // eyes
}
const JOE_RACE_KIT=()=>({jersey:'#2e9a45',trim:'#8fe09a',pants:'#111114',panels:'#111114',stripe:'#2e9a45',hair:'#b08355',headband:'#ffffff',glasses:'#111114',step:P.step});   // green race suit, black side panels and tights, white headband, black Oakleys
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
  Object.assign(birk,{gust:null,gustT:1800,vikingT:9000,afterFeed:0,msgWho:'John',running:true,v:.03,energy:100,lane:0,lx:0,jumpD:0,crashT:0,t:0,trail:[],msg:'',msgT:0,drink:null,said:{},hit:new Set(),prev:{}});
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
function birkLane(d){ if(!birk.running||birk.crashT>0)return; const n=Math.max(-1,Math.min(1,birk.lane+d)); if(n===birk.lane)return; birk.lane=n; sfx('whoosh'); if(birk.drink)spill() }
function birkJump(){ if(!birk.running||birk.crashT>0||birk.jumpD>0)return; birk.jumpD=.001; sfx('jump'); if(birk.drink)spill() }
function birkTap(){ birkJump() }   // the A button
// where the sweep snowmobile is: leaves the start at SWEEP_START, reaches the finish at CUTOFF
const sweepY=()=>{const c=birk.t*BIRK.CLOCK/1000; return Math.max(0,Math.min(1,(c-BIRK.SWEEP_START)/(BIRK.CUTOFF-BIRK.SWEEP_START)))*FINISH_Y};
const clockStr=ms=>{const s=Math.floor(ms*BIRK.CLOCK/1000), h=Math.floor(s/3600), m=Math.floor(s%3600/60), x=s%60; return `${h}:${String(m).padStart(2,'0')}:${String(x).padStart(2,'0')}`};
const curLane=()=>Math.round(birk.lx/(BIRK.LANE*laneScale(P.y)||1));
function birkUpdate(dt){
  if(!birk.running)return;
  birk.t+=dt; if(birk.msgT>0)birk.msgT-=dt;
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
  P.y+=birk.v*dt; if(birk.jumpD>0){birk.jumpD+=birk.v*dt; if(birk.jumpD>=BIRK.JUMP_LEN)birk.jumpD=0}
  P.x=trailX(P.y)+birk.lx; P.moving=true; P.t+=dt; if(P.t>200){P.t=0;P.step++}
  P.dir=Math.abs(want-birk.lx)>2?(want>birk.lx?'right':'left'):'down';
  // the Vikings follow your tracks (and hop where you hopped)
  const t=birk.trail; t.push({x:P.x,y:P.y,air:birkAir()}); if(t.length>600)t.shift();
  birk.vikings.forEach((v,i)=>{let need=(i+1)*14, k=t.length-1, acc=0; while(k>0&&acc<need){acc+=Math.hypot(t[k].x-t[k-1].x,t[k].y-t[k-1].y);k--} const g=t[Math.max(0,k)]; v.x=g.x; v.y=g.y; v.air=g.air||0});
  // obstacles
  const lane=curLane();
  for(const o of OBSTACLES){ if(birk.hit.has(o))continue; const oy=obstacleY(o); if(Math.abs(P.y-oy)>5)continue;
    if(!o.lanes.includes(lane))continue;
    if(o.kind==='fallen'&&birkAir()>2)continue;                      // cleared it
    birk.hit.add(o); birk.crashT=BIRK.CRASH_MS; birk.v=0; birk.jumpD=0; birk.energy=Math.max(0,birk.energy-BIRK.CRASH_COST); sfx('crash');
    if(birk.drink)spill(); else birkSay(o.kind==='pack'?BIRKIE.packCrash[Math.floor(Math.random()*BIRKIE.packCrash.length)]:BIRKIE.crash[Math.floor(Math.random()*BIRKIE.crash.length)]);
    break }
  // feed stations: be in the cup's lane to grab it, then hold steady (no jumping, no lane changes) until it's down
  for(const f of FEEDS){ if(!f.used&&f.y-P.y<150&&f.y>P.y)birkOnce('feedAhead'+f.y,BIRKIE.feedAhead);
    if(!f.used&&P.y>=f.y){ f.used=true;
      if(lane===cupLane(f)&&birkAir()<2){ birk.drink={t:0}; sfx('pickup'); birkSay(BIRKIE.grab) } else birkSay(BIRKIE.feedMissed) } }
  if(birk.drink){ birk.drink.t+=dt; if(birk.drink.t>=BIRK.DRINK_MS){ birk.drink=null; birk.energy=100; birkSay(BIRKIE.feed); birk.afterFeed=1500; sfx('glug'); setTimeout(()=>sfx('glug'),120); setTimeout(()=>sfx('glug'),240) } }
  if(P.y>440&&P.y<480)birkOnce('climb1',BIRKIE.climb); if(P.y>1720&&P.y<1760)birkOnce('climb2',BIRKIE.climb);
  if(P.y>1260&&P.y<1300)birkOnce('half',BIRKIE.halfway); if(P.y>2150&&P.y<2190)birkOnce('lake',BIRKIE.lake); if(P.y>BRIDGE.y0-30&&P.y<BRIDGE.y0)birkOnce('bridge',BIRKIE.bridge);
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
  const who=birk.msgWho==='John'?'Trail John':birk.msgWho, p=PORTRAITS[who], g=$('radioFace').getContext('2d');
  g.fillStyle=p.bg; g.fillRect(0,0,40,40); g.save(); g.scale(40/p.size,40/p.size); p.draw(g); g.restore();
  $('radioWho').textContent=birk.msgWho==='Viking'?BIRKIE.vikingName:birk.msgWho==='Football Viking'?BIRKIE.footballName:BIRKIE.john+' '+BIRKIE.onRadio; $('radioText').textContent=birk.msg; el.hidden=false;
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
function drawTrailJohn(cx,cy,dir){
  const x=cx-5, y=cy-20, F=(c,dx,dy,w,h)=>{ctx.fillStyle=c;ctx.fillRect(x+dx,y+dy,w,h)};
  const skin='#eab896', hair='#6b4429', coat='#1d3f73', pants='#b59a6e', glass='#c9a24a';
  F('rgba(0,0,0,.25)',1,19,9,2);
  F(pants,2,13,3,6); F(pants,6,13,3,6); F('#2b2b2b',2,18,3,2); F('#2b2b2b',6,18,3,2);
  F(coat,1,6,9,8); F('#c8322b',1,9,9,1); F('#ffffff',4,6,3,1);                     // jacket with a red stripe
  F(coat,0,7,1,6); F(coat,10,7,1,6); F(skin,0,13,1,1); F(skin,10,13,1,1);
  F(skin,3,1,5,5); F(skin,4,5,3,1);
  F(hair,3,0,5,2); F(hair,2,1,1,3); F(hair,8,1,1,3);
  if(dir==='up')F(hair,3,0,5,5);
  else if(dir==='left'){F('#2b2b2b',3,3,1,1); F(glass,3,3,2,1); F(hair,7,1,1,3)}
  else if(dir==='right'){F('#2b2b2b',7,3,1,1); F(glass,6,3,2,1); F(hair,3,1,1,3)}
  else {F(glass,3,3,2,2); F(glass,6,3,2,2); F(glass,5,3,1,1); F('#2b2b2b',4,4,1,1); F('#2b2b2b',6,4,1,1); F('#b5735a',4,5,3,1)}   // reading glasses
  if(dir!=='up'){F('#8a5a34',8,9,3,5); F('#ffffff',8,10,3,3)}                       // clipboard
  F('#163261',8,7,2,6); F('#163261',1,13,9,1); F('#2a5590',2,7,2,1); F('#9a805a',4,13,1,5); F('#9a805a',8,13,1,5); F('#8a5a38',4,0,2,1);   // coat shading, pants shade, hair shine
  if(dir!=='up'){F('#d4a07c',3,5,1,1); F('#d4a07c',7,5,1,1); if(dir==='down'){F('#8a8f9a',8,11,2,1); F('#8a8f9a',8,12,1,1); F('#c9ced4',9,9,1,1)}}   // cheeks, notes on the clipboard, its clip
}
function talkJohn(){
  const T=BIRKIE;
  if(have.mill)return showDialog({place:T.place,speaker:T.john,face:'Trail John',pages:[T.johnAfter],actions:[CLOSE]});
  if(have.birkie)return showDialog({place:T.place,speaker:T.john,face:'Trail John',pages:[T.johnDone],actions:[{label:T.takeFlour,fn:()=>{closeDialog();showReward('mill')}}]});
  showDialog({place:T.place,speaker:T.john,face:'Trail John',pages:T.johnHello,actions:[{label:T.go,fn:()=>{closeDialog();goTo('birkie','start')}},{label:T.later,ghost:true,fn:closeDialog}]});
}

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
  drawPlayer:(x,y)=>{ if(birk.crashT>0)return drawSkier(x,y,{down:true,jersey:'#2e9a45'}); const h=birkAir();   // Joe's race kit: white and green, black Oakleys, a headband
    if(h>0){ctx.fillStyle='rgba(0,0,0,.15)'; ctx.fillRect(Math.round(x)-5,Math.round(y)-1,10,2)}                       // shadow stays on the snow
    drawSkier(x,y-h,JOE_RACE_KIT());
    if(birk.drink){const X=Math.round(x)+5, Y=Math.round(y-h)-12; ctx.fillStyle='#ffffff'; ctx.fillRect(X,Y,3,4); ctx.fillStyle='#4a2412'; ctx.fillRect(X,Y,3,2)} },
  under(){
    for(const o of OBSTACLES){const oy=obstacleY(o); if(Math.abs(oy-P.y)>200)continue;
      if(o.kind==='fallen')drawSkier(laneX(oy,o.lanes[0]),oy,{down:true,jersey:['#2f6db0','#e8742a','#2f8a4a','#c8322b'][Math.floor(o.y)%4]});
      else o.lanes.forEach((l,i)=>drawSkier(laneX(oy,l),oy-(i%2)*2,{jersey:['#8a8f9a','#c49a6a','#7a8aa0'][(o.y/10+i)%3|0],pants:'#3a3f4a',hair:'#6b4429',step:Math.floor(time/300)+i}))}
    // FEED banners over the trail
    for(const f of FEEDS){const cx=Math.round(trailX(f.y)), hw=34; ctx.fillStyle='#8a8f9a'; ctx.fillRect(cx-hw-2,f.y-20,2,22); ctx.fillRect(cx+hw,f.y-20,2,22);
      ctx.fillStyle='#e8742a'; ctx.fillRect(cx-hw-2,f.y-24,hw*2+4,9); ctx.fillStyle='#ffffff'; ctx.fillRect(cx-hw-2,f.y-24,hw*2+4,1); pixText(ctx,'FEED',cx-7,f.y-22,'#ffffff')}
    // the cup of flat Coke, held out over one lane by a volunteer at the trail edge (with a bouncing arrow over it)
    for(const f of FEEDS){ if(f.used||f.cup==null||Math.abs(f.y-P.y)>200)continue; const cl=cupLane(f), x=Math.round(laneX(f.y,cl)), y=f.y+6, side=(f.cup+f.cup2)<0?-1:1, ex=Math.round(trailX(f.y)+side*37);
      ctx.fillStyle='#e8742a'; for(let k=0;k<16;k+=3){ctx.fillRect(x-7,y-12+k,1,2); ctx.fillRect(x+7,y-12+k,1,2)}   // dashed lines marking the lane to aim for
      ctx.fillStyle='#e8742a'; ctx.fillRect(ex-3,y-12,7,10); ctx.fillStyle='#f0c6a0'; ctx.fillRect(ex-2,y-17,5,5); ctx.fillStyle='#6b4428'; ctx.fillRect(ex-2,y-17,5,2);   // the volunteer
      ctx.fillStyle='#f0c6a0'; ctx.fillRect(Math.min(ex,x),y-8,Math.abs(ex-x),2);                              // a looong arm
      ctx.fillStyle='#ffffff'; ctx.fillRect(x-3,y-11,6,7); ctx.fillStyle='#4a2412'; ctx.fillRect(x-3,y-11,6,2); ctx.fillStyle='#d9d9d4'; ctx.fillRect(x+2,y-11,1,7);
      const b=Math.round(Math.sin(time/140)*2); ctx.fillStyle='#e8742a'; ctx.fillRect(x-3,y-20+b,7,1); ctx.fillRect(x-2,y-19+b,5,1); ctx.fillRect(x-1,y-18+b,3,1); ctx.fillRect(x,y-17+b,1,1) }
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
    if(P.y>1640&&P.y<2080)for(let i=0;i<22;i++){const yy=1780+i*8, side=i%2?1:-1, x=Math.round(trailX(yy)+side*(39+(i*5)%10));
      const costume=[['#f4d35e','#f4d35e'],['#c8322b',null],['#4f2683','#ffc62f'],['#ffffff','#ffffff'],['#2f8a4a','#c8322b'],['#e54b7a','#e54b7a']][i%6]; fan(x,yy,costume[0],costume[1],i)}   // a banana, a tutu, Vikings fans, a snowman...
    // finish banner + crowd
    ctx.fillStyle='#4f2683'; ctx.fillRect(40,FINISH_Y-8,144,9); ctx.fillStyle='#ffc62f'; ctx.font='7px monospace'; ctx.fillText('FINISH · HAYWARD',76,FINISH_Y-1);
    for(let i=0;i<30;i++){const x=i<15?30+((i*7)%18):176+((i*7)%18), y=BRIDGE.y1+30+(i%15)*8, j=Math.sin(time/150+i)>.6?-1:0; ctx.fillStyle=['#c8322b','#2f6db0','#ffc62f','#4f2683','#2f8a4a'][i%5]; ctx.fillRect(x,y+j,4,5); ctx.fillStyle='#f0c6a0'; ctx.fillRect(x+1,y-2+j,2,2)}
    // the finish: the whole crew came out to cheer, and Alex has a sign
    if(P.y>BRIDGE.y1-160){const by=Math.sin(time/130)>0?-2:0, Y=BRIDGE.y1;
      const L=(x,y,f)=>[x,y,f], left=[L(22,Y+34,()=>drawKeelan({x:22,y:Y+34+by,dir:'right',moving:false,step:0})),L(36,Y+50,()=>drawLars({x:36,y:Y+50+by,dir:'right',moving:false,step:0})),
        L(20,Y+66,()=>drawJohn({x:20,y:Y+66+by,dir:'right',moving:false,step:0})),L(36,Y+84,()=>drawMargie(36,Y+84+by)),L(22,Y+102,()=>drawJack(22,Y+102+by))];
      const right=[L(202,Y+34,()=>drawBob(202,Y+34+by)),L(188,Y+52,()=>drawBryan(188,Y+52+by,'left')),L(204,Y+70,()=>drawLogan(204,Y+70+by)),...(have.metJackie?[L(190,Y+88,()=>drawJackie(190,Y+88+by,'left'))]:[])];
      for(const [,,d] of [...left,...right])d();
      const ax=192, ay=FINISH_Y-12+by; drawAlex(ax,ay,'ok');   // Alex, right at the finish line, holding up a GO JOE! sign
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
    return `<span>${clockStr(birk.t)}</span><span class="pips">Energy ${pips}</span>`;
  },
};
