// Anagrams vs. Lars: make words from six letters before the clock runs out. Beat his score to win.
// Each letter set lists every word the game accepts. Add words to a list if you find one missing.
const ANAGRAM_SETS=[
  {letters:'SALTER', words:{
    6:['ALERTS','ALTERS','STALER'],
    5:['ALERT','ALTER','LATER','RATES','STARE','TEARS','TARES','ASTER','TALES','STEAL','SLATE','LEAST','TEALS','STALE','LASER','EARLS','REALS'],
    4:['RATE','TEAR','TARE','SEAT','EATS','EAST','SATE','TEAS','SALT','LAST','SLAT','TALE','TEAL','LATE','REAL','EARL','SEAL','SALE','ALES','STAR','RATS','ARTS','TARS','TSAR','REST','LEST','LETS','ERAS','EARS','SEAR','ALTS','ARES'],
    3:['ART','RAT','TAR','EAT','TEA','ATE','SEA','SAT','LET','SET','ERA','EAR','ARE','ALE','ALT','ETA']}},
  {letters:'PLANET', words:{
    6:['PLANET','PLATEN'],
    5:['PLANE','PLANT','PANEL','PENAL','PLATE','PLEAT','LEAPT','PETAL'],
    4:['PLAN','PANE','NAPE','NEAP','LANE','LEAN','LATE','TALE','TEAL','LEAP','PALE','PEAL','PLEA','PELT','PANT','ANTE','NEAT','PENT','TAPE','PATE','PEAT','LENT','PLAT'],
    3:['PAN','NAP','PAL','LAP','ALP','PAT','TAP','APT','PEA','APE','PEN','NET','TEN','ANT','TAN','EAT','TEA','ATE','ALE','LET','PET','ETA']}},
  {letters:'CANDLE', words:{
    6:['CANDLE','LANCED'],
    5:['DANCE','LANCE','CLEAN','LACED','CANED','DECAL','LADEN','ELAND'],
    4:['LACE','CANE','ACNE','DEAN','LANE','LEAN','LEND','LAND','CLAD','DALE','DEAL','LEAD','CLAN','ACED'],
    3:['CAN','AND','END','DEN','LED','LAD','ACE','CAD','ALE']}},
];
const ANAGRAM={TIME:60, POINTS:{3:100,4:400,5:1200,6:2000},
  LARS:{FIRST:5000, GAP:[4500,7500], WEIGHTS:{3:4,4:3,5:1,6:.2}}};   // Lars finds a word every 4.5-7.5s, mostly short ones (~3,300 points a game)

