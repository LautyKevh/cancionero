// Capa de datos. La UI solo habla con un objeto que cumple esta interfaz:
//
//   getSongs()                     → Promise<Song[]>
//   getRegistro()                  → Promise<{f,id,t,q}[]>     (f = AAAA-MM-DD o '')
//   getPersonas()                  → Promise<string[]>
//   addPersona(nombre)             → Promise<string>            (nombre normalizado)
//   listReuniones()                → Promise<Reunion[]>         (sin clave ni hash)
//   createReunion({nombre,fecha,director,clave}) → Promise<Reunion>
//   checkClave(id, clave)          → Promise<void>              (lanza ClaveError)
//   updateReunion(id, cambios, clave) → Promise<Reunion>
//   deleteReunion(id, clave)       → Promise<void>              (borrado lógico)
//   status()                       → {online:boolean, updatedAt:number|null, source:string}
//   refresh()                      → Promise<void>
//
// Fase 2: AppsScriptDataSource implementa lo mismo con fetch() a doGet/doPost.

export class ClaveError extends Error {
  constructor(msg, code) { super(msg); this.code = code; }
}

const P = 'cancionero:v1:';
const read = (k, def) => { try { const v = localStorage.getItem(P + k); return v == null ? def : JSON.parse(v); } catch (e) { return def; } };
const write = (k, v) => { try { localStorage.setItem(P + k, JSON.stringify(v)); } catch (e) { /* almacenamiento no disponible */ } };

async function hashClave(clave, sal) {
  const data = new TextEncoder().encode(sal + ':' + clave);
  if (crypto.subtle) {
    const buf = await crypto.subtle.digest('SHA-256', data);
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
  }
  // Contexto no seguro (http en red local): hash simple solo para el modo demo.
  let h = 5381; for (const b of data) h = ((h << 5) + h + b) | 0; return 'd' + (h >>> 0).toString(16);
}
const newSal = () => Math.random().toString(36).slice(2, 10);
const strip = r => { const { hash, sal, ...pub } = r; return structuredClone(pub); };

const MAX_TRIES = 5, LOCK_MS = 10 * 60 * 1000;

export class LocalDataSource {
  constructor({ seedUrl = 'data/songs.json', seedFn } = {}) {
    this.seedUrl = seedUrl; this.seedFn = seedFn; this.songs = null;
  }

  async getSongs() {
    if (this.songs) return this.songs;
    try {
      const r = await fetch(this.seedUrl);
      if (!r.ok) throw new Error(r.status);
      this.songs = await r.json();
      write('songsAt', Date.now());
    } catch (e) {
      this.songs = read('songsCache', null);
      if (!this.songs) throw new Error('No se pudieron cargar las canciones.');
    }
    write('songsCache', this.songs);
    const d = read('datosCanciones', {});
    this.songs = this.songs.map(s => d[s.id] ? { ...s, ...d[s.id].v, datosCambios: d[s.id].cambios } : s);
    await this._seed();
    return this.songs;
  }

  async _seed() {
    if (read('seeded', false) || !this.seedFn) return;
    const { reuniones, registro } = this.seedFn(this.songs);
    const out = [];
    for (const r of reuniones) {
      const sal = newSal();
      const { clave, ...rest } = r;
      out.push({ ...rest, sal, hash: await hashClave(clave, sal) });
    }
    write('reuniones', out); write('registro', registro); write('seeded', true);
  }

  async getRegistro() { return read('registro', []); }

  async getPersonas() {
    const base = ['Camilo', 'Carla', 'Enoc', 'Isaac', 'Kelly', 'Raquel', 'Virgi'];
    const extra = read('personas', []);
    return [...base, ...extra.filter(n => !base.includes(n))];
  }

  async addPersona(n) {
    n = String(n || '').trim(); if (!n) return '';
    const all = await this.getPersonas(), f = all.find(p => p.toLowerCase() === n.toLowerCase());
    if (f) return f;
    write('personas', [...read('personas', []), n]); return n;
  }

  _all() { return read('reuniones', []); }
  _save(list) { write('reuniones', list); }

  async listReuniones() { return this._all().filter(r => !r.borrada).map(strip); }

  async createReunion({ nombre, fecha, director, clave }) {
    if (!/^\d{4}$/.test(clave)) throw new ClaveError('La clave tiene que ser de 4 números.', 'formato');
    const sal = newSal();
    const r = { id: 'r' + Date.now().toString(36), nombre, fecha, director, canciones: [], sal, hash: await hashClave(clave, sal) };
    await this.addPersona(director);
    this._save([r, ...this._all()]);
    return strip(r);
  }

