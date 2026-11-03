// Game state: player, basket (saved in localStorage), ambient particles.
const SAVE='cookie-quest-v1';
let have={}; try{have=JSON.parse(localStorage.getItem(SAVE))||{}}catch(e){have={}}
for(const k of ['look','outfit'])if(['cape','vikings','grp'].includes(have[k]))have[k]='tee';   // outfits that were taken out of the wardrobe
const save=()=>{try{localStorage.setItem(SAVE,JSON.stringify(have))}catch(e){}};
const P={x:192,y:156,dir:'down',step:0,t:0,moving:false};
const rain=[...Array(240)].map(()=>({x:rnd()*164,y:170+rnd()*118}));   // Vancouver: it's always raining
const snow=[...Array(60)].map(()=>({x:220+rnd()*164,y:rnd()*144,s:.2+rnd()*.3}));   // falls on the Birkie trailhead
const smoke=[]; let paused=true, near=null, time=0;
