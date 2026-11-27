// Registro maestro de iglesias (multi-tenant), guardado en Script Properties del proyecto
// (cuenta dueña del motor). Clave = id de la carpeta raíz de cada iglesia.
//
//   { "<rootId>": { nombre, planillaId, letrasId, datosId, admins: [email], version } }
//
// El motor solo opera sobre iglesias registradas acá y cuya carpeta raíz la cuenta dueña puede abrir.

const IBSI = {
  rootId: '1-UJSGbhH7vfbSYpiOoygZ-R4e7MECFcD',
  planillaId: '1ocmmf1kmCtG7QJgUsnsxgl97w0ZECOJirydW1BuiwCU',
};

function iglesias_() {
  try { return JSON.parse(PropertiesService.getScriptProperties().getProperty('IGLESIAS') || '{}'); }
  catch (e) { return {}; }
}
function guardarIglesias_(m) { PropertiesService.getScriptProperties().setProperty('IGLESIAS', JSON.stringify(m)); }

/** Devuelve la config de una iglesia o lanza un error de API. */
function iglesia_(rootId) {
  const ig = iglesias_()[rootId];
  if (!rootId || !ig) throw apiError_('Iglesia no registrada en el motor.', 'iglesia');
  try { DriveApp.getFolderById(rootId).getName(); }
  catch (e) { throw apiError_('El motor no tiene acceso a la carpeta de esta iglesia. Compartila con la cuenta del motor como editor.', 'acceso'); }
  ig.rootId = rootId;
  return ig;
}

function registrarIglesia_(rootId, datos) {
  const m = iglesias_();
  m[rootId] = Object.assign({}, m[rootId] || {}, datos);
  guardarIglesias_(m);
  return m[rootId];
}

function buscarSubcarpeta_(root, nombre) {
  const it = root.getFoldersByName(nombre);
  return it.hasNext() ? it.next() : null;
}

/**
 * Crea (si no existe) la iglesia de PRUEBA en el Drive de la cuenta dueña:
 *   Mi unidad / Cancionero PRUEBA / { copia de la planilla de IBSI, Datos/ }
 * Los Word se LEEN de "Letra y Acordes" de IBSI (no se copian ni se modifican).
 * Correr a mano desde el editor de Apps Script.
 */
function crearIglesiaPrueba() {
  const nombre = 'Cancionero PRUEBA';
  const it = DriveApp.getRootFolder().getFoldersByName(nombre);
  const root = it.hasNext() ? it.next() : DriveApp.getRootFolder().createFolder(nombre);

  let planilla = root.getFilesByType(MimeType.GOOGLE_SHEETS);
  planilla = planilla.hasNext() ? planilla.next()
    : DriveApp.getFileById(IBSI.planillaId).makeCopy('Cancionero PRUEBA (copia de IBSI)', root);

  const datos = buscarSubcarpeta_(root, 'Datos') || root.createFolder('Datos');
  const letras = buscarSubcarpeta_(DriveApp.getFolderById(IBSI.rootId), 'Letra y Acordes');
  if (!letras) throw new Error('No encontré la carpeta "Letra y Acordes" de IBSI.');

  const ig = registrarIglesia_(root.getId(), {
    nombre: 'PRUEBA (copia de IBSI)', planillaId: planilla.getId(), letrasId: letras.getId(),
    datosId: datos.getId(), admins: [Session.getEffectiveUser().getEmail()], version: '1', prueba: true,
    // la planilla es una copia descartable: no hace falta respaldarla antes de escribir
    respaldada: true,
  });
  Logger.log('Iglesia de prueba lista. Id (parámetro ?c=): ' + root.getId());
  Logger.log(JSON.stringify(ig, null, 2));
  return root.getId();
}

/**
 * Registra IBSI MAS (datos reales). NO correr hasta pasar a estable.
 * Solo crea Datos/ en la raíz; el respaldo de la planilla se hace antes de la primera escritura.
 */
function registrarIBSI() {
  const root = DriveApp.getFolderById(IBSI.rootId);
  const datos = buscarSubcarpeta_(root, 'Datos') || root.createFolder('Datos');
  const letras = buscarSubcarpeta_(root, 'Letra y Acordes');
  const ig = registrarIglesia_(IBSI.rootId, {
    nombre: 'IBSI MAS', planillaId: IBSI.planillaId, letrasId: letras && letras.getId(), datosId: datos.getId(),
    admins: ['adoracion.ibsi@gmail.com', Session.getEffectiveUser().getEmail()], version: '1', prueba: false,
  });
  Logger.log(JSON.stringify(ig, null, 2));
}

/** Para configurar el Client ID de Google Sign-In (acciones de admin). */
function configurarClientId(clientId) {
  PropertiesService.getScriptProperties().setProperty('GOOGLE_CLIENT_ID', clientId);
}

function verIglesias() { Logger.log(JSON.stringify(iglesias_(), null, 2)); }

// ---------- Registro diario automático ----------
/** Lo corre el activador diario: anota en Registro las reuniones ya pasadas de todas las iglesias. */
function anotarReunionesPasadas() {
  const m = iglesias_();
  Object.keys(m).forEach(root => { try { anotarPasadas_(iglesia_(root)); } catch (e) { console.error(root, e && e.stack || e); } });
}

/** Correr UNA vez desde el editor: crea el activador diario (3 a 4 de la mañana). Repetirlo no duplica. */
function activarRegistroDiario() {
  ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === 'anotarReunionesPasadas').forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('anotarReunionesPasadas').timeBased().everyDays(1).atHour(3).create();
  Logger.log('Listo: todos los días entre las 3 y las 4 se anotan las reuniones del día anterior.');
}
