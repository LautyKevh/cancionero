# Pendientes

## Para una fase posterior

### Medley
Detalle en `referencia/SPEC.md` (§7 "Medley" y §5 "Reuniones").
- Ítem de reunión que combina 2+ canciones, con tono único (cada canción se transporta desde su tono original) y modulación opcional desde una parte en adelante.
- Crear desde Editar reunión → "Crear medley" → elegir canciones → tono destino → editor de partes con las partes de todas (reordenar, xN, duplicar, quitar).
- Vista Músico/Cantante continua, con separador con el nombre de cada canción.
- Registro: una fila por canción, con su tono tocado y quién dirigió.
- Requiere la clave del director.
- **Ya hecho (Fase 2):** el motor guarda y valida ítems medley, el registro automático y el historial de la app los expanden canción por canción. Falta la interfaz.

## Fase 2 (motor)
- Ingreso de administrador: falta crear el ID de cliente de OAuth en Google Cloud y cargarlo (`js/config.js` → `googleClientId` y `configurarClientId()` en el motor).
- Anclar notas sueltas a una palabra (`at`), como en la referencia de "Quién más".
- Conservar los saltos de línea dentro de un párrafo del Word (`<w:br/>`), como en "Jesucristo basta".
- Pasar a estable con los datos reales de IBSI (`registrarIBSI()`), con aprobación.
