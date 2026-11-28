# Pendientes

Estado al 28-11-2026 (rama `desarrollo`, app v54; motor de PRUEBA: implementación @38, conversor 11; última importación de PRUEBA: 28-11 01:06, 296 canciones). Nada en `main` ni en IBSI.

## Hecho 27/28-11 (en desarrollo)
- Paréntesis `( )`: se ven siempre, tal cual, transportados con su parte (también los que funcionan como puente). Solo `[ ]` y `{ }` se ocultan según la parte siguiente.
- Reglas en la SPEC: Word locales (no se comparan con Drive), nombres de archivo de Drive intactos, el tono lo manda la primera línea del Word, título "… en X" fija el tono de la parte, la barra en "[C/D - Eb]" separa tonos, el motor saca caracteres invisibles.
- Agrupación: regla 1 (tono original del intérprete), "Conservá X" primero en el grupo, 7 grupos nuevos (Aquí estoy [D], Con tu sangre, El Dios que adoramos, Él nos ama, El victorioso, No voy a caer, Por siempre).
- Cambios del ensayo (acordes, variante, tono) solo de esa reunión, sin nombre ni clave.
- Datos de la canción en la ficha (intérprete, tono original, BPM): vacío lo completa cualquiera con confirmación; con valor, solo el admin. `Datos/datos-canciones.json`, cargados los de Lautaro del 27-11.
- Barra "Actualizado… / Actualizar" solo en Ajustes. Botón propio "Iniciar sesión" en Ajustes.
- `referencia/tareas-drive.md` regenerado: 46 Word se pueden borrar, 34 con diferencias (sección 2).


## Hecho hoy (en desarrollo)
- Aprobado en el celular: etapa C (tono por parte, Modulante, guardado, sin conexión), medley (etapa D), variantes de una parte.
- Imprimir / PDF (A4 por defecto, sin tamaño fijo); resumen de parte sin "(Sube a X)"; la versión nueva se activa sola.
- Editor de partes rediseñado (tarjetas, manija, chips de repeticiones y tono, hoja de tono, ⋯) y deslizar a la izquierda para borrar con "Deshacer" (también en "Crear medley").
- Ajustes → Pantalla: Automático / Claro / Oscuro, solo en el dispositivo.
- Ajustes → Administración: botón "Iniciar sesión" (sin cartel emergente de Google) y "Cerrar sesión" en el mismo lugar.
- Encabezado de la canción en tres renglones; en Editar reunión, tocar el nombre de la canción (›) abre sus partes (un medley, un renglón por canción), y Tono y Dirige van en una línea.
- Medley: crear, ordenar canciones arrastrando (al crearlo y en el editor), nombre según el orden.
- Agrupación por tono solo en la app (`js/grupos.js`, 56 grupos; ver `referencia/agrupacion-por-tono.md`).
- Variantes de una parte: Músico elige "es el Coro 2" con un toque, sin clave ni nombre, compartido (motor `elegirVariante`).
- Editar fecha, nombre y director de una reunión ya creada (ruedita ⚙ al lado de "Editar reunión", hoja desde abajo, con clave), sin pisar otra reunión del mismo día.
- Admin sobre las reuniones: edita sin clave; en la misma hoja de la ruedita, en chico, "Clave nueva" e "Historial del admin" (motor `adminReunion`). **Sin probar con una sesión real de admin** (Claude no puede ingresar con Google): lo prueba Lautaro desde Ajustes → Acceder.

## Hecho 28-11 (v55, en desarrollo)
- Confirmaciones con un solo formato: pregunta arriba, "No" y "Sí, …" abajo a la derecha (borrar reunión, datos de la canción).
- Reunión: debajo del título solo "Dirige X".
- Encabezado: "Intérprete · Tono original X" (si no, "Tono habitual X" del Registro o "Tono registrado X" del Word), también fuera de la reunión.
- Recuadro del tono en la reunión: "Reunión" o, si se transportó, "↺ Volver a X" (tocable). La barra sigue en una línea a 375 px.

