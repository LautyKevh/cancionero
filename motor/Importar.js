// Importación de canciones: Word de "Letra y Acordes" → Datos/canciones/<id>.json + Datos/cancionero.json.
// Solo escribe dentro de Datos/. Lee (sin modificar) la pestaña Canciones para intérprete, BPM y estado.

const DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

function slug_(t) {
  return norm_(t).replace(/ñ/g, 'n').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'cancion';
}

/** Datos de la pestaña Canciones por título normalizado (solo lectura). */
function catalogo_(ig) {
  const t = tabla_(planilla_(ig), 'Canciones'), H = t.headers, out = {};
  const cT = col_(H, /cancion|titulo|nombre/), cI = col_(H, /interprete|artista|autor/), cK = col_(H, /tono/),
        cB = col_(H, /bpm/), cE = col_(H, /estado/), cId = H.findIndex(h => norm_(h) === 'id'), cConf = col_(H, /confianza/);
  t.rows.forEach(r => {
    const titulo = cT >= 0 ? String(r[cT]).trim() : ''; if (!titulo) return;
    out[norm_(titulo)] = { id: cId >= 0 ? String(r[cId]).trim() : '', titulo, interprete: cI >= 0 ? String(r[cI]).trim() : '',
      tono: cK >= 0 ? String(r[cK]).trim() : '', bpm: cB >= 0 && +r[cB] ? +r[cB] : null, estado: cE >= 0 ? String(r[cE]).trim() : '',
      confianza: cConf >= 0 ? String(r[cConf]).trim().toLowerCase() : '' };
  });
  return out;
}

// Paréntesis del nombre del archivo que son el intérprete (persona o grupo). Los demás ("(Simple)", "(New)",
// "(Con subida)", subtítulos como "(Abba Padre)" o nombres dudosos) quedan en el título.
const INTERPRETES_ = ['Anástasis', 'Jaime Murrel', 'Elevation', 'Hillsong', 'Majo Solis', 'Marcos Brunet'];
// Paréntesis que son una versión de la canción: quedan en el título sin aviso.
const VERSIONES_ = ['simple', 'new', 'con subida', 'chorus', 'himno', 'en vivo', 'live', 'acustico', 'version corta'];
// Un paréntesis que no es intérprete conocido ni versión (p. ej. un nombre abreviado: "(Evan)") no se adivina:
// queda en el título y se marca en el registro de importación para que el admin complete el intérprete.

/** "Título (Intérprete) [Tono] (Versión).docx" → { titulo, tono, interprete } */
function nombreArchivo_(n, conocidos) {
  const base = n.replace(/\.docx$/i, '').trim(), m = /^(.*?)\s*\[([^\]]+)\]\s*(\(.*\))?\s*$/.exec(base);
  let titulo = m ? m[1].trim() + (m[3] ? ' ' + m[3].trim() : '') : base, interprete = '';
  const dudosos = [];
  const lista = INTERPRETES_.concat(conocidos || []).map(norm_);
  titulo = titulo.replace(/\s*\(([^()]+)\)/g, (all, x) => {
    if (!interprete && lista.indexOf(norm_(x)) >= 0) { interprete = x.trim(); return ''; }
    if (VERSIONES_.indexOf(norm_(x).trim()) < 0) dudosos.push(x.trim());
    return all;
  }).trim();
  return { titulo, tono: m ? m[2].trim() : '', interprete, dudosos };
}

// Apps Script corta cada ejecución a los 6 min: la importación avanza por tandas.
// El progreso queda en Datos/import-estado.json; los Word que no cambiaron no se vuelven a convertir.
const TANDA_MS = 4.5 * 60 * 1000;
// Subir cuando cambia Convertir.js o Tonos.js. Los Word sin cambios se reconvierten desde la copia de sus
// párrafos (Datos/import-parrafos.json, sin volver a bajarlos) y solo se reescriben las canciones cuyo resultado cambia.
const CONV_V = 10; // 10: "C/D - Eb" en el título son tres tonos
// Subir cuando cambia leerDocx_ (lo que se guarda de cada Word): descarta la copia de los párrafos.
const LECTOR_V = 1;

/** Párrafos sin runs vacíos y con los runs seguidos de igual negrita unidos (mismo texto y mismos anchos). */
function compactar_(ps) {
  return ps.map(p => {
    const runs = [];
    p.runs.forEach(r => { if (!r.text) return; const u = runs[runs.length - 1];
      if (u && !!u.bold === !!r.bold) u.text += r.text; else runs.push(r.bold ? { text: r.text, bold: true } : { text: r.text }); });
    return { runs };
  });
}

