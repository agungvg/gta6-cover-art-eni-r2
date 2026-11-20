// Vice Heat — poster.js
// The poster renderer: one draw function renders the live preview and the
// PNG export pixel for pixel. Layouts, grades, furniture, title chrome and
// the Look sliders all live here.

import { drawPortrait, FACE_ANCHOR } from './cast.js';

export const GRADES = [
  {
    name: 'Sunset', bg: 'skyline', accent: '#ffd23f', frame: '#ffb347',
    sky: ['#ff9a3d', '#ff5e62', '#7b2d8b'], sun: '#fff3b0',
    titleTop: '#ffe259', titleBot: '#ffa751', seal: '#f2c14e',
  },
  {
    name: 'Neon Night', bg: 'grid', accent: '#00e5ff', frame: '#00e5ff',
    sky: ['#1b1035', '#4b1d6b', '#ff2e88'], sun: '#ff9de2',
    titleTop: '#7ff7ff', titleBot: '#ff2e88', seal: '#00e5ff',
  },
  {
    name: 'Golden Hour', bg: 'palms', accent: '#ffe259', frame: '#f7b733',
    sky: ['#f7b733', '#fc4a1a', '#7a1f3d'], sun: '#fff8d0',
    titleTop: '#fff3b0', titleBot: '#f7b733', seal: '#f2c14e',
  },
  {
    name: 'Tropic Teal', bg: 'palms', accent: '#a8ff78', frame: '#38ef7d',
    sky: ['#11998e', '#38ef7d', '#0b3d3a'], sun: '#eaffd0',
    titleTop: '#d0ffb3', titleBot: '#38ef7d', seal: '#a8ff78',
  },
  {
    name: 'Heatwave', bg: 'skyline', accent: '#ffb347', frame: '#ff4b2b',
    sky: ['#ff416c', '#ff4b2b', '#3d0c0c'], sun: '#ffe9b0',
    titleTop: '#ffd194', titleBot: '#ff4b2b', seal: '#ffb347',
  },
  {
    name: 'Ultraviolet', bg: 'grid', accent: '#e26bff', frame: '#b967ff',
    sky: ['#8e2de2', '#4a00e0', '#12003a'], sun: '#f3ccff',
    titleTop: '#f3ccff', titleBot: '#8e2de2', seal: '#e26bff',
  },
];

// Panels are normalised rects {x, y, w, h, slant}: slant shifts the top edge
// right by slant * w, giving the diagonal GTA panel cut.
export const LAYOUTS = [
  {
    name: 'Hero Mosaic',
    panels: [
      { x: 0, y: 0, w: 0.62, h: 1, slant: 0.06 },
      { x: 0.62, y: 0, w: 0.38, h: 0.5, slant: -0.05 },
      { x: 0.62, y: 0.5, w: 0.38, h: 0.5, slant: -0.05 },
    ],
  },
  {
    name: 'Hero + Three',
    panels: [
      { x: 0, y: 0, w: 0.58, h: 0.66, slant: 0.05 },
      { x: 0.58, y: 0, w: 0.42, h: 0.33, slant: -0.05 },
      { x: 0.58, y: 0.33, w: 0.42, h: 0.33, slant: -0.05 },
      { x: 0, y: 0.66, w: 1, h: 0.34, slant: 0 },
    ],
  },
  {
    name: 'Six Grid',
    panels: [
      { x: 0, y: 0, w: 0.34, h: 0.5, slant: 0.04 },
      { x: 0.33, y: 0, w: 0.34, h: 0.5, slant: -0.04 },
      { x: 0.66, y: 0, w: 0.34, h: 0.5, slant: 0.04 },
      { x: 0, y: 0.5, w: 0.34, h: 0.5, slant: -0.04 },
      { x: 0.33, y: 0.5, w: 0.34, h: 0.5, slant: 0.04 },
      { x: 0.66, y: 0.5, w: 0.34, h: 0.5, slant: -0.04 },
    ],
  },
  {
    name: 'Diagonal Trio',
    panels: [
      { x: 0, y: 0, w: 1, h: 0.36, slant: 0.12 },
      { x: 0, y: 0.32, w: 1, h: 0.36, slant: -0.12 },
      { x: 0, y: 0.64, w: 1, h: 0.36, slant: 0.12 },
    ],
  },
  {
    name: 'Seven Mosaic',
    panels: [
      { x: 0, y: 0, w: 0.33, h: 0.33, slant: 0.04 },
      { x: 0.33, y: 0, w: 0.34, h: 0.33, slant: -0.04 },
      { x: 0.67, y: 0, w: 0.33, h: 0.33, slant: 0.04 },
      { x: 0, y: 0.33, w: 0.5, h: 0.34, slant: 0.05 },
      { x: 0.5, y: 0.33, w: 0.5, h: 0.34, slant: -0.05 },
      { x: 0, y: 0.67, w: 0.5, h: 0.33, slant: -0.04 },
      { x: 0.5, y: 0.67, w: 0.5, h: 0.33, slant: 0.04 },
    ],
  },
  {
    name: 'Twin Titans',
    panels: [
      { x: 0, y: 0, w: 0.5, h: 1, slant: 0.08 },
      { x: 0.5, y: 0, w: 0.5, h: 1, slant: -0.08 },
    ],
  },
  {
    name: 'Crossfire',
    panels: [
      { x: 0, y: 0, w: 0.52, h: 0.52, slant: 0.1 },
      { x: 0.48, y: 0, w: 0.52, h: 0.52, slant: -0.1 },
      { x: 0, y: 0.48, w: 0.52, h: 0.52, slant: -0.1 },
      { x: 0.48, y: 0.48, w: 0.52, h: 0.52, slant: 0.1 },
    ],
  },
];

