# Pendientes

Estado al 28-11-2026: rama `desarrollo`, app v66; motor de PRUEBA @39, conversor 12; PRUEBA reimportada el 28-11 (294 canciones). Nada en `main` ni en IBSI.
Antes de empezar: leer `referencia/SPEC.md` §0 (Registro de decisiones).

## 1. En curso / sin terminar (estado real)
- **"¿Qué versión?"** — Hecha (v66): hoja al abrir desde la lista/buscador, al agregar a una reunión y al armar un medley; la sugerida (regla del tono) primero y marcada; en la reunión queda el Word elegido. **Falta decidir (Lautaro):** con el criterio de la SPEC (no cuentan nombre de parte ni repeticiones) hoy la usan 24 grupos, no los 8 previstos. Además de los 8: Con tu sangre, El Dios que adoramos, El victorioso, No voy a caer, Agnus Dei, Alabaré al Señor, Aquí estoy, Because He lives, Digno es el Señor, Hermoso - No volveré atrás, Lo harás otra vez, No hay lugar más alto, No hay otro nombre, Santo por siempre, Solo hay uno, Toma tu lugar, Ven ante Su trono. Digno (Elevation) da una sola versión (sus 4 diferencias serían de posición). Varios son los "acorde distinto por error del Word" de la sección Revisar.
- **Agrupación** — Hecho (v58): una canción por título + letra; Word que son solo transporte quedan agrupados y se muestra uno, el del tono original (`js/grupos.js`, `CONSERVA` para Solo Cristo [A]). La elección entre arreglos distintos es la hoja "¿Qué versión?" (arriba).
- **Edición de letra y acordes por parte** — Hecho (v56/v57): editor por parte entera, vista previa con avisos, todas las apariciones, "Restaurar", "Versiones anteriores". **Falta:** OK de Lautaro en el celular; probarlo en un medley.
- **Etiquetas Tono original / habitual / registrado** — Hecho (v55 encabezado; v59 lista, buscador, agregar a reunión y apertura usan la misma regla). Verificado en el navegador.
- **Títulos con [ ] y aclaración en el mismo renglón** — Hecho (v60–v62, v65: repeticiones afuera, "[Coro] x2"). Probado en Músico y Cantante a 375 px; impresión medida, no vista en el diálogo real.
- **Digno → "Elevation Worship"** — Hecho: corrección en `Datos/correcciones.json` de PRUEBA y reimportado; verificado en el motor (los 3 Word).
- **Impresión compacta (v63/v64)** — Hecho: las 199 canciones de la lista entran en una hoja (medido en la copia de impresión). Conversor "[Parte] [x2]" corregido y reimportado (Clamo a Cristo).

## 2. Probar (Lautaro)
- PWA instalada: cerrar del todo y abrir → Canciones; recargar en una subpantalla → se queda ahí.
- Ingreso con Google desde "Iniciar sesión" en Ajustes.
- ✎ de admin en datos que ya tienen valor (intérprete, tono original, BPM).
- Impresión de una reunión con nombre sin fecha ("Bautismo - dd-mm-aaaa") y de una canción de más de una hoja (nombre repetido en cada hoja), en el diálogo real.

## 3. Word (Lautaro)
- Atráeme a ti [A]: agregar [Estrofa] arriba de los primeros 7 renglones.

## 4. Próximo
- Base visual: `DESIGN.md` hecho; 3 direcciones en `referencia/propuestas/` (Zafiro afinado, Escenario, Cuaderno). Falta que Lautaro elija una y aplicarla.

## 5. Después
- "Pendientes de revisión" / "Sugerir corrección" (bandeja por iglesia; canción nueva; antes/después; aprobar o rechazar con motivo).
- Importación en dos botones: "Agregar canciones nuevas" y "Revisar cambios en la carpeta".
- "▶ Escuchar": columna Link en Canciones; botón solo si hay link.
- Desplegable B1 ("Ver tonos de:") en la planilla, desde `Personas!A2:A`.
- Carga automática de intérpretes, con control de Lautaro.
- Limpieza del Drive con `referencia/tareas-drive.md`.
- Pulido fino y animaciones, después de domingos reales.
- Pasar a estable con IBSI (`registrarIBSI()`), con aprobación.

## Revisar (a mano, en los Word; nada de esto frena lo próximo)
- Agrupación: los Word del tipo "acorde distinto por error del Word" (Agnus Dei, Alabaré al Señor, Anclado en la roca, Because He lives, Digno (Elevation), Digno es el Señor, Hermoso - No volveré atrás, No hay lugar más alto, Oh tu fidelidad (Majo Solis), Roca firme, Solo hay uno, Toma tu lugar, Tu mirada + Temprano, Una vez, Ven ante Su trono) ya están agrupados; el acorde exacto está en `referencia/agrupacion-por-tono.md`. Algunos pueden ser lecturas del conversor: mirarlos antes de tocar el Word.
- `temprano-yo-te-buscare-2`: en el Word los acordes no caen sobre la sílaba (por ejemplo, "Oh! tu diestra me ha sostenido" con G/E y C/A al principio, y "Porque tu diestra" con C y Am corridos). En la versión 1 están bien.
- `anclado-en-la-roca-yahweh-2`: revisar de qué archivo sale el -2 (posible duplicado). Hoy figuran "Anclado en la roca (YAHWEH) [B]" y "[C]".
- "Inter (E B/G#m B)(…)": el bajo "G#m" no es un acorde válido, así que esa línea no se toma como título con acordes. Probable error de tipeo en el archivo.
- Sin títulos de parte: En el monte Calvario [C] y Ven ante Su trono [Eb] (ninguno). Nos unimos al cielo [G] tiene solo [Coro]: bien si la canción es solo eso.
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
