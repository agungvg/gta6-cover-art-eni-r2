// Vice Heat — editor.js
// The 3-step wizard editor: photos, caption, export. The centre canvas is
// the same drawPoster() the PNG export uses, so preview and export match
// pixel for pixel.

import { CAST, portraitCanvas, FACE_ANCHOR } from './cast.js';
import { GRADES, LAYOUTS, drawPoster, renderPoster } from './poster.js';

export const SIZES = [
  { label: 'Square post', w: 1080, h: 1080 },
  { label: 'Portrait post', w: 1080, h: 1350 },
  { label: 'Wide banner', w: 1920, h: 1080 },
];

const CAPTIONS = [
  { title: 'VICE HEAT', script: 'one last summer', tagline: 'SIX STRANGERS · ONE SUNSET · NO WAY HOME' },
  { title: 'GOLDEN GETAWAY', script: 'run the coast', tagline: 'FIVE FRIENDS · ONE COAST · NO WAY BACK' },
  { title: 'NEON HARBOR', script: 'lights out, engines on', tagline: 'THE CITY NEVER SLEEPS · NEITHER DO WE' },
  { title: 'PALM LINE', script: 'chase the horizon', tagline: 'SALT AIR · FAST CARS · LOUD MUSIC' },
];

export function defaultState() {
  const photos = CAST.map((m) => ({
    canvas: portraitCanvas(m),
    member: m,
    name: m.name,
    anchor: FACE_ANCHOR,
  }));
  const state = {
    title: 'VICE HEAT',
    script: 'one last summer',
    tagline: 'SIX STRANGERS · ONE SUNSET · NO WAY HOME',
    quote: 'PURE ADRENALINE, PAINTED IN GOLD',
    outlet: 'THE LEONIDA LEDGER',
    volume: 'VOL. 1',
    layout: 0,
    grade: 0,
    photos,
    panels: [],
    look: { paint: 50, gradeAmt: 50, halftone: 0, grain: 0, glow: 50 },
    selected: 0,
    step: 1,
  };
  syncPanels(state);
  return state;
}

// Make panels match the current layout: keep settings where a panel survives,
// fill new panels with the next cast photo.
export function syncPanels(state) {
  const n = LAYOUTS[state.layout].panels.length;
  const next = [];
  for (let i = 0; i < n; i++) {
    const old = state.panels[i];
    next.push(old || {
      photo: i % state.photos.length,
      zoom: 1, panX: 0, panY: 0, flip: false,
      name: state.photos[i % state.photos.length].member.role,
    });
  }
  state.panels = next;
  if (state.selected >= n) state.selected = 0;
}

function snapshot(state) {
  return JSON.stringify({
    title: state.title, script: state.script, tagline: state.tagline,
    quote: state.quote, outlet: state.outlet, volume: state.volume,
    layout: state.layout, grade: state.grade, panels: state.panels,
    look: state.look, selected: state.selected, step: state.step,
  });
}

function restore(state, snap) {
  const s = JSON.parse(snap);
  Object.assign(state, s);
}

function el(id) { return document.getElementById(id); }

function download(canvas, filename) {
  canvas.toBlob((blob) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  }, 'image/png');
}

export function exportSize(state, sizeIdx) {
  const s = SIZES[sizeIdx];
  const c = renderPoster(state, s.w, s.h);
  download(c, `vice-heat-${s.w}x${s.h}.png`);
}

export function exportAll(state) {
  SIZES.forEach((s, i) => setTimeout(() => exportSize(state, i), i * 400));
}

