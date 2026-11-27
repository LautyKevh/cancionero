// Configuración pública de la PWA (sin secretos: las URL de Web App son públicas por diseño).
// - Rama desarrollo → motor "prueba".  Rama estable → motor "estable".
// - La iglesia se toma de ?c=<id de carpeta raíz>; si no hay, se usa `iglesia` de acá.
// - Sin iglesia, o con ?demo=1, la app funciona en modo demo (datos simulados en el teléfono).
export const CONFIG = {
  entorno: 'prueba',
  motor: {
    prueba: 'https://script.google.com/macros/s/AKfycbwTr_TJAMkMLbJYjT733HQgMdeia74ChuPxnk8FHCm-fPZe77me3drkaZ6Kv5U0c7hCtw/exec',
    estable: 'https://script.google.com/macros/s/AKfycbxsSFMZtkk1DFfDCW0hXq9hD53FsJ_JRwdIMR4KqmQM_2Rrt-F93HcF63K6KPu5LL4aaw/exec',
  },
  // ID de cliente OAuth (público) para "Ingresar como administrador" en Ajustes. Vacío = sin ingreso.
  googleClientId: '926061150112-trehviof2ot7cs8bfbn2blnbck934cl5.apps.googleusercontent.com',
  iglesia: '1BjV_7ZrAKoO0IW6F92YGLj8bGyMfjDnc', // carpeta "Cancionero PRUEBA" (copia de la planilla de IBSI)
};
