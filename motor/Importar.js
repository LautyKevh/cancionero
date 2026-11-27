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

/** "Título [Tono].docx" → { titulo, tono } */
function nombreArchivo_(n) {
  const base = n.replace(/\.docx$/i, ''), m = /^(.*?)\s*\[([^\]]+)\]\s*$/.exec(base);
  return m ? { titulo: m[1].trim(), tono: m[2].trim() } : { titulo: base.trim(), tono: '' };
}

// Apps Script corta cada ejecución a los 6 min: la importación avanza por tandas.
// El progreso queda en Datos/import-estado.json; los Word que no cambiaron no se vuelven a convertir.
const TANDA_MS = 4.5 * 60 * 1000;
const CONV_V = 2;   // subir cuando cambia Convertir.js: fuerza a reconvertir todo

function importarCanciones_(ig, desdeCero) {
  if (!ig.letrasId) throw apiError_('Falta configurar la carpeta "Letra y Acordes" de esta iglesia.', 'config');
  const t0 = Date.now(), datos = datos_(ig), dirCanciones = subcarpeta_(datos, 'canciones');
  const estado = desdeCero ? { archivos: {}, canciones: {} } : leerJson_(datos, 'import-estado.json', { archivos: {}, canciones: {} });
  const cat = catalogo_(ig);
  const it = DriveApp.getFolderById(ig.letrasId).getFiles(), lista = [];
  while (it.hasNext()) lista.push(it.next());
  lista.sort((a, b) => a.getName().localeCompare(b.getName(), 'es'));

  let hechos = 0, pendientes = 0;
  for (const f of lista) {
    const fid = f.getId(), nombre = f.getName(), upd = f.getLastUpdated().getTime(), prev = estado.archivos[fid];
    if (prev && prev.upd === upd && prev.v === CONV_V) continue;                // ya convertido y sin cambios
    if (Date.now() - t0 > TANDA_MS) { pendientes++; continue; }
    try {
      if (f.getMimeType() !== DOCX) throw new Error('No es un .docx (' + f.getMimeType() + ')');
      const { titulo, tono: tonoArchivo } = nombreArchivo_(nombre);
      const conv = convertirDocx_(f.getBlob());
      const c = cat[norm_(titulo)] || {};
      // id estable: se conserva el de una importación anterior del mismo archivo
      let id = prev && prev.id;
      if (!id) {
        id = c.id || slug_(titulo);
        const usado = x => Object.keys(estado.archivos).some(k => k !== fid && estado.archivos[k].id === x);
        if (usado(id)) { let n = 2; while (usado(id + '-' + n)) n++; id = id + '-' + n; }
      }
      // BPM solo si está confirmado (confianza alta o sin columna de confianza)
      const bpm = c.bpm && (!c.confianza || c.confianza === 'alta') ? c.bpm : null;
      const song = { id, titulo: c.titulo || titulo, interprete: c.interprete || '-', tono: conv.tono || tonoArchivo || c.tono,
                     lineas: conv.lineas, bpm, estado: c.estado || 'oficial', fuente: nombre };
      if (!song.lineas.length) throw new Error('El documento no tiene letra.');
      escribirJson_(dirCanciones, id + '.json', song);
      estado.canciones[id] = song;
      estado.archivos[fid] = { upd, v: CONV_V, nombre, id, enPlanilla: !!c.titulo };
    } catch (e) {
      estado.archivos[fid] = { upd, v: CONV_V, nombre, error: String(e && e.message || e) };
    }
    hechos++;
  }

  // Archivos que ya no están en la carpeta: se quitan del cancionero.
  const vivos = {}; lista.forEach(f => { vivos[f.getId()] = 1; });
  Object.keys(estado.archivos).forEach(k => { if (!vivos[k]) { const id = estado.archivos[k].id; if (id) delete estado.canciones[id]; delete estado.archivos[k]; } });
  escribirJson_(datos, 'import-estado.json', estado);

  const A = Object.keys(estado.archivos).map(k => estado.archivos[k]);
  const ok = A.filter(a => a.id), fallidas = A.filter(a => a.error).map(a => ({ archivo: a.nombre, error: a.error }));
  const res = { completo: pendientes === 0, hechosEnEstaTanda: hechos, pendientes, importadas: ok.length, fallidas };
  if (res.completo) {
    const canciones = ok.map(a => estado.canciones[a.id]).filter(Boolean).sort((x, y) => x.titulo.localeCompare(y.titulo, 'es'));
    escribirJson_(datos, 'cancionero.json', canciones);
    const fecha = new Date().toISOString();
    escribirJson_(datos, 'import-log.json', { fecha, ok: ok.map(a => ({ archivo: a.nombre, id: a.id, enPlanilla: a.enPlanilla })), fallidas });
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
}
