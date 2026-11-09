// Antigua Planner · sin build. Estado en localStorage; datos en data.js.

// ───────────────────────── utilidades ─────────────────────────
const $ = (s, el = document) => el.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
const fmt = (min) => { min = ((Math.round(min) % 1440) + 1440) % 1440; return String(Math.floor(min / 60)).padStart(2, '0') + ':' + String(min % 60).padStart(2, '0'); };
const durTxt = (m) => (m >= 60 ? Math.floor(m / 60) + ' h' + (m % 60 ? ' ' + String(m % 60).padStart(2, '0') : '') : m + ' min');
const usd = (n) => '$' + Math.round(n).toLocaleString('es-CR');
const crc = (n) => '₡' + Math.round(n).toLocaleString('es-CR');
const km = (a, b) => { const R = 6371, dLat = (b.lat - a.lat) * Math.PI / 180, dLng = (b.lng - a.lng) * Math.PI / 180; const x = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(x)); };
const kmTxt = (d) => d.toFixed(1).replace('.', ',') + ' km';
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const dObj = (iso) => new Date(iso + 'T12:00:00Z');
const dayLabel = (iso) => dObj(iso).getUTCDate() + ' ' + MESES[dObj(iso).getUTCMonth()];
const dow = (iso) => DIAS[dObj(iso).getUTCDay()];
const tagsOf = (p) => CAT_TAGS[p.cat] || [];
const mapsUrl = (p) => G(p.name + ', ' + p.addr);
const dirUrl = (a, b, mode = 'walking') => `https://www.google.com/maps/dir/?api=1&origin=${a.lat},${a.lng}&destination=${b.lat},${b.lng}&travelmode=${mode}`;
const toast = (msg) => { const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; document.body.appendChild(t); setTimeout(() => t.remove(), 1900); };

// Sol (NOAA simplificado). Guatemala es UTC−6 todo el año.
function sunTimes(iso, zone) {
  const [lat, lng] = SUN_AT[zone] || SUN_AT.Antigua;
  const n = Math.floor((dObj(iso) - Date.UTC(2000, 0, 1, 12)) / 864e5);
  const calc = (rising) => {
    const Jstar = n - lng / 360, M = (357.5291 + 0.98560028 * Jstar) % 360, Mr = M * Math.PI / 180;
    const C = 1.9148 * Math.sin(Mr) + 0.02 * Math.sin(2 * Mr) + 0.0003 * Math.sin(3 * Mr);
    const lr = ((M + C + 180 + 102.9372) % 360) * Math.PI / 180;
    const Jt = 2451545 + Jstar + 0.0053 * Math.sin(Mr) - 0.0069 * Math.sin(2 * lr);
    const dec = Math.asin(Math.sin(lr) * Math.sin(23.44 * Math.PI / 180));
    const H = Math.acos((Math.sin(-0.833 * Math.PI / 180) - Math.sin(lat * Math.PI / 180) * Math.sin(dec)) / (Math.cos(lat * Math.PI / 180) * Math.cos(dec))) * 180 / Math.PI;
    const ms = ((Jt + (rising ? -H : H) / 360) - 2440587.5) * 864e5;
    const d = new Date(ms - 6 * 3600e3); return d.getUTCHours() * 60 + d.getUTCMinutes();
  };
  const sr = calc(true), ss = calc(false);
  return { sunrise: sr, morning: sr + 40, golden: ss - 50, sunset: ss, blue: ss + 22 };
}
const SUN_LABEL = { sunrise: 'Amanecer', morning: 'Luz de mañana', golden: 'Hora dorada', sunset: 'Atardecer', blue: 'Hora azul' };

// ───────────────────────── estado ─────────────────────────
const LS = 'antiguaplan.v1';
const store = (() => { try { return JSON.parse(localStorage.getItem(LS)) || {}; } catch { return {}; } })();
const SCREENS = [['overview', 'Resumen'], ['planner', 'Plan'], ['explore', 'Explorar'], ['photo', 'Modo foto'], ['volcano', 'Acatenango'], ['book', 'Reservas']];
const hashScreen = () => { const h = location.hash.replace('#', ''); return SCREENS.some(([k]) => k === h) ? h : 'overview'; };
const S = {
  screen: hashScreen(), day: store.day ?? 0, sel: null, filters: {}, photoF: {}, photoDay: null, mview: 'list', sat: false,
  custom: store.custom || {}, savedIds: store.savedIds || [], gear: store.gear || {}, booked: store.booked || {},
  out: store.out || FLIGHTS.out.find((f) => f.rec).id, back: store.back || FLIGHTS.back.find((f) => f.rec).id,
  plan: store.plan || 'lean', theme: store.theme || null,
};
const persist = () => { try { localStorage.setItem(LS, JSON.stringify({ day: S.day, custom: S.custom, savedIds: S.savedIds, gear: S.gear, booked: S.booked, out: S.out, back: S.back, plan: S.plan, theme: S.theme })); } catch { /* modo privado */ } };
const set = (p) => { Object.assign(S, p); persist(); render(); };
const isDark = () => S.theme ? S.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { if (!S.theme) render(); });