const ana={open:false, set:null, picked:[], found:[], larsFound:[], you:0, lars:0, t:0, larsT:0, running:false, round:0};
const anaWords=set=>Object.values(set.words).flat();
function openAnagrams(){
  ana.round=(ana.round||0); const set=ANAGRAM_SETS[ana.round%ANAGRAM_SETS.length];
  ana.set=set; ana.open=true; ana.running=false; ana.picked=[]; ana.found=[]; ana.larsFound=[]; ana.you=0; ana.lars=0; ana.t=ANAGRAM.TIME*1000;
  ana.letters=[...set.letters].sort(()=>Math.random()-.5);
  $('anaTitle').textContent=HEIST.anagramTitle; $('anaMsg').textContent=HEIST.anagramRules;
  $('anaStart').hidden=false; $('anaStart').textContent=HEIST.anagramStart; $('anaPlay').hidden=true; $('anaEnd').hidden=true;
  renderAna(); paused=true; prompt.hidden=true; $('anagram').hidden=false; setTimeout(()=>$('anaStart').focus({preventScroll:true}),0);
}
function anaGo(){
  ana.running=true; ana.larsT=ANAGRAM.LARS.FIRST; $('anaStart').hidden=true; $('anaPlay').hidden=false; $('anaMsg').textContent='';
  renderAna(); setTimeout(()=>$('anaTiles').querySelector('button').focus({preventScroll:true}),0);
}
function renderAna(){
  $('anaYou').textContent=ana.you; $('anaLars').textContent=ana.lars;
  $('anaTime').textContent=Math.max(0,Math.ceil(ana.t/1000));
  $('anaTime').classList.toggle('low',ana.t<10000);
  $('anaWord').textContent=ana.picked.map(i=>ana.letters[i]).join('')||' ';
  $('anaTiles').replaceChildren(...ana.letters.map((l,i)=>{const b=document.createElement('button'); b.className='tile'; b.textContent=l;
    b.disabled=ana.picked.includes(i); b.onclick=()=>{anaPick(i)}; return b}));
  $('anaFound').textContent=ana.found.join(' · ');
}
function anaPick(i){ if(!ana.running||ana.picked.includes(i))return; ana.picked.push(i); renderAna() }
function anaBack(){ if(!ana.running)return; ana.picked.pop(); renderAna() }
function anaClear(){ if(!ana.running)return; ana.picked=[]; renderAna() }
function anaSubmit(){
  if(!ana.running)return; const w=ana.picked.map(i=>ana.letters[i]).join(''); ana.picked=[];
  let msg;
  if(w.length<3)msg='At least 3 letters.';
  else if(ana.found.includes(w))msg=`Already got ${w}.`;
  else if(!anaWords(ana.set).includes(w))msg=`${w}? Not a word. (Lars is smirking.)`;
  else {const pts=ANAGRAM.POINTS[w.length]; ana.found.push(w); ana.you+=pts; msg=`${w} +${pts}`}
  $('anaMsg').textContent=msg; renderAna();
}
// Lars plays too: he "finds" words on a timer
function larsTurn(){
  const pool=Object.entries(ana.set.words).flatMap(([len,ws])=>ws.filter(w=>!ana.larsFound.includes(w)).map(w=>({w,len:+len})));
  if(!pool.length)return;
  const weighted=pool.map(o=>({...o,wt:ANAGRAM.LARS.WEIGHTS[o.len]})), tot=weighted.reduce((a,o)=>a+o.wt,0);
  let r=Math.random()*tot, pick=weighted[0]; for(const o of weighted){r-=o.wt; if(r<=0){pick=o;break}}
  ana.larsFound.push(pick.w); ana.lars+=ANAGRAM.POINTS[pick.len];
  $('anaLarsWord').textContent=`Lars: ${pick.w} +${ANAGRAM.POINTS[pick.len]}`;
}
function anaTick(dt){
  if(!ana.open||!ana.running)return;
  ana.t-=dt; ana.larsT-=dt;
  if(ana.larsT<=0){larsTurn(); const [a,b]=ANAGRAM.LARS.GAP; ana.larsT=a+Math.random()*(b-a)}
  if(ana.t<=0){ana.t=0; anaEnd()}
  const s=Math.ceil(ana.t/1000); if(s!==ana.lastSec){ana.lastSec=s; $('anaTime').textContent=s; $('anaTime').classList.toggle('low',ana.t<10000); $('anaYou').textContent=ana.you; $('anaLars').textContent=ana.lars}
}
function anaEnd(){
  ana.running=false; $('anaPlay').hidden=true; $('anaEnd').hidden=false;
  const won=ana.you>ana.lars, best=anaWords(ana.set).filter(w=>w.length===6);
  $('anaResult').textContent=won?`You win, ${ana.you} to ${ana.lars}!`:ana.you===ana.lars?`A tie at ${ana.you}. Tie goes to Lars, apparently.`:`Lars wins, ${ana.lars} to ${ana.you}.`;
  $('anaMissed').textContent=`The six-letter word${best.length>1?'s were':' was'}: ${best.join(', ')}.`;
  $('anaNext').textContent=won?HEIST.anagramDone:HEIST.anagramRematch;
  $('anaNext').onclick=()=>{ $('anagram').hidden=true; ana.open=false;
    if(won){ have.heistStage=5; save(); say(HEIST.larsLoses,()=>showReward('city')) }
    else { ana.round++; say(HEIST.larsWins,()=>openAnagrams()) } };
  setTimeout(()=>$('anaNext').focus({preventScroll:true}),0);
}
$('anaStart').onclick=anaGo; $('anaEnter').onclick=anaSubmit; $('anaBack').onclick=anaBack; $('anaClear').onclick=anaClear;
// typing works too: letters, Backspace, Enter
addEventListener('keydown',e=>{
  if(!ana.open)return;
  if(!ana.running){ if(e.code==='Tab')return; if(['Enter','Space'].includes(e.code)&&document.activeElement&&document.activeElement.tagName==='BUTTON')return; e.stopImmediatePropagation(); e.preventDefault(); return }
  e.stopImmediatePropagation(); if(e.code==='Tab')return; e.preventDefault();
  if(e.key==='Enter')return anaSubmit();
  if(e.key==='Backspace')return anaBack();
  if(e.key==='Escape')return anaClear();
  const k=e.key.toUpperCase(); if(/^[A-Z]$/.test(k)){const i=ana.letters.findIndex((l,j)=>l===k&&!ana.picked.includes(j)); if(i>=0)anaPick(i)}
},true);
