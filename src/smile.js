// Stylized upper arch: 10 teeth (2nd premolar → 2nd premolar), front view.
// Units: smile units (arch ≈ 330 wide). Teeth hang from the gum line (y = 0) down to the biting edge.
export const NS = 'http://www.w3.org/2000/svg';
export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
const R = Math.PI / 180;

export const TEETH = [
  { w: 30, h: 50, k: 'pm' }, { w: 32, h: 54, k: 'pm' }, { w: 34, h: 66, k: 'c' }, { w: 36, h: 60, k: 'l' }, { w: 44, h: 70, k: 'i' },
  { w: 44, h: 70, k: 'i' }, { w: 36, h: 60, k: 'l' }, { w: 34, h: 66, k: 'c' }, { w: 32, h: 54, k: 'pm' }, { w: 30, h: 50, k: 'pm' },
];
export const BRACKET_LINE = 0.52;      // bracket sits at 52% of the crown height
export const CLEAR_INDEX = 6;          // upper right lateral wears the clear bracket
export const PRE_ATTACHED = [4, 5, 7]; // centrals + right canine are on the wire from the start

export function toothD(t) {
  const { w, h, k } = t, r = w * 0.3;
  if (k === 'c') return `M${-w / 2},0 L${w / 2},0 L${w / 2},${h * 0.6} Q${w / 2},${h * 0.8} ${w * 0.12},${h * 0.97} Q0,${h * 1.02} ${-w * 0.12},${h * 0.97} Q${-w / 2},${h * 0.8} ${-w / 2},${h * 0.6} Z`;
  return `M${-w / 2},0 L${w / 2},0 L${w / 2},${h - r} Q${w / 2},${h} ${w / 2 - r},${h} L${-w / 2 + r},${h} Q${-w / 2},${h} ${-w / 2},${h - r} Z`;
}

// aligned + crowded tooth placements (center x, gum-line y, rotation)
const CROWD = { rot: [-7, 9, -12, 14, -5, 8, -16, 10, -8, 6], dy: [4, -6, 8, -9, 3, -4, 10, -7, 5, -3], dx: [0, 4, 8, -6, 5, -5, 6, -8, -4, 0] };
function alignedXs() {
  const xs = []; let x = 0;
  for (const t of TEETH) { xs.push(x + t.w / 2); x += t.w + 1.5; }
  const tot = x;
  return xs.map((v) => v - tot / 2);
}
const AX = alignedXs();
export function placement(i, a) {
  // a: 0 = crowded, 1 = aligned
  const t = (i - 4.5) / 4.5;
  const ay = (1 - Math.cos(t * 1.3)) * 10;
  const cx = AX[i] * 0.86 + CROWD.dx[i], cy = ay + CROWD.dy[i];
  return { x: lerp(cx, AX[i], a), y: lerp(cy, ay, a), r: lerp(CROWD.rot[i], 0, a) };
}
export function bracketAt(i, p) {
  const h = TEETH[i].h * BRACKET_LINE;
  return { x: p.x - Math.sin(p.r * R) * h, y: p.y + Math.cos(p.r * R) * h, r: p.r };
}

