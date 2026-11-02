// The locked recipe card: before the baking, Joe types the secret word (from Alex's paper crossword).
// The word and all the text are in PASSWORD (story.js). Capitals and spaces don't matter.
const pw={open:false, then:null};
const pwNorm=t=>String(t).toLowerCase().replace(/[^a-z0-9]/g,'');
function pwSay(t,mood='ok'){ $('pwMsg').textContent=t; const g=$('pwFace').getContext('2d'); g.fillStyle='#e3d6bd'; g.fillRect(0,0,40,40); drawAlexFace(g,mood) }
function openPassword(then){
  const T=PASSWORD; pw.open=true; pw.then=then;
  $('pwTitle').textContent=T.title; $('pwInput').value=''; $('pwInput').placeholder=T.placeholder; $('pwGo').textContent=T.check; $('pwLater').textContent=T.later; $('pwLater').hidden=false;
  pwSay(T.intro); $('xword').hidden=false; paused=true; prompt.hidden=true; sfx('blip');
  setTimeout(()=>$('pwInput').focus({preventScroll:true}),0);
}
function pwCheck(){
  if(have.passwordOk){ closePassword(); pw.then&&pw.then(); return }   // (already unlocked: the button says Let's bake)
  const v=pwNorm($('pwInput').value);
  if(!v){ pwSay(PASSWORD.empty); return }
  if(v!==pwNorm(PASSWORD.word)){ have.pwTries=(have.pwTries||0)+1; save(); sfx('bad'); pwSay(PASSWORD.wrong,'frown'); $('pwInput').select(); return }
  have.passwordOk=true; save(); sfx('fanfare'); pwSay(PASSWORD.right,'happy'); $('pwGo').textContent=PASSWORD.go; $('pwLater').hidden=true; setTimeout(()=>$('pwGo').focus({preventScroll:true}),0);
}
function closePassword(){ pw.open=false; $('xword').hidden=true; paused=overlayOpen() }
$('pwGo').onclick=pwCheck; $('pwLater').onclick=closePassword;
// typing: keep the game's own keys (WASD, Space...) out of the way; Enter checks, Escape closes
addEventListener('keydown',e=>{ if(!pw.open||e.code==='Tab')return; e.stopImmediatePropagation();
  if(e.code==='Enter'){ e.preventDefault(); pwCheck() } else if(e.code==='Escape'){ e.preventDefault(); closePassword() } },true);
