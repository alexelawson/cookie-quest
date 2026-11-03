// Checks the look and feel: embedded fonts, the layout fits a laptop screen and a phone, the title screen draws,
// dialog text types out (and Space / A finish the line before pressing a button), the Settings switches work,
// and the basket sparkles when something lands in it. Run: node tests/ui.js
const {chromium}=require('playwright');const path=require('path');(async()=>{
const R=[];const ok=(n,c,x='')=>R.push((c?'PASS ':'FAIL ')+n+(x?'  ('+x+')':''));
const b=await chromium.launch(); const errs=[]; const url='file://'+path.resolve(__dirname,'../index.html');
// --- laptop ---
let ctx=await b.newContext({viewport:{width:1280,height:800}}); let p=await ctx.newPage(); p.on('pageerror',e=>errs.push(e.message));
await p.goto(url); await p.waitForTimeout(600);
let r=await p.evaluate(async()=>{ await document.fonts.ready;
  const box=id=>document.querySelector(id).getBoundingClientRect();
  const s=box('.screen'), bk=box('#basket'), h=box('h1');
  const tc=$('titleArt').getContext('2d').getImageData(0,0,128,96).data; let colors=new Set(); for(let i=0;i<tc.length;i+=4*7)colors.add(tc[i]+','+tc[i+1]+','+tc[i+2]);
  return {pix:document.fonts.check('16px "Pixelify Sans"'), body:document.fonts.check('16px Nunito'), bottom:s.bottom, mid:s.left+s.width/2, bmid:bk.left+bk.width/2, hmid:h.left+h.width/2, colors:colors.size,
    google:[...document.querySelectorAll('link')].some(l=>/googleapis/.test(l.href))};
});
ok('A both fonts are embedded and load with no internet',r.pix&&r.body&&!r.google,JSON.stringify(r));
ok('A the game window fits on a 1280x800 laptop screen',r.bottom<=800,'bottom '+r.bottom);
ok('A title, basket and game share one center line',Math.abs(r.mid-r.bmid)<2&&Math.abs(r.mid-r.hmid)<2,`${r.mid} ${r.bmid} ${r.hmid}`);
ok('B the title screen draws the snowy night (lots of colors, so Joe, Grp, the kitchen and the tree are there)',r.colors>25,r.colors+' colors');
await p.mouse.click(5,5); await p.waitForTimeout(100); r=await p.evaluate(()=>song);
ok('B the title screen has its own music once you tap anything',r==='title',String(r));
// typewriter
await p.click('#startBtn'); await p.evaluate(()=>skipWelcome());
r=await p.evaluate(()=>{ window.uiHit=0; showDialog({speaker:'Keelan',pages:['Hey. You here about the eggs? Because we have got a situation...'],actions:[{label:'Okay',fn:()=>{uiHit++;closeDialog()}}]});
  const sp=$('dtext').children; return {full:$('dtext').textContent, shown:sp[0].textContent.length, tag:getComputedStyle($('dspeaker')).display, tagTop:$('dspeaker').getBoundingClientRect().top<$('dialog').getBoundingClientRect().top} });
ok('C the whole line is in the box from the start (only the shown part is visible)',r.full.startsWith('Hey. You here')&&r.shown<r.full.length,JSON.stringify(r));
ok('C the speaker\'s name sits in a tab on top of the box',r.tag!=='none'&&r.tagTop,JSON.stringify(r));
await p.waitForTimeout(250); const mid=await p.evaluate(()=>$('dtext').children[0].textContent.length);
await p.keyboard.press('Space'); await p.waitForTimeout(80);
r=await p.evaluate(()=>({shown:$('dtext').children[0].textContent.length, len:$('dtext').textContent.length, open:!dlg.hidden, hit:uiHit}));
ok('C it types out letter by letter',mid>3&&mid<r.len,mid+' of '+r.len);
ok('C Space finishes the line first, without pressing the button',r.shown===r.len&&r.open&&r.hit===0,JSON.stringify(r));
await p.keyboard.press('Space'); await p.waitForTimeout(80);
r=await p.evaluate(()=>({open:!dlg.hidden, hit:uiHit}));
ok('C ...and a second Space presses the button',!r.open&&r.hit===1,JSON.stringify(r));
r=await p.evaluate(()=>{ window.uiHit=0; showDialog({speaker:'Lars',pages:['One. Two. Three. Four. Five. Six. Seven.','Page two.'],actions:[{label:'Done',fn:()=>{uiHit++;closeDialog()}}]});
  action(); const a=$('dtext').children[0].textContent; action(); const b=$('dtext').textContent; action(); action(); return {a,b,hit:uiHit,open:!dlg.hidden} });
ok('C the A button does the same: finish, then next page, then the button',r.a.endsWith('Seven.')&&r.b==='Page two.'&&r.hit===1&&!r.open,JSON.stringify(r));
// settings switches
r=await p.evaluate(()=>{ openSettings(); const s=$('soundToggle'), was=muted; s.click(); const after=muted; const m=$('musicToggle').disabled; s.click(); const back=muted;
  const look=getComputedStyle(s).appearance; closeSettings(); return {was,after,back,m,look} });
ok('D Settings: Sound and Music are switches, and Sound off also turns Music off',r.look==='none'&&r.after!==r.was&&r.back===r.was&&(r.after?r.m:!r.m),JSON.stringify(r));
// basket sparkle
r=await p.evaluate(async()=>{ showReward('golf'); collectReward(); await new Promise(res=>setTimeout(res,640));
  return {sparks:document.querySelectorAll('.spark').length, wiggle:$('basket').classList.contains('wiggle'), got:!!have.golf} });
ok('E the basket wiggles and sparkles when the milk lands in it',r.sparks>=6&&r.wiggle&&r.got,JSON.stringify(r));
await p.waitForTimeout(1300); r=await p.evaluate(()=>document.querySelectorAll('.spark').length);
ok('E ...and the sparkles clean themselves up',r===0,r+' left');
await ctx.close();
// --- phone ---
ctx=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true}); p=await ctx.newPage(); p.on('pageerror',e=>errs.push(e.message));
await p.goto(url); await p.waitForTimeout(500);
r=await p.evaluate(()=>{const t=$('startBtn').getBoundingClientRect(), s=document.querySelector('.screen').getBoundingClientRect();
  return {scroll:document.documentElement.scrollWidth, start:t.bottom<=s.bottom&&t.top>=s.top, basket:$('basket').getBoundingClientRect().right<=390}});
ok('F phone: no sideways scrolling, the basket fits, and Start is on the title screen',r.scroll<=390&&r.basket&&r.start,JSON.stringify(r));
await p.tap('#startBtn'); await p.evaluate(()=>skipWelcome());
r=await p.evaluate(()=>{ window.uiHit=0;  showDialog({speaker:'Margie',pages:['Oh hey! You here for the milk? Cool cool cool.'],actions:[{label:'Okay',fn:()=>{uiHit++;closeDialog()}}]}); return 1});
await p.tap('#dtext'); await p.waitForTimeout(60);
r=await p.evaluate(()=>({shown:$('dtext').children[0].textContent.length, len:$('dtext').textContent.length, hit:uiHit}));
ok('F phone: tapping the box finishes the line',r.shown===r.len&&r.hit===0,JSON.stringify(r));
await b.close();
console.log(R.join('\n')); console.log('page errors: '+(errs.length?errs.join(' | '):'none'));
})();
