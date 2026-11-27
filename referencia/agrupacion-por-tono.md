# Agrupar versiones que solo cambian de tono

**Estado:** implementado solo en la app (rama `desarrollo`, en prueba). La lista de grupos está en `js/grupos.js` (se genera con el script de clasificación; datos: iglesia de prueba, 27-11-2026). En Drive y en la planilla nada cambia: cada Word sigue siendo una canción con su id.

## Cómo funciona en la app
- Cada grupo aparece **una sola vez** en la lista de canciones, en el buscador de Editar reunión y en el de "Crear medley".
- **Búsqueda:** se busca en todos los Word del grupo (título, intérprete, letra, director); el resultado muestra el Word representativo.
- **Tono que se muestra** (y Word representativo):
  1. tono original del intérprete registrado — todavía no existe el campo (Prioridad 3), no aplica;
  2. si no, el **más usado en el Registro** (y reuniones no volcadas) entre todos los Word del grupo; empate: el más reciente. Se muestra el Word que está en ese tono; si ninguno lo está, el Word más usado. En la ficha dice "Tono más usado";
  3. si no hay registros, el **primer Word** por nombre de archivo, con "Tono original no registrado".
- **Historial:** "Última vez" y "Tono por persona" suman todos los Word del grupo.
- Reuniones, historial y Registro que usan cualquiera de los Word siguen funcionando igual (cada ítem guarda su id).

## Criterio
Mismo título base (sin paréntesis ni número final) + misma letra (sin contar los nombres de parte) + acordes que son un transporte. Tipos:
- **Confirmado:** transporte exacto en todos los acordes.
- **Nombres de parte distintos:** igual que confirmado, pero los nombres de las partes no coinciden (se comparan ignorándolos). Se agrupan.
- **Acorde distinto por error del Word:** misma letra y hasta 3 acordes que no siguen el transporte (sobra, falta o cambia uno). Se agrupan y el error queda en PENDIENTES → Revisar para corregir el Word.

## Grupos (56 grupos, 128 Word)

