// Wylee Woods Disc Golf: a five-hole round against Jack and Margie. Win it and the creamery hands over the milk.
// Throwing: tap once to lock your aim (the arrow sweeps), tap again to lock your power (the meter pulses).
// Inside the circle around the basket it's a putt: slower sweep, shorter throw, easier to sink.
const GOLF={
  MAX:150, PUTT_MAX:58, PUTT_RANGE:45,              // throw distances (px)
  AIM_SPAN:.6, AIM_PERIOD:1600,                      // drive aim sweeps +-0.6 rad
  PUTT_SPAN:.32, PUTT_PERIOD:2100,                   // putt aim sweeps slower and narrower
  POWER_PERIOD:1300, PUTT_POWER_PERIOD:1700,
  CHAINS:6, PUTT_CHAINS:7.5, TREE_R:6, TREE_HIT:1.6, TREE_NUDGE:.18,   // trees: only a hit within 1.6px of dead center stops the disc; closer passes get nudged around
  FADE:.35, SPEED:.22, MAX_STROKES:7,
  PLATFORM:1.3, HIKE:.75, HIKE_WILD:.22,            // platform throws go 30% farther; hikes go 75% as far, +-0.11 rad wild
  // opponents' score on each hole relative to par (chances). Margie's the better player.
  MARGIE:{'-1':.1,'0':.1,'1':.8},     // simulated: sharp timing wins ~95%, average ~81%, sloppy ~56%
  JACK:{'-1':.10,'0':.45,'1':.35,'2':.10},
};
const GW=224, GH=168, GOLF_OB=R(4,8,216,156);
const HOLES=[
  {tee:{x:24,y:138}, basket:{x:192,y:36}, par:3, water:[],
   trees:[[70,112],[100,84],[132,124],[152,62],[176,98],[62,52],[122,30],[40,96]]},
  // The Lookout: you throw from a raised platform. From up there the disc flies farther and clears the trees near the tee.
  {tee:{x:28,y:138}, basket:{x:198,y:30}, par:3, water:[], platform:true,
   trees:[[56,118],[70,104],[84,92],[50,96],[96,124],[66,82],[140,52],[176,70],[150,108]]},
  {tee:{x:20,y:90}, basket:{x:204,y:88}, par:3, water:[{x:110,y:90,rx:40,ry:32}],
   trees:[[182,58],[186,122],[162,96],[60,40],[60,140],[140,30],[140,150]]},
  // Hut! Hut!: face away from the basket and hike it through your legs (shorter, a little wild, no fade)
  {tee:{x:40,y:86}, basket:{x:190,y:86}, par:3, water:[], hike:true,
   trees:[[116,50],[120,124],[154,64],[154,108],[80,30],[80,142],[200,40],[200,132]]},
  {tee:{x:112,y:146}, basket:{x:112,y:24}, par:3, water:[],
   trees:[...[30,48,66,84,102,120,138].flatMap(y=>[[82,y],[142,y]]),[112,92]]},
];
const CREAMERY=R(8,10,44,30);
const golf={active:false, hole:0, strokes:0, lie:null, prevLie:null, state:'idle', t:0, angle:0, power:0, flight:null,
  you:[], margie:[], jack:[], msg:'', done:false};

