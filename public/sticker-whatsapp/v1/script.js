// Stiker WA v1 - gwntur.com | https://cdn.gwntur.com/sticker-whatsapp/v1/script.js
function stwaInit(){
"use strict";
var app=document.getElementById("stwaApp");
if(!app||app.dataset.stwaInit)return;
app.dataset.stwaInit="1";
function ln(p){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+p+'</svg>';}
var IC={
sticker:ln('<path d="M7 3.5h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-10a4 4 0 0 1 4-4z"/><path d="M14.5 21l6.5-6.5V18a3 3 0 0 1-3 3h-3.5z"/><path d="M9 12.5l2.5-2.5 2 2 2.5-2.5"/>'),
upload:ln('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5"/><path d="M12 3v12"/>'),
wand:ln('<path d="M5 19L14.5 9.5"/><path d="M17.5 3.5l.9 2.3 2.3.9-2.3.9-.9 2.3-.9-2.3-2.3-.9 2.3-.9z"/><path d="M20 13.5l.6 1.5 1.5.6-1.5.6-.6 1.5-.6-1.5-1.5-.6 1.5-.6z"/>'),
zoomin:ln('<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3M11 8v6M8 11h6"/>'),
zoomout:ln('<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3M8 11h6"/>'),
refresh:ln('<path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.5 9a9 9 0 0 1 14.9-3.4L23 10M1 14l4.6 4.4A9 9 0 0 0 20.5 15"/>'),
alert:ln('<path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>'),
download:ln('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/>'),
info:ln('<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>')};
(function(){var s=app.querySelectorAll("[data-ic]");for(var i=0;i<s.length;i++){var k=s[i].getAttribute("data-ic");if(IC[k])s[i].innerHTML=IC[k];}})();
function $(id){return document.getElementById(id);}
var step1=$("stwaStep1"),step2=$("stwaStep2"),step3=$("stwaStep3"),
drop=$("stwaDrop"),fileIn=$("stwaFile"),edCanvas=$("stwaEd"),zoomIn=$("stwaZoom"),
cutTg=$("stwaCutout"),makeBtn=$("stwaMake"),backBtn=$("stwaBack"),
resCanvas=$("stwaRes"),metaEl=$("stwaMeta"),saveBtn=$("stwaSave"),dlBtn=$("stwaDl"),againBtn=$("stwaAgain"),guideOpen=$("stwaGuideOpen"),
statusEl=$("stwaStatus"),errEl=$("stwaErr"),errTx=$("stwaErrTx"),
modal=$("stwaModal"),modalOk=$("stwaModalOk");
var DOTS='<span class="stwa-dots" aria-hidden="true"><i></i><i></i><i></i></span>';
var SIZE=512,MAXB=100*1024,SEG_URL="https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation@0.1.1675465747/selfie_segmentation.js";
var WEBP_OK=(function(){try{var c=document.createElement("canvas");return c.toDataURL("image/webp").indexOf("data:image/webp")===0;}catch(e){return false;}})();
var S={img:null,iw:0,ih:0,zoom:1,ox:0,oy:0,cutout:true,mask:null,maskBusy:false,blob:null,_cut:null,_cutFor:null,fname:"stiker-whatsapp.webp",iname:""};
var FTYPE="WebP";
function baseName(fn){
var b=String(fn||"").split(/[\\/]/).pop().replace(/\.[a-z0-9]+$/i,"").trim().toLowerCase();
b=b.replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,40);
return b||"whatsapp";}
function lumDark(v){v=String(v||"").trim().toLowerCase();if(!v)return null;
if(v.indexOf("darkb")!==-1)return true;if(v.indexOf("lbodyb")!==-1)return false;
var r,g,b,m;
if((m=v.match(/^#([0-9a-f]{6})$/))){r=parseInt(m[1].substr(0,2),16);g=parseInt(m[1].substr(2,2),16);b=parseInt(m[1].substr(4,2),16);}
else if((m=v.match(/^#([0-9a-f]{3})$/))){r=parseInt(m[1][0]+m[1][0],16);g=parseInt(m[1][1]+m[1][1],16);b=parseInt(m[1][2]+m[1][2],16);}
else if((m=v.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/))){r=+m[1];g=+m[2];b=+m[3];}
else return null;
return(0.299*r+0.587*g+0.114*b)/255<0.5;}
function syncTheme(){
var dark=null;
try{dark=lumDark(getComputedStyle(app).getPropertyValue("--bodyB"));}catch(e){dark=null;}
if(dark===null){try{dark=lumDark(getComputedStyle(document.documentElement).getPropertyValue("--bodyB"));}catch(e){}}
if(dark===null){var c=document.getElementById("forMode");
if(c)dark=!!c.checked;
else{try{dark=matchMedia("(prefers-color-scheme: dark)").matches;}catch(e2){dark=false;}}}
app.classList.toggle("stwa-dark",!!dark);}
syncTheme();
// Sinkron otomatis mengikuti toggle tema template Plus UI (ganti class drkB di <html>/<body>)
try{
var _mo=new MutationObserver(function(){syncTheme();});
_mo.observe(document.documentElement,{attributes:true,attributeFilter:["class","style"]});
if(document.body)_mo.observe(document.body,{attributes:true,attributeFilter:["class","style"]});
}catch(e){}
setTimeout(syncTheme,1200); // jaring pengaman: template kadang terapkan tema tersimpan agak telat
try{matchMedia("(prefers-color-scheme: dark)").addEventListener("change",syncTheme);}catch(e){}
function showErr(t){errTx.textContent=t;errEl.hidden=false;}
function hideErr(){errEl.hidden=true;}
function showStatus(t){statusEl.innerHTML=DOTS+"<span>"+t+"</span>";statusEl.hidden=false;}
function hideStatus(){statusEl.hidden=true;statusEl.innerHTML="";}
var noteT=null;
function note(t){showStatus(t);if(noteT)clearTimeout(noteT);noteT=setTimeout(hideStatus,5000);}
function goStep(n){step1.hidden=n!==1;step2.hidden=n!==2;step3.hidden=n!==3;hideErr();hideStatus();}
function fmtSize(b){return b>=1024?(b/1024).toFixed(b>=102400?0:1).replace(".",",")+" KB":b+" B";}
function baseScale(){return Math.max(SIZE/S.iw,SIZE/S.ih);}
function refineMask(src){
// Perhalus hasil segmentasi: dilatasi ringan (~2px) agar tepi orang tidak terpotong,
// lalu feather agar transisi ke transparan rapi tanpa sisa kasar.
var w=src.width,h=src.height;
if(!w||!h)return src;
var d=Math.max(1,Math.round(w/240));
var c=document.createElement("canvas");c.width=w;c.height=h;
var x=c.getContext("2d");if(!x)return src;
x.globalCompositeOperation="lighter";
x.drawImage(src,0,0);
x.drawImage(src,d,0);x.drawImage(src,-d,0);x.drawImage(src,0,d);x.drawImage(src,0,-d);
var f=document.createElement("canvas");f.width=w;f.height=h;
var fx=f.getContext("2d");if(!fx)return c;
try{fx.filter="blur("+Math.max(1,Math.round(w/300))+"px)";}catch(e){}
fx.drawImage(c,0,0);
return f;}
function cutCanvas(){
if(S._cut&&S._cutFor===S.mask)return S._cut;
var c=document.createElement("canvas");c.width=S.iw;c.height=S.ih;
var x=c.getContext("2d");
x.drawImage(S.img,0,0);
x.globalCompositeOperation="destination-in";
x.drawImage(S.mask,0,0,S.iw,S.ih);
x.globalCompositeOperation="source-over";
S._cut=c;S._cutFor=S.mask;return c;}
function drawEd(){
var x=edCanvas.getContext("2d");
if(!x)return;
x.clearRect(0,0,SIZE,SIZE);
if(!S.img)return;
var b=baseScale()*S.zoom,dw=S.iw*b,dh=S.ih*b;
var dx=(SIZE-dw)/2+S.ox,dy=(SIZE-dh)/2+S.oy;
var src=(S.cutout&&S.mask)?cutCanvas():S.img;
x.drawImage(src,dx,dy,dw,dh);}
function loadImage(file){
return new Promise(function(res,rej){
if(!file||String(file.type||"").indexOf("image/")!==0){rej(new Error("type"));return;}
var url=URL.createObjectURL(file);
var im=new Image();
im.onload=function(){try{URL.revokeObjectURL(url);}catch(e){}res(im);};
im.onerror=function(){try{URL.revokeObjectURL(url);}catch(e){}rej(new Error("load"));};
im.src=url;});}
function acceptFile(file){
hideErr();
if(!file)return;
if(String(file.type||"").indexOf("image/")!==0){showErr("File harus berupa gambar (JPG, PNG, atau WebP).");return;}
if(file.size>20*1024*1024){showErr("Ukuran foto terlalu besar (maksimal 20 MB).");return;}
showStatus("Memuat foto");
loadImage(file).then(function(im){
if(!im.naturalWidth||!im.complete){throw new Error("load");}
S.img=im;S.iw=im.naturalWidth;S.ih=im.naturalHeight;
S.iname=file.name||"";S.fname="stiker-"+baseName(file.name)+".webp";
S.zoom=1;S.ox=0;S.oy=0;S.mask=null;S._cut=null;S._cutFor=null;S.blob=null;S.maskBusy=false;
zoomIn.value=100;
hideStatus();goStep(2);drawEd();
try{step2.scrollIntoView({behavior:"smooth",block:"start"});}catch(e){}
if(cutTg.checked){S.cutout=true;bgRemove();}else{S.cutout=false;}
}).catch(function(e){
hideStatus();
showErr(e&&e.message==="type"?"File harus berupa gambar (JPG, PNG, atau WebP).":"Gagal memuat foto. Coba foto lain.");});}
var segPromise=null;
function getSeg(){
if(segPromise)return segPromise;
segPromise=new Promise(function(res,rej){
function make(){
var seg=new SelfieSegmentation({locateFile:function(f){return "https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation@0.1.1675465747/"+f;}});
seg.setOptions({modelSelection:1});
return seg;}
if(typeof SelfieSegmentation!=="undefined"){try{res(make());}catch(e){rej(e);}return;}
var s=document.createElement("script");
var to=setTimeout(function(){rej(new Error("timeout"));},25000);
s.onload=function(){clearTimeout(to);try{res(make());}catch(e){rej(e);}};
s.onerror=function(){clearTimeout(to);rej(new Error("load"));};
s.src=SEG_URL;
document.head.appendChild(s);});
return segPromise;}
function maskToAlpha(src){
var sc=Math.min(1,480/Math.max(src.width,src.height));
var w=Math.max(1,Math.round(src.width*sc)),h=Math.max(1,Math.round(src.height*sc));
var c=document.createElement("canvas");c.width=w;c.height=h;
var x=c.getContext("2d");
if(!x)return null;
x.drawImage(src,0,0,w,h);
var d;
try{d=x.getImageData(0,0,w,h);}catch(e){return null;}
var p=d.data,opaque=0;
for(var i=0;i<p.length;i+=4){var a=p[i];if(a>127)opaque++;p[i]=255;p[i+1]=255;p[i+2]=255;p[i+3]=a;}
if(opaque<p.length/4*0.02)return null;
x.putImageData(d,0,0);
return c;}
function runSeg(){
return getSeg().then(function(seg){
return new Promise(function(res,rej){
var done=false;
var to=setTimeout(function(){if(!done){done=true;rej(new Error("timeout"));}},30000);
seg.onResults(function(r){
if(done)return;done=true;clearTimeout(to);
try{res(r&&r.segmentationMask?r.segmentationMask:null);}catch(e){rej(e);}});
var sc=Math.min(1,640/Math.max(S.iw,S.ih));
var w=Math.max(1,Math.round(S.iw*sc)),h=Math.max(1,Math.round(S.ih*sc));
var c=document.createElement("canvas");c.width=w;c.height=h;
c.getContext("2d").drawImage(S.img,0,0,w,h);
try{var pr=seg.send({image:c});if(pr&&pr.catch)pr.catch(function(e){if(!done){done=true;clearTimeout(to);rej(e);}});}
catch(e){if(!done){done=true;clearTimeout(to);rej(e);}}});});}
function cutFail(){
S.cutout=false;
try{cutTg.checked=false;}catch(e){}
drawEd();
note("Wajah tidak terdeteksi — memakai foto utuh.");}
function bgRemove(){
if(S.maskBusy||S.mask||!S.img||!S.cutout)return;
S.maskBusy=true;showStatus("Menghapus background");
runSeg().then(function(src){
S.maskBusy=false;
if(!src){cutFail();return;}
var m=maskToAlpha(refineMask(src));
if(!m){cutFail();return;}
S.mask=m;S._cut=null;hideStatus();drawEd();
}).catch(function(){S.maskBusy=false;cutFail();});}
function renderFinal(){
var c=document.createElement("canvas");c.width=SIZE;c.height=SIZE;
var x=c.getContext("2d");
var b=baseScale()*S.zoom,dw=S.iw*b,dh=S.ih*b;
var dx=(SIZE-dw)/2+S.ox,dy=(SIZE-dh)/2+S.oy;
var src=(S.cutout&&S.mask)?cutCanvas():S.img;
x.drawImage(src,dx,dy,dw,dh);
return c;}
function encodeWebP(canvas){
return new Promise(function(res){
if(!WEBP_OK){res(null);return;}
var q=0.92;
(function step(){
canvas.toBlob(function(bl){
if(!bl||bl.size<=MAXB||q<=0.35){res(bl);return;}
q-=0.12;step();
},"image/webp",q);})();});}
function openModal(){
var els=modal.querySelectorAll(".stwa-fname");
for(var i=0;i<els.length;i++)els[i].textContent=S.fname;
modal.hidden=false;}
function closeModal(){modal.hidden=true;}
makeBtn.addEventListener("click",function(){
if(!S.img||S.maskBusy)return;
if(!WEBP_OK){showErr("Browser kamu tidak mendukung format WebP. Buka halaman ini di Chrome atau Edge versi terbaru.");return;}
showStatus("Membuat stiker");
setTimeout(function(){
var fc;
try{fc=renderFinal();}catch(e){fc=null;}
if(!fc){hideStatus();showErr("Gagal membuat stiker. Coba foto lain.");return;}
encodeWebP(fc).then(function(bl){
hideStatus();
if(!bl){showErr("Gagal membuat file stiker. Coba foto lain.");return;}
S.blob=bl;
var rx=resCanvas.getContext("2d");
if(rx){rx.clearRect(0,0,SIZE,SIZE);rx.drawImage(fc,0,0);}
metaEl.innerHTML="Ukuran <b>512 &times; 512 px</b> &middot; "+FTYPE+" &middot; <b>"+fmtSize(bl.size)+"</b> (maks 100 KB)";
goStep(3);
try{step3.scrollIntoView({behavior:"smooth",block:"start"});}catch(e){}
});},60);});
function downloadBlob(){
var a=document.createElement("a");
a.href=URL.createObjectURL(S.blob);
a.download=S.fname;
document.body.appendChild(a);
a.click();
setTimeout(function(){try{URL.revokeObjectURL(a.href);}catch(e){}a.remove();},4000);}
saveBtn.addEventListener("click",function(){
if(!S.blob)return;
downloadBlob();
openModal();});
// v3: tombol "Unduh File" digabung ke "Simpan ke WhatsApp" — buang bila HTML masih versi lama
if(dlBtn&&dlBtn.parentNode)dlBtn.parentNode.removeChild(dlBtn);
guideOpen&&guideOpen.addEventListener("click",openModal);
function resetAll(){
S.img=null;S.mask=null;S._cut=null;S._cutFor=null;S.blob=null;S.maskBusy=false;
S.zoom=1;S.ox=0;S.oy=0;
try{fileIn.value="";}catch(e){}
zoomIn.value=100;
goStep(1);}
backBtn.addEventListener("click",resetAll);
againBtn.addEventListener("click",resetAll);
modalOk.addEventListener("click",closeModal);
modal.addEventListener("click",function(e){if(e.target===modal)closeModal();});
document.addEventListener("keydown",function(e){if(e.key==="Escape"&&!modal.hidden)closeModal();});
drop.addEventListener("click",function(){fileIn.click();});
fileIn.addEventListener("change",function(){acceptFile(fileIn.files&&fileIn.files[0]);try{fileIn.value="";}catch(e){}});
["dragover","dragenter"].forEach(function(ev){drop.addEventListener(ev,function(e){e.preventDefault();drop.classList.add("stwa-over");});});
["dragleave","drop"].forEach(function(ev){drop.addEventListener(ev,function(e){e.preventDefault();drop.classList.remove("stwa-over");});});
drop.addEventListener("drop",function(e){
var f=e.dataTransfer&&e.dataTransfer.files&&e.dataTransfer.files[0];
acceptFile(f);});
document.addEventListener("paste",function(e){
var cd=e.clipboardData;if(!cd||!cd.files||!cd.files.length)return;
if(step1.hidden)return;
acceptFile(cd.files[0]);});
zoomIn.addEventListener("input",function(){
S.zoom=(+zoomIn.value)/100;drawEd();});
cutTg.addEventListener("change",function(){
S.cutout=!!cutTg.checked;
if(S.cutout&&!S.mask)bgRemove();else drawEd();});
var drag=null;
edCanvas.addEventListener("pointerdown",function(e){
if(!S.img)return;
drag={x:e.clientX,y:e.clientY,ox:S.ox,oy:S.oy};
try{edCanvas.setPointerCapture(e.pointerId);}catch(err){}});
edCanvas.addEventListener("pointermove",function(e){
if(!drag||!S.img)return;
var r=edCanvas.getBoundingClientRect();
var k=SIZE/(r.width||SIZE);
S.ox=drag.ox+(e.clientX-drag.x)*k;
S.oy=drag.oy+(e.clientY-drag.y)*k;
drawEd();});
["pointerup","pointercancel"].forEach(function(ev){edCanvas.addEventListener(ev,function(){drag=null;});});
edCanvas.addEventListener("wheel",function(e){
if(!S.img)return;
e.preventDefault();
var v=+zoomIn.value+(e.deltaY<0?10:-10);
v=Math.min(300,Math.max(25,v));
zoomIn.value=v;S.zoom=v/100;drawEd();},{passive:false});
goStep(1);
}
if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",stwaInit);}else{stwaInit();}