const outF = () => FLIGHTS.out.find((f) => f.id === S.out) || FLIGHTS.out[1];
const backF = () => FLIGHTS.back.find((f) => f.id === S.back) || FLIGHTS.back[0];

// ───────────────────────── modelo del día ─────────────────────────
// Día 1 y día 6 se ajustan al vuelo elegido salvo que el usuario haya editado el día.
function baseActs(i) {
  const D = DAYS[i];
  if (i === 0) {
    const a = toMin(outF().arr), hotel = a + 35 + 85;
    const rest = D.acts.slice(3).filter(([, t]) => toMin(t) >= hotel + 30);
    return [['gua', fmt(a)], ['uberin', fmt(a + 35)], ['hotelant', fmt(hotel)], ...(a > 18 * 60 ? [] : rest)];
  }
  if (i === DAYS.length - 1) {
    const dep = toMin(backF().dep);
    if (dep < 12 * 60) return [['uberout', fmt(dep - 175)], ['gua', fmt(dep - 105)]];
    const leave = dep - 200;
    const before = D.actsEvening.slice(0, -2).filter(([id, t]) => toMin(t) + BY_ID[id].dur <= leave - 10);
    return [...before, ['uberout', fmt(leave)], ['gua', fmt(leave + 75)]];
  }
  return D.acts;
}
const dayActs = (i) => S.custom[i] || baseActs(i);
const setDayActs = (i, acts) => { S.custom = { ...S.custom, [i]: acts }; persist(); };
const inDay = (i, id) => dayActs(i).some(([pid]) => pid === id);

// Conexión entre dos actividades. ponytail: heurística por distancia y zona.
function connect(a, b) {
  if (a.cat === 'Traslado' || b.cat === 'Traslado' || a.id === b.id) return null;
  const d = km(a, b);
  if (a.zone === 'Volcán' || b.zone === 'Volcán') return { mode: 'trail', min: 0, km: d, cost: 0, label: 'SENDERO', sub: kmTxt(d) };
  if (d <= 1.8) { const min = Math.max(3, Math.round(d / 4.2 * 60)); return { mode: 'walk', min, km: d, cost: 0, label: min + ' min a pie', sub: kmTxt(d), url: dirUrl(a, b) }; }
  if (d <= 7) { const min = Math.round(5 + d * 2.5); return { mode: 'tuk', min, km: d, cost: 2.5, label: '~' + min + ' min tuk-tuk', sub: 'Q15–40 · ' + kmTxt(d), url: dirUrl(a, b, 'driving') }; }
  const min = Math.round(10 + d * 1.6), cost = Math.round(4 + d * 0.9);
  return { mode: 'uber', min, km: d, cost, label: '~' + min + ' min Uber', sub: usd(cost) + ' · ' + kmTxt(d), url: dirUrl(a, b, 'driving') };
}
function buildDay(i) {
  const D = DAYS[i];
  const acts = dayActs(i).map(([id, t]) => ({ ...BY_ID[id], t })).filter((a) => a.name);
  const rows = acts.map((a, k) => {
    const start = toMin(a.t), end = start + a.dur, next = acts[k + 1];
    return { ...a, k, num: k + 1, start, end, conn: next ? connect(a, next) : null };
  });
  const walk = rows.reduce((s, r) => s + (r.conn && r.conn.mode === 'walk' ? r.conn.km : 0), 0);
  const spend = rows.reduce((s, r) => s + (r.cost || 0) + (r.conn ? r.conn.cost : 0), 0);
  return { ...D, i, num: i + 1, rows, walk, spend, sun: sunTimes(D.date, D.where), label: dayLabel(D.date), dow: dow(D.date) };
}

