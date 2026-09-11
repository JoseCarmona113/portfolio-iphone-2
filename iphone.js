/* Keep touch windows above Safari's keyboard without disabling page zoom. */
(() => {
  const root = document.documentElement;
  const viewport = window.visualViewport;
  function fitVisibleViewport() {
    if (viewport && viewport.scale !== 1) return;
    root.style.setProperty('--visible-height', (viewport?.height || innerHeight) + 'px');
    root.style.setProperty('--visible-top', (viewport?.offsetTop || 0) + 'px');
  }
  fitVisibleViewport();
  viewport?.addEventListener('resize', fitVisibleViewport);
  viewport?.addEventListener('scroll', fitVisibleViewport);
  window.addEventListener('resize', fitVisibleViewport);
  // A tap on a second menu closes the first, avoiding overlapping popups.
  document.querySelectorAll('.media-menu details').forEach(menu => {
    menu.addEventListener('toggle', () => {
      if (menu.open) document.querySelectorAll('.media-menu details').forEach(other => {
        if (other !== menu) other.open = false;
      });
    });
  });
})();
