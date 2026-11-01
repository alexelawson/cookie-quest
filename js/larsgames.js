// The end of the heist: Lars challenges you to anagrams (new letters every game). Beat him, take the chocolate.
// Also: the how-to-play card for the crew.

// ---------- how to play ----------
function openHowTo(){
  const H=HEIST, rows=['hero','lars','john'].map(id=>{
    const name=H.crew[id], c=document.createElement('canvas'), p=PORTRAITS[name];
    c.width=c.height=p.size; const g=c.getContext('2d'); g.fillStyle=p.bg; g.fillRect(0,0,p.size,p.size); p.draw(g);
    const row=document.createElement('div'); row.className='hrow';
    const txt=document.createElement('div'); txt.innerHTML=`<b>${H.crew[id]} · ${H.skills[id]}</b><span></span>`; txt.querySelector('span').textContent=H.howToSkills[id];
    row.append(c,txt); return row;
  });
  $('howTitle').textContent=H.howToTitle; $('howRows').replaceChildren(...rows);
  $('howControls').replaceChildren(...H.howToControls.map(t=>{const li=document.createElement('li'); li.textContent=t; return li}));
  $('howOk').textContent=H.howToOk;
  $('howOk').onclick=()=>{ $('howto').hidden=true; paused=false; have.heistHowTo=true; save() };
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
