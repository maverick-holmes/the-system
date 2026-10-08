// AniLa Grabpflege – gemeinsame Gestaltungselemente (Vektor)
// Kontaktdaten zentral hier pflegen.
window.KONTAKT = {
  name: 'AniLa Grabpflege',
  strasse: 'Oststraße 54',
  ort: '45549 Sprockhövel',
  mail: 'kontakt@anila-grabpflege.de',
  web: 'www.anila-grabpflege.de',
  telefon: '', // fehlt noch – sobald bekannt eintragen, dann erscheint es automatisch
  orte: ['Sprockhövel', 'Hasslinghausen', 'Gevelsberg', 'Schwelm'],
};

const C = {
  creme: '#f8f1e7', terra: '#b8684f', blush: '#f1d3c5', oliv: '#48553a',
  olivHell: '#7f8d5f', text: '#2c2724', grau: '#5b524c',
};
window.C = C;

// deterministischer Zufall, damit jedes Rendern gleich aussieht
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

// ---------- Icons (Linien, viewBox 24) ----------
const ICON = {
  herz: 'M12 20.5s-7.5-4.6-7.5-10.4A4.1 4.1 0 0 1 12 7.6a4.1 4.1 0 0 1 7.5 2.5c0 5.8-7.5 10.4-7.5 10.4z',
  spross: 'M12 21v-9 M12 14.5c0-4.2-3-6.6-7.4-6.6 0 4.2 3 6.6 7.4 6.6z M12 12c0-4.4 3.1-7.2 7.6-7.2 0 4.4-3.1 7.2-7.6 7.2z',
  haende: 'M2.5 11.5 6 8l3.2 1.4 M21.5 11.5 18 8l-5.2 1.6-3.6 3.1a1.3 1.3 0 0 0 1.8 1.9l2.6-1.9 4.4 3.7 M6 8v0 M4.6 13l4.8 4.6a1.3 1.3 0 0 0 1.9-1.8 M8.3 15.6l2.6 2.5a1.3 1.3 0 0 0 1.9-1.8 M10.8 18.1l1 .9a1.3 1.3 0 0 0 1.8-1.8l-1-1 M17.3 15.3l-3.8-3.3',
  leute: 'M12 11.2a2.9 2.9 0 1 0 0-5.8 2.9 2.9 0 0 0 0 5.8z M6.6 19.5c0-3.2 2.4-5.6 5.4-5.6s5.4 2.4 5.4 5.6 M5.4 11a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4z M18.6 11a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4z M1.8 17.6c0-2.6 1.6-4.4 3.8-4.4 M22.2 17.6c0-2.6-1.6-4.4-3.8-4.4',
  telefon: 'M20.5 16.4v2.7a1.8 1.8 0 0 1-2 1.8 17.8 17.8 0 0 1-7.8-2.8 17.5 17.5 0 0 1-5.4-5.4A17.8 17.8 0 0 1 2.5 4.9a1.8 1.8 0 0 1 1.8-2h2.7a1.8 1.8 0 0 1 1.8 1.6c.1.9.3 1.7.6 2.5a1.8 1.8 0 0 1-.4 1.9L7.8 10a14.4 14.4 0 0 0 5.4 5.4l1.1-1.1a1.8 1.8 0 0 1 1.9-.4c.8.3 1.6.5 2.5.6a1.8 1.8 0 0 1 1.8 1.9z',
  pin: 'M12 21.5s-6.5-6.2-6.5-11.6a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11.6-6.5 11.6z M12 12.4a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2z',
  mail: 'M3 6h18v12.5H3z M3 6.5l9 7 9-7',
  web: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M3 12h18 M12 3c2.6 2.6 3.8 5.6 3.8 9s-1.2 6.4-3.8 9 M12 3C9.4 5.6 8.2 8.6 8.2 12s1.2 6.4 3.8 9 M4.6 7.2h14.8 M4.6 16.8h14.8',
  person: 'M12 11.5a3.6 3.6 0 1 0 0-7.2 3.6 3.6 0 0 0 0 7.2z M5 20c0-3.9 3.1-6.5 7-6.5s7 2.6 7 6.5',
  besen: 'M17.5 2.5 12.2 11 M8.5 10.2l6.4 3.9-3.7 7.4c-2.6-.6-6.4-2.9-8-5.1z M7.4 16.6l-2 2.4 M9.6 18l-1.4 2.6',
  pflanze: 'M7 14.5h10l-1.6 7H8.6z M12 14.5V9.2 M12 11.2c-3.3 0-5.4-2-5.4-5.4 3.3 0 5.4 2 5.4 5.4z M12 9.6c0-3.2 2-5.3 5.3-5.3 0 3.2-2 5.3-5.3 5.3z',
  kanne: 'M5.5 10h8.5v9.5H5.5z M14 12.2l4.6-4.1 M17.2 6.4l3.2 3.2 M5.5 12.5H4a1.8 1.8 0 0 0 0 3.6h1.5 M7.2 10V8.3a2.6 2.6 0 0 1 5.2 0V10 M20 12.6v.1 M21.4 14.6v.1 M19.2 15.4v.1',
  schere: 'M6.5 20.5a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2z M17.5 20.5a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2z M8.3 16 15 3.5 M15.7 16 9 3.5',
  schnee: 'M12 2.5v19 M3.8 7.2l16.4 9.6 M20.2 7.2 3.8 16.8 M9.4 3.9 12 5.6l2.6-1.7 M9.4 20.1 12 18.4l2.6 1.7 M3.3 10.2l2.8.2 1.2-2.7 M20.7 13.8l-2.8-.2-1.2 2.7 M3.3 13.8l2.8-.2 1.2 2.7 M20.7 10.2l-2.8.2-1.2-2.7',
};
function icon(name, { stroke = C.terra, sw = 1.35, size = '100%' } = {}) {
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"><path d="${ICON[name]}"/></svg>`;
}
// Icon im Kreis: "soft" = Blush-Kreis + Terrakotta-Linie, "voll" = Farbkreis + weiße Linie
function iconKreis(name, art = 'soft', farbe = C.terra) {
  const bg = art === 'soft' ? C.blush : farbe, st = art === 'soft' ? C.terra : '#fff';
  return `<svg viewBox="0 0 32 32" width="100%" height="100%"><circle cx="16" cy="16" r="16" fill="${bg}"/><g transform="translate(6.4 6.4) scale(.8)" fill="none" stroke="${st}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="${ICON[name]}"/></g></svg>`;
}
const herzPfad = 'M12 21s-8.2-5-8.2-11.3A4.4 4.4 0 0 1 12 7.3a4.4 4.4 0 0 1 8.2 2.4C20.2 16 12 21 12 21z';
function herzVoll(farbe = C.terra) { return `<svg viewBox="2 5 20 17" width="100%" height="100%"><path d="${herzPfad}" fill="${farbe}"/></svg>`; }

