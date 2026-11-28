// Acceso a datos: JSON en Datos/ y la planilla de cada iglesia.
// Reglas con la planilla: solo se LEE Canciones/Registro/Personas; se AGREGAN filas al final de
// Registro y Personas; la pestaña Reuniones la crea y la maneja el motor. Nunca se modifican ni
// borran filas existentes. Antes de la primera escritura se respalda la planilla en Datos/.

// ---------- Caché (CacheService con trozos de 90 KB) ----------
const CACHE_TTL = 6 * 60 * 60;
function cacheGet_(key) {
  const c = CacheService.getScriptCache(), head = c.get(key);
  if (!head) return null;
  if (head.indexOf('chunks:') !== 0) return JSON.parse(head);
  const n = +head.slice(7), keys = []; for (let i = 0; i < n; i++) keys.push(key + ':' + i);
  const parts = c.getAll(keys), out = [];
  for (const k of keys) { if (parts[k] == null) return null; out.push(parts[k]); }
  return JSON.parse(out.join(''));
}
function cachePut_(key, val) {
  const c = CacheService.getScriptCache(), s = JSON.stringify(val), size = 90000;
  if (s.length < size) { c.put(key, s, CACHE_TTL); return; }
  const m = {}; let n = 0;
  for (let i = 0; i < s.length; i += size) m[key + ':' + (n++)] = s.slice(i, i + size);
  c.putAll(m, CACHE_TTL); c.put(key, 'chunks:' + n, CACHE_TTL);
}
function cacheDel_(key) { CacheService.getScriptCache().remove(key); }
const ck_ = (ig, what) => 'v3:' + ig.rootId + ':' + what;

// ---------- Datos/ ----------
function datos_(ig) {
  if (ig.datosId) { try { return DriveApp.getFolderById(ig.datosId); } catch (e) {} }
  const root = DriveApp.getFolderById(ig.rootId);
  const d = buscarSubcarpeta_(root, 'Datos') || root.createFolder('Datos');
  registrarIglesia_(ig.rootId, { datosId: d.getId() }); ig.datosId = d.getId();
  return d;
}
function subcarpeta_(parent, nombre) { return buscarSubcarpeta_(parent, nombre) || parent.createFolder(nombre); }

function leerJson_(folder, nombre, def) {
  const it = folder.getFilesByName(nombre);
  if (!it.hasNext()) return def;
  try { return JSON.parse(it.next().getBlob().getDataAsString('UTF-8')); } catch (e) { return def; }
}
function escribirJson_(folder, nombre, data) {
  const s = JSON.stringify(data), it = folder.getFilesByName(nombre);
  if (it.hasNext()) it.next().setContent(s);
  else folder.createFile(nombre, s, 'application/json');
}

// ---------- Canciones ----------
function cancionero_(ig) {
  const k = ck_(ig, 'cancionero');
  let c = cacheGet_(k);
  if (c) return c;
  c = leerJson_(datos_(ig), 'cancionero.json', null);
  if (!c) throw apiError_('Todavía no se importaron las canciones de esta iglesia.', 'sin-canciones');
  cachePut_(k, c);
  return c;
}

// ---------- Planilla ----------
function planilla_(ig) { return SpreadsheetApp.openById(ig.planillaId); }
const norm_ = t => String(t == null ? '' : t).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9ñ ]/g, ' ').replace(/\s+/g, ' ').trim();
function col_(headers, re) { return headers.findIndex(h => re.test(norm_(h))); }
const DIAS_ = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
/** "2026-11-29" → "Domingo 29-11-2026" (sin hora ni huso horario). */
function nombreDeFecha_(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || ''); if (!m) return String(iso || '');
  return DIAS_[new Date(+m[1], +m[2] - 1, +m[3]).getDay()] + ' ' + m[3] + '-' + m[2] + '-' + m[1];
}
function isoDe_(v) {
  if (v instanceof Date) return Utilities.formatDate(v, 'America/Argentina/Buenos_Aires', 'yyyy-MM-dd');
  const s = String(v || '').trim(); let m;
  if ((m = /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/.exec(s))) return m[3] + '-' + m[2].padStart(2, '0') + '-' + m[1].padStart(2, '0');
  if ((m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s))) return m[1] + '-' + m[2] + '-' + m[3];
  return '';
}