function panelPath(ctx, p, W, H) {
  const x = p.x * W, y = p.y * H, w = p.w * W, h = p.h * H;
  const s = p.slant * w;
  ctx.beginPath();
  ctx.moveTo(x + s, y);
  ctx.lineTo(x + w + s, y);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.closePath();
}

// Cover-fit draw of a source canvas/image into a panel rect, keeping the
// face anchor in frame. zoom >= 1, pan in -1..1, flip mirrors horizontally.
// targetY (0..1) is where the face anchor lands inside the panel: 0.5 is
// the panel centre.
function drawCover(ctx, src, dx, dy, dw, dh, anchor, zoom, panX, panY, flip, paint, targetY = 0.5) {
  const sw = src.width, sh = src.height;
  const base = Math.max(dw / sw, dh / sh) * zoom;
  const w = sw * base, h = sh * base;
  // Anchor (in source coords) lands at the target point, then pan shifts it.
  const ax = anchor.x * w, ay = anchor.y * h;
  let ox = dx + dw / 2 - ax + panX * dw * 0.2;
  let oy = dy + dh * targetY - ay + panY * dh * 0.2;
  ctx.save();
  if (paint > 0) ctx.filter = `saturate(${1 + paint / 130}) contrast(${1 + paint / 400})`;
  if (flip) {
    ctx.translate(dx + dw, dy);
    ctx.scale(-1, 1);
    ctx.drawImage(src, ox - dx - dw + 0, oy - dy, w, h);
  } else {
    ctx.drawImage(src, ox, oy, w, h);
  }
  ctx.restore();
}

function drawSkyline(ctx, W, H, color) {
  ctx.fillStyle = color;
  let x = 0;
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  while (x < W) {
    const bw = W * (0.05 + rnd() * 0.07);
    const bh = H * (0.08 + rnd() * 0.2);
    ctx.fillRect(x, H - bh, bw, bh);
    if (rnd() > 0.6) {
      ctx.fillRect(x + bw * 0.3, H - bh - H * 0.05, bw * 0.12, H * 0.05);
    }
    x += bw + W * 0.008;
  }
}

function drawPalm(ctx, x, y, s, color) {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(2, s * 0.03);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x - s * 0.06, y - s * 0.5, x + s * 0.08, y - s * 0.85);
  ctx.stroke();
  for (let i = 0; i < 6; i++) {
    const a = -0.3 - i * 0.42;
    ctx.beginPath();
    ctx.moveTo(x + s * 0.08, y - s * 0.85);
    ctx.quadraticCurveTo(
      x + s * (0.08 + Math.cos(a) * 0.3), y - s * (0.85 + Math.sin(a) * 0.22),
      x + s * (0.08 + Math.cos(a) * 0.48), y - s * (0.85 + Math.sin(a) * 0.42),
    );
    ctx.stroke();
  }
}

