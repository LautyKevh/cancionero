# Direcciones visuales (propuestas, 28-11-2026)

Maquetas estáticas, **no la app**. Se ven con el servidor local: `referencia/propuestas/maqueta?d=1|2|3&p=lista|cancion|reunion` (claro u oscuro según el sistema). Capturas a 375 px en esta carpeta: `<dirección>-<pantalla>-<claro|oscuro>.png`.

Nombre del sistema, provisorio: **"El atril del culto"** (lo elige Lautaro después).

Las tres mantienen lo decidido en SPEC §10: acordes en azul, títulos de parte en naranja, claro y oscuro, objetivos táctiles de 44 px.

---

## 1 · Zafiro afinado (evolución)

Es la misma app, ordenada. Conserva la paleta Sapphire, Fraunces e Inter, y corrige el sistema en vez de cambiar la identidad: una sola forma por pieza y menos variantes. Es la que menos cambia lo que la banda ya conoce.

- **Tipografía:** Fraunces 600 (títulos), Inter (interfaz, letra y acordes), JetBrains Mono solo para el número del tono.
- **Paleta clara:** fondo #f2f5fa, tarjeta #fff, tinta #1d2236, acordes #0474c4, acción #06457f, secciones #c2410c.
- **Paleta oscura:** fondo #1c2031, tarjeta #262b40, acordes #7fb6f2, acción #c9d9f2 (otro azul, más claro y apagado), secciones #ff9a5c.
- **Barra de controles:** entra en una fila a 375 px. Grupo `−½ · tono · +½`, `Orig.` y un botón **Vista** que abre una hoja con A− / A+, cifrado C/Do/I y Cantante. Nada queda cortado.
- **Chips de tono:** una sola pieza, una píldora mono de 32 px, en la lista, la reunión, el hero y el editor. Cuando sube o baja, se rellena con el azul de acordes del tema y lleva ↑ o ↓.

## 2 · Escenario (alto contraste, pensada para la noche)

Pensada para leer de lejos, con poca luz y con las manos ocupadas. La letra va en Atkinson Hyperlegible, una fuente diseñada para baja visión, y los acordes en una mono ancha. El oscuro es casi negro y la barra va abajo, al alcance del pulgar. Es la más funcional y la menos decorativa.

- **Tipografía:** Atkinson Hyperlegible (títulos, interfaz y letra a 17 px), IBM Plex Mono 700 (acordes y tonos). Títulos de parte en mayúsculas espaciadas.
- **Paleta clara:** fondo #fbfbf8, tinta #0d1020, acordes #0050b3, secciones #b23b00, acción en tinta (negro).
- **Paleta oscura:** fondo #0b0c10, tarjeta #15171e, tinta #f4f1e8, acordes #6cc4ff, secciones #ffb347.
- **Barra de controles:** pasa a un **dock fijo abajo**, con 5 botones de 52 px: `−½ · tono · +½ · A± · ⋯`. El tono grande va en el centro; el resto entra en ⋯.
- **Chips de tono:** "teclas" rectangulares de radio 6, todas iguales. La subida se marca con relleno y ↑.

## 3 · Cuaderno (papel, como la hoja impresa)

Se parece al cancionero en papel de la iglesia: fondo crema, títulos en serif editorial e itálica para las partes. Los tonos van entre corchetes como en los Word ("[Ab]"). Es la más cálida y la más propia; en oscuro pasa a un sepia profundo y no a un azul.

- **Tipografía:** Newsreader 600 (títulos y nombres de canción; partes en itálica), Source Sans 3 (interfaz, letra y acordes).
- **Paleta clara:** papel #f6f2e9, tarjeta #fffdf8, tinta #22201c, acordes #1f4fa3, secciones #b0471f.
- **Paleta oscura:** fondo #191714, tarjeta #221f1b, tinta #ece6d8, acordes #8db3f0, secciones #f0946a.
- **Barra de controles:** una **píldora flotante** abajo y al centro: `−½ · tono · +½ | Aa · Letra`. No ocupa una fila arriba ni se corta.
- **Chips de tono:** el tono entre corchetes con borde fino, como en el Word. La subida se marca con relleno.

---

## Cómo resuelve cada una los 10 "Problemas visuales" (DESIGN.md)

| # | Problema | 1 · Zafiro afinado | 2 · Escenario | 3 · Cuaderno |
|---|---|---|---|---|
| 1 | Colores fijos que no siguen el tema | Ya resuelto en la app (tokens, 28-11); las tres parten de ahí | ídem | ídem |
| 2 | En oscuro, acordes y acciones del mismo color | Acordes #7fb6f2 / acción #c9d9f2 | Acción en tinta (blanco/negro), acordes celestes | Acordes azul / acción azul, pero los botones de acción van en tinta |
| 3 | Demasiados radios | 3 radios: 12 (botones), 14 (tarjetas), píldora | 2: 6 (chips) y 8 (todo lo demás) | 3: 4 (chips), 10–12 (botones y tarjetas), píldora (barra) |
| 4 | Botón neutro repetido en 6 reglas | Un solo `.btn` con variantes `primary` / `neutral` / `quiet` (en las tres) | ídem | ídem |
| 5 | Acciones de la reunión del mismo peso | Modo como botón principal, Editar e Imprimir neutros, Borrar como texto rojo aparte | ídem | ídem |
| 6 | Barra de controles cortada y tono repetido | Una fila que entra + hoja "Vista"; el tono se ve solo en la barra y en el sello | Dock abajo; el tono, solo en el dock y en el sello | Píldora flotante; el tono, solo en la píldora y en el sello |
| 7 | Títulos de parte chicos en Cantante | Mismo tamaño relativo (.82em) en Músico y Cantante | Mayúsculas espaciadas, legibles a 14 px | Serif itálica a .9em |
| 8 | Escala tipográfica sin pasos | 12 / 13,5 / 14 / 16 / 24 / 30 / 34 | 12 / 14 / 16 / 17 / 22 / 30 | 12 / 13,5 / 16 / 18 / 26 / 32 / 36 |
| 9 | Chips de tono con cuatro formas | Píldora mono única | Tecla rectangular única | Corchetes únicos |
| 10 | Ajustes vacío y suelto | Mismo patrón de lista con títulos en Fraunces (no maquetado) | Lista en tarjetas de borde (no maquetado) | Secciones con filete superior como el hero (no maquetado) |

Ajustes no se maquetó (las pantallas pedidas son lista, canción y reunión); la fila 10 dice cómo se aplicaría.
