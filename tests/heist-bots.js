// Bots that play the hard parts of the heist, used by heist-scenarios.js (and handy for tuning).
// Run on its own for a difficulty report: node tests/heist-bots.js
(typeof window!=="undefined"?window:globalThis).heistBots={
  // Lars, alone (crew on Hold), dashes from shadow to shadow on roof B. He waits in cover until the next dash looks clear.
  lights(maxMs=90000){
    const spots=[[166,100],[198,125],[234,76],[258,138],[304,100]];
    const lit=(x,y,t)=>!inCover(x,y)&&LIGHTS.some(L=>{const l=lightPosAt(L,t); return Math.hypot(x-l.x,y-7-l.y)<LIGHT_R+1});
    // where Lars will actually be, frame by frame, if he sprints from a to b now (8-way movement, sprint then jog)
    const clear=(a,b,t0)=>{let x=a[0], y=a[1], t=0; for(let f=0;f<200;f++){ const dx=b[0]-x, dy=b[1]-y; if(Math.hypot(dx,dy)<2.5)return true;
        let mx=(dx>1)-(dx<-1), my=(dy>1)-(dy<-1); if(mx&&my){mx*=.707;my*=.707} const sp=(t<800?.19:.09)*16.7; if(!blocked(x+mx*sp,y))x+=mx*sp; if(!blocked(x,y+my*sp))y+=my*sp; t+=16.7;   // same bumping-into-things as the game
        if(lit(x,y,t0+t)||lit(x,y,t0+t+60))return false } return false};
    let i=0, waited=0, tries=0;
    for(let f=0;f<maxMs/16.7;f++){
      if(heistStage()>=2||heist.lightsOutT>0)return {ok:true,ms:Math.round(f*16.7),waited};
      if(!dlg.hidden){ if($('dspeaker').textContent!=='Spotted!'){closeDialog(); continue} return {ok:false,why:$('dtext').textContent+' '+heist.caughtWho+' '+heist.crew.map(c=>c.id+':'+(c.x|0)+','+(c.y|0)).join(' ')+' g'+(heist.guardY|0),at:i} }
      const here=spots[i], next=spots[Math.min(i+1,spots.length-1)];
      if(Math.hypot(P.x-next[0],P.y-next[1])<2.5){ i++; for(const k in dirs)dirs[k]=false; if(i===spots.length-1){update(16.7); action(); continue} continue }
      const moving=dirs.left||dirs.right||dirs.up||dirs.down;
      if(!moving){ if(heist.sprintCd>0||!clear([P.x,P.y],next,time)){waited+=16.7; update(16.7); continue} useSkill() }
      for(const k in dirs)dirs[k]=false; const dx=next[0]-P.x, dy=next[1]-P.y;
      if(dx>1)dirs.right=true; if(dx<-1)dirs.left=true; if(dy>1)dirs.down=true; if(dy<-1)dirs.up=true; update(16.7);
    }
    return {ok:false,why:'timeout',at:i};
  },
  // someone who ignores the lights and just walks to the switch
  naive(){ for(let f=0;f<1500;f++){ if(!dlg.hidden){ if($('dspeaker').textContent!=='Spotted!'){closeDialog(); continue} return {ok:false} } if(Math.hypot(P.x-304,P.y-100)<2){action(); return {ok:heistStage()>=2||heist.lightsOutT>0}}
    for(const k in dirs)dirs[k]=false; if(304-P.x>1)dirs.right=true; if(304-P.x<-1)dirs.left=true; if(100-P.y>1)dirs.down=true; if(100-P.y<-1)dirs.up=true; update(16.7)} return {ok:false} },
  // with the lights out: John leads everyone (crew on Follow) to the gate on the plank, lifts it, and they all cross onto roof C
  across(maxMs=20000){
    if(!heist.follow)toggleFollow(); switchTo(2);
    const route=[[240,100],[300,100],[300,146],[326,146],'gate',[358,146],[360,172]]; let i=0, left=0; const said=[];
    for(let f=0;f<maxMs/16.7;f++){
      if(!dlg.hidden){ if($('dspeaker').textContent==='Spotted!')return {ok:false,why:$('dtext').textContent,at:i,said}; said.push($('dspeaker').textContent+': '+$('dtext').textContent); [...$('dbtns').querySelectorAll('button')][0].click(); continue }
      if(heistStage()>=2)return {ok:true,ms:Math.round(f*16.7),left,said};
      left=Math.ceil(heist.lightsOutT/1000);
      if(i>=route.length){for(const k in dirs)dirs[k]=false; update(16.7); continue}
      if(route[i]==='gate'){for(const k in dirs)dirs[k]=false; update(16.7); action(); i++; continue}
      const [tx,ty]=route[i]; for(const k in dirs)dirs[k]=false; const dx=tx-P.x, dy=ty-P.y; if(Math.hypot(dx,dy)<1.5){i++; continue}
      if(dx>1)dirs.right=true; if(dx<-1)dirs.left=true; if(dy>1)dirs.down=true; if(dy<-1)dirs.up=true; update(16.7);
    }
    return {ok:false,why:'timeout',at:i};
  },
  // through the laser maze to the grate: wait for the guard, pick the gaps, time the blink and the slider
  lasers(maxMs=90000){
    const box=(x,y)=>R(x-3,y-3,6,4), hits=(x,y,t)=>laserSegs(t).some(([a,b,c,d])=>segHitsBox(a,b,c,d,box(x,y)));
    const guardSees=(x,y)=>{const gy=heist.guardY-6, along=(y-3-gy)*heist.guardDir, perp=Math.abs(x-GUARD.x); return heist.guardWait<=0&&along>-6&&along<70&&perp<along*.5+8};
    const route=[[362,176],[384,184],[410,184],[443,165],[443,140],[443,130],[473,110],[473,86],[0,80],[-1,62],[474,62]];   // 0 = line up with the slider gap; -1 = straight up from here
    let i=1;
    for(let f=0;f<maxMs/16.7;f++){
      if(!dlg.hidden){ if($('dspeaker').textContent!=='Spotted!'){closeDialog(); continue} return {ok:false,why:$('dtext').textContent+' '+heist.caughtWho+' '+heist.crew.map(c=>c.id+':'+(c.x|0)+','+(c.y|0)).join(' ')+' g'+(heist.guardY|0),at:i} }
      if(i>=route.length)return {ok:true,ms:Math.round(f*16.7)};
      let [tx,ty]=route[i]; if(tx===0)tx=Math.round(sliderGap(time+200)+SLIDER.gap/2); if(tx===-1)tx=Math.round(P.x);
      // don't step into the guard's light, the blink, or a slider beam
      const soon=(x,y)=>{for(let k=0;k<14;k++){const u=Math.min(1,k*1.2/Math.max(1,Math.hypot(tx-x,ty-y))); if(hits(x+(tx-x)*u,y+(ty-y)*u,time+k*16.7))return true} return false};
      if((P.x<430&&guardSees(tx,ty))||soon(P.x,P.y)){for(const k in dirs)dirs[k]=false; update(16.7); continue}
      for(const k in dirs)dirs[k]=false; const dx=tx-P.x, dy=ty-P.y; if(Math.hypot(dx,dy)<1.5){i++; continue}
      if(dx>1)dirs.right=true; if(dx<-1)dirs.left=true; if(dy>1)dirs.down=true; if(dy<-1)dirs.up=true; update(16.7);
    }
    return {ok:false,why:'timeout',at:i};
  },
};
if(typeof module!=='undefined'&&require.main===module){ (async()=>{
  const {chromium}=require('playwright'), path=require('path'), fs=require('fs'); const b=await chromium.launch(); const p=await b.newPage();
  await p.goto('file://'+path.resolve(__dirname,'../index.html')); await p.click('#startBtn'); await p.evaluate(()=>skipWelcome());
  await p.addScriptTag({content:fs.readFileSync(__filename,'utf8').split('if(typeof module')[0]});
  const out=await p.evaluate(()=>{const res={lights:[],naive:0,lasers:[]};
    const setup=(stage,who)=>{have.heistBriefed=true; have.heistHowTo=true; have.heistStage=stage; scene=SCENES.city; SCENES.city.enter(); paused=false; heist.follow=false; switchTo(who); time+=Math.random()*20000};
    for(let k=0;k<20;k++){setup(1,1); res.lights.push(heistBots.lights()); try{closeDialog()}catch(e){}}
    for(let k=0;k<20;k++){setup(1,1); if(heistBots.naive().ok)res.naive++; try{closeDialog()}catch(e){}}
    for(let k=0;k<20;k++){setup(2,2); heist.marked=true; res.lasers.push(heistBots.lasers()); try{closeDialog()}catch(e){}}
    const sum=a=>({made:a.filter(r=>r.ok).length, avgSec:+(a.filter(r=>r.ok).reduce((s,r)=>s+r.ms,0)/Math.max(1,a.filter(r=>r.ok).length)/1000).toFixed(1), fails:[...new Set(a.filter(r=>!r.ok).map(r=>r.why+' @'+r.at))].slice(0,4)});
    return {lights:sum(res.lights), naiveWalkStraight:res.naive+'/20', lasers:sum(res.lasers)}});
  console.log(out); await b.close() })() }
