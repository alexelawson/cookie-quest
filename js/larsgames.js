// The end of the heist: Lars challenges you. Pick a game (or let it pick for you), beat him, take the chocolate.
// Also: the how-to-play card for the crew.

// ---------- how to play ----------
function openHowTo(){
  const H=HEIST, rows=['hero','lars','john'].map(id=>{
    const name=id==='hero'?'You':H.crew[id], c=document.createElement('canvas'), p=PORTRAITS[name];
    c.width=c.height=p.size; const g=c.getContext('2d'); g.fillStyle=p.bg; g.fillRect(0,0,p.size,p.size); p.draw(g);
    const row=document.createElement('div'); row.className='hrow';
    const txt=document.createElement('div'); txt.innerHTML=`<b>${H.crew[id]} · ${H.skills[id]}</b><span></span>`; txt.querySelector('span').textContent=H.howToSkills[id];
    row.append(c,txt); return row;
  });
  $('howTitle').textContent=H.howToTitle; $('howRows').replaceChildren(...rows);
  $('howControls').replaceChildren(...H.howToControls.map(t=>{const li=document.createElement('li'); li.textContent=t; return li}));
  $('howOk').textContent=H.howToOk;
  paused=true; prompt.hidden=true; $('howto').hidden=false; setTimeout(()=>$('howOk').focus({preventScroll:true}),0);
}
$('howOk').onclick=()=>{ $('howto').hidden=true; paused=false; have.heistHowTo=true; save() };

// ---------- the menu ----------
const LARS_GAMES=['anagrams','quickdraw','darts'];
function openLarsMenu(){
  const G=HEIST.games, go=k=>()=>{ closeDialog(); startLarsGame(k==='random'?LARS_GAMES[Math.floor(Math.random()*LARS_GAMES.length)]:k) };
  showDialog({place:HEIST.place,speaker:'Lars',pages:[HEIST.larsPick],menu:true,
    actions:[...LARS_GAMES.map(k=>({label:G[k],fn:go(k)})),{label:G.random,fn:go('random')}]});
}
function startLarsGame(k){ if(k==='anagrams')openAnagrams(); else if(k==='quickdraw')openQuickDraw(); else openDarts() }
function larsGameOver(won){
  if(won){ have.heistStage=5; save(); say(HEIST.larsLoses,()=>showReward('city')) }
  else say(HEIST.larsWins,()=>openLarsMenu());
}

// ---------- shared panel for quick draw + darts ----------
const lg={open:false, game:null};
function lgShow(title,rules,startLabel,onStart){
  lg.open=true; $('lgTitle').textContent=title; $('lgMsg').textContent=rules; $('lgScore').textContent='';
  $('lgDraw').hidden=true; $('lgDarts').hidden=true; $('lgEnd').hidden=true;
  $('lgBtn').hidden=false; $('lgBtn').textContent=startLabel; $('lgBtn').onpointerdown=null; $('lgBtn').onclick=onStart;
  paused=true; prompt.hidden=true; $('lgame').hidden=false; setTimeout(()=>$('lgBtn').focus({preventScroll:true}),0);
}
function lgFinish(won,line){
  lg.game=null; $('lgBtn').hidden=true; $('lgEnd').hidden=false; $('lgResult').textContent=line;
  $('lgNext').textContent=won?HEIST.gameDone:HEIST.gameRematch;
  $('lgNext').onclick=()=>{ $('lgame').hidden=true; lg.open=false; larsGameOver(won) };
  setTimeout(()=>$('lgNext').focus({preventScroll:true}),0);
}
function lgPortrait(id,name){ const c=$(id), p=PORTRAITS[name]; c.width=c.height=p.size; const g=c.getContext('2d'); g.fillStyle=p.bg; g.fillRect(0,0,p.size,p.size); p.draw(g) }

