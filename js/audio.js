/**
 * audio.js — Sound Effects & Text-to-Speech
 *
 * Sounds are generated with the Web Audio API (no audio files needed).
 * German pronunciation uses the browser SpeechSynthesis API.
 *
 * Toggle via State: audioEnabled / ttsEnabled
 */

const Audio = (() => {
  let _ctx = null;

  function _getCtx() {
    if (!_ctx) {
      _ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    // Resume if suspended (browsers suspend context until user gesture)
    if (_ctx.state === 'suspended') _ctx.resume();
    return _ctx;
  }

  /**
   * Generate a synthesized beep.
   * @param {number} freq      - Frequency in Hz
   * @param {number} dur       - Duration in seconds
   * @param {string} type      - OscillatorType (sine/square/sawtooth/triangle)
   * @param {number} vol       - Peak gain (0–1)
   * @param {number} [startMs=0] - Delay in ms before playing
   */
  function _beep(freq, dur, type = 'sine', vol = 0.25, startMs = 0) {
    if (!State.get().audioEnabled) return;
    try {
      const ctx  = _getCtx();
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      const t = ctx.currentTime + startMs / 1000;
      gain.gain.setValueAtTime(vol, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

      osc.start(t);
      osc.stop(t + dur + 0.05);
    } catch (e) {
      // Audio not critical — fail silently
    }
  }

  // ─── Sound recipes ──────────────────────────────────────────────────────────
  const _sounds = {
    correct: () => {
      _beep(523, 0.09, 'sine', 0.25,   0);
      _beep(659, 0.09, 'sine', 0.25, 100);
      _beep(784, 0.18, 'sine', 0.25, 200);
    },
    wrong: () => {
      _beep(320, 0.10, 'sawtooth', 0.2,   0);
      _beep(220, 0.25, 'sawtooth', 0.15, 110);
    },
    flip: () => _beep(800, 0.06, 'sine', 0.1),
    click: () => _beep(900, 0.04, 'sine', 0.08),
    tick:  () => _beep(1400, 0.03, 'square', 0.06),
    levelup: () => {
      [523, 659, 784, 1047].forEach((f, i) => _beep(f, 0.16, 'triangle', 0.3, i * 120));
    },
    bossVictory: () => {
      [523, 659, 784, 1047, 1319].forEach((f, i) => _beep(f, 0.20, 'triangle', 0.35, i * 110));
    },
    bossDefeat: () => {
      _beep(440, 0.18, 'sawtooth', 0.3,   0);
      _beep(330, 0.18, 'sawtooth', 0.3, 200);
      _beep(220, 0.40, 'sawtooth', 0.3, 400);
    },
    nodeConnect: () => {
      _beep(660, 0.06, 'sine', 0.18,  0);
      _beep(990, 0.12, 'sine', 0.18, 70);
    },
    bossAlert: () => {
      _beep(880, 0.12, 'square', 0.2,   0);
      _beep(660, 0.12, 'square', 0.2, 150);
      _beep(880, 0.20, 'square', 0.2, 300);
    },
  };

  /** Play a named sound effect */
  function play(name) {
    if (!State.get().audioEnabled) return;
    if (_sounds[name]) _sounds[name]();
  }

  /**
   * Speak German text using the browser's TTS engine.
   * @param {string} text  - German text to speak
   * @param {string} [lang='de-DE']
   */
  function speak(text, lang = 'de-DE') {
    if (!State.get().ttsEnabled) return;
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    const utt  = new SpeechSynthesisUtterance(text);
    utt.lang   = lang;
    utt.rate   = 0.82;
    utt.pitch  = 1.0;

    // Prefer a native German voice if available
    const voices      = window.speechSynthesis.getVoices();
    const germanVoice = voices.find(v => v.lang.startsWith('de'));
    if (germanVoice) utt.voice = germanVoice;

    window.speechSynthesis.speak(utt);
  }

  return { play, speak };
})();

// Pre-load TTS voice list on first interaction
if (window.speechSynthesis) {
  window.speechSynthesis.getVoices();
  window.speechSynthesis.addEventListener('voiceschanged', () => {});
}