// ---------- Blätterzweig ----------
// gibt <g> zurück; Koordinaten in "Zweig-Einheiten", Länge len, wächst entlang +x, dann rotiert
let gradId = 0;
function zweig({ len = 100, n = 9, seed = 1, blatt = 18, rot = 0, x = 0, y = 0, sc = 1, blushAnteil = 0.18, kurve = 0.18 }) {
  const r = rng(seed); const id = 'g' + (gradId++);
  let s = `<defs>
    <linearGradient id="${id}a" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2f3b24"/><stop offset=".55" stop-color="#4f5f3a"/><stop offset="1" stop-color="#8b9a68"/></linearGradient>
    <linearGradient id="${id}b" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#c98f79"/><stop offset="1" stop-color="#efcfc1"/></linearGradient></defs>`;
  s += `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${sc})">`;
  const bend = len * kurve;
  // Stiel als quadratische Kurve 0,0 -> len,0 mit Kontrollpunkt (len/2, -bend)
  const P = t => [len * t, -2 * bend * t * (1 - t)];
  s += `<path d="M0 0 Q${len / 2} ${-bend} ${len} 0" fill="none" stroke="#3d4a2e" stroke-width="${1.1}" stroke-linecap="round"/>`;
  for (let i = 0; i < n; i++) {
    const t = 0.12 + (i / (n - 1)) * 0.88;
    const [px, py] = P(Math.min(t, 0.98));
    const seite = i % 2 ? 1 : -1;
    const L = blatt * (0.75 + r() * 0.4) * (1 - 0.35 * t);
    const W = L * (0.27 + r() * 0.06);
    const ang = seite * (38 + r() * 22) - 6;
    const istBlush = r() < blushAnteil;
    s += leaf(px, py, ang, L, W, istBlush ? `url(#${id}b)` : `url(#${id}a)`, istBlush);
  }
  // Endblatt
  const [ex, ey] = P(1);
  s += leaf(ex, ey, -8, blatt * 0.7, blatt * 0.2, `url(#${id}a)`, false);
  return s + '</g>';
}
function leaf(x, y, ang, L, W, fill, blush) {
  const d = `M0 0 C${L * 0.25} ${-W * 1.15} ${L * 0.7} ${-W} ${L} 0 C${L * 0.7} ${W} ${L * 0.25} ${W * 1.15} 0 0Z`;
  const ader = blush ? '#b9765f' : '#c6cfa9';
  return `<g transform="translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${ang.toFixed(1)})"><path d="${d}" fill="${fill}"/><path d="M${L * 0.06} 0 Q${L * 0.5} ${-W * 0.08} ${L * 0.92} 0" stroke="${ader}" stroke-width="${(W * 0.07).toFixed(2)}" fill="none" opacity=".75"/></g>`;
}

