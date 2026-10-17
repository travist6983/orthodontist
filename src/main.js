import './style.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import Lenis from 'lenis';
import { Arch, TEETH, PRE_ATTACHED, CLEAR_INDEX, BRACKET_SVG, placement, bracketAt, smoothD, sampleSmooth, atLen, polyD, el, smileDefs, clamp, lerp } from './smile.js';
import { initUI } from './ui.js';

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

const RM = document.documentElement.classList.contains('rm');
const DEBUG = /[?&]debug=1/.test(location.search);
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const E = { io: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2), o: (t) => 1 - Math.pow(1 - t, 3), i: (t) => t * t * t };
const seg = (t, a, b) => clamp((t - a) / (b - a));
const docY = (r) => r.top + window.scrollY;

let G = {};
function geom() {
  const W = document.documentElement.clientWidth, H = window.innerHeight;
  return { W, H, mob: W < 900, amp: W < 900 ? 0.62 : 1, lambda: W < 900 ? 84 : 112 };
}

// ======================================================================= HERO
const hero = { sec: $('#hero'), stage: $('.hero-stage'), box: $('#heroSmile'), u: 0 };
function buildHero() {
  hero.stage.querySelector('svg.hero-svg')?.remove();
  const svg = el('svg', { class: 'hero-svg', 'aria-hidden': 'true' });
  hero.stage.insertBefore(svg, hero.stage.querySelector('.wrap'));
  smileDefs(el('defs', {}, svg));
  const sr = hero.stage.getBoundingClientRect();
  const b = hero.box.getBoundingClientRect();
  const k = Math.min(b.width / (G.mob ? 372 : 330), b.height / 96);
  const cx = b.left - sr.left + b.width / 2, cy = b.top - sr.top + b.height / 2 - 34 * k;
  hero.k = k; hero.cx = cx; hero.cy = cy;
  svg.setAttribute('viewBox', `0 0 ${sr.width} ${sr.height}`);
  svg.setAttribute('width', sr.width); svg.setAttribute('height', sr.height);
  const g = el('g', { transform: `translate(${cx.toFixed(1)} ${cy.toFixed(1)}) scale(${k.toFixed(4)})` }, svg);
  hero.arch = new Arch(g, { brackets: false });
  const bp = hero.arch.layout(0);
  // wire: right end → through every bracket line (right to left) → left end → drops to the page-wire start
  const S = (p) => [cx + p.x * k, cy + p.y * k];
  const R = S({ x: bp[9].x + 26, y: bp[9].y - 4 }), L = S({ x: bp[0].x - 26, y: bp[0].y - 4 });
  const exitX = G.spineX0, exitY = sr.height + 4;
  const pts = [R, ...bp.slice().reverse().map(S), L,
    [L[0] - 26 * k, L[1] + 34 * k], [lerp(L[0], exitX, 0.55), lerp(L[1], exitY, 0.62)], [exitX, exitY]];
  hero.sm = sampleSmooth(pts, 3);
  // material offsets of the three pre-attached brackets (measured from the right end)
  hero.mat = PRE_ATTACHED.map((i) => {
    const q = S(bp[i]); let best = 0, bd = 1e9;
    hero.sm.pts.forEach((p, j) => { const d = (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2; if (d < bd) { bd = d; best = j; } });
    return { i, s: hero.sm.S[best] };
  });
  // the wire at rest spans the arch plus a short stub past the left end
  const Lp = L; let li = 0, bd = 1e9; hero.sm.pts.forEach((p, j) => { const d = (p[0] - Lp[0]) ** 2 + (p[1] - Lp[1]) ** 2; if (d < bd) { bd = d; li = j; } });
  hero.restLen = hero.sm.S[li] + 26 * k;
  hero.wire = el('path', { class: 'wire hero-wire', fill: 'none' }, svg);
  hero.bks = hero.mat.map(() => { const n = el('g', { class: 'bk' }, svg); n.innerHTML = BRACKET_SVG(false); return n; });
  hero.svg = svg;
  renderHero(RM ? 0 : hero.u, true);
}
function renderHero(u, force) {
  if (!hero.sm) return;
  if (!force && Math.abs(u - hero.ru) < 0.0005) return;
  hero.ru = u;
  const sm = hero.sm, len = sm.len;
  // the wire slides along its own path: the right end pulls back through the brackets,
  // the left end drops down the tail and out of the stage into the page
  const D = E.io(seg(u, 0.04, 1)) * len;
  const front = Math.min(len, D + hero.restLen);
  let i0 = 0; while (i0 < sm.S.length - 1 && sm.S[i0] < D) i0++;
  let i1 = i0; while (i1 < sm.S.length - 1 && sm.S[i1] < front) i1++;
  hero.wire.setAttribute('d', polyD(sm.pts, Math.max(0, i0 - 1), Math.min(sm.pts.length, i1 + 1)));
  hero.mat.forEach((m, j) => {
    const s = m.s + D;
    const n = hero.bks[j];
    if (s > len - 2) { n.style.opacity = 0; return; }
    const p = atLen(sm, s);
    let a = (p.a * 180) / Math.PI; if (a > 90) a -= 180; if (a < -90) a += 180;
    n.style.opacity = 1;
    n.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${a.toFixed(1)}) scale(${(hero.k * 1.05).toFixed(3)})`);
  });
  const gh = seg(u, 0.14, 0.62);
  hero.arch.g.style.setProperty('--ghost', gh.toFixed(3));
}

// ======================================================================= PAGE WIRE
const layer = $('#wireLayer');
const W = { route: null, bks: [], cards: [] };
function buildRoute() {
  const g = G, pts = [];
  const r = (sel) => $(sel).getBoundingClientRect();
  const heroB = docY(hero.sec.getBoundingClientRect()) + hero.sec.offsetHeight;
  const cardsR = r('.cards'), phil = r('.philosophy .vid'), sched = r('#npSched'), npR = r('.newpatient'), test = r('.testimonials .vid');
  const testS = r('.testimonials'), doc = r('.doc-panel'), adult = r('.aud-adult'), seven = r('.aud-seven'), aud = r('.aud-grid'), op = r('.op-panel'), fin = r('#locations');
  const Y = (rc, f = 0) => docY(rc) + rc.height * f;
  const X0 = g.spineX0;
  if (!g.mob) {
    const gl = Math.max(26, phil.left / 2), gr = Math.min(g.W - 26, (test.right + g.W) / 2);
    const gapX = (adult.right + seven.left) / 2;
    pts.push([X0, heroB], [X0, Y(cardsR, 0.02)], [X0, Y(cardsR, 0.5)], [X0, Y(cardsR, 1) + 10]);
    pts.push([lerp(X0, gl, 0.6), Y(phil, 0) - 70], [gl, Y(phil, 0.2)], [gl, Y(phil, 0.8)], [gl, Y(phil, 1) + 60]);
    const uy = Y(sched, 1) + 15;
    pts.push([gl, uy - 70], [gl + 60, uy], [sched.left - 6, uy + 1], [sched.left + sched.width / 2, uy - 3], [sched.right + 6, uy + 1], [Math.min(g.W - 60, sched.right + 120), uy + 24]);
    pts.push([gr, Math.max(uy + 140, Y(testS, 0) - 20)], [gr, Y(test, 0.3)], [gr, Y(test, 1)], [gr, Y(doc, 0.5)], [gr, Y(doc, 1) + 24]);
    pts.push([lerp(gr, gapX, 0.7), Y(aud, 0) - 20], [gapX, Y(aud, 0) + 30], [gapX, Y(aud, 0.6)], [gapX, Y(aud, 1) + 10]);
    const fx = g.finEntryX;
    pts.push([gapX, Y(op, 0.5)], [lerp(gapX, fx, 0.5), Y(op, 1) + 30], [fx, Y(fin, 0) - 40], [fx, Y(fin, 0) + 2]);
  } else {
    // phones: one left gutter, straight down (the CTA stack is too tight for an underline)
    const gx = 18;
    pts.push([X0, heroB], [gx, heroB + 40], [gx, Y(cardsR, 0.5)], [gx, Y(npR, 0.5)], [gx, Y(aud, 0.5)], [gx, Y(op, 1)], [lerp(gx, g.finEntryX, 0.6), Y(fin, 0) - 40], [g.finEntryX, Y(fin, 0) + 2]);
  }
  const sm = sampleSmooth(pts, 6);
  // normals + running max of y (for fast lookups by scroll position)
  const N = sm.pts.length, nx = new Float32Array(N), ny = new Float32Array(N), ymax = new Float32Array(N);
  let m = -1e9;
  for (let i = 0; i < N; i++) {
    const a = sm.pts[Math.max(0, i - 1)], b = sm.pts[Math.min(N - 1, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
    nx[i] = -dy / l; ny[i] = dx / l;
    m = Math.max(m, sm.pts[i][1]); ymax[i] = m;
  }
  W.route = { ...sm, nx, ny, ymax };
  // waviness keyframes (doc y of the reading line → amplitude in px)
  W.ampKeys = [
    [heroB, 6], [Y(cardsR, 1), 16], [Y(npR, 0.4), 13], [Y(testS, 0), 9], [Y(doc, 0), 6], [Y(aud, 0), 2], [Y(op, 0), 0.6], [Y(fin, 0), 0],
  ];
}
const idxAtY = (y) => { const a = W.route.ymax; let lo = 0, hi = a.length - 1; if (y <= a[0]) return 0; if (y >= a[hi]) return hi; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (a[m] < y) lo = m; else hi = m; } return hi; };
function ampAt(y) {
  const K = W.ampKeys;
  if (y <= K[0][0]) return K[0][1] * G.amp;
  for (let i = 0; i < K.length - 1; i++) if (y < K[i + 1][0]) return lerp(K[i][1], K[i + 1][1], E.io((y - K[i][0]) / (K[i + 1][0] - K[i][0]))) * G.amp;
  return 0;
}
function wireXY(i, A) {
  const R = W.route, s = R.S[i];
  const taper = Math.min(1, s / 160);
  const o = A * taper * Math.sin((s / G.lambda) * Math.PI * 2);
  return [R.pts[i][0] + R.nx[i] * o, R.pts[i][1] + R.ny[i] * o];
}
function wireAtS(s, A) {
  const R = W.route; let lo = 0, hi = R.S.length - 1;
  if (s <= 0) lo = hi = 0; else if (s >= R.len) lo = hi = R.S.length - 1;
  else while (hi - lo > 1) { const m = (lo + hi) >> 1; if (R.S[m] < s) lo = m; else hi = m; }
  const a = wireXY(lo, A), b = wireXY(hi, A), f = hi === lo ? 0 : (s - R.S[lo]) / (R.S[hi] - R.S[lo]);
  return { x: lerp(a[0], b[0], f), y: lerp(a[1], b[1], f), a: Math.atan2(b[1] - a[1], b[0] - a[0]) };
}
function buildWire() {
  layer.innerHTML = '';
  const H = document.documentElement.scrollHeight;
  layer.setAttribute('width', G.W); layer.setAttribute('height', H);
  layer.setAttribute('viewBox', `0 0 ${G.W} ${H}`);
  layer.style.height = H + 'px';
  smileDefs(el('defs', {}, layer));
  W.halo = el('path', { class: 'wire-halo', fill: 'none' }, layer);
  W.path = el('path', { class: 'wire page-wire', fill: 'none' }, layer);
  W.tip = el('circle', { class: 'wire-tip', r: 3.2 }, layer);
  buildRoute();
  // brackets: 3 riding in from the hero, then one per Havens Difference card
  W.bks = [];
  const k = hero.k * 1.05;
  hero.mat.forEach((m) => {
    const n = el('g', { class: 'bk' }, layer); n.innerHTML = BRACKET_SVG(false);
    W.bks.push({ n, s: m.s, scale: Math.max(0.9, k), pre: true });
  });
  W.cards = $$('.difference .card').map((card, j) => {
    const icon = card.querySelector('.brk');
    const ir = icon.getBoundingClientRect();
    const iy = docY(ir) + ir.height / 2, ix = ir.left + ir.width / 2;
    const s = W.route.S[idxAtY(iy)];
    const n = el('g', { class: 'bk' + (j === 4 ? ' bk-c' : '') }, layer); n.innerHTML = BRACKET_SVG(j === 4);
    const o = { n, s, card, icon, iy, ix, scale: G.mob ? 1.15 : 1.5 };
    W.bks.push(o);
    return o;
  });
}
let wireLast = { y: -1, A: -1 };
function renderWire(force) {
  if (!W.route) return;
  const sy = window.scrollY, H = G.H;
  const read = sy + H * 0.66;
  const A = ampAt(read);
  if (!force && Math.abs(read - wireLast.y) < 0.5 && Math.abs(A - wireLast.A) < 0.05) return;
  wireLast = { y: read, A };
  const R = W.route;
  const iTip = idxAtY(read);
  const iTop = idxAtY(sy - 160);
  if (iTip <= 1 || R.pts[0][1] > read) { W.path.setAttribute('d', ''); W.halo.setAttribute('d', ''); W.tip.style.opacity = 0; }
  else {
    let d = '';
    for (let i = Math.max(0, iTop - 2); i <= iTip; i++) { const p = wireXY(i, A); d += (d ? 'L' : 'M') + p[0].toFixed(1) + ',' + p[1].toFixed(1); }
    W.path.setAttribute('d', d); W.halo.setAttribute('d', d);
    const t = wireXY(iTip, A);
    W.tip.setAttribute('cx', t[0].toFixed(1)); W.tip.setAttribute('cy', t[1].toFixed(1));
    W.tip.style.opacity = iTip >= R.pts.length - 2 ? 0 : 1;
  }
  const sTip = R.S[iTip];
  for (const b of W.bks) {
    const p = wireAtS(b.s, A);
    let ang = (p.a * 180) / Math.PI; if (ang > 90) ang -= 180; if (ang < -90) ang += 180;
    if (b.pre) {
      const on = b.s < sTip;
      b.n.style.opacity = on ? 1 : 0;
      if (on) b.n.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${ang.toFixed(1)}) scale(${b.scale.toFixed(3)})`);
      continue;
    }
    // card bracket: slides out from its card and clicks onto the wire level with it
    const vy = b.iy - sy;
    const c = clamp((H * 0.86 - vy) / (H * 0.26));
    const e = E.io(c);
    const x = lerp(b.ix, p.x, e), y = lerp(b.iy, p.y, e);
    const pop = c > 0.86 ? 1 + 0.35 * Math.sin(seg(c, 0.86, 1) * Math.PI) : 1;
    b.n.style.opacity = c > 0.02 ? 1 : 0;
    b.n.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(ang * e).toFixed(1)}) scale(${(b.scale * pop).toFixed(3)})`);
    b.icon.style.opacity = (1 - seg(c, 0.05, 0.4)).toFixed(2);
    b.card.classList.toggle('is-clicked', c >= 1);
  }
}

// ======================================================================= FINALE
const fin = { sec: $('#locations'), stage: $('.fin-stage'), box: $('#finSmile'), v: 0 };
function buildFinale() {
  fin.stage.querySelector('svg.fin-svg')?.remove();
  const svg = el('svg', { class: 'fin-svg', 'aria-hidden': 'true' });
  fin.stage.insertBefore(svg, fin.stage.firstChild);
  const defs = el('defs', {}, svg);
  smileDefs(defs);
  const sr = fin.stage.getBoundingClientRect(), b = fin.box.getBoundingClientRect();
  svg.setAttribute('viewBox', `0 0 ${sr.width} ${sr.height}`);
  svg.setAttribute('width', sr.width); svg.setAttribute('height', sr.height);
  // fit the arch, and keep the entry drop (left of the first tooth) on screen
  const k = Math.min(b.width / (G.mob ? 420 : 360), b.height / 112, (sr.width / 2 - 14) / 232);
  const cx = sr.width / 2, cy = b.top - sr.top + b.height / 2 - 36 * k;
  Object.assign(fin, { k, cx, cy, svg });
  const g = el('g', { transform: `translate(${cx.toFixed(1)} ${cy.toFixed(1)}) scale(${k.toFixed(4)})` }, svg);
  fin.g = g;
  fin.arch = new Arch(g, { brackets: true });
  fin.wire = fin.arch.wire; fin.wire.setAttribute('class', 'wire fin-wire'); // order: teeth → wire → brackets
  // light sweep clipped to the aligned teeth
  const clip = el('clipPath', { id: 'alignedTeeth' }, defs);
  TEETH.forEach((t, i) => { const p = placement(i, 1); el('path', { d: fin.arch.teeth[i].firstChild.getAttribute('d'), transform: `translate(${p.x} ${p.y})` }, clip); });
  fin.shine = el('rect', { x: -260, y: -10, width: 120, height: 110, fill: 'url(#smileShine)', 'clip-path': 'url(#alignedTeeth)', opacity: 0 }, fin.arch.teethG);
  fin.aligned = TEETH.map((t, i) => bracketAt(i, placement(i, 1)));
  fin.L = { x: fin.aligned[0].x - 30, y: fin.aligned[0].y - 6 };
  G.finEntryX = cx + (fin.L.x - 18) * k;
  renderFinale(RM ? 1 : fin.v, true);
}
function renderFinale(v, force) {
  if (!fin.arch) return;
  if (!force && Math.abs(v - fin.rv) < 0.0005) return;
  fin.rv = v;
  const k = fin.k, cx = fin.cx, cy = fin.cy;
  const a = E.io(seg(v, 0.52, 0.84));
  const cur = fin.arch.layout(a);
  // ghost → solid teeth
  const ghostIn = seg(v, 0.36, 0.52), fill = seg(v, 0.6, 0.88);
  fin.arch.teethG.style.opacity = ghostIn.toFixed(3);
  fin.arch.g.style.setProperty('--ghost', (1 - fill).toFixed(3));
  // brackets glide down the incoming wire (a vertical drop into the arch's left end), left to right onto their teeth
  const L = fin.L;
  const topY = (-40 - cy) / k, ex = L.x - 18;
  const ctrl = [];
  for (let j = 0; j < 10; j++) {
    const q = E.io(seg(v, 0.06 + j * 0.036, 0.24 + j * 0.036));
    const tgt = cur[j];
    let x, y, r = 0;
    if (q < 0.5) { const f = E.o(q / 0.5); x = ex; y = lerp(topY + 40 / k - (j + 1) * 30, L.y - 26, f); }
    else { const f = (q - 0.5) / 0.5; x = lerp(ex, tgt.x, f); y = lerp(L.y - 26, tgt.y, f) - Math.sin(f * Math.PI) * 8; r = tgt.r * f; }
    fin.arch.placeBracket(j, x, y, r, 1.05, y > topY + 10 ? 1 : 0);
    // wire control point: smooth arch until this bracket arrives, then it bends through it
    const arrived = seg(q, 0.88, 1);
    const sm = fin.aligned[j];
    ctrl.push([lerp(sm.x, tgt.x, arrived), lerp(sm.y, tgt.y, arrived)]);
  }
  const S = (p) => p; // wire lives inside the arch group (local units)
  const Rend = [fin.aligned[9].x + 30, fin.aligned[9].y - 6];
  const reach = seg(v, 0, 0.2);
  // the wire is already hanging into the stage at v = 0, then threads along the arch
  const P = [S([ex, topY]), S([ex, lerp(topY + 120 / k, L.y - 30, reach)])];
  if (reach > 0) {
    P.push(S([L.x, L.y]));
    const arch = [...ctrl, Rend];
    const n = Math.max(1, Math.round(reach * arch.length));
    P.push(...arch.slice(0, n).map(S));
  }
  fin.wire.setAttribute('d', smoothD(P));
  fin.wire.style.strokeWidth = ((2.6 * Math.max(1, k * 0.62)) / k).toFixed(3);
  const sh = seg(v, 0.86, 0.99);
  fin.shine.setAttribute('opacity', sh > 0 && sh < 1 ? 1 : 0);
  fin.shine.setAttribute('x', lerp(-260, 160, sh).toFixed(1));
  fin.sec.style.setProperty('--fin', v.toFixed(3));
}

// ======================================================================= VIDEOS
function initVideos() {
  $$('.vid').forEach((box) => {
    const btn = box.querySelector('.vid-play');
    btn.addEventListener('click', () => {
      const img = box.querySelector('img');
      const v = document.createElement('video');
      v.controls = true; v.playsInline = true; v.preload = 'auto';
      v.poster = img.dataset.src || img.currentSrc || img.src;
      v.src = box.dataset.src;
      v.setAttribute('aria-label', btn.getAttribute('aria-label').replace('Play ', ''));
      box.replaceChildren(v);
      box.classList.add('is-playing');
      v.play().catch(() => {});
      v.focus();
    });
  });
  // hero ambient video: decorative, muted, loads after first paint, pausable
  const hv = $('#heroVideo'), tg = $('#heroVidToggle');
  if (RM || !hv) return;
  const start = () => {
    hv.poster = hv.dataset.poster;
    hv.src = hv.dataset.src;
    tg.hidden = false;
    const io = new IntersectionObserver(([e]) => { if (tg.getAttribute('aria-pressed') === 'true') return; if (e.isIntersecting) hv.play().catch(() => {}); else hv.pause(); });
    io.observe(hero.sec);
  };
  const idle = window.requestIdleCallback || ((f) => setTimeout(f, 1200));
  if (document.readyState === 'complete') idle(start); else window.addEventListener('load', () => idle(start));
  tg.addEventListener('click', () => {
    const paused = tg.getAttribute('aria-pressed') === 'true';
    tg.setAttribute('aria-pressed', String(!paused));
    tg.setAttribute('aria-label', paused ? 'Pause background video' : 'Play background video');
    if (paused) hv.play().catch(() => {}); else hv.pause();
  });
}

// ======================================================================= LAYOUT + LOOP
function layout(heroOnly = false) {
  G = geom();
  const cr = $('.cards').getBoundingClientRect();
  G.spineX0 = G.mob ? 18 : cr.left + cr.width / 2;
  buildHero();
  if (heroOnly) return;
  buildFinale();
  if (!RM) { buildWire(); renderWire(true); }
  ready = true;
}
let ready = false;
const idle = (f) => (window.requestIdleCallback ? requestIdleCallback(f, { timeout: 900 }) : setTimeout(f, 300));
function frame() {
  renderHero(hero.u);
  if (!ready) return;
  renderFinale(fin.v);
  renderWire();
}

// below-the-hero images load only as they approach the viewport (nothing competes with the H1 at first paint)
function initLazy() {
  const imgs = $$('img[data-src]');
  const load = (img) => { img.src = img.dataset.src; img.removeAttribute('data-src'); };
  if (!('IntersectionObserver' in window)) return imgs.forEach(load);
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { load(e.target); io.unobserve(e.target); } }), { rootMargin: '900px 0px' });
  imgs.forEach((i) => io.observe(i));
}
function boot() {
  initUI();
  initLazy();
  initVideos();
  if (RM) {
    layout(true);
    idle(() => layout());
    window.addEventListener('resize', debounce(layout, 200));
    return;
  }
  const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
  if (DEBUG) window.__lenis = lenis;
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => { lenis.raf(t * 1000); frame(); });
  gsap.ticker.lagSmoothing(0);

  // first paint: only the hero smile; the page wire + finale build when the main thread is idle
  layout(true);
  idle(() => { layout(); frame(); });
  ScrollTrigger.create({ trigger: hero.sec, start: 'top top', end: 'bottom bottom', onUpdate: (s) => { hero.u = s.progress; } });
  ScrollTrigger.create({ trigger: fin.sec, start: 'top top', end: 'bottom bottom', onUpdate: (s) => { fin.v = s.progress; } });
  ScrollTrigger.create({ start: 60, end: 'max', onToggle: (s) => document.documentElement.classList.toggle('scrolled', s.isActive) });
  // anchor links scroll smoothly
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute('href').length < 2) return;
    const t = $(a.getAttribute('href'));
    if (t) { e.preventDefault(); lenis.scrollTo(t, { offset: -70 }); }
  });
  if (DEBUG) window.__go = (sel, f = 0) => { const n = typeof sel === 'string' ? $(sel) : sel; const top = docY(n.getBoundingClientRect()); const y = top + (n.offsetHeight - (n.matches('.hero,.finale') ? G.H : 0)) * f; lenis.scrollTo(y, { immediate: true, force: true }); ScrollTrigger.update(); frame(); };

  let rw = G.W, rh = G.H;
  window.addEventListener('resize', debounce(() => {
    const W2 = document.documentElement.clientWidth, H2 = window.innerHeight;
    const touch = matchMedia('(pointer: coarse)').matches;
    if (W2 === rw && (touch ? Math.abs(H2 - rh) < 140 : H2 === rh)) return;
    rw = W2; rh = H2;
    ScrollTrigger.refresh(); layout(); frame();
  }, 200));
  const relayout = debounce(() => { ScrollTrigger.refresh(); layout(); frame(); }, 120);
  window.addEventListener('load', () => idle(relayout));
}
function debounce(f, ms) { let t; return () => { clearTimeout(t); t = setTimeout(f, ms); }; }
boot();
