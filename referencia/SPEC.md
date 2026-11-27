# Cancionero — Especificación (v1)

Todo lo definido con Lautaro durante el prototipo. La referencia visual y funcional es `referencia/prototipo.html`: abrilo en el navegador antes de empezar.

## 1. Qué es

Un cancionero para ministerios de alabanza. Permite:
- Ver letra y acordes con transposición.
- Armar reuniones (cultos) con canciones, tonos y orden de partes.
- Llevar el historial de qué se tocó, cuándo, en qué tono y quién dirigió.

Es multi-iglesia: cada iglesia conecta su propio Google Drive. Es gratis y sin fines comerciales.

## 2. Arquitectura (decidida)

| Capa | Tecnología | Dónde vive | Dueño |
|---|---|---|---|
| App (UI) | PWA estática (HTML/CSS/JS, sin framework pesado) | GitHub Pages, repo de Lautaro | Lautaro |
| Motor (API) | Google Apps Script, Web App (`doGet`/`doPost` JSON) | Cuenta de Lautaro | Lautaro |
| Datos | Google Sheets + Drive (Word y JSON) | Drive de cada iglesia | Cada iglesia |

- Un solo motor atiende a todas las iglesias (multi-tenant). Cada iglesia comparte su carpeta raíz con el email del motor, como editor.
- Un registro maestro (planilla en la cuenta de Lautaro) guarda: iglesia → id de carpeta raíz, versión activa, admins.
- Sin SQL. Los JSON de canciones van en `Datos/`. Usar `CacheService` para lecturas y `LockService` para escrituras.
- La app se embebe en el Google Site de cada iglesia (iframe) y además es instalable como PWA.

## 3. Entornos y versiones

- **Madre (desarrollo):** rama `desarrollo` → GitHub Pages en otra ruta, más una implementación de prueba de Apps Script **versionada** que se actualiza en cada cambio (no `@HEAD`: la URL `/dev` solo funciona para editores con sesión iniciada) y una iglesia de prueba con una copia de datos reales de IBSI.
- **Estable:** rama `estable` → versiones cerradas (v1.0, v1.1…), con implementaciones versionadas de Apps Script.
- **Modo demo local (obligatorio):** la app tiene que poder correrse en local (`npx serve` o similar) con **datos simulados**, sin Google, para probar la interfaz igual que el prototipo. Es lo que Lautaro usa para ir probando.
- **Actualizaciones por iglesia, opcionales:** el admin ve "Versión X disponible · Novedades · Actualizar". Al aceptar, el sistema:
  1. Respalda la planilla (copia automática).
  2. Corre las migraciones necesarias.
  3. Cambia la versión de esa iglesia.

  Tiene que existir la opción "Volver a la versión anterior". Si el admin no acepta, la iglesia sigue en su versión.

## 4. Roles

| Rol | Cómo entra | Puede |
|---|---|---|
| Miembro (músico/cantante) | Sin cuenta | Ver canciones y reuniones, transponer, usar sin conexión. Editar los **acordes** del arreglo de una reunión (queda su nombre); nunca la estructura ni los tonos. Completar datos de canciones (intérprete, BPM, tono original, link vacío). Sugerir correcciones y proponer canciones nuevas, que quedan pendientes de revisión |
| Director | Sin cuenta, con la clave de 4 dígitos de su reunión | Crear reuniones; editar o borrar las suyas, incluida la estructura del arreglo de cada canción y la **letra** de cualquier parte del arreglo de su reunión |
| Admin de iglesia | Google Sign-In (solo para acciones de admin) | Configurar carpetas, revisar la bandeja "Pendientes de revisión" (aprobar o rechazar correcciones y canciones nuevas), importar desde la carpeta, corregir la canción base, dar de alta personas, otros admins y editores, actualizar versión |
| Superadmin | Lautaro | Publicar versiones; opcional: código de invitación para altas |

- Hay un solo link por iglesia (`…/app/?c=<id>`). No existe un "link de admin": el ingreso con Google aparece solo en Ajustes.
- **Alta autoservicio:** "Crear el cancionero de mi iglesia" → Google Sign-In → queda como admin → comparte su carpeta con el email del motor → el motor crea la estructura e importa. Se puede exigir un código de invitación (activable).
- **Clave de director:** exactamente 4 dígitos numéricos. En la planilla se guarda solo el hash con sal (nunca la clave). Se verifica en el servidor y nunca se envía al cliente. Después de 5 intentos fallidos, bloqueo de 10 minutos por reunión.
- **Admin:** el ID token de Google se verifica en Apps Script, y el email tiene que estar en la lista de admins de esa iglesia.
- **Admin sobre las reuniones:** con la sesión de Google iniciada, el admin edita o borra cualquier reunión sin la clave de 4 números (el motor acepta `idToken` en lugar de `clave`). En la hoja de la ruedita de Editar reunión ve además, en chico y sin título de "Admin", el campo "Clave nueva" (la escribe el director nuevo) y, plegado, "Historial del admin"; cambiar "Dirige" ahí cuenta como reasignar la reunión. Todo lo que hace queda en el historial de la reunión (columna "historial admin (JSON)" de Reuniones: fecha, email, qué hizo; las ediciones seguidas cuentan una vez cada 10 min), visible solo para el admin. Los demás no ven nada de esto.
- **Edición de acordes sin clave:** queda abierta a cualquiera que tenga el link de la iglesia. El motor valida:
  - nombre obligatorio;
  - un límite de tamaño por parte;
  - un límite de ediciones por minuto.
- **Otras acciones sin clave** (completar datos de canciones, sugerir correcciones, proponer canciones nuevas): mismas validaciones del motor (nombre obligatorio, límites de tamaño y de envíos por minuto).

## 5. Estructura en el Drive de cada iglesia (la crea el configurador)

