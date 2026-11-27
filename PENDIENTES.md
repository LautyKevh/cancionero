# Pendientes

## Próximo, en orden de prioridad
Detalle en `referencia/SPEC.md` (§4, §5, §7 y §9). Todo primero en la iglesia de prueba; la planilla real de IBSI no se toca sin OK.
1. ✅ (hecho, en prueba) **Imprimir / PDF:** botón en canción y en reunión (entera, en orden). Imprime lo que se ve (tono, arreglo, Músico o Cantante), versión limpia para papel, salto de página entre canciones, diálogo del sistema ("Guardar como PDF" en el celular).
2. **Tono por parte, Modulante y Medley (interfaz):** etapas A, B y C hechas (cálculo en `js/music.js` → `tonosDelItem`, pruebas en `pruebas/tonos.test.mjs`: `node pruebas/tonos.test.mjs [cancionero.json]`; vista e impresión por parte, con medley; editor de partes con Modulante, tono por parte, "Mostrar igual" y "+ Agregar sección"). D hecha, a probar (Editar reunión → "Crear medley": canciones con búsqueda en vivo y tono de inicio; abre el editor de partes con las partes de todas las canciones, el nombre de cada canción arriba de su primera parte y Modulante siempre encendido). Falta: E (prueba en la iglesia de prueba). Ver "Tono por parte, Modulante, arreglo por reunión y Medley" en "Para una fase posterior" y SPEC §7.
3. **Completar datos de canciones (sin clave):** intérprete, BPM (cuenta como confirmado), tono original (de una lista; en modulantes, una por tono de la secuencia), link (solo si está vacío). Gana lo editado en la app; si el archivo trae otro valor, es conflicto en "Revisar cambios". Definir `Datos/ediciones.json`. Confirmación antes de guardar, nombre guardado en el dispositivo, historial con quién y cuándo, y "deshacer".
4. **Director edita la letra** de cualquier parte del arreglo de su reunión, con PIN. Solo esa reunión; nunca la base.
5. **"Pendientes de revisión"** (una bandeja por iglesia, admin en Ajustes):
   - "Sugerir corrección" (sin clave), con atajo "Proponer para todas las versiones" desde una reunión;
   - canción nueva (sin clave): pegar cifrado, subir archivo, sin cifrado o "pedir canción"; nombre, intérprete (o "No sé"), link, comentario; aviso de duplicados por nombre + intérprete y por letra; tono opcional en "sin cifrado"; borrador usable en reuniones;
   - revisión: antes/después para correcciones; canción nueva ya convertida y editable; aprobar o rechazar con motivo.
6. **Importación en dos botones:** "Agregar canciones nuevas" y "Revisar cambios en la carpeta" (antes/después, conflictos por parte con correcciones aprobadas, nunca aplica solo). Marca en las canciones con correcciones de la app. Sin la palabra "Word" en la interfaz.
7. **Link de la canción:** columna "Link" en Canciones; botón "▶ Escuchar" solo si hay link. La app nunca busca links.
- (Sin número hasta confirmar) **Agrupar versiones que solo cambian de tono:** en la lista, una canción que está en varios Word solo porque cambia el tono aparece una vez (los otros tonos los da la transposición); las versiones distintas (otra letra, estructura o intérprete) siguen por separado. Criterio: mismo título base + misma letra y partes + acordes que son un transporte exacto. Tono a mostrar: 1) tono original del intérprete (campo de la Prioridad 3), 2) el más usado en el Registro, 3) el del Word, con "Tono original no registrado". No se borra ni se oculta nada en Drive; las reuniones y el Registro de cualquiera de los Word siguen funcionando. Propuesta con 34 grupos, Word a conservar y casos dudosos en `referencia/agrupacion-por-tono.md`.
8. **Planilla:** desplegable de B1 ("Ver tonos de:") con validación desde `Personas!A2:A`, creado por el motor. Intérpretes: "Roca firme" → Eric Bustamante; medley "Hermoso nombre" → Evangelina Crubinca (en la iglesia de prueba). En IBSI, B1 e intérpretes al pasar a estable.

## Revisar
- `temprano-yo-te-buscare-2`: en el Word los acordes no caen sobre la sílaba (por ejemplo, "Oh! tu diestra me ha sostenido" con G/E y C/A al principio, y "Porque tu diestra" con C y Am corridos). En la versión 1 están bien. Revisar el Word.
- `anclado-en-la-roca-yahweh-2`: revisar de qué archivo sale el -2 (posible duplicado). Hoy figuran "Anclado en la roca (YAHWEH) [B]" y "[C]".
- "Inter (E B/G#m B)(…)": el bajo "G#m" no es un acorde válido, así que esa línea no se toma como título con acordes. Probable error de tipeo en el archivo.
- "En el monte calvario", "Nos unimos al cielo" y "Ven ante su trono" (x2) no tienen títulos de parte visibles: Lautaro los corrige en el Word.
- "Interlude 2" + "(Chorus)" en "Because He Lives" y "Coro 2" + "(final)" en "Jesucristo basta": el paréntesis queda como aclaración del título de arriba, no como parte nueva. Confirmar que es lo que se quiere.
- "Al estar aquí": el segundo "Verso 1" no trae solo "(Baja a F#)": también trae el último renglón con otros acordes ("Te adoro a Tí, te adoro a Tí" con B/Ab, C#sus4 y el puente B/Eb - C#/F). Por eso no entra en la regla de "solo la indicación" y se muestra tal cual (sin el resto de la letra). Ningún otro bloque del cancionero trae solo la indicación. Decidido: Lautaro lo corrige en el Word más adelante; la app no tiene una regla especial para este caso.
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
