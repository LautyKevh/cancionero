---
name: Cancionero
description: Cancionero de alabanza para el celular — letra, acordes, tonos y reuniones, legible durante el culto.
colors:
  # Claro (por defecto)
  bg: "#f2f5fa"
  card: "#ffffff"
  ink: "#1d2236"
  mute: "#5a6782"
  line: "#d8e0ec"
  chord: "#0474c4"
  chord-soft: "#e2edf9"
  accent: "#06457f"
  accent-soft: "#dfe8f5"
  section: "#c2410c"
  danger: "#b42318"
  hero: "#06457f"
  hero-ink: "#f2f5fa"
  hero-chip: "#a8c4ec"
  online: "#2f9e5b"
  print-chord: "#0a3d8f"
  # Oscuro (prefers-color-scheme: dark o data-theme="dark")
  dark-bg: "#1c2031"
  dark-card: "#262b40"
  dark-ink: "#e8ecf5"
  dark-mute: "#9aa6c0"
  dark-line: "#353d58"
  dark-chord: "#a8c4ec"
  dark-chord-soft: "#2d3a5c"
  dark-accent: "#a8c4ec"
  dark-accent-soft: "#2d3a5c"
  dark-section: "#ff9a5c"
  dark-danger: "#ff6b5e"
typography:
  display:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "clamp(28px, 6vw, 38px)"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "-0.015em"
  headline:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "clamp(24px, 4.6vw, 34px)"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: 1.2
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: 1.4
  key:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "15px"
    fontWeight: 700
    lineHeight: 1
  sheet:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "var(--fs, 16px)"
    fontWeight: 400
    lineHeight: 1.35
rounded:
  xs: "6px"
  sm: "8px"
  md: "10px"
  r: "12px"
  lg: "14px"
  xl: "18px"
  hero: "20px"
  pill: "99px"
spacing:
  gutter: "max(4.5vw, 16px)"
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  max-width: "900px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "0 18px"
    height: "44px"
  button-primary-wide:
    backgroundColor: "{colors.accent}"
    textColor: "#ffffff"
    rounded: "{rounded.lg}"
    height: "52px"
  button-neutral:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "0 12px"
    height: "40px"
  button-danger:
    backgroundColor: "{colors.danger}"
    textColor: "#ffffff"
    rounded: "{rounded.sm}"
    padding: "0 12px"
    height: "40px"
  control-compact:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    height: "36px"
    width: "34px"
  key-chip:
    backgroundColor: "{colors.chord-soft}"
    textColor: "{colors.chord}"
    typography: "{typography.key}"
    rounded: "{rounded.sm}"
    padding: "5px 8px"
  key-chip-part:
    backgroundColor: "{colors.chord-soft}"
    textColor: "{colors.chord}"
    typography: "{typography.key}"
    rounded: "18px"
    height: "36px"
    padding: "0 12px"
  key-chip-part-up:
    backgroundColor: "{colors.chord}"
    textColor: "#ffffff"
  key-stamp:
    backgroundColor: "{colors.chord-soft}"
    textColor: "{colors.chord}"
    rounded: "{rounded.md}"
    padding: "6px 10px 5px"
  card:
    backgroundColor: "{colors.card}"
    rounded: "{rounded.lg}"
    padding: "12px 14px"
  hero-card:
    backgroundColor: "{colors.hero}"
    textColor: "{colors.hero-ink}"
    rounded: "{rounded.hero}"
    padding: "18px 18px 16px"
  list-row:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    padding: "13px 4px"
    height: "56px"
  input:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "10px"
    height: "44px"
  search:
    backgroundColor: "{colors.card}"
    rounded: "{rounded.pill}"
    padding: "12px 14px 12px 44px"
    height: "48px"
  bottom-sheet:
    backgroundColor: "{colors.card}"
    rounded: "20px 20px 0 0"
    padding: "8px {spacing.gutter} 18px"
  confirm:
    backgroundColor: "{colors.card}"
    rounded: "{rounded.md}"
    padding: "10px 12px"
  tab-bar-item-on:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.accent}"
    rounded: "{rounded.lg}"
    height: "52px"
---

# Design System: Cancionero

> Describe la app tal como está hoy (v65, rama `desarrollo`), sacado de `css/app.css`, `index.html` y las capturas de `referencia/capturas/`. No propone cambios: los problemas van al final.

