// Simulates a thoughtful player with sloppy-ish timing playing the 3-hole round vs Margie and Jack.
// Usage: node tests/golf-difficulty.js '{"MAX":150}'   (overrides GOLF settings)
const {chromium}=require('playwright');const path=require('path');const OV=JSON.parse(process.argv[2]||'{}');(async()=>{
const b=await chromium.launch();const p=await b.newPage();await p.goto('file://'+path.resolve(__dirname,'../index.html'));
const out=await p.evaluate((OV)=>{Object.assign(GOLF,OV);
  const g=()=>{let u=0,v=0;while(!u)u=Math.random();while(!v)v=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)};
  function playHole(h,sigma){let lie={...h.tee},strokes=0;
    while(strokes<GOLF.MAX_STROKES){const b=h.basket, d=Math.hypot(b.x-lie.x,b.y-lie.y), putt=d<=GOLF.PUTT_RANGE, base=Math.atan2(b.y-lie.y,b.x-lie.x);
      const span=putt?GOLF.PUTT_SPAN:GOLF.AIM_SPAN, per=putt?GOLF.PUTT_PERIOD:GOLF.AIM_PERIOD, pper=putt?GOLF.PUTT_POWER_PERIOD:GOLF.POWER_PERIOD;
      // plan: best (offset, power) on the deterministic flight
      const mode=strokes===0?(h.platform?'platform':h.hike?'hike':''):''; let best=null; for(let o=-span*.9;o<=span*.9;o+=span/6)for(let pw=.15;pw<=1.001;pw+=.1){const f=golfFlight(h,lie,base+o,pw,putt,mode);
        const sc=f.result==='in'?-100:(f.result==='water'||f.result==='ob')?999:Math.hypot(f.end.x-b.x,f.end.y-b.y)+(f.result==='tree'?20:0); if(!best||sc<best.sc)best={o,pw,sc}}
      // execute with timing error
      const ph=Math.asin(Math.max(-1,Math.min(1,best.o/span))), aErr=span*2*Math.PI/per*Math.cos(ph)*g()*sigma, pErr=2/pper*g()*sigma;
      const f=golfFlight(h,lie,base+best.o+aErr+(mode==='hike'?(Math.random()-.5)*GOLF.HIKE_WILD:0),Math.max(.05,Math.min(1,best.pw+pErr)),putt,mode); strokes++;
      if(f.result==='in')return strokes; if(f.result==='water'||f.result==='ob'){strokes++; continue} lie={...f.end}}
    return strokes}
  const res={}; for(const sigma of [20,35,50]){let w=0,tot=0,n=200;
    for(let k=0;k<n;k++){let you=0,m=0,j=0; HOLES.forEach(h=>{you+=playHole(h,sigma)-h.par; m+=sampleScore(GOLF.MARGIE); j+=sampleScore(GOLF.JACK)}); tot+=you; if(you<j&&you<=m)w++}
    res['timing ±'+sigma+'ms']=`wins ${(w/n*100).toFixed(0)}%, avg ${(tot/n).toFixed(2)} vs par`}
  return res},OV);
console.log(OV,out);await b.close()})();
