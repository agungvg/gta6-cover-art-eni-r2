// Vice Heat — main.js
// Bootstrap: loads the fonts, builds the default cast, wires the editor.
// Shot mode (?shot=cover / ?shot=editor) renders a single view full-window
// so the maker can screenshot it with headless Chrome — the same draw calls
// the live preview and the PNG export use.

import { defaultState, createEditor, syncPanels } from './editor.js';
import { GRADES, LAYOUTS, drawPoster } from './poster.js';

const params = new URLSearchParams(location.search);
const shot = params.get('shot');

async function ready() {
  try {
    await document.fonts.load('40px Anton');
    await document.fonts.load('40px Pacifico');
    await document.fonts.load('20px "Bebas Neue"');
    await document.fonts.ready;
  } catch (err) {
    // Fonts are local files; if one fails to load the canvas falls back to
    // its generic family and the app still works.
    console.warn('font load:', err);
  }
}

function applyShotParams(state) {
  const layout = Number(params.get('layout'));
  if (Number.isFinite(layout) && layout >= 0 && layout < LAYOUTS.length) {
    state.layout = layout;
  }
  const grade = Number(params.get('grade'));
  if (Number.isFinite(grade) && grade >= 0 && grade < GRADES.length) {
    state.grade = grade;
  }
  const title = params.get('title');
  if (title) state.title = title.toUpperCase();
  const script = params.get('script');
  if (script) state.script = script;
  const tagline = params.get('tagline');
  if (tagline) state.tagline = tagline.toUpperCase();
  const volume = params.get('volume');
  if (volume) state.volume = volume.toUpperCase();
  syncPanels(state);
}

async function boot() {
  await ready();
  const state = defaultState();
  applyShotParams(state);

  if (shot === 'cover') {
    // Full-window cover: hide the editor chrome, draw the poster to the
    // window size. The screenshot of this window IS the exported cover.
    document.body.classList.add('shot-cover');
    const c = document.getElementById('shot-canvas');
    const w = window.innerWidth;
    const h = window.innerHeight;
    c.width = w;
    c.height = h;
    drawPoster(c.getContext('2d'), state, w, h);
    document.title = `Vice Heat — ${state.title} cover`;
    return;
  }

  const ed = createEditor(state);
  window.__viceHeat = { state, editor: ed };
  if (shot === 'editor') {
    document.body.classList.add('shot-editor');
    // Give the layout thumbnails a beat to paint before the screenshot.
    setTimeout(() => ed.render(), 300);
  }
}

boot();