// ───────────────────────── ilustraciones (SVG propio) ─────────────────────────
// Agua (cono), Acatenango (doble cima) y Fuego con penacho: la silueta que se ve desde Antigua.
let gid = 0;
const VOLCANES = (cls = '') => { const g = 'sky' + (++gid); return `<svg class="ill ${cls}" viewBox="0 0 800 300" preserveAspectRatio="xMaxYMax slice" aria-hidden="true">
  <defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--sky1)"/><stop offset="1" stop-color="var(--sky2)"/></linearGradient></defs>
  <rect width="800" height="300" fill="url(#${g})"/>
  <circle cx="610" cy="78" r="34" fill="var(--sun)"/>
  <path d="M-10 300 L150 120 Q168 104 186 120 L360 300Z" fill="var(--v3)"/>
  <path d="M300 300 L455 112 L478 98 L500 118 L520 104 L548 132 L700 300Z" fill="var(--v2)"/>
  <path d="M520 300 L640 150 Q652 140 664 150 L810 300Z" fill="var(--v1)"/>
  <path class="plume" d="M652 146 C640 120 668 108 650 86 C636 70 664 58 652 40" stroke="var(--plume)" stroke-width="14" fill="none" stroke-linecap="round" opacity=".55"/>
  <path class="lava" d="M652 150 L646 176 L652 190 L644 214" stroke="var(--lava)" stroke-width="4" fill="none" stroke-linecap="round"/>
  <path d="M0 300 L0 262 Q200 240 400 258 T800 250 L800 300Z" fill="var(--hill)"/>
</svg>`; };
// Arco de Santa Catalina con su torre del reloj.
const ARCO = `<svg class="arco" viewBox="0 0 260 220" aria-hidden="true">
  <rect x="0" y="70" width="260" height="150" fill="var(--ocre)"/>
  <rect x="0" y="62" width="260" height="10" fill="var(--almagre)"/>
  <path d="M60 220 L60 140 A70 70 0 0 1 200 140 L200 220Z" fill="var(--bg)"/>
  <rect x="104" y="16" width="52" height="54" fill="var(--ocre)"/><path d="M98 18 L130 0 L162 18Z" fill="var(--almagre)"/>
  <circle cx="130" cy="42" r="14" fill="var(--paper)"/><path d="M130 42 L130 33 M130 42 L137 45" stroke="var(--ink)" stroke-width="2.5" stroke-linecap="round"/>
  <g fill="var(--paper)" opacity=".85"><rect x="18" y="96" width="22" height="34" rx="11"/><rect x="220" y="96" width="22" height="34" rx="11"/></g>
</svg>`;
const LAGO = `<svg class="ill" viewBox="0 0 800 300" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
  <rect width="800" height="300" fill="var(--sky2)"/>
  <circle cx="200" cy="90" r="28" fill="var(--sun)"/>
  <path d="M60 210 L210 80 L330 210Z" fill="var(--v3)"/><path d="M280 210 L420 110 L470 130 L560 210Z" fill="var(--v2)"/><path d="M500 210 L640 70 L780 210Z" fill="var(--v1)"/>
  <rect y="208" width="800" height="92" fill="var(--anil)"/>
  <g stroke="var(--paper)" stroke-width="3" stroke-linecap="round" opacity=".5"><path d="M80 236h90M260 250h140M520 232h110M620 268h120M140 280h80"/></g>
</svg>`;
const ZONE_ILL = { Antigua: () => VOLCANES(), Lago: () => LAGO, Volcán: () => VOLCANES('night'), Ruta: () => VOLCANES() };

// ───────────────────────── render ─────────────────────────
const MNAV = [['overview', 'Resumen', '<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>'], ['planner', 'Plan', '<path d="M4 5h16M4 12h16M4 19h10"/>'], ['explore', 'Explorar', '<circle cx="12" cy="12" r="9"/><path d="M15 9l-2 6-4 2 2-6z"/>'], ['photo', 'Foto', '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>'], ['volcano', 'Volcán', '<path d="M2 21l7-12 3 4 3-6 7 14z"/><path d="M13 4c0-1 1-2 2-2"/>'], ['book', 'Reservas', '<path d="M5 3h14v18l-7-4-7 4z"/>']];

function render() {
  document.documentElement.dataset.theme = isDark() ? 'dark' : 'light';
  $('meta[name="theme-color"]').setAttribute('content', isDark() ? '#15131F' : '#F6EFE3');
  $('#themeLabel').textContent = isDark() ? 'DÍA' : 'NOCHE';
  $('#nav').innerHTML = SCREENS.map(([k, l]) => `<button data-go="${k}" class="${S.screen === k ? 'on' : ''}">${l}</button>`).join('');
  $('#mnav').innerHTML = MNAV.map(([k, l, ic]) => `<button data-go="${k}" class="${S.screen === k ? 'on' : ''}"><svg viewBox="0 0 24 24">${ic}</svg><span>${l}</span></button>`).join('');
  const R = { overview: rOverview, planner: rPlanner, explore: rExplore, photo: rPhoto, volcano: rVolcano, book: rBook }[S.screen];
  $('#view').className = 'view v-' + S.screen;
  $('#view').innerHTML = R();
  if (S.screen === 'planner') mountMap();
}

function budgetTotals() {
  const usdT = BUDGET.reduce((s, b) => s + b[S.plan], 0);
  return { usdT, crcT: usdT * TRIP.fx.crc };
}

