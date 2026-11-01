// ============ TESTING TOOLS ============
// "Win everything" lives in Settings (the ⚙ button under the game), behind the "Testing tools" switch.
// The switch is OFF by default and remembered per browser, so on Joe's computer it's off unless someone turns it on.
// To remove it completely: delete the line  <script src="js/devtools.js"></script>  near the bottom of index.html.
function devWinEverything(){
  // clean up anything in progress, wherever you are
  for(const id of ['reward','pump','shop','vault','anagram','howto','wardrobe','bake','settings'])$(id).hidden=true;
  if(!dlg.hidden)closeDialog(); $('titlecard').hidden=true; prompt.hidden=true;
  if(typeof golf!=='undefined'){clearTimeout(golf.timer); golf.active=false; golf.state='idle'}
  if(typeof birk!=='undefined')birk.running=false;
  if(typeof bake!=='undefined')bake.open=false;
  if(typeof heist!=='undefined')heist.jump=null;
  if(typeof ana!=='undefined'){ana.open=false; ana.running=false}
  Object.assign(kit,{party:false,dance:false,alex:null,hugged:false,hugging:false,hugT:0,crownT:0,confetti:[]});
  // a full basket, every stop finished, ending not seen yet
  Object.assign(have,{welcomed:true,farm:true,farmWon:true,mill:true,birkie:true,city:true,heistStage:5,heistBriefed:true,heistHowTo:true,fargo:true,fargoIntro:true,golf:true,golfWon:true});
  delete have.baked; delete have.crown; save(); renderBasket(); farmReset();
  paused=false; goTo('kitchen','fromDoor');
}
$('devWin').onclick=()=>{ $('devWin').blur(); devWinEverything() };
