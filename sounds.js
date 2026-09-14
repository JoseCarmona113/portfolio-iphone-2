/* Browsers may require a tap or key press before allowing startup audio. */
(() => {
  const startup = new Audio('sounds/startup.wav');
  const tada = new Audio('sounds/tada.wav');
  startup.preload = tada.preload = 'auto';
  let started = false;
  let pending = false;

  function removeListeners() {
    document.removeEventListener('click', tryStartup);
    document.removeEventListener('keydown', tryStartup);
  }

  function tryStartup() {
    if (started || pending) return;
    pending = true;
    startup.play().then(() => {
      started = true;
      pending = false;
      removeListeners();
    }).catch(() => {
      pending = false;
      // Keep the gesture listeners so a blocked load can retry on interaction.
    });
  }

  window.playWinSound = () => {
    tada.currentTime = 0;
    tada.play().catch(() => {});
  };

  document.addEventListener('click', tryStartup);
  document.addEventListener('keydown', tryStartup);
  if (document.readyState === 'complete') tryStartup();
  else window.addEventListener('load', tryStartup, { once: true });
})();
