/* Desktop controller; replaces the original portfolio.js. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  let layer = 10, activeWindow = null;
  const tabs = new Map(), openers = new Map();
  const taskbar = $('taskbar-icon');
  taskbar.replaceChildren();
  taskbar.style.display = 'flex';
  function keyboard(el, label) {
    if (el.tagName !== 'BUTTON') {
      el.tabIndex = 0; el.setAttribute('role', 'button');
      el.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.click(); }
      });
    }
    if (label) el.setAttribute('aria-label', label);
  }
  function menus() {
    $('dropdown').style.display = $('accesories').style.display = 'none';
    $('startbutton').classList.remove('active');
    $('startbutton').setAttribute('aria-expanded', 'false');
  }
  function focus(id) {
    activeWindow = id; $(id).style.zIndex = ++layer;
    tabs.forEach((tab, key) => tab.setAttribute('aria-pressed', String(key === id)));
  }
  function minimizeWindow(id) {
    $(id).style.display = 'none';
    tabs.get(id).setAttribute('aria-pressed', 'false');
    if (activeWindow === id) activeWindow = null;
    tabs.get(id).focus();
    // Keep the window state and audio intact while minimized.
  }
  function open(id) {
    openers.set(id, document.activeElement);
    $(id).style.display = 'block'; tabs.get(id).hidden = false;
    focus(id); menus(); $(id).querySelector('.exitbutton').focus();
  }
  function close(id) {
    $(id).style.display = 'none'; tabs.get(id).hidden = true;
    if (activeWindow === id) activeWindow = null;
    if (id === 'player') stopRadio();
    openers.get(id)?.focus();
  }
  ['player','emailbox','notepadapp','bio-container','photos-container','tictac-container'].forEach(id => {
    const win = $(id), header = win.querySelector('.header, .mp3-header, .tictac-header');
    const title = header.querySelector('h5, p').textContent.trim();
    win.classList.add('desktop-window'); win.setAttribute('role', 'dialog'); win.setAttribute('aria-label', title);
    const exit = win.querySelector('.exitbutton'); keyboard(exit, 'Close ' + title);
    exit.addEventListener('click', () => close(id));
    let minimize = header.querySelector('.minimize');
    if (!minimize) {
      minimize = document.createElement('button');
      minimize.type = 'button'; minimize.className = 'minimize';
      minimize.textContent = '–'; header.append(minimize);
    }
    keyboard(minimize, 'Minimize ' + title);
    minimize.title = 'Minimize';
    minimize.addEventListener('click', () => minimizeWindow(id));
    win.addEventListener('pointerdown', () => focus(id));
    win.addEventListener('keydown', e => { if (e.key === 'Escape') close(id); });
    const tab = document.createElement('button'); tab.textContent = title; tab.hidden = true;
    tab.setAttribute('aria-pressed', 'false');
    tab.addEventListener('click', () => {
      if (win.style.display !== 'none' && activeWindow === id) minimizeWindow(id);
      else open(id);
    }); taskbar.append(tab); tabs.set(id, tab);
    header.addEventListener('pointerdown', e => {
      if (window.matchMedia('(max-width: 600px), (pointer: coarse) and (max-width: 1000px)').matches) return;
      if (e.button !== 0 || e.target.closest('.exitbutton, .minimize, button')) return;
      const rect = win.getBoundingClientRect(), dx = e.clientX - rect.left, dy = e.clientY - rect.top;
      header.setPointerCapture(e.pointerId);
      const move = event => {
        win.style.left = Math.max(0, Math.min(innerWidth - win.offsetWidth, event.clientX - dx)) + 'px';
        win.style.top = Math.max(0, Math.min(innerHeight - 90, event.clientY - dy)) + 'px';
        win.style.right = 'auto';
      };
      const release = () => {
        header.removeEventListener('pointermove', move);
        header.removeEventListener('pointerup', release); header.removeEventListener('pointercancel', release);
      };
      header.addEventListener('pointermove', move); header.addEventListener('pointerup', release);
      header.addEventListener('pointercancel', release); e.preventDefault();
    });
  });
  const launchers = {'musicicon':'player','emailicon':'emailbox','notepad-span':'notepadapp','photo-span':'photos-container','tictac-span':'tictac-container','documents-span':'notepadapp'};
  Object.entries(launchers).forEach(([id, target]) => { keyboard($(id)); $(id).addEventListener('click', () => open(target)); });
  const panels = {
    bio: ['Biography', '<h2>Jose Carmona</h2><p>I’m a web developer with a certificate in full-stack Java development. I enjoy exploring new technologies and creating engaging web experiences.</p><p>My tools include HTML, CSS, JavaScript, Java, Spring Boot, Git and GitHub.</p>'],
    work: ['My work', '<h2>Tic-tac-toe</h2><p>A two-player JavaScript game from my Java certificate course.</p><button id="launch-game">Play tic-tac-toe</button><p><a href="https://github.com/JoseCarmona113" target="_blank" rel="noopener noreferrer">View my GitHub projects</a></p>'],
    contact: ['Find me', '<h2>Get in touch</h2><p><a href="mailto:manuel_andeliz@hotmail.com">manuel_andeliz@hotmail.com</a></p><p><a href="https://www.linkedin.com/in/jose-carmona-542a741a7/" target="_blank" rel="noopener noreferrer">LinkedIn</a></p><p><a href="https://github.com/JoseCarmona113" target="_blank" rel="noopener noreferrer">GitHub</a></p>'],
    bin: ['Recycle bin', '<p>The recycle bin is empty.</p>']
  };
  const content = document.createElement('div'); content.className = 'window-content'; $('bio-container').append(content);
  function panel(key) {
    const [title, html] = panels[key];
    $('bio-container').querySelector('h5').textContent = title; tabs.get('bio-container').textContent = title;
    $('bio-container').setAttribute('aria-label', title); content.innerHTML = html;
    $('launch-game')?.addEventListener('click', () => open('tictac-container')); open('bio-container');
  }
  [['#bio-span','bio'],['.mywork','work'],['.findme','contact'],['.bin','bin']].forEach(([selector,key]) => {
    const el = document.querySelector(selector); keyboard(el); el.addEventListener('click', () => panel(key));
  });
  document.querySelector('.photo-inside-container').textContent = 'No photos added yet.';
  keyboard($('accesories-span'));
  $('accesories-span').addEventListener('click', () => { const el = $('accesories'); el.style.display = el.style.display === 'block' ? 'none' : 'block'; });
  $('startbutton').addEventListener('click', () => {
    const show = $('dropdown').style.display !== 'block'; menus();
    $('dropdown').style.display = show ? 'block' : 'none'; $('startbutton').classList.toggle('active', show);
    $('startbutton').setAttribute('aria-expanded', String(show));
  });
  document.addEventListener('click', e => {
    if (!e.target.closest('#dropdown, #accesories, #startbutton')) menus();
    if (!e.target.closest('#speaker, #volume-range')) $('volume-range').style.display = 'none';
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') menus(); });
  $('darkmode').addEventListener('click', () => {
    const dark = document.body.classList.toggle('dark-theme'); $('darkmode').textContent = dark ? 'Light mode' : 'Dark mode';
    $('darkmode').setAttribute('aria-pressed', String(dark));
  });
  const clock = () => { $('current-time').textContent = new Date().toLocaleTimeString([], {hour:'numeric',minute:'2-digit'}); };
  clock(); setInterval(clock, 1000);
  const radio = $('audio-player'), status = document.querySelector('.thirddiv');
  const visualizer = $('visualizer');
  let previewVisualizer = false;
  function playVisualizer() {
    visualizer.play().catch(() => { $('visualizer-hint').textContent = 'Video could not play. Try Preview visualizer.'; });
  }
  function pauseVisualizer(reset = false) {
    visualizer.pause();
    if (reset) visualizer.currentTime = 0;
  }
  $('preview-visualizer').addEventListener('click', () => {
    previewVisualizer = !previewVisualizer;
    $('preview-visualizer').setAttribute('aria-pressed', String(previewVisualizer));
    $('preview-visualizer').textContent = previewVisualizer ? 'Stop preview' : 'Preview visualizer';
    if (previewVisualizer) playVisualizer(); else if (radio.paused) pauseVisualizer();
  });
  $('media-exit').addEventListener('click', () => close('player'));
  document.querySelectorAll('[data-player-action]').forEach(button => button.addEventListener('click', () => {
    $(button.dataset.playerAction + '-button').click();
    button.closest('details').open = false;
  }));
  status.setAttribute('role', 'status'); status.textContent = 'Live radio · stopped';
  let elapsed = 0, started = null, timer = null;
  let connectionTimer = null, playbackRequested = false, playRequest = 0;
  function clearConnectionTimer() { clearTimeout(connectionTimer); connectionTimer = null; }
  function connectionDeadline() {
    clearConnectionTimer();
    connectionTimer = setTimeout(() => {
      playbackRequested = false; playRequest++;
      radio.pause(); pauseTimer(); clearConnectionTimer();
      status.textContent = 'Radio connection timed out. Press Play to retry.';
    }, 15000);
  }
  function render() {
    const ms = elapsed + (started === null ? 0 : performance.now() - started);
    $('minutes').textContent = String(Math.floor(ms / 60000)).padStart(2,'0');
    $('seconds').textContent = String(Math.floor(ms / 1000) % 60).padStart(2,'0');
    $('miliseconds').textContent = String(Math.floor(ms / 10) % 100).padStart(2,'0');
  }
  function pauseTimer() {
    if (!previewVisualizer) pauseVisualizer();
    if (started !== null) elapsed += performance.now() - started;
    started = null; clearInterval(timer); timer = null; render();
  }
  function stopRadio() {
    previewVisualizer = false; $('preview-visualizer').setAttribute('aria-pressed', 'false');
    $('preview-visualizer').textContent = 'Preview visualizer'; pauseVisualizer(true);
    playbackRequested = false; playRequest++; clearConnectionTimer(); radio.pause(); pauseTimer();
    elapsed = 0; render(); status.textContent = 'Live radio · stopped';
  }
  render(); radio.volume = Number($('volume-range').value) / 100;
  keyboard($('speaker'), 'Show volume control'); $('volume-range').setAttribute('aria-label', 'Radio volume');
  $('speaker').addEventListener('click', () => { const el = $('volume-range'); el.style.display = el.style.display === 'block' ? 'none' : 'block'; });
  $('volume-range').addEventListener('input', () => { radio.volume = Number($('volume-range').value) / 100; });
  $('player-volume').addEventListener('input', () => {
    radio.volume = Number($('player-volume').value) / 100;
    $('volume-range').value = $('player-volume').value;
  });
  $('volume-range').addEventListener('input', () => { $('player-volume').value = $('volume-range').value; });
  ['play','pause','stop'].forEach(key => $(key + '-button').setAttribute('aria-label', key + ' radio'));
  $('play-button').addEventListener('click', async () => {
    if (playbackRequested) return;
    playbackRequested = true;
    const request = ++playRequest;
    status.textContent = 'Connecting to radio…';
    radio.load(); connectionDeadline();
    try { await radio.play(); } catch (error) {
      if (request !== playRequest) return;
      playbackRequested = false; clearConnectionTimer();
      status.textContent = 'Radio unavailable. Press Play to retry.';
    }
  });
  radio.addEventListener('playing', () => {
    if (!playbackRequested) { radio.pause(); return; }
    clearConnectionTimer();
    if (started === null) { started = performance.now(); timer = setInterval(render,100); }
    playVisualizer();
    status.textContent = 'Live radio · playing';
  });
  radio.addEventListener('pause', pauseTimer);
  radio.addEventListener('waiting', () => {
    pauseTimer();
    if (playbackRequested && connectionTimer === null) { status.textContent = 'Buffering radio…'; connectionDeadline(); }
  });
  radio.addEventListener('error', () => {
    if (!playbackRequested) return;
    playbackRequested = false; playRequest++; clearConnectionTimer(); pauseTimer();
    status.textContent = 'Radio unavailable. Press Play to retry.';
  });
  $('pause-button').addEventListener('click', () => {
    previewVisualizer = false; $('preview-visualizer').setAttribute('aria-pressed', 'false');
    $('preview-visualizer').textContent = 'Preview visualizer'; pauseVisualizer();
    playbackRequested = false; playRequest++; clearConnectionTimer(); radio.pause();
    status.textContent = 'Live radio · paused';
  });
  $('stop-button').addEventListener('click', stopRadio);
  document.querySelectorAll('.playbuttons button:not([id]), .disk').forEach(el => {
    el.disabled = true; el.title = 'Not available for live radio'; el.setAttribute('aria-label', el.title);
  });
  const emailStatus = document.createElement('p'); emailStatus.className = 'email-status'; emailStatus.setAttribute('role','status');
  emailStatus.textContent = 'Send opens your email app; it does not send automatically.'; $('emailbox').append(emailStatus);
  [['email','Your email'],['subjet','Subject'],['message','Message']].forEach(([id,label]) => { $(id).required = true; $(id).setAttribute('aria-label',label); });
  $('sendbutton').setAttribute('aria-label','Open draft in your email app');
  $('sendbutton').addEventListener('click', () => {
    for (const id of ['email','subjet','message']) { if (!$(id).reportValidity()) return; }
    location.href = 'mailto:manuel_andeliz@hotmail.com?subject=' + encodeURIComponent($('subjet').value) + '&body=' + encodeURIComponent($('message').value + '\n\nReply to: ' + $('email').value);
    emailStatus.textContent = 'Continue in your email app. If nothing opens, email manuel_andeliz@hotmail.com directly.';
  });
})();