function rOverview() {
  const o = outF(), b = backF(), { usdT, crcT } = budgetTotals();
  const lo = TRIP.budget.min, hi = TRIP.budget.max, scaleMax = Math.max(hi * 1.4, crcT * 1.05);
  const pos = (v) => Math.min(100, v / scaleMax * 100);
  const state = crcT <= lo ? 'ok' : crcT <= hi ? 'ok' : crcT <= hi * 1.1 ? 'warn' : 'over';
  const days = DAYS.map((_, i) => buildDay(i));
  const daysLeft = Math.ceil((Date.parse(TRIP.start + 'T00:00:00-06:00') - Date.now()) / 864e5);
  return `
  <section class="hero">
    ${VOLCANES('hero-ill')}
    <div class="hero-txt">
      <p class="kicker">Viaje en solitario · ${daysLeft > 0 ? 'faltan ' + daysLeft + ' días' : 'en curso'}</p>
      <h1>Antigua,<br><em>lago y volcán</em></h1>
      <p class="lede">Seis días entre la ciudad colonial, una noche a orillas del Atitlán y el amanecer en la cima del Acatenango con el Fuego erupcionando debajo.</p>
      <div class="hero-facts">
        <span><b>8–13</b> diciembre</span><span><b>5</b> noches</span><span><b>3 976</b> m de cima</span><span><b>${crc(crcT)}</b> estimado</span>
      </div>
    </div>
  </section>

  <section class="grid2">
    <div class="card">
      <div class="card-h"><h2>Vuelos</h2><span class="tag warn">POR CONFIRMAR</span></div>
      <p class="muted small">Directos SJO ⇄ GUA, ~1 h 35, misma hora en los dos países. Volaris dejó la ruta en abril de 2026. ${esc(FLIGHTS.price)}</p>
      <h3 class="sub">Ida · martes 8</h3>
      <div class="flights">${FLIGHTS.out.map((f) => rFlight(f, 'out', S.out === f.id)).join('')}</div>
      <h3 class="sub">Regreso · domingo 13</h3>
      <div class="flights">${FLIGHTS.back.map((f) => rFlight(f, 'back', S.back === f.id)).join('')}</div>
      <p class="small">Elige el vuelo que compres: el día 1 y el día 6 del plan se reacomodan solos.</p>
      <div class="links">${FLIGHTS.book.map((l) => `<a class="btn" href="${l.url}" target="_blank" rel="noopener">${esc(l.name)} ↗</a>`).join('')}</div>
      <p class="tiny muted">Seleccionado: ${esc(o.air)} ${esc(o.code)} ${o.dep}→${o.arr} · ${esc(b.air)} ${esc(b.code)} ${b.dep}→${b.arr}</p>
    </div>

    <div class="card">
      <div class="card-h"><h2>Presupuesto</h2>
        <div class="seg">${[['lean', 'Ajustado'], ['comfy', 'Cómodo']].map(([k, l]) => `<button data-act="plan" data-v="${k}" class="${S.plan === k ? 'on' : ''}">${l}</button>`).join('')}</div>
      </div>
      <div class="total ${state}"><b>${crc(crcT)}</b><span>${usd(usdT)} · ${esc(TRIP.fx.note)}</span></div>
      <div class="meter"><i class="range" style="left:${pos(lo)}%;width:${pos(hi) - pos(lo)}%"></i><i class="mark" style="left:${pos(crcT)}%"></i>
        <span style="left:${pos(lo)}%">₡300 mil</span><span style="left:${pos(hi)}%">₡400 mil</span></div>
      <table class="btable">${BUDGET.map((r) => `<tr><td>${esc(r.k)}<small>${esc(r.note)}</small></td><td>${usd(r[S.plan])}</td><td>${crc(r[S.plan] * TRIP.fx.crc)}</td></tr>`).join('')}</table>
      <p class="small">${state === 'over' ? 'El escenario cómodo se pasa del tope: el vuelo de temporada alta y el hotel boutique todas las noches son lo que más pesa. Mezcla Airbnb con una noche boutique para quedar cerca de ₡400 mil.' : 'Dentro del rango si el vuelo sale en ~$300. Cada $50 de vuelo son ₡22 500.'}</p>
    </div>
  </section>

  <section>
    <div class="sec-h"><h2>El viaje en seis días</h2><button class="link" data-go="planner">Abrir el plan →</button></div>
    <div class="route">${days.map((d) => `<button class="rday z-${d.where}" data-act="openday" data-i="${d.i}">
      <span class="rnum">${d.num}</span><span class="rdate">${d.dow} ${d.label}</span><b>${esc(d.title)}</b><span class="rkind">${esc(d.kind)}</span><span class="rnight">Noche: ${esc(d.night)}</span></button>`).join('')}</div>
  </section>

  <section>
    <div class="sec-h"><h2>Imperdibles</h2></div>
    <div class="tops">${TOP.map((t, k) => { const p = BY_ID[t.id]; return `<div class="top z-${p.zone}"><span class="tnum">${k + 1}</span><div><b>${esc(p.name)}</b><p>${esc(t.why)}</p></div></div>`; }).join('')}</div>
  </section>

  <section class="card">
    <div class="card-h"><h2>Para tener a mano</h2></div>
    <dl class="practical">${PRACTICAL.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl>
  </section>`;
}
const rFlight = (f, dir, on) => `<button class="flight ${on ? 'on' : ''}" data-act="flight" data-dir="${dir}" data-v="${f.id}">
  <span class="fl-air">${esc(f.air)} <b>${esc(f.code)}</b>${f.rec ? '<i>sugerido</i>' : ''}</span>
  <span class="fl-time">${f.dep} <em>→</em> ${f.arr}</span><span class="fl-note">${esc(f.note)}</span></button>`;

