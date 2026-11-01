// The kitchen: a room you walk into from the front door. Baking happens at the counter.
const KIT_TRIGGERS=[
  {z:R(52,54,24,8),   label:'Start baking',         act:()=>startBaking()},
  {z:R(124,54,28,8),  label:'Check the oven',       act:()=>say1(KITCHEN.oven)},
  {z:R(158,54,26,8),  label:'Read the recipe card', act:()=>readRecipe()},
  {z:R(184,112,34,12),label:'Look at the tree',     act:()=>say1(KITCHEN.tree)},
  {z:R(100,160,24,8), label:'Go outside',           act:()=>goTo('world','fromKitchen')},
];
const say1=t=>showDialog({place:KITCHEN.place,speaker:KITCHEN.speaker,pages:[t],actions:[CLOSE]});
function readRecipe(){
  const lines=ITEMS.map(i=>(have[i.key]?'✓ ':'◻ ')+i.label).join('\n');
  showDialog({place:KITCHEN.place,speaker:KITCHEN.recipeTitle,pages:[lines,KITCHEN.recipeFooter],actions:[CLOSE]});
}
function startBaking(){
  const missing=ITEMS.filter(i=>!have[i.key]).map(i=>i.label);
  if(missing.length) return say1(KITCHEN.missing+' '+missing.join(', ')+'.');
  showDialog({place:KITCHEN.place,speaker:KITCHEN.speaker,pages:[...KITCHEN.ready,KITCHEN.finale,KITCHEN.note],noteLast:true,actions:[
    {label:'Play again',fn:()=>{have={};save();renderBasket();farmReset();fargo.won=false;closeDialog();goTo('world','start')}},
    {label:'Keep exploring',ghost:true,fn:closeDialog}]});
}

const kitBg=document.createElement('canvas'); kitBg.width=224; kitBg.height=168;
(function(){
  const g=kitBg.getContext('2d'), F=(c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};
  // wallpaper
  F('#ecd2ac',0,0,224,46); for(let x=4;x<224;x+=10)F('#e2c296',x,0,3,46);
  for(let x=9;x<224;x+=20)for(let y=6;y<44;y+=12)F('#d79b8e',x,y,1,1);
  F('#8a5a34',0,44,224,3);
  // window with snow outside
  F('#f6efe2',24,6,36,28); F('#1e2a4a',27,9,30,22); F('#2b3a63',27,24,30,7);
  for(let i=0;i<14;i++)F('#e9eef7',27+rnd()*30|0,9+rnd()*22|0,1,1);
  F('#f6efe2',41,9,2,22); F('#f6efe2',27,19,30,2); F('#c64b3d',22,4,40,3);
  // wreath
  for(let a=0;a<16;a++){const t=a/16*Math.PI*2; F(a%3?'#2f6b36':'#3d8443',204+Math.cos(t)*7-1|0,18+Math.sin(t)*7-1|0,3,3)}
  F('#c8322b',201,24,6,3); F('#e54b4b',203,14,2,2); F('#e54b4b',210,19,2,2);
  // counter with cabinets
  F('#c9a27a',6,34,114,7); F('#b38a62',6,40,114,2);
  F('#9a6a42',6,42,114,16); for(let x=8;x<118;x+=22){F('#8a5c38',x,44,20,12); F('#d9b27c',x+9,49,2,2)}
  F('#f3eadb',56,28,16,8); F('#e0d4bf',57,34,14,2); F('#d8b46a',59,27,10,2);          // mixing bowl of dough
  F('#e8e2d6',86,29,14,6); F('#c94a3a',89,30,8,3);                                    // flour bag
  F('#c49a6a',22,32,20,2); F('#8a5a34',20,32,2,2); F('#8a5a34',42,32,2,2);           // rolling pin
  // oven
  F('#9aa3b0',122,26,30,32); F('#7d8694',122,26,30,4); for(let x=126;x<150;x+=6)F('#2b2f36',x,27,2,2);
  F('#1d2026',126,36,22,16); F('#c3c9d2',126,34,22,1);
  // fridge
  F('#e8edf1',158,8,26,50); F('#d2d9df',158,30,26,1); F('#aab3bb',179,14,2,10); F('#aab3bb',179,34,2,14);
  F('#fffdf6',163,36,12,10); for(let y=38;y<45;y+=2)F('#d0605a',164,y,9,1); F('#3d8ad6',168,35,2,2);  // recipe card
  F('#f4d35e',162,14,3,3); F('#e54b7a',170,18,3,3);
  // floor
  F('#b98352',0,58,224,110);
  for(let y=58;y<168;y+=9){F('#a5703f',0,y,224,1); for(let x=((y/9|0)%2)*22;x<224;x+=44)F('#a5703f',x,y,1,9)}
  // rug
  F('#a8362f',66,90,92,52); F('#efe2c4',69,93,86,46); F('#a8362f',72,96,80,40);
  for(let x=76;x<150;x+=8)F('#d8b46a',x,114,4,4);
  // door + mat
  F('#5a3a22',98,162,28,6); F('#2b1a10',100,164,24,4); F('#7a8a54',100,150,24,10); F('#6a7a46',102,152,20,6);
  // plant by the window
  F('#b36a3e',10,48,10,8); F('#3d8443',8,40,6,8); F('#4d9a50',14,38,6,10);
})();

