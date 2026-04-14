/**
 * flashcards.js — Leitner Flashcard Review Session
 *
 * Flow:
 *  1. Build a queue of words due this session (via Leitner)
 *  2. Show each word on a card (front = German, back = translation)
 *  3. For verbs: ask conjugation via an input instead of flip
 *  4. User marks correct / wrong → Leitner box updates, XP awarded
 *  5. Session summary → check if Boss Fight is unlocked
 */

const Flashcards = (() => {
  // ── Session state ───────────────────────────────────────────────────────────
  let _queue        = [];
  let _index        = 0;
  let _correct      = 0;
  let _wrong        = 0;
  let _deckId       = null;
  let _conjugMode   = false;
  let _selPronoun   = null;
  let _isFlipped    = false;

  const PRONOUNS = ['ich', 'du', 'er', 'sie', 'wir', 'ihr', 'Sie'];

  // ── Public API ──────────────────────────────────────────────────────────────

  /** Start a review session for the given deck ID */
  function start(deckId) {
    _deckId  = deckId;
    _correct = 0;
    _wrong   = 0;
    _index   = 0;

    const deck = AppData.decks.find(d => d.id === deckId);
    if (!deck) return;

    const due = Leitner.getDueWords(deck.wordIds, State.get().sessionCount);
    _queue = due
      .map(id => AppData.vocabulary.find(w => w.id === id))
      .filter(Boolean)
      .sort(() => Math.random() - 0.5);   // shuffle

    Router.navigate('study', { deckId: _deckId });
    _restoreShell();

    if (_queue.length === 0) {
      _renderNoDue();
    } else {
      _renderCard();
    }
  }

  /** Flip non-verb card to show answer */
  function flipCard() {
    if (_isFlipped || _conjugMode) return;
    _isFlipped = true;
    Audio.play('flip');
    document.getElementById('flashcard').classList.add('flipped');
    setTimeout(() => {
      document.getElementById('fc-answer-buttons').style.display = 'flex';
    }, 380);
  }

  /** User clicks ✓ on a translation card */
  function markCorrect() {
    _processResult(true, XP_CONFIG.correctTranslation);
  }

  /** User clicks ✗ on a translation card */
  function markWrong() {
    _processResult(false, 0);
  }

  /** Check a typed conjugation answer */
  function checkConjugation() {
    const input   = document.getElementById('conjugation-input');
    if (!input || input.disabled) return;

    const word    = _queue[_index];
    const answer  = input.value.trim().toLowerCase();
    const correct = (word.conjugations?.[_selPronoun] || '').toLowerCase();
    const isOk    = answer === correct;

    input.disabled = true;
    input.classList.add(isOk ? 'input-correct' : 'input-wrong');

    if (!isOk) {
      const hint = document.getElementById('conj-hint');
      if (hint) hint.innerHTML = `<span class="correct-ans">✓ ${word.conjugations[_selPronoun]}</span>`;
    }

    const xpAmt = word.irregular ? XP_CONFIG.correctIrregularVerb : XP_CONFIG.correctConjugation;
    _processResult(isOk, isOk ? xpAmt : 0, 1200);
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  /** Restore the flashcard shell DOM (header, card, answer buttons) after a summary screen */
  function _restoreShell() {
    const container = document.getElementById('flashcard-container');
    const answerBtns = document.getElementById('fc-answer-buttons');
    const headerBar  = document.getElementById('fc-header-bar');
    const summaryEl  = document.getElementById('fc-summary');
    if (container)  container.style.display  = '';
    if (answerBtns) answerBtns.style.display = 'none';
    if (headerBar)  headerBar.style.display  = '';
    if (summaryEl)  summaryEl.style.display  = 'none';
  }

  function _renderCard() {
    _isFlipped    = false;
    _conjugMode   = false;
    _selPronoun   = null;

    const word    = _queue[_index];
    const total   = _queue.length;

    // Progress bar
    document.getElementById('fc-progress').textContent = `${_index + 1} / ${total}`;
    document.getElementById('fc-progress-bar').style.width = `${(_index / total) * 100}%`;
    document.getElementById('fc-correct').textContent = `✓ ${_correct}`;
    document.getElementById('fc-wrong').textContent   = `✗ ${_wrong}`;

    // Decide mode
    if (word.type === 'verb' && word.conjugations) {
      _conjugMode = true;
      _selPronoun = PRONOUNS[Math.floor(Math.random() * PRONOUNS.length)];
    }

    // Reset card flip
    const card = document.getElementById('flashcard');
    card.classList.remove('flipped');
    card.onclick = _conjugMode ? null : flipCard;

    // Build front
    const front = document.getElementById('card-front');
    front.innerHTML = _buildFront(word);

    // Build back
    const back = document.getElementById('card-back');
    back.innerHTML = _buildBack(word);

    // Hide answer buttons until card is flipped
    document.getElementById('fc-answer-buttons').style.display = 'none';

    // Focus conjugation input
    if (_conjugMode) {
      setTimeout(() => {
        const inp = document.getElementById('conjugation-input');
        if (!inp) return;
        inp.focus();
        inp.onkeydown = e => { if (e.key === 'Enter') checkConjugation(); };
      }, 80);
    }
  }

  function _buildFront(word) {
    const genderTag = word.gender
      ? `<span class="gender-tag g-${word.gender}">${word.gender}</span>`
      : '';
    const typeTag = `<span class="word-type-tag type-${word.type}">${word.type}</span>`;

    let html = `
      <div class="card-tags">${typeTag}${genderTag}</div>
      <div class="card-word">${word.word}</div>
      <button class="tts-btn" onclick="event.stopPropagation(); Audio.speak('${_esc(word.word)}')">🔊</button>
    `;

    if (_conjugMode) {
      html += `
        <div class="conj-prompt">Conjugate <strong>${word.word}</strong> with:</div>
        <div class="conj-row">
          <span class="pronoun-badge">${_selPronoun}</span>
          <input id="conjugation-input" class="conj-input" type="text"
                 placeholder="type answer…" autocomplete="off" spellcheck="false">
        </div>
        <div id="conj-hint"></div>
        <button class="neon-btn mt-sm" onclick="Flashcards.checkConjugation()">✓ Check</button>
      `;
    } else {
      html += `<p class="flip-hint">tap card to reveal ↩</p>`;
    }

    return html;
  }

  function _buildBack(word) {
    let html = `
      <div class="card-translation">${word.translation}</div>
      <button class="tts-btn" onclick="event.stopPropagation(); Audio.speak('${_esc(word.word)}')">🔊</button>
    `;
    if (word.example) {
      html += `<div class="card-example">"${word.example}"</div>`;
    }
    if (word.type === 'verb' && word.conjugations) {
      html += _buildConjTable(word.conjugations);
    }
    return html;
  }

  function _buildConjTable(conj) {
    const rows = Object.entries(conj)
      .map(([pr, form]) => `<tr><td class="ct-pronoun">${pr}</td><td class="ct-form">${form}</td></tr>`)
      .join('');
    return `<table class="conj-table"><tbody>${rows}</tbody></table>`;
  }

  function _processResult(isCorrect, xpAmt, delay = 900) {
    const word = _queue[_index];

    if (isCorrect) {
      _correct++;
      Audio.play('correct');
      Leitner.advance(word.id);
      if (xpAmt > 0) {
        XP.addXP(xpAmt);
        XP.showXPToast(`+${xpAmt} XP`);
        App.updateHeader();
      }
    } else {
      _wrong++;
      Audio.play('wrong');
      Leitner.reset(word.id);
    }

    // Show non-verb answer buttons after marking
    if (!_conjugMode && isCorrect) {
      document.getElementById('fc-answer-buttons').style.display = 'none';
    }

    setTimeout(() => {
      _index++;
      if (_index >= _queue.length) _endSession();
      else _renderCard();
    }, delay);
  }

  function _endSession() {
    // Increment session counter & check streak
    State.set({ sessionCount: State.get().sessionCount + 1 });
    XP.checkAndUpdateStreak(_correct + _wrong);
    App.updateHeader();

    const deck      = AppData.decks.find(d => d.id === _deckId);
    const bossReady = deck && Leitner.isDeckBossReady(deck.wordIds);
    const total     = _correct + _wrong;
    const pct       = total > 0 ? Math.round((_correct / total) * 100) : 0;

    // Hide the flashcard UI and show summary inside the container slot
    const container = document.getElementById('flashcard-container');
    const answerBtns = document.getElementById('fc-answer-buttons');
    const headerBar  = document.getElementById('fc-header-bar');
    if (container)  container.style.display  = 'none';
    if (answerBtns) answerBtns.style.display = 'none';
    if (headerBar)  headerBar.style.display  = 'none';

    // Inject summary into flashcard-view (without wiping the whole view)
    let summaryEl = document.getElementById('fc-summary');
    if (!summaryEl) {
      summaryEl = document.createElement('div');
      summaryEl.id = 'fc-summary';
      document.getElementById('flashcard-view').appendChild(summaryEl);
    }

    summaryEl.innerHTML = `
      <div class="session-summary">
        <div class="ss-emoji">${pct >= 70 ? '🌟' : pct >= 40 ? '💪' : '📚'}</div>
        <h2 class="ss-title">Session Complete!</h2>
        <div class="ss-score-ring">
          <svg viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="8"/>
            <circle cx="50" cy="50" r="42" fill="none"
              stroke="${pct >= 70 ? '#00ff88' : pct >= 40 ? '#ffe600' : '#ff2d78'}"
              stroke-width="8" stroke-linecap="round"
              stroke-dasharray="${2.64 * pct} 264"
              transform="rotate(-90 50 50)"/>
          </svg>
          <span class="ss-pct">${pct}%</span>
        </div>
        <div class="ss-stats">
          <span class="ss-stat correct-c">✓ ${_correct}</span>
          <span class="ss-stat wrong-c">✗ ${_wrong}</span>
        </div>
        ${bossReady ? `
          <div class="boss-ready-banner">
            ⚔️ Boss Fight Unlocked! You're ready!
          </div>
          <button class="neon-btn boss-color" onclick="Router.navigate('boss', { deckId: ${_deckId} })">⚔️ Enter Boss Fight</button>
        ` : ''}
        <button class="neon-btn" onclick="Router.navigate('dashboard')">🏠 Dashboard</button>
      </div>
    `;
    summaryEl.style.display = '';
  }

  function _renderNoDue() {
    const container = document.getElementById('flashcard-container');
    const answerBtns = document.getElementById('fc-answer-buttons');
    const headerBar  = document.getElementById('fc-header-bar');
    if (container)  container.style.display  = 'none';
    if (answerBtns) answerBtns.style.display = 'none';
    if (headerBar)  headerBar.style.display  = 'none';

    let summaryEl = document.getElementById('fc-summary');
    if (!summaryEl) {
      summaryEl = document.createElement('div');
      summaryEl.id = 'fc-summary';
      document.getElementById('flashcard-view').appendChild(summaryEl);
    }
    summaryEl.innerHTML = `
      <div class="session-summary">
        <div class="ss-emoji">✨</div>
        <h2 class="ss-title">All Caught Up!</h2>
        <p class="ss-body">No words are due for this deck right now.<br>Come back later or try another deck.</p>
        <button class="neon-btn" onclick="Router.navigate('dashboard')">🏠 Dashboard</button>
      </div>
    `;
    summaryEl.style.display = '';
  }

  /** Escape single-quotes for inline onclick attributes */
  function _esc(str) {
    return (str || '').replace(/'/g, "\\'");
  }

  return { start, flipCard, markCorrect, markWrong, checkConjugation };
})();
