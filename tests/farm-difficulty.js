const {chromium}=require('playwright');
const OVERRIDE=JSON.parse(process.argv[2]||'{}');
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage(); const errs=[];
  p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file://'+require('path').resolve(__dirname,'../index.html')+''); await p.click('#startBtn');
  const res=await p.evaluate((OV)=>{
    Object.assign(FARM,OV);
    const run=(eff,help)=>{
      have={gaveCupcake:help}; closeDialog(); farmStart(); paused=false; P.x=130; P.y=134;
      let frames=0, freeze=0, maxLoose=0;
      for(;frames<60*240;frames++){
        if(!farm.active) break;
        const tgt=farm.carrying?{x:120,y:126}:(farm.loose.length?farm.loose.reduce((a,h)=>Math.hypot(h.x-P.x,h.y-P.y)<Math.hypot(a.x-P.x,a.y-P.y)?h:a):{x:120,y:130});
        const w=waypoint(P,tgt); const dx=w.x-P.x, dy=w.y-P.y;
        for(const k in dirs)dirs[k]=false;
        if(freeze>0)freeze--; else if(Math.random()>eff) freeze=12; // human hesitation
        else { if(dx>2)dirs.right=true; if(dx<-2)dirs.left=true; if(dy>2)dirs.down=true; if(dy<-2)dirs.up=true; }
        update(16.7); maxLoose=Math.max(maxLoose,farm.loose.length);
        if(!dlg.hidden&&farm.active){closeDialog()} // ignore stray dialogs
      }
      return {win:!!farm.won, secs:Math.round(frames/60), maxLoose, timeout:farm.active, where:farm.loose.map(h=>[h.x|0,h.y|0]), P:[P.x|0,P.y|0], K:[farm.keelan.x|0,farm.keelan.y|0,!!farm.keelan.carrying], carry:!!farm.carrying};
    };
    const out={};
    for(const [name,eff] of [["perfect",1],["good",0.97],["casual",0.93]])
      for(const help of [false,true]){
        const rs=[...Array(20)].map(()=>run(eff,help));
        out[name+(help?"+keelan":"")]=rs.filter(r=>r.timeout).map(r=>JSON.stringify([r.where,r.P,r.K,r.carry])).join(" ")+` ${rs.filter(r=>r.win).length}/${rs.length} wins, avg ${Math.round(rs.reduce((a,r)=>a+r.secs,0)/rs.length)}s, avg peak loose ${(rs.reduce((a,r)=>a+r.maxLoose,0)/rs.length).toFixed(1)}`;
      }
    return out;
  },OVERRIDE);
  console.log(res, errs.length?errs:'no errors'); await b.close();
})();