function drawGridFloor(ctx, W, H, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1, W * 0.0015);
  const horizon = H * 0.62, cx = W / 2;
  for (let i = -8; i <= 8; i++) {
    ctx.beginPath();
    ctx.moveTo(cx + i * W * 0.06, horizon);
    ctx.lineTo(cx + i * W * 0.22, H);
    ctx.stroke();
  }
  for (let r = 0; r < 6; r++) {
    const t = r / 6;
    const y = horizon + (H - horizon) * t * t;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }
}

function drawBackground(ctx, grade, W, H) {
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, grade.sky[0]);
  sky.addColorStop(0.55, grade.sky[1]);
  sky.addColorStop(1, grade.sky[2]);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  // Sun: solid disc, or striped retro sun on grid grades.
  const sunX = W * 0.76, sunY = H * 0.26, sunR = Math.min(W, H) * 0.13;
  ctx.save();
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
  ctx.clip();
  const sg = ctx.createLinearGradient(0, sunY - sunR, 0, sunY + sunR);
  sg.addColorStop(0, '#fffbe8');
  sg.addColorStop(1, grade.sun);
  ctx.fillStyle = sg;
  ctx.fillRect(sunX - sunR, sunY - sunR, sunR * 2, sunR * 2);
  if (grade.bg === 'grid') {
    ctx.fillStyle = grade.sky[1];
    for (let i = 0; i < 4; i++) {
      const y = sunY + sunR * (0.1 + i * 0.22);
      ctx.fillRect(sunX - sunR, y, sunR * 2, sunR * (0.05 + i * 0.02));
    }
  }
  ctx.restore();

  if (grade.bg === 'skyline') {
    drawSkyline(ctx, W, H, 'rgba(16,6,20,0.72)');
  } else if (grade.bg === 'palms') {
    drawPalm(ctx, W * 0.06, H, Math.min(W, H) * 0.5, 'rgba(16,6,20,0.6)');
    drawPalm(ctx, W * 0.96, H * 0.96, Math.min(W, H) * 0.38, 'rgba(16,6,20,0.55)');
  } else {
    drawGridFloor(ctx, W, H, 'rgba(255,255,255,0.28)');
  }
}

