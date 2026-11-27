// UI del cancionero. Solo usa `ds` (DataSource) para leer y guardar.
import { LocalDataSource, ClaveError } from './datasource.js';
import { ApiDataSource } from './apidatasource.js';
import { CONFIG } from './config.js';
import { demoSeed } from './demo.js';
import { KEYS, keyAt, shiftTo, keyOption, showKey, transposer, tonosDelItem, tonoMas, intervalo, enTonos, CHORD } from './music.js';
import { prepare, blocksOf, contenidoDe, SUBA, defArr, isDefArr, variantesDe, blockText, base, rOf, labOf, summary, historyOf, search, fmt, isoOf } from './songs.js';
import { GRUPOS } from './grupos.js';

// Motor real si hay iglesia (?c= o config) y no se pidió ?demo=1; si no, modo demo local.
const qs = new URLSearchParams(location.search);
const IGLESIA = qs.get('c') || CONFIG.iglesia;
const DEMO = qs.has('demo') || !IGLESIA || !CONFIG.motor[CONFIG.entorno];
const ds = DEMO ? new LocalDataSource({ seedFn: demoSeed }) : new ApiDataSource({ url: CONFIG.motor[CONFIG.entorno], iglesia: IGLESIA });

// ---------- Estado ----------
const prefs = (() => { try { return JSON.parse(localStorage.getItem('cancionero:prefs') || '{}'); } catch (e) { return {}; } })();
const P = { not: prefs.not || 0, adj: prefs.adj || 0, sadj: prefs.sadj || 0, modos: prefs.modos || {}, tema: prefs.tema || '' };
/** Modo claro / oscuro de este dispositivo ('' = el del sistema). Lo aplica también index.html antes de pintar. */
function aplicarTema() {
  const t = P.tema === 'light' || P.tema === 'dark' ? P.tema : '';
  if (t) document.documentElement.dataset.theme = t; else delete document.documentElement.dataset.theme;
  const metas = document.querySelectorAll('meta[name="theme-color"]');
  metas.forEach((m, k) => { m.content = t === 'dark' ? '#1c2031' : t === 'light' ? '#f2f5fa' : (k ? '#1c2031' : '#f2f5fa'); });
}
aplicarTema();
const savePrefs = () => { try { localStorage.setItem('cancionero:prefs', JSON.stringify(P)); } catch (e) {} };

let SONGS = [], REG = [], SES = [], PERS = [], INFO = {};
const unlocked = {};             // id de reunión → clave verificada (solo en memoria)
let view = { shift: 0 };          // estado de la hoja abierta
let lastQ = '';

const app = document.getElementById('app');
const tabsEl = document.getElementById('tabs');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const $ = s => app.querySelector(s), $$ = s => [...app.querySelectorAll(s)];
const songBy = id => SONGS.find(s => s.id === id);
const sesBy = id => SES.find(r => r.id === id);
// Grupos por tono (js/grupos.js): GR = id → ids del grupo; REP = id → { id que se muestra en la lista, regla del tono }.
let GR = {}, REP = {};
function armarGrupos() {
  GR = {}; REP = {};
  GRUPOS.forEach(g => {
    const ids = g.filter(songBy); if (ids.length < 2) return; ids.forEach(id => { GR[id] = ids; });
    // Regla 2: el tono más usado en el Registro (empate: el más reciente). Regla 3: el del primer Word.
    const n = {}, ult = {}, porId = {};
    historyOf(ids, REG, SES, songBy).forEach(x => { const t = String(x.t || '').split(/\s*[-→]\s*/)[0]; if (!t) return;
      n[t] = (n[t] || 0) + 1; porId[x.id] = (porId[x.id] || 0) + 1; if ((x.f || '') >= (ult[t] || '')) ult[t] = x.f || ''; });
    const T = Object.keys(n).sort((a, b) => n[b] - n[a] || (ult[b] || '').localeCompare(ult[a] || ''))[0];
    const rep = !T ? ids[0] : ids.find(id => songBy(id).tono === T) || [...ids].sort((a, b) => (porId[b] || 0) - (porId[a] || 0))[0];
    ids.forEach(id => { REP[id] = { id: rep, regla: T ? 2 : 3 }; });
  });
}
// Búsqueda sobre todos los Word; cada grupo aparece una sola vez, con su Word representativo.
const buscar = q => { const vistos = new Set(); return search(SONGS, q, perOf).map(x => REP[x.s.id] ? { ...x, s: songBy(REP[x.s.id].id) } : x)
  .filter(x => !vistos.has(x.s.id) && vistos.add(x.s.id)); };
// Versiones del mismo título o del mismo grupo (otro tono, otro archivo) comparten historial.
const versiones = id => { const s = songBy(id); if (!s) return [id]; const t = s.titulo.toLowerCase();
  return [...new Set([...SONGS.filter(x => x.titulo.toLowerCase() === t).map(x => x.id), ...(GR[id] || [])])]; };
const perOf = id => summary(versiones(id), REG, SES, songBy).per;
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const interp = s => s.interprete && s.interprete !== '-' ? s.interprete : '';
// Ítems de reunión: canción ({ id }) o medley ({ tipo: 'medley', nombre, canciones: [{ id }] }).
const itemOk = c => c.tipo === 'medley' ? (c.canciones || []).some(x => songBy(x.id)) : !!songBy(c.id);
const tituloItem = c => c.tipo === 'medley' ? (c.nombre || (c.canciones || []).map(x => (songBy(x.id) || {}).titulo).filter(Boolean).join(' + '))
  : ((songBy(c.id) || {}).titulo || '');
/** Ítem con el transporte personal del músico (d semitonos): tono de inicio y tonos por parte. */
// Cambiar el tono de inicio corre también los tonos elegidos por parte, así se conservan las subidas.
const cambiarInicio = (c, t) => { const d = intervalo(c.tono, t); c.tono = t; (c.arr || []).forEach(p => { if (p.tono) p.tono = tonoMas(p.tono, d); }); };
const conDelta = (c, d) => !d ? c : { ...c, tono: tonoMas(c.tono, d), arr: (c.arr || []).map(p => p.tono ? { ...p, tono: tonoMas(p.tono, d) } : p) };

// ---------- Fechas (siempre en español; la fecha de una reunión es solo día: AAAA-MM-DD) ----------
const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const diaDe = f => { const [y, m, d] = String(f || '').split('-').map(Number); return y ? DIAS[new Date(y, m - 1, d).getDay()] : ''; };
/** "2026-11-29" → "Domingo 29-11-2026". */
const fechaLarga = f => f ? diaDe(f) + ' ' + fmt(f) : '';
/** Nombre de reunión para mostrar: si viene roto (fecha en inglés con hora y huso), se arma desde la fecha. */
const nombreSes = r => !r.nombre || /GMT|\d{1,2}:\d{2}:\d{2}|^(Sun|Mon|Tue|Wed|Thu|Fri|Sat) /.test(r.nombre) ? fechaLarga(r.fecha) : r.nombre;

// Alto real visible: en Android (app instalada, pantalla completa) 100dvh incluye la barra de navegación
// del sistema y el pie quedaba debajo, obligando a hacer scroll.
const fijarAlto = () => document.documentElement.style.setProperty('--alto', innerHeight + 'px');
fijarAlto(); addEventListener('resize', fijarAlto);

// ---------- Navegación ----------
// Historial por niveles: 0 = Canciones/Reuniones · 1 = una canción, una reunión, Ajustes · 2 = vista Cantante/Músico
// (y edición) · 3 = partes de una canción en la edición. La entrada k del historial siempre es de nivel k:
// entrar más profundo apila UN paso, el mismo nivel reemplaza, volver es history.go(-n). "Adelante" se anula.
let NAVDIR = 'fwd';
const segs = h => decodeURIComponent((h || '').replace(/^#/, '') || '/').split('/').filter(Boolean);
const nivel = h => {
  const p = segs(h);
  if (!p.length || (p[0] === 'canciones' || p[0] === 'reuniones') && !p[1]) return 0;
  if (p[0] === 'cancion') return p[2] ? 2 : 1;
  if (p[0] === 'reunion') return Math.min(p.length - 1, 3);
  return 1;                                                    // ajustes, reuniones/nueva, otros
};
const padre = h => {
  const p = segs(h);
  if (nivel(h) === 0) return null;
  if (p.length <= 2) return p[0] === 'reunion' || p[0] === 'reuniones' ? '#/reuniones' : '#/canciones';
  return '#/' + p.slice(0, -1).join('/');
};
let NIVEL = 0, IGNORAR = 0, DESTINO = null, SALIR = 0, ULTIMO0 = '#/canciones';
const st = d => ({ nav: 1, d });
const go = (hash, dir) => {
  const t = nivel(hash);
  if (t > NIVEL) { NAVDIR = dir || 'fwd'; history.pushState(st(t), '', hash); NIVEL = t; return render(); }
  if (t === NIVEL) { NAVDIR = dir || 'fwd'; history.replaceState(st(t), '', hash); return render(); }
  NAVDIR = 'back'; DESTINO = hash; history.go(t - NIVEL);     // vuelve; popstate dibuja
};
const replaceHash = hash => { history.replaceState(st(NIVEL), '', hash); };
const atras = () => { if (NIVEL > 0) { NAVDIR = 'back'; history.back(); } else go(location.hash || '#/canciones', 'back'); };
function navInit() {
  const h = location.hash || '#/canciones';
  if (history.state && history.state.nav) { NIVEL = history.state.d; return; }   // recarga: el historial ya está armado
  const cadena = []; for (let x = h; x; x = padre(x)) cadena.unshift(x);
  // Debajo del nivel 0 queda una entrada "salida": atrás en la pantalla principal pide confirmar.
  history.replaceState(st(-1), '', cadena[0]);
  history.pushState(st(0), '', cadena[0]);
  for (let k = 1; k < cadena.length; k++) history.pushState(st(k), '', cadena[k]);
  NIVEL = cadena.length - 1;
}
addEventListener('popstate', e => {
  if (IGNORAR) { IGNORAR--; return; }
  const s = e.state;
  if (!s || !s.nav) {                                           // URL tipeada a mano o entrada vieja: se adopta como está
    NIVEL = nivel(location.hash); history.replaceState(st(NIVEL), '', location.hash || '#/canciones'); return render();
  }
  if (s.d === -1) {                                             // atrás en la pantalla principal
    if (Date.now() - SALIR < 2500) { history.back(); return; }  // segundo toque: sale de la app
    SALIR = Date.now(); history.pushState(st(0), '', ULTIMO0); NIVEL = 0;
    toast('Tocá atrás de nuevo para salir'); return;
  }
  if (s.d > NIVEL) { IGNORAR = 1; history.go(NIVEL - s.d); return; }   // "adelante": nunca vuelve a donde estaba
  NIVEL = s.d; NAVDIR = 'back';
  if (DESTINO && location.hash !== DESTINO) history.replaceState(st(NIVEL), '', DESTINO);
  DESTINO = null; render();
});
// Links internos (#/…): pasan por go para respetar los niveles.
document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="#/"]'); if (!a || e.defaultPrevented || e.ctrlKey || e.metaKey || e.shiftKey) return;
  e.preventDefault(); a.hasAttribute('data-back') ? atras() : go(a.getAttribute('href'));
});

function transition(fn) {
  document.documentElement.dataset.dir = NAVDIR; NAVDIR = 'fwd';
  if (!document.startViewTransition || reduced() || document.hidden) { fn(); return; }
  // Si el navegador no llega a ejecutar la transición (pestaña en segundo plano), dibujar igual.
  let done = false;
  const once = () => { if (!done) { done = true; fn(); } };
  const vt = document.startViewTransition(once);
  vt.ready.catch(() => {}); vt.finished.catch(() => {});   // saltearla no es un error
  setTimeout(() => { if (!done) { vt.skipTransition?.(); once(); } }, 300);
}


function render() {
  if (nivel(location.hash) === 0) ULTIMO0 = location.hash || '#/canciones';
  const h = decodeURIComponent(location.hash.slice(1) || '/');
  const p = h.split('/').filter(Boolean);
  transition(() => {
    scrollTo(0, 0);
    if (!p.length || p[0] === 'canciones') return songList();
    if (p[0] === 'ajustes') return settings();
    if (p[0] === 'reuniones') return p[1] === 'nueva' ? newSes() : sesList();
    if (p[0] === 'cancion') { const s = songBy(p[1]); if (!s) return songList(); return p[2] ? openSheet(s, p[2], null) : pickMode(s); }
    if (p[0] === 'reunion') {
      const r = sesBy(p[1]); if (!r) return sesList();
      if (p[2] === 'editar') { if (!unlocked[r.id]) { setTimeout(() => go('#/reunion/' + r.id)); return openSes(r); } return p[3] != null ? parts(r, +p[3]) : editSes(r); }
      if (p[2] != null) return openSesSong(r, +p[2]);
      return openSes(r);
    }
    songList();
  });
}

function setTabs(w) {
  tabsEl.hidden = !w;
  tabsEl.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.t === w));
  document.body.dataset.screen = w || 'detail';
}
tabsEl.addEventListener('click', e => { const b = e.target.closest('button'); if (b) go(b.dataset.t === 'c' ? '#/canciones' : '#/reuniones'); });

