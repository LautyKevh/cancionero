// Pruebas del cálculo de tonos por parte (js/music.js → tonosDelItem). Casos de SPEC §7.
// Correr:  node pruebas/tonos.test.mjs [cancionero.json]
// Con un cancionero completo (respuesta de a=canciones del motor), además compara la secuencia de
// tonos con tonosTocados_ de motor/Tonos.js en todas las canciones modulantes, con arreglos al azar.
import fs from 'node:fs';
import vm from 'node:vm';
import { tonosDelItem, transposer, keyAt } from '../js/music.js';
import { blocksOf, defArr, contenidoDe, variantesDe } from '../js/songs.js';

const dir = new URL('.', import.meta.url);
const SONGS = JSON.parse(fs.readFileSync(new URL('canciones-prueba.json', dir), 'utf8'));
let fallas = 0, ok = 0;
const igual = (a, b, msg) => {
  const x = JSON.stringify(a), y = JSON.stringify(b);
  if (x === y) ok++; else { fallas++; console.log('✗ ' + msg + '\n    esperado ' + y + '\n    obtenido ' + x); }
};

// Motor (Apps Script) cargado en Node, para comparar con lo que anota el Registro.
const ctx = {}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(new URL('../motor/Tonos.js', dir), 'utf8') + ';this.tonosTocados_ = tonosTocados_;', ctx);
const motor = (item, songs) => ctx.tonosTocados_(JSON.parse(JSON.stringify(item)), songs).map(x => x.tonos);

/** Arreglo base con el tono de cada parte que no es transición. */
const conTonos = (s, tonos) => { let k = 0; return defArr(s).map(e => {
  const b = blocksOf(s)[e.src]; return b && b.sec && b.sec.transicion ? e : { ...e, tono: tonos[k++] }; }); };
const tonosPartes = r => r.partes.filter(p => !p.transicion).map(p => p.tono);
const parte = (r, s, re) => r.partes.find(p => re.test(blocksOf(s)[p.src].label));
/** Acordes puente de la parte (entre paréntesis), transportados como los mostraría la vista; null si se ocultan. */
const puente = (r, s, re) => {
  const p = parte(r, s, re), l = blocksOf(s)[p.src].lines.find(x => x.puente);
  if (!l || !p.puente.ver) return null;
  const T = transposer({ tono: p.puente.escrito }, p.puente.sh, 0);
  const cs = l.segs.map(x => x[0]).filter(Boolean), k = cs.findIndex(c => c.startsWith('('));
  // Sin transporte (sh = 0), tal como está escrito.
  return cs.slice(k).map(c => c === '-' || !p.puente.sh ? c : T.chord(c)).join(' ').replace('( ', '(');
};

