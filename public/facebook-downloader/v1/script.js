// Facebook Downloader v1
function fbdlInit(){
"use strict";
if(!document.getElementById("fbdlApp1"))return;
// Ikon garis 2px (fill none; warna dikunci via CSS agar kebal template)
function ln(p){return '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+p+'</svg>';}
var IC={
search:ln('<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>'),
paste:ln('<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M9 12h6M9 16h6"/>'),
download:ln('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/>'),
check:ln('<path d="M22 11.1V12a10 10 0 1 1-5.9-9.1"/><path d="M22 4L12 14l-3-3"/>'),
hd:ln('<rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>'),
alert:ln('<path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7 3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>'),
film:ln('<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M7 4v16M17 4v16M2 9h5M2 15h5M17 9h5M17 15h5"/>'),
play:ln('<circle cx="12" cy="12" r="9"/><path d="M10 8l6 4-6 4V8z"/>'),
clear:ln('<path d="M18 6L6 18M6 6l12 12"/>'),
user:ln('<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'),
eye:ln('<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>'),
heart:ln('<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/>')};
// GANTI dengan URL Cloudflare Worker milikmu (deploy dari worker.js)
var API="https://fbdl.gwntur.com/?url=";
// Ambil link dari teks tempelan
function pickUrl(t){var m=String(t||"").match(/https?:\/\/[^\s"'<>]+/i);return (m?m[0]:String(t||"").trim()).replace(/[.,;:!?)]+$/,"");}
function $(id){return document.getElementById(id);}
var app=$("fbdlApp1"),form=$("fbdlForm1"),urlIn=$("fbdlUrl1"),goBtn=$("fbdlGo1"),
pasteBtn=$("fbdlPaste1"),loadEl=$("fbdlLoad1"),errEl=$("fbdlErr1"),errTx=$("fbdlErrTx1"),
resEl=$("fbdlRes1"),titleEl=$("fbdlTitle1"),descEl=$("fbdlDesc1"),moreBtn=$("fbdlMore1"),
vidEl=$("fbdlVid1"),qEl=$("fbdlQ1"),vBlock=$("fbdlVBlock1"),iBlock=$("fbdlIBlock1"),
gridEl=$("fbdlGrid1"),iCountEl=$("fbdlICount1"),
authorEl=$("fbdlAuthor1"),authorName=$("fbdlAuthorName1"),statsEl=$("fbdlStats1");
var curKey=null,curData=null,imgs=[],CACHE_TTL=3*60*1000;
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
app.classList.toggle("fbdl-dark",!!dark);}
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
try{var o=JSON.parse(localStorage.getItem("fbdl1:"+k)||"null");
if(o&&Date.now()<o.exp){memCache[k]=o;return o.data;}}catch(e){}return null;}
function cSet(k,d){var o={data:d,exp:Date.now()+CACHE_TTL};memCache[k]=o;
try{localStorage.setItem("fbdl1:"+k,JSON.stringify(o));}catch(e){}}
function cDel(k){delete memCache[k];try{localStorage.removeItem("fbdl1:"+k);}catch(e){}}
// Util tampilan
function showErr(h){errTx.innerHTML=h;errEl.classList.add("show");loadEl.style.display="none";resEl.classList.remove("show");}
function okFb(u){return/(facebook\.com|fb\.watch|fb\.com)/i.test(u||"");}
function esc(s){return String(s==null?"":s).replace(/</g,"&lt;").replace(/>/g,"&gt;");}
function sleep(ms){return new Promise(function(r){setTimeout(r,ms);});}
// Unduh via blob (reject bila gagal agar bisa coba segarkan data)
function dlBlob(url,name){
return fetch(url,{mode:"cors"}).then(function(r){if(!r.ok)throw 0;return r.blob();}).then(function(b){
var a=document.createElement("a"),o=URL.createObjectURL(b);
a.href=o;a.download=name||"facebook";a.rel="noopener";document.body.appendChild(a);a.click();
setTimeout(function(){URL.revokeObjectURL(o);a.remove();},4000);});}
// Unduh cerdas: gagal -> segarkan data sekali -> coba lagi -> tab baru
function dlSmart(url,name,getUrl){
return dlBlob(url,name).catch(function(){
if(!curKey)throw 0;
cDel(curKey);
return getData(curKey).then(function(d){render(d);var u2=getUrl?getUrl():"";if(!u2||u2===url)throw 0;return dlBlob(u2,name);});
}).catch(function(){window.open(url,"_blank","noopener");});}
// API Worker: GET + 1x ulangi bila gagal
function reqApi(u){return fetch(API+encodeURIComponent(u),{headers:{"Accept":"application/json"}}).then(parseRes);}
function parseRes(r){
if(!r.ok){var e=new Error("http");e.status=r.status;throw e;}
return r.json().then(function(j){
if(!j||j.code!==0||!j.data){var e2=new Error("api");e2.apiMsg=(j&&j.msg)||"";e2.apiCode=j?j.code:0;throw e2;}
return j.data;});}
function fetchAPI(u){return reqApi(u).catch(function(e){if(e&&e.apiCode)return Promise.reject(e);return sleep(1800).then(function(){return reqApi(u);});});}
function getData(u){var hit=cGet(u);if(hit)return Promise.resolve(hit);
return fetchAPI(u).then(function(d){cSet(u,d);return d;});}
function errText(e){
if(e&&e.apiMsg)return esc(e.apiMsg);
if(e&&e.status===429)return"Terlalu banyak permintaan (429). Tunggu sebentar lalu coba lagi.";
return"Gagal memproses link.<small>Kemungkinan: video privat/dihapus, link salah, butuh login, atau server sibuk - coba lagi beberapa saat. Hanya video publik yang bisa diunduh.</small>";}
// Kartu kualitas
var DOTS='<span class="fbdl-dots" aria-hidden="true"><i></i><i></i><i></i></span>';
function qCard(icon,title,sub,tag,cls,getUrl,name){
var li=document.createElement("li"),box=document.createElement("div");
box.className="fbdl-quality";
box.innerHTML='<div class="fbdl-quality-top"><span class="fbdl-quality-icon">'+icon+'</span><span class="fbdl-quality-text"><b>'+title+'</b><small>'+sub+'</small></span><span class="fbdl-tag '+cls+'">'+tag+'</span></div>';
var b=document.createElement("button");b.className="fbdl-quality-btn";b.type="button";
b.innerHTML='<span class="fbdl-ic">'+IC.download+'</span><span>Download</span>';
b.onclick=function(){var label=b.querySelectorAll("span")[1],orig=label.innerHTML;
b.disabled=true;label.innerHTML=DOTS;
dlSmart(getUrl(),name,getUrl).then(function(){b.disabled=false;label.innerHTML=orig;});};
box.appendChild(b);li.appendChild(box);return li;}
// Render hasil
function render(d){
curData=d;
titleEl.textContent=d.title||"Video Facebook";
titleEl.style.display=(d.title?"":"none");
// kartu author + statistik
var hasAuthor=d.author||d.views||d.reactions;
authorEl.style.display=hasAuthor?"":"none";
if(hasAuthor){
authorName.textContent=d.author||"Facebook";
var st="";
if(d.views)st+='<span><span class="fbdl-ic">'+IC.eye+'</span>'+esc(d.views)+' views</span>';
if(d.reactions)st+='<span><span class="fbdl-ic">'+IC.heart+'</span>'+esc(d.reactions)+'</span>';
statsEl.innerHTML=st;
}
descEl.textContent=d.desc||"";
descEl.style.display=(d.desc?"":"none");
descEl.classList.remove("open");moreBtn.style.display="none";moreBtn.textContent="Lihat selengkapnya";
qEl.innerHTML="";gridEl.innerHTML="";
var im=d.images;
if(im&&im.length&&!d.hd&&!d.sd){ // mode foto
vBlock.style.display="none";iBlock.style.display="";imgs=im.slice();
iCountEl.textContent="("+im.length+")";
im.forEach(function(src,i){
var li=document.createElement("li");li.className="fbdl-photo";
var g=document.createElement("img");g.src=src;g.alt="Foto Facebook "+(i+1);g.loading="lazy";g.decoding="async";
g.onerror=function(){li.style.display="none";};
var t=document.createElement("button");t.type="button";t.className="fbdl-photo-btn";
t.innerHTML='<span class="fbdl-ic">'+IC.download+'</span><span>Foto '+(i+1)+'</span>';
t.onclick=function(){var label=t.querySelectorAll("span")[1],orig=label.innerHTML,idx=i;
t.disabled=true;label.innerHTML=DOTS;
dlSmart(src,"facebook_foto"+(idx+1)+".jpg",function(){return imgs[idx];}).then(function(){t.disabled=false;label.innerHTML=orig;});};
li.appendChild(g);li.appendChild(t);gridEl.appendChild(li);});
}else{ // mode video
iBlock.style.display="none";vBlock.style.display="";
var best=d.hd||d.sd;
if(best){vidEl.src=best;if(d.thumbnail)vidEl.poster=d.thumbnail;vidEl.style.display="";
vidEl.onerror=function(){showErr("Video tidak bisa diputar langsung.<small>URL video mungkin kedaluwarsa - coba unduh via tombol di bawah, atau ulangi proses linknya.</small>");};}else{vidEl.removeAttribute("src");vidEl.style.display="none";}
if(d.hd)qEl.appendChild(qCard(IC.film,"Video HD","Kualitas tertinggi","HD","hd",function(){return curData&&curData.hd;},"facebook_HD.mp4"));
if(d.sd)qEl.appendChild(qCard(IC.play,"Video SD","Kualitas standar","SD","sd",function(){return curData&&curData.sd;},"facebook_SD.mp4"));
if(!d.hd&&!d.sd&&!(d.images&&d.images.length)){showErr("Tidak ada file video yang bisa diambil dari link ini.");return;}
} // tutup mode video
resEl.classList.add("show");
syncMore();
try{resEl.scrollIntoView({behavior:"smooth",block:"nearest"});}catch(e){}}
// Deskripsi panjang: lipat + tombol selengkapnya
function syncMore(){var tx=descEl.textContent||"";
var need=descEl.style.display!=="none"&&(tx.length>140||descEl.scrollHeight>descEl.clientHeight+4);
moreBtn.style.display=need?"":"none";if(!need)descEl.classList.remove("open");}
moreBtn.onclick=function(){var open=descEl.classList.toggle("open");moreBtn.textContent=open?"Tutup":"Lihat selengkapnya";};
// Submit: pakai cache dulu
form.addEventListener("submit",function(ev){
ev.preventDefault();
var u=pickUrl(urlIn.value);
errEl.classList.remove("show");resEl.classList.remove("show");
if(!u){showErr("Tempel dulu link Facebook-nya.");return;}
if(!okFb(u)){showErr("Link tidak terlihat seperti link Facebook.<small>Contoh: https://www.facebook.com/watch/?v=...</small>");return;}
curKey=u;var goLabel=goBtn.querySelectorAll("span")[1],goOrig=goLabel.innerHTML;
goBtn.disabled=true;goLabel.innerHTML=DOTS;loadEl.style.display="block";
getData(u).then(render).catch(function(e){
if(e&&e.apiCode===-4){showShareHelp(u);}else{showErr(errText(e));}})
.then(function(){goBtn.disabled=false;goLabel.innerHTML=goOrig;loadEl.style.display="none";});});
// Bantuan link share: buka link, salin URL asli, tempel di sini
function showShareHelp(u){
errTx.innerHTML='Link share Facebook (<b>/share/...</b>) tidak bisa diproses langsung oleh server.<small>Buka link di tab baru, salin URL video aslinya (contoh: <b>facebook.com/reel/123...</b>), lalu tempel di kolom atas.</small><button type="button" class="fbdl-open" id="fbdlOpen1">Buka link share</button>';
errEl.classList.add("show");loadEl.style.display="none";resEl.classList.remove("show");
var b=$("fbdlOpen1");if(b)b.onclick=function(){window.open(u,"_blank","noopener");};}
// Tombol tempel berubah jadi hapus saat kolom terisi
function syncPaste(){var has=urlIn.value.trim().length>0;
pasteBtn.innerHTML=has?IC.clear:IC.paste;
pasteBtn.title=has?"Hapus link":"Tempel dari clipboard";
pasteBtn.setAttribute("aria-label",pasteBtn.title);}
urlIn.addEventListener("input",syncPaste);
pasteBtn.onclick=function(){
if(urlIn.value.trim()){urlIn.value="";syncPaste();urlIn.focus();return;}
function manualPaste(){urlIn.focus();urlIn.select();showErr("Izin clipboard ditolak.<small>Tekan <b>Ctrl+V</b> (atau tahan-lalu-tempel di HP) untuk menempel link.</small>");}
if(navigator.clipboard&&navigator.clipboard.readText){
navigator.clipboard.readText().then(function(t){if(t&&t.trim()){urlIn.value=pickUrl(t);syncPaste();urlIn.focus();}else{manualPaste();}}).catch(function(){manualPaste();});
}else{manualPaste();}};
syncPaste();
}
if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",fbdlInit);}else{fbdlInit();}
