// Conversión Word (.docx) → canción JSON. Port de referencia/convert.py.
// El .docx se lee como ZIP (word/document.xml): no se crean archivos temporales en Drive.
//
// Posición de los acordes: métricas de Times New Roman ≈ Liberation Serif (anchos AFM de
// Times-Roman / Times-Bold, en milésimas de em) y factor 0,94 para los espacios.

const W_REG = mkW_({ ' ': 250, '!': 333, '"': 408, '#': 500, '$': 500, '%': 833, '&': 778, "'": 180, '(': 333, ')': 333, '*': 500, '+': 564, ',': 250, '-': 333, '.': 250, '/': 278,
  ':': 278, ';': 278, '<': 564, '=': 564, '>': 564, '?': 444, '@': 921, A: 722, B: 667, C: 667, D: 722, E: 611, F: 556, G: 722, H: 722, I: 333, J: 389, K: 722, L: 611, M: 889, N: 722, O: 722,
  P: 556, Q: 722, R: 667, S: 556, T: 611, U: 722, V: 722, W: 944, X: 722, Y: 722, Z: 611, '[': 333, '\\': 278, ']': 333, '^': 469, _: 500, '`': 333, a: 444, b: 500, c: 444, d: 500, e: 444,
  f: 333, g: 500, h: 500, i: 278, j: 278, k: 500, l: 278, m: 778, n: 500, o: 500, p: 500, q: 500, r: 333, s: 389, t: 278, u: 500, v: 500, w: 722, x: 500, y: 500, z: 444, '{': 480, '|': 200,
  '}': 480, '~': 541, '¿': 444, '¡': 333, '–': 500, '—': 1000, '“': 444, '”': 444, '‘': 333, '’': 333, '…': 1000, '×': 564 });
const W_BOLD = mkW_({ ' ': 250, '!': 333, '"': 555, '#': 500, '$': 500, '%': 1000, '&': 833, "'": 278, '(': 333, ')': 333, '*': 500, '+': 570, ',': 250, '-': 333, '.': 250, '/': 278,
  ':': 333, ';': 333, '<': 570, '=': 570, '>': 570, '?': 500, '@': 930, A: 722, B: 667, C: 722, D: 722, E: 667, F: 611, G: 778, H: 778, I: 389, J: 500, K: 778, L: 667, M: 944, N: 722, O: 778,
  P: 611, Q: 778, R: 722, S: 556, T: 667, U: 722, V: 722, W: 1000, X: 722, Y: 722, Z: 667, '[': 333, '\\': 278, ']': 333, '^': 581, _: 500, '`': 333, a: 500, b: 556, c: 444, d: 556, e: 444,
  f: 333, g: 500, h: 556, i: 278, j: 333, k: 556, l: 278, m: 833, n: 556, o: 500, p: 556, q: 556, r: 444, s: 389, t: 333, u: 556, v: 500, w: 722, x: 500, y: 500, z: 444, '{': 394, '|': 220,
  '}': 394, '~': 520, '¿': 500, '¡': 333, '–': 500, '—': 1000, '“': 500, '”': 500, '‘': 333, '’': 333, '…': 1000, '×': 570 });
/** Agrega las vocales acentuadas, ñ y ü con el ancho de su letra base. */
function mkW_(w) {
  const acc = { 'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u', 'ü': 'u', 'ñ': 'n', 'Á': 'A', 'É': 'E', 'Í': 'I', 'Ó': 'O', 'Ú': 'U', 'Ü': 'U', 'Ñ': 'N' };
  Object.keys(acc).forEach(k => { w[k] = w[acc[k]]; });
  return w;
}
W_REG[' '] = W_BOLD[' '] = 250; W_REG['​'] = W_BOLD['​'] = 0; // espacio duro y espacio de ancho cero
const ancho_ = (ch, bold) => ((bold ? W_BOLD : W_REG)[ch] ?? 500) * (ch === ' ' ? 0.94 : 1);

