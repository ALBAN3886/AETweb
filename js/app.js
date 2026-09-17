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
    const closeBtn = document.getElementById('navClose');
    if(!toggle || !nav) return;
    let lastFocused = null;

    function getFocusable(){
      return nav.querySelectorAll('a, button');
    }
    function trapTab(e){
      if(e.key !== 'Tab') return;
      const items = getFocusable();
      if(!items.length) return;
      const first = items[0], last = items[items.length-1];
      if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
      else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
    }
    function close(){
      nav.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded','false');
      document.body.classList.remove('no-scroll');
      document.removeEventListener('keydown', trapTab);
      if(lastFocused){ lastFocused.focus(); lastFocused = null; }
    }
    function open(){
      lastFocused = document.activeElement;
      nav.classList.add('open');
      toggle.classList.add('open');
      toggle.setAttribute('aria-expanded','true');
      document.body.classList.add('no-scroll');
      document.addEventListener('keydown', trapTab);
      const items = getFocusable();
      if(items.length) items[0].focus();
    }
    toggle.addEventListener('click', ()=>{
      nav.classList.contains('open') ? close() : open();
    });
    if(closeBtn) closeBtn.addEventListener('click', close);
    nav.querySelectorAll('a').forEach(a=> a.addEventListener('click', close));
    document.addEventListener('keydown', e=>{ if(e.key === 'Escape' && nav.classList.contains('open')) close(); });
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
