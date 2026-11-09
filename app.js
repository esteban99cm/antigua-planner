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
  if (a.zone === 'Volcán' || b.zone === 'Volcán') return { mode: 'trail', min: 0, km: d, cost: 0, label: '', sub: kmTxt(d) };
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

// ───────────────────────── fotos ─────────────────────────
const pic = (k, cls = '', eager = false) => k && PHOTOS[k] ? `<img class="${cls}" src="${IMG(k)}" alt="${esc(PHOTOS[k].cap)}" style="object-position:${PHOTOS[k].pos}" ${eager ? '' : 'loading="lazy"'} decoding="async">` : '';
const ZONE_LABEL = { Antigua: 'Antigua', Lago: 'Atitlán', Volcán: 'Acatenango', Ruta: 'Ruta' };

// ───────────────────────── render ─────────────────────────
const MNAV = [['overview', 'Resumen', '<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>'], ['planner', 'Plan', '<path d="M4 5h16M4 12h16M4 19h10"/>'], ['explore', 'Explorar', '<circle cx="12" cy="12" r="9"/><path d="M15 9l-2 6-4 2 2-6z"/>'], ['photo', 'Foto', '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>'], ['volcano', 'Volcán', '<path d="M2 21l7-12 3 4 3-6 7 14z"/>'], ['book', 'Reservas', '<path d="M5 3h14v18l-7-4-7 4z"/>']];

function render() {
  document.documentElement.dataset.theme = isDark() ? 'dark' : 'light';
  $('meta[name="theme-color"]').setAttribute('content', isDark() ? '#0B0D16' : '#F3F1EC');
  $('#themeLabel').textContent = isDark() ? 'Día' : 'Noche';
  $('#nav').innerHTML = SCREENS.map(([k, l], n) => `<button data-go="${k}" class="${S.screen === k ? 'on' : ''}"><i>0${n + 1}</i>${l}</button>`).join('');
  $('#mnav').innerHTML = MNAV.map(([k, l, ic]) => `<button data-go="${k}" class="${S.screen === k ? 'on' : ''}"><svg viewBox="0 0 24 24">${ic}</svg><span>${l}</span></button>`).join('');
  const R = { overview: rOverview, planner: rPlanner, explore: rExplore, photo: rPhoto, volcano: rVolcano, book: rBook }[S.screen];
  $('#view').className = 'view v-' + S.screen;
  $('#view').innerHTML = R();
  if (S.screen === 'planner') mountMap();
}
const secH = (n, title, extra = '') => `<header class="sec-h"><span class="num">${n}</span><h2>${title}</h2>${extra}</header>`;

function budgetTotals() {
  const usdT = BUDGET.reduce((s, b) => s + b[S.plan], 0);
  return { usdT, crcT: usdT * TRIP.fx.crc };
}