// ---------- Estado de conexión ----------
const statusEl = document.getElementById('status');
function paintStatus() {
  const s = ds.status(), d = s.updatedAt ? new Date(s.updatedAt) : null;
  const hm = d ? String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0') : '';
  const isToday = d && isoOf(d) === isoOf(new Date());
  const when = d ? (isToday ? 'hoy ' + hm : fmt(isoOf(d)).slice(0, 5)) : '';
  statusEl.dataset.online = s.online;
  statusEl.innerHTML = `<span class="dot" aria-hidden="true"></span><span>${s.online
    ? (d ? 'Actualizado ' + esc(when) : 'Conectado')
    : 'Sin conexión' + (d ? ' · datos del ' + esc(isToday ? 'hoy' : fmt(isoOf(d)).slice(0, 5)) : '')}</span>
    ${s.online ? '<button type="button" id="refresh">Actualizar</button>' : ''}${s.source === 'demo' ? '<span class="demo">Modo demo</span>' : ''}<a class="cfg" href="#/ajustes">Ajustes</a>`;
  const b = document.getElementById('refresh');
  if (b) b.onclick = async () => { b.disabled = true; b.textContent = 'Actualizando…'; try { await load(true); } finally { paintStatus(); render(); } };
}
addEventListener('online', paintStatus); addEventListener('offline', paintStatus);

// ---------- Componentes ----------
const songItem = ({ s, snip, who }, attr) => `<li><button type="button" ${attr}="${esc(s.id)}" class="row">
  <span class="row-main"><b>${esc(s.titulo)}</b><small>${who ? esc(who) : snip ? '“' + esc(snip) + '”' : esc(interp(s))}</small></span>
  <span class="key">${esc(s.tono)}</span></button></li>`;

const back = (label, hash) => `<a class="back" href="${hash}" data-back>← ${esc(label)}</a>`;

function personSelect(attr, val) {
  return `<select ${attr}>${PERS.map(p => `<option${p === val ? ' selected' : ''}>${esc(p)}</option>`).join('')}<option value="__new">+ Agregar otro nombre…</option></select>`;
}
function wirePerson(sel, onSet) {
  let prev = sel.value;
  sel.addEventListener('change', () => {
    if (sel.value !== '__new') { prev = sel.value; onSet(sel.value); return; }
    const box = document.createElement('span'); box.className = 'newp';
    box.innerHTML = '<input placeholder="Nombre" autocomplete="off" aria-label="Nombre nuevo"><button type="button">OK</button><button type="button" aria-label="Cancelar">✕</button>';
    sel.replaceWith(box); const [inp, ok, cx] = box.children; inp.focus();
    const done = v => {
      if (v) {
        if (!PERS.includes(v)) PERS.push(v);
        if (![...sel.options].some(o => o.value === v)) { const o = document.createElement('option'); o.textContent = v; sel.insertBefore(o, sel.lastElementChild); }
        sel.value = v; prev = v; onSet(v);
      } else sel.value = prev;
      box.replaceWith(sel);
    };
    ok.onclick = async () => done(await ds.addPersona(inp.value)); cx.onclick = () => done('');
    inp.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); ok.click(); } if (e.key === 'Escape') cx.click(); };
  });
}
const ICON = {
  mic: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v4M8 22h8"/></svg>',
  piano: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="4" width="19" height="16" rx="2.5"/><path d="M8.8 14v6M15.2 14v6"/><rect class="bk" x="7.3" y="4" width="3" height="10" rx=".6"/><rect class="bk" x="13.7" y="4" width="3" height="10" rx=".6"/></svg>',
  search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  chev: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>',
};
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const dateBlock = f => { const [y, m, d] = (f || '').split('-'); return f ? `<span class="dblock" aria-label="${esc(fmt(f))}"><b>${+d}</b><small>${MESES[+m - 1]}</small></span>` : '<span class="dblock"></span>'; };
const modeChooser = () => `<div class="mode">
  <button type="button" data-mode="c">${ICON.mic}<span class="mode-t">Cantante</span><small>Canto: solo la letra, grande</small></button>
  <button type="button" data-mode="m">${ICON.piano}<span class="mode-t">Músico</span><small>Toco: acordes y cambio de tono</small></button></div>`;

// ---------- Canciones ----------
function songList() {
  setTabs('c');
  const today = isoOf(new Date());
  const next = [...SES].filter(r => r.fecha >= today).sort((a, b) => a.fecha.localeCompare(b.fecha))[0];
  const daysTo = next ? Math.round((new Date(next.fecha + 'T00:00') - new Date(today + 'T00:00')) / 864e5) : 0;
  const when = !next ? '' : daysTo === 0 ? 'Hoy' : daysTo === 1 ? 'Mañana' : daysTo < 7 ? 'Este ' + diaDe(next.fecha).toLowerCase() : 'Próxima reunión';
  const hero = next ? `<button type="button" class="next" id="next">
      <span class="next-top"><span class="next-when">${esc(when)}</span><span class="next-date">${esc(fmt(next.fecha))}</span></span>
      <span class="next-name">${esc(nombreSes(next))}</span>
      <span class="next-who">Dirige ${esc(next.director)}</span>
      <span class="next-songs">${next.canciones.slice(0, 5).map(c => `<span><i>${esc(c.tono)}</i>${esc(tituloItem(c))}</span>`).join('')}
        ${next.canciones.length > 5 ? `<span class="more">y ${next.canciones.length - 5} más</span>` : ''}${next.canciones.length ? '' : '<span class="more">Todavía sin canciones</span>'}</span>
      <span class="next-go">Abrir la reunión ${ICON.chev}</span></button>` : '';
  app.innerHTML = `${lastQ ? '' : hero}<div class="searchbox">${ICON.search}<input type="search" id="q" placeholder="Buscar canción, frase o director" value="${esc(lastQ)}" aria-label="Buscar canciones" autocomplete="off"></div>
  <ul class="list" id="res"></ul>`;
  $('#next') && ($('#next').onclick = () => go('#/reunion/' + next.id));
  const q = $('#q'), res = $('#res');
  const paint = () => {
    const had = !!lastQ; lastQ = q.value;
    if (!!lastQ !== had && $('#next')) $('#next').hidden = !!lastQ;
    const f = buscar(q.value);
    res.innerHTML = f.map(x => songItem(x, 'data-id')).join('') || '<li class="empty">No hay canciones con ese nombre, frase ni director. Probá con otra palabra.</li>';
    if (!reduced()) res.animate([{ opacity: .35 }, { opacity: 1 }], { duration: 160, easing: 'ease-out' });
  };
  q.oninput = paint; paint();
  res.onclick = e => { const b = e.target.closest('[data-id]'); if (b) go('#/cancion/' + b.dataset.id); };
}

function pickMode(s) {
  setTabs(null);
  const { last, per } = summary(versiones(s.id), REG, SES, songBy), names = Object.keys(per);
  const hist = !last && !names.length ? '<div class="hist empty">Sin registros todavía.</div>'
    : `<div class="hist">${last ? `<div class="hist-row"><span>Última vez</span><b>${esc(fechaLarga(last.f))}</b> · ${last.q ? esc(last.q) : '<i>sin registrar quién</i>'}</div>
       <div class="hist-row"><span>Tono última vez</span><b class="kc">${esc(last.t)}</b></div>` : ''}
       ${names.length ? `<div class="hist-row pp"><label><span>Tono por persona</span> <select id="pp"><option value="">Elegir…</option>${names.map(p => `<option>${esc(p)}</option>`).join('')}</select></label><span id="ppo" aria-live="polite"></span></div>` : ''}</div>`;
  app.innerHTML = `${back('Canciones', '#/canciones')}
  <header class="songhead"><div><h2 class="title">${esc(s.titulo)}</h2><p class="meta">${esc(interp(s))}</p></div>${stamp(s.tono, !REP[s.id] ? 'Tono original' : REP[s.id].regla === 2 ? 'Tono más usado' : 'Tono original no registrado')}</header>
  <p class="ask">¿Cómo la vas a usar?</p>${modeChooser()}${hist}`;
  $$('[data-mode]').forEach(b => b.onclick = () => go(`#/cancion/${s.id}/${b.dataset.mode}`));
  const pp = $('#pp');
  if (pp) pp.onchange = () => {
    const x = per[pp.value];
    $('#ppo').innerHTML = x ? `<b class="kc">${esc(x.t)}</b> <span class="sub">${x.f ? '· ' + esc(fechaLarga(x.f)) : '· sin fecha'}${x.n > 1 ? ' · ' + x.n + ' veces' : ''}</span>` : '';
  };
}

const stamp = (k, label) => `<div class="stamp" title="${esc(label)}"><span class="stamp-k">${esc(k)}</span><span class="stamp-l">${esc(label)}</span></div>`;

// ---------- Hoja (músico / cantante) ----------
function openSheet(s, mode, ctx) {
  setTabs(null);
  view = { song: s, mode: mode === 'c' ? 'c' : 'm', shift: ctx ? ctx.shift : (view.song === s ? view.shift : 0), ctx };
  drawSheet();
}

/**
 * Grupo de cada acorde de una línea: 'p' = acordes puente (paréntesis al final de la parte), 'm' = [ ] (modular),
 * 'r' = { } (repetir), null = acorde común. Los paréntesis dentro de la línea, como (C - G), son comunes.
 */
function gruposAcordes(toks, puente) {
  const g = [], par = []; let cur = null, ini = -1;
  toks.forEach((t, i) => {
    if (cur == null && t) { const c = t[0]; if (c === '[') cur = 'm'; else if (c === '{') cur = 'r'; else if (c === '(') { cur = '('; ini = i; } }
    g.push(cur);
    if (cur && t && t.includes({ m: ']', r: '}', '(': ')' }[cur])) { if (cur === '(') par.push([ini, i]); cur = null; }
  });
  if (cur === '(') par.push([ini, toks.length - 1]);
  const ult = par[par.length - 1];
  const esPuente = !!(puente && ult) && g.slice(ult[1] + 1).every((x, j) => x === 'm' || x === 'r' || !/[A-G]/.test(toks[ult[1] + 1 + j] || ''));
  return g.map((x, i) => x === '(' ? (esPuente && i >= ult[0] && i <= ult[1] ? 'p' : null) : x);
}
/** Transporta un "token" de acordes ("[B/C#-E/C#", "{A", "(D/F#", "(Para repetir coro: C#/F)"): solo las partes que son acordes. */
const xpose = (T, tok) => tok.split(/([-–|\s])/).map(p => CHORD.test(p.replace(/[{}]/g, '')) ? T.chord(p) : p).join('');

/**
 * Hoja de un ítem (canción o medley) en HTML: cada parte en su tono (SPEC §7, tono por parte), con puentes,
 * transiciones, [ ] / { } e indicador de cambio de tono. Lo usan la vista y la impresión.
 * item: { id | tipo: 'medley', canciones, tono, arr?, modulante? }.
 */
