// Web App: API JSON del cancionero.
//
// GET  ?iglesia=<rootId>&a=<acción>   (no usar "c": Apps Script lo reserva y responde 400)[&id=...]
//   a=info        → { nombre, version, actualizado }
//   a=canciones   → Song[] (cancionero completo, con letra)
//   a=cancion     → Song (id)
//   a=historial   → [{f,id,t,q,o}]  (pestaña Registro)
//   a=personas    → string[]
//   a=reuniones   → Reunion[] (sin clave)
//
// POST body (text/plain con JSON, evita el preflight de CORS): { iglesia, a, ... }
//   a=crearReunion   { nombre, fecha, director, clave }
//   a=verificarClave { id, clave }
//   a=editarReunion  { id, clave, cambios: { nombre?, fecha?, director?, canciones? } }
//   a=borrarReunion  { id, clave }                       (borrado lógico)
//   a=registrarUso   { id, clave }                       (agrega filas a Registro, una sola vez; también se hace solo al día siguiente de la reunión)
//   a=editarAcordes  { id, item, parte, lineas|null, quien } (sin clave; músicos; null = volver a la base)
//   a=elegirVariante { id, item, parte, src, label }          (sin clave ni nombre; músicos; otra variante de la parte)
//   a=importar       { idToken }                         (admin)
//   a=corregir       { idToken, cancion, correccion|null } (admin; Datos/correcciones.json)
//
// Respuesta: { ok: true, data } | { ok: false, error, code }

function apiError_(msg, code) { const e = new Error(msg); e.api = true; e.code = code || 'error'; return e; }
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function responder_(fn) {
  try { return json_({ ok: true, data: fn() }); }
  catch (e) {
    if (!e.api) console.error(e && e.stack || e);
    return json_({ ok: false, error: e.api ? e.message : 'Error interno del motor.', code: e.code || 'interno' });
  }
}

function doGet(e) {
  const p = (e && e.parameter) || {};
  return responder_(() => {
    const ig = iglesia_(p.iglesia);
    switch (p.a) {
      case 'info': return { nombre: ig.nombre, version: ig.version || '1', prueba: !!ig.prueba, actualizado: ig.importado || null };
      case 'canciones': return cancionero_(ig);
      case 'cancion': { const s = cancionero_(ig).find(x => x.id === p.id); if (!s) throw apiError_('No existe esa canción.', 'no-existe'); return s; }
      case 'historial': anotarPasadas_(ig); return registro_(ig);
      case 'personas': return personas_(ig);
      case 'reuniones': anotarPasadas_(ig); return reuniones_(ig);
      default: throw apiError_('Acción desconocida.', 'accion');
    }
  });
}

function doPost(e) {
  return responder_(() => {
    let b; try { b = JSON.parse(e.postData.contents); } catch (x) { throw apiError_('Pedido inválido.', 'formato'); }
    const ig = iglesia_(b.iglesia);
    const buscar = () => {
      const r = reunionesTodas_(ig).find(x => x.id === b.id && !x.borrada);
      if (!r) throw apiError_('La reunión ya no existe.', 'no-existe');
      return r;
    };
    switch (b.a) {
      case 'crearReunion': return conLock_(() => {
        const fecha = String(b.fecha || ''), nombre = String(b.nombre || '').trim(), director = String(b.director || '').trim();
        if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) throw apiError_('Fecha inválida.', 'formato');
        if (!nombre) throw apiError_('Escribí un nombre para la reunión.', 'formato');
        const r = { id: 'r' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), nombre, fecha, director,
                    clave: nuevaClave_(b.clave), canciones: [] };
        guardarReunion_(ig, r); agregarPersonas_(ig, [director]);
        return publica_(r);
      });
      case 'verificarClave': { const r = buscar(); verificarPin_(ig, r, b.clave); return true; }
      case 'editarReunion': return conLock_(() => {
        const r = buscar(); verificarPin_(ig, r, b.clave);
        const c = b.cambios || {};
        if (c.nombre != null) r.nombre = String(c.nombre).trim() || r.nombre;
        if (c.fecha != null && /^\d{4}-\d{2}-\d{2}$/.test(c.fecha)) r.fecha = c.fecha;
        if (c.director != null) r.director = String(c.director).trim();
        if (Array.isArray(c.canciones)) { const prev = partesPorPid_(r), pids = {}; r.canciones = c.canciones.map(x => limpiarItem_(x, prev, pids)); }
        guardarReunion_(ig, r);
        agregarPersonas_(ig, [r.director].concat(itemsPlanos_(ig, r).map(x => x.quien)));
        return publica_(r);
      });
      // Músicos, sin clave: acordes de una parte del arreglo (SPEC §7 "Arreglo compartido").
      case 'editarAcordes': return conLock_(() => {
        const r = buscar();
        return editarAcordes_(ig, r, String(b.item || ''), String(b.parte || ''), b.lineas == null ? null : b.lineas, b.quien);
      });
      case 'elegirVariante': return conLock_(() => {
        const r = buscar();
        return elegirVariante_(ig, r, String(b.item || ''), String(b.parte || ''), b.src, b.label);
      });
      // Admin: corrección de la canción base → Datos/correcciones.json (SPEC §5).
      case 'corregir': verificarAdmin_(ig, b.idToken); return conLock_(() => corregirCancion_(ig, String(b.cancion || ''), b.correccion));
      case 'borrarReunion': return conLock_(() => { const r = buscar(); verificarPin_(ig, r, b.clave); r.borrada = true; guardarReunion_(ig, r); return true; });
      case 'registrarUso': return conLock_(() => {
        const r = buscar(); verificarPin_(ig, r, b.clave);
        if (r.registrada) return 0;
        const n = registrarUso_(ig, r); r.registrada = true; guardarReunion_(ig, r); return n;
      });
      case 'importar': {
        verificarAdmin_(ig, b.idToken);
        // Sin el lock general (la tanda dura ~4,5 min y bloquearía las reuniones): marca propia por iglesia.
        const cache = CacheService.getScriptCache(), k = 'importando:' + ig.rootId;
        if (cache.get(k)) throw apiError_('Ya hay una importación en curso. Esperá unos minutos.', 'ocupado');
        cache.put(k, '1', 360);
        try { return importarCanciones_(ig); } finally { cache.remove(k); }
      }
      default: throw apiError_('Acción desconocida.', 'accion');
    }
  });
}
