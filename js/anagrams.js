// Anagrams vs. Lars: make words from six letters before the clock runs out. Beat his score to win.
// Each letter set lists every word the game accepts. Add words to a list if you find one missing.
// 14 letter sets; each game picks one at random (never the same one twice in a row).
// To add a set: six letters plus every word you'll accept, grouped by length.
const ANAGRAM_SETS=[
  {letters:'SALTER', words:{
    6:['ALERTS','ALTERS'],
    5:['ALERT','ALTER','ASTER','EARLS','LASER','LATER','LEAST','RATES','REALS','SLATE','STALE','STARE','STEAL','TALES','TEARS'],
    4:['ALES','ARES','ARTS','EARL','EARS','EAST','EATS','ERAS','LAST','LATE','LEST','LETS','RATE','RATS','REAL','REST','SALE','SALT','SEAL','SEAR','SEAT','STAR','TALE','TEAL','TEAR','TEAS','TSAR'],
    3:['ALE','ALT','ARE','ART','ATE','EAR','EAT','ERA','ETA','LEA','LET','RAT','SAT','SEA','SET','TAR','TEA'],
  }},
  {letters:'PLANET', words:{
    6:['PLANET'],
    5:['LEAPT','PANEL','PENAL','PETAL','PLANE','PLANT','PLATE'],
    4:['ANTE','ELAN','LANE','LATE','LEAN','LEAP','LENT','NAPE','NEAT','PALE','PANE','PANT','PATE','PEAT','PELT','PENT','PLAN','PLAT','PLEA','TALE','TAPE','TEAL'],
    3:['ALE','ALT','ANT','APE','APT','ATE','EAT','ETA','LAP','LEA','LET','NAP','NET','PAL','PAN','PAT','PEA','PEN','PET','TAN','TAP','TEA','TEN'],
  }},
  {letters:'CANDLE', words:{
    6:['CANDLE'],
    5:['CLEAN','DANCE','DECAL','LACED','LADEN','LANCE'],
    4:['ACED','ACNE','CANE','CLAD','CLAN','DALE','DEAL','DEAN','ELAN','LACE','LAND','LANE','LEAD','LEAN','LEND'],
    3:['ACE','ALE','AND','CAD','CAN','DEN','END','LAD','LEA','LED'],
  }},
  {letters:'GARDEN', words:{
    6:['DANGER','GANDER','GARDEN','RANGED'],
    5:['ANGER','GRADE','GRAND','RAGED','RANGE'],
    4:['AGED','DANG','DARE','DARN','DEAN','DEAR','DRAG','EARN','GEAR','GRAD','NEAR','RAGE','RAND','RANG','READ'],
    3:['AGE','AND','ARE','DEN','EAR','END','ERA','GAD','GAR','NAG','RAG','RAN','RED'],
  }},
  {letters:'MASTER', words:{
    6:['MASTER','STREAM'],
    5:['ASTER','MARES','MATER','MATES','MEATS','RATES','SMART','SMEAR','STARE','STEAM','TAMER','TEAMS','TEARS','TERMS','TRAMS'],
    4:['ARES','ARMS','ARTS','EARS','EAST','EATS','ERAS','MARE','MARS','MAST','MATE','MATS','MEAT','META','RAMS','RATE','RATS','REST','SAME','SEAM','SEAR','SEAT','STAR','STEM','TAME','TEAM','TEAR','TERM','TRAM','TSAR'],
    3:['ARE','ARM','ART','ATE','EAR','EAT','EMS','ERA','ETA','MAR','MAT','MET','RAM','RAT','SAM','SAT','SEA','SET','TAM','TAR','TEA'],
  }},
  {letters:'TINSEL', words:{
    6:['ENLIST','INLETS','LISTEN','SILENT','TINSEL'],
    5:['INLET','INSET','ISLET','LIENS','LINES','STEIN','TILES'],
    4:['ISLE','LENS','LENT','LEST','LETS','LIEN','LIES','LINE','LINT','LIST','NEST','NETS','SENT','SILT','SITE','SLIT','TENS','TIES','TILE','TINE','TINS'],
    3:['ITS','LEI','LET','LIE','LIT','NET','NIL','NIT','SET','SIN','SIT','TEN','TIE','TIN'],
  }},
  {letters:'STABLE', words:{
    6:['BLEATS','STABLE','TABLES'],
    5:['BALES','BATES','BEAST','BEATS','BELTS','BLAST','BLEAT','LEAST','SABLE','SLATE','STALE','STEAL','TABLE','TALES'],
    4:['ABLE','ALES','BALE','BASE','BATE','BATS','BEAT','BELT','BEST','BETA','BETS','EAST','EATS','LABS','LAST','LATE','LEST','LETS','SALE','SALT','SEAL','SEAT','SLAB','STAB','TABS','TALE','TEAL'],
    3:['ABS','ALB','ALE','ALT','ATE','BAS','BAT','BET','EAT','ETA','LAB','LEA','LET','SAT','SEA','SET','TAB','TEA'],
  }},
  {letters:'ANTLER', words:{
    6:['ANTLER','LEARNT','RENTAL'],
    5:['ALERT','ALTER','ARENT','LATER','LEARN','RENAL'],
    4:['ANTE','EARL','EARN','ELAN','LANE','LATE','LEAN','LENT','NEAR','NEAT','RANT','RATE','REAL','RENT','TALE','TARN','TEAL','TEAR','TERN'],
    3:['ALE','ALT','ANT','ARE','ART','ATE','EAR','EAT','ERA','ETA','LEA','LET','NET','RAN','RAT','TAN','TAR','TEA','TEN'],
  }},
  {letters:'STRIPE', words:{
    6:['PRIEST','SPRITE','STRIPE'],
    5:['PIERS','RITES','SPIRE','SPITE','STRIP','TIERS','TIRES','TRIES','TRIPE','TRIPS'],
    4:['PEST','PETS','PIER','PIES','PITS','REPS','REST','RIPE','RIPS','RISE','RITE','SIRE','SITE','SPIT','STEP','STIR','TIER','TIES','TIPS','TIRE','TRIP'],
    3:['IRE','ITS','PER','PET','PIE','PIT','REP','RIP','SET','SIP','SIR','SIT','TIE','TIP'],
  }},
  {letters:'THREAD', words:{
    6:['DEARTH','HATRED','THREAD'],
    5:['DEATH','EARTH','HATED','HATER','HEARD','HEART','RATED','TRADE','TREAD'],
    4:['DARE','DART','DATE','DEAR','HARD','HARE','HART','HATE','HEAD','HEAR','HEAT','HERD','RATE','READ','TEAR'],
    3:['ARE','ART','ATE','EAR','EAT','ERA','ETA','HAD','HAT','HER','RAH','RAT','RED','TAD','TAR','TEA','TED','THE'],
  }},
  {letters:'HEARTS', words:{
    6:['EARTHS','HATERS','HEARTS'],
    5:['ASTER','EARTH','HARES','HASTE','HATER','HATES','HEARS','HEART','HEATS','RATES','SHARE','SHEAR','STARE','TEARS','TRASH'],
    4:['ARES','ARTS','EARS','EAST','EATS','ERAS','HARE','HART','HATE','HATS','HEAR','HEAT','HERS','RASH','RATE','RATS','REST','SEAR','SEAT','STAR','TEAR','TSAR'],
    3:['AHS','ARE','ART','ASH','ATE','EAR','EAT','ERA','ETA','HAS','HAT','HER','RAH','RAT','SAT','SEA','SET','SHE','TAR','TEA','THE'],
  }},
  {letters:'SPREAD', words:{
    6:['DRAPES','PADRES','SPARED','SPREAD'],
    5:['DARES','DRAPE','PADRE','PARED','PARSE','PEARS','READS','SPADE','SPARE','SPEAR'],
    4:['APES','ARES','DARE','DEAR','EARS','ERAS','PADS','PARE','PARS','PEAR','PEAS','RAPS','READ','REAP','REDS','REPS','SEAR','SPAR','SPED'],
    3:['ADS','APE','ARE','ASP','EAR','ERA','PAD','PAR','PAS','PEA','PED','PER','RAP','RED','REP','SAD','SAP','SEA','SPA'],
  }},
  {letters:'SNOWED', words:{
    6:['SNOWED'],
    5:['DOWNS','NODES','NOSED','OWNED','WENDS'],
    4:['DENS','DOES','DONE','DONS','DOSE','DOWN','ENDS','EONS','NEWS','NODE','NODS','NOSE','ONES','OWED','OWES','OWNS','SEND','SEWN','SNOW','SOWN','WEND','WOES'],
    3:['DEN','DEW','DOE','DON','DOS','END','EON','NEW','NOD','NOS','NOW','ONE','ONS','OWE','OWN','SEW','SOD','SON','SOW','WED','WEN','WOE','WON'],
  }},
  {letters:'BREADS', words:{
    6:['BEARDS','BREADS'],
    5:['BARDS','BARED','BASED','BEADS','BEARD','BEARS','BREAD','DARES','READS','SABER'],
    4:['ABED','ARES','BADE','BARD','BARE','BARS','BASE','BEAD','BEAR','BEDS','BRAD','BRAS','BRED','DABS','DARE','DEAR','DEBS','DRAB','EARS','ERAS','READ','REDS','SEAR'],
    3:['ABS','ADS','ARE','BAD','BAR','BAS','BED','BRA','DAB','DEB','EAR','ERA','RED','SAD','SEA'],
  }},
];
const ANAGRAM={TIME:60, POINTS:{3:100,4:400,5:1200,6:2000},
  LARS:{FIRST:5000, GAP:[4300,7000], WEIGHTS:{3:3,4:3,5:1.2,6:.2}}};   // Lars finds a word every 4.3-7s: usually scores ~3,600 (2,500-5,000)

const ana={open:false, set:null, picked:[], found:[], larsFound:[], you:0, lars:0, t:0, larsT:0, running:false, };
const anaWords=set=>Object.values(set.words).flat();
function openAnagrams(){
  const choices=ANAGRAM_SETS.filter(s=>s!==ana.set), set=choices[Math.floor(Math.random()*choices.length)];
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
  $('anaNext').onclick=()=>{ $('anagram').hidden=true; ana.open=false; larsGameOver(won) };
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
