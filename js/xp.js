/**
 * xp.js — XP, Leveling & Streak System
 *
 * XP is awarded for correct answers. Streaks extend when
 * DAILY_GOAL reviews are completed in a calendar day.
 */

// ─── Point values (edit freely) ──────────────────────────────────────────────
const XP_CONFIG = {
  correctTranslation:   10,   // Correct translation on a flashcard
  correctConjugation:   20,   // Correct regular verb conjugation
  correctIrregularVerb: 50,   // Correct irregular verb conjugation
  bossQuestionCorrect:  15,   // Correct boss fight question
  bossCompletion:       100,  // Passing the boss fight (80%+)
  streakBonus:           25,  // Bonus for extending daily streak
};

// ─── Level thresholds (XP required to reach each level) ──────────────────────
const LEVEL_THRESHOLDS = [0, 100, 250, 500, 900, 1400, 2100, 3000, 4200, 6000];
const DAILY_GOAL       = 5; // reviews per day to maintain streak

// ─────────────────────────────────────────────────────────────────────────────

const XP = (() => {

  /** Compute level from raw XP amount */
  function getLevelForXp(xp) {
    let level = 1;
    for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
      if (xp >= LEVEL_THRESHOLDS[i]) level = i + 1;
      else break;
    }
    return level;
  }

  /** XP required to START next level (upper threshold for current level) */
  function getXpForNextLevel(level) {
    return LEVEL_THRESHOLDS[level] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  }

  /** XP at the START of current level (lower threshold) */
  function getXpForCurrentLevel(level) {
    return LEVEL_THRESHOLDS[level - 1] ?? 0;
  }

  /** Progress percentage within the current level (0–100) */
  function getProgressPercent() {
    const { xp, level } = State.get();
    const low  = getXpForCurrentLevel(level);
    const high = getXpForNextLevel(level);
    if (high <= low) return 100;
    return Math.min(100, Math.round(((xp - low) / (high - low)) * 100));
  }

  /**
   * Award XP and recalculate level.
   * @param {number} amount
   * @returns {{ newXp, newLevel, leveledUp, amount }}
   */
  function addXP(amount) {
    const state   = State.get();
    const newXp   = state.xp + amount;
    const newLevel = getLevelForXp(newXp);
    const leveledUp = newLevel > state.level;

    State.set({ xp: newXp, level: newLevel });

    if (leveledUp) {
      // Trigger level-up sound (Audio module loaded after this one)
      setTimeout(() => { if (typeof Audio !== 'undefined') Audio.play('levelup'); }, 50);
      showLevelUpBanner(newLevel);
    }

    return { newXp, newLevel, leveledUp, amount };
  }

  /**
   * Record reviews done and update streak.
   * @param {number} reviewsDone - How many reviews were completed this session
   * @returns {{ streakCount, reviewsToday }}
   */
  function checkAndUpdateStreak(reviewsDone) {
    const state   = State.get();
    const today   = State.getToday();

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    let { count, lastDate } = state.streak;
    let reviewsToday   = state.reviewsToday;
    let lastReviewDate = state.lastReviewDate;

    // Reset daily count if it's a new day
    if (lastReviewDate !== today) {
      reviewsToday   = 0;
      lastReviewDate = today;
    }
    reviewsToday += reviewsDone;

    // Streak logic
    if (lastDate !== today && reviewsToday >= DAILY_GOAL) {
      if (lastDate === yesterdayStr || lastDate === null) {
        // Extend streak
        count  += 1;
        addXP(XP_CONFIG.streakBonus);
        showXPToast(`🔥 Streak +1! +${XP_CONFIG.streakBonus} XP`);
      } else if (lastDate !== yesterdayStr) {
        // Streak broken, restart
        count = 1;
      }
      lastDate = today;
    }

    State.set({
      streak:         { count, lastDate },
      reviewsToday,
      lastReviewDate
    });

    return { streakCount: count, reviewsToday };
  }

  // ── Toast helpers (used here & re-used by other modules) ───────────────────

  function showXPToast(msg, color = '#ffd700') {
    const toast = document.createElement('div');
    toast.className = 'xp-toast';
    toast.textContent = msg;
    toast.style.borderColor = color;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, 2000);
  }

  function showLevelUpBanner(level) {
    const banner = document.createElement('div');
    banner.className = 'level-up-banner';
    banner.innerHTML = `<span class="lu-icon">⬆️</span><span>Level Up! Now Level <strong>${level}</strong></span>`;
    document.body.appendChild(banner);
    requestAnimationFrame(() => banner.classList.add('show'));
    setTimeout(() => {
      banner.classList.remove('show');
      setTimeout(() => banner.remove(), 600);
    }, 2800);
  }

  return {
    addXP,
    checkAndUpdateStreak,
    getLevelForXp,
    getProgressPercent,
    getXpForNextLevel,
    getXpForCurrentLevel,
    showXPToast,
    XP_CONFIG,
  };
})();
