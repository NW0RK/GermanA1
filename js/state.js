/**
 * state.js — Persistence Layer
 * All game state is stored in localStorage.
 * Access via State.get() / State.set() / State.reset()
 */

const STATE_KEY = 'deutschquest_v1';

const DEFAULT_STATE = {
  version: 1,

  // Progression
  xp: 0,
  level: 1,

  // Streaks
  streak: { count: 0, lastDate: null },
  reviewsToday: 0,
  lastReviewDate: null,

  // Leitner boxes: { wordId: 1 | 2 | 3 }
  leitnerBoxes: {},

  // Session tracking (used for Leitner scheduling)
  sessionCount: 0,

  // Unlocked deck IDs
  unlockedDecks: [1],

  // Boss fight high scores: { deckId: percentScore }
  bossCompleted: {},

  // Settings
  audioEnabled: true,
  ttsEnabled: true,
};

const State = (() => {
  let _cache = null;

  /** Load state from localStorage (or use defaults) */
  function _load() {
    try {
      const raw = localStorage.getItem(STATE_KEY);
      if (raw) {
        // Merge with defaults so new fields always exist
        _cache = Object.assign({}, DEFAULT_STATE, JSON.parse(raw));
      } else {
        _cache = Object.assign({}, DEFAULT_STATE);
      }
    } catch (e) {
      console.warn('[State] Load error, resetting to defaults:', e);
      _cache = Object.assign({}, DEFAULT_STATE);
    }
  }

  /** Persist current state to localStorage */
  function _save() {
    try {
      localStorage.setItem(STATE_KEY, JSON.stringify(_cache));
    } catch (e) {
      console.error('[State] Save error:', e);
    }
  }

  /** Get the full state object (read-only — use set() to mutate) */
  function get() {
    if (!_cache) _load();
    return _cache;
  }

  /** Merge updates into state and save */
  function set(updates) {
    if (!_cache) _load();
    _cache = Object.assign({}, _cache, updates);
    _save();
  }

  /** Wipe all progress and start fresh */
  function reset() {
    _cache = Object.assign({}, DEFAULT_STATE);
    _save();
  }

  /** Utility: return today's date as 'YYYY-MM-DD' */
  function getToday() {
    return new Date().toISOString().slice(0, 10);
  }

  return { get, set, reset, getToday };
})();
