// Basket strip, dialog boxes, and what happens at each land.
const $=id=>document.getElementById(id);
const dlg=$('dialog'), prompt=$('prompt');
// The basket: a little picture of each ingredient. Ones you don't have yet are dark shadows of themselves.
// Bonus things (the cupcake, Bryan's sprinkles, Lars's ice cream) show up after a divider once you find them.
function itemIcon(key,got){
  const c=document.createElement('canvas'); c.width=40; c.height=30; const g=c.getContext('2d');
  ART[key](g); if(!got){g.globalCompositeOperation='source-in'; g.fillStyle='#3a4058'; g.fillRect(0,0,40,30)}
  return c;
}
function basketSlot(key,label,got,cls=''){
  const s=document.createElement('span'); s.className=`slot ${got?'got':''} ${cls}`; s.dataset.key=key; s.title=label;
  s.append(itemIcon(key,got)); const l=document.createElement('b'); l.innerHTML=got?'<i>✓ </i>':''; l.append(label); s.append(l);
  return s;
}
function renderBasket(){
  const b=$('basket'); b.replaceChildren(...ITEMS.map(i=>basketSlot(i.key,i.label,!!have[i.key])));
  const extras=[]; if(have.cupcake&&!have.gaveCupcake)extras.push(basketSlot('cupcake','Cupcake',true,'extra'));
  if(have.sprinkles)extras.push(basketSlot('sprinkles','Sprinkles',true,'bonus'));   // a bonus from Bryan
  if(have.icecream)extras.push(basketSlot('icecream','Ice cream',true,'bonus'));    // a bonus from Lars's long jump
  if(extras.length){const d=document.createElement('span'); d.className='bdiv'; b.append(d,...extras)}
}
// pages: strings shown one at a time. actions: buttons on the last page.
// menu:true lays the buttons out as a grid of choices (used for asking questions).
function showDialog({place,speaker,face,pages,actions,noteLast,menu}){
  paused=true; prompt.hidden=true; let i=0;
  $('dplace').textContent=place||''; $('dspeaker').textContent=speaker||''; showPortrait(face||speaker);
  const voice=typeVoice(speaker);
  const draw=()=>{
    const t=$('dtext'); typeOut(t,pages[i],voice); t.className=(noteLast&&i===pages.length-1)?'note':'';
    const box=$('dbtns'); box.innerHTML=''; const last=i===pages.length-1; box.classList.toggle('menu',!!menu&&last); dlg.classList.toggle('tall',!!menu&&last);
    const list=i<pages.length-1?[{label:'Next',fn:()=>{i++;draw();sfx('next')}}]:actions;
    list.forEach((a,n)=>{const b=document.createElement('button');b.className='btn'+(a.ghost?' ghost':'');b.textContent=a.label;b.onclick=a.fn;box.appendChild(b); if(n===0)setTimeout(()=>b.focus({preventScroll:true}),0)});
  };
  dlg.hidden=false; draw(); sfx('blip');
}
// ---------- typewriter text ----------
// The whole line is in the box from the start (the untyped part is invisible), so the box never jumps in size
// and anything reading the text gets all of it. Space, A or a tap on the box finishes the line.
let typing=null;
const TYPE_MS=19, TYPE_PAUSE={'.':170,'!':170,'?':170,',':80,'…':170,':':90};
function typeVoice(name){ let h=0; for(const ch of String(name||''))h=(h*31+ch.charCodeAt(0))%997; return 560+(h%7)*45 }   // everyone sounds a little different
function typeOut(el,text,voice){
  finishTyping();
  const shown=document.createElement('span'), rest=document.createElement('span'); rest.className='tw-rest';
  shown.textContent=''; rest.textContent=text; el.replaceChildren(shown,rest);
  if(matchMedia('(prefers-reduced-motion: reduce)').matches||!text.length){shown.textContent=text; rest.textContent=''; return}
  let n=0, tmr=null;
  const done=()=>{clearTimeout(tmr); shown.textContent=text; rest.textContent=''; typing=null};
  const step=()=>{
    if(!el.isConnected||dlg.hidden)return done();
    n++; shown.textContent=text.slice(0,n); rest.textContent=text.slice(n);
    const ch=text[n-1]; if(ch&&ch!==' '&&n%2)sfx('type',voice);
    if(n>=text.length)return done();
    tmr=setTimeout(step,TYPE_MS+(TYPE_PAUSE[ch]&&text[n]===' '?TYPE_PAUSE[ch]:0));
  };
  typing={done}; tmr=setTimeout(step,TYPE_MS);
}
function finishTyping(){ if(!typing)return false; typing.done(); return true }
$('dialog').addEventListener('pointerdown',e=>{ if(typing&&!e.target.closest('button'))finishTyping() });
// Space / Enter / E while a line is still typing: finish it first (don't press the button yet)
let swallowKeyUp=false;
addEventListener('keydown',e=>{ if(['Space','Enter','KeyE'].includes(e.code)&&!dlg.hidden&&typing){finishTyping(); swallowKeyUp=true; e.preventDefault(); e.stopImmediatePropagation()} },true);
addEventListener('keyup',e=>{ if(swallowKeyUp&&['Space','Enter','KeyE'].includes(e.code)){swallowKeyUp=false; e.preventDefault()} },true);
// is any pop-up still open? (so closing one menu never unpauses the game under another)
const OVERLAYS=['dialog','reward','pump','shop','vault','boss','anagram','howto','wardrobe','bake','cloverHunt','ending','settings','titlecard'];
const overlayOpen=()=>OVERLAYS.some(id=>!$(id).hidden);
function closeDialog(){finishTyping(); dlg.hidden=true; paused=overlayOpen(); cv.focus?.()}
const CLOSE={label:'Close',fn:closeDialog};

