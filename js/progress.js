/* ==========================================================================
   AET — PROGRESS.JS
   Progression stockée en local (localStorage) pour l'instant.
   -> Point d'intégration Firebase prévu : voir AET_PROGRESS.sync() plus bas,
      actuellement un no-op. Quand Firebase sera connecté, remplacer sync()
      par un vrai appel (Firestore) sans changer le reste du code appelant.
   ========================================================================== */

const AET_PROGRESS = (function(){
  const KEY = 'aet_progress';       // {1:'inprogress', 2:'done', ...}
  const LEGACY_KEY = 'aet_ia_progress'; // ancien format booléen, migré une fois

  function _load(){
    let data = {};
    try{ data = JSON.parse(localStorage.getItem(KEY) || '{}'); }catch(e){ data = {}; }
    // migration depuis l'ancien tracker (cases à cocher booléennes)
    if(Object.keys(data).length === 0){
      try{
        const legacy = JSON.parse(localStorage.getItem(LEGACY_KEY) || '{}');
        Object.entries(legacy).forEach(([k,v])=>{ if(v) data[k]='done'; });
        if(Object.keys(data).length) _save(data);
      }catch(e){}
    }
    return data;
  }
  function _save(data){
    try{ localStorage.setItem(KEY, JSON.stringify(data)); }catch(e){}
    // TODO Firebase : pousser `data` vers Firestore ici quand configuré.
    sync(data);
  }
  function sync(data){ /* no-op tant que Firebase n'est pas branché */ }

  function statusOf(n){
    const data = _load();
    if(data[n] === 'done') return 'done';
    if(data[n] === 'inprogress') return 'inprogress';
    if(n === 1) return 'todo';
    return data[n-1] === 'done' ? 'todo' : 'locked';
  }
  function markInProgress(n){
    const data = _load();
    if(data[n] !== 'done') data[n] = 'inprogress';
    _save(data);
  }
  function markDone(n){
    const data = _load();
    data[n] = 'done';
    _save(data);
  }
  function reset(){
    try{ localStorage.removeItem(KEY); localStorage.removeItem(LEGACY_KEY); }catch(e){}
  }
  function stats(){
    const total = AET_MODULES.length;
    let done = 0, current = null;
    AET_MODULES.forEach(m=>{
      const s = statusOf(m.n);
      if(s === 'done') done++;
      if(!current && (s === 'todo' || s === 'inprogress')) current = m;
    });
    const percent = Math.round(done/total*100);
    return {
      done, total, percent,
      current: current || null,
      currentNiveau: current ? current.niv : (done===total ? 4 : 1),
    };
  }
  function quizResult(n, score, totalQ){
    let data = {};
    try{ data = JSON.parse(localStorage.getItem('aet_quiz_results') || '{}'); }catch(e){}
    data[n] = {score, total: totalQ, date: new Date().toISOString()};
    try{ localStorage.setItem('aet_quiz_results', JSON.stringify(data)); }catch(e){}
  }
  function quizResults(){
    try{ return JSON.parse(localStorage.getItem('aet_quiz_results') || '{}'); }catch(e){ return {}; }
  }

  return {statusOf, markInProgress, markDone, reset, stats, quizResult, quizResults};
})();