  async checkClave(id, clave) {
    const locks = read('locks', {}), L = locks[id] || { n: 0, until: 0 };
    if (L.until > Date.now()) {
      const min = Math.ceil((L.until - Date.now()) / 60000);
      throw new ClaveError(`Demasiados intentos. Probá de nuevo en ${min} min.`, 'bloqueo');
    }
    const r = this._all().find(x => x.id === id && !x.borrada);
    if (!r) throw new ClaveError('La reunión ya no existe.', 'no-existe');
    if (await hashClave(clave, r.sal) !== r.hash) {
      L.n++; if (L.n >= MAX_TRIES) { L.until = Date.now() + LOCK_MS; L.n = 0; }
      locks[id] = L; write('locks', locks);
      throw new ClaveError(L.until > Date.now() ? 'Demasiados intentos. Bloqueada por 10 min.' : 'Clave incorrecta.', 'clave');
    }
    delete locks[id]; write('locks', locks);
  }

  async updateReunion(id, cambios, clave) {
    await this.checkClave(id, clave);
    const list = this._all(), i = list.findIndex(x => x.id === id);
    const { id: _i, hash, sal, ...ok } = cambios;
    Object.keys(ok).forEach(k => ok[k] === undefined && delete ok[k]);
    if (ok.fecha && ok.fecha !== list[i].fecha) {
      const otra = list.find(x => !x.borrada && x.id !== id && x.fecha === ok.fecha);
      if (otra) throw new ClaveError(`Ya hay una reunión ese día (“${otra.nombre}”). No se cambió la fecha.`, 'fecha-ocupada');
    }
    list[i] = { ...list[i], ...structuredClone(ok) };
    for (const c of list[i].canciones || []) if (c.quien) await this.addPersona(c.quien);
    this._save(list);
    return strip(list[i]);
  }

  /** Músicos, sin clave: otra variante de una parte (en el demo, por posición del ítem y de la parte). */
  async elegirVariante({ id, i, k, src, label }) {
    const list = this._all(), r = list.find(x => x.id === id && !x.borrada), p = r && r.canciones[i] && (r.canciones[i].arr || [])[k];
    if (!p) throw new ClaveError('Esa parte ya no está en la reunión. Recargá.', 'no-existe');
    const de = p.variante ? p.variante.de : p.src;
    p.src = src; p.label = label; if (src === de) delete p.variante; else p.variante = { de, fecha: new Date().toISOString() };
    this._save(list); return structuredClone(p);
  }

  /**
   * Músicos, sin clave: acordes de una parte (lineas null = volver a la base). En el demo, por posición; `base` es el
   * arreglo base con pids, para un ítem guardado sin arreglo (igual que el motor).
   */
  async editarAcordes({ id, i, k, lineas, quien, base }) {
    const list = this._all(), r = list.find(x => x.id === id && !x.borrada), it = r && r.canciones[i];
    if (it && !(it.arr || []).length && base) it.arr = structuredClone(base);
    const p = it && (it.arr || [])[k];
    if (!p) throw new ClaveError('Esa parte ya no está en la reunión. Recargá.', 'no-existe');
    const fecha = new Date().toISOString();
    p.cambios = [{ quien: p.editado ? p.editado.quien : '', fecha: p.editado ? p.editado.fecha : '', lineas: p.lineas ?? null }].concat(p.cambios || []).slice(0, 30);
    if (lineas == null) delete p.lineas; else p.lineas = structuredClone(lineas);
    p.editado = { fecha };
    this._save(list); return structuredClone(p);
  }

  /** Músicos, sin clave: intérprete, tono original y BPM (igual que el motor: historial con quién y cuándo). */
  async editarDatos({ cancion, campos, idToken }) {
    const s = (this.songs || []).find(x => x.id === cancion); if (!s) throw new Error('No existe esa canción.');
    const d = read('datosCanciones', {}), x = d[cancion] || { v: {}, cambios: [] }, fecha = new Date().toISOString();
    for (const c of ['interprete', 'tonoOriginal', 'bpm']) {
      if (!campos || !(c in campos)) continue;
      let v = campos[c];
      if (c === 'bpm') { v = v === '' || v == null ? null : Math.round(+v); if (v != null && !(v >= 20 && v <= 400)) throw new Error('BPM inválido (20 a 400).'); }
      else v = String(v ?? '').trim().slice(0, 80);
      const antes = s[c] == null || s[c] === '-' ? (c === 'bpm' ? null : '') : s[c];
      if (v === antes) continue;
      if (antes !== '' && antes != null && !idToken) throw new Error('Ese dato ya está cargado: solo el admin lo puede cambiar.');
      x.v[c] = v; x.cambios = [{ campo: c, antes, despues: v, fecha, admin: idToken ? 'admin' : null }].concat(x.cambios).slice(0, 30);
      s[c] = v;
    }
    s.datosCambios = x.cambios; d[cancion] = x; write('datosCanciones', d);
    return structuredClone(s);
  }

  async deleteReunion(id, clave) {
    await this.checkClave(id, clave);
    const list = this._all(), r = list.find(x => x.id === id);
    r.borrada = Date.now(); // papelera: borrado lógico
    this._save(list);
  }

  status() { return { online: navigator.onLine, updatedAt: read('songsAt', null), source: 'demo' }; }

  async refresh() { this.songs = null; await this.getSongs(); }
}
