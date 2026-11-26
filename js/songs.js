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
    if (l.t === 'sec') { if (cur.label || cur.lines.some(x => x.t !== 'blank')) B.push(cur); cur = { label: l.v, lines: [] }; }
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

export const defArr = s => blocksOf(s).map(b => ({ src: b.has ? b.id : b.ref, label: b.label, rep: repOf(b.label) }));
export const isDefArr = (s, arr) => JSON.stringify(arr) === JSON.stringify(defArr(s));

/** Líneas a mostrar según el arreglo. En modo músico los bloques repetidos se muestran solo con su título. */
export function arrLines(s, arr, musician) {
  const B = blocksOf(s), seen = new Set(), out = [];
  arr.forEach(e => {
    const L = labOf(e); if (L) out.push({ t: 'sec', v: L });
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

/** Registros de una canción: registro histórico + canciones de reuniones. */
export function historyOf(id, registro, reuniones) {
  const a = registro.filter(x => x.id === id).map(x => ({ ...x }));
  // Las reuniones ya volcadas a Registro (registrada) no se cuentan dos veces.
  reuniones.filter(r => !r.registrada).forEach(r => r.canciones.forEach(c => { if (c.id === id) a.push({ f: r.fecha, id, t: c.tono, q: c.quien }); }));
  return a.sort((x, y) => (x.f || '').localeCompare(y.f || ''));
}

/** Última vez y tono por persona. Solo cuentan fechas hasta hoy (o sin fecha). */
export function summary(id, registro, reuniones) {
  const T = todayISO();
  const a = historyOf(id, registro, reuniones).filter(x => !x.f || x.f <= T);
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