/** Filas de una pestaña como objetos {headers, rows}. */
function tabla_(ss, nombre) {
  const sh = ss.getSheetByName(nombre);
  if (!sh || sh.getLastRow() < 1) return { sh, headers: [], rows: [] };
  const v = sh.getDataRange().getValues();
  return { sh, headers: v[0].map(String), rows: v.slice(1) };
}

/** Mapa título normalizado → id, a partir del cancionero. */
function idPorTitulo_(ig) {
  const m = {};
  try { cancionero_(ig).forEach(s => { const k = norm_(s.titulo); if (!m[k] || s.id.length < m[k].length) m[k] = s.id; m[norm_(s.id)] = s.id; }); } catch (e) {}
  return m;
}

function registro_(ig) {
  const k = ck_(ig, 'registro'); const c = cacheGet_(k); if (c) return c;
  const t = tabla_(planilla_(ig), 'Registro'), H = t.headers, ids = idPorTitulo_(ig);
  const cF = col_(H, /fecha/), cC = col_(H, /cancion/), cT = col_(H, /tono/), cQ = col_(H, /quien|dirig/), cO = col_(H, /origen/);
  const out = t.rows.filter(r => cC >= 0 && r[cC] !== '').map(r => {
    const raw = String(r[cC]).trim();
    return { f: cF >= 0 ? isoDe_(r[cF]) : '', id: ids[norm_(raw)] || raw, t: cT >= 0 ? String(r[cT]).trim() : '',
             q: cQ >= 0 ? String(r[cQ]).trim() : '', o: cO >= 0 ? String(r[cO]).trim() : '' };
  });
  cachePut_(k, out); return out;
}

function personas_(ig) {
  const k = ck_(ig, 'personas'); const c = cacheGet_(k); if (c) return c;
  const t = tabla_(planilla_(ig), 'Personas'), seen = {}, out = [];
  t.rows.forEach(r => { const n = String(r[0] || '').trim(); if (n && !seen[n.toLowerCase()]) { seen[n.toLowerCase()] = 1; out.push(n); } });
  cachePut_(k, out); return out;
}

// ---------- Reuniones (pestaña creada por el motor) ----------
const REU_HEAD = ['id', 'nombre', 'fecha', 'director', 'clave (sal:hash)', 'canciones (JSON)', 'borrada', 'registrada', 'actualizada', 'historial admin (JSON)'];

