// Things that tend to break in a finished game: small phone screens, odd saves, menus on top of menus,
// leaving a place halfway through something. Run: node tests/robustness.js
const {chromium}=require('playwright');const path=require('path');(async()=>{
const b=await chromium.launch();const URL='file://'+path.resolve(__dirname,'../index.html');
const R=[];const ok=(n,c,x='')=>R.push((c?'PASS ':'FAIL ')+n+(x?'  ('+x+')':''));const allErrs=[];
const page=async(vp={width:900,height:760},opts={})=>{const ctxt=await b.newContext({viewport:vp,hasTouch:!!opts.touch,isMobile:!!opts.touch}); const p=await ctxt.newPage(); p.errs=[]; p.on('pageerror',e=>{p.errs.push(e.message);allErrs.push(e.message)}); if(opts.init)await p.addInitScript(opts.init); return p};
const fresh=async(p,st={welcomed:true})=>{await p.goto(URL); await p.evaluate(s=>{localStorage.clear(); localStorage.setItem('cookie-quest-v1',JSON.stringify(s))},st); await p.reload(); await p.click('#startBtn'); await p.waitForTimeout(100)};
const ALL={welcomed:true,farm:1,mill:1,city:1,fargo:1,golf:1};

// A. every pop-up fits a phone: its main button can be reached (scrolling inside the pop-up if needed) and isn't covered
const OVERLAYS=[
  ['dialog (long, with a menu)', ALL, ()=>showDialog({place:'Somewhere',speaker:'Keelan',pages:['A fairly long line of text that goes on for a while, the way Keelan does when he gets going about hens and eggs and butter.'],menu:true,actions:[1,2,3,4,5,6].map(i=>({label:'Question number '+i,fn:closeDialog}))}), '#dbtns button:last-child'],
  ['reward', ALL, ()=>showReward('farm'), '#rewardArt'],
  ['wardrobe', ALL, ()=>openWardrobe(()=>{},'look'), '#wardGo'],
  ['settings', ALL, ()=>$('settingsBtn').click(), '#settingsClose'],
  ['how to play (heist)', ALL, ()=>{goTo('city','start'); setTimeout(openHowTo,900)}, '#howOk', 1200],
  ['gas pump', ALL, ()=>{goTo('fargo','fromHighway'); setTimeout(()=>{try{closeDialog()}catch(e){} openPump()},900)}, '#pumpBtn', 1200],
  ['snack shop', ALL, ()=>{goTo('fargo','fromHighway'); setTimeout(()=>{try{closeDialog()}catch(e){} have.fargoStage='store'; parkAndGetOut(); openShop()},900)}, '#giveBtn', 1200],
  ['vault', {...ALL,heistStage:3,heistBriefed:true,heistHowTo:true}, ()=>{goTo('city','start'); setTimeout(()=>{try{closeDialog()}catch(e){} openVault()},900)}, '#crate2', 1200],
  ['anagrams', {...ALL,heistStage:4,heistBriefed:true,heistHowTo:true}, ()=>{goTo('city','start'); setTimeout(()=>{try{closeDialog()}catch(e){} openAnagrams()},900)}, '#anaStart', 1200],
  ['secret word: the box', ALL, ()=>openPassword(()=>{}), '#pwInput'],
  ['secret word: Unlock', ALL, ()=>openPassword(()=>{}), '#pwGo'],
  ['baking', ALL, ()=>{goTo('kitchen','fromDoor'); setTimeout(openBake,900)}, '#bakeBtn', 1200],
  ['ending: stats', {...ALL,baked:true}, ()=>{openEnding(); $('endSkip').click()}, '#endNext'],
  ['ending: album', {...ALL,baked:true}, ()=>{openEnding(); $('endSkip').click(); $('endNext').click()}, '#endNext'],
  ['ending: note', {...ALL,baked:true}, ()=>{openEnding(); $('endSkip').click(); $('endNext').click(); $('endNext').click()}, '#ecard button'],
  ['hint from Alex', {welcomed:true}, ()=>{idle.t=HINTS.AFTER_MS+1}, '#hint'],
];
for(const [vpName,vp,touch] of [['desktop',{width:1280,height:800}],['phone',{width:390,height:844},true],['small phone',{width:360,height:640},true],['phone sideways',{width:844,height:390},true]]){
  const p=await page(vp,{touch}); const bad=[];
  for(const [name,st,open,sel,wait] of OVERLAYS){
    await fresh(p,st); await p.evaluate(open); await p.waitForTimeout(wait||400);
    const res=await p.evaluate(sel=>{const el=document.querySelector(sel); if(!el)return 'missing'; el.scrollIntoView({block:'nearest',inline:'nearest'}); const r=el.getBoundingClientRect();
      if(r.width<1||r.height<1)return 'hidden'; const x=r.left+r.width/2, y=r.top+Math.min(r.height/2,8);
      if(x<0||y<0||x>innerWidth||y>innerHeight)return `off screen (${x|0},${y|0})`; const top=document.elementFromPoint(x,y);
      if(!(top===el||el.contains(top)||top.contains(el)))return 'covered by '+(top.id||top.className||top.tagName);
      return document.scrollingElement.scrollWidth>innerWidth+1?'page scrolls sideways':'ok'},sel);
    if(res!=='ok')bad.push(name+': '+res);
  }
  ok(`A ${vpName} (${vp.width}x${vp.height}): every pop-up's main button can be reached`,!bad.length,bad.join(' | '));
  await p.context().close();
}

// B. odd saves: storage blocked (some private windows), or a broken save
{const p=await page({width:900,height:760},{init:()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('blocked')}})}});
  await p.goto(URL); await p.click('#startBtn'); await p.waitForTimeout(200);
  const r=await p.evaluate(()=>{const s=!$('dialog').hidden; while(!dlg.hidden)[...$('dbtns').querySelectorAll('button')][0].click(); $('wardGo').click(); showReward('farm'); collectReward(); return {welcome:s,farm:have.farm}});
  await p.waitForTimeout(900);
  ok('B storage blocked: the game still runs (it just won\'t remember)',r.welcome&&r.farm&&!p.errs.length,p.errs.join(' | '));
  await p.context().close()}
{const p=await page(); await p.goto(URL); await p.evaluate(()=>localStorage.setItem('cookie-quest-v1','{this is not json')); await p.reload(); await p.click('#startBtn'); await p.waitForTimeout(200);
  const r=await p.evaluate(()=>({welcome:$('dspeaker').textContent,keys:Object.keys(have).length}));
  ok('B a broken save starts a fresh game instead of crashing',r.welcome==='Alex'&&!p.errs.length,JSON.stringify(r));
  await p.context().close()}

