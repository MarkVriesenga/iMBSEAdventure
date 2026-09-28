/*
 * game.js — UI wiring for the iMBSE webapp.
 * Connects the generic engine + automapper to the console front end.
 */
(function () {
  'use strict';

  const engine = new AdventureEngine(IMBSE_GAME);
  const consoleEl = document.getElementById('console');
  const form = document.getElementById('command-form');
  const input = document.getElementById('command-input');
  const statusTitle = document.getElementById('status-title');
  const turnCounter = document.getElementById('turn-counter');
  const scoreValue = document.getElementById('score-value');
  const movesValue = document.getElementById('moves-value');
  const treasureValue = document.getElementById('treasure-value');
  const roomsValue = document.getElementById('rooms-value');
  const inventoryList = document.getElementById('inventory-list');
  const gameState = document.getElementById('game-state');
  const boardHint = document.getElementById('board-hint');
  const toast = document.getElementById('toast');
  const mapCanvas = document.getElementById('map-canvas');
  const mapFrame = document.getElementById('map-frame');
  const mapLegend = document.getElementById('map-legend');
  const roomView = document.getElementById('room-view');
  const roomImage = document.getElementById('room-image');
  const roomCaption = document.getElementById('room-caption');
  const automap = new AutoMap(engine, mapCanvas);

  const SAVE_KEY = 'imbse.save.v1';
  const history = [];
  let historyIndex = -1;
  let toastTimer = null;

  /* ------------------------------------------------ output */
  function classify(text) {
    if (text.startsWith('— ')) return 'room-title';
    if (text.startsWith('***')) return 'system';
    return '';
  }

  engine.onOutput(text => {
    const p = document.createElement('p');
    const cls = classify(text);
    if (cls) p.className = cls;
    p.textContent = text;
    consoleEl.appendChild(p);
    consoleEl.scrollTop = consoleEl.scrollHeight;
  });

  function echo(command) {
    const p = document.createElement('p');
    p.className = 'echo';
    p.textContent = '> ' + command;
    consoleEl.appendChild(p);
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
  }

  /* ------------------------------------------------ the Room tab
   * One illustrated plate per room, from images/. Rooms that share a name
   * share a plate; images/plates-manifest.js holds the mapping. A room you
   * cannot see is shown as darkness, not as its picture.
   */
  const PLATES = window.IMBSE_PLATES || { dir: '', ext: '', titles: {}, roomToPlate: {} };
  let mapMode = 'explored';
  let shownPlate = null;

  function plateFor(roomKey) {
    const id = PLATES.roomToPlate[roomKey];
    return id ? { id: id, src: PLATES.dir + id + PLATES.ext, title: PLATES.titles[id] } : null;
  }

  function drawRoomView() {
    const lit = engine.hasLight();
    const plate = lit ? plateFor(engine.state.room) : null;

    /* Three states, and only the first of them is darkness: unlit shows the
       dark panel, lit-but-unillustrated shows the blank plate, lit shows the
       picture. Light the lamp and the picture comes back; put it out in a dark
       room and the darkness comes back. */
    roomView.classList.toggle('is-dark', !lit);
    roomView.classList.toggle('is-blank', lit && !plate);
    if (!plate) {
      roomCaption.textContent = lit ? (engine.room() || {}).name || '' : '';
      roomImage.classList.remove('shown');
      shownPlate = null;
      return;
    }
    roomCaption.textContent = plate.title;
    if (plate.id !== shownPlate) {
      shownPlate = plate.id;
      roomImage.classList.remove('shown');
      const next = new Image();
      next.onload = () => {
        if (shownPlate !== plate.id) return;   // moved on before it arrived
        roomImage.src = next.src;
        roomImage.alt = plate.title;
        roomImage.classList.add('shown');
      };
      next.src = plate.src;
    } else {
      roomImage.classList.add('shown');
    }
  }

  /* pull the rest into the browser cache once the game is up */
  function preloadPlates() {
    const seen = new Set();
    const queue = Object.values(PLATES.roomToPlate).filter(id => {
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
    let i = 0;
    (function next() {
      if (i >= queue.length) return;
      const img = new Image();
      img.onload = img.onerror = next;
      img.src = PLATES.dir + queue[i++] + PLATES.ext;
    })();
  }

  /* ------------------------------------------------ status panels */
  function refresh() {
    const st = engine.state;
    const game = engine.game;
    statusTitle.textContent = engine.hasLight() ? engine.room().name : 'Darkness';
    turnCounter.textContent = 'TURN ' + String(st.moves).padStart(3, '0');
    scoreValue.textContent = engine.score();
    movesValue.textContent = st.moves;

    /* This game scores its own way: its treasures are listed in game.TREASURES
       and a treasure counts as banked when it is socketed or set in a niche,
       which is what flags.vaulted records. Games that use the engine's plain
       treasure flag are still counted the old way. */
    let held, total;
    if (game.TREASURES) {
      held = Object.keys(st.flags.vaulted || {}).length;
      total = game.TREASURES.length;
    } else {
      const treasures = Object.keys(game.items).filter(id => game.items[id].treasure);
      held = treasures.filter(id => st.itemLocations[id] === game.treasury).length;
      total = treasures.length;
    }
    treasureValue.textContent = held + ' / ' + total;

    const roomsFound = Object.keys(st.visited).filter(k => !k.includes('#') && game.rooms[k]).length;
    roomsValue.textContent = roomsFound;

    const inv = engine.inventory();
    inventoryList.innerHTML = '';
    if (!inv.length) {
      const li = document.createElement('li');
      li.className = 'empty';
      li.textContent = 'Empty-handed';
      inventoryList.appendChild(li);
    } else {
      for (const id of inv) {
        const li = document.createElement('li');
        li.textContent = game.items[id].name.replace(/^(a|an|the|some|several)\s+/, '');
        if (game.items[id].treasure) li.className = 'treasure';
        inventoryList.appendChild(li);
      }
    }

    if (st.won) gameState.textContent = 'EXPEDITION COMPLETE · YOU WON';
    else if (st.dead) gameState.textContent = 'EXPEDITION ENDED · YOU DIED';
    else gameState.textContent = 'EXPEDITION IN PROGRESS';

    automap.draw();
    if (mapMode === 'room') drawRoomView();
  }

  /* ------------------------------------------------ commands */
  function submit(command) {
    const cmd = command.trim();
    if (!cmd) return;
    echo(cmd);
    /* SAVE, RESTORE and MAP never reach the engine, so they abbreviate through
       the engine's resolver here instead. */
    const lower = engine.canonicalVerb(cmd.toLowerCase());
    if (lower === 'save') { saveGame(); refresh(); return; }
    if (lower === 'restore' || lower === 'load') { restoreGame(); refresh(); return; }
    if (lower === 'map') {
      engine.print('The automap panel on the right charts every passage you\'ve walked.');
      refresh();
      return;
    }
    engine.parse(cmd);
    refresh();
    consoleEl.scrollTop = consoleEl.scrollHeight;
  }

  /* ------------------------------------------------ batches
   * A walkthrough is a column of commands, and the natural thing to do with a
   * column of commands is paste the lot. So: newlines, semicolons and the
   * Infocom full stop all separate one command from the next, and a batch is
   * played out a command at a time rather than all at once, because the point
   * of watching it is seeing where it goes wrong.
   */
  const BATCH_TICK = 45;                   // ms between commands, fast enough to watch
  let batch = [];
  let batchTimer = null;

  function splitCommands(text) {
    return String(text)
      .split(/[\n\r;]+|\.(?=\s|$)/)        // a full stop only when it ends a word
      .map(s => s.trim())
      .filter(Boolean);
  }

  function setBatchUI(on, left) {
    batchBar.classList.toggle('running', on);
    input.disabled = on;
    input.placeholder = on
      ? 'Running ' + left + ' more…'
      : 'What do you do? (try: HELP)';
    if (on) batchCount.textContent = left + ' to go';
  }

  function stopBatch(why) {
    clearTimeout(batchTimer);
    batchTimer = null;
    const left = batch.length;
    batch = [];
    setBatchUI(false, 0);
    if (why && left) {
      engine.print('*** Batch stopped — ' + why + '. ' + left +
        (left === 1 ? ' command' : ' commands') + ' not run. ***');
      refresh();
    }
    input.focus();
  }

  function batchTick() {
    if (!batch.length) { stopBatch(null); showToast('Batch complete'); return; }
    const cmd = batch.shift();
    submit(cmd);
    if (engine.state.dead) return stopBatch('you died');
    if (engine.state.won) return stopBatch('the game is over');
    setBatchUI(true, batch.length);
    batchTimer = setTimeout(batchTick, BATCH_TICK);
  }

  function runBatch(cmds) {
    if (batchTimer) stopBatch(null);
    batch = cmds.slice();
    engine.print('*** Running ' + batch.length + ' commands. Press ESC, or Stop, to halt. ***');
    setBatchUI(true, batch.length);
    batchTick();
  }

  const batchBar = document.getElementById('batch-bar');
  const batchCount = document.getElementById('batch-count');
  document.getElementById('batch-stop').addEventListener('click', () => stopBatch('stopped'));

  /* a single-line input strips newlines on paste, so take the text first */
  input.addEventListener('paste', e => {
    const text = (e.clipboardData || window.clipboardData).getData('text');
    const cmds = splitCommands(text);
    if (cmds.length < 2) return;                 // one command: paste it normally
    e.preventDefault();
    input.value = '';
    runBatch(cmds);
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const raw = input.value;
    const cmds = splitCommands(raw);
    input.value = '';
    if (cmds.length > 1) { runBatch(cmds); return; }
    if (raw.trim()) {
      history.push(raw.trim());
      historyIndex = history.length;
    }
    submit(raw);
    input.focus();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && batchTimer) { e.preventDefault(); stopBatch('stopped'); }
  });

  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex > 0) { historyIndex--; input.value = history[historyIndex] || ''; }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex < history.length - 1) { historyIndex++; input.value = history[historyIndex] || ''; }
      else { historyIndex = history.length; input.value = ''; }
    }
  });

  document.getElementById('compass').addEventListener('click', e => {
    const btn = e.target.closest('button');
    if (!btn || batchTimer) return;          // a batch owns the turn order while it runs
    submit(btn.dataset.cmd);
    input.focus();
  });

  /* ------------------------------------------------ save / restore */
  function saveGame() {
    try {
      localStorage.setItem(SAVE_KEY, engine.serialize());
      engine.print('Game saved.');
      showToast('Expedition saved');
    } catch (err) {
      engine.print('Save failed: ' + err.message);
    }
  }

  function restoreGame() {
    const data = localStorage.getItem(SAVE_KEY);
    if (!data) { engine.print('No saved game found.'); return; }
    try {
      engine.deserialize(data);
      engine.print('Game restored.');
      engine.print(engine.describeRoom(true));
      showToast('Expedition restored');
    } catch (err) {
      engine.print('Restore failed: ' + err.message);
    }
  }

  /* ------------------------------------------------ buttons & dialogs */
  document.getElementById('new-game').addEventListener('click', () => {
    stopBatch(null);                         // nothing left over to feed the new game
    consoleEl.innerHTML = '';
    engine.reset();
    engine.start();
    refresh();
    showToast('New expedition begins');
    input.focus();
  });
  document.getElementById('save-button').addEventListener('click', () => {
    if (batchTimer) return;
    echo('save'); saveGame(); refresh();
  });
  document.getElementById('restore-button').addEventListener('click', () => {
    if (batchTimer) return;                  // restoring mid-batch would run the rest
    echo('restore'); restoreGame(); refresh();  // of the queue against a different game
  });

  const tabExplored = document.getElementById('map-tab-explored');
  const tabCheat = document.getElementById('map-tab-cheat');
  const tabRoom = document.getElementById('map-tab-room');
  const TABS = { explored: tabExplored, cheat: tabCheat, room: tabRoom };

  function setMapMode(mode) {
    mapMode = mode;
    for (const key of Object.keys(TABS)) {
      const on = key === mode;
      TABS[key].classList.toggle('active', on);
      TABS[key].setAttribute('aria-selected', String(on));
    }
    mapFrame.classList.toggle('room-mode', mode === 'room');
    mapLegend.style.visibility = mode === 'room' ? 'hidden' : '';
    automap.revealAll = mode === 'cheat';
    if (mode === 'room') drawRoomView();
    else automap.draw();
  }
  tabExplored.addEventListener('click', () => setMapMode('explored'));
  tabCheat.addEventListener('click', () => setMapMode('cheat'));
  tabRoom.addEventListener('click', () => setMapMode('room'));

  document.getElementById('map-zoom-in').addEventListener('click', () => automap.zoomIn());
  document.getElementById('map-zoom-out').addEventListener('click', () => automap.zoomOut());
  document.getElementById('map-center').addEventListener('click', () => automap.centerView());
  document.getElementById('map-relayout').addEventListener('click', () => {
    automap.relayout();
    showToast('Map re-optimized');
  });
  document.getElementById('map-export').addEventListener('click', () => {
    if (automap.exportPdf('imbse-platform-map.pdf')) showToast('Full map exported to PDF');
  });

  const rulesDialog = document.getElementById('rules-dialog');
  document.getElementById('rules-button').addEventListener('click', () => rulesDialog.showModal());
  document.getElementById('close-rules').addEventListener('click', () => rulesDialog.close());

  window.addEventListener('resize', () => automap.draw());

  /* ------------------------------------------------ hint rotation */
  const hints = [
    'Try: E · IN · TAKE ALL · OUT · W · DOWN ... and keep an eye on the map.',
    'HINT tells you what the room you\'re standing in is waiting on. It never lies.',
    'The lantern burns context only while it\'s lit — 330 tokens. Put it out in the light.',
    'You can carry seven things. The balloon basket will carry cargo up for you.',
    'Read the PLACARD in every hall: it names the face it beats and the word that beats it.',
    'Artifacts score when found and score properly when socketed in the Digital Thread Vault.',
    'Buy the blasting cap at the Company Store. The charge in the endgame is inert without it.',
    'PRAY for the truth. Don\'t believe the second one.',
    'ASK SAINT MARK ABOUT DASSAULT — the most useful thing anybody up here says.',
    'ANSWER Alexander\'s riddles for true hints, and ask Katie for a VISION.',
    'The Token Fountain will refill the lantern, for a price you may not want to pay.',
    'GOAL repeats what you\'re here to do, at any point, however lost you\'re.'
  ];
  let hintIndex = 0;
  setInterval(() => {
    hintIndex = (hintIndex + 1) % hints.length;
    boardHint.textContent = hints[hintIndex];
  }, 9000);

  /* ------------------------------------------------ boot */
  engine.start();
  refresh();
  input.focus();
  setTimeout(preloadPlates, 1200);
})();
