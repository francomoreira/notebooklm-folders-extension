# Changelog — NotebookLM Folders

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
