// The ending: credits, Joe's stats card (and the 100% reward), the photo album, then Alex's note.
// All the words are in ENDING (story.js); the note itself is KITCHEN.note.

// ---------- secrets (the 100% reward) ----------
const SECRETS=[
  {id:'cupcake',  has:()=>have.cupcake||have.gaveCupcake},
  {id:'sprinkles',has:()=>have.sprinkles},
  {id:'icecream', has:()=>have.icecream},
  {id:'oakleys',  has:()=>have.gear&&'oakleys' in have.gear},
  {id:'headband', has:()=>have.gear&&'headband' in have.gear},
  {id:'shoes',    has:()=>have.gear&&'shoes' in have.gear},
  {id:'clover',   has:()=>have.gear&&'clover' in have.gear},
];
const secretsFound=()=>SECRETS.filter(s=>s.has()).length;
const allSecrets=()=>secretsFound()===SECRETS.length;

// ---------- photos: little pixel polaroids, one per stop ----------
// Each one is drawn once, using the game's own sprites, then copied off the main canvas.
const PHOTO_W=64, PHOTO_H=48, photoCache={};
const joeAt=(x,y,dir='down')=>{const c={x,y,dir,moving:false,step:0}; drawJoeJersey(c,ctx); drawGear(c,ctx,null)};
const PHOTO_SCENES={
  farm(F){ F('#7cc35a',0,0,64,48); for(let i=0;i<40;i++)F('#6bb04c',(i*29)%64,(i*17)%48,2,1);
    F('#b8433a',2,2,24,16); F('#8f2e27',0,0,28,4); F('#f2efe6',11,9,6,9); F('#e8c35a',30,30,10,6); F('#d9b04a',30,30,10,1);
    drawKeelan({x:16,y:44,dir:'down',moving:false,step:0}); joeAt(46,44); drawHen(52,24,1); drawHen(44,18,-1); drawHen(58,36,-1); drawHen(40,26,1) },
  mill(F){ F('#eef3f7',0,0,64,48); for(let i=0;i<30;i++)F('#ffffff',(i*23)%64,(i*13)%48,1,1);
    F('#8a8f9a',6,2,2,14); F('#8a8f9a',56,2,2,14); F('#1d3f73',6,2,52,8); F('#c8322b',6,2,52,1); pixText(ctx,'BIRKIE',20,4,'#ffffff');
    drawSkier(22,40,{jersey:'#fbfbf7',trim:'#c8322b',hair:'#b08355'}); drawSkier(38,34,{jersey:'#4f2683',helmet:'#8a8f9a',horns:true}); drawTrailJohn(54,42,'left') },
  city(F){ F('#1b2236',0,0,64,48); F('#2a3350',0,30,64,18); F('#f2efe6',50,4,6,6); F('#1b2236',52,4,4,4);
    for(let i=0;i<24;i++)F('rgba(170,190,230,.6)',(i*11)%64,(i*7)%40,1,3);
    drawLars({x:20,y:42,dir:'right',moving:false,step:0}); F('#8a5a34',27,28,12,9); F('#efe2c4',29,30,8,3); drawJohn({x:48,y:44,dir:'left',moving:false,step:0}) },
  fargo(F){ F('#87c4e8',0,0,64,14); F('#cdb978',0,14,64,34); F('#9a9690',0,20,64,8); for(let x=2;x<64;x+=8)F('#e2c75a',x,24,4,1);
    drawCar(20,24,'right',true); drawAlex(40,44,'happy'); drawBob(54,44); F('#2f7a46',33,30,2,4); F('#7a2b5a',46,32,3,3) },
  golf(F){ F('#7cc35a',0,0,64,48); for(let y=0;y<48;y+=8)F('#86cb63',0,y,64,4);
    F('#8a8f9a',51,6,2,16); F('#c9ced4',47,6,10,2); F('#e8b04a',47,8,10,1); for(let x=48;x<56;x+=2)F('#c9ced4',x,9,1,6); F('#8a8f9a',47,14,10,3);
    drawMargie(14,44); drawJack(28,44); joeAt(44,44); F('#f4d35e',38,20,5,2) },
  kitchen(F){ F('#b98352',0,0,64,48); for(let y=0;y<48;y+=6)F('#a5703f',0,y,64,1); F('#ecd2ac',0,0,64,10); F('#8a5a34',0,10,64,2);
    drawAlex(24,44,'happy'); joeAt(38,44); drawCrown(38,22);
    F('#e54b7a',28,14,3,3); F('#e54b7a',32,14,3,3); F('#e54b7a',27,16,9,3); F('#e54b7a',29,19,5,2); F('#e54b7a',31,21,1,1);
    for(const [x,y] of [[6,40],[54,36],[8,20],[56,16]])drawCookie(x,y) },
};
function photo(id){
  if(photoCache[id])return photoCache[id];
  const c=document.createElement('canvas'); c.width=PHOTO_W; c.height=PHOTO_H;
  ctx.save(); ctx.setTransform(1,0,0,1,0,0); ctx.clearRect(0,0,PHOTO_W,PHOTO_H);
  ctx.beginPath(); ctx.rect(0,0,PHOTO_W,PHOTO_H); ctx.clip();
  try{ PHOTO_SCENES[id]((col,x,y,w,h)=>{ctx.fillStyle=col;ctx.fillRect(x,y,w,h)}) }catch(e){ console.warn('photo',id,e) }
  ctx.restore(); c.getContext('2d').drawImage(cv,0,0,PHOTO_W,PHOTO_H,0,0,PHOTO_W,PHOTO_H);
  return photoCache[id]=c;
}
const photoUnlocked=id=>id==='kitchen'?!!have.baked:!!have[id];