// ---------- "Hay poder [G-Ab-A-Bb-C]" ----------
{
  const s = SONGS['hay-poder-2'], songs = { [s.id]: s }, base = { id: s.id, quien: 'X' };
  // Modulante, original
  let item = { ...base, tono: 'G', arr: defArr(s) }, r = tonosDelItem(item, songs);
  igual(tonosPartes(r), ['G', 'Ab', 'A', 'Bb', 'Bb', 'C'], 'Hay poder original: tonos por parte');
  igual(r.secuencias[0].tonos, ['G', 'Ab', 'A', 'Bb', 'C'], 'Hay poder original: registro');
  igual(motor(item, songs), [r.secuencias[0].tonos], 'Hay poder original: igual que el motor');
  igual([/1er/, /ESTROFA 1/, /2da/, /3ra/].map(re => puente(r, s, re)), ['(Eb)', '(E)', '(F)', '(G)'], 'Hay poder original: puentes tal como están escritos');
  igual(parte(r, s, /ESTROFA 2/).puente.ver, false, 'Hay poder original: sin puente entre Estrofa 2 y Coro 3ª');
  igual(r.partes.map(p => p.indicador && p.indicador.texto).filter(Boolean), ['↑ Ab (+½)', '↑ A (+½)', '↑ Bb (+½)', '↑ C (+1)'], 'Hay poder original: indicadores');

  // Modulante con solo 2 subidas: G, =, =, +½, =, +½
  item = { ...base, tono: 'G', arr: conTonos(s, ['G', 'G', 'G', 'Ab', 'Ab', 'A']) }; r = tonosDelItem(item, songs);
  igual(tonosPartes(r), ['G', 'G', 'G', 'Ab', 'Ab', 'A'], 'Hay poder 2 subidas: tonos por parte');
  igual([parte(r, s, /1er/).puente.ver, parte(r, s, /ESTROFA 1/).puente.ver], [false, false], 'Hay poder 2 subidas: puentes de Coro 1ª y Estrofa 1 ocultos');
  igual(puente(r, s, /2da/), '(Eb)', 'Hay poder 2 subidas: puente de Coro 2ª (F) → (Eb)');
  igual(puente(r, s, /3ra/), '(E)', 'Hay poder 2 subidas: puente de Coro 3ª (G) → (E)');
  igual(r.secuencias[0].tonos, ['G', 'Ab', 'A'], 'Hay poder 2 subidas: registro');
  igual(motor(item, songs), [r.secuencias[0].tonos], 'Hay poder 2 subidas: igual que el motor');
  item.arr = item.arr.map((e, i) => i === 0 ? { ...e, mostrar: true } : e); r = tonosDelItem(item, songs);
  igual(puente(r, s, /1er/), '(D)', 'Hay poder 2 subidas: "Mostrar igual" muestra el puente de Coro 1ª, (Eb) para ir a G → (D)');

  // Un solo tono (G)
  item = { ...base, tono: 'G', modulante: false, arr: defArr(s) }; r = tonosDelItem(item, songs);
  igual(tonosPartes(r), ['G', 'G', 'G', 'G', 'G', 'G'], 'Hay poder un solo tono: todo en G');
  igual(r.partes.some(p => p.puente.ver), false, 'Hay poder un solo tono: puentes ocultos');
  igual(r.partes.map(p => p.sh), [0, -1, -2, -3, -3, -5], 'Hay poder un solo tono: transporte de cada parte a G');
  igual(r.secuencias[0].tonos, ['G'], 'Hay poder un solo tono: registro');
  igual(motor(item, songs), [r.secuencias[0].tonos], 'Hay poder un solo tono: igual que el motor');
}

// ---------- "Al estar aquí [F# - A]" ----------
{
  const s = SONGS['al-estar-aqui'], songs = { [s.id]: s }, base = { id: s.id, quien: 'X' };
  const inter = r => r.partes.find(p => p.transicion);
  // Modulante, original
  let item = { ...base, tono: 'F#', arr: defArr(s) }, r = tonosDelItem(item, songs);
  igual(r.secuencias[0].tonos, ['F#', 'A', 'F#', 'A', 'F#'], 'Al estar aquí original: registro');
  igual(motor(item, songs), [r.secuencias[0].tonos], 'Al estar aquí original: igual que el motor');
  igual(puente(r, s, /^Verso 1$/), '(D/F# - E/Ab)', 'Al estar aquí original: puente del Verso 1 tal como está escrito');
  igual([inter(r).ver, inter(r).sh], [true, 0], 'Al estar aquí original: "Inter para subir a A" con sus acordes originales');
  igual(parte(r, s, /^Verso 2$/).indicador.texto, '↑ A (+1½)', 'Al estar aquí original: "↑ A (+1½)" en el Verso 2');
  igual(parte(r, s, /^Final$/).indicador.texto, '↓ F# (−1½)', 'Al estar aquí original: "↓ F# (−1½)" al entrar al Final');

  // Un solo tono (F#)
  item = { ...base, tono: 'F#', modulante: false, arr: defArr(s) }; r = tonosDelItem(item, songs);
  igual([...new Set(tonosPartes(r))], ['F#'], 'Al estar aquí un solo tono: todo en F#');
  igual([inter(r).ver, puente(r, s, /^Verso 1$/)], [false, null], 'Al estar aquí un solo tono: Inter y puente ocultos');
  igual(r.secuencias[0].tonos, ['F#'], 'Al estar aquí un solo tono: registro');
  igual(motor(item, songs), [r.secuencias[0].tonos], 'Al estar aquí un solo tono: igual que el motor');
  item.arr = item.arr.map(e => (blocksOf(s)[e.src].sec || {}).transicion ? { ...e, mostrar: true } : e); r = tonosDelItem(item, songs);
  igual(inter(r).ver, true, 'Al estar aquí un solo tono: "Mostrar igual" muestra la Inter');

  // Modulante, inicio en G (+½)
  item = { ...base, tono: 'G', arr: defArr(s) }; r = tonosDelItem(item, songs);
  igual(r.secuencias[0].tonos, ['G', 'Bb', 'G', 'Bb', 'G'], 'Al estar aquí en G: registro');
  igual(motor(item, songs), [r.secuencias[0].tonos], 'Al estar aquí en G: igual que el motor');
  igual(puente(r, s, /^Verso 1$/), '(Eb/G - F/A)', 'Al estar aquí en G: puente del Verso 1 → (Eb/G - F/A)');
  igual([inter(r).tono, inter(r).sh], ['Bb', 1], 'Al estar aquí en G: Inter transportada al destino Bb');
}