function hojaReuniones_(ss, crear) {
  let sh = ss.getSheetByName('Reuniones');
  if (!sh && crear) { sh = ss.insertSheet('Reuniones'); sh.appendRow(REU_HEAD); sh.setFrozenRows(1); }
  return sh;
}
function filaAReunion_(r, i) {
  let canciones = []; try { canciones = JSON.parse(r[5] || '[]'); } catch (e) {}
  // Reuniones guardadas antes de los pid: ids deterministas hasta que se vuelvan a guardar.
  canciones.forEach((it, k) => { if (!it.pid) it.pid = 'i' + k; (it.arr || []).forEach((p, j) => { if (!p.pid) p.pid = it.pid + 'p' + j; }); });
  const fecha = isoDe_(r[2]) || String(r[2]);
  // Reuniones guardadas antes del arreglo: Hojas pudo haber convertido el nombre en fecha.
  const nombre = r[1] instanceof Date ? nombreDeFecha_(isoDe_(r[1]) || fecha) : String(r[1]);
  let historial = []; try { historial = JSON.parse(r[9] || '[]'); } catch (e) {}
  return { _row: i + 2, id: String(r[0]), nombre, fecha, director: String(r[3]),
           clave: String(r[4]), canciones, borrada: !!r[6], registrada: !!r[7], historial };
}
function reunionesTodas_(ig) {
  const sh = hojaReuniones_(planilla_(ig), false);
  if (!sh || sh.getLastRow() < 2) return [];
  const R = sh.getRange(2, 1, sh.getLastRow() - 1, REU_HEAD.length).getValues().map(filaAReunion_).filter(r => r.id);
  // Word repetidos que se van a borrar del Drive: en las reuniones se usan el que se conserva, con el mismo tono
  // y arreglo (Datos/reemplazos-word.json: { idViejo: idNuevo }). Al guardar la reunión queda escrito el nuevo.
  const rem = leerJson_(datos_(ig), 'reemplazos-word.json', {});
  if (Object.keys(rem).length) R.forEach(r => (r.canciones || []).forEach(it => {
    if (rem[it.id]) it.id = rem[it.id];
    (it.canciones || []).forEach(x => { if (rem[x.id]) x.id = rem[x.id]; });
    (it.arr || []).forEach(p => { if (rem[p.cancion]) p.cancion = rem[p.cancion]; });
  }));
  return R;
}
const publica_ = r => ({ id: r.id, nombre: r.nombre, fecha: r.fecha, director: r.director, canciones: r.canciones, registrada: r.registrada });

function reuniones_(ig) {
  const k = ck_(ig, 'reuniones'); const c = cacheGet_(k); if (c) return c;
  const out = reunionesTodas_(ig).filter(r => !r.borrada).map(publica_);
  cachePut_(k, out); return out;
}

// ---------- Escrituras (siempre dentro de un lock) ----------
function conLock_(fn) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(20000)) throw apiError_('El servidor está ocupado. Probá de nuevo en unos segundos.', 'ocupado');
  try { return fn(); } finally { lock.releaseLock(); }
}

/** Copia de respaldo de la planilla en Datos/Respaldos antes de la primera escritura. */
function respaldar_(ig) {
  if (iglesias_()[ig.rootId].respaldada) return;
  const f = DriveApp.getFileById(ig.planillaId);
  const fecha = Utilities.formatDate(new Date(), 'America/Argentina/Buenos_Aires', 'dd-MM-yyyy HH.mm');
  f.makeCopy('Respaldo ' + f.getName() + ' ' + fecha, subcarpeta_(datos_(ig), 'Respaldos'));
  registrarIglesia_(ig.rootId, { respaldada: true });
}

function agregarPersonas_(ig, nombres) {
  const nuevos = [], ya = personas_(ig).map(n => n.toLowerCase());
  nombres.forEach(n => { n = String(n || '').trim(); if (n && ya.indexOf(n.toLowerCase()) < 0) { ya.push(n.toLowerCase()); nuevos.push(n); } });
  if (!nuevos.length) return;
  respaldar_(ig);
  const sh = planilla_(ig).getSheetByName('Personas');
  if (!sh) throw apiError_('La planilla no tiene la pestaña Personas.', 'planilla');
  sh.getRange(sh.getLastRow() + 1, 1, nuevos.length, 1).setValues(nuevos.map(n => [n]));
  cacheDel_(ck_(ig, 'personas'));
}

function guardarReunion_(ig, r) {
  respaldar_(ig);
  const sh = hojaReuniones_(planilla_(ig), true);
  const fila = [r.id, r.nombre, r.fecha, r.director, r.clave, JSON.stringify(r.canciones || []), r.borrada ? new Date() : '', r.registrada ? 'sí' : '', new Date(), JSON.stringify(r.historial || [])];
  // Hojas creadas antes de la columna del historial: se agrega el encabezado.
  if (sh.getLastColumn() < REU_HEAD.length) sh.getRange(1, REU_HEAD.length).setValue(REU_HEAD[REU_HEAD.length - 1]);
  // Texto plano ANTES de escribir: si no, Hojas convierte "2026-11-29" o "Domingo 29-11-2026" en fecha con hora.
  const fil = r._row || sh.getLastRow() + 1;
  sh.getRange(fil, 1, 1, 4).setNumberFormat('@');
  sh.getRange(fil, 1, 1, fila.length).setValues([fila]);
  if (!r._row) r._row = fil;
  cacheDel_(ck_(ig, 'reuniones'));
}

