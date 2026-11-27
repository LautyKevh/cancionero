# Pendientes

## Próximo, en orden de prioridad
Detalle en `referencia/SPEC.md` (§4, §5, §7 y §9). Todo primero en la iglesia de prueba; la planilla real de IBSI no se toca sin OK.
1. ✅ (hecho, en prueba) **Imprimir / PDF:** botón en canción y en reunión (entera, en orden). Imprime lo que se ve (tono, arreglo, Músico o Cantante), versión limpia para papel, salto de página entre canciones, diálogo del sistema ("Guardar como PDF" en el celular).
2. **Tono por parte, Modulante y Medley (interfaz):** ver "Tono por parte, Modulante, arreglo por reunión y Medley" en "Para una fase posterior" y SPEC §7.
3. **Completar datos de canciones (sin clave):** intérprete, BPM (cuenta como confirmado), tono original (de una lista; en modulantes, una por tono de la secuencia), link (solo si está vacío). Gana lo editado en la app; si el archivo trae otro valor, es conflicto en "Revisar cambios". Definir `Datos/ediciones.json`. Confirmación antes de guardar, nombre guardado en el dispositivo, historial con quién y cuándo, y "deshacer".
4. **Director edita la letra** de cualquier parte del arreglo de su reunión, con PIN. Solo esa reunión; nunca la base.
5. **"Pendientes de revisión"** (una bandeja por iglesia, admin en Ajustes):
   - "Sugerir corrección" (sin clave), con atajo "Proponer para todas las versiones" desde una reunión;
   - canción nueva (sin clave): pegar cifrado, subir archivo, sin cifrado o "pedir canción"; nombre, intérprete (o "No sé"), link, comentario; aviso de duplicados por nombre + intérprete y por letra; tono opcional en "sin cifrado"; borrador usable en reuniones;
   - revisión: antes/después para correcciones; canción nueva ya convertida y editable; aprobar o rechazar con motivo.
6. **Importación en dos botones:** "Agregar canciones nuevas" y "Revisar cambios en la carpeta" (antes/después, conflictos por parte con correcciones aprobadas, nunca aplica solo). Marca en las canciones con correcciones de la app. Sin la palabra "Word" en la interfaz.
7. **Link de la canción:** columna "Link" en Canciones; botón "▶ Escuchar" solo si hay link. La app nunca busca links.
8. **Planilla:** desplegable de B1 ("Ver tonos de:") con validación desde `Personas!A2:A`, creado por el motor. Intérpretes: "Roca firme" → Eric Bustamante; medley "Hermoso nombre" → Evangelina Crubinca (en la iglesia de prueba). En IBSI, B1 e intérpretes al pasar a estable.

## Revisar
- `anclado-en-la-roca-yahweh-2`: revisar de qué archivo sale el -2 (posible duplicado). Hoy figuran "Anclado en la roca (YAHWEH) [B]" y "[C]".
- "Inter (E B/G#m B)(…)": el bajo "G#m" no es un acorde válido, así que esa línea no se toma como título con acordes. Probable error de tipeo en el archivo.
- Confirmar en el diálogo real de impresión (compu y celular) que no salen encabezado ni pie del navegador.

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
