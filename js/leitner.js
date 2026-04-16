/**
 * leitner.js — Spaced Repetition Engine (Leitner System)
 *
 *  Box 1 | Review EVERY session          (new / forgotten)
 *  Box 2 | Review when nextReview ≤ today  (1 day interval)
 *  Box 3 | Review when nextReview ≤ today  (3 day interval)
 *
 *  Correct answer → advance to next box + schedule next review
 *  Wrong answer   → drop back to Box 1
 */

const Leitner = (() => {

  /** Return the current box number for a word (default: 1 = new) */
  function getBox(wordId) {
    return State.get().leitnerBoxes[wordId]?.box || 1;
  }

  /** Move a word forward one box after a correct answer */
  function advance(wordId) {
    const boxes = { ...State.get().leitnerBoxes };
    const today = State.getToday();
    const current = boxes[wordId]?.box || 1;
    const nextBox = Math.min(current + 1, 3);
    boxes[wordId] = { box: nextBox, nextReview: today };
    State.set({ leitnerBoxes: boxes });
  }

  /** Drop a word back to Box 1 after a wrong answer */
  function reset(wordId) {
    const boxes = { ...State.get().leitnerBoxes };
    boxes[wordId] = { box: 1, nextReview: State.getToday() };
    State.set({ leitnerBoxes: boxes });
  }

  /**
   * Schedule the next review date for a word based on its current box.
   * Call after advance() or reset() to set when the word becomes due next.
   * @param {string} wordId
   */
  function scheduleNextReview(wordId) {
    const boxes = { ...State.get().leitnerBoxes };
    const data = boxes[wordId] || { box: 1 };
    const next = new Date();

    if (data.box === 1) next.setDate(next.getDate() + 1);
    else if (data.box === 2) next.setDate(next.getDate() + 1);
    else next.setDate(next.getDate() + 3);

    boxes[wordId] = { ...data, nextReview: next.toISOString().slice(0, 10) };
    State.set({ leitnerBoxes: boxes });
  }

  /**
   * Determine which words are due for review today.
   * @param {string[]} wordIds - All word IDs in scope (deck or all)
   * @returns {string[]} Array of word IDs that are due
   */
  function getDueWords(wordIds) {
    const today = State.getToday();
    return wordIds.filter(id => {
      const data = State.get().leitnerBoxes[id];
      if (!data) return true;
      if (data.box === 1) return true;
      return data.nextReview <= today;
    });
  }

  /**
   * Get box counts for a set of word IDs.
   * @param {string[]} wordIds
   * @returns {{ 1: number, 2: number, 3: number }}
   */
  function getDeckStats(wordIds) {
    const counts = { 1: 0, 2: 0, 3: 0 };
    wordIds.forEach(id => {
      const box = getBox(id);
      counts[box] = (counts[box] || 0) + 1;
    });
    return counts;
  }

  /**
   * Returns true when ALL words in a deck are in Box 2 or higher.
   * This triggers the Boss Fight unlock banner on the dashboard.
   */
  function isDeckBossReady(wordIds) {
    if (!wordIds || wordIds.length === 0) return false;
    return wordIds.every(id => getBox(id) >= 2);
  }

  /** Percentage of words mastered (Box 3) in a deck */
  function getMasteryPercent(wordIds) {
    if (!wordIds || wordIds.length === 0) return 0;
    const mastered = wordIds.filter(id => getBox(id) === 3).length;
    return Math.round((mastered / wordIds.length) * 100);
  }

  /**
   * Migrate from v1 data structure (box numbers) to v2 (nested objects).
   * Converts { wordId: 1|2|3 } → { wordId: { box: 1|2|3, nextReview: today } }
   * Safe to call multiple times — only runs if version < 2.
   */
  function migrate() {
    if (State.get().version >= 2) return;
    const today = State.getToday();
    const migrated = {};
    Object.entries(State.get().leitnerBoxes).forEach(([id, box]) => {
      migrated[id] = {
        box: typeof box === 'object' ? box.box : box,
        nextReview: today,
      };
    });
    State.set({ leitnerBoxes: migrated, version: 2 });
  }

  return {
    getBox,
    advance,
    reset,
    scheduleNextReview,
    getDueWords,
    getDeckStats,
    isDeckBossReady,
    getMasteryPercent,
    migrate,
  };
})();