/** Agrega al final de Registro una fila por canción de la reunión (origen "reunión"). */
function registrarUso_(ig, r) {
  const ss = planilla_(ig), t = tabla_(ss, 'Registro');
  if (!t.sh) throw apiError_('La planilla no tiene la pestaña Registro.', 'planilla');
  const H = t.headers, n = Math.max(H.length, 1);
  const cF = col_(H, /fecha/), cC = col_(H, /cancion/), cT = col_(H, /tono/), cQ = col_(H, /quien|dirig/), cO = col_(H, /origen/);
  const titulo = {}; try { cancionero_(ig).forEach(s => titulo[s.id] = s.titulo); } catch (e) {}
  const usaId = cC >= 0 && /\bid\b/.test(norm_(H[cC]));
  const [y, m, d] = r.fecha.split('-').map(Number);
  const filas = itemsPlanos_(ig, r).map(c => {
    const f = new Array(n).fill('');
    if (cF >= 0) f[cF] = new Date(y, m - 1, d);
    if (cC >= 0) f[cC] = usaId ? c.id : (titulo[c.id] || c.id);
    if (cT >= 0) f[cT] = c.tono; if (cQ >= 0) f[cQ] = c.quien || ''; if (cO >= 0) f[cO] = c.ref;
    return f;
  });
  if (!filas.length) return 0;
  respaldar_(ig);
  t.sh.getRange(t.sh.getLastRow() + 1, 1, filas.length, n).setValues(filas);
  cacheDel_(ck_(ig, 'registro'));
  return filas.length;
}

/** Reuniones cuya fecha ya pasó (hasta ayer) y todavía no están en Registro: se anotan solas,
 *  con la última versión guardada de la lista. Se llama en las lecturas; nunca hace fallar la lectura. */
function anotarPasadas_(ig) {
  try {
    const hoy = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
    const pend = l => l.filter(r => !r.borrada && !r.registrada && (r.canciones || []).length && r.fecha < hoy);
    if (!pend(reuniones_(ig)).length) return;          // chequeo barato contra la caché
    const lock = LockService.getScriptLock();
    if (!lock.tryLock(5000)) return;                    // otro pedido ya lo está haciendo
    try {
      pend(reunionesTodas_(ig)).forEach(r => { registrarUso_(ig, r); r.registrada = true; guardarReunion_(ig, r); });
    } finally { lock.releaseLock(); }
  } catch (e) { console.error(e && e.stack || e); }
}

// ---------- Ítems de reunión: arreglo completo (SPEC §5 "Reuniones") ----------
// Canción: { pid, id, tono, quien, modulante?, desde?, arr: [Parte] }
// Medley:  { pid, tipo: 'medley', nombre, tono, quien, canciones: [{ id, quien }], arr: [Parte] }
// Parte:   { pid, src | nueva, cancion?, label, rep, tono?, mostrar?, lineas?, cambios?, editado? }
const LIM_ACORDES_ = { bytes: 20000, lineas: 200, cambios: 30, porMinuto: 30, porPersonaMinuto: 10 };
const nuevoPid_ = () => Math.random().toString(36).slice(2, 9);
const TIPOS_LINEA_ = ['pair', 'ch', 'mix', 'ly', 'blank', 'sec'];

