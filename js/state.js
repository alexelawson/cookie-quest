// Game state: player, basket (saved in localStorage), ambient particles.
const SAVE='cookie-quest-v1';
let have={}; try{have=JSON.parse(localStorage.getItem(SAVE))||{}}catch(e){have={}}
const save=()=>{try{localStorage.setItem(SAVE,JSON.stringify(have))}catch(e){}};
const P={x:192,y:156,dir:'down',step:0,t:0,moving:false};
const hens=[...Array(4)].map((_,i)=>({x:100+i*12,y:75+(i%2)*25,vx:0,vy:0,t:0}));
const rain=[...Array(70)].map(()=>({x:rnd()*164,y:170+rnd()*118}));
const snow=[...Array(60)].map(()=>({x:220+rnd()*164,y:170+rnd()*118,s:.2+rnd()*.3}));
const smoke=[]; let paused=true, near=null, time=0;
