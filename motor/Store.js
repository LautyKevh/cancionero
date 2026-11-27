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
const ck_ = (ig, what) => 'v1:' + ig.rootId + ':' + what;

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
const REU_HEAD = ['id', 'nombre', 'fecha', 'director', 'clave (sal:hash)', 'canciones (JSON)', 'borrada', 'registrada', 'actualizada'];

function hojaReuniones_(ss, crear) {
  let sh = ss.getSheetByName('Reuniones');
  if (!sh && crear) { sh = ss.insertSheet('Reuniones'); sh.appendRow(REU_HEAD); sh.setFrozenRows(1); }
  return sh;
}
function filaAReunion_(r, i) {
  let canciones = []; try { canciones = JSON.parse(r[5] || '[]'); } catch (e) {}
  return { _row: i + 2, id: String(r[0]), nombre: String(r[1]), fecha: isoDe_(r[2]) || String(r[2]), director: String(r[3]),
           clave: String(r[4]), canciones, borrada: !!r[6], registrada: !!r[7] };
}
function reunionesTodas_(ig) {
  const sh = hojaReuniones_(planilla_(ig), false);
  if (!sh || sh.getLastRow() < 2) return [];
  return sh.getRange(2, 1, sh.getLastRow() - 1, REU_HEAD.length).getValues().map(filaAReunion_).filter(r => r.id);
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
  const fila = [r.id, r.nombre, r.fecha, r.director, r.clave, JSON.stringify(r.canciones || []), r.borrada ? new Date() : '', r.registrada ? 'sí' : '', new Date()];
  if (r._row) sh.getRange(r._row, 1, 1, fila.length).setValues([fila]);
  else sh.appendRow(fila);
  sh.getRange(r._row || sh.getLastRow(), 3).setNumberFormat('@');
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
  const filas = r.canciones.map(c => {
    const f = new Array(n).fill('');
    if (cF >= 0) f[cF] = new Date(y, m - 1, d);
    if (cC >= 0) f[cC] = usaId ? c.id : (titulo[c.id] || c.id);
    if (cT >= 0) f[cT] = c.tono; if (cQ >= 0) f[cQ] = c.quien || ''; if (cO >= 0) f[cO] = 'reunión';
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
    const pend = l => l.filter(r => !r.borrada && !r.registrada && r.canciones && r.canciones.length && r.fecha < hoy);
    if (!pend(reuniones_(ig)).length) return;          // chequeo barato contra la caché
    const lock = LockService.getScriptLock();
    if (!lock.tryLock(5000)) return;                    // otro pedido ya lo está haciendo
    try {
      pend(reunionesTodas_(ig)).forEach(r => { registrarUso_(ig, r); r.registrada = true; guardarReunion_(ig, r); });
    } finally { lock.releaseLock(); }
  } catch (e) { console.error(e && e.stack || e); }
}
