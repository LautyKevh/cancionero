// UI del cancionero. Solo usa `ds` (DataSource) para leer y guardar.
import { LocalDataSource, ClaveError } from './datasource.js';
import { ApiDataSource } from './apidatasource.js';
import { CONFIG } from './config.js';
import { demoSeed } from './demo.js';
import { KEYS, keyAt, shiftTo, keyOption, showKey, transposer } from './music.js';
import { prepare, blocksOf, defArr, isDefArr, arrLines, blockText, base, rOf, summary, search, fmt, isoOf } from './songs.js';

// Motor real si hay iglesia (?c= o config) y no se pidió ?demo=1; si no, modo demo local.
const qs = new URLSearchParams(location.search);
const IGLESIA = qs.get('c') || CONFIG.iglesia;
const DEMO = qs.has('demo') || !IGLESIA || !CONFIG.motor[CONFIG.entorno];
const ds = DEMO ? new LocalDataSource({ seedFn: demoSeed }) : new ApiDataSource({ url: CONFIG.motor[CONFIG.entorno], iglesia: IGLESIA });

// ---------- Estado ----------
const prefs = (() => { try { return JSON.parse(localStorage.getItem('cancionero:prefs') || '{}'); } catch (e) { return {}; } })();
const P = { not: prefs.not || 0, adj: prefs.adj || 0, sadj: prefs.sadj || 0, modos: prefs.modos || {} };
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
// Versiones del mismo título (otro tono, otro archivo) comparten historial.
const versiones = id => { const s = songBy(id); return s ? SONGS.filter(x => x.titulo.toLowerCase() === s.titulo.toLowerCase()).map(x => x.id) : [id]; };
const perOf = id => summary(versiones(id), REG, SES, songBy).per;
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const interp = s => s.interprete && s.interprete !== '-' ? s.interprete : '';

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
      <span class="next-songs">${next.canciones.slice(0, 5).map(c => `<span><i>${esc(c.tono)}</i>${esc((songBy(c.id) || {}).titulo || '')}</span>`).join('')}
        ${next.canciones.length > 5 ? `<span class="more">y ${next.canciones.length - 5} más</span>` : ''}${next.canciones.length ? '' : '<span class="more">Todavía sin canciones</span>'}</span>
      <span class="next-go">Abrir la reunión ${ICON.chev}</span></button>` : '';
  app.innerHTML = `${lastQ ? '' : hero}<div class="searchbox">${ICON.search}<input type="search" id="q" placeholder="Buscar canción, frase o director" value="${esc(lastQ)}" aria-label="Buscar canciones" autocomplete="off"></div>
  <ul class="list" id="res"></ul>`;
  $('#next') && ($('#next').onclick = () => go('#/reunion/' + next.id));
  const q = $('#q'), res = $('#res');
  const paint = () => {
    const had = !!lastQ; lastQ = q.value;
    if (!!lastQ !== had && $('#next')) $('#next').hidden = !!lastQ;
    const f = search(SONGS, q.value, perOf);
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
  <header class="songhead"><div><h2 class="title">${esc(s.titulo)}</h2><p class="meta">${esc(interp(s))}</p></div>${stamp(s.tono, 'Tono original')}</header>
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

/** Líneas de una canción ya transportadas, en HTML. Lo usan la vista y la impresión. */
function sheetRows(s, shift, mus, arr) {
  const T = transposer(s, shift, P.not), kd = showKey(T.key, P.not);
  const src = arrLines(s, arr || defArr(s), mus)
    .filter(l => mus || (l.t !== 'ch' && l.t !== 'mix'))
    .filter((l, i, a) => l.t !== 'blank' || (i > 0 && a[i - 1].t !== 'blank' && a[i - 1].t !== 'sec' && a[i + 1] && a[i + 1].t !== 'sec'));
  // "(Sube a A)" / "(Baja a F#)" no se muestran como texto: se reemplazan por el indicador de cambio de tono.
  const SUBA = /^\(?\s*(sube|baja|subida|bajada)\s+(?:a|al)\s+([A-G][#b]?m?)\s*\)?\.?$/i;
  const indicador = (dir, k) => `<span class="modi">${/^b/i.test(dir) ? '↓' : '↑'} ${esc(showKey(T.chord(k), P.not))}</span>`;
  const line = l => {
    if (l.t === 'blank') return '<div class="gap"></div>';
    if (l.t === 'ly' && SUBA.test(l.v.trim())) { const m = SUBA.exec(l.v.trim()); return `<div>${indicador(m[1], m[2])}</div>`; }
    if (l.t === 'pair') {
      if (!mus) return `<div>${esc(l.segs.map(x => x[1]).join('').trim())}</div>`;
      const it = []; l.segs.forEach(([c, t]) => t.split(/(\s+)/).forEach((x, j) => { if (j === 0 || x) it.push({ c: j === 0 ? c : '', t: x }); }));
      const words = []; let cur = [];
      it.forEach(o => { if (/^\s+$/.test(o.t) && !o.c) { if (cur.length) words.push(cur); words.push([o]); cur = []; } else cur.push(o); });
      if (cur.length) words.push(cur);
      const sg = o => `<span class="sg"><b>${esc(o.c ? T.chord(o.c) : '')}</b><span>${esc(o.t)}</span></span>`;
      return `<div class="pair">${words.map(w => `<span class="w">${w.map(sg).join('')}</span>`).join('')}</div>`;
    }
    if (l.t === 'ch') return `<div class="ch">${esc(T.line(l.v, false))}</div>`;
    if (l.t === 'mix') return `<div class="mix${l.at != null ? ' at' : ''}"${l.at != null ? ` data-anchor="${esc(l.at)}"` : ''}>${esc(T.line(l.v, true))}</div>`;
    return `<div>${esc(mus ? l.v : l.v.replace(/\s{2,}/g, ' ').trim())}</div>`;
  };
  // Cada parte va en su propio bloque (espacio entre partes; al imprimir nunca se corta).
  // Una parte de un solo renglón de acordes (Intro, Inter, Final) muestra los acordes al lado del título;
  // con 2 renglones o más van abajo. El indicador de subida o bajada va en el mismo renglón que el título.
  const partes = []; let cur = null;
  src.forEach(l => { if (l.t === 'sec' || !cur) { cur = { sec: l.t === 'sec' ? l : null, ls: [] }; partes.push(cur); if (l.t === 'sec') return; } cur.ls.push(l); });
  const rows = partes.map(pt => {
    let ls = pt.ls.slice(); while (ls.length && ls[0].t === 'blank') ls.shift(); while (ls.length && ls[ls.length - 1].t === 'blank') ls.pop();
    if (!pt.sec && !ls.length) return '';
    let head = '';
    if (pt.sec) {
      const k = ls.findIndex(x => x.t === 'ly' && SUBA.test(x.v.trim()));
      let mod = '';
      if (k >= 0) { const m = SUBA.exec(ls[k].v.trim()); mod = indicador(m[1], m[2]); ls.splice(k, 1); while (ls.length && ls[0].t === 'blank') ls.shift(); }
      else if (pt.sec.mod && pt.sec.tono) mod = indicador(pt.sec.mod, pt.sec.tono);
      const uno = ls.length === 1 && (ls[0].t === 'ch' || (ls[0].t === 'mix' && ls[0].at == null)) ? ls[0] : null;
      if (uno) return `<section class="parte"><div class="sec inl"><span>${esc(pt.sec.v)}</span>${mod}<span class="${uno.t}">${esc(T.line(uno.v, uno.t === 'mix'))}</span></div></section>`;
      head = `<div class="sec${mod ? ' inl' : ''}"><span>${esc(pt.sec.v)}</span>${mod}</div>`;
    }
    return `<section class="parte">${head}${ls.map(line).join('')}</section>`;
  }).join('');
  return { rows, kd };
}

function drawSheet(anim) {
  const { song: s, mode, shift, ctx } = view, mus = mode === 'm';
  const { rows, kd } = sheetRows(s, shift, mus, ctx && ctx.arr);

  const ctl = (mus ? `<button type="button" id="dn" aria-label="Bajar medio tono">−½</button>
      <span class="now" id="now" title="Tono actual" aria-live="polite">${esc(kd)}</span>
      <button type="button" id="up" aria-label="Subir medio tono">+½</button>
      <button type="button" id="orig" title="Volver al tono original"${shift ? '' : ' disabled'}>Orig.</button>
      <button type="button" id="not" title="Cambiar cifrado: C / Do / grados">${['C', 'Do', 'I'][P.not]}</button><span class="sp"></span>` : '<span class="sp"></span>')
    + `<button type="button" id="sm" aria-label="Achicar letra">A−</button><button type="button" id="bg" aria-label="Agrandar letra">A+</button>
       <button type="button" id="sw">${mus ? 'Cantante' : 'Músico'}</button>
       <button type="button" id="pr" title="Imprimir o guardar como PDF">Imprimir</button>`;

  const r = ctx && ctx.ses, i = ctx && ctx.i;
  let nav = '';
  if (r && i != null) {
    const Pv = r.canciones[i - 1], Nx = r.canciones[i + 1], t = c => esc((songBy(c.id) || {}).titulo || '');
    nav = `<nav class="snav" aria-label="Canciones de la reunión">${Pv ? `<button type="button" id="pv"><small>← Anterior</small><b>${t(Pv)}</b></button>` : '<span></span>'}
      ${Nx ? `<button type="button" id="nx" class="nx"><small>Siguiente →</small><b>${t(Nx)}</b></button>`
           : `<button type="button" id="fin" class="nx"><small>Fin de la reunión</small><b>Volver a la lista</b></button>`}</nav>`;
  }
  const meta = [ctx ? `<b>Dirige ${esc(ctx.quien)}</b>` : '', esc(interp(s)), `Tono original ${esc(s.tono)}${s.bpm ? ' · ' + esc(s.bpm) + ' BPM' : ''}`].filter(Boolean).join(' · ');
  app.innerHTML = `${r ? back(nombreSes(r), '#/reunion/' + r.id) : back('Canciones', '#/canciones')}
  <article class="sheet">
    <header class="songhead"><div><h2 class="title">${esc(s.titulo)}</h2><p class="meta">${meta}</p></div>
      ${mus ? stamp(kd, shift ? 'Ahora' : 'Tono') : ''}</header>
    <div class="ctl" role="toolbar" aria-label="Controles">${ctl}</div>
    <div class="lines ${mus ? '' : 'singer'}">${rows}</div>
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
  $('#pr').onclick = () => imprimir(hojaImpresa(s, shift, mus, ctx && ctx.arr), s.titulo);
  if (r) {
    $('#pv') && ($('#pv').onclick = () => go(`#/reunion/${r.id}/${i - 1}`, 'back'));
    $('#nx') && ($('#nx').onclick = () => go(`#/reunion/${r.id}/${i + 1}`));
    $('#fin') && ($('#fin').onclick = () => go(`#/reunion/${r.id}`, 'back'));
  }
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
  const rows = r.canciones.map((c, i) => { const s = songBy(c.id); if (!s) return '';
    return `<li><button type="button" class="row" data-o="${i}"><span class="num">${i + 1}</span><span class="row-main"><b>${esc(s.titulo)}</b>
      <small>Dirige ${esc(c.quien)}${isDefArr(s, c.arr) ? '' : ' · orden modificado'}</small></span><span class="key">${esc(c.tono)}</span></button></li>`; }).join('');
  app.innerHTML = `${head}
  <div class="ctl"><button type="button" id="sm2" class="modebtn" title="Cambiar modo">${P.modos[r.id] === 'm' ? ICON.piano : ICON.mic}Modo: ${P.modos[r.id] === 'm' ? 'Músico' : 'Cantante'} ⇄</button><span class="sp"></span>
    <button type="button" id="pr" title="Imprimir o guardar como PDF"${r.canciones.length ? '' : ' disabled'}>Imprimir</button><button type="button" id="ed">Editar</button><button type="button" id="del">Borrar</button></div>
  <div id="ask" class="askwrap"></div>
  <ol class="list setlist">${rows || '<li class="empty">Sin canciones todavía. Tocá “Editar” para agregarlas.</li>'}</ol>
  ${r.registrada ? '<p class="hint reg">✓ Anotada en el historial de la planilla.</p>' : ''}`;
  $$('[data-o]').forEach(b => b.onclick = () => go(`#/reunion/${r.id}/${b.dataset.o}`));
  $('#pr').onclick = () => {
    const mus = P.modos[r.id] === 'm';
    const hojas = r.canciones.filter(c => songBy(c.id)).map((c, k) => { const s = songBy(c.id); return hojaImpresa(s, shiftTo(s, c.tono), mus, c.arr, k ? '' : nombreSes(r)); }).join('');
    imprimir(hojas, nombreSes(r));
  };
  $('#sm2').onclick = () => { P.modos[r.id] = P.modos[r.id] === 'm' ? 'c' : 'm'; savePrefs(); openSes(r); };
  const ask = (what, run) => {
    if (!navigator.onLine) { $('#ask').innerHTML = '<p class="err">Para editar o borrar hace falta conexión.</p>'; return; }
    if (unlocked[r.id]) return run(unlocked[r.id]);
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
function hojaImpresa(s, shift, mus, arr, arriba) {
  const { rows, kd } = sheetRows(s, shift, mus, arr);
  return `<article class="phoja">${arriba ? `<p class="pses">${esc(arriba)}</p>` : ''}<h2>${esc(s.titulo)} [${esc(kd)}]</h2><div class="lines ${mus ? '' : 'singer'}">${rows}</div></article>`;
}
// Alto útil de la hoja: A4 o carta, menos los márgenes (se usa el menor de los dos para que entre en ambos).
const HOJA_MM = 279.4 - 2 * 9;
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
  const c = r.canciones[i], s = c && songBy(c.id);
  if (!s) return openSes(r);
  if (!P.modos[r.id]) { P.modos[r.id] = 'm'; savePrefs(); }
  openSheet(s, P.modos[r.id], { ses: r, i, arr: c.arr, quien: c.quien, shift: shiftTo(s, c.tono) });
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

function editSes(r) {
  setTabs(null);
  const rows = r.canciones.map((c, i) => { const s = songBy(c.id); if (!s) return '';
    return `<li class="ed"><div class="edh"><b><span class="num">${i + 1}</span>${esc(s.titulo)}</b><span class="tools">
      <button type="button" data-up="${i}" aria-label="Subir"${i ? '' : ' disabled'}>▲</button><button type="button" data-dn="${i}" aria-label="Bajar"${i < r.canciones.length - 1 ? '' : ' disabled'}>▼</button><button type="button" data-rm="${i}" aria-label="Quitar">✕</button></span></div>
      <div class="edr"><label>Tono<select data-k="${i}">${KEYS.map(k => `<option${k === c.tono ? ' selected' : ''}>${k}</option>`).join('')}</select></label>
      <label>Dirige${personSelect(`data-q="${i}"`, c.quien)}</label>
      <button type="button" data-pa="${i}">Editar</button></div></li>`; }).join('');
  app.innerHTML = `${back(nombreSes(r), '#/reunion/' + r.id)}<h2 class="title">Editar reunión</h2><p class="meta">${esc(nombreSes(r))} · Dirige ${esc(r.director)}</p>
  <ol class="list">${rows || '<li class="empty">Agregá la primera canción con el buscador.</li>'}</ol>
  <div class="form"><label>Agregar canción<input id="ad" type="search" autocomplete="off" placeholder="Buscar por nombre, frase o director"></label>
    <ul class="list sugg" id="sg"></ul><button type="button" class="primary" id="ok">Listo</button></div>`;
  const re = () => { persist(r); const y = scrollY; editSes(r); scrollTo(0, y); };
  const swap = (a, b) => { [r.canciones[a], r.canciones[b]] = [r.canciones[b], r.canciones[a]]; re(); };
  $$('[data-up]').forEach(b => b.onclick = () => swap(+b.dataset.up - 1, +b.dataset.up));
  $$('[data-dn]').forEach(b => b.onclick = () => swap(+b.dataset.dn, +b.dataset.dn + 1));
  $$('[data-rm]').forEach(b => b.onclick = () => { r.canciones.splice(+b.dataset.rm, 1); re(); });
  $$('[data-k]').forEach(x => x.onchange = () => { r.canciones[+x.dataset.k].tono = x.value; persist(r); });
  $$('[data-q]').forEach(x => wirePerson(x, v => { r.canciones[+x.dataset.q].quien = v; persist(r); }));
  $$('[data-pa]').forEach(b => b.onclick = () => go(`#/reunion/${r.id}/editar/${b.dataset.pa}`));
  const ad = $('#ad'), sg = $('#sg');
  // Al tocar el buscador aparece la lista completa; al escribir se va filtrando.
  const showSg = () => {
    const f = search(SONGS, ad.value.trim(), perOf);
    sg.innerHTML = f.map(x => songItem(x, 'data-a')).join('') || '<li class="empty">Sin resultados. Probá con otra palabra.</li>';
  };
  ad.oninput = showSg;
  ad.onfocus = ad.onclick = () => { if (sg.innerHTML) return; showSg(); openAnim(sg); };
  ad.onblur = () => setTimeout(() => { if (document.activeElement !== ad) sg.innerHTML = ''; }, 150);
  sg.onmousedown = e => e.preventDefault(); // que tocar una opción no cierre la lista antes del click
  sg.onclick = e => { const b = e.target.closest('[data-a]'); if (!b) return; const s = songBy(b.dataset.a);
    r.canciones.push({ id: s.id, tono: keyOption(s), quien: r.director, arr: defArr(s) }); re(); $('#ad')?.focus(); };
  $('#ok').onclick = async () => { const b = $('#ok'); b.disabled = true; b.textContent = 'Guardando…'; await colaGuardar; go('#/reunion/' + r.id, 'back'); };
}

// ---------- Partes ----------
function parts(r, i) {
  const c = r.canciones[i], s = c && songBy(c.id); if (!s) return editSes(r);
  setTabs(null);
  const AB = blocksOf(s), B = AB.filter(b => b.has);
  app.innerHTML = `${back('Editar reunión', '#/reunion/' + r.id + '/editar')}<h2 class="title">${esc(s.titulo)}</h2><p class="meta">Orden de las partes · tono ${esc(c.tono)}</p>
  <ol class="list parts">${c.arr.map((e, j) => `<li class="ed"><div class="edh">
    <button type="button" class="pv" data-v="${j}" aria-expanded="false"><b>${esc(base(e.label || '') || '(inicio)')}</b><small>${esc(blockText(AB[e.src])[0] || 'Sin letra (instrumental)')}</small></button>
    <span class="tools"><span class="repc"><button type="button" data-m="${j}" aria-label="Menos repeticiones"${rOf(e) > 1 ? '' : ' disabled'}>−</button><span class="rep">x${rOf(e)}</span><button type="button" data-p="${j}" aria-label="Más repeticiones"${rOf(e) < 9 ? '' : ' disabled'}>+</button></span>
    <button type="button" data-u="${j}" aria-label="Subir"${j ? '' : ' disabled'}>▲</button><button type="button" data-d="${j}" aria-label="Bajar"${j < c.arr.length - 1 ? '' : ' disabled'}>▼</button><button type="button" data-c="${j}" aria-label="Duplicar">⧉</button><button type="button" data-x="${j}" aria-label="Quitar">✕</button></span></div>
    <div class="pvb" hidden><div class="pvb-in">${blockText(AB[e.src]).map(t => `<div>${esc(t)}</div>`).join('') || '<div>Sin letra (instrumental)</div>'}</div></div></li>`).join('')}</ol>
  <div class="form"><label>Agregar parte<select id="ap"><option value="">Elegir…</option>${B.map(b => `<option value="${b.id}">${esc((b.label || '(inicio)') + ' — ' + (blockText(b)[0] || 'instrumental'))}</option>`).join('')}</select></label>
    <button type="button" id="rs">Volver al orden original</button><button type="button" class="primary" id="ok">Listo</button></div>`;
  const re = () => { persist(r); const y = scrollY; parts(r, i); scrollTo(0, y); };
  const sw = (a, b) => { [c.arr[a], c.arr[b]] = [c.arr[b], c.arr[a]]; re(); };
  $('#rs').onclick = () => { c.arr = defArr(s); re(); };
  $('#ok').onclick = async () => { await colaGuardar; go('#/reunion/' + r.id + '/editar', 'back'); };
  $$('[data-u]').forEach(b => b.onclick = () => sw(+b.dataset.u - 1, +b.dataset.u));
  $$('[data-d]').forEach(b => b.onclick = () => sw(+b.dataset.d, +b.dataset.d + 1));
  $$('[data-c]').forEach(b => b.onclick = () => { const j = +b.dataset.c; c.arr.splice(j + 1, 0, { ...c.arr[j] }); re(); });
  $$('[data-v]').forEach(b => b.onclick = () => {
    const li = b.closest('li'), box = li.querySelector('.pvb'), open = li.classList.toggle('open');
    b.setAttribute('aria-expanded', String(open));
    if (reduced()) { box.hidden = !open; return; }
    box.hidden = false; const h = box.scrollHeight;
    const a = box.animate(open ? [{ height: 0, opacity: 0 }, { height: h + 'px', opacity: 1 }] : [{ height: h + 'px', opacity: 1 }, { height: 0, opacity: 0 }], { duration: 220, easing: 'cubic-bezier(.2,.7,.2,1)' });
    a.onfinish = () => { box.hidden = !li.classList.contains('open'); };
  });
  $$('[data-m]').forEach(b => b.onclick = () => { const e = c.arr[+b.dataset.m]; e.rep = Math.max(1, rOf(e) - 1); re(); });
  $$('[data-p]').forEach(b => b.onclick = () => { const e = c.arr[+b.dataset.p]; e.rep = Math.min(9, rOf(e) + 1); re(); });
  $$('[data-x]').forEach(b => b.onclick = () => { c.arr.splice(+b.dataset.x, 1); re(); });
  $('#ap').onchange = e => { const b = AB[+e.target.value]; if (b) { c.arr.push({ src: b.id, label: b.label, rep: 1 }); re(); } };
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
    <section class="adm"><h3>Administración</h3><div id="adm"></div></section>`;
  const box = $('#adm');
  if (DEMO || !ds.importar) { box.innerHTML = '<p class="hint">En modo demo no hay acciones de administrador.</p>'; return; }
  if (!CONFIG.googleClientId) { box.innerHTML = '<p class="hint">El ingreso de administrador todavía no está configurado.</p>'; return; }
  if (!st.online) { box.innerHTML = '<p class="hint">Hace falta conexión.</p>'; return; }
  if (ADMIN && ADMIN.exp * 1000 < Date.now() + 60000) setAdmin(null);
  if (!ADMIN) {
    box.innerHTML = '<p class="hint">Solo para quien administra el cancionero de la iglesia.</p><div id="gbtn"></div><p class="err" id="er" role="alert"></p>';
    loadGsi().then(() => {
      google.accounts.id.initialize({ client_id: CONFIG.googleClientId, auto_select: true, callback: r => { setAdmin(r.credential); settings(); } });
      google.accounts.id.renderButton($('#gbtn'), { theme: 'outline', size: 'large', text: 'signin_with', locale: 'es' });
      google.accounts.id.prompt();
    }).catch(e => { $('#er').textContent = e.message; });
    return;
  }
  box.innerHTML = `<p class="hint">Ingresaste como <b>${esc(ADMIN.email)}</b>.</p>
    <button type="button" class="primary" id="imp">Importar canciones de Drive</button>
    <p class="hint">Convierte los Word de “Letra y Acordes”. Solo procesa los nuevos o modificados; si son muchos puede tardar varios minutos.</p>
    <div id="res" role="status"></div><button type="button" id="out">Salir</button>`;
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
}

(async () => {
  try { await load(); }
  catch (e) { app.innerHTML = `<p class="err">${esc(e.message)} Revisá la conexión y recargá la página.</p>`; return; }
  navInit(); paintStatus(); render();
  if (ds.info) ds.info().then(i => { INFO = i || {}; const c = document.querySelector('.church'); if (c && INFO.nombre) c.textContent = 'Alabanza · ' + INFO.nombre; }).catch(() => {});
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
})();
