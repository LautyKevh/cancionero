# Pendientes

Estado al 27-11-2026 (rama `desarrollo`, app v41; motor de PRUEBA: implementación @29). Nada en `main` ni en IBSI.

## Hecho hoy (en desarrollo)
- Aprobado en el celular: etapa C (tono por parte, Modulante, guardado, sin conexión), medley (etapa D), variantes de una parte.
- Imprimir / PDF (A4 por defecto, sin tamaño fijo); resumen de parte sin "(Sube a X)"; la versión nueva se activa sola.
- Editor de partes rediseñado (tarjetas, manija, chips de repeticiones y tono, hoja de tono, ⋯) y deslizar a la izquierda para borrar con "Deshacer" (también en "Crear medley").
- Encabezado de la canción en tres renglones; Editar reunión con Tono, Dirige y Editar en una línea.
- Medley: crear, ordenar canciones arrastrando (al crearlo y en el editor), nombre según el orden.
- Agrupación por tono solo en la app (`js/grupos.js`, 56 grupos; ver `referencia/agrupacion-por-tono.md`).
- Variantes de una parte: Músico elige "es el Coro 2" con un toque, sin clave ni nombre, compartido (motor `elegirVariante`).
- Editar fecha, nombre y director de una reunión ya creada (con clave), sin pisar otra reunión del mismo día.
- Admin sobre las reuniones: edita sin clave, cambia la clave o reasigna el director, con historial (motor `adminReunion`). **Sin probar con una sesión real de admin**: el ingreso con Google todavía no tiene el ID de cliente de OAuth (ver "Fase 2 (motor)").

