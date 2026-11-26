// Teoría musical: transposición, cifrado americano / latino / grados.
// Funciones puras: no tocan el DOM ni el estado global.

export const SH = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
export const FL = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];
export const LAT = { C:'Do', D:'Re', E:'Mi', F:'Fa', G:'Sol', A:'La', B:'Si' };
export const FLATKEYS = ['F','Bb','Eb','Ab','Db','Gb','Dm','Gm','Cm','Fm','Bbm','Ebm'];
export const KEYS = ['C','Db','D','Eb','E','F','F#','G','Ab','A','Bb','B'];
const DEG = {0:'I',1:'bII',2:'II',3:'bIII',4:'III',5:'IV',6:'#IV',7:'V',8:'bVI',9:'VI',10:'bVII',11:'VII'};

export const idx = n => { const i = SH.indexOf(n); return i < 0 ? FL.indexOf(n) : i; };

/** Tono base de una canción ("Ab", "Dm"). */
export const baseKey = song => ((song.tono || '').match(/^[A-G][#b]?m?/) || ['C'])[0];

/** Tono resultante de transponer `song` `sh` semitonos, escrito con # o b según la tonalidad. */
export function keyAt(song, sh) {
  const k = baseKey(song), m = k.endsWith('m') ? 'm' : '', r = k.replace(/m$/, '');
  const i = (idx(r) + sh + 120) % 12;
  return (FLATKEYS.includes(FL[i] + m) ? FL[i] : SH[i]) + m;
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
 */
export function transposer(song, sh, not) {
  const key = keyAt(song, sh), flat = FLATKEYS.includes(key), tonic = idx(key.replace(/m$/, ''));
  const note = n => {
    const i = idx(n); if (i < 0) return n;
    let o = (flat ? FL : SH)[(i + sh + 120) % 12];
    if (not === 1) o = LAT[o[0]] + o.slice(1);
    return o;
  };
  const chord = c => {
    if (not === 2) {
      return c.replace(/^([(\[]*)([A-G][#b]?)([^/\])]*)/, (m, p, r, q) => {
        let d = degOf(FL[(idx(r) + sh + 120) % 12], tonic);
        if (/^m(?!aj)/.test(q)) { d = d.replace(/[IV]+/, x => x.toLowerCase()); q = q.slice(1); }
        return p + d + q;
      }).replace(/\/([A-G][#b]?)/, (m, r) => '/' + degOf(FL[(idx(r) + sh + 120) % 12], tonic));
    }
    return c.replace(/^([(\[]*)([A-G][#b]?)/, (m, p, r) => p + note(r)).replace(/\/([A-G][#b]?)/, (m, r) => '/' + note(r));
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