## Overview

**Creative North Star: "El atril del culto"** (nombre provisorio, a confirmar con Lautaro).

Es una herramienta de uso (modo *Operate*): la gente la abre en el celular, de pie, con poca luz o al sol, y necesita leer letra y acordes de un vistazo. La identidad sale del prototipo: paleta "Sapphire nightfall" (azules profundos y un azul cielo para la noche), Fraunces como voz de títulos, Inter para todo lo demás y JetBrains Mono para lo musical (tonos, acordes, cifrado). La única nota cálida es el naranja de los títulos de parte.

Densidad media-alta en la hoja de la canción (renglón de acordes pegado a la letra, ajuste automático del tamaño), y aire generoso en las pantallas de navegación (filas de 56 px, tarjetas de modo de 132 px). Plano, con profundidad casi solo por tono de superficie: las sombras se reservan para lo que se levanta (tarjeta de próxima reunión, parte arrastrada, menús).

**Key Characteristics:**
- Azul = música (acordes, tonos, chip de tono); azul oscuro = acción (botones, pestaña activa, enlaces); naranja = estructura (títulos de parte).
- Tres familias con roles fijos: serif para títulos, sans para interfaz y letra, mono para tonos y acordes.
- Barra de pestañas abajo, al alcance del pulgar; controles de la canción en una sola fila que se va con el scroll.
- Claro y oscuro con los mismos tokens; la tarjeta "Próxima reunión" queda azul en ambos.
- Movimiento corto y con propósito (View Transitions entre pantallas, escala al tocar), apagado con `prefers-reduced-motion`.

## Colors

Tokens en `:root` de `css/app.css`, redefinidos para oscuro en `@media (prefers-color-scheme: dark)` (si no se forzó claro) y en `:root[data-theme="dark"]`. El tema se elige en Ajustes (Automático / Claro / Oscuro) y se aplica antes de pintar.

