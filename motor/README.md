# Motor del Cancionero (Google Apps Script)

Un solo motor multi-iglesia publicado como Web App. Cada iglesia se identifica por el **id de su carpeta raíz** (`?c=<id>`) y tiene que estar registrada en el motor (Script Properties → `IGLESIAS`) y compartida con la cuenta dueña (`paisaarias@gmail.com`) como editor.

- Proyecto: `Cancionero Motor` · scriptId `1szqOM5cxJrd7Auni1vxc5gsn4U1-uOBR0_ee1_xfAZQbKRywpqiLJFJF`
  (el `.clasp.json` está en `.gitignore`; para clonarlo: `clasp clone <scriptId> --rootDir motor`).
- La Web App corre **como la cuenta dueña** y la puede usar **cualquiera** (los miembros no tienen cuenta).

## Archivos

| Archivo | Qué hace |
|---|---|
| `Api.js` | `doGet` / `doPost`: lista de acciones y formato `{ ok, data }` / `{ ok:false, error, code }` |
| `Config.js` | Registro de iglesias, `crearIglesiaPrueba()`, `registrarIBSI()`, `configurarClientId()` |
| `Store.js` | Datos/ (JSON), planilla, CacheService (lecturas) y LockService (escrituras) |
| `Seguridad.js` | PIN de 4 dígitos con hash SHA‑256 + sal, bloqueo 10 min tras 5 intentos, verificación de admin con Google |
| `Convertir.js` | Port de `referencia/convert.py`: lee el `.docx` como ZIP, sin archivos temporales |
| `Importar.js` | Word de "Letra y Acordes" → `Datos/canciones/<id>.json` + `Datos/cancionero.json` + `Datos/import-log.json` |

## Qué escribe en el Drive de la iglesia

- `Datos/` (la crea si falta): JSON de canciones, log de importación y `Respaldos/`.
- Planilla: crea la pestaña **Reuniones** y **agrega filas al final** de **Registro** y **Personas**.
  Nunca modifica ni borra filas existentes, fórmulas ni validaciones. Antes de la primera escritura
  copia la planilla a `Datos/Respaldos/` (la iglesia de prueba no se respalda: ya es una copia).

## Entornos

| Entorno | Despliegue | Iglesia | PWA |
|---|---|---|---|
| **prueba** | `AKfycbwTr_TJAMkMLbJYjT733HQgMdeia74ChuPxnk8FHCm-fPZe77me3drkaZ6Kv5U0c7hCtw` | "Cancionero PRUEBA" (copia de la planilla de IBSI, en el Drive del dueño) | rama `desarrollo` |
| **estable** | `AKfycbxsSFMZtkk1DFfDCW0hXq9hD53FsJ_JRwdIMR4KqmQM_2Rrt-F93HcF63K6KPu5LL4aaw` | IBSI MAS (datos reales; registrar con `registrarIBSI()` recién al pasar a estable) | rama `estable` |

URL de cada uno: `https://script.google.com/macros/s/<id>/exec`. Las dos están en `js/config.js`.

> El despliegue `@HEAD` (URL `/dev`) solo funciona para editores del proyecto con sesión iniciada,
> así que la PWA pública no puede usarlo. Por eso "prueba" es un despliegue versionado que se
> actualiza en cada cambio.

### Desplegar **prueba** (después de cada cambio en el motor)

```powershell
cd motor
clasp push
clasp create-deployment -i AKfycbwTr_TJAMkMLbJYjT733HQgMdeia74ChuPxnk8FHCm-fPZe77me3drkaZ6Kv5U0c7hCtw -d "prueba"
```

`-i` reemplaza la versión de ese despliegue: la URL no cambia.

### Desplegar **estable** (al cerrar una versión, ej. v1.1)

```powershell
cd motor
clasp create-version "v1.1"
clasp list-versions
clasp create-deployment -i AKfycbxsSFMZtkk1DFfDCW0hXq9hD53FsJ_JRwdIMR4KqmQM_2Rrt-F93HcF63K6KPu5LL4aaw -V <número de versión> -d "estable v1.1"
```

Para volver atrás, repetir el último comando con el número de versión anterior.

## Primera puesta en marcha (una vez, desde el editor de Apps Script)

1. `clasp open-script` → elegir la función `crearIglesiaPrueba` → **Ejecutar**. Google pide autorizar
   los permisos (Drive, Hojas, conexiones externas): aceptar con `paisaarias@gmail.com`.
   En el registro de ejecución aparece el **id de la iglesia de prueba**.
2. Ejecutar `importarPrueba` → convierte los Word y deja el resultado en `Datos/import-log.json`.
3. Poner ese id en `js/config.js` → `iglesia` (o abrir la PWA con `?c=<id>`).

## Acciones de admin (Google Sign-In)

`importar` verifica un ID token de Google (`tokeninfo`), que el `aud` sea el Client ID configurado con
`configurarClientId('<client id>')` y que el email esté en `admins` de la iglesia. Falta crear el
OAuth Client ID en Google Cloud y el botón de ingreso en Ajustes de la PWA.
