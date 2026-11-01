// Simulates skiers of different rhythm accuracy on the Birkie. Usage: node tests/birkie-difficulty.js '{"CUTOFF":12000}'
const {chromium}=require('playwright');const path=require('path');const OV=JSON.parse(process.argv[2]||'{}');(async()=>{
const b=await chromium.launch();const p=await b.newPage();await p.goto('file://'+path.resolve(__dirname,'../index.html'));await p.click('#startBtn'); await p.evaluate(()=>skipWelcome());
const out=await p.evaluate((OV)=>{Object.assign(BIRK,OV); have.miller=true; scene=SCENES.birkie; paused=false;
  const g=()=>{let u=0,v=0;while(!u)u=Math.random();while(!v)v=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)};
  function run(sigma,pole,steerErr){birkStart(); let next=null, guard=0;
    while(birk.running&&guard++<20000){
      // steer: aim for the trail center, dodge the next fallen skier ahead
      let tx=trailX(P.y+20); for(const f of FALLEN)if(f.y>P.y&&f.y-P.y<40&&Math.abs(f.x-tx)<12)tx=f.x+(f.x<trailX(f.y)?14:-14);
      tx+=steerErr*Math.sin(guard/40);
      for(const k in dirs)dirs[k]=false; if(tx-P.x>1.5)dirs.right=true; if(tx-P.x<-1.5)dirs.left=true; if(terrainAt(P.y)==='down')dirs.down=true;
      // pole: schedule a tap at the next beat (plus timing error), tap when it comes; skip descents and rest when tired
      const canPole=pole&&terrainAt(P.y)!=='down'&&birk.stamina>12;
      if(canPole&&next===null){const ph=birk.beatT%BIRK.BEAT; let toBeat=BIRK.BEAT-ph; if(toBeat<BIRK.BEAT*.25)toBeat+=BIRK.BEAT; next=birk.t+toBeat+g()*sigma}
      if(next!==null&&birk.t>=next){ if(canPole)birkTap(); next=null }
      birkUpdate(16.7);
    }
    for(const k in dirs)dirs[k]=false; return {made:P.y>=FINISH_Y, t:birk.t*BIRK.CLOCK/1000}}
  const fmt=s=>`${Math.floor(s/3600)}:${String(Math.floor(s%3600/60)).padStart(2,'0')}`;
  const res={}; for(const [name,sig,pole,se] of [['great rhythm',40,true,0],['ok rhythm',90,true,4],['sloppy rhythm',160,true,8],['never poles',0,false,6]]){
    let made=0, ts=[]; for(let k=0;k<20;k++){const r=run(sig,pole,se); if(r.made)made++; ts.push(r.t)} ts.sort((a,b)=>a-b);
    res[name]=`finishes ${made}/20, median ${fmt(ts[10])}, best ${fmt(ts[0])}`}
  return res},OV);
console.log(OV,out);await b.close()})();
