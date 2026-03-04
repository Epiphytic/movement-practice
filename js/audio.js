/**
 * Audio Playback Component for Movement Practice
 * Handles audio cue playback with graceful fallback
 */
(function() {
  'use strict';

  let currentAudio = null;
  let currentBtn = null;

  function initAudioButtons() {
    const buttons = document.querySelectorAll('.audio-btn[data-audio-src]');

    buttons.forEach(function(btn) {
      const src = btn.getAttribute('data-audio-src');

      btn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();

        // If this button is already playing, stop it
        if (currentBtn === btn && currentAudio && !currentAudio.paused) {
          currentAudio.pause();
          currentAudio.currentTime = 0;
          btn.classList.remove('playing');
          btn.querySelector('.audio-icon').textContent = '🔊';
          currentAudio = null;
          currentBtn = null;
          return;
        }

        // Stop any currently playing audio
        if (currentAudio) {
          currentAudio.pause();
          currentAudio.currentTime = 0;
          if (currentBtn) {
            currentBtn.classList.remove('playing');
            currentBtn.querySelector('.audio-icon').textContent = '🔊';
          }
        }

        // Try to play the audio file
        const audio = new Audio(src);
        currentAudio = audio;
        currentBtn = btn;

        audio.addEventListener('canplaythrough', function() {
          audio.play().then(function() {
            btn.classList.add('playing');
            btn.querySelector('.audio-icon').textContent = '⏹';
          }).catch(showFallback);
        }, { once: true });

        audio.addEventListener('error', function() {
          showFallback();
        }, { once: true });

        audio.addEventListener('ended', function() {
          btn.classList.remove('playing');
          btn.querySelector('.audio-icon').textContent = '🔊';
          currentAudio = null;
          currentBtn = null;
        });

        // Set a timeout for loading
        setTimeout(function() {
          if (audio.readyState < 3) {
            showFallback();
          }
        }, 3000);

        function showFallback() {
          // Show tooltip briefly
          const tooltip = btn.querySelector('.tooltip');
          if (tooltip) {
            tooltip.textContent = 'Audio coming soon';
            tooltip.style.display = 'block';
            setTimeout(function() {
              tooltip.style.display = '';
            }, 2000);
          }
          currentAudio = null;
          currentBtn = null;
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAudioButtons);
  } else {
    initAudioButtons();
  }
})();