// ── Plan ──
function rPlanner() {
  const D = buildDay(S.day);
  return `
  <div class="days">${DAYS.map((d, i) => `<button class="dchip z-${d.where} ${S.day === i ? 'on' : ''}" data-act="day" data-i="${i}"><b>${i + 1}</b><span>${dow(d.date)} ${dayLabel(d.date)}</span></button>`).join('')}</div>
  <div class="plan ${S.mview === 'map' ? 'show-map' : ''}">
    <div class="itin">
      <header class="dhead z-${D.where}">
        <div class="dhead-ill">${ZONE_ILL[D.where]()}</div>
        <div class="dhead-txt"><span class="stamp sm">${esc(D.kind)}</span><h2>${esc(D.title)}</h2>
          <p class="meta"><span>☀ ${fmt(D.sun.sunrise)}</span><span>◐ ${fmt(D.sun.sunset)}</span><span>${kmTxt(D.walk)} a pie</span><span>~${usd(D.spend)} en el día</span><span>Noche: ${esc(D.night)}</span></p></div>
      </header>
      ${D.note ? `<p class="note">${esc(D.note)}</p>` : ''}
      ${D.why ? `<p class="why"><b>Por qué este orden.</b> ${esc(D.why)}</p>` : ''}
      <div class="mtoggle"><button data-act="mview" data-v="list" class="${S.mview === 'list' ? 'on' : ''}">Lista</button><button data-act="mview" data-v="map" class="${S.mview === 'map' ? 'on' : ''}">Mapa</button></div>
      <ol class="tl">${D.rows.map((r) => rRow(D, r)).join('')}</ol>
      <div class="dfoot">
        ${S.custom[S.day] ? '<button class="btn ghost" data-act="reset">Restaurar el día original</button>' : ''}
        <button class="btn ghost" data-go="explore">Añadir desde Explorar</button>
      </div>
    </div>
    <div class="mapwrap"><div id="mapslot"></div>
      <div class="mapbar"><button data-act="sat" class="${S.sat ? 'on' : ''}">Satélite</button><button data-act="fit">Encuadrar</button></div></div>
  </div>`;
}
function rRow(D, r) {
  const sel = S.sel === r.k, last = r.k === D.rows.length - 1;
  return `<li class="row c-${r.cat === 'Traslado' ? 'tr' : 'act'} z-${r.zone} ${sel ? 'sel' : ''}" data-act="sel" data-k="${r.k}">
    <div class="time"><b>${r.t}</b><span>${fmt(r.end)}</span></div>
    <div class="dot"><span>${r.num}</span></div>
    <div class="body">
      <div class="r1"><b>${esc(r.name)}</b><span class="cat">${esc(r.cat)}</span>${r.cost ? `<span class="cost">${usd(r.cost)}</span>` : ''}</div>
      <p>${esc(r.desc)}</p>
      ${sel ? `<div class="more">${r.tip ? `<p class="tip">${esc(r.tip)}</p>` : ''}${r.hours ? `<p class="tiny muted">Horario: ${esc(r.hours)} · ${durTxt(r.dur)}</p>` : `<p class="tiny muted">${durTxt(r.dur)}</p>`}
        <div class="links"><a class="btn sm" href="${mapsUrl(r)}" target="_blank" rel="noopener">Google Maps ↗</a>${r.book ? `<a class="btn sm" href="${r.book}" target="_blank" rel="noopener">Reservar ↗</a>` : ''}
        <button class="btn sm ghost" data-act="up" data-k="${r.k}" ${r.k === 0 ? 'disabled' : ''}>↑</button><button class="btn sm ghost" data-act="down" data-k="${r.k}" ${last ? 'disabled' : ''}>↓</button><button class="btn sm ghost" data-act="del" data-k="${r.k}">Quitar</button></div></div>` : ''}
    </div>
  </li>${r.conn ? `<li class="conn m-${r.conn.mode}">${r.conn.url ? `<a href="${r.conn.url}" target="_blank" rel="noopener">${esc(r.conn.label)}</a>` : esc(r.conn.label)}<span>${esc(r.conn.sub)}</span></li>` : ''}`;
}

// ── Explorar ──
const activeF = () => Object.keys(S.filters).filter((k) => S.filters[k]);
const matchF = (p) => { const f = activeF(); return f.every((k) => tagsOf(p).includes(k) || p.zone === k || p.price === k || (k === 'Guardados' && S.savedIds.includes(p.id))); };
function rExplore() {
  const list = PLACES.filter((p) => p.cat !== 'Traslado' && p.cat !== 'Hotel').filter(matchF);
  return `
  <div class="sec-h"><h1>Explorar</h1><span class="muted">${list.length} lugares</span></div>
  <div class="filters">${[...FILTERS, ['MIS', ['Guardados']]].map(([g, opts]) => `<div class="fg"><span>${g}</span>${opts.map((o) => `<button data-act="filter" data-v="${o}" class="chip ${S.filters[o] ? 'on' : ''}">${o}</button>`).join('')}</div>`).join('')}
    ${activeF().length ? '<button class="link" data-act="clearf">Limpiar</button>' : ''}</div>
  <div class="cards">${list.map((p) => {
    const saved = S.savedIds.includes(p.id), where = DAYS.map((_, i) => inDay(i, p.id) ? i + 1 : null).filter(Boolean);
    return `<article class="pcard z-${p.zone}"><div class="pc-top"><span class="zone">${esc(p.zone)}</span><span class="cat">${esc(p.cat)}</span><span class="price">${esc(p.price)}</span></div>
      <h3>${esc(p.name)}</h3><p>${esc(p.desc)}</p>${p.tip ? `<p class="tip">${esc(p.tip)}</p>` : ''}
      <div class="pc-foot"><button class="btn sm ${saved ? 'on' : 'ghost'}" data-act="save" data-id="${p.id}">${saved ? '★ Guardado' : '☆ Guardar'}</button>
        <select data-act="addto" data-id="${p.id}" aria-label="Añadir a un día"><option value="">${where.length ? 'En día ' + where.join(', ') : 'Añadir a…'}</option>${DAYS.map((d, i) => `<option value="${i}">Día ${i + 1} · ${dow(d.date)} ${dayLabel(d.date)}</option>`).join('')}</select>
        <a class="btn sm ghost" href="${mapsUrl(p)}" target="_blank" rel="noopener">Maps ↗</a></div></article>`;
  }).join('')}</div>`;
}