function sheetRows(item, mus, vari) {
  const songs = {}; (item.tipo === 'medley' ? (item.canciones || []).map(c => c.id) : [item.id]).forEach(id => { const s = songBy(id); if (s) songs[id] = s; });
  const R = tonosDelItem(item, songs), medley = item.tipo === 'medley';
  const TR = (tono, sh) => transposer({ tono: tono || item.tono || 'C' }, sh || 0, P.not);
  const p0 = R.partes.find(p => !p.transicion), kd = showKey(p0 ? TR(p0.escrito, p0.sh).key : item.tono, P.not);
  const seen = new Set(); let antCancion = null;

  const rows = R.partes.map((p, k) => {
    const e = R.arr[k], s = songs[p.cancion]; if (!s) return '';
    let sep = '';
    if (medley && p.cancion !== antCancion) sep = `<div class="medsep">${esc(s.titulo)}</div>`;
    antCancion = p.cancion;
    if (p.transicion && !p.ver) return sep;                    // transición oculta (no cambia el tono)
    // Un bloque que solo trae "(Baja a F#)" repite el anterior con el mismo nombre: sus líneas, en el tono de esta parte.
    const b = e.src != null ? contenidoDe(s, e.src) : null, escr = b && b.sec && b.sec.tono || p.escrito;
    const T = TR(escr, escr === p.escrito ? p.sh : intervalo(escr, p.tono));
    const TG = { p: TR(p.puente.escrito, p.puente.sh), m: TR(p.modula.escrito, p.modula.sh), r: T };
    const VER = { p: p.puente.ver, m: p.modula.ver, r: p.repite.ver };
    // En Músico, una parte repetida en el mismo tono va solo con su título; en otro tono, completa.
    const clave = p.cancion + '#' + (b ? b.id : e.src) + '@' + tonoMas(p.tono, 0);
    let ls = b && !(mus && seen.has(clave)) ? b.lines : [];
    if (b) seen.add(clave);
    ls = ls.filter(l => (mus || (l.t !== 'ch' && l.t !== 'mix')) && !(l.t === 'ly' && SUBA.test(l.v.trim())))
      .filter((l, i, a) => l.t !== 'blank' || (i > 0 && a[i - 1].t !== 'blank'));
    while (ls.length && ls[0].t === 'blank') ls.shift();
    while (ls.length && ls[ls.length - 1].t === 'blank') ls.pop();

    // Línea de acordes (ch / mix) con grupos puente, [ ] o { }: cada grupo se transporta o se oculta.
    const textoCh = l => {
      if (!(l.puente || l.modula || l.repite)) return T.line(l.v, l.t === 'mix');
      const parts = l.v.split(/(\s+)/), toks = parts.map(x => /^\s*$/.test(x) ? '' : x), g = gruposAcordes(toks, l.puente);
      let out = '', pend = 0;
      parts.forEach((x, i) => {
        if (!x) return;
        if (/^\s+$/.test(x)) { out += ' '.repeat(Math.max(1, x.length - pend)); pend = 0; return; }
        if (g[i] && !VER[g[i]]) { pend = 0; return; }
        const n = l.t === 'mix' && !g[i] ? T.line(x, true) : xpose(g[i] ? TG[g[i]] : T, x);
        pend = Math.max(0, n.length - x.length); out += n;
      });
      return out.replace(/\s+$/, '');
    };
    const line = l => {
      if (l.t === 'blank') return '<div class="gap"></div>';
      if (l.t === 'pair') {
        if (!mus) return `<div>${esc(l.segs.map(x => x[1]).join('').trim())}</div>`;
        const g = l.puente || l.modula || l.repite ? gruposAcordes(l.segs.map(x => x[0]), l.puente) : [];
        // Una nota con palabras ("(Para repetir coro: C#/F)") va entera; se transportan solo sus acordes.
        const ac = (X, c) => /\s/.test(c) ? xpose(X, c) : X.chord(c);
        const segs = l.segs.map(([c, t], i) => [!c ? '' : g[i] ? (VER[g[i]] ? ac(TG[g[i]], c) : '') : ac(T, c), t]);
        const it = []; segs.forEach(([c, t]) => t.split(/(\s+)/).forEach((x, j) => { if (j === 0 || x) it.push({ c: j === 0 ? c : '', t: x }); }));
        const words = []; let cur = [];
        it.forEach(o => { if (/^\s+$/.test(o.t) && !o.c) { if (cur.length) words.push(cur); words.push([o]); cur = []; } else cur.push(o); });
        if (cur.length) words.push(cur);
        const sg = o => `<span class="sg"><b>${esc(o.c)}</b><span>${esc(o.t)}</span></span>`;
        return `<div class="pair">${words.map(w => `<span class="w">${w.map(sg).join('')}</span>`).join('')}</div>`;
      }
      if (l.t === 'ch') { const v = textoCh(l); return v.trim() ? `<div class="ch">${esc(v)}</div>` : ''; }
      if (l.t === 'mix') { const v = textoCh(l); return v.trim() ? `<div class="mix${l.at != null ? ' at' : ''}"${l.at != null ? ` data-anchor="${esc(l.at)}"` : ''}>${esc(v)}</div>` : ''; }
      return `<div>${esc(mus ? l.v : l.v.replace(/\s{2,}/g, ' ').trim())}</div>`;
    };
    const L = ls.map(line).filter(Boolean);
    // Indicador en el renglón del título: "Coro  ↑ A (+1½)".
    const ind = p.indicador ? `<span class="modi">${p.indicador.dir} ${esc(showKey(T.key, P.not))} (${enTonos(p.indicador.dif)})</span>` : '';
    const label = labOf(e);
    if (!label && !ind && !L.length) return sep;
    // Una parte de un solo renglón de acordes (Intro, Inter, Final) los muestra al lado del título; con 2 o más, abajo.
    if (label && ls.length === 1 && L.length === 1 && (ls[0].t === 'ch' || (ls[0].t === 'mix' && ls[0].at == null)))
      return `${sep}<section class="parte"><div class="sec inl"><span>${esc(label)}</span>${ind}<span class="${ls[0].t}">${esc(textoCh(ls[0]))}</span></div></section>`;
    // Variantes (Músico, en una reunión): el nombre de la parte es un chip para elegir otra ("es el Coro 2").
    const nv = vari && e.src != null && !e.nueva ? variantesDe(s, e.src).length : 0;
    const nomP = nv ? `<button type="button" class="varc" data-var="${k}" aria-haspopup="dialog" aria-label="${esc(label || 'Parte')}: elegir otra variante (hay ${nv})">${esc(label || 'Parte')} <span class="vart" aria-hidden="true">▾</span></button>` : `<span>${esc(label)}</span>`;
    const head = label || ind || nv ? `<div class="sec${ind ? ' inl' : ''}">${nomP}${ind}</div>` : '';
    return `${sep}<section class="parte">${head}${L.join('')}</section>`;
  }).join('');
  return { rows, kd };
}

function drawSheet(anim) {
  const { song: s, mode, shift, ctx } = view, mus = mode === 'm';
  const c = ctx && ctx.item;
  const item = c ? conDelta(c, shift - shiftTo(s, c.tono)) : { id: s.id, tono: keyAt(s, shift), arr: defArr(s) };
  // Variantes: solo en Músico dentro de una reunión, si el orden difiere del Word o es un medley.
  const vari = !!(mus && c && (c.tipo === 'medley' || ((c.arr || []).length && !isDefArr(s, c.arr))));
  const { rows, kd } = sheetRows(item, mus, vari);

  const ctl = (mus ? `<button type="button" id="dn" aria-label="Bajar medio tono">−½</button>
      <span class="now" id="now" title="Tono actual" aria-live="polite">${esc(kd)}</span>
      <button type="button" id="up" aria-label="Subir medio tono">+½</button>
      <button type="button" id="orig" title="Volver al tono original"${shift ? '' : ' disabled'}>Orig.</button>
      <button type="button" id="not" title="Cambiar cifrado: C / Do / grados">${['C', 'Do', 'I'][P.not]}</button><span class="sp"></span>` : '<span class="sp"></span>')
    + `<button type="button" id="sm" aria-label="Achicar letra">A−</button><button type="button" id="bg" aria-label="Agrandar letra">A+</button>
       <button type="button" id="sw">${mus ? 'Cantante' : 'Músico'}</button>`;

  const r = ctx && ctx.ses, i = ctx && ctx.i;
  let nav = '';
  if (r && i != null) {
    const Pv = r.canciones[i - 1], Nx = r.canciones[i + 1], t = c => esc(tituloItem(c));
    nav = `<nav class="snav" aria-label="Canciones de la reunión">${Pv ? `<button type="button" id="pv"><small>← Anterior</small><b>${t(Pv)}</b></button>` : '<span></span>'}
      ${Nx ? `<button type="button" id="nx" class="nx"><small>Siguiente →</small><b>${t(Nx)}</b></button>`
           : `<button type="button" id="fin" class="nx"><small>Fin de la reunión</small><b>Volver a la lista</b></button>`}</nav>`;
  }
  // Encabezado: intérprete · tono original (y BPM) en un renglón; "Dirige X" abajo, solo si hay director.
  const meta = [esc(interp(s)), s.medley ? 'Medley' : `Tono original ${esc(s.tono)}${s.bpm ? ' · ' + esc(s.bpm) + ' BPM' : ''}`].filter(Boolean).join(' · ')
    + (ctx && ctx.quien ? `</p><p class="meta"><b>Dirige ${esc(ctx.quien)}</b>` : '');
  app.innerHTML = `${r ? back(nombreSes(r), '#/reunion/' + r.id) : back('Canciones', '#/canciones')}
  <article class="sheet">
    <header class="songhead"><div><h2 class="title">${esc(s.titulo)}</h2><p class="meta">${meta}</p></div>
      ${mus ? stamp(kd, shift ? 'Ahora' : 'Tono') : ''}</header>
    <div class="ctl" role="toolbar" aria-label="Controles">${ctl}</div>
    <div class="lines ${mus ? '' : 'singer'}">${rows}</div>
    <div class="sheetend"><button type="button" id="pr">Imprimir o guardar PDF</button></div>
  </article>${nav}`;

  if (mus) fitSheet(); else fitSinger();
  anchorMixes();
  if (anim && !reduced()) {
    $('.stamp')?.animate([{ transform: `translateY(${anim > 0 ? 8 : -8}px)`, opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 220, easing: 'cubic-bezier(.2,.7,.2,1)' });
    $$('.sg>b:not(:empty),.ch,.mix').forEach(el => el.animate([{ opacity: .2 }, { opacity: 1 }], { duration: 260, easing: 'ease-out' }));
  }

  const keep = f => () => { const y = scrollY; f(); scrollTo(0, y); };
  if (mus) {
    $('#dn').onclick = keep(() => { view.shift--; drawSheet(-1); });
    $('#up').onclick = keep(() => { view.shift++; drawSheet(1); });
    $('#orig').onclick = keep(() => { view.shift = 0; drawSheet(1); });
    $('#not').onclick = keep(() => { P.not = (P.not + 1) % 3; savePrefs(); drawSheet(); });
  }
  $('#sm').onclick = keep(() => { mus ? P.adj-- : P.sadj--; savePrefs(); drawSheet(); });
  $('#bg').onclick = keep(() => { mus ? P.adj++ : P.sadj++; savePrefs(); drawSheet(); });
  $('#sw').onclick = () => {
    view.mode = mus ? 'c' : 'm';
    if (r) { P.modos[r.id] = view.mode; savePrefs(); drawSheet(); }
    else replaceHash(`#/cancion/${s.id}/${view.mode}`), transition(() => drawSheet());
  };
  $('#pr').onclick = () => imprimir(hojaImpresa(item, mus), s.titulo);
  if (vari) $$('[data-var]').forEach(b => b.onclick = () => hojaVariante(r, i, +b.dataset.var));
  if (r) {
    $('#pv') && ($('#pv').onclick = () => go(`#/reunion/${r.id}/${i - 1}`, 'back'));
    $('#nx') && ($('#nx').onclick = () => go(`#/reunion/${r.id}/${i + 1}`));
    $('#fin') && ($('#fin').onclick = () => go(`#/reunion/${r.id}`, 'back'));
  }
}

/**
 * Hoja para que el músico elija otra variante de una parte (sin clave). El cambio queda en el arreglo de la reunión,
 * con su nombre, y lo ven todos los dispositivos.
 */
function hojaVariante(r, i, k) {
  const c = r.canciones[i], e = c && c.arr[k]; if (!e) return;
  const s = songBy(c.tipo === 'medley' ? e.cancion : c.id); if (!s) return;
  const V = variantesDe(s, e.src); if (!V.length) return;
  // Acordes de cada variante desde el primero en que se diferencian (así se reconoce cuál es).
  const acs = b => [].concat(...b.lines.map(l => l.t === 'pair' ? l.segs.map(y => y[0]).filter(Boolean) : l.t === 'ch' || l.t === 'mix' ? l.v.split(/\s+/).filter(Boolean) : []));
  const AC = V.map(acs); let n0 = 0; while (n0 < AC[0].length && AC.every(a => a[n0] === AC[0][n0])) n0++;
  const primerAcorde = b => { const a = AC[V.indexOf(b)]; return a.length ? (n0 ? '… ' : '') + a.slice(n0, n0 + 6).join(' ') + (a.length > n0 + 6 ? ' …' : '') : ''; };
  const w = document.createElement('div'); w.className = 'tsheetw';
  w.innerHTML = `<div class="veil"></div><div class="tsheet" role="dialog" aria-modal="true" aria-labelledby="vh-t"><div class="bar"></div>
    <h3 id="vh-t">¿Qué ${esc(labOf(e) || 'parte')} es?</h3><p>Misma letra, otros acordes. El cambio queda en la reunión para todos.</p>
    <div class="vars">${V.map(b => `<button type="button" data-vs="${b.id}" aria-pressed="${b.id === e.src}"><b>${esc(b.label || '(inicio)')}</b><small>${esc(primerAcorde(b)) || 'sin acordes'}</small></button>`).join('')}</div>
    <button type="button" class="ok">Cancelar</button></div>`;
  app.append(w);
  const cerrar = () => { w.remove(); document.removeEventListener('keydown', tecla); const b = $(`[data-var="${k}"]`); if (b) b.focus({ preventScroll: true, focusVisible: false }); };
  const tecla = ev => { if (ev.key === 'Escape') cerrar(); };
  document.addEventListener('keydown', tecla);
  w.querySelector('.veil').onclick = cerrar; w.querySelector('.ok').onclick = cerrar;
  w.querySelectorAll('[data-vs]').forEach(b => b.onclick = async () => {
    const src = +b.dataset.vs; if (src === e.src) return cerrar();
    const nb = blocksOf(s)[src], antes = { src: e.src, label: e.label, variante: e.variante };
    // Se ve enseguida; si el servidor no lo guarda, vuelve como estaba.
    const de = e.variante ? e.variante.de : e.src;
    e.src = src; e.label = nb.label; if (src === de) delete e.variante; else e.variante = { de, fecha: new Date().toISOString() };
    w.remove(); document.removeEventListener('keydown', tecla); const y = scrollY; drawSheet(); scrollTo(0, y);
    try { const p = await ds.elegirVariante({ id: r.id, i, k, item: c.pid, parte: e.pid, src, label: nb.label });
      if (p) { e.src = p.src; e.label = p.label; if (p.variante) e.variante = p.variante; else delete e.variante; } }
    catch (x) { Object.assign(e, antes); if (!antes.variante) delete e.variante; const y2 = scrollY; drawSheet(); scrollTo(0, y2); toast(x.message || 'No se pudo guardar.'); }
  });
  (w.querySelector('[aria-pressed="true"]') || w.querySelector('.ok')).focus({ preventScroll: true });
  if (!reduced()) { w.querySelector('.tsheet').animate([{ transform: 'translateY(100%)' }, { transform: 'none' }], { duration: 240, easing: 'cubic-bezier(.2,.7,.2,1)' });
                    w.querySelector('.veil').animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200 }); }
}