// table + chairs, and the Christmas tree, are depth-sorted so you can walk behind them
function drawTable(){
  const F=(c,x,y,w,h)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h)};
  F('#7a4e2c',80,104,8,12); F('#7a4e2c',136,104,8,12);                 // chairs
  F('#6a4224',80,100,8,4); F('#6a4224',136,100,8,4);
  F('#8a5a34',86,100,52,16); F('#a26c40',86,100,52,3); F('#6a4224',88,116,3,4); F('#6a4224',133,116,3,4);
  F('#fffdf6',104,103,14,8); F('#c98a5a',107,105,3,3); F('#c98a5a',112,106,3,3);   // a plate of (empty) promise
}
function drawXmasTree(){
  const F=(c,x,y,w,h)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h)};
  F('#6b4a2f',203,108,4,6);
  for(let i=0;i<5;i++){const w=6+i*5; F(i%2?'#2f6b36':'#3d8443',205-w/2|0,78+i*7,w,8)}
  F('#f4d35e',203,74,4,4); F('#f4d35e',204,73,2,6);
  const tw=(time/400|0);
  [[201,86,'#e54b4b'],[208,92,'#3d8ad6'],[198,98,'#f4d35e'],[211,102,'#e54b7a'],[204,104,'#ffffff'],[206,84,'#f4d35e']]
    .forEach(([x,y,c],i)=>F((tw+i)%4?c:'#fff6c8',x,y,2,2));
  F('#c8322b',190,110,10,8); F('#f4d35e',194,110,2,8); F('#3d6fb0',212,111,9,7); F('#efe2c4',216,111,1,7);
}

SCENES.kitchen={
  w:224, h:168, bounds:R(6,52,212,116), bg:kitBg, triggers:KIT_TRIGGERS,
  solids:[R(78,104,68,14), R(194,104,24,10), R(6,52,16,6)],
  entries:{start:{x:112,y:152,dir:'up'}, fromDoor:{x:112,y:154,dir:'up'}},
  ents(list){list.push({y:118,draw:drawTable},{y:114,draw:drawXmasTree})},
  under(){ // oven glow
    const f=.55+.15*Math.sin(time/300)+.08*Math.sin(time/77);
    ctx.fillStyle=`rgba(255,140,40,${f})`; ctx.fillRect(127,38,20,12);
    ctx.fillStyle=`rgba(255,200,90,${f*.6})`; ctx.fillRect(129,41,16,6);
  },
  over(){ctx.fillStyle='rgba(255,190,110,.06)'; ctx.fillRect(0,0,224,168)},   // warm light
};