// ---------- Medley ----------
{
  const a = SONGS['hay-poder-2'], b = SONGS['al-estar-aqui'], songs = { [a.id]: a, [b.id]: b };
  const item = { tipo: 'medley', tono: 'G', quien: 'X', canciones: [{ id: a.id }, { id: b.id, quien: 'Y' }], arr: [] };
  const r = tonosDelItem(item, songs);
  igual(r.modulante, true, 'Medley: siempre Modulante');
  igual(r.secuencias.map(x => [x.id, x.quien]), [[a.id, 'X'], [b.id, 'Y']], 'Medley: una secuencia por canción, con quién dirigió');
  item.arr = [].concat(...[a, b].map(s => defArr(s).map(e => ({ ...e, cancion: s.id }))));
  igual(motor(item, songs), r.secuencias.map(x => x.tonos), 'Medley: igual que el motor');
}

// ---------- [ ] (modular) y { } (repetir): "Quiero llenar" ----------
{
  const s = SONGS['quiero-llenar'], songs = { [s.id]: s }, base = { id: s.id, quien: 'X', tono: 'D' };
  const vis = r => r.partes.map(p => [p.modula.ver, p.repite.ver]);
  let r = tonosDelItem({ ...base, arr: defArr(s) }, songs);
  igual(vis(r), [[false, true], [true, false], [true, false], [true, false], [true, true]], 'Quiero llenar modulante: [ ] antes de subir, { } ocultos; en la última, los dos');
  r = tonosDelItem({ ...base, modulante: false, arr: defArr(s) }, songs);
  igual(vis(r), [[false, true], [false, true], [false, true], [false, true], [false, true]], 'Quiero llenar un solo tono: [ ] ocultos siempre (también en la última), { } visibles');
}

// ---------- # o b: sin transporte, tal como está escrito; con transporte, según el tono de destino ----------
{
  const t = (k, sh) => transposer({ tono: k }, sh, 0);
  igual([t('A', 0).key, t('A', 0).chord('Bb'), t('A', 0).chord('G#m'), t('F#', 0).key, t('F#', 0).chord('Gb/Bb')], ['A', 'Bb', 'G#m', 'F#', 'Gb/Bb'], 'Sin transporte: acordes y tono tal como están escritos');
  igual([t('E', 2).key, t('C', 6).key, t('Ab', -2).key, keyAt({ tono: 'B' }, 7)], ['F#', 'F#', 'F#', 'F#'], 'Con transporte: F#, nunca Gb');
  igual(['A', 'C#m', 'D', 'E', 'Ab', 'Bb', 'F', 'C', 'D#'].map(t('G', 2).chord).slice(), ['B', 'D#m', 'E', 'F#', 'Bb', 'C', 'G', 'D', 'F'], 'G → A: diatónicos con #, prestados con b (Bb = bII, C = bIII, F = bVI, G = bVII)');
  igual(['F', 'Bb', 'C/E', 'Eb', 'Db'].map(t('F', 1).chord), ['F#', 'B', 'C#/E#'.replace('E#', 'F'), 'E', 'D'], 'F → F#: con #');
  igual(['E', 'A', 'B7', 'C#m', 'F#m'].map(t('E', 1).chord), ['F', 'Bb', 'C7', 'Dm', 'Gm'], 'E → F: con b');
}