function drawBasket(x,y){
  const F=(c,dx,dy,w,h)=>{ctx.fillStyle=c;ctx.fillRect(x+dx,y+dy,w,h)};
  F('rgba(0,0,0,.25)',-5,6,11,2); F('#8a8f9a',-1,-14,2,20); F('#c9ced4',-5,-14,11,2); F('#f4d35e',-5,-12,11,1);
  for(let i=-4;i<=4;i+=2)F('#b4bac3',i,-11,1,6); F('#8a8f9a',-5,-5,11,4); F('#5f6676',-4,-4,9,2);
}
function drawCow(x,y){
  const F=(c,dx,dy,w,h)=>{ctx.fillStyle=c;ctx.fillRect(x+dx,y+dy,w,h)};
  F('rgba(0,0,0,.2)',0,8,14,2); F('#fffaf0',0,0,12,7); F('#2b2b2b',2,1,3,3); F('#2b2b2b',8,3,3,2);
  F('#fffaf0',11,-2,5,5); F('#f2a7a0',14,1,2,2); F('#2b2b2b',13,-1,1,1); F('#3b2a1e',1,7,2,2); F('#3b2a1e',9,7,2,2);
  if((time/1500|0)%3===0)F('#2b2b2b',-1,1,1,3);   // tail swish
}
// Jack: short blond hair, teal polo, khaki shorts
function drawJack(x,y){
  const F=(c,dx,dy,w,h)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x)-6+dx,Math.round(y)-19+dy,w,h)};
  F('rgba(0,0,0,.2)',1,18,10,2); F('#f3cba8',3,13,2,5); F('#f3cba8',7,13,2,5); F('#ffffff',3,17,2,1); F('#ffffff',7,17,2,1); F('#3b3b44',2,18,4,1); F('#3b3b44',6,18,4,1);
  F('#c9b17a',2,11,8,3); F('#2a9d8f',2,6,8,6); F('#ffffff',5,6,2,1); F('#f3cba8',1,7,1,4); F('#f3cba8',10,7,1,4);
  F('#f3cba8',3,1,6,5); F('#e6c46a',3,0,6,2); F('#2b2b2b',4,3,1,1); F('#2b2b2b',7,3,1,1); F('#c9876f',5,5,2,1);
  F('#f4d35e',11,9,4,1); F('#e8742a',11,8,4,1);   // a disc in hand
}
// Margie: long blond hair, fun heart-shaped pink sunglasses, bright top
function drawMargie(x,y){
  const F=(c,dx,dy,w,h)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x)-6+dx,Math.round(y)-19+dy,w,h)};
  F('rgba(0,0,0,.2)',1,18,10,2); F('#f3cba8',3,13,2,5); F('#f3cba8',7,13,2,5); F('#ffffff',2,17,3,2); F('#ffffff',7,17,3,2);
  F('#3a5f9e',2,11,8,3); F('#e54b7a',2,6,8,6); F('#ffd84d',4,8,4,2); F('#f3cba8',1,7,1,4); F('#f3cba8',10,7,1,4);
  F('#e6c46a',2,0,8,3); F('#e6c46a',1,2,2,9); F('#e6c46a',9,2,2,9); F('#f2d88a',3,1,3,1);   // long blond hair
  F('#f3cba8',3,2,6,5); F('#e6c46a',3,2,6,1);
  F('#ff4fa3',3,3,3,2); F('#ff4fa3',6,3,3,2); F('#ffffff',4,3,1,1); F('#ffffff',7,3,1,1);   // heart sunglasses
  F('#c9576a',5,6,2,1);
  F('#7fd3ff',-3,8,4,1); F('#2f6db0',-3,9,4,1);   // a disc in hand
}

