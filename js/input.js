// Keyboard and touch controls.
const dirs={up:false,down:false,left:false,right:false};
const KEYMAP={ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down',ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right'};
addEventListener('keydown',e=>{
  if(!$('reward').hidden&&KEYMAP[e.code]){e.preventDefault();return}
  if(!dlg.hidden&&KEYMAP[e.code]){ // arrows move between dialog buttons
    const bs=[...$('dbtns').querySelectorAll('button')], i=bs.indexOf(document.activeElement), d=KEYMAP[e.code];
    const n=bs.length, step=(d==='down'||d==='right')?1:-1; if(n)bs[(i+step+n)%n].focus({preventScroll:true});
    e.preventDefault(); return}
  if(dlg.hidden&&!paused&&scene.key&&scene.key(e.code)){e.preventDefault();return}
  if(KEYMAP[e.code]){dirs[KEYMAP[e.code]]=true;e.preventDefault()}
  if(['Space','Enter','KeyE'].includes(e.code)){if(document.activeElement&&document.activeElement.tagName==='BUTTON'&&(!dlg.hidden||!$('reward').hidden||!$('shop').hidden||!$('vault').hidden||!$('anagram').hidden||!$('howto').hidden||!$('wardrobe').hidden||!$('bake').hidden||!$('settings').hidden))return; e.preventDefault(); action()}
});
let actionHeld=false;   // the action button held down (the heist's defuse)
addEventListener('keydown',e=>{if(['Space','Enter','KeyE'].includes(e.code))actionHeld=true},true);
addEventListener('keyup',e=>{if(KEYMAP[e.code])dirs[KEYMAP[e.code]]=false; if(['Space','Enter','KeyE'].includes(e.code))actionHeld=false});
addEventListener('blur',()=>{for(const k in dirs)dirs[k]=false; actionHeld=false});
document.querySelectorAll('.pad button').forEach(b=>{
  const d=b.dataset.dir, on=e=>{e.preventDefault();dirs[d]=true;b.classList.add('on')}, off=()=>{dirs[d]=false;b.classList.remove('on')};
  b.addEventListener('pointerdown',on); ['pointerup','pointerleave','pointercancel'].forEach(t=>b.addEventListener(t,off));
});
document.getElementById('abtn').addEventListener('pointerdown',e=>{e.preventDefault();actionHeld=true;action()});
['pointerup','pointerleave','pointercancel'].forEach(t=>document.getElementById('abtn').addEventListener(t,()=>{actionHeld=false}));
