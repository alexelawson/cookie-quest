// Plays through every Fargo path: drive in, Lil Q's scooter race, the walk-in shop with Alex and Jackie, the diner's pasta.
// Run: node tests/fargo-scenarios.js
const {chromium}=require('playwright');const path=require('path');(async()=>{
const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
const URL='file://'+path.resolve(__dirname,'../index.html');
const helpers=()=>{window.T={
  btns:()=>[...$('dbtns').querySelectorAll('button')].map(b=>b.textContent),
  click:t=>{const b=[...$('dbtns').querySelectorAll('button')].find(b=>b.textContent===t); if(!b)throw new Error('no button "'+t+'" in '+T.btns()+' | '+$('dtext').textContent); b.click()},
  lines:()=>{const l=[]; for(let i=0;i<20&&!dlg.hidden;i++){l.push($('dspeaker').textContent+': '+$('dtext').textContent); if(!T.btns().includes('Next')&&T.btns().length>1)break; [...$('dbtns').querySelectorAll('button')][0].click()} return l},
  run:(n)=>{for(let i=0;i<n;i++)update(16.7)},
  settle:()=>{for(let i=0;i<60;i++)update(16.7)},
  enter:()=>{P.x=270;P.y=161;update(16.7);action();T.settle()},
  walkTo:(x,y,max=800)=>{for(let i=0;i<max;i++){const dx=x-P.x,dy=y-P.y; if(Math.hypot(dx,dy)<2)break; for(const k in dirs)dirs[k]=false;
     if(dx>1)dirs.right=true;if(dx<-1)dirs.left=true;if(dy>1)dirs.down=true;if(dy<-1)dirs.up=true; update(16.7); if(!dlg.hidden)break} for(const k in dirs)dirs[k]=false; return Math.hypot(x-P.x,y-P.y)<3},
  at:(x,y)=>{P.x=x;P.y=y;update(16.7); return near&&near.label},
  go:(x,y)=>{if(P.x>150)T.walkTo(156,P.y); T.walkTo(P.x,48); T.walkTo(x,48); return T.walkTo(x,y)},   // in the shop: up your aisle, along the coolers, down the next aisle
  toAlex:()=>{T.go(156,140); return T.walkTo(172,138)},
  toDoor:()=>{T.go(106,150); return T.walkTo(112,152)},
  // the race, with a bot that kicks every `every` ms (420 is right in the green)
  // the race, with a bot that steers along a route ('good': the shortcuts, cleanly; 'bad': the roads, wandering a lot)
  race:(how)=>{ const roads=[{x:222,y:180},{x:222,y:52},{x:103,y:52},{x:52,y:52},{x:52,y:302},{x:392,y:302},{x:392,y:180},{x:330,y:180}];
    const cuts=[{x:240,y:174},{x:240,y:168},{x:136,y:64},{x:103,y:52},{x:52,y:52},{x:52,y:302},{x:392,y:302},{x:392,y:290},{x:350,y:248},{x:350,y:222}];
    const route=how==='good'?cuts:roads, slop=how==='good'?0:.3; raceReset(); race.phase='go'; let i=0,t=0;
    while(race.phase==='go'&&t<60000){ const w=route[Math.min(i,route.length-1)]; for(const k in dirs)dirs[k]=false; const dx=w.x-P.x, dy=w.y-P.y;
      if(Math.hypot(dx,dy)<5)i++; else { if(dx>2)dirs.right=true; if(dx<-2)dirs.left=true; if(dy>2)dirs.down=true; if(dy<-2)dirs.up=true }
      if(slop&&Math.random()<slop)for(const k in dirs)dirs[k]=false; update(16.7); t+=16.7 }
    for(const k in dirs)dirs[k]=false; return {won:race.won,t:Math.round(t),cp:race.cp}},
}};
const fresh=async(st)=>{await p.goto(URL);await p.evaluate(s=>{localStorage.clear(); if(s)localStorage.setItem('cookie-quest-v1',JSON.stringify(s))},st);await p.reload();await p.click('#startBtn'); await p.evaluate(()=>{try{skipWelcome()}catch(e){}});await p.evaluate(helpers)};
const R=[];const ok=(n,c,x='')=>R.push((c?'PASS ':'FAIL ')+n+(x?'  ('+x+')':''));
await fresh();

// A. driving in
let r=await p.evaluate(()=>{T.enter(); const intro=T.lines(); return {scene:scene===SCENES.fargo,intro,hud:SCENES.fargo.hud(),stations:STATIONS.length,diner:!!DINER,car:!fargo.onFoot}});
ok('A drive into Fargo: Alex says to look for Lil Q\'s sign',r.scene&&r.intro[0].startsWith('Alex')&&r.intro.join().includes("Lil Q's"),r.intro.join(' | '));
ok('A one gas station (Lil Q\'s), a diner, no fuel gauge',r.stations===1&&r.diner&&r.hud.includes("Find Lil Q's")&&!r.hud.includes('Fuel'),r.hud);

// B. the diner: Deb's out front (we'll come back for the pasta once Jackie asks, after going into the shop)
r=await p.evaluate(()=>{P.x=DINER.lot.x+20; P.y=DINER.lot.y+14; update(16.7); const lbl=near&&near.label; action(); const hello=$('dtext').textContent, btns=T.btns(); T.click('Just looking'); return {lbl,hello,btns,closed:dlg.hidden,got:!!have.fargoPasta}});
ok('B pull up to the diner: Deb offers plain pasta (you can say no for now)',r.lbl==='Pull up to the diner'&&r.btns.includes('Plain pasta to go')&&r.closed&&!r.got,r.hello);

// C. Lil Q: the deal, then the race scene (how-to first)
r=await p.evaluate(()=>{const s=STATIONS[0]; P.x=s.lot.x+10;P.y=s.lot.y+22; update(16.7); const lbl=near&&near.label; action(); const said=[]; while(T.btns().includes('Next')){said.push($('dtext').textContent);T.click('Next')} said.push($('dtext').textContent);
  const btns=T.btns(); T.click('Race her'); T.settle(); const howto=!$('howto').hidden, title=$('howTitle').textContent; $('howOk').click(); return {lbl,said,btns,scene:scene===SCENES.scooter,howto,title,phase:race.phase,stage:have.fargoStage}});
ok('C pull up to the pump: Lil Q offers the race for the gas',r.lbl==='Pull up to the pump'&&r.said.join().includes('Race me')&&r.btns.join()==='Race her,Not yet'&&r.stage==='race',r.btns.join());
ok('C the race opens with a how-to card first',r.scene&&r.howto&&r.title==='Scooter race'&&r.phase==='count',r.title+' '+r.phase);
r=await p.evaluate(()=>{const t0=race.t; T.run(10); const counting=race.phase==='count'&&race.t>t0; const x=P.x; dirs.left=true; T.run(5); const frozen=P.x===x; dirs.left=false;
  for(let i=0;i<160&&race.phase==='count';i++)update(16.7); const x2=P.x; dirs.left=true; T.run(10); dirs.left=false; const moves=P.x<x2; return {counting,frozen,go:race.phase,moves,hud:SCENES.scooter.hud()}});
ok('C 3-2-1 countdown (you can\'t move yet), then GO: steer with the arrows; HUD says 1st/2nd and the next checkpoint',r.counting&&r.frozen&&r.go==='go'&&r.moves&&/1st|2nd/.test(r.hud)&&r.hud.includes('Checkpoint 1/3'),JSON.stringify(r));

// D. the race: checkpoints in order, boosts, grass, the shortcuts
r=await p.evaluate(()=>{raceReset(); race.phase='go';
  const cp2=RACE_CPS[1]; P.x=cp2.x; P.y=cp2.y; update(16.7); const skipped=race.cp===0;                           // the second one doesn't count before the first
  const cp1=RACE_CPS[0]; P.x=cp1.x; P.y=cp1.y; update(16.7); const first=race.cp===1;
  P.x=335; P.y=180; update(16.7); const noFinish=race.phase==='go';                                              // can't finish without all three
  const road=SCENES.scooter.speed(); P.x=150; P.y=120; const grass=SCENES.scooter.speed(); P.x=188; P.y=116; const path=SCENES.scooter.speed();
  const pad=RACE_PADS[0]; P.x=pad.x; P.y=pad.y; update(16.7); const boosted=race.boost>0&&SCENES.scooter.speed()>road;
  return {skipped,first,noFinish,road,grass,path,boosted}});
ok('D checkpoints only count in order, and you can\'t finish without all three',r.skipped&&r.first&&r.noFinish,JSON.stringify(r));
ok('D roads + dirt paths are fast, grass is slow, the orange arrows boost you',r.road>r.grass&&r.path===r.road&&r.boosted,JSON.stringify(r));
r=await p.evaluate(()=>({good:T.race('good'),bad:T.race('bad')}));
ok('D a clean run with the shortcuts beats Lil Q; a wandering one on the roads loses',r.good.won&&!r.bad.won,JSON.stringify(r));

// E. losing: rematch or later
r=await p.evaluate(()=>{T.race('bad'); for(let i=0;i<80&&dlg.hidden;i++)SCENES.scooter.ambient(16.7); const lost=$('dtext').textContent; while(T.btns().includes('Next'))T.click('Next'); const btns=T.btns(); T.click('Run it back'); const again=race.phase==='count'&&scene===SCENES.scooter;
  T.race('bad'); for(let i=0;i<80&&dlg.hidden;i++)SCENES.scooter.ambient(16.7); T.lines(); T.click('Later'); T.settle(); return {lost,btns,again,back:scene===SCENES.fargo,car:!fargo.onFoot,hud:SCENES.fargo.hud(),stage:have.fargoStage}});
ok('E lose: Lil Q gloats; Run it back restarts the race',r.lost.includes('Lil Q wins')||r.btns.includes('Run it back'),r.lost);
ok('E Later: back in the car by her lot, HUD says race her',r.again&&r.back&&r.car&&r.stage==='race'&&r.hud.includes('Race Lil Q'),r.hud);

// F. back to Lil Q: "back for more?" then the win
r=await p.evaluate(()=>{const s=STATIONS[0]; P.x=s.lot.x+10;P.y=s.lot.y+22; update(16.7); action(); const hello=$('dtext').textContent; T.click('Race her'); T.settle();
  T.race('good'); for(let i=0;i<80&&dlg.hidden;i++)SCENES.scooter.ambient(16.7); const won=T.lines(); T.settle(); const ask=T.lines();
  return {hello,howtoAgain:!$('howto').hidden,won,ask,scene:scene===SCENES.fargo,onFoot:fargo.onFoot,stage:have.fargoStage,hud:SCENES.fargo.hud()}});
ok('F rematch: no how-to the second time',r.hello.includes('Back for more')&&!r.howtoAgain,r.hello);
ok('F win: Lil Q fills the tank; parked at her shop, Alex asks for a snack',r.won.join().includes('A deal\'s a deal')&&r.scene&&r.onFoot&&r.stage==='store'&&r.ask.join().includes('She definitely wants a snack'),r.ask.join(' | '));
r=await p.evaluate(()=>{const g=STATIONS[0]; const lbl=T.at(g.door.x+8,g.door.y+4); const sign=have.fargoStage==='store'; action(); T.settle(); return {lbl,sign,shop:scene===SCENES.lilqshop,p:[Math.round(P.x),Math.round(P.y)]}});
ok('F the ENTER sign blinks over the door; walk in',r.lbl==='Go inside'&&r.sign&&r.shop,JSON.stringify(r));

// G. the shop: Alex walks in with you; grab things and bring them to her
r=await p.evaluate(()=>{T.run(40); const hello=T.lines(); T.run(90); const ax=lq.alex.x, ay=lq.alex.y;
  const coke=SHOP_ITEMS.find(i=>i.id==='coke'), sprite=SHOP_ITEMS.find(i=>i.id==='sprite'), cheetos=SHOP_ITEMS.find(i=>i.id==='cheetos');
  const w1=T.go(coke.spot.x+coke.spot.w/2,coke.spot.y+6); update(16.7); const lbl=near&&near.label; action(); const held=lq.drink;
  T.go(sprite.spot.x+sprite.spot.w/2,sprite.spot.y+6); update(16.7); const swapLbl=near&&near.label; action(); const swapped=lq.drink;
  T.toAlex(); update(16.7); const giveLbl=near&&near.label; action(); const need=T.lines();
  T.go(cheetos.spot.x+cheetos.spot.w/2,cheetos.spot.y+6); update(16.7); action(); const hud=SCENES.lilqshop.hud();
  T.toAlex(); update(16.7); action(); const wrong=T.lines(); return {hello,alexAt:[Math.round(ax),Math.round(ay)],want:SHOP.ALEX,w1,lbl,held,swapLbl,swapped,giveLbl,need,hud,wrong,cleared:!lq.drink&&!lq.snack,wrongN:have.fargoWrong,stage:have.fargoStage}});
ok('G Alex comes in too and waits by the counter ("Don\'t mess this up")',r.hello.join().includes("Don't mess this up")&&Math.abs(r.alexAt[0]-r.want.x)<3&&Math.abs(r.alexAt[1]-r.want.y)<3,JSON.stringify(r.alexAt));
ok('G walk up to the fridge and grab a drink; grabbing another swaps it',r.w1&&r.lbl==='Grab the Coke'&&r.held==='coke'&&r.swapLbl==='Swap for the Sprite'&&r.swapped==='sprite',r.lbl+' / '+r.swapLbl);
ok('G bring Alex just a drink: "A drink AND a snack"',r.giveLbl==='Give to Alex'&&r.need.join().includes('A drink AND a snack'),r.need.join());
ok('G HUD shows what you\'re holding; wrong pair: her reactions, they go back on the shelf, still in the shop',r.hud.includes('Sprite')&&r.hud.includes('Cheetos')&&r.wrong.join().includes('Sprite??')&&r.wrong.join().includes('orange')&&r.cleared&&r.wrongN===1&&r.stage==='store',r.wrong.join(' | '));

// H. Jackie: no help without pasta
r=await p.evaluate(()=>{T.go(SHOP.JACKIE.x,SHOP.JACKIE.y+14); update(16.7); const lbl=near&&near.label; action(); const hungry=T.lines(); const hud=SCENES.lilqshop.hud(); return {lbl,hungry,hud,asked:have.jackieAsked,exitMark:EXITS.lilqshop[0].markWhen()}});
ok('H Jackie won\'t help on an empty stomach: plain pasta from the diner',r.lbl==='Talk to Jackie'&&r.hungry.join().includes('plain pasta')&&r.hungry.join().includes('diner'),r.hungry.join(' | '));
ok('H then the HUD says where to get it, and the EXIT arrow shows the way out',r.asked&&r.hud.includes('Diner')&&r.exitMark,r.hud);

// I. so: walk out (you've already been inside), get in the car, the diner, back
r=await p.evaluate(()=>{T.toDoor(); for(let i=0;i<40&&scene===SCENES.lilqshop;i++){dirs.down=true; update(16.7)} dirs.down=false; T.settle();
  const out=scene===SCENES.fargo, onFoot=fargo.onFoot, stage=have.fargoStage; const c=fargo.car; const lbl=T.at(c.x,c.y+14); action(); const driving=!fargo.onFoot, hud=SCENES.fargo.hud();
  P.x=DINER.lot.x+20; P.y=DINER.lot.y+14; update(16.7); action(); T.click('Plain pasta to go'); const lines=T.lines(); const card=!$('reward').hidden, cardName=$('rewardName').textContent; collectReward(); window._I={out,onFoot,stage,lbl,driving,hud,lines,card,cardName}; return 1});
await p.waitForTimeout(800);
r=await p.evaluate(()=>{const {out,onFoot,stage,lbl,driving,hud,lines,card,cardName}=window._I; const got=!!have.fargoPasta, inBasket=!!$('basket').querySelector('[data-key="fargoPasta"]');
  action(); const again=$('dtext').textContent; T.lines();
  const s=STATIONS[0]; P.x=s.lot.x+10;P.y=s.lot.y+22; update(16.7); action(); const parked=fargo.onFoot&&!!fargo.car; const g=s.door; const door=T.at(g.x+8,g.y+4); action(); T.settle();
  return {out,onFoot,stage,lbl,driving,hud,lines,card,cardName,got,inBasket,again,parked,door,inShop:scene===SCENES.lilqshop,shopHud:SCENES.lilqshop.hud()}});
ok('I you can walk out after you\'ve gone in: get in the car (HUD: the diner)',r.out&&r.onFoot&&r.stage==='store'&&r.lbl==='Get in the car'&&r.driving&&r.hud.includes('Diner'),r.hud);
ok('I Deb hands over a bowl of plain pasta: tap it into the basket',r.lines.join().includes('warm bowl')&&r.card&&r.cardName==='Plain pasta'&&r.got&&r.inBasket&&r.again.includes('always plain'),r.cardName);
ok('I back to Lil Q\'s: park and go inside again; the HUD says you\'ve got the pasta',r.parked&&r.door==='Go inside'&&r.inShop&&r.shopHud.includes('Plain pasta'),r.shopHud);
r=await p.evaluate(()=>{T.run(60); T.lines(); T.go(SHOP.JACKIE.x,SHOP.JACKIE.y+14); update(16.7); const lbl2=near&&near.label; action(); const fed=T.lines(); action(); const h2=T.lines(); action(); const h3=T.lines(); action(); const h4=T.lines();
  return {lbl2,fed,h2,h3,h4,met:have.metJackie,fedSaved:have.jackieFed,outOfBasket:!$('basket').querySelector('[data-key="fargoPasta"]')}});
ok('I give Jackie the pasta: she eats, then a clue each time you talk (gentle, bubbly / fruity pouch / just tells you)',r.lbl2==='Give her the pasta'&&r.fed.join().includes('Plain pasta. Perfect')&&r.fed.join().includes('Bubbly')&&r.h2.join().includes('pouch')&&r.h3.join().includes("Mott's")&&r.h4.join().includes("Mott's")&&r.met&&r.fedSaved&&r.outOfBasket,[r.fed.join(),r.h2.join()].join(' / '));

// J. the right ones: Alex is thrilled, the EXIT sign lights up, out the door, Lil Q's sugar
r=await p.evaluate(()=>{T.lines(); const ge=SHOP_ITEMS.find(i=>i.id==='gingerale'), mo=SHOP_ITEMS.find(i=>i.id==='motts');
  T.go(ge.spot.x+ge.spot.w/2,ge.spot.y+6); update(16.7); action(); T.go(mo.spot.x+mo.spot.w/2,mo.spot.y+6); update(16.7); action();
  T.toAlex(); update(16.7); action(); const win=T.lines(); const hud=SCENES.lilqshop.hud(), mood=lq.mood, stage=have.fargoStage;
  update(16.7); const noGrab=(()=>{const it=SHOP_ITEMS[0]; return T.at(it.spot.x+it.spot.w/2,it.spot.y+6)})();
  T.toDoor(); for(let i=0;i<40&&scene===SCENES.lilqshop;i++){dirs.down=true; update(16.7)} dirs.down=false; T.settle();
  const out=scene===SCENES.fargo; const q=T.lines(); const thanks=T.btns(); if(!thanks.includes('Thanks, Lil Q!'))return {dbg:1,win,hud,mood,stage,noGrab,out,q,thanks,p:[P.x|0,P.y|0]}; T.click('Thanks, Lil Q!'); const reward=!$('reward').hidden; collectReward(); T.settle(); return {win,hud,mood,stage,noGrab,out,q,thanks,reward,done:!!have.fargo,car:!fargo.onFoot}});
ok('J ginger ale + Mott\'s: "You know me so well", Alex happy, HUD says head out the EXIT',r.win.join().includes('You know me so well')&&r.mood==='happy'&&r.stage==='reward'&&r.hud.includes('EXIT'),r.hud);
ok('J nothing left to grab once she\'s happy',!r.noGrab,r.noGrab);
ok('J out the door: Lil Q hands over the sugar, then back in the car',r.out&&r.q.join().includes('Sugar')&&r.thanks.includes('Thanks, Lil Q!')&&r.reward&&r.done&&r.car,JSON.stringify(r));

// K. reload in the middle of the shop errand
await fresh({welcomed:true,fargoIntro:true,fargoStage:'store'}); r=await p.evaluate(()=>{T.enter(); return {intro:!dlg.hidden,onFoot:fargo.onFoot,car:!!fargo.car,free:!blocked(P.x,P.y),hud:SCENES.fargo.hud()}});
ok('K reload mid-errand: parked at Lil Q\'s, on foot, no intro, the shop\'s open',!r.intro&&r.onFoot&&r.car&&r.free&&r.hud.includes('Go inside'),JSON.stringify(r));
await fresh({welcomed:true,fargoIntro:true,fargoStage:'race',raceHowTo:true}); r=await p.evaluate(()=>{T.enter(); return {car:!fargo.onFoot,hud:SCENES.fargo.hud()}});
ok('K reload after meeting Lil Q: driving, HUD says race her',r.car&&r.hud.includes('Race Lil Q'),r.hud);

// L. after baking: race Lil Q again (nothing else changes)
await fresh({welcomed:true,fargoIntro:true,fargo:true,baked:true,raceHowTo:true});
r=await p.evaluate(()=>{T.enter(); const s=STATIONS[0]; P.x=s.lot.x+10;P.y=s.lot.y+22; update(16.7); action(); const btns=T.btns(); T.click('Race Lil Q again'); T.settle(); const inRace=scene===SCENES.scooter;
  T.race('good'); for(let i=0;i<80&&dlg.hidden;i++)SCENES.scooter.ambient(16.7); const said=T.lines(); T.settle(); return {btns,inRace,said,back:scene===SCENES.fargo,car:!fargo.onFoot,stage:have.fargoStage||null}});
ok('L after baking: race Lil Q again; win and you\'re back on the road',r.btns.includes('Race Lil Q again')&&r.inRace&&r.said.join().includes("You're fast")&&r.back&&r.car&&!r.stage,JSON.stringify(r));

// M. the way out of town still works, and the hen doesn't ride the scooter
r=await p.evaluate(()=>{const x0=P.x; P.x=3;P.y=180; T.settle(); const left=scene===SCENES.world; scene=SCENES.scooter; have.gear={hen:1}; const hen=henEnt(); scene=SCENES.world; return {left,hen}});
ok('M leave Fargo by the highway; no Grp on the scooter',r.left&&!r.hen,JSON.stringify(r));
console.log(R.join('\n')); console.log('page errors:',errs.length?errs:'none'); await b.close()})();