## Próximo, en orden
Detalle en `referencia/SPEC.md` (§4, §5, §7 y §9). Todo primero en la iglesia de prueba; la planilla real de IBSI no se toca sin OK.
1. **Etapa E: prueba en la iglesia de prueba** (tono por parte, Modulante, medley, variantes y arreglo compartido con reuniones reales). No empezada.
2. **Esperan respuesta u OK de Lautaro:**
   - Probar en el celular: deslizar para borrar, edición de fecha/nombre/director y (cuando haya ingreso con Google) el panel Admin.
   - OK final al editor de partes rediseñado, ahora con deslizar para borrar (el ✕ ya no está en la tarjeta; queda "Quitar" en ⋯).
   - Agrupación: ¿agregar ya los 6 grupos decididos (Aquí estoy como en A; El Dios que adoramos F/F#/G como en F#/G; Él nos ama como en A; No voy a caer como en A; Por siempre como en Ab) o esperar a corregir esos Word? Mientras tanto siguen separados. Sin agrupar: "Levanto un aleluya" (versiones distintas).
   - "Con tu sangre" [D-Eb] y [D]: van por separado salvo que se haga la función de mostrar "Padre eterno, Cordero de Dios (Sube a…)" solo con Modulante (sin proponer todavía).
3. **Completar datos de canciones (sin clave):** intérprete, BPM (cuenta como confirmado), tono original (de una lista; en modulantes, una por tono de la secuencia), link (solo si está vacío). Gana lo editado en la app; si el archivo trae otro valor, es conflicto en "Revisar cambios". Definir `Datos/ediciones.json`. Confirmación antes de guardar, nombre guardado en el dispositivo, historial con quién y cuándo, y "deshacer". Con esto entra la regla 1 de la agrupación (tono original registrado).
4. **Director edita la letra** de cualquier parte del arreglo de su reunión, con PIN. Solo esa reunión; nunca la base.
5. **"Pendientes de revisión"** (una bandeja por iglesia, admin en Ajustes):
   - "Sugerir corrección" (sin clave), con atajo "Proponer para todas las versiones" desde una reunión;
   - canción nueva (sin clave): pegar cifrado, subir archivo, sin cifrado o "pedir canción"; nombre, intérprete (o "No sé"), link, comentario; aviso de duplicados por nombre + intérprete y por letra; tono opcional en "sin cifrado"; borrador usable en reuniones;
   - revisión: antes/después para correcciones; canción nueva ya convertida y editable; aprobar o rechazar con motivo.
6. **Importación en dos botones:** "Agregar canciones nuevas" y "Revisar cambios en la carpeta" (antes/después, conflictos por parte con correcciones aprobadas, nunca aplica solo). Marca en las canciones con correcciones de la app. Sin la palabra "Word" en la interfaz.
7. **Link de la canción:** columna "Link" en Canciones; botón "▶ Escuchar" solo si hay link. La app nunca busca links.
8. **Planilla:** desplegable de B1 ("Ver tonos de:") con validación desde `Personas!A2:A`, creado por el motor. Intérpretes: "Roca firme" → Eric Bustamante; medley "Hermoso nombre" → Evangelina Crubinca (en la iglesia de prueba). En IBSI, B1 e intérpretes al pasar a estable.

## Revisar (a mano, en los Word; nada de esto frena lo próximo)
- Agrupación, para que los grupos decididos muestren la letra elegida: Aquí estoy [D] (agregar "Que puedo hacer, que puedo decir…" como en [A]); El Dios que adoramos [F] ("Tú" → "Él") y [F#] ("pre coro" escrito como letra → título); Él nos ama [C] ("unan" → "unen"); No voy a caer [C] (falta un "Jesús, Jesús, Jesús"); Por siempre [G] (falta la estrofa "la tierra retumbó…").
- "El victorioso" [Am] y [Dm]: verificar si son la misma canción (en la letra quedaron acordes metidos: "c am" en una y "f dm" en la otra). Hasta entonces siguen separadas.
- Agrupación: los Word del tipo "acorde distinto por error del Word" (Agnus Dei, Alabaré al Señor, Anclado en la roca, Because He lives, Digno (Elevation), Digno es el Señor, Hermoso - No volveré atrás, No hay lugar más alto, Oh tu fidelidad (Majo Solis), Roca firme, Solo hay uno, Toma tu lugar, Tu mirada + Temprano, Una vez, Ven ante Su trono) ya están agrupados; el acorde exacto está en `referencia/agrupacion-por-tono.md`. Algunos pueden ser lecturas del conversor: mirarlos antes de tocar el Word.
- Agrupación: 9 pares con la misma letra y más de 3 acordes distintos siguen separados (Aquí te esperaré, Digno (Elevation) C/Eb, El Cordero y el León, Más el Dios de toda gracia, Más que vencedor, No hay otro nombre, Por su gracia, Santo, Solo Cristo): decidir si son arreglos distintos o errores del Word. Los de distinto paréntesis (intérprete/arreglo) son versiones distintas y no se comparan.
- `temprano-yo-te-buscare-2`: en el Word los acordes no caen sobre la sílaba (por ejemplo, "Oh! tu diestra me ha sostenido" con G/E y C/A al principio, y "Porque tu diestra" con C y Am corridos). En la versión 1 están bien.
- `anclado-en-la-roca-yahweh-2`: revisar de qué archivo sale el -2 (posible duplicado). Hoy figuran "Anclado en la roca (YAHWEH) [B]" y "[C]".
- "Inter (E B/G#m B)(…)": el bajo "G#m" no es un acorde válido, así que esa línea no se toma como título con acordes. Probable error de tipeo en el archivo.
- "En el monte calvario", "Nos unimos al cielo" y "Ven ante su trono" (x2) no tienen títulos de parte visibles: Lautaro los corrige en el Word.
- "Interlude 2" + "(Chorus)" en "Because He Lives" y "Coro 2" + "(final)" en "Jesucristo basta": el paréntesis queda como aclaración del título de arriba, no como parte nueva. Confirmar que es lo que se quiere.
- "Al estar aquí": el segundo "Verso 1" trae "(Baja a F#)" y además el último renglón con otros acordes; se muestra tal cual. Decidido: Lautaro lo corrige en el Word más adelante; la app no tiene una regla especial.
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