```
📁 <raíz elegida por la iglesia>
 ├─ 📊 Cancionero (planilla)
 │    pestañas: Canciones, Registro, Personas, Reuniones, Ajustes
 ├─ 📁 Letra y Acordes   (Word fuente: "Título [Tono].docx")
 ├─ 📁 Domingos          (opcional, docs por fecha: "Domingo DD-MM-AAAA.docx")
 └─ 📁 Datos             (generado: canciones/<id>.json, cancionero.json; no tocar)
```

**Canciones:**
- Columnas: ID, Título, Intérprete, Tono original, BPM, Estado (oficial / borrador / sin cifrado), Archivo fuente, Confianza, **Link**.
  - **Link:** columna nueva, normalmente el video de YouTube. La completa la gente desde la app (ver 7, "Datos de la canción") o el admin. La app nunca busca links por su cuenta.
- **Celda B1 ("Ver tonos de:"):** desplegable con validación de datos desde `Personas!A2:A`, así se actualiza solo con los nombres que agrega la app. El motor lo crea en toda planilla de iglesia (prueba y nuevas).
- **Datos editables desde la app** (intérprete, BPM, tono original, link): cada cambio guarda quién y cuándo, con historial y "deshacer" (en `Datos/ediciones.json`; el formato se define al implementarlo).
  - Gana lo editado en la app. Si después el archivo trae otro valor, aparece como conflicto en "Revisar cambios en la carpeta" y el admin elige.
  - El BPM cargado desde la app cuenta como confirmado (tiene nombre, historial y "deshacer"), sin importar la columna Confianza.
- Puede haber varias versiones de una misma canción, con distinto ID e intérprete.
- **Agrupación por tono (solo en la app):** los Word que son la misma canción en otro tono (lista fija en `js/grupos.js`, criterio en `referencia/agrupacion-por-tono.md`) aparecen una sola vez en la lista y en los buscadores; la búsqueda mira todos los Word del grupo. Tono que se muestra: 1) tono original registrado; 2) el más usado en el Registro (empate: el más reciente); 3) el del primer Word, con "Tono original no registrado". El historial suma todos los Word del grupo. Cada Word conserva su id: reuniones y Registro no cambian.
- **Canción base:** es el Word de la iglesia (la versión de la casa, no la original del intérprete).
  - Todo bloque del Word es válido aunque no exista en la original. Por ejemplo, el [Final] en F# de "Al estar aquí" lo agregó la iglesia y es parte de la base.
  - Cambiar el arreglo de una reunión nunca modifica la canción base.
- **Paréntesis en el nombre del archivo:** si es un intérprete conocido (nombre completo, o uno que ya figura en la planilla), pasa al campo Intérprete. Si es una versión ("(Simple)", "(New)", "(Con subida)") o un subtítulo, queda en el título. Si es un nombre abreviado ("(Evan)"), el conversor no adivina: lo deja en el título y lo marca en el registro de importación para que el admin complete el intérprete como corrección.
- Tono original de una canción modulante: la secuencia de tonos, como en el título del Word (`G-Ab-A-Bb-C`). El primero es el tono de inicio.
- En el JSON de cada canción (`Datos/canciones/<id>.json`):
  - cada parte guarda su **tono escrito** y si es **de transición**;
  - se marcan los **acordes puente**;
  - la canción guarda si es **Modulante** y su secuencia de tonos (ver 6).
- **Correcciones de la base (`Datos/correcciones.json`):** solo las hace el admin, desde Ajustes → Canciones, con Google. Cubren:
  - tonos detectados por parte;
  - marcas de transición;
  - acordes de transición;
  - posición de acordes;
  - título e intérprete (por ejemplo, un intérprete abreviado en el nombre del archivo).

  Las correcciones aprobadas se reaplican siempre en cada importación. Los archivos modificados en la carpeta nunca se aplican solos: van por "Revisar cambios en la carpeta" (ver 9). Los cambios de cada domingo **nunca** van ahí: van en la reunión.
  - También van ahí las **sugerencias de corrección aprobadas** por el admin (ver 9, "Pendientes de revisión"), incluidas las de letra.
  - Las correcciones aprobadas **nunca se pierden** por una importación (ver 9, "Importación desde la carpeta").

**Registro:**
- Columnas: Fecha, Canción (ID), Tono, Quién, Origen (domingo / reunión / planilla vieja).
- Se alimenta solo desde las reuniones y desde la lectura de los documentos de `Domingos`.
- Las reuniones se anotan solas al día siguiente de su fecha, con la última versión guardada de la lista: un activador nocturno (3–4 h) y, como respaldo, la primera lectura de la app. Se anotan una sola vez; los cambios posteriores no se trasladan a Registro (no se modifican filas existentes).
- "Quién" puede quedar vacío.
- "Tono" guarda la secuencia completa de tonos tocados cuando hubo cambios: `G→Ab→A→Bb→C`. Si no hubo cambios, un solo tono.
- Los tonos consecutivos iguales se registran una sola vez: `G→Ab→A→Bb→Bb→C` se registra `G→Ab→A→Bb→C`.
- Registro e historial guardan **cómo se tocó**, no solo el tono. Cada fila que sale de una reunión lleva en "Origen" la referencia al arreglo: `reunión <id>#<pid>` (id de la reunión e id del ítem). Así no se agregan columnas a la planilla; el arreglo completo está en la pestaña Reuniones.

**Personas:** lista libre. Los nombres nuevos que se escriben en "Dirige" se agregan solos.