## Próximo, en orden
Detalle en `referencia/SPEC.md` (§4, §5, §7 y §9). Todo primero en la iglesia de prueba; la planilla real de IBSI no se toca sin OK.
1. **Probar (Lautaro):**
   - **Arranque en la pantalla principal (v54):** como PWA instalada en el celular, cerrar la app del todo y volver a abrirla → tiene que abrir en Canciones; deslizar para actualizar en una subpantalla → se queda ahí. En el navegador ya está probado.
   - **Ingreso con Google** desde el botón propio "Iniciar sesión" de Ajustes, y con la sesión iniciada el **✎ de admin en datos que ya tienen valor** (intérprete, tono original, BPM). Sin probar con una sesión real (Claude no puede ingresar con Google).
   - Acordes de los músicos: en una reunión, modo Músico, un solo ✎ al lado del nombre de la canción → modo edición → hoja con los acordes encima de la letra, sin nombre, "Guardar acordes", "Restaurar acordes" e "Historial de esta parte".
   - Al agregar una canción que ya se tocó sola: hoja "Como la última vez" (copia partes, orden, tonos y acordes editados de la última reunión anterior) o "Versión base". Si nunca se tocó, se agrega directo.
   - Títulos con tono: "Inter para subir a A" se transporta como los acordes (empezando en G, "Inter para subir a Bb"), también en el editor de partes.
2. **Etapa E (hecha, 27-11):** "Hay poder" con 2 subidas → G→G→G→Ab→Ab→A con puentes (Eb) y (E); "Al estar aquí" en G → G→Bb→G→Bb→G; medley con separador e indicador; variantes compartidas; motor `editarAcordes` (nombre, tamaño, historial, base). Registro probado con una reunión del 20-11-2026: anotó `G→Ab→A`, `G→Bb→G→Bb→G`, D y E con `reunión <id>#<pid>`. Las dos reuniones de prueba se borraron; esas 4 filas quedan en el Registro de la iglesia de prueba (el motor no borra filas). Corregido en v49: falsas variantes en "Hay poder" y el rótulo "orden modificado" con solo tonos por parte.
3. **Esperan respuesta u OK de Lautaro:**
   - Probar en el celular: deslizar para borrar, la ruedita de Editar reunión (fecha/nombre/director) y lo del admin (ingresando en Ajustes).
   - OK final al editor de partes rediseñado, ahora con deslizar para borrar (el ✕ ya no está en la tarjeta; queda "Quitar" en ⋯).
4. **Datos de la canción:** hecho intérprete, tono original y BPM en la ficha (v53): vacío lo completa cualquiera; con valor, solo el admin. Falta: link, conflicto con la planilla en "Revisar cambios" y pasar los datos a IBSI al pasar a estable.
5. **Editor de partes (letra y acordes) — primera versión hecha (v56), falta tu OK en el celular:** ✎ → tocar una parte → cuadro de texto monoespaciado como en el Word → "Vista previa" (con avisos) → "Guardar". Aplica a todas las apariciones de la parte; "Restaurar" (base / como la última vez) y "Versiones anteriores (n)". Reemplaza la edición de acordes renglón por renglón. Sin cambios en el motor (usa `editarAcordes`, una llamada por aparición: con 2 o 3 apariciones tarda un poco más). v57: acordes juntos sobre una palabra estiran la letra con "_" (como en el Word) para no correrse de sílaba. Prueba de ida y vuelta (texto → partes) sobre las 81 partes del demo en 3 tonos: 240 de 243 iguales; las 3 restantes son "Jesucristo basta" (salto de línea dentro de un párrafo del Word, ver Fase 2). Sin probar en pantalla: un medley.
6. **"Pendientes de revisión"** (una bandeja por iglesia, admin en Ajustes):
   - "Sugerir corrección" (sin clave), con atajo "Proponer para todas las versiones" desde una reunión;
   - canción nueva (sin clave): pegar cifrado, subir archivo, sin cifrado o "pedir canción"; nombre, intérprete (o "No sé"), link, comentario; aviso de duplicados por nombre + intérprete y por letra; tono opcional en "sin cifrado"; borrador usable en reuniones;
   - revisión: antes/después para correcciones; canción nueva ya convertida y editable; aprobar o rechazar con motivo.