// C. menus on top of menus: opening ⚙ Settings over another pop-up and closing it must not unpause the game underneath
{const p=await page(); const stuck=[];
  for(const [name,st,open] of [['secret word',ALL,()=>openPassword(()=>{})],['baking',ALL,()=>{goTo('kitchen','fromDoor'); setTimeout(openBake,900)}],['snack shop',ALL,()=>{goTo('fargo','fromHighway'); setTimeout(()=>{try{closeDialog()}catch(e){} have.fargoStage='store'; parkAndGetOut(); openShop()},900)}],
    ['ending',{...ALL,baked:true},()=>openEnding()],['reward',ALL,()=>showReward('farm')],['dialog',ALL,()=>showDialog({pages:['hi'],actions:[CLOSE]})]]){
    await fresh(p,st); await p.evaluate(open); await p.waitForTimeout(1300);
    const r=await p.evaluate(()=>{$('settingsBtn').click(); $('settingsClose').click(); const x=P.x; dirs.right=true; for(let i=0;i<20;i++)update(16.7); dirs.right=false; return {paused,moved:P.x!==x}});
    if(!r.paused||r.moved)stuck.push(name);
  }
  ok('C closing ⚙ Settings over another pop-up keeps the game paused underneath',!stuck.length,stuck.join(', '));
  await p.context().close()}

