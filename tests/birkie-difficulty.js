// Simulates skiers of different skill on the Birkie lane runner. Usage: node tests/birkie-difficulty.js '{"CUTOFF":12000}'
// A skier looks ahead, changes lane around packs, jumps fallen skiers, grabs the feed cup and holds steady.
// "miss" is the chance they react wrong (or too late) to each thing on the trail.
const {chromium}=require('playwright');const path=require('path');const OV=JSON.parse(process.argv[2]||'{}');(async()=>{
const b=await chromium.launch();const p=await b.newPage();await p.goto('file://'+path.resolve(__dirname,'../index.html'));await p.click('#startBtn'); await p.evaluate(()=>skipWelcome());
const out=await p.evaluate((OV)=>{Object.assign(BIRK,OV); scene=SCENES.birkie; paused=false;
  window.birkBot=(miss)=>{ const decided=new Map(); return ()=>{
    const lane=curLane(), ahead=o=>{const d=obstacleY(o)-P.y; return d>0&&d<46};
    const blocked=(l,d=60)=>OBSTACLES.some(o=>{const dd=obstacleY(o)-P.y; return dd>-4&&dd<d&&o.lanes.includes(l)&&o.kind==='pack'});
    for(const o of OBSTACLES){ if(!ahead(o)||birk.hit.has(o)||!o.lanes.includes(lane))continue;
      if(!decided.has(o))decided.set(o,Math.random()>=miss); if(!decided.get(o))continue;
      if(o.kind==='fallen'){ if(obstacleY(o)-P.y<BIRK.JUMP_LEN*.6)birkJump() }
      else { const opts=[-1,0,1].filter(l=>!o.lanes.includes(l)&&!blocked(l)).sort((a,b)=>Math.abs(a-lane)-Math.abs(b-lane)); if(opts.length&&!birk.drink)birkLane(opts[0]>lane?1:-1) } }
    for(const f of FEEDS){ const d=f.y-P.y; if(f.used||d<0||d>130)continue; if(!decided.has(f))decided.set(f,Math.random()>=miss);
      if(decided.get(f)&&lane!==f.cup&&!blocked(f.cup,d+6))birkLane(f.cup>lane?1:-1) } } };
  function run(miss){birkStart(); const bot=birkBot(miss); let guard=0;
    while(birk.running&&guard++<30000){ bot(); birkUpdate(16.7) }
    return {made:P.y>=FINISH_Y, t:birk.t*BIRK.CLOCK/1000, crashes:birk.hit.size}}
  const fmt=s=>`${Math.floor(s/3600)}:${String(Math.floor(s%3600/60)).padStart(2,'0')}`;
  const res={}; for(const [name,miss] of [['sharp',0],['good',.12],['casual',.3],['distracted',.55],['never reacts',1]]){
    let made=0, ts=[], cr=0; for(let k=0;k<20;k++){const r=run(miss); cr+=r.crashes; if(r.made){made++; ts.push(r.t)}} ts.sort((a,b)=>a-b);
    res[name]=(made?`finishes ${made}/20, median ${fmt(ts[ts.length>>1])}, best ${fmt(ts[0])}`:'finishes 0/20')+`, avg ${(cr/20).toFixed(1)} crashes`}
  return res},OV);
console.log(OV,out); await b.close()})();