// ── Modo foto ──
function rPhoto() {
  const zDay = (i) => DAYS[i].where;
  const f = Object.keys(S.photoF).filter((k) => S.photoF[k]);
  const spots = PHOTO_SPOTS.filter((s) => (S.photoDay == null || s.day === S.photoDay) && f.every((k) => s.tags.includes(k)))
    .map((s) => { const sun = sunTimes(DAYS[s.day].date, s.where), t = s.when in sun ? sun[s.when] : toMin(s.when); return { ...s, p: BY_ID[s.id], t, lab: SUN_LABEL[s.when] || 'Hora fija' }; })
    .sort((a, b) => a.day - b.day || a.t - b.t);
  return `
  <div class="sec-h"><h1>Modo foto</h1><span class="muted">Sol calculado para cada día y lugar (UTC−6)</span></div>
  <div class="suntable">${DAYS.map((d, i) => { const s = sunTimes(d.date, zDay(i)); return `<button class="sunday ${S.photoDay === i ? 'on' : ''}" data-act="pday" data-i="${i}"><b>${dow(d.date)} ${dayLabel(d.date)}</b><span>${esc(d.where)}</span>
    <dl><dt>Amanecer</dt><dd>${fmt(s.sunrise)}</dd><dt>Dorada</dt><dd>${fmt(s.golden)}</dd><dt>Atardecer</dt><dd>${fmt(s.sunset)}</dd><dt>Azul</dt><dd>${fmt(s.blue)}</dd></dl></button>`; }).join('')}</div>
  <div class="filters"><div class="fg"><span>TIPO</span>${PHOTO_FILTERS.map((o) => `<button class="chip ${S.photoF[o] ? 'on' : ''}" data-act="pf" data-v="${o}">${o}</button>`).join('')}</div>${S.photoDay != null || f.length ? '<button class="link" data-act="pclear">Ver todos</button>' : ''}</div>
  <div class="spots">${spots.map((s) => `<article class="spot z-${s.p.zone}"><div class="sp-time"><b>${fmt(s.t)}</b><span>${esc(s.lab)}</span><span>Día ${s.day + 1}</span></div>
    <div><span class="kind">${esc(s.kind)}</span><h3>${esc(s.p.name)} <span class="stars">${'★'.repeat(s.stars)}</span></h3><p>${esc(s.tip)}</p>
    <a class="link" href="${mapsUrl(s.p)}" target="_blank" rel="noopener">Ubicación ↗</a></div></article>`).join('') || '<p class="muted">Ningún spot con esos filtros.</p>'}</div>
  <p class="small muted">El Fuego se ve mejor de noche y en la hora azul; el Volcán de Agua suele despejarse temprano y nublarse después del mediodía.</p>`;
}

