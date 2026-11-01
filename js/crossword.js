// The smudged recipe card: a crossword you solve before the baking starts.
// The words and clues are in CROSSWORD (story.js). The grid lays itself out from those words,
// so you can change, add or remove words and it will still fit them together.

// ---------- layout: fit the words into a grid, crossing wherever letters match ----------
function xwLayout(list){
  const words=list.map(w=>({...w,answer:w.answer.toUpperCase().replace(/[^A-Z]/g,'')})).filter(w=>w.answer.length>1);
  let seed=7; const rand=()=>{seed=(seed*16807)%2147483647; return seed/2147483647};
  let best=null;
  for(let attempt=0;attempt<80;attempt++){
    const order=[...words].sort((a,b)=>b.answer.length-a.answer.length);
    if(attempt)for(let i=order.length-1;i>1;i--){const j=1+Math.floor(rand()*i); [order[i],order[j]]=[order[j],order[i]]}
    const grid=new Map(), key=(x,y)=>x+','+y, at=(x,y)=>grid.get(key(x,y));
    const fits=(a,x,y,dir)=>{
      const dx=dir==='across'?1:0, dy=1-dx; if(at(x-dx,y-dy)||at(x+dx*a.length,y+dy*a.length))return -1;
      let cross=0;
      for(let i=0;i<a.length;i++){const cx=x+dx*i, cy=y+dy*i, c=at(cx,cy);
        if(c){ if(c.ch!==a[i]||c.dirs.includes(dir))return -1; cross++ }
        else if(at(cx+dy,cy+dx)||at(cx-dy,cy-dx))return -1 }
      return cross;
    };
    const put=(w,x,y,dir)=>{const dx=dir==='across'?1:0, dy=1-dx;
      for(let i=0;i<w.answer.length;i++){const k=key(x+dx*i,y+dy*i), c=grid.get(k)||{ch:w.answer[i],dirs:[]}; c.dirs.push(dir); grid.set(k,c)}
      placed.push({...w,x,y,dir})};
    const placed=[]; put(order[0],0,0,'across');
    for(const w of order.slice(1)){
      let pick=null;
      for(const [k,c] of grid)for(let i=0;i<w.answer.length;i++){ if(w.answer[i]!==c.ch)continue;
        const [gx,gy]=k.split(',').map(Number);
        for(const dir of ['across','down']){ const x=dir==='across'?gx-i:gx, y=dir==='down'?gy-i:gy, n=fits(w.answer,x,y,dir); if(n<1)continue;
          const xs=[...grid.keys()].map(s=>+s.split(',')[0]).concat([x,x+(dir==='across'?w.answer.length-1:0)]), ys=[...grid.keys()].map(s=>+s.split(',')[1]).concat([y,y+(dir==='down'?w.answer.length-1:0)]);
          const W=Math.max(...xs)-Math.min(...xs)+1, H=Math.max(...ys)-Math.min(...ys)+1, score=n*40-W*H-Math.abs(W-H*1.4)*6;
          if(!pick||score>pick.score)pick={x,y,dir,score} } }
      if(pick)put(w,pick.x,pick.y,pick.dir);
    }
    const xs=[...grid.keys()].map(s=>+s.split(',')[0]), ys=[...grid.keys()].map(s=>+s.split(',')[1]);
    const W=Math.max(...xs)-Math.min(...xs)+1, H=Math.max(...ys)-Math.min(...ys)+1;
    const score=placed.length*10000-W*H-(W>11?500:0);
    if(!best||score>best.score)best={score,placed,minX:Math.min(...xs),minY:Math.min(...ys),W,H,grid};
  }
  // shift to 0,0 and number the starts like a newspaper crossword
  const {placed,minX,minY,W,H}=best; placed.forEach(p=>{p.x-=minX; p.y-=minY});
  const starts=[...new Set(placed.map(p=>p.y*100+p.x))].sort((a,b)=>a-b);
  placed.forEach(p=>p.num=starts.indexOf(p.y*100+p.x)+1);
  placed.sort((a,b)=>a.num-b.num);
  const cells=[]; for(let y=0;y<H;y++)for(let x=0;x<W;x++)cells.push(null);
  placed.forEach((p,wi)=>{const dx=p.dir==='across'?1:0, dy=1-dx;
    for(let i=0;i<p.answer.length;i++){const ci=(p.y+dy*i)*W+p.x+dx*i; cells[ci]=cells[ci]||{ch:p.answer[i],words:[]}; cells[ci].words.push(wi)}});
  const missing=words.filter(w=>!placed.some(p=>p.answer===w.answer)).map(w=>w.answer);
  if(missing.length)console.warn('Crossword: could not fit',missing);
  return {W,H,words:placed,cells,missing};
}

