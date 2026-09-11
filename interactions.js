/* Pointer dragging for desktop shortcuts, independent of window dragging. */
(() => {
  const icons = [...document.querySelectorAll('#main .icondiv')];
  const mobile = window.matchMedia('(max-width: 600px), (pointer: coarse) and (max-width: 1000px)');
  function bounds() {
    const desktop = document.getElementById('main').getBoundingClientRect();
    const safe = getComputedStyle(document.documentElement);
    return {
      left: mobile.matches ? (parseFloat(safe.getPropertyValue('--safe-left')) || 0) + 8 : 0,
      right: mobile.matches ? (parseFloat(safe.getPropertyValue('--safe-right')) || 0) + 8 : 0,
      top: mobile.matches ? document.getElementById('darkmode').getBoundingClientRect().bottom + 12 : desktop.top,
      bottom: document.querySelector('.taskbar').getBoundingClientRect().top - 8
    };
  }
  function place(icon, x, y) {
    const area = bounds();
    icon.style.left = Math.max(area.left, Math.min(innerWidth - area.right - icon.offsetWidth, x)) + 'px';
    icon.style.top = Math.max(area.top, Math.min(area.bottom - icon.offsetHeight, y)) + 'px';
  }
  // Snapshot existing positions before switching to fixed coordinates.
  const positions = icons.map(icon => icon.getBoundingClientRect());
  icons.forEach((icon, i) => {
    icon.style.position = 'fixed'; icon.style.margin = '0';
    place(icon, positions[i].left, positions[i].top);
    icon.title = 'Click to open. Drag to move. Alt + arrow keys to reposition.';
    icon.querySelectorAll('img').forEach(image => { image.draggable = false; });
    let drag = null, suppressClick = false;
    icon.addEventListener('click', event => {
      if (suppressClick && event.detail !== 0) {
        event.preventDefault(); event.stopImmediatePropagation(); suppressClick = false;
      }
    }, true);
    icon.addEventListener('pointerdown', event => {
      if (event.button !== 0 || !event.isPrimary) return;
      suppressClick = false;
      const rect = icon.getBoundingClientRect();
      drag = {id:event.pointerId, x:event.clientX, y:event.clientY, left:rect.left, top:rect.top, moved:false};
      icon.setPointerCapture(event.pointerId);
    });
    icon.addEventListener('pointermove', event => {
      if (!drag || drag.id !== event.pointerId) return;
      const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
      if (!drag.moved && Math.hypot(dx, dy) < (event.pointerType === 'touch' ? 10 : 6)) return;
      drag.moved = true; icon.classList.add('icon-dragging');
      place(icon, drag.left + dx, drag.top + dy); event.preventDefault();
    });
    function finish(event) {
      if (!drag || drag.id !== event.pointerId) return;
      suppressClick = drag.moved;
      drag = null; icon.classList.remove('icon-dragging');
      if (icon.hasPointerCapture(event.pointerId)) icon.releasePointerCapture(event.pointerId);
    }
    icon.addEventListener('pointerup', finish);
    icon.addEventListener('pointercancel', finish);
    icon.addEventListener('lostpointercapture', finish);
    icon.addEventListener('keydown', event => {
      if (!event.altKey || !['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)) return;
      event.preventDefault();
      const rect = icon.getBoundingClientRect(), step = event.shiftKey ? 1 : 10;
      place(icon, rect.left + (event.key === 'ArrowRight' ? step : event.key === 'ArrowLeft' ? -step : 0), rect.top + (event.key === 'ArrowDown' ? step : event.key === 'ArrowUp' ? -step : 0));
    });
  });
  function arrangeMobile() {
    if (!mobile.matches) return;
    const area = bounds();
    const available = innerWidth - area.left - area.right;
    const columns = Math.min(5, Math.max(1, Math.floor(available / 96)));
    const cellWidth = available / columns;
    icons.forEach((icon, i) => place(icon,
      area.left + (i % columns) * cellWidth + (cellWidth - icon.offsetWidth) / 2,
      area.top + Math.floor(i / columns) * 104));
  }
  arrangeMobile();
  let lastWidth = innerWidth;
  window.addEventListener('resize', () => {
    if (mobile.matches && lastWidth !== innerWidth) arrangeMobile();
    else icons.forEach(icon => { const rect = icon.getBoundingClientRect(); place(icon, rect.left, rect.top); });
    lastWidth = innerWidth;
  });
  mobile.addEventListener('change', arrangeMobile);
})();
