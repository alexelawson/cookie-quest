// The laser panel: Doc Alex's gadget shows a pattern of lit squares for a moment, then Joe lights the same squares from memory.
// Each round the board gets bigger AND more squares light up. A wrong square flashes red and that round starts over with a new pattern.
// Words live in story.js (HEIST.grid...).
const LGRID={ROUNDS:[{size:5,n:7},{size:6,n:10},{size:7,n:14}], SHOW_MS:2200};   // each round: the board (size x size) and how many squares light up; how long you get to look
const lg={open:false, round:0, want:new Set(), got:new Set(), phase:'', t:0, size:5};
function openLaserGrid(){
  Object.assign(lg,{open:true, round:0}); $('gridTitle').textContent=HEIST.gridTitle;
  $('lasergrid').hidden=false; paused=true; prompt.hidden=true; sfx('click');
  gridRound();
}
function gridBoard(size){   // (re)build the buttons for this round's board
  lg.size=size; const grid=$('lgrid'); grid.style.setProperty('--cols',size); grid.style.setProperty('--sq',size>=7?'34px':size>=6?'38px':'44px');
  grid.replaceChildren(...Array.from({length:size*size},(_,i)=>{const b=document.createElement('button'); b.type='button'; b.className='lsq'; b.dataset.i=i; b.setAttribute('aria-label','Square '+(i+1)); b.onclick=()=>gridTap(i); return b}));
}
function gridRound(){
  const R=LGRID.ROUNDS[lg.round]; if(lg.size!==R.size||!$('lgrid').children.length||$('lgrid').children.length!==R.size*R.size)gridBoard(R.size);
  const all=[...Array(R.size*R.size).keys()];
  lg.want=new Set(); while(lg.want.size<R.n)lg.want.add(all[Math.random()*all.length|0]);
  lg.got=new Set(); lg.phase='watch'; $('gridMsg').textContent=HEIST.gridWatch; gridPaint(); sfx('type',700);
  clearTimeout(lg.t); lg.t=setTimeout(()=>{ if(!lg.open)return; lg.phase='play'; $('gridMsg').textContent=HEIST.gridGo; gridPaint(); const b=$('lgrid').children[0]; b&&b.focus({preventScroll:true}) },LGRID.SHOW_MS);
}
function gridPaint(bad){
  [...$('lgrid').children].forEach((b,i)=>{ b.classList.toggle('lit',lg.phase==='watch'?lg.want.has(i):lg.got.has(i)); b.classList.toggle('bad',bad===i); b.disabled=lg.phase!=='play' });
  $('gdots').replaceChildren(...LGRID.ROUNDS.map((_,k)=>{const d=document.createElement('i'); d.className=k<lg.round?'done':k===lg.round?'now':''; return d}));
}
function gridTap(i){
  if(lg.phase!=='play'||lg.got.has(i))return;
  if(!lg.want.has(i)){ sfx('bad'); lg.phase='oops'; $('gridMsg').textContent=HEIST.gridWrong; gridPaint(i); clearTimeout(lg.t); lg.t=setTimeout(()=>{ if(lg.open)gridRound() },900); return }
  lg.got.add(i); sfx('type',400+lg.got.size*60); gridPaint();
  if(lg.got.size===lg.want.size){
    lg.round++; sfx('good');
    if(lg.round>=LGRID.ROUNDS.length){ lg.phase='done'; clearTimeout(lg.t); lg.t=setTimeout(()=>{ closeLaserGrid(); lasersOffNow() },500); return }
    lg.phase='between'; $('gridMsg').textContent=HEIST.gridNext; clearTimeout(lg.t); lg.t=setTimeout(()=>{ if(lg.open)gridRound() },900);
  }
}
function closeLaserGrid(){ lg.open=false; clearTimeout(lg.t); $('lasergrid').hidden=true; paused=false }
