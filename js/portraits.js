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
// You (in the heist): mask, cape collar, light brown hair
PORTRAITS['You']={size:32, bg:'#2a3044', draw(g){ const F=px(g);
  F('#0e1017',3,22,26,10); F('#34405c',8,24,16,8); F('#1d2130',5,20,4,6); F('#1d2130',23,20,4,6);
  F('#f0c6a0',13,19,6,4); F('#f0c6a0',10,6,12,15);
  F('#b08355',9,3,14,6); F('#8d6440',11,4,8,1); F('#b08355',9,8,2,6); F('#b08355',21,8,2,5);
  F('#0b0c12',9,10,14,4); F('#3d8ad6',12,11,2,2); F('#3d8ad6',18,11,2,2);           // mask
  F('#e0aa88',15,14,2,2); F('#b5654f',14,17,4,1);
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
// Alex: same face as the shop
PORTRAITS['Alex']={size:40, bg:'#e3d6bd', draw(g){ drawAlexFace(g,'ok') }};

function showPortrait(speaker){
  const c=$('dportrait'), p=PORTRAITS[speaker];
  c.hidden=!p; if(!p)return;
  c.width=c.height=p.size; const g=c.getContext('2d');
  g.fillStyle=p.bg; g.fillRect(0,0,p.size,p.size); p.draw(g);
  c.style.width=c.style.height=(p.size*2)+'px';
}
