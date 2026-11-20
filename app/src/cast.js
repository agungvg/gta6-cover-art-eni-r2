// Vice Heat — cast.js
// The demo cast: six original characters, each drawn procedurally on canvas.
// No photos of real people, no Rockstar artwork. Every portrait is painted
// by drawPortrait() from the member's parameters, so the same cast can be
// re-posed in any panel, any layout, any grade.

export const CAST = [
  {
    id: 'mara', name: 'MARA VOSS', role: 'THE DRIVER',
    skin: '#c98d64', hair: 'short', hairColor: '#1c1410',
    shirt: '#b3271e', shirtColor: '#b3271e', glasses: 'shades',
    accessory: 'chain', bg: 18, pose: 'lean',
  },
  {
    id: 'rico', name: 'RICO DELGADO', role: 'THE BOSS',
    skin: '#8a5a34', hair: 'slick', hairColor: '#0e0b09',
    shirt: '#e8dcc3', shirtColor: '#e8dcc3', glasses: 'none',
    accessory: 'cigar', bg: 32, pose: 'arms',
  },
  {
    id: 'lena', name: 'LENA MARSH', role: 'THE INSIDER',
    skin: '#e8b48f', hair: 'long', hairColor: '#7a2e12',
    shirt: '#1f6f6b', shirtColor: '#1f6f6b', glasses: 'round',
    accessory: 'earring', bg: 200, pose: 'lean',
  },
  {
    id: 'cole', name: 'COLE BRANN', role: 'THE RIDER',
    skin: '#d9a06f', hair: 'buzz', hairColor: '#2b1d12',
    shirt: '#22252c', shirtColor: '#22252c', glasses: 'shades',
    accessory: 'bandana', bg: 265, pose: 'arms',
  },
  {
    id: 'june', name: 'JUNE OKAFOR', role: 'THE LOOKOUT',
    skin: '#5f3a22', hair: 'afro', hairColor: '#120d0a',
    shirt: '#f2a007', shirtColor: '#f2a007', glasses: 'none',
    accessory: 'earring', bg: 150, pose: 'lean',
  },
  {
    id: 'tino', name: 'TINO REYES', role: 'THE FIXER',
    skin: '#caa06e', hair: 'cap', hairColor: '#111111',
    shirt: '#3a5a2c', shirtColor: '#3a5a2c', glasses: 'shades',
    accessory: 'chain', bg: 350, pose: 'arms',
  },
];

// Where the face sits inside a portrait, in normalised coords. The poster's
// face-aware crop keeps this point inside the panel when it crops or zooms.
export const FACE_ANCHOR = { x: 0.5, y: 0.30 };

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, (n >> 16) + amt));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 255) + amt));
  const b = Math.max(0, Math.min(255, (n & 255) + amt));
  return `rgb(${r},${g},${b})`;
}

