// The kitchen: a room you walk into from the front door. Baking happens at the counter.
const KIT_TRIGGERS=[
  {z:R(52,54,24,8),   label:'Start baking',         act:()=>startBaking()},
  {z:R(124,54,28,8),  label:'Check the oven',       act:()=>say1(KITCHEN.oven)},
  {z:R(158,54,26,8),  label:'Read the recipe card', act:()=>readRecipe()},
  {z:R(184,112,34,12),label:'Look at the tree',     act:()=>say1(KITCHEN.tree)},
];
const say1=t=>showDialog({place:KITCHEN.place,speaker:KITCHEN.speaker,pages:[t],actions:[CLOSE]});
function readRecipe(){
  const lines=ITEMS.map(i=>(have[i.key]?'✓ ':'◻ ')+i.label).join('\n');
  showDialog({place:KITCHEN.place,speaker:KITCHEN.recipeTitle,pages:[lines,KITCHEN.recipeFooter],actions:[CLOSE]});
}
const allIn=()=>ITEMS.every(i=>have[i.key]);
function startBaking(){
  const missing=ITEMS.filter(i=>!have[i.key]).map(i=>i.label);
  if(missing.length) return say1(KITCHEN.missing+' '+missing.join(', ')+'.');
  if(have.baked) return finalNote();
  showDialog({place:KITCHEN.place,speaker:KITCHEN.speaker,pages:KITCHEN.ready,actions:[{label:"Let's bake",fn:()=>{closeDialog(); if(have.crossword)openBake(); else openCrossword(openBake)}}]});   // the smudged recipe card (crossword.js) comes first
}
function finalNote(){ openEnding() }   // credits, Joe's stats, the photo album, then Alex's note (ending.js)
function playAgain(){ have={};save();renderBasket();farmReset();fargo.won=false;Object.assign(kit,{party:false,dance:false,alex:null,hugged:false,hugSound:false});stopMusic();closeDialog();goTo('world','start') }

// ---------- everyone came over ----------
// where they stand in the kitchen (feet position). Drawn with each place's own sprite.
const CROWD=[
  {name:'Keelan',x:30,y:86, draw:(x,y,d)=>drawKeelan({x,y,dir:d||'down',moving:false,step:0})},
  {name:'Alex',x:84,y:68,  draw:(x,y)=>drawAlex(x,y,kit.party?'happy':'ok')},   // she walks over to hug Joe at the end (kit.alex)
  {name:'Lars',x:58,y:128, draw:(x,y,d)=>drawLars({x,y,dir:d||'right',moving:false,step:0})},
  {name:'Jack',x:150,y:86, draw:(x,y)=>drawJack(x,y)},
  {name:'Margie',x:168,y:92, draw:(x,y)=>drawMargie(x,y)},
  {name:'John',x:166,y:130, draw:(x,y,d)=>drawJohn({x,y,dir:d||'left',moving:false,step:0})},
  {name:'Lil Q',x:184,y:146, draw:(x,y)=>drawBob(x,y)},
  {name:'Trail John',x:140,y:150, draw:(x,y,d)=>drawTrailJohn(x,y,d||'down')},
  {name:'Bryan',x:72,y:150, draw:(x,y)=>drawBryan(x,y,'down')},
  {name:'Viking',x:204,y:136, draw:(x,y)=>drawVikingStanding(x,y,'norse')},
  {name:'Football Viking',x:212,y:152, draw:(x,y)=>drawVikingStanding(x,y,'football','21')},
  {name:'Logan',x:40,y:110, draw:(x,y)=>drawLogan(x,y,true)},
  {name:'Ethan',x:132,y:150, draw:(x,y,d)=>drawEthan(x,y,d||'down')},
  {name:'Maureen',x:150,y:148, draw:(x,y,d)=>drawMaureen(x,y,d||'down')},
  {name:'Jackie',x:120,y:72, draw:(x,y,d)=>drawJackie(x,y,d||'down'), needs:'metJackie'},
];
// two kinds of Vikings: the old Norse kind (iron helmet, fur, beard, shield) and the football kind (purple and gold, pads, facemask)
function drawVikingStanding(x,y,kind='norse',num='7'){
  const F=(c,dx,dy,w,h)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x)-6+dx,Math.round(y)-20+dy,w,h)};
  F('rgba(0,0,0,.25)',0,19,13,2);
  if(kind==='football'){
    F('#ffc62f',3,13,3,5); F('#ffc62f',7,13,3,5); F('#4f2683',3,13,1,5); F('#9a86c8',9,13,1,5); F('#4f2683',3,17,3,1); F('#4f2683',7,17,3,1); F('#ffffff',2,18,4,2); F('#ffffff',7,18,4,2);   // gold pants, purple socks, cleats
    F('#4f2683',0,6,13,8); F('#3d1d66',0,6,13,1); F('#ffc62f',0,7,3,2); F('#ffc62f',10,7,3,2); F('#ffffff',0,12,2,1); F('#ffffff',11,12,2,1);   // jersey, huge shoulder pads
    pixText(ctx,num,Math.round(x)-6+5,Math.round(y)-20+8,'#ffffff'); F('#6b4a2f',-1,10,1,4); F('#6b4a2f',13,10,1,4);
    F('#8a5a3a',4,4,5,3);                                                                     // neck
    F('#4f2683',2,-2,9,7); F('#6a3ea8',3,-2,4,1); F('#ffc62f',6,-2,1,7); F('#3d1d66',2,4,9,1);   // helmet with a gold stripe
    F('#8a5a3a',4,1,5,3); F('#2b2b2b',5,2,1,1); F('#2b2b2b',7,2,1,1); F('#1d1d22',4,3,1,1); F('#1d1d22',8,3,1,1);   // face, eye black
    F('#c9ced4',3,2,7,1); F('#c9ced4',3,4,7,1); F('#c9ced4',6,1,1,4);                        // facemask bars
    return }
  F('#6b4a2f',3,14,3,4); F('#6b4a2f',7,14,3,4); F('#8a6a4a',2,17,4,3); F('#8a6a4a',7,17,4,3); F('#a8875f',2,17,4,1); F('#a8875f',7,17,4,1);   // leather trousers, fur boots
  F('#8a8f9a',1,7,11,8); for(let k=0;k<11;k+=2)for(let j=7;j<15;j+=2)F('#6f7480',1+k+((j/2|0)%2),j,1,1); F('#4a3020',1,13,11,1); F('#c9a24a',6,13,1,1);   // chainmail, belt
  F('#7a5a3a',0,6,13,3); F('#9a7a54',1,6,11,1); F('#5a4028',0,8,13,1);                     // fur cloak over the shoulders
  F('#c8322b',-2,8,4,7); F('#efe2c4',-1,9,2,5); F('#c9a24a',-1,11,2,1);                    // round shield on his arm
  F('#f0c6a0',3,1,7,5); F('#2b2b2b',4,3,1,1); F('#2b2b2b',8,3,1,1);
  F('#c8642a',2,4,9,4); F('#c8642a',3,8,7,2); F('#a8501f',5,10,3,1); F('#e08a4a',4,5,2,1);   // huge red beard, braided
  F('#9aa3b0',2,-2,9,4); F('#c9ced4',3,-2,4,1); F('#6f7686',6,1,1,3); F('#f6f2e4',0,-4,2,4); F('#f6f2e4',11,-4,2,4); F('#e8e2d6',-1,-5,1,2); F('#e8e2d6',13,-5,1,2);   // iron helmet, nose guard, horns
}
const crowdFace=n=>n==='Trail John'?{speaker:'John',face:'Trail John'}:{speaker:n};
function crowdNear(){ if(!(allIn()||have.baked))return null; let best=null,bd=16; for(const c of CROWD){if(c.needs&&!have[c.needs])continue; const d=Math.hypot(P.x-c.x,P.y-c.y); if(d<bd){bd=d;best=c}} return best }
function drawCrown(x,y){ const F=(c,dx,dy,w,h)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x)-5+dx,Math.round(y)+dy,w,h)};
  if(typeof allSecrets==='function'&&allSecrets()){   // every secret found: the Cookie Legend crown, taller, with rainbow gems and a twinkle
    F('#e8b04a',-1,3,12,3); F('#fff3b0',-1,0,2,3); F('#fff3b0',4,-3,2,6); F('#fff3b0',9,0,2,3); F('#ffffff',0,3,10,1);
    ['#e54b4b','#f4a03a','#4fbf73','#3d8ad6','#a05fd6'].forEach((c,i)=>F(c,i*2,4,1,1)); if((time/250|0)%3===0){F('#ffffff',4,-6,1,3); F('#ffffff',3,-5,3,1)} return }
  F('#e8b04a',0,3,10,3); F('#f4d35e',0,0,2,3); F('#f4d35e',4,-1,2,4); F('#f4d35e',8,0,2,3); F('#fff3b0',1,3,8,1); F('#c8322b',4,4,2,1); F('#3d8ad6',1,4,1,1); F('#3d8ad6',8,4,1,1) }

