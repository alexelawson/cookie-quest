// The kitchen: a room you walk into from the front door. Baking happens at the counter.
const KIT_TRIGGERS=[
  {z:R(52,54,24,8),   label:'Start baking',         act:()=>startBaking()},
  {z:R(124,54,28,8),  label:'Check the oven',       act:()=>say1(KITCHEN.oven)},
  {z:R(158,54,26,8),  label:'Read the recipe card', act:()=>readRecipe()},
  {z:R(184,112,34,12),label:'Look at the tree',     act:()=>say1(KITCHEN.tree)},
];
const BAKE_MARK={x:64,y:44,dir:'down',text:'BAKE'};
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
  showDialog({place:KITCHEN.place,speaker:KITCHEN.speaker,pages:KITCHEN.ready,actions:[{label:"Let's bake",fn:()=>{closeDialog(); openBake()}}]});
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
  {name:'Brian',x:72,y:150, draw:(x,y)=>drawBrian(x,y,'down')},
  {name:'Viking',x:204,y:136, draw:(x,y)=>drawVikingStanding(x,y,'norse')},
  {name:'Football Viking',x:212,y:152, draw:(x,y)=>drawVikingStanding(x,y,'football','21')},
  {name:'Logan',x:40,y:110, draw:(x,y)=>drawLogan(x,y)},
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
    F('#7a4fc0',3,-1,2,2); F('#3d1d66',1,8,12,1); F('#6a3ea8',1,6,1,6); F('#3d1d66',12,7,1,5); F('#e0a820',3,15,1,2); F('#e0a820',7,15,1,2); F('#ffffff',5,2,1,1); F('#ffffff',7,2,1,1);   // shading: helmet shine, jersey folds, gold-pants shade, eye glints
    return }
  F('#6b4a2f',3,14,3,4); F('#6b4a2f',7,14,3,4); F('#8a6a4a',2,17,4,3); F('#8a6a4a',7,17,4,3); F('#a8875f',2,17,4,1); F('#a8875f',7,17,4,1);   // leather trousers, fur boots
  F('#8a8f9a',1,7,11,8); for(let k=0;k<11;k+=2)for(let j=7;j<15;j+=2)F('#6f7480',1+k+((j/2|0)%2),j,1,1); F('#4a3020',1,13,11,1); F('#c9a24a',6,13,1,1);   // chainmail, belt
  F('#7a5a3a',0,6,13,3); F('#9a7a54',1,6,11,1); F('#5a4028',0,8,13,1);                     // fur cloak over the shoulders
  F('#c8322b',-2,8,4,7); F('#efe2c4',-1,9,2,5); F('#c9a24a',-1,11,2,1);                    // round shield on his arm
  F('#f0c6a0',3,1,7,5); F('#2b2b2b',4,3,1,1); F('#2b2b2b',8,3,1,1);
  F('#c8642a',2,4,9,4); F('#c8642a',3,8,7,2); F('#a8501f',5,10,3,1); F('#e08a4a',4,5,2,1);   // huge red beard, braided
  F('#9aa3b0',2,-2,9,4); F('#c9ced4',3,-2,4,1); F('#6f7686',6,1,1,3); F('#f6f2e4',0,-4,2,4); F('#f6f2e4',11,-4,2,4); F('#e8e2d6',-1,-5,1,2); F('#e8e2d6',13,-5,1,2);   // iron helmet, nose guard, horns
  F('#d9cdb4',1,-2,1,2); F('#d9cdb4',12,-2,1,2); F('#6f7686',2,1,9,1); F('#c9ced4',3,0,1,1); F('#c9ced4',9,0,1,1);   // horn shading, helmet rim and rivets
  F('#ffffff',4,3,1,1); F('#ffffff',8,3,1,1); F('#2b2b2b',5,3,1,1); F('#2b2b2b',9,3,1,1); F('#d9a07a',3,1,1,2);   // eyes with whites, cheek shade
  F('#e89a5a',3,8,1,2); F('#e89a5a',9,8,1,2); F('#f4d35e',3,10,1,1); F('#f4d35e',9,10,1,1); F('#a8501f',6,5,1,4);   // braid highlights with gold beads, beard parting
  F('#5a4028',1,14,11,1); F('#e8dcbf',-1,9,1,1);   // chainmail hem shadow, shield shine
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
const bake={open:false, i:0, state:'', amt:0, holding:false, eggs:0, stirs:0, t:0, lock:0, bt:0, sx:0, sdir:1, tray:[], drop:null, chips:new Set(), cur:12, shape:'heart', lastShape:''};
// stirring: a beat every BEAT ms; a tap within WIN ms of it counts. Scooping: the scoop sweeps at SPEED px/s; drop within TOL px of an empty spot.
const STIR={BEAT:600, WIN:150}, SCOOP={SPEED:46, TOL:5, X0:8, X1:88, SPOTS:[14,28,42,56,70,84], Y:46};
// the chocolate chip patterns, on a 5x5 grid (one is picked at random for each tray)
const CHIP_SHAPES={
  heart:[".....",".X.X.","XXXXX",".XXX.","..X.."],
  joe:  ["..XXX","...X.","...X.","X..X.",".XX.."],
  star: ["..X..","XXXXX",".XXX.",".X.X.","X...X"],
  smile:[".X.X.",".X.X.",".....","X...X",".XXX."],
};
const shapeCells=k=>{const out=new Set(); CHIP_SHAPES[k].forEach((row,r)=>[...row].forEach((ch,c)=>{if(ch==='X')out.add(r*5+c)})); return out};
const CHIP_GRID={cx:62, cy:32, gap:9};   // the big cookie, and how far apart the chip spots are (canvas px)
const chipXY=i=>({x:CHIP_GRID.cx+(i%5-2)*CHIP_GRID.gap, y:CHIP_GRID.cy+((i/5|0)-2)*CHIP_GRID.gap});
const kit={party:false, crownT:0, confetti:[]};
const bakeSteps=()=>KITCHEN.steps.filter(s=>!s.needs||have[s.needs]);   // Brian's sprinkles step only if you have them
const stepNow=()=>bakeSteps()[bake.i];
function bakeMsg(t,mood='ok'){ $('bakeMsg').textContent=t; const g=$('bakeFace').getContext('2d'); g.fillStyle='#e3d6bd'; g.fillRect(0,0,40,40); drawAlexFace(g,mood) }   // Alex says it, with her face
function openBake(){ const ks=Object.keys(CHIP_SHAPES).filter(k=>k!==bake.lastShape); bake.shape=ks[Math.random()*ks.length|0]; bake.lastShape=bake.shape; Object.assign(bake,{open:true,i:0}); bakeSetup(); paused=true; prompt.hidden=true; $('bake').hidden=false; setTimeout(()=>$('bakeBtn').focus({preventScroll:true}),0) }
function bakeSetup(){
  const s=stepNow(), K=KITCHEN; Object.assign(bake,{state:s.kind, amt:0, holding:false, eggs:0, stirs:0, lock:0, bt:STIR.BEAT/2, sx:SCOOP.X0, sdir:1, tray:SCOOP.SPOTS.map(()=>false), drop:null, chips:new Set(), cur:12});
  $('bakeTitle').textContent=K.bakeTitle; $('bakeStep').className='bstep'; $('bakeStep').textContent=`${bake.i+1}/${bakeSteps().length+1} · ${s.name}${s.label?' · '+s.label:''}`;
  bakeMsg(s.kind==='chips'?s.hint+' '+K.chipCard.replace('{shape}',K.shapes[bake.shape]):s.hint);
  $('bakeBtn').textContent=s.kind==='pour'?K.pourHold:s.kind==='count'?K.eggTap:s.kind==='scoop'?K.scoopTap:s.kind==='chips'?K.chipTap:s.shake?'Shake!':K.stirTap;
  $('bakeAlt').hidden=!['count','chips'].includes(s.kind); $('bakeAlt').textContent=s.kind==='chips'?K.chipClear:K.eggDone;
  $('bakeArt').classList.toggle('tap',s.kind==='chips');
}
function bakeGood(){ sfx('good'); const s=stepNow(); bake.state='good'; const sh=KITCHEN.shapes[bake.shape]; bakeMsg(s.kind==='chips'?sh[0].toUpperCase()+sh.slice(1)+'! '+s.good:s.good,'happy'); $('bakeArt').classList.remove('tap'); $('bakeBtn').textContent=KITCHEN.next; $('bakeAlt').hidden=true }
function ovenSetup(){ bake.state='oven'; bake.t=0; $('bakeStep').className='bstep timer'; $('bakeStep').textContent='00:00'; bakeMsg(KITCHEN.bakeHint); $('bakeBtn').textContent=KITCHEN.bakeStart; $('bakeAlt').hidden=true }
const ovenMin=()=>bake.t/1000*BAKE.RATE;
const ovenClock=m=>`${String(Math.floor(m)).padStart(2,'0')}:${String(Math.floor(m%1*60)).padStart(2,'0')}`;
function bakePress(){
  if(!bake.open||bake.lock>0)return; const s=stepNow(), K=KITCHEN;
  if(bake.state==='pour'){ bake.holding=true; $('bakeBtn').classList.add('on'); return }
  if(bake.state==='count'){ sfx('crack'); bake.eggs++; if(bake.eggs>s.target){bakeMsg(K.eggMany,'frown'); bake.eggs=0; bake.lock=500} return }
  if(bake.state==='stir'){ sfx(s.shake?'shake':'stir'); bake.stirs++; if(bake.stirs>=s.taps)bakeGood(); return }
  if(bake.state==='rhythm'){ const off=bake.bt%STIR.BEAT, d=Math.min(off,STIR.BEAT-off);
    if(d<=STIR.WIN){ sfx('stir'); bake.stirs++; bake.hitAt=time; if($('bakeMsg').textContent===K.offBeat)bakeMsg(s.hint); if(bake.stirs>=s.taps)bakeGood() }
    else { sfx('bad'); bake.stirs=Math.max(0,bake.stirs-1); bakeMsg(K.offBeat,'frown') } return }
  if(bake.state==='scoop'){ if(bake.drop)return; let best=-1,bd=99; SCOOP.SPOTS.forEach((x,i)=>{const d=Math.abs(x-bake.sx); if(d<bd){bd=d;best=i}});
    if(bd>SCOOP.TOL){ sfx('bad'); bakeMsg(K.scoopMiss,'frown'); bake.lock=350; return }
    if(bake.tray[best]){ sfx('bad'); bakeMsg(K.scoopTaken,'frown'); bake.lock=350; return }
    sfx('glug'); bake.drop={i:best, t:0}; return }
  if(bake.state==='chips'){ chipToggle(bake.cur); return }
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
function chipToggle(i){
  if(bake.state!=='chips'||i<0||i>24)return; bake.cur=i;
  if(bake.chips.has(i)){ bake.chips.delete(i); sfx('click') } else { bake.chips.add(i); sfx('type',420) }
  const want=shapeCells(bake.shape), same=want.size===bake.chips.size&&[...want].every(k=>bake.chips.has(k));
  if(same)return bakeGood();
  if(bake.chips.size>=want.size)bakeMsg(KITCHEN.chipWrong,'frown');
  else if($('bakeMsg').textContent===KITCHEN.chipWrong)bakeMsg(stepNow().hint+' '+KITCHEN.chipCard.replace('{shape}',KITCHEN.shapes[bake.shape]));
}
function chipMove(dx,dy){ const r=Math.max(0,Math.min(4,(bake.cur/5|0)+dy)), c=Math.max(0,Math.min(4,bake.cur%5+dx)); bake.cur=r*5+c }
function chipAt(cx,cy){ let best=-1,bd=7; for(let i=0;i<25;i++){const p=chipXY(i), d=Math.hypot(p.x-cx,p.y-cy); if(d<bd){bd=d;best=i}} return best }
function bakeAltPress(){ if(bake.state==='count')return eggsDone(); if(bake.state==='chips'){ bake.chips.clear(); sfx('click'); bakeSetupMsgChips() } }
function bakeSetupMsgChips(){ bakeMsg(stepNow().hint+' '+KITCHEN.chipCard.replace('{shape}',KITCHEN.shapes[bake.shape])) }
function eggsDone(){ const s=stepNow(); if(bake.state!=='count')return; if(bake.eggs===s.target)bakeGood(); else bakeMsg(KITCHEN.eggFew,'frown') }
function closeBake(){ bake.open=false; $('bake').hidden=true; paused=false }
function bakeTick(dt){
  if(!bake.open)return; if(bake.lock>0)bake.lock-=dt;
  const s=stepNow();
  if(bake.state==='pour'&&bake.holding){ if((bake.glugT=(bake.glugT||0)+dt)>140){bake.glugT=0; sfx('glug')} bake.amt+=s.rate*dt/1000; if(bake.amt>=s.max){ bake.holding=false; $('bakeBtn').classList.remove('on'); bake.amt=0; bake.lock=700; bakeMsg(KITCHEN.spilled,'frown') } }
  if(bake.state==='rhythm'){ const was=Math.floor(bake.bt/STIR.BEAT); bake.bt+=dt; if(Math.floor(bake.bt/STIR.BEAT)!==was)sfx('click') }
  if(bake.state==='scoop'){ if(bake.drop){ bake.drop.t+=dt; if(bake.drop.t>=220){ bake.tray[bake.drop.i]=true; bake.drop=null; sfx('crack'); if(bake.tray.every(Boolean))bakeGood() } }
    else { bake.sx+=bake.sdir*SCOOP.SPEED*dt/1000; if(bake.sx>=SCOOP.X1){bake.sx=SCOOP.X1;bake.sdir=-1} if(bake.sx<=SCOOP.X0){bake.sx=SCOOP.X0;bake.sdir=1} } }
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
    if(done.some(d=>d.key==='stir')){F('#e0bf86',x+3,y+4,34,8); F('#ead0a0',x+6,y+5,12,2); F('#cfa86e',x+20,y+9,12,1)}
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
  } else if(bake.state==='rhythm'||(bake.state==='good'&&s.kind==='rhythm')){
    bowl(28,30); const off=bake.bt%STIR.BEAT, beat=Math.floor(bake.bt/STIR.BEAT), ph=off/STIR.BEAT, good=bake.state==='good';
    const ring=(rx,ry,col)=>{for(let a=0;a<64;a++){const t=a/64*Math.PI*2; F(col,Math.round(48+Math.cos(t)*rx),Math.round(31+Math.sin(t)*ry),1,1)}};
    if(!good){ ring(22,7,'#c9a24a'); const k=1-ph; ring(22+k*22,7+k*12,`rgba(229,75,75,${.35+.65*ph})`) }   // the gold rim, and the red ring closing in on it
    if(time-(bake.hitAt||-1e9)<160)ring(22,7,'#4fbf73');
    const sw=good?Math.sin(time/120):Math.cos(Math.PI*(beat+ph)), sx=48+sw*11, sy=36;   // the spoon swings side to side, hitting each side on the beat
    g.strokeStyle='#8a5a34'; g.lineWidth=2; g.beginPath(); g.moveTo(sx,sy); g.lineTo(sx+sw*4+6,sy-24); g.stroke();
    const p=Math.min(1,bake.stirs/s.taps); F('#c9d6e0',20,58,56,3); F('#4fbf73',20,58,56*p,3);
  } else if(bake.state==='scoop'||(bake.state==='good'&&s.kind==='scoop')){
    drawTray(F,bake.state==='good'?SCOOP.SPOTS.map(()=>true):bake.tray,0);
    if(bake.state==='scoop'){ const x=Math.round(bake.sx);
      F('#9aa3b0',x+4,8,10,2); F('#7d8694',x+12,7,6,3);                                  // the scoop's handle
      F('#b9c1cb',x-5,10,11,6); F('#9aa3b0',x-4,15,9,2); if(!bake.drop)doughBall(F,x,11)
      F('rgba(43,34,54,.25)',x,20,1,22);                                                  // a little guide line down to the tray
      if(bake.drop){const k=bake.drop.t/220, dx=SCOOP.SPOTS[bake.drop.i]; doughBall(F,dx,16+k*(SCOOP.Y-10))} }
    const n=bake.tray.filter(Boolean).length, p=bake.state==='good'?1:n/s.balls; F('#c9d6e0',20,60,56,2); F('#4fbf73',20,60,56*p,2);
  } else if(bake.state==='chips'||(bake.state==='good'&&s.kind==='chips')){
    const want=shapeCells(bake.shape), good=bake.state==='good', on=good?want:bake.chips;
    // the recipe card, top left: the pattern to copy
    F('#fffdf6',3,6,26,30); F('#e8e2d6',3,35,26,1); F('#c64b3d',3,6,26,2);
    for(let i=0;i<25;i++){const x=6+(i%5)*4, y=11+(i/5|0)*4; F(want.has(i)?'#5a3220':'#efe6d2',x,y,3,3)}
    // the big cookie (dough for now)
    const {cx,cy}=CHIP_GRID, R0=27; for(let y=-R0;y<=R0;y++){const w=Math.round(Math.sqrt(R0*R0-y*y)); F(y>R0-4?'#cfa86e':'#e0bf86',cx-w,cy+y,w*2,1)}
    F('#ead0a0',cx-16,cy-21,14,2); F('#ead0a0',cx-20,cy-17,6,2);
    for(let i=0;i<25;i++){const {x,y}=chipXY(i);
      if(on.has(i)){F('#3a1f12',x-2,y-1,5,3); F('#5a3220',x-1,y-2,3,4); F('#7a4a30',x-1,y-2,1,1)}
      else F('#cda068',x-1,y-1,2,2) }
    if(!good&&Math.floor(time/300)%2){const {x,y}=chipXY(bake.cur); F('#e8a020',x-4,y-4,9,1); F('#e8a020',x-4,y+4,9,1); F('#e8a020',x-4,y-4,1,9); F('#e8a020',x+4,y-4,1,9)}
  } else if(bake.state==='stir'||(bake.state==='good'&&s.kind==='stir')){
    if(s.shake){ drawTray(F,SCOOP.SPOTS.map(()=>true),bake.state==='good'?s.taps:bake.stirs); const sx=44+Math.sin(bake.stirs*1.7)*20; F('#f2efe6',sx,4,10,14); F('#c8322b',sx,2,10,3);   // the shaker, over the tray
      for(let k=0;k<4&&bake.state!=='good';k++)F(['#e54b4b','#f4d35e','#4fbf73','#5fa8e8'][k],sx+2+k*2,20+((time/60+k*5)%18),1,2) }
    else { bowl(28,30); const ang=bake.stirs*.9+(bake.state==='good'?time/200:0), sx=48+Math.cos(ang)*10, sy=36+Math.sin(ang)*3;
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
$('bakeAlt').onclick=bakeAltPress;
// tap a spot on the big cookie to place (or pick up) a chip
$('bakeArt').addEventListener('pointerdown',e=>{ if(bake.state!=='chips')return; e.preventDefault(); const c=$('bakeArt'), r=c.getBoundingClientRect(), b=c.clientLeft;
  const i=chipAt((e.clientX-r.left-b)*c.width/c.clientWidth,(e.clientY-r.top-c.clientTop)*c.height/c.clientHeight); if(i>=0)chipToggle(i) });
// a round little ball of dough sitting at (x, bottom)
function doughBall(F,x,b){ F('#e0bf86',x-2,b-7,5,1); F('#e0bf86',x-3,b-6,7,1); F('#e0bf86',x-4,b-5,9,4); F('#cfa86e',x-4,b-1,9,1); F('#ead0a0',x-2,b-6,3,1); F('#ead0a0',x-3,b-5,2,1); F('#5a3220',x+1,b-4,1,1); F('#5a3220',x-2,b-2,1,1) }
// the tray of dough balls (sprinkles: how many shakes so far)
function drawTray(F,filled,sprinkles){
  F('#8a96a6',4,SCOOP.Y-2,88,12); F('#b9c4d0',4,SCOOP.Y-2,88,1); F('#6c7a8a',4,SCOOP.Y+9,88,1); F('#f6efe0',6,SCOOP.Y,84,8);   // a baking sheet with parchment
  SCOOP.SPOTS.forEach((x,i)=>{ if(filled[i])doughBall(F,x,SCOOP.Y+6); else {F('#e2d6bf',x-4,SCOOP.Y+1,9,5); F('#f6efe0',x-3,SCOOP.Y+2,7,3)} });
  for(let k=0;k<sprinkles*3;k++){const x=SCOOP.SPOTS[k%6]; F(['#e54b4b','#f4d35e','#4fbf73','#5fa8e8','#e54b7a'][k%5],x-3+(k*7)%7,SCOOP.Y+1+(k*3)%4,1,1)}
}
addEventListener('keydown',e=>{ if(!bake.open)return;
  if(['Space','Enter'].includes(e.code)){ if(document.activeElement===$('bakeAlt'))return; e.preventDefault(); e.stopImmediatePropagation(); if(!e.repeat)bakePress() }
  else if(bake.state==='chips'&&KEYMAP[e.code]){ e.preventDefault(); e.stopImmediatePropagation(); const d={left:[-1,0],right:[1,0],up:[0,-1],down:[0,1]}[KEYMAP[e.code]]; chipMove(...d) }
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
  // an old farmhouse kitchen: board walls under a beam, a deep apron sink under a gingham-curtained window,
  // open shelves of mason jars, a cream enamel stove, a painted hutch (the recipe card is tacked to it), wide pine floors, a braided rug
  const g=kitBg.getContext('2d'), F=(c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};
  // board walls
  F('#efe4cc',0,0,224,46); for(let x=0;x<224;x+=7){F('#ddd0b4',x,0,1,46); F('#f6eedc',x+1,0,1,46)}
  for(let i=0;i<30;i++)F('#e3d6bb',rnd()*224|0,rnd()*44|0,1,2);
  F('#6b4a2f',0,0,224,4); F('#7f5a3a',0,0,224,1); F('#55391f',0,4,224,1);                              // the ceiling beam
  for(let x=2;x<224;x+=5)F(x%10?'#3d8443':'#2f6b36',x,4,4,2);                                          // a pine garland along it...
  for(let x=4;x<224;x+=8)F(['#e54b4b','#f4d35e','#3d8ad6','#4d9a50'][(x/8|0)%4],x,6+((x/8|0)%2),2,2);   // ...with Christmas lights
  F('#e0d1b2',0,41,224,3);                                                                              // shadow above the counter line
  // the window, gingham curtains and a valance
  F('#f6efe2',24,9,36,25); F('#1e2a4a',27,12,30,19); F('#2b3a63',27,25,30,6);
  for(let i=0;i<14;i++)F('#e9eef7',27+rnd()*30|0,12+rnd()*19|0,1,1);
  F('#f6efe2',41,12,2,19); F('#f6efe2',27,20,30,2); F('#e9eef7',27,29,30,2);
  const gingham=(x,y,w,h)=>{F('#f7f2e8',x,y,w,h); for(let a=0;a<w;a+=2)F('rgba(200,50,43,.55)',x+a,y,1,h); for(let b=0;b<h;b+=2)F('rgba(200,50,43,.55)',x,y+b,w,1)};
  gingham(19,9,6,22); gingham(59,9,6,22); gingham(19,8,46,4); F('#a8362f',19,12,46,1);
  // butcher-block counter with a deep white apron sink under the window
  F('#c9975e',6,34,114,7); for(let x=6;x<120;x+=4)F('#b9874f',x,34,1,7); F('#dcae74',6,34,114,1); F('#9e6d3c',6,40,114,2);
  F('#7d9a7a',6,42,114,16); F('#6a8668',6,42,114,1);                                                    // sage green cabinets
  for(const x of [64,86,104]){F('#6f8c6d',x,44,16,12); F('#8aa888',x,44,16,1); F('#c9a24a',x+7,49,2,2)}
  F('#f7f5ef',24,36,36,13); F('#ddd8cc',24,48,36,1); F('#e9e6de',25,37,34,2); F('#c9c4b8',24,36,1,13); F('#c9c4b8',59,36,1,13);   // the apron sink
  gingham(8,44,14,13); gingham(62,49,0,0);                                                              // a gingham skirt on the cupboard by the plant
  F('#b9bfc8',39,30,6,2); F('#d0d5dc',41,27,2,4); F('#b9bfc8',37,29,2,2); F('#b9bfc8',45,29,2,2);         // bridge faucet
  F('#6a4224',6,57,114,1);                                                                              // toe kick shadow
  // on the counter: a bowl of dough, a crock of spoons, a basket of eggs, the rolling pin
  F('#f3eadb',66,28,16,8); F('#e0d4bf',67,34,14,2); F('#d8b46a',69,27,10,2);
  F('#8a6a4a',100,29,8,6); F('#e8e2d6',101,26,2,4); F('#6b4a2f',104,25,2,5); F('#e8e2d6',106,27,1,3);
  F('#b08850',86,31,12,4); F('#c9a06a',86,31,12,1); F('#fff8ec',88,29,3,3); F('#e9c9a0',92,29,3,3); F('#fff8ec',95,30,2,2);   // eggs in a basket
  F('#d9b27c',10,32,12,2); F('#8a5a34',8,32,2,2); F('#8a5a34',22,32,2,2);
  // open shelves of mason jars and stacked plates
  for(const y of [12,22]){F('#8a5a34',70,y,48,2); F('#a26c40',70,y,48,1); F('#5a3a22',72,y+2,2,2); F('#5a3a22',114,y+2,2,2)}
  const jar=(x,y,fill)=>{F('#d6e8ee',x,y-7,6,7); F(fill,x+1,y-5,4,5); F('#ffffff',x+1,y-6,1,3); F('#c9a24a',x,y-8,6,1)};
  jar(72,12,'#f3eee3'); jar(80,12,'#f2d49a'); jar(88,12,'#7a4a2c'); jar(96,12,'#5fa04f'); jar(104,12,'#c8322b');
  jar(72,22,'#e8c070'); jar(80,22,'#f7f2e6');
  for(let k=0;k<4;k++){F('#f7f5ef',92,20-k*2,14,2); F('#3d6fb0',92,21-k*2,14,1)} F('#a8362f',110,15,6,7); F('#c64b3d',111,16,4,1);   // plates, a tin
  // a cast-iron skillet on a nail
  F('#5a3a22',66,10,1,2); F('#2b2b2f',63,13,8,7); F('#3a3a40',64,14,6,5); F('#2b2b2f',66,19,2,6); F('#45454c',64,14,2,1);
  // the stove: a cream enamel range with a tall backguard, chrome trim and a little clock
  F('#e9dfc4',122,16,30,10); F('#f4ecd6',122,16,30,1); F('#c9bf9f',122,25,30,1); F('#fffdf6',133,18,8,6); F('#2b2f36',137,19,1,3); F('#2b2f36',137,21,2,1);   // backguard + clock
  F('#efe6cf',122,26,30,32); F('#f7f0de',122,26,1,32); F('#cfc5a8',151,26,1,32); F('#b9af92',122,57,30,1);
  F('#3a3a40',124,27,26,4); for(const x of [126,138])F('#1d1d22',x,28,8,2);                              // burners
  F('#c3c9d2',124,32,26,1); F('#1d2026',126,36,22,16); F('#c3c9d2',126,34,22,1); F('#9aa3b0',126,52,22,1);   // the oven door window, chrome
  F('#3a3226',128,46,18,4); F('#4a3f30',128,46,18,1); F('#e86a2a',129,52,16,1);
  for(const x of [125,131,143,149])F('#2b2b2f',x,31,2,1);                                              // knobs
  // utensils hanging on a rail above the stove: a copper pot, a whisk, a ladle
  F('#8a8f9a',122,9,30,1); F('#b8733a',125,10,10,5); F('#d08a4a',126,10,8,1); F('#8a5522',124,11,1,2);
  F('#c3c9d2',140,10,1,4); F('#c3c9d2',139,13,3,3); F('#c3c9d2',146,10,1,5); F('#c3c9d2',145,14,3,2);
  // the hutch: painted barn red, plates on display up top, the recipe card tacked to the cupboard door
  F('#8f2c26',156,6,30,52); F('#a8362f',157,7,28,50); F('#6f221d',156,57,30,1); F('#c64b3d',157,7,28,1);
  F('#f2e6c8',159,9,24,20); F('#e3d4b0',159,28,24,1); F('#8f2c26',159,18,24,1);
  for(const [x,y] of [[160,10],[168,10],[176,10],[162,19],[171,19]]){F('#f7f5ef',x,y,6,7); F('#3d6fb0',x+1,y+1,4,5); F('#f7f5ef',x+2,y+2,2,3)}   // blue-and-white plates
  F('#8f2c26',158,31,26,1); F('#7d2622',170,32,1,24); F('#e2c35a',168,44,1,2); F('#e2c35a',172,44,1,2);
  F('#fffdf6',161,35,12,10); for(let y=37;y<44;y+=2)F('#d0605a',162,y,9,1); F('#3d8ad6',166,34,2,2);       // the recipe card
  // a little spice shelf and the wreath
  F('#8a5a34',188,40,14,1); for(const [x,c] of [[189,'#c64b3d'],[193,'#3d8ad6'],[197,'#f4d35e']])F(c,x,35,3,5);
  for(let a=0;a<16;a++){const t=a/16*Math.PI*2; F(a%3?'#2f6b36':'#3d8443',204+Math.cos(t)*7-1|0,22+Math.sin(t)*7-1|0,3,3)}
  F('#c8322b',201,28,6,3); F('#e54b4b',203,18,2,2); F('#e54b4b',210,23,2,2);
  // wide pine floorboards, with knots and nail heads
  F('#c99a5e',0,58,224,110);
  for(let y=58;y<168;y+=12){for(let x=((y/12|0)%3)*30-90;x<224;x+=90){const t=rnd(); F(t<.33?'#c08f54':t<.66?'#d2a568':'#c99a5e',x+1,y+1,89,11); F('#a8763f',x,y,1,12)}
    F('#a8763f',0,y,224,1); for(let x=4;x<224;x+=30)F('#8a5f34',x,y+2,1,1)}
  for(let i=0;i<180;i++)F(rnd()<.5?'#b8874c':'#d8ae74',rnd()*224|0,59+rnd()*108|0,3+rnd()*6|0,1);       // grain
  for(let i=0;i<10;i++){const x=rnd()*220|0, y=60+rnd()*104|0; F('#9a6a38',x,y,3,2); F('#7f5530',x+1,y,1,1)}   // knots
  F('#8f6236',0,58,224,2); F('#a8763f',0,60,224,1);
  // a braided rag rug: an oval of colored rings
  {const cx=112, cy=116, cols=['#a8362f','#efe2c4','#3d6fb0','#c9a24a','#4d7a4a','#efe2c4','#a8362f','#d8b46a'];
   for(let r=0;r<cols.length;r++){const rx=46-r*5, ry=26-r*3; for(let y=-ry;y<=ry;y++){const w=Math.round(rx*Math.sqrt(1-(y/ry)**2)); F(cols[r],cx-w,cy+y,w*2,1)}}
   for(let y=-26;y<=26;y+=2){const w=Math.round(46*Math.sqrt(1-(y/26)**2)); F('rgba(0,0,0,.08)',cx-w,cy+y,w*2,1)}}
  // door + mat
  F('#5a3a22',98,162,28,6); F('#2b1a10',100,164,24,4); F('#7a8a54',100,150,24,10); F('#6a7a46',102,152,20,6); for(let x=103;x<121;x+=4)F('#8a9a62',x,153,2,4);
  // a plant in a tin pail by the sink
  F('#9aa3b0',10,48,10,8); F('#b9bfc8',10,48,10,1); F('#7d8694',10,55,10,1); F('#3d8443',8,40,6,8); F('#4d9a50',14,38,6,10);
  F('#5fb060',15,39,2,3); F('#2f6b36',9,44,2,3); F('#5fb060',6,43,3,2); F('#4d9a50',19,42,3,2);
})();

// table + chairs, and the Christmas tree, are depth-sorted so you can walk behind them
function drawTable(){
  const F=(c,x,y,w,h)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h)};
  F('#7a4e2c',80,104,8,12); F('#7a4e2c',136,104,8,12);                 // chairs
  F('#6a4224',80,100,8,4); F('#6a4224',136,100,8,4);
  for(const x of [80,136]){F('#5a3a22',x,92,1,9); F('#5a3a22',x+7,92,1,9); for(const y of [93,96,99])F('#7a4e2c',x,y,8,1)}   // ladder-back chairs
  F('#c9975e',86,100,52,16); for(let x=86;x<138;x+=4)F('#b9874f',x,100,1,16); F('#dcae74',86,100,52,2); F('#9e6d3c',86,115,52,1);   // a butcher-block farm table
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
    if(kit.crownT>0){const t=Math.min(1,(1-kit.crownT/1600)*1.4); drawCrown(X,Y-25-(1-t)*60)} else if(have.crown)drawCrown(X,Y-25);
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
    if(allIn()&&!have.baked&&!bake.open&&!kit.taste&&!paused)drawExitMark(BAKE_MARK);   // a bouncing BAKE arrow over the mixing bowl once everything's in
    drawHug(); drawTasteNerves(); kitCaption(); if(kit.dance)drawDanceBanner() },
};