function anchorMixes() {
  $$('.mix[data-anchor]').forEach(m => {
    const p = m.previousElementSibling; if (!p) return;
    const w = document.createTreeWalker(p, NodeFilter.SHOW_TEXT); let n;
    while ((n = w.nextNode())) {
      const i = n.textContent.indexOf(m.dataset.anchor.slice(0, 3));
      if (i >= 0) { const rg = document.createRange(); rg.setStart(n, i); rg.setEnd(n, i + 1);
        m.style.paddingLeft = (rg.getBoundingClientRect().left - p.getBoundingClientRect().left) + 'px'; break; }
    }
  });
}

// Separa acordes que chocan (sin empujar la letra salvo que sea necesario).
function fixChords(box) {
  box.querySelectorAll('.pair').forEach(p => {
    let prev = null;
    p.querySelectorAll('.sg>b').forEach(b => {
      if (!b.textContent) return;
      if (prev) {
        const a = prev.getBoundingClientRect(), c = b.getBoundingClientRect();
        const need = a.left + prev.scrollWidth + 6 - c.left;
        if (Math.abs(a.top - c.top) < 4 && need > 0) { const s = b.parentElement; s.style.marginLeft = (parseFloat(s.style.marginLeft || 0) + need) + 'px'; }
      }
      prev = b;
    });
  });
}
// Ajuste automático: achica hasta que entre la línea más larga (mín. 11 px); si no entra, corta entre palabras.
function fitSheet() {
  const box = $('.lines'); if (!box) return; box.classList.remove('wrap');
  const avail = box.clientWidth, clear = () => box.querySelectorAll('.sg').forEach(s => s.style.marginLeft = '');
  const widest = () => { let w = 0; box.querySelectorAll('.pair,.ch:not(.sec .ch),.mix:not(.sec .mix),.sec.inl').forEach(r => { w = Math.max(w, r.scrollWidth); }); return w; };
  const set = f => { box.style.setProperty('--fs', f + 'px'); clear(); fixChords(box); };
  let fs = 17;
  for (let k = 0; k < 12; k++) { set(fs); const w = widest(); if (w <= avail + 1 || fs <= 11) break; fs = Math.max(11, Math.floor(fs * Math.min(.97, avail / w) * 10) / 10); }
  set(Math.max(9, Math.min(40, fs + P.adj)));
  if (widest() > avail + 1) { box.classList.add('wrap'); clear(); fixChords(box); }
}
function fitSinger() {
  const box = $('.lines.singer'); if (!box) return; box.classList.add('measure');
  const avail = box.clientWidth, widest = () => { let w = 0; box.querySelectorAll('div').forEach(r => { w = Math.max(w, r.scrollWidth); }); return w; };
  let fs = 26;
  for (let k = 0; k < 14; k++) { box.style.setProperty('--fs', fs + 'px'); const w = widest(); if (w <= avail + 1 || fs <= 12) break; fs = Math.max(12, Math.floor(fs * Math.min(.97, avail / w) * 10) / 10); }
  box.style.setProperty('--fs', Math.max(10, Math.min(44, fs + P.sadj)) + 'px'); box.classList.remove('measure');
}
let rz; addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { if (view.song && $('.lines')) { view.mode === 'm' ? fitSheet() : fitSinger(); anchorMixes(); } }, 150); });

// ---------- Reuniones ----------
function sesList() {
  setTabs('r');
  const list = [...SES].sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''));
  const today = isoOf(new Date());
  const up = list.filter(r => r.fecha >= today).reverse(), past = list.filter(r => r.fecha < today);
  const item = r => `<li><button type="button" class="row cal" data-r="${esc(r.id)}">${dateBlock(r.fecha)}<span class="row-main"><b>${esc(nombreSes(r))}</b>
    <small>Dirige ${esc(r.director)} · ${r.canciones.length} ${r.canciones.length === 1 ? 'canción' : 'canciones'}</small></span>${ICON.chev}</button></li>`;
  app.innerHTML = `<button type="button" class="primary wide" id="nw">+ Nueva reunión</button>
  ${up.length ? `<h3 class="group">Próximas</h3><ul class="list">${up.map(item).join('')}</ul>` : ''}
  ${past.length ? `<h3 class="group">Anteriores</h3><ul class="list">${past.map(item).join('')}</ul>` : ''}
  ${list.length ? '' : '<p class="empty">Todavía no hay reuniones. Armá la del domingo con “Nueva reunión”.</p>'}
  ${DEMO ? '<p class="note">Modo demo: las reuniones quedan guardadas en este teléfono. La clave de las reuniones de ejemplo es 1234.</p>' : ''}`;
  $('#nw').onclick = () => go('#/reuniones/nueva');
  $$('[data-r]').forEach(b => b.onclick = () => go('#/reunion/' + b.dataset.r));
}

function newSes() {
  setTabs(null);
  app.innerHTML = `${back('Reuniones', '#/reuniones')}<h2 class="title">Nueva reunión</h2>
  <form id="f" class="form" novalidate>
    <label>Fecha<input name="d" id="fd" type="date" required></label>
    <label>Nombre<input name="n" id="fn" required autocomplete="off"></label>
    <label>Dirige${personSelect('name="p" id="fp"', '')}</label>
    <label>Clave del director<input name="k" id="fk" type="password" required inputmode="numeric" pattern="[0-9]{4}" maxlength="4" autocomplete="new-password" placeholder="4 números"></label>
    <p class="hint">Se pide para editar o borrar la reunión y no se puede recuperar.</p>
    <p class="err" id="er" role="alert"></p>
    <button class="primary">Crear reunión</button></form>`;
  const fd = $('#fd'), fn = $('#fn'), fk = $('#fk'), f = $('#f'); let touched = false;
  const auto = () => { if (touched || !fd.value) return; const [y, m, d] = fd.value.split('-').map(Number);
    fn.value = DIAS[new Date(y, m - 1, d).getDay()] + ' ' + String(d).padStart(2, '0') + '-' + String(m).padStart(2, '0') + '-' + y; };
  const t = new Date(); t.setDate(t.getDate() + ((7 - t.getDay()) % 7)); fd.value = isoOf(t); auto();
  wirePerson($('#fp'), () => {}); fd.oninput = auto;
  fn.oninput = () => { touched = fn.value.trim() !== ''; };
  fk.oninput = () => { fk.value = fk.value.replace(/\D/g, '').slice(0, 4); };
  f.onsubmit = async e => {
    e.preventDefault(); const er = $('#er');
    if (!fd.value) return er.textContent = 'Elegí una fecha.';
    if (!fn.value.trim()) return er.textContent = 'Escribí un nombre para la reunión.';
    if (!/^\d{4}$/.test(fk.value)) return er.textContent = 'La clave tiene que ser de 4 números.';
    try {
      const r = await ds.createReunion({ nombre: fn.value.trim(), fecha: fd.value, director: $('[name=p]').value, clave: fk.value });
      SES.unshift(r); unlocked[r.id] = fk.value; P.modos[r.id] = P.modos[r.id] || 'm'; savePrefs();
      replaceHash('#/reunion/' + r.id); go('#/reunion/' + r.id + '/editar');
    } catch (x) { er.textContent = x.message; }
  };
}

function openSes(r) {
  setTabs(null);
  const head = `${back('Reuniones', '#/reuniones')}<h2 class="title">${esc(nombreSes(r))}</h2><p class="meta">${esc(fechaLarga(r.fecha))} · Dirige ${esc(r.director)}</p>`;
  if (!P.modos[r.id]) {
    app.innerHTML = `${head}<p class="ask">¿Cómo vas a estar en esta reunión?</p>${modeChooser()}
      <p class="hint">Se aplica a todas las canciones de la reunión. Lo podés cambiar después.</p>`;
    $$('[data-mode]').forEach(b => b.onclick = () => { P.modos[r.id] = b.dataset.mode; savePrefs(); transition(() => openSes(r)); });
    return;
  }
  const rows = r.canciones.map((c, i) => { if (!itemOk(c)) return '';
    const extra = c.tipo === 'medley' ? ' · medley' : isDefArr(songBy(c.id), c.arr) ? '' : ' · orden modificado';
    return `<li><button type="button" class="row" data-o="${i}"><span class="num">${i + 1}</span><span class="row-main"><b>${esc(tituloItem(c))}</b>
      <small>Dirige ${esc(c.quien)}${extra}</small></span><span class="key">${esc(c.tono)}</span></button></li>`; }).join('');
  app.innerHTML = `${head}
  <div class="ctl"><button type="button" id="sm2" class="modebtn" title="Cambiar modo">${P.modos[r.id] === 'm' ? ICON.piano : ICON.mic}Modo: ${P.modos[r.id] === 'm' ? 'Músico' : 'Cantante'} ⇄</button><span class="sp"></span>
    <button type="button" id="pr" title="Imprimir o guardar como PDF"${r.canciones.length ? '' : ' disabled'}>Imprimir</button><button type="button" id="ed">Editar</button><button type="button" id="del">Borrar</button></div>
  <div id="ask" class="askwrap"></div>
  <ol class="list setlist">${rows || '<li class="empty">Sin canciones todavía. Tocá “Editar” para agregarlas.</li>'}</ol>
  ${r.registrada ? '<p class="hint reg">✓ Anotada en el historial de la planilla.</p>' : ''}`;
  $$('[data-o]').forEach(b => b.onclick = () => go(`#/reunion/${r.id}/${b.dataset.o}`));
  $('#pr').onclick = () => {
    const mus = P.modos[r.id] === 'm';
    const hojas = r.canciones.filter(itemOk).map((c, k) => hojaImpresa(c, mus, k ? '' : nombreSes(r))).join('');
    imprimir(hojas, nombreSes(r));
  };
  $('#sm2').onclick = () => { P.modos[r.id] = P.modos[r.id] === 'm' ? 'c' : 'm'; savePrefs(); openSes(r); };
  const ask = (what, run) => {
    if (!navigator.onLine) { $('#ask').innerHTML = '<p class="err">Para editar o borrar hace falta conexión.</p>'; return; }
    if (unlocked[r.id]) return run(unlocked[r.id]);
    // Admin con sesión de Google: edita cualquier reunión sin la clave (queda en el historial de la reunión).
    if (esAdmin()) { unlocked[r.id] = { idToken: ADMIN.token }; return run(unlocked[r.id]); }
    const a = $('#ask');
    a.innerHTML = `<form class="askf" id="af"><input id="kk" type="password" inputmode="numeric" maxlength="4" placeholder="Clave" aria-label="Clave del director" autocomplete="off">
      <button class="primary">${what}</button><button type="button" id="cx">Cancelar</button><span id="er" class="err" role="alert"></span></form>`;
    openAnim(a);
    const kk = $('#kk'); kk.focus(); kk.oninput = () => { kk.value = kk.value.replace(/\D/g, '').slice(0, 4); };
    $('#cx').onclick = () => a.innerHTML = '';
    $('#af').onsubmit = async e => { e.preventDefault();
      try { await ds.checkClave(r.id, kk.value); unlocked[r.id] = kk.value; run(kk.value); }
      catch (x) { $('#er').textContent = x instanceof ClaveError ? x.message : 'No se pudo verificar la clave.'; kk.select(); } };
  };
  $('#ed').onclick = () => ask('Editar', () => go(`#/reunion/${r.id}/editar`));
  $('#del').onclick = () => ask('Borrar', clave => {
    const a = $('#ask');
    a.innerHTML = `<div class="askf confirm"><span>¿Borrar “${esc(nombreSes(r))}”?</span><button type="button" class="danger" id="y">Sí, borrar</button><button type="button" id="n">No</button></div>`;
    openAnim(a);
    $('#y').onclick = async () => { try { await ds.deleteReunion(r.id, clave); SES = SES.filter(x => x !== r); go('#/reuniones', 'back'); } catch (x) { a.innerHTML = `<p class="err">${esc(x.message)}</p>`; } };
    $('#n').onclick = () => a.innerHTML = '';
  });
}
// ---------- Imprimir / PDF ----------
// Arma una copia limpia (sin botones) en #print y abre el diálogo del sistema; en el celular ofrece "Guardar como PDF".
// Hoja como los documentos de la iglesia: "Nombre [Tono]" centrado, en una línea; sin otros datos.
function hojaImpresa(item, mus, arriba) {
  const { rows, kd } = sheetRows(item, mus);
  return `<article class="phoja">${arriba ? `<p class="pses">${esc(arriba)}</p>` : ''}<h2>${esc(tituloItem(item))} [${esc(kd)}]</h2><div class="lines ${mus ? '' : 'singer'}">${rows}</div></article>`;
}
// Alto de la hoja: A4 o carta (se usa el menor de los dos para que entre en ambos). El margen de 9 mm lo pone
// el padding de .phoja, que ya está incluido en scrollHeight.
const HOJA_MM = 279.4;
/** Achica la letra de cada canción (hasta 8 pt) para que entre en una hoja; si aun así no entra, sigue en la siguiente. */
function ajustarHojas(box) {
  const mm = 96 / 25.4, alto = HOJA_MM * mm;
  box.querySelectorAll('.phoja').forEach(h => {
    const L = h.querySelector('.lines'), base = L.classList.contains('singer') ? 12 : 11;
    for (let pt = base; pt >= 8; pt -= .5) {
      L.style.fontSize = pt + 'pt';
      L.querySelectorAll('.sg').forEach(x => { x.style.marginLeft = ''; }); fixChords(L);
      if (h.scrollHeight <= alto) break;
    }
  });
}
function imprimir(html, titulo) {
  let box = document.getElementById('print');
  if (!box) { box = document.createElement('div'); box.id = 'print'; document.body.appendChild(box); }
  box.innerHTML = html;
  const t0 = document.title; document.title = titulo || t0;          // nombre sugerido del PDF
  document.body.classList.add('imprimiendo');
  ajustarHojas(box);
  const fin = () => { document.body.classList.remove('imprimiendo'); box.innerHTML = ''; document.title = t0; removeEventListener('afterprint', fin); };
  addEventListener('afterprint', fin);
  setTimeout(() => print(), 50);
}

