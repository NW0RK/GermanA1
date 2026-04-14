/**
 * router.js — Hash-Based SPA Router
 *
 * Maps URL hashes to app views, enabling browser Back/Forward navigation
 * while keeping all state (XP, streaks, particles) seamless.
 *
 * Hash format:
 *   #dashboard
 *   #study?deckId=1
 *   #boss?deckId=1
 *   #nodes
 *   #resources
 *
 * Route names intentionally decouple from DOM element IDs:
 *   "study" → element #flashcard-view   (handled by VIEW_MAP below)
 *   all others follow the "${name}-view" convention
 */

const Router = (() => {

  // Maps logical route names → DOM view IDs where they differ from convention
  const VIEW_MAP = {
    study: 'flashcard',   // #study → #flashcard-view
  };

  // Routes that require a deckId param; fall back to dashboard if missing
  const PARAM_ROUTES = new Set(['study', 'boss']);

  // ── Public API ──────────────────────────────────────────────────────────────

  /**
   * Call once on DOMContentLoaded (called from App.init).
   * Handles the initial hash and listens for future changes.
   */
  function init() {
    window.addEventListener('hashchange', _handleRoute);
    _handleRoute();
  }

  /**
   * Programmatic navigation — updates the URL hash, which triggers handleRoute.
   * @param {string} view   - Route name (e.g. 'dashboard', 'study', 'boss')
   * @param {Object} params - Optional query params (e.g. { deckId: 1 })
   */
  function navigate(view, params = {}) {
    const query = new URLSearchParams(params).toString();
    window.location.hash = query ? `${view}?${query}` : view;
  }

  // ── Private ─────────────────────────────────────────────────────────────────

  function _handleRoute() {
    const raw   = window.location.hash.slice(1) || 'dashboard';
    const [view, query] = raw.split('?');
    const params = Object.fromEntries(new URLSearchParams(query || ''));

    // Guard: param-dependent routes with no deckId → redirect to dashboard
    if (PARAM_ROUTES.has(view) && !params.deckId) {
      navigate('dashboard');
      return;
    }

    // Resolve the DOM view ID
    const viewId = VIEW_MAP[view] || view;

    App.setView(viewId, params);
  }

  return { init, navigate };
})();
