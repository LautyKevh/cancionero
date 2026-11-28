// Una parte como texto, igual que en los Word: el renglón de acordes arriba del de letra (letra monoespaciada).
// textoALineas lo vuelve a convertir con las mismas reglas del conversor (motor/Convertir.js, SPEC §6):
// líneas de acordes, notas entre paréntesis, ( ), [ ] y { }. En monoespaciada la columna es exacta.

const CH_RE = /^\(?[A-G][#b]?(m|maj|min|sus|add|dim|aug|M)?\d*(sus\d*|add\d*|maj\d*|b\d+|#\d+)*(\/[A-G][#b]?)?\)?[,.]?$/;
const tokens = t => t.replace(/[()[\]{}]/g, '').replace(/\/\//g, '').split(/[\s\-–|]+/).filter(Boolean);
const chordy = t => { const k = tokens(t); return k.length > 0 && k.every(x => CH_RE.test(x)); };
const NOTA_RE = /[[{]?\([^()]*\)[\]}]?/g;
function esNota(m) {
  const x = m.replace(/^[[{]?\(|\)[\]}]?$/g, '').trim();
  if (/^(sube|baja|subida|bajada|pasa|modula)\s+(a|al)\s/i.test(x)) return false;
  return x.split(/[\s:,;.]+/).some(w => /[A-Za-zÀ-ÿ]{3,}/.test(w) && !CH_RE.test(w));
}
const sinNotas = t => String(t).replace(NOTA_RE, m => esNota(m) ? ' '.repeat(m.length) : m);
const chordyNota = t => { if (chordy(t)) return true; const s = sinNotas(t); return s !== t && /\S/.test(s) && chordy(s); };
const textoAcordes = l => l.t === 'pair' ? l.segs.map(x => x[0]).filter(Boolean).join(' ') : l.t === 'ch' || l.t === 'mix' ? l.v : '';

/**
 * Líneas de una parte → texto. chord(c) transporta un acorde (o una nota con acordes adentro); line(v, mix) una línea.
 */
export function lineasATexto(L, chord, line) {
  const out = [];
  (L || []).forEach(l => {
    if (l.t === 'blank') out.push('');
    else if (l.t === 'sec') out.push('[' + l.v + ']');
    else if (l.t === 'ly') out.push(l.v);
    else if (l.t === 'ch' || l.t === 'mix') out.push(line(l.v, l.t === 'mix'));
    else if (l.t === 'pair') {
      let fila = '', col = 0;
      l.segs.forEach(([c, t]) => {
        if (c) { const x = chord(c); fila = fila.padEnd(Math.max(col, fila.length ? fila.length + 1 : 0)) + x; }
        col += t.length;
      });
      out.push(fila, l.segs.map(x => x[1]).join(''));
    }
  });
  while (out.length && !out[out.length - 1].trim()) out.pop();
  return out.join('\n');
}

/**
 * Texto → líneas, en el tono en que se escribió. chord(c) / line(v, mix) pasan al tono escrito.
 * conPuente: la parte original tenía acordes puente (( ) al final). Devuelve { lineas, avisos }.
 */
export function textoALineas(texto, chord, line, conPuente) {
  const R = String(texto || '').replace(/\r/g, '').replace(/♭/g, 'b').replace(/♯/g, '#').replace(/\t/g, '    ').split('\n').map(x => x.replace(/\s+$/, ''));
  const L = [], avisos = [];
  const ac = c => /\s/.test(c) ? c.split(/([-–|\s])/).map(p => CH_RE.test(p.replace(/[{}()[\]]/g, '')) ? chord(p) : p).join('') : chord(c);
  const casi = (t, n) => {                            // casi todo acordes: avisa qué no se pudo leer
    const k = tokens(sinNotas(t)), malos = k.filter(x => !CH_RE.test(x));
    if (k.length >= 2 && malos.length && malos.length * 2 <= k.length)
      avisos.push(`Renglón ${n}: no reconozco “${malos.join(' ')}” como acorde; quedó como letra.`);
  };
  for (let i = 0; i < R.length; i++) {
    const t = R[i], s = t.trim(), n = i + 1;
    if (!s) { L.push({ t: 'blank' }); continue; }
    if (/^\[[^\]]+\]$/.test(s) && !chordy(s)) { avisos.push(`Renglón ${n}: “${s}” parece un título de parte; acá no se cambian los títulos, quedó como letra.`); L.push({ t: 'ly', v: s }); continue; }
    const conNota = !chordy(t) && chordyNota(t);
    if (chordy(t) || conNota) {
      const nt = i + 1 < R.length ? R[i + 1] : '';
      if (nt.trim() && !chordyNota(nt) && !/^\[[^\]]+\]$/.test(nt.trim())) {
        // Par acordes / letra: cada acorde se ancla a la letra en su columna.
        const lead = nt.length - nt.replace(/^\s+/, '').length, lyr = nt.trim(), pos = [];
        const notas = conNota ? [...t.matchAll(NOTA_RE)].filter(m => esNota(m[0])).map(m => [m.index, m.index + m[0].length]) : [];
        let k = 0;
        while (k < t.length) {
          if (/\s/.test(t[k])) { k++; continue; }
          const st = k, nn = notas.find(x => x[0] === st);
          if (nn) k = nn[1]; else while (k < t.length && !/\s/.test(t[k])) k++;
          const tok = t.slice(st, k), j = Math.max(0, Math.min(lyr.length, st - lead));
          const limpio = z => z.replace(/[[\]{}]/g, '');
          const parts = /[-–]/.test(tok) && tok.split(/[-–]/).every(z => CH_RE.test(limpio(z))) ? tok.split(/[-–]/) : [tok];
          parts.forEach(c => pos.push([j, c]));
        }
        const segs = [];
        if (!pos.length || pos[0][0] > 0) segs.push(['', pos.length ? lyr.slice(0, pos[0][0]) : lyr]);
        pos.forEach(([a, c], q) => segs.push([ac(c), lyr.slice(a, q + 1 < pos.length ? pos[q + 1][0] : lyr.length)]));
        L.push({ t: 'pair', segs: segs.map(([c, w]) => [c, w.replace(/_+/g, '').replace(/ {2,}/g, ' ')]) });
        i++; continue;
      }
      if (!conNota) { L.push({ t: 'ch', v: line(s, false) }); continue; }
    }
    casi(t, n);
    if (/\(?[A-G][#b]?\d/.test(s) && /\b[A-G][#b]?(m|\d|\/)/.test(s)) L.push({ t: 'mix', v: line(s, true) });
    else L.push({ t: 'ly', v: s.replace(/ {2,}/g, ' ') });
  }
  while (L.length && L[L.length - 1].t === 'blank') L.pop();
  while (L.length && L[0].t === 'blank') L.shift();
  // [ ] = para modular, { } = para repetir; ( ) al final de la parte = puente (solo si la parte original lo tenía).
  L.forEach(l => { const x = sinNotas(textoAcordes(l)); if (/\[[^\]]*\]/.test(x)) l.modula = true; if (/\{[^}]*\}/.test(x)) l.repite = true; });
  if (conPuente) {
    const u = [...L].reverse().find(l => l.t === 'pair' || l.t === 'ch');
    if (u && /\)\s*$/.test(textoAcordes(u).replace(/\[[^\]]*\]|\{[^}]*\}/g, '').trim())) u.puente = true;
  }
  if (!L.length) avisos.push('La parte quedó vacía.');
  return { lineas: L, avisos };
}
