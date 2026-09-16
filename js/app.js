/* ==========================================================================
   AET — APP.JS (partagé sur toutes les pages)
   Thème (clair/sombre/auto, mémorisé), menu mobile plein écran, toast utilitaire
   ========================================================================== */

(function(){
  // ---------- THEME ----------
  const THEME_KEY = 'aet_theme';
  function applyTheme(mode){
    document.documentElement.setAttribute('data-theme', mode);
    try{ localStorage.setItem(THEME_KEY, mode); }catch(e){}
    document.querySelectorAll('.theme-toggle button').forEach(b=>{
      b.classList.toggle('active', b.dataset.mode === mode);
    });
  }
  function initTheme(){
    let mode = 'auto';
    try{ mode = localStorage.getItem(THEME_KEY) || 'auto'; }catch(e){}
    applyTheme(mode);
    document.querySelectorAll('.theme-toggle button').forEach(b=>{
      b.addEventListener('click', ()=> applyTheme(b.dataset.mode));
    });
  }

  // ---------- MOBILE NAV ----------
  function initNav(){
    const toggle = document.getElementById('navToggle');
    const nav = document.getElementById('siteNav');
    if(!toggle || !nav) return;
    function close(){
      nav.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded','false');
      document.body.classList.remove('no-scroll');
    }
    function open(){
      nav.classList.add('open');
      toggle.classList.add('open');
      toggle.setAttribute('aria-expanded','true');
      document.body.classList.add('no-scroll');
    }
    toggle.addEventListener('click', ()=>{
      nav.classList.contains('open') ? close() : open();
    });
    nav.querySelectorAll('a').forEach(a=> a.addEventListener('click', close));
    document.addEventListener('keydown', e=>{ if(e.key === 'Escape') close(); });
  }

  // ---------- ACTIVE NAV LINK ----------
  function markActive(){
    const here = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(a=>{
      const href = a.getAttribute('href').split('#')[0];
      if(href === here) a.classList.add('active');
    });
  }

  // ---------- TOAST ----------
  window.aetToast = function(msg){
    let t = document.getElementById('aetToast');
    if(!t){
      t = document.createElement('div');
      t.id = 'aetToast';
      t.className = 'toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(()=> t.classList.remove('show'), 2200);
  };

  // ---------- COPY TO CLIPBOARD ----------
  window.aetCopy = async function(text, msg){
    try{
      await navigator.clipboard.writeText(text);
      aetToast(msg || 'Copié ✓');
    }catch(e){
      aetToast("Impossible de copier — sélectionne le texte manuellement");
    }
  };

  document.addEventListener('DOMContentLoaded', function(){
    initTheme();
    initNav();
    markActive();
  });
})();