const CH_RE = /^\(?[A-G][#b]?(m|maj|min|sus|add|dim|aug|M)?\d*(sus\d*|add\d*|maj\d*|b\d+|#\d+)*(\/[A-G][#b]?)?\)?[,.]?$/;
const LAB_RE = /^\s*((?:\[[^\]]+\]:?\s*(?:[xX×]\d+)?\s*)+)/;
const VOC = 'aeiouáéíóúü';

// ---------- Lectura del .docx ----------
/** Devuelve [{ runs: [{ text, bold }] }] por párrafo del cuerpo. */
function leerDocx_(blob) {
  const files = Utilities.unzip(blob.setContentType('application/zip'));
  const doc = files.find(f => f.getName() === 'word/document.xml');
  if (!doc) throw new Error('No es un .docx válido.');
  const xml = XmlService.parse(doc.getDataAsString('UTF-8'));
  const w = XmlService.getNamespace('w', 'http://schemas.openxmlformats.org/wordprocessingml/2006/main');
  const body = xml.getRootElement().getChild('body', w);
  const out = [];
  const bold = r => {
    const pr = r.getChild('rPr', w), b = pr && pr.getChild('b', w);
    if (!b) return false;
    const v = b.getAttribute('val', w); return !v || ['0', 'false', 'off'].indexOf(v.getValue()) < 0;
  };
  const runsDe = (el, acc) => {
    el.getChildren().forEach(ch => {
      const n = ch.getName();
      if (n === 'r') {
        let t = '';
        ch.getChildren().forEach(x => { const k = x.getName(); if (k === 't') t += x.getText(); else if (k === 'tab') t += '    '; else if (k === 'br' || k === 'cr') t += ' '; });
        if (t) acc.push({ text: t.replace(/\t/g, '    '), bold: bold(ch) });
      } else if (n === 'hyperlink' || n === 'smartTag' || n === 'ins' || n === 'fldSimple') runsDe(ch, acc);
    });
    return acc;
  };
  const visitar = el => el.getChildren().forEach(ch => {
    const n = ch.getName();
    if (n === 'p') out.push({ runs: runsDe(ch, []) });
    else if (n === 'tbl' || n === 'tr' || n === 'tc' || n === 'sdt' || n === 'sdtContent') visitar(ch);
  });
  visitar(body);
  return out;
}
const texto_ = p => p.runs.map(r => r.text).join('');
/** Párrafo sin sus primeros n caracteres (conserva negrita y posiciones del resto). */
function cortarRuns_(p, n) {
  const runs = [];
  p.runs.forEach(r => { const ch = Array.from(r.text); if (n >= ch.length) { n -= ch.length; return; } runs.push({ text: ch.slice(n).join(''), bold: r.bold }); n = 0; });
  return { runs };
}
function xs_(p) {
  const o = []; let x = 0;
  p.runs.forEach(r => { for (const ch of r.text) { o.push(x); x += ancho_(ch, r.bold); } });
  o.push(x); return o;
}

// ---------- Reglas (idénticas a convert.py) ----------
function chordy_(t) {
  // [ ] = puente para modular, { } = cierre para repetir en el mismo tono: también son acordes (SPEC §6).
  const toks = t.replace(/[()[\]{}]/g, '').replace(/\/\//g, '').split(/[\s\-–|]+/).filter(Boolean);
  return toks.length > 0 && toks.every(x => CH_RE.test(x));
}
// Nota entre paréntesis con palabras dentro de una línea de acordes: "(Para repetir coro: C#/F)", "(bajada cromática)",
// "(BAJO: Eb G Bb E F)", "(Intro)", "[(2da vez A/B – B)]". No es un acorde, pero no impide que la línea sea de acordes:
// se guarda entera, en su lugar, como un acorde más (la app transporta los acordes que tenga adentro).
// "(Sube a X)" no es una nota: es la indicación de cambio de tono.
const NOTA_RE = /[\[{]?\([^()]*\)[\]}]?/g;
function esNota_(m) {
  const x = m.replace(/^[\[{]?\(|\)[\]}]?$/g, '').trim();
  if (/^(sube|baja|subida|bajada|pasa|modula)\s+(a|al)\s/i.test(x)) return false;
  return x.split(/[\s:,;.]+/).some(w => /[A-Za-zÀ-ÿ]{3,}/.test(w) && !CH_RE.test(w));
}
/** La línea con cada nota reemplazada por espacios (mismo largo). */
const sinNotas_ = t => String(t).replace(NOTA_RE, m => esNota_(m) ? ' '.repeat(Array.from(m).length) : m);
/** Línea de acordes, aunque tenga notas entre paréntesis (necesita al menos un acorde fuera de las notas). */
function chordyNota_(t) {
  if (chordy_(t)) return true;
  const s = sinNotas_(t); return s !== t && /\S/.test(s) && chordy_(s);
}
// Renglón con solo una flecha ("↓"): es una marca del Word, no se muestra (el indicador de tono lo pone la app).
const FLECHA_RE = /^[↓↑⇩⇧⬇⬆]+$/;
function starts_(w) {
  const S = new Set([0]), chars = Array.from(w);
  for (let k = 1; k < chars.length; k++) {
    const a = chars[k - 1].toLowerCase(), b = chars[k].toLowerCase();
    if (' ,¿¡('.indexOf(a) >= 0 && b !== ' ') S.add(k);
    else if (VOC.indexOf(a) >= 0 && /\p{L}/u.test(b) && VOC.indexOf(b) < 0 && k + 1 < chars.length && (VOC + 'rl').indexOf(chars[k + 1].toLowerCase()) >= 0) S.add(k);
  }
  S.add(chars.length);
  return [...S].sort((x, y) => x - y);
}
function snap_(w, j) {
  return starts_(w).reduce((best, k) => (Math.abs(k - j) < Math.abs(best - j) || (Math.abs(k - j) === Math.abs(best - j) && k < best)) ? k : best, Infinity);
}
function labels_(s) {
  // Acepta ":" y x2/X2/×2 después del corchete (SPEC §6): "[Parte 1]: x2" → "Parte 1 x2"
  const out = [], re = /\[([^\]]+)\]:?\s*(?:[xX×](\d+))?/g; let m;
  // "[Puente 2a] [x2]": un corchete que solo dice las veces es parte del título anterior, no una parte nueva.
  while ((m = re.exec(s))) {
    const v = (m[1] + (m[2] ? ' x' + m[2] : '')).trim(), n = /^[xX×]\s*(\d+)$/.exec(v);
    if (n && out.length) out[out.length - 1] += ' x' + n[1]; else out.push(v);
  }
  return out;
}
const SEC_RE = /^(Verso|Coro|Puente|Estrofa|Pre ?[Cc]oro|Intro|Final|Parte)\b[\wÀ-ÿ ]*$/;

// Títulos de parte escritos sin corchetes (SPEC §6): "Coro:", "Estrofa 1:", "CORO", "PRE-CORO",
// "PUENTE (Repite …)", "CORO (Dm)", "Inter: Bb F C - Gm Dm C", "INTERLUDIO(2x): G - D", "FINAL /B-E-F#/".
const PARTES_ = 'pre[- ]?coro|precoro|post[- ]?coro|interludio|instrumental|estrofa|verso|coro|puente|intro|inter|final|parte|tag|chorus|verse|bridge|outro';
const LIBRE_RE = new RegExp('^((?:' + PARTES_ + ')(?:\\s*(?:\\d+|[IVX]+)\\b)?)\\b\\s*(.*)$', 'i');
const VECES_RE = /^(?:[xX×]\s*(\d+)|\(\s*(\d+)\s*[xX×]\s*\)|\(\s*[xX×]\s*(\d+)\s*\))\s*/;
/** Acordes con barras de compás sueltas ("/B-E-F#/", "B / / /", "//A - D//"). */
function acordesSueltos_(t) {
  const x = t.replace(/(^|[\s\-–])\/+/g, '$1 ').replace(/\/+(?=$|[\s\-–])/g, ' ');
  return /\S/.test(x) && chordy_(x);
}
/** Si la línea es un título de parte sin corchetes, devuelve { v, ch? }; si no, null. */
function tituloLibre_(s) {
  const m = LIBRE_RE.exec(s.trim()); if (!m) return null;
  let head = m[1].replace(/\s+/g, ' '), r = m[2].trim(), veces = '';
  const v0 = VECES_RE.exec(r); if (v0) { veces = v0[1] || v0[2] || v0[3]; r = r.slice(v0[0].length).trim(); }
  const dos = r.startsWith(':'); if (dos) r = r.slice(1).trim();
  const v1 = VECES_RE.exec(r); if (v1) { veces = v1[1] || v1[2] || v1[3]; r = r.slice(v1[0].length).trim(); }
  if (head === head.toUpperCase()) head = head.charAt(0) + head.slice(1).toLowerCase();
  const nombre = head + (veces ? ' x' + veces : '');
  if (!r) return { v: nombre };
  if (acordesSueltos_(r)) return { v: nombre, ch: r };
  const ta = !veces && titAcordes_(s.trim()); if (ta) return ta;
  // Nota entre paréntesis, o cualquier aclaración después de ":" → queda en el título.
  if (dos || /^\(.*\)$/.test(r)) return { v: nombre + ' ' + r };
  return null;                                                  // es una línea de letra que empieza con esa palabra
}

/**
 * Título con acordes y las veces al final, con o sin corchetes: "Intro F# - C# - D#m-B – F#-C# x2"
 * → { v: "Intro x2", ch: "F# - C# - D#m-B – F#-C#" }. Pide 2 acordes o más, para no partir "Parte D x2".
 */
function titAcordes_(v) {
  const m = LIBRE_RE.exec(v.trim()); if (!m) return null;
  let head = m[1].replace(/\s+/g, ' '); const r = m[2].trim();
  const vf = /\s+(?:[xX×]\s*(\d+)|\(\s*(\d+)\s*[xX×]\s*\)|\(\s*[xX×]\s*(\d+)\s*\))$/.exec(r); if (!vf) return null;
  const ch = r.slice(0, vf.index).trim();
  if (!acordesSueltos_(ch) || ch.replace(/[()[\]{}]/g, '').split(/[\s\-–|/]+/).filter(Boolean).length < 2) return null;
  if (head === head.toUpperCase()) head = head.charAt(0) + head.slice(1).toLowerCase();
  return { v: head + ' x' + (vf[1] || vf[2] || vf[3]), ch };
}

// "(Estrofa)" solo en una línea, e "I)", "II)", "III)"… como Estrofa 1, 2, 3 (SPEC §6).
// "(Chorus)" o "(final)" justo debajo de un título es una aclaración de ese título: no es una parte nueva.
const ROMANOS_ = { I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7, VIII: 8, IX: 9, X: 10 };
function tituloSuelto_(s, prev) {
  const r = /^([IVX]+)\)$/.exec(s.trim());
  if (r && ROMANOS_[r[1]]) return { v: 'Estrofa ' + ROMANOS_[r[1]] };
  const m = new RegExp('^\\(\\s*((?:' + PARTES_ + ')(?:\\s*\\d+)?)\\s*\\)$', 'i').exec(s.trim());
  if (!m || (prev && prev.t === 'sec')) return null;
  const h = m[1].replace(/\s+/g, ' ');
  return { v: h.charAt(0).toUpperCase() + h.slice(1).toLowerCase() };
}
const ultima_ = L => { for (let k = L.length - 1; k >= 0; k--) if (L[k].t !== 'blank') return L[k]; return null; };