// ---------- the baking card ----------
const BAKE={RATE:1.25, TARGET:10, WINDOW:.5, MAX:15};   // oven runs 1.25 minutes per real second; take them out at 10:00 +/- 0:30
const bake={open:false, i:0, state:'', amt:0, holding:false, eggs:0, stirs:0, t:0, lock:0};
const kit={party:false, crownT:0, confetti:[]};
const bakeSteps=()=>KITCHEN.steps.filter(s=>!s.needs||have[s.needs]);   // Bryan's sprinkles step only if you have them
const stepNow=()=>bakeSteps()[bake.i];
function bakeMsg(t,mood='ok'){ $('bakeMsg').textContent=t; const g=$('bakeFace').getContext('2d'); g.fillStyle='#e3d6bd'; g.fillRect(0,0,40,40); drawAlexFace(g,mood) }   // Alex says it, with her face
function openBake(){ Object.assign(bake,{open:true,i:0}); bakeSetup(); paused=true; prompt.hidden=true; $('bake').hidden=false; setTimeout(()=>$('bakeBtn').focus({preventScroll:true}),0) }
function bakeSetup(){
  const s=stepNow(), K=KITCHEN; Object.assign(bake,{state:s.kind, amt:0, holding:false, eggs:0, stirs:0, lock:0});
  $('bakeTitle').textContent=K.bakeTitle; $('bakeStep').className='bstep'; $('bakeStep').textContent=`${bake.i+1}/${bakeSteps().length+1} · ${s.name}${s.label?' · '+s.label:''}`;
  bakeMsg(s.hint);
  $('bakeBtn').textContent=s.kind==='pour'?K.pourHold:s.kind==='count'?K.eggTap:s.shake?'Shake!':K.stirTap;
  $('bakeAlt').hidden=s.kind!=='count'; $('bakeAlt').textContent=K.eggDone;
}
function bakeGood(){ sfx('good'); const s=stepNow(); bake.state='good'; bakeMsg(s.good,'happy'); $('bakeBtn').textContent=KITCHEN.next; $('bakeAlt').hidden=true }
function ovenSetup(){ bake.state='oven'; bake.t=0; $('bakeStep').className='bstep timer'; $('bakeStep').textContent='00:00'; bakeMsg(KITCHEN.bakeHint); $('bakeBtn').textContent=KITCHEN.bakeStart; $('bakeAlt').hidden=true }
const ovenMin=()=>bake.t/1000*BAKE.RATE;
const ovenClock=m=>`${String(Math.floor(m)).padStart(2,'0')}:${String(Math.floor(m%1*60)).padStart(2,'0')}`;
function bakePress(){
  if(!bake.open||bake.lock>0)return; const s=stepNow(), K=KITCHEN;
  if(bake.state==='pour'){ bake.holding=true; $('bakeBtn').classList.add('on'); return }
  if(bake.state==='count'){ sfx('crack'); bake.eggs++; if(bake.eggs>s.target){bakeMsg(K.eggMany,'frown'); bake.eggs=0; bake.lock=500} return }
  if(bake.state==='stir'){ sfx(s.shake?'shake':'stir'); bake.stirs++; if(bake.stirs>=s.taps)bakeGood(); return }
  if(bake.state==='good'){ bake.i++; if(bake.i<bakeSteps().length)bakeSetup(); else ovenSetup(); return }
  if(bake.state==='oven'){ sfx('click'); bake.state='baking'; bake.t=0; $('bakeBtn').textContent=K.bakeOut; bakeMsg('Okay, they\'re in. Watch the timer...'); return }
  if(bake.state==='baking'){ const m=ovenMin();
    if(Math.abs(m-BAKE.TARGET)<=BAKE.WINDOW){ sfx('ding'); bake.state='done'; bakeMsg(K.perfect,'happy'); $('bakeBtn').textContent='🍪 '+K.next }
    else { sfx('bad'); bake.state='oven'; bake.lock=600; bakeMsg(m<BAKE.TARGET?K.raw:K.burnt,'frown'); $('bakeBtn').textContent=K.bakeStart; bake.burntAt=m }
    return }
  if(bake.state==='done'){ closeBake(); startParty() }
}
function bakeRelease(){
  if(!bake.holding)return; bake.holding=false; $('bakeBtn').classList.remove('on');
  const s=stepNow(), K=KITCHEN, d=bake.amt-s.target;
  if(Math.abs(d)<=s.tol)return bakeGood();
  bakeMsg(d>0?K.tooMuch:K.tooLittle,'frown'); sfx('bad'); bake.lastAmt=bake.amt; bake.amt=0; bake.lock=600;
}
function eggsDone(){ const s=stepNow(); if(bake.state!=='count')return; if(bake.eggs===s.target)bakeGood(); else bakeMsg(KITCHEN.eggFew,'frown') }
function closeBake(){ bake.open=false; $('bake').hidden=true; paused=false }
function bakeTick(dt){
  if(!bake.open)return; if(bake.lock>0)bake.lock-=dt;
  const s=stepNow();
  if(bake.state==='pour'&&bake.holding){ if((bake.glugT=(bake.glugT||0)+dt)>140){bake.glugT=0; sfx('glug')} bake.amt+=s.rate*dt/1000; if(bake.amt>=s.max){ bake.holding=false; $('bakeBtn').classList.remove('on'); bake.amt=0; bake.lock=700; bakeMsg(KITCHEN.spilled,'frown') } }
  if(bake.state==='baking'){ bake.t+=dt; const m=ovenMin(); $('bakeStep').textContent=ovenClock(Math.min(m,99));
    if(m>=BAKE.MAX){ bake.state='oven'; bake.lock=600; bakeMsg(KITCHEN.burnt,'frown'); $('bakeBtn').textContent=KITCHEN.bakeStart } }
  drawBakeArt();
}
function drawBakeArt(){
  const c=$('bakeArt'), g=c.getContext('2d'), F=(col,x,y,w,h)=>{g.fillStyle=col;g.fillRect(x,y,w,h)}, s=stepNow();
  F('#efe2c4',0,0,96,64); F('#e2d2ae',0,46,96,18);
  const done=bakeSteps().slice(0,bake.i+(bake.state==='good'?1:0));
  const bowl=(x,y)=>{ F('#c9d6e0',x,y,40,14); F('#a9b8c4',x+2,y+14,36,3); F('#8a99a6',x+6,y+17,28,2);   // mixing bowl, with what's in it so far
    let lv=0; for(const d of done){ if(d.kind==='pour'){F(d.color,x+3,y+11-lv,34,2); lv+=2} if(d.kind==='count'){F('#f4c430',x+12,y+11-lv,4,2); F('#f4c430',x+22,y+11-lv,4,2)} }
    if(done.some(d=>d.key==='stir')){F('#e0bf86',x+3,y+4,34,8); for(let k=0;k<7;k++)F('#5a3220',x+5+k*5,y+5+(k%2)*3,2,2)}
    if(done.some(d=>d.key==='sprinkles'))for(let k=0;k<14;k++)F(['#e54b4b','#f4d35e','#4fbf73','#5fa8e8','#e54b7a'][k%5],x+5+(k*7)%30,y+4+(k*3)%7,2,1);
    F('#dfe8ee',x,y,40,1) };
  if(bake.state==='pour'||(bake.state==='good'&&s.kind==='pour')){
    const x=8,top=6,h=52, k=h/s.max; F('#ffffff',x,top,24,h); F('#c9d6e0',x-1,top,1,h); F('#c9d6e0',x+24,top,1,h); F('#c9d6e0',x-1,top+h,26,1); F('#c9d6e0',x+25,top+8,4,2); F('#c9d6e0',x+28,top+8,2,14);
    const a=Math.min(bake.amt||(bake.state==='good'?s.target:0),s.max); F(s.color,x,top+h-a*k,24,a*k); F('rgba(0,0,0,.08)',x,top+h-a*k,24,1);
    for(let v=.25;v<s.max;v+=.25){const yy=Math.round(top+h-v*k); F('#7d8694',x,yy,v%1===0?8:4,1)}
    for(let v=1;v<s.max;v++)pixText(g,String(v),x+10,Math.round(top+h-v*k)-2,'#7d8694');
    const ty=Math.round(top+h-s.target*k); F(Math.floor(time/250)%2?'#e8a020':'#f4c430',x-3,ty,30,1); F('#e8a020',x-5,ty-1,2,3);   // the gold line
    bowl(50,36);
  } else if(bake.state==='count'||(bake.state==='good'&&s.kind==='count')){
    bowl(50,36); for(let k=0;k<3;k++){const ex=10+k*12; if(k<bake.eggs){F('#ffffff',ex,40,9,3); F('#f4c430',ex+3,38,3,3)} else {F('#f6f0e2',ex+1,22,7,10); F('#e8dcc4',ex+1,30,7,2); F('#ffffff',ex+2,23,2,3)}}
    if(bake.state==='good')for(let k=0;k<2;k++){F('#ffffff',10+k*12,40,9,3); F('#f4c430',13+k*12,38,3,3)}
  } else if(bake.state==='stir'||(bake.state==='good'&&s.kind==='stir')){
    bowl(28,30);
    if(s.shake){ const sx=44+Math.sin(bake.stirs*1.7)*6; F('#f2efe6',sx,4,10,14); F('#c8322b',sx,2,10,3);   // the shaker, and sprinkles falling
      for(let k=0;k<bake.stirs*3;k++)F(['#e54b4b','#f4d35e','#4fbf73','#5fa8e8','#e54b7a'][k%5],32+(k*11)%32,20+(k*5)%12,2,1) }
    else { const ang=bake.stirs*.9+(bake.state==='good'?time/200:0), sx=48+Math.cos(ang)*10, sy=36+Math.sin(ang)*3;
      g.strokeStyle='#8a5a34'; g.lineWidth=2; g.beginPath(); g.moveTo(sx,sy); g.lineTo(sx+10,sy-22); g.stroke() }
    const p=Math.min(1,bake.stirs/s.taps); F('#c9d6e0',20,58,56,3); F('#4fbf73',20,58,56*p,3);
  } else { // the oven
    F('#9aa3b0',14,4,68,56); F('#7d8694',14,4,68,6); for(let x=20;x<78;x+=8)F('#2b2f36',x,6,3,2);
    F('#1d2026',22,16,52,30); const m=bake.state==='baking'?ovenMin():bake.state==='done'?BAKE.TARGET:(bake.burntAt||0);
    const glow=bake.state==='baking'?.35+.1*Math.sin(time/120):0; F(`rgba(255,140,40,${glow})`,22,16,52,30);
    const col=m<6?'#ead6a6':m<9.5?'#e3bd78':m<=10.5?'#c98a3a':m<12?'#8a5a2a':'#3a2a1e';
    F('#8a8f9a',26,38,44,2); for(let k=0;k<4;k++){F(col,28+k*10,32,8,6); F('#5a3220',30+k*10,34,1,1); F('#5a3220',33+k*10,33,1,1);
      if(have.sprinkles){F('#e54b7a',29+k*10,32,1,1); F('#5fa8e8',32+k*10,35,1,1); F('#f4d35e',34+k*10,32,1,1)}}
    F('#c3c9d2',22,14,52,1); F('#c3c9d2',30,50,36,2);
  }
}
$('bakeBtn').addEventListener('pointerdown',e=>{e.preventDefault(); bakePress()});
['pointerup','pointerleave','pointercancel'].forEach(t=>$('bakeBtn').addEventListener(t,bakeRelease));
$('bakeAlt').onclick=eggsDone;
addEventListener('keydown',e=>{ if(!bake.open)return;
  if(['Space','Enter'].includes(e.code)){ if(document.activeElement===$('bakeAlt'))return; e.preventDefault(); e.stopImmediatePropagation(); if(!e.repeat)bakePress() }
  else if(e.code!=='Tab'){ e.preventDefault(); e.stopImmediatePropagation() } },true);
