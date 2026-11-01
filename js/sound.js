// Sound. Everything is synthesized with the Web Audio API, so there are no sound files.
// sfx('name') plays one of the sounds in SFX. Music plays during the Cookie Dance.
// Turn sound on/off in ⚙ Settings (remembered per browser).
const SOUND={VOLUME:.5, KEY:'cookie-quest-sound'};
let actx=null, master=null, muted=false, noiseBuf=null;
try{ muted=localStorage.getItem(SOUND.KEY)==='off' }catch(e){}
function audioInit(){
  if(!actx){ const AC=window.AudioContext||window.webkitAudioContext; if(!AC)return;
    actx=new AC(); master=actx.createGain(); master.gain.value=muted?0:SOUND.VOLUME; master.connect(actx.destination);
    noiseBuf=actx.createBuffer(1,actx.sampleRate,actx.sampleRate); const d=noiseBuf.getChannelData(0); for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1 }
  if(actx.state==='suspended')actx.resume();
}
addEventListener('pointerdown',audioInit); addEventListener('keydown',audioInit);   // browsers only allow sound after a tap or key
function setSound(on){ muted=!on; try{localStorage.setItem(SOUND.KEY,on?'on':'off')}catch(e){} if(master)master.gain.value=on?SOUND.VOLUME:0; if(!on)stopMusic() }
// one note: frequency (Hz), length (s), and options
function tone(freq,dur,{type='square',vol=.12,at=0,slide=0}={}){
  if(!actx||muted)return; const t=actx.currentTime+at, o=actx.createOscillator(), g=actx.createGain();
  o.type=type; o.frequency.setValueAtTime(freq,t); if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(30,freq+slide),t+dur);
  g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(vol,t+.006); g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  o.connect(g); g.connect(master); o.start(t); o.stop(t+dur+.03);
}
// a burst of filtered noise (splashes, whooshes, cracks)
function noise(dur,{vol=.15,at=0,freq=1200,q=1}={}){
  if(!actx||muted)return; const t=actx.currentTime+at, s=actx.createBufferSource(), f=actx.createBiquadFilter(), g=actx.createGain();
  s.buffer=noiseBuf; f.type='bandpass'; f.frequency.value=freq; f.Q.value=q;
  g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  s.connect(f); f.connect(g); g.connect(master); s.start(t); s.stop(t+dur+.02);
}
const SFX={
  blip:()=>tone(660,.05,{vol:.04}),                                   // dialog opens
  next:()=>tone(520,.035,{vol:.03}),                                  // next page
  reward:()=>[523,659,784,1046].forEach((f,i)=>tone(f,.2,{vol:.08,at:i*.08,type:'triangle'})),
  pop:()=>tone(700,.1,{vol:.09,slide:500,type:'sine'}),               // into the basket
  pickup:()=>{tone(784,.08,{vol:.08}); tone(1046,.14,{vol:.08,at:.07})},
  cluck:()=>{tone(720,.05,{vol:.06,slide:-260,type:'sawtooth'}); tone(620,.06,{vol:.05,slide:-200,at:.07,type:'sawtooth'})},
  drop:()=>tone(330,.12,{vol:.08,slide:220,type:'triangle'}),
  click:()=>tone(1500,.012,{vol:.035}),
  ding:()=>{tone(1318,.6,{vol:.1,type:'sine'}); tone(1976,.45,{vol:.04,type:'sine'})},
  buzz:()=>tone(140,.28,{vol:.1,type:'sawtooth'}),
  good:()=>{tone(659,.08,{vol:.07}); tone(988,.14,{vol:.07,at:.06})},
  bad:()=>tone(230,.2,{vol:.08,slide:-90}),
  whoosh:()=>noise(.25,{vol:.12,freq:900}),
  splash:()=>{noise(.5,{vol:.2,freq:500}); noise(.3,{vol:.08,freq:2000,at:.05})},
  thud:()=>tone(110,.16,{vol:.16,type:'sine',slide:-50}),
  chains:()=>[2093,2637,2349,2793,2489].forEach((f,i)=>tone(f,.3,{vol:.035,at:i*.035,type:'triangle'})),
  crash:()=>{noise(.35,{vol:.2,freq:300}); tone(160,.22,{vol:.1,slide:-90})},
  ping:()=>tone(1760,.7,{vol:.07,type:'sine',slide:-700}),            // sonar
  alarm:()=>[0,1,2].forEach(i=>{tone(880,.12,{vol:.08,at:i*.26}); tone(660,.12,{vol:.08,at:i*.26+.13})}),
  chunk:()=>{noise(.14,{vol:.25,freq:220}); tone(80,.25,{vol:.14})},  // the big switch
  pole:()=>tone(1200,.03,{vol:.05,type:'triangle'}),
  beat:()=>tone(440,.03,{vol:.02,type:'sine'}),                       // rhythm tick on climbs
  crack:()=>noise(.07,{vol:.2,freq:2600,q:2}),
  glug:()=>tone(180+Math.random()*90,.07,{vol:.05,type:'sine',slide:140}),
  shake:()=>noise(.07,{vol:.07,freq:5200}),
  stir:()=>noise(.09,{vol:.06,freq:650}),
  fanfare:()=>[[523,0],[659,.12],[784,.24],[1046,.36],[784,.54],[1046,.66]].forEach(([f,a])=>tone(f,.22,{vol:.08,at:a})),
  hug:()=>[659,784,988,1318].forEach((f,i)=>tone(f,.35,{vol:.06,at:i*.13,type:'sine'})),
  crown:()=>[1046,1318,1568,2093].forEach((f,i)=>tone(f,.28,{vol:.06,at:i*.06,type:'triangle'})),
  jump:()=>tone(260,.3,{vol:.09,slide:600}),
  boing:()=>tone(180,.45,{vol:.11,type:'sine',slide:320}),
};
function sfx(name){ try{ audioInit(); SFX[name]&&SFX[name]() }catch(e){} }
// ---- music: Jingle Bells (public domain) as a little chiptune, for the Cookie Dance ----
const JINGLE=(()=>{const E=330,F=349,G=392,C=262,D=294; return [[E,1],[E,1],[E,2],[E,1],[E,1],[E,2],[E,1],[G,1],[C,1.5],[D,.5],[E,4],
  [F,1],[F,1],[F,1.5],[F,.5],[F,1],[E,1],[E,1],[E,.5],[E,.5],[E,1],[D,1],[D,1],[E,1],[D,2],[G,2]]})();
const BEATSEC=.21;   // one quarter note (two per Cookie Dance step)
let musicTimer=null;
function playMusic(){
  if(musicTimer||muted)return; audioInit(); if(!actx)return;
  let at=.05; for(const [f,b] of JINGLE){ tone(f*2,b*BEATSEC*.9,{vol:.045,at}); at+=b*BEATSEC }
  for(let k=0;k<at/BEATSEC/2;k++)tone(k%2?98:131,BEATSEC*1.6,{vol:.05,at:.05+k*BEATSEC*2,type:'triangle'});   // oom-pah bass
  musicTimer=setTimeout(()=>{musicTimer=null; playMusic()},(at-.05)*1000);
}
function stopMusic(){ clearTimeout(musicTimer); musicTimer=null }
