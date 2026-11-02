// The end of the heist: Lars challenges you to anagrams (new letters every game). Beat him, take the chocolate.
// Also: the how-to-play card for the crew.

// ---------- how to play ----------
function openHowTo(){   // agent select: the crew, their roles and powers; pick who leads, then LOCK IN
  const H=HEIST, ids=['hero','lars','john']; let pick=(typeof heist!=='undefined'&&heist.crew[heist.lead])?heist.crew[heist.lead].id:'hero';
  const rows=ids.map(id=>{
    const name=H.crew[id], c=document.createElement('canvas'), p=PORTRAITS[name];
    c.width=c.height=p.size; const g=c.getContext('2d'); g.fillStyle=p.bg; g.fillRect(0,0,p.size,p.size); p.draw(g);
    const row=document.createElement('button'); row.type='button'; row.className='hrow'; row.dataset.id=id;
    const txt=document.createElement('div'); txt.innerHTML=`<i></i><b></b><span></span>`;
    txt.querySelector('i').textContent=H.roles[id]; txt.querySelector('b').textContent=`${name} · ${H.skills[id]}`; txt.querySelector('span').textContent=H.howToSkills[id];
    row.append(c,txt); row.onclick=()=>{pick=id; mark()}; return row;
  });
  const mark=()=>rows.forEach(r=>{const on=r.dataset.id===pick; r.classList.toggle('on',on); r.setAttribute('aria-pressed',on)});
  $('howTitle').textContent=H.howToTitle; $('howRows').replaceChildren(...rows); mark();
  $('howControls').replaceChildren(...[H.howToPick,...H.howToControls].map(t=>{const li=document.createElement('li'); li.textContent=t; return li}));
  $('howOk').textContent=H.howToOk;
  $('howOk').onclick=()=>{ $('howto').hidden=true; paused=false; have.heistHowTo=true; save(); sfx('fanfare');
    const i=heist.crew.findIndex(c=>c.id===pick); if(i>=0&&i!==heist.lead)switchTo(i) };
  paused=true; prompt.hidden=true; $('howto').hidden=false; setTimeout(()=>$('howOk').focus({preventScroll:true}),0);
}


// ---------- the challenge ----------
function openLarsMenu(){
  showDialog({place:HEIST.place,speaker:'Lars',pages:[HEIST.larsPick],actions:[{label:HEIST.larsReady,fn:()=>{closeDialog(); openAnagrams()}}]});
}
function larsGameOver(won){
  if(won){ have.heistStage=5; save(); say(HEIST.larsLoses,()=>showReward('city',heistExit)) }
  else say(HEIST.larsWins,()=>openLarsMenu());
}