addEventListener('keyup',e=>{ if(bake.open&&['Space','Enter'].includes(e.code))bakeRelease() },true);

// ---------- the party: Alex hugs Joe, everyone talks, the crown, then THE COOKIE DANCE ----------
const PARTY={WALK:1300, HUG:2600, BEAT:420};
// first, the taste test: Ethan (designated grill master) and Maureen (a very precise baker) try one. Everyone holds their breath.
const TASTE={WALK:1200, NERVOUS:2800, SPOT:{Ethan:{x:92,y:128}, Maureen:{x:132,y:128}}};
function startParty(){
  have.baked=true; save(); kit.party=false; kit.dance=false; sfx('ding'); P.x=112; P.y=134; P.dir='down';
  const A=CROWD.find(c=>c.name==='Alex'); kit.alex={x:A.x,y:A.y}; kit.hugT=0; kit.hugging=false; paused=true; prompt.hidden=true;
  kit.taste={phase:'walk', t:0}; kit.tasters={};
}
function tasteTick(dt){
  const k=kit.taste; if(!k)return; k.t+=dt; if(dlg.hidden)paused=true;   // nobody wanders off mid-taste-test
  for(const n of ['Ethan','Maureen']){const c=CROWD.find(c=>c.name===n), s=TASTE.SPOT[n], u=Math.min(1,k.t/TASTE.WALK); if(k.phase==='walk')kit.tasters[n]={x:c.x+(s.x-c.x)*u, y:c.y+(s.y-c.y)*u}}
  if(k.phase==='walk'&&k.t>=TASTE.WALK){ k.phase='talk'; say(KITCHEN.tasteBefore,()=>{ k.phase='nervous'; k.t=0 }) }
  if(k.phase==='nervous'){ if(Math.floor((k.t-dt)/180)!==Math.floor(k.t/180))sfx('beat');   // a little drumroll
    if(k.t>=TASTE.NERVOUS){ k.phase='verdict'; sfx('fanfare'); kit.party=true;
      for(let j=0;j<70;j++)kit.confetti.push({x:Math.random()*224,y:-Math.random()*120,v:.02+Math.random()*.04,c:['#e54b4b','#f4d35e','#4fbf73','#5fa8e8','#e54b7a','#ffffff'][j%6]});
      say(KITCHEN.tasteAfter,()=>{ kit.taste=null; kit.hugT=0; kit.hugging=true; paused=true }) } }
}
// while they chew: everyone else is sweating it
function drawTasteNerves(){
  const k=kit.taste; if(!k||k.phase!=='nervous')return;
  CROWD.forEach((c,i)=>{ if(c.name==='Ethan'||c.name==='Maureen'||(c.needs&&!have[c.needs]))return; const pos=(c.name==='Alex'&&kit.alex)?kit.alex:c, x=Math.round(pos.x)+5, y=Math.round(pos.y)-24+((Math.floor(time/200)+i)%2);
    ctx.fillStyle='#9fd2f0'; ctx.fillRect(x,y,2,3); ctx.fillRect(x+1,y-1,1,1) });                            // sweat drops
  {const x=Math.round(P.x)+6, y=Math.round(P.y)-26; ctx.fillStyle='#9fd2f0'; ctx.fillRect(x,y,2,3)}
}
// the little captions during the finale (the taste test, the hug): the same pop-up as the rest of the game, up top, clear of everything
let captionShown='';
function kitCaption(){
  const k=kit.taste, t=k&&k.phase==='nervous'?KITCHEN.tasteHush:(kit.hugging&&kit.hugT>PARTY.WALK)?KITCHEN.hug:'', el=$('caption');
  if(!t||scene!==SCENES.kitchen){ if(!el.hidden)el.hidden=true; captionShown=''; return }
  if(t!==captionShown){ $('captionWho').textContent=t===KITCHEN.hug?KITCHEN.place:KITCHEN.captionPlace; $('captionText').textContent=t; captionShown=t } el.hidden=false;
}
function partyTick(dt){
  if(!kit.hugging)return; kit.hugT+=dt; const A=CROWD.find(c=>c.name==='Alex'), u=Math.min(1,kit.hugT/PARTY.WALK), tx=104, ty=135;
  kit.alex={x:A.x+(tx-A.x)*u, y:A.y+(ty-A.y)*u};
  if(kit.hugT>PARTY.WALK&&!kit.hugSound){kit.hugSound=true; sfx('hug')}
  if(kit.hugT>PARTY.WALK+PARTY.HUG){ kit.hugging=false; kit.hugged=true; const lines=KITCHEN.party.map(([sp,t,face])=>[sp,t,face]); if(have.icecream)lines.splice(4,0,['Lars',KITCHEN.icecreamLine]);   // the ice cream Lars found on the roof
    say(lines,()=>{ kit.crownT=1600 }) }
}
// the dance: an 8-beat loop everyone does together. step left, step right, hop hop, cookies up, spin
function danceMove(i){
  if(!kit.dance)return {dx:0,dy:kit.party&&!kit.hugging?-Math.abs(Math.sin(time/170+i*.8))*4:0,cookie:false,dir:null};
  const t=(time-kit.danceAt)/PARTY.BEAT, beat=Math.floor(t)%8, f=t%1, hop=-Math.sin(f*Math.PI)*6;
  if(beat<2)return {dx:-3,dy:0,cookie:false,dir:'left'};
  if(beat<4)return {dx:3,dy:0,cookie:false,dir:'right'};
  if(beat<6)return {dx:0,dy:hop,cookie:false,dir:'down'};
  if(beat===6)return {dx:0,dy:-2,cookie:true,dir:'down'};
  return {dx:0,dy:-2,cookie:true,dir:['left','up','right','down'][Math.floor(f*4)]};   // spin!
}
function drawCookie(x,y){ const F=(c,dx,dy,w,h)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x)+dx,Math.round(y)+dy,w,h)};
  F('#c98a3a',-3,-2,6,4); F('#c98a3a',-2,-3,4,6); F('#5a3220',-1,-2,1,1); F('#5a3220',1,0,1,1); F('#5a3220',-2,1,1,1); F('#e0a85a',-2,-2,2,1);
  if(have.sprinkles){F('#e54b7a',0,-2,1,1); F('#5fa8e8',-1,0,1,1); F('#f4d35e',2,1,1,1)} }