7. **Importación en dos botones:** "Agregar canciones nuevas" y "Revisar cambios en la carpeta" (antes/después, conflictos por parte con correcciones aprobadas, nunca aplica solo). Marca en las canciones con correcciones de la app. Sin la palabra "Word" en la interfaz.
8. **Link de la canción:** columna "Link" en Canciones; botón "▶ Escuchar" solo si hay link. La app nunca busca links.
9. **Planilla:** desplegable de B1 ("Ver tonos de:") con validación desde `Personas!A2:A`, creado por el motor. Intérpretes: "Roca firme" → Eric Bustamante; medley "Hermoso nombre" → Evangelina Crubinca (en la iglesia de prueba). En IBSI, B1 e intérpretes al pasar a estable.

## Revisar (a mano, en los Word; nada de esto frena lo próximo)
- Agrupación: los Word del tipo "acorde distinto por error del Word" (Agnus Dei, Alabaré al Señor, Anclado en la roca, Because He lives, Digno (Elevation), Digno es el Señor, Hermoso - No volveré atrás, No hay lugar más alto, Oh tu fidelidad (Majo Solis), Roca firme, Solo hay uno, Toma tu lugar, Tu mirada + Temprano, Una vez, Ven ante Su trono) ya están agrupados; el acorde exacto está en `referencia/agrupacion-por-tono.md`. Algunos pueden ser lecturas del conversor: mirarlos antes de tocar el Word.
- Agrupación: 9 pares con la misma letra y más de 3 acordes distintos siguen separados (Aquí te esperaré, Digno (Elevation) C/Eb, El Cordero y el León, Más el Dios de toda gracia, Más que vencedor, No hay otro nombre, Por su gracia, Santo, Solo Cristo): decidir si son arreglos distintos o errores del Word. Los de distinto paréntesis (intérprete/arreglo) son versiones distintas y no se comparan.
- `temprano-yo-te-buscare-2`: en el Word los acordes no caen sobre la sílaba (por ejemplo, "Oh! tu diestra me ha sostenido" con G/E y C/A al principio, y "Porque tu diestra" con C y Am corridos). En la versión 1 están bien.
- `anclado-en-la-roca-yahweh-2`: revisar de qué archivo sale el -2 (posible duplicado). Hoy figuran "Anclado en la roca (YAHWEH) [B]" y "[C]".
- "Inter (E B/G#m B)(…)": el bajo "G#m" no es un acorde válido, así que esa línea no se toma como título con acordes. Probable error de tipeo en el archivo.
- Sin títulos de parte: En el monte Calvario [C] y Ven ante Su trono [Eb] (ninguno). Nos unimos al cielo [G] tiene solo [Coro]: bien si la canción es solo eso.
- Atráeme a ti [A]: agregar [Estrofa] arriba de los primeros 7 renglones (lo hace Lautaro).
- Word repetidos para borrar del Drive (lo hace Lautaro, cuando quiera): lista en `referencia/tareas-drive.md`, sección 2a. Después hay que sacar esos ids de `js/grupos.js`.
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
  - ( ) al final de una parte (se marcan, pero se ven siempre);
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
  - sin nombre ni clave, solo en esa reunión;
  - historial por parte;
  - "Restaurar acordes" (base / como la última vez);
  - gana el último guardado, con LockService.
- **Al agregar una canción:** "Como la última vez" / "Versión base".
- **Paréntesis, [ ] y transiciones:** los ( ) se ven siempre, transportados con su parte. Las transiciones y los [ ] se transportan según el tono de la parte siguiente y se ocultan si no cambia el tono, con "Mostrar igual".
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
- Anclar notas sueltas a una palabra (`at`), como en la referencia de "Quién más".
- Conservar los saltos de línea dentro de un párrafo del Word (`<w:br/>`), como en "Jesucristo basta".
- Pasar a estable con los datos reales de IBSI (`registrarIBSI()`), con aprobación.

- **Jesús en el centro** (nov. 2026): dos canciones aparte desde Word con el mismo arreglo: `jesus-en-el-centro-2` [C] = Danilo Montero, tono original G, 140 BPM; `-3` [F] = Israel & New Breed, A, 129 BPM.
- **Digno (Elevation)**: el intérprete figura "Elevation"; cambiarlo a "Elevation Worship" necesita clave de admin.
- **Conversor: "[PUENTE 2a] [x2]"** en un mismo renglón del Word queda como dos partes ("PUENTE 2a" vacía y "x2" con el contenido); se ve "[ x2]" como título (Clamo a Cristo). Corregir en motor/Convertir.js y reimportar.