// ---------- backgrounds, one per hole ----------
const golfBgs=HOLES.map((h,i)=>{
  const c=document.createElement('canvas'); c.width=GW; c.height=GH; const g=c.getContext('2d'), F=(col,x,y,w,hh)=>{g.fillStyle=col;g.fillRect(x,y,w,hh)};
  F('#5e9a40',0,0,GW,GH); F('#6aa84a',GOLF_OB.x,GOLF_OB.y,GOLF_OB.w,GOLF_OB.h);
  for(let k=0;k<500;k++)F(rnd()<.5?'#79b857':'#5e9a40',GOLF_OB.x+rnd()*GOLF_OB.w|0,GOLF_OB.y+rnd()*GOLF_OB.h|0,1,2);
  for(let k=0;k<160;k++){const x=rnd()*GW|0, y=rnd()*GH|0; F('#4f8a37',x,y,1,2); F('#4f8a37',x+2,y,1,2); F('#5e9a40',x+1,y-1,1,3)}   // tufts
  for(let k=0;k<26;k++){const x=6+rnd()*(GW-12)|0, y=10+rnd()*(GH-20)|0, c=['#ffffff','#f4d35e','#f2a7c8'][k%3]; F(c,x-1,y,1,1); F(c,x+1,y,1,1); F(c,x,y-1,1,1); F(c,x,y+1,1,1); F('#f4d35e',x,y,1,1)}
  // OB line (white stakes)
  for(let x=GOLF_OB.x;x<GOLF_OB.x+GOLF_OB.w;x+=8){F('#ffffff',x,GOLF_OB.y-1,4,1);F('#ffffff',x,GOLF_OB.y+GOLF_OB.h,4,1)}
  for(let y=GOLF_OB.y;y<GOLF_OB.y+GOLF_OB.h;y+=8){F('#ffffff',GOLF_OB.x-1,y,1,4);F('#ffffff',GOLF_OB.x+GOLF_OB.w,y,1,4)}
  // fairway hint from tee to basket
  const t=h.tee,b=h.basket; for(let s=0;s<=1;s+=.01){const x=t.x+(b.x-t.x)*s, y=t.y+(b.y-t.y)*s; F(Math.floor(s*14)%2?'#7aba57':'#6fae4d',x-9,y-9,18,18)}   // mowed stripes
  for(let s=0;s<=1;s+=.02){const x=t.x+(b.x-t.x)*s, y=t.y+(b.y-t.y)*s; F('#82c25e',x-9,y-9,1,1); F('#82c25e',x+8,y+8,1,1)}
  for(const w of h.water){g.fillStyle='#3d7fb8'; g.beginPath(); g.ellipse(w.x,w.y,w.rx,w.ry,0,0,Math.PI*2); g.fill();
    g.fillStyle='#5a9bd0'; g.beginPath(); g.ellipse(w.x-6,w.y-6,w.rx*.6,w.ry*.5,0,0,Math.PI*2); g.fill(); F('#d7ecf8',w.x-10,w.y-8,6,1); F('#d7ecf8',w.x+8,w.y+6,5,1)}
  F('#9a9690',t.x-8,t.y-5,16,10); F('#b4b2ad',t.x-7,t.y-4,14,8);           // tee pad
  // the circle (putting range)
  g.strokeStyle='rgba(255,255,255,.35)'; g.setLineDash([3,3]); g.beginPath(); g.arc(b.x,b.y,GOLF.PUTT_RANGE,0,Math.PI*2); g.stroke(); g.setLineDash([]);
  if(i===0){ // the creamery
    const r=CREAMERY; F('rgba(0,0,0,.15)',r.x,r.y+r.h,r.w,3);
    F('#b7412e',r.x,r.y+6,r.w,r.h-6); for(let x=r.x+2;x<r.x+r.w;x+=4)F('#a5392a',x,r.y+8,1,r.h-8);
    F('#7a2a22',r.x-2,r.y,r.w+4,8); for(let y=r.y+1;y<r.y+8;y+=2)F('#6a2219',r.x-2,y,r.w+4,1); F('#f1e3c9',r.x-2,r.y+7,r.w+4,1);
    F('#f1e3c9',r.x+16,r.y+14,12,16); F('#5a2a20',r.x+17,r.y+15,10,15); F('#f1e3c9',r.x+21,r.y+15,2,15);
    F('#fffaf0',r.x+3,r.y+10,10,8); F('#3d8ad6',r.x+4,r.y+12,8,1); F('#3d8ad6',r.x+4,r.y+15,8,1); F('#2b2b2b',r.x+5,r.y+13,1,1);   // a MILK sign, sort of
    F('#c9ced4',r.x+r.w+2,r.y-2,8,22); F('#e8eef0',r.x+r.w+3,r.y-2,3,22); F('#8a8f9a',r.x+r.w+2,r.y-4,8,3); F('#8a8f9a',r.x+r.w+2,r.y+19,8,1);   // silo
  }
  return c;
});