function action(){
  if(!$('titlecard').hidden){start();return}
  if(!$('pump').hidden||!$('shop').hidden||!$('vault').hidden||!$('boss').hidden||!$('anagram').hidden||!$('howto').hidden||!$('wardrobe').hidden||!$('bake').hidden||!$('ending').hidden||!$('settings').hidden)return;   // the pump and shop have their own buttons
  if(!$('reward').hidden){collectReward();return}
  if(!dlg.hidden){if(finishTyping())return; const f=document.activeElement, b=$('dbtns').contains(f)?f:$('dbtns').querySelector('button'); b&&b.click(); return}
  if(near)near.act(); else if(scene.ability)scene.ability();
}
// ---------- settings ----------
function openSettings(){
  $('soundToggle').checked=!muted; $('musicToggle').checked=musicOn; $('musicToggle').disabled=muted; renderGearSettings();
  $('settings').hidden=false; paused=true; prompt.hidden=true; setTimeout(()=>$('settingsClose').focus({preventScroll:true}),0) }
function closeSettings(){ $('settings').hidden=true; paused=overlayOpen(); $('settingsBtn').blur() }
$('soundToggle').onchange=()=>{setSound($('soundToggle').checked); $('musicToggle').disabled=muted};
$('musicToggle').onchange=()=>setMusic($('musicToggle').checked);
$('setAlbum').onclick=()=>{ $('settings').hidden=true; openAlbum() };
$('settingsBtn').onclick=openSettings; $('settingsClose').onclick=closeSettings;
// change outfit any time: on the rooftops it's the stealth outfit, everywhere else it's Joe's everyday look
$('setOutfit').textContent=WARDROBE.changeOutfit;
$('setOutfit').onclick=()=>{ $('settings').hidden=true; openWardrobe(()=>{ paused=overlayOpen() },scene===SCENES.city?'heist':'look',true) };
function start(){$('titlecard').hidden=true; paused=false; audioInit(); sceneMusic(); if(!have.welcomed)welcome()}
// the first time you press Start: Alex explains everything, then you pick Joe's look
function welcome(){
  showDialog({place:ALEX_WELCOME.place,speaker:ALEX_WELCOME.speaker,pages:ALEX_WELCOME.pages,actions:[{label:ALEX_WELCOME.go,fn:()=>{closeDialog(); openWardrobe(()=>{have.welcomed=true; save()},'look')}}]});
}
function skipWelcome(){ if(!dlg.hidden)closeDialog(); $('wardrobe').hidden=true; have.welcomed=true; save(); paused=false }   // used by the tests
$('startBtn').onclick=start;

