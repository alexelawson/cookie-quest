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
  $('dplace').textContent=place||''; $('dspeaker').textContent=speaker||'';
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
  if(!$('reward').hidden){collectReward();return}
  if(!dlg.hidden){const f=document.activeElement, b=$('dbtns').contains(f)?f:$('dbtns').querySelector('button'); b&&b.click(); return}
  if(near)near.act();
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
};
const REWARDS={farm:{from:'From Keelan', name:'Eggs & butter', hint:'Tap them to put them in your basket.'}};
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
