// Lógica de canciones: bloques, arreglos, búsqueda e historial. Sin DOM.

export const norm = t => String(t || '').toLowerCase().normalize('NFD')
  .replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9ñ ]/g, ' ').replace(/\s+/g, ' ').trim();

const lineText = l => l.t === 'pair' ? l.segs.map(x => x[1]).join('') : (l.t === 'ly' ? l.v : '');

/** Agrega índices de búsqueda a cada canción (no modifica la estructura original). */
export function prepare(songs) {
  songs.forEach(s => {
    s._lines = s.lineas.map(lineText).map(x => x.replace(/\s+/g, ' ').trim()).filter(Boolean);
    s._idx = norm(s.titulo + ' ' + s.interprete);
    s._ly = norm(s._lines.join(' '));
  });
  return songs;
}

export const base = l => String(l || '').replace(/\s*[x×]\s*\d+\s*$/i, '').trim();
export const repOf = l => { const m = /[x×]\s*(\d+)\s*$/i.exec(l || ''); return m ? +m[1] : 1; };
export const rOf = e => e.rep ?? repOf(e.label);
export const labOf = e => e.label == null ? '' : (base(e.label) + (rOf(e) > 1 ? ' x' + rOf(e) : ''));

/** Bloques: desde un [Título] hasta el siguiente. Los títulos vacíos referencian al primero con igual nombre base. */
export function blocksOf(s) {
  if (s._b) return s._b;
  const B = []; let cur = { label: '', lines: [] };
  s.lineas.forEach(l => {
    if (l.t === 'sec') { if (cur.label || cur.lines.some(x => x.t !== 'blank')) B.push(cur); cur = { label: l.v, sec: l, lines: [] }; }
    else cur.lines.push(l);
  });
  B.push(cur);
  B.forEach((b, i) => { b.id = i; b.has = b.lines.some(x => x.t !== 'blank'); b.base = base(b.label).toLowerCase(); });
  B.forEach(b => {
    if (b.has) return;
    const m = B.find(o => o.has && o.id < b.id && o.base === b.base)
      || B.find(o => o.has && o.id < b.id && o.base.split(' ')[0] === b.base.split(' ')[0]);
    b.ref = m ? m.id : null;
  });
  return (s._b = B);
}

/**
 * Variantes de una parte: bloques de la canción con la misma letra y distintos acordes (ej. Coro, Coro 1, Coro 2).
 * Devuelve los bloques (uno por cada juego de acordes distinto, empezando por el de `src`); [] si no tiene variantes.
 */
