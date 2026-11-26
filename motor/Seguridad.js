// PIN de director (4 dígitos, hash con sal) y verificación de admins (Google Sign-In).

const MAX_INTENTOS = 5, BLOQUEO_SEG = 10 * 60;

function hashPin_(pin, sal) {
  const b = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, sal + ':' + pin, Utilities.Charset.UTF_8);
  return b.map(x => ((x + 256) % 256).toString(16).padStart(2, '0')).join('');
}
function nuevaClave_(pin) {
  if (!/^\d{4}$/.test(String(pin || ''))) throw apiError_('La clave tiene que ser de 4 números.', 'formato');
  const sal = Utilities.getUuid().replace(/-/g, '').slice(0, 16);
  return sal + ':' + hashPin_(pin, sal);
}

/** Verifica el PIN de una reunión. 5 intentos fallidos → bloqueo de 10 minutos por reunión. */
function verificarPin_(ig, r, pin) {
  const c = CacheService.getScriptCache(), kb = 'blq:' + ig.rootId + ':' + r.id, kn = 'int:' + ig.rootId + ':' + r.id;
  const hasta = +(c.get(kb) || 0);
  if (hasta > Date.now()) {
    throw apiError_('Demasiados intentos. Probá de nuevo en ' + Math.ceil((hasta - Date.now()) / 60000) + ' min.', 'bloqueo');
  }
  const [sal, hash] = String(r.clave).split(':');
  if (/^\d{4}$/.test(String(pin || '')) && hash && hashPin_(pin, sal) === hash) { c.remove(kn); return; }
  const n = +(c.get(kn) || 0) + 1;
  if (n >= MAX_INTENTOS) {
    c.put(kb, String(Date.now() + BLOQUEO_SEG * 1000), BLOQUEO_SEG); c.remove(kn);
    throw apiError_('Demasiados intentos. Bloqueada por 10 min.', 'bloqueo');
  }
  c.put(kn, String(n), BLOQUEO_SEG);
  throw apiError_('Clave incorrecta.', 'clave');
}

/** Verifica un ID token de Google y que el email sea admin de la iglesia. Devuelve el email. */
function verificarAdmin_(ig, idToken) {
  if (!idToken) throw apiError_('Esta acción necesita ingresar con Google como admin.', 'admin');
  const r = UrlFetchApp.fetch('https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(idToken), { muteHttpExceptions: true });
  if (r.getResponseCode() !== 200) throw apiError_('El ingreso con Google no es válido o venció.', 'admin');
  const t = JSON.parse(r.getContentText());
  const clientId = PropertiesService.getScriptProperties().getProperty('GOOGLE_CLIENT_ID');
  if (!clientId || t.aud !== clientId) throw apiError_('El ingreso con Google no corresponde a esta app.', 'admin');
  if (t.email_verified !== 'true' && t.email_verified !== true) throw apiError_('El email de Google no está verificado.', 'admin');
  const email = String(t.email).toLowerCase();
  if ((ig.admins || []).map(a => a.toLowerCase()).indexOf(email) < 0) throw apiError_('Esta cuenta no es admin de esta iglesia.', 'admin');
  return email;
}
