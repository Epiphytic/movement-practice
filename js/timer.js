/**
 * Timer Component for Movement Practice
 * States: ready → running → paused → done
 */
(function() {
  'use strict';

  // Audio context for completion chime
  let audioCtx = null;

  function getAudioContext() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
  }

  function playChime() {
    try {
      const ctx = getAudioContext();
      if (ctx.state === 'suspended') ctx.resume();

      // Create a pleasant two-tone chime
      const now = ctx.currentTime;

      // First tone
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now); // D5
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.6);

      // Second tone (higher, slight delay)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, now + 0.15); // A5
      gain2.gain.setValueAtTime(0, now);
      gain2.gain.setValueAtTime(0.25, now + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.15);
      osc2.stop(now + 0.8);
    } catch(e) {
      // Audio not available — fail silently
    }
  }

  function formatTime(totalSeconds) {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    if (mins > 0) {
      return mins + ':' + String(secs).padStart(2, '0');
    }
    return '0:' + String(secs).padStart(2, '0');
  }

  function initTimers() {
    const timers = document.querySelectorAll('.timer[data-seconds]');
    timers.forEach(function(el) {
      const totalSeconds = parseInt(el.getAttribute('data-seconds'), 10);
      let remaining = totalSeconds;
      let interval = null;
      let state = 'ready'; // ready, running, paused, done

      const display = el.querySelector('.timer-display');
      const icon = el.querySelector('.timer-icon');

      display.textContent = formatTime(remaining);
      el.setAttribute('data-state', 'ready');
      if (icon) icon.textContent = '▶';

      function setState(newState) {
        state = newState;
        el.setAttribute('data-state', state);
      }

      function tick() {
        remaining--;
        display.textContent = formatTime(remaining);
        if (remaining <= 0) {
          clearInterval(interval);
          interval = null;
          setState('done');
          if (icon) icon.textContent = '✓';
          playChime();

          // Mark parent exercise card as completed
          const card = el.closest('.exercise-card');
          if (card) card.classList.add('completed');
        }
      }

      el.addEventListener('click', function(e) {
        e.preventDefault();

        // Initialize audio context on first user interaction
        getAudioContext();

        if (state === 'ready' || state === 'paused') {
          // Start or resume
          setState('running');
          if (icon) icon.textContent = '⏸';
          interval = setInterval(tick, 1000);
        } else if (state === 'running') {
          // Pause
          clearInterval(interval);
          interval = null;
          setState('paused');
          if (icon) icon.textContent = '▶';
        } else if (state === 'done') {
          // Reset
          remaining = totalSeconds;
          display.textContent = formatTime(remaining);
          setState('ready');
          if (icon) icon.textContent = '▶';
          const card = el.closest('.exercise-card');
          if (card) card.classList.remove('completed');
        }
      });
    });
  }

  // Mark Complete checkboxes
  function initCheckboxes() {
    const checks = document.querySelectorAll('.complete-check');
    checks.forEach(function(el) {
      el.addEventListener('click', function(e) {
        e.preventDefault();
        const input = el.querySelector('input[type="checkbox"]');
        if (input) {
          input.checked = !input.checked;
          el.classList.toggle('checked', input.checked);

          const card = el.closest('.exercise-card');
          if (card) card.classList.toggle('completed', input.checked);
        }
      });
    });
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      initTimers();
      initCheckboxes();
    });
  } else {
    initTimers();
    initCheckboxes();
  }
})();