const openAnim = el => { if (!reduced()) el.animate([{ opacity: 0, transform: 'translateY(-4px)' }, { opacity: 1, transform: 'none' }], { duration: 180, easing: 'ease-out' }); };

function openSesSong(r, i) {
  const c = r.canciones[i];
  if (!c || !itemOk(c)) return openSes(r);
  const s = c.tipo === 'medley' ? { titulo: tituloItem(c), tono: c.tono, interprete: '', medley: true } : songBy(c.id);
  if (!P.modos[r.id]) { P.modos[r.id] = 'm'; savePrefs(); }
  openSheet(s, P.modos[r.id], { ses: r, i, item: c, quien: c.quien, shift: shiftTo(s, c.tono) });
}

// ---------- Editar reunión ----------
// Guardado en segundo plano y en orden: la pantalla se actualiza al instante y el motor (1–3 s por
// escritura) recibe los cambios en fila. La respuesta solo se aplica si no quedó otro guardado pendiente,
// así no pisa cambios más nuevos hechos mientras tanto.
let colaGuardar = Promise.resolve(), pendientes = 0;
// Se conservan los objetos locales (la pantalla los sigue usando) y solo se copian los pid que asignó el motor.
function tomarIds(r, saved) {
  const { canciones, ...resto } = saved || {}; Object.assign(r, resto);
  (canciones || []).forEach((x, k) => {
    const c = r.canciones[k]; if (!c || c.id !== x.id) return;
    if (!c.pid) c.pid = x.pid;
    (x.arr || []).forEach((p, j) => { if (c.arr && c.arr[j] && !c.arr[j].pid) c.arr[j].pid = p.pid; });
  });
}
function persist(r) {
  pendientes++;
  colaGuardar = colaGuardar.then(async () => {
    try { const saved = await ds.updateReunion(r.id, { canciones: r.canciones }, unlocked[r.id]); if (pendientes === 1) tomarIds(r, saved); }
    catch (x) { toast(x.message || 'No se pudo guardar.'); }
    finally { pendientes--; }
  });
  return colaGuardar;
}
let toastT; function toast(msg) { const t = document.getElementById('toast'); t.textContent = msg; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => t.hidden = true, 3500); }
/** Aviso con "Deshacer" (sin diálogo de confirmación): unos segundos para volver atrás. */
function avisoDeshacer(msg, deshacer) {
  const t = document.getElementById('toast'); t.innerHTML = `<span>${esc(msg)}</span> · <button type="button">Deshacer</button>`; t.hidden = false;
  t.querySelector('button').onclick = () => { clearTimeout(toastT); t.hidden = true; deshacer(); };
  clearTimeout(toastT); toastT = setTimeout(() => t.hidden = true, 5000);
}

/**
 * Hoja de la ruedita de Editar reunión: fecha, nombre y director (con la misma clave), conservando canciones,
 * tonos y arreglos. El id no cambia: links, historial y Registro siguen igual. Si hay sesión de admin, abajo y
 * en chico: clave nueva y el historial de lo que hizo el admin.
 */
function hojaDatos(r) {
  const adm = esAdmin();
  const w = document.createElement('div'); w.className = 'tsheetw';
  w.innerHTML = `<div class="veil"></div><div class="tsheet" role="dialog" aria-modal="true" aria-labelledby="dh-t"><div class="bar"></div>
    <h3 id="dh-t">Datos de la reunión</h3>
    <form id="dr" class="form" novalidate>
      <label>Fecha<input id="drd" type="date" value="${esc(r.fecha)}" required${r.registrada ? ' disabled' : ''}></label>
      ${r.registrada ? '<p class="hint">Ya está anotada en el Registro: la fecha no se puede cambiar.</p>' : ''}
      <label>Nombre<input id="drn" value="${esc(r.nombre)}" autocomplete="off" required></label>
      <label>Dirige${personSelect('id="drp"', r.director)}</label>
      ${adm ? `<label class="adk">Clave nueva<input id="adk" type="password" inputmode="numeric" maxlength="4" autocomplete="new-password" placeholder="Solo si cambia (4 números)"></label>` : ''}
      <p class="err" id="dre" role="alert"></p>
      <div class="edr"><button class="primary">Guardar</button><button type="button" id="drc">Cancelar</button></div></form>
    ${adm ? '<details class="adh"><summary>Historial del admin</summary><ul id="adh"><li>Cargando…</li></ul></details>' : ''}</div>`;
  app.append(w);
  const cerrar = () => { w.remove(); document.removeEventListener('keydown', tecla); const b = $('#cfg'); if (b) b.focus({ preventScroll: true, focusVisible: false }); };
  const tecla = ev => { if (ev.key === 'Escape') cerrar(); };
  document.addEventListener('keydown', tecla);
  w.querySelector('.veil').onclick = cerrar; w.querySelector('#drc').onclick = cerrar;
  const q = x => w.querySelector(x), drd = q('#drd'), drn = q('#drn'); wirePerson(q('#drp'), () => {});
  const auto = f => { const [y, m, d] = f.split('-').map(Number); return DIAS[new Date(y, m - 1, d).getDay()] + ' ' + String(d).padStart(2, '0') + '-' + String(m).padStart(2, '0') + '-' + y; };
  // Si el nombre era el automático de la fecha, sigue a la fecha nueva.
  let sigue = !!r.fecha && drn.value.trim() === auto(r.fecha);
  drn.oninput = () => { sigue = false; };
  drd.oninput = () => { if (drd.value && sigue) drn.value = auto(drd.value); };
  const adk = q('#adk'); if (adk) adk.oninput = () => { adk.value = adk.value.replace(/\D/g, '').slice(0, 4); };
  if (adm) ds.adminReunion(r.id, ADMIN.token).then(x => { const h = x.historial || [];
    q('#adh').innerHTML = h.length ? h.map(x => `<li>${esc(new Date(x.fecha).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' }))} · ${esc(x.quien)}: ${esc(x.que)}</li>`).join('') : '<li>Sin cambios del admin.</li>'; })
    .catch(x => { q('#adh').innerHTML = `<li>${esc(x.message)}</li>`; });
  q('#dr').onsubmit = async ev => {
    ev.preventDefault(); const er = q('#dre'); er.textContent = '';
    if (!drd.value) return er.textContent = 'Elegí una fecha.';
    if (!drn.value.trim()) return er.textContent = 'Escribí un nombre para la reunión.';
    const dir = q('#drp') ? q('#drp').value : r.director, k = adk ? adk.value : '';
    if (k && !/^\d{4}$/.test(k)) return er.textContent = 'La clave tiene que ser de 4 números.';
    try {
      await colaGuardar;   // primero lo que se esté guardando de las canciones
      // Admin: el director nuevo (y la clave nueva) van por adminReunion, así queda como "reasignó".
      if (adm && (k || dir !== r.director)) { const x = await ds.adminReunion(r.id, ADMIN.token, { clave: k || undefined, director: dir !== r.director ? dir : undefined }); r.director = x.reunion.director; }
      const saved = await ds.updateReunion(r.id, { nombre: drn.value.trim(), fecha: drd.value, director: dir }, unlocked[r.id]);
      r.nombre = saved.nombre; r.fecha = saved.fecha; r.director = saved.director;
      cerrar(); toast(k ? 'Datos y clave guardados.' : 'Datos de la reunión guardados.'); const y = scrollY; editSes(r); scrollTo(0, y);
    } catch (x) { er.textContent = x.message || 'No se pudo guardar.'; }
  };
  drn.focus({ preventScroll: true });
  if (!reduced()) { q('.tsheet').animate([{ transform: 'translateY(100%)' }, { transform: 'none' }], { duration: 240, easing: 'cubic-bezier(.2,.7,.2,1)' });
                    q('.veil').animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200 }); }
}