| Canción | Word | Tipo | Error a corregir en el Word |
|---|---|---|---|
| A ti me rindo | [Eb] · [F] | Confirmado |  |
| Agnus Dei | [A] · [F] · [G] | Acorde distinto por error del Word | `agnus-dei-2` (contra `agnus-dei`): D→Bb(Dm), D(F#m)→Bb(Dm); `agnus-dei-3` (contra `agnus-dei`): (sobra)→C, D→C/E, D(F#m)→C/E |
| Al único que es digno | [A] · [D] | Confirmado |  |
| Alaba | [A] · [F] · [G] | Nombres de parte distintos |  |
| Alabaré al Señor (Anástasis) | [A] · [C] | Acorde distinto por error del Word | `alabare-al-senor-anastasis-2` (contra `alabare-al-senor-anastasis`): B→(falta), Bm→F |
| Anclado en la roca (YAHWEH) | [B] · [C] | Acorde distinto por error del Word | `anclado-en-la-roca-yahweh-2` (contra `anclado-en-la-roca-yahweh`): D#/B→C/E, D#/B→C/E |
| Aquí estoy | [A] · [F] | Confirmado |  |
| Aqui te esperaré | [A] · [Bb] | Confirmado |  |
| Because He lives | [A] · [E] | Acorde distinto por error del Word | `because-he-lives-2` (contra `because-he-lives`): Bm7→F#m |
| Con mis manos levantadas (Simple) | [E] · [G] | Confirmado |  |
| Cuánto vales Cristo | [A] · [C] | Confirmado |  |
| Cuanto vales, Cristo + Si vale la pena | [A] · [C] | Confirmado |  |
| Deseo Eterno | [A] · [E] | Nombres de parte distintos |  |
| Digno (Elevation) | [C] · [D] | Acorde distinto por error del Word | `digno-elevation-2` (contra `digno-elevation`): A→G |
| Digno es el Señor | [A] · [C] | Acorde distinto por error del Word | `digno-es-el-senor-2` (contra `digno-es-el-senor`): D(E)→F(G) |
| El Cordero y el León | [C] · [D] | Confirmado |  |
| El infinito Dios | [C] · [G] | Confirmado |  |
| El nombre | [C] · [Eb] | Confirmado |  |
| El nombre de Jesús | [C] · [C#] | Nombres de parte distintos |  |
| Eres Rey de los cielos | [A] · [F] | Confirmado |  |
| Es Él | [A] · [Bb] | Confirmado |  |
| Este es el reino | [A] · [C] | Nombres de parte distintos |  |
| Gracia sobre gracia | [Am] · [Em] · [Fm] | Confirmado |  |
| Hay poder | [E-F-F#-G-A] · [G-Ab-A-Bb-C] | Confirmado |  |
| Hermoso - No volveré atrás | [A] · [A] · [D] | Acorde distinto por error del Word | `hermoso-no-volvere-atras-2` (contra `hermoso-no-volvere-atras`): A/F#→A/C#; `hermoso-no-volvere-atras-3` (contra `hermoso-no-volvere-atras`): A/F#→D/F# |
| Hermoso nombre | [A] · [C] · [D] | Nombres de parte distintos |  |
| Infinito Dios | [C] · [G] | Confirmado |  |
| Jesús | [D] · [F] | Confirmado |  |
| Jesús en el centro | [C] · [F] | Confirmado |  |
| La sangre de Jesus | [A] · [C] | Confirmado |  |
| Lo haras otra vez | [Bb] · [C] · [D] | Confirmado |  |
| Lo único que quiero | [C] · [F#] · [G] | Confirmado |  |
| Mi plenitud | [A] · [C] | Confirmado |  |
| No hay lugar más alto | [A] · [C] | Acorde distinto por error del Word | `no-hay-lugar-mas-alto-2` (contra `no-hay-lugar-mas-alto`): F#m→A |
| No hay otro nombre | [C] · [D] · [G] | Confirmado |  |
| No yo, sino Cristo | [B] · [E] | Confirmado |  |
| Nombre sobre todo nombre | [C] · [Eb] | Confirmado |  |
| Nuestra prioridad | [A] · [C] | Confirmado |  |
| Oh tu fidelidad (Majo Solis) | [B] · [C] | Acorde distinto por error del Word | `oh-tu-fidelidad-majo-solis-2` (contra `oh-tu-fidelidad-majo-solis`): F#7dim→G7dim, F#7dim→G7dim |
| Quién más | [Ab] · [G] | Confirmado |  |
| Rey de gloria | [C] · [E] | Confirmado |  |
| Roca firme | [A] · [Bb] · [C] | Acorde distinto por error del Word | `roca-firme-2` (contra `roca-firme`): A/C#→BbM7/D; `roca-firme-3` (contra `roca-firme`): A/C#→CM7/E |
| Santo | [C] · [D] | Confirmado |  |
| Santo por siempre | [C] · [E] · [G] | Nombres de parte distintos |  |
| Solo Cristo | [B] · [C] | Confirmado |  |
| Solo hay uno | [B] · [Bb] · [C] · [G] | Acorde distinto por error del Word | `solo-hay-uno-3` (contra `solo-hay-uno`): F#→Em/G, C→(falta), (F#))→(falta) |
| Te doy gloria | [A] · [C] · [D] · [F] | Nombres de parte distintos |  |
| Temprano yo te buscaré | [F] · [G] | Confirmado |  |
| Toma tu lugar | [Bb] · [C] | Acorde distinto por error del Word | `toma-tu-lugar-2` (contra `toma-tu-lugar`): (sobra)→F/A, (sobra)→F/A, (sobra)→F/A |
| Tu mirada | [A] · [F] · [F#] | Confirmado |  |
| Tu mirada + Temprano | [F] · [F#] | Acorde distinto por error del Word | `tu-mirada-temprano-2` (contra `tu-mirada-temprano`): (Intro)→(falta) |
| Tumbas a Jardines | [B] · [C] · [E] | Nombres de parte distintos |  |
| Una vez | [C] · [G] | Acorde distinto por error del Word | `una-vez-3` (contra `una-vez-2`): (sobra)→D |
| Ven ante Su trono | [A] · [Eb] | Acorde distinto por error del Word | `ven-ante-su-trono-2` (contra `ven-ante-su-trono`): G→G#, D→D#, (sobra)→D# |
| Ya no soy esclavo | [Bb] · [C] | Confirmado |  |
| Yo sé quien soy yo | [A] · [D] | Nombres de parte distintos |  |

## Letra casi igual: siguen separados (falta tu sí/no)
Diferencia exacta de letra, una línea por canción (palabras sin acentos ni signos).
- **Aquí estoy** [A] y [D]: después de "me acerco a ti": "que puedo hacer que puedo decir te ofrezco mi corazon completamente a ti" / ""
- **Con tu sangre** [D-Eb] y [D]: después de "corde ero de dios": "padre eterno corde ero de dios sube a" / ""
- **El Dios que adoramos** [F] y [F#]: después de "para los muertos levantar": "nadie es como tu" / "pre coro nadie es como el"
- **El Dios que adoramos** [F] y [G]: después de "levantar nadie es como": "tu" / "el"
- **El Dios que adoramos** [F#] y [G]: después de "para los muertos levantar": "pre coro" / ""
- **Él nos ama** [A] y [C]: después de "y la tierra se": "unen" / "unan"
- **El victorioso** [Am] y [Dm]: después de "la victoria del senor": "c am" / "f dm"
- **Levanto un aleluya** [D] (New) y [D]: después de "": "solo" / ""
- **No voy a caer** [A] y [C]: después de "una bandera alzare jesus": "jesus jesus jesus" / ""
- **Por siempre** [Ab] y [G]: después de "vivo esta vivo esta": "la tierra retumbo la piedra el quito su amor perfecto siempre vencera el rey …" / ""

## Misma letra pero muchos acordes distintos: siguen separados
Más de 3 acordes no siguen el transporte, así que no se agrupan (no se adivina). Pueden ser arreglos distintos o acordes que el conversor no lee bien.
- **Aqui te esperaré** [A] y [C]: 4 acordes distintos (35 y 39): (sobra)→F/D, (sobra)→G2, (sobra)→C/E, (sobra)→F2
- **Digno (Elevation)** [C] y [Eb]: 7 acordes distintos (68 y 73): (sobra)→Bb, (sobra)→Bb, (sobra)→Bb, (sobra)→Bb, (sobra)→Eb …
- **El Cordero y el León** [A] y [C]: 18 acordes distintos (28 y 46): (sobra)→C9, (sobra)→Dm, (sobra)→F, (sobra)→C9, (sobra)→Dm …
- **En el nombre de Jesus (Paz)** [D] y [D]: 13 acordes distintos (35 y 35): (sobra)→D, (sobra)→C, (sobra)→D, G→(falta), Em→(falta) …
- **Más el Dios de toda gracia** [A] y [Bb]: 16 acordes distintos (38 y 33): A→(falta), G→(falta), D/F#→(falta), A/E→(falta), E→(falta) …
- **Más que vencedor** [Am] y [Dm]: 11 acordes distintos (41 y 41): D→Gm, (sobra)→C, (sobra)→A, D→Dm, (sobra)→Bb …
- **No hay otro nombre** [C-D] y [C]: 42 acordes distintos (135 y 132): C→(falta), G/B→(falta), C→(falta), Dm→C, C→G/B …
- **Oh tu fidelidad (Himno)** [C] y [B]: 19 acordes distintos (82 y 87): (sobra)→B9, C→F#7dim, (sobra)→E7/F#, (sobra)→E°7/F#, F/G→F#/E …
- **Por su gracia** [A] y [G]: 4 acordes distintos (67 y 69): (sobra)→C, E→C, (sobra)→C, E→C
- **Santo** [B] y [C]: 7 acordes distintos (62 y 63): E→F/A, F→G4, C→C, G#m→C/A, G#m→C/A …
- **Solo Cristo** [A] y [B]: 6 acordes distintos (75 y 75): D/B→C#m7, D/B→C#m7, D/B→C#m, D/B→C#m, D/B→C#m7 …
- **Tus cuerdas de amor** [F] (Julio) y [F] (Lowsan): 20 acordes distintos (70 y 75): F/E→(falta), F/E→(falta), Gsus/C→Bb, (sobra)→C, (sobra)→F/D …
