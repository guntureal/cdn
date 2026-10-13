// About Portfolio v1 - Fullscreen Interactive
(function(){
"use strict";
var root=document.getElementById("gw1")||document.getElementById("gw18");
if(!root)return;
var P=root.id;
var reduceMotion=false;
try{reduceMotion=matchMedia("(prefers-reduced-motion: reduce)").matches;}catch(e){}
/* theme */
function lumDark(v){v=String(v||"").trim().toLowerCase();if(!v)return null;
if(v.indexOf("darkb")!==-1)return true;if(v.indexOf("lbodyb")!==-1)return false;
var r,g,b,m;
if((m=v.match(/^#([0-9a-f]{6})$/))){r=parseInt(m[1].substr(0,2),16);g=parseInt(m[1].substr(2,2),16);b=parseInt(m[1].substr(4,2),16);}
else if((m=v.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/))){r=+m[1];g=+m[2];b=+m[3];}
else return null;
return(0.299*r+0.587*g+0.114*b)/255<0.5;}
function syncTheme(){
var dark=null;
try{dark=lumDark(getComputedStyle(root).getPropertyValue("--bodyB"));}catch(e){dark=null;}
if(dark===null){try{dark=matchMedia("(prefers-color-scheme: dark)").matches;}catch(e){dark=false;}}
root.classList.toggle(P+"-dark",!!dark);}
syncTheme();
try{
var mo=new MutationObserver(syncTheme);
mo.observe(document.documentElement,{attributes:true,attributeFilter:["class","data-theme"]});
if(document.body)mo.observe(document.body,{attributes:true,attributeFilter:["class","data-theme"]});
}catch(e){}
setTimeout(syncTheme,800);
/* typing */
var roles=["Web Developer","SEO Specialist","Content Strategist","UI/UX Designer"];
var typeEl=document.getElementById(P+"Type");
if(typeEl&&!reduceMotion){
var ri=0,ci=0,del=false;
(function tick(){
var w=roles[ri];
if(!del){ci++;if(ci>=w.length){ci=w.length;del=true;typeEl.textContent=w;return void setTimeout(tick,1700);}}
else{ci--;if(ci<=0){ci=0;del=false;ri=(ri+1)%roles.length;}}
typeEl.textContent=w.slice(0,ci);
setTimeout(tick,del?36:72);
})();
}else if(typeEl){typeEl.textContent=roles[0];}
/* reveal (enter + exit) */
var rvs=root.querySelectorAll("."+P+"-rv");
if("IntersectionObserver"in window){
var io=new IntersectionObserver(function(es){
es.forEach(function(e){
if(e.isIntersecting){e.target.classList.add("in");}
else if(e.boundingClientRect.top>0){e.target.classList.remove("in");}
});},{threshold:.08,root:root,rootMargin:"0px 0px -30px 0px"});
rvs.forEach(function(el,i){el.style.transitionDelay=Math.min((i%5)*60,240)+"ms";io.observe(el);});
}else{rvs.forEach(function(el){el.classList.add("in");});}
/* magnetic buttons */
if(!reduceMotion&&matchMedia("(pointer:fine)").matches){
root.querySelectorAll("."+P+"-mag").forEach(function(btn){
btn.addEventListener("mousemove",function(e){
var r=btn.getBoundingClientRect();
var x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2;
btn.style.transform="translate("+(x*0.14).toFixed(1)+"px,"+(y*0.2).toFixed(1)+"px)";});
btn.addEventListener("mouseleave",function(){btn.style.transform="";});});
/* card tilt */
root.querySelectorAll("."+P+"-card").forEach(function(card){
card.addEventListener("mousemove",function(e){
var r=card.getBoundingClientRect();
var x=(e.clientX-r.left)/r.width-0.5,y=(e.clientY-r.top)/r.height-0.5;
card.style.transform="perspective(900px) rotateX("+(-y*7).toFixed(2)+"deg) rotateY("+(x*7).toFixed(2)+"deg) translateY(-4px)";});
card.addEventListener("mouseleave",function(){card.style.transform="";});});}
/* skill bars */
function animateBars(scope){
scope.querySelectorAll(".gw1-bar").forEach(function(bar){
var u=bar.querySelector("u"),p=+bar.getAttribute("data-p")||0;
if(!u||bar._done)return;bar._done=true;
requestAnimationFrame(function(){requestAnimationFrame(function(){u.style.width=p+"%";});});});}
if("IntersectionObserver"in window){
var io2=new IntersectionObserver(function(es){
es.forEach(function(e){if(e.isIntersecting){animateBars(e.target);io2.unobserve(e.target);}});},
{threshold:.25,root:root});
var sk=root.querySelector("#"+P+"Skills");if(sk)io2.observe(sk);
}else{var sk0=root.querySelector("#"+P+"Skills");if(sk0)animateBars(sk0);}
/* filter */
var fbtns=root.querySelectorAll("."+P+"-filter button");
fbtns.forEach(function(b){
b.addEventListener("click",function(){
fbtns.forEach(function(x){x.classList.remove("on");});b.classList.add("on");
var f=b.getAttribute("data-f");
root.querySelectorAll("."+P+"-card").forEach(function(c){
var show=f==="all"||c.getAttribute("data-c")===f||(f==="all"&&c.getAttribute("data-c")==="all");
c.classList.toggle("hide",!show);});});});
/* footer back to top */
function goTop(){root.scrollTo({top:0,behavior:reduceMotion?"auto":"smooth"});}
var t2=document.getElementById(P+"TopBtn");
if(t2)t2.addEventListener("click",function(e){e.preventDefault();goTop();});
/* smooth anchors */
root.addEventListener("click",function(e){
var a=e.target.closest('a[href^="#"]');
if(!a||a.id===P+"TopBtn")return;
var t=root.querySelector(a.getAttribute("href"));
if(t){e.preventDefault();
var y=t.getBoundingClientRect().top-root.getBoundingClientRect().top+root.scrollTop-20;
root.scrollTo({top:y,behavior:reduceMotion?"auto":"smooth"});}});
})();
