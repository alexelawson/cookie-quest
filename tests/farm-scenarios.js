const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
let installT;
const fresh=async()=>{await p.goto('file://'+require('path').resolve(__dirname,'../index.html')+'');await p.evaluate(()=>localStorage.clear());await p.reload();await p.click('#startBtn'); await p.evaluate(()=>skipWelcome());await p.evaluate(installT)};
installT=()=>{
  window.T={
    btns:()=>[...$('dbtns').querySelectorAll('button')].map(b=>b.textContent),
    click:t=>{const b=[...$('dbtns').querySelectorAll('button')].find(b=>b.textContent===t); if(!b)throw new Error('no button '+t+' in '+T.btns()); b.click()},
    pages:()=>{while(T.btns().includes('Next'))T.click('Next')},
    talk:()=>{closeDialog(); const k=farm.keelan; P.x=k.x-10;P.y=k.y; update(16.7); if(!near||near.label!=='Talk to Keelan')throw new Error('not near keelan: '+(near&&near.label)); action()},
    start:()=>{T.talk(); T.click("I'm ready!"); T.pages(); T.click('Go!')},
    issues:[], kHelped:false,
    step:(n,opts={})=>{for(let i=0;i<n;i++){
      if(!dlg.hidden&&$('dspeaker').textContent==='Ooh'){closeDialog(); T.foundByAccident=true}
      if(!dlg.hidden||!$('reward').hidden)return 'paused';
      if(!farm.active)return 'ended';
      const tgt=farm.carrying?{x:120,y:126}:(farm.loose.length?farm.loose.reduce((a,h)=>Math.hypot(h.x-P.x,h.y-P.y)<Math.hypot(a.x-P.x,a.y-P.y)?h:a):{x:120,y:130});
      const w=waypoint(P,tgt); for(const k in dirs)dirs[k]=false;
      if(!opts.idle){if(w.x-P.x>1)dirs.right=true;if(w.x-P.x<-1)dirs.left=true;if(w.y-P.y>1)dirs.down=true;if(w.y-P.y<-1)dirs.up=true}
      update(16.7);
      const total=farm.penned.length+farm.loose.length+(farm.carrying?1:0)+(farm.keelan.carrying?1:0);
      if(farm.active&&total!==20)T.issues.push('hen count '+total);
      for(const h of farm.loose){const sp=R(h.x-4,h.y-7,8,9), inside=(a,b)=>a.x>=b.x&&a.y>=b.y&&a.x+a.w<=b.x+b.w&&a.y+a.h<=b.y+b.h;
        // fully covered by the barn (roof or walls) while standing behind it, or in a no-hen zone
        if(HEN_ONLY.some(z=>hit(R(h.x-3,h.y-3,6,4),z))||(h.y<74&&(inside(sp,R(16,22,64,14))||inside(sp,R(20,22,56,52)))))T.issues.push('hidden hen at '+(h.x|0)+','+(h.y|0))}
      if(farm.keelan.carrying)T.kHelped=true;
    } return 'running'},
    runToEnd:()=>{let r; for(let i=0;i<60;i++){r=T.step(600); if(r!=='running')break} return r},
  };
};
await fresh();
const R=[];const ok=(name,cond,extra='')=>R.push((cond?'PASS ':'FAIL ')+name+(extra?'  ('+extra+')':''));

// 1. no cupcake: win, Keelan never helps, reward, collect
let r=await p.evaluate(()=>{T.start(); const kx=farm.keelan.x; const e=T.runToEnd(); const msg=$('dspeaker').textContent+': '+$('dtext').textContent+' pen='+farm.penned.length+' loose='+farm.loose.length+' active='+farm.active; if(!farm.won)return {e,msg,fail:true}; T.pages(); T.click('Thanks, Keelan!');
  return {e,msg,helped:T.kHelped,kmoved:Math.abs(farm.keelan.x-kx)>3,reward:!$('reward').hidden,pen:farm.penned.length,issues:T.issues.slice(0,3)}});
