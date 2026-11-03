// Sizing the game window so every game pixel is the same size on screen.
// The game draws at 224 x 168. If it can be shown at a whole-number scale (3x, 4x...) without shrinking much, the window is sized
// to exactly that and the browser's pixelated scaling does the rest (crisp). If not (small phones), the frame is copied into a
// bigger canvas at a whole-number scale and the browser shrinks that one smoothly, so pixels stay even instead of lumpy.
// The title art (128 x 96) gets the same treatment.
const FIT={MIN_KEEP:.85};   // use the crisp whole-number size if it keeps at least 85% of the room we have
const fit={k:1, smooth:false, K:1};
const presentCv=$('present'), presentG=presentCv.getContext('2d');
function fitGame(){
  const app=document.querySelector('.app'), scr=document.querySelector('.screen'), dpr=window.devicePixelRatio||1, cs=getComputedStyle(document.body);
  app.classList.add('measuring');   // (the phone's controls stretch to fill the screen; measure them at their natural size)
  const frame=scr.offsetWidth-scr.clientWidth, sr=scr.getBoundingClientRect();
  app.classList.remove('measuring');
  const roomW=innerWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight)-($('console').getBoundingClientRect().width-sr.width)-frame;    // everything around the screen stays the same size
  const kids=[...app.children].filter(e=>!e.hidden&&getComputedStyle(e).display!=='none'), gap=parseFloat(getComputedStyle(app).rowGap)||0;
  const used=kids.reduce((h,e)=>h+e.getBoundingClientRect().height,0)+gap*(kids.length-1);
  const roomH=innerHeight-parseFloat(cs.paddingTop)-parseFloat(cs.paddingBottom)-(used-sr.height)-frame;
  const s=Math.max(1,Math.min(roomW/VW,roomH/VH))*dpr, k=Math.floor(s);   // in device pixels per game pixel
  let cssW;
  if(k>=2&&k/s>=FIT.MIN_KEEP){ fit.smooth=false; fit.k=k; cssW=VW*k/dpr }
  else { fit.smooth=true; fit.K=Math.ceil(s); cssW=VW*s/dpr }
  document.documentElement.style.setProperty('--gw',cssW+'px');
  document.documentElement.style.setProperty('--gh',cssW*VH/VW+'px');
  presentCv.hidden=!fit.smooth; cv.classList.toggle('under',fit.smooth);
  if(fit.smooth){ presentCv.width=VW*fit.K; presentCv.height=VH*fit.K; presentG.imageSmoothingEnabled=false }
  // the title art: same idea, its own whole-number copy
  const t=$('titleArt'); if(t){ const tk=Math.ceil(cssW*dpr/t.width); titleUp.width=t.width*tk; titleUp.height=t.height*tk; titleUp.getContext('2d').imageSmoothingEnabled=false }
}
// copy the frame up (only in the smooth mode)
function presentFrame(){ if(fit.smooth){ presentG.drawImage(cv,0,0,presentCv.width,presentCv.height) } }
// the title: draw its canvas up into a whole-number copy every frame it's showing
const titleUp=document.createElement('canvas'); titleUp.id='titleUp'; titleUp.setAttribute('aria-hidden','true');
$('titleArt').after(titleUp);
(function titleLoop(){ if(!$('titlecard').hidden){ const g=titleUp.getContext('2d'); g.imageSmoothingEnabled=false; g.drawImage($('titleArt'),0,0,titleUp.width,titleUp.height) } requestAnimationFrame(titleLoop) })();
// a little pixel gear for the menu button
{const g=$('gearArt').getContext('2d'), rows=["....X.X....","..X.XXX.X..",".XXXXXXXXX.","..XXX.XXX..","XXXX...XXXX",".XX.....XX.","XXXX...XXXX","..XXX.XXX..",".XXXXXXXXX.","..X.XXX.X..","....X.X...."];
 rows.forEach((r,y)=>[...r].forEach((c,x)=>{if(c==='X'){g.fillStyle='#f7efdf';g.fillRect(x,y,1,1)}}))}
addEventListener('resize',fitGame); matchMedia('(pointer:coarse)').addEventListener?.('change',fitGame);
new MutationObserver(fitGame).observe($('crewbar'),{attributes:true,attributeFilter:['hidden']});
document.fonts&&document.fonts.ready.then(fitGame);
fitGame();
