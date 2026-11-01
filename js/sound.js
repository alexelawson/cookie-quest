// Sound. Everything is synthesized with the Web Audio API, so there are no sound files.
// sfx('name') plays one of the sounds in SFX. Music plays during the Cookie Dance.
// Turn sound on/off in ⚙ Settings (remembered per browser).
const SOUND={VOLUME:.5, MUSIC:.45, KEY:'cookie-quest-sound', MUSIC_KEY:'cookie-quest-music'};   // MUSIC: background music loudness (0 to 1), relative to the sounds
let actx=null, master=null, muted=false, musicOn=true, noiseBuf=null;
try{ muted=localStorage.getItem(SOUND.KEY)==='off'; musicOn=localStorage.getItem(SOUND.MUSIC_KEY)!=='off' }catch(e){}
function audioInit(){
  if(!actx){ const AC=window.AudioContext||window.webkitAudioContext; if(!AC)return;
    actx=new AC(); master=actx.createGain(); master.gain.value=muted?0:SOUND.VOLUME; master.connect(actx.destination);
    noiseBuf=actx.createBuffer(1,actx.sampleRate,actx.sampleRate); const d=noiseBuf.getChannelData(0); for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1 }
  if(actx.state==='suspended')actx.resume();
}
addEventListener('pointerdown',audioInit); addEventListener('keydown',audioInit);   // browsers only allow sound after a tap or key
function setSound(on){ muted=!on; try{localStorage.setItem(SOUND.KEY,on?'on':'off')}catch(e){} if(master)master.gain.value=on?SOUND.VOLUME:0; if(on)sceneMusic(); else stopSong() }
function setMusic(on){ musicOn=on; try{localStorage.setItem(SOUND.MUSIC_KEY,on?'on':'off')}catch(e){} if(on)sceneMusic(); else stopSong() }
// one note: frequency (Hz), length (s), and options
function tone(freq,dur,{type='square',vol=.12,at=0,slide=0,out=null}={}){
  if(!actx||muted)return; const t=actx.currentTime+at, o=actx.createOscillator(), g=actx.createGain();
  o.type=type; o.frequency.setValueAtTime(freq,t); if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(30,freq+slide),t+dur);
  g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(vol,t+.006); g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  o.connect(g); g.connect(out||master); o.start(t); o.stop(t+dur+.03);
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
// ---- background music: a little chiptune loop for each place ----
// Each song: tempo (bpm), a lead line and a bass line. Notes are written 'E5:1' = the note E5 for 1 beat; 'R:2' = rest 2 beats.
// Each line loops; keep the lead and bass the same total length. The scene picks its song with `music:` (e.g. SCENES.golf music:'golf').
const SONGS={
  // the farm: a hoedown-ish country tune (original)
  farm:{bpm:118, lead:`G4:1 B4:1 D5:1 B4:1 C5:1 E5:1 D5:1 B4:1 A4:1 B4:1 C5:1 A4:1 G4:1 A4:1 B4:1 D4:1
    G4:1 B4:1 D5:1 G5:1 E5:1 D5:1 C5:1 E5:1 D5:1 B4:1 A4:1 F#4:1 G4:3 R:1
    E5:1 E5:1 D5:1 B4:1 C5:1 C5:1 B4:1 G4:1 A4:1 A4:1 B4:1 C5:1 D5:2 R:2
    E5:1 D5:1 C5:1 B4:1 A4:1 C5:1 B4:1 A4:1 G4:1 A4:1 B4:1 A4:1 G4:3 R:1`,
    bass:`G2:1 D3:1 G2:1 D3:1 C3:1 G2:1 C3:1 G2:1 D3:1 A2:1 D3:1 A2:1 G2:1 D3:1 G2:1 D3:1
    G2:1 D3:1 G2:1 D3:1 C3:1 G2:1 C3:1 G2:1 D3:1 A2:1 D3:1 F#2:1 G2:1 D3:1 G2:1 R:1
    C3:1 G2:1 C3:1 G2:1 C3:1 G2:1 E2:1 G2:1 D3:1 A2:1 D3:1 A2:1 D3:1 A2:1 D3:1 F#2:1
    C3:1 G2:1 C3:1 G2:1 D3:1 A2:1 D3:1 A2:1 D3:1 A2:1 D3:1 F#2:1 G2:1 D3:1 G2:1 R:1`, leadType:'square'},
  // Wylee Woods: a breezy summer-afternoon tune (original)
  golf:{bpm:96, lead:`C5:1 A4:.5 C5:.5 D5:1 C5:1 A4:1 G4:.5 A4:.5 F4:2 G4:1 A4:.5 Bb4:.5 C5:1 D5:1 C5:3 R:1
    C5:1 A4:.5 C5:.5 F5:1 E5:1 D5:1 C5:.5 D5:.5 A4:2 G4:1 A4:.5 G4:.5 E4:1 G4:1 F4:3 R:1`,
    bass:`F2:2 C3:2 F2:2 A2:2 Bb2:2 F2:2 C3:2 G2:2 F2:2 A2:2 Bb2:2 D3:2 C3:2 G2:2 F2:2 C3:2`, leadType:'triangle', leadVol:.07},
  // the Birkie: In the Hall of the Mountain King (Grieg, Norwegian, public domain)
  birkie:{bpm:132, lead:`A3:.5 B3:.5 C4:.5 D4:.5 E4:.5 C4:.5 E4:1 D#4:.5 B3:.5 D#4:1 D4:.5 Bb3:.5 D4:1
    A3:.5 B3:.5 C4:.5 D4:.5 E4:.5 C4:.5 E4:.5 A4:.5 G4:.5 E4:.5 C4:.5 E4:.5 G4:2
    E4:.5 F#4:.5 G4:.5 A4:.5 B4:.5 G4:.5 B4:1 A#4:.5 F#4:.5 A#4:1 A4:.5 F4:.5 A4:1
    E4:.5 F#4:.5 G4:.5 A4:.5 B4:.5 G4:.5 B4:.5 E5:.5 D5:.5 B4:.5 G4:.5 B4:.5 D5:2`,
    bass:`A2:1 A2:1 A2:1 A2:1 B2:1 B2:1 Bb2:1 Bb2:1 A2:1 A2:1 A2:1 A2:1 C3:1 C3:1 C3:1 C3:1
    E2:1 E2:1 E2:1 E2:1 F#2:1 F#2:1 F2:1 F2:1 E2:1 E2:1 E2:1 E2:1 G2:1 G2:1 G2:1 G2:1`, leadType:'square'},
  // the heist: sneaky, on tiptoes (original)
  heist:{bpm:108, lead:`R:2 B4:.5 C5:.5 B4:1 R:4 R:2 E5:.5 D5:.5 B4:1 R:2 G4:1 A4:1
    R:2 B4:.5 C5:.5 B4:1 R:2 G5:.5 F#5:.5 E5:1 Bb4:2 B4:2 R:4`,
    bass:`E2:.5 R:.5 E2:.5 G2:.5 R:.5 A2:.5 R:.5 Bb2:.5 B2:.5 R:.5 A2:.5 R:.5 G2:.5 R:.5 E2:1
    E2:.5 R:.5 E2:.5 G2:.5 R:.5 A2:.5 R:.5 Bb2:.5 B2:.5 R:.5 A2:.5 R:.5 G2:.5 R:.5 E2:1
    E2:.5 R:.5 E2:.5 G2:.5 R:.5 A2:.5 R:.5 Bb2:.5 B2:.5 R:.5 A2:.5 R:.5 G2:.5 R:.5 E2:1
    C3:.5 R:.5 C3:.5 B2:.5 R:.5 Bb2:.5 R:.5 A2:.5 B2:.5 R:.5 B2:.5 R:.5 D3:.5 R:.5 E2:1`, leadType:'triangle', leadVol:.075, bassType:'triangle'},
  // Fargo: windows down, summer road trip (original)
  fargo:{bpm:138, lead:`E5:1 G5:.5 E5:.5 D5:1 C5:1 D5:.5 E5:.5 D5:.5 C5:.5 A4:2 C5:1 D5:.5 E5:.5 G5:1 A5:1 G5:3 R:1
    A5:1 G5:.5 E5:.5 D5:1 E5:1 G5:.5 E5:.5 D5:.5 C5:.5 D5:2 E5:1 D5:.5 C5:.5 A4:1 D5:1 C5:3 R:1`,
    bass:`C3:1 G2:1 C3:1 G2:1 A2:1 E2:1 A2:1 E2:1 F2:1 C3:1 F2:1 C3:1 G2:1 D3:1 G2:1 D3:1
    F2:1 C3:1 F2:1 C3:1 C3:1 G2:1 A2:1 E2:1 F2:1 C3:1 G2:1 D3:1 C3:1 G2:1 C3:1 R:1`, leadType:'square'},
  // home: Deck the Halls (traditional, public domain), cozy
  kitchen:{bpm:100, lead:`C5:1.5 Bb4:.5 A4:1 G4:1 F4:1 G4:1 A4:1 F4:1 G4:.5 A4:.5 Bb4:.5 G4:.5 A4:1.5 G4:.5 F4:1 E4:1 F4:2
    C5:1.5 Bb4:.5 A4:1 G4:1 F4:1 G4:1 A4:1 F4:1 G4:.5 A4:.5 Bb4:.5 G4:.5 A4:1.5 G4:.5 F4:1 E4:1 F4:2
    G4:1.5 A4:.5 Bb4:1 G4:1 A4:1.5 Bb4:.5 C5:1 G4:1 A4:.5 B4:.5 C5:1 D5:.5 E5:.5 F5:1 E5:1 D5:1 C5:2
    C5:1.5 Bb4:.5 A4:1 G4:1 F4:1 G4:1 A4:1 F4:1 D5:.5 D5:.5 D5:.5 D5:.5 C5:1.5 Bb4:.5 A4:1 G4:1 F4:2`,
    bass:`F2:2 C3:2 F2:2 F2:2 Bb2:2 F2:2 C3:2 F2:2 F2:2 C3:2 F2:2 F2:2 Bb2:2 F2:2 C3:2 F2:2
    C3:2 G2:2 F2:2 C3:2 F2:2 G2:2 C3:2 C2:2 F2:2 C3:2 F2:2 F2:2 Bb2:2 F2:2 C3:2 F2:2`, leadType:'triangle', leadVol:.08},
  // THE COOKIE DANCE: Jingle Bells (public domain). Its tempo matches the dance steps (PARTY.BEAT in kitchen.js)
  jingle:{bpm:60/.21, lead:`E5:1 E5:1 E5:2 E5:1 E5:1 E5:2 E5:1 G5:1 C5:1.5 D5:.5 E5:4
    F5:1 F5:1 F5:1.5 F5:.5 F5:1 E5:1 E5:1 E5:.5 E5:.5 E5:1 D5:1 D5:1 E5:1 D5:2 G5:2`,
    bass:`C3:2 G2:2 C3:2 G2:2 C3:2 G2:2 C3:2 G2:2 C3:2 G2:2 C3:2 G2:2 C3:2 G2:2 C3:2 G2:2`, leadType:'square', leadVol:.07, bassVol:.08, loud:true},
};
const NOTE_HZ=n=>{const m=/^([A-G])(#|b)?(\d)$/.exec(n); if(!m)return 0; const st={C:0,D:2,E:4,F:5,G:7,A:9,B:11}[m[1]]+(m[2]==='#'?1:m[2]==='b'?-1:0)+12*(+m[3]+1); return 440*Math.pow(2,(st-69)/12)};
const parseLine=t=>t.trim().split(/\s+/).map(x=>{const [n,b]=x.split(':'); return [n==='R'?0:NOTE_HZ(n),+b]});
let song=null, songTimer=null, songBus=null, songNext=0;
function sceneMusic(){ if(typeof scene==='undefined'||!scene)return; const m=typeof scene.music==='function'?scene.music():scene.music; if($('titlecard')&&!$('titlecard').hidden)return; m?playSong(m):stopSong() }
function playSong(name){
  if(song===name&&songBus)return; stopSong(); song=name;
  if(muted||!musicOn||!SONGS[name])return; audioInit(); if(!actx)return;
  const S=SONGS[name]; S._lead=S._lead||parseLine(S.lead); S._bass=S._bass||parseLine(S.bass);
  songBus=actx.createGain(); songBus.gain.value=SOUND.MUSIC*(S.loud?1.6:1); songBus.connect(master); songNext=actx.currentTime+.08; songLoop(songBus);
}
function songLoop(bus){
  if(bus!==songBus)return; const S=SONGS[song], beat=60/S.bpm, start=Math.max(songNext,actx.currentTime+.05);
  const line=(notes,type,vol)=>{let t=0; for(const [f,b] of notes){ if(f)tone(f,Math.max(.06,b*beat*.9),{type,vol,at:start-actx.currentTime+t,out:bus}); t+=b*beat } return t};
  const len=Math.max(line(S._lead,S.leadType||'square',S.leadVol||.05), line(S._bass,S.bassType||'triangle',S.bassVol||.09));
  songNext=start+len; songTimer=setTimeout(()=>songLoop(bus),Math.max(200,(songNext-actx.currentTime-.4)*1000));
}
function stopSong(){ clearTimeout(songTimer); songTimer=null; song=null;
  if(songBus&&actx){ const b=songBus; b.gain.setTargetAtTime(0,actx.currentTime,.08); setTimeout(()=>b.disconnect(),600) } songBus=null }
// the Cookie Dance music (kitchen.js calls these)
function playMusic(){ playSong('jingle') }
function stopMusic(){ stopSong() }
