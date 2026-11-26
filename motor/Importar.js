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

function importarCanciones_(ig) {
  if (!ig.letrasId) throw apiError_('Falta configurar la carpeta "Letra y Acordes" de esta iglesia.', 'config');
  const datos = datos_(ig), dirCanciones = subcarpeta_(datos, 'canciones');
  const cat = catalogo_(ig), usados = {}, ok = [], fallidas = [], canciones = [];
  const files = DriveApp.getFolderById(ig.letrasId).getFiles(), lista = [];
  while (files.hasNext()) lista.push(files.next());
  lista.sort((a, b) => a.getName().localeCompare(b.getName(), 'es'));

  lista.forEach(f => {
    const nombre = f.getName();
    try {
      if (f.getMimeType() !== DOCX) { fallidas.push({ archivo: nombre, error: 'No es un .docx (' + f.getMimeType() + ')' }); return; }
      const { titulo, tono: tonoArchivo } = nombreArchivo_(nombre);
      const conv = convertirDocx_(f.getBlob());
      const c = cat[norm_(titulo)] || {};
      let id = c.id || slug_(titulo);
      if (usados[id]) { let n = 2; while (usados[id + '-' + n]) n++; id = id + '-' + n; }
      usados[id] = 1;
      // BPM solo si está confirmado (confianza alta o sin columna de confianza)
      const bpm = c.bpm && (!c.confianza || c.confianza === 'alta') ? c.bpm : null;
      const song = { id, titulo: c.titulo || titulo, interprete: c.interprete || '-', tono: conv.tono || tonoArchivo || c.tono,
                     lineas: conv.lineas, bpm, estado: c.estado || 'oficial', fuente: nombre };
      if (!song.lineas.length) throw new Error('El documento no tiene letra.');
      escribirJson_(dirCanciones, id + '.json', song);
      canciones.push(song);
      ok.push({ archivo: nombre, id, enPlanilla: !!c.titulo });
    } catch (e) { fallidas.push({ archivo: nombre, error: String(e && e.message || e) }); }
  });

  escribirJson_(datos, 'cancionero.json', canciones);
  const fecha = new Date().toISOString();
  escribirJson_(datos, 'import-log.json', { fecha, ok, fallidas });
  registrarIglesia_(ig.rootId, { importado: fecha });
  cacheDel_(ck_(ig, 'cancionero')); cacheDel_(ck_(ig, 'registro'));
  return { importadas: ok.length, fallidas };
}

/** Para correr a mano desde el editor: importa la iglesia de prueba (o la indicada). */
function importarPrueba() {
  const m = iglesias_(), root = Object.keys(m).find(k => m[k].prueba);
  if (!root) throw new Error('Primero corré crearIglesiaPrueba().');
  const r = importarCanciones_(iglesia_(root));
  Logger.log('Importadas: ' + r.importadas);
  r.fallidas.forEach(x => Logger.log('FALLÓ ' + x.archivo + ': ' + x.error));
}
