// Checks the characters: every pixel-grid sprite (*_SPR, JOE_ROWS) has rows of one width and only colors its palette defines,
// and every character draws in every direction (and blinking) without errors and without drawing outside its own area.
// Run: node tests/sprites.js
const {chromium}=require('playwright');const path=require('path');const fs=require('fs');(async()=>{
const R=[];const ok=(n,c,x='')=>R.push((c?'PASS ':'FAIL ')+n+(x?'  ('+x+')':''));
// 1. the grids, read straight from the source
let grids=0; const gridBad=[];
for(const f of fs.readdirSync(path.resolve(__dirname,'../js'))){const s=fs.readFileSync(path.resolve(__dirname,'../js',f),'utf8');
  for(const m of s.matchAll(/const (\w+_SPR|JOE_ROWS)=(\{[\s\S]*?\]\s*,?\s*\});/g)){ let o; try{o=eval('('+m[2]+')')}catch(e){gridBad.push(f+' '+m[1]+': '+e.message); continue}
    const palName=m[1]==='JOE_ROWS'?'JOE_PAL':m[1].replace(/_SPR$/,'_PAL'), pm=s.match(new RegExp('const '+palName+'=(\\{[^;]*?\\});')); const pal=pm?eval('('+pm[1]+')'):null;
    for(const k in o){grids++; const w=new Set(o[k].map(r=>r.length)); if(w.size>1)gridBad.push(`${m[1]}.${k} rows ${o[k].map(r=>r.length).join(',')}`);
      if(pal)for(const r of o[k])for(const ch of r)if(ch!=='.'&&!pal[ch]){gridBad.push(`${m[1]}.${k} has '${ch}' (no color)`); break}}}}
ok(`every sprite grid has even rows and defined colors (${grids} grids)`,grids>15&&!gridBad.length,gridBad.slice(0,4).join('; '));
// 2. drawing every character
const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+path.resolve(__dirname,'../index.html'));await p.click('#startBtn');await p.evaluate(()=>skipWelcome());
const r=await p.evaluate(()=>{paused=true; const out=[]; const D=['down','left','right','up'];
  const who={x:0,y:0,moving:false,step:0}, at=(d,m=false,step=0)=>({...who,x:40,y:60,dir:d,moving:m,step});
  const cases=[['Joe',d=>drawJoeJersey(at(d))],['Joe walking',d=>drawJoeJersey(at(d,true,1))],['Keelan',d=>drawKeelan(at(d,true,1))],['Bryan',d=>drawBryan(40,60,d)],['Jackie',d=>drawJackie(40,60,d)],
    ['Ethan',d=>drawEthan(40,60,d,1)],['Maureen',d=>drawMaureen(40,60,d,1)],['Jack',()=>drawJack(40,60)],['Margie',()=>drawMargie(40,60)],['Lil Q',()=>drawBob(40,60)],
    ['Alex',()=>{drawAlex(40,60,'happy');drawAlex(40,60,'frown');drawAlex(40,60,'ok')}],['attendant',()=>drawAttendant(40,60,2)],['Lars',d=>drawLars(at(d,true,1))],['John',d=>drawJohn(at(d,true,1))],
    ['Dr. Alex',()=>drawStranger(40,60)],['guard',()=>{ctx.translate(40-GUARD.x,0); heist.guardY=60;heist.guardDir=1;drawGuard();heist.guardDir=-1;drawGuard()}],
    ...Object.keys(OUTFIT_LOOK).map(k=>['Joe as '+k,d=>drawHero(at(d,true,1),ctx,OUTFIT_LOOK[k])]),
    ['Vikings',()=>{drawVikingStanding(40,60,'norse','7');drawVikingStanding(40,60,'football','21');drawVikingSkier(40,60,{kind:'norse',sack:true},1);drawVikingSkier(40,60,{kind:'football',num:'52'},0)}],
    ['skiers',()=>{drawSkier(40,60,JOE_RACE_KIT());drawSkier(40,60,{down:true});drawTrailJohn(40,60,'down')}],['Grp',()=>{for(const w of ['world','city','birkie','golf','fargo','kitchen'])drawGrp(40,60,1,w)}]];
  for(const t of [1000,3700*3+20]){ time=t;   // (a normal moment, and mid-blink)
    for(const [name,fn] of cases)for(const d of D){ ctx.setTransform(1,0,0,1,0,0); ctx.clearRect(0,0,VW,VH);
      try{fn(d)}catch(e){out.push(name+' '+d+': '+e.message); continue}
      const px=ctx.getImageData(0,0,VW,VH).data; let x0=VW,x1=0,y0=VH,y1=0,n=0;
      for(let y=0;y<VH;y++)for(let x=0;x<VW;x++)if(px[(y*VW+x)*4+3]>0){n++; if(x<x0)x0=x; if(x>x1)x1=x; if(y<y0)y0=y; if(y>y1)y1=y}
      if(!n)out.push(name+' '+d+': drew nothing'); else if(x1-x0>40||y1-y0>48)out.push(name+' '+d+`: drew ${x1-x0}x${y1-y0} px (too big)`)} }
  return out});
ok('every character draws in every direction (and mid-blink) without errors, at a sensible size',!r.length&&!errs.length,[...r,...errs].slice(0,5).join('; '));
console.log(R.join('\n')); console.log('page errors:',errs.length?errs:'none'); await b.close(); process.exit(R.some(l=>l.startsWith('FAIL'))||errs.length?1:0)})();
