// Basket strip, dialog boxes, and what happens at each land and the kitchen.
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
function openKitchen(){
  const missing=ITEMS.filter(i=>!have[i.key]).map(i=>i.label);
  if(missing.length) return showDialog({place:KITCHEN.place,speaker:KITCHEN.speaker,pages:[KITCHEN.missing+' '+missing.join(', ')+'.'],actions:[CLOSE]});
  showDialog({place:KITCHEN.place,speaker:KITCHEN.speaker,pages:[...KITCHEN.ready,KITCHEN.finale,KITCHEN.note],noteLast:true,actions:[
    {label:'Play again',fn:()=>{have={};save();renderBasket();P.x=192;P.y=156;closeDialog()}},
    {label:'Keep walking',ghost:true,fn:closeDialog}]});
}
function action(){
  if(!$('titlecard').hidden){start();return}
  if(!dlg.hidden){const f=document.activeElement, b=$('dbtns').contains(f)?f:$('dbtns').querySelector('button'); b&&b.click(); return}
  if(!near)return;
  if(near.key==='kitchen')openKitchen(); else if(near.key==='keelan')talkToKeelan(); else openLand(near.key);
}
function start(){$('titlecard').hidden=true; paused=false}
$('startBtn').onclick=start;
