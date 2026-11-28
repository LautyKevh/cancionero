# Tareas a mano en el Drive (antes de completar los datos de las canciones)

**Generado:** 28-11-2026, con los Word actuales de la iglesia de prueba (299 importados, después de tus correcciones y la reimportación de hoy). Solo es una lista: no se modificó, borró ni movió nada del Drive.

**Cómo leerla:**
- Cada Word tiene un link. "r3" es el tercer renglón de esa parte, sin contar los renglones vacíos. "(antes del primer título)" es lo que está arriba del primer título de parte.
- Los acordes de un renglón con letra se escriben entre corchetes, justo antes de la sílaba sobre la que caen: `Te [D]amo`.
- Después de corregir, la app de prueba no ve el cambio hasta que se reimporta (ver la sección 4).

---

## 4. Primero: en qué Drive se hace cada cosa

- **Los Word se corrigen una sola vez, en la carpeta [Letra y Acordes de IBSI](https://drive.google.com/drive/folders/1CMc8T2cZBVZsdJ21zfPXOS-NwP06qFuh).**
  - La copia de PRUEBA ([Cancionero PRUEBA](https://drive.google.com/drive/folders/1BjV_7ZrAKoO0IW6F92YGLj8bGyMfjDnc)) no tiene Word propios: lee los de esa carpeta de IBSI sin copiarlos ni modificarlos.
  - No hay que corregir en dos lados. Todos los links de esta lista apuntan a esa carpeta.
- **Intérpretes, tono original y BPM: no van en el Word.** Se completan en la app, en la ficha de cada canción ("Datos de la canción"): si están vacíos los completa cualquiera; si ya tienen valor, solo el admin.
- **Cómo corregir un Word sin romper nada:** editalo en su lugar, conservando el mismo archivo. Dos formas:
  - abrirlo desde Drive con Word / Google Docs (modo Office), sin "Guardar como";
  - en Drive, "Administrar versiones → Subir versión nueva".
- **No lo borres para subirlo de nuevo.** Cada Word tiene un id fijo (por ejemplo `quien-mas-2`), atado al archivo de Drive, y las reuniones, el Registro y los grupos usan ese id. Un archivo nuevo con el mismo nombre recibe otro id (`quien-mas-3`), y el viejo desaparece del cancionero.
- **Borrar un Word** (sección 2a) lo saca del cancionero en la próxima importación.
- **Para que PRUEBA tome los cambios:** reimportá desde Ajustes de la app (con tu cuenta de administrador) o con `importarPrueba()` en el editor de Apps Script. Solo reconvierte los Word que cambiaron.
- **Aparte (no es del Drive de Word):** el Registro de PRUEBA tiene 7 filas de mis pruebas, con quién = "Test":
  - del 20-11: Hay poder, Al estar aquí, Digno de adorar y Roca firme;
  - del 25-11 y 26-11: Alaba, Alabadle y Santo, Santo, Santo.

  Cuentan para "Tono más usado". No las toqué; decime si las borro.

---

## 1. Corregir Word

### 1.1 Archivos nuevos con el nombre en un tono y el Word en otro — 3

Al reimportar aparecieron estos tres. La primera línea del Word dice otro tono que el nombre del archivo, y el contenido es el de otro Word que ya existe:
- [ ] [Qué sería de mi [F#].docx](https://drive.google.com/file/d/1oTAKm9svTvdlgzjor97KyU2NIyOHCkYw/view): el Word dice **[G]** y es igual a [Qué sería de mi [G].docx](https://drive.google.com/file/d/1aNRApnLqW9JKAoRrWkqN-wrT-Or_6uAb/view) pero con tus correcciones. Tus arreglos de "Qué sería de mí [G]" (los caracteres invisibles) quedaron en este archivo, no en el [G].
- [ ] [Tu amor por mi [D].docx](https://drive.google.com/file/d/1JFgGTaxZrzzNCo9xQTQACqo9pF0nQIFX/view): el Word dice **[B]** y es igual a [Tu amor por mi [B].docx](https://drive.google.com/file/d/1gq1Xv2g2euBPQCgiumOQI-Iv9QkcfMQl/view) pero con tus correcciones (incluido el "[Estrofa]" en su renglón). Tus arreglos de "Tu amor por mí [B]" quedaron en este archivo, no en el [B].
- [ ] [Eres fiel [E].docx](https://drive.google.com/file/d/14H4-8lGTvxsRVnf9A1QoIroI58VVkuC8/view): el Word dice **[D]** (el archivo dice [E]).

Decidí vos si son versiones en otro tono (y entonces hay que transportar el Word) o si se subieron con otro nombre por error. No toqué nada.

**Los caracteres invisibles** del [G] y del [B] ya no molestan: desde hoy el motor los saca solo al convertir (entra con la próxima reimportación).

### 1.2 Tono: el nombre del archivo tiene la secuencia de tonos — 14 (bien)

En estos el nombre lista los tonos y la primera línea del Word el de inicio: está bien, no hay que hacer nada. Al estar aquí, Awesome God, Celebrad a Cristo [E-F], Con mis manos levantadas [G-F], Con tu sangre, Digno (Marcos Brunet), For the Lord is good, Hay poder (x2), He decidido, No hay otro nombre [C-D], Quiero llenar, Suenen dulces himnos, Te alabaré.

- **Te alabaré [C-D - Eb]:** hoy se lee C → D (el "Coro en Eb" quedaba en D). Ya lo corregí: un título "… en Eb" fija el tono de esa parte, y queda C → D → Eb con la próxima reimportación.

### 1.3 Canciones sin títulos de parte (o con uno solo) — 4

- [ ] [En el monte Calvario [C].docx](https://drive.google.com/file/d/1-uCoxd5rSCgsSYbkAzZuTY5FbkKi3E2T/view): no tiene ningún título.
- [ ] [Ven ante Su trono [Eb].docx](https://drive.google.com/file/d/17nJXK4AWIISGzLaFuI0V9Y7hZ2h2Gy-4/view): no tiene ningún título.
- [ ] [Atráeme a ti [A].docx](https://drive.google.com/file/d/1KvCNMbdydrn79VT_aIXRHtq28DgqIK57/view): un solo título, «Coro».
- [ ] [Nos unimos al cielo [G].docx](https://drive.google.com/file/d/1BoNBaUst498b5hKqErbPQSYrJogTAgcr/view): un solo título, «Coro».

### 1.4 Renglones de acordes que se leen como letra — 14 renglones en 4 Word

Tus correcciones de El Dios que adoramos [F] y [F#], Este es mi deseo (Andrea), No soy yo, sino Cristo en mí y Exáltale entraron bien.

- [ ] [Eres fiel [D].docx](https://drive.google.com/file/d/1XKUDNQalXFMN7lIFpU2cS4dM7W_HMRxP/view)
  - Coro r9: `D A C *A F G D F G A C B G G F*` — tiene "*". Debería quedar: `D A C A F G D F G A C B G G F`. *(Dijiste que ya estaba bien: la app lo sigue leyendo como letra por los "*". Si te sirve así, no hace falta tocarlo.)*
- [ ] [Levanto un aleluya [D] (New).docx](https://drive.google.com/file/d/1SmSuF14pS0Z4Z40tIdjXQJTvYmTw7SsD/view)
  - Estrofa 1 r1: `(Solo D)` — "(Solo D)" es una aclaración, no se transporta. Debería quedar: pasalo al título: `[Estrofa 1] (Solo D)` — o dejalo así si no importa. *(Queda así, decidido.)*
- [ ] [Qué sería de mi [G].docx](https://drive.google.com/file/d/1aNRApnLqW9JKAoRrWkqN-wrT-Or_6uAb/view)
  - 4 renglones (Estrofa r5, Coro r1, Coro r3, Final r5): carácter invisible (espacio de ancho cero) al principio. Ejemplo: `⟨invisible⟩ G D/F#` → `G D/F#`. Lo mismo en los demás.
- [ ] [Tu amor por mi [B].docx](https://drive.google.com/file/d/1gq1Xv2g2euBPQCgiumOQI-Iv9QkcfMQl/view)
  - 7 renglones (Estrofa r1, Estrofa r3, Coro r1, Coro r3, Coro r5, Coro r7, Final r1): carácter invisible (espacio de ancho cero) al principio. Ejemplo: `⟨invisible⟩ B F#/B F#/Eb F#/G# F#/Eb` → `B F#/B F#/Eb F#/G# F#/Eb`. Lo mismo en los demás.
  - Coro r9: `(F#/Eb – F#) [Estrofa]` — el título "[Estrofa]" quedó al final del renglón de acordes. Debería quedar: `(F#/Eb – F#)` y en el renglón de abajo `[Estrofa]`.

### 1.5 Otros renglones raros — 1

- [ ] [Completo en ti [C].docx](https://drive.google.com/file/d/1CfVFoQ4ii2ZlMqQwswxgIvPWDQIZONFa/view), Puente r2: `(G|Am` — el paréntesis y la barra quedan pegados; probablemente `(G | Am Em)`.

### 1.6 Renglones sueltos con solo "]" — ninguno

Los 13 que había ya no están (incluido El Dios que adoramos [F#]).

### 1.7 Lo que sigue en PENDIENTES → Revisar

Ver `PENDIENTES.md`, sección "Revisar". Ya saqué lo que resolviste (los grupos decididos y El victorioso).

---

## 2. Word repetidos (grupos de `referencia/agrupacion-por-tono.md`)

Criterio (sección 5): **se puede borrar** si es la misma canción que la que se conserva. No cuentan como diferencia el tono, la posición de los acordes ni el nombre de una parte. Sí cuentan otro acorde, otra parte, otra letra, otro puente u otra nota. El que se conserva es el que dijiste ("Conservá X"); si no, regla 1 (tono original del intérprete), regla 2 (el más usado en el Registro), regla 3 (el primero por nombre).

**Uso:** reviso las reuniones y el Registro de PRUEBA. Ninguno de los que se pueden borrar está en el Registro. 3 están en la reunión de prueba del Domingo 29-11-2026 (se indica en cada uno): antes de borrarlos hay que cambiarlos en esa reunión por el que se conserva.

### 2a. Se puede borrar (misma canción: solo cambia el tono, la posición de los acordes o el nombre de una parte) — 46

- [ ] **Borrar** [Él nos ama [C].docx](https://drive.google.com/file/d/1Bxd2rTEt9GNWISys4poydLihKB3RNN4g/view) — es la misma canción que [Él nos ama [A].docx](https://drive.google.com/file/d/1MozrciYkhXi_rz3LATUrhbboTD79jR30/view), que se conserva.
  - Por qué se conserva Él nos ama [A].docx: es el primero por nombre de archivo (el que la app ya muestra como representativo del grupo); ninguno de los dos figura en el Registro ni en reuniones.
  - Uso del que se borra: ninguno (ni reuniones ni Registro): no hay nada que migrar.
- [ ] **Borrar** [A ti me rindo [F].docx](https://drive.google.com/file/d/1z1KyFwRL59edHoGmoEIeB4qTm2Qtg8qy/view) — es la misma canción que [A ti me rindo [Eb].docx](https://drive.google.com/file/d/1HsvLqj4lXON_sQa_YxZVA2HST7fT3TIT/view), que se conserva.
  - Por qué se conserva A ti me rindo [Eb].docx: es el primero por nombre de archivo (el que la app ya muestra como representativo del grupo); ninguno de los dos figura en el Registro ni en reuniones.
  - Uso del que se borra: reuniones: Domingo 29-11-2026 (2026-11-29)
- [ ] **Borrar** [Al único que es digno [D].docx](https://drive.google.com/file/d/1_5cAS6oXJ3HT0To5bKjwX7MYNB30mCTs/view) — es la misma canción que [Al único que es digno [A].docx](https://drive.google.com/file/d/1U1ODKtsz5HcgRmvIriusH7hlgGE_cbR6/view), que se conserva.
  - Por qué se conserva Al único que es digno [A].docx: es el que figura en el Registro.
  - Uso del que se borra: reuniones: Domingo 29-11-2026 (2026-11-29)
- [ ] **Borrar** [Alaba [F].docx](https://drive.google.com/file/d/1LcxQKduz3yOSF0JPz5NEu1vmoOVTDegy/view) — es la misma canción que [Alaba [A].docx](https://drive.google.com/file/d/1-cLGRWvO7-D9CLlFjs7xeBCOA0VwYU_R/view), que se conserva.
  - Por qué se conserva Alaba [A].docx: es el único del grupo con el que coincide exacto (contra Alaba [G].docx hay diferencias).
  - Uso del que se borra: ninguno (ni reuniones ni Registro): no hay nada que migrar.
- [ ] **Borrar** [Aquí estoy [F].docx](https://drive.google.com/file/d/1rNj7FsWbOnplwzWk2tcIoQ6btRqddoEf/view) — es la misma canción que [Aquí estoy [A].docx](https://drive.google.com/file/d/1bI_71YpdCbcvItqfviq3yc7q_X7Cz3g0/view), que se conserva.
  - Por qué se conserva Aquí estoy [A].docx: es el que figura en el Registro.
  - Uso del que se borra: ninguno (ni reuniones ni Registro): no hay nada que migrar.
- [ ] **Borrar** [Aqui te esperaré [Bb].docx](https://drive.google.com/file/d/1nxqO_75QtulsokYlrFjCp56TFqBJjC0s/view) — es la misma canción que [Aqui te esperaré [A].docx](https://drive.google.com/file/d/1zCUfRcBvbpf0n-Iu_Y0N-nxeMYbKKjHz/view), que se conserva.
  - Por qué se conserva Aqui te esperaré [A].docx: es el primero por nombre de archivo (el que la app ya muestra como representativo del grupo); ninguno de los dos figura en el Registro ni en reuniones.
  - Uso del que se borra: ninguno (ni reuniones ni Registro): no hay nada que migrar.
- [ ] **Borrar** [Con mis manos levantadas (Simple) [G].docx](https://drive.google.com/file/d/14WITuAs7UVW2-jUW0_2mEeaPzopQoIba/view) — es la misma canción que [Con mis manos levantadas (Simple) [E].docx](https://drive.google.com/file/d/1LHcNFs9d51M23kVM-WjUwfDoUfEXlfN5/view), que se conserva.
  - Por qué se conserva Con mis manos levantadas (Simple) [E].docx: es el primero por nombre de archivo (el que la app ya muestra como representativo del grupo); ninguno de los dos figura en el Registro ni en reuniones.
  - Uso del que se borra: ninguno (ni reuniones ni Registro): no hay nada que migrar.
- [ ] **Borrar** [Cuánto vales Cristo [C].docx](https://drive.google.com/file/d/1-FIC-NbzMdz2ZzKtM5EJYbwvuYzLYF-Q/view) — es la misma canción que [Cuánto vales Cristo [A].docx](https://drive.google.com/file/d/17DTBq6P3jZWe22wKKeQvw8H1Lx_nZlAk/view), que se conserva.
  - Por qué se conserva Cuánto vales Cristo [A].docx: es el primero por nombre de archivo (el que la app ya muestra como representativo del grupo); ninguno de los dos figura en el Registro ni en reuniones.
  - Uso del que se borra: ninguno (ni reuniones ni Registro): no hay nada que migrar.
- [ ] **Borrar** [Cuanto vales, Cristo + Si vale la pena [C].docx](https://drive.google.com/file/d/1EKwwOuUFBFuULfeVoPmjpjlcVMhLFCVI/view) — es la misma canción que [Cuanto vales, Cristo + Si vale la pena [A].docx](https://drive.google.com/file/d/1icSgzo3gIHvHsQcRfjVccBXo-Ev64AbZ/view), que se conserva.
  - Por qué se conserva Cuanto vales, Cristo + Si vale la pena [A].docx: es el primero por nombre de archivo (el que la app ya muestra como representativo del grupo); ninguno de los dos figura en el Registro ni en reuniones.
  - Uso del que se borra: ninguno (ni reuniones ni Registro): no hay nada que migrar.
- [ ] **Borrar** [Deseo Eterno [E].docx](https://drive.google.com/file/d/1cb2NpaSNe7B2244JCvy3_Nb1rCNTAM5y/view) — es la misma canción que [Deseo Eterno [A].docx](https://drive.google.com/file/d/18FteAlMlwgh9wTihL6VWz89rao7qqizj/view), que se conserva.
  - Por qué se conserva Deseo Eterno [A].docx: es el primero por nombre de archivo (el que la app ya muestra como representativo del grupo); ninguno de los dos figura en el Registro ni en reuniones.
  - Uso del que se borra: ninguno (ni reuniones ni Registro): no hay nada que migrar.
- [ ] **Borrar** [El Cordero y el León [D].docx](https://drive.google.com/file/d/15FmuUqlTOKEStEa8rhL37muLiQmkzHgy/view) — es la misma canción que [El Cordero y el León [C].docx](https://drive.google.com/file/d/10ZwcIFovJeTSY30rpNKbNUDRJ6e5DpF3/view), que se conserva.
  - Por qué se conserva El Cordero y el León [C].docx: es el primero por nombre de archivo (el que la app ya muestra como representativo del grupo); ninguno de los dos figura en el Registro ni en reuniones.
  - Uso del que se borra: ninguno (ni reuniones ni Registro): no hay nada que migrar.
- [ ] **Borrar** [El infinito Dios [G].docx](https://drive.google.com/file/d/1oJTHM_nLmfIIiFmgyWTRrWSvq7nrJDYj/view) — es la misma canción que [El infinito Dios [C].docx](https://drive.google.com/file/d/1j_PaSo0vgpRnI3AJfGBw8EKcYrn4bn8v/view), que se conserva.
  - Por qué se conserva El infinito Dios [C].docx: es el que figura en el Registro.
  - Uso del que se borra: ninguno (ni reuniones ni Registro): no hay nada que migrar.
- [ ] **Borrar** [El nombre [Eb].docx](https://drive.google.com/file/d/129lgxF8ct7nR9SXjvioEkNLW6p95uFzJ/view) — es la misma canción que [El nombre [C].docx](https://drive.google.com/file/d/1Obp5WkADSnRsGSIaO11bcDEOYbliEyWf/view), que se conserva.
  - Por qué se conserva El nombre [C].docx: es el que figura en el Registro.
  - Uso del que se borra: ninguno (ni reuniones ni Registro): no hay nada que migrar.
- [ ] **Borrar** [Eres Rey de los cielos [F].docx](https://drive.google.com/file/d/1t5AUggmccc-QYbdxRuGF7vGqeEuBlzap/view) — es la misma canción que [Eres Rey de los cielos [A].docx](https://drive.google.com/file/d/1Ww57alj3HvY5kJaiqYsthJaecZpKzm0e/view), que se conserva.
  - Por qué se conserva Eres Rey de los cielos [A].docx: es el que figura en el Registro.
  - Uso del que se borra: ninguno (ni reuniones ni Registro): no hay nada que migrar.
- [ ] **Borrar** [Es Él [Bb].docx](https://drive.google.com/file/d/1j8FvnZhQnhvGhc210KSvpnJk-beT_KZA/view) — es la misma canción que [Es Él [A].docx](https://drive.google.com/file/d/1PVsXRhk-ZbpxtA2NK0h8vrK6qXfF-a7K/view), que se conserva.
  - Por qué se conserva Es Él [A].docx: es el primero por nombre de archivo (el que la app ya muestra como representativo del grupo); ninguno de los dos figura en el Registro ni en reuniones.
  - Uso del que se borra: ninguno (ni reuniones ni Registro): no hay nada que migrar.
- [ ] **Borrar** [Este es el reino [C].docx](https://drive.google.com/file/d/1Kiuntu0FUfmKj6geYaD3hLa8DrL3jkT1/view) — es la misma canción que [Este es el reino [A].docx](https://drive.google.com/file/d/1gP5yZwldVXvV1nyO_xEIzlaUh2z3tysb/view), que se conserva.
  - Por qué se conserva Este es el reino [A].docx: es el primero por nombre de archivo (el que la app ya muestra como representativo del grupo); ninguno de los dos figura en el Registro ni en reuniones.
  - Uso del que se borra: ninguno (ni reuniones ni Registro): no hay nada que migrar.
- [ ] **Borrar** [Gracia sobre gracia [Fm].docx](https://drive.google.com/file/d/1miBxhp7ZNf5ZWbK0TpnoWhYnMqbx57MB/view) — es la misma canción que [Gracia sobre gracia [Em].docx](https://drive.google.com/file/d/13KEocmEuKXjjyV_AMR8AxiXTHwYpJy56/view), que se conserva.
  - Por qué se conserva Gracia sobre gracia [Em].docx: es el único del grupo con el que coincide exacto (contra Gracia sobre gracia [Am].docx hay diferencias).
  - Uso del que se borra: ninguno (ni reuniones ni Registro): no hay nada que migrar.
- [ ] **Borrar** [Hay poder [G-Ab-A-Bb-C].docx](https://drive.google.com/file/d/1YujkOoQuoCTR9BGg38P6tPxKDFpQs4t0/view) — es la misma canción que [Hay poder [E-F-F#-G-A].docx](https://drive.google.com/file/d/1MVq4hLKB_UcHyutRCX81kZtychR4iyrS/view), que se conserva.
  - Por qué se conserva Hay poder [E-F-F#-G-A].docx: es el que figura en el Registro.
  - Uso del que se borra: ninguno (ni reuniones ni Registro): no hay nada que migrar.
- [ ] **Borrar** [Hermoso-No volveré atrás [D].docx](https://drive.google.com/file/d/1Qv4hU5o_sMelW28fz7d8RmHksmUB3vNR/view) — es la misma canción que [Hermoso-No volveré atrás [A].docx](https://drive.google.com/file/d/1B7yEtHBb27jTAar33QOQHAD1SpxHW14S/view), que se conserva.
  - Por qué se conserva Hermoso-No volveré atrás [A].docx: es el único del grupo con el que coincide exacto (contra Hermoso - No volveré atrás [A].docx hay diferencias).
  - Uso del que se borra: ninguno (ni reuniones ni Registro): no hay nada que migrar.
- [ ] **Borrar** [Hermoso nombre [C].docx](https://drive.google.com/file/d/1UUWz9b165150j6aZIyhhStk7Dch_wf2O/view) — es la misma canción que [Hermoso nombre [A].docx](https://drive.google.com/file/d/1Won2F-ckb--JeFAHm1NhqyWNK9ifvKJ1/view), que se conserva.
  - Por qué se conserva Hermoso nombre [A].docx: es el que figura en el Registro.
  - Uso del que se borra: ninguno (ni reuniones ni Registro): no hay nada que migrar.
- [ ] **Borrar** [Hermoso nombre [D].docx](https://drive.google.com/file/d/1k8odK9IXTBfZrDXD4o_USqLzTwg2f0M5/view) — es la misma canción que [Hermoso nombre [A].docx](https://drive.google.com/file/d/1Won2F-ckb--JeFAHm1NhqyWNK9ifvKJ1/view), que se conserva.
  - Por qué se conserva Hermoso nombre [A].docx: es el que figura en el Registro.
  - Uso del que se borra: reuniones: Domingo 29-11-2026 (2026-11-29)
- [ ] **Borrar** [Infinito Dios [G].docx](https://drive.google.com/file/d/1y-CJJ_6t_peIUJQ6xqlUQ6gf0fVyV663/view) — es la misma canción que [Infinito Dios [C].docx](https://drive.google.com/file/d/1k4zmU96wBWSJdz3TZFb0_SzStKBG4ZZf/view), que se conserva.
  - Por qué se conserva Infinito Dios [C].docx: es el que figura en el Registro.
  - Uso del que se borra: ninguno (ni reuniones ni Registro): no hay nada que migrar.
- [ ] **Borrar** [Jesús [F].docx](https://drive.google.com/file/d/1-i5Er8Z3w8Ti8DYttW6n0XQDaYC9g5mC/view) — es la misma canción que [Jesús [D].docx](https://drive.google.com/file/d/1WRSEs5rMhFytl4mtH4wAZdgugbbSd4AZ/view), que se conserva.
  - Por qué se conserva Jesús [D].docx: es el primero por nombre de archivo (el que la app ya muestra como representativo del grupo); ninguno de los dos figura en el Registro ni en reuniones.
  - Uso del que se borra: ninguno (ni reuniones ni Registro): no hay nada que migrar.
- [ ] **Borrar** [Jesús en el centro [F].docx](https://drive.google.com/file/d/11XWlz_S2w8b42vW2PndjOC2K5f7noZbZ/view) — es la misma canción que [Jesús en el centro [C].docx](https://drive.google.com/file/d/1q469SY8C7QYPy2IUArT7oMRyYAhY3H_A/view), que se conserva.
  - Por qué se conserva Jesús en el centro [C].docx: es el primero por nombre de archivo (el que la app ya muestra como representativo del grupo); ninguno de los dos figura en el Registro ni en reuniones.
  - Uso del que se borra: ninguno (ni reuniones ni Registro): no hay nada que migrar.
- [ ] **Borrar** [Lo único que quiero [F#].docx](https://drive.google.com/file/d/1NOnkh-hShcYSPOLyUaTtw4n_dWRBbCHp/view) — es la misma canción que [Lo único que quiero [C].docx](https://drive.google.com/file/d/1PGQGYpJMUgqFeQNY6hx6sk4JFJ0f5d6i/view), que se conserva.
  - Por qué se conserva Lo único que quiero [C].docx: es el que figura en el Registro.
  - Uso del que se borra: ninguno (ni reuniones ni Registro): no hay nada que migrar.
- [ ] **Borrar** [Lo único que quiero [G].docx](https://drive.google.com/file/d/137-RZm8jyPsZMZ08h8XDptDlj954D1th/view) — es la misma canción que [Lo único que quiero [C].docx](https://drive.google.com/file/d/1PGQGYpJMUgqFeQNY6hx6sk4JFJ0f5d6i/view), que se conserva.
  - Por qué se conserva Lo único que quiero [C].docx: es el que figura en el Registro.
  - Uso del que se borra: ninguno (ni reuniones ni Registro): no hay nada que migrar.
- [ ] **Borrar** [Mi plenitud [C].docx](https://drive.google.com/file/d/1d_RBqqIGCSTBeBlWYu2VtSazJc2lGWaw/view) — es la misma canción que [Mi plenitud [A].docx](https://drive.google.com/file/d/1dC2kaIfDkcqGKL70DomXLb5oMSjENTaD/view), que se conserva.
  - Por qué se conserva Mi plenitud [A].docx: es el que figura en el Registro.
  - Uso del que se borra: ninguno (ni reuniones ni Registro): no hay nada que migrar.
- [ ] **Borrar** [No hay otro nombre [D].docx](https://drive.google.com/file/d/1TMPvvTZloRF6_HlrjaLLWBh4ei9s_N10/view) — es la misma canción que [No hay otro nombre [C].docx](https://drive.google.com/file/d/14Yp6hLua4NIShYjoNI4URIsbm62Sc229/view), que se conserva.
  - Por qué se conserva No hay otro nombre [C].docx: es el primero por nombre de archivo (el que la app ya muestra como representativo del grupo); ninguno de los dos figura en el Registro ni en reuniones.
  - Uso del que se borra: ninguno (ni reuniones ni Registro): no hay nada que migrar.
- [ ] **Borrar** [No hay otro nombre [G].docx](https://drive.google.com/file/d/1PEvz8Zf8EbzkR4HnjnWmofRWsarWk-cU/view) — es la misma canción que [No hay otro nombre [C].docx](https://drive.google.com/file/d/14Yp6hLua4NIShYjoNI4URIsbm62Sc229/view), que se conserva.
  - Por qué se conserva No hay otro nombre [C].docx: es el primero por nombre de archivo (el que la app ya muestra como representativo del grupo); ninguno de los dos figura en el Registro ni en reuniones.
  - Uso del que se borra: ninguno (ni reuniones ni Registro): no hay nada que migrar.
- [ ] **Borrar** [No yo, sino Cristo [E].docx](https://drive.google.com/file/d/1BNMFzdJ5cKBNIRxFmfOYGx0ryBUvxkcz/view) — es la misma canción que [No yo, sino Cristo [B].docx](https://drive.google.com/file/d/1R4S7IloPv6EL0Emy8R6-TLMrqg6I8bOm/view), que se conserva.
  - Por qué se conserva No yo, sino Cristo [B].docx: es el primero por nombre de archivo (el que la app ya muestra como representativo del grupo); ninguno de los dos figura en el Registro ni en reuniones.
  - Uso del que se borra: ninguno (ni reuniones ni Registro): no hay nada que migrar.
- [ ] **Borrar** [Nombre sobre todo nombre [Eb].docx](https://drive.google.com/file/d/1UwWdblxj2GdBQ493pn7I2wdvnEBteS1j/view) — es la misma canción que [Nombre sobre todo nombre [C].docx](https://drive.google.com/file/d/1I4eWyAiT-7L8uHxbYaAepxRZWL62ucvu/view), que se conserva.
  - Por qué se conserva Nombre sobre todo nombre [C].docx: es el que figura en el Registro.
  - Uso del que se borra: ninguno (ni reuniones ni Registro): no hay nada que migrar.
- [ ] **Borrar** [Nuestra prioridad [C].docx](https://drive.google.com/file/d/1ams2LaUYAGKJQwH02Sn1fQh7v5Pd1iqv/view) — es la misma canción que [Nuestra prioridad [A].docx](https://drive.google.com/file/d/1knPR73uU9ix8QtCHlLUuUl033JQ77_Dj/view), que se conserva.
  - Por qué se conserva Nuestra prioridad [A].docx: es el primero por nombre de archivo (el que la app ya muestra como representativo del grupo); ninguno de los dos figura en el Registro ni en reuniones.
  - Uso del que se borra: ninguno (ni reuniones ni Registro): no hay nada que migrar.
- [ ] **Borrar** [Oh tu fidelidad (Majo Solis) [C].docx](https://drive.google.com/file/d/1poPRqiAKV-OGwRtWQjufGco1tfy0rKCb/view) — es la misma canción que [Oh tu fidelidad (Majo Solis) [B].docx](https://drive.google.com/file/d/1xwYSE099xLj34f1BqESDyUdEveuvO1C7/view), que se conserva.
  - Por qué se conserva Oh tu fidelidad (Majo Solis) [B].docx: es el primero por nombre de archivo (el que la app ya muestra como representativo del grupo); ninguno de los dos figura en el Registro ni en reuniones.
  - Uso del que se borra: ninguno (ni reuniones ni Registro): no hay nada que migrar.
- [ ] **Borrar** [Quién más [G].docx](https://drive.google.com/file/d/1NDG8WEuFdJMx25KwkSjautRVUW_DsD_1/view) — es la misma canción que [Quién más [Ab].docx](https://drive.google.com/file/d/1uDxxjvNHM-5yiE-wKJSzTU2mDWUzxZBZ/view), que se conserva.
  - Por qué se conserva Quién más [Ab].docx: es el primero por nombre de archivo (el que la app ya muestra como representativo del grupo); ninguno de los dos figura en el Registro ni en reuniones.
  - Uso del que se borra: ninguno (ni reuniones ni Registro): no hay nada que migrar.
- [ ] **Borrar** [Rey de gloria [E].docx](https://drive.google.com/file/d/1ulX8MbhmNNVWDWyw3EFItrdmhRWlh0ZV/view) — es la misma canción que [Rey de gloria [C].docx](https://drive.google.com/file/d/12_qcGXKv6XmzwAWR-WKeIF6RVMMoqQpR/view), que se conserva.
  - Por qué se conserva Rey de gloria [C].docx: es el que figura en el Registro.
  - Uso del que se borra: ninguno (ni reuniones ni Registro): no hay nada que migrar.
- [ ] **Borrar** [Roca firme [C].docx](https://drive.google.com/file/d/1ZjCvrlz0G6ej3kYEvneHbSi3Uii1LTQA/view) — es la misma canción que [Roca firme [Bb].docx](https://drive.google.com/file/d/11uJ8s-nLNGhAaPGqNTRH9lRx_Mg58upI/view), que se conserva.
  - Por qué se conserva Roca firme [Bb].docx: es el único del grupo con el que coincide exacto (contra Roca firme [A].docx hay diferencias).
  - Uso del que se borra: ninguno (ni reuniones ni Registro): no hay nada que migrar.
- [ ] **Borrar** [Santo por siempre [E].docx](https://drive.google.com/file/d/1zRp-j9sDj7tSS-LauaCOiADhDZAMFZlJ/view) — es la misma canción que [Santo por siempre [C].docx](https://drive.google.com/file/d/160sdpHbpFwRZ9zWTEKQ9gLPjfyuNCdzm/view), que se conserva.
  - Por qué se conserva Santo por siempre [C].docx: es el que figura en el Registro.
  - Uso del que se borra: ninguno (ni reuniones ni Registro): no hay nada que migrar.
- [ ] **Borrar** [Santo por siempre [G].docx](https://drive.google.com/file/d/1igjQMVLewKJH2L5FBCjRIeGW0h7ADtox/view) — es la misma canción que [Santo por siempre [C].docx](https://drive.google.com/file/d/160sdpHbpFwRZ9zWTEKQ9gLPjfyuNCdzm/view), que se conserva.
  - Por qué se conserva Santo por siempre [C].docx: es el que figura en el Registro.
  - Uso del que se borra: ninguno (ni reuniones ni Registro): no hay nada que migrar.
- [ ] **Borrar** [Solo Cristo [C].docx](https://drive.google.com/file/d/1gnfEwru97nHAKX1q_DLhpgMDIGBOpl8-/view) — es la misma canción que [Solo Cristo [B].docx](https://drive.google.com/file/d/1adf3hIdLS2NcNFphDqAfNuUn_Bkr3qQx/view), que se conserva.
  - Por qué se conserva Solo Cristo [B].docx: es el primero por nombre de archivo (el que la app ya muestra como representativo del grupo); ninguno de los dos figura en el Registro ni en reuniones.
  - Uso del que se borra: ninguno (ni reuniones ni Registro): no hay nada que migrar.
- [ ] **Borrar** [Te doy gloria [C].docx](https://drive.google.com/file/d/17tcLxhAgvyW3XMpW0ubYwgCp9CbCBCZw/view) — es la misma canción que [Te doy gloria [A].docx](https://drive.google.com/file/d/1yCoCzgRWohjXTCJ2dDScIPqMk77Yefzy/view), que se conserva.
  - Por qué se conserva Te doy gloria [A].docx: es el que figura en el Registro.
  - Uso del que se borra: ninguno (ni reuniones ni Registro): no hay nada que migrar.
- [ ] **Borrar** [Te doy gloria [F].docx](https://drive.google.com/file/d/1V0pC4TrOcalyHQvEBe-nDxpVkHMf-DPz/view) — es la misma canción que [Te doy gloria [D].docx](https://drive.google.com/file/d/1rtodCvQa30bfq6pAoJfSh-mpwCGdj2-k/view), que se conserva.
  - Por qué se conserva Te doy gloria [D].docx: es el único del grupo con el que coincide exacto (contra Te doy gloria [A].docx hay diferencias).
  - Uso del que se borra: ninguno (ni reuniones ni Registro): no hay nada que migrar.
- [ ] **Borrar** [Temprano yo te buscaré [G].docx](https://drive.google.com/file/d/1qosalrwKiLHU_hU9JAG6atDbLwkLL9jm/view) — es la misma canción que [Temprano yo te buscaré [F].docx](https://drive.google.com/file/d/1sEPuYpBwub5R7iHozpxDHMTrE10VuT8H/view), que se conserva.
  - Por qué se conserva Temprano yo te buscaré [F].docx: es el primero por nombre de archivo (el que la app ya muestra como representativo del grupo); ninguno de los dos figura en el Registro ni en reuniones.
  - Uso del que se borra: ninguno (ni reuniones ni Registro): no hay nada que migrar.
- [ ] **Borrar** [Tu mirada [F].docx](https://drive.google.com/file/d/14145AM4FZcd9ZxFSpPXd6j-0ARDPxf3h/view) — es la misma canción que [Tu mirada [A].docx](https://drive.google.com/file/d/1OYXa--t7ko_GPYiXjtOrYJErrCZ6mgBD/view), que se conserva.
  - Por qué se conserva Tu mirada [A].docx: es el primero por nombre de archivo (el que la app ya muestra como representativo del grupo); ninguno de los dos figura en el Registro ni en reuniones.
  - Uso del que se borra: ninguno (ni reuniones ni Registro): no hay nada que migrar.
- [ ] **Borrar** [Tu mirada [F#].docx](https://drive.google.com/file/d/1mOjZT3AlwaIe5b3PyjnkmQbjovPJ11wu/view) — es la misma canción que [Tu mirada [A].docx](https://drive.google.com/file/d/1OYXa--t7ko_GPYiXjtOrYJErrCZ6mgBD/view), que se conserva.
  - Por qué se conserva Tu mirada [A].docx: es el primero por nombre de archivo (el que la app ya muestra como representativo del grupo); ninguno de los dos figura en el Registro ni en reuniones.
  - Uso del que se borra: ninguno (ni reuniones ni Registro): no hay nada que migrar.
- [ ] **Borrar** [Tumbas a Jardines [C].docx](https://drive.google.com/file/d/1JpecCKduZNhisNzrAYgm76x7LdYcDAK6/view) — es la misma canción que [Tumbas a Jardines [B].docx](https://drive.google.com/file/d/142-Oqx516bGWfTF7i8kieliR4rUKBWnH/view), que se conserva.
  - Por qué se conserva Tumbas a Jardines [B].docx: es el que figura en el Registro.
  - Uso del que se borra: ninguno (ni reuniones ni Registro): no hay nada que migrar.
- [ ] **Borrar** [Tumbas a Jardines [E].docx](https://drive.google.com/file/d/14OlrSXK5Mmtvg6raWBHF_0kTO-uJ0qMz/view) — es la misma canción que [Tumbas a Jardines [B].docx](https://drive.google.com/file/d/142-Oqx516bGWfTF7i8kieliR4rUKBWnH/view), que se conserva.
  - Por qué se conserva Tumbas a Jardines [B].docx: es el que figura en el Registro.
  - Uso del que se borra: ninguno (ni reuniones ni Registro): no hay nada que migrar.

### 2b. NO borrar, tiene diferencias — 34

Cada Word se compara contra el que se conserva del grupo (el que dijiste; si no, reglas 1→2→3). "r3" = tercer renglón de esa parte (sin contar renglones vacíos). Los acordes van entre corchetes justo antes de la sílaba sobre la que caen. La posición de los acordes y los nombres de parte no cuentan como diferencia.

- [ ] [Con tu sangre [D].docx](https://drive.google.com/file/d/1NeToinjWxkd31IHJJc7irz1KyO_rGKUy/view) contra [Con tu sangre [D-Eb].docx](https://drive.google.com/file/d/1FdLWWm7gV9I3ONNuF_MdZ1FXCCnS98dQ/view): **17 diferencia(s)** — acordes ×1, distinto tipo de renglón (título de parte / letra con acordes) ×1, letra + acordes ×2, distinto tipo de renglón (renglón de acordes / letra con acordes) ×2, nombre de parte + tono de la parte ×1, distinto tipo de renglón (solo letra / letra con acordes) ×1, renglones que están en uno solo ×9.
  <details><summary>Ver diferencias</summary>

  | Dónde | Con tu sangre [D-Eb].docx | Con tu sangre [D].docx | Qué cambia |
  |---|---|---|---|
  | Coro, r4 | Padre [D/F#]eterno, [A4]Corde--e[A7]ro de [F#dim/C]Dios.[-][G/B][-][G/E][-][D/G][-][A2//] | Padre [D/F#]eterno, [A4]Corde--e[A7]ro de [F#dim/C]Dios.[-][G/B][-][G/E][-][D/G][-][A2] | acordes |
  | título de parte / Coro, r1 | título «Interludio» (tono D) | [D/F#]Exaltad [G][A]al Corde[G]ro de glo[D]ria,[Dsus4] | distinto tipo de renglón (título de parte / letra con acordes) |
  | Interludio, r1 / Coro, r2 | Padre [D/F#]eterno, [A4]Corde--e[A7]ro de [Bm]Dios. | [D/F#]ado[G][A]rad [D/F#]al que [G]vive y [D]reina,[Dsus4] | letra + acordes |
  | Interludio, r2 / Coro, r3 | renglón de acordes: E/Ab A4 D/F# G F#-Ab-Bb-C# | [D/F#]ado[G]rad [A]al [D/F#]Dios Altí[G2]simo, | distinto tipo de renglón (renglón de acordes / letra con acordes) |
  | Interludio, r3 / Coro, r4 | renglón de acordes: E/Ab A4 D/F# G D# Ab | Padre e[D/F#]terno, [A4]Corde--e[A7]ro de [Bm]Dios.[E/G#] | distinto tipo de renglón (renglón de acordes / letra con acordes) |
  | título de parte | título «Coro» (tono Eb) | título «Final» (tono D) | nombre de parte + tono de la parte |
  | Coro, r1 / Final, r1 | letra: (Sube a Eb) | [A4]Corde--e[D/F#]ro de [G][D/F#]Dios, | distinto tipo de renglón (solo letra / letra con acordes) |
  | Coro, r2 / Final, r2 | [Eb/G]Exaltad [Ab][Bb]al [Ab]Cordero de glo[Eb]ria,[Ebsus4] | [A4][A7]Corde--ero [G]de [D/F#]Dios.[Em][D] | letra + acordes |
  | Coro, r3 | [Eb/G]ado[Ab]rad [Bb][Eb/G]al que [Ab]vive y rei[Eb]na,[Ebsus4] | — | está solo en Con tu sangre [D-Eb].docx |
  | Coro, r4 | [Eb/G]ado[Ab]rad [Bb]al [Eb/G]Dios Altí[Ab2]simo, | — | está solo en Con tu sangre [D-Eb].docx |
  | Coro, r5 | Padre e[Eb/G]terno, [Bb4]Corde--e[Bb7]ro de [Cm]Dios.[F/A] | — | está solo en Con tu sangre [D-Eb].docx |
  | título de parte | título «Final» (tono Eb) | — | está solo en Con tu sangre [D-Eb].docx |
  | Final, r1 | renglón de acordes: Eb | — | está solo en Con tu sangre [D-Eb].docx |
  | Final, r2 | [Bb4]Corde--e[Eb/G]ro de [Ab]Dios,[Eb/G] | — | está solo en Con tu sangre [D-Eb].docx |
  | Final, r3 | [Bb4][Bb7]Corde--ero de [Ab]Dios.[Eb/G][Fm][Eb] | — | está solo en Con tu sangre [D-Eb].docx |
  | título de parte | título «Final» (tono Eb) | — | está solo en Con tu sangre [D-Eb].docx |
  | Final, r1 | renglón de acordes: D | — | está solo en Con tu sangre [D-Eb].docx |

  </details>
- [ ] [El Dios que adoramos [F].docx](https://drive.google.com/file/d/1ch8PHLrKOnvMMddbdlG6U19gLlqujcWG/view) contra [El Dios que adoramos [F#].docx](https://drive.google.com/file/d/186L3iKE6siBM-zN8XEhHV4Qly3TGjGth/view): **9 diferencia(s)** — renglones que están en uno solo ×2, letra + acordes ×4, letra (solo signos/mayúsculas/acentos) ×1, acordes/nota ×1, distinto tipo de renglón (título de parte / renglón de acordes) ×1. Uso: Registro: 5 fila(s).
  <details><summary>Ver diferencias</summary>

  | Dónde | El Dios que adoramos [F#].docx | El Dios que adoramos [F].docx | Qué cambia |
  |---|---|---|---|
  | Intro x2, r1 | — | renglón de acordes: F - C - Dm - Bb – F - C | está solo en El Dios que adoramos [F].docx |
  | Estrofa 1, r1 | [F#][-][C#][-][D#m][B]][–][F#][C#] | El [F]Dios que hizo los cielos [C]y la tierra, | letra + acordes |
  | Estrofa 1, r2 | El [F#]Dios que hizo los cielos y la [C#]tierra, | Con el po[Dm]der de Su palabra, reina [Bb]con autoridad | letra + acordes |
  | Estrofa 1, r3 | Con el poder de Su [D#m]palabra, [B]reina con autoridad | El [F]Dios que aun los vientos [C]le obedecen | letra + acordes |
  | Estrofa 1, r4 | El [F#]Dios que aun los vientos le o[C#]bedecen | Una palabra es su[Dm]ficiente, para los muertos le[Bb]vantar | letra + acordes |
  | Estrofa 1, r5 | Una palabra es su[D#m]ficiente, para [B]los muertos levantar | — | está solo en El Dios que adoramos [F#].docx |
  | PreCoro, r1 | [B]Nadie es como [C#]El, oh gran Yo Soy | Nadie es [Bb]como Él, oh [C]gran Yo Soy | letra (solo signos/mayúsculas/acentos) |
  | Inter, r1 / PUENTE, r1 | renglón de acordes: B - C# - B/D# - A#m | B - C# - B/D# - C#/F | renglón de acordes: Bb - C - Bb/D - Am | acordes/nota |
  | título de parte / PUENTE, r2 | título «Puente» (tono F#) | renglón de acordes: Bb - C - Bb/D - C/E | distinto tipo de renglón (título de parte / renglón de acordes) |

  </details>
- [ ] [El Dios que adoramos [G].docx](https://drive.google.com/file/d/1U__YOOVe2OyjrujWnrvbonXyTh0ExTFC/view) contra [El Dios que adoramos [F#].docx](https://drive.google.com/file/d/186L3iKE6siBM-zN8XEhHV4Qly3TGjGth/view): **10 diferencia(s)** — renglones que están en uno solo ×5, letra + acordes ×4, acordes/nota ×1.
  <details><summary>Ver diferencias</summary>

  | Dónde | El Dios que adoramos [F#].docx | El Dios que adoramos [G].docx | Qué cambia |
  |---|---|---|---|
  | Intro, r1 | — | renglón de acordes: G - D - Em-C – G-D// | está solo en El Dios que adoramos [G].docx |
  | Estrofa 1, r1 | [F#][-][C#][-][D#m][B]][–][F#][C#] | El [G]Dios que hizo los cielos y la tie[D]rra, | letra + acordes |
  | Estrofa 1, r2 | El [F#]Dios que hizo los cielos y la [C#]tierra, | Con el poder de [Em]Su palabra, reina con au[C]toridad | letra + acordes |
  | Estrofa 1, r3 | Con el poder de Su [D#m]palabra, [B]reina con autoridad | El [G]Dios que aun los vientos le obe[D]decen | letra + acordes |
  | Estrofa 1, r4 | El [F#]Dios que aun los vientos le o[C#]bedecen | Una palabra es su[Em]ficiente, para los muertos [C]levantar | letra + acordes |
  | Estrofa 1, r5 | Una palabra es su[D#m]ficiente, para [B]los muertos levantar | — | está solo en El Dios que adoramos [F#].docx |
  | título de parte | título «Inter» (tono F#) | — | está solo en El Dios que adoramos [F#].docx |
  | Inter, r1 | renglón de acordes: B - C# - B/D# - A#m | B - C# - B/D# - C#/F | — | está solo en El Dios que adoramos [F#].docx |
  | Puente, r1 | — | renglón de acordes: C - D - C/E - Bm | C - D - C/E - D/F# | está solo en El Dios que adoramos [G].docx |
  | Outro, r1 | renglón de acordes: F# - C# - D#m - B - F# - C# - F# | renglón de acordes: G - D - Em - C - G - D – G | acordes/nota |

  </details>
- [ ] [El victorioso [Dm].docx](https://drive.google.com/file/d/10xpeFMtRdnmwnUYchmlPWkTVj9ZOJ5Lo/view) contra [El victorioso [Am].docx](https://drive.google.com/file/d/1A8F4H0PUryXA8gZbi_En23XPdOjygWhP/view): **1 diferencia(s)** — letra (solo signos/mayúsculas/acentos) ×1.
  <details><summary>Ver diferencias</summary>

  | Dónde | El victorioso [Am].docx | El victorioso [Dm].docx | Qué cambia |
  |---|---|---|---|
  | Final, r3 | Es del [Am]Señor | Es del [Dm]Señor. | letra (solo signos/mayúsculas/acentos) |

  </details>
- [ ] [No voy a caer [C].docx](https://drive.google.com/file/d/1zJ3WsNH60WgjeRe5GnI50FVT5SlVsPDM/view) contra [No voy a caer [A].docx](https://drive.google.com/file/d/1iBG70fXYp5m_ySH42wItpZnv3MPJTG31/view): **6 diferencia(s)** — letra (solo signos/mayúsculas/acentos) ×2, acordes ×1, renglones que están en uno solo ×2, letra (solo signos/mayúsculas/acentos) + acordes ×1.
  <details><summary>Ver diferencias</summary>

  | Dónde | No voy a caer [A].docx | No voy a caer [C].docx | Qué cambia |
  |---|---|---|---|
  | Verso 1, r1 / Estrofa, r1 | //No voy a [A9]caer Aunque la [E/G#]tormenta pegue [F#m7]fuerte | No voy a [C9]caer Aunque la [G/B]tormenta pe[Am7]gue fuerte | letra (solo signos/mayúsculas/acentos) |
  | Verso 1, r3 / Estrofa, r3 | [A9/(C#)]Permaneceré anclado en la roca que es [F#m7]Cristo | [C(/E)]Permaneceré anclado en la roca que [Am7]es Cristo | acordes |
  | Verso 1, r4 / Estrofa, r4 | [D]No tengo otro [A]destino Vivo pa[E]ra Él No voy [D2]a caer, no Señor// | [F]No tengo otro [C]destino Vivo pa[G]ra Él, No voy [F2]a caer, no Señor | letra (solo signos/mayúsculas/acentos) |
  | título de parte | — | título «Estrofa» (tono C) | está solo en No voy a caer [C].docx |
  | título de parte | — | título «Puente» (tono C) | está solo en No voy a caer [C].docx |
  | Coro, r4 | Je[A]sus, [Em/G]Jesus, [D/F#]Jesus[-][D][-][E] | Je[C]sús, [Gm/Bb]Jesús, [F/A]Jesús | letra (solo signos/mayúsculas/acentos) + acordes |

  </details>
- [ ] [Por siempre [G].docx](https://drive.google.com/file/d/1IAAxpuF4kfxLAO5Bs4Vpc6rFOZQVKJOM/view) contra [Por siempre [Ab].docx](https://drive.google.com/file/d/1xBja-kfVc76xv1KvqaWOgAJRqVJ49hwn/view): **3 diferencia(s)** — letra (solo signos/mayúsculas/acentos) ×3.
  <details><summary>Ver diferencias</summary>

  | Dónde | Por siempre [Ab].docx | Por siempre [G].docx | Qué cambia |
  |---|---|---|---|
  | Puente 1, r1 | [G#]La tierra re[D#]tumbó La piedra Él [Fm]quitó | [G]La tierra re[D]tumbó, La piedra [Em]Él quitó | letra (solo signos/mayúsculas/acentos) |
  | Puente 1, r3 | El rey resu[D#]cito La muerte de[Fm]rrotó | El rey [D]resucito, La muerte [Em]derrotó | letra (solo signos/mayúsculas/acentos) |
  | Puente 1, r4 | Ganando [C#]la Victoria | Ganando la [C]victoria | letra (solo signos/mayúsculas/acentos) |

  </details>
- [ ] [Agnus Dei [F].docx](https://drive.google.com/file/d/1MnpIF8otungV-Ay1bnFjWaHrKfELZYTH/view) contra [Agnus Dei [A].docx](https://drive.google.com/file/d/12IJ5IwRjEf4U7roicohYoWNCj76nE5Vd/view): **2 diferencia(s)** — distinto tipo de renglón (letra con acordes / acordes y letra mezclados) ×1, renglones que están en uno solo ×1.
  <details><summary>Ver diferencias</summary>

  | Dónde | Agnus Dei [A].docx | Agnus Dei [F].docx | Qué cambia |
  |---|---|---|---|
  | Coro, r2 | El [D/A]Señor [A]Dios pode[D]roso[E4] | acordes sobre letra: Bb/F F Bb(Dm) C4 | distinto tipo de renglón (letra con acordes / acordes y letra mezclados) |
  | Coro, r3 | — | letra: El Señor Dios podero_so | está solo en Agnus Dei [F].docx |

  </details>
- [ ] [Agnus Dei [G].docx](https://drive.google.com/file/d/1R8-M3HeOUvpLTYtF-fuh3378izt7cRq4/view) contra [Agnus Dei [A].docx](https://drive.google.com/file/d/12IJ5IwRjEf4U7roicohYoWNCj76nE5Vd/view): **5 diferencia(s)** — letra + acordes ×1, renglones que están en uno solo ×2, acordes ×1, distinto tipo de renglón (acordes y letra mezclados / letra con acordes) ×1.
  <details><summary>Ver diferencias</summary>

  | Dónde | Agnus Dei [A].docx | Agnus Dei [G].docx | Qué cambia |
  |---|---|---|---|
  | Estrofa, r1 | //A[A]leluya, a[A4/D]leluya | //A[G]leluya, ale[G4/C]luya, Reinas [C]Tú, poderoso [G5]Dios// | letra + acordes |
  | Estrofa, r2 | Reinas Tú, poderoso [A5]Dios// | — | está solo en Agnus Dei [A].docx |
  | Coro, r2 | El [D/A]Señor [A]Dios pode[D]roso[E4] | El [C/G]Señor [G]Dios po[C/E]deroso[D4] | acordes |
  | Coro, r5 | acordes sobre letra: D/A A D(F#m) E4 | El [C/G]Señor [G]Dios pode[C/E]roso[D4] | distinto tipo de renglón (acordes y letra mezclados / letra con acordes) |
  | Coro, r6 | letra: El Señor Dios podero_so | — | está solo en Agnus Dei [A].docx |

  </details>
- [ ] [Alaba [A].docx](https://drive.google.com/file/d/1-cLGRWvO7-D9CLlFjs7xeBCOA0VwYU_R/view) contra [Alaba [G].docx](https://drive.google.com/file/d/1bC9tkxcqc-GczySQ0B-bOvsKH08H0NPM/view): **1 diferencia(s)** — renglones que están en uno solo ×1. Uso: Registro: 5 fila(s).
  <details><summary>Ver diferencias</summary>

  | Dónde | Alaba [G].docx | Alaba [A].docx | Qué cambia |
  |---|---|---|---|
  | título de parte | — | título «Estrofa» (tono A) | está solo en Alaba [A].docx |

  </details>
- [ ] [Alabaré al Señor (Anástasis) [C].docx](https://drive.google.com/file/d/16qFutZIvlY6DiiSJ2Ozr9TwNCjUJ0p_J/view) contra [Alabaré al Señor (Anástasis) [A].docx](https://drive.google.com/file/d/1I1Y1yxAg8EfwB2kj9ATQMApEIgV4z7Jw/view): **2 diferencia(s)** — acordes ×2.
  <details><summary>Ver diferencias</summary>

  | Dónde | Alabaré al Señor (Anástasis) [A].docx | Alabaré al Señor (Anástasis) [C].docx | Qué cambia |
  |---|---|---|---|
  | Final, r1 | [D]Señor, [E]Señor [F#m]mi Dios[B] | [F]Señor,[G] Se[Am]ñor mi Dios | acordes |
  | Final, r2 | [Bm]Señor, Se[E]ñor [A]mi Dios | [F]Señor,[G] Se[C]ñor mi Dios | acordes |

  </details>
- [ ] [Anclado en la roca (YAHWEH) [C].docx](https://drive.google.com/file/d/1oMiPRUWomV8e5ekbjmqFewUjmQsPtNEX/view) contra [Anclado en la roca (YAHWEH) [B].docx](https://drive.google.com/file/d/1lfvIYX64ypPEWvW-CJReDIZfRR00wumb/view): **1 diferencia(s)** — letra (solo signos/mayúsculas/acentos) ×1.
  <details><summary>Ver diferencias</summary>

  | Dónde | Anclado en la roca (YAHWEH) [B].docx | Anclado en la roca (YAHWEH) [C].docx | Qué cambia |
  |---|---|---|---|
  | PreCoro, r4 | [E]La roca mas [F#]alta | [F]La roca más [G]alta | letra (solo signos/mayúsculas/acentos) |

  </details>
- [ ] [Aquí estoy [D].docx](https://drive.google.com/file/d/1c1rkGv0qFcDZUNLA8M_GLTyUm5d_iTJh/view) contra [Aquí estoy [A].docx](https://drive.google.com/file/d/1bI_71YpdCbcvItqfviq3yc7q_X7Cz3g0/view): **20 diferencia(s)** — letra + acordes ×5, renglones que están en uno solo ×4, distinto tipo de renglón (título de parte / letra con acordes) ×1, distinto tipo de renglón (letra con acordes / título de parte) ×1, acordes ×8, acordes/nota ×1.
  <details><summary>Ver diferencias</summary>

  | Dónde | Aquí estoy [A].docx | Aquí estoy [D].docx | Qué cambia |
  |---|---|---|---|
  | Estrofa 1, r1 | [Amaj(add2)]Tú eres el principio, [Dmaj9]Tuya es la eternidad, | [D]Tú eres el principio, | letra + acordes |
  | Estrofa 1, r2 | [A/C#]Llamaste el mundo a e[A/F#]xistencia, me [Dmaj9]acerco a ti. | [G]tuya es la eternidad, | letra + acordes |
  | Estrofa 1, r3 | — | [D/F#]Llamaste el [Bm]mundo a existencia, | está solo en Aquí estoy [D].docx |
  | Estrofa 1, r4 | — | me a[G]cerco a ti. | está solo en Aquí estoy [D].docx |
  | Estrofa 2, r1 | [Amaj(add2)]Moriste por mis fracasos, lle[Dmaj9]vaste mi culpa en la cruz, | [D]Moriste por mis fracasos, | letra + acordes |
  | Estrofa 2, r2 | [A/C#]cargaste en tus [A/F#]hombros mi carga, me [Dmaj9]acerco a ti. | lle[G]vaste mi culpa en la cruz, | letra + acordes |
  | título de parte / Estrofa 2, r3 | título «PreCoro 1» (tono A) | [D/F#]cargaste en tus [Bm]hombros mi carga, | distinto tipo de renglón (título de parte / letra con acordes) |
  | PreCoro 1, r1 / Estrofa 2, r4 | ¿Qué puedo [Dmaj9]hacer, [D/B]qué puedo [A/F#]decir? | me a[G]cerco a ti. | letra + acordes |
  | PreCoro 1, r2 / título de parte | Te ofrezco mi [Dmaj9]cora[Esus4]zón [E]completa[A/F#]mente a ti. | título «PreCoro» (tono D) | distinto tipo de renglón (letra con acordes / título de parte) |
  | PreCoro, r1 | — | ¿Qué puedo [G]ha[Em]cer, qué puedo [Bm]decir? | está solo en Aquí estoy [D].docx |
  | PreCoro, r2 | — | Te ofrezco mi [G]cora[A]zón completa[Bm]mente a ti. | está solo en Aquí estoy [D].docx |
  | Estrofa 2, r1 | [Amaj(add2)]En tu salvación camino, tu [Dmaj9]espíritu vive en mí, | [D]En tu salvación ca[G]mino, tu espíritu vive en mí, | acordes |
  | Estrofa 2, r2 | [A/C#]declara en tus pro[A/F#]mesas, me acerco a [Dmaj9]ti. | [D/F#]declara en tus [Bm]promesas, [G]me acerco a ti. | acordes |
  | PreCoro 2, r1 | ¿Qué puedo [Dmaj9]hacer, [D/B]qué puedo [A/F#]decir?[A] | ¿Qué puedo [G]ha[Em]cer, qué puedo [Bm]decir?[D] | acordes |
  | PreCoro 2, r2 | Te ofrezco mi co[D/B]ra[Esus4]zón [E]completamente [(D)]a ti. (puente) | Te ofrezco mi [Em]corazón [A]completa[(G)]mente a ti. (puente) | acordes |
  | Instrumental x8, r1 | renglón de acordes: D A E A/F# -D | renglón de acordes: G D A Bm -G | acordes/nota |
  | Coro, r1 | [D]Aquí [A]estoy, con [E]manos [A/F#]alzadas vengo, | [G]Aquí [D]estoy, con [A]manos [Bm]alzadas vengo, | acordes |
  | Coro, r2 | [D]Pues [A]tú to[E]do lo [A/F#]diste por mí. | [G]Pues [D]tú todo [A]lo [Bm]diste por mí. | acordes |
  | Coro, r3 | [D]Aquí [A]estoy, mi [E]alma [A/F#]a ti entrego, | [G]Aquí [D]estoy, mi [A]alma [Bm]a ti entrego, | acordes |
  | Coro, r4 | [D]Tuyo [A]soy, Se[E]ñor.[A/F#] | [G]Tuyo [D]soy, Se[A]ñor.[Bm] | acordes |

  </details>
- [ ] [Because He lives [E].docx](https://drive.google.com/file/d/1Nx6-fxpEyD2I_rx5CoDlwGQ6edxdpVP1/view) contra [Because He lives [A].docx](https://drive.google.com/file/d/1-szPU5ZYVxR9DI_CT8WTTNUrvtx0FHKf/view): **1 diferencia(s)** — acordes ×1.
  <details><summary>Ver diferencias</summary>

  | Dónde | Because He lives [A].docx | Because He lives [E].docx | Qué cambia |
  |---|---|---|---|
  | Chorus 2 x3, r3 | Because [F#m]I know [A/C#]He holds the [D]future[Bm7] | Because [C#m]I know [E/G#]He holds the [A]futu[F#m]re | acordes |

  </details>
- [ ] [Digno (Elevation) [D].docx](https://drive.google.com/file/d/1bGa1_qQyCZIEEetmABwqeqeWkMd0p3__/view) contra [Digno (Elevation) [C].docx](https://drive.google.com/file/d/19dcAbfXgsga5DolIoMnbBcW-_73-Uy8B/view): **2 diferencia(s)** — marca puente/repite + acordes/nota ×1, acordes ×1.
  <details><summary>Ver diferencias</summary>

  | Dónde | Digno (Elevation) [C].docx | Digno (Elevation) [D].docx | Qué cambia |
  |---|---|---|---|
  | Intro, r1 | renglón de acordes: //Am C F G// | renglón de acordes: ( Bm D G A ) (puente) | marca puente/repite + acordes/nota |
  | Puente, r1 | Sé e[A]xaltado hoy en los cielos | Sé e[G]xaltado hoy en los cielos | acordes |

  </details>
- [ ] [Digno es el Señor [C].docx](https://drive.google.com/file/d/1-MM-WYCcYXxuk7L113ZN7O6b7A3vxmwj/view) contra [Digno es el Señor [A].docx](https://drive.google.com/file/d/17c1k0f5Yn6yYxSajDwX8jV-jz9LpLBDj/view): **5 diferencia(s)** — distinto tipo de renglón (letra con acordes / título de parte) ×1, letra + acordes ×1, renglones que están en uno solo ×3.
  <details><summary>Ver diferencias</summary>

  | Dónde | Digno es el Señor [A].docx | Digno es el Señor [C].docx | Qué cambia |
  |---|---|---|---|
  | Intro, r2 / título de parte | Gracias por la [D]cruz, oh [E]Dios[A/C#] | título «Estrofa» (tono C) | distinto tipo de renglón (letra con acordes / título de parte) |
  | Intro, r3 / Estrofa, r1 | El precio que pa[D][E]gaste por [A]mí | Gracias [F]por la cruz, [G]oh [C/E]Dios | letra + acordes |
  | Estrofa, r2 | — | El precio que pa[F]gaste [G]por [C]mí | está solo en Digno es el Señor [C].docx |
  | título de parte | — | título «Estrofa» (tono C) | está solo en Digno es el Señor [C].docx |
  | título de parte | — | título «Coro» (tono C) | está solo en Digno es el Señor [C].docx |

  </details>
- [ ] [El nombre de Jesús [C#].docx](https://drive.google.com/file/d/1YqI1Hq5qm_WCUlL3a4LMK3ciycgRmaNq/view) contra [El nombre de Jesús [C].docx](https://drive.google.com/file/d/1Mc2SJmqbUU3gf0u0UnzoEtRXGEkSHtAD/view): **1 diferencia(s)** — letra ×1.
  <details><summary>Ver diferencias</summary>

  | Dónde | El nombre de Jesús [C].docx | El nombre de Jesús [C#].docx | Qué cambia |
  |---|---|---|---|
  | Intro x2, r1 | letra: | C / G/B / | F / / / | | letra: | C# / Ab/C / | F# / / / | | letra |

  </details>
- [ ] [Gracia sobre gracia [Em].docx](https://drive.google.com/file/d/13KEocmEuKXjjyV_AMR8AxiXTHwYpJy56/view) contra [Gracia sobre gracia [Am].docx](https://drive.google.com/file/d/1atlnMELWHsm5i_WD5_EpmACpTSFaD9Jj/view): **3 diferencia(s)** — letra + acordes ×1, renglones que están en uno solo ×1, letra (solo signos/mayúsculas/acentos) ×1.
  <details><summary>Ver diferencias</summary>

  | Dónde | Gracia sobre gracia [Am].docx | Gracia sobre gracia [Em].docx | Qué cambia |
  |---|---|---|---|
  | PreCoro, r4 | Y hoy re[Dm]presentamos | Y hoy repre[Am]sentamos, [C]Tu nombre [Dsus4]aquí, señor | letra + acordes |
  | PreCoro, r5 | [F]Tu nombre a[Gsus4]quí, señor | — | está solo en Gracia sobre gracia [Am].docx |
  | Puente, r2 | Gracia so[C/E]bre gracia, Gra[F]cia so[G]bre gracia | Gracia sobre [G/B]gracia, [C]Gracia so[D]bre gracia///// | letra (solo signos/mayúsculas/acentos) |

  </details>
- [ ] [Hermoso-No volveré atrás [A].docx](https://drive.google.com/file/d/1B7yEtHBb27jTAar33QOQHAD1SpxHW14S/view) contra [Hermoso - No volveré atrás [A].docx](https://drive.google.com/file/d/1o8q_-QUwiYOrUK5GIq32_5eP7e2hGDKD/view): **1 diferencia(s)** — acordes/nota ×1.
  <details><summary>Ver diferencias</summary>

  | Dónde | Hermoso - No volveré atrás [A].docx | Hermoso-No volveré atrás [A].docx | Qué cambia |
  |---|---|---|---|
  | Intro, r1 | renglón de acordes: A A/F# D Bm D | renglón de acordes: A A/C# D Bm D | acordes/nota |

  </details>
- [ ] [La sangre de Jesus [C].docx](https://drive.google.com/file/d/11pGLIe-qc9GEhe7DF8jMAKf8sfQGmZQp/view) contra [La sangre de Jesus [E].docx](https://drive.google.com/file/d/19hkbzkU3_lymCF5qEAhfnf2DM1HbQ6Zu/view): **2 diferencia(s)** — letra (solo signos/mayúsculas/acentos) ×2.
  <details><summary>Ver diferencias</summary>

  | Dónde | La sangre de Jesus [E].docx | La sangre de Jesus [C].docx | Qué cambia |
  |---|---|---|---|
  | Puente, r5 | Hoy lo [A]entiendo fue solo por la cruz | Hoy lo [F]entiendo fue solo por la cruz// | letra (solo signos/mayúsculas/acentos) |
  | Puente, r9 | Debe [A]verlo, que solo por la cruz | Debe [F]verlo, que solo por la cruz// | letra (solo signos/mayúsculas/acentos) |

  </details>
- [ ] [Lo harás otra vez [C].docx](https://drive.google.com/file/d/1unglHiKTc3lqiwjV92I_jaLTtJpxKJcM/view) contra [Lo haras otra vez [Bb].docx](https://drive.google.com/file/d/1KEuzTzaxK9aZMZNstpWVNOeocWdth3OM/view): **3 diferencia(s)** — letra ×3.
  <details><summary>Ver diferencias</summary>

  | Dónde | Lo haras otra vez [Bb].docx | Lo harás otra vez [C].docx | Qué cambia |
  |---|---|---|---|
  | Puente, r2 | letra: F/A Bb F/A Bb Yo creo en Ti, sé que lo harás otra vez | letra: G/B C G/B C Yo creo en Ti, sé que lo harás otra vez | letra |
  | Puente, r4 | letra: F/A Bb F/A Bb Yo creo en Ti, sé que lo harás otra vez | letra: G/B C G/B C Yo creo en Ti, sé que lo harás otra vez | letra |
  | Puente, r6 | letra: F/A Bb F/A Bb Sé que lo harás otra vez | letra: G/B C G/B C Sé que lo harás otra vez | letra |

  </details>
- [ ] [Lo haras otra vez [D].docx](https://drive.google.com/file/d/1OOb_cLFjRSqQeru0Xp4TOfD-1xbhbyUB/view) contra [Lo haras otra vez [Bb].docx](https://drive.google.com/file/d/1KEuzTzaxK9aZMZNstpWVNOeocWdth3OM/view): **3 diferencia(s)** — distinto tipo de renglón (solo letra / letra con acordes) ×3.
  <details><summary>Ver diferencias</summary>

  | Dónde | Lo haras otra vez [Bb].docx | Lo haras otra vez [D].docx | Qué cambia |
  |---|---|---|---|
  | Puente, r2 | letra: F/A Bb F/A Bb Yo creo en Ti, sé que lo harás otra vez | [A/C#][D]Yo creo en [A/C#]Ti, [D]sé que lo harás otra vez | distinto tipo de renglón (solo letra / letra con acordes) |
  | Puente, r4 | letra: F/A Bb F/A Bb Yo creo en Ti, sé que lo harás otra vez | [A/C#][D]Yo creo en [A/C#]Ti, [D]sé que lo harás otra vez | distinto tipo de renglón (solo letra / letra con acordes) |
  | Puente, r6 | letra: F/A Bb F/A Bb Sé que lo harás otra vez | [A/C#][D]Sé que lo harás otra vez[A/C#][D] | distinto tipo de renglón (solo letra / letra con acordes) |

  </details>
- [ ] [No hay lugar más alto [C].docx](https://drive.google.com/file/d/1hdO2iE818qTRyW4Ua4hHx1ORw7SxFSBh/view) contra [No hay lugar más alto [A].docx](https://drive.google.com/file/d/1gfIKF373ak28eEPBMFcRpdfheodYY9BG/view): **1 diferencia(s)** — acordes/nota ×1.
  <details><summary>Ver diferencias</summary>

  | Dónde | No hay lugar más alto [A].docx | No hay lugar más alto [C].docx | Qué cambia |
  |---|---|---|---|
  | Intro, r1 | renglón de acordes: A F#m E F#m | renglón de acordes: C Am G A | acordes/nota |

  </details>
- [ ] [Roca firme [Bb].docx](https://drive.google.com/file/d/11uJ8s-nLNGhAaPGqNTRH9lRx_Mg58upI/view) contra [Roca firme [A].docx](https://drive.google.com/file/d/1qLADkCBkBWQoON7jpQMTU2xN0V-EC5RL/view): **1 diferencia(s)** — acordes ×1.
  <details><summary>Ver diferencias</summary>

  | Dónde | Roca firme [A].docx | Roca firme [Bb].docx | Qué cambia |
  |---|---|---|---|
  | Coro 2 x2, r2 | Él no [A/F#][E]fallará//[A][A/C#][D2] | Él no [Bb/G][F]fallará//[Bb][BbM7/D][Eb2] | acordes |

  </details>
- [ ] [Santo [D].docx](https://drive.google.com/file/d/16qMCU2vsNnGWbWNkUhaug5SB5QzhEDvE/view) contra [Santo [C].docx](https://drive.google.com/file/d/1pvv3dCyjPchkT8QSrKSFR0arugvictgX/view): **2 diferencia(s)** — letra (solo signos/mayúsculas/acentos) ×1, letra ×1.
  <details><summary>Ver diferencias</summary>

  | Dónde | Santo [C].docx | Santo [D].docx | Qué cambia |
  |---|---|---|---|
  | Coro 2, r1 | Cantando [F/C][C][C4]Santo, [C]Santo, | Cantando [G/D][D][D4]Santo, [D]Santo | letra (solo signos/mayúsculas/acentos) |
  | Estribillo Final, r1 | letra: C Bb F/A //Quien es el Rey (Es Jesús)// | letra: D C G/B //Quien es el Rey (Es Jesús)// | letra |

  </details>
- [ ] [Solo hay uno [Bb].docx](https://drive.google.com/file/d/1llCjwIJnN3MOEmSah894jD9RuwxP1TaE/view) contra [Solo hay uno [B].docx](https://drive.google.com/file/d/1kBiOLbkSh2DxfQEh-4N9G6TDDuwhydcR/view): **1 diferencia(s)** — letra (solo signos/mayúsculas/acentos) ×1.
  <details><summary>Ver diferencias</summary>

  | Dónde | Solo hay uno [B].docx | Solo hay uno [Bb].docx | Qué cambia |
  |---|---|---|---|
  | Coro x2, r1 | letra: (Primer vez sin la 5ta (F#)) | letra: (Primer vez sin la 5ta (F)) | letra (solo signos/mayúsculas/acentos) |

  </details>
- [ ] [Solo hay uno [C].docx](https://drive.google.com/file/d/1GvU1M9xPJqAhKLj9CKUyn93dc1L-EfPw/view) contra [Solo hay uno [B].docx](https://drive.google.com/file/d/1kBiOLbkSh2DxfQEh-4N9G6TDDuwhydcR/view): **3 diferencia(s)** — acordes/nota ×2, letra ×1.
  <details><summary>Ver diferencias</summary>

  | Dónde | Solo hay uno [B].docx | Solo hay uno [C].docx | Qué cambia |
  |---|---|---|---|
  | Intro, r1 | renglón de acordes: G#m F# Emaj7 E | renglón de acordes: Am Em/G Fmaj7 F | acordes/nota |
  | Instrumental, r1 | renglón de acordes: E B/Eb G#m F# C | renglón de acordes: F C/E Am G | acordes/nota |
  | Coro x2, r1 | letra: (Primer vez sin la 5ta (F#)) | letra: (Primer vez sin la 5ta) | letra |

  </details>
- [ ] [Solo hay uno [G].docx](https://drive.google.com/file/d/1by5qpSAU56qT3ENEeY5Pl4tYTj_VAAKA/view) contra [Solo hay uno [B].docx](https://drive.google.com/file/d/1kBiOLbkSh2DxfQEh-4N9G6TDDuwhydcR/view): **1 diferencia(s)** — letra ×1.
  <details><summary>Ver diferencias</summary>

  | Dónde | Solo hay uno [B].docx | Solo hay uno [G].docx | Qué cambia |
  |---|---|---|---|
  | Coro x2, r1 | letra: (Primer vez sin la 5ta (F#)) | letra: (Primer vez sin la 5ta (D)) | letra |

  </details>
- [ ] [Te doy gloria [D].docx](https://drive.google.com/file/d/1rtodCvQa30bfq6pAoJfSh-mpwCGdj2-k/view) contra [Te doy gloria [A].docx](https://drive.google.com/file/d/1yCoCzgRWohjXTCJ2dDScIPqMk77Yefzy/view): **2 diferencia(s)** — renglones que están en uno solo ×2.
  <details><summary>Ver diferencias</summary>

  | Dónde | Te doy gloria [A].docx | Te doy gloria [D].docx | Qué cambia |
  |---|---|---|---|
  | título de parte | — | título «Estrofa» (tono D) | está solo en Te doy gloria [D].docx |
  | título de parte | — | título «Coro» (tono D) | está solo en Te doy gloria [D].docx |

  </details>
- [ ] [Toma tu lugar [C].docx](https://drive.google.com/file/d/1Qgw6YcDQahAJPOmIuKanyPYpO7BC1eU2/view) contra [Toma tu lugar [Bb].docx](https://drive.google.com/file/d/1J1ETC-WUArE43y09SJ8KYlisvgDxiVaT/view): **3 diferencia(s)** — acordes/nota ×1, acordes ×2.
  <details><summary>Ver diferencias</summary>

  | Dónde | Toma tu lugar [Bb].docx | Toma tu lugar [C].docx | Qué cambia |
  |---|---|---|---|
  | Interludio, r1 | renglón de acordes: Bb Cm Bb/D Eb | renglón de acordes: C Dm C/E F F/A | acordes/nota |
  | Puente, r4 | [Bb/D]Yo soy tu templo, [Eb]yo soy tu templo | [C/E]Yo soy tu templo, [F]yo soy tu [F/A]templo | acordes |
  | Puente, r6 | [Bb/D]Yo soy tu [Eb]templo, yo soy tu templo | [C/E]Yo soy tu templo, [F]yo soy tu [F/A]templo | acordes |

  </details>
- [ ] [Tu mirada + Temprano [F#].docx](https://drive.google.com/file/d/1Fzl38aSObV64tjN_cMIJbr3UKGmQPEWn/view) contra [Tu mirada + Temprano [F].docx](https://drive.google.com/file/d/183eZxcyWddfnYH92gtk0eGXsPJATHg5F/view): **1 diferencia(s)** — acordes ×1.
  <details><summary>Ver diferencias</summary>

  | Dónde | Tu mirada + Temprano [F].docx | Tu mirada + Temprano [F#].docx | Qué cambia |
  |---|---|---|---|
  | Coro 2, r5 | [F/D]Oh! tu [Bb/G]diestra [F/A]me ha soste[Bb]ni[C4]do[(Intro)] | [F#/D#]Oh! tu [B/G#]diestra [F#/A#]me ha soste[B]nido[C#4] | acordes |

  </details>
- [ ] [Una vez [G].docx](https://drive.google.com/file/d/1EY1Xex5XpizWyBC6mJ-kdmsrqqPI8cLk/view) contra [Una vez [C].docx](https://drive.google.com/file/d/1vSYxglyWW-HH0NDAhXP1D0BaFclyS5-C/view): **1 diferencia(s)** — acordes ×1.
  <details><summary>Ver diferencias</summary>

  | Dónde | Una vez [C].docx | Una vez [G].docx | Qué cambia |
  |---|---|---|---|
  | Estrofa, r1 | Estoy [Fadd9]aprendiendo a estar | Estoy [Cadd9]aprendiendo a [D]estar | acordes |

  </details>
- [ ] [Ven ante Su trono [A].docx](https://drive.google.com/file/d/1x-MoUw9wWTAwnaB2ECPStiA1RLvajL7x/view) contra [Ven ante Su trono [Eb].docx](https://drive.google.com/file/d/17nJXK4AWIISGzLaFuI0V9Y7hZ2h2Gy-4/view): **23 diferencia(s)** — distinto tipo de renglón (renglón de acordes / título de parte) ×3, distinto tipo de renglón (letra con acordes / título de parte) ×6, renglones que están en uno solo ×9, letra (solo signos/mayúsculas/acentos) ×1, letra ×1, distinto tipo de renglón (renglón de acordes / letra con acordes) ×2, letra + acordes ×1.
  <details><summary>Ver diferencias</summary>

  | Dónde | Ven ante Su trono [Eb].docx | Ven ante Su trono [A].docx | Qué cambia |
  |---|---|---|---|
  | (antes del primer título), r1 / título de parte | renglón de acordes: D# G# D# G# | título «Intro» (tono A) | distinto tipo de renglón (renglón de acordes / título de parte) |
  | (antes del primer título), r2 / título de parte | [D#]Si abati[G#]do y dolido [D#]estás, y cansa[G#]do del peso [Cm]cargar | título «Estrofa 1» (tono A) | distinto tipo de renglón (letra con acordes / título de parte) |
  | Estrofa 1, r1 | — | [A][D]1][A][D] | está solo en Ven ante Su trono [A].docx |
  | Estrofa 1, r2 | — | [A]Si aba[D]tido y dolido [A]estás, y cansa[D]do del peso [F#m]cargar | está solo en Ven ante Su trono [A].docx |
  | (antes del primer título), r4 / Estrofa 1, r4 | [D#]si al fi[G#]nal del camino [D#]estás, sin sa[G#]ber hacia dónde [Cm]mirar | [A]Si al fi[D]nal del camino [A]estás, sin sa[D]ber hacia dónde [F#m]mirar | letra (solo signos/mayúsculas/acentos) |
  | título de parte | — | título «Coro» (tono A) | está solo en Ven ante Su trono [A].docx |
  | título de parte | — | título «Intro» (tono A) | está solo en Ven ante Su trono [A].docx |
  | (antes del primer título), r9 / título de parte | [D#]Deja a[G#]trás tu vergüenza y [D#]pesar, ven [G#]a Él ya no espe[Cm]res más | título «Estrofa 2» (tono A) | distinto tipo de renglón (letra con acordes / título de parte) |
  | Estrofa 2, r1 | — | [A]Deja a[D]trás tu vergüenza [A]y pe[D]sar, ven a Él ya [F#m]no esperes más | está solo en Ven ante Su trono [A].docx |
  | título de parte | — | título «Coro x2» (tono A) | está solo en Ven ante Su trono [A].docx |
  | (antes del primer título), r14 / Coro x2, r2 | [D#]con [Fm]sangre pre[Cm]ciosa, Jesús bo[G#]rró nuestra [D#]maldad (X2) | [A]con sangre [Bm]precio[F#m]sa, Jesús borró [D]nuestra [A]maldad | letra |
  | (antes del primer título), r15 / título de parte | renglón de acordes: D# Cm G# | título «Inter» (tono A) | distinto tipo de renglón (renglón de acordes / título de parte) |
  | (antes del primer título), r16 / título de parte | Oh cuán [D#]hermoso, Es nuestro [Cm]Salvador | título «Puente» (tono A) | distinto tipo de renglón (letra con acordes / título de parte) |
  | Puente, r1 | — | [A]e][F#m][D] | está solo en Ven ante Su trono [A].docx |
  | Puente, r2 | — | Oh cuán [A]hermoso, Es [F#m]nuestro Salvador | está solo en Ven ante Su trono [A].docx |
  | (antes del primer título), r20 / título de parte | [D#]Ven [Fm]ante su [Cm]trono, El Padre [G#]te [D#]recibirá | título «Coro x2» (tono A) | distinto tipo de renglón (letra con acordes / título de parte) |
  | (antes del primer título), r21 / título de parte | [D#]con [Fm]sangre pre[Cm]ciosa, Jesús bo[G#]rró [D#]nuestra maldad (X2) | título «Inter 2» (tono A) | distinto tipo de renglón (letra con acordes / título de parte) |
  | (antes del primer título), r22 / título de parte | renglón de acordes: D# Fm Cm G# | título «Final» (tono A) | distinto tipo de renglón (renglón de acordes / título de parte) |
  | (antes del primer título), r23 / Final, r1 | renglón de acordes: D# Fm Cm G# | l][A][Bm][F#m][D][|][A][Bm][F#m][D][|][A] | distinto tipo de renglón (renglón de acordes / letra con acordes) |
  | (antes del primer título), r24 / Final, r2 | renglón de acordes: D# | [A]Hasta un [D]día llegar frente [A]a él | distinto tipo de renglón (renglón de acordes / letra con acordes) |
  | (antes del primer título), r25 / Final, r3 | [D#]Hasta [G#]un día llegar [D#]frente a él | de [G]Su a[G]mor a [D]todos contaré | letra + acordes |
  | (antes del primer título), r26 / título de parte | de [C#]Su a[G#]mor a to[D#]dos contaré | título «Intro» (tono A) | distinto tipo de renglón (letra con acordes / título de parte) |
  | (antes del primer título), r27 | renglón de acordes: D# G# D# G# | — | está solo en Ven ante Su trono [Eb].docx |

  </details>
- [ ] [Ya no soy esclavo [C].docx](https://drive.google.com/file/d/1HWheZP-Mjvqg7PCy64ZK6vlKbi77NVwS/view) contra [Ya no soy esclavo [Bb].docx](https://drive.google.com/file/d/1-z3zm6Y_-5VTvYDrbQOJlYEMUq8eziRO/view): **1 diferencia(s)** — acordes/nota ×1.
  <details><summary>Ver diferencias</summary>

  | Dónde | Ya no soy esclavo [Bb].docx | Ya no soy esclavo [C].docx | Qué cambia |
  |---|---|---|---|
  | Inter, r1 | renglón de acordes: (Gm7 F A# D# | renglón de acordes: Am7 G C F | acordes/nota |

  </details>
- [ ] [Yo sé quien soy yo [D].docx](https://drive.google.com/file/d/16QQQxBYIvg6zRXUZUhdT3FEdDsS7U3uH/view) contra [Yo sé quien soy yo [A].docx](https://drive.google.com/file/d/1MkrSGwcw4UegCR2qEWJnIONEq9leJiR0/view): **1 diferencia(s)** — renglones que están en uno solo ×1.
  <details><summary>Ver diferencias</summary>

  | Dónde | Yo sé quien soy yo [A].docx | Yo sé quien soy yo [D].docx | Qué cambia |
  |---|---|---|---|
  | título de parte | — | título «PreCoro» (tono D) | está solo en Yo sé quien soy yo [D].docx |

  </details>

---

## 3. Grupos que eran dudosos: ya decididos

- **Agrupados con el Word original** (nombres de parte distintos): Alaba, Deseo Eterno, El nombre de Jesús, Este es el reino, Hermoso nombre, Santo por siempre (se conserva [C]), Te doy gloria, Tumbas a Jardines, Yo sé quién soy yo.
- **Pasaron a agrupados** (tu SÍ), ya en `js/grupos.js`:
  - Aquí estoy [A]/[D] (con [F], que ya estaba): se conserva [A];
  - Con tu sangre [D-Eb]/[D]: se conserva [D-Eb];
  - El Dios que adoramos [F]/[F#]/[G]: se conserva [F#];
  - Él nos ama [A]/[C];
  - El victorioso [Am]/[Dm];
  - No voy a caer [A]/[C]: se conserva [A];
  - Por siempre [Ab]/[G]: se conserva [Ab].
- **Separadas:** Levanto un aleluya [D] y [D] (New).

---

## Resumen

| Grupo | Cantidad |
|---|---|
| 1.1 Archivos con el nombre en un tono y el Word en otro | 3 Word |
| 1.2 Tono con secuencia en el nombre | 14, bien (Te alabaré corregido en el motor) |
| 1.3 Sin títulos de parte o con uno solo | 4 Word |
| 1.4 Renglones de acordes leídos como letra | 14 renglones en 4 Word (2 los dejás así) |
| 1.5 Otros renglones raros | 1 |
| 1.6 Renglones sueltos con "]" | ninguno |
| 2a. Word que se pueden borrar | 46 (ninguno usado en reuniones ni en el Registro) |
| 2b. Word repetidos que NO se borran (tienen diferencias) | 34 Word, 139 diferencias para revisar |
| 3. Grupos dudosos | ninguno: 6 grupos nuevos + Aquí estoy [D] sumado a su grupo |

**Orden recomendado:** 1.1, 1.3 y 1.4 → reimportar → 2b (decidís qué diferencias son adrede; las que sean error se corrigen en el Word y el par pasa a 2a) → 2a (borrar, al final; avisame antes para sacar esos ids de `js/grupos.js`).