if(r.fail){console.log('scenario 1 stopped:',r.msg);process.exit(1)}
ok('1 ends as soon as all 20 are in',r.e==='paused'&&r.pen===20,r.msg); ok('1 Keelan stays put without cupcake',!r.helped&&!r.kmoved); ok('1 reward pop-up shows',r.reward);
await p.click('#rewardArt',{force:true}); await p.waitForTimeout(900);
r=await p.evaluate(()=>{const ks=()=>{const l=[];for(let i=0;i<15&&!dlg.hidden&&!l.join().includes('Settings');i++){l.push($('dspeaker').textContent+': '+$('dtext').textContent);const b=T.btns();T.click(b.includes('Next')?'Next':b[0])}return {l,gear:Object.keys(have.gear||{}).join()}};const k=ks(); return {k,farm:!!have.farm,paused,basket:$('basket').textContent}}); ok('1 Keelan hands over Grp the rooster (G for short)',r.k.l.join().includes('Grp')&&r.k.l.join().includes('Green Red Poultry')&&r.k.gear.includes('hen'),r.k.l[0]); ok('1 tap adds to basket and unpauses',r.farm&&!r.paused,r.basket);
r=await p.evaluate(()=>{T.talk(); return T.btns()}); ok('1 after winning, Keelan says thanks (offers cupcake only if you found it on the way)',r.join()==='Close'||r.join()==='Give Keelan the cupcake,Bye',r.join());

// 2. cupcake before starting: Keelan helps
await fresh(); r=await p.evaluate(()=>{have.cupcake=true;renderBasket();T.talk();T.click('Give Keelan the cupcake');T.pages();T.click('OK');
  const menu=T.btns(); T.click("I'm ready!");T.pages();T.click('Go!'); T.kHelped=false; T.issues=[]; const e=T.runToEnd();
  return {menu,e,helped:T.kHelped,pen:farm.penned.length,basket:$('basket').textContent,issues:T.issues.slice(0,3)}});
ok('2 cupcake gone from menu after giving',!r.menu.includes('Give Keelan the cupcake'),r.menu.join(' / ')); ok('2 Keelan helps',r.helped); ok('2 win',r.e==='paused'&&r.pen===20); ok('2 cupcake leaves basket',!r.basket.includes('Cupcake'),r.basket);

// 3. cupcake given midway
await fresh(); r=await p.evaluate(()=>{have.cupcake=true;renderBasket(); T.start(); T.kHelped=false; T.step(500); const helpedBefore=T.kHelped;
  if(!farm.active)return {skip:true};
  T.talk(); const menu=T.btns(); T.click('Give Keelan the cupcake'); T.pages(); T.click('OK'); const menu2=T.btns(); T.click('Back to it');
  const e=T.runToEnd(); return {helpedBefore,menu,menu2,e,helped:T.kHelped,pen:farm.penned.length}});
ok('3 mid-chase menu has progress + cupcake + back',r.menu&&r.menu.includes('How am I doing?')&&r.menu.includes('Give Keelan the cupcake')&&r.menu.includes('Back to it'),r.menu&&r.menu.join(' / '));
ok('3 Keelan idle before cupcake, helps after',!r.helpedBefore&&r.helped); ok('3 win',r.e==='paused'&&r.pen===20);

// 4. pick up the cupcake behind the barn during the chase, then give it
await fresh(); r=await p.evaluate(()=>{T.start(); T.step(200); for(const k in dirs)dirs[k]=false; P.x=60;P.y=24; dirs.right=true; let i=0; for(;i<60&&dlg.hidden;i++)update(16.7); dirs.right=false;
  const got=!!have.cupcake, txt=$('dtext').textContent; closeDialog(); T.talk(); const menu=T.btns(); T.click('Give Keelan the cupcake'); T.pages(); T.click('OK'); T.click('Back to it');
  const e=T.runToEnd(); return {got,txt,menu,e,helped:T.kHelped,active:farm.active}});
ok('4 cupcake can be found mid-chase',r.got,r.txt); ok('4 then given and Keelan helps',r.helped&&r.e==='paused');

// 5. lose while Keelan is helping (and maybe carrying), then retry cleanly
await fresh(); r=await p.evaluate(()=>{have.gaveCupcake=true; T.start(); T.step(120,{idle:true});
  for(let i=0;i<20&&farm.active;i++){escapeOne(); update(16.7)}
  const lost=!farm.active&&$('dtext').textContent; T.pages(); closeDialog();
  return {lost,kc:farm.keelan.carrying,pen:farm.penned.length,loose:farm.loose.length,carry:farm.carrying,won:farm.won}});
