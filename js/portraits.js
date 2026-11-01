// Faces that pop up next to the text when someone talks. Keyed by the speaker's name in a dialog.
// Each painter draws on a 32x32 canvas (Alex's is 40x40, same as the shop).
const PORTRAITS={};
function px(g){ return (c,x,y,w=1,h=1)=>{g.fillStyle=c;g.fillRect(x,y,w,h)} }

// The Stranger: wide-brimmed hat, face in shadow, gray mustache, collar turned up against the rain
PORTRAITS['The Stranger']={size:32, bg:'#1d2130', draw(g){ const F=px(g);
  for(let i=0;i<14;i++)F('rgba(170,190,230,.35)',(i*7)%32,(i*11)%28,1,3);            // rain
  F('#262833',4,24,24,8); F('#1b1c24',6,22,20,10); F('#3a3f52',6,20,5,8); F('#3a3f52',21,20,5,8);   // coat, upturned collar
  F('#a88a6c',11,10,10,12); F('#c9a787',12,14,8,7); F('#8a6f55',11,10,10,4);       // face, shadow under the brim
  F('#e8e2d6',13,15,1,1); F('#e8e2d6',18,15,1,1); F('#2b2b2b',13,15,1,1); F('#2b2b2b',18,15,1,1);   // eyes glinting
  F('#9a9a9a',12,18,8,2); F('#7f7f7f',13,19,6,1);                                   // mustache
  F('#14151c',9,4,14,7); F('#14151c',4,10,24,2); F('#22232c',9,8,14,1);             // hat + brim
}};
// Lars: tall runner, short blond hair, blue singlet with a race bib
PORTRAITS['Lars']={size:32, bg:'#cfe3f2', draw(g){ const F=px(g);
  F('#2f6db0',7,24,18,8); F('#f3cba8',4,24,4,8); F('#f3cba8',24,24,4,8); F('#ffffff',12,26,8,5); F('#c8322b',14,28,4,1);
  F('#f3cba8',13,20,6,4); F('#f3cba8',10,6,12,15); F('#e2b58f',10,17,1,3); F('#e2b58f',21,17,1,3);
  F('#e6c46a',9,3,14,5); F('#f2d88a',11,3,6,1); F('#e6c46a',9,6,2,4); F('#e6c46a',21,6,2,3);
  F('#ffffff',12,11,3,2); F('#ffffff',17,11,3,2); F('#3d6fb0',13,11,2,2); F('#3d6fb0',18,11,2,2);
  F('#d9a37f',15,14,2,2); F('#b4544c',14,17,4,1); F('#c9876f',13,16,1,1); F('#c9876f',18,16,1,1);
}};
// John: jacked, red bandana, short brown hair, white muscle tank
PORTRAITS['John']={size:32, bg:'#f2d9c4', draw(g){ const F=px(g);
  F('#e2aa80',1,22,30,10); F('#c98f66',1,26,2,6); F('#c98f66',29,26,2,6);         // huge shoulders
  F('#f4f4f0',9,23,14,9); F('#f4f4f0',10,21,2,2); F('#f4f4f0',20,21,2,2);
  F('#e2aa80',11,17,10,6); F('#e2aa80',8,5,16,15); F('#c98f66',8,16,16,4); F('#e2aa80',9,16,14,3);   // thick neck, square jaw
  F('#5a3b24',8,7,16,2); F('#5a3b24',8,9,2,4); F('#5a3b24',22,9,2,4);
  F('#c8322b',7,2,18,6); F('#9e2620',7,6,18,1); F('#c8322b',25,4,4,2); F('#9e2620',27,6,2,3); F('#ffffff',11,3,2,1); F('#ffffff',18,4,2,1);
  F('#3b2a1e',11,10,4,1); F('#3b2a1e',17,10,4,1); F('#2b2b2b',12,12,2,2); F('#2b2b2b',18,12,2,2);
  F('#c98f66',15,13,2,3); F('#a86a50',13,17,6,1);
}};
// You / Joe (in the heist): follows the outfit from the wardrobe
PORTRAITS['You']={size:32, bg:'#2a3044', draw(g){ const F=px(g), L=(typeof heroLook==='function')?heroLook():{top:'#34405c',head:'hair',mask:'#0b0c12',cape:1};
  const skin='#f0c6a0', hair='#b08355', eye='#3d8ad6';
  // shoulders
  if(L.top==='stripes'){F('#f2f2ee',5,22,22,10); for(let y=23;y<32;y+=3)F('#1d1d22',5,y,22,1)}
  else if(L.top==='sweater'){F('#c8322b',4,22,24,10); F('#2f8a4a',4,25,24,1); for(let x=6;x<26;x+=4)F('#ffffff',x,28,1,1)}
  else F(L.top,6,22,20,10);
  if(L.cape){F('#0e1017',3,22,4,10); F('#0e1017',25,22,4,10); F('#1d2130',5,20,4,6); F('#1d2130',23,20,4,6)}
  if(L.sack){F('#c9b07a',24,18,7,12); F('#a8905a',25,18,4,2)}
  F(skin,13,19,6,4); F(skin,10,6,12,15);
  if(L.head==='wrap'){F(L.top,9,3,14,18); F(skin,11,10,10,4); F(eye,12,11,2,2); F(eye,18,11,2,2); return}
  if(L.head==='hood'){F(L.hat,7,3,18,7); F(L.hat,7,9,4,14); F(L.hat,21,9,4,14); F('#d9ad88',11,9,10,2); F(eye,12,11,2,2); F(eye,18,11,2,2); F('#b5654f',14,17,4,1); F('#e8e8e0',12,22,1,4); F('#e8e8e0',19,22,1,4); return}
  F(hair,9,3,14,6); F('#8d6440',11,4,8,1); F(hair,9,8,2,6); F(hair,21,8,2,5);
  if(L.mask)F(L.mask,9,10,14,4);
  F(eye,12,11,2,2); F(eye,18,11,2,2); F('#e0aa88',15,14,2,2); F('#b5654f',14,17,4,1);
  if(L.head==='beanie'){F(L.hat,8,1,16,7); F('#3a3a44',8,7,16,2)}
  if(L.head==='santa'){F('#c8322b',9,0,14,6); F('#c8322b',20,-1,6,4); F('#ffffff',25,0,4,4); F('#ffffff',8,5,16,3)}
}};
// Keelan: lanky farmer, short brown hair, red plaid
PORTRAITS['Keelan']={size:32, bg:'#d8ecc6', draw(g){ const F=px(g);
  F('#c0392b',6,24,20,8); for(let x=7;x<26;x+=4)F('#7a1f1a',x,24,1,8); F('#7a1f1a',6,27,20,1); F('#e0675b',6,30,20,1);
  F('#e9b98f',13,19,6,5); F('#e9b98f',11,4,10,17); F('#d9a37f',11,17,1,3); F('#d9a37f',20,17,1,3);
  F('#5a3b24',10,2,12,4); F('#5a3b24',10,5,2,3); F('#5a3b24',20,5,2,2);
  F('#2b2b2b',13,10,2,2); F('#2b2b2b',17,10,2,2); F('#d9a37f',15,12,2,3); F('#b5735a',14,16,4,1);
}};
// Bob: biker, orange bandana, shades, big gray beard, leather vest over a black tee
PORTRAITS['Bob']={size:32, bg:'#f2dcc0', draw(g){ const F=px(g);
  F('#1c1c20',6,24,20,8); F('#4a2e1c',4,24,6,8); F('#4a2e1c',22,24,6,8); F('#e8742a',14,27,4,1); F('#e8742a',13,28,6,1);
  F('#e2a97f',10,5,12,13);
  F('#b9b4ad',9,14,14,9); F('#d8d4cd',11,16,10,5); F('#b9b4ad',11,23,10,2);       // beard
  F('#1c1c20',10,9,12,3); F('#3a4a60',11,10,4,1); F('#3a4a60',17,10,4,1);          // shades
  F('#c98f66',15,12,2,2); F('#a86a50',14,15,4,1);
  F('#e8742a',9,2,14,5); F('#1c1c20',12,3,1,1); F('#1c1c20',17,4,1,1); F('#1c1c20',20,2,1,1); F('#e8742a',23,4,3,2);
}};
// Jack: short blond hair, teal polo
PORTRAITS['Jack']={size:32, bg:'#cdeee8', draw(g){ const F=px(g);
  F('#2a9d8f',6,24,20,8); F('#ffffff',14,24,4,3); F('#f3cba8',4,25,3,7); F('#f3cba8',25,25,3,7);
  F('#f3cba8',13,20,6,4); F('#f3cba8',10,6,12,15); F('#e2b58f',10,17,1,3); F('#e2b58f',21,17,1,3);
  F('#e6c46a',9,3,14,5); F('#f2d88a',12,3,7,1); F('#e6c46a',9,7,2,3); F('#e6c46a',21,7,2,2);
  F('#2b2b2b',13,11,2,2); F('#2b2b2b',18,11,2,2); F('#d9a37f',15,13,2,3); F('#b4544c',13,17,6,1); F('#ffffff',14,17,4,1);
}};
// Margie: long blond hair, fun heart-shaped pink sunglasses
PORTRAITS['Margie']={size:32, bg:'#ffe0ef', draw(g){ const F=px(g);
  F('#e6c46a',6,4,20,26); F('#f2d88a',9,4,6,2); F('#d9b356',6,18,3,12); F('#d9b356',23,18,3,12);   // long hair
  F('#e54b7a',8,26,16,6); F('#ffd84d',14,28,4,2);
  F('#f3cba8',13,21,6,5); F('#f3cba8',10,7,12,15); F('#e6c46a',10,6,12,3); F('#e6c46a',10,8,4,2);
  F('#ff4fa3',10,11,5,4); F('#ff4fa3',17,11,5,4); F('#ff4fa3',15,12,2,1); F('#ffffff',11,12,1,1); F('#ffffff',18,12,1,1);   // heart shades
  F('#e0aa88',15,15,2,2); F('#c9576a',13,18,6,1); F('#ffffff',14,18,4,1); F('#f2a7a0',10,16,2,1); F('#f2a7a0',20,16,2,1);
}};
// Trail John (the Birkie one, not heist John): brown hair, reading glasses low on his nose, volunteer jacket
PORTRAITS['Trail John']={size:32, bg:'#dbe8f4', draw(g){ const F=px(g);
  F('#1d3f73',5,24,22,8); F('#c8322b',5,28,22,2); F('#ffffff',13,24,6,3); F('#f2f2f2',14,25,4,2);
  F('#eab896',13,20,6,4); F('#eab896',10,6,12,15); F('#d9a37f',10,17,1,3); F('#d9a37f',21,17,1,3);
  F('#6b4429',9,3,14,5); F('#7d5233',12,3,6,1); F('#6b4429',9,7,2,6); F('#6b4429',21,7,2,5);
  F('#5a3a22',12,10,3,1); F('#5a3a22',17,10,3,1);                                     // brows
  F('#2b2b2b',13,12,2,1); F('#2b2b2b',18,12,2,1);                                     // eyes peeking over...
  F('#c9a24a',11,13,5,1); F('#c9a24a',17,13,5,1); F('#c9a24a',11,16,5,1); F('#c9a24a',17,16,5,1);   // ...reading glasses
  F('#c9a24a',11,13,1,4); F('#c9a24a',15,13,1,4); F('#c9a24a',17,13,1,4); F('#c9a24a',21,13,1,4); F('#c9a24a',16,14,1,1);
  F('rgba(220,235,250,.6)',12,14,3,2); F('rgba(220,235,250,.6)',18,14,3,2);
  F('#d9a37f',15,15,2,2); F('#b5735a',14,18,4,1);
}};
// Alex: same face as the shop
PORTRAITS['Alex']={size:40, bg:'#e3d6bd', draw(g){ drawAlexFace(g,'ok') }};

function showPortrait(speaker){
  const c=$('dportrait'), p=PORTRAITS[speaker];
  c.hidden=!p; if(!p)return;
  c.width=c.height=p.size; const g=c.getContext('2d');
  g.fillStyle=p.bg; g.fillRect(0,0,p.size,p.size); p.draw(g);
  c.style.width=c.style.height=(p.size*2)+'px';
}
