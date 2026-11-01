// TESTING ONLY: "skip to the end" buttons in Settings.
// To remove before giving the game to Joe: delete this file and its one script line in index.html. Nothing else uses it.
(function(){
  const box=document.createElement('div'); box.className='devskip';
  const label=document.createElement('small'); label.textContent='Testing';
  const mk=(text,fn)=>{const b=document.createElement('button'); b.className='btn ghost'; b.textContent=text; b.onclick=()=>{ $('settings').hidden=true; paused=false; fn() }; return b};
  // every ingredient in the basket, then into the kitchen (crossword, baking and the party are still yours to play)
  const ingredients=mk('Skip to the kitchen',()=>{ for(const i of ITEMS)have[i.key]=true; have.welcomed=true; save(); renderBasket(); goTo('kitchen','fromDoor') });
  // straight to the credits, stats, album and note
  const ending=mk('Skip to the ending',()=>{ for(const i of ITEMS)have[i.key]=true; Object.assign(have,{welcomed:true,crossword:true,baked:true,crown:true}); save(); renderBasket(); goTo('kitchen','fromDoor'); setTimeout(openEnding,900) });
  box.append(label,ingredients,ending);
  $('settingsClose').before(box);
})();