/** Admin con sesión de Google vigente (no en el modo demo). */
const esAdmin = () => !DEMO && !!ADMIN && ADMIN.exp * 1000 > Date.now() + 60000;
function editSes(r) {
  setTabs(null);
  const rows = r.canciones.map((c, i) => { if (!itemOk(c)) return '';
    // Tocar el nombre abre el editor de partes (el renglón de tono y Dirige no abre nada).
    return `<li class="ed"><div class="edh"><button type="button" class="edn" data-pa="${i}" aria-label="${esc(tituloItem(c))}: ordenar partes"><span class="num">${i + 1}</span><span class="edt">${esc(tituloItem(c))}</span>${c.tipo === 'medley' ? '<small class="medtag">Medley</small>' : ''}${ICON.chev}</button><span class="tools">
      <button type="button" data-up="${i}" aria-label="Subir"${i ? '' : ' disabled'}>▲</button><button type="button" data-dn="${i}" aria-label="Bajar"${i < r.canciones.length - 1 ? '' : ' disabled'}>▼</button><button type="button" data-rm="${i}" aria-label="Quitar">✕</button></span></div>
      <div class="edr una"><label>Tono<select data-k="${i}">${KEYS.map(k => `<option${k === c.tono ? ' selected' : ''}>${k}</option>`).join('')}</select></label>
      <label>Dirige${personSelect(`data-q="${i}"`, c.quien)}</label></div></li>`; }).join('');
  app.innerHTML = `${back(nombreSes(r), '#/reunion/' + r.id)}<div class="edtit"><h2 class="title">Editar reunión</h2><button type="button" class="cfg" id="cfg" aria-haspopup="dialog" aria-label="Fecha, nombre y director" title="Fecha, nombre y director"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg></button></div><p class="meta">${esc(nombreSes(r))} · Dirige ${esc(r.director)}</p>
  <ol class="list">${rows || '<li class="empty">Agregá la primera canción con el buscador.</li>'}</ol>
  <div class="form"><label>Agregar canción<input id="ad" type="search" autocomplete="off" placeholder="Buscar por nombre, frase o director"></label>
    <ul class="list sugg" id="sg"></ul>
    <button type="button" id="mb" aria-expanded="false">Crear medley</button>
    <div class="medbox" id="mbx" hidden>
      <p class="hint">Elegí dos o más canciones. El orden se cambia arrastrando ≡, también después en el editor de partes.</p>
      <ol class="medsel" id="mbl"></ol>
      <label>Agregar canción al medley<input id="mbq" type="search" autocomplete="off" placeholder="Buscar por nombre o frase"></label>
      <ul class="list sugg" id="mbs"></ul>
      <div class="edr"><label>Tono de inicio<select id="mbt"></select></label>
        <button type="button" class="primary" id="mbok" disabled>Crear y ordenar partes</button><button type="button" id="mbc">Cancelar</button></div>
    </div>
    <button type="button" class="primary" id="ok">Listo</button></div>`;
  const re = () => { persist(r); const y = scrollY; editSes(r); scrollTo(0, y); };
  const swap = (a, b) => { [r.canciones[a], r.canciones[b]] = [r.canciones[b], r.canciones[a]]; re(); };
  $('#cfg').onclick = () => hojaDatos(r);
  $$('[data-up]').forEach(b => b.onclick = () => swap(+b.dataset.up - 1, +b.dataset.up));
  $$('[data-dn]').forEach(b => b.onclick = () => swap(+b.dataset.dn, +b.dataset.dn + 1));
  $$('[data-rm]').forEach(b => b.onclick = () => { r.canciones.splice(+b.dataset.rm, 1); re(); });
  $$('[data-k]').forEach(x => x.onchange = () => { cambiarInicio(r.canciones[+x.dataset.k], x.value); persist(r); });
  $$('[data-q]').forEach(x => wirePerson(x, v => { r.canciones[+x.dataset.q].quien = v; persist(r); }));
  $$('[data-pa]').forEach(b => b.onclick = () => go(`#/reunion/${r.id}/editar/${b.dataset.pa}`));
  const ad = $('#ad'), sg = $('#sg');
  // Al tocar el buscador aparece la lista completa; al escribir se va filtrando.
  const showSg = () => {
    const f = buscar(ad.value.trim());
    sg.innerHTML = f.map(x => songItem(x, 'data-a')).join('') || '<li class="empty">Sin resultados. Probá con otra palabra.</li>';
  };
  ad.oninput = showSg;
  ad.onfocus = ad.onclick = () => { if (sg.innerHTML) return; showSg(); openAnim(sg); };
  ad.onblur = () => setTimeout(() => { if (document.activeElement !== ad) sg.innerHTML = ''; }, 150);
  sg.onmousedown = e => e.preventDefault(); // que tocar una opción no cierre la lista antes del click
  sg.onclick = e => { const b = e.target.closest('[data-a]'); if (!b) return; const s = songBy(b.dataset.a);
    r.canciones.push({ id: s.id, tono: keyOption(s), quien: r.director, arr: defArr(s) }); re(); $('#ad')?.focus(); };
  // ---- Crear medley: canciones (búsqueda en vivo) y tono de inicio; después se abre el editor de partes.
  const med = [], mbx = $('#mbx'), mbq = $('#mbq'), mbs = $('#mbs'), mbt = $('#mbt');
  let tonoElegido = false;
  const pintaMed = () => {
    $('#mbl').innerHTML = med.map((s, k) => `<li>${med.length > 1 ? `<button type="button" class="sh" data-mh="${k}" aria-label="Mover ${esc(s.titulo)} (flechas arriba y abajo)"><svg viewBox="0 0 18 18" aria-hidden="true"><path d="M3 5h12M3 9h12M3 13h12"/></svg></button>` : ''}<span class="num">${k + 1}</span><b>${esc(s.titulo)}</b><span class="key">${esc(keyOption(s))}</span></li>`).join('');
    const L = [...$('#mbl').children];
    // Deslizar a la izquierda (o Suprimir en la manija) la quita; "Deshacer" la vuelve a su lugar.
    const quitar = k => { const [x] = med.splice(k, 1); pintaMed(); avisoDeshacer('Canción quitada', () => { med.splice(k, 0, x); pintaMed(); }); };
    deslizar(L, quitar);
    L.forEach((li, k) => { const h = li.querySelector('[data-mh]'); if (h) h.addEventListener('keydown', e => { if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); quitar(k); } }); });
    arrastrar($('#mbl'), L.map(li => [li]), L.map(li => li.querySelector('[data-mh]')), (a, b, tecla) => {
      const [x] = med.splice(a, 1); med.splice(b, 0, x); pintaMed(); if (tecla) { const f = $(`[data-mh="${b}"]`); if (f) f.focus(); }
    });
    if (!tonoElegido) { const t = med[0] ? keyOption(med[0]) : ''; mbt.innerHTML = KEYS.map(k => `<option${k === t ? ' selected' : ''}>${k}</option>`).join(''); }
    $('#mbok').disabled = med.length < 2;
  };
  $('#mb').onclick = () => { const abre = mbx.hidden; mbx.hidden = !abre; $('#mb').setAttribute('aria-expanded', String(abre)); if (abre) { pintaMed(); mbq.focus(); } };
  $('#mbc').onclick = () => { med.length = 0; tonoElegido = false; mbq.value = ''; mbs.innerHTML = ''; mbx.hidden = true; $('#mb').setAttribute('aria-expanded', 'false'); };
  mbt.onchange = () => { tonoElegido = true; };
  const showMb = () => {
    const f = buscar(mbq.value.trim());
    mbs.innerHTML = f.map(x => songItem(x, 'data-mb')).join('') || '<li class="empty">Sin resultados. Probá con otra palabra.</li>';
  };
  mbq.oninput = showMb;
  mbq.onfocus = mbq.onclick = () => { if (mbs.innerHTML) return; showMb(); openAnim(mbs); };
  mbq.onblur = () => setTimeout(() => { if (document.activeElement !== mbq) mbs.innerHTML = ''; }, 150);
  mbs.onmousedown = e => e.preventDefault();
  mbs.onclick = e => { const b = e.target.closest('[data-mb]'); if (!b) return; const s = songBy(b.dataset.mb); if (!s) return;
    med.push(s); mbq.value = ''; showMb(); pintaMed(); };
  $('#mbok').onclick = () => {
    if (med.length < 2) return;
    // Un medley es siempre modulante; sus partes son las de todas las canciones, en orden, cada una con su canción.
    r.canciones.push({ tipo: 'medley', tono: mbt.value, quien: r.director, canciones: med.map(s => ({ id: s.id })),
      arr: [].concat(...med.map(s => defArr(s).map(e => ({ ...e, cancion: s.id })))) });
    persist(r); go(`#/reunion/${r.id}/editar/${r.canciones.length - 1}`);
  };
  $('#ok').onclick = async () => { const b = $('#ok'); b.disabled = true; b.textContent = 'Guardando…'; await colaGuardar; go('#/reunion/' + r.id, 'back'); };
}

// ---------- Arrastre de grupos ----------
/**
 * Reordenar arrastrando: grupos[k] = elementos que se mueven juntos (una canción del medley con todas sus partes,
 * o un renglón); handles[k] = su manija. También con las flechas arriba/abajo cuando la manija tiene el foco.
 * onDrop(desde, hasta, conTeclado) recibe índices de grupo.
 */
/**
 * Deslizar hacia la izquierda para borrar: items[k] es el elemento; al soltar pasado un tercio del ancho, onBorrar(k).
 * La manija de arrastre (.h, .sh) no desliza. Si hubo deslizamiento, el toque no cuenta como click.
 */
function deslizar(items, onBorrar) {
  items.forEach((li, k) => {
    li.addEventListener('pointerdown', ev => {
      if (ev.button || ev.target.closest('.h, .sh, select, input')) return;
      const x0 = ev.clientX, y0 = ev.clientY; let dx = 0, activo = false;
      const mueve = e => {
        dx = Math.min(0, e.clientX - x0);
        if (!activo) { if (Math.abs(e.clientY - y0) > 12) return fin(); if (dx > -12) return; activo = true; li.setPointerCapture(e.pointerId); li.classList.add('swipe'); }
        li.style.translate = `${dx}px 0`; li.style.opacity = String(1 + dx / li.offsetWidth);
      };
      const fin = () => {
        li.removeEventListener('pointermove', mueve); li.removeEventListener('pointerup', suelta); li.removeEventListener('pointercancel', fin);
        if (!activo) return; li.classList.remove('swipe'); li.style.translate = ''; li.style.opacity = '';
        // El click que sigue al deslizamiento no abre nada.
        const tapa = e => { e.stopPropagation(); e.preventDefault(); };
        li.addEventListener('click', tapa, { capture: true, once: true }); setTimeout(() => li.removeEventListener('click', tapa, { capture: true }), 400);
      };
      const suelta = () => { const borra = activo && -dx > li.offsetWidth / 3; fin(); if (borra) onBorrar(k); };
      li.addEventListener('pointermove', mueve); li.addEventListener('pointerup', suelta); li.addEventListener('pointercancel', fin);
    });
  });
}

function arrastrar(lista, grupos, handles, onDrop) {
  handles.forEach((h, k) => {
    if (!h) return;
    h.addEventListener('keydown', ev => {
      const n = ev.key === 'ArrowUp' ? k - 1 : ev.key === 'ArrowDown' ? k + 1 : -1;
      if (n < 0 || n >= grupos.length) return; ev.preventDefault(); onDrop(k, n, true);
    });
    h.addEventListener('pointerdown', ev => {
      if (ev.button || grupos.length < 2) return; ev.preventDefault();
      const caja = g => ({ t: g[0].getBoundingClientRect().top + scrollY, b: g[g.length - 1].getBoundingClientRect().bottom + scrollY });
      const G = grupos.map(caja), mid = G.map(g => (g.t + g.b) / 2);
      const gap = k + 1 < G.length ? G[k + 1].t - G[k].b : G[k].t - G[k - 1].b, alto = G[k].b - G[k].t + gap;
      const y0 = ev.clientY + scrollY; let py = ev.clientY, dest = k, raf = 0;
      h.setPointerCapture(ev.pointerId); grupos[k].forEach(x => x.classList.add('lift')); lista.classList.add('drag'); lista.classList.toggle('grupo', grupos[k].length > 1);
      const pinta = () => {
        const dy = py + scrollY - y0, centro = mid[k] + dy;
        grupos[k].forEach(x => { x.style.translate = `0 ${dy}px`; });
        dest = k;
        for (let n = k + 1; n < G.length && centro > mid[n]; n++) dest = n;
        for (let n = k - 1; n >= 0 && centro < mid[n]; n--) dest = n;
        grupos.forEach((g, n) => { if (n === k) return; const d = n > k && n <= dest ? -alto : n < k && n >= dest ? alto : 0; g.forEach(x => { x.style.translate = d ? `0 ${d}px` : ''; }); });
      };
      // Cerca del borde de la pantalla se desplaza solo.
      const auto = () => { const v = py < 80 ? -10 : py > innerHeight - 80 ? 10 : 0; if (v) { scrollBy(0, v); pinta(); } raf = requestAnimationFrame(auto); };
      raf = requestAnimationFrame(auto);
      h.onpointermove = e2 => { py = e2.clientY; pinta(); };
      h.onpointerup = h.onpointercancel = () => {
        cancelAnimationFrame(raf); h.onpointermove = h.onpointerup = h.onpointercancel = null;
        grupos.forEach(g => g.forEach(x => { x.style.translate = ''; x.classList.remove('lift'); })); lista.classList.remove('drag', 'grupo');
        if (dest !== k) onDrop(k, dest, false);
      };
    });
  });
}