let danceBanner=null;
function drawDanceBanner(){
  if(!danceBanner){ const t=KITCHEN.danceTitle, w=textW(t)+6; danceBanner=document.createElement('canvas'); danceBanner.width=w; danceBanner.height=9;
    const g=danceBanner.getContext('2d'); g.fillStyle='#d4473c'; g.fillRect(0,0,w,9); g.fillStyle='#f4d35e'; g.fillRect(0,0,w,1); g.fillRect(0,8,w,1); pixText(g,t,3,2,'#ffffff') }
  const s=2, w=danceBanner.width*s, x=Math.round((224-w)/2), y=4+Math.round(Math.sin(time/200)*2);
  ctx.imageSmoothingEnabled=false; ctx.drawImage(danceBanner,x,y,w,danceBanner.height*s);
  for(let k=0;k<2;k++)drawCookie(x-8+k*(w+16),y+9+Math.sin(time/150+k)*3);
}
function drawHug(){
  if(!(kit.hugging&&kit.hugT>PARTY.WALK))return; const t=kit.hugT-PARTY.WALK, x=108, y=104-Math.min(10,t/60), s=1+Math.sin(t/120)*.15;
  const F=(c,dx,dy,w,h)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x+dx*s),Math.round(y+dy*s),Math.ceil(w*s),Math.ceil(h*s))};   // a big pink heart over the hug
  F('#e54b7a',-6,-4,5,4); F('#e54b7a',1,-4,5,4); F('#e54b7a',-7,-2,14,4); F('#e54b7a',-5,2,10,2); F('#e54b7a',-3,4,6,2); F('#e54b7a',-1,6,2,1); F('#ffb3c9',-5,-3,2,2);
  for(let k=0;k<5;k++){const ph=((t/900)+k*.2)%1; ctx.fillStyle=`rgba(229,75,122,${1-ph})`; const hx=x-20+k*10, hy=y+20-ph*30; ctx.fillRect(hx,hy,2,2); ctx.fillRect(hx+3,hy,2,2); ctx.fillRect(hx,hy+1,5,2); ctx.fillRect(hx+1,hy+3,3,1)}

}