/** Valida líneas con el mismo formato que la canción. Devuelve una copia limpia o lanza error. */
function limpiarLineas_(L) {
  if (!Array.isArray(L)) throw apiError_('Formato de acordes inválido.', 'formato');
  if (L.length > LIM_ACORDES_.lineas || JSON.stringify(L).length > LIM_ACORDES_.bytes) throw apiError_('La parte es demasiado larga.', 'tamano');
  // Marcas de la línea: acordes puente, [ ] (modula), { } (repite) y nota anclada a una palabra (at).
  const marcas = (o, l) => { ['puente', 'modula', 'repite'].forEach(k => { if (l[k]) o[k] = true; }); if (l.at != null) o.at = String(l.at).slice(0, 40); return o; };
  return L.map(l => {
    if (!l || TIPOS_LINEA_.indexOf(l.t) < 0) throw apiError_('Formato de acordes inválido.', 'formato');
    if (l.t === 'pair') {
      if (!Array.isArray(l.segs)) throw apiError_('Formato de acordes inválido.', 'formato');
      const o = { t: 'pair', segs: l.segs.map(sg => [String(sg[0] || '').slice(0, 30), String(sg[1] || '').slice(0, 300)]) };
      return marcas(o, l);
    }
    if (l.t === 'blank') return { t: 'blank' };
    return marcas({ t: l.t, v: String(l.v || '').slice(0, 300) }, l);
  });
}

/** Limpia un ítem que manda el director. `previo` (pid → parte guardada) conserva acordes e historial de los músicos. */
function limpiarItem_(x, previo, pidsItems) {
  previo = previo || {};
  const usados = {};
  const parte = a => {
    const p = { label: a.label == null ? null : String(a.label).slice(0, 80), rep: Math.max(1, Math.min(9, +a.rep || 1)) };
    let pid = a.pid ? String(a.pid).slice(0, 20) : '';
    if (!pid || usados[pid]) pid = nuevoPid_();       // sin pid, o duplicada (⧉): parte nueva
    usados[pid] = 1; p.pid = pid;
    if (a.nueva) p.nueva = true; else p.src = a.src == null ? null : +a.src;
    if (a.cancion != null) p.cancion = String(a.cancion);
    if (a.tono) p.tono = String(a.tono).slice(0, 8);
    if (a.mostrar) p.mostrar = true;
    const ant = a.pid && previo[a.pid];
    // Variante elegida por un músico: se respeta salvo que el director cambie esa misma parte.
    if (ant && ant.variante && String(a.pid) === pid && !p.nueva && (p.src === ant.variante.de || p.src === ant.src)) {
      p.src = ant.src; p.label = ant.label; p.variante = ant.variante;
    }
    if (ant && String(a.pid) === pid) {
      // Parte existente: los acordes los editan los músicos (editarAcordes); el director no los pisa.
      ['lineas', 'cambios', 'editado'].forEach(k => { if (ant[k] != null) p[k] = ant[k]; });
    } else if (a.lineas != null) {
      p.lineas = limpiarLineas_(a.lineas);              // parte nueva, copia (⧉) o "Como la última vez"
    }
    return p;
  };
  const arr = Array.isArray(x.arr) ? x.arr.map(parte) : [];
  let pid = x.pid ? String(x.pid).slice(0, 20) : '';
  if (!pid || (pidsItems && pidsItems[pid])) pid = nuevoPid_();
  if (pidsItems) pidsItems[pid] = 1;
  const desde = x.desde ? String(x.desde).slice(0, 60) : undefined;
  if (x.tipo === 'medley') {
    const canciones = (Array.isArray(x.canciones) ? x.canciones : []).filter(c => c && c.id).map(c => ({ id: String(c.id), quien: String(c.quien || '') }));
    if (canciones.length < 2) throw apiError_('Un medley necesita al menos 2 canciones.', 'formato');
    return { pid, tipo: 'medley', nombre: String(x.nombre || ''), tono: String(x.tono || ''), quien: String(x.quien || ''), canciones, arr };
  }
  const o = { pid, id: String(x.id), tono: String(x.tono || ''), quien: String(x.quien || ''), arr };
  if (x.modulante != null) o.modulante = !!x.modulante;
  if (desde) o.desde = desde;
  return o;
}

/** pid → parte, de todas las partes guardadas de una reunión. */
function partesPorPid_(r) {
  const m = {}; (r.canciones || []).forEach(it => (it.arr || []).forEach(p => { if (p.pid) m[p.pid] = p; })); return m;
}

