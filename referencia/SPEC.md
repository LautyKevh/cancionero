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
| Miembro (músico/cantante) | Sin cuenta | Ver canciones y reuniones, transponer, usar sin conexión |
| Director | Sin cuenta, con la clave de 4 dígitos de su reunión | Crear reuniones; editar o borrar las suyas |
| Admin de iglesia | Google Sign-In (solo para acciones de admin) | Configurar carpetas, aprobar canciones, dar de alta personas, otros admins y editores, actualizar versión |
| Superadmin | Lautaro | Publicar versiones; opcional: código de invitación para altas |

- Hay un solo link por iglesia (`…/app/?c=<id>`). No existe un "link de admin": el ingreso con Google aparece solo en Ajustes.
- **Alta autoservicio:** "Crear el cancionero de mi iglesia" → Google Sign-In → queda como admin → comparte su carpeta con el email del motor → el motor crea la estructura e importa. Se puede exigir un código de invitación (activable).
- **Clave de director:** exactamente 4 dígitos numéricos. En la planilla se guarda solo el hash con sal (nunca la clave). Se verifica en el servidor y nunca se envía al cliente. Después de 5 intentos fallidos, bloqueo de 10 minutos por reunión.
- **Admin:** el ID token de Google se verifica en Apps Script, y el email tiene que estar en la lista de admins de esa iglesia.

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
- Columnas: ID, Título, Intérprete, Tono original, BPM, Estado (oficial / borrador / sin cifrado), Archivo fuente, Confianza.
- Puede haber varias versiones de una misma canción, con distinto ID e intérprete.

**Registro:**
- Columnas: Fecha, Canción (ID), Tono, Quién, Origen (domingo / reunión / planilla vieja).
- Se alimenta solo desde las reuniones y desde la lectura de los documentos de `Domingos`.
- Las reuniones se anotan solas al día siguiente de su fecha, con la última versión guardada de la lista: un activador nocturno (3–4 h) y, como respaldo, la primera lectura de la app. Se anotan una sola vez; los cambios posteriores no se trasladan a Registro (no se modifican filas existentes).
- "Quién" puede quedar vacío.

**Personas:** lista libre. Los nombres nuevos que se escriben en "Dirige" se agregan solos.

**Reuniones:**
- Columnas: id, nombre, fecha, director, hash de clave, canciones (JSON: id, tono, quién, arr = [{src, label, rep}]).
- Un ítem de canciones puede ser un medley: `{ tipo: "medley", nombre?, tono, quien, canciones: [{ id, quien? }], arr: [{ cancion, src, label, rep, tono? }] }`. En `arr`, `cancion` indica de qué canción es la parte y `tono` (opcional) cambia el tono desde esa parte en adelante.
- Se pueden borrar. El borrado es lógico, con papelera.

## 6. Conversión Word → canción (reglas probadas en el prototipo; ver `referencia/convert.py`)

- Título y tono salen del primer párrafo: `Título [Tono]`.
- `[Lo que sea]` es un título de sección. Las indicaciones encadenadas se separan, cada una en su línea (`[Coro][Repite final]` → dos títulos). Se aceptan `:` y `x2`/`X2`/`×2` (`[Parte 1]: x2` → "Parte 1 x2").
- Una línea solo con acordes, seguida de una línea de letra, forma un par: cada acorde se ancla a una sílaba.
  - La posición se calcula con las métricas de la fuente del Word (Times New Roman ≈ Liberation Serif) y factor 0,94 para los espacios.
  - Después se ajusta al inicio de la sílaba más cercana.
  - Es aproximado: hace falta un modo "corregir acordes" (ver 9).
