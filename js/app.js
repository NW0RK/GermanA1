/**
 * app.js — Main Application Controller
 *
 * Responsibilities:
 *  - Bootstrap AppData from vocabulary.js + decks.js
 *  - Route between views (dashboard / flashcards / boss / nodes)
 *  - Render the dashboard (deck cards + stats)
 *  - Manage the particle canvas background
 *  - Manage the settings modal
 */

// ── Global AppData ────────────────────────────────────────────────────────────
// Populated from data/vocabulary.js and data/decks.js (loaded before this script)
const AppData = {
  vocabulary: typeof VOCABULARY !== 'undefined' ? VOCABULARY : [],
  decks:      typeof DECKS      !== 'undefined' ? DECKS      : [],
};

// ── App Controller ────────────────────────────────────────────────────────────
const App = (() => {
  const ALL_VIEWS = ['dashboard', 'flashcard', 'boss', 'nodes', 'resources'];

  // ── Bootstrap ──────────────────────────────────────────────────────────────

  function init() {
    Leitner.migrate();
    _syncDeckUnlockState();
    _initParticles();
    updateHeader();

    // Sync audio toggles with saved state
    const state = State.get();
    const aToggle = document.getElementById('audio-toggle');
    const tToggle = document.getElementById('tts-toggle');
    if (aToggle) aToggle.checked = state.audioEnabled;
    if (tToggle) tToggle.checked = state.ttsEnabled;

    // Router drives the initial view from the URL hash
    Router.init();

    console.log('🇩🇪 DeutschQuest loaded — viel Erfolg!');
  }

  // ── View router ────────────────────────────────────────────────────────────

  /**
   * Show the named view and invoke its init logic.
   * @param {string} name   - View name matching *-view element IDs
   * @param {Object} params - Optional params forwarded from the router (e.g. { deckId })
   */
  function setView(name, params = {}) {
    ALL_VIEWS.forEach(v => {
      const el = document.getElementById(`${v}-view`);
      if (el) el.style.display = (v === name) ? '' : 'none';
    });

    if (name === 'dashboard') renderDashboard();
    if (name === 'nodes')     Nodes.init();
    if (name === 'flashcard') Flashcards.start(+params.deckId);
    if (name === 'boss')      Boss.start(+params.deckId);
  }

  // ── Header ─────────────────────────────────────────────────────────────────

  function updateHeader() {
    const state = State.get();

    const levelEl = document.getElementById('header-level');
    const xpEl    = document.getElementById('header-xp');
    const barEl   = document.getElementById('header-xp-fill');
    const streakEl = document.getElementById('header-streak');

    if (levelEl)  levelEl.textContent  = `Lv.${state.level}`;
    if (xpEl)     xpEl.textContent     = `${state.xp} XP`;
    if (barEl)    barEl.style.width    = `${XP.getProgressPercent()}%`;
    if (streakEl) streakEl.textContent = `🔥 ${state.streak.count}`;
  }

  // ── Dashboard ──────────────────────────────────────────────────────────────

  function renderDashboard() {
    _syncDeckUnlockState();
    const state = State.get();

    // Update hero stats bar
    const dbLevel  = document.getElementById('db-level');
    const dbStreak = document.getElementById('db-streak');
    const dailyRev = document.getElementById('daily-reviews');
    if (dbLevel)  dbLevel.textContent  = state.level;
    if (dbStreak) dbStreak.textContent = state.streak.count;
    if (dailyRev) dailyRev.textContent = `${state.reviewsToday} / 5`;

    AppData.decks.forEach(deck => {
      const card = document.getElementById(`deck-card-${deck.id}`);
      if (!card) return;

      const unlocked  = deck._unlocked;
      const stats     = Leitner.getDeckStats(deck.wordIds);
      const bossReady = unlocked && Leitner.isDeckBossReady(deck.wordIds);
      const bossScore = state.bossCompleted[deck.id];
      const mastery   = Leitner.getMasteryPercent(deck.wordIds);

      // Unlock CSS state
      card.classList.toggle('deck-locked',   !unlocked);
      card.classList.toggle('deck-unlocked',  unlocked);
      card.classList.toggle('deck-boss-ready', bossReady);

      // Leitner progress bars
      const barsEl = card.querySelector('.leitner-bars');
      if (barsEl) {
        const total = deck.wordIds.length;
        barsEl.innerHTML = `
          <div class="lb-row" title="Box 1 — Learning (${stats[1]} words)">
            <span class="lb-label">1</span>
            <div class="lb-track"><div class="lb-fill lb-1" style="width:${_pct(stats[1], total)}%"></div></div>
            <span class="lb-count">${stats[1]}</span>
          </div>
          <div class="lb-row" title="Box 2 — Reviewing (${stats[2]} words)">
            <span class="lb-label">2</span>
            <div class="lb-track"><div class="lb-fill lb-2" style="width:${_pct(stats[2], total)}%"></div></div>
            <span class="lb-count">${stats[2]}</span>
          </div>
          <div class="lb-row" title="Box 3 — Mastered (${stats[3]} words)">
            <span class="lb-label">3</span>
            <div class="lb-track"><div class="lb-fill lb-3" style="width:${_pct(stats[3], total)}%"></div></div>
            <span class="lb-count">${stats[3]}</span>
          </div>
        `;
      }

      // Boss score badge
      const scoreEl = card.querySelector('.deck-boss-score');
      if (scoreEl) {
        scoreEl.textContent = bossScore != null ? `Best: ${bossScore}%` : '';
        scoreEl.style.display = bossScore != null ? '' : 'none';
      }

      // Mastery label
      const masteryEl = card.querySelector('.deck-mastery');
      if (masteryEl) masteryEl.textContent = `${mastery}% mastered`;

      // Action button area
      const actionsEl = card.querySelector('.deck-actions');
      if (actionsEl) {
        if (!unlocked) {
          actionsEl.innerHTML = `<div class="lock-msg">🔒 Complete previous boss fight</div>`;
        } else {
          actionsEl.innerHTML = `
            <button class="neon-btn study-btn" style="--bc:${deck.color}"
                    onclick="Audio.play('click'); Router.navigate('study', { deckId: ${deck.id} })">
              📖 Study
            </button>
            ${bossReady ? `
              <button class="neon-btn boss-btn-sm" onclick="Audio.play('bossAlert'); Router.navigate('boss', { deckId: ${deck.id} })">
                ⚔️ Boss
              </button>
            ` : ''}
          `;
        }
      }
    });

    // Today's review count
    const today = State.get();
    const reviewEl = document.getElementById('daily-reviews');
    if (reviewEl) {
      reviewEl.textContent = `${today.reviewsToday} / 5 today`;
    }
  }

  function _pct(count, total) {
    return total > 0 ? Math.round((count / total) * 100) : 0;
  }

  // ── Deck unlock sync ───────────────────────────────────────────────────────

  function _syncDeckUnlockState() {
    const unlocked = State.get().unlockedDecks;
    AppData.decks.forEach(deck => {
      deck._unlocked = deck.unlockedByDefault || unlocked.includes(deck.id);
    });
  }

  // ── Particle background ────────────────────────────────────────────────────

  function _initParticles() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const COLORS = ['#ff2d78', '#00f5ff', '#ffe600', '#a855f7', '#00ff88'];
    const NUM    = 90;

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    const particles = [];

    class Particle {
      reset() {
        this.x     = Math.random() * canvas.width;
        this.y     = Math.random() * canvas.height;
        this.r     = Math.random() * 1.8 + 0.4;
        this.vx    = (Math.random() - 0.5) * 0.35;
        this.vy    = (Math.random() - 0.5) * 0.35;
        this.alpha = Math.random() * 0.45 + 0.08;
        this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      }
      constructor() { this.reset(); }
      update() {
        this.x += this.vx; this.y += this.vy;
        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) this.reset();
      }
      draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle   = this.color;
        ctx.shadowBlur  = 10;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    for (let i = 0; i < NUM; i++) particles.push(new Particle());
    resize();
    window.addEventListener('resize', resize);

    (function tick() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.update(); p.draw(); });
      requestAnimationFrame(tick);
    })();
  }

  return { init, setView, updateHeader, renderDashboard };
})();

// ── Settings modal ────────────────────────────────────────────────────────────

function openSettings() {
  Audio.play('click');
  const modal = document.getElementById('settings-modal');
  if (!modal) return;
  modal.style.display = 'flex';
}

function closeSettings() {
  const modal = document.getElementById('settings-modal');
  if (modal) modal.style.display = 'none';
}

function saveSettings() {
  const audioToggle = document.getElementById('audio-toggle');
  const ttsToggle   = document.getElementById('tts-toggle');

  State.set({
    audioEnabled: audioToggle ? audioToggle.checked     : State.get().audioEnabled,
    ttsEnabled:   ttsToggle   ? ttsToggle.checked       : State.get().ttsEnabled,
  });

  Audio.play('correct');
  closeSettings();
}

function confirmReset() {
  if (confirm('Reset ALL progress? This cannot be undone.')) {
    State.reset();
    location.reload();
  }
}

// ── Boot ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', App.init);
