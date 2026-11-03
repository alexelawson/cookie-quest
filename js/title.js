// The title screen: a snowy night outside the kitchen, Joe and Grp waiting to start.
// Drawn on its own small canvas (128 x 96, scaled up), only while the title card is showing.
(function(){
  const c=$('titleArt'); if(!c)return;
  const g=c.getContext('2d'); g.imageSmoothingEnabled=false;
  const W=c.width, H=c.height, GROUND=78;
  const F=(col,x,y,w,h)=>{g.fillStyle=col; g.fillRect(x,y,w,h)};
  // fixed stars and falling snow (seeded, so the sky is the same every time)
  let seed=7; const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
  const stars=Array.from({length:34},()=>({x:Math.floor(rnd()*W),y:Math.floor(rnd()*50),p:rnd()*6}));
  const flakes=Array.from({length:70},()=>({x:rnd()*W,y:rnd()*H,v:4+rnd()*7,s:rnd()<.25?2:1,ph:rnd()*6}));
  const still=matchMedia('(prefers-reduced-motion: reduce)').matches;

  function sky(t){
    const grd=g.createLinearGradient(0,0,0,GROUND); grd.addColorStop(0,'#0c1028'); grd.addColorStop(.6,'#18204a'); grd.addColorStop(1,'#2a3466');
    g.fillStyle=grd; g.fillRect(0,0,W,GROUND);
    for(const s of stars){ const on=Math.sin(t/700+s.p)>-.4; F(on?'#f7efdf':'#6d76a6',s.x,s.y,1,1) }
    F('#f3e9c8',104,9,9,9); F('#f3e9c8',103,11,11,5); F('#fff8e2',105,10,3,3); F('#d9cfae',109,14,2,2);   // the moon
    // far hills and pines
    g.fillStyle='#141a3c'; g.beginPath(); g.moveTo(0,62); for(let x=0;x<=W;x+=8)g.lineTo(x,58+Math.sin(x/17)*4+Math.sin(x/7)*1.5); g.lineTo(W,GROUND); g.lineTo(0,GROUND); g.fill();
    for(const [x,h] of [[4,14],[16,10],[88,12],[96,16],[120,11]]){ for(let k=0;k<h;k++){const w=Math.max(1,Math.round(k*.45)); F('#0f1532',x-w,GROUND-h-2+k,w*2+1,1)} }
  }
  function cabin(){
    // the kitchen, glowing
    F('#5a3a2a',8,58,30,20); F('#6e4632',8,58,30,2); for(let y=62;y<78;y+=4)F('#4a2e22',8,y,30,1);
    F('#e9eef7',5,52,36,6); F('#ffffff',7,50,32,3); F('#cfd8ea',5,57,36,1);                       // snowy roof
    F('#7a4a36',31,44,5,8); F('#ffffff',30,43,7,2);                                               // chimney
    F('#ffd27a',13,63,8,7); F('#ffb347',13,63,8,1); F('#5a3a2a',16,63,1,7); F('#5a3a2a',13,66,8,1); // window
    F('#2e5a3a',26,64,7,14); F('#c8322b',28,66,3,3); F('#e2c35a',31,70,1,1);                    // door with a wreath
    F('rgba(255,210,122,.18)',10,70,14,8);
  }
  function tree(t){
    // a pine wrapped in lights
    const x=108, base=GROUND;
    F('#4a2e22',x-1,base-4,3,4);
    for(let k=0;k<22;k++){const w=Math.round(k*.42)+1; F(k%5===4?'#1f5a34':'#2a6e3f',x-w,base-26+k,w*2+1,1)}
    F('#f4d35e',x,base-28,1,2); F('#f4d35e',x-1,base-27,3,1);
    const cols=['#e54b4b','#f4d35e','#5fa8e8','#7fd39a'];
    [[-3,-19],[2,-16],[-5,-12],[4,-9],[-7,-6],[1,-6],[6,-4],[-2,-14]].forEach(([dx,dy],i)=>F(cols[(i+Math.floor(t/500))%4],x+dx,base+dy,1,1));
    F('#ffffff',x-4,base-21,3,1); F('#ffffff',x+1,base-13,4,1); F('#ffffff',x-6,base-8,4,1);
  }
  function ground(){
    F('#dfe6f3',0,GROUND,W,H-GROUND); F('#ffffff',0,GROUND,W,1); F('#c7d1e6',0,GROUND+1,W,1);
    for(const [x,y,w] of [[20,84,10],[50,90,14],[86,86,9],[112,92,12],[4,92,8]])F('#c7d1e6',x,y,w,1);
    F('#cfd8ea',40,79,48,1);
  }
  function snow(t,dt){
    for(const f of flakes){
      if(!still){f.y+=f.v*dt/1000; f.x+=Math.sin(t/900+f.ph)*.08; if(f.y>H){f.y=-2; f.x=Math.random()*W}}
      F(f.s>1?'#ffffff':'rgba(255,255,255,.8)',Math.round(f.x),Math.round(f.y),f.s,f.s);
    }
  }
  function cast(t){
    // Joe in whatever he picked (or his jersey), and Grp beside him pecking at the snow
    const joe={x:58,y:GROUND+10,dir:'down',moving:false,step:0};
    const look=have.look&&have.look!=='jersey'&&typeof OUTFIT_LOOK!=='undefined'&&OUTFIT_LOOK[have.look];
    if(look)drawHero(joe,g,look); else drawJoeJersey(joe,g);
    typeof drawGear==='function'&&drawGear(joe,g,look||null);
    const peck=!still&&(t%2600)<380?1:0, hop=!still&&(t%2600)>1300&&(t%2600)<1460?1:0;
    drawGrp(76,GROUND+10+peck-hop,-1,'world',false,g);
  }
  let last=performance.now(), raf=0;
  function frame(now){
    raf=0; if($('titlecard').hidden)return;
    const dt=Math.min(50,now-last); last=now;
    sky(now); cabin(); ground(); tree(now); cast(now); snow(now,dt);
    raf=requestAnimationFrame(frame);
  }
  function go(){ if(!raf&&!$('titlecard').hidden){last=performance.now(); raf=requestAnimationFrame(frame)} }
  go();
  new MutationObserver(go).observe($('titlecard'),{attributes:true,attributeFilter:['hidden']});
})();