/** Edición de acordes de una parte por un músico (sin clave). lineas null = volver a la base. */
function editarAcordes_(ig, r, itemPid, partePid, lineas, quien) {
  // Cambios del ensayo: solo de esta reunión, sin nombre ni clave (SPEC §7). Queda la fecha en el historial.
  const cache = CacheService.getScriptCache(), min = Math.floor(Date.now() / 60000);
  const k1 = 'acordes:' + ig.rootId + ':' + min, n1 = +(cache.get(k1) || 0);
  if (n1 >= LIM_ACORDES_.porMinuto) throw apiError_('Demasiadas ediciones seguidas. Esperá un minuto.', 'limite');
  const it = (r.canciones || []).find(x => x.pid === itemPid);
  // Ítem en el orden original (arr vacío): se materializa el arreglo base, con pids, para poder editar una parte.
  if (it && !(it.arr || []).length && it.tipo !== 'medley') {
    const s = cancionero_(ig).find(x => x.id === it.id);
    if (s) it.arr = arrBase_(s).map((p, j) => Object.assign({ pid: it.pid + 'p' + j }, p));
  }
  const p = it && (it.arr || []).find(x => x.pid === partePid);
  if (!p) throw apiError_('Esa parte ya no está en la reunión. Recargá.', 'no-existe');
  const nuevas = lineas == null ? null : limpiarLineas_(lineas);
  if (nuevas == null && p.nueva) throw apiError_('Una parte nueva no tiene versión base.', 'formato');
  const fecha = new Date().toISOString();
  // La versión anterior queda en el historial (gana el último guardado; lo anterior se puede restaurar).
  p.cambios = [{ quien: p.editado ? p.editado.quien : '', fecha: p.editado ? p.editado.fecha : '', lineas: p.lineas == null ? null : p.lineas }]
    .concat(p.cambios || []).slice(0, LIM_ACORDES_.cambios);
  if (nuevas == null) delete p.lineas; else p.lineas = nuevas;
  p.editado = { fecha };
  guardarReunion_(ig, r);
  cache.put(k1, String(n1 + 1), 120);
  return p;
}

/** Otra variante de una parte (misma letra, otros acordes), elegida por un músico (sin clave ni nombre; queda la fecha). */
function elegirVariante_(ig, r, itemPid, partePid, src, label) {
  src = +src; if (!(src >= 0 && src < 500)) throw apiError_('Variante inválida.', 'formato');
  const cache = CacheService.getScriptCache(), min = Math.floor(Date.now() / 60000);
  const k1 = 'acordes:' + ig.rootId + ':' + min, n1 = +(cache.get(k1) || 0);
  if (n1 >= LIM_ACORDES_.porMinuto) throw apiError_('Demasiados cambios seguidos. Esperá un minuto.', 'limite');
  const it = (r.canciones || []).find(x => x.pid === itemPid);
  const p = it && (it.arr || []).find(x => x.pid === partePid);
  if (!p || p.nueva) throw apiError_('Esa parte ya no está en la reunión. Recargá.', 'no-existe');
  const de = p.variante ? p.variante.de : p.src;
  // Los acordes editados eran de la otra variante: quedan en el historial.
  if (p.lineas != null) { p.cambios = [{ quien: p.editado ? p.editado.quien : '', fecha: p.editado ? p.editado.fecha : '', lineas: p.lineas }].concat(p.cambios || []).slice(0, LIM_ACORDES_.cambios); delete p.lineas; delete p.editado; }
  p.src = src; p.label = label == null ? null : String(label).slice(0, 80);
  if (src === de) delete p.variante; else p.variante = { de: de, fecha: new Date().toISOString() };
  guardarReunion_(ig, r);
  cache.put(k1, String(n1 + 1), 120);
  return p;
}