const kitBg=document.createElement('canvas'); kitBg.width=224; kitBg.height=168;
(function(){
  const g=kitBg.getContext('2d'), F=(c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};
  // wallpaper
  F('#ecd2ac',0,0,224,46); for(let x=4;x<224;x+=10)F('#e2c296',x,0,3,46);
  for(let x=9;x<224;x+=20)for(let y=6;y<44;y+=12)F('#d79b8e',x,y,1,1);
  F('#8a5a34',0,44,224,3); F('#a7754a',0,44,224,1);                                  // chair rail
  F('#f6efe2',0,0,224,2); F('#d9bb92',0,2,224,1);                                     // crown molding
  F('#e0c49c',0,41,224,3);                                                            // wall shadow above the counter line
  // tiled backsplash behind the counter
  F('#eef0ea',6,28,114,6); for(let x=6;x<120;x+=5)F('#d6dbd2',x,28,1,6); F('#d6dbd2',6,31,114,1);
  // upper cabinets
  F('#9a6a42',72,6,46,18); F('#b07a4c',72,6,46,1); F('#7c5232',72,23,46,1);
  for(const x of [74,97]){F('#8a5c38',x,8,20,13); F('#a26c40',x,8,20,1); F('#d9b27c',x+(x===74?17:2),15,1,3)}
  // wall clock
  F('#5a3a22',134,6,13,13); F('#fffdf6',135,7,11,11); F('#2b2f36',140,9,1,4); F('#2b2f36',140,12,3,1); F('#c64b3d',140,12,1,1);
  for(const [dx,dy] of [[5,1],[9,5],[5,9],[1,5]])F('#8a8f9a',135+dx,7+dy,1,1);
  // a hanging string of lights along the top
  for(let x=4;x<224;x+=8)F(['#e54b4b','#f4d35e','#3d8ad6','#4d9a50'][(x/8|0)%4],x,4+((x/8|0)%2),2,2);
  // window with snow outside
  F('#f6efe2',24,6,36,28); F('#1e2a4a',27,9,30,22); F('#2b3a63',27,24,30,7);
  for(let i=0;i<14;i++)F('#e9eef7',27+rnd()*30|0,9+rnd()*22|0,1,1);
  F('#f6efe2',41,9,2,22); F('#f6efe2',27,19,30,2); F('#c64b3d',22,4,40,3);
  F('#e9eef7',27,29,30,2);                                                          // snow piled on the outside sill
  F('#d8b47e',22,33,40,2); F('#b38a62',22,35,40,1);                                   // sill
  F('#c64b3d',20,6,5,24); F('#a8362f',22,6,1,24); F('#c64b3d',59,6,5,24); F('#a8362f',61,6,1,24);   // curtains
  F('#f4d35e',21,18,4,2); F('#f4d35e',59,18,4,2);                                     // tie-backs
  // wreath
  for(let a=0;a<16;a++){const t=a/16*Math.PI*2; F(a%3?'#2f6b36':'#3d8443',204+Math.cos(t)*7-1|0,18+Math.sin(t)*7-1|0,3,3)}
  F('#c8322b',201,24,6,3); F('#e54b4b',203,14,2,2); F('#e54b4b',210,19,2,2);
  // counter with cabinets
  F('#c9a27a',6,34,114,7); F('#dcb98e',6,34,114,1); F('#b38a62',6,40,114,2);
  F('#9a6a42',6,42,114,16); for(let x=8;x<118;x+=22){F('#8a5c38',x,44,20,12); F('#a26c40',x,44,20,1); F('#7a4e2c',x,55,20,1); F('#d9b27c',x+9,49,2,2); F('#f3d9a4',x+9,49,1,1)}
  F('#6a4224',6,57,114,1);                                                            // toe kick shadow
  F('#9aa3b0',100,30,10,5); F('#7d8694',100,30,10,1); F('#c3c9d2',102,28,6,2);        // a little pot
  F('#e8e2d6',112,29,3,5); F('#6b4a2f',111,27,5,2);                                   // wooden spoons in a crock
  F('#c49a6a',74,31,8,3); F('#e8a65a',75,30,2,1); F('#e8a65a',78,30,3,1);             // a cookie sheet
  F('#f3eadb',56,28,16,8); F('#e0d4bf',57,34,14,2); F('#d8b46a',59,27,10,2);          // mixing bowl of dough
  F('#e8e2d6',86,29,14,6); F('#c94a3a',89,30,8,3);                                    // flour bag
  F('#c49a6a',22,32,20,2); F('#8a5a34',20,32,2,2); F('#8a5a34',42,32,2,2);           // rolling pin
  // oven
  F('#9aa3b0',122,26,30,32); F('#7d8694',122,26,30,4); for(let x=126;x<150;x+=6)F('#2b2f36',x,27,2,2);
  F('#1d2026',126,36,22,16); F('#c3c9d2',126,34,22,1);
  F('#b3bcc8',122,26,1,32); F('#6f7886',151,26,1,32); F('#6f7886',122,57,30,1);     // edge shading
  F('#c3c9d2',125,33,24,1); F('#2b2f36',131,40,12,1); F('#3a3226',128,46,18,4); F('#4a3f30',128,46,18,1);  // handle, rack, a glow pan
  F('#e86a2a',129,52,16,1);                                                           // the element glowing
  F('#5a5f6a',145,27,4,2); F('#4d9a50',146,27,1,1);                                   // clock display
  // fridge
  F('#e8edf1',158,8,26,50); F('#d2d9df',158,30,26,1); F('#aab3bb',179,14,2,10); F('#aab3bb',179,34,2,14);
  F('#fffdf6',163,36,12,10); for(let y=38;y<45;y+=2)F('#d0605a',164,y,9,1); F('#3d8ad6',168,35,2,2);  // recipe card
  F('#f4d35e',162,14,3,3); F('#e54b7a',170,18,3,3);
  F('#f6f9fb',158,8,1,50); F('#c4ccd3',183,8,1,50); F('#b9c2ca',158,57,26,1);       // fridge shading
  F('#fffdf6',165,20,9,7); F('#9fd2f0',166,21,7,3); F('#4d9a50',166,24,7,2); F('#c64b3d',169,19,2,1);  // a photo, pinned
  F('#3d8ad6',176,48,3,3); F('#4d9a50',161,49,3,3);                                  // more magnets
  F('#8a5a34',186,40,14,1); for(const [x,c] of [[187,'#c64b3d'],[191,'#3d8ad6'],[195,'#f4d35e']])F(c,x,35,3,5);  // a little spice shelf
  // floor
  F('#b98352',0,58,224,110);
  for(let y=58;y<168;y+=9){for(let x=((y/9|0)%2)*22-44;x<224;x+=44){const t=rnd(); F(t<.3?'#b07a4a':t<.6?'#c08a58':'#b98352',x+1,y+1,43,8)}
    F('#a5703f',0,y,224,1); for(let x=((y/9|0)%2)*22;x<224;x+=44)F('#a5703f',x,y,1,9)}
  for(let i=0;i<160;i++)F(rnd()<.5?'#a9743f':'#c69462',rnd()*224|0,59+rnd()*108|0,3+rnd()*5|0,1);   // wood grain
  F('#8f5f36',0,58,224,2); F('#a06a3e',0,60,224,1);                                   // shadow along the wall
  // rug
  F('#a8362f',66,90,92,52); F('#efe2c4',69,93,86,46); F('#a8362f',72,96,80,40);
  for(let x=76;x<150;x+=8)F('#d8b46a',x,114,4,4);
  for(let x=76;x<150;x+=8){F('#efe2c4',x+1,104,2,2); F('#efe2c4',x+1,126,2,2)}
  F('#8f2c26',72,96,80,1); F('#8f2c26',72,135,80,1);
  for(let x=67;x<157;x+=3){F('#efe2c4',x,88,1,2); F('#efe2c4',x,142,1,2)}           // fringe
  // door + mat
  F('#5a3a22',98,162,28,6); F('#2b1a10',100,164,24,4); F('#7a8a54',100,150,24,10); F('#6a7a46',102,152,20,6); for(let x=103;x<121;x+=4)F('#8a9a62',x,153,2,4);
  // plant by the window
  F('#b36a3e',10,48,10,8); F('#c97d4e',10,48,10,1); F('#8f5230',10,55,10,1); F('#3d8443',8,40,6,8); F('#4d9a50',14,38,6,10);
  F('#5fb060',15,39,2,3); F('#2f6b36',9,44,2,3); F('#5fb060',6,43,3,2); F('#4d9a50',19,42,3,2);
})();

