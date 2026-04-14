/**
 * leitner.js — Spaced Repetition Engine (Leitner System)
 *
 *  Box 1 | Review EVERY session          (new / forgotten)
 *  Box 2 | Review every OTHER session    (learning)
 *  Box 3 | Review every THIRD session    (mastered)
 *
 *  Correct answer → advance to next box (max Box 3)
 *  Wrong answer   → drop back to Box 1
 */

const Leitner = (() => {

  /** Return the current box number for a word (default: 1 = new) */
  function getBox(wordId) {
    return State.get().leitnerBoxes[wordId] || 1;
  }

  /** Move a word forward one box after a correct answer */
  function advance(wordId) {
    const boxes = Object.assign({}, State.get().leitnerBoxes);
    boxes[wordId] = Math.min((boxes[wordId] || 1) + 1, 3);
    State.set({ leitnerBoxes: boxes });
  }

  /** Drop a word back to Box 1 after a wrong answer */
  function reset(wordId) {
    const boxes = Object.assign({}, State.get().leitnerBoxes);
    boxes[wordId] = 1;
    State.set({ leitnerBoxes: boxes });
  }

  /**
   * Determine which words are due for review this session.
   * @param {string[]} wordIds  - All word IDs in scope (deck or all)
   * @param {number}   sessionCount - Total sessions completed (0-based counter)
   * @returns {string[]} Array of word IDs that are due
   */
  function getDueWords(wordIds, sessionCount) {
    return wordIds.filter(id => {
      const box = getBox(id);
      if (box === 1) return true;                    // Every session
      if (box === 2) return sessionCount % 2 === 0;  // Every other session
      if (box === 3) return sessionCount % 3 === 0;  // Every third session
      return false;
    });
  }

  /**
   * Get box counts for a set of word IDs.
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

  return { getBox, advance, reset, getDueWords, getDeckStats, isDeckBossReady, getMasteryPercent };
})();