ok('5 loses at 9 loose',!!r.lost,r.lost); ok('5 everything resets after losing',!r.kc&&r.pen===20&&r.loose===0&&!r.carry&&!r.won);
r=await p.evaluate(()=>{for(let i=0;i<200;i++)update(16.7); T.start(); return {active:farm.active,loose:farm.loose.length}}); ok('5 can start again',r.active&&r.loose===5);

// 6. won without giving cupcake, still holding it: can give it afterwards
await fresh(); r=await p.evaluate(()=>{T.start(); T.runToEnd(); T.pages(); T.click('Thanks, Keelan!'); collectReward(); return 1});
await p.waitForTimeout(900);
r=await p.evaluate(()=>{have.cupcake=true; renderBasket(); T.talk(); const m=T.btns(); T.click('Give Keelan the cupcake'); const t=$('dtext').textContent; T.pages(); T.click('Close');
  return {m,t,basket:$('basket').textContent}});
ok('6 can give cupcake after winning',r.m.includes('Give Keelan the cupcake'),r.t); ok('6 cupcake leaves basket',!r.basket.includes('Cupcake'),r.basket);

// 7. reload while the reward is showing: reward comes back
await fresh(); await p.evaluate(()=>{T.start(); T.runToEnd(); T.pages(); T.click('Thanks, Keelan!')});
await p.reload(); await p.click('#startBtn'); await p.evaluate(()=>skipWelcome()); await p.evaluate(installT);
await p.evaluate(()=>{window.T2={}; P.x=farm.keelan.x-10;P.y=farm.keelan.y;update(16.7);action()});
r=await p.evaluate(()=>({reward:!$('reward').hidden,farm:!!have.farm})); ok('7 reward survives a reload',r.reward&&!r.farm);

// 8. Enter key collects once, not twice; arrows don't walk
await p.focus('#rewardArt'); await p.keyboard.press('Enter'); await p.waitForTimeout(900);
r=await p.evaluate(()=>{const ks=()=>{const l=[];for(let i=0;i<15&&!dlg.hidden&&!l.join().includes('Settings');i++){l.push($('dspeaker').textContent+': '+$('dtext').textContent);const b=T.btns();T.click(b.includes('Next')?'Next':b[0])}return {l,gear:Object.keys(have.gear||{}).join()}};ks(); return {farm:!!have.farm,reward:$('reward').hidden,paused}}); ok('8 Enter collects reward',r.farm&&r.reward&&!r.paused);

// 9. walk into the kitchen mid-chase and come back
await fresh(); r=await p.evaluate(()=>{T.start(); T.step(200); const pen=farm.penned.length, loose=farm.loose.length; goTo('kitchen','fromDoor');
  for(let i=0;i<60;i++)update(16.7); for(let i=0;i<300;i++)update(16.7); const frozen=farm.penned.length===pen&&farm.loose.length===loose;
  goTo('world','fromKitchen'); for(let i=0;i<60;i++)update(16.7); const e=T.runToEnd(); return {frozen,e,pen:farm.penned.length}});
ok('9 chase pauses inside the kitchen',r.frozen); ok('9 and can still be won after',r.e==='paused'&&r.pen===20);

// 10. Play again from the kitchen resets the farm fully
r=await p.evaluate(()=>{T.pages(); T.click('Thanks, Keelan!'); collectReward(); return 1}); await p.waitForTimeout(900);
r=await p.evaluate(()=>{for(const k of ['mill','city','fargo','golf','baked'])have[k]=true; goTo('kitchen','fromDoor'); for(let i=0;i<40;i++)update(16.7);
  startBaking(); closeEnding(); playAgain(); for(let i=0;i<40;i++)update(16.7);
  T.talk(); return {menu:T.btns(),reward:$('reward').hidden,basket:$('basket').textContent,scene:scene===SCENES.world}});
ok('10 Play again gives a fresh farm',r.menu.includes("I'm ready!")&&r.reward&&r.scene,r.basket);

r=await p.evaluate(()=>[...new Set(T.issues)].slice(0,5)); ok('no lost or hidden hens in any run',r.length===0,r.join('; '));
console.log(R.join('\n')); console.log('page errors:',errs.length?errs:'none'); await b.close()})()