function rOverview() {
  const o = outF(), b = backF(), { usdT, crcT } = budgetTotals();
  const lo = TRIP.budget.min, hi = TRIP.budget.max, scaleMax = Math.max(hi * 1.4, crcT * 1.05);
  const pos = (v) => Math.min(100, v / scaleMax * 100);
  const state = crcT <= hi ? 'ok' : crcT <= hi * 1.1 ? 'warn' : 'over';
  const days = DAYS.map((_, i) => buildDay(i));
  const daysLeft = Math.ceil((Date.parse(TRIP.start + 'T00:00:00-06:00') - Date.now()) / 864e5);
  return `
  <section class="hero">
    <figure class="hero-img">${pic('fuego-noche', '', true)}</figure>
    <div class="hero-txt">
      <p class="kicker">Viaje en solitario${daysLeft > 0 ? ' — faltan ' + daysLeft + ' días' : ''}</p>
      <h1>Antigua<br>Atitlán<br><span>Acatenango</span></h1>
      <p class="lede">Seis días entre la ciudad colonial, una noche a orillas del lago y el amanecer en la cima del Acatenango con el Fuego erupcionando debajo.</p>
      <dl class="hero-facts">
        <div><dt>Fechas</dt><dd>8–13 dic</dd></div><div><dt>Noches</dt><dd>5</dd></div><div><dt>Cima</dt><dd>3 976 m</dd></div><div><dt>Estimado</dt><dd>${crc(crcT)}</dd></div>
      </dl>
    </div>
    <figcaption>${esc(PHOTOS['fuego-noche'].cap)}</figcaption>
  </section>

  <section>
    ${secH('01', 'El viaje', '<button class="link" data-go="planner">Abrir el plan</button>')}
    <div class="route">${days.map((d) => `<button class="rday z-${d.where}" data-act="openday" data-i="${d.i}">
      <figure>${pic(d.photo)}</figure>
      <div class="rtxt"><span class="rdate">${String(d.num).padStart(2, '0')} · ${d.dow} ${d.label}</span><b>${esc(d.title)}</b><span class="rnight">Noche: ${esc(d.night)}</span></div></button>`).join('')}</div>
  </section>

  <section class="grid2">
    <div class="panel">
      ${secH('02', 'Vuelos', '<span class="tag warn">Por confirmar</span>')}
      <p class="muted small">Directos SJO ⇄ GUA, ~1 h 35, misma hora en los dos países. Volaris dejó la ruta en abril de 2026. ${esc(FLIGHTS.price)}</p>
      <h3 class="sub">Ida · martes 8</h3>
      <div class="flights">${FLIGHTS.out.map((f) => rFlight(f, 'out', S.out === f.id)).join('')}</div>
      <h3 class="sub">Regreso · domingo 13</h3>
      <div class="flights">${FLIGHTS.back.map((f) => rFlight(f, 'back', S.back === f.id)).join('')}</div>
      <p class="small">Marca el vuelo que compres: el día 1 y el día 6 del plan se reacomodan solos.</p>
      <div class="links">${FLIGHTS.book.map((l) => `<a class="btn" href="${l.url}" target="_blank" rel="noopener">${esc(l.name)}</a>`).join('')}</div>
      <p class="tiny muted mono">${esc(o.code)} ${o.dep}→${o.arr} / ${esc(b.code)} ${b.dep}→${b.arr}</p>
    </div>

    <div class="panel">
      ${secH('03', 'Presupuesto', `<div class="seg">${[['lean', 'Ajustado'], ['comfy', 'Cómodo']].map(([k, l]) => `<button data-act="plan" data-v="${k}" class="${S.plan === k ? 'on' : ''}">${l}</button>`).join('')}</div>`)}
      <div class="total ${state}"><b>${crc(crcT)}</b><span class="mono">${usd(usdT)} · ${esc(TRIP.fx.note)}</span></div>
      <div class="meter"><i class="range" style="left:${pos(lo)}%;width:${pos(hi) - pos(lo)}%"></i><i class="mark" style="left:${pos(crcT)}%"></i>
        <span style="left:${pos(lo)}%">₡300 mil</span><span style="left:${pos(hi)}%">₡400 mil</span></div>
      <table class="btable">${BUDGET.map((r) => `<tr><td>${esc(r.k)}<small>${esc(r.note)}</small></td><td>${usd(r[S.plan])}</td><td>${crc(r[S.plan] * TRIP.fx.crc)}</td></tr>`).join('')}</table>
      <p class="small">${state === 'over' ? 'El escenario cómodo se pasa del tope: lo que más pesa es el vuelo de temporada alta y el hotel boutique todas las noches. Si combinás Airbnb con una noche boutique quedás cerca de ₡400 mil.' : 'Dentro del rango si el vuelo sale en ~$300. Cada $50 de vuelo son ₡22 500.'}</p>
    </div>
  </section>

  <section>
    ${secH('04', 'Imperdibles')}
    <div class="tops">${TOP.map((t, k) => { const p = BY_ID[t.id]; return `<article class="must z-${p.zone}">${p.photo ? `<figure>${pic(p.photo)}</figure>` : '<figure class="empty"></figure>'}<div><span class="mono tnum">${k + 1}/${TOP.length}</span><h3>${esc(p.name)}</h3><p>${esc(t.why)}</p></div></article>`; }).join('')}</div>
  </section>

  <section class="mosaic">
    <figure class="m1">${pic('catedral-ruinas')}<figcaption>${esc(PHOTOS['catedral-ruinas'].cap)}</figcaption></figure>
    <figure class="m2">${pic('desayuno')}<figcaption>${esc(PHOTOS['desayuno'].cap)}</figcaption></figure>
    <figure class="m3">${pic('rostro-maya')}<figcaption>${esc(PHOTOS['rostro-maya'].cap)}</figcaption></figure>
  </section>

  <section>
    ${secH('05', 'Para tener a mano')}
    <dl class="practical">${PRACTICAL.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl>
  </section>
  <p class="credit mono">Fotos propias del viaje de reconocimiento.</p>`;
}
const rFlight = (f, dir, on) => `<button class="flight ${on ? 'on' : ''}" data-act="flight" data-dir="${dir}" data-v="${f.id}">
  <span class="fl-air">${esc(f.air)} ${esc(f.code)}${f.rec ? ' <i>sugerido</i>' : ''}</span>
  <span class="fl-time">${f.dep}<em>—</em>${f.arr}</span><span class="fl-note">${esc(f.note)}</span></button>`;

