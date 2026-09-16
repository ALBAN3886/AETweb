/* ==========================================================================
   AET — QUIZ.JS
   Questions générées automatiquement à partir du contenu des modules
   (objectif / points à retenir / prompt). Seedé par numéro de module :
   les questions restent stables pour un même module, mais varient selon
   l'ordre d'options (mélange déterministe).
   ========================================================================== */

function _aetSeededRandom(seed){
  let s = seed % 2147483647; if (s <= 0) s += 2147483646;
  return function(){ s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}
function _aetShuffle(arr, rnd){
  const a = arr.slice();
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(rnd()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}
function _aetTrunc(s, n){ return s.length>n ? s.slice(0,n-1)+'…' : s; }

function generateQuiz(moduleNum){
  const mod = AET_MODULES.find(m=>m.n===moduleNum);
  if(!mod) return [];
  const rnd = _aetSeededRandom(1000 + moduleNum);
  const others = AET_MODULES.filter(m=>m.n!==moduleNum);
  const questions = [];

  // Q1 — objectif
  const distractorsObj = _aetShuffle(others, rnd).slice(0,3).map(m=>_aetTrunc(m.objectif,90));
  questions.push({
    q: `Quel est l'objectif du module « ${mod.titre} » ?`,
    options: _aetShuffle([_aetTrunc(mod.objectif,90), ...distractorsObj], rnd),
    correct: _aetTrunc(mod.objectif,90),
    explication: mod.objectif,
  });

  // Q2-Q4 — points à retenir (jusqu'à 3 questions)
  const retenirPool = others.flatMap(m=>m.retenir);
  const nbRetenirQ = Math.min(3, mod.retenir.length);
  const seenRetenir = _aetShuffle(mod.retenir, rnd).slice(0, nbRetenirQ);
  seenRetenir.forEach(correct=>{
    const distractors = _aetShuffle(retenirPool.filter(r=>!mod.retenir.includes(r)), rnd).slice(0,3);
    questions.push({
      q: `Lequel de ces éléments fait partie des points à retenir du module « ${mod.titre} » ?`,
      options: _aetShuffle([correct, ...distractors], rnd),
      correct,
      explication: `« ${correct} » est un point clé du module ${mod.n} — ${mod.titre}.`,
    });
  });

  // Q5 — prompt de pratique
  const distractorsPrompt = _aetShuffle(others, rnd).slice(0,3).map(m=>_aetTrunc(m.prompt,70));
  questions.push({
    q: `Quel prompt de pratique correspond au module « ${mod.titre} » ?`,
    options: _aetShuffle([_aetTrunc(mod.prompt,70), ...distractorsPrompt], rnd),
    correct: _aetTrunc(mod.prompt,70),
    explication: mod.prompt,
  });

  return questions;
}

/* ---------- MOTEUR D'AFFICHAGE ---------- */
function renderQuiz(container, moduleNum, onFinish){
  const questions = generateQuiz(moduleNum);
  let idx = 0, score = 0, locked = false;

  function draw(){
    if(idx >= questions.length){ return drawResult(); }
    const q = questions[idx];
    container.innerHTML = `
      <div class="quiz-progress">QUESTION ${idx+1} / ${questions.length}</div>
      <h3 class="quiz-q">${q.q}</h3>
      <div class="quiz-opts">
        ${q.options.map((opt,i)=>`<button class="quiz-opt" data-i="${i}">${opt}</button>`).join('')}
      </div>
      <div class="quiz-feedback" id="quizFeedback"></div>
      <div class="quiz-actions"><button class="btn btn-blue" id="quizValidate" disabled>Valider</button></div>
    `;
    locked = false;
    let picked = null;
    const opts = container.querySelectorAll('.quiz-opt');
    const validateBtn = container.querySelector('#quizValidate');
    opts.forEach(btn=>{
      btn.addEventListener('click', ()=>{
        if(locked) return;
        opts.forEach(o=>o.classList.remove('picked'));
        btn.classList.add('picked');
        picked = btn.dataset.i;
        validateBtn.disabled = false;
      });
    });
    validateBtn.addEventListener('click', ()=>{
      if(locked || picked===null) return;
      locked = true;
      const chosen = q.options[picked];
      const ok = chosen === q.correct;
      if(ok) score++;
      opts.forEach(o=>{
        if(o.textContent === q.correct) o.classList.add('correct');
        else if(o.dataset.i === picked) o.classList.add('wrong');
      });
      const fb = container.querySelector('#quizFeedback');
      fb.innerHTML = `<div class="quiz-result ${ok?'ok':'ko'}">${ok?'✓ Bonne réponse':'✕ Réponse incorrecte'}</div><p class="quiz-explain">${q.explication}</p>`;
      validateBtn.textContent = idx === questions.length-1 ? 'Voir le score' : 'Question suivante';
      validateBtn.onclick = ()=>{ idx++; draw(); };
    });
  }

  function drawResult(){
    const pct = Math.round(score/questions.length*100);
    if(typeof AET_PROGRESS !== 'undefined') AET_PROGRESS.quizResult(moduleNum, score, questions.length);
    container.innerHTML = `
      <div class="quiz-score">
        <div class="quiz-score-n">${score} / ${questions.length}</div>
        <div class="quiz-score-p">${pct}%</div>
      </div>
      <div class="quiz-actions">
        <button class="btn btn-line" id="quizRedo">Refaire le quiz</button>
        <button class="btn btn-gold" id="quizContinue">Continuer</button>
      </div>
    `;
    container.querySelector('#quizRedo').addEventListener('click', ()=>{ idx=0; score=0; draw(); });
    container.querySelector('#quizContinue').addEventListener('click', ()=>{ if(onFinish) onFinish(score, questions.length); });
  }

  draw();
}