// Catmull-Rom → cubic path through points
export function smoothD(P) {
  if (P.length < 2) return '';
  let d = `M${P[0][0].toFixed(1)},${P[0][1].toFixed(1)}`;
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
}
// dense polyline samples of the same Catmull-Rom curve (for sliding things along a wire)
export function sampleSmooth(P, step = 2) {
  const out = [];
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
    const seglen = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
    const n = Math.max(2, Math.ceil(seglen / step));
    for (let k = 0; k < n; k++) {
      const t = k / n, t2 = t * t, t3 = t2 * t;
      const f = (a, b, c, d) => 0.5 * ((2 * b) + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  out.push(P[P.length - 1]);
  const S = [0];
  for (let i = 1; i < out.length; i++) S.push(S[i - 1] + Math.hypot(out[i][0] - out[i - 1][0], out[i][1] - out[i - 1][1]));
  return { pts: out, S, len: S[S.length - 1] };
}
export function atLen(sm, s) {
  const { pts, S } = sm;
  if (s <= 0) return { x: pts[0][0], y: pts[0][1], a: Math.atan2(pts[1][1] - pts[0][1], pts[1][0] - pts[0][0]) };
  if (s >= sm.len) { const n = pts.length; return { x: pts[n - 1][0], y: pts[n - 1][1], a: Math.atan2(pts[n - 1][1] - pts[n - 2][1], pts[n - 1][0] - pts[n - 2][0]) }; }
  let lo = 0, hi = S.length - 1;
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (S[m] < s) lo = m; else hi = m; }
  const f = (s - S[lo]) / (S[hi] - S[lo] || 1);
  return { x: lerp(pts[lo][0], pts[hi][0], f), y: lerp(pts[lo][1], pts[hi][1], f), a: Math.atan2(pts[hi][1] - pts[lo][1], pts[hi][0] - pts[lo][0]) };
}
export function polyD(pts, from = 0, to = pts.length) {
  if (to - from < 2) return '';
  let d = `M${pts[from][0].toFixed(1)},${pts[from][1].toFixed(1)}`;
  for (let i = from + 1; i < to; i++) d += `L${pts[i][0].toFixed(1)},${pts[i][1].toFixed(1)}`;
  return d;
}

export function el(tag, attrs = {}, parent) {
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(n);
  return n;
}

export const BRACKET_SVG = (clear = false) => clear
  ? '<rect x="-7" y="-7" width="14" height="14" rx="3" class="bk-body bk-clear"/><path d="M-7,0H7" class="bk-slot bk-slot-clear"/><rect x="-4.5" y="-4.5" width="4" height="3" rx="1" class="bk-shine"/>'
  : '<rect x="-7" y="-7" width="14" height="14" rx="3" class="bk-body"/><path d="M-7,0H7" class="bk-slot"/><rect x="-4.5" y="-4.5" width="4" height="3" rx="1" class="bk-shine"/>';

export function smileDefs(defs) {
  if (defs.querySelector('#toothShade')) return;
  defs.insertAdjacentHTML('beforeend', `
    <linearGradient id="toothShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".78" stop-color="#FFFFFF"/><stop offset="1" stop-color="#E6F5FD"/></linearGradient>
    <radialGradient id="archGlow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#69C4F5" stop-opacity=".28"/><stop offset=".6" stop-color="#E6F5FD" stop-opacity=".22"/><stop offset="1" stop-color="#E6F5FD" stop-opacity="0"/></radialGradient>
    <linearGradient id="smileShine" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFFFFF" stop-opacity="0"/><stop offset=".5" stop-color="#FFFFFF" stop-opacity=".95"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></linearGradient>`);
}

// A drawable arch. Teeth + brackets as <g> moved by transform only.
export class Arch {
  constructor(parent, { brackets = true } = {}) {
    this.g = el('g', { class: 'arch' }, parent);
    el('ellipse', { cx: 0, cy: 38, rx: 230, ry: 92, fill: 'url(#archGlow)', class: 'arch-glow' }, this.g);
    this.teethG = el('g', { class: 'teeth' }, this.g);
    this.wire = el('path', { class: 'arch-wire', fill: 'none' }, this.g);
    this.bG = el('g', { class: 'brackets' }, this.g);
    this.teeth = TEETH.map((t, i) => {
      const g = el('g', { class: 'tooth' }, this.teethG);
      el('path', { d: toothD(t), class: 'tooth-body' }, g);
      el('path', { d: `M${-t.w * 0.18},${t.h * 0.2} Q${-t.w * 0.22},${t.h * 0.5} ${-t.w * 0.12},${t.h * 0.78}`, class: 'tooth-hi' }, g);
      return g;
    });
    this.brackets = brackets ? TEETH.map((t, i) => { const g = el('g', { class: 'bk' + (i === CLEAR_INDEX ? ' bk-c' : '') }, this.bG); g.innerHTML = BRACKET_SVG(i === CLEAR_INDEX); return g; }) : [];
  }
  // a = alignment (0 crowded → 1 aligned); returns bracket points
  layout(a) {
    const pts = [];
    for (let i = 0; i < TEETH.length; i++) {
      const p = placement(i, a);
      this.teeth[i].setAttribute('transform', `translate(${p.x.toFixed(2)} ${p.y.toFixed(2)}) rotate(${p.r.toFixed(2)})`);
      pts.push(bracketAt(i, p));
    }
    this.bpts = pts;
    return pts;
  }
  placeBracket(i, x, y, r = 0, s = 1, o = 1) {
    const b = this.brackets[i];
    b.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${r.toFixed(2)}) scale(${s.toFixed(3)})`);
    b.style.opacity = o;
  }
}