// ---------- reward pop-up ----------
// showReward('farm') shows the item art; tapping it flies it into the basket and marks it collected.
const ART={
  cupcake(g){ const F=(c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};
    // the hidden cupcake: striped pink wrapper, chocolate frosting swirl, a cherry
    F('#e9a6c0',12,17,16,10); F('#c77a9a',14,17,2,10); F('#c77a9a',19,17,2,10); F('#c77a9a',24,17,2,10); F('#d88fae',13,26,14,1);
    F('#5a3220',11,11,18,7); F('#6e3f28',13,8,14,4); F('#7a4a2c',16,5,8,4); F('#8a5a38',14,9,4,1);
    F('#e54b7a',13,13,1,1); F('#f4d35e',18,10,1,1); F('#5fa8e8',23,13,1,1); F('#ffffff',20,14,1,1);
    F('#c8322b',18,2,4,4); F('#e8584c',18,2,2,1); F('#3f7a45',21,0,1,3) },
  icecream(g){ const F=(c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};
    // a pint of Maple Rosemary: cream-colored tub, maple-brown label, a rosemary sprig, a little frost
    F('#d9d3c4',7,4,18,4); F('#efe9dc',8,3,16,2); F('#f7f2e6',8,8,16,20); F('#e0d8c6',22,8,2,20); F('#e0d8c6',8,27,16,1);
    F('#9a5a2a',8,13,16,8); F('#b8743a',8,13,16,1); F('#f2d49a',10,15,12,1); F('#f2d49a',10,18,8,1);
    F('#3f7a45',12,9,1,4); F('#5a9a50',11,10,1,1); F('#5a9a50',13,10,1,1); F('#5a9a50',11,12,1,1); F('#5a9a50',13,11,1,1);   // rosemary
    F('#ffffff',9,9,2,1); F('#ffffff',20,24,2,1); F('#cfe6f2',23,6,1,1); F('#cfe6f2',5,20,1,1) },
  sprinkles(g){ const F=(c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};
    // a shaker of rainbow sprinkles
    F('#f2efe6',9,10,14,18); F('#d9d3c4',21,10,2,18); F('#c8322b',9,6,14,5); F('#a02a22',9,10,14,1); for(let x=11;x<22;x+=3)F('#ffffff',x,7,1,1);
    const cs=['#e54b4b','#f4d35e','#4fbf73','#5fa8e8','#e54b7a','#ffffff'];
    for(let k=0;k<18;k++)F(cs[k%6],10+(k*5)%11,14+(k*7)%12,2,1);
    for(let k=0;k<6;k++)F(cs[k],4+k*4,29+(k%2),2,1) },
  farm(g){ const F=(c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};
    // egg carton
    F('#a9875f',2,16,22,10); F('#c4a173',2,14,22,3); F('#8d6e4a',2,25,22,1);
    for(const [x,c] of [[4,'#fff8ec'],[11,'#e9c9a0'],[18,'#fff8ec']]){F(c,x,9,5,7);F(c,x+1,8,3,1);F('#ffffff',x+1,10,1,2)}
    // butter on a dish
    F('#e6ebef',22,21,17,4); F('#c9d1d8',23,24,15,1);
    F('#f7dd7a',25,14,12,7); F('#fbe9a6',25,14,12,2); F('#e2c35a',36,15,1,6);
    F('#ffffff',27,17,6,3); F('#3d8ad6',28,18,4,1);                    // paper wrapper label
  },
  mill(g){ const F=(c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};
    // a sack of flour tied with twine, a little puff of flour
    F('#efe6d2',9,8,22,20); F('#e2d6bc',9,8,2,20); F('#f8f3e6',27,10,3,17); F('#e2d6bc',12,4,16,5); F('#d6c8a8',14,3,3,2); F('#d6c8a8',22,2,3,3);
    F('#8a5a34',11,8,18,1); F('#4f2683',13,14,14,8); F('#ffc62f',13,14,14,1); F('#ffc62f',13,21,14,1); F('#efe6d2',16,16,8,4);
    F('#ffffff',32,6,3,2); F('#ffffff',34,4,2,2); F('#f8f3e6',5,24,3,2);
  },
  golf(g){ const F=(c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};
    // a gallon jug of whole milk, plus a cookie for scale
    F('#e8eef3',10,8,18,20); F('#ffffff',11,9,16,18); F('#d6dde3',26,9,1,18); F('#ffffff',12,4,8,5); F('#d33b2f',14,2,5,3);
    F('#d6dde3',22,9,5,10); F('#e8eef3',23,11,3,6);                      // handle
    F('#d33b2f',11,15,16,6); F('#ffffff',13,17,12,2);                    // red label
    F('#c98a5a',28,20,9,8); F('#5a3220',30,22,2,2); F('#5a3220',34,23,2,2); F('#5a3220',31,26,2,1);
  },
  city(g){ const F=(c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};
    // a stack of chocolate bars, one unwrapped
    F('#c8322b',4,18,22,8); F('#e8e2d6',4,21,22,2); F('#9e2620',4,25,22,1);
    F('#2f6db0',8,12,22,7); F('#e8e2d6',8,14,22,2); F('#245a94',8,18,22,1);
    F('#5a3220',14,4,22,9); F('#6e3f28',14,4,22,1); for(let x=14;x<36;x+=5)F('#46271a',x,4,1,9); F('#46271a',14,8,22,1);
    F('#e9e2d2',30,10,8,8); F('#d8cfba',30,10,2,8);                    // peeled-back foil
  },
  fargo(g){ const F=(c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};
    // paper sack of beet sugar, a little spilled
    F('#e9e2d2',11,6,18,22); F('#d8cfba',11,6,18,2); F('#cfc5ae',11,6,2,22); F('#f3eee3',27,8,2,20);
    F('#e9e2d2',12,3,16,4); F('#d8cfba',13,2,3,2); F('#d8cfba',19,1,3,3); F('#d8cfba',24,2,3,2);   // crumpled top
    F('#2f6db0',11,14,18,7); F('#ffffff',11,14,18,1);
    F('#7d2b52',17,15,6,5); F('#4f9a3c',19,13,2,3); F('#a03d6a',18,16,2,2);                     // a beet on the label
    F('#ffffff',30,25,6,2); F('#ffffff',32,24,3,1); F('#f3eee3',36,26,2,1); F('#ffffff',6,26,4,1);  // spilled sugar
  },
};
const REWARDS={
  farm:{from:'From Keelan', name:'Eggs & butter', hint:'Tap them to put them in your basket.'},
  fargo:{from:'From Lil Q', name:'Sugar', hint:'Tap it to put it in your basket.'},
  city:{from:'From a grateful city', name:'Chocolate', hint:'Tap it to put it in your basket.'},
  golf:{from:'From Margie, Jack and the creamery', name:'Milk', hint:'Tap it to put it in your basket.'},
  mill:{from:'From John (and the Vikings)', name:'Flour', hint:'Tap it to put it in your basket.'},
  icecream:{from:'From Lars (and a rooftop gutter)', name:'Rosemary Maple ice cream', hint:'A bonus! Tap it to put it in your basket.'},
  sprinkles:{from:'From Bryan', name:'Sprinkles', hint:'A bonus! Tap them to put them in your basket.'},
};
let rewardKey=null, rewardThen=null;
function showReward(key,then){   // then: runs after the item lands in the basket
  rewardThen=then||null;
  const r=REWARDS[key], c=$('rewardCanvas'), g=c.getContext('2d');
  g.clearRect(0,0,c.width,c.height); ART[key](g);
  $('rewardFrom').textContent=r.from; $('rewardName').textContent=r.name; $('rewardHint').textContent=r.hint;
  rewardKey=key; paused=true; prompt.hidden=true; $('reward').hidden=false; sfx('reward');
  setTimeout(()=>$('rewardArt').focus({preventScroll:true}),0);
}
function collectReward(){
  if(!rewardKey)return; const key=rewardKey; rewardKey=null;
  have[key]=true; save(); sfx('pop');
  const art=$('rewardArt'), i=ITEMS.findIndex(it=>it.key===key);
  const slot=$('basket').querySelector(`[data-key="${key}"]`), a=art.getBoundingClientRect(), b=slot?slot.getBoundingClientRect():a;
  const done=()=>{$('reward').hidden=true; renderBasket(); const sl=$('basket').querySelector(`[data-key="${key}"]`); sl&&(sl.classList.add('pop'),sparkle(sl)); $('basket').classList.remove('wiggle'); void $('basket').offsetWidth; $('basket').classList.add('wiggle'); paused=false; const f=rewardThen; rewardThen=null; giveKeepsake(key,f)};   // each stop's keepsake (extras.js), then whatever comes next
  const still=matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(still||!art.animate)return done();
  art.style.animation='none';
  art.animate([{transform:'none',opacity:1},{transform:`translate(${b.x+b.width/2-(a.x+a.width/2)}px,${b.y+b.height/2-(a.y+a.height/2)}px) scale(.15)`,opacity:.6}],
    {duration:550,easing:'cubic-bezier(.5,0,.75,0)'}).onfinish=()=>{art.style.animation='';done()};
}
$('rewardArt').onclick=collectReward;
// little gold stars burst out of a basket slot when something lands in it
function sparkle(el){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches||!el.animate)return;
  const r=el.getBoundingClientRect(), cx=r.left+r.width/2, cy=r.top+r.height/2;
  for(let k=0;k<10;k++){
    const s=document.createElement('i'); s.className='spark'; s.style.left=cx+'px'; s.style.top=cy+'px';
    if(k%3===0)s.classList.add('big'); document.body.append(s);
    const a=k/10*Math.PI*2+Math.random()*.4, d=26+Math.random()*22;
    s.animate([{transform:'translate(-50%,-50%) scale(.4)',opacity:1},{transform:`translate(calc(-50% + ${Math.cos(a)*d}px),calc(-50% + ${Math.sin(a)*d}px)) scale(1) rotate(45deg)`,opacity:1,offset:.6},{transform:`translate(calc(-50% + ${Math.cos(a)*d*1.2}px),calc(-50% + ${Math.sin(a)*d*1.2+8}px)) scale(.2) rotate(90deg)`,opacity:0}],
      {duration:700+Math.random()*200,easing:'cubic-bezier(.2,.7,.3,1)'}).onfinish=()=>s.remove();
  }
}

// ---------- start over ----------
// First tap arms it; a second tap within 4 seconds erases saved progress and restarts.
let resetTimer=null;
$('resetBtn').onclick=()=>{
  const b=$('resetBtn');
  if(!b.classList.contains('armed')){
    b.classList.add('armed'); b.textContent='Tap again to erase all progress';
    resetTimer=setTimeout(()=>{b.classList.remove('armed'); b.textContent='Start over'},4000); return;
  }
  clearTimeout(resetTimer);
  try{localStorage.removeItem(SAVE)}catch(e){}
  location.reload();
};