// ---------- Partes ----------
function parts(r, i, abrirTono) {
  const c = r.canciones[i]; if (!c || !itemOk(c)) return editSes(r);
  setTabs(null);
  // Canción o medley: SG = id → canción. En un medley cada parte dice de qué canción es (e.cancion).
  const medley = c.tipo === 'medley', ids = medley ? (c.canciones || []).map(x => x.id) : [c.id];
  const SG = {}; ids.forEach(id => { const x = songBy(id); if (x) SG[id] = x; });
  const idDe = e => medley ? e.cancion : c.id, AB_ = {}, ABde = id => AB_[id] || (AB_[id] = SG[id] ? blocksOf(SG[id]) : []);
  const blq = e => ABde(idDe(e))[e.src];
  const primera = SG[ids.find(id => SG[id])];
  // Letra de una parte para el resumen: sin "(Sube a X)"; si el bloque solo trae esa indicación, la del bloque que repite.
  const letraDe = (id, src) => SG[id] ? blockText(contenidoDe(SG[id], src)).filter(t => !SUBA.test(t)) : [];
  const letra = e => letraDe(idDe(e), e.src);
  const baseArr = () => medley ? [].concat(...ids.filter(id => SG[id]).map(id => defArr(SG[id]).map(e => ({ ...e, cancion: id })))) : defArr(SG[c.id]);
  // Tono de cada parte, calculado igual que en la hoja (tonosDelItem).
  const TD = tonosDelItem(c, SG), modul = TD.modulante, PT = TD.partes;
  const antI = j => { for (let k = j - 1; k >= 0; k--) if (!PT[k].transicion) return k; return -1; };
  const ant = j => { const k = antI(j); return k < 0 ? null : PT[k]; };
  const sig = j => { for (let k = j + 1; k < PT.length; k++) if (!PT[k].transicion) return PT[k]; return null; };
  const nom = e => base(e.label || '') || '(inicio)';
  const opts = (t, extra) => extra + [...Array(12)].map((_, n) => tonoMas(/m$/.test(t) ? 'Cm' : 'C', n))
    .map(k => `<option value="${k}"${extra || intervalo(k, t) ? '' : ' selected'}>${esc(k)}</option>`).join('');
  const DIF = [[0, '='], [1, '+½'], [2, '+1'], [-1, '−½']];
  // Chip de tono: "E" si sigue igual que la parte anterior, "↑ A" / "↓ G" si cambia. Solo con Modulante.
  const chip = j => {
    const o = PT[j]; if (!modul || o.transicion) return '';
    if (antI(j) < 0) return `<span class="k" title="Tono de inicio">${esc(o.tono)}</span>`;
    const d = intervalo(ant(j).tono, o.tono), fl = d > 0 ? '↑ ' : d < 0 ? '↓ ' : '';
    return `<button type="button" class="k${d > 0 ? ' up' : d < 0 ? ' dn' : ''}" data-k="${j}" aria-haspopup="dialog" aria-label="Tono ${esc(o.tono)}${d ? (d > 0 ? ', sube' : ', baja') : ''}. Cambiar el tono de ${esc(nom(c.arr[j]))}">${fl}${esc(o.tono)}</button>`;
  };
  const nota = j => { const o = PT[j]; return o.transicion && modul ? `<div class="x">Toma el tono de la parte siguiente${o.ver ? ` · <i>${esc(o.tono)}</i>` : ''}</div>` : ''; };
  // "Mostrar igual": en las transiciones y en las partes con acordes puente o [ ], cuando la siguiente queda en el mismo tono.
  const conPuente = e => { const b = blq(e); return !!(b && b.lines.some(l => l.puente || l.modula)); };
  const mostrarDe = (e, j) => {
    const o = PT[j]; if (!sig(j) || !(o.transicion || conPuente(e)) || (o.cambia && !e.mostrar)) return '';
    return `<label><input type="checkbox" data-mi="${j}"${e.mostrar ? ' checked' : ''}> Mostrar igual ${o.transicion ? 'esta transición' : 'los acordes puente'}</label>`;
  };
  const secciones = c.arr.map((e, j) => [e, j]).filter(([e, j]) => !PT[j].transicion && blq(e))
    .filter(([e], k, a) => a.findIndex(([x]) => x.src === e.src && idDe(x) === idDe(e)) === k);
  // En un medley, el nombre de la canción va arriba de su primera parte (y cada vez que cambia de canción).
  const tituloDe = id => (SG[id] || {}).titulo || '';
  // Tramos seguidos de partes de una misma canción: se mueven juntos desde la manija del nombre de la canción.
  const tramos = []; c.arr.forEach((e, j) => { if (medley && j && idDe(c.arr[j - 1]) === idDe(e)) tramos[tramos.length - 1].b = j; else tramos.push({ a: j, b: j }); });
  const cancionDe = j => { if (!medley) return ''; const k = tramos.findIndex(t => t.a === j); if (k < 0) return ''; const tt = tituloDe(idDe(c.arr[j]));
    return `<div class="so">${tramos.length > 1 ? `<button type="button" class="sh" data-sh="${k}" aria-label="Mover ${esc(tt)} con todas sus partes (flechas arriba y abajo)"><svg viewBox="0 0 18 18" aria-hidden="true"><path d="M3 5h12M3 9h12M3 13h12"/></svg></button>` : ''}<span>${esc(tt)}</span></div>`; };
  const agregar = medley
    ? ids.filter(id => SG[id]).map(id => `<optgroup label="${esc(tituloDe(id))}">${ABde(id).filter(b => b.has).map(b => `<option value="${esc(id)}|${b.id}">${esc((b.label || '(inicio)') + ' — ' + (letraDe(id, b.id)[0] || 'instrumental'))}</option>`).join('')}</optgroup>`).join('')
    : ABde(c.id).filter(b => b.has).map(b => `<option value="${esc(c.id)}|${b.id}">${esc((b.label || '(inicio)') + ' — ' + (letraDe(c.id, b.id)[0] || 'instrumental'))}</option>`).join('');
  const MANIJA = '<svg viewBox="0 0 18 18" aria-hidden="true"><path d="M3 5h12M3 9h12M3 13h12"/></svg>';
  app.innerHTML = `${back('Editar reunión', '#/reunion/' + r.id + '/editar')}<h2 class="title">${esc(tituloItem(c))}</h2><p class="meta">${medley ? 'Medley · ' : ''}Orden de las partes</p>
  <div class="modbox"><label class="sw"><input type="checkbox" id="mo"${modul ? ' checked' : ''}${medley ? ' disabled' : ''}> Modulante</label><p class="hint">${medley ? 'Un medley siempre permite cambiar de tono entre partes' : 'Permite cambiar de tono entre partes'}</p>
    <div class="edr"><label>Tono de inicio<select id="ti">${opts(c.tono || keyOption(primera), '')}</select></label></div></div>
  <ol class="pl">${c.arr.map((e, j) => `<li class="pc${PT[j].transicion ? ' tr' : ''}">${cancionDe(j)}
    <button type="button" class="h" data-h="${j}" aria-label="Mover ${esc(nom(e))} (flechas arriba y abajo)">${MANIJA}</button>
    <div class="t"><b>${esc(nom(e))}</b><button type="button" class="rp${rOf(e) > 1 ? ' mas' : ''}" data-r="${j}" aria-haspopup="true" aria-expanded="false" aria-label="Repeticiones: ${rOf(e)}">x${rOf(e)}</button></div>
    ${chip(j)}<button type="button" class="m" data-o="${j}" aria-haspopup="true" aria-expanded="false" aria-label="Más opciones de ${esc(nom(e))}">⋯</button>
    <button type="button" class="pv" data-v="${j}" aria-expanded="false">${esc(letra(e)[0] || 'Sin letra (instrumental)')}</button>
    ${nota(j)}
    <div class="pvb" hidden><div class="pvb-in">${letra(e).map(t => `<div>${esc(t)}</div>`).join('') || '<div>Sin letra (instrumental)</div>'}</div></div></li>`).join('')}</ol>
  <div class="form"><label>Agregar parte<select id="ap"><option value="">Elegir…</option>${agregar}</select></label>
    ${modul ? `<label>+ Agregar sección (copia de una parte, con tono nuevo)<select id="as"><option value="">Elegir…</option>${secciones.map(([e, j]) => `<option value="${j}">${esc(nom(e) + ' — ' + PT[j].tono)}</option>`).join('')}</select></label>` : ''}
    <button type="button" id="rs">Volver al orden original</button><button type="button" class="primary" id="ok">Listo</button></div>`;
  // En un medley, el orden de las canciones (y el nombre "A + B + C") sigue a la primera parte de cada una.
  const ordenar = () => { if (!medley) return; const pos = id => { const k = c.arr.findIndex(e => e.cancion === id); return k < 0 ? 1e9 : k; };
    c.canciones = c.canciones.map((x, n) => [x, n]).sort((a, b) => pos(a[0].id) - pos(b[0].id) || a[1] - b[1]).map(a => a[0]); };
  const re = abrir => { ordenar(); persist(r); const y = scrollY; parts(r, i, abrir); scrollTo(0, y); };
  if (medley && tramos.length > 1) {
    const L = [...$('.pl').children];
    arrastrar($('.pl'), tramos.map(t => L.slice(t.a, t.b + 1)), tramos.map((t, k) => $(`[data-sh="${k}"]`)), (a, b, tecla) => {
      const bl = tramos.map(t => c.arr.slice(t.a, t.b + 1)), [x] = bl.splice(a, 1); bl.splice(b, 0, x); c.arr = [].concat(...bl); re();
      if (tecla) { const f = $(`[data-sh="${b}"]`); if (f) f.focus(); }
    });
  }
  $('#rs').onclick = () => { c.arr = baseArr(); re(); };
  $('#ok').onclick = async () => { await colaGuardar; go('#/reunion/' + r.id + '/editar', 'back'); };
  // La copia va sin pid: el motor le da uno nuevo (y la app lo toma al guardar).
  const copia = j => { const x = { ...c.arr[j] }; delete x.pid; return x; };
  $('#mo').onchange = e => { if (medley) return; c.modulante = e.target.checked; re(); };
  $('#ti').onchange = e => { cambiarInicio(c, e.target.value); re(); };
  // "+ Agregar sección": copia de la parte elegida al final, medio tono arriba de la última parte.
  if ($('#as')) $('#as').onchange = e => { const j = +e.target.value; if (e.target.value === '' || !c.arr[j]) return;
    const x = copia(j), ult = [...PT].reverse().find(o => !o.transicion); delete x.mostrar;
    x.tono = tonoMas(ult ? ult.tono : c.tono, 1); c.arr.push(x); re(); };
  $$('[data-v]').forEach(b => b.onclick = () => {
    const li = b.closest('li'), box = li.querySelector('.pvb'), open = li.classList.toggle('open');
    b.setAttribute('aria-expanded', String(open));
    if (reduced()) { box.hidden = !open; return; }
    box.hidden = false; const h = box.scrollHeight;
    const a = box.animate(open ? [{ height: 0, opacity: 0 }, { height: h + 'px', opacity: 1 }] : [{ height: h + 'px', opacity: 1 }, { height: 0, opacity: 0 }], { duration: 220, easing: 'cubic-bezier(.2,.7,.2,1)' });
    a.onfinish = () => { box.hidden = !li.classList.contains('open'); };
  });
  $('#ap').onchange = e => { const [id, n] = e.target.value.split('|'), b = ABde(id)[+n];
    if (b) { const x = { src: b.id, label: b.label, rep: 1 }; if (medley) x.cancion = id; c.arr.push(x); re(); } };

  // ---- Menús chicos (repeticiones y ⋯): flotan junto al botón; se cierran al tocar afuera, con Escape o al desplazar.
  let cerrarPop = null, popDe = null;
  const pop = (btn, cls, html, wire) => {
    const mismo = popDe === btn; if (cerrarPop) cerrarPop(); if (mismo) return;
    const p = document.createElement('div'); p.className = 'pop ' + cls; p.innerHTML = html; app.append(p);
    const b = btn.getBoundingClientRect(), W = document.documentElement.clientWidth;
    const izq = cls === 'step' ? b.left - 8 : b.right - p.offsetWidth;
    p.style.left = Math.max(8, Math.min(izq, W - p.offsetWidth - 8)) + 'px';
    p.style.top = (b.bottom + p.offsetHeight + 8 > innerHeight ? b.top - p.offsetHeight - 4 : b.bottom + 4) + 'px';
    const fuera = ev => { if (!p.contains(ev.target) && !btn.contains(ev.target)) cerrar(); };
    const tecla = ev => { if (ev.key === 'Escape') { cerrar(); btn.focus(); } };
    const cerrar = () => { p.remove(); btn.setAttribute('aria-expanded', 'false'); cerrarPop = popDe = null;
      document.removeEventListener('pointerdown', fuera, true); document.removeEventListener('keydown', tecla); removeEventListener('scroll', cerrar); };
    document.addEventListener('pointerdown', fuera, true); document.addEventListener('keydown', tecla); addEventListener('scroll', cerrar, { passive: true });
    btn.setAttribute('aria-expanded', 'true'); cerrarPop = cerrar; popDe = btn;
    wire(p, cerrar); const f = p.querySelector('button:not(:disabled), input'); if (f) f.focus({ preventScroll: true });
  };
  // Repeticiones: − x2 +, sin volver a dibujar la página (no cambia ningún tono).
  $$('[data-r]').forEach(btn => btn.onclick = () => {
    const e = c.arr[+btn.dataset.r];
    pop(btn, 'step', `<button type="button" data-s="-1" aria-label="Menos repeticiones">−</button><b aria-live="polite"></b><button type="button" data-s="1" aria-label="Más repeticiones">+</button>`, p => {
      const pinta = () => { const n = rOf(e); p.querySelector('b').textContent = 'x' + n; btn.textContent = 'x' + n;
        btn.classList.toggle('mas', n > 1); btn.setAttribute('aria-label', 'Repeticiones: ' + n);
        p.querySelector('[data-s="-1"]').disabled = n <= 1; p.querySelector('[data-s="1"]').disabled = n >= 9; };
      p.querySelectorAll('[data-s]').forEach(x => x.onclick = () => { e.rep = Math.max(1, Math.min(9, rOf(e) + +x.dataset.s)); persist(r); pinta(); });
      pinta();
    });
  });
  // Borrar una parte (deslizando a la izquierda o desde ⋯): sin confirmación, con "Deshacer".
  const borrarParte = j => { const [x] = c.arr.splice(j, 1); re(); avisoDeshacer('Parte borrada', () => { c.arr.splice(j, 0, x); re(); }); };
  deslizar($$('.pl > .pc'), borrarParte);
  // ⋯: Duplicar, Mostrar igual (solo donde corresponde) y Quitar.
  $$('[data-o]').forEach(btn => btn.onclick = () => {
    const j = +btn.dataset.o, e = c.arr[j], mi = mostrarDe(e, j);
    pop(btn, 'menu', `<button type="button" data-a="dup">Duplicar</button>${mi}<div class="sep"></div><button type="button" class="del" data-a="del">Quitar</button>`, (p, cerrar) => {
      p.querySelector('[data-a="dup"]').onclick = () => { cerrar(); c.arr.splice(j + 1, 0, copia(j)); re(); };
      p.querySelector('[data-a="del"]').onclick = () => { cerrar(); borrarParte(j); };
      const x = p.querySelector('[data-mi]'); if (x) x.onchange = () => { if (x.checked) e.mostrar = true; else delete e.mostrar; cerrar(); re(); };
    });
  });

  // ---- Hoja de tono: =, +½, +1, −½ respecto de la parte anterior, o un tono de los 12. Se aplica al tocar; "Listo" cierra.
  const hoja = (j, sinAnim) => {
    const o = PT[j], k = antI(j); if (k < 0 || !modul || o.transicion) return;
    const a = PT[k], e = c.arr[j], d = intervalo(a.tono, o.tono);
    // Tono original: el que tendría la parte sin tono elegido.
    const sinTono = c.arr.map((x, n) => { if (n !== j) return x; const y = { ...x }; delete y.tono; return y; });
    const orig = tonosDelItem({ ...c, arr: sinTono }, SG).partes[j].tono;
    const doce = [...Array(12)].map((_, n) => tonoMas(/m$/.test(o.tono) ? 'Cm' : 'C', n));
    const w = document.createElement('div'); w.className = 'tsheetw';
    w.innerHTML = `<div class="veil"></div><div class="tsheet" role="dialog" aria-modal="true" aria-labelledby="sh-t"><div class="bar"></div>
      <h3 id="sh-t">Tono de ${esc(nom(e))}</h3><p>Respecto de la parte anterior (${esc(nom(c.arr[k]))}, en ${esc(a.tono)})</p>
      <div class="rel">${DIF.map(([n, t]) => `<button type="button" data-n="${n}" aria-pressed="${d === n}">${t}<small>${n ? esc(tonoMas(a.tono, n)) : 'igual'}</small></button>`).join('')}</div>
      <h4>O elegí el tono</h4>
      <div class="keys">${doce.map(t => `<button type="button" data-tk="${t}"${intervalo(t, orig) ? '' : ' class="orig"'} aria-pressed="${!intervalo(t, o.tono)}">${esc(t)}</button>`).join('')}</div>
      <div class="orig-n">Tono original: ${esc(orig)}</div>
      <button type="button" class="primary ok">Listo</button></div>`;
    app.append(w);
    const chipBtn = () => $(`[data-k="${j}"]`);
    const cerrar = () => { w.remove(); document.removeEventListener('keydown', tecla); const b = chipBtn(); if (b) b.focus(); };
    const tecla = ev => { if (ev.key === 'Escape') cerrar(); };
    document.addEventListener('keydown', tecla);
    // Elegir el tono original quita el tono elegido (vuelve a seguir a la parte anterior como en la canción).
    const poner = t => { if (!intervalo(t, orig)) delete e.tono; else e.tono = t; document.removeEventListener('keydown', tecla); re(j); };
    w.querySelector('.veil').onclick = cerrar; w.querySelector('.ok').onclick = cerrar;
    w.querySelectorAll('[data-n]').forEach(b => b.onclick = () => poner(tonoMas(a.tono, +b.dataset.n)));
    w.querySelectorAll('[data-tk]').forEach(b => b.onclick = () => poner(b.dataset.tk));
    (w.querySelector('.tsheet [aria-pressed="true"]') || w.querySelector('.ok')).focus({ preventScroll: true });
    if (!reduced()) { w.querySelector('.tsheet').animate([{ transform: 'translateY(100%)' }, { transform: 'none' }], { duration: sinAnim ? 0 : 240, easing: 'cubic-bezier(.2,.7,.2,1)' });
                      w.querySelector('.veil').animate([{ opacity: 0 }, { opacity: 1 }], { duration: sinAnim ? 0 : 200 }); }
  };
  $$('[data-k]').forEach(b => b.onclick = () => hoja(+b.dataset.k));
  if (abrirTono != null) hoja(abrirTono, true);

  // ---- Mover: arrastrando la manija ≡, o con las flechas arriba/abajo cuando la manija tiene el foco.
  const lista = $('.pl');
  const mover = (a, b) => { const [x] = c.arr.splice(a, 1); c.arr.splice(b, 0, x); re(); };
  $$('[data-h]').forEach(h => {
    h.onkeydown = ev => {
      const j = +h.dataset.h, n = ev.key === 'ArrowUp' ? j - 1 : ev.key === 'ArrowDown' ? j + 1 : -1;
      if (n < 0 || n >= c.arr.length) return; ev.preventDefault(); mover(j, n); const f = $(`[data-h="${n}"]`); if (f) f.focus();
    };
    h.onpointerdown = ev => {
      if (ev.button || c.arr.length < 2) return; ev.preventDefault();
      const j = +h.dataset.h, li = h.closest('li'), items = [...lista.children];
      const top = x => x.getBoundingClientRect().top + scrollY;
      const tops = items.map(top), mid = items.map((x, k) => tops[k] + x.offsetHeight / 2);
      const paso = li.offsetHeight + (items.length > 1 ? (j ? tops[j] - tops[j - 1] - items[j - 1].offsetHeight : tops[1] - tops[0] - items[0].offsetHeight) : 0);
      const y0 = ev.clientY + scrollY; let py = ev.clientY, dest = j, raf = 0;
      h.setPointerCapture(ev.pointerId); li.classList.add('lift'); lista.classList.add('drag');
      const pinta = () => {
        const dy = py + scrollY - y0, centro = mid[j] + dy; li.style.translate = `0 ${dy}px`;
        dest = j;
        for (let k = j + 1; k < items.length && centro > mid[k]; k++) dest = k;
        for (let k = j - 1; k >= 0 && centro < mid[k]; k--) dest = k;
        items.forEach((x, k) => { if (k === j) return; const s = k > j && k <= dest ? -paso : k < j && k >= dest ? paso : 0; x.style.translate = s ? `0 ${s}px` : ''; });
      };
      // Cerca del borde de la pantalla se desplaza solo, para poder llevar la parte lejos.
      const auto = () => { const v = py < 80 ? -10 : py > innerHeight - 80 ? 10 : 0; if (v) { scrollBy(0, v); pinta(); } raf = requestAnimationFrame(auto); };
      raf = requestAnimationFrame(auto);
      h.onpointermove = e2 => { py = e2.clientY; pinta(); };
      h.onpointerup = h.onpointercancel = () => {
        cancelAnimationFrame(raf); h.onpointermove = h.onpointerup = h.onpointercancel = null;
        items.forEach(x => { x.style.translate = ''; }); li.classList.remove('lift'); lista.classList.remove('drag');
        if (dest !== j) mover(j, dest);
      };
    };
  });
}

