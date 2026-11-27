// Tono por parte, transiciones, acordes puente y Modulante (SPEC §5–§7).
// Sin APIs de Apps Script: se puede probar con Node (ver motor/test-tonos.js).

const NOTA_PC_ = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const NOMBRE_MAY_ = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
const NOMBRE_MEN_ = ['Cm', 'C#m', 'Dm', 'Ebm', 'Em', 'Fm', 'F#m', 'Gm', 'G#m', 'Am', 'Bbm', 'Bm'];
const TONO_RE_ = /^([A-G])([#b]?)(m?)$/;

/** "F#" → { pc: 6, menor: false }; null si no es un tono. */
function tonoPc_(t) {
  const m = TONO_RE_.exec(String(t || '').trim());
  if (!m) return null;
  return { pc: (NOTA_PC_[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + 12) % 12, menor: m[3] === 'm' };
}
/** Transporta un tono n semitonos (nombres habituales: Bb, Eb, F#…). */
function tonoMas_(t, n) {
  const k = tonoPc_(t); if (!k) return t;
  const pc = ((k.pc + n) % 12 + 12) % 12;
  return k.menor ? NOMBRE_MEN_[pc] : NOMBRE_MAY_[pc];
}
/** Semitonos de a → b, en el rango −6..+5 (la subida o bajada más corta). */
function intervalo_(a, b) {
  const x = tonoPc_(a), y = tonoPc_(b); if (!x || !y) return 0;
  let d = ((y.pc - x.pc) % 12 + 12) % 12; if (d > 5) d -= 12; return d;
}
/** "G-Ab-A-Bb-C" / "F# - A" / "G" → ['G','Ab','A','Bb','C'] (solo si todo son tonos). */
function secuenciaTitulo_(s) {
  const toks = String(s || '').split(/\s*[-–,→]\s*|\s+/).filter(Boolean);
  return toks.length && toks.every(t => TONO_RE_.test(t)) ? toks : [];
}
/** Quita tonos consecutivos iguales: G,Ab,Ab,A → G,Ab,A. */
function sinRepetidos_(a) { return a.filter((t, i) => t && (i === 0 || t !== a[i - 1])); }

// ---------- Bloques (igual que blocksOf de js/songs.js) ----------
function bloques_(lineas) {
  const B = []; let cur = { label: '', sec: null, lines: [] };
  lineas.forEach(l => {
    if (l.t === 'sec') { if (cur.label || cur.lines.some(x => x.t !== 'blank')) B.push(cur); cur = { label: l.v, sec: l, lines: [] }; }
    else cur.lines.push(l);
  });
  B.push(cur);
  B.forEach((b, i) => { b.id = i; b.has = b.lines.some(x => x.t !== 'blank'); b.base = baseLabel_(b.label).toLowerCase(); });
  B.forEach(b => {
    if (b.has) return;
    const m = B.find(o => o.has && o.id < b.id && o.base === b.base) || B.find(o => o.has && o.id < b.id && o.base.split(' ')[0] === b.base.split(' ')[0]);
    b.ref = m ? m.id : null;
  });
  return B;
}
const baseLabel_ = l => String(l || '').replace(/\s*[x×]\s*\d+\s*$/i, '').trim();
const repLabel_ = l => { const m = /[x×]\s*(\d+)\s*$/i.exec(l || ''); return m ? +m[1] : 1; };
/** Arreglo por defecto (igual que defArr de js/songs.js). */
function arrBase_(song) { return bloques_(song.lineas).map(b => ({ src: b.has ? b.id : b.ref, label: b.label, rep: repLabel_(b.label) })); }

// ---------- Acordes ----------
const ACORDE_RE_ = /^\(?([A-G])([#b]?)((?:maj|min|m|sus|add|dim|aug|M|º|°)?)[^/()]*?(?:\/[A-G][#b]?)?\)?[,.]?$/;
const textoAcordes_ = l => l.t === 'pair' ? l.segs.map(s => s[0]).filter(Boolean).join(' ') : (l.t === 'ch' || l.t === 'mix') ? String(l.v) : '';
// [ ] (puente para modular) y { } (cierre para repetir) no cuentan para decidir el tono de la parte.
const sinGrupos_ = t => t.replace(/\[[^\]]*\]|\{[^}]*\}/g, ' ');
function acordesDe_(l) {
  const toks = sinGrupos_(textoAcordes_(l)).split(/[\s\-–|]+/).filter(Boolean);
  const out = [];
  toks.forEach(tok => String(tok).split('-').forEach(c => {
    const m = ACORDE_RE_.exec(c.trim()); if (!m) return;
    const q = m[3];
    out.push({ pc: (NOTA_PC_[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + 12) % 12,
               cal: /dim|º|°/.test(q) ? 'dim' : (q === 'm' || q === 'min') ? 'm' : 'M', paren: /^\(|\)$/.test(c.trim()) });
  }));
  return out;
}
/** Puntaje de un tono para un conjunto de acordes (escala mayor; los menores se miden por su relativo mayor). */
function puntaje_(acordes, tono) {
  const k = tonoPc_(tono); if (!k || !acordes.length) return 0;
  const t = k.menor ? (k.pc + 3) % 12 : k.pc;
  const DIAT = { 0: 'M', 2: 'm', 4: 'm', 5: 'M', 7: 'M', 9: 'm', 11: 'dim' };
  let p = 0;
  acordes.forEach(a => {
    const g = ((a.pc - t) % 12 + 12) % 12;
    if (DIAT[g] === a.cal) p += 1;
    else if (g in DIAT) p += 0.5;
    else if (g === 10 || (g === 2 && a.cal === 'M') || (g === 4 && a.cal === 'M') || (g === 9 && a.cal === 'M')) p += 0.25; // bVII y dominantes secundarias
    else p -= 1;
  });
  const tonica = k.menor ? (k.pc) : t;
  if (acordes[0].pc === tonica) p += 1;
  if (acordes[acordes.length - 1].pc === tonica) p += 1;
  return p;
}

const PISTA_RE_ = /\((?:sube|baja|pasa|modula)\s+a\s+([A-G][#b]?m?)\)/i;
const TRANS_RE_ = /\b(?:inter(?:ludio)?|puente|transici[oó]n|modulaci[oó]n|pasaje)\b.*?\b(?:subir|bajar|ir|pasar|volver)\s+a\s+([A-G][#b]?m?)\b/i;

/**
 * Analiza una canción ya convertida y le agrega:
 *  - en cada línea `sec`: tono (escrito), y transicion/destino si es una parte de transición;
 *  - en la última línea con acordes de una parte: puente = true si termina con acordes entre paréntesis;
 *  - en la canción: tono (inicio), tonos (secuencia sin repetidos), modulante.
 * Devuelve la lista de dudas [{ parte, tono, alternativa, motivo }].
 */
function analizarTonos_(song, tonoCrudo) {
  const seq = secuenciaTitulo_(tonoCrudo);
  const tonoInicio = seq[0] || String(tonoCrudo || '').trim();
  const B = bloques_(song.lineas), dudas = [];
  const pistas = [];
  B.forEach(b => b.lines.forEach(l => { const m = PISTA_RE_.exec(l.v || ''); if (m) pistas.push(m[1]); }));
  const cand = [...new Set(seq.concat(pistas))];
  if (!cand.length && tonoPc_(tonoInicio)) cand.push(tonoInicio);

  // Regla (SPEC §6): solo cuenta como modulación un cambio de centro tonal sostenido (una parte entera en
  // otro tono). Los acordes prestados o de color (Gadd6, E7(#9), D/E como E2…) no cambian el tono.
  // Orden de prioridad: transición → "(Sube a X)" → "(SUBE)" antes del título (siguiente tono de la
  // secuencia del título) → análisis de acordes, que solo cambia de tono con evidencia fuerte.
  let prev = tonoInicio, iSeq = 0;
  const sigDeSeq = (t, dir) => {
    // Siguiente tono de la secuencia del título a partir de la posición actual, en la dirección pedida.
    for (let k = iSeq + 1; k < seq.length; k++) { const d = intervalo_(t, seq[k]); if (seq[k] !== t && (dir > 0 ? d > 0 : d < 0)) return { t: seq[k], k }; }
    return null;
  };
  B.forEach(b => {
    const ac = [].concat(...b.lines.map(acordesDe_)).filter(a => !a.paren);
    const pista = b.lines.map(l => PISTA_RE_.exec(l.v || '')).find(Boolean);
    const tr = TRANS_RE_.exec(b.label);
    const mod = b.sec && b.sec.mod;                      // "(SUBE)" / "(BAJA)" delante del título
    let tono = prev;
    if (tr) {
      b.transicion = true; b.destino = tr[1]; tono = tr[1];
    } else if (pista) {
      tono = pista[1];
    } else if (mod) {
      const dir = /baja/i.test(mod) ? -1 : 1, sig = seq.length > 1 ? sigDeSeq(prev, dir) : null;
      if (sig) tono = sig.t;
      else {
        // Sin secuencia en el título: el tono más probable en esa dirección.
        const P = [1, 2, 3].map(n => tonoMas_(prev, dir * n)).map(t => ({ t, p: puntaje_(ac, t) })).sort((x, y) => y.p - x.p);
        tono = P.length && ac.length ? P[0].t : tonoMas_(prev, dir);
        dudas.push({ parte: b.label, tono, alternativa: null, motivo: 'dice "' + mod + '" pero el título no tiene la secuencia de tonos' });
      }
    } else if (b.has && ac.length >= 3 && cand.length > 1) {
      const P = cand.map(t => ({ t, p: puntaje_(ac, t) })).sort((x, y) => y.p - x.p);
      const pPrev = (P.find(x => x.t === prev) || { p: -Infinity }).p, mejor = P[0];
      const encaja = mejor.p >= ac.length * 0.6;
      if (mejor.t !== prev && mejor.p - pPrev >= 2 && encaja) tono = mejor.t;
      else if (mejor.t !== prev && mejor.p - pPrev >= 1 && encaja) dudas.push({ parte: b.label || '(inicio)', tono: prev, alternativa: mejor.t, motivo: 'la parte podría estar en otro tono' });
    }
    b.tono = tono;
    const k = seq.indexOf(tono, iSeq); if (k >= 0) iSeq = k;
    prev = tono;
  });

  // Acordes puente: acordes entre paréntesis al final de una parte que no es la última.
  B.forEach((b, i) => {
    if (i === B.length - 1 || b.transicion) return;
    const ult = [...b.lines].reverse().find(l => l.t === 'pair' || l.t === 'ch');
    if (!ult) return;
    const fin = sinGrupos_(textoAcordes_(ult)).trim();
    if (/\)\s*$/.test(fin) && /\(/.test(fin)) ult.puente = true;
  });
  // [ ] al final = acordes para modular (se muestran si la parte siguiente cambia de tono);
  // { } al final = cierre para repetir en el mismo tono (se muestran si la siguiente queda igual). SPEC §6.
  song.lineas.forEach(l => {
    const t = textoAcordes_(l);
    if (/\[[^\]]*\]/.test(t)) l.modula = true; else delete l.modula;
    if (/\{[^}]*\}/.test(t)) l.repite = true; else delete l.repite;
  });

  B.forEach(b => {
    if (!b.sec) return;
    b.sec.tono = b.tono;
    if (b.transicion) { b.sec.transicion = true; b.sec.destino = b.destino; } else { delete b.sec.transicion; delete b.sec.destino; }
  });
  completarTonos_(song, B, tonoInicio);
  // El título puede listar la secuencia (G-Ab-A-Bb-C) o solo los tonos usados (F# - A): se comparan en orden de aparición.
  const unicos = a => a.filter((t, i) => a.indexOf(t) === i);
  if (seq.length > 1 && unicos(seq).join() !== unicos(song.tonos).join()) {
    const conTitulo = B.filter(b => b.has && b.sec).length;
    dudas.push({ parte: '(canción)', tono: song.tonos.join('→'), alternativa: seq.join('→'),
      motivo: conTitulo < 2 ? 'el Word no tiene títulos de sección ([Coro], [Verso]…): no se puede asignar un tono a cada parte'
                            : 'la secuencia detectada no coincide con la del título' });
  }
  return dudas;
}

/** Recalcula tono/tonos/modulante a partir de las marcas de las líneas `sec`. */
function completarTonos_(song, B, tonoInicio) {
  B = B || bloques_(song.lineas);
  const primero = B.find(b => b.has && b.sec && b.sec.tono && !b.sec.transicion);
  const inicio = (B[0] && !B[0].sec ? tonoInicio : null) || (primero && primero.sec.tono) || tonoInicio || song.tono;
  const t = [];
  B.forEach(b => { if (b.has && !(b.sec && b.sec.transicion)) t.push(b.sec && b.sec.tono || inicio); });
  song.tonos = sinRepetidos_(t.length ? t : [inicio]);
  song.tono = song.tonos[0] || inicio;
  if (song.modulanteManual == null) song.modulante = new Set(song.tonos).size > 1;
  else song.modulante = !!song.modulanteManual;
  return song;
}

// ---------- Correcciones del admin (Datos/correcciones.json) ----------
// { "<id canción>": { modulante?: bool, partes?: { "<n° de bloque>": { tono?, transicion?, destino?, lineas? } } } }
function aplicarCorreccion_(song, c) {
  if (!c) return song;
  const s = JSON.parse(JSON.stringify(song)), B = bloques_(s.lineas);
  Object.keys(c.partes || {}).forEach(k => {
    const b = B[+k], x = c.partes[k]; if (!b || !x) return;
    if (b.sec) {
      if (x.tono) b.sec.tono = x.tono;
      if (x.transicion === true) { b.sec.transicion = true; b.sec.destino = x.destino || b.sec.destino || b.sec.tono; }
      if (x.transicion === false) { delete b.sec.transicion; delete b.sec.destino; }
    }
    if (Array.isArray(x.lineas)) {
      // Reemplaza las líneas de ese bloque (p. ej. acordes de una transición escritos a mano).
      const ini = b.sec ? s.lineas.indexOf(b.sec) + 1 : 0, fin = ini + b.lines.length;
      s.lineas.splice(ini, fin - ini, ...x.lineas);
    }
  });
  if (c.modulante != null) s.modulanteManual = !!c.modulante;
  // Datos de la canción corregidos por el admin (p. ej. intérprete que venía abreviado en el nombre del archivo).
  if (c.titulo) s.titulo = c.titulo;
  if (c.interprete) s.interprete = c.interprete;
  completarTonos_(s, null, s.tono);
  s.corregida = true;
  return s;
}

// ---------- Tonos tocados en un ítem de reunión ----------
/**
 * Secuencia de tonos tocados por canción en un ítem (canción o medley), sin repetidos consecutivos.
 * songs: { id → canción }. Devuelve [{ id, quien, tonos: [...] }].
 */
function tonosTocados_(item, songs) {
  const medley = item.tipo === 'medley';
  const ids = medley ? (item.canciones || []).map(c => c.id) : [item.id];
  const quienDe = id => medley ? ((item.canciones.find(c => c.id === id) || {}).quien || item.quien) : item.quien;
  const s0 = songs[ids[0]];
  const modul = medley || (item.modulante != null ? !!item.modulante : !!(s0 && s0.modulante));
  if (!modul) return [{ id: item.id, quien: item.quien, tonos: [item.tono || (s0 && s0.tono) || ''] }];

  const bloquesDe = {}; ids.forEach(id => { if (songs[id]) bloquesDe[id] = bloques_(songs[id].lineas); });
  let arr = item.arr && item.arr.length ? item.arr : [];
  if (!arr.length) arr = medley ? [].concat(...ids.map(id => (bloquesDe[id] || []).map(b => ({ cancion: id, src: b.id }))))
                                : (bloquesDe[item.id] || []).map(b => ({ src: b.id }));
  const porCancion = {}; ids.forEach(id => { porCancion[id] = []; });
  let tocado = null, escrito = null, cancionAnt = null;
  arr.forEach((p, i) => {
    const id = medley ? p.cancion : item.id;
    const b = p.src != null && bloquesDe[id] ? bloquesDe[id][p.src] : null;
    const esc = b && b.sec && b.sec.tono || (songs[id] && songs[id].tono) || null;
    if (b && b.sec && b.sec.transicion) return;          // las transiciones no cuentan en la secuencia
    let t;
    if (p.tono) t = p.tono;
    else if (tocado == null) t = item.tono || esc;
    else if (id === cancionAnt && esc && escrito) t = tonoMas_(tocado, intervalo_(escrito, esc));
    else t = tocado;                                     // parte nueva o cambio de canción del medley
    tocado = t; if (esc) escrito = esc; cancionAnt = id;
    if (porCancion[id]) porCancion[id].push(t);
  });
  return ids.map(id => ({ id, quien: quienDe(id), tonos: sinRepetidos_(porCancion[id] || []) }))
            .map(x => x.tonos.length ? x : Object.assign(x, { tonos: [item.tono || ''] }));
}