// ---------- the card ----------
const xw={open:false, L:null, word:0, cell:-1, then:null, solved:false};
function xwSay(t,mood='ok'){ $('xwMsg').textContent=t; const g=$('xwFace').getContext('2d'); g.fillStyle='#e3d6bd'; g.fillRect(0,0,40,40); drawAlexFace(g,mood) }
function openCrossword(then){
  const C=CROSSWORD; xw.L=xw.L||xwLayout(C.words); xw.then=then; xw.open=true; xw.solved=false;
  const {W,H,cells,words}=xw.L, saved=(have.xw||'').split('');
  $('xwTitle').textContent=C.title; $('xwCheck').textContent=C.check; $('xwHint').textContent=C.hint; $('xwLater').textContent=C.later;
  const grid=$('xwGrid'), cs=Math.max(18,Math.min(28,Math.floor(300/W)));
  grid.style.setProperty('--cs',cs+'px'); grid.style.gridTemplateColumns=`repeat(${W},${cs}px)`; grid.replaceChildren();
  cells.forEach((c,i)=>{const d=document.createElement('div'); d.className='xcell'+(c?'':' blank');
    if(c){ const n=words.find(w=>w.y*W+w.x===i); if(n){const s=document.createElement('span'); s.textContent=n.num; d.append(s)}
      const inp=document.createElement('input'); inp.maxLength=1; inp.autocomplete='off'; inp.spellcheck=false; inp.setAttribute('autocapitalize','characters'); inp.setAttribute('aria-label','letter');
      inp.value=(saved[i]&&saved[i]!=='.')?saved[i]:'';
      inp.addEventListener('pointerdown',e=>{e.preventDefault(); xwTap(i)});
      inp.addEventListener('input',()=>{const v=inp.value.toUpperCase().replace(/[^A-Z]/g,''); xwType(v.slice(-1))});
      d.append(inp) }
    grid.append(d)});
  const lists=$('xwLists'); lists.replaceChildren(...['across','down'].map(dir=>{const col=document.createElement('div'); const h=document.createElement('b'); h.textContent=dir==='across'?C.across:C.down; col.append(h);
    words.forEach((w,wi)=>{if(w.dir!==dir)return; const p=document.createElement('p'); p.dataset.w=wi; p.textContent=`${w.num}. ${w.clue} (${w.answer.length})`; p.onclick=()=>{xw.word=wi; xwFocus(w.y*W+w.x)}; col.append(p)}); return col}));
  xwSay(C.intro); $('xword').hidden=false; paused=true; prompt.hidden=true; sfx('blip');
  xw.word=0; xwFocus(words[0].y*W+words[0].x);
}
const xwInputs=()=>[...$('xwGrid').children].map(d=>d.querySelector('input'));
const xwCellsOf=wi=>{const w=xw.L.words[wi], dx=w.dir==='across'?1:0, dy=1-dx; return [...w.answer].map((_,i)=>(w.y+dy*i)*xw.L.W+w.x+dx*i)};
function xwFocus(i){
  xw.cell=i; const c=xw.L.cells[i]; if(!c.words.includes(xw.word))xw.word=c.words[0];
  const on=new Set(xwCellsOf(xw.word)), ins=xwInputs();
  [...$('xwGrid').children].forEach((d,k)=>{d.classList.toggle('on',on.has(k)); d.classList.toggle('focus',k===i)});
  const w=xw.L.words[xw.word]; $('xwClue').textContent=`${w.num} ${w.dir==='across'?CROSSWORD.across:CROSSWORD.down}: ${w.clue}`;
  $('xwLists').querySelectorAll('p').forEach(p=>{p.classList.toggle('cur',+p.dataset.w===xw.word); p.classList.toggle('done',xwCellsOf(+p.dataset.w).every(k=>ins[k].value))});
  ins[i].focus({preventScroll:true});
}
function xwTap(i){ const c=xw.L.cells[i]; if(i===xw.cell&&c.words.length>1)xw.word=c.words.find(w=>w!==xw.word); else if(!c.words.includes(xw.word))xw.word=c.words[0]; xwFocus(i) }
function xwSave(){ have.xw=xwInputs().map(n=>n&&n.value?n.value:'.').join(''); save() }
function xwStep(d){ const cs=xwCellsOf(xw.word), k=cs.indexOf(xw.cell)+d; if(k>=0&&k<cs.length)xwFocus(cs[k]) }
function xwType(ch){
  if(xw.solved||xw.cell<0)return; const inp=xwInputs()[xw.cell]; inp.value=ch||''; inp.parentNode.classList.remove('bad');
  if(ch){ sfx('click'); xwStep(1) } else xwFocus(xw.cell);
  xwSave(); if(xwInputs().every((n,k)=>!n||n.value===xw.L.cells[k].ch))xwSolved();
}
function xwBack(){ const inp=xwInputs()[xw.cell]; if(inp.value){inp.value=''; xwSave(); xwFocus(xw.cell)} else { xwStep(-1); xwInputs()[xw.cell].value=''; xwSave(); xwFocus(xw.cell) } }
function xwArrow(dx,dy){ const {W,H,cells}=xw.L; let x=xw.cell%W, y=xw.cell/W|0;
  for(;;){x+=dx; y+=dy; if(x<0||y<0||x>=W||y>=H)return; const c=cells[y*W+x]; if(c){ const want=dx?'across':'down', w=c.words.find(wi=>xw.L.words[wi].dir===want); if(w!=null)xw.word=w; xwFocus(y*W+x); return } } }