// Paint one cast member onto ctx inside the rect (x, y, w, h).
// The figure is drawn from the shoulders up, GTA-poster style: flat colour
// shapes, a hard rim light, and a sunset backdrop with a palm silhouette.
export function drawPortrait(ctx, m, x, y, w, h) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();

  // Backdrop: warm gradient sky in the member's hue, low sun, one palm.
  const sky = ctx.createLinearGradient(x, y, x, y + h);
  sky.addColorStop(0, `hsl(${m.bg}, 78%, 62%)`);
  sky.addColorStop(0.55, `hsl(${(m.bg + 28) % 360}, 85%, 52%)`);
  sky.addColorStop(1, `hsl(${(m.bg + 48) % 360}, 80%, 34%)`);
  ctx.fillStyle = sky;
  ctx.fillRect(x, y, w, h);

  const sunX = x + w * 0.78, sunY = y + h * 0.30, sunR = w * 0.16;
  const sun = ctx.createRadialGradient(sunX, sunY, sunR * 0.1, sunX, sunY, sunR);
  sun.addColorStop(0, 'rgba(255,244,200,0.98)');
  sun.addColorStop(0.6, 'rgba(255,180,90,0.85)');
  sun.addColorStop(1, 'rgba(255,120,60,0)');
  ctx.fillStyle = sun;
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
  ctx.fill();

  // Palm silhouette, right edge.
  ctx.strokeStyle = 'rgba(20,10,20,0.55)';
  ctx.lineWidth = Math.max(2, w * 0.012);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x + w * 0.94, y + h);
  ctx.quadraticCurveTo(x + w * 0.9, y + h * 0.55, x + w * 0.98, y + h * 0.22);
  ctx.stroke();
  for (let i = 0; i < 5; i++) {
    const a = -0.4 - i * 0.45;
    ctx.beginPath();
    ctx.moveTo(x + w * 0.98, y + h * 0.22);
    ctx.quadraticCurveTo(
      x + w * (0.98 + Math.cos(a) * 0.22), y + h * (0.22 + Math.sin(a) * 0.16),
      x + w * (0.98 + Math.cos(a) * 0.34), y + h * (0.22 + Math.sin(a) * 0.3),
    );
    ctx.stroke();
  }

  const cx = x + w * 0.5;
  const headY = y + h * 0.30;
  const headR = w * 0.135;
  const shoulderY = y + h * 0.75;

  // Shoulders / shirt.
  ctx.fillStyle = m.shirtColor;
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.42, y + h);
  ctx.quadraticCurveTo(cx - w * 0.4, shoulderY + h * 0.06, cx - w * 0.2, shoulderY);
  ctx.lineTo(cx + w * 0.2, shoulderY);
  ctx.quadraticCurveTo(cx + w * 0.4, shoulderY + h * 0.06, cx + w * 0.42, y + h);
  ctx.closePath();
  ctx.fill();
  // Shirt shading + collar.
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.2, shoulderY);
  ctx.lineTo(cx, shoulderY + h * 0.1);
  ctx.lineTo(cx + w * 0.2, shoulderY);
  ctx.lineTo(cx + w * 0.1, shoulderY - h * 0.02);
  ctx.lineTo(cx - w * 0.1, shoulderY - h * 0.02);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = shade(m.shirtColor, -40);
  ctx.lineWidth = Math.max(1.5, w * 0.008);
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.1, shoulderY - h * 0.02);
  ctx.lineTo(cx, shoulderY + h * 0.1);
  ctx.lineTo(cx + w * 0.1, shoulderY - h * 0.02);
  ctx.stroke();

  // Neck.
  ctx.fillStyle = shade(m.skin, -18);
  ctx.fillRect(cx - headR * 0.32, headY + headR * 0.75, headR * 0.64, headR * 0.55);

  // Head.
  ctx.fillStyle = m.skin;
  ctx.beginPath();
  ctx.ellipse(cx, headY, headR * 0.82, headR, 0, 0, Math.PI * 2);
  ctx.fill();
  // Rim light on the sun side.
  ctx.strokeStyle = 'rgba(255,220,150,0.85)';
  ctx.lineWidth = Math.max(1.5, w * 0.008);
  ctx.beginPath();
  ctx.ellipse(cx, headY, headR * 0.82, headR, 0, -Math.PI * 0.45, Math.PI * 0.25);
  ctx.stroke();

  // Hair styles.
  ctx.fillStyle = m.hairColor;
  if (m.hair === 'short') {
    ctx.beginPath();
    ctx.ellipse(cx, headY - headR * 0.42, headR * 0.85, headR * 0.62, 0, Math.PI, 0);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx - headR * 0.78, headY - headR * 0.1, headR * 0.14, headR * 0.4, 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + headR * 0.78, headY - headR * 0.1, headR * 0.14, headR * 0.4, -0.15, 0, Math.PI * 2);
    ctx.fill();
  } else if (m.hair === 'slick') {
    ctx.beginPath();
    ctx.ellipse(cx, headY - headR * 0.5, headR * 0.84, headR * 0.5, 0, Math.PI, 0);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx - headR * 0.8, headY - headR * 0.55);
    ctx.quadraticCurveTo(cx, headY - headR * 1.15, cx + headR * 0.8, headY - headR * 0.55);
    ctx.lineTo(cx + headR * 0.8, headY - headR * 0.75);
    ctx.quadraticCurveTo(cx, headY - headR * 0.9, cx - headR * 0.8, headY - headR * 0.75);
    ctx.closePath();
    ctx.fill();
  } else if (m.hair === 'long') {
    ctx.beginPath();
    ctx.ellipse(cx, headY - headR * 0.35, headR * 0.92, headR * 0.66, 0, Math.PI, 0);
    ctx.fill();
    rr(ctx, cx - headR * 0.95, headY - headR * 0.4, headR * 0.3, headR * 2.1, headR * 0.14);
    ctx.fill();
    rr(ctx, cx + headR * 0.65, headY - headR * 0.4, headR * 0.3, headR * 2.1, headR * 0.14);
    ctx.fill();
  } else if (m.hair === 'buzz') {
    ctx.beginPath();
    ctx.ellipse(cx, headY - headR * 0.45, headR * 0.8, headR * 0.42, 0, Math.PI, 0);
    ctx.fill();
  } else if (m.hair === 'afro') {
    ctx.beginPath();
    ctx.arc(cx, headY - headR * 0.35, headR * 1.02, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx - headR * 0.7, headY - headR * 0.1, headR * 0.42, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + headR * 0.7, headY - headR * 0.1, headR * 0.42, 0, Math.PI * 2);
    ctx.fill();
  } else if (m.hair === 'cap') {
    ctx.fillStyle = '#c22a1e';
    ctx.beginPath();
    ctx.ellipse(cx, headY - headR * 0.55, headR * 0.88, headR * 0.45, 0, Math.PI, 0);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx, headY - headR * 0.55, headR * 1.15, headR * 0.16, 0, 0, Math.PI);
    ctx.fill();
    ctx.fillStyle = '#f5f0e0';
    ctx.font = `bold ${Math.max(8, headR * 0.34)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('VH', cx, headY - headR * 0.62);
  }

  // Glasses.
  if (m.glasses === 'shades') {
    ctx.fillStyle = '#0c0c10';
    rr(ctx, cx - headR * 0.72, headY - headR * 0.18, headR * 0.6, headR * 0.42, headR * 0.1);
    ctx.fill();
    rr(ctx, cx + headR * 0.12, headY - headR * 0.18, headR * 0.6, headR * 0.42, headR * 0.1);
    ctx.fill();
    ctx.strokeStyle = '#0c0c10';
    ctx.lineWidth = Math.max(1.5, w * 0.008);
    ctx.beginPath();
    ctx.moveTo(cx - headR * 0.12, headY - headR * 0.02);
    ctx.lineTo(cx + headR * 0.12, headY - headR * 0.02);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillRect(cx - headR * 0.6, headY - headR * 0.14, headR * 0.18, headR * 0.06);
    ctx.fillRect(cx + headR * 0.24, headY - headR * 0.14, headR * 0.18, headR * 0.06);
  } else if (m.glasses === 'round') {
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = Math.max(1.5, w * 0.008);
    ctx.beginPath();
    ctx.arc(cx - headR * 0.4, headY - headR * 0.05, headR * 0.32, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + headR * 0.4, headY - headR * 0.05, headR * 0.32, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - headR * 0.08, headY - headR * 0.05);
    ctx.lineTo(cx + headR * 0.08, headY - headR * 0.05);
    ctx.stroke();
    ctx.fillStyle = 'rgba(180,220,255,0.25)';
    ctx.beginPath();
    ctx.arc(cx - headR * 0.4, headY - headR * 0.05, headR * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + headR * 0.4, headY - headR * 0.05, headR * 0.3, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Eyes + brows.
    ctx.fillStyle = '#1a1210';
    ctx.beginPath();
    ctx.ellipse(cx - headR * 0.34, headY - headR * 0.02, headR * 0.09, headR * 0.06, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + headR * 0.34, headY - headR * 0.02, headR * 0.09, headR * 0.06, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Mouth.
  ctx.strokeStyle = shade(m.skin, -55);
  ctx.lineWidth = Math.max(1.5, w * 0.01);
  ctx.beginPath();
  ctx.moveTo(cx - headR * 0.22, headY + headR * 0.48);
  ctx.quadraticCurveTo(cx, headY + headR * 0.58, cx + headR * 0.22, headY + headR * 0.48);
  ctx.stroke();

  // Accessories.
  if (m.accessory === 'chain') {
    ctx.strokeStyle = '#f2c14e';
    ctx.lineWidth = Math.max(2, w * 0.012);
    ctx.beginPath();
    ctx.moveTo(cx - headR * 0.55, shoulderY + h * 0.02);
    ctx.quadraticCurveTo(cx, shoulderY + h * 0.16, cx + headR * 0.55, shoulderY + h * 0.02);
    ctx.stroke();
  } else if (m.accessory === 'earring') {
    ctx.fillStyle = '#f2c14e';
    ctx.beginPath();
    ctx.arc(cx - headR * 0.82, headY + headR * 0.28, Math.max(2, w * 0.008), 0, Math.PI * 2);
    ctx.fill();
  } else if (m.accessory === 'cigar') {
    ctx.strokeStyle = '#6b4a22';
    ctx.lineWidth = Math.max(3, w * 0.014);
    ctx.beginPath();
    ctx.moveTo(cx + headR * 0.28, headY + headR * 0.52);
    ctx.lineTo(cx + headR * 0.62, headY + headR * 0.42);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,90,40,0.9)';
    ctx.beginPath();
    ctx.arc(cx + headR * 0.62, headY + headR * 0.42, Math.max(2, w * 0.008), 0, Math.PI * 2);
    ctx.fill();
  } else if (m.accessory === 'bandana') {
    ctx.fillStyle = '#c22a1e';
    ctx.fillRect(cx - headR * 0.8, headY - headR * 0.78, headR * 1.6, headR * 0.22);
    ctx.beginPath();
    ctx.moveTo(cx + headR * 0.8, headY - headR * 0.7);
    ctx.lineTo(cx + headR * 1.05, headY - headR * 0.3);
    ctx.lineTo(cx + headR * 0.62, headY - headR * 0.55);
    ctx.closePath();
    ctx.fill();
  }

  // Hard outline for the comic-book read.
  ctx.strokeStyle = 'rgba(20,8,16,0.85)';
  ctx.lineWidth = Math.max(2, w * 0.014);
  ctx.beginPath();
  ctx.ellipse(cx, headY, headR * 0.82, headR, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

// Render one member to a standalone canvas (used for the demo photo strip
// and for face-aware placement: the poster crops from this canvas).
export function portraitCanvas(m, w = 540, h = 720) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  drawPortrait(c.getContext('2d'), m, 0, 0, w, h);
  return c;
}