// D. leaving a place halfway through something
{const p=await page(); await fresh(p,ALL);
  let r=await p.evaluate(()=>{const T=(n)=>{for(let i=0;i<n;i++)update(16.7)}; goTo('world','start'); T(40);
    P.x=LOGAN.x+6;P.y=LOGAN.y+2; T(2); action(); while([...$('dbtns').querySelectorAll('button')].some(b=>b.textContent==='Next'))[...$('dbtns').querySelectorAll('button')].find(b=>b.textContent==='Next').click();
    [...$('dbtns').querySelectorAll('button')].find(b=>b.textContent===LOGAN_TEXT.help).click(); const opened=!$('cloverHunt').hidden&&paused; $('cloverLater').click();
    const closed=$('cloverHunt').hidden&&!paused&&!(have.gear&&have.gear.clover); T(2); action(); while([...$('dbtns').querySelectorAll('button')].some(b=>b.textContent==='Next'))[...$('dbtns').querySelectorAll('button')].find(b=>b.textContent==='Next').click();
    [...$('dbtns').querySelectorAll('button')].find(b=>b.textContent===LOGAN_TEXT.help).click(); const again=!$('cloverHunt').hidden; $('cloverField').querySelector('[data-four]').click();
    const back=$('dspeaker').textContent; closeDialog(); paused=false; return {opened,closed,again,back,clover:have.gear&&have.gear.clover}});
  ok('D leaving the clover hunt halfway: no clover yet, the game carries on, and you can go back and find it',r.opened&&r.closed&&r.again&&r.back==='Logan'&&r.clover===1,JSON.stringify(r));
  r=await p.evaluate(()=>{const T=(n)=>{for(let i=0;i<n;i++)update(16.7)}; closeDialog(); paused=false; P.x=60;P.y=150; idle.t=HINTS.AFTER_MS+1; T(2); const shown=!$('hint').hidden; goTo('kitchen','fromDoor'); T(60); return {shown,kitchen:$('hint').hidden}});
  ok('D Alex\'s hint goes away when you leave the map',r.shown&&r.kitchen,JSON.stringify(r));
  await p.context().close()}

// E. round trips through every door: no errors, right music, exits don't bounce you straight back
{const p=await page(); await fresh(p,{...ALL,heistBriefed:true,heistHowTo:true,fargoIntro:true,birkieHowTo:true});
  const r=await p.evaluate(async()=>{const T=(n)=>{for(let i=0;i<n;i++)update(16.7)}; const out=[];
    const trips=[['kitchen','fromDoor','world',()=>{P.x=112;P.y=162}],['golf','fromRoad','world',()=>{P.x=112;P.y=164}],['fargo','fromHighway','world',()=>{P.x=3;P.y=180}],['city','fromStreet','world',()=>{P.x=20;P.y=172}]];
    for(let k=0;k<3;k++)for(const [s,e,back,walk] of trips){ goTo(s,e); T(40); while(!dlg.hidden)[...$('dbtns').querySelectorAll('button')][0].click(); $('howto').hidden=true; paused=false;
      const there=scene===SCENES[s]; T(30); const stayed=scene===SCENES[s]; const music=song; walk(); T(40); out.push(there&&stayed&&scene===SCENES[back]?'':`${s}: there ${there} stayed ${stayed} back ${scene===SCENES[back]}`); }
    return out.filter(Boolean)});
  ok('E in and out of every place 3 times: arrive, stay put, walk out the exit',!r.length&&!p.errs.length,r.join(' | ')+p.errs.join(' | '));
  await p.context().close()}

// F. sound settings
{const p=await page(); await fresh(p,ALL);
  const r=await p.evaluate(()=>{const a=song; setSound(false); const off=song; tone(440,.1); sfx('reward'); setSound(true); const on=song; setMusic(false); const m=song; setMusic(true); return {a,off,on,m,back:song}});
  ok('F turning sound off stops the music; on brings back this place\'s song; Music can be off on its own',r.a==='farm'&&r.off===null&&r.on==='farm'&&r.m===null&&r.back==='farm',JSON.stringify(r));
  await p.context().close()}

// G. Start over: two taps erase everything
{const p=await page(); await fresh(p,{...ALL,gear:{oakleys:1},passwordOk:true});
  await p.click('#resetBtn'); await p.click('#resetBtn'); await p.waitForLoadState('load'); await p.waitForTimeout(300); await p.click('#startBtn'); await p.waitForTimeout(200);
  const r=await p.evaluate(()=>({keys:Object.keys(have).filter(k=>k!=='welcomed'),welcome:$('dspeaker').textContent}));
  ok('G Start over (tap twice) erases everything and Alex welcomes Joe again',!r.keys.length&&r.welcome==='Alex',JSON.stringify(r));
  await p.context().close()}

console.log(R.join('\n')); console.log('page errors:',allErrs.length?[...new Set(allErrs)]:'none'); await b.close(); process.exit(R.some(l=>l.startsWith('FAIL'))||allErrs.length?1:0)})();