**Reuniones:**
- Columnas: id, nombre, fecha, director, hash de clave, canciones (JSON), borrada, registrada.
- Cada ítem de `canciones` guarda su **arreglo completo**: partes, orden, repeticiones, tono por parte, Modulante, "mostrar" y partes nuevas creadas ahí mismo. Nunca modifica la canción base.
  - Canción: `{ pid, id, tono, quien, modulante?, desde?, arr: [Parte] }`.
  - Medley: `{ pid, tipo: "medley", nombre?, tono, quien, canciones: [{ id, quien? }], arr: [Parte] }`. Siempre es modulante.
  - `pid`: id estable del ítem dentro de la reunión. Lo usan el Registro (`reunión <id>#<pid>`) y "Como la última vez".
  - `tono` del ítem: el tono de inicio. `arr` vacío = versión base en su orden original (el mismo arreglo que arma la app: los títulos sin contenido usan el bloque con contenido del mismo nombre).
  - `desde`: de dónde se copió el arreglo, `"base"` o `"<id reunión>#<pid>"` ("Como la última vez").
  - Sin `modulante` (reuniones anteriores), se toma el valor de la canción.
- **Parte** (`arr[i]`): `{ pid, src | nueva, cancion?, label, rep, tono?, mostrar?, lineas?, cambios? }`.
  - `pid`: id estable de la parte (no cambia al reordenar). Lo usan las ediciones de acordes.
  - `src`: bloque de la canción base. `nueva`: parte creada en la reunión (por ejemplo, un interludio que no existe en la base), con sus `lineas` escritas a mano.
  - `cancion`: de qué canción es la parte (medley).
  - `tono`: tono absoluto en que se toca la parte. Solo cuenta con Modulante encendido. Si falta, se calcula desde el tono escrito, manteniendo el intervalo original con la parte anterior.
  - `mostrar: true` = "Mostrar igual": el puente o la transición se muestran aunque la parte siguiente quede en el mismo tono.
  - `lineas`: acordes editados de esa parte para esta reunión (mismo formato que la canción); también la **letra**, si la editó el director con clave. Si falta, se usan los de la base.
  - `cambios`: historial de ediciones de acordes, `[{ quien, fecha, lineas }]`, con la versión anterior a cada cambio.
  - "+ Agregar sección" crea una entrada más de `arr`, copia de otra parte, con su propio `tono`.
- Se pueden borrar. El borrado es lógico, con papelera.

## 6. Conversión Word → canción (reglas probadas en el prototipo; ver `referencia/convert.py`)

- Título y tono salen del primer párrafo: `Título [Tono]`.
- `[Lo que sea]` es un título de sección. Las indicaciones encadenadas se separan, cada una en su línea (`[Coro][Repite final]` → dos títulos). Se aceptan `:` y `x2`/`X2`/`×2` (`[Parte 1]: x2` → "Parte 1 x2").
- **Títulos sin corchetes:** también valen como título de parte:
  - con dos puntos: `Coro:`, `Estrofa 1:`, `Puente 1:`;
  - en mayúsculas: `CORO`, `PRE-CORO`, `PUENTE (Repite "cumple Señor")`;
  - con acordes en la misma línea: `Inter: Bb F C - Gm Dm C`, `INTERLUDIO(2x): G - D`, `FINAL /B-E-F#/` (las barras de compás se ignoran);
  - con una aclaración: `Intro: (Primera parte de la estrofa)` y `CORO (Dm)`.
  - entre paréntesis y solo en una línea: `(Estrofa)`, `(Coro)`. Si va justo debajo de otro título ("Interlude 2" / "(Chorus)"), es una aclaración de ese título y no una parte nueva;
  - números romanos solos al principio de línea: `I)`, `II)`, `III)` → Estrofa 1, 2, 3.
  - Título con acordes y las veces al final, con o sin corchetes: `[Intro F# - C# - D#m-B – F#-C#  x2]` → "Intro x2" con sus acordes. Hacen falta 2 acordes o más (`[Parte D x2]` sigue siendo el título "Parte D x2").
  - Las mayúsculas se muestran como "Coro". Una línea de letra que empieza con esas palabras ("Solo hay uno digno", "Coro de ángeles…") sigue siendo letra.
  - Una línea de acordes nunca se empareja con un título como si fuera letra.
- Una línea solo con acordes, seguida de una línea de letra, forma un par: cada acorde se ancla a una sílaba.
  - La posición se calcula con las métricas de la fuente del Word (Times New Roman ≈ Liberation Serif) y factor 0,94 para los espacios.
  - Después se ajusta al inicio de la sílaba más cercana.
  - Es aproximado: hace falta un modo "corregir acordes" (ver 9).
- Los guiones bajos de estiramiento (`de_rro__ta`) se eliminan. Los espacios múltiples dentro de la letra se reducen a uno.
- **Notas entre paréntesis en una línea de acordes** ("(Para repetir coro: C#/F)", "(bajada cromática)", "(BAJO: Eb G Bb E F)", "(Intro)", "[(2da vez A/B – B)]"): una nota con palabras no impide que la línea sea de acordes, así que se empareja con la letra de abajo. Si abajo no hay letra, la línea queda como antes (letra o mixta). La nota queda entera en su lugar, se muestra siempre y se transportan solo los acordes que tenga adentro. No cuenta para el tono de la parte ni como acorde puente, `[ ]` o `{ }`. "(Sube a X)" no es una nota: es la indicación de cambio de tono.
- Un renglón con solo una flecha ("↓") es una marca del Word y no se muestra: el indicador de cambio de tono lo pone la app en el renglón del título de la parte.
- Las líneas mixtas (`[Interludio] // C D G/B //`, `(Db9) (la 4ta vez se mutea)`) se muestran como notas; los acordes se transponen. Las notas sueltas se anclan a una palabra de la línea anterior.
- **Bloques:** desde un `[Título]` hasta el siguiente. Si un título aparece sin contenido (por ejemplo, el segundo "Coro x2"), referencia al primer bloque con el mismo nombre base.
  - Un bloque que solo trae la indicación "(Sube a X)" / "(Baja a X)" repite el bloque anterior con el mismo nombre, con su letra y sus acordes, en el tono nuevo. Conserva su propio tono para la secuencia y el Registro.
