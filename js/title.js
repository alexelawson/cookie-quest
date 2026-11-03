// The title screen: a snowy evening at the Craftsbury Outdoor Center. The big red barn with white trim and its silo, a cedar cabin,
// the solar array, Great Hosmer Pond frozen below, the ski stadium and finish banner, and Joe and Alex side by side in Santa hats (Grp too).
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
    // Great Hosmer Pond, frozen and dusted with snow, with a little dock
    F('#aebcd6',0,POND,W,SNOW-POND); F('#c9d4e8',0,POND,W,1); for(const [x,y,w] of [[8,60,22],[44,62,30],[86,61,18],[20,64,14],[100,64,20]])F('#d8e1f0',x,y,w,1);
    F('#7a5a3a',70,60,14,2); F('#5a3a22',71,62,1,2); F('#5a3a22',82,62,1,2); F('#ffffff',70,59,14,1);
  }
  function solar(){
    // the solar array by the trails: a big panel facing us on a post, snow along its top edge
    F('#5f6676',110,54,3,10); F('#4a5060',108,63,7,1);
    F('#c9ced4',97,40,28,15); F('#2f4f9a',98,41,26,13);
    for(let r=0;r<4;r++)for(let k=0;k<8;k++){const x=98+k*3+Math.floor(k/4), y=41+r*3+Math.floor(r/2); F('#3a5fb4',x,y,2,2); F('#5a80d0',x,y,1,1)}
    F('#ffffff',97,39,28,2); F('#e9eef7',98,41,26,1);
  }
  function lodge(t){
    // the big red barn with white trim and a round silo (snow on the roofs, lights along the eaves),
    // and a natural-wood cabin beside it
    // the silo
    F('#8f2c26',2,38,10,29); F('#a8362f',4,38,5,29); F('#7a2420',10,38,2,29); for(let y=42;y<66;y+=5)F('#94302a',2,y,10,1);
    for(let k=0;k<6;k++)F(k<2?'#ffffff':'#e9eef7',7-k,32+k,k*2+1,1); F('#f2efe6',1,38,12,1);
    // the barn: steep gable, white fascia, white-trimmed windows and doors
    const x=12, y=46, w=32, h=21, cx=x+w/2, roof=13;
    F('rgba(0,0,0,.2)',x+2,y+h,w,2);
    F('#8f2c26',x,y,w,h); F('#a8362f',x+1,y,w-2,h); for(let k=x+3;k<x+w;k+=3)F('#94302a',k,y,1,h);         // board-and-batten
    for(let k=0;k<=roof;k++){const half=Math.round((w/2)*k/roof); F('#a8362f',Math.round(cx)-half,y-roof+k,half*2,1)}            // the gable end
    for(let k=0;k<=roof;k++){const half=Math.round((w/2+1)*k/roof); F('#ffffff',Math.round(cx)-half-1,y-roof+k,2,1); F('#ffffff',Math.round(cx)+half-1,y-roof+k,2,1)}   // white fascia (and snow) along the roof edge
    F('#f2efe6',x,y,1,h); F('#f2efe6',x+w-1,y,1,h);                                                        // corner trim
    F('#f2efe6',Math.round(cx)-3,y-8,6,5); F('#2b2f3a',Math.round(cx)-2,y-7,4,3);                          // hayloft door
    for(const wx of [x+3,x+8,x+20,x+25]){F('#f2efe6',wx-1,y+3,6,5); F('#ffd27a',wx,y+4,4,3); F('#f2efe6',wx+1,y+4,1,3)}   // a row of windows
    F('#f2efe6',Math.round(cx)-5,y+10,10,11); F('#7a2420',Math.round(cx)-4,y+11,8,10); F('#f2efe6',Math.round(cx)-4,y+11,8,1);   // big doors, X-braced
    for(let k=0;k<8;k++){F('#f2efe6',Math.round(cx)-4+k,y+11+Math.round(k*1.2),1,1); F('#f2efe6',Math.round(cx)+3-k,y+11+Math.round(k*1.2),1,1)}
    for(let a=0;a<8;a++){const r=a/8*Math.PI*2; F(a%3?'#2f6b36':'#3d8443',Math.round(cx)+Math.round(Math.cos(r)*3),y-12+Math.round(Math.sin(r)*2)+9,1,1)}   // wreath over the hayloft
    for(let k=0;k<=roof;k+=2){const half=Math.round((w/2+1)*k/roof); F(lightCols[(k/2+Math.floor(t/500))%4],Math.round(cx)-half-2,y-roof+k+1,1,1); F(lightCols[(k/2+1+Math.floor(t/500))%4],Math.round(cx)+half,y-roof+k+1,1,1)}   // lights along the roofline
    // a natural-wood cabin: cedar planks, a deep snowy overhang, one lit window
    F('rgba(0,0,0,.2)',47,67,16,2);
    F('#b8834e',46,50,16,17); for(let yy=52;yy<67;yy+=2)F('#a06f3e',46,yy,16,1); F('#c9945e',46,50,1,17);
    F('#6b4a2f',44,47,20,3); F('#ffffff',44,46,20,2); F('#e9eef7',45,48,18,1);                             // the roof overhang
    F('#2f5a4a',49,53,6,5); F('#ffd27a',50,54,4,3); F('#6b4a2f',56,58,4,9); F('#8a6a4a',57,59,2,8);         // window, door
    F('rgba(255,210,122,.12)',0,62,64,6);
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
    sky(now); pond(); solar(); stadium(now); lodge(now); cast(now); snow(now,dt);
    raf=requestAnimationFrame(frame);
  }
  function go(){ if(!raf&&!$('titlecard').hidden){last=performance.now(); raf=requestAnimationFrame(frame)} }
  go();
  new MutationObserver(go).observe($('titlecard'),{attributes:true,attributeFilter:['hidden']});
})();
