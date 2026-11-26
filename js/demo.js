// Datos simulados del modo demo (los mismos ejemplos del prototipo).
// Clave de todas las reuniones de ejemplo: 1234.
import { defArr } from './songs.js';
import { keyOption } from './music.js';

export function demoSeed(songs) {
  const by = id => songs.find(s => s.id === id);
  const mk = (id, nombre, fecha, director, list) => ({
    id, nombre, fecha, director, clave: '1234',
    canciones: list.filter(([sid]) => by(sid)).map(([sid, tono]) => ({ id: sid, tono, quien: director, arr: defArr(by(sid)) })),
  });
  const reuniones = [
    mk('ej-2510', 'Domingo 25-10-2026', '2026-10-25', 'Camilo', [['a-ti-me-rindo','G'],['alabare-anastasis','D'],['la-sangre-de-jesus','D'],['tumbas-a-jardines','C']]),
    mk('ej-0111', 'Domingo 01-11-2026', '2026-11-01', 'Raquel', [['quien-mas','F'],['alaba','G'],['rey-de-reyes','C'],['jesucristo-basta','F']]),
    mk('ej-0811', 'Domingo 08-11-2026', '2026-11-08', 'Virgi', [['a-ti-me-rindo','A'],['alaba','A'],['alabadle','A'],['rey-de-reyes','D']]),
    mk('ej-1511', 'Domingo 15-11-2026', '2026-11-15', 'Raquel', [['alabare-anastasis','Bb'],['jesucristo-basta','F'],['santo-santo-santo','Bb'],['la-sangre-de-jesus','C']]),
    mk('ej-2211', 'Domingo 22-11-2026', '2026-11-22', 'Camilo', [['quien-mas','A'],['roca-firme','Bb'],['tumbas-a-jardines','D'],['hermoso-nombre-medley','G']]),
    mk('ej-todas', 'Ejemplo · todas las canciones', '2026-12-06', 'Camilo', songs.map(s => [s.id, keyOption(s)])),
  ];
  // Reunión con orden de partes modificado (Coro primero), como en el prototipo.
  const q = by('quien-mas'), r = by('roca-firme');
  if (q && r) {
    const qa = defArr(q), ch = qa.findIndex(e => /coro/i.test(e.label));
    const qa2 = ch > 0 ? [qa[ch], ...qa.filter((_, i) => i !== ch)] : qa;
    reuniones.push({ id: 'ej1', nombre: 'Domingo 29-11-2026', fecha: '2026-11-29', director: 'Camilo', clave: '1234',
      canciones: [{ id: 'quien-mas', tono: 'G', quien: 'Camilo', arr: qa2 }, { id: 'roca-firme', tono: 'A', quien: 'Virgi', arr: defArr(r) }] });
  }
  const registro = [
    { f: '2025-08-24', id: 'tumbas-a-jardines', t: 'B', q: '' },
    { f: '2026-05-31', id: 'tumbas-a-jardines', t: 'C', q: '' },
    { f: '2026-07-12', id: 'tumbas-a-jardines', t: 'C', q: '' },
    { f: '2026-08-23', id: 'hermoso-nombre-medley', t: 'G', q: '' },
    { f: '2026-10-04', id: 'roca-firme', t: 'G', q: '' },
    { f: '', id: 'tumbas-a-jardines', t: 'D', q: 'Kelly' },
  ];
  return { reuniones, registro };
}