- **Tono por parte (tono escrito):** cada bloque guarda el tono en que está escrito.
  - Se detecta analizando sus acordes y con las pistas del Word:
    - la secuencia del título (`Hay poder [G-Ab-A-Bb-C]`, `Al estar aquí [F# - A]`);
    - las indicaciones `(Sube a X)` y `(Baja a X)`.
  - El admin puede corregirlo.
- **Modulante:** la canción es Modulante si sus partes no están todas en el mismo tono. El conversor la marca sola y el admin puede cambiarlo.
- **Acordes puente:** son los acordes entre paréntesis al final de una parte que preparan la siguiente (`(Eb)`, `(E)`, `(D/F# - E/Ab)`). Se marcan como puente; no son los acordes de paso entre paréntesis dentro de una línea, como `(C - G)`.
- **Acordes `[ ]` y `{ }` al final de una parte** (convención de la iglesia). Ambos son acordes y se transportan. Van en la misma línea de acordes que la letra, así que la línea de letra queda pegada a sus acordes.
  - `[ ]` = acordes puente para **modular**.
  - `{ }` = cierre para **repetir en el mismo tono**.
  - Ejemplo de "Quiero llenar": `A/B  B  E  [B/C#-E/C# A/F#] {A Am E}` sobre "Y proclamarte Señor".
  - No cuentan para decidir el tono de la parte.