/** Canción a partir de los párrafos de un Word (convertirParrafos_ modifica los párrafos: se le pasa una copia). */
function cancionDe_(nombre, ps, id, cat, conocidos) {
  const { titulo, tono: tonoArchivo, interprete: intArchivo, dudosos } = nombreArchivo_(nombre, conocidos);
  const conv = convertirParrafos_(JSON.parse(JSON.stringify(ps)).map(p => ({ runs: p.runs.map(r => ({ text: r.text, bold: !!r.bold })) })));
  const c = cat[norm_(titulo)] || {};
  // BPM solo si está confirmado (confianza alta o sin columna de confianza)
  const bpm = c.bpm && (!c.confianza || c.confianza === 'alta') ? c.bpm : null;
  const song = { id, titulo: c.titulo || titulo, interprete: c.interprete || intArchivo || '', tono: conv.tono || tonoArchivo || c.tono,
                 lineas: conv.lineas, bpm, estado: c.estado || 'oficial', fuente: nombre };
  if (!song.lineas.length) throw new Error('El documento no tiene letra.');
  // Tono por parte, transiciones, puentes y Modulante (SPEC §6). song.tono pasa a ser el tono de inicio.
  const dudas = analizarTonos_(song, song.tono);
  if (!song.interprete && dudosos.length)
    dudas.push({ parte: 'Intérprete', motivo: 'Sin intérprete. ¿"(' + dudosos.join('), (') + ')" del nombre del archivo es el intérprete? Completalo como corrección.' });
  return { song, dudas, enPlanilla: !!c.titulo, idPlanilla: c.id, titulo };
}

function importarCanciones_(ig, desdeCero) {
  if (!ig.letrasId) throw apiError_('Falta configurar la carpeta "Letra y Acordes" de esta iglesia.', 'config');
  const t0 = Date.now(), datos = datos_(ig), dirCanciones = subcarpeta_(datos, 'canciones');
  const estado = desdeCero ? { archivos: {}, canciones: {} } : leerJson_(datos, 'import-estado.json', { archivos: {}, canciones: {} });
  let parrafos = desdeCero ? null : leerJson_(datos, 'import-parrafos.json', null);
  if (!parrafos || parrafos.lector !== LECTOR_V) parrafos = { lector: LECTOR_V, archivos: {} };
  let parrafosCambian = false, iguales = 0;
  // Una importación nueva (no la continuación de una por tandas) empieza la lista de canciones reescritas.
  if (!estado.enCurso) { Object.keys(estado.archivos).forEach(k => { delete estado.archivos[k].cambio; }); estado.enCurso = true; }
  const cat = catalogo_(ig);
  const conocidos = Object.keys(cat).map(k => cat[k].interprete).filter(x => x && x !== '-');
  const it = DriveApp.getFolderById(ig.letrasId).getFiles(), lista = [];
  while (it.hasNext()) lista.push(it.next());
  lista.sort((a, b) => a.getName().localeCompare(b.getName(), 'es'));

  let hechos = 0, pendientes = 0;
  for (const f of lista) {
    const fid = f.getId(), nombre = f.getName(), upd = f.getLastUpdated().getTime(), prev = estado.archivos[fid];
    const copia = parrafos.archivos[fid], conCopia = !!(copia && copia.upd === upd);
    // Ya convertido, sin cambios y con su copia de párrafos (o con error, que no se guarda copia): nada que hacer.
    if (prev && prev.upd === upd && prev.v === CONV_V && (conCopia || prev.error)) continue;
    if (Date.now() - t0 > TANDA_MS) { pendientes++; continue; }
    try {
      if (f.getMimeType() !== DOCX) throw new Error('No es un .docx (' + f.getMimeType() + ')');
      // Word sin cambios: desde la copia de sus párrafos. Nuevo o modificado: se baja y se lee.
      let ps;
      if (conCopia) ps = copia.ps;
      else { ps = compactar_(leerDocx_(f.getBlob())); parrafos.archivos[fid] = { upd, ps }; parrafosCambian = true; }
      // id estable: se conserva el de una importación anterior del mismo archivo
      let id = prev && prev.id;
      const r = cancionDe_(nombre, ps, id || 'x', cat, conocidos);
      if (!id) {
        id = r.idPlanilla || slug_(r.titulo);
        const usado = x => Object.keys(estado.archivos).some(k => k !== fid && estado.archivos[k].id === x);
        if (usado(id)) { let n = 2; while (usado(id + '-' + n)) n++; id = id + '-' + n; }
        r.song.id = id;
      }
      // Solo se reescribe si el resultado cambió.
      const cambio = JSON.stringify(estado.canciones[id]) !== JSON.stringify(r.song);
      if (cambio) escribirJson_(dirCanciones, id + '.json', r.song); else iguales++;
      estado.canciones[id] = r.song;
      estado.archivos[fid] = { upd, v: CONV_V, nombre, id, enPlanilla: r.enPlanilla, dudas: r.dudas, cambio };
    } catch (e) {
      estado.archivos[fid] = { upd, v: CONV_V, nombre, error: String(e && e.message || e) };
    }
    hechos++;
  }

  // Archivos que ya no están en la carpeta: se quitan del cancionero.
  const vivos = {}; lista.forEach(f => { vivos[f.getId()] = 1; });
  Object.keys(estado.archivos).forEach(k => { if (!vivos[k]) { const id = estado.archivos[k].id; if (id) delete estado.canciones[id]; delete estado.archivos[k]; } });
  Object.keys(parrafos.archivos).forEach(k => { if (!vivos[k]) { delete parrafos.archivos[k]; parrafosCambian = true; } });
  if (pendientes === 0) estado.enCurso = false;
  escribirJson_(datos, 'import-estado.json', estado);
  if (parrafosCambian) escribirJson_(datos, 'import-parrafos.json', parrafos);

  const A = Object.keys(estado.archivos).map(k => estado.archivos[k]);
  const ok = A.filter(a => a.id), fallidas = A.filter(a => a.error).map(a => ({ archivo: a.nombre, error: a.error }));
  const res = { completo: pendientes === 0, hechosEnEstaTanda: hechos, igualesEnEstaTanda: iguales, pendientes, total: lista.length, listos: lista.length - pendientes, importadas: ok.length, fallidas };
  if (res.completo) {
    // Correcciones del admin sobre la base (Datos/correcciones.json): se aplican después de cada importación.
    const corr = leerJson_(datos, 'correcciones.json', {});
    const canciones = ok.map(a => estado.canciones[a.id]).filter(Boolean).map(s => {
      if (!corr[s.id]) return s;
      const c = aplicarCorreccion_(s, corr[s.id]); escribirJson_(dirCanciones, s.id + '.json', c); return c;
    }).sort((x, y) => x.titulo.localeCompare(y.titulo, 'es'));
    const dudas = [].concat(...ok.filter(a => a.dudas && a.dudas.length && !corr[a.id]).map(a => a.dudas.map(d => Object.assign({ archivo: a.nombre, id: a.id }, d))));
    escribirJson_(datos, 'cancionero.json', canciones);
    const fecha = new Date().toISOString();
    const reescritas = ok.filter(a => a.cambio).map(a => a.id);
    escribirJson_(datos, 'import-log.json', { fecha, conv: CONV_V, reescritas, ok: ok.map(a => ({ archivo: a.nombre, id: a.id, enPlanilla: a.enPlanilla })), fallidas, dudas });
    res.reescritas = reescritas.length;
    res.dudas = dudas;
    registrarIglesia_(ig.rootId, { importado: fecha });
    cacheDel_(ck_(ig, 'cancionero')); cacheDel_(ck_(ig, 'registro'));
  }
  return res;
}