// table + chairs, and the Christmas tree, are depth-sorted so you can walk behind them
function drawTable(){
  const F=(c,x,y,w,h)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h)};
  F('#7a4e2c',80,104,8,12); F('#7a4e2c',136,104,8,12);                 // chairs
  F('#6a4224',80,100,8,4); F('#6a4224',136,100,8,4);
  F('#5a3a22',80,92,8,9); F('#7a4e2c',81,93,6,1); F('#5a3a22',136,92,8,9); F('#7a4e2c',137,93,6,1);   // chair backs
  F('#8a5a34',86,100,52,16); F('#a26c40',86,100,52,3); F('#7a4e2c',86,107,52,1); F('#6a4224',86,115,52,1);
  F('#efe2c4',96,102,32,1); F('#c64b3d',96,101,32,1);                                 // a table runner
  F('#6a4224',88,116,3,4); F('#6a4224',133,116,3,4);
  F('#fffdf6',104,103,14,8); F('#e8e2d6',104,110,14,1);
  if(!have.baked){F('#c98a5a',107,105,3,3); F('#c98a5a',112,106,3,3)}                // a plate of (empty) promise
  else for(const [cx,cy] of [[106,104],[111,104],[108,106],[113,107],[106,108],[110,101]]){F('#c98a3a',cx,cy,4,3); F('#e0a85a',cx,cy,2,1); F('#5a3220',cx+2,cy+1,1,1); if(have.sprinkles)F('#e54b7a',cx+1,cy+2,1,1)}   // a pile of the real thing
  if(have.icecream){F('#f7f2e6',122,100,6,7); F('#9a5a2a',122,103,6,2); F('#3f7a45',124,99,1,2)   // the Maple Rosemary pint
    if(have.baked)for(const bx of [90,128]){F('#e8edf1',bx,106,8,4); F('#c4ccd3',bx+1,109,6,1); F('#f3e3c0',bx+1,103,6,4); F('#fff3dc',bx+2,103,3,1); F('#c9853a',bx+3,105,3,1); F('#3f7a45',bx+5,102,1,2); F('#c98a3a',bx+6,104,3,2)}}   // bowls: a scoop, a maple swirl, a rosemary sprig, a cookie on the side
}
function drawXmasTree(){
  const F=(c,x,y,w,h)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h)};
  F('#6b4a2f',203,108,4,6);
  for(let i=0;i<5;i++){const w=6+i*5, x0=205-w/2|0, y0=78+i*7; F(i%2?'#2f6b36':'#3d8443',x0,y0,w,8); F('#4d9a50',x0+1,y0,w>>1,1); F('#25572c',x0,y0+7,w,1)}
  for(let i=0;i<4;i++)F('#e9e3d0',200+i*2-i%2,82+i*7,8-i,1);                          // a little tinsel garland
  F('#f4d35e',203,74,4,4); F('#f4d35e',204,73,2,6);
  const tw=(time/400|0);
  [[201,86,'#e54b4b'],[208,92,'#3d8ad6'],[198,98,'#f4d35e'],[211,102,'#e54b7a'],[204,104,'#ffffff'],[206,84,'#f4d35e']]
    .forEach(([x,y,c],i)=>F((tw+i)%4?c:'#fff6c8',x,y,2,2));
  F('#c8322b',190,110,10,8); F('#f4d35e',194,110,2,8); F('#3d6fb0',212,111,9,7); F('#efe2c4',216,111,1,7);
}