- **Grafía:** `♭` y `♯` se aceptan como `b` y `#`. El guion largo `–` separa acordes igual que `-`.
- **Indicación de subida antes del título:** `(SUBE) [Coro]` o `(BAJA) [Inter]` marcan que esa parte cambia de tono. El tono nuevo es el siguiente de la secuencia del título.
- **Qué cuenta como modulación:** solo un cambio de centro tonal sostenido, es decir, una parte entera en otro tono. Los acordes prestados o de color (Gadd6, E7(#9), D/E como E2) no son modulación ni se marcan como dudosos.
- **Partes de transición:** son partes cuyo título indica un pasaje hacia otro tono, como "Inter para subir a A". Se marcan como transición, con el tono de destino.
- Lo detectado (tono por parte, transiciones, puentes, Modulante) lo puede corregir el admin. Esas correcciones van en `Datos/correcciones.json` (ver 5).

## 7. Pantallas y comportamiento (como en el prototipo)

**Cancionero:**
- Pestañas Canciones | Reuniones.
- Buscador por título, intérprete, frase de la letra (muestra la frase) y nombre de director ("Dirigió Raquel en F").
- Las búsquedas ignoran acentos y mayúsculas.

**Canción (antes de abrir):**
- Elegir Cantante / Músico.
- Recuadro de historial:
  - "Última vez: fecha · quién" (o "sin registrar quién") y "Tono última vez".
  - "Tono por persona": desplegable solo con quienes la hicieron; muestra su último tono, la fecha y cuántas veces.
  - Solo cuentan las fechas hasta hoy.

**Vista Músico:**
- Controles en una sola fila, compactos, debajo del título; no fijos, se van al hacer scroll: `−½ · Tono · +½ · Orig. · C/Do/I · A− · A+ · Cantante`.
- Transposición:
  - Escribe sostenidos o bemoles según la tonalidad destino (Ab → Db9, no C#9).
  - "Orig." aparece deshabilitado si ya está en el tono original.
  - Al transponer se mantiene la posición de scroll.
- Cifrado:
  - Rota entre americano (C), latino (Do) y grados en romanos.
  - Grados: mayúscula para mayores, minúscula para menores (iii7), alteraciones bII/bIII/#IV/bVI/bVII, bajo en romano (I/VI).
- Acordes:
  - Anclados a sílabas.
  - No empujan la letra; solo se separan si dos acordes chocan.
  - La línea se corta solo entre palabras.
- **Ajuste automático:**
  - Achica la letra hasta que la línea más larga entre en el ancho disponible (mínimo 11 px).
  - Si aun así no entra, la línea se corta.
  - A+ / A− suman o restan sobre el ajuste y se recuerdan.
  - Se recalcula al girar el celular.
- Repeticiones: un bloque ya mostrado aparece solo con su título ("Coro x2").
- Junto al tono original se muestra el BPM, solo si está confirmado.

**Vista de la canción (Músico y Cantante):**
- Cada parte va en su bloque, con un espacio claro antes del título siguiente.
- Una parte de un solo renglón de acordes (Intro, Inter, Interludio, Final) muestra siempre los acordes al lado del título, sin pasarlos abajo (si no entra, se achica la letra como en el resto de la hoja). Con 2 renglones o más, van abajo del título.
- "(Sube a X)" / "(Baja a X)" no se muestran como texto: se reemplazan por el indicador "↑ X" / "↓ X", transportado, en el mismo renglón que el título de la parte ("Coro  ↑ F").
- Si no hay intérprete, no se muestra nada (nunca "Intérprete sin confirmar").

**Imprimir / PDF:**
- Botón **"Imprimir"** en cada canción y en cada reunión (la reunión entera, en orden).
- Imprime lo que se está viendo: tono elegido, arreglo de la reunión y modo Músico (con acordes) o Cantante (solo letra).
- Versión limpia para papel: sin botones ni menús, acordes alineados, salto de página entre canciones.
- Sin encabezado ni pie del navegador (fecha, título, URL, número de página).
- Título como en los documentos de la iglesia: "Nombre [Tono]" centrado, en una línea; ningún otro dato.
- Cada canción intenta entrar en una hoja, como el documento original: márgenes chicos y, si no entra, la letra se achica hasta 8 pt antes de pasar a otra hoja.
- Reunión: arriba de la primera canción, una sola línea con el nombre de la reunión. Cada canción empieza en hoja nueva.
- Una parte nunca se corta entre hojas; si no entra, pasa entera a la siguiente.
- Usa el diálogo de impresión del sistema. En la compu abre la impresión de siempre; en el celular el mismo diálogo ofrece "Guardar como PDF".

**Datos de la canción:**
- **"▶ Escuchar":** aparece en la canción solo si tiene link. Abre el link en otra pestaña.
- **Completar datos (cualquiera, sin clave):** intérprete, BPM, tono original y link.
  - Tono: se elige de una lista, nunca texto libre. En las canciones modulantes hay una lista por cada tono de la secuencia, con opción de agregar o quitar tonos. BPM: solo número.
  - Antes de guardar: "¿Estás seguro de guardar estos cambios?".
  - Pide el nombre una vez; queda guardado en el dispositivo.
  - Cada cambio guarda quién y cuándo, con historial y "deshacer".
  - El link se completa directo solo si está vacío. Cambiar un link existente va como sugerencia de corrección (ver 9).
- **"Sugerir corrección":** botón al pie de cada canción (ver 9).

**Vista Cantante:**
- Solo letra.
- Mismo ajuste de ancho, con un tamaño inicial más grande y su propio A+/A−.
- Cada repetición se despliega completa.

**Reuniones:**
- Lista ordenada por fecha, la más reciente primero.
- Nueva reunión:
  - Fecha (por defecto, el domingo más próximo).
  - Nombre automático "Viernes 27-11-2026", editable; si el usuario lo edita, no se pisa al cambiar la fecha.
  - Dirige: desplegable más "+ Agregar otro nombre…".
  - Clave de 4 dígitos.
- Al entrar a una reunión se pregunta una sola vez Cantante / Músico. El botón "Modo: Músico ⇄" está en la lista. La elección se recuerda por reunión.
- Las canciones se abren en el tono y el orden de la reunión.
- **Encabezado de la canción** (en la reunión y en la lista), tres renglones: título / intérprete · Tono original X (· BPM) / Dirige X. Sin director, sin el tercer renglón; sin intérprete, solo "Tono original X"; en un medley, "Medley".
- Al final de cada canción, botones grandes "← Anterior · título" / "Siguiente → título"; en la última, "Fin de la reunión".
- **Editar (con clave):**
  - Agregar canción con buscador en vivo (título, letra, director). Al elegirla hay dos opciones:
    - **"Como la última vez":** copia el arreglo de la última reunión donde se tocó.
    - **"Versión base":** la canción como está en el Word.
  - Subir, bajar o quitar canciones.
  - Tocar el nombre de la canción (o del medley), con un › al lado, abre el editor de partes; no hay botón "Editar". Debajo, Tono y "Dirige" en una sola línea (por defecto, Dirige = director de la reunión); ▲ ▼ ✕, el tono y Dirige no abren nada.
  - **Fecha, nombre y director:** ruedita ⚙ al lado del título "Editar reunión" (sin bloques en la pantalla); abre una hoja desde abajo, con la misma clave: se cambian como al crearla y se conservan canciones, tonos y arreglos. El id de la reunión no depende de la fecha, así que links, historial y Registro siguen apuntando bien. Si la fecha nueva ya tiene otra reunión, avisa ("Ya hay una reunión el …") y no cambia nada. Una reunión ya anotada en el Registro no puede cambiar de fecha (el Registro no se modifica nunca). Si el nombre era el automático de la fecha, sigue a la fecha nueva.
- **Partes (editor, pensado para el celular):**
  - Una tarjeta por parte: manija ≡ para arrastrar (o flechas arriba/abajo con la manija enfocada), título, chip de repeticiones (`x2`, popover 1–9), chip de tono y ⋯ (Duplicar, Mostrar igual cuando corresponde, Quitar).
  - Chip de tono (con Modulante): abre una hoja con `=` / `+½` / `+1` / `−½` respecto de la parte anterior o uno de los 12 tonos (el original marcado; elegirlo quita el tono elegido).
  - Primer renglón de la letra (al tocar se despliega completa), sin "(Sube a X)"; nota de transición cuando corresponde.
  - **Deslizar hacia la izquierda borra** la parte, sin diálogo: "Parte borrada · Deshacer" unos segundos.
  - Agregar parte (las opciones muestran su primera línea; en un medley, agrupadas por canción) y volver al orden original.
  - Las clases de la hoja de tono son `.tsheet`/`.tsheetw` (`.sheet` es la hoja de la canción; no reutilizar).
- **Letra (con clave):** el director puede editar la letra de cualquier parte del arreglo de su reunión, igual que los acordes. Solo vale para esa reunión; nunca toca la base.
- **"Proponer para todas las versiones":** convierte los cambios de esa reunión en una sugerencia de corrección de la base (ver 9). No reescribe nada: la sugerencia queda pendiente de revisión.
- **Borrar (con clave):** con confirmación dentro de la página.

**Tono por parte y Modulante** (editor hecho; falta la parte nueva escrita a mano):
- En la configuración de cada canción de la reunión (Editar, con clave → Editar partes) hay un interruptor **"Modulante"**, con la ayuda "Permite cambiar de tono entre partes", y el **tono de inicio**.
- **Apagado:** toda la canción en un solo tono.
  - Todas las partes se transportan al tono elegido.
  - Los acordes puente y las partes de transición se ocultan.
- **Encendido:** se desbloquea el tono por parte.
  1. Se elige el tono de inicio. Por defecto se conservan los intervalos originales entre partes.
  2. En cada parte hay botones `=` / `+½` / `+1` / `−½` respecto de la parte anterior, o se elige un tono absoluto. Se marca el botón que corresponde al tono actual. "Original" vuelve al tono calculado desde el Word (manteniendo el intervalo con la parte anterior). La primera parte va en el tono de inicio; las transiciones toman el tono de la parte siguiente.
     - Cambiar el tono de inicio (en Partes o en Editar reunión) corre también los tonos elegidos por parte, así se conservan las subidas.
  3. El director decide cuántas subidas hace (puede quitarlas o dejar `=` en cualquiera) y en qué tono termina.
  4. **"+ Agregar sección":** duplica una parte (a elección) y le asigna un tono nuevo, por ejemplo un coro extra en D. Solo existe con Modulante encendido. La copia va al final, medio tono arriba de la última parte; después se ajusta con los botones y se mueve con ▲▼.
- Al apagar Modulante, los tonos elegidos por parte quedan guardados (no cuentan) y vuelven al encenderlo.
- Una copia (⧉ o "+ Agregar sección") va sin `pid`: el motor le da uno nuevo.
- **Parte nueva:** el director puede crear en la reunión una parte que no existe en la base (por ejemplo, un interludio) con acordes escritos a mano.
- Las canciones marcadas como Modulante arrancan con el interruptor encendido y los tonos originales.
- **Acordes puente y partes de transición:**
  - No se reemplazan por otro acorde: se transportan según el tono de la parte **siguiente**, así conservan su función respecto del destino. Por ejemplo, "(Eb)" antes de Ab queda "(F#)" si el destino pasa a B.
  - Las transiciones (interludios como "Inter para subir a A") siguen la misma regla: todos sus acordes se transportan según el tono de destino, sin importar su largo.
  - Si la parte siguiente queda en el mismo tono que la actual, el puente y la transición se ocultan por defecto. Hay una opción **"Mostrar igual"**, para quien quiera tocar el interludio aunque no module. En el editor aparece en las transiciones y en las partes con acordes puente o `[ ]` cuando la parte siguiente queda en el mismo tono (también con Modulante apagado).
  - **`[ ]` (modular):** se muestran solo si la parte siguiente cambia de tono, transportados según el tono de destino, igual que los puentes entre paréntesis.
  - **`{ }` (repetir):** se muestran solo si la parte siguiente queda en el mismo tono.
  - **Última parte de la canción:** con Modulante encendido, si tiene `[ ]`, se muestran siempre, transportados al tono de esa parte (es un tag o cierre final).
  - Las dos marcas conviven con "Mostrar igual" y con el modo Modulante. Con Modulante apagado no hay cambios de tono, así que se ven los `{ }` y los `[ ]` se ocultan siempre, también en la última parte.
  - Si la transición original no sirve para el nuevo salto, en esa reunión los músicos pueden editar sus acordes (ver "Arreglo compartido"). Si el arreglo de la base está mal, lo corrige el admin (ver 5).

**Medley (etapa D, aprobada en el celular):**
- Es un ítem dentro de una reunión que combina 2 o más canciones. Usa exactamente el mismo mecanismo de tono por parte.
- Crear: Editar reunión → "Crear medley" → elegir canciones (búsqueda en vivo) → elegir tono de inicio. Se abre directo el editor de partes, con las partes de todas las canciones: reordenar, xN, duplicar, quitar y tono por parte.
- **Borrar deslizando:** en el editor de partes (canción o medley) y en la lista de canciones de "Crear medley", deslizar hacia la izquierda borra, sin diálogo: aparece "Parte borrada · Deshacer" (o "Canción quitada · Deshacer") unos segundos. En la lista del medley ya no hay ✕ (con teclado: Suprimir sobre la manija); en el editor sigue "Quitar" en ⋯.
- **Variantes de una parte (aprobadas):** partes con la misma letra y distintos acordes (ej. "Digno de adorar": Coro 1 y Coro 2) son variantes (`variantesDe` en `js/songs.js`; los mismos acordes en otro tono no cuentan: es la parte repetida después de modular). El director no ve nada nuevo. En la vista Músico de la reunión, el título de esa parte, sin cambiar su tamaño ni su aspecto, lleva un ▾ chico y al tocarlo se abre una hoja; la hoja muestra cada variante (nombre y acordes desde donde se diferencian). Elegir una es un toque, sin clave ni nombre: el motor (`a=elegirVariante`, sin clave ni nombre, mismo límite por minuto que editarAcordes) cambia `src` y `label` de esa parte y guarda `variante: { de, fecha }` (historial solo con fecha y hora); lo ven todos. Si el director guarda después, se respeta (su `src` es el anterior o el nuevo); si cambia esa misma parte a otra, gana el director. Si la parte tenía acordes editados por un músico, pasan al historial (`cambios`). Solo aparece si el orden de la reunión difiere del Word, o en un medley. Cantante no cambia.
- Un medley es Modulante siempre: el interruptor viene encendido.
- Requiere la clave del director, igual que el resto de la edición de reuniones.

**Arreglo compartido de la reunión (lo ven todos):**
- **Director, con clave:** la estructura del arreglo:
  - partes, orden y repeticiones;
  - agregar y quitar partes;
  - tono por parte, Modulante y "mostrar".
- **Músicos, sin clave:** editan los **acordes** de cualquier parte del arreglo de esa reunión; se asume que hay consenso entre los músicos. Nunca la estructura ni los tonos.
  - Queda abierto a cualquiera con el link de la iglesia. El motor exige nombre y limita el tamaño por parte y las ediciones por minuto (ver 4).
  - La primera vez se pide el nombre, que queda guardado en el dispositivo.
  - Cada edición guarda nombre y fecha/hora. El historial de cambios se ve por parte.
  - Por parte: **"Restaurar acordes"**, a la base o a "Como la última vez".
  - Si dos editan la misma parte, gana el último guardado. El anterior queda en el historial y se puede restaurar. El motor serializa las escrituras (LockService).
- **Ajustes personales del músico** (notas propias, ocultar partes en su vista, tamaño): solo en su dispositivo; no se comparten.

**Vistas Músico y Cantante con cambios de tono:**
- La canción (o el medley) se ve como una sola canción continua.
- En cada cambio de tono hay un indicador discreto: "↑ A (+1½)" o "↓ F# (−1½)".
- En un medley, un separador muestra el nombre de cada canción al cambiar. Si una parte no tiene tono propio, al cambiar de canción se sigue en el mismo tono.
- El indicador va en el renglón del título de la parte ("Coro  ↑ A (+1½)").
- **Cifrado (# o b):** sin transporte, los acordes y el tono se ven tal como están escritos en el Word. Con transporte, se elige # o b según el tono de destino: los grados de la escala con la letra que les corresponde y los acordes prestados como bII, bIII, #IV, bVI y bVII (en A: Bb, C, D#, F, G). F# nunca se escribe Gb. E#, B#, Cb y Fb se escriben F, C, B y E.
- En la vista Músico, una parte repetida en el mismo tono va solo con su título; si se repite en otro tono, se ve completa.
- `{ }` en la última parte: se muestran (no hay parte siguiente que cambie de tono).

**Registro de tonos:**
- Se registra la secuencia completa de tonos tocados (`G→Ab→A→Bb→C`) y la referencia al arreglo de esa reunión, para poder repetirlo con "Como la última vez".
- "Tono última vez" muestra esa secuencia completa.
- En un medley, cada canción se registra por separado, con su propia secuencia y quién dirigió.

**Casos de prueba esperados:**
- **"Hay poder [G-Ab-A-Bb-C]".** Partes: Coro 1ª G · Estrofa 1 Ab · Coro 2ª A · Estrofa 2 Bb · Coro 3ª Bb · Coro 4ª C. Puentes escritos: (Eb), (E), (F), (G).
  - *Modulante, original:* G→Ab→A→Bb→Bb→C. Puentes visibles tal como están escritos: (Eb), (E), (F), (G). No hay puente entre Estrofa 2 y Coro 3ª porque quedan en el mismo tono. Registro: `G→Ab→A→Bb→C`.
  - *Modulante con solo 2 subidas* (G, `=`, `=`, `+½`, `=`, `+½`): G→G→G→Ab→Ab→A.
    - Los puentes de Coro 1ª y Estrofa 1 se ocultan (con "Mostrar igual" disponible).
    - El puente de Coro 2ª, escrito (F) para ir a Bb, se transporta al nuevo destino Ab y queda (Eb).
    - El de Coro 3ª, escrito (G) para ir a C, se transporta al destino A y queda (E).
    - Registro: `G→Ab→A`.
  - *Un solo tono (G):* todas las partes en G, puentes ocultos. Registro: `G`.
- **"Al estar aquí [F# - A]".** Partes: Intro y Verso 1 en F#; Verso 2 "(Sube a A)" y Coro 1 en A; Verso 1 "(Baja a F#)" y Coro 2 en F#; "Inter para subir a A" (transición); Coro 1 Final en A; Final en F# (lo agregó la iglesia; es parte de la base). Puente escrito al final de Verso 1: (D/F# - E/Ab).
  - *Modulante, original:* F#→A→F#→A→F#. El puente del Verso 1 se muestra tal como está escrito, (D/F# - E/Ab), porque el destino sigue siendo A. La transición "Inter para subir a A" se muestra con sus acordes originales. Las indicaciones "(Sube a A)" y "(Baja a F#)" se reemplazan por el indicador de cambio de tono. El indicador marca "↓ F# (−1½)" al entrar al Final. Registro: `F#→A→F#→A→F#`.
  - *Un solo tono (F#):* todo en F#. "Inter para subir a A" y el puente quedan ocultos, con "Mostrar igual" disponible. Registro: `F#`.
  - *Modulante, inicio en G* (+½ sobre el original): G→Bb→G→Bb→G. El puente del Verso 1 se transporta al destino Bb y queda (Eb/G - F/A). "Inter para subir a A" se transporta al destino Bb.

## 8. Sin conexión y actualización

- La PWA (service worker) cachea la app y el `cancionero.json`. Al abrir con internet, pide los cambios y actualiza.
- Línea de estado: "Actualizado hoy 10:32" / "Sin conexión · datos del 22-11", más un botón "Actualizar". "Actualizar" solo vuelve a pedir los datos al motor; los cambios de la carpeta entran con la importación (Ajustes, admin).
- Ajustes se abre desde el engranaje del encabezado (y el link del pie, que no aparece dentro de Ajustes).
- **Pantalla (Ajustes):** Automático (el del sistema) / Claro / Oscuro. Es personal, como A+ / A−: se guarda solo en el dispositivo (`cancionero:prefs` → `tema`) y se aplica antes de pintar (script en `index.html`), también al color de la barra del celular.
- **Navegación por niveles** (atrás del celular, flecha del navegador y "←" de la app hacen lo mismo):
  - 0 = Canciones / Reuniones; 1 = una canción, una reunión, Ajustes; 2 = Cantante / Músico, edición; 3 = partes en la edición.
  - Entrar más profundo agrega un paso; mismo nivel (Anterior/Siguiente, modo, pestañas) reemplaza; volver baja un nivel y "adelante" no hace nada.
  - Un link directo arma el historial como si se hubiera entrado desde el nivel 0.
  - En el nivel 0, atrás muestra "Tocá atrás de nuevo para salir"; un segundo toque dentro de 2,5 s sale de la app.
- **Ingreso de admin (Ajustes → Administración):** botón "Iniciar sesión" de Google; no aparece ningún cartel emergente: solo se ingresa al tocarlo. Ya adentro, en el mismo lugar: "Ingresaste como …" y "Cerrar sesión". Se recuerda en el dispositivo mientras vale el token de Google (~1 h); después se vuelve a tocar "Iniciar sesión".
- **Importación desde Ajustes:** avanza por tandas, muestra "X de Y canciones" y, si el motor dice que la tanda anterior sigue corriendo o se corta la conexión, espera 30 s y reintenta sola.
- **Reconversión:** los Word nuevos o modificados se bajan y se convierten. Cuando cambia el conversor (sube `CONV_V`), los Word sin cambios se reconvierten desde la copia de sus párrafos (`Datos/import-parrafos.json`, sin volver a bajarlos) y solo se reescriben las canciones cuyo resultado cambió; `import-log.json` lista las reescritas. Si cambia la lectura del Word (sube `LECTOR_V`), se descarta la copia y se vuelve a bajar todo.
- **Editar reunión:** los cambios se ven al instante y se guardan en segundo plano, en orden; "Listo" espera a que terminen. El editor de partes de cada canción se abre tocando su nombre.
- Sin conexión se puede ver todo. Editar reuniones requiere conexión.
- **Versión nueva:** cada cambio de la app sube `VERSION` en `sw.js`; la versión nueva se activa sola al abrir la app o al volver a ella (sin botón).

## 9. Carga de canciones nuevas

**Generales:**
- **Borradores:** se pueden usar en reuniones con la marca "sin revisar". El admin los aprueba.
- **Modo "corregir acordes" (admin):** tocar un acorde y moverlo a otra sílaba. Corrige la base: se guarda en `Datos/correcciones.json` (ver 5).
- La app NUNCA busca ni copia cifrados de internet por su cuenta.

**Canción nueva (cualquiera, sin clave).** Cuatro formas:
1. **Pegar cifrado:** el texto copiado de LaCuerda, CifraClub o WhatsApp. Viene en ancho fijo, así que los acordes se alinean por columna, de forma exacta. Vista previa (secciones, acordes, transposición) antes de enviar.
2. **Subir archivo** (Word o PDF): misma conversión que la sección 6.
3. **Sin cifrado (solo letra):** también desde una reunión, con "Agregar igual" si la canción no existe. Tono opcional.
4. **"Pedir canción":** sin letra; "quién la pide" es el nombre que se pide siempre.
- Datos:
  - nombre (obligatorio);
  - intérprete (obligatorio, con la opción "No sé");
  - link (opcional);
  - "Comentario" libre (opcional): un pedazo de letra, de dónde la conocen, un link, la versión, etc.
- Aviso de duplicados con dos criterios: **nombre + intérprete** (hay versiones distintas con el mismo nombre) y búsqueda en la **letra**.
- Queda como borrador "sin revisar". El director la puede usar en su reunión igual.

**"Sugerir corrección" (cualquiera, sin clave):**
- Botón al pie de cada canción. Se edita la letra y/o los acordes (y el link existente) y se envía.
- Pide nombre y un comentario opcional.
- Atajo desde una reunión: "Proponer para todas las versiones" (ver 7).

**Pendientes de revisión (admin de cada iglesia, en Ajustes, con Google):** una sola bandeja con los dos tipos de pedido.
- **Correcciones:** antes/después con los cambios marcados → Aprobar / Rechazar (con motivo).
- **Canciones nuevas:** se ven ya convertidas (partes, acordes alineados, tonos detectados). El admin puede corregirlas ahí mismo y aprobar, o rechazar con motivo. Si el intérprete dice "No sé", lo completa.
- Lo aprobado pasa a la base para todos.

**Importación desde la carpeta (Ajustes, admin):** dos botones.
- **"Agregar canciones nuevas"** (ayuda: "Trae las canciones que subiste a la carpeta y todavía no están en la app"). Solo archivos que no estaban.
- **"Revisar cambios en la carpeta"** (ayuda: "Busca canciones que editaste en la carpeta y te muestra los cambios antes de aplicarlos").
  - Mira solo los archivos modificados desde la última importación (fecha en Drive).
  - Nunca aplica solo.
  - Sin conflicto: antes/después → Aplicar.
  - Con conflicto (la misma parte tiene una corrección aprobada en la app): las dos versiones lado a lado; el admin elige por parte "Quedarme con la app" o "Usar la del archivo".
- Las correcciones aprobadas nunca se pierden por una importación.
- En la lista de canciones del admin, una marca visible en las que tienen correcciones hechas en la app.
- En la interfaz no se usa la palabra "Word": se dice "archivo" y "carpeta".

## 10. Diseño

- Usar la skill frontend-design. Partir de la identidad del prototipo:
  - Paleta "Sapphire nightfall" (elegida por Lautaro el 26-11-2026): #0474C4, #5379AE, #2C444C, #A8C4EC, #06457F, #262B40. Fondo claro azulado / noche #262B40.
  - Acordes en azul, secciones en naranja.
  - Fraunces para títulos, Inter para texto.
- Agregar animaciones sutiles y con propósito: transiciones entre pantallas, despliegue de la vista previa de partes, cambio de tono, aparición de resultados. Siempre respetar `prefers-reduced-motion`.
- Prioridad absoluta: legible en el celular durante el culto. Objetivos táctiles de al menos 34 px en los controles compactos y 44 px en los botones principales.
- Modo claro y oscuro.

## 11. Datos iniciales de IBSI (para migrar cuando esté el motor)

- Carpeta raíz: `Música - Cancionero` (Drive del ministerio: adoracion.ibsi@gmail.com).
- Planilla actual: "Cancionero IBSI MAS" (Canciones, Registro, Personas).
- 35 documentos de domingos: `Domingo DD-MM-AAAA.docx`.
- Correcciones manuales de intérprete (primero en la iglesia de prueba; en la planilla real de IBSI, solo con OK explícito):
  - Roca firme → Eric Bustamante
  - Medley Hermoso Nombre → Evangelina Crubinca
  - Alabadle y Santo, Santo, Santo → Marcos Witt
  - Anclado en la roca → Toma Tu Lugar
- Personas: Camilo, Carla, Enoc, Isaac, Kelly, Raquel, Virgi.

## 12. Pendiente de definir (no inventar; preguntar)

- Licencias de letras (por ejemplo, CCLI): lo consulta la directora.
- Empaquetar como APK (Bubblewrap/Capacitor): más adelante y solo para Android.
- Registro desde documentos de domingo y reuniones del mismo día: definir cómo se evitan duplicados (por ahora, la reunión tiene prioridad).
