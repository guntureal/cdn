/* ==========================================================================
   About gwntur.com — v3 (external CDN)
   Tab underline, ripple, dark-mode sync, lightbox bulletproof (ID: gwAboutLb).
   Loaded via: https://cdn.jsdelivr.net/gh/guntureal/cdn@main/about/v3/about-v3.js
   ========================================================================== */
(function(){
  "use strict";

  var root = document.getElementById("gw-fb-profile");
  if(!root) return;

  /* ===== 1. Sinkron dark-mode mengikuti template ===== */
  function isDark(){
    try{
      var b = document.body, h = document.documentElement;
      var darkCls = ["drK","darkMode","dark-mode","dark"];
      var i, c;
      if(b){
        for(i=0;i<darkCls.length;i++){ c=darkCls[i]; if(b.classList && b.classList.contains(c)) return true; }
        if(b.getAttribute("data-theme")==="dark" || b.getAttribute("theme")==="dark") return true;
      }
      if(h){
        for(i=0;i<darkCls.length;i++){ c=darkCls[i]; if(h.classList && h.classList.contains(c)) return true; }
        if(h.getAttribute("data-theme")==="dark" || h.getAttribute("theme")==="dark") return true;
      }
    }catch(e){}
    return false;
  }
  function syncDark(){
    try{ root.classList.toggle("gw-dark", isDark()); }catch(e){}
  }
  syncDark();
  try{
    if(window.MutationObserver){
      var mo = new MutationObserver(syncDark);
      if(document.body) mo.observe(document.body,{attributes:true,attributeFilter:["class","data-theme","theme"]});
      if(document.documentElement) mo.observe(document.documentElement,{attributes:true,attributeFilter:["class","data-theme","theme"]});
    }
  }catch(e){}

  /* ===== 2. Tab menu — indikator garis bawah animasi ===== */
  var nav = root.querySelector(".gw-fb-nav");
  var ind = root.querySelector(".gw-fb-tab-ind");
  var tabs = root.querySelectorAll(".gw-fb-tab");
  var panels = root.querySelectorAll(".gw-fb-panel");

  function moveInd(btn){
    if(!ind || !btn || !nav) return;
    try{
      ind.style.left = (btn.offsetLeft) + "px";
      ind.style.width = (btn.offsetWidth) + "px";
      // Scroll tab aktif ke tengah pada mobile (nav scrollable)
      if(btn.scrollIntoView){
        btn.scrollIntoView({block:"nearest", inline:"center", behavior:"smooth"});
      }
    }catch(e){}
  }

  function showPanel(id){
    try{
      if(tabs && tabs.length){
        Array.prototype.forEach.call(tabs,function(t){
          t.classList.toggle("gw-active", t.getAttribute("data-tab")===id);
          if(t.getAttribute("data-tab")===id){ t.setAttribute("aria-selected","true"); }
          else{ t.removeAttribute("aria-selected"); }
        });
        var act = root.querySelector('.gw-fb-tab[data-tab="'+id+'"]');
        moveInd(act);
      }
      if(panels && panels.length){
        Array.prototype.forEach.call(panels,function(p){
          var on = (p.getAttribute("data-panel")===id);
          if(on){
            p.classList.remove("gw-show");
            void p.offsetWidth; /* restart animasi */
            p.classList.add("gw-show");
            p.removeAttribute("hidden");
          }else{
            p.classList.remove("gw-show");
            p.setAttribute("hidden","");
          }
        });
      }
    }catch(e){}
  }

  /* ===== 3. Ripple effect ===== */
  function ripple(el, x, y){
    if(!el) return;
    try{
      var r = el.getBoundingClientRect();
      var s = document.createElement("span");
      var d = Math.max(r.width, r.height);
      s.className = "gw-ripple";
      s.style.width = s.style.height = d + "px";
      s.style.left = (x - r.left - d/2) + "px";
      s.style.top = (y - r.top - d/2) + "px";
      el.appendChild(s);
      setTimeout(function(){ if(s.parentNode) s.parentNode.removeChild(s); }, 600);
    }catch(e){}
  }

  /* Bind tab — sekali saja (guard via dataset) */
  try{
    if(tabs && tabs.length && !root.dataset.gwTabsBound){
      root.dataset.gwTabsBound = "1";
      Array.prototype.forEach.call(tabs,function(tab){
        tab.addEventListener("pointerdown",function(e){
          ripple(tab, (e.clientX||0), (e.clientY||0));
        });
        tab.addEventListener("click",function(){
          showPanel(tab.getAttribute("data-tab"));
        });
        tab.addEventListener("keydown",function(e){
          if(e && (e.key==="Enter" || e.key===" ")){
            e.preventDefault();
            showPanel(tab.getAttribute("data-tab"));
          }
        });
      });
    }
  }catch(e){}

  /* Ripple untuk tombol aksi */
  try{
    var btns = root.querySelectorAll(".gw-fb-btn");
    if(btns && btns.length && !root.dataset.gwBtnsBound){
      root.dataset.gwBtnsBound = "1";
      Array.prototype.forEach.call(btns,function(b){
        b.addEventListener("pointerdown",function(e){
          ripple(b, (e.clientX||0), (e.clientY||0));
        });
      });
    }
  }catch(e){}

  /* Init tab aktif + reposisi indikator */
  showPanel("about");
  try{
    if(window.addEventListener){
      window.addEventListener("resize",function(){
        var act = root.querySelector(".gw-fb-tab.gw-active");
        moveInd(act);
      });
      window.addEventListener("load",function(){
        var act = root.querySelector(".gw-fb-tab.gw-active");
        moveInd(act);
      });
      /* Reposisi setelah font/layout stabil */
      setTimeout(function(){
        var act = root.querySelector(".gw-fb-tab.gw-active");
        moveInd(act);
      }, 400);
    }
  }catch(e){}

  /* ===== 4. Lightbox bulletproof (ID: gwAboutLb) ===== */
  var LB_ID = "gwAboutLb";
  var lbOpen = false;   /* guard: cegah double-open */
  var lbToken = 0;      /* guard: batalkan timeout close yang basi */
  var lbModal = null;
  var lbImg = null;
  var lbCap = null;

  /* Buat SATU instance modal saat init */
  function buildLb(){
    if(lbModal) return lbModal;
    try{
      /* Jangan buat ganda bila sudah ada (mis. init dua kali) */
      var existing = document.getElementById(LB_ID);
      if(existing){
        lbModal = existing;
      }else{
        var m = document.createElement("div");
        m.id = LB_ID;
        m.setAttribute("aria-hidden","true");
        m.setAttribute("role","dialog");
        m.setAttribute("aria-label","Pratinjau foto");
        m.innerHTML =
          '<div class="gw-lb-inner">' +
            '<button class="gw-lb-close" type="button" aria-label="Tutup">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>' +
            '</button>' +
            '<img class="gw-lb-img" alt="" src="">' +
            '<p class="gw-lb-cap"></p>' +
          '</div>';
        document.body.appendChild(m);
        lbModal = m;
      }
      lbImg = lbModal.querySelector(".gw-lb-img");
      lbCap = lbModal.querySelector(".gw-lb-cap");
      var closeBtn = lbModal.querySelector(".gw-lb-close");

      /* Bind close — sekali saja per instance */
      if(!lbModal.dataset.gwLbBound){
        lbModal.dataset.gwLbBound = "1";
        if(closeBtn){
          closeBtn.addEventListener("click",function(e){
            if(e){ e.preventDefault(); e.stopPropagation(); }
            closeLb();
          });
        }
        lbModal.addEventListener("click",function(e){
          if(e && e.target===lbModal) closeLb(); /* klik backdrop */
        });
      }
    }catch(e){}
    return lbModal;
  }

  function openLb(src, cap, alt){
    if(lbOpen) return;               /* guard: abaikan bila sudah terbuka */
    var modal = buildLb();
    if(!modal || !lbImg) return;
    lbToken++;                        /* batalkan timeout close yang basi */
    lbOpen = true;
    try{
      lbImg.src = src || "";
      lbImg.alt = alt || cap || "Foto";
      if(lbCap) lbCap.textContent = cap || "";
      modal.classList.remove("gw-lb-closing");
      modal.classList.add("gw-lb-open");
      modal.setAttribute("aria-hidden","false");
      document.body.style.overflow = "hidden";   /* kunci scroll */
      var cb = modal.querySelector(".gw-lb-close");
      if(cb && cb.focus){ try{ cb.focus({preventScroll:true}); }catch(e2){} }
    }catch(e){
      lbOpen = false;
    }
  }

  function closeLb(){
    if(!lbOpen || !lbModal) return;
    lbOpen = false;
    var t = ++lbToken;
    try{
      lbModal.classList.add("gw-lb-closing");   /* fade-out via CSS */
      setTimeout(function(){
        if(t!==lbToken) return;                  /* dibatalkan oleh open baru */
        try{
          lbModal.classList.remove("gw-lb-open","gw-lb-closing");
          lbModal.setAttribute("aria-hidden","true");
          document.body.style.overflow = "";     /* restore scroll */
          if(lbImg) lbImg.src = "";
        }catch(e){}
      }, 260);
    }catch(e){
      try{
        lbModal.classList.remove("gw-lb-open","gw-lb-closing");
        document.body.style.overflow = "";
      }catch(e2){}
    }
  }

  /* ESC menutup */
  try{
    document.addEventListener("keydown",function(e){
      if(e && e.key==="Escape" && lbOpen) closeLb();
    });
  }catch(e){}

  /* Bind klik galeri — sekali saja */
  try{
    var items = root.querySelectorAll(".gw-fb-media");
    if(items && items.length && !root.dataset.gwLbBound){
      root.dataset.gwLbBound = "1";
      Array.prototype.forEach.call(items,function(fig){
        /* Opt-out lightbox otomatis Plus UI agar tidak bentrok */
        var im0 = fig.querySelector("img");
        if(im0) im0.setAttribute("data-lightbox","false");

        fig.addEventListener("click",function(e){
          if(e){ e.preventDefault(); e.stopPropagation(); }
          var im = fig.querySelector("img");
          var fc = fig.querySelector("figcaption");
          var src = im ? (im.getAttribute("src")||"") : "";
          var alt = im ? (im.getAttribute("alt")||"") : "";
          var cap = fc ? (fc.textContent||"").trim() : "";
          openLb(src, cap || alt, alt);
        });
      });
    }
  }catch(e){}

})();
/* deploy 1791860717 */
/* 1791862095 */