// ── Plan ──
function rPlanner() {
  const D = buildDay(S.day);
  return `
  <div class="days">${DAYS.map((d, i) => `<button class="dchip z-${d.where} ${S.day === i ? 'on' : ''}" data-act="day" data-i="${i}"><b>${String(i + 1).padStart(2, '0')}</b><span>${dow(d.date)} ${dayLabel(d.date)}</span></button>`).join('')}</div>
  <div class="plan ${S.mview === 'map' ? 'show-map' : ''}">
    <div class="itin">
      <header class="dhead z-${D.where}">
        <figure>${pic(D.photo, '', true)}</figure>
        <div class="dhead-txt"><span class="kicker">Día ${D.num} · ${esc(ZONE_LABEL[D.where])}</span><h2>${esc(D.title)}</h2></div>
      </header>
      <dl class="meta">
        <div><dt>Sol</dt><dd>${fmt(D.sun.sunrise)}–${fmt(D.sun.sunset)}</dd></div><div><dt>A pie</dt><dd>${kmTxt(D.walk)}</dd></div><div><dt>Gasto</dt><dd>~${usd(D.spend)}</dd></div><div><dt>Noche</dt><dd>${esc(D.night)}</dd></div>
      </dl>
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
const CONN_TAG = { walk: 'A pie', tuk: 'Tuk-tuk', uber: 'Uber', trail: 'Sendero' };
function rRow(D, r) {
  const sel = S.sel === r.k, last = r.k === D.rows.length - 1;
  return `<li class="row ${r.cat === 'Traslado' ? 'tr' : ''} z-${r.zone} ${sel ? 'sel' : ''}" data-act="sel" data-k="${r.k}">
    <div class="time"><b>${r.t}</b><span>${fmt(r.end)}</span></div>
    <div class="body">
      <div class="r1"><b>${esc(r.name)}</b>${r.cost ? `<span class="cost">${usd(r.cost)}</span>` : ''}</div>
      <span class="cat">${esc(r.cat)} · ${durTxt(r.dur)}</span>
      <p>${esc(r.desc)}</p>
      ${sel ? `<div class="more">${r.photo ? `<figure class="rphoto">${pic(r.photo)}</figure>` : ''}${r.tip ? `<p class="tip">${esc(r.tip)}</p>` : ''}${r.hours ? `<p class="tiny muted mono">Horario ${esc(r.hours)}</p>` : ''}
        <div class="links"><a class="btn sm" href="${mapsUrl(r)}" target="_blank" rel="noopener">Google Maps</a>${r.book ? `<a class="btn sm" href="${r.book}" target="_blank" rel="noopener">Reservar</a>` : ''}
        <button class="btn sm ghost" data-act="up" data-k="${r.k}" ${r.k === 0 ? 'disabled' : ''} aria-label="Subir">↑</button><button class="btn sm ghost" data-act="down" data-k="${r.k}" ${last ? 'disabled' : ''} aria-label="Bajar">↓</button><button class="btn sm ghost" data-act="del" data-k="${r.k}">Quitar</button></div></div>` : ''}
    </div>
  </li>${r.conn ? `<li class="conn"><span class="ctag">${CONN_TAG[r.conn.mode]}</span>${r.conn.url ? `<a href="${r.conn.url}" target="_blank" rel="noopener">${esc(r.conn.label)}</a>` : esc(r.conn.label)}<span>${esc(r.conn.sub)}</span></li>` : ''}`;
}

// ── Explorar ──
const activeF = () => Object.keys(S.filters).filter((k) => S.filters[k]);
const matchF = (p) => { const f = activeF(); return f.every((k) => tagsOf(p).includes(k) || p.zone === k || p.price === k || (k === 'Guardados' && S.savedIds.includes(p.id))); };
function rExplore() {
  const list = PLACES.filter((p) => p.cat !== 'Traslado' && p.cat !== 'Hotel').filter(matchF);
  return `
  ${secH('03', 'Explorar', `<span class="muted mono small">${list.length} lugares</span>`)}
  <div class="filters">${[...FILTERS, ['MIS', ['Guardados']]].map(([g, opts]) => `<div class="fg"><span>${g}</span>${opts.map((o) => `<button data-act="filter" data-v="${o}" class="chip ${S.filters[o] ? 'on' : ''}">${o}</button>`).join('')}</div>`).join('')}
    ${activeF().length ? '<button class="link" data-act="clearf">Limpiar</button>' : ''}</div>
  <div class="cards">${list.map((p) => {
    const saved = S.savedIds.includes(p.id), where = DAYS.map((_, i) => inDay(i, p.id) ? i + 1 : null).filter(Boolean);
    return `<article class="pcard z-${p.zone} ${p.photo ? 'has-ph' : ''}">${p.photo ? `<figure>${pic(p.photo)}</figure>` : ''}<div class="pc-in"><div class="pc-top"><span class="zone">${esc(ZONE_LABEL[p.zone])}</span><span>${esc(p.cat)}</span><span class="price">${esc(p.price)}</span></div>
      <h3>${esc(p.name)}</h3><p>${esc(p.desc)}</p>${p.tip ? `<p class="tip">${esc(p.tip)}</p>` : ''}
      <div class="pc-foot"><button class="btn sm ${saved ? 'on' : 'ghost'}" data-act="save" data-id="${p.id}">${saved ? 'Guardado' : 'Guardar'}</button>
        <select data-act="addto" data-id="${p.id}" aria-label="Añadir a un día"><option value="">${where.length ? 'En día ' + where.join(', ') : 'Añadir a…'}</option>${DAYS.map((d, i) => `<option value="${i}">Día ${i + 1} · ${dow(d.date)} ${dayLabel(d.date)}</option>`).join('')}</select>
        <a class="link small" href="${mapsUrl(p)}" target="_blank" rel="noopener">Maps</a></div></div></article>`;
  }).join('')}</div>`;
}

// ── Modo foto ──
function rPhoto() {
  const f = Object.keys(S.photoF).filter((k) => S.photoF[k]);
  const spots = PHOTO_SPOTS.filter((s) => (S.photoDay == null || s.day === S.photoDay) && f.every((k) => s.tags.includes(k)))
    .map((s) => { const sun = sunTimes(DAYS[s.day].date, s.where), t = s.when in sun ? sun[s.when] : toMin(s.when); return { ...s, p: BY_ID[s.id], t, lab: SUN_LABEL[s.when] || 'Hora fija' }; })
    .sort((a, b) => a.day - b.day || a.t - b.t);
  return `
  ${secH('04', 'Modo foto', '<span class="muted mono small">Sol calculado por día y lugar · UTC−6</span>')}
  <div class="suntable">${DAYS.map((d, i) => { const s = sunTimes(d.date, d.where); return `<button class="sunday ${S.photoDay === i ? 'on' : ''}" data-act="pday" data-i="${i}"><b>${dow(d.date)} ${dayLabel(d.date)}</b><span>${esc(ZONE_LABEL[d.where])}</span>
    <dl><dt>Amanecer</dt><dd>${fmt(s.sunrise)}</dd><dt>Dorada</dt><dd>${fmt(s.golden)}</dd><dt>Atardecer</dt><dd>${fmt(s.sunset)}</dd><dt>Azul</dt><dd>${fmt(s.blue)}</dd></dl></button>`; }).join('')}</div>
  <div class="filters"><div class="fg"><span>TIPO</span>${PHOTO_FILTERS.map((o) => `<button class="chip ${S.photoF[o] ? 'on' : ''}" data-act="pf" data-v="${o}">${o}</button>`).join('')}</div>${S.photoDay != null || f.length ? '<button class="link" data-act="pclear">Ver todos</button>' : ''}</div>
  <div class="spots">${spots.map((s) => `<article class="spot z-${s.p.zone}">${s.p.photo ? `<figure>${pic(s.p.photo)}</figure>` : '<figure class="empty"></figure>'}
    <div class="sp-in"><div class="sp-time"><b>${fmt(s.t)}</b><span>${esc(s.lab)} · día ${s.day + 1}</span></div><span class="kind">${esc(s.kind)}</span><h3>${esc(s.p.name)} <span class="stars">${'●'.repeat(s.stars)}${'○'.repeat(5 - s.stars)}</span></h3><p>${esc(s.tip)}</p>
    <a class="link small" href="${mapsUrl(s.p)}" target="_blank" rel="noopener">Ubicación</a></div></article>`).join('') || '<p class="muted">Ningún spot con esos filtros.</p>'}</div>
  <p class="small muted">El Fuego se ve mejor de noche y en la hora azul; el Volcán de Agua suele despejarse temprano y nublarse después del mediodía.</p>`;
}

// ── Acatenango ──
function rVolcano() {
  const d4 = buildDay(3), d5 = buildDay(4), got = VOLCANO.gear.filter(([g]) => S.gear[g]).length;
  const sun = sunTimes(DAYS[4].date, 'Volcán');
  return `
  <section class="vhero"><figure>${pic('fuego-dia', '', true)}</figure><div class="vhero-txt"><p class="kicker">Vie 11 – sáb 12 dic</p><h1>Acatenango</h1>
    <p class="lede">Una noche frente al Fuego y la cima al amanecer, incluida en el tour estándar: salida 04:00, sol a las ${fmt(sun.sunrise)}.</p></div><figcaption>${esc(PHOTOS['fuego-dia'].cap)}</figcaption></section>
  <dl class="facts">${VOLCANO.facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
  <section class="grid2">
    <div class="panel">${secH('01', 'Cronología')}
      <ol class="vt">${[...d4.rows.map((r) => [0, r.start, d4.dow, r.name]), [0, d4.sun.sunset, d4.dow, 'Atardecer en el campamento'], [1, d5.sun.sunrise, d5.dow, 'Sale el sol en la cima'], ...d5.rows.slice(0, 4).map((r) => [1, r.start, d5.dow, r.name])]
        .sort((x, y) => x[0] - y[0] || x[1] - y[1]).map(([, m, dw, name]) => `<li><b>${dw} ${fmt(m)}</b><span>${esc(name)}</span></li>`).join('')}</ol>
      <figure class="inline-ph">${pic('sendero-bosque')}<figcaption>${esc(PHOTOS['sendero-bosque'].cap)}</figcaption></figure>
    </div>
    <div class="panel">${secH('02', 'Operadores', '<span class="tag">Por persona</span>')}
      <ul class="ops">${VOLCANO.ops.map((o) => `<li><div><b>${esc(o.name)}</b><span>${esc(o.note)}</span></div><em>${esc(o.price)}</em><a class="btn sm" href="${o.url}" target="_blank" rel="noopener">Ver</a></li>`).join('')}</ul>
      <p class="small muted">Precios de referencia de buscadores (2026). La cresta del Fuego no está en el plan; si te animás allá arriba cuesta Q200–300 extra en efectivo.</p>
      <h3 class="sub">Antes de reservar, preguntá</h3><ul class="ask">${VOLCANO.ask.map((a) => `<li>${esc(a)}</li>`).join('')}</ul>
      <h3 class="sub">Estado del volcán</h3><div class="links">${VOLCANO.status.map((l) => `<a class="btn sm" href="${l.url}" target="_blank" rel="noopener">${esc(l.name)}</a>`).join('')}</div>
      <figure class="inline-ph">${pic('fuego-explosion')}<figcaption>${esc(PHOTOS['fuego-explosion'].cap)}</figcaption></figure>
    </div>
  </section>
  <section>${secH('03', 'Equipo', `<span class="tag">${got}/${VOLCANO.gear.length} listo</span>`)}
    <div class="gear">${VOLCANO.gear.map(([g, how]) => `<label class="${S.gear[g] ? 'done' : ''}"><input type="checkbox" data-act="gear" data-v="${esc(g)}" ${S.gear[g] ? 'checked' : ''}><span>${esc(g)}</span><em class="h-${how}">${how}</em></label>`).join('')}</div>
    <p class="small muted">Para alquilar: en Antigua cuesta ~Q25–50 la pieza, o pedilo con el tour. Recogelo el jueves 10 en la tarde.</p></section>`;
}

// ── Reservas ──
function rBook() {
  const items = [
    { id: 'fl-out', what: 'Vuelo de ida', when: 'Mar 8', detail: `${outF().air} ${outF().code} · ${outF().dep} → ${outF().arr}`, links: FLIGHTS.book.slice(0, 2).concat(FLIGHTS.book.slice(3)) },
    { id: 'fl-back', what: 'Vuelo de regreso', when: 'Dom 13', detail: `${backF().air} ${backF().code} · ${backF().dep} → ${backF().arr} · se compra con la ida`, links: [] },
    ...STAYS.filter((s) => !s.included).map((s) => ({ id: 'st-' + s.night, what: 'Hospedaje · ' + ZONE_LABEL[s.zone], when: s.label, detail: s.picks.map((p) => p.name).join(' · '), picks: s.picks })),
    { id: 'acat', what: 'Tour Acatenango (cima incluida)', when: 'Vie 11 – Sáb 12', detail: 'Incluye la noche en el campamento', links: VOLCANO.ops.map((o) => ({ name: o.name + (o.price ? ' · ' + o.price : ''), url: o.url })) },
    { id: 'sh-1', what: 'Shuttle Antigua → San Juan La Laguna', when: 'Mié 9 · 08:00', detail: '~$22 compartido', links: [{ name: 'Turisteando', url: BY_ID.shuttlesj.book }] },
    { id: 'sh-2', what: 'Shuttle Panajachel → Antigua', when: 'Jue 10 · ~11:45', detail: '~$15 compartido', links: [{ name: 'Turisteando', url: BY_ID.shuttleant.book }] },
    { id: 'gear', what: 'Alquiler de equipo para el volcán', when: 'Jue 10 tarde', detail: 'Con el operador o en tiendas de la 6a Av', links: [] },
  ];
  const done = items.filter((x) => S.booked[x.id]).length;
  return `
  ${secH('06', 'Reservas', `<span class="tag">${done}/${items.length} hecho</span>`)}
  <p class="muted">Los links ya llevan las fechas del viaje y 1 adulto. Marcá cada cosa cuando la tengas confirmada.</p>
  <div class="book">${items.map((x) => `<article class="bitem ${S.booked[x.id] ? 'done' : ''}">
    <label class="bcheck"><input type="checkbox" data-act="booked" data-v="${x.id}" ${S.booked[x.id] ? 'checked' : ''}></label>
    <div class="bbody"><span class="bwhen">${esc(x.when)}</span><h3>${esc(x.what)}</h3><p class="muted small">${esc(x.detail)}</p>
      ${x.picks ? `<ul class="picks">${x.picks.map((p) => `<li><div><b>${esc(p.name)}</b><span>${esc(p.kind)}</span></div><em>${esc(p.price)}</em>${p.url ? `<a class="btn sm" href="${p.url}" target="_blank" rel="noopener">Booking</a>` : ''}</li>`).join('')}</ul>` : ''}
      ${x.links && x.links.length ? `<div class="links">${x.links.map((l) => `<a class="btn sm" href="${l.url}" target="_blank" rel="noopener">${esc(l.name)}</a>`).join('')}</div>` : ''}</div></article>`).join('')}</div>
  <section>${secH('+', 'Buscar por tu cuenta')}<div class="links">${STAY_SEARCH.map((l) => `<a class="btn" href="${l.url}" target="_blank" rel="noopener">${esc(l.name)}</a>`).join('')}</div>
    <p class="small muted">Para Airbnb en Antigua buscá dentro de las calles 1a–7a y las avenidas 1a–7a: todo queda a pie. Leé las reseñas sobre ruido, porque los fines de semana hay fiesta en algunas cuadras.</p></section>`;
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
  if (pts.length > 1) L.polyline(pts, { color: getComputedStyle(document.documentElement).getPropertyValue('--lava').trim() || '#E8501C', weight: 3, dashArray: '6 6' }).addTo(layer);
  D.rows.forEach((r) => {
    const icon = L.divIcon({ className: 'pin z-' + r.zone + (S.sel === r.k ? ' sel' : '') + (r.cat === 'Traslado' ? ' tr' : ''), html: '<span>' + r.num + '</span>', iconSize: [24, 24], iconAnchor: [12, 12] });
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