function drawBarcode(ctx, x, y, w, h, digits) {
  ctx.fillStyle = '#f8f4e8';
  ctx.fillRect(x - w * 0.04, y - h * 0.12, w * 1.08, h * 1.45);
  let seed = 1234567;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  let bx = x;
  ctx.fillStyle = '#111';
  while (bx < x + w) {
    const bw = w * (0.012 + rnd() * 0.035);
    if (rnd() > 0.35) ctx.fillRect(bx, y, bw, h);
    bx += bw + w * 0.008;
  }
  ctx.fillStyle = '#111';
  ctx.font = `${Math.max(8, h * 0.22)}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(digits, x + w / 2, y + h * 1.08);
}

function drawStarburst(ctx, cx, cy, r, color, label) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.beginPath();
  const spikes = 14;
  for (let i = 0; i < spikes * 2; i++) {
    const a = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
    const rad = i % 2 === 0 ? r : r * 0.78;
    ctx[i === 0 ? 'moveTo' : 'lineTo'](Math.cos(a) * rad, Math.sin(a) * rad);
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = '#7a5b00';
  ctx.lineWidth = Math.max(1, r * 0.04);
  ctx.stroke();
  ctx.fillStyle = '#231600';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `bold ${r * 0.24}px 'Bebas Neue', sans-serif`;
  ctx.fillText('★ ORIGINAL ★', 0, -r * 0.18);
  ctx.fillText('COVER ART', 0, r * 0.14);
  ctx.font = `${r * 0.2}px 'Bebas Neue', sans-serif`;
  ctx.fillText(label, 0, r * 0.44);
  ctx.restore();
}

function fitFont(ctx, text, maxW, startPx, family, weight = '') {
  let px = startPx;
  ctx.font = `${weight} ${px}px ${family}`;
  while (px > 12 && ctx.measureText(text).width > maxW) {
    px -= 4;
    ctx.font = `${weight} ${px}px ${family}`;
  }
  return px;
}

// The one render function: preview and export are pixel-identical.
export function drawPoster(ctx, st, W, H) {
  const grade = GRADES[st.grade % GRADES.length];
  const layout = LAYOUTS[st.layout % LAYOUTS.length];
  const look = st.look || { paint: 50, gradeAmt: 50, halftone: 0, grain: 0, glow: 50 };
  const u = Math.min(W, H) / 1000; // unit scale

  drawBackground(ctx, grade, W, H);

  // Title metrics up front: the face-avoidance rule needs the title's real
  // rect, not just its band — a face clear of the letters stays put even
  // when it sits low in its panel.
  const titleText = (st.title || 'VICE HEAT').toUpperCase();
  const titlePx = fitFont(ctx, titleText, W * 0.96, Math.min(W, H) * 0.16, 'Anton, sans-serif');
  const titleW = ctx.measureText(titleText).width;
  const titleRect = {
    x0: W / 2 - titleW / 2 - 20 * u, x1: W / 2 + titleW / 2 + 20 * u,
    y0: H * 0.72 - titlePx * 0.62, y1: H * 0.72 + titlePx * 0.62,
  };

  // Panels with the photos, face-aware. A face that would land behind the
  // title letters is pushed below the title when the panel runs deep
  // enough, so the title never swallows a face whole.
  layout.panels.forEach((p, i) => {
    const panel = st.panels[i] || {};
    const photo = st.photos[panel.photo ?? (i % st.photos.length)];
    let targetY = 0.5;
    const fx = (p.x + p.w / 2) * W;
    const fy = (p.y + p.h * targetY) * H;
    const fr = Math.min(W, H) * 0.055;
    if (fy > titleRect.y0 - fr && fy < titleRect.y1 + fr
      && fx > titleRect.x0 - fr && fx < titleRect.x1 + fr) {
      if (p.y + p.h > 0.9) targetY = (0.88 - p.y) / p.h;
      else targetY = (0.56 - p.y) / p.h;
      targetY = Math.max(0.08, Math.min(0.92, targetY));
    }
    panelPath(ctx, p, W, H);
    ctx.save();
    ctx.clip();
    if (photo && photo.canvas) {
      drawCover(ctx, photo.canvas,
        p.x * W, p.y * H, p.w * W, p.h * H,
        photo.anchor || FACE_ANCHOR,
        panel.zoom ?? 1, panel.panX ?? 0, panel.panY ?? 0,
        !!panel.flip, look.paint, targetY);
    } else if (photo && photo.img) {
      drawCover(ctx, photo.img,
        p.x * W, p.y * H, p.w * W, p.h * H,
        photo.anchor || { x: 0.5, y: 0.4 },
        panel.zoom ?? 1, panel.panX ?? 0, panel.panY ?? 0,
        !!panel.flip, look.paint, targetY);
    } else {
      ctx.fillStyle = '#241a2e';
      ctx.fillRect(p.x * W, p.y * H, p.w * W, p.h * H);
    }
    // Bottom shade so the title stays readable over the art.
    const shadeGrad = ctx.createLinearGradient(0, H * 0.55, 0, H);
    shadeGrad.addColorStop(0, 'rgba(10,4,14,0)');
    shadeGrad.addColorStop(1, 'rgba(10,4,14,0.55)');
    ctx.fillStyle = shadeGrad;
    ctx.fillRect(p.x * W, p.y * H, p.w * W, p.h * H);
    ctx.restore();

    // Panel border.
    panelPath(ctx, p, W, H);
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = Math.max(2, 3 * u);
    ctx.stroke();

    // Slanted role tag ON the panel.
    const tag = panel.name || (photo && photo.member ? photo.member.role : `PANEL ${i + 1}`);
    const tagH = 34 * u, tagW = Math.min(p.w * W * 0.8, tag.length * 13 * u + 36 * u);
    const tx = p.x * W + p.slant * p.w * W + 10 * u, ty = p.y * H + 10 * u;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(tx + 10 * u, ty);
    ctx.lineTo(tx + tagW, ty);
    ctx.lineTo(tx + tagW - 10 * u, ty + tagH);
    ctx.lineTo(tx, ty + tagH);
    ctx.closePath();
    ctx.fillStyle = grade.accent;
    ctx.fill();
    ctx.fillStyle = '#160a12';
    ctx.font = `${Math.max(10, 20 * u)}px 'Bebas Neue', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(tag, tx + tagW / 2, ty + tagH / 2 + 1);
    ctx.restore();
  });

  // Press quote across the top, on a dark scrim so it reads over any sky.
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  const qy = H * 0.045;
  const qpx = fitFont(ctx, `“${st.quote}”`, W * 0.86, 30 * u, "'Bebas Neue', sans-serif");
  ctx.save();
  ctx.fillStyle = 'rgba(12,6,16,0.55)';
  rr(ctx, W * 0.05, qy - 30 * u, W * 0.9, qpx * 1.15 + 62 * u, 10 * u);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = '#ffd23f';
  ctx.font = `${Math.max(12, 22 * u)}px sans-serif`;
  ctx.fillText('★★★★★', W / 2, qy);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(`“${st.quote}”`, W / 2, qy + qpx * 1.15);
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.font = `${Math.max(9, 15 * u)}px 'Bebas Neue', sans-serif`;
  ctx.fillText(`— ${st.outlet}`, W / 2, qy + qpx * 1.15 + 20 * u);

  // Volume badge, top right.
  const vol = st.volume || 'VOL. 1';
  ctx.font = `${Math.max(10, 19 * u)}px 'Bebas Neue', sans-serif`;
  const vw = ctx.measureText(vol).width + 22 * u;
  ctx.save();
  ctx.fillStyle = 'rgba(12,6,16,0.72)';
  ctx.strokeStyle = grade.accent;
  ctx.lineWidth = Math.max(1.5, 2 * u);
  rr(ctx, W - vw - 16 * u, H * 0.018, vw, 30 * u, 4 * u);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = grade.accent;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(vol, W - vw / 2 - 16 * u, H * 0.018 + 15 * u);
  ctx.restore();

  // Tagline strip across the middle, between two triangles.
  const tagY = H * 0.585;
  ctx.fillStyle = 'rgba(12,6,16,0.78)';
  ctx.fillRect(W * 0.06, tagY - 17 * u, W * 0.88, 34 * u);
  ctx.fillStyle = grade.accent;
  ctx.beginPath();
  ctx.moveTo(W * 0.045, tagY);
  ctx.lineTo(W * 0.06, tagY - 10 * u);
  ctx.lineTo(W * 0.06, tagY + 10 * u);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(W * 0.955, tagY);
  ctx.lineTo(W * 0.94, tagY - 10 * u);
  ctx.lineTo(W * 0.94, tagY + 10 * u);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  const tpx = fitFont(ctx, st.tagline, W * 0.84, 26 * u, "'Bebas Neue', sans-serif");
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(st.tagline, W / 2, tagY + 1);

  // Huge striped-chrome title ON the art.
  const title = titleText;
  const titleY = H * 0.72;
  const tSize = titlePx;
  ctx.font = `${tSize}px Anton, sans-serif`;
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const grad = ctx.createLinearGradient(0, titleY - tSize * 0.5, 0, titleY + tSize * 0.5);
  const stripes = 7;
  for (let i = 0; i < stripes; i++) {
    grad.addColorStop(i / stripes, i % 2 === 0 ? grade.titleTop : grade.titleBot);
    grad.addColorStop((i + 0.92) / stripes, i % 2 === 0 ? grade.titleTop : grade.titleBot);
  }
  ctx.shadowColor = grade.accent;
  ctx.shadowBlur = (look.glow / 100) * 34 * u;
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#14060f';
  ctx.lineWidth = Math.max(3, tSize * 0.09);
  ctx.strokeText(title, W / 2, titleY);
  ctx.shadowBlur = 0;
  ctx.fillStyle = grad;
  ctx.fillText(title, W / 2, titleY);
  // Hard drop shadow pass underneath the chrome.
  ctx.restore();

  // Script subtitle overlapping the title.
  ctx.save();
  ctx.translate(W / 2, titleY + tSize * 0.52);
  ctx.rotate(-0.045);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const sSize = fitFont(ctx, st.script || 'one last summer', W * 0.7, Math.min(W, H) * 0.062, 'Pacifico, cursive');
  ctx.shadowColor = grade.accent;
  ctx.shadowBlur = (look.glow / 100) * 22 * u + 6;
  ctx.fillStyle = grade.accent;
  ctx.fillText(st.script || 'one last summer', 0, 0);
  ctx.restore();

  // Starburst seal over the art, right side.
  drawStarburst(ctx, W * 0.86, H * 0.44, Math.min(W, H) * 0.068, grade.seal, 'EST. 2026');

  // COMING SOON, bottom left.
  ctx.save();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.shadowColor = grade.accent;
  ctx.shadowBlur = (look.glow / 100) * 16 * u + 4;
  ctx.fillStyle = grade.accent;
  const cpx = fitFont(ctx, 'COMING SOON', W * 0.3, 30 * u, "'Bebas Neue', sans-serif");
  ctx.fillText('COMING SOON', W * 0.035, H - 26 * u);
  ctx.restore();

  // Billing block, bottom centre.
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.font = `${Math.max(8, 13.5 * u)}px 'Bebas Neue', sans-serif`;
  ctx.fillText('A GOLDEN REEL PICTURES PRODUCTION  ·  STARRING YOU', W / 2, H - 40 * u);
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.font = `${Math.max(7, 11.5 * u)}px 'Bebas Neue', sans-serif`;
  ctx.fillText('SHOT ON YOUR OWN CAMERA  ·  GRADED BY HAND', W / 2, H - 24 * u);

  // Barcode, bottom right.
  drawBarcode(ctx, W * 0.9, H - 52 * u, W * 0.075, 26 * u, '8 501234 567890');

  // Grade tint (Look: Grade).
  if (look.gradeAmt > 0) {
    ctx.save();
    ctx.globalCompositeOperation = 'overlay';
    ctx.globalAlpha = (look.gradeAmt / 100) * 0.22;
    ctx.fillStyle = grade.accent;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  // Halftone dots (Look: Halftone).
  if (look.halftone > 0) {
    ctx.save();
    ctx.fillStyle = `rgba(0,0,0,${(look.halftone / 100) * 0.16})`;
    const step = Math.max(6, W / 110);
    for (let yy = step / 2; yy < H; yy += step) {
      for (let xx = step / 2; xx < W; xx += step) {
        ctx.beginPath();
        ctx.arc(xx, yy, step * 0.14, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  // Grain (Look: Grain).
  if (look.grain > 0) {
    ctx.save();
    ctx.globalAlpha = (look.grain / 100) * 0.5;
    const gw = 160, gh = 160;
    const nc = document.createElement('canvas');
    nc.width = gw; nc.height = gh;
    const nctx = nc.getContext('2d');
    const img = nctx.createImageData(gw, gh);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.floor(Math.random() * 255);
      img.data[i] = v; img.data[i + 1] = v; img.data[i + 2] = v; img.data[i + 3] = 28;
    }
    nctx.putImageData(img, 0, 0);
    const pat = ctx.createPattern(nc, 'repeat');
    ctx.fillStyle = pat;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  // Frame: dark outer + bright inner, edge to edge.
  ctx.strokeStyle = '#0d0d12';
  ctx.lineWidth = Math.max(4, 14 * u);
  ctx.strokeRect(0, 0, W, H);
  ctx.strokeStyle = grade.frame;
  ctx.lineWidth = Math.max(1.5, 3.5 * u);
  ctx.strokeRect(9 * u, 9 * u, W - 18 * u, H - 18 * u);
}

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Render a poster state to a fresh canvas at export size.
export function renderPoster(state, W, H) {
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  drawPoster(c.getContext('2d'), state, W, H);
  return c;
}
