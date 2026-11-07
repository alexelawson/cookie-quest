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
// Joe: follows the outfit from the wardrobe
PORTRAITS['Joe']={size:32, bg:'#2a3044', draw(g){ const F=px(g), L=(typeof heroLook==='function')?heroLook():{top:'#34405c',head:'hair',mask:'#0b0c12',cape:1};
  const skin='#f0c6a0', hair='#b08355', eye='#3d8ad6';
  // shoulders
  if(L.top==='crumb'){F('#2b2d33',4,22,24,10); F('#f2f2ee',12,24,8,6); F('#ffffff',12,24,4,2); F('#6b707a',14,26,2,2); F('#6b707a',18,25,1,1); F('#6b707a',16,28,2,1)}   // black suit, white cookie emblem
  else if(L.top==='foil'){F('#b9c0c8',4,22,24,10); for(const [x,y] of [[6,24],[11,27],[17,23],[22,26],[26,29],[8,30],[20,30]])F('#eef1f4',x,y,2,1); F('#8d949c',14,25,1,4)}
  else if(L.top==='sweater'){F('#c8322b',4,22,24,10); F('#2f8a4a',4,25,24,1); for(let x=6;x<26;x+=4)F('#ffffff',x,28,1,1)}
  else if(L.top==='jersey'){F('#4f2683',4,22,24,10); F('#ffc62f',4,22,6,4); F('#ffc62f',22,22,6,4); F('#ffffff',14,25,4,6)}
  else if(L.top==='avant'){F('#1d1d22',6,22,20,10); F('#1d1d22',12,19,8,4); F('#f2f2ee',0,18,10,11); F('#f2f2ee',0,15,5,4); F('#d9d9d4',0,27,10,2); F('#b6ff3a',26,22,6,10); for(let k=0;k<6;k++)F('#ff3fb4',12+k*2,26+(k%2),2,1); for(let k=0;k<4;k++)F('#ffd84d',12+k*2,20,1,2)}
  else if(L.top==='grp'){F(skin,4,22,24,10); F('#d9a583',15,23,1,9); F('#d9a583',9,25,5,1); F('#d9a583',18,25,5,1)}
  else if(L.top==='cat'){F('#c8442a',4,22,24,10); F('#f0a070',11,24,10,8); F('#a83a22',5,25,3,1); F('#a83a22',24,27,3,1)}
  else if(L.top==='ginghouse'){F('#b8743a',2,22,28,10); F('#ffffff',2,22,28,1); for(let x=3;x<30;x+=3)F('#ffffff',x,23,1,2); F('#e54b4b',13,26,6,6); F('#ffffff',13,28,6,1); F('#4fbf73',4,27,2,2); F('#f4d35e',26,27,2,2)}
  else if(L.top==='cupcake'){F('#e0b46a',2,26,28,6); for(let x=3;x<30;x+=3)F('#b8863e',x,27,1,5); F('#f2d49a',2,26,28,1)}
  else if(L.top==='disco'){F('#f2efe6',4,22,24,10); F('#e8742a',11,22,10,6); F('#f2efe6',14,23,4,6); F('#ffd84d',13,27,6,1)}
  else F(L.top,6,22,20,10);
  if(L.cape){const [c0,c1]=Array.isArray(L.cape)?L.cape:['#0e1017','#1d2130']; F(c0,3,22,4,10); F(c0,25,22,4,10); F(c1,5,20,4,6); F(c1,23,20,4,6)}
  F(skin,13,19,6,4); F(skin,10,6,12,15);
  if(L.head==='potato'){F('#8a5a34',6,3,20,22); F('#6b4428',6,23,20,2); F('#f6e7bd',8,5,16,17); F(skin,10,7,12,13);
    F(eye,12,11,2,2); F(eye,18,11,2,2); F('#f5b6b0',10,15,2,1); F('#f5b6b0',20,15,2,1); F('#e0aa88',15,14,2,2); F('#b5654f',13,17,6,1);
    F('#f6d44c',9,-2,14,7); F('#fff3a8',10,-2,8,2); F('#e0b830',9,4,14,1); F('#f6d44c',10,5,2,3); F('#f6d44c',20,5,2,4);
    for(const [x,y] of [[7,6],[24,8],[15,-3],[6,14],[25,18]])F('#3f9a3a',x,y,2,1); return}   // baked potato: butter hat, chives
  if(L.head==='beret'){F('#1d1d22',9,5,14,3); F('#c8322b',6,0,20,6); F('#c8322b',20,-1,4,3); F('#8a1f1a',15,0,2,1);
    F('#1d1d22',11,11,4,3); F('#1d1d22',17,11,4,3); F('#1d1d22',15,12,2,1); F('#b5654f',14,18,4,1); return}
  if(L.head==='roof'){F('#b8743a',3,8,26,16); F('#ffffff',3,8,1,16); F('#ffffff',28,8,1,16);                         // gable walls around the attic window
    F('#ffffff',8,9,16,14); F(skin,10,10,12,12); F(eye,12,13,2,2); F(eye,18,13,2,2); F('#b5654f',14,18,4,1); F('#b5654f',13,17,1,1); F('#b5654f',18,17,1,1); F('#f2a7a0',11,16,2,1); F('#f2a7a0',19,16,2,1);
    for(let k=0;k<10;k++){F('#8a4a2a',15-k*1.5|0,-3+k,3+k*3,1); F('#ffffff',15-k*1.5|0,-3+k,2,1); F('#ffffff',16+k*1.5|0,-3+k,2,1)}
    F('#ffffff',0,7,32,2); for(let x=1;x<32;x+=3)F('#ffffff',x,9,1,2);                                              // the icing eave
    F('#e54b4b',15,0,3,3); F('#4fbf73',9,4,2,2); F('#f4d35e',21,4,2,2); F('#6b3a1c',22,-3,3,6); F('#ffffff',22,-3,3,1); return}
  if(L.head==='frosting'){F('#f39ac0',2,6,28,21); F('#f39ac0',5,1,22,6); F('#f39ac0',10,-2,12,4); F('#fcc9de',7,2,8,2); F('#fcc9de',4,14,3,6); F('#fcc9de',25,16,3,5);
    F('#c8322b',14,-6,5,5); F('#e85a50',14,-6,2,2); F('#2f8a4a',17,-8,1,3);
    for(const [x,y,c] of [[6,8,'#4fbf73'],[25,9,'#5fa8e8'],[9,3,'#f4d35e'],[22,4,'#ffffff'],[4,20,'#e54b4b'],[27,22,'#4fbf73'],[18,1,'#5fa8e8']])F(c,x,y,2,1);
    F(skin,10,8,12,15); F(eye,12,13,2,2); F(eye,18,13,2,2); F('#e0aa88',15,16,2,2); F('#b5654f',14,19,4,1); F('#f2a7a0',11,17,2,1); F('#f2a7a0',19,17,2,1); return}
  if(L.head==='helmet'){F('#4f2683',8,2,16,12); F('#ffc62f',15,2,2,10); F('#f2f2ee',6,6,4,5); F('#f2f2ee',22,6,4,5); F(eye,12,11,2,2); F(eye,18,11,2,2);
    F('#8a8f9a',10,15,12,1); F('#8a8f9a',12,13,1,5); F('#8a8f9a',19,13,1,5); F('#b5654f',14,18,4,1); return}
  if(L.head==='afro'){F('#4a2e1c',5,0,22,12); F('#4a2e1c',5,10,4,8); F('#4a2e1c',23,10,4,8); F('#5a3a22',8,0,16,2);
    F('#e8b04a',10,10,5,3); F('#e8b04a',17,10,5,3); F('#5a3a22',15,11,2,1); F('#5a3a22',13,16,6,1); F('#b5654f',14,18,4,1); return}
  if(L.head==='cat'){const C='#c8442a'; F(C,7,3,18,7); F(C,7,9,4,14); F(C,21,9,4,14); F(C,6,-1,6,5); F(C,20,-1,6,5); F('#f5b6b0',8,1,2,2); F('#f5b6b0',22,1,2,2);
    F(eye,12,11,2,2); F(eye,18,11,2,2); F('#e86a8a',15,14,2,2); F('#b5654f',14,17,4,1); F('#2b2b2b',4,14,6,1); F('#2b2b2b',4,16,6,1); F('#2b2b2b',22,14,6,1); F('#2b2b2b',22,16,6,1); return}
  if(L.head==='hood'){F(L.hat,7,3,18,7); F(L.hat,7,9,4,14); F(L.hat,21,9,4,14); F('#d9ad88',11,9,10,2); F(eye,12,11,2,2); F(eye,18,11,2,2); F('#b5654f',14,17,4,1); F('#e8e8e0',12,22,1,4); F('#e8e8e0',19,22,1,4); return}
  F(hair,9,3,14,6); F('#8d6440',11,4,8,1); F(hair,9,8,2,6); F(hair,21,8,2,5);
  if(L.mask)F(L.mask,9,10,14,4);
  F(eye,12,11,2,2); F(eye,18,11,2,2); F('#e0aa88',15,14,2,1);
  F('#b5654f',12,16,1,1); F('#b5654f',19,16,1,1); F('#b5654f',13,17,6,1); F('#ffffff',14,17,4,1); F('#b5654f',14,18,4,1); F('#f2a7a0',10,15,2,1); F('#f2a7a0',20,15,2,1);   // a happy grin and a little blush
  if(L.head==='bikehelmet'){F('#111114',8,1,16,7); F('#2e9a45',11,1,2,7); F('#2e9a45',17,1,2,7); F('#111114',9,10,14,3); F('#8fe09a',11,10,3,1); F('#8fe09a',18,10,3,1)}
  if(L.head==='cap'){F('#c8322b',8,1,16,6); F('#9e2620',8,6,16,1); F('#9e2620',10,7,12,1); F('#f4f4f0',12,2,2,1); F('#f4f4f0',18,3,2,1)}
  if(L.head==='santa'){F('#c8322b',9,0,14,6); F('#c8322b',20,-1,6,4); F('#ffffff',25,0,4,4); F('#ffffff',8,5,16,3)}
}};
// Keelan: lanky farmer, short brown hair, red plaid
PORTRAITS['Keelan']={size:32, bg:'#d8ecc6', draw(g){ const F=px(g);
  F('#c0392b',6,24,20,8); for(let x=7;x<26;x+=4)F('#7a1f1a',x,24,1,8); F('#7a1f1a',6,27,20,1); F('#e0675b',6,30,20,1);
  F('#e9b98f',13,19,6,5); F('#e9b98f',11,4,10,17); F('#d9a37f',11,17,1,3); F('#d9a37f',20,17,1,3);
  F('#5a3b24',10,2,12,4); F('#5a3b24',10,5,2,3); F('#5a3b24',20,5,2,2);
  F('#2b2b2b',13,10,2,2); F('#2b2b2b',17,10,2,2); F('#d9a37f',15,12,2,3); F('#b5735a',14,16,4,1);
}};
// Lil Q: biker, short spiky red hair, shades, leather vest over a black tee, gold hoops
PORTRAITS['Lil Q']={size:32, bg:'#f2dcc0', draw(g){ const F=px(g);
  F('#1c1c20',6,24,20,8); F('#4a2e1c',4,24,6,8); F('#4a2e1c',22,24,6,8); F('#e8742a',14,27,4,1); F('#e8742a',13,28,6,1);
  F('#f0c3a0',13,20,6,4); F('#f0c3a0',10,6,12,15);
  F('#c8402a',9,3,14,6); F('#c8402a',9,8,2,6); F('#c8402a',21,8,2,4); F('#e0603a',12,3,6,1); F('#c8402a',19,1,3,3); F('#c8402a',14,1,2,2);   // short spiky red hair
  F('#1c1c20',10,11,12,3); F('#3a4a60',11,12,4,1); F('#3a4a60',17,12,4,1);          // shades
  F('#d9a37f',15,14,2,2); F('#c0303a',14,17,4,1); F('#a0202a',15,18,2,1);           // red lips
  F('#f4d35e',9,15,1,3); F('#f4d35e',22,15,1,3);                                     // gold hoops
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
// Brian: buzzed brown hair, sleepy relaxed eyes, little smile, gray tee
PORTRAITS['Brian']={size:32, bg:'#cfe6f2', draw(g){ const F=px(g);
  F('#8d949e',6,24,20,8); F('#7a8089',13,24,6,2); F('#e8b48e',14,24,4,1);
  F('#e8b48e',13,20,6,4); F('#e8b48e',10,6,12,15); F('#d9a37f',10,17,1,3); F('#d9a37f',21,17,1,3);
  F('#7a5232',10,5,12,3); F('#8a6240',12,5,7,1); F('#7a5232',10,8,1,3); F('#7a5232',21,8,1,3);   // buzz cut
  F('#d9a37f',12,12,3,1); F('#d9a37f',17,12,3,1); F('#2b2b2b',12,13,3,1); F('#2b2b2b',17,13,3,1);   // sleepy, half-closed eyes
  F('#d9a37f',15,15,2,2); F('#b5654f',14,18,4,1); F('#b5654f',18,17,1,1);                          // lopsided chill smile
  F('#c9876f',11,16,1,1); F('#c9876f',20,16,1,1);
}};
PORTRAITS['You']=PORTRAITS['Joe'];   // old name, just in case
// Alex: same face as the shop
PORTRAITS['Alex']={size:40, bg:'#e3d6bd', draw(g){ drawAlexFace(g,'ok') }};
// a Viking (they ski the Birkie and come to the party): horned purple helmet, big blond beard, purple and gold
PORTRAITS['Viking']={size:32, bg:'#e3d8c8', draw(g){ const F=px(g);   // the old Norse kind: iron horned helmet, red braided beard, fur
  F('#7a5a3a',2,24,28,8); F('#9a7a54',4,24,24,2); F('#8a8f9a',10,27,12,5); F('#c8322b',0,26,5,6); F('#efe2c4',1,27,3,4);
  F('#f0c6a0',10,8,12,12); F('#2b2b2b',12,12,2,2); F('#2b2b2b',18,12,2,2);
  F('#c8642a',8,15,16,9); F('#c8642a',10,24,4,5); F('#c8642a',18,24,4,5); F('#a8501f',11,28,2,2); F('#a8501f',19,28,2,2); F('#e08a4a',11,16,4,2); F('#b5654f',14,18,4,1);
  F('#9aa3b0',8,3,16,7); F('#c9ced4',10,3,6,1); F('#6f7686',15,9,2,5); F('#f6f2e4',3,4,5,3); F('#f6f2e4',2,0,2,5); F('#f6f2e4',24,4,5,3); F('#f6f2e4',28,0,2,5);
}};
PORTRAITS['Football Viking']={size:32, bg:'#efe6c8', draw(g){ const F=px(g);   // the football kind: purple helmet with a gold stripe, facemask, pads
  F('#4f2683',0,23,32,9); F('#ffc62f',0,24,7,3); F('#ffc62f',25,24,7,3); F('#ffffff',13,26,6,6);
  F('#8a5a3a',11,10,10,12); F('#2b2b2b',13,14,2,2); F('#2b2b2b',18,14,2,2); F('#1d1d22',12,17,3,1); F('#1d1d22',18,17,3,1); F('#ffffff',14,20,4,1);
  F('#4f2683',7,3,18,9); F('#6a3ea8',9,3,8,2); F('#ffc62f',15,2,2,10); F('#3d1d66',7,11,4,10); F('#3d1d66',21,11,4,10);
  F('#c9ced4',9,15,14,1); F('#c9ced4',9,19,14,1); F('#c9ced4',15,13,2,9);
}};
// Doc Alex: Alex in her mad-scientist costume (the client in the city heist): frizzed hair, goggles up, lab coat
PORTRAITS['Doc Alex']={size:40, bg:'#1d2a24', draw(g){ drawAlexFace(g,'happy'); const F=(c,x,y,w=1,h=1)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};
  for(const [x,y,w,h] of [[4,4,5,4],[2,10,4,5],[31,4,5,4],[34,10,4,5],[9,1,5,3],[25,1,5,3],[16,0,7,2]])F(ALEX.hair,x,y,w,h);   // gone wild
  F('#2b2b2b',9,9,22,3); F('#7fd3ff',11,9,7,3); F('#7fd3ff',22,9,7,3); F('#d6f2ff',12,9,2,1); F('#d6f2ff',23,9,2,1);         // goggles pushed up
  F('#f4f4f0',4,34,9,6); F('#f4f4f0',27,34,9,6); F('#dcdcd6',12,35,2,5); F('#dcdcd6',26,35,2,5);                                // lab coat lapels
  F('#cfe6f2',32,22,5,9); F('#5fff8a',32,26,5,5); F('#9fffbf',34,19,1,2) }};

function showPortrait(speaker){
  const c=$('dportrait'), p=PORTRAITS[speaker];
  c.hidden=!p; if(!p)return;
  c.width=c.height=p.size; const g=c.getContext('2d');
  g.fillStyle=p.bg; g.fillRect(0,0,p.size,p.size); p.draw(g);
  c.style.width=c.style.height=(p.size*2)+'px';
}
