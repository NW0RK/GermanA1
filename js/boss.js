/**
 * boss.js — Boss Fight Timed Quiz Engine
 *
 * Triggered after a deck's words are all in Box 2+.
 * 10 questions, 30 seconds each, 80% pass threshold.
 * Mix of translation, conjugation, and gender questions.
 */

const Boss = (() => {
  const TOTAL     = 10;   // questions per fight
  const TIME_EACH = 30;   // seconds per question

  // ── Session state ───────────────────────────────────────────────────────────
  let _deckId  = null;
  let _qs      = [];
  let _qIdx    = 0;
  let _score   = 0;
  let _timer   = null;
  let _timeLeft = 0;
  let _answered = false;

  // ── Public API ──────────────────────────────────────────────────────────────

  /** Launch boss fight for a deck */
  function start(deckId) {
    _deckId = typeof deckId === 'string' ? parseInt(deckId) : deckId;
    const deck = AppData.decks.find(d => d.id === _deckId);
    if (!deck) return;

    _qs    = _buildQuestions(deck);
    _qIdx  = 0;
    _score = 0;

    Router.navigate('boss', { deckId: _deckId });
    _renderIntro(deck);
  }

  /** Called by "Begin Battle!" button */
  function startQuiz() {
    _renderQuestion();
  }

  /** Called by multiple-choice button click */
  function selectChoice(selected, answer, xp) {
    if (_answered) return;
    _answered = true;
    _clearTimer();
    _processAnswer(selected === answer, parseInt(xp));
    // Highlight buttons
    document.querySelectorAll('.mc-btn').forEach(btn => {
      btn.disabled = true;
      const val = btn.dataset.value;
      if (val === answer) btn.classList.add('mc-correct');
      else if (val === selected) btn.classList.add('mc-wrong');
    });
  }

  /** Called by fill-in submit button */
  function submitFill() {
    if (_answered) return;
    _answered = true;
    _clearTimer();

    const input   = document.getElementById('boss-input');
    const q       = _qs[_qIdx];
    if (!input) return;

    const val   = input.value.trim().toLowerCase();
    const isOk  = val === q.answer.toLowerCase();
    input.disabled = true;
    input.classList.add(isOk ? 'input-correct' : 'input-wrong');

    if (!isOk) {
      const hint = document.getElementById('boss-hint');
      if (hint) hint.innerHTML = `<span class="correct-ans">✓ ${q.answer}</span>`;
    }

    _processAnswer(isOk, q.xp);
  }

  // ── Private ─────────────────────────────────────────────────────────────────

  function _buildQuestions(deck) {
    const deckWords = deck.wordIds
      .map(id => AppData.vocabulary.find(w => w.id === id))
      .filter(Boolean);

    // Build a weighted pool of question functions
    const weighted = [];
    const weights  = deck.bossQuestionWeights || { translation: 3, conjugation: 2, gender: 1 };

    deckWords.forEach(w => {
      for (let i = 0; i < (weights.translation || 0); i++)
        weighted.push(() => _qTranslation(w, deckWords));
      if (w.type === 'verb' && w.conjugations)
        for (let i = 0; i < (weights.conjugation || 0); i++)
          weighted.push(() => _qConjugation(w));
      if (w.type === 'noun' && w.gender)
        for (let i = 0; i < (weights.gender || 0); i++)
          weighted.push(() => _qGender(w, deckWords));
    });

    // Shuffle and pick TOTAL questions
    const shuffled = weighted.sort(() => Math.random() - 0.5);
    const qs = [];
    for (let i = 0; i < TOTAL; i++) {
      const fn = shuffled[i % shuffled.length];
      qs.push(fn());
    }
    return qs;
  }

  function _qTranslation(word, allWords) {
    // "What is German for X?" — multiple choice
    const distractors = allWords
      .filter(w => w.id !== word.id && w.type === word.type)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(w => w.word);
    const choices = [word.word, ...distractors].sort(() => Math.random() - 0.5);
    return {
      type:     'mc',
      question: `What is the German word for: <em>${word.translation}</em>?`,
      choices,
      answer:   word.word,
      xp:       XP_CONFIG.correctTranslation,
    };
  }

  function _qConjugation(word) {
    const pronouns = ['ich', 'du', 'er', 'sie', 'wir', 'ihr', 'Sie'];
    const pronoun  = pronouns[Math.floor(Math.random() * pronouns.length)];
    const answer   = word.conjugations[pronoun] || word.word;
    return {
      type:     'fill',
      question: `Conjugate <strong>${word.word}</strong> (${word.translation}) with: <em>${pronoun}</em>`,
      pronoun,
      answer,
      xp:       word.irregular ? XP_CONFIG.correctIrregularVerb : XP_CONFIG.correctConjugation,
    };
  }

  function _qGender(word, allWords) {
    return {
      type:     'mc',
      question: `What is the definite article for: <strong>${word.word}</strong> (${word.translation})?`,
      choices:  ['der', 'die', 'das'],
      answer:   word.gender,
      xp:       XP_CONFIG.correctTranslation,
    };
  }

  // ── Rendering ───────────────────────────────────────────────────────────────

  function _renderIntro(deck) {
    document.getElementById('boss-view').innerHTML = `
      <div class="boss-intro">
        <div class="boss-glow-ring"></div>
        <div class="boss-emoji">${deck.bossEmoji}</div>
        <h1 class="boss-name">${deck.bossTheme}</h1>
        <p class="boss-subtitle">Deck ${deck.id} Final Challenge</p>
        <div class="boss-rules glass-card">
          <div class="rule-row">⏱️ <span>${TIME_EACH}s per question</span></div>
          <div class="rule-row">❓ <span>${TOTAL} questions</span></div>
          <div class="rule-row">🎯 <span>Score 80%+ to unlock next deck</span></div>
          <div class="rule-row">⚡ <span>${deck.grammarTopics.slice(0,2).join(' · ')}</span></div>
        </div>
        <button class="neon-btn boss-color" onclick="Boss.startQuiz()">⚔️ Begin Battle!</button>
        <button class="ghost-btn" onclick="Router.navigate('dashboard')">← Retreat</button>
      </div>
    `;
    Audio.play('bossAlert');
  }

  function _renderQuestion() {
    _answered = false;
    const q = _qs[_qIdx];

    document.getElementById('boss-view').innerHTML = `
      <div class="boss-quiz">
        <div class="bq-top">
          <span class="bq-counter">Q ${_qIdx + 1} / ${TOTAL}</span>
          <span class="bq-score">Score: ${_score} / ${_qIdx}</span>
          <div class="bq-timer-wrap">
            <div class="bq-timer" id="bq-timer">${TIME_EACH}</div>
            <div class="bq-timer-track"><div class="bq-timer-bar" id="bq-timer-bar"></div></div>
          </div>
        </div>

        <div class="bq-progress-track">
          <div class="bq-progress-fill" style="width:${(_qIdx / TOTAL) * 100}%"></div>
        </div>

        <div class="bq-card glass-card">
          <div class="bq-question">${q.question}</div>
          ${q.type === 'mc' ? _renderMC(q) : _renderFill(q)}
        </div>

        <div class="bq-feedback" id="bq-feedback"></div>
      </div>
    `;

    if (q.type === 'fill') {
      setTimeout(() => {
        const inp = document.getElementById('boss-input');
        if (inp) {
          inp.focus();
          inp.onkeydown = e => { if (e.key === 'Enter') Boss.submitFill(); };
        }
      }, 80);
    }

    _startTimer();
  }

  function _renderMC(q) {
    return `
      <div class="mc-grid">
        ${q.choices.map(c => `
          <button class="mc-btn neon-btn-outline"
                  data-value="${_esc(c)}"
                  onclick="Boss.selectChoice('${_esc(c)}','${_esc(q.answer)}',${q.xp})">
            ${c}
          </button>
        `).join('')}
      </div>
    `;
  }

  function _renderFill(q) {
    return `
      <div class="fill-wrap">
        <span class="pronoun-badge fill-pronoun">${q.pronoun}</span>
        <input id="boss-input" class="boss-fill-input" type="text"
               placeholder="type conjugation…" autocomplete="off" spellcheck="false">
        <button class="neon-btn" onclick="Boss.submitFill()">✓ Submit</button>
      </div>
      <div id="boss-hint"></div>
    `;
  }

  function _startTimer() {
    _timeLeft = TIME_EACH;
    _clearTimer();

    _timer = setInterval(() => {
      _timeLeft--;
      const el  = document.getElementById('bq-timer');
      const bar = document.getElementById('bq-timer-bar');
      if (el)  el.textContent = _timeLeft;
      if (bar) bar.style.width = `${(_timeLeft / TIME_EACH) * 100}%`;

      if (_timeLeft <= 8) {
        Audio.play('tick');
        if (el) el.classList.add('timer-urgent');
      }

      if (_timeLeft <= 0) {
        _clearTimer();
        if (!_answered) _timeout();
      }
    }, 1000);
  }

  function _clearTimer() {
    if (_timer) { clearInterval(_timer); _timer = null; }
  }

  function _timeout() {
    _answered = true;
    const q = _qs[_qIdx];
    const fb = document.getElementById('bq-feedback');
    if (fb) fb.innerHTML = `<div class="fb-wrong">⏱️ Time's up! Answer: <strong>${q.answer}</strong></div>`;
    document.querySelectorAll('.mc-btn, #boss-input').forEach(el => el.disabled = true);
    _processAnswer(false, 0);
  }

  function _processAnswer(isOk, xp) {
    if (isOk) {
      _score++;
      Audio.play('correct');
      XP.addXP(xp);
      App.updateHeader();
      const fb = document.getElementById('bq-feedback');
      if (fb) fb.innerHTML = `<div class="fb-correct">✓ Correct! +${xp} XP</div>`;
    } else {
      Audio.play('wrong');
    }

    setTimeout(() => {
      _qIdx++;
      if (_qIdx >= TOTAL) _endBoss();
      else _renderQuestion();
    }, 1600);
  }

  function _endBoss() {
    const pct    = Math.round((_score / TOTAL) * 100);
    const passed = pct >= 80;
    const deck   = AppData.decks.find(d => d.id === _deckId);

    // Save high score
    const prev     = State.get().bossCompleted;
    const best     = Math.max(pct, prev[_deckId] || 0);
    State.set({ bossCompleted: Object.assign({}, prev, { [_deckId]: best }) });

    if (passed) {
      Audio.play('bossVictory');
      // Unlock next deck
      const nextId = _deckId + 1;
      if (AppData.decks.find(d => d.id === nextId)) {
        const unlocked = [...new Set([...State.get().unlockedDecks, nextId])];
        State.set({ unlockedDecks: unlocked });
      }
      XP.addXP(XP_CONFIG.bossCompletion);
      App.updateHeader();
    } else {
      Audio.play('bossDefeat');
    }

    document.getElementById('boss-view').innerHTML = `
      <div class="boss-result ${passed ? 'result-victory' : 'result-defeat'}">
        <div class="result-aura ${passed ? 'aura-gold' : 'aura-red'}"></div>
        <div class="result-emoji">${passed ? '🏆' : '💀'}</div>
        <h1 class="result-title">${passed ? 'VICTORY!' : 'DEFEATED!'}</h1>
        <div class="result-pct">${pct}%</div>
        <div class="result-detail">${_score} / ${TOTAL} correct</div>
        ${passed
          ? `<div class="result-msg success-msg">🔓 Next deck unlocked! +${XP_CONFIG.bossCompletion} XP</div>`
          : `<div class="result-msg fail-msg">Need 80% to pass. Keep practicing!</div>`}
        <div class="result-actions">
          <button class="neon-btn ${passed ? 'boss-color' : ''}" onclick="Router.navigate('boss', { deckId: ${_deckId} })">
            ⚔️ ${passed ? 'Fight Again' : 'Retry'}
          </button>
          <button class="ghost-btn" onclick="Router.navigate('dashboard')">🏠 Dashboard</button>
        </div>
      </div>
    `;
  }

  function _esc(str) {
    return String(str || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
  }

  return { start, startQuiz, selectChoice, submitFill };
})();
