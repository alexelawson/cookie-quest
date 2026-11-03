// A one-pixel dark outline around the people, animals and things in a scene (the "ents" in draw()).
// They're drawn onto their own see-through layer first; every empty pixel touching a solid one becomes outline;
// then the outline and the layer go onto the screen. Faint things (shadows under feet, glows) don't count as solid,
// so they don't get outlined.
const OUTLINE={COLOR:[20,16,30], ALPHA:235, SOLID:170, ON:true};   // outline color + opacity; how opaque a pixel must be to get an outline
const olCv=document.createElement('canvas'); olCv.width=VW; olCv.height=VH; const olG=olCv.getContext('2d',{willReadFrequently:true}); olG.imageSmoothingEnabled=false;
const olOut=document.createElement('canvas'); olOut.width=VW; olOut.height=VH; const olOutG=olOut.getContext('2d'); const olImg=olOutG.createImageData(VW,VH);
function drawOutlined(drawAll,cx,cy){
  if(!OUTLINE.ON){ drawAll(); return }
  const main=ctx; olG.setTransform(1,0,0,1,0,0); olG.clearRect(0,0,VW,VH); olG.setTransform(1,0,0,1,-cx,-cy);
  ctx=olG; try{ drawAll() } finally { ctx=main }
  const src=olG.getImageData(0,0,VW,VH).data, out=olImg.data, [r,g,b]=OUTLINE.COLOR, S=OUTLINE.SOLID;
  out.fill(0);
  for(let y=0;y<VH;y++)for(let x=0;x<VW;x++){
    const i=(y*VW+x)*4; if(src[i+3]>=S)continue;   // only empty (or faint) pixels can become outline
    if((x>0&&src[i-1]>=S)||(x<VW-1&&src[i+7]>=S)||(y>0&&src[i-VW*4+3]>=S)||(y<VH-1&&src[i+VW*4+3]>=S)){ out[i]=r; out[i+1]=g; out[i+2]=b; out[i+3]=OUTLINE.ALPHA }
  }
  olOutG.putImageData(olImg,0,0);
  main.save(); main.setTransform(1,0,0,1,0,0); main.drawImage(olOut,0,0); main.drawImage(olCv,0,0); main.restore();
}
