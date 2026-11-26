// DataSource contra el motor de Apps Script. Misma interfaz que LocalDataSource.
// Lecturas: red primero y copia en localStorage para usar sin conexión.
// Escrituras: requieren conexión; la clave se verifica en el servidor.
import { ClaveError } from './datasource.js';

const CLAVE_CODES = ['clave', 'bloqueo', 'formato', 'no-existe'];

export class ApiDataSource {
  constructor({ url, iglesia }) {
    this.url = url; this.c = iglesia; this.P = 'cancionero:api:' + iglesia + ':';
    this.songs = null; this.updatedAt = this._read('at', null); this.online = navigator.onLine;
  }

  _read(k, def) { try { const v = localStorage.getItem(this.P + k); return v == null ? def : JSON.parse(v); } catch (e) { return def; } }
  _write(k, v) { try { localStorage.setItem(this.P + k, JSON.stringify(v)); } catch (e) { /* lleno o bloqueado */ } }

  async _get(a, extra = {}) {
    const q = new URLSearchParams({ c: this.c, a, ...extra });
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
      const r = await fetch(this.url, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ c: this.c, a, ...body }), redirect: 'follow' });
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
  async checkClave(id, clave) { await this._post('verificarClave', { id, clave }); }
  updateReunion(id, cambios, clave) {
    const { nombre, fecha, director, canciones } = cambios;
    return this._post('editarReunion', { id, clave, cambios: { nombre, fecha, director, canciones } });
  }
  async deleteReunion(id, clave) { await this._post('borrarReunion', { id, clave }); }
  registrarUso(id, clave) { return this._post('registrarUso', { id, clave }); }

  status() { return { online: this.online && navigator.onLine, updatedAt: this.updatedAt, source: 'motor' }; }
  async refresh() { this.songs = null; await this.getSongs(); }
}