### Primary
- **Azul acorde** (`--ch`, #0474c4 / oscuro #a8c4ec): acordes, tono actual, chips y sello de tono, repeticiones `x2` activas. Fondo suave `--ch-soft` (#e2edf9 / #2d3a5c).
- **Azul acción** (`--acc`, #06457f / oscuro #a8c4ec): botón principal, enlace "← Volver", pestaña activa, foco, ⚙ al pasar. Fondo suave `--acc-soft` (#dfe8f5 / #2d3a5c).

En oscuro `--ch` y `--acc` son el mismo #a8c4ec: acordes y acciones pasan a tener el mismo color.

### Secondary
- **Naranja sección** (`--sec`, #c2410c / oscuro #ff9a5c): solo títulos de parte (`[Coro]`), el puntito del tono original en la hoja de tono, el borde de la vista previa de una parte y el punto "sin conexión".

### Neutral
- **Fondo** `--bg` #f2f5fa (claro azulado) / #1c2031.
- **Tarjeta** `--card` #ffffff / #262b40 (el "noche" de la paleta).
- **Tinta** `--ink` #1d2236 / #e8ecf5.
- **Apagado** `--mute` #5a6782 / #9aa6c0: subtítulos, ayudas, íconos.
- **Línea** `--line` #d8e0ec / #353d58: bordes de 1 px y separadores de fila.

### Especiales
- **Hero** `--hero` #06457f con `--hero-ink` y `--hero-chip` #a8c4ec: tarjeta "Próxima reunión", igual en los dos temas.
- **Peligro** `--danger` #b42318 / #ff6b5e: "Sí, borrar", errores, "Quitar" en menús.
- **Verde en línea** #2f9e5b (sin token): punto de estado y "ok" en Ajustes.
- **Impresión**: negro sobre blanco; acordes #0a3d8f.
- Fuera de tokens: chip de tono `.k.up` #0474c4 / `.k.dn` #06457f y botones presionados de la hoja de tono (#0474c4) están fijos y no cambian en oscuro; borde de borrar deslizando #c0392b.

## Typography

**Display:** Fraunces 600 (opsz 9..144), con Georgia de respaldo.
**Body:** Inter 400/500/600/700, con system-ui.
**Mono:** JetBrains Mono 500/700, para tonos, acordes y el editor de partes.
Cargadas de Google Fonts en `index.html`.

### Hierarchy
- **Display** (Fraunces 600, clamp 28–38 px, lh 1.05, −0.015em): "Cancionero" en el encabezado.
- **Headline** (Fraunces 600, clamp 24–34 px, lh 1.1): título de canción, reunión, Ajustes, Editar reunión. `text-wrap: balance`.
- **Hero** (Fraunces 600, clamp 24–30 px): nombre de la próxima reunión.
- **Title** (Fraunces 600, 18–20 px): grupos de lista ("Próximas"), Cantante / Músico, títulos de hojas, número del día (22 px).
- **Sello de tono** (Fraunces 600, 30 px, cifras de línea): el tono grande arriba a la derecha.
- **Body** (Inter 400, 16 px, lh 1.5): todo el texto de interfaz; nombres de canción en filas a 600.
- **Label** (Inter 500–600, 12–14 px): metadatos (13 px en `--mute`), botones compactos 12,5–14 px, pestañas 12 px.
- **Hoja Músico**: letra en Inter, acordes en Inter 700 a .95em sobre la sílaba, renglones solo de acordes en JetBrains Mono 700; títulos de parte Inter 600 a .85em en naranja. Tamaño base `--fs` (16 px, ajustado automáticamente, mínimo 11 px).
- **Hoja Cantante**: Inter, lh 1.5, títulos de parte a .7em.
- **Impresión**: 11 pt (Cantante 12 pt), lh 1.15, título Fraunces 700 15 pt centrado, mínimo 7,5 pt.

## Layout

- Columna única, `max-width: 900px`, centrada. Margen lateral `--gut: max(4.5vw, 16px)`.
- `main`: 12 px arriba, 40 px abajo. Encabezado (iglesia + "Cancionero" + ⚙) solo en las pantallas de nivel 0.
- **Barra de pestañas inferior** sticky, dos columnas, vidrio (92 % de tarjeta + blur 10 px), borde superior, respeta `safe-area-inset-bottom`.
- **Buscador** sticky arriba de la lista, con el fondo de la página.
- **Filas** de lista: alto mínimo 56 px, separador de 1 px, chip de tono a la derecha.
- **Controles de la canción**: una fila con scroll horizontal oculto, botones de 36 px, gap 3 px; no fijos.
- **Anterior / Siguiente**: grilla de 2 columnas, botones de 72 px.
- Espaciado real: 2, 3, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 32 px. No hay escala nombrada salvo `--gut`; la mayoría de valores están escritos a mano.
- Objetivos táctiles: 44 px en principales (52 px en pestañas y botón ancho), 34–40 px en compactos.

## Elevation & Depth

Plano por defecto; la profundidad sale del contraste fondo (`--bg`) / tarjeta (`--card`) y bordes de 1 px. Sombras solo en:
- **Tarjeta hero**: `0 12px 30px -16px rgba(6,69,127,.8)`.
- **Parte levantada al arrastrar**: `0 14px 30px -12px rgba(6,69,127,.45)`, escala 1.02 y −0.6°.
- **Menús (⋯, repeticiones)**: `0 16px 36px -18px rgba(29,34,54,.5)`.
- **Desplegable de sugerencias**: `0 12px 24px -18px rgba(6,69,127,.5)`.
- **Botón "↺ Volver a X"**: sombra dura `0 2px 0 var(--ch)` que se hunde al tocar.
- Velo de las hojas: `rgba(20,24,40,.38)`. Barra inferior con `backdrop-filter: blur(10px)`.

## Shapes

- Radios: 6 (partes en edición), 8 (`--r-sm`: controles, inputs), 9–10 (chips, confirmaciones, botón principal), 12 (`--r`: Anterior/Siguiente, menús, fecha), 14 (tarjeta de parte, datos, pestaña activa, botón ancho), 18 (tarjetas de modo, chip de tono de parte), 20 (hero, hojas desde abajo), 99 (buscador, píldoras), círculos (⚙, avatares, números, ⋯).
- Bordes de 1 px `--line` en casi todo; 2 px en el sello de tono; punteado para partes de transición y vista previa.
- Íconos de trazo (SVG, 1.8–2.2 px, puntas redondeadas), sin relleno salvo las teclas negras del piano.

## Components

### Botones
- **Principal** (`.primary`): fondo `--acc`, texto blanco (en oscuro, texto #1c2031 sobre #a8c4ec), 44 px, radio 10, 15 px 600. Variante ancha 52 px / radio 14 ("Listo"). Al tocar, escala .98.
- **Neutro**: fondo tarjeta, borde `--line`, 40–44 px, radio 8, 14 px 600 (Imprimir, Editar, Borrar, No, Actualizar). Varias reglas casi iguales (`.sheetend`, `.askf`, `.edr`, `.adm`, `.acbt .neutro`).
- **Peligro** (`.danger`): fondo `--danger`, texto blanco, 40 px, radio 8.
- **Compacto** (`.ctl`, `.tools`): 36 px, mínimo 34–36 px de ancho, radio 8; al tocar escala .94 y fondo `--ch-soft`.
- **Ícono redondo**: ⚙ 44 px, ruedita 40 px, ✎ 34 px, ⋯ 40 px; al pasar, `--acc-soft`.
- **Segmentado** (`.seg`): contenedor con borde, opciones de 40 px; la activa con `--acc-soft`.

### Tarjetas
- **Próxima reunión** (hero): azul profundo, radio 20, chip "Mañana", nombre en Fraunces, lista de canciones con mini chips de tono, "Abrir la reunión ›".
- **Modo** (Cantante / Músico): dos tarjetas de 132 px, ícono en cuadro suave (azul acción / azul acorde), título Fraunces 20.
- **Historial** y **Datos de la canción**: fondo tarjeta, borde, radio 10–14, filas separadas por línea; título de Datos en mayúsculas 13 px.
- **Parte** (editor): grilla manija | título + `xN` | chip de tono | ⋯, abajo la primera línea de letra; radio 14; transición con borde punteado y fondo transparente.

### Chips de tono
- **Lista y reunión** (`.key`): mono 700 14 px, `--ch` sobre `--ch-soft`, radio 9, ancho mínimo 40.
- **Sello** (`.stamp`): recuadro de 64 px con borde 2 px `--ch`, tono en Fraunces 30 y etiqueta 11 px ("Tono", "Reunión", "↺ Volver a X").
- **Parte** (`.k`): píldora de 36 px; normal suave, sube #0474c4, baja #06457f, texto blanco.
- **Repeticiones** (`.rp`): píldora de 26 px; `x1` apagada con borde, `x2+` en azul acorde.
- **Mini** en hero: mono 13 px sobre azul translúcido.
- **Medley** (`.medtag`): píldora 11 px `--acc-soft`.

### Hojas que suben desde abajo (`.tsheet`)
Fija abajo, `max-width: 560px`, radio 20 20 0 0, manija de 40×4 px, título Fraunces 20, subtítulo 13 px apagado, encabezados de grupo 13 px 600. Hoja de tono: 4 botones relativos (`=`, `+½`, `+1`, `−½`, 46 px) y 12 tonos en 6 columnas (42 px); el elegido en #0474c4 relleno, el original con punto naranja. Termina en "Listo" ancho. La hoja de edición de una parte (`.acsheet`) ocupa el 92 dvh con scroll propio. Velo oscuro detrás.

### Confirmaciones (`.askf.confirm`)
Recuadro dentro de la página (no modal), fondo tarjeta, borde 1 px (rojo si borra), radio 10. Pregunta arriba; abajo a la derecha "No" (neutro, fondo `--bg`) y "Sí, …" (principal, o rojo "Sí, borrar"). La misma caja sirve para pedir la clave de 4 dígitos (input con letter-spacing .3em).

### Listas e inputs
- Filas sin fondo, separador de 1 px, hover con tarjeta al 70 %. Reuniones con bloque de fecha de 52×56 px (número Fraunces 22, mes en azul).
- Inputs 44 px, 16 px (sin zoom en iOS), borde `--line`, radio 8. Buscador en píldora de 48 px con lupa.
- Interruptor "Modulante": checkbox nativo de 22 px con `accent-color`.

### Navegación
- "← Atrás" como enlace azul 600, 44 px de alto.
- Pestañas inferiores con ícono 24 px + rótulo 12 px; activa con fondo `--acc-soft` y trazo más grueso.
- Toast fijo abajo al centro, invertido (tinta sobre fondo), con "Deshacer" subrayado.

### Movimiento
- Easing único `--ease: cubic-bezier(.2,.7,.2,1)`.
- Entre pantallas: View Transitions, salida 160 ms y entrada 260 ms con 24 px de desplazamiento según la dirección; el sello de tono se transforma (300 ms).
- Al tocar: escala .94–.985 en 100–150 ms. Reordenar partes: las demás se corren 180 ms.
- `prefers-reduced-motion: reduce` apaga transiciones y animaciones.

## Do's and Don'ts

**Do**
- Usar `--ch` solo para lo musical (acordes, tonos) y `--acc` para acciones.
- Reservar el naranja para títulos de parte.
- Mantener 44 px en botones principales y al menos 34 px en compactos.
- Fraunces solo en títulos; números de tono y acordes en mono.
- Confirmaciones dentro de la página: "No" primero, "Sí, …" después, rojo solo para borrar.
- Probar a 375 px y en los dos temas.

**Don't**
- No usar `.sheet` para hojas nuevas (es la hoja de la canción): `.tsheet`.
- No escribir "Word" en la interfaz: "archivo" y "carpeta".
- No agregar botones a la barra de controles de la canción.
- No usar sombras como decoración en superficies planas.

## Problemas visuales

Lo que se ve inconsistente hoy (capturas en `referencia/capturas/`):

1. **Colores fijos que no cambian con el tema:** el chip de tono que sube/baja (`.k.up`/`.k.dn`), los botones elegidos de la hoja de tono y de variantes (#0474c4) y el verde de estado están escritos a mano; en oscuro quedan con el azul del modo claro.
2. **En oscuro, acordes y acciones son el mismo color** (#a8c4ec para `--ch` y `--acc`): se pierde la distinción "azul = música / azul oscuro = acción" que sí existe en claro (captura 14).
3. **Demasiados radios:** 6, 8, 9, 10, 12, 13, 14, 18, 20 y 99 px conviven sin regla; el botón principal (10) y los neutros (8) que van uno al lado del otro tienen esquinas distintas (confirmación, captura 12).
4. **Botón neutro repetido en 6 reglas casi iguales** (`.sheetend`, `.askf`, `.edr`, `.adm`, `.acbt .neutro`, `.form`) con alturas de 40 o 44 px y fondos `--card` o `--bg` según dónde esté: en la confirmación "No" va sobre `--bg` y en la reunión "Imprimir" sobre `--card`.
5. **Fila de acciones de la reunión con alturas y pesos parejos para cosas de distinto peso:** "Modo: Músico", "Imprimir", "Editar" y "Borrar" son iguales; "Borrar" no se distingue de las demás y el grupo queda pegado al borde derecho (captura 06).
6. **La barra de controles de la canción se corta** a 375 px ("Cantant…" queda tapado sin pista de que hay más), y el tono actual (`Ab`) aparece dos veces, en la barra y en el sello (capturas 03 y 11).
7. **Títulos de parte muy chicos en Cantante** (.7em ≈ 11 px naranja) frente a la letra; en Músico van a .85em: misma pieza, dos tamaños.
8. **Escala tipográfica sin pasos definidos:** 9,5 / 10 / 10,5 / 11 / 12 / 12,5 / 13 / 13,5 / 14 / 15 / 16 px aparecen en el CSS; los metadatos usan 12, 13 o 14 según la pantalla.
9. **Chips de tono distintos según el lugar:** en la lista son rectángulos de radio 9, en el editor píldoras de 36 px, en el hero cuadros translúcidos y en la hoja de tono botones de 42 px; el mismo dato tiene cuatro formas.
10. **Ajustes se ve vacío y suelto:** secciones con títulos en Inter 15 px (no Fraunces como el resto de títulos de sección), sin tarjetas, y la barra de estado queda al pie lejos del contenido (captura 10).

### Capturas (375 px)
`01-canciones` · `02-cancion-elegir-modo` · `03-cancion-musico` · `04-cancion-cantante` · `05-reuniones` · `06-reunion` · `07-editar-reunion` · `08-editor-partes` · `09-hoja-tono` · `10-ajustes` · `11-reunion-cancion-musico` · `12-confirmacion-borrar` · `13-canciones-oscuro` · `14-cancion-musico-oscuro`.