// ---------- Ajustes (admin con Google) ----------
// { token, email, exp }: se guarda en este dispositivo hasta que vence el token de Google (~1 h);
// después Google vuelve a ingresar solo (auto_select) o pregunta con un toque.
const ADM_KEY = 'cancionero.admin';
const jwtDe = t => { try { return JSON.parse(atob(t.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))); } catch (e) { return {}; } };
let ADMIN = (() => { try { const a = JSON.parse(localStorage.getItem(ADM_KEY)); return a && a.exp * 1000 > Date.now() + 60000 ? a : null; } catch (e) { return null; } })();
const setAdmin = tok => {
  if (!tok) { ADMIN = null; try { localStorage.removeItem(ADM_KEY); } catch (e) {} return; }
  const j = jwtDe(tok); ADMIN = { token: tok, email: j.email || '', exp: j.exp || 0 };
  try { localStorage.setItem(ADM_KEY, JSON.stringify(ADMIN)); } catch (e) {}
};
const GSI = 'https://accounts.google.com/gsi/client';
const loadGsi = () => window.google?.accounts?.id ? Promise.resolve() : new Promise((ok, ko) => {
  const s = document.createElement('script'); s.src = GSI; s.async = true; s.onload = ok; s.onerror = () => ko(new Error('No se pudo cargar el ingreso de Google.')); document.head.appendChild(s);
});

function settings() {
  setTabs(null); document.body.dataset.screen = 'ajustes';
  const st = ds.status();
  app.innerHTML = `${back('Canciones', '#/canciones')}<h2 class="title">Ajustes</h2>
    <p class="meta">${esc(INFO.nombre || (DEMO ? 'Modo demo' : ''))}${INFO.actualizado ? ' · canciones importadas el ' + esc(fmt(INFO.actualizado.slice(0, 10))) : ''}</p>
    <section class="adm"><h3>Pantalla</h3><p class="hint">Solo en este dispositivo.</p>
      <div class="seg" role="radiogroup" aria-label="Modo de pantalla">${[['', 'Automático'], ['light', 'Claro'], ['dark', 'Oscuro']].map(([v, t]) =>
        `<button type="button" role="radio" data-tema="${v}" aria-checked="${(P.tema || '') === v}">${t}</button>`).join('')}</div></section>
    <section class="adm"><h3>Administración</h3><div id="adm"></div></section>`;
  $$('[data-tema]').forEach(b => b.onclick = () => { P.tema = b.dataset.tema; savePrefs(); aplicarTema();
    $$('[data-tema]').forEach(x => x.setAttribute('aria-checked', String(x === b))); });
  const box = $('#adm');
  if (DEMO || !ds.importar) { box.innerHTML = '<p class="hint">En modo demo no hay acciones de administrador.</p>'; return; }
  if (!CONFIG.googleClientId) { box.innerHTML = '<p class="hint">El ingreso de administrador todavía no está configurado.</p>'; return; }
  if (!st.online) { box.innerHTML = '<p class="hint">Hace falta conexión.</p>'; return; }
  if (ADMIN && ADMIN.exp * 1000 < Date.now() + 60000) setAdmin(null);
  if (!ADMIN) {
    // Solo el botón "Iniciar sesión" (sin el cartel emergente de Google): se ingresa cuando uno lo toca.
    box.innerHTML = '<p class="hint">Solo para quien administra el cancionero de la iglesia.</p><div id="gbtn" class="gbtn"></div><p class="err" id="er" role="alert"></p>';
    loadGsi().then(() => {
      google.accounts.id.initialize({ client_id: CONFIG.googleClientId, callback: r => { setAdmin(r.credential); settings(); } });
      google.accounts.id.renderButton($('#gbtn'), { theme: P.tema === 'dark' || (!P.tema && matchMedia('(prefers-color-scheme: dark)').matches) ? 'filled_black' : 'outline',
        size: 'large', text: 'signin', shape: 'pill', locale: 'es' });
    }).catch(e => { $('#er').textContent = e.message; });
    return;
  }
  box.innerHTML = `<div class="sesion"><p class="hint">Ingresaste como <b>${esc(ADMIN.email)}</b></p><button type="button" id="out">Cerrar sesión</button></div>
    <button type="button" class="primary" id="imp">Importar canciones de Drive</button>
    <p class="hint">Convierte los Word de “Letra y Acordes”. Solo procesa los nuevos o modificados; si son muchos puede tardar varios minutos.</p>
    <div id="res" role="status"></div>`;
  $('#out').onclick = () => { setAdmin(null); window.google?.accounts?.id?.disableAutoSelect(); settings(); };
  $('#imp').onclick = async () => {
    const b = $('#imp'), res = $('#res'); b.disabled = true;
    try {
      // Cada tanda dura hasta ~4,5 min en el motor. Si el motor dice "ocupado" (la tanda anterior sigue
      // corriendo) o se corta la conexión, se espera 30 s y se reintenta solo, sin perder el avance.
      let r = null, n = 0, esperas = 0, prog = '';
      const espera = s => new Promise(ok => setTimeout(ok, s * 1000));
      while (n < 40 && esperas < 30) {
        res.innerHTML = `<p class="hint">Importando${n ? ' (tanda ' + (n + 1) + ')' : ''}${prog}… no cierres esta pantalla.</p>`;
        try { r = await ds.importar(ADMIN.token); esperas = 0; }
        catch (x) {
          if (x.code === 'admin' && ADMIN.exp * 1000 < Date.now()) throw Object.assign(new Error('La sesión de Google venció. Volvé a ingresar y tocá Importar: sigue desde donde quedó.'), { code: 'admin' });
          if (x.code && x.code !== 'ocupado') throw x;
          esperas++;
          res.innerHTML = `<p class="hint">Esperando que termine la tanda anterior${prog}… reintento en 30 s.</p>`;
          await espera(30); continue;
        }
        n++;
        if (r.total) prog = ` · ${r.listos} de ${r.total} canciones`;
        if (r.completo) break;
      }
      if (!r) throw new Error('El motor no respondió. Probá de nuevo en unos minutos: sigue desde donde quedó.');
      res.innerHTML = r.completo
        ? `<p class="ok">Listo: ${r.importadas} canciones.${r.fallidas.length ? ' Con problemas:' : ''}</p>${r.fallidas.length ? '<ul class="fails">' + r.fallidas.map(f => `<li><b>${esc(f.archivo)}</b>: ${esc(f.error)}</li>`).join('') + '</ul>' : ''}`
        : `<p class="err">Quedaron ${r.pendientes} archivos sin procesar. Tocá de nuevo para seguir.</p>`;
      if (r.completo) { await load(true); INFO = await ds.info().catch(() => INFO); paintStatus(); }
    } catch (x) {
      if (x.code === 'admin') setAdmin(null);
      res.innerHTML = `<p class="err">${esc(x.message)}</p>`;
    } finally { b.disabled = false; }
  };
}

// ---------- Inicio ----------
async function load(force) {
  if (force) await ds.refresh();
  SONGS = prepare(await ds.getSongs());
  [REG, SES, PERS] = await Promise.all([ds.getRegistro(), ds.listReuniones(), ds.getPersonas()]);
  armarGrupos();
}

(async () => {
  try { await load(); }
  catch (e) { app.innerHTML = `<p class="err">${esc(e.message)} Revisá la conexión y recargá la página.</p>`; return; }
  navInit(); paintStatus(); render();
  if (ds.info) ds.info().then(i => { INFO = i || {}; const c = document.querySelector('.church'); if (c && INFO.nombre) c.textContent = 'Alabanza · ' + INFO.nombre; }).catch(() => {});
  if ('serviceWorker' in navigator) {
    // Versión nueva: al abrir la app o al volver a ella (desde segundo plano) se busca un sw.js nuevo; cuando
    // toma el control, la página se recarga sola en la misma pantalla (después de terminar los guardados pendientes).
    // Si antes no había service worker (primera visita) no se recarga.
    let ctl = navigator.serviceWorker.controller, recargando = false;
    navigator.serviceWorker.addEventListener('controllerchange', async () => {
      const antes = ctl; ctl = navigator.serviceWorker.controller;
      if (!antes || recargando) return; recargando = true;
      await colaGuardar; location.reload();
    });
    navigator.serviceWorker.register('sw.js').then(reg => {
      document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') reg.update().catch(() => {}); });
    }).catch(() => {});
  }
})();
