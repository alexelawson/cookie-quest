// The title screen: a snowy evening at the Craftsbury Outdoor Center. Barn-red buildings with white trim on the hill,
// Great Hosmer Pond frozen below, the ski stadium and finish banner, and Joe and Alex side by side in Santa hats (Grp too).
// Drawn on its own small canvas (128 x 96, scaled up), only while the title card is showing.
(function(){
  const c=$('titleArt'); if(!c)return;
  const g=c.getContext('2d'); g.imageSmoothingEnabled=false;
  const W=c.width, H=c.height, POND=58, SNOW=67;
  const F=(col,x,y,w,h)=>{g.fillStyle=col; g.fillRect(x,y,w,h)};
  let seed=11; const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
  const stars=Array.from({length:30},()=>({x:Math.floor(rnd()*W),y:Math.floor(rnd()*38),p:rnd()*6}));
  const flakes=Array.from({length:70},()=>({x:rnd()*W,y:rnd()*H,v:4+rnd()*7,s:rnd()<.25?2:1,ph:rnd()*6}));
  const still=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lightCols=['#e54b4b','#f4d35e','#5fa8e8','#7fd39a'];

  function sky(t){
    const grd=g.createLinearGradient(0,0,0,POND); grd.addColorStop(0,'#0f1434'); grd.addColorStop(.55,'#232a5c'); grd.addColorStop(1,'#5a5488');
    g.fillStyle=grd; g.fillRect(0,0,W,POND);
    for(const s of stars){ const on=Math.sin(t/700+s.p)>-.4; F(on?'#f7efdf':'#6d76a6',s.x,s.y,1,1) }
    F('#f3e9c8',108,7,7,7); F('#f3e9c8',107,9,9,3); F('#fff8e2',109,8,2,2);                                  // the moon
    // the far hills and the spruce along the far shore of the pond
    g.fillStyle='#262c5a'; g.beginPath(); g.moveTo(0,46); for(let x=0;x<=W;x+=6)g.lineTo(x,44+Math.sin(x/19)*3+Math.sin(x/7)*1); g.lineTo(W,POND); g.lineTo(0,POND); g.fill();
    for(let x=0;x<W;x+=3){const h=4+((x*7)%5); for(let k=0;k<h;k++){const w=Math.max(0,Math.round(k*.35)); F('#141a3c',x-w,POND-h-1+k,w*2+1,1)}}
  }
  function pond(){
    // Great Hosmer Pond, frozen and dusted with snow
    F('#aebcd6',0,POND,W,SNOW-POND); F('#c9d4e8',0,POND,W,1); for(const [x,y,w] of [[8,60,22],[44,62,30],[86,61,18],[20,64,14],[100,64,20]])F('#d8e1f0',x,y,w,1);
    // the boathouse on the shore, and its dock
    F('#8f2c26',94,52,16,8); F('#a8362f',95,53,14,7); F('#f2efe6',94,52,16,1); F('#f2efe6',94,52,1,8); F('#f2efe6',109,52,1,8);
    F('#ffffff',92,49,20,3); F('#e9eef7',93,48,18,2); F('#f2efe6',99,55,6,5); F('#6b4a2f',100,56,4,4);        // snowy roof, big doors
    F('#7a5a3a',84,60,12,2); F('#5a3a22',85,62,1,2); F('#5a3a22',94,62,1,2);
  }
  function lodge(t){
    // the main buildings on the hill: barn red, white trim, snow on the roofs, lit windows, lights along the eaves
    const bldg=(x,y,w,h,roof)=>{ F('rgba(0,0,0,.2)',x+2,y+h,w,2);
      F('#8f2c26',x,y,w,h); F('#a8362f',x+1,y+1,w-2,h-1); for(let k=y+3;k<y+h;k+=3)F('#94302a',x+1,k,w-2,1);
      F('#f2efe6',x,y,1,h); F('#f2efe6',x+w-1,y,1,h); F('#f2efe6',x,y,w,1);                                      // white trim
      const cx=x+w/2; for(let k=0;k<=roof;k++){const half=Math.round((w/2+1)*k/roof); F(k===roof?'#cfd8ea':'#ffffff',Math.round(cx)-half,y-roof+k,half*2,1); if(half>1)F('#e9eef7',Math.round(cx)+half-2,y-roof+k,2,1)}   // snowy gable roof, widest at the eaves
      F('#8f2c26',Math.round(cx)-2,y-roof+4,4,3); F('#ffd27a',Math.round(cx)-1,y-roof+5,2,2) };   // a little attic window
    bldg(30,48,18,18,7); bldg(2,44,30,23,10);
    for(const [x,y] of [[6,50],[14,50],[22,50],[6,58],[22,58],[34,53],[41,53]]){F('#f2efe6',x-1,y-1,6,6); F('#ffd27a',x,y,4,4); F('#ffb347',x,y,4,1); F('#a8362f',x+1,y,1,4)}
    F('#2e5a3a',13,58,6,9); F('#f2efe6',12,57,8,1); F('#e2c35a',17,62,1,1);                                     // the front door
    for(let a=0;a<8;a++){const r=a/8*Math.PI*2; F(a%3?'#2f6b36':'#3d8443',16+Math.round(Math.cos(r)*2),61+Math.round(Math.sin(r)*2),1,1)} F('#c8322b',15,63,2,1);   // wreath on the door
    for(let x=3;x<47;x+=3)F(lightCols[(x/3+Math.floor(t/500))%4],x,x<31?45+((x/3)%2):49+((x/3)%2),1,1);        // string lights on the eaves
    F('rgba(255,210,122,.12)',0,64,50,6);
  }
  function stadium(t){
    // the snow and the trails: corduroy and two classic tracks curving through
    F('#e3e9f4',0,SNOW,W,H-SNOW); F('#ffffff',0,SNOW,W,1);
    for(let y=SNOW+4;y<H;y+=2)F('#d6deec',52+(y-SNOW)*.6|0,y,W,1);                                              // groomed corduroy
    for(let y=SNOW+3;y<H;y++){const x=48+(y-SNOW)*.6|0; F('#b9c6dc',x,y,1,1); F('#b9c6dc',x+4,y,1,1)}            // classic tracks
    // the finish: two posts, a blue banner, the clock
    F('#3a3f52',92,62,2,22); F('#3a3f52',124,62,2,22); F('#2f6db0',92,62,34,8); F('#1d3f73',92,69,34,1); F('#ffffff',92,62,34,1);
    pixText(g,'FINISH',97,64,'#ffffff');
    F('#1d1d22',108,74,17,7); F('#3a3f52',115,81,2,5); const on=Math.floor(t/1000)%2; pixText(g,on?'1:24':'1:25',109,75,'#ff5a4a');
    // stadium fencing along the trail, with a few lights strung on it
    F('#5f6676',84,86,44,1); for(let x=84;x<128;x+=6){F('#5f6676',x,83,1,6); F(lightCols[(x/6+Math.floor(t/450))%4],x+3,85,1,1)}
    F('#3d6fb0',84,87,44,2); F('#f4d35e',84,87,44,1);
  }
  function snow(t,dt){
    for(const f of flakes){
      if(!still){f.y+=f.v*dt/1000; f.x+=Math.sin(t/900+f.ph)*.08; if(f.y>H){f.y=-2; f.x=Math.random()*W}}
      F(f.s>1?'#ffffff':'rgba(255,255,255,.8)',Math.round(f.x),Math.round(f.y),f.s,f.s);
    }
  }
  function santaHat(x,top,flop){ // brim on the head, red cone flopping to one side, white pompom
    F('#c8322b',x-4,top-2,9,2); F('#c8322b',x-3,top-4,7,2); F('#c8322b',x-1,top-5,4,1); F('#c8322b',x+1*flop+1,top-6,3,1); F('#c8322b',x+3*flop+1,top-5,2,2);
    F('#e8584c',x-3,top-4,2,1); F('#f7f5ef',x-5,top,11,2); F('#ffffff',x-5,top,11,1); F('#ffffff',x+4*flop+1,top-5,2,2) }
  function cast(t){
    // Joe in his jersey and Alex, side by side in Santa hats; Grp at their feet, pecking at the snow
    const joe={x:58,y:91,dir:'down',moving:false,step:0};
    drawJoeJersey(joe,g); santaHat(58,70,1);
    drawAlex(72,91,'ok',g); santaHat(72,70,-1);
    const peck=!still&&(t%2600)<380?1:0, hop=!still&&(t%2600)>1300&&(t%2600)<1460?1:0;
    drawGrp(86,91+peck-hop,-1,'world',false,g);
  }
  let last=performance.now(), raf=0;
  function frame(now){
    raf=0; if($('titlecard').hidden)return;
    const dt=Math.min(50,now-last); last=now;
    sky(now); pond(); stadium(now); lodge(now); cast(now); snow(now,dt);
    raf=requestAnimationFrame(frame);
  }
  function go(){ if(!raf&&!$('titlecard').hidden){last=performance.now(); raf=requestAnimationFrame(frame)} }
  go();
  new MutationObserver(go).observe($('titlecard'),{attributes:true,attributeFilter:['hidden']});
})();