// ---------- quick draw: wait for DRAW!, then tap. First to 3. ----------
// Lars's reaction time in seconds; a bit slower on touch screens since tapping a phone adds lag.
const QUICKDRAW={WIN:3, WAIT:[1500,4200], LARS:{mouse:[.245,.035], touch:[.285,.04]}, MIN:.19};
const qd={you:0,lars:0,state:'idle',drawAt:0,timer:null,larsTime:0};
const touchy=()=>matchMedia('(pointer:coarse)').matches;
function gauss(m,s){let u=0,v=0;while(!u)u=Math.random();while(!v)v=Math.random();return m+s*Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)}
function openQuickDraw(){
  lg.game='quickdraw'; Object.assign(qd,{you:0,lars:0,state:'idle'});
  lgShow(HEIST.quickdrawTitle,HEIST.quickdrawRules,HEIST.anagramStart,()=>{ $('lgDraw').hidden=false; qdRound() });
  lgPortrait('qdYou','You'); lgPortrait('qdLars','Lars'); qdScore();
}
function qdScore(){ $('lgScore').textContent=`You ${qd.you} · Lars ${qd.lars}` }
function qdRound(){
  clearTimeout(qd.timer); qd.state='wait'; $('qdSign').textContent=HEIST.quickdrawWait; $('qdSign').className='qsign';
  $('lgBtn').textContent='BANG!'; $('lgBtn').onclick=null; $('lgBtn').onpointerdown=e=>{e.preventDefault(); qdPress()};
  const [a,b]=QUICKDRAW.WAIT; qd.timer=setTimeout(qdDraw,a+Math.random()*(b-a));
}
function qdDraw(){
  qd.state='draw'; qd.drawAt=performance.now(); $('qdSign').textContent=HEIST.quickdrawDraw; $('qdSign').className='qsign draw';
  const [m,s]=QUICKDRAW.LARS[touchy()?'touch':'mouse']; qd.larsTime=Math.max(QUICKDRAW.MIN,gauss(m,s));
  qd.timer=setTimeout(()=>{ if(qd.state==='draw')qdResult(null) }, qd.larsTime*1000);   // Lars fires
}
function qdPress(){
  if(qd.state==='wait'){ clearTimeout(qd.timer); qd.lars++; qd.state='between'; $('qdSign').textContent=HEIST.quickdrawEarly; $('qdSign').className='qsign early'; return qdNext() }
  if(qd.state==='draw')qdResult((performance.now()-qd.drawAt)/1000);
}
function qdResult(t){
  clearTimeout(qd.timer); qd.state='between';
  const youWin=t!=null&&t<qd.larsTime; if(youWin)qd.you++; else qd.lars++;
  $('qdSign').className='qsign '+(youWin?'win':'lose');
  $('qdSign').textContent=(youWin?'You got him! ':'Lars got you. ')+(t!=null?`You ${t.toFixed(3)}s · `:'')+`Lars ${qd.larsTime.toFixed(3)}s`;
  qdNext();
}
function qdNext(){
  qdScore();
  if(qd.you>=QUICKDRAW.WIN) return lgFinish(true,`You win, ${qd.you} to ${qd.lars}. Fastest hands in the city.`);
  if(qd.lars>=QUICKDRAW.WIN) return lgFinish(false,`Lars wins, ${qd.lars} to ${qd.you}.`);
  $('lgBtn').onpointerdown=null; $('lgBtn').textContent='Next round'; $('lgBtn').onclick=()=>qdRound();
}

// ---------- darts: stop the line across, then down. 3 darts each. ----------
// Rings (radius in board pixels -> points). Lars's darts land with this much spread (bigger = worse).
// Simulated: a precise player (taps within ~20ms) wins ~62%, an average one ~35%, a sloppy one ~15%.
const DARTS={R:60, RINGS:[[5,50],[11,25],[22,15],[34,10],[48,5],[60,1]], SWEEP_X:1400, SWEEP_Y:1250, DARTS:3, LARS_SPREAD:8};
const dt_={phase:'idle', t:0, x:null, y:null, you:[], lars:[], marks:[]};
function openDarts(){
  lg.game='darts'; Object.assign(dt_,{phase:'idle',t:0,x:null,y:null,you:[],lars:[],marks:[]});
  lgShow(HEIST.dartsTitle,HEIST.dartsRules,HEIST.anagramStart,()=>{ $('lgDarts').hidden=false; dartsAim() });
  dartsScore(); drawBoard();
}
function dartPoints(x,y){ const r=Math.hypot(x,y); for(const [rr,p] of DARTS.RINGS)if(r<=rr)return p; return 0 }
function dartsScore(){ const sum=a=>a.reduce((x,y)=>x+y,0);
  $('lgScore').textContent=`You ${sum(dt_.you)} (${dt_.you.join(', ')||'-'}) · Lars ${sum(dt_.lars)} (${dt_.lars.join(', ')||'-'})` }