/**
 * Convierte los párrafos de un .docx a {tono, lineas}. Las posiciones son índices de caracteres
 * (como en Python); se trabaja con Array.from para no partir caracteres.
 */
function convertirParrafos_(ps) {
  // ♭/♯ se aceptan como b/# (mismo largo: no cambia la posición de los acordes).
  ps.forEach(p => p.runs.forEach(r => { r.text = r.text.replace(/♭/g, 'b').replace(/♯/g, '#'); }));
  const m0 = /\[([^\]]+)\]/.exec(texto_(ps[0] || { runs: [] }));
  if (!m0) throw new Error('El primer párrafo no tiene el tono entre corchetes: "Título [Tono]".');
  // "(SUBE) [Coro]" / "(Baja) [Inter] (acordes)": la indicación marca el título que sigue (SPEC §6, tono por parte).
  let mod = null;
  const tono = m0[1].trim(), L = [], secs = lab => labels_(lab).forEach(v => { const ta = titAcordes_(v), o = { t: 'sec', v: ta ? ta.v : v }; if (mod) { o.mod = mod; mod = null; } L.push(o); if (ta) L.push({ t: 'ch', v: ta.ch }); });
  let i = 1;
  while (i < ps.length) {
    let p = ps[i], t = texto_(p).replace(/\s+$/, '');
    const mm = new RegExp('^\\s*\\((sube|baja|subida|bajada)\\)\\s*(?=\\[|(?:' + PARTES_ + ')\\b)', 'i').exec(t);
    if (mm) { mod = mm[1].toUpperCase(); p = cortarRuns_(p, Array.from(mm[0]).length); ps[i] = p; t = texto_(p).replace(/\s+$/, ''); }
    const s = t.trim();
    if (!s) { L.push({ t: 'blank' }); i++; continue; }
    if (FLECHA_RE.test(s.replace(/\s+/g, ''))) { i++; continue; }
    const m = LAB_RE.exec(t), lab = m ? m[1] : '';
    const rest = m ? t.slice(lab.length) : t;
    if (m && !rest.trim()) { secs(lab); i++; continue; }
    if (!m) {
      const tl = tituloLibre_(s) || tituloSuelto_(s, ultima_(L));
      if (tl) { secs('[' + tl.v + ']'); if (tl.ch) L.push({ t: 'ch', v: tl.ch }); i++; continue; }
    }
    // Una línea de acordes con nota entre paréntesis solo cambia si tiene letra abajo para emparejar;
    // si no, queda como antes (letra o mixta).
    const conNota = !chordy_(rest) && chordyNota_(rest);
    if (chordy_(rest) || conNota) {
      const nxt = i + 1 < ps.length ? ps[i + 1] : null;
      const nt = nxt ? texto_(nxt).replace(/\s+$/, '') : '';
      const nm = LAB_RE.exec(nt), nlab = nm ? nm[1] : '';
      if (nxt && nt.trim() && !chordyNota_(nt.slice(nlab.length)) && nt.slice(nlab.length).trim() && !(!nlab && (tituloLibre_(nt) || tituloSuelto_(nt, null)))) {
        if (lab) secs(lab);
        if (nlab) secs(nlab);
        const cx = xs_(p), lx = xs_(nxt);
        let lyr = nt.slice(nlab.length);
        const off = Array.from(nlab).length + (Array.from(lyr).length - Array.from(lyr.replace(/^\s+/, '')).length);
        lyr = lyr.trim();
        const lyrC = Array.from(lyr), pos = [], tc = Array.from(t), labLen = Array.from(lab).length;
        // tokens \S+ con su índice de carácter; cada nota entre paréntesis es un solo token
        const notas = [];
        if (!chordy_(rest)) for (const mn of t.matchAll(NOTA_RE)) if (esNota_(mn[0])) { const a = Array.from(t.slice(0, mn.index)).length; notas.push([a, a + Array.from(mn[0]).length]); }
        let k = 0;
        while (k < tc.length) {
          if (/\s/.test(tc[k])) { k++; continue; }
          const st = k, nn = notas.find(n => n[0] === st);
          if (nn) k = nn[1]; else while (k < tc.length && !/\s/.test(tc[k])) k++;
          if (st < labLen) continue;
          const tok = tc.slice(st, k).join(''), x = cx[st];
          let j = 0; for (let q = 1; q < lx.length; q++) if (Math.abs(lx[q] - x) < Math.abs(lx[j] - x)) j = q;
          j = Math.max(0, Math.min(lyrC.length, j - off));
          j = snap_(lyr, j);
          const limpio = z => z.replace(/[[\]{}]/g, '');
          // "-" y el guion largo "–" separan acordes pegados ("D#m-B", "Bm–G").
          const parts = /[-–]/.test(tok) && tok.split(/[-–]/).every(z => CH_RE.test(limpio(z))) ? tok.split(/[-–]/) : [tok];
          parts.forEach(c => pos.push([j, c]));
        }
        pos.sort((a, b) => a[0] - b[0]); // estable, como sorted() de Python
        const segs = [];
        if (!pos.length || pos[0][0] > 0) segs.push(['', pos.length ? lyrC.slice(0, pos[0][0]).join('') : lyr]);
        pos.forEach(([a, c], n) => { const e = n + 1 < pos.length ? pos[n + 1][0] : lyrC.length; segs.push([c, lyrC.slice(a, e).join('')]); });
        L.push({ t: 'pair', segs: segs.map(([c, w]) => [c, w.replace(/_+/g, '')]) });
        i += 2; continue;
      }
      if (!conNota) {
        if (lab) secs(lab);
        L.push({ t: 'ch', v: rest.trim() }); i++; continue;
      }
    }
    if (lab) secs(lab);
    if (/\(?[A-G][#b]?\d/.test(rest) && /\b[A-G][#b]?(m|\d|\/)/.test(rest)) L.push({ t: 'mix', v: rest.trim() });
    else L.push({ t: 'ly', v: rest.trim() });
    i++;
  }
  while (L.length && L[L.length - 1].t === 'blank') L.pop();
  // Los espacios múltiples dentro de la letra se reducen a uno (SPEC §6).
  L.forEach(l => { if (l.t === 'pair') l.segs.forEach(sg => { sg[1] = sg[1].replace(/ {2,}/g, ' '); }); });
  return { tono, lineas: L };
}

function convertirDocx_(blob) { return convertirParrafos_(leerDocx_(blob)); }
