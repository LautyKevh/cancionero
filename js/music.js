// Teoría musical: transposición, cifrado americano / latino / grados.
// Funciones puras: no tocan el DOM ni el estado global.
import { blocksOf, defArr } from './songs.js';

export const SH = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
export const FL = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];
export const LAT = { C:'Do', D:'Re', E:'Mi', F:'Fa', G:'Sol', A:'La', B:'Si' };
export const KEYS = ['C','Db','D','Eb','E','F','F#','G','Ab','A','Bb','B'];
const DEG = {0:'I',1:'bII',2:'II',3:'bIII',4:'III',5:'IV',6:'#IV',7:'V',8:'bVI',9:'VI',10:'bVII',11:'VII'};

export const idx = n => { const i = SH.indexOf(n); return i < 0 ? FL.indexOf(n) : i; };

/** Tono base de una canción ("Ab", "Dm"). */
export const baseKey = song => ((song.tono || '').match(/^[A-G][#b]?m?/) || ['C'])[0];

// Nombres de tono: F# (nunca Gb), Db, Eb, Ab, Bb; en menor, C#m, F#m, G#m, Ebm, Bbm.
const TONO_MAY = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
const TONO_MEN = ['Cm', 'C#m', 'Dm', 'Ebm', 'Em', 'Fm', 'F#m', 'Gm', 'G#m', 'Am', 'Bbm', 'Bm'];

/** Tono resultante de transponer `song` `sh` semitonos. Sin transporte, tal como está escrito. */
export function keyAt(song, sh) {
  const k = baseKey(song), m = k.endsWith('m'), r = k.replace(/m$/, '');
  if ((sh % 12 + 12) % 12 === 0 && idx(r) >= 0) return k;
  const i = (idx(r) + sh + 120) % 12;
  return (m ? TONO_MEN : TONO_MAY)[i];
}

// Nombre de una nota según el grado en el tono: los grados de la escala con su letra, y los prestados
// como bII, bIII, #IV, bVI y bVII (en A: Bb, C, D#, F, G). Así se elige # o b según el tono de destino.
const LETRAS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'], LETRA_PC = [0, 2, 4, 5, 7, 9, 11];
const PASO = [0, 1, 1, 2, 2, 3, 3, 4, 5, 5, 6, 6];      // semitonos desde la tónica → letras desde la tónica
function nombreEnTono(pc, key) {
  const r = key.replace(/m$/, ''), L0 = LETRAS.indexOf(r[0]), t = idx(r);
  if (L0 < 0 || t < 0) return SH[pc];
  const L = (L0 + PASO[(pc - t + 12) % 12]) % 7, acc = ((pc - LETRA_PC[L]) % 12 + 18) % 12 - 6;
  const n = acc === 0 ? LETRAS[L] : acc === 1 ? LETRAS[L] + '#' : acc === -1 ? LETRAS[L] + 'b' : null;
  // E#, B#, Cb, Fb o dobles alteraciones: se escribe la nota más simple.
  return !n || /^(E#|B#|Cb|Fb)$/.test(n) ? (TONO_MAY[pc].length === 1 ? TONO_MAY[pc] : (acc > 0 ? SH[pc] : FL[pc])) : n;
}

/** Semitonos (−5…+6) para llevar la canción al tono `target`. */
export function shiftTo(song, target) {
  const sh = (idx(target.replace(/m$/, '')) - idx(baseKey(song).replace(/m$/, '')) + 12) % 12;
  return sh > 6 ? sh - 12 : sh;
}

/** Equivalente en KEYS (lista de tonos elegibles) del tono original. */
export function keyOption(song) {
  const t = baseKey(song);
  return KEYS.includes(t) ? t : (KEYS.find(k => idx(k) === idx(t.replace(/m$/, ''))) || 'C');
}

/** Nombre de tono para mostrar según cifrado (0 = C, 1 = Do, 2 = I usa americano). */
export const showKey = (k, not) => not === 1 ? k.replace(/^[A-G]/, c => LAT[c]) : k;

const degOf = (n, tonic) => { const i = idx(n); return i < 0 ? n : DEG[(i - tonic + 12) % 12]; };

/**
 * Crea un transpositor para un contexto (canción, desplazamiento, cifrado).
 * Devuelve { chord(c), line(text, strict) }.
 * Sin transporte, los acordes quedan tal como están escritos; con transporte, # o b según el tono de destino.
 */
export function transposer(song, sh, not) {
  const igual = (sh % 12 + 12) % 12 === 0;
  const key = keyAt(song, sh), tonic = idx(key.replace(/m$/, ''));
  const note = n => {
    const i = idx(n); if (i < 0) return n;
    let o = igual ? n : nombreEnTono((i + sh + 120) % 12, key);
    if (not === 1) o = LAT[o[0]] + o.slice(1);
    return o;
  };
  const chord = c => {
    if (not === 2) {
      return c.replace(/^([(\[{]*)([A-G][#b]?)([^/\])}]*)/, (m, p, r, q) => {
        let d = degOf(FL[(idx(r) + sh + 120) % 12], tonic);
        if (/^m(?!aj)/.test(q)) { d = d.replace(/[IV]+/, x => x.toLowerCase()); q = q.slice(1); }
        return p + d + q;
      }).replace(/\/([A-G][#b]?)/, (m, r) => '/' + degOf(FL[(idx(r) + sh + 120) % 12], tonic));
    }
    return c.replace(/^([(\[{]*)([A-G][#b]?)/, (m, p, r) => p + note(r)).replace(/\/([A-G][#b]?)/, (m, r) => '/' + note(r));
  };
  const line = (text, strict) => {
    let out = '', pend = 0;
    text.replace(/(\s+)|(\S+)/g, (m, sp, tok) => {
      if (sp) { out += ' '.repeat(Math.max(1, sp.length - pend)); pend = 0; return; }
      let n = tok;
      if (!strict || CHORD.test(tok)) n = tok.split(/([-–|])/).map(p => CHORD.test(p) ? chord(p) : p).join('');
      pend = Math.max(0, n.length - tok.length); out += n;
    });
    return out;
  };
  return { key, chord, line };
}

export const CHORD = /^[(\[]*[A-G][#b]?(m|maj|min|sus|add|dim|aug|M)?\d*(sus\d*|add\d*|maj\d*|b\d+|#\d+)*(\/[A-G][#b]?)?[)\],.]*$/;

// ---------- Tono por parte, Modulante y Medley (SPEC §5 y §7) ----------
// Mismo cálculo que tonosTocados_ de motor/Tonos.js (Registro), más lo que necesita la vista:
// tono de cada parte, transporte de sus líneas, puentes y transiciones, [ ] / { } e indicador.
const NOM_MAY = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
const NOM_MEN = ['Cm', 'C#m', 'Dm', 'Ebm', 'Em', 'Fm', 'F#m', 'Gm', 'G#m', 'Am', 'Bbm', 'Bm'];
const TONO = /^([A-G][#b]?)(m?)$/;
/** Tono transportado n semitonos ("A" + 1 → "Bb"). */
export function tonoMas(t, n) {
  const m = TONO.exec(String(t || '').trim()); if (!m || idx(m[1]) < 0) return t;
  const pc = ((idx(m[1]) + n) % 12 + 12) % 12;
  return m[2] ? NOM_MEN[pc] : NOM_MAY[pc];
}
/** Semitonos de a → b, en −6…+5 (la subida o bajada más corta). */
export function intervalo(a, b) {
  const x = TONO.exec(String(a || '').trim()), y = TONO.exec(String(b || '').trim());
  if (!x || !y || idx(x[1]) < 0 || idx(y[1]) < 0) return 0;
  let d = ((idx(y[1]) - idx(x[1])) % 12 + 12) % 12; if (d > 5) d -= 12; return d;
}
/** Semitonos en tonos para el indicador: 3 → "+1½", −1 → "−½", 2 → "+1". */
export function enTonos(n) {
  const a = Math.abs(n), e = Math.floor(a / 2), h = a % 2 ? '½' : '';
  return (n < 0 ? '−' : '+') + (e ? e : '') + h;
}
/**
 * Título de parte que nombra un tono ("Inter para subir a A", "Coro (Sube a A)", "BAJA AL F#"): ese tono se
 * transporta sh semitonos, igual que los acordes de la parte. fmt da el nombre a mostrar (cifrado elegido).
 */
const TONO_EN_TITULO = /((?:[Ss]u[bv]|SU[BV]|[Bb]aj|BAJ)[A-Za-zÁÉÍÓÚáéíóú]*\s+(?:(?:a|al|A|AL)\s+)?)([A-G][#b]?m?)(?![A-Za-z0-9#])/g;
export function tituloTransportado(label, sh, fmt = k => k) {
  if (!label) return label || '';
  return String(label).replace(TONO_EN_TITULO, (_, pre, k) => pre + fmt(sh ? tonoMas(k, sh) : k));
}
const sinRep = a => a.filter((t, i) => t && (i === 0 || t !== a[i - 1]));
/** Mismo tono aunque esté escrito distinto (F# = Gb). */
const mismo = (a, b) => intervalo(a, b) === 0 && /m$/.test(a || '') === /m$/.test(b || '');

/**
 * Tonos de un ítem de reunión (canción o medley), parte por parte.
 * songs: { id → canción }. Devuelve:
 *  - partes: una por entrada del arreglo (mismo orden), con
 *      { i, cancion, src, escrito, tono, sh, transicion, ver, cambia, indicador,
 *        puente: { ver, sh, tono, escrito }, modula: { ver, sh, tono, escrito }, repite: { ver } }
 *    tono = tono en que se toca; sh = semitonos para llevar sus líneas del tono escrito al tocado;
 *    ver = false solo en transiciones ocultas; puente/modula/repite = acordes ( ), [ ] y { } del final de la parte
 *    (los ( ) se ven siempre y van con su parte; modula se transporta sh desde el tono escrito de la parte siguiente);
 *  - modulante; arr (el arreglo usado: el del ítem o el base); secuencias: [{ id, quien, tonos }] (igual que tonosTocados_ del motor, para el Registro).
 */
export function tonosDelItem(item, songs) {
  const medley = item.tipo === 'medley';
  const ids = medley ? (item.canciones || []).map(c => c.id) : [item.id];
  const s0 = songs[ids[0]];
  const modul = medley || (item.modulante != null ? !!item.modulante : !!(s0 && s0.modulante));
  let arr = item.arr && item.arr.length ? item.arr : [];
  if (!arr.length) arr = medley ? [].concat(...ids.filter(id => songs[id]).map(id => defArr(songs[id]).map(e => ({ ...e, cancion: id }))))
                                : (s0 ? defArr(s0) : []);
  const unTono = item.tono || (s0 && s0.tono) || '';

  // 1) Tono escrito y tocado de cada parte (las transiciones toman el de la parte siguiente).
  let tocado = null, escrito = null, ant = null;
  const P = arr.map((p, i) => {
    const id = medley ? p.cancion : item.id, s = songs[id];
    const b = s && p.src != null ? blocksOf(s)[p.src] : null;
    const esc = (b && b.sec && b.sec.tono) || (s && s.tono) || null;
    const o = { i, cancion: id, src: p.src, escrito: esc, transicion: !!(b && b.sec && b.sec.transicion), mostrar: !!p.mostrar, b };
    if (o.transicion) { o.destino = b.sec.destino || esc; return o; }
    let t;
    if (!modul) t = unTono;
    else if (p.tono) t = p.tono;
    else if (tocado == null) t = item.tono || esc;
    else if (id === ant && esc && escrito) t = tonoMas(tocado, intervalo(escrito, esc));
    else t = tocado;                                     // parte nueva o cambio de canción del medley
    tocado = t; if (esc) escrito = esc; ant = id;
    o.tono = t;
    return o;
  });

  // 2) Lo que depende de la parte siguiente: puentes, transiciones, [ ] / { } e indicador.
  const sig = k => { for (let j = k + 1; j < P.length; j++) if (!P[j].transicion) return P[j]; return null; };
  let prev = null;
  P.forEach((o, k) => {
    const n = sig(k);
    if (o.transicion) {
      // Se transporta según el tono de destino; se ve solo si cambia el tono (o con "Mostrar igual").
      const cambia = !!(n && prev && !mismo(n.tono, prev.tono));
      o.tono = n ? n.tono : (prev ? prev.tono : unTono);
      o.sh = n ? intervalo(o.destino, n.tono) : 0;
      o.cambia = cambia; o.ver = cambia || o.mostrar;
      o.puente = { ver: false, sh: 0 }; o.modula = { ver: false, sh: 0 }; o.repite = { ver: false };
      return;
    }
    o.sh = intervalo(o.escrito, o.tono);
    o.ver = true;
    o.cambia = !!(n && !mismo(n.tono, o.tono));
    const shSig = n ? intervalo(n.escrito, n.tono) : o.sh;  // escritos para ir al tono escrito de la siguiente
    const dest = n ? { tono: n.tono, escrito: n.escrito, cancion: n.cancion } : { tono: o.tono, escrito: o.escrito, cancion: o.cancion };
    // Acordes entre ( ) al final de la parte: se ven siempre, tal cual, transportados con su parte (no son puente).
    o.puente = { ver: true, sh: o.sh, tono: o.tono, escrito: o.escrito, cancion: o.cancion };
    // [ ] = modular: solo si la siguiente cambia de tono; en la última parte, siempre (tag o cierre final).
    // Con Modulante apagado se ocultan siempre, también en la última parte.
    o.modula = { ver: modul && (n ? (o.cambia || o.mostrar) : true), sh: n ? shSig : o.sh, ...dest };
    // { } = repetir en el mismo tono: solo si la siguiente queda igual.
    o.repite = { ver: !n || !o.cambia };
    o.indicador = null;
    if (prev && !mismo(prev.tono, o.tono)) {
      const d = intervalo(prev.tono, o.tono);
      o.indicador = { dir: d < 0 ? '↓' : '↑', tono: o.tono, dif: d, texto: `${d < 0 ? '↓' : '↑'} ${o.tono} (${enTonos(d)})` };
    }
    prev = o;
  });
  P.forEach(o => { delete o.b; delete o.mostrar; });

  // 3) Secuencia de tonos tocados por canción (sin repetidos consecutivos), como el Registro.
  const quienDe = id => medley ? ((item.canciones.find(c => c.id === id) || {}).quien || item.quien) : item.quien;
  const secuencias = modul
    ? ids.map(id => ({ id, quien: quienDe(id), tonos: sinRep(P.filter(o => !o.transicion && o.cancion === id).map(o => o.tono)) }))
         .map(x => x.tonos.length ? x : Object.assign(x, { tonos: [item.tono || ''] }))
    : [{ id: item.id, quien: item.quien, tonos: [unTono] }];
  return { modulante: modul, arr, partes: P, secuencias };
}