/** Para correr a mano desde el editor. Repetir hasta que diga "Importación completa". */
function importarPrueba() {
  const m = iglesias_(), root = Object.keys(m).find(k => m[k].prueba);
  if (!root) throw new Error('Primero corré crearIglesiaPrueba().');
  const r = importarCanciones_(iglesia_(root));
  if (!r.completo) {
    Logger.log('Tanda guardada: ' + r.hechosEnEstaTanda + ' archivos en esta ejecución, faltan ' + r.pendientes + '. Volvé a ejecutar importarPrueba.');
    return;
  }
  Logger.log('Importación completa. Canciones: ' + r.importadas + ' · Fallidas: ' + r.fallidas.length);
  r.fallidas.forEach(x => Logger.log('FALLÓ ' + x.archivo + ': ' + x.error));
  (r.dudas || []).forEach(x => Logger.log('REVISAR ' + x.archivo + ' · ' + x.parte + ': ' + x.motivo));
}

/** Admin: guarda (o borra, con null) la corrección de una canción y la aplica ya, sin reimportar. */
function corregirCancion_(ig, id, correccion) {
  const datos = datos_(ig), corr = leerJson_(datos, 'correcciones.json', {});
  const estado = leerJson_(datos, 'import-estado.json', { canciones: {} });
  const base = estado.canciones[id];
  if (!base) throw apiError_('No existe esa canción.', 'no-existe');
  if (correccion == null) delete corr[id];
  else {
    if (typeof correccion !== 'object' || JSON.stringify(correccion).length > 50000) throw apiError_('Corrección inválida.', 'formato');
    corr[id] = { modulante: correccion.modulante == null ? undefined : !!correccion.modulante, partes: correccion.partes || {},
                 titulo: correccion.titulo ? String(correccion.titulo).slice(0, 200) : undefined,
                 interprete: correccion.interprete ? String(correccion.interprete).slice(0, 200) : undefined };
  }
  escribirJson_(datos, 'correcciones.json', corr);
  const song = corr[id] ? aplicarCorreccion_(base, corr[id]) : base;
  escribirJson_(subcarpeta_(datos, 'canciones'), id + '.json', song);
  const todas = leerJson_(datos, 'cancionero.json', []).map(s => s.id === id ? song : s);
  escribirJson_(datos, 'cancionero.json', todas);
  cacheDel_(ck_(ig, 'cancionero'));
  return song;
}