function dartsAim(){ dt_.phase='x'; dt_.t=Math.random()*1000; dt_.x=null; dt_.y=null;
  $('lgBtn').textContent='Stop'; $('lgBtn').onclick=null; $('lgBtn').onpointerdown=e=>{e.preventDefault(); dartTap()} }
const sweep=(t,period)=>Math.sin(t/period*Math.PI*2)*(DARTS.R+4);
function dartTap(){
  if(dt_.phase==='x'){ dt_.x=sweep(dt_.t,DARTS.SWEEP_X); dt_.phase='y'; dt_.t=Math.random()*1000; return }
  if(dt_.phase!=='y')return;
  dt_.y=sweep(dt_.t,DARTS.SWEEP_Y); dt_.phase='thrown';
  const x=dt_.x+(Math.random()-.5)*3, y=dt_.y+(Math.random()-.5)*3, pts=dartPoints(x,y);
  dt_.you.push(pts); dt_.marks.push({x,y,who:'you'}); $('lgMsg').textContent=`Your dart: ${pts}`;
  $('lgBtn').onpointerdown=null; $('lgBtn').textContent='...'; dartsScore(); drawBoard();
  setTimeout(larsThrows,700);
}
function larsThrows(){
  const s=DARTS.LARS_SPREAD, x=gauss(0,s), y=gauss(0,s), pts=dartPoints(x,y);
  dt_.lars.push(pts); dt_.marks.push({x,y,who:'lars'}); $('lgMsg').textContent+=` · Lars: ${pts}`; dartsScore(); drawBoard();
  if(dt_.lars.length>=DARTS.DARTS){
    const a=dt_.you.reduce((p,q)=>p+q,0), b=dt_.lars.reduce((p,q)=>p+q,0);
    return lgFinish(a>b, a>b?`You win, ${a} to ${b}!`:a===b?`Tied at ${a}. Tie goes to Lars, apparently.`:`Lars wins, ${b} to ${a}.`);
  }
  $('lgBtn').textContent='Next dart'; $('lgBtn').onclick=()=>dartsAim();
}
function drawBoard(){
  const c=$('dartboard'), g=c.getContext('2d'), C=70; g.clearRect(0,0,140,140);
  const cols=['#1c1c22','#e8e2d6','#c8322b','#e8e2d6','#2f8a4a','#1c1c22'];
  [...DARTS.RINGS].reverse().forEach(([r],i)=>{g.fillStyle=cols[i%cols.length]; g.beginPath(); g.arc(C,C,r,0,Math.PI*2); g.fill()});
  g.fillStyle='#c8322b'; g.beginPath(); g.arc(C,C,5,0,Math.PI*2); g.fill();
  if(dt_.phase==='x'||dt_.phase==='y'){
    g.fillStyle='rgba(239,195,90,.9)';
    const x=dt_.phase==='x'?sweep(dt_.t,DARTS.SWEEP_X):dt_.x; g.fillRect(C+x-1,2,2,136);
    if(dt_.phase==='y'){const y=sweep(dt_.t,DARTS.SWEEP_Y); g.fillRect(2,C+y-1,136,2)}
  }
  for(const m of dt_.marks){g.fillStyle=m.who==='you'?'#7fd3ff':'#f4d35e'; g.fillRect(C+m.x-2,C+m.y-2,4,4); g.fillStyle='#000'; g.fillRect(C+m.x-1,C+m.y-1,2,2)}
}
function lgTick(dt){ if(lg.game==='darts'&&(dt_.phase==='x'||dt_.phase==='y')){dt_.t+=dt; drawBoard()} }
// Space / Enter = the big button (BANG!, Stop) while a game is going
addEventListener('keydown',e=>{
  if(!lg.open)return;
  if(['Space','Enter'].includes(e.code)){
    if(document.activeElement&&document.activeElement.tagName==='BUTTON'&&document.activeElement!==$('lgBtn'))return;
    e.preventDefault(); e.stopImmediatePropagation(); if(e.repeat)return;
    if(lg.game==='quickdraw'&&(qd.state==='wait'||qd.state==='draw'))return qdPress();
    if(lg.game==='darts'&&(dt_.phase==='x'||dt_.phase==='y'))return dartTap();
    if(!$('lgBtn').hidden&&$('lgBtn').onclick)$('lgBtn').onclick();
    return;
  }
  if(e.code!=='Tab'){e.preventDefault(); e.stopImmediatePropagation()}
},true);