function xwCheck(){
  if(xw.solved){ closeCrossword(); xw.then&&xw.then(); return }
  const ins=xwInputs(); let wrong=0, empty=0;
  ins.forEach((n,k)=>{ if(!n)return; if(!n.value)empty++; else if(n.value!==xw.L.cells[k].ch){wrong++; n.parentNode.classList.add('bad')} });
  if(!wrong&&!empty)return xwSolved();
  sfx(wrong?'bad':'blip'); xwSay(wrong?CROSSWORD.wrong(wrong):CROSSWORD.empty,wrong?'frown':'ok');
}
function xwHint(){
  if(xw.solved)return; const ins=xwInputs(), k=xwCellsOf(xw.word).find(k=>ins[k].value!==xw.L.cells[k].ch);
  if(k==null)return xwSay(CROSSWORD.wordDone,'happy');
  ins[k].value=xw.L.cells[k].ch; ins[k].parentNode.classList.add('hint'); ins[k].parentNode.classList.remove('bad'); sfx('ding'); xwSay(CROSSWORD.hintSay,'happy'); xwSave(); xwFocus(k);
  if(ins.every((n,j)=>!n||n.value===xw.L.cells[j].ch))xwSolved();
}
function xwSolved(){
  xw.solved=true; have.crossword=true; save(); sfx('fanfare');
  [...$('xwGrid').children].forEach(d=>{d.classList.remove('bad','on','focus'); if(!d.classList.contains('blank'))d.classList.add('ok')});
  xwSay(CROSSWORD.solved,'happy'); $('xwClue').textContent=CROSSWORD.solvedClue; $('xwCheck').textContent=CROSSWORD.go; $('xwHint').hidden=true; $('xwLater').hidden=true;
  setTimeout(()=>$('xwCheck').focus({preventScroll:true}),0);
}
function closeCrossword(){ xw.open=false; $('xword').hidden=true; $('xwHint').hidden=false; $('xwLater').hidden=false; paused=false }
$('xwCheck').onclick=xwCheck; $('xwHint').onclick=xwHint; $('xwLater').onclick=()=>{closeCrossword(); xwSave()};
// typing: letters fill the box and move along the word, Backspace goes back, arrows move, Enter checks
addEventListener('keydown',e=>{ if(!xw.open)return; if(e.code==='Tab')return;
  const t=e.target, onBtn=t&&t.tagName==='BUTTON';
  e.stopImmediatePropagation();
  if(onBtn&&['Enter','Space'].includes(e.code))return;   // let the button click
  if(/^[a-zA-Z]$/.test(e.key)){ e.preventDefault(); xwType(e.key.toUpperCase()) }
  else if(e.code==='Backspace'||e.code==='Delete'){ e.preventDefault(); xwBack() }
  else if(e.code==='Enter'){ e.preventDefault(); xwCheck() }
  else if(e.code==='ArrowLeft'){e.preventDefault(); xwArrow(-1,0)} else if(e.code==='ArrowRight'){e.preventDefault(); xwArrow(1,0)}
  else if(e.code==='ArrowUp'){e.preventDefault(); xwArrow(0,-1)} else if(e.code==='ArrowDown'){e.preventDefault(); xwArrow(0,1)}
  else if(e.code==='Escape'){ e.preventDefault(); $('xwLater').click() }
},true);