// ---------- the screens ----------
const ending={page:null, photo:0, fromSettings:false};
function openEnding(){ ending.fromSettings=false; $('ending').hidden=false; paused=true; prompt.hidden=true; playSong('kitchen'); showCredits() }
function openAlbum(){ ending.fromSettings=true; $('ending').hidden=false; paused=true; prompt.hidden=true; showAlbum() }
function closeEnding(){ $('ending').hidden=true; $('creditRoll').getAnimations().forEach(a=>a.cancel()); paused=overlayOpen(); sceneMusic() }
function endButtons(next,skip){
  $('endNext').hidden=!next; $('endSkip').hidden=!skip;
  if(next){$('endNext').textContent=next.label; $('endNext').onclick=next.fn; setTimeout(()=>$('endNext').focus({preventScroll:true}),0)}
  if(skip){$('endSkip').textContent=skip.label; $('endSkip').onclick=skip.fn}
}
function showCredits(){
  ending.page='credits'; const E=ENDING; $('credits').hidden=false; $('ecard').hidden=true;
  const roll=$('creditRoll'); roll.replaceChildren();
  const h=document.createElement('h2'); h.textContent=E.creditsTitle; roll.append(h);
  const sub=document.createElement('p'); sub.className='csub'; sub.textContent=E.creditsSub; roll.append(sub);
  for(const [face,name,role,needs] of E.credits){ if(needs&&!have[needs])continue;
    const row=document.createElement('div'); row.className='crow';
    if(face&&PORTRAITS[face]){const p=PORTRAITS[face], c=document.createElement('canvas'); c.width=c.height=p.size; const g=c.getContext('2d'); g.fillStyle=p.bg; g.fillRect(0,0,p.size,p.size); p.draw(g); row.append(c)}
    else {const s=document.createElement('span'); s.className='cblank'; row.append(s)}
    const t=document.createElement('div'); t.innerHTML='<b></b><span></span>'; t.querySelector('b').textContent=name; t.querySelector('span').textContent=role; row.append(t); roll.append(row) }
  for(const line of E.thanks){const p=document.createElement('p'); p.className='cthanks'; p.textContent=line; roll.append(p)}
  const dur=Math.max(16000,roll.children.length*1500);
  const anim=roll.animate([{transform:'translateY(var(--from))'},{transform:'translateY(-100%)'}],{duration:dur,easing:'linear',fill:'forwards'});
  roll.style.setProperty('--from',$('credits').clientHeight+'px');
  anim.onfinish=()=>{ if(ending.page==='credits')showStats() };
  endButtons(null,{label:E.skip,fn:()=>{anim.cancel(); showStats()}});
}
function card(title){ ending.page=title; $('credits').hidden=true; const c=$('ecard'); c.hidden=false; c.replaceChildren(); const h=document.createElement('small'); h.textContent=title; c.append(h); c.scrollTop=0; return c }
function showStats(){
  const E=ENDING, c=card(E.statsTitle), dl=document.createElement('dl'); dl.className='stats';
  const look=[WARDROBE.jersey,...WARDROBE.outfits].find(o=>o.id===(have.look||'jersey'));
  const rows=[[E.stats.birkie,have.birkieTime||'—'],[E.stats.golf,have.golfCard||'—'],[E.stats.anagrams,have.anaScore||'—'],[E.stats.spotted,have.spotted||0],
    [E.stats.snacks,have.fargoWrong||0],[E.stats.pwTries,have.pwTries||0],[E.stats.steps,Math.round(have.steps||0).toLocaleString()],[E.stats.look,look?look.name:'—']];
  for(const [k,v] of rows){const dt=document.createElement('dt'), dd=document.createElement('dd'); dt.textContent=k; dd.textContent=v; dl.append(dt,dd)}
  c.append(dl);
  const sec=document.createElement('div'); sec.className='secrets'; const n=secretsFound();
  const head=document.createElement('p'); head.innerHTML='<b></b>'; head.querySelector('b').textContent=E.secretsLine(n,SECRETS.length); sec.append(head);
  const list=document.createElement('div'); list.className='slist';
  for(const s of SECRETS){const sp=document.createElement('span'); sp.className=s.has()?'got':''; sp.textContent=s.has()?E.secretNames[s.id]:'?'; list.append(sp)} sec.append(list);
  if(n===SECRETS.length){const p=document.createElement('p'); p.className='legend'; p.textContent=E.legend; sec.append(p)}
  else {const p=document.createElement('p'); p.className='tip'; p.textContent=E.secretsTip; sec.append(p)}
  c.append(sec);
  endButtons({label:E.next,fn:()=>allSecrets()?showSecretNote():showAlbum()},null);
}
function showSecretNote(){ const E=ENDING, c=card(E.secretTitle), p=document.createElement('p'); p.className='enote'; p.textContent=E.secretNote; c.append(p); endButtons({label:E.next,fn:showAlbum},null) }
const PHOTO_IDS=['farm','mill','city','fargo','golf','kitchen'];
function showAlbum(){
  const E=ENDING, c=card(E.albumTitle), id=PHOTO_IDS[ending.photo], open=photoUnlocked(id);
  const pol=document.createElement('div'); pol.className='polaroid';
  if(open){const cv2=document.createElement('canvas'); cv2.width=PHOTO_W; cv2.height=PHOTO_H; cv2.getContext('2d').drawImage(photo(id),0,0); pol.append(cv2)}
  else {const d=document.createElement('div'); d.className='plocked'; d.textContent='?'; pol.append(d)}
  const cap=document.createElement('p'); cap.textContent=open?E.photos[id]:E.photoLocked; pol.append(cap); c.append(pol);
  const nav=document.createElement('div'); nav.className='pnav';
  const prev=document.createElement('button'); prev.className='btn ghost'; prev.textContent='‹'; prev.disabled=ending.photo===0; prev.onclick=()=>{ending.photo--; showAlbum()};
  const count=document.createElement('span'); count.textContent=`${ending.photo+1} / ${PHOTO_IDS.length}`;
  const next=document.createElement('button'); next.className='btn ghost'; next.textContent='›'; next.disabled=ending.photo===PHOTO_IDS.length-1; next.onclick=()=>{ending.photo++; showAlbum()};
  nav.append(prev,count,next); c.append(nav);
  if(ending.fromSettings)endButtons({label:E.close,fn:closeEnding},null);
  else endButtons({label:E.toNote,fn:showNote},null);
}
function showNote(){
  const E=ENDING, c=card(E.noteTitle), p=document.createElement('p'); p.className='enote'; p.textContent=KITCHEN.note; c.append(p);
  const row=document.createElement('div'); row.className='brow';
  const again=document.createElement('button'); again.className='btn ghost'; again.textContent=KITCHEN.playAgain; again.onclick=()=>{closeEnding(); playAgain()};
  row.append(again); c.append(row);
  endButtons({label:KITCHEN.keepExploring,fn:closeEnding},null);
}