export function variantesDe(s, src) {
  // Acordes de una línea para comparar: sin los grupos [ ] / { } ni el puente final "(Eb)" (dependen del tono
  // de la parte siguiente), sin paréntesis de paso "(C - G)" ni separadores.
  const acordes = (txt, puente) => {
    let t = String(txt).replace(/\[[^\]]*\]|\{[^}]*\}/g, ' ');
    if (puente) t = t.replace(/\([^()]*\)?\s*$/, ' ');
    return t.replace(/[()|/]\s*(?=\s|$)|[()]/g, ' ').split(/[\s\-–]+/).filter(x => /^[A-G]/.test(x)).join(' ');
  };
  const B = blocksOf(s), huella = b => {
    let ly = '', ch = '';
    b.lines.forEach(l => {
      if (l.t === 'pair') { ly += l.segs.map(x => x[1]).join(''); ch += ' ' + acordes(l.segs.map(x => x[0]).filter(Boolean).join(' '), l.puente); }
      else if (l.t === 'ly') { if (!SUBA.test(l.v.trim())) ly += ' ' + l.v; }
      else if (l.t === 'ch' || l.t === 'mix') ch += ' ' + acordes(l.v, l.puente);
    });
    return { ly: norm(ly).replace(/[^a-z]/g, ''), ch: ch.replace(/\s+/g, ' ').trim() };
  };
  if (!s._var) s._var = B.map(b => b.has ? huella(b) : null);
  const H = s._var, h = H[src];
  if (!h || !h.ly) return [];
  // Los mismos acordes en otro tono no son una variante: es la parte repetida después de modular.
  const PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const ac = t => { const m = /^([A-G])([#b]?)(.*)$/.exec(t); return m ? [(PC[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? 11 : 0)) % 12, m[3].replace(/\/([A-G])([#b]?)/, '/')] : null; };
  const transporte = (a, b) => {
    const A = a.split(' ').map(ac), Z = b.split(' ').map(ac);
    if (!a || A.length !== Z.length || A.some(x => !x) || Z.some(x => !x)) return false;
    const d = (Z[0][0] - A[0][0] + 12) % 12;
    return d !== 0 && A.every((x, i) => x[1] === Z[i][1] && (Z[i][0] - x[0] + 12) % 12 === d);
  };
  const out = [B[src]], vistos = new Set([h.ch]);
  B.forEach((b, k) => { const x = H[k]; if (x && x.ly === h.ly && !vistos.has(x.ch) && !out.some(o => transporte(H[o.id].ch, x.ch))) { vistos.add(x.ch); out.push(b); } });
  return out.length > 1 ? out : [];
}

// "(Sube a A)" / "(Baja a F#)": indicación de cambio de tono (la vista la reemplaza por el indicador).
export const SUBA = /^\(?\s*(sube|baja|subida|bajada)\s+(?:a|al)\s+([A-G][#b]?m?)\s*\)?\.?$/i;
const soloIndicacion = b => { const r = b.lines.filter(l => l.t !== 'blank'); return r.length > 0 && r.every(l => l.t === 'ly' && SUBA.test(l.v.trim())); };
/**
 * Bloque cuya letra y acordes se muestran para el bloque `id`. Un bloque que solo trae "(Sube/Baja a X)"
 * repite el bloque anterior con el mismo nombre (en el tono nuevo); los demás se muestran a sí mismos.
 */
export function contenidoDe(s, id) {
  const B = blocksOf(s), b = B[id];
  if (!b || !soloIndicacion(b)) return b;
  for (let k = b.id - 1; k >= 0; k--) if (B[k].base === b.base && B[k].has && !soloIndicacion(B[k])) return B[k];
  return b;
}

export const defArr = s => blocksOf(s).map(b => ({ src: b.has ? b.id : b.ref, label: b.label, rep: repOf(b.label) }));
/** Mismas partes, en el mismo orden y con las mismas repeticiones que el Word (sin mirar tonos ni acordes editados). */
export const mismoOrden = (s, arr) => JSON.stringify((arr || []).map(e => ({ src: e.nueva ? null : e.src, label: e.label, rep: e.rep }))) === JSON.stringify(defArr(s));
export const isDefArr = (s, arr) => mismoOrden(s, arr) && !(arr || []).some(e => e.tono || e.nueva || e.lineas);

/** Líneas a mostrar según el arreglo. En modo músico los bloques repetidos se muestran solo con su título. */
export function arrLines(s, arr, musician) {
  const B = blocksOf(s), seen = new Set(), out = [];
  arr.forEach(e => {
    const L = labOf(e), sec = B[e.src] && B[e.src].sec;
    if (L) out.push({ t: 'sec', v: L, mod: sec && sec.mod, tono: sec && sec.tono });
    if (e.src == null || !B[e.src]) return;
    if (musician && seen.has(e.src)) return;
    seen.add(e.src); B[e.src].lines.forEach(l => out.push(l));
  });
  return out;
}

export const blockText = b => b ? b.lines.map(lineText).map(x => x.replace(/\s+/g, ' ').trim()).filter(Boolean) : [];

// ---------- Historial ----------

export const todayISO = () => { const t = new Date(); return isoOf(t); };
export const isoOf = t => t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0');
/** ISO (AAAA-MM-DD) → DD-MM-AAAA */
export const fmt = f => f ? f.split('-').reverse().join('-') : '';

// ---------- Tonos tocados (igual que tonosTocados_ de motor/Tonos.js) ----------
const PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const MAY = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'], MEN = ['Cm', 'C#m', 'Dm', 'Ebm', 'Em', 'Fm', 'F#m', 'Gm', 'G#m', 'Am', 'Bbm', 'Bm'];
const tpc = t => { const m = /^([A-G])([#b]?)(m?)$/.exec(String(t || '').trim()); return m ? { pc: (PC[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + 12) % 12, m: !!m[3] } : null; };
const tmas = (t, n) => { const k = tpc(t); if (!k) return t; const pc = ((k.pc + n) % 12 + 12) % 12; return k.m ? MEN[pc] : MAY[pc]; };
const tint = (a, b) => { const x = tpc(a), y = tpc(b); if (!x || !y) return 0; let d = ((y.pc - x.pc) % 12 + 12) % 12; return d > 5 ? d - 12 : d; };
const sinRep = a => a.filter((t, i) => t && (i === 0 || t !== a[i - 1]));

/** Secuencia de tonos por canción de un ítem de reunión (canción o medley). songById: id → canción. */
export function tonosTocados(item, songById) {
  const medley = item.tipo === 'medley';
  const ids = medley ? (item.canciones || []).map(c => c.id) : [item.id];
  const quienDe = id => medley ? (((item.canciones || []).find(c => c.id === id) || {}).quien || item.quien) : item.quien;
  const s0 = songById(ids[0]);
  const modul = medley || (item.modulante != null ? !!item.modulante : !!(s0 && s0.modulante));
  if (!modul) return [{ id: item.id, quien: item.quien, tonos: [item.tono || (s0 && s0.tono) || ''] }];
  const B = {}; ids.forEach(id => { const s = songById(id); if (s) B[id] = blocksOf(s); });
  let arr = item.arr && item.arr.length ? item.arr : [];
  if (!arr.length) arr = medley ? [].concat(...ids.filter(id => B[id]).map(id => defArr(songById(id)).map(e => ({ ...e, cancion: id })))) : (B[item.id] ? defArr(songById(item.id)) : []);
  const por = {}; ids.forEach(id => { por[id] = []; });
  let toc = null, esc = null, ant = null;
  arr.forEach(p => {
    const id = medley ? p.cancion : item.id, b = p.src != null && B[id] ? B[id][p.src] : null;
    const sec = b && b.sec, e = sec && sec.tono || (songById(id) || {}).tono || null;
    if (sec && sec.transicion) return;
    const t = p.tono ? p.tono : toc == null ? (item.tono || e) : (id === ant && e && esc) ? tmas(toc, tint(esc, e)) : toc;
    toc = t; if (e) esc = e; ant = id; if (por[id]) por[id].push(t);
  });
  return ids.map(id => ({ id, quien: quienDe(id), tonos: sinRep(por[id] || []).length ? sinRep(por[id]) : [item.tono || ''] }));
}

/** Ítems de una reunión como lista plana { id, tono: 'G→Ab→A', quien }: cada canción de un medley por separado. */
export function itemsPlanos(r, songById = () => null) {
  const out = [];
  (r.canciones || []).forEach(x => tonosTocados(x, songById).forEach(t => out.push({ id: t.id, tono: t.tonos.filter(Boolean).join('→'), quien: t.quien })));
  return out;
}

/** Registros de una canción (id o lista de ids: versiones del mismo título en otros tonos)
 *  = registro histórico + canciones de reuniones. */
export function historyOf(id, registro, reuniones, songById) {
  const ids = new Set([].concat(id)), has = x => ids.has(x);
  const a = registro.filter(x => has(x.id)).map(x => ({ ...x }));
  // Las reuniones ya volcadas a Registro no se cuentan dos veces (si Registro todavía no
  // trae esa fecha, p. ej. porque se anotó durante esta misma carga, se cuenta la reunión).
  reuniones.filter(r => !r.registrada || !registro.some(x => x.f === r.fecha)).forEach(r => itemsPlanos(r, songById).forEach(c => { if (has(c.id)) a.push({ f: r.fecha, id: c.id, t: c.tono, q: c.quien }); }));
  return a.sort((x, y) => (x.f || '').localeCompare(y.f || ''));
}

/** Última vez y tono por persona. Solo cuentan fechas hasta hoy (o sin fecha). */
export function summary(id, registro, reuniones, songById) {
  const T = todayISO();
  const a = historyOf(id, registro, reuniones, songById).filter(x => !x.f || x.f <= T);
  const last = [...a].reverse().find(x => x.f), per = {};
  a.forEach(x => { if (x.q) per[x.q] = { t: x.t, f: x.f || (per[x.q] || {}).f, n: ((per[x.q] || {}).n || 0) + 1 }; });
  return { last, per };
}

/** Búsqueda por director, título/intérprete o frase de la letra. Ignora acentos y mayúsculas. */
export function search(songs, q, perOf) {
  const w = norm(q).split(' ').filter(Boolean);
  if (!w.length) return songs.map(s => ({ s }));
  const out = [];
  songs.forEach(s => {
    const per = perOf(s.id), pm = Object.keys(per).find(p => w.every(x => norm(p).includes(x)));
    if (pm) { out.push({ s, who: 'Dirigió ' + pm + ' en ' + per[pm].t, rank: 0 }); return; }
    const inT = w.every(x => s._idx.includes(x)), inL = w.every(x => (s._idx + ' ' + s._ly).includes(x));
    if (!inT && !inL) return;
    let snip = '';
    if (!inT) {
      const ph = norm(q);
      snip = s._lines.find(l => norm(l).includes(ph)) || s._lines.find(l => w.every(x => norm(l).includes(x)))
        || s._lines.find(l => w.some(x => norm(l).includes(x))) || '';
    }
    out.push({ s, snip, rank: inT ? 0 : 1 });
  });
  return out.sort((a, b) => a.rank - b.rank);
}
