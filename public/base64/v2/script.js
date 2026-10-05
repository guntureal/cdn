(function () {
  'use strict';
  var root = document.getElementById('gw-base64-tool');
  if (!root || root.getAttribute('data-gw-initialized') === 'true') return;
  root.setAttribute('data-gw-initialized', 'true');

  function q(sel) { return root.querySelector(sel); }
  var input=q('#gw-base64-input'), output=q('#gw-base64-output');
  var processBtn=q('#gw-base64-process'), resetBtn=q('#gw-base64-clear'), swapBtn=q('#gw-base64-swap');
  var copyBtn=q('#gw-base64-copy'), downloadBtn=q('#gw-base64-download');
  var copyIcon=copyBtn ? copyBtn.querySelector('.gw-button-icon') : null;
  var copyLabel=copyBtn ? copyBtn.querySelector('.gw-copy-label') : null;
  var copyTimer=null;
  var copyIconDefault=copyIcon ? copyIcon.innerHTML : '';
  var status=q('#gw-base64-status'), statusText=q('#gw-base64-status-text');
  var inputCount=q('#gw-base64-input-count'), outputCount=q('#gw-base64-output-count');
  var inputTitle=q('#gw-base64-input-title'), outputTitle=q('#gw-base64-output-title');
  var tabs=Array.prototype.slice.call(root.querySelectorAll('.gw-mode'));
  if (!input || !output || !processBtn || !resetBtn || !swapBtn) return;
  var mode='encode';

  function setStatus(message, type) {
    if (statusText) statusText.textContent=message;
    if (status) {
      status.classList.remove('gw-ok','gw-error');
      if (type === 'success') status.classList.add('gw-ok');
      if (type === 'error') status.classList.add('gw-error');
    }
  }
  function isDarkTheme() {
    var html=document.documentElement, body=document.body;
    if (!html) return false;
    var attrs=[html.getAttribute('data-theme'),html.getAttribute('data-mode'),body && body.getAttribute('data-theme'),body && body.getAttribute('data-mode')];
    var attrDark=attrs.some(function(v){return v && /^(dark|dark-mode|darkmode)$/i.test(v);});
    var classDark=[html,body].some(function(el){return el && el.classList && (el.classList.contains('drK')||el.classList.contains('darkMode')||el.classList.contains('dark-mode')||el.classList.contains('dark'));});
    return attrDark || classDark;
  }
  function syncTheme() { root.classList.toggle('gw-dark',isDarkTheme()); }
  syncTheme();
  if (typeof MutationObserver !== 'undefined') {
    var themeObserver=new MutationObserver(syncTheme);
    themeObserver.observe(document.documentElement,{attributes:true,attributeFilter:['class','data-theme','data-mode']});
    if (document.body) themeObserver.observe(document.body,{attributes:true,attributeFilter:['class','data-theme','data-mode']});
  }
  function count(value) { return value.length.toLocaleString('id-ID') + ' karakter'; }
  function updateCounts() {
    if (inputCount) inputCount.textContent=count(input.value);
    if (outputCount) outputCount.textContent=count(output.value);
  }
  function setMode(next) {
    mode = next === 'decode' ? 'decode' : 'encode';
    tabs.forEach(function(tab){
      var active=tab.getAttribute('data-mode') === mode;
      tab.classList.toggle('gw-active', active);
      tab.setAttribute('aria-selected', active ? 'true' : 'false');
      tab.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    if (inputTitle) inputTitle.textContent = mode === 'encode' ? 'Text input' : 'Base64 input';
    if (outputTitle) outputTitle.textContent = mode === 'encode' ? 'Base64 Output' : 'Decoded Text';
    input.placeholder = mode === 'encode' ? 'Masukkan teks yang ingin diubah menjadi Base64...' : 'Masukkan kode Base64 yang ingin di-decode...';
    output.placeholder = mode === 'encode' ? 'Hasil Base64 akan muncul di sini...' : 'Hasil teks akan muncul di sini...';
    var label=q('#gw-base64-process-label');
    if (label) label.textContent=mode === 'encode' ? 'Encode Base64' : 'Decode Base64';
    processBtn.setAttribute('aria-label', mode === 'encode' ? 'Encode Base64' : 'Decode Base64');
  }
  function animateProcess() {
    var icon=q('#gw-base64-process .gw-action-icon');
    if (!icon) return;
    icon.classList.remove('gw-processing');
    void icon.offsetWidth;
    icon.classList.add('gw-processing');
  }
  function utf8ToBase64(value) {
    if (typeof TextEncoder !== 'undefined') {
      var bytes=new TextEncoder().encode(value), binary='', chunk=0x8000;
      for (var i=0;i<bytes.length;i+=chunk) binary += String.fromCharCode.apply(null, bytes.subarray(i,i+chunk));
      return btoa(binary);
    }
    return btoa(unescape(encodeURIComponent(value)));
  }
  function base64ToUtf8(value) {
    var clean=value.replace(/[\t\n\f\r ]+/g,'');
    if (!clean) return '';
    if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(clean)) throw new Error('Format Base64 tidak valid.');
    var binary=atob(clean);
    if (typeof TextDecoder !== 'undefined') {
      var bytes=new Uint8Array(binary.length);
      for (var i=0;i<binary.length;i++) bytes[i]=binary.charCodeAt(i);
      try { return new TextDecoder('utf-8',{fatal:true}).decode(bytes); }
      catch(e) { throw new Error('Data Base64 bukan UTF-8 yang valid.'); }
    }
    try { return decodeURIComponent(escape(binary)); }
    catch(e) { throw new Error('Data Base64 bukan UTF-8 yang valid.'); }
  }
  function process() {
    animateProcess();
    if (!input.value) { output.value=''; updateCounts(); setStatus('Masukkan data terlebih dahulu.','error'); return; }
    try {
      output.value = mode === 'encode' ? utf8ToBase64(input.value) : base64ToUtf8(input.value);
      updateCounts();
      setStatus(mode === 'encode' ? 'Teks berhasil di-encode.' : 'Base64 berhasil di-decode.','success');
    } catch(e) { output.value=''; updateCounts(); setStatus(e && e.message ? e.message : 'Data tidak dapat diproses.','error'); }
  }
  function swap() {
    var a=input.value, b=output.value;
    input.value=b; output.value=a;
    setMode(mode === 'encode' ? 'decode' : 'encode');
    updateCounts();
    setStatus('Input dan output ditukar.','success');
    input.focus();
  }
  function reset() {
    input.value=''; output.value=''; setMode('encode'); updateCounts(); setStatus('Siap digunakan.'); input.focus();
  }
  function showCopySuccess() {
    if (!copyBtn || !copyIcon) return;
    if (copyTimer) clearTimeout(copyTimer);
    copyIcon.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.2 4.2L19 7"></path></svg>';
    if (copyLabel) copyLabel.textContent='Tersalin';
    copyBtn.classList.add('gw-copied');
    copyBtn.setAttribute('aria-label','Berhasil disalin');
    copyBtn.setAttribute('title','Berhasil disalin');
    copyTimer=setTimeout(function(){
      copyIcon.innerHTML=copyIconDefault;
      if (copyLabel) copyLabel.textContent='Salin';
      copyBtn.classList.remove('gw-copied');
      copyBtn.setAttribute('aria-label','Salin');
      copyBtn.setAttribute('title','Salin hasil');
      copyTimer=null;
    },1500);
  }
  function fallbackCopy(value) {
    var area=document.createElement('textarea');
    area.value=value; area.setAttribute('readonly','');
    area.style.position='fixed'; area.style.left='-9999px'; area.style.top='0';
    document.body.appendChild(area); area.select();
    var ok=false; try { ok=document.execCommand('copy'); } catch(e) { ok=false; }
    document.body.removeChild(area);
    if (ok) { showCopySuccess(); setStatus('Hasil berhasil disalin.','success'); }
    else setStatus('Gagal menyalin hasil.','error');
  }
  function copy() {
    if (!output.value) { setStatus('Belum ada hasil untuk disalin.','error'); return; }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(output.value).then(function(){
        showCopySuccess();
        setStatus('Hasil berhasil disalin.','success');
      },function(){fallbackCopy(output.value);});
    } else fallbackCopy(output.value);
  }
  function download() {
    if (!output.value) { setStatus('Belum ada hasil untuk di-download.','error'); return; }
    var blob=new Blob([output.value],{type:'text/plain;charset=utf-8'}), url=URL.createObjectURL(blob), link=document.createElement('a');
    link.href=url; link.download=mode === 'encode' ? 'base64.txt' : 'decoded.txt';
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
    setTimeout(function(){URL.revokeObjectURL(url);},1000);
    setStatus('Hasil berhasil di-download.','success');
  }
  tabs.forEach(function(tab){ tab.addEventListener('click',function(){ setMode(tab.getAttribute('data-mode')); setStatus('Mode '+(mode==='encode'?'Encode':'Decode')+' dipilih.'); }); });
  processBtn.addEventListener('click',process); resetBtn.addEventListener('click',reset); swapBtn.addEventListener('click',swap);
  if (copyBtn) copyBtn.addEventListener('click',copy); if (downloadBtn) downloadBtn.addEventListener('click',download);
  input.addEventListener('input',updateCounts);
  input.addEventListener('keydown',function(e){if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){e.preventDefault();process();}});
  setMode('encode'); updateCounts();
}());