// ---------- Pinselstrich (Vektor, unregelmäßige Kanten) ----------
function pinsel({ w = 100, h = 40, seed = 3, farbe = C.oliv }) {
  const r = rng(seed); const pts = [];
  const N = 40;
  // obere Kante links->rechts
  for (let i = 0; i <= N; i++) { const t = i / N; pts.push([t * w, h * 0.06 + (r() - 0.5) * h * 0.035 + Math.sin(t * 6 + seed) * h * 0.03]); }
  // rechtes Ende ausgefranst
  for (let i = 1; i < 14; i++) { const t = i / 14; pts.push([w - r() * w * 0.03 - (i % 2) * w * 0.014, h * (0.06 + t * 0.88)]); }
  // untere Kante rechts->links
  for (let i = N; i >= 0; i--) { const t = i / N; pts.push([t * w, h * 0.94 + (r() - 0.5) * h * 0.035 + Math.cos(t * 5 + seed) * h * 0.03]); }
  // linkes Ende ausgefranst
  for (let i = 13; i > 0; i--) { const t = i / 14; pts.push([r() * w * 0.025 + (i % 2) * w * 0.012, h * (0.06 + t * 0.88)]); }
  let d = 'M' + pts.map(p => p[0].toFixed(2) + ' ' + p[1].toFixed(2)).join(' L') + 'Z';
  let s = `<path d="${d}" fill="${farbe}"/>`;
  // trockene Pinselspuren: dünne, auslaufende Borstenstriche an den Enden
  for (let i = 0; i < 14; i++) {
    const yy = h * (0.1 + r() * 0.8), links = i % 2 === 0, ll = w * (0.04 + r() * 0.07), dh = h * (0.012 + r() * 0.018);
    const x0 = links ? w * 0.03 : w * 0.95, x1 = links ? x0 - ll : x0 + ll;
    s += `<path d="M${x0.toFixed(1)} ${(yy - dh).toFixed(2)} L${x1.toFixed(1)} ${yy.toFixed(2)} L${x0.toFixed(1)} ${(yy + dh).toFixed(2)}Z" fill="${farbe}" opacity="${(0.6 + r() * 0.4).toFixed(2)}"/>`;
  }
  return s;
}

// ---------- Helfer zum Einsetzen ----------
// <div class="gen" data-fn="zweig" data-o='{"len":..}' data-vb="0 0 100 100">
function svgBox(inner, vb) { return `<svg viewBox="${vb}" width="100%" height="100%" overflow="visible">${inner}</svg>`; }
window.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-zweig]').forEach(el => {
    const o = JSON.parse(el.dataset.zweig); el.innerHTML = svgBox(zweig(o), el.dataset.vb || '0 0 100 100');
  });
  document.querySelectorAll('[data-pinsel]').forEach(el => {
    const o = JSON.parse(el.dataset.pinsel || '{}'); el.insertAdjacentHTML('afterbegin', `<svg class="pinsel-bg" viewBox="0 0 ${o.w || 100} ${o.h || 40}" preserveAspectRatio="none">${pinsel(o)}</svg>`);
  });
  document.querySelectorAll('[data-icon]').forEach(el => { el.innerHTML = iconKreis(el.dataset.icon, el.dataset.art || 'soft', el.dataset.farbe || C.terra); });
  document.querySelectorAll('[data-herz]').forEach(el => { el.innerHTML = herzVoll(el.dataset.herz || C.terra); });
  document.querySelectorAll('[data-logo]').forEach(el => { el.innerHTML = window.LOGO_SVG; });
  document.querySelectorAll('[data-qr]').forEach(el => { el.innerHTML = `<svg viewBox="-1 -1 ${QR.n + 2} ${QR.n + 2}" width="100%" height="100%" shape-rendering="crispEdges"><rect x="-1" y="-1" width="${QR.n + 2}" height="${QR.n + 2}" fill="#fff"/><path d="${QR.d}" fill="${C.text}"/></svg>`; });
  document.querySelectorAll('[data-k]').forEach(el => { el.textContent = KONTAKT[el.dataset.k]; });
  document.body.classList.toggle('ohne-telefon', !KONTAKT.telefon);
  document.fonts.ready.then(() => document.body.classList.add('fertig'));
});