// ── Acatenango ──
function rVolcano() {
  const d4 = buildDay(3), d5 = buildDay(4), got = VOLCANO.gear.filter(([g]) => S.gear[g]).length;
  const sun = sunTimes(DAYS[4].date, 'Volcán');
  return `
  <section class="vhero">${VOLCANES('night vill')}<div class="vhero-txt"><span class="stamp">ACATENANGO</span><h1>Noche frente al Fuego,<br><em>cima al amanecer</em></h1>
    <p class="lede">Vie 11 – sáb 12 dic. La cima del Acatenango va incluida en el tour estándar: salida a las 04:00, sol a las ${fmt(sun.sunrise)}.</p></div></section>
  <div class="facts">${VOLCANO.facts.map(([k, v]) => `<div><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join('')}</div>
  <section class="grid2">
    <div class="card"><div class="card-h"><h2>Cronología</h2></div>
      <ol class="vt">${[...d4.rows.map((r) => [d4.dow, r]), ...d5.rows.slice(0, 4).map((r) => [d5.dow, r])].map(([dw, r]) => `<li><b>${dw} ${r.t}</b><span>${esc(r.name)}</span></li>`).join('')}
        <li><b>${d4.dow} ${fmt(d4.sun.sunset)}</b><span>Atardecer en el campamento</span></li></ol>
      <h3 class="sub">Antes de reservar, pregunta</h3><ul class="ask">${VOLCANO.ask.map((a) => `<li>${esc(a)}</li>`).join('')}</ul>
      <h3 class="sub">Estado del volcán</h3><div class="links">${VOLCANO.status.map((l) => `<a class="btn sm" href="${l.url}" target="_blank" rel="noopener">${esc(l.name)} ↗</a>`).join('')}</div>
    </div>
    <div class="card"><div class="card-h"><h2>Operadores</h2><span class="tag">PRECIO POR PERSONA</span></div>
      <ul class="ops">${VOLCANO.ops.map((o) => `<li><div><b>${esc(o.name)}</b><span>${esc(o.note)}</span></div><em>${esc(o.price)}</em><a class="btn sm" href="${o.url}" target="_blank" rel="noopener">Ver ↗</a></li>`).join('')}</ul>
      <p class="small muted">Precios de referencia de buscadores (2026). La cresta del Fuego no está en el plan; si te animas allá arriba cuesta Q200–300 extra en efectivo.</p>
    </div>
  </section>
  <section class="card"><div class="card-h"><h2>Equipo</h2><span class="tag">${got}/${VOLCANO.gear.length} LISTO</span></div>
    <div class="gear">${VOLCANO.gear.map(([g, how]) => `<label class="${S.gear[g] ? 'done' : ''}"><input type="checkbox" data-act="gear" data-v="${esc(g)}" ${S.gear[g] ? 'checked' : ''}><span>${esc(g)}</span><em class="h-${how}">${how}</em></label>`).join('')}</div>
    <p class="small muted">Alquilar: en Antigua por ~Q25–50 la pieza, o pídelo con el tour. Recógelo el jueves 10 en la tarde.</p></section>`;
}

// ── Reservas ──
function rBook() {
  const items = [
    { id: 'fl-out', what: 'Vuelo de ida', when: 'Mar 8', detail: `${outF().air} ${outF().code} · ${outF().dep} → ${outF().arr}`, links: FLIGHTS.book.slice(0, 2).concat(FLIGHTS.book.slice(3)) },
    { id: 'fl-back', what: 'Vuelo de regreso', when: 'Dom 13', detail: `${backF().air} ${backF().code} · ${backF().dep} → ${backF().arr}`, links: [] },
    ...STAYS.filter((s) => !s.included).map((s) => ({ id: 'st-' + s.night, what: 'Hospedaje · ' + s.zone, when: s.label, detail: s.picks.map((p) => p.name).join(' · '), picks: s.picks })),
    { id: 'acat', what: 'Tour Acatenango (cima incluida)', when: 'Vie 11 – Sáb 12', detail: 'Incluye la noche en el campamento', links: VOLCANO.ops.map((o) => ({ name: o.name + (o.price ? ' · ' + o.price : ''), url: o.url })) },
    { id: 'sh-1', what: 'Shuttle Antigua → San Juan La Laguna', when: 'Mié 9 · 08:00', detail: '~$22 compartido', links: [{ name: 'Turisteando', url: BY_ID.shuttlesj.book }] },
    { id: 'sh-2', what: 'Shuttle Panajachel → Antigua', when: 'Jue 10 · ~11:45', detail: '~$15 compartido', links: [{ name: 'Turisteando', url: BY_ID.shuttleant.book }] },
    { id: 'gear', what: 'Alquiler de equipo para el volcán', when: 'Jue 10 tarde', detail: 'Con el operador o en tiendas de la 6a Av', links: [] },
  ];
  const done = items.filter((x) => S.booked[x.id]).length;
  return `
  <div class="sec-h"><h1>Reservas</h1><span class="tag">${done}/${items.length} HECHO</span></div>
  <p class="muted">Los links ya llevan las fechas del viaje y 1 adulto. Marca cada cosa cuando la tengas confirmada.</p>
  <div class="book">${items.map((x) => `<article class="bitem ${S.booked[x.id] ? 'done' : ''}">
    <label class="bcheck"><input type="checkbox" data-act="booked" data-v="${x.id}" ${S.booked[x.id] ? 'checked' : ''}><span></span></label>
    <div class="bbody"><span class="bwhen">${esc(x.when)}</span><h3>${esc(x.what)}</h3><p class="muted small">${esc(x.detail)}</p>
      ${x.picks ? `<ul class="picks">${x.picks.map((p) => `<li><div><b>${esc(p.name)}</b><span>${esc(p.kind)}</span></div><em>${esc(p.price)}</em>${p.url ? `<a class="btn sm" href="${p.url}" target="_blank" rel="noopener">Booking ↗</a>` : ''}</li>`).join('')}</ul>` : ''}
      ${x.links && x.links.length ? `<div class="links">${x.links.map((l) => `<a class="btn sm" href="${l.url}" target="_blank" rel="noopener">${esc(l.name)} ↗</a>`).join('')}</div>` : ''}</div></article>`).join('')}</div>
  <section class="card"><div class="card-h"><h2>Buscar por tu cuenta</h2></div><div class="links">${STAY_SEARCH.map((l) => `<a class="btn" href="${l.url}" target="_blank" rel="noopener">${esc(l.name)} ↗</a>`).join('')}</div>
    <p class="small muted">Para Airbnb en Antigua busca dentro de las calles 1a–7a y avenidas 1a–7a: todo queda a pie. Lee las reseñas sobre ruido: los fines de semana hay fiesta en algunas cuadras.</p></section>`;
}

// ───────────────────────── mapa ─────────────────────────
let map, base, sat, layer;
const mapEl = document.createElement('div'); mapEl.id = 'map';
function mountMap() {
  const slot = $('#mapslot'); if (!slot) return; slot.appendChild(mapEl);
  if (!window.L) { mapEl.innerHTML = '<p class="muted pad">No se pudo cargar el mapa.</p>'; return; }
  if (!map) {
    map = L.map(mapEl, { zoomControl: true, attributionControl: true });
    base = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' });
    sat = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 18, attribution: '© Esri' });
    layer = L.layerGroup().addTo(map);
  }
  (S.sat ? sat : base).addTo(map); map.removeLayer(S.sat ? base : sat);
  drawDay(true);
  setTimeout(() => map.invalidateSize(), 50);
}
function drawDay(fit) {
  const D = buildDay(S.day); layer.clearLayers();
  const pts = D.rows.filter((r, k, a) => !(k > 0 && a[k - 1].id === r.id)).map((r) => [r.lat, r.lng]);
  if (pts.length > 1) L.polyline(pts, { color: getComputedStyle(document.documentElement).getPropertyValue('--almagre').trim() || '#B5452C', weight: 3, dashArray: '6 6' }).addTo(layer);
  D.rows.forEach((r) => {
    const icon = L.divIcon({ className: 'pin z-' + r.zone + (S.sel === r.k ? ' sel' : '') + (r.cat === 'Traslado' ? ' tr' : ''), html: '<span>' + r.num + '</span>', iconSize: [26, 26], iconAnchor: [13, 13] });
    L.marker([r.lat, r.lng], { icon }).addTo(layer).bindTooltip(r.t + ' · ' + r.name).on('click', () => set({ sel: r.k }));
  });
  if (fit && pts.length) map.fitBounds(L.latLngBounds(pts).pad(0.25), { maxZoom: 16 });
}

// ───────────────────────── acciones ─────────────────────────
function move(k, dir) {
  const acts = [...dayActs(S.day)], j = k + dir; if (j < 0 || j >= acts.length) return;
  const times = acts.map(([, t]) => t); [acts[k], acts[j]] = [acts[j], acts[k]];
  setDayActs(S.day, acts.map(([id], n) => [id, times[n]])); set({ sel: j });
}
function addToDay(i, id) {
  if (inDay(i, id)) { toast('Ya está en el día ' + (i + 1)); return; }
  const acts = [...dayActs(i)], last = acts[acts.length - 1];
  const t = last ? fmt(toMin(last[1]) + BY_ID[last[0]].dur + 20) : '09:00';
  setDayActs(i, [...acts, [id, t]].sort((a, b) => toMin(a[1]) - toMin(b[1])));
  toast(BY_ID[id].name + ' → día ' + (i + 1)); render();
}
const ACTIONS = {
  theme: () => set({ theme: isDark() ? 'light' : 'dark' }),
  plan: (el) => set({ plan: el.dataset.v }),
  flight: (el) => set({ [el.dataset.dir]: el.dataset.v }),
  openday: (el) => { location.hash = 'planner'; set({ screen: 'planner', day: +el.dataset.i, sel: null }); },
  day: (el) => set({ day: +el.dataset.i, sel: null }),
  sel: (el, e) => { if (e.target.closest('a,button,select')) return; const k = +el.dataset.k; set({ sel: S.sel === k ? null : k }); },
  up: (el) => move(+el.dataset.k, -1), down: (el) => move(+el.dataset.k, 1),
  del: (el) => { const acts = dayActs(S.day).filter((_, n) => n !== +el.dataset.k); setDayActs(S.day, acts); set({ sel: null }); },
  reset: () => { const c = { ...S.custom }; delete c[S.day]; set({ custom: c, sel: null }); },
  mview: (el) => { set({ mview: el.dataset.v }); if (map) setTimeout(() => { map.invalidateSize(); drawDay(true); }, 60); },
  sat: () => set({ sat: !S.sat }), fit: () => drawDay(true),
  filter: (el) => set({ filters: { ...S.filters, [el.dataset.v]: !S.filters[el.dataset.v] } }), clearf: () => set({ filters: {} }),
  save: (el) => { const id = el.dataset.id; set({ savedIds: S.savedIds.includes(id) ? S.savedIds.filter((x) => x !== id) : [...S.savedIds, id] }); },
  pf: (el) => set({ photoF: { ...S.photoF, [el.dataset.v]: !S.photoF[el.dataset.v] } }), pday: (el) => set({ photoDay: S.photoDay === +el.dataset.i ? null : +el.dataset.i }), pclear: () => set({ photoF: {}, photoDay: null }),
};
document.addEventListener('click', (e) => {
  const go = e.target.closest('[data-go]');
  if (go) { e.preventDefault(); location.hash = go.dataset.go; set({ screen: go.dataset.go, sel: null }); scrollTo(0, 0); return; }
  const el = e.target.closest('[data-act]'); if (!el || el.tagName === 'SELECT' || el.type === 'checkbox') return;
  const fn = ACTIONS[el.dataset.act]; if (fn) fn(el, e);
});
document.addEventListener('change', (e) => {
  const el = e.target;
  if (el.dataset.act === 'addto' && el.value !== '') addToDay(+el.value, el.dataset.id);
  if (el.dataset.act === 'gear') set({ gear: { ...S.gear, [el.dataset.v]: el.checked } });
  if (el.dataset.act === 'booked') set({ booked: { ...S.booked, [el.dataset.v]: el.checked } });
});
addEventListener('hashchange', () => { const h = hashScreen(); if (h !== S.screen) set({ screen: h, sel: null }); });
render();
