# Changelog — NotebookLM Folders

## v1.5 — 2026-05-02

### Bugs corregidos

**[CRÍTICO] La extensión apuntaba al contenedor equivocado**
- **Síntoma:** se pintaba la UI de carpetas pero los documentos seguían visibles abajo, sin entrar a las carpetas. El folder "Sin asignar" salía vacío y el drag no levantaba ningún `DRAGSTART` en la consola.
- **Causa:** el selector `[role="list"]` matcheaba un contenedor genérico (no la lista real de fuentes). La lista verdadera está hecha de elementos `.single-source-container`, cada uno con un `<button aria-label="nombre-archivo">`.
- **Fix:** nuevo selector `SOURCE_ITEM_SELECTOR = '.single-source-container'`. `findSourcesList()` ahora busca el padre real de esos elementos. `getSourceId()` usa el `aria-label` del botón interno como ID estable (antes usaba `textContent`, que era frágil).

**[CRÍTICO] La UI desaparecía al cambiar de pestaña en vista angosta**
- **Síntoma:** en ventana angosta con tabs Fuentes/Chat/Studio, al volver a Fuentes las carpetas no estaban.
- **Causa:** Angular remonta el panel de Fuentes y el script solo corría una vez al cargar la página.
- **Fix:** `MutationObserver` en `document.body` con debounce de 250 ms. Detecta cuando el contenedor de fuentes aparece, cambia o reaparece sin la UI de carpetas, y re-inyecta. También vuelve a esconder la lista original si Angular la re-mostró.

### Mejoras

- Inyección **idempotente**: `dataset.boundTo` rastrea a qué contenedor está atada la UI; si ya está atada al correcto, no se reinyecta (solo asegura que la lista original siga oculta).
- **Limpieza de IDs huérfanos**: al inyectar, elimina de `folderStructure` cualquier ID que ya no exista en NotebookLM (fuentes borradas).
- **Clones sin `draggable`**: al clonar las fuentes para meterlas en folders, se les quita el atributo `draggable` original de NotebookLM para evitar conflictos.

---

## v1.4 — 2026-05-02

### Bugs corregidos

**[CRÍTICO] Drag & drop no movía documentos a carpetas**
- **Síntoma:** el highlight visual al arrastrar funcionaba, pero al soltar el documento no se movía.
- **Causa:** `dragstart` usaba `e.target.classList.contains('nbm-source-item')` para detectar el elemento arrastrado. Cuando el usuario agarra el documento desde cualquier texto o ícono interno, `e.target` es ese hijo — no el wrapper `.nbm-source-item`. La condición fallaba, `setData` nunca se ejecutaba, y el `drop` recibía un string vacío.
- **Fix:** reemplazado por `e.target.closest('.nbm-source-item')` en `dragstart` y `dragend`, lo que sube por el árbol DOM hasta encontrar el wrapper correcto sin importar desde qué hijo se inicia el drag. (`content.js` líneas 202–219)

**[MENOR] Listeners de drag duplicados en cada refresh**
- **Causa:** `setupDragAndDrop()` se registraba en `document` en cada llamada a `refreshUI()`, acumulando listeners.
- **Fix:** guard `dragDropInitialized` — los listeners se registran una sola vez. (`content.js` línea 199)

---

## v1.3-DEBUG — historial previo (sin registro)
## v1.2-FINAL — historial previo (sin registro)
## v1.1 — historial previo (sin registro)
