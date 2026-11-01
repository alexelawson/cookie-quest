// ============ DEV ONLY ============
// A "win everything" button so you can jump straight to the ending while testing.
// BEFORE GIVING THE GAME TO JOE: delete the line  <script src="js/devtools.js"></script>  at the bottom of index.html
// (or just set DEV_TOOLS to false below). Nothing else depends on this file.
const DEV_TOOLS = true;
if(DEV_TOOLS){
  const b=document.createElement('button'); b.className='reset devbtn'; b.textContent='🛠 Dev: win everything';
  b.title='Testing only: fills the basket and takes you to the kitchen';
  b.onclick=()=>{
    Object.assign(have,{welcomed:true,farm:true,farmWon:true,cupcake:true,mill:true,birkie:true,city:true,heistStage:5,heistBriefed:true,heistHowTo:true,fargo:true,fargoIntro:true,golf:true,golfWon:true});
    delete have.baked; delete have.crown; save(); renderBasket();
    for(const id of ['reward','pump','shop','vault','anagram','howto','wardrobe','bake'])$(id).hidden=true;
    if(!dlg.hidden)closeDialog(); $('titlecard').hidden=true; paused=false;
    Object.assign(kit,{party:false,dance:false,alex:null,hugged:false}); goTo('kitchen','fromDoor');
  };
  $('resetBtn').after(b);
}