// ---------- throwing ----------
const golfHole=()=>HOLES[golf.hole];
const isPutt=()=>Math.hypot(golf.lie.x-golfHole().basket.x,golf.lie.y-golfHole().basket.y)<=GOLF.PUTT_RANGE;
const aimBase=()=>{const b=golfHole().basket; return Math.atan2(b.y-golf.lie.y,b.x-golf.lie.x)};
function aimNow(){const span=isPutt()?GOLF.PUTT_SPAN:GOLF.AIM_SPAN, per=isPutt()?GOLF.PUTT_PERIOD:GOLF.AIM_PERIOD; return aimBase()+span*Math.sin(golf.t/per*Math.PI*2)}
function powerNow(){const per=isPutt()?GOLF.PUTT_POWER_PERIOD:GOLF.POWER_PERIOD, ph=(golf.t%per)/per; return ph<.5?ph*2:2-ph*2}
const inWater=(h,x,y)=>h.water.some(w=>((x-w.x)/w.rx)**2+((y-w.y)/w.ry)**2<=1);
// where a throw goes: returns {path, end, result:'in'|'tree'|'water'|'ob'|'land'}
// special first throws: 'platform' (farther, sails over the trees early on) or 'hike' (through the legs: shorter, no fade)
function throwMode(){const h=golfHole(); if(golf.lie.x!==h.tee.x||golf.lie.y!==h.tee.y)return ''; return h.platform?'platform':h.hike?'hike':''}   // a rethrow from the tee is still special
function golfFlight(h,lie,angle,power,putt,mode=''){
  const mult=mode==='platform'?GOLF.PLATFORM:mode==='hike'?GOLF.HIKE:1;
  const D=Math.max(8,power*(putt?GOLF.PUTT_MAX:GOLF.MAX)*mult), path=[], passed=new Set(); let x=lie.x,y=lie.y,a=angle;
  for(let s=0;s<=D;s+=1){
    if(!putt&&mode!=='hike'){const f=s/D; if(f>.72)a-=GOLF.FADE/(D*.28)}    // backhand fade at the end
    x+=Math.cos(a); y+=Math.sin(a); path.push({x,y});
    const db=Math.hypot(x-h.basket.x,y-h.basket.y);
    if(db<(putt?GOLF.PUTT_CHAINS:GOLF.CHAINS)&&(putt||s>D*.55))return {path,end:{x:h.basket.x,y:h.basket.y},result:'in'};
    // trees: a dead-center hit stops the disc; anything else glances off and curves around the trunk
    if(!(mode==='platform'&&s<D*.5))for(const [tx,ty] of h.trees){ const cy=ty-3; if(passed.has(tx+','+ty)||Math.hypot(x-tx,y-cy)>=GOLF.TREE_R)continue;
      passed.add(tx+','+ty); const side=Math.cos(a)*(cy-y)-Math.sin(a)*(tx-x);   // how far the trunk is from the disc's line (+ = to the right)
      if(Math.abs(side)<GOLF.TREE_HIT){ const bx=x-Math.cos(a)*4, by=y-Math.sin(a)*4; path.push({x:bx,y:by}); return {path,end:{x:bx,y:by},result:'tree'} }
      a-=Math.sign(side)*GOLF.TREE_NUDGE }
    if(x<GOLF_OB.x||y<GOLF_OB.y||x>GOLF_OB.x+GOLF_OB.w||y>GOLF_OB.y+GOLF_OB.h)return {path,end:{x,y},result:'ob'};
  }
  return {path,end:{x,y},result:inWater(h,x,y)?'water':'land'};
}
function golfTap(){
  if(!golf.active)return;
  if(golf.state==='aim'){golf.angle=aimNow(); golf.state='power'; golf.t=Math.random()*400; return}
  if(golf.state==='power'){
    golf.power=powerNow(); const putt=isPutt(), mode=throwMode();
    if(mode==='hike')golf.angle+=(Math.random()-.5)*GOLF.HIKE_WILD;      // you can't really see where it's going
    golf.flight=golfFlight(golfHole(),golf.lie,golf.angle,golf.power,putt,mode); golf.flight.i=0; golf.flight.putt=putt; golf.flight.mode=mode;
    golf.strokes++; golf.state='flight'; golf.msg=''; sfx('whoosh');
  }
}
function golfLand(){
  const f=golf.flight, h=golfHole(), T=GOLF_TEXT;
  if(golf.practice){ sfx(f.result==='in'?'chains':f.result==='water'?'splash':f.result==='tree'?'thud':'click'); if(f.result!=='water'&&f.result!=='ob')golf.lie={...f.end}; P.x=golf.lie.x; P.y=golf.lie.y+4; return golfPracticeResult() }
  sfx(f.result==='in'?'chains':f.result==='water'?'splash':f.result==='ob'?'buzz':f.result==='tree'?'thud':'click');
  if(f.result==='in'){ golf.msg=golf.strokes===1?T.ace:T.chains; return golfHoleDone() }
  if(f.result==='water'||f.result==='ob'){ golf.strokes++; golf.msg=f.result==='water'?T.water:T.ob; P.x=golf.lie.x; P.y=golf.lie.y+4;
    // pop-up: what happened and the penalty
    golf.state='penalty';
    return showDialog({place:T.place,speaker:f.result==='water'?T.waterTitle:T.obTitle,pages:[T.penalty(golf.strokes+1)],actions:[{label:T.penaltyOk,fn:()=>{closeDialog();
      if(golf.strokes>=GOLF.MAX_STROKES)return golfHoleDone(true); golf.state='aim'; golf.t=Math.random()*1000}}]}) }
  else { golf.prevLie={...golf.lie}; golf.lie={...f.end}; if(f.result==='tree'){golf.msg=T.tree; flashGolf(T.tree)} }
  P.x=golf.lie.x; P.y=golf.lie.y+4;
  if(golf.strokes>=GOLF.MAX_STROKES)return golfHoleDone(true);
  golf.state='aim'; golf.t=Math.random()*1000;
}
function sampleScore(dist){let r=Math.random(); for(const [k,p] of Object.entries(dist)){r-=p; if(r<=0)return +k} return 0}
function golfHoleDone(pickedUp){
  golf.state='between'; const h=golfHole(), T=GOLF_TEXT, rel=golf.strokes-h.par;
  const m=sampleScore(GOLF.MARGIE), j=sampleScore(GOLF.JACK);
  golf.you.push(rel); golf.margie.push(m); golf.jack.push(j);
  const word=r=>r<=-2?'Eagle':r===-1?'Birdie':r===0?'Par':r===1?'Bogey':r===2?'Double bogey':`+${r}`;
  const lines=[['',`${golf.msg?golf.msg+' ':''}${pickedUp?'You pick up.':''} ${word(rel)} (${golf.strokes} throws).`.trim()],
    ['Margie',T.margieHole[String(m)]],['Jack',T.jackHole[String(j)]]];
  golf.timer=setTimeout(()=>say(lines,()=>{ if(golf.hole<HOLES.length-1){golf.hole++; golfStartHole()} else golfRoundOver() }),500);
}
function golfStartHole(){
  const h=golfHole(); golf.lie={...h.tee}; golf.prevLie={...h.tee}; golf.strokes=0; golf.state='aim'; golf.t=Math.random()*1000; golf.msg='';
  P.x=h.tee.x; P.y=h.tee.y+4; P.dir='right';
  flashGolf(GOLF_TEXT.holeNames[golf.hole]);
  if(h.platform)say([['Margie',GOLF_TEXT.platformHint]]);
  if(h.hike){P.dir='left'; say([['Jack',GOLF_TEXT.hikeHint]])}
}
const onPlatform=()=>golf.active&&golfHole().platform&&golf.lie&&golf.lie.x===golfHole().tee.x&&golf.lie.y===golfHole().tee.y&&golf.state!=='between';
function flashGolf(t){prompt.textContent=t; prompt.hidden=false; golf.promptT=1800}
function golfRoundOver(){
  golf.active=false; golf.state='idle';
  const sum=a=>a.reduce((x,y)=>x+y,0), you=sum(golf.you), m=sum(golf.margie), j=sum(golf.jack);
  const fmt=v=>v===0?'E':v>0?`+${v}`:`${v}`;
  const card=`Final: Joe ${fmt(you)} · Margie ${fmt(m)} · Jack ${fmt(j)}`;
  const won=you<j&&you<=m;
  const h=HOLES[0]; P.x=h.tee.x+30; P.y=h.tee.y-10;
  if(won){ have.golfWon=true; save(); say([['',card],...GOLF_TEXT.win.map(t=>['Margie',t]),['Jack',GOLF_TEXT.jackWin]],()=>showReward('golf')) }
  else say([['',card],['Margie',GOLF_TEXT.lose[0]]],()=>{ showDialog({place:GOLF_TEXT.place,speaker:'Margie',pages:['Another round?'],actions:[{label:GOLF_TEXT.again,fn:()=>{closeDialog();golfStartRound()}},{label:GOLF_TEXT.notYet,ghost:true,fn:closeDialog}]}) });
}
function golfRestart(){
  if(!golf.active)return; const T=GOLF_TEXT;
  showDialog({place:T.place,speaker:'Margie',pages:[T.restartAsk],actions:[{label:T.restartYes,fn:()=>{closeDialog(); clearTimeout(golf.timer); golf.flight=null; golfStartRound()}},{label:T.restartNo,ghost:true,fn:closeDialog}]});
}
$('golfRestart').onclick=()=>{ $('golfRestart').blur(); golfRestart() };
function golfStartRound(){ Object.assign(golf,{active:true,practice:false,hole:0,you:[],margie:[],jack:[]}); golfStartHole() }