- Los guiones bajos de estiramiento (`de_rro__ta`) se eliminan. Los espacios múltiples dentro de la letra se reducen a uno.
- Las líneas mixtas (`[Interludio] // C D G/B //`, `(Db9) (la 4ta vez se mutea)`) se muestran como notas; los acordes se transponen. Las notas sueltas se anclan a una palabra de la línea anterior.
- **Bloques:** desde un `[Título]` hasta el siguiente. Si un título aparece sin contenido (por ejemplo, el segundo "Coro x2"), referencia al primer bloque con el mismo nombre base.

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
- Las canciones se abren en el tono y el orden de la reunión, con "Dirige X" en el encabezado.
- Al final de cada canción, botones grandes "← Anterior · título" / "Siguiente → título"; en la última, "Fin de la reunión".
- **Editar (con clave):**
  - Agregar canción con buscador en vivo (título, letra, director).
  - Subir, bajar o quitar canciones.
  - Tono y "Dirige" por canción (por defecto, el director de la reunión).
- **Partes:**
  - Lista de bloques con vista previa (primera línea; al tocar se despliega la letra completa).
  - Contador de repeticiones `− x2 +` (1–9).
  - Subir, bajar, duplicar (⧉) y quitar.
  - Agregar parte (las opciones muestran su primera línea).
  - Volver al orden original.
- **Borrar (con clave):** con confirmación dentro de la página.

**Medley (fase posterior; el modelo de datos ya lo admite, la interfaz todavía no):**
- Es un ítem dentro de una reunión que combina 2 o más canciones.
- Crear: en Editar reunión → "Crear medley" → elegir canciones (búsqueda en vivo) → elegir tono destino → se abre directo el editor de partes con las partes de todas las canciones (reordenar, xN, duplicar, quitar).
- Tono: único para todo el medley; cada canción se transporta desde su tono original. Opción de cambiar el tono desde una parte en adelante (modulación).
- Vista Músico/Cantante: una sola canción continua, con un separador que muestra el nombre de cada canción al cambiar.
- Registro: cada canción del medley se registra por separado, con el tono en que se tocó y quién dirigió.
- Requiere la clave del director, igual que el resto de la edición de reuniones.

## 8. Sin conexión y actualización

- La PWA (service worker) cachea la app y el `cancionero.json`. Al abrir con internet, pide los cambios y actualiza.
- Línea de estado: "Actualizado hoy 10:32" / "Sin conexión · datos del 22-11", más un botón "Actualizar".
- Sin conexión se puede ver todo. Editar reuniones requiere conexión.

## 9. Carga de canciones nuevas

1. **"Sin cifrado" desde la reunión:** si la canción no existe, "Agregar igual" con nombre, intérprete, tono y link opcional. Va a la lista Pendientes.
2. **"Pedir canción":** nombre, intérprete, link y quién la pide. Va a Pendientes.
3. **"Pegar cifrado":**
   - Se pega el texto copiado de LaCuerda, CifraClub o WhatsApp.
   - Ese texto viene en ancho fijo, así que los acordes se alinean por columna, de forma exacta.
   - Se muestra una vista previa (secciones, acordes, transposición) antes de guardar.
   - Se guarda como borrador.
4. **Subir Word/PDF:** misma conversión que la sección 6. Se guarda como borrador.

Además:
- **Detección de duplicados** al escribir el título: busca en título y letra.
- **Borradores:** se pueden usar en reuniones con la marca "sin revisar". El admin los aprueba.
- **Modo "corregir acordes" (admin):** tocar un acorde y moverlo a otra sílaba; se guarda en el JSON.
- La app NUNCA busca ni copia cifrados de internet por su cuenta.

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
- Correcciones manuales de intérprete:
  - Roca firme → Eric Bustamante
  - Medley Hermoso Nombre → Evangelina Crubinca
  - Alabadle y Santo, Santo, Santo → Marcos Witt
  - Anclado en la roca → Toma Tu Lugar
- Personas: Camilo, Carla, Enoc, Isaac, Kelly, Raquel, Virgi.

## 12. Pendiente de definir (no inventar; preguntar)

- Licencias de letras (por ejemplo, CCLI): lo consulta la directora.
- Empaquetar como APK (Bubblewrap/Capacitor): más adelante y solo para Android.
- Registro desde documentos de domingo y reuniones del mismo día: definir cómo se evitan duplicados (por ahora, la reunión tiene prioridad).