// ---------- Bloque que solo trae "(Baja a F#)" repite el anterior con el mismo nombre ----------
{
  const s = { id: 'x', tono: 'F#', lineas: [
    { t: 'sec', v: 'Verso 1', tono: 'F#' }, { t: 'pair', segs: [['F#', 'Te adoro']] },
    { t: 'sec', v: 'Verso 2', tono: 'A' }, { t: 'ly', v: '(Sube a A)' }, { t: 'pair', segs: [['A', 'Otra letra']] },
    { t: 'sec', v: 'Verso 1', tono: 'F#' }, { t: 'ly', v: '(Baja a F#)' }, { t: 'blank' } ] };
  igual([0, 1, 2].map(i => contenidoDe(s, i).id), [0, 1, 0], 'Solo "(Baja a F#)": repite el Verso 1 anterior; los demás se muestran a sí mismos');
  // "Al estar aquí": el segundo Verso 1 trae "(Baja a F#)" y además un renglón propio, así que no es una repetición.
  const a = SONGS['al-estar-aqui'], v1 = blocksOf(a).filter(b => b.label === 'Verso 1');
  igual(contenidoDe(a, v1[1].id).id, v1[1].id, 'Al estar aquí: el segundo Verso 1 (indicación + un renglón) se muestra a sí mismo');
}

// ---------- arr vacío = versión base (app y motor iguales) ----------
{
  const a = SONGS['al-estar-aqui'], b = SONGS['hay-poder-2'], songs = { [a.id]: a, [b.id]: b };
  let item = { id: a.id, quien: 'X', tono: 'G', arr: [] };
  igual(motor(item, songs), tonosDelItem(item, songs).secuencias.map(x => x.tonos), 'arr vacío: igual que el motor');
  item = { tipo: 'medley', tono: 'A', quien: 'X', canciones: [{ id: b.id }, { id: a.id }], arr: [] };
  igual(motor(item, songs), tonosDelItem(item, songs).secuencias.map(x => x.tonos), 'Medley con arr vacío: igual que el motor');
}

// ---------- Variantes de una parte ----------
// Los coros de "Hay poder" son los mismos acordes en otro tono (con "(C - G)" de paso y un puente final que
// cambia según el destino): no son variantes.
{
  const h = SONGS['hay-poder-2'];
  const coros = blocksOf(h).filter(b => b.has && /coro/i.test(b.label));
  igual(coros.map(b => variantesDe(h, b.id).length), coros.map(() => 0), 'Hay poder: los coros en otro tono no son variantes');
}

// ---------- Comparación con el motor en todo el cancionero (opcional) ----------
if (process.argv[2]) {
  let todo = JSON.parse(fs.readFileSync(process.argv[2], 'utf8')); todo = todo.data || todo;
  const by = Object.fromEntries(todo.map(s => [s.id, s]));
  const TON = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
  let n = 0, dif = 0, rnd = 1;
  const azar = () => (rnd = (rnd * 16807) % 2147483647) / 2147483647;
  todo.filter(s => s.modulante).forEach(s => {
    for (let v = 0; v < 20; v++) {
      const arr = defArr(s).map(e => azar() < .3 ? { ...e, tono: TON[Math.floor(azar() * 12)] } : e).filter(() => azar() < .9);
      const item = { id: s.id, quien: 'X', tono: TON[Math.floor(azar() * 12)], modulante: v % 5 ? undefined : false, arr };
      const x = tonosDelItem(item, by).secuencias.map(q => q.tonos), y = motor(item, by);
      n++; if (JSON.stringify(x) !== JSON.stringify(y)) { dif++; if (dif <= 5) console.log('≠ motor', s.id, JSON.stringify(x), JSON.stringify(y)); }
    }
  });
  igual(dif, 0, `Cancionero completo: ${n} arreglos al azar iguales al motor`);
  console.log(`(${n} arreglos al azar comparados con el motor)`);
}

console.log(`${ok} pruebas bien, ${fallas} fallas`);
process.exit(fallas ? 1 : 0);
