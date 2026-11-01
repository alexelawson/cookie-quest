// Basket strip, dialog boxes, and what happens at each land.
const $=id=>document.getElementById(id);
const dlg=$('dialog'), prompt=$('prompt');
function renderBasket(){
  $('basket').innerHTML=ITEMS.map(i=>`<span class="slot ${have[i.key]?'got':''}">${have[i.key]?'✓ ':''}${i.label}</span>`).join('')
    +(have.cupcake&&!have.gaveCupcake?'<span class="slot extra">Cupcake</span>':'');
}
// pages: strings shown one at a time. actions: buttons on the last page.
// menu:true lays the buttons out as a grid of choices (used for asking questions).
function showDialog({place,speaker,pages,actions,noteLast,menu}){
  paused=true; prompt.hidden=true; let i=0;
  $('dplace').textContent=place||''; $('dspeaker').textContent=speaker||''; showPortrait(speaker);
  const draw=()=>{
    const t=$('dtext'); t.textContent=pages[i]; t.className=(noteLast&&i===pages.length-1)?'note':'';
    const box=$('dbtns'); box.innerHTML=''; const last=i===pages.length-1; box.classList.toggle('menu',!!menu&&last); dlg.classList.toggle('tall',!!menu&&last);
    const list=i<pages.length-1?[{label:'Next',fn:()=>{i++;draw()}}]:actions;
    list.forEach((a,n)=>{const b=document.createElement('button');b.className='btn'+(a.ghost?' ghost':'');b.textContent=a.label;b.onclick=a.fn;box.appendChild(b); if(n===0)setTimeout(()=>b.focus({preventScroll:true}),0)});
  };
  dlg.hidden=false; draw();
}
function closeDialog(){dlg.hidden=true; paused=false; cv.focus?.()}
const CLOSE={label:'Close',fn:closeDialog};

function openLand(key){
  const s=STORY[key];
  if(have[key]) return showDialog({place:s.place,speaker:s.speaker,pages:[s.again],actions:[CLOSE]});
  showDialog({place:s.place,speaker:s.speaker,pages:[...s.lines,s.mission],actions:[
    {label:'Finish mission (preview)',fn:()=>{have[key]=true;save();renderBasket();
      showDialog({place:s.place,speaker:'Nice!',pages:[s.done+' It\'s in your basket.'],actions:[CLOSE]})}},
    {label:'Later',ghost:true,fn:closeDialog}]});
}
function action(){
  if(!$('titlecard').hidden){start();return}
  if(!$('pump').hidden||!$('shop').hidden||!$('vault').hidden||!$('anagram').hidden)return;   // the pump and shop have their own buttons
  if(!$('reward').hidden){collectReward();return}
  if(!dlg.hidden){const f=document.activeElement, b=$('dbtns').contains(f)?f:$('dbtns').querySelector('button'); b&&b.click(); return}
  if(near)near.act(); else if(scene.ability)scene.ability();
}
function start(){$('titlecard').hidden=true; paused=false}
$('startBtn').onclick=start;

// ---------- reward pop-up ----------
// showReward('farm') shows the item art; tapping it flies it into the basket and marks it collected.
const ART={
  farm(g){ const F=(c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};
    // egg carton
    F('#a9875f',2,16,22,10); F('#c4a173',2,14,22,3); F('#8d6e4a',2,25,22,1);
    for(const [x,c] of [[4,'#fff8ec'],[11,'#e9c9a0'],[18,'#fff8ec']]){F(c,x,9,5,7);F(c,x+1,8,3,1);F('#ffffff',x+1,10,1,2)}
    // butter on a dish
    F('#e6ebef',22,21,17,4); F('#c9d1d8',23,24,15,1);
    F('#f7dd7a',25,14,12,7); F('#fbe9a6',25,14,12,2); F('#e2c35a',36,15,1,6);
    F('#ffffff',27,17,6,3); F('#3d8ad6',28,18,4,1);                    // paper wrapper label
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
  fargo:{from:'From Bob', name:'Sugar', hint:'Tap it to put it in your basket.'},
  city:{from:'From a grateful city', name:'Chocolate', hint:'Tap it to put it in your basket.'},
};
let rewardKey=null;
function showReward(key){
  const r=REWARDS[key], c=$('rewardCanvas'), g=c.getContext('2d');
  g.clearRect(0,0,c.width,c.height); ART[key](g);
  $('rewardFrom').textContent=r.from; $('rewardName').textContent=r.name; $('rewardHint').textContent=r.hint;
  rewardKey=key; paused=true; prompt.hidden=true; $('reward').hidden=false;
  setTimeout(()=>$('rewardArt').focus({preventScroll:true}),0);
}
function collectReward(){
  if(!rewardKey)return; const key=rewardKey; rewardKey=null;
  have[key]=true; save();
  const art=$('rewardArt'), i=ITEMS.findIndex(it=>it.key===key);
  const slot=$('basket').children[i], a=art.getBoundingClientRect(), b=slot?slot.getBoundingClientRect():a;
  const done=()=>{$('reward').hidden=true; renderBasket(); const sl=$('basket').children[i]; sl&&sl.classList.add('pop'); paused=false};
  const still=matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(still||!art.animate)return done();
  art.style.animation='none';
  art.animate([{transform:'none',opacity:1},{transform:`translate(${b.x+b.width/2-(a.x+a.width/2)}px,${b.y+b.height/2-(a.y+a.height/2)}px) scale(.15)`,opacity:.6}],
    {duration:550,easing:'cubic-bezier(.5,0,.75,0)'}).onfinish=()=>{art.style.animation='';done()};
}
$('rewardArt').onclick=collectReward;

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
