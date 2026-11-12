// The memory panel: a pattern of lit squares shows for a moment, then Joe lights the same squares from memory.
// Each round has more squares. A wrong square flashes red and that round starts over with a new pattern.
// Two locks use it: the laser panel on roof C, and (harder) the Confectioner's chocolate safe. Words live in story.js (HEIST.grid... / HEIST.safe...).
const LGRID={SIZE:5, ROUNDS:[6,8,10], SHOW_MS:2400};          // laser panel: a 5x5 grid; how many squares light up each round; how long you get to look
const SAFE_GRID={SIZE:6, ROUNDS:[7,9,11,13], SHOW_MS:2200};   // the chocolate safe: bigger grid, four rounds, more squares, less time to look
const lg={open:false, round:0, want:new Set(), got:new Set(), phase:'', t:0, cfg:LGRID, done:null};
function openLaserGrid(cfg,title,done){
  cfg=cfg||LGRID; Object.assign(lg,{open:true, round:0, cfg, done:done||lasersOffNow}); $('gridTitle').textContent=title||HEIST.gridTitle;
  const grid=$('lgrid'); grid.style.setProperty('--cols',cfg.SIZE); grid.replaceChildren(...Array.from({length:cfg.SIZE*cfg.SIZE},(_,i)=>{const b=document.createElement('button'); b.type='button'; b.className='lsq'; b.dataset.i=i; b.setAttribute('aria-label','Square '+(i+1)); b.onclick=()=>gridTap(i); return b}));
  $('lasergrid').hidden=false; paused=true; prompt.hidden=true; sfx('click');
  gridRound();
}
function gridRound(){
  const n=lg.cfg.ROUNDS[lg.round], all=[...Array(lg.cfg.SIZE*lg.cfg.SIZE).keys()];
  lg.want=new Set(); while(lg.want.size<n)lg.want.add(all[Math.random()*all.length|0]);
  lg.got=new Set(); lg.phase='watch'; $('gridMsg').textContent=HEIST.gridWatch; gridPaint(); sfx('type',700);
  clearTimeout(lg.t); lg.t=setTimeout(()=>{ if(!lg.open)return; lg.phase='play'; $('gridMsg').textContent=HEIST.gridGo; gridPaint(); const b=$('lgrid').children[0]; b&&b.focus({preventScroll:true}) },lg.cfg.SHOW_MS);
}
function gridPaint(bad){
  [...$('lgrid').children].forEach((b,i)=>{ b.classList.toggle('lit',lg.phase==='watch'?lg.want.has(i):lg.got.has(i)); b.classList.toggle('bad',bad===i); b.disabled=lg.phase!=='play' });
  $('gdots').replaceChildren(...lg.cfg.ROUNDS.map((_,k)=>{const d=document.createElement('i'); d.className=k<lg.round?'done':k===lg.round?'now':''; return d}));
}
function gridTap(i){
  if(lg.phase!=='play'||lg.got.has(i))return;
  if(!lg.want.has(i)){ sfx('bad'); lg.phase='oops'; $('gridMsg').textContent=HEIST.gridWrong; gridPaint(i); clearTimeout(lg.t); lg.t=setTimeout(()=>{ if(lg.open)gridRound() },900); return }
  lg.got.add(i); sfx('type',400+lg.got.size*80); gridPaint();
  if(lg.got.size===lg.want.size){
    lg.round++; sfx('good');
    if(lg.round>=lg.cfg.ROUNDS.length){ lg.phase='done'; clearTimeout(lg.t); const done=lg.done; lg.t=setTimeout(()=>{ closeLaserGrid(); done() },500); return }
    lg.phase='between'; $('gridMsg').textContent=HEIST.gridNext; clearTimeout(lg.t); lg.t=setTimeout(()=>{ if(lg.open)gridRound() },900);
  }
}
function closeLaserGrid(){ lg.open=false; clearTimeout(lg.t); $('lasergrid').hidden=true; paused=false }