SCENES.kitchen={ place:KITCHEN.place, music:()=>kit.dance?'jingle':'kitchen',
  w:224, h:168, bounds:R(6,52,212,116), bg:kitBg, triggers:KIT_TRIGGERS,
  dynTrigger(){ const c=crowdNear(); if(!c)return null; const f=crowdFace(c.name); return {label:'Talk to '+f.speaker, btn:'Talk', act:()=>showDialog({place:KITCHEN.place,speaker:f.speaker,face:f.face,pages:[KITCHEN.crowd[c.name]],actions:[CLOSE]})} },
  ambient(dt){ bakeTick(dt); tasteTick(dt); partyTick(dt);
    for(const p of kit.confetti){p.y+=p.v*dt; p.x+=Math.sin((time+p.y*30)/400)*.2; if(p.y>170){ if(kit.party&&kit.confetti.length<140){p.y=-4;p.x=Math.random()*224} else p.dead=true }}
    kit.confetti=kit.confetti.filter(p=>!p.dead);
    if(kit.crownT>0){ kit.crownT-=dt; if(kit.crownT<=0){ have.crown=true; save(); sfx('crown'); kit.dance=true; kit.danceAt=time; playMusic(); setTimeout(finalNote,PARTY.BEAT*16) } } },
  drawPlayer(x,y){ const m=danceMove(-1); if(kit.dance&&m.dir)P.dir=m.dir; const X=x+m.dx, Y=y+m.dy; drawPlayer(X,Y);
    if(kit.crownT>0){const t=Math.min(1,(1-kit.crownT/1600)*1.4); drawCrown(X,Y-23-(1-t)*60)} else if(have.crown)drawCrown(X,Y-23);
    if(m.cookie)drawCookie(X+7,Y-20) },
  solids:[R(78,104,68,14), R(194,104,24,10), R(6,52,16,6)],
  entries:{start:{x:112,y:152,dir:'up'}, fromDoor:{x:112,y:154,dir:'up'}},
  leave(){ stopMusic(); $('caption').hidden=true },
  enter(){ kit.party=!!have.baked; kit.dance=!!have.crown; kit.danceAt=time; if(kit.dance)playMusic(); if(have.baked){const A=CROWD.find(c=>c.name==='Alex'); kit.alex={x:104,y:135}} },
  ents(list){list.push({y:118,draw:drawTable},{y:114,draw:drawXmasTree});
    if(allIn()||have.baked)CROWD.forEach((c,i)=>{ if(c.needs&&!have[c.needs])return; const pos=(c.name==='Alex'&&kit.alex)?kit.alex:(kit.tasters&&kit.tasters[c.name])||c;
      if(kit.taste&&kit.tasters&&kit.tasters[c.name]&&kit.taste.phase!=='walk'){const chew=kit.taste.phase==='nervous'&&Math.floor(time/160)%2; list.push({y:pos.y,draw:()=>{c.draw(pos.x,pos.y,'down'); if(c.name==='Ethan')drawEthan(pos.x,pos.y,'down',chew); else drawMaureen(pos.x,pos.y,'down',chew); drawCookie(pos.x+6,pos.y-12)}}); return}
      list.push({y:pos.y,draw:()=>{const m=danceMove(i); c.draw(pos.x+m.dx,pos.y+m.dy,m.dir); if(m.cookie)drawCookie(pos.x+m.dx+7,pos.y+m.dy-21)}}) })},
  under(){ // oven glow
    const f=.55+.15*Math.sin(time/300)+.08*Math.sin(time/77);
    ctx.fillStyle=`rgba(255,140,40,${f})`; ctx.fillRect(127,38,20,12);
    ctx.fillStyle=`rgba(255,200,90,${f*.6})`; ctx.fillRect(129,41,16,6);
  },
  over(){ctx.fillStyle='rgba(255,190,110,.06)'; ctx.fillRect(0,0,224,168);   // warm light
    for(const p of kit.confetti){ctx.fillStyle=p.c; ctx.fillRect(p.x|0,p.y|0,2,2)}
    drawHug(); drawTasteNerves(); kitCaption(); if(kit.dance)drawDanceBanner() },
};
