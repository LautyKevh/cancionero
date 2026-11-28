// DataSource contra el motor de Apps Script. Misma interfaz que LocalDataSource.
// Lecturas: red primero y copia en localStorage para usar sin conexión.
// Escrituras: requieren conexión; la clave se verifica en el servidor.
import { ClaveError } from './datasource.js';

const CLAVE_CODES = ['clave', 'bloqueo', 'formato', 'no-existe'];

const auth = c => c && typeof c === 'object' ? { idToken: c.idToken } : { clave: c };

export class ApiDataSource {
  constructor({ url, iglesia }) {
    this.url = url; this.c = iglesia; this.P = 'cancionero:api:' + iglesia + ':';
    this.songs = null; this.updatedAt = this._read('at', null); this.online = navigator.onLine;
  }

  _read(k, def) { try { const v = localStorage.getItem(this.P + k); return v == null ? def : JSON.parse(v); } catch (e) { return def; } }
  _write(k, v) { try { localStorage.setItem(this.P + k, JSON.stringify(v)); } catch (e) { /* lleno o bloqueado */ } }

  async _get(a, extra = {}) {
    const q = new URLSearchParams({ iglesia: this.c, a, ...extra });
    try {
      const r = await fetch(this.url + '?' + q, { redirect: 'follow' });
      const j = await r.json();
      if (!j.ok) throw Object.assign(new Error(j.error), { code: j.code, server: true });
      this.online = true; this._write(a, j.data); return j.data;
    } catch (e) {
      if (e.server) throw e;
      this.online = false;
      const cached = this._read(a, undefined);
      if (cached === undefined) throw new Error('Sin conexión y sin datos guardados en este teléfono.');
      return cached;
    }
  }

  async _post(a, body) {
    if (!navigator.onLine) throw new ClaveError('Para guardar cambios hace falta conexión.', 'offline');
    let j;
    try {
      // text/plain evita el preflight de CORS (Apps Script no responde OPTIONS)
      const r = await fetch(this.url, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ iglesia: this.c, a, ...body }), redirect: 'follow' });
      j = await r.json();
    } catch (e) { throw new ClaveError('No se pudo conectar con el servidor. Probá de nuevo.', 'red'); }
    if (!j.ok) throw CLAVE_CODES.includes(j.code) ? new ClaveError(j.error, j.code) : new Error(j.error);
    return j.data;
  }

  async getSongs() {
    if (this.songs) return this.songs;
    this.songs = await this._get('canciones');
    if (this.online) { this.updatedAt = Date.now(); this._write('at', this.updatedAt); }
    return this.songs;
  }
  getRegistro() { return this._get('historial'); }
  getPersonas() { return this._get('personas'); }
  listReuniones() { return this._get('reuniones'); }

  // Los nombres nuevos se agregan en el servidor al guardar la reunión.
  async addPersona(n) { return String(n || '').trim(); }

  createReunion({ nombre, fecha, director, clave }) { return this._post('crearReunion', { nombre, fecha, director, clave }); }
  // `clave`: los 4 números del director, o { idToken } con la sesión de admin (sin clave).
  async checkClave(id, clave) { await this._post('verificarClave', { id, ...auth(clave) }); }
  updateReunion(id, cambios, clave) {
    const { nombre, fecha, director, canciones } = cambios;
    return this._post('editarReunion', { id, ...auth(clave), cambios: { nombre, fecha, director, canciones } });
  }
  async deleteReunion(id, clave) { await this._post('borrarReunion', { id, ...auth(clave) }); }
  /** Admin: nueva clave y/o otro director; sin cambios devuelve solo el historial. → { reunion, historial } */
  adminReunion(id, idToken, { clave, director } = {}) { return this._post('adminReunion', { id, idToken, clave, director }); }
  /** Músicos, sin clave: otra variante de una parte del arreglo. Devuelve la parte guardada. */
  elegirVariante({ id, item, parte, src, label }) { return this._post('elegirVariante', { id, item, parte, src, label }); }
  /** Músicos, sin clave: acordes de una parte (lineas null = volver a la base). Devuelve la parte guardada. */
  editarAcordes({ id, item, parte, lineas }) { return this._post('editarAcordes', { id, item, parte, lineas }); }
  /** Intérprete, tono original y BPM: completar un vacío, cualquiera; cambiar uno con valor, con idToken de admin. Devuelve la canción. */
  editarDatos({ cancion, campos, idToken }) { return this._post('editarDatos', { cancion, campos, idToken }); }
  registrarUso(id, clave) { return this._post('registrarUso', { id, clave }); }

  info() { return this._get('info'); }
  /** Admin: convierte los Word de Drive (por tandas de ~4,5 min; repetir hasta completo). */
  async importar(idToken) {
    const r = await fetch(this.url, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ iglesia: this.c, a: 'importar', idToken }), redirect: 'follow' });
    const j = await r.json(); if (!j.ok) throw Object.assign(new Error(j.error), { code: j.code }); return j.data;
  }

  status() { return { online: this.online && navigator.onLine, updatedAt: this.updatedAt, source: 'motor' }; }
  async refresh() { this.songs = null; await this.getSongs(); }
}