function talkMargie(){
  const T=GOLF_TEXT;
  if(have.golf)return say([['Margie',T.after]]);
  if(have.golfWon)return showReward('golf');
  showDialog({place:T.place,speaker:'Margie',pages:T.margieHello,actions:[{label:T.ready,fn:()=>{closeDialog();golfHowTo(golfPracticeAsk)}},{label:T.notYet,ghost:true,fn:closeDialog}]});
}
// instructions card, then the offer of a practice throw
function golfHowTo(then){
  const T=GOLF_TEXT;
  const rows=['Margie','Jack'].map(name=>{const p=PORTRAITS[name], c=document.createElement('canvas'); c.width=c.height=p.size; const g=c.getContext('2d'); g.fillStyle=p.bg; g.fillRect(0,0,p.size,p.size); p.draw(g);
    const row=document.createElement('div'); row.className='hrow'; const t=document.createElement('div'); t.innerHTML='<b></b><span></span>'; t.querySelector('b').textContent=name; t.querySelector('span').textContent=T.howToPeople[name]; row.append(c,t); return row});
  $('howTitle').textContent=T.howToTitle; $('howRows').replaceChildren(...rows);
  $('howControls').replaceChildren(...T.howToSteps.map(x=>{const li=document.createElement('li'); li.textContent=x; return li}));
  $('howOk').textContent=T.howToOk; $('howOk').onclick=()=>{ $('howto').hidden=true; paused=false; then&&then() };
  paused=true; prompt.hidden=true; $('howto').hidden=false; setTimeout(()=>$('howOk').focus({preventScroll:true}),0);
}
function golfPracticeAsk(){
  const T=GOLF_TEXT;
  showDialog({place:T.place,speaker:'Margie',pages:[T.practiceAsk],actions:[
    {label:T.practice,fn:()=>{closeDialog();golfPractice()}},{label:T.startRound,fn:()=>{closeDialog();golfStartRound()}}]});
}
function golfPractice(){
  Object.assign(golf,{active:true,practice:true,hole:0,you:[],margie:[],jack:[]});
  const h=HOLES[0]; golf.lie={...h.tee}; golf.prevLie={...h.tee}; golf.strokes=0; golf.state='aim'; golf.t=Math.random()*1000; golf.msg='';
  P.x=h.tee.x; P.y=h.tee.y+4; P.dir='right'; flashGolf(GOLF_TEXT.practice);
}
function golfPracticeResult(){
  const T=GOLF_TEXT, f=golf.flight, b=golfHole().basket;
  const line=f.result==='in'?T.practiceIn:f.result==='water'?T.practiceWater:f.result==='ob'?T.practiceOb:(f.result==='tree'?T.practiceTree+' ':'')+T.practiceDist(Math.round(Math.hypot(f.end.x-b.x,f.end.y-b.y)));
  golf.state='between';
  setTimeout(()=>showDialog({place:T.place,speaker:'Margie',pages:[line],actions:[
    {label:T.practiceAgain,fn:()=>{closeDialog();golfPractice()}},{label:T.startRound,fn:()=>{closeDialog();golf.practice=false;golfStartRound()}}]}),400);
}
const MARGIE_SPOT={x:46,y:118}, JACK_SPOT={x:62,y:128};
SCENES.golf={ place:GOLF_TEXT.place,
  w:GW, h:GH, bounds:R(4,30,216,136),
  get bg(){ return golfBgs[golf.active||golf.state==='between'?golf.hole:0] },
  get solids(){ return golf.active?[]:[CREAMERY,...HOLES[0].trees.map(([x,y])=>R(x-3,y-3,6,4)),R(MARGIE_SPOT.x-4,MARGIE_SPOT.y-3,8,4),R(JACK_SPOT.x-4,JACK_SPOT.y-3,8,4),R(188,30,8,8)] },
  get triggers(){ return golf.active?[]:[{z:R(96,160,32,8),label:GOLF_TEXT.leave,act:()=>goTo('world','fromGolf')}] },
  entries:{start:{x:112,y:154,dir:'up'}, fromRoad:{x:112,y:154,dir:'up'}},
  enter(){ golf.active=false; golf.state='idle' },
  speed:()=>golf.active?0:.07,
  dynTrigger(){
    if(golf.active)return null;
    if(Math.hypot(P.x-MARGIE_SPOT.x,P.y-MARGIE_SPOT.y)<15)return {label:'Talk to Margie',btn:'Talk',act:talkMargie};
    if(Math.hypot(P.x-JACK_SPOT.x,P.y-JACK_SPOT.y)<15)return {label:'Talk to Jack',btn:'Talk',act:()=>say([['Jack',GOLF_TEXT.jackHello]])};
    return null;
  },
  ability:()=>golfTap(),
  abilityLabel:()=>golf.active?(golf.state==='aim'?'Aim':golf.state==='power'?(throwMode()==='hike'?'Hike!':'Throw'):''):'',
  ambient(dt){ if(golf.promptT>0){golf.promptT-=dt; if(golf.promptT<=0&&!near)prompt.hidden=true} },
  update(dt){
    if(!golf.active)return;
    if(golf.state==='aim'||golf.state==='power')golf.t+=dt;
    if(golf.state==='flight'){const f=golf.flight; f.i=Math.min(f.path.length-1,f.i+dt*GOLF.SPEED*(f.putt?.8:1)); if(f.i>=f.path.length-1)golfLand()}
  },
  drawPlayer:(x,y)=>{
    if(golf.active&&throwMode()==='hike'&&golf.state!=='flight')P.dir='left';   // facing away from the basket
    drawPlayer(x,y-(onPlatform()?7:0));
    if(golf.active&&throwMode()==='hike'&&(golf.state==='aim'||golf.state==='power')){ // HUT! HUT!
      const bx=Math.round(x)-22, by=Math.round(y)-34; ctx.fillStyle='#ffffff'; ctx.fillRect(bx,by,24,9); ctx.fillRect(bx+18,by+9,2,2);
      ctx.fillStyle='#2b2236'; ctx.font='7px monospace'; ctx.fillText('HUT!',bx+3,by+7)}
  },
  under(){
    const h=golf.active||golf.state==='between'?golfHole():HOLES[0]; drawBasket(h.basket.x,h.basket.y);
    if(h.platform){const t=h.tee, F=(c,x,y,w,hh)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,hh)};   // the lookout platform
      F('rgba(0,0,0,.22)',t.x-9,t.y+1,22,6); F('#6b4a2f',t.x-10,t.y-4,2,8); F('#6b4a2f',t.x+8,t.y-4,2,8);
      F('#a26c40',t.x-11,t.y-8,22,6); for(let xx=t.x-11;xx<t.x+11;xx+=4)F('#8a5a34',xx,t.y-8,1,6); F('#5a3a22',t.x-11,t.y-10,22,1);
      F('#6b4a2f',t.x+11,t.y-7,2,12); for(let yy=t.y-5;yy<t.y+5;yy+=3)F('#8a5a34',t.x+11,yy,4,1)}
    if(!golf.active&&golf.state!=='between'){drawCow(18,46); drawCow(60,20)}
  },
  ents(list){
    const h=golf.active||golf.state==='between'?golfHole():HOLES[0];
    h.trees.forEach(([x,y])=>list.push({y,draw:()=>drawTree(x,y)}));
    const m=golf.active?{x:h.tee.x+(h.tee.x>150?-16:16),y:h.tee.y-14}:MARGIE_SPOT, j=golf.active?{x:h.tee.x+(h.tee.x>150?-28:28),y:h.tee.y-4}:JACK_SPOT;
    list.push({y:m.y,draw:()=>drawMargie(m.x,m.y)},{y:j.y,draw:()=>drawJack(j.x,j.y)});
  },
  over(){
    if(!golf.active)return;
    const L=golf.lie, putt=isPutt();
    if(golf.state==='aim'||golf.state==='power'){
      const a=golf.state==='aim'?aimNow():golf.angle, len=putt?24:34;
      ctx.fillStyle='rgba(255,255,255,.85)'; for(let s=6;s<len;s+=4)ctx.fillRect(Math.round(L.x+Math.cos(a)*s)-1,Math.round(L.y+Math.sin(a)*s)-1,2,2);
      ctx.fillStyle='#f4d35e'; ctx.fillRect(Math.round(L.x+Math.cos(a)*len)-2,Math.round(L.y+Math.sin(a)*len)-2,4,4);
    }
    if(golf.state==='power'){ // pulsing meter by your feet
      const pw=powerNow(), bx=Math.round(L.x)+9, by=Math.round(L.y)-26;
      ctx.fillStyle='#1d2130'; ctx.fillRect(bx,by,5,28); ctx.fillStyle=pw>.85?'#e54b4b':pw>.5?'#f4d35e':'#8cff8c'; ctx.fillRect(bx+1,by+27-Math.round(pw*26),3,Math.round(pw*26));
    }
    if(golf.state==='flight'){const p=golf.flight.path[Math.floor(golf.flight.i)]; ctx.fillStyle='rgba(0,0,0,.25)'; ctx.fillRect(p.x-2,p.y+3,5,2); ctx.fillStyle='#e8742a'; ctx.fillRect(Math.round(p.x)-2,Math.round(p.y)-2,5,3); ctx.fillStyle='#f4d35e'; ctx.fillRect(Math.round(p.x)-1,Math.round(p.y)-2,3,1)}
    else if(golf.lie&&golf.state!=='between'){ctx.fillStyle='#e8742a'; ctx.fillRect(Math.round(L.x)-2,Math.round(L.y)-1,5,2)}
  },
  hud(){
    if(!golf.active)return '';
    if(golf.practice)return `<span>Practice throw: doesn't count</span>`;
    const sum=a=>a.reduce((x,y)=>x+y,0), fmt=v=>v===0?'E':v>0?`+${v}`:`${v}`;
    return `<span>H${golf.hole+1} · ${isPutt()?'Putt':'Throw '+(golf.strokes+1)}</span><span>Joe ${fmt(sum(golf.you))}</span><span>M ${fmt(sum(golf.margie))}</span><span>J ${fmt(sum(golf.jack))}</span>`;
  },
};
