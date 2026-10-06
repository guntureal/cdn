// TikTok Downloader v1
function ttdlInit(){
"use strict";
if(!document.getElementById("ttdlApp10"))return;
// Ikon garis 2px (fill none; warna dikunci via CSS agar kebal template)
function ln(p){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+p+'</svg>';}
var IC={
search:ln('<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>'),
paste:ln('<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>'),
download:ln('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/>'),
check:ln('<path d="M22 11.1V12a10 10 0 1 1-5.9-9.1"/><path d="M22 4L12 14l-3-3"/>'),
hd:ln('<rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>'),
image:ln('<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>'),
alert:ln('<path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>'),
film:ln('<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M7 4v16M17 4v16M2 9h5M2 15h5M17 9h5M17 15h5"/>'),
music:ln('<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>'),
play:ln('<circle cx="12" cy="12" r="9"/><path d="M10 8l6 4-6 4V8z"/>'),
heart:ln('<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/>'),
chat:ln('<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2-2z"/>'),
clear:ln('<path d="M18 6L6 18M6 6l12 12"/>'),
share:ln('<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/>')};
// Ambil link dari teks tempelan
function pickUrl(t){var m=String(t||"").match(/https?:\/\/[^\s"'<>]+/i);return (m?m[0]:String(t||"").trim()).replace(/[.,;:!?)]+$/,"");}
function $(id){return document.getElementById(id);}
var app=$("ttdlApp10"),form=$("ttdlForm10"),urlIn=$("ttdlUrl10"),goBtn=$("ttdlGo10"),
pasteBtn=$("ttdlPaste10"),loadEl=$("ttdlLoad10"),errEl=$("ttdlErr10"),errTx=$("ttdlErrTx10"),
resEl=$("ttdlRes10"),avEl=$("ttdlAv10"),unameEl=$("ttdlUname10"),ustatEl=$("ttdlUstat10"),
descEl=$("ttdlDesc10"),vBlock=$("ttdlVBlock10"),iBlock=$("ttdlIBlock10"),vidEl=$("ttdlVid10"),
qEl=$("ttdlQ10"),gridEl=$("ttdlGrid10"),iCountEl=$("ttdlICount10"),allBtn=$("ttdlAll10"),moreBtn=$("ttdlMore10");
var API="https://www.tikwm.com/api/",imgs=[],curKey=null,curData=null,CACHE_TTL=3*60*1000;
// Suntik ikon statis via JS (kebal sanitizer Blogger)
(function(){var s=app.querySelectorAll("[data-ic]");for(var i=0;i<s.length;i++){var k=s[i].getAttribute("data-ic");if(IC[k])s[i].innerHTML=IC[k];}})();
// Tema: baca variabel --bodyB milik template (nilai pasti ikut mode blog)
function lumDark(v){v=String(v||"").trim().toLowerCase();if(!v)return null;
if(v.indexOf("darkb")!==-1)return true;if(v.indexOf("lbodyb")!==-1)return false;
var r,g,b,m;
if((m=v.match(/^#([0-9a-f]{6})$/))){r=parseInt(m[1].substr(0,2),16);g=parseInt(m[1].substr(2,2),16);b=parseInt(m[1].substr(4,2),16);}
else if((m=v.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/))){r=+m[1];g=+m[2];b=+m[3];}
else return null;
return(0.299*r+0.587*g+0.114*b)/255<0.5;}
function syncTheme(){
var dark=null;
try{dark=lumDark(getComputedStyle(app).getPropertyValue("--bodyB"));}catch(e){dark=null;}
if(dark===null){var c=document.getElementById("forMode"); // fallback checkbox template
if(c)dark=!!c.checked;
else{try{dark=matchMedia("(prefers-color-scheme: dark)").matches;}catch(e){dark=false;}}}
app.classList.toggle("ttdl-dark",!!dark);}
syncTheme();
try{
var cb=document.getElementById("forMode");
if(cb)cb.addEventListener("change",syncTheme);
var mo=new MutationObserver(syncTheme);
mo.observe(document.documentElement,{attributes:true,attributeFilter:["class","data-theme"]});
if(document.body)mo.observe(document.body,{attributes:true,attributeFilter:["class","data-theme"]});
matchMedia("(prefers-color-scheme: dark)").addEventListener("change",syncTheme);
}catch(e){}
setTimeout(syncTheme,600);setTimeout(syncTheme,1600);setTimeout(syncTheme,3000);
// Cache: hemat panggilan API untuk link yang sama (anti rate-limit)
var memCache={};
function cGet(k){var m=memCache[k];if(m&&Date.now()<m.exp)return m.data;
try{var o=JSON.parse(localStorage.getItem("ttdl10:"+k)||"null");
if(o&&Date.now()<o.exp){memCache[k]=o;return o.data;}}catch(e){}return null;}
function cSet(k,d){var o={data:d,exp:Date.now()+CACHE_TTL};memCache[k]=o;
try{localStorage.setItem("ttdl10:"+k,JSON.stringify(o));}catch(e){}}
function cDel(k){delete memCache[k];try{localStorage.removeItem("ttdl10:"+k);}catch(e){}}
// Util tampilan
function showErr(h){errTx.innerHTML=h;errEl.classList.add("show");loadEl.style.display="none";resEl.classList.remove("show");}
function fmt(n){n=+n||0;if(n>=1e6)return(n/1e6).toFixed(1).replace(".",",")+" jt";if(n>=1e3)return(n/1e3).toFixed(1).replace(".",",")+" rb";return""+n;}
function okTik(u){return/(tiktok\.com|douyin\.com|vt\.tiktok\.com|vm\.tiktok\.com)/i.test(u||"");}
function esc(s){return String(s==null?"":s).replace(/</g,"&lt;").replace(/>/g,"&gt;");}
function sleep(ms){return new Promise(function(r){setTimeout(r,ms);});}
// Unduh via blob (reject bila gagal agar bisa coba segarkan data)
function dlBlob(url,name){
return fetch(url,{mode:"cors"}).then(function(r){if(!r.ok)throw 0;return r.blob();}).then(function(b){
var a=document.createElement("a"),o=URL.createObjectURL(b);
a.href=o;a.download=name||"tiktok";a.rel="noopener";document.body.appendChild(a);a.click();
setTimeout(function(){URL.revokeObjectURL(o);a.remove();},4000);});}
// Unduh cerdas: gagal -> segarkan data sekali -> coba lagi -> tab baru
function dlSmart(url,name,getUrl){
return dlBlob(url,name).catch(function(){
if(!curKey)throw 0;
cDel(curKey);
return getData(curKey).then(function(d){render(d);var u2=getUrl?getUrl():"";if(!u2||u2===url)throw 0;return dlBlob(u2,name);});
}).catch(function(){window.open(url,"_blank","noopener");});}
// API: GET lalu POST + jeda (tahan 403/429)
function reqGet(u){return fetch(API+"?url="+encodeURIComponent(u)+"&hd=1",{headers:{"Accept":"application/json"}}).then(parseRes);}
function reqPost(u){return fetch(API,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:"url="+encodeURIComponent(u)+"&hd=1"}).then(parseRes);}
function parseRes(r){
if(!r.ok){var e=new Error("http");e.status=r.status;throw e;}
return r.json().then(function(j){
if(!j||j.code!==0||!j.data){var e2=new Error("api");e2.apiMsg=(j&&j.msg)||"";throw e2;}
return j.data;});
}
function fetchAPI(u){var t=[reqGet,reqPost,reqGet],i=0;
function next(){return t[i](u).catch(function(e){if(++i<t.length)return sleep(1600*i).then(next);throw e;});}
return next();}
function getData(u){var hit=cGet(u);if(hit)return Promise.resolve(hit);
return fetchAPI(u).then(function(d){cSet(u,d);return d;});}
function errText(e){
if(e&&e.status===403)return"Koneksi dibatasi server API (403). Tunggu 1-2 menit lalu coba lagi, atau gunakan jaringan lain.<small>Link yang sama tidak memanggil API ulang berkat cache 3 menit.</small>";
if(e&&e.status===429)return"Terlalu banyak permintaan (429). Tunggu sebentar lalu coba lagi.";
if(e&&e.apiMsg)return"API menolak: "+esc(e.apiMsg)+"<small>Pastikan link publik &amp; valid.</small>";
return"Gagal memproses link.<small>Kemungkinan: video privat/dihapus, link salah, atau server API sibuk - coba lagi beberapa saat.</small>";}
// Kartu kualitas
var DOTS='<span class="ttdl-dots" aria-hidden="true"><i></i><i></i><i></i></span>';
function qCard(icon,title,sub,tag,cls,getUrl,name){
var li=document.createElement("li"),box=document.createElement("div");
box.className="ttdl-quality";
box.innerHTML='<div class="ttdl-quality-top"><span class="ttdl-quality-icon">'+icon+'</span><span class="ttdl-quality-text"><b>'+title+'</b><small>'+sub+'</small></span><span class="ttdl-tag '+cls+'">'+tag+'</span></div>';
var b=document.createElement("button");b.className="ttdl-quality-btn";b.type="button";
b.innerHTML='<span class="ttdl-ic">'+IC.download+'</span><span>Download</span>';
b.onclick=function(){var label=b.querySelectorAll("span")[1],orig=label.innerHTML;
b.disabled=true;label.innerHTML=DOTS;
dlSmart(getUrl(),name,getUrl).then(function(){b.disabled=false;label.innerHTML=orig;});};
box.appendChild(b);li.appendChild(box);return li;}
function audioUrlOf(x){return x?(x.music||((x.music_info||{}).play||"")):"";}
// Render hasil
function render(d){
curData=d;
var id=d.id||"video",au=d.author||{};
unameEl.textContent="@"+(au.unique_id||au.nickname||"tiktok");
avEl.onerror=function(){avEl.style.display="none";};
if(au.avatar){avEl.src=au.avatar;avEl.alt="Foto profil @"+(au.unique_id||"tiktok");avEl.style.display="";}else{avEl.style.display="none";}
ustatEl.innerHTML='<span>'+IC.play+'<b>'+fmt(d.play_count)+'</b></span><span>'+IC.heart+'<b>'+fmt(d.digg_count)+'</b></span><span>'+IC.chat+'<b>'+fmt(d.comment_count)+'</b></span><span>'+IC.share+'<b>'+fmt(d.share_count)+'</b></span>';
descEl.textContent=d.title||"";
descEl.classList.remove("open");moreBtn.style.display="none";moreBtn.textContent="Lihat selengkapnya";
var im=d.images;
if(im&&im.length){ // mode foto
vBlock.style.display="none";iBlock.style.display="";imgs=im.slice();
iCountEl.textContent="("+im.length+")";gridEl.innerHTML="";
im.forEach(function(src,i){
var li=document.createElement("li");li.className="ttdl-photo";
var g=document.createElement("img");g.src=src;g.alt="Foto TikTok "+(i+1);g.loading="lazy";g.decoding="async";
g.onerror=function(){li.style.display="none";};
var t=document.createElement("button");t.type="button";t.className="ttdl-photo-btn";
t.innerHTML='<span class="ttdl-ic">'+IC.download+'</span><span>Foto '+(i+1)+'</span>';
t.onclick=function(){var label=t.querySelectorAll("span")[1],orig=label.innerHTML,idx=i,nm="tiktok_"+id+"_foto"+(idx+1)+".jpg";
t.disabled=true;label.innerHTML=DOTS;
dlSmart(src,nm,function(){return imgs[idx];}).then(function(){t.disabled=false;label.innerHTML=orig;});};
li.appendChild(g);li.appendChild(t);gridEl.appendChild(li);});
}else{ // mode video
iBlock.style.display="none";vBlock.style.display="";qEl.innerHTML="";
var best=d.hdplay||d.play;
if(best){vidEl.src=best;vidEl.style.display="";}else{vidEl.removeAttribute("src");vidEl.style.display="none";}
if(d.hdplay)qEl.appendChild(qCard(IC.film,"Video HD","Kualitas tertinggi, tanpa watermark","HD","hd",function(){return curData&&curData.hdplay;},"tiktok_"+id+"_HD.mp4"));
if(d.play&&d.play!==d.hdplay)qEl.appendChild(qCard(IC.play,"Video standar","Tanpa watermark","SD","sd",function(){return curData&&curData.play;},"tiktok_"+id+"_SD.mp4"));
var au0=audioUrlOf(d);
if(au0)qEl.appendChild(qCard(IC.music,"Audio / musik","Format MP3","MP3","mp3",function(){return audioUrlOf(curData);},"tiktok_"+id+"_audio.mp3"));
if(!d.play&&!d.hdplay){showErr("Tidak ada file video yang bisa diambil dari link ini.");return;}}
resEl.classList.add("show");
syncMore();
try{resEl.scrollIntoView({behavior:"smooth",block:"nearest"});}catch(e){}}
// Deskripsi panjang: lipat + tombol selengkapnya
function syncMore(){var tx=descEl.textContent||"";
var need=tx.length>140||descEl.scrollHeight>descEl.clientHeight+4;
moreBtn.style.display=need?"":"none";if(!need)descEl.classList.remove("open");}
moreBtn.onclick=function(){var open=descEl.classList.toggle("open");moreBtn.textContent=open?"Tutup":"Lihat selengkapnya";};
// Submit: pakai cache dulu
form.addEventListener("submit",function(ev){
ev.preventDefault();
var u=pickUrl(urlIn.value);
errEl.classList.remove("show");resEl.classList.remove("show");
if(!u){showErr("Tempel dulu link TikTok-nya.");return;}
if(!okTik(u)){showErr("Link tidak terlihat seperti link TikTok.<small>Contoh: https://vt.tiktok.com/ZSb4ruewL/</small>");return;}
curKey=u;var goLabel=goBtn.querySelectorAll("span")[1],goOrig=goLabel.innerHTML;
goBtn.disabled=true;goLabel.innerHTML=DOTS;loadEl.style.display="block";
getData(u).then(render).catch(function(e){showErr(errText(e));})
.then(function(){goBtn.disabled=false;goLabel.innerHTML=goOrig;loadEl.style.display="none";});});
// Tombol tempel berubah jadi hapus saat kolom terisi
function syncPaste(){var has=urlIn.value.trim().length>0;
pasteBtn.innerHTML=has?IC.clear:IC.paste;
pasteBtn.title=has?"Hapus link":"Tempel dari clipboard";
pasteBtn.setAttribute("aria-label",pasteBtn.title);}
urlIn.addEventListener("input",syncPaste);
pasteBtn.onclick=function(){
if(urlIn.value.trim()){urlIn.value="";syncPaste();urlIn.focus();return;}
if(navigator.clipboard&&navigator.clipboard.readText){
navigator.clipboard.readText().then(function(t){if(t){urlIn.value=pickUrl(t);syncPaste();urlIn.focus();}}).catch(function(){urlIn.focus();});
}else{urlIn.focus();}};
syncPaste();
// Unduh semua foto
allBtn.onclick=function(){
if(!imgs.length)return;var i=0,sp=allBtn.querySelectorAll("span")[1],orig=sp.innerHTML;
allBtn.disabled=true;
(function nx(){
if(i>=imgs.length){allBtn.disabled=false;sp.innerHTML=orig;return;}
var idx=i;sp.innerHTML=DOTS;
dlSmart(imgs[idx],"tiktok_foto"+(idx+1)+".jpg",function(){return imgs[idx];}).then(function(){i++;setTimeout(nx,900);});})();};
}
if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",ttdlInit);}else{ttdlInit();}