/** Filas para Registro y Personas: { id, quien, tono: 'G→Ab→A', ref } (cada canción de un medley por separado). */
function itemsPlanos_(ig, r) {
  const songs = {}; try { cancionero_(ig).forEach(s => { songs[s.id] = s; }); } catch (e) {}
  const out = [];
  (r.canciones || []).forEach(x => {
    let tt;
    try { tt = tonosTocados_(x, songs); }
    catch (e) { tt = (x.tipo === 'medley' ? x.canciones : [x]).map(c => ({ id: c.id, quien: c.quien || x.quien, tonos: [x.tono] })); }
    tt.forEach(t => out.push({ id: t.id, quien: t.quien, tono: t.tonos.filter(Boolean).join('→'), ref: 'reunión ' + r.id + '#' + (x.pid || '') }));
  });
  return out;
}

// ---------- Datos de cada canción editados por los músicos (Datos/datos-canciones.json) ----------
// { [id]: { interprete?, tonoOriginal?, bpm?, cambios: [{ campo, antes, despues, quien, fecha }] } }
// Se aplican encima del cancionero importado (sin reimportar). Vacío: lo completa cualquiera; con valor: solo el admin (SPEC §5).
const CAMPOS_DATOS_ = ['interprete', 'tonoOriginal', 'bpm'];
function datosCanciones_(ig) {
  const k = ck_(ig, 'datos-canciones');
  let d = cacheGet_(k); if (d) return d;
  d = leerJson_(datos_(ig), 'datos-canciones.json', {}); cachePut_(k, d); return d;
}
function conDatos_(s, d) {
  const x = d && d[s.id]; if (!x) return s;
  const o = Object.assign({}, s);
  CAMPOS_DATOS_.forEach(c => { if (x[c] !== undefined) o[c] = x[c]; });
  o.datosCambios = x.cambios || [];
  return o;
}
function cancioneroConDatos_(ig) { const d = datosCanciones_(ig); return cancionero_(ig).map(s => conDatos_(s, d)); }

function editarDatos_(ig, id, campos, admin) {
  const cache = CacheService.getScriptCache(), min = Math.floor(Date.now() / 60000);
  const k1 = 'datos:' + ig.rootId + ':' + min, n1 = +(cache.get(k1) || 0);
  if (n1 >= LIM_ACORDES_.porMinuto) throw apiError_('Demasiados cambios seguidos. Esperá un minuto.', 'limite');
  const base = cancionero_(ig).find(s => s.id === id);
  if (!base) throw apiError_('No existe esa canción.', 'no-existe');
  const d = leerJson_(datos_(ig), 'datos-canciones.json', {});
  const x = d[id] || { cambios: [] }, actual = conDatos_(base, d), fecha = new Date().toISOString();
  let n = 0;
  CAMPOS_DATOS_.forEach(c => {
    if (!campos || !(c in campos)) return;
    let v = campos[c];
    if (c === 'bpm') { v = v === '' || v == null ? null : Math.round(+v); if (v != null && !(v >= 20 && v <= 400)) throw apiError_('BPM inválido (20 a 400).', 'formato'); }
    else v = String(v == null ? '' : v).trim().slice(0, 80);
    const antes = actual[c] == null || actual[c] === '-' ? (c === 'bpm' ? null : '') : actual[c];
    if (v === antes) return;
    // Un dato vacío lo completa cualquiera; uno que ya tiene valor, solo el admin (SPEC §5).
    if (antes !== '' && antes != null && !admin) throw apiError_('Ese dato ya está cargado: solo el admin lo puede cambiar.', 'admin');
    x[c] = v; x.cambios = [{ campo: c, antes, despues: v, fecha, admin: admin || null }].concat(x.cambios || []).slice(0, LIM_ACORDES_.cambios);
    n++;
  });
  if (!n) return conDatos_(base, d);
  d[id] = x; escribirJson_(datos_(ig), 'datos-canciones.json', d);
  cacheDel_(ck_(ig, 'datos-canciones'));
  cache.put(k1, String(n1 + 1), 120);
  return conDatos_(base, d);
}