export function createEditor(state) {
  const preview = el('preview');
  const pctx = preview.getContext('2d');
  const undoStack = [];
  const redoStack = [];
  let lastSnap = snapshot(state);

  function render() {
    const rect = preview.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const w = Math.max(320, Math.round(rect.width * dpr));
    const h = Math.max(320, Math.round(rect.height * dpr));
    if (preview.width !== w || preview.height !== h) {
      preview.width = w;
      preview.height = h;
    }
    drawPoster(pctx, state, w, h);
    // Numbered panel badges so a user can talk about "panel 3".
    const layout = LAYOUTS[state.layout];
    layout.panels.forEach((p, i) => {
      const bx = p.x * w + p.slant * p.w * w + 14;
      const by = p.y * h + 14;
      pctx.save();
      pctx.fillStyle = i === state.selected ? '#ffd23f' : 'rgba(12,6,16,0.8)';
      pctx.beginPath();
      pctx.arc(bx + 11, by + 11, 11, 0, Math.PI * 2);
      pctx.fill();
      pctx.fillStyle = i === state.selected ? '#160a12' : '#fff';
      pctx.font = 'bold 13px sans-serif';
      pctx.textAlign = 'center';
      pctx.textBaseline = 'middle';
      pctx.fillText(String(i + 1), bx + 11, by + 12);
      pctx.restore();
    });
  }

  function commit() {
    const now = snapshot(state);
    if (now !== lastSnap) {
      undoStack.push(lastSnap);
      if (undoStack.length > 60) undoStack.shift();
      redoStack.length = 0;
      lastSnap = now;
    }
    render();
    syncUI();
  }

  function undo() {
    if (!undoStack.length) return;
    redoStack.push(lastSnap);
    lastSnap = undoStack.pop();
    restore(state, lastSnap);
    render();
    syncUI();
  }

  function redo() {
    if (!redoStack.length) return;
    undoStack.push(lastSnap);
    lastSnap = redoStack.pop();
    restore(state, lastSnap);
    render();
    syncUI();
  }

  // ---- left panel: photo strip ----
  const strip = el('photo-strip');
  function buildStrip() {
    strip.innerHTML = '';
    state.photos.forEach((ph, i) => {
      const d = document.createElement('div');
      d.className = 'thumb';
      d.draggable = true;
      d.title = ph.name;
      const c = document.createElement('canvas');
      c.width = 72; c.height = 96;
      c.getContext('2d').drawImage(ph.canvas, 0, 0, 72, 96);
      d.appendChild(c);
      const lab = document.createElement('span');
      lab.textContent = ph.member ? ph.member.role : ph.name;
      d.appendChild(lab);
      d.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/photo', String(i));
      });
      d.addEventListener('click', () => {
        state.panels[state.selected].photo = i;
        state.panels[state.selected].name =
          ph.member ? ph.member.role : ph.name;
        commit();
      });
      strip.appendChild(d);
    });
    const add = document.createElement('button');
    add.className = 'thumb add';
    add.textContent = '+ Add photo';
    add.addEventListener('click', () => el('file-input').click());
    strip.appendChild(add);
  }

  // ---- layout thumbnails (live mini posters) ----
  const layoutBox = el('layout-list');
  function buildLayouts() {
    layoutBox.innerHTML = '';
    LAYOUTS.forEach((lay, i) => {
      const b = document.createElement('button');
      b.className = 'layout-thumb' + (i === state.layout ? ' active' : '');
      b.title = lay.name;
      const c = document.createElement('canvas');
      c.width = 132; c.height = 96;
      const tmp = { ...state, layout: i };
      drawPoster(c.getContext('2d'), tmp, 132, 96);
      b.appendChild(c);
      const lab = document.createElement('span');
      lab.textContent = `${i + 1} · ${lay.name}`;
      b.appendChild(lab);
      b.addEventListener('click', () => {
        state.layout = i;
        syncPanels(state);
        commit();
      });
      layoutBox.appendChild(b);
    });
  }

  // ---- grade chips ----
  const gradeBox = el('grade-list');
  function buildGrades() {
    gradeBox.innerHTML = '';
    GRADES.forEach((g, i) => {
      const b = document.createElement('button');
      b.className = 'grade-chip' + (i === state.grade ? ' active' : '');
      b.innerHTML = `<span class="dot" style="background:linear-gradient(135deg,${g.sky[0]},${g.sky[1]})"></span>${g.name}`;
      b.addEventListener('click', () => {
        state.grade = i;
        commit();
      });
      gradeBox.appendChild(b);
    });
  }

  // ---- caption fields ----
  const fields = [
    ['f-title', 'title'], ['f-script', 'script'], ['f-tagline', 'tagline'],
    ['f-quote', 'quote'], ['f-outlet', 'outlet'], ['f-volume', 'volume'],
  ];
  fields.forEach(([id, key]) => {
    const input = el(id);
    if (!input) return;
    input.value = state[key];
    input.addEventListener('input', () => {
      state[key] = input.value;
      render();
    });
    input.addEventListener('change', commit);
  });

  // ---- steps ----
  document.querySelectorAll('.step').forEach((s) => {
    s.addEventListener('click', () => {
      state.step = Number(s.dataset.step);
      commit();
    });
  });

  // ---- Auto layout + Surprise me ----
  el('auto-layout').addEventListener('click', () => {
    const n = state.photos.length;
    state.layout = n <= 2 ? 5 : n <= 3 ? 3 : n <= 4 ? 1 : n <= 6 ? 0 : 4;
    syncPanels(state);
    commit();
  });
  el('surprise').addEventListener('click', () => {
    const cap = CAPTIONS[Math.floor(Math.random() * CAPTIONS.length)];
    state.title = cap.title;
    state.script = cap.script;
    state.tagline = cap.tagline;
    state.layout = Math.floor(Math.random() * LAYOUTS.length);
    state.grade = Math.floor(Math.random() * GRADES.length);
    state.volume = `VOL. ${1 + Math.floor(Math.random() * 4)}`;
    syncPanels(state);
    commit();
  });

  // ---- file input / drag-drop / paste ----
  function addUpload(file) {
    if (!file || !file.type.startsWith('image/')) return;
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = 540; c.height = 720;
      const g = c.getContext('2d');
      const scale = Math.max(540 / img.width, 720 / img.height);
      const w = img.width * scale, h = img.height * scale;
      g.drawImage(img, (540 - w) / 2, (720 - h) / 2, w, h);
      state.photos.push({
        canvas: c, img: null,
        name: file.name.replace(/\.[^.]+$/, '').toUpperCase().slice(0, 18),
        anchor: { x: 0.5, y: 0.4 },
      });
      URL.revokeObjectURL(url);
      buildStrip();
      commit();
    };
    img.src = url;
  }
  el('file-input').addEventListener('change', (e) => {
    [...e.target.files].forEach(addUpload);
    e.target.value = '';
  });
  document.addEventListener('paste', (e) => {
    [...(e.clipboardData?.files || [])].forEach(addUpload);
  });
  preview.addEventListener('dragover', (e) => e.preventDefault());
  preview.addEventListener('drop', (e) => {
    e.preventDefault();
    const idx = e.dataTransfer.getData('text/photo');
    if (idx !== '') {
      const panel = panelAt(e);
      if (panel >= 0) {
        state.panels[panel].photo = Number(idx);
        const ph = state.photos[Number(idx)];
        state.panels[panel].name = ph.member ? ph.member.role : ph.name;
        state.selected = panel;
        commit();
      }
    } else {
      [...e.dataTransfer.files].forEach(addUpload);
    }
  });

  // ---- preview pointer: click select, drag pan, wheel zoom, dblclick reset ----
  function panelAt(e) {
    const r = preview.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const layout = LAYOUTS[state.layout];
    for (let i = layout.panels.length - 1; i >= 0; i--) {
      const p = layout.panels[i];
      if (px >= p.x && px <= p.x + p.w && py >= p.y && py <= p.y + p.h) return i;
    }
    return -1;
  }
  let drag = null;
  preview.addEventListener('pointerdown', (e) => {
    const i = panelAt(e);
    if (i < 0) return;
    state.selected = i;
    drag = { i, x: e.clientX, y: e.clientY, shift: e.shiftKey, from: i };
    preview.setPointerCapture(e.pointerId);
    syncUI();
  });
  preview.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const r = preview.getBoundingClientRect();
    const panel = state.panels[drag.i];
    if (drag.shift) {
      const over = panelAt(e);
      if (over >= 0 && over !== drag.from) {
        const a = state.panels[drag.from].photo;
        state.panels[drag.from].photo = state.panels[over].photo;
        state.panels[over].photo = a;
        const na = state.panels[drag.from].name;
        state.panels[drag.from].name = state.panels[over].name;
        state.panels[over].name = na;
        drag.from = over;
        render();
      }
      return;
    }
    panel.panX += ((e.clientX - drag.x) / r.width) * 2;
    panel.panY += ((e.clientY - drag.y) / r.height) * 2;
    panel.panX = Math.max(-1, Math.min(1, panel.panX));
    panel.panY = Math.max(-1, Math.min(1, panel.panY));
    drag.x = e.clientX;
    drag.y = e.clientY;
    render();
  });
  preview.addEventListener('pointerup', () => {
    if (drag) { drag = null; commit(); }
  });
  preview.addEventListener('wheel', (e) => {
    e.preventDefault();
    const panel = state.panels[state.selected];
    panel.zoom = Math.max(1, Math.min(3, panel.zoom * (e.deltaY < 0 ? 1.08 : 0.93)));
    render();
    syncUI();
  }, { passive: false });
  preview.addEventListener('dblclick', () => {
    const panel = state.panels[state.selected];
    panel.zoom = 1; panel.panX = 0; panel.panY = 0; panel.flip = false;
    commit();
  });

  // ---- right panel: export + per-panel controls + Look sliders ----
  const exportBox = el('export-list');
  SIZES.forEach((s, i) => {
    const row = document.createElement('button');
    row.className = 'export-row';
    row.innerHTML = `<span>${s.label}</span><b>${s.w} × ${s.h}</b>`;
    row.addEventListener('click', () => exportSize(state, i));
    exportBox.appendChild(row);
  });
  el('export-all').addEventListener('click', () => exportAll(state));

  function bindSlider(id, get, set) {
    const s = el(id);
    if (!s) return;
    s.value = get();
    s.addEventListener('input', () => { set(Number(s.value)); render(); });
    s.addEventListener('change', commit);
  }

  function syncUI() {
    document.querySelectorAll('.step').forEach((s) => {
      s.classList.toggle('active', Number(s.dataset.step) === state.step);
    });
    el('panel-label').textContent =
      `Panel ${state.selected + 1} of ${state.panels.length}`;
    const panel = state.panels[state.selected];
    const zs = el('panel-zoom');
    if (zs) zs.value = panel.zoom;
    const nt = el('panel-name');
    if (nt && document.activeElement !== nt) nt.value = panel.name || '';
    el('undo').disabled = undoStack.length === 0;
    el('redo').disabled = redoStack.length === 0;
    buildLayouts();
    buildGrades();
  }

  el('panel-prev').addEventListener('click', () => {
    const panel = state.panels[state.selected];
    panel.photo = (panel.photo - 1 + state.photos.length) % state.photos.length;
    panel.name = state.photos[panel.photo].member
      ? state.photos[panel.photo].member.role
      : state.photos[panel.photo].name;
    commit();
  });
  el('panel-next').addEventListener('click', () => {
    const panel = state.panels[state.selected];
    panel.photo = (panel.photo + 1) % state.photos.length;
    panel.name = state.photos[panel.photo].member
      ? state.photos[panel.photo].member.role
      : state.photos[panel.photo].name;
    commit();
  });
  el('panel-reset').addEventListener('click', () => {
    const panel = state.panels[state.selected];
    panel.zoom = 1; panel.panX = 0; panel.panY = 0; panel.flip = false;
    commit();
  });
  el('panel-flip').addEventListener('click', () => {
    state.panels[state.selected].flip = !state.panels[state.selected].flip;
    commit();
  });
  el('panel-swap').addEventListener('click', () => {
    const n = state.panels.length;
    const j = (state.selected + 1) % n;
    const a = state.panels[state.selected].photo;
    state.panels[state.selected].photo = state.panels[j].photo;
    state.panels[j].photo = a;
    commit();
  });
  el('panel-face').addEventListener('click', () => {
    const panel = state.panels[state.selected];
    panel.zoom = 1; panel.panX = 0; panel.panY = 0;
    commit();
  });
  el('panel-name').addEventListener('input', (e) => {
    state.panels[state.selected].name = e.target.value.toUpperCase();
    render();
  });
  el('panel-name').addEventListener('change', commit);

  bindSlider('panel-zoom',
    () => state.panels[state.selected].zoom * 100,
    (v) => { state.panels[state.selected].zoom = v / 100; });
  bindSlider('look-paint', () => state.look.paint, (v) => { state.look.paint = v; });
  bindSlider('look-grade', () => state.look.gradeAmt, (v) => { state.look.gradeAmt = v; });
  bindSlider('look-halftone', () => state.look.halftone, (v) => { state.look.halftone = v; });
  bindSlider('look-grain', () => state.look.grain, (v) => { state.look.grain = v; });
  bindSlider('look-glow', () => state.look.glow, (v) => { state.look.glow = v; });

  el('undo').addEventListener('click', undo);
  el('redo').addEventListener('click', redo);
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      if (e.shiftKey) redo(); else undo();
    }
  });

  buildStrip();
  buildLayouts();
  buildGrades();
  syncUI();
  render();

  return { render, commit, undo, redo, state };
}
