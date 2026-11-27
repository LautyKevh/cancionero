# Pendientes

## Para una fase posterior

### Tono por parte, Modulante, arreglo por reunión y Medley
Detalle en `referencia/SPEC.md`: §4 (roles), §5 (modelo de datos), §6 (conversión) y §7 (pantallas y casos de prueba).
- **Canción base** = Word de la iglesia. Cualquier bloque vale aunque no esté en la original.
- **Conversor:**
  - tono escrito por parte (acordes, secuencia del título, "(Sube a X)", "(Baja a X)");
  - marca Modulante y secuencia de tonos;
  - acordes puente;
  - partes de transición.
- **Admin (Ajustes → Canciones, con Google):** corrige la base (tonos por parte, transiciones, acordes de transición, posición de acordes). Las correcciones van en `Datos/correcciones.json` y se aplican después de cada reimportación.
- **Arreglo por reunión:**
  - cada ítem guarda su arreglo completo (partes con `pid` estable, orden, xN, tono por parte, Modulante, mostrar, partes nuevas con acordes a mano);
  - nunca toca la base.
- **Director (con clave):**
  - estructura;
  - interruptor "Modulante" y `=` / `+½` / `+1` / `−½` o tono absoluto por parte;
  - "+ Agregar sección";
  - parte nueva.
- **Músicos (sin clave):**
  - editan solo los acordes de una parte;
  - nombre guardado en el dispositivo;
  - historial por parte;
  - "Restaurar acordes" (base / como la última vez);
  - gana el último guardado, con LockService.
- **Al agregar una canción:** "Como la última vez" / "Versión base".
- **Puentes y transiciones:** se transportan según el tono de la parte siguiente. Se ocultan si no cambia el tono, con "Mostrar igual".
- **Medley:** mismo mecanismo; siempre Modulante.
- **Vistas:**
  - canción continua;
  - indicador "↑ A (+1½)" / "↓ F# (−1½)";
  - separador con el nombre de cada canción en los medleys;
  - ajustes personales solo locales.
- **Registro:**
  - secuencia completa de tonos más la referencia al arreglo (`reunión <id>#<pid>` en Origen);
  - "Tono última vez" muestra la secuencia.
- **Casos de prueba:** "Hay poder" y "Al estar aquí" (SPEC §7).
- **Ya hecho (Fase 2):** ítems medley guardados y validados en el motor; el registro y el historial los expanden canción por canción (hoy con un solo tono por canción, no la secuencia).

## Fase 2 (motor)
- Ingreso de administrador: falta crear el ID de cliente de OAuth en Google Cloud y cargarlo (`js/config.js` → `googleClientId` y `configurarClientId()` en el motor).
- Anclar notas sueltas a una palabra (`at`), como en la referencia de "Quién más".
- Conservar los saltos de línea dentro de un párrafo del Word (`<w:br/>`), como en "Jesucristo basta".
- Pasar a estable con los datos reales de IBSI (`registrarIBSI()`), con aprobación.
